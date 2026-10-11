// @vitest-environment node
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-E2E-HIZLI-3 · e2e-smoke'ta paralel apt ve kapının yeri (ALT-38f).
 *
 * NİÇİN VAR: `admin-smoke` işinde `playwright install-deps` Build ile PARALEL arka planda koşar, sonucu Build'ten sonra `bekle` toplar. Bu, kapıyı gevşetebilecek ya da
 * kazancı sessizce sıfırlayabilecek bir yerdir: paralel apt'nin sonucu beklenmeden tarayıcı probu koşarsa ya da prob en-iyi-çabaya düşerse eksik kütüphanede iş SESSİZ
 * yeşil olabilir. Bu dosya o yeri ölçer ve bilerek bozulmuş kopyada kırmızı verdiğini kanıtlar.
 * (Webpack derleme önbelleği bu PR'ın ilk sürümünde de vardı ve ÇIKARILDI: cetvel §4.4; bu kapı onun için bir şey denetlemez.)
 * Sınıf koşulları (INV-CI-SINIF-1) ve `ci-install-bounded` (INV-CI-INSTALL-1) ayrı dosyalarda durur; burada TEKRAR edilmez.
 * Ölçüm yüzeyi: `node:fs` + satır taraması (YAML ayrıştırıcı yok; girinti sabit: iş 2, iş anahtarı 4, adım 6, adım anahtarı 8). İş akışlarını DEĞİŞTİRMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string): string => readFileSync(path.join(KOK, yol), 'utf8').replace(/\r\n/g, '\n')

interface Adim {
  ad: string
  satirlar: string[]
  /** Adımın DOĞRUDAN anahtarları (girinti 8). */
  anahtarlar: Map<string, string>
  girdiler: Map<string, string>
  env: Map<string, string>
  govde: string | null
}

function isSatirlari(metin: string, isId: string): string[] {
  const satirlar = metin.split('\n')
  const jobs = satirlar.findIndex((s) => s === 'jobs:')
  const bas = jobs < 0 ? -1 : satirlar.findIndex((s, i) => i > jobs && s === `  ${isId}:`)
  if (bas < 0) return []
  let bit = satirlar.length
  for (let i = bas + 1; i < satirlar.length; i++) {
    if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(satirlar[i])) {
      bit = i
      break
    }
  }
  return satirlar.slice(bas + 1, bit)
}

