---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\PageShell.tsx
skeleton_hash: 7ca98b70fc84e47d
entity_hashes:
  overview: 09c986d2dcf8a577
  style_tokens: f9c95184ddfe4989
generated_at: 2026-05-28T22:36:18Z
---

## Genel Bakış
Bu modül, uygulama sayfalarının düzenini tutarlı ve modüler bir şekilde yöneten bir React düzen kabuğu (`PageShell`) bileşeni sağlar. Bileşen, `forwardRef` kullanılarak oluşturularak, içeriğe önceden tanımlanmış genişlik ve boşluk stillerini uygulayan bir `<section>` elemanı render eder. Modül, ortam değişkenlerine veya harici API'lere/veritabanı tablolarına doğrudan erişim yapmaz; yalnızca prop'lar aracılığıyla gelen stillere ve içeriğe odaklanır.

---



---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: components/layout/PageShell.tsx::PageShell
- **params**: ({ children, width = 'contained', spacing = 'md', className = '', ...props }, ref)
- **ic_degiskenler**: yok
- **Dönüş**: JSX (`<section>` elementi)

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
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `${className`, `${spacingStyles[spacing]`, `${widthStyles[width]`