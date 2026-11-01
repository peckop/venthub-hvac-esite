---
name: observability
description: "Gözlemlenebilirlik: yapılandırılmış log, metrik, iz; bizde Sentry; kişisel veri loglanmaz. Tetik: \"log ekle\", \"Sentry\", \"izleme\"."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/observability/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/observability/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `codebase-context` / `codebase-search` / `codebase-stats` | `codebase_context` / `codebase_search` / `codebase_stats` (tire yerine alt çizgi; `mcp__wrongstack-codebase-index__*`) |
| `codebase-repo-map` | `codebase_package_graph` ya da `graphify` |
| `codebase-incoming-calls` / `codebase-outgoing-calls` | `codebase_symbol_graph` ya da `codegraph_explore` |
| `codebase-impact-analysis` | `graphify affected "sembol()"` (**parantez şart**: parantezsiz "No unique node match" verir) |
| `codebase-targeted-test`, `codebase-skeleton` | Yok. Kapsayan testi değişen dosyanın yanında / `src/__tests__/` altında elle bul; iskelet için aralıklı `Read` |
| `<nextsteps>` etiketi | **Hiç üretilmez.** Bizde ayrıştırıcı yok; Recep'e rapor akan cümledir |
| "Projenin mevcut logger'ını kullan, ikinci log yığını ekleme" | Bizde bu **Sentry** (+ Vercel logları); ikinci yığın eklenmez |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Kişisel veri loglama yasağı KVKK ile aynı yönde; çelişen satır yok, olduğu gibi alındı.

---

# Observability

## Selection card
- Task: Instrument logs, traces, metrics and service signals.
- Start: Identify the data owner, query/schema, consistency and recovery contract.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Instrument so that the next incident can be answered from telemetry instead of
by adding logs and redeploying. Work with what the project already has — its
logger (pino, winston, structlog, slog, log/zap), metrics client, and any
OpenTelemetry setup. Adding a second logging stack is almost always wrong.

## Rules

1. Use the project's existing logger and conventions; find how a neighbouring
   module logs before adding a line.
2. Log structured events, not sentences: a stable event name plus fields
   (`logger.info({ orderId, durationMs }, 'order.charged')`), so logs can be
   filtered and aggregated.
3. Levels mean something: `error` needs a human, `warn` is degraded but
   handled, `info` is a meaningful business or lifecycle event, `debug` is
   off in production.
4. Correlate: carry a request or trace id through async boundaries
   (OpenTelemetry context or AsyncLocalStorage) and attach it to every log line.
5. Never log secrets, tokens, credentials, or personal data. Configure redaction
   once in the logger (for example pino `redact` paths), not per call site.
6. Log an error once, where it is handled, with the error object and context —
   not at every layer it passes through.
7. Metrics use bounded label values. User ids, raw URLs, and error messages as
   labels explode cardinality; use route templates and error classes.
8. Trace the I/O: spans around outbound HTTP, database, queue, and cache calls,
   with status recorded on failure. Prefer auto-instrumentation where it exists.

## What to instrument

| Signal | For | Examples |
|---|---|---|
| Logs | What happened to one request or job | `payment.failed` with order id, provider code, attempt |
| Metrics | How the system behaves in aggregate | Request rate, error rate, latency histogram per route (RED); queue depth, pool saturation (USE) |
| Traces | Where the time went across calls | Span per inbound request and per outbound dependency |

Start from the question an on-call engineer will ask — "why did checkout fail
for this customer?", "which dependency made p99 spike?" — and make sure the
answer is recorded.

## Patterns

```ts
// Redaction configured once, at the logger.
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
});

// One structured event, with correlation and the error object.
try {
  await chargeCard(order);
  logger.info({ orderId: order.id, durationMs: Date.now() - started }, 'order.charged');
} catch (err) {
  logger.error({ err, orderId: order.id, traceId: currentTraceId() }, 'order.charge_failed');
  throw new PaymentError('charge failed', { cause: err });
}
```

