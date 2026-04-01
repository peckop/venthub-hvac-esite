-- Migration: Add display_mode column to Categories and seed data

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_mode TEXT DEFAULT 'series';

-- Update showcase slugs
UPDATE public.categories 
SET display_mode = 'showcase' 
WHERE slug IN (
    'residential-ventilation', 'industrial-ventilation', 
    'commercial-ventilation', 'heat-recovery-vmc', 'air-treatment',
    'hygiene-sanitizer', 'summer-ventilation', 'air-conditioning',
    'electric-heating', 'industrial-ceiling-fans', 'accessories-components',
    'smart-home'
);

-- Update landing slugs
UPDATE public.categories 
SET display_mode = 'landing' 
WHERE slug IN (
    'hava-perdeleri', 
    'sessiz-kanal-tipi-fanlar', 
    'nem-alma-cihazlari'
);
