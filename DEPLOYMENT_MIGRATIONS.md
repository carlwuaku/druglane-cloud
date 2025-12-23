# Running Migrations Without SSH Access

This guide explains how to run database migrations on Hostinger without SSH access using secure API endpoints.

## 🔐 Security Overview

The deployment endpoints are protected by a secret token and only work in production environments. This prevents unauthorized access while allowing you to manage your deployment.

## 📋 Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/deploy/migrate` | POST | Run database migrations |
| `/api/deploy/clear-cache` | POST | Clear all application caches |
| `/api/deploy/optimize` | POST | Optimize app (cache config, routes, views) |
| `/api/deploy/status` | GET | Get deployment status and environment info |

## 🔧 Setup Instructions

### 1. Generate a Secure Deployment Token

On your local machine, generate a secure random token:

```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using PHP
php -r "echo bin2hex(random_bytes(32));"

# Option 3: Online generator
# Visit: https://generate-random.org/api-token-generator
```

**Example output:**
```
Y8vK3mN9pQ2xR5wT7uV1bC4dE6fH8jL0nM2oP4qS6tU8vX0zA2cD4eF6gH8iJ0kL
```

### 2. Add Token to Server .env File

Update your `.env` file on the Hostinger server:

```env
# Deployment Token (keep this secret!)
DEPLOY_TOKEN=Y8vK3mN9pQ2xR5wT7uV1bC4dE6fH8jL0nM2oP4qS6tU8vX0zA2cD4eF6gH8iJ0kL

# Ensure production environment
APP_ENV=production
```

### 3. Add Token to GitHub Secrets (Optional - for automatic deployment)

If you want GitHub Actions to automatically run migrations after deployment:

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DEPLOY_TOKEN`
5. Value: Your generated token
6. Click **Add secret**

## 🚀 Using the Endpoints

### Run Migrations

```bash
curl -X POST https://yourdomain.com/api/deploy/migrate \
  -H "X-Deploy-Token: Y8vK3mN9pQ2xR5wT7uV1bC4dE6fH8jL0nM2oP4qS6tU8vX0zA2cD4eF6gH8iJ0kL" \
  -H "Accept: application/json"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Migrations completed successfully",
  "output": "Migration table created successfully.\nMigrating: 2024_01_01_000000_create_users_table\nMigrated:  2024_01_01_000000_create_users_table",
  "timestamp": "2025-12-23 10:30:45"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Unauthorized. Invalid deployment token.",
}
```

### Clear Cache

```bash
curl -X POST https://yourdomain.com/api/deploy/clear-cache \
  -H "X-Deploy-Token: YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Optimize Application

```bash
curl -X POST https://yourdomain.com/api/deploy/optimize \
  -H "X-Deploy-Token: YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Check Status

```bash
curl https://yourdomain.com/api/deploy/status \
  -H "X-Deploy-Token: YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "success": true,
  "environment": "production",
  "php_version": "8.2.0",
  "laravel_version": "10.x",
  "database": "sqlite",
  "cache_driver": "file",
  "queue_driver": "sync",
  "timestamp": "2025-12-23 10:30:45"
}
```

## 🤖 Automate with GitHub Actions

Add this step to your deployment workflow to automatically run migrations after deployment:

```yaml
# .github/workflows/deploy.yml

- name: Run migrations after deployment
  if: success()
  run: |
    echo "🔄 Running database migrations..."

    response=$(curl -s -w "\n%{http_code}" -X POST \
      https://yourdomain.com/api/deploy/migrate \
      -H "X-Deploy-Token: ${{ secrets.DEPLOY_TOKEN }}" \
      -H "Accept: application/json")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo "Response: $body"

    if [ "$http_code" -eq 200 ]; then
      echo "✅ Migrations completed successfully"
    else
      echo "❌ Migration failed with status code: $http_code"
      exit 1
    fi

- name: Clear cache after migrations
  if: success()
  run: |
    echo "🧹 Clearing application cache..."

    curl -X POST https://yourdomain.com/api/deploy/clear-cache \
      -H "X-Deploy-Token: ${{ secrets.DEPLOY_TOKEN }}" \
      -H "Accept: application/json"

    echo "✅ Cache cleared"

- name: Optimize application
  if: success()
  run: |
    echo "⚡ Optimizing application..."

    curl -X POST https://yourdomain.com/api/deploy/optimize \
      -H "X-Deploy-Token: ${{ secrets.DEPLOY_TOKEN }}" \
      -H "Accept: application/json"

    echo "✅ Application optimized"
```

## 🌐 Using Postman

### 1. Create New Request

1. Open Postman
2. Create new request: **POST** `https://yourdomain.com/api/deploy/migrate`
3. Add Header:
   - Key: `X-Deploy-Token`
   - Value: Your deployment token
4. Add Header:
   - Key: `Accept`
   - Value: `application/json`
5. Click **Send**

### 2. Save as Collection

1. Save all deployment endpoints in a Postman collection
2. Use environment variables for the token and domain
3. Share collection with your team (without the token!)

## 🔒 Security Best Practices

### ✅ DO:

1. **Use a strong random token** (32+ characters)
2. **Store token in .env file** (never in code)
3. **Add .env to .gitignore** (never commit)
4. **Use HTTPS only** (token sent in headers)
5. **Rotate token periodically** (every 3-6 months)
6. **Monitor logs** (check for unauthorized attempts)
7. **Delete endpoint after migration** (if one-time use)

### ❌ DON'T:

1. **Don't use simple tokens** (like "password123")
2. **Don't share token publicly** (keep it secret)
3. **Don't commit token to Git** (use .gitignore)
4. **Don't use over HTTP** (only HTTPS)
5. **Don't disable token check** (always validate)
6. **Don't leave debug mode on** (APP_DEBUG=false)

## 🛡️ Additional Security Measures

### Option 1: IP Whitelisting

Add IP restriction to the controller:

```php
// In DeploymentController.php

private function isAllowedIP(Request $request): bool
{
    $allowedIPs = explode(',', env('DEPLOY_ALLOWED_IPS', ''));
    return in_array($request->ip(), $allowedIPs);
}

public function migrate(Request $request)
{
    if (!$this->isAllowedIP($request)) {
        return response()->json(['message' => 'Unauthorized IP'], 403);
    }
    // ... rest of code
}
```

Then add to `.env`:
```env
DEPLOY_ALLOWED_IPS=1.2.3.4,5.6.7.8
```

### Option 2: Time-Limited Tokens

Use Laravel's signed URLs for time-limited access:

```php
// Generate time-limited URL (valid for 1 hour)
$url = URL::temporarySignedRoute(
    'deploy.migrate',
    now()->addHour()
);
```

### Option 3: Disable After Use

Add a flag to disable the endpoint after first use:

```env
DEPLOY_ENDPOINT_ENABLED=true
```

After running migration, manually set to `false`.

## 📊 Monitoring & Logging

All deployment endpoint activities are logged in `storage/logs/laravel.log`:

```log
[2025-12-23 10:30:45] production.INFO: Migration started via deployment endpoint {"ip":"1.2.3.4"}
[2025-12-23 10:30:47] production.INFO: Migration completed successfully {"output":"..."}
```

Check logs regularly for:
- ✅ Successful migrations
- ⚠️ Failed attempts
- 🚨 Unauthorized access attempts

## 🐛 Troubleshooting

### Issue: "Unauthorized. Invalid deployment token"

**Causes:**
- Token mismatch between request and .env
- Token not set in .env file
- Typo in token

**Solution:**
```bash
# Verify token is set in .env
cat .env | grep DEPLOY_TOKEN

# Regenerate token if needed
openssl rand -base64 32
```

### Issue: "Deployment token not configured"

**Cause:** `DEPLOY_TOKEN` is not set in `.env`

**Solution:**
Add to `.env`:
```env
DEPLOY_TOKEN=your-generated-token
```

### Issue: "Deployment endpoint is disabled in this environment"

**Cause:** You're in a non-production environment

**Solution:**
Either:
1. Set `APP_ENV=production` in `.env`
2. Or enable in non-production: `ALLOW_DEPLOY_ENDPOINT=true`

### Issue: "Migration failed: <error message>"

**Common causes:**
1. Database file doesn't exist
2. Database permissions incorrect
3. Migration syntax error

**Solution:**
```bash
# Check database file exists
ls -la database/database.sqlite

# Check permissions
chmod 664 database/database.sqlite

# Check logs
tail -n 50 storage/logs/laravel.log
```

## 🔄 Complete Deployment Workflow

Here's the complete process for deploying with migrations:

```bash
# 1. Deploy code via FTP/GitHub Actions
# (Code is uploaded to server)

# 2. Run migrations
curl -X POST https://yourdomain.com/api/deploy/migrate \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"

# 3. Clear cache
curl -X POST https://yourdomain.com/api/deploy/clear-cache \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"

# 4. Optimize application
curl -X POST https://yourdomain.com/api/deploy/optimize \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"

# 5. Verify deployment
curl https://yourdomain.com/api/deploy/status \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"

# 6. Test application
curl https://yourdomain.com/api/health
```

## 🗑️ Removing the Endpoint (After Setup)

If you only need migrations during initial setup, you can disable the endpoint:

### Option 1: Environment Variable
```env
ALLOW_DEPLOY_ENDPOINT=false
```

### Option 2: Remove Routes
Comment out in `routes/api.php`:
```php
// Route::prefix('deploy')->group(function () {
//     ...
// });
```

### Option 3: Delete Files
```bash
rm app/Http/Controllers/Api/DeploymentController.php
```

## 📞 Support

If you encounter issues:

1. **Check logs**: `storage/logs/laravel.log`
2. **Verify token**: Ensure it matches exactly
3. **Check environment**: Must be production or explicitly enabled
4. **Test with curl**: Use the examples above
5. **Contact support**: If all else fails

## ✅ Quick Reference

**Generate Token:**
```bash
openssl rand -base64 32
```

**Add to .env:**
```env
DEPLOY_TOKEN=your-token-here
```

**Run Migration:**
```bash
curl -X POST https://yourdomain.com/api/deploy/migrate \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Check Status:**
```bash
curl https://yourdomain.com/api/deploy/status \
  -H "X-Deploy-Token: YOUR_TOKEN" \
  -H "Accept: application/json"
```
