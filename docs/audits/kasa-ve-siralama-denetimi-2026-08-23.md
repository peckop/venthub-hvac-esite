# Kasa (büyük/küçük harf) ve Sıralama Denetimi — Açık İşler

> **Ne bu?** Recep'in 2026-08-23'te canlı vitrinde bulduğu kasa kusurunun **ailesinin tamamı**.
> INV-7 bu ailenin **yalnız bir eksenini** kapatır; kalan üç eksen burada ölçülü ve **açık iş**
> olarak kayıtlıdır. Şerit: I18N · Cetvel: `docs/standards/i18n-localization-standard.md`
>
> **Niçin ayrı belge:** Recep'in kendi uyarısı — *"bunların her biri iş konusu, sonra sen iş
> yapınca bunlar kayıtsız görevler olarak kaybolabilirler."* Mesajla iletilen bulgu kaybolur;
> depoya yazılan kaybolmaz.

---

## 0. Tablo

| # | Eksen | Görünür mü? | Bedeli | Durum |
|---|---|---|---|---|
| **A** | Veri kaynaklı özel ad + CSS `uppercase` | Görünür | Marka adı bozuk (`VORTİCE`) | ✅ **INV-7 kapattı** (21 yer donmuş borç) |
| **B** | Kök `<html lang>` sabit | Görünür | EN sayfada Türkçe kasa kuralı | 🔴 **AÇIK** — Altyapı/rota alanı |
| **C** | `toLowerCase()` / `toUpperCase()` locale'siz | **GÖRÜNMEZ** | **Türkçe arama ürünü bulamıyor** | 🔴 **AÇIK** — en yüksek öncelik |
| **D** | `localeCompare` dil parametresiz | Görünür | Alfabetik sıra yanlış | 🔴 **AÇIK** |

---

## 1. Eksen A — kapandı (INV-7)

`text-transform: uppercase` **dile duyarlıdır**. `lang="tr"` altında `i → İ` olur; bu Türkçe
metin için doğru, yabancı özel ad için yanlış: `Vortice → VORTİCE`.

Recep'in onayıyla (2026-08-23) çözüm: **veri kaynaklı özel adı CSS ile büyütme.**
"Elemana `lang` ver" alternatifi ölçüldü ve **mümkün değil** — aile adları karışık dilde tek
dize (`'Vortice Lineo Quiet Kanal Fanları'`), 38 adın 36'sı bu sınıfta.

Kapı: `src/__tests__/conformance/i18n-uppercase-proper-noun.test.ts` (INV-7), 21 yer ratchet.
**Düzeltme sahipleri:** ÜRÜN + GÖRSEL (dosyaların çoğu onların şeridinde).

---

## 2. Eksen B — kök `lang` sabit (AÇIK)

```
src/app/layout.tsx:39   <html lang="tr" data-scroll-behavior="smooth">
```

`src/app/[lang]/layout.tsx` kendi `<html>`'ini kurmuyor; yalnız `I18nProvider` sarıyor.
Yani **tüm sayfalar `lang="tr"` miras alıyor.**

**Canlı ölçüm (curl, 2026-08-23):**

```
/en/products/vortice-lineo-quiet  →  <html lang="tr">
                                 →  <title>Vortice Lineo Quiet Kanal Fanları | VentHub</title>
```

