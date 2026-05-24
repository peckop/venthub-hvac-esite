---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavActionButton.tsx
skeleton_hash: e5eba658c6a4867c
generated_at: 2026-05-23T22:15:32Z
---

## Genel Bakış
Bu modül, uygulama içinde gezinti işlemlerini tetiklemek için kullanılan yeniden kullanılabilir bir düğme bileşenini tanımlar. İkon, metin, bağlantı ve tıklama işleyici gibi esnek özellikler alarak farklı bağlamlarda tutarlı bir görsel ve davranışsal deneyim sunar.

## Fonksiyon Grupları
### Temel Bileşen
Navigasyon eylemlerini temsil eden ve kullanıcı etkileşimini yöneten ana işlev.
- NavActionButton

---

## AXIOMS – Mimari Varsayımlar
Komponentin beklendiği gibi render edip işlev görebilmesi için gerekli prop'ların ve stil nesnesinin sağlanması gerekir.

- Eğer **icon** prop'u sağlanmazsa, buton içinde görsel simge gösterilemez veya görsel eksikliği oluşur.  
- Eğer **label** prop'u sağlanmazsa, butonun amacı metinsel olarak ifade edilemez ve erişilebilirlik açısından eksiklik entsteht.  
- Eğer **href** ve **onClick** ikisi de sağlanmazsa, buton hiçbir navigasyon veya işlem tetiklemez; etkileşimsiz bir öğe haline gelir.  
- Eğer **ariaLabel** prop'u sağlanmazsa, ekran okuyucular tarafından butonun işlevi anlamlı şekilde açıklanamaz; erişilebilirlik azalır.  
- Eğer **title** prop'u sağlanmazsa, fare ile üzerine gelindiğinde ipucu (tooltip) gösterilmez.  
- Eğer **toneClasses** nesnesi eksik veya bileşenin stilini belirlemek için gerekli sınıfları içermiyorsa, komponentin görsel görünümü beklenen tema stilleriyle uyuşmayabilir.

---

## FONKSIYON DETAYLARI

### NavActionButton
**Ne yapar**: Bir simge, metin ve opsiyonel tıklama veya link özellikleriyle bir navigasyon eylemi butonu oluşturur.  
**Nasıl yapar**: Props olarak alınan `icon`, `label`, `href`, `onClick`, `ariaLabel` ve `title` değerlerini kullanarak bir `<a>` veya `<button>` elementi render eder; `href` tanımlıysa `<a>` ile yönlendirme yapılır, tanımlı değilse `onClick` ile `<button>` kullanılır. Erişilebilirlik için `aria-label` ve `title` öznitelikleri eklenir.  
**Parametreler**:
- icon: React.ReactNode — Buton içinde gösterilecek simge veya SVG elementi  
- label: string — Buton üzerinde görünecek metin  
- href: string \| undefined — Butonun link hedefi; tanımlıysa `<a>` elementiyle yönlendirme yapılır  
- onClick: React.MouseEventHandler<HTMLAnchorElement \| HTMLButtonElement> \| undefined — Tıklama olayını işleyen fonksiyon; `href` tanımlı değilse zorunlu  
- ariaLabel: string \| undefined — Erişilebilirlik için butona verilecek açıklama metni  
- title: string \| undefined — Fare ile üzerine gelindiğinde gösterilecek ipucu metni  
**Dönüş**: React.FC<NavActionButtonProps> — Props'u alan ve ilgili JSX elementi döndüren bir React fonksiyon bileşeni

---

## INTERFACES

### NavActionButtonProps
- `icon: React.ReactNode`
- `label?: React.ReactNode`
- `href?: string`
- `onClick?: () => void`
- `ariaLabel: string`
- `title?: string`
- `badge?: React.ReactNode`
- `tone?: NavActionTone`
- `className?: string`
- `iconClassName?: string`
- `labelClassName?: string`

---

## TYPE ALIASES

### NavActionTone
```typescript
type NavActionTone = 'default' | 'accent' | 'success' | 'warning'
```

---

## SABİTLER
- **toneClasses** (object) — `{
    default: 'text-steel-gray hover:text-primary-navy hover:bg-air-blue/30...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavActionButton.tsx::NavActionButton
- **params**: icon, label, href, onClick, ariaLabel, title, badge, tone, className, iconClassName, labelClassName
- **ic_degiskenler**:
  - `content` — JSX fragment that renders the icon (with optional badge) and label wrapped in spans, applying `iconClassName` and conditionally rendering the label when present.
  - `classes` — string of Tailwind CSS classes produced by `cn` that merges base group styles, compact sizing, tone‑specific lookup from `toneClasses[tone]`, and any extra `className` prop.
- **Dönüş**: JSX.Element (React.FC) — returns a `<Link>` component wrapping `content` when `href` is truthy, otherwise returns a `<button>` with `onClick` handler; both receive `aria-label`, `title`, and the computed `classes`.

---

## NODE ID STANDARD

  file: src\components\navigation\NavActionButton.tsx
  function: src\components\navigation\NavActionButton.tsx::NavActionButton

---

## DISA AKTARILANLAR (EXPORTS)
  export: NavActionButton