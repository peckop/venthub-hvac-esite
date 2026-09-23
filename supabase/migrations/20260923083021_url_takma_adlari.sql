-- REC-300 Faz 1-A — ESKİ ADRES TAKMA AD TABLOSU (url_takma_adlari) + yeniden adlandırma tetikleri
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §4 katman 2, §5 Faz 1-A — v5)
-- ═════════════════════════════════════════════════════════════════════════════
-- Bir ürünün, ailenin ya da kategorinin slug'ı değişince eski adres bugün ya elle yazılmış bir
-- `next.config` satırıyla yaşıyor ya da sessizce 404'e düşüyor. Ölçüldü (2026-09-22/23):
--   · VRT-253490106XN (karar 75, 4kW→3kW) slug'ı değişti, `next.config`'te satırı YOK;
--   · NIC-11921 ve 5 VRT-CA-IL ürünü için 6 satır elle yazıldı (her biri ayrı bir PR).
-- Yeniden adlandırma bir VERİ olayıdır; kaydı da verinin yanında, verinin değiştiği anda tutulur.
-- Bu tablo K3-b adres yayınının (REC-300) ikinci katmanıdır: derleme anı haritası (katman 1,
-- middleware) derlemeden SONRA değişen slug'ları bilemez; sayfa "bulunamadı" dalında bu tabloya
-- bakar ve 308 verir. Bu migration canlıda HİÇBİR adresi değiştirmez; yalnız kayıt tutmaya başlar.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TASARIM (plan-challenger v3 Y1/Y2/O4, v4 D1 cevapları)
-- ═════════════════════════════════════════════════════════════════════════════
-- · Tetik fonksiyonu SECURITY DEFINER + sabit search_path: admin slug'ı `authenticated` rolle
--   düzenliyor (prod_admin_update_opt, product_families_admin_write); invoker yetkisiyle takma ad
--   INSERT'i RLS'e takılır ve slug UPDATE'inin TAMAMI geri alınırdı. Emsal: denetim_izi_yaz.
-- · A→B→A→B yeniden adlandırması: INSERT … ON CONFLICT DO UPDATE (unique ihlali tetiği, dolayısıyla
--   UPDATE'i düşürmesin). Yeni slug bir takma adla çakışıyorsa o takma ad SİLİNİR: canlı slug
--   önceliklidir (aksi hâlde canlı sayfa kendi eski adına yönlenirdi).
-- · Okuma: RLS `tenant_id = jwt_tenant_id()` (evdeki kalıp); yazma yalnız tetik. Bu veritabanında
--   `pg_default_acl` yeni tabloya anon/authenticated için TAM yetki veriyor (ölçüldü 2026-09-23)
--   → REVOKE ALL + hedefli GRANT SELECT açıkça yazılır.
-- · Tetikler yalnız ilgili kolon DEĞİŞİNCE koşar (`UPDATE OF … WHEN (… IS DISTINCT FROM …)`):
--   ürün tablosundaki diğer 5 tetik (webhook, denetim, arama, updated_at) ile iş yükü paylaşılmaz.
-- · Kısıtlar: model adresi "son `-p-`'den böl, sağ = SKU" kuralıyla çözülür → SKU `-p-` içeremez ve
--   `p-` ile başlayamaz (`slug-p-p-100` yanlış bölünürdü); aile ve kategori slug'ı `-p-` içeremez.
--   Mevcut veri ölçüldü (2026-09-23): SKU 0 · aile 0 · kategori 0 ihlal → VALIDATE güvenli.
--
-- SAPMA (plan §5 Faz 1-A m.4 "Casals 4 + karar 86'nın 39 ailesi ÖNCEDEN tohumlanır"): tohumlanMAZ.
-- O slug'lar Faz 1-B'de değişecek ve değiştikleri AN bu tetik eski adlarını yazar; bugün
-- tohumlamak, hâlâ canlı olan bir slug'ı "eski" diye kaydetmek olurdu. Tohum yalnız bugüne dek
-- GERÇEKTEN değişmiş olanlardır: admin_audit_log'daki 7 ürün slug değişikliği (ölçüldü:
-- products UPDATE slug farkı 7; aile/kategori slug ya da SKU değişikliği 0). DB'de hiç olmamış
-- eski adresler (13 dilsiz kategori kuralı, 6 Lineo) bu tablonun değil tohum DOSYASININ işidir
-- (plan §4.1).
--
-- GERİ ALMA (elle, tek işlem): drop trigger url_takma_ad_urun on public.products;
--   drop trigger url_takma_ad_aile on public.product_families;
--   drop trigger url_takma_ad_kategori on public.categories;
--   drop function public.tg_url_takma_ad_yaz(); drop table public.url_takma_adlari;
--   alter table public.products drop constraint products_sku_adres_ayirici_yok;
--   alter table public.product_families drop constraint product_families_slug_adres_ayirici_yok;
--   alter table public.categories drop constraint categories_slug_adres_ayirici_yok;
-- Geri alma kayıt tutmayı durdurur; o ana dek yazılmış takma adlar tabloyla birlikte gider.
--
-- Cetvel: docs/standards/migration-safety-standard.md (salt-ekleyici; INV-MIGRATION-1 biçim b) ·
-- CLAUDE.md kural 11 (admin işlemleri zaten denetim izinde), 12 (tenant), 13 (merge = prod).

