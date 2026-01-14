-- Enable RLS on cards table if not already enabled
alter table cards enable row level security;

-- Drop existing policy if it exists to avoid conflicts
drop policy if exists "Public read access" on cards;

-- Create policy to allow everyone (anon and authenticated) to read cards
create policy "Public read access"
on cards for select
using (true);

-- Ensure user_cards is readable by the owner
alter table user_cards enable row level security;

drop policy if exists "User can read own cards" on user_cards;

create policy "User can read own cards"
on user_cards for select
using (auth.uid() = user_id);
