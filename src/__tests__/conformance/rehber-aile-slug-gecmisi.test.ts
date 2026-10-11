import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../data/bilgiMerkezi/yazilar'
import { ilgiliRehberler, yazininHedefleri } from '../../lib/bilgiMerkezi/tersDizin'

/**
 * INV-REHBER-SLUG-GECMISI-1 — yeniden adlandırılan bir aileye bağlı rehber, aile sayfasından KAYBOLMAZ.
 *
 * NİÇİN (REC-300 Faz 1-B, #1352; 2026-10-05 doğrulayıcı + slug taraması): ters dizin aile sayfasından
 * rehbere TAM dizgi eşleşmesiyle bakar. Rehber `vh:aile/danfoss-fc51` yazarken migration aileyi
 * `danfoss-vlt-micro-drive-fc-51` yapınca aile sayfasındaki "ilgili rehberler" bloğu HATASIZ boşalırdı:
 * tip doğru, test yeşil, kapı sessiz.
 *
 * URN-53 (#1352 canlıda ölçüldü, 2026-10-06): geçiş köprüsü (`ESKI_AILE_SLUGLARI`, sayfa iki slug'la aranırdı)
 * KALDIRILDI; rehberler yeni slug'ları yazar, aile sayfası yalnız kendi güncel slug'ıyla arar. Kapı bu yüzden
 * artık tersini bekler: hiçbir rehber migration'ın 40 çiftinin ESKİ slug'ını anmaz (anarsa aile sayfası
 * bloğu HATASIZ boşalır, köprü yok). Kapı migration'ın KENDİ 40 çiftinden türer; elle liste yoktur.
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

  it('hiçbir rehber yeniden adlandırılan ailenin ESKİ slug\'ını anmaz (aile sayfası yalnız güncel slug\'la arar)', () => {
    const eskiyiAnanlar = ciftler.filter(([eski]) => anilan.has(eski)).map(([eski, yeni]) => `${eski} → ${yeni}`)
    expect(
      eskiyiAnanlar,
      `Bu ailelerin slug'ı değişti ama rehberler eski slug'ı anıyor; aile sayfasındaki "ilgili rehberler" bloğu ` +
        `HATASIZ boşalır. yazilar.ts'te yeni slug'a çevir: ${eskiyiAnanlar.join(' | ')}`,
    ).toEqual([])
  })

  it('DAVRANIŞ — rehberin anıdığı her yeni slug aile sayfasından o rehbere döner (yayındaki içerik)', () => {
    const yeniler = new Set(ciftler.map(([, yeni]) => yeni))
    const baglananYeniler = [...anilan].filter((s) => yeniler.has(s))
    expect(baglananYeniler.length, 'yeni slug\'la anılan yeniden adlandırılmış aile yok: kapı boş evrende yeşil kalır').toBeGreaterThan(0)
    for (const yeni of baglananYeniler) {
      const sonuc = ilgiliRehberler(`vh:aile/${yeni}`, 'tr', 3, YAZILAR, false).map((r) => r.href)
      expect(sonuc.length, `${yeni} sayfasında ilgili rehber YOK`).toBeGreaterThan(0)
    }
  })
})
