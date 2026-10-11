# Ölçüm defteri: WrongStack tam özellik envanteri — "ne var, bizde ne durumda, almalı mıyız yazmalı mıyız"

Sahibi: ARAÇ · Son doğrulama: 2026-09-30 · Kaynak: Recep 09-29 (Ops aracılığıyla) "WrongStack'in tamamı lazım: hangi özellik var, hangisi yapılıyor, kalanlar ne, eksik mi, almamız mı yazmamız mı lazım; hatırlatma ve başka özellikler belki var" · Kayıt: REC-391

**Kural (README ile aynı):** WrongStack açılınca ÖNCE bu defter okunur. Yeniden ölçüm yalnız "Yeniden ölçme tetikleyicisi" oluştuysa ya da "ölçülmedi" satırı için yapılır; yapılınca AYNI deftere tarihli eklenir.

## Ne ölçüldü, nasıl

| Konu | Değer |
|---|---|
| Kapsam | WrongStack'in yayımlı 32 paketi (`@wrongstack/cli` ve bağlıları) + dört MCP sunucusu; MIT; kaynak salt okundu, hiçbir özellik çalıştırılarak denenmedi |
| Sürümler | npm'deki en yeni **1.0.29** (yayım 2026-09-29 23:48 TSİ); bizde kurulu **1.0.26** (`tools/wrongstack-mcp`, kilitli); önceki ölçümler 1.0.19 / 1.0.26 / 1.0.27 |
| Yöntem | Yalıtılmış kurulum (`npm install --prefix`, `--ignore-scripts`, scratchpad) + 5 Sonnet alt-ajanın alan alan okuması (A yüzeyler, B çekirdek ve skill, C hafıza, D kanban-posta-kod dizini, E yönetişim-eklentiler); üzerine ARAÇ'ın 1.0.29/1.0.26 `diff` karşılaştırması ve mevcut kayıtların birleştirilmesi |
| Mevcut kayıtlar (tekrar ölçülmedi) | memory: `wrongstack-gomulu-yetenek-envanteri`, `wrongstack-orkestrasyon-kiyasi`, `wrongstack-md-yonetimi`, `wrongstack-rol-hafiza-duzeni`; `tools/wrongstack-mcp/README.md`; REC-391 uyarlama tablosu (13 açık kalem); `.mcp.json` |
| Kanıt dili | "Okundu" = derlenmiş kodda görüldü; "Yalnız README" = belgede yazıyor, kodda doğrulanmadı; "Ölçülmedi" = bakılmadı. Hiçbir satıra tahmin yazılmadı |
| Sütunlar | Özellik · Ne işe yarar · Bizde durum (Kullanılıyor / Kısmen / Kurulu ama kapalı / Yok) · Kanıt · Önerim (Al-aç / Uyarla-yaz / Değerlendir / Gerek yok + gerekçe) · Sahibi · Linear kaydı |

## Özet hüküm

1. **WrongStack iki ayrı şeydir.** (a) Bir kodlama ajanı ürünü (CLI, TUI, WebUI, HQ, ACP, masaüstü, filo, otonom döngüler, 90 eklenti): bizde Claude Code olduğu için bilerek alınmadı ve almaya da gerek yok. (b) Dört MCP sunucusu (sage, kanban, mailbox, kod dizini): bizde kurulu ve kullanılıyor. Envanterin cevabı, "eksik" değil, "hangi parça uyarlanır" sorusudur.
2. **Bilinmezlik sayısı:** taranan 164 tablo satırının 103'ü "Gerek yok" (bazı satırlar birkaç yakın özelliği toplar); uyarlanacak (15) ve değerlendirilecek (14) olanlar ayrı işaretlendi (aşağıdaki Sayım). Açık REC-391 kalemlerinin **hiçbiri 1.0.29'da düzelmemiş** (K2, K3, K5, M3, C1 kodu bayt bayt aynı); yükseltme onları çözmez.
3. **HATIRLATMA:** WrongStack'te tarihe/saate bağlı hatırlatma **yok**. En yakın yüzeyler: oturum içi cron eklentisi (yalnız olay yayar), `mailbox_watch`/`kanban_watch` (25 sn'lik bekleme, uyandırmaz), Telegram köprüsü (bildirim gönderir, zamanlamaz). Ayrıntı aşağıda.
4. **Düzeltilen eski iddialar** listesi en altta (dört madde). Bunlar 09-28/09-29 notlarımdaki hatalardır.

## Sayım

| Bölüm | Satır | Kullanılıyor | Kısmen | Kurulu ama kapalı | Yok | Uyarla-yaz | Değerlendir | Gerek yok |
|---|---|---|---|---|---|---|---|---|
| A | 27 | 1 | 2 | 0 | 24 | 2 | 2 | 22 |
| B | 56 | 7 | 9 | 0 | 40 | 3 | 3 | 44 |
| C | 24 | 7 | 1 | 0 | 15 | 2 | 3 | 7 |
| D | 31 | 12 | 3 | 3 | 5 | 8 | 1 | 11 |
| E | 26 | 2 | 7 | 0 | 17 | 0 | 5 | 19 |
| **Toplam** | **164** | **29** | **22** | **3** | **101** | **15** | **14** | **103** |

Not: satır sayıları tablo satırlarıdır; bazı satırlar birkaç yakın özelliği (ör. 14 genel skill) tek satırda toplar. Bizde-durum ve önerim sütunlarında ilk kelimeye göre sayıldı; "Yok" ve önerimi boş bırakan satırlar (yalnız bilgi) toplamlara girmeyebilir.

Bölüm dizini: A yüzeyler · B çekirdek ve 36 skill · C hafıza · D kanban, posta, kod dizini, MCP, araçlar · E yönetişim, güvenlik, sağlayıcı, eklentiler · HATIRLATMA · REC-391 açık kalemleri 1.0.29'da · Recep kararları · Ölçülmeyenler ve düzeltmeler.

---

### A. Kullanıcı yüzeyleri (cli, tui, acp, simpleui, desktop, telegram, webui, webui-hq, webui-protocol, webui-server)

Kaynak: alt-ajan taraması, `@wrongstack/cli` 1.0.29 ve bağlı paketler, salt okuma. Kısaltma: CM = `cli/dist/cli-main-YS3HIOSD.js`, TUI = `tui/dist/index.js`.

