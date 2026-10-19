# Claude Code yerleşik özellik envanteri — 2026-10-19

**Şerit:** HARİTA · **Kart:** HRT-69 (OPS-176; karar 393) · **Cetvel:** `docs/standards/belge-yonetimi-standard.md`, `docs/standards/execution-method-standard.md`
**Kaynak:** Claude Code resmi belgelerinden (code.claude.com/docs/en, 19 Ekim 2026 alımı) çıkarılan 349 satırlık özellik tablosunun VentHub kurulumuyla kıyası (OPS ölçümü, salt okuma; ham rapor OPS oturumunun kaydında).
**Kapsam:** yalnız Claude Code'un YERLEŞİK özellikleri. Bizim yeteneklerimiz, eklentilerimiz ve MCP sunucularımız bu belgede yoktur; ilgili satırlar (yetenek, eklenti ve MCP kategorileri) çıkarıldı. Satır numarası ham tablodaki sıradır.
**Ne için:** sorun için kendi çözümünü yazmadan önce yerleşik karşılığı bu belgeden ara (filo-ortak kuralı). Bu belge ölçümdür; bir satırın "evet" olması uygulama emri değildir, uygulama için kart açılır.

## 1 · SAYIM (349 satır, 349 etiket)

| Etiket | Sayı |
|---|---:|
| Kullanılıyor | 76 |
| Kısmen (kısmen kullanılan ya da kullanım kanıtı yok) | 113 |
| Kullanılmıyor ama işe yarar | 44 |
| Kullanılmıyor, gereksiz | 103 |
| Kararlı (bir karar numarasıyla belirlenmiş) | 13 |

Kısmen etiketinin büyük kısmı dosyadan kanıtlanamayan slash komutları ve arayüz ayrıntılarıdır; bunların kullanımı yalnız oturum içinde gözleyerek ölçülür. Belgenin kendi sınırı: statusline alanları, bellek içe aktarma sözdizimi, sandbox kipleri, kısayol tablosunun tamamı, ortam değişkenlerinin kalanı, mods alt sayfaları, chrome/mobil ve Agent SDK ayrıntıları okunamadı; ilgili satırlar tam sınıflanamadı.

## 2 · KULLANILMIYOR AMA İŞE YARAR (yetenek, eklenti, MCP satırları hariç)

