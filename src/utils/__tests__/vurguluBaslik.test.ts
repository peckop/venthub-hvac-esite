import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { vurguluBaslikParcalari } from '../vurguluBaslik'

/**
 * INV-BASLIK-VURGU-1 — başlıkta marka vurgusu sözlük metnini ASLA değiştirmez (URN-101, 2026-10-10).
 *
 * NİÇİN VAR: canlıda kategori sayfasında "Katalogda Neler Var?VentHub" (EN: "What the Catalogue OffersVentHub"):
 * bileşen başlığı 'VentHub'tan bölüp markayı sonuna ekliyordu; sözlük metni marka adını içermeyince ekleme
 * kalıcı oldu. Yani ekran metni sözlük metninden farklıydı.
 *
 * BU KAPI NE ÖLÇER: (1) parçalayıcı sözleşmesi; (2) her iki sözlükte `once + vurgulu + sonra` başlığın AYNISI;
 * (3) eski `.split('VentHub')` kalıbı vitrin kodunda geri gelmez.
 *
 * ÖLÇMEDİĞİ: tarayıcıda görsel (yayın sonrası canlıda ölçülür).
 */

function birlestir(p: ReturnType<typeof vurguluBaslikParcalari>): string {
  return p.once + (p.vurgulu ?? '') + p.sonra
}

describe('INV-BASLIK-VURGU-1 — parçalayıcı', () => {
  it('marka başlıkta geçiyorsa böler ve vurgulanacak parça markanın kendisidir', () => {
    const p = vurguluBaslikParcalari('Neden VentHub?', 'VentHub')
    expect(p).toEqual({ once: 'Neden ', vurgulu: 'VentHub', sonra: '?' })
  })

  it('marka başlıkta geçmiyorsa başlık düz döner, marka EKLENMEZ (canlı kusur)', () => {
    const p = vurguluBaslikParcalari('Katalogda Neler Var?', 'VentHub')
    expect(p).toEqual({ once: 'Katalogda Neler Var?', vurgulu: null, sonra: '' })
  })

  it('başta, sonda ve boş marka durumları', () => {
    expect(vurguluBaslikParcalari('VentHub nedir', 'VentHub')).toEqual({ once: '', vurgulu: 'VentHub', sonra: ' nedir' })
    expect(vurguluBaslikParcalari('Hakkında VentHub', 'VentHub')).toEqual({ once: 'Hakkında ', vurgulu: 'VentHub', sonra: '' })
    expect(vurguluBaslikParcalari('Başlık', '')).toEqual({ once: 'Başlık', vurgulu: null, sonra: '' })
  })

  it('yalnız ilk geçişi vurgular, geri kalan metni aynen korur', () => {
    const baslik = 'VentHub ve VentHub'
    expect(birlestir(vurguluBaslikParcalari(baslik, 'VentHub'))).toBe(baslik)
  })
})

describe('INV-BASLIK-VURGU-1 — sözlük metni birebir basılır', () => {
  const marka = tr.common.brand

  it.each([
    ['tr', tr.category.showcase.whyVenthubTitle],
    ['en', en.category.showcase.whyVenthubTitle],
  ])('%s: whyVenthubTitle ekranda sözlük metninin aynısıdır', (_dil, baslik) => {
    expect(birlestir(vurguluBaslikParcalari(baslik, marka))).toBe(baslik)
  })
})

describe('INV-BASLIK-VURGU-1 — eski bölme kalıbı geri gelmez', () => {
  const KOK = join(__dirname, '..', '..')

  function tara(dizin: string, bulunan: string[]) {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      const goreli = relative(KOK, yol)
      if (goreli.includes('__tests__') || goreli.includes('.test.')) continue
      if (statSync(yol).isDirectory()) tara(yol, bulunan)
      else if (/\.(tsx?|jsx?)$/.test(ad) && /\.split\(\s*['"]VentHub['"]\s*\)/.test(readFileSync(yol, 'utf8'))) bulunan.push(goreli)
    }
  }

  it("vitrin kodunda başlığı 'VentHub'tan bölen .split() yok; kategori vitrini yardımcıyı kullanır", () => {
    const bulunan: string[] = []
    tara(KOK, bulunan)
    expect(bulunan, "marka vurgusu için vurguluBaslikParcalari kullanın (utils/vurguluBaslik.ts)").toEqual([])
    const bilesen = readFileSync(join(KOK, 'views', 'category', 'CategoryShowcaseView.tsx'), 'utf8')
    expect(bilesen).toMatch(/vurguluBaslikParcalari\(dict\.category\.showcase\.whyVenthubTitle,\s*t\('common\.brand'\)\)/)
  })
})
