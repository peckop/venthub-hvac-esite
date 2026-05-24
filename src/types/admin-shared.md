---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\admin-shared.ts
skeleton_hash: dc0c5778aaf0e7ba
generated_at: 2026-05-23T22:32:42Z
---

## Genel Bakış
VentHub HVAC projesinin `src/types` dizininde yer alan bu TypeScript modülü, projenin tüm admin paneli bileşenleri arasında paylaşılacak ortak tip tanımlarını barındırmak üzere tasarlanmış merkezi bir paylaşım dosyasıdır. Dosyada henüz herhangi bir içe aktarma, sabit, çalıştırılabilir kod veya tanım bulunmamaktadır, ileride admin paneliyle ilgili tüm ortak veri tiplerinin bu dosyada toplanması planlanmaktadır. Henüz aktif olarak herhangi bir ortam değişkeni, harici API veya veritabanı kaynağı kullanmamakta olup, sadece TypeScript tipi tanımlama amacıyla oluşturulmuştur.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript modülü yalnızca proje genelinde admin paneli ile paylaşılan ortak tip (type) tanımlarını barındıran bir tür tanım modülüdür, çalıştırılabilir runtime mantığı, fonksiyon veya sabit değer içermez. Projenin hatasız derlenmesi ve tiplerin doğru kullanılabilmesi için aşağıdaki koşulların sağlanması zorunludur.

[Aksiyom 1]: Eğer bu modülün dosya yolu projenin TypeScript derleyicisinin erişebileceği kaynak dosyalar listesinde yer almazsa, bu modüldeki tipleri kullanan tüm bağımlı modüllerde "tanımlı olmayan tip" hatası oluşur, proje hiçbir şekilde derlenemez.
[Aksiyom 2]: Eğer bu modüldeki tip tanımlarının sözdizimi, projenin kullandığı TypeScript sürümü tarafından desteklenmiyorsa, bu modül ve tüm bağımlı olduğu modüller derleme hatası verir.
[Aksiyom 3]: Eğer bu modüle projenin içe aktarma (import) yolu yönetim kurallarına uygun olmayan bir konumdan erişilmeye çalışılırsa, tüm içe aktarma işlemleri başarısız olur, proje derlenemez.

---



---

## TYPE ALIASES

### Density
Table row density for dashboard views.
```typescript
type Density = 'comfortable' | 'compact'
```

### TableSortDir
Standard table sorting direction.
```typescript
type TableSortDir = 'asc' | 'desc'
```

---

## ENUMS

### LoadState
Common data loading states for views.
- `Idle`
- `Loading`
- `Error`

---

## AST POINTERS
İşlenen kaynak dosyada (`C:\Users\alize\venthub-hvac\src\types\admin-shared.ts`) analiz edilecek herhangi bir fonksiyon, sınıf, değişken veya yürütülebilir kod bloğu tanımlanmamıştır. Tüm import, sabit, fonksiyon ve class bildirim bölümleri boştur.

---

## NODE ID STANDARD

  file: src\types\admin-shared.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: Density
  export: LoadState
  export: TableSortDir