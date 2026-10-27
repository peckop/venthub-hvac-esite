// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-KANCA-ROL-YAZ-1 · start_session worktree'sine rol anahtarı yazan araç (ARC-224, 27 Ekim).
 *
 * Vaka: `start_session` rastgele adlı worktree açar, rol vermez ve OPS'un `settings.local.json`'ını kopyalar; Yetenek
 * penceresi OPS anahtarını miras aldı (ARC-223) ve Opus'ta açıldı (tanım Sonnet). Araç: pencere açıldıktan sonra OPS
 * koşar, `agent: <ad>-pencere` yazar, diğer anahtarlara dokunmaz ve `start_session` için tanımdaki modeli söyler.
 */

interface Plan {
  ok: boolean
  sebep?: string
  zaten?: boolean
  hedef?: string
  ajan?: string
  onceki?: string
  model?: string
  yazilacak?: Record<string, unknown> | null
}
interface Arac {
  ajanAdi: (rol: string) => string
  planla: (o: { worktree?: string; rol?: string; zorla?: boolean; depo?: string }) => Plan
  uygula: (plan: Plan) => boolean
}

const KOK = process.cwd()
const req = createRequire(import.meta.url)
const BETIK = path.resolve(KOK, 'scripts', 'board', 'pencere-rol-yaz.cjs')
const arac = req(BETIK) as Arac

let gecici: string
let n = 0

/** `<gecici>/depo-N/.claude/worktrees/<ad>`; icerik verilirse settings.local.json yazılır (string = ham metin). */
function worktree(ad: string, icerik?: Record<string, unknown> | string): string {
  const kok = path.join(gecici, 'depo-' + ++n, '.claude', 'worktrees', ad)
  fs.mkdirSync(path.join(kok, '.claude'), { recursive: true })
  if (icerik !== undefined) {
    fs.writeFileSync(
      path.join(kok, '.claude', 'settings.local.json'),
      typeof icerik === 'string' ? icerik : JSON.stringify(icerik),
    )
  }
  return kok
}
const oku = (wt: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(wt, '.claude', 'settings.local.json'), 'utf8')) as Record<string, unknown>

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-rol-yaz-'))
})
afterAll(() => fs.rmSync(gecici, { recursive: true, force: true }))

describe('INV-KANCA-ROL-YAZ-1 · planla (saf karar, dosyaya yazmaz)', () => {
  it('rol adı normalleşir: yetenek ve yetenek-pencere aynı ajan; geçersiz boş', () => {
    expect(arac.ajanAdi('yetenek')).toBe('yetenek-pencere')
    expect(arac.ajanAdi('Yetenek-Pencere')).toBe('yetenek-pencere')
    expect(arac.ajanAdi('geo-seo')).toBe('geo-seo-pencere')
    expect(arac.ajanAdi('')).toBe('')
    expect(arac.ajanAdi('../x')).toBe('')
  })

  it('⭐ASIL VAKA — miras ops-pencere anahtarı rolle DEĞİŞİR, diğer anahtarlar aynen kalır, model tanımdan gelir', () => {
    const wt = worktree('clever-mayer-b2d2d2', { agent: 'ops-pencere', permissions: { allow: ['Bash(ls:*)'] } })
    const p = arac.planla({ worktree: wt, rol: 'yetenek' })
    expect(p.ok).toBe(true)
    expect(p.onceki).toBe('ops-pencere')
    expect(p.yazilacak).toEqual({ agent: 'yetenek-pencere', permissions: { allow: ['Bash(ls:*)'] } })
    expect(p.model, 'tanımdaki model start_session için söylenmeli').toMatch(/^claude-/)
    expect(fs.existsSync(path.join(wt, '.claude', 'settings.local.json.rol-yaz.tmp'))).toBe(false)
    expect(oku(wt).agent, 'planla DOSYAYA YAZMAMALI').toBe('ops-pencere')
  })

  it('dosya yoksa yeni dosya planlanır', () => {
    const wt = worktree('beautiful-hawking-73a0af')
    const p = arac.planla({ worktree: wt, rol: 'harita' })
    expect(p.ok).toBe(true)
    expect(p.yazilacak).toEqual({ agent: 'harita-pencere' })
  })

  it('aynı rol zaten yazılıysa "zaten" (değişiklik yok)', () => {
    const wt = worktree('x-y-aaaaaa', { agent: 'urun-pencere' })
    const p = arac.planla({ worktree: wt, rol: 'urun' })
    expect(p.ok && p.zaten).toBe(true)
    expect(p.yazilacak).toBeNull()
  })

  it('başka bir rolün anahtarı REDDEDİLİR; --zorla ile değişir', () => {
    const wt = worktree('x-y-bbbbbb', { agent: 'altyapi-pencere' })
    const red = arac.planla({ worktree: wt, rol: 'yetenek' })
    expect(red.ok).toBe(false)
    expect(red.sebep).toMatch(/başka bir rol/)
    expect(arac.planla({ worktree: wt, rol: 'yetenek', zorla: true }).ok).toBe(true)
  })

  it('REDDEDİLENLER — ops rolü, ops-pencere worktree\'si, ana depo (worktrees dışı), bilinmeyen rol, bozuk JSON, olmayan dizin', () => {
    expect(arac.planla({ worktree: worktree('r-s-cccccc'), rol: 'ops' }).sebep).toMatch(/ops rolü/)
    expect(arac.planla({ worktree: worktree('ops-pencere'), rol: 'yetenek' }).sebep).toMatch(/ops-pencere worktree/)
    const anaDepo = path.join(gecici, 'ana-depo')
    fs.mkdirSync(path.join(anaDepo, '.claude'), { recursive: true })
    expect(arac.planla({ worktree: anaDepo, rol: 'yetenek' }).sebep).toMatch(/ana depoya yazılmaz/)
    expect(arac.planla({ worktree: worktree('r-s-dddddd'), rol: 'olmayanrol' }).sebep).toMatch(/ajan tanımı yok/)
    expect(arac.planla({ worktree: worktree('r-s-eeeeee', '{bozuk'), rol: 'yetenek' }).sebep).toMatch(/bozuk/)
    expect(arac.planla({ worktree: path.join(gecici, 'yok', '.claude', 'worktrees', 'a-b-ffffff'), rol: 'yetenek' }).sebep).toMatch(/worktree dizini yok/)
    expect(arac.planla({ worktree: worktree('r-s-gggggg', '[1]'), rol: 'yetenek' }).sebep).toMatch(/nesne değil/)
  })
})

