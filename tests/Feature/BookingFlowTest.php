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

test('privacy and terms pages are public', function () {
    $this->get(route('privacy'))->assertOk();
    $this->get(route('terms'))->assertOk();
});
