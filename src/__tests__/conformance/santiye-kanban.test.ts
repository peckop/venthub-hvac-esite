// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-SANTIYE-1 · iş dağılımı tablosu (santiye.py) canlı Kanban panosundan üretilir (karar 219, HRT-3).
 *
 * Eski kaynak Linear dışa aktarımıydı; Linear donuk olunca tablo 09-07'de donup kalmıştı. Yeni kaynak
 * `kanban_disa_aktar.py`: WrongStack Kanban SQLite dosyası SALT OKUNUR. Bu test sahte bir pano dosyası kurar
 * (Python stdlib sqlite3; gerçek pano dosyasına dokunmaz) ve şunları ölçer:
 *   · sütun → durum eşlemesi ve kart numarası çıkarımı (HRT-6, REC-538, numarasız → kısa kimlik);
 *   · DENEME panosu dışarıda, "Linear Bekleyenler" panosu HAVUZ (limit dışı, KIRMIZI üretmez);
 *   · sonAnlamli updatedAt'ı DEĞİL not/tamamlanma/açılış tarihini kullanır;
 *   · şerit başına yapılıyor > 1 KIRMIZI (çıkış 1); pano dosyası yoksa çıkış 2 (sessiz yeşil yok).
 * ⛔SINIR: python gerekir (python ya da python3 gerçekten çalıştırılarak denenir); yoksa test KIRMIZI verir.
 */

const KOK = path.resolve(__dirname, '../../..')
const DISA = path.join(KOK, 'scripts/nlm/kanban_disa_aktar.py')
const SANTIYE = path.join(KOK, 'scripts/nlm/santiye.py')

function pythonBul(): string | null {
  for (const ad of ['python', 'python3']) {
    const r = spawnSync(ad, ['--version'], { encoding: 'utf-8' })
    if (r.status === 0 && /Python 3\./.test(`${r.stdout}${r.stderr}`)) return ad
  }
  return null
}
const PY = pythonBul()

interface Kart {
  title: string
  columnId: string
  status: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  notes?: { createdAt: string }[]
}
interface Pano {
  title: string
  tasks: Kart[]
}

