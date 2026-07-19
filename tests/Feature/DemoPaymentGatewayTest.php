<?php

// DEMO / COMPETITION ONLY — safe to delete after the competition.

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Notifications\BookingConfirmedForClient;
use App\Notifications\SessionConfirmedForPractitioner;
use Illuminate\Support\Facades\Notification;

/**
 * A fresh pending, unpaid booking with its own client and practitioner.
 */
function makeGatewayBooking(): Booking
{
    $client = User::factory()->create();
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    return Booking::create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $service->id,
        'scheduled_at' => now()->addWeek()->setTime(17, 0),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);
}

$validCard = [
    'name' => 'Sanad Demo',
    'number' => '4242 4242 4242 4242',
    'expiry' => '12 / 29',
    'cvc' => '123',
];

test('a demo card payment marks the booking paid but does NOT confirm it', function () use ($validCard) {
    $booking = makeGatewayBooking();

    $this->actingAs($booking->client)
        ->post(route('bookings.gateway', $booking), $validCard)
        ->assertRedirect(route('bookings.received', $booking));

    $booking->refresh();

    expect($booking->payment_status)->toBe('paid')
        ->and($booking->status)->toBe('pending')   // stays in the admin queue — no auto-confirm
        ->and($booking->transaction)->toBeNull();    // no money recorded until an admin accepts
});

test('only the booking owner can run the checkout', function () use ($validCard) {
    $booking = makeGatewayBooking();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->post(route('bookings.gateway', $booking), $validCard)
        ->assertForbidden();

    expect($booking->fresh()->payment_status)->toBe('unpaid');
});

test('the checkout validates the card fields', function () {
    $booking = makeGatewayBooking();

    $this->actingAs($booking->client)
        ->post(route('bookings.gateway', $booking), [])
        ->assertSessionHasErrors(['name', 'number', 'expiry', 'cvc']);

    expect($booking->fresh()->payment_status)->toBe('unpaid');
});

test('an already-paid booking cannot be charged again', function () use ($validCard) {
    $booking = makeGatewayBooking();
    $booking->update(['payment_status' => 'paid']);

    $this->actingAs($booking->client)
        ->post(route('bookings.gateway', $booking), $validCard)
        ->assertRedirect(route('dashboard'));
});

test('an admin still decides: accepting a demo-paid booking confirms and settles it', function () use ($validCard) {
    Notification::fake();

    $booking = makeGatewayBooking();
    $this->actingAs($booking->client)->post(route('bookings.gateway', $booking), $validCard);

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->patch(route('admin.bookings.action', $booking), ['action' => 'paid'])
        ->assertRedirect();

    $booking->refresh();

    expect($booking->status)->toBe('confirmed')
        ->and($booking->payment_status)->toBe('paid')
        ->and($booking->transaction)->not->toBeNull();

    Notification::assertSentTo($booking->client, BookingConfirmedForClient::class);
    Notification::assertSentTo($booking->practitioner, SessionConfirmedForPractitioner::class);
});
