# 📋 Implementation Plan: P06/010 — Model Dispatcher v2 Görev-Model Eşleştirme Tablosu

> **Brainstorm:** `registry/P06-System-Intelligence-Registry/backlog/010-model-dispatcher-v2---gorev-model-eslestirme-tablosu/brainstorm.md` — Option 2 seçildi
> **Model:** Gemini 3.1 Pro (High) | **Tarih:** 26.03.2026
> **Tahmini Toplam Süre:** ~45 dakika (3 adım × ~15 dk + test)

## Hedef
Model Dispatcher skiline açık bir Görev-Model Matrisi ekleyip, 5 seviyeli kompleksite modelini (Trivial, Low, Medium, High, Expert) devreye almak. Bütün workflow dosyalarının başına otonom karar almayı kolaylaştıracak "[Önerilen Model]" etiketleri vurmak ve registry `create-task` koduna `-c` (`--complexity`) mantığını kazandırarak işin ağırlığını henüz en baştan Markdown şablonuna damgalamak.

## Varsayımlar
- `registry/manage_registry.py` içindeki `create-task` metodu stabil ve yeni `argparse` opsiyonlarına açık. `Task` üretim şablonu bir string formatter'dır.
- 5 kademeli model önerileri şöyledir:
  `trivial`: Gemini 3 Flash
  `low`: Gemini 3.1 Pro (Low)
  `medium`: Gemini 3.1 Pro (High)
  `high`: Claude 3.5 Sonnet
  `expert`: Claude 3 Opus
- Registry komutu değişimi otonom sistemler veya testleri kırmayacaktır.

## Plan

1. **`model-dispatcher/SKILL.md` Tablosunun Oluşturulması**
   - **Dosyalar:** `.agent/skills/model-dispatcher/SKILL.md`
   - **Değişiklik:** "Model Seçim Matrisi (Routing)" başlığı altına 3 sütunlu (Kategori|Örnek Görev & Risk|Önerilen Model) Markdown tablosunu 5 kademe ile ekle.
   - **Doğrulama:** Tablonun içeriğinin `type` veya `view_file` ile kontrolü.

2. **Workflow Kodlarına `[Önerilen Model]` Etiketi Enjeksiyonu**
   - **Dosyalar:** `.agent/workflows/` içindeki kritik dosyalar: `bitir.md`, `hata-coz.md`, `yeni-ozellik.md` vb.
   - **Değişiklik:** `bitir` ve basit script işleri için `trivial (Gemini 3 Flash)`, `superpowers-write-plan` ve benzeri taslak çıkarımları için `low (Gemini 3.1 Pro (Low))`, `yeni-ozellik` veya `hata-coz` (karmaşık olanlar) için en az `medium (Gemini 3.1 Pro (High))` veya `high` önermesini frontmatter altına yerleştir.
   - **Doğrulama:** `grep_search` aracıyla dosyalardaki güncellemeyi teyit et.

3. **Registry CLI `create-task`'e `--complexity` Eklemesi**
   - **Dosyalar:** `registry/manage_registry.py`
   - **Değişiklik:**
     - `create-task` alt parser'ına `-c, --complexity` (seçenekler: trivial, low, medium, high, expert) opsiyonu (varsayılan=medium) ekle.
     - Görev yaratımındaki string formatı içinde (veya altına) `> **Önerilen Model:** {model_önerisi}` şeklinde mapping üzerinden (trivial->Flash, vb.) şablon enjeksiyonu yap.
   - **Doğrulama:** `python registry/manage_registry.py create-task P99 101 --complexity low` komutu çalıştırıldığında hata vermemesi ve görev şablonunda `Gemini 3.1 Pro (Low)` yazması.

## Riskler ve Azaltmalar
- **Risk:** Argparse yapısının veya string `TEMPLATE` in format değişikliğinde bozulması.
- **Azaltma:** Enjeksiyonlar basit Python koşullarıyla yapılacak, format karakterleri dikkatli kullanılacak.

## Geri Dönüş (Rollback) Planı
- Değişimlerde Python scripti çatlarsa, `git restore registry/manage_registry.py` ile eski stabil haline dönülecek.