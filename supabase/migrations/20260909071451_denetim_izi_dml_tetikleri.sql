-- ===========================================================================
-- REC-292 — DENETİM İZİ: betikle yapılan doğrudan DB yazımları admin_audit_log'a düşer
--
-- NİÇİN VAR (ölçüm, 2026-09-09, prod)
--
-- Denetim izi admin panelinde VAR (`logAdminAction`, 25 çağrı yeri), panel dışında YOK:
-- `scripts/**` altında veri yazan 14 dosyanın SIFIRI denetim satırı yazıyor. Sonucu prod'da
-- ölçüldü: 2026-09-08'de 7 kategori silme + 18 ürün taşıma + 104 görsel yapıldı ve
-- `admin_audit_log`'da o günden HİÇBİR TABLODAN tek satır yok (son kayıt 09-07). Tablonun
-- bir yıllık toplam hacmi 61 satır.
--
-- NİÇİN TETİK, NİÇİN DİSİPLİN DEĞİL: yazma yüzeyi tek dil değil — SDK `.from()`, Python
-- `.table()`, ham `fetch` + PostgREST `POST/PATCH`, dinamik tablo adı (`rest/v1/${t}`),
-- ham `.sql` dosyaları, Supabase SQL editörü ve MCP `execute_sql`. Son ikisi DOSYA DEĞİL;
-- hiçbir tarama onları göremez. Tetik satır-düzeyi DML'in hepsinin altında durur.
--
-- ⛔TETİĞİN GÖRMEDİĞİ YER, ADIYLA: TRUNCATE satır tetiği ATEŞLEMEZ ve RLS'e tabi değildir.
-- Ölçüldü (2026-09-09): altı tablonun hepsinde TRUNCATE yetkisi `anon`, `authenticated` ve
-- `service_role` rollerinde. Bugün ulaşılabilir bir yol YOK (PostgREST TRUNCATE'i dışa
-- açmaz; keyfi SQL koşturan RPC de yok — `exec`/`exec_sql`/davranışa göre tarama, üçü de 0
-- satır). Ama yetki hazır bekliyor: LATENT. Onarımı (REVOKE) bu migration'da DEĞİL, ayrı
-- kayıtta ve ayrı PR'da (OPS kararı 2026-09-09). Burada yazılı olması, unutulmaması için.
--
-- ⛔FAIL-CLOSED, KASITLI (OPS hükmü H1)
-- Bu fonksiyonlarda `exception when others` bloğu YOKTUR ve bu bir eksiklik DEĞİL, karardır.
-- Tetik ile veri yazımı AYNI transaction'dadır: denetim satırı yazılamazsa veri yazımı da
-- geri alınır. Yani fail-closed, Postgres'in atomikliğinden BEDAVA gelen varsayılandır;
-- fail-open'ı elde etmek için fazladan kod yazmak gerekir. Depodaki mevcut örnek
-- (`20260826213000_enforce_role_change_actor_guard.sql:88`) o fazladan kodu yazıyor ve
-- hatayı WARNING'e indiriyor — orada gerekçesi vardı (KAYIT/GÖÇ akışı kırılmamalı), burada
-- YOK: kaybedilen şey kanıtın kendisidir ve geriye dönük üretilmesi yasaktır.
-- BEDELİ ADIYLA: denetim yazımı patlarsa kütle katalog göçü de durur. Kabul edildi —
-- alternatifi, kanıtsız yazımın sessizce geçmesiydi.
--
-- ⛔"KİM" SORUSU CEVAPLANMIYOR VE BU GİZLENMİYOR
-- service_role bağlamında `auth.uid()` NULL döner. `actor` kolonu o durumda NULL kalır.
-- Raporlar bunu "bilinmiyor" diye göstermeli, "sistem" DEMEMELİ. Garanti edilen: NE
-- değişti, NE ZAMAN, HANGİ satır, ESKİ/YENİ değer. Cevaplanabilir hale getirmenin yolu var
-- (özel claim'li jeton ya da ayrı DB rolü) ama bu işin kapsamı dışı (OPS) — yani çözülebilir
-- bir eksiklik, doğa yasası değil.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- TEK FONKSİYON — ve niçin ikinci bir kopya YAZILMADI (⚠OPS H3'ten SAPMA, adıyla)
--
-- H3 `site_settings` için "ayrı, tenant'sız tetik" dedi. Sebebi haklıydı: o tabloda
-- `tenant_id` kolonu YOK (prod ölçümü) ve ev şablonu `new.tenant_id` okuduğu için orada
-- ÇALIŞMA ANINDA `record "new" has no field "tenant_id"` fırlatırdı — plpgsql geç bağladığı
-- için `CREATE FUNCTION` anında yakalanmadan.
--
-- SAPMA: ikinci bir fonksiyon yazmak yerine tenant'ı `to_jsonb(...)->>'tenant_id'` ile
-- okuyorum. Gerekçe: bu, o tabloyu istisna yaparak SORUNU ATLATMAK değil, HATA SINIFINI
-- TAMAMEN KALDIRMAKtır — hangi tabloya bağlanırsa bağlansın "olmayan alan" hatası doğmaz.
-- İkinci gerekçe: neredeyse birebir aynı iki fonksiyon zamanla birbirinden ayrışır ve
-- ayrışan kopya sessiz arızanın klasik yeridir.
-- ⚠SAPMANIN BEDELİ, GİZLENMİYOR: `site_settings` satırları `tenant_id` taşımadığı için
-- denetim satırı `admin_audit_log.tenant_id`'nin SABİT VARSAYILANINI alır (kolon NOT NULL).
-- Yani o satırların tenant damgası GERÇEK DEĞİL, VARSAYILANDIR. Faz 2 (multi-tenant) PARK'ta
-- olduğu için bugün zarar üretmiyor; PARK kalkarsa bu satır BORÇTUR ve `site_settings`
-- tenant'lanmadan multi-tenant AÇILAMAZ.
-- ---------------------------------------------------------------------------
create or replace function public.denetim_izi_yaz()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_eski   jsonb;
  v_yeni   jsonb;
  v_pk     text;
  v_tenant uuid;
  v_before jsonb;
  v_after  jsonb;
  v_anahtar text;
begin
  v_eski := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_yeni := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;

  -- Satır kimliği ve tenant, kolon ADIYLA değil JSONB üzerinden okunur: olmayan alan
  -- hatası doğmaz (yukarıdaki sapma notu).
  v_pk     := coalesce(v_yeni->>'id', v_eski->>'id');
  v_tenant := nullif(coalesce(v_yeni->>'tenant_id', v_eski->>'tenant_id'), '')::uuid;

  if tg_op = 'UPDATE' then
    -- NO-OP UPDATE ELEMESİ. `ON CONFLICT DO UPDATE` satır fiilen değişmese de tetiği
    -- ateşler; `updated_at` de her dokunuşta değişir. İkisi elenmezse tablo kendi
    -- gürültüsüyle dolar ve ev geleneğinin dersi gerçekleşir: OKUNMAYAN ALARM ALARM DEĞİLDİR.
    v_before := '{}'::jsonb;
    v_after  := '{}'::jsonb;
    for v_anahtar in select jsonb_object_keys(v_yeni)
    loop
      if v_anahtar not in ('updated_at') and (v_yeni->v_anahtar) is distinct from (v_eski->v_anahtar) then
        v_before := v_before || jsonb_build_object(v_anahtar, v_eski->v_anahtar);
        v_after  := v_after  || jsonb_build_object(v_anahtar, v_yeni->v_anahtar);
      end if;
    end loop;

    -- Anlamlı değişiklik yoksa satır YAZILMAZ. Bu bir fail-open DEĞİL: yazılacak bir
    -- olgu yok, dolayısıyla kaybedilen bir kanıt da yok.
    if v_after = '{}'::jsonb then
      return new;
    end if;
  else
    -- INSERT/DELETE'te tam satır tutulur: "ne eklendi / ne silindi" sorusunun cevabı
    -- satırın kendisidir, kolon farkı değil.
    v_before := v_eski;
    v_after  := v_yeni;
  end if;

  -- ⛔EXCEPTION BLOĞU YOK — fail-closed, kasıtlı (yukarıdaki H1 notu).
  if v_tenant is null then
    -- tenant_id kolonu OLMAYAN tablo (bugün: site_settings). Kolon INSERT'ten çıkarılır ve
    -- NOT NULL DEFAULT devreye girer. Sabit UUID BURAYA YAZILMAZ: aynı sabiti ikinci bir
    -- yere kopyalamak, iki yerin ayrışması demektir.
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user
        || ' | tenant DAMGASI VARSAYILANDIR (tabloda tenant_id yok)'
    );
  else
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user,
      v_tenant
    );
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

