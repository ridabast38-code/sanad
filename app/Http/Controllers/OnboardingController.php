<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the client onboarding questionnaire.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasCompletedOnboarding()) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding', [
            'name' => $request->user()->name,
        ]);
    }

    /**
     * Store the questionnaire answers and mark the user as onboarded.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', Rule::in(['female', 'male', 'non_binary', 'prefer_not_to_say'])],
            'phone' => ['required', 'string', 'max:30'],
            'support_reason' => ['nullable', 'string', 'max:2000'],
            'preferred_language' => ['required', Rule::in(['arabic', 'english', 'french'])],
            'preferred_approach' => ['nullable', Rule::in(['cbt', 'emdr', 'psychoanalysis', 'unsure'])],
        ]);

        $user = $request->user();

        // phone lives on the user record; the rest belongs to the client profile.
        $user->clientProfile()->updateOrCreate(
            ['user_id' => $user->id],
            Arr::except($validated, ['phone']),
        );

        $user->forceFill([
            'phone' => $validated['phone'],
            'onboarded_at' => now(),
        ])->save();

        return to_route($user->homeRoute());
    }
}
