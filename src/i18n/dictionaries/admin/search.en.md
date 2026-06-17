---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\search.en.ts
skeleton_hash: bb494dbf43a43a58
entity_hashes:
  overview: fc6cf9147f6079c3
generated_at: 2026-06-17T13:23:01Z
---

## Genel Bakış

Bu dosya, admin panelinin arama arayüzündeki İngilizce metinlerini içeren bir çeviri sözlüğüdür. Modül, search ile ilgili tüm UI etiketlerini, placeholder'ları ve mesajları `search` nesnesi altında merkezi olarak tanımlar. Bu sayede arama arayüzündeki metinler tek bir yerden yönetilir ve farklı dillere kolayca uyarlanabilir.

## Modül Yapısı

Bu dosya bir işlev (fonksiyon) içermemektedir. Salt veri tanımlaması yapan bir sözlük modülüdür.

### Dışa Aktarılan Sabitler

- `search` — Admin panelindeki arama arayüzünde kullanılan tüm metinlerin (başlıklar, placeholder'lar, etiketler, hata mesajları vb.) İngilizce karşılıklarını barındıran nesne. `src/i18n` yapılandırmasının bir parçası olarak çeviri sistemi tarafından otomatik olarak yüklenir ve kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n (uluslararasılaştırma) sözlük dosyasıdır ve statik çeviri verisi içerir.

[Aksiyom 1]: Eğer `search` nesnesi export edilmemiş veya tanımsız ise, search bileşenindeki tüm çeviri metinleri (`t('search.xxx')` çağrıları) hata verir veya boş/çevrilmemiş anahtar adlarını gösterir.

[Aksiyom 2]: Eğer `search` object'inin içindeki bir çeviri anahtarı (örn: `placeholder`, `title` vb.) eksik veya null ise, ilgili UI alanlarında çeviri yerine undefined/boş görüntülenir.

[Aksiyom 3]: Eğer bu dosya doğru locale (dil) klasörüne yerleştirilmemişse (örn: `admin/search.en.ts` yerine yanlış dil klasöründe ise), yanlış dildeki çeviriler kullanılır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **search** (object) — `{
      audit: 'Search by table, PK or note',
      errors: 'Search by URL ...`

---

## AST POINTERS

Bu dosyada fonksiyon gövdesi bulunmamaktadır.

**Neden:** Dosya, `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\search.en.ts` konumunda bir **i18n sözlük dosyasıdır**. İçerik bir `search` nesnesi (object) içerir; bu nesne admin panelindeki arama arayüzü için İngilizce çeviri anahtarları ve değerleri barındırır.

| Özellik | Durum |
|---|---|
| Import | Yok |
| Sınıf | Yok |
| Fonksiyon | Yok |
| Sabit | `search` — nesne (key-value çeviriler) |

**Sonuç:** Fonksiyon gövdesi tanımlı olmadığından, parametre, iç değişken ve dönüş analizi yapılamaz. Dosya salt veri (çeviri sözlüğü) yapısı içerir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\search.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: search