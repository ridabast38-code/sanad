<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientHomeController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * Show the client home page: greeting, upcoming sessions and the
     * practitioner directory with each one's next available slot.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Every session that hasn't finished yet, soonest first. We look back a
        // few hours so a session stays visible while it's happening (not just
        // until its start time), then drop any that have truly ended.
        $sessions = $user->clientBookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', '>=', now()->subHours(3))
            ->with(['practitioner', 'service'])
            ->orderBy('scheduled_at')
            ->get()
            ->filter(fn (Booking $booking) => $booking->scheduled_at
                ->addMinutes($booking->service->duration_minutes ?? 60)
                ->isFuture())
            ->map(fn (Booking $booking) => $this->sessionPayload($booking))
            ->values();

        return Inertia::render('client/home', [
            'practitioners' => $this->specialistDirectory(),
            'stats' => [
                'upcoming' => $user->clientBookings()
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->where('scheduled_at', '>=', now())
                    ->count(),
                'completed' => $user->clientBookings()
                    ->where('status', 'completed')
                    ->count(),
            ],
            // The soonest session (the featured card) plus the full list (so the
            // dashboard can show "also upcoming" when there's more than one).
            'upcomingSession' => $sessions->first(),
            'upcomingSessions' => $sessions->all(),
            'preferences' => [
                'language' => $user->clientProfile?->preferred_language,
                'approach' => $user->clientProfile?->preferred_approach,
            ],
        ]);
    }

    /**
     * The shape a single session takes on the client dashboard.
     *
     * @return array<string, mixed>
     */
    private function sessionPayload(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'practitioner_name' => $booking->practitioner->name,
            'service_name' => $booking->service->name,
            'scheduled_label' => $booking->scheduled_at->format('D, M j · g:i A'),
            'scheduled_month' => $booking->scheduled_at->format('M'),
            'scheduled_day' => $booking->scheduled_at->format('j'),
            'scheduled_time' => $booking->scheduled_at->format('g:i A')
                .($booking->service->duration_minutes ? ' · '.$booking->service->duration_minutes.' mins' : ''),
            'scheduled_iso' => $booking->scheduled_at->toIso8601String(),
            'duration_minutes' => $booking->service->duration_minutes,
            'meeting_link' => $booking->meeting_link,
            'status' => $booking->status,
        ];
    }
}
