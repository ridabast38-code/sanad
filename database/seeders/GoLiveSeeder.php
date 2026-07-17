<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * The clean launch state: one bootstrap admin and the global services, nothing
 * else. Everything else — practitioners, their bios, their pricing — is created
 * through the admin panel once this admin logs in.
 *
 * Deliberately NOT wired into DatabaseSeeder: that one seeds fake test data for
 * local development. This is the opposite — the empty, real starting point. Run
 * it by name: `php artisan db:seed --class=GoLiveSeeder --force`.
 *
 * Idempotent: safe to run twice. It never overwrites an existing admin's
 * password, so re-running won't undo a password the owner has already changed.
 */
class GoLiveSeeder extends Seeder
{
    /** The one account that exists before anyone logs in. */
    private const ADMIN_EMAIL = 'bastjawad6@gmail.com';

    private const ADMIN_NAME = 'Jawad Bast';

    public function run(): void
    {
        $this->seedAdmin();
        $this->seedServices();
    }

    private function seedAdmin(): void
    {
        $existing = User::where('email', self::ADMIN_EMAIL)->first();

        if ($existing) {
            // Already here (a re-run) — make sure it's an admin, but leave the
            // password alone so we don't clobber one the owner already set.
            $existing->forceFill([
                'name' => self::ADMIN_NAME,
                'role' => UserRole::Admin,
                'onboarded_at' => $existing->onboarded_at ?? now(),
                'email_verified_at' => $existing->email_verified_at ?? now(),
            ])->save();

            $this->command?->warn('Admin '.self::ADMIN_EMAIL.' already exists — left its password untouched.');

            return;
        }

        // A one-time password. Prefer one you set in the environment
        // (SANAD_BOOTSTRAP_PASSWORD, read through config so it survives config
        // caching); otherwise a strong random one is generated and printed once,
        // right here, so it never lives in the repo.
        $password = config('sanad.bootstrap_password') ?: Str::password(14);

        User::create([
            'name' => self::ADMIN_NAME,
            'email' => self::ADMIN_EMAIL,
            'password' => Hash::make($password),
            'role' => UserRole::Admin,
            'onboarded_at' => now(),
            'email_verified_at' => now(),
        ]);

        $this->command?->warn('=================================================');
        $this->command?->warn('  Admin created: '.self::ADMIN_EMAIL);
        $this->command?->warn('  Temporary password: '.$password);
        $this->command?->warn('  Log in and change it immediately at /settings/password');
        $this->command?->warn('=================================================');
    }

    /**
     * The global services every practitioner prices themselves against. Without
     * these, a newly-added practitioner has nothing to set a price on.
     */
    private function seedServices(): void
    {
        Service::firstOrCreate(
            ['name' => 'Individual support session'],
            ['description' => 'A one-to-one online session.', 'duration_minutes' => 60, 'is_active' => true]
        );

        Service::firstOrCreate(
            ['name' => 'Initial consultation'],
            ['description' => 'A first conversation to see if we are a good fit.', 'duration_minutes' => 45, 'is_active' => true]
        );
    }
}
