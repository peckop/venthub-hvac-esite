import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-PENCERE-ACILIS-1 · start_session sonrası açılış denetimi (ARC-245, OPS 3 Kasım).
 *
 * Ölçülmüş vaka (3 Kasım): MEVZUAT penceresi Opus açıldı, agent anahtarı ops-pencere kaldı, tanım dosyası hiç yoktu,
 * durum dosyası kurulmadı. Kanca salt-okumadır; her eksiği tek blokta söyler. Her sabotaj kolu, ilgili denetimi
 * bozunca testin kırmızıya döndüğünü bağlar (denetim kaldırılırsa "eksik yok" yeşili sahte olur).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'pencere-acilis-denetimi.cjs')
interface DenetimSecenek {
  depo: string
  simdi?: number
  hafizaDizini?: string | null
  yaz?: boolean
  ureticiListesi?: string[]
  kilitDosyasi?: string | null
}
const motor = require_(path.join(KOK, 'scripts', 'board', 'pencere-acilis-denetimi.cjs')) as {
  denetle: (
    girdi: { tool_input: Record<string, unknown> },
    o: DenetimSecenek,
  ) => null | { rol: string; ajan: string; bulgular: string[]; komutlar: string[]; yazildi: string[] }
  blok: (s: unknown) => string
  acmaKapisi: (girdi: { tool_input: Record<string, unknown> }) => string | null
  modelUyumlu: (v: string, b: string) => boolean
  anaDepo: (d: string) => string
}
// Testler gerçek kilit dosyasından ve gerçek üretici listesinden bağımsız koşar; ilgili testler kendi değerini verir.
const asilDenetle = motor.denetle
motor.denetle = (g, o) => asilDenetle(g, { ureticiListesi: ['MEVZUAT'], kilitDosyasi: null, ...o })
const adlar = require_(path.join(KOK, 'scripts', 'board', 'pencere-adlari.cjs')) as {
  departmanAdindan: (m: unknown) => string
}

