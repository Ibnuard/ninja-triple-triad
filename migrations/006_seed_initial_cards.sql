-- Migration: Seed cards table with initial ninja cards
-- Run this in your Supabase SQL Editor to populate the card pool

INSERT INTO public.cards (id, name, element, rarity, is_init, cp, stat_top, stat_right, stat_bottom, stat_left, image_url)
VALUES 
('fire-naruto-1', 'Uzumaki Naruto', 'fire', 'common', true, 100, 5, 6, 4, 3, '/images/dummy-ninja.webp'),
('water-sasuke-1', 'Uchiha Sasuke', 'water', 'common', true, 110, 4, 5, 3, 6, '/images/dummy-ninja.webp'),
('earth-sakura-1', 'Haruno Sakura', 'earth', 'common', true, 90, 6, 3, 5, 4, '/images/dummy-ninja.webp'),
('wind-kakashi-1', 'Hatake Kakashi', 'wind', 'common', true, 150, 7, 7, 7, 7, '/images/dummy-ninja.webp'),
('lightning-gaara-1', 'Gaara', 'lightning', 'common', true, 130, 3, 4, 8, 3, '/images/dummy-ninja.webp'),
('fire-itachi-1', 'Uchiha Itachi', 'fire', 'rare', true, 200, 8, 5, 4, 9, '/images/dummy-ninja.webp'),
('water-kisame-1', 'Hoshigaki Kisame', 'water', 'rare', true, 180, 5, 9, 7, 4, '/images/dummy-ninja.webp'),
('earth-jiraiya-1', 'Jiraiya', 'earth', 'rare', true, 190, 7, 6, 8, 5, '/images/dummy-ninja.webp'),
('wind-temari-1', 'Temari', 'wind', 'common', true, 100, 4, 7, 3, 5, '/images/dummy-ninja.webp'),
('lightning-raikage-1', 'A (Raikage)', 'lightning', 'rare', true, 220, 5, 8, 6, 7, '/images/dummy-ninja.webp')
ON CONFLICT (id) DO NOTHING;
