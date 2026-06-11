---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agent\skills\venthub-auditor\scripts\run_audit.py
skeleton_hash: 2f9d9badff22741e
entity_hashes:
  func:run_audit: 74a6b6574710854f
  overview: 978262b0b7b8a41f
generated_at: 2026-06-08T18:33:54Z
---

## Genel Bakış

Bu modül, VentHub projesinin kod kalitesi ve standartlara uygunluk denetimini (audit) başlatmak için tasarlanmış tek fonksiyonlu bir araçtır. Verilen hedef dizindeki kaynak kodları tarayarak denetim sonuçlarını üretir.

## Fonksiyon Grupları

### Denetim Çalıştırma
Tek sorumluluğu, belirtilen hedef dizin varsayılan olarak "src" olmak üzere, projenin denetim sürecini başlatmaktır.
- run_audit

---

## AXIOMS – Mimari Varsayımlar

Bu modül, belirtilen bir dizindeki HVAC kaynak kodunu denetlemek için kurallar listesi üzerinde bir audit (denetim) işlemi yürütür.

[Aksiyom 1]: Eğer `target_dir` parametresi geçerli bir dizin yolunu temsil etmiyorsa veya belirtilen dizin mevcut değilse, audit işlemi başarısızlıkla sonuçlanır veya beklenmeyen davranışlar gözlemlenebilir.

[Aksiyom 2]: Eğer `AUDIT_RULES` sabiti tanımlanmamış, boş bir liste ise veya beklenen formatta (geçerli audit kuralları içeren) değilse, denetim işlemi anlamlı sonuçlar üretmez veya hiç kural çalıştırılamaz.

[Aksiyom 3]: Eğer `target_dir` içinde递归 olarak taranacak kaynak dosyalar (örneğin `.py` dosyaları) bulunamıyorsa, hiçbir kural uygulanamaz ve audit sonucu boş veya anlamsız olur.

[Aksiyom 4]: Eğer `AUDIT_RULES` içindeki kurallar, hedef dizindeki dosya tipleriyle uyumlu değilse (örneğin Python dışı dosyaları tarayan kurallar Python dosyalarına uygulanmaya çalışılırsa), kural ihlalleri yanlış tespit edilebilir veya kural çalışmaz.

[Aksiyom 5]: Eğer audit sırasında dosya okuma/erişim izinleri yetersizse, ilgili dosyalar denetlenemez ve eksik raporlar oluşur.

---

## FONKSİYON DETAYLARI

### run_audit

**Ne yapar**: Verilen hedef dizindeki TypeScript ve TSX dosyalarını tarayarak teknik borç (technical debt) sorunlarını tespit eder ve konsola detaylı bir rapor oluşturur.

**Nasıl yapar**: Fonksiyon `os.walk` ile dizin ağacını dolaşarak sadece `.tsx` ve `.ts` uzantılı dosyaları işler. Her dosyanın içeriği okunarak `AUDIT_RULES` listesinde tanımlı düzenli ifadeler (regex) ile eşleştirilir. Eşleşmelerden elde edilen satır numaraları, kural adları, ciddiyet seviyeleri ve kod snippetleri bir results listesinde toplanır. Bulunan sonuçlar ciddiyet seviyelerine göre azalan sırada sıralanarak dosya bazlı gruplanmış şekilde konsola yazdırılır. Dosya okuma sırasında oluşan hatalar yakalanır ve hata mesajı ile devam edilir.

**Parametreler**:
- target_dir: string (varsayılan: "src") — Taranacak hedef dizinin yolu, alt dizinler dahil recursive olarak işlenir

**Dönüş**: None — Fonksiyon doğrudan konsola rapor yazdırır, herhangi bir değer döndürmez

**Kullanılan Dış Bağımlılıklar**:
- `AUDIT_RULES`: Regex tabanlı denetim kuralları içeren liste (dışarıdan tanımlı)
- `os`, `re`: Python standart kütüphane modülleri

**Notlar**:
- Ciddiyet seviyeleri string olarak karşılaştırılır (alfabetik sıralama: "high" > "low" > "medium")
- Her buluntu için maksimum 80 karakterlik kod snippeti gösterilir
- Dosya başına birden fazla ihlal bulunabilir

---

## SABİTLER
- **AUDIT_RULES** (list)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/run_audit.py::run_audit
- **params**: `target_dir` — Tarama yapılacak dizin yolu, varsayılan "src"
- **ic_degiskenler**:
  - `results` — Bulunan denetim sorunlarını tutan sözlük listesi
  - `root` — os.walk'un döndürdüğü mevcut dizin yolu
  - `file` — os.walk'un döndürdüğü dosya adı
  - `file_path` — os.path.join ile oluşturulmuş tam dosya yolu
  - `f` — open() ile açılmış dosya nesnesi
  - `content` — Dosyanın tüm metin içeriği
  - `lines` — content.splitlines() ile oluşturulmuş satır listesi
  - `rule` — AUDIT_RULES listesinden iterasyonla alınan kural sözlüğü
  - `matches` — re.finditer ile content içinde bulunan eşleşme iterator'ı
  - `match` — re.finditer Iterator'ın döndürdüğü mevcut eşleşme nesnesi
  - `line_no` — match.start() konumundan hesaplanan satır numarası (1-bazlı)
  - `snippet` — lines[line_no - 1].strip() ile elde edilmiş temiz satır metni
  - `e` — except bloğunda yakalanmış Exception nesnesi
  - `results.sort(key=lambda x: x["severity"], reverse=True)` — severity anahtarına göre azalan sıralama (yan etki)
  - `current_file` — Raporlama döngüsünde bir önceki dosyayı tutan izleme değişkeni
  - `r` — results listesinin raporlama döngüsündeki mevcut sözlük elemanı
- **Dönüş**: yok (yan etki: konsola denetim raporu yazdırır)

---

## NODE ID STANDARD

  file: .agent\skills\venthub-auditor\scripts\run_audit.py
  function: .agent\skills\venthub-auditor\scripts\run_audit.py::run_audit

---

## DISA AKTARILANLAR (EXPORTS)
  export: run_audit