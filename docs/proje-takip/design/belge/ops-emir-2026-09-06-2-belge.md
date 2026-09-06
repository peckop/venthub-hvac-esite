
# OPS EMRİ → DESIGN-BELGE · 2026-09-06 · #2 · Föy + dil yuvası + stres provası KABUL · 153-12/13/14 hükümleri · veri dosyası · sıradaki

## Kabul
Dil yuvası (Türkçe literal 0, props varsayılanları boş — doğru), föy (16 alan · 4 grup · 1,42 sayfa · taşan 0), stres provası altı belge
(taşan hücre 0, iki fiyatsız belgede para birimi 0), numaralandırma örnekleri kalıba uygun. `TeknikTablo`'nun logic'ten mount edilmesi ve
editörden tıklanamaması KABUL, kayda geçti (veri satırı elle düzenlenmez zaten).

**OPS'un ölçüm hatası:** "e-posta gövdeleri görünmüyor" dedim; sebep benim listeleme aracımın yalnız kök dizini okuması. `email/` altında beş
dosya var, ölçtüm. Hata bende, notta "OPS göremedi" satırı düzeltildi sayılır.

## Hükümler
- **153-12 Föyde `sku` → ÇIKAR.** Föy müşteri belgesidir; kod kuralı geçerli. Belge kimliği bloğu: `model_code` + föy sürümü + tarih; arşiv
  eşleşmesi için `model_code` yeter (ürün kimliği değişmezi `<MARKA>-<model_code>`).
- **153-13 Kopya tablolar → KABUL, damgalı.** Notlara damga: `src/utils/productHelpers.ts` son commit **848aac66 (2026-09-02)**; kodda değişince bayat
  sayılır. Kalıcı çözüm üretim tarafı (föy PDF'i `technical_specs`'ten üretir, K13 ilkesi) — OPS Linear'da kod işi açar, senin işin değil.
- **153-14 Gerçek değerler → dosya `foy-veri-lineo-100-2026-09-06.json` projede** (canlı DB'den, değiştirilmedi). İki ürün: **birincil 17160
  Lineo 100 Quiet** (22 anahtar; emirde "LINEO 100 Q" yazmam belirsizdi, düzeltme: föy 17160 ile dolar) + 17143 Lineo 100 Q (ikinci örnek,
  isteğe bağlı). Değerler `formatSpecValue` mantığıyla; `pq_curve` föyde çizilmez (K20 ileride). Görsel: `product_images` sort-0 (3 görsel var,
  dosya sana kapalı → föyde fotoğraf yuvası boş kalır, "görsel yuvası · product_images sort 0" altyazısı).

## Sıradaki emir: YASAL SET (kapalı bekler) — belge sırasının 4. adımı
Üç belge, A4, kabuk `dil="tr"`, "kapalı bekler · `NEXT_PUBLIC_ODEME_ACIK`" etiketi (E8 dili): **Mesafeli Satış Sözleşmesi** · **Ön Bilgilendirme
Formu** · **Cayma/İade Formu**. Metin hukuktan: depo `src/views/legal/components/tr/DistanceSalesAgreementContent.tsx` ve
`PreInformationContent.tsx` (sen okuyabiliyorsun, github.md); metin YAZMAZSIN, dizersin. Cayma/İade Formu için depoda metin YOK: form
yalnız alan listesiyle çizilir (`venthub_returns` kolonları: sipariş no · kalem · adet · sebep · tarih · imza yuvası), açıklama metni boş
kalır (K7), "metin hukuktan gelecek" altyazısı; boşluk alanları `alanAdlari` (ad · adres · sipariş no `VH-…` · tarih · kalemler). Stres: sözleşme
uzunluğu gerçek metinle sayfa sayısı ölçülür. Kapı: ham hex 0 · Arial 0 · Türkçe literal kabukta 0 · üç belgede para birimi yalnız kalem tablosunda.
Bitti: 3 dosya + notlar + `bekleyen-hukumler` güncel + proje yorumu.

— OPS · 2026-09-06

