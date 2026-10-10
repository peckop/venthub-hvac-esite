/**
 * ALT-38d · test haritası ÖLÇÜM yapılandırması. `vitest.config.ts`e DOKUNMAZ: onu içe aktarır, kurulum dosyalarını sarar
 * (kaydedici ilk, kapanış son) ve vite'ın ANA SÜREÇTE yaptığı `?raw` okumalarını ölçen bir eklenti ekler.
 * Yalnız `scripts/ci/test-haritasi-uret.cjs` kullanır; PR kapısı ve `pnpm test` bunu YÜKLEMEZ.
 * Kullanım: `node node_modules/vitest/vitest.mjs run --config scripts/ci/test-haritasi.vitest.config.ts`
 * (ortam: VENTHUB_HARITA_KLASOR, VENTHUB_HARITA_KOK).
 *
 * NİÇİN EKLENTİ: `import.meta.glob('/src/**', { query: '?raw' })` (78 test) dosyaları vite'ın ana sürecinde okur ve test
 * modülünün içine GÖMER; işçi tarafındaki `fs` yakalayıcısı bunu GÖREMEZ (ölçüldü: 3d-asset-validity yalnız anlık görüntü
 * dosyasını okumuş görünür). Eklenti, dönüşüm SONRASI koddaki `?raw` içe aktarmalarını (= vite'ın gerçekten okuduğu dosyalar)
 * test başına `glob-olcum.jsonl` dosyasına yazar; üretici bunu kaynaktan çıkardığı desenlerle çapraz doğrular.
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

import temel from '../../vitest.config'

const temelKurulum = temel.test?.setupFiles
const temelKurulumDizisi = Array.isArray(temelKurulum) ? temelKurulum : temelKurulum ? [temelKurulum] : []

/** Dönüşüm SONRASI kodda `from "<yol>?raw"` ve `import("<yol>?raw")` biçimleri (vite glob genişlemesi ve doğrudan `?raw`). */
const RAW_ICE_AKTARMA = /(?:from\s*|import\s*\(\s*)["']([^"'\n]+\?(?:raw|url|inline)[^"'\n]*)["']/g

function ham(): Plugin {
  const klasor = process.env.VENTHUB_HARITA_KLASOR
  return {
    name: 'venthub-test-haritasi-raw-olcer',
    enforce: 'post',
    transform(kod, kimlik) {
      if (!klasor || !kod.includes('?')) return null
      const bulunan = new Set<string>()
      for (const eslesme of kod.matchAll(RAW_ICE_AKTARMA)) bulunan.add(eslesme[1])
      if (bulunan.size === 0) return null
      mkdirSync(klasor, { recursive: true })
      appendFileSync(join(klasor, 'glob-olcum.jsonl'), `${JSON.stringify({ kimlik, raw: [...bulunan].sort() })}\n`)
      return null
    },
  }
}

export default defineConfig({
  ...temel,
  plugins: [...(temel.plugins ?? []), ham()],
  test: {
    ...temel.test,
    setupFiles: ['scripts/ci/test-haritasi-kurulum.ts', ...temelKurulumDizisi, 'scripts/ci/test-haritasi-kurulum-son.ts'],
  },
})
