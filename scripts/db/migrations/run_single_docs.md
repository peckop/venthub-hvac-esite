---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\run_single_docs.py
skeleton_hash: 797f3f41cd0e4f88
entity_hashes:
  func:main: 9514c3998027d7fc
  overview: 8ea896fbd12c88bb
generated_at: 2026-05-30T21:38:33Z
---

## Genel Bakış

Bu modül, veritabanı dokümantasyonu ile ilgili tekil migrasyon senaryolarını çalıştıran bağımsız bir scripttir. Tek bir `main()` fonksiyonu üzerinden tüm iş akışını yönetir.

## Fonksiyon Grupları

### Giriş Noktası
Scriptin tek fonksiyonu olan `main()`, modülün çalışma zamanı giriş noktasıdır. Tüm bağımlılıkları çözerek ilgili doküman migrasyonunu çalıştırır.

- `main`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için **fonksiyon gövdesine erişim olmadan** mimari varsayımlar belirlenememiştir.

### Gerekçe:

1. **`main()` fonksiyonu** – Parametresiz, geri dönüş değeri belirsiz
2. **Modül sabitleri** – Tanımlı değil
3. **Fonksiyon gövdesi** – Sağlanmamış

### Bilinen Sınırlı Bilgiler:

| Özellik | Değer |
|---------|-------|
| Dosya yolu | `scripts/db/migrations/run_single_docs.py` |
| Tahmini amaç | Veritabanı migration çalıştırıcı |
| Fonksiyon sayısı | 1 (`main()`) |

### Sonuç:

Fonksiyon gövdesi (implementation) verilmediği için güvenilir aksiyom üretilemez. Mimari varsayımlar için:

- Fonksiyon gövdesinin içeriği, veya
- Modülün kullandığı import'lar ve bağımlılıklar

sağlanmalıdır.

> ⚠️ **Not:** Dosya yolundan "migration" olduğu tahmin edilebilir ancak talimatlar gereği **dosya adından veya docstring'den bilgi çıkarılamaz**, sadece fonksiyon gövdesinden üretilen bilgiler kullanılabilir.

---

## FONKSİYON DETAYLARI

### main

**Ne yapar**: Belirlenmiş 23 adet kaynak dosya için `orion doc` aracını kullanarak zorunlu belge (single doc) üretimi gerçekleştirir. Her dosya sırayla kontrol edilir, varsa belgeleme komutu çalıştırılır ve sonuç konsola loglanır.

**Nasıl yapar**: Fonksiyon öncelikle `__file__` yolunu kullanarak repo kök dizinini (3 üst dizin) hesaplar. Ardından üzerinde çalışılacak tüm dosya yollarını içeren statik bir liste tanımlar. Bu liste üzerinden tek tek geçerek her dosyanın varlığını doğrular, varsa `orion doc single --force --py-file` komutunu `subprocess.run` ile çalıştırır. Komutun stdout ve stderr çıktısı yakalanarak success/fail durumu konsola yazdırılır. Dosya mevcut değilse o dosya atlanır.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: Fonksiyon herhangi bir değer döndürmez (None/void). Tüm durum bilgisi stdout üzerinden print ifadeleri ile raporlanır.

---

## NODE ID STANDARD

  file: scripts\db\migrations\run_single_docs.py
  function: scripts\db\migrations\run_single_docs.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main