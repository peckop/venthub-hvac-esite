# Barındırma Cetveli — v0.1 TASLAK

> **Kapsam:** VentHub'ın her katmanı (site, veritabanı, DNS, e-posta, önbellek) **nerede** durur,
> **niçin** orada durur, sağlayıcı değişirse **ne sökülür**.
> **Durum:** TASLAK. Site barındırma sağlayıcısı **karar 59**'u bekliyor (Recep). Sağlayıcıdan
> bağımsız kurallar (§B2–§B5) bugünden geçerlidir.
> **Ölçüm kaynağı:** REC-367 (2026-09-22) — üç aday yerelde derlendi ve ölçüldü; tablo Linear
> REC-367 açıklamasının sonunda. **Doğuş sebebi:** Vercel ücretsiz takımı "dağıtım depolaması 10 GB
> %100" uyarısı verdi (2026-09-21); Hobby planı ticari kullanıma kapalı (2026-09-16 ölçümü);
> **karar 60 (Recep, 2026-09-22): Vercel Pro'ya geçilmez, alternatifler masaya konur.**

---

## B1 — Katman haritası (2026-09-22 ölçüldü)

| Katman | Bugün | Kanıt | Karar |
|---|---|---|---|
| Alan adı DNS'i | **Cloudflare** (brodie/ines.ns.cloudflare.com) | `nslookup -type=NS venthub.com.tr 1.1.1.1` | Kalır — taşıma sebebi yok |
| Site (Next.js) | Vercel Hobby, proje `venthub-hvac-esite` | apex A 64.29.17.65 / 216.198.79.65, www CNAME cname.vercel-dns.com | **karar 59: _________** |
| Veritabanı / Auth / Storage / Edge Functions | Supabase `free`, eu-central-1 | 2026-09-16 ölçümü | Kalır; **yedek yok** — ayrı karar kalemi |
| Gelen e-posta | Cloudflare Email Routing (MX route1-3.mx.cloudflare.net) | `nslookup -type=MX` | Kalır |
| Giden e-posta | Resend — **alan adı doğrulanmamış** | `resend._domainkey` yok, `_dmarc` yok | REC-368 |
| Ziyaretçi analitiği | `@vercel/analytics` bileşeni var, **projede Web Analytics açık değil** | Vercel API `count_pageviews` → 404 "Web Analytics not found" | Veri toplamıyor → sökülür (§B4) |
| Görsel optimizasyonu | **Kapalı** (`next.config.mjs` `images.unoptimized: true`) | Hobby dönüşüm kotası (5000) köprüsü | Sağlayıcı seçilince yeniden değerlendirilir |

## B2 — Site adresi derleme anında VERİLİR (DEĞİŞMEZ)

`NEXT_PUBLIC_SITE_URL=https://venthub.com.tr` üretim derlemesinde **zorunludur**.
`src/config/siteUrl.ts` bu değişken yoksa `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`'e düşer;
Vercel dışında ikisi de yoktur. **Ölçüldü (REC-367, standalone derleme):** değişken localhost iken
`sitemap.xml` 88 adresin **88'ini** `http://localhost:3000/...` olarak üretti — hiçbir test kırmızı
vermedi. Kanonik adres kuralı: `canonical-url-standard.md`.

## B3 — Önbellek tazeleme sağlayıcıya göre kurulur

`rendering-cache-standard.md` statik sayfaların ürün değişince `revalidateTag`/`revalidatePath`
ile tazelendiğini varsayar (tek tüketici `src/app/api/webhook/supabase/route.ts`). Bu varsayım
**her sağlayıcıda ayrı ölçülür**; "Next destekliyor" yetmez.

| Sağlayıcı tipi | Gerekli bileşen | REC-367 ölçümü |
|---|---|---|
| Vercel | yerleşik | çalışıyor (bugün) |
| Cloudflare Workers + OpenNext | artımlı önbellek (R2) + etiket önbelleği (Durable Object) + kuyruk | webhook → etag değişti, MISS→HIT ✓ |
| Tek Node sunucusu (`output: 'standalone'`) | dosya sistemi önbelleği (`.next/cache`) | webhook → MISS→HIT ✓; **çok örnekte paylaşılan `cacheHandler` (Redis) zorunlu** |

