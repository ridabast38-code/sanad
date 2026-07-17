<?php

namespace App\Models;

use Database\Factories\PractitionerProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PractitionerProfile extends Model
{
    /** @use HasFactory<PractitionerProfileFactory> */
    use HasFactory;

    /** The therapy approaches a practitioner can offer — the single source of truth. */
    public const APPROACHES = ['cbt', 'emdr', 'psychoanalysis'];

    /** The languages a practitioner can work in. */
    public const LANGUAGES = ['arabic', 'english', 'french'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'headline',
        'bio',
        'type',
        'photo_path',
        'approval_status',
        'approaches',
        'languages',
        'gender',
        'years_experience',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approaches' => 'array',
            'languages' => 'array',
            'years_experience' => 'integer',
        ];
    }

    /**
     * The user (practitioner) this profile belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
