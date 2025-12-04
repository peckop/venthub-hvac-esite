-- Delete the duplicate product created by mistake
DELETE FROM public.products WHERE sku = '65195';

-- Update the existing product with correct data and Turkish content
UPDATE public.products
SET
  model_code = '65195',
  description = 'Saten bitişli gümüş renkli alüminyum ön panel ve 9 yatay cilalı alüminyum bölümden oluşan hava giriş ızgarası. Arka preslenmiş çelik gövde, siyah renk. Nominal genişlik: 900 mm. Nötr versiyon (ortam sıcaklığı), 2 hız kademesi. Çift şaft uzantılı ve termal aşırı yük korumalı AC motor. Termoplastik reçineden (SAN) kalıplanmış 2 teğetsel fan. IR uzaktan kumanda dahildir.',
  technical_specs = '{
    "rpm_max": 1450,
    "rpm_min": 1400,
    "size_a_mm": 900,
    "size_b_mm": 220,
    "size_c_mm": 190,
    "voltage_v": 230,
    "weight_kg": 10,
    "frequency_hz": 50,
    "number_of_speeds": 2,
    "max_ambient_temp_c": 30,
    "airflow_speed_max_ms": 11,
    "airflow_speed_min_ms": 9,
    "delivery_1st_speed_ls": 305,
    "absorbed_current_max_a": 0.7,
    "delivery_1st_speed_m3h": 1100,
    "max_delivery_max_speed_ls": 388,
    "absorbed_power_1st_speed_w": 110,
    "max_delivery_max_speed_m3h": 1400,
    "max_absorbed_power_max_speed_w": 160,
    "sound_pressure_level_lp_db_a_2m_max": 57,
    "sound_pressure_level_lp_db_a_2m_min": 55
  }'::jsonb,
  meta_title = 'Vortice AIR DOOR AD 900 - Ortam Havalı Hava Perdesi 900mm | VentHub',
  meta_description = 'Vortice AIR DOOR AD 900 Hava Perdesi satın al. 900mm genişlik, 2 hız kademesi, nötr hava, 1400 m3/h maksimum hava debisi. Mağaza ve ticari girişler için ideal. Hızlı kargo.',
  slug = 'vortice-air-door-ad-900-ortam-havali-hava-perdesi',
  updated_at = NOW()
WHERE sku = 'AVE-VOR-00013';
