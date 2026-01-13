-- Migration: Add selected_deck column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_deck jsonb DEFAULT '[]'::jsonb;

-- Update RLS policies if necessary (profiles already has RLS enabled)
-- Users can already update their own profile, which includes this new column.
