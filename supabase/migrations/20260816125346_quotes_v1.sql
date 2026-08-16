-- Teklif/RFQ modülü v1 — T067-VH (cetvel: docs/standards/quote-standard.md)
--
-- "Teklif Alın" bugüne kadar tamamen görseldi: quoteMode hesaplanıyor, etiket
-- basılıyor ama tıklanabilir akış/tablo/kuyruk YOKTU (2026-08-16 ölçümü, grep boş).
-- Bu migration ticari nesneyi kurar: müşteri talebi → admin fiyatlaması → kabul/ret.
--
-- MİMARİ KARAR (Recep, 2026-08-16 — registry T067-VH): PROJE ≠ TEKLİF.
--   Proje  = yaşayan çalışma listesi (user_projects/project_items, DOKUNULMAZ).
--   Teklif = talep anındaki DONDURULMUŞ snapshot (sipariş-kalemi ilkesi:
--            fiyatlanan liste, müşteri projeyi değiştirince kaymaz).
--
-- Referans nullability (LEGAL dersi, merge öncesi şemadan doğrulanacak):
--   auth.users(id) · public.tenants(id) · public.user_projects(id) ·
--   public.products(id) — hepsi mevcut tablo PK'ları; bu migration mevcut
--   hiçbir kolona/tabloya yazmaz, yalnız YENİ tablo kurar.

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. venthub_quotes — teklif başlığı
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists public.venthub_quotes (
  id                 uuid primary key default gen_random_uuid(),

  -- Teklif LOGIN'lidir (v1'de misafir yok — cetvel Q4).
  user_id            uuid not null references auth.users(id) on delete cascade,

  -- Talebin giriş kapısı. v1: pdp | cart; 'project' v1.1 köprüsü için ŞİMDİDEN
  -- geçerli değer (köprü geldiğinde check değişmesin — enum daraltmak migration,
  -- genişletmek de migration; üçünü baştan tanımlamak iki migration tasarrufu).
  source             text not null check (source in ('pdp', 'cart', 'project')),

  -- Yalnız izlenebilirlik: proje silinse teklif YAŞAR (cetvel Q1).
  source_project_id  uuid references public.user_projects(id) on delete set null,

  -- Durum makinesi SSOT: src/lib/quotes/quoteStatusMachine.ts (cetvel Q2).
  -- Geçişleri aşağıdaki enforce_quote_status_transition tetiği zorlar.
  status             text not null default 'requested'
                       check (status in ('requested', 'quoted', 'accepted', 'rejected', 'expired')),

  tenant_id          uuid not null default 'd3b07384-d113-495f-a558-8c38634e0000'::uuid
                       references public.tenants(id) on delete cascade,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_venthub_quotes_user    on public.venthub_quotes (user_id);
create index if not exists idx_venthub_quotes_status  on public.venthub_quotes (status);
create index if not exists idx_venthub_quotes_created on public.venthub_quotes (created_at);

