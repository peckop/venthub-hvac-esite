import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ACIKLAMA_ASGARI, ACIKLAMA_AZAMI, aciklamaKirp } from '../aciklamaKirp'

/**
 * INV-ACIKLAMA-KIRP-1 — meta açıklama TEK yerde, sözcük/cümle sınırına saygılı kesilir (REC-497).
 * Kaynak: canlı kapı 2026-10-02, 29 aile sayfası `substring(0, 160)` ile cümle ortasında bitiyordu.
 */
describe('aciklamaKirp', () => {
  const uzunCumle =
    'Basınç kaybı düşük, enerji verimli ve düşük sesli santrifüj fanlar; kanal tipi uygulamalarda yüksek debi ve geniş çalışma aralığı sunar, bakım gerektirmeyen motor yapısıyla uzun ömür sağlar'

  it('kısa metin aynen döner, boşluklar normalize edilir', () => {
    expect(aciklamaKirp('  Kısa   bir\nmetin. ')).toBe('Kısa bir metin.')
  })

  it('boş, null ve undefined boş dize verir', () => {
    expect(aciklamaKirp('')).toBe('')
    expect(aciklamaKirp('   ')).toBe('')
    expect(aciklamaKirp(null)).toBe('')
    expect(aciklamaKirp(undefined)).toBe('')
  })

  it('uzun metin azami uzunluğu aşmaz ve yarım sözcükle bitmez', () => {
    const sonuc = aciklamaKirp(uzunCumle)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
    const govde = sonuc.slice(0, -1)
    // Kesilen yerden sonra orijinalde boşluk gelmeli: sözcük bütün.
    expect(uzunCumle.startsWith(govde)).toBe(true)
    expect(uzunCumle[govde.length]).toBe(' ')
  })

  it('azami içindeki son cümle sonunda biter', () => {
    const s1 = 'Bu fan ailesi kanal hattına seri bağlanır ve asma tavan arasında görünmeden çalışır.'
    const s2 = 'Motor koruma sensörü standart gelir ve bakım gerektirmez, uzun ömürlüdür ve sessizdir.'
    const sonuc = aciklamaKirp(`${s1} ${s2}`)
    expect(sonuc).toBe(s1)
    expect(sonuc.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
  })

  it('kısaltma noktası cümle sonu sayılmaz', () => {
    const metin =
      'Pervane çapı 500 mm olan bu fan, maks. 12000 m³/h debiye ulaşır ve kanal hattında yüksek basınca dayanır, sessiz çalışır ve bakım gerektirmez'
    const sonuc = aciklamaKirp(metin)
    expect(sonuc.endsWith('maks.')).toBe(false)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
  })

  it('çok kısa ilk cümle yerine sözcük sınırı seçilir', () => {
    const metin = `Kısa giriş. ${uzunCumle}`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc).not.toBe('Kısa giriş.')
    expect(sonuc.length).toBeGreaterThan(ACIKLAMA_ASGARI)
    expect(sonuc.endsWith('…')).toBe(true)
  })

  it('sondaki ayraçlar "…" öncesinde atılır', () => {
    const metin = `${'a'.repeat(100)} ${'b'.repeat(40)}, ${'c'.repeat(40)}`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc).not.toMatch(/[,;:\-–—(]…$/u)
  })

  it('boşluksuz tek uzun parçada zorunlu kesim azami içinde kalır', () => {
    const sonuc = aciklamaKirp('x'.repeat(400))
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
  })

  it('azami parametresi uygulanır', () => {
    expect(aciklamaKirp(uzunCumle, 100).length).toBeLessThanOrEqual(100)
  })

  it('ikinci kez kırpmak değiştirmez (idempotent)', () => {
    const bir = aciklamaKirp(uzunCumle)
    expect(aciklamaKirp(bir)).toBe(bir)
  })
})

/** Çağıran `.substring(0, 160)` ile açıklama kesemez: kırpma TEK modülden gelir. */
describe('INV-ACIKLAMA-KIRP-1 · kaynak taraması', () => {
  const kok = join(__dirname, '..', '..', '..', 'app', '_components')
  const dosyalar = readdirSync(kok).filter((f) => /^(aile|kategori|marka)Sayfasi\.tsx$/.test(f))

  it('aile/kategori/marka sayfa modülleri bulundu', () => {
    expect(dosyalar.sort()).toEqual(['aileSayfasi.tsx', 'kategoriSayfasi.tsx', 'markaSayfasi.tsx'])
  })

  for (const dosya of ['aileSayfasi.tsx', 'kategoriSayfasi.tsx', 'markaSayfasi.tsx']) {
    it(`${dosya}: açıklama .substring/.slice(0, 1xx) ile kesilmiyor`, () => {
      const yol = join(kok, dosya)
      expect(statSync(yol).isFile()).toBe(true)
      const kaynak = readFileSync(yol, 'utf8')
      expect(kaynak).not.toMatch(/\.(substring|slice)\(\s*0\s*,\s*1[0-9]{2}\s*\)/)
    })
  }
})
