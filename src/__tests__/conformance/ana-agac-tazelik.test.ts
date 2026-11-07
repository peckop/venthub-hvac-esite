import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-ANA-AGAC-TAZE-1 · ANA AĞAÇ TAZELİĞİ (REC-345, karar 44, cetvel fleet-mechanism-standard §20.2).
 *
 * ⭐NİÇİN VAR: 2026-09-17'de ana ağaç origin/master'dan 50 commit gerideydi; kancalar, CLAUDE.md ve
 * .mcp.json ana ağaçtan yüklendiği için dört merge'lü düzenek hiçbir pencerede etkin değildi ve
 * hiçbir kapı görmedi. Bu dosya ölçümü ve güvenli ileri sarmayı kollar.
 *
 * ⭐DURUM ÜRETİLİR, VARSAYILMAZ (§25): her kol geçici bir çıplak "origin", ondan klonlanmış bir ana
 * ağaç ve ona bağlı bir worktree kurar. Makinenin gerçek deposuna dokunulmaz.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const tazelik = require_(path.join(KOK, 'scripts', 'hijyen', 'ana-agac-tazelik.cjs')) as {
  anaAgacYolu: (agac: string) => string
  olc: (agac: string) => { dal: string; geride: number; ileride: number; kirli: string[] }
  ileriSar: (agac: string) => { durum: string; geride?: number; sebep?: string }
  ayarYolunaDeger: (dosyalar: string[]) => boolean
  acilisSatiri: (agac: string) => string
  anaAgacSatiri: (s: { durum: string; geride?: number; sebep?: string }, ayar: boolean) => string
}

const GECICI: string[] = []
afterAll(() => {
  for (const d of GECICI) fs.rmSync(d, { recursive: true, force: true })
})

function g(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

/** origin (çıplak) + ana ağaç + worktree; ana ağaç `geride` commit geride bırakılır. */
function kurulum(geride: number): { ana: string; wt: string; kok: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'ana-agac-taze-'))
  GECICI.push(kok)
  const origin = path.join(kok, 'origin.git')
  const ana = path.join(kok, 'ana')
  const wt = path.join(kok, 'wt')
  g(kok, 'init', '--bare', '-b', 'master', origin)
  g(kok, 'clone', '-q', origin, ana)
  g(ana, 'checkout', '-q', '-B', 'master')
  fs.writeFileSync(path.join(ana, 'a.txt'), '0\n')
  fs.writeFileSync(path.join(ana, 'z.txt'), 'ilgisiz\n')
  g(ana, 'add', 'a.txt', 'z.txt')
  g(ana, 'commit', '-q', '-m', 'c0')
  g(ana, 'push', '-q', 'origin', 'master')
  g(ana, 'worktree', 'add', '-q', '-b', 'serit', wt, 'master')
  for (let i = 1; i <= geride; i++) {
    fs.writeFileSync(path.join(wt, 'a.txt'), `${i}\n`)
    g(wt, 'add', 'a.txt')
    g(wt, 'commit', '-q', '-m', `c${i}`)
  }
  if (geride > 0) g(wt, 'push', '-q', 'origin', 'serit:master')
  // Paylaşılan uzak ref'i worktree'den tazele — ana ağaç hiç fetch etmez (gerçek durum budur).
  g(wt, 'fetch', '-q', 'origin')
  return { ana, wt, kok }
}

/**
 * ⭐KOL SÜRESİ GENEL SINIRDAN AYRILDI (2026-09-18 ölçüldü, ikinci vaka).
 *
 * Bu dosyanın kolları GERÇEK git deposu kuruyor (bare origin + ana ağaç + worktree, commit,
 * push, fetch). Tek başına koşumda dosyanın tamamı 18 sn; tam konformans paketinde (aynı anda
 * ~237 dosya + docker yüklü) TEK KOL 34 sn sürdü ve `vitest.config.ts` içindeki genel
 * `testTimeout: 20000` sınırını aştı → kol KIRMIZI oldu. Aynı gün bir başka kol da (9 kol
 * içinden bir diğeri) aynı sebeple düşmüştü.
 *
 * ⛔GENEL SINIR YÜKSELTİLMEDİ: 20 sn bütün depo için doğru bir sınır ve onu yükseltmek gerçek
 * bir askıda kalmayı gizler. Süre yalnız GERÇEK GİT İŞİ yapan bu kollara verilir — kardeş
 * onarımların ikisiyle aynı sınıf: `ana-agac-tazelik.cjs` git zaman aşımı 15→60 sn (#1257) ve
 * `kanca-defter-tazelik` BÜTÇE kolunda ölçütün en iyi süreye çevrilmesi (#1260).
 * Kırılgan kapı, kırmızısına bakılmayan kapıdır.
 */
const GIT_SURE = 120_000

describe('INV-ANA-AGAC-TAZE-1 ana ağaç tazeliği', { timeout: GIT_SURE }, () => {
  it('worktree içinden ana ağacı bulur ve geride sayısını ağ olmadan ölçer', () => {
    const { ana, wt } = kurulum(3)
    expect(fs.realpathSync(tazelik.anaAgacYolu(wt))).toBe(fs.realpathSync(ana))
    const o = tazelik.olc(ana)
    expect(o).toMatchObject({ dal: 'master', geride: 3, ileride: 0 })
    expect(o.kirli).toEqual([])
  })

  it('temiz ağaç ileri sarılır ve sonra 0 geride ölçülür', () => {
    const { ana } = kurulum(2)
    expect(tazelik.ileriSar(ana)).toMatchObject({ durum: 'ilerlendi', geride: 2 })
    expect(tazelik.olc(ana).geride).toBe(0)
    expect(tazelik.ileriSar(ana)).toMatchObject({ durum: 'guncel' })
  })

  it('izlenmeyen dosya engel değildir (başka şeridin ekran görüntüsü vakası)', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'ekran.png'), 'x')
    expect(tazelik.ileriSar(ana).durum).toBe('ilerlendi')
    expect(fs.existsSync(path.join(ana, 'ekran.png'))).toBe(true)
  })

  it('(a) İLGİSİZ kirli izlenen dosya ileri sarmayı ENGELLEMEZ; yerel değişiklik korunur (#1468 vakası)', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'z.txt'), 'baska-seridin-yarim-isi\n')
    const s = tazelik.ileriSar(ana)
    expect(s.durum).toBe('ilerlendi')
    expect(tazelik.olc(ana).geride).toBe(0)
    expect(fs.readFileSync(path.join(ana, 'z.txt'), 'utf8')).toBe('baska-seridin-yarim-isi\n')
    expect(fs.readFileSync(path.join(ana, 'a.txt'), 'utf8').trim()).toBe('1')
  })

  it('(b) ÇAKIŞAN kirli dosya: git REDDEDER, değişiklik korunur, ağaç bozulmaz ve sebep yazılır', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'a.txt'), 'recep-in-yerel-satiri\n')
    const s = tazelik.ileriSar(ana)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/ff-only reddetti \(kirli: .*a\.txt/)
    expect(fs.readFileSync(path.join(ana, 'a.txt'), 'utf8')).toBe('recep-in-yerel-satiri\n')
    expect(tazelik.olc(ana).geride).toBe(1)
    expect(tazelik.acilisSatiri(ana)).toMatch(/ANA AGAC 1 COMMIT GERIDE/)
  })

  it('başka dal ya da fazladan yerel commit varsa DOKUNULMAZ', () => {
    const a = kurulum(1)
    g(a.ana, 'checkout', '-q', '-b', 'deneme')
    expect(tazelik.ileriSar(a.ana)).toMatchObject({ durum: 'engelli' })
    expect(tazelik.ileriSar(a.ana).sebep).toMatch(/deneme/)

    const b = kurulum(1)
    fs.writeFileSync(path.join(b.ana, 'b.txt'), 'yerel\n')
    g(b.ana, 'add', 'b.txt')
    g(b.ana, 'commit', '-q', '-m', 'yerel')
    const s = tazelik.ileriSar(b.ana)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/1 commit var/)
  })

  it('açılış satırı: güncelse BOŞ (sessizlik), gerideyse sayı + güvenli komut', () => {
    const guncel = kurulum(0)
    expect(tazelik.acilisSatiri(guncel.wt)).toBe('')
    const geride = kurulum(4)
    expect(tazelik.acilisSatiri(geride.wt)).toMatch(/ANA AGAC 4 COMMIT GERIDE[\s\S]*--ileri-sar/)
  })

  it('ölçemezse "geride değil" DEMEZ, ölçemedim der', () => {
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'ana-agac-yok-'))
    GECICI.push(bos)
    expect(tazelik.acilisSatiri(bos)).toMatch(/OLCULEMEDI/)
    expect(tazelik.ileriSar(bos).durum).toBe('olcemedi')
  })

  it('ayar yolu sınıflaması: kanca/ayar/araç/CLAUDE.md evet, ürün kodu hayır', () => {
    for (const d of ['.claude/hooks/x.cjs', '.claude/settings.json', '.mcp.json', 'CLAUDE.md', 'tools/wrongstack-mcp/package.json', '.githooks/pre-commit']) {
      expect(tazelik.ayarYolunaDeger([d]), d).toBe(true)
    }
    expect(tazelik.ayarYolunaDeger(['src/app/page.tsx', 'docs/CLAUDE.md', 'supabase/migrations/x.sql'])).toBe(false)
  })

  it('ARC-272 · ritüel ANA AGAC satırı: ilerlendi düz, ayar yoluna değerse ipucu; engelli/ölçülemedi ⚠ ile UYARIR ve zorlamaz', () => {
    const satir = tazelik.anaAgacSatiri
    expect(satir({ durum: 'ilerlendi', geride: 1 }, false)).toBe('ANA AGAC: ilerlendi (geride 1)')
    expect(satir({ durum: 'ilerlendi', geride: 2 }, true)).toContain('yeni kancalar sonraki turda')
    expect(satir({ durum: 'guncel', geride: 0 }, true)).toBe('ANA AGAC: guncel (geride 0)')
    for (const d of ['engelli', 'olcemedi']) {
      const s = satir({ durum: d, geride: 1, sebep: 'agac temiz degil (1 izlenen dosya: x)' }, false)
      expect(s, d).toMatch(/^⚠ANA AGAC: /)
      expect(s, d).toContain('ILERLETILEMEDI')
      expect(s, d).toContain('agac temiz degil')
    }
  })

  it('⛔SABOTAJ: çakışan kirli ana ağaçta ileriSar DURUR (zorlamaz), satır ⚠ ile uyarır, ağaç ve yerel değişiklik korunur', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'a.txt'), 'kirli\n')
    const s = tazelik.ileriSar(ana)
    expect(s.durum).toBe('engelli')
    expect(tazelik.anaAgacSatiri(s, false)).toMatch(/^⚠ANA AGAC: engelli/)
    expect(tazelik.olc(ana).geride).toBe(1) // ilerletilmedi
    expect(fs.readFileSync(path.join(ana, 'a.txt'), 'utf8')).toBe('kirli\n')
  })

  it('düzenek gerçekten bağlı: açılış kancası ve merge ritüeli modülü çağırır', () => {
    const kanca = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kanca).toMatch(/ana-agac-tazelik\.cjs'\)\)\s*\.acilisSatiri\(/)
    const ritual = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    // ARC-272: ff HER birleştirmeden sonra (ayar yoluna değmeyen belge PR'ından sonra da); ayar yolu yalnız ipucu metnini değiştirir.
    expect(ritual).not.toMatch(/if\s*\(\s*tazelik\.ayarYolunaDeger\(/)
    expect(ritual).toMatch(/tazelik\.anaAgacSatiri\(tazelik\.ileriSar\(tazelik\.anaAgacYolu\(AGAC\)\),\s*ayar\)/)
    // fetch ileriSar'dan ÖNCE gelir (bayat uzak ucu ölçmek "güncel" dedirtir, ARC-120/133'te iki kez yaşandı).
    expect(ritual.indexOf("git(['fetch', 'origin', 'master', '-q'])")).toBeGreaterThan(-1)
    expect(ritual.indexOf("git(['fetch', 'origin', 'master', '-q'])")).toBeLessThan(ritual.indexOf('tazelik.ileriSar('))
    // stash/reset/checkout ileri sarma yolunda YASAK (kirli ağaç birinin yarım işidir).
    const modul = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'), 'utf8')
    expect(modul).not.toMatch(/\[\s*'(stash|reset|checkout)'/)
  })
})

/**
 * INV-PENCERE-KOPYASI-FF-1 · pencerenin KENDİ çalışma kopyası SessionStart'ta güncellenir (ARC-264, OPS kararı 7 Kasım).
 *
 * ⭐NİÇİN: kancalar/kurallar pencerenin çalışma kopyasından koşar; kopyalar master'ın 2-121 commit gerisindeydi ve
 * #2324'teki yeni COMPACT YAKIN metni pencerelere hiç ulaşmadı. Sıra: (a) temiz + ff edilebilir → ff-only; (b) temiz,
 * dalın PR'ı birleşmiş (ya da commit'leri master'da) → eski dala dokunmadan origin/master'dan yeni dal; (c) aksi hâlde
 * (kirli, ayrık HEAD, birleşmemiş kendi commit) dokunma + uyarı. Merge fallback YOK (açık PR farkını değiştirir).
 * Durum üretilir: bare origin + ana ağaç + geride bırakılmış worktree. Makinenin gerçek deposuna dokunulmaz.
 */
type PencereSonuc = { durum: string; geride?: number; sebep?: string; dal?: string; yeniDal?: string }
const pencereIleriSar = (tazelik as unknown as {
  pencereIleriSar: (cwd: string, uzak?: string, env?: Record<string, string>, pr?: (dal: string) => boolean | null, simdi?: Date) => PencereSonuc
}).pencereIleriSar
const pencereSatiri = (tazelik as unknown as { pencereSatiri: (s: PencereSonuc | null) => string }).pencereSatiri
const SIMDI = new Date(2026, 10, 7, 12, 0, 0)
const PR_BIRLESMIS = (): boolean | null => true
const PR_ACIK = (): boolean | null => false
const PR_YOK = (): boolean | null => null

/** wt: 'serit' dalı, kurulum sonrası N commit geriye alınmış (HEAD~N); origin/master N commit önde. */
function gerideKopya(n: number): { wt: string; ana: string } {
  const k = kurulum(n)
  g(k.wt, 'reset', '-q', '--hard', `HEAD~${n}`)
  return { wt: k.wt, ana: k.ana }
}

/** Pencerenin dalına origin'de olmayan bir yerel commit ekler (PR'ı birleşmiş/birleşmemiş dal benzetimi). */
function yerelCommit(wt: string, dosya = 'yerel.txt'): string {
  fs.writeFileSync(path.join(wt, dosya), 'x\n')
  g(wt, 'add', dosya)
  g(wt, 'commit', '-q', '-m', 'yerel')
  return g(wt, 'rev-parse', 'HEAD')
}

describe('INV-PENCERE-KOPYASI-FF-1 pencere çalışma kopyası güncelleme', { timeout: GIT_SURE }, () => {
  it('(a) geride temiz pencere kopyası ileri sarılır; dosya yeni içeriğe geçer; ikinci çağrı güncel ve sessiz', () => {
    const { wt } = gerideKopya(3)
    expect(tazelik.olc(wt).geride).toBe(3)
    expect(pencereIleriSar(wt)).toMatchObject({ durum: 'ilerlendi', geride: 3, dal: 'serit' })
    expect(tazelik.olc(wt)).toMatchObject({ geride: 0, ileride: 0 })
    expect(fs.readFileSync(path.join(wt, 'a.txt'), 'utf8').trim()).toBe('3')
    const s = pencereIleriSar(wt)
    expect(s).toMatchObject({ durum: 'guncel', geride: 0 })
    expect(pencereSatiri(s), 'güncelken satır basılmaz').toBe('')
  })

  it('alt dizinden çağrılsa da pencerenin kök dizinini bulur', () => {
    const { wt } = gerideKopya(1)
    fs.mkdirSync(path.join(wt, 'alt'), { recursive: true })
    expect(pencereIleriSar(path.join(wt, 'alt')).durum).toBe('ilerlendi')
  })

  it('(c) KİRLİ izlenen dosya: dokunulmaz (ilgisiz dosya da olsa), yerel değişiklik korunur, sebep yazılır', () => {
    const { wt } = gerideKopya(1)
    fs.writeFileSync(path.join(wt, 'z.txt'), 'pencerenin-yarim-isi\n')
    const once = g(wt, 'rev-parse', 'HEAD')
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/agac temiz degil \(1 izlenen dosya: .*z\.txt/)
    expect(g(wt, 'rev-parse', 'HEAD')).toBe(once)
    expect(fs.readFileSync(path.join(wt, 'z.txt'), 'utf8')).toBe('pencerenin-yarim-isi\n')
    expect(pencereSatiri(s)).toMatch(/^⚠PENCERE KOPYASI 1 commit GERIDE ve guncellenemedi/)
  })

  it('(b) kendi commit\'i var ama PR\'ı BİRLEŞMİŞ: eski dala dokunulmaz, origin/master\'dan yeni dal açılır', () => {
    const { wt } = gerideKopya(2)
    const eskiUc = yerelCommit(wt)
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI)
    expect(s).toMatchObject({ durum: 'yeni-dal', geride: 2, dal: 'serit', yeniDal: 'pencere/pencere-2026-11-07' })
    expect(g(wt, 'rev-parse', '--abbrev-ref', 'HEAD')).toBe('pencere/pencere-2026-11-07')
    expect(g(wt, 'rev-parse', 'HEAD')).toBe(g(wt, 'rev-parse', 'origin/master'))
    expect(g(wt, 'rev-parse', 'serit'), 'eski dal olduğu gibi duruyor').toBe(eskiUc)
    expect(pencereSatiri(s)).toContain("'pencere/pencere-2026-11-07' acildi (2 commit geride idi)")
  })

  it('(b) aynı adlı dal zaten varsa yeni dal -2 son ekiyle açılır (var olan dal ezilmez)', () => {
    const { wt } = gerideKopya(1)
    yerelCommit(wt)
    g(wt, 'branch', 'pencere/pencere-2026-11-07', 'HEAD')
    const eskiUc = g(wt, 'rev-parse', 'pencere/pencere-2026-11-07')
    expect(pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI).yeniDal).toBe('pencere/pencere-2026-11-07-2')
    expect(g(wt, 'rev-parse', 'pencere/pencere-2026-11-07')).toBe(eskiUc)
  })

  it('(b) dal adındaki rol öneki yeni dala taşınır', () => {
    const { wt } = gerideKopya(1)
    g(wt, 'branch', '-m', 'serit', 'katalog/ktl83-x')
    yerelCommit(wt)
    expect(pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI).yeniDal).toBe('katalog/pencere-2026-11-07')
  })

  it('(b) PR\'ı birleşmemiş (açık) kendi commit\'i: DOKUNULMAZ, HEAD aynı, sebep PR i birlesmemis', () => {
    const { wt } = gerideKopya(2)
    const once = yerelCommit(wt)
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_ACIK, SIMDI)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/master'da olmayan 1 commit var ve PR i birlesmemis/)
    expect(g(wt, 'rev-parse', 'HEAD')).toBe(once)
    expect(g(wt, 'rev-parse', '--abbrev-ref', 'HEAD')).toBe('serit')
  })

  it('gh cevapsız (null) ve commit\'ler master\'da değil: dokunulmaz, sebep PR durumu olculemedi', () => {
    const { wt } = gerideKopya(1)
    yerelCommit(wt)
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_YOK, SIMDI)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/PR durumu olculemedi/)
  })

  it('gh cevapsız ama git cherry BOŞ (commit master\'da aynı yamayla var): yeni dal açılır', () => {
    const { wt } = gerideKopya(1)
    // aynı yama master'a başka commit olarak girdi (squash/cherry-pick benzetimi): geçici dalda yapıp master'a it
    g(wt, 'checkout', '-q', '-b', 'gecici', 'origin/master')
    fs.writeFileSync(path.join(wt, 'yerel.txt'), 'x\n')
    g(wt, 'add', 'yerel.txt')
    g(wt, 'commit', '-q', '-m', 'ayni-yama-master-da')
    g(wt, 'push', '-q', 'origin', 'gecici:master')
    g(wt, 'checkout', '-q', 'serit')
    yerelCommit(wt)
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_YOK, SIMDI)
    expect(s.durum).toBe('yeni-dal')
  })

  it('(b) izlenmeyen dosya master\'daki bir dosyayla çakışırsa switch reddeder: engelli, dosya ve eski dal korunur', () => {
    const { wt } = gerideKopya(1)
    const eskiUc = yerelCommit(wt)
    // origin/master'da a.txt değişti; çakışma için master'a yeni bir dosya ekle, pencerede aynı adla İZLENMEYEN dosya olsun
    g(wt, 'checkout', '-q', '-b', 'gecici', 'origin/master')
    fs.writeFileSync(path.join(wt, 'yeni-master.txt'), 'm\n')
    g(wt, 'add', 'yeni-master.txt')
    g(wt, 'commit', '-q', '-m', 'master-yeni-dosya')
    g(wt, 'push', '-q', 'origin', 'gecici:master')
    g(wt, 'checkout', '-q', 'serit')
    fs.writeFileSync(path.join(wt, 'yeni-master.txt'), 'pencerenin-izlenmeyen-dosyasi\n')
    const s = pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/yeni dal acilamadi/)
    expect(fs.readFileSync(path.join(wt, 'yeni-master.txt'), 'utf8')).toBe('pencerenin-izlenmeyen-dosyasi\n')
    expect(g(wt, 'rev-parse', 'serit')).toBe(eskiUc)
    expect(g(wt, 'rev-parse', '--abbrev-ref', 'HEAD')).toBe('serit')
  })

  it('(c) ayrık HEAD: dokunulmaz', () => {
    const { wt } = gerideKopya(1)
    g(wt, 'checkout', '-q', '--detach')
    const once = g(wt, 'rev-parse', 'HEAD')
    expect(pencereIleriSar(wt, 'origin/master', {}, PR_BIRLESMIS, SIMDI)).toMatchObject({ durum: 'engelli', sebep: 'ayrik HEAD (dal yok)' })
    expect(g(wt, 'rev-parse', 'HEAD')).toBe(once)
  })

  it('vana VENTHUB_PENCERE_FF=0: hiçbir şey yapılmaz, kopya geride kalır', () => {
    const { wt } = gerideKopya(2)
    expect(pencereIleriSar(wt, 'origin/master', { VENTHUB_PENCERE_FF: '0' })).toEqual({ durum: 'kapali' })
    expect(tazelik.olc(wt).geride).toBe(2)
  })

  it('depo olmayan dizin: fırlatmaz, olcemedi döner (fail-open)', () => {
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'pencere-ff-bos-'))
    GECICI.push(bos)
    expect(pencereIleriSar(bos).durum).toBe('olcemedi')
  })

  it('SessionStart kancası (session-board.cjs) adımı gerçekten çağırır ve vanayı bilir; modül yıkıcı git komutu içermez', () => {
    const kaynak = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kaynak).toMatch(/pencereIleriSar\(input\.cwd \|\| process\.cwd\(\)\)/)
    expect(kaynak).toMatch(/pencereSatiri\(/)
    const modul = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'), 'utf8')
    expect(modul).toContain("env.VENTHUB_PENCERE_FF === '0'")
    expect(modul, 'reset/stash/checkout/force/rebase/push yok; merge yalnız --ff-only').not.toMatch(/'reset'|'stash'|'checkout'|'--force'|'rebase'|'push'/)
    expect(modul.match(/'merge'/g)?.length, 'merge yalnız ff-only çağrılarında').toBe(modul.match(/'merge', '--ff-only'/g)?.length)
  })
})
