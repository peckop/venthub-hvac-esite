// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'

import { tohumDogrula } from '../tohum'

/**
 * Tohum ↔ next.config paritesi (plan §4.1 Y1, §4 katman 3). Faz 3-C `next.config`'ten 25 satırı
 * (13 dilsiz kategori + 6 Lineo + 6 ürün) SİLER; o andan sonra bu adreslerin tek taşıyıcısı tohum
 * dosyasıdır. Bu test config'te bugün duran her kuralın tohumda karşılığı olduğunu ölçer — silme
 * güvenli olsun. ⚠Faz 3-C satırları silince aşağıdaki SAYI beklentileri 0 olur: o PR bu testi günceller.
 */
const tohum = tohumDogrula(tohumHam)
const config = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8')

describe('tohum dosyası', () => {
  it('biçim doğrulamasından geçer', () => {
    expect(tohum.kiraci).toBe('d3b07384-d113-495f-a558-8c38634e0000')
  })

  it('13 dilsiz kategori kuralının her kaynağı tohumda; hedef ya aynı ya (bugün 404 veren hedefte) yeniden eşlenmiş', () => {
    const kurallar = [...config.matchAll(/source: '\/category\/([a-z0-9-]+)\/:path\*', destination: '\/category\/([a-z0-9-]+)\/:path\*'/g)]
    expect(kurallar).toHaveLength(13)
    for (const [, eski, hedef] of kurallar) {
      const kayit = tohum.kategoriler.find((k) => k.eski === eski)
      expect(kayit, `tohumda yok: ${eski}`).toBeDefined()
      expect(kayit?.bicim).toBe('tr')
      if (kayit?.hedef !== hedef) {
        // Ölü hedef: kendisi de tohumda kaynak olarak durmalı (bugün linklenmiş olabilir) ve aynı yere gitmeli.
        const olu = tohum.kategoriler.find((k) => k.eski === hedef)
        expect(olu, `404 hedef ${hedef} tohumda kaynak değil`).toBeDefined()
        expect(olu?.hedef).toBe(kayit?.hedef)
      }
    }
  })

  it('bugün 404 veren 4 hedef en yakın canlı karşılığa yazılmış (plan §4.1)', () => {
    const hedefi = (eski: string) => tohum.kategoriler.find((k) => k.eski === eski)?.hedef
    expect(hedefi('heat-recovery-units')).toBe('heat-recovery-vmc')
    expect(hedefi('air-purifiers')).toBeNull()
    expect(hedefi('flexible-air-ducts')).toBeNull()
    expect(hedefi('industrial-ventilation')).toBeNull()
  })

  it('6 Lineo çap adresi tohumda, hedef tek aile', () => {
    const caplar = /\.\.\.\[([^\]]+)\]\.map\(\(cap\) => \(\{\s*source: `\/:lang\(tr\|en\)\/products\/vortice-lineo-\$\{cap\}-quiet`/.exec(config)
    expect(caplar).not.toBeNull()
    const liste = [...(caplar?.[1] ?? '').matchAll(/'(\d+)'/g)].map((m) => m[1])
    expect(liste).toHaveLength(6)
    for (const cap of liste) {
      expect(tohum.aileler.find((a) => a.eski === `vortice-lineo-${cap}-quiet`)?.hedef).toBe('vortice-lineo-quiet')
    }
  })

  it('6 ürün kuralı tohumda aynı SKU\'ya', () => {
    const kurallar = [
      ...config.matchAll(/source: '\/:lang\(tr\|en\)\/products\/([a-z0-9-]+)',\s*destination: '\/:lang\/products\/[a-z0-9-]+\?sku=([A-Z0-9-]+)'/g),
    ]
    expect(kurallar).toHaveLength(6)
    for (const [, eski, sku] of kurallar) {
      expect(tohum.urunler.find((u) => u.eski === eski)?.hedefSku, eski).toBe(sku)
    }
  })

  it('bozuk tohum HATA fırlatır (sessizce "tohum yok" olmaz)', () => {
    expect(() => tohumDogrula({ ...tohumHam, urunler: [{ eski: 'x', hedefsku: 'Y', kaynak: 'k' }] })).toThrow(/hedefSku/)
    expect(() => tohumDogrula({ ...tohumHam, aileler: [...tohumHam.aileler, tohumHam.aileler[0]] })).toThrow(/iki kez/)
    expect(() => tohumDogrula({ ...tohumHam, kategoriler: [{ eski: 'Fanlar', bicim: 'tr', hedef: null, kaynak: 'k' }] })).toThrow(/biçim dışı/)
  })
})
