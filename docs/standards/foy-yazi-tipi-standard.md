# Föy (PDF) Yazı Tipi Standardı

> **Ne yönetir:** Ürün föyü PDF'ine (`src/lib/pdfGenerator.ts`) gömülen yazı tipi dosyalarının ne olduğu,
> jsPDF'e verilmeden önce nasıl denetlendiği, yüklenemezse föyün ne yaptığı ve yeni yazı tipi eklerken
> hangi belgelerin yazılması gerektiği.
> **Sürüm:** v1.0 · 2026-10-25
> **Sahibi:** URUN
> **Son doğrulama:** 2026-10-25 (kural metni `src/lib/pdfAssets.ts`, `src/lib/pdfGenerator.ts`,
> `src/__tests__/conformance/foy-yazi-tipi-imza.test.ts` ve `public/fonts/NOTICE.md` ile satır satır karşılaştırıldı;
> kapı testi ve yedek yol testi aynı gün koşuldu: 2 dosya, 22 test yeşil)
> **Niçin bu cetvel doğdu:** kart HRT-59 "föy yazı tipi için yazılı cetvel yok: yazımı bu işin kapsamında"
> dedi (kural 1). URN-123 (#1873) kuralı koydu ama yalnız kapı testinin başlığına ve `NOTICE.md`'ye yazdı;
> hiçbir cetvele girmedi.
> **Neden ayrı dosya:** `product-schema-standard.md` veritabanı şemasını yönetir; föy yazı tipi veritabanı
> değil depodaki bir varlık ve çalışma anı denetimidir. Dar tutuldu, birleştirilmedi.

---

## 1. Niçin var (ölçülmüş vaka, 11 Ekim 2026)

`public/fonts/Roboto-Regular.ttf` ve `Roboto-Bold.ttf` 7 Haziran'dan 11 Ekim'e kadar yazı tipi değil HTML'di
(ilk baytlar satır sonu ve `<!DOCTYPE html>`). Sunucu bunları HTTP 200 ve `font/ttf` ile veriyordu:
`fetch` reddetmedi, `response.ok` doğruydu, gövde jsPDF'e gitti. jsPDF `addFont` hatasını yutar (fırlatmaz),
PDF yine üretilir ve Türkçe harfler bozuk çıkar. Hiçbir test dosyanın içine bakmıyordu; hata tam o boşlukta
yaşadı. Kaynak: `foy-yazi-tipi-imza.test.ts` başlığı, `pdfAssets.ts` `yaziTipiDenetle` açıklaması.

**Ders:** "indi" ya da "200 döndü" yazı tipi olduğunu göstermez; güvenilir ölçüt dosyanın baytlarıdır.

## 2. Kurallar

| # | Kural | Nerede zorlanır |
|---|---|---|
| F1 | Her `.ttf` **sfnt imzasıyla** başlar: `00 01 00 00` (sfnt 1.0) ya da `true` (Apple). | `yaziTipiDenetle` |
| F2 | jsPDF'in okuduğu **yedi tablo** bulunur: `cmap` `glyf` `head` `hhea` `hmtx` `loca` `maxp`. Biri eksikse dosya geçersizdir. | `yaziTipiDenetle` |
| F3 | **CFF (`OTTO`) kabul edilmez.** jsPDF `glyf` ve `loca` okur, CFF'de bu tablolar yoktur. | `yaziTipiDenetle` (F1 reddeder) |
| F4 | **Kesik dosya** geçersizdir: tablo konumu artı uzunluğu dosya sınırını aşıyorsa ya da tablo dizini dosyaya sığmıyorsa. | `yaziTipiDenetle` |
| F5 | Föyün asıl ihtiyacı: **ğ Ğ ş Ş ı İ** için `cmap`'te boş olmayan glif bulunur (glif 0 = `.notdef` = kutu çizilir). | kapı testi, `cmap` (3,1) biçim 4 |
| F6 | **İkisi birden ya da hiçbiri:** Regular ve Bold ikisi de imza denetiminden geçmeden jsPDF'e **hiçbir bayt verilmez**; biri geçersizse föy ikisini de bırakıp yedek yola düşer. Yarım Roboto yoktur. | `pdfGenerator.ts` `yaziTipiYukle` + `try/catch` |
| F7 | Denetim `arrayBuffer`'dan **sonra**, jsPDF'e bayt verilmeden **önce** yapılır. `addFont` denetim sayılmaz, çünkü hatayı yutar. | `yaziTipiYukle` |
| F8 | **Yedek yol** (gömülü Roboto yüklenemedi, Helvetica kullanılıyor): WinAnsi bu altı harfi çizemez, bu yüzden ASCII karşılığıyla basılır. Gömülü Roboto'da metne **dokunulmaz**. | `standartYaziTipiMetni`, `pdfGeneratorFallback` testi |
| F9 | `PDF_FONTS` yolları `public` altında var olan dosyalara çıkar. | kapı testi |

**Yedek yol harf eşlemesi (F8):**

| Harf | Basılan | Harf | Basılan |
|---|---|---|---|
| ğ | g | Ğ | G |
| ş | s | Ş | S |
| ı | i | İ | I |

ö ü ç Ö Ü Ç WinAnsi'de vardır, eşlenmez. Eşleme bilerek yanlış harf yerine okunabilir harf verir; föyde "g, s, i"
görmek, bozuk glif görmekten iyidir. Föydeki **tüm görünür metin** `metin()` işlevinden geçer; yeni bir metin
satırı o işlevi atlarsa yedek yolda yine bozuk glif çıkar.

## 3. Yeni yazı tipi eklerken (zorunlu)

Aşağıdakilerin hepsi **aynı PR'da** yazılır; eksik biri PR'ı durdurur.

1. Dosya `public/fonts/` altına bayt bayt kopya olarak girer; **değiştirilmez** (yeniden dışa aktarma, alt küme yok).
2. `public/fonts/NOTICE.md` tablosuna satır: dosya adı, sürüm, **bayt**, **SHA-256**. Üstüne **telif satırı**
   (yazı tipi ad tablosu nameID 0), **lisans** (nameID 13-14) ve **kaynak** (nereden, nasıl alındı) yazılır.
3. Lisans metni dizindeki `LICENSE` dosyasında tam durur. Roboto için **Apache-2.0**; §4(a) gereği lisans
   yazı tipleriyle birlikte dağıtılır. Lisansı bilinmeyen ya da dağıtımı yasak yazı tipi **girmez**.
4. Dosya adı `NOTICE.md`'de anılır (kapı bunu sınar).
5. Yeni bir `.ttf` kapıya ayrıca bildirilmez: kapı `public/fonts` altındaki **her** `.ttf`'i kendisi bulur ve
   F1-F5'e sokar. `PDF_FONTS` yolu eklendiyse F9 onu da sınar.
6. Roboto dışı bir yazı tipi Türkçe harfleri (F5) taşımıyorsa **girmez**.

## 4. Kapı

| | |
|---|---|
| **Ad** | `INV-FOY-FONT-1` |
| **Dosya** | `src/__tests__/conformance/foy-yazi-tipi-imza.test.ts` |
| **Çalışma anı denetimi** | `yaziTipiDenetle` (`src/lib/pdfAssets.ts`), `yaziTipiYukle` içinden |
| **Kendini sınar** | Aynı denetleyici dört bozuk girdiye verilir ve **kırmızı** vermesi beklenir: HTML gövde (eski dosyaların biçimi), ilk dört baytı bozulmuş gerçek dosya, yarıdan kesilmiş gerçek dosya, `cmap` etiketi bozulmuş gerçek dosya. Gerçek dosya kesilmeden geçerli olduğu da sınanır (boş evren değil). |
| **Koşturma** | `pnpm vitest src/__tests__/conformance/foy-yazi-tipi-imza.test.ts --run` |

Kapıyı gevşeten değişiklik (tablo listesini kısaltmak, `OTTO` kabul etmek, F6'yı "geçerli olanı kullan"a çevirmek)
bu cetvelin sahibi URUN ile HARİTA'nın onayını ister; sabotaj testi çıkarılarak kapı gevşetilmez.

## 5. Ölçülmeyenler

- Canlıda üretilen föy PDF'inin tarayıcıda gözle okunması bu cetvelin dışındadır: kapı dosyanın **içine** ve
  yedek yolun metin dönüşümüne bakar, üretilen PDF'in görüntüsüne bakmaz.
- Başka PDF yüzeyleri (teklif, fatura) varsa bu cetvel onlar için yazılmadı; aynı yazı tiplerini kullanırlarsa
  F1-F9 onlar için de geçerli olur, ama bu ölçülmedi.

## 6. Kaynaklar

- `src/lib/pdfAssets.ts` (`PDF_FONTS`, `yaziTipiDenetle`, `standartYaziTipiMetni`)
- `src/lib/pdfGenerator.ts` (`yaziTipiYukle`, yedek yol, `metin()`)
- `src/__tests__/conformance/foy-yazi-tipi-imza.test.ts` (INV-FOY-FONT-1)
- `public/fonts/NOTICE.md`, `public/fonts/LICENSE`
- Kaynak değişiklik: URN-123, PR #1873 (12 Ekim 2026)
