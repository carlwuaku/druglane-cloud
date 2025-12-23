# Angular App Deployment to Hostinger Subdomain

This guide explains how to deploy your Angular app to a separate Hostinger subdomain using GitHub Actions and FTP.

## 🏗️ Architecture

```
├── API Backend (Laravel)
│   └── api.yourdomain.com or yourdomain.com/api
│
└── Angular Frontend (SPA)
    └── app.yourdomain.com (separate subdomain)
```

## 📋 Prerequisites

### 1. Create Subdomain in Hostinger

1. Login to **Hostinger Control Panel**
2. Go to **Domains** → **Subdomains**
3. Click **Create Subdomain**
4. Enter: `app` (creates `app.yourdomain.com`)
5. Note the document root (usually `/public_html/app.yourdomain.com/`)

### 2. Get FTP Credentials for Subdomain

1. Go to **Files** → **FTP Accounts**
2. Either:
   - **Option A**: Use existing main FTP account (has access to all directories)
   - **Option B**: Create new FTP account specifically for the subdomain:
     - Username: `app@yourdomain.com`
     - Home Directory: `/public_html/app.yourdomain.com/`
     - Set strong password

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

   | Secret Name         | Value                          | Example                    |
   |---------------------|--------------------------------|----------------------------|
   | `APP_FTP_SERVER`    | Your FTP server hostname       | `ftp.yourdomain.com`       |
   | `APP_FTP_USERNAME`  | FTP username for subdomain     | `app@yourdomain.com`       |
   | `APP_FTP_PASSWORD`  | FTP password                   | `your-secure-password`     |

## 🔧 Configuration Files

### 1. Angular Environment Configuration

Update `UI/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  name: "production",

  // Update with your actual subdomain
  host: "https://app.yourdomain.com/",

  // API endpoints - point to your Laravel backend
  apiUrl: "https://api.yourdomain.com/api",  // or https://yourdomain.com/api

  // Base URL for the Angular app
  appUrl: "https://app.yourdomain.com"
};
```

### 2. Angular Build Configuration

The `UI/angular.json` is already configured:

```json
{
  "outputPath": "../public/app",
  "baseHref": "/app/"
}
```

For the subdomain deployment, we override this in the workflow to use `/` as baseHref.

### 3. GitHub Workflow

The workflow file `.github/workflows/deploy_ui.yml` is already configured to:

1. ✅ Build Angular app for production
2. ✅ Create optimized `.htaccess` for SPA routing
3. ✅ Deploy via FTP to your subdomain
4. ✅ Clean old files before deployment
5. ✅ Provide deployment summary

## 🚀 Deployment Process

### Automatic Deployment

The workflow will automatically deploy when:

1. **Push to main branch** AND changes are in the `UI/` directory
2. **Manual trigger** from GitHub Actions tab

### Manual Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Deploy Angular App to Subdomain** workflow
4. Click **Run workflow** dropdown
5. Select branch (`main`)
6. Click **Run workflow** button

### Build Process

```bash
# What GitHub Actions does automatically:

1. npm ci                          # Install dependencies
2. npm run build -- --config prod  # Build Angular app
3. Copy dist/browser/* files       # Prepare deployment
4. Create .htaccess               # SPA routing support
5. Upload via FTP                 # Deploy to subdomain
```

## 📁 Deployed File Structure

After deployment, your subdomain will have:

```
/public_html/app.yourdomain.com/
├── .htaccess                # SPA routing configuration
├── index.html              # Angular entry point
├── browser/                # Angular compiled files
│   ├── main-[hash].js
│   ├── polyfills-[hash].js
│   ├── styles-[hash].css
│   └── ...
├── favicon.ico
└── assets/                 # Static assets
    └── ...
```

## 🔍 Verification Steps

After deployment, verify everything works:

### 1. Check Homepage
```bash
curl https://app.yourdomain.com
# Should return index.html with Angular code
```

### 2. Check Routing
Visit these URLs directly (not through navigation):
- `https://app.yourdomain.com/`
- `https://app.yourdomain.com/dashboard`
- `https://app.yourdomain.com/products`
- `https://app.yourdomain.com/sales`

All should load the Angular app (not 404 errors).

### 3. Check API Connectivity

Open browser DevTools (F12) → Network tab, then:
1. Visit `https://app.yourdomain.com`
2. Try to login or access data
3. Check that API calls go to correct backend URL
4. Verify no CORS errors

### 4. Check .htaccess

Via FTP or File Manager, verify `.htaccess` exists:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

