import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CETVEL-YAPI · Cetvellerin BÖLÜM YAPISI tutarlı olmalı.
 *
 * KAPSAM: `docs/standards/**\/*.md` — numaralandırma KULLANAN dosyalar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR — ölçülmüş bir kusurdan doğdu, varsayımdan değil
 * ─────────────────────────────────────────────────────────────────────────────
 * 2026-08-20'de `deploy-build-skip-standard.md`'ye `## D13` bölümü İKİ KEZ yazıldı:
 * biri 08-19 akşamı, ikincisi ertesi gün aynı yazar tarafından, dosyaya bakılmadan.
 * İki özdeş başlık oluştu ve HİÇBİR KAPI KIRMIZI VERMEDİ.
 *
 * Sebep yapısaldı: cetvelleri okuyan tek bir kapı yoktu. `build-skip-positive-logic`
 * betiği ölçer, cetveli değil. 400+ satırlık bir belgenin başlık listesini kimse elle
 * saymaz. SINIF: "cetvel var, onu ölçen kapı yok" — cetvel + zorlayıcı test = kontrol;
 * tek başına cetvel iyi niyettir.
 *
 * ÖNKOŞUL KARŞILANDI: genelleşmeden önce 35 cetvelin tamamı tarandı, 0 ihlal çıktı
 * (OPS-AUDIT onayı, 2026-08-20). Yeni kapı mevcut ihlalle açılmaz.
 *
 * NUMARASIZ CETVELLER KURAL DIŞIDIR, bilerek: beş cetvel düz metin başlık kullanıyor
 * (`## Kural`, `## KOMUT-A`). Onları numaralandırmaya zorlamak kusur onarımı değil,
 * biçim dayatmasıdır. Kural şudur: **numaralandırma kullanan tutarlı kullanır.**
 */

const KOK = 'docs/standards'

/**
 * Geniş sözlük — cetveller üç ayrı biçim kullanıyor ve üçü de meşru:
 *   `## 3. Başlık`  ·  `## 0) Başlık`  ·  `## 2.4 Başlık`  ·  `## D13 — Başlık`
 * Dar bir desen buranın %90'ını sessizce atlar; bu bir kez yaşandı (aşağıdaki
 * "kendi kapsamını ölçer" testinin varlık sebebi).
 */
const BASLIK = /^(#{2,4})\s+(?:§\s*)?([A-ZÇĞİÖŞÜ]{0,6})[\s-]*(\d+(?:\.\d+)*)\s*[.):\-—–]?\s/

type Bolum = { seviye: number; no: string; satir: number }

function bolumleriCikar(metin: string): Bolum[] {
  return metin.split(/\r?\n/).flatMap((satir, i) => {
    const m = BASLIK.exec(satir)
    if (!m) return []
    return [{ seviye: m[1].length, no: `${m[2] ?? ''}${m[3]}`, satir: i + 1 }]
  })
}

function cetvelDosyalari(): string[] {
  const kok = resolve(process.cwd(), KOK)
  return readdirSync(kok, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => join(KOK, d.name))
    .sort()
}

function olculenler(): { yol: string; bolumler: Bolum[] }[] {
  return cetvelDosyalari()
    .map((yol) => ({
      yol,
      bolumler: bolumleriCikar(readFileSync(resolve(process.cwd(), yol), 'utf8')),
    }))
    // Numaralandırma kullanmayan cetvel kural dışıdır (yukarıdaki gerekçe).
    .filter((d) => d.bolumler.length > 0)
}

describe('INV-CETVEL-YAPI · cetvellerin bölüm yapısı', () => {
  it('aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmaz', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const sayim = new Map<string, number[]>()
      for (const b of bolumler) sayim.set(b.no, [...(sayim.get(b.no) ?? []), b.satir])
      return [...sayim.entries()]
        .filter(([, satirlar]) => satirlar.length > 1)
        .map(([no, satirlar]) => `${yol} → ${no} (satır ${satirlar.join(', ')})`)
    })
    expect(ihlaller, 'mükerrer bölüm numarası').toEqual([])
  })

  it('her alt bölüm (X<n>.<m>) kendi ana bölümüne sahiptir', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const anahtarlar = new Set(bolumler.map((b) => b.no))
      return bolumler
        .filter((b) => b.seviye >= 3 && b.no.includes('.'))
        .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
        .map((b) => `${yol} → ${b.no} (satır ${b.satir})`)
    })
    expect(ihlaller, 'sahipsiz alt bölüm: ana bölümü yok').toEqual([])
  })

  /**
   * KAPININ KENDİ KÖRLÜĞÜNE KARŞI — bugünün asıl dersi.
   *
   * Bu envanterin ilk koşusu "0 ihlal" döndürdü ve o sıfır BOŞTU: desen 445 başlığın
   * yalnız 47'sini görüyordu, 35 dosyanın 29'unda tamamen kördü. Sıfır "ihlal yok"
   * değil "bakmadım" demekti.
   *
   * Bu yüzden kapı kendi kapsamını da ölçer. Desen ileride bozulur/daraltılırsa
   * yukarıdaki iki test sessizce yeşile döner; bu test KIRMIZI verir.
   *
   * Kanarya olarak sabit bir dosya seçildi — eşik zamanla kaymaz.
   */
  it('kendi kapsamını ölçer: desen bozulursa sessizce yeşile dönmez', () => {
    const KANARYA = `${KOK}/deploy-build-skip-standard.md`
    const kanaryaBolumleri = bolumleriCikar(
      readFileSync(resolve(process.cwd(), KANARYA), 'utf8'),
    )
    expect(
      kanaryaBolumleri.length,
      `${KANARYA} numaralı bölüm içerir; sıfır çıkması desenin bozulduğunu gösterir`,
    ).toBeGreaterThanOrEqual(5)

    expect(olculenler().length, 'ölçülen cetvel sayısı').toBeGreaterThanOrEqual(10)
  })

  it('ayıklayıcı gerçekten çalışıyor: bozuk girdi yakalanır (vacuous-pass koruması)', () => {
    const SATIR_SONU = String.fromCharCode(10)
    const bozuk = ['## 3. Bir bolum', '### 3.1 Alt', '## 3. AYNI NUMARA', '### 9.7 Anasiz'].join(
      SATIR_SONU,
    )
    const bolumler = bolumleriCikar(bozuk)

    expect(bolumler.filter((b) => b.no === '3')).toHaveLength(2)

    const anahtarlar = new Set(bolumler.map((b) => b.no))
    const yetim = bolumler.filter(
      (b) => b.seviye >= 3 && b.no.includes('.') && !anahtarlar.has(b.no.split('.')[0]),
    )
    expect(yetim.map((b) => b.no)).toEqual(['9.7'])
  })
})
