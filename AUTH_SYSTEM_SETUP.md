# Authentication & Authorization System Setup

## Overview

The Druglane Cloud application now has a complete role-based authentication and authorization system with two user types:
- **Admins**: Full system access, can manage all companies and users
- **Company Users**: Can only access their own company's data

## Database Schema

### Tables Created

#### 1. `roles` Table
- `id` - Primary key
- `name` - Unique role identifier (admin, company_user)
- `display_name` - Human-readable role name
- `description` - Role description
- `timestamps`

#### 2. `companies` Table
- `id` - Primary key
- `name` - Company name
- `license_key` - Unique auto-generated license key (format: XXXX-XXXX-XXXX-XXXX-...)
- `license_status` - Enum: active, inactive, expired, suspended
- `license_issued_at` - Timestamp when license was issued
- `license_expires_at` - License expiration date
- `contact_email` - Company contact email
- `contact_phone` - Optional phone number
- `address`, `city`, `country` - Location fields
- `notes` - Admin notes about the company
- `timestamps`
- `deleted_at` - Soft delete timestamp

#### 3. `users` Table (Updated)
- `id` - Primary key
- `role_id` - Foreign key to roles table
- `company_id` - Foreign key to companies table (nullable for admins)
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `is_active` - Boolean flag for account status
- `last_login_at` - Timestamp of last login
- `email_verified_at` - Email verification timestamp
- `remember_token`
- `timestamps`

## Models

### Role Model
Location: [app/Models/Role.php](app/Models/Role.php)

**Constants:**
- `Role::ADMIN` - 'admin'
- `Role::COMPANY_USER` - 'company_user'

**Methods:**
- `users()` - Has many users
- `isAdmin()` - Check if role is admin
- `isCompanyUser()` - Check if role is company user

### Company Model
Location: [app/Models/Company.php](app/Models/Company.php)

**Features:**
- Auto-generates unique license keys on creation
- Soft deletes enabled
- License expiration management

**Methods:**
- `users()` - Has many users
- `backups()` - Has many backups (for future implementation)
- `isLicenseActive()` - Check if license is currently active
- `isLicenseExpired()` - Check if license has expired
- `generateLicenseKey()` - Static method to generate unique license keys

**Key Generation:**
- 32-character key formatted as: `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
- Guaranteed unique across all companies

### User Model
Location: [app/Models/User.php](app/Models/User.php)

**Relationships:**
- `role()` - Belongs to a role
- `company()` - Belongs to a company (nullable)

**Authorization Methods:**
- `isAdmin()` - Check if user is an admin
- `isCompanyUser()` - Check if user is a company user
- `hasAccessToCompany($companyId)` - Check if user can access specific company data
- `updateLastLogin()` - Update last login timestamp

**Query Scopes:**
- `active()` - Get only active users
- `admins()` - Get only admin users
- `companyUsers()` - Get only company users
- `forCompany($companyId)` - Get users for specific company

## Middleware

### 1. EnsureUserIsAdmin
Location: [app/Http/Middleware/EnsureUserIsAdmin.php](app/Http/Middleware/EnsureUserIsAdmin.php)

**Usage:** `middleware(['admin'])`

**Description:** Ensures the authenticated user has admin role. Returns 403 if user is not an admin.

### 2. EnsureUserIsActive
Location: [app/Http/Middleware/EnsureUserIsActive.php](app/Http/Middleware/EnsureUserIsActive.php)

**Usage:** `middleware(['active'])`

**Description:** Ensures the authenticated user's account is active. Returns 403 if account is deactivated.

### 3. EnsureCompanyLicenseActive
Location: [app/Http/Middleware/EnsureCompanyLicenseActive.php](app/Http/Middleware/EnsureCompanyLicenseActive.php)

**Usage:** `middleware(['license.active'])`

**Description:** Ensures company users have an active license. Admins bypass this check. Returns 403 if license is inactive or expired.

**Middleware Registration:**
All middleware are registered in [app/Http/Kernel.php](app/Http/Kernel.php) under `$middlewareAliases`.

## API Endpoints

### Public Endpoints

#### POST /api/login
**Description:** Authenticate user and receive token

**Request:**
```json
{
  "email": "admin@druglane.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "role_id": 1,
    "company_id": null,
    "name": "System Administrator",
    "email": "admin@druglane.com",
    "is_active": true,
    "last_login_at": "2025-12-05T19:45:30.000000Z",
    "role": {
      "id": 1,
      "name": "admin",
      "display_name": "Administrator"
    },
    "company": null
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "role": "admin",
  "company": null
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account deactivated or license expired

#### POST /api/signup
**Description:** Public registration (currently disabled)

**Response (403):**
```json
{
  "message": "Public registration is disabled. Please contact an administrator to create your account."
}
```

### Protected Endpoints

All protected endpoints require:
- `Authorization: Bearer {token}` header
- Active user account
- Valid company license (for company users)

#### POST /api/logout
**Description:** Logout and invalidate current token

**Response (204):** No content

#### GET /api/user
**Description:** Get current authenticated user with role and company

**Response (200):**
```json
{
  "user": { ... },
  "role": "admin",
  "company": null
}
```

#### GET /api/my-company
**Description:** Get company information for current user (company users only)

**Response (200):**
```json
{
  "id": 1,
  "name": "Acme Corporation",
  "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
  "license_status": "active",
  "license_expires_at": "2026-12-05T00:00:00.000000Z",
  ...
}
```

### Admin-Only Endpoints

These endpoints require `admin` role:

#### Companies Management

**GET /api/companies**
- List all companies with pagination and filters
- Query params: `search`, `status`, `per_page`

**POST /api/companies**
- Create a new company
- License key is auto-generated
- Default license: 1 year from creation

Request:
```json
{
  "name": "New Company Ltd",
  "contact_email": "contact@newcompany.com",
  "contact_phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "notes": "Premium customer"
}
```

**GET /api/companies/{id}**
- Get company details with users

**PUT/PATCH /api/companies/{id}**
- Update company information

**DELETE /api/companies/{id}**
- Soft delete company (only if no users)

**POST /api/companies/{id}/activate**
- Activate company license

**POST /api/companies/{id}/deactivate**
- Deactivate company license

**POST /api/companies/{id}/renew-license**
- Renew/extend company license

Request:
```json
{
  "days": 365
}
```

#### Users Management

**GET /api/users**
- List all users

**POST /api/users**
- Create a new user

**GET /api/users/{id}**
- Get user details

**PUT/PATCH /api/users/{id}**
- Update user

**DELETE /api/users/{id}**
- Delete user

## Initial Admin Account

A default admin account is created automatically when running migrations with seed:

**Email:** `admin@druglane.com`
**Password:** `password`

⚠️ **IMPORTANT:** Change this password immediately in production!

## Running Migrations and Seeders

### Fresh Install
```bash
# Run migrations and seed database
php artisan migrate:fresh --seed
```

### Production Setup
```bash
# Run migrations only
php artisan migrate

# Seed roles
php artisan db:seed --class=RoleSeeder

# Create admin user
php artisan db:seed --class=AdminUserSeeder
```

## Testing the Authentication System

### 1. Login as Admin

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@druglane.com",
    "password": "password"
  }'
