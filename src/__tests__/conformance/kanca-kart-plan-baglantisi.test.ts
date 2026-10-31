/**
 * INV-KANCA-KART-PLAN-BAGI-1 — kart-plan kapısını kartı açarken (add_task) ve Review'a geçerken kendiliğinden çağıran bağ (ARC-216 B kolu).
 *
 * Kanca: .claude/hooks/kart-plan-baglantisi.cjs. OPS kararı (27 Ekim): bugünkü kapı olduğu gibi bağlanır, ama YALNIZ kartta PLAN başlığı
 * VARKEN iskeleti ölçer; başlık yoksa SESSİZ kalır (son 8 günde açılan 55 kartın 0'ında PLAN başlığı vardı: her kartı uyarmak ARC-220'nin
 * kaldırdığı gürültüdür). Kanca hiçbir zaman reddetmez.
 *
 * Sabotaj: kancanın kaynağına tek tek hata sokulur (temp klasörde kopya); her hatalı kopya en az bir senaryoyu kırmızıya çevirir.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kart-plan-baglantisi.cjs')
const KAYNAK = fs.readFileSync(KANCA, 'utf8').replace(/\r\n/g, '\n')
const ARAC = 'mcp__wrongstack-kanban__kanban_manage'

const TAM_PLAN = [
  'PLAN',
  'Amaç: kartın planı karta yazılsın ve kapı iskeleti ölçsün.',
  'Adımlar:',
  '1. Önce kanca yazılır ve fail-open olarak sınanır.',
  '2. Sonra sabotajlı test eklenir ve envanter satırı girilir.',
  'Dosyalar: .claude/hooks/kart-plan-baglantisi.cjs',
  'Bitti ölçütü: kanca testi yeşil ve OPS tam farkı okudu.',
  'Ölçülmeyenler: planın doğruluğu',
  'Sor-noktaları: yok',
  'Etki alanı: yok',
  'ÖNCEKİ ÇALIŞMA: Kanban search_tasks, git log, docs/plans, docs/audits, sage ve Linear arandı; ifade: kart plan kapısı; sonuç: yok.',
].join('\n')
const EKSIK_PLAN = 'PLAN\nAmaç: çok kısa'
const PLANSIZ = 'KAYNAK/CETVEL: cetvel yok\nYÖNTEM: elle\nÖNCEKİ ÇALIŞMA: arandı, yok'
const YENI = '2026-10-27T10:00:00.000Z'

let dizin = ''
let dbYolu = ''

beforeAll(() => {
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kart-plan-bagi-'))
  dbYolu = path.join(dizin, '_kanban.sqlite')
  const { DatabaseSync } = gerek('node:sqlite') as {
    DatabaseSync: new (p: string) => { exec: (s: string) => void; prepare: (s: string) => { run: (...a: unknown[]) => void }; close: () => void }
  }
  const db = new DatabaseSync(dbYolu)
  db.exec('create table kanban_boards (id text primary key, payload text, revision integer, updated_at text)')
  const kart = (id: string, baslik: string, description: string) => ({ id, title: baslik, description, columnId: 'in-progress', createdAt: YENI })
  db.prepare('insert into kanban_boards values (?,?,?,?)').run(
    'p1',
    JSON.stringify({
      id: 'p1',
      title: 'VentHub TEST',
      tasks: [kart('tam', 'ARC-901 · tam plan', TAM_PLAN), kart('eksik', 'ARC-902 · eksik plan', EKSIK_PLAN), kart('plansiz', 'ARC-903 · plansız', PLANSIZ)],
    }),
    1,
    '2026-10-27',
  )
  db.close()
})

afterAll(() => {
  fs.rmSync(dizin, { recursive: true, force: true })
})

type Cikti = { status: number | null; stdout: string }
function calistir(kancaYolu: string, girdi: unknown, ortam: Record<string, string> = {}): Cikti {
  const r = spawnSync(process.execPath, [kancaYolu], {
    input: typeof girdi === 'string' ? girdi : JSON.stringify(girdi),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_KANBAN_DB: dbYolu, ...ortam },
  })
  return { status: r.status, stdout: r.stdout.trim() }
}
const arac = (o: Record<string, unknown>) => ({ tool_name: ARAC, tool_input: o })
const baglam = (c: Cikti): string => (c.stdout ? (JSON.parse(c.stdout).hookSpecificOutput.additionalContext as string) : '')

/** Senaryolar: hata varsa açıklamalarını döndürür ([] = hepsi tamam). Gerçek kanca ve sabotajlı kopyalar AYNI senaryolarla ölçülür. */
function senaryolar(kancaYolu: string): string[] {
  const hata: string[] = []
  const dogru = (kosul: boolean, ne: string) => {
    if (!kosul) hata.push(ne)
  }
  const sessiz = (c: Cikti) => c.status === 0 && c.stdout === ''
  const reviewTasi = (taskId: string) => arac({ action: 'move_task', taskId, targetColumnId: 'review' })

  dogru(sessiz(calistir(kancaYolu, reviewTasi('plansiz'))), 'PLAN başlığı olmayan kart Review geçişinde SESSİZ olmalı')
  dogru(sessiz(calistir(kancaYolu, reviewTasi('tam'))), 'iskeleti tam PLAN Review geçişinde sessiz olmalı')
  const eksik = calistir(kancaYolu, reviewTasi('eksik'))
  dogru(eksik.status === 0 && /iskelet eksik/.test(baglam(eksik)) && /ARC-902/.test(baglam(eksik)), 'eksik PLAN Review geçişinde uyarmalı (kart numarasıyla)')
  dogru(!/permissionDecision/.test(eksik.stdout), 'kanca HİÇBİR ZAMAN reddetmez (permissionDecision yok)')
  for (const girdi of [
    arac({ action: 'transition_task', taskId: 'eksik', lifecycleStage: 'review' }),
    arac({ action: 'update_task', taskId: 'eksik', status: 'review' }),
  ]) {
    dogru(/iskelet eksik/.test(baglam(calistir(kancaYolu, girdi))), 'transition_task/update_task Review geçişi de tanınmalı')
  }
  dogru(sessiz(calistir(kancaYolu, arac({ action: 'move_task', taskId: 'eksik', targetColumnId: 'done' }))), 'Review olmayan taşıma sessiz olmalı')
  dogru(sessiz(calistir(kancaYolu, arac({ action: 'add_check', taskId: 'eksik' }))), 'başka eylem sessiz olmalı')
  dogru(sessiz(calistir(kancaYolu, { tool_name: 'Bash', tool_input: { action: 'move_task', taskId: 'eksik', targetColumnId: 'review' } })), 'başka araç sessiz olmalı')

  const acilis = (description: string) => arac({ action: 'add_task', title: 'ARC-904 · yeni', description })
  const yeni = calistir(kancaYolu, acilis(EKSIK_PLAN))
  dogru(/iskelet eksik/.test(baglam(yeni)) && /ARC-904/.test(baglam(yeni)), 'add_task: eksik PLAN açılışta uyarmalı')
  dogru(sessiz(calistir(kancaYolu, acilis(PLANSIZ))), 'add_task: PLAN başlığı olmayan açıklama sessiz olmalı')
  dogru(sessiz(calistir(kancaYolu, acilis(TAM_PLAN))), 'add_task: tam PLAN sessiz olmalı')

  dogru(sessiz(calistir(kancaYolu, reviewTasi('eksik'), { VENTHUB_KART_PLAN_BAGI_KAPALI: '1' })), 'vana kapatmalı')
  dogru(sessiz(calistir(kancaYolu, reviewTasi('eksik'), { VENTHUB_KANBAN_DB: path.join(dizin, 'yok.sqlite') })), 'fail-open: veritabanı yoksa sessiz')
  dogru(sessiz(calistir(kancaYolu, reviewTasi('yok-boyle-kart'))), 'fail-open: bilinmeyen kart sessiz')
  dogru(sessiz(calistir(kancaYolu, '{bozuk')), 'fail-open: bozuk stdin sessiz')
  return hata
}

