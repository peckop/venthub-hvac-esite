/**
 * T094 · Sistemin para birimi — TEK YER, ADI KONMUŞ VARSAYIM.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN BİR SABİT VAR (ve niçin `formatCurrency`'nin İÇİNDE değil)
 * ─────────────────────────────────────────────────────────────────────────────
 * `formatCurrency` para birimini DİLDEN türetiyordu: `lang === 'en'` ise `USD`.
 * Sonuç, 6.240 TRY'lik bir siparişin EN arayüzde **$6,240** görünmesiydi (Recep'in
 * ekranında yaşandı, 2026-08-18). Düzeltmenin kolay yolu fonksiyonun içine
 * "yoksa TRY kullan" yazmaktı — ama o, kusuru **gizlerdi**: ikinci para birimi
 * geldiği gün her çağrı sessizce TRY göstermeye devam ederdi ve yine hiçbir kapı
 * görmezdi. Bu deponun tekrar tekrar öğrendiği ders: **sessiz varsayılan =
 * fail-open.**
 *
 * Bu yüzden `currency` çağrıda ZORUNLU (tip seviyesinde) ve verisi olmayan
 * yüzeyler bu sabiti AÇIKÇA yazar. Fark küçük görünür ama belirleyicidir:
 * varsayım artık **grep'lenebilir** ve çok para birimine geçiş, bu sabiti
 * arayarak eksiksiz planlanabilir.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ÖLÇÜM — bugün sistem TEK PARA BİRİMLİ (2026-08-18, prod'dan okundu)
 * ─────────────────────────────────────────────────────────────────────────────
 *   product_prices.currency            → 1044 satır, hepsi TRY
 *   venthub_order_items.display_currency → 3 satır, hepsi TRY  (varsayılan 'TRY')
 *   payment_transactions.currency        → hiç satır yok      (varsayılan 'TRY')
 * Yani `USD` tamamen arayüzün UYDURMASIYDI; veride tek bir yabancı birim yok.
 *
 * ⚠️ `venthub_orders` tablosunda **currency kolonu YOK**. Sipariş yüzeyleri bu
 * yüzden satır-başına birim taşıyamıyor ve bu sabiti kullanıyor. Kolon eklemek
 * migration demektir (= prod'a otomatik uygulanır, Recep kararı) — T094 kapsamına
 * BİLEREK alınmadı, ayrı karar olarak kaydedildi.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ÇOK PARA BİRİMİNE GEÇİLDİĞİNDE NE YAPILACAK
 * ─────────────────────────────────────────────────────────────────────────────
 * Bu sabitin HER kullanımı, "burada satır-başına birim yok" demektir. Geçişte
 * yapılacak iş tam olarak şudur: her kullanımı bul, ilgili satırın kendi
 * `currency`/`display_currency` alanıyla değiştir. Sabiti "TRY yerine EUR" diye
 * değiştirmek ÇÖZÜM DEĞİLDİR — yalnız yanlışın yönünü değiştirir.
 *
 * Bekçi: `src/__tests__/conformance/currency-not-from-language.test.ts` (INV-CURRENCY-1).
 */
export const SYSTEM_CURRENCY = 'TRY'
