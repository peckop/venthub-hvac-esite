-- SATIS (REC-384) — teklif yayımı: belge numarası + sent_at + toplam + müşteri bildirimi SUNUCU TARAFINDA
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (karar 104 canlı koşumu, 2026-09-24, run 35998494186)
-- ═════════════════════════════════════════════════════════════════════════════
-- Teklif 89024b5f ekrandan yayımlandı ama: (1) müşteri e-postası GİTMEDİ — bildirim tarayıcıdan,
-- yayım döndükten SONRA ateşleniyordu; oturum kapanınca istek yolda kesildi (kenar günlüğünde yalnız
-- OPTIONS). Hesapsız (misafir) müşteriye bu yol HİÇ gitmiyordu (yalnız user_id'li hesabın e-postası).
-- (2) sent_at yazılmadı (quote-standard §12: yayım yazar). (3) quote_no boş (§3.1, document-numbering §2).
-- Ayrıca fiyat/para birimi tutarlılığı yalnız istemcide denetleniyordu; e-posta artık fiyatı müşteriye
-- taşıyacağı için bu kapı SUNUCUYA iner.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TASARIM (plan-challenger iki tur KOŞULLU → koşullar işlendi; plan REC-384)
-- ═════════════════════════════════════════════════════════════════════════════
-- H1 numara YAYIMDA atanır (requested'ta değil): talep aşamasında atama, oturumlu kullanıcının doğrudan
--    INSERT izniyle günlük sayacı tüketip o günün tüm taleplerini düşürürdü (generate_order_number dersi).
-- H2 sayaç anahtarı (tenant_id, gun) — cetvel örneğinden (gun) gerekçeli sapma, cetvele yazıldı.
-- H3 numara yalnız KÖK belgeye (amended_from IS NULL); revizyon kök numarayı gösterir.
-- H4 sent_at = yayım anı; e-postanın gerçekten gittiği ayrı damga published_email_sent_at (Edge yazar).
-- Yan etkiler BEFORE/AFTER tetiklerinde → draft→quoted'a giden HER yol (RPC, service_role, gelecekteki
-- revizyon RPC'si) aynı numara/damga/bildirimi üretir. Tetik adı trg_stamp_… : aynı olayda tetikler ADA
-- göre koşar → trg_enforce_quote_status_transition ÖNCE (geçiş kapısı), sonra damga, sonra updated_at.
-- Bildirim pg_net ile transaction İÇİNDE kuyruklanır: yayım düşerse istek de düşer (09-24 yerel ölçüm).
-- ⛔ Bildirim AYRI Vault bayrağına bağlı (quote_published_webhook_enabled = 'on'): bugünkü webhook `event`
--    okumuyor; bayraksız inse yayım isteği "talep alındı" sanılıp YANLIŞ e-posta + sahte iç bildirim
--    üretirdi. Bayrağı ALTYAPI, Edge'in yayım dalı canlıda ölçüldükten sonra Recep'in cümlesiyle koyar.
--
-- GERİ ALMA (elle): drop trigger trg_stamp_quote_published / trg_notify_quote_published on venthub_quotes;
--   drop trigger trg_quote_items_durum_kilidi on venthub_quote_items; admin_publish_quote'un
--   2026-09-24 baseline gövdesi; drop function _quote_published_enqueue / admin_resend_quote_published /
--   stamp_quote_published / notify_quote_published / quote_items_durum_kilidi. Sayaç tablosu SİLİNMEZ
--   (verilmiş numaralar boşluksuzluk kanıtıdır).

set lock_timeout = '5s';
set statement_timeout = '30s';

BEGIN;

-- ─── 1. Sayaç (document-numbering §2 kemerleri: RLS açık + politika yok + REVOKE; yalnız DEFINER yazar)
create table if not exists public.quote_number_counters (
  tenant_id uuid    not null,
  gun       date    not null,
  son_no    integer not null default 0 check (son_no >= 0),
  primary key (tenant_id, gun)
);
comment on table public.quote_number_counters is
  'REC-384: teklif numarasinin kiraci+gun sira sayaci. Yalniz stamp_quote_published (tetik, DEFINER) yazar.';
alter table public.quote_number_counters enable row level security;
revoke all on public.quote_number_counters from public, anon, authenticated;

-- ─── 2. Kolonlar
alter table public.venthub_quotes add column if not exists published_email_sent_at timestamptz;
comment on column public.venthub_quotes.published_email_sent_at is
  'REC-384: yayim e-postasinin GERCEKTEN gonderildigi an (Edge yazar). sent_at = yayim ani (cetvel §12).';

alter table public.quote_email_events add column if not exists event text not null default 'request_created';
-- KISITLAR — url_takma_adlari (20260923083021) emsali: ekleme NOT VALID + idempotent blokta, doğrulama ayrı.
-- Dürüst not: aynı işlem içinde olduğu için kilit kazancı SAĞLAMAZ; tablo canlıda 0 satır (2026-09-25
-- salt okuma ölçümü), tarama anlıktır. REC-385: webhook bulgu 7 kaydını 'mismatch' ile yazıyordu,
-- eski CHECK reddediyordu → iz hiç yazılmıyordu.
do $$
begin
  alter table public.quote_email_events drop constraint if exists quote_email_events_event_check;
  alter table public.quote_email_events add constraint quote_email_events_event_check
    check (event = any (array['request_created', 'quote_published'])) not valid;
  alter table public.quote_email_events drop constraint if exists quote_email_events_status_check;
  alter table public.quote_email_events add constraint quote_email_events_status_check
    check (status = any (array['sent', 'failed', 'mismatch'])) not valid;
end
$$;
alter table public.quote_email_events validate constraint quote_email_events_event_check;
alter table public.quote_email_events validate constraint quote_email_events_status_check;

-- ─── 3. BEFORE damga tetiği: sunucu fiyat kapısı + toplam + sent_at + numara
create or replace function public.stamp_quote_published()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_kalem     int;
  v_fiyatsiz  int;
  v_pb_farkli int;
  v_iskonto   int;
  v_toplam    numeric;
  v_gun       date;
  v_sira      integer;
begin
  -- SUNUCU KAPISI (tüm yollar): istemcideki derivePublishHeader'ın DB aynası.
  select count(*),
         count(*) filter (where unit_price is null),
         count(*) filter (where currency is distinct from new.currency),
         count(*) filter (where coalesce(discount_rate, 0) <> 0),
         round(sum(qty * unit_price), 2)
    into v_kalem, v_fiyatsiz, v_pb_farkli, v_iskonto, v_toplam
    from public.venthub_quote_items
   where quote_id = new.id;

  if v_kalem = 0 then
    raise exception 'yayim reddedildi: teklifin kalemi yok' using errcode = 'P0001';
  end if;
  if v_fiyatsiz > 0 then
    raise exception 'yayim reddedildi: % kalemde fiyat yok', v_fiyatsiz using errcode = 'P0001';
  end if;
  if v_pb_farkli > 0 then
    raise exception 'yayim reddedildi: % kalemin para birimi belge para biriminden (%) farkli', v_pb_farkli, new.currency
      using errcode = 'P0001';
  end if;
  -- İskonto alanı ekranda yazılmıyor ve toplam onu hesaba katmıyor: dolu iskontolu belge yanlış toplamla
  -- müşteriye gitmesin, gürültüyle dursun.
  if v_iskonto > 0 then
    raise exception 'yayim reddedildi: iskontolu kalem henuz desteklenmiyor (% kalem)', v_iskonto
      using errcode = 'P0001';
  end if;

  new.total_amount := v_toplam;          -- §3.1: kalemlerden türetilir, snapshot'lanır (KDV hariç)
  new.sent_at      := now();             -- §12: yayım anı

  -- Numara yalnız kök belgeye (H3) ve bir kez. Anahtar new.tenant_id: service_role yolunda JWT yok.
  if new.amended_from is null and new.quote_no is null then
    v_gun := (now() at time zone 'Europe/Istanbul')::date;
    insert into public.quote_number_counters as c (tenant_id, gun, son_no)
         values (new.tenant_id, v_gun, 1)
    on conflict (tenant_id, gun) do update set son_no = c.son_no + 1
      returning c.son_no into v_sira;
    if v_sira > 9999 then
      raise exception 'REC-384: gunluk teklif numarasi tasti (% > 9999, gun %). Bicim genisletilmeli.', v_sira, v_gun
        using errcode = 'check_violation';
    end if;
    new.quote_no := 'TK-' || to_char(v_gun, 'YYYYMMDD') || '-' || lpad(v_sira::text, 4, '0');
  end if;

  return new;
end;
$function$;
alter function public.stamp_quote_published() owner to postgres;
revoke all on function public.stamp_quote_published() from public, anon, authenticated;

drop trigger if exists trg_stamp_quote_published on public.venthub_quotes;
create trigger trg_stamp_quote_published
  before update on public.venthub_quotes
  for each row
  when (old.status = 'draft' and new.status = 'quoted')
  execute function public.stamp_quote_published();

-- ─── 4. Ortak gönderim yardımcısı (tetik + yeniden gönderim AYNI gövde; bayrağı OKUR)
create or replace function public._quote_published_enqueue(p_quote_id uuid, p_zorunlu boolean)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_bayrak text;
  v_url    text;
  v_sir    text;
begin
  select decrypted_secret into v_bayrak from vault.decrypted_secrets
   where name = 'quote_published_webhook_enabled' limit 1;
  if v_bayrak is distinct from 'on' then
    if p_zorunlu then
      raise exception 'yayim e-postasi kapali (quote_published_webhook_enabled != on) — gonderilmedi'
        using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] bayrak kapali — yayim bildirimi ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  select decrypted_secret into v_sir from vault.decrypted_secrets where name = 'quote_webhook_secret' limit 1;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'quote_webhook_url' limit 1;
  if coalesce(v_sir, '') = '' or coalesce(v_url, '') = '' then
    if p_zorunlu then
      raise exception 'Vault kaydi eksik (quote_webhook_secret/url) — gonderilmedi' using errcode = 'P0001';
    end if;
    raise warning '[_quote_published_enqueue] Vault kaydi eksik — bildirim ATLANDI, teklif %', p_quote_id;
    return false;
  end if;

  -- Gövde YALNIZ olay + kimlik: kişisel veri taşımaz, Edge satırı kendisi okur.
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('event', 'quote_published', 'quote_id', p_quote_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_sir,
      'x-timestamp', (extract(epoch from now()) * 1000)::bigint::text
    ),
    timeout_milliseconds := 5000
  );
  return true;
