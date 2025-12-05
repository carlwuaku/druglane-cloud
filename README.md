# Druglane Cloud

A cloud-based management system for offline desktop inventory management applications. This server handles license management, backup storage, and provides online access to inventory data from desktop applications.

## Overview

Druglane Cloud serves as the central hub for:
- **License Management**: Register companies and generate activation keys for desktop apps
- **Backup Storage**: Receive and store periodic SQLite database backups from desktop clients
- **Online Data Access**: Enable users to access their inventory data through stored backups

## Technology Stack

### Backend
- **Laravel 11** (PHP 8.2+)
- **Laravel Sanctum 4** - API authentication
- **MySQL/PostgreSQL** - Primary database
- **SQLite** - Desktop app backup format

### Frontend
- **Angular** (to be set up in `frontend/` directory)
- Standalone from Laravel backend
- Communicates via REST API

## Project Structure

```
druglane-cloud/
├── app/                    # Laravel application code
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/       # API controllers
│   │   ├── Requests/      # Form request validators
│   │   └── Resources/     # API resources
│   └── Models/            # Eloquent models
├── config/                # Configuration files
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── routes/
│   ├── api.php           # API routes
│   └── web.php           # Web routes
├── storage/
│   └── app/
│       └── backups/      # SQLite backup storage (create this)
├── frontend/             # Angular application (to be created)
├── PROJECT_CONTEXT.md    # Detailed project documentation
└── README.md             # This file
```

## Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL or PostgreSQL
- Node.js 18+ and npm (for Angular frontend)
- Angular CLI (install with `npm install -g @angular/cli`)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd druglane-cloud
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Environment configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure:
- Database connection (DB_*)
- App URL and Frontend URL
- CORS settings
- License configuration
- Backup storage settings

### 4. Database setup

```bash
php artisan migrate
```

### 5. Create storage directory for backups

```bash
mkdir -p storage/app/backups
php artisan storage:link
```

### 6. Start the development server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## Angular Frontend Setup (To Be Created)

The Angular frontend will be set up in a separate `frontend/` directory:

```bash
# Create Angular application
ng new frontend --routing --style=scss

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The Angular app will run at `http://localhost:4200` by default.

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "user": {...},
  "token": "1|xyz..."
}
```

#### Logout
```
POST /api/logout
Authorization: Bearer {token}
```

#### Get Current User
```
GET /api/user
Authorization: Bearer {token}
```

### Protected Endpoints

All endpoints under `/api/*` (except signup/login) require authentication using Bearer token:

```
Authorization: Bearer {your-sanctum-token}
```

## Development

### Running Tests

```bash
php artisan test
```

### Code Formatting

```bash
./vendor/bin/pint
```

### Database Migrations

```bash
# Create new migration
php artisan make:migration create_companies_table

# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback
```

### Creating Controllers

```bash
# API Controller
php artisan make:controller Api/CompanyController --api

# With model
php artisan make:controller Api/BackupController --api --model=Backup
```

### Creating Models

```bash
# Model with migration
php artisan make:model Company -m

# Model with migration, factory, and seeder
php artisan make:model Backup -mfs
```

## Configuration

### CORS Settings

CORS is configured in [config/cors.php](config/cors.php) to allow requests from the Angular frontend.

Default allowed origins: `http://localhost:4200`

To modify in production, update the `CORS_ALLOWED_ORIGINS` environment variable:

```
CORS_ALLOWED_ORIGINS=https://app.druglane.com,https://druglane.com
```

### License Configuration

Configure license key generation in `.env`:

```
LICENSE_KEY_LENGTH=32
LICENSE_EXPIRATION_DAYS=365
```

### Backup Storage

Configure backup storage limits in `.env`:

```
BACKUP_STORAGE_DISK=local
BACKUP_STORAGE_PATH=backups
BACKUP_MAX_SIZE=52428800  # 50MB in bytes
BACKUP_RETENTION_DAYS=90
```

## Next Steps

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for detailed information about:
- Application architecture
- Database schema (current and planned)
- Future features to implement
- Security considerations
- Development roadmap

### Immediate Tasks

1. **Set up Angular frontend**
   - Create Angular project in `frontend/` directory
   - Configure API service to connect to Laravel backend
   - Implement authentication module

2. **Implement License Management**
   - Create companies table and model
   - Implement license key generation
   - Add license validation endpoints

3. **Implement Backup System**
   - Create backups table and model
   - Implement file upload handling
   - Add backup validation and storage

4. **Implement Online Data Access**
   - Create SQLite parser
   - Implement inventory query endpoints
   - Add caching layer

## Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# List all routes
php artisan route:list

# Enter tinker REPL
php artisan tinker

# Run specific migration
php artisan migrate --path=/database/migrations/2024_xx_xx_create_companies_table.php

# Create seeder
php artisan make:seeder CompanySeeder

# Run seeders
php artisan db:seed
```

## License

MIT

## Support

For issues and questions, refer to [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) or contact the development team.
