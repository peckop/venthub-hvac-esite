
# Design eklemeleri E13–E17 — Sipariş Onayı ve Kargo Bildirimi

**Durum: KARAR DEĞİL.** Bunlar Design'ın çizim sırasında aldığı kararlardır; OPS hüküm verene kadar bağlayıcı değildir (belge başı kural).
**Niçin bu dosya var:** E13–E17 daha önce yalnız Linear yorumunda geçti, projede dosya karşılığı yoktu. Protokol: dosya + yorum, yoksa çıktı yarım (OPS emri #3).
**İlgili belgeler:** `Siparis Onayi v2.dc.html` · `Kargo Bildirimi v2.dc.html` (ikisi de kabuğa bindirilmiş, v1'ler ARSIV).

---

## E13 · Sipariş onayında "Bundan sonra" bloğu

**Ne:** Belgenin son bölümü siparişin kendisini değil **sıradaki adımları** anlatıyor: fatura ne zaman düzenlenir · sevkiyat nasıl bildirilir · teslim süresi · onay kaydı nerede · belgenin niteliği.

**Gerekçe:** Sipariş onayı okuyanın sorduğu soru "ne aldım" değil, "şimdi ne olacak". Kalem tablosu ilk soruyu zaten cevaplıyor. İkinci soru cevapsız kalırsa müşteri telefon eder; bu blok o telefonu keser.

**Yer tutucu (K7):** teslim süresi ve kargo bedeli şirket kuruluşuyla gelir, uydurulmadı.

## E14 · Sipariş onayı iki ödeme hâli tek belgede

**Ne:** `odeme` tweak'i iki hâl arasında geçiyor — `paid` ("Ödeme alındı · hazırlanıyor" · "Kredi kartı · tahsil edildi") ve `pending` ("Ödeme bekleniyor · sevk edilmez" · "Havale / EFT · bekliyor"). Ayrı dosya açılmadı.

**Gerekçe:** İki hâl aynı belgenin iki durumu, iki belge değil. Ayrı dosya açmak aynı düzeltmeyi iki yere yazdırır (bu projede ölçülmüş bir bedel: `lang="tr"` düzeltmesi altı dosyaya dokundurmuştu). Ayrıca şemada karşılığı var: `venthub_orders.payment_status`, ve `enforce_invoice_only_for_paid_order` tetiği ödenmemiş siparişe fatura kesilmesini zaten engelliyor — belge de aynı sınırı yazıyla söylüyor ("sevk edilmez").

## E15 · Kargo bildiriminde takip numarası ve tutar yokluğu

**Ne:** Takip numarası belgenin en büyük ikinci öğesi (18 px mono, harf aralığı açık); belgede **tutar ve fiyat sütunu yok**, gönderi içeriği yalnız kod · ürün · adet.

**Gerekçe:** Belgenin tek işi o numarayı okutmak; okuyan kişi kargo takibi yapacak. Fiyat sütunu ise iki sebeple yanlış: sevkiyat bildirimi ticari belge değildir, ve paketle birlikte giden ya da elden geçen bir kâğıtta tutar görünmesi alıcı tarafında istenmeyen bir bilgi sızıntısıdır.

## E16 · Kargo bildirimi iki hâl tek belgede

**Ne:** `durum` tweak'i `shipped` / `delivered` arasında geçiyor; tarih etiketi de onunla değişiyor (`shipped_at` → "Sevk tarihi", `delivered_at` → "Teslim tarihi").

**Gerekçe:** E14 ile aynı: aynı belgenin iki durumu. Şema karşılığı `venthub_orders.shipped_at` / `delivered_at`.

## E17 · "Hasar varsa tutanaksız teslim almayın" uyarısı

**Ne:** Kargo bildiriminde kalıcı metin: paketi kurye yanındayken kontrol et, hasar varsa tutanak tutturmadan teslim alma; tutanaksız hasar bildirimi kargo firması tarafından işleme alınmaz.

**Gerekçe:** Kargo firmalarının ortak pratiğinin aktarımıdır, VentHub'ın verdiği bir taahhüt değildir. Bu bilgiyi almayan müşteri hasarlı ürünü teslim alır ve iade süreci tıkanır.

**Sınır:** bildirim süresi ve kanalı yer tutucu (K7) — onlar taahhüttür ve ticari karardır. **Recep isterse uyarı tümüyle kaldırılır**; hukuki metin değil, kolaylık metnidir.

---

## Ortak not

E14 ve E16 aynı deseni kullanıyor: **belgenin durumu ayrı dosya değil tweak.** Bu desen bir kural hâline gelirse (öneri) sonraki belgelerde de aynı şekilde uygulanır — iade formu (talep/onay), garanti belgesi (aktif/süresi dolmuş) gibi.

— DESIGN-BELGE (Opus) 2026-09-05

