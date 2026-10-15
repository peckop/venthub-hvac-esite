---
name: payments-webhooks
description: "Ödeme sağlayıcı entegrasyonu ve imzalı, tekrarsız webhook işleme: ham gövdede doğrulama, atomik tekilleştirme, idempotency; bizde İyzico. Tetik: \"ödeme webhook\", \"callback doğrulama\", \"idempotency\", \"iade akışı\". WrongStack 1.1.0 uyarlaması."
category: guards
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/payments-webhooks/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-12 (YTN-18, OPS onayı 12 Ekim ilk dalga) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/payments-webhooks/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| Stripe SDK ve webhook örnekleri (Overview, Sources) | Sağlayıcımız **İyzico**; Stripe yalnız örnektir, SDK sürümü bizim değildir. Kod yerleri: `supabase/functions/iyzico-callback`, `iyzico-payment`, `iyzico-refund`, `admin-iyzico-reconcile` |
| `queues-jobs`, `authentication-sessions` atıfları | Bizde yok; atıf yok sayılır. Yetki ve tenant için `supabase-security` (kural 12) |
| `api-design`, `database-migrations` | Bizde var |
| "provider sandbox / test accounts" | İyzico test anahtarlarıyla yalnız sandbox; gerçek tahsilat ya da iade para harcatan canlı iştir (aşağıda kural 3) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kural 11 bağlayıcıdır:** webhook HMAC-SHA256 + replay guard (timestamp/idempotency); sipariş/iade durumları monoton (yalnız ileri); admin işlemleri `admin_audit_log`. Bu skill'in 2-4. kuralları bunun ayrıntısıdır, yerine geçmez.
2. Bizdeki handler'a dokunmadan önce ilgili `index.md` ve `index.ts` okunur; **kod okunmadan "imza doğrulama yok" ya da "tekilleştirme yok" iddiası yazılmaz**.
3. Gerçek para, canlı sağlayıcı çağrısı ve canlı veritabanı yazımı bu skill'in kapsamı dışındadır: yalnız Recep onayıyla, işi koşan pencerede (karar 224).
4. Tutar saklama ve yuvarlama için önce `docs/standards/pricing-standard.md` okunur (DB'de `numeric(14,4)`; kaynaktaki "tamsayı minor birim" API tel biçimi önerisidir, depolama değil).

---

# Payments Webhooks

## Selection card
- Task: Implement signed, idempotent payment callbacks.
- Start: Locate the endpoint, schema, authentication boundary and caller.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Implement payment-provider integration and reliable authenticated webhook processing for an owned application.

Checked Stripe Node SDK target: 23.0.0 on 2026-10-09. Provider API version is a separate contract; inspect account/API compatibility and official migration notes before upgrades.

## Rules

1. Model money/currency, order/payment identity and entitlement transitions explicitly.
2. Verify webhook authenticity against the raw payload and supported SDK; parsed/re-serialized bodies can invalidate verification.
3. Deduplicate events atomically and handle out-of-order/retried delivery; event id and business operation id solve different duplication problems.
4. Use idempotency for outbound payment mutations and reconcile ambiguous timeout-after-commit outcomes.
5. Treat browser redirect success as UX feedback, not authoritative payment or entitlement proof.
6. Use provider sandbox fixtures and authorized test accounts; skill activation does not authorize a real charge/refund.

## Workflow

1. Inspect current billing models, provider SDK/API version and event handling.
2. Specify state transitions and reconciliation rules.
3. Implement verified inbound events and atomic application mutations.
4. Test invalid signatures, replay, ordering, partial failure and ambiguous retries using local/sandbox inputs.
5. Verify checkout/entitlement experience and report sandbox versus live evidence separately.

## Before returning

Provider authenticity and account/API scope explicit; replay/order/idempotency covered; entitlements reconcile; real financial actions remain authorized.

## Sources

Versioned facts checked 2026-10-09; refresh authoritative sources before new installs/upgrades.
[Stripe webhooks](https://docs.stripe.com/webhooks), [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests).

## Skills in scope

- api-design — api design contracts and verification.
- database-migrations — design and verify schema migrations, bounded backfills and deployment compatibility for databases.
- queues-jobs — implement reliable asynchronous jobs and message consumers with explicit delivery, retry and shutdown semantics.
- authentication-sessions — implement application sign-in, sessions and identity integration with explicit account/tenant authorization.

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
