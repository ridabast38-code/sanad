<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Email verification is being switched on. Everyone who signed up before
     * now is treated as already verified, so no existing account is suddenly
     * locked out — only new email signups will need to confirm their address.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    /**
     * Reverse the migrations.
     *
     * Nothing to undo: we can't tell which rows we backfilled, and marking
     * accounts unverified would lock people out.
     */
    public function down(): void
    {
        //
    }
};
