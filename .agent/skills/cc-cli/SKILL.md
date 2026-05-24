---
name: cc-cli
description: >
  Corpus Callosum CLI dokümantasyon pipeline komutlarını öğretir. TETİKLE: Kullanıcı
  "doküman üret", "md güncelle", "doc yap", "doc pipeline", "tree oluştur", "NLM sync",
  "schema çıkar", "hook kur", "cc doc" dediğinde veya bir kod dosyası değişikliği sonrası
  dokümantasyon güncellenmesi gerektiğinde. ASLA TETİKLEME: Kullanıcı sadece kod yazmak,
  debug yapmak, test çalıştırmak veya CC CLI ile ilgisi olmayan işlemler istediğinde.
---

# CC CLI Dokümantasyon Pipeline

Bu skill, `corpus-callosum` paketinin `cc doc` komutlarını ve proje kurulumunu öğretir.

## Ön Koşullar

- `pip install -e corpus-callosum` (veya `pip install corpus-callosum`) kurulu olmalı
- LLM backend: 9Router (`localhost:20128`) çalışıyor olmalı VEYA `OPENROUTER_API_KEY` tanımlı olmalı
- Tree-sitter dil paketleri: `pip install tree-sitter-javascript tree-sitter-typescript` (JS/TS projeleri için)

## Proje Kurulumu (Yeni Proje)

Yeni bir projede CC CLI kullanmak için:

```bash
cc doc init
```

Bu komut:
1. `.cc_docs.yaml` oluşturur (proje config)
2. `.git/hooks/pre-commit` kurar (otomatik doc üretimi)
3. Bu skill'i `.agent/skills/cc-cli/` altına kopyalar

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
cc doc install-hook
```

## Komutlar

### cc doc all
Tüm projeyi tarar, her kod dosyası için `.md` üretir.

```bash
cc doc all                    # Sadece yeni/değişen dosyalar (hash kontrolü)
cc doc all --changed-only     # Sadece son commit'ten beri değişenler
cc doc all --force            # Tümünü sıfırdan üret (yavaş)
cc doc all --workers 10       # Paralel worker sayısı (varsayılan: 10)
```

### cc doc batch
Belirli bir dizindeki dosyaları işler.

```bash
cc doc batch --batch-dir supabase/functions           # Dizin belirt
cc doc batch --batch-dir supabase/functions --force    # Sıfırdan üret
```

### cc doc single
Tek dosya için `.md` üretir.

```bash
cc doc single --py-file src/components/Header.tsx --force
```

### cc doc schema
Supabase DB şemasını parse eder → `docs/database_schema_master.md` üretir.

```bash
cc doc schema
```

> Supabase olmayan projelerde bu komutu kullanma.

### cc doc tree
Sistem ağacı oluşturur. NLM sync yapar.

```bash
cc doc tree                                    # Sadece system_tree.md oluştur
cc doc tree --nlm-sync                         # + NLM'e yükle
cc doc tree --nlm-sync --force-sync            # + format hatalarını atla
```

### cc doc changed
Git diff'teki değişen dosyaları tespit edip doc günceller.

```bash
cc doc changed
```

### cc doc install-hook
Pre-commit hook kurar. Her commit'te değişen dosyalar otomatik dokümante edilir.

```bash
cc doc install-hook                                        # Mevcut dizin
cc doc install-hook --workspace C:/Users/alize/venthub-hvac # Başka proje
```

## Tam Sync Workflow (NLM Güncelleme)

Mimari değişiklik sonrası NotebookLM'i güncellemek için sırayla:

```bash
# 1. NLM CLI güncelle
pip install --upgrade notebooklm-mcp-cli

# 2. Kaynak koddan MD üret
cc doc all --changed-only

# 3. Extra master'lar varsa (supabase vb.)
cc doc batch --batch-dir supabase/functions

# 4. DB şeması varsa
cc doc schema

# 5. Master derle + NLM'e yükle
cc doc tree --nlm-sync --force-sync
```

## Dikkat Edilmesi Gerekenler

### YAPMA
- `cc doc tree` yerine kendi master derleme scriptin yazma — mevcut komut tüm filtreleri uygular
- `--force` olmadan ilk çalıştırma yapma (hash olmadığı için hiçbir şey üretmez)
- `source_dirs` dışındaki dizinleri elle master'a ekleme

### YAP
- Her zaman `.cc_docs.yaml` üzerinden config yönet
- `standalone_files`'ı basename olarak yaz (`docs/schema.md` değil `schema.md` — NLM basename kaydeder)
- Hook'u `cc doc install-hook` ile kur, elle `.git/hooks/pre-commit` düzenleme
- `--no-verify` ile commit yapıldığında sonra `cc doc changed` çalıştır

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
`cc doc tree` master derleyicisidir. Kendi derleme scripti yazma.

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
Hook kurulumu `cc doc install-hook` veya `cc doc init` ile yapılır. Elle `.git/hooks/` düzenleme.

### A7 — Araç Zincirleme (CC Memory Engine kullanan projeler)
Aşağıdaki araçlar, belirtilen ÖN KOŞUL aracı çağrılmadan kullanılmamalıdır:

```
cc remember    ← ÖN KOŞUL: cc search
cc update-node ← ÖN KOŞUL: cc read-node
cc forget      ← ÖN KOŞUL: cc read-node
cc synapse     ← ÖN KOŞUL: cc search
```

### A8 — Skill Önceliği
`cc need` komutu `skill_ref` döndürdüğünde:
1. İlgili skill'i oku (`.agent/skills/<skill_ref>/SKILL.md`)
2. Skill talimatlarını uygula — chain'i DEĞİL
3. Skill talimatları chain'den ÖNCE gelir
