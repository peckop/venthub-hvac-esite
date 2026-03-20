# 🧠 017 - Visual Page Builder Brainstorming

## 🎯 Vizyon
Admin'in kategori sayfalarını "Otorite İçeriği" (Authority Content) ile donatmasını sağlayan, blok tabanlı bir editor.

## 🏗️ Mimari Yaklaşım
1. **Blok Tabanlı (Block-based) vs Drag-n-Drop:**
   - **Karar:** Blok tabanlı yapı (Notion veya Gutenberg tarzı) VentHub'ın teknik verileri için daha güvenli ve tutarlıdır. Sürükle-bırakın getirdiği serbestlik, tasarım disiplinini bozabilir.
   - **Girdi:** Hazır bileşenler (Authority Blocks).
   - **Çıktı:** `AuthorityContent` tipinde bir JSON nesnesi.

2. **JSON Şeması (`AuthorityContent`):**
   ```typescript
   interface AuthorityBlock {
     id: string;
     type: 'hero' | 'specs' | 'performance' | 'media' | 'text';
     content: any; // Blok tipine göre özelleşecek (örn: TechnicalTableContent)
     order: number;
     config?: {
       fullWidth?: boolean;
       theme?: 'light' | 'dark';
     };
   }

   type AuthorityContent = AuthorityBlock[];
   ```

3. **Bileşen Kütüphanesi (Authority Blocks):**
   - **HeroBlock:** Başlık, alt başlık ve görsel/video (P01-012 Medya Otoritesi ile entegre).
   - **SpecTableBlock:** Teknik özelliklerin (dB, Watt, Hava Debisi) sergilendiği tablo.
   - **PerformanceChartBlock:** Grafikler (Recharts/Chart.js - P01-011 Engineering Engine'den veri alacak).
   - **MediaAuthorityBlock:** 3D modeller veya teknik çizimler (P01-012 entegrasyonu).

4. **Kayıt ve Veri Akışı:**
   - `src/components/admin/page-builder/` altında editor bileşenleri.
   - `src/views/category/AuthorityPage.tsx` (veya benzeri) altında render motoru.
   - Supabase `categories.authority_content` alanına doğrudan `UPDATE`.

## 🚨 Riskler & Tedbirler
- **Hydration Mismatch:** JSON içeriği sunucu tarafında (SSR) render edilmeli, admin panelinde client-side edit edilmeli. (P01-013 entegrasyonu).
- **Zengin Metin (Rich Text):** Tipografi standartlarına (vh-body, vh-h1) bağlı kalınmalı.

## 🚀 Sonraki Adım
- [ ] `AuthorityContent` tipini `src/types/` altında tanımla.
- [ ] Editor UI mockup/planını hazırla.
- [ ] `plan.md` dosyasını doldur.
