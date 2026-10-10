// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { markaYonlendirmeleri } from '../../../config/markaYonlendirmeleri.mjs'

/**
 * A9 SIÇRAMA BÜTÇESİ (adres-semasi-standard.md): rota dili anahtarı AÇIKKEN her eski adres en çok TEK sıçramayla
 * yeni adrese varır (OPS-52 PR-C2). Ölçüm gerçek düzeneği taklit eder: önce `next.config` yönlendirmeleri
 * (gerçek 49 kural + rota dili kuralları), sonra GERÇEK `middleware` fonksiyonu; her yönlendirme bir sıçramadır.
 * Rewrite aşaması sayfayı üretir, sıçrama sayılmaz.
 */
const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]
const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
const EN = 'en-US,en;q=0.9'
const EN_HOP = 6

type Kural = { source: string; destination: string }

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.doUnmock('@/config/features')
  vi.doUnmock('@/lib/adres/haritaKaynagi')
  vi.resetModules()
})

/** Next desen kaynağını (`/:lang(tr|en)/…`, `/:ad*`, `/:ad`) düzenli ifadeye çevirir. */
function kaynakDeseni(kaynak: string): RegExp {
  const govde = kaynak
    .replace(/\/:lang\(tr\|en\)/, '/(?<lang>tr|en)')
    .replace(/\/:([A-Za-z]+)\*$/, '(?<$1>(?:/.*)?)')
    .replace(/\/:([A-Za-z]+)(?![A-Za-z(*])/g, '/(?<$1>[^/]+)')
  return new RegExp(`^${govde}$`)
}

/** İlk eşleşen config yönlendirmesini uygular (Next sırası); eşleşme yoksa null. */
function configUygula(kurallar: Kural[], yol: string, arama: string): string | null {
  for (const k of kurallar) {
    const m = kaynakDeseni(k.source).exec(yol)
    if (!m) continue
    const [hedefYol, hedefSorgu = ''] = k.destination.split('?')
    const doldurulan = hedefYol.replace(/:([A-Za-z]+)/g, (_t, ad: string) => m.groups?.[ad] ?? '')
    return `${doldurulan}${hedefSorgu ? `?${hedefSorgu}` : arama}`
  }
  return null
}

interface Kosul {
  anahtar: string
  k3b?: boolean
}

/** Bir adresi izler: config → middleware → … ; sıçrama sayısını ve son adresi verir. */
async function izle(baslangic: string, dilBasligi: string, kosul: Kosul) {
  process.env[ANAHTAR] = kosul.anahtar
  vi.resetModules()
  if (kosul.k3b) {
    vi.doMock('@/config/features', async (asil) => ({ ...(await asil<typeof import('@/config/features')>()), ADRES_SEMASI_K3B: true }))
    vi.doMock('@/lib/adres/haritaKaynagi', async () => ({ ESKI_ADRES_HARITASI: (await import('./fikstur')).FIKSTUR_DOSYASI }))
  }
  const { default: yapilandirma } = await import('../../../../next.config.mjs')
  const yapilandirmaKurallari = ((await yapilandirma.redirects?.()) ?? []) as Kural[]
  // K3B açıkken config'in marka kuralları da K3B'li hedefe gider (next.config bayrağı dosyadan okur; testte elle).
  const kurallar = kosul.k3b ? [...yapilandirmaKurallari, ...markaYonlendirmeleri(true)] : yapilandirmaKurallari
  const { middleware } = await import('@/middleware')

  let gecerli = baslangic
  const yol: string[] = [baslangic]
  for (let hop = 0; hop <= EN_HOP; hop++) {
    const [p, ...sorgu] = gecerli.split('?')
    const arama = sorgu.length ? `?${sorgu.join('?')}` : ''
    const configHedefi = configUygula(kurallar, p, arama)
    let sonraki = configHedefi
    if (sonraki === null) {
      const req = new NextRequest(new URL(gecerli, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', 'accept-language': dilBasligi } })
      const res = await middleware(req)
      const konum = res.headers.get('location')
      if (konum) sonraki = new URL(konum).pathname + new URL(konum).search
    }
    if (sonraki === null) return { hop, son: gecerli, yol }
    gecerli = sonraki
    yol.push(gecerli)
  }
  return { hop: EN_HOP + 1, son: gecerli, yol }
}

const TUM_KOSULLAR: [string, Kosul][] = [
  ['K3B kapalı', { anahtar: '1' }],
  ['K3B açık', { anahtar: '1', k3b: true }],
]

describe.each(TUM_KOSULLAR)('A9 sıçrama bütçesi — anahtar AÇIK, %s', (_ad, kosul) => {
  it.each([
    ['/about', TR_CHROME, '/tr/hakkimizda', 1],
    ['/about', EN, '/en/about', 1],
    ['/contact', TR_CHROME, '/tr/iletisim', 1],
    ['/contact', EN, '/en/contact', 1],
    ['/contact?dept=satis', TR_CHROME, '/tr/iletisim?dept=satis', 1],
    ['/contact?dept=satis', EN, '/en/contact?dept=satis', 1],
    // Dilli eski adres: tek 308 (config), middleware dokunmaz.
    ['/tr/about', TR_CHROME, '/tr/hakkimizda', 1],
    ['/tr/contact', EN, '/tr/iletisim', 1],
    ['/tr/contact?dept=satis', TR_CHROME, '/tr/iletisim?dept=satis', 1],
    // Yeni ve değişmeyen adresler: sıçrama YOK.
    ['/tr/hakkimizda', TR_CHROME, '/tr/hakkimizda', 0],
    ['/tr/iletisim', TR_CHROME, '/tr/iletisim', 0],
    ['/en/about', EN, '/en/about', 0],
    ['/en/contact', EN, '/en/contact', 0],
  ])('%s (%s) → %s, en çok %i sıçrama', async (baslangic, dil, hedef, hop) => {
    const r = await izle(baslangic, dil, kosul)
    expect(r.son, r.yol.join(' → ')).toBe(hedef)
    expect(r.hop, r.yol.join(' → ')).toBe(hop)
  }, 30_000)

  it('hedef hiçbir kuralla yeniden eşleşmez: dilsiz/dilli her eski adrese varan yeni adres kararlıdır (0 sıçrama)', async () => {
    for (const hedef of ['/tr/hakkimizda', '/tr/iletisim', '/en/about', '/en/contact', '/tr/iletisim?dept=satis']) {
      const r = await izle(hedef, TR_CHROME, kosul)
      expect(r.hop, hedef).toBe(0)
    }
  }, 30_000)

  it('Aşama 2 yüzeyleri bugünkü akışta: dilsiz /cart /account /checkout tek 307, dilli olanlar sıçramasız', async () => {
    for (const yol of ['/cart', '/account', '/checkout']) {
      const r = await izle(yol, TR_CHROME, kosul)
      expect(r.son, yol).toBe(`/tr${yol}`)
      expect(r.hop, yol).toBe(1)
    }
    for (const yol of ['/tr/cart', '/tr/account/orders', '/en/checkout']) {
      expect((await izle(yol, TR_CHROME, kosul)).hop, yol).toBe(0)
    }
  }, 30_000)
})

describe('⛔SABOTAJ — kol olmasaydı bütçe aşılırdı (ölçüm ayırt ediyor)', () => {
  it('ikinci sıçramanın kaynağı gerçek: config /tr/about → /tr/hakkimizda 308 veriyor (kolsuz /about = 307 + 308); kolla bir', async () => {
    // Kolsuz davranış: bugünkü dil öneki 307'si, ardından config'in /tr/about → /tr/hakkimizda 308'i.
    // (Kolu kaldırma mutasyonu bu dosyanın dilsiz /about satırlarını kırmızı yaktı; bkz. PR raporu.)
    process.env[ANAHTAR] = '1'
    vi.resetModules()
    const { default: yapilandirma } = await import('../../../../next.config.mjs')
    const kurallar = ((await yapilandirma.redirects?.()) ?? []) as Kural[]
    const ikinci = configUygula(kurallar, '/tr/about', '')
    expect(ikinci, 'config kuralı /tr/about → /tr/hakkimizda olmalı (kolsuz ikinci sıçrama kaynağı)').toBe('/tr/hakkimizda')
    expect((await izle('/about', TR_CHROME, { anahtar: '1' })).hop).toBe(1)
  }, 30_000)

  it('kapalı kipte benzetim bugünkü davranışı verir: /about tek 307 → /tr/about (config rota dili kuralı yok)', async () => {
    const r = await izle('/about', TR_CHROME, { anahtar: '0' })
    expect(r).toMatchObject({ hop: 1, son: '/tr/about' })
  }, 30_000)
})
