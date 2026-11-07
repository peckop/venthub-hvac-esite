// @vitest-environment node
//
// Saf Node birim testi: DOM ortamı yalnız maliyet. Ağ, gerçek `git` ve gerçek ev dizini YOK; yalnız komut satırı testi geçici
// dizinde (modülün kopyasıyla) alt süreç koşar ve o süreçte `git` BİLEREK bulunamaz (PATH boş dizin).
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-TEST-KOSU-1 (ALT-38a bulgu B3) · dünya durumu DIŞLAMA LİSTESİNİN GÜVEN SINIRI (scripts/ci/dunya-durumu.cjs).
 *
 * Tek değişmez: bir PR bir testi PR kapısından KENDİ ELİYLE çıkaramaz. `dislan` kipinde dışarıda kalan küme "PR listesi ∩ TABAN listesi"dir
 * (taban = base dalının, yani master'ın zaten incelenmiş listesi); liste geçersizse `dislan` ve `yalniz` FIRLATIR; mekanizmanın kendi
 * koruyucu testleri (DISLANAMAZ) hiçbir listede yer alamaz. Bozulan her halka, bir PR'ın kendi kırmızı testini (ve kapıyı koruyan testi)
 * listeye yazıp `ci`'ı yeşile çevirmesi demektir ve HİÇBİR KIRMIZI GÖRÜNMEZ. Bu dosya halkaları TEK TEK ölçer:
 *   1. SÖZLEŞME YÜZEYİ: dışa açılan adlar, sabitler (kip adı, taban ortam adı, liste yolu) literal sınanır,
 *   2. DISLANAMAZ: yedi kayıt TAM liste; her biri diskte VAR; her biri `dogrula` ve `ayar` (dislan, yalniz) tarafından reddedilir;
 *      takma yazımlar (`./x`, `a//x`, `a/./x`, `a/../x`, `a\x`) vitest'te AYNI dosyayı dışlar (ölçüldü) ve aynı sertlikle reddedilir,
 *   3. TAM KİP: liste HİÇ okunmaz, doğrulanmaz, taban sorulmaz, git çağrılmaz (patlayan liste / patlayan okuma ile kanıtlanır),
 *   4. GEÇERSİZ KİP önce gelir, GEÇERSİZ LİSTE `dislan` ve `yalniz`'da FIRLATIR (mesaj biçimi, 5 hata sınırı, enjeksiyonun iletilmesi),
 *   5. YALNIZ KİP: eskisi gibi liste = include, taban sorulmaz,
 *   6. DISLAN KESİŞİM: taban ∩ PR (PR'ın yeni kaydı, silinmiş kayıt, boş taban, sıra), taban okunamazsa HİÇBİR ŞEY dışlanmaz + uyarı,
 *   7. TABAN OKUMA: `git show HEAD^1:<liste>` argümanları TAM eşitlik (kabuk yok), ortam yolu önceliği, her başarısızlık null, şekil denetimi,
 *   8. KOMUT SATIRI: gerçek alt süreç, geçici dizin, `git` yok,
 *   9. YOL SÜZGECİ (ALT-38i): süzgeçli kayıt PR kapısından YALNIZ PR'ın değişen dosyalarından hiçbiri süzgece uymuyorsa çıkar. Süzgeç TABANDAN okunur
 *      (PR kendi kaydıyla genişletemez), değişen dosyalar ya da tabandaki süzgeç okunamazsa test DIŞLANMAZ, `yalniz` kipinde süzgeç YOK, dizin öneki sınırı
 *      (`a/b/` → `a/bc` uymaz), `git diff` argümanları ve hata yolları literal sınanır; SABOTAJ kolları süzgeç mantığını kaynakta bozup testin kırmızı verdiğini ölçer.
 *  10. KAPALI KAYIT ŞEKLİ (bağımsız denetim Ö1b): `KAYIT_ALANLARI` literal sabittir, bilinmeyen alan (`yolFiltre` gibi yazım hatası) `dogrula`da hata verir;
 *      git'ten BOŞ gelen değişen dosya listesi okunamamış sayılır (D1, fail-closed) ama ortam dosyasında boş dosya "değişiklik yok"tur;
 *      `ozetSatiri` (Ö4) yalnız `dislan`da `dışlanan=N tutulan=M değişen=K` üretir.
 * Dış dünya HER ZAMAN sahtedir: `fs.readFileSync` ve `child_process.execFileSync` atamayla sahtelenir, test bitince geri konur (gerçek
 * `git` hiç çalışmaz). Gerçek vitest.config.ts yüklemesi (üç kip + boş taban + okunamayan taban) src/__tests__/conformance/test-kosu-kapsami.test.ts
 * içinde ölçülür.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL_YOLU = path.join(KOK, 'scripts/ci/dunya-durumu.cjs')

interface Kayit {
  test: string
  neden: string
  kanit: string
  yeniYer: string[]
  /** ALT-38i: isteğe bağlı yol süzgeci; geçersiz biçimleri de sınamak için bilerek `unknown`. */
  yolFiltresi?: unknown
}
interface Liste {
  surum: number
  testler: Kayit[]
}
interface Ayar {
  kip: string
  exclude: string[]
  include: string[] | null
  uyari?: string
  suzgeceTakilan?: string[]
}
type Env = Record<string, string | undefined>
type ExecFn = (komut: string, args: string[], secenek: unknown) => unknown
type DosyaVarMi = (yol: string, dizinMi?: boolean) => boolean
interface Secenek {
  tabanOku?: () => unknown
  dosyaVarMi?: DosyaVarMi
  degisenOku?: () => unknown
}
interface Modul {
  KOK: string
  LISTE_YOLU: string
  ORTAM_ADI: string
  TABAN_LISTE_ORTAM: string
  DEGISEN_ORTAM: string
  KIPLER: string[]
  YENI_YERLER: string[]
  KAYIT_ALANLARI: readonly string[]
  TEST_DESENI: RegExp
  DISLANAMAZ: readonly string[]
  ayar: (env?: Env, liste?: unknown, secenek?: Secenek) => Ayar
  dogrula: (liste: unknown, dosyaVarMi?: DosyaVarMi) => string[]
  listeyiOku: (kok?: string) => Liste
  tabanListesiniOku: (env?: Env, kok?: string, execFn?: ExecFn) => Liste | null
  degisenYollariniOku: (env?: Env, kok?: string, execFn?: ExecFn) => string[] | null
  filtreEslesirMi: (filtre: readonly string[], yol: string) => boolean
  ozetSatiri: (env: Env, sonuc: unknown, degisenOku?: () => unknown) => string | null
}
const D = require_(MODUL_YOLU) as Modul
/** Sahteleme yüzeyleri: modül bu işlevleri çağrı ANINDA nesneden okur, o yüzden atama yeter (edited-ayna.test.ts ile aynı desen). */
const fsYuzeyi = require_('node:fs') as { readFileSync: unknown }
const cpYuzeyi = require_('node:child_process') as { execFileSync: unknown }

const KIP = 'VENTHUB_DUNYA_DURUMU'
const TABAN_ENV = 'VENTHUB_DUNYA_TABAN_LISTESI'
const DEGISEN_ENV = 'VENTHUB_DUNYA_DEGISEN_DOSYALAR'
const LISTE_YOLU = 'scripts/ci/dunya-durumu-testleri.json'
const GIT_ARGS = ['show', `HEAD^1:${LISTE_YOLU}`]
const gitSecenek = (kok: string) => ({ cwd: kok, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1048576, timeout: 10000 })
/** `git diff` argümanları ve seçenekleri literal: `-z` (NUL ayraç), `--no-renames` (eski ad da görünsün), kabuk YOK, ilk ebeveyne göre. */
const GIT_DEGISEN_ARGS = ['diff', '--name-only', '-z', '--no-renames', 'HEAD^1', 'HEAD']
const gitDegisenSecenek = (kok: string) => ({ cwd: kok, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024, timeout: 10000 })
const KOK_SAHTE = '/sahte/kok'

const DISLANAMAZ_BEKLENEN = [
  'scripts/ci/__tests__/edited-ayna.test.ts',
  'scripts/ci/__tests__/dunya-durumu.test.ts',
  'scripts/ci/__tests__/degisiklik-sinifi.test.ts',
  'src/__tests__/conformance/ci-edited-ayna.test.ts',
  'src/__tests__/conformance/test-kosu-kapsami.test.ts',
  'src/__tests__/conformance/dunya-durumu-satiri.test.ts',
  'src/__tests__/conformance/ci-degisiklik-sinifi.test.ts',
]
const GERCEK_KAYIT = 'src/__tests__/conformance/taban-tazeligi-dunya.test.ts'
/** Diskteki gerçek listenin TÜM test yolları (sıra dosyadaki sıra): listeye kayıt eklenince bu testlerin elle güncellenmesi gerekmesin. */
const DISK_YOLLARI = D.listeyiOku().testler.map((t) => t.test)
const KORUYUCU_MESAJI = 'bu test dışlama mekanizmasının KENDİ koruyucusu, PR kapısından çıkarılamaz'

const A = 'src/__tests__/a.test.ts'
const B = 'src/__tests__/b.test.ts'
const C = 'src/__tests__/c.test.ts'
const VAR = () => true

/** Geçerli (gerekçeli, `zamanli` yerli) deneme kaydı. */
const kayit = (test: string): Kayit => ({
  test,
  neden: 'Bu test master durumuna bağlı (deneme kaydı).',
  kanit: 'CI geçmişinde üç dalda kırmızı (deneme kaydı).',
  yeniYer: ['master-push', 'zamanli'],
})
const liste = (...yollar: string[]): Liste => ({ surum: 1, testler: yollar.map(kayit) })
/** Yalnız `test` taşıyan taban: taban gerekçe ve dosya-varlık denetimine TABİ değildir, yalnız şekli denetlenir. */
const taban = (...yollar: string[]) => ({ surum: 1, testler: yollar.map((test) => ({ test })) })
/** `dogrula`nın tam BİR hata (test yolu bir test dosyası olmalı) verdiği kayıt: hata sayısını ve sınırını yoklamak için. */
const bozukKayit = (i: number): Kayit => ({ ...kayit(A), test: `a${i}.txt` })
const bozukMesaji = (i: number) => `testler[${i}] (a${i}.txt): test yolu bir test dosyası olmalı`

/** Herhangi bir özelliğine bakılırsa PATLAYAN liste: `tam` kipi listeye HİÇ dokunmamalı. */
const patlayanListe = (): object => {
  const patla = (): never => {
    throw new Error('liste okundu')
  }
  return new Proxy({}, { get: patla, has: patla, ownKeys: patla, getOwnPropertyDescriptor: patla })
}
const patlayan =
  (ad: string) =>
  (): never => {
    throw new Error(`${ad} çağrıldı`)
  }

let dizin = ''
let ortamYedegi: Env = {}
const temizlikler: Array<() => void> = []

beforeEach(() => {
  dizin = mkdtempSync(path.join(tmpdir(), 'dunya-durumu-'))
  ortamYedegi = { [KIP]: process.env[KIP], [TABAN_ENV]: process.env[TABAN_ENV], [DEGISEN_ENV]: process.env[DEGISEN_ENV] }
  delete process.env[KIP]
  delete process.env[TABAN_ENV]
  delete process.env[DEGISEN_ENV]
})
afterEach(() => {
  for (const t of temizlikler.splice(0).reverse()) t()
  for (const [k, v] of Object.entries(ortamYedegi)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  rmSync(dizin, { recursive: true, force: true })
})

/** Geçici dizine dosya yazar, mutlak yolunu döner. */
function dosyaYaz(ad: string, icerik: string): string {
  const yol = path.join(dizin, ad)
  mkdirSync(path.dirname(yol), { recursive: true })
  writeFileSync(yol, icerik)
  return yol
}

/** Listenin diskteki yolunu okuyan `fs.readFileSync` çağrılarını izler; `patlat` ise o okumada fırlatır. Diğer okumalar GERÇEKTEN yapılır. */
function listeOkumasiniIzle(patlat: boolean): string[] {
  const asil = fsYuzeyi.readFileSync as (...a: unknown[]) => unknown
  const okunanlar: string[] = []
  fsYuzeyi.readFileSync = (yol: unknown, ...geri: unknown[]) => {
    if (String(yol).replace(/\\/g, '/').endsWith(`/${LISTE_YOLU}`)) {
      okunanlar.push(String(yol))
      if (patlat) throw new Error('EACCES: liste okunamıyor (sahte)')
    }
    return asil(yol, ...geri)
  }
  temizlikler.push(() => {
    fsYuzeyi.readFileSync = asil
  })
  return okunanlar
}

/** `child_process.execFileSync`i sahteler (varsayılan `execFn` ve `ayar` bağı için): gerçek `git` HİÇ çalışmaz; her çağrı kaydedilir. */
function gitTakmasi(donus: () => unknown) {
  const cagrilar: Array<[string, string[], unknown]> = []
  const asil = cpYuzeyi.execFileSync
  cpYuzeyi.execFileSync = (komut: string, args: string[], secenek: unknown) => {
    cagrilar.push([komut, args, secenek])
    return donus()
  }
  temizlikler.push(() => {
    cpYuzeyi.execFileSync = asil
  })
  return { cagrilar, geriKoy: () => void (cpYuzeyi.execFileSync = asil) }
}

/** Kayıt tutan sahte `execFn` (modüle parametre olarak verilir). */
function sahteExec(donus: () => unknown) {
  const cagrilar: Array<[string, string[], unknown]> = []
  const exec: ExecFn = (komut, args, secenek) => {
    cagrilar.push([komut, args, secenek])
    return donus()
  }
  return { exec, cagrilar }
}

describe('sözleşme yüzeyi — dışa açılan adlar ve sabitler literal sınanır', () => {
  it('dışa açılan ad kümesi TAM: mevcut dokuz ad korunur, yenileri DISLANAMAZ + TABAN_LISTE_ORTAM + tabanListesiniOku + (ALT-38i) DEGISEN_ORTAM + degisenYollariniOku + filtreEslesirMi + KAYIT_ALANLARI + ozetSatiri', () => {
    expect(Object.keys(D).sort()).toEqual(
      [
        'DEGISEN_ORTAM',
        'DISLANAMAZ',
        'KAYIT_ALANLARI',
        'KIPLER',
        'KOK',
        'LISTE_YOLU',
        'ORTAM_ADI',
        'TABAN_LISTE_ORTAM',
        'TEST_DESENI',
        'YENI_YERLER',
        'ayar',
        'degisenYollariniOku',
        'dogrula',
        'filtreEslesirMi',
        'listeyiOku',
        'ozetSatiri',
        'tabanListesiniOku',
      ].sort(),
    )
  })

  it('sabitler literal: kip değişkeni, taban değişkeni, liste yolu, kipler, depo kökü (sabit kendi kendini doğrulamasın)', () => {
    expect(D.ORTAM_ADI).toBe('VENTHUB_DUNYA_DURUMU')
    expect(D.TABAN_LISTE_ORTAM).toBe('VENTHUB_DUNYA_TABAN_LISTESI')
    expect(D.DEGISEN_ORTAM).toBe('VENTHUB_DUNYA_DEGISEN_DOSYALAR')
    expect(D.LISTE_YOLU).toBe('scripts/ci/dunya-durumu-testleri.json')
    expect(D.KIPLER).toEqual(['dislan', 'yalniz'])
    // `git show` bu dizinde koşar ve `dosyaVarMi` bu köke göre bakar: kök kayarsa taban sessizce başka yerden okunurdu
    expect(path.resolve(D.KOK)).toBe(KOK)
  })

  it('KAYIT_ALANLARI literal ve dondurulmuş: kapıyı süren beş alan + insan/karne alanları (kimlik, eskiYer, gorunenYuz); GERÇEK listedeki her alan bu kümede', () => {
    expect([...D.KAYIT_ALANLARI]).toEqual(['test', 'kimlik', 'eskiYer', 'yeniYer', 'yolFiltresi', 'neden', 'kanit', 'gorunenYuz'])
    expect(Object.isFrozen(D.KAYIT_ALANLARI)).toBe(true)
    for (const t of D.listeyiOku().testler) for (const alan of Object.keys(t)) expect(D.KAYIT_ALANLARI, `${t.test}: ${alan}`).toContain(alan)
  })

  it('gerçek liste (diskteki) hata vermez: DISLANAMAZ, kanonik yol ve yolFiltresi kuralları bugünkü kayıtları reddetmez', () => {
    expect(D.dogrula(D.listeyiOku())).toEqual([])
    expect(D.listeyiOku().testler.map((t) => t.test)).toContain(GERCEK_KAYIT)
  })

  it('gerçek listedeki her yolFiltresi GERÇEK diskte var ve türü yazımıyla uyumlu (sondaki / dizin, onsuz dosya): yetim süzgeç yok', () => {
    const suzgecliler = D.listeyiOku().testler.filter((t) => t.yolFiltresi !== undefined)
    expect(suzgecliler.length, 'gerçek listede süzgeçli kayıt yok: bu kapı hiçbir şey ölçmüyor').toBeGreaterThan(0)
    for (const t of suzgecliler) {
      for (const g of t.yolFiltresi as string[]) {
        const govde = g.endsWith('/') ? g.slice(0, -1) : g
        expect(existsSync(path.join(KOK, govde)), `${t.test}: süzgeç ${g} diskte yok`).toBe(true)
        expect(statSync(path.join(KOK, govde)).isDirectory(), `${t.test}: ${g} türü yazımıyla uyuşmuyor`).toBe(g.endsWith('/'))
      }
    }
  })
})

describe('DISLANAMAZ — mekanizmanın KENDİ koruyucuları PR kapısından çıkarılamaz', () => {
  it('beş kayıt TAM liste olarak sabit (sıra dahil) ve değiştirilemez', () => {
    expect([...D.DISLANAMAZ]).toEqual(DISLANAMAZ_BEKLENEN)
    expect(Object.isFrozen(D.DISLANAMAZ)).toBe(true)
  })

  it.each(DISLANAMAZ_BEKLENEN)('%s diskte VAR (yazım hatası koruyucuyu sessizce korumasız bırakmasın) ve test dosyası desenine uyar', (yol) => {
    expect(existsSync(path.join(KOK, yol)), `${yol} yok: DISLANAMAZ bir hayalet dosyayı koruyor`).toBe(true)
    expect(D.TEST_DESENI.test(yol)).toBe(true)
  })

  it.each(DISLANAMAZ_BEKLENEN)('dogrula: %s listedeyse TAM bir hata, mesaj sözleşmesi birebir', (yol) => {
    expect(D.dogrula(liste(yol), VAR)).toEqual([`testler[0] (${yol}): ${KORUYUCU_MESAJI}`])
  })

  it.each(DISLANAMAZ_BEKLENEN.flatMap((yol) => [[yol, 'dislan'] as [string, string], [yol, 'yalniz'] as [string, string]]))(
    'ayar: %s listedeyse %s kipi FIRLATIR (taban ne olursa olsun, vitest hiç başlamaz)',
    (yol, kip) => {
      const tabanOku = vi.fn(() => liste(yol))
      expect(() => D.ayar({ [KIP]: kip }, liste(yol), { tabanOku, dosyaVarMi: VAR })).toThrow(`${LISTE_YOLU} GEÇERSİZ (1 hata): testler[0] (${yol}): ${KORUYUCU_MESAJI}`)
      expect(tabanOku).not.toHaveBeenCalled()
    },
  )

  it('tam kipi DISLANAMAZ içeren listeyi sorgulamaz (kapı kendisi hiçbir şeyi dışlamaz; liste okunmaz bile)', () => {
    expect(D.ayar({ [KIP]: 'tam' }, liste(...DISLANAMAZ_BEKLENEN), { dosyaVarMi: VAR })).toStrictEqual({ kip: 'tam', exclude: [], include: null })
  })

  it.each([
    ['./', './src/__tests__/conformance/test-kosu-kapsami.test.ts'],
    ['çift eğik çizgi', 'src//__tests__/conformance/test-kosu-kapsami.test.ts'],
    ['/./', 'src/__tests__/./conformance/test-kosu-kapsami.test.ts'],
    ['/../', 'src/__tests__/../__tests__/conformance/test-kosu-kapsami.test.ts'],
    ['ters eğik çizgi', 'src\\__tests__\\conformance\\test-kosu-kapsami.test.ts'],
  ])('TAKMA YAZIM (%s): vitest bunu AYNI dosyaya eşler; hem "kanonik değil" hem DISLANAMAZ hatası verir (iki bağımsız kat)', (_ad, takma) => {
    const hatalar = D.dogrula(liste(takma), VAR).join('\n')
    expect(hatalar).toContain('yol kanonik değil')
    expect(hatalar).toContain(KORUYUCU_MESAJI)
    expect(() => D.ayar({ [KIP]: 'dislan' }, liste(takma), { tabanOku: () => liste(takma), dosyaVarMi: VAR })).toThrow(/GEÇERSİZ \(2 hata\)/)
  })

  it('takma yazım DISLANAMAZ olmayan dosyada da reddedilir ("kanonik değil"): gerçek kayıt `./` ile yazılırsa liste geçersizdir', () => {
    const hatalar = D.dogrula(liste(`./${GERCEK_KAYIT}`), VAR)
    expect(hatalar).toHaveLength(1)
    expect(hatalar[0]).toContain('yol kanonik değil')
    expect(hatalar[0]).not.toContain('KENDİ koruyucusu')
  })

  it.each(['/src/__tests__/a.test.ts', '../src/__tests__/a.test.ts'])('köke bağlı ya da dışarı çıkan yol %s kanonik sayılmaz', (yol) => {
    expect(D.dogrula(liste(yol), VAR).join('\n')).toContain('yol kanonik değil')
  })

  it('kanonik yollar (derin dizin, nokta içeren dosya adı, farklı uzantılar) kanonik hatası VERMEZ: doğru yazım yanlışlıkla reddedilmesin', () => {
    expect(D.dogrula(liste('src/lib/a.b/c.test.tsx', 'x.spec.ts', 'scripts/ci/__tests__/y.test.cjs'), VAR)).toEqual([])
  })
})

describe('TAM kip — liste HİÇ okunmaz, doğrulanmaz; taban sorulmaz; git çağrılmaz', () => {
  it.each([
    ['ortam boş nesne', {}],
    ['kip boş metin', { [KIP]: '' }],
    ['kip tam', { [KIP]: 'tam' }],
  ])('%s: `{ kip: tam, exclude: [], include: null }`; patlayan liste, patlayan taban ve patlayan dosyaVarMi hiç çağrılmaz', (_ad, env) => {
    const git = gitTakmasi(patlayan('git'))
    const sonuc = D.ayar(env, patlayanListe(), { tabanOku: patlayan('tabanOku'), dosyaVarMi: patlayan('dosyaVarMi') })
    expect(sonuc).toStrictEqual({ kip: 'tam', exclude: [], include: null })
    expect(git.cagrilar).toEqual([])
  })

  it('liste verilmemişse tam kipi diskteki listeyi HİÇ OKUMAZ (okuma sayısı 0; okunsa patlayacaktı)', () => {
    const okunanlar = listeOkumasiniIzle(true)
    const git = gitTakmasi(patlayan('git'))
    expect(D.ayar({ [KIP]: 'tam' })).toStrictEqual({ kip: 'tam', exclude: [], include: null })
    expect(D.ayar({})).toStrictEqual({ kip: 'tam', exclude: [], include: null })
    expect(okunanlar).toEqual([])
    expect(git.cagrilar).toEqual([])
  })

  it('ortam verilmezse process.env okunur (varsayılan env): kip yalniz ise yalniz kipine geçer', () => {
    process.env[KIP] = 'yalniz'
    expect(D.ayar(undefined, liste(A), { dosyaVarMi: VAR })).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A] })
  })
})

