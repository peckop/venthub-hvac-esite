
# Gözden geçirme v1 — OPS eleme taslağı (2026-09-04 14:40; Recep onayına sunuldu)

Kaynak: `gozden-gecirme-bulgular-v1.md` (Design/Fable, 28 bulgu: 8 AYKIRI · 9 BOŞLUK · 11 İYİLEŞTİRME).
Sınıflar: **RECEP** = yapısal/ticari, tek başına sorulur · **OPS** = OPS hükmü, Recep gördü · **DESIGN** = sonraki tura brief kalemi · **KOD** = şeride iş.

## RECEP kararı gereken (5)
| # | Bulgu | OPS önerisi |
|---|---|---|
| a.1 | Ürün sayfasındaki "aylık elektrik ₺" kutusu K1'e (fiyat yok) aykırı | Para birimi KALKSIN; kutu kWh/ay + "güç payı %" ile kalsın. |
| a.4 | v11'den düşen "dönen fan animasyonu" ve "koyu mod" için Recep onayı kayıtsız | İkisi de DÜŞSÜN (animasyon performans/3D-kapalı kararıyla çelişir; koyu mod Faz dışı). Onay istenir. |
| c.1 + c.2 | `/cart` sitemap'te yayında; teklif listesinin adresi yok | `/tr/teklif-listesi` (EN `/en/quote-list`), `/cart` → 301; Faz 2 yayınıyla. |
| d.2 | Cihaz seçiminin yeri (açık konu) | Design önerisine KATILIYORUM: tek seçici sayfası (Hesaplayıcılar altı, 4 yol → 1 + 301) + senaryo sayfasında "Bu senaryo için fan seçin" çerçeveli düğme; üründeki panel kalır (K12). |
| e.1 | Mobil header Hesap + dil sağ üst (Recep eğilimi); Design "390 px'te sığmaz" diyor | Design de benim sabahki yanlışımı yaptı: v13'te arama logonun ALTINDA ayrı satır, logonun sağı boş. Recep'in yönü uygulanabilir; Design iki hâli çizsin (hesap+dil sağ üst / hesap sağ üst + dil yaprakta), Recep seçer. |

## OPS hükmü (Recep gördü; itiraz yoksa yürür)
- a.2 Seçici sayfası çizilmedi → d.2 kararıyla birlikte Design'a (1 artboard, masaüstü + mobil).
- a.3 Panelin görünürlüğü → Design: 07c'de çağrı satırı 1440×900 ilk ekranda görünür olacak (ölçüm), sayfa üstünde ek işaret YOK (K9 sadelik).
- a.5 Kısa kabuk hâli (sürücü, 3 satır tablo) → Design: 07c'nin "kısa" artboard'u.
- a.6 Düğme oranı → ölçüm Faz 3'te; kural değişmez. KABUL.
- a.7 Panel değerleri oturum boyu tutulur → Design altyazı + KOD notu (Faz 3). KABUL.
- b.1 Kategori "üç mod" çizilmemiş → K8 netleşir: mod = vitrin (dal ≥3) / anlatım (tek dal, senaryo metni) / seri listesi (dal yok, doğrudan seriler); mod DB bayrağı değil DAL SAYISIndan türer. Design üç hâli çizer.
- b.2 Tüm ürünler Faz 1–2'de = ekran 06 boş süzgeç, harita Faz 3. KABUL, K13'e not.
- b.3 ATEX çipi = sertifika faseti (technical_specs), dal değil; boşsa görünmez (K7). KABUL, Design altyazı.
- b.4 06b'ye süzgeç başına sayı satırı. KABUL.
- b.5 Faset başlıkları Archivo 11/600. KABUL (K2 disiplini).
- c.3 Şablon tablosu (hangi sayfa hangi şablon) → OPS yazar, Kararlar'a K17 olarak girer; marka sayfası = liste şablonu + marka başlığı.
- c.4 Eski→yeni adres eşleme tablosu (40→33, 301/410) → KOD (URUN, Faz 2 öncesi), Design'a gitmez.
- c.5 Bilgi Merkezi + hukuki için tek uzun-metin şablonu → Design 1 artboard. KABUL.
- e.2 Hesap yaprağı K16'ya göre yeniden (girişsiz hâl, dil satırı, "Siparişlerim" KALKAR). Design.
- e.3 "Projeyi oluştur" ayrı yaprak notu. Design altyazı. KABUL.
- e.4 Giriş + hesap kabuğu şablonları → Faz 4 Design (K16). Kayıt.
- e.5 Masaüstü Destek girişi → header "İletişim" bağlantısı Destek yaprağının masaüstü karşılığını açar (WhatsApp · Ara · Teknik destek · Kargo · İletişim formu). Design.
- e.6 K9 "≤9 = ekranda görünen, kaydırma dışı" tanımı. KABUL, Kararlar'a.
- e.7 Menü kiremitlerinde sayı yok, "Tüm ürünler 375" istisna. KABUL, K9'a not.
- f Boşluk doğrulaması: A 42/47, B 7/7, sitemap 192/192 — iki bağımsız sayım TUTTU. Liste doğru.
- Karar dışı: "Ürünü incele" üçüncü düğme → KALKSIN (K5 iki eylem); `?sku=` sitemap/hreflang'a girmez (KOD notu); mobil varsayılan Kart, tablo ikincil (K13'e not).

## Sonraki Design turu (yarın): DESIGN kalemleri tek brief'te
seçici sayfası · 07c kısa kabuk · kategori 3 mod · 06b sayı satırı · faset başlık stili · uzun-metin şablonu · Hesap yaprağı (K16) · masaüstü Destek · mobil header 2 hâl · "Ürünü incele" kalkar · altyazı notları (a.7, b.3, e.3).

