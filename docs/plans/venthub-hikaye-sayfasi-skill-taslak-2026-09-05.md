# TASLAK — `venthub-hikaye-sayfasi` yeteneği (SKILL.md) — 2026-09-05

**Durum:** taslak; Recep gözden geçirir, sonra iki ağaca (`.claude/skills` + `.agent/skills`) aynı içerikle girer.
**Kayıt:** REC-147 · bağlı: REC-106 (Lego + SSOT), REC-146 (içerik hattı), Kararlar 15A K7 · K12 · K20 · K21 · K22 · K23 · K23-a.
**Eritilen kaynaklar:** scroll-craft (gramer · cihaz aileleri · imza hareketi · 3 hâl doğrulama · reduced-motion) ·
taste-skill (üç düğme · anti-default) · redesign-skill (jenerik kalıp denetimi). Motorları alınmadı.

---

```yaml
---
name: venthub-hikaye-sayfasi
description: >-
  VentHub vitrininde HİKÂYE AKIŞLI sayfa (ürün sayfası v2 aile anlatımı, kategori rehberi, senaryo sayfası) tasarlar ve
  kodlar: tek şablon + veri (Lego), bölümlü editoryal gramer, tek imza hareketi, uydurma sayı yasağı, tablo ilk ekranda,
  reduced-motion ve mobil ayrı kompozisyon, 3 hâl Playwright doğrulaması. Şu isteklerde kullan: "hikâye akışı",
  "aile anlatımı", "ürün sayfası v2", "editoryal bölüm", "scrollytelling", "kaydırma akışı", "kategori rehber sayfası".
  KULLANMA: admin ekranları, tablo/liste sayfaları, checkout, hesap sayfaları (çalışma yüzeyi gramerleri).
kaynak_updatedAt: 2026-09-05   # sözleşme v1 (11:34Z) · Kararlar 15A K23-a (13:29Z)
---
```

# venthub-hikaye-sayfasi

Sayfa bir **şablondur**, bölümler **veridir**. Anlatım `product_families.description` / `technical_specs` /
`description_i18n`'den gelir; şablon hiçbir cümle uydurmaz. Ürün değişirse her şey veriden yenilenir (K21).

## 0 · Önce oku (sıra zorunlu)
1. `src/design-system/tokens.js` + `src/index.css` — canlı token (SSOT, kural 8). Sözleşme tokens'ı besler, yerine geçmez.
2. `tasarim-sozlesmesi-v1.json` (DESIGN-MENU ölçümü; kopya `docs/audits/` fark belgesi yanında) — hedef değerler:
   `#1a2b4a` · `#0088b0` · `#d95d0e` (sayfada TEK dolu eylem) · Archivo / Source Serif 4 / IBM Plex Mono · yarıçap 0
   (panel 8 px) · gölge yok · ikon konturu 1.5 · içerik sütunu 1060 · kabuk bandı 74 / oluk 40 / aralık 30.
3. Kararlar — Vitrin 15A (Linear belgesi; ayna `docs/proje-takip/linear/`). Çelişirse Linear kazanır.
4. Bu sayfanın veri kaynağı: aile kaydı + REC-146 altı blok (Gövde · Çark · Motor · Koruma · Kontrol · Montaj).

## 1 · Gramer (scroll-craft'tan eritildi)
- **Bölümlü editoryal** gramer (K20): giriş kimliği → teknik tablo (ilk ekranda, K12) → altı bloktan **dolu olanlar**
  (boş blok ÇİZİLMEZ, K7) → aksesuar/ilgili → tek eylem (Teklif iste, K5).
- **Bölüm davranış aileleri ≥ 4, ardışık tekrar yok** (sabit akış · yapışkan tablo · yatay kaydırmalı seri şeridi ·
  karşılaştırma · 3D/ görsel sahne · madde listesi). Dört aileden azı "tek fikirli sayfa"dır.
- **Tek imza hareketi.** Sayfada bir tane. 3D fan yalnız GLB modeli olan üründe (bugün 0/374 → imza hareketi statik
  kompozisyon ya da yatay seri şeridi). "Renk değiştiren spot" imza hareketi sayılmaz.
