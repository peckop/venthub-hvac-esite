# T146-VH — Locale'siz Kasa Çevirimi: Envanter, Düzeltme ve Kapı

> **Şerit:** I18N · **Cetvel:** `docs/standards/i18n-localization-standard.md` — eksen **C**
> (yeni eksen **J** / INV-8 satırı ALTYAPI şeridinde eklenecek — hazır metin §8'de; o dosya bu PR'da DEĞİŞMEZ)
> **Öncül ölçüm:** `docs/audits/kasa-ve-siralama-denetimi-2026-08-23.md` (eksen C)
> **Tarih:** 2026-08-23

---

## 0. Bir cümlede

`toLowerCase()` / `toUpperCase()` **locale'den bağımsızdır**; Türkçe'de sessizce yanlış
harf üretirler. 105 üretim çağrısının **hangilerinin kullanıcı metnine dokunduğu** tek tek
ölçüldü: **23'ü** kullanıcı-metni sınıfında, **82'si** teknik dize (doğru kullanım).
Beş yer düzeltildi, kalan 23 ihlal **mandal** ile donduruldu, kapı (INV-8) yazıldı ve
**iki yönden bilerek bozularak** sınandı.

---

## 1. Önceki belgenin DÜZELTİLEN iddiası

Öncül denetim eksen C'yi *"Türkçe arama ürünü bulamıyor"* diye başlıklandırmıştı.
Bu **fazla genişti** ve ölçülmeden yazılmıştı. Ölçüm:

```
src/components/SearchOverlay.tsx  →  getSearchSuggestions(...)
src/lib/services/product.service.ts:35  →  supabase.rpc('get_search_suggestions', ...)
src/lib/services/product.service.ts:56  →  supabase.rpc('fts_search_products', ...)
```

`SearchOverlay.tsx` içinde **hiç** kasa çevirimi yok. **Ana vitrin araması Postgres'e
gider** (Türkçe FTS) — bu ailenin içinde değildir. Oranın doğruluğu DB collation'ı ve FTS
sözlüğüyle ölçülür; ayrı iş, ayrı kapı.

Bu ailede **gerçekten** müşteriye dokunan yüzeyler şunlardır:

| Yüzey | Dosya | Kusur |
|---|---|---|
| Siparişlerim → ürün filtresi | `src/views/OrdersPage.tsx:215` | ✅ düzeltildi |
| Bilgi merkezi araması | `src/views/knowledge/HubPage.tsx:42` | ✅ düzeltildi |
| Arama sonucu vurgulama | `src/utils/searchHighlight.tsx:23` | ✅ düzeltildi |
| Kategori CTA cümlesi | `src/components/category/sections/BottomCTA.tsx:58` | 🔴 ÜRÜN şeridinde |

---

## 2. Kanıt (node ile koşuldu)

```js
// 1) Müşteri "sığınak" yazıyor, kayıt büyük harfle girilmiş
'SIĞINAK FANI'.toLowerCase().includes('sığınak')                 // false  ← BULAMAZ
'SIĞINAK FANI'.toLocaleLowerCase('tr').includes('sığınak')       // true

// 2) Bilgi merkezi: 'İ' ile başlayan başlık
'İç Hava Kalitesi'.toLowerCase().includes('iç hava')             // false  ← BULAMAZ

// 3) EKRANA BASILAN cümle (BottomCTA)
'İç Ortam Fanları'.toLowerCase()        // "i̇ç ortam fanları"  ← görünür bozukluk (U+0307)

// 4) Admin kategori listesi (CategoriesTableBody)
'Sirkülasyon Fanları'.toUpperCase()     // "SIRKÜLASYON FANLARI"  ← 'İ' olmalıydı

// 5) CSV içe alım: kategori eşleşmesi
'Sığınak Fanları'.toLowerCase() === 'SIĞINAK FANLARI'.toLowerCase()   // false ← YANLIŞ KATEGORİ
```

---

## 3. SÜRPRİZ BULGU — CSV slug üretimi Türkçe adı kırpıyor

`src/components/admin/products/ProductCsvImport.tsx:108`

```js
const slug = (n) => n.trim().toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')
slug('Sığınak Fanı')      // "snak-fan"     ← ı, ğ, ı SİLİNDİ
slug('Çatı Fanı')         // "at-fan"       ← Ç, ı SİLİNDİ
slug('İç Ortam Fanı')     // "i-ortam-fan"  ← ç, ı SİLİNDİ
```

`\w` yalnız `[A-Za-z0-9_]`'dir; Türkçe harfler **harf çevrimi yapılmadan atılır**.
Bu kasa kusuru değil, **veri bozulması** sınıfıdır.

**Ama gerçekleşmemiştir — ölçüldü.** Canlı DB'de (salt-okunur):

```sql
select count(*) filter (where slug ~ '[çğıöşüÇĞIİÖŞÜ]') , count(*) from products …
→ products 0/374 · categories 0/31 · product_families 0/38
```

ve örnek satırlar doğru harf çevrimi gösteriyor:

