# FAZ 4 — Plan: Güvenlik Sertleştirmesi

## Context

FAZ 2 tamamlandı (framer-motion temizliği). FAZ 4 sırada. Bu faz güvenlik header'larını eklemeyi ve rate limiting başlatmayı hedefliyor.

**Motivasyon:** Mevcut durumda CSP yok, rate limiting yok. Güvenlik puanı 7/10.

---

## Mevcut Durum (28 Nisan 2026)

### next.config.mjs
- X-DNS-Prefetch-Control ✅
- Strict-Transport-Security ✅
- X-Frame-Options ✅ (SAMEORIGIN)
- X-Content-Type-Options ✅
- Referrer-Policy ✅
- **CSP:** Yok

### middleware.ts
- UUID → slug redirect ✅
- Admin RBAC guard ✅
- **Rate limiting:** Yok
- **Session timeout:** Yok

---

## Scope

```json
{
  "allowed_paths": [
    "next.config.mjs",
    "src/middleware.ts"
  ],
  "max_files_changed": 2,
  "forbidden_paths": [
    "src/views/",
    "src/components/",
    "src/lib/services/",
    "supabase/migrations/"
  ]
}
```

---

## ADIM 1: CSP Report-Only (next.config.mjs)

### Yapılacak

Report-only modunda CSP başlat. Production'u break etmez, violation'ları loglar.

```javascript
// next.config.mjs — headers() fonksiyonuna eklenecek
{
  key: 'Content-Security-Policy-Report-Only',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",  // Next.js required
    "style-src 'self' 'unsafe-inline'",     // Next.js required
    "img-src 'self' data: https: blob:",
    "font-src 'self' https: data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "report-uri https://venthub-hvac.supabase.co/functions/v1/csp-report"
  ].join('; ')
}
```

### Verify
```bash
curl -I https://localhost:3000 2>/dev/null | grep -i content-security-policy
# CSP-Report-Only header'ı görünmeli
```

---

## ADIM 2: Rate Limiting (middleware.ts)

### Yapılacak

In-memory rate limiting — local/staging için. Production için Edge KV gerekli (sonra).

```typescript
// src/middleware.ts — dosya başına eklenecek
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT = {
  checkout: { max: 10, windowMs: 60_000 },
  auth: { max: 5, windowMs: 60_000 },
  api: { max: 100, windowMs: 60_000 }
}

function isRateLimited(key: string, config: { max: number; windowMs: number }): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now - record.timestamp > config.windowMs) {
    rateLimitMap.set(key, { count: 1, timestamp: now })
    return false
  }

  if (record.count >= config.max) {
    return true
  }

  record.count++
  return false
}
```

Route matcher'a `/api/:path*` ekle ve rate limit uygula.

### Verify
```bash
# Rate limit test
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/checkout; done
# Son 5-6 istek 429 dönmeli
```

---

## ADIM 3: Security Header'lar (next.config.mjs)

Zaten mevcut ama kontrol et:

| Header | Mevcut | Hedef |
|--------|--------|-------|
| X-Frame-Options | SAMEORIGIN | DENY (önerilen) |
| X-Content-Type-Options | nosniff | ✅ aynı |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ aynı |
| HSTS | var | ✅ aynı |

DENY daha güvenli — X-Frame-Options güncelle.

### Verify
```bash
curl -I https://localhost:3000 2>/dev/null | grep -E "X-Frame|X-Content|Referrer"
```

---

## Doğrulama

```bash
# 1. TSC
pnpm exec tsc --noEmit

# 2. Build
pnpm run build

# 3. Header kontrolü
curl -I https://localhost:3000 2>/dev/null | grep -iE "content-security-policy|x-frame-options|rate-limit"
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| CSP production break | DÜŞÜK | Report-only mod |
| Rate limit in-memory (serverless) | YÜKSEK | Sadece local/staging için |
| Build break | DÜŞÜK | TSC kontrol et |