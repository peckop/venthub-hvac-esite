/**
 * INV-PEER-1 — kurulu doğrudan bağımlılıkların `peerDependencies` beyanları, kurulu sürümlerle
 * tutarlı olmalı; tutarsızlık varsa MUAFİYET LİSTESİNDE ADIYLA ve ölçümüyle yazılı olmalı.
 *
 * NİÇİN VAR (2026-08-19 ölçümü): `react-day-picker@8.10.1` beş aydır `date-fns@^2 || ^3` istiyor,
 * depoda `date-fns@4` kurulu. Bu beş ay hiçbir kapıya görünmedi. Sebep: depoda hiçbir yer `npm`
 * çağırmıyor — her şey `pnpm` kullanıyor ve pnpm peer çatışmasını hata saymıyor. Yani kusur ne
 * kodda ne veride, HİÇ ÖLÇÜLMEYEN BİR YÜZEYDEYDİ.
 *
 * Bu bekçi `npm` çağırmaz: çağıran iş, aynı çatışma yüzünden `--legacy-peer-deps` istemek zorunda
 * kalıyor ve o bayrak tam da ölçmek istediğimiz şeyi susturuyor. Kurulu ağacı DOĞRUDAN okur.
 *
 * KAPSAM, ADIYLA SINIRLI: yalnız `package.json`'daki doğrudan bağımlılıklar taranır (ölçüldü
 * 2026-08-19: 114 peer satırı). Geçişli paketlerin peer beyanları pnpm'in işidir ve buraya dahil
 * DEĞİLDİR — bilinçli sınır, eksiklik değil.
 *
 * Cetvel: `docs/standards/dependency-integrity-standard.md`
 */

import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()

/**
 * MUAFİYETLER — her satır ADIYLA, ölçümüyle ve niçin kabul edildiğiyle yazılır.
 * Bir muafiyet artık ihlal ÜRETMİYORSA test KIRMIZI olur: bayat muafiyet, kapıyı kalıcı olarak
 * kör eden en sinsi şeydir. (Cetvel §4.)
 */
const MUAFIYETLER: ReadonlyArray<{ paket: string; peer: string; gerekce: string }> = [
  // 2026-08-20: liste BOS ve bu bir hata degil, olculmus bir durum. Uc muafiyetin ucu de
  // KENDI onarimlariyla dustu: react-day-picker -> {date-fns, react} ikilisi #698 in v9
  // yukseltmesiyle, @eslint/js -> eslint ise bu daldaki surum hizalamasiyla. Yani su an
  // depoda BILINEN peer ihlali YOK; yeni bir ihlal dogarsa kapi dogrudan kirmizi verir.
]

type Surum = { ana: number; orta: number; kucuk: number; on: string | null }

function surumAyristir(s: string): Surum | null {
  const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/.exec(s.trim())
  if (!m) return null
  return {
    ana: Number(m[1]),
    orta: m[2] === undefined ? 0 : Number(m[2]),
    kucuk: m[3] === undefined ? 0 : Number(m[3]),
    on: m[4] ?? null,
  }
}

function karsilastir(a: Surum, b: Surum): number {
  if (a.ana !== b.ana) return a.ana - b.ana
  if (a.orta !== b.orta) return a.orta - b.orta
  if (a.kucuk !== b.kucuk) return a.kucuk - b.kucuk
  // Ön-sürüm, aynı üçlünün kararlı sürümünden KÜÇÜKTÜR (semver).
  if (a.on === null && b.on === null) return 0
  if (a.on === null) return 1
  if (b.on === null) return -1
  return a.on < b.on ? -1 : a.on > b.on ? 1 : 0
}

/** Tek karşılaştırıcı jetonu. `null` = bu biçimi ÖLÇEMİYORUM (geçti demek DEĞİL). */
function jetonKarsilar(jeton: string, kurulu: Surum): boolean | null {
  const j = jeton.trim()
  if (j === '' || j === '*' || j === 'x' || j === 'X') return true

  const caret = /^\^\s*(.+)$/.exec(j)
  if (caret) {
    const alt = surumAyristir(caret[1])
    if (!alt) return null
    // ^0.y.z semver'de daha dardır; ölçülen veride 0.x caret peer'i yok ama doğru davranalım.
    const ust: Surum =
      alt.ana === 0
        ? { ana: 0, orta: alt.orta + 1, kucuk: 0, on: null }
        : { ana: alt.ana + 1, orta: 0, kucuk: 0, on: null }
    return karsilastir(kurulu, alt) >= 0 && karsilastir(kurulu, ust) < 0
  }

  const tilde = /^~\s*(.+)$/.exec(j)
  if (tilde) {
    const alt = surumAyristir(tilde[1])
    if (!alt) return null
    const ust: Surum = { ana: alt.ana, orta: alt.orta + 1, kucuk: 0, on: null }
    return karsilastir(kurulu, alt) >= 0 && karsilastir(kurulu, ust) < 0
  }

  const kiyas = /^(>=|<=|>|<|=)\s*(.+)$/.exec(j)
  if (kiyas) {
    const hedef = surumAyristir(kiyas[2])
    if (!hedef) return null
    const c = karsilastir(kurulu, hedef)
    switch (kiyas[1]) {
      case '>=':
        return c >= 0
      case '<=':
        return c <= 0
      case '>':
        return c > 0
      case '<':
        return c < 0
      default:
        return c === 0
    }
  }

  if (/^\d/.test(j)) {
    const hedef = surumAyristir(j)
    if (!hedef) return null
    return karsilastir(kurulu, hedef) === 0
  }

  // Tanımadığım biçim (ölçülen örnek: tailwindcss 'insiders' etiketi).
  return null
}

