---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AccessDenied.tsx
skeleton_hash: 4191c98afe89986a
entity_hashes:
  func:AccessDenied: ea91e56a2eab80b9
  overview: c138e2727c8c240f
  style_tokens: 07b65f88bee816f7
generated_at: 2026-06-19T20:46:38Z
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
- `rounded-hvac-2xl`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-rose-500/10`, `bg-surface-deep`, `bg-white/5`, `border-rose-500/20`, `border-white/5`, `hover:bg-white/10`, `text-3xl`, `text-center`, `text-rose-500`, `text-slate-400`, `text-slate-600`, `text-slate-700`, `text-white`, `text-xs`
- **Layout:** `block`, `flex`, `flex-col`, `gap-3`, `gap-4`, `h-12`, `h-24`, `inline-flex`, `items-center`, `justify-center`, `max-w-lg`, `min-h-screen`, `p-12`, `p-6`, `shadow-access-denied-black`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `border`, `duration-500`, `fade-in`, `font-black`, `font-bold`, `font-medium`, `glass-strong`, `group`, `group-hover:-translate-x-1`, `italic`, `leading-relaxed`, `mb-10`, `mb-4`, `mb-8`