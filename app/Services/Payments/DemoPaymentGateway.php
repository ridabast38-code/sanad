<?php

namespace App\Services\Payments;

use App\Models\Booking;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * "SanadPay" — a self-contained sandbox payment gateway. Real payment providers
 * (Stripe, PayPal) aren't available in Lebanon, so this stands in: it does real
 * card validation (Luhn checksum, expiry, CVC), mirrors the industry test-card
 * scenarios (a couple of numbers deliberately decline), and returns a real
 * transaction reference — without moving any money. It never confirms the
 * booking; the admin still decides. Swap in a real provider by pointing
 * `config('payments.gateway')` at another {@see PaymentGateway} implementation.
 */
class DemoPaymentGateway implements PaymentGateway
{
    /** Test cards that deliberately fail, so declines can be demonstrated. */
    private const DECLINE_CARDS = [
        '4000000000000002' => 'Your card was declined.',
        '4000000000009995' => 'Your card has insufficient funds.',
        '4000000000000069' => 'Your card has expired.',
    ];

    public function charge(Booking $booking, array $card): PaymentResult
    {
        $number = preg_replace('/\D/', '', $card['number'] ?? '');

        if (! $this->passesLuhn($number)) {
            return new PaymentResult(false, '', 'Your card number looks incorrect.');
        }

        if (! $this->expiryIsInFuture($card['expiry'] ?? '')) {
            return new PaymentResult(false, '', 'Your card has expired.');
        }

        if (! preg_match('/^\d{3,4}$/', (string) ($card['cvc'] ?? ''))) {
            return new PaymentResult(false, '', 'Your security code (CVC) is invalid.');
        }

        if (isset(self::DECLINE_CARDS[$number])) {
            return new PaymentResult(false, '', self::DECLINE_CARDS[$number]);
        }

        // Approved — issue a transaction reference, no real money moved.
        return new PaymentResult(true, 'txn_'.Str::lower(Str::random(20)));
    }

    /**
     * The Luhn checksum every real card number satisfies.
     */
    private function passesLuhn(string $number): bool
    {
        if (strlen($number) < 12 || strlen($number) > 19) {
            return false;
        }

        $sum = 0;
        $alt = false;

        for ($i = strlen($number) - 1; $i >= 0; $i--) {
            $digit = (int) $number[$i];

            if ($alt) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $alt = ! $alt;
        }

        return $sum % 10 === 0;
    }

    /**
     * Whether an "MM / YY" (or "MMYY") expiry is this month or later.
     */
    private function expiryIsInFuture(string $expiry): bool
    {
        $digits = preg_replace('/\D/', '', $expiry);

        if (strlen($digits) !== 4) {
            return false;
        }

        $month = (int) substr($digits, 0, 2);
        $year = 2000 + (int) substr($digits, 2, 2);

        if ($month < 1 || $month > 12) {
            return false;
        }

        return Carbon::create($year, $month)->endOfMonth()->isFuture();
    }
}
