# 📋 Implementation Plan: Master Prototype - Fanlar (P04-008)

## 🏁 Hazırlık ve Veri Disiplini
- [ ] **SQL Data Linkage:** `subcategory_id` alanı null olan fan ürünlerini (Casals vb.) marka ve isim bazlı analiz ederek doğru alt kategorilere (Santrifüj, Çatı, Aksiyal vb.) ata. (Verify: `select count(*) from products where subcategory_id is null` sonucu düşmeli)
- [ ] **Sub-View Definitions:** 13 alt kategori için premium ikon ve kısa açıklama setini hazırla.

## 🛠️ Uygulama (The Prototype)
- [ ] **Discovery Hub:** `CategoryMasterView` içine Fanlar'ın alt kategorilerini Hava Perdesi stilinde bir "Görsel Seçim Havuzu" olarak enjekte et.
- [ ] **Mode Toggle:** Sayfanın üst kısmına "Keşif" ve "Hızlı Katalog" modları arasında geçiş yapan UI anahtarını ekle.
- [ ] **Dynamic Authority:** Fanlar kategorisi için "Statik Kalitesinde" 3 ana otorite bloğu (Verimlilik, Sessizlik, Uygulama Alanları) inşa et.
- [ ] **Recursive Breadcrumb Fix:** Tüm Fanlar hiyerarşisinde navigasyon yolunun `Fanlar > Alt Kategori > Seri > Ürün` şeklinde hatasız aktığını mühürle.

## 🧪 Doğrulama
- [ ] **UX Akışı:** "Santrifüj Fan" seçildiğinde sayfanın kesintisiz bir şekilde teknik listeye (Expert Mode) dönüştüğünü görsel olarak teyit et.
- [ ] **Performans:** 100+ ürünün listelendiği Expert Mode'da kaydırma akıcılığını (LCP) test et.
