import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { odemeSiparisleEslesiyorMu, type OdemeSonucu, type SiparisSatiri } from '../odeme_eslesme'

/**
 * OPS-224 — ödeme eşleşme kapısının mutasyon yoklaması.
 *
 * `odeme_eslesme.test.ts` kapının ana yollarını kilitliyor (13 yanıt geçer, çapraz ödeme
 * geçmez). Mutasyon koşusu (`.claude/skills/mutasyon-testi`) kapının içindeki şu bozulmaların
 * bütün paketi YEŞİL bıraktığını ölçtü: kimlik eşitliğinin içermeye gevşemesi, epoch
 * düzenli ifadelerinin çapasız ya da kısa hane kabul etmesi, fazla `price`in kabulü, kuruş
 * eksik `paidPrice`in kabulü, okunamayan alanların ayrı sebeple düşmemesi, `NaN`/`Infinity`
 * tutarların geçmesi, para biriminin büyük/küçük harf ve yokluk kuralları, siparişin kendi
 * para birimiyle uyuşmazlık ve dize olmayan `basketId`.
 *
 * Her test, aşağıda adı geçen mutantı öldürdüğü koşuyla ölçülerek eklendi. Vakalar
 * `odeme_eslesme.test.ts` ile aynı sentetik fikstürün İLK satırından kurulur; tek alan
 * değiştirilir, gerisi gerçek yapıda kalır.
 */

type FiksturSatiri = SiparisSatiri & { payment_debug?: { raw?: Record<string, unknown> } | null }

const FIKSTUR = resolve(
  process.cwd(),
  'supabase/functions/_shared/__tests__/fixtures/odeme-eslesme-13-yanit.json',
)

function ilkVaka(): { satir: SiparisSatiri; raw: OdemeSonucu & Record<string, unknown> } {
  const f = JSON.parse(readFileSync(FIKSTUR, 'utf8')) as { satirlar: FiksturSatiri[] }
  const s = f.satirlar[0]
  const raw = s.payment_debug?.raw
  if (!raw) throw new Error('fikstürün ilk satırında payment_debug.raw yok')
  const { payment_debug: _atla, ...satir } = s
  return { satir, raw }
}

function epochOf(conv: string | null | undefined): string {
  const m = /^CONV-(\d+)$/.exec(String(conv))
  if (!m) throw new Error('fikstür conversation_id biçimi değişmiş')
  return m[1]
}

describe('OPS-224 · ön koşul: temel vaka gerçekten geçiyor', () => {
  it('fikstürün ilk vakası değiştirilmeden GEÇER ve biçimi epoch', () => {
    // Aşağıdaki her "geçmez" kolu bu vakanın tek alanını bozar. Temel vaka kendiliğinden
    // reddediliyorsa o kollar yanlış sebeple yeşil olurdu.
    const { satir, raw } = ilkVaka()
    expect(odemeSiparisleEslesiyorMu(raw, satir)).toEqual({ gecti: true, bicim: 'epoch', sebep: null })
  })
})

describe('OPS-224 · kimlik çapası gevşetilemez', () => {
  it('basketId siparişin id sini yalnız İÇERİYORSA eşleşmez (tam eşitlik) — O3', () => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, basketId: `${String(satir.id)}-ek` },
      { ...satir, conversation_id: null },
    )
    expect(k).toEqual({ gecti: false, bicim: null, sebep: 'kimlik_eslesmedi' })
  })

  it('basketId epoch u dizenin BAŞINDA olmalı: önüne ek konmuş VH-… eşleşmez — O5', () => {
    const { satir, raw } = ilkVaka()
    const epoch = epochOf(satir.conversation_id)
    const k = odemeSiparisleEslesiyorMu({ ...raw, basketId: `X-VH-${epoch}-abcdef` }, satir)
    expect(k.sebep).toBe('kimlik_eslesmedi')
  })

  it('conversation_id epoch tan SONRA ek taşıyorsa eşleşmez — O6', () => {
    const { satir, raw } = ilkVaka()
    const epoch = epochOf(satir.conversation_id)
    const k = odemeSiparisleEslesiyorMu(raw, { ...satir, conversation_id: `CONV-${epoch}-ek` })
    expect(k.sebep).toBe('kimlik_eslesmedi')
  })

  it('10 haneden kısa epoch kimlik sayılmaz (VH-12 / CONV-12) — O7', () => {
    // Kısa sayılar milisaniye damgası değildir; iki ayrı siparişte çakışmaları kolaydır.
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, basketId: 'VH-12-abcdef' },
      { ...satir, conversation_id: 'CONV-12' },
    )
    expect(k.sebep).toBe('kimlik_eslesmedi')
  })

  it('dize OLMAYAN basketId kimlik değildir — dizi içine sarılmış doğru değer bile reddedilir — O21', () => {
    const { satir, raw } = ilkVaka()
    for (const bozuk of [[raw.basketId], { toString: () => String(raw.basketId) }, 1680649886220]) {
      const k = odemeSiparisleEslesiyorMu({ ...raw, basketId: bozuk }, satir)
      expect(k, `basketId=${JSON.stringify(bozuk)}`).toEqual({ gecti: false, bicim: null, sebep: 'basketId_yok' })
    }
  })
})

