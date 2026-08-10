---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavShell.tsx
skeleton_hash: 0c60bc38ac4baa40
entity_hashes:
  func:NavShell: 6b1b48f5c901dde6
  overview: 5c6cc2484e8ea784
  style_tokens: fe546e0bed477a10
generated_at: 2026-06-19T20:47:10Z
---

## Genel Bakış
NavShell, uygulamanın üst navigasyon alanını ve opsiyonel bir ilerleme çubuğunu sunan bir React bileşenidir. Bileşen, sabit bir konumlandırma, ilerleme göstergesi gösterimi ve kaydırma durumu takibi gibi dinamik davranışları yapılandırmaya olanak tanır.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, uygulama navigasyonunu oluşturan tek bileşeni kapsar. Temel amacı, dışarıdan giden yapılandırma seçeneklerine göre sayfanın üst kısmındaki navigasyon çubuğunu ve gerekirse bir ilerleme göstergesini oluşturmaktır.
- NavShell

---

## AXIOMS – Mimari Varsayımlar

NavShell, dışarıdan yapılandırılan parametrelerle çalışan bir navigasyon kabuk bileşenidir.

**[Aksiyom 1]**: Eğer `progress` değeri verilmişse, bu değer sayısal bir değer olmalıdır (default: `0`). Eğer sayısal değilse, bileşen beklenmeyen davranış gösterebilir veya render hatası oluşur.

**[Aksiyom 2]**: Eğer `showProgress = false` ise, `progress` parametresinin değeri anlamsızdır; ilerleme göstergesi render edilmez. İlerleme çubuğunun görünür olması için `showProgress` açıkça `true` olarak ayarlanmalıdır.

**[Aksiyom 3]**: Eğer `fixed = true` ise, navigasyon bileşeni sayfada sabit konumlandırılır (position: fixed). `fixed = false` olduğunda ise bileşen akışa (flow) göre konumlanır.

**[Aksiyom 4]**: Fonksiyon imzası kesik (`isScrol...` olarak sonlanıyor), bu nedenle ilgili parametrenin tam adı ve default değeri bilinmemektedir. Tam imza olmadan bu parametre için aksiyom üretilemez.

**[Aksiyom 5]**: Eğer `progress` değeri `showProgress = true` iken negatif veya 100'den büyük bir sayı olarak verilmişse, bileşenin bu değeri nasıl işlediği fonksiyon gövdesinde tanımlı değildir — geçerli aralık (örn. 0-100) belirsizdir.

---

## FONKSİYON DETAYLARI

### NavShell

**Ne yapar**: Navigasyon bileşeni için dış kabuk (shell) sarmalayıcı görevi gören bir React bileşenidir. Sayfanın üst kısmında yer alan navigasyon alanının yerleşimini, sabit konumlandırılmasını ve isteğe bağlı ilerleme çubuğunu yönetir.

**Nasıl yapar**: Fonksiyon, parametreler aracılığıyla navigasyon çubuğunun davranışını yapılandırır. `fixed` parametresi ile navigasyonun sayfa kaydırma sırasında sabit kalıp kalmayacağını belirler. `showProgress` ve `progress` parametreleri birlikte çalışarak, sayfa yükleme veya içerik ilerleme durumunu gösteren bir ilerleme çubuğunun görüntülenmesini kontrol eder.

**Parametreler**:
- fixed: `boolean` (varsayılan: `false`) — Navigasyon bileşeninin sayfada sabit (sticky/fixed) konumda mı yoksa akışkan (flow) düzeninde mi yer alacağını belirler
- showProgress: `boolean` (varsayılan: `false`) — Navigasyon çubuğunda ilerleme çubuğunun (progress bar) gösterilip gösterilmeyeceğini kontrol eder
- progress: `number` (varsayılan: `0`) — İlerleme çubuğunun gösterilme durumunda doluluk oranını yüzdesel olarak belirtir (0-100 arası değer)
- isScrol: Parametre listesi kaynak kodda kesilmiş durumdadır, tam değeri doğrulanamamıştır

**Dönüş**: `React.FC<NavShellProps>` tipinde bir fonksiyonel React bileşeni döndürür. `NavShellProps` arayüzü, bileşenin kabul ettiği tüm prop tanımlamalarını içerir.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/utils::cn
- import: react::React

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

### [N1_NASIL] AST Pointer: navigation/NavShell.tsx::NavShell
- **params**: (`fixed`, `showProgress`, `progress`, `isScrollingDown`, `isAtTop`, `isAnyOverlayOpen`, `topTierChildren`, `bottomTierChildren`, `onHoverStart`, `onHoverEnd`)
- **ic_degiskenler**:
  - `fixed` — Boolean, navigasyon barının sabit (fixed) veya relative konumda olacağını belirler.
  - `showProgress` — Boolean, üstte bir ilerleme çubuğu gösterilip gösterilmeyeceğini belirler.
  - `progress` — Sayı, ilerleme çubuğunun yüzde (0-100) değerini tutar.
  - `isScrollingDown` — Boolean, kullanıcının aşağı doğru kaydırma yapıp yapmadığını belirler, kaydırma aşağıdaysa navigasyonu yukarı kaydırarak gizler.
  - `isAtTop` — Boolean, sayfanın en üstünde olunup olunmadığını belirler, en üstteyken üst katmanı gösterir.
  - `isAnyOverlayOpen` — Boolean, bir mega menü veya arama gibi üst üste binen bir açılır pencerenin açık olup olmadığını belirler, açıkken üst katmana karartma ekler.
  - `topTierChildren` — ReactNode, üst katmanın (kurumsal çubuk) içeriğini tutar.
  - `bottomTierChildren` — ReactNode, alt katmanın (aksiyon çubuğu/header) içeriğini tutar.
  - `onHoverStart` — Fonksiyon, fareyle üzerine gelindiğinde çalışacak olay işleyicisi.
  - `onHoverEnd` — Fonksiyon, fareyle üzerine gelmeyi bıraktığında çalışacak olay işleyicisi.
- **Dönüş**: JSX (React bileşeni), navigasyon barını iki katmanlı olarak döndürür. Üst katman (kurumsal çubuk) ve alt katman (aksiyon barı) içerir. `showProgress` propu true ise üstte bir ilerleme çubuğu, `isAnyOverlayOpen` true ise üst katmana karartma ekler. `isScrollingDown` ve `isAtTop` proplarına göre navigasyon barı yukarı kaydırılarak gizlenir veya gösterilir. `fixed` propu ile sabit veya relative konumlandırma ayarlanır.

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
- **diğer:** (yok)

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-gradient-to-r`, `bg-primary-navy`, `bg-slate-200/60`, `bg-white/95`, `border-b`, `border-slate-200/50`, `from-primary-navy`, `supports-[backdrop-filter]:bg-white/85`, `text-white`, `to-air-blue`, `via-secondary-blue`
- **Layout:** `absolute`, `backdrop-blur-xl`, `fixed`, `flex`, `from-primary-navy`, `gap-3`, `h-0`, `h-1`, `h-16`, `h-full`, `items-center`, `justify-between`, `max-w-7xl`, `md:h-8`, `overflow-hidden`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:`, `supports-[backdrop-filter]:` önekleri
- **Yardımcı Sınıflar:** `-translate-y-full`, `duration-500`, `duration-hvac-slow`, `ease-hvac-ease`, `ease-out`, `inset-0`, `inset-x-0`, `lg:px-8`, `md:opacity-100`, `mx-auto`, `opacity-0`, `opacity-100`, `pointer-events-none`, `pt-1`, `px-4`