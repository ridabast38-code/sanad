<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = (float) $this->faker->randomElement([35, 40, 45]);

        return [
            'client_id' => User::factory(),
            'practitioner_id' => User::factory(),
            'service_id' => Service::factory(),
            'type' => Booking::TYPE_STANDARD,
            'scheduled_at' => $this->faker->dateTimeBetween('-2 months', '+3 weeks'),
            'status' => 'confirmed',
            'price' => $price,
            'platform_amount' => round($price * Booking::PLATFORM_SHARE, 2),
            'practitioner_amount' => round($price * (1 - Booking::PLATFORM_SHARE), 2),
            'payment_status' => 'paid',
            'meeting_link' => 'https://meet.sanad.app/'.$this->faker->uuid(),
            'client_note' => null,
        ];
    }

    /**
     * A completed (past, delivered) session.
     */
    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'scheduled_at' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
        ]);
    }

    /**
     * An upcoming, paid & confirmed session.
     */
    public function upcoming(): static
    {
        return $this->state(fn () => [
            'status' => 'confirmed',
            'scheduled_at' => $this->faker->dateTimeBetween('+1 day', '+3 weeks'),
        ]);
    }

    /**
     * A session that came through the emergency fast lane.
     */
    public function emergency(string $category = 'accident'): static
    {
        return $this->state(fn () => [
            'type' => Booking::TYPE_EMERGENCY,
            'emergency_category' => $category,
        ]);
    }
}
