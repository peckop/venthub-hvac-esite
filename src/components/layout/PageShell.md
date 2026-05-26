---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\PageShell.tsx
skeleton_hash: 7ca98b70fc84e47d
generated_at: 2026-05-23T22:11:14Z
---

## Genel Bakış
Bu modül, uygulama sayfalarının düzenini tutarlı bir şekilde yöneten bir React bileşeni sağlar. `PageShell` adlı `forwardRef` bileşeni, sayfa içeriğine önceden tanımlanmış genişlik ve boşluk stillerini uygulayarak düzenli ve yanıtşabilir bir düzen sunar. Modül, ortam değişkenlerine veya harici API'lere doğrudan erişim yapmaz; yalnızca stil sabitlerini kullanarak görsel düzeni oluşturur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



---

## INTERFACES

### PageShellProps
- `children: React.ReactNode`
- `width?: 'contained' | 'wide' | 'full'`
- `spacing?: 'none' | 'sm' | 'md' | 'lg'`

---

## SABİTLER
- **widthStyles** (object) — `{
    contained: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w...`
- **spacingStyles** (object) — `{
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-8 sm:py-12',
    lg: ...`
- **PageShell** (call) — `forwardRef<HTMLElement, PageShellProps>(({ 
    children, 
    width = 'con...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/PageShell.tsx::PageShell
- **params**: (children, width = 'contained', spacing = 'md', className = '', ...props, ref)
- **ic_degiskenler**:
  - `widthStyles` — object mapping width values to CSS class strings; used to compute class via `widthStyles[width]`
  - `spacingStyles` — object mapping spacing values to CSS class strings; used via `spacingStyles[spacing]`
  - `width` — prop determining layout width; default `'contained'`; used to index `widthStyles`
  - `spacing` — prop determining spacing; default `'md'`; used to index `spacingStyles`
  - `className` — additional className string from consumer; appended to the class attribute
  - `props` — rest of component props spread onto the `<section>` element
  - `children` — React nodes rendered inside the section
  - `ref` — forwardRef reference attached to the `<section>` element
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\layout\PageShell.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Responsive:** (yok)
