<?php

namespace Database\Factories;

use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientProfile>
 */
class ClientProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['female', 'male', 'non_binary', 'prefer_not_to_say']),
            'emergency_contact' => fake()->name().' · '.fake()->phoneNumber(),
            'support_reason' => fake()->sentence(12),
            'preferred_language' => fake()->randomElement(['arabic', 'english', 'french']),
            'preferred_approach' => fake()->randomElement(['cbt', 'emdr', 'psychoanalysis', 'unsure']),
        ];
    }
}
