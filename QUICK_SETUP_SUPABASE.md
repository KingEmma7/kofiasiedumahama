# Quick Supabase Setup Checklist

Follow these steps in order:

## ✅ Step-by-Step Checklist

### 1. Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up with GitHub or email
- [ ] Verify email

### 2. Create Project
- [ ] Click "New Project"
- [ ] Name: `kofi-analytics` (or any name)
- [ ] Set database password (SAVE THIS!)
- [ ] Choose region closest to users
- [ ] Select "Free" plan
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### 3. Create Database Tables
- [ ] In Supabase dashboard → Click "SQL Editor"
- [ ] Click "New query"
- [ ] Copy SQL from `DATABASE_SETUP.md` (Step 4)
- [ ] Click "Run"
- [ ] Verify success message

### 4. Get API Keys
- [ ] Settings → API
- [ ] Copy `Project URL` (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy `anon public` key (starts with `eyJ...`)
- [ ] Copy `service_role` key (starts with `eyJ...`) - KEEP SECRET!

### 5. Add to Vercel
- [ ] Go to vercel.com → Your project → Settings → Environment Variables
- [ ] Add `SUPABASE_URL` = your Project URL
- [ ] Add `SUPABASE_ANON_KEY` = your anon key
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
- [ ] Click "Save" for each
- [ ] Go to Deployments → Click "Redeploy" (IMPORTANT!)

### 6. Test
- [ ] Visit your site
- [ ] Navigate to different pages
- [ ] Go to Supabase → Table Editor → `analytics_events`
- [ ] You should see new rows!

### 7. View Dashboard
- [ ] Visit `https://yourdomain.com/analytics`
- [ ] Dashboard should show real data!

---

## 🔑 Environment Variables Needed

Add these to Vercel (Settings → Environment Variables):

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** After adding variables, redeploy your site!

---

## 📊 What Gets Tracked?

- ✅ Page views (automatic)
- ✅ Book downloads
- ✅ Research paper downloads  
- ✅ Purchases (with details)
- ✅ Payment events
- ✅ Newsletter signups

All data appears in your `/analytics` dashboard!

---

## 🆘 Troubleshooting

**No data showing?**
1. Check Supabase → Table Editor → Do tables exist?
2. Check Vercel → Functions → Logs for errors
3. Verify environment variables are set correctly
4. Make sure you redeployed after adding variables

**Connection errors?**
- Double-check `SUPABASE_URL` format (should start with `https://`)
- Verify keys are copied correctly (no extra spaces)
- Check Supabase project is active (not paused)

---

## 📚 Full Instructions

See `DATABASE_SETUP.md` for detailed step-by-step guide with screenshots and explanations.
