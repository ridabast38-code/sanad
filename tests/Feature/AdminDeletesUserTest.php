<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;

test('an admin can delete a user together with their bookings and transactions', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $client = User::factory()->create(['role' => UserRole::Client]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $service = Service::factory()->create();

    $booking = Booking::factory()->create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $service->id,
    ]);
    $transaction = Transaction::factory()->create(['booking_id' => $booking->id]);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $client))->assertRedirect();

    expect(User::find($client->id))->toBeNull()
        ->and(Booking::find($booking->id))->toBeNull()
        ->and(Transaction::find($transaction->id))->toBeNull()
        ->and(User::find($practitioner->id))->not->toBeNull();
});

test('an admin cannot delete their own account', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $admin))->assertForbidden();

    expect(User::find($admin->id))->not->toBeNull();
});

test('a non-admin cannot delete users', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $victim = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($practitioner)->delete(route('admin.users.destroy', $victim))->assertRedirect();

    expect(User::find($victim->id))->not->toBeNull();
});
