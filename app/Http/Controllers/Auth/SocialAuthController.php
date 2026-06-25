<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Only providers we've actually configured may be used, so a tampered URL
     * can't reach an unconfigured driver.
     *
     * @var list<string>
     */
    private const SUPPORTED = ['google'];

    /**
     * Send the visitor to the provider's sign-in screen.
     */
    public function redirect(string $provider): SymfonyRedirectResponse|RedirectResponse
    {
        abort_unless(in_array($provider, self::SUPPORTED, true), 404);

        return Socialite::driver($provider)
            ->redirectUrl($this->callbackUrl($provider))
            ->redirect();
    }

    /**
     * Handle the provider's callback: sign the person in, creating their
     * account on first use. Email is taken as verified because the provider
     * has already confirmed they own it.
     */
    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::SUPPORTED, true), 404);

        try {
            $providerUser = Socialite::driver($provider)
                ->redirectUrl($this->callbackUrl($provider))
                ->user();
        } catch (Throwable) {
            // Covers a declined grant, an expired state, or any provider error.
            return to_route('login')->withErrors([
                'email' => 'We couldn’t sign you in with '.ucfirst($provider).'. Please try again or use your email and password.',
            ]);
        }

        $email = $providerUser->getEmail();

        if (blank($email)) {
            return to_route('login')->withErrors([
                'email' => 'Your '.ucfirst($provider).' account didn’t share an email, so we can’t sign you in that way.',
            ]);
        }

        $existing = User::where('email', $email)->first();
        $isNewUser = $existing === null;

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $existing->name ?? ($providerUser->getName() ?: $email),
                'provider' => $provider,
                'provider_id' => $providerUser->getId(),
            ]
        );

        // The provider already confirmed they own this email, so mark it
        // verified — they never need the "check your inbox" step.
        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        if ($isNewUser) {
            // Same "your dashboard isn't empty" promise as email signup: claim
            // any sessions booked as a guest with this email.
            Booking::whereNull('client_id')
                ->where('guest_email', $user->email)
                ->update(['client_id' => $user->id]);
        }

        Auth::login($user, remember: false);

        if ($isNewUser && ! $user->hasCompletedOnboarding()) {
            return to_route('onboarding.show');
        }

        return redirect()->intended(route($user->homeRoute()));
    }

    /**
     * The absolute callback URL for the current environment, so it always
     * matches what's registered in the provider's dashboard.
     */
    private function callbackUrl(string $provider): string
    {
        return route('auth.social.callback', $provider);
    }
}
