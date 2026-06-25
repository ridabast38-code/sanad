<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\NewBookingRequested;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * The public, no-login booking page for one psychologist. A visitor who
     * came from the landing page can pick a session and time, then choose to
     * create an account or simply continue as a guest — the same booking either
     * way, the account is only an invitation.
     */
    public function show(Request $request, User $practitioner): Response|RedirectResponse
    {
        abort_unless(
            $practitioner->role === UserRole::Practitioner
                && $practitioner->practitionerProfile?->approval_status === 'approved',
            404
        );

        // A signed-in client gets the richer in-app flow instead of the guest one.
        if ($request->user()?->isClient()) {
            return to_route('specialists.show', $practitioner);
        }

        $practitioner->load(['practitionerProfile', 'availabilities', 'services']);
        $profile = $practitioner->practitionerProfile;

        return Inertia::render('public/book', [
            'specialist' => [
                'id' => $practitioner->id,
                'slug' => $practitioner->slug,
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
            'slots' => $this->upcomingSlotOptions($practitioner),
        ]);
    }

    /**
     * Create a pending guest booking from the public page. It carries the
     * visitor's contact details (no account) and then follows the exact same
     * pipeline as every other booking: admins are notified and accept it once
     * the manual payment arrives.
     */
    public function store(Request $request, User $practitioner): RedirectResponse
    {
        abort_unless(
            $practitioner->role === UserRole::Practitioner
                && $practitioner->practitionerProfile?->approval_status === 'approved',
            404
        );

        $validated = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'scheduled_at' => ['required', 'string'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:50'],
            'client_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $practitioner->load(['availabilities', 'services']);

        $service = $practitioner->services->firstWhere('id', (int) $validated['service_id']);

        if (! $service) {
            throw ValidationException::withMessages([
                'service_id' => 'This specialist does not offer that service.',
            ]);
        }

        $offeredSlots = collect($this->upcomingSlotOptions($practitioner))->pluck('iso');

        if (! $offeredSlots->contains($validated['scheduled_at'])) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time is no longer available — please pick another slot.',
            ]);
        }

        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        // Guard against two people racing for the same slot.
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

        $booking = Booking::create([
            'public_token' => (string) Str::uuid(),
            'client_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'],
            'guest_phone' => $validated['guest_phone'],
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'type' => Booking::TYPE_STANDARD,
            'scheduled_at' => $scheduledAt,
            'status' => 'pending',
            'price' => $price,
            'platform_amount' => round($price * Booking::PLATFORM_SHARE, 2),
            'practitioner_amount' => round($price * (1 - Booking::PLATFORM_SHARE), 2),
            'client_note' => $validated['client_note'] ?? null,
        ]);

        // Same alert admins already get for every booking awaiting payment.
        $admins = User::where('role', UserRole::Admin)->get();
        Notification::send($admins, new NewBookingRequested($booking));

        return to_route('book.confirmed', $booking->public_token);
    }

    /**
     * The guest's own payment page, reachable only with their booking's
     * unguessable token. Shows how to pay (manual Whish / OMT) and gently
     * invites them to create an account to keep track of this session.
     */
    public function confirmed(string $token): Response
    {
        $booking = Booking::where('public_token', $token)->firstOrFail();
        $booking->load(['practitioner', 'service']);

        $methods = collect(config('payments.methods'))
            ->filter(fn (array $method) => filled($method['number']))
            ->map(fn (array $method) => [
                'key' => $method['key'],
                'label' => $method['label'],
                'number' => $method['number'],
                'account_name' => $method['account_name'],
                'instructions' => $method['instructions'],
            ])
            ->values()
            ->all();

        return Inertia::render('public/booking-confirmed', [
            'booking' => [
                'reference' => 'SANAD-'.str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT),
                'guest_name' => $booking->guest_name,
                'guest_email' => $booking->guest_email,
                'practitioner_name' => $booking->practitioner->name,
                'service_name' => $booking->service->name,
                'scheduled_label' => $booking->scheduled_at->format('l, M j, Y · g:i A'),
                'price' => (float) $booking->price,
                'is_paid' => $booking->payment_status === 'paid',
            ],
            'methods' => $methods,
        ]);
    }
}
