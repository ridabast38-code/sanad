<?php

use App\Enums\UserRole;
use App\Models\PractitionerProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

test('an admin can open a practitioner editor', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id]);

    $this->actingAs($admin)
        ->get(route('admin.practitioners.edit', $practitioner))
        ->assertOk();
});

test('an admin can update a practitioner profile, pricing and availability', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner, 'name' => 'Old Name']);
    PractitionerProfile::factory()->create([
        'user_id' => $practitioner->id,
        'headline' => 'Old headline',
        'approaches' => ['cbt'],
    ]);
    $service = Service::factory()->create();
    $originalPassword = $practitioner->password;

    $this->actingAs($admin)->post(route('admin.practitioners.update', $practitioner), [
        'name' => 'New Name',
        'email' => $practitioner->email,
        'password' => '',
        'headline' => 'New headline',
        'bio' => 'An updated, warmer bio.',
        'gender' => 'female',
        'years_experience' => 9,
        'approaches' => ['cbt', 'emdr'],
        'languages' => ['english'],
        'services' => [['id' => $service->id, 'price' => 150]],
        'availability' => [['day_of_week' => 1, 'start_time' => '17:00', 'end_time' => '20:00']],
    ])->assertRedirect(route('admin.practitioners'));

    $practitioner->refresh();
    $profile = $practitioner->practitionerProfile;

    expect($practitioner->name)->toBe('New Name')
        // a blank password field must leave the existing password untouched
        ->and($practitioner->password)->toBe($originalPassword)
        ->and($profile->headline)->toBe('New headline')
        ->and($profile->bio)->toBe('An updated, warmer bio.')
        ->and($profile->approaches)->toBe(['cbt', 'emdr'])
        ->and($profile->languages)->toBe(['english'])
        ->and((float) $practitioner->services()->find($service->id)->pivot->price)->toBe(150.0)
        ->and($practitioner->availabilities()->count())->toBe(1);
});

test('a new password is applied only when provided', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id]);

    $this->actingAs($admin)->post(route('admin.practitioners.update', $practitioner), [
        'name' => $practitioner->name,
        'email' => $practitioner->email,
        'password' => 'a-brand-new-password',
    ])->assertRedirect(route('admin.practitioners'));

    expect(Hash::check('a-brand-new-password', $practitioner->refresh()->password))->toBeTrue();
});

test('editing replaces the full weekly availability set', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id]);
    $practitioner->availabilities()->create(['day_of_week' => 0, 'start_time' => '09:00', 'end_time' => '12:00']);

    $this->actingAs($admin)->post(route('admin.practitioners.update', $practitioner), [
        'name' => $practitioner->name,
        'email' => $practitioner->email,
        'availability' => [
            ['day_of_week' => 2, 'start_time' => '16:00', 'end_time' => '19:00'],
            ['day_of_week' => 4, 'start_time' => '10:00', 'end_time' => '13:00'],
        ],
    ])->assertRedirect(route('admin.practitioners'));

    $windows = $practitioner->availabilities()->orderBy('day_of_week')->get();
    expect($windows)->toHaveCount(2)
        ->and($windows->pluck('day_of_week')->all())->toBe([2, 4]);
});

test('an admin can replace a practitioner photo', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id, 'photo_path' => null]);

    $this->actingAs($admin)->post(route('admin.practitioners.update', $practitioner), [
        'name' => $practitioner->name,
        'email' => $practitioner->email,
        'photo' => UploadedFile::fake()->create('new.jpg', 200, 'image/jpeg'),
    ])->assertRedirect(route('admin.practitioners'));

    $photoPath = $practitioner->refresh()->practitionerProfile->photo_path;
    expect($photoPath)->toStartWith('/storage/practitioners/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $photoPath));
});

test('a non-admin cannot open the practitioner editor', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    PractitionerProfile::factory()->create(['user_id' => $practitioner->id]);

    $this->actingAs($practitioner)
        ->get(route('admin.practitioners.edit', $practitioner))
        ->assertRedirect();
});
