# REC-357 Faz 2 — PIM'i kataloğun kalıcı hattı yapmak (PLAN — challenger: §6 BLOK, gölge KOŞULLU)

> **KARAR 36 = EVET** (Recep, ALTYAPI penceresinde birinci ağızdan, 2026-09-22: *"36 için evet"*). Gerekçesi:
> *"elle tutulur bir katalog altyapımız yok; ürün verisi güncellemesi pratik olsun; resim eşleştirmeleri dahil;
> AI modelleriyle bu işi bir PIM uygulamasıyla yönetmek daha doğru."* ALTYAPI hükmü: evet, iki şartla — (1) §7
> yedek + başka makinede geri kurma ölçümü her şeyden önce; (2) 73 boş ürünün doldurulması PIM'den bağımsız ilk iş.
> **Sıradaki adım:** challenger koştu (§12). Gölge adımları (§7 → §1 → §5) koşullu serbest; §6 yazma kolu §12'deki
> beş koşul kapanmadan AÇILMAZ. §9 kıyas kaydı olarak kalır ama karar dayanağı DEĞİL (challenger 2.9).
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
- **ÖLÇÜLDÜ 2026-09-23 (`scripts/pim/unopim-yedek.cjs`, INV-PIM-YEDEK-1):**

  | adım | sonuç |
  |---|---|
  | `al` (pg_dump + storage birimi + compose/.env/sırlar + şifreli paket) | 2–4 sn; paket 108 KB (12 ürün) |
  | şifreleme | AES-256-GCM, anahtar yedeğin DIŞINDA ayrı dosyada; yanlış anahtar → reddedildi; anahtar yedek dizininde → `al` reddetti |
  | `coz` + `dene` (ayrı proje `pim-geri`, boş birimler) | 48–56 sn · ürün 12/12 · kategori 1/1 · giriş 200 · API anahtarıyla okuma 200 · APP_KEY yedekten |
  | sabotaj: `.app_key`'siz yedek | ürün yine 12/12 göründü ama anahtar YENİDEN ÜRETİLDİ → betik KIRMIZI (sayı kontrolü tek başına bunu görmezdi) |
  | temiz makine indirme | 6 imaj ≈ 1,37 GB sıkıştırılmış; Docker Hub'dan ölçülen hız 12 MB/sn → ≈ 2 dk |
  | **temiz makinede toplam (Docker kurulu varsayımıyla)** | **≈ 4–5 dk** (hedef ≤ 30 dk karşılandı; Docker Desktop kurulumu hariç) |

  **APP_KEY bulgusu (challenger 2.8):** `.env`'de APP_KEY YOK; imajın `ensure-app-key.sh`'ı anahtarı
  `storage/app/private/.app_key`'e üretip saklıyor → storage birimi yedeklenince anahtar da girer, `al` tarda
  anahtarı görmezse durur.
  **Karar 81 = EVET** (Recep, OPS aktarımı): yedek makineden çıkmadan önce şifrelenir, Recep'in Google Drive'ında
  özel klasör; şifre anahtarı yedekle aynı yerde tutulmaz. **Karar 82 = EVET:** 442 ürün yüklenene kadar yedek
  elle ve her toplu düzenlemeden ÖNCE zorunlu; 442'nin yüklendiği gün günlük otomatik yedeğe geçilir (RPO 24 sa).
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
§5 kapısı → gölgede 2 hafta fark 0 → §12 beş koşul → §6 Recep kapısı. §8 paralel ölçüm.

## 11 · Riskler (challenger için)

1. İki doğruluk kaynağı dönemi (§6 açılana kadar PIM ve DB ayrı yaşar) → fark raporu günlük, tek yazıcı kuralı açılışta.
2. Tek makine / tek kişi: PIM bu bilgisayarda; §7 ölçülmeden faz 2 başlamaz.
3. UnoPim tuzakları (ölçülmüş): `status=1 → false`; silinen öznitelik değeri kalıyor; yanlış CSV başlığı tüm dosyayı
   reddediyor; imports/ izinleri (www-data). Her biri üreticide kapı olmalı.
4. Üçüncü taraf sürüm: UnoPim 3.1.1 sabit; yükseltme ayrı karar (bağımlılık kayıt defteri).

## 12 · Plan-challenger sonucu (2026-09-22, bağımsız alt ajan) — **§6 BLOK · gölge KOŞULLU**

Denetçi planı yazan bağlamdan ayrı koştu (kod + şema + migration + tetik + cetvel okuması). Bulgular ve plana etkisi:

