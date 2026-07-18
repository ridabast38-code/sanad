<?php

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Notifications\BookingCancelledForClient;
use App\Notifications\BookingConfirmedForClient;
use App\Notifications\MeetingLinkReady;
use App\Notifications\NewBookingRequested;
use App\Notifications\SessionCancelledForPractitioner;
use App\Notifications\SessionConfirmedForPractitioner;
use App\Notifications\SessionRescheduledForClient;
use App\Notifications\SessionRescheduledForPractitioner;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;

function makeBookablePractitioner(): User
{
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Anxiety & stress support',
        'bio' => 'Here to listen.',
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    Availability::factory()->for($practitioner, 'practitioner')->create([
        'day_of_week' => 1,
        'start_time' => '17:00',
        'end_time' => '20:00',
    ]);

    return $practitioner;
}

function makePendingBooking(User $client, User $practitioner): Booking
{
    return Booking::create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $practitioner->services->first()->id,
        'scheduled_at' => now()->addWeek()->setTime(17, 0),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);
}

test('the specialist profile page shows services and bookable slots', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('client/specialist-profile')
            ->where('specialist.name', $practitioner->name)
            ->has('services', 1)
            ->where('services.0.price', 40)
            ->has('slots')
        );
});

test('unapproved practitioners have no public profile', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Pending review',
        'approval_status' => 'pending',
    ]);

    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->assertNotFound();
});

test('a client can book an offered slot and it becomes their upcoming session', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->viewData('page');

    $slotIso = $page['props']['slots'][0]['iso'];
    $serviceId = $page['props']['services'][0]['id'];

    $response = $this->actingAs($client)
        ->post(route('bookings.store'), [
            'practitioner_id' => $practitioner->id,
            'service_id' => $serviceId,
            'scheduled_at' => $slotIso,
            'client_note' => 'A bit nervous, first time.',
        ]);

    $booking = Booking::sole();

    // the client is sent to the payment instructions for the new booking
    $response->assertRedirect(route('bookings.pay', $booking));

    expect($booking->client_id)->toBe($client->id)
        ->and($booking->practitioner_id)->toBe($practitioner->id)
        ->and($booking->status)->toBe('pending')
        ->and((float) $booking->price)->toBe(40.0)
        ->and((float) $booking->platform_amount)->toBe(8.0)
        ->and((float) $booking->practitioner_amount)->toBe(32.0);

    // it now appears as the upcoming session on the dashboard
    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('upcomingSession.practitioner_name', $practitioner->name)
            ->where('stats.upcoming', 1)
        );
});

test('booking a session emails the admin', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($client)
        ->get(route('specialists.show', $practitioner))
        ->viewData('page');

    $this->actingAs($client)->post(route('bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $page['props']['services'][0]['id'],
        'scheduled_at' => $page['props']['slots'][0]['iso'],
    ]);

    Notification::assertSentTo($admin, NewBookingRequested::class);
});

test('accepting a booking confirms it and emails the client and practitioner', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'paid'])
        ->assertRedirect();

    expect($booking->fresh()->status)->toBe('confirmed')
        ->and($booking->fresh()->payment_status)->toBe('paid');

    Notification::assertSentTo($client, BookingConfirmedForClient::class);
    Notification::assertSentTo($practitioner, SessionConfirmedForPractitioner::class);
});

test('a slot that is already booked cannot be booked again and is no longer offered', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $other = User::factory()->create();

    $page = $this->actingAs($client)->get(route('specialists.show', $practitioner))->viewData('page');
    $slotIso = $page['props']['slots'][0]['iso'];
    $serviceId = $page['props']['services'][0]['id'];

    // First client takes the slot.
    $this->actingAs($client)->post(route('bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $serviceId,
        'scheduled_at' => $slotIso,
    ]);

    // A second client trying the same slot is rejected.
    $this->actingAs($other)->post(route('bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $serviceId,
        'scheduled_at' => $slotIso,
    ])->assertSessionHasErrors('scheduled_at');

    expect(Booking::whereIn('status', ['pending', 'confirmed'])->count())->toBe(1);

    // And the taken slot is no longer offered on the profile.
    $slots = $this->actingAs($other)->get(route('specialists.show', $practitioner))->viewData('page')['props']['slots'];
    expect(collect($slots)->pluck('iso'))->not->toContain($slotIso);
});

