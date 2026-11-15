# Yedek barındırma planı (Netlify) — ALT-187, 15 Kasım 2026

**Durum:** HAZIRLIK, hesap açılmadı, hiçbir dağıtım yapılmadı. Hesap açmak ve DNS değişimi Recep/OPS onayıdır.
**Cetvel:** `docs/standards/rendering-cache-standard.md` (ISR ve tazeleme). Yedek barındırma için ayrı cetvel yok; bu belge geçici plandır, yedek yol kalıcılaşırsa cetvel yazılır.
**Neden:** Vercel Hobby ekibi (peckops-projects) Fluid Active CPU kotasını doldu (panel: 4 s 1 dk / 4 s, dönem 16 Ekim 02:00 – 15 Kasım 01:00). Belgeye göre duraklatılan Hobby ekibinde mevcut dağıtım da durur (503 DEPLOYMENT_PAUSED) ve kendiliğinden açılmaz.

## 1. Neden Netlify (araştırma, 15 Kasım)

| Aday | Next 15 + middleware + ISR | Ücretsiz katman | Elendi mi |
|---|---|---|---|
| Netlify | zero-config, ISR ve on-demand revalidate tam destek | 300 kredi/ay | hayır (ticari kullanım sözleşme metni doğrulanmadı) |
| Cloudflare Workers + OpenNext | ISR için R2 + D1 bağlaması gerekir | 10 ms CPU/istek, 100 bin istek/gün | geç/riskli (8–16 saat) |
| Render Free | — | "üretimde kullanmayın" | evet |
| VPS | — | ücretli | evet (para harcanmaz) |

**Açık noktalar (hesap açılınca ilk ölçülecek):** (a) Netlify ücretsiz katmanda ticari kullanım maddesi, (b) middleware'in 308/307 yönlendirme sırası (Netlify "headers and redirects are evaluated after middleware" diyor; `src/middleware.ts` kendi yönlendirmesini yapıyor, `next.config.mjs` `redirects()` ile sıra farkı olabilir), (c) `VERCEL_*` ortam değişkenlerine bağlı kod yolları, (d) 15 GB/ay bant sınırı (300 kredi ÷ 20 kredi/GB) bu sitenin 9,27 GB Fast Origin Transfer'ına yakın.

## 2. Hesap gerektirmeyen hazırlık (bu PR'da yok, bu belgede)

`netlify.toml` taslağı (depo köküne ancak hesap onayından sonra eklenir; şimdi eklenseydi Netlify'ı tetiklemese de boşuna kalırdı):

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"
  NPM_FLAGS = "--prefix=/dev/null"
  PNPM_FLAGS = "--frozen-lockfile"
```

Not: `package.json` `build` betiği `scripts/assert-node-major.mjs` ve `--max-old-space-size=8192` kullanıyor; Netlify yapı makinesinin belleği 8 GB'ı karşılar mı ölçülmedi. Gerekirse sınır 4096'ya indirilip derlemenin geçtiği denenir.

## 3. Ortam değişkeni ADLARI (değerler yok)

Çalışma zamanı ve derleme için kodda okunanlar (`grep process.env`, src ve next.config.mjs; test/araç değişkenleri çıkarıldı):

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_WEBHOOK_SECRET`, `SUPABASE_WEBHOOK_SECRET_NEXT`
- Site: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADRES_DILI`, `NEXT_PUBLIC_ODEME_ACIK`, `NEXT_PUBLIC_CART_SERVER_SYNC`, `NEXT_PUBLIC_SHOP_WHATSAPP`, `NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_ERROR_REPORTING`, `NEXT_PUBLIC_DEBUG`, `SATIS_KIPI_ONIZLEME`
- Ödeme ve posta: `IYZICO_API_KEY`, `RESEND_API_KEY`, `TWILIO_AUTH_TOKEN`
- Oturum ve dizin: `JWT_CLAIMS_COOKIE_SECRET`, `INDEXNOW_KEY`
- İzleme: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (derleme)
- Vercel'e özgü, Netlify'da karşılığı elle verilmeli veya kod yolu denetlenmeli: `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_ENV`, `VERCEL`

Değerleri Vercel panelinden Recep/OPS yeni platforma girer; ajan okumaz, yazmaz. Edge Function'lar (Supabase) ayrı barındırılıyor, etkilenmez.

## 4. Adım adım geçiş (süre tahmini 4–8 saat, ölçülmedi)

1. **Onay:** Recep Netlify hesabı açılmasını onaylar. (Karar Recep'te.)
2. **Hesap + site:** GitHub deposu bağlanır (yalnız master, dal önizlemeleri kapalı), ortam değişkenleri girilir. Üretim alan adı ŞİMDİ bağlanmaz.
3. **Staging derleme:** `*.netlify.app` adresinde `pnpm build` geçer; geçmezse bellek/Node sürümü ayarlanır.
4. **Duman testi (staging):** `/` → 308 `/tr`; `/tr`, `/en`, `/tr/category/fanlar`, `/tr/products/jet-serisi`, `/api/health` 200; 101 sitemap adresi 200 (canlı kapı betiği staging adresiyle koşulur); `/tr/about` ve eski dilsiz adres yönlendirmeleri canlıyla aynı mı karşılaştırılır; `Set-Cookie: tenant_id` var mı; `X-Nextjs-Prerender`.
5. **ISR/webhook testi:** staging'e test amaçlı revalidate isteği; Supabase webhook hedefi domain bazlıysa değişmez, vercel.app adresi kullanılıyorsa güncellenir (ölçülmedi).
6. **Supabase Auth:** Site URL ve Redirect URL listesine staging adresi geçici eklenir; apex değişmediği için üretimde ek bir şey gerekmez. İyzico callback yolu (`iyzico-callback`) alan adı üzerinden olduğu için DNS sonrası bir kez denenir (test ödemesi Recep onayıyla).
7. **DNS geçişi (Cloudflare):** apex A/CNAME kaydı Netlify hedefine çevrilir. Önce TTL ölçülür ve 60 sn'ye düşürülür (Vercel açıkken yapılır; durduktan sonra yapılırsa geri dönüş yoktur). `www` → apex 308 korunur.
8. **Doğrulama:** `curl -sI https://venthub.com.tr/tr`, `nslookup -type=A venthub.com.tr`, tarayıcıda gerçek gezinti, 30 dk izleme.
9. **GitHub Actions:** `canli-kapi`, `ssr-duman-alarmi`, `dizin-tetigi` adres olarak `venthub.com.tr` kullanır, değişmez; Vercel'e bağlı iş akışı adımı varsa (dağıtım-hazir) ayrıca incelenir.

## 5. Geri dönüş

Cloudflare'de apex kaydını önceki Vercel değerine (216.198.79.65, 64.29.17.65 — ölçüm 15 Kasım, belgeyle doğrulanmadı) çevirmek yeterli; TTL 60 sn ise ~1 dk. Vercel duraklatıldıysa geri dönüş çalışmaz.

## 6. Ölçülmeyenler

Netlify ticari kullanım sözleşme maddesi · derleme belleği · 308/307 sırası · Supabase webhook hedefi · TTL · Netlify 15 GB bant sınırının bu siteye yetip yetmediği.
