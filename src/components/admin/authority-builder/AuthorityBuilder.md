---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx
skeleton_hash: 03cf94d4374fb1dc
entity_hashes:
  func:AuthorityBuilder: ea4f02be3be8275d
  func:getInitialContent: d68640fe30ab6ebc
  overview: 2a123a4c769f5fe6
  style_tokens: debe507a4c224f1e
generated_at: 2026-06-19T20:47:06Z
---

## Genel Bakış
AuthorityBuilder, yönetim panelinde yetki (authority) bloklarının oluşturulması ve düzenlenmesi için kullanılan bir React bileşenidir. Bileşen, kullanıcı arayüzü üzerinden yetki yapılandırmasını yönetir ve içeriğe göre başlangıç verilerini otomatik olarak üretir.

## Fonksiyon Grupları
### Yetki Bloğu Oluşturucu & Yönetici
Bu grup, yönetim panelinde yetki yapılandırmasının görsel arayüzünü oluşturur, kullanıcı etkileşimlerini yönetir ve değişiklikleri üst bileşenlere iletir.  
- AuthorityBuilder

### İçerik Başlatma Yardımcısı
Yeni yetki blokları oluşturulduğunda veya varsayılan değerler gerektiğinde, blok türüne uygun başlangıç içeriğini üretmek için kullanılır.  
- getInitialContent

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `value` prop'u olarak `undefined` veya `null` geçilirse, bileşen `value = []` varsayılan değerini kullanır ve başlangıçta boş bir yetki bloğu listesi ile başlar.

[Aksiyom 2]: Eğer `onChange` callback fonksiyonu çağrılmazsa veya geçerli bir fonksiyon sağlanmazsa, bileşendeki yetki bloklarındaki değişiklikler üst bileşene iletilemez ve bileşen kontrolden çıkar.

[Aksiyom 3]: Eğer `BLOCK_TYPES` dizisi boşsa veya `blockTypeLabels` objesinde `BLOCK_TYPES` elemanlarına karşılık gelen etiketler eksikse, `getInitialContent` fonksiyonuna geçerli bir `type` parametresi iletilemez.

[Aksiyom 4]: Eğer `getInitialContent` fonksiyonuna `BLOCK_TYPES` dizisinde bulunmayan bir `type` değeri verilirse, fonksiyonun dönüş değeri bilinmiyor olur ve bileşen beklenmeyen bir içerik yapısı ile karşılaşabilir.

[Aksiyom 5]: Eğer `AuthorityBlockType` türü `BLOCK_TYPES` dizisi tarafından tanımlanmamışsa (yani geçerli bir yetki bloğu türü değilse), `getInitialContent` fonksiyonunun ne döndüreceği bilinmiyor olur.

---

## FONKSİYON DETAYLARI

### AuthorityBuilder
**Ne yapar**: AuthorityBuilder, bir React bileşeni olarak tanımlanır ve yönetim panelinde yetki bloklarının oluşturulup düzenlenmesini sağlar.  
**Nasıl yapar**: Bileşen, `value` prop’u ile mevcut yetki bloklarını alır, `onChange` callback’i aracılığıyla değişiklikleri dışa aktarır ve iç içe bileşenler aracılığıyla blok tipine göre ilgili içerik formlarını render eder.  
**Parametreler**:
- `value`: array — Başlangıçta gösterilecek yetki bloklarının listesi; varsayılan değer `[]`.
- `onChange`: function — Yetki blokları değiştiğinde tetiklenen geri çağırma; yeni blok dizisini alır.
**Dönüş**: React.FC\<AuthorityBuilderProps\> — Tanımlı prop tiplerine sahip bir fonksiyonel React bileşeni.

### getInitialContent
**Ne yapar**: Belirtilen `AuthorityBlockType` değerine göre, o blok tipine uygun başlangıç içerik nesnesi üretir.  
**Nasıl yapar**: `switch` ifadesiyle `type` parametresi incelenir; her bir blok tipi için sabit bir içerik şablonu döndürülür. Tanımlı tipler dışında bir değer gelirse, boş bir içerik nesnesi (`{}`) döndürülür.  
**Parametreler**:
- `type`: AuthorityBlockType — İçerik şablonunun oluşturulacağı blok tipini belirten sabit bir değer.
**Dönüş**: AuthorityBlock['content'] — Seçilen blok tipine uygun, önceden tanımlanmış alanları içeren bir içerik nesnesi.

