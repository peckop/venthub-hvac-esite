# Skill kullanım sayımı: son 7 gün, departman başına — 2026-11-15

Kart: YTN-57 (YETENEK panosu). Haftalık düzenli görev ("skill ölçümü", `scripts/belge/rol-gorevleri.json`). Yazan: YETENEK.
Kaynak: `skill-kullanim-sayimi.cjs` (salt okuma), `--since=2026-11-08`; 472 döküm dosyası, 373 kayıt (58 Skill çağrısı, 6 SKILL.md okuması, 309 ajan açılışı). Set kaynağı: `skill-departman-setleri-2026-09-30.json` (müdür çekirdeği).
Önceki sayım: `skill-kullanim-sayimi-2026-11-06.md` (30 Ekim - 6 Kasım). Tazelik: 15 Kasım 18:45 dökümleri.

## Yöntem

6 Kasım sayımıyla aynı. Yalnız yapılandırılmış `tool_use` blokları sayıldı. **Skill çağrısı** = modelin Skill aracıyla skill açması; **SKILL.md okuması** = dosyanın Read ile elle açılması. Departman, dökümün worktree klasör adından çıkarıldı (`*-pencere`; YETENEK `clever-mayer-b2d2d2`, TASARIM `zealous-austin-5f3860`). Çalışan açılışı = o departmanın çalışan ajan türlerinin açılış sayısı; çalışana ön yüklenen skill'ler bu açılışlarla gelir ve ayrıca sayılmaz. Bir departmanın satırındaki Skill çağrısı, o pencerenin alt ajanlarının çağrılarını da içerir.

## Tablo

| Departman | Pencere dökümü | Skill çağrısı | SKILL.md okuması | Çekirdek skill | Çekirdekten tetiklenen | Çekirdekte hiç tetiklenmeyen | Çalışan açılışı |
|---|---|---|---|---|---|---|---|
| 3D | yok | ölçülemedi | ölçülemedi | 6 | ölçülemedi | ölçülemedi | 0 |
| ADMIN | yok | ölçülemedi | ölçülemedi | 11 | ölçülemedi | ölçülemedi | 0 |
| ALTYAPI | var | 1 | 0 | 11 | 1 | 10 | 22 |
| ARAC | var | 3 | 0 | 13 | 2 | 11 | 42 |
| BLOG | var | 2 | 0 | 7 | 0 | 7 | 138 |
| EDGE | yok | ölçülemedi | ölçülemedi | 10 | ölçülemedi | ölçülemedi | 0 |
| GEO-SEO | var | 1 | 0 | 10 | 1 | 9 | 4 |
| HARITA | var | 0 | 0 | 13 | 0 | 13 | 2 |
| I18N | yok | ölçülemedi | ölçülemedi | 10 | ölçülemedi | ölçülemedi | 0 |
| KATALOG | var | 1 | 0 | 10 | 0 | 10 | 10 |
| MEVZUAT | yok | ölçülemedi | ölçülemedi | 7 | ölçülemedi | ölçülemedi | 3 |
| OPS | var | 2 | 1 | 12 | 0 | 12 | 17 |
| SATIS | yok | ölçülemedi | ölçülemedi | 10 | ölçülemedi | ölçülemedi | 0 |
| TAKIP | yok | ölçülemedi | ölçülemedi | 6 | ölçülemedi | ölçülemedi | 1 |
| TASARIM | var | 43 | 2 | 7 | 0 | 7 | 47 |
| URUN | var | 2 | 0 | 11 | 0 | 11 | 5 |
| YETENEK | var | 3 | 3 | 7 | 0 | 7 | 3 |

"Pencere dökümü yok" = bu hafta o ada ait pencere klasöründe kayıt bulunmadı; sıfır "kullanmadı" değil "ölçülemedi" demektir. İki klasör departman adına eşlenemedi ve tabloya girmedi: MEVZUAT çalışanlarını açan bir klasör (3 açılış) ve TAKIP adını taşıyan sonekli bir klasör (2 açılış); ikisinde de Skill çağrısı yok.

## Hangi skill çağrıldı (58 çağrı)

| Departman | Skill (çağrı sayısı) |
|---|---|
| TASARIM | panel-gezinme 41 (hepsi çalışan ajanlardan, 13-15 Kasım), chrome-browser 1, skills-creator 1 |
| ARAC | mnemosyne 1, calisma-kopyasi-sil 1, plugin-authoring 1 |
| YETENEK | skill-creator 3 |
| BLOG | artifact-design 2 |
| OPS | chrome-browser 2 |
| URUN | office-hours 1, plan-challenger 1 |
| ALTYAPI | calisma-kopyasi-sil 1 |
| GEO-SEO | seo-olcum 1 |
| KATALOG | research-web 1 |
| HARITA | yok |

