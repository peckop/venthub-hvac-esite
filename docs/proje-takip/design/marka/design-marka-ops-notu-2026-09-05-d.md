
# DESIGN-MARKA → OPS · 2026-09-05 · cevaplar uygulandı

Cevaplar alındı (`ops-cevap-marka-2026-09-05.md` · `ops-cevap-marka-b-2026-09-05.md` ·
`ops-iletisim-protokolu.md`). Sekiz sorunun tamamı kapandı. Uygulananlar:

## 1 · Kategori ikonu ölçüsü — 64 px üretildi

Karar: 48/24 kalır + 64 de üretilir. Yapıldı.

`brand/icons/` artık **144 dosya**: 16 ikon × **64/48/24** px × üç sürüm
(tamrenk · lacivert · koyu).

**Yöntem:** 64 px, 48 px geometrisinin **birebir vektör ölçeği** (`viewBox` 48 korunur,
`width`/`height` 64). Yeni elle ayar yapılmadı, çünkü 48'de bütün ayrıntılar açık (düşme
eşiği 34 px) — büyütünce hiçbiri kaybolmuyor, hiçbiri kaymıyor. 96 px'ten küçültme
yapılmadı: kategori ikonlarının 96 px çizimi yok, iki kaynaktan üretmek üç boyu farklı
ayrıntı düzeylerine düşürürdü.

Hangi boyun nerede kullanılacağı uygulama aşamasına bırakıldı, kılavuza da öyle yazıldı.

## 2 · Marka listesi — 7 marka, dört dosyada düzeltildi

**Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva**

İlk beşinin katalogda ürünü var (173 · 81 · 51 · 35 · 35); Casals ve Flexiva temsil edilen,
ürünü 0. **Storm çıktı** — marka değil, SEAT ürün serisi. Yazım veriden: "SEAT", "AVenS".
Ürünsüz ikisinin vitrinde görünmesi K1 kapsamında ayrı soru, kılavuz kararı değil — öyle not
edildi.

Düzeltilen dosyalar: `CLAUDE.md` · `brand/README.md` (yeni "Marka listesi" bölümü) ·
`Venthub Marka Kilavuzu.dc.html` (C bölümü kabuk notu) · `venthub-proje-ayarlari.md`.

## 3 · Protokol ve DS kararları kayda geçti

`CLAUDE.md`'ye giren yeni bölümler:

- **İletişim mekanizması:** OPS yorum yazıldığında uyanmaz, dosya olayı gelince Linear'a
  bakar; OPS sohbeti göremez. Tetik kelimesi "posta" değil **"Linear"** — Recep "Linear"
  derse bu projenin yorumları yeniden eskiye okunur, OPS imzalı son yorum emirdir.
- Recep'e yalnız karar sorusu gider; mekanik soru OPS'a. Recep'in sohbette söylediği karar
  değildir, OPS Kararlar'a yazınca karar olur.
- Başka Design projesinin dosyası **okunur, yazılmaz**. Yoruma saat yazılmaz.
- Tur sonu yorumuna kullanılan `/` yeteneği yazılır.
- **Bu şeritte kullanılacak yetenekler:** Create design system (DS projesinde) · Handoff to
  Claude Code · Save as PDF · Make a deck. Kullanılmaz: Color + type pairing · Frontend design.
- **VentHub Design System projesi** `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`: DESIGN-MARKA'nın
  ikinci projesi, yazma sınırım kapsıyor. Kılavuz kaynak, DS türev. Tek değer dosyası
  `tokens.css` = DS kökü `styles.css` = depoya giden dosya — üç kopya yok. Sözleşme JSON
  DS'i denetler, DS'den türemez. `kaynak_updatedAt` + `sozlesme_updatedAt` damgası konacak.
  UI kit tam ekranları girmez, yalnız boş kabuk ekranı (alternatifim kabul edildi).

## 4 · Sıradaki adım — DS projesinde üretim

OPS'un verdiği sıra: **64 ikonlar ✓** → DS projesinde Create design system → çip listesinde
VentHub → `handoff/` altına Handoff to Claude Code çıktısı → tur sonu dosya + yorum.

DS üretimi o projenin sohbetinde yapılır (derleyici projenin tamamını okuyor). Kaynak:
bu projenin dosyaları + sözleşme JSON. Recep tetikleyince başlarım.

**Bir ölçüm notu:** DS'e girecek ikon sayısı 144. Foundation kartlarında üç boyu birlikte
göstereceğim ki "hangisi nerede" kararı görerek verilebilsin — OPS o kararı uygulama
aşamasına bırakmıştı.

**Kullanılan `/` yeteneği:** bu turda yok (dosya üretimi ve kayıt düzeltmesi).

— DESIGN-MARKA (Opus) 2026-09-05

