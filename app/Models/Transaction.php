<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'booking_id',
        'amount',
        'platform_fee',
        'practitioner_payout',
        'status',
        'payout_status',
        'paid_at',
        'payout_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'platform_fee' => 'decimal:2',
            'practitioner_payout' => 'decimal:2',
            'paid_at' => 'datetime',
            'payout_at' => 'datetime',
        ];
    }

    /**
     * The booking this transaction settles.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
