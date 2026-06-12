<?php

namespace Database\Factories;

use App\Models\PractitionerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PractitionerProfile>
 */
class PractitionerProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $approaches = ['cbt', 'emdr', 'psychoanalysis'];
        $languages = ['arabic', 'english', 'french'];

        return [
            'user_id' => User::factory(),
            'headline' => fake()->randomElement([
                'Anxiety, stress & burnout support',
                'Relationships & life transitions',
                'Grief, loss & emotional healing',
                'Self-esteem & personal growth',
                'Trauma-informed support',
            ]),
            'bio' => fake()->paragraph(4),
            'type' => 'support',
            'photo_path' => null,
            'approval_status' => 'approved',
            'approaches' => fake()->randomElements($approaches, fake()->numberBetween(1, 2)),
            'languages' => fake()->randomElements($languages, fake()->numberBetween(1, 3)),
            'gender' => fake()->randomElement(['female', 'male']),
            'years_experience' => fake()->numberBetween(2, 15),
        ];
    }
}