const gecici: string[] = []
afterEach(() => {
  for (const d of gecici.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

interface Kurulum {
  tanim?: boolean
  agent?: string | null
}
/** Sahte ana depo: .claude/worktrees/yeni-ag (az önce doğdu) + isteğe bağlı ajan tanımı ve settings.local.json. */
function kur({ tanim = true, agent = null }: Kurulum = {}) {
  const depo = fs.mkdtempSync(path.join(os.tmpdir(), 'pad-'))
  gecici.push(depo)
  const wt = path.join(depo, '.claude', 'worktrees', 'yeni-ag')
  fs.mkdirSync(path.join(wt, '.claude', 'agents'), { recursive: true })
  fs.mkdirSync(path.join(depo, '.claude', 'agents'), { recursive: true })
  if (tanim) {
    const t = '---\nname: mevzuat-pencere\nmodel: claude-sonnet-5-5\n---\ngövde\n'
    fs.writeFileSync(path.join(wt, '.claude', 'agents', 'mevzuat-pencere.md'), t)
  }
  if (agent !== null) fs.writeFileSync(path.join(wt, '.claude', 'settings.local.json'), JSON.stringify({ agent, baska: 1 }))
  return { depo, wt }
}
const girdi = (ek: Record<string, unknown> = {}) => ({
  tool_input: { title: 'Mevzuat (yeni düzen)', name: 'mevzuat', model: 'claude-sonnet-5-5', ...ek },
})

describe('INV-PENCERE-ACILIS-1 departman çözümü (sıkı)', () => {
  it('yalnız departman adı (+ süs kelime) çözülür; sıradan başlık çözülmez', () => {
    expect(adlar.departmanAdindan('Mevzuat (yeni düzen)')).toBe('MEVZUAT')
    expect(adlar.departmanAdindan('geo-seo-pencere')).toBe('GEO-SEO')
    expect(adlar.departmanAdindan('3D')).toBe('3D')
    expect(adlar.departmanAdindan('KATALOG')).toBe('KATALOG')
    expect(adlar.departmanAdindan('Blog yazısı PR')).toBe('')
    expect(adlar.departmanAdindan('Araç raporu')).toBe('')
    expect(adlar.departmanAdindan(undefined)).toBe('')
  })
})

describe('INV-PENCERE-ACILIS-1 denetim çekirdeği', () => {
  it('her şey tamamsa bulgu yoktur', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const s = motor.denetle(girdi(), { depo, hafizaDizini: null })
    expect(s && s.bulgular).toEqual([])
    expect(motor.blok(s)).toContain('tamam')
  })

  it('SABOTAJ tanım yok: MEVZUAT olayının kök sebebi yakalanır', () => {
    const { depo } = kur({ tanim: false, agent: 'mevzuat-pencere' })
    const s = motor.denetle(girdi(), { depo, hafizaDizini: null })
    expect(s && s.bulgular.join('\n')).toContain('TANIM YOK')
  })

  it('SABOTAJ model: verilmedi ve farklı yakalanır; takma ad ve tam kimlik geçer', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const hic = motor.denetle({ tool_input: { title: 'Mevzuat' } }, { depo, hafizaDizini: null })
    expect(hic && hic.bulgular.join('\n')).toContain('MODEL VERİLMEDİ')
    const opus = motor.denetle(girdi({ model: 'claude-opus-5-5' }), { depo, hafizaDizini: null })
    expect(opus && opus.bulgular.join('\n')).toContain('MODEL FARKLI')
    const eskiSurum = motor.denetle(girdi({ model: 'claude-sonnet-4-5' }), { depo, hafizaDizini: null })
    expect(eskiSurum && eskiSurum.bulgular.join('\n')).toContain('MODEL FARKLI')
    expect(motor.denetle(girdi({ model: 'sonnet' }), { depo, hafizaDizini: null })?.bulgular).toEqual([])
    expect(motor.modelUyumlu('opus', 'claude-sonnet-5-5')).toBe(false)
  })

  it('SABOTAJ agent anahtarı: miras ops-pencere ve anahtarsızlık yakalanır, hazır komut basılır, dosya DEĞİŞMEZ', () => {
    for (const agent of ['ops-pencere', null]) {
      const { depo, wt } = kur({ agent })
      const dosya = path.join(wt, '.claude', 'settings.local.json')
      const once = fs.existsSync(dosya) ? fs.readFileSync(dosya, 'utf8') : null
      const s = motor.denetle(girdi(), { depo, hafizaDizini: null })
      expect(s && s.bulgular.join('\n')).toContain('AGENT ANAHTARI')
      expect(s && s.komutlar[0]).toContain('pencere-rol-yaz.cjs')
      expect(s && s.komutlar[0]).toContain('--yaz')
      const sonra = fs.existsSync(dosya) ? fs.readFileSync(dosya, 'utf8') : null
      expect(sonra).toBe(once)
    }
  })

  it('vana açıkken (yaz) yalnız agent anahtarını yazar, diğer anahtarları korur', () => {
    const { depo, wt } = kur({ agent: 'ops-pencere' })
    const s = motor.denetle(girdi(), { depo, hafizaDizini: null, yaz: true })
    expect(s && s.bulgular).toEqual([])
    expect(s && s.yazildi).toHaveLength(1)
    const j = JSON.parse(fs.readFileSync(path.join(wt, '.claude', 'settings.local.json'), 'utf8')) as Record<string, unknown>
    expect(j).toEqual({ agent: 'mevzuat-pencere', baska: 1 })
  })

  it('eski worktree aday sayılmaz: bulunamadı bulgusu ve tekrar-sorma komutu', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const s = motor.denetle(girdi(), { depo, hafizaDizini: null, simdi: Date.now() + 10 * 60 * 1000 })
    expect(s && s.bulgular.join('\n')).toContain('WORKTREE BULUNAMADI')
  })

  it('OPS ve sıradan oturum başlığı sessiz geçer (null)', () => {
    const { depo } = kur()
    expect(motor.denetle({ tool_input: { title: 'OPS', name: 'ops' } }, { depo })).toBeNull()
    expect(motor.denetle({ tool_input: { title: 'Blog yazısı PR kontrolü' } }, { depo })).toBeNull()
  })

  it('durum dosyası yoksa bilgi satırı; varsa yok', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const hafiza = fs.mkdtempSync(path.join(os.tmpdir(), 'padh-'))
    gecici.push(hafiza)
    const yok = motor.denetle(girdi(), { depo, hafizaDizini: hafiza })
    expect(yok && yok.bulgular.join('\n')).toContain('DURUM DOSYASI YOK')
    fs.writeFileSync(path.join(hafiza, 'mevzuat-serit-durumu.md'), 'x')
    expect(motor.denetle(girdi(), { depo, hafizaDizini: hafiza })?.bulgular).toEqual([])
  })

  it('SABOTAJ madde 1 üretici listesi: departman PENCERE_DEPARTMANLARI içinde değilse söyler', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const s = motor.denetle(girdi(), { depo, hafizaDizini: null, ureticiListesi: ['ARAC'] })
    expect(s && s.bulgular.join('\n')).toContain('ÜRETİCİ LİSTESİNDE YOK')
  })

  it('SABOTAJ madde 4 pencere kilidi: kilit varken izinli olmayan departman söylenir; izinliyse susar', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'padk-'))
    gecici.push(dizin)
    const kilit = path.join(dizin, 'pencere-kilidi.json')
    fs.writeFileSync(kilit, JSON.stringify({ surum: 2, izinliler: ['ARAC'], koyan: 'test' }))
    const kapali = motor.denetle(girdi(), { depo, hafizaDizini: null, kilitDosyasi: kilit })
    expect(kapali && kapali.bulgular.join('\n')).toContain('MADDE 4 PENCERE KİLİDİ')
    fs.writeFileSync(kilit, JSON.stringify({ surum: 2, izinliler: ['ARAC', 'MEVZUAT'], koyan: 'test' }))
    expect(motor.denetle(girdi(), { depo, hafizaDizini: null, kilitDosyasi: kilit })?.bulgular).toEqual([])
    fs.rmSync(kilit)
    expect(motor.denetle(girdi(), { depo, hafizaDizini: null, kilitDosyasi: kilit })?.bulgular).toEqual([])
  })

  it('worktree içinden koşan kanca ana depoyu çözer', () => {
    const ana = path.join(os.tmpdir(), 'repo')
    expect(motor.anaDepo(path.join(ana, '.claude', 'worktrees', 'x'))).toBe(ana)
    expect(motor.anaDepo(ana)).toBe(ana)
  })
})

