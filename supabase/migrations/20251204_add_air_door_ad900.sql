-- Insert AIR DOOR AD 900 product
INSERT INTO public.products (
  name,
  slug,
  model_code,
  sku,
  brand,
  description,
  technical_specs,
  category_id,
  status,
  meta_title,
  meta_description
) 
SELECT
  'AIR DOOR AD 900',
  'air-door-ad-900',
  '65195',
  '65195',
  'Vortice',
  'Aluminium front panel with satin finish, colour silver, and air inlet grille comprising 9 horizontal sections of polished aluminium. Rear pressed steel casing, colour black. Nominal width: 900 mm. Neutral version (ambient temp), 2 speeds. AC motor with double shaft extension and thermal overload protection. 2 tangential fans moulded in thermoplastic resin (SAN). IR remote control included.',
  '{
    "absorbed_current_max_a": 0.70,
    "absorbed_power_1st_speed_w": 110,
    "frequency_hz": 50,
    "max_ambient_temp_c": 30,
    "max_absorbed_power_max_speed_w": 160,
    "number_of_speeds": 2,
    "voltage_v": 230,
    "weight_kg": 10,
    "airflow_speed_max_ms": 11,
    "airflow_speed_min_ms": 9,
    "delivery_1st_speed_ls": 305,
    "delivery_1st_speed_m3h": 1100,
    "max_delivery_max_speed_ls": 388,
    "max_delivery_max_speed_m3h": 1400,
    "rpm_max": 1450,
    "rpm_min": 1400,
    "sound_pressure_level_lp_db_a_2m_max": 57,
    "sound_pressure_level_lp_db_a_2m_min": 55,
    "size_a_mm": 900,
    "size_b_mm": 220,
    "size_c_mm": 190
  }'::jsonb,
  (SELECT id FROM public.categories WHERE name ILIKE '%Hava Perdesi%' OR name ILIKE '%Air Curtains%' LIMIT 1),
  'active',
  'AIR DOOR AD 900 - Vortice Air Curtain 900mm | VentHub',
  'Buy Vortice AIR DOOR AD 900 Air Curtain. 900mm width, 2 speeds, neutral air, max airflow 1400 m3/h. Perfect for shops and commercial entrances. Fast shipping.'
WHERE NOT EXISTS (
    SELECT 1 FROM public.products WHERE sku = '65195'
);
