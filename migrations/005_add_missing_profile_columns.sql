-- Migration: Add missing columns to profiles table
-- Run this in your Supabase SQL Editor if you encounter "Column not found" errors

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for username for faster availability checks
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
