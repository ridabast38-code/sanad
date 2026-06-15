<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PayoutController extends Controller
{
    /**
     * Record whether the practitioner has actually been paid their 80% share.
     * Separate from the client's payment — this is money leaving the platform.
     */
    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'payout_status' => ['required', 'in:pending,paid'],
        ]);

        $transaction->update([
            'payout_status' => $validated['payout_status'],
            'payout_at' => $validated['payout_status'] === 'paid' ? Carbon::now() : null,
        ]);

        return back();
    }

    /**
     * Settle a practitioner's whole outstanding balance in one click — mark
     * every owed (completed, not-yet-paid-out) transaction as paid out.
     */
    public function settleAll(User $practitioner): RedirectResponse
    {
        Transaction::where('status', 'completed')
            ->where('payout_status', 'pending')
            ->whereHas('booking', fn ($query) => $query->where('practitioner_id', $practitioner->id))
            ->update([
                'payout_status' => 'paid',
                'payout_at' => Carbon::now(),
            ]);

        return back();
    }
}
