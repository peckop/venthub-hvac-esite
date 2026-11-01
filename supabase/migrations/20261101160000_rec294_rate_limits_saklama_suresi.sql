-- REC-294 — public.rate_limits: ham IP anahtarları SÜRESİZ saklanıyordu (KVKK veri minimizasyonu).
-- Cetvel: CLAUDE.md kural 11/13/14 · docs/standards/migration-safety-standard.md · docs/standards/db-grant-hygiene-standard.md
--
-- ÖLÇÜLEN DURUM (canlı, yalnız SELECT, 11 Ekim; kart notu): 17 satır, 14'ü IPv4 biçimli anahtar (iyzico, kupon,
--   misafir teklif), 12 satır 30 günden eski, en eskisi 389 gün; cron.job'da rate_limits'e dokunan iş YOK.
--   Tabloya yalnız service_role erişir (istemci okuyamaz): bu bir SIZINTI değil, SAKLAMA borcudur.
--   Sayaç mantığı (bump_rate_limit) yalnız en çok 3600 sn'lik pencereye bakar (çağıranlar: misafir teklif 3600/600,
--   iyzico ve kupon varsayılan 60, teklif bildirimi 3600). Pencereden eski kovalar HİÇ okunmaz: silmek davranışı değiştirmez.
--
-- NE YAPAR:
--   1) public.rate_limits_temizle(p_saklama interval default '1 day'): bucket'ı saklama süresinden eski satırları siler,
--      silinen satır sayısını döndürür. Alt sınır 2 saat (en uzun pencere 1 saat): daha kısa süre canlı sayacı bozardı.
--      Yalnız service_role çalıştırır (anon/authenticated/public EXECUTE yok).
--   2) pg_cron: her gün 03:17 (UTC) rate_limits_temizle() koşar (iş adı 'rate-limits-temizle').
--   3) İlk temizlik bu migration içinde koşar; sonra kendini sınar (1 günden eski satır kalmamalı).
--
-- NE YAPMAZ (adıyla):
--   - Anahtardaki IP'yi karma (hash) haline ÇEVİRMEZ. Ham IP en çok 1 gün (kovanın yazıldığı andan itibaren) tutulur;
--     anahtarın karmalanması Edge fonksiyonlarını değiştirir (4 çağıran) ve ayrı iştir. Bu migration "süresiz"i
--     "en çok 1 gün"e indirir; tamamen kaldırmaz.
--   - Başka tabloya dokunmaz.
--
-- GERİ ALMA: scripts/db/rollback/20261101160000_rec294_rate_limits_saklama_suresi_geri_al.sql
--   (cron işini kaldırır, fonksiyonu düşürür; SİLİNEN SATIRLAR GERİ GELMEZ, sayaç verisi olduğundan zarar değildir).

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.rate_limits_temizle(p_saklama interval default interval '1 day')
returns bigint
language plpgsql
set search_path to 'pg_catalog', 'public'
as $function$
declare
  v_silinen bigint;
begin
  -- Güvenlik freni: en uzun sayaç penceresi 1 saat; 2 saatten kısa saklama canlı sayacı bozar.
  if p_saklama is null or p_saklama < interval '2 hours' then
    raise exception 'rate_limits_temizle: saklama süresi en az 2 saat olmalı (verilen: %)', p_saklama;
  end if;

  delete from public.rate_limits where bucket < now() - p_saklama;
  get diagnostics v_silinen = row_count;
  return v_silinen;
end;
$function$;

-- Yetki AÇIKÇA: yalnız service_role (varsayılan PUBLIC EXECUTE kaldırılır).
revoke all on function public.rate_limits_temizle(interval) from public;
revoke all on function public.rate_limits_temizle(interval) from anon, authenticated;
grant execute on function public.rate_limits_temizle(interval) to service_role;

-- pg_cron: günlük temizlik
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('rate-limits-temizle')
      where exists (select 1 from cron.job where jobname = 'rate-limits-temizle');
    perform cron.schedule(
      'rate-limits-temizle',
      '17 3 * * *',
      $inner$ select public.rate_limits_temizle() $inner$
    );
  else
    raise warning '[REC-294] pg_cron YOK — rate_limits otomatik temizlenmeyecek. Elle: select public.rate_limits_temizle();';
  end if;
end;
$cron$;

-- İlk temizlik + kendini sınama (Guard E): 1 günden eski satır kalmamalı; anon/authenticated çalıştıramamalı.
do $guard$
declare
  v_silinen bigint;
  v_kalan   bigint;
begin
  v_silinen := public.rate_limits_temizle();
  select count(*) into v_kalan from public.rate_limits where bucket < now() - interval '1 day';
  if v_kalan <> 0 then
    raise exception 'DURDU: temizlikten sonra 1 günden eski % satır kaldı', v_kalan;
  end if;

  if has_function_privilege('anon', 'public.rate_limits_temizle(interval)', 'execute')
     or has_function_privilege('authenticated', 'public.rate_limits_temizle(interval)', 'execute') then
    raise exception 'DURDU: rate_limits_temizle anon/authenticated tarafından çalıştırılabiliyor';
  end if;
  if not has_function_privilege('service_role', 'public.rate_limits_temizle(interval)', 'execute') then
    raise exception 'DURDU: service_role rate_limits_temizle çalıştıramıyor';
  end if;

  -- Alt sınır freni gerçekten çalışıyor mu
  begin
    perform public.rate_limits_temizle(interval '1 minute');
    raise exception 'DURDU: 1 dakikalık saklama reddedilmedi';
  exception when raise_exception then
    if sqlerrm like 'DURDU:%' then raise; end if;
  end;

  raise notice '[REC-294] ilk temizlik: % satır silindi', v_silinen;
end
$guard$;

commit;
