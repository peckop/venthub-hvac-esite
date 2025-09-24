import path from "path"
import { readFileSync, writeFileSync } from 'fs'
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { imagetools } from 'vite-imagetools'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Critters from 'critters'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  // Minimal Critters integration to inline critical CSS after build
  const criticalCssPlugin = (() => {
    let outDir = 'dist'
    const plugin: any = {
      name: 'inline-critical-css',
      apply: 'build' as const,
      enforce: 'post' as const,
      configResolved(resolved: any) {
        outDir = resolved.build?.outDir || 'dist'
      },
      async closeBundle() {
        try {
          const distDir = path.resolve(__dirname, outDir)
          const htmlPath = path.join(distDir, 'index.html')
          const html = readFileSync(htmlPath, 'utf-8')
          const critters = new Critters({
            path: distDir,
            preload: 'swap',
            pruneSource: true,
            reduceInlineStyles: true,
            compress: true,
            logLevel: 'silent',
          })
          let out = await critters.process(html)

          // Force non-blocking CSS: convert remaining stylesheet links to preload+swap with noscript fallback.
          out = out.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']+\.css["'][^>]*>/gi, (tag: string) => {
            // Remove rel="stylesheet" and any existing onload to avoid duplicates, keep other attrs (e.g., href, crossorigin).
            const cleaned = tag
              .replace(/<link/i, '')
              .replace(/>/, '')
              .replace(/\srel=["']stylesheet["']/i, '')
              .replace(/\sonload=["'][^"']*["']/i, '')
            return `<link rel="preload" as="style"${cleaned} onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet"${cleaned}></noscript>`
          })

          writeFileSync(htmlPath, out)
          console.log('[critters] Inlined critical CSS and converted to preload+swap in index.html')
        } catch (e: any) {
          console.warn('[critters] skipped:', e?.message || e)
        }
      },
    }
    return plugin
  })()

  return {
    plugins: [
      imagetools(),
      react(),
      criticalCssPlugin,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        ...(isProd ? {
          'react': 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
        } : {}),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core vendor libraries - highest priority
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            
            // Split UI libraries for better caching
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu', 
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-accordion'
            ],
            
            // Utility libraries - medium priority 
            'utils': ['clsx', 'date-fns'],
            'toast': ['react-hot-toast'],
            
            // Feature-specific - lazy loaded
            'supabase': ['@supabase/supabase-js'],
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'motion': ['framer-motion'],
            'charts': ['recharts'],
            'pdf': ['jspdf', 'jspdf-autotable'],
            
            // Icons - now split to optimize initial load (since we inlined most critical ones)
            'icons': ['lucide-react'],
          },
        },
        // Enable aggressive tree shaking
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      // Increase chunk size warning limit since we're optimizing
      chunkSizeWarningLimit: 1000,
      
      // Enable minification and compression
      minify: 'esbuild',
      sourcemap: false, // Disable sourcemaps in production for smaller bundles
      
      // CSS code splitting for better caching
      cssCodeSplit: true,
      
      // Optimize asset handling
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    },
  }
})