function adimlar(metin: string, isId: string): Adim[] {
  const isSat = isSatirlari(metin, isId)
  const stepsIdx = isSat.findIndex((s) => s === '    steps:')
  if (stepsIdx < 0) return []
  const liste: Adim[] = []
  for (const s of isSat.slice(stepsIdx + 1)) {
    const m = /^ {6}- name: ?(.*)$/.exec(s)
    if (m) liste.push({ ad: m[1].trim(), satirlar: [s], anahtarlar: new Map(), girdiler: new Map(), env: new Map(), govde: null })
    else if (liste.length) liste[liste.length - 1].satirlar.push(s)
  }
  for (const a of liste) {
    const sat = a.satirlar.filter((s) => !/^\s*#/.test(s))
    for (let i = 0; i < sat.length; i++) {
      const k = /^ {8}([A-Za-z0-9_-]+):\s?(.*)$/.exec(sat[i])
      if (!k) continue
      a.anahtarlar.set(k[1], k[2].trim())
      if (k[1] === 'with' || k[1] === 'env') {
        const hedef = k[1] === 'with' ? a.girdiler : a.env
        let son: string | null = null
        // girinti 10 = girdi anahtarı; girinti 12 = blok skaler (`path: |`) içeriği: değere `\n` ile eklenir
        for (let j = i + 1; j < sat.length && /^ {10}/.test(sat[j]); j++) {
          const e = /^ {10}([A-Za-z0-9_-]+):\s?(.*)$/.exec(sat[j])
          if (e) {
            son = e[1]
            hedef.set(son, e[2].trim())
          } else if (son !== null && /^ {12}\S/.test(sat[j])) hedef.set(son, `${hedef.get(son) ?? ''}\n${sat[j].trim()}`)
        }
      }
      if (k[1] === 'run') {
        if (/^\|[-+]?$/.test(k[2].trim())) {
          const g: string[] = []
          for (let j = i + 1; j < sat.length && (sat[j].trim() === '' || /^ {10}/.test(sat[j])); j++) g.push(sat[j].slice(10))
          a.govde = g.join('\n').replace(/\n+$/, '')
        } else a.govde = k[2].trim()
      }
    }
  }
  return liste
}

const AD = {
  sert: 'apt sertlestirmesi',
  pwCache: 'Playwright tarayici onbellegi',
  chromium: 'Install Playwright Chromium',
  baslat: 'Playwright sistem bagimliliklari (arka planda baslat)',
  build: 'Build (real Supabase env)',
  bekle: 'Playwright sistem bagimliliklari (bekle, en iyi caba)',
  prob: 'Tarayici gercekten aciliyor mu',
  font: 'Font preload olcumu (kapali kip, yalniz Inter)',
  smoke: 'Run smoke suite (admin + checkout)',
} as const

/** Bir apt/indirme sarmalayıcısının en kötü süresi (sn): `retry-bounded.sh` kemer aritmetiğiyle AYNI formül (INV-CI-INSTALL-1). */
const enKotu = (sinir: number, deneme: number): number => sinir * deneme + 10 * (deneme - 1)

const BASLAT_DESENI = /^bash scripts\/ci\/arka-plan\.sh baslat (\S+) -- bash scripts\/ci\/retry-bounded\.sh (\d+) (\d+) -- pnpm exec playwright install-deps chromium$/
const BEKLE_DESENI = /^bash scripts\/ci\/arka-plan\.sh bekle (\S+) (\d+)$/

/** e2e-smoke.yml kurulum sırası ve paralel apt denetimi. Boş dizi = uyumlu. */
function kurulumDenetle(e2e: string): string[] {
  const ihlal: string[] = []
  const ad = adimlar(e2e, 'admin-smoke')
  if (ad.length === 0) return ['`admin-smoke` işi ayrıştırılamadı']
  const idx = (hedef: string): number => ad.findIndex((a) => a.ad === hedef)
  const bul = (hedef: string): Adim | undefined => ad.find((a) => a.ad === hedef)
  for (const hedef of Object.values(AD)) {
    const adet = ad.filter((a) => a.ad === hedef).length
    if (adet !== 1) ihlal.push(`adım "${hedef}" TAM BİR tane olmalı (bulunan ${adet})`)
  }
  if (ihlal.length > 0) return ihlal

  const SIRA: Array<[keyof typeof AD, keyof typeof AD, string]> = [
    ['sert', 'baslat', 'apt sertleştirmesi paralel apt başlamadan ÖNCE koşmalı (apt zaman aşımı ayarı)'],
    ['pwCache', 'chromium', 'tarayıcı önbelleği Chromium kurulumundan ÖNCE geri yüklenmeli'],
    ['baslat', 'build', 'apt Build ile PARALEL başlamalı: Build\'ten ÖNCE başlatılmıyor (kazanç sıfır)'],
    ['chromium', 'build', 'Chromium indirmesi Build\'ten önce bitmeli'],
    ['build', 'bekle', '`bekle` Build\'ten SONRA gelmeli (paralellik yoksa kazanç yok)'],
    ['bekle', 'prob', 'tarayıcı probu `bekle`den SONRA koşmalı: apt bitmeden prob "eksik kütüphane" diye yanlış kırmızı verir ya da yarım kurulumla yeşil geçer'],
    ['prob', 'smoke', 'tarayıcı probu Playwright testinden ÖNCE koşmalı'],
    ['build', 'font', 'font ölçümü derlemeden SONRA koşmalı'],
    ['font', 'smoke', 'font ölçümü smoke koşusundan ÖNCE koşmalı'],
  ]
  for (const [once, sonra, mesaj] of SIRA) if (idx(AD[once]) >= idx(AD[sonra])) ihlal.push(`SIRA: ${mesaj}`)

  // (a) paralel apt: başlat
  const baslat = bul(AD.baslat) as Adim
  const bm = BASLAT_DESENI.exec(baslat.govde ?? '')
  let enKotuSn = 0
  let ortakAd = ''
  if (!bm) ihlal.push(`BAŞLAT: gövde beklenen biçimde değil (arka-plan.sh baslat <ad> -- retry-bounded.sh <sn> <deneme> -- ...install-deps chromium); bulunan ${JSON.stringify(baslat.govde)}`)
  else {
    ortakAd = bm[1]
    const sinir = Number(bm[2])
    const deneme = Number(bm[3])
    enKotuSn = enKotu(sinir, deneme)
    if (sinir > 90) ihlal.push(`BAŞLAT: deneme sınırı ${sinir} sn > 90: apt takılma kuyruğu kesilmemiş (ölçülen sağlıklı en uzun adım 52 sn; takılma kuyruğu 187-341 sn)`)
    if (deneme !== 2) ihlal.push(`BAŞLAT: deneme sayısı ${deneme}, beklenen 2 ("kısa zaman aşımı + tek yeniden deneme")`)
    const dk = Number(baslat.anahtarlar.get('timeout-minutes') ?? '0')
    if (dk * 60 <= enKotuSn) ihlal.push(`BAŞLAT: timeout-minutes ${dk} (${dk * 60} sn) sarmalayıcının en kötü süresinden (${enKotuSn} sn) KÜÇÜK (kemer aritmetiği)`)
  }
  if (baslat.env.get('RETRY_APT_TEMIZLE') !== "'1'") ihlal.push("BAŞLAT: env RETRY_APT_TEMIZLE: '1' yok (yarım apt listeleri ikinci denemeyi de zehirler)")

  // (b) paralel apt: bekle
  const bekle = bul(AD.bekle) as Adim
  const wm = BEKLE_DESENI.exec(bekle.govde ?? '')
  if (!wm) ihlal.push(`BEKLE: gövde beklenen biçimde değil (arka-plan.sh bekle <ad> <sn>); bulunan ${JSON.stringify(bekle.govde)}`)
  else {
    if (ortakAd && wm[1] !== ortakAd) ihlal.push(`BEKLE: ad "${wm[1]}" başlatılan adla ("${ortakAd}") AYNI değil: hiç başlatılmamış bir işi bekler`)
    const toplam = Number(wm[2])
    if (enKotuSn > 0 && toplam < enKotuSn) ihlal.push(`BEKLE: toplam bekleme ${toplam} sn < apt'nin en kötü süresi ${enKotuSn} sn: yasal ikinci deneme yarıda bırakılır`)
    if (toplam > 300) ihlal.push(`BEKLE: toplam bekleme ${toplam} sn > 300: takılma kuyruğu geri gelir`)
    const dk = Number(bekle.anahtarlar.get('timeout-minutes') ?? '0')
    if (enKotuSn > 0 && dk * 60 < toplam + enKotuSn) ihlal.push(`BEKLE: timeout-minutes ${dk} (${dk * 60} sn) < bekleme ${toplam} + yedek ön plan koşusu ${enKotuSn} sn`)
  }
  if (bekle.anahtarlar.get('continue-on-error') !== 'true') ihlal.push('BEKLE: `continue-on-error: true` yok: apt düştü diye iş kırmızı yanar (kapıyı prob verir)')
  if (bekle.env.get('RETRY_APT_TEMIZLE') !== "'1'") ihlal.push("BEKLE: env RETRY_APT_TEMIZLE: '1' yok (yedek ön plan koşusu başlatılan komutla aynı davranmaz)")

  // (c) gerçek kapı
  const prob = bul(AD.prob) as Adim
  if (prob.anahtarlar.has('continue-on-error')) ihlal.push('PROB: `continue-on-error` taşıyor: Chromium açılmasa da iş yeşil (SESSİZ YEŞİL)')
  if (!/chromium\.launch\(\)/.test(prob.govde ?? '') || !/process\.exit\(1\)/.test(prob.govde ?? '')) ihlal.push('PROB: gövde Chromium\'u gerçekten açmıyor ya da başarısızlıkta `process.exit(1)` yapmıyor')

  return ihlal
}

/** Adım bloğunu (adım başlığından sonraki adım başlığına kadar) `hedef` adımın ÖNÜNE taşır. */
function adimiTasi(metin: string, tasinan: string, onune: string): string {
  const sat = metin.split('\n')
  const bas = sat.findIndex((s) => s === `      - name: ${tasinan}`)
  let bit = sat.findIndex((s, i) => i > bas && /^ {6}- name:/.test(s))
  if (bit < 0) bit = sat.length
  const blok = sat.splice(bas, bit - bas)
  const hedef = sat.findIndex((s) => s === `      - name: ${onune}`)
  sat.splice(hedef, 0, ...blok)
  return sat.join('\n')
}

describe('INV-E2E-HIZLI-3 · paralel apt ve kapının yeri', () => {
  const e2e = oku('.github/workflows/e2e-smoke.yml')

  it('gerçek e2e-smoke.yml uyumlu (ölçüm yüzeyi dolu: iş adımları bulundu)', () => {
    expect(adimlar(e2e, 'admin-smoke').length).toBeGreaterThan(13)
    expect(kurulumDenetle(e2e)).toEqual([])
  })

  const BOZ: Array<{ ad: string; boz: (c: string) => string; beklenen: string }> = [
    {
      ad: 'apt sınırı eski 300 sn × 2\'ye döner (takılma kuyruğu geri gelir)',
      boz: (c) => c.replace('retry-bounded.sh 75 2 -- pnpm exec playwright install-deps', 'retry-bounded.sh 300 2 -- pnpm exec playwright install-deps'),
      beklenen: 'takılma kuyruğu kesilmemiş',
    },
    {
      ad: 'apt üç denemeye çıkar (tek yeniden deneme kuralı)',
      boz: (c) => c.replace('retry-bounded.sh 75 2 -- pnpm exec playwright install-deps', 'retry-bounded.sh 75 3 -- pnpm exec playwright install-deps'),
      beklenen: 'deneme sayısı 3, beklenen 2',
    },
    {
      ad: 'başlat adımı arka plan sarmalayıcısını atlar (apt sıralı, Build\'i bekletir)',
      boz: (c) => c.replace('run: bash scripts/ci/arka-plan.sh baslat pw-deps -- bash scripts/ci/retry-bounded.sh 75 2 -- pnpm exec playwright install-deps chromium', 'run: bash scripts/ci/retry-bounded.sh 75 2 -- pnpm exec playwright install-deps chromium'),
      beklenen: 'BAŞLAT: gövde beklenen biçimde değil',
    },
    {
      ad: 'başlat adımının timeout-minutes değeri sarmalayıcının en kötü süresinin altına iner',
      boz: (c) => c.replace('        timeout-minutes: 4\n        env:\n          RETRY_APT_TEMIZLE', '        timeout-minutes: 2\n        env:\n          RETRY_APT_TEMIZLE'),
      beklenen: 'kemer aritmetiği',
    },
    {
      ad: 'RETRY_APT_TEMIZLE başlat adımından düşer',
      boz: (c) => c.replace("        timeout-minutes: 4\n        env:\n          RETRY_APT_TEMIZLE: '1'\n", '        timeout-minutes: 4\n'),
      beklenen: "BAŞLAT: env RETRY_APT_TEMIZLE: '1' yok",
    },
    { ad: '`bekle` adımı silinir (apt sonucu hiç toplanmaz)', boz: (c) => c.replace(`      - name: ${AD.bekle}\n`, '      - name: Baska ad\n'), beklenen: `adım "${AD.bekle}" TAM BİR tane olmalı` },
    {
      ad: '`bekle` adımı probun SONRASINA taşınır (prob yarım kurulumu görür)',
      boz: (c) => adimiTasi(c, AD.bekle, AD.font),
      beklenen: 'SIRA: tarayıcı probu `bekle`den SONRA koşmalı',
    },
    {
      ad: '`bekle` adımı `continue-on-error`ını kaybeder (apt düşünce iş kırmızı)',
      boz: (c) => c.replace('        continue-on-error: true\n        timeout-minutes: 7\n', '        timeout-minutes: 7\n'),
      beklenen: 'BEKLE: `continue-on-error: true` yok',
    },
    {
      ad: '`bekle` toplam süresi apt\'nin en kötü süresinin altına iner',
      boz: (c) => c.replace('arka-plan.sh bekle pw-deps 240', 'arka-plan.sh bekle pw-deps 100'),
      beklenen: 'yasal ikinci deneme yarıda bırakılır',
    },
    {
      ad: '`bekle` başka bir adı bekler (hiç başlatılmamış iş)',
      boz: (c) => c.replace('arka-plan.sh bekle pw-deps 240', 'arka-plan.sh bekle pw-depz 240'),
      beklenen: 'hiç başlatılmamış bir işi bekler',
    },
    {
      ad: 'prob `continue-on-error: true` taşır (eksik kütüphanede SESSİZ YEŞİL)',
      boz: (c) => c.replace(`      - name: ${AD.prob}\n`, `      - name: ${AD.prob}\n        continue-on-error: true\n`),
      beklenen: 'SESSİZ YEŞİL',
    },
    {
      ad: 'prob başarısızlıkta çıkış kodu vermez (process.exit(1) kalkar)',
      boz: (c) => c.replace('              process.exit(1)\n', '              process.exit(0)\n'),
      beklenen: 'process.exit(1)',
    },
    {
      ad: 'prob silinir',
      boz: (c) => c.replace(`      - name: ${AD.prob}\n`, '      - name: Baska prob\n'),
      beklenen: `adım "${AD.prob}" TAM BİR tane olmalı`,
    },
    {
      ad: 'apt başlatma adımı Build\'ten SONRAYA taşınır (paralellik yok)',
      boz: (c) => adimiTasi(c, AD.baslat, AD.bekle),
      beklenen: 'Build\'ten ÖNCE başlatılmıyor',
    },
  ]
  it.each(BOZ)('⛔SABOTAJ e2e-smoke.yml: $ad', ({ boz, beklenen }) => {
    const bozuk = boz(e2e)
    expect(bozuk, 'bozucu hiçbir şeyi değiştirmedi (çapa kayıp)').not.toBe(e2e)
    expect(kurulumDenetle(bozuk).join(' | ')).toContain(beklenen)
  })
})
