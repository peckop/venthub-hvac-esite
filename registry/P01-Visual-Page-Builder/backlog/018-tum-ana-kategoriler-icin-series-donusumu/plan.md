# 📋 Plan: P01-018 Tüm Ana Kategoriler için Series Dönüşümü

Bu görev, VentHub'ın tüm ana kategorilerini "Series/Landing" vizyonuna yükseltmeyi kapsar.

## ✅ Alt Görevler
- [ ] `CategoryLanding.tsx` içindeki `isAirCurtain` ve `isSilentFan` kontrollerinin kaldırılması.
- [ ] Zengin içerik bölümlerinin (Problem, HowItWorks, Brand) JSON verisinden dinamik render edilmesi.
- [ ] Fanlar kategorisi için `authority_content` veri setinin hazırlanması.
- [ ] Isı Geri Kazanım kategorisi için `authority_content` veri setinin hazırlanması.
- [ ] `display_mode: series` değerinin tüm Level 0 kategorilere DB üzerinden atanması.
- [ ] Alt kategori listesinin "Seri Keşif Alanı" olarak tasarlanması.
- **Verify:** Herhangi bir ana kategoriye tıklandığında zengin "Series" arayüzünün gelmesi.

## 🏗️ Uygulama Adımları

### Step 1: Generic Component Extraction
- **Action:** `src/components/category/sections/` altındaki bileşenleri `authority_content` prop'unu alacak şekilde jenerikleştir.
- **Verify:** Hava Perdeleri sayfasının hala aynı göründüğünü teyit et.

### Step 2: Data Population
- **Action:** Supabase üzerinden Fanlar ve HRV kategorilerine örnek "Authority" verilerini gir.
- **Verify:** `/category/fanlar` sayfasında verilerin göründüğünü doğrula.

### Step 3: Hierarchy Alignment
- **Action:** Alt kategorilerin bu yeni düzendeki yerini (layout) kesinleştir.
- **Verify:** Kullanıcı yolculuğunun ana kategoriden alt kategoriye kesintisiz olduğunu teyit et.
