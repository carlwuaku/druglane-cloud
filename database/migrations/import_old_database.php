<?php

/**
 * Migration script to import data from old database (u342878697_stock_mgt)
 *
 * This script:
 * 1. Imports companies from the old companies table
 * 2. Maps users from admins table to individual companies
 * 3. Creates multiple user accounts if a parent company has multiple child companies
 * 4. Imports backups and converts paths to new structure
 *
 * Run this script using: php database/migrations/import_old_database.php
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

class OldDatabaseImporter
{
    private $oldDbFile;
    private $stats = [
        'companies_imported' => 0,
        'users_created' => 0,
        'backups_imported' => 0,
        'errors' => []
    ];

    public function __construct($oldDbFile)
    {
        $this->oldDbFile = $oldDbFile;
    }

    public function run()
    {
        echo "Starting migration from old database...\n\n";

        try {
            // Load SQL file and create temporary SQLite database
            $this->loadOldDatabase();

            // Import companies
            $this->importCompanies();

            // Import users (from admins table)
            $this->importUsers();

            // Import backups
            $this->importBackups();

            // Print summary
            $this->printSummary();

        } catch (\Exception $e) {
            echo "ERROR: " . $e->getMessage() . "\n";
            echo $e->getTraceAsString() . "\n";
        }
    }

    private function loadOldDatabase()
    {
        echo "Loading old database from SQL file...\n";

        if (!file_exists($this->oldDbFile)) {
            throw new \Exception("SQL file not found: {$this->oldDbFile}");
        }

        // Note: Since the old database is MySQL, we'll need to connect to MySQL temporarily
        // or parse the SQL file to extract the INSERT statements
        echo "SQL file loaded successfully.\n\n";
    }

    private function importCompanies()
    {
        echo "Importing companies...\n";

        // Read the SQL file and extract company data
        $sqlContent = file_get_contents($this->oldDbFile);

        // Extract companies INSERT statements
        if (preg_match('/INSERT INTO `companies`.*?VALUES\s*(.*?);/s', $sqlContent, $matches)) {
            $valuesString = $matches[1];

            // Parse the values
            $companies = $this->parseInsertValues($valuesString);

            foreach ($companies as $companyData) {
                try {
                    // companyData format: [id, name, phone, digital_address, address, email, parent_company, location, license_key, ...]
                    list($oldId, $name, $phone, $digitalAddress, $address, $email, $parentCompanyId, $location, $oldLicenseKey, $numberOfShifts, $restrictZeroStock, $logo, $receiptLogo, $otherField, $status, $createdOn) = $companyData;

                    // Generate new license key
                    $licenseKey = $this->generateLicenseKey();

                    // Create company
                    $company = DB::table('companies')->insertGetId([
                        'name' => $this->cleanString($name),
                        'email' => $this->cleanString($email) ?: 'info@' . strtolower(str_replace(' ', '', $this->cleanString($name))) . '.com',
                        'phone' => $this->cleanString($phone),
                        'address' => $this->cleanString($address),
                        'city' => $this->cleanString($location),
                        'country' => 'Ghana', // Assuming Ghana based on phone numbers
                        'license_key' => $licenseKey,
                        'license_status' => $this->cleanString($status) === 'Active' ? 'active' : 'inactive',
                        'license_issued_at' => now(),
                        'license_expires_at' => now()->addYear(),
                        'is_activated' => $this->cleanString($status) === 'Active' ? 1 : 0,
                        'activated_at' => $this->cleanString($status) === 'Active' ? now() : null,
                        'notes' => 'Imported from old database. Old ID: ' . $oldId . ', Parent Company ID: ' . $parentCompanyId,
                        'created_at' => $this->cleanString($createdOn) ?: now(),
                        'updated_at' => now(),
                    ]);

                    // Store mapping for later use
                    DB::table('old_company_mapping')->insert([
                        'old_company_id' => $oldId,
                        'new_company_id' => $company,
                        'old_parent_company_id' => $parentCompanyId,
                        'created_at' => now(),
                    ]);

                    $this->stats['companies_imported']++;
                    echo "  ✓ Imported company: {$this->cleanString($name)} (ID: $company)\n";

                } catch (\Exception $e) {
                    $this->stats['errors'][] = "Failed to import company: " . $e->getMessage();
                    echo "  ✗ Error importing company: {$e->getMessage()}\n";
                }
            }
        }

        echo "\nCompanies imported: {$this->stats['companies_imported']}\n\n";
    }

    private function importUsers()
    {
        echo "Importing users from admins table...\n";

        $sqlContent = file_get_contents($this->oldDbFile);

        // Extract admins INSERT statements
        if (preg_match('/INSERT INTO `admins`.*?VALUES\s*(.*?);/s', $sqlContent, $matches)) {
            $valuesString = $matches[1];
            $admins = $this->parseInsertValues($valuesString);

            // Get company_user role ID
            $companyUserRole = DB::table('roles')->where('name', 'company_user')->first();
            if (!$companyUserRole) {
                throw new \Exception("company_user role not found!");
            }

            foreach ($admins as $adminData) {
                try {
                    // adminData format: [id, display_name, email, phone, password_hash, parent_company_id, created_on, active]
                    list($oldId, $displayName, $email, $phone, $passwordHash, $parentCompanyId, $createdOn, $active) = $adminData;

                    // Find all companies under this parent company
                    $companies = DB::table('old_company_mapping')
                        ->where('old_parent_company_id', $parentCompanyId)
                        ->get();

                    if ($companies->isEmpty()) {
                        echo "  ⚠ Warning: No companies found for parent company ID: $parentCompanyId (Admin: {$this->cleanString($displayName)})\n";
                        continue;
                    }

                    // Create a user for each company
                    foreach ($companies as $companyMapping) {
                        $company = DB::table('companies')->find($companyMapping->new_company_id);

                        if (!$company) {
                            continue;
                        }

                        // Generate unique email if needed (for multiple users from same admin)
                        $userEmail = $this->cleanString($email);
                        if ($companies->count() > 1) {
                            // Append company name to email for uniqueness
                            $emailParts = explode('@', $userEmail);
                            $companySlug = strtolower(preg_replace('/[^a-z0-9]+/', '', $company->name));
                            $userEmail = $emailParts[0] . '+' . substr($companySlug, 0, 10) . '@' . $emailParts[1];
                        }

                        // Check if user already exists
                        $existingUser = DB::table('users')->where('email', $userEmail)->first();
                        if ($existingUser) {
                            echo "  ⚠ User already exists: $userEmail\n";
                            continue;
                        }

                        // Create user
                        $userId = DB::table('users')->insertGetId([
                            'name' => $this->cleanString($displayName),
                            'email' => $userEmail,
                            'email_verified_at' => now(),
                            'password' => $this->cleanString($passwordHash), // Keep old password hash (bcrypt compatible)
                            'phone' => $this->cleanString($phone),
                            'role_id' => $companyUserRole->id,
                            'company_id' => $company->id,
                            'active' => (int)$active === 1,
                            'created_at' => $this->cleanString($createdOn) ?: now(),
                            'updated_at' => now(),
                        ]);

                        $this->stats['users_created']++;

                        if ($companies->count() > 1) {
                            echo "  ✓ Created user: {$this->cleanString($displayName)} → {$company->name} ($userEmail)\n";
                        } else {
                            echo "  ✓ Created user: {$this->cleanString($displayName)} → {$company->name}\n";
                        }
                    }

                } catch (\Exception $e) {
                    $this->stats['errors'][] = "Failed to import admin: " . $e->getMessage();
                    echo "  ✗ Error importing admin: {$e->getMessage()}\n";
                }
            }
        }

        echo "\nUsers created: {$this->stats['users_created']}\n\n";
    }

    private function importBackups()
    {
        echo "Importing backups...\n";

        $sqlContent = file_get_contents($this->oldDbFile);

        // Extract backups INSERT statements
        if (preg_match('/INSERT INTO `backups`.*?VALUES\s*(.*?);/s', $sqlContent, $matches)) {
            $valuesString = $matches[1];
            $backups = $this->parseInsertValues($valuesString);

            foreach ($backups as $backupData) {
                try {
                    // backupData format: [id, name, phone, email, date, path, company_id]
                    list($oldId, $name, $phone, $email, $date, $oldPath, $oldCompanyId) = $backupData;

                    // Find new company ID
                    $mapping = DB::table('old_company_mapping')
                        ->where('old_company_id', $oldCompanyId)
                        ->first();

                    if (!$mapping) {
                        echo "  ⚠ Skipping backup for unknown company ID: $oldCompanyId\n";
                        continue;
                    }

                    // Parse old path to get filename
                    $filename = basename($this->cleanString($oldPath));
                    $originalFilename = $filename;

                    // Generate new path structure: storage/app/company_databases/{company_id}/
                    $newPath = "company_databases/{$mapping->new_company_id}/{$filename}";
                    $fullPath = storage_path("app/{$newPath}");

                    // Calculate file size (if file doesn't exist, use 0)
                    $fileSize = 0;
                    $sqlitePath = str_replace('.zip', '.db', $fullPath);

                    // Create database upload record
                    DB::table('company_database_uploads')->insert([
                        'company_id' => $mapping->new_company_id,
                        'original_filename' => $originalFilename,
                        'stored_filename' => $filename,
                        'file_path' => $newPath,
                        'sqlite_path' => str_replace('.zip', '.db', $newPath),
                        'file_size' => $fileSize,
                        'is_active' => true, // Mark latest upload as active
                        'uploaded_by' => null, // Unknown uploader
                        'notes' => "Imported from old database. Old backup ID: {$oldId}. Original path: {$this->cleanString($oldPath)}",
                        'created_at' => $this->cleanString($date) ?: now(),
                        'updated_at' => now(),
                    ]);

                    $this->stats['backups_imported']++;

                } catch (\Exception $e) {
                    $this->stats['errors'][] = "Failed to import backup: " . $e->getMessage();
                    echo "  ✗ Error importing backup: {$e->getMessage()}\n";
                }
            }

            // Update is_active flag - only the latest backup for each company should be active
            $companies = DB::table('old_company_mapping')->pluck('new_company_id');
            foreach ($companies as $companyId) {
                DB::table('company_database_uploads')
                    ->where('company_id', $companyId)
                    ->update(['is_active' => false]);

                $latestBackup = DB::table('company_database_uploads')
                    ->where('company_id', $companyId)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($latestBackup) {
                    DB::table('company_database_uploads')
                        ->where('id', $latestBackup->id)
                        ->update(['is_active' => true]);
                }
            }
        }

        echo "\nBackups imported: {$this->stats['backups_imported']}\n\n";
    }

    private function parseInsertValues($valuesString)
    {
        $rows = [];

        // Split by "),(" to get individual rows
        $rowStrings = preg_split('/\),\s*\(/', trim($valuesString, '()'));

        foreach ($rowStrings as $rowString) {
            $values = [];
            $inString = false;
            $currentValue = '';
            $escaped = false;

            for ($i = 0; $i < strlen($rowString); $i++) {
                $char = $rowString[$i];

                if ($escaped) {
                    $currentValue .= $char;
                    $escaped = false;
                    continue;
                }

                if ($char === '\\') {
                    $escaped = true;
                    continue;
                }

                if ($char === "'" && !$inString) {
                    $inString = true;
                    continue;
                }

                if ($char === "'" && $inString) {
                    $inString = false;
                    continue;
                }

                if ($char === ',' && !$inString) {
                    $values[] = $currentValue === 'NULL' ? null : $currentValue;
                    $currentValue = '';
                    continue;
                }

                $currentValue .= $char;
            }

            // Add last value
            $values[] = $currentValue === 'NULL' ? null : $currentValue;
            $rows[] = array_map('trim', $values);
        }

        return $rows;
    }

    private function generateLicenseKey()
    {
        do {
            $key = strtoupper(Str::random(32));
            $formatted = implode('-', str_split($key, 4));
        } while (DB::table('companies')->where('license_key', $formatted)->exists());

        return $formatted;
    }

    private function cleanString($value)
    {
        if ($value === null || $value === 'NULL' || $value === 'null') {
            return null;
        }

        return str_replace(['\'', '"'], '', trim($value));
    }

    private function printSummary()
    {
        echo "\n" . str_repeat('=', 60) . "\n";
        echo "MIGRATION SUMMARY\n";
        echo str_repeat('=', 60) . "\n";
        echo "Companies imported: {$this->stats['companies_imported']}\n";
        echo "Users created: {$this->stats['users_created']}\n";
        echo "Backups imported: {$this->stats['backups_imported']}\n";
        echo "Errors: " . count($this->stats['errors']) . "\n";

        if (!empty($this->stats['errors'])) {
            echo "\nErrors encountered:\n";
            foreach ($this->stats['errors'] as $error) {
                echo "  - $error\n";
            }
        }

        echo str_repeat('=', 60) . "\n\n";

        echo "NEXT STEPS:\n";
        echo "1. Review the imported data in your database\n";
        echo "2. Download backup files from old server and place them in storage/app/company_databases/{company_id}/\n";
        echo "3. Extract .zip files to .db files\n";
        echo "4. Test user logins (passwords are preserved from old system)\n";
        echo "5. Drop the temporary 'old_company_mapping' table when done: DROP TABLE old_company_mapping;\n";
        echo "\n";
    }
}

// Create temporary mapping table
try {
    DB::statement('CREATE TABLE IF NOT EXISTS old_company_mapping (
        old_company_id INT NOT NULL,
        new_company_id INT NOT NULL,
        old_parent_company_id INT NULL,
        created_at TIMESTAMP NULL
    )');
} catch (\Exception $e) {
    echo "Warning: Could not create mapping table: " . $e->getMessage() . "\n";
}

// Run the importer
$sqlFile = __DIR__ . '/../../u342878697_stock_mgt.sql';
if (!file_exists($sqlFile)) {
    echo "Error: SQL file not found at: $sqlFile\n";
    echo "Please ensure the u342878697_stock_mgt.sql file is in the root of the application.\n";
    exit(1);
}

$importer = new OldDatabaseImporter($sqlFile);
$importer->run();
