<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\UserRole;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

trait BuildsSpecialistDirectory
{
    /**
     * Persist a booking (create or reschedule) so that if two requests race for
     * the same slot and both clear the in-app availability check, the loser is
     * turned away with a friendly message rather than a 500.
     *
     * The unique (practitioner_id, slot_hold) index is the real guard — this only
     * translates the database's rejection into the same validation error the
     * pre-flight check already raises, so the two paths are indistinguishable to
     * the client.
     *
     * @template TResult
     *
     * @param  callable(): TResult  $persist
     * @return TResult
     */
    private function persistWithoutSlotCollision(callable $persist)
    {
        try {
            return $persist();
        } catch (QueryException $exception) {
            if (str_contains($exception->getMessage(), 'bookings_practitioner_slot_unique')) {
                throw ValidationException::withMessages([
                    'scheduled_at' => 'That time was just booked — please choose another slot.',
                ]);
            }

            throw $exception;
        }
    }

    /**
     * Approved practitioners shaped for the directory, in a fresh random order.
     *
     * Shuffled on every request, exactly like the landing team section: any fixed
     * order is a ranking, and whoever sat at the top would own it. Sorting by
     * soonest-available was quietly doing that — a practitioner with wide-open
     * availability lived permanently first. Each card still shows its own next
     * slot, so "soonest" is visible per person without being the page's spine.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function specialistDirectory(): Collection
    {
        return User::query()
            ->where('role', UserRole::Practitioner)
            ->whereHas('practitionerProfile', function ($query) {
                $query->where('approval_status', 'approved');
            })
            ->with(['practitionerProfile', 'availabilities', 'services', 'practitionerBookings' => function ($query) {
                $query->whereIn('status', ['pending', 'confirmed'])->where('scheduled_at', '>=', now());
            }])
            ->get()
            ->map(fn (User $practitioner) => $this->transformPractitioner($practitioner))
            ->shuffle()
            ->values();
    }

    /**
     * Shape a practitioner record for the directory card.
     *
     * @return array<string, mixed>
     */
    private function transformPractitioner(User $practitioner): array
    {
        $profile = $practitioner->practitionerProfile;
        $upcomingSlots = $this->upcomingSlots($practitioner);
        $nextSlot = $upcomingSlots->first();
        $fromPrice = $practitioner->services->min(fn ($service) => (float) $service->pivot->price);

        return [
            'id' => $practitioner->id,
            // the public directory links by slug (book/{practitioner:slug}); the
            // in-app one links by id — both flows read this same payload
            'slug' => $practitioner->slug,
            'name' => $practitioner->name,
            'headline' => $profile->headline,
            'bio' => $profile->bio,
            'photo_path' => $profile->photo_path,
            'approaches' => $profile->approaches ?? [],
            'languages' => $profile->languages ?? [],
            'gender' => $profile->gender,
            'years_experience' => $profile->years_experience,
            'from_price' => $fromPrice,
            'next_available_label' => $nextSlot?->format('D, M j · g:i A'),
            'next_available_at' => $nextSlot?->toIso8601String(),
            'next_slots' => $upcomingSlots
                ->take(3)
                ->map(fn (Carbon $slot) => $slot->format('D · g:i A'))
                ->values()
                ->all(),
            'slot_periods' => $this->slotPeriods($upcomingSlots),
        ];
    }

    /**
     * Which parts of the day this practitioner actually has slots in.
     *
     * The directory's timing filter needs to compare against something structured,
     * and `next_slots` is already formatted for display — re-parsing a human string
     * like "Mon · 9:00 AM" in the browser would be both fragile and locale-bound.
     * Bucketing here keeps the filter honest and costs nothing extra.
     *
     * @param  Collection<int, Carbon>  $slots
     * @return array<int, string>
     */
    private function slotPeriods(Collection $slots): array
    {
        return $slots
            ->map(fn (Carbon $slot) => match (true) {
                $slot->hour < 12 => 'morning',
                $slot->hour < 17 => 'afternoon',
                default => 'evening',
            })
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Concrete upcoming occurrences of the weekly availability windows — the
     * NEXT one of each, soonest first, with already-booked times removed so a
     * slot is never offered twice.
     *
     * The weekly windows repeat forever, but only one turn of the week is ever
     * offered. This used to return each window twice, this week's occurrence
     * and the same time seven days later, which is what put "Thu 14 Aug 5:00 PM"
     * and "Thu 21 Aug 5:00 PM" side by side in the client's list. The repeat is
     * how the schedule is stored, not something a client needs to see: it made
     * the list twice as long while saying nothing new, and it quietly promised
     * a date three weeks of life could easily invalidate.
     *
     * `$daysAhead` is 0-6, and the only candidate that can already be past is
     * today's, so the horizon here is exactly one week.
     *
     * @return Collection<int, Carbon>
     */
    private function upcomingSlots(User $practitioner): Collection
    {
        $now = now();
        $bookedTimestamps = $this->bookedTimestamps($practitioner);

        return $practitioner->availabilities
            ->map(function ($availability) use ($now) {
                $daysAhead = ($availability->day_of_week - $now->dayOfWeek + 7) % 7;

                $candidate = $now->copy()
                    ->addDays($daysAhead)
                    ->setTimeFromTimeString($availability->start_time);

                if ($candidate->isPast()) {
                    $candidate->addWeek();
                }

                return $candidate;
            })
            ->reject(fn (Carbon $slot) => in_array($slot->getTimestamp(), $bookedTimestamps, true))
            ->sort()
            ->values();
    }

    /**
     * The start times of the practitioner's still-active future sessions, so
     * already-booked slots are filtered out of what we offer.
     *
     * @return array<int, int>
     */
    private function bookedTimestamps(User $practitioner): array
    {
        $bookings = $practitioner->relationLoaded('practitionerBookings')
            ? $practitioner->practitionerBookings
            : $practitioner->practitionerBookings()
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('scheduled_at', '>=', now())
                ->get();

        return $bookings
            ->map(fn ($booking) => $booking->scheduled_at->getTimestamp())
            ->all();
    }

    /**
     * The next bookable slots as concrete datetimes with display labels.
     *
     * `label` is the whole thing on one line, for the admin's select menus.
     * The client's picker groups by day instead, so it gets the pieces already
     * split and named here — formatting a date in the browser would drift with
     * the visitor's locale and put "14/08" in front of some clients and
     * "08/14" in front of others.
     *
     * The cap is generous because a week of windows is short by construction;
     * it exists to stop a pathological schedule from flooding the page.
     *
     * @return array<int, array{iso: string, label: string, day: string, day_label: string, date_label: string, time_label: string}>
     */
    private function upcomingSlotOptions(User $practitioner, int $count = 30): array
    {
        return $this->upcomingSlots($practitioner)
            ->take($count)
            ->map(fn (Carbon $slot) => [
                'iso' => $slot->toIso8601String(),
                'label' => $slot->format('D, M j · g:i A'),
                'day' => $slot->toDateString(),
                'day_label' => match (true) {
                    $slot->isToday() => 'Today',
                    $slot->isTomorrow() => 'Tomorrow',
                    default => $slot->format('l'),
                },
                'date_label' => $slot->format('j M'),
                'time_label' => $slot->format('g:i A'),
            ])
            ->values()
            ->all();
    }
}
