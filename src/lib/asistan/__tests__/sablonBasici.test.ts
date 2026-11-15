import { describe, expect, it } from 'vitest'

import { adresUret } from '@/utils/adresUret'

import { MAKS_URUN } from '../hataYollari'
import { cevapMetniUret, sayiMetni } from '../sablonBasici'
import type { Karsilastirma } from '../semalar'
import {
  ADH_225,
  ADH_225_ID,
  cevirEn,
  cevirTr,
  cokSatir,
  hamSatir,
  LINEO_125,
  LINEO_125_3M,
  LINEO_125_3M_ID,
  LINEO_125_ID,
  satirKur,
  SEAT_20,
  SEAT_20_B,
  SEAT_20_B_ID,
  SEAT_20_ID,
  STORM_16,
  STORM_16_ID,
} from './fikstur'

const tr = (satirlar: Parameters<typeof cevapMetniUret>[0]['satirlar'], karsilastirma?: Karsilastirma) =>
  cevapMetniUret({ satirlar, karsilastirma, dil: 'tr', cevir: cevirTr })

function karsilastirma(basvurular: Array<[string, Karsilastirma['basvurular'][number]['alan']]>, gerekce: Karsilastirma['gerekceKodlari'] = []) {
  return { basvurular: basvurular.map(([urunId, alan]) => ({ urunId, alan })), gerekceKodlari: gerekce } satisfies Karsilastirma
}

describe('sayiMetni: sayı satırdan, dile göre, yuvarlamasız', () => {
  it.each([
    [2000, 'tr', '2.000'],
    [2000, 'en', '2,000'],
    [0.18, 'tr', '0,18'],
    [0.18, 'en', '0.18'],
    [2.2, 'tr', '2,2'],
    [45.5, 'tr', '45,5'],
    [0.125, 'tr', '0,125'],
    [125, 'tr', '125'],
    [1250000, 'tr', '1.250.000'],
    [1250000, 'en', '1,250,000'],
    [5200, 'tr', '5.200'],
  ] as const)('%s (%s) → %s', (n, dil, beklenen) => {
    expect(sayiMetni(n, dil)).toBe(beklenen)
  })

  it('üstel yazımlı değer çıplak yazıma düşer (yuvarlanmaz, fırlatmaz)', () => {
    expect(sayiMetni(1e21, 'tr')).toBe('1e+21')
  })
})

