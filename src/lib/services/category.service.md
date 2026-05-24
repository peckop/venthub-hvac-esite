---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\category.service.ts
skeleton_hash: aee4457659e06e6e
generated_at: 2026-05-23T22:31:51Z
---

## Genel Bakış
VentHub HVAC yönetim platformu için geliştirilen bu kategori servis modülü, sistemde kullanılan tüm kategori verilerinin erişimini yöneterek, uygulama bileşenlerinin ihtiyaç duydukları kategori listesine güvenli bir şekilde ulaşmasını sağlar. Asenkron çalışma yapısı sayesinde veri çekme işlemleri sırasında uygulama akışını kesintiye uğratmaz, TypeScript tabanlı yapısı ile tür güvenliği sağlar.

## Fonksiyon Grupları
### Kategori Verisi Erişimi
Sisteme kayıtlı tüm kategori kayıtlarını dışarıya sunan temel işlevi barındıran grup, yalnızca kategori listesi çekme ihtiyacını karşılamak üzere tasarlanmıştır.
- getCategories

---

## AXIOMS – Mimari Varsayımlar
Bu HVAC (ısıtma, havalandırma, iklimlendirme) sistemi kategori servisi, tüm iç tüketici modüllere kategori listesini sunmak üzere tasarlanmıştır, sorunsuz çalışması için veri kaynağı erişilebilirliği, yapısal uyumluluk ve servis erişilebilirliği zorunlu koşullardır.

[Aksiyom 1]: Eğer kategori verilerinin saklandığı merkezi veri kaynağına (veritabanı, harici API vb.) servisin erişimi yoksa, getCategories() fonksiyonu başarısız olur, kategori bağımlı tüm sistem işlevleri çalışmaz.
[Aksiyom 2]: Eğer veri kaynağından gelen kategori verileri servisin beklediği zorunlu yapısal standartları karşılamıyorsa, getCategories() tarafından döndürülen veriler tüketici modüller tarafından işlenemeyerek kullanıcı arayüzü veya arka plan işlemlerinde hatalara yol açar.
[Aksiyom 3]: Eğer CategoryService modülü, onu kullanan diğer servis, bileşen veya API uç noktaları tarafından erişilebilir durumda değilse, sistemdeki tüm kategori listeleme, filtreleme ve sınıflandırma işlemleri devre dışı kalır.
[Aksiyom 4]: Eğer getCategories() fonksiyonu döndürdüğü sabit kategoriler listesini uygun bir stratejiyle önbelleğe almıyorsa, tekrarlayan çağrılarda gereksiz veri çekme işlemleri sistem kaynaklarını tüketerek genel performans düşüşüne neden olur.

---

## FONKSIYON DETAYLARI

### getCategories
**Ne yapar**: VentHub HVAC sisteminin kategori servisinde yer alan, tüm geçerli sistem kategorilerini sunan asenkron bir servis fonksiyonudur. Uygulamanın arayüz katmanı veya diğer hizmet servislerinin ihtiyaç duyduğu kategori verilerine merkezi olarak erişim sağlamak amacıyla tasarlanmıştır, tüm kayıtlı kategorileri tek bir çağrı ile erişime açar.
**Nasıl yapar**: Hiçbir ek filtre veya koşul uygulamadan doğrudan bağlı olduğu arka uç veri kaynağından tüm kategori kayıtlarını çeker. Gelen ham verileri sistemde tanımlı standart Category veri yapısına uygun hale getirir, asenkron çalışma prensibi ile veri çekme sürecinde uygulamanın ana iş akışını bloke etmez.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: Promise<Category[]> tipinde bir asenkron değer döndürür. İşlem başarılı şekilde tamamlandığında Category tipinde tanımlanmış özelliklere sahip nesnelerden oluşan bir diziyi çözümleyen promise döner. Veri erişim hataları, ağ sorunları veya sunucu hataları gibi olumsuz durumlarda ise ilgili hata bilgisini içerecek şekilde promise reddedilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\services\category.service.ts::getCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase categories tablosu sorgusundan dönen ham kategori verilerini tutan değişken, tip dönüşümünde kullanılır
  - `error` — Sorgu sırasında oluşabilecek hataları tutan değişken, hata varsa fırlatılır
  - `supabase.from('categories')` — Supabase'de categories tablosuna erişim sağlayan çağrı
  - `supabase.select('id, parent_id, name, slug, image_url, level, is_active, metadata, created_at, updated_at, menu_label, marketing_title, translation_key, description, authority_content, display_mode, is_featured, seo_desc, seo_title, sort_order')` — Categories tablosundan istenen tüm sütunları seçen sorgu yöntemi
  - `supabase.eq('is_active', true)` — Sadece aktif durumdaki kategorileri filtreleyen koşul
  - `supabase.order('level', { ascending: true })` — Kategorileri level sütununa göre artan sırada sıralayan yöntem
  - `supabase.order('name', { ascending: true })` — Kategorileri name sütununa göre artan sırada sıralayan ikinci yöntem
  - `toUICategoryList` — Veritabanı formatındaki kategori verisini UI için uygun formata dönüştüren tip dönüşüm fonksiyonu
  - `data as (typeof data & DbCategory[])` — Ham sorgu verisini DbCategory tip dizisine cast eden tip dönüşümü ifadesi
- **Dönüş**: Promise<Category[]> — UI için uyarlanmış aktif kategori listesini içeren promise döndürür

---

## NODE ID STANDARD

  file: src\lib\services\category.service.ts
  function: src\lib\services\category.service.ts::getCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategories