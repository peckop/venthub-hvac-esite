# Brainstorm: 019 - Typography Authority Audit: Search, Auth, Cart

## 🎯 Hedef
P01-014 ile gelen "Typography Authority" standartlarını (vh-h1, vh-body vb.) projenin eski (legacy) ama kritik olan Arama, Kimlik Doğrulama ve Sepet sayfalarına uygulamak.

## 🚀 Audit Kriterleri
1.  **Headings:** `text-2xl font-bold` gibi manuel tanımları `vh-h1`, `vh-h2` veya `vh-h3` ile değiştir.
2.  **Body:** `text-steel-gray` veya `text-gray-600` gibi tanımları `vh-body`, `vh-body-sm` veya `vh-body-lg` ile değiştir.
3.  **Labels:** Form etiketlerini `vh-badge-label` veya `vh-technical` (bağlama göre) standartlarına çek.
4.  **Links:** `text-primary-ocean` gibi manuel link renklerini `vh-link` ile ortaklaştır.

## 🛠️ Uygulama Alanları
- **Auth:** `LoginPage`, `RegisterPage`, `ForgotPasswordPage`.
- **Cart:** `CartPage` ve bağlı alt bileşenler.
- **Search:** `SearchOverlay` ve arama sonuçları.

## 📌 Teknik Notlar
- Sadece `className` güncellemeleri yapılacak.
- Layout yapısına (padding/margin) dokunulmayacak, sadece tipografi (font size, weight, color, letter spacing) standardize edilecek.
- `any` tipleri tespit edilirse, audit sırasında temizlenecek.
