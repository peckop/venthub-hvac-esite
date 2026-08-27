---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\components\admin\data-table\BulkRolePanel.tsx
skeleton_hash: 48ef6e64fff50b61
entity_hashes:
  func:BulkRolePanel: 763d83337d350373
  overview: 372bee1e944a5f3b
  style_tokens: 812d28b6d25e760f
generated_at: 2026-08-27T04:10:39Z
---

## Genel Bakış
BulkRolePanel, admin panelindeki veri tablolarında çoklu satır seçimi ile kullanıcıların rollerini toplu olarak değiştirmek için kullanılan bir React bileşenidir. Bu bileşen, bir modal veya panel içinde rol seçim arayüzünü sunar ve seçilen rolleri uygulama veya işlemi iptal etme eylemlerini üst bileşene iletir. Mimari açıdan, veri tablosu modülüyle entegre çalışarak toplu güncelleme operasyonlarını merkezi bir noktadan yönetir.

## Fonksiyon Grupları
### Toplu Rol Yönetim Arayüzü
Bileşenin ana sorumluluğu, kullanıcılara seçili satırlar için geçerli rolleri görüntülemek ve değiştirmek üzere etkileşimli bir panel sunmaktır.
- BulkRolePanel

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### BulkRolePanel
**Ne yapar**: Toplu kullanıcı rolü değiştirme işleminde kullanılan bir panel bileşenidir. Kullanıcılara mevcut rol seçeneklerini butonlar halinde sunar ve seçilen rolü üst bileşene bildirerek paneli kapatır.

**Nasıl yapar**: `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t`'yi alır. `ROLE_KEYS` dizisi üzerinde `map` ile her bir rol için bir buton oluşturur. Her buton tıklandığında `onRoleChange` fonksiyonuna ilgili `targetRole` değerini gönderir ve ardından `onClose` fonksiyonunu çağırarak paneli kapatır. Butonların yanında `ROLE_BUTTON_ICON` nesnesinden alınan ikonlar ve `t` fonksiyonu ile çevrilmiş rol adları görüntülenir. Bileşen, yönetici arayüzüne uygun CSS sınıflarıyla (`bg-admin-bg`, `text-admin-fg`, `rounded-admin-md` vb.) stilize edilmiştir.

**Parametreler**:
- `onRoleChange`: `(role: string) => void` — Kullanıcının seçtiği rolün üst bileşene bildirilmesini sağlayan geri çağırma fonksiyonu. `ROLE_KEYS` dizisindeki herhangi bir rol değeri parametre olarak iletilir.
- `onClose`: `() => void` — Rol seçimi tamamlandıktan sonra panelin kapatılmasını sağlayan geri çağırma fonksiyonu.

**Dönüş**: `React.ReactNode` — Yönetici panelindeki toplu rol değiştirme arayüzünü oluşturan JSX yapısı döndürür. Yapı, bir dış sarmalayıcı `div`, başlık metni ve `ROLE_KEYS` dizisindeki her rol için oluşturulmuş butonlardan oluşan bir liste içerir.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Crown
- import: lucide-react::Eye
- import: lucide-react::Package
- import: lucide-react::Shield
- import: lucide-react::Tag
- import: lucide-react::Users
- import: react::React

---

## INTERFACES

### BulkRolePanelProps
- `onRoleChange: (role: UserRoleCode) => void`
- `onClose: () => void`

---

## TYPE ALIASES

### UserRoleCode
TOPLU ROL DEĞİŞTİRME PANELİ `AdminUsersTableBody` içindeki yerel `UserBulkActionToolbar`'dan çıkarıldı: o bileşen `BulkBar` ile MÜKERRERDİ (aynı işi yapan iki yapışkan toplu-işlem çubuğu). Aynı işlemin sayfadan sayfaya farklı görünmesi cetvel §4'ün doğrudan ihlaliydi. Artık tek bileşen (`BulkBar`), 
```typescript
type UserRoleCode = 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'
```

---

## SABİTLER
- **ROLE_BUTTON_ICON** (object) — `{
  super_admin: <Crown size={14} />,
  admin: <Shield size={14} />,
  war...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/BulkRolePanel.tsx::BulkRolePanel
- **params**:
  - `onRoleChange` — `BulkRolePanelProps` tipinden destructured, rol seçildiğinde çağrılan callback fonksiyonu
  - `onClose` — `BulkRolePanelProps` tipinden destructured, rol seçimi sonrası paneli kapatmak için çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructured çeviri fonksiyonu; `t('admin.users.bulk.selectRole')` ile başlık metni, `t(`roles.${targetRole}`)` ile her rolün görünen adı çevrilir
  - `targetRole` — `ROLE_KEYS.map()` callback parametresi; her yinelemede mevcut roller dizisinden bir rol anahtarını temsil eder
  - `ROLE_KEYS` — modül seviyesinde tanımlı sabit (gövdede doğrudan referans yok, ancak `.map()` çağrısında kullanılır); tüm rol anahtarlarını içeren dizi
  - `ROLE_BUTTON_ICON` — modül seviyesinde tanımlı sabit; `ROLE_BUTTON_ICON[targetRole]` ile her role karşılık gelen ikon bileşenine erişilir (lucide-react ikonları: Crown, Eye, Package, Shield, Tag, Users)
- **Dönüş**: `React.ReactNode` — yönetici paneli arka planı, kenarlığı ve gölgesiyle stilize edilmiş bir dış `div`; içinde başlık metni ve `ROLE_KEYS` dizisi üzerinden `.map()` ile üretilmiş buton listesi döndürülür. Her butonun `onClick` handler'ı `onRoleChange(targetRole)` ve `onClose()` sırasıyla çağırır.

---

## NODE ID STANDARD

  file: src\components\admin\data-table\BulkRolePanel.tsx
  function: src\components\admin\data-table\BulkRolePanel.tsx::BulkRolePanel

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkRolePanel
  export: BulkRolePanelProps
  export: UserRoleCode

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-bg`, `bg-admin-surface`, `border-admin-border`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-left`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `items-center`, `min-w-240px`, `p-4`, `shadow-admin-lg`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-semibold`, `mb-3`, `px-3`, `py-2.5`, `rounded-admin-md`, `shrink-0`, `transition-colors`