# Skill kullanım sayımı: son 7 gün, departman başına — 2026-11-06

Kart: YTN-46 (YETENEK panosu). Emir: OPS, 6 Kasım (hazırlanan skill altyapısı kullanılmıyor). Yazan: YETENEK.
Kaynak: `skill-kullanim-sayimi-2026-11-01.md` ile aynı betik (`skill-kullanim-sayimi.cjs`, salt okuma); 1 Ekim - 6 Kasım dökümlerinden **30 Ekim - 6 Kasım** süzüldü, yeniden ölçülmedi. Set kaynağı: `skill-departman-setleri-2026-09-30.json` (müdür çekirdeği).
Tazelik: 6 Kasım 13:30 dökümleri; yeni skill ya da yeni pencere gelince bayatlar.

## Yöntem

Yalnız yapılandırılmış `tool_use` blokları sayıldı. **Skill çağrısı** = modelin Skill aracıyla skill açması; **SKILL.md okuması** = modelin dosyayı Read ile elle açması. Departman, dökümün worktree klasör adından (`*-pencere`) çıkarıldı; YETENEK penceresi `clever-mayer-b2d2d2`. Çalışan açılışı = o departmanın çalışan ajan türlerinin (araştırmacı, çürütücü, doğrulayıcı, uygulayıcı) açılış sayısı; çalışana ön yüklenen skill'ler bu açılışlarla gelir ve ayrıca sayılmaz.

## Tablo

| Departman | Pencere dökümü | Skill çağrısı | SKILL.md okuması | Çekirdek skill | Çekirdekten tetiklenen | Çekirdekte hiç tetiklenmeyen | Çalışan açılışı |
|---|---|---|---|---|---|---|---|
| 3D | yok | 0 | 0 | 6 | 0 | 6 | 0 |
| ADMIN | yok | 0 | 0 | 11 | 0 | 11 | 0 |
| ALTYAPI | var | 0 | 6 | 11 | 1 | 10 | 45 |
| ARAC | var | 0 | 0 | 13 | 0 | 13 | 15 |
| BLOG | var | 3 | 0 | 7 | 1 | 6 | 86 |
| EDGE | yok | 0 | 0 | 10 | 0 | 10 | 0 |
| GEO-SEO | var | 2 | 0 | 10 | 0 | 10 | 0 |
| HARITA | var | 0 | 0 | 13 | 0 | 13 | 1 |
| I18N | yok | 0 | 0 | 10 | 0 | 10 | 0 |
| KATALOG | var | 0 | 0 | 10 | 0 | 10 | 0 |
| MEVZUAT | yok | 0 | 0 | 7 | 0 | 7 | 8 |
| OPS | var | 2 | 0 | 12 | 0 | 12 | 20 |
| SATIS | yok | 0 | 0 | 10 | 0 | 10 | 0 |
| TASARIM | yok | 0 | 0 | 7 | 0 | 7 | 0 |
| URUN | var | 0 | 0 | 11 | 0 | 11 | 6 |
| YETENEK | var | 1 | 14 | 7 | 1 | 6 | 5 |

"Pencere dökümü yok" = bu hafta o ada ait pencere klasörü bulunmadı; sıfır "kullanmadı" değil "ölçülemedi" de olabilir (pencere başka klasörde açılmış olabilir).

## Çekirdekte olup 7 günde hiç tetiklenmeyen skill (departman başına)

- **3D**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, calisma-kopyasi-sil
- **ADMIN**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, qa, mutasyon-testi, calisma-kopyasi-sil
- **ALTYAPI**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, agy-orchestrate, git-commit, calisma-kopyasi-sil
- **ARAC**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, refactor-planner, sdd, mnemosyne, maestro, agy-orchestrate, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **BLOG**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, calisma-kopyasi-sil
- **EDGE**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **GEO-SEO**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, qa, rehber-yayin, calisma-kopyasi-sil, dizin-takip, seo-olcum
- **HARITA**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, refactor-planner, sdd, maestro, agy-orchestrate, git-commit, notebooklm-sync, orion-cli, calisma-kopyasi-sil
- **I18N**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **KATALOG**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **MEVZUAT**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, ce-uygunluk-dosyasi, calisma-kopyasi-sil
- **OPS**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, sdd, git-commit, notebooklm-sync, office-hours, to-prd, video-kaynak, calisma-kopyasi-sil
- **SATIS**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, mutasyon-testi, calisma-kopyasi-sil
- **TASARIM**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, git-commit, qa, calisma-kopyasi-sil
- **URUN**: wrongstack-kanban, wrongstack-mailbox-mcp, multi-agent, git-flow, refactor-planner, sdd, maestro, git-commit, qa, mutasyon-testi, calisma-kopyasi-sil
- **YETENEK**: wrongstack-mailbox-mcp, multi-agent, prompt-engineering, git-flow, git-commit, calisma-kopyasi-sil

## Okuma

1. Bir haftada yalnız 8 Skill çağrısı oldu: BLOG 3, GEO-SEO 2, OPS 2, YETENEK 1. Biri proje skill'i (rehber-yayin); kalanı eklenti ya da kullanıcı skill'i.
2. 20 SKILL.md okumasının 14'ü YETENEK, 6'sı ALTYAPI. Diğer departmanlar skill dosyası açmadı.
3. Çalışan açılışı yüksek (BLOG 86, ALTYAPI 45); çalışana ön yüklenen skill'ler bu yoldan iş görür ve burada görünmez. Müdür çekirdeği ise adıyla çağırma beklentisiyle duruyor ve çağrılmıyor.
4. 7 günlük pencere kısa: 4 Aralık sayımı (27 sıfır-tetik skill) bu tabloyu 30 günle tamamlar.
