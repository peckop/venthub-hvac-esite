/**
 * KTL-62 · FC-101, FC-102 Koruma ve Tiracamino Gövde iç editör notu temizliği — plan sınaması.
 * Canlı değerlerin BİREBİR kopyası `ktl62-canli-2026-10-25.json` (25 Ekim 2026 SELECT). Plan kuralları (K1-K5) geçer,
 * her `eski` dizge canlı alanda tam 1 kez geçer, iç not/üretim artığı kalkar, kalan her cümle eski blokta zaten vardı
 * (yeni iddia yok), ileri + geri = canlı değer. Canlıya çıkmaz.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ailePlani, aileyeGore, planDogrula, say } from '../aile-blok-duzelt-kurallar.mjs'
import { geriKarari } from '../aile-yedekten-geri-kurallar.mjs'

type Aciklama = Record<string, unknown>
const oku = (...p: string[]) => JSON.parse(readFileSync(join(__dirname, ...p), 'utf8'))
const PLAN = oku('..', 'duzeltmeler', 'ktl62-ic-editor-notu-fc101-fc102-tiracamino-2026-10-25.json')
const CANLI = oku('ktl62-canli-2026-10-25.json') as Record<string, Aciklama>
const FC101 = 'danfoss-vlt-hvac-basic-drive-fc-101'
const FC102 = 'danfoss-vlt-hvac-drive-fc-102'
const TIRA = 'vortice-tiracamino-somine-ve-baca-fanlari'
const blok = (a: Aciklama, ad: string) => String((a.bloklar_tr as Record<string, string>)[ad])

describe('KTL-62 plan', () => {
  const { hatalar, kalemler } = planDogrula(PLAN)
  const aile = aileyeGore(kalemler)

  it('plan biçimi geçerli, üç aile dokuz kalem', () => {
    expect(hatalar).toEqual([])
    expect([...aile.keys()]).toEqual([FC101, FC102, TIRA])
    expect(kalemler).toHaveLength(9)
  })

  it('Montaj: "---" üretim artığı ve "Katalogda … verilir/listelenir" tonu kalkar, sayılar aynen', () => {
    const m101 = blok(ailePlani(CANLI[FC101], aile.get(FC101)!).aciklama, 'Montaj')
    const m102 = blok(ailePlani(CANLI[FC102], aile.get(FC102)!).aciklama, 'Montaj')
    // "maksimum" sözcüğü K3 abartı kalıbına takılır; "en çok" aynı sınırı söyler (sayılar aynen).
    expect(m101).toBe('Tesisat kısıtı olarak kablo mesafesi en çok 50 metredir.')
    expect(m102).toBe('Tesisat kısıtı olarak kablo mesafesi en çok 150 metredir.')
    for (const m of [m101, m102]) expect(m).not.toMatch(/---|Katalog/)
  })

  it('FC-102 maddeler_tr[0]: "Katalogda … listelenir" kalkar, sayılar aynen; diğer iki madde aynı', () => {
    const m = ailePlani(CANLI[FC102], aile.get(FC102)!).aciklama.maddeler_tr as string[]
    expect(m[0]).toBe('Motor gücü 1,1 kW ile 90 kW arasında 17 model vardır.')
    expect(m.slice(1)).toEqual((CANLI[FC102].maddeler_tr as string[]).slice(1))
  })

  it('her kalem kurallardan geçer (K1-K5), hiçbiri RED değil', () => {
    for (const slug of [FC101, FC102, TIRA]) {
      const s = ailePlani(CANLI[slug], aile.get(slug)!)
      expect(s.red, slug).toBe(false)
      expect(s.degisti, slug).toBe(true)
    }
  })

  it('FC-101 ve FC-102 Koruma: iç not, [MANIFEST], iç etiket ve ürünler arası karşılaştırma kalkar', () => {
    for (const slug of [FC101, FC102]) {
      const sonra = blok(ailePlani(CANLI[slug], aile.get(slug)!).aciklama, 'Koruma')
      expect(sonra, slug).not.toMatch(/\[MANIFEST\]|asıl blok|Katalog |FC101|vermez|yoktur|listelenir/)
      expect(sonra.startsWith("Üretici föyüne göre taban gövde koruma sınıfı IP20 / "), slug).toBe(true)
      expect(sonra, slug).toContain('**Kontrol:** Standart yangın modu bulunur.')
      expect((sonra.match(/\*\*/g) ?? []).length % 2, slug).toBe(0)
    }
    expect(blok(ailePlani(CANLI[FC101], aile.get(FC101)!).aciklama, 'Koruma').endsWith("FC ve FLC'dir.")).toBe(true)
    expect(blok(ailePlani(CANLI[FC102], aile.get(FC102)!).aciklama, 'Koruma').endsWith("Metasys N2 ve FC'dir.")).toBe(true)
  })

  it('Koruma: kalan cümlelerin hepsi eski blokta zaten vardı (yeni iddia yok)', () => {
    for (const slug of [FC101, FC102]) {
      const once = blok(CANLI[slug], 'Koruma')
      const sonra = blok(ailePlani(CANLI[slug], aile.get(slug)!).aciklama, 'Koruma')
      const cumleler = sonra.replace('**Kontrol:** ', '').split(/(?<=\.)\s/)
      // 'Standart haberleşme ... FC'dir.' ve 'Üretici föyüne ...' yeniden yazılan iki cümledir; geri kalanı aynen eski blokta tam 1 kez geçer.
      const yeni = cumleler.filter((c) => say(once, c) === 0)
      expect(yeni, slug).toHaveLength(2)
      for (const c of cumleler.filter((c) => !yeni.includes(c))) expect(say(once, c), `${slug}: ${c}`).toBe(1)
    }
  })

  it('Tiracamino Gövde: editör bloğu kalkar, ölçüler aynen, birim eklenmez', () => {
    const once = blok(CANLI[TIRA], 'Gövde')
    const sonra = blok(ailePlani(CANLI[TIRA], aile.get(TIRA)!).aciklama, 'Gövde')
    expect(sonra).toBe('Ölçüler: ⌀A 405, ⌀B 410, ⌀C 357, ⌀D 10, E 38, F 518, G 480, A1 401, B1 357, C1 140, D1 40. Ölçü tablosunda birim belirtilmemiştir.')
    expect(sonra).not.toMatch(/Katalog|>|\*|doğrulanmalı|büyük olasılıkla| mm/)
    const olculer = (t: string) => t.match(/[⌀A-G]\d?[A-Z]? \d+/g)
    expect(olculer(sonra)).toEqual(olculer(once))
  })

  it('planın dokunmadığı alanlar aynı (diğer bloklar, maddeler_tr, en, tr)', () => {
    for (const slug of [FC101, FC102, TIRA]) {
      const s = ailePlani(CANLI[slug], aile.get(slug)!).aciklama
      const dokunulan = slug === TIRA ? ['Gövde'] : ['Koruma', 'Montaj']
      for (const [ad, v] of Object.entries(CANLI[slug].bloklar_tr as Record<string, string>)) {
        if (!dokunulan.includes(ad)) expect(blok(s, ad), `${slug}.${ad}`).toBe(v)
      }
      if (slug !== FC102) expect(s.maddeler_tr).toEqual(CANLI[slug].maddeler_tr)
      else expect((s.maddeler_tr as string[]).slice(1)).toEqual((CANLI[slug].maddeler_tr as string[]).slice(1))
      expect(s.en).toBe(CANLI[slug].en)
      expect(s.tr).toBe(CANLI[slug].tr)
    }
  })

  it('ikinci ileri koşum zararsız (K5), üç ailede de', () => {
    for (const slug of [FC101, FC102, TIRA]) {
      const ileri = ailePlani(CANLI[slug], aile.get(slug)!)
      const iki = ailePlani(ileri.aciklama, aile.get(slug)!)
      expect(iki.red, slug).toBe(false)
      expect(iki.degisti, slug).toBe(false)
    }
  })

  it('geri alma: ters plan artıklı metne dönemez (K4), bu yüzden aile-yedekten-geri.mjs kullanılır', () => {
    // Ters plan (yeni↔eski) K4'te RED verir: eski metin [MANIFEST] / "---" / satır başı ">" taşıyor.
    for (const slug of [FC101, FC102, TIRA]) {
      const ileri = ailePlani(CANLI[slug], aile.get(slug)!)
      const ters = aile.get(slug)!.slice().reverse().map((k) => ({ ...k, eski: k.yeni as string, yeni: k.eski }))
      expect(ailePlani(ileri.aciklama, ters).red, slug).toBe(true)
    }
    // Yedekten geri: yedek = canlı kopya; yazım sonrası satır yedekten farklı → 'geri', geri koyunca 'zaten'.
    for (const slug of [FC101, FC102, TIRA]) {
      const yedek = { id: 'i', tenant_id: 't', slug, description: CANLI[slug], is_description_manual: true, updated_at: 'x' }
      const yazilmis = { ...yedek, description: ailePlani(CANLI[slug], aile.get(slug)!).aciklama }
      expect(geriKarari(yedek, yazilmis).durum, slug).toBe('geri')
      expect(geriKarari(yedek, { ...yazilmis, description: yedek.description }).durum, slug).toBe('zaten')
    }
  })
})
