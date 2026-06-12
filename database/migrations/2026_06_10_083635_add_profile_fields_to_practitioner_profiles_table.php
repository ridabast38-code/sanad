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
        Schema::table('practitioner_profiles', function (Blueprint $table) {
            $table->json('approaches')->nullable();   // ['cbt', 'emdr', ...]
            $table->json('languages')->nullable();    // ['arabic', 'english', ...]
            $table->string('gender')->nullable();
            $table->unsignedSmallInteger('years_experience')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('practitioner_profiles', function (Blueprint $table) {
            $table->dropColumn(['approaches', 'languages', 'gender', 'years_experience']);
        });
    }
};
