<?php

namespace App\Http\Controllers\Practitioner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * The practitioner's home: next sessions and a quick earnings snapshot.
     */
    public function index(Request $request): Response
    {
        $me = $request->user();

        $upcoming = $me->practitionerBookings()
            ->where('status', 'confirmed')
            ->where('scheduled_at', '>=', now())
            ->with(['client', 'service'])
            ->orderBy('scheduled_at')
            ->take(5)
            ->get()
            ->map(fn (Booking $booking) => $this->bookingRow($booking));

        $paid = Transaction::query()
            ->where('status', 'completed')
            ->whereHas('booking', fn ($query) => $query->where('practitioner_id', $me->id));

        return Inertia::render('practitioner/dashboard', [
            'stats' => [
                'upcoming' => $me->practitionerBookings()->where('status', 'confirmed')->where('scheduled_at', '>=', now())->count(),
                'completed' => $me->practitionerBookings()->where('status', 'completed')->count(),
                'clients' => $me->practitionerBookings()->distinct('client_id')->count('client_id'),
                'earnings_total' => round((float) (clone $paid)->sum('practitioner_payout'), 2),
                'earnings_month' => round((float) (clone $paid)->where('paid_at', '>=', now()->startOfMonth())->sum('practitioner_payout'), 2),
            ],
            'upcoming' => $upcoming,
        ]);
    }

    /**
     * Everyone this practitioner has seen, with their session counts.
     */
    public function clients(Request $request): Response
    {
        $me = $request->user();

        $clients = $me->practitionerBookings()
            ->with('client')
            ->get()
            ->groupBy(fn (Booking $booking) => $booking->client_id
                ? 'user-'.$booking->client_id
                : 'guest-'.($booking->guest_email ?: $booking->guest_phone ?: $booking->id))
            ->map(function ($bookings, $key) {
                $first = $bookings->first();
                $next = $bookings->where('status', 'confirmed')
                    ->where('scheduled_at', '>=', now())
                    ->sortBy('scheduled_at')
                    ->first();

                return [
                    'id' => $key,
                    'name' => $first->clientName(),
                    'email' => $first->clientEmail(),
                    'sessions' => $bookings->count(),
                    'completed' => $bookings->where('status', 'completed')->count(),
                    'next_at' => $next?->scheduled_at?->format('D, M j · g:i A'),
                    'last_at' => $bookings->max('scheduled_at')?->format('M j, Y'),
                ];
            })
            ->sortByDesc('sessions')
            ->values();

        return Inertia::render('practitioner/clients', ['clients' => $clients]);
    }

    /**
     * The practitioner's accounting: every settled transaction and their cut.
     */
    public function earnings(Request $request): Response
    {
        $me = $request->user();

        $from = $request->date('from');
        $to = $request->date('to');

        $transactions = Transaction::query()
            ->where('status', 'completed')
            ->whereHas('booking', fn ($query) => $query->where('practitioner_id', $me->id))
            ->when($from, fn ($query) => $query->where('paid_at', '>=', $from->startOfDay()))
            ->when($to, fn ($query) => $query->where('paid_at', '<=', $to->endOfDay()))
            ->with(['booking.client', 'booking.service'])
            ->orderByDesc('paid_at')
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'date' => $transaction->paid_at?->format('M j, Y'),
                'month_key' => $transaction->paid_at?->format('Y-m'),
                'client' => $transaction->booking->clientName(),
                'service' => $transaction->booking->service->name,
                'type' => $transaction->booking->type,
                'amount' => (float) $transaction->amount,
                'platform_fee' => (float) $transaction->platform_fee,
                'payout' => (float) $transaction->practitioner_payout,
                'status' => $transaction->status,
                'payout_status' => $transaction->payout_status,
            ]);

        return Inertia::render('practitioner/earnings', [
            'totals' => [
                'gross' => round((float) $transactions->sum('amount'), 2),
                'platform_fee' => round((float) $transactions->sum('platform_fee'), 2),
                'payout' => round((float) $transactions->sum('payout'), 2),
                'paid_out' => round((float) $transactions->where('payout_status', 'paid')->sum('payout'), 2),
                'awaiting_payout' => round((float) $transactions->where('payout_status', 'pending')->sum('payout'), 2),
                'count' => $transactions->count(),
            ],
            'monthly' => $this->monthly($transactions),
            'transactions' => $transactions->values(),
            'filters' => ['from' => $request->query('from'), 'to' => $request->query('to')],
        ]);
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $transactions
     * @return array<int, array<string, mixed>>
     */
    private function monthly($transactions): array
    {
        return $transactions
            ->groupBy('month_key')
            ->map(fn ($rows, $key) => [
                'month' => Carbon::parse($key.'-01')->format('M Y'),
                'payout' => round((float) collect($rows)->sum('payout'), 2),
                'count' => count($rows),
            ])
            ->sortKeysDesc()
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingRow(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'client' => $booking->clientName(),
            'service' => $booking->service->name,
            'type' => $booking->type,
            'scheduled_label' => $booking->scheduled_at->format('D, M j · g:i A'),
            'status' => $booking->status,
            'meeting_link' => $booking->meeting_link,
            'payout' => (float) $booking->practitioner_amount,
        ];
    }
}