## Çekirdekte olup 7 günde hiç tetiklenmeyen skill (departman başına)

- **3D, ADMIN, EDGE, I18N, MEVZUAT, SATIS, TAKIP**: ölçülemedi (bu hafta pencere dökümü yok); "kullanmadı" diye okunmaz.
- **ALTYAPI**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, agy-orchestrate, git-commit, mutasyon-testi
- **ARAC**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, refactor-planner, sdd, maestro, agy-orchestrate, git-commit, mutasyon-testi
- **BLOG**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, rehber-yayin, calisma-kopyasi-sil
- **GEO-SEO**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, qa, rehber-yayin, calisma-kopyasi-sil, dizin-takip
- **HARITA**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, refactor-planner, sdd, maestro, agy-orchestrate, git-commit, notebooklm-sync, orion-cli, calisma-kopyasi-sil
- **KATALOG**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **OPS**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, sdd, git-commit, notebooklm-sync, office-hours, to-prd, video-kaynak, calisma-kopyasi-sil
- **TASARIM**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, qa, calisma-kopyasi-sil
- **URUN**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, qa, mutasyon-testi, calisma-kopyasi-sil
- **YETENEK**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, git-commit, calisma-kopyasi-sil

## Okuma

1. Skill çağrısı 8'den 58'e çıktı, ama artışın 41'i tek skill ve tek departman: panel-gezinme, TASARIM çalışanlarından. Bu, 13 Kasım'da çalışan tanımına "adıyla çağır" satırıyla bağlanan skill'in (YTN-55) üç günde düzenli kullanıldığını gösteriyor. panel-gezinme çıkarılınca kalan 17 çağrı geçen haftanın 8'inin yaklaşık iki katı.
2. Müdür çekirdeğinden tetiklenen skill toplamı 4: ALTYAPI 1 (calisma-kopyasi-sil), ARAC 2 (mnemosyne, calisma-kopyasi-sil), GEO-SEO 1 (seo-olcum). Geçen hafta 2 idi (BLOG 1, ALTYAPI 1). On pencerenin altısında çekirdekten tetiklenen skill sıfır.
3. YTN-47 pilotu için ara okuma (hüküm değil, ölçüm tarihi 4 Aralık): ALTYAPI'da ön yüklenen calisma-kopyasi-sil bu hafta 1 kez çağrıldı; BLOG'da ön yüklenen rehber-yayin 0 kez çağrıldı (BLOG tabanı 1'den 0'a indi); OPS 0'da kaldı.
4. Her pencerede hiç tetiklenmeyen ortak altı skill aynı: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit ve (verildiği yerde) calisma-kopyasi-sil. Kanban, posta kutusu ve git işleri bu hafta da skill açılmadan, doğrudan araç ve komutla yapıldı; bu altı skill için "skill'e ihtiyaç var mı" sorusu 4 Aralık sayımında yanıtlanacak.
5. Görev eşiği ("kullanılmayan atanmış skill 0 ya da her biri için yazılı gerekçe") sağlanmıyor: on pencerede 97 çekirdek ataması tetiklenmedi ve gerekçe yalnız ortak altı skill için yukarıdaki maddede var. Kalanlar (sdd, maestro, refactor-planner, mutasyon-testi, agy-orchestrate, prompt-engineering, qa ve departmana özel olanlar) işe bağlı skill'ler; 7 günlük pencere bunlar için kısa. Karar 4 Aralık 30 günlük sayıma bırakıldı (YTN-38, YTN-47).
6. Sınırlar: yedi departmanın penceresi bu hafta ölçülemedi; çalışana ön yüklenen skill'lerin kullanımı bu yöntemle görünmez (yalnız açılış sayısı var: BLOG 138, TASARIM 47, ARAC 42).

## Kusur kaydı

Bu hafta yeni skill kusuru kaydedilmedi. Açık kayıt: qa skill'i `scripts/gez.mjs` (Playwright) yolunu tarif ediyor, tarayıcı kuralı ise gerçek tarayıcı istiyor (`.claude/skills/qa/SKILL.md`; OPS'a 26 Ekim'de bildirildi, karar bekliyor).
