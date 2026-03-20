# 🧠 Brainstorm: P01-016 Master Şablon (Master Template)

## 🎯 Hedef
VentHub'daki tüm sayfaların (Kategori, PDP, Statik Sayfalar) içine oturduğu ana "Kabuk" (Skeleton) yapısını tek bir yerden yönetmek. "Page Builder" için gerekli olan `Layout` standartlarını mühürlemek.

## 🔍 Mevcut Durum
- Header ve Footer her sayfada manuel çağrılıyor veya `layout.tsx`'e çok bağımlı.
- Sayfa kenar boşlukları (max-width, padding) sayfalara göre değişebiliyor.
- Sayfa geçiş animasyonları veya scroll pozisyonu yönetimi dağınık.

## 💡 Mimari Çözüm

### 1. MainLayout Dispatcher
- Tüm projeyi kapsayan `src/components/layout/MainLayout.tsx` bileşeninin kurulması.
- Header, StickyHeader, Footer ve ContentArea (Slot) hiyerarşisinin burada netleşmesi.

### 2. Page Shell Pattern
- `max-w-7xl` gibi standart genişlik ve `px-4` gibi standart padding değerlerinin "Page Shell" bileşeniyle dayatılması.
- Sidebar'lı vs. Sidebarsız sayfa şablonlarının (Templates) ayrıştırılması.

### 3. Navigation & State
- Sayfa geçişlerindeki yüklenme durumlarının (Progress bar) merkezi yönetimi.
- Global Modallar (Auth, Cart, Project) için yer tutucuların ana şablona eklenmesi.

## ✅ Başarı Kriterleri
- Yeni bir sayfa oluştururken Header/Footer/Padding düşünülmesine gerek kalmaması.
- Projenin tamamında kenar boşluklarının ve hizalamaların %100 simetrik olması.
- Page Builder'ın render edeceği "Alan"ın (Canvas) sınırlarının netleşmesi.
