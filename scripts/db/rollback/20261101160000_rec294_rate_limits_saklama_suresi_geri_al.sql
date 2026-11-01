-- REC-294 GERİ ALMA — rate_limits günlük temizliği kaldırılır.
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- Ne zaman: temizlik işi sayaç davranışını bozuyorsa (beklenmez: en uzun pencere 1 saat, saklama 1 gün).
-- Etki: ham IP anahtarları yeniden SÜRESİZ birikir (KVKK borcu geri gelir). Silinen satırlar geri GELMEZ
-- (hız-limiti sayacı verisidir, kayıp zarar değildir).

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('rate-limits-temizle')
      where exists (select 1 from cron.job where jobname = 'rate-limits-temizle');
  end if;
end;
$cron$;

drop function if exists public.rate_limits_temizle(interval);

commit;
