import { defineConfig } from 'vitest/config'

/**
 * SSR duman kilidi için AYRI koşum (REC-134).
 *
 * NİÇİN AYRI: `tests/smoke/**` varsayılan vitest kapsamındaydı ve `ci`'nin Test
 * adımı onu topluyordu. Kilit fail-closed olunca (env yoksa DÜŞ) varsayılan
 * kapsamda kalması `ci`'yi ayakta bir sunucu olmadan kırmızı yapardı — kapı,
 * ölçebildiği yerde durmalı. `vitest.config.ts` bu dizini exclude eder; burası
 * onu TEK BAŞINA toplar. İki dosya birlikte tek karar verir: smoke yalnız
 * kendi koşumunda çalışır.
 *
 * environment: 'node' — burada DOM yok, sunucunun ÜRETTİĞİ ham HTML ölçülüyor;
 * jsdom kurmak boşa maliyet ve yanıltıcı (ölçülen şey tarayıcı davranışı değil).
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/smoke/**/*.spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
