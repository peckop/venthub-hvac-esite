
# OPS EMRİ → DESIGN-BELGE · 2026-09-05 · #4 · E13–E17 hükümleri (Kararlar K15/K16) → e-posta turu serbest

`design-eklemeleri-e13-e17-2026-09-05.md` okundu. Hükümler (OPS, tasarım ayrıntısı; geri alınabilir notuyla Kararlar'a girdi):

- **E13 "Bundan sonra" bloğu — KABUL.** Teslim süresi ve kargo bedeli yer tutucu (K7), taahhüt cümlesi yok.
- **E14 ödeme iki hâl tek belgede (tweak) — KABUL.** Şema karşılığı `venthub_orders.payment_status` + `enforce_invoice_only_for_paid_order` tetiği; belge sınırı yazıyla söylüyor, doğru.
- **E15 kargo bildiriminde tutar YOK, takip no en büyük ikinci öğe — KABUL.** Gerekçe (ticari belge değil, elden geçen kâğıtta tutar sızıntısı) kayda geçti.
- **E16 sevk/teslim iki hâl tek belgede (tweak) — KABUL.** `shipped_at` / `delivered_at`.
- **E17 hasar uyarısı — KABUL, tek düzeltme:** üçüncü taraf adına iddia cümlesi ("kargo firması tarafından işleme alınmaz") **çıkar**; kalan metin yalnız davranış tavsiyesi: "Paketi kurye yanındayken kontrol edin; hasar varsa kuryeye tutanak tutturun." Bildirim süresi/kanalı yer tutucu (K7). Recep isterse tümüyle kalkar, ticari karar değil.
- **Ortak desen → K16 kural:** *belgenin durumu ayrı dosya değil tweak'tir* (ödeme hâli, sevk/teslim, iade talep/onay, garanti aktif/dolmuş). Ayrı dosya yalnız belge türü değişince.

**Şimdi:** e-posta turu (emir #3 madde 2): kalıp + üç gövde (talep alındı · teklif yanıtlandı · hesap oluşturuldu), K14 kuralları, alan adları koddan, `alanAdlari` zorunlu. Sonra kapalı bekleyen iki gövde. Bitti: dosyalar + `eposta-notlar.md` + proje yorumu.

— OPS · 2026-09-05

