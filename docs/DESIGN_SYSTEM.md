# VentHub HVAC E-Ticaret - Design System & UI Felsefesi

> Bu doküman, projenin başlangıcından gelen ve geçerliliğini koruyan tasarım standartlarını, renk paletini, marka listesini ve ikon sistemini barındırır.

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

## 📂 KATEGORİ HİYERARŞİSİ (UI Navigation Mimarisi)

**8 Ana Kategori → Mega Menu Ana Sekmeler:**
1. 💨 **FANLAR**
2. 🔥 **ISI GERİ KAZANIM CİHAZLARI**
3. 🌀 **HAVA PERDELERİ**
4. 💧 **NEM ALMA CİHAZLARI**
5. 🦠 **HAVA TEMİZLEYİCİLER**
6. 🔗 **FLEXIBLE HAVA KANALLARI**
7. ⚡ **HIZ KONTROLÜ CİHAZLARI**
8. 🔧 **AKSESUARLAR**

## 🎨 CUSTOM HVAC ICON SYSTEM

**Mega Menü & Kategori SVG İkon Felsefesi (48x48px):**
1. **💨 FANLAR** - Axial fan with rotating blades + airflow lines
2. **🔥 ISI GERİ KAZANIM** - Heat exchanger with temperature arrows
3. **🌀 HAVA PERDELERİ** - Air curtain with downward flow
4. **💧 NEM ALMA** - Dehumidifier with water droplets
5. **🦠 HAVA TEMİZLEYİCİLER** - Air purifier with HEPA layers
6. **🔗 FLEXIBLE KANALLAR** - Corrugated flexible duct
7. **⚡ HIZ KONTROLÜ** - Electronic control panel with dial
8. **🔧 AKSESUARLAR** - HVAC tools and components

**Marka İkonları (32x32px):**
- **AVenS**: Turkish professional theme
- **Vortice**: Italian elegance, spiral motif
- **Casals**: Spanish reliability, gear theme
- **Nicotra Gebhardt**: German precision engineering
- **Flexiva**: Flexibility waves
- **Danfoss**: Scandinavian minimalism

## 📝 ÜRÜN DETAY SAYFA YAPISI (Scroll-Spy Navigation)
1. **Genel Bilgiler** (Hero section - white background)
2. **Modeller** (Product variants - light gray background)  
3. **Ölçüler** (Dimensions - white background)
4. **Diyagramlar** (Technical diagrams - light blue background)
5. **Dökümanlar** (Documentation links - white background)
6. **Ürün PDF** (Downloadable catalogs - light gray background)
7. **Sertifikalar** (Certifications - white background)

## ✍️ TİPOGRAFİ OTORİTESİ (VentHub Typography Scale)

VentHub projesinde metin tutarlılığı için `vh-` ön ekiyle başlayan standart CSS class'ları kullanılır.

### 1. Başlıklar (Headings)
- **.vh-display**: Dev manşetler (H1 - Hero). `4.5rem`, Black.
- **.vh-h1**: Ana sayfa ve Kategori başlıkları. `3rem`, Extra-Bold.
- **.vh-h2**: Bölüm başlıkları. `2.25rem`, Extra-Bold.
- **.vh-h3**: Alt bölüm başlıkları. `1.875rem`, Bold.
- **.vh-h4**: Kart ve grup başlıkları. `1.5rem`, Bold.
- **.vh-h5**: Küçük grup başlıkları. `1.25rem`, Semi-Bold.
- **.vh-h6**: En küçük başlıklar. `1.125rem`, Semi-Bold.

### 2. Metinler (Body)
- **.vh-body-lg**: Büyük paragraf metinleri. `1.125rem`.
- **.vh-body**: Standart paragraf metni. `1rem`.
- **.vh-body-sm**: Küçük metinler ve açıklamalar. `0.875rem`.

### 3. Teknik ve Etiketler
- **.vh-technical**: Teknik tablo verileri ve MPN/SKU etiketleri. `0.75rem`, Monospace, Uppercase.
- **.vh-badge-label**: Badge ve küçük uyarı metinleri. `10px`, Black, Uppercase, Tracking-wide.
- **.vh-eyebrow**: Başlık üstü ön metinler. `12px`, Bold, Uppercase, Tracking-widest.

### 4. Zengin İçerik (Prose)
- **.prose-vh**: Markdown veya RichText içeriklerin (Ürün açıklamaları vb.) standart render edilmesi için kullanılır.