```

Save the `token` from the response.

### 2. Get Current User

```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create a Company (Admin Only)

```bash
curl -X POST http://localhost:8000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "contact_email": "test@company.com"
  }'
```

### 4. List All Companies (Admin Only)

```bash
curl -X GET http://localhost:8000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Features

### Authentication
- Laravel Sanctum for API token authentication
- Passwords hashed using bcrypt
- Token-based session management

### Authorization
- Role-based access control (RBAC)
- Middleware-protected routes
- Company data isolation for company users

### License Management
- Automatic license key generation
- License expiration tracking
- Active license validation on every request
- License status enforcement (active, inactive, expired, suspended)

### Account Security
- Active/inactive account status
- Last login tracking
- Soft delete for companies and users
- Protected routes with multiple middleware layers

## Next Steps

### 1. Create User Management for Admins
- Admin UI to create/edit/delete users
- Assign users to companies
- Set user roles

### 2. Implement Company User Registration
- Invite code system for company users
- Email verification
- Password reset functionality

### 3. Add Backup Management
- Create backups table
- File upload endpoints
- Backup listing and download for company users

### 4. Implement Desktop App License Validation
- API endpoint for desktop app to validate license
- Desktop app authentication
- License activation flow

### 5. Add Online Data Access
- SQLite backup parser
- Inventory query endpoints
- Reports and analytics

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# License Management
LICENSE_KEY_LENGTH=32
LICENSE_EXPIRATION_DAYS=365

# CORS for Angular Frontend
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:4200
```

## Troubleshooting

### 403 Forbidden on Login
- Check if user account is active
- Verify company license is active (for company users)
- Ensure role is assigned correctly

### 401 Unauthorized on Protected Routes
- Verify token is included in Authorization header
- Check token is not expired
- Ensure user has not logged out

### Companies Cannot Be Deleted
- Check if company has users
- Remove or reassign users first
- Then delete company

### License Key Generation Fails
- Ensure `LICENSE_KEY_LENGTH` is set in config
- Check database connection
- Verify unique constraint on license_key column

## Files Modified/Created

### Migrations
- `2025_12_05_193902_create_roles_table.php`
- `2025_12_05_193902_create_companies_table.php`
- `2025_12_05_193903_add_role_and_company_to_users_table.php`

### Models
- `app/Models/Role.php`
- `app/Models/Company.php`
- `app/Models/User.php` (updated)

### Controllers
- `app/Http/Controllers/Api/AuthController.php` (updated)
- `app/Http/Controllers/Api/CompanyController.php`

### Middleware
- `app/Http/Middleware/EnsureUserIsAdmin.php`
- `app/Http/Middleware/EnsureUserIsActive.php`
- `app/Http/Middleware/EnsureCompanyLicenseActive.php`
- `app/Http/Kernel.php` (updated)

### Seeders
- `database/seeders/RoleSeeder.php`
- `database/seeders/AdminUserSeeder.php`
- `database/seeders/DatabaseSeeder.php` (updated)

### Routes
- `routes/api.php` (updated)

## Support

For issues or questions, refer to [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for overall application context.
