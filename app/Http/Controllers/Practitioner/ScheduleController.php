<?php

namespace App\Http\Controllers\Practitioner;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Show the practitioner's weekly availability windows.
     */
    public function edit(Request $request): Response
    {
        $windows = $request->user()->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn (Availability $window) => [
                'id' => $window->id,
                'day_of_week' => $window->day_of_week,
                'start_time' => substr((string) $window->start_time, 0, 5),
                'end_time' => substr((string) $window->end_time, 0, 5),
            ]);

        return Inertia::render('practitioner/schedule', ['windows' => $windows]);
    }

    /**
     * Replace the practitioner's availability windows with the submitted set.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'windows' => ['present', 'array'],
            'windows.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'windows.*.start_time' => ['required', 'date_format:H:i'],
            'windows.*.end_time' => ['required', 'date_format:H:i', 'after:windows.*.start_time'],
        ]);

        $user = $request->user();

        $user->availabilities()->delete();

        foreach ($validated['windows'] as $window) {
            $user->availabilities()->create([
                'day_of_week' => $window['day_of_week'],
                'start_time' => $window['start_time'],
                'end_time' => $window['end_time'],
            ]);
        }

        return to_route('practitioner.schedule.edit');
    }
}
