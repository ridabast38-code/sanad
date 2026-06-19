<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // How the session came to be: 'standard' (the calm, self-booked flow)
            // or 'emergency' (urgent help routed through the WhatsApp fast lane).
            $table->string('type')->default('standard')->after('service_id');

            // For emergency bookings, which crisis the client came in for — mirrors
            // the StabilizationFlows trauma types (accident, war, grief, disaster).
            $table->string('emergency_category')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['type', 'emergency_category']);
        });
    }
};
