/**
 * URN-135 (U3) — ses özeti: sitede CANLI kodların ses verisiyle KESİŞİMİ.
 *
 *  (a) 12 canlı kod: gövde 9,9 (4 V) – 48,3 (10 V), emiş 20,2 – 58,4; her uç değerin model adı veriden
 *  (b) kesişim: veri modülünde olup canlı olmayan kod (17163, 17173 …) sayıya GİRMEZ; verisi olmayan canlı kod atlanır
 *  (c) boş kesişim null (çağıran ses cümlelerini çizmez); Ø200 AC / Ø150 ES yoksa o örnek null
 *  (d) örnekler ad ile bulunur: Ø200 AC = 17164 (en yüksek hız), Ø150 ES = 17172 (4 V) — AC 17162 DEĞİL
 *  (e) görünen model adı biçimi
 *  (f) iki seri slug listesi (görünüm sabiti ↔ veri modülü) ayrışamaz
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { gorunenModelAdi, sesOzetiHesapla,SESSIZ_FAN_SERI_SLUGLARI } from '../sesOzeti'
import { kademeSesTablosu, modelAdi, seriOzeti } from '../sesVerisi'

const DB_KODLARI = [
  '17160', '17161', '17162', '17164', '17165', '17166',
  '17170', '17171', '17172', '17174', '17175', '17176',
]
const DB_DISI_KODLAR = ['17163', '17173', '17190', '17191', '17192', '17193', '17194']

describe('(a) 12 canlı kod', () => {
  const o = sesOzetiHesapla(DB_KODLARI)

  it('uç değerler seriOzeti ile aynı, model adları veriden', () => {
    expect(o).not.toBeNull()
    if (!o) return
    expect(o.seri).toEqual(seriOzeti(DB_KODLARI))
    expect(o.seri.enDusukGovde.dbA).toBe(9.9)
    expect(o.seri.enDusukGovde.kosul.kademe).toBe('4 V')
    expect(o.seri.enYuksekGovde.dbA).toBe(48.3)
    expect(o.seri.enDusukEmis.dbA).toBe(20.2)
    expect(o.seri.enYuksekEmis.dbA).toBe(58.4)
    expect(o.adlar.enDusukGovde).toBe('Lineo 100 Quiet ES')
    expect(o.adlar.enYuksekGovde).toBe('Lineo 315 Quiet ES')
    expect(o.adlar.enYuksekEmis).toBe('Lineo 315 Quiet')
  })

  it('uç değerlerin kodları modelAdi ile görünen adlara geri izlenir', () => {
    if (!o) throw new Error('özet yok')
    expect(o.seri.kodlar).toEqual({
      enDusukGovde: '17170',
      enYuksekGovde: '17176',
      enDusukEmis: '17170',
      enYuksekEmis: '17166',
    })
    expect(modelAdi('17170')).toBe('LINEO 100 QUIET ES')
  })
})

describe('(b) kesişim', () => {
  it('canlı olmayan kodlar özete girmez: 12 kod, 12 kod + verisiz kod ile aynı sonucu verir', () => {
    expect(sesOzetiHesapla([...DB_KODLARI, '99999', 'yok'])).toEqual(sesOzetiHesapla(DB_KODLARI))
  })

  it('DB dışı 7 kodun değerleri 12 kodluk özetin hiçbir alanında yoktur', () => {
    const disi = sesOzetiHesapla(DB_DISI_KODLAR)
    const icerde = sesOzetiHesapla(DB_KODLARI)
    expect(disi).not.toBeNull()
    expect(icerde).not.toBeNull()
    if (!disi || !icerde) return
    // 17173 (Ø160 ES) ve 17163 (Ø160 AC) canlı değil: kendi uç değerleri varsa bile 12 kodluk özet onlardan beslenmez.
    const icKodlar = Object.values(icerde.seri.kodlar)
    for (const kod of DB_DISI_KODLAR) expect(icKodlar).not.toContain(kod)
  })
})

describe('(c) boş kesişim ve eksik örnek modeller: fail-closed', () => {
  it('canlı kodların hiçbirinde veri yoksa null', () => {
    expect(sesOzetiHesapla([])).toBeNull()
    expect(sesOzetiHesapla(['99999'])).toBeNull()
    expect(sesOzetiHesapla(['abc', ''])).toBeNull()
  })

  it('Ø200 AC (17164) canlı değilse q200 null; özetin kalanı durur', () => {
    const o = sesOzetiHesapla(DB_KODLARI.filter((k) => k !== '17164'))
    expect(o).not.toBeNull()
    expect(o?.q200).toBeNull()
    expect(o?.es150Govde4V).not.toBeNull()
  })

  it('Ø150 ES (17172) canlı değilse es150Govde4V null; özetin kalanı durur', () => {
    const o = sesOzetiHesapla(DB_KODLARI.filter((k) => k !== '17172'))
    expect(o).not.toBeNull()
    expect(o?.es150Govde4V).toBeNull()
    expect(o?.q200).not.toBeNull()
  })

  it('canlı tek kod Ø150 AC ise iki örnek de null', () => {
    const o = sesOzetiHesapla(['17162'])
    expect(o).not.toBeNull()
    expect(o?.q200).toBeNull()
    expect(o?.es150Govde4V).toBeNull()
  })
})

describe('(d) örnek modeller ad ile bulunur', () => {
  const o = sesOzetiHesapla(DB_KODLARI)

  it('Ø200 AC = 17164, en yüksek hız: gövde 35,5 ve emiş 48', () => {
    expect(modelAdi('17164')).toBe('LINEO 200 QUIET')
    const son = kademeSesTablosu('17164')?.at(-1)
    expect(son?.kademe).toBe('en yüksek')
    expect(o?.q200?.govde).toEqual(son?.govdeLp)
    expect(o?.q200?.emis).toEqual(son?.emisLp)
    expect(o?.q200?.govde.dbA).toBe(35.5)
    expect(o?.q200?.emis.dbA).toBe(48)
  })

  it('Ø150 ES = 17172 (AC 17162 DEĞİL), 4 V gövde 13,7', () => {
    expect(modelAdi('17172')).toBe('LINEO 150 QUIET ES')
    expect(modelAdi('17162')).toBe('LINEO 150 QUIET')
    expect(o?.es150Govde4V?.dbA).toBe(13.7)
    expect(o?.es150Govde4V?.kosul.kademe).toBe('4 V')
    expect(o?.es150Govde4V?.kosul.yer).toBe('govde')
  })
})

describe('(e) görünen model adı', () => {
  it('kısa sözcük (ES, T) ve sayı korunur, diğerleri baş harfi büyük', () => {
    expect(gorunenModelAdi('LINEO 100 QUIET ES')).toBe('Lineo 100 Quiet ES')
    expect(gorunenModelAdi('LINEO 200 QUIET')).toBe('Lineo 200 Quiet')
    expect(gorunenModelAdi('LINEO 100 T QUIET')).toBe('Lineo 100 T Quiet')
  })
})

describe('(f) seri slug listeleri ayrışamaz', () => {
  it('CategoryLandingView.SESSIZ_FAN_SERILERI === SESSIZ_FAN_SERI_SLUGLARI', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src', 'views', 'category', 'CategoryLandingView.tsx'), 'utf8')
    const eslesme = /const SESSIZ_FAN_SERILERI = \[([^\]]*)\]/.exec(kaynak)
    expect(eslesme, 'SESSIZ_FAN_SERILERI sabiti bulunamadı').not.toBeNull()
    const degerler = [...(eslesme?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1])
    expect(degerler).toEqual([...SESSIZ_FAN_SERI_SLUGLARI])
  })
})
