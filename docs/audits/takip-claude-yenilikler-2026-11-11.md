# TAKİP · Claude yenilikleri taraması · 14 Ekim → 11 Kasım 2026

> Kart: TKP-1 (VentHub TAKİP panosu). Emir: OPS (Recep isteği, 11 Kasım). Salt okuma; hiçbir güncelleme, ayar ya da kod değişikliği yapılmadı.
> Önceki tarama: ARAÇ ARC-135, `docs/audits/arac-envanteri-2026-09-07.md` §7 (2.1.296'ya kadar, 14 Ekim). Bu rapor oradan devam eder.

## 0 · Kaynak, tazelik, sınır

| Konu | Değer |
|---|---|
| Claude Code sürüm notu | `anthropics/claude-code` `CHANGELOG.md` (ana dal), 11 Kasım 2026 ölçüldü; 2.1.299 → 2.1.322 arası 22 sürüm başlığı |
| Yayın tarihleri | `npm view @anthropic-ai/claude-code time` (UTC). 2.1.296 = 9 Ekim, 2.1.299 = 14 Ekim, 2.1.311 = 26 Ekim, 2.1.319 = 6 Kasım, 2.1.321 = 9 Kasım, 2.1.322 = 10 Kasım |
| Etiketler (npm) | `stable` = 2.1.311, `latest` = `next` = 2.1.322 |
| Kurulu sürüm | 2.1.296 (`claude --version`); 26 sürüm geride. Desktop'ın gömülü kopyası ayrı ve **ölçülmedi** |
| Claude uygulaması | `claude.com/resources/articles/sheets-whiteboards-data` (10 Kasım), `support.claude.com` Release notes (14 Ekim–11 Kasım penceresinde 4 madde) |
| Okunan | Sürüm notlarında "Added / Changed / Removed / Deprecated" satırlarının tamamı. "Improved" ve "Fixed" satırları **okunmadı** (yalnız 2.1.321'in ilk üç düzeltmesi görüldü). Anahtar kelime süzgeci ile VS Code, Slack, JetBrains, Bedrock/Vertex/Foundry'ye özgü satırlar elendi |
| Açılmayan sayfalar | `anthropic.com/claude-fable-and-mythos-5-2` (9 Kasım), `interactive-connectors` makalesi (10 Kasım): yalnız başlıkları görüldü. Fable 5.2 hakkında burada yazılan her şey sürüm notundaki tek satıra dayanır |
| 2.1.313, 2.1.315, 2.1.320 | npm'de var ya da yok, sürüm notunda başlık yok; bir şey çıkarılamadı |

## 1 · Özet hüküm

Sürüm farkı büyük (26 sürüm) ve bu sürümlerin çoğu bizi ilgilendirmeyen kurumsal ağ geçidi (Claude apps gateway) işi. Bize dokunan çekirdek: izin ve kanca davranışı sıkılaştı, alt ajan ve compaction davranışı değişti, bir güvenlik düzeltme grubu var, iki tarihli kapanış var (Opus 4.8 hızlı modu 30 Kasım, bağımsız Claude Design sitesi 14 Aralık).

Yükseltmeden önce bakılması gereken bozucu değişiklik adayları §3'tedir. Yükseltme kararı ve işi ARAÇ/ALTYAPI'nındır; TAKİP yükseltmez.

## 2 · AL adayları (en çok 10)

| # | Ne çıktı | Sürüm · tarih | Bize faydası | Risk | Kime iş |
|---|---|---|---|---|---|
| 1 | Bağımsız **Claude Design sitesi (claude.ai/design) 14 Aralık 2026'da kapanıyor**; `/design-sync` ve `/design-login` bunu uyarıyor. Destek sayfası aynı tarihi ve "adres Claude'a yönlenir" der | 2.1.302 · 16 Ekim; web arama özeti (Eylül 16 birleşme) | Bizim "Design Venthub New" / "Design İçerik" projeleri ve DesignSync hattı bu siteye dayanıyor. Kapanıştan sonra projelerin nereye taşındığı belirsiz | **Yüksek**: tarihli ve geri dönüşsüz; hangi bağlantının/oturumun etkilendiği **ölçülmedi** | OPS (Recep'e taşıma), TASARIM (hat), ARAÇ (DesignSync). Önce: Design projelerinin yeni yerini resmî kaynaktan doğrula |
| 2 | **Opus 4.8 hızlı mod** eskitildi; 30 Kasım'da kalkıyor, sonra hata verir (standarda düşmez). Opus 5'e geçiş öneriliyor | 2.1.316 · 31 Ekim | Hızlı modu kullanan pencere/betik varsa 30 Kasım'da kırılır | Kullanan var mı **ölçülmedi** | ARAÇ (ayar ve ajan tanımlarında `fast`/Opus 4.8 ara), YETENEK (ajan `model:` alanları) |
| 3 | **Güvenlik düzeltmeleri**: MCP OAuth isteklerinde yönlendirmeyle sır (refresh token) başka sunucuya gidebiliyordu; salt-okuma Bash komutu izinsiz sandbox dışında çalışabiliyordu. Ayrıca MCP/connector isteklerinde yönlendirme izleme kapatıldı | 2.1.321 · 9 Kasım; 2.1.299 · 14 Ekim | Bizde çok sayıda MCP (Supabase, Vercel, Gmail, Drive, Linear...) var; sır sızıntısı yolu kapanıyor | Düşük; yükseltmenin kendisi risk taşır (§3) | ALTYAPI (yükseltme PR'ı kararı), ARAÇ (uygulama) |
| 4 | `permissions.denyInsteadOfPrompting`: onay beklemesi gereken çağrı reddedilir, tur sürer (terminal, alt ajan, takım arkadaşı) | 2.1.319 · 6 Kasım | Alt ajan ve gözetimsiz pencerelerde "onay bekleyip takılma" sorununu çözer; ARAÇ'ın bulduğu `autoMode.allow` engellerinin alternatifi | İzin ayarıdır: **Recep yalnız OPS'ta söyler**, deny gevşetilmez. Reddedilen çağrıda iş sessizce yarım kalabilir | ARAÇ (tasarım), OPS (izin kapısı) |
| 5 | `permissions.blockWritesOutsideWorkingDirectories` (yazma tarafı) ve daha önce gelen okuma karşılığı | 2.1.314 · 30 Ekim (okuma: 2.1.257) | Alt ajan ve departman penceresi izolasyonu: başka worktree'ye ya da ana dizine yazım kesin reddedilir | Bizde `C:\tmp`, ortak hafıza klasörü ve yan oturum not klasörü ek dizin olarak tanımlı; bu dizinler "çalışma dizini" sayılıyorsa sorun yok, **ölçülmedi** | ARAÇ (deneme), HARİTA (hangi dizinler) |
| 6 | **Compaction davranışı**: boşta kalan 200K+ konuşma ~54 dakikada önbellek dolmadan sıkıştırılır (`idleCompaction: false` ile kapanır); `/config` içinde satırı var; sıkıştırma sonrası skill listesi yeniden gönderilir; transkriptte sıkıştırma özetine önceki araç adları eklendi | 2.1.299 · 14 Ekim, 2.1.302, 2.1.304 | Bizim durum-dosyası/compaction düzenimiz (500k eşik) ile çakışabilir: boşta pencere kendiliğinden sıkışır. Kota tasarrufu da olabilir | Kurulu sürümde yok; etkisi **ölçülmedi**. Yarım iş satırı kuralı bunun için daha önemli hale gelir | ARAÇ (ölç, karar), HARİTA (açılış/compact kuralı) |
| 7 | **Desktop Code sekmesi oturumlar arası mesaj sınırı 10'dan 20'ye çıktı** (kullanıcı yazmadan önce) | 2.1.321 · 9 Kasım | Bizdeki "Recep yazmadan 10 departman mesajı" kuralı (filo-ortak/hafıza) bu sınırı baz alıyor; toplu mesaj bütçesi ikiye katlanır | Sınır Desktop'ın gömülü kopyasında geçerli; o kopyanın sürümü **ölçülmedi** | HARİTA (kural metni), OPS (bilgi) |
| 8 | **Alt ajan etkisi/maliyet kontrolü**: `CLAUDE_CODE_SUBAGENT_EFFORT`; farklı modelli alt ajan/takım arkadaşı artık o modelin kayıtlı efor düzeyini kullanır; arka plan alt ajanında kabuk komutu 3 dakikada arka plana atılır (önbellek dolmasın) | 2.1.316 · 31 Ekim, 2.1.317, 2.1.318 | Okuma işi Sonnet alt ajanı kuralımızla uyumlu: efor düşük tutulursa harcama azalır | Eforu düşürmek kaliteyi düşürebilir; karar ölçümle | ARAÇ (ayar önerisi), YETENEK |
| 9 | `/tasks` içinde "Earlier in this session": biten alt ajanlar yeniden açılıp mesajlanabilir (yeniden başlatmadan sonra bile); SendMessage ile çalışan arka plan ajanına mesaj daha erken ulaşır | 2.1.319 · 6 Kasım, 2.1.317 | Müdür penceresinin bitmiş çalışanları (araştırmacı, doğrulayıcı) sonradan sorgulayabilmesi; "çalışan sonucu yalnız açana döner" düzenini destekler | Düşük | YETENEK/HARİTA (rehber notu) |
| 10 | **Gözetimsiz görev/loop değişikliği**: kendi hızını ayarlayan `/loop` artık turu yeniden zamanlamadan bitirirse biter (eski davranış için `CLAUDE_CODE_LOOP_KEEPALIVE=1`); bulut `/loop` zamanlayıcısı kapsayıcıyla ölür uyarısı | 2.1.319 · 6 Kasım | OPS'un "uyku sırasında akış durmasın" düzeni ScheduleWakeup/cron'a dayanıyor; bu değişiklikle zincir kopabilir | Kurulu sürümde yok; yükseltmede sessiz kopma riski | ARAÇ (yükseltme öncesi deneme), OPS |

## 3 · Yükseltme öncesi bozucu değişiklik ön-kontrol listesi (AL değil, kontrol)

| Değişiklik | Sürüm | Neden bize dokunur | Kontrol |
|---|---|---|---|
| MCP izin kuralı artık yalnız adını yazdığın sunucuyu kapsar (`mcp__a` ≠ `mcp__a__b`); ajan `tools:` listesi yalnız adlandırılan MCP sunucusunun araçlarını alır; `__` içeren sunucu adı `mcp__<ad>__*` biçiminde yazılmalı | 2.1.299 · 14 Ekim | Ajan tanımlarımız (`.claude/agents`) ve `settings` izin satırlarımız MCP adlarıyla çok dolu | `settings*.json` ve ajan dosyalarında kısa ad kullanan satırları tara (ARAÇ/YETENEK) |
| `UserPromptSubmit` kancaları skill/slash açılmadan ÖNCE koşar; engellerse gömülü kabuk komutları da durur | 2.1.299 | Açılış/istem kancalarımız bunu kullanıyor | Kanca sırası ve çıktı biçimi testi (ARAÇ) |
| Kanca `updatedInput` artık doğrulanır (bilinmeyen anahtarlar düşer, reddedilen girdi çağrıyı reddeder); engelleyebilen eklenti kancası sonuç veremezse eylem REDDEDİLİR | 2.1.299, 2.1.300 | PreToolUse kancalarımız girdi değiştiriyorsa davranış değişir | Kancaların `updatedInput` kullanımını tara |
| Prompt/agent kancaları aynı oturumda en çok 24 eşzamanlı (12'si zaman aşımını aşmış beklemede); `timeout` < 1 sn → 1 sn | 2.1.312 | Çok kancalı istemlerde yavaşlama ihtimali | Kanca sayısı/süre ölçümü |
| `which` bayraklı çağrı önce izin ister (2.1.319; Bash kabuğunun `which` takma adı temizlenir: 2.1.314); `cp`/`mv` yol biçimi (`/bin/cp`) aynı yol denetimine tabi (2.1.321); `sed -i` standart Bash istemine tabi ve `rm`/`rmdir` bypass modunda Desktop'ta anında reddedilip yeniden yazma ipucu verilir (ikisi de 2.1.309) | 2.1.309, 2.1.314, 2.1.319, 2.1.321 | Betiklerimiz ve silme akışımız (`calisma-kopyasi-sil`) etkilenebilir | Silme betiklerini deneme |
| Bash'te geniş deny kuralı, tam ask kuralını geçersiz kılar (sorulmaz, reddedilir) | 2.1.319 | Mevcut deny/ask satırlarının etkileşimi | İzin dosyası okuması (OPS izin kapısı) |
| İç içe `.claude/skills` yalnız başlangıç klasöründe/sandbox kapalıyken yüklenir; `~/.claude/plugins` içindekiler yüklenmez | 2.1.319, 2.1.321 | Çift ağaç (`.claude/skills` + `.agent/skills`) ve worktree altı skill'ler | Worktree'de skill listesi karşılaştırması |
| Read aracının "dosya değişmedi" kısa yanıtı kaldırıldı; tekrar okuma tam içerik döner | 2.1.317 | Bağlam kullanımı artar | Bilgi |
| Alt ajanlar Desktop ve VS Code'da her zaman arka planda; fork alt ajan Desktop'ta varsayılan açık | 2.1.302 · 16 Ekim | Müdür-çalışan düzenimizle uyumlu; fork bağlam taşıdığı için "salt-okuma, bağlam sızdırmaz" varsayımı kontrol edilmeli | Bilgi + deneme |

## 4 · İZLE (kısa)

| Madde | Sürüm | Not |
|---|---|---|
| Fable 5.2 (`claude-fable-5-2`) varsayılan Fable modeli: 1M bağlam, 8/40 dolar milyon belirteç, önbellek okuması 0,20; kayıtlı Fable 5.1 seçimleri `fable`a taşınır (Pro/Max hemen) | 2.1.321 · 9 Kasım | Model kararı Recep/OPS'un; maliyet tablosu eklenebilir. 9 Kasım duyuru sayfası açılmadı |
| `onFailure: "block"` Agent SDK kanca geri çağrılarında | 2.1.317 | Command/HTTP kancalarında 2.1.295'ten beri var; SDK tarafı yeni |
| `/usage` içinde uyarılar (max eforu, workflow, sürekli bağlam, büyük araç sonuçları); `claude -p` sonuçlarında oturum bitiş tarihi | 2.1.299, 2.1.318 | Kota izleme ve "bu pencere neden pahalı" soruları için yararlı |
| `/claude-api api-version` (API sürümü 2026-10-21), `/claude-api latency-optimize`, Managed Agents güvenlik karşılaştırması | 2.1.307, 2.1.319, 2.1.304 | Sitede Claude API kullanmıyoruz; yalnız bilgi |
| Arka plan komutu bildirimleri 1.000 karakteri aşınca yalnız baş ve son gösterilir | 2.1.321 | Bağlam tasarrufu; uzun betik çıktılarında ortası görünmez |
| Mods (Claude'un yazdığı eklenti-benzeri parçalar): izin, hook ve `$.tool.call` kuralları | 2.1.300 – 2.1.321 | Çok sayıda değişiklik; bizde kullanım **ölçülmedi**. Auto/bypass modlarda sorulmadan açılması 2.1.321'de yeni |
| `CLAUDE_CODE_DISABLE_FEATURE_FLAGS`, `CLAUDE_CODE_DISABLE_ULTRATHINK`, `CLAUDE_CODE_AUTO_MODE_MODEL` | 2.1.316–2.1.319 | Ayar seçenekleri; ihtiyaç doğarsa |
| `claude -p` ve SDK: izin modu verilmemişse üçüncü taraf sağlayıcıda `default` ile başlar | 2.1.302 | `-p` koşumlarımız Anthropic API'de; etkilenmez, doğrulanmadı |

## 5 · Claude uygulaması (resmî duyurular)

| Ne çıktı | Tarih | Hüküm | Gerekçe |
|---|---|---|---|
| **Claude Whiteboards** (beta): ekiple paylaşılan beyin fırtınası panosu; Claude panoyu zaman çizelgesine, doc/deck'e çevirir; Lucid, Miro, Vani by Zoho'ya aktarılır; tüm ücretli planlar; Team'de varsayılan açık, Enterprise'ta kapalı | 10 Kasım | GEÇ | Kod/içerik hattımıza bağlanmıyor; Claude Code ya da MCP ile ilişkisi sayfada yok. Tek kişilik operatör için ihtiyaç kanıtı yok |
| **Claude Sheets** (beta): sekmeli, formüllü, açılır listeli tablolar; sayfa "işlevler şimdilik basit" diyor, tam Excel için .xlsx/CSV dışa aktarma | 10 Kasım | İZLE | Teklif/fiyat tablosu işleri için denenebilir ama bizde xlsx/google-workspace yeteneği var; üstünlüğü ölçülmedi |
| **Claude Data** (Dashboards'un genel kullanıma açılmış hali): ambar sorgusu, sertifikalı sorgu, canlı paylaşım, design system desteği; veri kaynakları Redshift, BigQuery, ClickHouse, Databricks, Snowflake; ortaklar Amplitude, Mixpanel, Omni, PostHog, Sigma | 10 Kasım (beta: 8 Ekim) | İZLE | Supabase/PostgreSQL bağlayıcısı sayfada **yok**; bizim verimiz orada. Enterprise'ta 19 Kasım'da varsayılan açılır (bizi etkilemez) |
| **Interactive connectors**: Adobe, Atlassian, Box, Notion gibi araçlar Claude'un yanında uygulama olarak açılır | 10 Kasım | İZLE | Makale açılmadı; bizim bağlayıcılarımızdan hangisinin bu biçime geçtiği bilinmiyor |
| **Claude Fable 5.2 ve Mythos 5.2** ("en zor teknik işler") | 9 Kasım | İZLE | Yalnız başlık ve sürüm notu satırı görüldü; model karşılaştırması yapılmadı |
| Claude Duet (araştırma önizlemesi, proaktif ajan uygulaması; Pro/Max) | 21 Ekim | GEÇ | Önizleme; filomuza eşleşmesi yok |
| Personal Finance (ABD, banka bağlama), Enterprise harcama etiketleri, Enterprise güvenlik merkezi | 5–6 Kasım | GEÇ | ABD'ye özgü ya da Enterprise planı |
| Cowork, Design, Slides, Docs her konuşmada; Artifacts tüm planlarda | 16 Eylül (pencere öncesi) | Bilgi | Mevcut Artifact aracımızın arka planı. Bağımsız Design sitesi kapanışı için §2 madde 1 |
| Haiku 5.5, Opus 5.5 (22 Eylül), Sonnet 5.5 (28 Eylül) | pencere öncesi | Bilgi | Bu oturumun modeli Sonnet 5.5 |

Kural: Whiteboards/Sheets/Data için "bizde kullanılır" iddiası **kanıtsızdır**; yalnız yukarıdaki sayfanın ne dediğine dayanır.

## 6 · Açık işler (kime kart)

TAKİP kart açmaz; aşağıdakileri OPS'a öneri olarak iletir, OPS sahibine dağıtır:

1. Claude Design kapanışı (14 Aralık): TASARIM + ARAÇ (DesignSync) + OPS. **Tarihli, en acil.**
2. Opus 4.8 hızlı mod kalkışı (30 Kasım): ARAÇ + YETENEK, kullanım ara.
3. 26 sürümlük yükseltme planı: ARAÇ/ALTYAPI. Önce `stable` etiketi (2.1.311) mi yoksa `latest` (2.1.322) mi kararı, §3 ön-kontrol listesi, pencereler kapalıyken (TAKIP-gorevler Claude Code görevi).
4. Compaction/idle compaction ve oturumlar arası mesaj sınırı güncellemesi: HARİTA (kural metni) + ARAÇ (ölçüm).
5. Gözetimsiz loop/cron davranışı: ARAÇ ön-denemesi (OPS uyku düzeni).

## 7 · Sınırlar ve yapılmayanlar

- "Fixed" ve "Improved" satırları okunmadı; bu sınıfta bizi ilgilendiren düzeltmeler kaçmış olabilir.
- Desktop gömülü Claude Code sürümü ölçülmedi; Desktop'a özgü maddeler (mesaj sınırı, fork, arka plan ajanı, `rm` reddi) o sürüme bağlıdır.
- Hiçbir ayar dosyası okunup karşılaştırılmadı (izin ve ajan dosyası taramaları önerilerdir, yapılmadı).
- Kurulu sürümdeki davranış, sürüm notundan çıkarıldı; çalışma anında doğrulanmadı.
