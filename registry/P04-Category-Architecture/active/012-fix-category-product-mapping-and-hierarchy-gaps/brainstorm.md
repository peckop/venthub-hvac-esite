---
artifact_type: "brainstorm"
task_id: "012"
analysis_source: "Product-Category Integrity Audit"
analysis_timestamp: "2026-03-23 22:15:00"
---

# 🧠 Brainstorming: Fix Category-Product Mapping

## 🚩 Tespit Edilen Sorunlar
1.  **Casals Kopukluğu:** Casals marka ürünlerin %90'ı ana kategoriye (Fanlar) bağlı olsa da, alt kategori (`subcategory_id`) alanları boş. Bu yüzden alt kategori sayfalarında ürünler görünmüyor.
2.  **Hiyerarşi Boşluğu:** Ürün detayına gidilebiliyor ancak breadcrumb ve kategori ağacı ürünün hangi alt kümeye ait olduğunu bilmiyor.
3.  **Genel Veri Eksikliği:** Sadece Casals değil, diğer markalarda da (Vortice, Avens vb.) benzer eşleşmeme sorunları olabilir.

## 🛠️ Çözüm Stratejisi
1.  **İsim Bazlı Eşleştirme:** Ürün isimlerindeki anahtar kelimelerden (örn: 'Storm', 'MBP', 'TR', 'Duct') yola çıkarak akıllı bir SQL `UPDATE` mekanizması kurmak.
2.  **Marka Bazlı Gruplama:** Casals ürünlerini kendi içlerinde serilere (Storm -> Duman Egzoz, MBP -> Santrifüj vb.) ayırıp toplu güncelleme yapmak.
3.  **Boş Kategori Kontrolü:** "Basınçlandırma Fanları" gibi bilerek boş bırakılan kategorileri bu operasyondan hariç tutmak.

## ⚠️ Riskler
- Yanlış eşleştirme (örn: bir aksiyal fanı santrifüj kategorisine atmak).
- **Önlem:** Her `UPDATE` öncesi `SELECT` ile eşleşecek ürünleri listelemek ve doğrulamak.

## 🏁 Başarı Kriteri
- Casals ürünlerinin doğru alt kategorilerde (Duman Egzoz, Çatı Tipi vb.) listelenmesi.
- `subcategory_id` alanının `null` olan kritik ürün sayısının %0'a inmesi.
