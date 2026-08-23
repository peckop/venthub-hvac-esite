-- T151-VH · product_families.name dil taşıyamıyor — name_i18n jsonb eklenir
--
-- SORUN (ölçüldü, 2026-08-23, canlı prod):
--   product_families'te description / meta_title / meta_description JSONB ve dil-anahtarlı
--   ({"tr":…,"en":…}); 38/38 satırda dolu, EN alanları gerçekten çeviri (0 kopya, EN
--   alanında 0 Türkçe karakter). AMA `name` düz `text` — ailenin ADI için dil taşıyacak
--   yer YOK. Sonuç: 38 aileden 25'inin adı İngilizce vitrinde zorunlu olarak Türkçe basıyor
--   ("Vortice Endüstriyel Çatı Fanları", "AVenS Hücreli Aspiratörler"…).
--   Kalan 13'ü dil-nötr model adı ("Danfoss VLT HVAC Drive FC 102", "Vortice Lineo 125
--   Quiet") ve ÇEVRİLMEMELİDİR.
--
--   NOT: 25 sayısı "Türkçe'ye özel karakter içeriyor mu" testinden GELMEZ. O test 21 verir
--   ve dört aileyi kaçırır ("AVenS Plug Fanlar", "Vortice AIR DOOR Hava Perdeleri",
--   "Nicotra Gebhardt DD Direkt Akuple Radyal Fanlar", "Vortice VORT-E ATEX Fanlar") —
--   hiçbirinde ğ/ı/İ/ö/ş/ü/ç yok ama hepsi Türkçe. Ölçüm ekseni "özel karakter" değil "dil".
--
-- BU MIGRATION NE YAPAR / NE YAPMAZ
--   YAPAR : name_i18n kolonunu ekler, TR'yi mevcut `name`den doldurur, dil-nötr 13 model
--           adında EN = TR yazar (çeviri gerekmediği için).
--   YAPMAZ: 25 Türkçe ailenin EN karşılığını YAZMAZ. Bunlar müşteri-görünür metindir ve
--           gözden geçirilmeden prod'a yazılmaz; ayrı ve onaylı bir veri adımıyla gelir.
--   YAPMAZ: okuma yolunu DEĞİŞTİRMEZ. Kod hâlâ `name` okur. Bu migration tek başına
--           ekranda HİÇBİR ŞEYİ değiştirmez — kasıtlı: yapı önce, atarsız girer.
--
-- KISIT YOK — BİLEREK
--   `name_i18n` NOT NULL ya da CHECK (name_i18n ? 'tr') YAZILMADI. Kısıt mevcut satırlarda
--   koşar (bugün geçerdi, 38/38 dolduruluyor) ama YAZMA yolunu da bağlar: name_i18n
--   vermeyen bir INSERT o andan itibaren patlar ve yazma yolu henüz güncellenmedi.
--   Sertleştirme, yazma yolu name_i18n'i doldurmaya başladıktan SONRA ayrı migration.
--
-- TAZELEME: product_families üzerindeki on_product_families_change tetiği
--   AFTER INSERT OR DELETE OR UPDATE, KOLON KAPSAMLI DEĞİL — yani name_i18n güncellemesi
--   webhook'u zaten tetikler, ek tetik/dal gerekmez (ölçüldü: pg_get_triggerdef).
--   Aşağıdaki backfill 38 satırı UPDATE ettiği için 38 webhook atışı ve 38 updated_at
--   dokunuşu üretir. Beklenen ve zararsız, ama sürpriz olmasın diye yazılıyor.

alter table public.product_families
  add column if not exists name_i18n jsonb;

comment on column public.product_families.name_i18n is
  'Aile adının dil-anahtarlı hali: {"tr":…,"en":…}. `name` TR SSOT olarak durur; okuma '
  'yolu name_i18n[lang] -> name sırasıyla düşer. EN yoksa TR basılır (bugünkü davranış).';

-- 1) TR her satırda mevcut `name`den gelir. Idempotent: yalnız boş olanı doldurur.
update public.product_families
set name_i18n = jsonb_build_object('tr', name)
where name_i18n is null;

-- 2) Dil-nötr model adlarında EN = TR. Türkçe testi İKİ eksenli: özel karakter VEYA
--    özel karakteri olmayan Türkçe sözcük. Tek eksen kullanılırsa dört aile yanlışlıkla
--    "dil-nötr" sayılır ve EN vitrine Türkçe adla girer.
update public.product_families
set name_i18n = name_i18n || jsonb_build_object('en', name)
where name_i18n->>'en' is null
  and name !~ '[ğĞıİöÖşŞüÜçÇ]'
  and name !~* '\m(fanlar|hava|perdeleri|akuple|radyal|direkt|kanal|seri|nem|duman|egzoz|cihaz)\M';

-- 3) İndeks: okuma yolu bağlanınca dil-anahtarlı arama/sıralama buradan geçecek.
create index if not exists product_families_name_i18n_gin
  on public.product_families using gin (name_i18n jsonb_path_ops);
