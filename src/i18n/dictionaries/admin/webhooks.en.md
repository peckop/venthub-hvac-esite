---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\webhooks.en.ts
skeleton_hash: db3b4cf8d08a87ca
entity_hashes:
  overview: a695b1bd72d402b4
generated_at: 2026-06-17T13:23:01Z
---

## Genel Bakış
Bu dosya, bir web uygulamasının yöneticilik (admin) arayüzünde bulunan "Webhook Yönetimi" ekranı için tüm metinsel içeriği (etiketler, başlıklar, açıklamalar, hata mesajları vb.) İngilizce dilinde tanımlayan merkezi bir sözlük dosyasıdır. Tek bir büyük nesne (`webhooks`) içinde, ekranın farklı bölümlerine ait çeviri anahtarları ve karşılıkları yapılandırılmıştır. Bu yapı, uygulamanın uluslararasılaştırılmasını (i18n) sağlar ve arayüz metinlerinin koddan ayrı, düzenli bir şekilde yönetilmesine olanak tanır.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metot tanımlı değildir; yalnızca modül seviyesinde veri yapıları (sabit bir sözlük nesnesi) içermektedir. Bu nedenle "Fonksiyon Grupları" bölümü oluşturulmamıştır.

Bunun yerine, dosyanın içerdiği **sözlük yapısının genel düzeni** şu şekildedir:
*   `webhooks`: Ana ve tek对外açık nesne.
    *   `list`: Webhook listesi görünümüne ait metinleri barındırır.
    *   `create`: Yeni bir webhook oluşturma formuna ait metinleri barındırır.
    *   `edit`: Var olan bir webhook düzenleme formuna ait metinleri barındırır.
    *   `detail`: Tek bir webhook detay sayfasına ait metinleri barındırır.
    *   `delete`: Silme işlemleri ile ilgili onay mesajlarını barındırır.
    *   `form`: Webhook formunda ortak kullanılan etiketleri (label) barındırır.
    *   `notifications`: Kullanıcıya gösterilen başarı/bilgi/hata mesajlarını barındırır.
    *   `errors`: Form validasyonu ve API hataları için kullanılacak metinleri barındırır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n sözlük dosyasıdır (translation dictionary) ve yalnızca statik çeviri verileri içerir; çalışma zamanı mantığı veya fonksiyon barındırmaz.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **webhooks** (object) — `{
  title: 'Webhook Events',
  tabs: {
    returns: 'Returns',
    shippi...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/webhooks.en.ts::webhooks
- **params**: (fonksiyon değil — sabit object tanımı)
- **ic_degiskenler**:
  - `webhooks` — i18n çeviri sözlüğü objesi; webhooksayfasına ait tüm İngilizce metinleri (başlıklar, etiketler, hata mesajları, onay metinleri vb.) içerir; `admin/webhooks` modülünde UI gösteriminde kullanılır
- **Dönüş**: (yok — const object tanımı, ihracat (export) ile modül dışına sunulur)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\webhooks.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: webhooks