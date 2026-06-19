<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Models\Booking;
use App\Notifications\SessionRescheduledForClient;
use App\Notifications\SessionRescheduledForPractitioner;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingRescheduleController extends Controller
{
    use BuildsSpecialistDirectory;

    /**
     * Show the reschedule form: the current session plus the specialist's other
     * free times. An admin or the session's own practitioner may move it, and
     * only while it hasn't happened yet.
     */
    public function edit(Request $request, Booking $booking): Response
    {
        $this->authorizeReschedule($request, $booking);

        $booking->load(['practitioner.availabilities', 'service']);

        return Inertia::render('booking-reschedule', [
            'booking' => [
                'id' => $booking->id,
                'client' => $booking->clientName(),
                'practitioner' => $booking->practitioner->name,
                'service' => $booking->service->name,
                'current_label' => $booking->scheduled_at->format('l, M j, Y · g:i A'),
            ],
            'slots' => $this->upcomingSlotOptions($booking->practitioner),
            'backUrl' => $this->homeFor($request),
        ]);
    }

    /**
     * Move the session to another available time on the same specialist, keeping
     * its payment and status, then tell the client and practitioner.
     */
    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorizeReschedule($request, $booking);

        $validated = $request->validate([
            'scheduled_at' => ['required', 'string'],
        ]);

        $booking->load('practitioner.availabilities');
        $practitioner = $booking->practitioner;

        $offeredSlots = collect($this->upcomingSlotOptions($practitioner))->pluck('iso');

        if (! $offeredSlots->contains($validated['scheduled_at'])) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time is not available — please pick another slot.',
            ]);
        }

        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        // Don't let the new time collide with another live booking.
        $slotTaken = Booking::where('practitioner_id', $booking->practitioner_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('scheduled_at', $scheduledAt)
            ->where('id', '!=', $booking->id)
            ->exists();

        if ($slotTaken) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time was just booked — please choose another slot.',
            ]);
        }

        $booking->update(['scheduled_at' => $scheduledAt]);

        $booking->loadMissing(['client', 'practitioner', 'service']);

        $booking->notifyClient(new SessionRescheduledForClient($booking));
        $booking->practitioner->notify(new SessionRescheduledForPractitioner($booking));

        return redirect($this->homeFor($request));
    }

    /**
     * Only an admin or the session's own practitioner may reschedule, and only
     * a session that hasn't already happened.
     */
    private function authorizeReschedule(Request $request, Booking $booking): void
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $booking->practitioner_id === $user->id, 403);
        abort_unless(in_array($booking->status, ['pending', 'confirmed'], true), 404);
    }

    /**
     * Where to send the user back to — their own dashboard.
     */
    private function homeFor(Request $request): string
    {
        return $request->user()->isAdmin() ? route('admin.bookings') : route('practitioner.dashboard');
    }
}
