/**
 * KATALOG · Design ↔ UnoPIM fark betiği (KTL-83) — saf çekirdek + BOZMA testi + CLI önkoşulu. Gerçek DB'ye çıkmaz.
 * Bozma testi: betik farkı gerçekten yakalıyor mu? Temiz fixture'da fark 0, her alan ayrı bozulunca o alanda fark > 0.
 */
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ALANLAR, bozmaUygula, eskiGoruntuler, farkHesapla, icerikSkuFarki, kod, seriMetni } from '../tasarim-unopim-fark-kurallar.mjs'

const BETIK = join(__dirname, '..', 'tasarim-unopim-fark.mjs')

function fixture() {
  const ozet = {
    'vortice-x': {
      hangisi: [], kullanimYeri: { tr: 'Tr yer', en: 'En place' }, kaynak: { tr: 'Kaynak tr', en: 'Kaynak en' },
      ozet: [{ b: { tr: 'B', en: 'B' }, d: { tr: 'D', en: 'D' } }],
    },
  }
  const tr = seriMetni(ozet, 'vortice-x', 'tr')
  const en = seriMetni(ozet, 'vortice-x', 'en')
  return {
    urunler: [{
      sku: 'VRT-1', aile: 'vortice_x', status: 'false',
      v: {
        common: { brand: 'vortice', max_delivery_m3h: { amount: 100 } },
        categories: ['s_vortice_x', 'm_duct_fans'],
        channel_locale_specific: { default: { tr_TR: { name: 'Ad Bir', description: tr!.description, short_description: tr!.short_description }, en_US: { description: en!.description, short_description: en!.short_description } } },
      },
    }],
    ozet,
    skuSeri: new Map([['VRT-1', 'vortice-x']]),
    seriAile: new Map([['vortice-x', 'vortice-x-aile']]),
    aileMarka: new Map([['vortice-x-aile', 'Vortice']]),
    seriDugum: new Map([['vortice-x', 'ticari-fan/duct-fans']]),
    eksik60: {} as Record<string, unknown>,
    adTr: new Map([['VRT-1', 'Ad Bir']]),
    degerCsv: new Map([['VRT-1', { debi_m3h: '100', devir_rpm: '' } as Record<string, string>]]),
  }
}

describe('farkHesapla (temiz fixture)', () => {
  it('her alanda karşılaştırma yapar ve fark 0 verir', () => {
    const s = farkHesapla(fixture())
    for (const a of ALANLAR) {
      expect(s.ozet[a].kontrol, `${a} kontrol`).toBeGreaterThan(0)
      expect(s.ozet[a].fark, `${a} fark`).toBe(0)
    }
  })
  it('kod(): tire alt çizgi olur', () => expect(kod('ticari-fan')).toBe('ticari_fan'))
})

describe('BOZMA testi: her bozma ilgili alanda yakalanır', () => {
  for (const alan of ALANLAR) {
    it(`${alan} bozulunca ${alan} farkı > 0`, () => {
      const s = farkHesapla(bozmaUygula(fixture(), alan))
      expect(s.ozet[alan].fark).toBeGreaterThan(0)
    })
  }
  it('hepsi birden bozulunca altı alanda da fark çıkar', () => {
    const s = farkHesapla(bozmaUygula(fixture()))
    for (const a of ALANLAR) expect(s.ozet[a].fark, a).toBeGreaterThan(0)
  })
  it('bozmaUygula girdiyi değiştirmez', () => {
    const g = fixture()
    bozmaUygula(g)
    expect(farkHesapla(g).ozet.ad.fark).toBe(0)
  })
  it('UnoPIM tarafı bozulursa da yakalanır (marka, ad, kategori)', () => {
    const g = fixture()
    g.urunler[0].v.common.brand = 'seat'
    g.urunler[0].v.categories = ['s_vortice_x']
    g.urunler[0].v.channel_locale_specific.default.tr_TR.name = 'Yanlış'
    const s = farkHesapla(g)
    expect(s.ozet.marka.fark).toBe(1)
    expect(s.ozet.kategori.fark).toBe(1)
    expect(s.ozet.ad.fark).toBe(1)
  })
})

describe('eskiGoruntuler', () => {
  it('eşiği aşan ve yaşı bilinmeyen görüntüyü döndürür', () => {
    const r = eskiGoruntuler([{ ad: 'a', yasGun: 1 }, { ad: 'b', yasGun: 9 }, { ad: 'c', yasGun: Number.NaN }], 7)
    expect(r).toHaveLength(2)
    expect(r[0]).toContain('b')
  })
})

describe('CLI önkoşulu', () => {
  it('anlık görüntü klasörü yoksa çıkış 2 verir ve DB\'ye çıkmaz', () => {
    let kodu = 0
    let cikti = ''
    try {
      execFileSync(process.execPath, [BETIK, '--goruntu', join(__dirname, 'yok-klasor-ktl83')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (e) {
      const h = e as { status: number; stderr: string }
      kodu = h.status
      cikti = h.stderr
    }
    expect(kodu).toBe(2)
    expect(cikti).toContain('anlık görüntü yok')
  })
})

describe('icerikSkuFarki (İÇERİK sku alanıyla eşleme, KTL-87)', () => {
  const dizin = {
    _damga: 'üst bilgi, seri değil',
    a: { modeller: ['EDF-450', '11313'], sku: { 'EDF-450': 'VRT-EDF-450', '11313': 'VRT-11313' } },
    b: { modeller: ['11313'], sku: { '11313': 'VRT-11313' } },
  }
  it('seri, model ve tekil sayar; _damga seri değildir', () => {
    const s = icerikSkuFarki(dizin, ['VRT-EDF-450', 'VRT-11313'])
    expect(s).toMatchObject({ seri: 2, model: 3, tekil: 2 })
  })
  it('aynı sku iki seride çift olarak raporlanır', () => {
    expect(icerikSkuFarki(dizin, ['VRT-EDF-450', 'VRT-11313']).cift).toEqual([{ sku: 'VRT-11313', seriler: ['a', 'b'] }])
  })
  it('BOZMA: UnoPIM dışında kalan ve İÇERİK dışında kalan sku yakalanır, öneksiz kod eşleşmez', () => {
    const s = icerikSkuFarki(dizin, ['VRT-11313', 'SEA-1'])
    expect(s.unopimdeYok).toEqual(['VRT-EDF-450'])
    expect(s.icerikteYok).toEqual(['SEA-1'])
    // öneksiz katalog koduyla (D anahtarı) eşleme yapılsaydı EDF-450 UnoPIM'de var sayılırdı: sku alanı bunu yapmaz
    expect(icerikSkuFarki(dizin, ['EDF-450', 'VRT-11313']).unopimdeYok).toContain('VRT-EDF-450')
  })
  it('boş girdi hata vermez', () => {
    expect(icerikSkuFarki(undefined, [])).toMatchObject({ seri: 0, model: 0, tekil: 0 })
  })
})
