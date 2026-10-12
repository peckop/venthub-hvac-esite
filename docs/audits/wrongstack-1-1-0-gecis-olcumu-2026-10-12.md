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
| yeni ortam değişkeni | `WRONGSTACK_JEV_LOG_CONTENT`, `WRONGSTACK_JEV_LOG_DIR`, `WRONGSTACK_RUNTIME_VERSION` | yok |

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

## Ölçülemeyenler (açıkça)

- Gerçek `sage.db`, gerçek kanban panosu ve gerçek posta kutusu (kural: gerçek köke dokunulmaz); yalnız sentetik 5.003 hafıza ve 25 kart.
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
4. Geri dönüş provası AYRI kopyada (şart 5; bu PR'ın ek ölçümü).
5. Bütün `project-server.js` daemon'ları durdurulur (`kurulum.cjs` yapar; pencereler kapalıyken).
6. Yükseltme sonrası 14 Ekim sabahı sağlık ölçümü: kanban okuma/yazma, sage, posta, kokpit düğmesi.
