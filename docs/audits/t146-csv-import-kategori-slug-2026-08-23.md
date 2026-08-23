# T146-VH — CSV içe aktarımı: kategori çözülmüyor + slug Türkçe harfleri siliyor

> **Tarih:** 2026-08-23 · **Ölçen şerit:** URUN · **Düzeltecek şerit:** ADMIN (şu an çevrimdışı)
> **Durum:** ÖLÇÜLDÜ, DÜZELTİLMEDİ — dosya ADMIN şeridinde, URUN claim'inde değil.
> **Aciliyet:** LATENT (bugün prod veriyi bozmuş değil; bir sonraki CSV içe aktarımında doğar)

## 0. Niçin bu belge var

`scripts/db/checks/catalog-integrity.mjs` içindeki **`product-no-subcategory`** kuralı
(#780, 2026-08-23) "yaprak kategorisi olmayan ürün"ü bekçiler: aktif, adresi var, arama
bulur, **kategori gezinmesiyle ulaşılamaz**. Kapı kuruldu ama o gün ölçüldü ki **kusuru
üreten uç açık**: yönetim panelindeki CSV içe aktarıcısı, kategorisi olmayan ürün
üretebiliyor ve bunu **sessizce** yapıyor.

Kapı sonucu yakalar; bu belge **kaynağı** yazar.

## 1. Kusur A — kategori HİÇ çözülmüyor

**Yer:** `src/components/admin/products/ProductCsvImport.tsx:95-99`

```ts
const mapCategorySlugToId = (slug: string) => {
    const s = (slug || '').toLowerCase().trim()
    const found = categories.find(c => c.name.toLowerCase() === s)   // ← AD ile karşılaştırıyor
    return found?.id || null
}
```

**Kullanıldığı yer:** aynı dosya, satır 119

```ts
else if (r['category_slug'] || r['category']) p.category_id = mapCategorySlugToId(r['category_slug'] || r['category'])
```

Fonksiyonun adı `mapCategorySlugToId` — sözleşmesi slug almak. Ama karşılaştırma `c.slug`
ile değil **`c.name`** ile yapılıyor. Ad ile slug ayrı eksenlerdir: ad insan için yazılır
(boşluklu, Türkçe/İngilizce), slug adres için (tireli, ASCII).

### Ölçüm (canlı DB, `public.categories`, 2026-08-23)

| ölçüm | sonuç |
|---|---|
| toplam kategori | **31** |
| adı slug'ıyla birebir aynı olan | **1** |
| adı TR slug'ıyla birebir aynı olan | **0** |

Örnekler: `Asit Dayanımlı Fanlar` ↔ `acid-resistant-fans` · `İklimlendirme Çözümleri` ↔
`air-conditioning-solutions` · `Kanal İçi Hayalet Fanlar` ↔ `inline-duct-fans`.

**Sonuç:** CSV'de kategori slug'ı yazan bir satır, 31 kategorinin **30'unda** `null` döner.
Ürün **kategorisiz** içeri girer; içe aktarma "başarılı" der; ürün hiçbir yaprak kategori
sayfasında görünmez. Hata mesajı yoktur — `|| null` sessizce yutar.

## 2. Kusur B — slug üretimi Türkçe harfleri SİLİYOR

**Yer:** `src/components/admin/products/ProductCsvImport.tsx:108`

```ts
slug: r['name'].trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
```

JS'te `\w` yalnız `A-Z a-z 0-9 _` demektir. Türkçe küçük harfler bu kümede yoktur;
dolayısıyla **harf çevrimi yapılmaz, karakter silinir**.

### Ölçüm (gerçek katalog adlarıyla koşturuldu)

| ad | üretilen slug | |
|---|---|---|
| `Asit Dayanımlı Fanlar` | `asit-dayanml-fanlar` | ✗ |
| `Çatı Tipi Fan Küçük` | `at-tipi-fan-kk` | ✗ |
| `Vortice Punto Ghost Duş` | `vortice-punto-ghost-du` | ✗ |
| `AVenS 750 ISI GERİ KAZANIM CİHAZI` | `avens-750-isi-geri-kazanim-cihazi` | ✔ **kaza eseri** |

Son satır teşhisi zorlaştırıyor: büyük `İ` küçültülünce `i` + birleşen nokta (U+0307)
üretir, nokta `[^\w-]` tarafından silinir, geriye doğru `i` kalır. Yani **büyük harfle
yazılmış adlar tesadüfen kurtulur**, küçük Türkçe karakter taşıyanlar bozulur. Birkaç örnek
deneyen biri "çalışıyor" sonucuna varabilir.

### Kapsam

Katalogda **374 aktif üründen 24'ünün adında Türkçe karakter var** ve **mevcut slug'ları
DOĞRU** (`avens-750-isi-geri-kazanim-cihazi`, `6-kw-elektrikli-isitici` — düzgün harf
çevrimi yapılmış). Yani bu ürünler bu içe aktarıcıdan **geçmemiş**.

**Kusur bugün prod veriyi bozmuş değil. Bir sonraki CSV içe aktarımında doğar.**

## 3. Önerilen düzeltme (ADMIN şeridi uygular)

1. **Fonksiyon gerçekten slug'a baksın.** Sırasıyla `c.slug` (kanonik EN), sonra
   `metadata.slug.tr` / `metadata.slug.en` (`category-taxonomy-standard`: kanonik EN,
   görünen slug dile göre).
2. **Eşleşme yoksa sessiz `null` DEĞİL — satırı REDDET ve kullanıcıya söyle.** Sessiz null
   tam olarak "görünmez ürün"ü üretiyor. İçe aktarma önizlemesi zaten satır bazlı rapor
   basıyor; çözülemeyen kategori orada adıyla görünmeli.
3. **Slug üretimi harf çevrimi yapsın** (ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c ve büyükleri).
   Yeni kural icat etmeye gerek yok: katalogdaki 24 doğru slug zaten bu kuralla üretilmiş,
   aynı çevrim içe aktarıcıya bağlanır.
4. **Kapı:** bir CSV fikstürü — Türkçe adlı ve kategori slug'ı taşıyan satır — içeri
   alındığında kategori ÇÖZÜLMELİ ve slug harf-çevrimli olmalı. Sabotaj iki yönlü:
   çevrimi kaldır → kırmızı; eşleşmeyi ada döndür → kırmızı.

## 4. Şerit notu

Dosya `src/components/admin/products/` altında = **ADMIN şeridi**. URUN'un claim'inde
değil ve ADMIN oturumu 2026-08-23 itibarıyla çevrimdışı. Ölçüm URUN tarafından yapıldı
(kusur URUN'un `product-no-subcategory` kapısının üreten ucu olduğu için), **düzeltme
yapılmadı** — şerit sınırı korundu.

## 5. İlgili

- `scripts/db/checks/catalog-integrity.mjs` — `product-no-subcategory` kuralı (sonucu yakalar)
- `docs/standards/category-taxonomy-standard.md` — kanonik EN slug + dile göre görünen slug
- `docs/standards/csv-import-export-standard.md` — içe/dışa aktarma sözleşmesi
