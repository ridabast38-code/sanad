<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Add a human-readable slug so public URLs can read /book/sireen-al-bast
     * instead of exposing the numeric user id.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        $taken = [];

        DB::table('users')->orderBy('id')->get(['id', 'name'])->each(function ($user) use (&$taken) {
            $base = Str::slug($user->name) ?: 'user';
            $slug = $base;
            $suffix = 2;

            while (in_array($slug, $taken, true)) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }

            $taken[] = $slug;

            DB::table('users')->where('id', $user->id)->update(['slug' => $slug]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
