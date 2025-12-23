# Hostinger Deployment Setup

This guide explains how to deploy the Laravel + Angular app to Hostinger with the Angular app accessible at `mydomain.com/app` and Laravel handling API routes.

## 📁 Directory Structure on Hostinger

```
/home/username/
├── druglane-cloud/              (Laravel app - OUTSIDE public_html)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                  (this becomes your web root)
│   │   ├── .htaccess           (configured for /app routing)
│   │   ├── index.php           (Laravel entry point)
│   │   └── app/                (Angular build output - deployed here)
│   │       ├── index.html
│   │       ├── browser/
│   │       └── ...
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   └── ...
└── public_html -> druglane-cloud/public  (symlink to public folder)
```

## 🚀 Deployment Steps

### Step 1: Build Angular App Locally

```bash
cd /Users/carl/Documents/projects/druglane/druglane-cloud/UI

# Install dependencies (if not already done)
npm install

# Build for production
npm run build

# This will create files in: ../public/app/
```

### Step 2: Upload Files to Hostinger via FTP

Upload these directories to `/home/username/druglane-cloud/`:

1. **Laravel Core Files:**
   - `app/`
   - `bootstrap/`
   - `config/`
   - `database/`
   - `routes/`
   - `storage/` (with subdirectories)
   - `vendor/` (or run `composer install --no-dev` on server)
   - `.env` file (with production settings)
   - `artisan`
   - `composer.json`

2. **Public Directory:**
   - `public/.htaccess` (already configured)
   - `public/index.php`
   - `public/app/` (Angular build output)
   - `public/favicon.ico`
   - `public/robots.txt`

### Step 3: Configure public_html

**Option A: Using Symlink (if you have SSH):**
```bash
# SSH into your server
ssh username@yourdomain.com

# Remove default public_html
mv public_html public_html.backup

# Create symlink
ln -s /home/username/druglane-cloud/public public_html
```

**Option B: Without SSH (via FTP):**

1. **Copy public contents to public_html:**
   - Copy everything from `druglane-cloud/public/*` to `public_html/`

2. **Update `public_html/index.php`:**
   ```php
   <?php

   use Illuminate\Contracts\Http\Kernel;
   use Illuminate\Http\Request;

   define('LARAVEL_START', microtime(true));

   // Update paths to point to druglane-cloud directory
   if (file_exists($maintenance = __DIR__.'/../druglane-cloud/storage/framework/maintenance.php')) {
       require $maintenance;
   }

   require __DIR__.'/../druglane-cloud/vendor/autoload.php';

   $app = require_once __DIR__.'/../druglane-cloud/bootstrap/app.php';

   $kernel = $app->make(Kernel::class);

   $response = $kernel->handle(
       $request = Request::capture()
   )->send();

   $kernel->terminate($request, $response);
   ```

### Step 4: Set File Permissions

Via FTP or SSH, set these permissions:

```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### Step 5: Configure Environment

Update `.env` file in `/home/username/druglane-cloud/.env`:

```env
APP_NAME="DrugLane"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=sqlite
DB_DATABASE=/home/username/druglane-cloud/database/database.sqlite

# Add other production settings
```

### Step 6: Clear Cache (via Browser)

Create `public_html/clear.php` temporarily:

```php
<?php
require __DIR__.'/../druglane-cloud/vendor/autoload.php';
$app = require_once __DIR__.'/../druglane-cloud/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');

$kernel->call('cache:clear');
$kernel->call('config:clear');
$kernel->call('route:clear');
$kernel->call('view:clear');

echo "✅ All caches cleared!<br>";
echo "🗑️ Please delete this file (clear.php) now for security!";
?>
```

Visit: `https://yourdomain.com/clear.php` then delete the file.

## 🔗 How Routing Works

After setup, your site will work like this:

### Angular App Routes (Frontend)
- `https://yourdomain.com/app` → Angular app home
- `https://yourdomain.com/app/dashboard` → Angular dashboard
- `https://yourdomain.com/app/products` → Angular products page
- `https://yourdomain.com/app/sales` → Angular sales page

All Angular routes are handled by `/app/index.html` due to the `.htaccess` rewrite rules.

