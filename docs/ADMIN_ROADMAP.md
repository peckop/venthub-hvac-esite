# Admin Panel Roadmap (Güncel Durum ve Plan)

Tarih: 2025-09-05

## Tamamlananlar (Sprint 1)
- /admin çatı layout ve guard (sadece admin erişir)
- Stok Özeti sayfası (/admin, /admin/inventory)
  - Fiziksel, Rezerve, Satılabilir stok
  - Ürün satırına tıklayınca: rezerve eden (kargolanmamış) siparişler listesi
- Veritabanı view’leri
  - inventory_summary (tek satılabilir stok kaynağı)
  - reserved_orders (ürünü rezerve eden siparişler)

## Güncellemeler (2025-09-05)
- Ortak AdminToolbar bileşeni oluşturuldu ve sayfalara uygulandı
  - Özellikler: arama (/ kısayol), select, chip grubu, toggle (Radix Switch), Temizle, kayıt sayacı, sticky yüzey, odak halkaları
  - Düzen: 2 satır (üst: arama/select/aksiyonlar, alt: chip’ler), 48px kontrol yüksekliği, shrink-0 sağ blok, nowrap metinler
- Entegrasyonlar
  - Inventory (/admin/inventory): Toolbar + mevcut filtreler, sağ panel ve metrikler korunarak düzenlendi
  - Movements (/admin/movements): Toolbar + Dışa Aktar dropdown (CSV), hizalama düzeltmeleri
  - Orders (/admin/orders): Toolbar + durum select + tarih aralığı alanları + Dışa Aktar dropdown (CSV, Excel .xls)
  - Returns (/account/AdminReturnsPage): Toolbar + çoklu durum chip’leri (requested/approved/...)
  - Users (/account/AdminUsersPage): Toolbar ile arama alanı standardize edildi
- Görsel uyum
  - Tüm toolbar’lar kart içinde yumuşak arka plan (bg-gray-50 + border) ile ayrı bir yüzey olarak gösteriliyor
  - “Grupla” gibi boolean kontroller Radix Switch ile birleştirildi (tik işareti kaldırıldı)

## Devam Eden (Sprint 2 – Orders Modülü)
- /admin/orders işlevleri
  - Liste ve veri modeli: status rozetleri, toplam, tarih (mevcut)
  - Filtreler: durum, tarih aralığı, arama (mevcut)
  - Aksiyon: Kargoya Ver (tekil ve toplu) (kısmen mevcut; bulk akışı sırada)
  - Dışa Aktar: CSV + Excel (.xls) (mevcut)

## Sıradaki (Sprint 3 – Returns & Movements)
- Dışa Aktar menüsü: Returns ve Movements için Excel (.xls) eklenmesi
- Toolbar durumlarının kalıcılığı (localStorage; sayfa bazlı anahtarlar)
- Gelişmiş filtre çekmecesi (Orders)

## Sıradaki (Sprint 4 – Dashboard & Users)
- Dashboard: Bugün/7g/30g KPI kartları (sipariş, ciro, iade, bekleyen kargo)
- Recent activity feed
- Users modülünün /admin/users altına taşınması

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

