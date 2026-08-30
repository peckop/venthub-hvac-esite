import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TOKEN-SINIF-1 — `h-450px` gibi token-bağımlı Tailwind sınıfları, tokens.js'te
 * GERÇEKTEN tanımlı olmalıdır.
 *
 * NİÇİN VAR (REC-89 kusur 1, canlıda ölçüldü — bu kapı olmadığı için beş ay yaşadı):
 *
 * `HomeSinevizyon.tsx` hero'nun sağ kolonunu `h-320px sm:h-450px lg:h-550px` ile
 * boyutlandırıyordu. `450px` ve `550px` `height` token'ında VAR; **`320px` YOK** — o değer
 * yalnız `minHeight`/`width`/`minWidth` nesnelerinde tanımlı. Yani `min-h-320px` çalışıyor,
 * `h-320px` çalışmıyor: Tailwind o sınıf için hiç CSS üretmiyor.
 *
 * Sonucu sessiz ve ağırdı. Mobil kırılımda (sm altı) kapsayıcı **0px'e** çöküyor, içindeki
 * mutlak konumlu ürün görselleri hero metninin ve iki CTA butonunun ÜZERİNE biniyordu.
 * Canlı ölçüm (390px viewport): kapsayıcı `getBoundingClientRect().height = 0`; "Ürünleri
 * Keşfet" butonunun tam merkezinde `elementFromPoint` → butona AİT OLMAYAN bir `IMG`.
 * Müşteri "butonların metni görünmüyor" diye görüyordu; sebep kontrast DEĞİL, binişmeydi.
 *
 * NİÇİN HİÇBİR KAPI GÖRMEDİ: geçersiz sınıf adı TypeScript için sıradan bir dizedir, ESLint
 * için de öyle; test yoktu; sm ve lg kırılımları GEÇERLİ olduğu için masaüstünde her şey
 * doğru görünüyordu. Kusur yalnız tek bir kırılımda yaşıyordu — yani "ekranda iyi duruyor"
 * kontrolü bunu asla yakalayamazdı.
 *
 * KAPSAM SINIRI, AÇIKÇA: bu kapı yalnız `className` ATAMALARINI okur. Sebebi ölçülmüş bir
 * yanlış pozitiftir — depo taramasının ilk sürümü, bu kusuru ANLATAN yorum satırındaki
 * `h-320px` metnini de kusur sanmıştı. Yorumlar, URL'ler ve serbest metin bu yüzden kapsam
 * dışıdır; `cn()`/`clsx()` içine gömülü dizeler de şimdilik görülmez (bilinen boşluk).
 */

const KOK = process.cwd()
const TOKENS = path.join(KOK, 'src', 'design-system', 'tokens.js')

/** tokens.js içindeki `export const <ad> = { ... }` bloğunun anahtar kümesi. */
function tokenKumesi(kaynak: string, ad: string): Set<string> {
  const m = kaynak.match(new RegExp('export const ' + ad + ' = \\{([\\s\\S]*?)\\n\\}'))
  if (!m) return new Set()
  return new Set([...m[1].matchAll(/'([^']+)'\s*:/g)].map((x) => x[1]))
}

/** Sınıf öneki → hangi token nesnesinden beslendiği. Sıra ÖNEMLİ (uzun önek önce). */
const ONEK_TOKEN: ReadonlyArray<readonly [string, string]> = [
  ['max-h', 'maxHeight'],
  ['max-w', 'maxWidth'],
  ['min-h', 'minHeight'],
  ['min-w', 'minWidth'],
  ['h', 'height'],
  ['w', 'width'],
]

/** `className="..."` / `className={'...'}` / `className={\`...\`}` içeriklerini toplar. */
function classNameDizeleri(icerik: string): string[] {
  const cikti: string[] = []
  const desen = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\})/g
  for (const m of icerik.matchAll(desen)) {
    const deger = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]
    if (deger) cikti.push(deger)
  }
  return cikti
}

/**
 * Bir className dizesindeki token-bağımlı sınıflardan tokens.js'te KARŞILIĞI OLMAYANLARI döner.
 * Saf fonksiyon — testin ayırt ediciliği bunun üzerinden kanıtlanır.
 */
