<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * Delete a test account and everything attached to it — profile, availability,
 * service prices, every booking they're on (as client or practitioner) and those
 * bookings' transactions and session notes. All of it cascades off the user row
 * at the database level, so a single delete is enough.
 *
 * Dry run by default (prints what would go); pass --force to actually delete,
 * which also keeps it safe to run from Forge's non-interactive Commands panel.
 */
class PurgeUser extends Command
{
    protected $signature = 'user:purge {email : The email of the account to delete} {--force : Actually delete (otherwise it only reports)}';

    protected $description = 'Delete a test user and all their attached data (bookings, transactions, notes, profile)';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error("No user found with email {$this->argument('email')}.");

            return self::FAILURE;
        }

        $bookingIds = Booking::where('client_id', $user->id)
            ->orWhere('practitioner_id', $user->id)
            ->pluck('id');

        $this->table(['Field', 'Value'], [
            ['Name', $user->name],
            ['Email', $user->email],
            ['Role', $user->role->value],
            ['Bookings as client', Booking::where('client_id', $user->id)->count()],
            ['Bookings as practitioner', Booking::where('practitioner_id', $user->id)->count()],
            ['Transactions (will cascade)', Transaction::whereIn('booking_id', $bookingIds)->count()],
        ]);

        if (! $this->option('force')) {
            $this->warn('Dry run — nothing was deleted. Re-run with --force to permanently remove this user and everything above.');

            return self::SUCCESS;
        }

        $user->delete();

        $this->info("Deleted {$user->email} and all attached records.");

        return self::SUCCESS;
    }
}
