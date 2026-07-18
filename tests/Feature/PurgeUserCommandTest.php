<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;

test('purging a user removes them, their bookings and their transactions', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $service = Service::factory()->create();

    $booking = Booking::factory()->create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $service->id,
    ]);
    $transaction = Transaction::factory()->create(['booking_id' => $booking->id]);

    $this->artisan('user:purge', ['email' => $client->email, '--force' => true])->assertSuccessful();

    expect(User::find($client->id))->toBeNull()
        ->and(Booking::find($booking->id))->toBeNull()
        ->and(Transaction::find($transaction->id))->toBeNull()
        // a different account is left untouched
        ->and(User::find($practitioner->id))->not->toBeNull();
});

test('a dry run reports but deletes nothing', function () {
    $user = User::factory()->create();

    $this->artisan('user:purge', ['email' => $user->email])->assertSuccessful();

    expect(User::find($user->id))->not->toBeNull();
});

test('purging an unknown email fails cleanly', function () {
    $this->artisan('user:purge', ['email' => 'nobody@example.com', '--force' => true])->assertFailed();
});