describe('INV-PENCERE-ACILIS-1 ARC-244 açma kapısı (PreToolUse)', () => {
  it('SABOTAJ: yalnız departman adı olan başlık/ad reddedilir; kaçış bayrağı, OPS ve sıradan başlık geçer', () => {
    const red = motor.acmaKapisi({ tool_input: { title: 'KATALOG', name: 'katalog' } })
    expect(red).toContain('KATALOG departmanının penceresi zaten var')
    expect(motor.acmaKapisi({ tool_input: { title: 'Altyapı (yeni düzen)' } })).toContain('ALTYAPI')
    expect(motor.acmaKapisi({ tool_input: { name: 'geo-seo-pencere' } })).toContain('GEO-SEO')
    const bayrakli = { title: 'MEVZUAT', prompt: 'Görev...\nYENI-DEPARTMAN-PENCERESI: Recep onayı 2026-11-03' }
    expect(motor.acmaKapisi({ tool_input: bayrakli })).toBeNull()
    expect(motor.acmaKapisi({ tool_input: { title: 'MEVZUAT', prompt: 'Recep onayı verdi' } })).not.toBeNull()
    expect(motor.acmaKapisi({ tool_input: { title: 'OPS', name: 'ops' } })).toBeNull()
    expect(motor.acmaKapisi({ tool_input: { title: 'Blog yazısı PR kontrolü' } })).toBeNull()
    expect(motor.acmaKapisi({ tool_input: {} })).toBeNull()
  })
})

function kancaKos(stdin: string, depo: string, env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [KANCA], {
    input: stdin,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: depo, VENTHUB_ANA_PROJE_DIZINI: path.join(depo, 'yok'), ...env },
  })
}

