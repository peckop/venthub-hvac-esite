-- Add missing Fan categories to match CATEGORY_REGISTRY
-- Parent: Fanlar (4bc54533-7323-4eac-a02d-4498ffde00eb)

INSERT INTO public.categories (name, slug, parent_id, is_active, level, metadata)
VALUES
    ('Basınçlandırma Fanları', 'basinclandirma-fanlari', '4bc54533-7323-4eac-a02d-4498ffde00eb', true, 1, '{"display_mode": "series"}'),
    ('Konut Tipi Fanlar', 'konut-tipi-fanlar', '4bc54533-7323-4eac-a02d-4498ffde00eb', true, 1, '{"display_mode": "series"}'),
    ('Plug Fanlar', 'plug-fanlar', '4bc54533-7323-4eac-a02d-4498ffde00eb', true, 1, '{"display_mode": "series"}'),
    ('Santrifüj Fanlar', 'santrifuj-fanlar', '4bc54533-7323-4eac-a02d-4498ffde00eb', true, 1, '{"display_mode": "series"}')
ON CONFLICT (slug) DO UPDATE
SET is_active = true, parent_id = '4bc54533-7323-4eac-a02d-4498ffde00eb';
