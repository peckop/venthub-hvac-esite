# 📋 017 - Visual Page Builder Implementation Plan

## 🏗️ Mimari Özet
Admin'in kategori sayfalarını blok tabanlı (JSON) bir yapıyla yönetmesini sağlayan "Authority Builder" inşası. Bu yapı, P01-012 (Medya Otoritesi) ve P01-011 (Mühendislik Motoru) verilerini görsel bloklara dönüştürecektir.

---

## 🛠️ Uygulama Adımları

### 1. Tip Güvenliği ve Şema Tanımı
- [ ] `src/types/authority.ts` dosyasını oluştur.
- [ ] `AuthorityBlock`, `BlockType`, `AuthorityContent` tiplerini tanımla.
- [ ] Zengin metin ve yapılandırma (config) opsiyonlarını ekle.
- **Verify:** `AuthorityBlock[]` tipindeki bir nesnenin `categories.authority_content` (jsonb) ile uyumluluğunu kod seviyesinde teyit et.

### 2. Admin Authority Builder (Editör)
- [ ] `src/components/admin/authority-builder/` dizinini oluştur.
- [ ] `AuthorityBuilder.tsx`: Ana konteyner (Sıralama, Ekleme, Silme).
- [ ] `BlockEditor.tsx`: Her blok tipi için (Hero, Specs, Media) özelleşmiş form alanları.
- [ ] `BlockPreview.tsx`: Editör içinde anlık görsel önizleme.
- **Verify:** Bir blok eklenip silindiğinde yerel (local) state'in güncellendiğini ve JSON yapısının bozulmadığını logla/test et.

### 3. Authority Renderer (Görsel Motor)
- [ ] `src/components/authority/AuthorityRenderer.tsx`: JSON dizisini okuyup ilgili bileşenleri dinamik render eden motor.
- [ ] Blok bileşenlerini (Authority Blocks) oluştur veya mevcut olanları (Medya Otoritesi vb.) sarmala:
  - `HeroBlock.tsx`
  - `MediaBlock.tsx` (P01-012 entegreli)
  - `SpecsBlock.tsx` (Teknik Tablo)
- **Verify:** Örnek bir JSON'un kategori detay sayfasında (`src/views/category/`) hatasız render edildiğini kontrol et.

### 4. Admin Entegrasyonu
- [ ] Kategori düzenleme sayfasında (`src/components/admin/categories/`) yeni bir "Otorite İçeriği" tabı ekle.
- [ ] `authority_content` alanını `AuthorityBuilder` ile bağla.
- [ ] Kaydetme (Submit) mantığını `AuthorityBuilder` verisini içerecek şekilde güncelle.
- **Verify:** Admin panelinden "Kaydet" dendiğinde veritabanındaki `authority_content` alanının güncellendiğini Supabase üzerinden teyit et.

---

## 🚨 Kritik Kontrol Noktaları (Checkpoints)
1. **Hydration:** Builder ve Renderer'ın `useI18n()` ve `vh-*` tipografi sınıflarına uyumu.
2. **SEO:** Renderer'ın Server Component dostu olması.
3. **P01-012 Entegrasyonu:** Media bloklarının video ve 3D modelleri doğru `mediaId` ile çekmesi.
