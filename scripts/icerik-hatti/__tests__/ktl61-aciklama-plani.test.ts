/**
 * KTL-61 · FC-51 ve CMS ATEX aile açıklaması düzeltme planı — canlı değerlerin BİREBİR kopyası
 * (`ktl61-canli-2026-10-25.json`, 25 Ekim 2026 SELECT çıktısı; description jsonb'unun ilgili alanları).
 * Plan dosyası kuralları (K1-K5) geçer, her `eski` dizge canlı alanda tam 1 kez geçer, sonuç metni okura dönük kalır
 * ve kaynakta olmayan iddia eklenmez. Canlıya çıkmaz.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ailePlani, aileyeGore, planDogrula, say } from '../aile-blok-duzelt-kurallar.mjs'

type Aciklama = Record<string, unknown>
const PLAN = JSON.parse(readFileSync(join(__dirname, '..', 'duzeltmeler', 'ktl61-fc51-cms-atex-aciklama-2026-10-25.json'), 'utf8'))
const CANLI = JSON.parse(readFileSync(join(__dirname, 'ktl61-canli-2026-10-25.json'), 'utf8')) as Record<string, Aciklama>
const FC = 'danfoss-vlt-micro-drive-fc-51'
const CMS = 'vortice-vorticent-cms-atex-santrifuj-fanlar'
const ilkCumle = (m: unknown) => String(m).split(/(?<=[.!?])\s/)[0]
const blok = (a: Aciklama) => String((a.bloklar_tr as Record<string, string>).Koruma)

describe('KTL-61 plan', () => {
  const { hatalar, kalemler } = planDogrula(PLAN)
  const aile = aileyeGore(kalemler)

  it('plan biçimi geçerli, iki aile yedi kalem', () => {
    expect(hatalar).toEqual([])
    expect([...aile.keys()]).toEqual([FC, CMS])
    expect(kalemler).toHaveLength(7)
  })

  it('canlı kopya dolu: tam metinler (kısaltma yok)', () => {
    expect(String(CANLI[CMS].en)).toHaveLength(885)
    expect(String(CANLI[CMS].tr)).toHaveLength(815)
    expect(CANLI[FC].maddeler_tr).toHaveLength(3)
  })

  it('FC-51: iç kayıt tonu kalkar, cümle kaynağa sadık ("hız anahtarı olarak gösterilen")', () => {
    const s = ailePlani(CANLI[FC], aile.get(FC)!)
    expect(s.red).toBe(false)
    expect(s.degisti).toBe(true)
    expect(s.aciklama.en).toBe('Danfoss FC-51 is a compact frequency converter shown as the speed switch for some low-power roof-type (HEATMASTER F400) and hood (VORT QBK SAL KC EVO) fan models.')
    expect(s.aciklama.tr).toBe('Danfoss FC-51, bazı küçük güçlü çatı tipi (HEATMASTER F400) ve davlumbaz (VORT QBK SAL KC EVO) fan modelleri için hız anahtarı olarak gösterilen kompakt bir frekans konvertörüdür.')
    expect(String(s.aciklama.tr)).not.toMatch(/AVenS|fiyat listesi/i)
    expect(String(s.aciklama.en)).not.toMatch(/AVenS|price list/i)
  })

  it('FC-51 Koruma: iç ton ve kaynakla çelişen "kaynakta yok" cümleleri kalkar, kaynaklı eşleşme cümleleri aynen kalır', () => {
    const once = blok(CANLI[FC])
    const s = ailePlani(CANLI[FC], aile.get(FC)!)
    const sonra = blok(s.aciklama)
    expect(sonra).not.toMatch(/asıl blok|Kontrol \(|kaynakta yok/i)
    expect(sonra.startsWith('**Uygulama:** HEATMASTER F400 315 M4')).toBe(true)
    expect(sonra.endsWith('FC-51 380V 0,37 kW gösterilir.')).toBe(true)
    expect((sonra.match(/\*\*/g) ?? []).length % 2).toBe(0)
    // Kalan her cümle eski blokta zaten vardı (yeni iddia yok).
    const cumleler = sonra.replace('**Uygulama:** ', '').split(/(?<=\.)\s/)
    expect(cumleler).toHaveLength(4)
    for (const c of cumleler) expect(say(once, c)).toBe(1)
  })

  it('FC-51: planın dokunmadığı alanlar aynı (Motor, maddeler_tr)', () => {
    const s = ailePlani(CANLI[FC], aile.get(FC)!)
    expect((s.aciklama.bloklar_tr as Record<string, string>).Motor).toBe((CANLI[FC].bloklar_tr as Record<string, string>).Motor)
    expect(s.aciklama.maddeler_tr).toEqual(CANLI[FC].maddeler_tr)
  })

  it('CMS ATEX: ilk cümle bölünür, hiçbir sözcük eklenmez ya da çıkmaz', () => {
    const s = ailePlani(CANLI[CMS], aile.get(CMS)!)
    expect(s.red).toBe(false)
    for (const dil of ['en', 'tr'] as const) {
      const once = String(CANLI[CMS][dil])
      const sonra = String(s.aciklama[dil])
      expect(ilkCumle(once).length).toBeGreaterThan(300)
      expect(ilkCumle(sonra).length).toBeLessThan(200)
      const kelimeler = (t: string) => t.toLocaleLowerCase(dil).replace(/[.;,]/g, '').split(/\s+/)
      expect(kelimeler(sonra)).toEqual(kelimeler(once))
    }
  })

  it('geri alma planı: ileri + geri = canlı değerin aynısı, iki ailede de', () => {
    const geri = planDogrula(JSON.parse(readFileSync(join(__dirname, '..', 'duzeltmeler', 'ktl61-fc51-cms-atex-aciklama-GERI-AL-2026-10-25.json'), 'utf8')))
    expect(geri.hatalar).toEqual([])
    const geriAile = aileyeGore(geri.kalemler)
    for (const slug of [FC, CMS]) {
      const ileri = ailePlani(CANLI[slug], aile.get(slug)!)
      const donus = ailePlani(ileri.aciklama, geriAile.get(slug)!)
      expect(donus.red).toBe(false)
      expect(donus.aciklama).toEqual(CANLI[slug])
    }
  })

  it('ikinci koşum zararsız (K5 idempotent), iki ailede de', () => {
    for (const slug of [FC, CMS]) {
      const bir = ailePlani(CANLI[slug], aile.get(slug)!)
      const iki = ailePlani(bir.aciklama, aile.get(slug)!)
      expect(iki.red).toBe(false)
      expect(iki.degisti).toBe(false)
    }
  })
})
