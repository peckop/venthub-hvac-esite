import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEP-KARAR-1 · Sürüm kararı GEREKÇESİZ DEĞİŞEMEZ.
 *
 * Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` §10.
 * Kayıt: `docs/standards/bagimlilik-kararlari.md` (bu kapının VERİSİ, süs belge değil).
 *
 * NİÇİN VAR — Recep'in ilkesi, 2026-09-19 (birebir):
 *   "her yapılanın izi olmalı takip edilebilmeli tetiklenebilmeli .. otonom bir yapıya
 *    gelemeyen herşey bir gün unutulacak."
 * Ve aynı günün ikinci cümlesi: "yani benim sözümü not olarak kaydetmen neyi çözüyor?"
 * Cevabı bu dosyadır: bir cümle ancak DEĞİŞİKLİĞİN YOLUNA konulduğunda not olmaktan çıkar.
 *
 * ÖLÇÜLMÜŞ BOŞLUK: `next` niçin 15.5.24'te sabit, `undici` niçin üst sınırlı — cevaplar PR
 * gövdelerinde ve denetim kayıtlarında dağınıktı. Üç ay sonra sürümü değiştiren kişinin
 * karşısına HİÇBİRİ çıkmıyordu. Mevcut kapıların hiçbiri bunu görmez:
 *   • `INV-DEP-1` (dependency-pins) — sürümün ZAMANA bırakılmasını yasaklar ("latest", "*").
 *     Somut bir sürümün NİÇİN o sürüm olduğunu sormaz. Farklı sınıf, örtüşme yok.
 *   • `peer-dependency-integrity` — sürümler BİRBİRİYLE uyumlu mu diye bakar, gerekçeye değil.
 *   • `pnpm audit` — güvenlik kaydı sayar; karar kaydı diye bir kavramı yok.
 *   • tsc / lint / build — geçerli bir sürüm dizesi her zaman geçerlidir.
 *
 * TETİK: bu kapının tetiği CRON DEĞİL (REC-328 gözcü/cron yasağı), DEĞİŞİKLİĞİN KENDİSİDİR.
 * `package.json`'daki bir sürüm değiştiği an kayıt ile gerçek ayrışır ve kapı kırmızı verir;
 * yeşile dönmenin tek yolu kayda yeni aralığı VE gerekçesini yazmaktır.
 *
 * ⭐GEREKÇE-SÜRÜM BAĞI: `KARAR` satırının gerekçe metni, aralıktaki sürüm numarasını İÇERMEK
 * ZORUNDA. Böylece sayıyı değiştirip gerekçeyi olduğu gibi bırakmak da kırmızı verir —
 * "tabloyu güncelledim" ile "kararı yeniden düşündüm" arasındaki farkı kapı görebilsin diye.
 *
 * KAPSAM DIŞI (bilinçli, sessiz cap DEĞİL): `^` ile yazılmış akan aralıklar. Onlar tekil karar
 * değil, bilinçli akıştır. Gönüllü eklenen satır evrende olmasa da aynı kurallara tabidir.
 */

const KOK = path.resolve(__dirname, '../../..')
const PKG_YOLU = path.join(KOK, 'package.json')
const KAYIT_YOLU = path.join(KOK, 'docs', 'standards', 'bagimlilik-kararlari.md')

/**
 * BORÇ = aralığı gerçeğe göre kayıtlı ama gerekçesi henüz ölçülmemiş satır.
 *
 * ⭐16 DEĞİL 20, ve sebebi kayda geçiyor: ilk sayımda `react`/`react-dom`/`@types/react`/
 * `@types/react-dom` satırları `KARAR` yazılmıştı, gerekçeleri ÇIKARIMDI ve dayandırıldıkları
 * commit ölçüldüğünde React'ten hiç söz etmediği görüldü. Dördü BORÇ'a alındı, tavan doğuş
 * anında düzeltildi. Tavan doğduğunda ÖLÇÜMLE kurulur; ondan sonra yalnız AZALIR.
 */
const BORC_TAVANI = 20

/**
 * Cetvel §4: override DAİMA aralıklıdır, açık uçlu değil (">=7.29.0" ana sürüm atlatır —
 * 2026-09-13'te `undici`yi 8.10.2'ye çıkardı). Bugün bu kural 17 yerde çiğneniyor: kural
 * YAZILIYDI, hiçbir kapı ölçmüyordu. Tavan dondurulmuştur, yalnız AZALABİLİR.
 */
const ACIK_UCLU_TAVANI = 17

/**
 * ⭐GEVŞETME ADAYI = gerekçesi ölçülmemiş TAM PİN (kayıt §2.1, Recep kuralı 2026-09-19:
 * "salak saçma gereksiz sebeplerle kendimizi sabitlemeyelim; gerçek bir sebep varsa da
 * bilelim"). Tam pin varsayılan değil istisnadır; gerekçesizi sınanmayı bekler.
 *
 * Bu sayı BORÇ tavanından AYRI tutuluyor, çünkü iki borç aynı şey değil: açık uçlu bir
 * override'ın gerekçesizliği sürüm AKIŞINI serbest bırakır, tam pininki AKIŞI KİLİTLER.
 * İkincisi sessizce maliyet üretir — react 19.0.0 pini üç küçük sürümü engelliyordu ve
 * bunu kimse ölçmemişti (köken: 18→19 göçünün temkini, `06e940580`, 2026-03-17).
 */
const GEVSETME_ADAYI_TAVANI = 7

type Satir = { paket: string; aralik: string; tarih: string; durum: string; gerekce: string }

type Paket = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  pnpm?: { overrides?: Record<string, string> }
}

function pkgOku(): Paket {
  return JSON.parse(fs.readFileSync(PKG_YOLU, 'utf8')) as Paket
}

/** Sabit pin = aralık işareti taşımayan, doğrudan sürümle yazılmış değer ("15.5.24"). */
function sabitPinMi(aralik: string): boolean {
  return /^\d/.test(aralik.trim())
}

/** Kapının EVRENİ paketten ölçülür, kayıttan okunmaz — kayıt kendi kapsamını tayin edemez. */
function evren(pkg: Paket): Map<string, string> {
  const out = new Map<string, string>()
  for (const alan of ['dependencies', 'devDependencies', 'optionalDependencies'] as const) {
    for (const [ad, aralik] of Object.entries(pkg[alan] ?? {})) {
      if (sabitPinMi(aralik)) out.set(ad, aralik)
    }
  }
  for (const [ad, aralik] of Object.entries(pkg.pnpm?.overrides ?? {})) out.set(ad, aralik)
  return out
}

/** `docs/standards/bagimlilik-kararlari.md` §4 tablosunu ayrıştırır. */
function kayitAyristir(metin: string): Satir[] {
  const bolum = metin.split(/^##\s*4\s*·/m)[1]
  if (!bolum) return []
  const govde = bolum.split(/^##\s/m)[0]
  const satirlar: Satir[] = []
  for (const ham of govde.split('\n')) {
    const s = ham.trim()
    if (!s.startsWith('|')) continue
    const h = s.slice(1, s.endsWith('|') ? -1 : undefined).split('|').map((x) => x.trim())
    if (h.length < 5) continue
    if (/^-+$/.test(h[1]) || h[0] === 'paket') continue // başlık ve ayraç satırını ele
    satirlar.push({ paket: h[0], aralik: h[1], tarih: h[2], durum: h[3], gerekce: h[4] })
  }
  return satirlar
}

/** Aralıktaki İLK sürüm numarası — gerekçe metninin taşımak zorunda olduğu damga. */
function surumDamgasi(aralik: string): string | null {
  const m = aralik.match(/\d+\.\d+\.\d+(?:-[\w.]+)?/)
  return m ? m[0] : null
}

function acikUcluMu(aralik: string): boolean {
  return /^>=?\s*\d/.test(aralik.trim()) && !aralik.includes('<')
}

const pkg = pkgOku()
const EVREN = evren(pkg)
const KAYIT = kayitAyristir(fs.readFileSync(KAYIT_YOLU, 'utf8'))

describe('INV-DEP-KARAR-1 · sürüm kararı gerekçesiz değişemez', () => {
  it('kayıt ve evren BOŞ DEĞİL — kapı vakumda yeşil vermez', () => {
    // Sessiz-boş sınıfı: tablo biçimi bozulursa ayrıştırıcı 0 satır döner ve aşağıdaki
    // testlerin hepsi boş küme üzerinde koşup GEÇER. O yüzden taban burada ölçülür.
    expect(KAYIT.length, 'karar kaydı tablosu ayrıştırılamadı ya da boşaldı').toBeGreaterThan(25)
    expect(EVREN.size, 'package.json evreni boş — ayrıştırma kırık').toBeGreaterThan(25)
  })

  it('evrendeki HER paketin kayıtta satırı var', () => {
    const kayitli = new Set(KAYIT.map((s) => s.paket))
    const eksik = [...EVREN.keys()].filter((p) => !kayitli.has(p))
    expect(
      eksik,
      `Sabit pinlenmiş ya da override edilmiş ama KARARI YAZILMAMIŞ paket:\n  ${eksik.join('\n  ')}\n\n` +
        `docs/standards/bagimlilik-kararlari.md §4'e satır ekle. Gerekçe ölçülemiyorsa durum\n` +
        `BORÇ yazılır — ama borç tavanı dolu (${BORC_TAVANI}), yani yeni satır BORÇ doğamaz.`,
    ).toEqual([])
  })

  it('⭐kayıtlı aralık package.json ile BİREBİR aynı — sürüm sessizce değişemez', () => {
    const ayrisan: string[] = []
    for (const s of KAYIT) {
      const gercek = EVREN.get(s.paket)
      if (gercek === undefined) continue // yetim satır ayrı kolda ölçülüyor
      if (gercek !== s.aralik) ayrisan.push(`${s.paket}: kayıt "${s.aralik}" ≠ gerçek "${gercek}"`)
    }
    expect(
      ayrisan,
      `Sürüm DEĞİŞTİ ama kararı güncellenmedi:\n  ${ayrisan.join('\n  ')}\n\n` +
        `Bu kapının bütün amacı bu satırdır. Yapılacak: yeni aralığı kayda yaz VE gerekçesini\n` +
        `yeniden düşün (gerekçe metni yeni sürüm numarasını içermek zorunda).`,
    ).toEqual([])
  })

  it('yetim satır yok — kaldırılan paketin kararı kayıtta kalmaz', () => {
    const hepsi = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
      ...Object.keys(pkg.pnpm?.overrides ?? {}),
    ])
    const yetim = KAYIT.filter((s) => !EVREN.has(s.paket) && !hepsi.has(s.paket)).map((s) => s.paket)
    expect(
      yetim,
      `package.json'da artık olmayan paketin karar satırı:\n  ${yetim.join('\n  ')}\n` +
        `Bayat kayıt, yanlış kayıttan beterdir — sil.`,
    ).toEqual([])
  })

  it('KARAR satırının gerekçesi DOLU ve sürüm numarasını taşıyor', () => {
    const kusurlu: string[] = []
    for (const s of KAYIT) {
      if (s.durum !== 'KARAR') continue
      if (s.gerekce.length < 40) {
        kusurlu.push(`${s.paket}: gerekçe çok kısa (${s.gerekce.length} karakter, en az 40)`)
        continue
      }
      const damga = surumDamgasi(s.aralik)
      if (damga && !s.gerekce.includes(damga)) {
        kusurlu.push(`${s.paket}: gerekçe "${damga}" sürümünden hiç söz etmiyor`)
      }
    }
    expect(
      kusurlu,
      `Gerekçesi kapıyı geçmeyen KARAR satırı:\n  ${kusurlu.join('\n  ')}\n\n` +
        `Sürüm-gerekçe bağı kasıtlı: sayıyı değiştirip metni olduğu gibi bırakmak KIRMIZI verir.`,
    ).toEqual([])
  })

  it(`BORÇ tavanı sıkışır, gevşemez (tavan ${BORC_TAVANI})`, () => {
    const borclu = KAYIT.filter((s) => s.durum === 'BORÇ').map((s) => s.paket)
    expect(
      borclu.length,
      `Gerekçesi yazılmamış satır sayısı ARTTI (${borclu.length} > ${BORC_TAVANI}):\n  ${borclu.join('\n  ')}\n\n` +
        `Yeni bir paket BORÇ olarak doğamaz. Borç kapandıkça bu tavan da düşürülür.`,
    ).toBeLessThanOrEqual(BORC_TAVANI)
  })

  it(`⭐gevşetme adayı (gerekçesiz TAM PİN) tavanı sıkışır (tavan ${GEVSETME_ADAYI_TAVANI})`, () => {
    const adaylar = KAYIT.filter((s) => s.durum === 'BORÇ' && sabitPinMi(s.aralik)).map(
      (s) => `${s.paket} = "${s.aralik}"`,
    )
    expect(
      adaylar.length,
      `Gerekçesi ölçülmemiş TAM PİN sayısı ARTTI (${adaylar.length} > ${GEVSETME_ADAYI_TAVANI}):\n  ${adaylar.join('\n  ')}\n\n` +
        `Kayıt §2.1: tam pin İSTİSNADIR. Yeni bir tam pin ya gerekçesiyle gelir (KARAR) ya da\n` +
        `hiç gelmez. "Sebep yok" demek bir DENEME gerektirir: ayrı dalda gevşet, derle, testleri\n` +
        `koştur, etkilenen ekranı görsel doğrula.`,
    ).toBeLessThanOrEqual(GEVSETME_ADAYI_TAVANI)
  })

  it(`cetvel §4: açık uçlu override tavanı sıkışır (tavan ${ACIK_UCLU_TAVANI})`, () => {
    // ⭐Bu kol bir ÖLÇÜMDEN doğdu: cetvel §4 "override daima aralıklıdır" diyor, ama bugün
    // 17 override açık uçlu. Kural yazılıydı ve hiçbir kapı ölçmüyordu — tam olarak
    // "kuralı yazmak uygulamak değildir" sınıfı. Tavan dondurulur, yalnız azalır.
    const acik = Object.entries(pkg.pnpm?.overrides ?? {})
      .filter(([, a]) => acikUcluMu(a))
      .map(([ad, a]) => `${ad} = "${a}"`)
    expect(
      acik.length,
      `Üst sınırsız override sayısı ARTTI (${acik.length} > ${ACIK_UCLU_TAVANI}):\n  ${acik.join('\n  ')}\n\n` +
        `Açık uçlu ">=" ANA SÜRÜM ATLATIR: 2026-09-13'te undici'yi 8.10.2'ye çıkardı.\n` +
        `Doğrusu ">=7.29.0 <8.0.0". Cetvel §4.`,
    ).toBeLessThanOrEqual(ACIK_UCLU_TAVANI)
  })

  it('kendi kendini doğrular: sahte girdilerde ihlali GERÇEKTEN görür', () => {
    // Yeşil bir kapı, ihlali gördüğünü kanıtlamaz. Ayırt ediciliği burada ölçülür.
    expect(sabitPinMi('15.5.24')).toBe(true)
    expect(sabitPinMi('^15.5.24')).toBe(false)
    expect(sabitPinMi('>=7.29.0')).toBe(false)

    expect(acikUcluMu('>=7.29.0')).toBe(true)
    expect(acikUcluMu('>=7.29.0 <8.0.0')).toBe(false)
    expect(acikUcluMu('9.0.7')).toBe(false)

    expect(surumDamgasi('>=8.5.19 <9.0.0')).toBe('8.5.19')
    expect(surumDamgasi('19.1.0-rc.2')).toBe('19.1.0-rc.2')
    expect(surumDamgasi('yok')).toBeNull()

    // Ayrıştırıcı gerçekten satır çıkarıyor mu, ve başlık/ayraç satırını eliyor mu?
    const sahte = [
      '## 4 · KAYIT',
      '| paket | aralık | tarih | durum | gerekçe |',
      '|---|---|---|---|---|',
      '| next | 15.5.24 | 2026-09-13 | KARAR | 15.5.24 gerekçesi |',
      '| lodash | >=4.18.1 | — | BORÇ | — |',
      '## 5 · sonraki bölüm',
      '| bu | satır | tabloya | dahil | olmamalı |',
    ].join('\n')
    const cikti = kayitAyristir(sahte)
    expect(cikti.map((s) => s.paket)).toEqual(['next', 'lodash'])
    expect(cikti[0].durum).toBe('KARAR')

    // Ve asıl sınav: aralık ayrıştığında kapı bunu görüyor mu?
    const sahteEvren = new Map([['next', '15.6.0']])
    const ayrisan = cikti.filter(
      (s) => sahteEvren.has(s.paket) && sahteEvren.get(s.paket) !== s.aralik,
    )
    expect(ayrisan.map((s) => s.paket)).toEqual(['next'])
  })
})
