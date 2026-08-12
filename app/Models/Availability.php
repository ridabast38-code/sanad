<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\AvailabilityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    /** @use HasFactory<AvailabilityFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
        ];
    }

    /**
     * Fill in the end of a window that was saved as a bare start time.
     *
     * Practitioners pick an hour, not a range: "Monday 12 PM" is one session a
     * client can book, and the slot builder only ever reads `start_time`. The
     * column stays because the schema and the seeders have always had it, and
     * because a session needs a length the day an actual calendar wants one —
     * so an hour is written here rather than leaving a hole in a NOT NULL
     * column. Anything that passes its own `end_time` keeps it.
     */
    protected static function booted(): void
    {
        static::creating(function (Availability $availability): void {
            if ($availability->end_time !== null) {
                return;
            }

            $end = Carbon::parse($availability->start_time)->addHour();

            // 23:00 would roll into the next day and read as an end before its
            // start; the last hour of the day simply ends with the day.
            $availability->end_time = $end->isSameDay(Carbon::parse($availability->start_time))
                ? $end->format('H:i')
                : '23:59';
        });
    }

    /**
     * The practitioner this availability window belongs to.
     */
    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
