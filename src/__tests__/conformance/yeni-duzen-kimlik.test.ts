// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-YENIDUZEN-KIMLIK-1..6 · yeni düzen pencere kimliği (ARC-124, OPS-122, 13 Ekim 2026).
 *
 * ÖLÇÜLEN KUSURLAR (Geo-SEO, Altyapı, Katalog, Araç yeni düzene geçerken):
 *  1) SessionStart rol kartı "bilinmiyor" dedi: kanca `settings.local.json` `agent` anahtarını rol için okumuyordu.
 *  2) PreCompact kapısı durum dosyasını `originSessionId` ile arar; dosya ESKİ oturum kimliğini taşıyordu ve şerit adı
 *     yedeği "Araç (yeni düzen)" adını "aracyeniduzen"e düzleştirip "arac-" önekini kaçırdı → compact DURDU.
 *  3) Eski kimliğe adreslenmiş posta yeni kimliğe görünmüyordu.
 *  4) `start_session` görev metni (başka oturum yazar) Recep sözü diye deftere yazıldı (11 kayıt).
 *
 * DÜZENEK: hermetik. Her kol ayrı geçici dizinde; gerçek `~/.claude` hiçbir kolda okunmaz ya da yazılmaz
 * (`VENTHUB_SESSIONS_DIZINI`, `VENTHUB_ROL_KIMLIK_DOSYASI`, `VENTHUB_ANA_PROJE_DIZINI`, `VENTHUB_BOARD_DIR`).
 *
 * ⭐KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: agent kimliği / ad eki / devir / önceki kimlik / brief ayrı davranışlardır.
 * SABOTAJ KANITI: her kolun düzeltmesi söküldüğünde test kırmızı olur (bkz. `Sabotaj` bölümü ve PR gövdesi).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KAPI_YOLU = path.join(KOK, '.claude/hooks/precompact-durum-kapisi.cjs')
const KANCA_YOLU = path.join(KOK, '.claude/hooks/session-board.cjs')

interface Dosya {
  ad: string
  tam: string
  mt: number
  seritEslesmesi?: string
  eslesmeKaynagi?: string
}
interface Kapi {
  oturumunDosyalari: (d: string | string[], sid: string, ipucu?: { cwd?: string; agentType?: string }) => Dosya[]
  seritAdaylari: (sid: string, ipucu?: { cwd?: string; agentType?: string }) => { slug: string; kaynak: string }[]
  kimlikDevret: (p: {
    sid: string
    slug: string
    memoryDizinleri: string | string[]
    canliMi?: (s: string) => boolean
  }) => { devir: boolean; sebep?: string; dosya?: string; eski?: string; yeni?: string }
  adEkiniAt: (ad: string) => string
  seritSlug: (ad: string) => string
}
interface Kimlik {
  pencereAjani: (d: unknown) => string
  agentAdi: (p: { cwd?: string; agentType?: string }) => string
  rolAdi: (a: string) => string
  rolSlug: (r: string) => string
  kimlikKaydet: (p: { rol: string; sid: string; eski?: string; dosya?: string }) => { yazildi: boolean; oncekiler: string[] }
  oncekiKimlikler: (rol: string, sid: string, dosya?: string) => string[]
  canliKayitVarMi: (sid: string, dizin?: string) => boolean
  modelUyarisi: (p: { cwd?: string; agent?: string; oturumModeli?: string }) => string
  ONCEKI_TAVAN: number
}
interface Defter {
  siniflandir: (p: unknown) => { recep: boolean; soz: string; sebep: string }
}

const kapi = require_(KAPI_YOLU) as Kapi
const kimlik = require_(path.join(KOK, 'scripts/board/pencere-kimligi.cjs')) as Kimlik
const defter = require_(path.join(KOK, 'scripts/board/recep-sozu-defteri.cjs')) as Defter

const ESKI = '65844ccb-e970-48ab-a9f2-0e497c6a7ef9'
// SENTETİK kimlik: gerçek bir pencerenin numarası OLMAMALI. Kapı `<sid>.jsonl` dökümünü ~/.claude/projects altında arar;
// gerçek numara kullanılınca yerelde döküm bulunup test kazara geçiyordu, CI'da (döküm yok) kırmızıydı (13 Ekim).
const YENI = 'c0ffee00-1111-4222-8333-444455556666'
const BASKA = '11111111-2222-3333-4444-555555555555'

