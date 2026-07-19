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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * The platform's share of every booking (the rest goes to the practitioner).
     */
    private const PLATFORM_SHARE = Booking::PLATFORM_SHARE;

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

        $offeredSlots = collect($this->upcomingSlotOptions($practitioner))->pluck('iso');

        if (! $offeredSlots->contains($validated['scheduled_at'])) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time is no longer available — please pick another slot.',
            ]);
        }

        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        // Guard against two clients racing for the same slot: never let an
        // already-booked time be taken again.
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

        $booking = $this->persistWithoutSlotCollision(fn () => Booking::create([
            'client_id' => $request->user()->id,
            'practitioner_id' => $practitioner->id,
            'service_id' => $service->id,
            'scheduled_at' => $scheduledAt,
            'status' => 'pending',
            'price' => $price,
            'platform_amount' => round($price * self::PLATFORM_SHARE, 2),
            'practitioner_amount' => round($price * (1 - self::PLATFORM_SHARE), 2),
            'client_note' => $validated['client_note'] ?? null,
        ]));

        // Let every admin know a session was booked and is awaiting payment.
        $admins = User::where('role', UserRole::Admin)->get();
        Notification::send($admins, new NewBookingRequested($booking));

        return to_route('bookings.pay', $booking);
    }

    /**
     * Show the client how to pay for a booking they just made (manual Whish /
     * OMT transfer). Only the booking's own client may view it, and only while
     * it is still awaiting payment.
     */
    public function pay(Request $request, Booking $booking): Response|RedirectResponse
    {
        abort_unless($booking->client_id === $request->user()->id, 403);

        if ($booking->payment_status === 'paid' || $booking->status !== 'pending') {
            return to_route('dashboard');
        }

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

        $reference = 'SANAD-'.str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT);

        return Inertia::render('client/booking-payment', [
            'booking' => [
                'id' => $booking->id,
                'reference' => $reference,
                'practitioner_name' => $booking->practitioner->name,
                'service_name' => $booking->service->name,
                'scheduled_label' => $booking->scheduled_at->format('l, M j, Y · g:i A'),
                'price' => (float) $booking->price,
            ],
            'methods' => $methods,
            'whatsappUrl' => $this->paymentSupportWhatsappUrl($reference),
        ]);
    }
}
