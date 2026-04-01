---
description: Runs a Superpowers-style review pass with severity levels.
---

# Superpowers Review

## 🕹️ Adım 0: MISSION CONTROL (Model Dispatcher)
Gözden geçirmeye (Review) SAKIN BAŞLAMA! Önce `.agent/skills/model-dispatcher/SKILL.md` kurallarını oku.
Söz konusu kodun ağırlığını (zorluğunu) değerlendir ve mevcut modelinle (Flash/High/Sonnet) karşılaştır. **ZORUNLU olarak [MISSION CONTROL]** panosunu bas.
Eğer mevcut modelin kod denetimi (code review) için yeterince "akıllı" değilse dur ve kullanıcıdan onay/model değişimi iste.

Read and apply the `superpowers-review` skill.

## Review Zorunlulukları (Anti-Halüsinasyon Kancası)
Review esnasında KESİNLİKLE şu kurala uygunluğu test etmelisin:
- **Fake Property Check:** TypeScript arayüzlerinde (Interface), Prisma şemalarında veya Zod modellerinde OLMAYAN "uydurma (hallucinated)" bir özellik (prop) UI'a veya fonksiyona atanmış mı? Eğer varsa bunu doğrudan **[BLOCKER]** olarak işaretle ve düzeltilmesini talep et. Testler ve derlemeler gerçek TS şemaları (Source of Truth) ile çalışmak zorundadır.
Output:
- Blockers
- Majors
- Minors
- Nits
- Summary + next actions

## Persist (mandatory)
After generating the review content above, you MUST write it to disk:

1) Copy the full review markdown output.
2) Run (veya `multi_replace_file_content` tool'unu kullanarak otonom Sentinel imzasıyla kaydet):

```bash
python .agent/skills/superpowers-workflow/scripts/write_artifact.py --path registry/<PXX_PROJENIN_ROTASI>/review.md

```

Provide the review markdown as stdin to the command.

After writing, confirm it exists by listing artifacts/superpowers/.

If you cannot run the command, say so explicitly and instruct the user to copy/paste the review output into artifacts/superpowers/review.md.
Do not implement changes in this workflow. Stop after persistence.
