---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\shell\AdminPageHeader.tsx
skeleton_hash: 18c2d028c904b027
entity_hashes:
  func:AdminPageHeader: 9007c4c4bb00760d
  overview: e26822fd35affb04
  style_tokens: 774aecf71fafa764
generated_at: 2026-08-15T18:23:38Z
---

## Genel Bakış
Admin panelindeki sayfalar için tutarlı bir üstbilgi (header) bileşeni sunar. Sayfa başlığını, açıklamasını ve aksiyon butonlarını standart bir düzende render ederek yönetim arayüzünde görsel tutarlılık sağlar.

## Fonksiyon Grupları
### Sayfa Üstbilgi Sunumu
Admin sayfalarının en üst kısmında yer alan başlık alanını oluşturur. Başlık metni, açıklama ve sağ taraftaki aksiyon butonlarını (ör. "Yeni Ekle", "Dışa Aktar") düzenli bir şekilde konumlandırır.
- AdminPageHeader

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel varsayım, girdi olarak verilen `props` nesnesinin beklenen yapısına ve bileşenin dış bağımlılıklarına ilişkindir.

[Aksiyom 1]: Eğer `title` prop'u (`string` veya `ReactNode` türünde) sağlanmazsa, bileşen başlık alanını boş veya tanımsız render eder; bu durum, üst düzey sayfa yapısının bozulmasına ve kullanıcının sayfa amacını anlamasını zorlaştırmasına yol açar.

[Aksiyom 2]: Eğer `actions` prop'u (`ReactNode[]` veya benzeri bir dizi/iterable türünde) sağlanmazsa veya boş bir dizi olarak gelirse, bileşen eylem butonları alanını (header'ın sağ tarafı) hiç render etmez; bu durum, sayfadaki kritik interaktif işlevlerin (örn: kayıt, filtreleme) kullanıcıya sunulmamasına neden olur.

[Aksiyom 3]: Eğer `description` prop'u (`string` veya `ReactNode` türünde) sağlanmazsa, bileşen açıklama satırını atlar ve yalnızca `title` ve `actions` alanlarını render eder; bu durum, sayfa için bağlam sağlayan yardımcı metnin eksik kalmasına yol açar.

[Aksiyom 4]: Eğer `actions` dizisindeki her bir öğe (`ReactNode` türünde) değil de, geçersiz bir veri tipi (örn: `null`, `undefined`, veya bileşenin beklediği formata uymayan bir nesne) içerirse, bileşen eylem alanını hata vererek veya eksik render ederek bozuk bir arayüz görüntüler.

[Aksiyom 5]: Eğer bileşenin çalışması için gerekli olan dış CSS modülü (örn: `AdminPageHeader.module.css` veya benzeri) veya stil tanımı projede mevcut değilse veya import edilemiyorsa, bileşen tamamen stilsize (ham HTML gibi) render olur; bu durum, sayfa düzeninin ve hizalamanın bozulmasına neden olur.

---

## FONKSİYON DETAYLARI

### AdminPageHeader
**Ne yapar**: Admin paneli sayfalarının üst kısmında yer alan, sayfa başlığını, açıklamasını ve sağ tarafta aksiyon butonlarını (örneğin 'Kaydet', 'Yeni Ekle') gösteren bileşeni oluşturur.

**Nasıl yapar**: Fonksiyon, React fonksiyonel bir bileşenidir (React.FC). `AdminPageHeaderProps` arayüzünden alınan `title`, `description` ve `actions` prop'larını alır ve bunları JSX ile birlikte düzenli bir başlık yapısına dönüştürerek döndürür. `title` ana başlık olarak, `description` ise alt başlık veya bilgi metni olarak render edilir. `actions` prop'u ise genellikle bir React düğümü (ReactNode) veya bir dizi olarak gelir ve başlığın sağ tarafına yerleştirilen butonlar veya diğer etkileşimli elemanları temsil eder. Bileşen, sayfa düzeninin tutarlılığını sağlamak için dışarıdan gelen bu verileri yapılandırılmış bir şekilde görüntüler.

**Parametreler**:
- title: `string` — Sayfanın ana başlığını temsil eden metin.
- description: `string` — Başlığın altında yer alan, sayfa hakkında kısa bilgi veren açıklayıcı metin.
- actions: `React.ReactNode` — Başlığın sağ tarafında görüntülenecek olan aksiyon butonları veya diğer React bileşenleri.

**Dönüş**: `React.FC<AdminPageHeaderProps>` — Hazır ve yapılandırılmış bir React bileşeni. Bu, `AdminPageHeaderProps` arayüzüne uygun prop'ları alan ve JSX elementi döndüren bir fonksiyonel bileşendir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminSectionTitleClass
- import: ../../../utils/adminUi::adminSubtitleClass
- import: react::React

---

## INTERFACES

### AdminPageHeaderProps
SAYFA BAŞLIĞI — tek uygulama. Neden bileşen: 20 admin sayfası aynı `<header><h1><p></header>` üçlüsünü ELLE tekrarlıyordu. Bugün tutarlılar; sorun tutarsızlık değil, **sürüklenme riski** — 20 kopyada bir kuralı (başlık ağırlığı, boşluk ritmi, aksiyonun yeri) değiştirmek 20 ayrı düzenleme demektir ve
- `title: string`
- `description?: string`
- `actions?: React.ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/AdminPageHeader.tsx::AdminPageHeader
- **params**: { title, description, actions }
- **ic_degiskenler**:
  - `title` — Sayfa başlık metni, `<h1>` elementine `adminSectionTitleClass` ile birlikte render edilir
  - `description` — Sayfa alt başlık/açıklama metni, `adminSubtitleClass` ile koşullu olarak `<p>` içinde render edilir
  - `actions` — Başlık sağ tarafında yer alan aksiyon butonları/elemanları, koşullu olarak flex container içinde render edilir
- **Dönüş**: JSX — `<header>` elementi içinde title, description (opsiyonel) ve actions (opsiyonel) barındıran layout bileşeni

**Notlar:**
- `adminSectionTitleClass` — `../../../utils/adminUi` modülünden import edilen, `<h1>` elemanına uygulanan CSS class sabiti
- `adminSubtitleClass` — `../../../utils/adminUi` modülünden import edilen, `<p>` elemanına uygulanan CSS class sabiti
- `description` truthy kontrolü (`description ? ... : null`) ile opsiyonel render yapılır
- `actions` truthy kontrolü (`actions ? ... : null`) ile opsiyonel render yapılır
- Bileşen saf bir functional component'tir; prop'ları doğrudan JSX'e haritalandırır, state veya yan etki barındırmaz

---

## NODE ID STANDARD

  file: src\components\admin\shell\AdminPageHeader.tsx
  function: src\components\admin\shell\AdminPageHeader.tsx::AdminPageHeader

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPageHeader

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `flex`, `flex-wrap`, `gap-2`, `gap-4`, `items-center`, `items-start`, `justify-between`, `min-w-0`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `shrink-0`