```ts
// A span around an outbound dependency.
const tracer = trace.getTracer('checkout');

export async function reserveStock(sku: string, qty: number): Promise<void> {
  await tracer.startActiveSpan('inventory.reserve', async (span) => {
    span.setAttributes({ 'inventory.sku': sku, 'inventory.qty': qty });
    try {
      await inventoryClient.reserve(sku, qty);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## Anti-patterns

- **`console.log` in a codebase with a logger** — unstructured, unleveled, unredacted.
- **Logging and rethrowing at every layer** — one failure becomes ten error lines.
- **Logging whole request or user objects** — the fastest path to leaking personal data.
- **High-cardinality metric labels** — breaks the metrics backend and the bill.
- **Alerts on causes instead of symptoms** — page on user-facing error rate and
  latency, not on CPU.

## Before returning

- [ ] Uses the project's existing logger, metrics, and tracing setup
- [ ] Structured events with stable names; levels used deliberately
- [ ] Correlation id present across async boundaries
- [ ] No secrets or personal data; redaction configured centrally
- [ ] Errors logged once, at the handling site
- [ ] Metric labels bounded; outbound I/O traced

## Trace continuity and shutdown

Verify context propagation across queues, callbacks and detached tasks rather
than assuming an id on the inbound log reaches every span. Trace links may
represent asynchronous causality better than a false parent-child relation.
Bound exporter buffers and shutdown flush; telemetry failure must not create
unbounded work or silently break the primary task. Record sampling and missing
signals when interpreting incident counts or latency distributions.

## YTN-21 eklemeleri (VentHub'a uyarlandı)

> Kaynak: addyosmani/agent-skills observability-and-instrumentation @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT); ayrıntı
> `references/soru-alarm-runbook.md`. Yığınımız Sentry + Vercel logları; ikinci gözlem yığını eklenmez; kişisel veri (KVKK) loglanmaz.

- **Önce soru:** ölçüm eklemeden önce nöbetçinin soracağı 2-4 soruyu yaz; her sinyal birine cevap versin.
- **Giriş noktası:** cron, webhook, Edge Function ya da elle tetikleme aynı log'a yazıyorsa korelasyon kimliğinin yanına `entryPoint` yaz.
- **Alarm:** kullanıcının hissettiği belirtiye, eyleme dönük, runbook bağlantılı, gerekçeli eşikli; yalnız iki şiddet (sayfa, kart).
- **Telemetriyi doğrula:** bilinçli hata üret, Sentry/Vercel logunda `requestId` ile bul; kişisel veri sızmadığını aynı bakışta kontrol et.

## YTN-24 eki: yayın sonrası ilk saat, geri alma planı, yutturmaca tablosu (VentHub'a uyarlandı)

Tek operatörlü canlı sitede (`venthub.com.tr`) yayın, izlemenin ilk gerçek sınavıdır. Yüzde eşikleri, özellik bayrağı ve kademeli yayın bu bölümün konusu değildir.

**Yayın sonrası ilk saat.** Birleşme canlıya indikten sonra ilk saat içinde, sırayla:
1. Sağlık ucu cevap veriyor (ana sayfa ve kritik bir ürün sayfası canlıda açılıyor).
2. Sentry'de yeni bir hata türü yok; yalnız hata sayısına değil, daha önce görülmemiş imzaya bak.
3. Kritik akış elle yürütülür (sepete ekle, ödeme adımına kadar; gerçek para hareketi başlatma).
4. Geri alma yolu hazır: kim, hangi adımla, ne kadar sürede (aşağıdaki şablon doldurulmuş).
Bu dört madde bitmeden iş "yayında doğrulandı" diye kapatılmaz; ölçmediğin maddeyi "ölçemedim" diye yaz.

**Geri alma planı şablonu.** Yayından ÖNCE kartta yazılı olur:
- Tetik koşulu: hangi gözlem geri almayı başlatır (ör. ödeme akışında yeni hata türü, kritik sayfa açılmıyor).
- Adımlar: önceki dağıtıma dönüş yolu ve kimin yaptığı; adımlar komut ya da adres olarak yazılır.
- Veritabanı notu: geri alma veriyi geri getirmez. Migration içeren yayında kod geri dönse de şema ve yazılmış veri yerinde kalır; ileri düzeltme (forward fix) planı ayrıca yazılır. Migration=prod (kural 13): bu not `database-migrations` ile birlikte okunur.
- Süre hedefi: tetikten geri dönüşe kaç dakika; ölçülmemiş süre "bilinmiyor" diye yazılır.

**Yutturmaca tablosu.**
| Cümle | Gerçek |
|---|---|
| "Staging'de çalışıyor" | Canlıda veri, trafik ve ayar farklıdır; yayından sonra canlıda ölç. |
| "İzlemeyi sonra ekleriz" | Göremediğini ayıklayamazsın; izleme yayından önce kurulur. |
| "Cuma öğleden sonra yayınlayalım" | Tek operatörün olay anında yanında kimse yoktur; geri alma süresini bilmiyorsan ertele. |

Yeni siteye geçiş (OPS-180) planı yazılırken bu bölüm `database-migrations`'daki YTN-24 eki ile birlikte okunur.

Kaynak: addyosmani/agent-skills shipping-and-launch @8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e (MIT)

## Skills in scope

- `security-scanner` — for confirming nothing sensitive reaches logs
- `data-governance` — for retention and personal-data classification of telemetry
- `node-modern` — for async context propagation in Node.js

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
