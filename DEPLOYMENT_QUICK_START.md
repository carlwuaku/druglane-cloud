# 🚀 Quick Start Deployment Guide

This is a condensed version of the deployment guide. For detailed instructions, see [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md).

## ⚡ Fast Track (5 Steps)

### 1️⃣ Hostinger Setup (5 minutes)

```bash
# Create subdomain in Hostinger hPanel
Domains → Subdomains → Create (e.g., app.yourdomain.com)
Document Root: public_html/app/public

# Enable SSH & Get Credentials
Advanced → SSH Access → Enable
Note: SSH Host, Username, Port (usually 65002)

# Set PHP to 8.2+
Advanced → PHP Configuration → Select subdomain → PHP 8.2
```

### 2️⃣ GitHub Secrets Setup (3 minutes)

Go to: GitHub Repo → Settings → Secrets → Actions → New secret

Add these secrets:

| Secret Name | Example Value |
|------------|---------------|
| `FTP_SERVER` | `ftp.yourdomain.com` |
| `FTP_USERNAME` | `user@yourdomain.com` |
| `FTP_PASSWORD` | `your-ftp-password` |
| `SSH_HOST` | `ssh.yourdomain.com` |
| `SSH_USERNAME` | `user@yourdomain.com` |
| `SSH_PASSWORD` | `your-ssh-password` |
| `SSH_PORT` | `65002` |
| `DEPLOY_PATH` | `/home/user/public_html/app` |

### 3️⃣ Update Environment Files (2 minutes)

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

**Create:** `.env` on server (via SSH or File Manager)
```bash
# Copy from .env.production.example
# Update APP_URL, DB paths, MAIL settings
```

### 4️⃣ Initial Server Setup (via SSH - 5 minutes)

```bash
# Connect to SSH
ssh user@ssh.yourdomain.com -p 65002

# Navigate to app directory
cd public_html/app

# Create database
touch database/database.sqlite
chmod 664 database/database.sqlite

# Set permissions
chmod -R 755 storage bootstrap/cache
chmod 775 database

# Run migrations
php artisan migrate --force

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5️⃣ Deploy! (Automatic)

```bash
# Commit and push to trigger deployment
git add .
git commit -m "Initial deployment"
git push origin main

# Watch deployment in GitHub
# Go to: GitHub Repo → Actions tab
```

---

## 📋 Alternative: Manual Deployment

If you prefer manual deployment:

```bash
# Run the deployment script
./deploy.sh production

# Upload the generated .tar.gz to Hostinger
# Extract and follow UPLOAD_INSTRUCTIONS.txt
```

---

## ✅ Verify Deployment

After deployment, check:

1. **Backend API**: `https://app.yourdomain.com/api/health`
2. **Frontend**: `https://app.yourdomain.com/app`
3. **Login**: Test user authentication
4. **Console**: Check browser console (F12) for errors

---

## 🐛 Common Issues & Quick Fixes

### 500 Error
```bash
chmod -R 755 storage bootstrap/cache
tail -f storage/logs/laravel.log
```

### White Screen
```bash
# Check Angular files
ls -la public/app/

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### CORS Errors
```env
# Add to .env
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

### Database Errors
```bash
# Verify database exists and has correct permissions
ls -la database/database.sqlite
chmod 664 database/database.sqlite
```

---

## 📞 Need Help?

- **Detailed Guide**: See [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- **Troubleshooting**: Check the "Troubleshooting" section in the detailed guide
- **Hostinger Support**: https://www.hostinger.com/tutorials

---

## 🔄 Updating After Initial Deployment

Every push to `main` branch automatically deploys. Or manually trigger:

```bash
# Go to GitHub → Actions → Deploy to Hostinger → Run workflow
```

That's it! Your app should be live! 🎉
