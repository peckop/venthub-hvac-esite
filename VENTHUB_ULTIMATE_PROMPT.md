# VentHub HVAC Platform - Ultimate AI Development Prompt

## 🎯 PROJE
**AVenS Yetkili Bayii E-ticaret Platformu** - 6 premium HVAC markası
Türkiye pazarı, profesyonel HVAC sektörü, modern e-ticaret standartları

**Tech Stack:** React + TypeScript + Vite + Supabase + Tailwind CSS + İyzico

## 🎨 PROFESYONEL HVAC E-TİCARET RENK PALETİ

```css
/* Ana Renkler - Güven & Profesyonellik */
--primary-navy: #1E40AF;      /* Koyu mavi - CTA butonlar */
--secondary-blue: #38BDF8;    /* Açık mavi - Hover, linkler */

/* Endüstriyel & Teknoloji */
--industrial-gray: #374151;   /* Charcoal - Headlines */
--steel-gray: #6B7280;        /* Medium gray - Text */
--light-gray: #F3F4F6;        /* Açık gri - Cards */

/* Temizlik & Hava */
--clean-white: #FFFFFF;       /* Pure beyaz - Background */
--air-blue: #EBF8FF;         /* Çok açık mavi - Hero */

/* States & Accents */
--success-green: #10B981;     /* Success states */
--warning-orange: #F59E0B;    /* Uyarılar */
--gold-accent: #D97706;       /* Premium features */
--silver-accent: #9CA3AF;     /* Secondary elements */
```

## 🏷️ MARKALAR (AVenS Distribütörlüğü)
1. **AVenS** - Ana marka (Türk)
2. **Vortice** - İtalyan premium 
3. **Casals** - İspanyol güvenilir
4. **Nicotra Gebhardt** - Alman endüstriyel  
5. **Flexiva** - Kanal sistemleri
6. **Danfoss** - Kontrol sistemleri

## 🎨 ÜRÜN KARTI VE UI TASARIM REHBERİ

