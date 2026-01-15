-- Enable Read Access to Profiles for Matchmaking
-- This is required so Host can fetch Opponent's selected_deck

-- Drop existing read policy if strict
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can view all profiles" on profiles;
drop policy if exists "Public profiles are viewable by everyone" on profiles;

-- Create permissive read policy
create policy "Public profiles are viewable by everyone"
on profiles for select
using ( true );

-- Ensure Update is still restricted to owner
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );

-- Ensure Insert is restricted
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
on profiles for insert
with check ( auth.uid() = id );
