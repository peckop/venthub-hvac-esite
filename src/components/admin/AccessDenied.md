---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AccessDenied.tsx
skeleton_hash: d0926a9df2156265
entity_hashes:
  func:AccessDenied: ea91e56a2eab80b9
  overview: 0772c5e63ff4e542
  style_tokens: 07b65f88bee816f7
generated_at: 2026-05-28T22:35:22Z
---

## Genel Bakış
AccessDenied bileşeni, yönetim panelinde yetkisiz erişim durumunda kullanıcıya bilgilendirme amaçlı bir hata sayfası sunan bağımsız bir React bileşenidir. Tek bir amacı vardır: kullanıcıya erişim izni olmadığını bildirmek ve ana sayfaya yönlendirme yapma seçeneği sunmak.

## Fonksiyon Grupları
### Arayüz Sunumu
Kullanıcıya erişim reddedildiğini belirten mesajı ve yönlendirme butonunu render ederek tek sayfalık hata arayüzünü oluşturur.
- AccessDenied

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametre almayan ve modül sabitleri içermeyen basit bir React UI bileşenidir.

[Aksiyom 1]: Eğer bileşen React Router veya benzeri bir yönlendirme altyapısı olmayan bir ortamda çalıştırılırsa, ana sayfaya yönlendirme butonu işlevsiz kalır.

[Aksiyom 2]: Eğer bileşen bir React bağlamı (context) dışın render edilirse, React bileşenLifecycle'ı düzgün çalışmayacağından hata oluşur.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AccessDenied.tsx::AccessDenied
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan destructured çeviri fonksiyonu; `t('admin.ui.backToDashboard')` çağrılarak Türkçe metin elde edilir
- **Dönüş**: JSX — Erişim engellendi sayfasını render eden React bileşeni; `ShieldAlert` ikonu, başlık, açıklama metni ve admin dashboard'a yönlendiren Link içerir
- **Hook Kullanımları**:
  - `useI18n()` — dil çeviri sistemi bağlamını sağlar, `{ t }` destructured olarak alınır
- **Sabit/Sabit Yapı Erişimleri**:
  - `Routes.admin.dashboard()` — admin dashboard rotasının URL'ini döndürür, Link bileşeninin `href` prop'unda kullanılır

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