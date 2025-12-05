# Druglane Cloud - Project Context

## Project Overview

**Druglane Cloud** is a cloud-based management system for an offline desktop inventory management application. This server acts as a central hub for license management, data backups, and online data access for the desktop application.

## Purpose

The system serves three primary functions:
1. **License Management**: Register companies and generate license keys for desktop app activation
2. **Backup Management**: Receive and store periodic SQLite database backups from desktop clients
3. **Online Data Access**: Enable desktop app users to access their inventory data online through their stored backups

## Architecture

### Desktop Application
- **Type**: Desktop inventory management system
- **Database**: SQLite (local)
- **Communication**: Periodically uploads backup copies to this server

### Cloud Server (This Application)
- **Framework**: Laravel 10.x (PHP 8.1+)
- **Authentication**: Laravel Sanctum (API token-based)
- **Frontend**: Transitioning to Angular (previously considering React)
- **API**: RESTful API for desktop app and web UI communication

## Current Technology Stack

### Backend
- **Framework**: Laravel 10.10
- **PHP Version**: ^8.1
- **Authentication**: Laravel Sanctum 3.3
- **HTTP Client**: Guzzle 7.2
- **Database**: MySQL/PostgreSQL (configurable)

### Frontend (In Transition)
- **Current**: Basic Vite setup with minimal JS
- **Target**: Angular application
- **Build Tool**: Vite 4.0

### Development Tools
- **Code Quality**: Laravel Pint
- **Testing**: PHPUnit 10.1
- **Local Development**: Laravel Sail (Docker)
- **Error Handling**: Spatie Laravel Ignition

## Database Schema

### Core Tables

#### Users Table
- `id` (Primary Key)
- `name` (String)
- `email` (Unique, String)
- `email_verified_at` (Timestamp, Nullable)
- `password` (String)
- `remember_token` (String, Nullable)
- `timestamps` (created_at, updated_at)

#### Personal Access Tokens Table
- Used by Laravel Sanctum for API authentication
- Links to users for token-based API access

#### Password Reset Tokens Table
- Manages password reset functionality

#### Failed Jobs Table
- Tracks failed queue jobs

### Future Schema Requirements

Based on the application purpose, the following tables will be needed:

#### Companies Table (To Be Created)
- `id` (Primary Key)
- `name` (Company name)
- `license_key` (Unique license key)
- `license_status` (active/inactive/expired)
- `license_issued_at` (Timestamp)
- `license_expires_at` (Timestamp, Nullable)
- `contact_email` (String)
- `contact_phone` (String, Nullable)
- `timestamps`

#### Backups Table (To Be Created)
- `id` (Primary Key)
- `company_id` (Foreign key to companies)
- `file_path` (Storage path to backup file)
- `file_size` (Integer, bytes)
- `uploaded_at` (Timestamp)
- `backup_date` (Date from desktop app)
- `status` (uploaded/processing/ready/failed)
- `metadata` (JSON, for additional backup info)
- `timestamps`

#### Desktop Users Table (To Be Created)
- `id` (Primary Key)
- `company_id` (Foreign key to companies)
- `username` (String)
- `email` (String)
- `password` (String, for web access)
- `desktop_user_id` (Integer, maps to desktop app user)
- `last_login` (Timestamp, Nullable)
- `timestamps`

## API Endpoints

### Current Endpoints

#### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login (returns Sanctum token)
- `POST /api/logout` - User logout (requires authentication)
- `GET /api/user` - Get authenticated user details

#### Users Management (Protected)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Future Endpoints (To Be Implemented)