end;
$function$;
alter function public._quote_published_enqueue(uuid, boolean) owner to postgres;
revoke all on function public._quote_published_enqueue(uuid, boolean) from public, anon, authenticated;

-- ─── 5. AFTER bildirim tetiği
create or replace function public.notify_quote_published()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
begin
  perform public._quote_published_enqueue(new.id, false);
  return new;
end;
$function$;
alter function public.notify_quote_published() owner to postgres;
revoke all on function public.notify_quote_published() from public, anon, authenticated;

drop trigger if exists trg_notify_quote_published on public.venthub_quotes;
create trigger trg_notify_quote_published
  after update on public.venthub_quotes
  for each row
  when (old.status = 'draft' and new.status = 'quoted')
  execute function public.notify_quote_published();

-- ─── 6. Kalem kilidi: yayımlanmış belgenin kalemi değişmez (e-posta/toplam ile portal ayrışmasın)
-- Yazıcılar ölçüldü (09-24): müşteri INSERT (requested), misafir Edge INSERT (requested), admin fiyat
-- UPDATE (requested/draft). Hiçbiri yayımdan sonra yazmıyor → kilit mevcut akışı bozmaz.
create or replace function public.quote_items_durum_kilidi()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_durum text;
begin
  select status into v_durum from public.venthub_quotes
   where id = case when tg_op = 'DELETE' then old.quote_id else new.quote_id end;
  -- Başlık yoksa (cascade silmede başlık zaten gitmiştir) kilit uygulanmaz.
  if v_durum is not null and v_durum not in ('requested', 'draft') then
    raise exception 'teklif kalemi degistirilemez: belge % durumunda (yalniz requested/draft)', v_durum
      using errcode = 'P0001';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;
