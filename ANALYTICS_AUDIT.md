# Analytics Tracking Audit & Fixes

## Issues Found & Fixed

### ✅ Issue 1: Page Views on Analytics Page
**Problem:** Analytics page (`/analytics`) was tracking its own page views, inflating metrics.

**Fix:** Updated `PageViewTracker.tsx` to exclude `/analytics` from tracking.

**Location:** `components/PageViewTracker.tsx`

---

### ✅ Issue 2: Double Counting Research Downloads
**Problem:** Research paper downloads were being counted TWICE:
1. Via `trackEvent()` calls in `ResearchPageContent.tsx` → saved to `analytics_events` table
2. Via `/api/download-research` route → saved to `downloads` table
3. Analytics API was counting BOTH sources, causing inflated numbers

**Fix:** 
- Removed duplicate `trackEvent()` calls from research download handler
- Updated analytics API to count ONLY from `downloads` table (single source of truth)
- Removed backward compatibility code that was double-counting

**Files Changed:**
- `app/research/ResearchPageContent.tsx` - Removed duplicate tracking
- `app/api/analytics/route.ts` - Removed double counting logic

---

## Current Tracking Architecture

### Page Views
- **Source:** `analytics_events` table
- **Action:** `page_view`
- **Excluded:** `/analytics` page
- **Count:** One record per page visit

### Book Downloads
- **Source:** `downloads` table
- **Product:** `book`
- **Trigger:** `/api/download` route (after payment verification)
- **Count:** One record per download

### Research Paper Downloads
- **Source:** `downloads` table
- **Product:** `research:paper-id` (e.g., `research:ai-job-security`)
- **Trigger:** `/api/download-research` route
- **Count:** One record per download

### Purchases
- **Source:** `purchases` table
- **Trigger:** `/api/verify-payment` route
- **Count:** One record per successful payment

### Events (Newsletter, Payments)
- **Source:** `analytics_events` table
- **Actions:** `newsletter_signup`, `payment_initiated`, `payment_success`, `payment_cancelled`
- **Count:** One record per event

---

## Verification Checklist

✅ Page views exclude `/analytics` page
✅ Research downloads counted once (from `downloads` table only)
✅ Book downloads counted once (from `downloads` table only)
✅ No duplicate tracking in client-side code
✅ Single source of truth for each metric

---

## How to Verify Counts Are Correct

1. **Check Supabase directly:**
   ```sql
   -- Count book downloads
   SELECT COUNT(*) FROM downloads WHERE product = 'book';
   
   -- Count research downloads
   SELECT COUNT(*) FROM downloads WHERE product LIKE 'research:%';
   
   -- Count page views (excluding analytics page)
   SELECT COUNT(*) FROM analytics_events 
   WHERE action = 'page_view' AND label != '/analytics';
   ```

2. **Compare with dashboard:** Numbers should match exactly

3. **Test a download:** Count should increase by exactly 1

---

## Notes

- All downloads are tracked server-side for accuracy
- Client-side `trackEvent()` calls are for engagement metrics only, not download counts
- The `downloads` table is the single source of truth for download counts
- Page views are tracked client-side but filtered server-side for analytics page
