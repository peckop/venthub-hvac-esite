---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\skills-creator.py
skeleton_hash: 2dba77da31ec5125
entity_hashes:
  func:get_repo_root: 277aa78581abc579
  func:main: e157f69413e505b2
  func:run_script: ce6f74f203bf964d
  func:validate_kebab_case: 23e7658e19f8ba59
  overview: 9752174f23e9c38d
generated_at: 2026-06-10T09:36:51Z
---

## Genel Bakış

Bu modül, projeye yeni yetenekler (skills) eklemek için gerekli dosya yapısını oluşturan ve ilgili kurulum scriptlerini çalıştıran bir araçtır. Yeni yeteneklerin isimlendirme kurallarına uygunluğunu doğrulayarak tutarlı bir geliştirme ortamı sağlar.

## Fonksiyon Grupları

### Altyapı ve Konumlandırma
Repodaki kök dizini tespit ederek modülün çalışması için gerekli mutlak yol bilgisini sağlar.
- get_repo_root

### Veri Doğrulama
Oluşturulacak yeteneklerin isimlerinin standartlara uygun (kebab-case) formatta olmasını kontrol eder.
- validate_kebab_case

### Script Çalıştırma
Oluşturma sürecindeki yardımcı scriptleri belirtilen dizinde çalıştırır ve başarı durumunu raporlar.
- run_script

### Ana Akış Orchestrasyon
Tüm sürecin akışını yönetir: kök dizini bulur, doğrulama yapar ve gerekli scriptleri sırasıyla çalıştırır.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HVAC projesinde yetenek (skill) oluşturma süreçlerini yöneten bir komut satırı aracıdır.

**[Aksiyom 1]:** Eğer `run_script` fonksiyonuna geçilen `cwd` parametresi geçerli bir `Path` nesnesi değilse, betik çalıştırma hatası oluşur.

**[Aksiyom 2]:** Eğer `run_script` fonksiyonuna geçilen `script_name` parametresi boş bir string ise veya belirtilen betik dosyası hedef konumda mevcut değilse, script çalıştırma başarısız olur.

**[Aksiyom 3]:** Eğer `validate_kebab_case` fonksiyonuna geçilen `name` parametresi kebab-case formatına (küçük harfler ve tire ayrımı) uygun değilse, validasyon başarısız olur.

**[Aksiyom 4]:** Eğer `get_repo_root` fonksiyonu çalıştırıldığında modül bir git repo kök dizini içinde değilse veya üst dizin zincirinde uygun bir `.git` klasörü tespit edilemezse, repo kök dizini bulunamaz.

**[Aksiyom 5]:** Eğer `main` fonksiyonu çağrılmadan önce modül yeterli yetkilere sahip değilse veya gerekli bağımlılıklar (Python paketleri) yüklü değilse, modül düzgün başlatılamaz.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Projenin (Git deposunun) üst düzey kök dizinini bulur ve döner.
**Nasıl yapar**: `git rev-parse --show-toplevel` komutunu çalıştırarak Git repo kökünü elde eder. Bu komut başarısız olursa, fonksiyonun bulunduğu dosyanın (skill-creator.py) bir üst dizinini kök olarak varsayar; bu da muhtemelen proje dizinidir.
**Parametreler**: Yok
**Dönüş**: `Path` — Proje kök dizinini temsil eden bir pathlib.Path nesnesi.

### run_script
**Ne yapar**: Verilen isimdeki Python betiğini belirtilen çalışma dizininde çalıştırır ve başarılı olup olmadığını döner.
**Nasıl yapar**: Python yorumlayıcısını (`sys.executable`) ve script yolunu argüman olarak alarak `subprocess.run` ile betiği çalıştırır. İşlem.returncode 0 ise başarı (True), değilse hata (False) döner. Bir istisna oluşursa hata mesajını yazdırıp False döner.
**Parametreler**:
- `script_name`: `str` — Çalıştırılacak Python betiğinin dosya adı (ör. "compile_skills.py").
- `cwd`: `Path` — Betiğin çalıştırılacağı çalışma dizini (çalışma dizini).
**Dönüş**: `bool` — Betik başarıyla çalışırsa (returncode 0) True, aksi halde False.

### validate_kebab_case
**Ne yapar**: Verilen stringin "kebab-case" formatına uygun olup olmadığını doğrular.
**Nasıl yapar**: Düzenli ifade kullanarak stringin yalnızca küçük harfler, rakamlar ve tire içermesini ve en az bir karakter olacak şekilde tanımlanmasını kontrol eder. Eşleşme varsa True, yoksa False döner.
**Parametreler**:
- `name`: `str` — Doğrulanacak skill ismi.
**Dönüş**: `bool` — İsim kebab-case kurallarına uyuyorsa True.

### main
**Ne yapar**: VentHub agent sistemi için yeni bir yetenek (skill) oluşturmak üzere bir komut satırı arayüzü sunar. Hem interaktif modda kullanıcıdan bilgi toplar hem de komut satırı argümanlarıyla doğrudan çalışabilir.

