---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\KVKKPage.tsx
skeleton_hash: 2dde66b0b8678d9d
entity_hashes:
  func:KVKKPage: aa86d51285a03cb2
  overview: f3ce89e4fcf51ae6
  style_tokens: 326833844f2bc7df
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yasal sayfalar bölümüne ait KVKK (Kişisel Verilerin Korunması Kanunu) bilgilendirme sayfasını tanımlayan basit bir React görünüm bileşenidir. Statik yasal içerikleri kullanıcıya sunmak dışında herhangi bir veri işleme veya durum yönetimi içermez.

## Fonksiyon Grupları
### Sayfa Bileşeni
Tek başına sayfanın tüm JSX yapısını ve yasal bilgilendirme içeriğini oluşturan görünüm bileşenini barındırır.
- KVKKPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, KVKK bilgilendirme sayfasını oluşturan minimal bir React bileşenidir. Fonksiyon gövdesinde belirgin bir mantıksal akış veya koşullu işlm yoktur.

[Aksiyom 1]: Eğer `KvkkContentTr` modülde çağrıya uygun (callable) olarak tanımlı değilse, Türkçe KVKK içeriği render edilemez ve bileşen hata verir.

[Aksiyom 2]: Eğer `KvkkContentEn` modülde çağrıya uygun (callable) olarak tanımlı değilse, İngilizce KVKK içeriği render edilemez ve bileşen hata verir.

---

## FONKSİYON DETAYLARI

### KVKKPage
**Ne yapar**: VentHub HVAC projesinin yasal içerikler bölümünde yer alan KVKK (Kişisel Verilerin Korunması Kanunu) bilgilendirme sayfasını oluşturan React görünüm bileşenidir. Kullanıcıların platformdaki KVKK ile ilgili yasal metinlere erişmesini sağlayan, projenin legal sayfalar grubundan biri olarak hizmet verir.
**Nasıl yapar**: Proje kaynak kodunun `C:\Users\alize\venthub-hvac\src\views\legal\KVKKPage.tsx` dosyasında tanımlı saf bir React görünüm bileşeni olarak çalışır. Karmaşık iç iş mantığına veya harici veri işleme süreçlerine sahip olmadan, statik olarak tanımlanmış yasal KVKK içeriklerini kullanıcıya sunmak üzere işlenir.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde kullanılabilir bir React bileşeni döndürür. Döndürülen bileşen, KVKK ile ilgili yasal bilgilendirme metinlerini kullanıcı arayüzünde görüntülemek üzere işlenebilir JSX içeriği barındırır.

---

## SABİTLER
- **KvkkContentTr** (call) — `dynamic(() => import('./components/tr/KvkkContent').then(m => m.KvkkContentTr...`
- **KvkkContentEn** (call) — `dynamic(() => import('./components/en/KvkkContent').then(m => m.KvkkContentEn...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/KVKKPage.tsx::KVKKPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `lang` — useI18n() hookundan dönen dil kodu (örn: 'tr', 'en'), hangi KVKK içeriğinin gösterileceğini belirler
  - `t` — useI18n() hookundan dönen çeviri fonksiyonu, anahtar kelimelerle çevrilmiş metinleri getirir
- **Dönüş**: React.FC (JSX elementi — tüm sayfa yapısını ve dinamik içeriği döndürür)

---

## NODE ID STANDARD

  file: src\views\legal\KVKKPage.tsx
  function: src\views\legal\KVKKPage.tsx::KVKKPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: KVKKPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-100/50`, `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xs`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `h-96`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `dark:prose-invert`, `font-bold`, `lg:px-8`, `mb-6`, `mt-4`, `mx-auto`, `prose`, `px-4`, `py-10`, `rounded-lg`, `rounded-xl`, `sm:px-6`, `space-y-6`