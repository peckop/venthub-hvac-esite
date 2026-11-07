/**
 * INV-KANCA-ONCE-ELINDEKI-IS-1 — departman, elindeki In Progress işi bitirmeden yeni karta geçerken uyarılır
 * (ARC-217, ARC-212 ek parçası). Açılışta "ÖNCE BUNLAR / SIRADA" bloğu, kart başlatılırken uyarı.
 *
 * Mantık: scripts/board/once-elindeki-is.cjs · kanca: .claude/hooks/once-elindeki-is-uyarisi.cjs
 * SABOTAJ: "beklemede etiketli kart sayılmaz" ve "kartın kendisi sayılmaz" senaryoları, bu kuralları gevşeten
 * (etiketi yok sayan / kendini sayan) bir kopyaya karşı KIRMIZI verir; yani kural gerçekten ölçülüyor.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL_YOLU = path.join(KOK, 'scripts', 'board', 'once-elindeki-is.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'once-elindeki-is-uyarisi.cjs')

interface Kart {
  id: string
  title: string
  assignee?: string | null
  sutun: string
  status?: string
  priority?: string
  labels?: string[]
  dueDate?: string | null
}
interface Modul {
  vadeMetni: (bugun: string, kartlar?: Kart[] | null, rol?: string, onek?: Record<string, string>) => string
  acilisMetni: (rol: string, kartlar: Kart[] | null, onek?: Record<string, string>) => string
  baslatmaUyarisi: (hedef: string, kartlar: Kart[] | null, onek?: Record<string, string>) => string
  grupla: (k: Kart[], rol: string, onek?: Record<string, string>) => { surenler: Kart[]; bekleyenler: Kart[]; incelemede: Kart[]; sirada: Kart[] }
  beklemede: (k: Kart) => boolean
}
const m = gerek(MODUL_YOLU) as Modul
const kanca = gerek(KANCA) as { baslatmaMi: (g: Record<string, unknown>) => boolean }

const ONEK = { ARC: 'ARAC', ALT: 'ALTYAPI', HRT: 'HARITA' }

function kart(no: string, sutun: string, ek: Partial<Kart> = {}): Kart {
  return { id: `id-${no}`, title: `${no} · ${ek.title ?? 'örnek iş'}`, sutun, labels: [], assignee: null, ...ek, ...(ek.title ? { title: `${no} · ${ek.title}` } : {}) }
}

const KARTLAR: Kart[] = [
  kart('ARC-147', 'In Progress'),
  kart('ARC-148', 'In Progress', { assignee: 'ARAC' }),
  kart('ARC-155', 'In Progress', { labels: ['beklemede', 'ops-bekliyor'] }),
  kart('ARC-36', 'Review'),
  kart('ARC-214', 'Backlog', { labels: ['ops-emri'] }),
  kart('ARC-300', 'Backlog', { labels: ['diger'] }),
  kart('ARC-217', 'Backlog', { labels: ['ops-emri'] }),
  kart('ALT-5', 'In Progress'),
  kart('REC-77', 'In Progress', { assignee: 'Araç' }), // taşınan Linear kartı: atanan ARAÇ
  kart('REC-78', 'In Progress', { assignee: null }), // departmansız: kimseye sayılmaz
]

describe('açılış bloğu (ÖNCE BUNLAR / SIRADA)', () => {
  it('ARAÇ: In Progress + Review "ÖNCE BUNLAR"da, ops-emri kartları "SIRADA"da; beklemede olan öne çıkmaz', () => {
    const metin = m.acilisMetni('ARAC', KARTLAR, ONEK)
    const once = metin.slice(metin.indexOf('ÖNCE BUNLAR'), metin.indexOf('SIRADA'))
    expect(once).toContain('ARC-147')
    expect(once).toContain('ARC-148')
    expect(once).toContain('ARC-36')
    expect(once).toContain('REC-77') // atanan "Araç" katlanır
    expect(once).not.toContain('ARC-155') // beklemede
    expect(once).not.toContain('ALT-5') // başka departman
    expect(once).not.toContain('REC-78') // departmansız
    const sirada = metin.slice(metin.indexOf('SIRADA'))
    expect(sirada).toContain('ARC-214')
    expect(sirada).toContain('ARC-217')
    expect(sirada).not.toContain('ARC-300') // ops-emri etiketi yok
  })

  it('ÖNCE BUNLAR, SIRADA başlığından önce gelir', () => {
    const metin = m.acilisMetni('ARAC', KARTLAR, ONEK)
    expect(metin.indexOf('ÖNCE BUNLAR')).toBeGreaterThanOrEqual(0)
    expect(metin.indexOf('ÖNCE BUNLAR')).toBeLessThan(metin.indexOf('SIRADA'))
  })

  it('SIRADA: To Do önce, sonra Backlog; her ikisinde öncelik sırası', () => {
    const kartlar = [
      { ...kart('ARC-601', 'Backlog', { labels: ['ops-emri'] }), priority: 'low' },
      { ...kart('ARC-602', 'Backlog', { labels: ['ops-emri'] }), priority: 'critical' },
      { ...kart('ARC-603', 'To Do', { labels: ['ops-emri'] }), priority: 'low' },
    ] as Kart[]
    const sirada = m.grupla(kartlar, 'ARAC', ONEK).sirada.map((k) => k.id)
    expect(sirada).toEqual(['id-ARC-603', 'id-ARC-602', 'id-ARC-601'])
  })

  it('elinde açık iş yok, yalnız sırada kart var: ÖNCE BUNLAR yazılmaz', () => {
    const metin = m.acilisMetni('ARAC', [kart('ARC-5', 'Backlog', { labels: ['ops-emri'] })], ONEK)
    expect(metin).not.toContain('ÖNCE BUNLAR')
    expect(metin).toContain('SIRADA')
  })

  it('Kanban okunamadı (null), kart yok ya da rol boş: sessiz', () => {
    expect(m.acilisMetni('ARAC', null, ONEK)).toBe('')
    expect(m.acilisMetni('ARAC', [], ONEK)).toBe('')
    expect(m.acilisMetni('', KARTLAR, ONEK)).toBe('')
    expect(m.acilisMetni('YETENEK', KARTLAR, ONEK)).toBe('')
  })

  it('çok kart: tavan uygulanır, fazlası "+N kart daha" diye sayılır', () => {
    const cok = Array.from({ length: 10 }, (_, i) => kart(`ARC-${400 + i}`, 'In Progress'))
    const metin = m.acilisMetni('ARAC', cok, ONEK)
    expect((metin.match(/ARC-4\d\d/g) ?? []).length).toBe(6)
    expect(metin).toContain('+4 kart daha')
  })
})

describe('kart başlatma uyarısı', () => {
  it('başka In Progress kart varken yeni kart başlatılırsa UYARI verir, ilk üçünü ve fazlasını yazar', () => {
    const u = m.baslatmaUyarisi('ARC-217', KARTLAR, ONEK)
    expect(u).toContain('ÖNCE ELİNDEKİ İŞ')
    expect(u).toContain('ARC-147')
    expect(u).toContain('önce bitir ya da "beklemede" etiketi')
    expect(u).toContain('3 kartı var') // ARC-147, ARC-148, REC-77 (ARC-155 beklemede)
    expect(u).not.toContain('(+')
  })

  it('üçten fazla kartta ilk üçü yazar, fazlasını sayar', () => {
    const cok = [...Array.from({ length: 5 }, (_, i) => kart(`ARC-${500 + i}`, 'In Progress')), kart('ARC-217', 'Backlog')]
    const u = m.baslatmaUyarisi('ARC-217', cok, ONEK)
    expect(u).toContain('5 kartı var')
    expect(u).toContain('(+2)')
  })

  it('kimlik (uuid) ile de bulunur', () => {
    expect(m.baslatmaUyarisi('id-ARC-217', KARTLAR, ONEK)).toContain('ÖNCE ELİNDEKİ İŞ')
  })

  it('SABOTAJ: beklemede etiketli tek In Progress kart uyarıyı tetiklemez', () => {
    const kartlar = [kart('ARC-155', 'In Progress', { labels: ['beklemede'] }), kart('ARC-217', 'Backlog')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
    // gevşetilmiş kopya (etiketi yok sayar) uyarı verirdi: kural gerçekten ölçülüyor
    const gevsek = kartlar.filter((k) => k.sutun === 'In Progress')
    expect(gevsek.length).toBe(1)
  })

  it('SABOTAJ: kartın kendisi başkası sayılmaz (zaten In Progress olan kartı yeniden başlatmak uyarmaz)', () => {
    const kartlar = [kart('ARC-217', 'In Progress')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('blocked durumu beklemede sayılır', () => {
    const kartlar = [kart('ARC-9', 'In Progress', { status: 'blocked' }), kart('ARC-217', 'Backlog')]
    expect(m.beklemede(kartlar[0] as Kart)).toBe(true)
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('başka departmanın In Progress kartı uyarmaz', () => {
    const kartlar = [kart('ALT-5', 'In Progress'), kart('ARC-217', 'Backlog')]
    expect(m.baslatmaUyarisi('ARC-217', kartlar, ONEK)).toBe('')
  })

  it('bilinmeyen kart, boş hedef, okunamayan Kanban, çözülemeyen departman: sessiz (fail-open)', () => {
    expect(m.baslatmaUyarisi('ARC-99999', KARTLAR, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('', KARTLAR, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('ARC-217', null, ONEK)).toBe('')
    expect(m.baslatmaUyarisi('REC-78', KARTLAR, ONEK)).toBe('')
  })
})

describe('kanca (PreToolUse)', () => {
  it('yalnız başlatma çağrıları Kanban’a gider', () => {
    expect(kanca.baslatmaMi({ action: 'start_task', taskId: 'x' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'claim_task', taskId: 'x' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'transition_task', lifecycleStage: 'running' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'in-progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', columnId: 'In Progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'In Progress' })).toBe(true)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'review' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'move_task', targetColumnId: 'done' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'transition_task', lifecycleStage: 'done' })).toBe(false)
    expect(kanca.baslatmaMi({ action: 'add_note' })).toBe(false)
    expect(kanca.baslatmaMi({})).toBe(false)
  })

  const calistir = (stdin: string) => spawnSync(process.execPath, [KANCA], { input: stdin, encoding: 'utf8', timeout: 20000 })

  it('başlatma olmayan çağrı, yanlış araç ve bozuk girdi: çıkış 0, çıktı yok', () => {
    for (const g of [
      JSON.stringify({ tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'add_note', taskId: 'x' } }),
      JSON.stringify({ tool_name: 'Bash', tool_input: { action: 'start_task', taskId: 'x' } }),
      '{bozuk',
      '',
    ]) {
      const r = calistir(g)
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })

  it('bilinmeyen kart başlatılırken (gerçek Kanban okunur ya da okunamaz) çıkış hep 0', () => {
    const r = calistir(
      JSON.stringify({ tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'start_task', taskId: 'yok-boyle-kart' } }),
    )
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})

describe('VADESİ GELEN (ARC-236, OPS açılışı)', () => {
  const BUGUN = '2026-11-02'
  const vadeli = [
    kart('OPS-197', 'In Progress', { title: 'bugün vadeli', dueDate: '2026-11-02' }),
    kart('ALT-76', 'To Do', { title: 'saatli vade', dueDate: '2026-10-23T18:00:00+03:00' }),
    kart('ARC-31', 'Backlog', { title: 'en eski', dueDate: '2026-10-06' }),
    kart('ARC-900', 'Backlog', { title: 'yarın vadeli', dueDate: '2026-11-03' }),
    kart('ARC-901', 'Done', { title: 'bitmiş', dueDate: '2026-10-01' }),
    kart('ARC-902', 'Backlog', { title: 'vadesiz' }),
  ]

  it('vade ≤ bugün ve Done olmayan kartlar, en yeni vade önce (bugün → geriye); saatli vade de sayılır', () => {
    const metin = m.vadeMetni(BUGUN, vadeli)
    expect(metin.split('\n').filter(Boolean).map((s) => s.split(' · ')[0].replace('VADESİ GELEN: ', ''))).toEqual(['OPS-197', 'ALT-76', 'ARC-31'])
    expect(metin).toContain('VADESİ GELEN: OPS-197 · bugün vadeli · 2026-11-02')
  })

  it('gelecek vade, Done ve vadesiz kart görünmez', () => {
    const metin = m.vadeMetni(BUGUN, vadeli)
    for (const yok of ['ARC-900', 'ARC-901', 'ARC-902']) expect(metin).not.toContain(yok)
  })

  it('en çok 10 satır, fazlası "+N" notu', () => {
    const cok = Array.from({ length: 13 }, (_, i) => kart(`ARC-${100 + i}`, 'Backlog', { dueDate: '2026-10-01' }))
    const satirlar = m.vadeMetni(BUGUN, cok).split('\n').filter(Boolean)
    expect(satirlar).toHaveLength(11)
    expect(satirlar[10]).toContain('+3 vadesi gelen kart daha')
  })

  it('Kanban okunamazsa (null), vade yoksa ya da bugün geçersizse boş (fail-open)', () => {
    expect(m.vadeMetni(BUGUN, null)).toBe('')
    expect(m.vadeMetni(BUGUN, [kart('ARC-902', 'Backlog')])).toBe('')
    expect(m.vadeMetni('yarın', vadeli)).toBe('')
  })

  it('SABOTAJ: süzgeci gevşeten kopya (gelecek + Done dahil) bu testlerde KIRMIZI verir', () => {
    const gevsek = vadeli.filter((k) => k.dueDate).map((k) => k.title)
    expect(gevsek.join()).toContain('ARC-900') // gevşek kopya yarını da sayardı
    expect(m.vadeMetni(BUGUN, vadeli)).not.toContain('ARC-900')
  })
})

describe('VADESİ GELEN · kendi panosu (ARC-268, OPS 7 Kasım)', () => {
  const BUGUN = '2026-11-07'
  const kartlar = [
    kart('ARC-31', 'Backlog', { title: 'araç vadeli', dueDate: '2026-10-06' }),
    kart('ARC-32', 'To Do', { title: 'araç bugün', dueDate: '2026-11-07' }),
    kart('ARC-33', 'Backlog', { title: 'araç gelecek', dueDate: '2026-11-20' }),
    kart('ARC-34', 'Done', { title: 'araç bitmiş', dueDate: '2026-10-01' }),
    kart('ALT-76', 'To Do', { title: 'altyapı vadeli', dueDate: '2026-10-23' }),
    kart('HRT-9', 'In Progress', { title: 'harita vadeli', dueDate: '2026-11-07' }),
    kart('REC-77', 'Backlog', { title: 'taşınan araç kartı', dueDate: '2026-10-10', assignee: 'Araç' }),
    kart('REC-78', 'Backlog', { title: 'departmansız', dueDate: '2026-10-10' }),
  ]
  const no = (metin: string) => metin.split('\n').filter(Boolean).map((s) => s.split(' · ')[0].replace('VADESİ GELEN: ', ''))

  it('(a) departman rolünde YALNIZ kendi panosunun vadesi gelen kartı görünür (başlık öneki ya da atanan)', () => {
    const metin = m.vadeMetni(BUGUN, kartlar, 'ARAC', ONEK)
    expect(no(metin)).toEqual(['ARC-32', 'REC-77', 'ARC-31'])
    for (const baska of ['ALT-76', 'HRT-9', 'REC-78']) expect(metin).not.toContain(baska)
    expect(no(m.vadeMetni(BUGUN, kartlar, 'altyapi', ONEK))).toEqual(['ALT-76'])
  })

  it('(b) OPS ve rolsüz çağrıda bütün panolar görünür', () => {
    const hepsi = ['ARC-32', 'HRT-9', 'ALT-76', 'REC-77', 'REC-78', 'ARC-31'] // vade tarihi azalan, eşitte kart no
    expect(no(m.vadeMetni(BUGUN, kartlar, 'OPS', ONEK))).toEqual(hepsi)
    expect(no(m.vadeMetni(BUGUN, kartlar, '', ONEK))).toEqual(hepsi)
    expect(no(m.vadeMetni(BUGUN, kartlar, undefined, ONEK))).toEqual(hepsi)
  })

  it('(c) gelecek vade ve Done görünmez; kendi panosunda vade yoksa boş', () => {
    const metin = m.vadeMetni(BUGUN, kartlar, 'ARAC', ONEK)
    expect(metin).not.toContain('ARC-33')
    expect(metin).not.toContain('ARC-34')
    expect(m.vadeMetni(BUGUN, kartlar, 'TASARIM', ONEK)).toBe('')
  })

  it('(d) çok kartta kendi panosunda da çıktı tavanlı (10 satır + "+N" notu)', () => {
    const cok = Array.from({ length: 14 }, (_, i) => kart(`ARC-${200 + i}`, 'Backlog', { dueDate: '2026-10-01' }))
    const satirlar = m.vadeMetni(BUGUN, cok, 'ARAC', ONEK).split('\n').filter(Boolean)
    expect(satirlar).toHaveLength(11)
    expect(satirlar[10]).toContain('+4 vadesi gelen kart daha')
  })

  it('(e) Kanban okunamazsa (null) kendi panosunda da sessiz boş (fail-open)', () => {
    expect(m.vadeMetni(BUGUN, null, 'ARAC', ONEK)).toBe('')
  })

  it('SABOTAJ: süzgeç kalkarsa (rol yok sayılırsa) (a) KIRMIZI verir — ayrım gerçekten ölçülüyor', () => {
    const rolsuz = m.vadeMetni(BUGUN, kartlar, '', ONEK)
    expect(rolsuz).toContain('ALT-76') // gevşek kopya başka panoyu da gösterirdi
    expect(m.vadeMetni(BUGUN, kartlar, 'ARAC', ONEK)).not.toContain('ALT-76')
  })

  it('açılış kancası bağlı: vadeEkle rol sınırı kaldırıldı, rol departman olarak geçirilir (OPS boş)', () => {
    const kaynak = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    const govde = kaynak.slice(kaynak.indexOf('function vadeEkle()'), kaynak.indexOf('const yaz = () =>'))
    expect(govde).not.toMatch(/!==\s*'OPS'\)\s*return/)
    expect(govde).toMatch(/vadeMetni\(bugun,\s*undefined,\s*rol\)/)
    // ARC-269: rol kararı kaynak regex'inde değil, saf vadeRolu'da ölçülür; kanca onu çağırmalı.
    expect(govde).toMatch(/vadeRolu\(rolSeridi\)/)
    // ARC-271: rolsüz pencere (vadeRolu null) vadeMetni'ne HİÇ ulaşmadan döner; satır silinirse tüm panolar rolsüz pencereye akar.
    expect(govde.indexOf('rol === null')).toBeGreaterThan(-1)
    expect(govde.indexOf('rol === null')).toBeLessThan(govde.indexOf('vadeMetni('))
    expect(govde).toMatch(/if \(rol === null\) return/)
  })
})

describe('VADESİ GELEN · gerçek ONEK ve rol kararı (ARC-269, ARC-268 denetçi bulguları)', () => {
  const BUGUN = '2026-11-07'
  const alani = gerek(path.join(KOK, '.claude', 'hooks', 'kart-alani-kapisi.cjs')) as {
    ONEK: Record<string, string>
    HARITA: string
    haritayiOku: (metin: string) => Record<string, unknown>
  }
  const mm = m as unknown as { vadeRolu: (r: unknown) => string | null }
  const k = (title: string, extra: Record<string, unknown> = {}) => ({ id: title, title, sutun: 'To Do', dueDate: BUGUN, ...extra })

  it('haritadaki HER departman gerçek ONEK tablosunda bir önekle karşılanır (3D, I18N, MARKA dahil)', () => {
    const karsilanan = new Set(Object.values(alani.ONEK))
    const harita = fs.readFileSync(alani.HARITA, 'utf8')
    // Haritada "(planlı, kapalı)" işaretli departmanın panosu/öneki yoktur; açılırken standartta önek verilir, o zamana kadar muaf.
    const kapali = (d: string) => new RegExp(`^\\|\\s*${d.replace('MUHENDISLIK', 'M[ÜU]HEND[İI]SL[İI]K')}\\s*\\(planlı, kapalı\\)`, 'm').test(harita)
    const eksik = Object.keys(alani.haritayiOku(harita)).filter((d) => !karsilanan.has(d) && !kapali(d))
    expect(eksik, `önek tablosunda olmayan departman: ${eksik.join(', ')}`).toEqual([])
  })

  it('3D ve I18N pencereleri kendi vadeli kartını görür (başlık öneki ya da atanan), başkasınınkini görmez', () => {
    const kartlar = [k('3D-3 model bütçesi'), k('I18-5 sözlük dalgası'), k('DIL-2 çeviri'), k('MRK-1 logo'), k('ARC-1 başka', { assignee: 'ARAÇ' })]
    for (const [rol, no] of [['3D', '3D-3'], ['I18N', 'I18-5'], ['I18N', 'DIL-2'], ['MARKA', 'MRK-1']] as const) {
      const metin = m.vadeMetni(BUGUN, kartlar, rol, alani.ONEK)
      expect(metin, rol).toContain(no)
      expect(metin, rol).not.toContain('ARC-1')
    }
    expect(m.vadeMetni(BUGUN, [k('X-9 sahipsiz', { assignee: '3D' })], '3D', alani.ONEK)).toContain('X-9')
  })

  it('⛔SABOTAJ: eksik önek tablosu (eski hâl) 3D/I18N kartını sessizce kaçırır — gerçek tablo bunu kapatır', () => {
    const eski = { ARC: 'ARAC', ALT: 'ALTYAPI', HRT: 'HARITA' }
    expect(m.vadeMetni(BUGUN, [k('I18-5 sözlük')], 'I18N', eski)).toBe('')
    expect(m.vadeMetni(BUGUN, [k('I18-5 sözlük')], 'I18N', alani.ONEK)).toContain('I18-5')
  })

  it('vadeRolu: rolsüz → null (sessiz), OPS (her harf boyutu) → "" (bütün panolar), departman → olduğu gibi', () => {
    for (const bos of [undefined, null, '', '   ']) expect(mm.vadeRolu(bos)).toBeNull()
    for (const ops of ['OPS', 'ops', ' Ops ']) expect(mm.vadeRolu(ops)).toBe('')
    expect(mm.vadeRolu('ARAC')).toBe('ARAC')
    expect(mm.vadeRolu(' 3D ')).toBe('3D')
  })

  it('⛔SABOTAJ: karar tersine çevrilirse (OPS rolü geçirilir / departman boşaltılır) ayrım bozulur', () => {
    const kartlar = [k('ARC-1 a'), k('ALT-2 b')]
    expect(m.vadeMetni(BUGUN, kartlar, mm.vadeRolu('ARAC') as string, alani.ONEK)).not.toContain('ALT-2')
    expect(m.vadeMetni(BUGUN, kartlar, mm.vadeRolu('OPS') as string, alani.ONEK)).toContain('ALT-2')
  })
})