export function gecersizSiniflar(
  sinifDizesi: string,
  kumeler: Record<string, Set<string>>,
): string[] {
  const bulunan: string[] = []
  for (const ham of sinifDizesi.split(/\s+/)) {
    if (!ham) continue
    const sinif = ham.includes(':') ? ham.slice(ham.lastIndexOf(':') + 1) : ham
    for (const [onek, tokenAdi] of ONEK_TOKEN) {
      const on = onek + '-'
      if (!sinif.startsWith(on)) continue
      const deger = sinif.slice(on.length)
      // Yalnız SAYI+BİRİM biçimli değerler token tablosundan beslenir; `h-full`,
      // `h-screen`, `h-1/2` gibi Tailwind'in kendi ölçeği bu kapının konusu değildir.
      if (!/^[0-9]+(px|vh|vw|rem)$/.test(deger)) break
      if (!kumeler[tokenAdi]?.has(deger)) bulunan.push(sinif)
      break
    }
  }
  return bulunan
}

function tsxDosyalari(kok: string): string[] {
  const cikti: string[] = []
  const yur = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (!/node_modules|\.next|\.git/.test(p)) yur(p)
      } else if (/\.tsx?$/.test(e.name)) cikti.push(p)
    }
  }
  yur(path.join(kok, 'src'))
  return cikti
}

describe('INV-TOKEN-SINIF-1 — token-bağımlı Tailwind sınıfları gerçekten tanımlı', () => {
  const kaynak = fs.readFileSync(TOKENS, 'utf8')
  const kumeler: Record<string, Set<string>> = {}
  for (const [, tokenAdi] of ONEK_TOKEN) kumeler[tokenAdi] = tokenKumesi(kaynak, tokenAdi)

  it('ÖN KOŞUL — token tabloları gerçekten okundu (boş küme sahte yeşil üretirdi)', () => {
    // Bu kol olmadan tokens.js yolu bozulsa TÜM sınıflar "tanımsız" değil, tam tersine
    // hiçbir şey ölçülmemiş olurdu; boş küme her şeyi geçersiz sayardı. Yani bu kol
    // aracın çalıştığını kanıtlar.
    for (const [, tokenAdi] of ONEK_TOKEN) {
      expect(kumeler[tokenAdi].size, `${tokenAdi} token tablosu okunamadı`).toBeGreaterThan(5)
    }
  })

  it('AYIRT EDİCİ — ölçüt hem YAKALAR hem SERBEST BIRAKIR', () => {
    // Pozitif kol: REC-89'un gerçek kusuru yakalanmalı.
    expect(gecersizSiniflar('w-full lg:w-1/2 relative h-320px', kumeler)).toContain('h-320px')
    // Negatif kol: aynı değer FARKLI önekte geçerlidir (320px minHeight'ta VAR) —
    // kapı bunu kusur sanarsa çalışan kodu kırmızı yakar.
    expect(gecersizSiniflar('min-h-320px', kumeler)).toEqual([])
    // Geçerli yükseklikler serbest.
    expect(gecersizSiniflar('h-450px sm:h-550px', kumeler)).toEqual([])
    // Tailwind'in kendi ölçeği bu kapının konusu değil.
    expect(gecersizSiniflar('h-full h-screen w-1/2 h-8', kumeler)).toEqual([])
  })

  it('DEPO — hiçbir className token tablosunda olmayan bir ölçü sınıfı kullanmıyor', () => {
    const ihlaller: string[] = []
    for (const dosya of tsxDosyalari(KOK)) {
      const icerik = fs.readFileSync(dosya, 'utf8')
      for (const dize of classNameDizeleri(icerik)) {
        for (const sinif of gecersizSiniflar(dize, kumeler)) {
          ihlaller.push(`${path.relative(KOK, dosya).replace(/\\/g, '/')} :: ${sinif}`)
        }
      }
    }
    expect(
      [...new Set(ihlaller)],
      'tokens.js\'te karşılığı olmayan ölçü sınıfı: Tailwind bunlar için CSS ÜRETMEZ, ' +
        'eleman sessizce 0 boyuta çöker. Ya tokens.js\'e değeri ekleyin ya tanımlı bir token kullanın.',
    ).toEqual([])
  })
})
