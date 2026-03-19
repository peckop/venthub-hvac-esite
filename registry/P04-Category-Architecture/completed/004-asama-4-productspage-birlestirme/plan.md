# Plan: 004-products-page-integration

## 🎯 Hedef
Genel ürün listesi sayfasını Gateway mimarisine dahil ederek projedeki mükerrer kodları temizlemek.

## ✅ Alt Görevler
- [ ] `src/app/products/page.tsx` analizini tamamla.
- [ ] `useCategoryGateway` hook'unu kategori bağımsız ürün çekimi için optimize et.
- [ ] `src/views/ProductsPage.tsx` dosyasını yeni mimariye (GridView) dönüştür.
- [ ] Eski ürün listeleme bileşenlerini temizle.
- [ ] Final `tsc` ve `lint` kontrolünden geç.

## 🏗️ Uygulama Adımları
### Step 1: Keşif
- Action: `src/views/ProductsPage.tsx` dosyasını oku.
- Verify: Mevcut filtreleme mantığıyla `useCategoryGateway` arasındaki farkları listele.

### Step 2: Hook Entegrasyonu
- Action: `/products` sayfası için hook'u test et.
- Verify: Tüm ürünlerin (slug'sız) çekildiğini teyit et.

### Step 3: View Dönüşümü
- Action: `ProductsPage` bileşenini `CategoryGridView` kullanacak şekilde güncelle.
- Verify: `/products` adresinde ürünlerin ve filtrelerin çalıştığını gör.
