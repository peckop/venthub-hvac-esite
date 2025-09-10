# Admin Panel Roadmap (Güncel Durum ve Plan)

Tarih: 2025-09-08

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

## Güncellemeler (2025-09-08) — Hata Yönetimi
- Yeni: Hata Grupları (/admin/error-groups)
  - [x] Liste: signature, level, last_message, last_seen, count, status, assigned_to
  - [x] Filtreler: arama (signature/mesaj), seviye, durum, tarih aralığı; sayfalama (server-side)
  - [x] Realtime: Supabase Postgres Realtime ile canlı güncellenir
  - [x] Detay paneli: Son Kayıtlar (son 20 client_errors), Notlar, Örnek URL
  - [x] Atama ve Durum: assigned_to ve status alanları satır içi düzenlenir
  - [x] Görünüm: ColumnsMenu toolbar’ın sağında; yoğunluk (compact/comfortable)
  - [x] UX: Üst/alt yatay scroller senkron; overscroll-x-contain ile zincir kesimi; dikey scroll normal akışta
  - [x] Sıralama: Last Seen ve Count başlıklardan tıklayarak
  - [x] Dışa Aktar: CSV export (filtrelerle, 1000’lik chunk)
- Yeni: Hatalar (/admin/errors)
  - [x] Liste: client_errors ham kayıtları; realtime; server-side sayfalama
- Altyapı
  - [x] Edge Function: log-client-error — 404/401/500 sorunları giderildi; try/catch + maybeSingle ile güvenli
  - [x] Şema: client_errors.tablosuna group_id; error_groups tablosu ve eksik migration’lar eklendi
  - [x] RLS: admin/moderator JWT rolü ve e‑posta fallback ile erişim
  - [x] CI/CD: Cloudflare Pages dağıtımı; index.html için no-store (public/_headers) ile bayat UI önlendi

## Devam Eden (Sprint 2 – Orders Modülü)
- /admin/orders işlevleri
  - Liste ve veri modeli: status rozetleri, toplam, tarih (mevcut)
  - Filtreler: durum, tarih aralığı, arama (mevcut)
  - Aksiyon: Kargoya Ver (tekil ve toplu) (kısmen mevcut; bulk akışı sırada)
  - Dışa Aktar: CSV + Excel (.xls) (mevcut)

## Sıradaki (Sprint 3 – Returns & Movements & Errors)
- Toolbar durumlarının kalıcılığı (localStorage; sayfa bazlı anahtarlar)
- Gelişmiş filtre çekmecesi (Orders)
- Errors / Error Groups
  - [x] Sıralama: Count ve Last Seen başlıktan tıklayarak
  - [x] Export: CSV dışa aktar (grup ve ham kayıtlar)
  - [x] Assigned-to filtresi ve bulk status değişikliği
  - [x] Detay panelinde en sık URL/Release/Env/UA dağılımı (top-5)

## Güncellemeler (Sprint 3)
- Movements: Export menüsüne Excel (.xls) eklendi
- Returns: Export menüsüne CSV ve Excel (.xls) eklendi
  - [ ] Last Message yanında ilk stack frame özeti (hızlı kök neden ipucu)

## Sıradaki (Sprint 3A – Products & Categories & Pricing)

Durum (altyapı taraması):
- products: stock_qty ve low_stock_threshold mevcut (20250902_* migrations)
- purchase_price, slug/meta alanları ve product_images tabloları eklendi; storage bucket/policy tamam.

Tamamlananlar (/admin/products & /admin/categories):
- [x] Toolbar standardizasyonu (AdminToolbar + ColumnsMenu, density, kalıcılık)
- [x] Ürünler: arama, kategori filtresi, durum chip’leri, “Sadece: Öne Çıkan” toggle
- [x] Ürünler: tablo sıralama (Ad, SKU, Kategori, Durum, Fiyat, Stok)
- [x] Ürünler: düzenleme paneli — sekmeler (Bilgi, Fiyat, Stok, Görseller, SEO), üstte gri başlık şeridi ve aksiyonlar (Yeni, Kaydet, Sil)
- [x] Ürünler: görsel yükleme/sıralama/silme (storage + product_images)
- [x] Ürünler: düşük stok eşiği override mantığı (boş=varsayılan; dolu=override) — Envanter/Ayarlar ile uyumlu
- [x] Kategoriler: liste + CRUD (Ad, Slug, Üst Kategori), üstte gri başlık şeridi ve aksiyonlar (Yeni, Kaydet, Sil)

Açık kalanlar / sıradakiler:
- [ ] RLS: products/product_images/categories için admin/moderator CRUD policy’leri (ince ayar)
- [ ] Audit log: ürün/kategori + fiyat/görsel değişiklikleri
- [ ] CSV import/export (ürün/kategori) – opsiyonel, sonraki sprint

### Görev Listesi (Sprint 3A)
- [x] Migration: products.purchase_price numeric(12,2) NULL
- [x] Migration: products.slug (unique, lowercase index) + meta_title + meta_description
- [x] Migration: product_images (id, product_id, path, alt, sort_order, created_at) + index
- [x] Storage: product-images bucket ve storage.objects policy (read public, write admin/moderator)
- [ ] RLS: products/products_images/categories için admin/moderator CRUD policy’leri
- [x] Admin Categories: liste + CRUD (slug unique)
- [x] Admin Products: liste + CRUD (form sekmeleri: Bilgi, Fiyat, Stok, Görseller, SEO)
- [x] Görseller: yükle/sırala/sil; sort_order
- [ ] Audit log: ürün/kategori + fiyat/görsel değişiklikleri
- [ ] CSV import/export (ürün/kategori) – opsiyonel, sonraki sprint

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

---

## Güncellemeler (2025-09-10) — Ürün Görselleri & RLS & Arama

Tamamlananlar:
- RLS/Policy Düzeltmeleri
  - product_images ve storage.objects (product-images bucket) için politikalar user_profiles.role ve auth.uid() ile yeniden yazıldı.
  - authenticated rolüne INSERT/UPDATE/DELETE yetkileri eklendi (gerekli kapsamda).
  - Admin kullanıcı (recep.varlik@gmail.com) user_profiles.role=admin olarak işaretlendi.
  - Tanılama RPC’leri: session context (auth.uid, claims) ve aktif policy listesini dönen yardımcılar eklendi.
- Ürün Görselleri (Admin > Products > Görseller)
  - “Kapağı Yap (Make Cover)” butonu küçük ekran genişliklerinde de görünür hâle getirildi.
  - Alt metin girişleri controlled input’a geçirildi; onBlur’da otomatik kayıt; sekmede toplu “Kaydet” butonu eklendi.
  - CSV içe aktarma ve kapak atama akışı iyileştirildi (buton hizaları ve erişilebilirlik etiketleri).
- Arama (Header/Sticky)
  - Header’daki karmaşık arama çubuğu sadeleştirildi; tek arama ikonu /products sayfasına yönlendiriyor.
  - Sticky (scroll sonrası) hızlı arama korunuyor; ürün detayına hızlı geçiş için kısayol.

Sıradaki (Admin odaklı):
- Görseller için sürükle-bırak sıralama ve kalıcı sort_order güncellemesi.
- Toplu işlemler: çoklu silme, alt metin doğrulama/otomatik öneri.
- Audit log: ürün/kategori + fiyat/görsel değişikliklerinin kaydı.

