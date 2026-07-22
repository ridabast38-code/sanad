<?php

use App\Enums\UserRole;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the specialists page lists approved practitioners', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Anxiety & stress support',
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('specialists.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('client/specialists')
            ->has('practitioners', 1)
            ->where('practitioners.0.name', $practitioner->name)
        );
});

test('guests cannot view the specialists page', function () {
    $this->get(route('specialists.index'))->assertRedirect(route('login'));
});

test('the public directory lists approved practitioners to a guest', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'headline' => 'Anxiety & stress support',
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    $this->get(route('psychologists'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/specialists')
            ->has('practitioners', 1)
            ->where('practitioners.0.name', $practitioner->name)
            // the cards link to the guest booking page, which is keyed by slug
            ->where('practitioners.0.slug', $practitioner->slug)
        );
});

test('the public directory hides practitioners who are not approved', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'approval_status' => 'pending',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    $this->get(route('psychologists'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('public/specialists')->has('practitioners', 0));
});

test('a signed-in client is sent to the in-app directory instead of the public one', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('psychologists'))
        ->assertRedirect(route('specialists.index'));
});

test('the directory exposes the parts of the day each practitioner has slots in', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $practitioner->practitionerProfile()->create([
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);
    // 9am on every weekday — a morning-only practitioner, so the timing filter
    // must see 'morning' and nothing else
    foreach (range(0, 6) as $day) {
        $practitioner->availabilities()->create([
            'day_of_week' => $day,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ]);
    }

    $this->get(route('psychologists'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('practitioners.0.slot_periods', ['morning'])
        );
});
