import { spawn } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  KALAN_AZAMI,
  degisecekMi,
  degismeyenleriAyir,
  kanonikAdres,
  suzgecliKapi,
} from '../../../../scripts/seo/yayin-kapisi.mjs'

/**
 * INV-INDEXNOW-SUZGEC-1 · karar 249 daraltması (OPS 10-03): bayrak KAPALIYKEN toplu IndexNow betiği YALNIZ yayında
 * DEĞİŞMEYEN adresleri bildirebilir. Ürün, kategori ve marka ağaçları (dizin sayfaları dahil, `tr` ve `en`) değişecek
 * türdür (K4 / karar 164 A). Kural KALIPTIR; adres listesi yoktur. Ölçüm 2026-10-03: canlı sitemap 87 adres, 78'i bu
 * kalıpta, 9'u dışında.
 */

const KOK = resolve(__dirname, '../../../..')
const FEATURES_KAPALI = 'export const ADRES_SEMASI_K3B = false\n'
const FEATURES_ACIK = 'export const ADRES_SEMASI_K3B = true\n'

const DEGISMEYEN = [
  'https://venthub.com.tr/tr',
  'https://venthub.com.tr/tr/about',
  'https://venthub.com.tr/tr/contact',
  'https://venthub.com.tr/tr/legal/gizlilik',
  'https://venthub.com.tr/tr/legal/cerez',
  'https://venthub.com.tr/tr/legal/kvkk',
  'https://venthub.com.tr/tr/bilgi-merkezi',
  'https://venthub.com.tr/tr/bilgi-merkezi/frekans-konvertoru-nedir',
  'https://venthub.com.tr/tr/urun-secici',
]

const DEGISECEK = [
  'https://venthub.com.tr/tr/products',
  'https://venthub.com.tr/tr/products/avens-bvu-ls',
  'https://venthub.com.tr/tr/category/hava-perdeleri',
  'https://venthub.com.tr/tr/category/fanlar/aksiyel-sanayi-fanlari',
  'https://venthub.com.tr/tr/brands',
  'https://venthub.com.tr/tr/brands/avens',
  'https://venthub.com.tr/en/products/avens-bvu-ls',
  'https://venthub.com.tr/en/category/air-curtains',
  'https://venthub.com.tr/en/brands/avens',
]

