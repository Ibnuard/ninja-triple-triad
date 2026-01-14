-- Create matches table to track ranked games
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references auth.users(id) not null,
  player2_id uuid references auth.users(id) not null,
  winner_id uuid references auth.users(id),
  status text default 'pending', -- pending, active, completed, cancelled
  config jsonb default '{}'::jsonb, -- Store game config (rules, elements)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add ranking columns to profiles if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'rank_points') then
    alter table profiles add column rank_points int default 1000;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'wins') then
    alter table profiles add column wins int default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'losses') then
    alter table profiles add column losses int default 0;
  end if;
end $$;

-- Policies for matches
alter table matches enable row level security;

create policy "Users can view matches they are part of"
  on matches for select
  using (auth.uid() = player1_id or auth.uid() = player2_id);

create policy "System can insert matches"
  on matches for insert
  with check (true); -- Allow authenticated users to create matches (Host)

create policy "Users can update matches they are part of"
  on matches for update
  using (auth.uid() = player1_id or auth.uid() = player2_id);
