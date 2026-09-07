# Kayıp ürün aktarımı — 67 kalem canlıya yazıldı (REC-226)

**Damga:** 2026-09-07 · **Şerit:** URUN-KATALOG · **Kayıt:** REC-226
**Recep'in sözü, lafzıyla:** "evet aktar" · **OPS GO:** 20:15Z (sınır: silme ve fiyat Recep'te)

## Patinajın sebebi — asıl bulgu

Bu eksik **20 Ağustos'ta kapanabilirdi.**

Çıkarım aracının ürün kodunu 5 haneye kısıtlayan hatası o gün ölçüldü ve
`venthub-pdf-ingestor@e7e5f7b` ile **düzeltildi**. Ama araç bir daha **hiç koşulmadı**;
`avensair-fiyat.csv` hâlâ **22 Haziran** tarihli. Üç hafta boyunca aynı eksik raporlandı,
sayıldı, kayda geçirildi — bir kez koşulmadı.

> Düzeltilmiş ama koşulmamış bir araç, düzeltilmemiş araçla aynı sonucu verir.

## Sayı düzeltmesi: 74 değil 68 — ve yazılan 67

| | |
|---|---|
| t119 (08-20) "kayıp" | 74 |
| bunlardan canlıda ZATEN olan | **6** (sulu batarya `13052`–`13057`) |
| gerçekten eksik | **68** |
| yazılan | **67** |
| yazılmayan | **1** (`20153` VORT MASTER) |

**Niçin 74 sanılmıştı:** t119 raporu **CSV eksiğini** ölçüyordu, veritabanını değil. Ben de
ilk aktarımda bu ikisini karıştırdım ve Recep'e "74'ü sitede yok" dedim. Ölçünce 68 çıktı.

**Niçin 67:** `20153` (VORT MASTER) için kaynak sayfa 62'nin metni **boş** çıktı — kategori
dayanağı yok. Kategoriyi tahmin etmek yerine **yazmadım**; kalem açıkta, sebebi yazılı.

## Veri iki bağımsız kaynaktan doğrulandı

| Alan | Kaynak | Yöntem |
|---|---|---|
| fiyat | t119 EK-A (2026-08-20) | 25 alt-ajanın **görsel** okuması |
| kod + ad | `kaynak-dizini/sayfalar.jsonl` (bugün) | **metin** çıkarımı |

Çapraz sonuç: **74/74 kod** dizinde bulundu · **65/65 fiyat** iki yöntemde de aynı çıktı.
İki farklı yöntem aynı rakamı veriyorsa, tek yöntemin hatası saklanamaz.

## Kategori eşlemesi — kaynak sayfa başlıklarına dayanır, tahmine değil

| Sayfa | Kaynak başlığı | Kök / alt kategori | Marka | Adet |
|---|---|---|---|---|
| 21 | "temel kasa … ABS plastikten" | Aksesuarlar | AVenS | 9 |
| 27 | AVENS dikdörtgen kanal | Fanlar / Dikdörtgen Kanal Tipi | AVenS | 7 |
| 39 | "CMS ATEX SANTRİFÜJ FANLAR" (EX-PROOF) | Fanlar / Ex-Proof (ATEX) | Vortice | 11 |
| 44 | "SEAT ATEX SERİSİ" (PTC sensörü) | Aksesuarlar | SEAT | 1 |
| 47 | NIMUS "SANTRİFÜJ FANLAR" | Fanlar / Santrifüj-Radyal | AVenS | 15 |
| 48 | NIMAX "SANTRİFÜJ FANLAR" | Fanlar / Santrifüj-Radyal | AVenS | 15 |
| 49 | "ENKELFAN — EC MOTORLU PLUG FAN" | Fanlar / Santrifüj-Radyal | AVenS | 9 |

`VORTICENT` = Vortice tescilli adı olduğu için o 11 kalem Vortice markasına yazıldı;
diğerleri listeyi yayımlayan AVenS'e.

## Ölçüm — önce / sonra

| | Önce | Sonra |
|---|---|---|
| Ürün | 375 | **442** |
| Adında ATEX geçen | 41 | **52** |
| CMS ATEX ürünü | **0** | **11** |
| Boş kategori | 14 / 37 | **12 / 37** |

İdempotentlik: ikinci koşum → yazılacak **0**, atlanan 74 ✓

## Ne YAZILMADI — sınırı

* **Fiyat yazılmadı.** OPS/Recep sınırı: silme ve fiyat değişikliği Recep'te. Ürünler fiyatsız —
  canlıdaki 375 ürünün 374'ü zaten `price = null` (fiyat `product_prices` tablosunda).
* **Aile (`family_id`) atanmadı** — ayrı iş (REC-218 SEAT mega-aile ayrışmasıyla birlikte).
* **Teknik özellik yazılmadı** — kaynakta var, ayrı çıkarım adımı.
* **15 sahte kayıt silinmedi** — silme Recep kapısında.

## Kalan

1. `20153` VORT MASTER — sayfa 62 metni boş; kaynağı yeniden çıkarmak gerek.
2. QE-B 9 kaleminin fiyatı belirsiz (sayfa 21'de fiyatlar ayrı blokta, eşleme kesin değil) —
   fiyat zaten yazılmadığı için bu şimdilik bloke değil.
3. `avensair-fiyat.csv` hâlâ Haziran tarihli — düzeltilmiş araçla yeniden üretilmeli.