Options -Indexes
ErrorDocument 404 /index.html
```

## 🐛 Troubleshooting

### Issue: 404 on Angular Routes

**Symptoms**: Homepage loads, but `/dashboard` returns 404

**Solution**:
1. Check `.htaccess` is uploaded and has correct content
2. Verify Apache `mod_rewrite` is enabled (should be by default on Hostinger)
3. Check file permissions: `.htaccess` should be 644

### Issue: API Calls Fail with CORS Error

**Symptoms**: Console shows CORS error, API calls blocked

**Solution**:
1. Update Laravel backend `.env`:
   ```env
   SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
   SESSION_DOMAIN=.yourdomain.com
   ```

2. Update Laravel CORS config (`config/cors.php`):
   ```php
   'allowed_origins' => [
       'https://app.yourdomain.com',
   ],
   ```

3. Clear Laravel cache

### Issue: Blank Page After Deployment

**Symptoms**: Page loads but nothing displays

**Solutions**:
1. **Check browser console** (F12) for errors
2. **Verify base href**: Should be `/` for subdomain
3. **Check API URL**: Ensure it points to correct backend
4. **Clear browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Issue: CSS/JS Files Not Loading

**Symptoms**: Page loads but no styling, console shows 404 for assets

**Solutions**:
1. Check `baseHref` in build configuration
2. Verify all files uploaded via FTP
3. Check file paths in browser Network tab
4. Ensure `.htaccess` doesn't block asset files

### Issue: FTP Deployment Fails

**Symptoms**: GitHub Action fails at FTP upload step

**Solutions**:
1. **Verify FTP credentials** in GitHub Secrets:
   - `APP_FTP_SERVER`: Correct hostname
   - `APP_FTP_USERNAME`: Correct username
   - `APP_FTP_PASSWORD`: Correct password

2. **Test FTP connection** locally:
   ```bash
   ftp ftp.yourdomain.com
   # Enter username and password
   # If connection fails, contact Hostinger support
   ```

3. **Check FTP permissions**:
   - User must have write access to subdomain directory
   - Check in Hostinger FTP Accounts settings

### Issue: Old Version Still Shows

**Symptoms**: Deployed new version but old version still loads

**Solutions**:
1. **Clear browser cache**: Hard refresh (Ctrl+F5)
2. **Check deployment succeeded**: Review GitHub Actions logs
3. **Verify files uploaded**: Check FTP timestamp of files
4. **Clear CDN cache**: If using Cloudflare or similar

## 🔄 Update Workflow

When you make changes to the Angular app:

### Automatic Update

1. Make changes in `UI/` directory
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Update Angular app"
   git push origin main
   ```
3. GitHub Actions automatically builds and deploys
4. Check deployment status in Actions tab

### Manual Update

If you need to deploy without code changes:

1. Go to **Actions** tab
2. Select **Deploy Angular App to Subdomain**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

## 📊 Monitoring Deployments

### View Deployment History

1. Go to **Actions** tab in GitHub
2. See all workflow runs with timestamps
3. Click any run to see detailed logs

### Deployment Notifications

Set up notifications:

1. Go to **Settings** → **Notifications**
2. Enable **Actions** notifications
3. Choose email or GitHub notifications

## 🔒 Security Best Practices

### 1. FTP Credentials
- ✅ Use strong passwords
- ✅ Store only in GitHub Secrets (never commit)
- ✅ Rotate passwords periodically
- ✅ Use subdomain-specific FTP account (not main account)

### 2. HTTPS
- ✅ Enable SSL certificate for subdomain in Hostinger
- ✅ Force HTTPS (uncomment in `.htaccess`)
- ✅ Set `Secure` flag on cookies

### 3. Environment Variables
- ✅ Never commit API keys or secrets
- ✅ Use environment-specific configs
- ✅ Keep production URLs in `environment.prod.ts`

### 4. File Permissions
- ✅ `.htaccess`: 644
- ✅ Directories: 755
- ✅ Files: 644

## 📈 Performance Optimization

The workflow automatically includes:

### 1. Production Build
- ✅ AOT (Ahead-of-Time) compilation
- ✅ Minification and uglification
- ✅ Tree shaking (removes unused code)
- ✅ Source maps excluded

### 2. Caching Headers (in .htaccess)
- ✅ HTML: No cache (always fresh)
- ✅ CSS/JS: 1 year cache
- ✅ Images: 1 year cache
- ✅ Fonts: 1 year cache

### 3. Compression (in .htaccess)
- ✅ GZIP compression for text files
- ✅ Reduces bandwidth usage
- ✅ Faster page loads

## 🎯 Quick Reference

### Deploy Command (Manual)
```bash
# From local machine, build and preview:
cd UI
npm run build -- --configuration production

# View build output:
ls -la dist/browser/
```

### FTP Test Command
```bash
ftp ftp.yourdomain.com
# Enter credentials
# Should connect successfully
```

### Environment URLs

| Environment | Frontend URL | Backend URL |
|-------------|-------------|-------------|
| Local | `http://localhost:4200` | `http://localhost:8000` |
| Production | `https://app.yourdomain.com` | `https://api.yourdomain.com` |

## 📞 Support

If you need help:

1. **Check GitHub Actions logs** for build/deploy errors
2. **Check browser console** (F12) for runtime errors
3. **Review Hostinger logs** via File Manager
4. **Test FTP connection** independently
5. **Verify DNS** is propagated (may take 24-48 hours for new subdomain)

## ✅ Deployment Checklist

Before pushing to production:

- [ ] Subdomain created in Hostinger
- [ ] SSL certificate enabled for subdomain
- [ ] FTP account created/configured
- [ ] GitHub Secrets added (all 3)
- [ ] `environment.prod.ts` updated with correct URLs
- [ ] Angular app tested locally with production build
- [ ] API endpoints verified
- [ ] CORS configured in Laravel backend
- [ ] Workflow file committed to repository

After deployment:

- [ ] Visit subdomain URL - homepage loads
- [ ] Test routing - deep links work
- [ ] Test API calls - data loads
- [ ] Test authentication - login works
- [ ] Check browser console - no errors
- [ ] Test on mobile - responsive design works
- [ ] Verify HTTPS - secure connection
