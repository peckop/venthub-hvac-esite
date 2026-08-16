-- W2b-2 — Siparis satiri fiyat/kur anlik goruntusu (cetvel: docs/standards/pricing-standard.md §4.1 + §13)
--
-- NIYE: `venthub_order_items` uzerindeki 6 snapshot kolonu 2025-08-29'dan beri duruyor
-- (20250829_order_item_snapshots.sql) ve siparis kalemini yazan TEK yol
-- (supabase/functions/iyzico-payment) bunlarin HICBIRINI doldurmuyor. Yani kolonlar var,
-- sozlesme yok. Cetvel §4.1 ayrica gosterim para birimi + kur + kur tarihi snapshot'ini
-- ZORUNLU kiliyor; bu uc alan hic yoktu.
--
-- NIYE SIMDI: `select count(*) from public.venthub_order_items` = 0 (2026-08-15'te olculdu).
-- Tablo BOS oldugu icin geri-doldurma gerekmiyor ve kolonlari NOT NULL yapabiliyoruz. Ilk
-- gercek siparis girdikten sonra bu pencere kapanir: o noktada ayni sertlestirme
-- migration + backfill + kesinti isi olur.
--
-- TASARIM: "yazma yolu bunlari doldurmali" bir CONVENTION degil, bir KISIT. `authenticated`
-- rolunun bu tabloda INSERT grant'i var (20260530220000_tenant_schema_setup.sql:260), yani
-- kod disindan da satir eklenebilir; sozlesmeyi yalnizca conformance testiyle korumak o yolu
-- acikta birakirdi. NOT NULL her yazari baglar.

begin;

-- 1) Cetvel §4.1 — coklu-para gosterim sozlesmesi. Islem para birimi DAIMA TRY; bu uc alan
--    "siparis anin da hangi para biriminde GOSTERILIYORDU ve hangi kurla" sorusunu dondurur.
--    Gosterim para birimi henuz hicbir yerde secilmiyor (W5), bu yuzden varsayilan TRY/1.0 —
--    ama alan simdi var, cunku sonradan eklemek gecmis siparisleri her kur hareketinde
--    yeniden degerlendirilebilir birakir (§4.1'deki uyari).
alter table public.venthub_order_items
  add column if not exists display_currency    char(3) not null default 'TRY',
  add column if not exists display_rate        numeric not null default 1,
  add column if not exists rate_effective_date date    not null default current_date;

-- 2) Var olan 5 snapshot kolonu + product_snapshot: bos tabloda NOT NULL'a cekilir.
--    price_list_id_snapshot BILEREK disarida: fiyat bir liste yerine kuraldan/teklif ten
--    gelebilir, o durumda liste kimligi YOKTUR. Bu alani kodun YAZDIGINI INV-PRICE-3 zorlar;
--    degerin dolu olmasini zorlamak mesru bir siparisi reddederdi.
alter table public.venthub_order_items
  alter column unit_price_snapshot    set not null,
  alter column product_name_snapshot  set not null,
  alter column product_sku_snapshot   set not null,
  alter column tax_rate_snapshot      set not null,
  alter column product_snapshot       set not null;

-- 3) Deger sagligi: snapshot bir kayittir, "0 yazip gectim" kabul edilemez.
alter table public.venthub_order_items
  add constraint venthub_order_items_snapshot_sane
  check (
    unit_price_snapshot >= 0
    and tax_rate_snapshot >= 0 and tax_rate_snapshot <= 100
    and display_rate > 0
    and char_length(display_currency) = 3
  );

-- 4) YETIM TETIK — bu migration'in asil isi degil ama ayni tabloda duran canli bir mayin.
--    `update_venthub_order_items_updated_at` BEFORE UPDATE tetigi
--    `update_updated_at_column()`'i cagiriyor, o da `NEW.updated_at = now()` yaziyor —
--    ama bu tabloda `updated_at` KOLONU YOK (2026-08-15'te prod'da olculdu). Yani bu tabloda
--    yapilacak HER UPDATE, plpgsql'de "record new has no field updated_at" ile patlar.
--    Bugune kadar gorulmemesinin tek sebebi tablonun bos olmasi ve hicbir kodun order item
--    UPDATE etmemesi. Kardes tetik zaten dusurulmustu (20260811_f2_split_model_schema.sql:158);
--    bu, ayni temizligin kacan yarisi.
drop trigger if exists update_venthub_order_items_updated_at on public.venthub_order_items;

commit;
