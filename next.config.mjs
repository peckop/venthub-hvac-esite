process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
            }
        ],
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
                    { key: 'Content-Security-Policy', value: "upgrade-insecure-requests; frame-ancestors 'self' sandbox.iyzipay.com iyzipay.com *.iyzico.com" },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ];
    },
};
export default nextConfig;
