<?php

use App\Models\User;
use App\Support\StabilizationFlows;
use Inertia\Testing\AssertableInertia;

test('the ongoing-support entry lists the four full guided flows', function () {
    $this->get(route('ongoing.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('ongoing/index')
            ->has('flows', 4)
            ->has('safety.whatsapp_url')
            ->has('safety.hotlines')
        );
});

test('a visitor can open a full ongoing flow for each situation', function () {
    foreach (['accident', 'war', 'grief', 'disaster'] as $type) {
        $this->get(route('ongoing.show', $type))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ongoing/flow')
                ->where('flow.key', $type)
                ->has('flow.intro')
                ->has('flow.check.options')
                ->has('flow.paths')
            );
    }
});

test('the ongoing screens are public so an unregistered visitor can use them', function () {
    $this->get(route('ongoing.index'))->assertOk();
    $this->get(route('ongoing.show', 'grief'))->assertOk();
});

test('the emergency first-aid flow is not reachable as an ongoing situation', function () {
    $this->get(route('ongoing.show', 'emergency'))->assertRedirect(route('ongoing.index'));
});

test('an unknown ongoing situation redirects back to the menu', function () {
    $this->get(route('ongoing.show', 'not-a-real-flow'))->assertRedirect(route('ongoing.index'));
});

test('every feeling option in every ongoing flow maps to a real path', function () {
    foreach (['accident', 'war', 'grief', 'disaster'] as $type) {
        $flow = StabilizationFlows::find($type);

        foreach ($flow['check']['options'] as $option) {
            expect($flow['paths'])->toHaveKey($option['key']);
        }
    }
});

test('a signed-in client can also reach the ongoing flows', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('ongoing.show', 'war'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('ongoing/flow')->where('flow.key', 'war'));
});
