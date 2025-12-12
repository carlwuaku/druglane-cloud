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
        'jwt_key',
        'is_activated',
        'activated_at',
        'activated_by_machine_id',
        'license_status',
        'license_issued_at',
        'license_expires_at',
        'email',
        'phone',
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
        'is_activated' => 'boolean',
        'activated_at' => 'datetime',
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
     * Get the database uploads for the company.
     */
    public function databaseUploads(): HasMany
    {
        return $this->hasMany(CompanyDatabaseUpload::class);
    }

    /**
     * Get the latest active database upload.
     */
    public function getLatestDatabaseUpload(): ?CompanyDatabaseUpload
    {
        return $this->databaseUploads()
            ->where('is_active', true)
            ->latest()
            ->first();
    }

    /**
     * Get the full path to the latest SQLite database file.
     */
    public function getLatestSqlitePath(): ?string
    {
        $upload = $this->getLatestDatabaseUpload();
        return $upload ? $upload->getFullSqlitePath() : null;
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
     * Activate the license with machine ID.
     */
    public function activate(string $machineId): bool
    {
        if ($this->is_activated) {
            return false; // Already activated
        }

        $this->update([
            'is_activated' => true,
            'activated_at' => now(),
            'activated_by_machine_id' => $machineId,
            'license_status' => 'active',
        ]);

        return true;
    }

    /**
     * Check if license can be activated.
     */
    public function canActivate(): bool
    {
        return !$this->is_activated
            && $this->license_status !== 'suspended'
            && !$this->isLicenseExpired();
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
     * Generate a JWT key for signing tokens.
     */
    public static function generateJwtKey(): string
    {
        return bin2hex(random_bytes(32)); // 64 character hex string
    }

    /**
     * Get or generate JWT key.
     */
    public function getJwtKey(): string
    {
        if (empty($this->jwt_key)) {
            $this->jwt_key = self::generateJwtKey();
            $this->save();
        }
        return $this->jwt_key;
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
