import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import KnowledgeBlock from '../../../components/home/KnowledgeBlock'
import { type RehberYazisi, YAZILAR, type YaziMetni } from '../../../data/bilgiMerkezi/yazilar'
import { foldForSearch } from '../../../i18n/case'
import { tr } from '../../../i18n/dictionaries/tr'
import BilgiMerkeziListe from '../../../views/knowledge/BilgiMerkeziListe'
import IlgiliRehberler from '../../../views/knowledge/IlgiliRehberler'
import RehberYazisiSayfasi from '../../../views/knowledge/RehberYazisiSayfasi'
import { yaziSayfasiHazirla } from '../sayfa'
import { enYeniRehberler, ilgiliRehberler } from '../tersDizin'
import { ORNEK_YAZI } from './ornekYazi'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-KART-3 (URN-140, ders tekrar kuralı HRT-70) — rehber kartının özet metni
 * `data-nosnippet` içinde basılır ve kısa bir YÖNLENDİRME cümlesidir.
 *
 * NİÇİN: 18-22 Ekim 2026 ölçümünde rehber 0 gösterim aldı; Lineo Quiet aile sayfası ve kanal kategorisi
 * rehberin kart başlığı + `kartOzeti` metniyle gösterildi (snippet sayfa içeriğinden üretilir, benzer içerik
 * kümelenir). Kural 1: rehberin KENDİ adresi dışındaki hiçbir yüzey (liste sayfası, ana sayfa, kategori, aile,
 * yazı altı) `kartOzeti` metnini `data-nosnippet` kapsayıcısı DIŞINDA basamaz; başlık bağlantısı kapsayıcıda
 * DEĞİLDİR (bağlantı izlenir). Kural 2: `kartOzeti`, aynı yazının meta açıklamasıyla (`ozet`) ve gövde
 * cümleleriyle (normalize edilerek, cümle bazında) birebir aynı olamaz. Üç yayındaki yazı + örnek yazı.
 */

/** Kasa, aksan, NBSP, boşluk ve uç noktalama farkını yok sayar (kartOzeti.test.tsx ile aynı normalleştirme). */
function normal(s: string): string {
  return foldForSearch(s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(), 'tr').replace(/[\s.…!?;:]+$/u, '')
}

/** Markdown gövdeyi düz cümlelere böler: bağlantı hedefi, atıf, tablo ve vurgu işareti atılır. */
function govdeCumleleri(govde: string): string[] {
  const duz = govde
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/\[\s*\d+(?:\s*[,–-]\s*\d+)*\s*\]/g, '')
    .replace(/[[\]|*#>`]/g, ' ')
  return duz
    .split(/[.!?\n]+/u)
    .map(normal)
    .filter((c) => c !== '')
}

/** `kartOzeti` meta açıklamasıyla ya da gövde cümlelerinden biriyle birebir aynı mı: aynıysa nedeni döner. */
function kopyaNedeni(m: Pick<YaziMetni, 'ozet' | 'kartOzeti' | 'govde'>): string | null {
  const k = normal(m.kartOzeti)
  if (k === '') return 'boş'
  if (k === normal(m.ozet)) return 'meta açıklamasıyla aynı'
  if (govdeCumleleri(m.govde).includes(k)) return 'gövde cümlesiyle aynı'
  return null
}

/**
 * Kapsayıcıdaki, metni `ozetler`den birini içeren her ELEMANIN `data-nosnippet` altında olup olmadığını denetler;
 * ihlal eden eleman metinlerini döner (boş dizi = temiz). Başlık bağlantısı (`a`) kapsayıcıda olmamalıdır.
 */
function nosnippetDisindakiOzetler(kap: ParentNode, ozetler: readonly string[]): string[] {
  const ihlal: string[] = []
  for (const el of Array.from(kap.querySelectorAll('*'))) {
    // Yalnız KENDİ metin düğümü özeti taşıyan eleman (üst kapsayıcıları ikilememek için).
    const kendi = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent ?? '')
      .join('')
    const ozet = ozetler.find((o) => o.trim() !== '' && kendi.includes(o))
    if (ozet && !el.closest('[data-nosnippet]')) ihlal.push(ozet)
  }
  return ihlal
}

const TR_METINLER = YAZILAR.map((y) => ({ y, m: y.diller.tr as YaziMetni })).filter((x) => x.m)
const OZETLER = TR_METINLER.map((x) => x.m.kartOzeti)
const baslik = tr.bilgiMerkezi.ilgiliRehberler

