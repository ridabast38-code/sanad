<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Creates an approved practitioner, eligible for the landing team cards.
 */
function approvedSpecialist(string $name): User
{
    $practitioner = User::factory()->create([
        'name' => $name,
        'role' => UserRole::Practitioner,
    ]);

    $practitioner->practitionerProfile()->create([
        'approval_status' => 'approved',
        'approaches' => ['cbt'],
        'languages' => ['english'],
    ]);

    return $practitioner;
}

test('the landing page shows every approved specialist', function () {
    approvedSpecialist('Dr Hanna');
    approvedSpecialist('Dr Sireen');

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('home')
            ->has('specialists', 2)
            ->has('whatsappUrl')
        );
});

test('the landing page hides practitioners who are not approved', function () {
    approvedSpecialist('Dr Hanna');

    $pending = User::factory()->create(['role' => UserRole::Practitioner]);
    $pending->practitionerProfile()->create(['approval_status' => 'pending']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('specialists', 1)
            ->where('specialists.0.name', 'Dr Hanna')
        );
});

/**
 * The team order must not be a ranking. With a fixed order the first-approved
 * practitioner would sit at the top of the landing page forever, and whoever
 * joined last would be permanently last — a real problem once there are twenty
 * of them.
 *
 * Ten requests across eight specialists: were the order fixed, the same name
 * would lead every time. A genuine shuffle doing that by chance is (1/8)^9,
 * roughly one in a billion, so this will not flake.
 */
test('the team order is reshuffled on every request', function () {
    foreach (range(1, 8) as $i) {
        approvedSpecialist("Dr Specialist {$i}");
    }

    $leaders = collect(range(1, 10))->map(
        fn () => $this->get(route('home'))->viewData('page')['props']['specialists'][0]['name']
    );

    expect($leaders->unique()->count())->toBeGreaterThan(1);
});
