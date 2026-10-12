// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

/**
 * REC-300 Faz 1-B — korozyon (karar 287) ve radyal (karar 288) dallarının görünen adı İKİ yerde yaşar:
 * veritabanında (`categories.name` + `menu_label`, migration) ve sözlükte (`common.categoryList.sub.*`, kodun
 * önce baktığı yer). İkisi ayrışırsa sitede bir ad, yönetim/arama/yedek yolunda başka ad görünür. Bu test iki
 * yeri BAĞLAR: sözlükteki TR değer migration'ın yazdığı dizeyle birebir aynı olmalı; EN değerler karar
 * metnindeki adlara sabitlenir (EN ad yalnız sözlükte yaşar, DB'de karşılığı yok).
 *
 * ÖLÇMEDİĞİ: migration'ın canlıda gerçekten çalıştığı (RAISE kapıları uygulama anında ölçer).
 */
const MIGRATION = readFileSync(
  join(process.cwd(), 'supabase/migrations/20261005100000_kategori_agaci_casals_aile_adresleri.sql'),
  'utf8',
)
const trSub = tr.common.categoryList.sub as Record<string, string>
const enSub = en.common.categoryList.sub as Record<string, string>

describe('korozyon (karar 287) ve radyal (karar 288): sözlük adı = migration adı', () => {
  it('korozyon: TR sözlük değeri migration\'ın yazdığı name ve menu_label ile aynı', () => {
    const ad = trSub['corrosion-fans']
    expect(ad).toBe('Korozyona ve Aside Dayanımlı Fanlar')
    expect(MIGRATION).toContain(`SET name = '${ad}',`)
    expect(MIGRATION).toContain(`menu_label = '${ad}',`)
  })

  it('radyal: TR sözlük değeri migration\'ın yazdığı name ve menu_label ile aynı', () => {
    const ad = trSub.radial
    expect(ad).toBe('Radyal (Santrifüj) Fanlar')
    expect(MIGRATION).toContain(`SET name = '${ad}',`)
    expect(MIGRATION).toContain(`menu_label = '${ad}',`)
  })

  it('EN adlar karar metnindeki adlara sabit (yalnız sözlükte yaşar)', () => {
    expect(enSub['corrosion-fans']).toBe('Corrosion- and Acid-Resistant Fans')
    expect(enSub.radial).toBe('Radial (Centrifugal) Fans')
  })

  it('korozyon dalı yeni anahtara bağlanır ve o anahtar sözlükte VAR (ad sözlükten çözülür)', () => {
    expect(MIGRATION).toContain("translation_key = 'sub.corrosion-fans'")
    expect(trSub['corrosion-fans']).toBeTruthy()
    expect(enSub['corrosion-fans']).toBeTruthy()
  })
})
