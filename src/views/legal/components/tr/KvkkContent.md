---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\KvkkContent.tsx
skeleton_hash: 7a74413e5544aac2
entity_hashes:
  func:KvkkContentTr: ce8aa32329dc415e
  overview: 9ac8e2b6eeaddd22
  style_tokens: 06e3f7beac6824a2
generated_at: 2026-06-19T20:51:04Z
---

## Genel Bakış
`KvkkContent.tsx` modülü, VentHub platformunda KVKK (Kişisel Verilerin Korunması Kanunu) aydınlatma metninin Türkçe karşılığını sunan bir React bileşenidir. Statik yasal içeriği JSX yapısı ile render ederek kullanıcıya kişisel verilerin işlenmesine ilişkin bilgilendirmeyi sunar. Bileşen herhangi bir iş mantığı veya durum yönetimi içermez; yalnızca presentational bir rol üstlenir.

## Fonksiyon Grupları
### KVKK İçerik Gösterimi
KVKK kanun metninin Türkçe versiyonunu JSX olarak render eden bileşeni barındırır. Divider, paragraf ve liste gibi alt bileşenlerle okunabilir bir yasal metin düzeni oluşturulur.
- `KvkkContentTr`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### KvkkContentTr

**Ne yapar**: Bu fonksiyon, KVKK (Kişisel Verilerin Korunması Kanunu) yasal metninin Türkçe içeriğini render eden bir React fonksiyonel bileşenidir. VentHub HVAC uygulamasının yasal sayfalarında Türkçe dil seçeneği için KVKK metnini görüntülemek amacıyla kullanılır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşen olarak tanımlanmıştır. `lang` prop'unu alarak dil bilgisini işler ve Türkçe KVKK içeriğini döndürür. `React.FC` generic tipi ile tiplendirilmiş olup, dil parametresinin string tipinde olmasını zorunlu tutar.

**Parametreler**:
- `lang`: `string` — Bileşenin hangi dilde içerik göstereceğini belirten dil kodu parametresidir. Türkçe içerik sunulacağı durumlarda uygun dil değeri iletilmelidir.

**Dönüş**: `React.FC<{ lang: string }>` — Türkçe KVKK yasal içeriğini渲染 eden bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/KvkkContent.tsx::KvkkContentTr
- **params**: `{ lang }` — Dili belirten string parametresi (TR/EN vb.)
- **ic_degiskenler**:
  - `lang` — Fonksiyon parametresi olarak alınan dil kodu, localizedHref fonksiyonuna argüman olarak传递
  - `legalConfig` — Import edilen yasal yapılandırma nesnesi, KVKK metnindeki tüm yasal bilgileri (şirket adı, adres, e-posta, telefon, vergi bilgileri, süreler vb.) sağlar
  - `localizedHref` — Import edilen fonksiyon, verilen rotayı ve dili kullanarak lokalize URL oluşturur (Çerez Politikası linki için kullanılır)
  - `Routes` — Import edilen rota sabitleri nesnesi, `Routes.legal.cerez()` yolu ile çerez politikası rotasını tanımlar
- **Dönüş**: React.FC<{ lang: string }> — JSX içeriği döndürür, KVKK aydınlatma metninin Türkçe versiyonunu render eder

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\KvkkContent.tsx
  function: src\views\legal\components\tr\KvkkContent.tsx::KvkkContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: KvkkContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-xl`, `text-xs`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`