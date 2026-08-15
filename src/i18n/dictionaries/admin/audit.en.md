---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\audit.en.ts
skeleton_hash: d31f7e6d3869f15c
entity_hashes:
  overview: 296262cb85b992c0
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, VentHUB HVAc sisteminin admin panelindeki "Denetim" (Audit) sayfası için İngilizce dil çevirilerini içeren bir uluslararasılaştırma (i18n) sözlük dosyasıdır. Modül, yalnızca statik bir veri yapısı (bir nesne sabiti) dışa aktararak, sayfa arayüzündeki tüm metinlerin tutarlı ve merkezi bir şekilde yönetimini sağlar.

## Modül Yapısı
- **`audit` sabiti**: Sayfanın tüm metin alanlarını (başlık, alt başlık, düğme etiketleri, hata mesajları vb.) anahtar-değer çiftleri olarak tanımlayan bir nesnedir.
- Modül herhangi bir işlevsel mantık, dış bağımlılık veya dinamik yükleme içermemektedir; salt bir veri tanımı (konfigürasyon) dosyasıdır.
- Dışa aktarılan `audit` yapısı, bir sözleşme niteliğindedir ve bu yapıyı tüketen tüm bileşenler (bileşenler, yardımcı fonksiyonlar) bu sabit anahtar kümesine bağımlıdır. Yapının değiştirilmesi, ilgili tüm tüketici kodlarının eş zamanlı olarak güncellenmesini gerektirir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, i18n (uluslararasılaştırma) amaçlı salt veri yapısı içerir; davranışsal mantık barındırmaz.

[Aksiyom 1]: `audit` nesnesinin alan anahtarları (key'leri) dış tüketiciler tarafından referans alınır — Eğer bir anahtar yeniden adlandırılır veya kaldırılırsa, o anahtarı kullayan tüm tüketici bileşenler derleme zamanı hatası verir veya çalışma zamanında `undefined` üretir.

[Aksiyom 2]: `audit` nesnesi yalnızca `string` değerlerden oluşmalıdır — Eğer bir değer türü değiştirilirse (örn: `string` → `object`), i18n motoru veya tüketici bileşen beklenen formatta metin alamaz.

[Aksiyom 3]: Bu dosya dil-specific bir sözlüktür (`.en.ts` = İngilizce) — Eğer dosya adındaki dil kodu (`en`) ile içeriğin gerçek dili eşleşmezse, yanlış dilde çeviri görüntülenir.

[Aksiyom 4]: `audit` nesnesinin alan sayısı ve isimleri, proje genelindeki i18n tüketici bileşenlerindeki `t('audit.xxx')` çağrılarıyla eşleşmelidir — Eğer nesneye yeni bir alan eklenmezse veya eksik kalırsa, ilgili bileşenlerde çeviri bulunamaz uyarısı oluşur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **audit** (object) — `{
      actionTitle: 'Action',
      clear: 'Clear',
      colAction: 'Act...`

---

## AST POINTERS

Bu dosyada **fonksiyon bulunmamaktadır**.

`C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\audit.en.ts` dosyası, yalnızca bir i18n (uluslararasılaştırma) sözlüğü dosyasıdır. İçeriği şu şekildedir:

- **`audit`** — `object` türünde bir sabit. İngilizce dilinde "denetim" (audit) sayfasına ait çeviri anahtar-değer çiftlerini barındırır. Fonksiyon içermediği için AST Pointer üretimi yapılamaz.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\audit.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: audit