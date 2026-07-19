<?php

namespace App\Services\Payments;

use App\Models\Booking;
use Illuminate\Support\Str;

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * A stand-in gateway for the mobile demo: it always approves the payment and
 * returns a fake authorization reference. It never touches real money and never
 * confirms the booking — the admin still decides. Swap this out by pointing
 * `config('payments.gateway')` at a real implementation of {@see PaymentGateway}.
 */
class DemoPaymentGateway implements PaymentGateway
{
    public function charge(Booking $booking, array $card): PaymentResult
    {
        // A demo never declines a valid-looking card.
        return new PaymentResult(
            success: true,
            reference: 'DEMO-'.Str::upper(Str::random(10)),
        );
    }
}
