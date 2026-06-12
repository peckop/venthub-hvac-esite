---
name: notebooklm-sync
description: Projedeki Markdown (.md) dosyalarını NotebookLM dijital ikizine senkronize
  etmek için MILESTONE/MANUEL olarak kullanılır (auth-tazele → sync → query-doğrula).
  Kullanıcı NotebookLM'de ARAMA yapmak istediğinde ASLA tetiklemeyin (o → notebook-navigator).
  Veritabanı sıfırlama, git işlemleri veya linter çalıştırma amacıyla KULLANMAYIN.
category: intelligence
metadata:
  triggers:
  - nlm sync
  - twin'i güncelle
  - defteri güncelle
  - hafızayı yenile
  inputs:
  - docs/*.md
  - VISION.md
  - docs/standards/*.md
  outputs:
  - synced NotebookLM source
  recovery:
    on_auth_expired: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-headless-refresh.ps1
  prerequisites:
  - nlm-headless-refresh.ps1
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# NotebookLM Senkronizasyon (Milestone/Manuel Model)

Bu yetenek, projenin `.md` dokümanlarını **NotebookLM dijital ikizine** (twin) yükler.
Twin = "niçin / mimari karar / tasarım" sorularının RAG katmanı; kod yapısı için CodeGraph kullanılır.

## NEDEN MILESTONE/MANUEL (her-commit değil)

NLM sync **ağ + NotebookLM auth** gerektiren kırılgan bir adımdır. Eskiden post-commit hook
bunu her commit'te mekanik çalıştırıyordu — **auth düştüğünde SESSİZCE başarısız oluyordu**
(`nlm_sync_performed: true` yazıp hiçbir şey yüklemeden). Döngüde akıl olmadığı için kimse
fark etmiyordu; twin sessizce eskiyordu.

**Yönetici ilke:** Kırılgan adım, LLM'in döngüde olduğu yere taşınır. Yalnız LLM şunu yapabilir:
(a) önce auth'u tazele, (b) sync'i çalıştır, (c) **defteri sorgulayıp gerçekten güncellendiğini
doğrula**, (d) dürüst raporla. Bu yüzden:

- **post-commit hook artık YEREL-only** — sadece `system_tree.md`'yi tazeler, NLM'e DOKUNMAZ.
- **NLM sync = bu skill** ile, milestone'da (örn. bir R-fazı/özellik bitince) elle tetiklenir.

## Sync Adımları (sırayla)

> Komutlar `orion doc ...` ile çalışır (`cc` eski alias'tır, hâlâ çalışır ama `orion` kullan).
> Aşağıda `<ROOT>` = repo kökü (ör. `c:/Users/alize/venthub-hvac`).

### Adım 0 — Auth TAZELE (her sync'in ZORUNLU ilk adımı)

```bash
powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-headless-refresh.ps1
```

Penceresiz (~15sn), şifre girişi yok — kayıtlı Chrome profilinden taze cookie çeker.
Bitince MCP'ye tanıt: `refresh_auth` tool'unu çağır. Çıktıda "✓ Authentication valid!" görmelisin.
> (İsteğe bağlı) CLI tazeliği: `pip install --upgrade notebooklm-mcp-cli`.

### Adım 1 — Yerel dokümanları güncelle (NLM'e dokunmadan)

```bash
orion doc all --changed-only                          # değişen kaynak .md'leri üret
orion doc batch --batch-dir supabase/functions        # edge function master
orion doc schema --no-use-dump                         # DB şema master (baseline snapshot'tan)
```

> `orion doc schema` artık bağlı ve çalışır. Kaynak merdiveni:
> `--sql-file > supabase db dump > supabase/baselines/ (en yeni) > migrations`.
> Docker kapalıyken baseline snapshot kullanılır → out-of-band tablolar da kapsanır.
> A3: sync ÖNCESİ bu adım çalışmalı, yoksa eski `.md` NLM'e gider.

### Adım 2 — Master birleştir + NLM'e YÜKLE

```bash
orion doc tree --nlm-sync --force-sync --repo-root <ROOT>
```

Eski master+standalone kaynakları siler, yenilerini yükler (Hard Reset). `--force-sync`
şablona uymayan `.md`'leri atlayıp sync'i durdurmaz.

### Adım 3 — DOĞRULA (sessiz-kaçırmayı yakalayan adım — ATLAMA)

Twin'i `notebook_query` ile sorgula ve gerçekten güncellendiğini gör:
- Kaynak listesi: `source_list_drive(notebook_id)` → beklenen dosyalar yeni ID'lerle orada mı?
- İçerik: son eklenen bir dokümana özel bir soru sor (ör. bayi modülü için "R0→B2 planı nedir?")
  ve cevabın doğru kaynağı (citation) gösterdiğini doğrula.

## .cc_docs.yaml — Sync Setinin SSOT'u

Twin'e NE gideceğini bu dosya belirler. **Yeni bir önemli doküman (standart/vizyon/audit)
twin'e girmesini istiyorsan `standalone_files`'a EKLE** — yoksa sync onu hiç görmez.

```yaml
source_dirs: [src, .]
master_md: "docs/venthub_hvac_master.md"
notebook_id: "235043eb-970f-4a52-9f39-1d02b2621e9c"
standalone_files: [README.md, CONTEXT.md, CHANGELOG.md, RECOMMENDATIONS.md, VISION.md,
  docs/database_schema_master.md, docs/design_system_config.md, docs/venthub_skills_master.md,
  docs/standards/admin-standard.md, docs/standards/admin-capabilities.md,
  docs/standards/dealer-network-standard.md, docs/standards/dealer-module-blueprint.md,
  docs/audits/dealer-data-ground-truth-2026-06-11.md,
  docs/reference/supabase/*.md]
extra_masters:
  - {name: "supabase_functions_master.md", source_dirs: "supabase/functions", output: "docs/supabase_functions_master.md"}
```

**ÖNEMLİ:** `standalone_files` master'a DAHİL EDİLMEZ (dupe önlemi). Standalone = kendi başlıklı
kaynak olarak yüklenir; sorgu/citation'da temiz görünür.

## İşlem Akışı (arka planda ne olur)

1. **migrator_lite:** Tree-sitter + LLM ile kaynak `.md`'leri 5N1K formatında üretir.
2. **batch:** `supabase/functions/` taranır, edge function master derlenir.
3. **schema:** DB şeması parse → `docs/database_schema_master.md` (Mermaid ER dahil).
4. **docs_tree:** `system_tree.md` + ana master derlenir (idempotent — yalnız içerik değişince yazar).
5. **NLM temizlik:** Eski master+standalone kaynaklar silinir.
6. **NLM yükleme:** Yeni master + standalone + extra master ayrı ayrı yüklenir.
   (Elle eklenen kaynaklar — Typography, lighthouse vb. — yönetilmediği için KORUNUR.)

## Hata Durumları

### "Authentication expired"
Adım 0'ı çalıştır (`nlm-headless-refresh.ps1`) → `refresh_auth` → komutu tekrarla.
Eski yöntem (görünür Chrome, ESET-yavaş) yerine **daima headless script**.

### `orion doc tree` → "0 MD NLM'e birlestirilecek"
- `.cc_docs.yaml` `source_dirs` doğru mu?
- `extra_masters.source_dirs` ana `source_dirs` ile çakışmasın.

### LLM Rate Limit (batch/all modda)
Durdur, `--force` olmadan tekrar başlat (hash ile tamamlananları atlar) →
kalanları `orion doc single --py-file <dosya>` ile tek tek → son çare elle yaz.

## AXIOMS

- **A1:** `standalone_files` master'a dahil edilmez (dupe önlemi).
- **A2:** Twin'de 3 master (frontend/functions/schema) + standalone set + elle-eklenenler bulunur.
- **A3:** Sync ÖNCESİ Adım 1 (all/batch/schema) çalışmalı — yoksa eski `.md` yüklenir.
- **A4:** Auth düşünce `nlm-headless-refresh.ps1` (headless) çalıştır, sonra `refresh_auth`.
- **A5:** Sync MILESTONE eylemidir; her commit'te DEĞİL. post-commit hook artık yerel-only.
- **A6:** Sync'i DOĞRULAMADAN (Adım 3) "tamamlandı" deme — sessiz-kaçırma ancak query ile yakalanır.
