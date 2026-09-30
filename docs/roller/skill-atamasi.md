# Skill–rol ataması (rol kartlarından türetilmiş)

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/skill-atamasi.json`); elle düzenleme. İçeriği (hangi skill hangi role, hangisi kapatılacak) YETENEK penceresi doldurur; iskelet REC-509.
> Ölçüt (INV-ROL-1): tablo anahtarları `.claude/skills` ile birebir; her skill bir rolde ya da "atanmadı: sebep"; rol kartlarındaki "Yetenek ve araç" satırıyla çift yönlü uyum. `.agent/skills` çift ağacı bu tablonun dışındadır.

Toplam 42 skill: 9 atanmış, 33 atanmadı.

| Skill | Roller | Konu | Durum |
|---|---|---|---|
| agy-orchestrate | — | — | atanmadı: YETENEK haritası bekleniyor |
| codegraph | ARAC | — | atanmış |
| create-migration | — | — | atanmadı: YETENEK haritası bekleniyor |
| diff-review | ALTYAPI, HARITA | — | atanmış |
| fallow | — | — | atanmadı: YETENEK haritası bekleniyor |
| find-skills | — | — | atanmadı: YETENEK haritası bekleniyor |
| git-commit | — | — | atanmadı: YETENEK haritası bekleniyor |
| graphify | — | — | atanmadı: YETENEK haritası bekleniyor |
| i18n-conventions | URUN, ADMIN | — | atanmış |
| investigate | — | — | atanmadı: YETENEK haritası bekleniyor |
| llm-council | — | — | atanmadı: YETENEK haritası bekleniyor |
| maestro | — | — | atanmadı: YETENEK haritası bekleniyor |
| multi-agent | — | — | atanmadı: YETENEK haritası bekleniyor |
| notebook-navigator | — | — | atanmadı: YETENEK haritası bekleniyor |
| notebooklm-sync | — | — | atanmadı: YETENEK haritası bekleniyor |
| office-hours | — | — | atanmadı: YETENEK haritası bekleniyor |
| orion-cli | — | — | atanmadı: YETENEK haritası bekleniyor |
| plan-challenger | OPS, ALTYAPI, HARITA | — | atanmış |
| prd-complexity-audit | — | — | atanmadı: YETENEK haritası bekleniyor |
| qa | — | — | atanmadı: YETENEK haritası bekleniyor |
| skills-creator | — | — | atanmadı: YETENEK haritası bekleniyor |
| supabase | KATALOG | — | atanmış |
| supabase-security | ALTYAPI | — | atanmış |
| task-observer | — | — | atanmadı: YETENEK haritası bekleniyor |
| threejs-webgl-performance | — | — | atanmadı: YETENEK haritası bekleniyor |
| to-issues | — | — | atanmadı: YETENEK haritası bekleniyor |
| to-prd | — | — | atanmadı: YETENEK haritası bekleniyor |
| typography | — | — | atanmadı: YETENEK haritası bekleniyor (MARKA kartı 'tipografi skill'leri' diyor ama adı yazmıyor) |
| ui-ux-pro-max | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-20-eksen-denetimi | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-architecture | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-auditor | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-enterprise-audit | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-global-rontgen | — | — | atanmadı: YETENEK haritası bekleniyor |
| venthub-tasarim-dili | MARKA | — | atanmış |
| vercel-composition-patterns | — | — | atanmadı: YETENEK haritası bekleniyor |
| vercel-react-best-practices | — | — | atanmadı: YETENEK haritası bekleniyor |
| verify-before-done | — | — | atanmadı: YETENEK haritası bekleniyor |
| video-kaynak | — | — | atanmadı: YETENEK haritası bekleniyor |
| web-design-guidelines | — | — | atanmadı: YETENEK haritası bekleniyor |
| wrongstack-kanban | ARAC | — | atanmış |
| wrongstack-mailbox-mcp | ARAC | — | atanmış |

## Kartta geçen ama proje skill'i olmayan adlar

- `ast-grep`: araç (skill değil)
- `security-check`: global skill (projede yok)
- `seo-audit`: eklenti skill'i (brightdata-plugin:seo-audit; projede yok)
- `design-dna`: global skill (projede yok)
