# 🚀 Deployment Guide - GitHub to Hostinger

This guide will help you set up automatic deployment from GitHub to Hostinger. Every time you push to the `main` branch, your site will automatically deploy.

## 📋 Prerequisites

- ✅ GitHub account and repository
- ✅ Hostinger hosting account
- ✅ Domain connected to Hostinger
- ✅ FTP credentials from Hostinger

---

## 🔧 Step 1: Get Your Hostinger FTP Credentials

1. **Login to Hostinger Control Panel** (hpanel.hostinger.com)
2. Go to **"Files"** → **"FTP Accounts"**
3. Note down or create an FTP account:
   - **FTP Server/Host**: Usually `ftp.yourdomain.com` or an IP address
   - **FTP Username**: Your FTP username
   - **FTP Password**: Your FTP password
   - **Port**: Usually `21` for FTP or `22` for SFTP

**OR** use your main hosting account credentials:
- **FTP Server**: Your domain or IP (check in "Files" → "File Manager")
- **Username**: Your hosting account username
- **Password**: Your hosting account password

---

## 🔐 Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"** and add these secrets:

### Required Secrets:

#### FTP Credentials:
- **Name**: `FTP_SERVER`
  - **Value**: Your FTP server address (e.g., `ftp.yourdomain.com` or IP address)

- **Name**: `FTP_USERNAME`
  - **Value**: Your FTP username

- **Name**: `FTP_PASSWORD`
  - **Value**: Your FTP password

#### Optional (if you use these in your app):
- **Name**: `NEXT_PUBLIC_PAYSTACK_KEY`
  - **Value**: Your Paystack public key

- **Name**: `NEXT_PUBLIC_HARDCOPY_PRICE`
  - **Value**: Your hardcopy book price (e.g., `99`)

- **Name**: `NEXT_PUBLIC_EBOOK_PRICE`
  - **Value**: Your ebook price (e.g., `89`)

---

## 📤 Step 3: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## ✅ Step 4: Verify Deployment

1. **Push a test change** to trigger deployment:
   ```bash
   # Make a small change
   echo "# Test" >> README.md
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

2. **Check GitHub Actions**:
   - Go to your GitHub repo
   - Click **"Actions"** tab
   - You should see "Deploy to Hostinger" workflow running
   - Wait for it to complete (green checkmark = success)

3. **Visit your website**:
   - Go to your domain (e.g., `https://yourdomain.com`)
   - Your site should be live!

---

## 🔄 Step 5: Future Updates

Now, every time you want to update your site:

```bash
# Make your changes locally
# ... edit files ...

# Commit and push
git add .
git commit -m "Description of your changes"
git push origin main
```

**That's it!** The site will automatically deploy in 2-3 minutes.

---

## 🐛 Troubleshooting

### Deployment Fails with FTP Error

**Problem**: "FTP connection failed" or "Authentication failed"

**Solutions**:
1. **Double-check FTP credentials** in GitHub Secrets
2. **Verify FTP server address** - try both:
   - `ftp.yourdomain.com`
   - Your server IP address (found in Hostinger control panel)
3. **Check FTP port** - If port 21 doesn't work, you might need SFTP (port 22)
4. **Test FTP manually** using FileZilla or similar to verify credentials

### Site Not Updating After Deployment

**Problem**: Changes pushed but site shows old version

**Solutions**:
1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check GitHub Actions** - Make sure deployment completed successfully
3. **Wait 2-3 minutes** - Sometimes DNS/caching takes time
4. **Check Hostinger File Manager** - Verify files in `public_html` are updated

### Build Errors

**Problem**: GitHub Actions shows build failure

**Solutions**:
1. **Check the error message** in GitHub Actions logs
2. **Test build locally**:
   ```bash
   npm run build
   ```
3. **Fix any errors** locally before pushing
4. **Check environment variables** - Make sure all required secrets are set

### Images Not Loading

**Problem**: Images broken after deployment

**Solutions**:
1. **Verify image paths** - Make sure images are in `/public/images/` folder
2. **Check Next.js config** - `unoptimized: true` is set for static export
3. **Clear browser cache**

---

## 🔒 Security Notes

- ✅ Never commit `.env` files to GitHub
- ✅ Use GitHub Secrets for sensitive data
- ✅ Keep your FTP password secure
- ✅ Consider using SFTP instead of FTP for better security

---

## 📞 Need Help?

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test FTP connection manually with FileZilla
4. Contact Hostinger support if FTP credentials don't work

---

## 🎉 Success!

Once set up, you can update your site by simply:
```bash
git push origin main
```

Your site will automatically deploy! 🚀
