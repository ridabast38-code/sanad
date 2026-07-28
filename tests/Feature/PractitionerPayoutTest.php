<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * "Pay practitioner" is a bookkeeping record, not a payment.
 *
 * The founder pays practitioners himself — cash or bank transfer — and then
 * presses the button so the platform knows that money has left. Nothing here
 * moves funds; it stamps `payout_status` and `payout_at` so "owed" stops
 * counting a session that has already been settled in real life.
 *
 * Untested until now, which mattered: it is the last step of the money flow and
 * a silent failure means paying someone twice.
 */
function paidSessionFor(User $practitioner, float $price = 40): Booking
{
    $booking = Booking::create([
        'client_id' => User::factory()->create()->id,
        'practitioner_id' => $practitioner->id,
        'service_id' => Service::factory()->create()->id,
        'scheduled_at' => now()->subWeek(),
        'status' => 'completed',
        'price' => $price,
        'platform_amount' => round($price * Booking::PLATFORM_SHARE, 2),
        'practitioner_amount' => round($price * (1 - Booking::PLATFORM_SHARE), 2),
        'payment_status' => 'paid',
    ]);

    $booking->settle();

    return $booking;
}

function approvedPractitioner(): User
{
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create(['approval_status' => 'approved']);

    return $practitioner;
}

test('a settled session is owed to the practitioner at 85% until it is marked paid', function () {
    $practitioner = approvedPractitioner();
    $booking = paidSessionFor($practitioner);

    $transaction = $booking->transaction;

    expect((float) $transaction->practitioner_payout)->toBe(34.0)
        ->and((float) $transaction->platform_fee)->toBe(6.0)
        ->and($transaction->payout_status)->toBe('pending');

    $this->actingAs($practitioner)
        ->get('/practitioner/earnings')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('totals.payout', 34)
            ->where('totals.awaiting_payout', 34)
            ->where('totals.paid_out', 0)
        );
});

test('recording a payout moves it from owed to paid without touching the amounts', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = approvedPractitioner();
    $transaction = paidSessionFor($practitioner)->transaction;

    $this->actingAs($admin)
        ->patch(route('admin.payouts.update', $transaction), ['payout_status' => 'paid'])
        ->assertRedirect();

    $transaction->refresh();

    expect($transaction->payout_status)->toBe('paid')
        ->and($transaction->payout_at)->not->toBeNull()
        // the money itself is untouched — this only records that it was handed over
        ->and((float) $transaction->practitioner_payout)->toBe(34.0)
        ->and((float) $transaction->platform_fee)->toBe(6.0);

    $this->actingAs($practitioner)
        ->get('/practitioner/earnings')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('totals.paid_out', 34)
            ->where('totals.awaiting_payout', 0)
        );
});

test('a payout recorded by mistake can be put back to pending', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = approvedPractitioner();
    $transaction = paidSessionFor($practitioner)->transaction;

    $this->actingAs($admin)->patch(route('admin.payouts.update', $transaction), ['payout_status' => 'paid']);
    $this->actingAs($admin)->patch(route('admin.payouts.update', $transaction), ['payout_status' => 'pending']);

    $transaction->refresh();

    expect($transaction->payout_status)->toBe('pending')
        ->and($transaction->payout_at)->toBeNull();
});

test('settling a whole balance clears every session owed to that practitioner only', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = approvedPractitioner();
    $other = approvedPractitioner();

    paidSessionFor($practitioner);
    paidSessionFor($practitioner);
    $untouched = paidSessionFor($other)->transaction;

    $this->actingAs($admin)
        ->post(route('admin.payouts.settle-all', $practitioner))
        ->assertRedirect();

    $this->actingAs($practitioner)
        ->get('/practitioner/earnings')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('totals.paid_out', 68)
            ->where('totals.awaiting_payout', 0)
        );

    // the other practitioner is still owed — settle-all must not be a global button
    expect($untouched->refresh()->payout_status)->toBe('pending');
});

test('only an admin can record a payout', function () {
    $practitioner = approvedPractitioner();
    $transaction = paidSessionFor($practitioner)->transaction;

    $this->actingAs($practitioner)
        ->patch(route('admin.payouts.update', $transaction), ['payout_status' => 'paid'])
        ->assertRedirect();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.payouts.settle-all', $practitioner))
        ->assertRedirect();

    expect($transaction->refresh()->payout_status)->toBe('pending');
});
