---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AccessDenied.tsx
skeleton_hash: d0926a9df2156265
generated_at: 2026-05-23T21:51:05Z
---

## Genel Bakış
AccessDenied bileşeni, yönetim panelinde yetkisiz erişim durumunda kullanıcıya erişim reddedildiğini bildiren bir React fonksiyonel bileşenidir. Tek sorumluluğu, kullanıcıyı bilgilendirmek ve ana sayfaya yönlendirme imkânı sunmaktır. Bağımsız bir bileşen olduğu için prop almaz ve iç durum kullanmaz.

## Fonksiyon Grupları
### UI Sunumu
Bu grup, erişim reddi mesajını ve yönlendirme butonunu render ederek kullanıcı arayüzünü oluşturur.
- AccessDenied

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### AccessDenied
**Ne yapar**: Kullanıcı yetkisiz bir sayfaya erişmeye çalıştığında "Erişim Reddedildi" mesajı gösteren bir React arayüz bileşenidir.
**Nasıl yapar**: `React.FC` olarak tanımlanmış bir fonksiyonel bileşendir; herhangi bir prop veya state içermez. Bileşen, sayfa içinde kullanıcıya erişim izni olmadığını bildiren bir uyarı mesajı veya yönlendirme bağlantısı içeren bir görünüm döndürür.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `React.FC` — Uygulamanın erişim reddedildi durumunu temsil eden bir React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AccessDenied.tsx::AccessDenied
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `t` — translation function from useI18n hook, used to translate UI strings such as 'admin.ui.backToDashboard'
- **Dönüş**: JSX.Element (React component returning JSX)

---

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
- **shadow:** `shadow-[0_0_30px_rgba(244,63,94,0.1)]`, `shadow-[0_0_50px_rgba(0,0,0,0.4)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `tracking-[0.3em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-rose-500/10`, `bg-surface-deep`, `bg-white/5`, `border-rose-500/20`, `border-white/5`, `text-3xl`, `text-center`, `text-rose-500`, `text-slate-400`, `text-slate-600`, `text-slate-700`, `text-white`, `text-xs`
- **Layout:** `block`, `flex`, `flex-col`, `gap-3`, `gap-4`, `group-hover:-translate-x-1`, `h-12`, `h-24`, `inline-flex`, `items-center`, `justify-center`, `max-w-lg`, `min-h-screen`, `p-12`, `p-6`
- **Responsive:** (yok)
