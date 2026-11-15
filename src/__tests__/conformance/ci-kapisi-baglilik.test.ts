// @vitest-environment node
//
// Kapı bağlılığı saf dosya sistemi ölçümüdür; DOM ortamı yalnız maliyet ve kırılganlıktır.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-CI-KAPI-BAGLI-1 · `scripts/ci/*-kapisi.cjs` kapılarının HER BİRİ üç bağla bağlı olmalı (ALT-181).
 *
 * TETİK: scripts/ci/, .github/workflows/, src/__tests__/conformance/
 * YER: PR
 *
 * NİÇİN VAR (2026-11-15, ölçüldü)
 *
 * Bir kapı betiği yazmak kapıyı KURMAK değildir. Betik üç şeye bağlanmadıkça "var ama koşmuyor" olabilir ve hiçbir şey
 * kırmızı vermez (CLAUDE.md kural 14: tam iş; yeşil kapı kapının koştuğunun kanıtı değildir). Üç bağ:
 *
 *   (a) TEST    `scripts/ci/__tests__/` altında kapıyı ADIYLA içe alan/çağıran bir test vardır (mantığı sınayan).
 *   (b) HARİTA  O testin `scripts/ci/test-haritasi.json` içinde satırı vardır. Test seçici (`test-sec.cjs`) satırı olmayan
 *               testi "bilinmeyen" sayıp her zaman koşturur; yani güvenli ama ÖLÇÜLMEMİŞTİR ve haritanın "bu test neyi
 *               okuyor" bilgisi o test için yoktur. Yeni kapı testi haritaya girmeden birleşirse bunu kimse söylemez.
 *   (c) ÇALIŞMA Kapı CI'da gerçekten çağrılır: bir iş akışında `node scripts/ci/<ad>.cjs` komutuyla YA DA bir vitest testinde.
 *               İkisi de yoksa kapı sahipsizdir: betik durur, hiçbir kapı onu koşturmaz.
 *
 * BUGÜNKÜ ÖLÇÜM (ağaç origin/master fd9d074ce, 3 kapı): dagitim-hazir-kapisi üç bağda tam. defter-pr-kapisi ve
 * yonlendirme-kapisi testlerinin haritada satırı YOK (testler 2026-11-09 #2441 ve 2026-11-10 #2473'te eklendi).
 * yonlendirme-kapisi hiçbir iş akışında koşmuyor; yalnız kendi vitest testi koşturuyor (test gerçek tabloyu da denetler).
 * İki harita eksiği `BILINEN_EKSIK` listesinde adıyla ilan edilir; diğer her eksik KIRMIZIDIR.
 *
 * ── MANDAL (İKİ YÖNLÜ) ─────────────────────────────────────────────────────────
 * Listede olmayan eksik bağ → KIRMIZI (yeni borç sessizce girmez). Listede olup artık tam olan bağ → KIRMIZI ("ilan
 * bayat, satırı sil"): onarılan borç listede unutulursa liste yalan söyler. Liste yalnız KÜÇÜLEBİLİR: `BILINEN_EKSIK_TAVAN`
 * ilk ilandaki boyuttur; yeni bir kapı borçla doğarsa tavanı yükseltmek gerekir ve bu görünür bir diff'tir (kaçış kapağı
 * bilerek zahmetli; emsal: `scripts/test-karnesi/beyan-tabani.json`).
 *
 * ── ÖLÇÜM YÜZEYİ VE SINIRLAR ────────────────────────────────────────────────────
 * - Keşif dosya sisteminden: `scripts/ci/*-kapisi.cjs`. SABİT LİSTE YOK; yeni kapı kendiliğinden evrene girer.
 * - Satır taraması (`node:fs`, ayrıştırıcı bağımlılığı yok). YORUM SATIRLARI SAYILMAZ: ci.yml'de kapıyı anlatan yorum
 *   satırı vardır, bağ olan tek şey `run:` satırıdır. Yorumda anmak bağ değildir.
 * - (a) ve vitest kolundaki "anma" kanıtı: TIRNAKLI bir değişmezde `<ad>.cjs` (yol ön eki serbest, ad sınırı keskin:
 *   `eski-<ad>.cjs` sayılmaz). Dinamik kurulan yol (`'scripts/ci/' + ad`) görülmez; yolu düz yazın. Anma, çalıştırmanın
 *   kanıtı DEĞİLDİR; bu test kapının SAHİPSİZ KALMADIĞINI ölçer, çağrının doğruluğunu kapının kendi testi ölçer.
 * - (c) iş akışı kolu: yorumsuz bir satırda `node` ve `scripts/ci/<ad>.cjs` birlikte geçer. `package.json` betiği üzerinden
 *   dolaylı çağrı (`pnpm gate:x`) SAYILMAZ; böyle bir bağ doğarsa kural bilerek genişletilir, sessizce gevşemez.
 * - ⚠(c)'NİN VİTEST KOLU KAPININ KENDİ BİRİM TESTİNİ DE SAYAR (görev tanımı: "iş akışında YA DA bir vitest testinde"). Sonuç,
 *   2026-11-15'te ölçüldü: testi olan bir kapıda (c) fiilen (a)'dan türer; `dagitim-hazir.yml` içindeki `node` komutu yoruma
 *   çevrilince bu test YEŞİL KALDI (kapının kendi testi adını anıyor). İş akışı değişmezini kapıların kendi testleri ölçer
 *   (INV-DAGITIM-HAZIR-1, `ci-edited-ayna.test.ts`); bu dosya "sahipsiz kapı" sınıfını yakalar, "iş akışı koptu" sınıfını değil.
 *   Sıkılaştırma tek satırdır: `olc` içinde `vitestler` süzgecine `!testler.includes(t)` ekleyin; bedeli iş akışsız kapının
 *   `calisma` borcuna girmesidir (ölçüldü: tek yeni kırmızı `yonlendirme-kapisi :: calisma`; kapı yalnız kendi vitest testinde
 *   koşuyor ve o test gerçek tabloyu da denetliyor). Karar sahibi: ALTYAPI müdürü.
 * - (b) harita kolu: satırın VARLIĞI. Satırın tazeliği (sha) `node scripts/ci/test-haritasi-uret.cjs --kontrol`'ündür.
 * - Vitest kolunun evreni: `scripts/ci/test-haritasi-uret.cjs` KOD_KOKLERI ile aynı kökler. BU DOSYA evrenden DIŞLANIR
 *   (kendini taramaz): `BILINEN_EKSIK` kapı adlarını içerir, dışlanmazsa ilan edilen eksiğin kendisi "vitest testinde
 *   anılıyor" diye çalışma bağını sahte yeşile çevirirdi. Bu bir muafiyet değil: dosya başkalarını ölçer.
 *
 * ── SABOTAJ ─────────────────────────────────────────────────────────────────────
 * Karar fonksiyonu (`eksikBaglar`) saftır ve bağları eksik sahte girdilerle KIRMIZI verdiği aynı dosyada kanıtlanır; tespit
 * fonksiyonları sahte kaynaklarla; tüm hat (`olc`) geçici bir depo ağacıyla uçtan uca. Boş evrende (0 kapı, 0 harita satırı,
 * 0 iş akışı) yeşil ölçüm değildir: evren sağlığı kolu o durumda KIRMIZIDIR.
 */

const KOK = path.resolve(__dirname, '../../..')
const KENDI_YOLU = 'src/__tests__/conformance/ci-kapisi-baglilik.test.ts'

const KAPI_DIZINI = 'scripts/ci'
const KAPI_DESENI = /-kapisi\.cjs$/
const KAPI_TEST_DIZINI = 'scripts/ci/__tests__'
const HARITA_YOLU = 'scripts/ci/test-haritasi.json'
const IS_AKISI_DIZINI = '.github/workflows'
/** `scripts/ci/test-haritasi-uret.cjs` KOD_KOKLERI ile aynı: vitest'in test dosyası bulduğu kökler. */
const TEST_KOKLERI = ['src', 'scripts', 'supabase/functions', 'tools', 'tests', 'e2e'] as const
const TEST_DOSYASI = /\.test\.[cm]?[jt]sx?$/
const ATLANAN_DIZINLER = new Set(['node_modules', '.git', '.next', 'dist', 'coverage'])

/** Dedektör sağlığı tabanları (bugün: 845 harita satırı, 30 iş akışı, ~1000 test dosyası). Çöküşü yakalar, tabana yaslanmaz. */
const TABAN_HARITA_SATIRI = 100
const TABAN_IS_AKISI = 5
const TABAN_TEST_DOSYASI = 100

type Bag = 'test' | 'harita' | 'calisma'

interface Eksik {
  kapi: string
  bag: Bag
}

interface BilinenEksik extends Eksik {
  gerekce: string
  kart: 'ALT-181'
}

interface KapiKaniti {
  /** `scripts/ci/<ad>-kapisi.cjs` */
  kapi: string
  /** (a) `scripts/ci/__tests__/` altında kapıyı adıyla anan testler. */
  testler: string[]
  /** (b) yukarıdakilerden `test-haritasi.json` içinde satırı OLMAYANLAR. */
  haritasizTestler: string[]
  /** (c) kapıyı yorumsuz `node` satırıyla çağıran iş akışları. */
  isAkislari: string[]
  /** (c) kapıyı anan vitest testleri (bu dosya hariç). */
  vitestler: string[]
}

interface Olcum {
  kapilar: KapiKaniti[]
  haritaSatiri: number
  isAkisiDosyasi: number
  testDosyasi: number
}

/**
 * İLAN EDİLMİŞ EKSİKLER. Her satır: kapı + eksik bağ + gerekçe + kart. Liste yalnız KÜÇÜLEBİLİR (bkz. mandal).
 * Satırı silmek için bağı kurun; bağ kurulunca "ilan bayat" kolu zaten kırmızı verir.
 */
const BILINEN_EKSIK: readonly BilinenEksik[] = [
  {
    kapi: 'scripts/ci/defter-pr-kapisi.cjs',
    bag: 'harita',
    gerekce:
      'Testi defter-pr-kapisi.test.ts 2026-11-09 (#2441) eklendi; test-haritasi.json satırı henüz ölçülmedi. Harita ortak dosya: ALT-184 tazeler, satır belirince bu ilan silinir.',
    kart: 'ALT-181',
  },
  {
    kapi: 'scripts/ci/yonlendirme-kapisi.cjs',
    bag: 'harita',
    gerekce:
      'Testi yonlendirme-kapisi.test.ts 2026-11-10 (#2473) eklendi; test-haritasi.json satırı henüz ölçülmedi. Harita ortak dosya: ALT-184 tazeler, satır belirince bu ilan silinir.',
    kart: 'ALT-181',
  },
]
/** Liste yalnız küçülür: yeni borç ilanı bu sayıyı yükseltmeyi gerektirir (görünür diff). */
const BILINEN_EKSIK_TAVAN = 2

// ─────────────────────────────────────────────────────────────────────────────
// Saf kısım: tespit ve karar
// ─────────────────────────────────────────────────────────────────────────────

function posix(yol: string): string {
  return yol.split(path.sep).join('/')
}

function kayitMi(deger: unknown): deger is Record<string, unknown> {
  return typeof deger === 'object' && deger !== null && !Array.isArray(deger)
}

function kacis(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Yorum satırlarını ve satır sonu yorumunu atar: gerekçe metni "bağ" gibi görünmesin. */
function kodSatirlari(metin: string, tur: 'js' | 'yaml'): string[] {
  const yorumBasi = tur === 'js' ? /^\s*(?:\/\/|\/\*|\*)/ : /^\s*#/
  const sonYorum = tur === 'js' ? /\s\/\/.*$/ : /\s#.*$/
  return metin
    .split(/\r?\n/)
    .filter((satir) => !yorumBasi.test(satir))
    .map((satir) => satir.replace(sonYorum, ''))
}

/** Tırnaklı bir değişmezde `<kapiAdi>` (örn. `defter-pr-kapisi.cjs`) var mı. Ad sınırı keskin: ön ek yalnız yol/boşlukla biter. */
function kapiAnarMi(satirlar: readonly string[], kapiAdi: string): boolean {
  const desen = new RegExp(`['"\`](?:[^'"\`\\n]*[/\\s])?${kacis(kapiAdi)}(?=[\\s'"\`])`)
  return satirlar.some((satir) => desen.test(satir))
}

/** Yorumsuz bir satırda `node` ve kapının tam yolu birlikte geçiyor mu (`run:` tek satır ya da `run: |` bloğu). */
function isAkisiCagirirMi(satirlar: readonly string[], kapiYolu: string): boolean {
  const desen = new RegExp(`(?:^|[\\s'"])(?:\\./)?${kacis(kapiYolu)}(?=$|[\\s'"])`)
  return satirlar.some((satir) => /\bnode\b/.test(satir) && desen.test(satir))
}

/** SAF KARAR: bir kapının bağ kanıtından hangi bağları eksik. Test yokken harita satırı da olamaz (boş küme "hepsi tam" değildir). */
function eksikBaglar(k: KapiKaniti): Bag[] {
  const eksik: Bag[] = []
  if (k.testler.length === 0) eksik.push('test')
  if (k.testler.length === 0 || k.haritasizTestler.length > 0) eksik.push('harita')
  if (k.isAkislari.length === 0 && k.vitestler.length === 0) eksik.push('calisma')
  return eksik
}

function anahtar(e: Eksik): string {
  return `${e.kapi} :: ${e.bag}`
}

/** İKİ YÖNLÜ MANDAL: yeni = ölçülüp ilan edilmemiş, bayat = ilan edilip ölçülmeyen. */
function mandal(olculen: readonly Eksik[], ilan: readonly Eksik[]): { yeni: Eksik[]; bayat: Eksik[] } {
  const ilanAnahtarlari = new Set(ilan.map(anahtar))
  const olculenAnahtarlari = new Set(olculen.map(anahtar))
  return {
    yeni: olculen.filter((e) => !ilanAnahtarlari.has(anahtar(e))),
    bayat: ilan.filter((e) => !olculenAnahtarlari.has(anahtar(e))),
  }
}

/** Boş evren yeşil ölçüm değildir: dedektörün baktığı dört küme de dolu olmalı. */
function evrenSorunlari(o: Olcum): string[] {
  const sorunlar: string[] = []
  if (o.kapilar.length === 0) sorunlar.push(`${KAPI_DIZINI}/*-kapisi.cjs altında hiç kapı bulunamadı (boş evren)`)
  if (o.haritaSatiri < TABAN_HARITA_SATIRI) sorunlar.push(`${HARITA_YOLU} testler satırı ${o.haritaSatiri} < ${TABAN_HARITA_SATIRI} (harita okunamadı mı?)`)
  if (o.isAkisiDosyasi < TABAN_IS_AKISI) sorunlar.push(`${IS_AKISI_DIZINI} altında ${o.isAkisiDosyasi} iş akışı < ${TABAN_IS_AKISI}`)
  if (o.testDosyasi < TABAN_TEST_DOSYASI) sorunlar.push(`${o.testDosyasi} test dosyası < ${TABAN_TEST_DOSYASI} (vitest evreni boş mu?)`)
  return sorunlar
}

function aciklama(e: Eksik, kanit: KapiKaniti | undefined): string {
  const ad = path.posix.basename(e.kapi)
  switch (e.bag) {
    case 'test':
      return `${e.kapi}: TEST bağı eksik. ${KAPI_TEST_DIZINI}/ altında kapıyı adıyla (${ad}) içe alan/çağıran test yok.`
    case 'harita': {
      const satirsiz = kanit?.haritasizTestler ?? []
      const detay =
        satirsiz.length > 0
          ? `${HARITA_YOLU} içinde satırı olmayan test: ${satirsiz.join(', ')}`
          : `kapının testi yok, dolayısıyla ${HARITA_YOLU} satırı da olamaz`
      return `${e.kapi}: HARİTA bağı eksik. ${detay}.`
    }
    case 'calisma':
      return `${e.kapi}: ÇALIŞMA bağı eksik. ${IS_AKISI_DIZINI}/ altında yorumsuz bir \`node ${e.kapi}\` satırı da, kapıyı anan bir vitest testi de yok (sahipsiz kapı).`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ölçüm: dosya sisteminden kanıt toplar (kök parametre: geçici ağaçla sabotaj mümkün)
// ─────────────────────────────────────────────────────────────────────────────

function dosyalariTara(kok: string, altDizin: string, uygun: (yol: string) => boolean): string[] {
  const bas = path.join(kok, altDizin)
  if (!existsSync(bas)) return []
  const bulunan: string[] = []
  const yuru = (dizin: string): void => {
    for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
      const tam = path.join(dizin, girdi.name)
      if (girdi.isDirectory()) {
        if (!ATLANAN_DIZINLER.has(girdi.name)) yuru(tam)
      } else if (girdi.isFile()) {
        const goreli = posix(path.relative(kok, tam))
        if (uygun(goreli)) bulunan.push(goreli)
      }
    }
  }
  yuru(bas)
  return bulunan.sort()
}

function kapiDosyalari(kok: string): string[] {
  const dizin = path.join(kok, KAPI_DIZINI)
  if (!existsSync(dizin)) return []
  return readdirSync(dizin, { withFileTypes: true })
    .filter((girdi) => girdi.isFile() && KAPI_DESENI.test(girdi.name))
    .map((girdi) => `${KAPI_DIZINI}/${girdi.name}`)
    .sort()
}

/** `test-haritasi.json` `testler` anahtarları. Bozuk JSON FIRLATIR (sessizce boş harita "hepsi eksik" ile karışmasın). */
function haritaSatirlari(kok: string): Set<string> {
  const yol = path.join(kok, HARITA_YOLU)
  if (!existsSync(yol)) return new Set()
  const ham: unknown = JSON.parse(readFileSync(yol, 'utf8'))
  if (!kayitMi(ham) || !kayitMi(ham.testler)) return new Set()
  return new Set(Object.keys(ham.testler))
}

function olc(kok: string, haricTutulan: string): Olcum {
  const onbellek = new Map<string, string[]>()
  const satirlar = (yol: string, tur: 'js' | 'yaml'): string[] => {
    const onceki = onbellek.get(yol)
    if (onceki) return onceki
    const okunan = kodSatirlari(readFileSync(path.join(kok, yol), 'utf8'), tur)
    onbellek.set(yol, okunan)
    return okunan
  }

  const harita = haritaSatirlari(kok)
  const kapiTestleri = dosyalariTara(kok, KAPI_TEST_DIZINI, (yol) => TEST_DOSYASI.test(yol))
  const tumTestler = TEST_KOKLERI.flatMap((koku) => dosyalariTara(kok, koku, (yol) => TEST_DOSYASI.test(yol)))
  const isAkislari = dosyalariTara(kok, IS_AKISI_DIZINI, (yol) => /\.ya?ml$/.test(yol))

  const kapilar = kapiDosyalari(kok).map((kapi): KapiKaniti => {
    const kapiAdi = path.posix.basename(kapi)
    const testler = kapiTestleri.filter((t) => kapiAnarMi(satirlar(t, 'js'), kapiAdi))
    return {
      kapi,
      testler,
      haritasizTestler: testler.filter((t) => !harita.has(t)),
      isAkislari: isAkislari.filter((w) => isAkisiCagirirMi(satirlar(w, 'yaml'), kapi)),
      vitestler: tumTestler.filter((t) => t !== haricTutulan && kapiAnarMi(satirlar(t, 'js'), kapiAdi)),
    }
  })

  return { kapilar, haritaSatiri: harita.size, isAkisiDosyasi: isAkislari.length, testDosyasi: tumTestler.length }
}

function olculenEksikler(o: Olcum): Eksik[] {
  return o.kapilar.flatMap((k) => eksikBaglar(k).map((bag): Eksik => ({ kapi: k.kapi, bag })))
}

// ─────────────────────────────────────────────────────────────────────────────
// Gerçek depo üzerinde ölçüm
// ─────────────────────────────────────────────────────────────────────────────

const gercek = olc(KOK, KENDI_YOLU)
const gercekEksik = olculenEksikler(gercek)
const gercekMandal = mandal(gercekEksik, BILINEN_EKSIK)
const kanitlar = new Map(gercek.kapilar.map((k) => [k.kapi, k]))

describe('INV-CI-KAPI-BAGLI-1 · evren sağlığı (boş evren yeşil ölçüm değildir)', () => {
  it('kapı, harita satırı, iş akışı ve test dosyası kümelerinin dördü de dolu', () => {
    expect(evrenSorunlari(gercek)).toEqual([])
  })
  it('kendini taramaz: bu dosya hiçbir kapının vitest kanıtı olarak sayılmaz', () => {
    for (const k of gercek.kapilar) expect(k.vitestler).not.toContain(KENDI_YOLU)
  })
})

describe('INV-CI-KAPI-BAGLI-1 · her kapı üç bağla bağlı (test · harita · çalışma)', () => {
  it('ilan edilmemiş eksik bağ YOK (yeni borç sessizce girmez)', () => {
    const mesajlar = gercekMandal.yeni.map((e) => aciklama(e, kanitlar.get(e.kapi)))
    expect(
      mesajlar,
      'Eksik bağı kurun (test yazın / test-haritasi satırını ölçtürün / kapıyı iş akışına bağlayın). Borç ise BILINEN_EKSIK satırı kapı + bağ + gerekçe + ALT-181 ile ilan edilir.',
    ).toEqual([])
  })
  it('ilan bayat DEĞİL: listedeki her eksik bugün gerçekten eksik (onarılanın satırı silinir)', () => {
    const mesajlar = gercekMandal.bayat.map((e) => `${anahtar(e)} artık eksik değil (ya da kapı yok): BILINEN_EKSIK satırını silin.`)
    expect(mesajlar).toEqual([])
  })
})

describe('INV-CI-KAPI-BAGLI-1 · ilan listesi biçimi ve mandalı', () => {
  it('her satır: scripts/ci kapı yolu, bilinen bağ, dolu gerekçe, kart ALT-181, tekrar yok', () => {
    const goruldu = new Set<string>()
    for (const satir of BILINEN_EKSIK) {
      expect(satir.kapi, 'kapı yolu').toMatch(/^scripts\/ci\/[a-z0-9-]+-kapisi\.cjs$/)
      expect(['test', 'harita', 'calisma'], 'bag').toContain(satir.bag)
      expect(satir.gerekce.length, `gerekçe kısa: ${anahtar(satir)}`).toBeGreaterThanOrEqual(40)
      expect(satir.kart).toBe('ALT-181')
      expect(goruldu.has(anahtar(satir)), `tekrarlı ilan: ${anahtar(satir)}`).toBe(false)
      goruldu.add(anahtar(satir))
    }
  })
  it('liste yalnız küçülebilir: boyut tavanı aşılmamış', () => {
    expect(BILINEN_EKSIK.length).toBeLessThanOrEqual(BILINEN_EKSIK_TAVAN)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SABOTAJ: kararın ve dedektörlerin gerçekten ayırt ettiğini kanıtlar
// ─────────────────────────────────────────────────────────────────────────────

const SAHTE = 'scripts/ci/sahte-kapisi.cjs'
const SAHTE_TEST = 'scripts/ci/__tests__/sahte-kapisi.test.ts'

function kanit(parca: Partial<KapiKaniti>): KapiKaniti {
  return { kapi: SAHTE, testler: [], haritasizTestler: [], isAkislari: [], vitestler: [], ...parca }
}

describe('INV-CI-KAPI-BAGLI-1 · SABOTAJ · saf karar (bağı eksik sahte girdi KIRMIZI verir)', () => {
  const durumlar: Array<[string, KapiKaniti, Bag[]]> = [
    ['hiçbir bağı yok: üçü de eksik', kanit({}), ['test', 'harita', 'calisma']],
    ['test yok ama iş akışı var: test ve harita eksik (boş küme "satır tam" sayılmaz)', kanit({ isAkislari: ['.github/workflows/x.yml'] }), ['test', 'harita']],
    ['test var, harita satırı yok, iş akışı var: yalnız harita', kanit({ testler: [SAHTE_TEST], haritasizTestler: [SAHTE_TEST], isAkislari: ['.github/workflows/x.yml'] }), ['harita']],
    ['test + harita var, ne iş akışı ne vitest: yalnız çalışma', kanit({ testler: [SAHTE_TEST] }), ['calisma']],
    ['test + harita + yalnız vitest anması: tam (vitest yolu geçerli)', kanit({ testler: [SAHTE_TEST], vitestler: [SAHTE_TEST] }), []],
    ['test + harita + yalnız iş akışı: tam (iş akışı yolu geçerli)', kanit({ testler: [SAHTE_TEST], isAkislari: ['.github/workflows/x.yml'] }), []],
    ['iki testten biri haritasız: harita eksik (hepsinin satırı olmalı)', kanit({ testler: [SAHTE_TEST, 'scripts/ci/__tests__/b.test.ts'], haritasizTestler: ['scripts/ci/__tests__/b.test.ts'], vitestler: [SAHTE_TEST] }), ['harita']],
  ]
  it.each(durumlar)('%s', (_ad, girdi, beklenen) => {
    expect(eksikBaglar(girdi)).toEqual(beklenen)
  })
})

describe('INV-CI-KAPI-BAGLI-1 · SABOTAJ · tespit (yorum, ad çakışması ve sahte anma sayılmaz)', () => {
  const js = (kaynak: string): string[] => kodSatirlari(kaynak, 'js')
  const yaml = (kaynak: string): string[] => kodSatirlari(kaynak, 'yaml')

  it('test: tırnaklı değişmez sayılır; yorum, açıklama ve ad çakışması sayılmaz', () => {
    expect(kapiAnarMi(js("const k = require('../sahte-kapisi.cjs')"), 'sahte-kapisi.cjs')).toBe(true)
    expect(kapiAnarMi(js("const KAPI = path.join(KOK, 'scripts/ci/sahte-kapisi.cjs')"), 'sahte-kapisi.cjs')).toBe(true)
    expect(kapiAnarMi(js("run('node scripts/ci/sahte-kapisi.cjs --kip uyari')"), 'sahte-kapisi.cjs')).toBe(true)
    expect(kapiAnarMi(js("// const k = require('../sahte-kapisi.cjs')"), 'sahte-kapisi.cjs'), 'satır yorumu').toBe(false)
    expect(kapiAnarMi(js(" * 'scripts/ci/sahte-kapisi.cjs' kapısı"), 'sahte-kapisi.cjs'), 'blok yorum satırı').toBe(false)
    expect(kapiAnarMi(js("const x = 1 // 'scripts/ci/sahte-kapisi.cjs'"), 'sahte-kapisi.cjs'), 'satır sonu yorumu').toBe(false)
    expect(kapiAnarMi(js("const k = require('../eski-sahte-kapisi.cjs')"), 'sahte-kapisi.cjs'), 'ad çakışması').toBe(false)
    expect(kapiAnarMi(js("describe('kapı (scripts/ci/sahte-kapisi.cjs, ALT-1)', () => {})"), 'sahte-kapisi.cjs'), 'başlık metni').toBe(false)
    expect(kapiAnarMi(js('const x = 1'), 'sahte-kapisi.cjs')).toBe(false)
  })

  it('iş akışı: yorumsuz `node` satırı sayılır; yorum, paths süzgeci ve başka yol sayılmaz', () => {
    const yol = 'scripts/ci/sahte-kapisi.cjs'
    expect(isAkisiCagirirMi(yaml('        run: node scripts/ci/sahte-kapisi.cjs'), yol)).toBe(true)
    expect(isAkisiCagirirMi(yaml('        run: node ./scripts/ci/sahte-kapisi.cjs'), yol)).toBe(true)
    expect(isAkisiCagirirMi(yaml('        run: |\n          node scripts/ci/sahte-kapisi.cjs --a'), yol), 'run: | bloğu').toBe(true)
    expect(isAkisiCagirirMi(yaml('        run: node scripts/ci/sahte-kapisi.cjs # açıklama'), yol), 'satır sonu yorumlu').toBe(true)
    expect(isAkisiCagirirMi(yaml('      # Mantık ve test: node scripts/ci/sahte-kapisi.cjs (saf modül)'), yol), 'yorum satırı').toBe(false)
    expect(isAkisiCagirirMi(yaml("        run: echo ok # node scripts/ci/sahte-kapisi.cjs"), yol), 'satır sonu yorumunda').toBe(false)
    expect(isAkisiCagirirMi(yaml("      paths:\n        - 'scripts/ci/sahte-kapisi.cjs'"), yol), 'paths süzgeci komut değildir').toBe(false)
    expect(isAkisiCagirirMi(yaml('        run: node scripts/board/sahte-kapisi.cjs'), yol), 'başka dizin').toBe(false)
    expect(isAkisiCagirirMi(yaml('        run: node scripts/ci/eski-sahte-kapisi.cjs'), yol), 'ad çakışması').toBe(false)
  })
})

describe('INV-CI-KAPI-BAGLI-1 · SABOTAJ · mandal ve evren sağlığı', () => {
  const a: Eksik = { kapi: 'scripts/ci/a-kapisi.cjs', bag: 'harita' }
  const b: Eksik = { kapi: 'scripts/ci/b-kapisi.cjs', bag: 'calisma' }

  it('ilan edilmemiş eksik YENİ sayılır; ilan edilip ölçülmeyen BAYAT sayılır; eşit küme temiz', () => {
    expect(mandal([a, b], [a])).toEqual({ yeni: [b], bayat: [] })
    expect(mandal([a], [a, b])).toEqual({ yeni: [], bayat: [b] })
    expect(mandal([a, b], [a, b])).toEqual({ yeni: [], bayat: [] })
    expect(mandal([], [])).toEqual({ yeni: [], bayat: [] })
  })
  it('aynı kapının başka bağı ilan edilmiş olması bu bağı örtmez', () => {
    const baska: Eksik = { kapi: a.kapi, bag: 'test' }
    expect(mandal([a], [baska])).toEqual({ yeni: [a], bayat: [baska] })
  })
  it('boş evren KIRMIZI: 0 kapı, 0 harita satırı, 0 iş akışı, 0 test', () => {
    const bos: Olcum = { kapilar: [], haritaSatiri: 0, isAkisiDosyasi: 0, testDosyasi: 0 }
    expect(evrenSorunlari(bos)).toHaveLength(4)
    expect(evrenSorunlari({ ...gercek, kapilar: [] })).toHaveLength(1)
  })
})

describe('INV-CI-KAPI-BAGLI-1 · SABOTAJ · tüm hat geçici depo ağacında (keşif + kanıt + karar)', () => {
  const gecici: string[] = []
  afterAll(() => gecici.forEach((d) => rmSync(d, { recursive: true, force: true })))

  function agac(dosyalar: Record<string, string>): string {
    const kok = mkdtempSync(path.join(os.tmpdir(), 'ci-kapi-bagli-'))
    gecici.push(kok)
    for (const [yol, icerik] of Object.entries(dosyalar)) {
      const hedef = path.join(kok, yol)
      mkdirSync(path.dirname(hedef), { recursive: true })
      writeFileSync(hedef, icerik)
    }
    return kok
  }
  const harita = (...testler: string[]): string =>
    JSON.stringify({ testler: Object.fromEntries(testler.map((t): [string, object] => [t, {}])) })
  const TEST_ICERIK = "const k = require('../sahte-kapisi.cjs')\n"
  const IS_AKISI = 'jobs:\n  a:\n    steps:\n      - run: node scripts/ci/sahte-kapisi.cjs\n'
  const bagsiz = { [SAHTE]: '// kapı\n' }

  it('bağsız kapı: üç bağ da eksik', () => {
    const o = olc(agac({ ...bagsiz, [HARITA_YOLU]: harita() }), KENDI_YOLU)
    expect(o.kapilar.map((k) => k.kapi)).toEqual([SAHTE])
    expect(olculenEksikler(o).map((e) => e.bag)).toEqual(['test', 'harita', 'calisma'])
  })
  it('üç bağı tam kapı: eksik yok', () => {
    const o = olc(
      agac({ ...bagsiz, [SAHTE_TEST]: TEST_ICERIK, [HARITA_YOLU]: harita(SAHTE_TEST), '.github/workflows/a.yml': IS_AKISI }),
      KENDI_YOLU,
    )
    expect(olculenEksikler(o)).toEqual([])
  })
  it('harita satırı silinirse yalnız harita; iş akışı komutu yoruma çevrilirse test vitest kolundan çalışma bağını korur', () => {
    const dosyalar = { ...bagsiz, [SAHTE_TEST]: TEST_ICERIK, '.github/workflows/a.yml': IS_AKISI }
    expect(olculenEksikler(olc(agac({ ...dosyalar, [HARITA_YOLU]: harita() }), KENDI_YOLU)).map((e) => e.bag)).toEqual(['harita'])
    // Aynı kapıyı bu kez yalnız ESKİ ADLI bir testle ve yorumlanmış iş akışıyla bağla: üç bağ da kopar.
    const kopuk = agac({
      ...bagsiz,
      'scripts/ci/__tests__/eski.test.ts': "const k = require('../eski-sahte-kapisi.cjs')\n",
      '.github/workflows/a.yml': '# node scripts/ci/sahte-kapisi.cjs\njobs: {}\n',
      [HARITA_YOLU]: harita('scripts/ci/__tests__/eski.test.ts'),
    })
    expect(olculenEksikler(olc(kopuk, KENDI_YOLU)).map((e) => e.bag)).toEqual(['test', 'harita', 'calisma'])
  })
  it('dışlanan dosya (bu testin kendisi) çalışma bağı sayılmaz', () => {
    const dosyalar = { ...bagsiz, [KENDI_YOLU]: TEST_ICERIK, [HARITA_YOLU]: harita() }
    expect(olculenEksikler(olc(agac(dosyalar), KENDI_YOLU)).map((e) => e.bag)).toEqual(['test', 'harita', 'calisma'])
    expect(olculenEksikler(olc(agac(dosyalar), 'baska/yol.test.ts')).map((e) => e.bag)).toEqual(['test', 'harita'])
  })
  it('kapısız ağaç: kapı listesi boş, evren sağlığı kırmızı', () => {
    const o = olc(agac({ [HARITA_YOLU]: harita() }), KENDI_YOLU)
    expect(o.kapilar).toEqual([])
    expect(evrenSorunlari(o).length).toBeGreaterThan(0)
  })
})
