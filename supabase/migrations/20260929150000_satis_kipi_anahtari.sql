-- REC-168 — SATIŞ KİPİ ANAHTARI: tek kaynak, anon'a YALNIZ boolean, koşullu tetikler, panelden yazmayı kilitleyen politikalar
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec168-satis-kipi-db-plani-2026-09-29.md v2; cetvel: docs/standards/satis-kipi-gecis-standard.md)
-- ═════════════════════════════════════════════════════════════════════════════
-- Ödeme yolu artık `site_settings.satis_kipi` satırına bağlı (env DEĞİL: NEXT_PUBLIC_* derlemede gömülür, "tek tuş" olamaz).
-- Kod hazır (`src/lib/kip/satisKipi.ts`, checkout kapısı); eksik olan veritabanı tarafı. Bu migration:
--   1. `satis_kipi_oku()` — SECURITY DEFINER, parametresiz, anon'a YALNIZ `{acik, damga}` döner (tablo anon'a KAPALI kalır).
--      Satır YOKKEN `{acik:false}` → migration canlıda GÖRÜNÜR HİÇBİR DAVRANIŞI DEĞİŞTİRMEZ (vitrin bugünkü gibi KAPALI).
--      `jsonb_typeof = 'boolean'`: dize `"true"` ya da bozuk değer KAPALI sayılır (fail-closed; cast patlamaz).
--   2. Üç tetik (INSERT / UPDATE / DELETE ayrı: `WHEN` içinde OLD/NEW erişimi olaya bağlı) → mevcut jenerik
--      `handle_supabase_webhook()` → webhook `site_settings` dalı → `revalidateTag(SATIS_KIPI_TAG)`.
--      UPDATE tetiği `new.key OR old.key`: anahtar yeniden adlandırılırsa da düşer (satır "kaybolur" → KAPALI).
--   3. İki RESTRICTIVE politika: `authenticated` rolü (moderator dahil) `satis_kipi` satırını YAZAMAZ; yalnız
--      service_role (geçiş betiği, `--uygula --onay`) yazar. Betiğin tutarlılık kapısı (açık + 37 kategoride
--      hide_price) panelden atlanamaz. `general` upsert'i geçer (panel kırılmaz). Mevcut üç politika YENİDEN
--      YAZILMAZ (katman riski yok, INV-RLS-SARMA-1).
--
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR (kural 13). Yalnız Recep onayıyla birleşir. VERİ YAZMAZ: satır eklemez.
-- ANAHTARI AÇMAK bu migration'ın işi DEĞİL (`satis-kipine-gec.mjs --yon ac`: Recep + şirket + İyzico + yasal kapı).
--
-- ÖLÇÜLDÜ, GÖLGEDE (bellek-içi PGlite; kanıt: docs/audits/rec168-satis-kipi-golge-2026-09-29.mjs):
-- RPC anon/authenticated ile çalışır, satır yokken kapalı, bozuk değerde kapalı; RESTRICTIVE politikalar; guard fikstürleri.
-- ÖLÇÜLEMEDİ (PGlite kapsamaz → "Docker gölgesi gerektiren kalan"): tetiğin gerçek `handle_supabase_webhook`
-- (Vault sırrı + pg_net) ile webhook'u atması; auth.uid()/jwt gerçek Supabase davranışı.
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

create or replace function public.satis_kipi_oku()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object(
              'acik',  case when jsonb_typeof(s.value->'acik') = 'boolean' then (s.value->'acik')::boolean else false end,
              'damga', s.updated_at)
       from public.site_settings s
      where s.key = 'satis_kipi'
      limit 1),
    jsonb_build_object('acik', false, 'damga', null));
$$;

-- anon-DEFINER sınıfı (url_takma_ad_coz emsali): önce HERKESTEN geri al, sonra hedefli ver.
revoke all on function public.satis_kipi_oku() from public, anon, authenticated;
grant execute on function public.satis_kipi_oku() to anon, authenticated, service_role;

-- Üç tetik; handle_supabase_webhook jenerik (TG_TABLE_NAME). Emsal: on_product_prices_ins_del/upd.
create trigger on_site_settings_satis_kipi_ins
  after insert on public.site_settings
  for each row when (new.key = 'satis_kipi')
  execute function public.handle_supabase_webhook();

create trigger on_site_settings_satis_kipi_upd
  after update on public.site_settings
  for each row when (new.key = 'satis_kipi' or old.key = 'satis_kipi')
  execute function public.handle_supabase_webhook();

create trigger on_site_settings_satis_kipi_del
  after delete on public.site_settings
  for each row when (old.key = 'satis_kipi')
  execute function public.handle_supabase_webhook();

-- Panelden yazma kilidi: yalnız service_role (betik) `satis_kipi` yazar. RESTRICTIVE = mevcut permissive politikalarla
-- AND'lenir; `authenticated` için `key <> 'satis_kipi'` şartı ekler. DELETE politikası zaten yok (RLS varsayılanı reddeder).
create policy site_settings_satis_kipi_yalniz_servis_ins on public.site_settings
  as restrictive for insert to authenticated
  with check (key <> 'satis_kipi');

create policy site_settings_satis_kipi_yalniz_servis_upd on public.site_settings
  as restrictive for update to authenticated
  using (key <> 'satis_kipi')
  with check (key <> 'satis_kipi');

-- GUARD: inen şey beklenen şeyle birebir mi (yalnız ad değil; tanım, etkinlik, yetki).
do $$
begin
  if not exists (
    select 1 from pg_proc p
     where p.proname = 'satis_kipi_oku'
       and p.pronamespace = 'public'::regnamespace
       and p.prosecdef
       and has_function_privilege('anon', p.oid, 'execute')
  ) then
    raise exception 'REC-168 guard: satis_kipi_oku() yok / DEFINER değil / anon EXECUTE yok';
  end if;

  if (select count(*) from pg_trigger
       where tgrelid = 'public.site_settings'::regclass
         and tgname like 'on_site_settings_satis_kipi_%'
         and tgenabled = 'O'
         and not tgisinternal) <> 3 then
    raise exception 'REC-168 guard: 3 satis_kipi tetiği (ins/upd/del) etkin değil';
  end if;

  if (select count(*) from pg_policies
       where schemaname = 'public'
         and tablename = 'site_settings'
         and policyname like 'site_settings_satis_kipi_yalniz_servis_%'
         and permissive = 'RESTRICTIVE') <> 2 then
    raise exception 'REC-168 guard: 2 RESTRICTIVE politika yok';
  end if;
end $$;

commit;

-- GERİ ALMA (elle, Recep onayıyla; migration'lar ileri yönlüdür):
--   drop policy site_settings_satis_kipi_yalniz_servis_ins on public.site_settings;
--   drop policy site_settings_satis_kipi_yalniz_servis_upd on public.site_settings;
--   drop trigger on_site_settings_satis_kipi_ins on public.site_settings;
--   drop trigger on_site_settings_satis_kipi_upd on public.site_settings;
--   drop trigger on_site_settings_satis_kipi_del on public.site_settings;
--   drop function public.satis_kipi_oku();
-- Kod tarafı fonksiyon yokken de güvenlidir: 404 → KAPALI (satisKipi.ts, hata önbelleğe yazılmaz).