function kart(title: string, columnId: string, ek: Partial<Kart> = {}): Kart {
  return { title, columnId, status: 'pending', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z', ...ek }
}

const PANOLAR: Pano[] = [
  {
    title: 'VentHub ARAÇ',
    tasks: [
      kart('ARC-1 · birinci iş', 'in-progress'),
      kart('ARC-2 · ikinci iş', 'in-progress'),
      kart('REC-538 · taşınan iş', 'todo', { notes: [{ createdAt: '2026-09-20T00:00:00.000Z' }] }),
      kart('numarasız başlık', 'backlog'),
      kart('ARC-3 · biten iş', 'done', { completedAt: '2026-09-30T00:00:00.000Z' }),
    ],
  },
  { title: 'VentHub HARİTA', tasks: [kart('HRT-6 · teslim', 'review')] },
  { title: 'Linear Bekleyenler (taşınan, karar 215)', tasks: [kart('REC-1 · havuz', 'backlog'), kart('REC-2 · havuz', 'in-progress')] },
  { title: 'DENEME-yonetilen (YTN-4, sil)', tasks: [kart('YTN-4 · deney', 'todo')] },
]

let dizin = ''
let db = ''
let bosDb = ''

function py(betik: string, args: string[]) {
  const r = spawnSync(PY as string, [betik, ...args], { encoding: 'utf-8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  return { cikis: r.status, stdout: r.stdout, stderr: r.stderr }
}

beforeAll(() => {
  expect(PY, 'python bulunamadı: kapı atlanmaz, kırmızı verir').not.toBeNull()
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'santiye-'))
  db = path.join(dizin, 'pano.sqlite')
  bosDb = path.join(dizin, 'yok.sqlite')
  const betik = [
    'import json, sqlite3, sys',
    'c = sqlite3.connect(sys.argv[1])',
    'c.execute("create table kanban_boards (id text, payload text, revision integer, updated_at text)")',
    'for i, p in enumerate(json.load(open(sys.argv[2], encoding="utf-8"))):',
    '    c.execute("insert into kanban_boards values (?,?,?,?)", (str(i), json.dumps(p, ensure_ascii=False), 1, ""))',
    'c.commit()',
  ].join('\n')
  const girdi = path.join(dizin, 'panolar.json')
  fs.writeFileSync(girdi, JSON.stringify(PANOLAR), 'utf-8')
  const k = path.join(dizin, 'kur.py')
  fs.writeFileSync(k, betik, 'utf-8')
  const r = py(k, [db, girdi])
  expect(r.cikis, r.stderr).toBe(0)
})

afterAll(() => {
  if (dizin) fs.rmSync(dizin, { recursive: true, force: true })
})

describe('INV-SANTIYE-1: iş dağılımı Kanban panosundan üretilir', () => {
  it('dışa aktarım sütunu durumla, başlığı numarayla eşler; DENEME dışarıda, havuz ayrı şerit', () => {
    const hedef = path.join(dizin, 'disa.json')
    const r = py(DISA, ['--db', db, '--hedef', hedef])
    expect(r.cikis, r.stderr).toBe(0)
    const d = JSON.parse(fs.readFileSync(hedef, 'utf-8')) as { kaynak: string; kayitlar: Record<string, unknown>[] }
    expect(d.kaynak).toBe('Kanban')
    expect(d.kayitlar).toHaveLength(8) // 5 ARAC + 1 HARITA + 2 HAVUZ; DENEME'nin 1 kartı yok
    const ara = (id: string) => d.kayitlar.find((k) => k.identifier === id)
    expect(ara('ARC-1')).toMatchObject({ status: 'In Progress', serit: 'ARAC' })
    expect(ara('REC-538')).toMatchObject({ status: 'Todo', serit: 'ARAC', sonAnlamli: '2026-09-20T00:00:00.000Z' })
    expect(ara('ARC-3')).toMatchObject({ status: 'Done', sonAnlamli: '2026-09-30T00:00:00.000Z' })
    expect(ara('HRT-6')).toMatchObject({ status: 'In Review', serit: 'HARITA' })
    expect(ara('REC-1')).toMatchObject({ serit: 'HAVUZ', status: 'Backlog' })
    expect(d.kayitlar.some((k) => String(k.title).includes('YTN-4'))).toBe(false)
    // numarasız başlık kısa kart kimliğine düşer (bozuk kopyada başlığın tamamı ya da boş olurdu)
    const numarasiz = d.kayitlar.find((k) => k.title === 'numarasız başlık')
    expect(String(numarasiz?.identifier)).not.toMatch(/^[A-Z]{2,4}-\d+$/)
    // updatedAt kullanılmaz: ARC-1'in sonAnlamli'si açılış tarihi (09-01), güncelleme tarihi (10-01) değil
    expect(ara('ARC-1')?.sonAnlamli).toBe('2026-09-01T00:00:00.000Z')
  })

  it('tablo şerit başına sayar: yapılıyor 2 > 1 KIRMIZI (çıkış 1), havuz limit dışı, teslim ayrı sütun', () => {
    const hedef = path.join(dizin, 'santiye.md')
    const r = py(SANTIYE, ['--db', db, '--hedef', hedef, '--simdi', '2026-10-01T12:00:00Z'])
    expect(r.cikis, r.stderr).toBe(1)
    const md = fs.readFileSync(hedef, 'utf-8')
    expect(md).toContain('Kaynak: Kanban')
    expect(md).toMatch(/\| ARAC \| 2 \| 0 \| 1 \| 1 \| \d+ \| 0 \| 0 \| KIRMIZI \(yapılıyor 2 > 1\) \|/)
    expect(md).toMatch(/\| HARITA \| 0 \| 1 \| 0 \| 0 \|/)
    expect(md).toMatch(/\| HAVUZ \| 1 \| 0 \| 0 \| 1 \|.*HAVUZ \(limit dışı\)/)
    expect(md).not.toContain('YTN-4')
  })

  it('pano dosyası yoksa çıkış 2 (sessiz yeşil yok)', () => {
    const d = py(DISA, ['--db', bosDb])
    expect(d.cikis).toBe(2)
    const s = py(SANTIYE, ['--db', bosDb, '--hedef', path.join(dizin, 'x.md')])
    expect(s.cikis).toBe(2)
    expect(`${s.stderr}`).toContain('pano dosyasi yok')
  })
})
