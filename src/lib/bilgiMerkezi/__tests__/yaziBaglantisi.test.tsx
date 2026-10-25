import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { type RehberYazisi, YAZILAR, type YaziMetni } from '../../../data/bilgiMerkezi/yazilar'
import RehberGovdesi from '../../../views/knowledge/RehberGovdesi'
import { icBaglantiCoz, IcBaglantiHatasi, icBaglantilariCoz } from '../icBaglanti'
import { baglantilariTopla, hedefDenetle, markdownAyristir } from '../markdown'
import { yaziSayfasiHazirla } from '../sayfa'
import { ilgiliRehberler, yazininHedefleri } from '../tersDizin'
import { ORNEK_YAZI } from './ornekYazi'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-YAZI-BAGLANTISI-1 (URN-140) — `vh:yazi/<yazı kimliği>`: rehberden rehbere bağlantı.
 * Çözücü, derleme kapısı (bilinmeyen kimlik ve kendine bağlantı KIRMIZI), gövde render'ı ve ters dizin.
 * Fikstürler sentetik: yayındaki üç yazı yalnız TR'dir, EN kolunu ORNEK_YAZI ölçer.
 */

const tr = ORNEK_YAZI.diller.tr as YaziMetni
const en = ORNEK_YAZI.diller.en as YaziMetni

/** ORNEK_YAZI'nın kopyası: kimlik, slug'lar ve gövdeye eklenen satır değişir. */
function yazi(kimlik: string, slugTr: string, slugEn: string | null, ek: string = ''): RehberYazisi {
  return {
    ...ORNEK_YAZI,
    kimlik,
    urunler: [],
    diller: {
      tr: { ...tr, slug: slugTr, govde: `${tr.govde}\n${ek}\n` },
      ...(slugEn ? { en: { ...en, slug: slugEn, govde: `${en.govde}\n${ek}\n` } } : {}),
    },
  }
}

const A = yazi('yazi-a', 'yazi-a-tr', 'article-a-en')
const SADECE_TR = yazi('sadece-tr', 'sadece-tr-slug', null)

describe('vh:yazi — çözücü', () => {
  const k = sahteKaynak()

  it('TR ve EN dilli adres: yazının kimliği → o dilin slug\'ı (kimlik ≠ slug), adres SSOT\'tan', async () => {
    expect(await icBaglantiCoz('vh:yazi/yazi-a', 'tr', k, [A])).toBe('/tr/bilgi-merkezi/yazi-a-tr')
    expect(await icBaglantiCoz('vh:yazi/yazi-a', 'en', k, [A])).toBe('/en/knowledge-hub/article-a-en')
  })

  it('yayındaki yazıların gerçek kimlikleri çözülür (varsayılan evren YAZILAR)', async () => {
    expect(YAZILAR.length).toBeGreaterThan(0)
    for (const y of YAZILAR) {
      for (const dil of ['tr', 'en'] as const) {
        const m = y.diller[dil]
        if (!m) continue
        expect(await icBaglantiCoz(`vh:yazi/${y.kimlik}`, dil, k), `${y.kimlik}/${dil}`).toBe(
          dil === 'tr' ? `/tr/bilgi-merkezi/${m.slug}` : `/en/knowledge-hub/${m.slug}`,
        )
      }
    }
  })

  it('toplu çözüm: yazı kimliği diğer türlerle birlikte çözülür', async () => {
    const m = await icBaglantilariCoz(['vh:yazi/yazi-a', 'vh:kategori/air-curtains'], 'tr', k, [A])
    expect(m.get('vh:yazi/yazi-a')).toBe('/tr/bilgi-merkezi/yazi-a-tr')
    expect(m.get('vh:kategori/air-curtains')).toBe('/tr/category/hava-perdeleri')
  })

  it('⛔SABOTAJ: var olmayan kimlik ATAR; hata mesajı mevcut kimlikleri sayar', async () => {
    const hata = await icBaglantiCoz('vh:yazi/olmayan-yazi', 'tr', k, [A]).catch((e) => e)
    expect(hata).toBeInstanceOf(IcBaglantiHatasi)
    expect(String(hata.message)).toBe(
      '[bilgi merkezi] iç bağlantı çözülemedi: vh:yazi/olmayan-yazi — rehber yazısı yok (anahtar yazı kimliğidir, slug değil; tr dilindekiler: yazi-a)',
    )
  })

  it('⛔SABOTAJ: yazının SLUG\'ı kimlik yerine yazılırsa ATAR (slug ≠ kimlik)', async () => {
    await expect(icBaglantiCoz('vh:yazi/yazi-a-tr', 'tr', k, [A])).rejects.toBeInstanceOf(IcBaglantiHatasi)
  })

  it('⛔SABOTAJ: hedef yazı o dilde yoksa ATAR (başka dile düşme yok)', async () => {
    expect(await icBaglantiCoz('vh:yazi/sadece-tr', 'tr', k, [SADECE_TR])).toBe('/tr/bilgi-merkezi/sadece-tr-slug')
    await expect(icBaglantiCoz('vh:yazi/sadece-tr', 'en', k, [SADECE_TR])).rejects.toThrow(/en dilinde yok/)
  })

  it('kimlik biçimi: markdown izin listesi yazı türünü kabul eder, bozuğunu reddeder', () => {
    expect(() => hedefDenetle('vh:yazi/sessiz-fan-secimi')).not.toThrow()
    expect(() => hedefDenetle('vh:yazi/')).toThrow()
    expect(() => hedefDenetle('vh:yazilar/x')).toThrow()
  })
})

