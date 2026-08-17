---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\confirm.en.ts
skeleton_hash: 5fd88297cb217354
entity_hashes:
  overview: a909ef0d4730a50e
generated_at: 2026-08-15T15:08:18Z
---

## Genel Bakış

Bu dosya, VentHub WT Admin uygulamasının İngilizce dil sözlüğünün bir parçasıdır. Kullanıcı arayüzündeki onay dialogları, silme işlemleri, çıkış uyarıları gibi kritik eylemler öncesinde gösterilen mesajları ve başlıkları tanımlar. Merkezi bir çeviriler (i18n) yapısı içinde konumlanmış olup, uygulama genelinde tutarlı dil kullanımı sağlar.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmamaktadır. Dosya yalnızca modül seviyesinde bir sözlük nesnesi (`confirm`) içerir ve bu nesne aracılığıyla onay ekranlarına ait tüm metinler (başlıklar, açıklama mesajları, buton etiketleri) İngilizce dilinde sunulur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için bir JavaScript/TypeScript modülü olup, dışarıya bir `confirm` nesnesi ihrac eden (export) bir yapıdadır. Bu nesne, bir uygulamanın onay diyaloglarındaki metinleri tanımlayan bir çeviri sözlüğüdür (i18n dictionary).

[Aksiyom 1]: Eğer `confirm` nesnesi ihrac edilmez veya içe aktarılamazsa, uygulamanın onay diyaloglarında gösterilecek metinler yüklenemez ve bu alanlarda hata veya ham anahtar adları (örn. "confirm.yes") görünür.

[Aksiyom 2]: Eğer `confirm` nesnesinin içindeki bir anahtar-çift (key-value) eksikse veya boş bir dize (empty string) değerine sahipse, buna karşılık gelen onay diyalogunda ilgili buton veya metin alanı boş veya tanımsız görünür.

[Aksiyom 3]: Eğer bu modül, bir uygulama çerçevelesi (framework) tarafından otomatik olarak bir dil paketi olarak yüklenmiyorsa (örneğin, dinamik bir `import()` ile), tüm çeviriler statik olarak mevcut olacaktır; bu durum, uygulamanın çalışma zamanında dil değiştirme (language switching) yeteneğini devre dışı bırakır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **confirm** (object) — `{
      defaultTitle: 'Are you sure?',
      // Button labels summarise the o...`

---

## AST POINTERS

Bu dosya (`confirm.en.ts`) bir i18n sözlük/dictionary dosyasıdır. Fonksiyon içermez, sadece `confirm` adında bir export edilen nesne sabiti bulunur. Fonksiyon gövdesi tanımlı değildir.

**Sonuç:** Fonksiyon olmadığı için AST Pointer oluşturulamaz.

---

**Not:** Dosya yapısı itibarıyla bu bir **sabit nesne tanımı** dosyasıdır — tipik olarak şu formatta olacaktır:

```ts
export const confirm = {
  // key-value çiftleri (çeviri stringleri)
};
```

Fonksiyon gövdeleri mevcut olmadığından, `params`, `ic_degiskenler` ve `Dönüş` bilgileri üretilemez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\confirm.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: confirm