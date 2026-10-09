// @vitest-environment node
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
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
  id?: string
  title: string
  columnId: string
  status: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  description?: string
  notes?: { createdAt: string; author?: string; content?: string }[]
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
      kart('ARC-1 · birinci iş', 'in-progress', { description: 'ÖNCEKİ ÇALIŞMA: aranan yerler tamam; CSV adı urun-listesi.csv' }),
      kart('ARC-2 · ikinci iş', 'in-progress'),
      kart('ARC-7 · yedinci iş', 'in-progress'),
      kart('ARC-8 · sekizinci iş', 'in-progress'),
      kart('ARC-9 · dokuzuncu iş', 'in-progress'),
      kart('ARC-10 · onuncu iş', 'in-progress'),
      kart('REC-538 · taşınan iş', 'todo', {
        notes: [{ createdAt: '2026-09-20T00:00:00.000Z', author: 'HARITA', content: 'not metni: kart içi bilgi' }],
      }),
      kart('numarasız başlık', 'backlog', { id: 'abcdef0123456789' }),
      kart('ARC-3 · biten iş', 'done', { completedAt: '2026-09-30T00:00:00.000Z' }),
    ],
  },
  // başlığın ortasında numara (gerçek panoda 13 kart böyle) ve 4 harfli önek; küçük harfli pano adı şerit adını büyütür
  { title: 'VentHub seo', tasks: [kart('URUN REC-411: ortada numara', 'todo'), kart('ADMIN VULN-006 (REC-355) dört harf', 'todo')] },
  { title: 'VentHub HARİTA', tasks: [kart('HRT-6 · teslim', 'review')] },
  { title: 'VentHub URUN', tasks: ['URN-1', 'URN-2', 'URN-3', 'URN-4'].map((n) => kart(`${n} · iş`, 'in-progress')) },
  { title: 'VentHub OPS', tasks: ['OPS-1', 'OPS-2', 'OPS-3'].map((n) => kart(`${n} · iş`, 'in-progress')) },
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
    // WAL kipi + temiz kapanış YOK (os._exit): -wal içinde işlenmemiş çerçeveler kalır, böylece yazma kipinde açan bir
    // okuyucu kapanışta checkpoint yapıp ana dosyayı DEĞİŞTİRİR; `mode=ro` mutasyonu bu testte kırmızı verir.
    'import json, os, sqlite3, sys',
    'c = sqlite3.connect(sys.argv[1])',
    'c.execute("pragma journal_mode=wal")',
    'c.execute("pragma wal_autocheckpoint=0")',
    'c.execute("create table kanban_boards (id text, payload text, revision integer, updated_at text)")',
    'for i, p in enumerate(json.load(open(sys.argv[2], encoding="utf-8"))):',
    '    c.execute("insert into kanban_boards values (?,?,?,?)", (str(i), json.dumps(p, ensure_ascii=False), 1, ""))',
    'c.commit()',
    'os._exit(0)',
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
    expect(d.kayitlar).toHaveLength(21) // 9 ARAC + 1 HARITA + 4 URUN + 3 OPS + 2 SEO + 2 HAVUZ; DENEME'nin 1 kartı yok
    const ara = (id: string) => d.kayitlar.find((k) => k.identifier === id)
    expect(ara('ARC-1')).toMatchObject({ status: 'In Progress', serit: 'ARAC' })
    expect(ara('REC-538')).toMatchObject({ status: 'Todo', serit: 'ARAC', sonAnlamli: '2026-09-20T00:00:00.000Z' })
    expect(ara('ARC-3')).toMatchObject({ status: 'Done', sonAnlamli: '2026-09-30T00:00:00.000Z' })
    expect(ara('HRT-6')).toMatchObject({ status: 'In Review', serit: 'HARITA' })
    expect(ara('REC-1')).toMatchObject({ serit: 'HAVUZ', status: 'Backlog' })
    expect(d.kayitlar.some((k) => String(k.title).includes('YTN-4'))).toBe(false)
    // numarasız başlık kartın kısa kimliğine (ilk 8 karakter) düşer; başlığın ortasındaki numara da bulunur
    expect(d.kayitlar.find((k) => k.title === 'numarasız başlık')?.identifier).toBe('abcdef01')
    expect(ara('REC-411')).toMatchObject({ serit: 'SEO', status: 'Todo' })
    expect(ara('VULN-006')).toMatchObject({ serit: 'SEO', status: 'Todo' })
    // updatedAt kullanılmaz: ARC-1'in sonAnlamli'si açılış tarihi (09-01), güncelleme tarihi (10-01) değil
    expect(ara('ARC-1')?.sonAnlamli).toBe('2026-09-01T00:00:00.000Z')
  })

  it('pano dosyasının VERİ içeriğini değiştirmez (mode=ro): koşu öncesi/sonrası ana dosya özeti aynı', () => {
    const ozet = () => crypto.createHash('sha256').update(fs.readFileSync(db)).digest('hex')
    const once = ozet()
    expect(py(DISA, ['--db', db, '--hedef', path.join(dizin, 'ro.json')]).cikis).toBe(0)
    expect(py(SANTIYE, ['--db', db, '--hedef', path.join(dizin, 'ro.md')]).cikis).toBe(1)
    expect(ozet()).toBe(once)
  })

  it('tablo şerit başına sayar: yapılıyor ≤3 YEŞİL, 4-5 SARI, >5 KIRMIZI (çıkış 1), sırada sınırsız, havuz limit dışı', () => {
    const hedef = path.join(dizin, 'santiye.md')
    const r = py(SANTIYE, ['--db', db, '--hedef', hedef, '--simdi', '2026-10-01T12:00:00Z'])
    expect(r.cikis, r.stderr).toBe(1)
    const md = fs.readFileSync(hedef, 'utf-8')
    expect(md).toContain('Kaynak: Kanban')
    expect(md).toMatch(/\| ARAC \| 6 \| 0 \| 1 \| 1 \| \d+ \| 0 \| 0 \| KIRMIZI \(yapılıyor 6 > 5\) \|/)
    expect(md).toMatch(/\| URUN \| 4 \| 0 \| 0 \| 0 \| \d+ \| 0 \| 0 \| SARI \(yapılıyor 4 > 3\) \|/)
    expect(md).toMatch(/\| OPS \| 3 \| 0 \| 0 \| 0 \| \d+ \| 0 \| 0 \| YEŞİL \|/)
    expect(md).toMatch(/\| HARITA \| 0 \| 1 \| 0 \| 0 \|/)
    expect(md).toMatch(/\| HAVUZ \| 1 \| 0 \| 0 \| 1 \|.*HAVUZ \(limit dışı\)/)
    expect(md).not.toContain('YTN-4')
  })

  it('çıktı varsayılan olarak depoya yazılmaz: hedef VENTHUB_SANTIYE_HEDEF ile depo dışına gider', () => {
    const dis = path.join(dizin, 'dis', 'is-dagilimi.md')
    const r = spawnSync(PY as string, [SANTIYE, '--db', db], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', VENTHUB_SANTIYE_HEDEF: dis },
    })
    expect(r.status, r.stderr).toBe(1)
    expect(fs.existsSync(dis)).toBe(true)
    expect(fs.readFileSync(path.join(KOK, 'docs/proje-takip/is-dagilimi.md'), 'utf-8')).toContain('EMEKLİ')
  })

  it('hedef verilmezse VARSAYILAN çıktı depoya değil kullanıcı dizinine gider (repo PUBLIC: kart başlığı depoya sızmaz)', () => {
    const ev = path.join(dizin, 'ev')
    fs.mkdirSync(ev, { recursive: true })
    const izlenen = path.join(KOK, 'docs/proje-takip/is-dagilimi.md')
    const once = fs.readFileSync(izlenen, 'utf-8')
    const env = { ...process.env, PYTHONIOENCODING: 'utf-8', HOME: ev, USERPROFILE: ev } as NodeJS.ProcessEnv
    delete env.VENTHUB_SANTIYE_HEDEF
    const r = spawnSync(PY as string, [SANTIYE, '--db', db], { encoding: 'utf-8', env })
    expect(r.status, r.stderr).toBe(1)
    const beklenen = path.join(ev, '.venthub', 'santiye', 'is-dagilimi.md')
    expect(fs.existsSync(beklenen), `varsayılan hedef ${beklenen} oluşmadı`).toBe(true)
    expect(fs.readFileSync(izlenen, 'utf-8'), 'depoda izlenen dosya DEĞİŞMEMELİ').toBe(once)
  })

  describe('HRT-28: --tam (kart açıklaması ve notları)', () => {
    type Kayit = Record<string, unknown>
    const oku = (hedef: string) => (JSON.parse(fs.readFileSync(hedef, 'utf-8')) as { kayitlar: Kayit[] }).kayitlar
    const sirala = (k: Kayit[]) => k.map((x) => JSON.stringify(x)).sort()

    it('bayraksız çıktıda description/notes ANAHTARI yok (varsayılan davranış değişmedi)', () => {
      const hedef = path.join(dizin, 'tamsiz.json')
      expect(py(DISA, ['--db', db, '--hedef', hedef]).cikis).toBe(0)
      for (const k of oku(hedef)) {
        expect(k, `${String(k.identifier)} bayraksız çıktıda içerik taşımamalı`).not.toHaveProperty('description')
        expect(k).not.toHaveProperty('notes')
        expect(k).not.toHaveProperty('completedAt')
      }
    })

    it('--tam açıklama ve notları verir; kalan alanlar bayraksız çıktıyla AYNI', () => {
      const sade = path.join(dizin, 'sade.json')
      const tam = path.join(dizin, 'tam.json')
      expect(py(DISA, ['--db', db, '--hedef', sade]).cikis).toBe(0)
      const r = py(DISA, ['--db', db, '--hedef', tam, '--tam'])
      expect(r.cikis, r.stderr).toBe(0)
      const kayitlar = oku(tam)
      const ara = (id: string) => kayitlar.find((k) => k.identifier === id)
      expect(ara('ARC-1')?.description).toBe('ÖNCEKİ ÇALIŞMA: aranan yerler tamam; CSV adı urun-listesi.csv')
      expect(ara('REC-538')?.notes).toEqual([{ author: 'HARITA', content: 'not metni: kart içi bilgi', createdAt: '2026-09-20T00:00:00.000Z' }])
      // alanı olmayan kart: boş metin ve boş liste (None/eksik anahtar değil)
      expect(ara('ARC-2')).toMatchObject({ description: '', notes: [], completedAt: null })
      // HRT-44: Done'a geçiş anı --tam ile çıkar (kart-not-sayimi.cjs "bugün Done oldu" sorusunu buradan cevaplar)
      expect(ara('ARC-3')?.completedAt).toBe('2026-09-30T00:00:00.000Z')
      // description/notes/completedAt çıkarılınca bayraksız çıktıyla birebir (başka alan kaymadı)
      const cikarilmis = kayitlar.map((k) => {
        const { description: _d, notes: _n, completedAt: _c, ...geri } = k
        return geri
      })
      expect(sirala(cikarilmis)).toEqual(sirala(oku(sade)))
    })

    it('--tam çıktısı depoda İZLENEBİLİR yola yazılmaz: çıkış 2, dosya oluşmaz', () => {
      const izlenebilir = path.join(KOK, 'docs', 'hrt28-sizinti-denemesi.json')
      try {
        const r = py(DISA, ['--db', db, '--hedef', izlenebilir, '--tam'])
        expect(r.cikis).toBe(2)
        expect(r.stderr).toContain('izlenebilir')
        expect(fs.existsSync(izlenebilir), 'içerik depoya yazıldı').toBe(false)
      } finally {
        fs.rmSync(izlenebilir, { force: true })
      }
    })

    it('--tam hedefi depo DIŞI ya da .gitignore altındaysa yazılır; hedefsiz kullanım stdout verir', () => {
      const dis = path.join(dizin, 'tam-dis.json')
      expect(py(DISA, ['--db', db, '--hedef', dis, '--tam']).cikis).toBe(0)
      const yoksayilan = path.join(KOK, 'tmp', `hrt28-${process.pid}.json`)
      try {
        const r = py(DISA, ['--db', db, '--hedef', yoksayilan, '--tam'])
        expect(r.cikis, r.stderr).toBe(0)
        expect(fs.existsSync(yoksayilan)).toBe(true)
      } finally {
        fs.rmSync(yoksayilan, { force: true })
      }
      const s = py(DISA, ['--db', db, '--tam'])
      expect(s.cikis, s.stderr).toBe(0)
      expect(s.stdout).toContain('not metni: kart içi bilgi')
    })
  })

  it('pano dosyası yoksa çıkış 2 (sessiz yeşil yok)', () => {
    const d = py(DISA, ['--db', bosDb])
    expect(d.cikis).toBe(2)
    const s = py(SANTIYE, ['--db', bosDb, '--hedef', path.join(dizin, 'x.md')])
    expect(s.cikis).toBe(2)
    expect(`${s.stderr}`).toContain('pano dosyasi yok')
  })
})
