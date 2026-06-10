---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\skills-creator.py
skeleton_hash: 2dba77da31ec5125
entity_hashes:
  func:get_repo_root: 277aa78581abc579
  func:main: 4296e6ad60e77ea8
  func:run_script: ce6f74f203bf964d
  func:validate_kebab_case: 23e7658e19f8ba59
  overview: 9752174f23e9c38d
generated_at: 2026-06-10T09:58:24Z
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
**Ne yapar**: VentHub agent sistemi için yeni bir yetenek (skill) oluşturmak üzere interaktif veya komut satırı tabanlı bir arayüz sunan ana program fonksiyonudur. Gerekli parametreleri alır, validate eder ve dosya sisteminde ilgili klasör yapısını ve dosyaları (SKILL.md, evals.json) oluşturarak derleme ve değerlendirme adımlarını tetikler.

**Nasıl yapar**: Fonksiyon, `argparse` kütüphanesi ile komut satırı argümanlarını parsed eder. Eğer kritik bir argüman (özellikle `--name`) sağlanmamışsa, kullanıcıyı interaktif olarak bilgi girmeye yönlendirir. Her bir parametre (ad, açıklama, kategori, tetikleyiciler, girdiler, çıktılar, kurtarma kalıbı) için doğrulama (örn. kebab-case kontrolü) ve değer atama işlemleri yürütür. Ardından, belirtilen isimde bir skill klasörü ve alt klasörleri (`scripts`, `references`, `evals`) oluşturur. YAML frontmatter içeren bir `SKILL.md` dosyası ve skill için `should_trigger` ve `should_not_trigger` senaryolarını içeren `evals.json` dosyasını yazar. Son olarak, skill'in derlenmesi ve değerlendirilmesi için harici script'leri (`compile_skills.py`, `skills-evaluator.py`) çağırır.

**Parametreler**:
- Bu fonksiyon parametre almaz; tüm girişler komut satırı argümanları (`argparse` tarafından işlenir) veya standart giriş üzerinden interaktif olarak alınır.
- **Dolaylı Komut Satırı Argümanları** ( fonksiyon gövdesinde `args` nesnesine dönüştürülür):
    - `--name`: type: string — Oluşturulacak yeteneğin adı (kebab-case formatında olmalıdır, ör: "sentry-fixer"). Sağlanmazsa interaktif modda istenir.
    - `--description`: type: string — Yeteneğin ne işe yaradığını kısa açıklayan metin.
    - `--category`: type: string (choices: orchestration, intelligence, guards, audit, utils) — Yeteneğin ait olduğu kategori.
    - `--triggers`: type: string — Virgülle ayrılmış tetikleyici anahtar kelimeler (ör: "error,fix,sentry").
    - `--inputs`: type: string — Virgülle ayrılmış girdi dosyaları/varlıkları (ör: "project-dna.yaml").
    - `--outputs`: type: string — Virgülle ayrılmış çıktı dosyaları/varlıkları.
    - `--recovery-pattern`: type: string — Hata kurtarmayı tetikleyen desen (ör: "AuthExpired").
    - `--recovery-cmd`: type: string — Tetiklendiğinde çalıştırılacak kurtarma komutu.

**Dönüş**: None (void). Fonksiyon, başarı durumunda dosya sistemi değişiklikleri yapar ve stdout'a log basar; hata durumunda `sys.exit(1)` ile programı sonlandırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/skills-creator.py::get_repo_root
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `output` — `subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)` çağrısının stdout çıktısı; git repo kök dizininin mutlak yolu (sonu newline temizlenmiş string)
- **Dönüş**: `Path(output.strip())` — Path nesnesi olarak repo kök dizini; exception durumunda `Path(__file__).resolve().parent.parent` ile scriptin iki üst dizini

### [N2_NASIL] AST Pointer: scripts/skills-creator.py::run_script
- **params**: `script_name: str` — çalıştırılacak python script dosyasının adı; `cwd: Path` — scriptin çalıştırılacağı çalışma dizini
- **ic_degiskenler**:
  - `res` — `subprocess.run([sys.executable, str(cwd / script_name)], cwd=cwd)` çağrısının döndürdüğü CompletedProcess nesnesi; `.returncode` alanı ile başarı durumu kontrol edilir
  - `e` — Exception yakalama değişkeni; hata mesajını `print` ile kullanıcıya iletir
- **Dönüş**: `bool` — `res.returncode == 0` ise True, exception durumunda False