describe('vh:yazi — derleme kapısı (yaziSayfasiHazirla)', () => {
  it('geçerli yazı bağlantısı olan yazının sayfası üretilir ve href gövdeye gelir', async () => {
    const baglayan = yazi('baglayan', 'baglayan-tr', 'baglayan-en', 'Ayrıca [diğer rehbere](vh:yazi/yazi-a) bakın.')
    const s = await yaziSayfasiHazirla(baglayan, 'tr', sahteKaynak(), [baglayan, A])
    expect(s.hrefler.get('vh:yazi/yazi-a')).toBe('/tr/bilgi-merkezi/yazi-a-tr')
    const e = await yaziSayfasiHazirla(baglayan, 'en', sahteKaynak(), [baglayan, A])
    expect(e.hrefler.get('vh:yazi/yazi-a')).toBe('/en/knowledge-hub/article-a-en')
  })

  it('⛔SABOTAJ: gövdeye var olmayan yazı bağlantısı konursa sayfa ATAR (derleme durur)', async () => {
    const bozuk = yazi('bozuk', 'bozuk-tr', 'bozuk-en', '[kırık](vh:yazi/boyle-bir-yazi-yok)')
    await expect(yaziSayfasiHazirla(bozuk, 'tr', sahteKaynak(), [bozuk, A])).rejects.toThrow(/vh:yazi\/boyle-bir-yazi-yok/)
  })

  it('⛔SABOTAJ: yazı kendine bağlanırsa sayfa ATAR (self-link)', async () => {
    const kendine = yazi('kendine', 'kendine-tr', 'kendine-en', '[ben](vh:yazi/kendine)')
    await expect(yaziSayfasiHazirla(kendine, 'tr', sahteKaynak(), [kendine, A])).rejects.toThrow(/kendine bağlanamaz/)
  })

  it('karşılıklı bağlantı (A→B, B→A) serbesttir: iki sayfa da üretilir', async () => {
    const x = yazi('x', 'x-tr', 'x-en', '[y](vh:yazi/y)')
    const y = yazi('y', 'y-tr', 'y-en', '[x](vh:yazi/x)')
    await expect(yaziSayfasiHazirla(x, 'tr', sahteKaynak(), [x, y])).resolves.toBeDefined()
    await expect(yaziSayfasiHazirla(y, 'tr', sahteKaynak(), [x, y])).resolves.toBeDefined()
  })

  it('ürün kartı olarak yazı kimliği yazılırsa ATAR (kart yalnız aile)', async () => {
    const bozuk = { ...A, urunler: ['vh:yazi/sadece-tr'] }
    await expect(yaziSayfasiHazirla(bozuk, 'tr', sahteKaynak(), [bozuk, SADECE_TR])).rejects.toThrow(/yalnız aile/)
  })
})

