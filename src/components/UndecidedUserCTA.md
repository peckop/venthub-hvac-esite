---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\UndecidedUserCTA.tsx
skeleton_hash: 4602fa6ee6d31113
entity_hashes:
  func:UndecidedUserCTA: e9ab9b6769bffef9
  overview: 568957f343e21561
  style_tokens: d1dc68fb1553bbf5
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
Venthub HVAC platformunda henüz kendi yolunu çizememiş kararsız kullanıcıları hedefleyen bir React bileşenidir. Platformdaki olası adımları ve seçenekleri net bir şekilde sunarak kullanıcıları harekete geçmeye yönlendirir.

## Fonksiyon Grupları
### Kararsız Kullanıcı Yönlendirme Bileşeni
Platforma henüz tam olarak entegre olamamış veya hangi adımı atacağına karar verememiş kullanıcılar için eyleme çağrı (CTA) içeriğini ekrana render eder. Tek başına çalışan bağımsız bir sunum bileşenidir.
- UndecidedUserCTA

---

## AXIOMS – Mimari Varsayımlar

Bu bileşen, parametresiz olarak çağrılan ve JSX döndüren bir React bileşenidir.

[Aksiyom 1]: Eğer UndecidedUserCTA bileşeni props (özellik) almadan çağrılırsa, bileşen içeriği tamamen kendi iç state'ine veya sabit değerlere dayanarak render edilir.

[Aksiyom 2]: Eğer bileşen bir React component olarak tanımlanmışsa, çağrıldığında geçerli bir JSX/ReactNode yapısı döndürmek zorundadır; aksi halde React render hatası oluşur.

[Aksiyom 3]: Eğer bileşen parametresiz tanımlanmışsa, dışarıdan özelleştirme (metin, renk, eylem callback'i vb.) yapılamaz; bileşen içeriği sabittir veya iç state tarafından kontrol edilir.

---

## FONKSİYON DETAYLARI

### UndecidedUserCTA
**Ne yapar**: VentHub HVAC projesinin kullanıcı arayüzünde, henüz herhangi bir işlem yapmamış veya karar vermemiş kararsız kullanıcılar için harekete geçirme çağrısı (CTA) sunan bir React fonksiyonel bileşenidir. Kullanıcıları ilgili aksiyonlara yönlendiren içerikler ve etkileşimli öğeler barındıran, projenin genelinde yeniden kullanılabilir bir arayüz katmanı oluşturur.
**Nasıl yapar**: Projenin src/components klasöründe konumlanan, yeniden kullanılabilir React bileşi standartlarında yapılandırılmıştır. Kendi iç yapısını bağımsız olarak yönetir, gerekli kullanıcı arayüzü öğelerini import ederek kararsız kullanıcı profiline özel içerikleri ekranda render eder. Herhangi bir harici durum bağımlılığı olmadan, çağrıldığı her yerde tutarlı bir CTA deneyimi sunar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, bağımsız çalışacak şekilde tasarlanmıştır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, tarayıcıda kullanıcıya görünür şekilde render edilebilen, kararsız kullanıcıları yönlendiren tüm CTA öğelerini içeren React node'larını barındırır. Proje içindeki tüm ilgili sayfalarda bu dönüş değeri kullanılarak bileşen ilgili yere yerleştirilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/UndecidedUserCTA.tsx::UndecidedUserCTA
- **params**: (parametre yok — fonksiyon Arrow function olarak tanımlı, parametre almıyor)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile elde edilen çeviri fonksiyonu; JSX içinde `t('undecidedUserCta.title')`, `t('undecidedUserCta.description')`, `t('undecidedUserCta.buttonText')` çağrılarıyla lokalize metinler render eder
- **Dönüş**: JSX (React element) — `div` sarmalayıcı içinde gradient arka planlı, responsive bir CTA (Call To Action) kartı; `MessageSquare` ikonu, `t()` ile çevrilmiş başlık/açıklama metni, ve `Link` bileşeni içeren `Routes.contact('consulting')` href'li buton döner
- **Yan etkiler**: Yok (saf bileşen, state değiştirmez, side-effect tetiklemez)
- **Referanslanan dış kaynaklar**: `useI18n()` hook'u, `Routes.contact()` helper'ı, `ArrowRight` ve `MessageSquare` lucide-react ikonları, `Link` Next.js bileşeni

---

## NODE ID STANDARD

  file: src\components\UndecidedUserCTA.tsx
  function: src\components\UndecidedUserCTA.tsx::UndecidedUserCTA

---

## DISA AKTARILANLAR (EXPORTS)
  export: UndecidedUserCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-white`, `bg-white/10`, `bg-white/20`, `from-primary-navy`, `sm:text-2xl`, `sm:text-base`, `text-primary-navy`, `text-sm`, `text-white`, `text-white/80`, `text-xl`, `to-secondary-blue`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-col`, `from-primary-navy`, `gap-2`, `gap-5`, `gap-6`, `h-12`, `h-32`, `h-64`, `hover:shadow-xl`, `inline-flex`, `items-center`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/3`, `-translate-y-1/2`, `blur-2xl`, `blur-3xl`, `font-bold`, `group`, `group-hover:translate-x-1`, `hover:scale-102`, `leading-relaxed`, `mb-12`, `mb-2`, `mt-8`, `px-6`, `py-3.5`, `rounded-2xl`