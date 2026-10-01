---
name: observability
description: "Gözlemlenebilirlik: yapılandırılmış log, metrik, iz; bizde Sentry; kişisel veri loglanmaz. Tetik: \"log ekle\", \"Sentry\", \"izleme\"."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/observability/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/observability/SKILL.md`, MIT lisansı. Aşağıdaki
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
