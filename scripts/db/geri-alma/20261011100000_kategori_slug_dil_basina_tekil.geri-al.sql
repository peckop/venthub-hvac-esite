-- URN-85 geri alma — 20261011100000_kategori_slug_dil_basina_tekil.sql (iki tekil ifade indeksi düşer). ELLE, tek işlem.
-- Veri kaybı yok: indeksler yalnız kural koyar, veri taşımaz. Geri aldıktan sonra aynı dilde aynı slug'ı ikinci kategoriye
-- yazmak yeniden mümkün olur (çözücü uyarı basıp id sırasıyla birini seçer; öbür kategori adresinden ulaşılamaz).
-- DROP INDEX (CONCURRENTLY'siz) kısa süreli ACCESS EXCLUSIVE alır; tablo 35 satır, lock_timeout 5 sn.
-- Uygulama sonrası şema tabanı yeniden üretilir (INV-TABAN-TAZE-1): `sema-tabani-uret.yml`.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

drop index if exists public.categories_tr_slug_tenant_uq;
drop index if exists public.categories_en_slug_tenant_uq;

do $geri_al$
declare
  v_kalan integer;
begin
  select count(*) into v_kalan
    from pg_indexes
   where schemaname = 'public' and tablename = 'categories'
     and indexname in ('categories_tr_slug_tenant_uq', 'categories_en_slug_tenant_uq');
  if v_kalan <> 0 then
    raise exception 'URN-85 geri alma: % indeks hala duruyor; islem geri alinir', v_kalan;
  end if;
end
$geri_al$;

commit;