describe('INV-INDEXNOW-SUZGEC-1 · degisecekMi (tür kuralı)', () => {
  it('⭐ayırt edici: 9 değişmeyen adres geçer, ürün/kategori/marka ağaçları (dizin sayfaları dahil) atılır', () => {
    for (const a of DEGISMEYEN) expect(degisecekMi(a), a).toBe(false)
    for (const a of DEGISECEK) expect(degisecekMi(a), a).toBe(true)
  })

  it('sondaki /, sorgu, #, büyük harf, çift /, yüzde-kodlu ve göreli adres süzgeci DELMEZ', () => {
    for (const a of [
      'https://venthub.com.tr/tr/products/',
      'https://venthub.com.tr/tr/products?sayfa=2',
      'https://venthub.com.tr/tr/products#x',
      'https://venthub.com.tr/TR/Products/Avens',
      'https://venthub.com.tr//tr//category//fanlar',
      'https://venthub.com.tr/tr/%70roducts/avens',
      '/tr/brands/avens',
    ]) {
      expect(degisecekMi(a), a).toBe(true)
    }
  })

  it('çözülemeyen adres "değişecek" sayılır (güvenli yön)', () => {
    expect(degisecekMi('https://venthub.com.tr/tr/%E0%A4%A')).toBe(true)
  })

  it('⭐İZİN LİSTESİ (fail-closed): tanınmayan her adres "değişecek" sayılır, yeni şema bölümleri ve dilsiz/başka dil dahil', () => {
    for (const a of [
      // bayrak açılınca doğacak yeni şema bölümleri (src/utils/yuzeyAdresleri.ts YENI_BOLUM)
      'https://venthub.com.tr/tr/urunler',
      'https://venthub.com.tr/tr/urun/x-p-1',
      'https://venthub.com.tr/tr/kategori/fanlar/aksiyel',
      'https://venthub.com.tr/tr/markalar/avens',
      // dilsiz, başka dil, dil öneki tuzakları
      'https://venthub.com.tr/products',
      'https://venthub.com.tr/de/products',
      'https://venthub.com.tr/tr-TR/products',
      'https://venthub.com.tr/en/about',
      'https://venthub.com.tr/about',
      // ön ek tuzakları: izin listesindeki kök adların uzantıları
      'https://venthub.com.tr/tr/aboutx',
      'https://venthub.com.tr/tr/legalx',
      'https://venthub.com.tr/tr/productsx',
      // yol dolaşımı ve kaçışlar
      'https://venthub.com.tr/tr/%2e%2e/products',
      'https://venthub.com.tr/tr/legal/../products',
      'https://venthub.com.tr/tr/products;x',
      'https://venthub.com.tr/tr/products%00',
      // gelecekte eklenebilecek, bilinmeyen tür
      'https://venthub.com.tr/tr/yeni-tur/x',
    ]) {
      expect(degisecekMi(a), a).toBe(true)
    }
  })

  it('izin listesindeki türler sondaki /, sorgu, # ve büyük harfle de değişmeyen kalır', () => {
    for (const a of [
      'https://venthub.com.tr/tr/',
      'https://venthub.com.tr/TR/About/',
      'https://venthub.com.tr/tr/legal/kvkk?x=1',
      'https://venthub.com.tr/tr/bilgi-merkezi/yazi-adi#bolum',
    ]) {
      expect(degisecekMi(a), a).toBe(false)
    }
  })

  it('degismeyenleriAyir: kalan ve atılan ayrı, sıra korunur, toplam eşit', () => {
    const karisik = [...DEGISECEK.slice(0, 3), ...DEGISMEYEN.slice(0, 2), ...DEGISECEK.slice(3)]
    const { kalan, atilan } = degismeyenleriAyir(karisik)
    expect(kalan).toEqual(DEGISMEYEN.slice(0, 2))
    expect(atilan).toEqual([...DEGISECEK.slice(0, 3), ...DEGISECEK.slice(3)])
    expect(kalan.length + atilan.length).toBe(karisik.length)
  })
})

describe('INV-INDEXNOW-SUZGEC-1 · suzgecliKapi', () => {
  it('bayrak KAPALI + yalnız 9 değişmeyen adres → izin var', () => {
    expect(suzgecliKapi(FEATURES_KAPALI, DEGISMEYEN)).toEqual({ izin: true })
  })

  it('⭐sabotaj: süzgeç bir ürün/kategori/marka adresini SIZDIRIRSA kapı reddeder, sızan adres sebepte görünür', () => {
    for (const sizan of DEGISECEK) {
      const k = suzgecliKapi(FEATURES_KAPALI, [...DEGISMEYEN, sizan])
      expect(k.izin, sizan).toBe(false)
      if (k.izin) continue
      expect(k.sebep).toContain('K4')
      expect(k.sebep).toContain(sizan)
    }
  })

  it('⭐boş küme DURDURUR (bayrak kapalı da açık da): boş listeyi bildirmek ölçüm değildir', () => {
    expect(suzgecliKapi(FEATURES_KAPALI, []).izin).toBe(false)
    expect(suzgecliKapi(FEATURES_ACIK, []).izin).toBe(false)
  })

  it('⭐üst sınır: kalan KALAN_AZAMI\'yi aşarsa (sitemap\'e yeni tür girdi) bayrak açık da kapalı da DURDURUR', () => {
    const cok = Array.from({ length: KALAN_AZAMI + 1 }, (_, i) => `https://venthub.com.tr/tr/bilgi-merkezi/yazi-${i}`)
    expect(suzgecliKapi(FEATURES_KAPALI, cok).izin).toBe(false)
    expect(suzgecliKapi(FEATURES_ACIK, cok).izin).toBe(false)
    expect(suzgecliKapi(FEATURES_KAPALI, cok.slice(0, KALAN_AZAMI)).izin).toBe(true)
  })

  it('⭐kapı süzgeçten BAĞIMSIZ: değişmeyen olarak tanınmayan adres kalan listeye kaçsa da reddeder (yeni şema bölümleri dahil)', () => {
    for (const sizan of ['https://venthub.com.tr/tr/urunler', 'https://venthub.com.tr/tr/kategori/x', 'https://venthub.com.tr/products']) {
      const k = suzgecliKapi(FEATURES_KAPALI, [...DEGISMEYEN, sizan])
      expect(k.izin, sizan).toBe(false)
    }
  })

  it('bayrak AÇIK → izin listesi dışı adresler de geçer (yayın günü: süzgeç gerekmez), sınır içinde kalmak şartıyla', () => {
    expect(suzgecliKapi(FEATURES_ACIK, DEGISECEK)).toEqual({ izin: true })
  })

  it('bayrak satırı bulunamazsa SESSİZCE izin vermez, hata fırlatır', () => {
    expect(() => suzgecliKapi('export const BASKA = true\n', DEGISMEYEN)).toThrow(/ADRES_SEMASI_K3B/)
  })
})

