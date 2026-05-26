---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavShell.tsx
skeleton_hash: 59c4f8aaf19879e8
generated_at: 2026-05-23T22:17:17Z
---

## Genel Bakış
NavShell, uygulamanın üst navigasyon çubuğunu ve isteğe bağlı ilerleme göstergesini sunan bir React bileşenidir. Sabit konumlandırma, ilerleme çubuğu görünürlüğü ve kaydırma durumu takibi gibi yapılandırılabilir seçenekler sunar.

## Fonksiyon Grupları
### Ana Bileşen
NavShell bileşeni, dışarıdan gelen özelliklere göre düzeni ve görünümlü öğeleri oluşturur.
- NavShell

---

## AXIOMS – Mimari Varsayımlar
[Bu modül için özel aksiyom tanımlanmamıştır.]

[Aksiyom 1]: Eğer `fixed` prop'ı verilmezse, component sabit konumlandırılmaz (varsayılan `false` değerine sahiptir).  
[Aksiyom 2]: Eğer `showProgress` prop'ı verilmezse, ilerleme çubuğu gösterilmez (varsayılan `false` değerine sahiptir).  
[Aksiyom 3]: Eğer `progress` prop'ı verilmezse, ilerleme değeri sıfırdan başlar (varsayılan `0` değerine sahiptir).  
[Aksiyom 4]: Eğer `isScrol` prop'ı verilmezse, bu prop'ın etkisi belirtilmemiş olur; dolayısıyla component'in scroll davranışı bu eksiksiz tanımlanmamış bir koşula bağlıdır. (Not: Fonksiyon imzasında bu parametre için varsayılan değer bulunmadığı için, eksik olduğunda sonuçların ne olacağını imzadan çıkaramayız.)

---

## FONKSIYON DETAYLARI

### NavShell
**Ne yapar**: NavShell, uygulama içinde sabit veya kaydırılabilir bir navigasyon çubuğu ve isteğe bağlı ilerleme göstergesi sunan bir React bileşenidir.  
**Nasıl yapar**: Prop olarak alınan `fixed` değeri true olduğunda konumu sabitleyerek, `showProgress` true olduğunda `progress` değerine göre bir ilerleme çubuğu render eder; `isScrol` değeriyle kaydırma durumu bilgisini alır ve gerektiğinde stil veya sınıf değişikliği yapar.  
**Parametreler**:
- fixed: boolean — Bileşenin sayfa içinde sabit konumda kalıp kalmayacağını belirler; true ise position: fixed uygulanır.  
- showProgress: boolean — İlerleme göstergesinin görünüp görünmeyeceğini kontrol eder; true ise progress değeri kullanılarak bir çubuk gösterilir.  
- progress: number — 0 ile 100 arasında bir değer olarak ilerleme yüzdesini temsil eder; showProgress true olduğunda bu değere göre genişlik ayarlanır.  
- isScrol: boolean — Kaydırma durumu bilgisini taşır; true olduğunda sayfa kaydırıldığı anlamına gelir ve bu bilgi stil veya animasyon tetikleyicide kullanılabilir.  
**Dönüş**: React.FC<NavShellProps> — NavShellProps tipindeki props alarak JSX elementi döndüren bir fonksiyonel React bileşeni.

---

## INTERFACES

### NavShellProps
- `fixed?: boolean`
- `showProgress?: boolean`
- `progress?: number`
- `isScrollingDown?: boolean`
- `isAtTop?: boolean`
- `isAnyOverlayOpen?: boolean`
- `topTierChildren?: React.ReactNode`
- `bottomTierChildren: React.ReactNode`
- `onHoverStart?: () => void`
- `onHoverEnd?: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavShell.tsx::NavShell
- **params**: (fixed, showProgress, progress, isScrollingDown, isAtTop, isAnyOverlayOpen, topTierChildren, bottomTierChildren, onHoverStart, onHoverEnd)
- **ic_degiskenler**:
  - `fixed` — determines whether the nav shell is fixed positioned at top or relative
  - `showProgress` — boolean flag to display the progress bar
  - `progress` — numeric percentage (0‑100) indicating the width of the progress bar
  - `isScrollingDown` — indicates if the user is currently scrolling down
  - `isAtTop` — indicates if the scroll position is at the top of the page
  - `isAnyOverlayOpen` — indicates whether any overlay (mega menu, search, etc.) is open
  - `topTierChildren` — React nodes rendered in the top tier (corporate bar)
  - `bottomTierChildren` — React nodes rendered in the bottom tier (action bar)
  - `onHoverStart` — callback invoked when mouse enters the nav shell
  - `onHoverEnd` — callback invoked when mouse leaves the nav shell
- **Dönüş**: React.FC<NavShellProps> (JSX element)

---

## NODE ID STANDARD

  file: src\components\navigation\NavShell.tsx
  function: src\components\navigation\NavShell.tsx::NavShell

---

## DISA AKTARILANLAR (EXPORTS)
  export: NavShell

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[0_18px_45px_-28px_rgba(15,23,42,0.15)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `duration-[600ms]`, `ease-[cubic-bezier(0.16,1,0.3,1)]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-gradient-to-r`, `bg-primary-navy`, `bg-slate-200/60`, `bg-white/95`, `border-b`, `border-slate-200/50`, `from-primary-navy`, `text-white`, `to-air-blue`, `via-secondary-blue`
- **Layout:** `absolute`, `backdrop-blur-xl`, `fixed`, `flex`, `from-primary-navy`, `gap-3`, `h-0`, `h-1`, `h-16`, `h-full`, `items-center`, `justify-between`, `max-w-7xl`, `md:h-8`, `overflow-hidden`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
