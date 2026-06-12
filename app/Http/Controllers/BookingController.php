<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * The platform's share of every booking (the rest goes to the practitioner).
     */
    private const PLATFORM_SHARE = 0.20;

    /**
     * Book a session: validate the chosen slot is genuinely offered by the
     * practitioner, then create a pending booking.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'practitioner_id' => ['required', 'integer', 'exists:users,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'scheduled_at' => ['required', 'string'],
            'client_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $practitioner = User::query()
            ->where('role', UserRole::Practitioner)
            ->whereHas('practitionerProfile', function ($query) {
                $query->where('approval_status', 'approved');
            })
            ->with(['availabilities', 'services'])
            ->findOrFail($validated['practitioner_id']);

        $service = $practitioner->services->firstWhere('id', (int) $validated['service_id']);

        if (! $service) {
            throw ValidationException::withMessages([
                'service_id' => 'This specialist does not offer that service.',
            ]);
        }

        $offeredSlots = collect($this->upcomingSlotOptions($practitioner->availabilities))->pluck('iso');

        if (! $offeredSlots->contains($validated['scheduled_at'])) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time is no longer available — please pick another slot.',
            ]);
        }

        $price = (float) $service->pivot->price;

        Booking::create([
            'client_id' => $request->user()->id,
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'scheduled_at' => Carbon::parse($validated['scheduled_at']),
            'status' => 'pending',
            'price' => $price,
            'platform_amount' => round($price * self::PLATFORM_SHARE, 2),
            'practitioner_amount' => round($price * (1 - self::PLATFORM_SHARE), 2),
            'client_note' => $validated['client_note'] ?? null,
        ]);

        return to_route('dashboard');
    }
}