comment on function public.denetim_izi_yaz() is
  'REC-292: DML denetim izi. FAIL-CLOSED (exception blogu YOK, kasitli). tenant ve id JSONB '
  'uzerinden okunur, kolon adiyla DEGIL: olmayan alan hatasi dogmaz. TRUNCATE bu tetigi '
  'ATESLEMEZ (ayri kayit).';

-- ---------------------------------------------------------------------------
-- TETİKLER
--
-- ⭐AD SEÇİMİ KASITLI: aynı zamanlamalı tetikler ALFABETİK ateşlenir. Bu tablolarda
-- `on_*_change` adlı webhook tetikleri var ve gövdeleri `net.http_post` çağırıyor.
-- `denetim_*` < `on_*` olduğu için denetim satırı webhook'tan ÖNCE yazılır. Sıra
-- ters olsaydı `net` erişilemediğinde ifade düşer ve denetim de yazılmadan giderdi.
--
-- AFTER kullanılır: yazılan şey GERÇEKLEŞEN değişikliktir, denenmiş olan değil.
-- ---------------------------------------------------------------------------

drop trigger if exists denetim_izi_categories on public.categories;
create trigger denetim_izi_categories
  after insert or update or delete on public.categories
  for each row execute function public.denetim_izi_yaz();

drop trigger if exists denetim_izi_product_families on public.product_families;
create trigger denetim_izi_product_families
  after insert or update or delete on public.product_families
  for each row execute function public.denetim_izi_yaz();

