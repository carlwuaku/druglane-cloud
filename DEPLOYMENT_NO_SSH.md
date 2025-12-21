# 🚀 Deployment Guide (FTP-Only - No SSH Required)

This guide is for deploying to Hostinger when **SSH access is not available**. The deployment uses only FTP and browser-based tools.

---

## ⚡ Quick Start (4 Simple Steps)

### 1️⃣ Hostinger Setup (5 minutes)

1. **Create Subdomain**
   - Login to Hostinger hPanel
   - Domains → Subdomains → Create
   - Name: `app` (for app.yourdomain.com)
   - Document Root: `public_html/app/public`

2. **Get FTP Credentials**
   - Files → FTP Accounts
   - Note: FTP Host, Username, Password

3. **Set PHP Version**
   - Advanced → PHP Configuration
   - Select your subdomain → PHP 8.2+

---

### 2️⃣ GitHub Secrets (2 minutes)

Go to: **GitHub Repo → Settings → Secrets → Actions → New secret**

**Only 3 secrets needed** (no SSH required):

| Secret Name | Example Value |
|------------|---------------|
| `FTP_SERVER` | `ftp.yourdomain.com` |
| `FTP_USERNAME` | `user@yourdomain.com` |
| `FTP_PASSWORD` | `your-ftp-password` |

---

### 3️⃣ Update Configuration (3 minutes)

**Update:** `UI/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  name: "production",
  host: "https://app.yourdomain.com/",
  apiUrl: "https://app.yourdomain.com/api",
  appUrl: "https://app.yourdomain.com"
};
```

---

### 4️⃣ Deploy! (Automatic)

```bash
# Commit and push to trigger deployment
git add .
git commit -m "Deploy to Hostinger"
git push origin main
```

**Watch deployment:** GitHub → Actions tab

---

## 📋 After First Deployment

After files are uploaded via FTP, complete these one-time setup steps:

### Step 1: Create .env File (via Hostinger File Manager)

1. **Open File Manager**
   - Login to Hostinger hPanel
   - Files → File Manager
   - Navigate to `public_html/app/`

2. **Create .env file**
   - Copy `.env.production.example` to `.env`
   - Edit `.env` and update:
     ```env
     APP_KEY=base64:YOUR_KEY_HERE  # See below how to generate
     APP_URL=https://app.yourdomain.com
     DB_DATABASE=/home/username/public_html/app/database/database.sqlite
     MAIL_USERNAME=noreply@yourdomain.com
     MAIL_PASSWORD=your_email_password
     ```

3. **Generate APP_KEY**
   - Create temporary file: `generate-key.php`
   - Add this code:
     ```php
     <?php
     echo 'base64:' . base64_encode(random_bytes(32));
     ```
   - Visit in browser: `https://app.yourdomain.com/generate-key.php`
   - Copy the generated key
   - Delete `generate-key.php`
   - Paste key into `.env` as `APP_KEY`

---

### Step 2: Run Post-Deployment Setup (via Browser)

1. **Visit the setup URL:**
   ```
   https://app.yourdomain.com/post-deploy.php?run_setup
   ```

2. **This automatically:**
   - ✅ Creates necessary directories
   - ✅ Sets permissions
   - ✅ Clears cache
   - ✅ Checks configuration
   - ✅ Creates database file

3. **IMPORTANT:** Delete `post-deploy.php` file after running!

---

### Step 3: Run Database Migrations (via Browser)

**Option A: Using Hostinger File Manager Terminal** (if available)

1. File Manager → Right-click on folder → Terminal
2. Run:
   ```bash
   php artisan migrate --force
   ```

**Option B: Create PHP Migration Script** (recommended if no terminal)

1. Create file: `run-migrations.php` in File Manager
2. Add this code:
   ```php
   <?php
   chdir(__DIR__);
   require 'vendor/autoload.php';

   $app = require_once 'bootstrap/app.php';
   $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

   echo "<pre>";
   echo "Running migrations...\n";

   $status = $kernel->call('migrate', ['--force' => true]);

   echo "\nMigrations completed!\n";
   echo "Status: " . ($status === 0 ? "SUCCESS" : "FAILED") . "\n";
   echo "</pre>";

   echo "<p><strong style='color: red;'>DELETE THIS FILE NOW!</strong></p>";
   ```

3. Visit: `https://app.yourdomain.com/run-migrations.php`
4. **IMPORTANT:** Delete `run-migrations.php` after running!

---

### Step 4: Set Permissions (via File Manager)

In Hostinger File Manager, set these permissions:

| Directory/File | Permission |
|----------------|------------|
| `storage/` | 755 (recursive) |
| `bootstrap/cache/` | 755 (recursive) |
| `database/database.sqlite` | 664 |

