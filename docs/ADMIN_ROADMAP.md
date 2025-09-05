# Admin Panel Roadmap (Güncel Durum ve Plan)

Tarih: 2025-09-04

## Tamamlananlar (Sprint 1)
- /admin çatı layout ve guard (sadece admin erişir)
- Stok Özeti sayfası (/admin, /admin/inventory)
  - Fiziksel, Rezerve, Satılabilir stok
  - Ürün satırına tıklayınca: rezerve eden (kargolanmamış) siparişler listesi
- Veritabanı view’leri
  - inventory_summary (tek satılabilir stok kaynağı)
  - reserved_orders (ürünü rezerve eden siparişler)

## Güncellemeler (2025-09-05)
- Admin > Stok Özeti (/admin/inventory)
  - Hızlı arama (ürün adı) — anlık filtreleme
  - Satır içi stok düzenleme sütunu: − / miktar / + / Kaydet (optimistic update)
  - Satır içi minimum eşik düzenleme: rozet + input + Kaydet + Varsayılan
  - “Ürün seç” dropdown kaldırıldı; satır tıklama ile seçim ve yalnızca seçim olduğunda görünen bağlam paneli (Hızlı Eşik Ayarları)
  - Tablo başlıkları ve açıklamalar iyileştirildi (Eşik: “Efektif • Yeni • Aksiyon”)

## Devam Eden (Sprint 2 – Orders Modülü)
- /admin/orders iskeleti ve rotası
- Liste ve veri modeli: status + payment_status rozetleri, toplam, tarih
- Filtreler: durum, ödeme durumu, kargolanmamış, tarih aralığı, sipariş no
- Tek sipariş aksiyonu: Kargoya Ver (carrier + tracking_number)
- API katmanı: modules/common/api/orders.ts
- Test & i18n (orders.*)
- Milestone 2: Çoklu seçim + Toplu Kargoya Ver

## Sıradaki (Sprint 3 – Returns Modülü)
- /admin/returns sayfası: iade talepleri, tam/parsiyel iade, kalem seçimi
- Kargolanmış ürünler için: “İade alındı → stok +” (idempotent)

## Sıradaki (Sprint 4 – Dashboard & Users)
- Dashboard: Bugün/7g/30g KPI kartları (sipariş, ciro, iade, bekleyen kargo)
- Recent activity feed
- Users modülünün taşınması (/admin/users)

## Standartlar ve Kurallar
- Stok: satılabilir stok = physical − reserved (reserved = paid/confirmed/processing ve shipped_at IS NULL)
- Order.status: pending → confirmed/processing → shipped → delivered → cancelled
- Payment.status: pending → paid → partial_refunded → refunded → failed
- UI: status + payment_status rozetleri birlikte gösterilir (örn. “Ödendi + Kısmi İade”)
- İade:
  - Kargolanmamış tam iade: cancel + otomatik stok iadesi
  - Kargolanmamış parsiyel iade (kalem tutarı): stok otomatik +quantity (isteğe bağlı)
  - Kargolanmış: stok iadesi depo dönüş onayında

## Notlar
- Mevcut dağınık admin sayfaları (/account/operations/*) aşamalı olarak /admin altına taşınacak; mükerrerlik kaldırılacak.
- i18n anahtarları tekilleştirilecek; ortak UI bileşenleri (rozet, tablo) modül dışına alınacak.


