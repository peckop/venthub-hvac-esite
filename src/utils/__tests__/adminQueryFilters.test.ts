import { describe, expect, it } from 'vitest'

import {
  eqValue,
  ilikeContains,
  orConditions,
  orIlikeContains,
  quoteFilterValue,
} from '@/utils/adminQueryFilters'

/**
 * KULLANICI METNİ FİLTRE GRAMERİNE GİRMEZ (T078-VH).
 *
 * Bu testlerin ölçtüğü tek şey: aramaya gramer karakteri yazan bir admin, filtrenin
 * YAPISINI değiştirebiliyor mu? Eskiden değiştirebiliyordu — `,` koşul ayırıcıdır.
 *
 * İddialar sonucu değil, ÜRETİLEN DİZEYİ ölçüyor: "fonksiyon çağrıldı mı" sorusu bu
 * kusuru yakalayamazdı (çağrı zaten vardı, kaçış yoktu).
 */

describe('quoteFilterValue — gramer karakterleri değeri kaçamaz', () => {
  it('düz metin tırnak içine alınır', () => {
    expect(quoteFilterValue('abc')).toBe('"abc"')
  })

  it('VİRGÜL yeni bir koşul başlatamaz (asıl kusur)', () => {
    const out = quoteFilterValue('a,b')
    expect(out).toBe('"a,b"')
    // Virgül tırnağın İÇİNDE kalmalı; tırnak kapanmadan koşul bitemez.
    expect(out.indexOf(',')).toBeGreaterThan(out.indexOf('"'))
    expect(out.indexOf(',')).toBeLessThan(out.lastIndexOf('"'))
  })

  it('ÇİFT TIRNAK kaçırılır — değer erken kapanamaz', () => {
    expect(quoteFilterValue('a"b')).toBe('"a\\"b"')
  })

  it('TERS BÖLÜ kaçırılır — kendisi kaçış üretemez', () => {
    // Kaçırılmasaydı `a\` sondaki tırnağı kaçırır ve değer açık kalırdı.
    expect(quoteFilterValue('a\\')).toBe('"a\\\\"')
  })

  it('parantez ve nokta değer içinde zararsızdır (tırnak koruyor)', () => {
    expect(quoteFilterValue('a.b(c)')).toBe('"a.b(c)"')
  })

  it('e-posta ve UUID gibi NOKTALI/TİRELİ aramalar BOZULMAZ', () => {
    // Kaçış yerine "nokta/virgülü sil" deseydik e-posta araması çalışmazdı.
    expect(quoteFilterValue('ahmet@example.com')).toBe('"ahmet@example.com"')
    expect(quoteFilterValue('7f3c-4a1b')).toBe('"7f3c-4a1b"')
  })

  it('% ve _ BİLEREK kaçırılmaz (LIKE jokerleri, gramer değil)', () => {
    // Kaçırmak aramanın anlamını sessizce değiştirirdi — ayrı bir karar, ayrı ölçüm.
    expect(quoteFilterValue('%50_ind')).toBe('"%50_ind"')
  })
})

describe('koşul kurucular', () => {
  it('ilikeContains joker karakterleri TIRNAĞIN İÇİNE koyar', () => {
    expect(ilikeContains('url', 'abc')).toBe('url.ilike."%abc%"')
  })

  it('ilikeContains virgüllü terimde tek koşul üretir', () => {
    const cond = ilikeContains('message', 'x,y')
    expect(cond).toBe('message.ilike."%x,y%"')
    // Tırnak DIŞINDA virgül yok → gramerde tek koşul.
    expect(cond.slice(0, cond.indexOf('"'))).not.toContain(',')
  })

  it('eqValue tam eşleşmeyi tırnaklar (JSON okuma kolonları dahil)', () => {
    expect(eqValue('after->>batch_id', 'b,1')).toBe('after->>batch_id.eq."b,1"')
  })

  it('orIlikeContains her kolon için bir koşul üretir ve virgülle birleştirir', () => {
    expect(orIlikeContains(['url', 'message'], 'abc')).toBe(
      'url.ilike."%abc%",message.ilike."%abc%"',
    )
  })

  it('orIlikeContains: terimdeki virgül KOŞUL SAYISINI değiştirmez (ASIL ASSERT)', () => {
    const safe = orIlikeContains(['url', 'message'], 'a,b,c')
    // Tırnak dışındaki virgüller = gerçek ayırıcılar. İki kolon → tam 1 ayırıcı.
    const separators = safe.split('"').filter((_, i) => i % 2 === 0).join('').match(/,/g) ?? []
    expect(separators).toHaveLength(1)

    // Karşılaştırma: kaçışsız eski biçim aynı terimde 3 ayırıcı üretirdi (4 koşul!).
    const unsafe = `url.ilike.%a,b,c%,message.ilike.%a,b,c%`
    expect((unsafe.match(/,/g) ?? []).length).toBe(5)
  })

  it('orConditions farklı operatörleri birleştirir', () => {
    expect(orConditions([eqValue('a', '1'), ilikeContains('b', '2')])).toBe(
      'a.eq."1",b.ilike."%2%"',
    )
  })
})