### Laravel API Routes (Backend)
- `https://yourdomain.com/api/login` → Laravel API
- `https://yourdomain.com/api/products` → Laravel API
- `https://yourdomain.com/api/company-data/stats` → Laravel API

All API routes are handled by Laravel's `index.php`.

## 📝 .htaccess Configuration Explained

```apache
# Angular App Routes (mydomain.com/app)
RewriteCond %{REQUEST_URI} ^/app($|/)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^app/?(.*)$ /app/index.html [L]
```

**What this does:**
1. Checks if the request starts with `/app`
2. If the requested file/directory doesn't exist
3. Serves `/app/index.html` (Angular's entry point)
4. Angular's router handles the rest

```apache
# Laravel API Routes
RewriteCond %{REQUEST_URI} !^/app
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

**What this does:**
1. For any request NOT starting with `/app`
2. If the file/directory doesn't exist
3. Send to Laravel's `index.php`

## 🧪 Testing After Deployment

### Test Angular App:
```bash
# Visit these URLs:
https://yourdomain.com/app
https://yourdomain.com/app/dashboard
https://yourdomain.com/app/products
```

### Test Laravel API:
```bash
# Test API endpoints:
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/products
```

### Check for Issues:
```bash
# View Laravel logs:
# Via FTP, download: storage/logs/laravel.log

# Check if storage is writable:
https://yourdomain.com/check-permissions.php
```

Create `public_html/check-permissions.php`:
```php
<?php
$storagePath = __DIR__.'/../druglane-cloud/storage';
$cachePath = __DIR__.'/../druglane-cloud/bootstrap/cache';

echo "Storage writable: " . (is_writable($storagePath) ? '✅ Yes' : '❌ No') . "<br>";
echo "Cache writable: " . (is_writable($cachePath) ? '✅ Yes' : '❌ No') . "<br>";
echo "Storage path: " . $storagePath . "<br>";
echo "<br>🗑️ Delete this file after checking!";
?>
```

## 🔄 Updating the Deployment

When you make changes:

### Update Angular:
```bash
cd UI
npm run build
# Upload public/app/* to server's public_html/app/
```

### Update Laravel:
```bash
# Upload changed PHP files
# Then clear cache by visiting: yourdomain.com/clear.php
```

## 🐛 Common Issues

### Issue: "404 Not Found" on Angular routes
**Solution:** Check that `.htaccess` is uploaded and mod_rewrite is enabled.

### Issue: "500 Internal Server Error"
**Solution:**
1. Check `storage/logs/laravel.log`
2. Verify storage permissions (755 or 775)
3. Ensure `.env` file exists

### Issue: Angular app loads but API calls fail
**Solution:**
1. Check API base URL in Angular environment files
2. Verify Laravel routes with: `php artisan route:list`
3. Check CORS configuration in Laravel

### Issue: CSS/JS files not loading in Angular app
**Solution:**
1. Verify `baseHref` is set to `/app/` in `angular.json`
2. Check browser console for 404 errors
3. Ensure all files in `public/app/` are uploaded

## 📋 Pre-Deployment Checklist

Before deploying:

- [ ] Angular app builds successfully (`npm run build`)
- [ ] `.htaccess` configured with app routing rules
- [ ] `angular.json` has correct `outputPath` and `baseHref`
- [ ] `.env` file configured for production
- [ ] Database file uploaded (if using SQLite)
- [ ] Storage directories created
- [ ] File permissions set correctly
- [ ] API endpoints tested locally
- [ ] Angular environment files point to production API

## 🔒 Security Notes

1. **Never expose `.env` file** - it should be OUTSIDE public_html
2. **Delete test files** - Remove `clear.php`, `check-permissions.php` after use
3. **Set APP_DEBUG=false** in production
4. **Use HTTPS** - Enable SSL certificate in Hostinger
5. **Restrict database access** - Set proper permissions on SQLite file

## 📞 Need Help?

If you encounter issues:
1. Check `storage/logs/laravel.log`
2. Check browser console (F12) for Angular errors
3. Test API endpoints with curl or Postman
4. Verify file permissions and paths
