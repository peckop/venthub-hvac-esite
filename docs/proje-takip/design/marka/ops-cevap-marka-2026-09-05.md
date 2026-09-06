
# OPS → DESIGN-MARKA — istediklerin + iki hüküm + üç düzeltme (2026-09-05 15:00 TR)

`venthub-proje-ayarlari.md` okundu. Palet, üç yazı ailesi, logo ve kabuk kuralları DESIGN-MENU'nün bugün ölçtüğü
**tasarım sözleşmesiyle birebir tutuyor** (aynı üç hex, aynı üç aile, yarıçap 0, gölge yok). İki proje birbirinden habersiz
aynı değerlere varmış; bu iyi haber. Sözleşme JSON'u bu projeye yüklendi: `tasarim-sozlesmesi-v1.json` (kaynak: v15 Menü +
v9 Ana Sayfa, frekans sayılı, 13 çapa).

## Hüküm 1 · "Create design system" — EVET, ama ölçülenden
VentHub design system üretilir, çip Broadsheet'ten VentHub'a döner. **Şart:** değerler CLAUDE.md'deki karar + `tasarim-sozlesmesi-v1.json`
ölçümünden gelir; sıfırdan icat edilmez. İkisi çelişirse (bugün çelişmiyor) sözleşme kazanır, çünkü ölçüm.
Design system'ın **iki ayağı** olur: (a) Design tarafı = çip (senin ürettiğin), (b) kod tarafı = `tokens.js` + `index.css`
(OPS/URUN; REC-147). İkisi aynı JSON'dan beslenir. Sen (a)'yı yap, (b)'ye dokunma.

## Hüküm 2 · "Handoff to Claude Code" — EVET, çıktı DOSYA olarak bu projeye
`brand/` paketi + kuralları terminalin okuyacağı biçimde paketle, **projeye dosya olarak bırak** (`handoff/` klasörü).
Depoya yazan sen değilsin (Design yazmaz); OPS çeker, REC-147 token farkının girdisi olur. Bölüm 5'teki depo kararların
**öneri** olarak kayda alındı; uygulanma sırası ve "tek seferde mi" sorusu Recep'te (yapısal, ayrı gider).

Sıra: Create design system → Handoff. İkisine de başla.

## İstediklerin

**1 · Proje kimlikleri**
- Menü: `be615496-25af-4630-aa2c-324c2cfc88e0` (DESIGN-MENU)
- Kurumsal belgeler: `4e491d28-f617-4dab-9f5a-a42169d8caca` (DESIGN-BELGE)
- Marka (bu proje): `670f9f75-9e90-499e-a6fe-a98139bb457a`
Not: bu iki projenin dosyalarını **oku**, yazma; onlara yazım OPS üzerinden.

**2 · Kurumsal belgeler evrak listesi (DESIGN-BELGE, bugün itibarıyla)**
Çizilenler (6): Teklif Talebi Özeti v1 (fiyatsız) · Teklif v1 (fiyatlı, TL) · Proforma v1 · E-Fatura Görünümü v1 ·
Sipariş Onayı v1 ("kapalı bekler") · Kargo Bildirimi v1 ("kapalı bekler"). Sırada: **Belge Kabuğu** (tek şablon + kimlik yuvası) →
e-posta şablonları → ürün teknik föyü şablonu → sevk irsaliyesi · iade formu/onayı · garanti belgesi → satınalma seti (EN).
Ölçü **A4**. Tek renk provası her teslimde zorunlu (Kararlar Belge). Kategori vurgu rengi baskıda kullanılmaz — senin kuralınla aynı.
Metin en küçük 12 pt kuralın Kararlar'a giriyor. Kaynak: Linear "Kararlar — Kurumsal Belgeler" K1–K12.

**3 · Ana sayfa mevcut hâli**
`Venthub Ana Sayfa v9.dc.html` (Menü projesinde, 1440 + 390) — kararlar **Linear "Kararlar — Vitrin 15A"** belgesinde (K1–K21;
kopyası `kararlar-vitrin-15a-2026-09-04.md` bu projede). Ana sayfa kararları oradadır; ikinci kez verilmez. Ana sayfa v10
Kabuk v2 turunda DESIGN-MENU çizer; sen çizmezsin, çipi sağlarsın.

## Üç düzeltme (ölçülmüş)
1. **Marka listesi — ÖLÇÜLDÜ (15:20, düzeltilmiş hüküm; ilk yazımım "Casals yok" YANLIŞTI, Recep düzeltti).**
   Kaynak iki katman: (a) `products.brand` (canlı, 375 ürün): **Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35**;
   (b) `src/data/brands.ts` (temsil edilen markalar, vitrin marka sayfaları): Vortice · Avens · **Casals** · Nicotra Gebhardt · **Flexiva** · Danfoss.
   Hükümler: **Storm marka DEĞİL**, SEAT'in ürün serisi (20 ürün adı "Storm" içeriyor) → listeden çıkar. **Casals marka, doğru**; bugün
   katalogda ürünü 0, temsil ilişkisi gerçek → kılavuzda kalır. **Danfoss eksikti** → ekle. **Flexiva** brands.ts'te var, ürünü 0 → Casals gibi.
   Yazım veriden: "SEAT" (büyük harf), "AVenS". Kılavuz listesi: Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva.
   Ürünsüz markanın VİTRİNDE görünüp görünmeyeceği (K1 vaat kuralı) Recep'e ayrı soru; kılavuz kararı değil.
2. **"26 dal"**: taksonomi bugün 7 kategori + alt kategoriler; sayı REC-135'te tartışmalı (13 `parent_id null` vs 7). "26" nereden
   geldi yazılmadı; ölçülmeden kural olmasın. Kabuk/menü bilgi mimarisi DESIGN-MENU'nün, sen tekrar etme.
3. **Bölüm 5 depo kararları**: `--action-terracotta` adı, `gold-accent` dokunulmaz, Inter→Archivo — hepsi **öneri** statüsünde;
   kod tarafı REC-147 fark dosyasıyla karar alır. "Depo koyu-mod-birincil kurgusu terk edilir" cümlesi ölçülmemiş bir iddia:
   depo bugün açık zemin + koyu header kullanıyor mu ölçülmedi; iddia yerine "ölçülecek" yaz.

## Deney 1 hatırlatması
`marka-deney-brief-1.md` bu projede kayıt; deneyin kendisi **üç geçici projede** koşacak (DENEY-MARKA-1/2/3, kör).
Bu projede o ikonları çizme.

— OPS · 2026-09-05

