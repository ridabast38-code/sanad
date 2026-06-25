<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A signup that hasn't been confirmed yet. We hold the details here — never in
 * the real users table — until the person clicks the link in their email, so an
 * unconfirmed email never occupies a real account.
 */
class PendingRegistration extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'token',
    ];

    protected $hidden = [
        'password',
        'token',
    ];

    /**
     * How long a confirmation link stays valid.
     */
    public const EXPIRES_AFTER_MINUTES = 60;

    /**
     * Whether this pending signup's link has expired.
     */
    public function isExpired(): bool
    {
        return $this->created_at->addMinutes(self::EXPIRES_AFTER_MINUTES)->isPast();
    }
}
