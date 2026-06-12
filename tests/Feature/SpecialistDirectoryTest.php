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
            ->has('preferences')
        );
});

test('guests cannot view the specialists page', function () {
    $this->get(route('specialists.index'))->assertRedirect(route('login'));
});
