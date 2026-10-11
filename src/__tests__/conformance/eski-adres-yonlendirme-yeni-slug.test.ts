import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ESKI-ADRES-YENI-SLUG-1 — eski adres yönlendirmeleri ve ana sayfa bağları YENİ aile slug'ına gider.
 *
 * NİÇİN (REC-300 Faz 1-B, #1352; URN-53; OPS doğrulayıcı hükmü 2026-10-05): migration 40 aile slug'ını
 * değiştirir. `next.config.mjs` yönlendirmeleri uygulamanın veri-sürücülü çözümünden ÖNCE koşar; hedefi ESKİ
 * aile slug'ı bırakılırsa migration sonrası adres İKİ SIÇRAMA yapar (308 → 308 → 200) ve ikinci sıçramada
 * `?sku=` DÜŞER (aile sayfası `force-static`, sunucu istekteki sorguyu görmez): müşteri aradığı modele değil
 * aile başına düşer. Ana sayfa bağları da bir fazla 308 üretir.
 *
 * ⛔SIRA: bu kapının beklediği hâl YALNIZ #1352 migration'ı canlıya inip ölçüldükten SONRA doğrudur; hedef
 * migration'dan önce inerse yeni slug 404 olur ve 308 tarayıcıda önbelleklenir (next.config.mjs K12/REC-146
 * kayıtlarındaki ders). Bu PR bu yüzden #1352 + canlı ölçümden sonra, aynı oturumda birleşir.
 *
 * BİLİNEN SINIR: kullanıcıların paylaştığı `eski-aile-slug?sku=X` bağlantıları sunucu tarafında düzelmez
 * (`force-static` sayfa `?sku=` görmez); model adresleri açılınca (Faz 3-C) kapanır.
 *
 * Çapraz doğrulama: #1352 migration dosyası ağaçta VARSA, buradaki (eski → yeni) çiftler onun 40 çiftinde
 * birebir bulunmalıdır (uydurma slug kapıyı yeşil yapamaz).
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const MIGRATION = path.join(KOK, 'supabase', 'migrations', '20261005100000_kategori_agaci_casals_aile_adresleri.sql')

/** Bu kapının izlediği çiftler: [eski aile slug'ı, yeni aile slug'ı]. */
const CIFTLER: ReadonlyArray<readonly [string, string]> = [
  ['vortice-lineo-quiet', 'vortice-lineo-quiet-sessiz-kanal-fanlari'],
  ['nicotra-gebhardt-dd', 'nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar'],
  ['vortice-vort-commercial-in-line-rectangular', 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
]

function oku(goreli: string): string {
  return fs.readFileSync(path.join(KOK, goreli), 'utf8')
}

/** `destination: '/:lang/products/<slug>...'` hedeflerinin aile slug'ları. */
function yonlendirmeHedefleri(): string[] {
  const metin = oku('next.config.mjs')
  return [...metin.matchAll(/destination:\s*'\/:lang\/products\/([a-z0-9-]+)/g)].map((m) => m[1]!)
}

describe('INV-ESKI-ADRES-YENI-SLUG-1 — eski adres yönlendirmeleri yeni aile slug\'ına gider', () => {
  const hedefler = yonlendirmeHedefleri()

  it('ön koşul: yönlendirme hedefleri okunabiliyor ve üç aile de en az bir hedefte anılıyor', () => {
    // 1 Lineo çap şablonu + 1 nicotra-dd + 5 commercial-in-line-rectangular = 7 (çap kuralı tek `.map` şablonudur).
    expect(hedefler.length).toBeGreaterThanOrEqual(7)
    for (const [, yeni] of CIFTLER) expect(hedefler, `${yeni} hiçbir yönlendirmenin hedefi değil`).toContain(yeni)
  })

  it.each(CIFTLER)('hiçbir yönlendirme ESKİ aile slug\'ına (%s) gitmez', (eski) => {
    expect(hedefler, `${eski} hâlâ bir yönlendirme hedefi: migration sonrası 2 sıçrama + ?sku= düşer`).not.toContain(eski)
  })

  it('ana sayfa bağları (HomeSinevizyon) eski slug\'ı taşımaz, yeni slug\'ı taşır', () => {
    const kaynak = oku('src/components/home/HomeSinevizyon.tsx')
    expect(kaynak).not.toMatch(/familySlug:\s*'vortice-lineo-quiet'/)
    expect(kaynak).toMatch(/familySlug:\s*'vortice-lineo-quiet-sessiz-kanal-fanlari'/)
  })

  it('çapraz doğrulama: çiftler #1352 migration\'ının 40 çiftinde birebir var (migration ağaçtaysa)', () => {
    if (!fs.existsSync(MIGRATION)) return
    const sql = fs.readFileSync(MIGRATION, 'utf8')
    const bas = sql.indexOf('INSERT INTO faz1b_aile VALUES')
    expect(bas).toBeGreaterThan(-1)
    const blok = sql.slice(bas, sql.indexOf(';', bas))
    const ciftler = [...blok.matchAll(/\('([a-z0-9-]+)',\s*'([a-z0-9-]+)'\)/g)].map((m) => `${m[1]}>${m[2]}`)
    for (const [eski, yeni] of CIFTLER) expect(ciftler, `${eski} → ${yeni} migration'da yok`).toContain(`${eski}>${yeni}`)
  })
})