describe('GEÇERSİZ KİP önce gelir', () => {
  it.each(['dislam', 'hepsi', 'DISLAN', 'tam ', 'Yalniz'])('kip %j FIRLATIR; liste, taban ve dosyaVarMi hiç sorulmaz', (kip) => {
    const git = gitTakmasi(patlayan('git'))
    expect(() => D.ayar({ [KIP]: kip }, patlayanListe(), { tabanOku: patlayan('tabanOku'), dosyaVarMi: patlayan('dosyaVarMi') })).toThrow(
      `VENTHUB_DUNYA_DURUMU="${kip}" geçersiz (boş | tam | dislan | yalniz); kapı sessizce kalkmasın diye durduruldu`,
    )
    expect(git.cagrilar).toEqual([])
  })
})

describe('GEÇERSİZ LİSTE — dislan ve yalniz FIRLATIR (vitest başlamaz: fail-closed)', () => {
  const kipler = ['dislan', 'yalniz']

  it.each(kipler)('%s: tek hata mesajı biçimi TAM (liste yolu + sayı + hata)', (kip) => {
    const bozuk = { surum: 1, testler: [bozukKayit(0)] }
    expect(() => D.ayar({ [KIP]: kip }, bozuk, { tabanOku: () => liste(A), dosyaVarMi: VAR })).toThrow(new Error(`${LISTE_YOLU} GEÇERSİZ (1 hata): ${bozukMesaji(0)}`))
  })

  it.each(kipler)('%s: iki hata " | " ile birleşir', (kip) => {
    const bozuk = { surum: 1, testler: [bozukKayit(0), bozukKayit(1)] }
    expect(() => D.ayar({ [KIP]: kip }, bozuk, { dosyaVarMi: VAR })).toThrow(new Error(`${LISTE_YOLU} GEÇERSİZ (2 hata): ${bozukMesaji(0)} | ${bozukMesaji(1)}`))
  })

  it.each(kipler)('%s: tam 5 hata kırpılmadan yazılır, 6 hatada sayı 6 ama yalnız İLK 5 yazılır, 7 hatada yine ilk 5', (kip) => {
    const n = (adet: number) => ({ surum: 1, testler: Array.from({ length: adet }, (_x, i) => bozukKayit(i)) })
    const mesaj = (adet: number) => {
      try {
        D.ayar({ [KIP]: kip }, n(adet), { dosyaVarMi: VAR })
      } catch (e) {
        return (e as Error).message
      }
      throw new Error('fırlatmadı')
    }
    const bes = [0, 1, 2, 3, 4].map(bozukMesaji).join(' | ')
    expect(mesaj(5)).toBe(`${LISTE_YOLU} GEÇERSİZ (5 hata): ${bes}`)
    expect(mesaj(6)).toBe(`${LISTE_YOLU} GEÇERSİZ (6 hata): ${bes}`)
    expect(mesaj(7)).toBe(`${LISTE_YOLU} GEÇERSİZ (7 hata): ${bes}`)
  })

  it.each(kipler)('%s: hata sayısı kayıt başına değil TOPLAM hatadır (bir kayıtta iki hata = 2)', (kip) => {
    const iki: Liste = { surum: 1, testler: [{ ...kayit(A), neden: 'kısa', kanit: 'kısa' }] }
    expect(() => D.ayar({ [KIP]: kip }, iki, { dosyaVarMi: VAR })).toThrow(/GEÇERSİZ \(2 hata\): .*neden en az 20 karakter.* \| .*kanit en az 20 karakter/)
  })

  it.each(kipler)('%s: geçersiz listede taban HİÇ okunmaz (doğrulama tabandan ÖNCE)', (kip) => {
    const tabanOku = vi.fn(() => liste(A))
    const git = gitTakmasi(patlayan('git'))
    expect(() => D.ayar({ [KIP]: kip }, { surum: 2, testler: [] }, { tabanOku, dosyaVarMi: VAR })).toThrow(/GEÇERSİZ \(1 hata\): surum 1 olmalı/)
    expect(tabanOku).not.toHaveBeenCalled()
    expect(git.cagrilar).toEqual([])
  })

  it.each(kipler)('%s: liste null / testler dizi değil → FIRLATIR (açık null "liste verilmedi" sayılıp diskten okunmaz)', (kip) => {
    const okunanlar = listeOkumasiniIzle(false)
    expect(() => D.ayar({ [KIP]: kip }, null, { dosyaVarMi: VAR })).toThrow(`${LISTE_YOLU} GEÇERSİZ (2 hata): surum 1 olmalı | testler dizi olmalı`)
    expect(() => D.ayar({ [KIP]: kip }, { surum: 1, testler: {} }, { dosyaVarMi: VAR })).toThrow(`${LISTE_YOLU} GEÇERSİZ (1 hata): testler dizi olmalı`)
    expect(okunanlar).toEqual([])
  })

  it.each(kipler)('%s: secenek.dosyaVarMi dogrula\'ya GEÇER: diskte VAR olan dosya "yok" denirse hata, olmayan dosya "var" denirse hata YOK', (kip) => {
    expect(() => D.ayar({ [KIP]: kip }, liste(GERCEK_KAYIT), { tabanOku: () => liste(GERCEK_KAYIT), dosyaVarMi: () => false })).toThrow(
      `${LISTE_YOLU} GEÇERSİZ (1 hata): testler[0] (${GERCEK_KAYIT}): dosya yok (listede yetim kayıt)`,
    )
    const hayalet = 'src/__tests__/olmayan-hayalet.test.ts'
    expect(() => D.ayar({ [KIP]: kip }, liste(hayalet), { tabanOku: () => liste(hayalet), dosyaVarMi: VAR })).not.toThrow()
  })

  it.each(kipler)('%s: dosyaVarMi verilmezse GERÇEK diske bakılır (olmayan dosya yetim sayılır)', (kip) => {
    expect(() => D.ayar({ [KIP]: kip }, liste('src/__tests__/olmayan-hayalet.test.ts'), { tabanOku: () => liste(A) })).toThrow(/dosya yok \(listede yetim kayıt\)/)
  })

  it.each(kipler)('%s: liste verilmezse diskten TEK kez okunur ve doğrulanır', (kip) => {
    const okunanlar = listeOkumasiniIzle(false)
    const sonuc = D.ayar({ [KIP]: kip }, undefined, { tabanOku: () => taban(GERCEK_KAYIT) })
    expect(okunanlar).toHaveLength(1)
    expect(sonuc.kip).toBe(kip)
    // yalniz: diskteki listenin TAMAMI; dislan: yalnız tabandakiler (taban tek kayıt taşıyor, diğer gerçek kayıtlar PR'ın yeni kaydı sayılır)
    expect(kip === 'yalniz' ? sonuc.include : sonuc.exclude).toEqual(kip === 'yalniz' ? DISK_YOLLARI : [GERCEK_KAYIT])
  })

  it.each(kipler)('%s: liste verilmeyip disk okunamazsa FIRLATIR, mesaj okunamadığını söyler (ham fs hatası sızmaz)', (kip) => {
    listeOkumasiniIzle(true)
    expect(() => D.ayar({ [KIP]: kip }, undefined, { tabanOku: () => null })).toThrow(`${LISTE_YOLU} okunamadı ya da JSON değil: EACCES: liste okunamıyor (sahte)`)
  })
})

describe('YALNIZ kip — eskisi gibi: liste = include, taban sorulmaz', () => {
  it('geçerli liste: include liste sırasıyla TAM, exclude boş, `uyari` anahtarı yok', () => {
    const git = gitTakmasi(patlayan('git'))
    const sonuc = D.ayar({ [KIP]: 'yalniz' }, liste(B, A, C), { tabanOku: patlayan('tabanOku'), dosyaVarMi: VAR })
    expect(sonuc).toStrictEqual({ kip: 'yalniz', exclude: [], include: [B, A, C] })
    expect(git.cagrilar).toEqual([])
  })

  it('taban listesi yalniz kipinde kesişime GİRMEZ: zamanlı iş akışı master\'dan koşar, kendi listesinin TAMAMI koşar', () => {
    // taban ayrı bir liste olsa da (eski, boş, bozuk) etkisi yok
    for (const tabanOku of [() => taban(A), () => taban(), () => null, () => ({ bozuk: true })]) {
      expect(D.ayar({ [KIP]: 'yalniz' }, liste(A, B), { tabanOku, dosyaVarMi: VAR })).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A, B] })
    }
  })

  it('seçenek hiç verilmezse boş seçenek sayılır: gerçek dosya-varlık denetimi ve (liste de verilmezse) diskteki gerçek liste', () => {
    expect(D.ayar({ [KIP]: 'yalniz' }, liste(GERCEK_KAYIT))).toStrictEqual({ kip: 'yalniz', exclude: [], include: [GERCEK_KAYIT] })
    expect(D.ayar({ [KIP]: 'yalniz' })).toStrictEqual({ kip: 'yalniz', exclude: [], include: DISK_YOLLARI })
  })

  it('ortam değişkeni (taban yolu) yalniz kipinde okunmaz', () => {
    const git = gitTakmasi(patlayan('git'))
    const sonuc = D.ayar({ [KIP]: 'yalniz', [TABAN_ENV]: path.join(dizin, 'yok.json') }, liste(A), { dosyaVarMi: VAR })
    expect(sonuc).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A] })
    expect(git.cagrilar).toEqual([])
  })
})

describe('DISLAN kipi — dışlanacak küme = PR listesi ∩ TABAN listesi', () => {
  const dislan = (pr: Liste, tabanListe: unknown, env: Env = {}) => D.ayar({ [KIP]: 'dislan', ...env }, pr, { tabanOku: () => tabanListe, dosyaVarMi: VAR })

  it.each<[string, string[], string[], string[]]>([
    ['PR = taban: hepsi dışarıda', [A, B], [A, B], [A, B]],
    ["PR'ın YENİ eklediği kayıt kendi PR'ında DIŞLANMAZ (yalnız tabandakiler)", [A, B, C], [A, B], [A, B]],
    ['PR listeden SİLDİĞİ kayıt dışlanmaz (taban yazılı olsa da PR listesinde yok)', [A], [A, B], [A]],
    ['taban BOŞ liste: hiçbir şey dışlanmaz', [A, B], [], []],
    ['PR listesi boş: hiçbir şey dışlanmaz', [], [A, B], []],
    ['sıra PR listesinin sırasıdır (tabanınki değil)', [B, A], [A, B], [B, A]],
    ['taban ve PR ayrık: hiçbir şey dışlanmaz', [A, B], [C], []],
    ["taban kesişimin dışında fazlalık taşıyor: yalnız PR'ın kayıtları", [B], [A, B, C], [B]],
  ])('%s', (_ad, pr, tabanYollari, beklenen) => {
    const sonuc = dislan(liste(...pr), taban(...tabanYollari))
    expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: beklenen, include: null })
    expect('uyari' in sonuc).toBe(false)
  })

  it('taban SAHTE KAYITLARLA dolu olsa da (glob, olmayan dosya, DISLANAMAZ) FIRLATMAZ: tabana yalnız şekil sorulur', () => {
    const sonuc = dislan(liste(A), taban('src/**/*.test.ts', 'src/__tests__/olmayan.test.ts', ...DISLANAMAZ_BEKLENEN, A))
    expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [A], include: null })
  })

  it('taban kaydın gerekçe/yer alanlarını taşımak zorunda değil; yalnız `test` metni yeter', () => {
    expect(dislan(liste(A, B), { surum: 1, testler: [{ test: B, bambaska: 1 }] })).toStrictEqual({ kip: 'dislan', exclude: [B], include: null })
  })

  it('tabanOku TAM bir kez ve argümansız çağrılır', () => {
    const tabanOku = vi.fn(() => taban(A))
    D.ayar({ [KIP]: 'dislan' }, liste(A), { tabanOku, dosyaVarMi: VAR })
    expect(tabanOku).toHaveBeenCalledTimes(1)
    expect(tabanOku).toHaveBeenCalledWith()
  })

  describe('taban OKUNAMADIYSA hiçbir şey dışlanmaz (güvenli taraf: TAM paket) ve uyarı döner', () => {
    it('null taban: exclude boş (PR listesine DÜŞÜLMEZ), include null, `uyari` metin', () => {
      const sonuc = dislan(liste(A, B), null)
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining('taban listesi okunamadı') })
    })

    it('uyarı HANGİ kaynağın okunamadığını söyler: ortam değişkeni yoksa git HEAD^1 (liste yolu ve fetch-depth ipucuyla)', () => {
      const { uyari } = dislan(liste(A), null)
      expect(uyari).toMatch(/^taban listesi okunamadı ya da geçersiz \(git show HEAD\^1:scripts\/ci\/dunya-durumu-testleri\.json; .*fetch-depth.*\): hiçbir test dışlanmadı, TAM paket koşar/)
      expect(uyari).not.toContain(TABAN_ENV)
    })

    it("uyarı ortam değişkeni DOLUYSA onu adıyla ve yolu JSON kaçışlı söyler (git'ten bahsetmez); satır sonu enjekte edemez", () => {
      expect(dislan(liste(A), null, { [TABAN_ENV]: '/x/taban.json' }).uyari).toBe(
        'taban listesi okunamadı ya da geçersiz (VENTHUB_DUNYA_TABAN_LISTESI="/x/taban.json"): hiçbir test dışlanmadı, TAM paket koşar (güvenli taraf)',
      )
      const kotu = dislan(liste(A), null, { [TABAN_ENV]: 'a\n::error::sahte\nb' }).uyari as string
      expect(kotu).not.toMatch(/[\r\n]/)
      expect(kotu).not.toContain('git show')
    })

    it('ortam değişkeni BOŞ metinse "dolu değil" sayılır: uyarı git kaynağını söyler', () => {
      expect(dislan(liste(A), null, { [TABAN_ENV]: '' }).uyari).toContain('git show HEAD^1:')
    })

    it("okunamayan taban, yalniz ve tam kiplerine uyarı EKLEMEZ (uyarı yalnız dislan'a özgü)", () => {
      expect('uyari' in D.ayar({ [KIP]: 'yalniz' }, liste(A), { tabanOku: () => null, dosyaVarMi: VAR })).toBe(false)
      expect('uyari' in D.ayar({ [KIP]: 'tam' }, liste(A), { tabanOku: () => null, dosyaVarMi: VAR })).toBe(false)
    })
  })

  describe('varsayılan taban kaynağı: enjeksiyon yoksa `tabanListesiniOku(env)` (gerçek bağ)', () => {
    it('git kolu: `git show HEAD^1:<liste>` modül kökünde, kabuksuz ve TAM seçeneklerle çağrılır; çıktı kesişime girer', () => {
      const git = gitTakmasi(() => JSON.stringify(taban(A)))
      const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [A], include: null })
      expect(git.cagrilar).toStrictEqual([['git', GIT_ARGS, gitSecenek(D.KOK)]])
    })

    it('git çıktısı bozuksa ya da git fırlatırsa: uyarı, hiçbir şey dışlanmaz, FIRLATMAZ', () => {
      const bozuklar: Array<() => unknown> = [() => '{bozuk', () => '', () => JSON.stringify({ surum: 2, testler: [] }), patlayan('git')]
      for (const donus of bozuklar) {
        const git = gitTakmasi(donus)
        const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A), { dosyaVarMi: VAR })
        expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining('git show HEAD^1:') })
        git.geriKoy()
      }
    })

    it('ortam değişkeni DOLUYSA taban o dosyadır; git ÇAĞRILMAZ', () => {
      const git = gitTakmasi(patlayan('git'))
      const dosya = dosyaYaz('taban.json', JSON.stringify(taban(B)))
      const sonuc = D.ayar({ [KIP]: 'dislan', [TABAN_ENV]: dosya }, liste(A, B), { dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [B], include: null })
      expect(git.cagrilar).toEqual([])
    })

    it("ortam değişkeni dolu ama dosya yok: git'e DÜŞÜLMEZ (istenen kaynak okunamadıysa başka kaynak yerini almaz), uyarı değişkeni söyler", () => {
      const git = gitTakmasi(() => JSON.stringify(taban(A, B)))
      const yok = path.join(dizin, 'yok.json')
      const sonuc = D.ayar({ [KIP]: 'dislan', [TABAN_ENV]: yok }, liste(A, B), { dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining(`${TABAN_ENV}=${JSON.stringify(yok)}`) })
      expect(git.cagrilar).toEqual([])
    })

    it("ayar kendisine verilen ortamı taban okumaya İLETİR (process.env'i değil): process.env'de taban dosyası olsa da verilen ortamda yoksa git okunur", () => {
      process.env[TABAN_ENV] = dosyaYaz('baska-taban.json', JSON.stringify(taban(A, B)))
      const git = gitTakmasi(() => JSON.stringify(taban(A)))
      const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [A], include: null })
      expect(git.cagrilar).toHaveLength(1)
    })
  })
})

describe('tabanListesiniOku — kaynak seçimi, argümanlar, her başarısızlık null', () => {
  it('git kolu: komut `git`, argümanlar `show` + `HEAD^1:<liste yolu>`, seçenekler TAM eşitlik (kabuk YOK, cwd = verilen kök)', () => {
    const { exec, cagrilar } = sahteExec(() => JSON.stringify(taban(A)))
    expect(D.tabanListesiniOku({}, KOK_SAHTE, exec)).toEqual(taban(A))
    expect(cagrilar).toStrictEqual([
      ['git', ['show', 'HEAD^1:scripts/ci/dunya-durumu-testleri.json'], { cwd: KOK_SAHTE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1048576, timeout: 10000 }],
    ])
  })

  it('kök verilmezse modülün kökü (KOK) kullanılır; execFn verilmezse child_process.execFileSync', () => {
    const { exec, cagrilar } = sahteExec(() => JSON.stringify(taban(A)))
    expect(D.tabanListesiniOku({}, undefined, exec)).toEqual(taban(A))
    expect(cagrilar[0][2]).toStrictEqual(gitSecenek(D.KOK))
    const git = gitTakmasi(() => JSON.stringify(taban(B)))
    expect(D.tabanListesiniOku({})).toEqual(taban(B))
    expect(git.cagrilar).toHaveLength(1)
  })

  it('env verilmezse process.env okunur (varsayılan env)', () => {
    process.env[TABAN_ENV] = dosyaYaz('t.json', JSON.stringify(taban(C)))
    const { exec, cagrilar } = sahteExec(patlayan('git'))
    expect(D.tabanListesiniOku(undefined, KOK_SAHTE, exec)).toEqual(taban(C))
    expect(cagrilar).toEqual([])
  })

  it('ortam yolu DOLUYSA o dosya okunur ve git ÇAĞRILMAZ', () => {
    const dosya = dosyaYaz('taban.json', JSON.stringify(taban(A, B)))
    const { exec, cagrilar } = sahteExec(patlayan('git'))
    expect(D.tabanListesiniOku({ [TABAN_ENV]: dosya }, KOK_SAHTE, exec)).toEqual(taban(A, B))
    expect(cagrilar).toEqual([])
  })

  it('ortam yolu dolu ama dosya YOKSA: null, git ÇAĞRILMAZ (okunamayan istenen kaynağın yerini başka kaynak almaz)', () => {
    const { exec, cagrilar } = sahteExec(() => JSON.stringify(taban(A)))
    expect(D.tabanListesiniOku({ [TABAN_ENV]: path.join(dizin, 'yok.json') }, KOK_SAHTE, exec)).toBeNull()
    expect(cagrilar).toEqual([])
  })

  it('ortam yolu BOŞ metinse git kolu kullanılır', () => {
    const { exec, cagrilar } = sahteExec(() => JSON.stringify(taban(A)))
    expect(D.tabanListesiniOku({ [TABAN_ENV]: '' }, KOK_SAHTE, exec)).toEqual(taban(A))
    expect(cagrilar).toHaveLength(1)
  })

  it('kayıtların fazladan alanları (neden, kanıt, yer) korunur: dönen nesne ayrıştırılmış dosyanın kendisidir', () => {
    const tam = { ...liste(A, B), aciklama: 'x' }
    expect(D.tabanListesiniOku({}, KOK_SAHTE, () => JSON.stringify(tam))).toEqual(tam)
  })

  it('taban dosya-varlık denetimine TABİ DEĞİL: tabanda yazılı olup diskte olmayan test kabul edilir', () => {
    const silinmis = taban('src/__tests__/silinmis.test.ts')
    expect(D.tabanListesiniOku({}, KOK_SAHTE, () => JSON.stringify(silinmis))).toEqual(silinmis)
  })

  describe('her başarısızlık FIRLATMAZ, null döner', () => {
    const hataliExec: Array<[string, ExecFn]> = [
      [
        'git yok (ENOENT)',
        () => {
          throw Object.assign(new Error('spawn git ENOENT'), { code: 'ENOENT' })
        },
      ],
      [
        'ref yok (çıkış 128)',
        () => {
          throw Object.assign(new Error('Command failed: git show'), { status: 128 })
        },
      ],
      [
        'zaman aşımı',
        () => {
          throw Object.assign(new Error('spawnSync git ETIMEDOUT'), { code: 'ETIMEDOUT' })
        },
      ],
      [
        'Error olmayan değer fırlatılır',
        () => {
          throw 'metin hata'
        },
      ],
      ['boş çıktı (dosya tabanda yok)', () => ''],
      ['JSON değil', () => '<html>502</html>'],
      ['yarım JSON', () => '{"surum": 1, "testler": ['],
      ['undefined döner', () => undefined],
    ]
    it.each(hataliExec)('git kolu: %s', (_ad, exec) => {
      expect(() => D.tabanListesiniOku({}, KOK_SAHTE, exec)).not.toThrow()
      expect(D.tabanListesiniOku({}, KOK_SAHTE, exec)).toBeNull()
    })

    it.each<[string, () => string]>([
      ['dosya yok', () => path.join(dizin, 'yok.json')],
      ['dosya boş', () => dosyaYaz('bos.json', '')],
      ['JSON bozuk', () => dosyaYaz('bozuk.json', '{"surum": 1,')],
      ['yol bir DİZİN (okunamaz)', () => dizin],
    ])('ortam dosyası: %s', (_ad, yolu) => {
      const env = { [TABAN_ENV]: yolu() }
      expect(() => D.tabanListesiniOku(env, KOK_SAHTE, patlayan('git'))).not.toThrow()
      expect(D.tabanListesiniOku(env, KOK_SAHTE, patlayan('git'))).toBeNull()
    })
  })

  describe('ŞEKİL denetimi: bozuk taban = taban YOK (null)', () => {
    const gecerli: Array<[string, unknown]> = [
      ['boş liste', { surum: 1, testler: [] }],
      ['tek kayıt', { surum: 1, testler: [{ test: A }] }],
      ['fazla alanlı kayıt', { surum: 1, testler: [{ test: A, neden: 'x' }, { test: B }], aciklama: 'y' }],
    ]
    const bozuk: Array<[string, unknown]> = [
      ['null', null],
      ['dizi', []],
      ['metin', 'taban'],
      ['sayı', 7],
      ['boş nesne', {}],
      ['surum eksik', { testler: [] }],
      ['surum 2', { surum: 2, testler: [] }],
      ['surum metin "1"', { surum: '1', testler: [] }],
      ['surum 0', { surum: 0, testler: [] }],
      ['testler eksik', { surum: 1 }],
      ['testler nesne', { surum: 1, testler: {} }],
      ['testler metin', { surum: 1, testler: 'a' }],
      ['öğe null', { surum: 1, testler: [null] }],
      ['öğe boş nesne', { surum: 1, testler: [{}] }],
      ['öğe test sayı', { surum: 1, testler: [{ test: 5 }] }],
      ['öğe metin', { surum: 1, testler: [A] }],
      ['bir öğe bozuk, diğerleri iyi', { surum: 1, testler: [{ test: A }, { test: null }, { test: B }] }],
    ]
    it.each(gecerli)('geçerli şekil KABUL edilir: %s', (_ad, nesne) => {
      expect(D.tabanListesiniOku({}, KOK_SAHTE, () => JSON.stringify(nesne))).toEqual(nesne)
    })
    it.each(bozuk)('bozuk şekil null: %s (git kolu)', (_ad, nesne) => {
      expect(D.tabanListesiniOku({}, KOK_SAHTE, () => JSON.stringify(nesne))).toBeNull()
    })
    it.each(bozuk)('bozuk şekil null: %s (ortam dosyası kolu)', (_ad, nesne) => {
      const env = { [TABAN_ENV]: dosyaYaz('sekil.json', JSON.stringify(nesne)) }
      expect(D.tabanListesiniOku(env, KOK_SAHTE, patlayan('git'))).toBeNull()
    })
    it("bozuk şekilli taban ayar'da hiçbir şeyi dışlatmaz (uyarı döner)", () => {
      for (const [ad, nesne] of bozuk) {
        const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A), { tabanOku: () => D.tabanListesiniOku({}, KOK_SAHTE, () => JSON.stringify(nesne)), dosyaVarMi: VAR })
        expect(sonuc, ad).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining('taban listesi okunamadı') })
      }
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// YOL SÜZGECİ (ALT-38i, OPS hükmü 2026-10-09). Süzgeçli kayıt PR kapısından YALNIZ PR'ın değişen dosyalarından hiçbiri süzgece uymuyorsa çıkar.
// Güven sınırı B3'ün devamıdır: süzgeç TABANDAN okunur, okunamayan her şey testi kapıda TUTAR (güvenli taraf).
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Süzgeçli deneme kaydı (`yolFiltresi` bilerek `unknown`: geçersiz biçimler de sınanır). */
const suzgecli = (test: string, yolFiltresi: unknown): Kayit => ({ ...kayit(test), yolFiltresi })
type TabanKaydi = [test: string, yolFiltresi?: unknown]
/** Süzgeçli taban: `[yol]` süzgeçsiz, `[yol, süzgeç]` süzgeçli (süzgeç `null` da olabilir: alan YAZILI ama geçersiz). Taban gerekçe istemez, yalnız şekil. */
const suzgecliTaban = (...kayitlar: TabanKaydi[]) => ({
  surum: 1,
  testler: kayitlar.map(([test, yolFiltresi]) => (yolFiltresi === undefined ? { test } : { test, yolFiltresi })),
})
const SUZGEC = ['x/', 'tek.cjs']
/** A'nın tabandaki süzgeci SUZGEC olan PR çalıştırıcısı: `degisen` değişen dosya okuyucusunun döneceği değerdir (ham, geçersiz de olabilir). */
const dislanSuzgecli = (
  degisen: unknown,
  { pr = liste(A), tabanListe = suzgecliTaban([A, SUZGEC]), env = {} }: { pr?: Liste; tabanListe?: unknown; env?: Env } = {},
) => {
  const degisenOku = vi.fn(() => degisen)
  const sonuc = D.ayar({ [KIP]: 'dislan', ...env }, pr, { tabanOku: () => tabanListe, dosyaVarMi: VAR, degisenOku })
  return { sonuc, degisenOku }
}
/** Süzgece takılan test PR kapısında KALIR (dışlanmaz) ve bildirilir; takılmayan DIŞARI çıkar ve anahtar hiç yazılmaz. */
const TUTULAN: Ayar = { kip: 'dislan', exclude: [], include: null, suzgeceTakilan: [A] }
const CIKAN: Ayar = { kip: 'dislan', exclude: [A], include: null }

describe('YOL SÜZGECİ — dogrula: yolFiltresi şekli, glob, kanonik yazım, tekrar, yetim, tür', () => {
  const ON = `testler[0] (${A}): `
  const dogrulaSuzgec = (f: unknown, dosyaVarMi: DosyaVarMi = VAR) => D.dogrula({ surum: 1, testler: [suzgecli(A, f)] }, dosyaVarMi)

  it('geçerli süzgeç kabul edilir: dizin öneki, tam dosya yolu, ikisi birlikte; alan HİÇ yazılmamışsa da geçerli', () => {
    expect(dogrulaSuzgec(['a/b/'])).toEqual([])
    expect(dogrulaSuzgec(['a/b.cjs'])).toEqual([])
    expect(dogrulaSuzgec(['a/b/', 'c.json', '.githooks/', '.cc_docs.yaml'])).toEqual([])
    expect(D.dogrula(liste(A), VAR)).toEqual([])
  })

  it.each(['src/**', 'src/*.ts', '*', 'a/b/**', 'a/*/b/'])('glob %j YASAK: tam BİR hata, mesaj birebir', (g) => {
    expect(dogrulaSuzgec([g])).toEqual([`${ON}yolFiltresi "${g}": glob YASAK (dizin öneki "a/b/" ya da tam dosya yolu)`])
  })

  it.each(['./a/b/', 'a//b/', 'a/./b/', 'a/../b/', 'a\\b/', '/abs/x', '/x/', '../x', '..', '../', 'a/b//', '/', '.', './'])(
    'kanonik olmayan yazım %j reddedilir (tam BİR hata)',
    (g) => {
      const h = dogrulaSuzgec([g])
      expect(h, g).toHaveLength(1)
      expect(h[0]).toContain(`${ON}yolFiltresi "${g}": yol kanonik değil`)
    },
  )

  it.each<[string, unknown]>([
    ['boş dizi', []],
    ['metin', 'a/b/'],
    ['nesne', {}],
    ['null', null],
    ['sayı', 5],
  ])('dizi olmayan ya da boş süzgeç (%s) tek hata: alan istenmiyorsa HİÇ yazılmaz', (_ad, f) => {
    expect(dogrulaSuzgec(f)).toEqual([`${ON}yolFiltresi en az bir yol taşıyan dizi olmalı (süzgeç istenmiyorsa alan HİÇ yazılmaz)`])
  })

  it.each<[string, unknown]>([
    ['boş metin', ''],
    ['sayı', 5],
    ['null', null],
    ['nesne', {}],
  ])('metin olmayan öğe (%s) hata verir; yanındaki geçerli öğe etkilenmez', (_ad, o) => {
    expect(dogrulaSuzgec(['a/', o])).toEqual([`${ON}yolFiltresi öğesi boş olmayan metin olmalı`])
  })

  it('tekrar edilen öğe hata verir; farklı iki öğe tekrar sayılmaz', () => {
    expect(dogrulaSuzgec(['a/', 'a/'])).toEqual([`${ON}yolFiltresi "a/": tekrar`])
    expect(dogrulaSuzgec(['a/', 'b/'])).toEqual([])
  })

  it('yetim süzgeç: dosyaVarMi(yol, dizinMi) çağrılır (dizin öneki için true, tam yol için false); "yok" olan yol hata verir', () => {
    const var_ = vi.fn((yol: string) => yol !== 'yok')
    expect(dogrulaSuzgec(['x/y/', 'z.cjs'], var_)).toEqual([])
    expect(var_).toHaveBeenCalledWith('x/y', true)
    expect(var_).toHaveBeenCalledWith('z.cjs', false)
    expect(var_).toHaveBeenCalledWith(A) // testin kendi varlık denetimi dizinMi taşımaz
    const mesaj = (g: string) =>
      `${ON}yolFiltresi "${g}": yol yok ya da türü uyuşmuyor ("a/b/" bir dizin, "a/b" bir dosya olmalı; yetim süzgeç hiç eşleşmez ve test PR kapısından HEP çıkar)`
    expect(dogrulaSuzgec(['yok'], var_)).toEqual([mesaj('yok')])
    expect(dogrulaSuzgec(['yok/'], var_)).toEqual([mesaj('yok/')])
  })

  it('GERÇEK diskte tür denetimi: dizin `/`sız, dosya `/`lı yazılırsa ve olmayan yol hata verir; doğru yazım geçer', () => {
    const gercek = (f: unknown) => D.dogrula({ surum: 1, testler: [suzgecli(GERCEK_KAYIT, f)] })
    expect(gercek(['.githooks/', 'package.json'])).toEqual([])
    expect(gercek(['.githooks'])).toHaveLength(1) // dizin ama `/`sız: tam eşitlik hiçbir dosyayla eşleşmezdi
    expect(gercek(['.githooks'])[0]).toContain('yol yok ya da türü uyuşmuyor')
    expect(gercek(['package.json/'])).toHaveLength(1) // dosya ama `/`lı
    expect(gercek(['olmayan-dizin/'])).toHaveLength(1)
  })

  it.each(['dislan', 'yalniz'])('%s: PR listesinde geçersiz süzgeç FIRLATIR (vitest başlamaz); taban ve değişen dosyalar hiç sorulmaz', (kip) => {
    const tabanOku = vi.fn(() => taban(A))
    const degisenOku = vi.fn(() => ['x'])
    const pr = { surum: 1, testler: [suzgecli(A, ['src/**'])] }
    expect(() => D.ayar({ [KIP]: kip }, pr, { tabanOku, degisenOku, dosyaVarMi: VAR })).toThrow(
      `${LISTE_YOLU} GEÇERSİZ (1 hata): ${ON}yolFiltresi "src/**": glob YASAK (dizin öneki "a/b/" ya da tam dosya yolu)`,
    )
    expect(tabanOku).not.toHaveBeenCalled()
    expect(degisenOku).not.toHaveBeenCalled()
  })
})

describe('KAPALI KAYIT ŞEKLİ — bilinmeyen alan (yazım hatası) dogrula\'da hata verir (bağımsız denetim Ö1b)', () => {
  const ON = `testler[0] (${A}): `
  const IZINLI = 'test, kimlik, eskiYer, yeniYer, yolFiltresi, neden, kanit, gorunenYuz'
  const mesaj = (alan: string) => `${ON}bilinmeyen alan "${alan}" (izinli: ${IZINLI}); yazım hatası alanı sessizce düşürür, süzgeç ya da gerekçe hiç okunmaz`
  const dogrulaKayit = (k: object) => D.dogrula({ surum: 1, testler: [k] }, VAR)

  it.each(['yolFiltre', 'yolfiltresi', 'yolFiltresi ', 'yol_filtresi', 'filtre', 'Test', 'yeniyer', 'yeniYerr', 'kanıt', 'neden2', 'ekstra'])(
    'bilinmeyen alan %j reddedilir: tam BİR hata, mesaj birebir',
    (alan) => {
      expect(dogrulaKayit({ ...kayit(A), [alan]: ['x/'] })).toEqual([mesaj(alan)])
    },
  )

  it('yolFiltresi yerine yolFiltre yazılırsa kayıt "süzgeçsiz" görünürdü: şimdi hata verir (alan sessizce düşmez)', () => {
    const yazimHatali = { ...kayit(A), yolFiltre: ['x/'] }
    expect('yolFiltresi' in yazimHatali).toBe(false)
    expect(dogrulaKayit(yazimHatali)).toEqual([mesaj('yolFiltre')])
  })

  it('izinli her alan kabul edilir: kimlik, eskiYer ve gorunenYuz karar vermez ama yazılabilir', () => {
    const tam = { ...kayit(A), kimlik: 'INV-X-1', eskiYer: 'pull_request', gorunenYuz: 'kanca satırı', yolFiltresi: ['x/'] }
    expect(dogrulaKayit(tam)).toEqual([])
    expect(Object.keys(tam).sort()).toEqual([...D.KAYIT_ALANLARI].sort())
  })

  it('iki bilinmeyen alan iki hata verir (sıra: kayıttaki alan sırası); başka kuraldan gelen hatalarla birlikte raporlanır', () => {
    const k = { ...kayit(A), yolFiltre: ['x/'], ekstra: 1 }
    expect(dogrulaKayit(k)).toEqual([mesaj('yolFiltre'), mesaj('ekstra')])
    expect(dogrulaKayit({ ...k, neden: 'kısa' })).toEqual([mesaj('yolFiltre'), mesaj('ekstra'), `${ON}neden en az 20 karakterlik gerekçe taşımalı`])
  })

  it('test yolu bozuk kayıtta alan denetimine inilmez (kayıt zaten tek hatayla reddedilir)', () => {
    expect(D.dogrula({ surum: 1, testler: [{ test: 'a.txt', yolFiltre: ['x/'] }] }, VAR)).toEqual(['testler[0] (a.txt): test yolu bir test dosyası olmalı'])
  })

  it.each(['dislan', 'yalniz'])('%s: PR listesinde bilinmeyen alan FIRLATIR (vitest başlamaz); taban ve değişen dosyalar hiç sorulmaz', (kip) => {
    const tabanOku = vi.fn(() => taban(A))
    const degisenOku = vi.fn(() => ['x'])
    const pr = { surum: 1, testler: [{ ...kayit(A), yolFiltre: ['x/'] }] }
    expect(() => D.ayar({ [KIP]: kip }, pr, { tabanOku, degisenOku, dosyaVarMi: VAR })).toThrow(`${LISTE_YOLU} GEÇERSİZ (1 hata): ${mesaj('yolFiltre')}`)
    expect(tabanOku).not.toHaveBeenCalled()
    expect(degisenOku).not.toHaveBeenCalled()
  })

  it('tam kip: liste HİÇ okunmaz, bilinmeyen alan orada da fırlatmaz (kapı hiçbir şeyi dışlamaz)', () => {
    expect(D.ayar({}, { surum: 1, testler: [{ ...kayit(A), yolFiltre: ['x/'] }] })).toStrictEqual({ kip: 'tam', exclude: [], include: null })
  })
})

describe('filtreEslesirMi — dizin öneki sınırı, tam eşitlik, takma yazımlar', () => {
  it.each<[string, string[], string, boolean]>([
    ['dizin öneki: altındaki dosya', ['a/b/'], 'a/b/c.ts', true],
    ['dizin öneki: derin dosya', ['a/b/'], 'a/b/c/d/e.ts', true],
    ['SINIR: `a/b/` öneki `a/bc` yolunu kapsamaz', ['a/b/'], 'a/bc', false],
    ['SINIR: `a/b/` öneki `a/bc/x.ts` yolunu kapsamaz', ['a/b/'], 'a/bc/x.ts', false],
    ['SINIR: `a/b/` öneki `a/b.ts` yolunu kapsamaz', ['a/b/'], 'a/b.ts', false],
    ['dizinin kendisi (öneksiz) kapsanmaz', ['a/b/'], 'a/b', false],
    ['tam dosya: eşitlik', ['a/b.ts'], 'a/b.ts', true],
    ['tam dosya: uzantılı kardeş uymaz', ['a/b.ts'], 'a/b.tsx', false],
    ['tam dosya: altına inen yol uymaz', ['a/b.ts'], 'a/b.ts/x', false],
    ['tam dosya: önek değil', ['a/b.ts'], 'a/b.ts.bak', false],
    ['takma yazım ./x/y', ['x/'], './x/y', true],
    ['takma yazım x//y', ['x/'], 'x//y', true],
    ['takma yazım z/../x/y', ['x/'], 'z/../x/y', true],
    ['takma yazım x/../z üst dizine çıkıp başka yere iner', ['x/'], 'x/../z', false],
    ['ters eğik çizgi', ['x/'], 'x\\y', true],
    ['büyük/küçük harf duyarlı', ['x/'], 'X/y', false],
    ['benzer önek', ['x/'], 'xx/y', false],
    ['birden çok süzgeç: ikincisi uyar', ['x/', 'y.cjs'], 'y.cjs', true],
    ['birden çok süzgeç: hiçbiri uymaz', ['x/', 'y.cjs'], 'z/y.cjs', false],
    ['boş süzgeç hiçbir şeyi kapsamaz', [], 'x/a', false],
    ['kök dosyası tam eşitlik', ['.mcp.json'], '.mcp.json', true],
    ['nokta ile başlayan dizin', ['.githooks/'], '.githooks/lib/doc-scope.cjs', true],
  ])('%s', (_ad, filtre, yol, beklenen) => {
    expect(D.filtreEslesirMi(filtre, yol)).toBe(beklenen)
  })
})

describe('YOL SÜZGECİ — dislan: süzgece uyan PR testi kapıda KALIR, uymayan çıkar', () => {
  it.each<[string, string[], boolean]>([
    ['süzgeç dizinindeki dosya', ['x/a.ts'], true],
    ['süzgeç dizininin derin dosyası', ['x/b/c/d.ts'], true],
    ['tam dosya süzgeci', ['tek.cjs'], true],
    ['ilgisiz dosya', ['y/a.ts'], false],
    ['hiç değişiklik yok', [], false],
    ['biri uyar, biri uymaz: BİRİ yeter', ['y/a.ts', 'x/z.md'], true],
    ['çok ilgisiz dosya ve bir uyan', ['a/1', 'b/2', 'c/3', 'tek.cjs'], true],
    ['dizin adı tek başına (önek `x/` değil)', ['x'], false],
    ['benzer önek (xx/)', ['xx/a.ts'], false],
    ['tam yolun uzantılı kardeşi', ['tek.cjs.bak'], false],
    ['tam yolun altı', ['tek.cjs/ek.ts'], false],
    ['büyük/küçük harf duyarlı', ['X/a.ts'], false],
    ['takma yazım ./x/a.ts', ['./x/a.ts'], true],
    ['takma yazım x//a.ts', ['x//a.ts'], true],
    ['takma yazım z/../x/a.ts', ['z/../x/a.ts'], true],
  ])('%s: değişen dosyalar sorulur (TAM bir kez); sonuç tam', (_ad, degisen, tutulur) => {
    const { sonuc, degisenOku } = dislanSuzgecli(degisen)
    expect(sonuc).toStrictEqual(tutulur ? TUTULAN : CIKAN)
    expect('uyari' in sonuc).toBe(false)
    expect(degisenOku).toHaveBeenCalledTimes(1)
    expect(degisenOku).toHaveBeenCalledWith()
  })

  it('süzgeçsiz kayıt eskisi gibi HER PR\'da dışlanır, değişen dosya ne olursa olsun (süzgeç yok → sorulmaz)', () => {
    for (const degisen of [[], ['x/a.ts'], ['y/a.ts'], null]) {
      const degisenOku = vi.fn(() => degisen)
      const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { tabanOku: () => taban(A, B), dosyaVarMi: VAR, degisenOku })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [A, B], include: null })
      expect(degisenOku).not.toHaveBeenCalled()
    }
  })

  it('karışık liste: süzgeçliler uyan dosyayla tutulur, süzgeçsizler dışlanır; sıra PR listesinin sırasıdır; PR\'ın YENİ kaydı hiçbir koşulda dışlanmaz', () => {
    const pr = liste(C, A, B)
    const tabanListe = suzgecliTaban([A, ['x/']], [B], [C, ['z/']])
    const kos = (degisen: string[]) => D.ayar({ [KIP]: 'dislan' }, pr, { tabanOku: () => tabanListe, dosyaVarMi: VAR, degisenOku: () => degisen })
    expect(kos(['y/q'])).toStrictEqual({ kip: 'dislan', exclude: [C, A, B], include: null })
    expect(kos(['x/q'])).toStrictEqual({ kip: 'dislan', exclude: [C, B], include: null, suzgeceTakilan: [A] })
    expect(kos(['x/q', 'z/q'])).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [C, A] })
    const yeni = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { tabanOku: () => suzgecliTaban([B]), dosyaVarMi: VAR, degisenOku: () => ['y/q'] })
    expect(yeni).toStrictEqual({ kip: 'dislan', exclude: [B], include: null }) // A tabanda YOK: kendi PR'ında dışlanmaz
  })

  describe('süzgeç PR kaydından DEĞİL TABAN kaydından okunur (PR kendi dışlamasını genişletemez)', () => {
    it('PR süzgeci GENİŞLETİRSE etkisizdir: PR\'ın eklediği y/ sayılmaz, test çıkar', () => {
      const { sonuc } = dislanSuzgecli(['y/a.ts'], { pr: { surum: 1, testler: [suzgecli(A, [...SUZGEC, 'y/'])] } })
      expect(sonuc).toStrictEqual(CIKAN)
    })

    it('PR süzgeci DARALTIRSA da tabandaki geçerlidir: x/ hâlâ tutar', () => {
      const { sonuc } = dislanSuzgecli(['x/a.ts'], { pr: { surum: 1, testler: [suzgecli(A, ['z/'])] } })
      expect(sonuc).toStrictEqual(TUTULAN)
    })

    it('PR süzgeci TÜMDEN SİLERSE (alan yok) tabandaki hâlâ tutar: süzgeci silmek kapıdan çıkarmaz', () => {
      const { sonuc } = dislanSuzgecli(['x/a.ts'], { pr: liste(A) })
      expect(sonuc).toStrictEqual(TUTULAN)
    })

    it('tabanda süzgeç YOKSA PR\'ın yazdığı süzgeç de etkisizdir: test her PR\'da çıkar ve değişen dosyalar sorulmaz', () => {
      const { sonuc, degisenOku } = dislanSuzgecli(['x/a.ts'], { pr: { surum: 1, testler: [suzgecli(A, ['x/'])] }, tabanListe: taban(A) })
      expect(sonuc).toStrictEqual(CIKAN)
      expect(degisenOku).not.toHaveBeenCalled()
    })
  })

  describe('değişen dosyalar OKUNAMADIYSA süzgeçli test dışlanmaz (güvenli taraf) ve uyarı döner', () => {
    it.each<[string, unknown]>([
      ['null', null],
      ['undefined', undefined],
      ['metin', 'x/a.ts'],
      ['nesne', { 0: 'x/a.ts' }],
      ['sayı', 0],
    ])('okuyucu %s döner', (_ad, d) => {
      const { sonuc } = dislanSuzgecli(d)
      expect(sonuc).toStrictEqual({ ...TUTULAN, uyari: expect.stringContaining('değişen dosyalar okunamadı') })
    })

    it('okuyucu FIRLATIRSA da aynı sonuç: dışlanmaz + uyarı (ayar fırlatmaz)', () => {
      const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A), { tabanOku: () => suzgecliTaban([A, SUZGEC]), dosyaVarMi: VAR, degisenOku: patlayan('degisenOku') })
      expect(sonuc).toStrictEqual({ ...TUTULAN, uyari: expect.stringContaining('değişen dosyalar okunamadı') })
    })

    it('süzgeçsiz kayıt okunamayan değişen dosyalardan ETKİLENMEZ: yine dışlanır, yalnız süzgeçli tutulur', () => {
      const { sonuc, degisenOku } = dislanSuzgecli(null, { pr: liste(A, B), tabanListe: suzgecliTaban([A, SUZGEC], [B]) })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A], uyari: expect.stringContaining('değişen dosyalar okunamadı') })
      expect(degisenOku).toHaveBeenCalledTimes(1)
    })

    it('uyarı metni TAM ve kaynağı söyler: ortam boşsa git diff + fetch-depth ipucu', () => {
      expect(dislanSuzgecli(null).sonuc.uyari).toBe(
        "değişen dosyalar okunamadı (git diff HEAD^1 HEAD; pull_request birleştirme commit'i ve fetch-depth >= 2 gerekir): yol süzgeçli testler DIŞLANMADI, PR kapısında koşar (güvenli taraf)",
      )
    })

    it("ortam değişkeni DOLUYSA uyarı onu adıyla ve yolu JSON kaçışlı söyler (git'ten bahsetmez); satır sonu enjekte edemez", () => {
      expect(dislanSuzgecli(null, { env: { [DEGISEN_ENV]: '/x/d.txt' } }).sonuc.uyari).toBe(
        'değişen dosyalar okunamadı (VENTHUB_DUNYA_DEGISEN_DOSYALAR="/x/d.txt"): yol süzgeçli testler DIŞLANMADI, PR kapısında koşar (güvenli taraf)',
      )
      const kotu = dislanSuzgecli(null, { env: { [DEGISEN_ENV]: 'a\n::error::sahte\nb' } }).sonuc.uyari as string
      expect(kotu).not.toMatch(/[\r\n]/)
      expect(kotu).not.toContain('git diff')
    })

    it('ortam değişkeni BOŞ metinse "dolu değil" sayılır: uyarı git kaynağını söyler', () => {
      expect(dislanSuzgecli(null, { env: { [DEGISEN_ENV]: '' } }).sonuc.uyari).toContain('git diff HEAD^1 HEAD')
    })
  })

  describe('değişen dosyalar YALNIZ gerektiğinde ve TAM BİR kez sorulur', () => {
    it('iki süzgeçli kayıt: tek çağrı (önbellek), argümansız', () => {
      const { sonuc, degisenOku } = dislanSuzgecli(['x/a.ts'], { pr: liste(A, B), tabanListe: suzgecliTaban([A, ['x/']], [B, ['y/']]) })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A] })
      expect(degisenOku).toHaveBeenCalledTimes(1)
    })

    it('süzgeçli kayıt tabanda YOK (PR\'ın yeni kaydı): sorulmaz', () => {
      const { sonuc, degisenOku } = dislanSuzgecli(['x/a.ts'], { pr: { surum: 1, testler: [suzgecli(A, ['x/'])] }, tabanListe: taban(B) })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [], include: null })
      expect(degisenOku).not.toHaveBeenCalled()
    })

    it('taban OKUNAMADIYSA önce taban uyarısı gelir: değişen dosyalar sorulmaz, hiçbir şey dışlanmaz, süzgeç anahtarı yok', () => {
      const degisenOku = vi.fn(() => ['y/a.ts'])
      const sonuc = D.ayar({ [KIP]: 'dislan' }, { surum: 1, testler: [suzgecli(A, SUZGEC)] }, { tabanOku: () => null, dosyaVarMi: VAR, degisenOku })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining('taban listesi okunamadı') })
      expect(degisenOku).not.toHaveBeenCalled()
    })
  })

  describe('tabandaki süzgeç GEÇERSİZSE test DIŞLANMAZ (güvenli taraf); uyarı yok, değişen dosyalar sorulmaz', () => {
    it.each<[string, unknown]>([
      ['boş dizi', []],
      ['dizi değil (metin)', 'x/'],
      ['null', null],
      ['nesne', {}],
      ['boş öğe', ['']],
      ['glob', ['x/*']],
      ['takma yazım', ['./x/']],
      ['çift eğik çizgi', ['x//']],
      ['üst dizin', ['..']],
      ['tekrar', ['x/', 'x/']],
      ['sayı öğe', [5]],
    ])('%s', (_ad, f) => {
      const { sonuc, degisenOku } = dislanSuzgecli(['y/a.ts'], { tabanListe: suzgecliTaban([A, f]) })
      expect(sonuc).toStrictEqual(TUTULAN)
      expect('uyari' in sonuc).toBe(false)
      expect(degisenOku).not.toHaveBeenCalled()
    })
  })

  describe('yalniz ve tam kiplerinde süzgeç YOKTUR', () => {
    const suzgecliPr: Liste = { surum: 1, testler: [suzgecli(A, SUZGEC), kayit(B)] }

    it('yalniz: listenin TAMAMI koşar; taban ve değişen dosyalar sorulmaz, git çağrılmaz, süzgeç anahtarı yok', () => {
      const git = gitTakmasi(patlayan('git'))
      const sonuc = D.ayar({ [KIP]: 'yalniz' }, suzgecliPr, { tabanOku: patlayan('tabanOku'), degisenOku: patlayan('degisenOku'), dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A, B] })
      expect(git.cagrilar).toEqual([])
    })

    it('tam: liste okunmaz, değişen dosyalar sorulmaz, git çağrılmaz', () => {
      const git = gitTakmasi(patlayan('git'))
      expect(D.ayar({}, patlayanListe(), { degisenOku: patlayan('degisenOku'), tabanOku: patlayan('tabanOku') })).toStrictEqual({ kip: 'tam', exclude: [], include: null })
      expect(git.cagrilar).toEqual([])
    })
  })

  describe('varsayılan değişen kaynağı: enjeksiyon yoksa `degisenYollariniOku(env)` (gerçek bağ)', () => {
    const tabanOku = () => suzgecliTaban([A, SUZGEC], [B])
    const dis = (env: Env = {}) => D.ayar({ [KIP]: 'dislan', ...env }, liste(A, B), { tabanOku, dosyaVarMi: VAR })

    it('git kolu: `git diff` modül kökünde, kabuksuz ve TAM seçeneklerle BİR kez çağrılır; uyan dosya → tutulur', () => {
      const git = gitTakmasi(() => 'x/a.ts\0')
      expect(dis()).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A] })
      expect(git.cagrilar).toStrictEqual([['git', GIT_DEGISEN_ARGS, gitDegisenSecenek(D.KOK)]])
    })

    it('git kolu: uymayan dosya → süzgeçli çıkar', () => {
      gitTakmasi(() => 'y/b.ts\0')
      expect(dis()).toStrictEqual({ kip: 'dislan', exclude: [A, B], include: null })
    })

    it('git kolu iki süzgeçli kayıtta da TEK çağrı yapar', () => {
      const git = gitTakmasi(() => 'x/a.ts\0')
      const sonuc = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { tabanOku: () => suzgecliTaban([A, ['x/']], [B, ['y/']]), dosyaVarMi: VAR })
      expect(sonuc).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A] })
      expect(git.cagrilar).toHaveLength(1)
    })

    it('git fırlatır ya da okunamaz çıktı verirse: süzgeçli test DIŞLANMAZ + uyarı (FIRLATMAZ)', () => {
      const okunamaz: Array<[string, () => unknown]> = [
        ['git fırlatır', patlayan('git')],
        ["NUL'suz dolu çıktı", () => 'x/a.ts'],
        ['kesilmiş çıktı', () => 'x/a.ts\0eksik'],
        ['üst dizine çıkan yol', () => '../x\0'],
        ['undefined', () => undefined],
      ]
      for (const [ad, donus] of okunamaz) {
        const git = gitTakmasi(donus)
        expect(dis(), ad).toStrictEqual({
          kip: 'dislan',
          exclude: [B],
          include: null,
          suzgeceTakilan: [A],
          uyari: expect.stringContaining('git diff HEAD^1 HEAD'),
        })
        git.geriKoy()
      }
    })

    it('git BOŞ çıktı verirse (D1, fail-closed) OKUNAMAMIŞ sayılır: "değişiklik yok" ile "ölçülemedi" ayırt edilemez, süzgeçli test DIŞLANMAZ + uyarı', () => {
      const git = gitTakmasi(() => '')
      expect(dis()).toStrictEqual({
        kip: 'dislan',
        exclude: [B],
        include: null,
        suzgeceTakilan: [A],
        uyari: expect.stringContaining('git diff HEAD^1 HEAD'),
      })
      expect(git.cagrilar).toHaveLength(1)
    })

    it('ortam dosyası BOŞ ise (D1\'in karşı kolu) "değişiklik yok"tur: elle verilen girdi bilerek boştur, süzgeçli test çıkar, uyarı yok', () => {
      const git = gitTakmasi(patlayan('git'))
      expect(dis({ [DEGISEN_ENV]: dosyaYaz('bos-degisen.txt', '') })).toStrictEqual({ kip: 'dislan', exclude: [A, B], include: null })
      expect(git.cagrilar).toEqual([])
    })

    it('ortam değişkeni DOLUYSA değişen dosyalar o dosyadır; git ÇAĞRILMAZ', () => {
      const git = gitTakmasi(patlayan('git'))
      const dosya = dosyaYaz('degisen.txt', 'x/a.ts\0')
      expect(dis({ [DEGISEN_ENV]: dosya })).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A] })
      expect(git.cagrilar).toEqual([])
    })

    it("ortam değişkeni dolu ama dosya yok: git'e DÜŞÜLMEZ, süzgeçli test dışlanmaz, uyarı değişkeni söyler", () => {
      const git = gitTakmasi(() => 'y/b.ts\0') // git çağrılsaydı süzgeçli çıkardı
      const yok = path.join(dizin, 'yok.txt')
      expect(dis({ [DEGISEN_ENV]: yok })).toStrictEqual({
        kip: 'dislan',
        exclude: [B],
        include: null,
        suzgeceTakilan: [A],
        uyari: expect.stringContaining(`${DEGISEN_ENV}=${JSON.stringify(yok)}`),
      })
      expect(git.cagrilar).toEqual([])
    })

    it("ayar kendisine verilen ortamı değişen dosya okumaya İLETİR (process.env'i değil)", () => {
      process.env[DEGISEN_ENV] = dosyaYaz('baska-degisen.txt', 'x/a.ts\0')
      const git = gitTakmasi(() => 'y/b.ts\0')
      expect(dis()).toStrictEqual({ kip: 'dislan', exclude: [A, B], include: null })
      expect(git.cagrilar).toHaveLength(1)
    })
  })
})

describe('degisenYollariniOku — kaynak seçimi, ayrıştırma, her başarısızlık null', () => {
  it('git kolu: komut `git`, argümanlar literal, seçenekler TAM eşitlik (kabuk YOK, cwd = verilen kök, ilk ebeveyne göre, -z ve --no-renames)', () => {
    const { exec, cagrilar } = sahteExec(() => 'a.ts\0b/c.ts\0')
    expect(D.degisenYollariniOku({}, KOK_SAHTE, exec)).toEqual(['a.ts', 'b/c.ts'])
    expect(cagrilar).toStrictEqual([['git', GIT_DEGISEN_ARGS, gitDegisenSecenek(KOK_SAHTE)]])
  })

  it('kök verilmezse modülün kökü (KOK); execFn verilmezse child_process.execFileSync; env verilmezse process.env', () => {
    const { exec, cagrilar } = sahteExec(() => 'a.ts\0')
    expect(D.degisenYollariniOku({}, undefined, exec)).toEqual(['a.ts'])
    expect(cagrilar[0][2]).toStrictEqual(gitDegisenSecenek(D.KOK))
    const git = gitTakmasi(() => 'b.ts\0')
    expect(D.degisenYollariniOku({})).toEqual(['b.ts'])
    expect(git.cagrilar).toHaveLength(1)
    process.env[DEGISEN_ENV] = dosyaYaz('d.txt', 'c.ts\0')
    const git2 = gitTakmasi(patlayan('git'))
    expect(D.degisenYollariniOku(undefined, KOK_SAHTE, patlayan('git'))).toEqual(['c.ts'])
    expect(git2.cagrilar).toEqual([])
  })

  it.each<[string, string, string[] | null]>([
    ['tek yol', 'a.ts\0', ['a.ts']],
    ['iki yol', 'a.ts\0b/c.ts\0', ['a.ts', 'b/c.ts']],
    ['BOŞ çıktı = ölçülemedi (D1, fail-closed: "değişiklik yok" ile ayırt edilemez)', '', null],
    ['yeni satır içeren ad NUL kipinde BÖLÜNMEZ', 'a\nb.ts\0', ['a\nb.ts']],
    ['boşluk içeren ad', 'a b/c d.ts\0', ['a b/c d.ts']],
    ['takma yazım özüne iner', './a//b.ts\0', ['a/b.ts']],
    ['ters eğik çizgi eğik çizgiye döner', 'a\\b.ts\0', ['a/b.ts']],
    ['`..` ile BAŞLAYAN ama üst dizin olmayan ad geçerli', '..gizli/x\0', ['..gizli/x']],
    ['KESİLMİŞ çıktı (son NUL yok)', 'a.ts\0b/c', null],
    ["NUL'suz dolu çıktı (-z düşmüş ya da kesilmiş)", 'a.ts', null],
    ["NUL'suz satır ayraçlı dolu çıktı git kolunda KABUL EDİLMEZ", 'a.ts\nb.ts\n', null],
    ['boş öğe (çift NUL)', 'a.ts\0\0', null],
    ['yalnız NUL', '\0', null],
    ['üst dizine çıkış (..)', 'a.ts\0../x\0', null],
    ['normalleşince üst dizine çıkış', 'a/../../x\0', null],
    ['yalnız ..', '..\0', null],
    ['köke indirgenen yol (a/..)', 'a/..\0', null],
    ['nokta', '.\0', null],
    ['mutlak yol', '/etc/x\0', null],
    ['sürücü harfli yol', 'C:/x\0', null],
    ['sürücü harfli ters eğik çizgili yol', 'C:\\x\0', null],
  ])('git kolu: %s', (_ad, cikti, beklenen) => {
    expect(D.degisenYollariniOku({}, KOK_SAHTE, () => cikti)).toEqual(beklenen)
  })

  it('çok sayıda yol (5000) kesintisiz ayrıştırılır ve sırası korunur', () => {
    const yollar = Array.from({ length: 5000 }, (_x, i) => `d${i % 7}/f${i}.ts`)
    expect(D.degisenYollariniOku({}, KOK_SAHTE, () => `${yollar.join('\0')}\0`)).toEqual(yollar)
  })

  it.each<[string, string, string[] | null]>([
    ['NUL ayraçlı', 'a.ts\0b/c.ts\0', ['a.ts', 'b/c.ts']],
    ['LF ayraçlı', 'a.ts\nb/c.ts\n', ['a.ts', 'b/c.ts']],
    ['CRLF ayraçlı', 'a.ts\r\nb/c.ts\r\n', ['a.ts', 'b/c.ts']],
    ['son satır sonu yok', 'a.ts\nb/c.ts', ['a.ts', 'b/c.ts']],
    ['boş satırlar atlanır', 'a.ts\n\n\nb.ts\n', ['a.ts', 'b.ts']],
    ['tek yol', 'a.ts', ['a.ts']],
    ['boş dosya = değişiklik yok', '', []],
    ['yalnız satır sonu = değişiklik yok', '\n', []],
    ['NUL kipinde kesilmiş', 'a.ts\0b', null],
    ['LF kipinde üst dizin', 'a.ts\n../x\n', null],
    ['LF kipinde mutlak yol', '/x\n', null],
    ['LF kipinde takma yazım özüne iner', './a/./b.ts\n', ['a/b.ts']],
  ])('ortam dosyası: %s', (_ad, icerik, beklenen) => {
    const { exec, cagrilar } = sahteExec(patlayan('git'))
    expect(D.degisenYollariniOku({ [DEGISEN_ENV]: dosyaYaz('degisen.txt', icerik) }, KOK_SAHTE, exec)).toEqual(beklenen)
    expect(cagrilar).toEqual([])
  })

  it('ortam dolu ama dosya YOK ya da bir DİZİN: null ve git ÇAĞRILMAZ (okunamayan istenen kaynağın yerini başka kaynak almaz)', () => {
    const { exec, cagrilar } = sahteExec(() => 'a.ts\0')
    expect(D.degisenYollariniOku({ [DEGISEN_ENV]: path.join(dizin, 'yok.txt') }, KOK_SAHTE, exec)).toBeNull()
    expect(D.degisenYollariniOku({ [DEGISEN_ENV]: dizin }, KOK_SAHTE, exec)).toBeNull()
    expect(cagrilar).toEqual([])
  })

  it('ortam yolu BOŞ metinse git kolu kullanılır', () => {
    const { exec, cagrilar } = sahteExec(() => 'a.ts\0')
    expect(D.degisenYollariniOku({ [DEGISEN_ENV]: '' }, KOK_SAHTE, exec)).toEqual(['a.ts'])
    expect(cagrilar).toHaveLength(1)
  })

  it.each<[string, ExecFn]>([
    [
      'git yok (ENOENT)',
      () => {
        throw Object.assign(new Error('spawn git ENOENT'), { code: 'ENOENT' })
      },
    ],
    [
      'HEAD^1 yok, sığ klon (çıkış 128)',
      () => {
        throw Object.assign(new Error('Command failed: git diff'), { status: 128 })
      },
    ],
    [
      'zaman aşımı',
      () => {
        throw Object.assign(new Error('spawnSync git ETIMEDOUT'), { code: 'ETIMEDOUT' })
      },
    ],
    [
      'çıktı tampon sınırını aştı (ENOBUFS)',
      () => {
        throw Object.assign(new Error('spawnSync git ENOBUFS'), { code: 'ENOBUFS' })
      },
    ],
    [
      'Error olmayan değer fırlatılır',
      () => {
        throw 'metin hata'
      },
    ],
    ['undefined döner', () => undefined],
  ])('git kolu: %s → FIRLATMAZ, null döner', (_ad, exec) => {
    expect(() => D.degisenYollariniOku({}, KOK_SAHTE, exec)).not.toThrow()
    expect(D.degisenYollariniOku({}, KOK_SAHTE, exec)).toBeNull()
  })
})

describe('ozetSatiri — `dislan` günlük satırı: dışlanan / tutulan / değişen (bağımsız denetim Ö4)', () => {
  const sonuc = (exclude: string[], suzgeceTakilan?: string[]): Ayar => ({ kip: 'dislan', exclude, include: null, ...(suzgeceTakilan ? { suzgeceTakilan } : {}) })

  it.each<[string, Ayar, unknown, string]>([
    ['üç dışlanan, tutulan yok, 17 değişen', sonuc([A, B, C]), Array.from({ length: 17 }, (_x, i) => `d/${i}.ts`), 'dışlanan=3 tutulan=0 değişen=17'],
    ['bir dışlanan, iki tutulan, beş değişen', sonuc([B], [A, C]), ['a', 'b', 'c', 'd', 'e'], 'dışlanan=1 tutulan=2 değişen=5'],
    ['hiçbir şey dışlanmadı (taban okunamadı), değişen sayısı yine görünür', sonuc([]), ['a'], 'dışlanan=0 tutulan=0 değişen=1'],
    ['değişen dosya yok ([]): 0 yazılır, "?" değil', sonuc([A, B]), [], 'dışlanan=2 tutulan=0 değişen=0'],
    ['okuyucu null döndü', sonuc([A], [B]), null, 'dışlanan=1 tutulan=1 değişen=?'],
    ['okuyucu undefined döndü', sonuc([A]), undefined, 'dışlanan=1 tutulan=0 değişen=?'],
    ['okuyucu dizi olmayan değer döndü', sonuc([A]), 'x/a.ts', 'dışlanan=1 tutulan=0 değişen=?'],
  ])('%s', (_ad, s, degisen, beklenen) => {
    const degisenOku = vi.fn(() => degisen)
    expect(D.ozetSatiri({}, s, degisenOku)).toBe(beklenen)
    expect(degisenOku).toHaveBeenCalledTimes(1)
  })

  it('okuyucu FIRLATIRSA satır yine üretilir ("?"): özet satırı yapılandırma yüklemesini düşürmez', () => {
    expect(D.ozetSatiri({}, sonuc([A, B], [C]), patlayan('degisenOku'))).toBe('dışlanan=2 tutulan=1 değişen=?')
  })

  it.each([
    ['tam', { kip: 'tam', exclude: [], include: null }],
    ['yalniz', { kip: 'yalniz', exclude: [], include: [A, B] }],
    ['sonuç null', null],
    ['sonuç undefined', undefined],
  ])('%s: satır YOK (null) ve değişen dosyalar sorulmaz', (_ad, s) => {
    const degisenOku = vi.fn(() => ['x'])
    expect(D.ozetSatiri({}, s, degisenOku)).toBeNull()
    expect(degisenOku).not.toHaveBeenCalled()
  })

  it('satır tek satırdır ve satır sonu içermez (günlükte iş akışı komutu enjekte edilemez)', () => {
    const s = D.ozetSatiri({}, sonuc([A], [B]), () => ['a\n::error::sahte'])
    expect(s).toBe('dışlanan=1 tutulan=1 değişen=1')
    expect(s).not.toMatch(/[\r\n]/)
  })

  it('varsayılan okuyucu: ortam dosyası doluysa o dosya sayılır (git ÇAĞRILMAZ); satırın sayısı ayar() ile aynı kaynaktan gelir', () => {
    const git = gitTakmasi(patlayan('git'))
    const dosya = dosyaYaz('ozet-degisen.txt', 'x/a.ts\0y/b.ts\0z/c.ts\0')
    expect(D.ozetSatiri({ [DEGISEN_ENV]: dosya }, sonuc([A]))).toBe('dışlanan=1 tutulan=0 değişen=3')
    expect(git.cagrilar).toEqual([])
  })

  it('varsayılan okuyucu: ortam boşsa `git diff HEAD^1 HEAD` TAM BİR kez, literal argümanlarla çağrılır', () => {
    const git = gitTakmasi(() => 'a.ts\0b.ts\0')
    expect(D.ozetSatiri({}, sonuc([A]))).toBe('dışlanan=1 tutulan=0 değişen=2')
    expect(git.cagrilar).toStrictEqual([['git', GIT_DEGISEN_ARGS, gitDegisenSecenek(D.KOK)]])
  })

  it('varsayılan okuyucu: okunamayan kaynak (dosya yok, boş git çıktısı, git fırlatır) "?" yazar ve FIRLATMAZ', () => {
    gitTakmasi(patlayan('git'))
    expect(D.ozetSatiri({ [DEGISEN_ENV]: path.join(dizin, 'yok.txt') }, sonuc([A]))).toBe('dışlanan=1 tutulan=0 değişen=?')
    expect(D.ozetSatiri({}, sonuc([A]))).toBe('dışlanan=1 tutulan=0 değişen=?')
    gitTakmasi(() => '')
    expect(D.ozetSatiri({}, sonuc([A]))).toBe('dışlanan=1 tutulan=0 değişen=?')
  })

  it('ayar() sonucunun GERÇEK biçimiyle çalışır: süzgeçle kalan test M\'ye, dışlananlar N\'ye yansır', () => {
    const a = D.ayar({ [KIP]: 'dislan' }, liste(A, B), { tabanOku: () => suzgecliTaban([A, ['x/']], [B]), dosyaVarMi: VAR, degisenOku: () => ['x/a.ts', 'q'] })
    expect(D.ozetSatiri({}, a, () => ['x/a.ts', 'q'])).toBe('dışlanan=1 tutulan=1 değişen=2')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// SABOTAJ (ALT-38i): süzgeç mantığı KAYNAKTA bozulur ve yukarıdaki sözleşmenin kırmızı verdiği ölçülür. Her kol bir mutasyondur: modülün kaynağı
// `eski` → `yeni` değişimiyle geçici bir depoya yazılır ve YÜKLENİR; senaryo gerçek modülde beklenen sonucu verir, bozuk modülde VERMEZ. `eski` kaynakta
// TAM BİR kez bulunmak zorundadır: kaynak yeniden yazılır da hedef kaybolursa kol sessizce yeşil kalmaz, KIRMIZI olur ve güncellenmeyi ister.
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('SABOTAJ — süzgeç mantığı bozulunca sözleşme KIRMIZI verir', () => {
  interface Senaryo {
    calistir: (m: Modul) => unknown
    beklenen: unknown
  }
  const dis = (m: Modul, pr: Liste, tabanListe: unknown, degisen: unknown) =>
    m.ayar({ [KIP]: 'dislan' }, pr, { tabanOku: () => tabanListe, dosyaVarMi: VAR, degisenOku: () => degisen })

  const SENARYO: Record<string, Senaryo> = {
    'süzgeç TABANDAN okunur (PR genişletemez)': {
      calistir: (m) => dis(m, { surum: 1, testler: [suzgecli(A, ['y/'])] }, suzgecliTaban([A, ['x/']]), ['y/a.ts']),
      beklenen: CIKAN,
    },
    'okunamayan değişen dosyalar testi TUTAR': {
      calistir: (m) => dis(m, liste(A), suzgecliTaban([A, ['x/']]), null),
      beklenen: { ...TUTULAN, uyari: expect.stringContaining('değişen dosyalar okunamadı') },
    },
    'dizin öneki sınırı (a/b/ → a/bc uymaz)': {
      calistir: (m) => dis(m, liste(A), suzgecliTaban([A, ['a/b/']]), ['a/bc/x.ts']),
      beklenen: CIKAN,
    },
    'tabandaki geçersiz süzgeç testi TUTAR': {
      calistir: (m) => dis(m, liste(A), suzgecliTaban([A, []]), ['y/a.ts']),
      beklenen: TUTULAN,
    },
    'BİRİ uyarsa yeter': {
      calistir: (m) => dis(m, liste(A), suzgecliTaban([A, ['x/']]), ['y/b.ts', 'x/a.ts']),
      beklenen: TUTULAN,
    },
    'süzgeç yolunun TÜRÜ denetlenir (dizin `/`sız yazılamaz)': {
      calistir: (m) => m.dogrula({ surum: 1, testler: [suzgecli(A, ['d'])] }, (yol, dizinMi) => dizinMi === undefined || (dizinMi ? yol === 'd' : yol === 'f')),
      beklenen: [expect.stringContaining('türü uyuşmuyor')],
    },
    'bilinmeyen alan (yazım hatası) reddedilir': {
      calistir: (m) => m.dogrula({ surum: 1, testler: [{ ...kayit(A), yolFiltre: ['x/'] }] }, VAR),
      beklenen: [expect.stringContaining('bilinmeyen alan "yolFiltre"')],
    },
    'git BOŞ çıktı okunamamış sayılır (fail-closed)': {
      calistir: (m) => m.degisenYollariniOku({}, KOK_SAHTE, () => ''),
      beklenen: null,
    },
  }

  /** Gerçek modülün kaynağını `eski` → `yeni` ile bozar, geçici bir depoya yazıp yükler. `eski` kaynakta tam bir kez bulunmalı. */
  function bozukModul(eski: string, yeni: string, ad: string): Modul {
    const kaynak = readFileSync(MODUL_YOLU, 'utf8').replace(/\r\n/g, '\n')
    expect(kaynak.split(eski).length - 1, `sabotaj hedefi kaynakta TAM BİR kez bulunmalı (kaynak yeniden yazıldıysa kol güncellenmeli): ${eski}`).toBe(1)
    const yol = path.join(dizin, 'bozuk', ad, 'scripts/ci/dunya-durumu.cjs')
    mkdirSync(path.dirname(yol), { recursive: true })
    writeFileSync(yol, kaynak.replace(eski, () => yeni))
    return require_(yol) as Modul
  }
  const gozle = (m: Modul, s: Senaryo): unknown => {
    try {
      return s.calistir(m)
    } catch (e) {
      return { firladi: e instanceof Error ? e.message : String(e) }
    }
  }

  it.each(Object.keys(SENARYO))('senaryo GERÇEK modülde yeşil: %s', (ad) => {
    expect(gozle(D, SENARYO[ad])).toEqual(SENARYO[ad].beklenen)
  })

  it.each<[string, string, string, string]>([
    ['PR kaydından oku (tabandan değil)', 'const k = tabanKaydi.get(y);', 'const k = tabanKaydi.get(y) && pr.testler.find((t) => t.test === y);', 'süzgeç TABANDAN okunur (PR genişletemez)'],
    [
      'değişen dosyalar okunamazsa DIŞLA (fail-open)',
      'takilan.push(y);\n        degisenUyari = degisenUyarisi(env);',
      'dislanan.push(y);\n        degisenUyari = degisenUyarisi(env);',
      'okunamayan değişen dosyalar testi TUTAR',
    ],
    ['önek sınırını kaldır (a/b/ → a/bc uyar)', 'o.startsWith(g)', 'o.startsWith(g.slice(0, -1))', 'dizin öneki sınırı (a/b/ → a/bc uymaz)'],
    [
      'tabandaki geçersiz süzgeci yok say (dışla)',
      'takilan.push(y); // tabandaki süzgeç geçersiz: koşar',
      'dislanan.push(y); // tabandaki süzgeç geçersiz: koşar',
      'tabandaki geçersiz süzgeç testi TUTAR',
    ],
    ['HEPSİ uymalı (biri yetmez)', 'd.some((yol) => filtreEslesirMi(k.yolFiltresi, yol))', 'd.every((yol) => filtreEslesirMi(k.yolFiltresi, yol))', 'BİRİ uyarsa yeter'],
    ['tür denetimini kaldır', "dosyaVarMi(govde, g.endsWith('/'))", 'dosyaVarMi(govde)', 'süzgeç yolunun TÜRÜ denetlenir (dizin `/`sız yazılamaz)'],
    ['bilinmeyen alanı kabul et (kayıt şekli açık)', 'if (!KAYIT_ALANLARI.includes(alan)) {', 'if (false) {', 'bilinmeyen alan (yazım hatası) reddedilir'],
    ['git boş çıktısını "değişiklik yok" say (fail-open)', 'if (!yol) return null; // git kolu: boş çıktı', '// git kolu: boş çıktı', 'git BOŞ çıktı okunamamış sayılır (fail-closed)'],
  ])('KIRMIZI: %s', (ad, eski, yeni, senaryoAdi) => {
    const bozuk = bozukModul(eski, yeni, ad.replace(/[^a-z0-9]+/gi, '-'))
    expect(gozle(bozuk, SENARYO[senaryoAdi]), `sabotaj "${ad}" senaryo "${senaryoAdi}" tarafından YAKALANMADI`).not.toEqual(SENARYO[senaryoAdi].beklenen)
  })
})

describe('komut satırı — `node scripts/ci/dunya-durumu.cjs` (gerçek alt süreç, geçici dizin, git YOK)', () => {
  let kok = ''
  let bosPath = ''

  /** Modülün kopyası geçici bir deponun `scripts/ci/` altına konur: KOK o dizin olur, liste ve dosya varlığı tamamen bu testin elinde. */
  function agacKur(kayitlar: unknown, dosyalar: string[]) {
    kok = path.join(dizin, 'depo')
    mkdirSync(path.join(kok, 'scripts/ci'), { recursive: true })
    copyFileSync(MODUL_YOLU, path.join(kok, 'scripts/ci/dunya-durumu.cjs'))
    writeFileSync(path.join(kok, LISTE_YOLU), typeof kayitlar === 'string' ? kayitlar : JSON.stringify(kayitlar))
    for (const d of dosyalar) {
      mkdirSync(path.dirname(path.join(kok, d)), { recursive: true })
      writeFileSync(path.join(kok, d), '')
    }
    bosPath = path.join(dizin, 'bos-path')
    mkdirSync(bosPath, { recursive: true })
  }
  /** TEMİZ ortam; PATH boş dizin (gerçek `git` bulunamaz: taban git kolu deterministik olarak okunamaz). */
  function kos(args: string[], env: Record<string, string> = {}) {
    return spawnSync(process.execPath, [path.join(kok, 'scripts/ci/dunya-durumu.cjs'), ...args], {
      encoding: 'utf8',
      cwd: kok,
      timeout: 20_000,
      env: { NODE_ENV: 'test', ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}), PATH: bosPath, ...env },
    })
  }
  const tabanDosyasi = (...yollar: string[]) => dosyaYaz('taban.json', JSON.stringify(taban(...yollar)))

  beforeEach(() => agacKur(liste(A, B), [A, B]))

  it.each<[string, { kip: string; exclude: string[]; include: string[] | null }]>([
    ['tam', { kip: 'tam', exclude: [], include: null }],
    ['yalniz', { kip: 'yalniz', exclude: [], include: [A, B] }],
  ])('--kip %s --json: çıkış 0, JSON TAM, stderr boş', (kip, beklenen) => {
    const r = kos(['--kip', kip, '--json'])
    expect(r.status, r.stderr).toBe(0)
    expect(JSON.parse(r.stdout)).toStrictEqual(beklenen)
    expect(r.stderr).toBe('')
  })

  it('--kip dislan --json + taban dosyası (ortam değişkeni --kip ile birlikte İLETİLİR): kesişim, uyarı yok, çıkış 0', () => {
    const r = kos(['--kip', 'dislan', '--json'], { [TABAN_ENV]: tabanDosyasi(A) })
    expect(r.status, r.stderr).toBe(0)
    expect(JSON.parse(r.stdout)).toStrictEqual({ kip: 'dislan', exclude: [A], include: null })
    expect(r.stderr).toBe('')
  })

  it("--kip dislan, taban okunamıyor (değişken yok, git yok): çıkış 0, hiçbir şey dışlanmaz, uyarı HEM stderr'de HEM JSON'da", () => {
    const r = kos(['--kip', 'dislan', '--json'])
    expect(r.status, r.stderr).toBe(0)
    const json = JSON.parse(r.stdout) as Ayar
    expect(json).toStrictEqual({ kip: 'dislan', exclude: [], include: null, uyari: expect.stringContaining('git show HEAD^1:') })
    expect(r.stderr).toBe(`[dunya-durumu] ${json.uyari}\n`)
  })

  it('--kip dislan, taban dosyası yok: uyarı değişkeni adıyla söyler, çıkış 0 (uyarı çıkış kodunu DEĞİŞTİRMEZ)', () => {
    const r = kos(['--kip', 'dislan'], { [TABAN_ENV]: path.join(dizin, 'yok.json') })
    expect(r.status, r.stderr).toBe(0)
    expect(r.stderr).toMatch(/^\[dunya-durumu\] taban listesi okunamadı ya da geçersiz \(VENTHUB_DUNYA_TABAN_LISTESI=".*yok\.json"\): hiçbir test dışlanmadı/)
    expect(r.stdout).toBe('kip=dislan dışarıda=0 yalnız=-\n')
  })

  it.each<[string, string[], string]>([
    ['tam', [], 'kip=tam dışarıda=0 yalnız=-\n'],
    ['yalniz', [], 'kip=yalniz dışarıda=0 yalnız=2\n'],
    ['dislan', [A, B], 'kip=dislan dışarıda=2 yalnız=-\n'],
    ['dislan', [B], 'kip=dislan dışarıda=1 yalnız=-\n'],
  ])('--kip %s taban=%j (JSON yok): düz özet satırı %j', (kip, tabanYollari, beklenen) => {
    const r = kos(['--kip', kip], tabanYollari.length ? { [TABAN_ENV]: tabanDosyasi(...tabanYollari) } : {})
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toBe(beklenen)
  })

  it('--kip verilmezse ortam değişkeni (VENTHUB_DUNYA_DURUMU) okunur; --kip verilirse ORTAMI ezer', () => {
    const ortamdan = kos(['--json'], { [KIP]: 'yalniz' })
    expect(JSON.parse(ortamdan.stdout)).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A, B] })
    const ezilen = kos(['--kip', 'tam', '--json'], { [KIP]: 'yalniz' })
    expect(JSON.parse(ezilen.stdout)).toStrictEqual({ kip: 'tam', exclude: [], include: null })
    expect(JSON.parse(kos(['--json']).stdout)).toStrictEqual({ kip: 'tam', exclude: [], include: null })
  })

  it('geçersiz kip: çıkış 1, stderr kip hatasını söyler, stdout boş (yığın izi değil, tek satır)', () => {
    const r = kos(['--kip', 'hepsi'])
    expect(r.status).toBe(1)
    expect(r.stderr).toBe('[dunya-durumu] VENTHUB_DUNYA_DURUMU="hepsi" geçersiz (boş | tam | dislan | yalniz); kapı sessizce kalkmasın diye durduruldu\n')
    expect(r.stdout).toBe('')
  })

  it.each(['tam', 'dislan', 'yalniz'])('geçersiz liste (DISLANAMAZ kaydı): --kip %s çıkış 1 (liste her kipte denetlenir), stderr hatayı söyler, stdout boş', (kip) => {
    const koruyucu = 'src/__tests__/conformance/test-kosu-kapsami.test.ts'
    agacKur(liste(A, koruyucu), [A, B, koruyucu])
    const r = kos(['--kip', kip, '--json'], { [TABAN_ENV]: tabanDosyasi(A, koruyucu) })
    expect(r.status).toBe(1)
    expect(r.stderr).toBe(`[dunya-durumu] liste GEÇERSİZ:\n  - testler[1] (${koruyucu}): ${KORUYUCU_MESAJI}\n`)
    expect(r.stdout).toBe('')
  })

  it('liste dosyası bozuk JSON: çıkış 1, tek satır [dunya-durumu] hatası (yakalanmamış istisna değil)', () => {
    agacKur('{"surum": 1,', [])
    const r = kos(['--kip', 'dislan'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/^\[dunya-durumu\] .+\n$/)
    expect(r.stderr.trim().split('\n')).toHaveLength(1)
    expect(r.stdout).toBe('')
  })

  it('liste dosyası yok: çıkış 1, tek satır hata', () => {
    agacKur(liste(A), [A])
    rmSync(path.join(kok, LISTE_YOLU))
    const r = kos(['--kip', 'tam'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/^\[dunya-durumu\] .*dunya-durumu-testleri\.json/)
    expect(r.stdout).toBe('')
  })

  describe('yol süzgeci (ALT-38i): değişen dosyalar ortam dosyasıyla verilir, git YOK', () => {
    /** A süzgeçli (x/), B süzgeçsiz; x/a.txt diskte (süzgeç yolu GERÇEKTEN var: yetim süzgeç liste hatasıdır). */
    const suzgecliAgac = () => agacKur({ surum: 1, testler: [suzgecli(A, ['x/']), kayit(B)] }, [A, B, 'x/a.txt'])
    const tabanSuzgecli = () => dosyaYaz('taban.json', JSON.stringify(suzgecliTaban([A, ['x/']], [B])))
    const degisenDosyasi = (icerik: string) => dosyaYaz('degisen.txt', icerik)

    it('süzgece UYAN değişen dosya: süzgeçli test kapıda KALIR (JSON: exclude yalnız süzgeçsiz, suzgeceTakilan dolu), uyarı yok, çıkış 0', () => {
      suzgecliAgac()
      const r = kos(['--kip', 'dislan', '--json'], { [TABAN_ENV]: tabanSuzgecli(), [DEGISEN_ENV]: degisenDosyasi('x/a.txt\0') })
      expect(r.status, r.stderr).toBe(0)
      expect(JSON.parse(r.stdout)).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A] })
      expect(r.stderr).toBe('')
    })

    it('süzgece UYMAYAN değişen dosya: süzgeçli test DIŞARI çıkar (süzgeç anahtarı hiç yazılmaz), uyarı yok, çıkış 0', () => {
      suzgecliAgac()
      const r = kos(['--kip', 'dislan', '--json'], { [TABAN_ENV]: tabanSuzgecli(), [DEGISEN_ENV]: degisenDosyasi('y/b.txt\0') })
      expect(r.status, r.stderr).toBe(0)
      expect(JSON.parse(r.stdout)).toStrictEqual({ kip: 'dislan', exclude: [A, B], include: null })
      expect(r.stderr).toBe('')
    })

    it.each<[string, string, string]>([
      ['uyan', 'x/a.txt\0', 'kip=dislan dışarıda=1 yalnız=- suzgece-takilan=1\n'],
      ['uymayan', 'y/b.txt\0', 'kip=dislan dışarıda=2 yalnız=-\n'],
      ['satır ayraçlı (LF)', 'x/a.txt\n', 'kip=dislan dışarıda=1 yalnız=- suzgece-takilan=1\n'],
      ['satır ayraçlı (CRLF)', 'y/b.txt\r\n', 'kip=dislan dışarıda=2 yalnız=-\n'],
      ['boş dosya (değişiklik yok)', '', 'kip=dislan dışarıda=2 yalnız=-\n'],
    ])('düz özet satırı, değişen dosyalar %s', (_ad, icerik, beklenen) => {
      suzgecliAgac()
      const r = kos(['--kip', 'dislan'], { [TABAN_ENV]: tabanSuzgecli(), [DEGISEN_ENV]: degisenDosyasi(icerik) })
      expect(r.status, r.stderr).toBe(0)
      expect(r.stdout).toBe(beklenen)
    })

    it('değişen dosya listesi OKUNAMIYOR (ortam dolu, dosya yok): süzgeçli test dışlanmaz, uyarı HEM stderr\'de HEM JSON\'da, çıkış 0', () => {
      suzgecliAgac()
      const yok = path.join(dizin, 'yok-degisen.txt')
      const r = kos(['--kip', 'dislan', '--json'], { [TABAN_ENV]: tabanSuzgecli(), [DEGISEN_ENV]: yok })
      expect(r.status, r.stderr).toBe(0)
      const json = JSON.parse(r.stdout) as Ayar
      expect(json).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A], uyari: expect.stringContaining(`${DEGISEN_ENV}=${JSON.stringify(yok)}`) })
      expect(r.stderr).toBe(`[dunya-durumu] ${json.uyari}\n`)
    })

    it('ortam değişkeni YOK ve git YOK (PATH boş): süzgeçli test dışlanmaz, uyarı git diff kaynağını söyler, çıkış 0', () => {
      suzgecliAgac()
      const r = kos(['--kip', 'dislan', '--json'], { [TABAN_ENV]: tabanSuzgecli() })
      expect(r.status, r.stderr).toBe(0)
      const json = JSON.parse(r.stdout) as Ayar
      expect(json).toStrictEqual({ kip: 'dislan', exclude: [B], include: null, suzgeceTakilan: [A], uyari: expect.stringContaining('git diff HEAD^1 HEAD') })
      expect(r.stderr).toBe(`[dunya-durumu] ${json.uyari}\n`)
    })

    it('yalniz ve tam kiplerinde süzgeç YOK: değişen dosya ortamı verilse de listenin tamamı / hiçbiri dışlanmaz', () => {
      suzgecliAgac()
      const degisen = degisenDosyasi('y/b.txt\0')
      expect(JSON.parse(kos(['--kip', 'yalniz', '--json'], { [DEGISEN_ENV]: degisen }).stdout)).toStrictEqual({ kip: 'yalniz', exclude: [], include: [A, B] })
      expect(JSON.parse(kos(['--kip', 'tam', '--json'], { [DEGISEN_ENV]: degisen }).stdout)).toStrictEqual({ kip: 'tam', exclude: [], include: null })
    })

    it('listede GLOB süzgeç: her kipte çıkış 1, stderr hatayı söyler, stdout boş', () => {
      agacKur({ surum: 1, testler: [suzgecli(A, ['x/*'])] }, [A, 'x/a.txt'])
      for (const kip of ['tam', 'dislan', 'yalniz']) {
        const r = kos(['--kip', kip, '--json'], { [TABAN_ENV]: tabanDosyasi(A) })
        expect(r.status, kip).toBe(1)
        expect(r.stderr, kip).toBe(`[dunya-durumu] liste GEÇERSİZ:\n  - testler[0] (${A}): yolFiltresi "x/*": glob YASAK (dizin öneki "a/b/" ya da tam dosya yolu)\n`)
        expect(r.stdout, kip).toBe('')
      }
    })

    it('listede YETİM süzgeç (diskte olmayan dizin) ve TÜRÜ yanlış süzgeç (dizin `/`sız): çıkış 1', () => {
      agacKur({ surum: 1, testler: [suzgecli(A, ['olmayan/'])] }, [A])
      const yetim = kos(['--kip', 'dislan'], { [TABAN_ENV]: tabanDosyasi(A) })
      expect(yetim.status).toBe(1)
      expect(yetim.stderr).toContain('yolFiltresi "olmayan/": yol yok ya da türü uyuşmuyor')
      agacKur({ surum: 1, testler: [suzgecli(A, ['x'])] }, [A, 'x/a.txt'])
      const tur = kos(['--kip', 'dislan'], { [TABAN_ENV]: tabanDosyasi(A) })
      expect(tur.status).toBe(1)
      expect(tur.stderr).toContain('yolFiltresi "x": yol yok ya da türü uyuşmuyor')
    })
  })
})
