---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\SilentFanWizard.tsx
skeleton_hash: 1417d1af007f1c89
entity_hashes:
  func:OneriKarti: 97c485c0d2d475d4
  func:SilentFanWizard: 9f1774f3b17d5e04
  overview: a6fbe1769b3cb472
  style_tokens: 152b7536a8556fc2
generated_at: 2026-08-25T08:44:23Z
---

## Genel Bakış
Bu modül, sessiz fan seçimi için etkileşimli bir sihirbaz (wizard) bileşeni sağlar. Kullanıcının tercihlerine göre uygun fan önerilerini sunar ve sonuçları görsel kartlarla görüntüler. Modül, yönlendirme ve yerelleştirme gibi dış bağımlılıkları kullanarak kullanıcı deneyimini destekler.

## Fonksiyon Grupları
### Ana Sihirbaz Bileşeni
Sihirbazın ana bileşenidir. Kullanıcı etkileşimlerini yönetir, fan adaylarını değerlendirir ve sonuçları alt bileşenlere aktarır.
- SilentFanWizard

### Sonuç Kartı Bileşeni
Tek bir fan önerisini görsel bir kart olarak görüntüler. Rozet, vurgu ve yerelleştirme desteği gibi özellikleri işler.
- OneriKarti

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdeleri verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdelerinden türetilir; imza, sabit tanımları veya dosya adından çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### SilentFanWizard

**Ne yapar**: Sessiz fan seçimi için 5 adımlık bir sihirbaz (wizard) bileşenidir. Kullanıcıdan mahal tipi, oda büyüklüğü, kanal tercihleri ve sessizlik seviyesi gibi girdileri toplayarak, veritabanından çekilen fan adayları arasından en uygun sonuçları hesaplar ve sunar.

**Nasıl yapar**: Bileşen `isOpen` prop'u `false` olduğunda `null` döner ve hiçbir şey render etmez. Aksi halde tam ekran bir modal dialog oluşturur. Durum yönetimi için `useState` ile adım (`adim`), girdi (`girdi`), aday listesi (`adaylar`), yükleme durumu (`yukleniyor`), hata (`hata`), sonuç (`sonuc`) ve detay açıklığı (`dokumAcik`) state'leri tutulur. `adaylariGetir` fonksiyonu `useCallback` ile sarılmıştır ve `supabase` istemcisi ile `getWizardCandidates` fonksiyonunu çağırarak kategoriye göre fan adaylarını getirir; adaylar bir kez çekildikten sonra tekrar çekilmez. Hata durumunda hata yutulmaz, kullanıcıya gösterilir (yorumda belirtildiği üzere bu, daha önceki sessiz hata gösterme sorununun çözümüdür). 5. adıma gelindiğinde `useEffect` tetiklenir, adaylar getirilir ve `secimYap` fonksiyonu ile girdilere göre sonuç hesaplanır; bileşen unmount edilirse iptal bayrağı ile işlem durdurulur. `ileri` ve `geri` fonksiyonları adım sınırlarını (`1`-`5`) aşmayacak şekilde adım değiştirir. `bastanBasla` fonksiyonu tüm state'leri başlangıç değerlerine sıfırlar. `yaz` fonksiyonu `Partial<SecimGirdisi>` alarak mevcut girdi state'ini parçalı olarak günceller. Adım 1'de mahal seçimi, adım 2'de oda alanı ve tavan yüksekliği slider'ları, adım 3'te kanal güzergahı/malzemesi/çapı seçimi, adım 4'te sessizlik seviyesi seçimi, adım 5'te ise yükleme/hata/sonuç durumlarına göre uygun arayüz gösterilir. Sonuç ekranında `OneriKarti` bileşeni ile en uygun, en sessiz ve en verimli fan önerileri sunulur; detay açıklma butonu ile hacim, debi, basınç gibi hesaplama detayları gösterilir. Footer'da adım 5'ten önce varsayılanlar ipucu ve sonuca atlama butonu bulunur.

**Parametreler**:
- isOpen: `SilentFanWizardProps` içindeki `isOpen` alanı — Sihirbazın açık olup olmadığını kontrol eden boolean değer. `false` olduğunda bileşen hiçbir şey render etmez.
- onClose: `SilentFanWizardProps` içindeki `onClose` alanı — Sihirbazı kapatmak için çağırılacak fonksiyon. Arka plan overlay'e tıklanması ve kapatma butonu ile tetiklenir.
- categorySlug: `SilentFanWizardProps` içindeki `categorySlug` alanı — Fan adaylarının hangi kategoriden çekileceğini belirten slug değeri. `getWizardCandidates` fonksiyonuna parametre olarak iletilir.

