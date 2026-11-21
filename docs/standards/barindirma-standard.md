# Barındırma Cetveli — v0.2

> **Kapsam:** VentHub'ın her katmanı (site, veritabanı, DNS, e-posta, önbellek) **nerede** durur,
> **niçin** orada durur, sağlayıcı değişirse **ne sökülür**.
> **Sahibi:** ALTYAPI · **Son doğrulama:** 2026-11-16 (ALTYAPI; taşıma planı `docs/plans/tasima-do-coolify-2026-11-15.md` ve canlı taşıma ölçümüne karşı); §B7 (R2 medya kovası) 2026-11-21 OPS ölçümüne ve yükleme manifestine dayanır, ALTYAPI yeniden ölçmedi.
> **Durum:** YÜRÜRLÜKTE, site taşındı. Site 15 Kasım 2026'dan beri **DigitalOcean 2 GB droplet (Frankfurt) + Coolify** üzerinde (OPS-280, Recep kararı; plan ve ölçülen dersler `docs/plans/tasima-do-coolify-2026-11-15.md`); sağlayıcı seçimi (eski karar 59 sorusu) bununla kapandı. Sağlayıcıdan
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
| Site (Next.js) | **DigitalOcean 2 GB droplet (Frankfurt) + Coolify**; imaj GHCR `ghcr.io/peckop/venthub-hvac-esite`, derleme `yayin-imaji.yml` (GitHub Actions); 15 Kasım 2026'dan beri canlı | `docs/plans/tasima-do-coolify-2026-11-15.md`; DNS Cloudflare gri bulut (yalnız DNS) | **Karar: OPS-280 (Recep, 15 Kasım 2026).** Vercel projesi (`venthub-hvac-esite`) silinmedi ama Hobby kotası doldu, hesap 16 Kasım 00:37 TSİ'den beri duruyor: geri dönüş yolu kota yenilenene kadar kapalı (eski adresler apex A 64.29.17.65 / 216.198.79.65). GitHub'daki Vercel uygulaması 16 Kasım gecesi Recep onayıyla kaldırılıyor (OPS). **22 Kasım 2026: ALTYAPI Vercel geri dönüş kapanış önerisini OPS'a yazar.** |
| Veritabanı / Auth / Storage / Edge Functions | Supabase `free`, eu-central-1 | 2026-09-16 ölçümü | Kalır; platform yedeği **yok** (Free), ama **gece tam yedek var** (ALT-188, 15 Kasım 2026): `scripts/hijyen/canli-db-yedek.cjs al`, `drive-yedek.cmd` içinde, AES-256-GCM şifreli `.vhenc`, Drive'da `yedek/canli-db`, 14 gün; geri yükleme kanıtlı (`docs/plans/rec409-canli-yedek-plani-2026-10-01.md` §8). Anahtar tek kopya, makine dışı kopya Recep kararı |
| Gelen e-posta | Cloudflare Email Routing (MX route1-3.mx.cloudflare.net) | `nslookup -type=MX` | Kalır |
| Giden e-posta | Resend — **alan adı doğrulanmamış** | `resend._domainkey` yok, `_dmarc` yok | REC-368 |
| Ziyaretçi analitiği | `@vercel/analytics` bileşeni var, **projede Web Analytics açık değil** | Vercel API `count_pageviews` → 404 "Web Analytics not found" | Veri toplamıyor → sökülür (§B4) |
| Görsel optimizasyonu | **Kapalı** (`next.config.mjs` `images.unoptimized: true`) | Hobby dönüşüm kotası (5000) köprüsü | Sağlayıcı seçilince yeniden değerlendirilir |
| Medya (katalog PDF'i, model görseli) | **Cloudflare R2**, iki kova: `venthub-katalog` (22 PDF) → `katalog.venthub.com.tr`, `venthub-gorsel` (675 görsel + 675 WebP) → `medya.venthub.com.tr`; ikisi de özel alan adıyla **açık**, `r2.dev` kapalı (21 Kasım 2026) | 21 Kasım yerel kayıt `C:/tmp/ktl100-out/yukle-manifest.jsonl` (geçici; kalıcı kanıt KTL-100 notu; 697 satır, hepsi `yuklendi`, 21 Kasım 15:28-15:54); açık olması ve WebP sayısı OPS ölçümü (21 Kasım) | Kural §B7. `venthub-yedek` kovası **AÇILMADI**, bu cetvelde yoktur |

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
| Vercel | yerleşik | çalışıyordu; bugün hesap durmuş (geri dönüş yolu kapalı, bkz. §B1) |
| Cloudflare Workers + OpenNext | artımlı önbellek (R2) + etiket önbelleği (Durable Object) + kuyruk | webhook → etag değişti, MISS→HIT ✓ |
| Tek Node sunucusu (`output: 'standalone'`) | dosya sistemi önbelleği (`.next/cache`) | webhook → MISS→HIT ✓; **çok örnekte paylaşılan `cacheHandler` (Redis) zorunlu**. **Bugünkü yol: Coolify, tek örnek.** |

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

## B5 — Taşıma sırası (uygulandı: 15 Kasım 2026, DigitalOcean + Coolify)

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
- **Vercel Pro:** karar 60 ile masadan kalktı. **Seçilen (15 Kasım 2026, OPS-280):** DigitalOcean 2 GB droplet + Coolify; derleme GitHub Actions'ta (sunucu 2 GB, `next build` 8 GB ister).

## B7 — Medya kovası (Cloudflare R2): kurallar (21 Kasım 2026, OPS-354 / KTL-100)

**Bugünkü durum (OPS ölçümü, 21 Kasım 2026):** iki kova Recep kararıyla **özel alan adıyla açıktır**:
`venthub-gorsel` (675 görsel) `https://medya.venthub.com.tr`, `venthub-katalog` (22 PDF) `https://katalog.venthub.com.tr`
adresinden sunulur; en düşük TLS sürümü 1.2. `r2.dev` genel adresi **kapalı**; API anahtarı **yok**.
`venthub-gorsel` kovasında 675 asıl dosyaya ek olarak **aynı anahtarlı 675 WebP** vardır (kalite 82, toplam 19,1 MiB);
asıl dosyalar silinmedi. Görsel biçimi ve adres kuralı: `product-image-standard.md`. Harcama tavanı yok, bütçe uyarısı
kurulmadı. Yükleme kaydı `yukle-manifest.jsonl`
(21 Kasım yerel kayıt, `C:/tmp` geçici; kalıcı kanıt KTL-100 kanıt notudur, bu dosya değil):
697 satır (22 + 675), her satırda kova, anahtar, bayt, `sha256`, tür, sonuç ve saat. `venthub-yedek` adlı bir kova
**açılmadı**: yedek kovası bu cetvelde "var" diye anılmaz; açıldığı gün ayrı madde olarak eklenir.

1. **Model başına anahtar.** Dosya anahtarı model (ürün) başınadır; aynı görsel birçok modelde kullanılsa da dosya
   modelin anahtarıyla yazılır (ölçüm: 675 dosyanın benzersiz içeriği 77 dosyadır, tekilleştirme için anahtar bozulmaz).
2. **Yükleme öncesi hash karşılaştırma, sonrası örneklemeli geri okuma.** Her dosyanın `sha256` değeri yüklemeden ÖNCE
   listeyle karşılaştırılır; eşleşmeyen dosya yüklenmez. Yükleme sonrası geri okuma tüm dosyalarda değil örneklemde
   yapılır (21 Kasım: 32 dosya, 32/32 aynı; Katalog 20, OPS ayrı 12). Manifest "geri okundu" kanıtı DEĞİLDİR, yükleme
   kaydıdır; tam geri okuma gerekiyorsa ayrı iş olarak koşulur.
3. **Yeni kova açmak ya da yeni alan adı bağlamak yalnız Recep kararıdır.** Genel erişim (`r2.dev`), yeni özel alan
   adı bağlama, yeni kova ve API anahtarı üretme ALTYAPI, KATALOG ya da OPS tarafından kendiliğinden yapılmaz; kapalı
   kova varsayılandır. Bugün açık olan iki kova (`venthub-gorsel`, `venthub-katalog`) Recep kararıyla açıktır; bu karar
   başka kovaya ya da başka alan adına genişlemez. Dikkat: 22 PDF üretici kataloğudur (Vortice, Nicotra, SEAT, Danfoss)
   ve yeniden dağıtım izni ayrı bir sorudur (KTL-100 liste ölçümü); katalog kovası açık olduğu için bu soru artık
   canlı bir sorudur, kapalı olmaya dayanan bir güvence yoktur.
4. **Sayaç gecikebilir.** R2 panosundaki nesne sayısı ve boyut sayaçları yüklemenin gerisinde kalabilir; "yüklendi"
   kanıtı panonun sayacı DEĞİL, manifest ve örneklemeli geri indirmedir (bkz. kural 2).
5. **Harcama tavanı yoktur.** R2'de otomatik harcama tavanı konmaz; bütçe uyarısı kurulacaksa Recep kararıyla kurulur.
   Boyut bugün küçüktür (PDF 168,5 MiB + görsel 230,1 MiB; 116 JPEG'in üst verisi temizlendikten sonraki boyut), ama bu bir ölçüm tarihi taşıyan sayıdır, tavan değildir.

**Bekçi:** yok. Yeni kova açma, yeni alan adı ya da anahtar üretme kararında bu madde güncellenir ve bir kapı
gerekip gerekmediği ayrıca değerlendirilir.

## Bekçiler

Bugün yok. Sağlayıcı kararından (OPS-280) sonra: §B2 için "üretim derlemesinde `NEXT_PUBLIC_SITE_URL` https ile
başlar" conformance kolu; §B4 tamamlanınca "kaynakta `VERCEL_` ortam değişkeni okunmaz" kolu.