| Özellik | Ne işe yarar | Bizde durum | Kanıt | Önerim | Sahibi | Kayıt |
|---|---|---|---|---|---|---|
| Terminal ajanı `wstack` (REPL, tek seferlik sorgu, oturum devam) | Terminalde kod yazan yapay zekâ ajanı | Yok (Claude Code kullanıyoruz) | package.json `bin`; README "Commands" | Gerek yok: Claude Code'un alternatifi, bilerek alınmadı | — | — |
| Ink TUI, WebUI (3456), SimpleUI (3466), HQ (3499), Açılış menüsü | Aynı ajanın dört ayrı arayüzü | Yok | README "Launch menu"; TUI:37387 | Gerek yok (ajan arayüzü, bizde Claude Code) | — | — |
| Slash komut seti (~62-70 komut: /model /mode /memory /plan /todos /goal /sdd /kanban /mailbox /security /tuneup /doctor…) | Ajanı oturum içinden yönetir | Yok | CM:9508–34524 | Gerek yok; tek tek fikirler aşağıda | — | — |
| `/plan`, `/todos`, `/tasks` | Oturumda kalıcı yol haritası, bağımlılıklı görev listesi | Yok; Claude Code'un TodoWrite'ı var | CM:23683, 32657, 31474 | Gerek yok | — | — |
| `/goal` fazlı otonom iş, `/autonomy eternal` | Projeyi fazlara böler, kendi kendine işler; oturum kapanınca "devam edilsin mi" sorar | Yok | CM:17297, 10317; execution-JEYF2L7O.js:5233–5290 | Gerek yok (bizde şerit + Linear + Ops sırası; sonsuz döngü kota riski) | — | — |
| `/bughunt` "Proof-Driven Bug Hunter" (`--rounds N`, kendini yeniden tetikleyen döngü) | Çok turlu hata avı; her bulgu kanıt ister | Yok. TUI'de ve WebUI'de var (README "yalnız TUI" demiyordu ama kod ikisinde) | TUI:75433–75549, 86404; webui `bugHunt`; istem core'da | **Uyarla-yaz:** istem metnini (core) Claude Code skill'ine çevir, "kanıtsız bulgu yazma" kuralı bizde zaten var, ek değeri tur döngüsü | ARAÇ | REC-391 yeni kalem |
| Memory Companion (host-memory-companion) | Bellekteki eski bir iddiayı güncel dosyalarla karşılaştırır; supported/outdated/contradicted/unverifiable/irrelevant hükmü verir. MCP değil, Director'ın açtığı salt-okunur alt ajan; tavan 0,15 USD/12k token/12 araç, oturum başına en çok 4 kontrol, bağlam baskısı ≥%82 ise durur | Yok | CM:2674–3080, 2751 (istem), 4594–4622 | **Uyarla-yaz:** bizim MEMORY.md/durum dosyası bayatlık sorunu tam bu; "iddia + kaynak dosya → hüküm" alt ajanı Claude Code'da yazılır (Haiku, salt okuma) | ARAÇ (+HARİTA belge) | REC-391 yeni kalem |
| Explore Companion | Oturuma bağlı kalıcı keşif alt ajanı | Yok; Claude Code'da Explore alt ajanı yerli var | CM:2179–2215 | Gerek yok (yerli karşılığı var) | — | — |
| Fleet / Director (`/fleet`, `/director`, `/supervisor`, `/shadow`, `/coordinator`, `/brain`) | Çok ajan yönetimi: alt ajan aç, görev ata, bütçe/eşzamanlılık, takılanı yönlendir, Shadow tek geçişte denetler, konsey | Yok; bizde kendi filo düzeni (pano, şeritler, Ops) | CM:31139, 16185–16215, 31332–31370, 30748–30800, 12553, 10836 | Gerek yok (kendi düzenimiz var); tek fikir: süreli kiralama, aşağıda C bölümünde | — | — |
| Kanban / mailbox / worktree komutları | Pano, posta kutusu, faz izolasyonu için worktree | Kısmen: kanban-mcp ve mailbox-mcp kurulu, komutlar yok | CM:19417, 19540, 34394 | Gerek yok (MCP araçları yeterli) | — | — |
| Mailbox HTTP köprüsü (`wstack mailbox serve`) | Dış ajanlar (Claude Code, Aider, betik) posta kutusuna REST+SSE ile yazar/okur; 120/dk sınır | Yok | README "Mailbox HTTP surfaces"; CM:20073 | **Değerlendir:** mesaj gelince alıcıyı uyandırma sorununun (M4) olası yolu; SSE dinleyen bir betik pencereyi uyandırmaz ama bildirim üretebilir. Ölçülmedi | ARAÇ | REC-391 M4 |
| `/sdd`, `/intake` (spec-driven akış, gereksinim toplama) | Spec→plan→görev; ham istek kaydı | Yok | CM:25172, 17748 | Gerek yok (iş emri düzenimiz ve KAYNAK/CETVEL bloğu var); ayrıntı E bölümünde | — | — |
| `/review` (Chimera), `/fix`, `/security`, `/tuneup` | Kod inceleme, hata sınıflama-düzeltme, tarama, sağlık | Yok; Claude Code'da /code-review, security-review yerli | CM:29212, 16017, 29366, 33958 | Gerek yok | — | — |
| `/techstack` | Bağımlılıkları kayıt defteriyle karşılaştırır | Yok; bizde Dependabot + ALTYAPI taraması | CM:31967 | Gerek yok | — | — |
| `/memory` (show/search/remember/update/forget/hygiene/verify/triage/compact) | Sage belleğini komutla yönetir | Kısmen: aynı işler sage-mcp araçlarıyla yapılıyor | CM:22046 | Gerek yok | — | — |
| `wstack sage connect` | Sage belleğini Claude Code/Codex/Cursor'a MCP olarak bağlar (salt okuma + öneri) | **Kullanılıyor** (aynı şeyi `.mcp.json` ile elle yapıyoruz) | helpTable `sage` | Gerek yok | — | — |
| `wstack import-claude-code` | Claude Code MCP ve `.mcp.json`'ı profile alır | Yok | helpTable | Gerek yok (ters yön) | — | — |
| `audit` (SHA-256 zincirli günlük), `replay`, `rewind`, `export`, `usage`, `chronicle` | Oturum denetimi, yeniden oynatma, geri sarma, kullanım dökümü | Yok | helpTable | **Değerlendir:** zincirli denetim günlüğü fikri, admin_audit_log için değil, ajan eylemleri için; şimdilik gerek yok | — | — |
| `doctor`, `diag`, `modeldiag`, `bench`, `governance status` | Tanılama ve model kıyası | Yok | helpTable | Gerek yok | — | — |
| `wstack remote` | Uzak makinede çalıştırıp WebUI'yi SSH tüneliyle açar | Yok | helpTable | Gerek yok | — | — |
| Eklenti / MCP yönetimi (`plugin`, `mcp add/serve`, `--full-auto`) | Eklenti ve MCP kaydı | Yok | helpTable | Gerek yok | — | — |
| HQ komuta merkezi (Cockpit, Fleet, Console, Kanban, Cost, Alerts, Control, Security), HQ mobil konsol + PWA, HQ uyarı motoru, hızlı tünel (cloudflared) | Makineler ve projeler arası fleet panosu, telefon arayüzü, eşik uyarıları | Yok | webui-hq README; hq-BNK67HOE.js:28–60; hq-tunnel-NIJ5EP2Y.js | Gerek yok (HQ, WrongStack ajanlarını yönetir; bizim ajanlarımız Claude Code) | — | — |
| ACP sunucu+istemci | WrongStack'i Zed/JetBrains/VS Code'a ajan yapar, dış ACP ajanlarını yönetir | Yok | acp/README | Gerek yok | — | — |
| Masaüstü (Electron) | Birden çok yerel çalışma zamanını tek pencerede yönetir | Yok | desktop dist/main/main.js:2007 | Gerek yok | — | — |
| WebUI (React) + webui-server + webui-protocol + SimpleUI | Tarayıcı istemcisi: sohbet, kanban, SDD, bellek, terminal, editör, git, kod haritası, analitik; kararlı mesaj şeması | Yok | webui README; webui-server dist/server/*.d.ts | Gerek yok | — | — |
| Telegram köprüsü (`telegram_send`, `telegram_read`, `telegram_approve`; olay bildirimi) | Bot ile ajanı bağlar: mesaj gönder/oku, düğmeli onay, uzun süren araç ve alt ajan bitişi bildirimi. Zamanlama YOK | Yok | telegram/dist/index.js:2012–2118, 1583–1650, 2440–2500; README `telegram_approve`'ı anlatmıyor, kod anlatıyor | **Karar konusu** (HATIRLATMA bölümüne bak) | ARAÇ | yeni kayıt gerekir |
| Tarayıcı bildirimi (WebUI), HQ mobil bildirim | Sekme arka plandayken bildirim, ses zili | Yok | webui `notify.ts`; mobile-app `showNotification` | Gerek yok | — | — |


### B. Çekirdek (`@wrongstack/core` 1.0.29) ve 36 hazır skill

Kaynak: alt-ajan taraması, salt okuma. Core "kernel + tipler + varsayılan gerçeklemeler" kütüphanesidir, `bin` yoktur; ajan döngüsünü sürmek için `cli` gerekir. Aşağıdaki "Döngü şart" olanlar WrongStack ajanı olmadan çalışmaz; bizde ajan Claude Code olduğu için bunların çoğu "Gerek yok" ya da "fikir alınır".

| Özellik | Ne işe yarar | Bizde durum | Kanıt | Önerim | Sahibi | Kayıt |
|---|---|---|---|---|---|---|
| DI konteyneri, tipli olay yolu, ara katman zinciri, iptal denetleyicisi | Ajan iskeleti | Yok | `dist/kernel/*.d.ts` | Gerek yok (kütüphane iskeleti) | — | — |
| Ajan döngüsü, sistem istemi oluşturucu, proje talimat dosyası (mtime değişince yeniden okur), modlar (default/brief/teach) | LLM-araç-yanıt döngüsünü sürer | Yok (Claude Code'un kendisi) | `dist/core/agent*.d.ts`, `system-prompt-*.d.ts`, `project-instructions.d.ts` | Gerek yok | — | — |
| **Döngü/çıkmaz tespiti** | Aynı araç imzası tekrarlanırsa `steer` (yönlendir) ya da `cut` (kes) kararı verir | Yok | `dist/core/agent-loop-detector.d.ts` | **Uyarla-yaz:** "patinaj" (aynı komutu tekrar tekrar deneme) bizde en pahalı hatalardan; PostToolUse kancasıyla aynı imza N kez tekrarlanınca uyarı. Ölçülmedi: Claude Code'da benzeri var mı | ARAÇ | REC-391 yeni kalem |
| `/btw` yönlendirme, kuyruk farkındalığı, "devam" niyet çözümü, araç koçu, konu değişimi önerisi, istem iyileştirici | Ajan çalışırken kısa not iletme ve sürüklenmeyi azaltma | Yok | `dist/core/btw.d.ts`, `queued-messages.d.ts`, `continue-intent.d.ts`, `tool-coach.d.ts`, `topic-shift-advisor.d.ts`, `prompt-enhancer.d.ts` | Gerek yok (Claude Code'un kendi kuyruğu var) | — | — |
| **Kanca sistemi** (11 olay: PreToolUse, PostToolUse, UserPromptSubmit, SessionStart, Stop, PreCompact, PostCompact, SubagentStart, SubagentStop, SessionEnd, Notification); engelleme ve girdi yeniden yazma; hata politikası açık/kapalı | Yaşam döngüsü olaylarında kabuk/HTTP/süreç-içi kanca | **Kullanılıyor** (Claude Code'un kendi kancaları, aynı olay adları) | `dist/types/hooks.d.ts:14-24`; kod "Claude Code kanca sözlüğünü izler" diyor | Gerek yok | — | — |
| Eklenti sistemi + harici eklenti keşfi ve ilk-çalıştırmada SHA-256 sabitleme (TOFU) | Araç, komut, kanca kaydı | Yok | `dist/plugin/*.d.ts` | Gerek yok | — | — |
| Slash komut kaydı, araç kaydı+sarma, araç yürütücü ve hata sınıflaması | Ajanın araç yüzeyi | Yok | `dist/registry/*.d.ts`, `execution/tool-executor.d.ts` | Gerek yok | — | — |
| Çalışma zamanı yetenek manifesti (~30 yetenek kimliği) | Yetenek adını araç adlarına bağlar | Yok | `dist/chunk-4O37ZWNL.js:53-310` | Gerek yok | — | — |
| İzin politikası (allow/deny/prompt), kapsamlı onay, oturum override, dizin kuralı, salt-okuma, YOLO risk kategorileri, `--restricted` kilitleme | Ajanın hangi aracı çalıştırabileceğini denetler | Kısmen: Claude Code izinleri + bizim kancalar (bash-write-guard, silme-baglanti-kapisi) | `dist/security/*.d.ts` | Gerek yok | — | — |
| Sır temizleyici, şifreli kasa, TOTP | Sırları maskeler, 2FA | Kısmen: sır tabanı ve tarama var | `dist/security/secret-scrubber.d.ts`, `secret-vault.d.ts`, `totp.d.ts` | Gerek yok | — | — |
| Oturum kaydı (JSONL), fork ağacı, geri sarma, çalışma alanı anlık görüntüsü, oturum kurtarma, oturum doktoru, oturum analizcisi | Oturumu saklar, geri sarar, bozuk günlüğü tanır | Kısmen: Claude Code kendi oturum kaydını ve `/rewind`'ı tutuyor | `dist/storage/session-*.d.ts` | Gerek yok | — | — |
| Zincirli araç denetim günlüğü (SHA-256) | Her araç çağrısı değiştirilemez sidecar günlüğe | Kısmen: `bash-write-audit` kancamız yazma kalemlerini denetliyor | `dist/storage/tool-audit-log.d.ts` | Gerek yok (kapsamı farklı, ihtiyaç doğmadı) | — | — |
| Deterministik yeniden oynatma | Provider isteğini kaydedip aynı yanıtla oynatır | Yok | `dist/replay/*.d.ts` | Gerek yok | — | — |
| Bağlam sıkıştırma (hybrid/intelligent/selective), acil kırpma, alt-ajan sıkıştırma, `context_manager` aracı | Uyarı/yumuşak/sert eşikte otomatik sıkıştırır | Yok; Claude Code'un kendi compact'ı ve bizim eşik uyarısı var | `dist/execution/compactor.d.ts`, `auto-compaction-middleware.d.ts` | Gerek yok | — | — |
| Yeniden deneme + yedek model zinciri, uyarlanabilir eşzamanlılık (429'da düşür, başarıda artır) | Sağlayıcı hatasında dayanıklılık | Yok | `dist/execution/retry-policy.d.ts`; `coordination/adaptive-concurrency.d.ts` | Gerek yok | — | — |
| **Model kataloğu + kota düzlemi (abonelik kotasını ve sıfırlanmasını izler)** | models.dev kataloğunu tazeler; abonelik kotasını izler | Yok | `dist/models/catalog-refresh.d.ts`, `dist/quota/index.d.ts` | **Değerlendir:** bizim "filo haftalık kotası doğrudan ölçülemiyor" sorunumuza dokunuyor. Claude aboneliği kotasını okuyup okumadığı ölçülmedi, salt okuma bakışı yapılır | ARAÇ | REC-422 ilişkili |
| Model takvimi (blackout / allow_only: gün, saat, saat dilimi) | Modelin ne zaman kullanılabileceğini sınırlar | Yok | `dist/core/model-availability-calendar.d.ts:1-40` | Gerek yok | — | — |
| Model yönlendirici + zeka profilleri, maliyet katmanı | Göreve göre alt ajan modeli seçer | Yok (kural: workflow ajan modeli elle belirtilir) | `dist/models/model-router.d.ts` | Gerek yok | — | — |
| Filo/Director (alt ajan başlatma, görev DAG'ı, ihale, konsensüs, değişiklik yaşam döngüsü, bütçe sınırı, süpervizör) | Çok ajan yönetimi | Yok; bizde kendi filo düzeni (pano, şeritler, Ops) | `dist/coordination/director.d.ts`, `fleet-supervisor.d.ts` | Gerek yok | — | — |
| **Proje posta kutusu (SQLite): gönder/oku/onayla/çevrimiçi, HTTP+SSE köprüsü, hız sınırı** | Ajanlar arası kalıcı mesaj | **Kullanılıyor** (mailbox-mcp, sarmalayıcıyla) | `dist/coordination/sqlite-mailbox.d.ts` | Mevcut açık kalemler D bölümünde | ARAÇ | REC-391 M3, M4 |
| `session_note` (canlı ajanlara bellek-içi not) | Lider ile canlı ajanlar arası anlık not | Yok; Claude Code'da SendMessage var | `dist/coordination/session-note-tool.d.ts` | Gerek yok | — | — |
| **Lider otomatik uyandırma** | Lider boştayken biten arka plan işi için yeni tur başlatır (debounce 1500 ms, zincir sınırı 5) | Kısmen: bizde arka plan görevi bitince Claude Code kendiliğinden yeniden çağırıyor; pencereler arası uyandırma doğrudan mesajla | `dist/coordination/delegation/leader-auto-wake.d.ts:1-70` | Gerek yok (M4 için bakınız D) | — | — |
| Brain + BrainMonitor, AutonomyBrain + Eternal otonomi, Goal/Phase orkestratörü, Council (çoklu persona oylama) | Karar katmanı ve otonom döngüler | Yok | `dist/coordination/brain*.d.ts`, `execution/eternal-autonomy.d.ts`, `goal/*.d.ts`, `execution/council-orchestrator.d.ts` | Gerek yok (Council'ın "çoklu görüş" fikri bizde llm-council skill'i olarak var) | — | — |
| Worktree izolasyonu, ölü kilit temizleyici | Görev başına git worktree | **Kullanılıyor** (kendi düzenimiz, karar 88) | `dist/worktree/worktree-manager.d.ts` | Gerek yok | — | — |
| **Commit güvenliği** | Commit'in oturumun yazmadığı işi süpürüp süpürmediğini denetler; "Warn-only by design" | Kısmen: bizim lane-guard ve bash-write-guard daha sert (reddeder) | `dist/coordination/commit-safety.d.ts` (:17) | Gerek yok | — | — |
| Mutasyon testi motoru ("Kaos Maymunu"), explore-companion, roster (86 ajan talimatı), proje ajanı öğrenmesi | Filo içi uzmanlaşma | Yok | `dist/coordination/mutation-engine.d.ts`; `instructions/agents/` | Gerek yok (mutasyon fikri: ALTYAPI "sabotaj doğrulaması" zaten uyguluyor) | — | — |
| Kalıcı bellek arayüzü (SAGE-uyumlu) + graf backend + konsolidatör/küratör | Bellek soyutlaması | Kısmen: sage-mcp üzerinden | `dist/storage/memory-*.d.ts` | Ayrıntı C bölümünde | — | — |
| Plan / todo / görev / hedef depoları | Kalıcı iş listeleri | Yok; bizde Linear + durum dosyası | `dist/storage/plan-store.d.ts`, `task-store.d.ts`, `goal-store.d.ts` | Gerek yok | — | — |
| Chronicle: zincirli hash'li SQLite olay günlüğü, metrik DB, retention, proje sunucusu, sağlık monitörü, sağlayıcı/karar/review/süreç/dosya adaptörleri | Ajan olaylarının değiştirilemez günlüğü | Yok | `dist/chronicle/*.d.ts`, `project-server.js` | Gerek yok | — | — |
| Gözlemlenebilirlik (tracer, OTLP, Prometheus, sağlık kontrolleri) | Metrik ve iz | Yok (Sentry var) | `dist/observability/*.d.ts` | Gerek yok | — | — |
| HQ yayıncısı + uyarı motoru (varsayılan 15 sn; maliyet 50 USD, bayat makine 120 sn, token süresi 24 sa) | Filo anlık görüntüsünü HQ panosuna iter, eşik uyarısı üretir | Yok | `dist/hq/alerts.d.ts`; `dist/chunk-KQHSUO37.js:475` | Gerek yok (uyarılar HQ panosuna gider, telefona değil) | — | — |
| Auto-review eklentisi, Chimera (oturum sonu review), uzman tetikleyici | Dosya değişimi/oturum sonu review alt ajanı tetikler | Yok; bizde ritüel ve `/code-review` | `dist/plugins/auto-review-plugin.d.ts`; `chimera-plugin.d.ts` | Gerek yok | — | — |
| Skill sistemi: keşif, kurulum, `$ad` mention, öneri, zorunlu skill kapısı (skill tam yüklenene dek mutasyon araçlarını reddeder) | Skill yönetimi | Kısmen: Claude Code'un skill sistemi; skill okuyucu `.claude/skills`'i de okuyor | `dist/skills/*.d.ts`; `dist/execution/skill-loader.d.ts:12-30` | Gerek yok | — | — |
| İstem kitaplığı: 233 hazır istem, 15 kategori | Hazır istem koleksiyonu (MIT) | Yok | `data/prompts/index.json` | Gerek yok (aranırsa MIT olduğu için alınabilir) | — | — |
| **Proof-Driven Bug Hunter istemi** + `bug-hunter` skill (292 satır) + `instructions/agents/bug-hunter.md` | Bul, kanıtla, düzelt, doğrula turu | Yok | `data/prompts/prompts/debugging/proof-driven-bug-hunter.json`; `skills/bug-hunter/SKILL.md` | **Uyarla-yaz** (A bölümündeki `/bughunt` satırıyla aynı iş) | ARAÇ | REC-391 yeni kalem |
| Perf ratchet: ölç, değiştir, ölç; taban çizgisi koruyucusu | Performans kaybını yakalar | Yok; bizde boyut/CLS/SSR kapıları | `dist/performance/perf-runner.d.ts`, `perf-guard.d.ts` | Gerek yok | — | — |
| Design Studio (kit seç, ayarla, materialize et, palet doğrula) + 53 tasarım kiti (`KIT.md` + `tokens.json`) | Tasarım sistemi üretimi | Yok; bizde `design-system/tokens.js` ve tasarım-dili skill'i | `dist/design/index.d.ts`; `design-kits/` | Gerek yok (tasarım dilimiz Recep kararıyla belirli) | — | — |
| Talimat şablonları (`instructions/`: sistem, modlar, SDD, otonomi, iç istemler) | Metin varlıkları | Yok | `instructions/` | Gerek yok | — | — |
| Bulut yapılandırma senkronu (my.wrongstack.com, GitHub kategori senkronu) | Ayarları hesaba yedekler | Yok | `dist/plugins/cloud-config-sync-plugin.d.ts:12-20` | Gerek yok (hesap, bulut; ilke gereği kapalı) | — | — |
| MCP sunucu ön ayarları + `mcp_use` | Kapalı gelen hazır MCP tanımları (ör. Slack) | Yok | `dist/infrastructure/mcp-servers.d.ts` | Gerek yok | — | — |
| TypeSafe "System One" (JEV yargıcı): harici `api.typesafe.ai` uç noktasına tipli sorular sorup yargı alır | Bellek/skill/brain kararlarında ucuz yargı basamağı | Kısmen: skill listemizde `typesafe:typesafe-ai` var, aynı hizmet mi ölçülmedi | `dist/typesafe/client.d.ts:1-10` | Gerek yok (harici hesap, hesap yoksa sessiz kapalı) | — | — |
| Statusline chip sözleşmesi | CLI ve TUI ortak durum çubuğu | Kısmen: bizim statusline kancamız | `dist/statusline/index.d.ts` | Gerek yok | — | — |

**Skill tablosu (36 skill, `core/skills/*/SKILL.md`).** "Genel": aynı SKILL.md biçimiyle başka ajanda okunur; Claude Code yalnız `name` ve `description` işler, `required-tools` alanını yok sayar (çıkarım, denenmedi). Bizde kopyalı olanlar: verify-before-done, multi-agent, wrongstack-kanban, wrongstack-mailbox-mcp (09-28, başlarına araç eşlemesi ve 12 maddelik VentHub ek kuralı eklendi).

| Skill | Ne yapar | Genel mi | Bizde durum | Önerim |
|---|---|---|---|---|
| verify-before-done | "Bitti" demeden proje kontrolleriyle kanıtlama | Genel | **Kullanılıyor** (kopya) | — |
| multi-agent | Lider/işçi planlama ve koordinasyon | Özgü | **Kullanılıyor** (kopya, araç eşlemeli) | — |
| wrongstack-kanban | Uzun işi panoya kaydetme ve yaşam döngüsü | Özgü | **Kullanılıyor** (kopya) | — |
| wrongstack-mailbox-mcp | Posta kutusuna MCP üzerinden erişim | Özgü (dışa dönük) | **Kullanılıyor** (kopya) | — |
| wrongstack-mailbox | Dış ajan olarak posta kutusuna bağlanma | Özgü (dışa dönük) | Yok | Gerek yok (mailbox-mcp yeterli) |
| bug-hunter | Kanıta dayalı hata avı (bul, kanıtla, düzelt, doğrula) | Büyük ölçüde genel | Yok | **Uyarla-yaz** (yukarıdaki satır) |
| mnemosyne | Sage belleğini küratörlüğe alır (hijyen, doğrulama, çelişki, öneri) | Özgü | Yok | **Değerlendir:** hafıza bayatlığı işimize dokunuyor; hijyen önerileri insan onaysız uygulanmaz kuralıyla. `Sage.hygiene` 1.0.29'da oturum kapsamlıları 7 gün sonra siler (C bölümü) |
| data-governance | Şema sahipliği, PII, saklama, köken, erişim, migrasyon güvenliği | Genel | Yok; bizde `create-migration` ve migration kontrol listesi | **Değerlendir:** KVKK/PII kontrol maddeleri bizde kayıtlı mı, salt okuma karşılaştırması (ALTYAPI) |
| codebase-navigation | Tanımadık kodda yer bulma yöntemi | Genel | Yok; bizde codegraph/graphify skill'leri | Gerek yok |
| code-review, debugging, testing, git-flow, refactor-planner, typescript-strict, react-modern, node-modern, api-design, observability, docker-deploy, prompt-engineering, tech-stack, security-scanner | Genel mühendislik rehberleri | Genel | Yok; Claude Code'un kendi yeteneği ve bizim kuralımız var (tam kural listesi, `/code-review`, `security-review`) | Gerek yok |
| web-platform-baseline | CSS/HTML/erişilebilirlik iddiası öncesi tarihli platform bilgisi | Kısmen özgü | Yok | Gerek yok (bizde `accessibility` ve `web-design-guidelines` skill'leri) |
| research-web | Güncel bilgi için web araştırması, sürüm/API doğrulaması | Kısmen özgü | Yok | Gerek yok |
| design-craft, design-critique, design-system | Arayüz tasarımı ve eleştiri; `design` aracı gerektirir | Özgü (araç) | Yok | Gerek yok |
| audit-log | WrongStack oturum günlüklerini çözümler | Özgü | Yok | Gerek yok |
| auto-review, chimera, output-standards, plugin-author, skill-creator, sdd | WrongStack'in kendi eklentileri ve komutları için rehber | Özgü | Yok | Gerek yok |


### C. Hafıza paketleri (sage, sage-mcp, vector-memory, persistence, primitives, wrongtrace)

Kaynak: alt-ajan taraması, 1.0.29, salt okuma. **Sürüm sınırı:** 1.0.29 ile bizdeki 1.0.26 satır satır karşılaştırılmadı; "1.0.26'da da var mı" sorusu her satırda "ölçülmedi" sayılır.

**Bizde durum (sage-mcp 1.0.26):** `.mcp.json` içinde `--writable` açık; 15 araç el sıkışıyor (09-27 ölçümü). Aşağıda "MCP'de yok" yazan her şey WrongStack ajan boru hattına (host) bağlıdır; Claude Code'da boru hattı olmadığı için ancak kendi kancamızdan çağıran sarmalayıcıyla kullanılabilir.

| Özellik | Ne işe yarar | Bizde durum | Kanıt | Önerim | Sahibi | Kayıt |
|---|---|---|---|---|---|---|
| `memory_search`, `memory_for_file`, `memory_for_path`, `memory_graph` | Sözcük, etiket, yol ve çapa sinyalleriyle proje hafızasında arar; dosya/yol/ilişki gezer | **Kullanılıyor** | sage `index.js:13239-14113` | — | — | — |
| `memory_search_explain`, `memory_gather_batch` | Kanal skoru dökümü (lexical/vector/RRF); toplu getirme. 1.0.29'da varsayılan salt-okuma olarak sunuluyor, README saymıyor | Kısmen (1.0.26'da varlığı ölçülmedi; 09-21 ölçümünde `search_explain` çalıştı, vektör kanalı boş) | sage-mcp `index.js:47-72` | — | — | — |
| `remember`, `forget`, `memory_delete`, `memory_update`, `memory_recover`, `memory_backfill_recoverable`, `memory_verify`, `memory_candidates` (`--writable` ile) | Hafıza yazma, silme (`force` şart), güncelleme, kurtarma, çapa doğrulama, aday inceleme | **Kullanılıyor** (`--writable` açık) | sage `index.js:13966-14063`; sage-mcp README "Safety guarantees" | — | — | — |
| `memory_hygiene` | Tekilleştirir, çelişki/bayatlık işaretler, çapa doğrular, inceleme adayı üretir. **Düzeltme:** "silmez" tam doğru değil: oturum kapsamlı hafızaları 7 gün sonra ya da süre bitince yumuşak siler, tekilleştirmede `superseded` yapar; proje hafızaları için silme yalnız aday olur. Aynı proje için 1 saat içinde tekrar çağrılırsa yeni tarama yapmadan önbellekteki raporu döner | Kurulu, hiç çağrılmadı (09-28 ölçümü: bugün yakalanacak 0) | `project-server.js:3040-3480, 3317, 3395-3435, 7813-7826`; sage `index.js:1832-1833` | **Karar konusu değil, düzeltme notu:** enjeksiyon açılmadan önce `recordUse` karşılığı yazılmazsa faydalı hafıza "kullanılmamış" görünür (09-28 riski geçerli) | ARAÇ | REC-391 |
| Önerme kipi (`proposals: true`) | `memory_candidates`'i yalnız `list` ve `propose` eylemine daraltır; damga "Proposed by <origin> over MCP" | Yok (bizde `--writable`, tam yetki) | sage-mcp `index.js:47`, `cli.js:24-49` | **Değerlendir:** pencerelerin hafızaya doğrudan yazması yerine "öner" kipi, yanlış kayıt riskini azaltır. Ölçülmedi | ARAÇ | yeni kayıt gerekir |
| **MemoryInjectorAgent** | Görev sinyallerine ve bağlam baskısına göre kaç hafıza/kaç karakter enjekte edileceğini planlar; deterministik, ek LLM çağrısı yok | Yok (MCP'de açılmıyor) | sage `middleware/memory-injector-agent.d.ts` | **Değerlendir (karar 146 süzgeci):** bizde claude-mem zaten "Relevant Past Work" enjekte ediyor; çift enjeksiyon olmaz, önce hangisinin daha isabetli olduğu ölçülür. Risk: `ctx` yapısı WrongStack'e özgü, iç API | ARAÇ | REC-391 yeni kalem |
| **Bağlam monitörü + `recordUse`** | Her istekte hangi hafızanın bağlamda olduğunu ölçer, atıf yapılanlara kullanım yazar | Yok (MCP'de yok) | sage `index.js:8840-8848, 12860-12870` | Enjeksiyon açılırsa şart (yukarıdaki risk); açılmazsa gerek yok | ARAÇ | — |
| Oturum sonu commit çıkarıcı (`subscribeSessionEndCommitExtractor`) ve alan terimi çıkarıcı (`SageDomainTermExtractor`) | Son 32 commit'ten alan terimi çıkarır | Yok | sage `index.js:9584-9614, 579-590` | **Gerek yok:** 09-28 notumdaki "commit'ten ders çıkarır" iddiası 1.0.29'da geçerli değil; artık hafıza kaydı üretmiyor, yalnız `.wrongstack/domain-terms.md` yansısını yazıyor | — | — |
| `HashingEmbeddingProvider` | Çevrimdışı, bağımlılıksız 256 boyutlu sözcük-özelliği vektörü (FNV-1a + log1p + L2) | Yok | sage `embeddings/hashing.d.ts` | Gerek yok: anlam (eşanlam) yakalamaz, yalnız sözcük yakınlığı | — | — |
| `setupSage` (tek çağrıda kurulum) | Enjeksiyon, jargon, monitör, sonuç yakalama, yol yeniden eşleme, oturum sonu commit çıkarımı, saatlik hijyen | Yok (yalnız WrongStack ev sahibi çağırabilir) | sage `index.js:12790-13025` | Gerek yok (parça parça alınırsa alınır) | — | — |
| Sonuç yakalama (`tool_outcome`, `error_pattern`, saatte 20), yol yeniden eşleme (`mv`, `git mv`, saatte 50) | Başarılı komutları ve tekrarlayan hata imzalarını hafızaya yazar; dosya taşınınca çapaları taşır | Yok; varsayılan KAPALI | sage `middleware/outcome-capture.d.ts`, `path-remap.d.ts` | **Değerlendir:** yol yeniden eşleme, dosya taşındıkça çapalı hafızanın bayatlamasını önler; bizim "bayat kayıt" derdine değiyor. Ev sahibi pipeline'a bağlı | ARAÇ | — |
| Triage boru hattı (5 evre) | Ön filtre, değer skoru, gri bölge için LLM, birleştirme, otomatik uygula/öner | Yok | sage `triage/orchestrator.d.ts`; `index.js:12960-12995` | Gerek yok (evre 3-4 LLM ister, kota riski) | — | — |
| System One (TypeSafe yargıcı), model geri bildirimi, oturum konsolidasyonu | Ucuz yargı basamağı; "faydalı/alakasız" yargılarını saklar; oturum olgularından aday üretir | Yok | `retrieval/system-one-recall.d.ts`; `shared/model-feedback.d.ts`; `session-consolidation.d.ts` | Gerek yok (TypeSafe hesabı ister, yalnız `.d.ts` okundu) | — | — |
| Proje başına tek SQLite sahibi (daemon), worktree'ler ana ağaç kimliğini paylaşır | Tek yazar; diğerleri IPC ile bağlanır; boşta 5 dk sonra kapanır | **Kullanılıyor** (K6 boşta süreç sorunu buradan) | sage README "Supported composition"; `project-server.js:7647-7700` | K6 için yerel temizlik (S) | ARAÇ | REC-391 K6 |
| Hafıza modeli: 20 tür, 5 kapsam, 6 durum; çapa doğrulama (`existence`/`content`/`git`) | Bilgiyi dosyaya/sembole bağlar, hedef değişince bayatlatır | **Kullanılıyor** | sage `index.js:13105-13135, 350-353` | — | — | — |
| Kanıt geri okuma / kurtarma, denetim kaydı | Silinen hafıza kurtarılabilir | **Kullanılıyor** | sage `index.js:13966-14063` | — | — | — |
| HQ proje hafızası senkronu | Hafızayı HQ'ya ve aynı HQ proje kimliğini paylaşan istemcilere kopyalar | Yok | sage README "HQ project memory synchronization" | Gerek yok (HQ bağlantısı, ağ) | — | — |
| **vector-memory** (SQLite + FTS5, gömme önbelleği, dosya kilidi, RRF birleştirme ağırlık 0,3/k=60, arama yarışı, hashing yedeği) | Anlamsal (vektör) arama; SAGE ile paralel çalışır | Yok (sage-mcp'de bağlanmıyor; vektör araçları `vector_memory_*` sunulmuyor) | vector-memory README "Storage layout", "Tools", "Parallel operation" | **Uyarla-yaz (S1):** aşağıya bakın | ARAÇ (+HARİTA belge yönlendirici) | REC-391 S1 |
| Varsayılan gömme modeli `Xenova/all-MiniLM-L6-v2` (384 boyut, q8, ~25 MB, ilk kullanımda indirilir, `@huggingface/transformers` isteğe bağlı) | Yerel, anahtarsız gömme | Yok | vector-memory `dist/index.js:1672-1700, 1788-1794` | Yalnız İngilizce; **Türkçe için yetersiz** (ölçülmedi) | — | — |
| **Türkçe / çok dilli gömme:** `modelId` değiştirilebilir ama kod boyutu 384'e SABİTLER | Türkçe anlamsal arama için 384 boyutlu çok dilli bir model gerekir | Yok | `dist/index.js:1672-1696` | **Uyarla-yaz (L):** 384 boyutlu bir çok dilli model seçilip Türkçe not/soru kümesiyle ölçülür (kalite ölçülmeden karar verilmez); sage-mcp'ye bağlama bayrağı yok, kendi başlatıcımız gerekir | ARAÇ | REC-391 S1 |
| Türkçe sözcük araması: `NFKC + toLowerCase() + \p{L}\p{N}` ayrıştırma; çekim eki/eşanlam eşleşmesi yok | Türkçe harfler sözcük parçalamıyor | **Kullanılıyor** (mevcut arama) | sage `index.js:890, 2732, 3667, 6711` | `İ/ı` davranışı ölçülmedi; küçük bir ölçüm işi | ARAÇ | — |
| Bayat yansı süpürmesi, SAGE yansısı ve ilk-açılış senkronu | SAGE'den silinen kayıtların vektör satırlarını siler; ilk açılışta hepsini indeksler | Yok | vector-memory `dist/index.js:169-196`; `sage-event-mirror.d.ts` | S1 kapsamında | ARAÇ | REC-391 S1 |
| persistence (atomik yazma, dosya kilidi, sabit uç nokta bağlama, gizli anahtar), primitives (regex koruması, sır maskeleme, zamana karşı güvenli karşılaştırma) | Ortak altyapı, bağımlılıksız | **Kullanılıyor** (dolaylı) | persistence README; primitives `dist/index.js:1420-1441` | — | — | — |
| **wrongtrace:** HARİCİ "WrongTrace AI Observability" daemon'una istemci (dosya sağlığı, sembol geçmişi, model sürtünme matrisi, telemetri; ön-uçuş koruması başkasının kilitli dosyasını reddeder) | Çok ajanlı yazma çakışmasını önler | Yok (daemon bizde yok) | wrongtrace `dist/types.d.ts:209-236`; `hooks.d.ts` | Gerek yok (daemon yoksa `isAvailable:false` ile sessiz; bizim kapımız bash-write-guard) | — | — |

**Saatlik hijyen ve zamanlayıcı bulguları HATIRLATMA bölümünde.**


### D. Kanban, posta kutusu, kod dizini, MCP çerçevesi, araç kütüphanesi (kanban-mcp, mailbox-mcp, codebase-index-mcp, mcp, tools)

Kaynak: alt-ajan taraması (1.0.26 kurulu kopya + 1.0.29 `tools`/`kanban`/`core`/`mcp`) ve ARAÇ'ın 1.0.29 sunucu paketlerini yalıtılmış klasöre kurup 1.0.26 ile `diff` karşılaştırması. **Düzeltme:** alt-ajan "1.0.29'da kanban-mcp, mailbox-mcp, codebase-index-mcp yok" demişti; bu yalnız CLI'nin bağımlılık ağacı için doğruydu. Üçü de npm'de 1.0.29 olarak var (2026-09-29 23:48 TSİ yayımlı) ve karşılaştırıldı.

**Bizde durum (1.0.26, `.mcp.json`):** kanban `--writable`, `--destructive` YOK (silme/birleştirme/pano arası taşıma kapalı); posta `--writable`, `--admin` YOK; kod dizini 6 okuma aracı, `codebase_index` (yeniden indeksleme) KAPALI; hepsi `posta-kutusu.cjs` / `kanonik-kok.cjs` sarmalayıcılarıyla ve `INV-WRONGSTACK-*` kapılarıyla.

| Özellik / MCP aracı | Ne işe yarar | Bizde durum | Kanıt | Önerim | Sahibi | Kayıt |
|---|---|---|---|---|---|---|
| `kanban_read` (14 eylem: list_boards, get_board, export_markdown, export_task_graph, search_tasks, ready_tasks, snapshot, workbench, get_task, get_chain, events, queue_health, board_history, get_contract_graph) | Panoyu, kartları, olay geçmişini, kuyruk sağlığını okur | **Kullanılıyor** | kanban-mcp `index.js:10-25` | — | — | — |
| `kanban_manage` (~47 eylem: kart ekle/güncelle/taşı/ata, kiralama, yaşam döngüsü, doğrulama, kabul kriteri, sözleşme haritası, atomiklik, pano üretimi) | Yazma yüzeyi | **Kullanılıyor** (`--writable`; K1 özet-dönüş yamasıyla) | kanban-mcp `index.js:26-81`; tools `chunk-B3FQKCA3.js:1674-2666` | Açık kalemler aşağıda | ARAÇ | REC-391 |
| `kanban_destructive` (delete_board, delete_task, merge_tasks, transfer_task) | Kalıcı silme, birleştirme, panolar arası taşıma | Kurulu ama kapalı (`--destructive` verilmemiş) | kanban-mcp `index.js:82-87` | Gerek yok (bilerek kapalı) | — | — |
| `kanban_watch` | Sonraki pano değişikliğine kadar (en çok 25 sn) bekleyip döner | **Kullanılıyor**; UYANDIRMAZ, bkz. HATIRLATMA | kanban-mcp `index.js:140-155, 209-267` | Gerek yok | — | — |
| **Süreli kart kiralama**: `claim_task/release_task/assign_task/heartbeat_assignment/recover_stale`; her yazım `expectedLeaseId` ile çitlenir, süresi geçen sahip yazamaz; süre dolunca kart kuyruğa geri döner | Bayat işçinin yazmasını engeller | Kısmen: kartları kullanıyoruz; pano claim'imiz (`board.cjs`) süreli kiralama/çitleme taşımıyor | tools `chunk-B3FQKCA3.js:2495-2500, 2729-2730`; kanban `dispatch.d.ts:12` | **Uyarla-yaz:** pano claim'ine süre + çitleme (09-28 "benimsenebilir 3 fark"ın 1'incisi); BAYAT şeritlerin bloklamaması zaten var, asıl kazanç: sahibi kaybolmuş claim'in kendiliğinden düşmesi | ARAÇ | yeni kayıt gerekir |
| `transition_task` (Backlog→Todo→Running→Review→Done, tek adım, WIP sınırı, bağımlılık ve alt kart kapısı), `adopt_managed_lifecycle`, `repair_managed_projection` | Yönetilen panoda katı yaşam döngüsü; `done`'da kanıtsız kart için otomatik doğrulama raporu | Kısmen: yönetilen pano kullanmıyoruz (K3: hata mesajı yol göstermiyor) | tools `chunk-B3FQKCA3.js:2034-2116, 321-357`; kanban `index.js:4245-4300` | K3 için **Uyarla-yaz (S)**: hata metnine `move_task`/`adopt_managed_lifecycle` yönlendirmesi (yama) | ARAÇ | REC-391 K3 |
| `verify_completion` (kabul ölçütleri: command, test, file_exists, file_matches, git_diff, metric; komut izin listesi kabuk operatörlerini reddeder) | "Bitti" kanıtını çalıştırır ve kartta saklar | Kısmen: `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh` ile `gh` eklendi; hâlâ dar (`pwd/true/false/test` + kısıtlı `pnpm exec tsc/vitest`); K4 zaman aşımı | kanban `index.js:4786-4956, 4956 (DEFAULT_ALLOWED)` | K5 kalan kısım (canlı `curl`, migration koşusu) **Uyarla-yaz (M)**; K4 önce sebep ölçülür | ARAÇ | REC-391 K4, K5 |
| `add_check/update_check/add_goal_metric`, `add_note/add_link/record_activity/review_task/add_dependency/set_chain`, atomiklik (`assess_atomicity`, `propose_decomposition`…), sözleşme haritası (off/advisory/strict), `generate_board/create_from_graph/sync_task_graph/import_session_tasks/export_*` | Kanıt, not, bağımlılık, "tek işlik mi" puanı, hedef-korunacak-risk düğümleri, toplu pano üretimi | **Kullanılıyor** (kısmen; `create_from_graph` toplu işi hiç denenmedi) | tools `chunk-B3FQKCA3.js:877-964, 2582-2666` | Gerek yok | — | — |
| K2: `update_task` içinde `assignee` sessizce yok sayılıyor (`ok:true` dönüyor, sahip değişmiyor) | Yanlış sahiple çalışma riski | Açık kusur | tools `chunk-B3FQKCA3.js:1674-1697` (1.0.29'da bayt bayt aynı) | **Uyarla-yaz (S)** | ARAÇ | REC-391 K2 |
| MCP prompt `work-kanban-task`, MCP hata biçimi `{ok:false,error:{code,message,retryable,issues}}` | Kart yürütme şablonu; tutarlı hata | Kullanılıyor (otomatik) | kanban-mcp `index.js:185-199, 321-328` | — | — | — |
| **Yerel yama (bizde):** yazma dönüşünü özetler (`kanbanTool.serialize`), K1 (her yazma panonun tamamını döndürüyordu, ~42.000 karakter) çözüldü | Çıktı sınırını aşmayı önler | **Kullanılıyor** | `tools/wrongstack-mcp/yamalar/kanban-mcp-1.0.26-ozet-donus.patch` | **1.0.29'a çıkışta yamayı yeniden üretmek gerekir:** hedef `cli.js` 1.0.29'da farklı (kanban-mcp `index.js`'te 682 satırlık fark, esas olarak araç/eylem tanımı yeniden düzeni); uygulanabilirliği ölçülmedi | ARAÇ | REC-391 |
| `mailbox_read` (query, unread, agents, online_agents, clients, status) | Mesaj sorgu, okunmamış sayısı, çevrimiçi ajanlar | **Kullanılıyor** | mailbox-mcp `index.js:12-19, 313-387` | — | — | — |
| `mailbox_manage` (send [note, ask, assign, steer, btw, broadcast, status, result, review], ack, ack_many, soft_delete, restore, register_self, heartbeat_self, deregister_self) | Mesaj gönderme ve kayıt | **Kullanılıyor** (`--writable`, `--actor` sabit; kimlik taklidi yok) | mailbox-mcp `index.js:81-91, 394-471` | — | — | — |
| `mailbox_admin` (clear_all, purge_*, auto_compact, HTTP kimlik bilgisi yönetimi, 15 yetenek) | Yıkıcı bakım | Kurulu ama kapalı (`--admin` yok) | mailbox-mcp `index.js:30-43, 476-536` | Gerek yok | — | — |
| `mailbox_watch` | Sonraki posta olayına kadar (en çok 25 sn) bekler; gövde YOK, alıcıya göre süzülmez | **Kullanılıyor**; UYANDIRMAZ | mailbox-mcp `index.js:188-202, 328-373` | Gerek yok | — | — |
| M3: kısa (8 hane) alıcı kimliği hata vermeden düşüyor | Mesaj kaybı | Açık kusur; bugün yalnız kuralla ("tam oturum kimliği") önleniyor | core `normalizeRecipient` (`chunk-RMZOQFC5.js`) 1.0.26 ve 1.0.29'da aynı | **Uyarla-yaz (S):** sarmalayıcıda (`posta-kutusu.cjs`) kısa kimliği reddet ya da benzersiz önek çöz | ARAÇ | REC-391 M3 |
| 1.0.29 posta girdi doğrulaması: `priority` (low/normal/high), `audience` (all/leaders), `minPriority`, `ttlMs ≥ 1` için sıkı enum kontrolü | Geçersiz girdide hata verir | Yok (1.0.26'da serbest metin) | mailbox-mcp diff (27 satır) | Yükseltmenin küçük kazancı | ARAÇ | — |
| M4: mesaj gelince alıcıya bildirim/uyandırma yok | 09-28'de 4 mesaj okunmadan bekledi | Açık istek; doğrudan mesaj (SendMessage) yolu çözüm | mailbox-mcp README:33-34 ("wake-up hint, not snapshot") | **Uyarla-yaz (L):** bkz. HATIRLATMA ve A bölümündeki Mailbox HTTP köprüsü satırı | ARAÇ (+Ops) | REC-391 M4 |
| Mailbox HTTP köprüsü + sağlık bekçisi (15 sn aralık, 3 sn zaman aşımı, 2 hata eşiği) | WrongStack ajanlarının kendi köprüsü | Yok | cli `mailbox-bridge-bootstrap.d.ts`; core `chunk-MHBWOFLC.js:11573-11576` | Gerek yok (M4 için fikir kaynağı) | — | — |
| `codebase_search` (SQLite FTS5 trigram + BM25; `kind`, `lang`, `file`, `limit` ≤ 100), `codebase_context` (sorgu + PageRank yürüyüşü, `limit` ≤ 50), `codebase_stats`, `codebase_package_graph`, `codebase_file_graph`, `codebase_symbol_graph` | Kod dizini okuma | **Kullanılıyor** (CodeGraph asıl araç; hangisinin kalacağı REC-345 kıyasıyla belli olacak) | codebase-index-mcp `index.js:53-84`; tools `chunk-AB3R2NNO.js:1304-1366, 4107-4140` | Gerek yok | — | — |
| `codebase_index` (artımlı / `--force` / `langs`) | İndeksi yeniler | Kurulu ama kapalı (README "ALINMAYAN": `--writable` yüzeyi) | codebase-index-mcp `index.js:24, 88, 144-151` | Gerek yok | — | — |
| **C1:** "X'i kim çağırıyor" (`codebase-incoming-calls` doğrudan/geçişli ≤ 200, `outgoing-calls`, `impact-analysis`, `dead-code-scan`, `repo-map`, `skeleton`, `invariant-check`, `ast-replace`, `targeted-test`) tools'ta VAR, MCP'ye açılmamış (yalnız 6+1 araç) | Bir fonksiyonu değiştirmeden önce nerelerin etkileneceğini gösterir | Yok (CodeGraph `affected`/`callers` aynı işi görüyor, kıyas ölçülmedi) | codebase-index-mcp `index.js:16-24`; **1.0.29 `index.js` 1.0.26 ile bayt bayt aynı (diff 0)** | **Değerlendir:** CodeGraph zaten var; C1/C3/C4 birlikte "dizin aracı tutulacak mı" kararına bağlı (REC-345 kıyası). M | ARAÇ | REC-391 C1 |
| C2: silinen dosya/sembol dizinde kalıyor | Yanlış sonuç ve şişme | 1.0.28'de küçük denemede düzeldi (F1 ölçümü); 1.0.29 indeksleyicisinde farkında-silme yolu görülmedi | tools `chunk-VHUM4IXM.js` | Ölçülmedi (davranış) | ARAÇ | REC-391 C2 |
| C3: FTS kelime sırasına duyarsız (`is_admin_user` ≈ `is_user_admin`), C4: SQL fonksiyon gövdesi içindeki çağrılar indekslenmiyor | Kod dizini kalitesi | Açık | REC-391 | C1 kararına bağlı | ARAÇ | REC-391 C3, C4 |
| Vektör / anlamsal kod arama (`codebaseVectorSearch`, `embedProjectFiles`) | Kütüphanede var, MCP'de bağlı değil (`codebase_context` yalnız BM25 + grafik) | Yok | tools `chunk-AB3R2NNO.js:4080-4106, 4409-4427` | Gerek yok (Türkçe kod yorumu az; ölçülmedi) | — | — |
| 31 dil (ts/js, go, py, rs, java, kotlin, scala, csharp, c/cpp, php, ruby, swift, dart, lua, r, zig, elixir, haskell, shell, sql, md, toml, json, yaml, html, css, vue, svelte, proto, graphql + Dockerfile/Makefile) | Tree-sitter ile sembol çıkarma | **Kullanılıyor** | tools `chunk-YOHO4DVT.js:1-88` | — | — | — |
| **1.0.29: bağlantı adı gizli anahtarla karma** (kanban, mailbox, codebase-index, chronicle) | Eski daemon'a bağlanmaz, yenisini açar; eski daemon'lar süreç olarak kalır | — | persistence `index.js:487-491`; kanban `project-server.js:799` | Yükseltmede önce eski daemon'lar durdurulur (README kuralı zaten söylüyor) | ARAÇ | — |
| @wrongstack/mcp çerçevesi: istemci (stdio, sse, streamable-http), sunucu (`MCPServer`, `serveStdio`, `serveHttp`), OAuth 2 (keşif, kayıt, jeton deposu), kayıt defteri (yeniden bağlanma 500 ms→1 s→2 s), elicitation | MCP altyapısı | **Kullanılıyor** (dolaylı: dört sunucu bunun üstünde) | mcp README:5-11, 132-135; `dist/index.d.ts` | Gerek yok; 1.0.29'da OAuth `resource_metadata` yalnız aynı sunucuda kabul (güvenlik sıkılaştırması) | — | — |
| @wrongstack/tools: 69 yerleşik araç (dosya, çalıştırma, ağ, tarayıcı [Playwright], proje yaşam döngüsü, kod dizini 13, kanban/plan/todo, `tool_search/tool_use/tool_script`) | WrongStack ajanının araç kutusu | Yok (Claude Code'un kendi araçları var); yalnız kod dizini ve kanban parçaları MCP ile | tools `chunk-WHKUSWB3.js:2775-2977` | Gerek yok | — | — |
| K6: pencereler kapanınca boşta kalan `project-server` süreci ayakta | Bellek boşa gider (bellek uyarısı %85) | Açık kusur; 1.0.28'de de duruyor | REC-391; F1 ölçümü | **Uyarla-yaz (S):** kapanış kancası ya da bellek uyarı hattına bağlı temizlik; tasarım gereği paylaşımlı olduğu için bir pencerenin kapanışı ötekilerin sunucusunu öldürmemeli | ARAÇ | REC-391 K6 |
| G1: paket kurulu değilken yalnız `CONNECTION_CLOSED` | Teşhis dakikalar sürer | Açık | REC-391 | **Uyarla-yaz (S):** `kurulum.cjs --denetle` ya da sarmalayıcıda eksik modül satırı | ARAÇ | REC-391 G1 |


### E. Yönetişim, spec, bağımlılık, güvenlik, sağlayıcı ve eklentiler (governance, requirement-intake, sdd, techstack, security-scanner, providers, runtime, plugins, plugin-sdk, plug-lsp, bench)

Kaynak: alt-ajan taraması, 1.0.29, salt okuma; hiçbir özellik çalıştırılarak denenmedi. Bu bölümde "bizde durum" kolonu çoğunlukla "Yok", çünkü bu paketlerin hiçbiri bizde kurulu değil.

| Özellik | Ne işe yarar | Bizde durum | Kanıt | Önerim | Sahibi | Kayıt |
|---|---|---|---|---|---|---|
| **Özerklik zarfı A0-A4** (governance) | İşlem türlerini sınıflar: dosya okuma A0, düzenleme A1, alt ajan/yerel git yazma A2, keyfi kabuk/paket kurma/şema değişikliği/ağ A3, sır erişimi/git push/publish A4 | Kısmen: bizde "mode-independent hard gates" (migration merge, canlı işlemler) ve Recep onayı kuralı var, ama sınıflar yazılı bir cetvel olarak tek yerde değil | governance `dist/index.js:1885-1925` | **Değerlendir:** A0-A4 fikri, bizim onay/kapı kurallarını tek tabloda toplamak için hazır bir sınıflama; yalnız belge işi (HARİTA), kod almadan | HARİTA | yeni kayıt gerekir |
| Görev sözleşmesi, plan sürümleme, olay deposu (ekleme-only SQLite), yetki hibe defteri, gölge gözlem, IPC daemon | Kabul/red kararlarını makbuzla kaydeden yönetişim çekirdeği; README "runtime'a bağlı değil", ama runtime governance'ı içe aktarıyor (çelişki notu) | Yok | governance README; runtime `dist/governance-bootstrap.js:1-13` | Gerek yok | — | — |
| requirement-intake (ham gereksinim, soru listesi, LLM önerisi, kapalı-varsayılan yetki) | Gereksinim toplama akışı | Yok; bizde Linear iş emri + KAYNAK/CETVEL bloğu | requirement-intake README; `dist/index.js:353-395` | Gerek yok | — | — |
| sdd (spec ayrıştırma, görev DAG, 6 şablon, spec-builder mülakatı, paralel yürütücü, çakışma çözücü, kritik yol, vibe protokolü) | Spec-driven geliştirme | Yok; bizde no-plan-no-code kuralı ve cetveller | sdd `dist/index.js:1-6216` | Gerek yok | — | — |
| techstack: 13 ekosistemde bağımlılık envanteri, kayıt defteri zenginleştirme, **OSV.dev toplu zayıflık sorgusu**, `npm audit`/`cargo audit`, lisans politikası, SBOM (SPDX/CycloneDX), anlık görüntü karşılaştırma | Bağımlılık sağlığı | Kısmen: Dependabot + son tarama satırı ("BAGIMLILIK: high 11") + ALTYAPI taraması; SBOM ve lisans politikası yok | techstack `dist/index.js:3217, 3396-3420, 4758-4790` | **Değerlendir:** lisans sınıflaması (izinli/zayıf/güçlü/ağ copyleft) ve SBOM çıktısı bizde yok; ALTYAPI salt okuma karşılaştırması. Çevrimiçi analiz bağımlılık adlarını dışarı gönderir (repo public olduğu için sakıncasız) | ALTYAPI | yeni kayıt gerekir |
| techstack: teknoloji yığını ÖNERİSİ | "Ne kullanmalı" önerisi | Yok, pakette de YOK (yalnız algılama ve sağlık) | techstack modül başlıkları (yokluk kanıtı) | Beklenti düzeltmesi: bu paketten yığın önerisi çıkmaz | — | — |
| security-scanner (`/security scan`, `audit`): yığını algılar, skill üretir, dosyaları partiler halinde MODELE okutur; ayrıca 19 desenli regex tarayıcı sınıfı | Güvenlik taraması | Yok; bizde `security-reviewer` alt ajanı, `security-check` skill'i, sır tabanı | security-scanner `dist/index.js:1327-1665, 2001-2020` | Gerek yok: desenler JS/TS ağırlıklı, RLS/tenant/webhook HMAC/migration için desen YOK; slash komutu model anahtarı ister ve dosya içeriği sağlayıcıya gider | — | — |
| providers: 25 tanım (OpenRouter, OpenAI, Anthropic, Google, xAI, DeepSeek, Mistral, Groq, Ollama, vLLM, LM Studio, Vercel/Cloudflare ağ geçidi; OAuth ile Claude Pro/Max, ChatGPT, Copilot) | Model sağlayıcı bağlayıcıları | Yok. **NVIDIA sağlayıcısı YOK** (grep boş); yalnız genel OpenAI-uyumlu ile elle eklenir | providers `dist/provider-definitions.js` | Gerek yok (claude-mem NVIDIA'ya kendi kanalıyla bağlanıyor) | — | — |
| Yerel model (Ollama, vLLM, LM Studio; `/models` ile keşif) | Anahtarsız, bulutsuz model | Yok | providers `dist/provider-definitions.js:721-756` | Gerek yok (şimdilik) | — | — |
| runtime (kapsayıcı, görsel yönlendirme, pano PNG okuyucu, governance önyükleme, JEV kontrolleri) | Ev sahibi iskeleti | Yok | runtime `dist/index.js` | Gerek yok | — | — |
| **Eklenti koleksiyonu: 90 eklenti** (README "64" diyor, manifest 90 listeliyor); yalnız 5'i varsayılan AÇIK: secret-scanner, context-pins, error-lens, dep-guard, injection-shield | Ajan kancaları olarak çalışan kapılar | Yok (WrongStack ev sahibi şart) | plugins `dist/manifest.js:2-92, 120-135` | Aşağıdaki satırlarda tek tek | — | — |
| secret-scanner (21 desen, block/redact/allow) | Araç argümanında ve çıktıda sır yakalar | Kısmen: bizde sır tabanı, repo tarama, sır imzası taraması | plugins README:148-224 | Gerek yok | — | — |
| **injection-shield** + prompt-firewall | Getirilen sayfa/dosya çıktısında istem enjeksiyonu kalıbı varsa modele "bu veri, talimat değil" uyarısı ekler | Yok. Claude Code kendi başına da bazı koruma yapar, kapsamı ölçülmedi | plugins `dist/injection-shield.js:167`, `prompt-firewall.js:349` | **Değerlendir:** bizde ajanlar çok sayıda web/PDF/Linear çıktısı okuyor; PostToolUse kancasıyla aynı uyarıyı eklemek küçük iş (S). Ölçülmedi: yanlış alarm oranı | ARAÇ | yeni kayıt gerekir |
| **dep-guard** (varsayılan AÇIK, ağ çağırır): kurulumdan önce kara liste, yeni yayınlanmış (<7 gün) paket, typosquat, OSV.dev kontrolü | Zararlı/şüpheli paket kurulumunu önler | Yok; bizde Dependabot ve ALTYAPI'nın "sürüm sabitleme önceliği" | plugins `dist/dep-guard.js:224, 267-271, 334, 478-491` | **Değerlendir:** tedarik zinciri saldırısı korumamız yok denecek kadar az; `pnpm add` öncesi kanca (S-M). ALTYAPI ile | ALTYAPI (+ARAÇ kanca) | yeni kayıt gerekir |
| path-guard (kilit dosyası, .env, .git, migrations koruması), branch-guard (main'e commit/push engeli), commit-validator, gitignore-guard, process-guard | Dosya/git koruma kapıları (kapalı gelir) | **Kullanılıyor** (karşılığı: bash-write-guard, lane-guard, silme-baglanti-kapisi, ana-ağaç kancaları) | plugins `dist/path-guard.js:1468`, `branch-guard.js:150` | Gerek yok | — | — |
| lint-gate, type-gate, format-on-save, import-organizer, test-runner-gate, test-coverage-gate, config-validator, shell-check | Kalite kapıları | **Kullanılıyor** (CI ve pre-commit) | plugins `dist/lint-gate.js:220`, `type-gate.js:143` | Gerek yok | — | — |
| security-hotspot-scanner, dependency-vulnerability-gate, license-audit-gate, schema-evolution-guard, api-compatibility-gate, env-contract-guard | Güvenlik ve şema kapıları | Kısmen: migration linter, db-advisor, tip-drift kapısı | plugins `dist/schema-evolution-guard.js:163` | Gerek yok (dosya açıklamaları arasında kopya: iki kapının `description:` metni dep-guard ile aynı, gövdesi okunmadı) | — | — |
| verification-ledger, acceptance-verifier, bug-reproducer, executable-documentation, workspace-recipe-runner | "Bitti"yi kanıtlayan eklentiler | Kısmen: verify-before-done skill'i ve PR kayıt kapısı | plugins `dist/verification-ledger.js:226` | Gerek yok | — | — |
| test-flake-detector, test-generator, test-impact-analyzer, release-notes-generator, semver-bump, changelog-writer, pr-drafter, git-autocommit, release-readiness | Test ve yayın yardımcıları | Yok | plugins `dist/test-flake-detector.js:333` | Gerek yok | — | — |
| **cost-tracker** (oturum başı token ve tahmini USD, `cost_export`), token-budget, token-throttle, llm-cache, model-router, auto-escalate | Maliyet ve bütçe eklentileri | Yok. Bizde token/kota ölçümü elle (`message.usage` toplama) | plugins README:86-112; `dist/cost-tracker.js:74` | **Değerlendir:** REC-422'deki "maliyeti ölçemiyorum" sorununa fikir kaynağı; Claude Code transcript'lerinden aynı toplamı yapan küçük bir betik yazılabilir (S). Eklentiyi olduğu gibi alamayız (ev sahibi şart) | ARAÇ | REC-422 ilişkili |
| agent-handoff, todo-listener, session-recap | Yerel posta kutusuna devir notu | Kısmen: durum dosyaları ve pano | plugins `dist/agent-handoff.js:137` | Gerek yok | — | — |
| api-consumer-replay, concurrency-scenario-tester, failure-injection-lab, service-topology-inspector | Yerel yük/dayanıklılık deneyleri (yalnız 127.0.0.1) | Yok | plugins `dist/api-consumer-replay.js:143-145` | Gerek yok | — | — |
| responsive-journey-tester (Playwright), visual-regression-reviewer (piksel), accessibility-auditor, localization-completeness | Tarayıcı/görsel denetimler | Kısmen: Playwright e2e, axe testi, i18n eşlik testi | plugins `dist/accessibility-auditor.js:298` | Gerek yok | — | — |
| plugin-sdk, üçüncü taraf eklenti güveni (giriş dosyası SHA-256 sabitleme) | Eklenti yazma ve güven | Yok | plugin-sdk README | Gerek yok | — | — |
| plug-lsp: 11 LSP aracı (tanım, referans, hover, rename...), `/lsp install` 12 dil | Dil sunucusu köprüsü | Yok; bizde Claude Code'un `LSP` aracı var | plug-lsp README | Gerek yok | — | — |
| bench (model kıyas: core 6 görev, polyglot 225, SWE-bench 50; donanım parmak izi) | Model karşılaştırma ölçeği | Yok | bench README | Gerek yok | — | — |

**Dışarı ağ çağrıları (dist içindeki `https?://` alan adları taraması) ve telemetri:** governance, requirement-intake, sdd, security-scanner, runtime, plugin-sdk, plug-lsp, bench: dış URL yok (yalnız yerel IPC). techstack: npm/PyPI/crates.io/Go proxy/NuGet/Packagist/pub.dev ve `api.osv.dev` (çevrimiçi analiz açıkken bağımlılık adları dışarı gider). plugins: dep-guard aynı adreslere; notify-hub yalnız kullanıcının verdiği webhook'a. providers: yalnız kullanıcı o sağlayıcıyı seçerse. **Dışarı gönderen telemetri kodu bulunmadı** (tarama sözcükleri: telemetry, posthog, mixpanel, sentry, analytics); WrongStack'e ait ücretli hizmet çağrısı görülmedi. Ölçülmedi: kullanıcı `baseUrl` verdiğinde dinamik URL yolları.


