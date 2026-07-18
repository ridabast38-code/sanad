<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\PractitionerProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

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
     * Show the full editor for an existing practitioner — the same fields the
     * practitioner can change about themselves (profile, photo, pricing and
     * weekly availability), so an admin can keep a listing correct on their behalf.
     */
    public function edit(User $practitioner): Response
    {
        abort_unless($practitioner->isPractitioner(), 404);

        $practitioner->load(['practitionerProfile', 'availabilities', 'services']);
        $profile = $practitioner->practitionerProfile;
        $priced = $practitioner->services->keyBy('id');

        return Inertia::render('admin/practitioner-edit', [
            'practitioner' => [
                'id' => $practitioner->id,
                'name' => $practitioner->name,
                'email' => $practitioner->email,
                'headline' => $profile?->headline,
                'bio' => $profile?->bio,
                'gender' => $profile?->gender,
                'years_experience' => $profile?->years_experience,
                'approaches' => $profile?->approaches ?? [],
                'languages' => $profile?->languages ?? [],
                'photo_path' => $profile?->photo_path,
                'approval_status' => $profile?->approval_status,
                'availability' => $practitioner->availabilities
                    ->map(fn ($window) => [
                        'day_of_week' => $window->day_of_week,
                        'start_time' => substr((string) $window->start_time, 0, 5),
                        'end_time' => substr((string) $window->end_time, 0, 5),
                    ])
                    ->values(),
            ],
            'options' => [
                'approaches' => PractitionerProfile::APPROACHES,
                'languages' => PractitionerProfile::LANGUAGES,
            ],
            'services' => Service::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'duration_minutes' => $service->duration_minutes,
                    'price' => $priced->has($service->id) ? (float) $priced[$service->id]->pivot->price : null,
                ]),
        ]);
    }

    /**
     * Persist an admin's edits to a practitioner. Mirrors the profile fields, photo,
     * pricing and availability of the create form — but leaves the password alone
     * unless a new one is explicitly typed, and never touches approval status here
     * (that stays with the Approve/Suspend controls on the list).
     */
    public function update(Request $request, User $practitioner): RedirectResponse
    {
        abort_unless($practitioner->isPractitioner(), 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($practitioner->id)],
            'password' => ['nullable', Password::defaults()],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],

            'headline' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'gender' => ['nullable', 'in:male,female'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'approaches' => ['array'],
            'approaches.*' => ['in:'.implode(',', PractitionerProfile::APPROACHES)],
            'languages' => ['array'],
            'languages.*' => ['in:'.implode(',', PractitionerProfile::LANGUAGES)],

            'services' => ['array'],
            'services.*.id' => ['required_with:services', 'integer', 'exists:services,id'],
            'services.*.price' => ['nullable', 'numeric', 'min:0', 'max:10000'],

            'availability' => ['array'],
            'availability.*.day_of_week' => ['required_with:availability', 'integer', 'between:0,6'],
            'availability.*.start_time' => ['required_with:availability', 'date_format:H:i'],
            'availability.*.end_time' => ['required_with:availability', 'date_format:H:i', 'after:availability.*.start_time'],
        ]);

        $practitioner->name = $validated['name'];
        $practitioner->email = $validated['email'];

        if (! empty($validated['password'])) {
            $practitioner->password = Hash::make($validated['password']);
        }

        $practitioner->save();

        $profileData = [
            'headline' => $validated['headline'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'years_experience' => $validated['years_experience'] ?? null,
            'approaches' => $validated['approaches'] ?? [],
            'languages' => $validated['languages'] ?? [],
        ];

        if ($request->hasFile('photo')) {
            $profileData['photo_path'] = Storage::url($request->file('photo')->store('practitioners', 'public'));
        }

        // updateOrCreate so a practitioner somehow missing a profile row still gets
        // one; the create-only defaults never overwrite an existing row's status.
        $practitioner->practitionerProfile()->updateOrCreate([], array_merge(
            $practitioner->practitionerProfile ? [] : ['type' => 'support', 'approval_status' => 'approved'],
            $profileData,
        ));

        $this->syncServices($practitioner, $validated['services'] ?? []);

        // Availability is a full replacement — the form always submits the complete
        // weekly set, so clear the old windows before writing the new ones.
        $practitioner->availabilities()->delete();
        $this->syncAvailability($practitioner, $validated['availability'] ?? []);

        return to_route('admin.practitioners');
    }

    /**
     * Permanently delete a user and everything attached to them. Every related
     * table (profile, availability, bookings on either side, and those bookings'
     * transactions and notes) is wired to cascade on the users row, so a single
     * delete clears the lot. This is the "remove a test account" path — Suspend
     * is the reversible option that keeps a real person's history intact.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, 'You cannot delete your own account.');

        $user->delete();

        return back();
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
