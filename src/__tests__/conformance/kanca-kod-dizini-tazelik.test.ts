// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-KOD-DIZINI-TAZELIK-1 · açılış kancası kod dizininin yaşını ölçer, bayatsa yenilemeyi kilitli ve arka planda
 * BİR kez başlatır (ARC-311, ARC-310 kararı: --watch ve zamanlanmış görev yok). Gerçek yenileme/süreç AÇILMAZ:
 * başlatıcı sahtedir, durum dizini geçicidir.
 */
interface Karar {
  eylem: 'sessiz' | 'surer' | 'hata-bekle' | 'baslat'
  yasGun: number | null
}
interface Modul {
  karar: (p: { dizin: string; simdi?: number }) => Karar
  kilitAl: (dizin: string, simdi?: number) => boolean
  bitir: (p: { dizin: string; basari: boolean; simdi?: number; kilidiBirak?: boolean }) => void
  kancaKos: (p: { dizin: string; simdi?: number; env?: Record<string, string>; baslatici?: () => void; bosBellekMB?: number }) => string
  KILIT_OMRU_MS: number
  HATA_BEKLEME_MS: number
}

const req = createRequire(import.meta.url)
const KAYNAK = path.resolve(process.cwd(), 'scripts', 'hijyen', 'kod-dizini-tazelik.cjs')
const M = req(KAYNAK) as Modul
const GUN = 24 * 3600 * 1000
const SIMDI = Date.UTC(2026, 10, 14, 20, 0, 0)

let dizin = ''
beforeEach(() => {
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kod-dizini-tazelik-'))
})
afterEach(() => {
  fs.rmSync(dizin, { recursive: true, force: true })
})

const son = (tarih: number) => fs.writeFileSync(path.join(dizin, 'son.json'), JSON.stringify({ tarih }))

