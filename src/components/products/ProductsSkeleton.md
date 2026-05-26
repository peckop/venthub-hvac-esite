---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ProductsSkeleton.tsx
skeleton_hash: 301cb056fb6b24f1
generated_at: 2026-05-23T22:26:25Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümünde kullanılan, içerik yükleme sürecinde ekranda gösterilecek yükleme iskeletini oluşturan React bileşenini barındırır. Ürün içerikleri henüz yüklenmemişken kullanıcı deneyimini iyileştirmek amacıyla, gerçek içeriğin yerleşimini yansıtan bir yer tutucu sunar.

## Fonksiyon Grupları
### Ana Yükleme İskeleti Bileşeni
Modülün tüm sorumluluğunu üstlenen, ürünler bölümünde kullanılacak yükleme iskeletini ekrana render eden tek ana bileşen fonksiyonunu içerir.
- ProductsSkeleton

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ürün listesi yükleme iskeleti (ProductsSkeleton) bileşeni, yalnızca ürün içeriklerinin yüklendiği sürede UI'da tutarlı düzeni korumak amacıyla kullanılır, doğru çalışması için React destekli çalışma zamanı ve derleme ortamı koşullarının sağlanması zorunludur.

[Aksiyom 1]: Eğer çalışma zamanı ortamında React ve ReactDOM kütüphaneleri erişilebilir değilse, bu bileşen hiçbir şekilde DOM'a render edilemez, uygulama çalışma zamanı hatası alır.
[Aksiyom 2]: Eğer proje derleme aşamasında JSX sözdizimini işleyebilen bir transpiler (örn: Babel, Vite, TypeScript derleyicisi) yapılandırılmamışsa, bu bileşenin kodu derlenemez, proje build aşamasında hata alır.
[Aksiyom 3]: Eğer bu bileşen, yükleme sonrası gösterilecek asıl ürünler listesi bileşeniyle aynı düzen ve boyut kısıtlamalarına sahip olacak şekilde sayfa yapısına entegre edilmemişse, yükleme süresince UI'da istenmeyen içerik kayması (CLS) oluşur, kullanıcı deneyimi bozulur.
[Aksiyom 4]: Eğer bu skeleton bileşeni, ürün içeriklerinin yüklenmesi tamamlandıktan sonra UI'dan kaldırılmazsa, kullanıcı gerçek ürün içeriklerine erişimde sorun yaşar, uygulama ürün listeleme işlevi devre dışı kalır.

---

## FONKSIYON DETAYLARI

### ProductsSkeleton
**Ne yapar**: VentHub HVAC projesinin ürünler bileşenleri kategorisinde tanımlanan ProductsSkeleton, ürün listelerinin yüklenme sürecinde içeriğin yerini tutan yükleme iskeleti (skeleton) bileşenidir. Ürün verileri yüklenirken kullanıcının boş ekranla karşılaşmasını engelleyerek, uygulamanın yanıt vermediği algısını ortadan kaldırır ve yükleme durumunu şeffaf bir şekilde iletir.
**Nasıl yapar**: TypeScript ile yazılmış React bileşeni olarak, ana Products bileşeninin kullandığı grid veya liste düzenini tam olarak taklit eden basit placeholder öğeleri oluşturur. Bu eşleşen düzen sayesinde yükleme işlemi tamamlandığında gerçek ürün içerikleri ekrana sorunsuz bir şekilde yerleşir, kullanıcı deneyimini olumsuz etkileyen layout sıçraması gibi durumların önüne geçilir.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz
**Dönüş**: Fonksiyona ait açıkça belirtilmiş return tipi bilinmemekle birlikte, React bileşeni yapısı gereği tarayıcıda render edilebilen JSX elementi döndürür. Bu dönüş değeri, yükleme durumunu temsil eden iskelet öğelerini içerir ve ana ürün bileşeni tarafından yükleme sürecinde ekrana basılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsSkeleton.tsx::ProductsSkeleton
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: Ürünler sayfası için animasyonlu yükleme iskeleti (skeleton) içeren JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsSkeleton.tsx::ilk_filtre_satiri_callback
- **params**: [i]
- **ic_degiskenler**: `i` — Map fonksiyonu tarafından sağlanan dizi elemanı, oluşturulan JSX elementine benzersiz `key` değeri olarak kullanılır
- **Dönüş**: İlk filtre grubundaki her satır için boşluk doldurucu skeleton div JSX elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsSkeleton.tsx::ikinci_filtre_satiri_callback
- **params**: [i]
- **ic_degiskenler**: `i` — Map fonksiyonu tarafından sağlanan dizi elemanı, oluşturulan JSX elementine benzersiz `key` değeri olarak kullanılır
- **Dönüş**: İkinci filtre grubundaki her satır için boşluk doldurucu skeleton div JSX elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsSkeleton.tsx::urun_karti_skeleton_callback
- **params**: [i]
- **ic_degiskenler**: `i` — Map fonksiyonu tarafından sağlanan dizi elemanı, oluşturulan JSX elementine benzersiz `key` değeri olarak kullanılır
- **Dönüş**: Tek bir ürün kartı için tam yükleme iskeleti içeren kapsamlı JSX elementi

---

## NODE ID STANDARD

  file: src\components\products\ProductsSkeleton.tsx
  function: src\components\products\ProductsSkeleton.tsx::ProductsSkeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsSkeleton

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-gray-200`
- **Layout:** `flex`, `flex-1`, `flex-col`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-2`, `h-12`, `h-4`, `h-5`, `hidden`, `lg:block`, `lg:flex-row`, `lg:grid-cols-3`
- **Responsive:** `lg:`, `sm:`, `xl:` prefix kullanımları