-- ⭐ZAMAN AŞIMLARI (INV-MIGRATION-3): üç tabloya tetik ve kısıt ekleniyor; kilit beklerse vitrin
-- durmasın, migration hızlı başarısız olsun.
set lock_timeout = '5s';
set statement_timeout = '60s';

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) TABLO
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.url_takma_adlari (
  tenant_id   uuid        not null,
  tur         text        not null check (tur in ('urun', 'sku', 'aile', 'kategori')),
  -- 'urun' / 'sku' / 'aile' slug'ları bugün TEK dillidir → '*'. Kategori slug'ı dile göre ayrı
  -- (categories.slug = EN kanonik, metadata.slug.tr = TR görünen) → 'tr' / 'en'.
  dil         text        not null check (dil in ('tr', 'en', '*')),
  eski_slug   text        not null check (eski_slug <> '' and eski_slug = lower(eski_slug)),
  hedef_id    uuid        not null,
  sebep       text        not null,
  created_at  timestamptz not null default now(),
  primary key (tenant_id, tur, dil, eski_slug)
);

comment on table public.url_takma_adlari is
  'REC-300 Faz 1-A: eski slug → bugünkü nesne. Yeniden adlandırma anında tetik yazar '
  '(tg_url_takma_ad_yaz). Sayfa "bulunamadı" dalında okur ve 308 verir. Yazma yalnız tetik; '
  'okuma kiracı kapsamlı. Plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §4.';

-- Çözücünün soru biçimi: "bu kiracıda bu türde bu eski slug kime gidiyor?" — PK tam bunu karşılar.
create index if not exists url_takma_adlari_hedef_idx on public.url_takma_adlari (tenant_id, tur, hedef_id);

alter table public.url_takma_adlari enable row level security;

revoke all on table public.url_takma_adlari from public, anon, authenticated;
grant select on table public.url_takma_adlari to anon, authenticated;

drop policy if exists url_takma_adlari_kiraci_okuma on public.url_takma_adlari;
create policy url_takma_adlari_kiraci_okuma on public.url_takma_adlari
  for select to anon, authenticated
  using (tenant_id = public.jwt_tenant_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) TETİK FONKSİYONU
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.tg_url_takma_ad_yaz()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_sebep text := 'tetik: ' || tg_table_name || ' ' || to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
begin
  if tg_table_name = 'products' then
    if old.slug is not null and old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'urun', '*', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if new.slug is not null then
      delete from public.url_takma_adlari
       where tenant_id = new.tenant_id and tur = 'urun' and dil = '*' and eski_slug = lower(new.slug);
    end if;

    if old.sku is distinct from new.sku then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'sku', '*', lower(old.sku), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
      delete from public.url_takma_adlari
       where tenant_id = new.tenant_id and tur = 'sku' and dil = '*' and eski_slug = lower(new.sku);
    end if;

  elsif tg_table_name = 'product_families' then
    if old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'aile', '*', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    delete from public.url_takma_adlari
     where tenant_id = new.tenant_id and tur = 'aile' and dil = '*' and eski_slug = lower(new.slug);

  elsif tg_table_name = 'categories' then
    -- EN: kanonik `slug` (bugün 31/31 satırda metadata.slug.en ile eşit — ölçüldü 2026-09-23;
    -- ikisi ayrışırsa ikisinin eski değeri de kaydedilir).
    if old.slug is distinct from new.slug then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'en', lower(old.slug), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if nullif(old.metadata -> 'slug' ->> 'en', '') is not null
       and (old.metadata -> 'slug' ->> 'en') is distinct from (new.metadata -> 'slug' ->> 'en')
       and lower(old.metadata -> 'slug' ->> 'en') is distinct from lower(old.slug) then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'en', lower(old.metadata -> 'slug' ->> 'en'), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    if nullif(old.metadata -> 'slug' ->> 'tr', '') is not null
       and (old.metadata -> 'slug' ->> 'tr') is distinct from (new.metadata -> 'slug' ->> 'tr') then
      insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
      values (new.tenant_id, 'kategori', 'tr', lower(old.metadata -> 'slug' ->> 'tr'), new.id, v_sebep)
      on conflict (tenant_id, tur, dil, eski_slug)
      do update set hedef_id = excluded.hedef_id, sebep = excluded.sebep, created_at = now();
    end if;
    -- Canlı slug önceliği, iki dilde.
    delete from public.url_takma_adlari
     where tenant_id = new.tenant_id and tur = 'kategori'
       and ((dil = 'en' and eski_slug in (lower(new.slug), lower(coalesce(new.metadata -> 'slug' ->> 'en', ''))))
         or (dil = 'tr' and eski_slug = lower(coalesce(new.metadata -> 'slug' ->> 'tr', ''))));
  end if;

  -- ⛔EXCEPTION bloğu YOK — fail-closed, kasıtlı: takma ad yazılamıyorsa yeniden adlandırma da
  -- olmamalı; aksi hâlde eski adres sessizce 404'e düşer ve bunu hiçbir kapı görmez.
  return new;
end;
$function$;

revoke all on function public.tg_url_takma_ad_yaz() from public, anon, authenticated;

comment on function public.tg_url_takma_ad_yaz() is
  'REC-300 Faz 1-A: slug/SKU yeniden adlandırılınca eski değeri url_takma_adlari''na yazar; '
  'yeni değerle çakışan takma adı siler (canlı slug önceliği). SECURITY DEFINER: admin '
  'authenticated rolle düzenliyor, invoker yetkisi RLS''e takılıp UPDATE''i düşürürdü.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) TETİKLER — yalnız ilgili kolon DEĞİŞİNCE
-- ─────────────────────────────────────────────────────────────────────────────
drop trigger if exists url_takma_ad_urun on public.products;
create trigger url_takma_ad_urun
  after update of slug, sku on public.products
  for each row
  when (old.slug is distinct from new.slug or old.sku is distinct from new.sku)
  execute function public.tg_url_takma_ad_yaz();

drop trigger if exists url_takma_ad_aile on public.product_families;
create trigger url_takma_ad_aile
  after update of slug on public.product_families
  for each row
  when (old.slug is distinct from new.slug)
  execute function public.tg_url_takma_ad_yaz();

drop trigger if exists url_takma_ad_kategori on public.categories;
create trigger url_takma_ad_kategori
  after update of slug, metadata on public.categories
  for each row
  when (old.slug is distinct from new.slug or (old.metadata -> 'slug') is distinct from (new.metadata -> 'slug'))
  execute function public.tg_url_takma_ad_yaz();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) KISITLAR — önce NOT VALID (kısa kilit), sonra VALIDATE (satır okuyan, yazmayı bloklamayan kilit)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_sku_adres_ayirici_yok') then
    alter table public.products
      add constraint products_sku_adres_ayirici_yok check (sku !~* '(^p-|-p-)') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_families_slug_adres_ayirici_yok') then
    alter table public.product_families
      add constraint product_families_slug_adres_ayirici_yok check (slug !~* '-p-') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'categories_slug_adres_ayirici_yok') then
    alter table public.categories
      add constraint categories_slug_adres_ayirici_yok
      check (slug !~* '-p-' and coalesce(metadata -> 'slug' ->> 'tr', '') !~* '-p-'
             and coalesce(metadata -> 'slug' ->> 'en', '') !~* '-p-') not valid;
  end if;
end
$$;

