# 📦 Deployment Documentation

Choose the guide that matches your hosting setup:

---

## 🎯 Which Guide Should I Use?

### ✅ I DON'T have SSH access (Most Common)
👉 **Use:** [DEPLOYMENT_NO_SSH.md](DEPLOYMENT_NO_SSH.md)

**Best for:**
- Standard Hostinger plans
- Shared hosting
- FTP-only access
- Beginners

**What you need:**
- ✅ FTP credentials
- ✅ Hostinger File Manager access
- ✅ Web browser

**Setup time:** ~20 minutes (first time only)

---

### ✅ I DO have SSH access (Advanced)
👉 **Use:** [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)

**Best for:**
- Business/Premium Hostinger plans
- VPS hosting
- Advanced users
- Automated workflows

**What you need:**
- ✅ FTP credentials
- ✅ SSH credentials
- ✅ Terminal access

**Setup time:** ~15 minutes (first time only)

---

## 📚 All Available Guides

| Document | Purpose | Best For |
|----------|---------|----------|
| **[DEPLOYMENT_NO_SSH.md](DEPLOYMENT_NO_SSH.md)** | **FTP-only deployment** | **No SSH access** ⭐ |
| [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) | Fast 5-step guide | SSH available |
| [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) | Complete detailed guide | Full reference |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Step-by-step checklist | Ensuring nothing missed |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Overview of all options | Decision making |

---

## 🚀 Quick Comparison

| Feature | FTP-Only (No SSH) | With SSH |
|---------|------------------|----------|
| **Difficulty** | ⭐ Easy | ⭐⭐ Moderate |
| **Setup** | Browser + File Manager | Terminal commands |
| **Automation** | ✅ Yes | ✅ Yes |
| **Speed** | ~5 min deploy | ~3 min deploy |
| **Requirements** | FTP only | FTP + SSH |
| **Post-Deploy** | Via browser | Automatic |

---

## ⚡ Super Quick Start (No SSH)

1. **Configure GitHub Secrets** (3 FTP secrets only)
2. **Update domain** in `UI/src/environments/environment.prod.ts`
3. **Push to GitHub** - Deployment happens automatically!
4. **Run one-time setup** via browser: `post-deploy.php?run_setup`
5. **Done!** App is live 🎉

**Detailed steps:** [DEPLOYMENT_NO_SSH.md](DEPLOYMENT_NO_SSH.md)

---

## 📋 GitHub Secrets Required

### FTP-Only Deployment (3 secrets)

```
FTP_SERVER = ftp.yourdomain.com
FTP_USERNAME = user@yourdomain.com
FTP_PASSWORD = your-ftp-password
```

### With SSH (8 secrets)

```
FTP_SERVER = ftp.yourdomain.com
FTP_USERNAME = user@yourdomain.com
FTP_PASSWORD = your-ftp-password
SSH_HOST = ssh.yourdomain.com
SSH_USERNAME = user@yourdomain.com
SSH_PASSWORD = your-ssh-password
SSH_PORT = 65002
DEPLOY_PATH = /home/user/public_html/app
```

---

## 🛠️ Deployment Options

### Option 1: Automated GitHub Actions (Recommended)
- ✅ Push to `main` branch
- ✅ Automatic deployment
- ✅ ~3-5 minutes
- ✅ View logs in GitHub Actions tab

### Option 2: Manual Script
```bash
./deploy.sh production
# Upload .tar.gz to server
```

---

## ✅ After First Deployment

### For FTP-Only Users:
1. Visit: `https://yourdomain.com/post-deploy.php?run_setup`
2. Create `.env` file via File Manager
3. Run migrations (via browser or File Manager terminal)
4. Delete setup files
5. Test app!

### For SSH Users:
1. All handled automatically via SSH commands
2. Just test the app!

---

## 🎯 Success Criteria

After deployment, verify:
- [ ] API works: `https://app.yourdomain.com/api/health`
- [ ] Frontend loads: `https://app.yourdomain.com/app`
- [ ] Login works
- [ ] No console errors
- [ ] HTTPS active (green padlock)

---

## 🆘 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| 500 Error | File Manager → `storage/` → Permissions → 755 (recursive) |
| White Screen | Check `public/.htaccess` exists |
| DB Error | Verify `.env` DB path and database file exists |
| CORS Error | Update `.env`: `SANCTUM_STATEFUL_DOMAINS` |

**Full troubleshooting:** Each guide has detailed troubleshooting section

---

## 📞 Support

- **FTP-Only Help:** [DEPLOYMENT_NO_SSH.md](DEPLOYMENT_NO_SSH.md)
- **SSH Help:** [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- **Hostinger Support:** https://www.hostinger.com/tutorials
- **GitHub Actions:** [.github/workflows/README.md](.github/workflows/README.md)

---

## 🎉 Ready to Deploy?

### 👉 No SSH Access? Start here:
**[DEPLOYMENT_NO_SSH.md](DEPLOYMENT_NO_SSH.md)** - Complete FTP-only guide

### 👉 Have SSH Access? Start here:
**[DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)** - Fast 5-step guide

---

*Choose your path and start deploying! Both methods result in the same live application.* 🚀
