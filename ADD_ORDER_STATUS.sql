-- Migration: Add order fulfillment status to purchases table
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- Safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMP WITH TIME ZONE;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