**Dönüş**: JSX elementi döner. `isOpen` `false` olduğunda `null` döner.

### OneriKarti
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: @/hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/hvac/ductPressure::type { KanalMalzemesi }
- import: @/lib/services/wizard.service::getWizardCandidates
- import: @/lib/supabase/client::supabaseBrowserClient
- import: next/link::Link
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### SilentFanWizardProps
- `isOpen: boolean`
- `onClose: () => void`
- `categorySlug: string`

---

## TYPE ALIASES

### Adim
```typescript
type Adim = 1 | 2 | 3 | 4 | 5
```

---

## SABİTLER
- **VARSAYILAN_GIRDI** (object) — `{
  mahal: 'bathroom',
  alanM2: 8,
  tavanYuksekligiM: 2.5,
  guzergah: ...`
- **MAHALLER** (array) — `[
  { id: 'bathroom', ikon: Bath },
  { id: 'kitchen', ikon: ChefHat },
  ...`
- **CAPLAR** (as_expression) — `[100, 125, 150, 200, 250, 315] as const`
- **KART_TEMEL** (str) — `'focus-ring group p-5 text-left rounded-hvac-lg border transition-shadow dura...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::adaylariGetir (anonim async arrow)
- **params**: yok
- **ic_degiskenler**:
  - `adaylar` — daha önce yüklenmiş aday listesi; null değilse tekrar yüklemeden doğrudan döndürülür
  - `setYukleniyor` — yükleme durumunu güncelleyen state setter; true/false atanır
  - `setHata` — hata mesajını güncelleyen state setter; null veya hata mesajı string'i atanır
  - `getWizardCandidates` — wizard servisinden aday listesini getiren async fonksiyon; supabase istemcisi ve kategori slug'ı ile çağrılır
  - `supabase` — Supabase tarayıcı istemcisi; `getWizardCandidates` fonksiyonuna birinci argüman olarak geçilir
  - `categorySlug` — kategori slug değeri; `getWizardCandidates` fonksiyonuna ikinci argüman olarak geçilir
  - `liste` — `getWizardCandidates` çağrısından dönen aday listesi; state'e kaydedilir ve return edilir
  - `err` — yakalanan hata nesnesi; `instanceof Error` ile kontrol edilir, mesajı veya string karşılığı `setHata` ile state'e yazılır
- **Dönüş**: `liste` (aday listesi) veya `null` (hata durumunda)

### [N2_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::useEffect callback (adim === 5 kontrolü)
- **params**: yok
- **ic_degiskenler**:
  - `adim` — sihirbazın mevcut adım numarası; 5 değilse fonksiyon erken döner
  - `iptal` — cleanup bayrağı; true olduğunda async işlem sonucu göz ardı edilir
  - `adaylariGetir` — async fonksiyon; aday listesini getirir
  - `liste` — `adaylariGetir` sonucu dönen aday listesi
  - `setSonuc` — sonuç state'ini güncelleyen setter
  - `secimYap` — aday listesi ve girdi verisine göre seçim yapan fonksiyon
  - `girdi` — kullanıcının sihirbazda girdiği tüm seçimleri içeren nesne
- **Dönüş**: cleanup fonksiyonu (`() => { iptal = true }`) veya undefined (adim !== 5 ise)

### [N3_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::useEffect içi async IIFE
- **params**: yok
- **ic_degiskenler**:
  - `liste` — `adaylariGetir` sonucu dönen aday listesi
  - `adaylariGetir` — async fonksiyon; aday listesini getirir
  - `iptal` — cleanup bayrağı; true ise erken dönüş yapılır
  - `setSonuc` — sonuç state'ini güncelleyen setter
  - `secimYap` — aday listesi ve girdi verisine göre seçim yapan fonksiyon
  - `girdi` — kullanıcının sihirbazda girdiği tüm seçimleri içeren nesne
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**:
  - `iptal` — cleanup bayrağı; true atanarak async işlemin sonucunun göz ardı edilmesi sağlanır
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::sifirla (anonim arrow)
- **params**: yok
- **ic_degiskenler**:
  - `setAdim` — adım state'ini güncelleyen setter; 1 değerine sıfırlanır
  - `setGirdi` — girdi state'ini güncelleyen setter; `VARSAYILAN_GIRDI` sabit nesnesine sıfırlanır
  - `VARSAYILAN_GIRDI` — varsayılan girdi değerlerini içeren sabit nesne
  - `setSonuc` — sonuç state'ini güncelleyen setter; null'a sıfırlanır
  - `setDokumAcik` — döküm açıklık state'ini güncelleyen setter; false'a sıfırlanır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::progress bar render (anonim arrow)
- **params**: `s` — adım indeksi (number)
- **ic_degiskenler**:
  - `s` — mevcut adım indeksi; `adim` ile karşılaştırılarak aktif/pasif renk belirlenir
  - `adim` — sihirbazın mevcut adım numarası; `s <= adim` koşuluyla çubuğun rengi ve genişliği belirlenir
- **Dönüş**: JSX element (div)

### [N7_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::mahal kartı render (anonim arrow)
- **params**: `{ id, ikon: Ikon }` — mahal kimliği ve ikon bileşeni
- **ic_degiskenler**:
  - `id` — mahal kimlik değeri; `yaz` fonksiyonuna `mahal` olarak ve `t` fonksiyonuna çeviri anahtarı olarak geçilir
  - `Ikon` — mahal ikonu bileşeni; `size={20}` ile render edilir
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ mahal: id }` objesi ile çağrılır
  - `ileri` — bir sonraki adıma geçiş fonksiyonu
  - `KART_TEMEL` — kart bileşeninin temel CSS sınıfı sabiti
  - `girdi.mahal` — mevcut seçili mahal değeri; `id` ile eşleşiyorsa aktif stil uygulanır
  - `KART_AKTIF` — seçili kartın CSS sınıfı sabiti
  - `KART_PASIF` — seçilmemiş kartın CSS sınıfı sabiti
  - `t` — çeviri fonksiyonu; `silentFanWizard.room.${id}` ve `silentFanWizard.roomHint.${id}` anahtarlarıyla metin üretir
