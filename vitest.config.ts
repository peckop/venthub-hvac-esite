import react from "@vitejs/plugin-react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - NodeJS path module is available in the Vite environment but may lack explicit root types in some environments
import * as path from "path"
import type { PluginOption } from 'vite';
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react() as PluginOption],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "https://esm.sh/@supabase/supabase-js@2.45.4": "@supabase/supabase-js",
      "https://esm.sh/@supabase/supabase-js@2.39.3": "@supabase/supabase-js",
      "https://esm.sh/@supabase/supabase-js@2": "@supabase/supabase-js",
      "https://esm.sh/zod@3.23.8": "zod",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ['vitest.setup.ts', 'vitest-setup.tsx'],
    css: true,
    server: {
      deps: {
        inline: [/supabase\/functions/],
      },
    },
    // Use threads pool (default) for better stability on Windows/CI
    pool: 'threads',
    testTimeout: 20000,
    hookTimeout: 12000,
    teardownTimeout: 8000,
    onConsoleLog(log, type) {
      // AccountSecurity testindeki beklenen hata mesajını (stderr) CI çıkış kodunu bozmaması için filtreleyelim
      if (type === 'stderr' && typeof log === 'string' && log.includes('update failed')) {
        return false
      }
      // React Router future flag uyarılarını test çıktısından filtrele
      if (type === 'stderr' && typeof log === 'string' && log.includes('React Router Future Flag Warning')) {
        return false
      }
    },
  },
})

