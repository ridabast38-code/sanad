<?php

namespace App\Console\Commands;

use App\Models\PractitionerProfile;
use Illuminate\Console\Command;

/**
 * See — and optionally clear — the therapy approaches saved on each practitioner.
 *
 * The directory only ever displays what's stored, so if a card shows CBT/EMDR/
 * Psychoanalysis, those values are saved on that profile. This makes the stored
 * data visible (no guessing) and can blank it in one pass so cards start clean.
 */
class PractitionerApproaches extends Command
{
    protected $signature = 'practitioners:approaches {--clear : Blank the approaches on every practitioner}';

    protected $description = 'List (or clear with --clear) the approaches saved on each practitioner profile';

    public function handle(): int
    {
        $profiles = PractitionerProfile::with('user')->get();

        if ($profiles->isEmpty()) {
            $this->warn('No practitioner profiles found.');

            return self::SUCCESS;
        }

        $this->table(
            ['Practitioner', 'Saved approaches'],
            $profiles->map(fn (PractitionerProfile $profile) => [
                $profile->user?->name ?? "#{$profile->user_id}",
                empty($profile->approaches) ? '(none)' : implode(', ', $profile->approaches),
            ])->all()
        );

        if ($this->option('clear')) {
            $profiles->each(fn (PractitionerProfile $profile) => $profile->update(['approaches' => []]));
            $this->info("Cleared approaches on {$profiles->count()} practitioner(s). Reload the site to confirm — the tags are gone.");
        } else {
            $this->newLine();
            $this->line('Run <info>php artisan practitioners:approaches --clear</info> to blank them all at once.');
        }

        return self::SUCCESS;
    }
}