describe('vh:yazi — gövde render\'ı', () => {
  it('bağlantı <a href> olur, düz gövde bağlantısıdır: data-nosnippet gerektirmez', async () => {
    const baglayan = yazi('baglayan', 'baglayan-tr', 'baglayan-en', 'Ayrıca [diğer rehbere](vh:yazi/yazi-a) bakın.')
    const s = await yaziSayfasiHazirla(baglayan, 'tr', sahteKaynak(), [baglayan, A])
    const { container } = render(<RehberGovdesi bloklar={s.ayrismis.bloklar} hrefler={s.hrefler} />)
    const a = Array.from(container.querySelectorAll('a')).find((x) => x.textContent === 'diğer rehbere')
    expect(a, 'yazı bağlantısı çizilmedi').toBeDefined()
    expect(a?.getAttribute('href')).toBe('/tr/bilgi-merkezi/yazi-a-tr')
    expect(a?.closest('[data-nosnippet]'), 'gövde bağlantısı data-nosnippet içinde olmamalı').toBeNull()
    expect(a?.hasAttribute('data-nosnippet')).toBe(false)
  })
})

describe('vh:yazi — ters dizin', () => {
  const baglayan = yazi('baglayan', 'baglayan-tr', 'baglayan-en', '[a](vh:yazi/yazi-a) ve [kategori](vh:kategori/air-curtains)')
  const baskasi = yazi('baskasi', 'baskasi-tr', 'baskasi-en', '[a](vh:yazi/yazi-a)')
  const evren = [baglayan, baskasi, A]

  it('gövdedeki yazı bağlantısı hedef sayılır', () => {
    expect(yazininHedefleri(baglayan, 'tr').has('vh:yazi/yazi-a')).toBe(true)
    expect(baglantilariTopla(markdownAyristir((baglayan.diller.tr as YaziMetni).govde))).toContain('vh:yazi/yazi-a')
  })

  it('"bu yazıya bağlananlar": hedef yazıya bağlanan yazılar döner, yeniden eskiye, dil önekli adresle', () => {
    const r = ilgiliRehberler('vh:yazi/yazi-a', 'tr', 5, evren, false)
    expect(r.map((x) => x.href).sort()).toEqual(['/tr/bilgi-merkezi/baglayan-tr', '/tr/bilgi-merkezi/baskasi-tr'])
    // Sayım: bağlanan yok → boş (blok basılmaz)
    expect(ilgiliRehberler('vh:yazi/baglayan', 'tr', 5, evren, false)).toEqual([])
  })

  it('EN: yalnız EN yayını açıksa sayılır; adres knowledge-hub', () => {
    expect(ilgiliRehberler('vh:yazi/yazi-a', 'en', 5, evren, false)).toEqual([])
    const acik = ilgiliRehberler('vh:yazi/yazi-a', 'en', 5, evren, true)
    expect(acik).toHaveLength(2)
    expect(acik.every((x) => x.href.startsWith('/en/knowledge-hub/'))).toBe(true)
  })

  it('kendine bağlantı SAYILMAZ: yazı kendi bağlananlar kümesinde çıkmaz', () => {
    const kendine = yazi('kendine', 'kendine-tr', 'kendine-en', '[ben](vh:yazi/kendine)')
    expect(yazininHedefleri(kendine, 'tr').has('vh:yazi/kendine')).toBe(false)
    expect(ilgiliRehberler('vh:yazi/kendine', 'tr', 5, [kendine], false)).toEqual([])
  })

  it('döngü: A→B ve B→A iki yönde de sayılır, sonsuz döngüye girmez', () => {
    const x = yazi('x', 'x-tr', 'x-en', '[y](vh:yazi/y)')
    const y = yazi('y', 'y-tr', 'y-en', '[x](vh:yazi/x)')
    expect(ilgiliRehberler('vh:yazi/y', 'tr', 5, [x, y], false).map((r) => r.href)).toEqual(['/tr/bilgi-merkezi/x-tr'])
    expect(ilgiliRehberler('vh:yazi/x', 'tr', 5, [x, y], false).map((r) => r.href)).toEqual(['/tr/bilgi-merkezi/y-tr'])
  })

  it('kategori sayımı etkilenmez: yazı bağlantısı kategori kümesine karışmaz, her yazı bir kez sayılır', () => {
    // Fikstürlerin üçü de ORNEK_YAZI gövdesindeki vh:kategori/air-curtains'ı taşır.
    const r = ilgiliRehberler('vh:kategori/air-curtains', 'tr', 10, evren, false).map((x) => x.href)
    expect(r).toHaveLength(3)
    expect(new Set(r).size).toBe(3)
  })
})
