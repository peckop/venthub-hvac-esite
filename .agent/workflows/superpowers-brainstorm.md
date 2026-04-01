---
description: Superpowers brainstorm. Produces goal/constraints/risks/options/recommendation/acceptance criteria.
---

> **Önerilen Model:** Gemini 3.1 Pro (Low) *(Kategori: Low)*


# Superpowers Brainstorm

## 🕹️ Adım 0: MISSION CONTROL (Model Dispatcher)
Brainstorm işlemine SAKIN BAŞLAMA! Önce `.agent/skills/model-dispatcher/SKILL.md` kurallarını oku.
Görevin karmaşıklığını ve senin mevcut modelini (Flash/High/Sonnet) karşılaştırarak ekrana **ZORUNLU olarak [MISSION CONTROL]** panosunu bas.
Eğer mevcut modelin bu zeka fırtınasını yapmak için yetersizse dur ve kullanıcıdan model değişikliği (High/Sonnet) talep et. Sadece "Model Yeterli" durumunda aşağıdaki adıma geç.

## Task
Brainstorm for this task (exactly as provided by the user):
**{{input}}**

If `{{input}}` is empty or missing, ask the user to restate the task in one sentence and STOP.

## Output sections (use exactly)
## Goal
## Constraints
## Known context
## Risks
## Options (2–4)
## Recommendation
## Acceptance criteria

## Persist (Zorunlu)
Beyin fırtınası içeriğini oluşturduktan sonra, onu AŞAĞIDAKİ kurallara göre ZORUNLU olarak diske yazmalısın:

1. **[ŞARTLI KAYIT KURALI]:** 
   - **Eğer** üzerinde çalıştığın işlem bir Registry göreviyse (örn. `PXX-` gibi bir taslağı varsa), o görevin `.md` dosyasını bul ve `artifacts.brainstorm` yolunu oku. Kaydı doğrudan o yola yap.
   - **Eğer** Registry dışında, bağımsız jenerik bir beyin fırtınası yapıyorsan, standart `artifacts/superpowers/brainstorm.md` yolunu kullan. Asla olmayan bir Registry klasörü uydurmaya çalışma.
2. Dosyanın en tepesine MUTLAKA şu standart header bilgisini ekle:
   ```markdown
   # 🧠 Brainstorming: PXX/YYY — Görev Adı
   > **Skill:** superpowers-brainstorm | **Model:** Kullandığın Model (Örn: Flash/High) | **Tarih:** Günün Tarihi
   > **Yöntem:** Skill şablonu (Goal/Constraints... vd.)
   ```
3. `multi_replace_file_content` veya script aracılığıyla yazmayı gerçekleştir. Sentinel (Anti-Forgery) kalkanını geçebilmek için belgenin kriptografik imzasını atan `write_artifact.py` (veya Sentinel uyumlu tetikleyiciyi) otonom olarak kullanmalısın.
4. Kaydın başarılı olduğunu dosyanın içeriğini okuyarak teyit et. Dosyayı kaydettikten sonra DUR ve hiçbir kodu DÜZENLEME.
5. **Linear Sync (Varsa):** İlgili Linear issue mevcutsa, brainstorm özetini yorum olarak ekle:
   ```python
   mcp_linear_save_comment(issueId="VENT-XXX", body="## 🧠 Brainstorm Tamamlandı\n- Hedef: ...\n- Risk: ...\n- Öneri: ...")
   ```
   Linear'da issue yoksa bu adımı atla.