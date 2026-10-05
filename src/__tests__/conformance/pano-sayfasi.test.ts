// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-PANO-SAYFASI-1 — Recep'in pano sayfası (ARC-5) eksiksiz, kaçışlı ve depo DIŞI üretilir.
 *
 * ⭐NİÇİN VAR: sayfa Recep'in panoları ve kendi kararlarını gördüğü TEK yüzey. Üç sessiz kusur sınıfı var:
 * (1) kart düşer ve sayfa yine "tam" görünür; (2) kart başlığı / söz HTML olarak yorumlanır (veri talimata döner);
 * (3) sayfa depoya yazılır — depo PUBLIC, sayfada Recep sözleri var. Üçü de aşağıda ayrı kolla ölçülür.
 */
const KOK = process.cwd()
const require_ = createRequire(import.meta.url)

type Kayit = {
  identifier: string; title: string; status: string; serit: string; labels: string[]
  priority: number; createdAt: string; sonAnlamli: string | null
}
type Soz = { ts: string; sid: string; rol: string; pencere: string; no: string | null; cevap: string | null; nolar?: string[]; soz: string }
type Modul = {
  kacis: (m: unknown) => string
  trSaat: (iso: string) => string
  envanterOku: (m: string) => { ad: string; adlar: { ad: string; durum: string }[] }[] | null
  sayfaUret: (v: { kanban: { damga?: string; kayitlar: Kayit[] }; sozler: Soz[] | null; envanter: unknown; uretim: string }) => string
  calistir: (s: Record<string, unknown>) => { kod: number; hedef?: string; kart?: number; sebep?: string }
  hedefDepoIcindeMi: (h: string, k: string[]) => boolean
  KARAR_ETIKETI: string
}
const m = require_(path.join(KOK, 'scripts', 'kanban', 'pano-sayfasi.cjs')) as Modul

const kart = (o: Partial<Kayit>): Kayit => ({
  identifier: 'ALT-1', title: 'ALT-1 · örnek', status: 'Todo', serit: 'ALTYAPI', labels: [], priority: 2,
  createdAt: '2026-10-01T08:00:00Z', sonAnlamli: '2026-10-01T09:00:00Z', ...o,
})
const soz = (o: Partial<Soz>): Soz => ({
  ts: '2026-10-01T10:50:00.000Z', sid: 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3', rol: 'OPS', pencere: 'Ops', no: null, cevap: null, soz: 'devam et', ...o,
})
const KAYITLAR: Kayit[] = [
  kart({ identifier: 'ALT-1', title: 'ALT-1 · hazırlanıyor adımı', status: 'In Progress', priority: 3 }),
  kart({ identifier: 'ALT-3', title: 'ALT-3 · veritabanı bekçisi', status: 'Backlog' }),
  kart({ identifier: 'REC-551', title: 'ALTYAPI REC-551: prototip anahtarı', status: 'Done' }),
  kart({ identifier: 'OPS-7', title: 'OPS-7 · yedek yeri kararı', status: 'Todo', serit: 'OPS', labels: [m.KARAR_ETIKETI] }),
  kart({ identifier: 'HRT-3', title: 'HRT-3 · iş dağılımı', status: 'In Review', serit: 'HARITA' }),
]
const SOZLER: Soz[] = [
  soz({ ts: '2026-10-01T09:05:00.000Z', no: '233', cevap: 'evet', soz: '233 evet' }),
  soz({ ts: '2026-10-01T10:50:00.000Z', soz: 'devam et' }),
]
const veri = (o: Record<string, unknown> = {}) => ({
  kanban: { damga: '2026-10-01T10:55:00Z', kayitlar: KAYITLAR }, sozler: SOZLER, envanter: null, uretim: '2026-10-01T11:00:00Z', ...o,
})

const gecici: string[] = []
const geciciDizin = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pano-sayfasi-'))
  gecici.push(d)
  return d
}
afterEach(() => {
  while (gecici.length) fs.rmSync(gecici.pop() as string, { recursive: true, force: true })
})

