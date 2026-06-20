---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\PageShell.tsx
skeleton_hash: a57a4d0cf068f731
entity_hashes:
  overview: 09c986d2dcf8a577
  style_tokens: f9c95184ddfe4989
generated_at: 2026-06-19T20:47:09Z
---

## Genel Bakış
Bu modül, uygulama sayfalarının düzenini tutarlı ve modüler bir şekilde yöneten bir React düzen kabuğu (`PageShell`) bileşeni sağlar. Bileşen, `forwardRef` kullanılarak oluşturularak, içeriğe önceden tanımlanmış genişlik ve boşluk stillerini uygulayan bir `<section>` elemanı render eder. Modül, ortam değişkenlerine veya harici API'lere/veritabanı tablolarına doğrudan erişim yapmaz; yalnızca prop'lar aracılığıyla gelen stillere ve içeriğe odaklanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, saf bir sunum katmanı bileşeni olup, harici servisler veya durum yönetimi ile etkileşime girmez. Varsayımlar, prop-to-style eşleme tutarlılığına odaklanır.

[Aksiyom 1]: Eğer `widthStyles` nesnesi, `width` prop'unun tüm olası değerleri (`'contained'`, `'wide'`, `'full'`) için eşleme içermiyorsa, ilgili genişlik stili uygulanmaz ve bileşen varsayılan/stilless bir `<section>` olarak render edilir.

[Aksiyom 2]: Eğer `spacingStyles` nesnesi, `spacing` prop'unun tüm olası değerleri (`'none'`, `'sm'`, `'md'`, `'lg'`) için eşleme içermiyorsa, ilgili boşluk stili uygulanmaz ve bileşen varsayılan/stilless bir `<section>` olarak render edilir.

[Aksiyom 3]: Eğer `children` prop'u sağlanmıyorsa, bileşen geçerli ancak içeriği boş bir `<section>` elemanı render eder; hata fırlatmaz.

[Aksiyom 4]: Eğer `width` veya `spacing` prop'u `undefined` olarak bırakılıyorsa (opsiyonel oldukları için), bileşen ilgili stil maping'ine başvurmaz ve yalnızca varsayılan (sıfır) genişlik/boşluk stiliyle render edilir.

[Aksiyom 5]: Eğer `forwardRef` ile iletilen `ref`, bir DOM düğümüne (`<section>`) yönlendirilmiyorsa (örn. string ref veya callback ref yanlış kullanılıyorsa), React uyarı fırlatır ancak bileşen yine de render edilir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: react::React
- import: react::forwardRef

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