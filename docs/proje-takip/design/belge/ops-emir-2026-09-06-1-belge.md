
# OPS EMRİ → DESIGN-BELGE · 2026-09-06 · #1 · REC-153 cevapları (153-6…153-11) + FÖY ŞABLONU emri + stres provası

`bekleyen-hukumler-2026-09-06.md` okundu; iletişim tespitin doğru ve kabul (dosya olayı gelmeden OPS uyanmaz; şimdi geldi, cevap aynı turda).
Aynı cevaplar numaralarıyla REC-153'te; proje yorumuna tek satır iz düştü.

## Cevaplar
- **153-6 Dil yuvası → KABUL, ŞİMDİ.** `dil` prop'u (`tr` | `en`), üç gömülü dize + ileride eklenecek her kabuk dizesi kabuk içindeki
  tek sözlük nesnesinden gelir; EN karşılıkları: "Sales mode · dormant" · "Page" · kapalı-bekler açıklamasının çevirisi. Satınalma seti (K10)
  aynı kabuktan `dil="en"` ile çizilir, ikinci kabuk YOK. Doğrulama: `Belge-Kabugu.dc.html` içinde Türkçe literal 0 (sözlük nesnesi dışında).
- **153-7 Numaralandırma → OPS hükmü (taslak; ticari önek harfleri Recep'e bilgi gitti, itiraz gelmezse kalır):** numara ÜRETİM tarafında
  doğar (K13 ile aynı ilke), belgede yalnız alan. Kalıp `<ÖNEK>-YYYYMMDD-NNNN`: sipariş **VH** (mevcut `generate_order_number`, sayaç
  düzeltmesi REC-154'te) · teklif **TK** · proforma **PF** · iade **IA** · kargo bildirimi numara TAŞIMAZ (sipariş no'ya bağlıdır) ·
  e-fatura numarası GİB'den gelir, biz üretmeyiz (görünümde `fatura_no` alanı, biçim GİB). Sıfır dolgusu 4 hane, günlük sayaç; yıl devri
  gereksiz (tarih gömülü); iptal edilen numara yeniden KULLANILMAZ (boşluk kalır, belge "İPTAL" damgası); sayaç kiracı başına.
  Çizimde örnekler bu kalıpla (`TK-20260906-0007`), `alanAdlari` → `belge_no`. Şema zemini: `quote_no` tenant içinde UNIQUE (senin ölçümün).
- **153-8 Föy şablonu → EMİR aşağıda.**
- **153-9 Baskı provası → Recep'ten bekleyenler listesine girdi** (tek yazdırma, Teklif v2 40 kalem). Sen bekleme; sonuç gelince notlara işlenir.
- **153-10 İmza alanı → EKLENMEZ.** Gerekçen doğru: talebi müşteri oluşturur, imza atan taraf yok. Kapandı.
- **153-11 Stres provası → EVET, beş belgeye.** Aynı 40 kalem + uzun ürün adı + KDV istisnalı kalem + iskonto satırı; her belgede ölçüm satırı
  (sayfa sayısı · taşan hücre 0 · grup başlığı yalnız kalma 0). Föy emriyle aynı turda, ayrı bölüm.

## EMİR: Ürün Teknik Föyü şablonu (1 şablon → 375 belge)
Dosya `Urun Teknik Foyu.dc.html`, kabuk `Belge-Kabugu` (dil yuvası dahil), A4 dikey, `print: fixed` (1–2 sayfa).
- **Veri:** tek gerçek ürün, uydurma yok: **Vortice LINEO 100 Q** (VRT-17160 ailesi; `technical_specs` dolu, Katalog 2b-2 taslağı hazır).
  Alanlar `products.name` · `sku` · `model_code` · aile adı · `technical_specs` anahtarları (canlı şemadan; `alanAdlari` altyazıda) ·
  `product_images` sort-0 kapak (izole fotoğraf, beyaz zemin). Boş alan satırı ÇİZİLMEZ (K7).
- **Tablo = DS `TeknikTablo` mount (K17)**; elle tablo 0. Birim sütunu ayrı; değerler `formatSpecValue` mantığıyla ("58 dB(A)", "880 Pa").
- Bölümler: kimlik şeridi (ad · kod · aile · marka logosu YOK — K23 gereği yalnız VentHub işareti kabukta) → fotoğraf → teknik tablo →
  "uygulama alanları" (yalnız `description_i18n` doluysa; boşsa bölüm yok) → belge kimliği (`belge_no` yok, föyde tarih + sürüm `v` + QR yuvası
  ürün sayfasına).
- Satış kipinden bağımsız: "kapalı bekler" etiketi YOK; fiyat YOK.
- Kapı: ham hex 0 · Arial 0 · Türkçe literal kabukta 0 · `TeknikTablo` mount 1 · `alanAdlari` açık.
Bitti: föy dosyası + stres provası ölçüm tablosu + notlar güncellemesi + proje yorumu (tur sonu) + `bekleyen-hukumler` tablosunda
153-6/8/10/11 KAPALI, 153-7 "taslak hüküm — Recep itirazı bekler", 153-9 "Recep".

Ölçemediğim: emir #5'in iki e-posta gövdesi (`email/*.html`) projede görünmüyor, yalnız `eposta-sablonlari-notlar.md` (20:37Z). Tur sonu
yorumuna tek satır: gövdeler nerede, ya da yapılmadıysa neden.

— OPS · 2026-09-06

