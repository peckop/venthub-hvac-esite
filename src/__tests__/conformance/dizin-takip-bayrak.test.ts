/**
 * INV-SKILL-DIZIN-BAYRAK-1 — dizin-takip skill'i betik bayraklarını ve dönüş durumlarını anlatır (YTN-66, OPS-345).
 *
 * NİÇİN VAR: SEO-127 ve SEO-130 betiklere `--kalan`, `--izinli`, `--zorla`, `--neden`, `--kart` ekledi ve `TABLODA YOK`,
 * `TEKRAR RED` dönüşlerini getirdi; skill ise eski komutu gösteriyordu (YTN-62'den sonra bile beş eksik kaldı: Google'da TEKRAR yok,
 * zorla istisnası, red dönüşleri ve liste tavanı, `--kaydet` adres biçimi). Betik başlığı bir bayrağı belgeliyor ve skill o bayrağı
 * hiç anmıyorsa kapı kırmızı verir: bayrağı ekleyen, skill'i de günceller.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const kok = path.resolve(__dirname, '..', '..', '..')
const oku = (...parca: string[]) => fs.readFileSync(path.join(kok, ...parca), 'utf8')

const skill = oku('.claude', 'skills', 'dizin-takip', 'SKILL.md')
const takipBasligi = oku('scripts', 'seo', 'dizin-takip.mjs').split('*/')[0] ?? ''
const parcacikBasligi = oku('scripts', 'seo', 'tarayici-parcaciklari.mjs').split('*/')[0] ?? ''

describe('dizin-takip skill: betik bayrakları ve dönüşleri', () => {
  it.each(['--kalan', '--sinir', '--izinli', '--zorla', '--kaydet', '--neden', '--kart'])('%s betik başlığında geçer ve skill anar', (bayrak) => {
    expect(`${takipBasligi}\n${parcacikBasligi}`).toContain(bayrak)
    expect(skill).toContain(bayrak)
  })

  it.each(['ISTENDI', 'TABLODA YOK', 'TEKRAR RED'])('__iste dönüşü %s skill\'de anlatılır', (donus) => {
    expect(parcacikBasligi).toContain(donus)
    expect(skill).toContain(donus)
  })

  it('liste tavanı betikteki değerle aynıdır', () => {
    const tavan = /IZINLI_TAVAN = (\d+)/.exec(oku('scripts', 'seo', 'tarayici-parcaciklari.mjs'))?.[1]
    expect(tavan).toBeDefined()
    expect(skill).toContain(`en çok ${tavan} adres`)
  })

  it('Google\'da TEKRAR olmadığı yazılıdır', () => {
    expect(skill).toMatch(/Google'da[^.\n]*(TEKRAR|tek istek)/)
  })

  it('--kaydet yer tutucusunda ikinci adres de https ile yazılır', () => {
    expect(skill).toContain('<https://adres1,https://adres2>')
  })
})
