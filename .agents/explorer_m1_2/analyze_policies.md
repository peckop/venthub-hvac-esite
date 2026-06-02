---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\analyze_policies.js
skeleton_hash: ada75597a89f4da9
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-06-02T07:43:37Z
---

## Genel Bakış
Bu modül, bir HVAC veya politika analiz sisteminin parçası olarak çalışan bir Otomatik Politika Analiz Aracıdır. Script, dosya sisteminden politika tanımlarını okur ve önceden tanımlanmış kurallar kümesine göre analiz ederek potansiyel çelişkileri veya uyumsuzlukları tespit eder. Elde ettiği bulguları doğrudan konsola (terminal çıktısına) yazdırarak operatörlere geri bildirim sağlar.

## Modül Yapısı
Dosya, bağımsız bir komut satısı betiği (script) olarak çalışır ve herhangi bir dış fonksiyon ihracatı yapmaz. Temel işlevselliği, dosya sisteminden ham politika verilerini okumak ve üzerinde bir dizi hardcoded (kod içi) politika kuralı (örn. `r4Policies`) uygulayarak analiz gerçekleştirmektir. Analiz süreci, dosya okuma (`fs` modülü) ve önceden tanımlanmış tablo/alan ilgi alanları (`tablesOfInterest`) kullanılarak yürütülür.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için üretilecek mimari varsayımlar yetersizdir. Aşağıdaki nedenlerle anlamlı aksiyom türetilememektedir:

**Bilgi Eksiklikleri:**

1. **Fonksiyon gövdesi mevcut değil:** Kaynak tipi `doc` olarak belirtilmiş olup, modül kodu (fonksiyon gövdeleri) paylaşılmamıştır. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir.

2. **Fonksiyon imzaları belirtilmemiş:** Fonksiyon imzaları bölümü "yok" olarak verilmiştir.

**Modül Sabitlerinden Çıkarılamayan Bilgiler:**

Modülde tanımlı sabitler mevcuttur ancak bu sabitlerin nasıl kullanıldığı (fonksiyon gövdesi) görünmediği için varsayım üretmek spekülatif olur:

- `r4Policies` (array) – FHIR R4 politika listesi olduğu varsayılsa da, beklenen yapı ve içeriği bilinmemektedir
- `scan` (call) – Tarama fonksiyonu olduğu varsayılsa da, parametreleri ve dönüş tipi bilinmemektedir
- `tablesOfInterest` (call) – İlgi tablolarını döndüren fonksiyon olduğu varsayılsa da, dönüş yapısı bilinmemektedir

---

**Sonuç:** Fonksiyon gövdeleri paylaşıldığında mimari varsayımlar üretilebilir. Mevcut bilgiyle yalnızca şu genel aksiyom belirtilebilir:

[Aksiyom 1]: Eğer `r4Policies`, `scan` veya `tablesOfInterest` modül bağımlılıkları tanımsız veya erişilemez ise, modül çalışma zamanında hata verir.

> ⚠️ **Not:** Bu tek aksiyom dahi, sadece sabitlerin varlık koşuluna dayanmaktadır. Gerçek mimari aksiyomlar için fonksiyon gövdelerine ihtiyaç vardır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **r4Policies** (array) — `[
  { table: 'coupons', name: 'coupons_public_select' },
  { table: 'coupons'...`
- **scan** (call) — `JSON.parse(fs.readFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\explorer...`
- **tablesOfInterest** (call) — `Array.from(new Set(r4Policies.map(p => p.table)))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: analyze_policies.js::p_anonim_fonk
- **params**: `p` — polis bilgisi nesnesi (`{ table, name }` yapıında beklenir)
- **ic_degiskenler**:
  - `found` — `scan` array'inde `tablename === p.table` VE `policyname === p.name` koşulunu sağlayan ilk eleman; polisin varsa referans nesnesi, yoksa `undefined`
- **Dönüş**: yok; `console.log` ile `[PRESENT]` veya `[ABSENT]` durumunu yazdırır

---

### [N2_NASIL] AST Pointer: analyze_policies.js::t_anonim_fonk
- **params**: `t` — tablo adı (string)
- **ic_degiskenler**:
  - `merged` — `scan` array'inden `tablename === t` VE `policyname.startsWith('merged_')` koşulunu sağlayan tüm elemanları içeren filtrelenmiş dizi; birleşik politikaların listesi
- **Dönüş**: yok; `console.log` ile tablonun merged_* politika durumunu ve varsa detaylarını yazdırır

---

### [N3_NASIL] AST Pointer: analyze_policies.js::m_anonim_fonk
- **params**: `m` — tek bir merged politika nesnesi (`{ policyname, roles }` yapıında beklenir)
- **ic_degiskenler**:
  - `rolesStr` — `m.roles` bir dizi (`Array`) ise elemanlarının virgülle birleştirilmiş hali, değilse `m.roles`'ün doğrudan string karşılığı; log satırında gösterim için hazırlanmış roller dizgesi
- **Dönüş**: yok; `console.log` ile politika adı ve rolleri yazdırır (bu fonksiyon `t_anonim_fonk` içindeki `merged.forEach` callback'i olarak çalışır)

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\analyze_policies.js