type Sonuc = 'karsilar' | 'ihlal' | 'olculemedi'

/** `||` = VEYA, boşluk = VE. Hiçbir dal karşılamıyor ama biri ölçülemediyse → olculemedi. */
function aralikKarsilar(aralik: string, kuruluHam: string): Sonuc {
  const kurulu = surumAyristir(kuruluHam)
  if (!kurulu) return 'olculemedi'
  let olculemeyenDalVar = false
  for (const dal of aralik.split('||')) {
    const jetonlar = dal.trim().split(/\s+/).filter(Boolean)
    if (jetonlar.length === 0) return 'karsilar'
    let hepsiTamam = true
    let dalOlculemedi = false
    for (const jeton of jetonlar) {
      const r = jetonKarsilar(jeton, kurulu)
      if (r === null) {
        dalOlculemedi = true
        hepsiTamam = false
        break
      }
      if (!r) {
        hepsiTamam = false
        break
      }
    }
    if (hepsiTamam) return 'karsilar'
    if (dalOlculemedi) olculemeyenDalVar = true
  }
  return olculemeyenDalVar ? 'olculemedi' : 'ihlal'
}

type Bulgu = {
  paket: string
  paketSurum: string
  peer: string
  aralik: string
  kurulu: string
  sonuc: Sonuc
}

