-- F5 — Yeni kategorilerin aktivasyonu (sözlük anahtarları AYNI PR'ın kod tarafında eklendi:
-- common.categoryList.sub.{acid-fans,freq-converters,duct-heaters} + common.categoryList.parking-jet).
-- F2'de karanlık (is_active=false) açılmışlardı; vitrin artık adları sözlükten çözebilir.
update public.categories set is_active = true
where slug in ('acid-resistant-fans', 'frequency-converters', 'electric-duct-heaters', 'parking-jet-fan')
  and is_active = false;
