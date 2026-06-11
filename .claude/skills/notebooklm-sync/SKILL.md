---
name: notebooklm-sync
description: Projedeki Markdown (.md) dosyalarını NotebookLM ile senkronize (nlm sync)
  etmek, defteri güncellemek ve hafızayı yenilemek için kullanılır (Hard Reset). Kullanıcı
  NotebookLM'de arama yapmak istediğinde ASLA tetiklemeyin. Veritabanı sıfırlama,
  git işlemleri veya linter çalıştırma amacıyla KULLANMAYIN.
category: intelligence
metadata:
  triggers:
  - nlm sync
  - defteri güncelle
  - hafızayı yenile
  inputs:
  - docs/*.md
  outputs:
  - synced NotebookLM source
  recovery:
    on_auth_expired: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-clean-login.ps1
  prerequisites:
  - nlm login
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# NotebookLM Otonom Senkronizasyon (NLM Sync)

Bu yetenek (Skill), projedeki kaynak koddan (.py/.ts/.tsx/.js/.jsx) Markdown dokümantasyon üretir, bunları Master MD'lerde birleştirir ve otonom olarak NotebookLM'e yükler.

## Kullanım Amacı

Projenin **Tek Doğru Kaynağı (SSOT)** koddur. Kodun meta-verisi `.md` dosyalarında yazar. Mimari değiştikçe NotebookLM hafızasının eskimesini önlemek için bu pipeline tetiklenmelidir.

## Nasıl Kullanılır?

Senkronizasyonu başlatmak için aşağıdaki adımları sırayla `run_command` aracıyla çalıştırmanız yeterlidir:

### Adım 0 — NLM CLI Güncelleme (her sync öncesi)

```bash
pip install --upgrade notebooklm-mcp-cli
```

### Adım 1 — Frontend Dokümantasyon Üretimi

Değişen kaynak dosyaları için `.md` belgelerini üret veya güncelle:

```bash
cc doc all --changed-only
```

> Eğer tüm dosyaları sıfırdan üretmek istiyorsan `--force` ekle:
> `cc doc all --force`

### Adım 2 — Supabase Edge Functions Dokümantasyonu

Backend fonksiyonları için `.md` belgelerini üret:

```bash
cc doc batch --batch-dir supabase/functions
```

> İlk çalıştırmada `--force` ekle. Sonraki çalıştırmalarda hash kontrolü ile sadece değişenler güncellenir.

### Adım 3 — Database Schema Dokümantasyonu

```bash
cc doc schema
```

> `supabase db dump` veya migration dosyalarından DB şemasını parse edip `docs/database_schema_master.md` üretir.

### Adım 4 — System Tree + Master MD + NLM Sync

Tree oluştur, master'ları birleştir ve NotebookLM'e yükle:

```bash
cc doc tree --nlm-sync --force-sync
```

> `--force-sync` bayrağı, Enterprise şablonuna (5N1K/AXIOM) uymayan `.md` dosyalarını atlayarak sync'in durmasını engeller.

## İşlem Akışı (Bilinmesi Gerekenler)

Bu komutları çalıştırdığınızda arka planda şunlar gerçekleşir:

1. **migrator_lite:** Tree-sitter ile kaynak dosyaları tarar, LLM ile 5N1K formatında `.md` üretir.
2. **batch:** `supabase/functions/` altındaki Edge Function'ları `rglob` ile tarar, her biri için `.md` üretir.
3. **schema:** Supabase DB şemasını parse edip `docs/database_schema_master.md` üretir.
4. **docs_tree linter:** `system_tree.md` oluşturur, sahipsiz/eksik dokümanları raporlar.
5. **Master MD birleştirme:** `source_dirs` altındaki tüm geçerli `.md` dosyaları ana master'da birleştirilir.
6. **Extra Masters birleştirme:** `.cc_docs.yaml`'daki `extra_masters` listesindeki her giriş için ayrı master MD derlenir.
7. **NLM temizlik:** Eski master ve standalone kaynaklar `nlm source delete` ile silinir.
8. **NLM yükleme:** Yeni master + standalone + extra master dosyalar ayrı ayrı yüklenir.

## VentHub NLM Kaynak Yapısı

### 3 Master MD (Digital Twin)

| Master MD | Kaynak | İçerik |
|-----------|--------|--------|
| `venthub_hvac_master.md` | `src/` (432+ dosya) | Frontend: components, hooks, views, lib, utils, types |
| `supabase_functions_master.md` | `supabase/functions/` (28+ dosya) | Backend: Edge Functions, webhook'lar, ödeme, bildirim |
| `database_schema_master.md` | `cc doc schema` | DB: tablolar, RLS, trigger'lar, indeksler |

### .cc_docs.yaml Yapılandırması

```yaml
source_dirs: [src]
master_md: "docs/venthub_hvac_master.md"
notebook_id: "235043eb-970f-4a52-9f39-1d02b2621e9c"
standalone_files: [README.md, docs/database_schema_master.md]
skip_dirs: [__pycache__, .git, .agent, .venv, venv, mcp-env, node_modules, ...]
skip_files: [venthub_hvac_master.md, system_tree.md, supabase_functions_master.md, ...]

extra_masters:
  - name: "supabase_functions_master.md"
    source_dirs: "supabase/functions"
    output: "docs/supabase_functions_master.md"
```

### Defter ID Tespiti

1. Proje kökünde `.cc_docs.yaml` dosyasını bul
2. `notebook_id` alanını oku
3. Boşsa → yeni defter oluştur ve ID'yi `.cc_docs.yaml`'a kaydet

### Kaynak Yapısı

| Alan | Kaynak | Açıklama |
|------|--------|---------|
| `notebook_id` | .cc_docs.yaml | Defter ID |
| `standalone_files` | .cc_docs.yaml | Ayrı yüklenecek dosyalar (master'a DAHİL EDİLMEZ) |
| `master_md` | .cc_docs.yaml | Ana master MD dosya adı |
| `extra_masters` | .cc_docs.yaml | Ayrı derlenen ek master MD'ler |

**ÖNEMLİ:** Standalone dosyalar master'a DAHİL EDİLMEZ. Çift bilgi (duplicate) oluşmasını önlemek için bu ayrım korunmalıdır.

## Komut Çıktısının Doğrulanması

Komutu çalıştırdıktan sonra terminal çıktısında şu ifadeyi görmelisiniz:
> `NLM Sync completed successfully! NotebookLM is now 100% up-to-date with local architecture.`

Eğer bu mesajı alırsanız işlem başarılı demektir. Kullanıcıya "NotebookLM senkronizasyonu eksiksiz olarak tamamlandı" bilgisini verebilirsiniz.

## Hata Durumları

### Authentication Expired Hatası
**ÖNEMLİ KURAL:** Eğer komut "Authentication expired" hatası verirse, oturumu yenilemek için doğrudan `notebook-navigator` yeteneğindeki (Skill) kimlik doğrulama adımlarını izleyin. Giriş işlemi tamamlandıktan sonra senkronizasyon komutunu tekrar tetikleyin.

### cc doc tree Master MD 0 Dosya Hatası
Eğer `cc doc tree` komutu "→ 0 MD NLM'e birlestirilecek" diyorsa:
- `.cc_docs.yaml`'daki `source_dirs` doğru mu kontrol et
- `extra_masters` içindeki `source_dirs` ana `source_dirs` ile çakışmadığından emin ol
- Gerekirse master birleştirmeyi doğrudan Python ile yap

### LLM Rate Limit (batch modda)
Eğer `cc doc batch` rate limit'e takılırsa:
- Durdur, `--force` olmadan tekrar başlat (tamamlananları hash ile atlar)
- Kalan dosyaları `cc doc single --py-file <dosya>` ile tek tek yap
- Son çare: kaynak kodu okuyup MD'yi elle yaz

## Git Hook Entegrasyonu

> **Not:** Projede `post-commit` git hook'u yapılandırılmıştır. Bu hook, her başarılı commit sonrasında otomatik olarak `orion doc changed` ve NLM sync pipeline'ını tetikler. Dolayısıyla çoğu durumda senkronizasyon için ekstra bir adım gerekmez.

### Manuel Sync Gereken Durumlar

Aşağıdaki senaryolarda hook çalışmaz veya yetersiz kalır — bu durumlarda bu skill'i manuel olarak tetikleyin:

| Senaryo | Neden | Çözüm |
|---------|-------|-------|
| `git commit --no-verify` kullanıldığında | `--no-verify` tüm hook'ları atlar | `cc doc tree --nlm-sync --force-sync` |
| Hook hata verip sessizce başarısız olduğunda | Hook exit code 0 döner ama sync tamamlanmaz | Aynı komutu elle çalıştır |
| Toplu refactor/rename sonrası | Hook yalnızca diff'teki dosyaları işler, silinen/yeniden adlandırılan dosyalar eksik kalabilir | `cc doc all --force` ardından `cc doc tree --nlm-sync --force-sync` |
| `.cc_docs.yaml` yapılandırması değiştiğinde | Hook eski config ile çalışmış olabilir | Full pipeline'ı baştan çalıştır (Adım 1–4) |
| CI/CD ortamında (hook yok) | Sunucuda git hook'lar kurulu değildir | Pipeline'a NLM sync adımını ekle |

## AXIOMS

- **A1:** Master MD'ye kök dosyalar (README vb.) dahil edilmez — standalone_files olarak ayrı yüklenir.
- **A2:** NLM defterinde tam 3 master + standalone kaynak olmalıdır (frontend master + supabase master + db schema + README).
- **A3:** Sync öncesi mutlaka migrator_lite + batch + schema çalıştırılmalıdır — aksi halde eski `.md` NLM'e gider.
- **A4:** Auth hatası aldığında `notebook-navigator` yeteneğindeki oturum yenileme adımlarını çalıştır.
- **A5:** NLM CLI güncelleme kontrolü her sync öncesi yapılmalıdır.
