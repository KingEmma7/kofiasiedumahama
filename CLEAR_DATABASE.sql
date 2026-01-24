-- Clear Database for Testing
-- Run this in Supabase SQL Editor to reset all analytics data
-- WARNING: This will delete ALL data from these tables!

-- Clear analytics events
DELETE FROM analytics_events;

-- Clear downloads
DELETE FROM downloads;

-- Clear purchases
DELETE FROM purchases;

-- Optional: Reset auto-increment counters (PostgreSQL)
-- Note: This is optional and only needed if you want IDs to start from 1 again
-- ALTER SEQUENCE analytics_events_id_seq RESTART WITH 1;
-- ALTER SEQUENCE downloads_id_seq RESTART WITH 1;
-- ALTER SEQUENCE purchases_id_seq RESTART WITH 1;

-- Verify tables are empty
SELECT 
  'analytics_events' as table_name, COUNT(*) as row_count FROM analytics_events
UNION ALL
SELECT 
  'downloads' as table_name, COUNT(*) as row_count FROM downloads
UNION ALL
SELECT 
  'purchases' as table_name, COUNT(*) as row_count FROM purchases;
