# ⚡ Google Sheets Quick Start

## 🎯 What You Need

1. ✅ Google account (free)
2. ✅ 10 minutes to set up
3. ✅ No credit card required

## 📝 Quick Setup (5 Steps)

### 1. Create Google Sheet
- Go to [sheets.google.com](https://sheets.google.com)
- Create new spreadsheet
- Copy the **Spreadsheet ID** from URL (the long string between `/d/` and `/edit`)

### 2. Create Google Cloud Project
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create new project
- Enable **Google Sheets API**

### 3. Create Service Account
- Go to **APIs & Services** → **Credentials**
- **Create Credentials** → **Service Account**
- Create service account (name it anything)
- Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
- **Download the JSON file** ⚠️ Keep this safe!

### 4. Share Sheet with Service Account
- Open your Google Sheet
- Click **Share** button
- Paste the **service account email** (from JSON file, looks like: `xxx@xxx.iam.gserviceaccount.com`)
- Give **Editor** permission
- Click **Share**

### 5. Add to Environment Variables

**For local (.env.local):**
```bash
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_NAME=Subscriptions
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...paste entire JSON here...}'
```

**For GitHub Secrets:**
- Go to repo → Settings → Secrets → Actions
- Add `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_NAME`, `GOOGLE_SHEETS_CREDENTIALS`

## ✅ Test It

1. Start dev server: `npm run dev`
2. Fill newsletter form on your site
3. Check Google Sheet - new row should appear!

## 📊 What Gets Stored

- **Name** (Column A)
- **Email** (Column B)
- **Phone** (Column C)
- **Subscribed At** (Column D) - Timestamp

## 🎉 Done!

Every subscription automatically saves to your Google Sheet. Free forever, no limits!

For detailed instructions, see `GOOGLE_SHEETS_SETUP.md`
