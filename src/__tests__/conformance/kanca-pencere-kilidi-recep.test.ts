/**
 * INV-KANCA-PENCERE-KILIDI-2 — Kilidi Recep'in sözü koyar/kaldırır; kilit varken OPS'un departmana mesajı yalnız izinli
 * kart numarasını anarsa gider; departman OPS'a yazdıysa cevap serbest (ARC-213).
 *
 * Kancalar: .claude/hooks/pencere-kilidi-recep.cjs (UserPromptSubmit) + pencere-kilidi-kapisi.cjs (SendMessage)
 * Mantık: scripts/board/pencere-kilidi.cjs. Sabotaj dahil.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK, 'scripts', 'board', 'pencere-kilidi.cjs')

interface Kilit {
  izinliler: string[]
  kartlar?: string[]
  koyulma?: string
  koyan?: string
}
interface Modul {
  recepMetni: (i: string) => string
  recepSozu: (i: string) => { tip: 'koy' | 'kaldir' | null; ifade: string }
  gelenMesajlar: (i: string, s?: { oturumKok?: string; rolKayit?: string }) => string[]
  karar: (g: { kilit: Kilit | null; alici: string; gonderenRol?: string; mesaj?: string; gelen?: Record<string, number>; simdi?: number }) => { izin: boolean; sebep: string }
  kilitYaz: (g: { roller: string[]; kartlar?: string[]; koyan?: string; ifade?: string; dosya: string; simdi?: number }) => Kilit
  kilitOku: (d: string) => { durum: string; kilit?: Kilit }
}
const m = gerek(MODUL) as Modul

const SID_ARAC = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'
const SID_OPS = 'cccccccc-1111-4111-8111-cccccccccccc'
const LOCAL_ARAC = 'local_22222222-aaaa-4aaa-8aaa-222222222222'

const enjeksiyon = (govde: string, ad = 'ARAÇ') => `<cross-session-message from="uds:x" from-session="local_1" from-name="${ad}" from-mode="prompting">${govde}</cross-session-message>`

let gecici = ''
let rolKayit = ''
let oturumKok = ''

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'pencere-recep-'))
  rolKayit = path.join(gecici, 'rol-kimlikleri.json')
  oturumKok = path.join(gecici, 'oturumlar')
  fs.mkdirSync(path.join(oturumKok, 'h', 'o'), { recursive: true })
  fs.writeFileSync(rolKayit, JSON.stringify({ ARAC: { sid: SID_ARAC, oncekiler: [] }, OPS: { sid: SID_OPS, oncekiler: [] } }))
  fs.writeFileSync(path.join(oturumKok, 'h', 'o', `${LOCAL_ARAC}.json`), JSON.stringify({ cliSessionId: SID_ARAC, title: 'Araç' }))
  process.env.VENTHUB_ROL_KIMLIK_DOSYASI = rolKayit
})
afterAll(() => {
  delete process.env.VENTHUB_ROL_KIMLIK_DOSYASI
  fs.rmSync(gecici, { recursive: true, force: true })
})

describe('INV-KANCA-PENCERE-KILIDI-2 · Recep sözü ayrıştırma', () => {
  it('enjeksiyon blokları Recep metninden atılır', () => {
    const istem = `${enjeksiyon('başka pencere açma')}\n<system-reminder>dokunma</system-reminder> selam <task-notification>x</task-notification>`
    expect(m.recepMetni(istem)).toBe('selam')
  })

  it('yasak ifadeleri kilit koyar (büyük/küçük harf ve Türkçe harf farksız)', () => {
    for (const s of ['Yola çıkacağım, bugün başka pencere açma', 'ŞİMDİ DEĞİL', 'dokunma', 'bu iş başlamasın', 'yola çıkıyorum', 'PENCERE AÇMA']) {
      expect(m.recepSozu(s).tip, s).toBe('koy')
    }
  })

  it('serbest ifadeleri kilidi kaldırır; yasak ifadesi serbestten ÖNCE bakılır', () => {
    for (const s of ['devam', 'yasak kalktı', 'başlat', 'serbest', 'izin verdim']) expect(m.recepSozu(s).tip, s).toBe('kaldir')
    expect(m.recepSozu('devam et ama başka pencere açma').tip).toBe('koy')
  })

  it('ekli sözcükler ve alakasız metin yakalanmaz', () => {
    for (const s of ['dokunmadan önce ölç', 'başlatma ayarı', 'selam, durum nedir', '']) expect(m.recepSozu(s).tip, s).toBeNull()
  })

  it('departman mesajı ya da sistem bloğundaki yasak ifadesi Recep sözü SAYILMAZ', () => {
    expect(m.recepSozu(enjeksiyon('dokunma, yola çıkıyorum'))).toEqual({ tip: null, ifade: '' })
    expect(m.recepSozu('<system-reminder>şimdi değil</system-reminder>')).toEqual({ tip: null, ifade: '' })
  })

  it('gönderen departmanlar çözülür: from-name, from-session (local_), tekrarsız', () => {
    expect(m.gelenMesajlar(enjeksiyon('x', 'ARAÇ'))).toEqual(['ARAC'])
    const lokal = `<cross-session-message from="uds:x" from-session="${LOCAL_ARAC}" from-name="bilinmeyen-ad">x</cross-session-message>`
    expect(m.gelenMesajlar(lokal, { oturumKok, rolKayit })).toEqual(['ARAC'])
    expect(m.gelenMesajlar(enjeksiyon('a') + enjeksiyon('b'))).toEqual(['ARAC'])
    expect(m.gelenMesajlar('düz metin')).toEqual([])
  })
})

describe('INV-KANCA-PENCERE-KILIDI-2 · karar: kart kuralı ve cevap hakkı', () => {
  const kilit: Kilit = { izinliler: ['ARAC'], kartlar: ['ARC-212'], koyulma: new Date(Date.UTC(2026, 9, 26, 10, 0, 0)).toISOString() }
  const t0 = Date.UTC(2026, 9, 26, 10, 0, 0)
  const k = (alici: string, mesaj: string, ek: Partial<{ gelen: Record<string, number>; simdi: number; gonderenRol: string }> = {}) =>
    m.karar({ kilit, alici, mesaj, gonderenRol: 'OPS', simdi: t0 + 60_000, ...ek })

  it('izinli kartı anan mesaj gider; yeni kart, numarasız ve karışık mesaj reddedilir', () => {
    expect(k('ARAC', 'ARC-212 uygun, PR okundu').izin).toBe(true)
    expect(k('ARAC', 'ARC-78 başla').izin).toBe(false)
    expect(k('ARAC', 'şunu da yap').izin).toBe(false)
    expect(k('ARAC', 'ARC-212 bitti, sıradaki ARC-78').izin).toBe(false)
    expect(k('ARAC', 'ARC-78 başla').sebep).toContain('ARC-78')
  })

  it('izinli olmayan departman, izinli kart numarası anılsa bile reddedilir', () => {
    expect(k('URUN', 'ARC-212 bilgi').izin).toBe(false)
  })

  it('kilitte kartlar YOKSA kart kuralı yok (ARC-212 davranışı korunur)', () => {
    expect(m.karar({ kilit: { izinliler: ['ARAC'] }, alici: 'ARAC', mesaj: 'numarasız her şey', gonderenRol: 'OPS' }).izin).toBe(true)
  })

  it('kart kuralı yalnız OPS göndericiye uygulanır; departmanlar arası yalnız departman kuralı', () => {
    expect(m.karar({ kilit, alici: 'ARAC', mesaj: 'numarasız', gonderenRol: 'ARAC' }).izin).toBe(true)
  })

  it('CEVAP: departman OPS\'a yazdıysa 30 dakika kilit dışı cevap; süre dolunca ya da kilitten ÖNCE yazdıysa değil', () => {
    const gelen = { URUN: t0 + 30_000 }
    expect(k('URUN', 'cevap', { gelen }).izin).toBe(true)
    expect(k('URUN', 'cevap', { gelen, simdi: t0 + 30_000 + 31 * 60_000 }).izin).toBe(false)
    expect(k('URUN', 'cevap', { gelen: { URUN: t0 - 1000 } }).izin).toBe(false)
    expect(k('HARITA', 'cevap', { gelen }).izin).toBe(false) // başka departmana geçmez
  })

  it('izinlisiz otomatik kilit: herkes kapalı, yalnız cevaplar ve OPS', () => {
    const oto: Kilit = { izinliler: [], kartlar: [], koyulma: kilit.koyulma }
    expect(m.karar({ kilit: oto, alici: 'ARAC', mesaj: 'ARC-212', gonderenRol: 'OPS', simdi: t0 + 1000 }).izin).toBe(false)
    expect(m.karar({ kilit: oto, alici: 'ARAC', mesaj: 'x', gonderenRol: 'OPS', simdi: t0 + 1000, gelen: { ARAC: t0 + 500 } }).izin).toBe(true)
  })

  it('kilit yazımı: otomatik kilit izinlisiz olabilir, elle koyulan olamaz; geçersiz kart reddedilir; kartlar okunur', () => {
    const d = path.join(gecici, 'yaz.json')
    expect(() => m.kilitYaz({ roller: [], dosya: d })).toThrow(/en az bir/)
    expect(() => m.kilitYaz({ roller: ['ARAC'], kartlar: ['abc'], dosya: d })).toThrow(/geçersiz kart/)
    const k2 = m.kilitYaz({ roller: ['ARAC'], kartlar: ['arc-212', 'ARC-212'], dosya: d })
    expect(k2.kartlar).toEqual(['ARC-212'])
    expect(m.kilitOku(d).kilit?.kartlar).toEqual(['ARC-212'])
    const oto = m.kilitYaz({ roller: [], kartlar: [], koyan: 'recep-sozu', ifade: 'dokunma', dosya: d })
    expect(oto.izinliler).toEqual([])
    expect(m.kilitOku(d).kilit?.kartlar).toEqual([])
    fs.rmSync(d)
  })
})

describe('INV-KANCA-PENCERE-KILIDI-2 · gerçek süreçler (uçtan uca)', () => {
  const env = (agent: string, kilit: string, gelen: string) => ({
    ...process.env,
    VENTHUB_PENCERE_AGENT: agent,
    VH_PENCERE_KILIDI_DOSYASI: kilit,
    VH_PENCERE_GELEN_DOSYASI: gelen,
    VH_OTURUM_KAYIT_DIZINI: oturumKok,
    VENTHUB_ROL_KIMLIK_DOSYASI: rolKayit,
  })
  const calis = (kok: string, kanca: string, stdin: unknown, e: NodeJS.ProcessEnv) =>
    spawnSync(process.execPath, [path.join(kok, '.claude', 'hooks', kanca)], { input: JSON.stringify(stdin), env: e, encoding: 'utf8', timeout: 15_000, windowsHide: true })
  const istemde = (prompt: string) => ({ prompt, cwd: gecici, session_id: SID_OPS })
  const mesaj = (to: string, message: string) => ({ tool_name: 'SendMessage', tool_input: { to, message }, cwd: gecici })
  const karar = (r: { stdout: string }) => (r.stdout ? (JSON.parse(r.stdout) as { hookSpecificOutput: { permissionDecision?: string; additionalContext?: string } }).hookSpecificOutput : null)

  it('Recep yasak yazar → kilit KONUR → departmana mesaj reddedilir → departman yazar → cevap gider → Recep devam der → kilit KALKAR', () => {
    const kilit = path.join(gecici, 'e2e-kilit.json')
    const gelen = path.join(gecici, 'e2e-gelen.json')
    const e = env('ops-pencere', kilit, gelen)

    const koy = calis(KOK, 'pencere-kilidi-recep.cjs', istemde('Yola çıkacağım, başka pencere açma'), e)
    expect(koy.status).toBe(0)
    expect(karar(koy)?.additionalContext).toContain('KİLİT AÇILDI')
    expect(m.kilitOku(kilit)).toMatchObject({ durum: 'var', kilit: { koyan: 'recep-sozu', izinliler: [], kartlar: [] } })

    const red = calis(KOK, 'pencere-kilidi-kapisi.cjs', mesaj('ARAC', 'ARC-78 başla'), e)
    expect(karar(red)?.permissionDecision).toBe('deny')

    // Araç OPS'a yazar: istemde cross-session-message görünür
    const ara = calis(KOK, 'pencere-kilidi-recep.cjs', istemde(enjeksiyon('ARC-212 bitti')), e)
    expect(ara.stdout).toBe('') // enjeksiyondaki ifade yoksa kilide dokunmaz
    expect(calis(KOK, 'pencere-kilidi-kapisi.cjs', mesaj('ARAC', 'tamam, teşekkürler'), e)).toMatchObject({ stdout: '' }) // CEVAP serbest
    expect(karar(calis(KOK, 'pencere-kilidi-kapisi.cjs', mesaj('URUN', 'yeni iş'), e))?.permissionDecision).toBe('deny') // başkası kapalı

    const kaldir = calis(KOK, 'pencere-kilidi-recep.cjs', istemde('devam'), e)
    expect(karar(kaldir)?.additionalContext).toContain('KİLİT KALDIRILDI')
    expect(m.kilitOku(kilit).durum).toBe('yok')
    expect(calis(KOK, 'pencere-kilidi-kapisi.cjs', mesaj('URUN', 'yeni iş'), e)).toMatchObject({ stdout: '' })
  })

  it('mevcut (elle konmuş, ayrıntılı) kilit Recep yasağıyla EZİLMEZ; OPS dışındaki pencerede kanca sessiz', () => {
    const kilit = path.join(gecici, 'e2e-kilit2.json')
    const gelen = path.join(gecici, 'e2e-gelen2.json')
    m.kilitYaz({ roller: ['ARAC'], kartlar: ['ARC-212'], dosya: kilit })
    const sonra = calis(KOK, 'pencere-kilidi-recep.cjs', istemde('dokunma'), env('ops-pencere', kilit, gelen))
    expect(sonra.stdout).toBe('')
    expect(m.kilitOku(kilit).kilit?.izinliler).toEqual(['ARAC'])
    fs.rmSync(kilit)
    expect(calis(KOK, 'pencere-kilidi-recep.cjs', istemde('dokunma'), env('arac-pencere', kilit, gelen))).toMatchObject({ stdout: '' })
    expect(fs.existsSync(kilit)).toBe(false)
  })

  it('FAIL-OPEN: bozuk stdin, istemsiz girdi → çıkış 0 ve sessiz', () => {
    const e = env('ops-pencere', path.join(gecici, 'fo.json'), path.join(gecici, 'fo-gelen.json'))
    for (const g of ['{bozuk', '', JSON.stringify({}), JSON.stringify({ prompt: '' })]) {
      const r = spawnSync(process.execPath, [path.join(KOK, '.claude', 'hooks', 'pencere-kilidi-recep.cjs')], { input: g, env: e, encoding: 'utf8', windowsHide: true })
      expect(r).toMatchObject({ status: 0, stdout: '' })
    }
  })
})

describe('INV-KANCA-PENCERE-KILIDI-2 · SABOTAJ', () => {
  function kopyaKur(hedef: string, degistir: (dosya: string, s: string) => string) {
    for (const g of ['scripts/board/pencere-kilidi.cjs', 'scripts/board/pencere-kimligi.cjs', 'scripts/board/pencere-adlari.cjs', '.claude/hooks/pencere-kilidi-kapisi.cjs', '.claude/hooks/pencere-kilidi-recep.cjs', '.claude/hooks/kartsiz-emir-uyarisi.cjs']) {
      const f = path.join(hedef, g)
      fs.mkdirSync(path.dirname(f), { recursive: true })
      const kaynak = fs.readFileSync(path.join(KOK, g), 'utf8')
      const yeni = degistir(g, kaynak)
      fs.writeFileSync(f, yeni)
    }
  }
  const e = (kilit: string, gelen: string) => ({
    ...process.env,
    VENTHUB_PENCERE_AGENT: 'ops-pencere',
    VH_PENCERE_KILIDI_DOSYASI: kilit,
    VH_PENCERE_GELEN_DOSYASI: gelen,
    VENTHUB_ROL_KIMLIK_DOSYASI: rolKayit,
  })
  const calis = (kok: string, kanca: string, stdin: unknown, env: NodeJS.ProcessEnv) =>
    spawnSync(process.execPath, [path.join(kok, '.claude', 'hooks', kanca)], { input: JSON.stringify(stdin), env, encoding: 'utf8', timeout: 15_000, windowsHide: true })

  it('enjeksiyon ayıklaması kaldırılırsa departman mesajındaki ifade kilidi KOYAR (sağlam kapı koymaz)', () => {
    const kopya = path.join(gecici, 'sabotaj-enj')
    kopyaKur(kopya, (g, s) => {
      if (!g.endsWith('scripts/board/pencere-kilidi.cjs')) return s
      const d = s.replace("for (const re of ENJEKSIYON_BLOKLARI) m = m.replace(re, ' ')", 'void ENJEKSIYON_BLOKLARI')
      expect(d).not.toBe(s)
      return d
    })
    const istem = { prompt: enjeksiyon('dokunma, yola çıkıyorum'), cwd: gecici, session_id: SID_OPS }
    const kS = path.join(gecici, 'sab1-kilit.json')
    const kG = path.join(gecici, 'sab1-kilit-saglam.json')
    calis(kopya, 'pencere-kilidi-recep.cjs', istem, e(kS, path.join(gecici, 'g1.json')))
    calis(KOK, 'pencere-kilidi-recep.cjs', istem, e(kG, path.join(gecici, 'g2.json')))
    expect(fs.existsSync(kS)).toBe(true) // sabotajlı: yanlış kilit
    expect(fs.existsSync(kG)).toBe(false) // sağlam: dokunmaz
  })

  it('kart kuralı kaldırılırsa numarasız mesaj izinli departmana GEÇER (sağlam kapı reddeder)', () => {
    const kopya = path.join(gecici, 'sabotaj-kart')
    kopyaKur(kopya, (g, s) => {
      if (!g.endsWith('scripts/board/pencere-kilidi.cjs')) return s
      const d = s.replace('if (Array.isArray(kilit.kartlar) &&', 'if (false &&')
      expect(d).not.toBe(s)
      return d
    })
    const kilit = path.join(gecici, 'sab2-kilit.json')
    m.kilitYaz({ roller: ['ARAC'], kartlar: ['ARC-212'], dosya: kilit })
    const girdi = { tool_name: 'SendMessage', tool_input: { to: 'ARAC', message: 'yeni numarasız iş' }, cwd: gecici }
    const ev = e(kilit, path.join(gecici, 'g3.json'))
    expect(calis(kopya, 'pencere-kilidi-kapisi.cjs', girdi, ev).stdout).toBe('') // sabotajlı: geçer
    expect(calis(KOK, 'pencere-kilidi-kapisi.cjs', girdi, ev).stdout).toContain('deny') // sağlam: reddeder
  })

  it('cevap hakkı sınırsız olursa süresi dolmuş departmana da gider (sağlam kapı reddeder)', () => {
    const kopya = path.join(gecici, 'sabotaj-cevap')
    kopyaKur(kopya, (g, s) => {
      if (!g.endsWith('scripts/board/pencere-kilidi.cjs')) return s
      const d = s.replace('simdi - gelen[c.rol] <= CEVAP_PENCERESI_MS', 'true')
      expect(d).not.toBe(s)
      return d
    })
    const kilit = path.join(gecici, 'sab3-kilit.json')
    const gelen = path.join(gecici, 'sab3-gelen.json')
    m.kilitYaz({ roller: [], kartlar: [], koyan: 'recep-sozu', dosya: kilit, simdi: Date.now() - 3 * 3600_000 })
    fs.writeFileSync(gelen, JSON.stringify({ ARAC: Date.now() - 2 * 3600_000 })) // 2 saat önce yazdı
    const girdi = { tool_name: 'SendMessage', tool_input: { to: 'ARAC', message: 'cevap' }, cwd: gecici }
    const ev = e(kilit, gelen)
    expect(calis(kopya, 'pencere-kilidi-kapisi.cjs', girdi, ev).stdout).toBe('')
    expect(calis(KOK, 'pencere-kilidi-kapisi.cjs', girdi, ev).stdout).toContain('deny')
  })
})