describe('INV-INDEXNOW-SUZGEC-1 · kanonikAdres', () => {
  it('rel/href sırası ve tırnak biçimi fark etmez, canonical olmayan link yok sayılır', () => {
    expect(kanonikAdres('<link rel="canonical" href="https://a.test/x">')).toBe('https://a.test/x')
    expect(kanonikAdres('<link href="https://a.test/y" rel="canonical"/>')).toBe('https://a.test/y')
    expect(kanonikAdres("<link rel='canonical' href='https://a.test/z'>")).toBe('https://a.test/z')
    expect(
      kanonikAdres('<link rel="alternate" href="https://a.test/en"><link rel="canonical" href="https://a.test/tr">'),
    ).toBe('https://a.test/tr')
    expect(kanonikAdres('<link rel="alternate" href="https://a.test/en">')).toBeNull()
    expect(kanonikAdres('<html><body>link yok</body></html>')).toBeNull()
  })

  it('⭐yorum içindeki canonical sayılmaz; birden çok FARKLI canonical belirsizdir (null), aynı adres iki kez geçerli', () => {
    expect(kanonikAdres('<!-- <link rel="canonical" href="https://a.test/yorum"> --><link rel="canonical" href="https://a.test/gercek">')).toBe(
      'https://a.test/gercek',
    )
    expect(kanonikAdres('<!-- <link rel="canonical" href="https://a.test/yorum"> -->')).toBeNull()
    expect(kanonikAdres('<link rel="canonical" href="https://a.test/a"><link rel="canonical" href="https://a.test/b">')).toBeNull()
    expect(kanonikAdres('<link rel="canonical" href="https://a.test/a"><link rel="canonical" href="https://a.test/a">')).toBe('https://a.test/a')
  })
})

// ───────────────────────────── betik uçtan uca (yerel sunucu; ağ yok, hiçbir şey gönderilmez) ─────────────────────────────

type Sonuc = { kod: number | null; stdout: string; stderr: string }

function betigiKos(site: string): Promise<Sonuc> {
  return new Promise((coz) => {
    const cocuk = spawn(
      process.execPath,
      ['scripts/seo/indexnow-bildir.mjs', '--site', site, '--yalniz-degismeyen', '--kuru'],
      { cwd: KOK, env: { ...process.env, INDEXNOW_KEY: 'test-anahtar' } },
    )
    let stdout = ''
    let stderr = ''
    cocuk.stdout.on('data', (d: Buffer) => (stdout += d.toString()))
    cocuk.stderr.on('data', (d: Buffer) => (stderr += d.toString()))
    cocuk.on('close', (kod) => coz({ kod, stdout, stderr }))
  })
}

