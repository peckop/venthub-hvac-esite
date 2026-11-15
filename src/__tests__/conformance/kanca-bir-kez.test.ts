/**
 * INV-KANCA-BIR-KEZ-1 — sabit bilgi/hatırlatma satırı aynı oturumda bir kez basılır (ARC-326, OPS-292 SEYRELT).
 *
 * Yardımcı: .claude/hooks/bir-kez.cjs · bağlı kancalar: soz-bekcisi-hatirlatma, gorev-tazelik-satiri, hafiza-yedek,
 * kart-alani-kapisi (yalnız başlık satırı), sage-dosya-dersi, patinaj-bekcisi; session-board compact ve clear dönüşünde sıfırlar.
 * duzeltme-isaretle BİLEREK kapsam dışı (denetçi B1: ⚠DERS-BORCU "yazılana kadar bu satır kalır" sözleşmesini bozardı).
 * Engelleyen kapı kararları ve ⛔/⚠ başarısızlık satırları süzülmez; süzme bozulursa satır BASILIR (fail-open).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const HOOKS = path.join(KOK, '.claude', 'hooks')
const BK = path.join(HOOKS, 'bir-kez.cjs')

interface BirKez {
  basilsin: (ad: string, sid: string, metin: string, s?: { rakamsiz?: boolean; yenilemeMs?: number; pano?: string; simdi?: number }) => boolean
  sifirla: (sid: string, pano?: string) => number
  TAVAN_GIRIS: number
}
const b = gerek(BK) as BirKez

const gecici: string[] = []
const yeniPano = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bir-kez-'))
  gecici.push(d)
  return d
}
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})
const SID = 'abcdef12-3456-7890-abcd-ef1234567890'
const SID2 = '12345678-aaaa-bbbb-cccc-1234567890ab'

describe('INV-KANCA-BIR-KEZ-1 · çekirdek', () => {
  it('ilk çağrı true, aynı metin ikinci çağrı false', () => {
    const pano = yeniPano()
    expect(b.basilsin('k', SID, 'SÖZ KURALI: x', { pano })).toBe(true)
    expect(b.basilsin('k', SID, 'SÖZ KURALI: x', { pano })).toBe(false)
  })

  it('metin değişirse yeniden basılır; başka oturum ve başka kanca ayrı sayılır', () => {
    const pano = yeniPano()
    b.basilsin('k', SID, 'a', { pano })
    expect(b.basilsin('k', SID, 'b', { pano })).toBe(true)
    expect(b.basilsin('k', SID2, 'a', { pano })).toBe(true)
    expect(b.basilsin('baska', SID, 'a', { pano })).toBe(true)
  })

  it('rakamsiz: "3 dk" ile "4 dk" aynı durum; rakamsiz değilse farklı', () => {
    const pano = yeniPano()
    b.basilsin('k', SID, 'son commit 3 dk once', { pano, rakamsiz: true })
    expect(b.basilsin('k', SID, 'son commit 4 dk once', { pano, rakamsiz: true })).toBe(false)
    expect(b.basilsin('k', SID, 'son commit 5 dk once', { pano })).toBe(true)
  })

  it('yenileme süresi dolunca yeniden basılır', () => {
    const pano = yeniPano()
    b.basilsin('k', SID, 'a', { pano, simdi: 1000, yenilemeMs: 500 })
    expect(b.basilsin('k', SID, 'a', { pano, simdi: 1400, yenilemeMs: 500 })).toBe(false)
    expect(b.basilsin('k', SID, 'a', { pano, simdi: 1600, yenilemeMs: 500 })).toBe(true)
  })

  it('fail-open: sid yok, metin boş, bozuk kayıt dosyası, yazılamayan pano → basılır', () => {
    const pano = yeniPano()
    expect(b.basilsin('k', '', 'a', { pano })).toBe(true)
    expect(b.basilsin('k', SID, '', { pano })).toBe(true)
    fs.writeFileSync(path.join(pano, `.bir-kez.k.${SID}.json`), '{bozuk')
    expect(b.basilsin('k', SID, 'a', { pano })).toBe(true)
    const dosya = path.join(pano, 'dosya')
    fs.writeFileSync(dosya, 'x')
    expect(() => b.basilsin('k', SID, 'a', { pano: path.join(dosya, 'alt') })).not.toThrow()
    expect(b.basilsin('k', SID, 'a', { pano: path.join(dosya, 'alt') })).toBe(true)
  })

  it('fail-open: beklenmeyen istisna (geçersiz pano türü) dış catch ile true döner, fırlatmaz', () => {
    expect(() => b.basilsin('k', SID, 'a', { pano: 123 as unknown as string })).not.toThrow()
    expect(b.basilsin('k', SID, 'a', { pano: 123 as unknown as string })).toBe(true)
  })

  it('sifirla: yalnız o oturumun kayıtlarını siler, sonra yeniden basılır', () => {
    const pano = yeniPano()
    b.basilsin('k', SID, 'a', { pano })
    b.basilsin('baska', SID, 'a', { pano })
    b.basilsin('k', SID2, 'a', { pano })
    expect(b.sifirla(SID, pano)).toBe(2)
    expect(b.basilsin('k', SID, 'a', { pano })).toBe(true)
    expect(b.basilsin('k', SID2, 'a', { pano })).toBe(false)
  })

  it('kayıt tavanı: 500 girişten fazlası en eskiden budanır', () => {
    const pano = yeniPano()
    for (let i = 0; i < b.TAVAN_GIRIS + 20; i++) b.basilsin('k', SID, 'metin-' + i, { pano, simdi: 1000 + i })
    const j = JSON.parse(fs.readFileSync(path.join(pano, `.bir-kez.k.${SID}.json`), 'utf8'))
    expect(Object.keys(j).length).toBeLessThanOrEqual(b.TAVAN_GIRIS)
  })

  it('vana ve test koşusu: pano verilmezse (VITEST) ya da vana açıkken süzme yok', () => {
    const kos = (env: Record<string, string>) =>
      spawnSync(process.execPath, ['-e', `const b=require(${JSON.stringify(BK)});process.stdout.write(String(b.basilsin('k','${SID}','a')+','+b.basilsin('k','${SID}','a')))`], {
        env: { ...process.env, VENTHUB_BOARD_DIR: yeniPano(), ...env },
        encoding: 'utf8',
      })
    expect(kos({ VITEST: '1' }).stdout).toBe('true,true')
    expect(kos({ VENTHUB_BIR_KEZ_KAPAT: '1', VITEST: '' }).stdout).toBe('true,true')
  })
})

describe('INV-KANCA-BIR-KEZ-1 · kancalar', () => {
  const kos = (kanca: string, girdi: unknown, pano: string) =>
    spawnSync(process.execPath, [path.join(HOOKS, kanca + '.cjs')], {
      input: JSON.stringify(girdi),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: pano, VITEST: '' },
    })

  it('soz-bekcisi-hatirlatma: ikinci mesajda sessiz, başka oturumda yeniden, sid yoksa hep basılır', () => {
    const pano = yeniPano()
    const ilk = kos('soz-bekcisi-hatirlatma', { session_id: SID }, pano)
    expect(ilk.status).toBe(0)
    expect(ilk.stdout).toMatch(/^SÖZ KURALI/)
    expect(kos('soz-bekcisi-hatirlatma', { session_id: SID }, pano).stdout).toBe('')
    expect(kos('soz-bekcisi-hatirlatma', { session_id: SID2 }, pano).stdout).toMatch(/^SÖZ KURALI/)
    expect(kos('soz-bekcisi-hatirlatma', {}, pano).stdout).toMatch(/^SÖZ KURALI/)
    expect(kos('soz-bekcisi-hatirlatma', {}, pano).stdout).toMatch(/^SÖZ KURALI/)
  })

  it('soz-bekcisi-hatirlatma: compact dönüşü sıfırlayınca yeniden basılır', () => {
    const pano = yeniPano()
    kos('soz-bekcisi-hatirlatma', { session_id: SID }, pano)
    expect(b.sifirla(SID, pano)).toBe(1)
    expect(kos('soz-bekcisi-hatirlatma', { session_id: SID }, pano).stdout).toMatch(/^SÖZ KURALI/)
  })
})

const BAGLI = [
  'soz-bekcisi-hatirlatma',
  'gorev-tazelik-satiri',
  'hafiza-yedek',
  'kart-alani-kapisi',
  'sage-dosya-dersi',
  'patinaj-bekcisi',
]

describe('INV-KANCA-BIR-KEZ-1 · bağlantı', () => {
  it.each(BAGLI)("%s bir-kez yardımcısını kendi adıyla çağırır, çağrı try içinde", (ad) => {
    const kaynak = fs.readFileSync(path.join(HOOKS, ad + '.cjs'), 'utf8')
    expect(kaynak).toContain(".basilsin('" + ad + "'")
    const i = kaynak.indexOf(".basilsin('" + ad + "'")
    // çağrıdan önceki 400 karakter içinde try { var: süzme hatası kancayı düşürmez
    expect(kaynak.slice(Math.max(0, i - 400), i)).toContain('try {')
  })

  it('hafiza-yedek: yalnız ⛔ başarısızlık satırı muaf, ⚠HAFIZA YEDEK bilgi satırı süzülür (kaynakta koşul var)', () => {
    const kaynak = fs.readFileSync(path.join(HOOKS, 'hafiza-yedek.cjs'), 'utf8')
    expect(kaynak).toContain('!/⛔/.test(ek)')
    expect(kaynak).not.toContain('⛔|⚠')
  })

  it('duzeltme-isaretle bir-kez kullanmaz (⚠DERS-BORCU "yazılana kadar bu satır kalır" sözleşmesi)', () => {
    expect(fs.readFileSync(path.join(HOOKS, 'duzeltme-isaretle.cjs'), 'utf8')).not.toContain('bir-kez')
  })

  it('session-board compact VE clear dönüşünde bütün kayıtları sıfırlar (kaynak)', () => {
    const kaynak = fs.readFileSync(path.join(HOOKS, 'session-board.cjs'), 'utf8')
    const i = kaynak.indexOf("if (source === 'compact' || source === 'clear') {")
    expect(i).toBeGreaterThan(0)
    expect(kaynak.slice(i, i + 300)).toContain("require('./bir-kez.cjs').sifirla(sid)")
  })

  it('graphify-search zaman aşımı 20 sn (dış ikili; çıktı süzülmez)', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const kayit = (ayar.hooks.PreToolUse as Array<{ hooks: Array<{ command: string; timeout?: number }> }>)
      .flatMap((g) => g.hooks)
      .find((h) => h.command === 'graphify hook-guard search')
    expect(kayit?.timeout).toBe(20)
  })
})

describe('INV-KANCA-BIR-KEZ-1 · davranış (gerçek kanca süreci, geçici pano)', () => {
  const kos = (kanca: string, girdi: unknown, env: Record<string, string>) =>
    spawnSync(process.execPath, [path.join(HOOKS, kanca + '.cjs')], {
      input: JSON.stringify(girdi),
      encoding: 'utf8',
      timeout: 90000,
      env: { ...process.env, VITEST: '', ...env },
    })
  const baglam = (stdout: string): string => {
    try {
      return JSON.parse(stdout).hookSpecificOutput.additionalContext as string
    } catch {
      return ''
    }
  }

  it('kart-alani-kapisi: KART ALANI başlığı oturumda bir kez, UYARI ve KART SATIRLARI her kartta (denetçi B3)', () => {
    const pano = yeniPano()
    const g = (baslik: string, sid = SID) => ({
      tool_name: 'mcp__wrongstack-kanban__kanban_manage',
      session_id: sid,
      tool_input: { action: 'add_task', boardId: 'x', title: baslik },
    })
    const c1 = baglam(kos('kart-alani-kapisi', g('ARC-400 · deneme'), { VENTHUB_BOARD_DIR: pano }).stdout)
    const c2 = baglam(kos('kart-alani-kapisi', g('ARC-401 · deneme'), { VENTHUB_BOARD_DIR: pano }).stdout)
    const c3 = baglam(kos('kart-alani-kapisi', g('ARC-402 · deneme'), { VENTHUB_BOARD_DIR: pano }).stdout)
    expect(c1).toContain('KART ALANI (ARAC)')
    expect(c1).toContain('KART SATIRLARI UYARI')
    expect(c2).not.toContain('KART ALANI (ARAC)')
    expect(c2).toContain('KART SATIRLARI UYARI')
    expect(c3).toContain('KART SATIRLARI UYARI')
    // başka oturum başlığı yeniden görür
    const d = baglam(kos('kart-alani-kapisi', g('ARC-403 · deneme', SID2), { VENTHUB_BOARD_DIR: pano }).stdout)
    expect(d).toContain('KART ALANI (ARAC)')
  })

  it('patinaj-bekcisi: 4. ve 8. çağrı uyarıları AYRI durum (tırmanma sinyali süzülmez), toplam iki uyarı (denetçi B5)', () => {
    const env = { VENTHUB_BOARD_DIR: yeniPano(), VENTHUB_PATINAJ_DIR: yeniPano() }
    const g = { session_id: SID, tool_name: 'Bash', tool_input: { command: 'ayni-komut' }, tool_response: 'ayni-sonuc' }
    const uyarilar: string[] = []
    for (let i = 1; i <= 8; i++) uyarilar.push(baglam(kos('patinaj-bekcisi', g, env).stdout))
    expect(uyarilar[3]).toContain('4 kez')
    expect(uyarilar[7]).toContain('8 kez')
    expect(uyarilar.filter((u) => u !== '')).toHaveLength(2)
  })

  it('session-board: clear ve compact dönüşü .bir-kez kayıtlarını siler, startup silmez (denetçi B2)', () => {
    for (const [source, silinmeli] of [
      ['clear', true],
      ['compact', true],
      ['startup', false],
    ] as const) {
      const pano = yeniPano()
      const dosya = path.join(pano, '.bir-kez.soz-bekcisi-hatirlatma.' + SID + '.json')
      fs.writeFileSync(dosya, '{}')
      spawnSync(process.execPath, [path.join(HOOKS, 'session-board.cjs')], {
        input: JSON.stringify({ source, session_id: SID, cwd: KOK }),
        encoding: 'utf8',
        timeout: 90000,
        env: { ...process.env, VITEST: '', VENTHUB_BOARD_DIR: pano },
      })
      expect(fs.existsSync(dosya)).toBe(!silinmeli)
    }
  }, 240000)
})
