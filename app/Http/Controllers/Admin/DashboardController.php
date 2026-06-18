<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Platform overview: people, sessions, and money (gross, platform cut, payouts).
     */
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'clients' => User::where('role', UserRole::Client)->count(),
                'practitioners' => User::where('role', UserRole::Practitioner)->count(),
                'pending_approvals' => User::where('role', UserRole::Practitioner)
                    ->whereHas('practitionerProfile', fn ($query) => $query->where('approval_status', 'pending'))
                    ->count(),
                'bookings' => Booking::count(),
                'gross' => round((float) Transaction::where('status', 'completed')->sum('amount'), 2),
                'platform_profit' => round((float) Transaction::where('status', 'completed')->sum('platform_fee'), 2),
                'payouts' => round((float) Transaction::where('status', 'completed')->sum('practitioner_payout'), 2),
                'profit_month' => round((float) Transaction::where('status', 'completed')->where('paid_at', '>=', now()->startOfMonth())->sum('platform_fee'), 2),
            ],
            'recent' => Transaction::where('status', 'completed')
                ->with(['booking.client', 'booking.practitioner'])
                ->orderByDesc('paid_at')
                ->take(6)
                ->get()
                ->map(fn (Transaction $transaction) => [
                    'id' => $transaction->id,
                    'date' => $transaction->paid_at?->format('M j'),
                    'client' => $transaction->booking->client->name,
                    'practitioner' => $transaction->booking->practitioner->name,
                    'amount' => (float) $transaction->amount,
                    'platform_fee' => (float) $transaction->platform_fee,
                ]),
        ]);
    }

    /**
     * Every practitioner, their approval state, and what they've earned.
     */
    public function practitioners(): Response
    {
        $practitioners = User::where('role', UserRole::Practitioner)
            ->with('practitionerProfile')
            ->withCount('practitionerBookings')
            ->get()
            ->map(function (User $practitioner) {
                $settled = Transaction::where('status', 'completed')
                    ->whereHas('booking', fn ($query) => $query->where('practitioner_id', $practitioner->id));

                return [
                    'id' => $practitioner->id,
                    'name' => $practitioner->name,
                    'email' => $practitioner->email,
                    'headline' => $practitioner->practitionerProfile?->headline,
                    'approaches' => $practitioner->practitionerProfile?->approaches ?? [],
                    'languages' => $practitioner->practitionerProfile?->languages ?? [],
                    'approval_status' => $practitioner->practitionerProfile?->approval_status ?? 'pending',
                    'sessions' => $practitioner->practitioner_bookings_count,
                    'earned' => round((float) (clone $settled)->sum('practitioner_payout'), 2),
                    'owed' => round((float) (clone $settled)->where('payout_status', 'pending')->sum('practitioner_payout'), 2),
                ];
            })
            ->sortByDesc(fn ($row) => $row['approval_status'] === 'pending' ? 1 : 0)
            ->values();

        return Inertia::render('admin/practitioners', ['practitioners' => $practitioners]);
    }

    /**
     * Every client and their activity.
     */
    public function clients(): Response
    {
        $clients = User::where('role', UserRole::Client)
            ->withCount('clientBookings')
            ->get()
            ->map(function (User $client) {
                $spend = Transaction::where('status', 'completed')->whereHas('booking', fn ($query) => $query->where('client_id', $client->id))->sum('amount');

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'sessions' => $client->client_bookings_count,
                    'spent' => round((float) $spend, 2),
                    'joined' => $client->created_at?->format('M j, Y'),
                ];
            })
            ->values();

        return Inertia::render('admin/clients', ['clients' => $clients]);
    }

    /**
     * Every booking across the platform.
     */
    public function bookings(Request $request): Response
    {
        $from = $request->date('from');
        $to = $request->date('to');

        // Requests awaiting a decision — always shown, never hidden by the date filter.
        $pending = Booking::where('status', 'pending')
            ->with(['client', 'practitioner', 'service'])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Booking $booking) => $this->bookingRow($booking))
            ->values();

        // Upcoming confirmed sessions — these are the ones that need a meeting link.
        $confirmed = Booking::where('status', 'confirmed')
            ->where('scheduled_at', '>=', now())
            ->with(['client', 'practitioner', 'service'])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Booking $booking) => $this->bookingRow($booking))
            ->values();

        // The full list, narrowed by the chosen date range.
        $bookings = Booking::with(['client', 'practitioner', 'service'])
            ->when($from, fn ($query) => $query->where('scheduled_at', '>=', $from->startOfDay()))
            ->when($to, fn ($query) => $query->where('scheduled_at', '<=', $to->endOfDay()))
            ->orderByDesc('scheduled_at')
            ->take(300)
            ->get()
            ->map(fn (Booking $booking) => $this->bookingRow($booking))
            ->values();

        return Inertia::render('admin/bookings', [
            'pending' => $pending,
            'confirmed' => $confirmed,
            'bookings' => $bookings,
            'filters' => ['from' => $request->query('from'), 'to' => $request->query('to')],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingRow(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'client' => $booking->client->name,
            'practitioner' => $booking->practitioner->name,
            'service' => $booking->service->name,
            'scheduled_label' => $booking->scheduled_at->format('M j, Y · g:i A'),
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'price' => (float) $booking->price,
            'meeting_link' => $booking->meeting_link,
        ];
    }

    /**
     * The full accounting ledger: every transaction and the platform's cut.
     */
    public function transactions(Request $request): Response
    {
        $from = $request->date('from');
        $to = $request->date('to');

        $transactions = Transaction::where('status', 'completed')
            ->when($from, fn ($query) => $query->where('paid_at', '>=', $from->startOfDay()))
            ->when($to, fn ($query) => $query->where('paid_at', '<=', $to->endOfDay()))
            ->with(['booking.client', 'booking.practitioner'])
            ->orderByDesc('paid_at')
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'date' => $transaction->paid_at?->format('M j, Y'),
                'client' => $transaction->booking->client->name,
                'practitioner' => $transaction->booking->practitioner->name,
                'amount' => (float) $transaction->amount,
                'refunded' => (float) $transaction->refunded_amount,
                'platform_fee' => (float) $transaction->platform_fee,
                'payout' => (float) $transaction->practitioner_payout,
                'status' => $transaction->status,
                'payout_status' => $transaction->payout_status,
            ]);

        return Inertia::render('admin/transactions', [
            'totals' => [
                // Gross is what the platform actually kept (price minus refunds),
                // so it always equals platform profit + practitioner payouts.
                'gross' => round((float) $transactions->sum(fn ($t) => $t['amount'] - $t['refunded']), 2),
                'refunded' => round((float) $transactions->sum('refunded'), 2),
                'platform_profit' => round((float) $transactions->sum('platform_fee'), 2),
                'payouts' => round((float) $transactions->sum('payout'), 2),
                'pending_payout' => round((float) $transactions->where('payout_status', 'pending')->sum('payout'), 2),
                'count' => $transactions->count(),
            ],
            'transactions' => $transactions,
            'filters' => ['from' => $request->query('from'), 'to' => $request->query('to')],
        ]);
    }
}
