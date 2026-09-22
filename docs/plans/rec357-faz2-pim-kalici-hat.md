# REC-357 Faz 2 — PIM'i kataloğun kalıcı hattı yapmak (PLAN TASLAĞI — challenger bekliyor)

> **KARAR 36 = EVET** (Recep, ALTYAPI penceresinde birinci ağızdan, 2026-09-22: *"36 için evet"*). Gerekçesi:
> *"elle tutulur bir katalog altyapımız yok; ürün verisi güncellemesi pratik olsun; resim eşleştirmeleri dahil;
> AI modelleriyle bu işi bir PIM uygulamasıyla yönetmek daha doğru."* ALTYAPI hükmü: evet, iki şartla — (1) §7
> yedek + başka makinede geri kurma ölçümü her şeyden önce; (2) 73 boş ürünün doldurulması PIM'den bağımsız ilk iş.
> **Sıradaki adım:** plan-challenger (ZORUNLU — veri göçü) → uygulama. §9 (PIM'siz yol) kıyas kaydı olarak kalır.
>
> **MODEL (değişmez):** canlı sitenin veritabanı **Supabase kalır**. UnoPim = ürün verisinin düzenlendiği **yerel
> çalışma tezgâhı** (Docker, bu makine), sunucu DB'si değil. Köprü **PIM → Supabase tek yönlü, tek yazıcı**.
>
> **ALAN SAHİPLİĞİ KURALI (Recep'in kiracı veri girişi ihtiyacı için):** PIM kiracıya açılmaz (iç araç).
> - **PIM'de doğar (üretici verisi, tek doğru):** teknik özellikler, ad/açıklama (TR/EN), kategori, görsel + alt metin.
>   Köprü YALNIZ bu alanlara yazar; bu alanlara admin paneli/betik yazmaz.
> - **Admin panelinde doğar (ticari veri):** fiyat, stok, kiracıya özel açıklama/kampanya, yayın durumu.
>   Köprü bu alanlara DOKUNMAZ.
> Kapı: iki yazıcının alan kümeleri kesişmez (conformance, §6 ile birlikte yazılır).
> **Sahiplik:** veri sahibi KATALOG (öznitelik eşleme `icerik-hatti-pim-oznitelik-esleme-2026-09-22.md`, #1314);
> ALTYAPI = kurulum, köprü, yedek, kapılar. **Cetvel:** yok — bu işin kapsamında `docs/standards/pim-hatti-standard.md`
> yazılır (hangi veri nerede doğar, tek yazıcı kuralı, yedek).
> **Zemin (ölçülmüş):** faz 1 = §3.1–§3.4 `rec357-katalog-pim-cozumu.md` (kurulum, 12 ürün fark 0, köprü okuma kolu,
> tamlık); 4 UnoPim biçim sorusu (REC-357 yorumu 09-22).

## 0 · Bugünkü veri (2026-09-22 ölçüldü)

| kalem | canlı (salt okuma) | PIM bugün |
|---|---|---|
| ürün / aile | 442 / 47 | 12 / 1 (pilot) |
| teknik alan | 77 tekil (54'ü PIM'de tanımsız, çoğunda birim sözlükte yok) | 22 + 1 türetilen |
| `technical_specs` tamamen boş ürün | **73** (8 aile) | — |
| görsel | `product_images` 1146 satır · 429 ürün · alt metni boş 0; depo `product-images` 1188 nesne · **36 MB** | yok |
| kategori | 31 (kök 8) | yok |
| dil / para | TR + EN; TRY | tr_TR + TRY **açık** (09-22) |
| PIM disk | — | pgsql 71 MB · redis 1,3 MB · storage 0,25 MB · elasticsearch 0,2 MB; imaj 1,35 GB |

## 1 · Tam yükleme — 442 ürün / 47 aile

1. **54 tanımsız alan** öznitelik olarak açılır; birim **kaynak tablo başlığından** sayılır, alan adından türetilmez
   (KATALOG sözlüğü, `alan-etiket-sozlugu.json`). Birimsiz kalan alan `text` açılır ve listelenir — sessiz tahmin yok.
2. Aile başına öznitelik şablonu (47 aile). Şablon = o ailenin kaynak kataloğunda basılı alanlar (KATALOG), **vekil
   "yarısında dolu" kuralı değil** (§3.4 uyarısı).
3. Ölçü aileleri: bugün 23 + eklenen `VolumeFlow` m³/h. Eksik: devir (rpm) → özel `RotationalSpeed`.
4. CSV üretici (`scripts/pim/unopim.cjs`) tek aileden **tüm ailelere** genişler; kod kuralı (öznitelik/aile/kategori
   kodunda tire yok, 422) üreticide zorlanır.
5. **Kabul:** 442/442 ürün içe alındı, düşen satır adıyla raporlandı; gölge ↔ PIM fark 0 (köprü `dogrula`).

## 2 · Dil ve para

tr_TR + TRY açık (ölçüldü). Öznitelik TR etiketi **öznitelik CSV içe alımıyla** (dil başına satır) — REST değil,
çünkü toplu ve tekrarlanabilir. Kaynak: `tr.ts → pdp.specs` başlıkları (23/23 dolu; 3 alanın sitede başlığı yok →
URUN'a iletildi). Net/brüt fiyat **iki ayrı price özniteliği** (`net_price (TRY)`, `gross_price (TRY)`).

## 3 · Görsel / medya

- Bugün: depo `product-images/<uuid>/…` (1188 nesne, 36 MB), `product_images.path` + `alt` (429 ürün).
- PIM'de image/gallery tipi **alt metni taşımaz** → ayrı dil başına `image_alt` text özniteliği.
- Aktarım: nesneler UnoPim medya deposuna **bir kez** kopyalanır; eşleme `gorsel-manifest` (sha256 + ürün + sıra)
  üzerinden — REC-212 09-08 yorumu. `images_directory_path` verilmezse UnoPim yolu **kontrol etmeden** saklıyor
  (ölçüldü) → içe alımda yol varlığı üretici tarafından doğrulanır.
- **Açık soru (ölçülecek):** görselin kalıcı evi PIM mi, Supabase depo mu? Köprü tek yönlü olduğu için öneri:
  kaynak PIM, yayın kopyası Supabase depo (sha256 eşitliği kapı).

## 4 · Kategori ağacı

31 kategori (kök 8) REST ile `parent` kurularak açılır (CSV ağaç kurmaz). Ürün CSV'si `categories` = kök **ve** alt
kod birlikte (ölçüldü: üst kendiliğinden eklenmez). K3-b (kategori adlandırma) ile uyum: kod = kanonik EN slug.

## 5 · Dışa aktarım profilleri = REC-212 paket sözleşmesi

Paket sözleşmesinin 8 kolonu UnoPim dışa aktarım profili olarak tanımlanır; **CSV round-trip kapısı**
(`paket-csv-dogrula.mjs`, bugün 442 ürün · 17522 hücre · fark 0) PIM çıktısına karşı da koşar.

## 6 · Köprü YAZMA kolu (PIM → Supabase) — **ayrı Recep kapısı**

Bugün köprü yalnız `pim_golge`'ye yazıyor (hedef DB sabit, sabotajla kırmızı ölçüldü). Yazma kolu:
- **Tek yazıcı kuralı:** açıldığı gün katalog alanlarına elle/betikle DB yazımı **biter**; tek yazıcı köprüdür
  (kapı: katalog tablolarına köprü dışı yazım = kırmızı). `admin_audit_log`'a her toplu yazım bir satır.
- Sıra: gölgede 2 hafta fark 0 → canlıya yazma **Recep onayıyla** → ilk hafta günlük fark raporu.
- Migration gerekmez (mevcut kolonlar); gerekirse kural 13.

## 7 · Yedek ve kalıcılık — **(a) PIM'in kendisinin taşınabilirliği**

- Veri 4 docker hacminde; asıl veri **pgsql 71 MB** + storage (görsel gelince ~40 MB). Elasticsearch ve redis
  yeniden üretilebilir (dizin yeniden kurulur).
- Yedek: günlük `pg_dump` (sıkıştırılmış, tahmini <20 MB) + storage hacminin arşivi → makine dışına (Recep'in
  seçeceği yer; Google Drive bağlayıcısı var). Saklama 14 gün.
- **Başka makinede ayağa kalkma — ölçülecek (kabul ölçütü):** temiz makinede `docker compose up` (imaj 1,35 GB
  indirme) + `pg_restore` + storage geri yükleme + dizin yeniden kurma. Hedef ≤ 30 dk; ilk koşumda gerçek süre
  yazılır. Bugünkü kurulum süresi (§3.1) bilgi amaçlı taban.
- Tek makine riski: bugün PIM yalnız bu bilgisayarda. Barındırma (karar 59) ile birlikte ele alınır — PIM bir
  sunucuya taşınırsa aylık bedel tabloya girer.

## 8 · Roller / onay akışı

Bugün tek kullanıcı (Recep) + ajanlar (API anahtarı). Ölçülecek: UnoPim rol/izin modeli (ACL anahtarları
`api.catalog.*` biliniyor), "taslak → onaylı" akışı var mı. İhtiyaç çıkmazsa tek rol + salt-okuma köprü anahtarı yeter.

## 9 · **(b) PIM'siz alternatifin bedeli** (Recep kıyas istiyor)

Aynı ihtiyaçlar (tamlık görünürlüğü, aile şablonu, birim/dil disiplini, toplu güncelleme, görsel eşleme) kendi
sistemimizde yazılırsa — **tahmin, ölçüm değil** (kıyasa yalnız gün cinsinden girsin diye):

| iş | PIM yolu (bu plan) | PIM'siz yol |
|---|---|---|
| aile şablonu + zorunlu alan | UnoPim'de var — tanımlama ~1 gün | tablo + migration + admin ekranı ~3 gün |
| tamlık puanı ekranı | var (dil/kanal başına) | hesap + admin ekranı ~2 gün |
| birim/tip disiplini | ölçü aileleri var | JSONB şema + doğrulama kapısı ~2 gün |
| toplu içe/dışa aktarım | içe/dışa aktarım işleri var; profil tanımı ~1 gün | CSV hattı zaten var (`kademe2-load`), genişletme ~1 gün |
| görsel eşleme | manifest + aktarım ~2 gün | manifest + admin ekranı ~2 gün |
| kurulum/bakım | docker 7 konteyner, yedek, güncelleme — sürekli | yok (mevcut yığın) |
| **toplam ilk yatırım** | **~5–6 gün** (+ sürekli bakım) | **~10 gün** (bakım yok, ama her yeni ihtiyaç yine kod) |

İki yolda da ortak ve **ilk iş**: 73 boş ürünün teknik verisinin girilmesi (KATALOG, kaynak dizini üzerinden).

## 10 · Sıra (karar "evet" olursa)

§7 yedek (önce — veri kaybı riski olan hiçbir adım yedeksiz başlamaz) → §1 tam yükleme (gölge) → §2 → §4 → §3 →
§5 kapısı → gölgede 2 hafta fark 0 → §6 Recep kapısı. §8 paralel ölçüm.

## 11 · Riskler (challenger için)

1. İki doğruluk kaynağı dönemi (§6 açılana kadar PIM ve DB ayrı yaşar) → fark raporu günlük, tek yazıcı kuralı açılışta.
2. Tek makine / tek kişi: PIM bu bilgisayarda; §7 ölçülmeden faz 2 başlamaz.
3. UnoPim tuzakları (ölçülmüş): `status=1 → false`; silinen öznitelik değeri kalıyor; yanlış CSV başlığı tüm dosyayı
   reddediyor; imports/ izinleri (www-data). Her biri üreticide kapı olmalı.
4. Üçüncü taraf sürüm: UnoPim 3.1.1 sabit; yükseltme ayrı karar (bağımlılık kayıt defteri).
