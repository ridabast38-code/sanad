<?php

namespace App\Services\Payments;

use App\Models\Booking;

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * A swappable payment gateway. The competition build ships {@see DemoPaymentGateway},
 * which approves instantly without moving real money. A real provider (Stripe,
 * a local card processor, …) can implement this same contract later and be
 * swapped in via `config('payments.gateway')` — no caller changes.
 */
interface PaymentGateway
{
    /**
     * Attempt to charge the booking's price. Implementations must not confirm
     * the booking themselves — they only report whether the money was taken.
     *
     * @param  array<string, string>  $card
     */
    public function charge(Booking $booking, array $card): PaymentResult;
}
