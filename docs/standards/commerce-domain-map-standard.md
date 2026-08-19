# Ticaret Alan Haritası (Commerce Domain Map) — Standart

Durum: **TASLAK v0.2** (2026-08-19, OPS-AUDIT / T110-VH). v0.2 = EDGE'in üç ölçülmüş
itirazı işlendi (tablo adları prod'dan doğrulandı; bildirim köprüsü; iki-çalışma-zamanı
gerçeği). NLM ikizi danışması ve kalan modül sahiplerinin itirazları üzerine v1.0 olur.

## 1. Amaç ve kapsam

Bu cetvel, VentHub'daki ticari modüllerin **sınırlarını** ve aralarındaki **izinli
köprüleri** tanımlar. "Sipariş ekranında 'Teklif bekliyor' görünüyor" sınıfı sızıntıların
(bir modülün kavramının başka modülün yüzeyinde görünmesi) yapısal engeli budur.

Kural: kod ile bu harita çelişirse **sessiz sapma yasak** — ya kod haritaya uydurulur
ya harita gerekçeli bir PR ile güncellenir.

## 2. İki omurga

- **SATIŞ HATTI:** katalog → sepet → ödeme (İyzico) → sipariş → kargo → fatura → bildirim.
  Self-servis, B2C ağırlıklı. Durum otoritesi: sipariş durum makinesi.
- **PROJE HATTI:** lead (form/iletişim) → CRM → proje → teklif (RFQ) → *(köprü)* sipariş.
  Keşifli/B2B satış. Durum otoritesi: teklif durum makinesi.

İki omurga **ayrı durum makineleri** taşır. Birinin durumu diğerinin yüzeyinde ancak
§5'teki tanımlı köprülerden görünür; başka her görünüm ihlaldir.

## 3. Modül envanteri ve mevcut durum (2026-08-19 ölçümü)

| Modül | Durum | Ana veri | Açık iş |
|---|---|---|---|
| Katalog | canlı | products, categories, product_variants | ürün-adı çözücü (T098) |
| Sepet + Ödeme | canlı | venthub_orders, venthub_order_items | — |
| Sipariş yönetimi | canlı | venthub_orders (durum makinesi) | sözlük-etiket kaçağı (T108) |
| Kargo/Lojistik | canlı | shipping_* | — |
| İade | kısmi | returns | gerçek iade akışı eksik |
| Satınalma | v1 (T062) | purchasing_* | stok motor köprüsü kapalı |
| Teklif/RFQ | v1 (T067) | venthub_quotes | sipariş köprüsü YOK (T105) |
| Zamanlanmış bakım | yeni (#675) | cron.job (pg_cron) | order-housekeeping + release-expired-reservations; sipariş durumu **yazan** aktördür, 08-19'a kadar hiç çağrılmıyordu |
| Lead/CRM | **eksik** | contact_messages (kısmi) | formlar sahteydi (T104); CRM modülü yok |
| Bayi | kısmi | pricing segmentleri | bayi-atama ekranı yok (T106) |
| Fatura/Muhasebe | **yok** | — | karar paketi T107 (hukuki boyutlu, Recep kararı) |
| Bildirim | kısmi | — | sipariş-yaşamdöngüsü bildirimleri eksik |

## 4. Kavram otoriteleri (tek kaynak)

- **Sipariş durum kümesi:** `src/lib/admin/orderStatusMachine.ts` (kendini SSOT ilan eder).
  UI'da durum listesi bu otoriteden **türetilir**; elle kopyalanmış küme (switch/enum
  kopyası) yasaktır. Etiket her zaman sözlükten gelir; ham DB dizesi basılamaz. (T108 dersi.)
  **İki çalışma zamanı uyarısı:** otorite TS modülüdür ama sözlüğü iki çalışma zamanı paylaşır
  (web + Deno edge fonksiyonları); Deno tarafı bu modülü import **edemez**, sözlüğü tekrarlar.
  Bağlayıcı olan INV kapısıdır (`order-status-dictionary.test.ts`), import değil — aksi
  yaşandı: order-housekeeping DB kısıtında olmayan `failed` yazıyor, hata yutuluyordu.
- **Teklif kavramı** yalnız PROJE HATTI yüzeylerinde yaşar: sipariş-yüzeyi sözlük
  anahtarlarında "teklif/quote" kavramı geçemez.
- **Para birimi:** `currency` zorunlu argümandır, arayüz dilinden türetilmez (INV-CURRENCY-1).
- **Ürün görünen adı:** çözücü fonksiyon üzerinden (T098); `model_code || sku` gibi ham
  geri-düşüşler müşteri yüzeyinde yasak.

## 5. İzinli köprüler (kapalı liste)

1. **teklif → sipariş** (T105): teklif kabul edilince sipariş *yaratılır*; sipariş teklifin
   durumunu yalnız "dönüştürüldü"ye çekebilir, teklif siparişin durumuna dokunamaz.
2. **bayi → fiyat:** bayi segmenti fiyat çözümlemesine girdi verir (pricing servis katmanı).
3. **lead → teklif:** CRM lead'i tekliflendirilebilir; ters yön yok.
4. **satınalma → stok:** alış kaydı stok girişi üretir (motor köprüsü v1'de bilinçli kapalı).
5. **X → bildirim (tek yönlü):** modüller bildirim ucunu tetikleyebilir (örn. venthub_quotes
   INSERT → pg_net → quote-notification-webhook → e-posta; sipariş → order-confirmation).
   Bildirim modülü hiçbir modülün durumunu **yazamaz** — yalnız okur; tek istisna kendi
   idempotency damgası (örn. `request_email_sent_at`).

Bu listede olmayan her modüller-arası yazım/okuma bağımlılığı ihlaldir; yeni köprü
ancak bu cetvele madde ekleyen bir PR ile açılır.

## 6. Kapılar

- Mevcut: `order-status-dictionary.test.ts`, INV-CURRENCY-1.
- Hedef **INV-DOMAIN-1:** sipariş-yüzeyi sözlük anahtarlarında teklif kavramı taraması.
- Hedef **INV-DOMAIN-2:** durum-kümesi kopyası taraması (ilk biçimi T108 PR'ında).
- Hedef **INV-PRODUCT-IDENTITY:** ham ürün-kimliği render yasağı (T098 PR'ında).

## 7. Canlıya çıkış için boşluk kapatma sırası

T104 (formlar gerçek yazsın) → T105 (teklif→sipariş köprüsü) → T106 (bayi-atama ekranı) →
T107 (fatura karar paketi) → bildirim tamamlama → gerçek iade akışı.

Gerekçe: önce müşteri girdisi kaybolmasın (T104), sonra iki omurga birbirine tek köprüyle
bağlansın (T105), sonra B2B farklılaştırıcı (T106); fatura hukuki karar istediği için
paralel karar paketi olarak ilerler.