let gecici = ''
let sayac = 0
/** Her çağrı kendi dizinini alır: kollar birbirinin dosyasını görmez. */
function yeniDizin(ad: string): string {
  sayac += 1
  const d = path.join(gecici, `${ad}-${sayac}`)
  fs.mkdirSync(d, { recursive: true })
  return d
}
function yaz(yol: string, govde: string): void {
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, govde)
}
/** Pencere çalışma klasörü: `.claude/settings.local.json` agent anahtarıyla (yeni düzen). */
function pencereKlasoru(agent: string | null, ad = 'wt'): string {
  const d = path.join(yeniDizin('pencere'), ad)
  if (agent !== null) yaz(path.join(d, '.claude', 'settings.local.json'), JSON.stringify({ agent }))
  else fs.mkdirSync(d, { recursive: true })
  return d
}
const durumGovdesi = (sid: string) =>
  `---\nname: x\nmetadata:\n  originSessionId: ${sid}\n  modified: 2026-09-30T13:40:26.710Z\n---\n\n## Durum\n**SON GIRDI:** a\n**ACIK KUYRUK:** b\n**VERILEN SOZLER:** c\n**BEKLEYEN KARARLAR:** d\n`
/** Pencere kaydı (`~/.claude/sessions/<pid>.json` biçimi). */
function oturumKaydi(dizin: string, sid: string, name: string): void {
  yaz(path.join(dizin, `${sid.slice(0, 4)}.json`), JSON.stringify({ pid: 1, sessionId: sid, name }))
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-yeni-duzen-'))
})
afterAll(() => {
  try {
    fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
  } catch {
    /* kilitli geçici dizin: OS temizliğine kalır */
  }
})

describe('INV-YENIDUZEN-KIMLIK-1 · agent anahtarı rolü çözer', () => {
  it('`agent_type` ve settings.local.json `agent` aynı rolü verir (arac-pencere → ARAC, geo-seo-pencere → GEO-SEO)', () => {
    expect(kimlik.rolAdi(kimlik.agentAdi({ agentType: 'arac-pencere' }))).toBe('ARAC')
    const d = pencereKlasoru('geo-seo-pencere')
    expect(kimlik.agentAdi({ cwd: d })).toBe('geo-seo-pencere')
    expect(kimlik.rolAdi('geo-seo-pencere')).toBe('GEO-SEO')
    expect(kimlik.rolSlug('GEO-SEO')).toBe('geoseo')
  })

  it('alt klasörden de bulunur; anahtarsız pencere ve çalışan ajan tipi ROL SAYILMAZ', () => {
    const d = pencereKlasoru('ops-pencere')
    const alt = path.join(d, 'src', 'lib')
    fs.mkdirSync(alt, { recursive: true })
    expect(kimlik.agentAdi({ cwd: alt })).toBe('ops-pencere')
    expect(kimlik.agentAdi({ cwd: pencereKlasoru(null) })).toBe('')
    // alt ajan tipleri (`arac-arastirmaci`) pencere kimliği değildir
    expect(kimlik.agentAdi({ cwd: pencereKlasoru('arac-arastirmaci') })).toBe('')
    expect(kimlik.agentAdi({ agentType: 'blog-curutucu', cwd: pencereKlasoru(null) })).toBe('')
    expect(kimlik.rolAdi('pencere')).toBe('')
  })
})

