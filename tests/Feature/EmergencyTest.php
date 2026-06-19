<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('a client can open the emergency entry screen', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('emergency.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('emergency/index')
            ->has('flows')
            ->has('safety.whatsapp_url')
            ->has('safety.hotlines')
        );
});

test('a client can open a guided flow for a known trauma type', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('emergency.show', 'accident'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('emergency/flow')
            ->where('flow.key', 'accident')
            ->where('flow.phase', 'acute')
            ->has('flow.intro')
            ->has('flow.check.options')
            ->has('flow.paths')
        );
});

test('an unknown trauma type sends the visitor back to the emergency menu', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('emergency.show', 'not-a-real-flow'))
        ->assertRedirect(route('emergency.index'));
});

test('the emergency screens are public so an unregistered visitor can get help', function () {
    $this->get(route('emergency.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('emergency/index')->has('flows'));

    $this->get(route('emergency.show', 'accident'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('emergency/flow')->where('flow.key', 'accident'));
});

test('all four trauma flows are available', function () {
    $client = User::factory()->create();

    foreach (['accident', 'war', 'grief', 'disaster'] as $type) {
        $this->actingAs($client)
            ->get(route('emergency.show', $type))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('emergency/flow')
                ->where('flow.key', $type)
                ->has('flow.paths')
            );
    }
});

test('the emergency whatsapp link uses the configured number', function () {
    config(['sanad.whatsapp' => '96170123456']);
    $client = User::factory()->create();

    $url = $this->actingAs($client)
        ->get(route('emergency.index'))
        ->viewData('page')['props']['safety']['whatsapp_url'];

    expect($url)->toStartWith('https://wa.me/96170123456');
});

test('an admin can create an emergency booking with a category', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($admin)->get(route('admin.bookings.create'))->viewData('page');
    $option = collect($page['props']['practitioners'])->firstWhere('id', $practitioner->id);

    $this->actingAs($admin)->post(route('admin.bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $option['services'][0]['id'],
        'scheduled_at' => $option['slots'][0]['iso'],
        'client_type' => 'registered',
        'client_id' => $client->id,
        'type' => 'emergency',
        'emergency_category' => 'accident',
    ])->assertRedirect(route('admin.bookings'));

    $booking = Booking::sole();
    expect($booking->type)->toBe('emergency')
        ->and($booking->emergency_category)->toBe('accident')
        ->and($booking->isEmergency())->toBeTrue();
});

test('an emergency booking requires a valid category', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($admin)->get(route('admin.bookings.create'))->viewData('page');
    $option = collect($page['props']['practitioners'])->firstWhere('id', $practitioner->id);

    $this->actingAs($admin)->post(route('admin.bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $option['services'][0]['id'],
        'scheduled_at' => $option['slots'][0]['iso'],
        'client_type' => 'registered',
        'client_id' => $client->id,
        'type' => 'emergency',
    ])->assertSessionHasErrors('emergency_category');

    expect(Booking::count())->toBe(0);
});

test('a manual booking defaults to the standard type', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = makeBookablePractitioner();
    $client = User::factory()->create();

    $page = $this->actingAs($admin)->get(route('admin.bookings.create'))->viewData('page');
    $option = collect($page['props']['practitioners'])->firstWhere('id', $practitioner->id);

    $this->actingAs($admin)->post(route('admin.bookings.store'), [
        'practitioner_id' => $practitioner->id,
        'service_id' => $option['services'][0]['id'],
        'scheduled_at' => $option['slots'][0]['iso'],
        'client_type' => 'registered',
        'client_id' => $client->id,
    ])->assertRedirect(route('admin.bookings'));

    expect(Booking::sole()->type)->toBe('standard');
});
