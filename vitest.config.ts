import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ['vitest.setup.ts'],
    css: true,
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
    },
  },
})

