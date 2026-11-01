/**
 * INV-KANCA-PENCERE-KILIDI-1 — Recep "başka pencere açma" dediğinde OPS kilit koyar; SendMessage izinli olmayan
 * departmana REDDEDİLİR, izinliye gider, kilit kalkınca hepsine gider (ARC-212).
 *
 * Kanca: .claude/hooks/pencere-kilidi-kapisi.cjs · eşleme ve karar: scripts/board/pencere-kilidi.cjs
 * Bu dosya SABOTAJ da içerir: karar işlevi gevşetilmiş bir kopya, kırmızı senaryoyu geçirir — yani aşağıdaki RED
 * kanıtları kapının gevşemesini gerçekten yakalar.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL_YOLU = path.join(KOK, 'scripts', 'board', 'pencere-kilidi.cjs')
const BETIK = MODUL_YOLU

interface Kilit {
  izinliler: string[]
  koyan?: string
  koyulma?: string
}
type Cozum = { tip: 'rol'; rol: string } | { tip: 'rolsuz-pencere' | 'kimlik-cozulemedi' | 'yayin' | 'ad' }
interface Modul {
  aliciCoz: (a: unknown, s?: { oturumKok?: string; rolKayit?: string }) => Cozum
  karar: (g: { kilit: Kilit | null; alici: string; gonderenRol?: string; cozum?: Cozum }) => { izin: boolean; sebep: string; izinliler: string[] }
  kilitYaz: (g: { roller: string[]; simdi?: number; dosya: string; not?: string }) => Kilit
  kilitOku: (d: string) => { durum: 'yok' | 'var' | 'bozuk'; kilit?: Kilit }
  kilitKaldir: (d: string) => boolean
  rolCoz: (y: string) => string
}
const m = gerek(MODUL_YOLU) as Modul

// Kimlikler (UUID biçimli sahte değerler)
const SID_ARAC = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'
const SID_ARAC_ESKI = 'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa'
const SID_URUN = 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb'
const SID_OPS = 'cccccccc-1111-4111-8111-cccccccccccc'
const SID_ROLSUZ = 'dddddddd-1111-4111-8111-dddddddddddd'
// local_ kimlikleri: ön ek cliSessionId ön ekinden FARKLI (gerçek kayıtta ölçülen durum: local_54395ed4 ↔ 69c8cf17)
const LOCAL_URUN = 'local_11111111-aaaa-4aaa-8aaa-111111111111'
const LOCAL_ARAC = 'local_22222222-aaaa-4aaa-8aaa-222222222222'
const LOCAL_ROLSUZ = 'local_33333333-aaaa-4aaa-8aaa-333333333333'
const LOCAL_YOK = 'local_44444444-aaaa-4aaa-8aaa-444444444444'

let gecici = ''
let kilitDosyasi = ''
let oturumKok = ''
let rolKayit = ''

function kopyaKur(hedef: string, degistir?: (kaynak: string) => string) {
  // Aynı göreli yerleşimi korur: hook ../../scripts/board/*.cjs ile bulur.
  for (const g of ['scripts/board/pencere-kilidi.cjs', 'scripts/board/pencere-kimligi.cjs', 'scripts/board/pencere-adlari.cjs', '.claude/hooks/pencere-kilidi-kapisi.cjs']) {
    const hedefDosya = path.join(hedef, g)
    fs.mkdirSync(path.dirname(hedefDosya), { recursive: true })
    let metin = fs.readFileSync(path.join(KOK, g), 'utf8')
    if (degistir && g.endsWith('scripts/board/pencere-kilidi.cjs')) metin = degistir(metin)
    fs.writeFileSync(hedefDosya, metin)
  }
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'pencere-kilidi-'))
  kilitDosyasi = path.join(gecici, 'pencere-kilidi.json')
  oturumKok = path.join(gecici, 'oturumlar')
  rolKayit = path.join(gecici, 'rol-kimlikleri.json')
  fs.mkdirSync(path.join(oturumKok, 'hesap', 'org'), { recursive: true })
  const yaz = (id: string, cli: string, title: string) =>
    fs.writeFileSync(path.join(oturumKok, 'hesap', 'org', `${id}.json`), JSON.stringify({ cliSessionId: cli, title }))
  yaz(LOCAL_URUN, SID_URUN, 'Ürün (yeni düzen)')
  yaz(LOCAL_ARAC, SID_ARAC_ESKI, 'Araç (yeni düzen)')
  yaz(LOCAL_ROLSUZ, SID_ROLSUZ, 'Sabah özeti (yalnız ölçüm)')
  fs.writeFileSync(
    rolKayit,
    JSON.stringify({
      ARAC: { sid: SID_ARAC, oncekiler: [SID_ARAC_ESKI] },
      URUN: { sid: SID_URUN, oncekiler: [] },
      OPS: { sid: SID_OPS, oncekiler: [] },
    }),
  )
  process.env.VENTHUB_ROL_KIMLIK_DOSYASI = rolKayit
})

afterAll(() => {
  delete process.env.VENTHUB_ROL_KIMLIK_DOSYASI
  fs.rmSync(gecici, { recursive: true, force: true })
})

describe('INV-KANCA-PENCERE-KILIDI-1 · alıcı → departman eşlemesi', () => {
  const coz = (a: string) => m.aliciCoz(a, { oturumKok, rolKayit })

  it('çıplak ad: büyük/küçük harf, Türkçe harf, -pencere ve çalışan soneki, parantezli başlık', () => {
    for (const a of ['ARAC', 'arac', 'Araç', 'ARAÇ', 'arac-pencere', 'arac-curutucu', 'Araç (yeni düzen)']) {
      expect(coz(a), a).toEqual({ tip: 'rol', rol: 'ARAC' })
    }
    // ListAgents adı köşeli ref ile de gelebilir: ad tipine düşüp kilidi DELMESİN
    for (const a of ['Ürün (yeni düzen) [d83e92]', 'Ürün [d83e92]', 'urun-pencere [d83e92]', 'Ürün (yeni düzen)']) {
      expect(coz(a), a).toEqual({ tip: 'rol', rol: 'URUN' })
    }
    expect(coz('geo-seo-pencere')).toEqual({ tip: 'rol', rol: 'GEO-SEO' })
    expect(coz('OPS')).toEqual({ tip: 'rol', rol: 'OPS' })
  })

  it('UUID: güncel ve ÖNCEKİ kimlik aynı role gider; bilinmeyen UUID çözülemez', () => {
    expect(coz(SID_ARAC)).toEqual({ tip: 'rol', rol: 'ARAC' })
    expect(coz(SID_ARAC_ESKI)).toEqual({ tip: 'rol', rol: 'ARAC' })
    expect(coz('eeeeeeee-1111-4111-8111-eeeeeeeeeeee')).toEqual({ tip: 'kimlik-cozulemedi' })
  })

  it('local_ kimliği: uygulama kaydındaki cliSessionId üzerinden role gider (ön ek eşleşmesi YOK)', () => {
    expect(coz(LOCAL_URUN)).toEqual({ tip: 'rol', rol: 'URUN' })
    expect(coz(LOCAL_ARAC)).toEqual({ tip: 'rol', rol: 'ARAC' })
    // ön ek tuzağı: local_ ön eki hiçbir rol kimliğinin ön ekine eşit değil
    expect(LOCAL_URUN.slice(6, 14)).not.toBe(SID_URUN.slice(0, 8))
  })

  it('local_ kaydı yok → çözülemedi; kayıt var ama departmansız (zamanlanmış görev) → rolsuz pencere', () => {
    expect(coz(LOCAL_YOK)).toEqual({ tip: 'kimlik-cozulemedi' })
    expect(coz(LOCAL_ROLSUZ)).toEqual({ tip: 'rolsuz-pencere' })
  })

  it('yayın ve departmana çözülmeyen çıplak ad', () => {
    expect(coz('*')).toEqual({ tip: 'yayin' })
    expect(coz('rastgele-alt-ajan')).toEqual({ tip: 'ad' })
  })
})

describe('INV-KANCA-PENCERE-KILIDI-1 · karar', () => {
  const kilit: Kilit = { izinliler: ['ARAC'] }
  const k = (alici: string, gonderenRol = 'OPS') => m.karar({ kilit, alici, gonderenRol, cozum: m.aliciCoz(alici, { oturumKok, rolKayit }) })

  it('kilit yok → herkese izin', () => {
    expect(m.karar({ kilit: null, alici: 'URUN' }).izin).toBe(true)
  })

  it('izinli ARAC gider; OPS her zaman gider; izinsiz URUN reddedilir (ad, UUID, local_ üçü de)', () => {
    expect(k('ARAC').izin).toBe(true)
    expect(k('Araç').izin).toBe(true)
    expect(k(LOCAL_ARAC).izin).toBe(true)
    expect(k('OPS', 'ARAC').izin).toBe(true)
    for (const a of ['URUN', 'Ürün', SID_URUN, LOCAL_URUN, 'urun-pencere', 'Ürün (yeni düzen) [d83e92]']) {
      const s = k(a)
      expect(s.izin, a).toBe(false)
      expect(s.sebep).toContain('URUN')
    }
  })

  it('kimliği çözülemeyen, departmansız ve yayın alıcılar reddedilir (izinli olduğu kanıtlanamaz)', () => {
    for (const a of [LOCAL_YOK, LOCAL_ROLSUZ, '*', 'eeeeeeee-1111-4111-8111-eeeeeeeeeeee']) expect(k(a).izin, a).toBe(false)
  })

  it('alt ajan adı (departmana çözülmeyen çıplak ad) geçer; göndericinin kendi rolü her zaman izinli', () => {
    expect(k('rastgele-alt-ajan').izin).toBe(true)
    expect(k('URUN', 'URUN').izin).toBe(true)
  })

  it('ret mesajı izinlileri taşır', () => {
    expect(k('URUN').izinliler).toEqual(['ARAC', 'OPS'])
  })
})

describe('INV-KANCA-PENCERE-KILIDI-1 · kilit dosyası ve komut', () => {
  const yol = () => path.join(gecici, 'komut-kilit.json')

  it('koy → yazar (atomik, tmp kalmaz); geçersiz departman REDDEDİLİR ve dosya oluşmaz', () => {
    const k = m.kilitYaz({ roller: ['Araç', 'arac', 'URUN'], dosya: yol(), simdi: Date.UTC(2026, 9, 26, 9, 0, 0) })
    expect(k.izinliler).toEqual(['ARAC', 'URUN'])
    expect(m.kilitOku(yol())).toMatchObject({ durum: 'var' })
    expect(fs.readdirSync(gecici).filter((f) => f.endsWith('.tmp'))).toEqual([])
    expect(() => m.kilitYaz({ roller: ['YOKBOYLEBIRDEPARTMAN'], dosya: path.join(gecici, 'olusmamali.json') })).toThrow(/bilinmeyen departman/)
    expect(fs.existsSync(path.join(gecici, 'olusmamali.json'))).toBe(false)
    expect(() => m.kilitYaz({ roller: [], dosya: path.join(gecici, 'olusmamali.json') })).toThrow(/en az bir/)
  })

  it('kaldir → siler; ikinci kez "zaten yok"; dosya yokken durum yok, bozukken bozuk', () => {
    expect(m.kilitKaldir(yol())).toBe(true)
    expect(m.kilitKaldir(yol())).toBe(false)
    expect(m.kilitOku(yol()).durum).toBe('yok')
    fs.writeFileSync(yol(), '{bozuk')
    expect(m.kilitOku(yol()).durum).toBe('bozuk')
    fs.writeFileSync(yol(), JSON.stringify({ izinliler: 'ARAC' }))
    expect(m.kilitOku(yol()).durum).toBe('bozuk')
    fs.rmSync(yol())
  })

  it('komut satırı: --koy / --goster / --kaldir çıkış kodları ve metinleri', () => {
    const env = { ...process.env, VH_PENCERE_KILIDI_DOSYASI: path.join(gecici, 'cli-kilit.json') }
    const kos = (...a: string[]) => spawnSync(process.execPath, [BETIK, ...a], { env, encoding: 'utf8', windowsHide: true, timeout: 15_000 })
    expect(kos('--goster').stdout).toContain('Kilit yok')
    const koy = kos('--koy', 'ARAC', '--not', 'Recep sözü')
    expect(koy.status).toBe(0)
    expect(koy.stdout).toContain('İzinli: ARAC')
    expect(kos('--goster').stdout).toContain('Kilit VAR')
    expect(kos('--koy', 'SAHTE').status).toBe(2)
    expect(kos('--kaldir').stdout).toContain('kaldırıldı')
    expect(kos('--goster').stdout).toContain('Kilit yok')
    expect(kos('--bilinmeyen').status).toBe(2)
  })
})

describe('INV-KANCA-PENCERE-KILIDI-1 · gerçek kanca süreci (kabul ölçüsü)', () => {
  const ortam = (kilit: string, agent = 'ops-pencere') => ({
    ...process.env,
    VH_PENCERE_KILIDI_DOSYASI: kilit,
    VH_OTURUM_KAYIT_DIZINI: oturumKok,
    VENTHUB_ROL_KIMLIK_DOSYASI: rolKayit,
    VENTHUB_PENCERE_AGENT: agent,
  })
  const kos = (kok: string, stdin: string, env: NodeJS.ProcessEnv) =>
    spawnSync(process.execPath, [path.join(kok, '.claude', 'hooks', 'pencere-kilidi-kapisi.cjs')], { input: stdin, env, encoding: 'utf8', timeout: 15_000, windowsHide: true })
  const mesaj = (to: unknown, tool = 'SendMessage') => JSON.stringify({ tool_name: tool, tool_input: { to, message: 'OPS: selam' }, cwd: gecici })
  const red = (r: { stdout: string }) => {
    if (!r.stdout) return null
    const j = JSON.parse(r.stdout) as { hookSpecificOutput: { permissionDecision?: string; permissionDecisionReason?: string; additionalContext?: string } }
    return j.hookSpecificOutput
  }

  it('KİLİT YOKKEN hiçbir şey değişmez: herkese mesaj gider, kanca sessiz', () => {
    const env = ortam(path.join(gecici, 'hic-yok.json'))
    for (const a of ['URUN', 'ARAC', LOCAL_URUN, SID_URUN, '*']) expect(kos(KOK, mesaj(a), env), a).toMatchObject({ status: 0, stdout: '' })
  })

  it('KİLİT ARAC: URUN reddedilir (ad, UUID, local_); ARAC ve OPS gider; ret mesajı izinlileri söyler', () => {
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi)
    for (const a of ['URUN', 'Ürün', SID_URUN, LOCAL_URUN, 'Ürün (yeni düzen) [d83e92]']) {
      const r = kos(KOK, mesaj(a), env)
      expect(r.status).toBe(0)
      const c = red(r)
      expect(c?.permissionDecision, a).toBe('deny')
      expect(c?.permissionDecisionReason).toContain('İzinli departmanlar: ARAC, OPS')
      expect(c?.permissionDecisionReason).toContain('başka pencere açma')
    }
    for (const a of ['ARAC', 'Araç', LOCAL_ARAC, SID_ARAC, 'OPS']) expect(kos(KOK, mesaj(a), env), a).toMatchObject({ status: 0, stdout: '' })
  })

  it('KİLİT KALKINCA hepsine gider', () => {
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    expect(m.kilitKaldir(kilitDosyasi)).toBe(true)
    const env = ortam(kilitDosyasi)
    for (const a of ['URUN', LOCAL_URUN, SID_URUN]) expect(kos(KOK, mesaj(a), env), a).toMatchObject({ status: 0, stdout: '' })
  })

  it('gönderen departman penceresiyse kendi rolüne ve OPS\'a yazabilir, başkasına yazamaz', () => {
    m.kilitYaz({ roller: ['URUN'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi, 'arac-pencere')
    expect(kos(KOK, mesaj('OPS'), env)).toMatchObject({ stdout: '' })
    expect(kos(KOK, mesaj('ARAC'), env)).toMatchObject({ stdout: '' })
    expect(red(kos(KOK, mesaj('HARITA'), env))?.permissionDecision).toBe('deny')
  })

  it('SendMessage dışı araç ve alt ajan adı geçer', () => {
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi)
    expect(kos(KOK, mesaj('URUN', 'Bash'), env)).toMatchObject({ status: 0, stdout: '' })
    expect(kos(KOK, mesaj('rastgele-alt-ajan'), env)).toMatchObject({ status: 0, stdout: '' })
  })

  it('FAIL-OPEN: bozuk stdin, boş stdin, "to" metin değil → mesaj gider (çıkış 0, sessiz)', () => {
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi)
    for (const s of ['{bozuk', '', mesaj({ x: 1 }), mesaj(''), mesaj(null)]) expect(kos(KOK, s, env), s).toMatchObject({ status: 0, stdout: '' })
  })

  it('BOZUK kilit dosyası: mesaj gider AMA gönderene sesli uyarı verilir (sessizce korumasız kalmaz)', () => {
    fs.writeFileSync(kilitDosyasi, '{bozuk')
    const r = kos(KOK, mesaj('URUN'), ortam(kilitDosyasi))
    expect(r.status).toBe(0)
    const c = red(r)
    expect(c?.permissionDecision).toBeUndefined()
    expect(c?.additionalContext).toContain('kilit UYGULANMADI')
  })

  it('SABOTAJ: karar gevşetilmiş kopya kırmızı senaryoyu geçirir — yukarıdaki RED kanıtı gevşemeyi yakalar', () => {
    const kopya = path.join(gecici, 'sabotajli')
    // `{ izin: false` → `{ izin: true`: izinsiz alıcıyı da geçiren tipik gevşetme
    kopyaKur(kopya, (s) => {
      const degisti = s.split('{ izin: false').join('{ izin: true')
      expect(degisti).not.toBe(s) // sabotaj gerçekten bir şey değiştirdi
      return degisti
    })
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi)
    // sağlam kapı: red var
    expect(red(kos(KOK, mesaj('URUN'), env))?.permissionDecision).toBe('deny')
    // sabotajlı kapı: red YOK (test bu durumda kırmızı olurdu)
    expect(kos(kopya, mesaj('URUN'), env)).toMatchObject({ status: 0, stdout: '' })
  })

  it('SABOTAJ 2: kanca kilidi hiç okumazsa (kilit yok gibi davranırsa) izinsiz alıcı geçer', () => {
    const kopya = path.join(gecici, 'sabotajli2')
    kopyaKur(kopya, (s) => {
      const degisti = s.replace("return { durum: 'var'", "return { durum: 'yok'")
      expect(degisti).not.toBe(s)
      return degisti
    })
    m.kilitYaz({ roller: ['ARAC'], dosya: kilitDosyasi })
    const env = ortam(kilitDosyasi)
    expect(kos(kopya, mesaj('URUN'), env)).toMatchObject({ stdout: '' })
    expect(red(kos(KOK, mesaj('URUN'), env))?.permissionDecision).toBe('deny')
  })
})
