---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-scrubber\scripts\board\lane-precommit.cjs
skeleton_hash: d4c0796eed49c7f2
entity_hashes:
  func:git: 54ebb1b91650594e
  func:uyar: 2609a0863cdeff03
  overview: 6661e886022531fb
generated_at: 2026-08-31T10:14:18Z
---

## Genel Bakış

Bu modül, pre-commit kontrol sürecinde kullanılan yardımcı fonksiyonları içerir. Modül adındaki "lane" terimi, dal/şerit bazlı bir iş akışı konseptine işaret eder. Modül, git komutlarını çalıştırmak ve kullanıcıya uyarı mesajları göstermek için iki temel yardımcı fonksiyon sağlar.

## Fonksiyon Grupları

### Git Komutları
Git CLI ile etkileşimi sağlayan yardımcı fonksiyonu içerir. Bu fonksiyon, modülün pre-commit kontrolleri sırasında git komutlarını çalıştırabilmesini temel alır.
- git

### Bildirim ve Uyarılar
Kullanıcıya uyarı mesajları göstermek için kullanılan fonksiyonu içerir. Pre-commit sürecinde ortaya çıkan hata veya uyarı durumlarında bilgilendirme sağlar.
- uyar

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### git
**Ne yapar**: Bu fonksiyonun görevi verilen bilgilerden anlaşılamamaktadır. Fonksiyon adı `git` ve parametre olarak `args` almaktadır. Ancak fonksiyonun ne iş yaptığına dair bir docstring veya ek bilgi sağlanmamıştır.
**Nasıl yapar**: Fonksiyonun iç mantığı bilinmiyor. Kaynak kodda bu fonksiyonun gövdesi veya nasıl çalıştığına dair bir açıklama yer almamaktadır.
**Parametreler**:
- args: bilinmiyor — Parametre hakkında detaylı bilgi (tipi, amacı) verilmemiştir.
**Dönüş**: Dönüş tipi bilinmiyor. Fonksiyonun bir değer döndürüp döndürmediği belirtilmemiştir.

### uyar
**Ne yapar**: Bu fonksiyonun görevi verilen bilgilerden anlaşılamamaktadır. Fonksiyon adı `uyar` ve parametre olarak `s` almaktadır. Ancak fonksiyonun ne iş yaptığına dair bir docstring veya ek bilgi sağlanmamıştır.
**Nasıl yapar**: Fonksiyonun iç mantığı bilinmiyor. Kaynak kodda bu fonksiyonun gövdesi veya nasıl çalıştığına dair bir açıklama yer almamaktadır.
**Parametreler**:
- s: bilinmiyor — Parametre hakkında detaylı bilgi (tipi, amacı) verilmemiştir.
**Dönüş**: Dönüş tipi bilinmiyor. Fonksiyonun bir değer döndürüp döndürmediği belirtilmemiştir.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **path** (call) — `require('path')`
- **birlestirmeHali** (call) — `(() => {
  for (const ad of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD'...`
- **kimlikYolu** (call) — `path.join(gitDir, 'venthub-sid')`
- **kimlikCozum** (call) — `kimlik.coz(gitDir, board)`
- **sid** (member_expression) — `kimlikCozum.sid`
- **kok** (call) — `path.resolve(__dirname, '..', '..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/board/lane-precommit.cjs::anonim_ok_fonksiyon
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ad` — `['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']` dizisindeki her bir elemanı sırayla alır; `gitDir` dizininde bu isimde bir dosya olup olmadığını kontrol etmek için kullanılır
  - `gitDir` — fonksiyon gövdesinde kullanılır ama tanımlı değildir; dış kapsamdan (closure) gelir, `fs.existsSync(path.join(gitDir, ad))` çağrısında birleştirilecek dizin yolunu temsil eder
  - `fs` — sabitler bölümünde tanımlı; `fs.existsSync(...)` ile dosya/dizin varlık kontrolü yapar
  - `path` — sabitler bölümünde tanımlı; `path.join(gitDir, ad)` ile dizin yolu ile dosya adını birleştirir
- **Dönüş**: `gitDir` dizininde bulunan ilk eşleşen dosya adı (string: `'MERGE_HEAD'`, `'CHERRY_PICK_HEAD'` veya `'REVERT_HEAD'`); hiçbir dosya bulunamazsa `null`. `fs.existsSync` hata fırlatırsa yakalanır ve döngü bir sonraki elemana geçer (fail-normal davranışı).

---

## NODE ID STANDARD

  file: scripts\board\lane-precommit.cjs
  function: scripts\board\lane-precommit.cjs::git
  function: scripts\board\lane-precommit.cjs::uyar

---

## DISA AKTARILANLAR (EXPORTS)
  export: git
  export: uyar