alter function public.quote_items_durum_kilidi() owner to postgres;
revoke all on function public.quote_items_durum_kilidi() from public, anon, authenticated;

drop trigger if exists trg_quote_items_durum_kilidi on public.venthub_quote_items;
create trigger trg_quote_items_durum_kilidi
  before insert or update or delete on public.venthub_quote_items
  for each row
  execute function public.quote_items_durum_kilidi();

-- ─── 7. admin_publish_quote: imza + dönüş AYNI (yetkiler korunur); denetime numara + damga + toplam
create or replace function public.admin_publish_quote(p_quote_id uuid, p_valid_until timestamptz, p_currency text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_tenant   uuid := public.jwt_tenant_id();
  v_currency text := upper(trim(coalesce(p_currency, '')));
  v_before   jsonb;
  v_no       text;
  v_sent     timestamptz;
  v_toplam   numeric;
begin
  if not public.is_admin_user() then
    raise exception 'yetkisiz: teklif yayimlama admin gerektirir'
      using errcode = '42501';
  end if;

  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'gecersiz para birimi: % (uc harfli ISO kodu bekleniyor)', p_currency
      using errcode = 'P0001';
  end if;

  -- Cetvel §6: "gelecekte olsun" NOT NULL'dan daha sıkı ve bilerek eklendi.
  if p_valid_until is null or p_valid_until <= now() then
    raise exception 'gecersiz gecerlilik tarihi: gelecekte bir zaman olmali'
      using errcode = 'P0001';
  end if;

  -- Tenant süzgeci OKUMADA da uygulanır (DEFINER RLS'i atlar).
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

  -- ÜÇÜ TEK İFADEDE: yayım kapısı satırın SON hâline bakar. Numara/damga/toplam BEFORE tetiğinden
  -- (trg_stamp_quote_published) gelir; RETURNING tetiğin yazdığı son hâli okur.
  update public.venthub_quotes
     set status      = 'quoted',
         valid_until = p_valid_until,
         currency    = v_currency
   where id = p_quote_id and tenant_id = v_tenant
  returning quote_no, sent_at, total_amount into v_no, v_sent, v_toplam;

  if not found then
    raise exception 'yayim yazilamadi (satir eslesmedi)' using errcode = 'P0001';
  end if;

  -- DENETİM GÖVDEDE, yazmayla AYNI transaction'da (CLAUDE.md #11).
  insert into public.admin_audit_log
    (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(),
    'venthub_quotes',
    p_quote_id::text,
    'UPDATE',
    jsonb_build_object(
      'status',       v_before ->> 'status',
      'valid_until',  v_before ->> 'valid_until',
      'currency',     v_before ->> 'currency',
      'quote_no',     v_before ->> 'quote_no',
      'sent_at',      v_before ->> 'sent_at',
      'total_amount', v_before ->> 'total_amount'
    ),
    jsonb_build_object(
      'status',       'quoted',
      'valid_until',  p_valid_until,
      'currency',     v_currency,
      'quote_no',     v_no,
      'sent_at',      v_sent,
      'total_amount', v_toplam
    ),
    'admin_publish_quote',
    v_tenant
  );
end;
$function$;

-- ─── 8. Denetimli yeniden gönderim (kaybolan e-postalar + 89024b5f doğrulaması)
create or replace function public.admin_resend_quote_published(p_quote_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_tenant uuid := public.jwt_tenant_id();
  v_durum  text;
  v_gitti  timestamptz;
begin
  if not public.is_admin_user() then
    raise exception 'yetkisiz: yeniden gonderim admin gerektirir' using errcode = '42501';
  end if;

  -- Satır kilidi: eşzamanlı iki çağrı sıraya girer, tavan kontrolü ikisinde de doğru okur.
  select status, published_email_sent_at into v_durum, v_gitti
    from public.venthub_quotes
   where id = p_quote_id and tenant_id = v_tenant
     for update;

  if v_durum is null then
    raise exception 'teklif bulunamadi ya da baska bir kiraciya ait' using errcode = 'P0001';
  end if;
  if v_durum <> 'quoted' then
    raise exception 'yeniden gonderim yalniz yayimlanmis teklife (mevcut durum: %)', v_durum using errcode = 'P0001';
  end if;
  if v_gitti is not null then
    raise exception 'yayim e-postasi zaten gonderildi (%)', v_gitti using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.admin_audit_log
     where row_pk = p_quote_id::text
       and comment = 'admin_resend_quote_published'
       and at > now() - interval '15 minutes'
  ) then
    raise exception 'ayni teklif icin 15 dakika icinde ikinci yeniden gonderim reddedildi' using errcode = 'P0001';
  end if;

  -- Bayrak kapalıysa HATA (admin "gitti" sanmasın).
  perform public._quote_published_enqueue(p_quote_id, true);

  insert into public.admin_audit_log
    (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  values (
    auth.uid(), 'venthub_quotes', p_quote_id::text, 'UPDATE',
    jsonb_build_object('published_email_sent_at', null),
    jsonb_build_object('yeniden_gonderim', 'kuyruga_alindi'),
    'admin_resend_quote_published', v_tenant
  );
end;
$function$;
alter function public.admin_resend_quote_published(uuid) owner to postgres;
revoke all on function public.admin_resend_quote_published(uuid) from public;
revoke execute on function public.admin_resend_quote_published(uuid) from anon;
grant execute on function public.admin_resend_quote_published(uuid) to authenticated;

COMMIT;

-- Doğrulama (merge sonrası, salt okuma):
--   select tgname from pg_trigger where tgrelid='public.venthub_quotes'::regclass and not tgisinternal order by 1;
--   has_function_privilege('anon', 'public.admin_resend_quote_published(uuid)', 'EXECUTE')              → false
--   has_function_privilege('authenticated', 'public._quote_published_enqueue(uuid,boolean)', 'EXECUTE') → false
--   select relrowsecurity from pg_class where relname = 'quote_number_counters'                         → true