describe('INV-YENIDUZEN-KIMLIK-2 · PreCompact kapısı yeni düzen penceresini kabul eder', () => {
  it('"(yeni düzen)" eki atılır: "Araç (yeni düzen)" → arac, "Geo-SEO (yeni düzen)" → geoseo', () => {
    expect(kapi.seritSlug('Araç')).toBe('arac')
    expect(kapi.adEkiniAt('Araç (yeni düzen)')).toBe('Araç')
    expect(kapi.adEkiniAt('Geo-SEO (yeni düzen)')).toBe('Geo-SEO')
  })

  it('eski kimlikli dosya, pencere adı ekli olsa da BULUNUR (önceden: dosya 0, compact durdu)', () => {
    const t = yeniDizin('ad-eki')
    const mem = path.join(t, 'memory')
    const sessions = path.join(t, 'sessions')
    yaz(path.join(mem, 'arac-serit-durumu.md'), durumGovdesi(ESKI))
    oturumKaydi(sessions, YENI, 'Araç (yeni düzen)')
    const onceki = process.env.VENTHUB_SESSIONS_DIZINI
    process.env.VENTHUB_SESSIONS_DIZINI = sessions
    try {
      const bulunan = kapi.oturumunDosyalari([mem], YENI)
      expect(bulunan.map((d) => d.ad)).toEqual(['arac-serit-durumu.md'])
      expect(bulunan[0].seritEslesmesi).toBe('arac')
    } finally {
      if (onceki === undefined) delete process.env.VENTHUB_SESSIONS_DIZINI
      else process.env.VENTHUB_SESSIONS_DIZINI = onceki
    }
  })

  it('pencere kaydı adı vermese de agent anahtarı dosyayı bulur; BAŞKA rolün dosyası kabul edilmez', () => {
    const t = yeniDizin('agent-yedek')
    const mem = path.join(t, 'memory')
    yaz(path.join(mem, 'geoseo-lane-state.md'), durumGovdesi(ESKI))
    yaz(path.join(mem, 'blog-lane-state.md'), durumGovdesi(ESKI))
    const cwd = pencereKlasoru('geo-seo-pencere')
    const bulunan = kapi.oturumunDosyalari([mem], YENI, { cwd })
    expect(bulunan.map((d) => d.ad)).toEqual(['geoseo-lane-state.md'])
    expect(bulunan[0].eslesmeKaynagi).toBe('agent anahtari')
    // anahtar yok, ad yok → hiçbir şey kabul edilmez (sessiz yanlış eşleşme yok)
    expect(kapi.oturumunDosyalari([mem], YENI, { cwd: pencereKlasoru(null) })).toEqual([])
  })

  it('kapı SÜRECİ: eski kimlikli dosyayla compact DURMAZ (çıkış 0), kimlik eski uyarısı verir', () => {
    const t = yeniDizin('kapi-sureci')
    const ana = path.join(t, 'ana')
    const wt = path.join(t, 'proje-wt')
    const sessions = path.join(t, 'sessions')
    yaz(path.join(ana, 'memory', 'arac-serit-durumu.md'), durumGovdesi(ESKI))
    fs.mkdirSync(path.join(wt, 'memory'), { recursive: true })
    oturumKaydi(sessions, YENI, 'Araç (yeni düzen)')
    const r = spawnSync(process.execPath, [KAPI_YOLU], {
      input: JSON.stringify({
        session_id: YENI,
        trigger: 'manual',
        transcript_path: path.join(wt, `${YENI}.jsonl`),
        cwd: pencereKlasoru('arac-pencere'),
      }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_ANA_PROJE_DIZINI: ana, VENTHUB_SESSIONS_DIZINI: sessions, VENTHUB_PRECOMPACT_KAPALI: '' },
    })
    expect(r.status).toBe(0)
    expect(r.stderr).not.toContain('COMPACT DURDURULDU')
    expect(r.stdout).toContain('KIMLIK ESKI')
  })
})

describe('INV-YENIDUZEN-KIMLIK-3 · kimlik devri (SessionStart)', () => {
  it('eski originSessionId yeni sid ile değişir, DEĞİŞTİRME ZAMANI korunur (bayat dosya taze görünmez)', () => {
    const t = yeniDizin('devir')
    const mem = path.join(t, 'memory')
    const dosya = path.join(mem, 'arac-serit-durumu.md')
    yaz(dosya, durumGovdesi(ESKI))
    const eskiZaman = new Date('2026-10-12T10:00:00Z')
    fs.utimesSync(dosya, eskiZaman, eskiZaman)
    const s = kapi.kimlikDevret({ sid: YENI, slug: 'arac', memoryDizinleri: [mem] })
    expect(s).toMatchObject({ devir: true, dosya: 'arac-serit-durumu.md', eski: ESKI, yeni: YENI })
    const govde = fs.readFileSync(dosya, 'utf8')
    expect(govde).toContain(`originSessionId: ${YENI}`)
    expect(govde).not.toContain(ESKI)
    expect(Math.abs(fs.statSync(dosya).mtimeMs - eskiZaman.getTime())).toBeLessThan(2000)
    // ikinci çağrı: zaten güncel → devir yok
    expect(kapi.kimlikDevret({ sid: YENI, slug: 'arac', memoryDizinleri: [mem] })).toMatchObject({ devir: false, sebep: 'ayni' })
  })

  it('devir YAPILMAYAN haller: eski kimlik canlı pencerede, alan yok, dosya yok', () => {
    const t = yeniDizin('devir-yok')
    const mem = path.join(t, 'memory')
    const dosya = path.join(mem, 'arac-serit-durumu.md')
    yaz(dosya, durumGovdesi(ESKI))
    const canli = kapi.kimlikDevret({ sid: YENI, slug: 'arac', memoryDizinleri: [mem], canliMi: (s) => s === ESKI })
    expect(canli).toMatchObject({ devir: false, sebep: 'eski-canli' })
    expect(fs.readFileSync(dosya, 'utf8')).toContain(`originSessionId: ${ESKI}`)
    yaz(path.join(mem, 'blog-lane-state.md'), '---\nname: x\n---\nalan yok\n')
    expect(kapi.kimlikDevret({ sid: YENI, slug: 'blog', memoryDizinleri: [mem] })).toMatchObject({ devir: false, sebep: 'alan-yok' })
    expect(kapi.kimlikDevret({ sid: YENI, slug: 'satis', memoryDizinleri: [mem] })).toMatchObject({ devir: false, sebep: 'dosya-yok' })
  })

  it('canliKayitVarMi pencere kaydını okur; kayıt yoksa false (devir engellenmez)', () => {
    const sessions = yeniDizin('canli')
    oturumKaydi(sessions, BASKA, 'Blog')
    expect(kimlik.canliKayitVarMi(BASKA, sessions)).toBe(true)
    expect(kimlik.canliKayitVarMi(YENI, sessions)).toBe(false)
    expect(kimlik.canliKayitVarMi(YENI, path.join(sessions, 'yok'))).toBe(false)
  })
})

