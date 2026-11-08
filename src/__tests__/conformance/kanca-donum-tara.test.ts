/**
 * INV-DONUM-TARA-1 — günlük dönüm sayımı (ARC-280, OPS-257): departman ve gün başına "yeniden yazılan betik" ve "elle komut".
 * Çekirdek: scripts/arac/donum-tara.cjs · açılış kancası: .claude/hooks/donum-tara-acilis.cjs (SessionStart).
 */
import { spawnSync } from 'node:child_process'
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const CEKIRDEK = path.join(KOK, 'scripts', 'arac', 'donum-tara.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'donum-tara-acilis.cjs')

type Say = { betik: number; yeniden: number; elle: number }
type Durum = { surum: number; dosyalar: Record<string, unknown>; gunler: Record<string, Record<string, Say>>; kokler: Record<string, string[]> }
interface Modul {
  departman: (d: string) => string
  kok: (ad: string) => string
  satirSay: (satir: string, dept: string, durum: Durum) => void
  tara: (o: Record<string, unknown>) => { durum: Durum; atlanan: string[]; eksik: boolean }
  satirUret: (durum: Durum, bugun: string, o?: { atlanan?: string[]; eksik?: boolean }) => string
  gunluk: (o: Record<string, unknown>) => string
  bos: () => Durum
}
const m = gerek(CEKIRDEK) as Modul

const gecici: string[] = []
const dizin = () => {
  const d = mkdtempSync(path.join(tmpdir(), 'donum-'))
  gecici.push(d)
  return d
}
afterEach(() => {
  while (gecici.length) rmSync(gecici.pop() as string, { recursive: true, force: true })
  delete process.env.VENTHUB_DONUM_DIZINI
  delete process.env.VENTHUB_DONUM_PROJELER
})

const zaman = (gun: string) => `${gun}T09:00:00`
const yaz = (gun: string, _etiket: string, yol: string) =>
  JSON.stringify({ timestamp: zaman(gun), message: { content: [{ type: 'tool_use', name: 'Write', input: { file_path: yol, content: 'x' } }] } })
const bash = (gun: string, komut: string) =>
  JSON.stringify({ timestamp: zaman(gun), message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: komut } }] } })

describe('INV-DONUM-TARA-1 · saf parçalar', () => {
  it('departman proje dizin adından; kök betik adından', () => {
    expect(m.departman('C--Users-alize-venthub-hvac--claude-worktrees-arac-pencere')).toBe('arac')
    expect(m.departman('C--Users-alize-venthub-hvac--claude-worktrees-blog-pencere')).toBe('blog')
    expect(m.departman('C--Users-alize-venthub-hvac')).toBe('ana')
    expect(m.kok('say-itme4.cjs')).toBe(m.kok('say-itme.cjs'))
    expect(m.kok('say-betik2.cjs')).toBe('say-betik')
    expect(m.kok('mut-yeni.cjs')).toBe('mut')
  })

  it('yeniden yazılan betik: aynı kök ikinci kez; depodaki scripts/ ve hooks yolu sayılmaz; elle komut kategorileri', () => {
    const d = m.bos()
    const g = '2026-11-07'
    m.satirSay(yaz(g, 'a', 'C:/tmp/scratchpad/say-itme.cjs'), 'arac', d)
    m.satirSay(yaz(g, 'b', 'C:/tmp/scratchpad/say-itme2.cjs'), 'arac', d)
    m.satirSay(yaz(g, 'c', 'C:/repo/scripts/arac/kalici.cjs'), 'arac', d)
    m.satirSay(yaz(g, 'd', 'C:/repo/.claude/hooks/kanca.cjs'), 'arac', d)
    m.satirSay(yaz(g, 'e', 'C:/tmp/not.md'), 'arac', d)
    m.satirSay(bash(g, 'gh api repos/x/y/commits/abc/check-runs'), 'arac', d)
    m.satirSay(bash(g, 'git switch -C arac/gecici-merge origin/master'), 'arac', d)
    m.satirSay(bash(g, 'ls -la'), 'arac', d)
    expect(d.gunler[g].arac).toEqual({ betik: 2, yeniden: 1, elle: 2 })
    // bozuk satır sessiz atlanır
    m.satirSay('{"tool_use" bozuk', 'arac', d)
    expect(d.gunler[g].arac.betik).toBe(2)
  })
})

