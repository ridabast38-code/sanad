<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Notifications\MeetingLinkReady;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MeetingLinkController extends Controller
{
    /**
     * Add or update the video meeting link for a booking. Both an admin and the
     * session's own practitioner may set it. When a link is added to a confirmed
     * session for the first time, the client is told their join link is ready.
     */
    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $booking->practitioner_id === $user->id, 403);

        $validated = $request->validate([
            'meeting_link' => ['nullable', 'url', 'max:2048'],
        ]);

        $link = $validated['meeting_link'] ?: null;
        $isNewLink = $link && blank($booking->meeting_link);

        $booking->update(['meeting_link' => $link]);

        if ($isNewLink && $booking->status === 'confirmed') {
            $booking->loadMissing(['client', 'practitioner', 'service']);
            $booking->notifyClient(new MeetingLinkReady($booking));
        }

        return back();
    }
}
