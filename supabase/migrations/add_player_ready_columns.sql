-- Migration: Add player ready tracking columns to matches table
-- Run this in Supabase SQL Editor

-- Add player ready flags
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player1_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player2_ready BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_ready ON matches (player1_ready, player2_ready);

-- Comment for documentation
COMMENT ON COLUMN matches.player1_ready IS 'Whether player 1 (host) has connected and is ready';
COMMENT ON COLUMN matches.player2_ready IS 'Whether player 2 (joiner) has connected and is ready';
