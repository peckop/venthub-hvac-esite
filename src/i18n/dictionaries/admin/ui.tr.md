---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\ui.tr.ts
skeleton_hash: 08cbe9912f9ca2fd
entity_hashes:
  overview: 1ca0cb4cc145d139
generated_at: 2026-06-13T11:18:33Z
---

## Genel Bakış
Bu dosya, admin panelinin arayüz metinleri için Türkçe çeviri sözlüğünü tanımlar. `ui` adında bir nesne ihracat eder ve bu nesne, admin arayüzündeki başlıklar, etiketler, mesajlar gibi statik metinleri bir harita (sözlük) yapısında sunar. Dil dosyası statik olduğundan, ortam değişkeni veya API kullanımı içermez; sadece ön yüz metinlerini tutar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir uluslararasılaştırma (i18n) sözlük dosyasıdır ve `ui` nesnesi aracılığıyla Türkçe arayüz metinlerini içerir. Fonksiyon gövdesi bulunmadığı için kod tabanlı aksiyom üretilemez; ancak modülün doğru çalışması için aşağıdaki yapısal varsayımlar geçerlidir:

---

**[Aksiyom 1]:** Eğer `ui` nesnesinin herhangi bir metin değeri (`string`) yanlış türde (örn: `number`, `null`, `undefined`) ise, arayüzde ilgili yerde `undefined` görünür veya render hatası oluşur.

**[Aksiyom 2]:** Eğer modül dışa aktarımda (`export`) `ui` nesnesi dışındaki bir isim kullanılıyorsa veya `ui` ismi değiştirilirse, bu sözlüğü tüketen tüm bileşenlerde derleme hatası oluşur.

**[Aksiyom 3]:** Eğer bir metin anahtarı (key) silinir veya adı değiştirilirse, o anahtarı kullanan tüm arayüz bileşenlerinde eksik veya hatalı metin görüntülenir.

**[Aksiyom 4]:** Eğer `ui` nesnesi boş bir nesne (`{}`) olarak tanımlanırsa, admin arayüzünün tüm metin alanları boş kalır.

---

> **Not:** Bu dosya salt veri (translation dictionary) içerdiğinden, iş mantığı aksiyomları üretmek için yeterli kod yapısı mevcut değildir. Yukarıdaki varsayımlar modülün yapısal bağımlılıklarına dayanmaktadır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **ui** (object) — `{
      accessDeniedDesc: 'Bu sayfaya erişmek için yönetici yetkileri gerekli...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

**Dosya Analizi:**
- `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\ui.tr.ts` dosyası bir **i18n sözlük/çeviri dosyasıdır**
- Dosya içinde yalnızca `ui` sabit (object) tanımlı olup bu bir çeviri stringleri sözlüğüdür
- Fonksiyon imzası: **yok**
- Fonksiyon gövdesi: **yok**
- Class tanımı: **yok**

| Öğe | Durum |
|-----|-------|
| Fonksiyon Sayısı | 0 |
| Import | Yok |
| Class | Yok |
| Fonksiyon Gövdesi | Yok |

**Sonuç:** Bu dosya yapısal olarak AST Pointer gerektirecek fonksiyon içermemektedir. Dosya yalnızca `{ [key: string]: string }` tipinde bir çeviri nesnesi içermektedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\ui.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ui