- **Dönüş**: JSX element (button)

### [N8_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::mahal onClick handler (anonim arrow)
- **params**: yok
- **ic_degiskenler**:
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ mahal: id }` objesi ile çağrılır
  - `id` — mahal kimlik değeri; `yaz` fonksiyonuna `mahal` olarak geçilir
  - `ileri` — bir sonraki adıma geçiş fonksiyonu
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::güzergah kartı render (anonim arrow)
- **params**: `g` — güzergah değeri (string)
- **ic_degiskenler**:
  - `g` — güzergah değeri; `yaz` fonksiyonuna `guzergah` olarak ve `t` fonksiyonuna çeviri anahtarı olarak geçilir
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ guzergah: g }` objesi ile çağrılır
  - `KART_TEMEL` — kart bileşeninin temel CSS sınıfı sabiti
  - `girdi.guzergah` — mevcut seçili güzergah değeri; `g` ile eşleşiyorsa aktif stil uygulanır
  - `KART_AKTIF` — seçili kartın CSS sınıfı sabiti
  - `KART_PASIF` — seçilmemiş kartın CSS sınıfı sabiti
  - `t` — çeviri fonksiyonu; `silentFanWizard.route.${g}` ve `silentFanWizard.routeHint.${g}` anahtarlarıyla metin üretir
- **Dönüş**: JSX element (button)

### [N10_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::malzeme kartı render (anonim arrow)
- **params**: `m` — malzeme değeri (string)
- **ic_degiskenler**:
  - `m` — malzeme değeri; `yaz` fonksiyonuna `malzeme` olarak ve `t` fonksiyonuna çeviri anahtarı olarak geçilir
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ malzeme: m }` objesi ile çağrılır
  - `KART_TEMEL` — kart bileşeninin temel CSS sınıfı sabiti
  - `girdi.malzeme` — mevcut seçili malzeme değeri; `m` ile eşleşiyorsa aktif stil uygulanır
  - `KART_AKTIF` — seçili kartın CSS sınıfı sabiti
  - `KART_PASIF` — seçilmemiş kartın CSS sınıfı sabiti
  - `t` — çeviri fonksiyonu; `silentFanWizard.material.${m}` ve `silentFanWizard.materialHint.${m}` anahtarlarıyla metin üretir
- **Dönüş**: JSX element (button)

### [N11_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::kanal çapı kartı render (anonim arrow)
- **params**: `c` — kanal çapı değeri mm cinsinden (number)
- **ic_degiskenler**:
  - `c` — kanal çapı değeri; `yaz` fonksiyonuna `kanalCapiMm` olarak geçilir ve buton içinde doğrudan gösterilir
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ kanalCapiMm: c }` objesi ile çağrılır
  - `girdi.kanalCapiMm` — mevcut seçili kanal çapı değeri; `c` ile eşleşiyorsa aktif stil uygulanır
- **Dönüş**: JSX element (button)

