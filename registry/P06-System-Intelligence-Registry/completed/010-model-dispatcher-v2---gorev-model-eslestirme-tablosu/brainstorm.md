# 🧠 Brainstorming: P06/010 — Model Dispatcher v2 Görev-Model Eşleştirme Tablosu
> **Skill:** superpowers-brainstorm | **Model:** Gemini 3.1 Pro (High) | **Tarih:** 26.03.2026
> **Yöntem:** Skill şablonu (Goal/Constraints/Context/Risks/Options/Recommendation/Acceptance)

## Goal
Ajanların ve kullanıcının kota verimliliğini korumak ve LLM yeteneklerini israf/suistimal etmemek için, `model-dispatcher` skiline yepyeni, gerçekçi ve teknik derinliğe dayanan detaylı bir Görev-Model Eşleştirme Tablosu oluşturmak. Aynı zamanda `manage_registry.py` içindeki `create-task` komutuna `--complexity` argümanı ekleyerek (`trivial, low, medium, high, expert` kademeleri), ajanın veya kullanıcının görev açtığı sahnede "doğru modeli" damgalamasını sağlamak. 

**Model Kademeleri:**
1. **Trivial (Basit İşler):** Gemini 3 Flash (Lint, Typo, Stil).
2. **Low (Rutin Kodlama):** Gemini 3.1 Pro (Low) / Medium OSS (Python AST, Temel Değişiklikler).
3. **Medium (Orta-İleri Mantık):** Gemini 3.1 Pro (High) (Çoklu-dosya State yönetimi, Kapsamlı senkronizasyon).
4. **High (Kompleks Mimari):** Claude 3.5 Sonnet (Thinking) (DB RLS Mimarisi, Yeni sistem kurulumu).
5. **Expert (Uç Nokta):** Claude 3 Opus (Kronik Bug çözümü, Yüzlerce dosyayı etkileyen dev dönüşümler).

## Constraints
- Python `manage_registry.py` komutu stabil kalmalı (`argparse` güncellenirken diğer komutlar patlamamalı).
- Workflow dosyalarının (örn. `/bitir`) tepesine veya başlığına bu yetenekler gömülmeli.
- Modele haksızlık edilmemeli; zira "Low" etiketi kötü demek değil, "Hızlı Karar Veren, Optimize Edilmiş Gemini 3.1 Pro Ana Motoru" demektir.

## Known context
- Şu an `model-dispatcher` skili ajanlara "Mission Control" basmalarını söylüyor ama 3 seviyeli basit bir hiyerarşi vardı.
- `registry/manage_registry.py` komutları argparse üzerinden geçiyor.
- Görevler `TEMPLATES` ile markdownda basılıyor.

## Risks
- `--complexity` seçeneğinin ezberden veya kısayol hataları nedeniyle `create-task` komutunu kırması.
- Metin şablonuna format atarken Python `KeyError` alınabilmesi.

## Options (2–4)
- **Option 1:** Sadece Markdown tablo koy, CLI güncellemesini atla.
- **Option 2:** Markdown tablosunu 5 gerçekçi kademeyle güncelle. `manage_registry.py create-task` fonksiyonuna `--complexity` (trivial/low/medium/high/expert) dahil et. Dosya doğduğunda frontmatter'a veya gövdeye `> **Önerilen Model:** ...` eklensin. Tüm workflow dosyalarının başına otonom karar almayı kolaylaştıracak etiket vurulsun.

## Recommendation
**Option 2** uygulanmalıdır. Otonom Registry, doğan her görevin karakterini doğduğu an bilmelidir. Model yeteneklerinin kalibrasyonu (Flash ile Gemini 3.1 Pro arasındaki devasa fark) gerçek mühendislik çerçevesinde kodlanmalıdır.

## Acceptance criteria
1. `model-dispatcher/SKILL.md` dosyasında 5 devreli (Trivial, Low, Medium, High, Expert) yeni, yeteneklerin hakkını veren tablo oluşturulmalı.
2. `manage_registry.py create-task` komutuna `-c/--complexity {trivial, low, medium, high, expert}` eklenip taslağa modelin adı yazılmalı.
3. `/bitir`, `/superpowers-brainstorm`, `/yeni-ozellik` gibi iş akışlarına `[Önerilen Model: ...]` etiketi işlenmeli.