---

## İTHALATLAR (IMPORTS)
- import: ./BlockEditor::BlockEditor
- import: @/i18n/I18nProvider::useI18n
- import: react::React
- import: react::useState

---

## INTERFACES

### AuthorityBuilderProps
- `value: AuthorityContent | null`
- `onChange: (value: AuthorityContent) => void`

---

## SABİTLER
- **btnGhost** (template) — ``${btnBase} hover:bg-slate-100 hover:text-slate-900``
- **btnOutline** (template) — ``${btnBase} border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hov...`
- **btnSecondary** (template) — ``${btnBase} bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80``
- **BLOCK_TYPES** (array) — `[
  { type: 'hero', labelKey: 'admin.authority.blockTypeHero', icon: Layers ...`
- **blockTypeLabels** (object) — `{
  hero: 'admin.authority.blockTypeHero',
  specs: 'admin.authority.blockT...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/authority-builder/AuthorityBuilder.tsx::AuthorityBuilder
- **params**: `value` — AuthorityBlock dizisi, varsayılan değer []; `onChange` — bloklar güncellendiğinde çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `activeTab` — useState hook'u ile yönetilen aktif sekme durumu ('editor' | 'preview' | 'json')
  - `setActiveTab` — activeTab durumunu güncellemek için setter fonksiyonu
  - `blocks` — value prop'unu diziye dönüştüren değişken, Array.isArray kontrolü ile güvenli erişim sağlar
  - `addBlock` — yeni AuthorityBlock ekleyen fonksiyon, crypto.randomUUID() ile benzersiz ID oluşturur
  - `removeBlock` — belirli bir ID'ye sahip bloğu diziden kaldıran filtre fonksiyonu
  - `moveBlock` — blokların sırasını yukarı/aşağı değiştiren yer değiştirme fonksiyonu
  - `updateBlock` — belirli bir indeksteki bloğu güncelleme fonksiyonu
- **Dönüş**: JSX element (React bileşeni)

### [N2_NASIL] AST Pointer: src/components/admin/authority-builder/AuthorityBuilder.tsx::getInitialContent
- **params**: `type` — AuthorityBlockType (blok tipi: 'hero', 'specs', 'media', 'rich-text', 'features-grid', 'comparison', 'cta-banner')
- **ic_degiskenler**:
  - Parametre olarak yalnızca `type` kullanılır, iç değişken yoktur
- **Dönüş**: AuthorityBlock['content'] — blok tipine göre önceden tanımlı başlangıç içeriği nesnesi

---

## NODE ID STANDARD

  file: src\components\admin\authority-builder\AuthorityBuilder.tsx
  function: src\components\admin\authority-builder\AuthorityBuilder.tsx::AuthorityBuilder
  function: src\components\admin\authority-builder\AuthorityBuilder.tsx::getInitialContent

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthorityBuilder
  export: getInitialContent

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-indigo-600`, `bg-slate-50/50`, `bg-slate-50/80`, `bg-slate-900`, `bg-white`, `border-2`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `hover:bg-indigo-50`, `hover:bg-red-50`, `hover:bg-slate-200`, `hover:border-indigo-400`, `text-center`
- **Layout:** `flex`, `flex-1`, `flex-col`, `gap-1`, `gap-2`, `gap-3`, `grid`, `grid-cols-2`, `h-10`, `h-4`, `h-5`, `h-6`, `h-8`, `h-auto`, `hover:shadow-md`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${btnOutline`, `${cardClass`, `border`, `cursor-grab`, `editor`, `font-bold`, `font-medium`, `font-mono`, `group`, `group-hover:opacity-100`, `italic`, `json`, `mr-2`, `mt-8`, `opacity-0`