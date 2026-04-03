# 📋 017 - Visual Page Builder Implementation Plan

## 🏗️ Mimari Özet
Admin'in kategori sayfalarını blok tabanlı (JSON) bir yapıyla yönetmesini sağlayan "Authority Builder" inşası.

---

## 🛠️ Uygulama Adımları

### 1. Tip Güvenliği ve Şema Tanımı
- [x] `src/types/authority.ts` dosyasını oluştur.
- [x] `AuthorityBlock`, `BlockType`, `AuthorityContent` tiplerini tanımla.
- [x] Zengin metin ve yapılandırma (config) opsiyonlarını ekle.
- **Verify:** `AuthorityBlock[]` tipindeki bir nesnenin `categories.authority_content` (jsonb) ile uyumluluğunu kod seviyesinde teyit et.

### 2. Admin Authority Builder (Editör)
- [x] `src/components/admin/authority-builder/` dizinini oluştur.
- [x] `AuthorityBuilder.tsx`: Ana konteyner (Sıralama, Ekleme, Silme).
- [x] `BlockEditor.tsx`: Tüm blok tipleri için form alanları eklendi (Specs, Features, Comparison, CTA).
- [x] `CategoryBuilderView.tsx`: Tam ekran studio arayüzünü inşa et.
- **Verify:** Blok ekleme, silme ve veri güncelleme mantığı admin studio içinde doğrulandı.

### 3. Authority Renderer (Görsel Motor)
- [x] `src/components/authority/AuthorityRenderer.tsx`: Tüm blok tiplerini destekleyen dinamik render motoru.
- [x] Blok bileşenleri (Features Grid, Comparison, CTA Banner) responsive olarak inşa edildi.
- **Verify:** Yeni blokların Live Preview (Studio) içinde hatasız göründüğü teyit edildi.

### 4. Admin Entegrasyonu
- [x] Kategori düzenleme sayfasından Page Builder'a geçişi sağla.
- [x] `authority_content` alanını `AuthorityBuilder` ile bağla.
- [x] Legacy verileri otomatik bloklara çeviren Migration motorunu aktif et.
- **Verify:** Admin panelinden "Kaydet" dendiğinde veritabanındaki `authority_content` alanının güncellendiğini Supabase üzerinden teyit et.

---

## 🚨 Kritik Kontrol Noktaları (Checkpoints)
1. **Hydration:** Builder ve Renderer'ın `useI18n()` ve `vh-*` tipografi sınıflarına uyumu.
2. **SEO:** Renderer'ın Server Component dostu olması.
3. **P01-012 Entegrasyonu:** Media bloklarının video ve 3D modelleri doğru `mediaId` ile çekmesi.
