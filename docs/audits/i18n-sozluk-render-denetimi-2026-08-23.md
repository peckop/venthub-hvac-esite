# i18n Sözlük / Render Denetimi — 2026-08-23

> **Tür:** ölçüm (salt-okuma). Kod değişikliği YOK, DB yazımı YOK.
> **Cetvel:** `docs/standards/i18n-localization-standard.md` — bulgular §2 Mutlak Kurallar ve
> §3 Drift Eksenleri tablosuna bağlanmıştır.
> **Şerit:** I18N · **Dal:** `audit/i18n-sozluk-denetimi` · **Taban:** `ef281ae0`
> **Ölçüm aracı:** geçici vitest betiği (sözlük ağacı + kaynak taraması) + canlı DB (salt okuma) + `knip`.

---

## 0. Yönetici Özeti

| Kol | Bulgu | Güven |
|---|---|---|
| (a) Ölü sözlük anahtarı | **64 anahtar / 7 ad-alanı** — ad-alanının adı kaynakta hiç geçmiyor | **kesin** (tek tek grep) |
| (a) İkincil | **178 anahtar** canlı ad-alanları içinde referanssız | **eyeball gerekir** |
| (b) Hardcoded metin | **125 kullanıcı-görünür sabit TR metin / 32 dosya** | ölçüldü |
| (b) Yapısal | `applications` özelliği **üç katman birden ölü** (sözlük + config + UI yardımcısı) | **kesin** |
| (c) Vaat ≠ veri | **7 kategori** sözlükte var, arkasında **0 aktif ürün** | **kesin** (canlı DB) |
| (c) Ters yön | `sub.dehumidifier` sözlükte YOK → **EN vitrine Türkçe sızıyor** | **kesin** |

**Tek cümlelik mekanizma:** Cetvelin §3 tablosunda **INV-5** var ama o yalnız
**ÇAĞRI → SÖZLÜK** yönünü tarıyor. Ters yön (**SÖZLÜK → ÇAĞRI**) ve
**SÖZLÜK ↔ VERİ** eksenleri kapısız; bu yüzden üç bulgu sınıfı da sessizce birikiyor.

---

## 1. Yöntem ve aracın sınırları

Sözlük ağacı yaprağa kadar gezildi (**4465 yaprak**, `tr`); her yaprak için kaynakta
referans arandı. Referans **beş ayrı eksende** arandı — çünkü tek eksen ölçmek
sahte-pozitif üretiyor:

| eksen | desen | neden gerekli |
|---|---|---|
| statik çağrı | `t('a.b.c')` | ana yol (INV-5 ile aynı) |
| şablon önek | `` t(`a.b.${x}`) `` | dinamik anahtar |
| obje erişimi | `dict.a.b` | `t()` ATLANIYOR |
| veri anahtarı | `labelKey: 'admin.menu.orders'` | anahtar string VERİSİ olarak yaşıyor |
| ad-alanı teması | `.whatsappMessages` | cast'li erişim (zayıf işaret) |

**Aracın bilinçli körlükleri** (kapsam kısıtı olarak yazıyorum, sessiz tavan değil):

- Değişkenle kurulan anahtarın yaprağı statik doğrulanamaz — bu yüzden dinamik önek
  altındaki 370 yaprak "canlı" sayıldı, tek tek kanıtlanmadı.
- `dict.a.b` görülünce **altındaki tüm yapraklar** canlı sayıldı (`const p = dict.a.b`
  sonrası `p.title` taramaya görünmez). Bu, ölü sayısını **eksik** tahmin ettirir — yani
  yanılma yönü güvenli taraf.
- Testler ve sözlük dosyalarının kendisi kapsam dışı (tanım ≠ kullanım).

---

## 2. Kendi bulgumu çürütme — dört kör noktam

İlk sayım **1050** idi. Yayımlamadan önce listeyi çürütmeye çalıştım; **dört ayrı kör
noktam** çıktı ve sayı **227**'ye indi. Sırasıyla:

| # | kör nokta | kanıt | etki |
|---|---|---|---|
| 1 | `dict.a.b` doğrudan obje erişimi | 19 dosya (`HowItWorks.tsx:19`, `CategoryShowcaseView.tsx:170`…) | 1050 → 823 |
| 2 | anahtar **veri** olarak yaşıyor | `src/config/admin-resources.ts:77` `labelKey: 'admin.menu.dashboard'` | 27 `admin.menu.*` sahte-ölü |
| 3 | cast'li erişim | `src/utils/whatsapp.ts:30` — `whatsappMessages` tablo olarak indeksleniyor | **12 anahtarın tamamı sahte-pozitifimdi, CANLI** |
| 4 | tek-segmentli şablon öneki | `` `roles.${x}` `` — regexim ≥2 segment istiyordu | önek sınıfı tamamen kaçıyordu |