- Gramerin yasakları gramerin içindedir: editoryal gramer **pin/scrub** istemez; tam ekran video yok.

## 2 · Brief düğmeleri (taste-skill'den eritildi) — B2B mühendis okuru
`VARIANCE 4 · MOTION 3 · DENSITY 7`. Anlamı: hafif asimetri, kart ızgarasına kaçmayan yerleşim; hareket yalnız
giriş/odak; teknik veri **düz** durur, jenerik kart kabına konmaz (DENSITY > 7 kuralı). Düğmeler brief'e yazılır, sapma
gerekçesiyle yazılır.

## 3 · Anti-default listesi (taste + redesign'dan eritildi, sözleşmeyle birleştirildi)
Yasak: mor-mavi gradyan hero · `rounded-lg` her yerde · gölgeli kart · emoji bölüm işareti · her şey ortalı ·
"01/02/03" sıra işareti (sıra bilgi taşımıyorsa) · Inter/Space Grotesk varsayılanı · lorem · yer tutucu sayı ·
`opacity` ile durum anlatımı (K22: soluk hex + zemin + rozet) · elle çizilmiş logo (K23: `public/brand/` SVG) ·
elle çizilmiş ikon (kontur 1.5 set, K23-a) · "yakında" etiketi (K18-b: "teknik destek iste").

## 4 · Sayı ve vaat (vaat-bütünlüğü cetveli)
Sayfadaki her sayı `technical_specs`'ten gelir ve birimini alandan alır. Kaynağı olmayan sayı YAZILMAZ; kaynağı
olmayan bölüm çizilmez. "Çok satan", "en çok tercih edilen" gibi veri dayanağı olmayan ifade yok (REC-92 dersi).

## 5 · Hareket ve erişilebilirlik
- Her hareketin **hareketsiz eşdeğeri** vardır; `prefers-reduced-motion` altında kompozisyon derinliği korunur, hareket
  düşer. Hareket bileşeni `'use client'` **uç yaprak**tır; sayfa RSC kalır (kural 4).
- **Telefon başka makine:** mobil ayrı kompozisyon (K19 kabuk; yatay şerit → dikey liste; 44 px dokunma hedefi).
- `useSearchParams` kullanan yaprak `<Suspense>` ile sarılır, **sayfa değil** (kural 5 eki, REC-150 dersi).

## 6 · Doğrulama (bitti sayılma ölçütü)
1. Playwright 3 hâl: masaüstü 1440 · mobil 390 · reduced-motion — üçünde ekran görüntüsü + konsol hatası 0.
2. **SSR gövde kelime sayısı > 0** (`curl` ile ham HTML; REC-150 Adım 0 dersi: 0 kelime = Google'a boş sayfa).
3. `axe` ihlali 0 (Vitest + Testing Library).
4. Sözleşme karşıtlığı: sayfada `box-shadow` ≠ none 0 · `border-radius` > 8px 0 · tek `#d95d0e` dolu eylem.
5. Vaat: sayfadaki her sayı için kaynak alanı listelenir (tablo, PR gövdesinde).

## 7 · Yapılmaz
Video/görsel üretimi (kie.ai, ffmpeg) · kendi scroll motoru (Framer Motion + R3F yeter) · saf Three.js DOM (kural 9) ·
GSAP · `next/font` dışında font yükleme yolu · Tailwind arbitrary değer (kural 8) · sözlük dışı metin (kural 7).

## 8 · Çıktı
`src/app/[lang]/products/[slug]/…` RSC sayfa + `src/components/products/hikaye/*` uç bileşenler + veri okuma
`lib/services` (DI, kural 2) + `src/__tests__/conformance/hikaye-*` (sözleşme karşıtlığı + SSR gövde kapısı).
PR gövdesinde: gramer · imza hareketi · düğmeler · 3 hâl görüntüleri · sayı-kaynak tablosu.

---
**Açık sorular (Recep'e değil, OPS/URUN'a):** (1) bölüm davranış ailelerinin kesin listesi Kabuk v2 + ürün sayfası v2
prototipi bitince sabitlenir; (2) "imza hareketi statik" durumunda hangi kompozisyon — DESIGN-MENU ürün sayfası v2'den ölçülür.
