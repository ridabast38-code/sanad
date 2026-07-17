<?php

use App\Enums\UserRole;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\GoLiveSeeder;

test('the go-live seeder creates one admin and the global services', function () {
    $this->seed(GoLiveSeeder::class);

    $admin = User::where('email', 'bastjawad6@gmail.com')->sole();

    expect($admin->role)->toBe(UserRole::Admin)
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and($admin->onboarded_at)->not->toBeNull();

    // exactly the launch state: one user, the two global services, nothing else
    expect(User::count())->toBe(1)
        ->and(Service::where('is_active', true)->pluck('name')->sort()->values()->all())
        ->toBe(['Individual support session', 'Initial consultation']);
});

test('re-running the go-live seeder never overwrites the admin password', function () {
    $this->seed(GoLiveSeeder::class);

    $admin = User::where('email', 'bastjawad6@gmail.com')->sole();
    $admin->forceFill(['password' => bcrypt('the-owner-changed-this')])->save();
    $hashAfterChange = $admin->fresh()->password;

    // a second run (e.g. an accidental re-seed) must leave the chosen password intact
    $this->seed(GoLiveSeeder::class);

    expect(User::where('email', 'bastjawad6@gmail.com')->sole()->password)->toBe($hashAfterChange)
        ->and(User::count())->toBe(1);
});

test('an admin can create a practitioner and it appears in the directory', function () {
    $this->seed(GoLiveSeeder::class);
    $admin = User::where('email', 'bastjawad6@gmail.com')->sole();

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Real Practitioner',
        'email' => 'real@example.com',
        'password' => 'a-strong-password',
        'role' => 'practitioner',
    ])->assertRedirect(route('admin.practitioners'));

    $practitioner = User::where('email', 'real@example.com')->sole();

    expect($practitioner->role)->toBe(UserRole::Practitioner)
        ->and($practitioner->practitionerProfile->approval_status)->toBe('approved');

    // and they can price the seeded services from their profile page
    $this->actingAs($practitioner)->get('/practitioner/profile')->assertOk();
});
