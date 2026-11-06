import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { icBaglantiCoz } from '../icBaglanti'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-FIKSTUR-1 (BLG-42, OPS-232 hükmü, 6 Kasım 2026) — yazıdaki her `vh:` kimliği test
 * kataloğunda (`sahteKaynak.ts`) karşılıklıdır.
 *
 * NEDEN: yazıya yeni bir `vh:aile/...` ya da `vh:kategori/...` bağlanıp `sahteKaynak.ts` güncellenmezse
 * `icBaglanti.test.ts` ve `kartOzetiYuzeyler.test.tsx` ilk koşuda genel bir `IcBaglantiHatasi` ile kırılır;
 * hangi dosyanın eksik olduğunu söylemez. Aynı ders dört yazıda tekrar etti (BLG-15, BLG-18, BLG-20 #2146,
 * BLG-39 #2275). Bu test eksik kimliklerin HEPSİNİ tek seferde adıyla ve nereye ekleneceğiyle söyler.
 *
 * KURAL: yazı kaydındaki (urunler, ilgiliKategoriler, gövde, özet; her dil) `vh:<tür>/<anahtar>` kimliklerinin
 * hepsi `icBaglantiCoz` ile TR için çözülür. Çözülemeyen kimlik listelenir.
 */
const KIMLIK = /vh:[a-z]+\/[a-z0-9._-]+/g

type YaziKaydi = (typeof YAZILAR)[number]

/** Bir yazı kaydındaki (bütün alanlar, bütün diller) tekil `vh:` kimlikleri. */
export function yazidakiKimlikler(yazi: YaziKaydi): string[] {
  return [...new Set(JSON.stringify(yazi).match(KIMLIK) ?? [])].sort()
}

/** Çözülemeyen kimlikler: `{ yazi, kimlik, neden }`. Boş dizi = fikstür tam. */
export async function eksikFikstur(
  yazilar: readonly YaziKaydi[],
  kaynak: ReturnType<typeof sahteKaynak>,
): Promise<Array<{ yazi: string; kimlik: string; neden: string }>> {
  const eksik: Array<{ yazi: string; kimlik: string; neden: string }> = []
  for (const yazi of yazilar) {
    for (const kimlik of yazidakiKimlikler(yazi)) {
      try {
        await icBaglantiCoz(kimlik, 'tr', kaynak, yazilar)
      } catch (hata) {
        eksik.push({ yazi: yazi.kimlik, kimlik, neden: hata instanceof Error ? hata.message : String(hata) })
      }
    }
  }
  return eksik
}

function rapor(eksik: Array<{ yazi: string; kimlik: string; neden: string }>): string {
  return [
    `Yazıda bağlanan ${eksik.length} kimlik test kataloğunda yok. Aile/kategori ise src/lib/bilgiMerkezi/__tests__/sahteKaynak.ts içine`,
    '(canlıda 200 verdiğini ölçtükten sonra) ekle; yazı kimliği ise hedef yazının kimliğini kontrol et (slug değil):',
    ...eksik.map((e) => `  - ${e.kimlik} (yazı: ${e.yazi}): ${e.neden}`),
  ].join('\n')
}

describe('fikstür tamlığı — yazıdaki her vh: kimliği sahteKaynak.ts\'te karşılıklı', () => {
  it('yayındaki bütün rehber yazıları: eksik kimlik yok', async () => {
    const eksik = await eksikFikstur(YAZILAR, sahteKaynak())
    expect(eksik, rapor(eksik)).toEqual([])
  })

  it('en az bir yazıda en az bir kimlik bağlı (test kör değil)', () => {
    const toplam = YAZILAR.reduce((n, y) => n + yazidakiKimlikler(y).length, 0)
    expect(toplam).toBeGreaterThan(10)
  })

  it('SABOTAJ 1: yazıya katalogda olmayan bir aile bağlanırsa kimliği adıyla bildirir', async () => {
    const bozuk = { ...YAZILAR[0], urunler: [...(YAZILAR[0].urunler ?? []), 'vh:aile/olmayan-aile-sabotaj'] }
    const eksik = await eksikFikstur([bozuk], sahteKaynak())
    expect(eksik.map((e) => e.kimlik)).toContain('vh:aile/olmayan-aile-sabotaj')
    expect(rapor(eksik)).toContain('sahteKaynak.ts')
  })

  it('SABOTAJ 2: sahte katalogdan bir aile çıkarılırsa (yazı o aileyi anıyorsa) bildirir', async () => {
    const yazi = YAZILAR.find((y) => yazidakiKimlikler(y).some((k) => k.startsWith('vh:aile/')))
    expect(yazi, 'aile bağlayan yazı yok').toBeDefined()
    const aileKimligi = yazidakiKimlikler(yazi as YaziKaydi).find((k) => k.startsWith('vh:aile/')) as string
    const cikarilan = aileKimligi.replace('vh:aile/', '')
    const kaynak = sahteKaynak({ aile: async (slug) => (slug === cikarilan ? null : { slug }) })
    const eksik = await eksikFikstur([yazi as YaziKaydi], kaynak)
    expect(eksik.map((e) => e.kimlik)).toContain(aileKimligi)
  })

  it('SABOTAJ 3: bilinmeyen kategori ve slug ile verilmiş yazı kimliği de bildirilir', async () => {
    const bozuk = {
      ...YAZILAR[0],
      ilgiliKategoriler: [...(YAZILAR[0].ilgiliKategoriler ?? []), 'vh:kategori/olmayan-kategori-sabotaj' as const],
      urunler: [...(YAZILAR[0].urunler ?? []), 'vh:yazi/olmayan-yazi-sabotaj'],
    }
    const eksik = await eksikFikstur([bozuk], sahteKaynak())
    const kimlikler = eksik.map((e) => e.kimlik)
    expect(kimlikler).toContain('vh:kategori/olmayan-kategori-sabotaj')
    expect(kimlikler).toContain('vh:yazi/olmayan-yazi-sabotaj')
  })
})
