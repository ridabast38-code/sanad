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

test('an admin can create a fully set-up, bookable practitioner in one step', function () {
    $this->seed(GoLiveSeeder::class);
    $admin = User::where('email', 'bastjawad6@gmail.com')->sole();
    $individual = Service::where('name', 'Individual support session')->sole();

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Real Practitioner',
        'email' => 'real@example.com',
        'password' => 'a-strong-password',
        'role' => 'practitioner',
        'headline' => 'Warm, practical support',
        'bio' => 'A longer description of how they work.',
        'gender' => 'female',
        'years_experience' => 8,
        'approaches' => ['cbt', 'emdr'],
        'languages' => ['arabic', 'english'],
        'services' => [['id' => $individual->id, 'price' => 45]],
        'availability' => [['day_of_week' => 1, 'start_time' => '17:00', 'end_time' => '20:00']],
    ])->assertRedirect(route('admin.practitioners'));

    $practitioner = User::where('email', 'real@example.com')->sole();
    $profile = $practitioner->practitionerProfile;

    expect($practitioner->role)->toBe(UserRole::Practitioner)
        ->and($profile->approval_status)->toBe('approved')
        ->and($profile->headline)->toBe('Warm, practical support')
        ->and($profile->bio)->toBe('A longer description of how they work.')
        ->and($profile->approaches)->toBe(['cbt', 'emdr'])
        ->and($profile->languages)->toBe(['arabic', 'english'])
        ->and($profile->years_experience)->toBe(8)
        ->and((float) $practitioner->services()->where('services.id', $individual->id)->first()->pivot->price)->toBe(45.0)
        ->and($practitioner->availabilities()->count())->toBe(1);

    // fully set up = they show in the public directory straight away
    $this->get(route('psychologists'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('practitioners.0.name', 'Dr Real Practitioner'));

    // and they can reach their own profile (email is verified — not bounced to /verify-email)
    $this->actingAs($practitioner)->get('/practitioner/profile')->assertOk();
});

test('a practitioner created with only login fields still works', function () {
    $this->seed(GoLiveSeeder::class);
    $admin = User::where('email', 'bastjawad6@gmail.com')->sole();

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Minimal',
        'email' => 'minimal@example.com',
        'password' => 'a-strong-password',
        'role' => 'practitioner',
    ])->assertRedirect(route('admin.practitioners'));

    $practitioner = User::where('email', 'minimal@example.com')->sole();

    // approved, but with no availability they aren't bookable yet — that's fine
    expect($practitioner->practitionerProfile->approval_status)->toBe('approved')
        ->and($practitioner->availabilities()->count())->toBe(0);
    $this->actingAs($practitioner)->get('/practitioner/profile')->assertOk();
});
