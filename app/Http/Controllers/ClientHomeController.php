<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientHomeController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * Show the client home page: greeting, upcoming session and the
     * practitioner directory with each one's next available slot.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $upcoming = $user->clientBookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', '>=', now())
            ->with(['practitioner', 'service'])
            ->orderBy('scheduled_at')
            ->first();

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
            'upcomingSession' => $upcoming ? [
                'id' => $upcoming->id,
                'practitioner_name' => $upcoming->practitioner->name,
                'service_name' => $upcoming->service->name,
                'scheduled_label' => $upcoming->scheduled_at->format('D, M j · g:i A'),
                'scheduled_month' => $upcoming->scheduled_at->format('M'),
                'scheduled_day' => $upcoming->scheduled_at->format('j'),
                'scheduled_time' => $upcoming->scheduled_at->format('g:i A')
                    .($upcoming->service->duration_minutes ? ' · '.$upcoming->service->duration_minutes.' mins' : ''),
                'meeting_link' => $upcoming->meeting_link,
                'status' => $upcoming->status,
            ] : null,
            'preferences' => [
                'language' => $user->clientProfile?->preferred_language,
                'approach' => $user->clientProfile?->preferred_approach,
            ],
        ]);
    }
}