**How to set permissions:**
1. Right-click on folder/file
2. Select "Permissions" or "Change Permissions"
3. Set the number (e.g., 755)
4. Check "Recursive" for folders
5. Save

---

### Step 5: Test Deployment ✅

1. **Test API:** `https://app.yourdomain.com/api/health`
2. **Test Frontend:** `https://app.yourdomain.com/app`
3. **Test Login:** Try logging in
4. **Check Console:** Open browser console (F12) - should be no errors

---

## 🔄 Updating After Initial Setup

Every subsequent deployment is **automatic**:

1. Make changes to your code
2. Commit and push to `main` branch
3. GitHub Actions deploys automatically
4. Changes are live in ~3-5 minutes!

**No manual steps needed** after initial setup!

---

## 🛠️ Manual Deployment (Alternative)

If you prefer not to use GitHub Actions:

```bash
# Run the deployment script locally
./deploy.sh production

# This creates a .tar.gz file
# Upload it to Hostinger via FTP
# Extract and follow POST_DEPLOY_README.txt
```

---

## 🐛 Troubleshooting

### 500 Internal Server Error

**Fix via File Manager:**
1. Navigate to `storage/` folder
2. Right-click → Permissions → 755
3. Check "Recursive"
4. Save

### White Screen

**Check .htaccess:**
1. Navigate to `public/` folder
2. Verify `.htaccess` exists
3. If not, create it with this content:
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On

       # Handle Angular routes
       RewriteCond %{REQUEST_URI} ^/app
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule ^app/(.*)$ /app/index.html [L]

       # Handle Laravel routes
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteRule ^ index.php [L]
   </IfModule>
   ```

### Database Connection Error

**Fix:**
1. Open `.env` in File Manager
2. Verify `DB_DATABASE` path is correct
3. Check database file exists: `database/database.sqlite`
4. Set permissions: 664

### CORS Errors

**Fix in `.env`:**
```env
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

---

## 📊 Deployment Process Flow

```
Developer PC              GitHub Actions            Hostinger
    |                           |                        |
    |─ git push ────────────────>|                        |
    |                           |                        |
    |                      [Build Backend]               |
    |                      [Build Frontend]              |
    |                      [Create Package]              |
    |                           |                        |
    |                           |─ Upload via FTP ──────>|
    |                           |                        |
    |                           |                   [Files Ready]
    |                           |                        |
    |<────── Success ───────────|<───── Complete ────────|
    |                                                     |
    |                                              [Manual Setup]
    |                                              Browser: post-deploy.php
    |                                              Browser: run-migrations.php
    |                                                     |
    |<───────────── App is Live! ────────────────────────|
```

---

## ✅ Benefits of FTP-Only Deployment

- ✅ **No SSH required** - Works with basic Hostinger plans
- ✅ **Browser-based setup** - All post-deployment via web browser
- ✅ **Simple & secure** - Only FTP credentials needed
- ✅ **File Manager friendly** - All tasks via Hostinger File Manager
- ✅ **Automated** - After initial setup, deployments are automatic

---

## 📁 Files Uploaded During Deployment

The workflow automatically uploads:

- ✅ Laravel application (backend)
- ✅ Angular built app (frontend in `public/app/`)
- ✅ Vendor dependencies (Composer packages)
- ✅ `.htaccess` for routing
- ✅ `post-deploy.php` - One-time setup script
- ✅ `POST_DEPLOY_README.txt` - Instructions

**Excluded from upload:**
- ❌ `.git` folder
- ❌ `node_modules`
- ❌ `tests` folder
- ❌ `.env` files
- ❌ Development files

---

## 🔒 Security Best Practices

1. **Delete setup files after use:**
   - `post-deploy.php`
   - `run-migrations.php`
   - `generate-key.php`

2. **Never commit `.env` files**

3. **Use strong FTP password**

4. **Enable HTTPS** (usually automatic with Hostinger)

5. **Keep dependencies updated:**
   - Regular `composer update`
   - Regular `npm update`

---

## 📞 Need Help?

### Common Resources

- **Hostinger File Manager:** hPanel → Files → File Manager
- **PHP Configuration:** hPanel → Advanced → PHP Configuration
- **Email Setup:** hPanel → Email → Email Accounts

### Documentation

- **Quick Guide:** This file
- **Detailed Guide:** [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- **Checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🎉 Summary

**Initial Setup:** ~20 minutes (one-time)
**Subsequent Deploys:** Automatic (3-5 minutes)

**Required:**
- ✅ FTP access
- ✅ Hostinger File Manager
- ✅ Web browser
- ❌ SSH not required!

That's it! Your Laravel + Angular app deploys automatically to Hostinger without SSH! 🚀
