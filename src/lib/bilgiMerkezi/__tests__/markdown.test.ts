import { describe, expect, it } from 'vitest'

import {
  baglantilariTopla,
  capaUret,
  hedefDenetle,
  icindekiler,
  markdownAyristir,
  MarkdownHatasi,
  okumaSuresiDakika,
} from '../markdown'

/**
 * INV-BILGI-MERKEZI-MARKDOWN-1 — rehber gövdesi izin listeli alt kümeyle ayrıştırılır; desteklenmeyen
 * biçim ve izin listesi dışındaki bağlantı SESSİZ GEÇMEZ (rehber-yazisi-standard.md R3/R6).
 */

const ORNEK = `# Başlık

İlk paragraf **kalın** ve *eğik* ve [ürün](vh:aile/vortice-hava-perdesi) içerir.

## Seçim ve boyutlandırma

- birinci madde
- ikinci [kaynak](https://example.org/belge)

### Alt soru

| Tür | Kullanım |
| --- | --- |
| A | konfor |

## Kaynaklar

1. Bir kaynak

## Teknik sorumluluk notu

Not.
`

describe('markdownAyristir', () => {
  it('tek H1 + H2/H3 + liste + tablo ayrışır', () => {
    const y = markdownAyristir(ORNEK)
    expect(y.h1).toBe('Başlık')
    expect(y.bloklar.map((b) => b.tur)).toEqual([
      'paragraf',
      'baslik',
      'liste',
      'baslik',
      'tablo',
      'baslik',
      'liste',
      'baslik',
      'paragraf',
    ])
    const tablo = y.bloklar.find((b) => b.tur === 'tablo')
    expect(tablo && tablo.tur === 'tablo' ? tablo.satirlar.length : -1).toBe(1)
  })

  it('içindekiler H2lerden çıkar; Kaynaklar ve Teknik sorumluluk notu HARİÇ (R3)', () => {
    expect(icindekiler(markdownAyristir(ORNEK))).toEqual([{ id: 'secim-ve-boyutlandirma', metin: 'Seçim ve boyutlandırma' }])
  })

  it('bağlantılar tekrarsız toplanır', () => {
    expect(baglantilariTopla(markdownAyristir(ORNEK))).toEqual(['vh:aile/vortice-hava-perdesi', 'https://example.org/belge'])
  })

  it('H1 yoksa ya da iki H1 varsa ATAR', () => {
    expect(() => markdownAyristir('Paragraf')).toThrow(MarkdownHatasi)
    expect(() => markdownAyristir('# Bir\n\n# İki')).toThrow(/H1/)
  })

  it('desteklenmeyen biçim ATAR: H4, kod bloğu, ham HTML, görsel, bozuk tablo', () => {
    expect(() => markdownAyristir('# A\n\n#### dört')).toThrow(/H4/)
    expect(() => markdownAyristir('# A\n\n```\nkod\n```')).toThrow(/kod/)
    expect(() => markdownAyristir('# A\n\n<script>alert(1)</script>')).toThrow(/HTML/)
    expect(() => markdownAyristir('# A\n\n![g](https://example.org/a.png)')).toThrow(/görsel/)
    expect(() => markdownAyristir('# A\n\n| a | b |\n| c | d |')).toThrow(/ayraç/)
  })

  it('satır içi `<script>` HTML değil METİN olarak kalır (ağaçta etiket yok)', () => {
    const y = markdownAyristir('# A\n\nmetin <b>kalın değil</b> son')
    const p = y.bloklar[0]
    expect(p.tur === 'paragraf' ? p.icerik : []).toEqual([{ tur: 'metin', metin: 'metin <b>kalın değil</b> son' }])
  })
})

describe('hedefDenetle — BLOG icBaglantiDenetle ile aynı biçim', () => {
  it('kimlik ve dış kaynak geçer', () => {
    for (const h of ['vh:model/vrt-65155', 'vh:kategori/air-curtains', 'vh:sayfa/iletisim', 'https://ec.europa.eu/x', '#bolum', 'mailto:a@b.c']) {
      expect(() => hedefDenetle(h), h).not.toThrow()
    }
  })

  it('düz site adresi, göreli adres ve bozuk kimlik ATAR', () => {
    for (const h of [
      '/tr/category/hava-perdeleri',
      'https://venthub.com.tr/tr/products/x',
      'https://www.venthub.com.tr',
      'products/x',
      'vh:urun/x',
      'vh:aile/',
      'vh:aile/-x',
    ]) {
      expect(() => hedefDenetle(h), h).toThrow(MarkdownHatasi)
    }
  })
})

describe('yardımcılar', () => {
  it('çapa Türkçe harfleri sadeleştirir ve tekrarı numaralar', () => {
    expect(capaUret('Sık sorulan sorular')).toBe('sik-sorulan-sorular')
    expect(capaUret('İçindekiler & Özet')).toBe('icindekiler-ozet')
    const y = markdownAyristir('# A\n\n## Aynı\n\n## Aynı')
    expect(y.bloklar.map((b) => (b.tur === 'baslik' ? b.id : ''))).toEqual(['ayni', 'ayni-2'])
  })

  it('okuma süresi: kelime ÷ 200, yukarı yuvarlanır, en az 1 (R3 künye)', () => {
    expect(okumaSuresiDakika('# A\n\nkısa')).toBe(1)
    expect(okumaSuresiDakika(`# A\n\n${'kelime '.repeat(401)}`)).toBe(3)
  })
})
