import { describe, expect, it } from 'vitest'

import { csvBelgesi, htmlKacis, xlsBelgesi, xlsHucre } from '../belge'

/**
 * ADM-6 (VULN-006 Faz 2) — yönetici dışa aktarımının TEK belge üreticisi.
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1.
 *
 * NİÇİN: 16 yüzey CSV'yi kendi içinde birleştiriyordu; üçü ayrıca XLS (HTML tablo) üretip
 * müşteri adını / e-postasını / iade nedenini HİÇ kaçışlamadan `<td>` içine basıyordu.
 * Excel o dosyayı açınca HTML'i yorumlar: `<img src=//saldirgan>` dışarı istek atar, `=...`
 * hücresi formül olur.
 */

describe('csvBelgesi — başlık ve gövde aynı kapıdan geçer', () => {
  it('BOM ile başlar, satırları \\n ile birleştirir, her hücre çift tırnaklıdır', () => {
    expect(csvBelgesi(['a', 'b'], [[1, 'x']])).toBe('﻿"a","b"\n"1","x"')
  })

  it('gövdedeki formül hücresi nötrlenir', () => {
    const cikti = csvBelgesi(['ad'], [['=HYPERLINK("http://x")']])
    expect(cikti).toBe('﻿"ad"\n"\'=HYPERLINK(""http://x"")"')
  })

  it('başlık da nötrlenir (sözlük metni de olsa kapıdan geçer)', () => {
    expect(csvBelgesi(['-tutar'], [])).toBe('﻿"\'-tutar"')
  })

  it('ayraç seçilebilir', () => {
    expect(csvBelgesi(['a', 'b'], [['x', 'y']], ';')).toBe('﻿"a";"b"\n"x";"y"')
  })

  it('null / undefined boş hücre olur, sayı değişmez', () => {
    expect(csvBelgesi(['a', 'b', 'c'], [[null, undefined, -5]])).toBe('﻿"a","b","c"\n"","","-5"')
  })
})

describe('htmlKacis — XLS hücresinde HTML çalışmaz', () => {
  it('& < > " kaçışlanır (değer yalnız öğe içeriğine yazılır)', () => {
    expect(htmlKacis(`<img src="x" onerror='y'>&`)).toBe(`&lt;img src=&quot;x&quot; onerror='y'&gt;&amp;`)
  })
})

describe('xlsHucre / xlsBelgesi', () => {
  it('formül karakteriyle başlayan hücre önek alır ve HTML kaçışlanır', () => {
    expect(xlsHucre('=1+1')).toBe(`'=1+1`)
    expect(xlsHucre('<b>Ali</b>')).toBe('&lt;b&gt;Ali&lt;/b&gt;')
    expect(xlsHucre(null)).toBe('')
    expect(xlsHucre(-5)).toBe('-5')
  })

  it('müşteri adına gömülen etiket tabloyu bozmaz', () => {
    const html = xlsBelgesi(['Müşteri'], [['<img src=//saldirgan/x>']])
    expect(html).not.toContain('<img')
    expect(html).toContain('<td>&lt;img src=//saldirgan/x&gt;</td>')
    expect(html).toContain('<th>Müşteri</th>')
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
  })

  it('başlıktaki işaretleme de kaçışlanır', () => {
    expect(xlsBelgesi(['<script>'], [])).toContain('<th>&lt;script&gt;</th>')
  })
})
