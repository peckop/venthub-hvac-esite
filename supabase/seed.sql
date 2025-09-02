-- Seed data for local development

-- Insert test brands
INSERT INTO public.brands (id, name, slug, description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Mitsubishi Electric', 'mitsubishi-electric', 'Premium HVAC solutions'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Daikin', 'daikin', 'Advanced air conditioning technology'),
  ('550e8400-e29b-41d4-a716-446655440003', 'LG', 'lg', 'Smart home solutions')
ON CONFLICT (id) DO NOTHING;

-- Insert test categories
INSERT INTO public.categories (id, name, slug, description) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'Split Klima', 'split-klima', 'Duvar tipi klimalar'),
  ('660e8400-e29b-41d4-a716-446655440002', 'VRF Sistemler', 'vrf-sistemler', 'Çok odali sistemler'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Havalandırma', 'havalandirma', 'Hava temizleme sistemleri')
ON CONFLICT (id) DO NOTHING;

-- Insert test products
INSERT INTO public.products (id, name, slug, description, price, status, category_id, brand_id, is_featured, stock_qty) VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Mitsubishi MSZ-EF25VE', 'mitsubishi-msz-ef25ve', 'Inverter split klima 9000 BTU', 15999.99, 'active', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, 25),
  ('770e8400-e29b-41d4-a716-446655440002', 'Daikin FTXM35R', 'daikin-ftxm35r', 'Emura serisi 12000 BTU', 18999.99, 'active', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true, 18),
  ('770e8400-e29b-41d4-a716-446655440003', 'LG PC12SQ', 'lg-pc12sq', 'Artcool serisi 12000 BTU', 13999.99, 'active', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', false, 32),
  ('770e8400-e29b-41d4-a716-446655440004', 'Mitsubishi VRF Sistem', 'mitsubishi-vrf-sistem', 'City Multi VRF sistemi', 45999.99, 'active', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', false, 8),
  ('770e8400-e29b-41d4-a716-446655440005', 'Daikin VRV IV', 'daikin-vrv-iv', 'VRV IV serisi', 52999.99, 'active', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', false, 5)
ON CONFLICT (id) DO NOTHING;

-- Insert product images
INSERT INTO public.product_images (id, product_id, image_url, alt_text, display_order) VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '/images/mitsubishi-ef25ve-1.jpg', 'Mitsubishi MSZ-EF25VE', 1),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '/images/daikin-ftxm35r-1.jpg', 'Daikin FTXM35R', 1),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '/images/lg-pc12sq-1.jpg', 'LG PC12SQ', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert some test cities
INSERT INTO public.turkey_cities (id, name, plate_code, region) VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'İstanbul', 34, 'Marmara'),
  ('990e8400-e29b-41d4-a716-446655440002', 'Ankara', 6, 'İç Anadolu'),
  ('990e8400-e29b-41d4-a716-446655440003', 'İzmir', 35, 'Ege'),
  ('990e8400-e29b-41d4-a716-446655440004', 'Antalya', 7, 'Akdeniz'),
  ('990e8400-e29b-41d4-a716-446655440005', 'Bursa', 16, 'Marmara')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory settings
INSERT INTO public.inventory_settings (id, default_low_stock_threshold) VALUES (true, 10)
ON CONFLICT (id) DO NOTHING;
