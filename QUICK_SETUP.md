# ⚡ Quick Setup Checklist

Follow these steps in order to get your site live with automatic deployment:

## ✅ Step-by-Step Checklist

### 1. Get Hostinger FTP Info
- [ ] Login to Hostinger hPanel
- [ ] Go to **Files** → **FTP Accounts**
- [ ] Note down:
  - FTP Server: `_________________`
  - FTP Username: `_________________`
  - FTP Password: `_________________`

### 2. Create GitHub Repository
- [ ] Go to https://github.com/new
- [ ] Create new repository (e.g., `kofi-website`)
- [ ] **Don't** initialize with README
- [ ] Copy repository URL: `_________________`

### 3. Push Code to GitHub
```bash
cd /Users/kingemma/kofiasiedumahama
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL_HERE
git branch -M main
git push -u origin main
```

### 4. Add GitHub Secrets
- [ ] Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
- [ ] Add secret: `FTP_SERVER` = Your FTP server address
- [ ] Add secret: `FTP_USERNAME` = Your FTP username
- [ ] Add secret: `FTP_PASSWORD` = Your FTP password
- [ ] (Optional) Add `NEXT_PUBLIC_PAYSTACK_KEY` if using payments
- [ ] (Optional) Add `NEXT_PUBLIC_HARDCOPY_PRICE` if using payments
- [ ] (Optional) Add `NEXT_PUBLIC_EBOOK_PRICE` if using payments

### 5. Test Deployment
- [ ] Make a small change (e.g., edit README.md)
- [ ] Commit and push:
  ```bash
  git add .
  git commit -m "Test deployment"
  git push origin main
  ```
- [ ] Go to GitHub repo → **Actions** tab
- [ ] Wait for workflow to complete (green checkmark ✅)
- [ ] Visit your domain - site should be live! 🎉

### 6. Verify Site is Live
- [ ] Visit `https://yourdomain.com`
- [ ] Check homepage loads correctly
- [ ] Test navigation menu
- [ ] Test dark/light theme toggle
- [ ] Test `/book` page
- [ ] Test newsletter form
- [ ] Test on mobile device

---

## 🎯 You're Done!

Now you can update your site anytime by:
```bash
git add .
git commit -m "Your update description"
git push origin main
```

The site will automatically deploy in 2-3 minutes! 🚀

---

## ❓ Having Issues?

See `DEPLOYMENT.md` for detailed troubleshooting guide.
