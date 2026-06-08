---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx
skeleton_hash: 51d749e54813ce29
entity_hashes:
  func:HRVCalcPage: f6b36b28ed5f44cd
  func:reset: 16764b441f7bc7b6
  overview: e0997b7ffb0ae1d0
  style_tokens: 27adff48ed74fee3
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, Isı Geri Kazanımlı Havalandırma (HRV) cihazları için hesaplama işlemlerini sunan React tabanlı bir sayfa bileşenidir. Kullanıcıların HRV sistemiyle ilgili parametreleri girerek hesaplama yapmasını ve sonuçları görüntülemesini sağlar.

## Fonksiyon Grupları

### Ana Sayfa Bileşeni
HRV hesaplayıcı sayfasının tüm kullanıcı arayüzünü, state yönetimini ve hesaplama mantığını barındıran ana bileşendir.
- HRVCalcPage

### Yardımcı İşlevler
Kullanıcının form değerlerini veya hesaplama durumunu başlangıç noktalarına döndirmek için kullanılan destekleyici işlevleri içerir.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel aksiyomlar, bir React hesaplama bileşeninin doğru çalışması için gerekli olan bağımlılıklar ve durum yönetimi üzerine kurulmuştur.

[Aksiyom 1]: Eğer React çalışma ortamı (React, ReactDOM ve gerekli bağımlılıklar) yoksa, bileşen hiç render edilemez ve modül hiçbir işlevini yerine getiremez.
[Aksiyom 2]: Eğer `HRVCalcPage` bileşeni, hesaplama mantığını ve form durumunu (state) yönetecek yerel durum (state) mekanizmasına sahip değilse, kullanıcı girişleri işlenemez ve hesaplama sonuçları üretilemez.
[Aksiyom 3]: Eğer `reset` işlevi, ilgili durum (state) değişkenlerini başlangıç değerlerine geri döndürecek erişime veya yetkiye sahip değilse, form alanları veya hesaplama çıktısı sıfırlanamaz.
[Aksiyom 4]: Eğer modül, HRV sistemi hesaplaması için gerekli olan asgari sayıda ve türde kullanıcı giriş parametrelerini (örn: hava debisi, sıcaklık farkları) kabul etmiyorsa, geçerli veya anlamlı bir hesaplama sonucu üretilemez.
[Aksiyom 5]: Eğer modül, hesaplama formüllerini veya mantığını doğru bir şekilde uygulamıyorsa, üretilen sonuçlar teknik olarak hatalı olur.
[Aksiyom 6]: Eğer modül, kullanıcıya hesaplama sonuçlarını gösterecek bir arayüz bileşeni (JSX) içermiyorsa, hesaplama yapılsa bile sonuçlar kullanıcıya sunulamaz.

---

## FONKSİYON DETAYLARI

### HRVCalcPage
**Ne yapar**: HRV (Heat Recovery Ventilation - Isı Geri Kazanımlı Havalandırma) hesaplama sayfasını render eden ana React bileşenidir. Bu bileşen, kullanıcıların HVAC hesaplamaları yapabilmesini sağlayan bir sayfa sunar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır. `React.FC` (Functional Component) tipini döndürür ve sayfanın tüm arayüzünü ve hesaplama mantığını yönetir. Bileşen kendi içinde state yönetimini ve kullanıcı etkileşimlerini gerçekleştirilir.

**Parametreler**:
- Parametre almamaktadır (propsless bileşen)

**Dönüş**: `React.FC` — Fonksiyonel React bileşeni döndürür.

### reset
**Ne yapar**: HRVCalcPage sayfasındaki tüm kullanıcı girişlerini, hesaplanmış sonuçları ve sayfanın geçici özel ayarlarını sıfırlayarak sayfayı ilk yüklendiği varsayılan durumuna geri döndürür. Kullanıcıların yeni bir hesaplama yapmak veya hatalı girişleri temizlemek istediklerinde tüm değerleri tek tıkla sıfırlamasını sağlar.
**Nasıl yapar**: HRVCalcPage bileşeni içinde tanımlanan tüm yerel state değişkenlerini orijinal varsayılan değerlerine atar, kullanıcı tarafından doldurulan tüm metin ve sayısal giriş alanlarını boşaltır, daha önce hesaplanan tüm teknik sonuç verilerini temizler. Sayfa üzerindeki hiçbir kalıcı geçici veri kalmayacak şekilde tüm durumu sıfırlar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, doğrudan sayfa içi durumları değiştirmek üzere çağrılır.
**Dönüş**: void tipindedir, herhangi bir değer döndürmez; sadece sayfa içi state güncellemeleri yaparak arayüzün yeniden render edilmesini tetikler.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::recoveryTypeOptions
- **params**: () — parametre yok (arrow function, closure'dan `t` kullanır)
- **ic_degiskenler**: Değişken yok — array literal doğrudan return edilir
- **Closure erişimleri**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu; `t('calculators.hrv.form.hrv')`, `t('calculators.hrv.form.erv')` gibi çağrılarla çevirilmiş label ve description üretir
  - `ThermometerSun` — lucide-react'ten import edilen ikon bileşeni, HRV seçeneğinin icon'u
  - `Snowflake` — lucide-react'ten import edilen ikon bileşeni, ERV seçeneğinin icon'u
- **Dönüş**: `Array<{ value: string, label: string, description: string, icon: JSX.Element }>` — iki elemanlı Recovery tipi seçenek listesi (hrv / erv)

---

## NODE ID STANDARD

  file: src\views\calculators\HRVCalcPage.tsx
  function: src\views\calculators\HRVCalcPage.tsx::HRVCalcPage
  function: src\views\calculators\HRVCalcPage.tsx::reset

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVCalcPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-primary-navy/10`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `border-success-green/20`, `hover:text-industrial-gray`, `text-center`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`
- **Layout:** `flex`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-2`, `items-center`, `justify-center`, `lg:grid-cols-2`, `p-2`, `p-4`, `p-6`, `shadow-sm`
- **Varyant/Responsive:** `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `mb-4`, `mb-6`, `mt-4`, `py-12`, `rounded-2xl`, `rounded-full`, `rounded-lg`, `rounded-xl`, `space-y-4`, `space-y-6`, `transition-colors`