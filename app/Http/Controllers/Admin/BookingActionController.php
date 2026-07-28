<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingCancelledForClient;
use App\Notifications\BookingConfirmedForClient;
use App\Notifications\SessionCancelledForPractitioner;
use App\Notifications\SessionConfirmedForPractitioner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingActionController extends Controller
{
    /**
     * Manually move a booking through its lifecycle while real payments are
     * tracked by hand: mark it paid (records the transaction), complete it,
     * mark a no-show, or cancel it (which voids the session and refunds).
     */
    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:paid,completed,no_show,cancelled'],
            'refund_amount' => ['nullable', 'numeric', 'min:0', 'max:'.(float) $booking->price],
        ]);

        match ($validated['action']) {
            'paid' => $this->accept($booking),
            'completed' => $booking->update(['status' => 'completed']),
            'no_show' => $this->markNoShow($booking, (float) ($validated['refund_amount'] ?? 0)),
            'cancelled' => $this->cancel($booking, isset($validated['refund_amount']) ? (float) $validated['refund_amount'] : null),
        };

        return back();
    }

    /**
     * Confirm the payment arrived: settle the booking, then tell the client
     * their session is on and tell the practitioner it's on their schedule.
     */
    private function accept(Booking $booking): void
    {
        $booking->settle();
        $booking->loadMissing(['client', 'practitioner', 'service']);

        $booking->notifyClient(new BookingConfirmedForClient($booking));
        $booking->practitioner->notify(new SessionConfirmedForPractitioner($booking));
    }

    /**
     * Cancel the booking — the session can no longer happen — refund the client
     * (full unless a smaller amount is given), and tell both the client and
     * practitioner. The refund recomputes the booking's own split on whatever is kept,
     * which also removes the refunded share from the practitioner's earnings.
     */
    private function cancel(Booking $booking, ?float $refundAmount): void
    {
        $wasPaid = $booking->payment_status === 'paid';

        $booking->update(['status' => 'cancelled']);

        if ($wasPaid) {
            // No amount given means a full refund of what was paid.
            $refundAmount ??= (float) $booking->price;
            $booking->refund($refundAmount);
        } else {
            $booking->update(['payment_status' => 'unpaid']);
            $refundAmount = 0.0;
        }

        $booking->loadMissing(['client', 'practitioner', 'service']);

        $booking->notifyClient(new BookingCancelledForClient($booking, $refundAmount));
        $booking->practitioner->notify(new SessionCancelledForPractitioner($booking));
    }

    /**
     * Mark a no-show. The client forfeits the payment by default (the slot was
     * held for them), but the admin may still choose to refund part or all of
     * it — which recomputes the split just like a cancellation.
     */
    private function markNoShow(Booking $booking, float $refundAmount): void
    {
        $booking->update(['status' => 'no_show']);

        if ($refundAmount > 0 && $booking->payment_status === 'paid') {
            $booking->refund($refundAmount);
        }
    }
}
