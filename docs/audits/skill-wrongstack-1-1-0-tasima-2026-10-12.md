# WrongStack skill'lerinin 1.0.26 → 1.1.0 taşıması (YTN-18, 2026-10-12)

Yazan: YETENEK. Emir: OPS 12 Ekim 14:25 (Recep isteği: skill'ler yeni sürüme taşınsın, gereksiz denetim olmasın).
Cetvel: `execution-method-standard.md` (yöntem), `docs/audits/skill-departman-setleri-2026-09-30.md` (set bağları ve bütçe),
kapı `INV-SKILL-BAGLI-1`. `.agent/skills` değişmedi.

## 1. Ne ölçüldü

İki kaynak kopyası karşılaştırıldı: `@wrongstack/core` 1.0.26 (36 skill) ve 1.1.0 (114 skill; 78 yeni, hiçbiri silinmedi).
Depoda "1.0.26" etiketli 24 skill vardı; 24'ü de 1.1.0'da değişmiş. "Yalnız etiket" kümesi boştu.

Bizim uyarlamalarda kaynak gövde harfi harfine duruyordu (23/24 birebir; `security-scanner` farkı yalnız bizim maskelediğimiz
örnek özel-anahtar başlığı). Bu yüzden taşıma elle yeniden yazım değil, **gövde değiştirme**: eski gövde çıkar, 1.1.0 gövdesi girer;
"Araç eşlemesi", "VentHub ek kuralları" ve ortak bitiş bloğu dokunulmadan kalır. Yeni gövdelerde eşleme tablosuna girecek yeni araç adı çıkmadı.

## 2. Skill başına değişim (SKILL.md satırı; + eklenen, − çıkan)

| Skill | 1.0.26 | 1.1.0 | Fark | Not |
|---|---|---|---|---|
| api-design | 126 | 148 | +26 −4 | |
| bug-hunter | 330 | 194 | +98 −234 | yeniden yazıldı; yeni `references/` 2 dosya |
| chimera | 279 | 195 | +17 −101 | yeni `references/report-contract.md` |
| code-review | 123 | 139 | +17 −1 | |
| codebase-navigation | 112 | 129 | +19 −2 | |
| data-governance | 119 | 124 | +28 −23 | |
| debugging | 130 | 193 | +68 −5 | |
| git-flow | 126 | 143 | +18 −1 | |
| mnemosyne | 181 | 199 | +25 −7 | |
| multi-agent | 313 | 90 | +83 −306 | yeniden yazıldı; yeni `references/collab-debug.md` |
| node-modern | 118 | 147 | +40 −11 | |
| observability | 115 | 132 | +18 −1 | |
| prompt-engineering | 115 | 132 | +18 −1 | |
| react-modern | 152 | 176 | +28 −4 | |
| refactor-planner | 343 | 76 | +53 −320 | yeniden yazıldı |
| research-web | 371 | 76 | +56 −351 | yeniden yazıldı |
| sdd | 156 | 163 | +29 −22 | |
| security-scanner | 203 | 88 | +70 −185 | yeniden yazıldı; örnek anahtar başlığı maskesi korundu |
| testing | 137 | 187 | +56 −6 | |
| typescript-strict | 131 | 157 | +40 −14 | |
| verify-before-done | 105 | 146 | +45 −4 | |
| web-platform-baseline | 127 | 147 | +21 −1 | `references/` 3 dosya yenilendi |
| wrongstack-kanban | 158 | 173 | +17 −2 | ek kurallar kısmı ARC-109 envanterinden sonra |
| wrongstack-mailbox-mcp | 102 | 118 | +17 −1 | ek kurallar kısmı ARC-109 envanterinden sonra |

Ortak ekler (1.1.0): her skill'e `trigger` ve `routing-group` alanı, "Selection card" bölümü ve konuya özgü bir bölüm
(ör. code-review: "Evidence identity", kanban: "Board identity and lost leases").

## 3. Bizde ne değişti

- 24 `SKILL.md` (gövde 1.1.0, `kaynak`/`uyarlama`/"Kaynak" notu ve description'daki sürüm etiketi 1.1.0); açıklama uzunluğu aynı (oturum yükü bütçesi etkilenmedi).
- 4 skill'e `references/` dosyaları (bug-hunter, chimera, multi-agent, web-platform-baseline).
- `docs/audits/skill-departman-setleri-2026-09-30.json` ve `.md`: `kb` alanları diskten yenilendi (102 girdi; ör. research-web 18,2 → 7,3 K, bug-hunter 18,0 → 12,3 K, debugging 9,8 → 13,0 K).
- **Set bütçesi:** yenilenen boyutla tek set 35 KB'ı aştı: I18N-doğrulayıcı (36,3 KB). `code-review` ön yüklemeden "adıyla çağır"a alındı (26,7 KB); `.claude/agents/i18n-dogrulayici.md` yeniden üretildi (tek fark `skills:` listesinden `code-review` çıktı).
- `NOTICE.md`: üç satırın sürümü 1.1.0.

## 4. Bu PR'da OLMAYAN

- `wrongstack-kanban` ve `wrongstack-mailbox-mcp` için "VentHub ek kuralları" düzeltmesi: ARC-109 özellik envanteri (17:00) sonrası ayrı küçük PR.
- Dış skill alımı (REC-515): 1.1.0 paketindeki 78 yeni skill aday havuzu; aday tablosu ayrı belge, kurulum ayrı onay.
- `.claude/skills-hazir/` altındaki `mailbox-bridge` ve `wrongstack-mailbox` (etkin değil, 1.0.26 olarak kaldı).

## 5. Doğrulama

Kapılar: `skill-bagli`, `skill-yuku-butcesi`, `skill-frontmatter-ayrisir`, `skill-katalog-tazeligi`, `skill-listesi-say`, `skill-ad-cakismasi`,
`skill-bitis-blogu`, `skill-python-yedegi`, `ajan-skill-cozulur`, `ajan-tanimlari`, `skills-hazir`, `skills-eval-puanlama`: 12 dosya, 110 test yeşil.
İlgili test paketi sonucu PR gövdesinde. Tetik cümlesiyle çağrı doğrulaması: PR gövdesinde.
