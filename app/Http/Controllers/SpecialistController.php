<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpecialistController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * Show the full specialist directory ("View all" page).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('client/specialists', [
            'practitioners' => $this->specialistDirectory(),
            'preferences' => [
                'language' => $user->clientProfile?->preferred_language,
                'approach' => $user->clientProfile?->preferred_approach,
            ],
        ]);
    }

    /**
     * Show one specialist's profile with their services and bookable slots.
     */
    public function show(User $practitioner): Response
    {
        abort_unless(
            $practitioner->role === UserRole::Practitioner
                && $practitioner->practitionerProfile?->approval_status === 'approved',
            404
        );

        $practitioner->load(['practitionerProfile', 'availabilities', 'services']);
        $profile = $practitioner->practitionerProfile;

        return Inertia::render('client/specialist-profile', [
            'specialist' => [
                'id' => $practitioner->id,
                'name' => $practitioner->name,
                'headline' => $profile->headline,
                'bio' => $profile->bio,
                'photo_path' => $profile->photo_path,
                'approaches' => $profile->approaches ?? [],
                'languages' => $profile->languages ?? [],
                'years_experience' => $profile->years_experience,
            ],
            'services' => $practitioner->services->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration_minutes' => $service->duration_minutes,
                'price' => (float) $service->pivot->price,
            ])->values(),
            'slots' => $this->upcomingSlotOptions($practitioner->availabilities),
        ]);
    }
}