test('the database itself refuses two active bookings on the same practitioner slot', function () {
    $practitioner = makeBookablePractitioner();
    $clientA = User::factory()->create();
    $clientB = User::factory()->create();
    $serviceId = $practitioner->services->first()->id;
    $slot = now()->addWeek()->setTime(17, 0);

    $make = fn (User $client) => Booking::create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $serviceId,
        'scheduled_at' => $slot,
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
    ]);

    $make($clientA);

    // Even if the in-app check is bypassed, the unique (practitioner_id, slot_hold)
    // index is the last line of defence against a race — the second insert fails.
    expect(fn () => $make($clientB))->toThrow(QueryException::class);

    expect(Booking::whereIn('status', ['pending', 'confirmed'])->count())->toBe(1);
});

test('cancelling a booking frees its slot so the time can be taken again', function () {
    $practitioner = makeBookablePractitioner();
    $clientA = User::factory()->create();
    $clientB = User::factory()->create();
    $serviceId = $practitioner->services->first()->id;
    $slot = now()->addWeek()->setTime(17, 0);

    $make = fn (User $client) => Booking::create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $serviceId,
        'scheduled_at' => $slot,
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
    ]);

    $first = $make($clientA);
    $first->update(['status' => 'cancelled']); // slot_hold clears to null

    // With the slot freed, a new booking on the same time is allowed.
    $second = $make($clientB);

    expect($first->fresh()->slot_hold)->toBeNull()
        ->and($second->slot_hold)->not->toBeNull()
        ->and(Booking::whereIn('status', ['pending', 'confirmed'])->count())->toBe(1);
});

test('cancelling a paid booking refunds it and notifies the client and practitioner', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle(); // paid + confirmed, with a transaction

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'cancelled'])
        ->assertRedirect();

    expect($booking->fresh()->status)->toBe('cancelled')
        ->and($booking->fresh()->payment_status)->toBe('refunded')
        ->and($booking->transaction->fresh()->status)->toBe('refunded');

    Notification::assertSentTo($client, BookingCancelledForClient::class);
    Notification::assertSentTo($practitioner, SessionCancelledForPractitioner::class);
});

test('a partial refund recomputes the platform and practitioner split on the kept amount', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner); // price 40
    $booking->settle();

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'cancelled', 'refund_amount' => 20])
        ->assertRedirect();

    $transaction = $booking->transaction->fresh();

    // Kept $20 → platform $4, practitioner $16; still payable (partial).
    expect((float) $transaction->refunded_amount)->toBe(20.0)
        ->and((float) $transaction->platform_fee)->toBe(4.0)
        ->and((float) $transaction->practitioner_payout)->toBe(16.0)
        ->and($transaction->status)->toBe('completed')
        ->and($booking->fresh()->payment_status)->toBe('partially_refunded');

    Notification::assertSentTo($client, BookingCancelledForClient::class);
});

test('a full refund zeroes the practitioner payout', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle();

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'cancelled'])
        ->assertRedirect();

    $transaction = $booking->transaction->fresh();

    expect((float) $transaction->refunded_amount)->toBe(40.0)
        ->and((float) $transaction->practitioner_payout)->toBe(0.0)
        ->and($transaction->status)->toBe('refunded');
});

