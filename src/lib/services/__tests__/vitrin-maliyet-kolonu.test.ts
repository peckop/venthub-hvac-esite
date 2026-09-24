import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ADMIN_PRODUCT_FORM_COLUMNS } from '@/components/admin/products/productForm.columns'

import {
  FAMILY_LIST_COLUMNS,
  VARIANT_DETAIL_COLUMNS,
  VARIANT_LIST_COLUMNS,
} from '../product.columns'

/**
 * VİTRİN MALİYET KOLONU TAŞIMAZ — REC-140 (2026-09-24).
 *
 * Ölçüm: ana sayfa HTML'inde (RSC yükü) `purchase_price` sayısal değerle 12 kez görünüyordu;
 * kaynak VARIANT_DETAIL_COLUMNS'tı. Aynı liste tarayıcıdan da çekiliyordu (sepet, ürün
 * seçici, sipariş detayı) ve proje listesi gömülü `products(*)` ile TÜM satırı alıyordu.
 * Bu test üç şeyi sabitler:
 *   1. Vitrin kolon listeleri maliyet/tedarikçi kolonu içermez.
 *   2. Yönetici formu listesi alış fiyatını içerir (yoksa kaydet 0'a ezer) ve yalnız
 *      yönetici yüzeyinden içe aktarılır.
 *   3. Vitrin kaynak ağacında (yönetici ve fiyat/satın alma servisleri dışı) maliyet
 *      kolonu adı ve gömülü `products(*)` geçmez.
 *
 * ⚠ Bu, KODUN istemediğini sabitler; DB'nin vermediğini değil. anon rolü products
 * tablosundan bu kolonları doğrudan okuyabiliyor — kolon yetkisi (REVOKE) ayrı iş, DB tarafı.
 */

const MALIYET = ['purchase_price', 'cost_in_base', 'last_purchase_cost', 'supplier_name', 'warehouse_location'] as const

function kolonlar(liste: string): string[] {
  return liste.split(',').map(k => k.trim())
}

const KOK = join(__dirname, '..', '..', '..')

function dosyalar(dizin: string): string[] {
  const cikti: string[] = []
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      cikti.push(...dosyalar(yol))
    } else if (/\.(ts|tsx)$/.test(ad) && !/\.test\.tsx?$/.test(ad)) {
      cikti.push(yol)
    }
  }
  return cikti
}

/** Maliyet verisine meşru olarak dokunan yerler: yönetici yüzeyi, fiyat motoru, satın alma, tipler. */
function yoneticiYaDaMotor(goreli: string): boolean {
  const y = goreli.split(sep).join('/')
  return (
    y.includes('/admin/') ||
    y.startsWith('app/[lang]/admin') ||
    y.startsWith('types/') ||
    y.startsWith('i18n/') ||
    /^lib\/services\/(pricing|purchasing)[^/]*\.ts$/.test(y) ||
    y === 'lib/services/product.columns.ts'
  )
}

describe('vitrin kolon listeleri maliyet taşımaz', () => {
  it.each([
    ['VARIANT_DETAIL_COLUMNS', VARIANT_DETAIL_COLUMNS],
    ['VARIANT_LIST_COLUMNS', VARIANT_LIST_COLUMNS],
    ['FAMILY_LIST_COLUMNS', FAMILY_LIST_COLUMNS],
  ])('%s', (_ad, liste) => {
    const bulunan = kolonlar(liste).filter(k => (MALIYET as readonly string[]).includes(k))
    expect(bulunan).toEqual([])
  })

  it('yönetici formu listesi alış fiyatını okur (kaydet 0\'a ezmesin)', () => {
    expect(kolonlar(ADMIN_PRODUCT_FORM_COLUMNS)).toContain('purchase_price')
  })
})

describe('vitrin kaynak ağacı maliyet kolonu adı içermez', () => {
  const kaynaklar = dosyalar(KOK).map(yol => ({ yol, goreli: relative(KOK, yol) }))

  it('ADMIN_PRODUCT_FORM_COLUMNS yalnız yönetici yüzeyinden içe aktarılır', () => {
    const ihlal = kaynaklar
      .filter(({ goreli }) => !yoneticiYaDaMotor(goreli))
      .filter(({ yol }) => readFileSync(yol, 'utf8').includes('ADMIN_PRODUCT_FORM_COLUMNS'))
      .map(({ goreli }) => goreli)
    expect(ihlal).toEqual([])
  })

  it('maliyet kolonu adı ve gömülü products(*) vitrin kodunda geçmez', () => {
    const desen = new RegExp(`\\b(${MALIYET.join('|')})\\b|products\\(\\*\\)`)
    const ihlal: string[] = []
    for (const { yol, goreli } of kaynaklar) {
      if (yoneticiYaDaMotor(goreli)) continue
      // CRLF: Windows çıkışında `.` \r'yi yutmaz, `$` eşleşmez — yorum ayıklanmazdı.
      readFileSync(yol, 'utf8').split(/\r?\n/).forEach((satir, i) => {
        const kod = satir.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '')
        if (desen.test(kod)) ihlal.push(`${goreli}:${i + 1}`)
      })
    }
    expect(ihlal).toEqual([])
  })
})
