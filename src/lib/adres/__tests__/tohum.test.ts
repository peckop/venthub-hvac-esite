// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'

import { tohumDogrula } from '../tohum'

/**
 * Tohum ↔ next.config (plan §4.1 Y1, §4 katman 3). Faz 3-C `next.config`'ten 25 kuralı
 * (13 dilsiz kategori + 6 Lineo + 6 ürün) SİLDİ; o andan sonra bu adreslerin tek taşıyıcısı tohum
 * dosyasıdır (üretilmiş harita tohumu okur). Bu test iki şeyi ölçer: (1) config'te o kurallardan
 * hiçbiri KALMADI (iki taşıyıcı birlikte yaşarsa tek sıçrama bozulur); (2) silinen her kuralın tohumda
 * karşılığı VAR. Silinen kuralların tek kaydı aşağıdaki dondurulmuş liste ve tohumdur.
 */
const tohum = tohumDogrula(tohumHam)
const config = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8')

/** Config'ten silinen 13 dilsiz kategori kuralı: eski TR slug → config'teki hedef (EN slug; 4'ü bugün 404 veren ölü hedef). */
const SILINEN_KATEGORI_KURALLARI: ReadonlyArray<readonly [string, string]> = [
  ['fanlar', 'fans'],
  ['hava-perdeleri', 'air-curtains'],
  ['isi-geri-kazanim-cihazlari', 'heat-recovery-units'],
  ['hava-temizleyiciler-anti-viral-urunler', 'air-purifiers'],
  ['hiz-kontrolu-cihazlari', 'speed-controllers'],
  ['aksesuarlar', 'accessories'],
  ['flexible-hava-kanallari', 'flexible-air-ducts'],
  ['nem-alma-cihazlari', 'dehumidifiers'],
  ['endustriyel-havalandirma', 'industrial-ventilation'],
  ['ticari-havalandirma', 'commercial-ventilation'],
  ['konut-tipi-havalandirma', 'residential-ventilation'],
  ['duman-egzoz-fanlari', 'smoke-exhaust-fans'],
  ['otopark-jet-fanlari', 'jet-fans'],
]

/** Config'ten silinen 6 Lineo çap adresi (`vortice-lineo-<çap>-quiet`). */
const SILINEN_LINEO_CAPLARI = ['100', '125', '150', '200', '250', '315']

/** Config'ten silinen 6 eski ürün adresi: eski slug → hedef SKU (K12 NIC-11921, REC-146 beş Vortice). */
const SILINEN_URUN_KURALLARI: ReadonlyArray<readonly [string, string]> = [
  ['dd-12-12-1500w-3f-4p-2v-6n090p-11921', 'NIC-11921'],
  ['vortice-ca-il-4020-es-rect-16076', 'VRT-CA-IL-4020-ES-RECT'],
  ['vortice-ca-il-5035-es-rect-16077', 'VRT-CA-IL-5035-ES-RECT'],
  ['vortice-ca-il-6040-es-rect-16078', 'VRT-CA-IL-6040-ES-RECT'],
  ['vortice-ca-il-7050-es-rect-16079', 'VRT-CA-IL-7050-ES-RECT'],
  ['vortice-ca-il-8060-es-rect-16080', 'VRT-CA-IL-8060-ES-RECT'],
]

describe('tohum dosyası', () => {
  it('biçim doğrulamasından geçer', () => {
    expect(tohum.kiraci).toBe('d3b07384-d113-495f-a558-8c38634e0000')
  })

  it('config\'ten silinen 25 kuralın HİÇBİRİ next.config\'te kalmadı (tek taşıyıcı: harita)', () => {
    expect(config.match(/source: '\/category\/[a-z0-9-]+\/:path\*'/g), 'dilsiz kategori kuralı kaldı').toBeNull()
    expect(config, 'Lineo çap kuralı kaldı').not.toMatch(/vortice-lineo-/)
    expect(config.match(/destination: '[^']*\?sku=/g), '?sku= hedefli ürün kuralı kaldı').toBeNull()
    for (const [eski] of SILINEN_URUN_KURALLARI) {
      expect(config, `ürün kuralı kaldı: ${eski}`).not.toContain(eski)
    }
  })

  it('13 dilsiz kategori kuralının her kaynağı tohumda; hedef ya aynı ya (bugün 404 veren hedefte) yeniden eşlenmiş', () => {
    expect(SILINEN_KATEGORI_KURALLARI).toHaveLength(13)
    for (const [eski, hedef] of SILINEN_KATEGORI_KURALLARI) {
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
    expect(SILINEN_LINEO_CAPLARI).toHaveLength(6)
    for (const cap of SILINEN_LINEO_CAPLARI) {
      expect(tohum.aileler.find((a) => a.eski === `vortice-lineo-${cap}-quiet`)?.hedef).toBe('vortice-lineo-quiet-sessiz-kanal-fanlari')
    }
  })

  it('6 ürün kuralı tohumda aynı SKU\'ya', () => {
    expect(SILINEN_URUN_KURALLARI).toHaveLength(6)
    for (const [eski, sku] of SILINEN_URUN_KURALLARI) {
      expect(tohum.urunler.find((u) => u.eski === eski)?.hedefSku, eski).toBe(sku)
    }
  })

  it('bozuk tohum HATA fırlatır (sessizce "tohum yok" olmaz)', () => {
    expect(() => tohumDogrula({ ...tohumHam, urunler: [{ eski: 'x', hedefsku: 'Y', kaynak: 'k' }] })).toThrow(/hedefSku/)
    expect(() => tohumDogrula({ ...tohumHam, aileler: [...tohumHam.aileler, tohumHam.aileler[0]] })).toThrow(/iki kez/)
    expect(() => tohumDogrula({ ...tohumHam, kategoriler: [{ eski: 'Fanlar', bicim: 'tr', hedef: null, kaynak: 'k' }] })).toThrow(/biçim dışı/)
  })
})
