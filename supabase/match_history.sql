-- Create Match History Table
create table if not exists match_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_id uuid, -- Original Match ID reference
  player1_id uuid references auth.users not null,
  player2_id uuid references auth.users not null,
  winner_id uuid references auth.users, -- can be null for draw
  player1_score int default 0,
  player2_score int default 0,
  mode text default 'ranked',
  recorded_by uuid references auth.users -- who inserted this record
);

-- RLS
alter table match_history enable row level security;

create policy "Users can read their own match history"
on match_history for select
using (auth.uid() = player1_id or auth.uid() = player2_id);

create policy "Users can insert match history"
on match_history for insert
with check (true); -- Allow insert from authenticated users (logic handled in app)