describe('INV-PANO-SAYFASI-1 · sayfa', () => {
  it('beş bölüm var ve üretim saati Türkiye saatiyle yazılı', () => {
    const html = m.sayfaUret(veri())
    for (const baslik of ["Recep'in kararını bekleyenler", 'Departman panoları', 'Son kararlar', 'Kurulu olanlar']) {
      expect(html).toContain(`<h2>${baslik}</h2>`)
    }
    expect(html).toContain('Üretim: 01.10.2026 14:00')
  })

  it('hiçbir kart düşmez: girdideki her numara panolar bölümünde görünür', () => {
    const html = m.sayfaUret(veri())
    const panolar = html.slice(html.indexOf('id="panolar"'), html.indexOf('<h2>Son kararlar</h2>'))
    for (const k of KAYITLAR) expect(panolar).toContain(`<span class="no">${k.identifier}</span>`)
    expect((panolar.match(/<li>/g) || []).length).toBe(KAYITLAR.length)
    expect(html).toContain(`${KAYITLAR.length} kart, 3 pano`)
  })

  it('karar bekleyenler yalnız etiketli ve bitmemiş kartları listeler; etiket yoksa "yok" yazar', () => {
    const bolum = (h: string) => h.slice(h.indexOf('id="karar-bekleyenler"'), h.indexOf('<h2>Departman panoları</h2>'))
    const dolu = bolum(m.sayfaUret(veri()))
    expect(dolu).toContain('OPS-7')
    expect(dolu).not.toContain('ALT-1')
    const bitmis = KAYITLAR.map((k) => (k.identifier === 'OPS-7' ? { ...k, status: 'Done' } : k))
    expect(bolum(m.sayfaUret(veri({ kanban: { kayitlar: bitmis } })))).toContain('Karar bekleyen yok.')
  })

  it('son kararlar: numaralı söz tabloda, numarasız söz katlanmış listede, başlangıç notu yazılı', () => {
    const html = m.sayfaUret(veri())
    const bolum = html.slice(html.indexOf('id="son-kararlar"'), html.indexOf('<h2>Kurulu olanlar</h2>'))
    const katli = bolum.indexOf('<details>')
    expect(bolum).toContain('öncesi için kayıt yok')
    expect(bolum.indexOf('<td class="no">233</td>')).toBeGreaterThan(-1)
    expect(bolum.indexOf('<td class="no">233</td>')).toBeLessThan(katli)
    expect(bolum.indexOf('devam et')).toBeGreaterThan(katli)
    expect(bolum).toContain('01.10.2026 12:05') // 09:05Z → Türkiye saati
    for (const s of ['Tarih-saat', 'Pencere', 'Karar no', 'Cevap', 'Söz']) expect(bolum).toContain(`<th>${s}</th>`)
  })

  it('defter okunamadıysa bölüm "ölçülemedi" der, sayfa yine üretilir', () => {
    expect(m.sayfaUret(veri({ sozler: null }))).toContain('Söz defteri okunamadı (ölçülemedi).')
  })

  it('kart başlığı ve söz VERİDİR: HTML kaçışlı girer, etiket olarak yorumlanmaz', () => {
    const zehir = '<script>alert(1)</script><img src=x onerror="a()">'
    const html = m.sayfaUret(veri({
      kanban: { kayitlar: [kart({ identifier: 'ALT-9', title: `ALT-9 · ${zehir}`, serit: `<b>${zehir}` })] },
      sozler: [soz({ no: '1', cevap: 'evet', soz: zehir, pencere: zehir })],
    }))
    expect(html).not.toContain('<script>alert')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect((html.match(/<script/g) || []).length).toBe(0)
  })
})

