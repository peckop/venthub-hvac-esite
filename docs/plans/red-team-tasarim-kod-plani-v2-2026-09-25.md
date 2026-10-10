# Red Team Mimari Denetim Raporu: Tasarım → Kod Planı v2 (2026-09-25, TASARIM)

Denetçi: bağımsız red-team alt ajanı (plan-challenger, A2). Kod yazılmadı, değiştirilmedi.
Okunan ağaç: `C:/tmp/vh-tasarim-envanter` (HEAD `080e33815`). origin/master (`0681c9c58`) 4 commit ileride.
Aradaki farkı ölçtüm: token/Tailwind/test/layout dosyalarında fark **0**, yalnız `next.config.mjs` ile
`src/middleware.ts` değişmiş. Bu iki dosya origin/master'dan okundu.

## 0. Adım × dört soru tablosu

| Adım | S1 gerekli mi (sayı) | S2 zaten var mı | S3 kaç yol test ediliyor | S4 neyi bozabilir (canlı ÖNCE/SONRA) | Hüküm |
|---|---|---|---|---|---|
| Faz 0 · K36 kararı | Faz 1'in tek kilidi (1 karar) | Yok. Kararlar aynasında "verilirse K36 olur" satırı var, karar yok | 0. Karar olduğu için kapı gerekmez | Koda dokunmuyor | KALSIN |
| Faz 1 · Kabuk (INV-KABUK-V18-1) | v18 A1–A5, 5 kare | **Kısmen var.** `YENI_KABUK_GEZINMESI=false` ([features.ts:58](src/config/features.ts#L58)) ve kilit testleri 3 dosyada (`header-teklif-paneli`, `mobil-alt-sekme`, `header-urun-secici`) | INV-KABUK-V18-1 henüz yok, 0 → ⚠SINANMIYOR. Kilit kolları `= false` bekliyor ([header-teklif-paneli.test.ts:53](src/__tests__/conformance/header-teklif-paneli.test.ts#L53)) | ÖNCE: bayrak kapalı, eski kabuk. Önizleme için bayrak `true` yapılırsa 2 kilit kolu KIRMIZI olur; plan önizleme yöntemini yazmıyor | DARALT (önizleme yolu yazılsın) |
| Faz 2a · Görünmez token köprüsü | DS'teki yeni adların sitede tüketicisi bugün **0**. Getirisi yalnız Faz 3'e zemin hazırlamak | DS adlarının ~4'ü sitede **zaten var** (§2.1). `INV-TOKEN-PARITE`, `token-turet`, `ds-kaynak` yok (ölçüldü: 0 dosya) | Yeni kapı 1 (INV-TOKEN-PARITE-1). Mevcut INV-PALET-1 bu adımla **kırmızıya düşer** (§2.2) | ÖNCE: görünüm aynı. SONRA: `--text-muted` eklenirse INV-PALET-1 kırmızı. `fontFamily.mono` ya da `fontSize.display` bağlanırsa görünüm değişir (admin'de 63 `font-mono`). Yani "görünmez" iddiası şartlı | DARALT |
| Faz 2b · Görünüm dönüşü | 798 `primary-navy` kullanımı / 139 dosya, 156 `bg-primary-navy`, 6 `--brand-cyan`, tüm site fontu | Değerlerin **ikisi zaten var**: `--marka-lacivert` = DS `--primary-navy`, `--marka-turkuaz` = DS `--brand-cyan` ([index.css:300-301](src/index.css#L300)) | Görsel ve kontrast kapısı 0 → ⚠SINANMIYOR (jsdom ölçemez, cetvel §3). Önce/sonra ölçümü elle yapılacak | ÖNCE: lacivert #1E3FAE (beyazla 8.83), Inter latin. SONRA: #1B2C4B (13.92), Archivo. **Admin DEĞİŞİR**: 19 `primary-navy` kullanımı / 4 dosya + kök `body` fontu (§2.3). "Inter 0" hedefi, kapsam dışı ilan edilen 3D ve admin dosyalarına dokunmayı gerektiriyor (§2.4) | DARALT |
| Faz 3 · `components/ds/` 11 bileşen + galeri | 11 bileşen; sitede adı tutan karşılık 0 (ölçüldü) | `KabukBandi` ↔ Faz 1'deki `StickyHeader` aynı işi görüyor. `Kart` ↔ `ProductCard`/`FamilyCard` | INV-DS-PROP-1 ve INV-DS-GORSEL-1 yok, 0 → ⚠SINANMIYOR. Bayrak kapalıyken galeri 404 verir, o zaman görsel kapı neyi ölçer? | Yeni rota ekliyor: `[lang]` altındaki sayfa sayısı değişir. Galeri kendi `generateMetadata`'sını yazmazsa `[lang]` varsayılanıyla dizine açık kalır | DARALT (`KabukBandi` Faz 1'e bağlansın) |
| Faz 4 · Sayfalar | 6 sayfa ailesi | Bilgi Merkezi rotası bugün eklendi (`0681c9c58`, #1402, 4 `page.tsx`) | 0 → ⚠SINANMIYOR | Faz 4(2) "adres işiyle aynı yayında" diyor. Bu, görünüm ve adres değişikliğini tek sürümde birleştiriyor | DARALT (karar 118 "adres önce" diyor, ayrı yayın olmalı) |
| Faz 5 · Borç mandalı | `bg-primary-navy` 156, rounded-admin 383, shadow-admin 89 | Admin ratchet'i var (INV-ADMIN-DESIGN-1, admin-design-standard §…962) | 0 → ⚠SINANMIYOR | Sayaç ratchet'i; bugünkü değer taban alınır | KALSIN |
| K-1 kapısı (rota klasörü 0) | Karar 118'i korur | Yok | 0 → ⚠SINANMIYOR. "Faz PR'ı" nasıl tanınacak tanımlı değil (§2.7) | Genel uygulanırsa URUN'un REC-300 ve Bilgi Merkezi PR'larını kırmızıya boğar | DARALT |
| `ds-kaynak` kopyası + `token-turet.mjs` | Faz 2a'nın dayanağı | Yok | Tazelik kolu kendi kendini doğrular (§2.8) → sahte yeşil | `scripts/**` ESLint'te yok sayılıyor ([eslint.config.cjs:124](eslint.config.cjs#L124)). CSS kopyası knip'in `project` kümesinde değil | DARALT |

> **SABİT SATIR, CLAUDE.md kural 13 ve 14.**
> **Kural 13:** adım `supabase/migrations/*.sql` içeriyorsa master'a merge **prod DB'ye otomatik uygular**. PR yalnız kullanıcının açık onayıyla merge edilir, şerit kendi merge etmez. *(Bu planda migration 0; ölçüldü, planın hiçbir fazı migration önermiyor.)*
> **Kural 14:** testi ya da kapıyı sonraki işe bırakmak adımı tamamlamaz. Hata yolları (ağ yok, veri boş, yetki yok) aynı adımın kapsamındadır. *(Faz 2b'nin font yükleme hatası, yani fallback metrikleri, ve galeri bayrağı kapalıyken görsel kapının davranışı bu kapsamda yazılmalı.)*

## 1. Giriş ve Metodoloji

**Amaç:** planın on iddiasını koddan ölçerek çürütmek.

**Okunanlar:**
- [src/index.css](src/index.css): `:root` bloğu 283–381, `.light` 383, `.dark` 398, `[data-admin-theme]` 436/463, `prefers-contrast` 556
- [tailwind.config.js](tailwind.config.js), [tokens.js](src/design-system/tokens.js), [layout.tsx](src/app/layout.tsx), [admin/layout.tsx](src/app/admin/layout.tsx)
- Kapılar: INV-PALET-1, INV-TOKEN-AA-RENK-1, INV-TOKEN-SINIF-1 ve bayrak kilitleri
- `next.config.mjs` CSP, knip, ESLint
- Pano claim'leri (`board.cjs who`)
- DS canlı değerleri: TASARIM'ın 2026-09-25'te DesignSync ile okuduğu `tokens/renk.css` + `tokens/tipografi.css` kopyası (oturum geçici dosyası; değerler plan §1 ve envanter `tasarim-envanteri-2026-09-25-ds-marka-belge.md` kaynak notunda)
- Tailwind 3.4.19'un varsayılan ölçekleri (`stubs/config.full.js`)

**Renk hesabı:** HSL→HEX çevrimi ve WCAG oranı yerel bir Node betiğiyle yapıldı. Formül, kapıların kullandığı formülün aynısı.

**RLS, Edge, webhook ve monotonluk başlıkları:** plan veri, middleware ve webhook yoluna dokunmuyor, migration yok. Bu başlıklarda bulgu yok, ölçülerek boş çıktı.

## 2. Detaylı Teknik Analiz ve Çürütmeler

### 2.1. "Çakışan küme 2-3 ad" varsayımı eksik: ölçülen küme 4 ad + 1 kapı yasağı + 2 bilinmeyen dosya
* **Bulgu:** DS'teki adlar tek tek sitedeki adlarla karşılaştırıldı (`src/**/*.css` içinde 58 tanım).
  - **Aynı ad, farklı değer (4):**
    - `--primary-navy`: site `226 71% 40%` ([index.css:344](src/index.css#L344)), DS `219 48% 20%`.
    - `--brand-cyan`: site `189 78% 53%` ([index.css:341](src/index.css#L341)), DS `194 100% 35%`.
    - **`--action-terracotta-deep`**: site `24.4 91% 39.2%` ([index.css:332](src/index.css#L332)), DS `24 91% 39%`. Dize olarak farklı; RGB'de #BF5309 ile #BE5109 arasında 2 kanal fark var. **Planın listesinde yok.**
    - `--font-sans`: index.css'te hiç tanımlı değil; `next/font` sınıfı `body`'ye basıyor ([layout.tsx:12](src/app/layout.tsx#L12)).
  - **Aynı ad, aynı değer (1):** `--brand-cyan-ink` `193 100% 28%` ([index.css:331](src/index.css#L331)).
  - **İkinci tanım yeri:** `.light` bloğu `--primary-navy` ve `--brand-cyan`'ı yeniden tanımlıyor ([index.css:390-393](src/index.css#L390)). Bu sınıf hiçbir yerde uygulanmıyor (`classList` sayısı 0), yani ölü. Yine de ad tabanlı bir parite kapısı iki eşleşme bulur ve hangisini okuyacağı belirsizdir.
  - `prefers-contrast` bloğu yalnız `--surface-deep` ve `--steel-gray` tanımlıyor; DS adıyla çakışma 0.
  - `[data-admin-theme]` yalnız `--admin-*` adlarını tanımlıyor; çakışma 0.
  - **Bilinmeyen:** `tokens/kenar.css` ve `tokens/yuzey.css` okunmadı. Marka handoff'unda `--radius: 0` geçiyor ([handoff/README.md:71](docs/proje-takip/design/marka/handoff/README.md#L71)); sitede `--radius: 0.5rem` var ([index.css:371](src/index.css#L371)). Sitede `var(--radius)` kullanımı 0 olduğundan zararsız bir çakışma, ama **ÖLÇÜLEMEDİ**.
  - DS'in `--surface-*` adları (page, card, subtle, inset, dark, dark-inset, search) sitenin `--surface-*` adlarıyla (deep, darker, darkest, midnight, navy, navy-mid) **kesişmiyor**, çakışma 0.
* **Hangi Kural:** CLAUDE.md #8, cetvel §2.
* **Risk Derecesi:** Yüksek. Çakışan küme yanlışsa INV-TOKEN-PARITE-1'in "ad ad liste" kolu daha ilk gün yanlış kurulur.

### 2.2. Faz 2a "görünmez" değil: `--text-muted` eklemek INV-PALET-1'i KIRMIZIYA düşürür
* **Bulgu:** Plan `--text-muted`'ı eklenecek adlar arasında sayıyor. INV-PALET-1'in "ölü legacy geri gelmemiş" kolu bu adı açıkça yasaklıyor ([marka-palet-tokenlari.test.ts:120](src/__tests__/conformance/marka-palet-tokenlari.test.ts#L120)). Cetvel §2.1 de silinenler listesinde `--text-muted`'ı sayıyor.
* Ek olarak DS'in üç adı, sitede zaten var olan değerlerin ikinci adı olur:
  - `--text-muted` #6B7280 = site `--steel-gray` ([index.css:347](src/index.css#L347))
  - `--warn-amber` = `--marka-amber`
  - `--action-terracotta` ≈ `--marka-kiremit` (1 kanal fark)

  Bu değerler literal HSL olarak ikinci kez yazılırsa cetvel §2'nin "yeni renk kaynağı açılamaz" kuralı çiğnenir. Bunu yakalayan kapı yok: INV-PALET-1'in 3. kolu yalnız Tailwind'deki `marka-*` adlarına bakıyor ([:107](src/__tests__/conformance/marka-palet-tokenlari.test.ts#L107)).
* **Hangi Kural:** INV-PALET-1, cetvel §2, CLAUDE.md #8.
* **Risk Derecesi:** **Kritik.** Kapı kırmızı olduğu için PR merge edilemez. Kolu gevşetmek ise bir Recep kararını (cetvel §2.1) geri almak demek.
* **Çıkış yolu:** DS adları takma ad olarak yazılsın: `--text-muted: var(--steel-gray)`, `--warn-amber: var(--marka-amber)`. INV-PALET-1'in `SILINENLER` listesi yalnız literal tanımı yasaklayacak biçimde daraltılsın; bu dosya ALTYAPI şeridinin (§2.10). Parite kapısı dize değil **çözülmüş RGB** karşılaştırsın.

### 2.3. "Admin DEĞİŞMEMELİ" ölçüt olarak yanlış: Faz 2b admin'i değiştirir
* **Ölçüm (plan bu ölçümü "ön koşul" diye bırakmıştı, sonucu burada):**
  - `[data-admin-theme]` `--primary-navy`, `--brand-cyan` ve `--font-sans` adlarını **ezmiyor**; yalnız `--admin-*` tanımlıyor ([index.css:436](src/index.css#L436)).
  - Admin'de `primary-navy` kullanımı **19**, 4 dosyada. Örnekler: [EditableCell.tsx:114-127](src/components/admin/EditableCell.tsx#L114), [AdminRealtimeNotifications.tsx:229](src/components/admin/AdminRealtimeNotifications.tsx#L229), [inventory/page.tsx:11](src/app/admin/inventory/page.tsx#L11).
  - `text-brand-cyan` kullanımı 1 ([MovementsTableBody.tsx:362](src/views/admin/MovementsTableBody.tsx#L362)).
  - Açık `font-sans` kullanımı 2 ([AdminLayout.tsx:192](src/views/admin/AdminLayout.tsx#L192), [CategoryBuilderView.tsx:298](src/views/admin/CategoryBuilderView.tsx#L298)).
  - Admin de kök `layout.tsx`'in `<body className={inter...}>`'ı altında render ediliyor. Font değişirse **admin'in tamamı** Archivo'ya geçer.
  - Tailwind `fontFamily.mono` DS'e bağlanırsa admin'deki **63 `font-mono`** (33 dosya) IBM Plex Mono'ya döner.
* **Hangi Kural:** planın kendi K-3'ü, admin-design-standard.
* **Risk Derecesi:** Yüksek.
* **Çıkış yolu:** ya admin kasıtlı olarak dahil edilir ve ADMIN kararı Faz 2b'nin **önüne** alınır; ya da `[data-admin-theme]` bloğuna `--primary-navy`/`--brand-cyan` için eski değerler ve `--font-sans` için bir font sabitlenir. İkincisi admin'i eski görünümde "dondurur" ve bunu yazılı bir karara bağlamak gerekir.

### 2.4. "Inter 0" ölçütü, kapsam dışı ilan edilen iki dosyaya dokunmayı gerektiriyor
* **Bulgu:** `\bInter\b` araması 3 dosyada eşleşiyor:
  - [layout.tsx:5,12](src/app/layout.tsx#L12)
  - [InventoryQrLabel.tsx:50,59](src/components/admin/InventoryQrLabel.tsx#L50): admin etiketi, Google Fonts `@import` ile
  - [Product3DViewer.tsx:183](src/components/products/3d/Product3DViewer.tsx#L183): `GizmoViewcube font="bold 50px Inter"`

  Plan K-3'te admin'i, K-4'te 3D'yi kapsam dışı sayıyor, ama "Inter 0" bu iki dosyaya dokunmadan tutmaz.
* Kalıbın kendisi de dar olmalı: çıplak `Inter` araması `Interface`/`Intersection` sözcüklerini de yakalar.
* **Dördüncü aile:** teklif PDF'i Roboto kullanıyor ([pdfGenerator.ts:92-111](src/lib/pdfGenerator.ts#L92)). DS'in "dördüncü aile eklenmez" kuralı bu dosyayı nasıl sayıyor, belirsiz.
* E-posta şablonları Arial/system-ui kullanıyor; Inter 0 (ölçüldü). OG görsel üreticisi (`ImageResponse`) yok.
* **Risk Derecesi:** Orta.

### 2.5. Yazı tipi geçişi: CSP uygun, `latin-ext` doğru, ama önyükleme ve fallback maliyeti yazılmamış
* **CSP:** `font-src 'self' https: data:` ve `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (origin/master `next.config.mjs:202`). `next/font/google` fontu build anında kendi sunucusuna aldığı için `'self'` yeterli. **Engel yok.**
* **Bugünkü Türkçe desteği:** Inter yalnız `subsets: ['latin']` ile yükleniyor. Google'ın `latin` alt kümesi ğ (U+011F) ve ş (U+015F) karakterlerini kapsamıyor, `ı` karakterini kapsıyor. Bugün ğ ve ş fallback fontla çiziliyor. Planın `latin-ext` önerisi **doğru** ve bugünkü bir kusuru da kapatıyor. Bu, "önce" ölçümüne yazılmalı.
* **Performans (kural 10):** planın listesi 3 aile × (4+2+2) = 8 ağırlık × 2 alt küme = **16 woff2 dosyası** eder. `next/font` varsayılanı `preload: true`, yani hepsi LCP yarışına girer.
  - Archivo ve Source Serif 4 değişken font. Ağırlık listesi yerine değişken eksenle yüklenirse aile başına 1 dosya × 2 alt küme olur.
  - Serif ve mono ailesi `preload: false` olmalı; ilk ekranda kullanılmıyorlar.
  - Plan yalnız "bayt ölç" diyor; önyükleme politikası yok.
* **`className` sorunu:** `body` hem `inter.variable` hem `inter.className` taşıyor. `className` `font-family`'yi doğrudan yazar ve `--font-sans`'ı atlar. Geçişte ikisi birlikte değişmeli.
* **Parite ölçülemez:** `--font-sans`'ın index.css'te **tanımı yok**. `next/font` değişkeni `'__Archivo_xxx', '__Archivo_Fallback_xxx'` gibi üretilmiş adlar taşır, DS dizesine (`'Archivo', system-ui…`) asla eşit olmaz. Planın "Bitti: çakışan küme boş" ölçütü `--font-sans` için **ulaşılamaz**. Font adları paritenin dışında ayrı bir kolla ölçülmeli (layout.tsx'te hangi ailenin çağrıldığı).
* **Risk Derecesi:** Orta.

### 2.6. Tailwind eklemeleri: gölgeleme yok, ama iki tuzak ve bir kör kapı var
* **Varsayılan ölçekler:** Tailwind 3.4.19'da `width`, `height`, `min/max-*` ve `size` varsayılanları `...theme('spacing')` ile başlıyor (`stubs/config.full.js:519,641,653,674,685,973,1007`). `extend` anahtarları sonra birleşir ve kazanır.
  - `spacing.page = 40px` eklenirse `max-w-page` yine 100rem kalır ([tokens.js maxWidth.page](src/design-system/tokens.js)). Gölgeleme yok.
  - Ama `w-page` 40px ile `max-w-page` 1600px **aynı adla iki anlam** taşır. Adlar `space-*` önekiyle korunmalı.
* **`extend` şartı:** plan "`spacing`'e" diyor, `theme.extend.spacing` demiyor. `theme.spacing`'e yazılırsa `p-4` gibi bütün varsayılan ölçek silinir. `extend` açıkça yazılmalı.
* **`display` anahtarı:** `fontSize.display` zaten var (akışkan `clamp`, [tokens.js:62](src/design-system/tokens.js#L62)). DS'in `--size-display` değeri (46px) aynı anahtara konursa üzerine yazar. Bugün `text-display` className kullanımı 0 (yalnız bir yorumda geçiyor), yani zarar küçük. Yine de ad çakışıyor.
* **Kör kapı:** INV-TOKEN-SINIF-1 yalnız `h-`, `w-`, `min-*`, `max-*` öneklerini ve SAYI+BİRİM değerleri doğruluyor ([tailwind-token-sinif-gecerliligi.test.ts:83](src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts#L83)). Adlı boşluk sınıflarını (`p-space-card`) ve yazı ölçeği sınıflarını (`text-h1`) **görmez**. Yazım hatalı bir sınıf CSS üretmez ve hiçbir kapı bunu yakalamaz. ⚠SINANMIYOR. INV-TOKEN-SINIF-1'e `p/m/gap/text` önekleri için ad kümesi kolu eklenmeli.
* **Risk Derecesi:** Orta.

### 2.7. K-1 kapısı (rota klasörü 0) tanımsız, URUN'u yanlış kırmızıya düşürür
* **Ölçülebilirlik:** kapı ölçülebilir: `git diff --name-status --diff-filter=ADR <taban>...HEAD -- 'src/app/**/page.tsx' 'src/app/**/route.ts' 'src/app/**/layout.tsx'`.
* **Sorun "Faz 1–5 PR'ı"nın nasıl tanınacağı:** planda etiket, dal öneki ya da dosya kümesi tanımı yok.
  - Kapı genel uygulanırsa URUN'un adres işini kırar. Bugün bile Bilgi Merkezi PR'ı 4 `page.tsx` ekledi (origin/master `0681c9c58`, #1402). `ADRES_SEMASI_K3B` planı `/tr/urunler` gibi yeni adresler getiriyor ([features.ts:113-126](src/config/features.ts#L113)).
  - Kapı genel uygulanmazsa bir TASARIM PR'ının rota eklemesini hiçbir şey durdurmaz.
* **Galeri istisnası** kapının içine adıyla çakılmalı.
* **Middleware:** `/ds-galeri` dil öneki olmadan gelirse dil ekleme koluna düşer (308). `/[lang]/ds-galeri` doğrudan geçer. Sorun yok.
* **robots ve sitemap:** robots `disallow` listesinde galeri yok ([robots.ts:10](src/app/robots.ts#L10)). Sitemap açık listeyle çalışıyor. Galeri `generateMetadata` ile `robots: noindex` yazmazsa `[lang]` varsayılanını miras alır ve dizine açık kalır. Bu kolun kapıya yazılması gerekiyor.
* **Faz 4(2) çelişkisi:** "adres işiyle aynı yayında" hükmü karar 118'in "adres önce" sırasıyla çelişiyor. Görünüm ve adres aynı sürümde değişirse geri almak iki şeyi birden geri alır.
* **Risk Derecesi:** Yüksek.

### 2.8. DS kopyası + `token-turet.mjs`: kural 8 uyumlu, ama tazelik kolu sahte yeşil
* **Kural 8:** kopya içe aktarılmazsa bir çalışma zamanı renk kaynağı değildir. Tailwind `content` yalnız `ts`/`tsx` okuyor, knip `project` yalnız `ts`/`tsx`/`js`/`jsx` ([knip.json](knip.json)). Kural 8 ihlali yok; ama bu dosyalar knip'e de lint'e de görünmez.
* **Lint:** `scripts/**` ESLint'te yok sayılıyor ([eslint.config.cjs:124](eslint.config.cjs#L124)), yani `token-turet.mjs` hiç lint'lenmez. ESLint HEX yasağı yalnız admin JSX'inde çalışıyor ([:154-161](eslint.config.cjs#L154)). Kopyadaki HEX yorumları kapıya takılmaz.
* **Sahipsiz dizin:** `scripts/design/**` panoda hiçbir şeridin claim'inde değil. ALTYAPI yalnız `scripts/*.*` ve belirli alt dizinleri tutuyor.
* **Tazelik:** "kopya damgası > türev damgası" kolu iki damgayı da aynı betik aynı anda yazdığı için **her zaman yeşildir**. Plan CI'ın Design'a erişemediğini dürüstçe yazıyor. Ama bu kolun "tazelik" adını taşıması yanıltıcı; adı "türev kopyayla tutarlı mı" olmalı.
* **Asıl ölçülmesi gereken:** `token-turet.mjs`'i koşunca index.css'te **fark 0** çıkıyor mu. Yani türev bloğu elle değiştirilmemiş mi. Bu kol planda yok.
* **DS yuvarlama kayması:** DS'in HSL değerleri yuvarlatılmış.
  - `219 48% 20%` #1B2C4B verir, #1A2B4A değil.
  - `24 91% 39%` #BE5109 verir; K25-b'nin #BF5309'undan 2 kanal uzak. INV-TOKEN-AA-RENK-1'in ≤2 payının tam sınırında.

  DS değeri sitenin daha hassas değerinin üzerine kopyalanırsa kapalı karar değerinden uzaklaşılır. Parite dizeyle değil RGB ve toleransla karşılaştırmalı. Yönü de şu olmalı: sitenin kapıyla korunan değeri kazanır, DS'e düzeltme geri gönderilir.
* **Risk Derecesi:** Orta.

### 2.9. S2: planın yazmayı önerdiği şeyler depoda var mı
* **Yok (ölçüldü, 0 eşleşme):** `src/components/ds/`, `ds-galeri`, `ds-kaynak`, `token-turet`, `scripts/design/`, INV-TOKEN-PARITE.
* **Zaten var:**
  - DS'in lacivert ve turkuaz değerleri `--marka-*` adıyla ([index.css:300-303](src/index.css#L300)). Faz 2b'nin doğru hamlesi `--primary-navy: var(--marka-lacivert)` olabilir. Böylece değer tek kaynakta kalır ve INV-PALET-1 korumasını otomatik miras alır.
  - `KabukBandi`, Faz 1'in `StickyHeader`'ıyla aynı işi görüyor (URUN'un dosyası). Faz 3'te ayrıca yazılırsa iki kabuk uygulaması doğar.
  - `Kart` ile `ProductCard`/`FamilyCard` yakın işlevli.
* **`ui/` mi `ds/` mi:** `src/components/ui/` gerçekten 4 dosya taşıyor (Pagination, ScrollObserver, Skeleton, VentImage). Planın `ds/` gerekçesi ölçümle tutuyor. Karar Ops emriyle çelişiyor, yani **sapma emri verene yazılmalı**.
* **Risk Derecesi:** Orta.

### 2.10. Sahiplik: "URUN'un geniş `src/**` claim'i" yanlış tarif; iki şerit daha etkileniyor
* **Ölçüm (`board.cjs who`, 2026-09-25):**
  - URUN'un claim'i `src/**` değil, dizin listesi: `src/app/**`, `src/components/**`, `src/design-system/**`, `src/config/**`, `next.config.mjs`, `src/middleware.ts` ve diğerleri.
  - `src/index.css` ve kökteki `tailwind.config.js` **kimsenin claim'inde değil**.
  - **`src/__tests__/conformance/**` ALTYAPI'nın.** INV-TOKEN-PARITE-1, INV-DS-PROP-1 ve INV-PALET-1 değişikliği (§2.2) bu şeridin dosyaları.
  - `package.json` da ALTYAPI'nın; betik komutu eklenirse bu dosyaya dokunulur.
  - Planın §5'i ALTYAPI'yı hiç anmıyor.
* **Risk Derecesi:** Orta (şerit çakışması).

### 2.11. CSS değişikliği ISR sayfalarına nasıl yayılır
* **Bulgu:** vitrin sayfaları "statik + talep üzerine ISR" sınıfında (rendering-cache §1).
  - Build anında üretilen HTML, kendi build'inin hash'li CSS adresini gömer. Her Vercel dağıtımı yeniden build edildiği için yeni dağıtımın ürettiği sayfalar yeni CSS'i taşır.
  - Açık soru: dağıtımdan sonra talep üzerine üretilen ya da önceki dağıtımdan önbellekte kalan bir HTML'in eski CSS adresini gösterip göstermediği. Vercel belgesinde kesin bir ifade bulamadım (`search_vercel_documentation`, ISR/deploy). **ÖLÇÜLEMEDİ.**
* **Önerilen ölçüm:** Faz 2b dağıtımından sonra 3 ISR adresinde (ana sayfa, kategori, PDP) `curl` ile `<link rel=stylesheet>` hash'i yeni build'inkine eşit mi.
* **Risk Derecesi:** Düşük. En kötü durumda eski görünüm geçici olarak kalır, stil kırılmaz.

### 2.12. Diğer
* **Bayrak ile önizleme:** bayraklar derleme sabiti ve kilit testleri `= false` bekliyor. Faz 1'in "önizlemeli" adımı ve galeri bayrağı için yöntem yazılmalı: önizleme dalında `true` + kilit testlerinin o dalda beklenen kırmızısı, ya da ortam değişkeni. Galerinin yeni bayrağının kendi kilit testi yok. ⚠SINANMIYOR.
* **Gradyan karışımı:** 21 gradyan kullanımı (15 dosya) `from-primary-navy to-secondary-blue` biçiminde. `--secondary-blue` DS'te yok. Faz 2b'den sonra DS laciverdi DS dışı bir maviye akar. Faz 2b'nin önce/sonra görüntü listesine en az bir gradyan yüzeyi eklenmeli.

## 3. Stratejik Öneriler ve Aksiyon Planı

1. **Çakışan kümeyi burada ölçülen hâliyle yazın** ve kapıya ad ad çakın: `--primary-navy`, `--brand-cyan`, `--action-terracotta-deep`, `--font-sans` (font ayrı kol). `--radius` ile `kenar.css`/`yuzey.css`, okunana kadar ÖLÇÜLEMEDİ olarak kalsın. `.light` bloğunu ya kapının dışında tutun ya da ölü olduğu için silin; silme ayrı kayıt olsun.
2. **Faz 2a'da takma ad kullanın, literal yazmayın.** `--text-muted: var(--steel-gray)`, `--warn-amber: var(--marka-amber)`, `--action-terracotta: var(--marka-kiremit)`. INV-PALET-1'in `SILINENLER` kolu yalnız literal tanımı yasaklayacak biçimde daraltılsın; bu ALTYAPI ile yapılır. Parite **çözülmüş RGB ≤2** ile karşılaştırsın.
3. **Faz 2b'de `--primary-navy: var(--marka-lacivert)` ve `--brand-cyan: var(--marka-turkuaz)` yazın.** Kapalı karar değeri tek kaynakta kalır, DS'in yuvarlama kayması siteye taşınmaz.
4. **Admin kararını Faz 2b'nin ön koşulu yapın**, önce/sonra satırı 19 renk + 2 font + 63 mono kullanımıyla. Admin dondurulacaksa `[data-admin-theme]` altında eski değerler sabitlenir ve bu `admin-design-standard`'a yazılır.
5. **"Inter 0" ölçütünü `\bInter\b` kalıbıyla yazın** ve 3D (`Product3DViewer`) ile admin QR etiketini kapsama açıkça alın ya da ölçütten açıkça çıkarın. Roboto (PDF) için DS'in "dördüncü aile yok" kuralına bir istisna satırı ekleyin.
6. **Font:** değişken eksenle yükleyin; serif ve mono `preload: false`. `inter.className` ile `inter.variable` birlikte değişsin. "Önce" ölçümüne bugünkü ğ/ş fallback kusurunu yazın.
7. **Tailwind:** `theme.extend.spacing` açıkça yazılsın, anahtarlar `space-*` önekiyle. `fontSize.display` çakışması için DS anahtarına ayrı bir ad verin. INV-TOKEN-SINIF-1'e adlı `p/m/gap/text` kolu ekleyin.
8. **K-1:** "Faz PR'ı" tanımını dal öneki (`tasarim/*`) ile yazın ve galeriyi adıyla istisna edin. Faz 4(2)'yi adres yayınından **sonraya** alın.
9. **Galeri:** `generateMetadata` içinde `robots: { index: false }` + kilit testi + bayrak kilidi. Görsel kapının bayrak kapalıyken neyi ölçtüğünü yazın.
10. **Sahiplik §5'e ALTYAPI'yı ekleyin:** `src/__tests__/conformance/**` ve varsa `package.json`. `scripts/design/**` için claim açılsın. URUN'un claim tarifini düzeltin.
11. **Tazelik kolunun adı düzeltilsin** ("türev kopyayla tutarlı"). Yerine "`token-turet` koşunca fark 0" kolu eklensin.
12. **Faz 3'te `KabukBandi` Faz 1'in `StickyHeader`'ına bağlansın** (tek kabuk). `ds/` sapması Ops'a bildirilsin.

## 4. Sonuç

**Genel risk: KOŞULLU.**

Planın yönü doğru. Faz 2a/2b ayrımı ve `latin-ext` kararı ölçümle tutuyor. Engelleyici olan tek bulgu var ve yazıldığı hâliyle uygulanırsa PR'ı durdurur: Faz 2a'nın `--text-muted` eklemesi INV-PALET-1'i kırmızıya düşürür (Kritik). Planın iki temel iddiası da ölçümle çürüdü: "Faz 2b'de admin değişmez" ve "çakışan küme 2-3 ad". Bu iki nokta ve §3'teki 1-5. maddeler plana işlendikten sonra plan PASS'e çıkar.

DURUM: CEKINCELI
SEBEP: `tokens/kenar.css` ile `tokens/yuzey.css` okunamadı ve Vercel ISR'da dağıtım sonrası CSS yayılımı belgeyle kesinleşmedi. Bu yüzden çakışan kümenin `--radius`/kenar/yüzey kısmı ve §2.11 ÖLÇÜLEMEDİ.
DENENEN: yerel eski DS kopyası tarandı; `--radius` yalnız marka handoff'unda geçiyor (`0`). Vercel belgesi arandı, kesin ifade bulunamadı.
ÖNERİ: TASARIM iki dosyayı DesignSync ile okuyup çakışan kümeyi tamamlasın. Faz 2b dağıtımından sonra 3 ISR adresinde CSS hash'i `curl` ile ölçülsün (TASARIM).
