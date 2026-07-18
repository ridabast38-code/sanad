<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a database-level guarantee that a practitioner can never hold two live
     * bookings at the same time.
     *
     * `slot_hold` mirrors `scheduled_at` while a booking is active (pending or
     * confirmed) and is NULL once it's cancelled, completed or a no-show. A unique
     * index on (practitioner_id, slot_hold) then makes MySQL itself reject a second
     * active booking on the same time — the backstop the application-level checks
     * can't provide against two requests racing for the same slot. NULLs are exempt
     * from the uniqueness rule in MySQL, so a freed slot can be re-booked.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dateTime('slot_hold')->nullable()->after('scheduled_at');
        });

        // Backfill existing rows. If any duplicate active bookings already exist on
        // the same slot (the very bug this guards against), only the earliest keeps
        // its hold so the unique index can still be created; the rest stay NULL.
        $seen = [];

        DB::table('bookings')
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('id')
            ->get(['id', 'practitioner_id', 'scheduled_at'])
            ->each(function ($booking) use (&$seen): void {
                $key = $booking->practitioner_id.'|'.$booking->scheduled_at;

                if (isset($seen[$key])) {
                    return;
                }

                $seen[$key] = true;

                DB::table('bookings')->where('id', $booking->id)->update([
                    'slot_hold' => $booking->scheduled_at,
                ]);
            });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->unique(['practitioner_id', 'slot_hold'], 'bookings_practitioner_slot_unique');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropUnique('bookings_practitioner_slot_unique');
            $table->dropColumn('slot_hold');
        });
    }
};