describe('INV-PANO-SAYFASI-1 · envanter', () => {
  it('§3 tablolarından tür başına ad sayar; skill tablosunda yalnız .claude ağacı', () => {
    const metin = [
      '## 3 · Tür başına tablolar',
      '### 3.1 · hook — `.claude/hooks/*.cjs` (2 araç)',
      '| yol | tur | durum |', '|---|---|---|',
      '| `.claude/hooks/a.cjs` | hook | KAL |', '| `.claude/hooks/b.cjs` | hook | **EMEKLİ** |',
      '### 3.3 · skill (2 tekil ad)',
      '| # | Ad | Ağaç | durum |', '|---|---|---|---|',
      '| 1 | typography | .claude | KAL |', '| 2 | typography | .agent | KAL |',
      '## 4 · Özel satırlar', '| `olmamali` | x | KAL |',
    ].join('\n')
    const t = m.envanterOku(metin)
    expect(t?.map((x) => [x.ad, x.adlar.length])).toEqual([['hook', 2], ['skill', 1]])
    expect(m.envanterOku('')).toBeNull()
    const html = m.sayfaUret(veri({ envanter: t }))
    expect(html).toContain('kaynak: docs/audits/arac-envanteri-2026-09-07.md')
    expect(html).toContain('.claude/hooks/a.cjs')
  })

  it('gerçek envanter belgesi okunur ve en az dört tür çıkar', () => {
    const t = m.envanterOku(fs.readFileSync(path.join(KOK, 'docs', 'audits', 'arac-envanteri-2026-09-07.md'), 'utf8'))
    expect(t).not.toBeNull()
    expect((t || []).length).toBeGreaterThanOrEqual(4)
    for (const tur of t || []) expect(tur.adlar.length).toBeGreaterThan(0)
  })
})

describe('INV-PANO-SAYFASI-1 · koşum', () => {
  const kanbanDosyasi = (icerik: string) => {
    const f = path.join(geciciDizin(), 'kanban.json')
    fs.writeFileSync(f, icerik)
    return f
  }

  it('depo dışı hedefe yazar ve kart sayısını döndürür', () => {
    const hedef = path.join(geciciDizin(), 'alt', 'pano.html')
    const r = m.calistir({ hedef, kanbanJson: kanbanDosyasi(JSON.stringify({ kayitlar: KAYITLAR })), sozler: SOZLER, simdi: Date.parse('2026-10-01T11:00:00Z') })
    expect(r).toMatchObject({ kod: 0, kart: KAYITLAR.length })
    expect(fs.readFileSync(hedef, 'utf8')).toContain('<title>VentHub Pano</title>')
  })

  it('hedef depo içindeyse REDDEDER ve dosya yazmaz (depo PUBLIC)', () => {
    const hedef = path.join(KOK, 'pano-sayfasi-test-ciktisi.html')
    const r = m.calistir({ hedef, kanbanJson: kanbanDosyasi(JSON.stringify({ kayitlar: KAYITLAR })), sozler: SOZLER })
    expect(r.kod).toBe(2)
    expect(r.sebep).toContain('depo içinde')
    expect(fs.existsSync(hedef)).toBe(false)
    expect(m.hedefDepoIcindeMi(path.join(KOK, 'docs', 'x.html'), [KOK])).toBe(true)
    expect(m.hedefDepoIcindeMi(`${KOK}-komsu${path.sep}x.html`, [KOK])).toBe(false)
  })

  it('Kanban ölçülemezse (bozuk ya da eksik veri) çıkış 2 ve sayfa YAZILMAZ', () => {
    for (const icerik of ['{bozuk', JSON.stringify({ kaynak: 'Kanban' })]) {
      const hedef = path.join(geciciDizin(), 'pano.html')
      const r = m.calistir({ hedef, kanbanJson: kanbanDosyasi(icerik), sozler: SOZLER })
      expect(r.kod).toBe(2)
      expect(r.sebep).toContain('Kanban ölçülemedi')
      expect(fs.existsSync(hedef)).toBe(false)
    }
  })
})
