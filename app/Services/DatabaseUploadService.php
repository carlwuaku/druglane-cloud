<?php

namespace App\Services;

use App\Models\CompanyDatabaseUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class DatabaseUploadService
{
    /**
     * Process uploaded zip file and extract database files.
     *
     * @param UploadedFile $file
     * @param int $companyId
     * @param array $metadata
     * @return CompanyDatabaseUpload
     * @throws \Exception
     */
    public function processUpload(UploadedFile $file, int $companyId, array $metadata = []): CompanyDatabaseUpload
    {
        // Validate the uploaded file is a zip
        if ($file->getClientOriginalExtension() !== 'zip') {
            throw new \Exception('Only ZIP files are allowed');
        }

        $timestamp = round(microtime(true));
        $uploadDir = "company_uploads/{$companyId}/{$timestamp}";

        // Store the uploaded zip file temporarily
        $zipPath = $file->storeAs($uploadDir, 'upload.zip');
        $fullZipPath = Storage::path($zipPath);

        try {
            // Extract the zip file
            $extractedFiles = $this->extractZipFile($fullZipPath, $uploadDir);

            // Find SQLite and JSON files
            $sqlitePath = $this->findFileByExtension($extractedFiles, ['db', 'sqlite', 'sqlite3']);
            $jsonPath = $this->findFileByExtension($extractedFiles, ['json']);

            if (!$sqlitePath) {
                throw new \Exception('No SQLite database file found in the uploaded ZIP');
            }

            // Create database record
            $upload = CompanyDatabaseUpload::create([
                'company_id' => $companyId,
                'name' => $metadata['name'] ?? null,
                'email' => $metadata['email'] ?? null,
                'phone' => $metadata['phone'] ?? null,
                'sqlite_path' => $sqlitePath,
                'json_path' => $jsonPath,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'is_active' => true,
            ]);

            // Clean up: delete the zip file after extraction
            Storage::delete($zipPath);

            Log::info('Database upload processed successfully', [
                'company_id' => $companyId,
                'upload_id' => $upload->id,
                'sqlite_path' => $sqlitePath,
            ]);

            return $upload;

        } catch (\Exception $e) {
            // Clean up on failure
            Storage::deleteDirectory($uploadDir);

            Log::error('Database upload failed', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract zip file to storage directory.
     *
     * @param string $zipPath
     * @param string $extractToDir
     * @return array List of extracted file paths
     * @throws \Exception
     */
    protected function extractZipFile(string $zipPath, string $extractToDir): array
    {
        $zip = new ZipArchive();

        if ($zip->open($zipPath) !== true) {
            throw new \Exception('Failed to open ZIP file');
        }

        $extractedFiles = [];
        $extractPath = Storage::path($extractToDir);

        // Create extraction directory if it doesn't exist
        if (!is_dir($extractPath)) {
            mkdir($extractPath, 0755, true);
        }

        // Extract each file
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);

            // Skip directories and hidden files
            if (str_ends_with($filename, '/') || str_starts_with(basename($filename), '.')) {
                continue;
            }

            // Extract file
            $zip->extractTo($extractPath, $filename);
            $relativePath = $extractToDir . '/' . $filename;
            $extractedFiles[] = $relativePath;
        }

        $zip->close();

        return $extractedFiles;
    }

    /**
     * Find a file with specific extensions in the extracted files.
     *
     * @param array $files
     * @param array $extensions
     * @return string|null
     */
    protected function findFileByExtension(array $files, array $extensions): ?string
    {
        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($extension, $extensions)) {
                return $file;
            }
        }

        return null;
    }

    /**
     * Get the latest SQLite database path for a company.
     *
     * @param int $companyId
     * @return string|null
     */
    public function getLatestDatabasePath(int $companyId): ?string
    {
        $upload = CompanyDatabaseUpload::getLatestForCompany($companyId);

        return $upload ? $upload->getFullSqlitePath() : null;
    }

    /**
     * Deactivate old uploads for a company (optional cleanup).
     *
     * @param int $companyId
     * @param int $keepLatest Number of recent uploads to keep active
     * @return int Number of deactivated uploads
     */
    public function deactivateOldUploads(int $companyId, int $keepLatest = 5): int
    {
        $uploads = CompanyDatabaseUpload::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($uploads->count() <= $keepLatest) {
            return 0;
        }

        $toDeactivate = $uploads->slice($keepLatest);
        $count = 0;

        foreach ($toDeactivate as $upload) {
            $upload->update(['is_active' => false]);
            $count++;
        }

        return $count;
    }
}
