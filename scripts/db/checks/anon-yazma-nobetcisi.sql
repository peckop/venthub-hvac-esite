-- INV-ANON-YAZMA-1 — anon rolü VİTRİN tablolarına YAZAMAZ (REC-138 yan bulgusu).
--
-- NİÇİN VAR (ölçüldü 2026-09-04, canlı prod):
--   · anon anahtarı prod istemci paketinde AÇIK (17 chunk'tan 2'si taşıyor), rol `anon`,
--     2035'e kadar geçerli — yani bu anahtar herkesin elinde ve öyle TASARLANMIŞ.
--   · anon o anahtarla vitrin tablolarını OKUYABİLİYOR (products, categories, brands,
--     product_prices, … 200) ama sipariş/ödeme/kullanıcı/denetim verisi kapalı (401).
--   · Yazmayı engelleyen tek şey RLS: on vitrin tablosunun ONUNDA DA anon için
--     INSERT/UPDATE/DELETE POLİTİKASI YOK.
--   · ⭐AMA tablo düzeyinde anon rolüne DELETE/INSERT/UPDATE **GRANT'i VERİLMİŞ.**
--     Yani koruma TEK KATMANDA duruyor: politika yokluğu. Yarın biri bir UPDATE
--     politikası eklerse (ya da RLS'i geçici kapatırsa), herkesin elindeki anahtar
--     yazma anahtarına dönüşür. Grant'ları geri almak migration ister = Recep kapısı;
--     bu nöbetçi o karar gelene kadar SINIFI GÖRÜNÜR tutar ve regresyonu yakalar.
--
-- NİÇİN REST DEĞİL DB: aynı soru REST üzerinden ölçülemez. Denendi —
-- `PATCH products?id=eq.<var olmayan uuid>` HTTP 200 + boş dizi döndürüyor ve bu çıktı
-- "RLS reddetti" ile "WHERE eşleşmedi" hâllerinde AYNI. PostgREST, UPDATE politikası
-- yokken 42501 değil "sıfır satır" verir. Var olan satırı hedeflemek ayırt edici olurdu
-- ama RLS gevşekse GERÇEKTEN yazardı. Ayırt eden tek katman katalogdur.
--
-- ⭐EVREN SABİT LİSTE DEĞİL, TÜRETİLİR: "hangi tablolar" sorusu anon'un SELECT
-- GRANT'ine sahip olduğu tablolardan gelir. Sabit liste yazmak bayatlar — dün tam bu
-- sınıfın bedeli ödendi (kilitteki slug listesi bayatlamış, biri 404 vermişti).
-- Yeni bir vitrin tablosu eklenince nöbetçi onu KENDİLİĞİNDEN kapsar.
--
-- ÇIKTI SÖZLEŞMESİ: her satır bir POLİTİKA (sayı DEĞİL — döküm). Karşılaştırma
-- `docs/anon-yazma-politika-ilani.json` ile yapılır: listede olmayan satır = İHLAL.
-- Sayı yerine döküm dönmesi bilinçli: "1 politika var" demek yarın hangi politikanın
-- değiştiğini söylemez; agrega sayı ters gideni gizler.
with anon_okuyabildigi as (
  select table_name
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee = 'anon'
    and privilege_type = 'SELECT'
)
select p.tablename, p.policyname, p.cmd, p.roles::text as roller,
       coalesce(p.with_check, '') as with_check
from pg_policies p
join anon_okuyabildigi a on a.table_name = p.tablename
where p.schemaname = 'public'
  and ('anon' = any(p.roles) or 'public' = any(p.roles))
  and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
order by p.tablename, p.policyname;