İki ayrı kusur aynı yerde: `lang` yanlış **ve** başlık Türkçe (ikincisi `name_i18n` okuma
yolunun bağlı olmamasından — ayrı iş, ÜRÜN'de).

**Bedeli:** İngilizce sayfada `uppercase` uygulanan **İngilizce arayüz metni** de Türkçe kasa
alır (`SILENT → SİLENT`). Ayrıca ekran okuyucu, heceleme ve SEO dil sinyali yanlış.

**Sahip:** rota/altyapı alanı — I18N şeridinin claim'inde `layout.tsx` **yok**.
**Düzeltme:** `lang` rota parametresinden gelmeli. **INV-7 bunu GÖREMEZ** (kod tarar, nitelik değil).

---

## 3. Eksen C — locale'siz kasa çevirme (AÇIK, EN YÜKSEK ÖNCELİK)

**Bu eksen görünmez.** Kimse hata mesajı almaz; arama sonucu sessizce boş döner.

### Kanıt (node ile koşuldu, 2026-08-23)

```js
'İstanbul Havalandırma'.toLowerCase()          // "i̇stanbul havalandırma"  (i + ayrı nokta!)
  .includes('istanbul')                        // false   ← MÜŞTERİ BULAMAZ
'İstanbul Havalandırma'.toLocaleLowerCase('tr')
  .includes('istanbul')                        // true

'SIĞINAK'.toLowerCase()                        // "siğinak"   (ı yerine i)
  .includes('sığınak')                         // false   ← MÜŞTERİ BULAMAZ
'SIĞINAK'.toLocaleLowerCase('tr')
  .includes('sığınak')                         // true
```

JavaScript'in `toLowerCase()`/`toUpperCase()` metodları **locale'den bağımsızdır**:
`İ → i̇` (birleşik nokta), `I → i` (`ı` değil). Türkçe metinde her ikisi de yanlış.

### Kapsam (ölçüldü)

- `toUpperCase()` / `toLowerCase()`: **105 kullanım** (test dosyaları hariç)
- `toLocaleUpperCase` / `toLocaleLowerCase`: **1** (`src/utils/specLabel.ts:47`, `en-US`)
- Hepsi kullanıcı metni değil (para birimi, slug, SKU, CSV başlığı, hex kodu gibi teknik
  dizeler **doğru** kullanım). Ayıklanması gereken sınıf: **arama / filtre / eşleştirme**.

### Bilinen isabetli yerler (tam liste değil — iş açılınca genişletilmeli)

```
src/components/admin/CommandPalette.tsx:68,71     arama eşleştirme
src/utils/searchHighlight.tsx:23                 arama vurgulama
src/views/admin/AdminInventoryReportPage.tsx:140 arama terimi
src/components/admin/products/ProductCsvImport.tsx:97   kategori adı eşleştirme
```

> `ProductCsvImport.tsx:97` özellikle tehlikeli: `c.name.toLowerCase() === s` ile **kategori
> eşleştiriyor**. Türkçe kategori adı içeren bir CSV satırı sessizce eşleşmez → ürün yanlış
> kategoriye düşer ya da hiç bağlanmaz. Veri bozulması sınıfı, yalnız görüntü değil.

### Önerilen çözüm

Tek bir yardımcı (`src/utils/` altında) — `trLower(s)` / `trUpper(s)` — ve locale'siz çağrıyı
kullanıcı metni yollarında yasaklayan bir kapı. Kaçış: teknik dizeler (slug/SKU/para/hex)
adıyla muaf. **Kapı yazılmadan düzeltme kalıcı olmaz** — 105 çağrının içinden doğru alt kümeyi
gözle ayıklamak tekrar bozulmaya açıktır.

---

## 4. Eksen D — `localeCompare` dil parametresiz (AÇIK)

- `localeCompare` kullanımı: **11** (test hariç)
- Dil parametresi verilen: **2** → **dokuzu tarayıcı varsayılanına bırakılmış**

Türk alfabesinde `ç > c`, `ı > i`, `ğ > g`, `ö > o`, `ş > s`, `ü > u`. Dil verilmezse liste
yanlış sırada dizilir (ör. "Çatı Fanları" yanlış yere düşer). Görünür ama düşük şiddetli.

---

## 5. Sıralama önerisi (Recep'e)

1. **C** — tek görünmez ve tek **satış kaybettiren** eksen. Müşteri "sığınak" yazıp sığınak
   fanlarını bulamıyor; kimse şikâyet etmez, sadece sepet dolmaz. Ayrıca CSV içe alımda veri
   bozulması riski taşır.
2. **B** — EN vitrinin dil sinyali; `name_i18n` okuma yolu işiyle **birlikte** yapılırsa EN
   sayfası tek seferde düzelir.
3. **D** — görünür, düşük şiddet, C'nin yardımcısıyla aynı PR'da kapatılabilir.

---

## 6. Bu belgenin kendi sınırı

- Eksen C'nin **tam** isabet listesi çıkarılmadı; 105 çağrının hangilerinin kullanıcı metnine
  dokunduğu tek tek ölçülmedi. Yukarıdaki dört yer **örnek**, envanter değil. İş açılınca ilk
  adım o envanterdir.
- EN sözlük metinlerinin **deyimsel kalitesi** (eksen C-i18n, cetvel §3 satır C) bu belgenin
  konusu değil; ayrı ve ertelenmiş borç.
- Buradaki hiçbir ölçüm tarayıcıda **görsel olarak** doğrulanmadı; kaynak kodu, canlı HTML
  (curl) ve node ile ölçüldü. Ekranda nasıl göründüğü ayrı bir doğrulama ister.
