<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('invalid staff emails are returned to the form through inertia', function (string $email) {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->from(route('admin.practitioners'))
        ->post(route('admin.staff.store'), [
            'name' => 'Dr Lina Saad',
            'email' => $email,
            'password' => 'password123',
            'role' => 'practitioner',
        ])
        ->assertRedirect(route('admin.practitioners'))
        ->assertSessionHasErrors('email');

    $this->get(route('admin.practitioners'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/practitioners')
            ->has('errors.email'));

    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('practitioner_profiles', 0);
})->with(['missing' => '', 'malformed' => 'lina.example.com']);

test('an existing email returns an actionable error without creating another account', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $existing = User::factory()->create();

    $this->actingAs($admin)
        ->from(route('admin.practitioners'))
        ->post(route('admin.staff.store'), [
            'name' => 'Dr Lina Saad',
            'email' => $existing->email,
            'password' => 'password123',
            'role' => 'practitioner',
        ])
        ->assertRedirect(route('admin.practitioners'))
        ->assertSessionHasErrors(['email' => 'The email has already been taken.']);

    $this->assertDatabaseCount('users', 2);
    $this->assertDatabaseCount('practitioner_profiles', 0);
});

test('nested staff validation errors are shared with the form', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->from(route('admin.practitioners'))
        ->post(route('admin.staff.store'), [
            'name' => 'Dr Lina Saad',
            'email' => 'lina@example.com',
            'password' => 'password123',
            'role' => 'practitioner',
            'availability' => [['day_of_week' => 1, 'start_time' => 'invalid']],
        ])
        ->assertRedirect(route('admin.practitioners'))
        ->assertSessionHasErrors('availability.0.start_time');

    $this->get(route('admin.practitioners'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('errors', fn ($errors) => filled($errors['availability.0.start_time'] ?? null)));

    $this->assertDatabaseCount('users', 1);
});

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
