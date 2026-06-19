<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Support\StabilizationFlows;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ManualBookingController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * Show the admin's "create a booking" form for clients who book by phone or
     * WhatsApp — either an existing registered client or a one-off guest.
     */
    public function create(): Response
    {
        $practitioners = User::query()
            ->where('role', UserRole::Practitioner)
            ->whereHas('practitionerProfile', fn ($query) => $query->where('approval_status', 'approved'))
            ->with(['services', 'availabilities', 'practitionerBookings' => function ($query) {
                $query->whereIn('status', ['pending', 'confirmed'])->where('scheduled_at', '>=', now());
            }])
            ->orderBy('name')
            ->get()
            ->map(fn (User $practitioner) => [
                'id' => $practitioner->id,
                'name' => $practitioner->name,
                'services' => $practitioner->services->map(fn ($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => (float) $service->pivot->price,
                ])->values(),
                'slots' => $this->upcomingSlotOptions($practitioner),
            ])
            ->values();

        $clients = User::where('role', UserRole::Client)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ])
            ->values();

        return Inertia::render('admin/booking-create', [
            'practitioners' => $practitioners,
            'clients' => $clients,
            'emergencyCategories' => collect(StabilizationFlows::menu())
                ->map(fn (array $flow) => ['key' => $flow['key'], 'label' => $flow['label']])
                ->values(),
        ]);
    }

    /**
     * Create a pending booking on a client's behalf. It then follows the exact
     * same flow as a self-booked session (admin marks paid, etc.).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'practitioner_id' => ['required', 'integer', 'exists:users,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'scheduled_at' => ['required', 'string'],
            'client_type' => ['required', 'in:registered,guest'],
            'client_id' => ['required_if:client_type,registered', 'nullable', 'integer', 'exists:users,id'],
            'guest_name' => ['required_if:client_type,guest', 'nullable', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', Rule::in([Booking::TYPE_STANDARD, Booking::TYPE_EMERGENCY])],
            'emergency_category' => ['nullable', 'required_if:type,emergency', Rule::in(array_keys(StabilizationFlows::all()))],
            'client_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $practitioner = User::query()
            ->where('role', UserRole::Practitioner)
            ->whereHas('practitionerProfile', fn ($query) => $query->where('approval_status', 'approved'))
            ->with(['availabilities', 'services'])
            ->findOrFail($validated['practitioner_id']);

        $service = $practitioner->services->firstWhere('id', (int) $validated['service_id']);

        if (! $service) {
            throw ValidationException::withMessages([
                'service_id' => 'This specialist does not offer that service.',
            ]);
        }

        $offeredSlots = collect($this->upcomingSlotOptions($practitioner))->pluck('iso');

        if (! $offeredSlots->contains($validated['scheduled_at'])) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time is not available — please pick another slot.',
            ]);
        }

        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        $slotTaken = Booking::where('practitioner_id', $practitioner->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', $scheduledAt)
            ->exists();

        if ($slotTaken) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time was just booked — please choose another slot.',
            ]);
        }

        $price = (float) $service->pivot->price;
        $isGuest = $validated['client_type'] === 'guest';
        $type = $validated['type'] ?? Booking::TYPE_STANDARD;

        Booking::create([
            'client_id' => $isGuest ? null : $validated['client_id'],
            'guest_name' => $isGuest ? $validated['guest_name'] : null,
            'guest_email' => $isGuest ? ($validated['guest_email'] ?? null) : null,
            'guest_phone' => $isGuest ? ($validated['guest_phone'] ?? null) : null,
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'type' => $type,
            'emergency_category' => $type === Booking::TYPE_EMERGENCY ? $validated['emergency_category'] : null,
            'scheduled_at' => $scheduledAt,
            'status' => 'pending',
            'price' => $price,
            'platform_amount' => round($price * Booking::PLATFORM_SHARE, 2),
            'practitioner_amount' => round($price * (1 - Booking::PLATFORM_SHARE), 2),
            'client_note' => $validated['client_note'] ?? null,
        ]);

        return to_route('admin.bookings');
    }
}
