-- Migration: Add quantity and test-flag columns to purchases table
-- Run this in Supabase SQL Editor AFTER ADD_ORDER_STATUS.sql
-- Safe to run multiple times (uses IF NOT EXISTS / idempotent)

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;

-- Index for filtering out test orders
CREATE INDEX IF NOT EXISTS idx_purchases_is_test ON purchases(is_test);
