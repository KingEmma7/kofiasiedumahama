# 📊 Google Sheets Setup Guide

This guide will help you set up Google Sheets to store newsletter subscriptions (name, email, phone) for free with no limits.

## ✅ Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Newsletter Subscriptions"
4. **Copy the Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the `SPREADSHEET_ID_HERE` part

### Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name it (e.g., "Newsletter Subscriptions")
4. Click **"Create"**
5. Wait for project creation, then select the project

### Step 3: Enable Google Sheets API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and press **"Enable"**

### Step 4: Create Service Account

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - **Service account name**: `newsletter-service` (or any name)
   - **Service account ID**: Auto-generated (leave as is)
   - **Description**: "For newsletter subscriptions"
4. Click **"Create and Continue"**
5. Skip the optional steps (click **"Done"**)

### Step 5: Create Service Account Key

1. In the **"Credentials"** page, find your service account
2. Click on the service account email
3. Go to **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. **A JSON file will download** - Keep this file safe! ⚠️

### Step 6: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click **"Share"** button (top right)
3. **Paste the service account email** (found in the JSON file, looks like: `newsletter-service@project-id.iam.gserviceaccount.com`)
4. Give it **"Editor"** permission
5. **Uncheck** "Notify people" (optional)
6. Click **"Share"**

### Step 7: Add Environment Variables

#### For Local Development (.env.local):

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_NAME=Subscriptions
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Important**: 
- Replace `your_spreadsheet_id_here` with your actual spreadsheet ID
- Replace the entire JSON object with the contents of the downloaded JSON file
- Keep the single quotes around the JSON

#### For GitHub Secrets (Production):

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

- **Name**: `GOOGLE_SHEETS_ID`
  - **Value**: Your spreadsheet ID

- **Name**: `GOOGLE_SHEETS_NAME`
  - **Value**: `Subscriptions` (or your sheet name)

- **Name**: `GOOGLE_SHEETS_CREDENTIALS`
  - **Value**: The entire JSON content from the downloaded file (paste as-is)

### Step 8: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to your newsletter form on the website
3. Fill in name, email, and phone
4. Submit the form
5. Check your Google Sheet - you should see a new row with:
   - Name
   - Email
   - Phone
   - Subscribed At (timestamp)

## 📋 Sheet Structure

Your Google Sheet will automatically have these columns:
- **Column A**: Name
- **Column B**: Email
- **Column C**: Phone
- **Column D**: Subscribed At

Headers are automatically created on first subscription.

## 🔒 Security Notes

- ✅ **Never commit** the JSON credentials file to GitHub
- ✅ **Never share** your service account email publicly
- ✅ The JSON file contains sensitive credentials - keep it secure
- ✅ Only share the Google Sheet with the service account email

## 🎯 Benefits of Google Sheets

- ✅ **100% Free** - No subscription fees
- ✅ **No Limits** - Store unlimited subscriptions
- ✅ **Easy to View** - See all subscribers in one place
- ✅ **Exportable** - Download as CSV/Excel anytime
- ✅ **Searchable** - Use Google Sheets search features
- ✅ **Shareable** - Share with team members if needed

## 🐛 Troubleshooting

### "Permission denied" error
- Make sure you shared the Google Sheet with the service account email
- Check that the service account has "Editor" permission

### "Invalid credentials" error
- Verify the JSON credentials are correctly formatted
- Make sure there are no extra spaces or line breaks in the JSON
- Check that the JSON is wrapped in single quotes in .env.local

### "Spreadsheet not found" error
- Verify the `GOOGLE_SHEETS_ID` is correct
- Make sure the spreadsheet exists and is accessible

### Data not appearing in sheet
- Check browser console for errors
- Verify all environment variables are set correctly
- Check that the sheet name matches `GOOGLE_SHEETS_NAME`

## ✅ You're Done!

Once set up, every newsletter subscription will automatically be saved to your Google Sheet. You can:
- View all subscribers in real-time
- Export data anytime
- Use Google Sheets formulas for analytics
- Share with team members

No paid services needed! 🎉
