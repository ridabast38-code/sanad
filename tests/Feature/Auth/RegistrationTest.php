<?php

use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\CompleteRegistration;
use App\Notifications\ExistingAccountNotice;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('signing up creates a pending registration and emails a link — no account yet', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // No real account is created until the link is clicked.
    $this->assertGuest();
    expect(User::where('email', 'test@example.com')->exists())->toBeFalse()
        ->and(PendingRegistration::where('email', 'test@example.com')->exists())->toBeTrue();

    $response->assertRedirect(route('register.pending'));

    Notification::assertSentOnDemand(CompleteRegistration::class);
});

test('confirming the emailed link creates the account, verified, and signs in', function () {
    $pending = PendingRegistration::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => Hash::make('password'),
        'token' => 'a-valid-token',
    ]);

    $response = $this->get(route('register.confirm', $pending->token));

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->sole();

    expect($user->hasVerifiedEmail())->toBeTrue()
        ->and(PendingRegistration::where('email', 'test@example.com')->exists())->toBeFalse()
        ->and(Hash::check('password', $user->password))->toBeTrue();

    $response->assertRedirect(route('onboarding.show'));
});

test('an expired confirmation link creates no account', function () {
    $pending = PendingRegistration::create([
        'name' => 'Late User',
        'email' => 'late@example.com',
        'password' => Hash::make('password'),
        'token' => 'expired-token',
    ]);
    $pending->forceFill(['created_at' => now()->subHours(2)])->save();

    $this->get(route('register.confirm', $pending->token))
        ->assertRedirect(route('register'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
    expect(User::where('email', 'late@example.com')->exists())->toBeFalse()
        ->and(PendingRegistration::where('email', 'late@example.com')->exists())->toBeFalse();
});

test('signing up with an already-registered email reveals nothing but emails the owner', function () {
    Notification::fake();

    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->post('/register', [
        'name' => 'Impostor',
        'email' => 'taken@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // Same screen as a fresh signup — no error that the email exists.
    $response->assertRedirect(route('register.pending'))->assertSessionHasNoErrors();

    expect(PendingRegistration::where('email', 'taken@example.com')->exists())->toBeFalse();

    Notification::assertSentOnDemand(ExistingAccountNotice::class);
});
