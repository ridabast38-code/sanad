<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\PractitionerProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    /**
     * Create a specialist or admin account with login credentials.
     *
     * A specialist can be set up completely in one step — bio, approaches,
     * languages, per-service pricing and weekly availability — so an admin can
     * stand up a fully bookable practitioner without waiting for them to log in
     * and fill it in themselves. Everything past the login fields is optional and
     * only read for the practitioner role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'in:practitioner,admin'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],

            // practitioner profile (optional — an admin can fill it now or leave it)
            'headline' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'gender' => ['nullable', 'in:male,female'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'approaches' => ['array'],
            'approaches.*' => ['in:'.implode(',', PractitionerProfile::APPROACHES)],
            'languages' => ['array'],
            'languages.*' => ['in:'.implode(',', PractitionerProfile::LANGUAGES)],

            // per-service pricing (a blank price means "doesn't offer it")
            'services' => ['array'],
            'services.*.id' => ['required_with:services', 'integer', 'exists:services,id'],
            'services.*.price' => ['nullable', 'numeric', 'min:0', 'max:10000'],

            // weekly availability windows
            'availability' => ['array'],
            'availability.*.day_of_week' => ['required_with:availability', 'integer', 'between:0,6'],
            'availability.*.start_time' => ['required_with:availability', 'date_format:H:i'],
            'availability.*.end_time' => ['required_with:availability', 'date_format:H:i', 'after:availability.*.start_time'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => UserRole::from($validated['role']),
        ]);

        // An admin adding staff by hand is itself the verification — they know who
        // these people are. Set through forceFill because `email_verified_at` and
        // `onboarded_at` aren't mass-assignable; passed to create() above they were
        // silently dropped, which left every new staff member unverified and bounced
        // to /verify-email — locked out of the account they were just given.
        $user->forceFill([
            'onboarded_at' => now(),
            'email_verified_at' => now(),
        ])->save();

        if ($user->isPractitioner()) {
            $photoPath = null;

            if ($request->hasFile('photo')) {
                $photoPath = Storage::url($request->file('photo')->store('practitioners', 'public'));
            }

            $user->practitionerProfile()->create([
                'type' => 'support',
                'approval_status' => 'approved',
                'headline' => $validated['headline'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'years_experience' => $validated['years_experience'] ?? null,
                'approaches' => $validated['approaches'] ?? [],
                'languages' => $validated['languages'] ?? [],
                'photo_path' => $photoPath,
            ]);

            $this->syncServices($user, $validated['services'] ?? []);
            $this->syncAvailability($user, $validated['availability'] ?? []);
        }

        return to_route($user->isPractitioner() ? 'admin.practitioners' : 'admin.dashboard');
    }

    /**
     * Attach only the services the admin actually priced. A blank or zero price
     * means the practitioner doesn't offer that one.
     *
     * @param  array<int, array{id: int, price?: mixed}>  $services
     */
    private function syncServices(User $user, array $services): void
    {
        $sync = [];

        foreach ($services as $service) {
            if (! empty($service['price']) && (float) $service['price'] > 0) {
                $sync[$service['id']] = ['price' => round((float) $service['price'], 2)];
            }
        }

        $user->services()->sync($sync);
    }

    /**
     * Create the weekly availability windows the admin entered.
     *
     * @param  array<int, array{day_of_week: int, start_time: string, end_time: string}>  $windows
     */
    private function syncAvailability(User $user, array $windows): void
    {
        foreach ($windows as $window) {
            $user->availabilities()->create([
                'day_of_week' => $window['day_of_week'],
                'start_time' => $window['start_time'],
                'end_time' => $window['end_time'],
            ]);
        }
    }
}
