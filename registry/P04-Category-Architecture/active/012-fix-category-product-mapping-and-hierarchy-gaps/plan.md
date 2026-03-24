---
artifact_type: "plan"
task_id: "012"
strategy_id: "casals-hierarchy-fix-v1"
derived_from: "brainstorm.md"
---

# 📋 Implementation Plan: Fix Category-Product Mapping

## 🏁 Adım 1: Casals Ürünlerinin Haritalanması (Audit)
Casals ürünlerini ismine göre doğru alt kategorilerle eşleştirme tablosu hazırla.
- [ ] Storm/Clibos serilerini "Duman Egzoz Fanları" ile eşle.
- [ ] MBP serisini "Santrifüj Fanlar" ile eşle.
- [ ] TR serisini "Çatı Tipi Fanlar" ile eşle.
- **Verify:** SQL sorgusu ile kaç ürünün hangi alt kategoriye gideceğini listele.

## 🏗️ Adım 2: Toplu Veri Güncelleme (SQL)
Belirlenen eşleşmeleri veritabanına uygula.
- [ ] `subcategory_id` alanlarını güncelle.
- [ ] Mevcut `category_id` (Fanlar) alanının korunduğundan emin ol.
- **Verify:** `SELECT COUNT(*) FROM products WHERE brand = 'Casals' AND subcategory_id IS NULL` sorgusunun 0 dönmesi.

## 🔍 Adım 3: Genel Sistem Denetimi
Casals dışındaki diğer markalarda da `subcategory_id` alanının `null` olduğu kritik ürünleri tespit et.
- [ ] Vortice ve Avens ürünleri için benzer bir tarama yap.
- [ ] Eksikse onları da ilgili kategorilere (örn: Lineo -> Kanal Tipi) ata.
- **Verify:** Dashboard üzerinden alt kategori sayfalarında ürünlerin belirdiğini doğrula.

## 🏁 Adım 4: Mühürleme ve Review
- [ ] `review.md` dosyasını doldur.
- [ ] Görevi kapat.
