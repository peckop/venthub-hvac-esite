import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const DEGISKENLER = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const

async function siteUrlOku(env: Partial<Record<(typeof DEGISKENLER)[number], string>>): Promise<string> {
  vi.resetModules()
  for (const ad of DEGISKENLER) {
    if (env[ad] === undefined) vi.stubEnv(ad, '')
    else vi.stubEnv(ad, env[ad] as string)
  }
  return (await import('../siteUrl')).SITE_URL
}

describe('SITE_URL — sondaki eğik çizgi kırpması (ALT-15)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('kaynakta sondaki-eğik-çizgi kırpan düzenli ifade YOK (yorumlar hariç)', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src', 'config', 'siteUrl.ts'), 'utf8')
    const kod = kaynak
      .split('\n')
      .filter((satir) => !/^\s*(\/\/|\/\*|\*)/.test(satir))
      .join('\n')
    expect(kod.includes('replace(/\\/+$/')).toBe(false)
  })

  it('davranış eskisiyle aynı: açık yapılandırma, sondaki bir ya da çok `/` atılır', async () => {
    expect(await siteUrlOku({ NEXT_PUBLIC_SITE_URL: 'https://venthub.com.tr' })).toBe('https://venthub.com.tr')
    expect(await siteUrlOku({ NEXT_PUBLIC_SITE_URL: 'https://venthub.com.tr/' })).toBe('https://venthub.com.tr')
    expect(await siteUrlOku({ NEXT_PUBLIC_SITE_URL: 'https://venthub.com.tr///' })).toBe('https://venthub.com.tr')
  })

  it('davranış eskisiyle aynı: Vercel adresleri `https://` ile sarılır, sondaki `/` atılır', async () => {
    expect(await siteUrlOku({ VERCEL_PROJECT_PRODUCTION_URL: 'venthub.com.tr/' })).toBe('https://venthub.com.tr')
    expect(await siteUrlOku({ VERCEL_URL: 'proje-abc.vercel.app//' })).toBe('https://proje-abc.vercel.app')
  })

  it('sıralama bozulmaz: açık yapılandırma > kalıcı production adresi > deploy adresi > localhost', async () => {
    expect(
      await siteUrlOku({
        NEXT_PUBLIC_SITE_URL: 'https://a.example',
        VERCEL_PROJECT_PRODUCTION_URL: 'b.example',
        VERCEL_URL: 'c.example',
      }),
    ).toBe('https://a.example')
    expect(await siteUrlOku({ VERCEL_PROJECT_PRODUCTION_URL: 'b.example', VERCEL_URL: 'c.example' })).toBe(
      'https://b.example',
    )
    expect(await siteUrlOku({ VERCEL_URL: 'c.example' })).toBe('https://c.example')
    expect(await siteUrlOku({})).toBe('http://localhost:3000')
  })

  it('yalnız `/` olan değer boş dizeye iner (eski davranış)', async () => {
    expect(await siteUrlOku({ NEXT_PUBLIC_SITE_URL: '///' })).toBe('')
  })

  it('64.000 ardışık `/` + harf: 250 ms altında', async () => {
    const kotu = `${'/'.repeat(64_000)}x`
    const t0 = performance.now()
    await siteUrlOku({ NEXT_PUBLIC_SITE_URL: kotu })
    expect(performance.now() - t0).toBeLessThan(250)
  })
})