describe('INV-KANCA-KART-PLAN-BAGI-1 · gerçek kanca', () => {
  it('tüm senaryolar geçer (PLAN başlığı varken ölç, yoksa sessiz, asla reddetme)', () => {
    expect(senaryolar(KANCA)).toEqual([])
  })

  it('reviewIstegiMi: yalnız Review kolonu/aşaması/durumu', () => {
    const k = gerek(KANCA) as { reviewIstegiMi: (t: Record<string, unknown>) => boolean }
    expect(k.reviewIstegiMi({ action: 'move_task', taskId: 'x', columnId: 'review' })).toBe(true)
    expect(k.reviewIstegiMi({ action: 'move_task', taskId: 'x', columnId: 'done' })).toBe(false)
    expect(k.reviewIstegiMi({ action: 'move_task', taskId: '', columnId: 'review' })).toBe(false)
    expect(k.reviewIstegiMi({ action: 'add_task', taskId: 'x', columnId: 'review' })).toBe(false)
  })
})

describe('INV-KANCA-KART-PLAN-BAGI-1 · SABOTAJ: kancaya konan her tek hata en az bir senaryoyu kırar', () => {
  const SABOTAJLAR: Array<[string, string, string]> = [
    ['PLAN başlığı olmayan karta da uyar (gürültü geri gelir)', "if (s.tur !== 'plan' || s.gecti) return []", 'if (s.gecti) return []'],
    ['tam PLAN da uyarır', "if (s.tur !== 'plan' || s.gecti) return []", "if (s.tur !== 'plan') return []"],
    ['Review geçişi tanınmaz', "v.trim().toLowerCase() === 'review'", "v.trim().toLowerCase() === 'reviewx'"],
    ['add_task kolu kaldırıldı', "t.action === 'add_task'", "t.action === 'add_task_kapali'"],
    ['vana yok sayılır', "process.env[VANA] === '1'", 'false'],
    ['kanca reddeder', "hookEventName: 'PreToolUse', additionalContext", "hookEventName: 'PreToolUse', permissionDecision: 'deny', additionalContext"],
    ['okunamayan kart sessiz geçmez', 'if (!k) return', 'if (!k) { fs.writeSync(1, "kart yok\\n"); return }'],
  ]

  it.each(SABOTAJLAR)('%s', (ad, eski, yeni) => {
    expect(KAYNAK.split(eski).length, `sabotaj noktası kaynakta TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    // Kopya temp klasörde koşar: göreli require'lar mutlak yola çevrilir (depoya dosya yazılmaz).
    const mutant = KAYNAK.replace(eski, yeni)
      .replace("require('./done-kanit-kapisi.cjs')", `require(${JSON.stringify(path.join(KOK, '.claude/hooks/done-kanit-kapisi.cjs'))})`)
      .replace("path.join(__dirname, '..', '..', 'scripts', 'belge', 'kart-plan-kapisi.cjs')", JSON.stringify(path.join(KOK, 'scripts/belge/kart-plan-kapisi.cjs')))
    const yol = path.join(dizin, `sabotaj-${SABOTAJLAR.findIndex((s) => s[0] === ad)}.cjs`)
    fs.writeFileSync(yol, mutant, 'utf8')
    const hatalar = senaryolar(yol)
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmadı: "${ad}" — bu davranış testle korunmuyor`).toBeGreaterThan(0)
  })
})
