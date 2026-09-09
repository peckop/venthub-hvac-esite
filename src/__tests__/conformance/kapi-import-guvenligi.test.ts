/**
 * INV-KAPI-IMPORT-1 KİLİDİ — bir kapı, HER AĞAÇTA aynı sonucu vermeli.
 *
 * NİÇİN BU KİLİT VAR (2026-09-09, üç bağımsız ölçüm)
 *
 * `denetim-izi-kapisi.test.ts` içindeki `await import(KAPI)` çağrısı **ham Windows yolu**
 * alıyordu. Node'un ESM yükleyicisi bunu kabul etmez:
 *   `Error: Only URLs with a scheme in: file, data, and node are supported`
 *
 * ⛔**SONUÇ, ADIYLA:** URUN'un ve KATALOG'un ağaçlarında **6 kol düştü / 21 geçti** — ve düşen
 * altısı kapının **ayırt edici** kollarıydı (yeşil taraf + dört kırmızı sınıf + ayıklayıcı).
 * Yani o ağaçlarda kapı "kırmızı vermiyor" değildi, **kapı hiç sınanmıyordu**; geçen 21 kol
 * ayırt etmeyen kısımdı. CI Linux olduğu için master yeşildi ve hiçbir kapı bunu görmedi.
 *
 * ⭐**BENİM AĞACIMDA GEÇİYORDU** (27/27). Kusuru ben ölçmedim, URUN teşhis etti, KATALOG üçüncü
 * bağımsız ölçümle üretti. Ders: *kendi ağacında yeşil görmek, kapının her yerde koştuğunun
 * kanıtı değildir* — aynı dosya, aynı Node sürümü, farklı ağaç, farklı sonuç.
 *
 * İKİNCİ KUSUR (URUN'un yan bulgusu): kapı betiği **import edildiğinde kendini koşuyordu** —
 * `degerlendir`'i sınamak için dosyayı import eden her kol, sırsız makinede canlı DB'ye
 * uzanıyordu. Bir birim testi ağa çıkmamalı; üstelik o gürültü, testin ASIL ölçtüğü şeyi
 * gölgeler (bugün tam bu oldu: kollar düşünce sebep import yolu mu DB mi, ayırt edilemedi).
 *
 * Bu kilit **tek dosyayı değil sınıfı** korur: onarım tek yerde yapılırsa bir sonraki kapı
 * aynı hatayla doğar (kopya sürüklenmesi — bugün `sslmode` sökümünde de yaşandı).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const KONFORMANS = path.join(KOK, 'src/__tests__/conformance')

function oku(yol: string): string {
  const metin = fs.readFileSync(yol, 'utf8')
  if (metin.trim().length < 50) {
    throw new Error(`DEDEKTOR SAGLIGI: ${yol} beklenmeyecek kadar kisa (${metin.length} bayt)`)
  }
  return metin
}

/** JS/TS yorumlarini soker. ⛔`(?<!:)` sart: yoksa `https://` icindeki // yorum sanilir. */
function jsYorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?<!:)\/\/[^\n]*/g, ' ')
}

describe('INV-KAPI-IMPORT-1 · dinamik import her agacta cozulebilir olmali', () => {
  /**
   * ⚠KENDINI TARAMAZ, ADIYLA: bu dosya ihlal MESAJINDA `await import(...)` metnini kuruyor,
   * yani kendi kaynagini tararsa kendi iddiasina takilir. Ilk hâlinde tam bu oldu.
   * Bu bir muafiyet DEGIL: dosyanin kendi import satiri yok, sadece BASKA dosyalari olcuyor.
   */
  const KENDI = 'kapi-import-guvenligi.test.ts'
  const dosyalar = fs
    .readdirSync(KONFORMANS)
    .filter((f) => f.endsWith('.test.ts') && f !== KENDI)
    .map((f) => path.join(KONFORMANS, f))

  it('taranan evren BOS DEGIL (dedektor sagligi)', () => {
    expect(dosyalar.length).toBeGreaterThan(50)
  })

  it('hicbir konformans testi dinamik import-a HAM DEGISKEN YOL vermez', () => {
    const ihlaller: string[] = []
    for (const yol of dosyalar) {
      const govde = jsYorumsuz(oku(yol))
      // `await import(` sonrasi tirnakli bir belirteç ya da pathToFileURL/URL olmali.
      const kaliplar = govde.matchAll(/await\s+import\(\s*([^)]*)/g)
      for (const k of kaliplar) {
        const arg = (k[1] ?? '').trim()
        if (!arg) continue
        const tirnakli = /^['"`]/.test(arg)
        const urlKurulmus = /pathToFileURL|new URL\(|\.href/.test(arg)
        if (!tirnakli && !urlKurulmus) {
          ihlaller.push(`${path.basename(yol)} -> await import(${arg.slice(0, 50)})`)
        }
      }
    }
    expect(ihlaller, ihlaller.join('\n')).toEqual([])
  })
})

describe('INV-KAPI-IMPORT-1 · kapi betikleri IMPORT EDILDIGINDE kosmaz', () => {
  /**
   * Kapsam: `degerlendir` benzeri saf islevini birim testine acan kapi betikleri.
   * Bu listeye bir betik EKLENIYORSA, ayni korumayi da tasimak zorundadir.
   */
  const BETIKLER = ['scripts/db/checks/denetim-izi-tetik-kapisi.mjs']

  it.each(BETIKLER)('%s: main() kosulsuz CAGRILMAZ', (goreli) => {
    const govde = jsYorumsuz(oku(path.join(KOK, goreli)))
    // Kolon 0-da duran bir main() cagrisi = import edildiginde de kosar.
    expect(govde).not.toMatch(/^main\(\)/m)
    // Ve dogrudan-cagrildi kapisi GERCEKTEN var olmali (yoklugu kanit degil, ARIZA).
    expect(govde).toMatch(/import\.meta\.url/)
  })
})
