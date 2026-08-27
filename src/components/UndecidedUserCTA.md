---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\UndecidedUserCTA.tsx
skeleton_hash: dc8706624d47afb5
entity_hashes:
  func:UndecidedUserCTA: e9ab9b6769bffef9
  overview: fcf28800e004a782
  style_tokens: d1dc68fb1553bbf5
generated_at: 2026-08-27T07:58:35Z
---

## Genel Bakış
Bu modül, kararsız kullanıcılar için bir harekete geçirici mesaj (CTA) bileşeni tanımlayan bir React bileşen moduludur. Modul, tek bir fonksiyonel bileşen içerir ve kullanıcı etkileşimini artırmaya yönelik bir arayüz elemanı sunar.

## Fonksiyon Grupları

### Bileşen
Kararsız kullanıcıya yönelik bir CTA arayüzü oluşturan fonksiyonel bileşendir. React.FC tipinde bir bileşen döndürerek kullanıcıya eylem çağrısı gösterir.
- UndecidedUserCTA

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmediğinden, bileşenin çalışma mantığı, bağımlılıkları, durum yönetimi veya render davranışına dair çıkarım yapılamaz. Yalnızca fonksiyon imzası (`UndecidedUserCTA() -> React.FC`) mevcut olup, bu imzadan yalnızca şunlar bilinir:

- Bileşen herhangi bir prop almaz.
- Bileşen bir React fonksiyon bileşeni döndürür.

Bunlar genel React varsayımları kapsamına girdiğinden (kural gereği yazılmaz) ve fonksiyon gövdesine dair bilgi bulunmadığından (kural gereği çıkarım yapılmaz), modüle özgü aksiyom üretilememiştir.

---

## FONKSİYON DETAYLARI

### UndecidedUserCTA
**Ne yapar**: Bilinmiyor. Kaynakta bu fonksiyonun görevini açıklayan bir docstring veya yorum bulunmamaktadır.

**Nasıl yapar**: Bilinmiyor. Kaynak kodunun içeriği verilmediğinden uygulama mantığı belirlenememektedir.

**Parametreler**:
- Fonksiyon tanımlanışında parametre almamaktadır (boş parantez).

**Dönüş**: `React.FC` — React fonksiyonel bileşen (Functional Component) döndürür. Bu, JSX elementi üreten ve isteğe bağlı olarak props kabul eden bir fonksiyon tipidir. Ancak bu fonksiyonun hangi props'u kabul ettiği verilen bilgiden anlaşılamamaktadır.

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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; `t('undecidedUserCta.title')`, `t('undecidedUserCta.description')`, `t('undecidedUserCta.buttonText')` çağrılarıyla metinleri lokalize eder
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen nesne; `Routes.contact('consulting')` çağrısıyla iletişim sayfasının lokalize edilmiş URL'ini üretir
- **Dönüş**: JSX — Karar vermemiş kullanıcıyı hedefleyen CTA (Call To Action) bileşeni. Gradient arka planlı kart içinde `MessageSquare` ikonu, başlık (`undecidedUserCta.title`), açıklama (`undecidedUserCta.description`) ve `Link` bileşeniyle sarılı buton (`undecidedUserCta.buttonText` + `ArrowRight` ikonu) içerir. Dekoratif arka plan daireleri (`bg-white/10`) mutlak konumlandırılmıştır. Buton `Routes.contact('consulting')` rotasına yönlendirir.

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