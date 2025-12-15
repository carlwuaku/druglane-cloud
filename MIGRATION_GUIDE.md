# Database Migration Guide

## Overview

This guide explains how to import data from the old database (`u342878697_stock_mgt`) into the new Druglane Cloud application.

## What the Migration Does

The migration script handles:

1. **Companies**: Imports all companies from the old `companies` table
2. **Users**: Creates user accounts from the `admins` table, assigning them to specific companies instead of parent companies
3. **Multiple Companies**: If a parent company has multiple child companies, creates separate user accounts for each
4. **Backups**: Imports backup records and converts file paths to the new structure
5. **Password Preservation**: Keeps existing password hashes so users can log in with their old passwords

## Migration Logic

### Parent Company → Company Mapping

**Old Structure:**
- Parent Companies (e.g., "MEDITAB PHARMACY")
  - Company 1 (e.g., "Meditab Pharmacy - Accra")
  - Company 2 (e.g., "Meditab Pharmacy - Kumasi")
  - Company 3 (e.g., "Meditab Pharmacy - Takoradi")
- Admin users were assigned to parent companies and had access to ALL child companies

**New Structure:**
- Each company is independent
- Users are assigned to ONE specific company
- If an admin had access to 3 companies, 3 separate user accounts will be created

**Example:**

Old Database:
```
Admin: "Uriel Gyasi-Fosu" (email: sturielkg@gmail.com)
├─ Parent Company: "MEDITAB PHARMACY"
    ├─ Company 1: "Meditab Pharmacy - Accra"
    ├─ Company 2: "Meditab Pharmacy - Kumasi"
    └─ Company 3: "Meditab Pharmacy - Takoradi"
```

New Database:
```
User 1: "Uriel Gyasi-Fosu" (sturielkg+meditabaccra@gmail.com) → Meditab Pharmacy - Accra
User 2: "Uriel Gyasi-Fosu" (sturielkg+meditabkumasi@gmail.com) → Meditab Pharmacy - Kumasi
User 3: "Uriel Gyasi-Fosu" (sturielkg+meditabtakoradi@gmail.com) → Meditab Pharmacy - Takoradi
```

## Prerequisites

1. Place the `u342878697_stock_mgt.sql` file in the root directory of the application
2. Ensure your database is set up and migrations have been run
3. Have admin role and company_user role created in the `roles` table

## Running the Migration

### Step 1: Backup Your Current Database

```bash
# For MySQL
mysqldump -u your_username -p druglane_cloud > backup_before_migration.sql

# For SQLite
cp database/database.sqlite database/database.sqlite.backup
```

### Step 2: Run the Migration Script

```bash
cd /Users/carl/Documents/projects/druglane/druglane-cloud
php database/migrations/import_old_database.php
```

### Step 3: Review the Output

The script will show:
- ✓ Successfully imported items
- ⚠ Warnings for items that were skipped
- ✗ Errors encountered

Example output:
```
Starting migration from old database...

Importing companies...
  ✓ Imported company: MEDITAB PHARMACY (ID: 1)
  ✓ Imported company: GreenPick Health Shop (ID: 2)

Companies imported: 2

Importing users from admins table...
  ✓ Created user: Uriel Gyasi-Fosu → MEDITAB PHARMACY
  ✓ Created user: Rebecca Adu → GreenPick Health Shop

Users created: 2

Importing backups...
  ✓ Imported 45 backups

==========================================================
MIGRATION SUMMARY
==========================================================
Companies imported: 65
Users created: 87
Backups imported: 1500
Errors: 0
==========================================================
```

## Post-Migration Steps

### 1. Verify the Data

```bash
# Check companies
php artisan tinker
>>> \App\Models\Company::count()
>>> \App\Models\Company::with('users')->get()

# Check users
>>> \App\Models\User::where('role_id', 2)->count() // company_user role
>>> \App\Models\User::with('company')->get()

# Check backups
>>> \App\Models\CompanyDatabaseUpload::count()
```

### 2. Download and Extract Backup Files

The migration creates records in the database, but the actual backup files need to be downloaded from the old server:

