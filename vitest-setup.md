---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\vitest-setup.tsx
skeleton_hash: f1130d6c28363baf
entity_hashes:
  overview: ac4b8a364cf9e637
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:51:04Z
---

## Genel Bakış
Bu modül, Vitest test çerçevenin React ve TypeScript ortamı için küresel yapılandırma dosyasıdır. Testing Library ve jest-dom eklentilerini içe aktararak testlerde kullanılacak ek eşleşmeleri ve yardımcı araçları sağlar. Ayrıca testlerde kullanılacak standart bir icon isimleri dizisi tanımlar.

## Fonksiyon Grupları
Bu dosyada tanımlı fonksiyon bulunmamaktadır; yalnızca modül düzeyinde yapılandırma ve değişken tanımlamaları içerir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Modül yalnızca `iconNames` adlı bir dizi sabiti içermektedir. Fonksiyon imzası,工作levsel kod veya koşul içermemektedir; dolayısıyla mimari varsayımlar belirlenememiştir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: @testing-library/jest-dom
- import: react::React
- import: vitest::vi

---

## SABİTLER
- **iconNames** (array) — `[
  'Star', 'ChevronRight', 'ArrowLeft', 'ShoppingCart', 'Heart', 'Share2', ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: vitest-setup.tsx::MockIcon工厂箭头函数
- **params**: `name` — ikon adı string olarak gelir
- **ic_degiskenler**:
  - `MockIcon` — Lucide ikonu için mock React bileşeni; `<div>` elementi oluşturur ve `data-testid` attribute'una `lucide-${name.toLowerCase()}` değerini atar
- **Dönüş**: yok; yan etki olarak `mockIcons[name]` alanına `MockIcon` ataması yapar

### [N2_NASIL] AST Pointer: vitest-setup.tsx::lucideImportMock
- **params**: yok
- **ic_degiskenler**:
  - `actual` — `vi.importActual('lucide-react')` çağrısıyla elde edilen gerçek lucide-react modül içeriği, `Record<string, unknown>` olarak cast edilmiş
- **Dönüş**: `{ ...actual, ...mockIcons }` — gerçek modül ile mock ikonların birleştirilmiş hali

### [N3_NASIL] AST Pointer: vitest-setup.tsx::framerMotionMockSetup
- **params**: yok
- **ic_degiskenler**:
  - `MockMotionValue` — MotionValue sınıfının mock karşılığı; val alanını tutar, get/set/onChange/clearListeners metodları sağlar
  - `useMotionValue` — `useMotionValue` hook'unun mock'u; verilen `init` değeriyle `MockMotionValue` örneği döner
  - `useTransform` — `useTransform` hook'unun mock'u; input/output range alır, `outputRange[0] ?? 0` değeriyle `MockMotionValue` döner
  - `useInView` — `useInView` hook'unun mock'u; `[null, false]` tuple'ı döner
  - `useSpring` — `useSpring` hook'unun mock'u; number veya MockMotionValue alır, sayısal değerle `MockMotionValue` döner
  - `filterMotionProps` — framer-motion'a ait prop'ları DOM'dan ayıran yardımcı fonksiyon
  - `MockDiv` — `motion.div` mock'u; `React.forwardRef` ile `filterMotionProps` kullanarak temizlenmiş div döner
  - `MockButton` — `motion.button` mock'u; `React.forwardRef` ile `filterMotionProps` kullanarak temizlenmiş button döner
  - `MockH2` — `motion.h2` mock'u; `filterMotionProps` kullanarak temizlenmiş h2 döner
  - `MockP` — `motion.p` mock'u; `filterMotionProps` kullanarak temizlenmiş p döner
  - `MockSpan` — `motion.span` mock'u; `filterMotionProps` kullanarak temizlenmiş span döner
  - `MockSection` — `motion.section` mock'u; `filterMotionProps` kullanarak temizlenmiş section döner
  - `MockNav` — `motion.nav` mock'u; `filterMotionProps` kullanarak temizlenmiş nav döner
  - `MockAnimatePresence` — `AnimatePresence` mock'u; children'ı doğrudan fragment içine sarar
- **Dönüş**: `{ motion: { div, button, h2, p, span, section, nav }, AnimatePresence, useMotionValue, useTransform, useSpring, useInView }` — framer-motion modülünün tam mock karşılığı

### [N4_NASIL] AST Pointer: vitest-setup.tsx::MockMotionValue.constructor
- **params**: `init` — number, başlangıç değeri
- **ic_degiskenler**: yok
- **Dönüş**: yok; yan etki olarak `this.val` alanını `init` değerine set eder

### [N5_NASIL] AST Pointer: vitest-setup.tsx::MockMotionValue.get
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `this.val` — mevcut sayısal değer

### [N6_NASIL] AST Pointer: vitest-setup.tsx::MockMotionValue.set
- **params**: `v` — number, atanacak yeni değer
- **ic_degiskenler**: yok
- **Dönüş**: yok; yan etki olarak `this.val` alanını `v` değerine set eder

### [N7_NASIL] AST Pointer: vitest-setup.tsx::MockMotionValue.onChange
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: boş ok fonksiyonu `() => {}` — noop callback, hiçbir şey yapmaz

### [N8_NASIL] AST Pointer: vitest-setup.tsx::useTransform
- **params**: `value` — MockMotionValue, izlenecek kaynak değer; `inputRange` — number[], girdi aralığı; `outputRange` — number[], çıktı aralığı
- **ic_degiskenler**: yok
- **Dönüş**: `new MockMotionValue(outputRange[0] ?? 0)` — outputRange'in ilk elemanını tutan yeni MockMotionValue

### [N9_NASIL] AST Pointer: vitest-setup.tsx::useSpring
- **params**: `value` — MockMotionValue veya number, yay efekti için kaynak değer
- **ic_degiskenler**:
  - `val` — `value` number ise doğrudan `value`, MockMotionValue ise `value.get()` çağrısıyla elde edilen sayısal değer
- **Dönüş**: `new MockMotionValue(val)` — val değerini tutan yeni MockMotionValue

### [N10_NASIL] AST Pointer: vitest-setup.tsx::filterMotionProps
- **params**: `props` — Record<string, unknown>, filtrelenecek React prop'ları
- **ic_degiskenler**:
  - `cleanProps` — Record<string, unknown>, motion-specific olmayan prop'ların kopyalanacağı temiz obje
  - `motionKeys` — Set<string>, framer-motion'a ait prop isimlerini içeren küme (animate, transition, variants, initial, exit, whileHover, whileTap, whileInView, viewport, layout, drag, dragConstraints, dragElastic, dragMomentum, onAnimationComplete, onUpdate)
  - `styleObj` — props.style'ın Record<string, unknown> olarak cast edilmiş hali; varsa işlenir
  - `style` — Record<string, unknown>, temizlenmiş style objesi; MotionValue instance'ları `.get()` ile çözümlenir
  - `animateObj` — props.animate'ın Record<string, unknown> olarak cast edilmiş hali; varsa `y` değeri `transform: translateY(...)` string'ine dönüştürülür
- **Dönüş**: `cleanProps` — motion prop'larından arındırılmış React prop'ları

### [N11_NASIL] AST Pointer: vitest-setup.tsx::filterMotionProps.forEach_keyCallback
- **params**: `key` — string, props üzerinde iterasyon yapılan mevcut anahtar
- **ic_degiskenler**: yok
- **Dönüş**: yok; yan etki olarak `motionKeys` kümesinde bulunmayan key'leri `cleanProps` objesine kopyalar

### [N12_NASIL] AST Pointer: vitest-setup.tsx::filterMotionProps.styleObj_kCallback
- **params**: `k` — string, styleObj üzerinde iterasyon yapılan mevcut anahtar
- **ic_degiskenler**:
  - `val` — unknown, `styleObj[k]` değerinin kopyası; MotionValue instance'ı olup olmadığı `.get` özelliği ve çağrılabilirliği ile kontrol edilir
- **Dönüş**: yok; yan etki olarak `style` objesine değer atar; MotionValue ise `.get()` ile çözümlenmiş hali, değilse doğrudan değer atanır

### [N13_NASIL] AST Pointer: vitest-setup.tsx::MockDiv.forwardRefCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, div'e iletilecek prop'lar; `ref` — React ref, div elementine bağlanacak referans
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React div prop'ları
- **Dönüş**: JSX — `<div {...cleanProps} ref={ref}>{children}</div>`

### [N14_NASIL] AST Pointer: vitest-setup.tsx::MockButton.forwardRefCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, button'a iletilecek prop'lar; `ref` — React ref, button elementine bağlanacak referans
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React button prop'ları
- **Dönüş**: JSX — `<button {...cleanProps} ref={ref}>{children}</button>`

### [N15_NASIL] AST Pointer: vitest-setup.tsx::MockH2.renderCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, h2'ye iletilecek prop'lar
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React h2 prop'ları
- **Dönüş**: JSX — `<h2 {...cleanProps}>{children}</h2>`

### [N16_NASIL] AST Pointer: vitest-setup.tsx::MockP.renderCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, p elementine iletilecek prop'lar
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React p prop'ları
- **Dönüş**: JSX — `<p {...cleanProps}>{children}</p>`

### [N17_NASIL] AST Pointer: vitest-setup.tsx::MockSpan.renderCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, span elementine iletilecek prop'lar
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React span prop'ları
- **Dönüş**: JSX — `<span {...cleanProps}>{children}</span>`

### [N18_NASIL] AST Pointer: vitest-setup.tsx::MockSection.renderCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, section elementine iletilecek prop'lar
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React section prop'ları
- **Dönüş**: JSX — `<section {...cleanProps}>{children}</section>`

### [N19_NASIL] AST Pointer: vitest-setup.tsx::MockNav.renderCallback
- **params**: `children` — React.ReactNode, iç içe JSX çocukları; `...props` — `Record<string, unknown>`, nav elementine iletilecek prop'lar
- **ic_degiskenler**:
  - `cleanProps` — `filterMotionProps(props)` çağrısıyla elde edilen temizlenmiş React nav prop'ları
- **Dönüş**: JSX — `<nav {...cleanProps}>{children}</nav>`

### [N20_NASIL] AST Pointer: vitest-setup.tsx::supabaseMockSetup
- **params**: yok
- **ic_degiskenler**:
  - `createMockQuery` — `vi.fn()` ile sarılmış bir fonksiyon; her çağrıda zincirleme sorgu builder metodlarını (select, insert, update, delete, eq, order, limit, single, maybeSingle, maybe_single, match, in, or, then) mocklayan `p` objesi oluşturur
- **Dönüş**: `{ supabase: { auth: { getUser, getSession, onAuthStateChange }, from: vi.fn(createMockQuery), rpc: vi.fn() } }` — Supabase istemcisinin mock karşılığı

### [N21_NASIL] AST Pointer: vitest-setup.tsx::createMockQuery_body
- **params**: yok
- **ic_degiskenler**:
  - `p` — Record<string, ReturnType<typeof vi.fn>>, query builder zincirinin tüm metodlarını (select, insert, update, delete, eq, order, limit, single, maybeSingle, maybe_single, match, in, or, then) `vi.fn()` ile mocklayan ve her metodun kendi referansını döndüren zincirleme obje; `then` metodu `mockImplementation` ile `cb({ data: [], error: null })` çağrısı yapar
- **Dönüş**: `p` — tamamlanmış mock query builder objesi

---

## NODE ID STANDARD

  file: vitest-setup.tsx

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
- **Yardımcı Sınıflar:** (yok)