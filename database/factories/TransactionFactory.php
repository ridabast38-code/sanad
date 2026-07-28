<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = (float) $this->faker->randomElement([35, 40, 45]);

        return [
            'booking_id' => Booking::factory(),
            'amount' => $amount,
            'platform_fee' => round($amount * Booking::PLATFORM_SHARE, 2),
            'practitioner_payout' => round($amount * (1 - Booking::PLATFORM_SHARE), 2),
            'status' => 'completed',
            'paid_at' => $this->faker->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
