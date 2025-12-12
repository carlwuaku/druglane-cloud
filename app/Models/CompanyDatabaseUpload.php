<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyDatabaseUpload extends Model
{
    use HasFactory;
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'sqlite_path',
        'json_path',
        'original_filename',
        'file_size',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'file_size' => 'integer',
    ];

    /**
     * Get the company that owns the database upload.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the latest active upload for a company.
     */
    public static function getLatestForCompany(int $companyId): ?self
    {
        return self::where('company_id', $companyId)
            ->where('is_active', true)
            ->latest()
            ->first();
    }

    /**
     * Get the full path to the SQLite file.
     */
    public function getFullSqlitePath(): string
    {
        return storage_path('app/' . $this->sqlite_path);
    }

    /**
     * Get the full path to the JSON file if it exists.
     */
    public function getFullJsonPath(): ?string
    {
        return $this->json_path ? storage_path('app/' . $this->json_path) : null;
    }
}
