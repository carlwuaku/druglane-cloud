# 📋 Deployment Checklist

Use this checklist to ensure a smooth deployment to Hostinger.

---

## Pre-Deployment Checklist

### ☐ Hostinger Account Setup

- [ ] Hostinger account active and accessible
- [ ] Subdomain created (e.g., `app.yourdomain.com`)
- [ ] Document root set to `public` directory
- [ ] PHP 8.2 or higher enabled
- [ ] Required PHP extensions enabled:
  - [ ] mbstring
  - [ ] xml
  - [ ] ctype
  - [ ] json
  - [ ] bcmath
  - [ ] pdo
  - [ ] pdo_sqlite
  - [ ] sqlite3
  - [ ] fileinfo
  - [ ] tokenizer

### ☐ Access Credentials Obtained

- [ ] FTP credentials noted
  - [ ] FTP Host
  - [ ] FTP Username
  - [ ] FTP Password
- [ ] SSH credentials noted
  - [ ] SSH Host
  - [ ] SSH Username
  - [ ] SSH Password/Key
  - [ ] SSH Port (usually 65002)
- [ ] Deployment path identified (run `pwd` in SSH)

### ☐ Email Configuration

- [ ] Email account created in Hostinger
- [ ] SMTP credentials available:
  - [ ] SMTP Host: `smtp.hostinger.com`
  - [ ] SMTP Port: `587`
  - [ ] Email address
  - [ ] Email password

### ☐ Local Development Ready

- [ ] Application works locally
- [ ] All tests passing
- [ ] No console errors in browser
- [ ] Database migrations tested
- [ ] Email sending tested
- [ ] All features working correctly

---

## GitHub Setup Checklist

### ☐ Repository Configuration

- [ ] Code pushed to GitHub
- [ ] Main branch is `main` (or update workflow to match)
- [ ] `.gitignore` properly configured
- [ ] No sensitive data in repository

### ☐ GitHub Secrets Configured

Go to: Settings → Secrets and variables → Actions

- [ ] `FTP_SERVER` added
- [ ] `FTP_USERNAME` added
- [ ] `FTP_PASSWORD` added
- [ ] `SSH_HOST` added
- [ ] `SSH_USERNAME` added
- [ ] `SSH_PASSWORD` added
- [ ] `SSH_PORT` added
- [ ] `DEPLOY_PATH` added

### ☐ Environment Files Updated

- [ ] `UI/src/environments/environment.prod.ts` updated with production URL
- [ ] `.env.production.example` reviewed
- [ ] Production URLs verified

---

## Initial Server Setup Checklist

### ☐ Connect to Server

```bash
ssh username@ssh.yourdomain.com -p 65002
```

- [ ] SSH connection successful
- [ ] Navigated to deployment directory
- [ ] Directory permissions are correct

### ☐ Database Setup

- [ ] SQLite database file created
  ```bash
  touch database/database.sqlite
  ```
- [ ] Database permissions set
  ```bash
  chmod 664 database/database.sqlite
  chmod 775 database/
  ```
- [ ] Database path correct in `.env`

### ☐ Environment File Created

- [ ] `.env` file created on server
- [ ] All values updated:
  - [ ] `APP_KEY` generated (`php artisan key:generate --show`)
  - [ ] `APP_URL` set to production URL
  - [ ] `DB_DATABASE` path correct
  - [ ] `MAIL_*` settings configured
  - [ ] `SANCTUM_STATEFUL_DOMAINS` set
  - [ ] `SESSION_DOMAIN` set

### ☐ Initial Setup Commands

- [ ] Migrations run
  ```bash
  php artisan migrate --force
  ```
- [ ] Permissions set
  ```bash
  chmod -R 755 storage bootstrap/cache
  ```
- [ ] Cache cleared and regenerated
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

---

## Deployment Checklist

### ☐ Automated Deployment (Recommended)

- [ ] All GitHub secrets configured
- [ ] Code committed to main branch
- [ ] Pushed to GitHub
- [ ] Deployment workflow triggered
- [ ] Workflow completed successfully (check Actions tab)

### ☐ Manual Deployment (Alternative)

