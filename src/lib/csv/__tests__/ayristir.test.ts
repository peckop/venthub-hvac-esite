import { describe, expect, it } from 'vitest'

import { csvAyristir } from '../ayristir'
import { csvSatir } from '../hucre'

/**
 * ADM-6 — içe aktarma ayrıştırıcısı. Eski hâl iki bileşende kopyaydı: metni `\n`'den bölüp
 * her satıra bir düzenli ifade uyguluyordu. Tırnak içindeki satır sonu kaydı ikiye bölüyor,
 * satır sayısı sınırı ve kapanmamış tırnak denetimi yoktu.
 */

const SINIR = { maksSatir: 3 }

describe('csvAyristir — RFC 4180 temel kuralları', () => {
  it('başlığı küçük harfe indirir ve kırpar; BOM düşer', () => {
    const s = csvAyristir('﻿ SKU ,Name\nA-1,Fan', SINIR)
    expect(s).toEqual({ ok: true, baslik: ['sku', 'name'], satirlar: [{ sku: 'A-1', name: 'Fan' }], satirNolari: [2] })
  })

  it('tırnak içindeki virgül, kaçışlı tırnak ve satır sonu korunur', () => {
    const s = csvAyristir('sku,name\n"A-1","Fan, ""büyük""\nikinci satır"\nA-2,x', SINIR)
    expect(s.ok).toBe(true)
    if (!s.ok) return
    expect(s.satirlar).toEqual([
      { sku: 'A-1', name: 'Fan, "büyük"\nikinci satır' },
      { sku: 'A-2', name: 'x' },
    ])
    // ikinci kayıt dosyanın 4. satırında başlar (çok satırlı hücre sayılır)
    expect(s.satirNolari).toEqual([2, 4])
  })

  it('CRLF ve tamamen boş satırlar atlanır; eksik hücre boş metin olur', () => {
    const s = csvAyristir('sku,qty\r\n\r\nA-1\r\n,\r\n', SINIR)
    expect(s).toEqual({ ok: true, baslik: ['sku', 'qty'], satirlar: [{ sku: 'A-1', qty: '' }], satirNolari: [3] })
  })

  it('noktalı virgül ayracı seçilebilir', () => {
    const s = csvAyristir('sku;qty\nA-1;4', { ...SINIR, ayrac: ';' })
    expect(s.ok && s.satirlar).toEqual([{ sku: 'A-1', qty: '4' }])
  })
})

describe('csvAyristir — reddetme', () => {
  it('veri satırı sınırı aşılırsa dosyanın TAMAMI reddedilir (kısmi okuma yok)', () => {
    expect(csvAyristir('sku\n1\n2\n3\n4', SINIR)).toEqual({ ok: false, hata: 'cokSatir' })
  })

  it('sınır tam dolarsa kabul edilir', () => {
    expect(csvAyristir('sku\n1\n2\n3', SINIR).ok).toBe(true)
  })

  it('kapanmamış tırnak reddedilir', () => {
    expect(csvAyristir('sku,name\nA-1,"Fan', SINIR)).toEqual({ ok: false, hata: 'kapanmamisTirnak' })
  })

  it('başlık + en az bir veri satırı yoksa reddedilir', () => {
    expect(csvAyristir('', SINIR)).toEqual({ ok: false, hata: 'bos' })
    expect(csvAyristir('sku,name\n', SINIR)).toEqual({ ok: false, hata: 'bos' })
  })

  it('aynı başlık iki kez geçerse reddedilir (sonraki sütun öncekini sessizce ezmesin)', () => {
    expect(csvAyristir('sku,SKU\nA,B', SINIR)).toEqual({ ok: false, hata: 'tekrarBaslik' })
  })
})

/** ADM-7 — #2202 incelemesinde (security-reviewer) çıkan veri bütünlüğü bulguları. */
describe('csvAyristir — ADM-7 düzeltmeleri', () => {
  it('tırnaksız hücrenin ORTASINDAKİ tırnak metindir; kayıtlar birleşmez (madde 1)', () => {
    const s = csvAyristir('sku,name\nA-1,Fan 5" çap\nA-2,Fan 6" çap', SINIR)
    expect(s).toEqual({
      ok: true,
      baslik: ['sku', 'name'],
      satirlar: [
        { sku: 'A-1', name: 'Fan 5" çap' },
        { sku: 'A-2', name: 'Fan 6" çap' },
      ],
      satirNolari: [2, 3],
    })
  })

  it('tek ara tırnak dosyayı "kapanmamış tırnak" diye reddettirmez (madde 1)', () => {
    const s = csvAyristir('sku,name\nA-1,Fan 5" çap', SINIR)
    expect(s.ok && s.satirlar).toEqual([{ sku: 'A-1', name: 'Fan 5" çap' }])
  })

  it('hücre başındaki tırnak yine tırnak modunu açar (madde 1, gerileme koruması)', () => {
    const s = csvAyristir('sku,name\nA-1,"Fan, 5"" çap"\n"",x', SINIR)
    expect(s.ok && s.satirlar).toEqual([
      { sku: 'A-1', name: 'Fan, 5" çap' },
      { sku: '', name: 'x' },
    ])
  })

  it('sonda birden çok BOŞ başlık tekrar sayılmaz; boş başlıklı sütun yok sayılır (madde 4)', () => {
    const s = csvAyristir('sku,name,,\nA-1,Fan,,', SINIR)
    expect(s).toEqual({ ok: true, baslik: ['sku', 'name', '', ''], satirlar: [{ sku: 'A-1', name: 'Fan' }], satirNolari: [2] })
  })

  it('dolu başlık tekrarı yine reddedilir (madde 4)', () => {
    expect(csvAyristir('sku,name,,sku\nA,B,,C', SINIR)).toEqual({ ok: false, hata: 'tekrarBaslik' })
  })

  it('dışa aktarımın formül nötrleme öneki içe aktarmada geri alınır (madde 5)', () => {
    const adlar = ['- Fan', '=Fan', '+Fan', '＠Fan', '@Fan', "'Fan", "'=Fan", "''-Fan", '-12,50', 'Fan 5" çap', 'Fan']
    const metin = [csvSatir(['sku', 'name']), ...adlar.map((ad, i) => csvSatir([`A-${i}`, ad]))].join('\n')
    const s = csvAyristir(metin, { maksSatir: 20 })
    expect(s.ok && s.satirlar.map((r) => r.name)).toEqual(adlar)
  })
})