### [N3_NASIL] AST Pointer: scripts/skills-creator.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısının dönüşü; repo kök dizinini temsil eden Path nesnesi
  - `skills_dir` — `repo_root / ".agent" / "skills"` ifadesinden türetilen Path; yeteneklerin saklanacağı üst dizin
  - `parser` — `argparse.ArgumentParser` nesnesi; CLI argümanlarının tanımı ve parse edilmesi
  - `args` — `parser.parse_args()` çağrısının dönüşü; parsed argüman nesnesi; `args.name`, `args.description`, `args.category`, `args.triggers`, `args.inputs`, `args.outputs`, `args.recovery_pattern`, `args.recovery_cmd` alanlarına erişilir
  - `name` — yetenek adı (kebab-case); interaktif `input()` veya `args.name.lower().strip()` ile elde edilir; `validate_kebab_case()` ile doğrulanır
  - `skill_dest_dir` — `skills_dir / name`; yeni yeteneğin oluşturulacağı hedef dizin yolu
  - `description` — yetenek açıklaması stringi; `input()` veya `args.description.strip()` ile elde edilir
  - `category` — yetenek kategorisi stringi; `input()` veya `args.category.strip().lower()` ile elde edilir; geçerli kategoriler: orchestration, intelligence, guards, audit, utils
  - `triggers_input` — interaktif modda virgülle ayrılmış tetikleyici kelimelerin ham girdi stringi; `input()` ile alınır
  - `triggers` — `[t.strip() for t in ...split(",") if t.strip()]` list comprehension ile oluşturulmuş tetikleyici kelime listesi
  - `inputs_input` — interaktif modda virgülle ayrılmış girdi dosyalarının ham girdi stringi; `input()` ile alınır
  - `inputs` — `[i.strip() for i in ...split(",") if i.strip()]` list comprehension ile oluşturulmuş girdi dosyası/asset listesi
  - `outputs_input` — interaktif modda virgülle ayrılmış çıktı dosyalarının ham girdi stringi; `input()` ile alınır
  - `outputs` — `[o.strip() for o in ...split(",") if o.strip()]` list comprehension ile oluşturulmuş çıktı dosyası/asset listesi
  - `recovery` — `{pattern: cmd}` şeklinde hata kurtarma sözlüğü; recovery_pattern ve recovery_cmd birlikte sağlanmışsa args'tan, aksi halde interaktif `input()` ile doldurulur; boş dict `{}` ile başlar
  - `has_rec` — interaktif modda hata kurtarma eklenip eklenmeyeceği tercihi stringi ("y" veya "n")
  - `pattern` — interaktif modda girilen hata arama deseni stringi; recovery sözlüğünün key'i olur
  - `cmd` — interaktif modda girilen kurtarma komutu stringi; recovery sözlüğünün value'su olur
  - `scripts_dir` — `skill_dest_dir / "scripts"`; yetenek klasörü altındaki scripts dizini Path'i
  - `references_dir` — `skill_dest_dir / "references"`; yetenek klasörü altındaki references dizini Path'i
  - `evals_dir` — `skill_dest_dir / "evals"`; yetenek klasörü altındaki evals dizini Path'i
  - `skill_md_path` — `skill_dest_dir / "SKILL.md"`; oluşturulacak SKILL.md dosyasının tam yolu
  - `frontmatter` — YAML frontmatter sözlüğü; `name`, `description`, `category`, `metadata.triggers`, `metadata.inputs`, `metadata.outputs` anahtarlarını içerir; `recovery` varsa `metadata.recovery` altına eklenir
  - `yaml_text` — `yaml.dump(frontmatter, ...)` çağrısının dönüşü; frontmatter sözlüğünün YAML formatında string temsili
  - `skill_body` — f-string ile oluşturulmuş SKILL.md markdown gövdesi; "# {name} Skill", "## When to Use", "## Instructions" bölümlerini içerir
  - `f` — `open(skill_md_path, "w", encoding="utf-8")` ile açılan dosya nesnesi; `f.write()` ile SKILL.md içeriği yazılır
  - `st_templates` — 12 adet lambda fonksiyonu içeren liste; her biri `(name, triggers)` alarak should_trigger sorgusu üretir; doğrudan Türkçe tetikleme, İngilizce karşılıklar, dolaylı istekler, soru formları ve bağlama göre ifadeler kapsar
  - `st_queries` — `st_templates` lambda'larının `name` ve `triggers` ile çağrılmasıyla oluşturulmuş should_trigger sorguları listesi; `dict.fromkeys()` ile tekrarlar kaldırılır; `[:12]` ile en fazla 12 eleman
  - `category_negatives` — kategorilere göre olumsuz sorgu listelerini içeren sözlük; orchestration, intelligence, guards, audit, utils anahtarlarıyla near-miss negatif örnekler barındırır
  - `generic_negatives` — bilinmeyen kategoriler için yedek genel olumsuz sorgu listesi (4 eleman)
  - `cat_negs` — `category_negatives.get(category, generic_negatives * 2)[:4]` ile seçilmiş 4 adet kategori bazlı olumsuz sorgu listesi
  - `contextual_negs` — yetenek adı türetilmiş 2 ve genel 2 olmak üzere 4 adet bağlama göre olumsuz sorgu listesi; `"delete {name}"`, `"debug {name} error"` ve genel sorgular
  - `snt_queries` — `cat_negs + contextual_negs` ile birleştirilmiş toplam should_not_trigger sorguları listesi
  - `evals_data` — `{"should_trigger": st_queries, "should_not_trigger": snt_queries}` sözlüğü; evals.json'a yazılacak veri
  - `compile_success` — `run_script("scripts/compile_skills.py", repo_root)` çağrısının dönüş bool değeri; derleme başarı durumu
- **Dönüş**: yok (fonksiyon sonu `sys.exit(1)` ile biten hata durumları var; normal akışta yan etkiler: dizin oluşturma, dosya yazma, compile/eval çağrısı)

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