-- ═════════════════════════════════════════════════════════════════════════════
-- TEKLİF MODÜLÜ v2 — şema + geçiş tetiği + RLS (T131-VH · AUTH)
--
-- KAYNAK/CETVEL:
--   docs/standards/quote-standard.md — YÖNETİR (§2.5 muhatap kimliği, §3.1/§3.2
--     alan setleri, §3.3 RLS, §4 durum makinesi, §6 süre, §7.2 değer kapısı,
--     §15 bekçi sözleşmesi, §16 migration planı).
--   docs/standards/migration-safety-standard.md — YÖNETİR (INV-MIGRATION-1 işlem sınırı).
--   CLAUDE.md #12 (tenant kapsamı) · #13 (merge = prod'a otomatik apply).
--
-- ⚠ MERGE = PROD. Bu dosya master'a merge edildiği an prod DB'ye uygulanır.
--   Merge kararı YALNIZ Recep'e aittir (CLAUDE.md #13).
--
-- SAPMALAR — cetvelden bilerek ayrılan üç yer, gerekçesiyle (PR gövdesinde de yazılı):
--   S1. §16/6 EXPIRY CRON BU DOSYADA YOK. Cron kurulduğu an periyodik prod YAZIMI
--       başlar; bu, şema değişikliğinden farklı bir risk sınıfıdır ve ayrı bir
--       onayı hak eder. OPS kararı 2026-08-26: ayrı kalem, ayrı Recep onayı.
--   S2. §3.1 `currency` hücresi "NOT NULL" diyor; burada NULLABLE bırakıldı ve
--       şart §15/R10'un dediği yere — `draft → quoted` geçişine, tetiğe — kondu.
--       Niçin: kolon düzeyinde NOT NULL, DEFAULT vermeyi zorunlu kılardı ve
--       DEFAULT bir TÜRETMEdir — INV-CURRENCY-1'in yasakladığı şeyin ta kendisi.
--       DEFAULT'suz NOT NULL ise canlı RFQ yazma yolunu (quoteService.ts) kırardı.
--   S3. §7.2'nin beş şartından `accept_ip` ve `accept_declaration_version` NOT NULL
--       şartı bu sürümde POLİTİKAYA YAZILMADI. Niçin: bu iki alanı yazabilecek tek
--       taraf istemcidir; istemciden gelen IP kanıt değil BEYANdır. Şartı koymak
--       kanıt üretmez, istemciyi uydurmaya zorlar (boş hücre uydurma baskısı dersi).
--       Sunucu tarafında damgalayan bir kabul ucu AYRI kalemdir; o gelene kadar
--       eksiğin adı burada ve §15'te yazılı durur — gizlenmiyor.
--
-- ÖLÇÜM DURUMU: §15/R15 ve R17 DAVRANIŞSAL kol ister (user_id doldurulunca AYNI
--   geçiş GEÇMELİ; yalnız ret gözlemi "tetik hiç çalışmıyor" hâlinden ayırt edilemez).
--   O kol Supabase branch ister; olur bu dosya yazılırken hâlâ Recep'te. Bu PR
--   YAPISAL kanıtla sınırlıdır ve bu, kabul edilmiş bir eksiktir — sessiz değil.
-- ═════════════════════════════════════════════════════════════════════════════

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. ÖN KOŞUL KAPISI — "göç riski sıfır" iddiası MERGE ANINDA ölçülür
--    Cetvel §16 bunu şart koşuyor: kısıt eklenmeden önce canlı ihlal sayısı.
--    İddia zamanla bayatlar; bu blok onu bir DENETİME çevirir. Düşerse işlem
--    geri sarılır ve prod DEĞİŞMEZ (fail-closed).
-- ─────────────────────────────────────────────────────────────────────────────
do $onkosul$
declare
  n_quotes bigint;
  n_items bigint;
  n_items_kimliksiz bigint;
begin
  select count(*) into n_quotes from public.venthub_quotes;
  select count(*) into n_items  from public.venthub_quote_items;
  select count(*) into n_items_kimliksiz
    from public.venthub_quote_items where product_id is null;

  if n_quotes > 0 then
    raise exception
      'ON KOSUL DUSTU: venthub_quotes % satir tasiyor. contact_name/email/phone NOT NULL bu satirlarda GERIYE DONUK ihlal uretir (kolonlar bugun yok, yani her mevcut satir ihlalcidir). Cetvel §16: kisit eklenmeden once ihlal sayisi olculur. Once gec-dolum plani yazilmali.', n_quotes;
  end if;

  if n_items_kimliksiz > 0 then
    raise exception
      'ON KOSUL DUSTU: % kalemde product_id NULL; NOT NULLa cekilemez. Cetvel §3.2 pasif-urun karari bu satirlar icin once uygulanmali.', n_items_kimliksiz;
  end if;

  raise notice 'on kosul dogrulandi — quotes=% items=% (gocs riski sifir)', n_quotes, n_items;
