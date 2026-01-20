-- Migration: Update rank_points default to 0 and add total_matches column
-- Run this in Supabase SQL Editor

-- Update rank_points default to 0 for new ranking system
ALTER TABLE profiles ALTER COLUMN rank_points SET DEFAULT 0;

-- Reset existing rank_points to 0 if they have the old default of 1000
UPDATE profiles SET rank_points = 0 WHERE rank_points = 1000;

-- Add total_matches column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_matches INT DEFAULT 0;

-- Add draws column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS draws INT DEFAULT 0;

-- Calculate total_matches from wins + losses + draws
UPDATE profiles SET total_matches = COALESCE(wins, 0) + COALESCE(losses, 0) + COALESCE(draws, 0);
