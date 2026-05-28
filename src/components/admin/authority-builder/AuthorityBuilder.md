---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx
skeleton_hash: a0d22b9a0a435a6b
entity_hashes:
  func:AuthorityBuilder: ea4f02be3be8275d
  func:getInitialContent: d68640fe30ab6ebc
  overview: 03c5d2aeedc01c1b
  style_tokens: debe507a4c224f1e
generated_at: 2026-05-27T18:10:48Z
---

## Genel Bakış
`AuthorityBuilder` bileşeni, yönetim panelinde yetki bloklarının oluşturulması ve düzenlenmesi için kullanıcı arayüzünü sağlar. İçerik tipine göre başlangıç verisini üretmek amacıyla yardımcı bir fonksiyon (`getInitialContent`) kullanır.

## Fonksiyon Grupları
### UI Oluşturma & Durum Yönetimi
Bu grup, kullanıcı etkileşimlerini yakalar, bileşenin iç durumunu yönetir ve dışarıya değişiklikleri `onChange` callback’iyle iletir.  
- AuthorityBuilder

### İçerik Başlatma Yardımcısı
Yetki bloğu tipine göre varsayılan içerik yapısını döndürerek, UI’nın ilk render’ı ve yeni blok eklemeleri için temel veri sağlar.  
- getInitialContent

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `value` parametresi boş bir dizi (`[]`) olarak geçilmezse, `AuthorityBuilder` bileşeni varsayılan olarak boş bir dizi ile başlatılır.  
**Aksiyom 2**: Eğer `onChange` fonksiyonu sağlanmazsa, `AuthorityBuilder` bileşeni değişiklik olaylarını tetiklemek için bir geri çağırma (callback) kullanmaz.  
**Aksiyom 3**: Eğer `getInitialContent` fonksiyonu `type` parametresi olarak geçerli bir `AuthorityBlockType` değeri almazsa, fonksiyon `undefined` döndürür.  

> **Not**: Yukarıdaki aksiyomlar, fonksiyon gövdelerinin (implementation) göz önüne alınarak oluşturulmuştur. Diğer potansiyel aksiyomlar, fonksiyon gövdelerinin detaylı incelenmesiyle ortaya çıkabilir.

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
  { type: 'hero', label: 'Hero / Banner', icon: Layers },
  { type: 'spec...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::AuthorityBuilder
- **params**: (value = [], onChange)
- **ic_degiskenler**:
  - `activeTab` — `'editor' | 'preview' | 'json'` tipinde geçerli sekmeyi tutan state.
  - `setActiveTab` — `activeTab` değerini güncelleyen state setter fonksiyonu.
  - `blocks` — `value` prop’u bir dizi ise onu, değilse boş dizi `[]` olarak tutan sabit.
  - `addBlock` — yeni bir blok oluşturup `onChange` ile dışarıya ileten yardımcı fonksiyon.
  - `removeBlock` — verilen `id` değerine sahip bloğu `blocks` dizisinden çıkarıp `onChange` ile güncelleyen fonksiyon.
  - `moveBlock` — bir bloğu `up` ya da `down` yönünde yer değiştirip sıralamayı (`order`) yeniden ayarlayan fonksiyon.
  - `updateBlock` — belirtilen indeksdeki bloğu `updatedBlock` ile değiştirip `onChange` ile yeni dizi gönderir.
- **Dönüş**: JSX.Element — bileşenin render ettiği UI (sekme kontrolü, blok ekleme butonları, blok listesi, JSON önizleme vb.).

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::addBlock
- **params**: (type: AuthorityBlockType)
- **ic_degiskenler**:
  - `newBlock` — `AuthorityBlock` tipinde, rastgele `id`, verilen `type`, mevcut `blocks.length` kadar `order`, sabit `config` ve `getInitialContent(type)` ile oluşturulan `content` içeren nesne.
- **Dönüş**: yok — `onChange([...blocks, newBlock])` çağrısı ile dışarıya yan etki sağlar.

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::removeBlock
- **params**: (id: string)
- **ic_degiskenler**: yok
- **Dönüş**: yok — `onChange(blocks.filter(b => b.id !== id))` ile belirtilen `id` dışındaki blokları dışarıya gönderir.

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::moveBlock
- **params**: (index: number, direction: 'up' | 'down')
- **ic_degiskenler**:
  - `newBlocks` — `blocks` dizisinin kopyası, sıralama değişikliği yapılmadan önceki geçici dizi.
  - `targetIndex` — `direction` değerine göre `index - 1` (up) ya da `index + 1` (down) olarak hesaplanan hedef konum.
- **Dönüş**: yok — geçerli sınırlar içinde ise iki bloğun yerini değiştirir, ardından `order` alanını yeniden indeksleyerek `onChange` ile günceller.

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::updateBlock
- **params**: (index: number, updatedBlock: AuthorityBlock)
- **ic_degiskenler**:
  - `newBlocks` — `blocks` dizisinin kopyası; `newBlocks[index]` öğesi `updatedBlock` ile değiştirilir.
- **Dönüş**: yok — güncellenmiş dizi `onChange(newBlocks)` ile dışarıya iletilir.

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\AuthorityBuilder.tsx::getInitialContent
- **params**: (type: AuthorityBlockType)
- **ic_degiskenler**: yok (switch ifadesi içinde doğrudan dönen sabit nesneler)
- **Dönüş**: AuthorityBlock['content'] — `type` değerine göre ön tanımlı içerik nesnesi (örnek: hero, specs, media vb.) döndürür.

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