```bash
# Create directory structure
mkdir -p storage/app/company_databases

# Download backups from old server (example)
# Replace with your actual old server details
scp user@oldserver:/path/to/backups/*.zip storage/app/temp_backups/

# Organize by company ID and extract
php artisan app:organize-backups
```

Or manually:

1. Download each backup file from the old server
2. Place in `storage/app/company_databases/{company_id}/`
3. Extract .zip files to .db files:

```bash
cd storage/app/company_databases/1/
unzip 1615719598.zip
mv *.db database.db  # Rename to standard name
```

### 3. Test User Logins

1. Go to the login page
2. Try logging in with an email from the old database
3. Use the same password as before (password hashes were preserved)

**If users have multiple accounts (due to multiple companies):**
- They should use the modified email: `original_email+companyname@domain.com`
- Or you can send them password reset emails

### 4. Update User Emails (Optional)

If users need simpler emails:

```php
php artisan tinker

// Find users with + in email
$users = \App\Models\User::where('email', 'like', '%+%')->get();

// Update manually or send password reset emails
foreach ($users as $user) {
    // Option 1: Send password reset
    Password::sendResetLink(['email' => $user->email]);

    // Option 2: Update email manually (get confirmation from user first)
    // $user->update(['email' => 'new_email@domain.com']);
}
```

### 5. Clean Up Temporary Table

Once you've verified everything is working:

```sql
DROP TABLE old_company_mapping;
```

## Troubleshooting

### Issue: Users can't log in

**Solution:**
- Check if the user's email exists in the database
- Try password reset: `php artisan password:reset user@example.com`
- Verify the user has `company_user` role assigned
- Check if the user's account is active

### Issue: Backup files not found

**Solution:**
- The migration only creates database records, not actual files
- You need to download backup files from the old server manually
- Place them in the correct directory structure

### Issue: Duplicate emails

**Solution:**
- The script automatically appends company names to emails if needed
- Users with modified emails will need to use: `original_email+companyname@domain.com`
- Send password reset emails to help them access their accounts

### Issue: Company has no users

**Solution:**
- Check if the parent company ID in the old database matches any entries
- Some companies might not have had admin users assigned
- Create users manually if needed

## Data Mapping Reference

| Old Table | Old Field | New Table | New Field | Notes |
|-----------|-----------|-----------|-----------|-------|
| companies | id | companies | - | New ID generated, old ID stored in notes |
| companies | name | companies | name | Direct copy |
| companies | email | companies | email | Cleaned |
| companies | phone | companies | phone | Direct copy |
| companies | address | companies | address | Direct copy |
| companies | location | companies | city | Renamed |
| companies | parent_company | - | - | Used for user mapping only |
| companies | status | companies | license_status | Active→active, else→inactive |
| companies | license_key | companies | license_key | New key generated |
| admins | display_name | users | name | Direct copy |
| admins | email | users | email | Modified if multiple companies |
| admins | password_hash | users | password | Preserved (bcrypt) |
| admins | parent_company_id | users | company_id | Mapped to actual company |
| admins | active | users | active | Direct copy |
| backups | company_id | company_database_uploads | company_id | Mapped to new ID |
| backups | path | company_database_uploads | file_path | Converted to new structure |
| backups | date | company_database_uploads | created_at | Direct copy |

## Support

If you encounter any issues during migration:

1. Check the error messages in the console output
2. Review the `errors` array in the migration summary
3. Check Laravel logs: `storage/logs/laravel.log`
4. Contact the development team with:
   - Console output
   - Error messages
   - Number of records expected vs. imported

## Rollback

If you need to rollback the migration:

```bash
# Restore from backup
mysql -u your_username -p druglane_cloud < backup_before_migration.sql

# Or for SQLite
cp database/database.sqlite.backup database/database.sqlite
```

## Notes

- The migration preserves all original data in the `notes` field for reference
- Old company IDs and parent company IDs are stored for troubleshooting
- Backup file paths are stored in notes for reference
- All timestamps are preserved from the old database
- License keys are regenerated for security
- All companies get 1-year license validity from import date
