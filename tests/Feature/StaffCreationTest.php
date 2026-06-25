<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('an admin can create a practitioner with a photo', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Lina Saad',
        'email' => 'lina@example.com',
        'password' => 'password123',
        'role' => 'practitioner',
        'photo' => UploadedFile::fake()->create('lina.jpg', 200, 'image/jpeg'),
    ])->assertRedirect(route('admin.practitioners'));

    $practitioner = User::where('email', 'lina@example.com')->sole();
    $profile = $practitioner->practitionerProfile;

    expect($practitioner->isPractitioner())->toBeTrue()
        ->and($profile->approval_status)->toBe('approved')
        ->and($profile->photo_path)->toStartWith('/storage/practitioners/');

    $relativePath = str_replace('/storage/', '', $profile->photo_path);
    Storage::disk('public')->assertExists($relativePath);
});

test('a practitioner can be created without a photo', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Omar Khoury',
        'email' => 'omar@example.com',
        'password' => 'password123',
        'role' => 'practitioner',
    ])->assertRedirect(route('admin.practitioners'));

    $profile = User::where('email', 'omar@example.com')->sole()->practitionerProfile;

    expect($profile->approval_status)->toBe('approved')
        ->and($profile->photo_path)->toBeNull();
});

test('the photo must be an image', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)->post(route('admin.staff.store'), [
        'name' => 'Dr Bad Upload',
        'email' => 'bad@example.com',
        'password' => 'password123',
        'role' => 'practitioner',
        'photo' => UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('photo');

    expect(User::where('email', 'bad@example.com')->exists())->toBeFalse();
});
