<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

/** Make Socialite return a fixed Google user without hitting the network. */
function fakeGoogleUser(string $id, string $name, ?string $email): void
{
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn($id);
    $socialiteUser->shouldReceive('getName')->andReturn($name);
    $socialiteUser->shouldReceive('getEmail')->andReturn($email);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirectUrl')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
}

test('a new visitor can sign up with google and lands on onboarding', function () {
    fakeGoogleUser('google-123', 'Lina Saad', 'lina@example.com');

    $response = $this->get(route('auth.social.callback', 'google'));

    $this->assertAuthenticated();

    $user = User::where('email', 'lina@example.com')->sole();

    expect($user->provider)->toBe('google')
        ->and($user->provider_id)->toBe('google-123')
        ->and($user->role)->toBe(UserRole::Client)
        ->and($user->email_verified_at)->not->toBeNull();

    $response->assertRedirect(route('onboarding.show'));
});

test('signing in with google links to an existing account by email', function () {
    $existing = User::factory()->create(['email' => 'maya@example.com', 'name' => 'Maya Existing']);

    fakeGoogleUser('google-999', 'Maya From Google', 'maya@example.com');

    $this->get(route('auth.social.callback', 'google'));

    $this->assertAuthenticatedAs($existing);

    $existing->refresh();

    expect(User::where('email', 'maya@example.com')->count())->toBe(1)
        ->and($existing->provider_id)->toBe('google-999')
        ->and($existing->name)->toBe('Maya Existing');
});

test('a google signup claims past guest bookings with the same email', function () {
    $practitioner = User::factory()->create(['role' => UserRole::Practitioner]);
    $service = Service::factory()->create();
    $practitioner->services()->attach($service, ['price' => 40]);

    $booking = Booking::create([
        'public_token' => (string) Str::uuid(),
        'client_id' => null,
        'guest_name' => 'Sam Guest',
        'guest_email' => 'sam@example.com',
        'guest_phone' => '+961 70 000 000',
        'practitioner_id' => $practitioner->id,
        'service_id' => $service->id,
        'scheduled_at' => now()->addWeek(),
        'status' => 'pending',
        'price' => 40,
        'platform_amount' => 8,
        'practitioner_amount' => 32,
        'payment_status' => 'unpaid',
    ]);

    fakeGoogleUser('google-555', 'Sam Guest', 'sam@example.com');

    $this->get(route('auth.social.callback', 'google'));

    expect($booking->fresh()->client_id)->toBe(User::where('email', 'sam@example.com')->sole()->id);
});

test('a declined google grant returns to login with a message', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirectUrl')->andReturnSelf();
    $provider->shouldReceive('user')->andThrow(new RuntimeException('denied'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.social.callback', 'google'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('an unsupported provider is rejected', function () {
    $this->get(route('auth.social.callback', 'facebook'))->assertNotFound();
    $this->get(route('auth.social.redirect', 'facebook'))->assertNotFound();
});