describe('kart özeti data-nosnippet içinde basılır — her yüzey', () => {
  it('ölçüm evreni boş değil (üç yayındaki yazı)', () => {
    expect(TR_METINLER.length).toBeGreaterThanOrEqual(3)
  })

  it('⭐Bilgi Merkezi liste sayfası kartları', () => {
    const { container } = render(<BilgiMerkeziListe dil="tr" yazilar={[...YAZILAR, ORNEK_YAZI]} />)
    const tum = [...OZETLER, (ORNEK_YAZI.diller.tr as YaziMetni).kartOzeti]
    for (const o of tum) expect(container.textContent).toContain(o)
    expect(nosnippetDisindakiOzetler(container, tum)).toEqual([])
    // Başlık bağlantısı kapsayıcıda DEĞİL: `a` kendisi data-nosnippet taşımaz, başlık (h2) kapsayıcı altında değildir.
    expect(container.querySelectorAll('a[data-nosnippet]').length).toBe(0)
    expect(container.querySelectorAll('h2[data-nosnippet], h2 [data-nosnippet]').length).toBe(0)
  })

  it('⭐ana sayfa Bilgi bloğu', () => {
    const { container } = render(<KnowledgeBlock dictionary={tr.home.knowledge} finalCtaDict={tr.home.finalCta} lang="tr" />)
    // Blok yalnız en yeni rehberleri basar (varsayılan 3); dördüncü yazıyla en eski çıkar (BLG-18).
    const blokOzetleri = enYeniRehberler('tr').map((r) => r.kartOzeti)
    expect(blokOzetleri.length).toBeGreaterThan(0)
    for (const o of blokOzetleri) expect(container.textContent).toContain(o)
    expect(nosnippetDisindakiOzetler(container, OZETLER)).toEqual([])
    expect(container.querySelectorAll('a[data-nosnippet]').length).toBe(0)
  })

  it('⭐kategori ve aile sayfası "ilgili rehberler" kartları (başlık bağlantısı kapsayıcıda değil)', () => {
    for (const hedef of [
      'vh:kategori/frequency-converters',
      'vh:kategori/duct-fans',
      'vh:kategori/bathroom-toilet-fans',
      'vh:kategori/axial-industrial-fans',
      'vh:aile/danfoss-vlt-micro-drive-fc-51',
      'vh:aile/vortice-lineo-quiet-sessiz-kanal-fanlari',
    ] as const) {
      const rehberler = ilgiliRehberler(hedef, 'tr', 3, YAZILAR, false)
      expect(rehberler.length, hedef).toBeGreaterThan(0)
      const { container, unmount } = render(<IlgiliRehberler rehberler={rehberler} baslik={baslik} />)
      const ozetler = rehberler.map((r) => r.kartOzeti)
      for (const o of ozetler) expect(container.textContent, hedef).toContain(o)
      expect(nosnippetDisindakiOzetler(container, ozetler), hedef).toEqual([])
      expect(container.querySelectorAll('a[data-nosnippet]').length, hedef).toBe(0)
      // Özet span'ında var; başlık span'ında yok.
      for (const a of Array.from(container.querySelectorAll('li a'))) {
        const spanlar = Array.from(a.querySelectorAll('span'))
        expect(spanlar[0]?.hasAttribute('data-nosnippet'), `${hedef}: başlık`).toBe(false)
        expect(spanlar[1]?.hasAttribute('data-nosnippet'), `${hedef}: özet`).toBe(true)
      }
      unmount()
    }
  })

  it('⭐yazı altı "ilgili yazılar" kartı', async () => {
    const m0 = ORNEK_YAZI.diller.tr as YaziMetni
    const es: RehberYazisi = {
      ...ORNEK_YAZI,
      kimlik: 'es-konu',
      diller: { tr: { ...m0, slug: 'es-konu', ozet: 'Eş yazının meta açıklaması ayrı bir cümledir.', kartOzeti: 'Eş yazının yönlendirme cümlesi farklıdır.' } },
    }
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI, es])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(container.textContent).toContain('Eş yazının yönlendirme cümlesi farklıdır.')
    expect(nosnippetDisindakiOzetler(container, ['Eş yazının yönlendirme cümlesi farklıdır.'])).toEqual([])
    expect(container.querySelectorAll('a[data-nosnippet]').length).toBe(0)
  })

  it('SABOTAJ — özet data-nosnippet DIŞINA taşınınca kapı kırmızı (kapı kötü girdiyi yakalıyor)', () => {
    const rehberler = ilgiliRehberler('vh:kategori/duct-fans', 'tr', 3, YAZILAR, false)
    const ozetler = rehberler.map((r) => r.kartOzeti)
    const { container } = render(<IlgiliRehberler rehberler={rehberler} baslik={baslik} />)
    expect(nosnippetDisindakiOzetler(container, ozetler)).toEqual([])
    // Sabotaj 1: özet span'ından işaret kalkar.
    container.querySelectorAll('[data-nosnippet]').forEach((e) => e.removeAttribute('data-nosnippet'))
    expect(nosnippetDisindakiOzetler(container, ozetler).length).toBeGreaterThan(0)
    // Sabotaj 2: özet işaretli kapsayıcının yanına, dışına kopyalanır (aynı metin ikinci kez, işaretsiz).
    const { container: temiz } = render(<IlgiliRehberler rehberler={rehberler} baslik={baslik} />)
    const kopya = document.createElement('p')
    kopya.textContent = ozetler[0] ?? ''
    temiz.appendChild(kopya)
    expect(nosnippetDisindakiOzetler(temiz, ozetler)).toEqual([ozetler[0]])
  })
})

