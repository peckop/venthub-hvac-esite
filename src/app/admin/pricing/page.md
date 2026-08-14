---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\pricing\page.tsx
skeleton_hash: 99a9292da2aad0b9
entity_hashes:
  func:Page: 8da9614d8cc1846c
  overview: 5ab5d7e5fc444b30
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-14T09:11:44Z
---

## Genel Bakış
Bu modül, Next.js App Router yapısında yer alan admin fiyatlandırma sayfasını tanımlayan tek bileşenli bir React sayfa modülüdür. Modül, uygulamanın yönetici arayüzünde fiyatlandırma verilerinin görüntülenmesini ve yönetimini sağlayan bir sayfa sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek bileşeni olan sayfa, fiyatlandırma yönetimi arayüzünü render eder. Bu bileşen, Next.js'in dosya tabanlı yönlendirme yapısıyla `/admin/pricing` rotasına karşılık gelir.
- `Page`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Next.js uygulamasının `/admin/pricing` rotasını sunar. Bu fonksiyon, yönetici panelindeki fiyatlandırma ayarları sayfasının erişim noktasıdır (entry point) ve tarayıcıdan bu adrese gidildiğinde renders edilen ilk bileşendir.

**Nasıl yapar**: Fonksiyon, doğrudan `AdminPricingSettingsPage` adlı bileşeni çağırarak onun JSX çıktısını döndürür. Herhangi bir veri yükleme, state yönetimi veya mantıksal işleme yapmaz; yalnızca üst düzey bir yönlendirme (orchestration) bileşeni olarak davranır. Next.js App Router yapısı içinde `page.tsx` dosyasında tanımlandığı için, bu dosya adı otomatik olarak ilgili URL rotasını eşler ve sunucu ile istemci tarafında renders edilebilir.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almamaktadır. Next.js page bileşenleri olarak varsayılan olarak props tabanlı çalışırlar ancak bu implementasyonda hiçbiri kullanılmamıştır.

**Dönüş**:
- `JSX.Element` — `AdminPricingSettingsPage` bileşeninin oluşturduğu React JSX yapısı. Bu bileşen, yönetici panelinin fiyatlandırma ayarları arayüzünü temsil eder ve muhtemelen fiyatlandırma politikaları, indirim kuralları veya hizmet fiyatlandırma yapılandırmalarını yönetme imkanı sunar.

---

## İTHALATLAR (IMPORTS)
- import: ../../../views/admin/AdminPricingSettingsPage::AdminPricingSettingsPage

---

## SABİTLER
- **metadata** (object) — `{
  title: 'Fiyat Ayarları | VentHub HVAC',
  description: 'VentHub HVAC pl...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\pricing\page.tsx::Page
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: AdminPricingSettingsPage bileşenini döndürür

---

## NODE ID STANDARD

  file: src\app\admin\pricing\page.tsx
  function: src\app\admin\pricing\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: metadata

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)