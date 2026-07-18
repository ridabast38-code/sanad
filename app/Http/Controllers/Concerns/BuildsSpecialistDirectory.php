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
     * Concrete upcoming occurrences of the weekly availability windows (this
     * week and the next), soonest first — with any slots that are already
     * booked removed, so a time is never offered twice.
     *
     * @return Collection<int, Carbon>
     */
    private function upcomingSlots(User $practitioner): Collection
    {
        $now = now();
        $bookedTimestamps = $this->bookedTimestamps($practitioner);

        return $practitioner->availabilities
            ->flatMap(function ($availability) use ($now) {
                $daysAhead = ($availability->day_of_week - $now->dayOfWeek + 7) % 7;

                $candidate = $now->copy()
                    ->addDays($daysAhead)
                    ->setTimeFromTimeString($availability->start_time);

                if ($candidate->isPast()) {
                    $candidate->addWeek();
                }

                return [$candidate, $candidate->copy()->addWeek()];
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
     * @return array<int, array{iso: string, label: string}>
     */
    private function upcomingSlotOptions(User $practitioner, int $count = 6): array
    {
        return $this->upcomingSlots($practitioner)
            ->take($count)
            ->map(fn (Carbon $slot) => [
                'iso' => $slot->toIso8601String(),
                'label' => $slot->format('D, M j · g:i A'),
            ])
            ->values()
            ->all();
    }
}