describe('kategori → rehber eşlemesi (sessiz fan rehberi)', () => {
  it('⭐banyo-tuvalet fanları ve aksiyel fanlar kategorisinden sessiz fan rehberi gelir', () => {
    const sessiz = TR_METINLER.find((x) => x.y.kimlik === 'sessiz-fan-secimi')
    expect(sessiz, 'yazı yayından kalktıysa bu testi de güncelle').toBeDefined()
    for (const hedef of ['vh:kategori/bathroom-toilet-fans', 'vh:kategori/axial-industrial-fans'] as const) {
      const r = ilgiliRehberler(hedef, 'tr', 3, YAZILAR, false)
      expect(r.map((x) => x.href), hedef).toContain(`/tr/bilgi-merkezi/${sessiz?.m.slug}`)
    }
  })

  it('SABOTAJ — bağlantısı olmayan kategoriden rehber gelmez; alan silinirse bağlantı düşer', () => {
    expect(ilgiliRehberler('vh:kategori/air-curtains', 'tr', 3, YAZILAR, false).map((x) => x.href)).not.toContain(
      '/tr/bilgi-merkezi/sessiz-fan-nasil-secilir',
    )
    const sessiz = YAZILAR.find((y) => y.kimlik === 'sessiz-fan-secimi') as RehberYazisi
    const alansiz: RehberYazisi = { ...sessiz, ilgiliKategoriler: undefined }
    expect(ilgiliRehberler('vh:kategori/bathroom-toilet-fans', 'tr', 3, [alansiz], false)).toEqual([])
  })
})

describe('kart özeti kopya değil — meta açıklaması ve gövde cümleleri', () => {
  it('⭐üç yayındaki yazı + örnek yazı: kartOzeti ne ozet ne gövde cümlesiyle birebir aynı', () => {
    const evren = [...TR_METINLER.map((x) => ({ ad: x.y.kimlik, m: x.m })), { ad: 'ornek', m: ORNEK_YAZI.diller.tr as YaziMetni }]
    expect(evren.length).toBeGreaterThanOrEqual(4)
    for (const { ad, m } of evren) expect(kopyaNedeni(m), ad).toBeNull()
  })

  it('SABOTAJ — kartOzeti meta açıklamasıyla ya da bir gövde cümlesiyle aynı yapılınca kapı kırmızı', () => {
    const { m } = TR_METINLER[0] as (typeof TR_METINLER)[number]
    expect(kopyaNedeni(m)).toBeNull()
    // Meta açıklamasıyla aynı (kasa, NBSP ve uç nokta farkı yok sayılır).
    expect(kopyaNedeni({ ...m, kartOzeti: ` ${m.ozet.toUpperCase().replace(/\.$/, '')} ` })).toBe('meta açıklamasıyla aynı')
    // Gövdedeki bir cümleyle aynı (ilk paragraf cümlesi; atıf işareti ve bağlantı biçimi atılır).
    const cumle = m.govde.split('\n').find((s) => s.trim() !== '' && !s.startsWith('#') && !s.startsWith('|')) ?? ''
    const ilkCumle = (cumle.split(/(?<=\.)\s/)[0] ?? '').replace(/\s*\[\d+\]/g, '')
    expect(ilkCumle.length).toBeGreaterThan(20)
    expect(kopyaNedeni({ ...m, ozet: 'Başka bir cümledir.', kartOzeti: ilkCumle })).toBe('gövde cümlesiyle aynı')
    // Boş kart de kopya sayılır (ayrı: boş kutu kapısı kartOzeti.test.tsx'te).
    expect(kopyaNedeni({ ...m, kartOzeti: '  ' })).toBe('boş')
  })
})
