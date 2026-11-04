# Sınavsız 32 skill: 30 günlük tetik sayımı — 2026-11-04

Kart: YTN-38 (YETENEK panosu). Emir: OPS, 4 Kasım (kapsam hükmü: 32 skill'in hepsine sınav yazılmayacak; önce sayım, en az 2 kez tetiklenene sınav, sıfır olanlar listede kalır, 4 Aralık'ta tekrar).

## KAYNAK / CETVEL

- Betik: `docs/audits/skill-kullanim-sayimi.cjs --since=2026-10-05` (salt okuma; YTN-3). Önceki sayım: `skill-kullanim-sayimi-2026-11-01.md` (28 skill, Ekim).
- Eşik (OPS): 5 Ekim – 4 Kasım arasında **Skill aracıyla tetiklenme >= 2** → sınav yazılır.
- Sayılan: yalnız yapılandırılmış `Skill` aracı çağrısı (döküm metni değil). 2974 döküm dosyası tarandı. Hariç: 12 Ekim YTN-18 taşıma testi (oturum `ffc159b2`, 23 skill'i birer kez açtı). `SKILL.md` okuması ve ajan ön yüklemesi ayrı sütundur, eşiğe girmez.
- Tazelik: bu sayım 4 Kasım 14:00 itibarıyla geçerli; **4 Aralık 2026'da aynı komutla tekrar** (`--since=2026-11-04`).

## Sonuç (32 skill)

| Skill | Skill çağrısı (30 gün) | SKILL.md okuması | Sınav |
|---|---|---|---|
| rehber-yayin | 6 | 3 | yazıldı, GECTI |
| write-seo-geo-content | 5 | 5 | yazıldı, GECTI |
| wrongstack-kanban | 5 | 7 | yazıldı, GECTI |
| codebase-navigation | 2 | 0 | yazıldı, GECTI (açıklama değişti) |
| research-web | 2 | 0 | yazıldı, GECTI (açıklama değişti) |
| tech-stack | 0 | 4 | yok (eşik altı) |
| wrongstack-mailbox-mcp | 0 | 4 | yok |
| geo-fundamentals | 0 | 3 | yok |
| incremental-implementation | 0 | 2 | yok |
| verify-before-done | 0 | 2 | yok |
| api-design, chimera, code-review, debugging, observability, payments-webhooks, react-modern, sdd, testing, web-performance | 0 | 1'er | yok |
| bug-hunter, data-governance, database-migrations, git-flow, mnemosyne, multi-agent, node-modern, prompt-engineering, refactor-planner, security-scanner, typescript-strict, web-platform-baseline | 0 | 0 | yok |

27 skill 30 günde hiç tetiklenmedi; listede kalır, 4 Aralık'ta aynı ölçüm yinelenir. Bu "kullanılmıyor" demek değil: `verify-before-done`, `testing`, `code-review` gibi bazıları çalışan tanımlarında ön yüklemeyle girer (Skill aracı gerekmez); bu sayım onu ölçmez.

## Sınav sonuçları ve iki bulgu

Rapor: `docs/audits/skills-eval-2026-11-04-ytn38.json` (Haiku, `claude -p`, tam katalog). Son koşu: beşi de GECTI (12/12 ve 8/8).

İlk koşuda iki skill düştü; ikisi de **açıklama çakışması**ydı, skill kusuru değil:

| Skill | İlk koşu | Sebep (kaçırılan sorgu ve modelin seçtiği skill) | Düzeltme | Açıklama baytı |
|---|---|---|---|---|
| codebase-navigation | tetik 0/12 | 12 sorgunun 12'si `codegraph`'a gitti ("kim çağırıyor", "nerede tanımlı", "etki analizi" codegraph işi) | Açıklama codegraph'tan ayrıldı: yön bulma, anlama/metne göre arama, tek sembol kaynağı okuma; çağıran/etki → codegraph. Sınav sorguları buna göre yeniden yazıldı (çağıran/etki sorguları artık "tetiklenmemeli"). Kararlılık: 3 ardışık koşu 12/12, 8/8 | 177 → 214 (+37) |
| research-web | tetik 8/12 | "güncel sürüm ne" paket sürümü sorularını `tech-stack`'e götürdü | Açıklamadan "güncel sürüm ne" çıkarıldı, "yönetmeliğin güncel hâli" ve "Paket sürümü tech-stack işidir" eklendi; paket sürümü sorguları "tetiklenmemeli"ye taşındı | 265 → 281 (+16) |

Oturum yükü toplamı +53 bayt; `skill-yuku-butcesi` kapısı yeşil.

Çekince: `claude -p` yolunda jeton ölçülemez; Haiku sonuçları koşudan koşuya oynar (codebase-navigation ilk düzeltmede 7/12, 12/12 ve 10/12 arasında gezdi, iki belirsiz sorgu değiştirilip üç ardışık koşuyla doğrulandı). Tek koşuluk GECTI güvence değil, eğilimdir.