- [ ] Run deployment script locally
  ```bash
  ./deploy.sh production
  ```
- [ ] Deployment package created successfully
- [ ] Package uploaded to Hostinger
- [ ] Files extracted to correct location
- [ ] Upload instructions followed

---

## Post-Deployment Verification

### ☐ API Testing

- [ ] Health endpoint accessible
  ```bash
  curl https://app.yourdomain.com/api/health
  ```
- [ ] API returns valid response
- [ ] No 500 errors
- [ ] Authentication endpoints working

### ☐ Frontend Testing

- [ ] Application loads at `https://app.yourdomain.com/app`
- [ ] No white screen
- [ ] No console errors (F12 → Console)
- [ ] Assets loading correctly
- [ ] Routes working (try different pages)

### ☐ Functionality Testing

- [ ] Login works
- [ ] Registration works (if enabled)
- [ ] Password reset works
- [ ] Dashboard loads
- [ ] All main features accessible
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] File uploads work (if applicable)

### ☐ Performance & Security

- [ ] HTTPS working (SSL certificate active)
- [ ] Page load time acceptable
- [ ] No mixed content warnings
- [ ] CORS configured correctly
- [ ] API authentication working
- [ ] Session management working

---

## Monitoring Setup Checklist

### ☐ Error Monitoring

- [ ] Error logs accessible
  ```bash
  tail -f storage/logs/laravel.log
  ```
- [ ] Error logging enabled in `.env`
- [ ] Log rotation configured (if needed)

### ☐ Uptime Monitoring

- [ ] Uptime monitor service configured (optional)
  - Recommended: UptimeRobot, Pingdom, or StatusCake
  - Monitor: `https://app.yourdomain.com/api/health`

### ☐ Backup Strategy

- [ ] Backup script created (see HOSTINGER_DEPLOYMENT.md)
- [ ] Cron job scheduled for automatic backups
- [ ] Backup location identified
- [ ] Backup restoration tested

---

## Troubleshooting Reference

### Common Issues Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| 500 Error | `chmod -R 755 storage bootstrap/cache` |
| White Screen | Check `public/.htaccess` exists |
| CORS Error | Update `SANCTUM_STATEFUL_DOMAINS` in `.env` |
| DB Error | `chmod 664 database/database.sqlite` |
| Routes 404 | Check `.htaccess` configuration |
| Email Not Sending | Verify SMTP credentials in `.env` |

### Log Files Locations

```bash
# Laravel application logs
storage/logs/laravel.log

# Web server error logs
~/logs/error_log

# Access logs
~/logs/access_log
```

---

## Maintenance Schedule

### Daily
- [ ] Monitor error logs for critical issues
- [ ] Check uptime status

### Weekly
- [ ] Review error logs
- [ ] Check backup success
- [ ] Monitor disk space usage

### Monthly
- [ ] Update dependencies
  ```bash
  composer update
  npm update
  ```
- [ ] Review and optimize database
- [ ] Test backup restoration
- [ ] Security audit

### Quarterly
- [ ] Review SSL certificate expiration
- [ ] Performance optimization review
- [ ] Security updates review

---

## Emergency Contacts & Resources

### Support Resources

- **Hostinger Support**: https://www.hostinger.com/tutorials
- **Laravel Documentation**: https://laravel.com/docs
- **Angular Documentation**: https://angular.io/docs
- **GitHub Actions**: https://docs.github.com/en/actions

### Quick SSH Commands

```bash
# Connect to server
ssh username@ssh.yourdomain.com -p 65002

# Navigate to app
cd public_html/app

# Check logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear

# Run migrations
php artisan migrate --force

# Set permissions
chmod -R 755 storage bootstrap/cache
```

---

## Sign-Off

### Deployment Completed By

- **Name**: ___________________
- **Date**: ___________________
- **Deployment Version**: ___________________

### Verification

- [ ] All checklist items completed
- [ ] Application fully tested
- [ ] Team notified of deployment
- [ ] Documentation updated

---

**🎉 Congratulations! Your application is live!**

For ongoing support and detailed troubleshooting, refer to:
- [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) - Quick reference
- [.github/workflows/README.md](.github/workflows/README.md) - GitHub Actions guide
