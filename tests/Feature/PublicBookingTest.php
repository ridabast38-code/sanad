<?php

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\PendingRegistration;
use App\Models\Service;
use App\Models\User;
use App\Notifications\NewBookingRequested;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;

function makePublicBookablePractitioner(): User
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

test('the public booking page shows an approved psychologist with services and slots', function () {
    $practitioner = makePublicBookablePractitioner();

    $this->get(route('book.show', $practitioner))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/book')
            ->where('specialist.name', $practitioner->name)
            ->has('services', 1)
            ->where('services.0.price', 40)
            ->has('slots')
        );
});

test('an unapproved psychologist has no public booking page', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Pending review',
        'approval_status' => 'pending',
    ]);

    $this->get(route('book.show', $practitioner))->assertNotFound();
});

test('a signed-in client is sent to the in-app flow instead of the guest page', function () {
    $practitioner = makePublicBookablePractitioner();
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('book.show', $practitioner))
        ->assertRedirect(route('specialists.show', $practitioner));
});

test('a guest can complete a booking without an account', function () {
    Notification::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makePublicBookablePractitioner();

    $page = $this->get(route('book.show', $practitioner))->viewData('page');
    $slotIso = $page['props']['slots'][0]['iso'];
    $serviceId = $page['props']['services'][0]['id'];

    $response = $this->post(route('book.store', $practitioner), [
        'service_id' => $serviceId,
        'scheduled_at' => $slotIso,
        'guest_name' => 'Maya Guest',
        'guest_email' => 'maya@example.com',
        'guest_phone' => '+961 70 123 456',
        'client_note' => 'First time, a little nervous.',
    ]);

    $booking = Booking::sole();

    $response->assertRedirect(route('book.confirmed', $booking->public_token));

    expect($booking->client_id)->toBeNull()
        ->and($booking->guest_name)->toBe('Maya Guest')
        ->and($booking->guest_email)->toBe('maya@example.com')
        ->and($booking->guest_phone)->toBe('+961 70 123 456')
        ->and($booking->status)->toBe('pending')
        ->and($booking->public_token)->not->toBeNull()
        ->and((float) $booking->price)->toBe(40.0)
        ->and((float) $booking->platform_amount)->toBe(8.0);

    // Admins are alerted, exactly like every other booking awaiting payment.
    Notification::assertSentTo($admin, NewBookingRequested::class);
});

test('a guest booking requires name, email and phone', function () {
    $practitioner = makePublicBookablePractitioner();

    $page = $this->get(route('book.show', $practitioner))->viewData('page');

    $this->post(route('book.store', $practitioner), [
        'service_id' => $page['props']['services'][0]['id'],
        'scheduled_at' => $page['props']['slots'][0]['iso'],
    ])->assertSessionHasErrors(['guest_name', 'guest_email', 'guest_phone']);

    expect(Booking::count())->toBe(0);
});

test('a guest cannot take a slot the psychologist does not offer', function () {
    $practitioner = makePublicBookablePractitioner();
    $serviceId = $practitioner->services->first()->id;

    $this->post(route('book.store', $practitioner), [
        'service_id' => $serviceId,
        'scheduled_at' => now()->addDay()->setTime(9, 0)->toIso8601String(),
        'guest_name' => 'Maya Guest',
        'guest_email' => 'maya@example.com',
        'guest_phone' => '+961 70 123 456',
    ])->assertSessionHasErrors('scheduled_at');

    expect(Booking::count())->toBe(0);
});

test('the confirmed page is reachable by token and shows the payment methods', function () {
    config(['payments.methods' => [
        ['key' => 'whish', 'label' => 'Whish Money', 'number' => '+961 70 000 000', 'account_name' => 'Sanad', 'instructions' => 'Send via Whish.'],
        ['key' => 'omt', 'label' => 'OMT', 'number' => null, 'account_name' => null, 'instructions' => 'Send via OMT.'],
    ]]);

    $practitioner = makePublicBookablePractitioner();

    $booking = Booking::create([
        'public_token' => (string) Str::uuid(),
        'client_id' => null,
        'guest_name' => 'Maya Guest',
        'guest_email' => 'maya@example.com',
        'guest_phone' => '+961 70 123 456',
        'practitioner_id' => $practitioner->id,
        'service_id' => $practitioner->services->first()->id,
        'scheduled_at' => now()->addWeek()->setTime(17, 0),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);

    $this->get(route('book.confirmed', $booking->public_token))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/booking-confirmed')
            ->where('booking.guest_name', 'Maya Guest')
            ->where('booking.is_paid', false)
            ->has('methods', 1)
            ->where('methods.0.label', 'Whish Money')
        );
});

test('an unknown confirmation token is not found', function () {
    $this->get(route('book.confirmed', 'not-a-real-token'))->assertNotFound();
});

test('registering with a guest email links past guest bookings to the new account', function () {
    $practitioner = makePublicBookablePractitioner();

    $booking = Booking::create([
        'public_token' => (string) Str::uuid(),
        'client_id' => null,
        'guest_name' => 'Maya Guest',
        'guest_email' => 'maya@example.com',
        'guest_phone' => '+961 70 123 456',
        'practitioner_id' => $practitioner->id,
        'service_id' => $practitioner->services->first()->id,
        'scheduled_at' => now()->addWeek()->setTime(17, 0),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);

    $this->post(route('register'), [
        'name' => 'Maya Guest',
        'email' => 'maya@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // The account (and the booking link) only happens once the emailed
    // confirmation link is clicked.
    expect($booking->fresh()->client_id)->toBeNull();

    $token = PendingRegistration::where('email', 'maya@example.com')->sole()->token;
    $this->get(route('register.confirm', $token));

    $newUser = User::where('email', 'maya@example.com')->sole();

    expect($booking->fresh()->client_id)->toBe($newUser->id);
});
