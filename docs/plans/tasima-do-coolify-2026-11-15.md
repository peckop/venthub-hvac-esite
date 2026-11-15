# Site taşıma: Vercel → DigitalOcean 2 GB + Coolify (ALT-190, OPS-280)

> Karar: Recep, 15 Kasım 2026 (OPS-280). Neden: Vercel Hobby Fluid Active CPU kotası doldu, hesap 16 Kasım 00:37 TSİ'de duruyor.
> Netlify yok (OPS-279). **Vercel projesi silinmez ve durdurulmaz; geri dönüş yolu olarak kalır.** Supabase'e dokunulmaz. Migration yok.
> Cetvel: `docs/standards/barindirma-standard.md`, `docs/standards/rendering-cache-standard.md`. Önceki plan: `docs/plans/yedek-barindirma-netlify-2026-11-15.md` (Netlify yedeği, kullanılmıyor; ortam değişkeni listesi geçerli).

## Mimari

| Parça | Nerede | Not |
|---|---|---|
| Derleme | GitHub Actions (`.github/workflows/yayin-imaji.yml`) | `next build` 8 GB ister; sunucu 2 GB, orada derleme YOK |
| İmaj | GHCR `ghcr.io/peckop/venthub-hvac-esite` (`:latest`, `:sha-<kısa>`) | Yalnız halka açık `NEXT_PUBLIC_*` değerleri içerir |
| Çalışma | DigitalOcean droplet (Frankfurt, 2 GB, Ubuntu) + Coolify | Coolify hazır imajı çeker |
| DNS | Cloudflare, gri bulut (yalnız DNS) | Apex ve www A kaydı yeni IP'ye çevrilir (OPS) |
| Veri | Supabase (değişmez) | Edge Function'lar etkilenmez |

## Ortam değişkenleri (Vercel production ölçümü, 15 Kasım 2026)

Vercel production'da tanımlı olanlar (adlar; değerler yazılmaz):

- **Derlemeye girer (halka açık, depo değişkeni `IMAJ_*`):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SHOP_WHATSAPP`, `NEXT_PUBLIC_SENTRY_DSN`. `NEXT_PUBLIC_SITE_URL=https://venthub.com.tr` iş akışında sabit: Vercel'de tanımsızdı ve kod `VERCEL_PROJECT_PRODUCTION_URL`e düşüyordu; Docker'da düşülecek yer `localhost:3000` olurdu.
- **Çalışma anında Coolify'da (sır):** `JWT_CLAIMS_COOKIE_SECRET` (yoksa admin erişimi fail-closed reddedilir), `SUPABASE_WEBHOOK_SECRET`. İsteğe bağlı: `SUPABASE_WEBHOOK_SECRET_NEXT`.
- **Vercel'de var, kodda okunmuyor:** `NEXT_PUBLIC_IYZICO_*` (üç anahtar; kaynakta okuyan yok, ayrı konu: `NEXT_PUBLIC_` önekli sır adı), `SENTRY_DSN`.
- `SUPABASE_SERVICE_ROLE_KEY` Vercel'de YOK; Next tarafı kullanmıyor.
- `@vercel/analytics`: Vercel dışında istek atmaz, kaldırılmadı (Vercel'e dönüşte bozulmaz).

## Coolify'da ISR ve etiket tazeleme

Standalone çıktı ISR ve `unstable_cache` verisini diske yazar (`.next/server`, `.next/cache`); `revalidateTag` ve `revalidatePath` aynı süreçte çalışır. **Tek örnek** olduğu sürece önbellek tutarlıdır; ikinci örnek eklenirse ortak önbellek işleyicisi gerekir. Konteyner yeniden başlayınca önbellek soğur (ilk istekler yavaş). Webhook hedefi `https://venthub.com.tr/api/webhook/supabase` alan adı üzerindeyse değişmez.

## Sıra ve ölçüm

1. İmaj derlenir ve GHCR'a gider (CI). Paket görünürlüğü: ya Coolify'a GHCR okuma erişimi verilir ya paket halka açılır (imajda sır yok).
2. Droplet açılır (OPS), IP gelir. Coolify kurulur, imaj çekilir, çalışma sırları girilir.
3. **IP ile deneme (DNS'ten ÖNCE):** ana sayfa, ürün sayfası, kategori, admin girişi, fiyat güncellemesinin webhook ile sayfaya yansıması.
4. DNS: apex ve www yeni IP. Sonra ölçülür: https sertifikası, `www` → apex 308, dil yönlendirmesi, önbellek başlıkları.
5. Meilisearch geçişten sonra, ayrı adım.

## Geri dönüş

DNS kaydı Vercel IP'lerine (216.198.79.65 / 64.29.17.65) geri çevrilir; Vercel projesi duruyor olsa da kota yenilenince ya da hesap açılınca çalışır. Vercel hesabı duraklatıldıysa bu yol kapalıdır: bu yüzden DNS çevirmeden önce denemenin yeşil olması şarttır.

## Ölçülen dersler (15 Kasım 2026 taşıma günü; koşu kitabı kuralları)

1. **Sertifika:** DNS çevrildikten SONRA `coolify-proxy` yeniden başlatılmalı. İlk Let's Encrypt denemesi DNS yayılmadan yapılırsa 403 ile düşer ve Traefik varsayılan sertifikayı verir. 14:52-14:57 TSİ arası apex https kesikti (5 dk); `docker restart coolify-proxy` ile geçerli sertifika (YR2) alındı.
2. **`custom_labels` YAPMA:** Coolify'a özel Traefik etiketi verildiğinde Coolify kendi ürettiği yönlendirici etiketlerinin TAMAMINI bırakır; kapsayıcı yönlendirmesiz kalır ve site 503 verir (15:03-15:12 TSİ, ~9 dk). Yönlendirme ince ayarı uygulama katmanında (next.config) yapılır. Geri alma: coolify-db'de `applications.custom_labels = null` (API boş değer reddeder, base64 ister) ve zorla yeniden dağıt.
3. **Canlı sunucuda değişiklikten önce** (Coolify ayarı, proxy, yeniden dağıtım): OPS'a tek satır "ne değişiyor, nasıl geri alınır"; önce deneme adresinde (sslip) denenir; kesintide ilk iş geri alma.
4. **Webhook adresi sert yazılıydı:** `handle_supabase_webhook()` olayları `venthub-hvac-esite.vercel.app`'e yolluyordu (taşımadan sonra sayfalar 24 saat bayat kalırdı); #2537 ile `https://venthub.com.tr/api/webhook/supabase` yapıldı. Başka sert yazılı hedef için migration'larda `vercel.app` aranır.
5. **Coolify otomatik yayınlamaz:** GHCR'a imaj itilince Coolify çekmez. Deploy elle: `POST /api/v1/deploy?uuid=<uuid>` (API belirteci `~/.secrets/coolify-api.txt`). Tetik, panel https'e alınınca (alt alan adı) iş akışına eklenir.
6. **İlk yönetici hesabı:** kurulumda `ROOT_USER_*` ortam değişkenleri işlemedi (kullanıcı oluşmadı, kayıt sayfası açık kaldı); hesap artisan ile oluşturuldu, kayıt kapatıldı, kullanıcı Root Team'e elle eklendi.
7. **Vercel hâlâ master'da derliyor** (Git bağlantısı açık); geri dönüş yolu bu yüzden güncel kalır.