**Nasıl yapar**: Fonksiyon, argparse ile komut satırı argümanlarını işler, eksik bilgileri interaktif olarak kullanıcıdan talep eder. Ardından, yeteneğin dizin yapısını oluşturur (scripts, references, evals), SKILL.md dosyasını YAML frontmatter ile yazar, değerlendirme sorguları üretir ve evals.json dosyasını oluşturur. Son olarak compile_skills.py ve skills-evaluator.py betiklerini çalıştırarak süreci tamamlar.

**Parametreler**: Yok

**Dönüş**: Dönüş değeri yoktur (void).

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/skills-creator.py::get_repo_root
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `output` — `subprocess.check_output` çağrısının stdout çıktısı; git komutunun repo kök yolunu döndürdüğü metin
- **Dönüş**: `Path` — Git reposunun kök dizini; hata durumunda __file__'ın iki üst dizini (scripts/ ve skills-creator.py)

### [N2_NASIL] AST Pointer: scripts/skills-creator.py::run_script
- **params**: (`script_name: str`, `cwd: Path`)
- **ic_degiskenler**:
  - `res` — `subprocess.run` çağrısının sonucu; çalıştırılan betiğin dönüş kodu ve çıkış bilgilerini içerir
- **Dönüş**: `bool` — Betik başarıyla çalıştırılırsa True (returncode == 0), başarısızsa veya hata oluşursa False

### [N3_NASIL] AST Pointer: scripts/skills-creator.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısıyla elde edilen Git reposunun kök dizini (Path nesnesi)
  - `skills_dir` — Yeteneklerin kaydedileceği dizin yolu (repo_root / ".agent" / "skills")
  - `parser` — `argparse.ArgumentParser` nesnesi; CLI argümanlarını tanımlar ve ayrıştırır
  - `args` — `parser.parse_args()` çağrısıyla elde edilen ayrıştırılmış argümanlar (Namespace nesnesi)
  - `name` — Yeteneğin kebab-case formatındaki adı; interaktif veya argümandan alınır
  - `skill_dest_dir` — Yeni yeteneğin tam hedef dizin yolu (skills_dir / name)
  - `description` — Yeteneğin açıklaması; interaktif veya argümandan alınır
  - `category` — Yeteneğin kategorisi; izin verilen değerler: ["orchestration", "intelligence", "guards", "audit", "utils"]
  - `triggers` — Tetikleyici anahtar kelimeler listesi; virgülle ayrılmış input veya argümandan ayrıştırılmış
  - `inputs` — Girdi dosyaları/assets listesi; virgülle ayrılmış input veya argümandan ayrıştırılmış
  - `outputs` — Çıktı dosyaları/assets listesi; virgülle ayrılmış input veya argümandan ayrıştırılmış
  - `recovery` — Hata kurtarma deseni ve komutu sözlüğü; pattern->cmd eşleşmesi
  - `has_rec` — Kullanıcının kurtarma eklemek isteyip istemediğini belirten "y/n" yanıtı
  - `pattern` — Hata arama deseni (kurtarma için); interaktif input
  - `cmd` — Kurtarma komutu; interaktif input
  - `scripts_dir` — Yetenek dizininin içindeki scripts alt dizini yolu
  - `references_dir` — Yetenek dizininin içindeki references alt dizini yolu
  - `evals_dir` — Yetenek dizininin içindeki evals alt dizini yolu
  - `skill_md_path` — SKILL.md dosyasının tam yolu (skill_dest_dir / "SKILL.md")
  - `frontmatter` — SKILL.md için YAML frontmatter sözlüğü; name, description, category ve metadata içerir
  - `yaml_text` — `yaml.dump` ile frontmatter'ın YAML formatına dönüştürülmüş metni
  - `skill_body` — SKILL.md için Markdown gövde şablonu (boş talimatlar)
  - `st_queries` — should_trigger test soruları listesi (12 adet); tetikleyicilerden üretilen ve tekrarları kaldırılmış
  - `snt_queries` — should_not_trigger test soruları listesi (8 adet); sabit örnekler
  - `evals_data` — evals.json için sözlük; should_trigger ve should_not_trigger listelerini içerir
  - `compile_success` — `run_script("scripts/compile_skills.py", repo_root)` çağrısının sonucu (bool)
- **Dönüş**: yok — Fonksiyon dosya sistemi üzerinde yan etkileri vardır (dizinler ve dosyalar oluşturur), değer döndürmez

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    skills-creator_py__get_repo_root["get_repo_root"]
    skills-creator_py__main["main"]
    skills-creator_py__run_script["run_script"]
    skills-creator_py__validate_kebab_case["validate_kebab_case"]
```

## NODE ID STANDARD

  file: scripts\skills-creator.py
  function: scripts\skills-creator.py::get_repo_root
  function: scripts\skills-creator.py::run_script
  function: scripts\skills-creator.py::validate_kebab_case
  function: scripts\skills-creator.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main
  export: run_script
  export: validate_kebab_case