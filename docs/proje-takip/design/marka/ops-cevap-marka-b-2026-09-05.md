
# OPS → DESIGN-MARKA · cevapların tamamı (2026-09-05, ikinci not için)

Aynı metin Linear'da **REC-149** yorumunda. Bundan sonra OPS cevapları Design'a **DESIGN etiketli kayda** (REC-149) yazılır; proje yorumu ikincil.

## A · Marka listesi (ölçüldü: `products.brand` 375 ürün + `src/data/brands.ts`)
Ürünü olan 5: **Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35.** Temsil edilen, ürünü henüz yok 2: **Casals · Flexiva.**
Kılavuz listesi **7 marka**, bu sırayla. **Storm marka DEĞİL** (SEAT ürün serisi, 20 ürün adında geçer) → çıkar. Yazım veriden: "SEAT", "AVenS".
Ürünsüz ikisinin vitrinde görünmesi Recep'e ayrı soru (K1), kılavuz kararı değil.

## B · Kategori ikonu ölçüsü — Recep kararı (bugün)
**48/24 KALIR + 64 de ÜRETİLİR** (tek tur, 144 dosya). Hangisi nerede: uygulama aşamasında görerek. Üç boy da `brand/icons/`, DS'e üçü girer.

## C · Design system kurulumu — altı yönetim başlığı
**Proje OPS tarafından AÇILDI:** `VentHub Design System` · `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7` · tür PROJECT_TYPE_DESIGN_SYSTEM (çip listesine girer).
Tohum: kök `styles.css` (= `brand/tokens.css`), `brand/` paketi, `tasarim-sozlesmesi-v1.json`, `ops-iletisim-protokolu.md`. Üretim o projenin sohbetinde.
1. **Sahiplik:** DESIGN-MARKA'nın ikinci projesi, aynı şerit; yazma sınırın o projeyi kapsar.
2. **Bakım:** kılavuz (CLAUDE.md) kaynak, DS türev; tazeleme DESIGN-MARKA, tetik OPS.
3. **Bayatlık damgası:** evet — `kaynak_updatedAt` + `sozlesme_updatedAt` DS kökü ve README'de.
4. **Üç kopya yok:** tek değer dosyası `tokens.css` = DS `styles.css` = depoya giden dosya. Kılavuz = karar. Sözleşme JSON = bağımsız ölçüm, DS'den üretilmez, DS'i denetler. Tutarlılık: OPS betiği (REC-147).
5. **Sıra:** DS önce, DENEY-MARKA-1/2/3 sonra.
6. **15A çakışması:** 4'te cevaplandı.
**UI kit ekranları:** yalnız kabuk ekranı DS'e girer; tam ekranlar DESIGN-MENU'de (K11).

## D · Diğer
- REC-149: OPS devraldı, kayıt kalır, Marka projesinde, OPS+DESIGN etiketli. Design kayıt açmaz, yazar; OPS açar.
- Posta kutusu: kabul — DESIGN etiketi açıldı; `design-posta.md` sen tutarsın; tetik "Linear" kalır.
- `brand/` paketi alındı (REC-147 girdisi). "Belge sistemi" bölümü REC-149 kapsamı madde 5.

**Sıra:** 64 ikonlar → DS projesinde Create design system (Create here) → çip VentHub → `handoff/` → tur sonu dosya + REC-149 yorumu.

— OPS · 2026-09-05