test('a no-show keeps the full payment unless a refund is given', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle();

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'no_show'])
        ->assertRedirect();

    $transaction = $booking->transaction->fresh();

    expect($booking->fresh()->status)->toBe('no_show')
        ->and($transaction->status)->toBe('completed')
        ->and((float) $transaction->refunded_amount)->toBe(0.0)
        ->and((float) $transaction->practitioner_payout)->toBe(32.0);
});

test('a slot the practitioner does not offer is rejected', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $service = $practitioner->services->first();

    $this->actingAs($client)
        ->post(route('bookings.store'), [
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'scheduled_at' => now()->addDay()->setTime(9, 0)->toIso8601String(),
        ])
        ->assertSessionHasErrors('scheduled_at');

    expect(Booking::count())->toBe(0);
});

test('the payment page shows the methods to the client who owns the booking', function () {
    config(['payments.methods' => [
        ['key' => 'whish', 'label' => 'Whish Money', 'number' => '+961 70 000 000', 'account_name' => 'Sanad', 'instructions' => 'Send via Whish.'],
        ['key' => 'omt', 'label' => 'OMT', 'number' => null, 'account_name' => null, 'instructions' => 'Send via OMT.'],
    ]]);

    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);

    $this->actingAs($client)
        ->get(route('bookings.pay', $booking))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('client/booking-payment')
            ->where('booking.price', 40)
            ->where('booking.reference', 'SANAD-'.str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT))
            ->has('methods', 1) // the OMT method with no number is hidden
            ->where('methods.0.label', 'Whish Money')
        );
});

test('a client cannot view another client\'s payment page', function () {
    $practitioner = makeBookablePractitioner();
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $booking = makePendingBooking($owner, $practitioner);

    $this->actingAs($other)
        ->get(route('bookings.pay', $booking))
        ->assertForbidden();
});

test('the payment page redirects to the dashboard once the booking is paid', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle();

    $this->actingAs($client)
        ->get(route('bookings.pay', $booking))
        ->assertRedirect(route('dashboard'));
});

test('the dashboard surfaces every upcoming session, soonest first', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $serviceId = $practitioner->services->first()->id;

    $base = fn (array $extra) => Booking::create(array_merge([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $serviceId,
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
    ], $extra));

    $soon = $base(['scheduled_at' => now()->addDays(2)->setTime(17, 0), 'status' => 'confirmed', 'payment_status' => 'paid']);
    $later = $base(['scheduled_at' => now()->addDays(5)->setTime(17, 0), 'status' => 'pending', 'payment_status' => 'unpaid']);

    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('upcomingSessions', 2)
            ->where('upcomingSession.id', $soon->id)
            ->where('upcomingSessions.0.id', $soon->id)
            ->where('upcomingSessions.1.id', $later->id)
            ->where('stats.upcoming', 2)
        );
});

test('a practitioner can add a meeting link to their confirmed session and the client is notified', function () {
    Notification::fake();

    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle(); // now confirmed + paid

    $this->actingAs($practitioner)
        ->patch(route('bookings.meeting-link', $booking), ['meeting_link' => 'https://meet.google.com/abc-defg-hij'])
        ->assertRedirect();

    expect($booking->fresh()->meeting_link)->toBe('https://meet.google.com/abc-defg-hij');

    Notification::assertSentTo($client, MeetingLinkReady::class);
});

test('an admin can add a meeting link to any session', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle();

    $this->actingAs($admin)
        ->patch(route('bookings.meeting-link', $booking), ['meeting_link' => 'https://zoom.us/j/123456789'])
        ->assertRedirect();

    expect($booking->fresh()->meeting_link)->toBe('https://zoom.us/j/123456789');
});

test('a practitioner cannot set the link on a session that is not theirs', function () {
    $owner = makeBookablePractitioner();
    $stranger = User::factory()->create(['role' => UserRole::Practitioner]);
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $owner);

    $this->actingAs($stranger)
        ->patch(route('bookings.meeting-link', $booking), ['meeting_link' => 'https://meet.google.com/abc-defg-hij'])
        ->assertForbidden();

    expect($booking->fresh()->meeting_link)->toBeNull();
});

