# Tasarım envanteri — Design → site geçişi (2026-09-25, TASARIM)

Kaynaklar (ölçüm): Design Menü `Menü Tasarımı v18.dc.html` (tam, 1,37 MB, 52 kare + 2 toplu bölüm; pencereli indirme) ·
v17 arşivi (U2) · DS canlı `tokens/renk.css`, `tokens/tipografi.css`, `ds-devir-uygulandi-2026-09-14.md` (DesignSync) ·
Marka ve Belge dosya listeleri (DesignSync, canlı) · kararlar aynası `linear/kararlar-vitrin-15a-2026-09-24.md` ·
site kodu `origin/master` (f9d614f75 sonrası) + `docs/audits/tasarim-kod-envanteri-2026-09-06.md`.
Ayrıntılı kare tablosu: `tasarim-envanteri-2026-09-25-menu.md` · DS/Marka/Belge ayrıntısı: `tasarim-envanteri-2026-09-25-ds-marka-belge.md` (aynı klasör).

Durum sözlüğü: **HAZIR** = çizili ve karara bağlı · **YARIM** = çizili ama açık kalem / "öneri" rozetli / bayat ·
**YOK** = tasarımda çizim yok · **ÇELİŞİYOR** = tasarım ile bugünkü site yapısal olarak farklı (renk/yazı tipi farkı sayılmaz, o 1. satırın konusu).

## 1. Geçiş birimleri (Recep'e sıralama sorusu bu tablodan)