describe('INV-DONUM-TARA-1 · tarama (artımlı, atlama, tavan, boşluk)', () => {
  const kur = () => {
    const proje = dizin()
    const alt = path.join(proje, 'C--Users-alize-venthub-hvac--claude-worktrees-arac-pencere')
    mkdirSync(alt)
    return { proje, dosya: path.join(alt, 's1.jsonl') }
  }

  it('artımlı: ikinci koşu yalnız eklenen satırları sayar (çifte sayım yok); yarım satır sonraki koşuya kalır', () => {
    const { proje, dosya } = kur()
    writeFileSync(dosya, [yaz('2026-11-06', 'a', 'C:/tmp/x-tool.cjs'), yaz('2026-11-06', 'b', 'C:/tmp/x-tool2.cjs')].join('\n') + '\n')
    const durum = m.bos()
    m.tara({ kok: proje, durum })
    expect(durum.gunler['2026-11-06'].arac).toEqual({ betik: 2, yeniden: 1, elle: 0 })
    m.tara({ kok: proje, durum })
    expect(durum.gunler['2026-11-06'].arac.betik).toBe(2)
    appendFileSync(dosya, bash('2026-11-06', 'cp a a.yedek') + '\n' + '{"yarim":')
    m.tara({ kok: proje, durum })
    expect(durum.gunler['2026-11-06'].arac.elle).toBe(1)
    appendFileSync(dosya, '1}\n')
    m.tara({ kok: proje, durum })
    expect(durum.gunler['2026-11-06'].arac.elle).toBe(1)
  })

  it('⛔ büyük döküm atlanır ve satırda söylenir; süre tavanı dolunca eksik işaretlenir', () => {
    const { proje, dosya } = kur()
    writeFileSync(dosya, yaz('2026-11-06', 'a', 'C:/tmp/x.cjs') + '\n')
    const atla = m.tara({ kok: proje, durum: m.bos(), buyukSinir: 10 })
    expect(atla.atlanan).toHaveLength(1)
    expect(m.satirUret(atla.durum, '2026-11-08', atla)).toContain('1 döküm >300MB atlandı')
    let t = 0
    const tavan = m.tara({ kok: proje, durum: m.bos(), tavanMs: 5, simdi: () => (t += 10) })
    expect(tavan.eksik).toBe(true)
    expect(m.satirUret(tavan.durum, '2026-11-08', tavan)).toContain('tamamlanmadı')
  })

  it('satır: önceki güne göre sayılar; boşluk ve veri yok açıkça yazılır', () => {
    const d = m.bos()
    d.gunler['2026-11-05'] = { arac: { betik: 5, yeniden: 5, elle: 9 } }
    d.gunler['2026-11-07'] = { arac: { betik: 3, yeniden: 3, elle: 12 }, blog: { betik: 0, yeniden: 0, elle: 0 } }
    const s = m.satirUret(d, '2026-11-08')
    expect(s).toContain('DÖNÜM 2026-11-07: arac yeniden-betik 3 (önceki 5), elle 12 (9)')
    expect(s).not.toContain('blog') // sıfır etkinlik satırı şişirmez
    expect(s).toContain('1 gün boşluk')
    expect(m.satirUret(d, '2026-11-10')).toContain('dün verisi yok, son veri 2026-11-07')
    expect(m.satirUret(m.bos(), '2026-11-08')).toContain('veri yok')
  })

  it('günlük koruma: aynı gün ikinci koşu taramaz (gün damgası); yeni gün tarar; --zorla her zaman tarar', () => {
    const { proje, dosya } = kur()
    process.env.VENTHUB_DONUM_DIZINI = dizin()
    process.env.VENTHUB_DONUM_PROJELER = proje
    writeFileSync(dosya, yaz('2026-11-07', 'a', 'C:/tmp/x.cjs') + '\n')
    let cagri = 0
    const tarayici = (o: Record<string, unknown>) => {
      cagri += 1
      return m.tara({ ...o, kok: proje })
    }
    const a = m.gunluk({ bugun: '2026-11-08', tarayici })
    const b = m.gunluk({ bugun: '2026-11-08', tarayici })
    expect(cagri).toBe(1)
    expect(b).toBe(a)
    m.gunluk({ bugun: '2026-11-09', tarayici })
    expect(cagri).toBe(2)
    m.gunluk({ bugun: '2026-11-09', tarayici, zorla: true })
    expect(cagri).toBe(3)
  })

  it('dizin yoksa fail-open (eksik=true, çökme yok)', () => {
    const r = m.tara({ kok: path.join(dizin(), 'yok'), durum: m.bos() })
    expect(r.eksik).toBe(true)
  })
})

describe('INV-DONUM-TARA-1 · açılış kancası (süreç)', () => {
  const kos = (girdi: unknown, env: Record<string, string>) =>
    spawnSync(process.execPath, [KANCA], { input: JSON.stringify(girdi), encoding: 'utf8', env: { ...process.env, ...env } })

  it('OPS penceresine tek satır basar; diğer pencere sessiz; vana sessiz; hepsi çıkış 0', () => {
    const ev = dizin()
    const proje = dizin()
    const alt = path.join(proje, 'C--Users-alize-venthub-hvac--claude-worktrees-arac-pencere')
    mkdirSync(alt)
    writeFileSync(path.join(alt, 's.jsonl'), yaz('2026-11-06', 'a', 'C:/tmp/x.cjs') + '\n' + yaz('2026-11-06', 'b', 'C:/tmp/x2.cjs') + '\n')
    const sid = '11111111-2222-3333-4444-555555555555'
    const opsDosya = path.join(ev, 'ops-oturumu.json')
    writeFileSync(opsDosya, JSON.stringify({ sid, ts: Date.now(), kaynak: 'startup' }))
    const env = { VENTHUB_DONUM_DIZINI: ev, VENTHUB_DONUM_PROJELER: proje, VH_OPS_OTURUMU_DOSYASI: opsDosya }
    const ops = kos({ session_id: sid }, env)
    expect(ops.status).toBe(0)
    expect(ops.stdout).toMatch(/^DÖNÜM /)
    expect(ops.stdout.trim().split('\n')).toHaveLength(1)
    const diger = kos({ session_id: '99999999-2222-3333-4444-555555555555' }, env)
    expect(diger.status).toBe(0)
    expect(diger.stdout).toBe('')
    const vana = kos({ session_id: sid }, { ...env, VENTHUB_DONUM_TARA_KAPAT: '1' })
    expect(vana.status).toBe(0)
    expect(vana.stdout).toBe('')
    const bozuk = spawnSync(process.execPath, [KANCA], { input: 'bozuk{', encoding: 'utf8', env: { ...process.env, ...env } })
    expect(bozuk.status).toBe(0)
  })
})
