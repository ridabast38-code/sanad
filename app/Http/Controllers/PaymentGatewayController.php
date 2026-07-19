<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\Payments\PaymentGateway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DEMO / COMPETITION ONLY — safe to delete after the competition.
 *
 * The mobile app's in-app card checkout. It runs the configured PaymentGateway
 * (the demo driver by default) and, on success, marks the booking PAID but
 * leaves it PENDING — so it lands in the admin queue for a human to confirm or
 * reject, exactly like the manual-transfer flow. Nothing here is used by the
 * website (the checkout is gated to the native app on the client side).
 */
class PaymentGatewayController extends Controller
{
    /**
     * Charge the booking through the demo gateway. Only the booking's own client
     * may pay, and only while it is still pending and unpaid.
     */
    public function charge(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->client_id === $request->user()->id, 403);

        if ($booking->payment_status === 'paid' || $booking->status !== 'pending') {
            return to_route('dashboard');
        }

        $card = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'number' => ['required', 'string', 'max:25'],
            'expiry' => ['required', 'string', 'max:7'],
            'cvc' => ['required', 'string', 'max:4'],
        ]);

        $gateway = app(config('payments.gateway'));
        $result = $gateway->charge($booking, $card);

        if (! $result->success) {
            throw ValidationException::withMessages([
                'card' => $result->message ?? 'Your payment could not be processed. Please try again.',
            ]);
        }

        // Money in — but the session is NOT auto-confirmed. Mark it paid and leave
        // it pending so an admin still decides. The admin's "Accept (paid)" action
        // then settles it (records the transaction, notifies both sides).
        $booking->update(['payment_status' => 'paid']);

        return to_route('bookings.received', $booking);
    }

    /**
     * The "payment received — awaiting confirmation" screen shown after a
     * successful demo charge.
     */
    public function received(Request $request, Booking $booking): Response|RedirectResponse
    {
        abort_unless($booking->client_id === $request->user()->id, 403);

        if ($booking->payment_status !== 'paid') {
            return to_route('dashboard');
        }

        $booking->load(['practitioner', 'service']);

        return Inertia::render('client/booking-received', [
            'booking' => [
                'reference' => 'SANAD-'.str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT),
                'practitioner_name' => $booking->practitioner->name,
                'service_name' => $booking->service->name,
                'scheduled_label' => $booking->scheduled_at->format('l, M j, Y · g:i A'),
                'price' => (float) $booking->price,
            ],
        ]);
    }
}