test('the meeting link must be a valid url', function () {
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();
    $booking = makePendingBooking($client, $practitioner);
    $booking->settle();

    $this->actingAs($practitioner)
        ->patch(route('bookings.meeting-link', $booking), ['meeting_link' => 'not-a-link'])
        ->assertSessionHasErrors('meeting_link');
});

test('an admin can create a booking for a registered client', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($admin)->get(route('admin.bookings.create'))->viewData('page');
    $option = collect($page['props']['practitioners'])->firstWhere('id', $practitioner->id);

    $this->actingAs($admin)->post(route('admin.bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $option['services'][0]['id'],
        'scheduled_at' => $option['slots'][0]['iso'],
        'client_type' => 'registered',
        'client_id' => $client->id,
    ])->assertRedirect(route('admin.bookings'));

    $booking = Booking::sole();
    expect($booking->client_id)->toBe($client->id)
        ->and($booking->status)->toBe('pending')
        ->and($booking->guest_name)->toBeNull();
});

test('an admin can create a guest (walk-in) booking without an account', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();

    $page = $this->actingAs($admin)->get(route('admin.bookings.create'))->viewData('page');
    $option = collect($page['props']['practitioners'])->firstWhere('id', $practitioner->id);

    $this->actingAs($admin)->post(route('admin.bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $option['services'][0]['id'],
        'scheduled_at' => $option['slots'][0]['iso'],
        'client_type' => 'guest',
        'guest_name' => 'Layla Walk-in',
        'guest_email' => 'layla@example.com',
        'guest_phone' => '+961 70 000 000',
    ])->assertRedirect(route('admin.bookings'));

    $booking = Booking::sole();
    expect($booking->client_id)->toBeNull()
        ->and($booking->guest_name)->toBe('Layla Walk-in')
        ->and($booking->guest_email)->toBe('layla@example.com')
        ->and($booking->clientName())->toBe('Layla Walk-in');
});

test('a guest booking emails the guest when it is accepted', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();

    $booking = Booking::create([
        'client_id' => null,
        'guest_name' => 'Layla Walk-in',
        'guest_email' => 'layla@example.com',
        'practitioner_id' => $practitioner->id,
        'service_id' => $practitioner->services->first()->id,
        'scheduled_at' => now()->addWeek()->setTime(17, 0),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'paid'])
        ->assertRedirect();

    Notification::assertSentOnDemand(BookingConfirmedForClient::class);
    Notification::assertSentTo($practitioner, SessionConfirmedForPractitioner::class);
});

test('an admin can reschedule a session to another free slot', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($client)->get(route('specialists.show', $practitioner))->viewData('page');
    $slots = $page['props']['slots'];

    $this->actingAs($client)->post(route('bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $page['props']['services'][0]['id'],
        'scheduled_at' => $slots[0]['iso'],
    ]);

    $booking = Booking::sole();
    $booking->settle();

    // The reschedule form should offer other free times, not the taken one.
    $editSlots = $this->actingAs($admin)
        ->get(route('admin.bookings.reschedule.edit', $booking))
        ->viewData('page')['props']['slots'];
    $newIso = collect($editSlots)->pluck('iso')->first();

    expect($newIso)->not->toBe($slots[0]['iso']);

    $this->actingAs($admin)
        ->patch(route('admin.bookings.reschedule', $booking), ['scheduled_at' => $newIso])
        ->assertRedirect(route('admin.bookings'));

    expect($booking->fresh()->scheduled_at->equalTo($newIso))->toBeTrue();

    Notification::assertSentTo($client, SessionRescheduledForClient::class);
    Notification::assertSentTo($practitioner, SessionRescheduledForPractitioner::class);
});

test('privacy and terms pages are public', function () {
    $this->get(route('privacy'))->assertOk();
    $this->get(route('terms'))->assertOk();
});