comment on table public.venthub_quotes is
  'Teklif (RFQ) başlığı — T067-VH. Durum makinesi: requested->quoted->accepted/rejected/expired; '
  'terminaller soğurucu. SSOT: src/lib/quotes/quoteStatusMachine.ts + docs/standards/quote-standard.md.';

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. venthub_quote_items — kalemler (SNAPSHOT)
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists public.venthub_quote_items (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references public.venthub_quotes(id) on delete cascade,

  -- Ürün bağı + snapshot birlikte: ürün silinse/adı değişse teklif BELGESİ bozulmaz
  -- (sipariş-kalemi ilkesi). product_id bu yüzden SET NULL, name NOT NULL snapshot.
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  qty           integer not null check (qty > 0),
  note          text,

  -- Fiyat alanlarını YALNIZ admin doldurur (cetvel Q3/R5). Müşteri INSERT'inin bu
  -- kolonlara ulaşamaması aşağıda KOLON-DÜZEYİ grant ile DB'de zorlanır.
  unit_price    numeric(12,2) check (unit_price is null or unit_price >= 0),
  currency      text check (currency is null or char_length(currency) = 3),
  valid_until   timestamptz,

  tenant_id     uuid not null default 'd3b07384-d113-495f-a558-8c38634e0000'::uuid
                  references public.tenants(id) on delete cascade,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_venthub_quote_items_quote on public.venthub_quote_items (quote_id);

comment on table public.venthub_quote_items is
  'Teklif kalemi — talep anındaki SNAPSHOT (product_name/qty içerik kopyası; project_items '
  'satır IDleri kopyalanmaz). unit_price/currency/valid_until yalnız admin yazar (kolon grant).';

-- updated_at tetikleri — ev fonksiyonu public.set_updated_at yeniden kullanılır
-- (202508271900_venthub_returns.sql'de tanımlı).
drop trigger if exists trg_venthub_quotes_updated_at on public.venthub_quotes;
create trigger trg_venthub_quotes_updated_at
  before update on public.venthub_quotes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_venthub_quote_items_updated_at on public.venthub_quote_items;
create trigger trg_venthub_quote_items_updated_at
  before update on public.venthub_quote_items
  for each row execute function public.set_updated_at();

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. Durum makinesi tetiği — UI bypass edilse bile izinsiz geçiş DB'de patlar
-- ═════════════════════════════════════════════════════════════════════════════
-- Geçiş haritası SSOT'un (quoteStatusMachine.ts QUOTE_TRANSITIONS) birebir aynasıdır;
-- INV-QUOTE-1 R2 iki dosyayı karşılaştırır. Terminallerden (accepted/rejected/expired)
-- çıkış YOKTUR (R3) — iade makinesinin geri-yürüme dersi.

create or replace function public.enforce_quote_status_transition()
returns trigger
language plpgsql
as $$
begin
  if old.status = new.status then
    return new;
  end if;

  -- İZİNLİ GEÇİŞLER (SSOT aynası — satır düzeni bekçi tarafından ayrıştırılır):
  if old.status = 'requested' and new.status in ('quoted', 'rejected') then
    return new;
  end if;
  if old.status = 'quoted' and new.status in ('accepted', 'rejected', 'expired') then
    return new;
  end if;

  raise exception 'invalid quote status transition: % -> %', old.status, new.status
    using errcode = 'P0001';
end;
$$;

drop trigger if exists trg_enforce_quote_status_transition on public.venthub_quotes;
create trigger trg_enforce_quote_status_transition
  before update of status on public.venthub_quotes
  for each row execute function public.enforce_quote_status_transition();

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. RLS — sahiplik + tenant İLK GÜNDEN (cetvel Q3; T057 regresyon dersi:
--    sahiplik şartı optimizasyon adına düşürülmez)
-- ═════════════════════════════════════════════════════════════════════════════

alter table public.venthub_quotes enable row level security;
alter table public.venthub_quote_items enable row level security;

revoke all on table public.venthub_quotes from anon;
revoke all on table public.venthub_quote_items from anon;

-- --- venthub_quotes ---

drop policy if exists quotes_select_own_or_admin on public.venthub_quotes;
create policy quotes_select_own_or_admin
  on public.venthub_quotes for select to authenticated
  using (
    tenant_id = public.jwt_tenant_id()
    and (user_id = (select auth.uid()) or (select public.is_admin_user()))
  );

-- Müşteri yalnız KENDİ adına ve yalnız 'requested' ile açar.
drop policy if exists quotes_insert_own_requested on public.venthub_quotes;
create policy quotes_insert_own_requested
  on public.venthub_quotes for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and user_id = (select auth.uid())
    and status = 'requested'
  );

-- Müşteri kararı: yalnız 'quoted' durumdaki KENDİ teklifinde ve yalnız
-- kabul/ret hedefine. (Hangi kolona dokunabileceği ayrıca kolon grant'iyle dar.)
drop policy if exists quotes_update_customer_decision on public.venthub_quotes;
create policy quotes_update_customer_decision
  on public.venthub_quotes for update to authenticated
  using (
    tenant_id = public.jwt_tenant_id()
    and user_id = (select auth.uid())
    and status = 'quoted'
  )
  with check (
    tenant_id = public.jwt_tenant_id()
    and user_id = (select auth.uid())
    and status in ('accepted', 'rejected')
  );

-- Admin geçişleri (requested->quoted/rejected, quoted->expired ...): geçiş
-- meşruluğunu tetik zorlar, politika yalnız KİMİN dokunabildiğini söyler.
drop policy if exists quotes_update_admin on public.venthub_quotes;
create policy quotes_update_admin
  on public.venthub_quotes for update to authenticated
  using (tenant_id = public.jwt_tenant_id() and (select public.is_admin_user()))
  with check (tenant_id = public.jwt_tenant_id() and (select public.is_admin_user()));

-- DELETE politikası bilinçli olarak YOK: teklif ticari kayıttır, silinmez.

-- --- venthub_quote_items — sahiplik quote üzerinden türer ---

drop policy if exists quote_items_select_own_or_admin on public.venthub_quote_items;
create policy quote_items_select_own_or_admin
  on public.venthub_quote_items for select to authenticated
  using (
    tenant_id = public.jwt_tenant_id()
    and exists (
      select 1 from public.venthub_quotes q
      where q.id = quote_id
        and (q.user_id = (select auth.uid()) or (select public.is_admin_user()))
    )
  );

-- Kalem ekleme yalnız 'requested' durumdaki KENDİ teklifine (fiyatlanmış listeye
-- sonradan kalem sokulamaz — snapshot ilkesinin devamı, cetvel Q3).
drop policy if exists quote_items_insert_own_requested on public.venthub_quote_items;
create policy quote_items_insert_own_requested
  on public.venthub_quote_items for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and exists (
      select 1 from public.venthub_quotes q
      where q.id = quote_id
        and q.user_id = (select auth.uid())
        and q.status = 'requested'
    )
  );

-- Kalem güncelleme YALNIZ admin (fiyatlama). Müşterinin item-UPDATE politikası YOK.
drop policy if exists quote_items_update_admin on public.venthub_quote_items;
create policy quote_items_update_admin
  on public.venthub_quote_items for update to authenticated
  using (tenant_id = public.jwt_tenant_id() and (select public.is_admin_user()))
  with check (tenant_id = public.jwt_tenant_id() and (select public.is_admin_user()));

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. KOLON-DÜZEYİ yetki — "fiyatı yalnız admin yazar" kuralının DB yarısı
-- ═════════════════════════════════════════════════════════════════════════════
-- RLS satır seçer, kolon SEÇEMEZ. Müşteri INSERT'inin unit_price/currency/valid_until
-- taşıyamaması için insert yetkisi kolon listesiyle verilir. Admin de 'authenticated'
-- olduğundan admin fiyat yazımı UPDATE yolundan gider (update grant'i fiyat
-- kolonlarını içerir; o yolun satır kapısı yukarıdaki admin-only politikadır).

revoke insert, update on table public.venthub_quotes from authenticated;
grant insert (user_id, source, source_project_id, tenant_id)
  on public.venthub_quotes to authenticated;
grant update (status)
  on public.venthub_quotes to authenticated;

revoke insert, update on table public.venthub_quote_items from authenticated;
grant insert (quote_id, product_id, product_name, qty, note, tenant_id)
  on public.venthub_quote_items to authenticated;
grant update (unit_price, currency, valid_until)
  on public.venthub_quote_items to authenticated;

-- select grant'leri Supabase varsayılanında mevcut; RLS satır kapısı yukarıda.
