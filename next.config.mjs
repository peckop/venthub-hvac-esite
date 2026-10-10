import { readFileSync } from 'node:fs';

import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from "@sentry/nextjs";

import { bilgiMerkeziYonlendirmeleri, enYayinOku } from './src/config/bilgiMerkeziYonlendirmeleri.mjs';
import { E2E_TIP_LINT_ATLA_ANAHTARI, e2eHizliDerlemeAyari, e2eTipLintAtlaOku } from './src/config/e2eHizliDerleme.mjs';
import { k3bOku, markaYonlendirmeleri } from './src/config/markaYonlendirmeleri.mjs';
import { adresDiliOku, rotaDiliHedefleriniYenile, rotaDiliYenidenYazimlari, rotaDiliYonlendirmeleri } from './src/config/rotaDili.mjs';

/**
 * `EN_YAYIN` bayrağının TEK kaynağı `src/config/features.ts`. Bu dosya TypeScript içe aktaramadığı
 * için değer metinden okunur; okunamazsa `enYayinOku` ATAR (sessizce "kapalı" varsaymaz).
 * Test aynı okuyucunun `features.ts`'teki gerçek değeri verdiğini ölçer (INV-BILGI-MERKEZI-YONLENDIRME-1).
 */
const EN_YAYIN = enYayinOku(readFileSync(new URL('./src/config/features.ts', import.meta.url), 'utf8'));
/** `ADRES_SEMASI_K3B` — aynı gerekçe; okuyucu `k3bOku` (INV-MARKA-KAYNAK-1 gerçek değeri ölçer). */
const ADRES_SEMASI_K3B = k3bOku(readFileSync(new URL('./src/config/features.ts', import.meta.url), 'utf8'));
/**
 * Rota dili anahtarı (OPS-52): `NEXT_PUBLIC_ADRES_DILI`, derleme anında okunur; YALNIZ tam `1` açar,
 * yok/bozuk = kapalı. K3B'den AYRI anahtar (biri tek başına geri alınır). Cetvel: src/config/rotaDili.mjs.
 */
const ADRES_DILI = adresDiliOku(process.env.NEXT_PUBLIC_ADRES_DILI);
/**
 * ALT-38f: e2e-smoke Build adımına ÖZGÜ anahtar (`VENTHUB_E2E_TIP_LINT_ATLA`, YALNIZ tam `1`): `next build`in tip ve lint aşaması koşmaz
 * (`ci` ikisini zaten zorunlu kontrol olarak koşar). Başka hiçbir yerde verilmez; kapalıyken yapılandırmaya HİÇBİR anahtar eklenmez.
 * Cetvel ve kapı: src/config/e2eHizliDerleme.mjs · INV-E2E-HIZLI-1/2/3.
 */