describe('INV-KOD-DIZINI-TAZELIK-1 · karar', () => {
  it('taze (2 gün) → sessiz ve başlatıcı çağrılmaz', () => {
    son(SIMDI - 2 * GUN)
    let n = 0
    expect(M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })).toBe('')
    expect(n).toBe(0)
  })

  it('bayat (5 gün) → satır yaşı söyler ve başlatıcı TAM BİR kez çağrılır', () => {
    son(SIMDI - 5 * GUN)
    let n = 0
    const satir = M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(1)
    expect(satir).toContain('5 gün bayat')
    expect(satir).toContain('arka planda başlatıldı')
    expect(fs.existsSync(path.join(dizin, 'kilit'))).toBe(true)
  })

  it('kayıt yok (ilk açılış) → bayat sayılır, başlatır, "yenileme kaydı yok" der', () => {
    let n = 0
    const satir = M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(1)
    expect(satir).toContain('yenileme kaydı yok')
  })

  it('kilit taze (başka pencere yeniliyor) → başlatmaz, "sürüyor" der', () => {
    son(SIMDI - 9 * GUN)
    expect(M.kilitAl(dizin, SIMDI)).toBe(true)
    let n = 0
    const satir = M.kancaKos({ dizin, simdi: SIMDI + 60_000, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(0)
    expect(satir).toContain('sürüyor')
  })

  it('kilit YARIM KALDI (süresi doldu) → kendiliğinden düşer, yenileme yeniden başlar', () => {
    son(SIMDI - 9 * GUN)
    M.kilitAl(dizin, SIMDI - M.KILIT_OMRU_MS - 60_000)
    let n = 0
    M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(1)
  })

  it('son deneme başarısız (6 saat içinde) → yeniden denemez, elle komutu söyler; süre dolunca dener', () => {
    son(SIMDI - 9 * GUN)
    M.bitir({ dizin, basari: false, simdi: SIMDI - 3600_000 })
    let n = 0
    const satir = M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(0)
    expect(satir).toContain('başarısız')
    expect(satir).toContain('kod-dizini-yenile.cjs')
    M.kancaKos({ dizin, simdi: SIMDI + M.HATA_BEKLEME_MS, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(1)
  })

  it('boş bellek az → başlatmaz, uyarır (BELLEK kuralı)', () => {
    son(SIMDI - 9 * GUN)
    let n = 0
    const satir = M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 900 })
    expect(n).toBe(0)
    expect(satir).toContain('bellek az')
  })

  it('başlatıcı hata verirse: açılış durmaz, kilit düşer, elle komut söylenir', () => {
    son(SIMDI - 9 * GUN)
    const satir = M.kancaKos({
      dizin,
      simdi: SIMDI,
      baslatici: () => {
        throw new Error('spawn EACCES')
      },
      bosBellekMB: 8000,
    })
    expect(satir).toContain('başlatılamadı')
    expect(fs.existsSync(path.join(dizin, 'kilit'))).toBe(false)
  })

  it('vana VENTHUB_KOD_DIZINI_TAZELIK_KAPAT=1 → sessiz, başlatmaz', () => {
    son(SIMDI - 9 * GUN)
    let n = 0
    expect(M.kancaKos({ dizin, simdi: SIMDI, env: { VENTHUB_KOD_DIZINI_TAZELIK_KAPAT: '1' }, baslatici: () => n++, bosBellekMB: 8000 })).toBe('')
    expect(n).toBe(0)
  })

  it('bitir: başarı yaşı sıfırlar, hata kaydını siler ve kilidi bırakır; arka plan dışı koşu kilide dokunmaz', () => {
    M.bitir({ dizin, basari: false, simdi: SIMDI - 1000 })
    M.kilitAl(dizin, SIMDI)
    M.bitir({ dizin, basari: true, simdi: SIMDI, kilidiBirak: false })
    expect(fs.existsSync(path.join(dizin, 'kilit'))).toBe(true)
    expect(M.karar({ dizin, simdi: SIMDI + 4 * GUN }).eylem).toBe('baslat') // yaş 4 gün; kilit damgası 4 gün eski = düşmüş
    M.bitir({ dizin, basari: true, simdi: SIMDI })
    expect(fs.existsSync(path.join(dizin, 'kilit'))).toBe(false)
    expect(fs.existsSync(path.join(dizin, 'hata.json'))).toBe(false)
    expect(M.karar({ dizin, simdi: SIMDI + GUN }).eylem).toBe('sessiz')
  })
})

