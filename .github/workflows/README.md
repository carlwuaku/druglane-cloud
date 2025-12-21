# GitHub Actions Workflows

This directory contains automated deployment workflows for the Druglane Cloud application.

## Available Workflows

### 1. `deploy.yml` - Automated Deployment to Hostinger

Automatically deploys the application to Hostinger when code is pushed to the main branch.

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**What it does:**
1. Sets up PHP 8.2 and Node.js 20
2. Installs Composer dependencies (production only)
3. Builds Angular application
4. Creates deployment package
5. Deploys via FTP to Hostinger
6. Runs post-deployment commands via SSH

**Required Secrets:**

All secrets must be configured in: Repository Settings → Secrets → Actions

| Secret | Description | Example |
|--------|-------------|---------|
| `FTP_SERVER` | FTP server address | `ftp.yourdomain.com` |
| `FTP_USERNAME` | FTP username | `user@yourdomain.com` |
| `FTP_PASSWORD` | FTP password | `your-secure-password` |
| `SSH_HOST` | SSH server address | `ssh.yourdomain.com` |
| `SSH_USERNAME` | SSH username | `user@yourdomain.com` |
| `SSH_PASSWORD` | SSH password | `your-secure-password` |
| `SSH_PORT` | SSH port (Hostinger default) | `65002` |
| `DEPLOY_PATH` | Absolute path on server | `/home/user/public_html/app` |

## Manual Deployment Trigger

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Select "Deploy to Hostinger" workflow
4. Click "Run workflow"
5. Select branch and click "Run workflow"

## Monitoring Deployments

1. Go to "Actions" tab in your repository
2. Click on the latest workflow run
3. View logs for each step
4. Check for errors or warnings

## Deployment Status

After deployment:
- ✅ Green checkmark = Successful
- ❌ Red X = Failed (check logs)
- 🟡 Yellow circle = In progress

## Customizing the Workflow

To modify the deployment workflow:

1. Edit `.github/workflows/deploy.yml`
2. Common customizations:
   - Change PHP version: Update `php-version` in "Setup PHP" step
   - Change Node version: Update `node-version` in "Setup Node.js" step
   - Modify build command: Update `npm run build` in "Build Angular app" step
   - Add additional steps: Add new steps before or after deployment
   - Change deployment branch: Update `branches` in the `on` section

## Deployment Process Flow

```
┌─────────────────┐
│  Code Push      │
│  to Main        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Actions │
│  Triggered      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Setup          │
│  Environment    │
│  (PHP, Node)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Install        │
│  Dependencies   │
│  (Composer,NPM) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build          │
│  Angular App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create         │
│  Deploy Package │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload via     │
│  FTP            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Post-Deploy    │
│  Commands (SSH) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deployment     │
│  Complete! ✅   │
└─────────────────┘
```

## Troubleshooting Workflow Issues

### Build Fails

**Symptom:** Workflow fails during build step

**Solution:**
- Check if code builds locally: `npm run build` in UI directory
- Review error logs in Actions tab
- Ensure all dependencies are in package.json

### FTP Upload Fails

**Symptom:** Workflow fails during FTP deployment

**Solution:**
- Verify FTP credentials in Secrets
- Check FTP server is accessible
- Ensure sufficient space on server
- Check server-dir path is correct

### SSH Commands Fail

**Symptom:** Post-deployment commands fail

**Solution:**
- Verify SSH credentials and port
- Test SSH connection manually
- Check DEPLOY_PATH is correct
- Ensure PHP artisan commands are available

### Permissions Issues

**Symptom:** 500 errors after deployment

**Solution:**
- Add permission fix to workflow:
  ```yaml
  - name: Fix permissions
    run: |
      chmod -R 755 storage bootstrap/cache
      chmod 664 database/database.sqlite
  ```

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate passwords** regularly
4. **Use SSH keys** instead of passwords when possible
5. **Review workflow logs** for exposed secrets
6. **Limit workflow permissions** to minimum required

## Performance Optimization

To speed up deployments:

1. **Enable caching:**
   - Composer cache ✅ (already enabled)
   - NPM cache ✅ (already enabled)

2. **Reduce artifact size:**
   - Exclude unnecessary files
   - Use `--no-dev` for Composer

3. **Parallel steps:**
   - Consider splitting build and deploy into separate jobs

## Support

For issues with:
- **GitHub Actions:** Check [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **FTP Deployment:** Check [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- **SSH Deployment:** Check [SSH-Action](https://github.com/appleboy/ssh-action)
- **Application Deployment:** See [HOSTINGER_DEPLOYMENT.md](../../HOSTINGER_DEPLOYMENT.md)