describe('INV-PENCERE-ACILIS-1 kanca kabuğu', () => {
  it('start_session çağrısında additionalContext basar; çıktı tavanlı, çıkış 0', () => {
    const { depo } = kur({ agent: 'ops-pencere' })
    const r = kancaKos(JSON.stringify({ tool_name: 'mcp__ccd_session__start_session', ...girdi() }), depo)
    expect(r.status).toBe(0)
    const o = JSON.parse(r.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(o.hookSpecificOutput.hookEventName).toBe('PostToolUse')
    expect(o.hookSpecificOutput.additionalContext).toContain('AGENT ANAHTARI')
    expect(o.hookSpecificOutput.additionalContext.length).toBeLessThanOrEqual(1200)
  })

  it('başka araç, bozuk girdi ve vana: sessiz, çıkış 0 (fail-open)', () => {
    const { depo } = kur({ agent: 'ops-pencere' })
    const baska = kancaKos(JSON.stringify({ tool_name: 'Bash', ...girdi() }), depo)
    expect([baska.status, baska.stdout]).toEqual([0, ''])
    const bozuk = kancaKos('{{{', depo)
    expect([bozuk.status, bozuk.stdout]).toEqual([0, ''])
    const vana = kancaKos(JSON.stringify({ tool_name: 'mcp__ccd_session__start_session', ...girdi() }), depo, {
      VENTHUB_PENCERE_ACILIS_KAPAT: '1',
    })
    expect([vana.status, vana.stdout]).toEqual([0, ''])
  })

  it('varsayılan salt-okuma: yaz vanası yokken settings.local.json değişmez', () => {
    const { depo, wt } = kur({ agent: 'ops-pencere' })
    const dosya = path.join(wt, '.claude', 'settings.local.json')
    const once = fs.readFileSync(dosya, 'utf8')
    kancaKos(JSON.stringify({ tool_name: 'mcp__ccd_session__start_session', ...girdi() }), depo)
    expect(fs.readFileSync(dosya, 'utf8')).toBe(once)
  })

  it('Pre olayında departman adı start_session reddedilir (deny JSON); vana ve kaçış bayrağı susturur; Post olayı reddetmez', () => {
    const { depo } = kur({ agent: 'mevzuat-pencere' })
    const pre = { tool_name: 'mcp__ccd_session__start_session', hook_event_name: 'PreToolUse', tool_input: { title: 'KATALOG' } }
    const r = kancaKos(JSON.stringify(pre), depo)
    expect(r.status).toBe(0)
    const o = JSON.parse(r.stdout) as { hookSpecificOutput: { permissionDecision: string; permissionDecisionReason: string } }
    expect(o.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(o.hookSpecificOutput.permissionDecisionReason).toContain('SendMessage')
    const vana = kancaKos(JSON.stringify(pre), depo, { VENTHUB_PENCERE_ACMA_KAPAT: '1' })
    expect([vana.status, vana.stdout]).toEqual([0, ''])
    const bayrak = { ...pre, tool_input: { title: 'KATALOG', prompt: 'YENI-DEPARTMAN-PENCERESI: Recep onayı 2026-11-03' } }
    expect(kancaKos(JSON.stringify(bayrak), depo).stdout).toBe('')
    const sivil = { ...pre, tool_input: { title: 'Blog yazısı PR' } }
    expect(kancaKos(JSON.stringify(sivil), depo).stdout).toBe('')
    const post = kancaKos(JSON.stringify({ ...pre, hook_event_name: 'PostToolUse' }), depo)
    expect(post.stdout).not.toContain('permissionDecision')
  })

  it('settings.json start_session için hem PreToolUse hem PostToolUse kaydı taşır', () => {
    const s = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks: Record<'PreToolUse' | 'PostToolUse', Array<{ matcher: string; hooks: Array<{ command: string }> }>>
    }
    for (const olay of ['PreToolUse', 'PostToolUse'] as const) {
      const kayit = s.hooks[olay].find((g) => g.matcher === 'mcp__ccd_session__start_session')
      expect(kayit && kayit.hooks.map((h) => h.command).join(' ')).toContain('pencere-acilis-denetimi.cjs')
    }
  })
})
