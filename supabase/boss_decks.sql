-- Boss Decks Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS boss_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rank TEXT NOT NULL UNIQUE,
    card_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE boss_decks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can see boss decks during gameplay)
CREATE POLICY "Allow public read" ON boss_decks
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update (admin only in practice via passcode)
CREATE POLICY "Allow authenticated write" ON boss_decks
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial empty rows for each rank
INSERT INTO boss_decks (rank, card_ids) VALUES
    ('Genin', '{}'),
    ('Chunin', '{}'),
    ('Jounin', '{}'),
    ('Anbu', '{}'),
    ('Kage', '{}'),
    ('Rikudo', '{}')
ON CONFLICT (rank) DO NOTHING;
