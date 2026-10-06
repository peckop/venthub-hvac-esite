// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

/**
 * REC-300 Faz 1-B 5c (OPS hükmü 2026-10-05) — iki Vortice hava perdesi ailesinin ADI adresiyle aynı kelimeyi
 * söyler. Adres (karar 86, 78b) `…-isiticisiz-hava-perdeleri` ve `…-elektrikli-isiticili-hava-perdeleri` olur;
 * ad 'Ortam Havalı' / 'Isıtmalı' kalsaydı müşteri adreste bir, başlıkta başka kelime görürdü.
 *
 * Bağlanan üç yer: migration 5c (ad yazan UPDATE) · aynı migration'ın aile slug listesi (adres) · geri alma
 * betiği (ters adım) · sözlüğün dal adları (EN kalıbı). Bu test canlı veriyi ÖLÇMEZ; migration'ın canlıda
 * çalıştığını RAISE kapıları ve canlı SELECT ölçer.
 */
const KOK = process.cwd()
const MIGRATION = readFileSync(join(KOK, 'supabase/migrations/20261005100000_kategori_agaci_casals_aile_adresleri.sql'), 'utf8')
const GERI = readFileSync(join(KOK, 'scripts/db/geri-alma/20261005100000_kategori_agaci_casals_aile_adresleri.geri-al.sql'), 'utf8')

const AD_TR = 'Vortice AD Isıtıcısız Hava Perdeleri'
const AD_EN = 'Vortice AIR DOOR AD Unheated Air Curtains'
const HAD_TR = 'Vortice H AD Elektrikli Isıtıcılı Hava Perdeleri'
const HAD_EN = 'Vortice AIR DOOR H AD Electrically Heated Air Curtains'

/** 5c bloğu: 'İKİ HAVA PERDESİ AİLESİNİN ADI' başlığından 6) TAŞIMA başlığına kadar. */
function blok5c(sql: string): string {
  const bas = sql.indexOf('5c) İKİ HAVA PERDESİ AİLESİNİN ADI')
  const son = sql.indexOf('6) TAŞIMA')
  expect(bas, '5c başlığı migration\'da olmalı').toBeGreaterThan(-1)
  expect(son, '6) TAŞIMA başlığı 5c\'den sonra gelmeli').toBeGreaterThan(bas)
  return sql.slice(bas, son)
}

describe('perde ailesi adı = adres kelimesi (5c)', () => {
  const b = blok5c(MIGRATION)

  it('migration iki yeni TR adı ve iki EN adı name + name_i18n olarak yazar', () => {
    for (const ad of [AD_TR, AD_EN, HAD_TR, HAD_EN]) expect(b).toContain(`'${ad}'`)
    expect(b).toContain(`SET name = '${AD_TR}'`)
    expect(b).toContain(`SET name = '${HAD_TR}'`)
  })

  it('ad ile adres aynı kelimeyi söyler: Isıtıcısız ↔ isiticisiz, Isıtıcılı ↔ isiticili', () => {
    expect(MIGRATION).toContain(`('vortice-hava-perdesi', 'vortice-ad-isiticisiz-hava-perdeleri')`)
    expect(MIGRATION).toContain(`('vortice-h-ad-elektrikli', 'vortice-h-ad-elektrikli-isiticili-hava-perdeleri')`)
    expect(AD_TR).toContain('Isıtıcısız')
    expect(HAD_TR).toContain('Isıtıcılı')
  })

  it('eski kelimeler ('+"'Ortam Havalı'/'Isıtmalı'"+') yeni adlarda geçmez, yalnız bugünkü-değer kapısında geçer', () => {
    for (const ad of [AD_TR, AD_EN, HAD_TR, HAD_EN]) {
      expect(ad).not.toContain('Ortam Havalı')
      expect(ad).not.toContain('Isıtmalı')
    }
  })

  it('sapma kapısı ve son-durum kapısı var (elle değişmiş ad sessizce ezilmez)', () => {
    expect(b).toContain('5c: perde ailelerinin adı ne bugünkü ne yeni değerde')
    expect(b).toContain('5c: perde ailelerinin adı beklenen değerde değil')
  })

  it('EN adlar sözlüğün dal adı kalıbıyla paralel (Unheated / Electrically Heated Air Curtains)', () => {
    const enSub = en.common.categoryList.sub as Record<string, string>
    const trSub = tr.common.categoryList.sub as Record<string, string>
    expect(AD_EN).toContain(enSub['unheated-curtain'].replace(' Air Curtains', ''))
    expect(AD_EN.endsWith('Air Curtains')).toBe(true)
    expect(HAD_EN).toContain(enSub['electric-curtain'].replace(' Air Curtains', ''))
    expect(HAD_EN.endsWith('Air Curtains')).toBe(true)
    expect(trSub['unheated-curtain']).toBe('Isıtıcısız Hava Perdeleri')
    expect(trSub['electric-curtain']).toBe('Elektrikli Isıtıcılı Hava Perdeleri')
  })
})

describe('geri alma betiği perde adlarını canlıdaki eski değerlere döndürür (5c)', () => {
  it('ters adım ve son-durum kapısı var, eski adlar canlı ölçümle aynı', () => {
    expect(GERI).toContain('5c) PERDE AİLELERİ')
    expect(GERI).toContain(`SET name = 'Vortice AD Ortam Havalı Hava Perdeleri'`)
    expect(GERI).toContain(`'tr', 'Vortice AIR DOOR Hava Perdeleri'`)
    expect(GERI).toContain(`SET name = 'Vortice H AD Elektrikli Isıtmalı Hava Perdeleri'`)
    expect(GERI).toContain('GERİ ALMA 5c: perde ailelerinin adı beklenen eski değerde değil')
  })

  it('migration\'ın bugünkü-değer kapısı geri almanın döndürdüğü değerlerle aynı', () => {
    const b = blok5c(MIGRATION)
    expect(b).toContain(`'Vortice AD Ortam Havalı Hava Perdeleri'`)
    expect(b).toContain(`'Vortice H AD Elektrikli Isıtmalı Hava Perdeleri'`)
  })
})
