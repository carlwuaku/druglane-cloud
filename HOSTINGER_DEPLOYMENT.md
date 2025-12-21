# Hostinger Deployment Guide - Druglane Cloud

This guide provides step-by-step instructions for deploying your Laravel + Angular application to a Hostinger subdomain using GitHub Actions.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Hostinger Setup](#hostinger-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Environment Configuration](#environment-configuration)
5. [Initial Manual Deployment](#initial-manual-deployment)
6. [Automated Deployment Setup](#automated-deployment-setup)
7. [Testing the Deployment](#testing-the-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before starting, ensure you have:
- ✅ An active Hostinger hosting account (Business or higher recommended)
- ✅ A subdomain configured (e.g., `app.yourdomain.com`)
- ✅ GitHub repository with your code
- ✅ FTP and SSH access credentials from Hostinger
- ✅ PHP 8.2 or higher available on Hostinger
- ✅ Composer installed on Hostinger (or available via SSH)

---

## Hostinger Setup

### Step 1: Create a Subdomain

1. **Login to Hostinger hPanel**
   - Go to https://hpanel.hostinger.com
   - Navigate to your hosting account

2. **Create Subdomain**
   - Go to **Domains** → **Subdomains**
   - Click **Create Subdomain**
   - Enter subdomain name (e.g., `app` for `app.yourdomain.com`)
   - Set document root to `public_html/app` (or your preferred path)
   - Click **Create**

### Step 2: Get FTP Credentials

1. **Access FTP Accounts**
   - In hPanel, go to **Files** → **FTP Accounts**
   - Either use existing account or create new one
   - Note down:
     - FTP Host: `ftp.yourdomain.com`
     - FTP Username: `username@yourdomain.com`
     - FTP Password: (your password)
     - FTP Port: `21`

### Step 3: Get SSH Credentials

1. **Enable SSH Access**
   - In hPanel, go to **Advanced** → **SSH Access**
   - If not enabled, click **Enable SSH**
   - Note down:
     - SSH Host: `ssh.yourdomain.com` or `IP address`
     - SSH Username: (usually same as FTP)
     - SSH Port: `65002` (Hostinger default)

2. **Test SSH Connection**
   ```bash
   ssh username@ssh.yourdomain.com -p 65002
   ```

### Step 4: Configure PHP Version

1. **Set PHP Version**
   - In hPanel, go to **Advanced** → **PHP Configuration**
   - Select your subdomain
   - Choose **PHP 8.2** or higher
   - Enable required extensions:
     - ✅ mbstring
     - ✅ xml
     - ✅ ctype
     - ✅ json
     - ✅ bcmath
     - ✅ pdo
     - ✅ pdo_sqlite
     - ✅ sqlite3
     - ✅ fileinfo
     - ✅ tokenizer

---

## GitHub Repository Setup

### Step 1: Configure GitHub Secrets

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**

2. **Add Required Secrets**

   Add the following secrets:

   **FTP Credentials:**
   ```
   FTP_SERVER = ftp.yourdomain.com
   FTP_USERNAME = username@yourdomain.com
   FTP_PASSWORD = your-ftp-password
   ```

   **SSH Credentials:**
   ```
   SSH_HOST = ssh.yourdomain.com
   SSH_USERNAME = username@yourdomain.com
   SSH_PASSWORD = your-ssh-password
   SSH_PORT = 65002
   ```

   **Deployment Path:**
   ```
   DEPLOY_PATH = /home/username/public_html/app
   ```
   (Replace with your actual path - find it by running `pwd` in SSH)

   **Environment Variables (for production .env):**
   ```
   APP_ENV = production
   APP_DEBUG = false
   APP_KEY = base64:YOUR_APP_KEY_HERE
   APP_URL = https://app.yourdomain.com

   DB_CONNECTION = sqlite
   DB_DATABASE = /home/username/public_html/app/database/database.sqlite

   MAIL_MAILER = smtp
   MAIL_HOST = smtp.hostinger.com
   MAIL_PORT = 587
   MAIL_USERNAME = noreply@yourdomain.com
   MAIL_PASSWORD = your-email-password
   MAIL_ENCRYPTION = tls
   MAIL_FROM_ADDRESS = noreply@yourdomain.com
   MAIL_FROM_NAME = "Druglane"

   SESSION_DRIVER = file
   CACHE_DRIVER = file
   QUEUE_CONNECTION = sync
   ```

### Step 2: Generate Application Key

1. **Generate Key Locally**
   ```bash
   php artisan key:generate --show
   ```

2. **Copy the generated key** (starts with `base64:`)

3. **Add to GitHub Secrets** as `APP_KEY`

---

## Environment Configuration

### Step 1: Create Production .env File

Create a `.env.production` file locally (don't commit this):

```env
APP_NAME="Druglane Cloud"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://app.yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# SQLite Database (recommended for Hostinger)
DB_CONNECTION=sqlite
DB_DATABASE=/home/username/public_html/app/database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Hostinger SMTP Settings
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# CORS Settings for Angular
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

### Step 2: Update Angular Environment

Update `UI/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://app.yourdomain.com/api',
  appUrl: 'https://app.yourdomain.com'
};
```

---

## Initial Manual Deployment

Before automating, do a manual deployment to ensure everything works:

### Step 1: Connect via FTP

Use an FTP client (FileZilla, Cyberduck, etc.):

1. **Create directory structure:**
   ```
   public_html/app/
   ├── public/          (Laravel public directory - point subdomain here)
   ├── app/
   ├── bootstrap/
   ├── config/
   ├── database/
   ├── routes/
   ├── storage/
   └── vendor/
   ```

### Step 2: Upload Files via SSH (Recommended)

```bash
# Connect to SSH
ssh username@ssh.yourdomain.com -p 65002

# Navigate to your directory
cd public_html/app

# Clone your repository (if Git is available)
git clone https://github.com/yourusername/druglane-cloud.git .

# Or use SFTP to upload files
```

### Step 3: Install Dependencies

```bash
# SSH into your server
ssh username@ssh.yourdomain.com -p 65002

# Navigate to app directory
cd public_html/app

# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Install Node/NPM dependencies for Angular
cd UI
npm ci
npm run build

# Go back to root
cd ..
```

### Step 4: Set Up Laravel

```bash
# Create .env file
cp .env.production .env

# Create SQLite database
touch database/database.sqlite

# Set permissions
chmod -R 755 storage bootstrap/cache
chmod 664 database/database.sqlite

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 5: Configure Document Root

1. **In Hostinger hPanel:**
   - Go to **Domains** → **Subdomains**
   - Click **Manage** on your subdomain
   - Set **Document Root** to: `/public_html/app/public`
   - Save changes

### Step 6: Create/Update .htaccess

Create `public/.htaccess` with:

```apache
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
```

---

## Automated Deployment Setup

### Step 1: Review Workflow File

The GitHub Actions workflow (`.github/workflows/deploy.yml`) is already created. Review it and ensure:

1. ✅ Branch name is correct (`main` or `master`)
2. ✅ Node version matches your local setup
3. ✅ PHP version is compatible with Hostinger
4. ✅ Angular build command is correct

### Step 2: Update Workflow (if needed)

Key sections to customize:

```yaml
# Change branch if needed
on:
  push:
    branches:
      - main  # or 'master'

# Update Angular project name if different
- name: Build Angular app
  working-directory: ./UI
  run: npm run build  # Ensure this matches your build script
```

### Step 3: Test Automated Deployment

1. **Make a small change** to trigger deployment:
   ```bash
   echo "# Deployment test" >> README.md
   git add README.md
   git commit -m "Test automated deployment"
   git push origin main
   ```

2. **Monitor deployment**:
   - Go to GitHub repository
   - Click **Actions** tab
   - Watch the deployment progress

---

## Testing the Deployment

### Step 1: Verify Backend API

```bash
# Test API endpoint
curl https://app.yourdomain.com/api/health

# Should return Laravel response
```

### Step 2: Verify Frontend

1. **Open browser** to `https://app.yourdomain.com/app`
2. **Check console** for errors (F12)
3. **Test login** functionality
4. **Verify API calls** are working

### Step 3: Check Logs

```bash
# SSH into server
ssh username@ssh.yourdomain.com -p 65002

# Check Laravel logs
tail -f public_html/app/storage/logs/laravel.log

# Check PHP errors
tail -f public_html/logs/error_log
```

---

## Troubleshooting

### Common Issues

#### 1. **500 Internal Server Error**

**Solution:**
```bash
# Check permissions
chmod -R 755 storage bootstrap/cache
chmod 664 database/database.sqlite

# Check .env file exists
ls -la .env

# Check Laravel logs
tail storage/logs/laravel.log
```

#### 2. **White Screen / No Content**

**Solution:**
```bash
# Ensure Angular built correctly
ls -la public/app/

# Check .htaccess exists
cat public/.htaccess

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

#### 3. **CORS Errors**

**Solution:**

Update `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['https://app.yourdomain.com'],
'supports_credentials' => true,
```

#### 4. **Database Connection Errors**

**Solution:**
```bash
# Ensure SQLite file exists
touch database/database.sqlite

# Set correct permissions
chmod 664 database/database.sqlite
chmod 775 database/

# Check .env database path
cat .env | grep DB_DATABASE
```

#### 5. **Composer/Dependencies Issues**

**Solution:**
```bash
# Remove vendor and reinstall
rm -rf vendor/
composer install --no-dev --optimize-autoloader

# Update Composer autoloader
composer dump-autoload --optimize
```

#### 6. **Angular Routes Not Working (404)**

**Solution:**

Update `public/.htaccess` to include Angular route handling:
```apache
# Handle Angular routes
RewriteCond %{REQUEST_URI} ^/app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^app/(.*)$ /app/index.html [L]
```

---

## Post-Deployment Checklist

After successful deployment, verify:

- [ ] ✅ Application accessible at subdomain URL
- [ ] ✅ HTTPS/SSL certificate active
- [ ] ✅ Login functionality working
- [ ] ✅ API endpoints responding correctly
- [ ] ✅ Database migrations completed
- [ ] ✅ Email sending working
- [ ] ✅ File uploads working (if applicable)
- [ ] ✅ CORS configured correctly
- [ ] ✅ Error logging enabled
- [ ] ✅ Backups configured
- [ ] ✅ Monitoring set up

---

## Continuous Deployment

Once set up, deployments are automatic:

1. **Push to main branch** → Automatic deployment
2. **Manual deployment** → Go to Actions → Run workflow
3. **Rollback** → Revert commit and push

---

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Ensure .gitignore includes
   .env
   .env.*
   !.env.example
   ```

2. **Use strong passwords** for FTP/SSH

3. **Disable directory browsing** in `.htaccess`:
   ```apache
   Options -Indexes
   ```

4. **Set proper file permissions**:
   ```bash
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   chmod -R 775 storage bootstrap/cache
   ```

5. **Keep dependencies updated**:
   ```bash
   composer update
   npm update
   ```

---

## Backup Strategy

### Automated Backups

Create a backup script at `scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/username/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp database/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup .env
cp .env $BACKUP_DIR/env_$DATE.txt

# Compress and backup entire app (optional)
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
    --exclude='vendor' \
    --exclude='node_modules' \
    --exclude='storage/logs/*' \
    .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Schedule via Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /home/username/public_html/app && bash scripts/backup.sh
```

---

## Monitoring and Maintenance

### Monitor Application

1. **Set up uptime monitoring**:
   - Use services like UptimeRobot, Pingdom, or StatusCake
   - Monitor: `https://app.yourdomain.com/api/health`

2. **Check logs regularly**:
   ```bash
   # Laravel logs
   tail -f storage/logs/laravel.log

   # Web server logs
   tail -f ~/logs/error_log
   ```

### Regular Maintenance

- **Weekly**: Check logs for errors
- **Monthly**: Update dependencies
- **Quarterly**: Review and optimize database
- **Yearly**: Review and update SSL certificates

---

## Support and Resources

- **Hostinger Support**: https://www.hostinger.com/tutorials
- **Laravel Docs**: https://laravel.com/docs
- **Angular Docs**: https://angular.io/docs
- **GitHub Actions**: https://docs.github.com/en/actions

---

## Quick Reference Commands

```bash
# SSH Connect
ssh username@ssh.yourdomain.com -p 65002

# Navigate to app
cd public_html/app

# Pull latest code (if using Git)
git pull origin main

# Update dependencies
composer install --no-dev --optimize-autoloader
cd UI && npm ci && npm run build && cd ..

# Run migrations
php artisan migrate --force

# Clear cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check logs
tail -f storage/logs/laravel.log

# Set permissions
chmod -R 755 storage bootstrap/cache
```

---

**Deployment successful! 🚀**

Your Druglane Cloud application should now be live at `https://app.yourdomain.com/app`