describe('OPS-224 · tutar kapısı iki yönde de tam', () => {
  it('price sipariş toplamının ÜSTÜNDE ise de geçmez (tam eşitlik, yalnız alt sınır değil) — O8', () => {
    const { satir, raw } = ilkVaka()
    const fazla = Number(satir.total_amount) + 100
    const k = odemeSiparisleEslesiyorMu({ ...raw, price: fazla, paidPrice: fazla }, satir)
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'tutar_eslesmedi' })
  })

  it('paidPrice price ın bir KURUŞ altındaysa geçmez — O9', () => {
    const { satir, raw } = ilkVaka()
    const birKurusEksik = Math.round(Number(raw.price) * 100 - 1) / 100
    const k = odemeSiparisleEslesiyorMu({ ...raw, paidPrice: birKurusEksik }, satir)
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'paidPrice_price_altinda' })
  })

  it('paidPrice price a EŞİT ise geçer (sınırın kendisi kabul)', () => {
    const { satir, raw } = ilkVaka()
    expect(odemeSiparisleEslesiyorMu({ ...raw, paidPrice: raw.price }, satir).gecti).toBe(true)
  })

  it('tutarlar dize olarak gelse de sayı gibi karşılaştırılır', () => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, price: String(raw.price), paidPrice: String(raw.paidPrice) },
      { ...satir, total_amount: String(satir.total_amount) },
    )
    expect(k.gecti).toBe(true)
  })
})

describe('OPS-224 · okunamayan alan kendi sebebiyle düşer (denetim izi doğru alanı söyler)', () => {
  it.each([
    ['yok', undefined],
    ['null', null],
    ['boş dize', ''],
    ['sayı değil', 'abc'],
  ] as const)('price %s → price_okunamadi — O12, O14, O15', (_ad, deger) => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu({ ...raw, price: deger }, satir)
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'price_okunamadi' })
  })

  it.each([
    ['yok', undefined],
    ['null', null],
    ['boş dize', ''],
    ['sayı değil', 'abc'],
  ] as const)('paidPrice %s → paidPrice_okunamadi — O11', (_ad, deger) => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu({ ...raw, paidPrice: deger }, satir)
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'paidPrice_okunamadi' })
  })

  it.each([
    ['null', null],
    ['boş dize', ''],
    ['sayı değil', 'abc'],
  ] as const)('sipariş total_amount %s → siparis_tutari_okunamadi — O13', (_ad, deger) => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(raw, { ...satir, total_amount: deger })
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'siparis_tutari_okunamadi' })
  })

  it('boş dize tutar SIFIR sayılmaz: sıfır tutarlı siparişe boş price yazılamaz — O14', () => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu({ ...raw, price: '', paidPrice: '' }, { ...satir, total_amount: 0 })
    expect(k.gecti).toBe(false)
  })

  it('sonsuz tutar sonlu sayı değildir: price ve toplam ikisi de Infinity olsa geçmez — O15', () => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(
      { ...raw, price: 'Infinity', paidPrice: 'Infinity' },
      { ...satir, total_amount: 'Infinity' },
    )
    expect(k.gecti).toBe(false)
    expect(k.sebep).toBe('price_okunamadi')
  })
})

describe('OPS-224 · para birimi kuralları', () => {
  it('küçük harfli "try" TRY sayılır, ödeme reddedilmez — O16', () => {
    const { satir, raw } = ilkVaka()
    expect(odemeSiparisleEslesiyorMu({ ...raw, currency: 'try' }, satir)).toEqual({
      gecti: true,
      bicim: 'epoch',
      sebep: null,
    })
  })

  it('para birimi alanı YOKSA tek başına red sebebi değil — O17', () => {
    // Dosya başlığı: kimlik ve tutar geçildiyse alanın yokluğu biçim değişikliği işaretidir.
    const { satir, raw } = ilkVaka()
    const { currency: _yok, ...parasiz } = raw
    expect(odemeSiparisleEslesiyorMu(parasiz, satir).gecti).toBe(true)
  })

  it('sipariş satırının para birimi ödemeninkiyle uyuşmazsa geçmez — O18', () => {
    const { satir, raw } = ilkVaka()
    const k = odemeSiparisleEslesiyorMu(raw, { ...satir, currency: 'USD' })
    expect(k).toEqual({ gecti: false, bicim: 'epoch', sebep: 'para_birimi_siparisle_eslesmedi' })
  })

  it('sipariş satırının para birimi küçük harfle "try" ise uyuşmazlık sayılmaz', () => {
    const { satir, raw } = ilkVaka()
    expect(odemeSiparisleEslesiyorMu(raw, { ...satir, currency: 'try' }).gecti).toBe(true)
  })
})