alter table public.products validate constraint products_sku_adres_ayirici_yok;
alter table public.product_families validate constraint product_families_slug_adres_ayirici_yok;
alter table public.categories validate constraint categories_slug_adres_ayirici_yok;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) TOHUM — bugüne dek GERÇEKTEN değişmiş ürün slug'ları (admin_audit_log)
-- ─────────────────────────────────────────────────────────────────────────────
-- Denetim izinden türetilir, elle yazılmaz: sayı ölçümle değişirse dosya bayatlamaz. Eski slug bugün
-- başka bir ürünün CANLI slug'ıysa tohumlanmaz (canlı slug önceliği).
insert into public.url_takma_adlari (tenant_id, tur, dil, eski_slug, hedef_id, sebep)
select distinct on (p.tenant_id, lower(a.before ->> 'slug'))
       p.tenant_id, 'urun', '*', lower(a.before ->> 'slug'), p.id,
       'tohum: admin_audit_log ' || a.id::text || ' (' || to_char(a.at at time zone 'utc', 'YYYY-MM-DD') || ')'
  from public.admin_audit_log a
  join public.products p on p.id::text = a.row_pk
 where a.table_name = 'products'
   and a.action = 'UPDATE'
   and a.before ? 'slug' and a.after ? 'slug'
   and nullif(a.before ->> 'slug', '') is not null
   and (a.before ->> 'slug') is distinct from (a.after ->> 'slug')
   and lower(a.before ->> 'slug') is distinct from lower(p.slug)
   and not exists (select 1 from public.products o
                    where o.tenant_id = p.tenant_id and lower(o.slug) = lower(a.before ->> 'slug'))
 order by p.tenant_id, lower(a.before ->> 'slug'), a.at desc
on conflict (tenant_id, tur, dil, eski_slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) GUARD — davranış ölçer; boş veritabanında (gölge tabanı) NOTICE ile atlar, sessizce değil
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_beklenen integer;
  v_tohum    integer;
  v_tetik    integer;
begin
  -- Yetki: anon okur ama yazamaz; tetik fonksiyonu RPC olarak çağrılamaz.
  if not has_table_privilege('anon', 'public.url_takma_adlari', 'SELECT') then
    raise exception 'GUARD: anon url_takma_adlari okuyamiyor (cozucu sayfa katmani anon istemciyle okur)';
  end if;
  if has_table_privilege('anon', 'public.url_takma_adlari', 'INSERT')
     or has_table_privilege('anon', 'public.url_takma_adlari', 'UPDATE')
     or has_table_privilege('anon', 'public.url_takma_adlari', 'DELETE')
     or has_table_privilege('authenticated', 'public.url_takma_adlari', 'INSERT') then
    raise exception 'GUARD: url_takma_adlari anon/authenticated yazmaya ACIK (pg_default_acl sizintisi)';
  end if;
  if has_function_privilege('anon', 'public.tg_url_takma_ad_yaz()', 'EXECUTE') then
    raise exception 'GUARD: tg_url_takma_ad_yaz anon tarafindan cagrilabiliyor';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.url_takma_adlari'::regclass) then
    raise exception 'GUARD: url_takma_adlari RLS kapali';
  end if;

  select count(*) into v_tetik
    from pg_trigger
   where tgname in ('url_takma_ad_urun', 'url_takma_ad_aile', 'url_takma_ad_kategori') and not tgisinternal;
  if v_tetik <> 3 then
    raise exception 'GUARD: 3 tetik bekleniyordu, % bulundu', v_tetik;
  end if;

  -- Tohum: denetim izindeki farklı eski ürün slug'ı sayısı = yazılan tohum sayısı.
  select count(distinct (p.tenant_id, lower(a.before ->> 'slug'))) into v_beklenen
    from public.admin_audit_log a
    join public.products p on p.id::text = a.row_pk
   where a.table_name = 'products' and a.action = 'UPDATE'
     and a.before ? 'slug' and a.after ? 'slug'
     and nullif(a.before ->> 'slug', '') is not null
     and (a.before ->> 'slug') is distinct from (a.after ->> 'slug')
     and lower(a.before ->> 'slug') is distinct from lower(p.slug)
     and not exists (select 1 from public.products o
                      where o.tenant_id = p.tenant_id and lower(o.slug) = lower(a.before ->> 'slug'));
  select count(*) into v_tohum from public.url_takma_adlari where sebep like 'tohum:%';

  if v_beklenen = 0 then
    raise notice 'GUARD: denetim izinde urun slug degisikligi YOK (bos veritabani / golge tabani) — tohum adimi atlandi';
  elsif v_tohum <> v_beklenen then
    raise exception 'GUARD: tohum % satir, beklenen % (denetim izinden)', v_tohum, v_beklenen;
  else
    raise notice 'GUARD: tohum % satir yazildi (denetim izinden, beklenen %)', v_tohum, v_beklenen;
  end if;

  -- Hiçbir takma ad bugün canlı bir slug'ı gölgelemiyor.
  if exists (select 1 from public.url_takma_adlari t
               join public.products p on p.tenant_id = t.tenant_id and lower(p.slug) = t.eski_slug
              where t.tur = 'urun') then
    raise exception 'GUARD: bir urun takma adi canli bir urun slug''ina esit';
  end if;
end
$$;

COMMIT;
