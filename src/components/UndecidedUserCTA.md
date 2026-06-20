---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\UndecidedUserCTA.tsx
skeleton_hash: 8ddd3877b270cc03
entity_hashes:
  func:UndecidedUserCTA: e9ab9b6769bffef9
  overview: fcf28800e004a782
  style_tokens: d1dc68fb1553bbf5
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
UndecidedUserCTA, platformunda henüz karar vermemiş veya belirli bir eyleme geçmemiş "kararsız" kullanıcıları hedefleyen bir React bileşenidir. Kullanıcıları platformdaki olası adımlar konusunda bilgilendirmeyi ve onları harekete geçmeye yönlendirmeyi amaçlayan, proje genelinde yeniden kullanılabilir bir CTA (Harekete Geçirme Çağrısı) modülüdür.

## Fonksiyon Grupları
### Kararsız Kullanıcı Yönlendirme Bileşeni
Platforma henüz tam olarak entegre olamamış veya hangi adımı atacağına karar verememiş kullanıcılar için eyleme çağrı içeriğini ekrana render eden bağımsız bir sunum bileşeni. Props almadan çalışarak kendi içinde sabit veya state tabanlı bir içerik sunar.
- UndecidedUserCTA

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz olarak çağrılan ve JSX döndüren bir React bileşenidir.

[Aksiyom 1]: Eğer React çalışma zamanı (render context) yoksa, bileşen hata fırlatır veya hiçbir çıktı üretmez.

[Aksiyom 2]: Eğer bileşen bir React bileşen ağacı (component tree) içine yerleştirilmezse, kullanıcıya herhangi bir CTA mesajı gösterilmez.

[Aksiyom 3]: Eğer bileşen dışarıdan herhangi bir prop almıyorsa, gösterdiği içeriği yalnızca kendi içinde tanımlı statik verilerden veya hardcoded değerlerden üretir.

[Aksiyom 4]: Eğer bileşen bağımsız (stateless ve propsless) çalışıyorsa,不同 kullanıcılara farklı içerik gösterme yeteneği yoktur; tüm kararsız kullanıcılara aynı mesajı sunar.

[Aksiyom 5]: Eğer bileşen bir React projesinde `import` edilip `<UndecidedUserCTA />` olarak kullanılmazsa, hedef kitleye yönlendirme mesajı iletilemez.

---

## FONKSİYON DETAYLARI

### UndecidedUserCTA
**Ne yapar**: VentHub HVAC projesinin kullanıcı arayüzünde, henüz herhangi bir işlem yapmamış veya karar vermemiş kararsız kullanıcılar için harekete geçirme çağrısı (CTA) sunan bir React fonksiyonel bileşenidir. Kullanıcıları ilgili aksiyonlara yönlendiren içerikler ve etkileşimli öğeler barındıran, projenin genelinde yeniden kullanılabilir bir arayüz katmanı oluşturur.
**Nasıl yapar**: Projenin src/components klasöründe konumlanan, yeniden kullanılabilir React bileşi standartlarında yapılandırılmıştır. Kendi iç yapısını bağımsız olarak yönetir, gerekli kullanıcı arayüzü öğelerini import ederek kararsız kullanıcı profiline özel içerikleri ekranda render eder. Herhangi bir harici durum bağımlılığı olmadan, çağrıldığı her yerde tutarlı bir CTA deneyimi sunar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, bağımsız çalışacak şekilde tasarlanmıştır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, tarayıcıda kullanıcıya görünür şekilde render edilebilen, kararsız kullanıcıları yönlendiren tüm CTA öğelerini içeren React node'larını barındırır. Proje içindeki tüm ilgili sayfalarda bu dönüş değeri kullanılarak bileşen ilgili yere yerleştirilir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: lucide-react::ArrowRight
- import: lucide-react::MessageSquare
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/UndecidedUserCTA.tsx::UndecidedUserCTA
- **params**: () — parametre yok (React functional component)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile elde edilen çeviri fonksiyonu; `t('undecidedUserCta.title')`, `t('undecidedUserCta.description')`, `t('undecidedUserCta.buttonText')` çağrılarında kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen.localized rota nesnesi; `Routes.contact('consulting')` çağrısı ile danışmanlık iletişim linki üretilir
- **Dönüş**: JSX element — kararsız kullanıcılar için CTA (Call-to-Action) kartı; gradient arka planlı, ikonlu başlık/açıklama bölümü ve `Link` ile sarılı danışmanlık butonu içeren React bileşeni
- **Side-effect**: Herhangi bir state güncellemesi veya yan etki yok; saf render bileşeni

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