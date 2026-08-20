import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CETVEL-YAPI · Bir cetvelin BÖLÜM YAPISI tutarlı olmalı.
 *
 * CETVEL: `docs/standards/deploy-build-skip-standard.md`
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR — ölçülmüş bir kusurdan doğdu, varsayımdan değil
 * ─────────────────────────────────────────────────────────────────────────────
 * 2026-08-20'de bu cetvele `## D13` bölümü İKİ KEZ yazıldı: biri 08-19 17:00'de,
 * ikincisi ertesi gün aynı yazar tarafından, dosyaya bakılmadan, hafızadan.
 * Dosyada iki özdeş başlık oluştu ve HİÇBİR KAPI KIRMIZI VERMEDİ.
 *
 * Sebebi yapısaldı: bu cetvelin tek kapısı `build-skip-positive-logic.test.ts` ve o
 * kapı `scripts/vercel-ignore-build.sh` BETİĞİNİ ölçüyor — cetvel dosyasını hiç
 * okumuyor. Yani cetvelde mükerrer başlık, çelişen madde ya da sahipsiz alt bölüm
 * olsa kimse görmezdi; 400+ satırlık bir belgenin başlık listesini kimse elle saymaz.
 *
 * SINIF: "cetvel var, onu ölçen kapı yok". Bu depoda kural şu — cetvel + zorlayıcı
 * test = kontrol; tek başına cetvel yalnızca iyi niyettir.
 *
 * KAPSAM, bilerek DAR: yalnız bu cetveli ölçer. Tüm `docs/standards/**` ağacına
 * genelleştirmek diğer şeritlerin dosyalarını da bu kurala tabi kılar; o bir filo
 * kararıdır ve OPS-AUDIT'e bırakılmıştır.
 */

const CETVEL = 'docs/standards/deploy-build-skip-standard.md'

/** Bölüm başlıklarını satır numarasıyla çıkarır. `## D13 — ...` → { seviye, no, satir } */
function bolumleriCikar(metin: string) {
  const SATIR_SONU = /\r?\n/
  return metin.split(SATIR_SONU).flatMap((satir, i) => {
    const m = /^(#{2,3})\s+(D\d+(?:\.\d+)?)\s/.exec(satir)
    if (!m) return []
    return [{ seviye: m[1].length, no: m[2], satir: i + 1, metin: satir }]
  })
}

function cetvelMetni(): string {
  return readFileSync(resolve(process.cwd(), CETVEL), 'utf8')
}

describe('INV-CETVEL-YAPI · build-skip cetvelinin bölüm yapısı', () => {
  it('aynı bölüm numarası İKİ KEZ tanımlanmaz', () => {
    const bolumler = bolumleriCikar(cetvelMetni())
    const sayim = new Map<string, number[]>()
    for (const b of bolumler) {
      const mevcut = sayim.get(b.no) ?? []
      mevcut.push(b.satir)
      sayim.set(b.no, mevcut)
    }
    const mukerrer = [...sayim.entries()].filter(([, satirlar]) => satirlar.length > 1)
    expect(
      mukerrer.map(([no, satirlar]) => `${no} → satır ${satirlar.join(', ')}`),
      'mükerrer bölüm numarası: aynı numara iki başlıkta',
    ).toEqual([])
  })

  it('her alt bölüm (D<n>.<m>) kendi ana bölümüne (D<n>) sahiptir', () => {
    const bolumler = bolumleriCikar(cetvelMetni())
    const anaNolar = new Set(bolumler.filter((b) => b.seviye === 2).map((b) => b.no))
    const yetim = bolumler
      .filter((b) => b.seviye === 3 && b.no.includes('.'))
      .filter((b) => !anaNolar.has(b.no.split('.')[0]))
      .map((b) => `${b.no} (satır ${b.satir})`)
    expect(yetim, 'sahipsiz alt bölüm: ana bölümü yok').toEqual([])
  })

  it('ölçüm aracı gerçekten çalışıyor: bozuk girdi KIRMIZI verir (vacuous-pass koruması)', () => {
    // Kapı eklerken kuralımız: bilerek boz, kırmızıyı GÖR. Aşağıdaki iki sahte belge
    // gerçek kusurları birebir taklit eder; ayıklayıcılar onları yakalamazsa kapı
    // yeşil görünen bir süstür.
    const SATIR_SONU = String.fromCharCode(10)
    const mukerrerBelge = ['## D13 — birinci', 'gövde', '## D13 — ikinci'].join(SATIR_SONU)
    const yetimBelge = ['## D1 — var', '### D9.2 — anasi yok'].join(SATIR_SONU)

    const mukerrerBolumler = bolumleriCikar(mukerrerBelge)
    expect(mukerrerBolumler.filter((b) => b.no === 'D13')).toHaveLength(2)

    const yetimBolumler = bolumleriCikar(yetimBelge)
    const anaNolar = new Set(yetimBolumler.filter((b) => b.seviye === 2).map((b) => b.no))
    expect(anaNolar.has('D9')).toBe(false)
    expect(yetimBolumler.some((b) => b.seviye === 3 && b.no === 'D9.2')).toBe(true)
  })
})
