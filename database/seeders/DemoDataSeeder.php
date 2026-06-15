<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed an admin, a handful of demo clients, and bookings + settled
     * transactions so the practitioner and admin dashboards show real numbers.
     * Idempotent: demo clients (and their cascading bookings) are recreated.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@sanad.test'],
            [
                'name' => 'Sanad Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'onboarded_at' => now(),
                'email_verified_at' => now(),
            ]
        );

        // Reset demo clients (bookings + transactions cascade on delete).
        User::where('email', 'like', 'client%@sanad.test')->delete();

        $practitioners = User::where('role', UserRole::Practitioner)
            ->whereHas('practitionerProfile')
            ->with('services')
            ->get();

        if ($practitioners->isEmpty()) {
            return;
        }

        $clientNames = ['Maya Khoury', 'Karim Nassar', 'Lina Haddad', 'Omar Saad', 'Rita Fares'];

        foreach ($clientNames as $index => $name) {
            $client = User::create([
                'name' => $name,
                'email' => 'client'.($index + 1).'@sanad.test',
                'password' => Hash::make('password'),
                'role' => UserRole::Client,
                'onboarded_at' => now(),
                'email_verified_at' => now(),
            ]);

            $practitioner = $practitioners[$index % $practitioners->count()];
            $service = $practitioner->services->first();

            if (! $service) {
                continue;
            }

            $price = (float) $service->pivot->price;

            // 1–3 past (completed) sessions per client.
            foreach (range(1, random_int(1, 3)) as $n) {
                $this->makeBooking($client, $practitioner, $service->id, $price, Carbon::now()->subWeeks($n * 2)->setTime(17, 0), 'completed')->settle();
            }

            // One upcoming, paid & confirmed session for most clients.
            if ($index % 2 === 0) {
                $this->makeBooking($client, $practitioner, $service->id, $price, Carbon::now()->addDays($index + 2)->setTime(18, 0), 'confirmed')->settle();
            }

            // A pending request awaiting the admin's accept (paid) / reject (unpaid) decision.
            $this->makeBooking($client, $practitioner, $service->id, $price, Carbon::now()->addDays($index + 5)->setTime(19, 0), 'pending');
        }
    }

    private function makeBooking(User $client, User $practitioner, int $serviceId, float $price, Carbon $when, string $status): Booking
    {
        return Booking::create([
            'client_id' => $client->id,
            'practitioner_id' => $practitioner->id,
            'service_id' => $serviceId,
            'scheduled_at' => $when,
            'status' => $status,
            'price' => $price,
            'platform_amount' => round($price * 0.20, 2),
            'practitioner_amount' => round($price * 0.80, 2),
            'payment_status' => $status === 'pending' ? 'unpaid' : 'paid',
            'meeting_link' => 'https://meet.sanad.app/'.fake()->uuid(),
        ]);
    }
}
