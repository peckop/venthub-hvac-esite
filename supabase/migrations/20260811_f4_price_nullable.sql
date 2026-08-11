-- F4 — products.price nullable (kayıt migration'ı; 2026-08-11 yükleme sırasında MCP ile uygulandı)
-- "Teklif Alın" modeli: satış fiyatı motor gelene dek YAZILMAZ (null) — legacy NOT NULL fosil kısıttı.
-- İdempotent: DROP NOT NULL tekrar koşulabilir.
alter table public.products alter column price drop not null;