describe('INV-INDEXNOW-SUZGEC-1 · indexnow-bildir.mjs --yalniz-degismeyen --kuru (yerel sunucu)', () => {
  let sunucu: Server | null = null

  afterEach(() => {
    sunucu?.close()
    sunucu = null
  })

  /** sayfalar: yol → { durum, kanonikYol } */
  async function sunucuAc(
    sitemapYollari: string[],
    sayfalar: Record<string, { durum: number; kanonikYol?: string }>,
  ): Promise<string> {
    let taban = ''
    sunucu = createServer((istek, yanit) => {
      const yol = istek.url ?? '/'
      if (yol === '/sitemap.xml') {
        const govde = sitemapYollari.map((y) => `<url><loc>${taban}${y}</loc></url>`).join('')
        yanit.writeHead(200, { 'content-type': 'application/xml' })
        yanit.end(`<?xml version="1.0"?><urlset>${govde}</urlset>`)
        return
      }
      const s = sayfalar[yol]
      if (!s) {
        yanit.writeHead(404)
        yanit.end('yok')
        return
      }
      yanit.writeHead(s.durum, { 'content-type': 'text/html' })
      yanit.end(`<html><head><link rel="canonical" href="${taban}${s.kanonikYol ?? yol}"></head></html>`)
    })
    await new Promise<void>((tamam) => sunucu!.listen(0, '127.0.0.1', tamam))
    taban = `http://127.0.0.1:${(sunucu!.address() as AddressInfo).port}`
    return taban
  }

  const SAGLAM = {
    '/tr': { durum: 200 },
    '/tr/about': { durum: 200 },
    '/tr/legal/kvkk': { durum: 200 },
  }
  const YOLLAR = ['/tr', '/tr/about', '/tr/legal/kvkk', '/tr/products', '/tr/products/avens-bvu-ls', '/tr/category/hava-perdeleri', '/tr/brands/avens']

  it('⭐ürün/kategori/marka atılır, yalnız değişmeyenler basılır, çıkış 0, hiçbir şey gönderilmez', async () => {
    const site = await sunucuAc(YOLLAR, SAGLAM)
    const r = await betigiKos(site)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('atildi): 4')
    expect(r.stdout).toContain('kalan (degismeyen): 3')
    expect(r.stdout).toContain(`${site}/tr/about`)
    expect(r.stdout).not.toContain('/products')
    expect(r.stdout).not.toContain('/category')
    expect(r.stdout).not.toContain('/brands')
    expect(r.stdout).toContain('KURU KOSUM')
    expect(r.stdout).not.toContain('IndexNow yanit')
  }, 30000)

  it('⭐bir kalan adres 200 vermiyorsa DURUR', async () => {
    const site = await sunucuAc(YOLLAR, { ...SAGLAM, '/tr/about': { durum: 500 } })
    const r = await betigiKos(site)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DURDU')
    expect(r.stderr).toContain('/tr/about')
  }, 30000)

  it('⭐bir kalan adres 308 ile yönlendiriyorsa DURUR (yönlendirme takip edilmez, hata satırı gerçek durumu yazar)', async () => {
    const site = await sunucuAc(YOLLAR, { ...SAGLAM, '/tr/about': { durum: 308 } })
    const r = await betigiKos(site)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('/tr/about')
    expect(r.stderr).toContain('308')
  }, 30000)

  it('⭐bir kalan adresin kanonik adresi kendisi değilse DURUR', async () => {
    const site = await sunucuAc(YOLLAR, { ...SAGLAM, '/tr/legal/kvkk': { durum: 200, kanonikYol: '/tr/baska' } })
    const r = await betigiKos(site)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('/tr/legal/kvkk')
    expect(r.stderr).toContain('kanonik')
  }, 30000)

  it('⭐haritada yalnız değişecek adres varsa (hepsi atılır) boş küme DURDURUR', async () => {
    const site = await sunucuAc(['/tr/products', '/tr/category/hava-perdeleri', '/tr/brands/avens'], {})
    const r = await betigiKos(site)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('HİÇ adres kalmadı')
  }, 30000)
})
