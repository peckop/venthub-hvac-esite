import { describe, expect, it } from 'vitest'

import { YAYINDAN_KALKAN } from '../../../config/bilgiMerkeziYonlendirmeleri.mjs'
import { dildekiYazilar, type RehberYazisi, yaziBul, YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { baglantilariTopla, icindekiler, markdownAyristir } from '../markdown'
import { ilgiliYazilariSec } from '../sayfa'
import { ORNEK_YAZI } from './ornekYazi'

/**
 * INV-BILGI-MERKEZI-ICERIK-1 — yayındaki yazılar cetvelin ölçülebilir kurallarını tutar
 * (rehber-yazisi-standard.md R0.1, R2, R3).
 *
 * EVREN: yayındaki `YAZILAR` + sentetik `ORNEK_YAZI`. Karar 121/c (2026-09-25) ile yayın BOŞ olabilir;
 * örnek, kuralların boş evrende de gerçekten koştuğunu garanti eder (boş döngü = kör test).
 */
describe('Bilgi Merkezi yazıları', () => {
  const evren: readonly RehberYazisi[] = [...YAZILAR, ORNEK_YAZI]
  const hepsi = evren.flatMap((y) =>
    (['tr', 'en'] as const).flatMap((dil) => (y.diller[dil] ? [{ y, dil, m: y.diller[dil] as NonNullable<RehberYazisi['diller']['tr']> }] : [])),
  )

  it('ölçüm evreni boş değil (örnek yazı her dilde koşar)', () => {
    expect(hepsi.length).toBeGreaterThanOrEqual(2)
  })

  it('yayından kalkan slug yayındaki bir yazıyla ÇAKIŞMAZ (çakışırsa geçici yönlendirme yazıyı gizler)', () => {
    for (const dil of ['tr', 'en'] as const) {
      for (const slug of YAYINDAN_KALKAN[dil]) expect(yaziBul(dil, slug), `${dil}/${slug}`).toBeNull()
    }
  })

  it('her metin tek H1 ile ayrışır; H1 ve özet boş değil', () => {
    for (const { y, dil, m } of hepsi) {
      const a = markdownAyristir(m.govde)
      expect(a.h1.trim(), `${y.kimlik}/${dil}`).not.toBe('')
      expect(m.ozet.trim(), `${y.kimlik}/${dil}`).not.toBe('')
    }
  })

  it('⭐KAYNAKSIZ SAYI YOK (R2): "Kaynaklar" bölümü olmayan yazının metninde ve özetinde rakam 0', () => {
    for (const { y, dil, m } of hepsi) {
      const kaynakliMi = /^## (Kaynaklar|Sources)\s*$/m.test(m.govde)
      if (kaynakliMi) continue
      // Bağlantı hedefleri (vh:model/<sku> gibi) metin değildir; yalnız görünen metin sayılır.
      const gorunen = `${m.ozet}\n${m.govde.replace(/\]\([^)]*\)/g, ']')}`
      expect(gorunen.match(/\d/g) ?? [], `${y.kimlik}/${dil}: kaynaksız rakam`).toEqual([])
    }
  })

  it('SABOTAJ — rakam kolu gerçekten ayırt ediyor', () => {
    expect('Çıkış hızı 7–9 m/s'.match(/\d/g)).not.toBeNull()
    expect('HRV/ERV cihazları'.match(/\d/g)).toBeNull()
  })

  it('teknik sorumluluk notu var, sabit ilk cümleyle başlar ve içindekilere GİRMEZ (R3)', () => {
    for (const { y, dil, m } of hepsi) {
      const baslik = dil === 'tr' ? '## Teknik sorumluluk notu' : '## Technical disclaimer'
      expect(m.govde.includes(baslik), `${y.kimlik}/${dil}`).toBe(true)
      if (dil === 'tr') {
        expect(m.govde).toContain(
          `${baslik}\n\nBu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz.`,
        )
      }
      expect(icindekiler(markdownAyristir(m.govde)).some((o) => /sorumluluk|disclaimer/i.test(o.metin))).toBe(false)
    }
  })

  it('site içi bağlantılar kimlikle yazılmış (düz adres yok — ayrıştırıcı atardı) ve en az bir iç bağlantı var', () => {
    for (const { y, dil, m } of hepsi) {
      const hedefler = baglantilariTopla(markdownAyristir(m.govde))
      expect(hedefler.some((h) => h.startsWith('vh:')), `${y.kimlik}/${dil}`).toBe(true)
    }
    for (const y of evren) for (const u of y.urunler) expect(u).toMatch(/^vh:aile\//)
  })

  it('slug dil içinde tekil; yaziBul yalnız kendi dilinde bulur (başka dile düşme yok)', () => {
    for (const dil of ['tr', 'en'] as const) {
      const sluglar = dildekiYazilar(dil, evren).map((y) => y.diller[dil]?.slug)
      expect(new Set(sluglar).size).toBe(sluglar.length)
    }
    expect(yaziBul('tr', 'ornek-yazi', evren)?.kimlik).toBe('ornek-yazi')
    expect(yaziBul('en', 'ornek-yazi', evren)).toBeNull()
    expect(yaziBul('en', 'sample-article', evren)?.kimlik).toBe('ornek-yazi')
  })

  it('tarihler ISO (YYYY-MM-DD) ve güncelleme yayından önce değil', () => {
    for (const y of evren) {
      expect(y.yayinTarihi).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(y.guncellemeTarihi >= y.yayinTarihi).toBe(true)
    }
  })

  it('ilgili yazılar: aynı konu ya da ortak aile; kendisi hariç; yoksa BOŞ (blok basılmaz)', () => {
    const a = ORNEK_YAZI
    const trMetni = a.diller.tr as NonNullable<typeof a.diller.tr>
    const fikstur: RehberYazisi[] = [
      a,
      { ...a, kimlik: 'es-konu', diller: { tr: { ...trMetni, slug: 'es-konu' } } },
      { ...a, kimlik: 'baska', konu: 'guvenlik', urunler: [], diller: { tr: { ...trMetni, slug: 'baska' } } },
    ]
    expect(ilgiliYazilariSec(a, 'tr', fikstur).map((y) => y.kimlik)).toEqual(['es-konu'])
    expect(ilgiliYazilariSec(fikstur[2], 'tr', fikstur)).toEqual([])
  })
})