describe('INV-YENIDUZEN-KIMLIK-4 · önceki kimlikler (posta devri için)', () => {
  it('eski kimlik listeye EN BAŞA girer, güncel sid listede olmaz, tekrar yok, tavan uygulanır', () => {
    const dosya = path.join(yeniDizin('kayit'), 'rol-kimlikleri.json')
    const kimlikler = Array.from({ length: 8 }, (_, i) => `aaaaaaaa-0000-4000-8000-00000000000${i}`)
    for (const k of kimlikler) kimlik.kimlikKaydet({ rol: 'ARAC', sid: YENI, eski: k, dosya })
    const o = kimlik.oncekiKimlikler('ARAC', YENI, dosya)
    expect(o.length).toBe(kimlik.ONCEKI_TAVAN)
    expect(o[0]).toBe(kimlikler[7])
    expect(o).not.toContain(YENI)
    expect(new Set(o).size).toBe(o.length)
    // yeni pencere açılınca bir önceki güncel sid de önceki listesine geçer
    const yeniden = kimlik.kimlikKaydet({ rol: 'ARAC', sid: BASKA, dosya })
    expect(yeniden.oncekiler[0]).toBe(YENI)
    expect(kimlik.oncekiKimlikler('ARAC', BASKA, dosya)).not.toContain(BASKA)
  })

  it('geçersiz girdi hata vermez (fail-open): sid UUID değil, rol boş', () => {
    const dosya = path.join(yeniDizin('kayit-bos'), 'k.json')
    expect(kimlik.kimlikKaydet({ rol: 'ARAC', sid: 'benim1', dosya })).toEqual({ yazildi: false, oncekiler: [] })
    expect(kimlik.kimlikKaydet({ rol: '', sid: YENI, dosya })).toEqual({ yazildi: false, oncekiler: [] })
    expect(fs.existsSync(dosya)).toBe(false)
  })
})