### 📦 Ürün Kartı UI Bileşenleri
Her ürün kartında gösterilecek alanlar (Supabase'den çekilecek):
- **name** (başlık - büyük font)
- **brand** (marka badge'i - sağ üst köşe)
- **price** (fiyat - ₺ formatında, büyük font)
- **sku** (model kodu - küçük gri text)
- **category + subcategory** (breadcrumb için)
- **status** (stok durumu - active/out_of_stock)
- **is_featured** (öne çıkan ürün için gold border)

### 🎯 UI States ve Görsel Durumlar:
- **Normal:** Beyaz kart + hafif gölge + hover elevation
- **Featured:** Gold accent border (#D97706)
- **Out of Stock:** Grayed out + "Stokta Yok" badge
- **Brand Colors:** Her marka için farklı accent renk

### 📂 KATEGORİ HİYERARŞİSİ (UI Navigation)

**8 Ana Kategori → Mega Menu Ana Sekmeler:**
1. 💨 **FANLAR** (12 alt kategori - en büyük dropdown)
2. 🔥 **ISI GERİ KAZANIM CİHAZLARI** (2 alt kategori)
3. 🌀 **HAVA PERDELERİ** (2 alt kategori)
4. 💧 **NEM ALMA CİHAZLARI** (2 alt kategori)
5. 🦠 **HAVA TEMİZLEYİCİLER** (2 alt kategori)
6. 🔗 **FLEXIBLE HAVA KANALLARI** (2 alt kategori)
7. ⚡ **HIZ KONTROLÜ CİHAZLARI** (2 alt kategori)
8. 🔧 **AKSESUARLAR** (2 alt kategori)

**26 Alt Kategori → Dropdown Alt Menüler**
- FANLAR kategorisinde 12 özel alt kategori
- Diğer 7 kategoride 2'şer alt kategori
- Her alt kategoride **2'şer ürün** mevcut (toplam 52 ürün)

### 🔑 ID YÖNETİMİ VE ROUTING
**ÖNEMLİ:** Tüm ID'ler Supabase'de UUID formatında mevcuttur.

#### AI Yapacak:
- Supabase'den mevcut UUID'leri çekecek
- React Router için gerçek ID'ler kullanacak
- Slug'lar için categories.slug kullanacak

#### Routing Örnekleri:
- Ana sayfa: `/`
- Kategori: `/category/fanlar` (slug kullan)
- Alt kategori: `/category/fanlar/aksiyel-fanlar`
- Ürün detay: `/product/[uuid]` (gerçek UUID)
- Sepet: `/cart`

#### AI Yapmayacak:
- Yeni ID üretmeyecek
- Fake veriler kullanmayecek
- Prompt'taki örnekleri gerçek veri sanmayacak

## 📝 ÜRÜN DETAY SAYFA YAPISI (Vertical Section Layout)

### Product Detail Page with Anchor Navigation:
- **Sticky tab navigation** with smooth scroll to sections
- **Vertical section-based layout** with alternating backgrounds  
- **Progressive content disclosure** without page reloads
- **Scroll-spy navigation** that highlights active section

### 7 Content Sections (Smooth Scroll Navigation):
1. **Genel Bilgiler** (Hero section - white background)
2. **Modeller** (Product variants - light gray background)  
3. **Ölçüler** (Dimensions - white background)
4. **Diyagramlar** (Technical diagrams - light blue background)
5. **Dökümanlar** (Documentation links - white background)
6. **Ürün PDF** (Downloadable catalogs - light gray background)
7. **Sertifikalar** (Certifications - white background)

### Technical Implementation:
- **Intersection Observer API** for scroll detection
- **CSS scroll-behavior: smooth** for fluid transitions
- **Section-based component architecture** for easy expansion
- **Alternating section backgrounds** for visual separation

## 📌 STICKY NAVIGATION
**Smart Sticky Header** özelliği:
- Aşağı scroll: Header kaybolur (content'e odak)
- Yukarı scroll: Kompakt header geri gelir  
- Mini header'da: Logo + Arama + Sepet + Menu toggle
- Smooth animations (300ms transition)
- Mobile-optimized sticky behavior

## ⚡ PERFORMANS ODAKLI TASARIM (Animasyonsuz)

### Performance-First Approach:
- **NO complex animations** → Hızlı yükleme ve smooth UX
- **Simple hover effects** → Subtle transitions only (0.2s)
- **CSS-only transitions** → JavaScript animation library'leri kullanma
- **Bundle size optimized** → Minimum dependencies
- **Core Web Vitals optimized** → LCP, FID, CLS perfect scores
- **GPU acceleration** → transform3d() kullan, paint operations'ı minimize et

### Minimal UI Effects:
- **Button hover** → Subtle color transition (0.2s ease)
- **Card hover** → Light shadow elevation
- **Image loading** → Simple fade-in
- **Page transitions** → Clean fade between routes
- **Focus states** → Accessibility-compliant outlines

## 🎨 CUSTOM HVAC ICON SYSTEM

### Professional SVG Icon Creation (48x48px categories):
1. **💨 FANLAR** - Axial fan with rotating blades + airflow lines
2. **🔥 ISI GERİ KAZANIM** - Heat exchanger with temperature arrows
3. **🌀 HAVA PERDELERİ** - Air curtain with downward flow
4. **💧 NEM ALMA** - Dehumidifier with water droplets
5. **🦠 HAVA TEMİZLEYİCİLER** - Air purifier with HEPA layers
6. **🔗 FLEXIBLE KANALLAR** - Corrugated flexible duct
7. **⚡ HIZ KONTROLÜ** - Electronic control panel with dial
8. **🔧 AKSESUARLAR** - HVAC tools and components

### Brand Icons (32x32px):
- **AVenS**: Turkish professional theme
- **Vortice**: Italian elegance, spiral motif
- **Casals**: Spanish reliability, gear theme
- **Nicotra Gebhardt**: German precision engineering
- **Flexiva**: Flexibility waves
- **Danfoss**: Scandinavian minimalism

### Icon Specifications:
- Format: Scalable SVG with proper viewBox
- Style: Modern, minimal, professional
- Colors: HVAC palette consistent
- Hover states and subtle animations
- Accessibility compliant (aria-labels)

## 🎬 HERO SLIDE GÖRSELLER (Performans Odaklı)

### Slide 1: "Temiz Hava, Temiz Gelecek"
- **Görsel:** Modern HVAC fabrika + mavi gökyüzü
- **Overlay:** Navy blue gradient
- **Transition:** Simple fade-in (CSS only)

### Slide 2: "6 Premium Marka, Tek Adres"  
- **Görsel:** Brand logos showcase
- **Overlay:** Industrial gray gradient
- **Transition:** Clean slide transition

### Slide 3: "Profesyonel HVAC Çözümleri"
- **Görsel:** Technical equipment diagrams
- **Transition:** Minimal fade effect

## 🌟 PREMIUM E-TİCARET ÖZELLİKLERİ

### Modern UX:
- **Multi-tier hierarchical navigation system** (8 ana kategori + alt kategoriler)
- **Grid-based mega menu with contextual grouping** (2-level expandable navigation)
- **Category landing pages with filterable product families**
- **Progressive disclosure product listing** (Expandable product group cards)
- **Infinite scroll with progressive loading** (Vertical pagination)
- **Lazy loading product grid** with virtualized rendering
- **Seamless browsing experience** without traditional pagination
- **360° Product View** + zoom functionality
- **Quick View Modal** (hover preview)
- **Brand-specific filters** (6 marka)
- **Glassmorphism cards** (backdrop-blur effects)
- **Modern sepet sistemi** (Toast + Choice Modal)
- **Social proof** ("X kişi bu ürünü inceliyor")

### Product Listing Architecture:
- **Scroll-triggered content loading** with Intersection Observer API
- **Load more on demand** (button or automatic)
- **Mobile-optimized continuous browsing**
- **Performance-optimized rendering** (only visible items)
- **Grid layout with responsive breakpoints**

### 🛒 MODERN SEPET SİSTEMİ:
1. **"Sepete Ekle"** → Success toast + Choice modal
2. **Choice Modal:** [Alışverişe Devam Et] / [Sepete Git] 
3. **Sepet counter** → Real-time update
4. **/cart sayfası** → Tam sayfa detaylı sepet yönetimi
5. **Auto-close** → Modal 5 saniye sonra kapanır
6. **Persistent cart** → LocalStorage + Supabase sync

### E-ticaret Flow:
- **Multi-page application** (React Router)
- **Cart page** (/cart) with full functionality
- **Checkout page** (/checkout) with İyzico embedded
- **Product pages** (/product/[id]) for each item
- **Category pages** (/category/[slug]) for filtering
- **Real-time form validation** 
- **Progressive loading skeletons**
- **Mobile-first responsive** (44px touch targets)
- **Smart search** with autocomplete

### Buton Hierarchy:
- **Ana CTA:** Primary navy (#1E40AF) - "Satın Al"
- **Secondary:** Secondary blue (#38BDF8) - "Sepete Ekle"  
- **Success:** Forest green (#10B981) - "Tamamlandı"
- **Warning:** Orange (#F59E0B) - "Stok Az"

## 💾 VERİTABANI ŞEMASI

### Mevcut Tablolar (✅ Hazır):
- **categories** (8 ana + 26 alt kategori; UUID ID'ler mevcut)
- **products** (52 ürün; tüm gerekli alanlar mevcut)

### ⚠️ ÖNEMLİ: VERİ KAYNAĞI TALİMATI
**AI İçin Kritik Kural:**
- **TÜM ÜRÜN BİLGİLERİNİ SUPABASE'DEN ÇEK**
- Prompt'taki örnekler sadece UI tasarım referansıdır
- Gerçek veri kaynağı: Supabase API
- Çakışma önleme: Prompt verilerini kullanma

### Kategori Hiyerarşisi Modeli:
```sql
-- categories tablosu: parent_id ile hiyerarşi
-- level=0 → ana kategori, level=1 → alt kategori  
-- products.subcategory_id → categories(id) (level=1)
-- Tüm ID'ler UUID formatında
```

### E-ticaret Tabloları (eklenecek):
```sql
CREATE TABLE orders (...);
CREATE TABLE cart_items (...);
CREATE TABLE user_sessions (...);
```

## 🚀 İMPLEMENTASYON TALİMATLARI

### 📊 Veri Yönetimi (KRİTİK):
- **Supabase'i tek veri kaynağı olarak kullan** (52 ürün + 34 kategori hazır ✅)
- **Prompt örneklerini gerçek veri sanma** - sadece UI referansı
- **UUID ID'leri olduğu gibi kullan** - yeni ID üretme
- **categories.parent_id hiyerarşisini kullan** (subcategories tablosu yok)

### 🎨 UI/UX Implementation:
- **Performance-first yaklaşım** (animasyonsuz, hızlı)
- **Modern sepet sistemi** (Toast + Choice Modal)
- **Custom HVAC icons** (SVG, 48x48px)
- **Mobile-responsive** ve accessibility compliant
- **Mega menu** 26 alt kategori desteği ile

### 🗂️ Routing Architecture:
- **Multi-page application** (React Router)
- **Slug-based categories:** `/category/fanlar`
- **UUID-based products:** `/product/[uuid]`
- **Cart & checkout:** `/cart`, `/checkout`

### 📦 E-commerce Tables (eklenecek):
- orders, cart_items, user_sessions

**HEDEF:** Professionally-designed, sales-ready HVAC e-commerce platform.

---
**Supabase-Driven HVAC Platform + Custom Icons + Premium UX + Real Data = Professional Launch-Ready Platform! ⚡🎨🚀**
