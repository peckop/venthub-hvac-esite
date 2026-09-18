-- URUN / REC-206 (karar 48 kalem a) — STORM SERISI: GUC ARALIGI KATALOGLA UYUSMUYOR
--
-- NE DUZELTILIYOR (tek alan, tek aile):
--   product_families.slug = 'storm-serisi' · description.bloklar_tr.Motor
--   ESKI: "... 0,06 kW ile 0,37 kW arasında güç ..."
--   YENI: "... 0,06 kW ile 7,5 kW arasında güç ..."
--
-- NICIN — KAYNAK KANITI (kaynak dizininden okundu, PDF ACILMADI):
--   `ticaret/avensair-fiyat-listesi-2026/01-input/avens_fiyat_listesi_2026_HQ.pdf` **s.42**,
--   STORM SERISI tablosu, on uc satir. Olculen guc kademeleri:
--     STORM 10 XRM 0,06 · STORM 10 → 0,06 ve 0,09 · STORM 12 → 0,25 ve 0,37
--     STORM 14 → 1,1 · STORM 16 → 2,2 · **STORM 18 → 7,5** kW
--   Yani mevcut metin serinin UST YARISINI (14/16/18) kesiyordu; musteri STORM 18'in
--   gucunu vitrinde 0,37 kW olarak okuyordu. Devir (1400 / 2800) ve gerilim (220 V / 380 V)
--   iddialari ayni sayfada DOGRULANDI, onlara dokunulmuyor.
--
-- BULGU NEREDEN GELDI: karar 45 (vitrin metninde ic editor notu temizligi) sirasinda kaynak
--   dogrulamasi yapilirken bulundu. 45'in deseni NOT ariyordu, bu ise OLGUSAL icerik hatasi —
--   deseni gormez. Bu yuzden 45 kapsamina alinmadi, ayri liste olarak REC-206'ya yazildi
--   (yorum 61320c6c) ve ayri karar olarak soruldu. Cetvel: docs/standards/vitrin-metni-standard.md
--
-- KAPSAM SINIRI — OLCULDU, VARSAYILMADI: ayni guc iddiasi baska yerde tekrarlanmiyor.
--   Taranan yuzeyler: aile bloklar_tr (tum anahtarlar) · aile maddeler_tr (3 madde) ·
--   description.tr · bu ailenin urunlerinin products.description_i18n.tr. Eslesme: **1**
--   (yalnizca bloklar_tr.Motor). Yani tek noktali onarim yeterli, "bir yerde duzelttim
--   otekini gormedim" riski olculerek kapatildi.
--
-- ⚠KARAR 48 kalem (b) BU MIGRATION'DA YOK: danfoss-fc51'in model adi sorunu (kaynakta iki
--   satir ayni adi tasiyor) ayni blokta duruyor ve o blok ZATEN yapisal onarim bekliyor
--   (Koruma anahtari Kontrol icerigi tasiyor, ayri liste kalemi i). Ayni metne iki kez
--   dokunmamak icin (b) o yapisal onarimla birlikte gelir.
--
-- GERI ALMA: `update product_families set description = jsonb_set(description,
--   '{bloklar_tr,Motor}', to_jsonb('<eski metin>'::text)) where slug='storm-serisi';`
--   Denetim izi tetigi (denetim_izi_product_families) oncesini ve sonrasini admin_audit_log'a
--   kendiliginden yazar — elle insert YAPILMAZ (45'te de boyleydi).
--   arama_aile_kuyrukla yalniz name/name_i18n degisince kosar → bu guncelleme arama kuyruguna
--   is dusurmez (45'te olculdu).

set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

-- ADIM 1 — kapilar + yazma. Tek transaction: bir kapi kirmizi yanarsa hicbir sey yazilmaz.
do $$
declare
  c_slug      constant text := 'storm-serisi';
  c_alan      constant text := 'Motor';
  c_eski      constant text := 'Monofaze 220 V ve trifaze 380 V seçenekleri; 0,06 kW ile 0,37 kW arasında güç ve 1400, 2800 d/dk devir alternatifleri.';
  c_yeni      constant text := 'Monofaze 220 V ve trifaze 380 V seçenekleri; 0,06 kW ile 7,5 kW arasında güç ve 1400, 2800 d/dk devir alternatifleri.';
  -- ⭐MASKE MD5 (yontem karar 45'te tasarlandi): dokunulan yol `#-` ile cikarildiktan SONRA
  -- kalan jsonb'nin md5'i. Deger onarim oncesi ve SONRASI ayni kalir → hem "dokunmadigim
  -- kisim canlida olculenden farkli" halini yakalar, hem migration'i idempotent birakir.
  c_maske_md5 constant text := '0a843ca074f0de313152cd8f422d6e48';
  v_sayi   int;
  v_id     uuid;
  v_desc   jsonb;
  v_mevcut text;
begin
  -- KAPI 1 — aile TEK satir (kural 12 / coklu kiraci). Ayni slug iki kiracida varsa
  -- hangi satiri yazdigimizi bilemeyiz; o halde YAZMA yapilmaz.
  select count(*) into v_sayi from public.product_families where slug = c_slug;
  if v_sayi <> 1 then
    raise exception 'K48: % ailesi % satir dondurdu (beklenen 1) — YAZILMADI', c_slug, v_sayi;
  end if;

  select id, description into v_id, v_desc
    from public.product_families where slug = c_slug;

  v_mevcut := v_desc->'bloklar_tr'->>c_alan;

  -- KAPI 2 — alan var mi
  if v_mevcut is null then
    raise exception 'K48: % ailesinde bloklar_tr.% anahtari YOK — YAZILMADI', c_slug, c_alan;
  end if;

  -- IDEMPOTENS — zaten hedef degerdeyse sessizce gec (ikinci kosum yesil yanar)
  if v_mevcut = c_yeni then
    raise notice 'K48: %/% zaten hedef degerde — atlandi', c_slug, c_alan;
    return;
  end if;

  -- KAPI 3 — eski deger canlida olculenle BIREBIR ayni mi (arada elle degisiklik oldu mu)
  if v_mevcut <> c_eski then
    raise exception 'K48: %/% canlida olculenden FARKLI (uzunluk %, md5 %) — arada elle degismis olabilir, YAZILMADI',
      c_slug, c_alan, length(v_mevcut), md5(v_mevcut);
  end if;

  -- KAPI 4 — maske md5: DOKUNULMAYAN kisim beklenenle birebir mi
  if md5((v_desc #- array['bloklar_tr', c_alan])::text) <> c_maske_md5 then
    raise exception 'K48: % ailesinin DOKUNULMAYAN kismi canlida olculenden farkli (maske md5 % <> %) — YAZILMADI',
      c_slug, md5((v_desc #- array['bloklar_tr', c_alan])::text), c_maske_md5;
  end if;

  update public.product_families
     set description = jsonb_set(description, array['bloklar_tr', c_alan], to_jsonb(c_yeni))
   where id = v_id;

  raise notice 'K48: %/% guncellendi (0,37 kW → 7,5 kW)', c_slug, c_alan;
end $$;

-- ADIM 2 — GUARD. Uc ayri iddia, ucu de yazmadan SONRA olculur.
do $$
declare
  c_slug constant text := 'storm-serisi';
  v_motor text;
  v_kacak int;
  v_bos   int;
begin
  select description->'bloklar_tr'->>'Motor' into v_motor
    from public.product_families where slug = c_slug;

  -- 3a — hedef deger yerinde mi
  if v_motor is null or v_motor not like '%0,06 kW ile 7,5 kW arasında güç%' then
    raise exception 'K48 GUARD 3a: %/Motor hedef ifadeyi tasimiyor', c_slug;
  end if;

  -- 3b — eski (yanlis) aralik ailenin HICBIR metin yuzeyinde kalmadi mi.
  -- Bilincli olarak yalniz bu ailede olculuyor: desen baska ailelerde mesru olabilir.
  select count(*) into v_kacak from (
    select v from public.product_families f, jsonb_each_text(f.description->'bloklar_tr') as e(k,v)
     where f.slug = c_slug and v like '%0,37 kW arasında%'
    union all
    select t from public.product_families f,
                 jsonb_array_elements_text(coalesce(f.description->'maddeler_tr','[]'::jsonb)) as t
     where f.slug = c_slug and t like '%0,37 kW arasında%'
    union all
    select f.description->>'tr' from public.product_families f
     where f.slug = c_slug and f.description->>'tr' like '%0,37 kW arasında%'
  ) s;
  if v_kacak <> 0 then
    raise exception 'K48 GUARD 3b: eski guc araligi ifadesi % yerde KALDI', v_kacak;
  end if;

  -- 3c — bilgi kaybi olmadi mi: bos blok anahtari uretilmedi
  select count(*) into v_bos
    from public.product_families f, jsonb_each_text(f.description->'bloklar_tr') as e(k,v)
   where f.slug = c_slug and coalesce(btrim(v), '') = '';
  if v_bos <> 0 then
    raise exception 'K48 GUARD 3c: % ailesinde BOS blok anahtari olustu (%)', c_slug, v_bos;
  end if;

  raise notice 'K48 GUARD: 3a/3b/3c YESIL';
end $$;

commit;
