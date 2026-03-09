process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: wss: data: blob:;"
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    }
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/destek',
                destination: '/support',
                permanent: true,
            },
        ];
    },
};
export default nextConfig;