| Satır | Özellik | Ne kazandırır | Bedel/risk | Önerim |
|---|---|---|---|---|
| 14 | /status "Setting sources" | Hangi ayar dosyasının yüklü olduğu tek bakışta görünür | Yok | evet |
| 15 | claude doctor | Kurulum ve ayar hatalarını salt okunur teşhis eder | Yok | evet |
| 221 | preferredNotifChannel | Görev bitince bildirim; çok pencerede bekleme kaybı azalır | Gürültü | evet |
| 300 | Masaüstü bildirimi (görülmemiş oturum bitince) | Biten oturumu haber verir | Gürültü | evet |
| 222 | Notification kancası | Girdi bekleyen oturum için ses ya da komut | Kanca bakımı | evet (396 ile birlikte) |
| 257 | --max-turns, --max-budget-usd | Betik koşularına tur ve harcama tavanı; kota koruması | Yarım kalan iş | evet (betik koşuları) |
| 325 | /code-review ultra, /ultrareview | Kritik PR'da derin bulut incelemesi; 3 ücretsiz koşu | Kod buluta gider | evet (tek PR, yalnız OPS kararıyla) |
| 90 | Agent background, isolation, color, initialPrompt | Yazan uygulayıcı ayrı worktree'de çalışır (ARC-120 kapsamı) | Birleştirme yükü | evet (uygulayıcılar için, önce ölçüm) |
| 181 | isolation: worktree ve /batch | Paralel değişiklik ayrı kopyada; ana dal bozulmaz | Birleştirme ve temizlik | evet |
| 63 | awaySummaryEnabled ve diğer oturum ayarları | Dönüşte özet; plan kabulünde bağlam temizliği | Özet maliyeti | evet (yalnız awaySummaryEnabled) |
| 48 | promptCacheTtl, subagentPromptCacheTtl | 1 saatlik önbellek uzun oturumda girdi maliyetini düşürebilir | Yazım maliyeti; ölçülmedi | evet, önce ölç |
| 243 | CLAUDE_CODE_BS_AS_CTRL_BACKSPACE (Windows) | Windows'ta Backspace kelime silme düzeltmesi | Yok | evet |
| 299 | Otomatik arşiv (PR birleşince) | Biten yerel oturumlar kenar çubuğundan çıkar | Arşivden dönüş zorlaşır | evet |
| 105 | Ekip kancaları TeammateIdle, TaskCreated, TaskCompleted | Ekip görevlerinde kalite kapısı | Ekip açılmadı | evet, ekip açılınca |
| 106 | Ekip plan onayı | Ekip arkadaşının planını lider onaylar | Gecikme | evet, ekip açılınca |
| 179 | .worktreeinclude | .env gibi gitignore'lu dosyalar worktree'ye kopyalanır | Sır dosyaları çoğalır | hayır (sır kapsamı önce netleşmeli) |
| 305 | CI durum çubuğu, otomatik düzeltme, otomatik birleştirme | CI durumu görünür | Otomatik birleştirme kural 13 ile çelişir | hayır (otomatik birleştirme); durum çubuğu evet |
| 294 | /fewer-permission-prompts | Onay isteklerini azaltacak allow önerisi | allow genişler; izin değişikliği Recep kapısıdır | hayır (öneri OPS'a, uygulama Recep onayıyla) |
| 36 | sandbox ayarı (yaklaşık 35 alt anahtar) | Bash komutları işletim sistemi düzeyinde kısıtlanır | Yerel Windows'ta desteklenmez, WSL2 gerekir; MCP ve kancalar dışarıda | hayır |
| 273 | sandbox ayarı ve /sandbox | Aynı konu (Bash izolasyonu) | Aynı | hayır |
| 275 | sandbox.filesystem ve sandbox.network | Dosya ve ağ sınırları | Yerel Windows'ta yok | hayır |
| 209 | GitHub Actions claude-code-action | PR'da @claude incelemesi | API maliyeti; herkese açık depoda fork PR riski; self-hosted yasağı | hayır |
| 220 | Claude Code Review (yönetilen servis) | Her PR otomatik incelenir | Ücret; /code-review ve security-reviewer zaten var | hayır |
| 215 | Bulut oturumları (--cloud) | Bilgisayar kapalıyken iş sürer | Kod buluta gider; karar 395 yerel seçti | hayır |
| 216 | /teleport, /remote-env, /web-setup | Bulut oturumunu terminale çeker | Bulut bağımlılığı | hayır |
| 217 | /autofix-pr | CI hatasını bulutta düzeltir | Otomatik değişiklik; kota | hayır |
| 44 | remoteControlAtStartup, disableRemoteControl | Açılışta uzaktan erişim | Uzaktan erişim yüzeyi; karar 396 | karar bekliyor |
| 211 | /remote-control (/rc) | Yerel oturumu telefon ya da web'den izleme | Uzaktan erişim yüzeyi; karar 396 | karar bekliyor |
| 45 | crossSessionInbound, isolatePeerMachines, dialogExpiry | Oturumlar arası gelen mesajı kabul, bekletme ya da reddetme | Posta kutusu MCP ile çakışır; belgeye göre varsayılan tanımsız (ARC-135 §7.2) | hayır (önce farkı ölç) |
| 110 | Worktree izolasyonu ve claude agents --json | Arka plan oturumları betikle izlenir | Ayrı bakım | hayır |
| 150 | Kanallar (channels) | Dış olaylar (Telegram, Discord) oturuma girer | Dışarıdan komut yüzeyi | hayır |
| 26 | advisorModel, agent, fastMode | İkinci model danışmanı; hızlı mod | Ek token; kota | hayır |
| 322 | /advisor | Kritik anlarda ikinci görüş | Maliyet | hayır |
| 50 | bashOutputMaxChars, askUserQuestionTimeout, autoContinueAtUsageLimit | Kullanım limitinde otomatik devam | Kontrolsüz kota tüketimi | hayır |
| 53 | voice, voiceEnabled | Türkçe sesli giriş | Claude.ai hesabı; kullanım kanıtı yok | hayır |
| 252 | /voice | Aynı konu | Aynı | hayır |
| 74 | http kanca alanları | Olay verisini dış uca iletir | Veri dışarı çıkar; sır riski | hayır |
| 75 | mcp_tool kanca alanları | Kanca doğrudan MCP aracı çağırır (ör. Kanban) | MCP hata yüzeyi; command kancası yeterli | hayır |
| 76 | prompt ve agent kanca alanları | Model değerlendirmesiyle kapı | Maliyet, gecikme; agent deneysel | hayır |

## 3 · KISMEN (yetenek, eklenti, MCP satırları hariç)

| Satır | Özellik | Ne kazandırır | Bedel/risk | Önerim |
|---|---|---|---|---|
| 47 | autoCompactEnabled, autoCompactWindow, idleCompaction | Tek ve öngörülebilir sıkıştırma eşiği | Şu an iki mekanizma var (CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=60 ve fast-jev-compaction 50); etkili eşik ölçülmedi | evet (önce ölç, tek mekanizma seç) |
| 73 | command alanları: args, asyncRewake, shell (onFailure ve async kullanılıyor) | asyncRewake: arka plan kancası çıkış kodu 2 ile Claude'u uyandırır (390 onFailure uygulandı) | Karmaşıklık | evet (asyncRewake, Stop kapısında) |
| 68 | 33 olay, 1/3 (Setup, UserPromptExpansion, PermissionDenied eksik) | PermissionDenied ile reddedilen çağrı kaydı | Kanca yükü | evet (PermissionDenied) |
| 69 | 33 olay, 2/3 (Notification, SubagentStart/Stop, TaskCreated/Completed eksik) | Alt ajan ve görev kapanışı kanıtı | Gürültü | evet (SubagentStop, TaskCompleted) |
| 70 | 33 olay, 3/3 (StopFailure, TeammateIdle, CwdChanged, FileChanged, WorktreeCreate/Remove, Elicitation eksik) | StopFailure hata kaydı; WorktreeRemove temizlik | Bakım | evet (StopFailure); diğerleri hayır |
| 71 | Kanca handler tipleri | Yalnız command kullanılıyor (49/49); http, mcp_tool, prompt, agent yok | 74-76 ile aynı | hayır |
| 72 | Ortak alanlar: if, once | if ile kanca yükü azalır (timeout ve statusMessage var) | Süzgeç hatası | evet (ölçülü) |
| 23 | model, fallbackModel, effortLevel, modelSettings | fallbackModel yok (karar 392: gerek yok) | Yok | hayır (392) |
| 28 | statusLine ve subagentStatusLine | Alt ajan satırı yok | Gürültü | hayır |
| 31 | timeFormat, timeZone, language, maxProseWidth | timeZone yok (language turkish var) | Yok | evet (timeZone) |
| 40 | attribution; includeCoAuthoredBy | attribution ayarı yok; commit atfı şu an talimatla geliyor | Atıf değişikliği izi | hayır (karar OPS) |
| 49 | fileCheckpointingEnabled | rewind için dosya anlık görüntüsü | Disk; varsayılan açıklığı ölçülmedi | hayır |
| 56 | prependPlugins, appendPlugins, syncClaudeAi* | Eklenti sırası ve senkron kontrolü | Düşük fayda | hayır |
| 65 | ~/.claude.json global anahtarları | IDE, diff, kopyalama tercihleri | 10 anahtardan yalnız claudeInChromeDefaultEnabled=true ölçüldü | hayır (ölçüm yok) |
| 87 | maxTurns, effort, experimental.cacheTtl (ajan frontmatter) | maxTurns yalnız 1/70 ajanda var | Yarım iş | evet (uygulayıcılar için effort) |
| 88 | skills, mcpServers, hooks (ajan frontmatter) | skills 55'te var; mcpServers ve hooks 0 | Bağlam yükü | hayır |
| 89 | memory, omitClaudeMd | memory 67'de var; omitClaudeMd yok | Kural kaçırma riski | hayır |
| 99 | CLAUDE_CODE_SUBAGENT_MODEL_FORCE, CLAUDE_CODE_FORK_SUBAGENT | SUBAGENT_MODEL=sonnet var; FORCE ve FORK yok | Model kilidi | hayır |
| 102 | CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS | env=1 ayarlı; ekip açılmadı. Ekip kullanımı kararlaştırıldı, karar numarası yok | Yan etki ölçülmedi (18 Ekim #11) | karar bekliyor; önce ölçüm |
| 103 | Paylaşılan görev listesi, posta kutusu, ekip içi mesaj | Ekip içi iletişim | Yan etki | evet, ekip açılınca |
| 104 | teammateMode | Ekip panel görünümü | Düşük | hayır (varsayılan) |
| 122 | Dize değişkenleri (${CLAUDE_SKILL_DIR} vb.) | Yol ve argüman değerleri | Kullanım ölçülmedi | hayır |
| 113 | /workflows ilerleme görünümü | Workflow koşularını izler | Koşu sayısı ölçülmedi | evet |
| 107 | claude agents, --bg, /background, /fork | Arka plan oturumlarını tek görünümde izler | Kullanım kanıtı yok; ek kaynak | hayır (şimdilik) |
| 109 | Peek, yanıt, ayrılma, /stop | Oturum çıktısını açmadan görür | Kullanım kanıtı yok | hayır |
| 165 | AGENTS.md okuma | Repo'daki AGENTS.md (var) talimat olarak okunur mu ölçülmedi | İki talimat dosyası çelişebilir | evet (tutarlılık ölçümü) |
| 166 | .claude/rules paths | Kuralı yola göre uygular; bağlam azalır | filo-ortak.md'de paths yok, her oturumda yüklenir; kural kaçırma riski | OPS onayıyla |
| 168 | /memory | Bellek dosyalarını düzenler | Kanıt yok | hayır |
| 174 | Bellek içe aktarma (@) | Dosyayı CLAUDE.md'ye bağlar | Kullanım ölçülmedi | hayır |
| 182 | Worktree temizliği (cleanupPeriodDays, lock) | Dış worktree birikimini temizler (ARC-132: 254 dış worktree ölçülmedi) | Aktif worktree silme riski | evet (önce ölçüm, OPS onayı) |
| 191 | /context ve /context all | Bağlam dağılımı ve öneri | Kanıt yok | evet (kota ve sıkıştırma kararı) |
| 192 | /btw | Konuşmayı kirletmeden yan soru | Kanıt yok | hayır |
| 193 | /rewind, Esc Esc | Kod ve konuşma geri alma | Kanıt yok | hayır |
| 194 | Rewind menü seçenekleri | Geri alma ve özet türleri | Kanıt yok | hayır |
| 195 | /clear sonrası önceki oturum | Önceki konuşmaya dönüş | Kanıt yok | hayır |
| 196 | /autocompact, CLAUDE_CODE_AUTO_COMPACT_WINDOW | Sıkıştırma penceresi (100K-1M) | Biz PCT_OVERRIDE kullanıyoruz; WINDOW yok | hayır (47 ile birlikte karar) |
| 197 | PreCompact (var), PostCompact | Sıkıştırma sonrası durum yükleme | PostCompact ARC-119 hükmüyle yazılmaz; deney yok | hayır |
| 198 | /usage, /cost, /stats, /insights | Kota ve maliyet görünürlüğü | Kanıt yok | evet (kota takibi, 336 ile) |
| 199 | /loop | Oturum içi tekrarlı çalıştırma | Kalıcı iş masaüstü görevinde (395) | hayır |
| 200 | ScheduleWakeup | Claude'un kendi aralığı | Kanıt yok | hayır |
| 201 | .claude/loop.md | Varsayılan bakım istemi | loop.md yok | hayır |
| 202 | Tek seferlik hatırlatıcı | Bir kez çalışan görev | Kanıt yok | hayır |
| 203 | CronCreate, CronList, CronDelete | Oturum içi cron (7 gün, 50 görev) | 18 Ekim: "No scheduled tasks"; kalıcı iş 395'te | hayır |
| 204 | CLAUDE_CODE_DISABLE_CRON | Zamanlayıcıyı kapatır | Kullanılmıyor | hayır |
| 205 | /goal | Koşul sağlanana kadar çalışır | Kanıt yok | hayır |
| 227 | Çıktı stili frontmatter | keep-coding-instructions ve force-for-plugin | recep.md frontmatter ölçülmedi | ölç |
| 228 | /output-style | Stili listeler, değiştirir | outputStyle zaten Recep | hayır |
| 234 | Klavye kısayolları | Oturum içi kısayollar | interactive-mode tablosu tam okunamadı | hayır |
| 236 | Ctrl+X kanalları | Alt ajanları durdurma, kuyruğa alma | Kanıt yok | hayır |
| 241 | /terminal-setup, Option tuşu, tmux | Shift+Enter ve Meta kısayolları | Windows Terminal ölçülmedi | hayır |
| 242 | Ctrl+J, \ + Enter | Göndermeden satır sonu | Kanıt yok | hayır |
| 247 | /ide, --ide, autoConnectIde | IDE bağlantısı | autoConnectIde yok | hayır |
| 254 | --output-format (json, stream-json) | Betik çıktısı makine tarafından okunur | Kullanım kanıtı yok | evet (betik koşuları) |
| 259 | --allowedTools, --disallowedTools, --tools | Betik koşularında araç sınırı | Kanıt yok | evet (betik) |
| 264 | Çıkış kodları, --bg/--exec, agents --json | Betik sonucunu okuma | Kanıt yok | hayır |
| 268 | --mcp-config, --strict-mcp-config, --settings, --add-dir, --plugin-dir | Oturum bazlı MCP, ayar, dizin | Plugin dizini env ile yapıldı | hayır |
| 269 | --agents, --agent, --effort, --model, --fallback-model, --advisor | Oturum bazlı model ve ajan | Kanıt yok | hayır |
| 270 | --session-id, --name, --resume/--continue ile -p | Betik oturumuna kimlik | Kanıt yok | hayır |
| 274 | Sandbox platform desteği | Yerel Windows'ta sandbox yok | Bilgi satırı | hayır |
| 279 | default izin modu | Her eylemde onay | defaultMode auto ile değişti | hayır |
| 281 | plan izin modu | Yalnız okuma, plan çıkarır | Kullanım kanıtı yok | ölç |
| 285 | Shift+Tab döngüsü, /permissions | Modu oturum içinde değiştirir | Kanıt yok | hayır |
| 290 | claude auto-mode defaults, config, critique, reset | Oto mod kurallarını eleştirir | autoMode'da 28 girdi var; eleştiri çalıştırılmadı | evet (oto mod denetimi) |
| 291 | /permissions sekmeleri (Auto mode, Recently denied) | Reddedilen eylemleri yeniden çalıştırma | Kanıt yok | evet (reddedilenleri gözden geçirme) |
| 292 | PermissionDenied kancası (PermissionRequest var) | Reddi kaydetme | Kanca yok | evet |
| 295 | Çalışma alanı güveni | Proje kural ve kancalarının onayı | Varsayılan; kanıt yok | hayır |
| 302 | Harici tarayıcı, site onayları | Dış sitede eylemleri onaylatma | Kanıt yok | hayır |
| 303 | Statik dosya önizlemesi | Proje dosyasını açar | Kanıt yok | hayır |
| 306 | Bölünmüş görünüm, terminal, pane | Oturumları yan yana açar | Kanıt yok | hayır |
| 307 | Yan sohbet, arka plan görevleri paneli | Oturumu bozmadan soru | Kanıt yok | hayır |
| 308 | Oturumlar arası mesajlaşma | Oturumdan oturuma mesaj | Posta kutusu MCP ile çakışır | hayır |
| 312 | Bilgisayar kullanımı (computer use) | Masaüstü uygulamalarını kontrol eder | Güvenlik; kullanım kanıtı yok | hayır |
| 315 | İstem kutusu düğmeleri ve kısayollar | Ek, model, efor değiştirme | Kanıt yok | hayır |
| 316 | Kullanım halkası, transkript görünümü | Bağlam ve kullanım gösterimi | Kanıt yok | hayır |
| 321 | ultrathink ve alwaysThinkingEnabled | Tek tur ya da sürekli derin düşünme | ultracode var; sürekli düşünme maliyeti | hayır |
| 323 | /fast, fastMode | Hızlı yanıt | Ek ücret etkisi ölçülmedi | hayır |
| 328 | /verify, /run, /run-skill-generator | Uygulamayı çalıştırarak değişikliği doğrular | Kanıt yok | evet (verify-before-done ile) |
| 330 | /diff | Çalışma ağacı farkı | Kanıt yok | hayır |
| 331 | /doctor ve claude doctor | Teşhis | 15 satırında zaten önerildi | hayır (15 ile aynı) |
| 332 | /debug, --debug | Kanca ve hata günlüğü | Kanıt yok | evet (kanca hataları için) |
| 334 | /release-notes, /recap, /powerup | Özet ve sürüm notları | Bilgi amaçlı | hayır |
| 336 | /usage, /usage-credits, /rate-limit-options, /upgrade, /passes, /privacy-settings | Kota ve plan | Kanıt yok | evet (/usage, 198 ile) |
| 340 | /add-dir, /cd, /color, /config, /context, /copy | Çalışma yönetimi | Kanıt yok | hayır |
| 341 | /export, /rename, /resume, /rewind, /branch, /clear | Konuşma yönetimi | /rename ve /resume kullanılıyor; diğerleri kanıt yok | hayır |
| 342 | /hooks, /ide, /keybindings, /memory, /mcp, /plugin, /skills, /agents, /tasks | Yönetim panelleri | Kanıt yok | hayır |
| 343 | /init, /import, /terminal-setup, /theme, /tui, /statusline, /output-style, /voice | Kurulum ve görünüm | Bilgi amaçlı | hayır |
| 344 | /goal, /loop, /schedule, /workflows, /deep-research, /btw, /stop, /background, /plan, /autocompact | Zamanlama ve workflow komutları | Kanıt yok; NotebookLM ve maestro kullanılıyor | hayır |
| 345 | /mobile, /remote-control, /teleport, /remote-env, /web-setup, /autofix-pr | Mobil ve bulut komutları | Karar 396 ve 215-217 ile aynı | karar bekliyor |
| 346 | /list-agents, /subtask, /fork, /reload-plugins, /reload-skills, /skill-doctor, /auto-mode-setup | Ajan ve yetenek yardımcıları | /reload-skills 116 ile aynı | evet (/reload-skills) |
| 347 | /artifacts, /design, /design-login, /design-sync, /slides, /dataviz | Artifact ve tasarım komutları | Artifact yayını var; komut kanıtı yok | hayır |
| 352 | Kimlik doğrulama yöntemleri ve öncelik | Giriş ve kimlik sırası | Kanıt yok | hayır |
| 354 | İstem önbelleği ve süresi | Maliyet azaltma | 48 ile aynı; promptCacheTtl yok | ölç (48 ile) |

## 4 · KATEGORİ BAŞINA TEK SATIR (kullanılıyor, gereksiz, kararlı)

Satır numaraları parantez içinde.

- **Ayarlar, KULLANILIYOR (20):** kapsamlar (7), öncelik (8), liste birleşimi (9), /config (12), ConfigChange ile canlı yükleme (16), $schema (17), ~/.claude.json (18), permissions allow/ask/deny/additionalDirectories/defaultMode (20), hooks (21), env (22), ultracode ve workflow ayarları (27), outputStyle Recep (29), autoMode (35), cleanupPeriodDays (39; değer 36500, yani temizlik fiilen kapalı), autoUpdatesChannel latest (42), otomatik bellek (46), artifact (61), ortam değişkeni kategorileri (66).
- **Ayarlar, GEREKSIZ (21):** yönetilen ayar (10), policyHelper (11), --settings (13), CLAUDE_CONFIG_DIR (19), modelOverrides ve modelPicker (24), availableModels (25), tema ve görünüm (30), tui ve ekran okuyucu (32), tekerlek kaydırma (33), spinner (34), apiKeyHelper ve bulut kimlik (37), forceLogin (38), includeGitInstructions ve prUrlTemplate (41), remote.defaultEnvironmentId (43), respondToBashCommands ve defaultShell (51), kurum kanca ve izin sınırları (58, 59, 60), feedback ve skip prompts (62), SSH (64), env çifti öncelik kuralı (67).
- **Ayarlar, KARARLI (1):** worktree ayarları (52; karar 391).
- **Kancalar, KULLANILIYOR (4):** eşleştirici matcher (77), çıktı alanları hookSpecificOutput ve systemMessage, çıkış kodu 2 (78, 79), ${CLAUDE_PROJECT_DIR} (81). **GEREKSIZ (2):** /hooks menüsü (80), kılavuz örnekleri (82).
- **Alt ajanlar, KULLANILIYOR (9):** name ve description (83), tools ve disallowedTools (84), model (85), yerleşik ajanlar (91), kapsam öncelik sırası (92), kalıcı bellek (95), arka plan çalıştırma (96), SendMessage ile devam (97), eşzamanlılık 50 (98). **GEREKSIZ (5):** permissionMode (86), --agents ve /agents (93), fork (94), Explore ve Plan kapatma (100), forward subagent text (101).
- **Ajan ekipleri:** KULLANILIYOR ve GEREKSIZ yok (102-106 KISMEN ya da YARAR).
- **Ajan görünümü, GEREKSIZ (1):** kabuktan attach, logs, stop vb. (108).
- **Workflow'lar, KULLANILIYOR (2):** Workflow aracı (111), ultracode (114). **GEREKSIZ (1):** /deep-research (112).
- **Worktree ve oturum, KULLANILIYOR (4):** --continue ve --resume (183), oturum adlandırma (186), transcript konumu (189), /clear ve /compact (190). **KARARLI (2):** claude --worktree (176; karar 391), EnterWorktree ve ExitWorktree (178; karar 391). **GEREKSIZ (5):** --tmux (177), WorktreeCreate ve WorktreeRemove kancaları (180), --from-pr (184), --fork-session, /branch, /fork (185), /export ve purge (188).
- **Zamanlama ve uzaktan, KARARLI (5):** Routines (206), sınırları (207), masaüstü zamanlanmış görevleri (208; karar 395, sabah-ozeti kuruldu), mobil (213), mobil bildirimler (214; karar 396, inputNeededNotifEnabled=false). **GEREKSIZ (4):** uzaktan kontrol önek (212), GitLab CI (210), Claude Projects (219), bulut ortamları (218).
- **Bildirim ve görünüm, KULLANILIYOR (2):** statusLine (224), çıktı stilleri (226). **GEREKSIZ (7):** iTerm2 bildirimleri (223), footerLinksRegexes (225), tema (229), renk (230), focus ve scroll (231), --ax-screen-reader (232), tam ekran kaydırma (233).
- **Klavye, KULLANILIYOR (1):** girdi modları ! @ / # (235). **GEREKSIZ (5):** keybindings.json (237), bağlamlar (238), ayrılmış tuşlar (239), Vim (240), yapıştırma davranışı (244).
- **IDE ve entegrasyon, KULLANILIYOR (1):** Claude in Chrome (249). **GEREKSIZ (5):** VS Code (245), JetBrains (246), derin bağlantılar (250), GitHub ve Slack uygulama kurulumu (251), diffTool ve IDE dışı yollar (248).
- **Headless ve SDK, KULLANILIYOR (1):** claude -p (253). **GEREKSIZ (12):** --json-schema (255), partial messages ve hook events (256), --bare (258), --permission-mode ve --dangerously-skip-permissions (260), --permission-prompts (261), --restricted ve --safe-mode (262), --no-session-persistence (263), CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS (265), Agent SDK (266), --init ve Setup kancası (267), append-subagent sistem istemi (271), stdin boru hattı (272).
- **Sandbox, GEREKSIZ (3):** kaynaklar (276), oto modda alan adları (277), sandbox kipleri ve credentials (278).
- **İzin modları, KULLANILIYOR (5):** "Yes, and don't ask again" kuralı (286), kural sözdizimi (287), additionalDirectories (288), autoMode sınıflandırıcı (289), kurum izin istisnası değil, ancak izin kuralı sözdizimi için 287 ile aynı. **GEREKSIZ (4):** acceptEdits (280), dontAsk (283), bypassPermissions (284), kurum izin sınırları (293).
- **Masaüstü, KULLANILIYOR (5):** oturum türleri Local (296), kenar çubuğu (297), önizleme ve tarayıcı bölmesi (301), bağlayıcılar ve eklentiler (311), artifacts (317). **KARARLI (3):** paralel oturumlar ve worktree (298; karar 391), kod incelemesi (304; karar 393), uzaktan kontrol ve Dispatch (309; karar 396). **GEREKSIZ (4):** bulut projeleri (310), iOS simülatör (313), kurulum sayfaları (314), kurum kontrolleri (318).
- **Komut ve kullanım, KULLANILIYOR (4):** /model (319), /effort (320), /login, /logout, auth (338), claude update ve install (339). **KARARLI (2):** /code-review (324; karar 393), /simplify (327; karar 393). **GEREKSIZ (7):** /security-review (326; security-reviewer ajanı zaten var), /batch (329; maestro var), /feedback ve heapdump (333), /insights ve team-onboarding (335), /setup-bedrock ve vertex (337), /chrome vb. eğlence ve kurulum (348), kaldırılanlar (349).
- **Kurum ve sınırlar, GEREKSIZ (4):** sunucu tarafı yönetilen ayarlar (350), kurum dağıtımı (351), veri kullanımı ve sağlayıcılar (353), eklenti ve MCP önbellek bilgisi (355).

## 5 · KARAR NUMARALARI VE DURUMLARI

- 390 (kanca onFailure block): uygulanmış; 7 PreToolUse kancasında block var.
- 391 (ayrı çalışma kopyası): uygulanmış; worktree ayarı ve ana dizindeki çalışma kopyaları var.
- 392 (yedek model, gerek yok): yedek model ayarlanmamış, kararla tutarlı.
- 393 (yerleşik /code-review ve /simplify kuralı): uygulanmış (HRT-67, filo-ortak.md).
- 394 (skill paths): uygulanmamış.
- 395 (sabah özeti masaüstü görevi): kurulmuş (19 Ekim).
- 396 (telefon bildirimi): karar bekliyor; mobil bildirim ayarı kapalı.
- Ajan ekipleri: ortam anahtarı açık, ekip açılmamış, ekip kancası yok; yan etki ölçümü açık.

## 6 · SON ÖLÇÜMDEN BU YANA DEĞİŞENLER VE VARSAYILANDAN SAPANLAR

- Kanca olayları 10'dan 11'e çıktı; PermissionRequest eklendi.
- "onFailure yok" iddiası geçersiz: 7 PreToolUse kancasında onFailure block var (karar 390).
- "Kalıcı zamanlama yok" iddiası geçersiz: masaüstü zamanlanmış görevleri var (karar 395).
- Proje deny kuralları 19'dan 26'ya çıktı.
- Varsayılandan sapan değerler: cleanupPeriodDays 36500 (varsayılan 30; transcript birikimi fiilen temizlenmiyor), eşzamanlı alt ajan üst sınırı 50 (belge varsayılanı 20), MCP çıktı sınırı 6000 jeton (belge varsayılanı 25.000), API zaman aşımı 3.000.000 ms.
- Listede ayrı satırı olmayan ama kurulumda bulunan ayarlar: otomatik sıkıştırma eşiği ortam değişkeni (%60; ikinci bir sıkıştırma mekanizması ile birlikte iki eşik var, etkili eşik ölçülmedi), function kancası anahtarı, eklenti dizini ortam değişkeni.

## 7 · ÖLÇÜLEMEYENLER

- Slash komutlarının gerçek kullanımı dosyadan ölçülemez (kısmen etiketi).
- Ajan takımlarının gerçek kullanımı ve yan etkisi ölçülmedi.
- Gerçek kanca tetiklemeleri çalıştırılmadı; yalnız dosya ve ayar varlığı ölçüldü.
- Sandbox yerel Windows'ta denenmedi (belgeye göre yerel Windows'ta desteklenmiyor).
- Kota etkisi ölçülmedi; "kullanım" yorumları kota ölçümü değildir.
- Global yapılandırma dosyasındaki 90 üst anahtardan yalnız 10'u kontrol edildi.

## 8 · FİLO İÇİN SONUÇ

Teşhis komutları kuralı (aynı PR, ortak blok): kurulum ya da ayar şüphesinde `claude doctor` ve `/status` (ayar kaynakları), bağlam ya da kota sorusunda `/context` ve `/usage`, kritik PR'da `/ultrareview` (yalnız OPS kararıyla; 3 ücretsiz koşu, kod buluta gider). Bu dört komut yukarıdaki 2. bölümde "evet" etiketli satırlardır (14, 15, 198, 191, 325).
