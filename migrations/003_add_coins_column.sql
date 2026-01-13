-- Migration: Add coins column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins integer DEFAULT 0;
