/**
 * Yüzen düğmeler (yukarı çık · WhatsApp · dil seçici) açılan pencerelerin ÜSTÜNE binmez.
 *
 * NİÇİN VAR (REC-340, 2026-09-17 canlı ölçüm, 375px): düğme kümesi `z-toast` (9999) katmanındaydı,
 * arama penceresi ve bütün modallar `z-modal` (100). TR/EN seçici arama penceresinin alt satırının
 * üstüne biniyordu. Kusur #1238'den ÖNCE de vardı (eski bileşende aynı alt satır, aynı katman).
 *
 * Katman ölçeği SSOT'u `src/design-system/tokens.js` — bu test sayıyı değil İLİŞKİYİ ölçer:
 * kümenin katmanı `modal`'dan küçük olmalı. Ham `z-40`/`z-[..]` ile kaçış da kırmızıdır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { zIndex } from '../../design-system/tokens'

const kaynak = readFileSync(join(__dirname, '..', 'layout', 'MainLayout.tsx'), 'utf8')

describe('yüzen düğme kümesi katmanı', () => {
  it('küme açılan pencerelerin (modal) altında kalır', () => {
    // Kümenin kapsayıcısı: `fixed right-6 z-<ad>` — tek yer.
    const eslesme = kaynak.match(/fixed right-6 z-([a-z]+)\b/)
    expect(eslesme, 'yüzen küme kapsayıcısı bulunamadı (sınıf değiştiyse testi güncelle)').not.toBeNull()
    const ad = eslesme?.[1] as keyof typeof zIndex
    expect(Object.keys(zIndex), `z-${ad} bir katman belirteci değil`).toContain(ad)
    expect(Number(zIndex[ad])).toBeLessThan(Number(zIndex.modal))
  })
})
