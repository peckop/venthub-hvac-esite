# Kanca yükü ölçümü: ÖNCE (ARC-320 / OPS-292 Adım 1)

Ölçüm tarihi: 2026-11-15 (pencere 2026-11-08 00:00 +03 ile 2026-11-15 ~20:30 arası, tam 7 gün değil). Bu tablo "ÖNCE" kaydıdır:
onaylı değişiklikler birleştikten 7 gün sonra aynı yöntemle "SONRA" ölçümü yapılır (ARC-320 alt adımı); gerçek hata yakalama düşerse ilgili değişiklik geri alınır.
Ölçüm salt okuma ile yapıldı (alt ajan, Sonnet); kanca betikleri, ayarlar ve izin kayıtları değiştirilmedi.

**Kaynaklar:** ~/.claude/projects/** oturum dökümleri (D; 493 jsonl, 193669 kayıt, 28408'i kanca olayı), stop_hook_summary kayıtları (D-stop),
C:/tmp/venthub-board/{olay-kaydi.jsonl, talimat-yuklendi.log, done-kapisi.log, hafiza-kancalari.log, sage-daemon-baslat.log, .eylem-defteri.*.jsonl},
~/.claude/{izin-kayit/*.jsonl, mod-durum/ayar-degisti.jsonl, mod-durum/kartsiz-atlatma.log, mod-durum/soz-bekcisi-ihlal.log}, hafıza deposu .hafiza-commit-uyari.log.

**Sütunlar:** "7g tetik" ">=N" alt sınırdır: dökümler yalnız çıktı üreten ya da hata veren koşumu kaydeder, sessizce izin veren PreToolUse kapıları görünmez. "olay üst sınırı" matcher'a uyan araç çağrısı sayısıdır (tavan, ölçülmüş tetik değil). "Yineleme" aynı oturumda aynı metnin tekrarıdır ("tam" birebir, "rakamsız" sayılar maskelenmiş). "DOKUNULMAZ": izin, deny, onay ve MCP kancaları (OPS-292 sınırı).

**Sınırlar:** SessionEnd kancalarında döküm kaydı yok; 16 kanca ölçülemedi (aşağıdaki liste); kanca-kimlik eşlemesi settings.json sırasına dayanır; iki Stop ret satırı betiğe atanamadı; blok metinleri 700 karakterde kesik.



## Özet bulgular (ölçümden)

- Kayıtlı kanca: 77 (proje 76, kullanıcı 1; beklenen ~75, fark +2). Eklenti kancaları (ponytail, security-guidance) bu sayıya dahil değil.
- Durdurma/deny toplamı 7 günde 425: bash-write-guard 136, kartsiz-beklenti-kapisi 107, push-kapisi 85, kanban-kanit-yolu-kapisi 30, done-kanit-kapisi 24, son-soz-gate 22, izin-istegi-kapisi 10, protect-config 8, kart-onek-tekrari 6, lane-guard 5, agir-komut-kilidi 2, pencere-acilis-denetimi 2; ayrıca zaman aşımı-engeli 17.
- En çok tetiklenen: bash-write-audit 9578, soz-bekcisi-hatirlatma 3253, hafiza-yedek (UserPromptSubmit) 3162, Stop grubu 8 kanca x 2940, olay-kaydi SubagentStop 1770.
- En çok yineleyen (bağlama giren aynı metin): bash-write-audit 9093 (%94'ü aynı "SID TEKIL DEGIL" satırı), soz-bekcisi-hatirlatma 3221, duzeltme-isaretle 627, hafiza-yedek 516 tam / 3130 rakamsız, gorev-tazelik-satiri 505, graphify-search 408.
- Ölçülemeyen 16 kanca: hafiza-indeks-bekcisi, silme-baglanti-kapisi, sql-yazma-kapisi (matcher "supabase" adı arıyor; dökümdeki araç mcp__<uuid>__execute_sql olarak çağrılıyor, 80 çağrının 0'ı uydu), graphify-read, pencere-kilidi-kapisi, kod-dizini-tazelik, board-release, accumulate-edits, duzenleme-ani-lint, agir-komut-kilidi --birak (iki kayıt), kanban-tutarlilik-onarimi, precompact-durum-kapisi, son-konusma-dokumu (PreCompact), TaskCompleted. Ortak çözüm önerisi: her kancanın sonunda tek biçimli sayaç satırı (zaman, sid, kanca, karar). Bu bir kanca değişikliğidir; ARAÇ PR'ı ve denetçi okuması gerekir, settings.json kısmı OPS kapısıdır.
- hafiza-commit.sh (SessionEnd, kullanıcı ayarı): 537 sır-kalıbı reddi / 5 commit; hafiza-yedek PreCompact: 117 red / 4 commit. Kök sebep ARC-319'da (tek dosyadaki yanlış pozitif tüm yedeği durduruyordu); eski betik hâlâ kilitsiz çalışıyor.

## Tablo (77 satır)

| kanca | olay/matcher | 7g tetik | durdurma/düzeltme | yineleme (aynı oturum) | ölçüm kaynağı | not |
|---|---|---|---|---|---|---|
| 1 izin-istegi-kapisi | PermissionRequest / Bash | >=15 (izin-kayit: karar kaydı) | deny 10 (izin-kayit), muaf 5 | hesaplanmadı | ~/.claude/izin-kayit/*.jsonl; hook_permission_decision | DOKUNULMAZ |
| 2 protect-config | PreToolUse / Edit|Write|MultiEdit | >=8 ; olay üst sınırı 2811 | deny/blok 8 | 0 | D | DOKUNULMAZ |
| 3 lane-guard | PreToolUse / Edit|Write|MultiEdit | >=5 ; olay üst sınırı 2811 | deny/blok 5 | 1 tam / 1 rakamsız | D | DOKUNULMAZ |
| 4 sensitive-path-guard | PreToolUse / Edit|Write|MultiEdit | >=5 ; olay üst sınırı 2811 | zaman aşımı-engeli 1 | 1 tam / 1 rakamsız | D | DOKUNULMAZ |
| 5 hafiza-indeks-bekcisi | PreToolUse / Edit|Write|MultiEdit | ölçülemedi (olay üst sınırı 2811) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 6 bash-write-guard | PreToolUse / Bash | >=136 ; olay üst sınırı 12370 | deny/blok 136 | 31 tam / 31 rakamsız | D | DOKUNULMAZ |
| 7 silme-baglanti-kapisi | PreToolUse / Bash | ölçülemedi (olay üst sınırı 12370) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 8 gh-api-kapisi | PreToolUse / Bash | >=2 ; olay üst sınırı 12370 | 0 (kayıtlı blok yok) | 1 tam / 1 rakamsız | D | DOKUNULMAZ (gh api kapısı) |
| 9 env-yazma-kapisi | PreToolUse / Bash | >=6 ; olay üst sınırı 12370 | zaman aşımı-engeli 6 | çıktısız | D |  |
| 10 agir-komut-kilidi | PreToolUse / Bash | >=9 ; olay üst sınırı 12370 | deny/blok 2 | 0 | D | DOKUNULMAZ |
| 11 push-kapisi | PreToolUse / Bash | >=85 ; olay üst sınırı 12370 | deny/blok 85 | 32 tam / 32 rakamsız | D | DOKUNULMAZ; zaman aşımı(hook_cancelled) 21 |
| 12 canli-yazim-kapisi | PreToolUse / Bash|PowerShell | >=10 ; olay üst sınırı 12370 | zaman aşımı-engeli 10 | çıktısız | D | DOKUNULMAZ |
| 13 sql-yazma-kapisi | PreToolUse / mcp__.*[Ss]upabase.*__(execute_sql|app… | 0 (matcher hiçbir araç adına uymadı) | yok | çıktısız | — | MCP-matcher; DOKUNULMAZ (prod SQL kapısı). Matcher adında "supabase" arıyor; dökümde yalnız mcp__0abcd180-…__execute_sql 80 çağrı var, 0 ad eşleşti |
| 14 graphify-search | PreToolUse / Bash|Grep | >=223 ; olay üst sınırı 12966 | uyarı 223 | 408 tam / 408 rakamsız | D | zaman aşımı(hook_cancelled) 55 |
| 15 graphify-read | PreToolUse / Read|Glob | 0 çıktılı; olay üst sınırı 1133 | yok/ölçülemedi | çıktısız | D | zaman aşımı(hook_cancelled) 1 |
| 16 sage-dosya-dersi | PreToolUse / Read|Edit|Write|MultiEdit | >=207 ; olay üst sınırı 3913 | 0 (bilgi/yan etki) | 122 tam / 122 rakamsız | D | zaman aşımı(hook_cancelled) 1 |
| 17 pencere-kilidi-kapisi | PreToolUse / SendMessage | ölçülemedi (olay üst sınırı 1448) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 18 kartsiz-emir-uyarisi | PreToolUse / SendMessage | >=41 ; olay üst sınırı 1448 | uyarı 41 | 78 tam / 78 rakamsız | D |  |
| 19 olcum-satiri-uyarisi | PreToolUse / Agent|SendMessage | >=147 ; olay üst sınırı 1782 | uyarı 147 | 117 tam / 132 rakamsız | D | zaman aşımı(hook_cancelled) 3 |
| 20 pencere-acilis-denetimi | PreToolUse / mcp__ccd_session__start_session | >=2 ; olay üst sınırı 5 | deny/blok 2 | 0 | D | DOKUNULMAZ MCP-matcher |
| 21 kart-alani-kapisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=274 ; olay üst sınırı 2330 | uyarı 100 (UYARI satırı) | 226 tam / 226 rakamsız | D | MCP-matcher |
| 22 kart-onek-tekrari | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=6 ; olay üst sınırı 2330 | deny/blok 6 | 0 | D | DOKUNULMAZ MCP-matcher |
| 23 kart-plan-baglantisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=60 ; olay üst sınırı 2330 | uyarı 60 | 2 tam / 8 rakamsız | D | DOKUNULMAZ MCP-matcher |
| 24 onceki-calisma-kapisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=413 ; olay üst sınırı 2330 | 0 (bilgi/yan etki) | 19 tam / 22 rakamsız | D | MCP-matcher |
| 25 once-elindeki-is-uyarisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=32 ; olay üst sınırı 2330 | uyarı 32 | 6 tam / 42 rakamsız | D | MCP-matcher |
| 26 kanban-kanit-yolu-kapisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | >=30 ; olay üst sınırı 2330 | deny/blok 30 | 2 tam / 4 rakamsız | D | DOKUNULMAZ MCP-matcher |
| 27 done-kanit-kapisi | PreToolUse / mcp__wrongstack-kanban__kanban_manage | 310 karar (kesin, günlük) | deny/blok 24; günlük RED 24 | 12 tam / 12 rakamsız | C:/tmp/venthub-board/done-kapisi.log + döküm | DOKUNULMAZ MCP-matcher |
| 28 session-board | SessionStart / * | >=324  | 0 (bilgi/yan etki) | 219 tam / 235 rakamsız | D |  |
| 29 sage-daemon-ac | SessionStart / * | 15 (döküm) / 30 başlatma (günlük) | 0 (bilgi/yan etki) | 0 tam / 5 rakamsız | döküm + sage-daemon-baslat.log |  |
| 30 hafiza-yedek | SessionStart / * | >=498  | 0 (bilgi/yan etki) | 4 tam / 365 rakamsız | D | zaman aşımı(hook_cancelled) 1 |
| 31 kod-dizini-tazelik | SessionStart / * | ölçülemedi | yok/ölçülemedi | çıktısız | — |  |
| 32 sabit-dersler | SessionStart / * | >=350  | 0 (bilgi/yan etki) | 270 tam / 270 rakamsız | D | zaman aşımı(hook_cancelled) 1 |
| 33 donum-tara-acilis | SessionStart / * | >=24  | 0 (bilgi/yan etki) | 16 tam / 16 rakamsız | D |  |
| 34 dizin-acilis | SessionStart / * | >=18  | 0 (bilgi/yan etki) | 2 tam / 11 rakamsız | D |  |
| 35 board-release | SessionEnd / * | ölçülemedi | yok/ölçülemedi | çıktısız | — |  |
| 36 sage-yedek-oturum-sonu | SessionEnd / * | >=227 satır (günlük) | 0 (bilgi/yan etki) | çıktısız | AppData/Local/venthub-sage-yedek/son-kosum.log |  |
| 37 sage-hijyen-oturum-sonu | SessionEnd / * | 16 (günlük) | 0 (bilgi/yan etki) | çıktısız | hafiza-kancalari.log SAGE-HIJYEN |  |
| 38 board-brief | UserPromptSubmit / * | >=335  | 0 (bilgi/yan etki) | 14 tam / 57 rakamsız | D | zaman aşımı(hook_cancelled) 2 |
| 39 gorev-tazelik-satiri | UserPromptSubmit / * | >=536  | uyarı 536 | 505 tam / 517 rakamsız | D | zaman aşımı(hook_cancelled) 1 |
| 40 pencere-kilidi-recep | UserPromptSubmit / * | >=3  | 0 (bilgi/yan etki) | 0 | D | zaman aşımı(hook_cancelled) 1 |
| 41 hafiza-sorusu-yonlendirme | UserPromptSubmit / * | >=116  | 0 (bilgi/yan etki) | 83 tam / 83 rakamsız | D | zaman aşımı(hook_cancelled) 1 |
| 42 soz-bekcisi-hatirlatma | UserPromptSubmit / * | >=3253  | 0 (bilgi/yan etki) | 3221 tam / 3221 rakamsız | D | zaman aşımı(hook_cancelled) 5 |
| 43 defter-tazelik-satiri | UserPromptSubmit / * | >=1107  | 0 (bilgi/yan etki) | 36 tam / 449 rakamsız | D | zaman aşımı(hook_cancelled) 10 |
| 44 sage-yazim-sayaci | UserPromptSubmit / * | >=235  | 0 (bilgi/yan etki) | 21 tam / 54 rakamsız | D | zaman aşımı(hook_cancelled) 4 |
| 45 duzeltme-isaretle | UserPromptSubmit / * | >=631  | uyarı 631 | 627 tam / 627 rakamsız | D | zaman aşımı(hook_cancelled) 4 |
| 46 hafiza-enjeksiyonu | UserPromptSubmit / * | 1654 (günlük) / döküm 1621 | 0 (bilgi/yan etki) | 104 tam (döküm); 54 günlük | hafiza-kancalari.log KONU + döküm | zaman aşımı(hook_cancelled) 9 |
| 47 hafiza-yedek | UserPromptSubmit / * | >=3162  | 0 (bilgi/yan etki) | 516 tam / 3130 rakamsız | D | zaman aşımı(hook_cancelled) 2 |
| 48 accumulate-edits | PostToolUse / Edit|Write|MultiEdit | ölçülemedi (olay üst sınırı 2811) | yok/ölçülemedi | çıktısız | — |  |
| 49 duzenleme-ani-lint | PostToolUse / Edit|Write|MultiEdit | ölçülemedi (olay üst sınırı 2811) | yok/ölçülemedi | çıktısız | — |  |
| 50 bash-write-audit | PostToolUse / Bash | >=9578 ; olay üst sınırı 12370 | uyarı 9578 (hepsi stderr; 9040 "SID TEKIL DEGIL") | 9093 tam / 9257 rakamsız | D |  |
| 51 merge-sonrasi-ileri-sar | PostToolUse / Bash | >=55 ; olay üst sınırı 12370 | 0 (bilgi/yan etki) | 48 tam / 50 rakamsız | D |  |
| 52 pr-birlesti-kart | PostToolUse / Bash | >=55 ; olay üst sınırı 12370 | uyarı 55 | 0 tam / 30 rakamsız | D |  |
| 53 ci-uyandirici | PostToolUse / Bash | >=167 ; olay üst sınırı 12370 | uyandırma 167 (blok değil) | çıktısız | D |  |
| 54 eylem-defteri | PostToolUse / Edit|Write|MultiEdit|NotebookEdit|Bash | 80 kayıt (yalnız taşıma/silme fiili) | 0 (bilgi/yan etki) | çıktısız | C:/tmp/venthub-board/.eylem-defteri.*.jsonl |  |
| 55 agir-komut-kilidi --birak | PostToolUse / Bash | ölçülemedi (olay üst sınırı 12370) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 56 patinaj-bekcisi | PostToolUse / * | >=72 ; olay üst sınırı 30196 | uyarı 72 | 100 tam / 104 rakamsız | D |  |
| 57 kanban-tutarlilik-onarimi | PostToolUse / mcp__wrongstack-kanban__kanban_manage | ölçülemedi (olay üst sınırı 2330) | yok/ölçülemedi | çıktısız | — | MCP-matcher |
| 58 pencere-acilis-denetimi | PostToolUse / mcp__ccd_session__start_session | >=2 ; olay üst sınırı 5 | 0 (bilgi/yan etki) | 0 | D | DOKUNULMAZ MCP-matcher |
| 59 agir-komut-kilidi --birak | PostToolUseFailure / Bash | ölçülemedi (olay üst sınırı 12370) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 60 son-soz-gate | Stop / * | 2940 (kesin) | deny/blok 22 | 18 tam / 18 rakamsız | D-stop | DOKUNULMAZ |
| 61 kartsiz-beklenti-kapisi | Stop / * | 2940 (kesin) | deny/blok 107; atlatma günlüğü 12 | 8 tam / 36 rakamsız | D-stop | DOKUNULMAZ |
| 62 soz-bekcisi | Stop / * | 2940 (kesin) | ihlal günlüğü 9 | çıktısız | D-stop | zaman aşımı(hook_cancelled) 4 |
| 63 duzeltme-dersi-kapisi | Stop / * | 2940 (kesin) | 0 (bilgi/yan etki) | çıktısız | D-stop | zaman aşımı(hook_cancelled) 3 |
| 64 verify-on-stop | Stop / * | 2940 (kesin) | 0 (bilgi/yan etki) | çıktısız | D-stop |  |
| 65 son-konusma-dokumu | Stop / * | 2940 (kesin) | 0 (bilgi/yan etki) | çıktısız | D-stop |  |
| 66 hafiza-kullanim-sayaci | Stop / * | 2940 (Stop olayı) / 1377 SAYAC günlük | 0 (bilgi/yan etki) | 1364 (günlük satır; bağlama girmez) | D-stop + hafiza-kancalari.log SAYAC |  |
| 67 kaynaksiz-hukum-uyarisi | Stop / * | 2940 (kesin) | uyarı 26 | 0 | D-stop | zaman aşımı(hook_cancelled) 3 |
| 68 precompact-durum-kapisi | PreCompact / * | ölçülemedi (olay: 114 compact_boundary) | yok/ölçülemedi | çıktısız | — | DOKUNULMAZ |
| 69 son-konusma-dokumu | PreCompact / * | ölçülemedi (olay: 114 compact_boundary) | yok/ölçülemedi | çıktısız | — |  |
| 70 hafiza-yedek | PreCompact / * | >=121 (günlük: 117 sır-redli deneme + 4 commit) | sır-kalıbı reddi 117 | çıktısız | .hafiza-commit-uyari.log (precompact) + memory git |  |
| 71 ayar-degisti-bekci | ConfigChange | 200 (kesin, günlük) | 0 (bilgi/yan etki) | 73 (günlük satır) | ~/.claude/mod-durum/ayar-degisti.jsonl | DOKUNULMAZ |
| 72 talimat-yuklendi-gunlugu | InstructionsLoaded | 1222 (kesin, günlük) | 0 (bilgi/yan etki) | 991 (günlük satır) | C:/tmp/venthub-board/talimat-yuklendi.log |  |
| 73 olay-kaydi | PermissionDenied | 43 (kesin, günlük) | 0 (bilgi/yan etki) | 15 (günlük satır) | C:/tmp/venthub-board/olay-kaydi.jsonl(+.1) | DOKUNULMAZ |
| 74 olay-kaydi | StopFailure | 6 (kesin, günlük) | 0 (bilgi/yan etki) | 2 (günlük satır) | C:/tmp/venthub-board/olay-kaydi.jsonl(+.1) |  |
| 75 olay-kaydi | SubagentStop | 1770 (kesin, günlük) | 0 (bilgi/yan etki) | 916 (günlük satır) | C:/tmp/venthub-board/olay-kaydi.jsonl(+.1) |  |
| 76 olay-kaydi | TaskCompleted | 0 (kesin, günlük) | 0 kayıt (hiç tetiklenmedi mi, yazılmadı mı: ayırt edilemedi) | 0 (günlük satır) | C:/tmp/venthub-board/olay-kaydi.jsonl(+.1) |  |
| 77 hafiza-commit.sh [kullanıcı] | SessionEnd | >=542 (537 sır-redli deneme günlüğü + 5 commit; başarılı/boş koşum kaydı yok) | sır-kalıbı reddi 537 (günlük) | çıktısız | memory git: 5 "oturum kapanisi" commit; .hafiza-commit-uyari.log |  |


## Adım 2: öneri listesi (OPS onayına; onaysız hiçbir kanca değişmez)

Sınıflar: **KALIR** (son 7 günde gerçek durdurma yapmış ya da veri/sır/para/canlı koruyan kapı), **SEYRELT** (bilgi notu olup aynı metni her mesajda yineleyen; saatte bir ya da durum değişince yazsın), **DÜZELT** (yanlış alarm veren ya da işi uzatan). İzin, deny, onay veren kanca ve MCP kayıtları dokunulmaz (tablodaki "DOKUNULMAZ" işareti). Kapı kaldırılması önerilmiyor; yalnız gürültü ve tekrar.

Yinelenen bağlam satırı yükü (tabloda "yineleme"): SEYRELT adaylarında 7 günde yaklaşık 15 bin aynı satır (bash-write-audit 9093, soz-bekcisi-hatirlatma 3221, duzeltme-isaretle 627, hafiza-yedek 516, gorev-tazelik-satiri 505, graphify-search 408, kart-alani-kapisi 226, sage-dosya-dersi 122, olcum-satiri-uyarisi 117, patinaj-bekcisi 100, defter-tazelik-satiri 36 tam).

### SEYRELT

| Kanca | 7g yineleme (aynı oturum) | Öneri | Kazanç | Bedel / risk |
|---|---|---|---|---|
| soz-bekcisi-hatirlatma (UserPromptSubmit) | 3221 / 3253 | Oturum başına bir kez ve her compact sonrası bir kez; mesajlarda yinelenmez | Her mesajdan sabit satır kalkar (~3200 satır/hafta) | Kural unutulabilir: SessionStart ve Stop kapısı (son-soz-gate, kartsiz-beklenti) korumaya devam eder, onlar dokunulmaz |
| duzeltme-isaretle (UserPromptSubmit) | 627 / 631 | Aynı DERS-BORCU metni yalnız borç sayısı ya da içerik değişince | ~600 satır/hafta | Borç hatırlatması geç kalmaz; durum değişince yine yazar |
| gorev-tazelik-satiri (UserPromptSubmit) | 505 / 536 | Saatte bir ya da görev değişince | ~500 satır/hafta | Görev bayatlığı en çok 1 saat geç görünür |
| defter-tazelik-satiri (UserPromptSubmit) | 36 tam, 449 rakamsız / 1107 | Yalnız değişen defter satırı; sabit kısım bir kez | ~450 satır/hafta, 10 sn zaman aşımı yükü | Defter bayatlığı gecikmez (değişince yazılır) |
| hafiza-yedek (UserPromptSubmit) | 516 tam, 3130 rakamsız / 3162 | ARC-319 sonrası yalnız bekleyen+eski ya da ⛔ başarısız iken konuşur (mevcut); "başlatıldı" cümlesi bir kez, dk değişimi tek başına yazmaz | ~500 satır/hafta; sahte güven kalkar | Yok (başarısızlık hâlâ her mesajda görünür) |
| graphify-search (PreToolUse Bash/Grep) | 408 / 223 | MANDATORY satırı oturumda bir kez; 10 sn zaman aşımı 55 kez düştü, 10 sn yerine 20 sn | ~400 satır/hafta, zaman aşımı gürültüsü | Grep'ten önce graphify hatırlatması ilk grep'te kalır |
| sage-dosya-dersi (PreToolUse Read/Edit/Write) | 122 / 207 | Aynı dosya için oturumda bir kez | ~120 satır/hafta | Aynı dosyada ikinci kez ders görünmez (ilk görüldü) |
| patinaj-bekcisi (PostToolUse) | 100 / 72 | Aynı patinaj uyarısı oturumda bir kez | ~100 satır/hafta | Patinaj ısrarı görünmez; ilk uyarı kalır |
| kart-alani-kapisi (PreToolUse kanban_manage) | 226 / 274 (uyarı 100) | "Departman çözülemedi" uyarısı aynı oturumda bir kez; KART ALANI satırı bir kez | ~220 satır/hafta | Kart açarken alan hatırlatması bir kez görünür |

### DÜZELT

| Kanca | Sorun (ölçülmüş) | Öneri | Kazanç | Bedel / risk |
|---|---|---|---|---|
| bash-write-audit (PostToolUse Bash) | 9578 uyarı, 9040'ı (%94) aynı "SID TEKIL DEGIL" stderr satırı; 9093 yineleme | Kök sebep: oturum kimliği tekil çözülemiyor (ortam). Satırı oturumda bir kez yaz; asıl denetim (yazma izi) sürsün | En büyük tekil gürültü kaynağı (~9000 satır/hafta) | Denetim izi değişmez; yalnız stderr tekrarı |
| olcum-satiri-uyarisi (PreToolUse Agent/SendMessage) | 147 uyarı, 117 yineleme (%80); OPS: iş emrinde yanlış tetikleniyor | Yalnız ölçüm kartı emirlerinde ("defter: ölçüldü/ölçülmedi" gerektiren) tetikle; iş emrinde sus | ~120 yanlış alarm/hafta | Ölçüm emri tanıması metin eşleşmesidir; sabotajlı test gerekir |
| kartsiz-beklenti-kapisi (Stop) | 107 deny, atlatma günlüğü 12; OPS yetkisindeki işi üç kez geri çevirdi (OPS) | ARC-247 EK madde (c): sekizinci yetki sınıfı ("izin verilmiş OPS yetkisi") ekle; kart numarası yoksa yeniden sor yerine OPS'a yönlendir | Yanlış geri çevirme biter | Kapıyı gevşetmez; yetki sınıfı listesi genişler, test gerekir; DOKUNULMAZ mı: Stop deny kapısı, OPS onayıyla |
| kartsiz-emir-uyarisi (PreToolUse SendMessage) | 41 uyarı, 78 yineleme | Aynı mesajda aynı uyarı bir kez | ~80 satır/hafta | Yok |
| add_task (WrongStack çıktısı) | Yanıt kart numarasını döndürmüyor; numarayı bulmak 5-6 çağrı (OPS; bu oturumda ARC-319/320 için de ölçüldü: pano en büyük ARC numarasını tarayarak bulundu) | PostToolUse kanban_manage kancası: add_task sonrası kartın pano sayaç numarasını additionalContext'e yazar (kanban-anlik --id ile, salt okuma, fail-open) | 5-6 çağrı yerine 0; numara hataları biter | Yeni kanca (yük artar); sayaç yoksa sessiz |
| 16 ölçülemeyen kanca | Tetik ve karar sayılamıyor | Ortak sayaç satırı (JSONL: zaman, sid, kanca, karar allow/deny/uyarı); izin/deny kancalarında yalnız ekleme, davranış değişmez | "SONRA" ölçümü kesinleşir | Kanca betiklerine dokunulur; settings.json kısmı OPS kapısı |
| sql-yazma-kapisi (PreToolUse, DOKUNULMAZ) | Matcher "supabase" adı arıyor; dökümdeki araç mcp__<uuid>__execute_sql çağrılıyor (80 çağrının 0'ı eşleşti) | OPS kararı: matcher'ı gerçek araç adına uydur (kapı gevşemez, daralır değil, KAPSAMI GENİŞLER) | Prod SQL kapısı fiilen çalışır | Kapı şu an hiç tetiklenmiyor; açılınca ilk günler yanlış engel verebilir |

### KALIR (kanıtlı)

- bash-write-guard (136 deny), push-kapisi (85 deny; 21 zaman aşımı), kanban-kanit-yolu-kapisi (30), done-kanit-kapisi (24, iki kaynakta çapraz doğrulandı), son-soz-gate (22), kartsiz-beklenti-kapisi (107, yukarıdaki DÜZELT hariç), kart-onek-tekrari (6), lane-guard (5), protect-config (8), izin-istegi-kapisi (10), agir-komut-kilidi (2), pencere-acilis-denetimi (2), canli-yazim-kapisi ve env-yazma-kapisi (zaman aşımı-engeli 10 ve 6): gerçek durdurma ya da canlı/sır/para koruması.
- Bilgi taşıyan, yinelemesi düşük: onceki-calisma-kapisi (413 tetik, 19 yineleme), once-elindeki-is-uyarisi (6/42), pr-birlesti-kart (55 uyarı, 0 yineleme), hafiza-enjeksiyonu (1654 tetik, %6 tam yineleme), session-board, sabit-dersler (SessionStart başına bir), sage-yazim-sayaci.
- Günlük/yan etki (bağlama girmez): talimat-yuklendi-gunlugu, olay-kaydi (4 olay), hafiza-kullanim-sayaci, sage-yedek ve hijyen (SessionEnd), eylem-defteri, ci-uyandirici, merge-sonrasi-ileri-sar.
- Ölçülemedi, sayaç gelene kadar dokunulmaz: hafiza-indeks-bekcisi, silme-baglanti-kapisi, pencere-kilidi-kapisi, kod-dizini-tazelik, board-release, accumulate-edits, duzenleme-ani-lint, kanban-tutarlilik-onarimi, precompact-durum-kapisi, graphify-read (0 çıktı, 1133 olay üst sınırı: "araç atıl kalmaz" kuralı gereği sayaç sonrası kalır/kaldırılır kararı).

### Uygulama sırası önerisi (onay gelirse)

1. Ortak sayaç satırı (ölçümü kesinleştirir; hiçbir davranış değiştirmez).
2. bash-write-audit stderr tekrarı ve add_task numara kancası (en büyük tekil kazanç ve en çok söylenen sıkıntı).
3. SEYRELT grubu tek PR (ortak "aynı oturumda bir kez" yardımcısı).
4. olcum-satiri-uyarisi ve kartsiz-beklenti yetki sınıfı (ARC-247 ile).
5. Onaydan 7 gün sonra aynı ölçüm "SONRA" olarak koşulur; gerçek durdurma sayısı düşmüşse ilgili değişiklik geri alınır.

## Adım 3: vadesi geçmiş ARAÇ kartları (liste OPS'a; ARAÇ kart taşımaz)

Tarih: 15 Kasım; 21 kart, hepsinin vadesi 14 Kasım. "Hizmet": yeni siteye doğrudan ya da filo altyapısı üzerinden. Öneri: sürsün / rafa / kapat. Kanıt ölçülmediyse "ölçülmedi" yazıldı.

| Kart | Konu | Hizmet / kanıt | Öneri |
|---|---|---|---|
| ARC-3 | Kart açma betiği + departman sayaç | Filo; add_task numara dönmüyor sorunuyla aynı kök (DÜZELT satırı) | sürsün (add_task numara kancasıyla birleştir) |
| ARC-4 | Açılışta açık kart gösterimi | Bu açılış bağlamı VADESİ GELEN ve SIRADA satırlarını zaten basıyor | kapat (kanıt: bugünkü açılış bağlamı) |
| REC-536 | Hafıza yazma bekçisi kancası | Filo; rafta etiketli, HRT-53 kararları bağlı | rafa (sürsün rafta) |
| REC-465 | Posta kutusunda 8 haneli alıcı sessizce düşüyor | Filo; açılış satırı hâlâ "kısa 8 hane SESSİZCE düşer" uyarısı basıyor, çözüm bizim sarmalayıcıda (K-256) | sürsün (küçük) |
| REC-464 | Boşta kalan kanban/sage süreç temizliği | Filo; davranış WrongStack'in (paylaşımlı süreç) | rafa |
| REC-462 | update_task assignee yok sayılıyor | Bu oturumda ölçüldü: update_task ile assignee yazılan ARC-319 yanıtında assignee alanı yok (add_task'ta yazan ARC-321'de var); kusur 1.7.0'da sürüyor | sürsün (kanıt güncel; kök WrongStack dist kodunda) |
| ARC-19 | arac-uygulayici ajan tanımı eksik | Filo; ajan listesinde arac/harita/katalog-uygulayici yok, üreteç betiği ucuz | rafa (ihtiyaç doğunca üret) |
| ARC-28 | İstem satırına canlı kapı ve SEO haftalık satırı (karar 260) | Bağlam yükünü artırır (OPS-292 hedefiyle ters); karar 260 Recep'in | rafa (OPS karar versin) |
| ARC-57 | hafta 0.6.0 tek teslim (paket H) | Mod; kokpit 0.9.x içinde sekme ve satır içi açılma geldi, hafta ayrı panelde; kalan kapsam ölçülmedi | rafa (kalan kapsam önce ölçülsün) |
| ARC-89 | Konu hafızası kabul testi (10 soruda 8/10) | hafiza-enjeksiyonu haftada 1654 kez tetikleniyor, doğruluğu hiç ölçülmedi | sürsün (düşük öncelik) |
| ARC-113 | Şeritsiz pencere claim yenilemiyor | Bu açılışta 4-6 pencere "ŞERİTSİZ AÇIK PENCERE" uyarısı basıyor: gürültü kaynağı | sürsün (SEYRELT ile birlikte; yüksek) |
| ARC-115 | Güvenlik high 3 günü geçerse otomatik kart | Güvenlik; ölçülmedi (bağımlılık satırı mevcut) | sürsün |
| ARC-117 | browser-use eklentisini kapat (karar 338) | Ayar değişikliği OPS kapısında; mevcut durum ölçülmedi | sürsün (OPS ayar) |
| ARC-123 | Kanban doğrulayıcı komut kapısı | Kök sebep kodda okundu, sarmalayıcı bekliyor; YTN-49/52 buna bağlı | sürsün (sırada, yüksek) |
| ARC-158 | Envanter dosyası ve test haritası ortak dosya düzeni | PR çakışmaları sürüyor (ölçülmedi bu hafta) | sürsün (düşük) |
| ARC-166 | Stop kancası: "senden bir şey istemiyor" ile açık beklenti | Recep şikâyeti (16 Ekim); kartsiz-beklenti DÜZELT grubuyla aynı kapı | sürsün (DÜZELT ile birleştir) |
| ARC-174 | Kart 5N1K kapısı | HRT-66 cetveli (is-kayit-duzeni-standard §2) yazılmış mı ölçülmedi; kart-alani-kapisi benzeri uyarı-only | sürsün (cetvel gelince; önce ölçülsün) |
| ARC-197 | Pano sayan çağrılara limit | Pano cevabı ~1,7 MB ("omitted") görülüyor; limit parametresi yazma yanıtında yok | sürsün |
| ARC-247 | Departman Recep'e karar sorusu yazmaz | kartsiz-beklenti DÜZELT satırıyla aynı iş; HRT-100 birleşti mi ölçülmedi | sürsün (öncelikli, DÜZELT ile) |
| ARC-253 | Depo dışı ölçüm arşivi yedeği (~19 MB) | Veri kaybı riski; hafiza-yedek yalnız md yedekler | sürsün (küçük) |
| ARC-260 | WrongStack görsel iş akışı ölçümü | Recep isteği (Kanban görseli); acil değil | rafa |

Sayım: sürsün 14, rafa 6 (REC-536, REC-464, ARC-19, ARC-28, ARC-57, ARC-260), kapat 1 (ARC-4). Toplam 21.
