# WrongStack 1.0.26 → 1.1.0 geçiş ölçümü (ARC-94)

> **Durum:** 2026-10-12 · Sahip: ARAÇ · Kart: ARC-94 (OPS emri: yükseltme Salı 13 Ekim akşamı)
> **Cetvel:** `tools/wrongstack-mcp/README.md` (yamalar, kurulum), `tools/wrongstack-mcp/kurulum.cjs` (sürüm farkı kapısı).
> **Yöntem:** alt ajan (izole HOME ve geçici köklerle; gerçek `.wrongstack` verisine DOKUNULMADI) 154 araç çağrısı, ~32 dk.
> Aşağıdaki "ben doğruladım" işaretli satırlar ARAÇ penceresinin kendi ölçümüdür; geri kalanı alt ajan raporudur
> (tam rapor depo dışı: `C:/tmp/vh-arac94-olcum/out/RAPOR.md`).

## Hüküm

Hedef sürüm **1.1.0**. 1.0.37 ile 1.1.0 arasında kanban-mcp, sage-mcp, mailbox-mcp, codebase-index-mcp, `@wrongstack/kanban`
ve `@wrongstack/persistence` paket dosyaları bayt bayt aynıdır; değişen yalnız ajan çalışma zamanıdır (sage middleware ~6 satır,
mcp istemci önbellek yolu, core/tools). 1.1.0, 2026-10-11T21:57Z'de yayımlandı, npm `latest`, deprecated değil.
Olgunluk açısından 1.0.37'nin de ~12 saatlik olması 1.0.37'ye avantaj vermez.

## Araç yüzeyi (`.mcp.json` çağrıları bozulur mu?)

