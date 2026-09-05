import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typedRoutes: true,
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
        return [
            // ── T162 — Lineo çap aileleri TEK ailede birleşti (docs/standards/catalog-depth-standard.md §K1).
            // Altı çap ailesi 2026-08-21'de açılmış, 2026-08-23'te kapatıldı: çap bir KARAR noktası
            // değil, aynı sayfadaki seçicidir. Kapanan altı adres sitemap'te DURUYORDU; yönlendirme
            // olmadan altısı da 404 verirdi. Ürünler kaybolmadı — hepsi kanonik aile sayfasında.
            // (Aile slug'ı `/products/<slug>` biçimindedir; varyant `?sku=` ile aynı sayfada seçilir.)
            ...['100', '125', '150', '200', '250', '315'].map((cap) => ({
                source: `/:lang(tr|en)/products/vortice-lineo-${cap}-quiet`,
                destination: '/:lang/products/vortice-lineo-quiet',
                permanent: true,
            })),
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

            { source: '/category/fanlar/:path*', destination: '/category/fans/:path*', permanent: true },
            { source: '/category/hava-perdeleri/:path*', destination: '/category/air-curtains/:path*', permanent: true },
            { source: '/category/isi-geri-kazanim-cihazlari/:path*', destination: '/category/heat-recovery-units/:path*', permanent: true },
            { source: '/category/hava-temizleyiciler-anti-viral-urunler/:path*', destination: '/category/air-purifiers/:path*', permanent: true },
            { source: '/category/hiz-kontrolu-cihazlari/:path*', destination: '/category/speed-controllers/:path*', permanent: true },
            { source: '/category/aksesuarlar/:path*', destination: '/category/accessories/:path*', permanent: true },
            { source: '/category/flexible-hava-kanallari/:path*', destination: '/category/flexible-air-ducts/:path*', permanent: true },
            { source: '/category/nem-alma-cihazlari/:path*', destination: '/category/dehumidifiers/:path*', permanent: true },
            { source: '/category/endustriyel-havalandirma/:path*', destination: '/category/industrial-ventilation/:path*', permanent: true },
            { source: '/category/ticari-havalandirma/:path*', destination: '/category/commercial-ventilation/:path*', permanent: true },
            { source: '/category/konut-tipi-havalandirma/:path*', destination: '/category/residential-ventilation/:path*', permanent: true },
            { source: '/category/duman-egzoz-fanlari/:path*', destination: '/category/smoke-exhaust-fans/:path*', permanent: true },
            { source: '/category/otopark-jet-fanlari/:path*', destination: '/category/jet-fans/:path*', permanent: true },
        ];
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

