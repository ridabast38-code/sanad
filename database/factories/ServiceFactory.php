<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Individual support session',
                'Couples support session',
                'Initial consultation',
            ]),
            'description' => fake()->sentence(),
            'duration_minutes' => fake()->randomElement([45, 60]),
            'is_active' => true,
        ];
    }
}
