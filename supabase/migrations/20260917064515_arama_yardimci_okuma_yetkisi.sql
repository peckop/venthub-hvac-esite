-- REC-340 — ACİL ONARIM: canlı arama ziyaretçide TAMAMEN BOŞ dönüyor
--
-- NE OLDU (2026-09-17 ~06:34Z sonrası, Recep canlıda gördü): 20260916132052 migration'ı sekiz
-- yardımcı arama fonksiyonundan `EXECUTE` yetkisini anon/authenticated'dan geri aldı. Ama iki dış
-- uç (`fts_search_products`, `get_search_suggestions`) SECURITY INVOKER — yani ÇAĞIRANIN
-- yetkisiyle koşuyor ve yardımcıları da çağıranın yetkisiyle çağırıyor. Sonuç, anon ile ölçüldü:
--   fts_search_products     → 42501 permission denied for function arama_eslesen_urunler
--   get_search_suggestions  → 42501 permission denied for function arama_normalize
--
-- NİÇİN GÖRÜNMEDİ: migration guard'ı ve merge sonrası canlı ölçüm `postgres` rolüyle koştu.
-- Yönetici her fonksiyonu çağırabilir; kusur yalnız ZİYARETÇİ rolünde var. Ölçüm doğru sayıyı
-- verdi ama YANLIŞ KİŞİ olarak ölçtü. Bu dosyanın guard'ı aramayı `anon` rolüne geçerek ölçer.
--
-- NİÇİN BU ÇÖZÜM (SECURITY DEFINER değil): dış uçları DEFINER yapmak RLS'i atlatır ve tenant
-- kapsamını (kural 12) fonksiyonun içine taşır — daha büyük bir değişiklik. Yardımcıların
-- sekizi de SALT OKUMA'dır (IMMUTABLE/STABLE, yazma yok) ve ziyaretçinin ZATEN okuyabildiği
-- `product_search_index` ile `brands` dışında bir şey okumaz. Onlara EXECUTE vermek yeni veri
-- AÇMAZ. Dünkü güvenlik dersi (arama_indeksi_tazele) YAZAN/kaynak tüketen bir fonksiyon
-- içindi; o kapalı kalır. Veri yazan tetik fonksiyonu `tg_arama_metin_doldur` da KAPALI kalır.
--
-- CETVEL: docs/standards/arama-standard.md K13.4 — madde 9 bu olayla eklenir: "yetki daraltması
-- dış ucu ZİYARETÇİ rolüyle çağırarak doğrulanır".

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

grant execute on function public.arama_normalize(text)          to anon, authenticated;
grant execute on function public.arama_kelimeler(text)          to anon, authenticated;
grant execute on function public.arama_marka_kelimeleri()       to anon, authenticated;
grant execute on function public.arama_marka_es(text)           to anon, authenticated;
grant execute on function public.arama_kesin_ifade(text)        to anon, authenticated;
grant execute on function public.arama_bulanik_ifade(text)      to anon, authenticated;
grant execute on function public.arama_dogrula(text,text)       to anon, authenticated;
grant execute on function public.arama_eslesen_urunler(text)    to anon, authenticated;

-- GUARD — aramayı ZİYARETÇİ olarak çağırır. `set local role` yalnız bu işlem için geçerlidir.
do $$
declare
  v_urun int; v_jet int; v_oneri int; v_vortis int; v_sku int;
begin
  select count(*) into v_urun from public.product_search_index;
  if v_urun = 0 then
    raise notice 'ARAMA YETKİ GUARD ATLANDI — product_search_index BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  -- Veri yazan fonksiyonlar ziyaretçiye KAPALI kalmalı.
  if has_function_privilege('anon', 'public.tg_arama_metin_doldur()', 'execute')
     or has_function_privilege('anon', 'public.arama_indeksi_tazele(uuid[])', 'execute')
     or has_function_privilege('anon', 'public.arama_kuyrugu_bosalt(integer)', 'execute') then
    raise exception 'ARAMA YETKİ GUARD: yazan bir arama fonksiyonu anon''a AÇIK.';
  end if;

  set local role anon;
  select count(*) into v_jet    from public.fts_search_products('jet fan', 500);
  select count(*) into v_oneri  from public.get_search_suggestions('jet fan', 6);
  select count(*) into v_vortis from public.fts_search_products('vortis', 500);
  select count(*) into v_sku    from public.fts_search_products('VRT-17160', 500);
  reset role;

  if v_jet = 0 or v_oneri = 0 or v_vortis = 0 or v_sku <> 1 then
    raise exception 'ARAMA YETKİ GUARD (anon): jet fan=% · öneri=% · vortis=% · SKU=% — ziyaretçi araması bozuk.',
      v_jet, v_oneri, v_vortis, v_sku;
  end if;

  raise notice 'ARAMA YETKİ GUARD GEÇTİ (anon rolüyle) — jet fan=% · öneri=% · vortis=% · SKU=%',
    v_jet, v_oneri, v_vortis, v_sku;
end $$;

commit;
