# Brainstorm: 004-products-page-integration

## 🎯 Hedef
`/products` sayfasını (tüm ürünlerin listesi), `/category` sayfalarıyla aynı modern altyapıya (`useCategoryGateway` ve `CategoryGridView`) taşımak. Kod tekrarını sıfırlamak ve filtreleme gücünü eşitlemek.

## 🛡️ Mevcut Durum & Riskler
- **Farklı Mantıklar:** Şu an `/products` sayfası muhtemelen `ProductsPage.tsx` adında ayrı bir dosya kullanıyor. Kategori filtreleri ile genel ürün filtreleri arasında UX tutarsızlığı var.
- **Performans:** Tüm ürünlerin tek bir grid'de listelenmesi, kategori bazlı listelemeye göre daha ağır (load time).
- **SEO:** Genel ürün listesinin SEO parametreleri (canonical, meta) kategori sayfalarından farklı yönetiliyor.

## 💡 Mimari Çözüm
- **Gateway Reuse:** `/products` sayfası için `useCategoryGateway` hook'unu "Null Category" veya "Root Category" parametresiyle çağıracağız.
- **View Reuse:** `CategoryGridView` bileşenini `/products` sayfasının da ana görünümü yapacağız.
- **Routing:** `/app/products/page.tsx` dosyasını, yeni Gateway yapısını kullanacak şekilde refactor edeceğiz.

## ✅ Başarı Kriterleri
- `/products` ve `/category/fans` sayfalarındaki filtreleme ve liste görünümü %100 aynı UX'e sahip olmalı.
- Eski, mükerrer `ProductsPage.tsx` dosyası (veya benzeri) tamamen silinmeli.
- Filtreleme hızı tüm sayfalarda standardize edilmeli.
