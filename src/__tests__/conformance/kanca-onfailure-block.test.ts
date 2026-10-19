/**
 * INV-KANCA-ONFAILURE-1 — güvenlik kancaları çökerse/başlamazsa komut DURUR (`onFailure: "block"`, Claude Code 2.1.295+).
 *
 * Kapsam kararı (ARC-180, OPS-176 / karar 390): yalnız yanlış geçişi GERİ ALINAMAZ zarar (sır, canlı veritabanı,
 * depo yazması, yıkıcı silme, canlı yazım) doğuran PreToolUse kapıları. Süreç/uyarı/ölçüm kancaları fail-open kalır:
 * çökmeleri iş durdurmamalı. Ölçüm (19 Ekim, yerel 2.1.296, sahte çöken kanca): alan yokken komut çalıştı, "block" iken durdu.
 * Belge: block yalnız komut/http kancasında ve çıkış kodu 2'nin engellediği olaylarda etkilidir (Stop, PostToolUse'ta etkisiz).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
interface Kanca { type: string; command?: string; onFailure?: string; timeout?: number }
interface Grup { matcher?: string; hooks: Kanca[] }
const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as { hooks: Record<string, Grup[]> }

/** Çökerse DURMASI gereken kapı dosyaları. Yeni güvenlik kapısı eklenince buraya da yazılır. */
const BLOK = [
  'protect-config.cjs',
  'sensitive-path-guard.cjs',
  'silme-baglanti-kapisi.cjs',
  'gh-api-kapisi.cjs',
  'env-yazma-kapisi.cjs',
  'sql-yazma-kapisi.cjs',
  // canli-yazim-kapisi.cjs: kaydı PR #1998 ile gelir; kayıt bu ayarda varsa aşağıdaki test onu da zorlar
]
const adi = (k: Kanca) => (k.command ?? '').replace(/.*\.claude\/hooks\//, '').replace(/".*$/, '').split(' ')[0]
const tum = Object.entries(ayar.hooks).flatMap(([olay, gruplar]) => gruplar.flatMap((g) => g.hooks.map((k) => ({ olay, k, ad: adi(k) }))))

describe('INV-KANCA-ONFAILURE-1', () => {
  it.each(BLOK)('%s: PreToolUse komut kancasında onFailure "block" var', (dosya) => {
    const bulunan = tum.filter((x) => x.ad === dosya)
    expect(bulunan.length).toBeGreaterThan(0)
    for (const b of bulunan) {
      expect(b.olay).toBe('PreToolUse')
      expect(b.k.type).toBe('command')
      expect(b.k.onFailure).toBe('block')
    }
  })

  it('block taşıyan her kapı 30 sn zaman aşımı taşır (takılırsa sonsuza dek bekleyip tüm komutu kilitlemesin)', () => {
    const blokluKancalar = tum.filter((x) => x.k.onFailure === 'block')
    expect(blokluKancalar.length).toBeGreaterThan(0)
    for (const b of blokluKancalar) expect([b.ad, b.k.timeout]).toEqual([b.ad, 30])
  })

  it('canli-yazim-kapisi.cjs ayarda kayıtlıysa o da block taşır', () => {
    for (const b of tum.filter((x) => x.ad === 'canli-yazim-kapisi.cjs')) expect(b.k.onFailure).toBe('block')
  })

  it('kapsam dışı kancalar (süreç, uyarı, ölçüm, şerit) fail-open kalır: onFailure "block" YOK', () => {
    const blokDisi = tum.filter((x) => x.k.onFailure === 'block' && !BLOK.includes(x.ad) && x.ad !== 'canli-yazim-kapisi.cjs')
    expect(blokDisi.map((x) => x.olay + ':' + x.ad)).toEqual([])
  })

  it('block yalnız PreToolUse komut kancalarında (diğer olaylarda etkisiz ya da yanıltıcı)', () => {
    for (const x of tum.filter((y) => y.k.onFailure !== undefined)) {
      expect(x.olay).toBe('PreToolUse')
      expect(x.k.type).toBe('command')
      expect(['block', 'continue']).toContain(x.k.onFailure)
    }
  })
})
