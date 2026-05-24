---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategoryCard3D.tsx
skeleton_hash: 7c8c9e731ab9c6ad
generated_at: 2026-05-23T22:14:35Z
---

## Genel Bakış
Bu modül, bir kategori kartını üç boyutlu bir görsel efektle gösteren bir React bileşeni tanımlar. Kategori adı, alt kategori sayısı ve tıklama işlevi gibi bilgileri props üzerinden alır ve kullanıcı etkileşimini sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Kullanıcı arayüzünde bir kategori kartını renderlar, görsel ve etkileşimsel özellikleri birleştirir.
- CategoryCard3D

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki koşullar sağlanmalıdır.

[Aksiyom 1]: Eğer `category` prop'u sağlanmazsa, bileşen kategori bilgisi undefined olarak görünecek veya render sırasında hata verebilir.  
[Aksiyom 2]: Eğer `subCategoryCount` prop'u sağlanmazsa, alt kategori sayısı undefined olarak gösterilecek veya eksik görünecektir.  
[Aksiyom 3]: Eğer `onClick` prop'u sağlanmazsa, kart üzerindeki tıklama işlevi çalışmayacak ve kullanıcı etkileşimi beklenildiği gibi gerçekleşmeyecektir.  
[Aksiyom 4]: Eğer `Category3DIcon` sabiti (import edilen ikon) bulunamazsa, bileşen ikon kısmını render edemeyecek ve bu bölümde hata veya boşluk ortaya çıkabilir.

---

## FONKSIYON DETAYLARI

### CategoryCard3D
**Ne yapar**: 3D animasyonlu bir kategori kartı render eder; Category Hub grid’inde görsel ve etkileşimli bir öğe olarak kullanılır.  
**Nasıl yapar**: Props olarak gelen `category`, `subCategoryCount` ve `onClick` değerlerini alır, kartın içeriğini (kategori adı, alt kategori sayısı vb.) ve 3D dönüşüm animasyonunu uygulayan stil ve etkileşim mantığını JSX içinde birleştirir; kullanıcı kart üzerine tıkladığında `onClick` fonksiyonu tetiklenir.  
**Parametreler**:
- category: object — görüntülenecek kategori bilgilerini taşıyan veri nesnesi (tipi component’in props tanımında tanımlanmıştır)  
- subCategoryCount: number — kategoriye ait alt kategori sayısını gösteren sayısal değer  
- onClick: function — kart üzerine tıklandığında çağrılacak olay işleyici fonksiyonu  
**Dönüş**: JSX.Element — React fonksiyon bileşeni olarak render edilen kategori kartı elementi (React.FC<CategoryCard3DProps> türünde)

---

## INTERFACES

### CategoryCard3DProps
- `category: Category`
- `subCategoryCount: number`
- `onClick?: () => void`

---

## SABİTLER
- **Category3DIcon** (call) — `dynamic(() => import('../products/Category3DIcon'), { ssr: false, loading: ()...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/CategoryCard3D.tsx::CategoryCard3D
- **params**: category, subCategoryCount, onClick
- **ic_degiskenler**: yok
- **Dönüş**: React.FC<CategoryCard3DProps>

### [N2_NASIL] AST Pointer: src/components/navigation/CategoryCard3D.tsx::onKeyDown
- **params**: e
- **ic_degiskenler**: 
  - `onClick` — dış kapsamdaki click handler fonksiyonu, Enter veya Space tuşuna basıldığında çağrılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\navigation\CategoryCard3D.tsx
  function: src\components\navigation\CategoryCard3D.tsx::CategoryCard3D

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryCard3D