end;
$onkosul$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. DURUM KÜMESİ (§4) — beşten dokuza
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.venthub_quotes
  drop constraint if exists venthub_quotes_status_check;

alter table public.venthub_quotes
  add constraint venthub_quotes_status_check
  check (status in (
    'draft', 'requested', 'quoted', 'accepted',
    'rejected', 'expired', 'cancelled', 'superseded', 'converted'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MUHATAP KİMLİĞİ (§2.5) — SIRA TERSİNE ÇEVRİLEMEZ: önce gevşetme, sonra kilit
--    Tersi yapılırsa hesapsız belge hiç oluşamaz (cetvel §16 notu).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.venthub_quotes
  alter column user_id drop not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. BAŞLIK ALANLARI (§3.1)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.venthub_quotes
  -- Belge kimliği ve revizyon zinciri (§5)
  add column if not exists quote_no                   text,
  add column if not exists revision_no                integer not null default 1,
  add column if not exists amended_from               uuid references public.venthub_quotes(id),
  add column if not exists root_quote_id              uuid references public.venthub_quotes(id),
  add column if not exists superseded_by              uuid references public.venthub_quotes(id),
  -- Süre / para / tutar (§6, INV-CURRENCY-1) — currency için S2 sapmasına bak
  add column if not exists valid_until                timestamptz,
  add column if not exists currency                   char(3),
  add column if not exists total_amount               numeric(12, 2),
  -- Kimlik üçlüsü (§2.5) — NOT NULL adım 4'te, kolonlar doldurulabilir olduktan sonra
  add column if not exists contact_name               text,
  add column if not exists contact_email              text,
  add column if not exists contact_phone              text,
  -- Satış Projesi bağı (§2)
  add column if not exists sales_project_id           uuid,
  add column if not exists party_role                 text,
  -- İletim damgası (§12)
  add column if not exists sent_at                    timestamptz,
  -- Kabul kanıt seti (§7.1)
  add column if not exists accepted_at                timestamptz,
  add column if not exists accept_channel             text,
  add column if not exists accept_ip                  inet,
  add column if not exists accept_declaration_version text,
  add column if not exists accept_evidence_ref        text,
  add column if not exists accept_recorded_by         uuid references auth.users(id),
  add column if not exists accepted_revision_no       integer,
  -- Eşik üstü satıcı teyidi (§7.3)
  add column if not exists accept_confirmed_at        timestamptz,
  add column if not exists accept_confirmed_by        uuid references auth.users(id),
  -- Satıcı iptali
  add column if not exists cancelled_at               timestamptz,
  add column if not exists cancel_reason              text,
  -- Köprü (§10) — dönüşüm BİR KEZdir, garanti şema kısıtından gelir
  add column if not exists converted_order_id         uuid references public.venthub_orders(id);

-- Kanal kümesi §7.1'in üç kanalıdır; serbest metin değil.
alter table public.venthub_quotes
  drop constraint if exists venthub_quotes_accept_channel_check;
alter table public.venthub_quotes
  add constraint venthub_quotes_accept_channel_check
  check (accept_channel is null or accept_channel in ('site', 'email', 'phone'));

-- Belge numarası TENANT KAPSAMINDA tekildir. Cetvel §3.1 yalnız "benzersiz" diyor;
-- global tekillik çok-kiracılı kurulumda iki tenant'ın numaralarını çakıştırır ve
-- bir tenant'ın numara alanını diğerine sızdırır (CLAUDE.md #12). Daraltma değil,
-- tenant'a bağlama.
create unique index if not exists uq_venthub_quotes_tenant_quote_no
  on public.venthub_quotes (tenant_id, quote_no)
  where quote_no is not null;

-- §10: bir sipariş yalnız BİR teklifin dönüşümü olabilir. NULL'lar tekillik saymaz,
-- yani dönüşmemiş teklifler serbesttir.
create unique index if not exists uq_venthub_quotes_converted_order
  on public.venthub_quotes (converted_order_id)
  where converted_order_id is not null;

create index if not exists idx_venthub_quotes_root      on public.venthub_quotes (root_quote_id);
create index if not exists idx_venthub_quotes_valid_until on public.venthub_quotes (valid_until);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. KİMLİK KİLİDİ (§2.5 / §15 R16) — kimliksiz teklif OLMAZ
--    Adım 2'nin (user_id gevşetmesi) ARDINDAN gelir; sıra bilinçlidir.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.venthub_quotes alter column contact_name  set not null;
alter table public.venthub_quotes alter column contact_email set not null;
alter table public.venthub_quotes alter column contact_phone set not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. KALEM ALANLARI (§3.2)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.venthub_quote_items
  add column if not exists line_no       integer,
  add column if not exists discount_rate numeric(5, 2),
  add column if not exists tax_rate      numeric(5, 2),
  add column if not exists line_total    numeric(12, 2),
  add column if not exists group_label   text;

-- §3.2: katalog-dışı kalem artık PASİF ÜRÜN kaydıdır (products.status='draft'),
-- serbest metin değil. Yani her kalemin gerçek bir ürün kimliği vardır.
alter table public.venthub_quote_items alter column product_id set not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. GEÇİŞ TETİĞİ (§4) — SSOT'un (quoteStatusMachine.ts) BİREBİR AYNASI
--
--    ⚠ SÖZDİZİMİ SÖZLEŞMESİ — bu blok serbest yazılamaz. INV-QUOTE-1 R2/R3
--    geçişleri TEK bir regex ile ayrıştırıyor ve regex'in `i` bayrağı YOKTUR:
--        old.status = '<kaynak>' and new.status in ('<hedef>', ...)
--    Bundan çıkanlar: (a) küçük harf zorunlu; (b) `'<kaynak>'` ile `and` arasına
--    BAŞKA ŞART giremez — bu yüzden muhatap kilidi ve değer kapıları AYRI `if`
--    bloklarındadır; (c) IN listesinde iç parantez olamaz; (d) terminaller bir RED
--    cümlesi olarak yazılamaz, fonksiyon İZİN-HARİTASI biçimindedir; (e) bekçi
--    tetiği içeren SON dosyayı okur, o yüzden harita burada TAM yazılır, delta değil.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.enforce_quote_status_transition()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  izinli boolean := false;
begin
  -- GİRİŞ KİLİDİ (§4 "GİRİŞLER") — belge yalnız iki kapıdan doğar.
  -- #828'in dersi: kapı yalnız UPDATE'e yazılırsa INSERT yolu kapısız kalır ve
  -- RLS'i atlayan bir bağlam (service_role, betik) belgeyi istediği durumda var eder.
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'requested') then
      raise exception 'giris kilidi: teklif yalnizca draft ya da requested olarak acilabilir (denenen: %)', new.status
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  if old.status = new.status then
    return new;
  end if;

  -- İZİNLİ GEÇİŞLER — SSOT aynası (yukarıdaki sözdizimi sözleşmesine tabi)
  if old.status = 'requested' and new.status in ('draft', 'rejected') then
    izinli := true;
  end if;
  if old.status = 'draft' and new.status in ('quoted', 'cancelled') then
    izinli := true;
  end if;
  if old.status = 'quoted' and new.status in ('accepted', 'rejected', 'expired', 'superseded', 'cancelled') then
    izinli := true;
  end if;
  if old.status = 'accepted' and new.status in ('converted') then
    izinli := true;
  end if;

  if not izinli then
    raise exception 'gecersiz teklif durum gecisi: % -> %', old.status, new.status
      using errcode = 'P0001';
  end if;

  -- ⭐ MUHATAP KİLİDİ (§2.5 / §15 R15) — haritanın ÜSTÜNDE ikinci şart.
  -- Hesapsız belge hazırlanır, iletilir, iptal edilir; ama ONAY yönüne yürüyemez.
  -- Ekranda kabul düğmesini gizlemek ÜÇÜNCÜ kapıdır ve tek başına sayılmaz.
  if new.status in ('accepted', 'converted') and new.user_id is null then
    raise exception 'muhatap kilidi: hesapsiz teklif % durumuna gecemez (cetvel §2.5)', new.status
      using errcode = 'P0001';
  end if;

  -- YAYIM KAPISI (§6, §15 R10) — süresiz ya da para birimsiz belge yayımlanamaz.
  -- currency'nin kolon düzeyinde NOT NULL olmamasının karşılığı budur (S2 sapması).
  if new.status = 'quoted' and (new.valid_until is null or new.currency is null) then
    raise exception 'yayim kapisi: draft -> quoted icin valid_until ve currency zorunlu (cetvel §6/R10)'
      using errcode = 'P0001';
  end if;

  -- DÖNÜŞÜM KAPISI (§10) — köprü V1.1'dir ve bu sürümde YOK. Sipariş üretmeyen bir
  -- 'converted' damgası belgeyi yalancı yapar ve converted_order_id UNIQUE bunu
  -- ENGELLEMEZ (NULL'lar tekillik saymaz). Kapı köprü inene kadar fiilen kapalıdır.
  if new.status = 'converted' and new.converted_order_id is null then
    raise exception 'donusum kapisi: converted_order_id olmadan converted yazilamaz (cetvel §10)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Tetik artık INSERT'i de görür (giriş kilidi) — #828 sınıfının tekrarını engeller.
drop trigger if exists trg_enforce_quote_status_transition on public.venthub_quotes;
create trigger trg_enforce_quote_status_transition
  before insert or update on public.venthub_quotes
  for each row execute function public.enforce_quote_status_transition();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RLS (§3.3, §7.2, §15 R8/R9/R12/R17)
--
--    R17 (hesapsız belge müşteri yüzünde görünmez) EK BİR POLİTİKA İSTEMEZ:
--    sahiplik yüklemi `user_id = auth.uid()` NULL ile eşleşmez, yani prospect
--    belge zaten yalnız satıcı yüzünde yaşar. Yeni bir şart eklemek yerine bunu
--    yazıya geçiriyoruz ki sonradan "eksik" sanılıp gevşetilmesin.
--
--    §2/3 Satış Projesi izolasyonu da bir YASAKtır, bir politika değil: müşteri
--    SELECT yolu `sales_project_id` üzerinden GENİŞLETİLMEZ. Aşağıdaki select
--    politikası bilinçli olarak yalnız sahiplik+admin taşır.
-- ─────────────────────────────────────────────────────────────────────────────

-- Ç1 (§3.3) — admin INSERT yolu. R8: admin yalnız 'draft' ile açar; 'quoted' bir
-- belgeyi doğrudan var edemez (giriş durumu kilidinin RLS yarısı; DB yarısı tetikte).
drop policy if exists quotes_insert_admin_draft on public.venthub_quotes;
create policy quotes_insert_admin_draft
  on public.venthub_quotes for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and (select public.is_admin_user())
    and status = 'draft'
  );

-- Ç2 (§3.3) — admin kalem INSERT yolu. Müşterinin kalem ekleme politikası
-- ('requested' teklife, v1) korunur; bu onun yanına gelir, yerine değil.
drop policy if exists quote_items_insert_admin on public.venthub_quote_items;
create policy quote_items_insert_admin
  on public.venthub_quote_items for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and (select public.is_admin_user())
    and exists (
      select 1 from public.venthub_quotes q
      where q.id = quote_id
        and q.tenant_id = public.jwt_tenant_id()
        and q.status = 'draft'
    )
  );