drop trigger if exists denetim_izi_product_images on public.product_images;
create trigger denetim_izi_product_images
  after insert or update or delete on public.product_images
  for each row execute function public.denetim_izi_yaz();

drop trigger if exists denetim_izi_brands on public.brands;
create trigger denetim_izi_brands
  after insert or update or delete on public.brands
  for each row execute function public.denetim_izi_yaz();

-- site_settings: tenant_id YOK — fonksiyon bunu JSONB yoluyla karşılıyor (sapma notu).
-- ⭐TİCARİ OLARAK EN AĞIR KALEM: satış kipi anahtarı (REC-168) bu tabloda ve vitrinde
-- fiyatın görünüp görünmeyeceğini belirliyor. `scripts/kip/satis-kipine-gec.mjs` onu
-- denetim izi olmadan çeviriyordu.
drop trigger if exists denetim_izi_site_settings on public.site_settings;
create trigger denetim_izi_site_settings
  after insert or update or delete on public.site_settings
  for each row execute function public.denetim_izi_yaz();

-- ---------------------------------------------------------------------------
-- products — KOLON SÜZGEÇLİ (OPS hükmü H2)
--
-- NİÇİN SÜZGEÇ: `products` tablosuna HER SİPARİŞTE yazılıyor (stok düşme/geri yükleme,
-- rezervasyon serbest bırakma; `20250902_create_stock_rpc_functions.sql`,
-- `20250918_inventory_batch_undo.sql`) ve üç cron sürekli koşuyor. Süzgeç olmasa
-- "kim fiyatı/kategoriyi değiştirdi" sorusunun cevabı otomatik stok satırları arasında
-- kaybolurdu. Kapsam bu yüzden KATALOG/TİCARİ kimlik kolonlarıdır.
--
-- ⛔KASITLI OLARAK DIŞARIDA (otomasyonun yazdığı alanlar): stock_qty ·
-- low_stock_threshold · low_stock_override · updated_at · cost_in_base ·
-- purchase_rate_to_base · last_purchase_cost · last_purchase_currency · last_purchased_at.
-- INSERT ve DELETE süzgece TABİ DEĞİL: ürünün yaratılması ve silinmesi her hâlükârde olaydır.
-- ---------------------------------------------------------------------------
drop trigger if exists denetim_izi_products on public.products;
create trigger denetim_izi_products
  after insert or delete on public.products
  for each row execute function public.denetim_izi_yaz();

drop trigger if exists denetim_izi_products_upd on public.products;
create trigger denetim_izi_products_upd
  after update of
    name, name_i18n, brand, price, sku, category_id, subcategory_id, status, is_featured,
    technical_specs, purchase_price, purchase_currency, slug, model_code, family_id,
    barcode, tax_rate, is_taxable, weight_kg, width_mm, height_mm, depth_mm,
    description_i18n, deleted_at, warehouse_location, supplier_name, tenant_id
  on public.products
  for each row execute function public.denetim_izi_yaz();

commit;
