<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill the existing landing-team photos onto their practitioner
     * profiles so they show in the client specialist directory. Matched by
     * name, and only applied where no photo has been set yet, so it never
     * overwrites a picture a practitioner later uploads themselves.
     *
     * @var array<string, string>
     */
    private array $photosByName = [
        'Sireen Al Bast' => '/images/team/sireen.jpg',
        'Hanna Aylo' => '/images/team/hanna.jpg',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->photosByName as $name => $photoPath) {
            $userId = DB::table('users')
                ->where('name', $name)
                ->where('role', 'practitioner')
                ->value('id');

            if ($userId === null) {
                continue;
            }

            DB::table('practitioner_profiles')
                ->where('user_id', $userId)
                ->where(function ($query) {
                    $query->whereNull('photo_path')->orWhere('photo_path', '');
                })
                ->update(['photo_path' => $photoPath]);
        }
    }

    /**
     * Reverse the migrations: only clear the photos this migration set.
     */
    public function down(): void
    {
        foreach ($this->photosByName as $name => $photoPath) {
            $userId = DB::table('users')
                ->where('name', $name)
                ->where('role', 'practitioner')
                ->value('id');

            if ($userId === null) {
                continue;
            }

            DB::table('practitioner_profiles')
                ->where('user_id', $userId)
                ->where('photo_path', $photoPath)
                ->update(['photo_path' => null]);
        }
    }
};
