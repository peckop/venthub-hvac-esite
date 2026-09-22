/**
 * identity-fix.mjs Ö4 — manifest iç tutarlılığı. Ağa çıkmaz.
 * Kilitlenen kusur (2026-09-22): slug küçük harf, model_code harfli olabilir; büyük/küçük harf
 * duyarlı kontrol VRT-253490106XN'yi (karar 75) haksız yere düşürdü.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifestIhlalleri } from '../identity-fix-kurallar.mjs'

const oge = (o: Record<string, string> = {}) => ({
  current_sku: 'VRT-253490106XN', next_sku: 'VRT-253490106XN', next_model_code: '253490106XN',
  katalog_kod: '253490106XN', next_name: 'VORTICENT CMS ATEX 35/14 T4 3kW',
  next_slug: 'vorticent-cms-atex-35-14-t4-3kw-253490106xn', ...o,
})

describe('identity-fix Ö4', () => {
  it('harfli model_code + küçük harf slug GEÇER', () => {
    expect(manifestIhlalleri([oge()])).toEqual([])
  })
  it('slug başka kodla biterse DÜŞER', () => {
    expect(manifestIhlalleri([oge({ next_slug: 'vorticent-cms-atex-35-14-t4-3kw-253490106' })])).toHaveLength(1)
  })
  it('marka öneki değişemez, katalog kodu model koduna eşit olmalı', () => {
    expect(manifestIhlalleri([oge({ next_sku: 'AVE-253490106XN' })])[0]).toMatch(/degismez ihlali/)
    expect(manifestIhlalleri([oge({ katalog_kod: 'X' })])[0]).toMatch(/katalog_kod/)
  })
  it('depodaki iki manifest (DD, CMS 35/14) temiz', () => {
    for (const f of ['nicotra-dd-identity-manifest.json', 'vortice-cms-atex-3514-identity-manifest.json']) {
      const m = JSON.parse(readFileSync(join(__dirname, '..', f), 'utf8'))
      expect(manifestIhlalleri(m.items), f).toEqual([])
    }
  })
})
