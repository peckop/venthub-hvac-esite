import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../data/bilgiMerkezi/yazilar'
import { aileRehberHedefleri, ESKI_AILE_SLUGLARI } from '../../lib/bilgiMerkezi/eskiAileSluglari'
import { ilgiliRehberler, yazininHedefleri } from '../../lib/bilgiMerkezi/tersDizin'

/**
 * INV-REHBER-SLUG-GECMISI-1 — yeniden adlandırılan bir aileye bağlı rehber, aile sayfasından KAYBOLMAZ.
 *
 * NİÇİN (REC-300 Faz 1-B, #1352; 2026-10-05 doğrulayıcı + slug taraması): ters dizin aile sayfasından
 * rehbere TAM dizgi eşleşmesiyle bakar. Rehber `vh:aile/danfoss-fc51` yazar; migration aileyi
 * `danfoss-vlt-micro-drive-fc-51` yapınca aile sayfasındaki "ilgili rehberler" bloğu HATASIZ boşalırdı:
 * tip doğru, test yeşil, kapı sessiz. Kod ile migration aynı anda canlıya çıkmadığı için sayfa eski ve
 * yeni slug'la AYRI AYRI aranır (`ESKI_AILE_SLUGLARI`).
 *
 * Kapı migration'ın KENDİ 40 çiftinden türer; elle liste yoktur: bir rehber yeniden adlandırılan bir ailenin
 * eski slug'ını anıyor ve eşlemede yoksa KIRMIZI. Yeni bir rehber eski slug'la yazılırsa da yakalar.
 */

const MIGRATION = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20261005100000_kategori_agaci_casals_aile_adresleri.sql',
)

/** `INSERT INTO faz1b_aile VALUES (...), (...);` bloğundaki (eski, yeni) çiftleri okur. */
function migrationCiftleri(): Array<[string, string]> {
  const sql = fs.readFileSync(MIGRATION, 'utf8')
  const bas = sql.indexOf('INSERT INTO faz1b_aile VALUES')
  expect(bas, 'migration içinde faz1b_aile INSERT bloğu bulunamadı').toBeGreaterThan(-1)
  const bitis = sql.indexOf(';', bas)
  const blok = sql.slice(bas, bitis)
  return [...blok.matchAll(/\('([a-z0-9-]+)',\s*'([a-z0-9-]+)'\)/g)].map((m) => [m[1]!, m[2]!])
}

/** Yayındaki tüm rehberlerin (tüm dillerde) anıdığı aile slug'ları. */
function rehberlerinAnidigiAileler(): Set<string> {
  const slugler = new Set<string>()
  for (const yazi of YAZILAR) {
    for (const dil of ['tr', 'en'] as const) {
      for (const hedef of yazininHedefleri(yazi, dil)) {
        if (hedef.startsWith('vh:aile/')) slugler.add(hedef.slice('vh:aile/'.length))
      }
    }
  }
  return slugler
}

describe('INV-REHBER-SLUG-GECMISI-1 — yeniden adlandırılan aileye bağlı rehber kaybolmaz', () => {
  const ciftler = migrationCiftleri()
  const anilan = rehberlerinAnidigiAileler()

  it('ön koşul: migration 40 çift veriyor ve en az bir rehber bir aileyi anıyor', () => {
    expect(ciftler).toHaveLength(40)
    expect(anilan.size).toBeGreaterThan(0)
  })

  it('bir rehber yeniden adlandırılan ailenin ESKİ slug\'ını anıyorsa eşlemede olmalı', () => {
    const eksikler = ciftler
      .filter(([eski]) => anilan.has(eski))
      .filter(([eski, yeni]) => !(ESKI_AILE_SLUGLARI[yeni] ?? []).includes(eski))
      .map(([eski, yeni]) => `${eski} → ${yeni}`)
    expect(
      eksikler,
      `Bu aileler yeniden adlandırılıyor ve rehberler hâlâ eski slug'ı anıyor; ESKİ_AILE_SLUGLARI'na ` +
        `eklenmezse aile sayfasındaki "ilgili rehberler" bloğu boşalır: ${eksikler.join(' | ')}`,
    ).toEqual([])
  })

  it('eşlemedeki her satır migration\'ın gerçek bir çifti (kimse uydurma/bayat satır bırakmaz)', () => {
    for (const [yeni, eskiler] of Object.entries(ESKI_AILE_SLUGLARI)) {
      for (const eski of eskiler) {
        expect(ciftler, `${eski} → ${yeni} migration'da yok`).toContainEqual([eski, yeni])
      }
    }
  })

  it('DAVRANIŞ — eski ve yeni slug aynı rehberleri döndürür (yayındaki içerik)', () => {
    for (const [yeni, eskiler] of Object.entries(ESKI_AILE_SLUGLARI)) {
      const yeniSonuc = ilgiliRehberler(aileRehberHedefleri(yeni), 'tr', 3, YAZILAR, false).map((r) => r.href)
      expect(yeniSonuc.length, `${yeni} sayfasında ilgili rehber YOK`).toBeGreaterThan(0)
      for (const eski of eskiler) {
        const eskiSonuc = ilgiliRehberler(aileRehberHedefleri(eski), 'tr', 3, YAZILAR, false).map((r) => r.href)
        expect(yeniSonuc).toEqual(eskiSonuc)
      }
    }
  })
})
