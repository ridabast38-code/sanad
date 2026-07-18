<?php

use App\Enums\UserRole;
use App\Models\PractitionerProfile;
use App\Models\User;

test('the command lists approaches without changing them by default', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id, 'approaches' => ['cbt']]);

    $this->artisan('practitioners:approaches')->assertSuccessful();

    expect($practitioner->practitionerProfile->refresh()->approaches)->toBe(['cbt']);
});

test('the --clear flag blanks every practitioner approaches', function () {
    $a = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $a->id, 'approaches' => ['cbt', 'emdr', 'psychoanalysis']]);
    $b = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $b->id, 'approaches' => ['emdr']]);

    $this->artisan('practitioners:approaches --clear')->assertSuccessful();

    expect($a->practitionerProfile->refresh()->approaches)->toBe([])
        ->and($b->practitionerProfile->refresh()->approaches)->toBe([]);
});
