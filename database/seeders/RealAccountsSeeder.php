<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RealAccountsSeeder extends Seeder
{
    /**
     * Seed the platform owner's real accounts: an admin, a bookable
     * practitioner, and a client — all with real email addresses so the
     * live notification flow can be exercised end to end. Idempotent.
     */
    public function run(): void
    {
        // Real admin (platform owner / accountant) — receives new-booking alerts.
        $this->ensureAccount('jawadalbast274@gmail.com', 'Jawad Al Bast', UserRole::Admin);

        // Real client — onboarded so they can book straight away.
        $this->ensureAccount('ridabast38@gmail.com', 'Rida Bast', UserRole::Client);

        // Real, bookable practitioner — approved with services and availability.
        $practitioner = $this->ensureAccount('bastjawad6@gmail.com', 'Jawad Bast', UserRole::Practitioner);

        // This account was previously used as a client; drop any bookings it made
        // as a client so it is purely a practitioner now.
        $practitioner->clientBookings()->delete();

        $practitioner->practitionerProfile()->updateOrCreate(
            ['user_id' => $practitioner->id],
            [
                'headline' => 'Supportive, practical psychological support',
                'bio' => 'Here to listen and support you, one session at a time.',
                'type' => 'support',
                'approval_status' => 'approved',
                'approaches' => ['cbt', 'emdr', 'psychoanalysis'],
                'languages' => ['arabic', 'english'],
                'gender' => 'male',
                'years_experience' => 3,
            ]
        );

        $individual = Service::firstOrCreate(
            ['name' => 'Individual support session'],
            ['description' => 'A one-to-one online session.', 'duration_minutes' => 60]
        );

        $consultation = Service::firstOrCreate(
            ['name' => 'Initial consultation'],
            ['description' => 'A first conversation to see if we are a good fit.', 'duration_minutes' => 45]
        );

        $practitioner->services()->sync([
            $individual->id => ['price' => 35],
            $consultation->id => ['price' => 25],
        ]);

        $practitioner->availabilities()->delete();
        foreach ([1, 3, 5] as $day) { // Mon, Wed, Fri
            Availability::create([
                'user_id' => $practitioner->id,
                'day_of_week' => $day,
                'start_time' => '17:00',
                'end_time' => '20:00',
            ]);
        }
    }

    /**
     * Find or create the account by email and enforce its name, role, and
     * onboarded/verified state — without resetting an existing password.
     */
    private function ensureAccount(string $email, string $name, UserRole $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'role' => $role,
                'onboarded_at' => now(),
                'email_verified_at' => now(),
            ]
        );

        $user->forceFill([
            'name' => $name,
            'role' => $role,
            'onboarded_at' => $user->onboarded_at ?? now(),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        return $user;
    }
}
