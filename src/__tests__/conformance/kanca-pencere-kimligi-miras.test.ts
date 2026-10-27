// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-KANCA-KIMLIK-MIRAS-1 · start_session worktree'sinde MİRAS `ops-pencere` anahtarı OPS sayılmaz (ARC-223, 27 Ekim).
 *
 * Vaka: OPS'tan `start_session` ile açılan Yetenek penceresi rastgele adlı bir worktree'de (`clever-mayer-b2d2d2`) açıldı;
 * Desktop açan oturumun `settings.local.json`'ını kopyaladığı için dosyada `agent: ops-pencere` vardı. Pencere açılışta
 * "OPS KİMLİĞİ: OPS adayı" ve "MODEL SAPMASI: ops-pencere tanımı" uyarısı aldı; Recep Yetenek panelinde gördü.
 * Ölçüm (27 Ekim): gerçek OPS `.claude/worktrees/ops-pencere` içinde; aynı dizinde `clever-mayer-b2d2d2` anahtarı miras.
 *
 * Kural: `ops-pencere` anahtarı, adı `ops-pencere` olmayan bir `.claude/worktrees/<ad>` içindeyse MİRASTIR. Diğer rollerin
 * anahtarları ve kancaya gelen gerçek `agent_type` etkilenmez.
 */

interface Kimlik {
  agentAnahtari: (cwd: string) => string
  agentAdi: (o: { cwd?: string; agentType?: string }) => string
  opsMirasMi: (kok: string, agent: string) => boolean
  modelUyarisi: (o: { cwd?: string; agent?: string; oturumModeli?: string }) => string
}
interface Ops {
  opsAdayiMi: (o?: { cwd?: string; agentType?: string }) => boolean
}

const KOK = process.cwd()
const req = createRequire(import.meta.url)
const KIMLIK_YOLU = path.resolve(KOK, 'scripts', 'board', 'pencere-kimligi.cjs')
const kimlik = req(KIMLIK_YOLU) as Kimlik
const ops = req(path.resolve(KOK, 'scripts', 'board', 'ops-oturumu.cjs')) as Ops

let gecici: string

/** `<gecici>/<depo>/.claude/worktrees/<ad>` ya da (ad=null) `<gecici>/<depo>` köküne `settings.local.json` yazar. */
function pencere(ad: string | null, agent: string): string {
  const depo = path.join(gecici, 'depo-' + Math.random().toString(36).slice(2, 8))
  const kok = ad === null ? depo : path.join(depo, '.claude', 'worktrees', ad)
  fs.mkdirSync(path.join(kok, '.claude'), { recursive: true })
  fs.writeFileSync(path.join(kok, '.claude', 'settings.local.json'), JSON.stringify({ agent }))
  return kok
}

beforeAll(() => {
  // VENTHUB_PENCERE_AGENT testte tanımlıysa agentAdi ayar dosyasını hiç okumaz; bu testin ölçtüğü şey dosya yoludur.
  delete process.env.VENTHUB_PENCERE_AGENT
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kimlik-miras-'))
})
afterAll(() => fs.rmSync(gecici, { recursive: true, force: true }))

describe('INV-KANCA-KIMLIK-MIRAS-1 · miras ops-pencere anahtarı', () => {
  it('⭐ASIL VAKA — rastgele adlı worktree\'deki ops-pencere anahtarı kimlik DEĞİL: rol yok, OPS adayı değil, model uyarısı yok', () => {
    const cwd = pencere('clever-mayer-b2d2d2', 'ops-pencere')
    expect(kimlik.agentAnahtari(cwd)).toBe('')
    expect(kimlik.agentAdi({ cwd })).toBe('')
    expect(ops.opsAdayiMi({ cwd })).toBe(false)
    // agent '' ise modelUyarisi sessizdir: ops-pencere tanımıyla kıyas hiç yapılmaz.
    expect(kimlik.modelUyarisi({ cwd, agent: kimlik.agentAdi({ cwd }), oturumModeli: 'claude-opus-4-7' })).toBe('')
  })

  it('DÖNÜŞ YÖNÜ — gerçek OPS worktree\'si (ops-pencere) hâlâ OPS adayı ve rolü OPS', () => {
    const cwd = pencere('ops-pencere', 'ops-pencere')
    expect(kimlik.agentAnahtari(cwd)).toBe('ops-pencere')
    expect(ops.opsAdayiMi({ cwd })).toBe(true)
  })

  it('DÖNÜŞ YÖNÜ — worktree olmayan kök (ana depo) ops-pencere anahtarı hâlâ geçerli', () => {
    const cwd = pencere(null, 'ops-pencere')
    expect(kimlik.agentAnahtari(cwd)).toBe('ops-pencere')
    expect(ops.opsAdayiMi({ cwd })).toBe(true)
  })

  it('DİĞER ROLLER ETKİLENMEZ — rastgele worktree\'deki yetenek-pencere anahtarı kimlik olarak kalır', () => {
    const cwd = pencere('clever-mayer-b2d2d2', 'yetenek-pencere')
    expect(kimlik.agentAnahtari(cwd)).toBe('yetenek-pencere')
    expect(ops.opsAdayiMi({ cwd })).toBe(false)
  })

  it('GERÇEK agent_type kazanır — kancaya gelen ops-pencere, miras dosyadan bağımsız OPS sayılır', () => {
    const cwd = pencere('clever-mayer-b2d2d2', 'ops-pencere')
    expect(kimlik.agentAdi({ cwd, agentType: 'ops-pencere' })).toBe('ops-pencere')
    expect(ops.opsAdayiMi({ cwd, agentType: 'ops-pencere' })).toBe(true)
  })

  it('opsMirasMi sınırları — başka rol, boş değer ve worktrees dışı yol miras değil', () => {
    const w = path.join(gecici, 'x', '.claude', 'worktrees', 'rastgele-ad-abc123')
    expect(kimlik.opsMirasMi(w, 'ops-pencere')).toBe(true)
    expect(kimlik.opsMirasMi(w, 'arac-pencere')).toBe(false)
    expect(kimlik.opsMirasMi(w, '')).toBe(false)
    expect(kimlik.opsMirasMi(path.join(gecici, 'x'), 'ops-pencere')).toBe(false)
    expect(kimlik.opsMirasMi(path.join(gecici, 'x', '.claude', 'worktrees', 'ops-pencere'), 'ops-pencere')).toBe(false)
  })

  it('⭐SABOTAJ — miras denetimi kaynaktan çıkarılırsa ASIL VAKA kolu KIRMIZIYA döner (kapı gerçekten ölçüyor)', () => {
    const kaynak = fs.readFileSync(KIMLIK_YOLU, 'utf8')
    const hedef = "if (j && typeof j.agent === 'string' && opsMirasMi(d, j.agent)) return ''"
    expect(kaynak, 'sabotaj hedef satırı kaynakta yok — kapı yeniden adlandırılmış olabilir').toContain(hedef)
    const sabote = path.join(gecici, 'pencere-kimligi.sabote.cjs')
    fs.writeFileSync(sabote, kaynak.replace(hedef, '/* sabotaj: miras denetimi yok */'), 'utf8')
    const bozuk = req(sabote) as Kimlik
    const cwd = pencere('clever-mayer-b2d2d2', 'ops-pencere')
    expect(bozuk.agentAnahtari(cwd), 'sabote kopya miras anahtarı kimlik saydı: asıl kol bunu yakalar').toBe('ops-pencere')
  })
})
