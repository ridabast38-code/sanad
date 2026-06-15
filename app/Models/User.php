<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'status',
        'onboarded_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarded_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    /**
     * The client profile associated with the user (for users who book sessions).
     */
    public function clientProfile(): HasOne
    {
        return $this->hasOne(ClientProfile::class);
    }

    /**
     * The practitioner profile (for users who deliver sessions).
     */
    public function practitionerProfile(): HasOne
    {
        return $this->hasOne(PractitionerProfile::class);
    }

    /**
     * The weekly availability windows for a practitioner.
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class);
    }

    /**
     * The services a practitioner offers, each with their own price.
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'practitioner_service')
            ->withPivot('price')
            ->withTimestamps();
    }

    /**
     * Bookings where this user is the client.
     */
    public function clientBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    /**
     * Bookings where this user is the practitioner.
     */
    public function practitionerBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'practitioner_id');
    }

    public function isClient(): bool
    {
        return $this->role === UserRole::Client;
    }

    public function isPractitioner(): bool
    {
        return $this->role === UserRole::Practitioner;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Whether the user has completed the onboarding questionnaire.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarded_at !== null;
    }

    /**
     * The route name a user should land on after logging in.
     */
    public function homeRoute(): string
    {
        return match ($this->role) {
            UserRole::Practitioner => 'practitioner.dashboard',
            UserRole::Admin => 'admin.dashboard',
            default => 'dashboard',
        };
    }
}
