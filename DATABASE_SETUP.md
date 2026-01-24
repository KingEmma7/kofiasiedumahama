# Database Setup Guide - Supabase (Free PostgreSQL)

This guide will help you set up a free Supabase database and connect it to your Vercel-hosted site for analytics tracking.

## Why Supabase?

- ✅ **100% Free tier** (500MB database, 2GB bandwidth/month)
- ✅ **PostgreSQL** (industry standard, reliable)
- ✅ **Easy setup** (5 minutes)
- ✅ **Built-in dashboard** (view/edit data easily)
- ✅ **Works perfectly with Vercel**

---

## Step 1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the details:
   - **Name**: `kofi-asiedu-mahama-analytics` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `West US` or `Europe West`)
   - **Pricing Plan**: Select **"Free"**
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

---

## Step 3: Get Your Database Connection Details

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. Under **"Connection pooling"**, copy the **"URI"** (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. **Also note down:**
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you created)

---

## Step 4: Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL code:

```sql
-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  label VARCHAR(255),
  value NUMERIC,
  metadata JSONB,
  user_agent TEXT,
  ip_address VARCHAR(45),
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_action ON analytics_events(action);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Downloads Table
CREATE TABLE IF NOT EXISTS downloads (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  product VARCHAR(100) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for downloads
CREATE INDEX IF NOT EXISTS idx_downloads_email ON downloads(email);
CREATE INDEX IF NOT EXISTS idx_downloads_product ON downloads(product);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'GHS',
  book_type VARCHAR(50) NOT NULL, -- 'ebook' or 'hardcopy'
  delivery_address JSONB,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_reference ON purchases(reference);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
```

4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
5. You should see "Success. No rows returned"

---

## Step 5: Get Supabase API Keys

1. In Supabase dashboard, click **"Settings"** → **"API"**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...`) - Keep this secret!

---

## Step 6: Install Database Client Library

Run this command in your project:

```bash
npm install @supabase/supabase-js
```

---

## Step 7: Add Environment Variables to Vercel

1. Go to **https://vercel.com** and log in
2. Select your project (`kofiasiedumahama` or whatever it's named)
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Add these variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Click **"Save"** for each variable
7. **Important**: Redeploy your site after adding variables (Vercel → Deployments → Redeploy)

---

## Step 8: Update Your Code

The code has already been updated! Just verify these files exist:
- ✅ `lib/supabase.ts` - Database connection
- ✅ `app/api/analytics/route.ts` - Updated to save to database
- ✅ `app/api/download/route.ts` - Updated to track downloads
- ✅ `app/api/verify-payment/route.ts` - Updated to save purchases

---

## Step 9: Test the Connection

1. After redeploying, visit your site
2. Navigate to different pages (this triggers page view tracking)
3. Go to Supabase dashboard → **"Table Editor"**
4. Click on **"analytics_events"** table
5. You should see new rows appearing!

---

## Step 10: View Analytics Dashboard

1. Visit: `https://yourdomain.com/analytics`
2. The dashboard will now show **real data** from your database!

---

## Troubleshooting

### "Connection refused" error
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly in Vercel
- Make sure you redeployed after adding environment variables

### "Table doesn't exist" error
- Go back to Step 4 and run the SQL query again
- Check Supabase → Table Editor to verify tables exist

### No data showing in dashboard
- Check Supabase → Table Editor to see if data is being saved
- Check Vercel → Functions → Logs for any errors
- Make sure analytics API is being called (check browser Network tab)

---

## Next Steps

1. ✅ Database is set up
2. ✅ Tables are created
3. ✅ Code is connected
4. ✅ Environment variables are set
5. ✅ Site is redeployed

**You're all set!** Your analytics will now be stored in Supabase and displayed on your dashboard.

---

## Optional: Set Up Row Level Security (RLS)

For extra security, you can restrict who can read/write data:

1. In Supabase → **"Authentication"** → **"Policies"**
2. For `analytics_events` table, create policies:
   - **Insert**: Allow anonymous inserts (for tracking)
   - **Select**: Only allow service role (for dashboard)

But for now, the current setup works fine!
