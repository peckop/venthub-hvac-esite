-- REC-206 / karar 42 — Vitrin aile metnindeki İÇ EDİTÖR NOTU temizliği (veri onarımı).
--
-- NİÇİN (canlı ölçüm 2026-09-17):
--   `jet-serisi` ailesinin vitrin açıklamasına (`description.tr`) içerik hattı taslağındaki bir
--   editör notu karışmış ve 2026-09-06'dan beri canlıda: müşteri ekranında, meta description'da ve
--   JSON-LD'de (arama motoru okuyor). Not, taslaktaki "kaynakta iki tutarsızlık" bölümüne atıftı:
--     *(Kaynak başlığı SEAT'inkiyle birebir aynı olduğu için kimlik cümlesi maddeden türetildi —
--       bkz. yukarıdaki tutarsızlık notu. Başlık ikinci sıraya alındı:)*
--   Yazma betiğinin kapısı (scripts/icerik-hatti/aile-metni-yaz.mjs KAPI 5) yalnız "[s.41]" gibi
--   sayfa atıflarını arıyordu; yıldız-parantez biçimli notu görmedi.
--
-- EVREN (ölçüldü): vitrinde ÇİZİLEN anahtarlar (`description.tr/en`, `meta_title`, `meta_description`,
--   `products.description_i18n.tr/en`) içinde not deseni taşıyan TEK kayıt bu. 16 ailenin
--   `description.bloklar_tr` alanında da not var ama o anahtar hiçbir bileşende çizilmiyor; sayfa
--   verisine gömülmesi aynı PR'daki kod değişikliğiyle kesildi (family.service asLocalizedText).
--   Blok metinlerinin temizliği blok render'ının (REC-164) ön şartıdır — bu migration'a KATILMADI.
--
-- NE DEĞİŞİR: yalnız not parçası çıkar; iki anlatı cümlesi AYNEN kalır. İki cümle de kaynakla
--   doğrulandı (kaynak dizini: avens_fiyat_listesi_2026_HQ.pdf s.43 — "JET SERİSİ KİMYASALLARA VE
--   AŞINDIRICI GAZLARA KARŞI DAYANIKLI SANTRİFÜJ FANLAR … Yatay ve dikey montaja uygun JET Serisi,
--   çatı ve duvar uygulamaları için … santrifüj çatı fanlarından oluşur").
--
-- GERİ ALMA: eski değer (310 karakter, md5 7910e007d5a7bbe35c32a514604b57fd) aşağıdaki
--   `v_eski` sabitinde durur; ayrıca `denetim_izi_product_families` tetiği değişikliğin önceki ve
--   sonraki hâlini kendiliğinden yazar. Geri almak = `description` jsonb'sinde `tr`'yi v_eski yapmak.
--
-- TETİKLER (ölçüldü): denetim_izi (önce/sonra kaydı) · on_product_families_change (Vercel'e sayfa
--   tazeleme bildirimi) · product_families_set_updated_at · single_level. arama_aile_kuyrukla yalnız
--   name/name_i18n değişince çalışır → bu güncelleme arama kuyruğuna iş düşürmez.
--
-- İDEMPOTENT: metin zaten temizse NOTICE ile geçer; ne eski ne yeni değilse (biri elle değiştirmiş)
--   DURUR — bilinmeyen bir metnin üzerine yazılmaz. Boş veritabanında (kurulum/gölge) NOTICE ile atlar.

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

do $$
declare
  v_eski constant text := 'Çatı ve duvar uygulamaları için, yatay ve dikey montaja uygun santrifüj çatı fanları. *(Kaynak başlığı SEAT''inkiyle birebir aynı olduğu için kimlik cümlesi maddeden türetildi — bkz. yukarıdaki tutarsızlık notu. Başlık ikinci sıraya alındı:)* Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar.';
  v_yeni constant text := 'Çatı ve duvar uygulamaları için, yatay ve dikey montaja uygun santrifüj çatı fanları. Kimyasallara ve aşındırıcı gazlara karşı dayanıklı santrifüj fanlar.';
  v_simdiki text;
  v_var     boolean;
begin
  if md5(v_eski) <> '7910e007d5a7bbe35c32a514604b57fd' then
    raise exception 'AİLE METNİ: v_eski sabiti canlıda ölçülen değerle aynı değil (md5) — dosya bozulmuş';
  end if;

  select true, description->>'tr' into v_var, v_simdiki
    from public.product_families where slug = 'jet-serisi';

  if v_var is null then
    raise notice 'AİLE METNİ ATLANDI — jet-serisi yok (kurulum/gölge koşumu).';
  elsif v_simdiki = v_yeni then
    raise notice 'AİLE METNİ: jet-serisi zaten temiz, dokunulmadı.';
  elsif v_simdiki = v_eski then
    update public.product_families
       set description = jsonb_set(description, '{tr}', to_jsonb(v_yeni))
     where slug = 'jet-serisi';
    raise notice 'AİLE METNİ: jet-serisi description.tr temizlendi (% → % karakter).',
      length(v_eski), length(v_yeni);
  else
    raise exception 'AİLE METNİ: jet-serisi description.tr beklenmeyen değer taşıyor (md5 %) — elle değişmiş olabilir, üzerine YAZILMADI',
      md5(coalesce(v_simdiki, ''));
  end if;
end;
$$;

-- GUARD — vitrinde çizilen hiçbir aile/ürün metninde editör notu deseni kalmamalı.
-- Desen, bugün ölçülen not biçimlerinin genellemesidir; anlatı metninde doğal geçmeyen işaretler.
do $$
declare
  v_desen constant text := '\*\(|\(\*|[Kk]aynak başlığı|tutarsızlık notu|[Bb]kz\. yukarı|boş bırakıldı|[Kk]aynakta yok|\[s\.\s*[0-9]|\[DB\]|\mTODO\M';
  v_kalan int;
  v_ornek text;
begin
  select count(*), min(k) into v_kalan, v_ornek
    from (
      select f.slug || ':' || a.alan as k, a.metin
        from public.product_families f
        cross join lateral (values
          ('description.tr',      f.description->>'tr'),
          ('description.en',      f.description->>'en'),
          ('meta_title.tr',       f.meta_title->>'tr'),
          ('meta_title.en',       f.meta_title->>'en'),
          ('meta_description.tr', f.meta_description->>'tr'),
          ('meta_description.en', f.meta_description->>'en')
        ) as a(alan, metin)
       where f.deleted_at is null
      union all
      select p.sku || ':' || a.alan, a.metin
        from public.products p
        cross join lateral (values
          ('description_i18n.tr', p.description_i18n->>'tr'),
          ('description_i18n.en', p.description_i18n->>'en')
        ) as a(alan, metin)
       where p.deleted_at is null
    ) x
   where x.metin ~ v_desen;

  if v_kalan > 0 then
    raise exception 'AİLE METNİ GUARD: vitrin metninde % editör notu kaldı (ilk: %)', v_kalan, v_ornek;
  end if;
  raise notice 'AİLE METNİ GUARD GEÇTİ: vitrinde çizilen aile/ürün metinlerinde editör notu 0.';
end;
$$;

commit;
