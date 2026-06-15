<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingConfirmedForClient;
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
        ]);

        match ($validated['action']) {
            'paid' => $this->accept($booking),
            'completed' => $booking->update(['status' => 'completed']),
            'no_show' => $booking->update(['status' => 'no_show']),
            'cancelled' => $this->cancel($booking),
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

        $booking->client->notify(new BookingConfirmedForClient($booking));
        $booking->practitioner->notify(new SessionConfirmedForPractitioner($booking));
    }

    /**
     * Cancel the booking — the session can no longer happen — and refund any
     * recorded transaction.
     */
    private function cancel(Booking $booking): void
    {
        $booking->update([
            'status' => 'cancelled',
            'payment_status' => $booking->payment_status === 'paid' ? 'refunded' : 'unpaid',
        ]);

        $booking->transaction?->update([
            'status' => 'refunded',
            'payout_status' => 'pending',
        ]);
    }
}
