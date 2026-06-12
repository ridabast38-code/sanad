<?php

namespace App\Models;

use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'practitioner_id',
        'service_id',
        'scheduled_at',
        'status',
        'price',
        'platform_amount',
        'practitioner_amount',
        'payment_status',
        'payment_link',
        'meeting_link',
        'client_note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'price' => 'decimal:2',
            'platform_amount' => 'decimal:2',
            'practitioner_amount' => 'decimal:2',
        ];
    }

    /**
     * The client who booked the session.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * The practitioner delivering the session.
     */
    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'practitioner_id');
    }

    /**
     * The service (session type) booked.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