### [N12_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::sessizlik kartı render (anonim arrow)
- **params**: `s` — sessizlik seviyesi değeri (string)
- **ic_degiskenler**:
  - `s` — sessizlik seviyesi; `yaz` fonksiyonuna `sessizlik` olarak ve `t` fonksiyonuna çeviri anahtarı olarak geçilir
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ sessizlik: s }` objesi ile çağrılır
  - `ileri` — bir sonraki adıma geçiş fonksiyonu
  - `KART_TEMEL` — kart bileşeninin temel CSS sınıfı sabiti
  - `girdi.sessizlik` — mevcut seçili sessizlik değeri; `s` ile eşleşiyorsa aktif stil uygulanır
  - `KART_AKTIF` — seçili kartın CSS sınıfı sabiti
  - `KART_PASIF` — seçilmemiş kartın CSS sınıfı sabiti
  - `t` — çeviri fonksiyonu; `silentFanWizard.quiet.${s}` ve `silentFanWizard.quietHint.${s}` anahtarlarıyla metin üretir
  - `Volume2` — sessizlik ikonu bileşeni; `size={20}` ile render edilir
- **Dönüş**: JSX element (button)

### [N13_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::sessizlik onClick handler (anonim arrow)
- **params**: yok
- **ic_degiskenler**:
  - `yaz` — girdi state'ini güncelleyen fonksiyon; `{ sessizlik: s }` objesi ile çağrılır
  - `s` — sessizlik seviyesi değeri; `yaz` fonksiyonuna `sessizlik` olarak geçilir
  - `ileri` — bir sonraki adıma geçiş fonksiyonu
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: src/components/category/SilentFanWizard.tsx::OneriKarti
- **params**: `{ sonuc, rozet, vurgulu, Routes, t }` — sonuc: AdaySonucu | null, rozet: string, vurgulu: boolean (varsayılan false), Routes: ReturnType<typeof useLocalizedRoutes>, t: çeviri fonksiyonu
- **ic_degiskenler**:
  - `sonuc` — aday sonucu nesnesi veya null; null ise erken dönüş yapılır (return null)
  - `rozet` — kart üst kısmında gösterilen rozet metni
  - `vurgulu` — vurgulu görünüm bayrağı; true ise cyan kenarlık ve gölge uygulanır
  - `Routes` — lokalize rotalar nesnesi; `Routes.product(aday.slug)` ile ürün sayfası URL'si üretilir
  - `t` — çeviri fonksiyonu; kart metinlerini üretmek için kullanılır
  - `aday` — `sonuc.aday` destructuring ile çıkarılan aday nesnesi; `ad`, `sesDbA`, `capMm`, `slug` alanlarına erişilir
  - `sonuc.calismaDebisiM3h` — çalışma debisi m³/h cinsinden; `Math.round` ile yuvarlanıp gösterilir
  - `aday.sesDbA` — ses seviyesi dB(A) cinsinden; null değilse gösterilir
  - `aday.capMm` — çap mm cinsinden; null değilse gösterilir
  - `aday.slug` — aday ürünün slug değeri; `Routes.product` fonksiyonuna argüman olarak geçilir
  - `aday.ad` — aday ürünün adı; h3 başlığında gösterilir
  - `Wind` — rüzgar ikonu bileşeni; `size={12}` ile rozet yanında render edilir
- **Dönüş**: JSX element (article) veya null (sonuc null ise)

---

## NODE ID STANDARD

  file: src\components\category\SilentFanWizard.tsx
  function: src\components\category\SilentFanWizard.tsx::SilentFanWizard
  function: src\components\category\SilentFanWizard.tsx::OneriKarti

---

## DISA AKTARILANLAR (EXPORTS)
  export: OneriKarti
  export: SilentFanWizard

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`, `rounded-hvac-md`, `rounded-hvac-sm`

### Tailwind Sınıf Özeti
- **Renkler:** `accent-cyan-500`, `bg-cyan-500`, `bg-industrial-gray/60`, `bg-light-gray`, `bg-light-gray/50`, `bg-primary-navy`, `bg-white`, `border-2`, `border-b`, `border-cyan-500`, `border-light-gray`, `border-none`, `border-t`, `group-hover:bg-cyan-500`, `group-hover:text-white`
- **Layout:** `absolute`, `backdrop-blur-xl`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-x-6`, `gap-y-3`
- **Varyant/Responsive:** `:`, `active:`, `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `${KART_TEMEL`, `${girdi.guzergah`, `${girdi.mahal`, `${girdi.malzeme`, `${girdi.sessizlik`, `:`, `<=`, `===`, `KART_AKTIF`, `KART_PASIF`, `active:scale-95`, `adim`, `animate-spin`, `border`