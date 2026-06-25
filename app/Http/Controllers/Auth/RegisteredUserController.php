<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            // Deliberately vague so the form never confirms whether an email is
            // already registered — this stops anyone enumerating our accounts.
            'email.unique' => 'We couldn’t create your account with those details. If you already have an account, please log in instead.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Deliver on "sign up to track everything": any sessions this person
        // already booked as a guest with this email become theirs, so their new
        // dashboard isn't empty.
        Booking::whereNull('client_id')
            ->where('guest_email', $user->email)
            ->update(['client_id' => $user->id]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('onboarding.show');
    }
}