describe('INV-KOD-DIZINI-TAZELIK-1 · eşzamanlı pencereler ve sabotaj', () => {
  it('10 pencere ARDIŞIK açılırsa başlatıcı TAM BİR kez çalışır (karar() taze kilidi görür; atomiklik aşağıdaki testlerde)', () => {
    son(SIMDI - 9 * GUN)
    let n = 0
    for (let i = 0; i < 10; i++) M.kancaKos({ dizin, simdi: SIMDI, baslatici: () => n++, bosBellekMB: 8000 })
    expect(n).toBe(1)
  })

  it('kilitAl: ikinci alış başarısız (karar() kilit bakışından BAĞIMSIZ, yarışın kapandığı yer)', () => {
    expect(M.kilitAl(dizin, SIMDI)).toBe(true)
    expect(M.kilitAl(dizin, SIMDI + 1000)).toBe(false)
  })

  it('SABOTAJ: kilit atomik değilse (wx → w) kilitAl ikinci pencereye de "aldım" der — yukarıdaki test bunu yakalar', () => {
    const kaynak = fs.readFileSync(KAYNAK, 'utf8')
    expect(kaynak).toContain("flag: 'wx'")
    const kopya = path.join(dizin, 'sabotajli.cjs')
    fs.writeFileSync(kopya, kaynak.replace("flag: 'wx'", "flag: 'w'"))
    const S = req(kopya) as Modul
    expect(S.kilitAl(dizin, SIMDI)).toBe(true)
    expect(S.kilitAl(dizin, SIMDI + 1000)).toBe(true)
  })

  it('GERÇEK YARIŞ: bayat kilide 8 süreç aynı anda saldırır, 5 turda her turda TAM BİR kazanan (denetçi bulgusu: eskiden 6/15 turda 2-3)', async () => {
    const { spawn } = req('node:child_process') as typeof import('node:child_process')
    const betik = `const m=require(${JSON.stringify(KAYNAK)});const t=Number(process.argv[1]);const d=process.argv[2];` +
      `const bekle=Number(process.argv[3])-Date.now();const x=Date.now()+Math.max(0,bekle);while(Date.now()<x){};` +
      `process.stdout.write(m.kilitAl(d,t)?'1':'0')`
    for (let tur = 0; tur < 5; tur++) {
      const d = path.join(dizin, `tur${tur}`)
      fs.mkdirSync(d, { recursive: true })
      const simdi = Date.now()
      fs.writeFileSync(path.join(d, 'kilit'), String(simdi - M.KILIT_OMRU_MS - 60_000)) // yarım kalmış, süresi dolmuş
      const baslangic = Date.now() + 1500 // hepsi aynı ana kadar meşgul bekler
      const sonuclar = await Promise.all(
        Array.from({ length: 8 }, () =>
          new Promise<string>((res) => {
            const p = spawn(process.execPath, ['-e', betik, String(simdi), d, String(baslangic)], { stdio: ['ignore', 'pipe', 'ignore'] })
            let o = ''
            p.stdout.on('data', (c) => (o += c))
            p.on('close', () => res(o))
          }),
        ),
      )
      expect(sonuclar.filter((s) => s === '1').length, `tur ${tur}: ${sonuclar.join('')}`).toBe(1)
    }
  }, 60_000)

  it('geleceğe taşan kayıtlar (saat ileri alınıp geri çekildi) geçersiz sayılır: günlerce susturmaz, kilit tutmaz', () => {
    const ileri = SIMDI + 30 * GUN
    fs.writeFileSync(path.join(dizin, 'son.json'), JSON.stringify({ tarih: ileri }))
    expect(M.karar({ dizin, simdi: SIMDI }).eylem).toBe('baslat') // son.json geçersiz → kayıt yok → bayat
    fs.writeFileSync(path.join(dizin, 'hata.json'), JSON.stringify({ tarih: ileri }))
    expect(M.karar({ dizin, simdi: SIMDI }).eylem).toBe('baslat') // hata kaydı da geçersiz → bekleme yok
    fs.writeFileSync(path.join(dizin, 'kilit'), String(ileri))
    expect(M.kilitAl(dizin, SIMDI)).toBe(true) // gelecekteki damga taze sayılmaz, devralınır
  })

  it('kaynak sözleşmesi: kanca kopuk-baslat kullanır, detached/zamanlayıcı yok, çıkış her koşulda 0', () => {
    const modul = fs.readFileSync(KAYNAK, 'utf8')
    const kanca = fs.readFileSync(path.resolve(process.cwd(), '.claude', 'hooks', 'kod-dizini-tazelik.cjs'), 'utf8')
    expect(modul).toContain('kopuk-baslat.cjs')
    for (const k of [modul, kanca]) {
      expect(k).not.toMatch(/detached\s*:/)
      expect(k).not.toMatch(/schtasks|setInterval|crontab|CurrentVersion\\\\Run/i)
    }
    expect(kanca).toMatch(/process\.exit\(0\)/)
    expect(kanca).not.toMatch(/process\.exit\(1\)/)
  })

  it('kanca gerçek süreç olarak koşar: çıkış 0 (vana açıkken sessiz, başlatma yok)', () => {
    const { spawnSync } = req('node:child_process') as typeof import('node:child_process')
    const r = spawnSync(process.execPath, [path.resolve(process.cwd(), '.claude', 'hooks', 'kod-dizini-tazelik.cjs')], {
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_KOD_DIZINI_TAZELIK_KAPAT: '1', VENTHUB_KOD_DIZINI_DURUM_DIZINI: dizin },
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })
})