```
"12 KW ELEKTRİKLİ ISITICI"        → 12-kw-elektrikli-isitici-13034
"FC-101 … Frekans Konvertörü"     → fc-101-380v-3kw-frekans-konvertoru-80104
"SULU BATARYA … KANAL TİPİ"       → sulu-batarya-11-kw-kanal-tipi-…
```

Yani mevcut katalog **bu fonksiyonla üretilmemiştir** (üreten, depo dışındaki içe-alım
hattıdır). `ProductCsvImport.tsx:108` **latent** bir kusurdur: bugün zarar vermiyor, admin
panelinden ilk CSV içe alımında verir. Uygulama içinde **tek** slug üreticisi budur; ortak
bir `slugify` yardımcısı yoktur.

**Sahip: ADMIN/ÜRÜN.** Bu belge kusuru kaydeder, düzeltmez.

---

## 4. Envanter — 105 üretim çağrısı nasıl ayrıldı

| Sınıf | Adet | Örnek |
|---|---|---|
| **Teknik dize** (locale'siz DOĞRU) | 82 | slug · SKU · para birimi · durum enum'u · hex kimlik · DOM `tagName` · `accept-language` · spec anahtarı · rol · taşıyıcı · sağlayıcı |
| **Kullanıcı metni** (locale gerekli) | 23 | ürün/kategori/gün adı · arama terimi · başlık+özet · avatar baş harfi |

Test dosyalarındaki 16 çağrı kapsam dışıdır (121 ham − 16 = 105).

### 4.1 Bu PR'da DÜZELTİLEN (5 dosya)

| Dosya | Ne yapıldı |
|---|---|
| `src/hooks/useAdminTable.ts` | tüm admin tablo aramaları `foldForSearch` |
| `src/views/OrdersPage.tsx` | müşteri sipariş ürün filtresi `foldForSearch` |
| `src/views/knowledge/HubPage.tsx` | bilgi merkezi araması `foldForSearch` |
| `src/utils/searchHighlight.tsx` | vurgulama dile duyarlı + aksan duyarsız yeniden yazıldı |
| `src/views/admin/AdminLayout.tsx` | avatar baş harfi `localeUpper` |

### 4.2 DONDURULAN 23 ihlal (14 dosya) — INV-8 mandalı

**Teknik yanlış-pozitif (6 çağrı / 6 dosya)** — kayıt amaçlı donmuştur, düzeltme gerekmez:
sertifika kodu · Lucide ikon adı · dosya formatı · sipariş kodu + kimlik dilimi ·
kullanıcı kimliği dilimi · DOM `nodeName`/`tagName`.

**GERÇEK kusur (17 çağrı / 8 dosya)** — sahibi kendi şeridinde kapatacak:

| Dosya | Adet | Sahip | Bedeli |
|---|---|---|---|
| `src/views/admin/AdminInventoryReportPage.tsx` | 6 | ADMIN | ürün adı araması boş döner |
| `src/components/admin/CommandPalette.tsx` | 2 | ADMIN | komut araması Türkçe etiketi bulamaz |
| `src/components/admin/products/ProductCsvImport.tsx` | 2 | ADMIN/ÜRÜN | kategori eşleşmez + slug kırpılır (§3) |
| `src/components/category/sections/BottomCTA.tsx` | 1 | **ÜRÜN** | **MÜŞTERİ EKRANI**: "i̇ç ortam fanları" |
| `src/views/admin/CategoriesTableBody.tsx` | 1 | ADMIN | "SIRKÜLASYON" |
| `src/views/admin/ProductsTableBody.tsx` | 1 | ÜRÜN | "SIRKÜLASYON" |
| `src/components/admin/dashboard/ActivityHeatmap.tsx` | 1 | ADMIN | "PAZARTESI" |
| `src/views/admin/AdminUsersTableBody.tsx` | 1 | ADMIN | avatar baş harfi |

---

## 5. Yardımcı — `src/i18n/case.ts`

```ts
localeLower(value, lang)   // ekran: 'İstanbul' → 'istanbul'  (birleşen nokta ÜRETMEZ)
localeUpper(value, lang)   // ekran: 'Sirkülasyon' → 'SİRKÜLASYON'
foldForSearch(value, lang) // eşleştirme: kasa VE aksan duyarsız → 'Sığınak Fanı' → 'siginak fani'
```

**`toLocaleLowerCase('tr')` KULLANILMADI.** O çağrı ICU verisine bağlıdır ve ICU'suz
(small-icu) bir Node çalıştırmasında **sessizce** locale'siz davranışa düşer. Eşleme elle
yazıldı: her çalıştırmada aynı sonucu verir ve kapıdan sınanabilir.

### 5.1 KARAR — arama neden aksan da düşürüyor

`foldForSearch` yalnız kasayı değil **aksanı da** düşürür (`Sığınak → siginak`).
Gerekçe: yalnız kasayı düzeltmek müşterinin **gerçek** başarısızlığını yerinde bırakırdı —
Türkçe klavye açmayan kullanıcı "siginak" yazar ve locale doğru olsa bile eşleşme olmaz.
Bu, eşleşmeyi yalnız **genişleten** bir değişikliktir (hiçbir eski eşleşme kaybolmaz).
**Ekrana basılan metinde kullanılmaz** — orada `localeLower`/`localeUpper` vardır.

> Recep'in bilmesi gereken tek şey bu: **arama artık aksan duyarsız.** İstenmiyorsa
> `foldForSearch` içindeki aksan düşürme satırı tek başına geri alınabilir.

---

## 6. Kapı — INV-8 ve nasıl kanıtlandı

`src/__tests__/conformance/i18n-locale-case.test.ts` · 6 kol:

0. **Kapsam kanıtı** — tarayıcı >400 dosya görüyor (641 gördü).
1. **Kanarya (pozitif)** — sentetik üç ihlal satırını YAKALAR.
2. **Kanarya (negatif)** — sentetik teknik dizeyi YAKALAMAZ (aşırı geniş değil).
3. Donmuş listede olmayan dosya ihlal edemez.
4. Borçlu dosya sayısını artıramaz.
5. **Mandal tek yönlü** — borç düşünce liste güncellenmeli, yoksa kırmızı.

**Bilerek bozuldu, iki yönden:**

```
SABOTAJ A  listede olmayan dosyaya ihlal eklendi  → kol 3 KIRMIZI  ✔
SABOTAJ B  borçlu dosyada sayı 1 → 2 yapıldı      → kol 4 KIRMIZI  ✔
geri alındı                                       → 6/6 YEŞİL
```

Yardımcının kendisi de sabote edildi: `localeLower` locale'i yok saydırıldı →
`src/i18n/__tests__/case.test.ts` 2 kolu kırmızıya döndü, geri alınınca 12/12 yeşil.

---

## 7. Bu belgenin sınırı

- **Eksen B (kök `<html lang>`) ve eksen D (`localeCompare`) AÇIK.** INV-8 ikisini de
  görmez — biri *nitelik*, diğeri *sıralama* kusurudur.
- Eksen D ölçümü: `localeCompare` 11 kullanım, **9'unda dil parametresi yok**. Fark yalnız
  "yanlış sıra" değildir: SSR (Node) ile istemci (tarayıcı) **farklı varsayılan locale**
  kullanır, yani sıra hidrasyonda **değişebilir**. Müşteriye dokunan dördü:
  `src/app/[lang]/page.tsx:136` · `src/hooks/useCategoryGateway.ts:120` ·
  `src/views/CategoryMasterView.tsx:86` · `src/components/products/VariantSelector.tsx:73`.
- Hiçbir düzeltme **tarayıcıda görsel olarak** doğrulanmadı; kaynak, canlı DB (salt-okunur)
  ve node ile ölçüldü. Ekran doğrulaması ayrı iştir.
- Postgres tarafı (FTS/collation) **ölçülmedi** — bu belgenin konusu değil.

---

## 8. ALTYAPI şeridine devir — cetvel satırı

`docs/standards/i18n-localization-standard.md` **ALTYAPI şeridinin claim'indedir**
(2026-08-23, eksen B / `lang-metadata-*` işiyle birlikte). Bu PR o dosyaya **dokunmaz**.
Aşağıdaki satır, eksen tablosuna **H'den sonra** eklenmek üzere hazırdır:

```
| J | **Locale-siz kasa çevirimi** | `src/i18n/case.ts` → `localeLower`/`localeUpper` (ekran), `foldForSearch` (arama) | **INV-8** `i18n-locale-case.test.ts` (kullanıcı-metni ifadesine uygulanan `toLowerCase()`/`toUpperCase()`; teknik dize kapsam dışı) | ✅ KAPALI (mandal: 14 dosya / 23 ihlal donduruldu, 6'sı teknik yanlış-pozitif; liste yalnız küçülebilir) |
```

Ve tablonun altına açıklama olarak:

> **J neyi kapatır, neyi kapatmaz.** `toLowerCase()`/`toUpperCase()` **locale'den bağımsızdır**:
> Türkçe'de `İ → i̇` (birleşen nokta U+0307) ve `I → i` (`ı` değil) üretirler. Kusur **sessizdir**.
> J bu ailenin **JavaScript** ayağını kapatır. GÖRMEDİĞİ üç şey: (1) kök `<html lang>` sabit
> olduğu için CSS `text-transform: uppercase` yanlış dil kuralı uygular — *nitelik* kusuru
> (eksen B, ALTYAPI'da); (2) `localeCompare` dil parametresiz — 11 kullanımın 9'unda yok ve
> SSR/istemci farklı varsayılan locale kullandığı için sıra **hidrasyonda değişebilir**;
> (3) Postgres tarafı — vitrin araması RPC'ye gider, bu kapının konusu değildir.
> Ölçüm: `docs/audits/locale-kasa-envanteri-2026-08-23.md`.

**Kapsam notu:** bu belge `t146-*` kalıbından ÇIKARILDI — o glob ÜRÜN şeridinin claim'indedir.
