/**
 * KTL-61 · FC-51 ve CMS ATEX aile açıklaması düzeltme planı — canlı değerler 25 Ekim 2026'da SELECT ile okundu;
 * burada yalnız `en`/`tr` alanları kopyadır. Plan dosyası kuralları (K1-K5) geçer ve sonuç metni okura dönük kalır.
 * Canlıya çıkmaz.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ailePlani, aileyeGore, planDogrula } from '../aile-blok-duzelt-kurallar.mjs'

type Aciklama = Record<string, unknown>
const PLAN = JSON.parse(readFileSync(join(__dirname, '..', 'duzeltmeler', 'ktl61-fc51-cms-atex-aciklama-2026-10-25.json'), 'utf8'))

const FC51: Aciklama = {
  en: 'Danfoss FC-51 is a compact frequency converter listed in the AVenS price list for speed control of some low-power roof-type (HEATMASTER F400) and hood (VORT QBK SAL KC EVO) fan models.',
  tr: 'Danfoss FC-51, AVenS fiyat listesinde bazı küçük güçlü çatı tipi (HEATMASTER F400) ve davlumbaz (VORT QBK SAL KC EVO) fan modellerinde hız kontrolü için listelenen kompakt bir frekans konvertörüdür.',
  bloklar_tr: {
    Motor: 'Ürün motor değil, motor sürücüsüdür.',
    Koruma: '**Kaynakta yok.** **Kontrol (bu ailenin asıl bloğu — ve kaynakta olan tek şey uygulamadır).** HEATMASTER F400 315 M4 0,25kW ve F400 355 M4 0,25kW modellerinde hız anahtarı olarak FC-51 220V 0,37 kW gösterilir. Kontrol paneli, haberleşme protokolü ve çalışma modları **kaynakta yok**.',
  },
}
const CMS: Aciklama = {
  en: 'The Vortice VORTICENT CMS ATEX series comprises centrifugal medium pressure ATEX fans designed for inline installation in indoor environments classified as ATEX; the housing is a rolling, completely joined or welded steel sheet, the impeller is a galvanised steel sheet simple inlet forward curved type, and the inlet sparkproof ring is made of copper or aluminium. They are manufactured with a standard ATEX asynchronous motor with IP55 protection and class F insulation.',
  tr: "Vortice VORTICENT CMS ATEX serisi, ATEX'e uygun sınıflandırılmış iç mekânlarda kanala bağlı kurulum için tasarlanmış orta basınçlı santrifüj fanlardır; gövdesi haddelenmiş, tamamen birleştirilmiş veya kaynaklı çelik sacdan, pervanesi galvanizli çelik sacdan basit girişli öne eğik tiptir, giriş halkası ise kıvılcım önleyici bakır veya alüminyumdandır. IP55 korumalı, F yalıtım sınıflı standart ATEX asenkron motorla üretilir.",
}
const ilkCumle = (m: unknown) => String(m).split(/(?<=[.!?])\s/)[0]

describe('KTL-61 plan', () => {
  const { hatalar, kalemler } = planDogrula(PLAN)
  const aile = aileyeGore(kalemler)

  it('plan biçimi geçerli, iki aile altı kalem', () => {
    expect(hatalar).toEqual([])
    expect([...aile.keys()]).toEqual(['danfoss-vlt-micro-drive-fc-51', 'vortice-vorticent-cms-atex-santrifuj-fanlar'])
    expect(kalemler).toHaveLength(6)
  })

  it('FC-51 Koruma bloğu: iç ton kalkar, mevcut cümleler aynen kalır, yeni iddia eklenmez', () => {
    const s = ailePlani(FC51, aile.get('danfoss-vlt-micro-drive-fc-51')!)
    const blok = String((s.aciklama.bloklar_tr as Record<string, string>).Koruma)
    expect(blok).not.toMatch(/asıl blok|Kontrol \(/)
    expect(blok.startsWith('Koruma bilgisi **kaynakta yok.** **Uygulama:** HEATMASTER F400 315 M4')).toBe(true)
    expect(blok.endsWith('Kontrol paneli, haberleşme protokolü ve çalışma modları **kaynakta yok**.')).toBe(true)
    expect((blok.match(/\*\*/g) ?? []).length % 2).toBe(0)
    expect((s.aciklama.bloklar_tr as Record<string, string>).Motor).toBe('Ürün motor değil, motor sürücüsüdür.')
    const ikinci = ailePlani(s.aciklama, aile.get('danfoss-vlt-micro-drive-fc-51')!)
    expect(ikinci.red).toBe(false)
    expect(ikinci.degisti).toBe(false)
  })

  it('FC-51: iç kayıt tonu kalkar, ürün ne işe yarıyorsa o söylenir', () => {
    const s = ailePlani(FC51, aile.get('danfoss-vlt-micro-drive-fc-51')!)
    expect(s.red).toBe(false)
    expect(s.degisti).toBe(true)
    expect(s.aciklama.en).toBe('Danfoss FC-51 is a compact frequency converter offered for speed control of some low-power roof-type (HEATMASTER F400) and hood (VORT QBK SAL KC EVO) fan models.')
    expect(String(s.aciklama.tr)).not.toMatch(/AVenS|fiyat listesi/i)
    expect(String(s.aciklama.en)).not.toMatch(/AVenS|price list/i)
  })

  it('CMS ATEX: ilk cümle bölünür, hiçbir sözcük eklenmez ya da çıkmaz', () => {
    const s = ailePlani(CMS, aile.get('vortice-vorticent-cms-atex-santrifuj-fanlar')!)
    expect(s.red).toBe(false)
    for (const dil of ['en', 'tr'] as const) {
      const once = String(CMS[dil])
      const sonra = String(s.aciklama[dil])
      expect(ilkCumle(once).length).toBeGreaterThan(300)
      expect(ilkCumle(sonra).length).toBeLessThan(200)
      const kelimeler = (t: string) => t.toLocaleLowerCase(dil).replace(/[.;,]/g, '').split(/\s+/)
      expect(kelimeler(sonra)).toEqual(kelimeler(once))
    }
  })

  it('ikinci koşum zararsız (K5 idempotent)', () => {
    const bir = ailePlani(CMS, aile.get('vortice-vorticent-cms-atex-santrifuj-fanlar')!)
    const iki = ailePlani(bir.aciklama, aile.get('vortice-vorticent-cms-atex-santrifuj-fanlar')!)
    expect(iki.red).toBe(false)
    expect(iki.degisti).toBe(false)
  })
})
