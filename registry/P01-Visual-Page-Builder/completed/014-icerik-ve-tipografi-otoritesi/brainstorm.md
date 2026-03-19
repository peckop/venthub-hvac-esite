# 🧠 Brainstorm: P01-014 İçerik ve Tipografi Otoritesi

## 🎯 Hedef
VentHub projesindeki tüm metinsel bileşenlerin (başlıklar, paragraflar, listeler) bir "Otorite" (standardizasyon) altına alınması. "Alt yapı yapmadan bina çıkmama" prensibi gereği, Page Builder öncesi yazı dilimizi ve stilimizi mühürlemek.

## 🔍 Mevcut Sorunlar
- Farklı sayfalarda farklı font boyutları ve font-weight kullanımları.
- Tailwind class'larının (text-2xl, text-lg vb.) her bileşende manuel girilmesi (Maintenance borcu).
- "VentHub Ses Tonu"nun (profesyonel, teknik ama akıcı) tam olarak mühürlenmemesi.

## 💡 Mimari Çözüm

### 1. Tipografi Hiyerarşisi (The Scale)
Tailwind `typography` plugin'ini temel alarak veya özel CSS class'ları ile bir hiyerarşi kurmak:
- **Display:** Dev manşetler (H1 - Hero).
- **Heading:** Bölüm başlıkları (H2-H4).
- **Subheading:** Teknik detay başlıkları (H5-H6).
- **Body:** Paragraf metinleri (Base, Large, Small).
- **Technical:** Tablo ve teknik spesifikasyon fontları (Monospace opsiyonlu).

### 2. Metin Standartları (The Voice)
- Tüm ürün açıklamaları "Teknik Veri -> Fayda -> Sonuç" akışıyla yazılmalı.
- İkon-metin ilişkisi standardize edilmeli.

### 3. Uygulama Yöntemi
- `tailwind.config.ts` içindeki `extend` objesini zenginleştirme.
- `src/styles/typography.css` adında merkezi bir stil dosyası oluşturma.
- Mevcut bileşenlerdeki (ProductCard, CategoryHero) dağınık class'ları bu merkezi otoriteye bağlama.

## ✅ Başarı Kriterleri
- Tüm projede başlık stillerinin tek bir yerden yönetilmesi.
- Yeni bir sayfa eklenirken "hangi fontu kullanmalıyım?" sorusunun ortadan kalkması.
- Erişilebilirlik (A11y) standartlarına uygun kontrast ve boyutların sağlanması.