**Beşinci çürütme, kolun kendisine karşı:** (c) kolunda "sözlük ATEX ve sessiz kanal
vaat ediyor, katalogda var mı" diye ürün ADINDA regex aradım ve `0 ürün` buldum.
Bu **yanlış** ölçümdü — ürün adları kavramı içermiyor, üyelik **kategoride**. Kategori
üyeliğinden sayınca ATEX **14**, hava perdesi **8**, ısı geri kazanım **16** çıktı.
İlk sonucu raporlasaydım var olan katalog "yok" görünecekti.
→ [[measurement-tool-fails-in-a-direction]] sınıfı; araç yanlış-negatife yanıldı.

---

## 3. (a) Ölü sözlük anahtarları

### 3.1 KESİN — ad-alanının adı kaynakta hiç geçmiyor

Her biri ayrıca `grep -rn "<ad>" src` ile tek tek doğrulandı (sınıflandırmaya
güvenilmedi).

| ad-alanı | anahtar | grep isabeti | not |
|---|---|---|---|
| `homeGallery` | 16 | **0** | — |
| `applications` | 10 | 10 → **hepsi ilgisiz** (`config/applications`, `calculators.airCurtain.applications`) | aşağıya bak |
| `homeSpotlight` | 10 | **0** | — |
| `homeFaq` | 9 | **0** | — |
| `homeTrust` | 8 | **0** | — |
| `resources` | 6 | 6 → **hepsi `admin-resources`** | kelime çakışması |
| `categories` | 5 | 309 → hepsi `.from('categories')` Supabase sorgusu | kelime çakışması |
| **toplam** | **64** | | |

### 3.2 `applications` — üç katman birden ölü (bu kolun asıl bulgusu)

Sözlükteki `applications.*` anahtarları **tesadüfen** ölmemiş. Aynı üç kalem —
otopark, hava perdesi, ısı geri kazanım — `src/config/applications.ts` içinde
**sabit Türkçe** olarak yeniden yazılmış:

```
applications.parking.title        (sözlük, ölü)
APPLICATION_CARDS[0].title = 'Otopark Havalandırma'   (config, sabit TR)
```

Ölçüm: `APPLICATION_CARDS` **export edilmemiş** ve hiçbir yerde kullanılmıyor;
`src/utils/applicationUi.tsx` modülünü de kimse import etmiyor. Yani sözlük anahtarı,
onun yerine geçen config ve config'in UI yardımcısı — **üçü de ölü**.

Sözlükte ayrıca hem `air-curtain` hem `airCurtain` (kebab **ve** camel ikizi) duruyor:
kaldırılmış bir slug-anahtarlı aramadan arta kalma izi.

**HALEFİ ÖLÇÜLDÜ — kaldırma güvenli.** Aynı kavramın **canlı** uygulaması ayrı bir yerde
yaşıyor: `src/components/home/ApplicationSolutions.tsx`, ana sayfada
`src/views/HomePage.tsx:54` üzerinden render ediliyor ve metnini
**`home.applicationSolutions`** ad-alanından (24 anahtar, canlı) alıyor. Bileşenin kendi
`solutions` dizisi var; `config/applications.ts`'i **import etmiyor**.

Yani tablo şu: kavram bir kez sözlüğe (`applications`), bir kez sabit config'e
(`APPLICATION_CARDS`), bir kez de yeni ad-alanına (`home.applicationSolutions`) yazılmış.
**Üçüncüsü canlı, ilk ikisi ölü.** Bu, §3.1'deki `applications` satırının neden ölü
olduğunu açıklıyor: anahtar unutulmadı, **yerine yenisi yazıldı ve eskisi bırakıldı**.

> **`knip` bu sınıfa kapı DEĞİL — ölçüldü.** `knip` `src/config/applications.ts` için
> yalnız kullanılmayan **tipi** (`ApplicationCard`) bildiriyor; ölü sabiti ve ölü modülü
> bildirmiyor. Sebep: dosya `src/config/index.ts` barrel'ından `export *` ile yeniden
> yayımlanıyor, bu da modülü "erişiliyor" gösteriyor. **Barrel, ölü kodu canlı gösteriyor.**

### 3.3 EYEBALL GEREKİR — canlı ad-alanları içinde 178 tekil anahtar