describe('INV-KANCA-ROL-YAZ-1 · uygula ve CLI', () => {
  it('uygula dosyayı yazar, geçici dosya kalmaz; ikinci uygulama "zaten"', () => {
    const wt = worktree('u-v-hhhhhh', { agent: 'ops-pencere', baska: 1 })
    expect(arac.uygula(arac.planla({ worktree: wt, rol: 'blog' }))).toBe(true)
    expect(oku(wt)).toEqual({ agent: 'blog-pencere', baska: 1 })
    expect(fs.existsSync(path.join(wt, '.claude', 'settings.local.json.rol-yaz.tmp'))).toBe(false)
    expect(arac.uygula(arac.planla({ worktree: wt, rol: 'blog' }))).toBe(false)
  })

  it('CLI varsayılanı PLAN: --yaz olmadan dosya DEĞİŞMEZ; --yaz ile yazılır; reddedilince çıkış 1', () => {
    const wt = worktree('w-x-iiiiii', { agent: 'ops-pencere' })
    const kos = (...a: string[]) => spawnSync(process.execPath, [BETIK, wt, ...a], { encoding: 'utf8' })
    const plan = kos('yetenek')
    expect(plan.status).toBe(0)
    expect(plan.stdout).toContain('PLAN')
    expect(plan.stdout).toContain('start_session model önerisi')
    expect(oku(wt).agent).toBe('ops-pencere')
    const yaz = kos('yetenek', '--yaz')
    expect(yaz.status).toBe(0)
    expect(yaz.stdout).toContain('YAZILDI')
    expect(oku(wt).agent).toBe('yetenek-pencere')
    expect(kos('ops', '--yaz').status).toBe(1)
  })

  it('⭐SABOTAJ — worktrees koruması kaynaktan çıkarılırsa ana depoya yazım planlanır (kapı gerçekten ölçüyor)', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const hedef = "if (ust !== 'worktrees' || ustUst !== '.claude') return red("
    expect(kaynak, 'sabotaj hedefi kaynakta yok — kapı yeniden adlandırılmış olabilir').toContain(hedef)
    const sabote = path.join(gecici, 'pencere-rol-yaz.sabote.cjs')
    fs.writeFileSync(sabote, kaynak.replace(hedef, "if (false) return red("), 'utf8')
    const bozuk = req(sabote) as Arac
    const anaDepo = path.join(gecici, 'ana-depo')
    const p = bozuk.planla({ worktree: anaDepo, rol: 'yetenek', depo: KOK })
    expect(p.ok, 'sabote kopya ana depoya yazım planladı: gerçek kol bunu yakalar').toBe(true)
  })
})
