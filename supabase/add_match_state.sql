-- Add state column to matches table for persistent game state
alter table matches add column if not exists state jsonb default '{}'::jsonb;