describe('cevapMetniUret: liste', () => {
  it('SEAT 20: etiketler, sayılar, birimler ve bağlantı satırdan basılır (tam metin)', () => {
    const baglanti = String(adresUret({ tur: 'aile', slug: SEAT_20.slug }, 'tr'))
    expect(baglanti.startsWith('/tr/')).toBe(true)
    expect(tr([SEAT_20]).metin).toBe(
      [
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V',
        '  Serbest üfleme (0 Pa) en yüksek debi: 2.000 m³/h; Çap: 125 mm; Maks. statik basınç: 250 Pa; Ses basıncı: 45,5 dB(A) · 3 m; IP sınıfı: IP55',
        `  ${baglanti}`,
      ].join('\n'),
    )
  })

  it('İngilizce: etiketler sözlükten, sayı biçimi EN, bağlantı /en/', () => {
    const sonuc = cevapMetniUret({ satirlar: [SEAT_20], dil: 'en', cevir: cevirEn })
    expect(sonuc.metin).toContain('Maximum airflow, free blowing (0 Pa): 2,000 m³/h')
    expect(sonuc.metin).toContain('Sound pressure: 45.5 dB(A) · 3 m')
    expect(sonuc.metin).toContain('IP rating: IP55')
    expect(sonuc.metin).toContain(String(adresUret({ tur: 'aile', slug: SEAT_20.slug }, 'en')))
    expect(sonuc.metin).not.toContain('2.000')
  })

  it('debi etiketi "serbest üfleme (0 Pa) en yüksek debi"; nominal debi ayrı etiketle ve birbirine karışmaz', () => {
    const metin = tr([LINEO_125]).metin
    expect(metin).toContain('Serbest üfleme (0 Pa) en yüksek debi: 190 m³/h')
    expect(metin).toContain('Nominal debi: 150 m³/h')
    expect(metin).not.toMatch(/Nominal debi: 190/)
  })

  it('ATEX değeri ve ürün adındaki 94/9, 950, 0,18 gibi sayılar aynen basılır', () => {
    const metin = tr([STORM_16, SEAT_20]).metin
    expect(metin).toContain('ATEX bölgesi: Zone 2, Category 3G, Directive 94/9/CE')
    expect(metin).toContain('• STORM 16 ATEX · 2800 d/dk · 2,2 kW')
    expect(metin).toContain('• SEAT 20 · 950 d/dk · 0,18 kW · 380V')
  })

  it('ses: noise_level_db_a için sayı BASILMAZ, "karşılaştırılamaz (ölçüm koşulu yok)" yazılır', () => {
    const metin = tr([LINEO_125]).metin
    expect(metin).toContain('Ses düzeyi: karşılaştırılamaz (ölçüm koşulu yok)')
    expect(metin).not.toMatch(/(?<![\d.,])38(?![\d.,])/)
  })

  it('ses: noise_lpa_3m_db her zaman "3 m" koşuluyla basılır', () => {
    const metin = tr([SEAT_20, STORM_16, SEAT_20_B, LINEO_125_3M]).metin
    const dbler = metin.match(/\d[\d.,]* dB\(A\)[^;\n]*/g) ?? []
    expect(dbler.length).toBe(4)
    for (const d of dbler) expect(d).toMatch(/ dB\(A\) · 3 m$/)
  })

  it('bağlantı adresUret\'ten gelir; sayfası olmayan (UUID) slug\'da bağlantı satırı basılmaz, fırlatmaz', () => {
    const uuidSlug = satirKur(
      hamSatir({ id: ADH_225_ID, name: 'ADH-225 E2', slug: '33333333-3333-4333-8333-333333333333', marka: null, specs: {} }),
    )
    const metin = tr([uuidSlug]).metin
    expect(metin).toBe('• ADH-225 E2')
  })

  it('özelliği olmayan ürün yalnız ad ve bağlantıyla görünür (sessizce atılmaz)', () => {
    const bos = satirKur(hamSatir({ id: ADH_225_ID, name: 'ADH-225 E2', slug: 'adh-225-e2', marka: null, specs: {} }))
    const metin = tr([bos]).metin.split('\n')
    expect(metin[0]).toBe('• ADH-225 E2')
    expect(metin).toHaveLength(2)
  })

  it('ham anahtar ya da yer tutucu sızmaz', () => {
    const metin = tr([SEAT_20, LINEO_125, STORM_16], karsilastirma([[SEAT_20_ID, 'max_delivery_m3h']])).metin
    expect(metin).not.toMatch(/asistan\.|\{\{/)
  })
})

describe('cevapMetniUret: boş ve çok geniş süzgeç', () => {
  it('satır yoksa sabit mesaj ve durum "bos"', () => {
    const sonuc = tr([])
    expect(sonuc).toEqual({
      metin: cevirTr('asistan.hata.suzgecBos'),
      durum: 'bos',
      gosterilen: 0,
      toplam: 0,
      kirpildi: false,
    })
    expect(tr([], karsilastirma([[SEAT_20_ID, 'diameter_mm']])).durum).toBe('bos')
  })

  it('MAKS_URUN\'den çok satır: ilk 20 gösterilir, daralt mesajı eklenir, toplam korunur', () => {
    const satirlar = cokSatir(25)
    const sonuc = tr(satirlar)
    expect(sonuc.gosterilen).toBe(MAKS_URUN)
    expect(sonuc.toplam).toBe(25)
    expect(sonuc.kirpildi).toBe(true)
    expect(sonuc.metin).toContain('• Test Fan 20\n')
    expect(sonuc.metin).not.toContain('Test Fan 21')
    expect(sonuc.metin).toContain('ilk 20 ürün gösteriliyor')
  })

  it('tam 20 satırda daralt mesajı yok', () => {
    const sonuc = tr(cokSatir(20))
    expect(sonuc.kirpildi).toBe(false)
    expect(sonuc.metin).not.toContain('gösteriliyor')
  })
})

describe('cevapMetniUret: karşılaştırma', () => {
  it('EN_YUKSEK_DEBI: değere göre azalan sıralanır, veri olmayan ürün sona gider ve "bu üründe veri yok" yazılır', () => {
    const k = karsilastirma(
      [
        [SEAT_20_ID, 'max_delivery_m3h'],
        [ADH_225_ID, 'max_delivery_m3h'],
        [STORM_16_ID, 'max_delivery_m3h'],
      ],
      ['EN_YUKSEK_DEBI'],
    )
    const metin = tr([SEAT_20, STORM_16, ADH_225], k).metin
    const blok = metin.slice(metin.indexOf('Karşılaştırma'))
    expect(blok).toBe(
      [
        'Karşılaştırma',
        'Serbest üfleme (0 Pa) en yüksek debi:',
        '• STORM 16 ATEX · 2800 d/dk · 2,2 kW: 5.200 m³/h',
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 2.000 m³/h',
        '• ADH-225 E2: bu üründe veri yok',
        'Değerlere göre yüksekten düşüğe sıralıdır.',
      ].join('\n'),
    )
  })

  it('gerekçe kodu yoksa model sırası korunur ve sıralama notu yazılmaz', () => {
    const k = karsilastirma([
      [SEAT_20_ID, 'max_delivery_m3h'],
      [STORM_16_ID, 'max_delivery_m3h'],
    ])
    const metin = tr([SEAT_20, STORM_16], k).metin
    expect(metin.indexOf('• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 2.000')).toBeLessThan(metin.indexOf('• STORM 16 ATEX · 2800 d/dk · 2,2 kW: 5.200'))
    expect(metin).not.toContain('sıralıdır')
  })

  it('FARKLI üreticilerin ses değeri sıralanmaz (gerekçe EN_DUSUK_SES istese bile) ve not düşülür', () => {
    const k = karsilastirma(
      [
        [SEAT_20_ID, 'noise_lpa_3m_db'],
        [LINEO_125_3M_ID, 'noise_lpa_3m_db'],
      ],
      ['EN_DUSUK_SES'],
    )
    const metin = tr([SEAT_20, LINEO_125_3M], k).metin
    const blok = metin.slice(metin.indexOf('Karşılaştırma'))
    expect(blok).toBe(
      [
        'Karşılaştırma',
        'Ses basıncı:',
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 45,5 dB(A) · 3 m',
        '• Vortice Lineo 125: 42,6 dB(A) · 3 m',
        'Farklı üreticilerin ses değerleri aynı sıralamada karşılaştırılmaz.',
      ].join('\n'),
    )
  })

  it('markası bilinmeyen ürünle karşılaştırma da sıralanmaz (belirsizlik = farklı)', () => {
    const markasiz = satirKur(
      hamSatir({ id: ADH_225_ID, name: 'ADH-225 E2', slug: 'adh-225-e2', marka: null, specs: { noise_lpa_3m_db: 50 } }),
    )
    const k = karsilastirma(
      [
        [SEAT_20_ID, 'noise_lpa_3m_db'],
        [ADH_225_ID, 'noise_lpa_3m_db'],
      ],
      ['EN_DUSUK_SES'],
    )
    const metin = tr([SEAT_20, markasiz], k).metin
    expect(metin).toContain('Farklı üreticilerin ses değerleri')
    expect(metin).not.toContain('sıralıdır')
  })

  it('AYNI üreticinin ses değeri (büyük/küçük harf farkı önemsiz) artan sıralanır, not düşülmez', () => {
    const k = karsilastirma(
      [
        [SEAT_20_ID, 'noise_lpa_3m_db'],
        [SEAT_20_B_ID, 'noise_lpa_3m_db'],
      ],
      ['EN_DUSUK_SES'],
    )
    const metin = tr([SEAT_20, SEAT_20_B], k).metin
    const blok = metin.slice(metin.indexOf('Karşılaştırma'))
    expect(blok).toBe(
      [
        'Karşılaştırma',
        'Ses basıncı:',
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 39,5 dB(A) · 3 m',
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 45,5 dB(A) · 3 m',
        'Değerlere göre düşükten yükseğe sıralıdır.',
      ].join('\n'),
    )
    expect(blok).not.toContain('Farklı üreticilerin')
  })

  it('iki ses anahtarı AYRI bloklardadır, birleştirilmez; mesafesiz değerin sayısı basılmaz', () => {
    const k = karsilastirma([
      [LINEO_125_ID, 'noise_level_db_a'],
      [SEAT_20_ID, 'noise_lpa_3m_db'],
    ])
    const metin = tr([LINEO_125, SEAT_20], k).metin
    const blok = metin.slice(metin.indexOf('Karşılaştırma'))
    expect(blok).toBe(
      [
        'Karşılaştırma',
        'Ses düzeyi:',
        '• Vortice Lineo 125: karşılaştırılamaz (ölçüm koşulu yok)',
        'Ses basıncı:',
        '• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 45,5 dB(A) · 3 m',
      ].join('\n'),
    )
    // "380V" ürün adında geçer (sahte-yeşil tuzağı): 38 değeri YALNIZ ayrı sayı olarak aranır.
    expect(blok).not.toMatch(/(?<![\d.,])38(?![\d.,])/)
  })

  it('satırlarda olmayan ürüne başvuru atılır; hepsi atılırsa karşılaştırma bölümü hiç yazılmaz', () => {
    const yabanci = '99999999-9999-4999-8999-999999999999'
    const kismi = tr([SEAT_20], karsilastirma([[yabanci, 'diameter_mm'], [SEAT_20_ID, 'diameter_mm']])).metin
    expect(kismi).toContain('Çap:\n• SEAT 20 · 950 d/dk · 0,18 kW · 380V: 125 mm')
    expect(kismi).not.toContain(yabanci)
    const hic = tr([SEAT_20], karsilastirma([[yabanci, 'diameter_mm']])).metin
    expect(hic).not.toContain('Karşılaştırma')
  })

  it('aynı başvuru tekrarlanırsa bir kez yazılır; kimlik büyük harfle gelse de eşleşir', () => {
    const k = karsilastirma([
      [SEAT_20_ID, 'diameter_mm'],
      [SEAT_20_ID.toUpperCase(), 'diameter_mm'],
      [SEAT_20_ID, 'diameter_mm'],
    ])
    const metin = tr([SEAT_20], k).metin
    expect(metin.match(/: 125 mm/g)).toHaveLength(2) // liste satırı + karşılaştırma satırı, ikincisi tek
  })

  it('metin alanları (IP, ATEX) sıralanmaz ama basılır; eksikse "bu üründe veri yok"', () => {
    const k = karsilastirma(
      [
        [ADH_225_ID, 'ip_rating'],
        [SEAT_20_ID, 'ip_rating'],
        [SEAT_20_ID, 'atex_zone'],
      ],
      ['IP_KORUMA', 'ATEX_BOLGESI'],
    )
    const blok = tr([SEAT_20, ADH_225], k).metin
    expect(blok).toContain('IP sınıfı:\n• ADH-225 E2: IP54\n• SEAT 20 · 950 d/dk · 0,18 kW · 380V: IP55')
    expect(blok).toContain('ATEX bölgesi:\n• SEAT 20 · 950 d/dk · 0,18 kW · 380V: bu üründe veri yok')
    expect(blok).not.toContain('sıralıdır')
  })

  it('İngilizce karşılaştırma: etiketler ve notlar sözlükten', () => {
    const k = karsilastirma([[SEAT_20_ID, 'max_delivery_m3h'], [STORM_16_ID, 'max_delivery_m3h']], ['EN_YUKSEK_DEBI'])
    const metin = cevapMetniUret({ satirlar: [SEAT_20, STORM_16], karsilastirma: k, dil: 'en', cevir: cevirEn }).metin
    expect(metin).toContain('Comparison\nMaximum airflow, free blowing (0 Pa):\n• STORM 16 ATEX · 2800 d/dk · 2,2 kW: 5,200 m³/h')
    expect(metin).toContain('Sorted by value, highest to lowest.')
  })
})

describe('cevapMetniUret: yargı sözcüğü ve ham veri', () => {
  it('hiçbir çıktıda "uygun" ya da "suitable" geçmez', () => {
    const k = karsilastirma(
      [
        [SEAT_20_ID, 'max_delivery_m3h'],
        [LINEO_125_3M_ID, 'noise_lpa_3m_db'],
        [ADH_225_ID, 'ip_rating'],
      ],
      ['EN_YUKSEK_DEBI', 'EN_DUSUK_SES', 'IP_KORUMA'],
    )
    const satirlar = [SEAT_20, STORM_16, ADH_225, LINEO_125, LINEO_125_3M]
    const cikti = [
      tr(satirlar, k).metin,
      tr([]).metin,
      tr(cokSatir(30)).metin,
      cevapMetniUret({ satirlar, karsilastirma: k, dil: 'en', cevir: cevirEn }).metin,
      cevapMetniUret({ satirlar: [], dil: 'en', cevir: cevirEn }).metin,
    ]
    for (const metin of cikti) expect(metin).not.toMatch(/uygun|suitab/i)
  })

  it('modele hiç gitmeyen alanlar (sku, model kodu, fiyat, açıklama) çıktıya da girmez', () => {
    const metin = tr([SEAT_20, STORM_16, ADH_225, LINEO_125]).metin
    expect(metin).not.toMatch(/SENTINEL|1234|999\.9|barkod/i)
  })
})