/** TEK GEÇİŞ: kurulu ağaç bir kez okunur, dosya başına süreç açılmaz. */
function tara(): { bulgular: Bulgu[]; peerSatiri: number; taranan: number } {
  const kokPkg = JSON.parse(readFileSync(join(KOK, 'package.json'), 'utf8'))
  const dogrudan = Object.keys({ ...kokPkg.dependencies, ...kokPkg.devDependencies })
  const bulgular: Bulgu[] = []
  let peerSatiri = 0
  let taranan = 0

  const surumOnbellek = new Map<string, string | null>()

  /**
   * Peer'in KURULU sürümünü, ONU İSTEYEN paketin çözümleme kökünden bulur.
   *
   * NİÇİN BU KADAR UZUN (2026-08-19'da ölçüldü, üç kez yanlış kırmızı verdikten sonra):
   *  1. pnpm katı yerleşim kullanıyor — kök `node_modules/` YALNIZ beyan edilmiş paketleri taşır.
   *     `@testing-library/dom` kurulu olmasına rağmen kökte YOK, bu yüzden kök taraması onu
   *     "KURULU DEGIL" sandı. Ölçüm aracının okuduğu yer, ölçümün kapsamıdır.
   *  2. `createRequire`'a sembolik bağın KENDİSİNİ vermek yetmiyor: Node üst dizinlere yürürken
   *     `.pnpm` kutusuna hiç girmiyor ve kökte arayıp bulamıyor. `realpathSync` şart.
   *  3. Bazı paketler (ölçülen örnek: `three`) `exports` ile `package.json`'ı kapatıyor →
   *     `ERR_PACKAGE_PATH_NOT_EXPORTED`. Bu hata paketin YOK olduğunu değil, VAR olduğunu
   *     kanıtlar; ana girdiden yukarı yürüyerek kendi `package.json`'ını bulmak gerekir.
   *
   * pnpm'de aynı peer, isteyen pakete göre FARKLI sürüme çözülebilir; bu yüzden önbellek
   * anahtarı yalnız peer adı değil, (isteyen, peer) çiftidir.
   */
  const kuruluSurum = (isteyen: string, peer: string): string | null => {
    const anahtar = `${isteyen}|${peer}`
    const onbellekte = surumOnbellek.get(anahtar)
    if (onbellekte !== undefined) return onbellekte

    const oku = (pj: string): string | null => {
      try {
        return String(JSON.parse(readFileSync(pj, 'utf8')).version ?? '') || null
      } catch {
        return null
      }
    }

    let sonuc: string | null = null
    const kokYol = join(KOK, 'node_modules', peer, 'package.json')
    if (existsSync(kokYol)) {
      sonuc = oku(kokYol)
    } else {
      try {
        const req = createRequire(realpathSync(join(KOK, 'node_modules', isteyen, 'package.json')))
        try {
          sonuc = oku(req.resolve(`${peer}/package.json`))
        } catch (hata) {
          if ((hata as { code?: string })?.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw hata
          // package.json dışa kapalı: ana girdiden yukarı yürüyüp paketin kendi manifestini bul.
          let dizin = dirname(req.resolve(peer))
          for (let i = 0; i < 10; i++) {
            const pj = join(dizin, 'package.json')
            if (existsSync(pj)) {
              try {
                const m = JSON.parse(readFileSync(pj, 'utf8'))
                if (m.name === peer) {
                  sonuc = String(m.version ?? '') || null
                  break
                }
              } catch {
                /* bozuk manifest: yukarı yürümeye devam */
              }
            }
            const ust = dirname(dizin)
            if (ust === dizin) break
            dizin = ust
          }
        }
      } catch {
        sonuc = null
      }
    }
    surumOnbellek.set(anahtar, sonuc)
    return sonuc
  }

  for (const ad of dogrudan) {
    const yol = join(KOK, 'node_modules', ad, 'package.json')
    if (!existsSync(yol)) continue
    taranan++
    const meta = JSON.parse(readFileSync(yol, 'utf8'))
    const peerler: Record<string, string> = meta.peerDependencies ?? {}
    const peerMeta: Record<string, { optional?: boolean }> = meta.peerDependenciesMeta ?? {}

    for (const [peer, aralik] of Object.entries(peerler)) {
      peerSatiri++
      const kurulu = kuruluSurum(ad, peer)
      const istegeBagli = peerMeta[peer]?.optional === true
      if (kurulu === null) {
        // İsteğe bağlı + kurulu değil = doğru durum. Zorunlu + kurulu değil = gerçek eksik.
        if (!istegeBagli) {
          bulgular.push({
            paket: ad,
            paketSurum: String(meta.version),
            peer,
            aralik: String(aralik),
            kurulu: 'KURULU DEGIL',
            sonuc: 'ihlal',
          })
        }
        continue
      }
      const sonuc = aralikKarsilar(String(aralik), kurulu)
      if (sonuc !== 'karsilar') {
        bulgular.push({
          paket: ad,
          paketSurum: String(meta.version),
          peer,
          aralik: String(aralik),
          kurulu,
          sonuc,
        })
      }
    }
  }
  return { bulgular, peerSatiri, taranan }
}

const { bulgular, peerSatiri, taranan } = tara()
const muafMi = (b: Bulgu) => MUAFIYETLER.some((m) => m.paket === b.paket && m.peer === b.peer)

describe('INV-PEER-1: peer bağımlılık bütünlüğü', () => {
  it('ölçüm gerçekten koştu (boş tarama sessiz-yeşil verir)', () => {
    // Ölçemedim != geçtim: kurulu ağaç okunamadıysa bu bekçi hiçbir şey söylemiyor demektir.
    expect(taranan).toBeGreaterThan(20)
    expect(peerSatiri).toBeGreaterThan(50)
  })

  it('muaf olmayan hiçbir peer ihlali yok', () => {
    const kalan = bulgular.filter((b) => b.sonuc === 'ihlal' && !muafMi(b))
    const rapor = kalan
      .map((b) => `${b.paket}@${b.paketSurum} -> ${b.peer}: istenen "${b.aralik}", kurulu "${b.kurulu}"`)
      .join('\n')
    expect(kalan, `Muafiyet listesinde ADIYLA yazılmayan peer ihlali:\n${rapor}`).toEqual([])
  })

  it('hiçbir peer aralığı ÖLÇÜLEMEDİ durumunda kalmıyor (fail-closed)', () => {
    const olculemeyen = bulgular.filter((b) => b.sonuc === 'olculemedi')
    const rapor = olculemeyen
      .map((b) => `${b.paket}@${b.paketSurum} -> ${b.peer}: "${b.aralik}" (kurulu ${b.kurulu})`)
      .join('\n')
    // Bu kırmızı "ihlal var" demez, "bu biçimi okuyamadım" der — ikisi AYRI sınıftır ve
    // ölçülemeyeni geçmiş saymak bu bekçinin varlık sebebini ortadan kaldırır.
    expect(olculemeyen, `Aralık biçimi çözülemedi — çözücü genişletilmeli:\n${rapor}`).toEqual([])
  })

  it('her muafiyet HÂLÂ gerçek bir ihlali karşılıyor (bayat muafiyet kapıyı kör eder)', () => {
    const bayat = MUAFIYETLER.filter(
      (m) => !bulgular.some((b) => b.sonuc === 'ihlal' && b.paket === m.paket && b.peer === m.peer),
    ).map((m) => `${m.paket} -> ${m.peer}`)
    expect(bayat, `Bu muafiyetler artık ihlal üretmiyor, SİLİNMELİ:\n${bayat.join('\n')}`).toEqual([])
  })

  it('her muafiyetin gerekçesi ölçüm içerir (çıplak muafiyet yasak)', () => {
    for (const m of MUAFIYETLER) {
      expect(m.gerekce.length, `${m.paket} -> ${m.peer} gerekçesi çok kısa`).toBeGreaterThan(80)
      expect(m.gerekce, `${m.paket} -> ${m.peer} gerekçesi ölçüm tarihi içermiyor`).toMatch(
        /\d{4}-\d{2}-\d{2}/,
      )
    }
  })
})