| # | bulgu | risk | kanıt | plana etkisi |
|---|---|---|---|---|
| 2.1 | **Tek yazıcı bugün yanlış:** admin ürün formu `name` / `category_id` / `technical_specs` / `description_i18n`'i ticari alanlarla AYNI UPDATE'te yazıyor; CSV içe alımı SKU ile tüm kolonları upsert ediyor; kategori tablosu ve kategori kurucusu ad/slug/üst kategori yazıyor | Kritik | `src/components/admin/products/ProductFormModal.tsx`, `ProductCsvImport.tsx`, `src/views/admin/CategoriesTableBody.tsx`, `CategoryBuilderView.tsx` | §6 öncesi iş kalemi: dört yol PIM kolonlarında salt-okumaya iner (URUN) + AST conformance |
| 2.2 | "Köprü dışı yazım = kırmızı" kapısı ölçemez: denetim tetiği service_role'de `actor` NULL yazıyor; köprü ile başka betik ayırt edilemez | Yüksek | `supabase/migrations/20260909071451_denetim_izi_dml_tetikleri.sql` | köprüye ayrı DB rolü ya da claim'li jeton → **migration, kural 13, ayrı PR** |
| 2.3 | Kiracı sessiz: köprünün anahtarı, `tenant_id` kaynağı, RLS tavrı yazılmamış; "kiracıya özel açıklama" kolonu şemada YOK (tek açıklama `description_i18n`, o da PIM'in) | Yüksek | `products.tenant_id` NOT NULL; `scripts/kademe2-load/load.mjs` sabit TENANT_ID | kiracı kararı yazılır; kiracı açıklaması ya ayrı kolon (migration) ya kapsam dışı |
| 2.4 | "Aile" iki şey: VentHub `product_families` (seri kimliği, PDP adresi) ≠ UnoPim attribute family; sahiplik listesinde `product_families`, `brands`, `name_i18n`, `slug`, `model_code` yok | Yüksek | `src/lib/services/family.service.ts` | sahiplik tablosu kolon bazında, beş tablo |
| 2.5 | Kimlik: yeni ürünün SKU'su PIM'de elle girilir, `kimlik-kurali.mjs` PIM girişinde zorlanmıyor; ad değişikliği ↔ sipariş snapshot'ı/slug politikası yok; köprü adı yalnız `en_US`'den okuyor | Yüksek | `scripts/pim/unopim-kopru.cjs` | SKU kimlik kuralıyla üretilir, slug dondurulur, TR/EN ad ayrı okunur |
| 2.6 | Tazelenme: webhook dalları var (08-15 fiyat vakası bu tablolarda tekrarlanmaz) ama keşif önbelleği `name` / `technical_specs` değişince tazelenmiyor (ÖLÇÜLMEDİ); tam senkron ~1600 webhook; aynı yola yazılan görsel CDN'de bayat kalır | Orta | `src/app/api/webhook/supabase/route.ts` | ölçüm + toplu tazeleme + içerik-hash'li görsel adı |
| 2.7 | Denetim zaten satır tetikleriyle otomatik ve fail-closed (denetim satırı yazılamazsa köprü yazımı geri alınır); "migration gerekmez" iddiası 2.2 ve 2.3 ile çelişiyor | Orta | aynı migration | "her toplu yazım bir satır" maddesi düşer; migration ihtiyacı açıkça yazılır |
| 2.8 | Yedekte `.env` / `APP_KEY` / API istemci sırları / compose dosyası yok; kabul edilen kayıp penceresi (RPO) tanımsız — köprüden geçmemiş PIM düzenlemesi yalnız bu makinede yaşar | Orta | §7 | §7'ye eklenir; geri kurma ölçümü §1'den ÖNCE koşulur |
| 2.9 | §9 maliyeti dayanaksız: 2.1–2.5 işleri PIM sütununda yok, bakım gün olarak girilmemiş | Orta | §9 | §9 karar dayanağı değil; yeniden hesaplanır |

**§6'yı açma koşulları (beşi birden):** (1) `docs/standards/pim-hatti-standard.md` kolon bazında sahiplik tablosuyla yazıldı
ve conformance'a bağlandı; (2) dört admin yazma yolu PIM kolonlarında salt-okuma (URUN); (3) köprü rolü migration'ı Recep
onayıyla indi; (4) kiracı kararı yazılı; (5) kimlik/slug/ad politikası köprüde uygulanıyor.
**Gölge için koşul:** 2.8'deki yedek eksikleri + geri kurma ölçümü önce. Denetçinin ölçmediği iki şey (keşif önbelleğinin
kart/filtrede ad-özellik kullanımı; temiz makinede `APP_KEY`'li geri yükleme) ALTYAPI'nın sıradaki ölçümleridir.
