---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\category.service.ts
skeleton_hash: deb5a879b52721d9
entity_hashes:
  func:getCategories: 7d5e8e0b45de974e
  overview: 094095f1defe0e5b
generated_at: 2026-06-07T12:07:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim platformunda kategori verilerine erişim için merkezi bir servis sağlar. Tek sorumluluğu, veritabanından güncel ve tutarlı kategori listesini çekerek uygulamanın farklı bölümlerine sunmaktır.

## Fonksiyon Grupları
### Kategori Listeleme
Uygulamadaki filtreleme menüleri, navigasyon ve raporlama araçları gibi bileşenler için gerekli olan tüm aktif kategorileri tek bir fonksiyon aracılığıyla sunar.
- getCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyomlar, yalnızca fonksiyon imzasından çıkarılabilen koşullara dayanır.

---

**[Aksiyom 1]:** Eğer `supabase` parametresi (`SupabaseClient<Database>` tipinde) fonksiyona iletilmezse, `getCategories` fonksiyonu çağrılamaz — TypeScript derleme hatası oluşur.

**[Aksiyom 2]:** Eğer iletilen `supabase` istemcisi geçerli bir veritabanı bağlantısına sahip değilse (oturum açılmamış, token süresi dolmuş veya yanlış URL ile oluşturulmuş), fonksiyon çalışma zamanında veritabanı erişim hatası ile karşılaşır.

**[Aksiyom 3]:** Eğer `Database` generic parametresi, kategori tablosunu (veya ilgili tabloları) içermeyen bir şema tanımıyla oluşturulmuşsa, sorgulama zamanında tip uyumsuzluğu veya "relation not found" hatası oluşur.

---

**Not:** Fonksiyon gövdesi, dönüş tipi ve iç implementasyon detayları paylaşılmadığından, dönüş biçimi, filtreleme mantığı, hata yönetimi veya önbellek stratejisi hakkında aksiyom türetilmemiştir.

---

## FONKSİYON DETAYLARI

### getCategories

**Ne yapar**: Veritabanındaki tüm aktif kategorileri getsel olarak çeker ve UI bileşenleri tarafından kullanılabilecek forma dönüştürerek döndürür. Bu fonksiyon, HVAC sistemi için kategori hiyerarşisini ve kategori metalarını merkezi bir noktadan yöneten temel veri erişim katmanıdır.

**Nasıl yapar**: Supabase istemcisi aracılığıyla `categories` tablosuna sorgu gönderir. Önce `is_active` alanı `true` olan kayıtları filtreler, ardından `level` (artan) ve `name` (artan) sıralamasıyla sonuçları düzenler. Sorgulanan alanlar arasında kategori yapısını, SEO bilgilerini, gösterim ayarlarını ve çevirilerini tanımlayan tüm gerekli sütunlar bulunur. Sorgu sonucu elde edilen ham veri, `toUICategoryList` yardımcı fonksiyonu aracılığıyla UI tarafında tüketilmeye uygun `Category[]` yapısına dönüştürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Yetkilendirilmiş ve tip güvenli Supabase istemcisi. Veritabanı bağlantısı ve sorgulama işlemleri için kullanılır. Database generic tipi, veritabanı şemasını ve tablo yapılarını tanımlar.

**Dönüş**: `Promise<Category[]>` — Asenkron olarak çözünen ve UI tarafında kullanıma hazır kategorilerin dizisini döndürür. Her bir Category nesnesi, kategorinin ID'si, üst kategori ID'si, adı, slug'ı, görsel URL'i, seviyesi, aktiflik durumu, metaverisi, oluşturulma/güncellenme tarihleri, menü etiketi, pazarlama başlığı, çeviri anahtarı, açıklama, otorite içeriği, gösterim modu, öne çıkan durumu, SEO açıklaması/başlığı ve sıralama düzeni gibi alanları içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/category.service.ts::getCategories
- **params**: (supabase: SupabaseClient<Database>)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen kategori verisi (DbCategory[] tipinde veya null)
  - `error` — Supabase sorgusu sırasında oluşan hata nesnesi (varsa)
  - `result` — data ve error destructure edilen nesne (sadece `{ data, error }` ataması ile oluşturuldu)
- **Dönüş**: Promise<Category[]> — Aktif kategorilerin UI modeline dönüştürülmüş listesi

---

## NODE ID STANDARD

  file: src\lib\services\category.service.ts
  function: src\lib\services\category.service.ts::getCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategories