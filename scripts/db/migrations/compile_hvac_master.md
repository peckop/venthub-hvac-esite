---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\compile_hvac_master.py
skeleton_hash: 5a589ee4cc02c8ce
entity_hashes:
  func:main: ef596e1cd7a0b625
  overview: 3f73623b21a576c5
generated_at: 2026-05-30T21:38:23Z
---

## Genel Bakış
Bu modül, HVAC (Isıtma, Havalandırma ve İklimlendirme) sisteminin master verilerini derleyen bir veritabanı migration scriptidir. Veritabanı şeması veya başlangıç verilerinin hazırlanması sürecini tek bir merkezi noktadan yönetir.

## Fonksiyon Grupları
### Ana Yürütme
Modülün tüm iş mantığını başlatan ve yürüten giriş noktasıdır.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için **fonksiyon gövdesine erişim olmadığından**, yalnızca fonksiyon imzasından çıkarılabilecek minimal aksiyomlar tanımlanmıştır. Modül adı (`compile_hvac_master.py`) ve konumu (`scripts/db/migrations/`) dikkate alınarak, modülün bir veri derleme/ migration betiği olduğu varsayılmıştır — ancak bu yalnızca isimlendirmeden yapılan bir çıkarımdır, fonksiyon gövdesi doğrulaması **yoktur**.

---

**[Aksiyom 1 – Bağımsız Çalışma Noktası]:** Eğer `main()` fonksiyonu parametre almıyorsa, modülün kendi başına bir `__main__` giriş noktası olarak çalıştırılması beklenir; harici bağımlılıklar (dosya yolları, DB bağlantıları, modüller) `main()` gövdesi içinde tanımlanmalıdır — bunların varlığı ve doğruluğu fonksiyon gövdesiyle doğrulanamadığından, mevcut **bilinmiyor**.

---

> **Not:** Mimari aksiyomların sağlamlığı için fonksiyon gövdesinin (body) sağlanması gerekmektedir. Mevcut bilgi sadece `main()` imzasından ibaret olup, dosya okuma/yazma, DB bağlantısı, bağımlılık, eşik değeri veya hata yönetimi gibi kritik aksiyomlar **gövde analizi olmadan üretilmemiştir**.

---

## FONKSİYON DETAYLARI

### main
**Ne yapar**: Projenin `src` dizinindeki tüm geçerli Markdown dosyalarını (özel olarak hariç tutulanlar dışında) tarar, bu dosyaların içeriğini sıralı bir biçimde tek bir "master" belgeye birleştirir ve projenin `docs` dizinine yazar.

**Nasıl yapar**: Fonksiyon, scriptin konumundan yola çıkarak projenin kök dizinini (`repo_root`) hesaplar. Ardından bu dizin altında `src` klasörünü recursively tarayarak `.md` uzantılı tüm dosyaları toplar. `master.md` ve `system_tree.md` dosyalarını hariç tutar. Bulunan dosyaları tam yollarına göre sıralar. Her dosyanın içeriğini okur, dosya yolunu içeren bir bölüm başlığıyla (`FILE: ...`) birlikte bir blok oluşturur. Son olarak, derleme tarihi ve dosya sayısı gibi meta bilgileri içeren bir header ile tüm bu blokları birleştirip `docs/venthub_hvac_master.md` dosyasına yazar.

**Parametreler**:
- Bu fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: `None` (void) döner. İşlem sonucunda dosya sisteminde `venthub_hvac_master.md` dosyası oluşturur veya üzerine yazar.

---

## NODE ID STANDARD

  file: scripts\db\migrations\compile_hvac_master.py
  function: scripts\db\migrations\compile_hvac_master.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main