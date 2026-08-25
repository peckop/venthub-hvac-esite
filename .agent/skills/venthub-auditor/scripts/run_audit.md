---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\.agent\skills\venthub-auditor\scripts\run_audit.py
skeleton_hash: b73a5724cee6c9bb
entity_hashes:
  func:run_audit: 74a6b6574710854f
  overview: 978262b0b7b8a41f
generated_at: 2026-08-25T07:23:03Z
---

## Genel Bakış

Bu modül, bir denetim (audit) sürecini çalıştırmak için tek bir giriş noktası sağlar. Varsayılan olarak "src" dizinini hedef alır ve belirtilen dizin üzerinde denetim işlemini başlatır.

## Fonksiyon Grupları

### Denetim Çalıştırıcı

Modülün tek sorumluluğudur: verilen hedef dizin üzerinde bir denetim süreci yürütmek. Dizin parametresi verilmezse "src" dizini kullanılır.

- run_audit

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### run_audit
**Ne yapar**: Belirtilen dizin ağacındaki TypeScript ve TSX dosyalarını tarayarak, önceden tanımlı `AUDIT_RULES` kurallarına göre teknik borç (technical debt) denetimi gerçekleştirir. Tespit edilen sorunları severity (önem derecesi) bazında sıralayarak konsola raporlar.

**Nasıl yapar**: `os.walk` ile `target_dir` dizinini özyinelemeli (recursive) olarak dolaşır. Yalnızca `.tsx` ve `.ts` uzantılı dosyaları işler. Her dosyayı UTF-8 kodlamasıyla okuyup içeriğini satırlara böler. Daha sonra `AUDIT_RULES` listesindeki her kural için `re.finditer` ile regex eşleşmeleri arar. Her eşleşme için `content` içindeki newline karakterlerini sayarak satır numarasını hesaplar ve eşleşen satırın metnini (snippet) çıkarır. Bulunan her sorun, dosya yolu, satır numarası, kural adı, severity ve kod snippet'i ile birlikte `results` listesine eklenir. Dosya okuma sırasında oluşan hatalar yakalanarak konsola yazdırılır ve taramaya devam edilir. Tarama tamamlandığında, sonuç yoksa "Grade A" mesajı basılır; sonuç varsa severity değerine göre azalan sırayla sıralanır ve her dosya için gruplanmış biçimde raporlanır. Her snippet en fazla 80 karakter gösterilir.

**Parametreler**:
- target_dir: str — Taranacak kök dizin yolu. Varsayılan değeri `"src"`.

**Dönüş**: Fonksiyon açıkça bir değer döndürmez (return ifadesi yoktur). Tüm çıktılar `print` ile konsola yazdırılır. Return tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: os
- import: re
- import: sys

---

## SABİTLER
- **AUDIT_RULES** (list)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/run_audit.py::run_audit
- **params**: `target_dir` — varsayılan değeri `"src"` olan dizin yolu
- **ic_degiskenler**:
  - `results` — boş liste olarak başlatılır; dosyalarda bulunan tüm kural ihlallerini toplar
  - `root` — `os.walk(target_dir)` tarafından üretilen mevcut dizin yolu
  - `_` — `os.walk(target_dir)` tarafından üretilen alt dizin listesi; kullanılmaz
  - `files` — `os.walk(target_dir)` tarafından üretilen dosya adı listesi
  - `file` — `files` listesindeki her bir dosya adı; `.tsx` veya `.ts` ile bitmiyorsa atlanır
  - `file_path` — `os.path.join(root, file)` ile oluşturulan tam dosya yolu
  - `f` — `open(file_path, 'r', encoding='utf-8')` ile açılan dosya nesnesi
  - `content` — `f.read()` ile okunan dosya içeriği (string)
  - `lines` — `content.splitlines()` ile dosya içeriğinin satırlara bölünmüş hali (liste)
  - `rule` — `AUDIT_RULES` listesindeki her bir kural sözlüğü
  - `matches` — `re.finditer(rule["pattern"], content)` ile elde edilen regex eşleşme yineleyicisi
  - `match` — `matches` yineleyicisindeki her bir eşleşme nesnesi
  - `line_no` — `content.count('\n', 0, match.start()) + 1` ile hesaplanan eşleşmenin satır numarası
  - `snippet` — `lines[line_no - 1].strip()` ile elde edilen eşleşen satırın metni
  - `e` — `except Exception` ile yakalanan hata nesnesi; hata mesajı olarak yazdırılır
  - `r` — `results` listesindeki her bir sonuç sözlüğü
  - `current_file` — raporlama sırasında tekrarlı dosya başlıklarını önlemek için kullanılan mevcut dosya yolu; başlangıçta boş string
- **Dönüş**: yok (None)
- **Dict erişimleri**:
  - `rule["pattern"]` — kuralın regex deseni
  - `rule["name"]` — kuralın adı
  - `rule["severity"]` — kuralın şiddet seviyesi
  - `r["file"]` — sonucun dosya yolu
  - `r["line"]` — sonucun satır numarası
  - `r["rule"]` — sonucun kural adı
  - `r["severity"]` — sonucun şiddet seviyesi
  - `r["snippet"]` — sonucun kod parçası (ilk 80 karakteri yazdırılır)
- **Subscript erişimleri**:
  - `lines[line_no - 1]` — satır listesinden eşleşmenin bulunduğu satırı alır
- **Modül seviyesindeki sabit**: `AUDIT_RULES` — kural listesi; her eleman `"pattern"`, `"name"`, `"severity"` anahtarlarına sahip sözlük
- **Yan etkiler**: `print()` ile bilgilendirme ve hata mesajlarını konsola yazar; dosya okuma işlemi yapar; `results` listesini şiddet seviyesine göre ters sıralar (`reverse=True`)

---

## NODE ID STANDARD

  file: run_audit.py
  function: run_audit.py::run_audit

---

## DISA AKTARILANLAR (EXPORTS)
  export: run_audit