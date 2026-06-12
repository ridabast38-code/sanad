<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

trait BuildsSpecialistDirectory
{
    /**
     * Approved practitioners shaped for the directory, soonest available first.
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
            ->with(['practitionerProfile', 'availabilities', 'services'])
            ->get()
            ->map(fn (User $practitioner) => $this->transformPractitioner($practitioner))
            ->sortBy('next_available_at')
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
        $upcomingSlots = $this->upcomingSlots($practitioner->availabilities);
        $nextSlot = $upcomingSlots->first();
        $fromPrice = $practitioner->services->min(fn ($service) => (float) $service->pivot->price);

        return [
            'id' => $practitioner->id,
            'name' => $practitioner->name,
            'headline' => $profile->headline,
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
        ];
    }

    /**
     * Concrete upcoming occurrences of the weekly availability windows (this
     * week and the next), soonest first.
     *
     * @param  Collection<int, Availability>  $availabilities
     * @return Collection<int, Carbon>
     */
    private function upcomingSlots($availabilities): Collection
    {
        $now = now();

        return $availabilities
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
            ->sort()
            ->values();
    }

    /**
     * The next bookable slots as concrete datetimes with display labels.
     *
     * @param  Collection<int, Availability>  $availabilities
     * @return array<int, array{iso: string, label: string}>
     */
    private function upcomingSlotOptions($availabilities, int $count = 6): array
    {
        return $this->upcomingSlots($availabilities)
            ->take($count)
            ->map(fn (Carbon $slot) => [
                'iso' => $slot->toIso8601String(),
                'label' => $slot->format('D, M j · g:i A'),
            ])
            ->values()
            ->all();
    }
}
