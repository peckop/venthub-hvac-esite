---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\dataTable.tr.ts
skeleton_hash: 354521f327e14f61
entity_hashes:
  overview: 929ede5dd9b9aed8
generated_at: 2026-08-15T18:29:39Z
---

## Genel Bakış

Bu dosya, admin panelindeki veri tablosu (data table) bileşenlerinin Türkçe çeviri sözlüğünü içerir. Tablo sütun başlıkları, filtre etiketleri, sayfalama metinleri, boş durum mesajları ve işlem但onları gibi arayüz metinlerini tanımlar. Dosya, uygulamanın çok dilli (i18n) altyapısının bir parçası olarak, Türkçe dil seçeneğinde kullanılacak tüm veri tablosu metinlerini merkezi bir yapıda sunar.

## İçerik Yapısı

Bu dosya yalnızca statik bir sözlük nesnesi (`dataTable`) içerir ve herhangi bir işlev (fonksiyon), modül importu veya dış bağımlılık barındırmaz. Çalışma zamanında i18n sistemine bağlı olarak yüklenir ve mevcut dil ayarına göre ilgili arayüz bileşenleri tarafından referans alınır. Dosya, `src/i18n/dictionaries/admin/` dizinindeki organizasyon yapısına uygun olarak admin panelinin dil kaynaklarını yönetir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir Vue uygulamasının tablo bileşenleri için uluslararasılaştırma (i18n) sözlüğü sağlamaktadır. Modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `dataTable` nesnesi tanımlı değilse veya bir nesne (object) türünde değilse, modülün dışarıya açılan çeviri anahtarları (`labels`, `headers` vb.) eksik veya hatalı olacaktır ve tablo bileşenleri doğru metinleri gösteremeyecektir.

[Aksiyom 2]: Eğer `dataTable` nesnesi içindeki bir anahtar (örn. `labels.deleteConfirmation`) tanımlı değilse, o metin gösterilmesi istenen yerde boş bir string (`""`) veya `undefined` görünecektir; bu da kullanıcı arayüzünde anlamsız bir boşluk veya hata oluşmasına neden olabilir.

[Aksiyom 3]: Eğer `dataTable.labels.deleteConfirmation` metni, `%%name%%` yer tutucusunu içermiyorsa, silme onayı iletişim kutusunda dinamik olarak değiştirilmesi beklenen öğe adı metni görüntülenemeyecektir (örn. "Bu kaydı silmek istediğinize emin misiniz?" yerine "%%name%% kaydı silmek istediğinize emin misiniz?" gibi hatalı bir metin görünecektir).

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **dataTable** (object) — `{
      bulk: {
        selectedCount: '{count} öğe seçili',
        clear...`

---

## AST POINTERS

Bu dosyada fonksiyon gövdesi bulunmamaktadır. Dosya, `dataTable` sabit bir nesne (i18n sözlük/traduction dictionary) içeren bir TypeScript modülüdür.

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/dataTable.tr.ts::(modül-level sabit)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — Dosya yalnızca `dataTable` adında bir nesne sabiti export eder; fonksiyon içermez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\dataTable.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: dataTable