<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'emergency_contact' => ['required', 'string', 'max:255'],
            'support_reason' => ['required', 'string', 'min:10', 'max:2000'],
            'preferred_language' => ['required', Rule::in(['arabic', 'english', 'french'])],
            'preferred_approach' => ['nullable', Rule::in(['cbt', 'emdr', 'psychoanalysis', 'unsure'])],
        ]);

        $user = $request->user();

        $user->clientProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated,
        );

        $user->forceFill(['onboarded_at' => now()])->save();

        return to_route('dashboard');
    }
}
