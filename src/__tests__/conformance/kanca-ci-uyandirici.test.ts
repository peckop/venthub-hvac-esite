/**
 * INV-CI-UYANDIRICI-1 — PR'ın CI'ı bitince sahibi pencere insan tetiği olmadan uyanır (ARC-263).
 *
 * Çekirdek: scripts/board/ci-uyandirici.cjs · kanca: .claude/hooks/ci-uyandirici.cjs (PostToolUse · Bash · asyncRewake).
 * Kök sebep: CI yeşili hiçbir pencereyi uyandırmıyordu (6 Kasım #2319/#2320/#2322); boşta pencereyi yalnız asyncRewake çıkışı 2 uyandırır.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'ci-uyandirici.cjs')

type Kapi = { name?: string; context?: string; status?: string; conclusion?: string; state?: string }
type Pv = { number: number; state: string; mergeStateStatus?: string; statusCheckRollup?: Kapi[]; body?: string; headRefOid?: string }
type Sinif = { durum: string; basarisiz: string[]; bekleyen: number; mergeState: string }
interface Modul {
  siniflandir: (pv: unknown) => Sinif
  kanbanNo: (b: unknown) => string
  mesaj: (pv: Pv, s: Sinif) => string
  tetik: (komut: unknown, cikti?: unknown) => { pr?: number; dal?: string } | null
  itisiBekle: (o: Record<string, unknown>) => Promise<Pv | null>
  yerelDal: (dal: string, git?: (a: string[]) => string) => { ad: string; sha: string } | null
  hepsi: (yaz: (s: string) => void, calistir: (a: string[]) => string, uyu: () => Promise<void>) => Promise<void>
  kilitAl: (dizin: string, pr: number, sha: string, simdi?: number, yasiyor?: (p: number) => boolean) => boolean
  kilitBirak: (dizin: string, pr: number, sha: string) => void
  bekle: (o: Record<string, unknown>) => Promise<{ sonuc: string; pv: Pv | null; s: Sinif | null }>
  degisiklikler: (prler: Pv[], onceki: Record<string, string>) => { satirlar: string[]; yeni: Record<string, string>; kaybolan: number[] }
  birlestiSatiri: (pv: Pv) => string | null
  MESAJ_TAVANI: number
}
const m = gerek(path.join(KOK, 'scripts', 'board', 'ci-uyandirici.cjs')) as Modul

const gecti = (ad: string): Kapi => ({ name: ad, status: 'COMPLETED', conclusion: 'SUCCESS' })
const kosuyor = (ad: string): Kapi => ({ name: ad, status: 'IN_PROGRESS', conclusion: '' })
const pr = (kapilar: Kapi[], ek: Partial<Pv> = {}): Pv => ({
  number: 2322,
  state: 'OPEN',
  mergeStateStatus: 'CLEAN',
  headRefOid: 'aaa111',
  body: 'Ne\n\nKanban: ARC-262\n',
  statusCheckRollup: kapilar,
  ...ek,
})

describe('INV-CI-UYANDIRICI-1 · sınıflama (boş ya da koşan kapı yeşil sayılmaz)', () => {
  it('tüm kapılar geçti → yeşil; SKIPPED/NEUTRAL geçmiş sayılır', () => {
    expect(m.siniflandir(pr([gecti('ci'), { name: 'x', conclusion: 'SKIPPED' }, { name: 'y', conclusion: 'NEUTRAL' }])).durum).toBe('yesil')
  })

  it('⛔ koşan kapı varsa BEKLİYOR; kapı listesi boşsa (itişten hemen sonra) BEKLİYOR, yeşil değil', () => {
    expect(m.siniflandir(pr([gecti('ci'), kosuyor('test-shard (1/4)')])).durum).toBe('bekliyor')
    expect(m.siniflandir(pr([])).durum).toBe('bekliyor')
    expect(m.siniflandir(pr(undefined as unknown as Kapi[])).durum).toBe('bekliyor')
    expect(m.siniflandir(null).durum).toBe('bekliyor')
  })

  it('⛔ tek başarısız kapı bile KIRMIZI (diğerleri koşarken erken haber); StatusContext state da okunur', () => {
    const s = m.siniflandir(pr([{ name: 'ci', conclusion: 'FAILURE' }, kosuyor('x')]))
    expect(s.durum).toBe('kirmizi')
    expect(s.basarisiz).toEqual(['ci'])
    expect(m.siniflandir(pr([{ context: 'vercel', state: 'FAILURE' }])).durum).toBe('kirmizi')
    expect(m.siniflandir(pr([{ context: 'vercel', state: 'SUCCESS' }])).durum).toBe('yesil')
    expect(m.siniflandir(pr([{ context: 'vercel', state: 'PENDING' }])).durum).toBe('bekliyor')
    for (const c of ['CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED']) expect(m.siniflandir(pr([{ name: 'z', conclusion: c }])).durum, c).toBe('kirmizi')
  })

  it('birleşti/kapandı durumu kapılardan önce gelir', () => {
    expect(m.siniflandir(pr([], { state: 'MERGED' })).durum).toBe('birlesti')
    expect(m.siniflandir(pr([kosuyor('a')], { state: 'CLOSED' })).durum).toBe('kapandi')
  })
})

describe('INV-CI-UYANDIRICI-1 · tetik ve mesaj', () => {
  it('Kanban numarası gövdeden okunur (çoklu dahil); yoksa boş', () => {
    expect(m.kanbanNo('x\nKanban: ARC-262\n')).toBe('ARC-262')
    expect(m.kanbanNo('Kanban: ARC-3, HRT-12')).toBe('ARC-3,HRT-12')
    expect(m.kanbanNo('Kanban yok')).toBe('')
    expect(m.kanbanNo(undefined)).toBe('')
  })

  it('gh pr create: PR numarası çıktıdaki URL\'den; çıktıda URL yoksa null', () => {
    expect(m.tetik('gh pr create --base master --title x --body-file y', 'https://github.com/peckop/venthub-hvac-esite/pull/2322\n')).toEqual({ pr: 2322 })
    expect(m.tetik('gh pr create --title x', 'hata: ...')).toBeNull()
  })

  it('git push origin <dal>: dal döner; --delete, remote\'suz ve ilgisiz komut null', () => {
    expect(m.tetik('git push -u origin arac/arc263-ci-uyandirici')).toEqual({ dal: 'arac/arc263-ci-uyandirici' })
    expect(m.tetik('git push origin HEAD:arac/x')).toEqual({ dal: 'arac/x' })
    expect(m.tetik('git push origin --delete arac/x')).toBeNull()
    expect(m.tetik('git push -d origin arac/x')).toBeNull()
    expect(m.tetik('git push')).toBeNull()
    expect(m.tetik('git status')).toBeNull()
    expect(m.tetik('gh pr view 5')).toBeNull()
    expect(m.tetik(undefined)).toBeNull()
  })

  it('denetçi S3: itiş biçimleri (HEAD, refs/heads, +ref, bayrak sırası, kabuk yeniden yönlendirmesi) çözülür; bozuk biçim ve alıntı null', () => {
    const dal = (k: string) => m.tetik(k)?.dal ?? null
    expect(dal('git push origin HEAD')).toBe('HEAD')
    expect(dal('git push origin HEAD:refs/heads/arac/x')).toBe('arac/x')
    expect(dal('git push origin refs/heads/arac/x')).toBe('arac/x')
    expect(dal('git push origin +arac/x')).toBe('arac/x')
    expect(dal('git push origin arac/x -u')).toBe('arac/x')
    expect(dal('git push -u origin arac/x 2>&1')).toBe('arac/x')
    expect(dal('git add . && git push origin arac/x')).toBe('arac/x')
    expect(dal('git push origin --force')).toBeNull()
    expect(dal('git push origin --tags')).toBeNull()
    expect(dal('echo "git push origin x"')).toBeNull()
    expect(dal('git push upstream arac/x')).toBeNull()
  })

  it('denetçi S1: "Everything up-to-date" yeni itiş değildir (kanca yeşil PR\'da anında uyandırmaz)', () => {
    expect(m.tetik('git push origin arac/x', 'Everything up-to-date')).toBeNull()
    expect(m.tetik('git push origin arac/x', 'To github.com:o/r.git\n   a1..b2  arac/x -> arac/x')).toEqual({ dal: 'arac/x' })
  })

  it('denetçi S2: yabancı depodaki PR URL\'si reddedilir; gh çağrıları --repo ile gider', () => {
    expect(m.tetik('gh pr create', 'https://github.com/orion/other/pull/2302')).toBeNull()
    expect(m.tetik('gh pr create', 'https://github.com/PECKOP/venthub-hvac-esite/pull/9')).toEqual({ pr: 9 })
    const kaynak = readFileSync(path.join(KOK, 'scripts', 'board', 'ci-uyandirici.cjs'), 'utf8')
    expect(kaynak.match(/'--repo', REPO/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
  })

  it('itisiBekle: PR başı itilen commit\'e eşitlenene kadar bekler; eşitlenmezse null (eski yeşil yanlış haber olmaz)', async () => {
    let t = 0
    const okuyucu = (dizi: Array<Pv | null>) => {
      let i = 0
      return () => dizi[Math.min(i++, dizi.length - 1)]
    }
    const ortak = { pr: 5, sha: 'yeni', uyu: async () => void (t += 5000), simdi: () => t }
    const pv = await m.itisiBekle({ ...ortak, oku: okuyucu([pr([], { headRefOid: 'eski' }), pr([], { headRefOid: 'yeni' })]) })
    expect(pv?.headRefOid).toBe('yeni')
    t = 0
    expect(await m.itisiBekle({ ...ortak, oku: okuyucu([pr([], { headRefOid: 'eski' })]), tavan: 20_000 })).toBeNull()
    expect(m.yerelDal('HEAD', (a: string[]) => (a[1] === '--abbrev-ref' ? 'arac/x\n' : 'abc123\n'))).toEqual({ ad: 'arac/x', sha: 'abc123' })
    expect(m.yerelDal('HEAD', () => 'HEAD\n')).toBeNull()
  })

  it('mesaj: PR no, Kanban no, durum ve OPS yönergesi; kırmızıda kapı adları; tavan aşılmaz', () => {
    const pv = pr([gecti('ci')])
    const y = m.mesaj(pv, m.siniflandir(pv))
    expect(y).toContain('#2322')
    expect(y).toContain('Kanban: ARC-262')
    expect(y).toContain('YEŞİL')
    expect(y).toContain('OPS')
    const k = m.mesaj(pv, { durum: 'kirmizi', basarisiz: ['ci', 'test-shard (2/4)'], bekleyen: 0, mergeState: 'BLOCKED' })
    expect(k).toContain('KIRMIZI')
    expect(k).toContain('test-shard (2/4)')
    const uzun = m.mesaj(pv, { durum: 'kirmizi', basarisiz: Array.from({ length: 40 }, (_, i) => 'cok-uzun-kapi-adi-' + i), bekleyen: 0, mergeState: '' })
    expect(uzun.length).toBeLessThanOrEqual(m.MESAJ_TAVANI)
    expect(m.mesaj(pv, { durum: 'birlesti', basarisiz: [], bekleyen: 0, mergeState: '' })).toContain('BİRLEŞTİ')
  })
})

describe('INV-CI-UYANDIRICI-1 · bekleyici döngü (sahte okuyucu, sıfır bekleme)', () => {
  const kos = (dizi: Array<Pv | null>, ek: Record<string, unknown> = {}) => {
    let i = 0
    let uyku = 0
    let t = 0
    return {
      uykular: () => uyku,
      calis: () =>
        m.bekle({
          pr: 2322,
          oku: () => dizi[Math.min(i++, dizi.length - 1)],
          uyu: async () => {
            uyku += 1
            t += 30_000
          },
          simdi: () => t,
          teyit: 0,
          dogrula: () => null,
          ...ek,
        }),
    }
  }

  it('bekliyor, bekliyor, yeşil, yeşil (teyit) → yeşil döner; iki bekleme + bir teyit uykusu', async () => {
    const k = kos([pr([kosuyor('ci')]), pr([kosuyor('ci')]), pr([gecti('ci')]), pr([gecti('ci')])])
    const r = await k.calis()
    expect(r.sonuc).toBe('yesil')
    expect(k.uykular()).toBe(3)
  })

  it('⛔ denetçi S1: tek yeşil okuma yetmez; teyitte kapı yeniden koşuyorsa ya da commit değiştiyse yeşil DENMEZ', async () => {
    const a = await kos([pr([gecti('ci')]), pr([kosuyor('ci')]), pr([gecti('ci')]), pr([gecti('ci')])]).calis()
    expect(a.sonuc).toBe('yesil')
    // ilk okuma yeşil, teyit okuması başka commit: sahte yeşil; sonra gerçek yeşil
    const b = kos([pr([gecti('ci')]), pr([gecti('ci')], { headRefOid: 'bbb222' })])
    expect((await b.calis()).sonuc).not.toBe('yesil')
  })

  it('kırmızı ve birleşti ilk görüldüğü anda döner', async () => {
    expect((await kos([pr([kosuyor('a')]), pr([{ name: 'ci', conclusion: 'FAILURE' }])]).calis()).sonuc).toBe('kirmizi')
    expect((await kos([pr([kosuyor('a')]), pr([], { state: 'MERGED' })]).calis()).sonuc).toBe('birlesti')
  })

  it('⛔ bekleme sırasında dal yeni commit alırsa SESSİZ biter (yenilendi); yeni itişin kendi bekleyicisi var', async () => {
    const r = await kos([pr([kosuyor('ci')]), pr([gecti('ci')], { headRefOid: 'bbb222' })]).calis()
    expect(r.sonuc).toBe('yenilendi')
  })

  it('tavan dolunca zaman-asimi; okunamayan PR beş denemeden sonra okunamadi', async () => {
    expect((await kos([pr([kosuyor('ci')])], { tavan: 90_000 }).calis()).sonuc).toBe('zaman-asimi')
    expect((await kos([null]).calis()).sonuc).toBe('okunamadi')
  })

  it('⛔ ARC-279: rollup yeşil ama baş sha\'nın check-runs\'ı bekliyorsa yeşil DENMEZ; REST yeşile dönünce yeşil', async () => {
    const veriler = [{ durum: 'bekliyor', basarisiz: [] }, { durum: 'bekliyor', basarisiz: [] }, { durum: 'yesil', basarisiz: [] }]
    let n = 0
    const sorulan: string[] = []
    const r = await kos([pr([gecti('ci')], { headRefOid: 'abcdef1234' })], {
      dogrula: (sha: string) => {
        sorulan.push(sha)
        return veriler[Math.min(n++, veriler.length - 1)]
      },
    }).calis()
    expect(r.sonuc).toBe('yesil')
    expect(sorulan).toEqual(['abcdef1234', 'abcdef1234', 'abcdef1234'])
  })

  it('⛔ ARC-279: REST sürekli bekliyorsa tavanda "eski" döner ve mesaj ESKİ COMMIT der; REST kırmızıysa kırmızı', async () => {
    const eski = await kos([pr([gecti('ci')], { headRefOid: 'abcdef1234' })], { tavan: 90_000, dogrula: () => ({ durum: 'bekliyor', basarisiz: [] }) }).calis()
    expect(eski.sonuc).toBe('eski')
    const metin = m.mesaj(eski.pv as Pv, eski.s as Sinif)
    expect(metin).toContain("ESKİ COMMIT'E AİT")
    expect(metin).toContain('abcdef12')
    const kirmizi = await kos([pr([gecti('ci')], { headRefOid: 'abcdef1234' })], { dogrula: () => ({ durum: 'kirmizi', basarisiz: ['test'] }) }).calis()
    expect(kirmizi.sonuc).toBe('kirmizi')
    expect(kirmizi.s?.basarisiz).toEqual(['test'])
  })

  it('REST okunamazsa (null) rollup\'a güvenilir (fail-open); yeşil mesajı baş sha\'yı taşır', async () => {
    const r = await kos([pr([gecti('ci')], { headRefOid: 'abcdef1234' })]).calis()
    expect(r.sonuc).toBe('yesil')
    expect(m.mesaj(r.pv as Pv, r.s as Sinif)).toContain('sha abcdef12')
  })

  it('restSiniflandir: boş ve tamamlanmamış kapı yeşil değildir; sha biçimi geçersizse shaDogrula çağırmaz', () => {
    const rs = (m as unknown as { restSiniflandir: (v: unknown) => { durum: string } | null; shaDogrula: (s: string, c: () => string) => unknown })
    expect(rs.restSiniflandir({ check_runs: [] })?.durum).toBe('bekliyor')
    expect(rs.restSiniflandir({ check_runs: [{ name: 'a', status: 'completed', conclusion: 'success' }, { name: 'b', status: 'in_progress', conclusion: null }] })?.durum).toBe('bekliyor')
    expect(rs.restSiniflandir({ check_runs: [{ name: 'a', status: 'completed', conclusion: 'success' }] })?.durum).toBe('yesil')
    expect(rs.restSiniflandir({ check_runs: [{ name: 'a', status: 'completed', conclusion: 'failure' }] })?.durum).toBe('kirmizi')
    expect(rs.restSiniflandir({})).toBeNull()
    expect(rs.shaDogrula('../x', () => { throw new Error('çağrılmamalı') })).toBeNull()
  })
})

describe('INV-CI-UYANDIRICI-1 · kilit (aynı PR+sha için tek bekleyici)', () => {
  it('ikinci alma reddedilir; farklı sha, ölü süreç ve süresi dolmuş kilit alınır; sahibi bırakır', () => {
    const dizin = mkdtempSync(path.join(tmpdir(), 'ciu-'))
    try {
      const t0 = 1_000_000
      expect(m.kilitAl(dizin, 7, 'aaa', t0, () => true)).toBe(true)
      expect(m.kilitAl(dizin, 7, 'aaa', t0 + 1000, () => true)).toBe(false)
      expect(m.kilitAl(dizin, 7, 'bbb', t0 + 1000, () => true)).toBe(true)
      expect(m.kilitAl(dizin, 7, 'bbb', t0 + 2000, () => false)).toBe(true)
      expect(m.kilitAl(dizin, 7, 'bbb', t0 + 3 * 60 * 60 * 1000, () => true)).toBe(true)
      m.kilitBirak(dizin, 7, 'bbb')
      expect(m.kilitAl(dizin, 7, 'bbb', t0 + 4 * 60 * 60 * 1000 + 1, () => true)).toBe(true)
    } finally {
      rmSync(dizin, { recursive: true, force: true })
    }
  })
})

describe('INV-CI-UYANDIRICI-1 · OPS kipi (--hepsi çekirdeği)', () => {
  it('yeşil ve kırmızı YALNIZ durum değişince bir kez basılır; bekleyen basılmaz; yeni commit yeniden basar', () => {
    const a = m.degisiklikler([pr([gecti('ci')]), pr([{ name: 'ci', conclusion: 'FAILURE' }], { number: 9, body: 'Kanban: HRT-5' }), pr([kosuyor('ci')], { number: 11 })], {})
    expect(a.satirlar).toEqual(['CI-YESIL #2322 ARC-262 mergeState=CLEAN', 'CI-KIRMIZI #9 HRT-5 basarisiz=ci'])
    const b = m.degisiklikler([pr([gecti('ci')])], a.yeni)
    expect(b.satirlar).toEqual([])
    expect(b.kaybolan).toEqual([9, 11])
    const c = m.degisiklikler([pr([gecti('ci')], { headRefOid: 'ccc333' })], b.yeni)
    expect(c.satirlar).toHaveLength(1)
  })

  it('denetçi nit: ilk tur SESSİZ baseline (tek özet satırı); sonra yalnız değişim; boş liste glitch\'i sel üretmez', async () => {
    const turlar: string[] = [JSON.stringify([pr([gecti('ci')]), pr([{ name: 'ci', conclusion: 'FAILURE' }], { number: 9, body: 'Kanban: HRT-5' })])]
    turlar.push(JSON.stringify([])) // gh geçici boş
    turlar.push(JSON.stringify([pr([gecti('ci')]), pr([{ name: 'ci', conclusion: 'FAILURE' }], { number: 9, body: 'Kanban: HRT-5' })]))
    turlar.push(JSON.stringify([pr([gecti('ci')], { headRefOid: 'ddd444' })])) // #9 kayboldu (birleşme sorusu), #2322 yeni commit
    const cikti: string[] = []
    let tur = 0
    const calistir = (a: string[]) => {
      if (a[1] === 'view') return JSON.stringify(pr([], { number: 9, state: 'MERGED', body: 'Kanban: HRT-5' }))
      return turlar[Math.min(tur, turlar.length - 1)]
    }
    await m
      .hepsi((s) => cikti.push(s), calistir, async () => {
        tur += 1
        if (tur > 3) throw new Error('dur')
      })
      .catch(() => undefined)
    expect(cikti[0]).toBe('ILK-TARAMA acik=2 yesil=1 kirmizi=1')
    expect(cikti.filter((s) => s.startsWith('CI-')).length).toBe(1) // yalnız son turdaki yeni commit yeşili; boş-liste turu satır üretmedi
    expect(cikti).toContain('BIRLESTI #9 HRT-5')
  })

  it('açıktan kaybolan PR: birleşti → BIRLESTI satırı; hâlâ açıksa null', () => {
    expect(m.birlestiSatiri(pr([], { state: 'MERGED' }))).toBe('BIRLESTI #2322 ARC-262')
    expect(m.birlestiSatiri(pr([], { state: 'CLOSED' }))).toBe('KAPANDI #2322 ARC-262')
    expect(m.birlestiSatiri(pr([gecti('ci')]))).toBeNull()
  })
})

describe('INV-CI-UYANDIRICI-1 · kanca süreç olarak ve kayıt', () => {
  const kos = (girdi: unknown, env: Record<string, string> = {}) =>
    spawnSync('node', [KANCA], { input: JSON.stringify(girdi), encoding: 'utf8', windowsHide: true, env: { ...process.env, ...env } })

  it('ilgisiz komut, Bash dışı araç, bozuk girdi ve vana: sessiz çıkış 0', () => {
    for (const g of [{ tool_name: 'Bash', tool_input: { command: 'git status' } }, { tool_name: 'Edit', tool_input: {} }]) {
      const r = kos(g)
      expect(r.status).toBe(0)
      expect(r.stderr).toBe('')
    }
    expect(spawnSync('node', [KANCA], { input: '{bozuk', encoding: 'utf8', windowsHide: true }).status).toBe(0)
    const vana = kos({ tool_name: 'Bash', tool_input: { command: 'gh pr create --title x' }, tool_response: { stdout: 'https://github.com/o/r/pull/5' } }, { VENTHUB_CI_UYANDIRICI: '0' })
    expect(vana.status).toBe(0)
    expect(vana.stderr).toBe('')
  })

  it('settings.json: PostToolUse·Bash altında asyncRewake ile ve uzun zaman aşımıyla kayıtlı; izin bloğuna dokunmaz', () => {
    const ayar = JSON.parse(readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks: { PostToolUse: Array<{ matcher: string; hooks: Array<{ command: string; asyncRewake?: boolean; timeout?: number }> }> }
    }
    const kayit = ayar.hooks.PostToolUse.filter((g) => g.matcher === 'Bash')
      .flatMap((g) => g.hooks)
      .find((h) => h.command.includes('ci-uyandirici.cjs'))
    expect(kayit, 'ci-uyandirici kancası PostToolUse Bash altında kayıtlı değil').toBeDefined()
    expect(kayit?.asyncRewake, 'asyncRewake kapalıysa çıkış 2 pencereyi uyandırmaz').toBe(true)
    expect(kayit?.timeout ?? 0, 'zaman aşımı 40 dk bekleme tavanından kısa').toBeGreaterThanOrEqual(2400)
  })

  it('kanca dosyası yaz/sil/ağ-dışı eylemi yok: yalnız gh pr view/list ve pano kilidi', () => {
    const kaynak = readFileSync(path.join(KOK, 'scripts', 'board', 'ci-uyandirici.cjs'), 'utf8')
    expect(kaynak).not.toMatch(/'pr',\s*'(merge|close|comment|edit)'/)
    expect(kaynak).not.toMatch(/setInterval|CronCreate|ScheduleWakeup/)
  })
})
