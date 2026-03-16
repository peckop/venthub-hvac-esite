# Plan: 006 - Dinamik Otorite ve İçerik Yönetimi

## 📝 Operasyonel Adımlar

### Aşama 1: Veritabanı Hazırlığı (DB Mühürlemesi)
- [ ] Supabase SQL Editor üzerinden `categories` tablosuna `authority_content` kolonunu ekleyen migration'ı çalıştır.
- [ ] SQL: `ALTER TABLE categories ADD COLUMN IF NOT EXISTS authority_content JSONB DEFAULT NULL;`

### Aşama 2: Mevcut Verinin Taşınması (Migration)
- [ ] `src/i18n/dictionaries/tr.ts` içindeki `categorySilentFan` objesini oku.
- [ ] Bu objeyi yeni JSON şemasına (brainstorm belgesindeki yapı) dönüştür.
- [ ] SQL UPDATE sorgusu ile `sessiz-kanal-tipi-fanlar` slug'ına sahip kategoriye bu veriyi işle.

### Aşama 3: Frontend Modernizasyonu
- [ ] `src/types/database.types.ts` (veya ilgili alias dosyası) içinde `authority_content` alanını tanımla.
- [ ] `src/components/category/CategoryAuthoritySection.tsx` bileşenini refactor et:
    - `useI18n` yerine `Category` objesi içinden gelen `authority_content` verisini kullan.
    - Tip kontrollerini (Type Guards) ekle.
    - `if (slug !== ...)` engelini kaldır.

### Aşama 4: Temizlik ve Doğrulama
- [ ] `tr.ts` içindeki eski `categorySilentFan` bloğunu sil (Yedek alındıktan sonra).
- [ ] Sayfanın DB'den gelen veriyle sorunsuz render edildiğini test et.

## 📈 Başarı Kriteri
Sessiz Fanlar kategorisi, kodda hiçbir statik metin kalmadan, tamamen veritabanından beslenen dinamik içerikle aynı görsel kalitede görüntülenmeli.