const E2E_TIP_LINT_ATLA = e2eTipLintAtlaOku(process.env[E2E_TIP_LINT_ATLA_ANAHTARI]);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typedRoutes: true,
    // ALT-38f: anahtar kapalıyken BOŞ nesne (anahtar eklenmez); açıkken `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds`.
    ...e2eHizliDerlemeAyari(E2E_TIP_LINT_ATLA),
    images: {
        // KÖPRÜ (2026-08-30, Recep butonla onayladı): Vercel görsel optimizasyonu KAPALI.
        // Sebep: Hobby planın aylık kaynak-görsel sınırı doldu (katalog 1042 görsel) →
        // /_next/image tüm boyutlarda 402 dönüyor, canlı vitrin GÖRSELSİZ kalıyordu.
        // Depodaki dosyalar zaten optimize webp (ölçüm: ort. ~25 KB) — doğrudan servis kabul
        // edilebilir. GERÇEK ÇÖZÜM (REC-91 hattı): ingest'te ön-üretilmiş boyutlar + srcset;
        // o inince bu bayrak kaldırılır. Pro plan seçeneği bilinçli olarak masada DEĞİL.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tnofewwkwlyjsqgwjjga.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ],
    },
    async redirects() {
        const mevcutKurallar = [
            // ── Faz 3-C (REC-300) — 25 kural BURADAN KALKTI: 13 dilsiz `/category/<eski-tr>/:path*`, 6 Lineo çap
            // adresi (T162) ve 6 eski ürün adresi (K12 NIC-11921, REC-146 beş Vortice). Her birinin tek taşıyıcısı
            // artık eski adres haritasıdır (src/data/eski-adres-tohum.json → üretilmiş
            // src/data/generated/eski-adres-haritasi.json; middleware okur, tek sıçrama, veriye bağlı 404 yok).
            // Her kuralın eski → yeni karşılığı ve gerekçesi: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §6
            // (satır 5, 5b, 8); kapı: src/lib/adres/__tests__/tohum.test.ts.
            // ── Ürün Seçici (karar K17, 2026-09-05) — ÖLÜ DİZİN ADRESİNİN ONARIMI.
            // `/destek/hesaplayicilar` canlıda 404 veriyordu, AMA `Routes.destek.hesaplayicilar()`
            // slug'sız çağrılınca tam o adresi üretebiliyordu: kodda üretilebilen, sitede
            // olmayan bir adres. Artık Ürün Seçici girişine kalıcı olarak yönlenir.
            // ⚠Dört ARACIN kendi adresleri (`/destek/hesaplayicilar/<araç>`) YÖNLENDİRİLMEZ —
            // hepsi canlıda çalışıyor (2026-09-05 ölçümü: /tr/destek/hesaplayicilar/kanal 200).
            // Onların tek sayfaya inmesi K18'e bağlı ve K18 "istişare, karar değil".
            // ⚠DİLSİZ KURAL YOK — ve bu KASITLI (2026-09-05, kod incelemesi düzeltmesi):
            // `/destek/hesaplayicilar` (dil öneksiz) için `permanent: true` ile `/tr/...`e
            // göndermek, İNGİLİZCE ziyaretçiyi kalıcı olarak Türkçe sayfaya çiviler ve tarayıcı
            // bunu önbelleğe alır — geri alınamaz. middleware.ts zaten dil önekini kendisi
            // ekliyor (değişken sonuçlu dal, orada 308 açıkça yasak); önek eklendikten sonra
            // aşağıdaki dilli kural devreye girer. Yani dilsiz kurala gerek YOK.
            { source: '/:lang(tr|en)/destek/hesaplayicilar', destination: '/:lang/urun-secici', permanent: true },

            // ── KARAR 92 (Recep, 2026-09-24) — Bilgi Merkezi kendi adresine taşındı.
            // `/destek/merkez` + `/destek/konular/*` → `/tr/bilgi-merkezi` · `/en/knowledge-hub`
            // (EN yalnız `EN_YAYIN` açıkken; kapalıyken EN kategori/destek karşılığı). Liste ve
            // gerekçe tek dosyada: src/config/bilgiMerkeziYonlendirmeleri.mjs. Hepsi tek hop.
            ...bilgiMerkeziYonlendirmeleri(EN_YAYIN),

            // ── REC-374 (2026-09-27) — marka listesi DB ile hizalandı. `frekans-konvertoru` → frekans
            // konvertörleri kategorisi 308; `casals` ve `flexiva` OPS-51 (#1686) ile 308'den çıkıp marka
            // olarak listeye dönüyor. K3-b açıkken `/tr/markalar/<slug>` de aynı hedefe. Liste ve gerekçe:
            // src/config/markaYonlendirmeleri.mjs · kapı INV-MARKA-KAYNAK-1. Hepsi tek hop.
            ...markaYonlendirmeleri(ADRES_SEMASI_K3B),
        ];

        // ── OPS-52 (kararlar 267/269/270) — sayfa adresleri dile göre yazılır (`/tr/about` → `/tr/hakkimizda`).
        // Anahtar kapalıyken iki parça da değişmez/boş. Gerekçe, tablo ve yeniden yazım karşılığı: src/config/rotaDili.mjs.
        //  · Yukarıdaki MEVCUT kuralların hedefleri tabloyla yenilenir (R4): hedefi eski klasör adresi olan kural
        //    (`/destek/hesaplayicilar` → `/urun-secici`, bilgi merkezi EN-kapalı kuralları) yeni adrese gider, zincir olmaz.
        //    Kapalıyken `rotaDiliHedefleriniYenile` girdiyi AYNEN (aynı referans) döndürür.
        //  · Rota dili kuralları (eski klasör adresi → yeni adres) zaten yeni adrese gider, yenilemeye girmez. Hepsi tek hop.
        return [...rotaDiliHedefleriniYenile(mevcutKurallar, ADRES_DILI), ...rotaDiliYonlendirmeleri(ADRES_DILI)];
    },
    async rewrites() {
        // Yeni adres → mevcut klasör (sayfa dosyası aranmadan önce). Anahtar kapalıyken boş.
        return { beforeFiles: rotaDiliYenidenYazimlari(ADRES_DILI) };
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    {
                        // Cetvel: docs/standards/csp-standard.md · bekçi: INV-CSP-1
                        // (src/__tests__/conformance/csp-origin-coverage.test.ts) + INV-3D-5.
                        //
                        // BUGÜN RAPOR-ONLY: hiçbir şeyi engellemez, yalnız ihlali raporlar. Bu yüzden
                        // aşağıdaki origin'lerin eksik olması bugün GÖRÜNMEZ — ama `Content-Security-Policy`
                        // anahtarına geçildiği an eksik olan her origin SESSİZCE ölür (konsolda blok,
                        // panelde veri yok, sebep görünmez). Enforce'a geçiş AYRI karardır; cetvel §5.
                        key: 'Content-Security-Policy-Report-Only',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.iyzipay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com https://raw.githubusercontent.com https://raw.githack.com https://*.google-analytics.com https://api.pwnedpasswords.com https://*.iyzipay.com; frame-src 'self' https://www.youtube.com https://*.cloudflarestream.com https://*.iyzipay.com; frame-ancestors 'none'; form-action 'self' https://*.iyzipay.com; base-uri 'self'; object-src 'none'"
                    },
                ],
            },
            {
                // REC-205 · ÖZEL YÜZEYLER ARAMA SONUCUNA ÇIKMAZ
                //
                // NİÇİN: Google Search Console (2026-09-07) `/tr/auth/login` adresini
                // "kullanıcı tarafından seçilen standart sayfa olmadan kopya" diye işaretledi.
                // Canlı ölçüm: `/tr/auth/login`, `/tr/auth/register`, `/tr/account`, `/tr/cart`
                // sayfalarının HİÇBİRİNDE `<meta name="robots">` YOK — dördü de dizine
                // girebilir durumdaydı. Giriş/kayıt/hesap/sepet sayfasının arama sonucunda
                // işi yok: kullanıcıya değer vermez, tarama bütçesi yer, "ince içerik" sinyali üretir.
                //
                // NİÇİN META DEĞİL BAŞLIK: `account/layout.tsx` bir istemci bileşeni
                // (`'use client'`) ve Next.js istemci bileşeninden `metadata` export edilmesine
                // izin vermez. HTTP başlığı `X-Robots-Tag` bu ayrımı hiç umursamaz, sunucu/istemci
                // fark etmeksizin her yanıtta bulunur ve Google onu meta etiketle EŞDEĞER sayar.
                // Böylece kural tek yerde durur, beş auth sayfasına + hesap ağacına ayrı ayrı
                // serpiştirilmez.
                //
                // `follow` KASITLI: sayfa dizine girmesin ama içindeki bağlantılar izlensin —
                // hesap/sepet sayfasından vitrine giden yollar kapanmasın.
                //
                // `checkout` + `payment-success` (PR-1, bot karnesi 2026-09-24): ödeme sayfası
                // dizine AÇIKTI. O gün burada "checkout ALTYAPI'nın claim'inde" diye bilerek dışarıda
                // bırakılmıştı; yüzey artık URUN şeridinde (src/app/**), sahibi kapatıyor.
                source: '/:lang(tr|en)/:yuzey(auth|account|cart|checkout|payment-success)/:path*',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, follow' },
                ],
            },
            {
                // Yüzeyin kendisi (alt yol olmadan): /tr/account · /tr/cart · /en/cart …
                // Yukarıdaki desen `:path*` ile eşleşiyor ama kökü ayrıca yazmak, deseni
                // okuyanın "kök dahil mi" diye tereddüt etmesini önler.
                source: '/:lang(tr|en)/:yuzey(auth|account|cart|checkout|payment-success)',
                headers: [
                    { key: 'X-Robots-Tag', value: 'noindex, follow' },
                ],
            },
        ];
    },
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    silent: true,
    org: "peckop",
    project: "venthub-hvac",
  },
  {
    widenClientBounds: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  }
);

