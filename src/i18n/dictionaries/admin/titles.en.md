---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\titles.en.ts
skeleton_hash: 0da41d5c4768df94
entity_hashes:
  overview: 92aa8036d07ad320
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış

Bu modül, admin panelinin tüm sayfa ve bölüm başlıklarının İngilizce çevirilerini içeren bir sözlük dosyasıdır. `titles` sabit bir nesne olarak tanımlanmıştır ve uygulama genelinde tutarlı başlık kullanımı için merkezi bir kaynak görevi görür. Dosya, i18n (uluslararasılaştırma) sistemi tarafından import edilerek arayüz dil desteği sağlanmasında kullanılır.

## Modül Yapısı

Bu dosya fonksiyon veya sınıf içermemektedir. Salt veri yapısı olarak aşağıdaki bileşenleri barındırır:

- **titles** — Admin panelindeki sayfa başlıkları, modal başlıkları, kart başlıkları ve bölüm başlıklarının İngilizce karşılıklarını tutan yapılandırılmış bir nesnedir. Nesne hiyerarşik olarak organize edilmiş olup, farklı admin sayfalarına ait başlık anahtarlarını içerir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** Modül仅包含 bir `titles` object sabitinden ibarettir ve herhangi bir fonksiyon gövdesi, koşullu mantık veya çalışma zamanı davranışı içermemektedir. Dolayısıyla mimari varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **titles** (object) — `{
      dashboard: 'Dashboard',
      orders: 'Orders',
      inventory: 'Inv...`

---

## AST POINTERS

Bu dosya (`titles.en.ts`) **hiçbir fonksiyon içermez**. Dosya, yalnızca bir `titles` nesne sabitini dışa aktaran bir **i18n veri sözlüğü** dosyasıdır.

Dosya yapısı:
- **`titles`** — Admin bölümündeki sayfa/bileşen başlıklarının İngilizce çeviri sözlüğü (nesne literal'i olarak tanımlı, `{ [key: string]: string }` yapısında)

**Fonksiyon gövdesi:** yok
**Sınıf:** yok
**Import:** yok

Bu dosya için AST Pointer üretilemez; çünkü analiz edilecek herhangi bir fonksiyon imzası veya gövdesi mevcut değildir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\titles.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: titles