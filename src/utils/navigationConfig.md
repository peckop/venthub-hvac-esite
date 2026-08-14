---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\navigationConfig.ts
skeleton_hash: ce061c1ad5560b5c
entity_hashes:
  overview: 0c8e815324d6c567
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu VentHub HVAC projesinin src/utils dizininde yer alan statik konfigürasyon modülü, uygulama arayüzündeki gezinme menülerinin içeriklerini merkezi olarak tanımlamak amacıyla oluşturulmuştur. Modülde hiçbir harici bağımlılık, dış API çağrısı veya ortam değişkeni kullanılmaz; yalnızca ana ve ikincil gezinme öğelerini içeren iki adet sabit değişken barındırılır. Uygulamanın tüm gezinme ile ilgili arayüz bileşenleri, menü yapılarını oluşturmak için bu dosyadaki sabitleri referans alır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, HVAC uygulaması için kullanıcı arayüzü navigasyon yapısını tanımlayan sabit değerler barındırır, çalışması için bu sabitlerin tanımlı, format olarak geçerli ve uygulama genel yapısıyla uyumlu olması zorunludur.

[Aksiyom 1]: Eğer NAVIGATION_PRIMARY_ITEMS array'i tanımlı değilse, uygulamanın ana gezinme çubuğu yüklenemez ve kullanıcı uygulamanın ana sayfalarına erişemez.
[Aksiyom 2]: Eğer NAVIGATION_PRIMARY_ITEMS array'i geçersiz öğe yapısına sahipse (gerekli tanımlamalar eksikse), navigasyon bileşeni arayüzü bozuk render eder veya çalışma zamanı hatası fırlatır.
[Aksiyom 3]: Eğer NAVIGATION_SECONDARY_ITEMS array'i tanımlı değilse, uygulamanın ikincil/alt gezinme menüsü oluşturulamaz ve tüm ikincil kategorideki sayfalara erişim kesilir.
[Aksiyom 4]: Eğer her iki navigasyon array'inde tanımlanan rota değerleri uygulamanın ana router yapısında kayıtlı değilse, ilgili navigasyon linkleri tıklandığında kullanıcı 404 sayfasına yönlenir.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### NavigationItemConfig
- `id: NavigationItemId`
- `labelKey: string`
- `href?: string`
- `minWidthClass?: string`
- `showInCompact?: boolean`

---

## TYPE ALIASES

### NavigationMode
```typescript
type NavigationMode = 'expanded' | 'compact'
```

### NavigationItemId
```typescript
type NavigationItemId = | 'categories'
    | 'products'
    | 'brands'
    | 'knowledgeHub'
    | 'about'
    | 'contact'
    | 'account'
```

---

## SABİTLER
- **NAVIGATION_PRIMARY_ITEMS** (array) — `[
    {
        id: 'categories',
        labelKey: 'common.categories',
...`
- **NAVIGATION_SECONDARY_ITEMS** (array) — `[
    {
        id: 'brands',
        labelKey: 'common.brands',
        ...`

---

## AST POINTERS
C:\Users\alize\venthub-hvac\src\utils\navigationConfig.ts konumlu kaynak dosyasında tanımlı herhangi bir fonksiyon bulunmamaktadır. Dosyada yalnızca 2 adet sabit dizi tanımlanmıştır:
- `NAVIGATION_PRIMARY_ITEMS` — Birincil gezinme menüsü öğelerini depolayan dizi tipi sabit
- `NAVIGATION_SECONDARY_ITEMS` — İkincil gezinme menüsü öğelerini depolayan dizi tipi sabit

---

## NODE ID STANDARD

  file: src\utils\navigationConfig.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: NAVIGATION_PRIMARY_ITEMS
  export: NAVIGATION_SECONDARY_ITEMS
  export: NavigationItemConfig
  export: NavigationItemId
  export: NavigationMode