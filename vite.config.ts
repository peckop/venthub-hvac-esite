import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { imagetools } from 'vite-imagetools'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    plugins: [
      imagetools(),
      react(),
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

