<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\CompleteRegistration;
use App\Notifications\ExistingAccountNotice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'googleEnabled' => filled(config('services.google.client_id')),
        ]);
    }

    /**
     * Handle a registration request. No account is created yet: we email a
     * confirmation link and only create the user once it's clicked. Whether or
     * not the email already exists, the visitor sees the same "check your inbox"
     * screen, so the form never reveals who already has an account.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if (User::where('email', $validated['email'])->exists()) {
            // Already a real account — nudge them by email instead of on screen.
            Notification::route('mail', $validated['email'])->notify(new ExistingAccountNotice);
        } else {
            $pending = PendingRegistration::updateOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'],
                    'password' => Hash::make($validated['password']),
                    'token' => Str::random(64),
                ]
            );

            Notification::route('mail', $pending->email)->notify(new CompleteRegistration($pending->token));
        }

        return to_route('register.pending')->with('pendingEmail', $validated['email']);
    }

    /**
     * The "check your inbox" screen shown after submitting the form.
     */
    public function pending(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('pendingEmail');

        if (blank($email)) {
            return to_route('register');
        }

        return Inertia::render('auth/registration-pending', ['email' => $email]);
    }

    /**
     * Confirm a pending registration from the emailed link: now the real
     * account is created (already verified) and the person is signed in.
     */
    public function confirm(string $token): RedirectResponse
    {
        $pending = PendingRegistration::where('token', $token)->first();

        if (! $pending || $pending->isExpired()) {
            $pending?->delete();

            return to_route('register')->withErrors([
                'email' => 'That confirmation link is invalid or has expired. Please sign up again.',
            ]);
        }

        // If the email was claimed in the meantime (e.g. via Google), just sign
        // them into that account rather than creating a duplicate.
        if ($existing = User::where('email', $pending->email)->first()) {
            $pending->delete();
            Auth::login($existing);

            return redirect()->intended(route($existing->homeRoute()));
        }

        $user = User::create([
            'name' => $pending->name,
            'email' => $pending->email,
            'password' => $pending->password, // already hashed
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        // Deliver on "your dashboard isn't empty": claim any sessions booked as
        // a guest with this email.
        Booking::whereNull('client_id')
            ->where('guest_email', $user->email)
            ->update(['client_id' => $user->id]);

        $pending->delete();

        Auth::login($user);

        return to_route('onboarding.show');
    }
}
