<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\BuildsSpecialistDirectory;
use App\Http\Controllers\Controller;
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
     * free times. Only sessions that haven't happened yet can be moved.
     */
    public function edit(Booking $booking): Response
    {
        abort_unless(in_array($booking->status, ['pending', 'confirmed'], true), 404);

        $booking->load(['practitioner.availabilities', 'service']);

        return Inertia::render('admin/booking-reschedule', [
            'booking' => [
                'id' => $booking->id,
                'client' => $booking->clientName(),
                'practitioner' => $booking->practitioner->name,
                'service' => $booking->service->name,
                'current_label' => $booking->scheduled_at->format('l, M j, Y · g:i A'),
            ],
            'slots' => $this->upcomingSlotOptions($booking->practitioner),
        ]);
    }

    /**
     * Move the session to another available time on the same specialist, keeping
     * its payment and status, then tell the client and practitioner.
     */
    public function update(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless(in_array($booking->status, ['pending', 'confirmed'], true), 404);

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

        $this->persistWithoutSlotCollision(fn () => $booking->update(['scheduled_at' => $scheduledAt]));

        $booking->loadMissing(['client', 'practitioner', 'service']);

        $booking->notifyClient(new SessionRescheduledForClient($booking));
        $booking->practitioner->notify(new SessionRescheduledForPractitioner($booking));

        return to_route('admin.bookings');
    }
}
