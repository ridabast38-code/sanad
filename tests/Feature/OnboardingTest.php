<?php

use App\Models\User;

test('un-onboarded clients are redirected from the dashboard to onboarding', function () {
    $user = User::factory()->unonboarded()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect(route('onboarding.show', absolute: false));
});

test('the onboarding questionnaire can be rendered for un-onboarded clients', function () {
    $user = User::factory()->unonboarded()->create();

    $this->actingAs($user)
        ->get('/onboarding')
        ->assertOk();
});

test('already onboarded users are sent to the dashboard from onboarding', function () {
    $user = User::factory()->create(); // onboarded by default

    $this->actingAs($user)
        ->get('/onboarding')
        ->assertRedirect(route('dashboard', absolute: false));
});

test('submitting the questionnaire saves the profile and marks the user onboarded', function () {
    $user = User::factory()->unonboarded()->create();

    $response = $this->actingAs($user)->post('/onboarding', [
        'date_of_birth' => '1995-04-12',
        'gender' => 'female',
        'phone' => '+961 70 123 456',
        'support_reason' => 'I have been feeling anxious lately and would like some support.',
        'preferred_language' => 'english',
        'preferred_approach' => 'cbt',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $user->refresh();
    expect($user->hasCompletedOnboarding())->toBeTrue();
    expect($user->phone)->toBe('+961 70 123 456');
    expect($user->clientProfile)->not->toBeNull();
    expect($user->clientProfile->preferred_language)->toBe('english');
    expect($user->clientProfile->support_reason)->toContain('anxious');
});

test('the questionnaire requires the core fields', function () {
    $user = User::factory()->unonboarded()->create();

    $this->actingAs($user)
        ->post('/onboarding', [])
        ->assertSessionHasErrors(['date_of_birth', 'gender', 'phone', 'preferred_language']);

    expect($user->fresh()->hasCompletedOnboarding())->toBeFalse();
});

test('the paragraph and preferred approach are optional', function () {
    $user = User::factory()->unonboarded()->create();

    $this->actingAs($user)->post('/onboarding', [
        'date_of_birth' => '1990-01-01',
        'gender' => 'prefer_not_to_say',
        'phone' => '+961 71 000 000',
        'preferred_language' => 'arabic',
    ])->assertSessionHasNoErrors();

    $profile = $user->fresh()->clientProfile;
    expect($profile->preferred_approach)->toBeNull();
    expect($profile->support_reason)->toBeNull();
});
