<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Availability;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TherapistSeeder extends Seeder
{
    /**
     * Seed OurSanad's real specialists with services and weekly availability.
     */
    public function run(): void
    {
        // Clear any previously seeded demo practitioners (idempotent reseed).
        User::where('email', 'like', '%@sanad.test')->delete();

        // Shared catalogue of session types every specialist can offer.
        $individual = Service::firstOrCreate(
            ['name' => 'Individual support session'],
            ['description' => 'A one-to-one online session.', 'duration_minutes' => 60]
        );

        $consultation = Service::firstOrCreate(
            ['name' => 'Initial consultation'],
            ['description' => 'A first conversation to see if we are a good fit.', 'duration_minutes' => 45]
        );

        // Every specialist is trained across all three approaches.
        $approaches = ['cbt', 'emdr', 'psychoanalysis'];

        /**
         * @var array<int, array<string, mixed>>
         */
        $specialists = [
            [
                'email' => 'sireen@sanad.test',
                'name' => 'Sireen Al Bast',
                'headline' => 'Calm, attentive psychological support',
                'bio' => "Sireen holds a Master's (M2) in Clinical Psychology from the Lebanese University. She offers calm, attentive psychological support across CBT, EMDR and psychoanalytic approaches, working under the supervision of our certified psychologists.",
                'photo_path' => '/images/team/sireen.jpg',
                'languages' => ['arabic', 'english', 'french'],
                'gender' => 'female',
                'years_experience' => 4,
                'price' => 35,
                'days' => [1, 2, 4], // Mon, Tue, Thu
            ],
            [
                'email' => 'hanna@sanad.test',
                'name' => 'Hanna Aylo',
                'headline' => 'Warm, steady psychological support',
                'bio' => "Hanna holds a Master's (M2) in Clinical Psychology from the Lebanese University. He offers warm, steady psychological support across CBT, EMDR and psychoanalytic approaches, working under the supervision of our certified psychologists.",
                'photo_path' => '/images/team/hanna.jpg',
                'languages' => ['arabic', 'english'],
                'gender' => 'male',
                'years_experience' => 3,
                'price' => 35,
                'days' => [2, 3, 5], // Tue, Wed, Fri
            ],
        ];

        foreach ($specialists as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role' => UserRole::Practitioner,
                    'onboarded_at' => now(),
                    'email_verified_at' => now(),
                ]
            );

            $user->practitionerProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'headline' => $data['headline'],
                    'bio' => $data['bio'],
                    'type' => 'support',
                    'photo_path' => $data['photo_path'],
                    'approval_status' => 'approved',
                    'approaches' => $approaches,
                    'languages' => $data['languages'],
                    'gender' => $data['gender'],
                    'years_experience' => $data['years_experience'],
                ]
            );

            $user->services()->sync([
                $individual->id => ['price' => $data['price']],
                $consultation->id => ['price' => max(0, $data['price'] - 10)],
            ]);

            $user->availabilities()->delete();
            foreach ($data['days'] as $day) {
                Availability::create([
                    'user_id' => $user->id,
                    'day_of_week' => $day,
                    'start_time' => '17:00',
                    'end_time' => '20:00',
                ]);
            }
        }
    }
}
