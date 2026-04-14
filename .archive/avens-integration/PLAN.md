# AvensAir Ürün İmport - Kesin Çözüm Planı

## 📋 Mevcut Durum

### Sorunlar
- ✗ Mevcut scraped data sadece 168 ürün içeriyor
- ✗ 10 kategoride sadece 1'er ürün var
- ✗ Veritabanında 159 ürün var (9 ürün import edilmemiş)
- ✗ Kategori hiyerarşisi yanlış (category_id yerine subcategory_id kullanılıyor)

### Eksik Kategoriler
1. Duvar Tipi Fanlar - 1 ürün (olması gereken: 20+)
2. Sessiz Fanlar - 1 ürün (olması gereken: 10+)
3. Endüstriyel Fanlar - 1 ürün (olması gereken: 30+)
4. Ex-Proof Fanlar - 1 ürün (olması gereken: 20+)
5. Duman Egzoz Fanları - 1 ürün (olması gereken: 15+)
6. Jet Fanlar - 1 ürün (olması gereken: 10+)
7. Basınçlandırma Fanları - 1 ürün (olması gereken: 10+)
8. Sığınak Fanları - 1 ürün (olması gereken: 5+)
9. Nicotra Gebhardt - 1 ürün (olması gereken: 50+)
10. Flexible Kanallar - 1 ürün (olması gereken: 10+)

### Az Ürünlü Kategoriler
- Hava Perdeleri - 4 ürün (olması gereken: 15+)
- Aksesuarlar - 8 ürün (olması gereken: 50+)

---

## 🎯 Çözüm Adımları

### Adım 1: Yeni Scraping (ŞU AN ÇALIŞIYOR)
```bash
node scrape_missing_categories.js
```

**Yapılanlar:**
- ✓ Max click 500'e çıkarıldı
- ✓ `.urunkutu` selector eklendi
- ✓ Tüm kategoriler taranıyor

**Beklenen Sonuç:**
- Yeni JSON dosyası: `scraped-data/complete_avens_[timestamp].json`
- Yaklaşık 500-800 ürün

---

### Adım 2: Veri Birleştirme

Script: `merge_scraped_data.py`

```python
# Eski ve yeni scraped data'yı birleştir
# Duplicate'leri temizle (ürün ismi bazlı)
# Tek bir JSON dosyası oluştur
```

**Beklenen Sonuç:**
- `scraped-data/merged_products_final.json`
- 500-1000 ürün

---

### Adım 3: Temiz Import

Script: `final_import.py`

**Yapılacaklar:**
1. Tüm mevcut ürünleri sil
2. Order items'ları sil (foreign key için)
3. Birleştirilmiş veriyi import et
4. Akıllı kategori eşleştirme uygula
5. Kategori hiyerarşisini doğru kur:
   - `category_id` → Ana kategori (Fanlar, Hava Perdeleri, vb.)
   - `subcategory_id` → Alt kategori (Konut Tipi, Elektrikli Isıtıcılı, vb.)

**Beklenen Sonuç:**
- Tüm ürünler doğru kategorilerde
- Kategori filtreleme çalışıyor
- Frontend'de ürünler görünüyor

---

### Adım 4: Doğrulama

```sql
-- Kategori dağılımı kontrol
SELECT c.name as category, COUNT(p.id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.name 
ORDER BY product_count DESC;

-- Alt kategori dağılımı
SELECT 
  c1.name as main_category,
  c2.name as sub_category, 
  COUNT(p.id) as product_count
FROM products p
LEFT JOIN categories c1 ON p.category_id = c1.id
LEFT JOIN categories c2 ON p.subcategory_id = c2.id
GROUP BY c1.name, c2.name
ORDER BY product_count DESC;
```

---

## 📊 Beklenen Son Durum

### Kategori Dağılımı (Tahmin)
- Fanlar: 300+ ürün
  - Konut Tipi: 50+
  - Santrifüj: 100+
  - Kanal Tipi: 50+
  - Çatı Tipi: 30+
  - Duvar Tipi: 20+
  - Endüstriyel: 30+
  - vb.

- Hava Perdeleri: 15+ ürün
  - Elektrikli Isıtıcılı: 10+
  - Su Isıtıcılı: 3+
  - Ortam Havalı: 2+

- Aksesuarlar: 50+ ürün
  - Gemici Anemostadı: 20+
  - Flexible Kanallar: 10+
  - Diğer aksesuarlar: 20+

### Toplam: 500-1000 ürün

---

## 🚨 Olası Sorunlar ve Çözümler

### Sorun 1: Scraper hala eksik ürün çekiyor
**Çözüm:** Manuel olarak siteden kaç ürün olduğunu sayıp, scripti ayarla

### Sorun 2: Duplicate ürünler
**Çözüm:** Merge script'inde ürün ismi ve URL bazlı deduplication

### Sorun 3: Kategori eşleştirme hataları
**Çözüm:** `smart_import.py`'deki kategori mapping'i güncelle

### Sorun 4: Foreign key hatası
**Çözüm:** Order items'ları önce sil

---

## ✅ Başarı Kriterleri

1. ✓ Tüm kategorilerde en az 5 ürün var
2. ✓ Ana kategoriler (Fanlar, Hava Perdeleri) frontend'de filtreleniyor
3. ✓ Alt kategoriler doğru çalışıyor
4. ✓ Hiçbir kategori "Ürün bulunamadı" göstermiyor
5. ✓ Toplam ürün sayısı 500+

---

## 📝 Notlar

- Scraping yaklaşık 30-60 dakika sürebilir
- Headless mode kapalı, böylece ilerlemeyi görebilirsiniz
- Her kategori için "Daha fazla" butonuna maksimum tıklanacak
- `.urunkutu` class'ı AvensAir'in kullandığı ana selector