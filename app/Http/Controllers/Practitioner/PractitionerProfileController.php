<?php

namespace App\Http\Controllers\Practitioner;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PractitionerProfileController extends Controller
{
    private const APPROACHES = ['cbt', 'emdr', 'psychoanalysis'];

    private const LANGUAGES = ['arabic', 'english', 'french'];

    /**
     * Show the practitioner's public-profile editor.
     */
    public function edit(Request $request): Response
    {
        $profile = $request->user()->practitionerProfile;
        $mine = $request->user()->services->keyBy('id');

        return Inertia::render('practitioner/profile', [
            'profile' => [
                'headline' => $profile?->headline,
                'bio' => $profile?->bio,
                'gender' => $profile?->gender,
                'years_experience' => $profile?->years_experience,
                'approaches' => $profile?->approaches ?? [],
                'languages' => $profile?->languages ?? [],
                'approval_status' => $profile?->approval_status,
                'photo_path' => $profile?->photo_path,
            ],
            'options' => [
                'approaches' => self::APPROACHES,
                'languages' => self::LANGUAGES,
            ],
            'services' => Service::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'duration_minutes' => $service->duration_minutes,
                    'price' => $mine->has($service->id) ? (float) $mine[$service->id]->pivot->price : null,
                ]),
        ]);
    }

    /**
     * Persist changes to the practitioner's public profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'headline' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'gender' => ['nullable', 'in:male,female'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'approaches' => ['array'],
            'approaches.*' => ['in:'.implode(',', self::APPROACHES)],
            'languages' => ['array'],
            'languages.*' => ['in:'.implode(',', self::LANGUAGES)],
        ]);

        $request->user()->practitionerProfile()->update($validated);

        return to_route('practitioner.profile.edit');
    }

    /**
     * Set the prices for the services this practitioner offers. A blank or zero
     * price means they don't offer that service.
     */
    public function updateServices(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'services' => ['present', 'array'],
            'services.*.id' => ['required', 'integer', 'exists:services,id'],
            'services.*.price' => ['nullable', 'numeric', 'min:0', 'max:10000'],
        ]);

        $sync = [];
        foreach ($validated['services'] as $service) {
            if (! empty($service['price']) && (float) $service['price'] > 0) {
                $sync[$service['id']] = ['price' => round((float) $service['price'], 2)];
            }
        }

        $request->user()->services()->sync($sync);

        return to_route('practitioner.profile.edit');
    }
}
