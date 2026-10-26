/**
 * INV-KANCA-ONCEKI-CALISMA-1 — kart açılırken departmanın önceki işini (commit, ölçüm belgesi, Done kart) kanca
 * kendisi bulur ve açana gösterir; ÖNCEKİ ÇALIŞMA satırı hiçbirini anmıyorsa UYARI verir (ARC-215).
 *
 * Çekirdek: scripts/board/onceki-calisma-adaylari.cjs · kanca: .claude/hooks/onceki-calisma-kapisi.cjs
 * Kaynaklar (git, Kanban) sahte verilir; gerçek veriyle uçtan uca ölçüm PR gövdesinde.
 * SABOTAJ: satırda aday anılırsa UYARI yok; ilgisiz başlıkta aday yok; kaynak boşsa sessiz.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'onceki-calisma-kapisi.cjs')

interface Aday {
  tur: string
  id: string
  ad: string
}
interface Bulunan {
  commit: unknown[]
  belge: unknown[]
  kart: unknown[]
  hepsi: Aday[]
}
interface Modul {
  anahtarSozcukler: (b: string) => string[]
  adaylariBul: (g: {
    baslik: string
    commitler?: Array<{ id: string; konu: string }>
    dosyalar?: string[]
    doneKartlar?: Array<{ no: string; baslik: string }>
  }) => Bulunan
  oncekiSatiri: (a: string) => string
  metinler: (b: Bulunan, aciklama?: string) => string[]
  sonCommitler: (k: string, o: string, c: () => { status: number; stdout: string }) => Array<{ id: string; konu: string }>
  departmanBelgeleri: (
    k: string,
    d: Array<{ onek: string; tam: boolean }>,
    ls: () => { status: number; stdout: string },
  ) => string[]
}
const m = gerek(path.join(KOK, 'scripts', 'board', 'onceki-calisma-adaylari.cjs')) as Modul
const kanca = gerek(KANCA) as { hesapla: (g: unknown, k?: Record<string, unknown>) => string[] }

const COMMITLER = [
  { id: 'aaa1111', konu: 'YETENEK (YTN-12): wrongstack-kanban önce-ara iki arama ve skill kullanım ölçümü (#1667)' },
  { id: 'bbb2222', konu: 'YETENEK (YTN-3): tamamen ilgisiz muhasebe entegrasyonu' },
]
const DOSYALAR = ['docs/audits/skill-departman-setleri-2026-09-30.md', 'docs/audits/skill-ilgisiz-konu.md']
const DONE = [
  { no: 'YTN-11', baslik: 'YTN-11 · skill kullanım ölçümü: departman setleri' },
  { no: 'YTN-2', baslik: 'YTN-2 · alakasız logo çalışması' },
]
const BASLIK = 'YTN-19 · skill departman dağıtımı ve kullanım ölçümü'

describe('anahtar sözcükler', () => {
  it('numara ve gürültü ayıklanır, kısa sözcük atılır', () => {
    const a = m.anahtarSozcukler('ARC-215 · Önceki çalışma kancası: kart açılırken alıcı departmanın dosya')
    expect(a).toContain('departmanın')
    expect(a).not.toContain('arc-215')
    expect(a).not.toContain('kart') // 5 harften kısa
    expect(a).not.toContain('dosya') // gürültü
  })
})

describe('aday bulma', () => {
  it('ilgili commit, belge ve Done kartı bulur; ilgisizleri bulmaz', () => {
    const b = m.adaylariBul({ baslik: BASLIK, commitler: COMMITLER, dosyalar: DOSYALAR, doneKartlar: DONE })
    const idler = b.hepsi.map((a) => a.id)
    expect(idler).toContain('aaa1111')
    expect(idler).toContain('docs/audits/skill-departman-setleri-2026-09-30.md')
    expect(idler).toContain('YTN-11')
    expect(idler).not.toContain('bbb2222')
    expect(idler).not.toContain('docs/audits/skill-ilgisiz-konu.md')
    expect(idler).not.toContain('YTN-2')
  })

  it('SABOTAJ: tek ortak kısa sözcük aday yapmaz; ilgisiz başlıkta hiç aday yok', () => {
    const b = m.adaylariBul({ baslik: 'ARC-999 · tamamen farklı bambaşka bir konu', commitler: COMMITLER, dosyalar: DOSYALAR, doneKartlar: DONE })
    expect(b.hepsi).toEqual([])
  })

  it('kaynaklar boşsa ya da başlıkta anahtar sözcük yoksa sessiz', () => {
    expect(m.adaylariBul({ baslik: BASLIK }).hepsi).toEqual([])
    expect(m.adaylariBul({ baslik: 'ARC-1 · a b c', commitler: COMMITLER }).hepsi).toEqual([])
  })

  it('kaynak başına en çok 3, toplam en çok 8', () => {
    const cok = Array.from({ length: 12 }, (_, i) => ({ id: `c${i}c${i}c${i}`, konu: `skill departman dağıtımı ölçümü ${i}` }))
    const b = m.adaylariBul({ baslik: BASLIK, commitler: cok, dosyalar: [], doneKartlar: [] })
    expect(b.commit.length).toBe(3)
    expect(b.hepsi.length).toBeLessThanOrEqual(8)
  })
})

describe('metin ve UYARI', () => {
  const bulunan = () => m.adaylariBul({ baslik: BASLIK, commitler: COMMITLER, dosyalar: DOSYALAR, doneKartlar: DONE })

  it('satırda "yok" yazıyorsa adaylar basılır ve UYARI eklenir', () => {
    const t = m.metinler(bulunan(), 'KAYNAK/CETVEL: x\nÖNCEKİ ÇALIŞMA: yok\nYÖNTEM: elle')
    expect(t.join('\n')).toContain('ÖNCEKİ ÇALIŞMA adayları')
    expect(t.join('\n')).toContain('ÖNCEKİ ÇALIŞMA UYARI')
  })

  it('SABOTAJ: satır bir adayı anıyorsa UYARI yok (adaylar yine basılır)', () => {
    const t = m.metinler(bulunan(), 'ÖNCEKİ ÇALIŞMA: YTN-11 ve docs/audits/skill-departman-setleri-2026-09-30.md okundu.\nYÖNTEM: elle')
    expect(t.length).toBe(1)
    expect(t.join('\n')).not.toContain('UYARI')
  })

  it('açıklamada ÖNCEKİ ÇALIŞMA satırı yoksa yalnız adaylar (UYARI başka kapının işi)', () => {
    const t = m.metinler(bulunan(), 'sadece açıklama')
    expect(t.join('\n')).not.toContain('ÖNCEKİ ÇALIŞMA UYARI')
  })

  it('aday yoksa hiçbir şey basılmaz', () => {
    expect(m.metinler({ commit: [], belge: [], kart: [], hepsi: [] }, 'ÖNCEKİ ÇALIŞMA: yok')).toEqual([])
  })

  it('oncekiSatiri sonraki ANAHTAR: satırında durur', () => {
    expect(m.oncekiSatiri('A: 1\nÖNCEKİ ÇALIŞMA: bir iki\nYÖNTEM: elle').trim()).toBe('bir iki')
  })
})

describe('kaynak okuyucular (sahte çalıştırıcı)', () => {
  it('git çıktısı ayrıştırılır; hata durumunda boş', () => {
    expect(m.sonCommitler(KOK, 'YTN', () => ({ status: 0, stdout: 'abc1234\tYTN-1 başlık\n' }))).toEqual([{ id: 'abc1234', konu: 'YTN-1 başlık' }])
    expect(m.sonCommitler(KOK, 'YTN', () => ({ status: 128, stdout: '' }))).toEqual([])
  })
  it('belgeler yalnız harita desenlerinin docs/audits önekiyle eşleşir', () => {
    const ls = () => ({ status: 0, stdout: 'docs/audits/skill-a.md\ndocs/audits/geo-b.md\n' })
    expect(m.departmanBelgeleri(KOK, [{ onek: 'docs/audits/skill-', tam: false }], ls)).toEqual(['docs/audits/skill-a.md'])
    expect(m.departmanBelgeleri(KOK, [{ onek: 'scripts/seo/', tam: false }], ls)).toEqual([])
    expect(m.departmanBelgeleri(KOK, [{ onek: 'docs/audits/skill-', tam: false }], () => ({ status: 1, stdout: '' }))).toEqual([])
  })
})

describe('kanca', () => {
  const girdi = { action: 'add_task', title: BASLIK, assignee: 'YETENEK', description: 'ÖNCEKİ ÇALIŞMA: yok' }
  const kaynaklar = {
    commitler: () => COMMITLER,
    dosyalar: () => DOSYALAR,
    kartlar: () => [{ id: 'k1', title: DONE[0]?.baslik, sutun: 'Done', labels: [] }],
  }

  it('YETENEK kartı için sahte kaynaklarla aday ve UYARI üretir', () => {
    const t = kanca.hesapla(girdi, kaynaklar).join('\n')
    expect(t).toContain('aaa1111')
    expect(t).toContain('YTN-11')
    expect(t).toContain('ÖNCEKİ ÇALIŞMA UYARI')
  })

  it('add_task dışı eylem, departmanı çözülemeyen kart ve okunamayan Kanban: çökmez', () => {
    expect(kanca.hesapla({ action: 'add_note' }, kaynaklar)).toEqual([])
    expect(kanca.hesapla({ action: 'add_task', title: 'başlıksız önek yok', description: '' }, kaynaklar)).toEqual([])
    expect(kanca.hesapla(girdi, { ...kaynaklar, kartlar: () => null }).join('\n')).toContain('aaa1111')
  })

  it('süreç: bozuk girdi, yanlış araç ve boş girdi çıkış 0, çıktı yok', () => {
    for (const g of ['{bozuk', '', JSON.stringify({ tool_name: 'Bash', tool_input: { action: 'add_task', title: BASLIK } })]) {
      const r = spawnSync(process.execPath, [KANCA], { input: g, encoding: 'utf8', timeout: 20000 })
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })
})