| # | Geçiş birimi | Design kareleri | Tasarım durumu | Bugünkü site | Kodda hazırlık | Etkisi |
|---|---|---|---|---|---|---|
| 1 | **Temel görünüm** (yazı tipi, renk, köşe, gölge, boşluk) | DS: 66 token, 11 bileşen, "temiz" (09-14) | HAZIR | ÇELİŞİYOR: Inter (DS "Inter kullanılmaz"), lacivert `226 71% 40%` (DS `219 48% 20%` = #1A2B4A), turkuaz `189 78% 53%` (DS `194 100% 35%`), `rounded-*` 1.527 kullanım, `shadow-*` 555 kullanım (DS: köşe yok, gölge yok) | Marka renkleri `--marka-*` src/index.css'te DS değerleriyle TANIMLI ama Tailwind'e bağlı değil, 0 kullanım (INV-PALET-1 testi var). 11 DS bileşeninden 8'i kodda yok, KabukBandi yazılmış (bayrak kapalı), Kart kısmi | Bütün site bir anda değişir; tek iş, tek yayın. Diğer her birimin ön koşulu |
| 2 | **Kabuk** (header, footer, mobil üst şerit, alt sekme çubuğu, teklif paneli) | A1–A5 HAZIR · A0, A2b, A5b, A6, A7 YARIM · A8/A9 öneri | HAZIR (çekirdek) | ÇELİŞİYOR: eski menü; iletişim ayrı sayfa (tasarım: panel, K37-c "U3 = PANEL") | `YENI_KABUK_GEZINMESI = false` — StickyHeader/Footer/HeaderTeklifPaneli/MobilAltSekmeCubugu yazılmış, kapalı | Her sayfanın üstü/altı; 1 ile birlikte açılması doğal |
| 3 | **Bilgi Merkezi + uzun metin** | F1 HAZIR · F2 (eski U2) HAZIR · F4 "Nasıl teklif alınır" YARIM · F3 kararı verildi ama karede açık | HAZIR | URUN kuruyor (dal `urun/pr2-bilgi-merkezi`, yayında değil); F4 sayfası sitede yok | URUN'a 4 düzeltme + sağ sütun önerisi gitti (bu turda) | Blog yayını; Recep önceliği |
| 4 | **Ürün sayfası** | B7, B7b–B7e HAZIR · B7v varyant seçici, B7f kaldırılan model YARIM | HAZIR | ÇELİŞİYOR (yerleşim + adres): adres `?sku=` ile, tasarım `/tr/urun/<ad>-p-<sku>` | `ADRES_SEMASI_K3B = false` — adres üreticisi yazılmış (REC-300 Faz 3a), URUN yürütüyor | 442 ürün adresi; Recep önceliği. Adres işiyle AYNI yayında yapılırsa ürün sayfası tek sefer değişir |
| 5 | **Kategori · dal · seri · liste** | B1b, B3–B6, B5b HAZIR (B1b rozetli) | HAZIR | ÇELİŞİYOR: tek seviye `/category/<slug>`, tasarım `/tr/kategori/<kategori>/<dal>`; `/products` vs `/tr/urunler` | Adres işi (4 ile aynı bayrak/ağaç işi, REC-300 Faz 1-B) | 4 ile birlikte |
| 6 | **Ana sayfa** | B1 HAZIR | HAZIR | Var, eski görünüm | — | 1+2 gelince büyük kısmı kendiliğinden değişir |
| 7 | **Teklif listesi akışı** | B9 HAZIR · B9b, B10, B11 YARIM | YARIM | ÇELİŞİYOR: `/cart` + `/checkout`; tasarım `/tr/teklif-listesi`, `/gonder`, `/alindi` | Satış kipi anahtarı `satisKipi.ts` var | Teklif iste akışı; ticari |
| 8 | **Arama sonuç sayfası** | D1–D4 HAZIR · D5 YARIM | HAZIR | YOK (sitede ayrı arama sayfası yok) | Arama altyapısı (URUN, arama-standard) var; sayfa yok | Yeni sayfa |
| 9 | **Karşılaştırma** | B8, B8b HAZIR ama B8 "bayat": dal başına alan kümesi bekliyor (alan-ekran haritası §3b) | YARIM | YOK | — | Yeni sayfa; KATALOG verisine bağlı |
| 10 | **Ürün Seçici** | E1, E2 HAZIR · E3 YARIM | HAZIR | Var (`/urun-secici`, tasarım `/tr/secici`) | — | Adres farkı küçük |
| 11 | **Hesap** | B12 "Tekliflerim", F5 giriş/kayıt YARIM | YARIM | `/account/*`, `/auth/*` | — | K62: ERTELENDİ |
| 12 | **Senaryo** | C1, C2 HAZIR · C3 (montaj/kullanım dalı) HAZIR | HAZIR | Senaryo sayfası YOK | Senaryo etiketi verisi 0 (yayın koşulu: etiketsiz yayınlanmaz) | Veriye bağlı; en sona |
| 13 | **Mobil kabuk** (G: M1–M9) · **Satış kipi** (H: S1–S6) | çizili (toplu bölüm) | HAZIR (başlık düzeyinde ölçüldü) | Satış kipi kodda var, kapalı | — | 2 ve 7 ile birlikte |
| 14 | **Kurumsal belgeler** (Belge projesi) | ~20 belge (teklif v3, proforma v2, sipariş onayı v2, KVKK seti, mesafeli satış, kartvizit, antetli…) + 17 e-posta şablonu | HAZIR (çoğu v2/v3) | E-posta şablonları kısmen kodda (edge function'lar); belge başına kod karşılığı bu turda ölçülmedi | — | Site görünümünden bağımsız; ayrı sıra |
| 15 | **Marka varlıkları** (logo seti, 16 kategori + 9 senaryo ikonu × 3 boy × 3 renk, UI ikon seti 25) | HAZIR | Sitede `public/brand/` yok; tek `public/images/logo.png` | — | 1 ile birlikte |

Menü kare sayısı: 52 · HAZIR 33 · YARIM 19 · YOK 0. Yapısal fark taşıyan kare 27 — bunların çoğu 4/5 (adres işi),
8/9 (yeni sayfa) ve 7 (teklif listesi adresi); "çelişki" değil, sitenin henüz geçmediği hedef.

## 2. Design dosyalarının kendi içindeki tutarsızlıklar (Design'a düzelttirilecek)

| Yer | Sorun | Doğrusu |
|---|---|---|
| Menü `design_handoff_venthub_menu/README.md` | Broadsheet döneminden kalma teslim paketi: tek serif, 2 px köşe, macenta vurgu, "Sepete ekle YOK", 375 ürün, "primary dolu + secondary çerçeveli" | Arşive alınmalı; kod yazan biri bunu okursa bugünkü kararların tersini kurar |
| Menü v18 B12 | "DESIGN ÖNERİSİ · ONAY BEKLER" rozetli duruyor | K62: ERTELENDİ — rozet/karede işaret |
| Menü v18 F3 (eski U3) | Karede `{{ u3Rozet }}` `{{ u3Dugme }}` çözülmemiş, "açık karar" görünüyor | K37-c: U3 = PANEL, karar verildi |
| DS `tokens/tipografi.css` ↔ Menü v18 F1 | DS uzun metin 16 px / 1.6 / 66ch · F1 17 px / 1.65 / 720 px | Tek değer; K26 gereği değer DS'ten gelir, Menü uyar ya da DS'e değişiklik emri |
| Menü v18 başlığı | "53 kare" beyanı, ölçülen 52 | Sayı düzeltmesi |
| Marka `CLAUDE.md` | "Sepet, favoriler ve hızlı sipariş YOK" | K38/K39: teklif kipinde yok, satış kipinde "Sepete ekle" |
| Belge `CLAUDE.md` :34 | K3 "tablo listesi sabit" (eski hâl) | K3 düzeltmesi: tablo listesi sabit değil |
| Menü `CLAUDE.md` (816 satır) | Geçersiz kurallar işaretsiz duruyor (turkuaz metin, "Teklif listesine ekle birincil", imzada model adı) | Tarihçe `karar-gecmisi.md`'ye, CLAUDE.md'de yalnız geçerli kurallar |

## 3. TASARIM önerisi (sıra)

> **Karar 118 (Recep, 2026-09-25): adres önce.** "Asıl derdim URL tarafında tekrardan kırmadan işi bitirmek."
> Sonuç: tasarım geçişi adres şemasını bir daha **değiştirmez**; zorunlu kalırsa yalnız kalıcı yönlendirmeyle
> ve Recep onayıyla. Yoğun tasarım işi 2026-09-28 haftası. Aşağıdaki 2↔3 tartışması bu kararla kapandı.

1. **Bilgi Merkezi** (sürüyor, URUN) — yayını beklemez, DS'e bağlı değil.
2. **Ürün sayfası + kategori/liste, adres işiyle AYNI yayında** (birim 4+5) — Recep'in 442 adres önceliği; sayfa iki kez değişmez.
3. **Temel görünüm + kabuk + marka varlıkları tek yayında** (birim 1+2+15+6) — bütün siteyi bir kerede yeni görünüme taşır; kodun büyük kısmı hazır (renk tokenları tanımlı, kabuk yazılmış), eksik olan yazı tipi, köşe/gölge temizliği ve 8 temel bileşen. Plan: madde 3 (cetvel + plan-challenger).
   Not: 2 ile 3'ün sırası tartışılabilir. 3 önce gelirse ürün sayfası adres işinde yeni görünümle doğar; ama 3 büyük iş ve adres işini bekletir. Önerim adres işini bekletmemek.
4. **Teklif listesi akışı** (birim 7) — ticari akış, satış kipiyle birlikte.
5. **Arama sayfası**, sonra **karşılaştırma** (birim 8, 9) — yeni sayfalar; karşılaştırma KATALOG verisini bekliyor.
6. **Senaryo** (birim 12) — etiket verisi 0, en sona.
Hesap (11) K62 ile ertelenmiş; belgeler (14) site görünümünden bağımsız ayrı sıra.
