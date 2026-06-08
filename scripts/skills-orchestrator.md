---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\skills-orchestrator.py
skeleton_hash: 92665f9876adc2b9
entity_hashes:
  func:get_repo_root: 277aa78581abc579
  func:main: 9329e628c641df33
  func:run_command: d58c690f7464b51f
  overview: 8ab984f70dd5acb5
generated_at: 2026-06-08T18:34:47Z
---

## Genel Bakış
Bu modül, repodaki beceri (skills) süreçlerini yönetmek için kullanılan bir komut satırı orkestratörüdür. Temel olarak depo kök dizinini tespit ederek belirli komutların çalıştırılmasını ve sürecin başarım durumunu izlemeyi sağlar.

## Fonksiyon Grupları

### Ortam ve Altyapı
Repodaki konum bilgisini sağlayan ve genel komut çalıştırma altyapısını sunan yardımcı fonksiyonları içerir.
- get_repo_root, run_command

### Ana Akış Kontrolü
Uygulamanın başlangıç noktasını ve genel iş akışını yöneten orkestrasyon mantığını barındırır.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için imza tabanlı temel mimari varsayımlar:

**[Aksiyom 1]:** Eğer `get_repo_root()` çağrıldığında çalıştırma ortamında bir depo (repository) kök dizini mevcut değilse veya tespit edilemiyorsa, fonksiyonun dönüş değeri tanımsız hata üretir veya geçersiz bir yol döndürür.

**[Aksiyom 2]:** Eğer `run_command(cmd, cwd)` çağrıldığında `cwd` parametresi mevcut bir dizin yolunu temsil etmiyorsa, komut o dizin bağlamında çalıştırılamaz ve hata oluşur.

**[Aksiyom 3]:** Eğer `run_command(cmd, cwd)` çağrıldığında `cmd` parametresi geçerli bir sistem komutu içermiyorsa, komut başarısız olur veya beklenmeyen davranış sergiler.

**[Aksiyom 4]:** Eğer `main()` fonksiyonu modülün dışarıdan çağrılabilir giriş noktası olarak kullanılacaksa, öncesinde `get_repo_root()` gibi yardımcı fonksiyonların döndürdüğü değerlerin `run_command` için geçerli oldugu varsayılır.

---

**Not:** Bu modülde fonksiyon gövdeleri ve docstring'ler paylaşılmadığı için varsayımlar yalnızca fonksiyon imza yapılarından türetilmiştir. Modülün真正 davranışını ve ek aksiyomları belirlemek için fonksiyon gövdelerinin incelenmesi gereklidir.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git tabanlı bir projenin kök dizinini (repository root) tespit eder. Git komutu başarısız olursa, dosyanın kendi konumuna göre üst dizin yapısını referans alarak kök dizini döndürür.

**Nasıl yapar**: `git rev-parse --show-toplevel` komutunu subprocess ile çalıştırarak Git repozituarının en üst dizin yolunu alır. Bu komut herhangi bir Git deposu içinde çalıştırıldığında kesin doğru sonucu verir. Eğer bir hata oluşursa (örneğin script bir Git deposu dışında çalışıyorsa), kendi dosya konumunu (`__file__`) temel alarak iki seviye üst dizine çıkarak repo kökünü varsayar.

**Parametreler**: Fonksiyon hiçbir parametre almaz.

**Dönüş**: `Path` — Git repozituarının kök dizinini temsil eden bir `pathlib.Path` nesnesi.

### run_command
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    skills-orchestrator_py__get_repo_root["get_repo_root"]
    skills-orchestrator_py__main["main"]
    skills-orchestrator_py__run_command["run_command"]
```

## NODE ID STANDARD

  file: scripts\skills-orchestrator.py
  function: scripts\skills-orchestrator.py::get_repo_root
  function: scripts\skills-orchestrator.py::run_command
  function: scripts\skills-orchestrator.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main
  export: run_command