Konteyner diski kalıcı değilse yeniden başlatmada önbellek derleme çıktısına döner; bu hata
değildir ama ilk isteklerin yavaş olacağı bilinir.

## B4 — Vercel'den ayrılırsa söküm listesi (sağlayıcıdan bağımsız)

| Parça | Yer | İş |
|---|---|---|
| `@vercel/analytics` | `src/app/layout.tsx:107`, `package.json`, `analitik-yerlesimi.test.ts` | Kaldır ya da yenisiyle değiştir. Vercel dışında her sayfa görüntülemede 1 adet 404 üretir (ölçüldü). |
| `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` | `src/config/siteUrl.ts` | §B2 ile gereksizleşir; geri düşüş sırası güncellenir |
| `VERCEL_ENV === 'preview'` | `src/lib/kip/satisKipi.ts` | Yeni sağlayıcının önizleme ortamı işaretine bağlanır |
| Dağıtım atlama betiği | `scripts/vercel-ignore-build.sh`, `deploy-build-skip-standard.md` | Yeni sağlayıcının karşılığı ya da emekli |
| SSR duman alarmı | `.github/workflows/ssr-duman-alarmi.yml` | Önizleme adresi kaynağı değişir |
| Bayat yorum | `.github/workflows/db-advisor.yml:321,470` ("Vercel" zorunlu bağlam) | Dal koruması bugün yalnız `ci` + `admin-smoke` ister (ölçüldü) |
| Eski SPA kuralı | `public/_redirects` (`/* /index.html 200`) | Sil — Wrangler "sonsuz döngü" diye yok sayıyor |
| Bayat Dockerfile | `deploy/Dockerfile` (Node 18, nginx, `/app/dist`) | Vite dönemi kalıntısı; Next'i çalıştırmaz. Doğru örnek REC-367 `Dockerfile.rec367` |

## B5 — Taşıma sırası (karar 59 hangi sağlayıcıyı seçerse seçsin)

1. §B2 ve §B4'teki sağlayıcıdan bağımsız düzeltmeler **Vercel'deyken** yapılır ve canlıda ölçülür.
2. Seçilen sağlayıcıya **ayrı deneme adresinde** dağıtım; REC-367'de ölçülemeyenler burada ölçülür:
   eşzamanlı yük, süreye bağlı ISR (3600 sn), Sentry, gerçek hesapta paket boyutu sınırı.
3. Canlı geçiş = DNS kaydı değişimi (Cloudflare'de). **Geri dönüş aynı kaydı geri almaktır**; eski
   Vercel dağıtımı geçişten sonra en az bir hafta silinmez.
4. Geçiş günü sitemap, kanonik adres, `/` → `/tr` yönlendirmesi ve bir webhook tazelemesi canlıda
   ölçülür.

## B6 — Aday notları (karar 59 girdisi, REC-367)

- **Cloudflare Workers + OpenNext:** $5/ay; DNS zaten orada; yerel derleme ve 5/5 sayfa çalıştı;
  worker gzip 3,0 MiB (ücretsiz plan sınırı 3 MiB → ücretli plan şart). **Bulgu:** `src/utils/router.ts`
  `createRedirectResponse` `NextResponse.next()` başlıklarını (iç `x-middleware-*` dahil) yönlendirmeye
  kopyalıyor; OpenNext bunu "devam et" okuyor ve `/` 404 dönüyor. İki satırlık düzeltme ölçüldü.
  Risk: üçüncü taraf adaptör — Next sürüm yükseltmesi önce OpenNext desteğini bekler.
- **DigitalOcean App Platform:** $10–12/ay (1 GiB); düz Node, adaptör yok; FRA bölgesi.
- **Hetzner + Coolify:** €5,49/ay (CX23); sunucu bakımı (yama, yedek, izleme) Recep'e düşer.
- **Vercel Pro:** karar 60 ile masadan kalktı.

## Bekçiler

Bugün yok. Karar 59'dan sonra: §B2 için "üretim derlemesinde `NEXT_PUBLIC_SITE_URL` https ile
başlar" conformance kolu; §B4 tamamlanınca "kaynakta `VERCEL_` ortam değişkeni okunmaz" kolu.
