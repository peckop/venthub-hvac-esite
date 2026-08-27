---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\AccessDenied.tsx
skeleton_hash: b063e7c398f65e05
entity_hashes:
  func:AccessDenied: ea91e56a2eab80b9
  overview: c138e2727c8c240f
  style_tokens: 22fa330fa7bd104d
generated_at: 2026-08-27T07:58:38Z
---

## Genel Bakış
AccessDenied, yönetim panelinde yetkisiz erişim durumunda kullanıcıya bilgilendirme amaçlı bir hata sayfası sunan basit bir React bileşenidir. Tek bir amacı vardır: kullanıcıya erişim izni olmadığını bildirmek ve ana sayfaya yönlendirme seçeneği sunmak.

## Fonksiyon Grupları
### Arayüz Sunumu
Erişim reddedildiğinde kullanıcıya bilgilendirici bir mesaj ve yönlendirme butonu göstererek tek sayfalık hata arayüzünü oluşturur.
- AccessDenied

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon imzası `AccessDenied()` şeklinde olup parametresiz ve basit bir sunum (presentational) bileşenidir. Fonksiyon gövdesinde (JSX kodu) erişilemediğinden, hangi bağımlılıkların (routing, authentication context vb.) kullanıldığı doğrulanamamaktadır. Bu nedenle spekülatif varsayımlarda bulunulmamıştır.

---

## FONKSİYON DETAYLARI

### AccessDenied

**Ne yapar**: Erişim izni olmayan kullanıcılar için hata sayfası/gösterim bileşenidir. Kullanıcının yetkisi olmayan bir admin alanına erişmeye çalıştığında visuals olarak bir hata mesajı sunar.

**Nasıl yapar**: Bu bir React functional component olup, erişim reddedildiğinde kullanıcıya bilgilendirici bir arayüz gösterir. Genellikle role-based erişim kontrolü sonrası yetkisiz erşim durumlarında render edilir. Bileşen, kullanıcıya durumu açıklayan bir mesaj ve olası eylem yönlendirmeleri (anasayfaya dönüş, giriş sayfası vb.) sunar.

**Parametreler**:
- Bu bileşen herhangi bir parametre almaz

**Dönüş**: `React.FC` — Erişim reddedildiğinde gösterilecek hata bileşenini döndürür. Bileşen, kullanıcıya yetkisiz erişim durumunu bildiren arayüz elemanlarını içeren JSX yapısıdır.

**Kullanım Bağlamı**: `C:\Users\alize\venthub-hvac\src\components\admin\AccessDenied` yolunda yer alan bu bileşen, admin panelinde yetkilendirme kontrolü başarısız olduğunda kullanıcıya yönlendirilir. HVAC-VentHub projesinin admin modülünde erişim kontrol mekanizmasının bir parçasıdır.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
- import: lucide-react::ArrowLeft
- import: lucide-react::ShieldAlert
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AccessDenied.tsx::AccessDenied
- **params**: (yok — arrow function, parametre almıyor)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan döndürülen çeviri fonksiyonu; `t('admin.ui.backToDashboard')` şeklinde kullanılarak lokalize metin döndürür
- **Hook Kullanimi**:
  - `useI18n()` — i18n context'inden çeviri fonksiyonunu almak için çağrılır, `{ t }` destructuring ile çıkarılır
- **Dönüş**: JSX — `min-h-screen` container içinde glass-effect kart, `ShieldAlert` ikonu, hata mesajı başlığı ve `Link` ile dashboard'a yönlendirme butonu döndüren React functional component

---

## NODE ID STANDARD

  file: src\components\admin\AccessDenied.tsx
  function: src\components\admin\AccessDenied.tsx::AccessDenied

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccessDenied

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-bg`, `bg-admin-danger-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-border`, `border-admin-danger/30`, `hover:bg-admin-surface-3`, `text-3xl`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-fg-subtle`, `text-center`, `text-xs`
- **Layout:** `block`, `flex`, `flex-col`, `gap-3`, `gap-4`, `h-12`, `h-24`, `inline-flex`, `items-center`, `justify-center`, `max-w-lg`, `min-h-screen`, `p-12`, `p-6`, `shadow-access-denied-black`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `border`, `duration-500`, `fade-in`, `font-bold`, `font-medium`, `font-semibold`, `group`, `group-hover:-translate-x-1`, `italic`, `leading-relaxed`, `mb-10`, `mb-4`, `mb-8`, `mt-2`