#### License Management
- `POST /api/companies` - Register new company and generate license
- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/{id}` - Update company info
- `POST /api/licenses/validate` - Validate license key (for desktop app)
- `POST /api/licenses/renew` - Renew license

#### Backup Management
- `POST /api/backups/upload` - Upload backup from desktop app
- `GET /api/backups` - List backups for authenticated company
- `GET /api/backups/{id}` - Get backup details
- `GET /api/backups/{id}/download` - Download backup file
- `DELETE /api/backups/{id}` - Delete backup

#### Online Data Access
- `GET /api/inventory` - Query inventory from latest backup
- `GET /api/inventory/products` - List products
- `GET /api/inventory/categories` - List categories
- `GET /api/inventory/sales` - List sales records
- `GET /api/inventory/reports` - Generate reports from backup data

## Key Features to Implement

### 1. License Key Generation System
- Generate unique, secure license keys
- Validate license keys from desktop app
- Support license expiration and renewal
- Track license usage and activation status

### 2. Backup Upload System
- Accept SQLite database files from desktop app
- Validate backup integrity
- Store backups securely with versioning
- Maintain backup history per company
- Implement backup retention policies

### 3. Online Data Access Layer
- Parse SQLite backup files
- Provide REST API to query backup data
- Support common inventory queries (products, sales, reports)
- Implement caching for performance
- Handle multiple backup versions per company

### 4. Angular Frontend
- Company registration and license management UI
- Backup management dashboard
- Online inventory viewer
- Sales and reporting interface
- User management for company admins

## Security Considerations

1. **License Key Security**
   - Use cryptographically secure key generation
   - Implement rate limiting on validation endpoints
   - Log all license validation attempts

2. **Backup Security**
   - Encrypt backups at rest
   - Validate file types and sizes
   - Scan for malicious content
   - Implement access controls (companies can only access their backups)

3. **API Security**
   - All endpoints require Sanctum authentication
   - Implement role-based access control (RBAC)
   - Rate limiting on all API endpoints
   - CORS configuration for Angular frontend

4. **Data Privacy**
   - Each company's data is isolated
   - Implement soft deletes for audit trails
   - GDPR compliance considerations

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Basic Laravel 10 setup
- [x] Sanctum authentication
- [x] Basic user management API
- [ ] Update to latest Laravel version
- [ ] Remove React dependencies
- [ ] Setup Angular integration

### Phase 2: License Management
- [ ] Create companies table and model
- [ ] Implement license key generation
- [ ] License validation API
- [ ] License management CRUD

### Phase 3: Backup System
- [ ] Create backups table and model
- [ ] Implement file upload handling
- [ ] Backup storage system
- [ ] Backup validation and processing

### Phase 4: Online Data Access
- [ ] SQLite backup parser
- [ ] Inventory query API
- [ ] Caching layer
- [ ] Query optimization

### Phase 5: Frontend (Angular)
- [ ] Angular project setup
- [ ] Authentication module
- [ ] License management UI
- [ ] Backup management UI
- [ ] Inventory viewer
- [ ] Dashboard and reports

## File Structure

```
druglane-cloud/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       └── UserController.php
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   │   ├── LoginRequest.php
│   │   │   ├── SignupRequest.php
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   └── Resources/
│   │       └── UserResource.php
│   ├── Models/
│   │   └── User.php
│   └── Providers/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php (Main API routes)
│   ├── web.php
│   └── console.php
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
├── storage/
│   └── app/
│       └── backups/ (To be created for backup storage)
├── tests/
└── vendor/

Future Angular structure (to be added):
frontend/
├── src/
│   ├── app/
│   ├── assets/
│   └── environments/
├── angular.json
└── package.json
```

## Environment Configuration

### Required Environment Variables
```
APP_NAME=DruglaneCloud
APP_ENV=local|production
APP_KEY=base64:...
APP_DEBUG=true|false
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=druglane_cloud
DB_USERNAME=
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:4200 (Angular dev server)

# Backup Storage
BACKUP_STORAGE_PATH=backups
BACKUP_MAX_SIZE=52428800 (50MB in bytes)
BACKUP_RETENTION_DAYS=90

# License Configuration
LICENSE_KEY_LENGTH=32
LICENSE_EXPIRATION_DAYS=365
```

## Notes for Future Development

1. **SQLite Backup Handling**
   - Consider using SQLite PHP extension to query backups directly
   - Alternatively, create a backup parsing service
   - Implement read-only database connections for security

2. **Scalability**
   - Consider queue jobs for backup processing
   - Implement caching (Redis) for frequently accessed data
   - Use Laravel Horizon for queue monitoring

3. **Monitoring**
   - Track backup upload success/failure rates
   - Monitor license validation requests
   - Alert on suspicious activity

4. **Testing**
   - Write feature tests for all API endpoints
   - Test license key generation and validation
   - Test backup upload and retrieval
   - Integration tests for Angular frontend

## Useful Commands

```bash
# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_companies_table

# Create controller
php artisan make:controller Api/CompanyController --api

# Create model with migration
php artisan make:model Company -m

# Create form request
php artisan make:request StoreCompanyRequest

# Run tests
php artisan test

# Code formatting
./vendor/bin/pint

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate API documentation
php artisan route:list
```

## Contact & Support

This is an internal project for managing Druglane desktop application licenses and backups.

Last Updated: 2025-12-05