---

## HATIRLATMA / ZAMANLAYICI / BİLDİRİM (ayrı başlık: Recep "hatırlatma ve başka özellikler belki var" demişti)

**Tek cümle:** WrongStack'te "şu tarihte/saatte bana hatırlat" diye bir özellik yok; var olanlar oturum içi zamanlayıcı, bekleme araçları ve bildirim kanallarıdır ve hiçbiri makine/oturum kapalıyken çalışmaz.

| Yüzey | Ne yapar | Ne YAPMAZ | Bizde durum | Kanıt |
|---|---|---|---|---|
| **cron eklentisi** (`cron_schedule`, `cron_list`, `cron_cancel`; plugins) | Sabit aralıkla (1 sn ... ~24,8 gün, `setTimeout`) oturum içinde tekrarlayan iş; `maxConcurrentJobs: 5` | Cron ifadesi (`0 9 * * *`) yok; kalıcı değil (`persistSchedules: false`, oturum kapanınca ölür); tetiklenince **yalnız `cron:job_fired` olayı yayar**, kendi başına istem/komut çalıştırmaz (bir dinleyici şart); varsayılan KAPALI | Yok | plugins `dist/cron.js:83-233`; README:122-129 |
| **`mailbox_watch`, `kanban_watch`** | Sonraki olaya kadar en çok 25 sn bekleyip döner (uzun anket) | **Boştaki oturumu uyandırmaz**; olay gövdesi yok; aradaki olaylar kaybolur (README: "wake-up hint, not snapshot"); MCP tarafında sunucudan istemciye push yok | **Kullanılıyor** | mailbox-mcp `index.js:188-202, 328-373`; kanban-mcp `index.js:140-155, 209-267` |
| **`file-watcher`, `dep-watcher`, `package-outdated-watcher`** | Dosya/bağımlılık değişince (eskimiş paket için 1 saatte bir) posta kutusuna not düşer | Kapalı gelir; ev sahibi süreç şart | Yok | plugins `file-watcher.js:124`; core `dep-watcher.d.ts`, `package-outdated-watcher.d.ts` |
| **Telegram köprüsü** (`telegram_send`, `telegram_read`, `telegram_approve`) | Uzun yoklama (`getUpdates`) ile mesaj alır, gelenleri posta kutusuna düşürür; **giden bildirim**: araç 30 sn'den uzun sürerse, alt ajan bitince (varsayılan açık), oturum bitince (varsayılan kapalı); düğmeli evet/hayır onayı | **Zamana bağlı tetikleme yok**; cron olayını Telegram'a bağlayan kod yok (olay adları üzerinden kurulabilir mi ölçülmedi); `botToken` ister; README `telegram_approve`'ı anlatmıyor, kod anlatıyor | Yok | telegram `dist/index.js:468, 940-965, 1583-1650, 2012-2118, 2440-2500` |
| **notify-hub eklentisi** | Oturum durması, araç hatası, bütçe eşiği olaylarını verilen webhook adresine JSON POST eder | Adres boşsa hiçbir şey yapmaz; e-posta/SMS kanalı yok; varsayılan kapalı | Yok | plugins README:810-829; `dist/notify-hub.js:158-200, 315-336, 479-503` |
| **Tarayıcı bildirimi (WebUI), HQ mobil bildirim** | Sekme arka plandayken bildirim, ses zili; HQ telefon arayüzünde "dikkat gerekli" | Uygulama tamamen kapalıyken sunucudan itme bildirimi YOK (README açıkça yazıyor); masaüstü uygulamasında OS bildirimi/tepsi kodu bulunmadı | Yok | webui `notify.ts`; webui-hq README "Mobile console" |
| **`Notification` kancası** (core, 11 kanca olayından biri) | İzin istemi ya da soru kullanıcıyı beklerken çalışır; **kabuk komutu bağlanabilir** (ör. telefon bildirimi) | Yalnız gözlemsel, sonucu yok sayılır | Kullanılabilir (Claude Code'un aynı adlı kancası) | core `dist/hooks/lifecycle-bridge.d.ts:19-22`; `chunk-YKP5AF23.js:530-555` |
| **Saatlik hijyen** (sage) | Oturum kapanışında hijyen çalışır, son otomatik çalışmanın üzerinden 60 dk geçmediyse atlar; günlük dry-run triage (varsayılan kapalı) ev sahibi açık kaldıkça 24 saatte bir | Daemon'da kendiliğinden tetikleyici YOK; hijyen daima bir istemci isteğiyle başlar; oturum hiç kapanmazsa çalışmaz | Yok (kurulu değil) | sage `index.js:12775, 13015-13024, 12888-13014`; `project-server.js:7813-7826` |
| Filo süpervizörü, lider otomatik uyandırma, HQ uyarı motoru (15 sn), Brain/Eternal otonomi döngüleri, `token-throttle`, iç `setInterval`'lar | Filo içi bakım ve uyarı | Kullanıcıya hatırlatma değil; ev sahibi süreç yaşarken çalışır | Yok | core `fleet-supervisor.d.ts`, `leader-auto-wake.d.ts`, `hq/alerts.d.ts` |

**Claude Code'un yerli karşılıkları (bu oturumun araç listesinde görünüyor; davranışları ÖLÇÜLMEDİ):** `CronCreate/CronDelete/CronList`, `ScheduleWakeup` (/loop), `PushNotification`, `Monitor`, `RemoteTrigger` ve `schedule` skill'i (bulut rutinleri), aynı adlı `Notification` kancası. Ölçülmesi gereken üç şey: (1) `PushNotification` telefona ulaşıyor mu, (2) zamanlanmış görev makine/pencere kapalıyken çalışıyor mu (bulut rutini mi, yerel mi), (3) kota bedeli. **Karar 53:** zamanlayıcı/cron/loop kurulmadan önce Recep ile konuşulur; bu yüzden aşağıda karar olarak sunuldu.

**Hüküm:** hatırlatma ihtiyacı için WrongStack'ten alınacak bir şey yok; yerli araçlarla çözülür. WrongStack'ten tek fikir: Telegram köprüsünün "uzun süren iş bitti, onay bekleniyor" olayları (bizde Claude Code kancasıyla `Notification` olayına bağlanan bir betikle aynısı yapılabilir).

---

## REC-391 açık kalemlerinin 1.0.29'daki durumu (ölçüldü)

| Kalem | 1.0.29'da | Kanıt |
|---|---|---|
| K2 `update_task` `assignee` yok sayılıyor | DEĞİŞMEDİ | tools `chunk-B3FQKCA3.js` 1.0.26 ile bayt bayt aynı (`cmp`) |
| K3 `transition_task` hata mesajı yol göstermiyor | DEĞİŞMEDİ | aynı kod; hata `issues[]` içinde geliyor (kanban `index.js:4265`) |
| K5 `verify_completion` izin listesi dar | DEĞİŞMEDİ | `DEFAULT_ALLOWED` = pwd, true, false, test (kanban `index.js:4956`) |
| M3 kısa kimlik sessiz düşüyor | DEĞİŞMEDİ | core `normalizeRecipient` iki sürümde aynı |
| C1 incoming-calls MCP'de yok | DEĞİŞMEDİ | codebase-index-mcp `index.js` 1.0.26 ile bayt bayt aynı (diff 0) |
| S1 sage'de anlamsal arama bağlı değil | DEĞİŞMEDİ | sage-mcp bayrak listesinde gömme seçeneği yok; vektör kanalı yalnız ev sahibi tarafında birleşir |
| K4 `verify_completion` zaman aşımı, K6 boşta süreç, C2, C3, C4, G1 | Ölçülmedi (1.0.29'da ayrıca denenmedi) | — |
| Yeni (1.0.29) | Posta girdi doğrulaması (enum), kanban tamamlama kapısı ayar birleştirme düzeltmesi (`completionGate` artık ayarları ezmiyor), `finalizeTaskCompletion` `expectedLeaseId` uyuşmazsa reddeder, git çıktısı `-z` ile ayrıştırılıyor (Türkçe karakterli yol), OAuth `resource_metadata` sıkılaştırması, bağlantı adının gizli anahtarla karması | ilgili bölümlerdeki `diff` satırları |

**Yükseltme (Ops'un işi, bilgi):** 1.0.29 kazancı küçük, açık kalemlerin hiçbirini çözmüyor; maliyeti: kanban yamasının yeniden üretilmesi (hedef `cli.js` farklı), bağlantı adı karması yüzünden eski daemon'ların durdurulması, tüm pencerelerin kapalı olması. Kanban `index.js`'teki 682 satırlık fark ayrıntılı okunmadı.

---

## Recep'e gidecek en fazla 3 karar (numarayı Ops verir)

1. **Hafızada Türkçe anlamsal arama kurulsun mu?** Şimdi hafıza yalnız kelime tutunca bulunuyor ("iade" yazınca "geri ödeme" notu gelmiyor). Hazır paket (vector-memory) var ama yalnız İngilizce model ve 384 boyuta sabit; Türkçe bir model seçip ölçmek birkaç gün iş (boyut L). Önerim: **evet, ama önce bir günlük Türkçe kalite ölçümü**; sonuç kötüyse vazgeçeriz, hiçbir şey bozulmaz.
2. **Bayat hafıza denetleyicisi yazılsın mı?** WrongStack'te "hafızadaki eski bir iddiayı güncel dosyayla karşılaştırıp doğru/eski/çelişkili hükmü veren" küçük bir alt ajan var (Memory Companion); bizim durum dosyası ve MEMORY.md bayatlık derdimiz tam bu. Bizde Claude Code alt ajanı (Haiku, salt okuma, sabit maliyet tavanı) olarak yazılır (boyut M). Önerim: **evet**.
3. **Hatırlatma ve telefon bildirimi kurulsun mu?** WrongStack'te hazır yok; Claude Code'un yerli araçları var ama davranışları ölçülmedi (telefona ulaşıyor mu, makine kapalıyken çalışıyor mu). Önerim: **önce bir saatlik ölçüm, sonuç sana rapor edilir, kurulumu sen onaylarsın** (zamanlayıcı kuralı gereği).

---

## Ölçülmeyenler ve düzeltilen eski iddialar

**Ölçülmedi:** `@wrongstack/cli` ve `webui-server` rotalarının gövdeleri (yalnız adlar); triage iç mantığı (yalnız `.d.ts` + çağrı yeri); `tool-call-memory` iç puanlaması; HQ senkron köprüsü; wrongtrace daemon davranışı; Türkçe gömme kalitesi (hiçbir çok dilli modelle deneme yapılmadı); `İ/ı` küçük harf davranışı; 90 eklentinin gövdeleri (yalnız `description:` satırları okundu); `project_kit` ve `project_kit_run` araçlarının işlevi (1.0.29 `tools` listesinde var, 09-29 notumdaki "1.0.27'de yok" bu sürümde geçerli değil); kanban-mcp `index.js`'teki 682 satırlık farkın ayrıntısı; K4, K6, C2-C4, G1'in 1.0.29 davranışı; Claude Code yerli zamanlayıcı/bildirim araçlarının davranışı; sürümler arası (1.0.26 → 1.0.29) sage-mcp satır satır farkı.

**Düzeltilen eski iddialar (bu defterden önceki notlarım):**
1. "`subscribeSessionEndCommitExtractor` oturum sonunda commit'lerden ders çıkarır" (memory `wrongstack-gomulu-yetenek-envanteri` madde 3): 1.0.29'da hafıza kaydı ÜRETMİYOR, yalnız `.wrongstack/domain-terms.md` yansısını yazıyor.
2. "`/bughunt` yalnız WrongStack TUI'da": WebUI'de de var.
3. "`memory_hygiene` aday üretir, silmez": oturum kapsamlı hafızaları 7 gün sonra yumuşak siler, tekilleştirmede `superseded` yapar; proje hafızaları için silme yalnız aday.
4. "1.0.29'da kanban-mcp/mailbox-mcp/codebase-index-mcp yok" (alt-ajan bulgusu): üçü de npm'de 1.0.29 olarak var, karşılaştırıldı.

## 1.0.27 – 1.0.31 değişiklik özeti (2026-10-04, ARC-24, karar 257) — KURULUM YAPILMADI

**Ne ölçüldü:** GitHub `WrongStack/WrongStack` sürüm notları (1.0.27–1.0.30 notları yalnız "Full Changelog" bağlantısı, 1.0.31'in notu dolu), `v1.0.26...v1.0.31` arası 111 commit başlığı ve ilgili commit'lerin hangi paketlere dokunduğu (GitHub API). **Kod satırı satırı okunmadı**; commit gövdeleri boş, yalnız `fix(kanban)` commit'inin dosya listesine ve değişen işlev adlarına bakıldı. Kanıt dili yukarıdaki gibi: yazılmayan "ölçülmedi"dir.

| Sürüm | GitHub'da | npm'de | Not |
|---|---|---|---|
| 1.0.27 | 09-27 | var | notu yalnız karşılaştırma bağlantısı |
| 1.0.28 | 09-29 | var | aynı |
| 1.0.29 | 09-29 | **var (npm'in son sürümü)** | sage HQ eşitleme, harici ajan bağlantısı, birleşik sıralı arama (commit başlığı) |
| 1.0.30 | 10-01 | **yok** | MCP OAuth boş/null isteğe bağlı alan düzeltmesi (changelog satırı) |
| 1.0.31 | 10-03 | **yok** | ToolFlow, Session Story, kalıcı Docker otomasyonu, hesap girişleri (sürüm notu) |

| Bizim sunucu | Değişiklik (commit başlığından) | Bize etkisi |
|---|---|---|
| kanban-mcp | `fix(kanban): enforce assignment, completion and session-mirror integrity`: 27 kaynak dosya, yeni `completion-gate`, `definition-of-done`, `task-checks`, atama kurtarma (`assignment-recovery`) | **Kart kapatma (kanıt komutuyla Done) ve atama davranışı değişebilir.** Yükseltmeden önce ayrı çalışma kopyasında bir deneme kartı kapatılmalı. Ölçülmedi: bizim kapanış akışımızı bozup bozmadığı. |
| kanban-mcp | `fix(kanban): drop the unreachable completed-branch that fails declaration emit` | Derleme düzeltmesi, davranış değişmez. |
| sage-mcp | `graphFor` bozuk satırda fırlatmak yerine atlar; aynı terim iki kanaldan eşleşse bir kez sayılır; `close()` kimlik yeniden denemesinde bekleyen çağrıyı uyandırır; bellek geçerliliği yönetimi | Hata düzeltmeleri. **ARC-23 (aday kuyruğu) ile ilgili bir başlık görünmüyor**; ölçülmedi. |
| mailbox-mcp | Başlıklarda mailbox-mcp'ye özel düzeltme yok; yalnız 1.0.29 toplu sürüm commit'i dokunuyor | Etki görünmüyor. WebUI'de yazma/yanıtlama eklenmiş (bizde WebUI kullanılmıyor). |
| codebase-index-mcp | yaml/ruby/css satır eşleşmesi kendi satırında kalır; Rust `cr"…"` C-string sabitleri ham sayılır | İndekste küçük doğruluk düzeltmeleri. |
| ortak (core, tools, runtime) | `fix(security)` sıfır ömürlü önbellek yanıtı bayat kullanılamaz (core); `harden command execution` (tools); `harden persistence, prompts, plugin guards` (core, runtime, plugins, sage…) | Dört sunucumuzun bunlara bağımlılığı **ölçülmedi**; sertleştirme niteliğinde, bir açık kapatma ilanı yok. |

**Güvenlik düzeltmesi var mı:** GitHub'ın güvenlik duyuruları listesi **boş**, sürüm notlarında CVE/duyuru ifadesi yok. "security" etiketli tek commit `fix(security)` (core'da yanıt önbelleği); sertleştirme commit'leri ayrıca var. Bizim dört MCP sunucusunu doğrudan etkileyen bir açık ilan edilmemiş. Bu "etkilemez" demek değildir: ortak paketlerin sunuculara yansıması ölçülmedi.

**Kurulabilirlik:** dört paketin npm'deki son sürümü **1.0.29**; 1.0.30 ve 1.0.31 yalnız GitHub etiketi. Kurulacaksa hedef 1.0.29'dur, 1.0.31 değil.

**Öneri:** güvenlik duyurusu olmadığı için yükseltme **12 Ekim sonrası**; önce ayrı çalışma kopyasında kanban kart kapatma denemesi. Bu dört madde bu bölümde karara bağlanmadı: ARC-24'ün 4. kalemi (Context Dashboard ve Session Story'nin bizim bağlam kancamızla karşılaştırılması) **henüz yapılmadı**.

**Satırın kendisi:** her mesajın kanca satırında "WRONGSTACK: bizde X, son Y" görünür (`.claude/hooks/wrongstack-satiri.cjs`); GitHub'dan günde en çok bir kez okunur.

## Yeniden ölçme tetikleyicisi

- WrongStack yeni sürüm yayımlanınca (kanca satırı "WRONGSTACK: bizde X, son Y" uyarı verir; 2026-10-04'te en yeni GitHub 1.0.31, npm 1.0.29): yalnız `diff` ile değişen paketler okunur, bu deftere tarihli satır eklenir.
- REC-391 kalemlerinden biri kapanınca ilgili satırın "Bizde durum" hücresi güncellenir.
- "Yeni kayıt gerekir" yazan satırlar için Ops onayından sonra Linear kaydı açılır; kayıt numarası satıra yazılır (kaydı olmayan iş takip tablosuna girmez).
