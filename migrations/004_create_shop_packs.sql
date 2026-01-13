-- Create shop_packs table
CREATE TABLE IF NOT EXISTS shop_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    color TEXT,
    config JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE shop_packs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to shop_packs" ON shop_packs
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to shop_packs" ON shop_packs
    FOR ALL USING (auth.role() = 'authenticated');
