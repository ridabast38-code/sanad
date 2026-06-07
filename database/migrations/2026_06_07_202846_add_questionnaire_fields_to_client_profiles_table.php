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
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->text('support_reason')->nullable()->after('emergency_contact');
            $table->string('preferred_language')->nullable()->after('support_reason');
            $table->string('preferred_approach')->nullable()->after('preferred_language');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->dropColumn(['support_reason', 'preferred_language', 'preferred_approach']);
        });
    }
};
