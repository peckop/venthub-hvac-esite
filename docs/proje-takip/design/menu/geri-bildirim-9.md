
# Geri bildirim 9 — ÇERÇEVE DÜZELTMESİ: site İKİ KİPLİ; boşluk listesi v2 bu çerçeveyle (OPS, 2026-09-04 akşam; Recep onayı ile)

Öncelik: geri-bildirim-8'in ÜSTÜNDE. Bu tur çizim değil, sayım + düzeltme. Çıktı: `bosluk-listesi-v2.md` (tablo) +
`Ürün Seçimi Alternatifleri v3.dc.html` (madde 73–76 düzeltmeleri, v2 ARSIV) + `zorunlu-icerik-haritasi.md` güncellenir.
İmza ve erişim kuralları aynen. Numaralar 77'den.

## 77 — ÇERÇEVE: "teklif odaklı" = satış kipi KAPALI, YOK değil  [OPS hatası, düzeltme]
Karar belgesi K1 aslında şöyle der: "Sepet ve satış kipi şirket kurulunca açılır; sepet kodu ve /cart silinmez." OPS bunu
brief'lere "satış kipine kadar YOK (K1)" diye yanlış geçirdi; Design de içerik haritasına "YOK (K1)" yazdı. Doğrusu:
**VentHub iki kipli tek sitedir.** Teklif kipi bugün açık. Satış kipi (sepet · ödeme adımları · sipariş onayı · sipariş
takibi · faturalar · iade · kargo · havale bildirimi · mesafeli satış ve iade metinleri · fiyat) kodda ZATEN VAR, tek
anahtarla kapalı (`NEXT_PUBLIC_ODEME_ACIK` + veri kipi `hide_price`). Şirket açıldığı gün yeni tur/proje DEĞİL, anahtar
açılır. Bu yüzden satış kipi ekranları yeni tasarım diline ŞİMDİ çizilir, kabukla birlikte kodlanır, kapalı bekler.
Bundan sonra hiçbir belgede "K1 gereği yok" yazılmaz; "satış kipi — çizilir, kapalı bekler" yazılır. Tek gerçek "yok":
kampanya bandı gibi bilerek istemediklerimiz.

## 78 — Boşluk listesi v2: 47 yol, tek tablo, beş hâl  [YAZ]
Kaynak: depo `src/app/[lang]/**` müşteri yolları (OPS sayımı 47, `bosluk-listesi-2026-09-04.md`; Design bağımsız saysın,
fark yazılsın). Her satır: yol · teklif kipinde var mı · **hâl** ∈ {ÇİZİLDİ (ekran no) · ŞABLONLA KAPANIR (hangi şablon) ·
SATIŞ KİPİ — şimdi çizilir, kapalı bekler · FAZ 4 (giriş/hesap içi) · GERÇEKTEN YOK (sebep)} · not.
Satış kipi satırları (en az): /cart (sepet; teklif listesiyle aynı kalıp, düğme adı değişir), /checkout (adres · ödeme ·
özet), /payment-success, /account/orders + detail, /account/invoices, /account/returns, /account/shipments,
/legal/mesafeli-satis-sozlesmesi, /legal/on-bilgilendirme-formu; Hesap yaprağının satış hâli; footer Yasal'ın satış hâli
(6 kalem); ürün sayfası eylem bloğunun satış hâli (K6 "iki kip"); İletişim yaprağına "Kargo takibi" satırı (satış hâli).
Teklif kipinde eksik sayfalar (çizilecek, sonraki tur): /brands + /brands/[slug] · /contact tam sayfa · /about · SSS ·
Bilgi Merkezi makale sayfası · 404 · teklif formu + teşekkür ekranı · "Nasıl teklif alınır".

## 79 — Alternatifler v3: madde 73–76 uygulanır (geri-bildirim-8)  [DÜZELT]
Ofis örneği (72) · kart sayıları `technical_specs`'ten, uydurma yok (73) · dördüncü hüküm "değerlendirilemedi" (74) ·
çerez şeridi çizilmez (75) · footer: **marka logoları KALKAR**, "Markalar" metin bağlantısı yeter (Recep + Design + OPS
aynı görüşte; ana sayfa marka bloğu kalır) (76).

## 80 — İçerik haritası güncellenir
"YOK (K1)" satırları → "SATIŞ KİPİ — çizilir, kapalı" ; "Sipariş takip" teklif hâlinde "Tekliflerim", satış hâlinde
"Siparişlerim"; "Havale bildirimleri" satış kipi; "Özel kampanya" GERÇEKTEN YOK kalır.

## Yapılmayacaklar
Bu turda satış kipi EKRANLARI çizilmez (tabloya girer; ayrı tur). Menü v15 / Ana Sayfa v9 değişmez. A/B/C kararı:
Recep "tek sayfa seçici, grup grup, ürün sayfası en son" dedi = A; C kural tablosu sonrası; B çizilmez.

