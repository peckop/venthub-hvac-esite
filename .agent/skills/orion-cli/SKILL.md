---
name: orion-cli
description: Orion CLI dokümantasyon pipeline komutlarını öğretir, tree veya şema
  üretir. "doküman üret", "orion doc", veya "tree oluştur" istendiğinde tetikleyin.
  Kullanıcı sadece kod yazmak, debug yapmak, test çalıştırmak veya veritabanı/git
  işlemleri yapmak istediğinde ASLA tetiklemeyin.
category: intelligence
metadata:
  triggers:
  - orion doc
  - doküman üret
  - tree oluştur
  inputs:
  - source code files
  outputs:
  - docs/*.md
  recovery:
    on_auth_expired: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-clean-login.ps1
  prerequisites:
  - OPENROUTER_API_KEY
  - nlm login (NotebookLM sync için)
---


# Orion CLI Dokümantasyon Pipeline

Bu yetenek (Skill), projedeki kaynak koddan Markdown dokümantasyon üretir, bunları tek bir Master MD'de birleştirir ve otonom olarak NotebookLM'e yükler. Tüm dokümantasyon ve hafıza iş akışı `orion` CLI komutları üzerinden yürütülür.

## Ön Koşullar

- `pip install -e orion-ai` (veya `pip install orion-ai`) kurulmuş olmalı
- `OPENROUTER_API_KEY` ~/.orion/.env.keys veya ortam değişkeninde tanımlı olmalı
- Tree-sitter dil paketleri: `pip install tree-sitter-javascript tree-sitter-typescript` (JS/TS projeleri için)

## Proje Kurulumu (Yeni Proje)

Yeni bir projede Orion CLI kullanmak için:

```bash
orion doc init
```

Bu komut:
1. `.cc_docs.yaml` oluşturur (proje config)
2. `.git/hooks/pre-commit` kurar (otomatik doc üretimi)
3. Bu skill'i `.agent/skills/orion-cli/` altına kopyalar

### Manuel Kurulum (init yoksa)

1. Proje kökünde `.cc_docs.yaml` oluştur:

```yaml
source_dirs: [src]                          # Taranacak kaynak dizinler
master_md: "docs/proje_adi_master.md"       # Ana master MD dosyası
notebook_id: ""                             # NLM defter ID (ilk sync'te doldurulur)
standalone_files: [README.md, CONTEXT.md]   # Master'a DAHİL EDİLMEYEN ayrı dosyalar
skip_dirs: [__pycache__, .git, .agent, .venv, node_modules, dist, build, .next]
skip_files: [proje_adi_master.md, system_tree.md]

# Opsiyonel: ek master'lar (farklı kaynak dizinlerinden)
extra_masters:
  - name: "supabase_functions_master.md"
    source_dirs: "supabase/functions"
    output: "docs/supabase_functions_master.md"
```

2. Hook kur:
```bash
orion doc install-hook
```

## Komutlar

### orion doc all
Tüm projeyi tarar, her kod dosyası için `.md` üretir.

```bash
orion doc all                    # Sadece yeni/değişen dosyalar (hash kontrolü)
orion doc all --changed-only     # Sadece son commit'ten beri değişenler
orion doc all --force            # Tümünü sıfırdan üret (yavaş)
orion doc all --workers 20       # Paralel worker sayısı (Xiaomi mimoV2 planı gereği varsayılan: 20)
```

### orion doc batch
Belirli bir dizindeki dosyaları işler.

```bash
orion doc batch --batch-dir supabase/functions           # Dizin belirt
orion doc batch --batch-dir supabase/functions --force    # Sıfırdan üret
```

### orion doc single
Tek dosya için `.md` üretir.

```bash
orion doc single --py-file src/components/Header.tsx --force
```

### orion doc schema
Supabase DB şemasını parse eder → `docs/database_schema_master.md` üretir.

```bash
orion doc schema
```

> Supabase olmayan projelerde bu komutu kullanma.

### orion doc tree
Sistem ağacı oluşturur. NLM sync yapar.

```bash
orion doc tree                                    # Sadece system_tree.md oluştur
orion doc tree --nlm-sync                         # + NLM'e yükle
orion doc tree --nlm-sync --force-sync            # + format hatalarını atla
```

### orion doc changed
Git diff'teki değişen dosyaları tespit edip doc günceller.

```bash
orion doc changed
```

### orion doc install-hook
Pre-commit hook kurar. Her commit'te değişen dosyalar otomatik dokümante edilir.

```bash
orion doc install-hook                                        # Mevcut dizin
orion doc install-hook --workspace C:/Users/alize/venthub-hvac # Başka proje
```

## Tam Sync Workflow (NLM Güncelleme)

Mimari değişiklik sonrası NotebookLM'i güncellemek için sırayla:

```bash
# 1. NLM CLI güncelle
pip install --upgrade notebooklm-mcp-cli

# 2. Kaynak koddan MD üret
orion doc all --changed-only --workers 20

# 3. Extra master'lar varsa (supabase vb.)
orion doc batch --batch-dir supabase/functions --workers 20

# 4. DB şeması varsa
orion doc schema

# 5. Master derle + NLM'e yükle
orion doc tree --nlm-sync --force-sync
```

## Dikkat Edilmesi Gerekenler

### YAPMA
- `orion doc tree` yerine kendi master derleme scriptin yazma — mevcut komut tüm filtreleri uygular
- `--force` olmadan ilk çalıştırma yapma (hash olmadığı için hiçbir şey üretmez)
- `source_dirs` dışındaki dizinleri elle master'a ekleme

### YAP
- Her zaman `.cc_docs.yaml` üzerinden config yönet
- `standalone_files`'ı basename olarak yaz (`docs/schema.md` değil `schema.md` — NLM basename kaydeder)
- Hook'u `orion doc install-hook` ile kur, elle `.git/hooks/pre-commit` düzenleme
- `--no-verify` ile commit yapıldığında sonra `orion doc changed` çalıştır

### Hata Durumları

| Hata | Çözüm |
|------|-------|
| LLM rate limit | `--force` olmadan tekrar çalıştır (tamamlananları atlar) |
| Auth expired (NLM) | `nlm login` çalıştır, sonra tekrar dene |
| 0 dosya derlendi | `.cc_docs.yaml` source_dirs kontrol et |
| Mükerrer NLM kaynağı | `nlm source list <notebook_id> --json` ile kontrol et, fazlaları sil |
| system_tree encoding bozuk | PowerShell değil Python ile oku, dosya UTF-8 |

## AXIOMS (Değiştirilemez Kurallar)

### A1 — SSOT
Tek Doğru Kaynak (SSOT) koddur. MD dosyaları koddan türetilir, elle yazılmaz.

### A2 — Proje Bağımsızlığı
Her proje kendi `.cc_docs.yaml`'ına sahiptir. Config başka projeden kopyalanmaz.

### A3 — Master Derleyici
`orion doc tree` master derleyicisidir. Kendi derleme scripti yazma.

### A4 — Standalone Ayrımı
`standalone_files` master'a DAHİL EDİLMEZ. Çift bilgi (duplicate) oluşmasını önler.

### A5 — Hardcoded Yasağı
Hiçbir kaynak dosyada, skill'de, script'te veya dokümanda:
- **Absolute path** (`C:\Users\...`, `/home/...`) kullanılmaz
- **Hardcoded notebook_id**, API key veya proje-spesifik ID kullanılmaz
- **Hardcoded kullanıcı adı** kullanılmaz

| Değer | Doğru Kaynak |
|-------|-------------|
| Proje kökü | `git rev-parse --show-toplevel` veya `Path.cwd()` |
| Notebook ID | `.cc_docs.yaml` → `notebook_id` |
| Source dirs | `.cc_docs.yaml` → `source_dirs` |
| API keys | Ortam değişkeni (`OPENROUTER_API_KEY` vb.) |
| Kullanıcı dizini | `Path.home()` veya `os.path.expanduser("~")` |

Pre-commit hook bu kuralı otomatik denetler: hardcoded tespit ederse uyarı verir.

### A6 — Hook Yönetimi
Hook kurulumu `orion doc install-hook` veya `orion doc init` ile yapılır. Elle `.git/hooks/` düzenleme.

### A7 — Araç Zincirleme (Orion Memory Engine kullanan projeler)
Aşağıdaki araçlar, belirtilen ÖN KOŞUL aracı çağrılmadan kullanılmamalıdır:

```
orion memory remember    ← ÖN KOŞUL: orion memory search
orion memory update-node ← ÖN KOŞUL: orion memory read-node
orion memory forget      ← ÖN KOŞUL: orion memory read-node
orion memory synapse     ← ÖN KOŞUL: orion memory search
```

### A8 — Skill Önceliği
`orion need` komutu `skill_ref` döndürdüğünde:
1. İlgili skill'i oku (`.agent/skills/<skill_ref>/SKILL.md`)
2. Skill talimatlarını uygula — chain'i DEĞİL
3. Skill talimatları chain'den ÖNCE gelir