| Ne | 1.0.26 → 1.1.0 | Etki |
|---|---|---|
| araç adları | 27/27 aynı; eklenen ve kalkan YOK (**ben doğruladım**: `tools/list` JSON'ları) | yok |
| 1.0.37 ↔ 1.1.0 `tools/list` | tam nesne olarak aynı; yalnız `version` alanı farklı (**ben doğruladım**) | yok |
| kanban action enum | DEĞİŞMEDİ (manage 45, read 14); zorunlu alan `action` | yok |
| kanban araç açıklamaları | `annotations` eklendi (`readOnlyHint`, `destructiveHint:false`) | yok |
| sage `remember` / `memory_update` | yeni opsiyonel alanlar (`sources`, `validity`, `expectedRevision`, `feedback`); zorunlu alanlar aynı | yok |
| mailbox, codebase-index şeması | bayt aynı | yok |
| `--help` bayrakları | aynı | yok |
| yeni ortam değişkeni | `WRONGSTACK_JEV_LOG_CONTENT`, `WRONGSTACK_JEV_LOG_DIR`, `WRONGSTACK_RUNTIME_VERSION`, `WRONGSTACK_BUN_TYPECHECK` (geliştirici kancası), `WRONGSTACK_INDEX_SERVER_FAULT` (yalnız test hata enjeksiyonu; ortamda ASLA ayarlanmaz) | yok (hiçbiri bizim çalıştırdığımız yolda okunmaz) |

## Geri dönüşte veri bozulur mu? (sentetik veriyle ölçüldü)

**Hayır.** Ama sage.db şeması **tek yönlü genişler**; eski sürüme dönmek şemayı eski hâline getirmez → **yedek şart**
(`scripts/hijyen/sage-yedek.cjs`, ARC-71, #1878).

| Depo | Bulgu |
|---|---|
| kanban | Şema değişmedi (15 nesne). 25 kart + not + check + `verify_completion` hedefte ve geri dönüşte okundu/yazıldı; kart kaybı yok. |
| sage | `user_version` 0 sabit ama ilk açılışta 34 → 47 nesne: 3 tablo (`ws_text_index_revisions`, `hq_memory_sync`, `hq_memory_sync_clock`), 1 indeks, 7 tetikleyici; mevcut tablo/sütun/veri değişmez. 1.0.26'ya dönünce okundu/yazıldı. Bedel: sentetik 5.003 kayıtta 6,76 → 10,39 MiB (**+%54**), ilk açılış 2,5 sn. **Gerçek sage.db boyutu ölçülmedi.** |
| mailbox | Şema değişmedi (22 nesne); kapalı pencereye mesaj, ack, cevap iki yönde çalıştı. |
| codebase-index | `version 5` değişmedi; 1.1.0, 1.0.26 dizinini okur. |
| karışık sürüm | Farklı sürüm istemci hayattaki daemon'a bağlanmaz, kendi daemon'unu doğurur (2 `project-server.js`, aynı SQLite); bozulma görülmedi ama İSTENMEZ. `kurulum.cjs` daemon'ları öldürdüğü için akışta sorun yok. |

## Yamalar

| Yama | 1.0.37 / 1.1.0'da eski yama | Sonuç |
|---|---|---|
| kanban `ozet-donus` | uygulanmaz (araya `signal.throwIfAborted()` girmiş) | `kanban-mcp-1.1.0-ozet-donus.patch` yeniden üretildi; yukarı akım hâlâ `{content: result}`. Duman: yamasız `add_task` 41.832 B → yamalı 1.965 B; `get_board` 39.844 B tam kalıyor; hata sonucu dokunulmadan geçiyor. |
| sage `domain-terms-turkce` | uygulanmaz (aday mantığı `domain-term-candidates` bölümüne taşınmış) | `sage-1.1.0-domain-terms-turkce.patch` yeniden üretildi (7 hunk, 69 satır); yukarı akım hâlâ ASCII-only. Duman: Türkçe girdilerde yamasız 0 terim, yamalı 2-7 terim; İngilizce kontrol değişmedi. |

1.0.37 ve 1.1.0 için üretilen yama dosyaları bayt bayt aynıdır (**ben doğruladım**). Depoya yalnız 1.1.0 adlı kopya girer.

**Test uyarlaması:** `wrongstack-sage-yama.test.ts` `yukle()` başlangıç işareti 1.0.37+'da `// src/domain-term-candidates.ts`
bölümüne kaymıştır (aday çıkarımı ve `normalizeTerm` orada). İşaret artık mevcut işaretlerin en erkenidir; "sürüm kaymışsa"
kolundaki sabit `1.0.26/1.0.27` yamanın kendi adından türetilir. **Ben doğruladım:** 1.1.0 kurulu paket kopyası + yamalar
uygulanmış hâlde `wrongstack-sage-yama`, `wrongstack-mcp-kurulum`, `wrongstack-kurulum-betigi`, `wrongstack-surum-satiri`
testleri 71/71.

## Kilit

`tools/wrongstack-mcp/package-lock.json` proje kilidinden `npm install --package-lock-only` ile türetildi: **15 paket**
ilerler (11 `@wrongstack/*`, `playwright` + `@playwright/test` + `playwright-core` 1.63.0 → 1.64.0, `pprof-format` 2.3.1 → 2.3.2);
paket eklenmedi/kaldırılmadı, kurulum betiği (`install` script) yok. **Ben doğruladım:** aday kilit ↔ depo kilidi farkı yalnız bu 15.

## Geri dönüş provası — GERÇEK veri kopyasında (12 Ekim 13:0x, ARAÇ, ayrı kök, canlıya dokunulmadı)

Kopya: 09:54Z yedeğinden (`sage-yedek.cjs`, #1878) yalıtılmış köke geri yüklenen gerçek veri (sage 251 kayıt, kanban
16 pano / 994 kart, 5 posta kutusu). Akış: 1.0.26 ile oku (taban) → 1.1.0 ile aç, yaz → daemon'lar durdurulur →
yedekten geri yükle (`--geri … --kok/--posta-koku … --evet`) → 1.0.26 ile oku → karşılaştır. Araçlar: gerçek
`@wrongstack/*-mcp` sunucuları (1.0.26 canlı kurulumdan, 1.1.0 + yamalar bu ağaçtan).

| Ölçü | Taban (1.0.26) | Yükseltme sonrası (1.1.0) | Geri dönüş (1.0.26, yedekten) |
|---|---|---|---|
| sage `memory_search`, 10 Türkçe terim (sıfırdan, şerit, kapı, kanıt, göç, yedek, kanban, ğ, Çözümleyici, İstanbul) | 1, 12, 20, 20, 3, 5, 11, 20, 0, 0 sonuç | aynı | aynı kimlikler, aynı sıra: **10/10 BİREBİR** |
| sage nesne sayısı | 34 | **47** (3 tablo + indeks + 7 tetikleyici) | 34 |
| sage.db + WAL boyutu | 1,72 MB | 3,21 MB (**+%87**, gerçek veri; sentetik +%54'ten yüksek) | taban |
| kanban pano / kart | 16 / 994 | 16 / 995 (yükseltme sonrası yazılan kart) | 16 / **994** (yazılan kart yok) |
| yükseltme sonrası yazılan sage kaydı | — | var | **yok** |
| posta `mailbox_read query` (yalıtılmış ev) | 1 | 1 | 1 |
| 5 posta kutusu `--geri` | — | — | 5/5 GERI YUKLENDI ve DOGRULANDI |
| daemon (prova kökünde) | — | eski sunucu açıkken 1, yeni istemci eklenince **2** | hepsi durduruldu, kalan 0 |

**Karışık sürüm kanıtı:** 1.0.26 daemon'u ayaktayken 1.1.0 istemci ona bağlanmaz, kendi daemon'unu doğurur
(iki daemon, aynı SQLite). Bu yüzden yükseltmede önce BÜTÜN daemon'lar durdurulur (`kurulum.cjs` yapar), sonra
`saglik.cjs` ile koşan her daemon'un paket sürümü okunur; eski sürümlü daemon varsa `HATA`.

**Disk:** gerçek `sage.db` 1,77 MB + WAL 0,9–1,3 MB; yedek dizini 207 MB toplam; boş disk 29,2 GB. Yükseltme ve
yedek için yer yeterli (göç sonrası beklenen sage.db ≈ 3,3 MB).

## Geri dönüş prosedürü (adım adım; bozulursa)

1. Bütün pencereleri kapat (yedek geri yükleme canlı kökte süreç varken REDDEDER; bu bilerek böyle).
2. Kodu eski sürüme al: yükseltme PR'ını geri al (`git revert -m 1 <birleşme-commit>`) ya da `tools/wrongstack-mcp/package.json`,
   `package-lock.json` ve `yamalar/` dizinini birleşme öncesi commit'ten getir (1.0.26 yamaları git geçmişinde durur).
3. `node tools/wrongstack-mcp/kurulum.cjs` — daemon'ları durdurur, `npm ci`, yamaları uygular, `HAZIR` der.
4. **Veri:** göç toplamsaldır ve 1.0.26 47 nesneli şemayla çalışır; yükseltme sonrası yazılan kayıtlar gerekliyse
   yedekten geri YÜKLEME yapılmaz. Eski şemaya dönmek (ya da bozulma şüphesi) için pencereler kapalıyken:
   `node scripts/hijyen/sage-yedek.cjs --geri sage <yedek> --evet`, `--geri kanban …`, `--geri posta-<proje> …`
   (mevcut dosyalar `.oncesi-<damga>` ile yana alınır, silinmez; yazılan parmak izi yedekle karşılaştırılır).
5. Doğrula: `node tools/wrongstack-mcp/saglik.cjs` (daemon taraması) ve ana ağaçta `--sunucu`: her sunucu `1.0.26`.

## ⚠Kaza kaydı — erken göç (12 Ekim 13:07, ARAÇ)

Bu PR'ın `saglik.cjs` betiği ilk sürümünde sunucuları worktree'den açtı; sunucu `--project-root`u git üzerinden ANA
AĞACA çevirdiği için bu ağacın 1.1.0 paketi CANLI kökü açtı: 1.1.0 sage/kanban/codebase-index daemon'ları doğdu ve
canlı `sage.db` şeması 34 → 47 nesneye yerinde göç etti (geri alınamaz, toplamsal). Ölçülen zarar yok: integrity_check
ok, 251 kayıt / 247 aktif (09:54Z yedekle aynı), kanban şeması değişmedi; ben doğurduğum üç daemon'u durdurdum.
Düzeltme: betiğin varsayılanı yalnız daemon taraması; `--sunucu` yalnız ana ağaçta (`.git` dizin) ve açık bayrakla
(`wrongstack-saglik.test.ts`, bozma 5/5). **Kural:** yükseltmeden önce hiçbir betik, test ya da araştırmacı, canlı köke
çözülen bir kökle (worktree dahil) yeni sürüm sunucusu açmaz; prova kökü git DIŞI kopyadır.

## Ölçülemeyenler (açıkça)

- ~~Gerçek `sage.db`…~~ **Artık ölçüldü** (yukarıdaki gerçek veri provası). Hâlâ ölçülmeyen: canlı kökte eşzamanlı yazma yükü ve `transition_task` başarılı yolu (aşağıda).
- `transition_task` başarılı yolu (yönetilen pano kolon kimlikleri üretilemedi; 1.0.26'da da "managed board" reddi var, yama o satırı aynı ifadeyle sarıyor).
- Sage 15 aracın yalnız 7'si ve kanban/mailbox'ın bazı eylemleri gerçek veriyle; geri kalanı sahte argümanla sonuç sınıfı düzeyinde.
- `kanban_watch`/`mailbox_watch` uzun bekleme, `--http`, `--destructive`, `--admin`; karışık daemon sage ve mailbox'ta; çoklu pencere eşzamanlı yazma yükü.
- Node 22.16.0 + undici 8.11.2 (`node >=22.19` ister) `EBADENGINE` uyarısı üç sürümde aynı; dört sunucu 22.16'da çalıştı, Node yükseltmesi ölçülmedi.
- Ölçüm taze çözüme dayanır (playwright 1.64.0, pprof-format 2.3.2); proje kilidindeki eski sürümlerle 1.1.0 ayrıca çalıştırılmadı.
- Yukarı akım değişiklik notu yok (paketlerde CHANGELOG bulunmuyor); "büyük sürüm" gerekçesi kaynak farkından çıkarıldı.

## Yükseltme öncesi şartlar (OPS emri + ölçüm)

1. ARC-98 birleşmiş (#1877, **tamam**).
2. Yamalar yeniden üretilmiş ve bu PR'da (**tamam**).
3. Yedek: sage.db + kanban + posta kutuları (`sage-yedek.cjs`, #1878 birleşmeli; yedek geri dönüş şartıdır).
4. Geri dönüş provası AYRI kopyada (şart 5): **tamam** (yukarıdaki gerçek veri tablosu).
5. Bütün `project-server.js` daemon'ları durdurulur (`kurulum.cjs` yapar; pencereler kapalıyken).
6. Yükseltme sonrası sağlık ölçümü: `saglik.cjs` (daemon sürümü), kanban okuma/yazma, sage, posta, kokpit düğmesi.

**⚠BİRLEŞME ANI = YÜKSELTME ANI.** Bu PR birleşince ana ağaçta `kurulum.cjs --denetle` KIRMIZIDIR (kilit 1.1.0, kurulu
1.0.26) ve `WRONGSTACK` durum satırı "bizde 1.1.0" der; ikisi de `kurulum.cjs` koşana kadar yanıltır. Bu yüzden PR
yalnız kapanış sırasında, pencereler kapalıyken ve kurulumla aynı turda birleşir.

## Yükseltme günü sırası (tek sayfa; 12 Ekim 17:30 kapanışı)

Önkoşul — 16:30 kapısı (dördü de EVET olmadan bu akşam yok): (a) #1878 birleşmiş; (b) yalıtılmış kök provası birebir
(kart sayısı + sage Türkçe arama + posta okuma); (c) kanban ve sage yamaları 1.1.0'da `kurulum.cjs --denetle` HAZIR;
(d) geri dönüş yolu ayrı kopyada denenmiş.

| # | Adım | Komut / ölçü | Beklenen | Bozulursa |
|---|---|---|---|---|
| 1 | Pencereler kapanır; yalnız ARAÇ penceresi kalır | `claude agents` / süreç listesi | başka MCP sunucusu yok | kurulum.cjs "başka pencere açık" ile DURUR, hiçbir şeye dokunmaz |
| 2 | Yedek | `node scripts/hijyen/sage-yedek.cjs` | 7 depo (sage, kanban, 5 posta) `ALINDI ve DOGRULANDI` | tek depo düşerse DUR, yükseltme yok |
| 3 | Birleştir | `node scripts/hijyen/merge-ritueli.cjs 1883 arac/arc94-wrongstack-1-1-0 --agac=C:/tmp/vh-arac-94 --merge` | beş madde YEŞİL, ana ağaç ilerler | KIRMIZI ise birleşmez |
| 4 | Daemon durdur + kur + yamala | ana ağaçta `node tools/wrongstack-mcp/kurulum.cjs` | son satır `HAZIR` | `HATA: …` → adım 9 (geri dönüş) |
| 5 | Daemon kalmadı mı | `node tools/wrongstack-mcp/saglik.cjs` | `daemon yok` ya da hepsi 1.1.0 | ESKİ daemon → süreci durdur, adım 4'ü yinele |
| 6 | Sürüm oku (sunucular) | ana ağaçta `node tools/wrongstack-mcp/saglik.cjs --sunucu` | dört sunucu `initialize 1.1.0`, `HAZIR` | HATA → adım 9 |
| 7 | Pencereler açılır; açılış sınaması | kanban `list_boards` (16+ pano), kokpit düğmesi, sage `memory_search sıfırdan` (1 sonuç), posta `mailbox_read` | hepsi çalışır | adım 9 |
| 8 | Sağlık kaydı | karta tablo: yedek boyutları, sürümler, sınama sonuçları | — | — |
| 9 | Geri dönüş (yalnız bozulursa) | yukarıdaki "Geri dönüş prosedürü" | `saglik.cjs` 1.0.26 gösterir | OPS'a yaz |

Ardından ayrı adım (OPS onayıyla): iç ayarların açılması (aşağıdaki liste; uygulama yükseltmeden SONRA).

## İç ayarlar — aç / açma önerisi (OPS 12 Ekim; uygulama yükseltmeden sonra, ayrı adım, OPS onayıyla)

**Kapsam notu (ben doğruladım: `.mcp.json`):** biz yalnız dört MCP sunucusunu (sage, kanban, mailbox, codebase-index)
Claude Code altında koşuyoruz; WrongStack'in kendi AJAN çalışma zamanı (`wstack`: otonomi, skill-companion, sandbox, Jev)
bu yolda koşmaz. Aşağıdaki ajan çalışma zamanı ayarlarının hiçbiri bizim yolumuzda etkili değildir; bu yüzden hepsi
**AÇMA / DOKUNMA**. Bizi ilgilendiren tek gerçek ayar `sessionRetentionDays`. Kaynak: alt ajan raporu (paket kaynağı
ve d.ts farkı, 1.0.26 ↔ 1.1.0); `skill-companion` varsayılanları ve `rememberStartupChoices` yalnız d.ts yorumuna
dayanır, kodda okuma yeri bulunamadı (doğrulanmadı).

| Ayar / özellik | Ne yapar | 1.1.0 varsayılanı | Önerim | Gerekçe (tek cümle) |
|---|---|---|---|---|
| sage `hygiene.sessionRetentionDays` | Oturum kapsamlı hafızayı N gün sonra temizler; 0 yaşa dayalı temizliği kapatır | 7 (iki sürümde aynı) | **DOKUNMA (7 kalsın)** | 0 sonsuz saklamadır ve sage.db'yi büyütür; mevcut davranış korunur. |
| sage `memory_update` `feedback` (useful/outdated/incorrect/irrelevant/uncertain) | Kullanım geri bildirimini yazar; outdated/incorrect review adayı açar | ayar değil, araç argümanı | **DOKUNMA** | Ayar anahtarı yok; kullanırsak review adayları sage.db'ye yazılır. |
| sage-mcp `memory_candidates` (`proposals`) | Dış ajanlara yalnız list/propose sunar; doğrudan hafızaya yazmaz | ayar değil; araç | **DOKUNMA** | Dış ajan önerisi review'a girer; bizde dış ajan yok. |
| `autonomy.nextSteps` | Her tur sonunda nextsteps bloğu ister | required (yeni) | **AÇMA** | `autoProceedMaxIterations` sınırsızken model bitti diyene kadar sürer; bizim yolumuzda koşmaz. |
| `autonomy.yoloPlus` | YOLO açıkken bile izin sormaz (yıkıcı işler dahil) | false (yeni) | **AÇMA** | Son izin kapısını kaldırır; PUBLIC depoda sır kapısını zayıflatır. |
| `autonomy.yolo` | Tüm izin istemlerini kapatır | true (iki sürümde aynı; sahip kararı) | **AYRI KARAR (bu işin dışı)** | Yükseltmeyle değişmiyor; yoloPlus ile aynı kaygı. |
| `autonomy.rememberStartupChoices` | Son YOLO/otonomi seçimini sormadan geri uygular | true (yalnız d.ts, doğrulanmadı) | **AÇMA (false)** | Son mod sessizce geri gelir. |
| `features.toolCoach` / `skills.localSuggest` | Araç/skill için yönlendirme notu ekler | true / true | **VARSAYILAN KALSIN** | Yalnız metin ekler, ağ çağrısı yok; bizim yolda koşmaz. |
| skill-companion (ana anahtar + sinyaller + `fileChurnThreshold` 5 → 20) | Arka plan yargıcı skill önerir, ilk dosya düzenlemesini bir kez tutar | enabled true (d.ts) | **AÇMA (enabled:false)** | Her turda ek model çağrısı ve sürtünme; faydası ölçülmedi. |
| `tools.sandbox` (mode) | bash/exec/git için sandbox | off (eski davranış) | **AÇMA** | Enforced modda MCP çağrıları `sandbox_denied` alabilir; kanıt yok. |
| `mcpServers.<ad>.sandboxTrust` | Sunucunun çağrıları sandbox'ı atlar | false | **AÇMA** | Güvenilen sunucu sandbox'ı atlar; depo kendi sunucusunu işaretleyemez. |
| `typesafe.enabled` / `logContent` / `logDir` (Jev) | Jev isteği; içerik günlüğü diske yazar | kapalı / false / `~/.wrongstack/logs` | **AÇMA** | Açıkken istekler dış sağlayıcıya gider, içerik diske düşer; kullanmıyoruz. |
| `root.disabledProviders` | Sağlayıcıyı fallback'ten çıkarır | boş | **AÇMA** | Kapatılacak sağlayıcı yok. |
| `runtime.variant = scout` | Araç yüzeyini küçültür, kalanı tool_search ile çağrılır | default | **AÇMA** | Kanban/sage araçlarına dolaylı yol; ölçülmedi. |
| `wstack sage connect` | Projeye MCP girdisi ve skill/kural dosyası yazar | komut | **KOŞMA** | Depo dosyalarını değiştirir; PUBLIC depoda commit kapısından geçmeli. |
| `WRONGSTACK_INDEX_SERVER_FAULT`, `WRONGSTACK_BUN_TYPECHECK` | Test hata enjeksiyonu / geliştirici kancası | tanımsız | **ASLA AYARLAMA** | Üretimde sunucuyu düşürür. |

**Hüküm:** yükseltmeden sonra açılacak ya da değiştirilecek bir iç ayar YOKTUR; liste "hepsi olduğu gibi kalsın"dır.
Bu, ayrı bir uygulama adımının gerekmediği anlamına gelir (OPS onayı yalnız bu hükmü kayda geçirmek içindir).
Çekince: skill-companion ve `rememberStartupChoices` kodda doğrulanmadı; bizim yolumuzda koşmadıkları için sonuç değişmez.
