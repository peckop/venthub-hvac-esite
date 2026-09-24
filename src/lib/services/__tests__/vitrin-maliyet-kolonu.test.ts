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

// products maliyet/tedarik kolonları + başka tablolardaki birim maliyet ve bağlı sermaye.
const MALIYET = [
  'purchase_price', 'cost_in_base', 'last_purchase_cost', 'supplier_name', 'warehouse_location',
  'purchase_currency', 'purchase_rate_to_base', 'last_purchase_currency', 'last_purchased_at',
  'unit_cost', 'capital_tied_up',
] as const

/** Maliyet kolonu adı ya da gömülü tam satır: `products(*)`, `products!inner(*)`, `products!fk( * )`. */
const SATIR_DESENI = new RegExp(`\\b(${MALIYET.join('|')})\\b|\\bproducts(![\\w]+)?\\s*\\(\\s*\\*\\s*\\)`)

/** products'tan tüm kolonlar, satır sonları dahil: `.from('products')\n  .select('*', { count })` ya da boş `select()`. */
const TAM_SECIM_DESENI = /from\(\s*['"]products['"]\s*\)\s*\.select\(\s*(['"]\s*\*\s*['"]\s*)?[,)]/

/** Satır ve blok yorumlarını boşaltır, satır numaralarını korur. `https://` gibi dizgeler kalır. */
function yorumsuz(metin: string): string[] {
  let blokta = false
  return metin.split(/\r?\n/).map(satir => {
    let kod = satir
    if (blokta) {
      const son = kod.indexOf('*/')
      if (son === -1) return ''
      kod = kod.slice(son + 2)
      blokta = false
    }
    kod = kod.replace(/\/\*.*?\*\//g, '')
    const bas = kod.indexOf('/*')
    if (bas !== -1) { kod = kod.slice(0, bas); blokta = true }
    // `//` yalnız satır başında ya da boşluktan sonra yorumdur; `https://` dizgede kalır.
    return kod.replace(/(^|\s)\/\/.*$/, '$1')
  })
}

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
    // Fiyat motoru SUNUCUDA maliyetten satış fiyatı türetir; yönetici servisleri adında Admin taşır.
    /^lib\/services\/(pricing|purchasing)[^/]*\.ts$/.test(y) ||
    /^lib\/services\/[^/]*Admin[^/]*\.ts$/.test(y) ||
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

  it('desenler bilinen ihlal biçimlerini yakalar (kapının kendisi kör değil)', () => {
    for (const ornek of ["select('*, product:products(*)')", "select('x, p:products!inner( * )')", "select('id, purchase_price')", "a.unit_cost"]) {
      expect(SATIR_DESENI.test(ornek), ornek).toBe(true)
    }
    for (const ornek of [".from('products').select('*')", ".from(\"products\")\n    .select('*', { count: 'exact' })", ".from('products').select()"]) {
      expect(TAM_SECIM_DESENI.test(ornek), ornek).toBe(true)
    }
    expect(TAM_SECIM_DESENI.test(".from('products').select(VARIANT_DETAIL_COLUMNS)")).toBe(false)
  })

  it('maliyet kolonu adı ve gömülü tam ürün satırı vitrin kodunda geçmez', () => {
    const desen = SATIR_DESENI
    const ihlal: string[] = []
    for (const { yol, goreli } of kaynaklar) {
      if (yoneticiYaDaMotor(goreli)) continue
      yorumsuz(readFileSync(yol, 'utf8')).forEach((kod, i) => {
        if (desen.test(kod)) ihlal.push(`${goreli}:${i + 1}`)
      })
    }
    expect(ihlal).toEqual([])
  })

  it('vitrin kodu products tablosundan tüm kolonları çekmez: select(\'*\') ya da boş select()', () => {
    const desen = TAM_SECIM_DESENI
    const ihlal = kaynaklar
      .filter(({ goreli }) => !yoneticiYaDaMotor(goreli))
      .filter(({ yol }) => desen.test(yorumsuz(readFileSync(yol, 'utf8')).join('\n')))
      .map(({ goreli }) => goreli)
    expect(ihlal).toEqual([])
  })

  it('yorum ayıklayıcı dizgedeki kolon adını kaçırmaz, yorumdakini yakalamaz', () => {
    const [dizge, yorum, blok] = yorumsuz(
      "fetch('https://x/rest/v1/products?select=purchase_price')\n// purchase_price\n/* purchase_price */ const a = 1",
    )
    expect(dizge).toContain('purchase_price')
    expect(yorum).not.toContain('purchase_price')
    expect(blok).not.toContain('purchase_price')
  })
})
