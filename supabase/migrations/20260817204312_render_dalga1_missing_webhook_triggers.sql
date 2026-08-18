-- Render Dalga-1 / W4 — vitrini besleyen ÜÇ tabloda eksik webhook tetiği
-- Plan: docs/plans/render-dalga1-plan-2026-08-17.md §2 W4
-- Cetvel: docs/standards/rendering-cache-standard.md §3
--
-- KURAL (cetvel §3): statik vitrin sayfasında görünen HER tablonun DB tetiği + webhook
-- handler dalı olmalı. Yoksa veri değişir, sayfa değişmez ve **hiçbir test bunu görmez**
-- — bu deponun 2026-08-15'te ölçtüğü sessiz arıza sınıfı (1044 fiyat satırı prod'a
-- yazıldı, vitrin değişmedi).
--
-- ÜÇ EKSİK ZİNCİR (denetimde ölçüldü, prod `pg_trigger`):
--   · product_images — PDP görseli + kart görseli. **Bugün 0 satır**: zincir, T069'da
--     374 ürünün görseli yüklenmeden ÖNCE yerinde olmalı. Sonra kurulursa görseller
--     girilir ve hiçbir sayfa tazelenmez. LANSMAN KRİTİK kalem budur.
--   · brands       — marka adı/bilgisi PDP ve kartlarda görünür.
--   · price_lists  — fiyat listesi değişimi PDP fiyatını etkiler.
--
-- Handler dalları aynı PR'da eklendi (`src/app/api/webhook/supabase/route.ts`).
-- Tetik + dal ÇİFTİ zorunludur; biri olmadan diğeri sessiz kalır (INV-RENDER-2 çift
-- yönlü doğrular).
--
-- DDL riski düşük: yalnız `create trigger`, mevcut `handle_supabase_webhook()` fonksiyonu
-- kullanılıyor (o da 20260816160245'te Vault'a taşındı). Tetik adları ve biçim, canlı
-- tetiklerle birebir aynı desende (ölçüldü: `on_<tablo>_change`, AFTER INSERT OR DELETE
-- OR UPDATE, FOR EACH ROW).

begin;

drop trigger if exists on_product_images_change on public.product_images;
create trigger on_product_images_change
  after insert or delete or update on public.product_images
  for each row execute function public.handle_supabase_webhook();

drop trigger if exists on_brands_change on public.brands;
create trigger on_brands_change
  after insert or delete or update on public.brands
  for each row execute function public.handle_supabase_webhook();

drop trigger if exists on_price_lists_change on public.price_lists;
create trigger on_price_lists_change
  after insert or delete or update on public.price_lists
  for each row execute function public.handle_supabase_webhook();

commit;
