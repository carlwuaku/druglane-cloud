<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'license_key',
        'license_status',
        'license_issued_at',
        'license_expires_at',
        'contact_email',
        'contact_phone',
        'address',
        'city',
        'country',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'license_issued_at' => 'datetime',
        'license_expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the users for the company.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the backups for the company.
     */
    public function backups(): HasMany
    {
        return $this->hasMany(Backup::class);
    }

    /**
     * Check if the license is active.
     */
    public function isLicenseActive(): bool
    {
        if ($this->license_status !== 'active') {
            return false;
        }

        if ($this->license_expires_at && $this->license_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if the license is expired.
     */
    public function isLicenseExpired(): bool
    {
        return $this->license_expires_at && $this->license_expires_at->isPast();
    }

    /**
     * Generate a unique license key.
     */
    public static function generateLicenseKey(): string
    {
        $length = config('app.license_key_length', 32);

        do {
            $key = strtoupper(Str::random($length));
            // Format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
            $formatted = implode('-', str_split($key, 4));
        } while (self::where('license_key', $formatted)->exists());

        return $formatted;
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($company) {
            if (empty($company->license_key)) {
                $company->license_key = self::generateLicenseKey();
            }
            if (empty($company->license_issued_at)) {
                $company->license_issued_at = now();
            }
        });
    }
}
