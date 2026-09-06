
# OPS EMRİ EKİ → DESIGN-MENU · 2026-09-05 · #8 · SATIŞ KİPİ ekranları v17'ye girer (K1a; emir #4–#7'nin eki)

Recep: "sepet aktif edildiğinde sayfalar hazır olacaktı, bu hiçbir yerde yok." OPS ölçtü: v16'da `Ödeme` 0 · `Sipariş` 0 · `İade` 0 ·
`Sepet` 4 (yalnız etiket). Anahtar ve Kip Haritası satırı "ÇİZİLECEK (satış kipi turu)" diyor ama tur hiç planlanmamıştı. **K1a:** satış
kipi ekranları yeni tasarım diline ŞİMDİ çizilir, kabukla birlikte kodlanır, "kapalı bekler" etiketiyle; şirket açılış günü anahtardır.

**v17'ye zorunlu kareler (masaüstü + 390 eşi), her biri "kapalı bekler" altyazılı, K16 mantığıyla teklif kipinin eşleniği olarak:**

| # | Kare | Ne | Teklif kipindeki eşi |
|---|---|---|---|
| S1 | **Sepet** | Teklif sekmesinin satış hâli, aynı yuva; kalemler · adet · birim fiyat · KDV · toplam · kargo satırı (REC-47: sabit "Ücretsiz" YAZILMAZ, hesaplanır ya da "teslimatta bildirilir") · tek kiremit "Ödemeye geç" | Teklif listesi (kare 10) |
| S2 | **Ödeme adımları** | adres → fatura bilgisi (kurumsal/bireysel, `user_invoice_profiles`) → ödeme (İyzico kart formu yuvası) → onay; tek sayfa dikey adımlar ya da 3 kare; mesafeli satış + ön bilgilendirme onay kutuları (metin hukuktan, dizgi senden) | — |
| S3 | **Sipariş onayı ekranı** | sipariş no (tam biçim, `2026-000318`) · özet · "bundan sonra" bloğu (Belge E13 ile aynı dil) | teklif gönderildi ekranı |
| S4 | **Siparişlerim + sipariş takibi** | Hesap sayfasında "Sipariş & Kargo" grubu (K19 madde 5); liste + tekil sipariş: durum çizgisi (alındı → hazırlanıyor → kargoda → teslim), kargo takip no en büyük öğe (Belge E15) | Tekliflerim |
| S5 | **İade talebi + iade durumu** | sipariş içinden "iade talep et" → form (kalem seç · sebep · fotoğraf yuvası) → durum (talep/onay, K16 tweak) | — |
| S6 | **Header/alt çubuk satış hâli** | "Teklif (n)" → "Sepet (n)"; alt çubuk Teklif sekmesi → Sepet; fiyat görünür (hide_price kapalı) — kare 13'ün genişletilmiş hâli | kare 13 |

Kurallar: K1a (kapalı bekler etiketi, Belge E8 diliyle: lacivert 1 px çerçeve + mono büyük harf + anahtar adı `NEXT_PUBLIC_ODEME_ACIK`) ·
K5 tek kiremit · K7 boş satır yok · K22/K23 · DS bileşenleri (KabukBandi · AnaEylemDugmesi · CerceveliDugme · TeknikTablo · Kart · Cip) ·
fiyat yalnız bu karelerde ve `hide_price` kapalı varsayımıyla. Veri alanları koddan (`venthub_orders` · `venthub_order_items` ·
`order_invoices` · `user_invoice_profiles` · `venthub_returns`); uydurma alan yok, `alanAdlari` altyazıda.

**Kapsam notu:** bu 6 kare v17'nin 29 + M1–M9 setine EKLENİR. Toplam büyük; sıra: önce 29 + M1–M9 (Recep'in beğenmediği kabuk),
sonra aynı dosyada S1–S6. İki teslim yorumu, tek dosya. Hikâye ve seçici kareleri #6 gereği zaten içeride.

— OPS · 2026-09-05

