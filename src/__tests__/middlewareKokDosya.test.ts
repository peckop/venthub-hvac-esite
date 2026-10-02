// @vitest-environment node
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { middleware } from '@/middleware'

/**
 * INV-KOK-DOSYA-1 (URN-15) — kök `.txt`/`.xml` muafiyeti YALNIZ bilinen dosyalara.
 *
 * NİÇİN VAR (2026-10-02, canlıda ölçüldü): REC-127 kök seviyedeki HER `.txt`yi dil yönlendirmesinden
 * muaf tutuyordu; `/ai.txt`, `/llms-full.txt`, `/humans.txt`, `/ads.txt`, `/security.txt`,
 * `/news-sitemap.xml`, `/xyz.txt` `[lang]` rotasına dil değeri olarak düşüp 500 (`RangeError:
 * Incorrect locale information provided at new Collator`) veriyordu. Bu tablo iki yönü de sabitler:
 * bilinen dosya muaf kalır, bilinmeyen ad doğrudan 404 olur.
 */
async function iste(yol: string) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } })
  const res = await middleware(req)
  const l = res.headers.get('location')
  return { durum: res.status, yol: l ? new URL(l).pathname : null }
}

const INDEXNOW_DOSYASI = '/e4468e39c3131f38c51ffc73fab38c99.txt'

describe('middleware — bilinen kök dosyalar dil önekinden muaf', () => {
  it.each(['/robots.txt', '/llms.txt', '/use.txt', '/sitemap.xml', INDEXNOW_DOSYASI])(
    '%s → yönlendirme ve 404 yok, olduğu gibi servis edilir',
    async (yol) => {
      const r = await iste(yol)
      expect(r.durum).toBe(200)
      expect(r.yol).toBeNull()
    },
  )
})

describe('middleware — bilinmeyen kök .txt/.xml adresleri doğrudan 404', () => {
  it.each([
    '/ai.txt',
    '/llms-full.txt',
    '/humans.txt',
    '/ads.txt',
    '/security.txt',
    '/news-sitemap.xml',
    '/xyz.txt',
    '/ROBOTS.txt',
    '/ai.txt/',
    // IndexNow anahtarı gibi görünmeyen, 32 hane olmayan onaltılık adlar da muaf DEĞİL.
    '/e4468e39c3131f38c51ffc73fab38c9.txt',
    '/e4468e39c3131f38c51ffc73fab38c99a.txt',
  ])('%s → 404 (dil yönlendirmesi ve 500 yok)', async (yol) => {
    const r = await iste(yol)
    expect(r.durum).toBe(404)
    expect(r.yol).toBeNull()
  })
})

describe('middleware — kök dışındaki .txt/.xml ve uzantısız adresler eskisi gibi', () => {
  it('derin sitemap.xml artık muaf değil: dil öneki eklenir', async () => {
    const r = await iste('/products/sitemap.xml')
    expect(r.durum).toBe(307)
    expect(r.yol).toBe('/tr/products/sitemap.xml')
  })

  it('dil önekli adres bu kuraldan etkilenmez', async () => {
    const r = await iste('/tr/sitemap.xml')
    expect(r.durum).toBe(200)
  })

  it('uzantısız kök adres dil önekiyle yönlenir', async () => {
    const r = await iste('/hakkimizda')
    expect(r.durum).toBe(307)
    expect(r.yol).toBe('/tr/hakkimizda')
  })
})

describe('INV-KOK-DOSYA-1 — public/ kökündeki her .txt muaf kalır', () => {
  // Biri `public/`a yeni bir kök `.txt` koyup `src/utils/kokDosya.ts` listesine eklemeyi unutursa
  // dosya canlıda sessizce 404 olurdu; bu test o unutmayı kırmızıya çevirir.
  const dosyalar = readdirSync(join(process.cwd(), 'public')).filter((a) => a.endsWith('.txt'))

  it('public/ kökünde en az bir .txt var (test kör değil)', () => {
    expect(dosyalar.length).toBeGreaterThan(0)
  })

  it.each(dosyalar)('/%s → 404 değil', async (ad) => {
    const r = await iste(`/${ad}`)
    expect(r.durum).not.toBe(404)
  })
})
