-- URN-85 · REC-300 3-C ön koşulu — SEKİZ KATEGORİNİN GÖRÜNEN TR SLUG'I DESIGN CSV ADINA ÇEKİLİR
--
-- NİÇİN: Pazar 11 Ekim'de adres şeması açılırken kategori adresleri veritabanındaki adlarla değil Design listesindeki
-- adlarla çıkacak (OPS hükmü 2026-10-09 19:50, H1: Design CSV kazanır). Plan ve ölçümler:
-- docs/plans/rec300-model-adres-kategori-tr-adlari-2026-10-10.md · cetvel: docs/standards/migration-safety-standard.md.
--
-- NE YAPAR: `categories.metadata.slug.tr` sekiz satırda değişir. EN kanonik `categories.slug` ve `metadata.slug.en`
-- DEĞİŞMEZ (EN yayın kapalı; dil başına slug işi URN-86). Başka sütun, ilişki, ürün ya da aile atamasına dokunmaz.
--
-- ESKİ ADRES NEDEN KIRILMAZ: `url_takma_ad_kategori` tetiği (20260923083021) güncellemede eski TR slug'ı
-- `url_takma_adlari`'na (tur=kategori, dil=tr, hedef=kategori kimliği) kendisi yazar; sayfa katmanı eski adrese 308 verir
-- (bayrak kapalıyken `/tr/category/<yeni>`, açıkken tek sıçrama `/tr/kategori/<yeni>`). Bu migration o iddiayı apply
-- anında SAYAR (guard 3): tutmazsa işlem geri alınır, hiçbir satır değişmez.
--
-- ÖLÇÜM (canlı SELECT, 2026-10-10): sekiz EN slug tek kiracıda birer satır; bugünkü TR adlar aşağıdaki tablodaki gibi; sekiz
-- yeni ad `categories` içinde slug/tr/en alanlarında başka kategoride YOK; tetik açık (`tgenabled = 'O'`); canlıda
-- önceki kullanım var (asit-dayanikli-fanlar). `url_takma_adlari` kategori satırı bugün 2 (1 TR + 1 EN).
--
-- İDEMPOTENT: ad zaten yeniyse satır atlanır, tekrar koşulabilir. Beklenmeyen bir ad görürse DURUR (kör yazım yok).
--
-- GERİ ALMA (tek işlem, elle): scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql
--   (yeni → eski güncellemesi; tetik tersini de takma ada yazar, kanonik adres farklı olduğu için döngü oluşmaz).
--
-- TİP DOSYASI: şema değişmez (yalnız veri), `src/types/database.types.ts` etkilenmez.
-- ŞEMA TABANI: INV-TABAN-TAZE-1 gereği birleşme sonrası aynı gün `sema-tabani-uret.yml` koşturulur.
--
-- ATOMİKLİK: dosyada BEGIN/COMMIT YOK; çalıştırıcı `psql --single-transaction` ile sarar (INV-MIGRATION-1, biçim b).

do $migration$
declare
  r record;
  v_adet integer;
  v_yeni_ad_kullanan integer;
  v_tr text;
  v_takma_ad integer;
begin
  for r in
    select * from (values
      ('control-systems',         'kontrol-sistemleri',                 'kontrol-ve-suruculer'),
      ('air-treatment',           'iklimlendirme-ve-hava-sartlandirma', 'hava-sartlandirma'),
      ('water-coil-duct-heaters', 'sulu-batarya-kanal-tipi',            'sulu-bataryalar'),
      ('single-room-hrv',         'tekil-oda-uniteleri',                'tek-oda-uniteleri'),
      ('axial-industrial-fans',   'aksiyel-sanayi-fanlari',             'aksiyel-fanlar'),
      ('spare-parts-sensors',     'yedek-parca-ve-sensorler',           'yedek-parcalar-ve-sensorler'),
      ('bathroom-toilet-fans',    'banyo-ve-tuvalet-fanlari',           'banyo-tuvalet-fanlari'),
      ('industrial-ceiling-fans', 'endustriyel-tavan-vantilatorleri',   'tavan-vantilatorleri')
    ) as t(en_slug, eski_tr, yeni_tr)
  loop
    -- GUARD 1: hedef satır TAM BİR tane (çok kiracılı olunca ya da satır yoksa kör yazılmaz).
    select count(*) into v_adet from public.categories c where c.slug = r.en_slug;
    if v_adet <> 1 then
      raise exception 'URN-85 guard 1: % için % satır var (beklenen 1); hiçbir şey yazılmadı', r.en_slug, v_adet;
    end if;

    -- GUARD 2: bugünkü TR ad ya beklenen eski ya zaten yeni; başka bir değer ise durulur.
    select c.metadata -> 'slug' ->> 'tr' into v_tr from public.categories c where c.slug = r.en_slug;
    if v_tr is distinct from r.eski_tr and v_tr is distinct from r.yeni_tr then
      raise exception 'URN-85 guard 2: % için TR ad % (beklenen % ya da %); hiçbir şey yazılmadı',
        r.en_slug, coalesce(v_tr, '<boş>'), r.eski_tr, r.yeni_tr;
    end if;

    -- Yeni ad başka bir kategorinin slug / tr / en alanında kullanılıyorsa iki kategori aynı adrese düşerdi.
    select count(*) into v_yeni_ad_kullanan
      from public.categories c
     where c.slug <> r.en_slug
       and (lower(c.slug) = r.yeni_tr
            or lower(coalesce(c.metadata -> 'slug' ->> 'tr', '')) = r.yeni_tr
            or lower(coalesce(c.metadata -> 'slug' ->> 'en', '')) = r.yeni_tr);
    if v_yeni_ad_kullanan > 0 then
      raise exception 'URN-85 guard 1b: yeni ad % başka bir kategoride kullanılıyor; hiçbir şey yazılmadı', r.yeni_tr;
    end if;

    if v_tr = r.eski_tr then
      update public.categories c
         set metadata = jsonb_set(c.metadata, '{slug,tr}', to_jsonb(r.yeni_tr::text), false)
       where c.slug = r.en_slug
         and c.metadata -> 'slug' ->> 'tr' = r.eski_tr;
    end if;

    -- GUARD 3: eski TR ad takma ad tablosunda DOĞRU kategoriye işaret ediyor (tetik yazdı ya da önceden vardı).
    -- "Eski adres 404 vermez" iddiası burada apply anında sayılır.
    select count(*) into v_takma_ad
      from public.url_takma_adlari t
      join public.categories c on c.id = t.hedef_id
     where t.tur = 'kategori'
       and t.dil = 'tr'
       and t.eski_slug = r.eski_tr
       and c.slug = r.en_slug;
    if v_takma_ad <> 1 then
      raise exception 'URN-85 guard 3: eski ad % takma ad tablosunda % satırla duruyor (beklenen 1); işlem geri alınır',
        r.eski_tr, v_takma_ad;
    end if;
  end loop;
end
$migration$;
