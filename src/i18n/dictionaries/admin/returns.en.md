---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\returns.en.ts
skeleton_hash: 96bd8b6071281ec2
entity_hashes:
  overview: f74c60dbdfef5408
generated_at: 2026-08-16T07:34:14Z
---

## Genel Bakış
Bu modül, HVAC uygulamasının Admin panelindeki "İadeler" (Returns) bölümü için İngilizce dil dosyasıdır. Sistemdeki iadelerle ilgili tüm arayüz metinlerinin, hata iletilerinin ve bildirimlerin İngilizce karşılıklarını merkezi bir sözlük yapısında tanımlar.

## Fonksiyon Grupları
Bu dosyada fonksiyon bulunmamaktadır; yalnızca modül-seviyesinde bir sözlük (dictionary) nesnesi tanımlanmıştır. Dolayısıyla fonksiyon grupları oluşturulamaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n çeviri sözlüğü (data object) olup, fonksiyon gövdesi içermemektedir. Dolayısıyla bu modül için iş mantığına dayalı mimari aksiyom tanımlanmamıştır.

**Not:** Modül, `admin/returns.en.ts` dosyasında yer alan `returns` adlı bir çeviri nesnesinden ibarettir. Bu bir veri yapısı olduğu için;
- Koşullu akış,
- Veri dönüşümü,
- Hata yönetimi,
- İş mantığı kararları

içermemektedir. Bu nedenle "Eğer ... yoksa, ... olur." formatında üretilecek bir mimari aksiyom bulunmamaktadır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **returns** (object) — `{
      total: 'Total: {{count}} return requests',
      subtitle: 'Track r...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/returns.en.ts
- **params**: yok (fonksiyon değil — sabit obje export'u)
- **ic_degiskenler**: yok
- **Dönüş**: yok — dosya bir `returns` objesi export eder (i18n çeviri sözlüğü)

> **Not**: Bu dosyada fonksiyon bulunmamaktadır. Dosya yapısı itibarıyla bir i18n (uluslararasılaştırma) sözlük dosyasıdır ve yalnızca `returns` adında bir sabit obje export eder. Objeyi oluşturan value'lar (`string` literal'ler) bir AST Pointer kapsamında analiz edilmez — sabit değer tanımıdır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\returns.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: returns