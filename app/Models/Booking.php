<?php

namespace App\Models;

use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification as FacadesNotification;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /**
     * The platform's share of every booking (the rest goes to the practitioner).
     */
    public const PLATFORM_SHARE = 0.20;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'guest_name',
        'guest_email',
        'guest_phone',
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

    /**
     * The settled transaction for this booking, if any.
     */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    /**
     * Whether this is a walk-in / WhatsApp booking with no registered account.
     */
    public function isGuest(): bool
    {
        return $this->client_id === null;
    }

    /**
     * The booker's display name — the registered client, or the guest's name.
     */
    public function clientName(): string
    {
        return $this->client?->name ?? $this->guest_name ?? 'Guest';
    }

    /**
     * The booker's email for notifications — the registered client's, or the
     * one a guest provided (may be null if a walk-in left no email).
     */
    public function clientEmail(): ?string
    {
        return $this->client?->email ?? $this->guest_email;
    }

    /**
     * Send a notification to the booker, whether they're a registered client or
     * a guest. Guests are emailed on-demand at the address they gave; if a
     * walk-in left no email, nothing is sent.
     */
    public function notifyClient(Notification $notification): void
    {
        if ($this->client) {
            $this->client->notify($notification);

            return;
        }

        if ($this->guest_email) {
            FacadesNotification::route('mail', $this->guest_email)->notify($notification);
        }
    }

    /**
     * Mark the booking paid and record the transaction (idempotent). Called
     * when an admin confirms the money has arrived (or, once live, the gateway).
     */
    public function settle(): Transaction
    {
        $this->update([
            'payment_status' => 'paid',
            'status' => $this->status === 'pending' ? 'confirmed' : $this->status,
        ]);

        return $this->transaction()->updateOrCreate([], [
            'amount' => $this->price,
            'platform_fee' => $this->platform_amount,
            'practitioner_payout' => $this->practitioner_amount,
            'status' => 'completed',
            'paid_at' => Carbon::now(),
        ]);
    }

    /**
     * Refund part or all of a paid booking. The kept amount (price minus the
     * refund) keeps the same 80/20 split, so the platform fee and practitioner
     * payout are recomputed on what the client actually paid in the end. A full
     * refund zeroes the payout; a partial refund leaves the transaction payable
     * for the reduced share.
     */
    public function refund(float $refundAmount): void
    {
        $price = (float) $this->price;
        $refundAmount = round(max(0.0, min($refundAmount, $price)), 2);
        $isFull = $refundAmount >= $price;

        $kept = round($price - $refundAmount, 2);
        $platformFee = round($kept * self::PLATFORM_SHARE, 2);

        $this->update([
            'payment_status' => $isFull ? 'refunded' : ($refundAmount > 0 ? 'partially_refunded' : $this->payment_status),
        ]);

        $this->transaction?->update([
            'platform_fee' => $platformFee,
            'practitioner_payout' => round($kept - $platformFee, 2),
            'refunded_amount' => $refundAmount,
            'refunded_at' => $refundAmount > 0 ? Carbon::now() : null,
            'status' => $isFull ? 'refunded' : 'completed',
        ]);
    }
}
