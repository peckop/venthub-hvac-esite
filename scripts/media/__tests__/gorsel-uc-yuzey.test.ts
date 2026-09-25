/**
 * INV-IMG-2 saf parça sınavı — değerlendirici ve SQL üretimi. Asıl davranış sınavı gölgede koşar
 * (`node scripts/media/gorsel-uc-yuzey-sinavi.mjs --kanit`); burası o sınavın hakemini sınar:
 * hakem yanlış hüküm verirse gölgedeki yeşil de yalan olur.
 */
import { describe, expect, it } from 'vitest'
import { SABOTAJLAR, T2, YOL, ayristir, degerlendir, sinavSql } from '../gorsel-uc-yuzey.mjs'

const once = {
  K_kiraci: '2', K_urun: '2', once_A_aile: '1', once_A_kapak: '∅',
  once_B_varyant: '["IMG2-A"]', once_B_yollar: '[]', once_C_yollar: '[]', once_C_kapak: '∅',
}
const dogru = {
  ...once,
  A_kapak: YOL.kapak, A_aile: '1', B_varyant: '["IMG2-A"]',
  B_yollar: JSON.stringify([YOL.kapak, YOL.ikinci]),
  C_yollar: JSON.stringify([YOL.kapak, YOL.ikinci, YOL.taslak].sort()),
  C_kapak: YOL.kapak,
}

describe('INV-IMG-2 hakemi', () => {
  it('doğru üç yüzey → kurulum temiz, ihlal yok', () => {
    expect(degerlendir(dogru)).toEqual({ kurulum: [], ihlal: [] })
  })

  it('kiracı sızıntısı her yüzeyde ADIYLA yakalanır', () => {
    const { ihlal } = degerlendir({ ...dogru, A_kapak: YOL.kiraci, C_yollar: JSON.stringify([YOL.kiraci, YOL.kapak]) })
    const metin = ihlal.join('\n')
    expect(metin).toContain('KİRACI SIZINTISI: A_kapak')
    expect(metin).toContain('KİRACI SIZINTISI: C_yollar')
    expect(metin).toContain('kiraci')
    expect(metin).not.toContain(T2)
  })

  it('taslak ürün vitrine çıkarsa ve görsel sırası bozulursa kırmızı', () => {
    expect(degerlendir({ ...dogru, B_varyant: '["IMG2-A","IMG2-B"]' }).ihlal).toHaveLength(1)
    expect(degerlendir({ ...dogru, B_yollar: JSON.stringify([YOL.ikinci, YOL.kapak]) }).ihlal).toHaveLength(1)
  })

  it('eksik sonda sessiz geçmez: yüzey satırı yoksa ihlal', () => {
    expect(degerlendir(once).ihlal.length).toBeGreaterThanOrEqual(4)
  })

  it('kurulum tutmazsa sonuç okunmaz (kurulum listesi dolu)', () => {
    expect(degerlendir({ ...dogru, K_urun: '0' }).kurulum).toHaveLength(1)
    expect(degerlendir({ ...dogru, once_A_aile: '0' }).kurulum).toHaveLength(1)
    expect(degerlendir({ ...dogru, once_B_yollar: JSON.stringify([YOL.kapak]) }).kurulum).toHaveLength(1)
  })

  it('ayristir yalnız S| satırlarını alır', () => {
    expect(ayristir('BEGIN\nS|A_kapak|x/y.webp\nNOTICE: z\nS|K_urun|2\n')).toEqual({ A_kapak: 'x/y.webp', K_urun: '2' })
  })
})

describe('INV-IMG-2 SQL', () => {
  it('tek işlem ve ROLLBACK ile biter; COMMIT yok', () => {
    const sql = sinavSql().trim()
    expect(sql.startsWith('begin;')).toBe(true)
    expect(sql.endsWith('rollback;')).toBe(true)
    expect(sql).not.toMatch(/\bcommit\b/i)
  })

  it('her sabotaj SQL\'e girer; bilinmeyen sabotaj reddedilir', () => {
    for (const ad of Object.keys(SABOTAJLAR)) expect(sinavSql({ sabotaj: ad })).toContain(`-- SABOTAJ: ${ad}`)
    expect(() => sinavSql({ sabotaj: 'yok-boyle' })).toThrow(/bilinmeyen sabotaj/)
  })

  it('başka kiracının satırı en küçük sort_order ile eklenir (sızarsa kapak olur)', () => {
    const satir = sinavSql().split('\n').find((l) => l.includes(`'${YOL.kiraci}'`))
    expect(satir).toMatch(/, -1\);$/)
  })
})
