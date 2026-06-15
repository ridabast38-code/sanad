<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

function practitionerWithEarnings(): User
{
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create(['approval_status' => 'approved']);

    $service = Service::factory()->create();
    $client = User::factory()->create();

    // Two paid sessions at $35 → practitioner keeps 80% = $28 each ($56 total), platform 20% = $7 each.
    Booking::factory()->count(2)->create([
        'client_id' => $client->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => $service->id,
        'price' => 35,
        'platform_amount' => 7,
        'practitioner_amount' => 28,
    ])->each(fn (Booking $booking) => $booking->settle());

    return $practitioner;
}

test('a practitioner sees their own earnings, a client is bounced away', function () {
    $practitioner = practitionerWithEarnings();

    $this->actingAs($practitioner)
        ->get('/practitioner')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('practitioner/dashboard')
            ->where('stats.earnings_total', 56)
        );

    $this->actingAs(User::factory()->create())
        ->get('/practitioner')
        ->assertRedirect('/dashboard');
});

test('the admin sees platform-wide money, others are bounced away', function () {
    practitionerWithEarnings();
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/dashboard')
            ->where('stats.gross', 70)
            ->where('stats.platform_profit', 14)
            ->where('stats.payouts', 56)
        );

    $this->actingAs(User::factory()->create())
        ->get('/admin')
        ->assertRedirect('/dashboard');
});

test('a practitioner can replace their availability windows', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create(['approval_status' => 'approved']);

    $this->actingAs($practitioner)
        ->put('/practitioner/schedule', [
            'windows' => [
                ['day_of_week' => 1, 'start_time' => '17:00', 'end_time' => '20:00'],
                ['day_of_week' => 3, 'start_time' => '09:00', 'end_time' => '12:00'],
            ],
        ])
        ->assertRedirect('/practitioner/schedule');

    expect($practitioner->availabilities()->count())->toBe(2);
});

test('the admin can approve a practitioner', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create(['approval_status' => 'pending']);

    $this->actingAs($admin)
        ->patch("/admin/practitioners/{$practitioner->id}", ['approval_status' => 'approved'])
        ->assertRedirect('/admin/practitioners');

    expect($practitioner->practitionerProfile->fresh()->approval_status)->toBe('approved');
});
