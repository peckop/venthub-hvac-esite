
# Geri bildirim 10 — DESIGN-MENU (OPS, 2026-09-05 12:40 TR)

Kaynak: Recep + OPS. v3 notları okundu (Ürün Seçimi Alternatifleri v3): **KABUL**, düzeltme yok — üç öz-düzeltme ve
"ürün değişirse kimlik + çip + açıklama + eksen aynı turda veriden" kuralı doğru; bu kural kararlara geçer (K21 adayı).
Sonraki üç madde yeni iş. Sıra: **80 → 81 → 82.** Kabuk v2 (Menü v16 + Ana Sayfa v10) bunlardan ÖNCE değil, 80 ile
BİRLİKTE yürür: 80'in çıktısı Kabuk v2'nin ölçüsüdür.

## 80 · Tasarım sözleşmesi (design-dna şeması) — v15 Menü + v9 Ana Sayfa için, ÖLÇEREK
**Sorun (Recep):** Design'da çizilen stiller canlıdan bambaşka olacak; kod tarafında `tokens.js` var, ikisinin arasında
yazılı köprü yok. "Design'ın kırmızısı kodda hangi değere denk geliyor" sorusunun cevabı bugün göz kararı.
**İş:** Projeye yüklenen `tasarim-sozlesmesi-sema.md` (design-dna şeması, üç kat: **design_system** ölçülebilir token ·
**design_style** hissedilen · **visual_effects** 3D/kaydırma/parallax) ile **kendi çizdiğin** iki dosyadan
(`Menü Tasarımı v15.dc.html`, `Venthub Ana Sayfa v9.dc.html`) tek bir JSON çıkar: `tasarim-sozlesmesi-v1.json`.
- Değerler dosyadan **ölçülür** (CSS'te yazan hex/px/rem/ms), tahmin edilmez; kaynak dosya ve satır atfı `meta.source_references`'a.
- İki dosya çelişirse baskın değer + varyant notu (şema kuralı).
- `visual_effects`: bugün çizilmeyen her kategori `enabled:false` — vaat yok.
- Yanına 1 sayfalık `tasarim-sozlesmesi-notlar.md`: hangi alan ölçüldü, hangisi çizimde yok (boş bırakıldı, uydurulmadı).
**OPS sonra:** bu JSON ile mevcut `src/design-system/tokens.js` farkı satır satır → kodda neyin değişeceğinin ilk gerçek ölçüsü →
Lego kararıyla (REC-106, az şablon + veri) aynı masaya. Kural 8 (tokens SSOT) değişmez: sözleşme tokens'ı **besler**, yerine geçmez.

## 81 · Ürün sayfası v2: hikâye akışı (aile PDP üst bloğu) — K20
**Karar (Recep 09-05, "sen yönet"):** aile anlatımı **ayrı seri sayfası DEĞİL**, aile ürün sayfasının kendisi kaydırmalı
hikâye olarak akar; teknik tablo ve eylem bloğu ilk ekranda kalır (K12). Systemair'ın 6 yapısal bloğu (ölçüm raporu m.3)
bölümlerdir. **İçerik önce:** REC-146 içerik hattı metni üretmeden bu sayfa çizilir ama YAYINA girmez.
**Kurallar (scroll-craft'tan alınan, motoru alınmadı):**
1. **Gramer:** "bölümlü editoryal" (chaptered editorial). Film gibi tek çekim, video kaydırma, yatay galeri DEĞİL.
2. **İlk ekran değişmez:** ad · 2-4 kalın madde · teknik tablo · eylem bloğu · varyant seçici (07c kalıbı). Hikâye bunun ALTINDA başlar.
3. **Bölüm aileleri ≥4, ardışık tekrar yok:** sabitlenen başlık + satır satır oluşan metin (pin) · kesit görsel + açıklama (reveal)
   · sayı bloğu (yalnız `technical_specs` değerleri, uydurma sayaç YOK) · karşılaştırma/varyant tablosu · belge/indirme (REC-145 gelince).
4. **İmza hareketi = 3D ürün**, YALNIZ GLB modeli olan üründe (bugün 0/374 — vaat kuralı: model yoksa blok çizilmez, "yakında" yazılmaz).
   Modeli olmayan üründe imza hareketi = kesit görselin kaydırmayla katman katman açılması (statik görsel + maske, video değil).
5. **Yasaklar:** "kaydırarak keşfet" oku · 01/06 bölüm sayacı · her bölümde ortalanmış metin · görsele gömülü metin · yapay video ·
   uydurma istatistik · em dash.
6. **Reduced motion:** hareket kapalıyken sayfa aynı içerikle statik ve tam okunur; `transition: all` yok, yalnız transform/opacity.
7. **Mobil ayrı kompozisyon:** telefon başka makinedir; 390 genişlik ayrı çizilir, dokunma hedefleri büyür, kesit görseller dikey kırpım.
8. **Doğrulama:** masaüstü · mobil · reduced-motion üç ekran görüntüsü teslimle gelir.
**Teslim:** `Urun Sayfasi v2 Hikaye.dc.html` (1440 + 390), örnek ürün v3'teki **Vortice Lineo Quiet** ailesi (bütün sayılar
`technical_specs`'ten, v3 disiplini), + `urun-sayfasi-v2-notlar.md` (hangi bölüm hangi aileden, neden).

## 82 · Brief düğmeleri (taste-skill) — bundan sonraki her turda başa yazılır
`DESIGN_VARIANCE 4 · MOTION_INTENSITY 3 · VISUAL_DENSITY 7` (B2B mühendis; düzen sakin, hareket az, bilgi yoğun).
Anti-default listesi gözden geçirme ölçütüdür: mor gradyan · üç eşit özellik kartı · her yerde cam efekti · sonsuz döngü animasyon ·
Inter + slate-900 · ortalanmış kahraman. Bunlardan biri çizimde görünürse notlarda gerekçesi yazılır.

## Sayı disiplini (değişmez)
4 kalın madde: en çok 4, en az 2. Her sayı `technical_specs`/`description_i18n`'den. "veri yok" satırı yazılmaz.

— OPS · 2026-09-05