describe('INV-YENIDUZEN-KIMLIK-5 · SessionStart kancası (süreç): rol kartı, devir, claim ipucu', () => {
  const uretici = () => {
    const y = path.join(yeniDizin('uretici'), 'rol-karti.cjs')
    yaz(y, "process.stdout.write('SAHTE-OZET ' + process.argv[3])\n")
    return y
  }
  function kanca(cwd: string, env: Record<string, string> = {}, girdi: Record<string, unknown> = {}) {
    const t = yeniDizin('kanca')
    const r = spawnSync(process.execPath, [KANCA_YOLU], {
      input: JSON.stringify({ session_id: YENI, source: 'startup', cwd, hook_event_name: 'SessionStart', ...girdi }),
      encoding: 'utf8',
      cwd: t,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: KOK,
        CC_LANE: '',
        VH_ROL_KARTI_URETICI: uretici(),
        VENTHUB_BOARD_DIR: path.join(t, 'pano'),
        VENTHUB_OTURUM_KAYIT_DIZINI: path.join(t, 'kayit'),
        VENTHUB_SESSIONS_DIZINI: path.join(t, 'sessions'),
        VENTHUB_ROL_KIMLIK_DOSYASI: path.join(t, 'rol-kimlikleri.json'),
        VENTHUB_ANA_PROJE_DIZINI: path.join(t, 'ana'),
        ...env,
      },
      windowsHide: true,
      timeout: 60_000,
    })
    let ek = r.stdout || ''
    try {
      ek = (JSON.parse(r.stdout) as { hookSpecificOutput?: { additionalContext?: string } }).hookSpecificOutput?.additionalContext ?? ''
    } catch {
      /* JSON değil: ham metin ölçülür ve aşağıdaki kontroller başarısız olur */
    }
    return { ek, durum: r.status, t }
  }

  it('agent anahtarlı pencere: rol kartı doğru rolü gösterir, claim ipucunda şerit adı hazır', () => {
    const { ek, durum } = kanca(pencereKlasoru('arac-pencere'))
    expect(durum).toBe(0)
    expect(ek).toContain('ROL KARTI: ARAC — SAHTE-OZET ARAC')
    expect(ek).not.toContain('bilinmiyor')
    expect(ek).toContain('--lane arac')
  })

  it('OPS örneği: ops-pencere → ROL KARTI: OPS (eski davranış korunur)', () => {
    const { ek } = kanca(pencereKlasoru('ops-pencere'))
    expect(ek).toContain('ROL KARTI: OPS — SAHTE-OZET OPS')
  })

  it('anahtarsız pencere: önceki davranış aynen (rol bilinmiyor, ipucu "<ad>")', () => {
    const { ek } = kanca(pencereKlasoru(null))
    expect(ek).toContain('ROL KARTI: (bu oturumun seridi/rolu bilinmiyor')
    expect(ek).toContain('--lane <ad>')
  })

  it('çalışan ajan tipi (`arac-arastirmaci`) pencere değildir: rol kartı bilinmiyor kalır', () => {
    const { ek } = kanca(pencereKlasoru('arac-arastirmaci'))
    expect(ek).toContain('bilinmiyor')
  })

  it('⭐UYDURMA sid worktree kimlik dosyasına YAZILMAZ; gerçek UUID yazılır ("KIMLIK YOK" kök sebebi)', () => {
    // Bağlı bir worktree gerekir: ana dizinde kanca kimlik yazmaz (cetvel §19), uydurma sid kolu ona hiç ulaşmaz.
    const ana = yeniDizin('git-ana')
    const git = (cwd: string, ...a: string[]) => execFileSync('git', a, { cwd, stdio: 'ignore' })
    git(ana, 'init', '-q')
    git(ana, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--allow-empty', '-q', '-m', 'x')
    const wt = path.join(yeniDizin('git-wt'), 'wt')
    git(ana, 'worktree', 'add', '-q', wt)
    const kimlikDosyasi = path.join(ana, '.git', 'worktrees', path.basename(wt), 'venthub-sid')
    kanca(wt, {}, { session_id: '0dfe070e-0000-4000-8000-tavan0000001' })
    expect(fs.existsSync(kimlikDosyasi)).toBe(false)
    kanca(wt, {}, { session_id: YENI })
    expect(fs.readFileSync(kimlikDosyasi, 'utf8').trim()).toBe(YENI)
  })

  it('model sapması GÖRÜNÜR: tanım Sonnet, oturum Opus → uyarı; aynı model, alan yok, tanım yok → sessiz', () => {
    const cwd = pencereKlasoru('arac-pencere')
    yaz(path.join(cwd, '.claude', 'agents', 'arac-pencere.md'), '---\nname: arac-pencere\nmodel: claude-sonnet-5-5\n---\ngövde\n')
    const uyari = kimlik.modelUyarisi({ cwd, agent: 'arac-pencere', oturumModeli: 'claude-opus-5-5' })
    expect(uyari).toContain('MODEL SAPMASI')
    expect(uyari).toContain('claude-sonnet-5-5')
    expect(kimlik.modelUyarisi({ cwd, agent: 'arac-pencere', oturumModeli: 'claude-sonnet-5-5' })).toBe('')
    expect(kimlik.modelUyarisi({ cwd, agent: 'arac-pencere', oturumModeli: 'claude-sonnet-5-5[1m]' })).toBe('')
    expect(kimlik.modelUyarisi({ cwd, agent: 'arac-pencere' })).toBe('') // oturum modeli ölçülemedi → uyarı uydurulmaz
    expect(kimlik.modelUyarisi({ cwd: pencereKlasoru('arac-pencere'), agent: 'arac-pencere', oturumModeli: 'x' })).toBe('') // tanım yok
    // kanca süreci: uyarı açılış metnine girer
    expect(kanca(cwd, {}, { model: 'claude-opus-5-5' }).ek).toContain('MODEL SAPMASI')
    expect(kanca(cwd, {}, { model: 'claude-sonnet-5-5' }).ek).not.toContain('MODEL SAPMASI')
  })

  it('VENTHUB_PENCERE_AGENT tanımlıysa (boş dahil) settings.local.json okunmaz: testler pencereden bağımsız kalır', () => {
    const { ek } = kanca(pencereKlasoru('arac-pencere'), { VENTHUB_PENCERE_AGENT: '' })
    expect(ek).toContain('bilinmiyor')
    expect(kimlik.agentAdi({})).toBe('') // cwd yok → süreç dizinine düşülmez
  })

  it('açılışta kimlik devri: durum dosyası yeni sid alır, eski kimlik kayda geçer, açılış satırı görünür', () => {
    const t = yeniDizin('devir-kanca')
    const ana = path.join(t, 'ana')
    const kayit = path.join(t, 'rol-kimlikleri.json')
    const dosya = path.join(ana, 'memory', 'arac-serit-durumu.md')
    yaz(dosya, durumGovdesi(ESKI))
    const { ek, durum } = kanca(
      pencereKlasoru('arac-pencere'),
      { VENTHUB_ANA_PROJE_DIZINI: ana, VENTHUB_ROL_KIMLIK_DOSYASI: kayit },
      { transcript_path: path.join(t, 'proje-wt', `${YENI}.jsonl`) },
    )
    expect(durum).toBe(0)
    expect(fs.readFileSync(dosya, 'utf8')).toContain(`originSessionId: ${YENI}`)
    expect(ek).toContain('KİMLİK DEVRİ')
    const k = JSON.parse(fs.readFileSync(kayit, 'utf8')) as Record<string, { sid: string; oncekiler: string[] }>
    expect(k.ARAC.sid).toBe(YENI)
    expect(k.ARAC.oncekiler).toContain(ESKI)
  })

  it('önceki kimliğe adreslenmiş posta ÖLÇÜLEMEZSE sessiz geçilmez (sayaç satırı basılır)', () => {
    const t = yeniDizin('posta-eski')
    const kayit = path.join(t, 'rol-kimlikleri.json')
    kimlik.kimlikKaydet({ rol: 'ARAC', sid: YENI, eski: ESKI, dosya: kayit })
    const { ek } = kanca(pencereKlasoru('arac-pencere'), { VENTHUB_ROL_KIMLIK_DOSYASI: kayit })
    // Hermetik koşuda posta sunucusu yok: ölçülemedi satırı ESKİ kimliğin 8 haneli kısaltmasını taşır.
    expect(ek).toMatch(/eski kimlik 65844ccb postası OLCULEMEDI|ESKİ KİMLİĞE ADRESLİ \d+ OKUNMAMIŞ POSTA \(65844ccb/)
  })
})

describe('INV-YENIDUZEN-KIMLIK-6 · Recep sözü defteri başlangıç brief\'ini Recep sözü saymaz', () => {
  const brief =
    "Background (from the session that started this one):\nVentHub HVAC e-ticaret filosu: her departman ayrı pencerede çalışır.\n\nTask:\nSen ARAÇ departmanının müdür penceresisin."

  it('start_session görev metni Recep sözü DEĞİLDİR; sebep açık', () => {
    expect(defter.siniflandir(brief)).toMatchObject({ recep: false, sebep: 'baslangic-brief' })
  })

  it('Recep\'in kendi cümlesi, "Background" kelimesini içerse bile kayda girer', () => {
    const s = defter.siniflandir('354 evet. Background işini sonra konuşuruz.')
    expect(s.recep).toBe(true)
    expect(s.soz).toContain('354 evet')
  })

  it('harness bloğu + brief başlığı arasında Recep sözü varsa söz korunur', () => {
    const s = defter.siniflandir('<system-reminder>x</system-reminder>\n357 hayır')
    expect(s).toMatchObject({ recep: true, soz: '357 hayır' })
  })
})
