-- =============================================================================
-- REC-54 Kalem 2 (E5 Kompozör) — Faz 1: ADMIN YAZMA YOLU
-- Şerit: AUTH · Cetvel: docs/standards/quote-standard.md §3.1/§4/§6/§8/§8.5
--        + docs/standards/erp-workspace-design-standard.md §3/E5
-- Karar: Recep, 2026-08-28 (AskUserQuestion) — Bacak A = GRANT, Bacak B = SECURITY DEFINER RPC.
--
-- NİÇİN VAR — ölçüldü, varsayılmadı (2026-08-28, prod'da salt-okuma):
--   E5'in yazma yolu İKİ BACAKTAN DA ERİŞİLEMEZDİ. RLS politikaları doğru yazılmış ve
--   canlıydı; eksik olan KOLON GRANT'iydi. İki katman da 42501 verdiği için ayırt eden
--   tek şey hata mesajıdır ve kimse bakmamıştı: tabloda 0 satır vardı, yol hiç denenmedi.
--
--   BACAK A — admin taslak teklif AÇAMIYORDU.
--     quotes_insert_admin_draft politikası status='draft' şart koşuyor, ama
--     has_column_privilege('authenticated','venthub_quotes','status','INSERT') = FALSE
--     ve kolon varsayılanı 'requested'. Admin status yazamıyor; yazmayınca satır
--     'requested' oluyor ve admin politikasının with check'i düşüyor.
--
--   BACAK B — admin teklif YAYIMLAYAMIYORDU.
--     Yayım kapısı tetiği başlıktaki valid_until + currency dolu olsun istiyor; ikisinin de
--     UPDATE yetkisi FALSE. status yetkisi VAR ama tek başına yazınca tetik reddediyor.
--
-- NİÇİN BİRİ GRANT, ÖTEKİ RPC — ölçüt: EN AZ YETKİ + ATOMİKLİK İHTİYACI.
--   Bacak A'da GRANT yeter ÇÜNKÜ politika statüyü zaten sabitliyor: müşterinin 'draft'
--   denemesi quotes_insert_own_requested'a (status='requested' şartı) da,
--   quotes_insert_admin_draft'a (is_admin_user şartı) da uymaz. GRANT, RLS'i YÜRÜRLÜKTE
--   BIRAKIR — bu yüzden tercih edilir.
--   Bacak B'de GRANT YETMEZ ve TEHLİKELİDİR: valid_until/currency yazma yetkisi açılsaydı,
--   müşteri kendi kabul UPDATE'inin İÇİNDE valid_until'i geleceğe çekip §6'nın ikinci
--   kapısını (lazy expiry) düşürebilir, ya da para birimini değiştirip tutarın anlamını
--   kaydırabilirdi; with check eski değeri göremediği için bunu yakalayamaz. Ayrıca yayım
--   ATOMİK olmak zorunda: üç alan tek ifadede yazılmalı, çünkü yayım kapısı satırın SON
--   hâline bakar — iki ayrı UPDATE ile ikincisi reddedilir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) BACAK A — admin taslak teklif açabilsin (tek satır, RLS yürürlükte kalır)
-- -----------------------------------------------------------------------------
grant insert (status) on public.venthub_quotes to authenticated;

-- -----------------------------------------------------------------------------
-- 2) BAŞLIKTA PARA BİRİMİ KISITI — kapının kendi kör noktası kapatılıyor
--
-- Ölçüldü: venthub_quotes.currency üzerinde HİÇBİR check kısıtı yoktu (kalem tablosunda
-- vardı, başlıkta yoktu). Ve currency character(3) olduğu için BOŞ değer üç boşluğa
-- dönüşür: ''::char(3) IS NULL = FALSE. Yani "para birimsiz teklif yayımlanamaz" kuralı
-- boş bir para birimini GEÇİRİYORDU. Kısıt burada, DB'de duruyor — beyaz listeyi
-- fonksiyon gövdesine koymak yalnız TEK giriş noktasını korurdu.
-- Tablo 0 satır olduğu için geriye dönük düzeltme gerekmiyor.
-- -----------------------------------------------------------------------------
alter table public.venthub_quotes
  add constraint venthub_quotes_currency_check
  check (currency is null or currency ~ '^[A-Z]{3}$');

