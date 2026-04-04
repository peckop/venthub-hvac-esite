/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typedRoutes: true,
    images: {
        // Görsel optimizasyonunu devreye alıyoruz (Lighthouse Performans için kritik)
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
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
};
export default nextConfig;
