#!/bin/bash

###############################################################################
# Manual Deployment Script for Hostinger
#
# This script helps with manual deployment when GitHub Actions is not desired
#
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production
###############################################################################

set -e  # Exit on error

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_DIR="$SCRIPT_DIR/deployment-$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo "========================================"
    echo "$1"
    echo "========================================"
    echo ""
}

check_requirements() {
    print_header "Checking Requirements"

    # Check PHP
    if ! command -v php &> /dev/null; then
        print_error "PHP is not installed"
        exit 1
    fi
    print_success "PHP found: $(php -v | head -n 1)"

    # Check Composer
    if ! command -v composer &> /dev/null; then
        print_error "Composer is not installed"
        exit 1
    fi
    print_success "Composer found: $(composer --version)"

    # Check Node
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node -v)"

    # Check NPM
    if ! command -v npm &> /dev/null; then
        print_error "NPM is not installed"
        exit 1
    fi
    print_success "NPM found: $(npm -v)"
}

install_backend_dependencies() {
    print_header "Installing Backend Dependencies"

    cd "$SCRIPT_DIR"
    composer install --no-dev --optimize-autoloader --no-interaction

    print_success "Backend dependencies installed"
}

build_frontend() {
    print_header "Building Frontend Application"

    cd "$SCRIPT_DIR/UI"

    print_info "Installing dependencies..."
    npm ci

    print_info "Building Angular application..."
    npm run build

    print_success "Frontend built successfully"
    cd "$SCRIPT_DIR"
}

create_deployment_package() {
    print_header "Creating Deployment Package"

    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"

    print_info "Copying Laravel files..."
    rsync -av \
        --exclude='.git' \
        --exclude='.github' \
        --exclude='node_modules' \
        --exclude='UI' \
        --exclude='tests' \
        --exclude='.env' \
        --exclude='.env.example' \
        --exclude='phpunit.xml' \
        --exclude='.editorconfig' \
        --exclude='.gitignore' \
        --exclude='.gitattributes' \
        --exclude='*.md' \
        --exclude='storage/app/backups' \
        --exclude='deployment-*' \
        ./ "$DEPLOY_DIR/"

    print_info "Copying built Angular files..."
    mkdir -p "$DEPLOY_DIR/public/app"
    cp -r UI/dist/practitioners-portal/browser/* "$DEPLOY_DIR/public/app/"

    print_info "Creating necessary directories..."
    mkdir -p "$DEPLOY_DIR/storage/framework/"{sessions,views,cache}
    mkdir -p "$DEPLOY_DIR/storage/logs"
    mkdir -p "$DEPLOY_DIR/bootstrap/cache"

    print_info "Creating .htaccess..."
    create_htaccess "$DEPLOY_DIR/public/.htaccess"

    print_success "Deployment package created at: $DEPLOY_DIR"
}

create_htaccess() {
    cat > "$1" << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Angular routes (anything under /app)
    RewriteCond %{REQUEST_URI} ^/app
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^app/(.*)$ /app/index.html [L]

    # Handle Laravel routes (API and web routes)
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF
}

create_deployment_instructions() {
    print_header "Deployment Instructions"

    cat > "$DEPLOY_DIR/UPLOAD_INSTRUCTIONS.txt" << EOF
===========================================
HOSTINGER DEPLOYMENT INSTRUCTIONS
===========================================

Deployment Package: $(basename "$DEPLOY_DIR")
Created: $(date)

STEP 1: Upload Files
-------------------------------------------
1. Connect to your Hostinger account via FTP or File Manager
2. Navigate to your subdomain directory (e.g., public_html/app/)
3. Upload ALL contents of this folder to your subdomain directory
4. Ensure the 'public' folder is set as the document root

STEP 2: Create .env File
-------------------------------------------
1. In the root directory, create a file named '.env'
2. Copy the contents from .env.example or use the template below
3. Update the values with your production settings

Minimal .env template:
----------------------
APP_NAME="Druglane Cloud"
APP_ENV=production
APP_KEY=base64:GENERATE_NEW_KEY_USING_php_artisan_key:generate
APP_DEBUG=false
APP_URL=https://app.yourdomain.com

DB_CONNECTION=sqlite
DB_DATABASE=/home/username/public_html/app/database/database.sqlite

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Druglane Cloud"

STEP 3: Set Up Database
-------------------------------------------
Via SSH (recommended):
    ssh username@ssh.yourdomain.com -p 65002
    cd public_html/app
    touch database/database.sqlite
    chmod 664 database/database.sqlite
    php artisan migrate --force

Or via File Manager:
    1. Navigate to database/ folder
    2. Create empty file named 'database.sqlite'
    3. Set permissions to 664

STEP 4: Set Permissions
-------------------------------------------
Via SSH:
    chmod -R 755 storage bootstrap/cache
    chmod 664 database/database.sqlite

Via File Manager:
    - storage/ → 755 (recursive)
    - bootstrap/cache/ → 755 (recursive)
    - database/database.sqlite → 664

STEP 5: Cache Configuration
-------------------------------------------
Via SSH:
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

STEP 6: Test Deployment
-------------------------------------------
1. Visit: https://app.yourdomain.com/api/health
2. Visit: https://app.yourdomain.com/app
3. Test login functionality
4. Check browser console for errors (F12)

TROUBLESHOOTING
-------------------------------------------
- If 500 error: Check storage permissions and .env file
- If blank page: Check public/.htaccess exists
- If CORS errors: Update SANCTUM_STATEFUL_DOMAINS in .env
- If database errors: Verify database path in .env

For detailed troubleshooting, see HOSTINGER_DEPLOYMENT.md

===========================================
EOF

    print_success "Upload instructions created"
}

compress_package() {
    print_header "Compressing Deployment Package"

    cd "$SCRIPT_DIR"
    tar -czf "deployment-$TIMESTAMP.tar.gz" -C "$DEPLOY_DIR" .

    print_success "Package compressed: deployment-$TIMESTAMP.tar.gz"
    print_info "Size: $(du -h deployment-$TIMESTAMP.tar.gz | cut -f1)"
}

cleanup_old_deployments() {
    print_info "Cleaning up old deployment packages..."

    # Keep only last 3 deployment packages
    cd "$SCRIPT_DIR"
    ls -t deployment-*.tar.gz 2>/dev/null | tail -n +4 | xargs -r rm --
    ls -td deployment-*/ 2>/dev/null | tail -n +4 | xargs -r rm -rf --

    print_success "Cleanup completed"
}

main() {
    print_header "Druglane Cloud - Manual Deployment Script"
    print_info "Environment: $ENVIRONMENT"
    print_info "Timestamp: $TIMESTAMP"

    # Run deployment steps
    check_requirements
    install_backend_dependencies
    build_frontend
    create_deployment_package
    create_deployment_instructions
    compress_package
    cleanup_old_deployments

    # Final success message
    print_header "Deployment Package Ready!"
    echo ""
    print_success "Deployment package created successfully!"
    echo ""
    print_info "Package location: $DEPLOY_DIR"
    print_info "Compressed file: deployment-$TIMESTAMP.tar.gz"
    echo ""
    print_info "Next steps:"
    echo "  1. Extract and review: deployment-$TIMESTAMP.tar.gz"
    echo "  2. Read: UPLOAD_INSTRUCTIONS.txt inside the package"
    echo "  3. Upload to Hostinger via FTP or File Manager"
    echo "  4. Follow the setup instructions"
    echo ""
    print_info "For detailed guidance, see: HOSTINGER_DEPLOYMENT.md"
    echo ""
}

# Run main function
main
