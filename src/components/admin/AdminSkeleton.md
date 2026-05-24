---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminSkeleton.tsx
skeleton_hash: 3d64d8f079258cce
generated_at: 2026-05-23T21:51:13Z
---

## Genel Bakış
`AdminSkeleton` bileşeni, yönetim panelinde veri listelerinin yüklenme sürecinde gösterilen yer tutucu (skeleton) arayüzünü oluşturur. Varyant, satır sayısı, sütun sayısı ve alan sayısı gibi parametrelerle farklı tablo yapılarına uyum sağlayan esnek bir şablon sunar.

## Fonksiyon Grupları
### Skeleton Oluşturma
Verilen parametrelere göre satır ve alan sayısını hesaplar, her bir satır için tekrarlanan placeholder elemanlarını üretir.
- AdminSkeleton

### Stil ve Varyant Yönetimi
`variant` prop’una göre farklı CSS sınıfları veya stiller uygulayarak skeleton’ın görsel tipini (tablo, kart, form) belirler.
- AdminSkeleton

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### AdminSkeleton
**Ne yapar**: Bu fonksiyon, yönetici paneli (admin) sayfalarında veri yüklenirken gösterilecek bir iskelet (skeleton) yükleme bileşeni oluşturur. Kullanıcıya içeriğin gelmekte olduğunu görsel bir geri bildirimle bildirir ve sayfanın nihai düzenini kabaca yansıtır. Farklı admin ekranlarına uyum sağlayabilmesi için çeşitli konfigürasyon parametreleri alır.

**Nasıl yapar**: Kendisine iletilen `variant`, `rows`, `count` ve `fields` parametrelerine göre tekrarlayan bir ızgarayı (grid) render eder. Belirtilen `fields` sayısı kadar sütun içeren her bir satır, `rows` parametresi kadar çoğaltılır. Bu satır grupları, `count` değeri kadar tekrarlanarak tam bir sayfa iskeleti oluşturulur. Herhangi bir API çağrısı yapılmaz; tamamen görsel bir yer tutucu (placeholder) görevi görür.

**Parametreler**:
- `variant`: `AdminSkeletonProps` tipinden türetilmiş — Kullanılacak iskelet düzeninin görsel varyasyonunu veya temasını belirler. Farklı admin sayfa türleri için farklı yükleme şablonları sunulmasını sağlar.
- `rows`: `number` (Varsayılan: `5`) — Oluşturulacak iskelet yapısındaki toplam satır sayısını ifade eder.
- `count`: `number` (Varsayılan: `4`) — Sayfada yan yana bulunacak iskelet grubu veya kart sayısını belirtir.
- `fields`: `number` (Varsayılan: `6`) — Her bir satırda görüntülenecek alan (girdi/hücre) sayısını tanımlar.

**Dönüş**: Net bir dönüş türü kod içerisinde açıkça belirtilmemiştir (`void` veya bilinmiyor). Bu yapı bir React fonksiyon bileşeni olduğu için bir JSX elemanı döndürmesi beklenir. Kesin dönüş tipini belirlemek için mevcut belge bağlamı yetersizdir.

---

## INTERFACES

### AdminSkeletonProps
- `variant: 'table' | 'cards' | 'form'`
- `rows?: number`
- `count?: number`
- `fields?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AdminSkeleton.tsx::AdminSkeleton
- **params**: 
  - `variant`: string (varyant: "table", "cards", varsayılan form)
  - `rows`: number (tablo satır sayısı, varsayılan

---

## NODE ID STANDARD

  file: src\components\admin\AdminSkeleton.tsx
  function: src\components\admin\AdminSkeleton.tsx::AdminSkeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSkeleton