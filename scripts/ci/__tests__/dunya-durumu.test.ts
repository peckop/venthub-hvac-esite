// @vitest-environment node
//
// Saf Node birim testi: DOM ortamı yalnız maliyet. Ağ, gerçek `git` ve gerçek ev dizini YOK; yalnız komut satırı testi geçici
// dizinde (modülün kopyasıyla) alt süreç koşar ve o süreçte `git` BİLEREK bulunamaz (PATH boş dizin).
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
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
 *   8. KOMUT SATIRI: gerçek alt süreç, geçici dizin, `git` yok.
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
}
type Env = Record<string, string | undefined>
type ExecFn = (komut: string, args: string[], secenek: unknown) => unknown
interface Secenek {
  tabanOku?: () => unknown
  dosyaVarMi?: (yol: string) => boolean
}
interface Modul {
  KOK: string
  LISTE_YOLU: string
  ORTAM_ADI: string
  TABAN_LISTE_ORTAM: string
  KIPLER: string[]
  YENI_YERLER: string[]
  TEST_DESENI: RegExp
  DISLANAMAZ: readonly string[]
  ayar: (env?: Env, liste?: unknown, secenek?: Secenek) => Ayar
  dogrula: (liste: unknown, dosyaVarMi?: (yol: string) => boolean) => string[]
  listeyiOku: (kok?: string) => Liste
  tabanListesiniOku: (env?: Env, kok?: string, execFn?: ExecFn) => Liste | null
}
const D = require_(MODUL_YOLU) as Modul
/** Sahteleme yüzeyleri: modül bu işlevleri çağrı ANINDA nesneden okur, o yüzden atama yeter (edited-ayna.test.ts ile aynı desen). */
const fsYuzeyi = require_('node:fs') as { readFileSync: unknown }
const cpYuzeyi = require_('node:child_process') as { execFileSync: unknown }

const KIP = 'VENTHUB_DUNYA_DURUMU'
const TABAN_ENV = 'VENTHUB_DUNYA_TABAN_LISTESI'
const LISTE_YOLU = 'scripts/ci/dunya-durumu-testleri.json'
const GIT_ARGS = ['show', `HEAD^1:${LISTE_YOLU}`]
const gitSecenek = (kok: string) => ({ cwd: kok, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1048576, timeout: 10000 })
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
  ortamYedegi = { [KIP]: process.env[KIP], [TABAN_ENV]: process.env[TABAN_ENV] }
  delete process.env[KIP]
  delete process.env[TABAN_ENV]
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
  it('dışa açılan ad kümesi TAM: mevcut dokuz ad korunur, yenileri DISLANAMAZ + TABAN_LISTE_ORTAM + tabanListesiniOku', () => {
    expect(Object.keys(D).sort()).toEqual(
      ['DISLANAMAZ', 'KIPLER', 'KOK', 'LISTE_YOLU', 'ORTAM_ADI', 'TABAN_LISTE_ORTAM', 'TEST_DESENI', 'YENI_YERLER', 'ayar', 'dogrula', 'listeyiOku', 'tabanListesiniOku'].sort(),
    )
  })

  it('sabitler literal: kip değişkeni, taban değişkeni, liste yolu, kipler, depo kökü (sabit kendi kendini doğrulamasın)', () => {
    expect(D.ORTAM_ADI).toBe('VENTHUB_DUNYA_DURUMU')
    expect(D.TABAN_LISTE_ORTAM).toBe('VENTHUB_DUNYA_TABAN_LISTESI')
    expect(D.LISTE_YOLU).toBe('scripts/ci/dunya-durumu-testleri.json')
    expect(D.KIPLER).toEqual(['dislan', 'yalniz'])
    // `git show` bu dizinde koşar ve `dosyaVarMi` bu köke göre bakar: kök kayarsa taban sessizce başka yerden okunurdu
    expect(path.resolve(D.KOK)).toBe(KOK)
  })

  it('gerçek liste (diskteki) hata vermez: DISLANAMAZ ve kanonik yol kuralları bugünkü tek kaydı reddetmez', () => {
    expect(D.dogrula(D.listeyiOku())).toEqual([])
    expect(D.listeyiOku().testler.map((t) => t.test)).toContain(GERCEK_KAYIT)
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
    expect(kip === 'yalniz' ? sonuc.include : sonuc.exclude).toEqual([GERCEK_KAYIT])
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
    expect(D.ayar({ [KIP]: 'yalniz' })).toStrictEqual({ kip: 'yalniz', exclude: [], include: [GERCEK_KAYIT] })
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
})
