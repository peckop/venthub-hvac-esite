# Claude Code yükseltme planı ve Opus 4.8 hızlı mod ölçümü (2026-11-11)

Kartlar: ARC-294 (yükseltme ön-kontrolü), ARC-295 (hızlı mod kullanımı). Yöntem: salt okuma ölçümü, iki araştırmacı çalışan; hiçbir ayar, kanca ya da izin dosyasına yazılmadı.
Kaynak: Takip raporu TKP-1 (`docs/audits/takip-claude-yenilikler-2026-11-11.md`, PR #2482; birleşmemişse PR dalında). Cetvel: `docs/standards/arac-envanteri-standard.md` (dış araç kararı). Ölçüm tarihi 2026-11-11; sürüm bilgisi bu tarihte bayatlar.

## 1. Sürüm durumu (ölçüldü)

- npm dist-tags: stable 2.1.311, latest 2.1.322, next 2.1.322. Kurulu sürüm 2.1.296 (TKP beyanı; bu ölçümde `claude --version` koşulmadı).
- Kullanıcı ayarı `autoUpdatesChannel` = `latest`.

## 2. TKP-1 §3 ön-kontrol sonuçları

| Madde | Bulgu | Etki |
|---|---|---|
| MCP izin kuralı yalnız adı yazılan sunucuyu kapsar (2.1.299) | Proje allow 30, kullanıcı allow 125 / ask 13 / deny 3 girdinin hepsi araç düzeyinde; sunucu düzeyi ve wildcard yok. Ajan tanımlarında (74 dosya) `tools:` satırı 2 dosyada, `mcp__` geçen dosya 0 | Yok |
| `mcp__claude_ai_` deny/ask kuralları Desktop'ta 2.1.319 öncesi yok sayılıyordu | Kullanıcı ask listesinde 9 böyle kural (Vercel satın alma/dağıtım, Supabase migration/edge/merge) | Uyarı: Desktop'ın gömülü sürümü ölçülmedi |
| UserPromptSubmit sırası (2.1.299) | 10 kanca, hepsi matcher `*`; engelleyen yok (exit 2 ve decision 0) | Yok |
| `updatedInput` doğrulaması (2.1.300) | Tek kullanıcı `agir-komut-kilidi.cjs:523`, diğer alanlar korunuyor | Uyarı: sarmalanan komut Bash şemasına uymalı; yükseltme denemesinde bir kez sına |
| Kanca sayısı ve süre (2.1.312) | 75 komut kancası, prompt/agent tipi 0; bir Bash çağrısına 8 PreToolUse kancası eşleşir; 39 kayıtta timeout yok | Uyarı: gecikme; varsayılan süre sürüm notundan okunamadı |
| Bash'te geniş deny, tam ask'ı geçersiz kılar (2.1.319) | Proje deny `git push * master*` / `* main*` geniş; kullanıcı ask `git push origin master*` dar | Uyarı: master/main push'ta "sor" yolu kapanır, doğrudan red olur. Karar OPS'ta |
| `which`, `cp`, `mv`, `sed -i`, `rm` istemleri (2.1.309, 2.1.319, 2.1.321) | Kanca ve skill dizinlerinde gerçek kabuk çağrısı yok; scripts/ içinde 3 satır (CI betikleri, Claude Bash'inden çalışmaz) | Yok; gözetimsiz pencerede istem takılması riski kalır |
| İç içe `.claude/skills` yükleme (2.1.319, 2.1.321) | Kök 75 SKILL.md, `.agent` 36 (27 ortak ad); worktree'lerin çoğu kendi 75 kopyasını taşır | Uyarı: kapsam çalışma anında ölçülmedi |

TKP'nin iki sürüm numarası düzeltildi: `which` istemi 2.1.319 (TKP 2.1.314 diyordu), `rm`/`rmdir` Desktop bypass reddi 2.1.309 (TKP 2.1.321 diyordu). `mcp__a` kuralının anlamı doğru, örnek biçimi sürüm notundan farklı.

### Yükseltmeden bağımsız bulgu

`env-yazma-kapisi` (PreToolUse Bash, timeout 30 sn, `onFailure: block`) bu ölçümde zaman aşımına uğrayıp bir grep çağrısını reddetti. Aynı ölçümde `bash-write-guard`, değişkenli hedef ve yönlendirme içeren bir salt okuma döngüsünü "hedef çıkarılamadı" diye durdurdu. İkisi de ayrı iş olarak ölçülmeli (kart açılacak).

## 3. Öneri: latest (2.1.322), önce kopyada deneme

1. Güvenlik düzeltmeleri yalnız latest'te: 2.1.321 MCP OAuth yönlendirmesinde refresh token'ın başka sunucuya gitmesi ve salt okuma Bash komutunun sandbox dışında izinsiz çalışması. Stable (2.1.311) bunları içermez.
2. 2.1.312–2.1.322 davranış değişikliklerinin çoğu opt-in (`denyInsteadOfPrompting`, `blockWritesOutsideWorkingDirectories`, `CLAUDE_CODE_SUBAGENT_EFFORT`). Varsayılan açık olanlar: MCP görevlerinin arka plana alınması (kapatma `CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND`), `which` istemi, `cp`/`mv` yol kontrolü.
3. §3 maddelerinin çoğu 2.1.296→2.1.311 aralığında gelir; stable seçmek listeyi ortadan kaldırmaz.
4. Ayar zaten latest kanalında.

Stable'ın tek avantajı daha az davranış değişikliği; karşılığında güvenlik açığı kalır.

## 4. Yükseltme adımları (öneri, uygulanmadı)

1. Sage yedeği al.
2. Tüm pencereleri kapat; zamanı Recep ve OPS belirler.
3. Ayrı worktree'de dene: `claude --version`, tek sohbet, UserPromptSubmit sırası, exit 2 kancaları (`bash-write-guard`, `protect-config`), bir MCP çağrısı, grep/sed içeren Bash çağrıları.
4. Yükselt: `npm i -g @anthropic-ai/claude-code@2.1.322` (kurulum yöntemi ölçülmedi; yerel kurulumsa komut farklı olur).
5. Doğrula: sürüm, `node --check` ile kanca dosyaları, smoke testi `CLAUDE_CODE_ENTRYPOINT=sdk-cli`, `--no-session-persistence` ve scratchpad cwd ile.
6. Geri alma: aynı yöntemle `@2.1.296`.

## 5. İzin ayarı önerileri (yalnız öneri; izin ayarı Recep kararıdır, uygulama yok)

- `denyInsteadOfPrompting`: genel olarak ÖNERİLMEZ. Ana terminal pencerelerinde ask istemi red olur; `env-yazma`, `gh-api` kapıları ve push ask'ları Recep'in onay yolunu kaybeder. Alt ajan için ayrı ayarlanabilir olup olmadığı belgede yok.
- `blockWritesOutsideWorkingDirectories`: Write/Edit/NotebookEdit için dış dizinleri her izin modunda reddeder. `C:\tmp` ve `~/.claude` `additionalDirectories` içinde. ÇAKIŞMA: oturum scratchpad dizini ve yan oturum not klasörü kalıcı listede yok; `CLAUDE_CODE_PLUGIN_DIRS` (`C:/Users/alize/mods`) da yok. Etkinleştirmeden önce bu yollar eklenmeli ya da yazma kapsamı ayrıca doğrulanmalı. `additionalDirectories`'in "çalışma dizini" sayılıp sayılmadığı sürüm notunda tanımlı değil.
- Geniş deny / dar ask çakışması (master/main push): karar OPS'ta.

## 6. Opus 4.8 hızlı modu 30 Kasım'da kalkıyor (ARC-295)

Hüküm: dosya düzeyinde kullanım YOK; 30 Kasım kesintisi depoyu ve ayarları etkilemez.

| Kapsam | Sonuç |
|---|---|
| Kullanıcı ve proje ayarları (`settings.json`, `settings.local.json`, worktree kopyası) | `model` yalnız `sonnet`; `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`; `fastMode`/`fast`/`opus-4-8` eşleşmesi 0 |
| Ajan tanımları (74 dosya) | haiku-5-5: 17, sonnet takma adı: 42, sonnet-5-5: 12, opus-5-5: 1 (`ops-pencere`), `opus` takma adı: 2 (`denetim-opus`, `security-reviewer`); 4.8 ve fast 0 |
| Skill'ler (`.claude`, `.agent`) | `model:` alanı 0; 5 skill `agent: denetim-opus` kullanır (takma ad sabit) |
| Betik, kanca, workflow, `tools/` | 4.8 ve fast 0; model bayrağı geçen betikler haiku 4.5 ve haiku; `skill-listesi-say.cjs` modeli argümandan alır |
| Zamanlanmış görevler (6) ve SKILL.md dosyaları | model, opus, fast, `claude -p` eşleşmesi 0; koşum kaydında model bilgisi yok (`list_task_runs` yalnız oturum ve durum verir) |
| Dokümanlar | `docs/` içinde `opus-4-8` 0 |
| Son 5 oturum kaydı | `"model":"claude-opus-4-8"` 0; `claude-opus-5-5` baskın |

ÖLÇÜLEMEYEN: Recep'in Desktop ve CLI oturumlarındaki `/fast` kipi (arayüz ayarı); `opus` takma adının çözülen sürümü; zamanlanmış görevlerin koşum modeli; 5 dosya dışındaki oturum kayıtları.
Öneri: Recep `/fast` durumunu bir kez baksın, açıksa 30 Kasım'dan önce kapatsın. `opus` takma adı kalsın mı yoksa sürüm kimliğiyle sabitlensin mi kararı OPS ve Recep'te.

## 7. Ölçülemeyenler (tüm kart)

Kurulu sürüm 2.1.296 (TKP'den alındı); Desktop gömülü sürümü; kanca varsayılan timeout değeri; çalışma anı davranışları (UserPromptSubmit engeli, `updatedInput`, exit 2: statik okuma ve sürüm notuna dayanır); kullanıcı ayarında çift alt çizgili sunucu adı taraması; kanca `shell` alanı; TKP §2 maddeleri 1, 2, 5, 7, 10 ve Read "dosya değişmedi" maddesi sürüm notunda doğrulanmadı; `bash-write-audit` iki ağaçta `git status` zaman aşımı bildirdi, o ağaçların denetimi kör.
