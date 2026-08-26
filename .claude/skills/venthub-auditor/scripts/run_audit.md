---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\.claude\skills\venthub-auditor\scripts\run_audit.py
skeleton_hash: ad9c225d14a08fb7
entity_hashes:
  func:run_audit: 74a6b6574710854f
  overview: 978262b0b7b8a41f
generated_at: 2026-08-25T07:22:58Z
---

## Genel Bakış

Bu modül, belirtilen bir dizinde denetim (audit) işlemi yürütmekten sorumludur. Modül, tek bir dışa açık fonksiyon içerir ve varsayılan olarak `src` dizinini hedef alır. Modülün amacı, projenin kaynak kodunun belirli kurallara uygunluğunun otomatik olarak denetlenmesini sağlamaktır.

## Fonksiyon Grupları

### Denetim Çalıştırma

Hedef dizini parametre olarak alıp denetim sürecini başlatan ana işlevi sağlar. Varsayılan hedef dizin `src` olarak belirlenmiştir; bu sayede parametre verilmeden çağrıldığında kaynak kod dizinini otomatik olarak denetler.

- run_audit

## Bağımlılıklar ve Mimari Notlar

Modülün iç ve dış bağımlılıkları hakkında verilen kaynakta ayrıntılı bilgi bulunmamaktadır. Modülün hangi denetim kurallarını uyguladığı, hangi alt modülleri veya araçları kullandığı bilinmiyor. Tek fonksiyonlu ve basit bir yapıya sahip olması, bu modülün bir giriş noktası (entry point) veya orkestratör olarak görev yaptığını düşündürmektedir; ancak kesin mimari rolü yalnızca kaynak kod incelenerek doğrulanabilir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### run_audit
**Ne yapar**: Belirtilen dizindeki TypeScript ve TSX dosyalarını tarayarak teknik borç denetimi gerçekleştirir. Tespit edilen sorunları dosya adı, satır numarası, kural adı, önem derecesi ve kod parçası bilgileriyle birlikte raporlar. Hiçbir sorun bulunamazsa başarılı mesajı görüntüler, aksi halde bulunan sorunları önem derecesine göre sıralayarak konsola yazdırır.

**Nasıl yapar**: `os.walk` ile `target_dir` dizinini özyinelemeli olarak dolaşır ve `.tsx` ile `.ts` uzantılı dosyaları filtreler. Her dosyayı UTF-8 kodlamasıyla okuyup içeriğini satırlara böler. Modül seviyesinde tanımlı `AUDIT_RULES` listesindeki her kural için `re.finditer` ile regex eşleştirmesi yapar. Eşleşmenin bulunduğu satır numarasını, eşleşme pozisyonundan önceki yeni satır karakterlerini sayarak hesaplar. Her eşleşme için dosya yolu, satır numarası, kural adı, önem derecesi ve ilgili satırın kırpılmış metnini içeren bir sözlük oluşturup `results` listesine ekler. Dosya okuma sırasında oluşan herhangi bir hata yakalanır ve konsola hata mesajı olarak yazdırılır, işlem diğer dosyalarla devam eder. Tarama tamamlandığında sonuçlar önem derecesine (`severity`) göre azalan sırada sıralanır ve dosya bazlı gruplanarak konsola raporlanır. Her dosya başlığının altında ilgili satırların bilgileri ve kod parçalarının ilk 80 karakteri görüntülenir.

**Parametreler**:
- `target_dir`: `str` — Taranacak kök dizin yolu. Varsayılan değeri `"src"` olarak atanmıştır.

**Dönüş**: Fonksiyon açıkça bir değer döndürmez. Yan etki olarak konsola denetim bilgilendirme mesajlarını, tespit edilen sorunların detaylı listesini ya da sorun bulunamadığına dair başarılı mesajını yazdırır.

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
- **params**:
  - `target_dir` — varsayılan değeri `"src"`; denetlenecek kök dizin yolu
- **ic_degiskenler**:
  - `results` — boş liste olarak başlatılır; bulunan tüm sorun kayıtlarını toplar
  - `root` — `os.walk(target_dir)` döngüsünden gelen mevcut dizin yolu
  - `_` — `os.walk` döngüsünden gelen alt dizin listesi; kullanılmaz
  - `files` — `os.walk` döngüsünden gelen mevcut dizindeki dosya adları listesi
  - `file` — `files` listesindeki tek tek dosya adı
  - `file_path` — `os.path.join(root, file)` ile oluşturulan tam dosya yolu
  - `f` — `open(file_path, 'r', encoding='utf-8')` ile açılan dosya nesnesi (context manager)
  - `content` — `f.read()` ile okunan dosya içeriği (string)
  - `lines` — `content.splitlines()` ile elde edilen satır listesi
  - `rule` — `AUDIT_RULES` listesindeki her bir kural sözlüğü; `"pattern"`, `"name"`, `"severity"` anahtarlarına sahip
  - `matches` — `re.finditer(rule["pattern"], content)` ile üretilen regex eşleşmeleri iterator'ı
  - `match` — iterator'dan gelen tek bir regex eşleşme nesnesi; `match.start()` kullanılır
  - `line_no` — `content.count('\n', 0, match.start()) + 1` ile hesaplanan eşleşmenin satır numarası
  - `snippet` — `lines[line_no - 1].strip()` ile alınan eşleşen satırın metni
  - `e` — `except Exception` ile yakalanan hata nesnesi
  - `r` — `results` listesindeki her bir sonuç sözlüğü; `"file"`, `"line"`, `"rule"`, `"severity"`, `"snippet"` anahtarlarına sahip
  - `current_file` — raporlama döngüsünde dosya gruplaması için kullanılan mevcut dosya yolu takipçisi; başlangıçta boş string
- **Dönüş**: yok (None); yan etki olarak konsola denetim raporu yazar, dosya sistemi üzerinde `os.walk` ve `open` ile salt okuma yapar

---

## NODE ID STANDARD

  file: run_audit.py
  function: run_audit.py::run_audit

---

## DISA AKTARILANLAR (EXPORTS)
  export: run_audit