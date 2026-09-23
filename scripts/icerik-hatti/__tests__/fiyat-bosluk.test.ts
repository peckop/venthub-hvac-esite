/**
 * REC-209 C · fiyat boşluk raporu. Ağa, DB'ye, diske çıkmaz. ⛔ Fiyatlar UYDURMA.
 *
 * Kilitlenenler:
 *   1. Beş durum doğru ayrılır; purchase_price = 0 "fiyat yok" sayılır (canlıda 94/94 böyle).
 *   2. Satırlarda fiyat DEĞERİ yok — rapor panoya/PUBLIC depoya yapıştırılabilir.
 *   3. YAZMAZ: karne ve rapor betiğinde yazma çağrısı (POST/PATCH/PUT/DELETE, upsert, insert,
 *      update, rpc) yok. Sabotaj yönü: yazma çağrısı eklenmiş kaynak aynı denetimde KIRMIZI.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fiyatBoslukSatirlari, boslukOzeti, BOSLUK_BASLIK } from '../fiyat-bosluk.mjs'
import { fiyatDizini } from '../fiyat-kaynak-esle.mjs'

const BELGE = 'liste.pdf'
const dizin = fiyatDizini([{
  dosya: BELGE, sayfa: 7, metin: 'Fiyatlarımıza %20 KDV dahil değildir.',
  tablo: [{ satirlar: [['KOD', 'MODEL', 'FİYAT (Euro)'], ['1001', 'A', '100'], ['1002', 'B', '200'], ['1004', 'D', '400']] }],
}], BELGE)

const U = [
  { id: 'a', sku: 'X-1001', name: 'A', purchase_price: 100, purchase_currency: 'EUR' }, // fiyatlı → rapora girmez
  { id: 'b', sku: 'X-1002', name: 'B', purchase_price: 200, purchase_currency: 'EUR' }, // HAZIR
  { id: 'c', sku: 'X-1003', name: 'C', purchase_price: 300, purchase_currency: 'EUR' }, // KAYNAKSIZ
  { id: 'd', sku: 'X-1004', name: 'D', purchase_price: 444, purchase_currency: 'EUR' }, // FARKLI
  { id: 'e', sku: 'X-1001', name: 'E', purchase_price: 0, purchase_currency: 'TRY' },   // LİSTEDE VAR (0 = yok)
  { id: 'f', sku: 'X-9999', name: 'F', purchase_price: null, purchase_currency: null }, // HİÇBİR YERDE YOK
]

describe('fiyat boşluk raporu', () => {
  const s = fiyatBoslukSatirlari(U, new Set(['a']), dizin)
  const d = (sku: string, ad: string) => s.find(r => r.sku === sku && r.urun === ad)?.durum

  it('fiyat satırı olan ürün rapora girmez; beş durum ayrılır', () => {
    expect(s).toHaveLength(5)
    expect(d('X-1002', 'B')).toBe('HAZIR')
    expect(d('X-1003', 'C')).toBe('KAYNAKSIZ')
    expect(d('X-1004', 'D')).toBe('FARKLI')
    expect(d('X-1001', 'E')).toBe('LİSTEDE VAR')
    expect(d('X-9999', 'F')).toBe('HİÇBİR YERDE YOK')
    expect(boslukOzeti(s)).toEqual({ HAZIR: 1, KAYNAKSIZ: 1, FARKLI: 1, 'LİSTEDE VAR': 1, 'HİÇBİR YERDE YOK': 1 })
  })

  it('satırda fiyat değeri YOK, yalnız sözleşme kolonları', () => {
    for (const r of s) {
      expect(Object.keys(r).sort()).toEqual([...BOSLUK_BASLIK].sort())
      expect(JSON.stringify(r)).not.toMatch(/\b(100|200|300|400|444)\b/)
    }
  })
})

describe('rapor YAZMAZ (iki yönlü)', () => {
  // Veritabanı yazması: REST fetch yöntemi ya da supabase-js zinciri. Düz `.delete(` sayılmaz —
  // fiyat-kaynak-esle.mjs bellek içi Map'ten siler (ilk sürüm onu yanlış yakaladı).
  const YAZMA = /method\s*:\s*['"](POST|PATCH|PUT|DELETE)['"]|\.from\([^)]*\)\s*\.(upsert|insert|update|delete)\s*\(|\.rpc\s*\(/i
  const kaynak = (ad: string) => readFileSync(join(__dirname, '..', ad), 'utf8')
  it('karne ve rapor betiğinde yazma çağrısı yok', () => {
    for (const ad of ['katalog-karnesi.mjs', 'fiyat-bosluk.mjs', 'fiyat-kaynak-esle.mjs']) expect(kaynak(ad)).not.toMatch(YAZMA)
  })
  it('sabotaj: yazma çağrısı eklenmiş kaynak aynı denetimde yakalanır', () => {
    expect(kaynak('katalog-karnesi.mjs') + "\nawait fetch(u, { method: 'PATCH' })").toMatch(YAZMA)
    expect("supabase.from('product_prices').upsert(x)").toMatch(YAZMA)
    expect('kayit.delete(k)').not.toMatch(YAZMA) // bellek içi Map — yazma değil
  })
})
