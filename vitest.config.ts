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
    css: true,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 8000,
    hookTimeout: 6000,
    teardownTimeout: 4000,
    onConsoleLog(log, type) {
      // AccountSecurity testindeki beklenen hata mesajını (stderr) CI çıkış kodunu bozmaması için filtreleyelim
      if (type === 'stderr' && typeof log === 'string' && log.includes('update failed')) {
        return false
      }
    },
  },
})