-- -----------------------------------------------------------------------------
-- 3) BACAK B — yayım yolu (SECURITY DEFINER)
--
-- ⚠ Bu fonksiyon yayım kapısını ATLAMAZ, TEKRAR ETMEZ, GEVŞETMEZ. Kapı tetikte durur ve
--   bu UPDATE de ondan geçer; fonksiyon yalnız ERİŞİMİ açar. (Tetiğin adı burada bilerek
--   yazılmıyor: INV-QUOTE-1'in dosya seçimi ada bakıyordu ve bu dosya adı anarsa kapı
--   yanlış dosyayı otorite sanardı. Seçim onarıldı, yine de gereksiz yere anmıyoruz.)
--
-- ⚠ TENANT KONTROLÜ RLS'İN DENGİ DEĞİLDİR. jwt_tenant_id() claim bulunamadığında ya da
--   herhangi bir hatada sabit bir UUID'ye düşüyor ve o UUID bu tablonun tenant_id
--   DEFAULT'uyla AYNI — yani kaçış varsayılanı boş bir kum havuzu değil. Bu, bu fonksiyonun
--   yarattığı bir kusur DEĞİL (aynı fonksiyonu kullanan her politikayı etkiliyor) ve
--   AZALTICI ÖNLEM OLARAK SAYILMIYOR. Ayrı iş emri: REC-74.
-- -----------------------------------------------------------------------------
create or replace function public.admin_publish_quote(
  p_quote_id uuid,
  p_valid_until timestamptz,
  p_currency text                       -- text, char(3) DEĞİL: imzada char(3) olsaydı
                                        -- ileride text'e geçiş CREATE OR REPLACE ile
                                        -- değil İKİNCİ BİR OVERLOAD ile sonuçlanır ve
                                        -- PostgREST çağrısı belirsizleşirdi.
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant   uuid := public.jwt_tenant_id();
  v_currency text := upper(trim(coalesce(p_currency, '')));
  v_before   jsonb;
begin
  if not public.is_admin_user() then
    raise exception 'yetkisiz: teklif yayimlama admin gerektirir'
      using errcode = '42501';
  end if;

  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'gecersiz para birimi: % (uc harfli ISO kodu bekleniyor)', p_currency
      using errcode = 'P0001';
  end if;

  -- Cetvel §6 NOT NULL diyor; "gelecekte olsun" ondan DAHA SIKI bir kuraldır ve bilerek
  -- eklendi: gecmise tarihli bir yayim, dogdugu anda suresi gecmis bir belge uretir.
  -- Bu kural cetvele de yazildi (§6), yalniz burada yasamiyor.
  if p_valid_until is null or p_valid_until <= now() then
    raise exception 'gecersiz gecerlilik tarihi: gelecekte bir zaman olmali'
      using errcode = 'P0001';
  end if;

  -- Tenant süzgeci OKUMADA da uygulanır: DEFINER RLS'i atladığı için bu satır olmasaydı
  -- fonksiyon başka kiracının belgesini görür ve yazardı.
  select to_jsonb(q) into v_before
  from public.venthub_quotes q
  where q.id = p_quote_id and q.tenant_id = v_tenant;

  if v_before is null then
    raise exception 'teklif bulunamadi ya da baska bir kiraciya ait'
      using errcode = 'P0001';
  end if;

  if v_before ->> 'status' is distinct from 'draft' then
    raise exception 'yayim yalniz taslak tekliften yapilir (mevcut durum: %)',
      v_before ->> 'status'
      using errcode = 'P0001';
  end if;

  -- ÜÇÜ TEK İFADEDE: yayım kapısı satırın SON hâline bakar.
  update public.venthub_quotes
     set status      = 'quoted',
         valid_until = p_valid_until,
         currency    = v_currency
   where id = p_quote_id and tenant_id = v_tenant;

  -- DENETİM GÖVDEDE, İSTEMCİDE DEĞİL (CLAUDE.md #11).
  -- İstemcideki mutateWithAudit'in log çağrısı try/catch içinde yutuluyor ve ayrı bir
  -- transaction'da koşuyor. RLS'i atlayan bir yolun izi yutulabilir olamaz; burada iz
  -- yazma ile AYNI transaction'dadır ve düşerse yayım da düşer.
  insert into public.admin_audit_log
    (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(),
    'venthub_quotes',
    p_quote_id::text,
    'UPDATE',
    jsonb_build_object(
      'status',      v_before ->> 'status',
      'valid_until', v_before ->> 'valid_until',
      'currency',    v_before ->> 'currency'
    ),
    jsonb_build_object(
      'status',      'quoted',
      'valid_until', p_valid_until,
      'currency',    v_currency
    ),
    'admin_publish_quote',
    v_tenant
  );
end;
$$;

-- Yürütme yetkisi: public'ten alınır, yalnız oturum açmış kullanıcıya verilir.
-- (Yetki kararı gövdedeki is_admin_user() ile verilir; GRANT yalnız çağırabilmeyi açar.)
revoke all on function public.admin_publish_quote(uuid, timestamptz, text) from public;
grant execute on function public.admin_publish_quote(uuid, timestamptz, text) to authenticated;

comment on function public.admin_publish_quote(uuid, timestamptz, text) is
  'REC-54/E5 Faz 1: taslak teklifi yayimlar (draft -> quoted). Uc alani TEK ifadede yazar '
  'cunku yayim kapisi satirin son haline bakar. Yetki gövdede, denetim ayni transaction''da.';