-- §7.2 DEĞER KAPISI — mevcut politika GERİ ALINMAZ, sertleştirilir.
-- Şartlar yalnız KABUL yönüne bağlanır: ret yolu kanıt seti istemez, aksi hâlde
-- müşteri teklifi reddedemez hâle gelirdi (kapıyı sıkarken kapıyı kilitleme tuzağı).
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
    and (
      status = 'rejected'
      or (
        status = 'accepted'
        and superseded_by is null
        and valid_until >= now()
        and accept_channel = 'site'
        and accept_recorded_by is null
        and accepted_revision_no = revision_no
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. KOLON-DÜZEYİ YETKİ — admin/müşteri ayrımının BAŞLIKTAKİ tek mekanizması
--
--    ⚠ Bunu genişletirken dikkat: admin de 'authenticated'tır, yani kolon grant'i
--    admin'e ve müşteriye AYNI ANDA verilir. Başlıkta müşterinin bir UPDATE
--    politikası olduğu için (kabul/ret), fiyat/süre kolonlarını grant'lemek
--    müşteriye kendi teklifinin tutarını değiştirerek kabul etme yolu açardı —
--    ve `with check` bunu YAKALAYAMAZ (eski değere referans veremez). O yüzden
--    başlıkta müşteriye yalnız KABUL KANIT SETİ açılır, tutar/süre AÇILMAZ.
-- ─────────────────────────────────────────────────────────────────────────────
grant insert (contact_name, contact_email, contact_phone)
  on public.venthub_quotes to authenticated;

-- Kabul akışının yazdığı alanlar. accept_ip ve accept_declaration_version bilerek
-- DIŞARIDA (S3): istemciden gelen IP kanıt değil beyandır; sunucu damgalı kabul
-- ucu ayrı kalemdir.
grant update (status, accepted_at, accept_channel, accepted_revision_no)
  on public.venthub_quotes to authenticated;

grant insert (line_no, group_label)
  on public.venthub_quote_items to authenticated;
grant update (line_no, discount_rate, tax_rate, line_total, group_label)
  on public.venthub_quote_items to authenticated;

commit;
