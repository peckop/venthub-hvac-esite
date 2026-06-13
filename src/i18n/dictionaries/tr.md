---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts
skeleton_hash: 4042b8dd98c252fc
entity_hashes:
  overview: 84411b9534640216
generated_at: 2026-06-13T11:19:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısının temelini oluşturan, tamamen statik bir Türkçe çeviri sözlüğüdür. Uygulama arayüzündeki tüm metinlerin Türkçe karşılıklarını barındıran `tr` adlı sabit bir nesne içerir. Modül, hiçbir iş mantığı, fonksiyon, ortam değişkeni veya harici API çağrısı içermez; yalnızca veri sağlayan bir sözlük olarak görev yapar.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon, metot veya sınıf bulunmamaktadır. Modülün tüm içeriği, projenin dil yükleme mekanizması tarafından içe aktarılmak üzere tanımlanmış, Unicode karakter kodlamasıyla yazılmış bir anahtar-değer çiftleri koleksiyonundan (nesnesinden) ibarettir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül saf bir statik veri modülüdür (sözlük/taslak) — çalıştırılabilir fonksiyon içermez. Aksiyomlar, i18n altyapısının bu modüle yönelik beklediği yapısal koşulları tanımlar.

---

**[Aksiyom 1]:** Eğer `tr` sabit nesnesi olarak dışa aktarılan bir nesne yoksa, Türkçe dil dosyası i18n yükleyici tarafından yüklenemez ve uygulama arayüzünde Türkçe metinler boş/hata durumunda kalır.

**[Aksiyom 2]:** Eğer `tr` nesnesi bir JavaScript nesnesi (`object`) yapısında değilse (örn. `null`, `undefined`, bir dizi veya primitif tür olarak export edilmişse), i18n sözlük çözümleme aşamasında tip hatası oluşur.

**[Aksiyom 3]:** Eğer `tr` nesnesindeki herhangi bir çeviri anahtarı için karşılık gelen değer bir `string` türünde değilse (örn. `number`, `undefined`, `null` olarak tanımlıysa), arayüzde o anahtarın bulunduğu noktada beklenmeyen gösterim hatası meydana gelir.

**[Aksiyom 4]:** Eğer `tr` nesnesi proyectojecte tanımlı i18n anahtar yapısının beklediği zorunlu üst düzey anahtarları içermiyorsa (örn. sayfa adları, buton metinleri, hata mesajları), ilgili arayüz bileşenlerinde çeviri bulunamaz ve fallback mekanizması devreye girer veya hata görüntülenir.

**[Aksiyom 5]:** Eğer bu dosya `import`/`export` sözdizimiyle модül olarak dışa aktarılmıyorsa (örn. `export const tr = {...}` şeklinde değilse), i18n yükleyici modülü bulamaz ve `tr` sözlüğü kullanılabilir hale gelmez.

---

**Not:** Bu modülde herhangi bir fonksiyon gövdesi bulunmadığından, aksiyomlar yalnızca modülün yapısal ve dışa aktarım koşullarına yöneliktir. Modülün çalıştırma zamanı davranışı yoktur; salt veri sağlayıcıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **tr** (object) — `{
  common: {
    addToProject: 'Proje Listesine Ekle',
    loadingApp: 'Vent...`

---

## AST POINTERS

Bu dosyada fonksiyon tanımlı değildir.

### Dosya Yapısı

**Dosya tipi**: TypeScript çeviri sözlüğü (i18n dictionary)

**Import**:
- `admin` — `'./admin/tr'` yolundan içe aktarılan admin çevirileri nesnesi

**Sabit**:
- `tr` — Türkçe çeviri anahtar-değer çiftlerini içeren nesne; uygulamanın Türkçe dil dosyasıdır

**Fonksiyon gövdeleri**: Yok

**Return**: Yok (nesne dışa aktarılır)

---

**Not**: Bu dosya fonksiyon içermemektedir. Yalnızca `admin` modülünden import edilen çeviriler ve yerel Türkçe çeviri anahtarları bir `tr` nesnesinde toplanarak dışa aktarılır. AST Pointer üretimi için fonksiyon gövdesi gerekli olup, mevcut yapı bir modül dışa aktarma/nesne tanımıdır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: tr