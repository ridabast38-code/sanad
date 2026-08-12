<?php

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the client home lists approved practitioners with their next available slot', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Anxiety & stress support',
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
        'gender' => 'female',
        'years_experience' => 7,
    ]);

    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);
    // One window yields one slot — only its next occurrence is offered, never
    // the same time a week later — so two days are needed for two next_slots.
    foreach ([1, 4] as $day) {
        Availability::factory()->for($practitioner, 'practitioner')->create([
            'day_of_week' => $day,
            'start_time' => '17:00',
            'end_time' => '20:00',
        ]);
    }

    $client = User::factory()->create(); // onboarded client by default

    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('client/home')
            ->has('practitioners', 1)
            ->where('practitioners.0.name', $practitioner->name)
            ->where('practitioners.0.from_price', 40)
            ->where('practitioners.0.approaches', ['cbt'])
            ->whereNot('practitioners.0.next_available_label', null)
            ->has('practitioners.0.next_slots', 2)
            ->where('upcomingSession', null)
            ->where('stats.upcoming', 0)
            ->where('stats.completed', 0)
        );
});

test('pending practitioners are hidden from the directory', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Not yet approved',
        'approval_status' => 'pending',
    ]);

    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('practitioners', 0));
});