Kesin bulguyla **karıştırılmamalı**; bunlar tek tek doğrulanmadı.

| ad-alanı | şüpheli / toplam |
|---|---|
| `admin` | 315 / 1850 |
| `lead` | 52 / 88 |
| `category` | 47 / 278 |
| `common` | 42 / 141 |
| `aboutPage` | 40 / 70 |
| `account` | 37 / 316 |
| `pdp` | 33 / 229 |
| `contactPage` | 26 / 55 |

(Bu tablodaki sayı `dead` + `ns-touched` toplamıdır; `ns-touched` sınıfı **zayıf** —
`.common`, `.products` gibi jenerik property adları her yerde geçtiği için gürültülü.
Kesin sınıf yalnız §3.1'dir.)

---

## 4. (b) Sözlük yerine sabit basan metinler

Yorumlar soyulduktan sonra, **kullanıcı-görünür konumda** (etiket/başlık/`return`/JSX
değeri) Türkçeye özgü karakter taşıyan string: **125 adet / 32 dosya**.
(Konum filtresiz ham sayı 225 / 67 dosya — aradaki fark yorum ve iç log/hata metni.)

| dosya | adet | sınıf |
|---|---|---|
| `src/views/BrandDetailPage.tsx` | 19 | **vitrin sayfası** — marka anlatısı tamamen sabit TR |
| `src/data/brands.ts` | 14 | vitrin verisi (marka açıklaması, ülke, uzmanlık) |
| `src/utils/productHelpers.ts` | 14 | `translateSpecKey` küratörlü harita — bilinen sınıf |
| `src/config/legal.ts` | 8 | hukuki metin başlıkları |
| `src/components/admin/authority-builder/AuthorityBuilder.tsx` | 6 | admin (cetvel §3-C'de **ertelenmiş** kabul) |
| `src/config/applications.ts` | 6 | **ölü** (§3.2) |
| `src/lib/hvacCalculations.ts` | 5 | hesap çıktısı etiketleri |
| `src/lib/pdfGenerator.ts` | 5 | PDF yüzeyi |
| `src/components/products/3d/types/SilentChannelFanModel.tsx` | 4 | 3D sahne etiketi |
| `src/lib/orderStatusService.ts` | 4 | sipariş durum metni |

**Cetvel bağlantısı:** §2 Kural 1 (hardcoded string yasak). §3 tablosunda C ekseni
zaten ⚠️ KISMÎ — "admin (~256) + legal (~235) ertelendi". Bu ölçüm, ertelenen iki
kümenin **dışında** kalan vitrin yüzeylerini gösteriyor: `BrandDetailPage` + `data/brands.ts`
= **33 metin**, marka sayfaları EN dilinde Türkçe basıyor.

**Neden mevcut kapı yakalamıyor:** C ekseninin bekçisi `react/jsx-no-literals` — JSX
metin düğümünü tarar. Buradaki metinler JSX'te değil, **veri/ helper dönüşünde**
(`data/brands.ts` dizisi, `translateSpecKey` haritası, `config/*.ts` sabitleri).
Kural yazılı, ama bu konuma **erişmiyor**. → [[rule-written-but-unreachable]] deseninin
aynısı.

---

## 5. (c) Sözlüğün VAAT edip verinin karşılamadığı yerler

Canlı DB, salt okuma. `categories` × `products` (yalnız `status='active'`).

### 5.1 Sözlükte listeli, arkasında 0 aktif ürün olan kategoriler

| `translation_key` | ad | seviye | aktif ürün |
|---|---|---|---|
| `parking-jet` | Otopark Jet Fanları | **0 (üst)** | **0** |
| `ac` | Air Conditioning | 0 (üst) | 0 |
| `hygiene` | Hygiene and Sanitizer | 0 (üst) | 0 |
| `summer` | Summer Ventilation | 0 (üst) | 0 |
| `sub.jet` | Jet Fans | 1 | 0 |
| `sub.window` | Cam ve Pencere Tipi Fanlar | 1 | 0 |
| `sub.conditioning` | İklimlendirme Çözümleri | 1 | 0 |

**En keskin olanı `parking-jet`:** üst-seviye bir kategori, **0 ürün ve 0 alt kategori**.
Ana sayfa metni ise bunu açıkça vaat ediyor —
`src/i18n/dictionaries/tr.ts:508`: *"Otopark jet fan sistemleri, mutfak egzoz
çözümleri…"*. Kullanıcı vaadi okuyup tıklıyor, boş kategoriye düşüyor.

### 5.2 Ters yön: veri var, sözlük yok → **EN vitrine Türkçe sızıyor**

DB'de **31** kategori var, sözlükte `common.categoryList.*` altında **30** anahtar.
Eksik olan tek kalem:

```
translation_key : sub.dehumidifier
name            : Dehumidifiers
menu_label      : Nem Alma
aktif ürün      : 3
sözlük anahtarı : common.categoryList.sub.dehumidifier  →  YOK
```

`src/utils/categoryHelpers.ts:26` `getCategoryDisplayName` zinciri: sözlük → `menu_label`
→ `name`. Anahtar bulunmadığı için **2. basamağa** düşüyor ve `menu_label` dönüyor.
`menu_label` **tek kolon, dil-farkında değil** — dolayısıyla:

- **TR vitrin:** "Nem Alma" ✓ (kusur maskeleniyor)
- **EN vitrin:** "Nem Alma" ✗ — **İngilizce sayfada Türkçe kategori adı**

Cetvel §4 DoD bunu açıkça yasaklıyor ("TR=EN sızıntısı yok"). Kusur, `menu_label`
fallback'i tarafından **TR'de görünmez** kılındığı için bugüne kadar fark edilmemiş.

### 5.3 ÇÜRÜTÜLDÜ — "sözlük ATEX/sessiz kanal vaat ediyor ama katalog boş"

Bu iddiayı kurdum ve **kendi ölçümüm yalanladı**. Ayrıntı §2'de: ürün ADINDA regex
aramak yanlış eksen. Kategori üyeliğinden sayınca ATEX **14**, hava perdesi **8**,
ısı geri kazanım **16**, kanal tipi fanlar **36** aktif ürün. **Vaat karşılanıyor.**
Raporda tutuyorum ki aynı yanlış ölçüm tekrar kurulmasın.

---

## 6. Cetvel boşluğu — asıl kalıcı bulgu

`i18n-localization-standard.md` §3 tablosuna göre A/B/D/E/G eksenleri ✅ KAPALI.
Bu denetimin üç kolu da **tabloda satırı olmayan** eksenlerde yaşıyor:

| eksen | yön | kapı | durum |
|---|---|---|---|
| G (mevcut, INV-5) | çağrı → sözlük | `i18n-key-resolution.test.ts` | ✅ kapalı |
| **yeni: H** | **sözlük → çağrı** (ölü anahtar) | — | ❌ **açık** |
| **yeni: I** | **sözlük ↔ veri** (kategori/rota karşılığı) | — | ❌ **açık** |
| C (mevcut, kısmî) | JSX literal | `jsx-no-literals` | ⚠️ **veri/helper konumuna erişmiyor** |

INV-5'in tek yönlü olması tesadüf değil: ham-anahtar render **görünür** bir bug,
ölü anahtar ise **görünmez**. Görünmeyen sınıf kapı almamış, o yüzden birikmiş.

---

## 7. Öneri (iş emri değil — fix koordinasyonu OPS'ta)

1. **Yalnız §3.1'deki 64 anahtarı** kaldır. §3.3'teki 178'i **kör silme** — eyeball şart.
2. `applications` özelliğini üç katman birlikte kaldır (sözlük + `config/applications.ts`
   + `utils/applicationUi.tsx`); barrel `export *` ölüyü canlı gösterdiği için knip'e güvenme.
3. **`common.categoryList.sub.dehumidifier` ekle (TR+EN)** — bu, kullanıcıya bugün yanlış
   dil gösteren tek kalem; en ucuz ve en görünür düzeltme.
4. **Yeni kapı (H ekseni):** sözlük → çağrı. Ölçüm betiği bu denetimde yazıldı; kalıcı
   INV testine dönüştürülebilir. **Kapıyı bilerek bozarak kanıtla** ve **mevcut ihlalle
   açma** — 178'lik sınıf temizlenmeden kapı kırmızı doğar.
5. **`parking-jet` boş üst-kategori** ÜRÜN şeridinin kararı: ya ürün girilir ya vitrinden
   kaldırılır. Sözlük metni onu vaat ettiği sürece boş kategori kullanıcı vaadini bozar.

---

## 8. Ölçümün tazeliği

Bu rapor `ef281ae0` tabanında ve **2026-08-23** tarihli canlı DB anlık görüntüsüyle üretildi.
Ürün/kategori sayıları veri girildikçe **değişir**; §5'teki "0 aktif ürün" satırları
karar öncesi **yeniden ölçülmelidir**. Kod tarafındaki sayılar (§3, §4) dal ilerledikçe kayar.
