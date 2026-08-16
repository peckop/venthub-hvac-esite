---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\data-table\BulkRolePanel.tsx
skeleton_hash: 04ee874694770959
entity_hashes:
  func:BulkRolePanel: f7696c1db3be77ff
  overview: 372bee1e944a5f3b
  style_tokens: edbcc92fba425fac
generated_at: 2026-08-15T16:41:47Z
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
**Ne yapar**: Bu fonksiyon, toplu kullanıcı rolü değiştirme işlemini başlatmak için kullanıcının seçebileceği bir rol listesini içeren bir panel bileşenini (React component) döndürür. Amacı, yöneticinin bir veya birden fazla kullanıcıya aynı anda yeni bir rol atamasını kolaylaştıran bir arayüz sağlamaktır.

**Nasıl yapar**: Fonksiyon, `useI18n` hook'unu kullanarak çoklu dil desteğini (`t` fonksiyonu) sağlar. `ROLE_KEYS` adlı bir dizide tanımlı tüm mevcut rol anahtarlarını (`targetRole`) döngüyle (`.map`) işler. Her bir rol için, üzerine tıklandığında tetiklenecek bir buton oluşturur. Butona tıklandığında, önce üst bileşenden gelen `onRoleChange` callback fonksiyonunu seçilen rol ile çağırarak değişikliği bildirir, ardından `onClose` callback fonksiyonunu çağırarak panelin kendisini kapatmasını tetikler. Butonun içeriği, ilgili rol için tanımlanmış bir ikonu (`ROLE_BUTTON_ICON`) ve çevirisi yapılmış rol adını gösterir. Tüm arayüz, `glass-strong` ve `rounded-xl` gibi modern CSS sınıfları ile stilize edilmiştir.

**Parametreler**:
- onRoleChange: `(role: string) => void` — Kullanıcı listeden bir rol seçtiğinde çağrılan geri çağırma fonksiyonu. Parametre olarak seçilen rol anahtarını (string) alır.
- onClose: `() => void` — Panelin kapatılması gerektiğinde çağrılan geri çağırma fonksiyonu. Parametre almaz.

**Dönüş**: `React.ReactNode` — Bileşenin render ettiği JSX yapısını (seçim paneli) döndürür.

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
  wareho...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/BulkRolePanel.tsx::BulkRolePanel
- **params**: ({ onRoleChange, onClose })
- **ic_degiskenler**: 
  `t` — useI18n() hook'undan dönen çeviri fonksiyonu, farklı dillere göre metinleri getirir
- **Dönüş**: React.ReactNode (JSX döndürür, bir rol seçim menüsü bileşeni)

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
- **Renkler:** `bg-surface-deep`, `border-white/10`, `hover:bg-white/5`, `hover:text-white`, `text-cyan-400`, `text-left`, `text-slate-200`, `text-slate-300`, `text-slate-400`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `items-center`, `min-w-240px`, `p-4`, `shadow-2xl`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-black`, `font-bold`, `glass-strong`, `mb-3`, `px-3`, `py-2.5`, `rounded-xl`, `shrink-0`, `tracking-widest`, `transition-colors`, `uppercase`