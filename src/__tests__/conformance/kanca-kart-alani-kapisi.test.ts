/**
 * INV-KANCA-KART-ALANI-1 — kart açılırken (kanban add_task) atanan departmanın görev ve dosya alanı gösterilir,
 * kart başka departmanın alanına düşüyorsa uyarılır; BLOKLAMAZ (ARC-32).
 *
 * Kanca: .claude/hooks/kart-alani-kapisi.cjs · veri: docs/roller/DEPARTMAN-HARITASI.md (üretilmiş tablo).
 * Regresyon: 4 Ekim olayı (mod/kanca işi YETENEK'e açıldı, sahibi ARAÇ).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kart-alani-kapisi.cjs')

type Harita = Record<string, { gorev: string; alan: string; desenler: { onek: string; tam: boolean }[] }>
interface Kanca {
  haritayiOku: (metin: string) => Harita
  yollar: (metin: string) => string[]
  sahibi: (yol: string, harita: Harita) => string | null
  departman: (girdi: Record<string, unknown>, harita: Harita) => string | null
  incele: (girdi: Record<string, unknown>, harita: Harita, kartOku?: (dept: string) => string | null) => string[]
  ad: (ham: string) => string
  gorevDegilOku: (metin: string | null) => { ifadeler: string[]; sahip: string | null; ham: string }[]
  GOREV_DEGIL_SATIRI: RegExp
}
const k = gerek(KANCA) as Kanca
const harita = k.haritayiOku(fs.readFileSync(path.join(KOK, 'docs', 'roller', 'DEPARTMAN-HARITASI.md'), 'utf8'))

const ekle = (o: Record<string, unknown>) => ({ action: 'add_task', ...o })
const rolKarti = (dept: string): string | null => {
  try {
    return fs.readFileSync(path.join(KOK, 'docs', 'roller', `${dept}.md`), 'utf8')
  } catch {
    return null
  }
}
const gorevDisiSatirlari = (satirlar: string[]) => satirlar.filter((x) => /görev dışı/.test(x))

describe('INV-KANCA-KART-ALANI-1 · veri ve çözümleme', () => {
  it('gerçek departman haritası ayrıştırılır: ARAC, ALTYAPI, URUN, HARITA, YETENEK var; ARAC alanı .claude/hooks/ önekini içerir', () => {
    for (const d of ['ARAC', 'ALTYAPI', 'URUN', 'HARITA', 'YETENEK', 'GEO-SEO', 'KATALOG']) {
      expect(harita[d], `${d} haritada yok`).toBeDefined()
    }
    expect(harita.ARAC.desenler.map((d) => d.onek)).toContain('.claude/hooks/')
    expect(harita.ARAC.gorev).toMatch(/Kanca/)
  })

  it('ad: Türkçe harfler ve küçük harf aynı departmanı verir', () => {
    expect(k.ad('ARAÇ')).toBe('ARAC')
    expect(k.ad('arac')).toBe('ARAC')
    expect(k.ad('Altyapı')).toBe('ALTYAPI')
    expect(k.ad('harita')).toBe('HARITA')
  })

  it('departman: assignee önce, yoksa başlık öneki; ikisi de yoksa null', () => {
    expect(k.departman({ assignee: 'ARAÇ' }, harita)).toBe('ARAC')
    expect(k.departman({ title: 'ARC-109 · iş' }, harita)).toBe('ARAC')
    expect(k.departman({ title: 'ALT-52 · iş', assignee: 'YETENEK' }, harita)).toBe('YETENEK')
    expect(k.departman({ title: 'Başlıksız iş' }, harita)).toBeNull()
    expect(k.departman({ assignee: 'YOKBOYLEBIR' }, harita)).toBeNull()
  })

  it('yollar: dosya yollarını çıkarır, "ve/veya" gibi sözcük çiftleri sahipsiz kalır', () => {
    expect(k.yollar('bkz .claude/hooks/a.cjs ve src/views/admin/Tablo.tsx, kanca/eklenti.')).toEqual(
      expect.arrayContaining(['.claude/hooks/a.cjs', 'src/views/admin/Tablo.tsx']),
    )
    expect(k.sahibi('ve/veya', harita)).toBeNull()
    expect(k.sahibi('.claude/hooks/x.cjs', harita)).toBe('ARAC')
    expect(k.sahibi('src/views/admin/Tablo.tsx', harita)).toBe('ADMIN')
  })
})

describe('INV-KANCA-KART-ALANI-1 · kural', () => {
  it('atanan departmanın Görev + Dosya alanı satırı gösterilir', () => {
    const s = k.incele(ekle({ title: 'ARC-120 · kanca bakımı', assignee: 'ARAC' }), harita)
    expect(s[0]).toMatch(/^KART ALANI \(ARAC\): Görev: .*Kanca/)
    expect(s[0]).toMatch(/Dosya alanı: .*\.claude\/hooks/)
  })

  it('⭐4 Ekim REGRESYONU: mod/kanca işi YETENEK\'e açılırsa ARAÇ uyarısı çıkar (anahtar kelime ve yol)', () => {
    const s = k.incele(
      ekle({
        title: 'YTN-13 · mod kurulumu',
        assignee: 'YETENEK',
        description: 'Kanca ve eklenti mod işi; dosya .claude/hooks/yeni.cjs',
      }),
      harita,
    )
    const hepsi = s.join('\n')
    expect(hepsi).toMatch(/KART ALANI \(YETENEK\)/)
    expect(hepsi, 'anahtar kelime uyarısı yok').toMatch(/kanca\/hook\/eklenti\/mod.*ARAC/)
    expect(hepsi, 'yol uyarısı yok').toMatch(/\.claude\/hooks\/yeni\.cjs ARAC dosya alanına düşüyor/)
  })

  it('kendi alanındaki yol ve ARAC kartı için başka uyarı yok', () => {
    const tamKart = 'KAYNAK/CETVEL: cetvel yok.\nYÖNTEM: elle.\nÖNCEKİ ÇALIŞMA: arandı.\nkanca .claude/hooks/a.cjs ve tools/x/y.cjs'
    const s = k.incele(ekle({ title: 'ARC-5 · x', assignee: 'ARAC', description: tamKart }), harita)
    expect(s).toHaveLength(1)
  })

  it('"model/modül" mod sayılmaz', () => {
    const s = k.incele(ekle({ title: 'URN-9 · model ve modül sayfası', assignee: 'URUN' }), harita)
    expect(s.join('\n')).not.toMatch(/ARAC'ın alanına/)
  })

  it('departman çözülemezse tek satır "departman çözülemedi"', () => {
    const s = k.incele(ekle({ title: 'Başlıksız iş' }), harita)
    expect(s[0]).toMatch(/departman çözülemedi/)
  })

  it('add_task dışındaki eylem ve boş girdi → sessiz', () => {
    expect(k.incele({ action: 'update_task', assignee: 'ARAC' }, harita)).toEqual([])
    expect(k.incele(undefined as never, harita)).toEqual([])
  })
})

describe('INV-KANCA-KART-ALANI-2 · "Görev değil" uyarısı (ARC-138, karar 369)', () => {
  it('satır biçimi rol kartı üreticisinin başlık sabitiyle AYNI: üretici biçimi değişirse kanca körleşmez', () => {
    const uretici = gerek(path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')) as { GOREV_DEGIL_BASLIK: string }
    expect(k.GOREV_DEGIL_SATIRI.test(`${uretici.GOREV_DEGIL_BASLIK}CI iş akışı (ALTYAPI); site kodu (URUN).`)).toBe(true)
  })

  it('gerçek ARAC kartından öğeler ve sahipleri okunur; yol içeren öğe atlanır', () => {
    const ogeler = k.gorevDegilOku(rolKarti('ARAC'))
    expect(ogeler.map((o) => o.sahip)).toEqual(expect.arrayContaining(['ALTYAPI', 'HARİTA', 'URUN']))
    expect(ogeler.flatMap((o) => o.ifadeler)).toContain('bağımlılık')
    // URUN kartındaki "3d/** (3D)" öğesi yol kolunun işidir, ifade olarak gelmez
    const urun = k.gorevDegilOku(rolKarti('URUN')).flatMap((o) => o.ifadeler)
    expect(urun.some((x) => x.includes('3d/'))).toBe(false)
  })

  it('çakışma: başlık atanan departmanın "Görev değil" ifadesini tam sözcük geçirirse UYARI, sahibi yazılır', () => {
    const s = k.incele(ekle({ title: 'ARC-9 · bağımlılık güncelle', assignee: 'ARAC' }), harita, rolKarti)
    const g = gorevDisiSatirlari(s)
    expect(g).toHaveLength(1)
    expect(g[0]).toMatch(/"bağımlılık"/)
    expect(g[0]).toMatch(/ARAC rol kartının "Görev değil" satırında/)
    expect(g[0]).toMatch(/sahibi: ALTYAPI/)
  })

  it('SESSİZ: rol kartı yok, kartta "Görev değil" satırı yok, okuma hatası ya da kartOku verilmedi', () => {
    const girdi = ekle({ title: 'ARC-9 · bağımlılık güncelle', assignee: 'ARAC' })
    expect(gorevDisiSatirlari(k.incele(girdi, harita, () => null))).toEqual([])
    expect(gorevDisiSatirlari(k.incele(girdi, harita, () => '## Görev\nKanca işleri.\n'))).toEqual([])
    expect(gorevDisiSatirlari(k.incele(girdi, harita))).toEqual([])
    const hata = () => {
      throw new Error('okunamadı')
    }
    expect(gorevDisiSatirlari(k.incele(girdi, harita, hata))).toEqual([])
  })

  it('tam sözcük: "bağımlılıklar" ya da yalnız açıklamada geçen ifade uyarı DEĞİL; yalnız başlığa bakılır', () => {
    const a = k.incele(ekle({ title: 'ARC-9 · bağımlılıklar', assignee: 'ARAC' }), harita, rolKarti)
    expect(gorevDisiSatirlari(a)).toEqual([])
    const b = k.incele(ekle({ title: 'ARC-9 · kanca', description: 'bağımlılık ve belge', assignee: 'ARAC' }), harita, rolKarti)
    expect(gorevDisiSatirlari(b)).toEqual([])
  })

  it('departmanın KENDİ işi uyarı vermez: ALTYAPI kartında "bağımlılık" ALTYAPI görevidir', () => {
    const s = k.incele(ekle({ title: 'ALT-9 · bağımlılık güncelle', assignee: 'ALTYAPI' }), harita, rolKarti)
    expect(gorevDisiSatirlari(s)).toEqual([])
  })

  it('departman çözülemezse bu kol da sessiz (yalnız mevcut "departman çözülemedi" satırı)', () => {
    const s = k.incele(ekle({ title: 'bağımlılık güncelle' }), harita, rolKarti)
    expect(gorevDisiSatirlari(s)).toEqual([])
    expect(s[0]).toMatch(/departman çözülemedi/)
  })
})

describe('INV-KANCA-KART-ALANI-3 · kart satırları UYARISI (ARC-150, OPS 16 Ekim "B: önleme")', () => {
  const tam = 'KAYNAK/CETVEL: cetvel yok.\nYÖNTEM: elle.\nÖNCEKİ ÇALIŞMA: Kanban ve git arandı.'
  const eksikler = (o: Record<string, unknown>) =>
    (gerek(KANCA) as { eksikSatirlar: (g: Record<string, unknown>) => string[] }).eksikSatirlar({ action: 'add_task', ...o })

  it('üç satır da varsa sessiz', () => {
    expect(eksikler({ description: tam })).toEqual([])
  })

  it('hiçbiri yoksa tek satır UYARI üçünü de sayar', () => {
    const s = eksikler({ description: 'sadece açıklama' })
    expect(s).toHaveLength(1)
    expect(s[0]).toMatch(/KART SATIRLARI UYARI/)
    expect(s[0]).toMatch(/KAYNAK\/CETVEL, YÖNTEM, ÖNCEKİ ÇALIŞMA/)
  })

  it('yalnız eksik olanı söyler (YÖNTEM yok)', () => {
    const s = eksikler({ description: 'KAYNAK/CETVEL: x.\nÖNCEKİ ÇALIŞMA: y.' })
    expect(s[0]).toMatch(/açıklamasında YÖNTEM satırı yok/)
    expect(s[0]).not.toMatch(/KAYNAK\/CETVEL,|ÖNCEKİ ÇALIŞMA satırı/)
  })

  it('küçük harf ve ASCII yazım tolere edilir; açıklama hiç yoksa üçü de eksik', () => {
    expect(eksikler({ description: 'kaynak/cetvel: x\nyontem: elle\noncekı calısma: y' })).toEqual([])
    expect(eksikler({})[0]).toMatch(/KAYNAK\/CETVEL, YÖNTEM, ÖNCEKİ ÇALIŞMA/)
  })

  it('add_task dışındaki eylemde ve boş girdide sessiz; incele çıktısına girer, ENGEL YOK', () => {
    expect(eksikler({ action: 'update_task', description: 'x' })).toEqual([])
    const s = k.incele(ekle({ title: 'ARC-9 · x', assignee: 'ARAC', description: 'kısa' }), harita)
    expect(s.some((x) => /KART SATIRLARI UYARI/.test(x))).toBe(true)
  })
})

describe('INV-KANCA-KART-ALANI-1 · gerçek süreç', () => {
  const kos = (stdin: string) =>
    spawnSync(process.execPath, [KANCA], { input: stdin, encoding: 'utf8', timeout: 15_000, windowsHide: true })
  const cagri = (tool: string, girdi: Record<string, unknown>) => JSON.stringify({ tool_name: tool, tool_input: girdi })
  const KANBAN = 'mcp__wrongstack-kanban__kanban_manage'

  it('add_task → stdout additionalContext (gerçek harita), çıkış 0', () => {
    const r = kos(cagri(KANBAN, { action: 'add_task', title: 'URN-7 · x', assignee: 'URUN', description: 'bkz .claude/hooks/a.cjs' }))
    expect(r.status).toBe(0)
    const c = JSON.parse(r.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(c.hookSpecificOutput.hookEventName).toBe('PreToolUse')
    expect(c.hookSpecificOutput.additionalContext).toMatch(/KART ALANI \(URUN\)/)
    expect(c.hookSpecificOutput.additionalContext).toMatch(/ARAC dosya alanına düşüyor/)
  })

  it('"Görev değil" çakışması gerçek süreçte additionalContext\'e girer ve çıkış 0 kalır (ENGEL YOK)', () => {
    const r = kos(cagri(KANBAN, { action: 'add_task', title: 'ARC-9 · bağımlılık güncelle', assignee: 'ARAC' }))
    expect(r.status).toBe(0)
    const c = JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }
    expect(c.hookSpecificOutput.additionalContext).toMatch(/KART ALANI UYARI \(görev dışı\)/)
  })

  it('başka araç, başka eylem, bozuk ve boş stdin → sessiz ve çıkış 0 (FAIL-OPEN)', () => {
    for (const s of [cagri('Bash', { command: 'x' }), cagri(KANBAN, { action: 'get_task' }), '{bozuk', '']) {
      expect(kos(s)).toMatchObject({ status: 0, stdout: '' })
    }
  })
})
