// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CANLI-YEDEK-1 · `scripts/hijyen/canli-db-yedek.cjs` (ALT-188): canlı DB gece yedeği.
 *
 * Betik GERÇEK süreç olarak koşar; pg_dump / pg_restore / psql yerine SAHTE bir node aracı konur (PG_DUMP_YOLU, PG_RESTORE_YOLU, PSQL_YOLU).
 * Canlıya bağlanılmaz; bağlantı dizesi ve parola uydurmadır. Ölçülen sözler: (1) sır argv'ye ve çıktıya girmez, (2) boş/şüpheli yedek dosya yazmaz,
 * (3) hedef ve anahtar depo içinde olamaz, anahtarsız başlanmaz, (4) al→dene→coz döngüsü, yanlış anahtarda dene düşer, (5) saklama: 14 gün, en az 3, doğrulanmamış tekte silmez.
 */
const require = createRequire(import.meta.url)
const BETIK = path.resolve(__dirname, '../canli-db-yedek.cjs')
const modul = require(BETIK) as {
  bosKapisi: (g: { tabloSayisi: number; bayt: number; oncekiBayt: number; tabloTabani: number; mutlakTaban: number }) => string[]
  semaKapisi: (canli: string[], dokum: string[]) => string[]
  saklamaPlani: (adlar: string[], simdi: Date, gun: number, enAz: number, oku: (ad: string) => { dogrulandi?: boolean } | null) => { tut: string[]; sil: string[] }
}

const PAROLA = 'UydurmaParola/9x'
const PAROLA_KODLU = 'UydurmaParola%2F9x'
// Şablon dizesi: CI "Secret guard" adımı düz yazılmış postgresql://kullanıcı:parola@ kalıbını arar (`${` içeren satırı atlar).
const URL_SIR = `postgresql://postgres.uydurmaref:${PAROLA_KODLU}@uydurma-havuz.example.test:5432/postgres`
const SIRLAR = [URL_SIR, PAROLA, PAROLA_KODLU, 'uydurma-havuz.example.test', 'postgres.uydurmaref']

const SAHTE = `
const fs = require('node:fs')
const a = process.argv.slice(2)
const log = process.env.FAKE_LOG
if (log) fs.appendFileSync(log, JSON.stringify({ argv: a, pgpass: process.env.PGPASSWORD || null, pghost: process.env.PGHOST || null, url: process.env.SUPABASE_DB_URL || null }) + '\\n')
if (a.includes('--version')) { console.log('pg_dump (PostgreSQL) 17.4 SAHTE'); process.exit(0) }
if (a.includes('-c')) { console.log((process.env.FAKE_CANLI_SEMALAR || 'public,auth,storage,extensions,vault').split(',').join('\\n')); process.exit(0) }
const dosyaArg = a.find((x) => x.startsWith('--file='))
if (dosyaArg) {
  if (process.env.FAKE_MODU === 'hata') { console.error('connection to server at ' + process.env.PGHOST + ' failed for ' + process.env.FAKE_SIZINTI); process.exit(1) }
  const n = Number(process.env.FAKE_TABLO || 60)
  const sat = ['PGDMP']
  for (const s of (process.env.FAKE_DOKUM_SEMALAR || 'public,auth,storage').split(',')) sat.push('S:' + s)
  for (let i = 0; i < n; i++) sat.push('T:public.tablo_' + String(i).padStart(3, '0'))
  sat.push('x'.repeat(Number(process.env.FAKE_BAYT || 600000)))
  fs.writeFileSync(dosyaArg.slice(7), sat.join('\\n'))
  process.exit(0)
}
const li = a.indexOf('--list')
if (li >= 0) {
  const ic = fs.readFileSync(a[li + 1], 'latin1').split('\\n')
  let i = 1
  for (const s of ic) {
    if (s.startsWith('S:')) console.log(i++ + '; 2615 1 SCHEMA - ' + s.slice(2) + ' postgres')
    if (s.startsWith('T:')) { const [sc, t] = s.slice(2).split('.'); console.log(i++ + '; 0 1 TABLE DATA ' + sc + ' ' + t + ' postgres') }
  }
  process.exit(0)
}
process.exit(9)
`

let taban = ''
let sahte = ''
let sayac = 0

interface Kosu {
  durum: number | null
  cikti: string
  hata: string
  hedef: string
  log: string
}

function kos(komut: string[], ek: Record<string, string> = {}, oz: { hedef?: string; anahtar?: string } = {}): Kosu {
  sayac += 1
  const hedef = oz.hedef ?? path.join(taban, 'hedef')
  const log = path.join(taban, `arac-${sayac}.log`)
  const temel: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(SUPABASE|PG|CANLI_YEDEK|FAKE_)/.test(k)) temel[k] = v
  const env: Record<string, string> = {
    ...temel,
    HOME: taban,
    USERPROFILE: taban,
    CANLI_YEDEK_DIZIN: hedef,
    CANLI_YEDEK_ANAHTAR: oz.anahtar ?? path.join(taban, 'anahtar', 'k.key'),
    PG_DUMP_YOLU: sahte,
    PG_RESTORE_YOLU: sahte,
    PSQL_YOLU: sahte,
    SUPABASE_DB_URL: URL_SIR,
    FAKE_SIZINTI: URL_SIR,
    FAKE_LOG: log,
    ...ek,
  }
  const r = spawnSync(process.execPath, [BETIK, ...komut], { encoding: 'utf8', env, timeout: 60000 })
  return { durum: r.status, cikti: r.stdout ?? '', hata: r.stderr ?? '', hedef, log }
}

const vhencler = (d: string): string[] => (fs.existsSync(d) ? fs.readdirSync(d).filter((a) => a.endsWith('.vhenc')) : [])

beforeAll(() => {
  taban = fs.mkdtempSync(path.join(os.tmpdir(), 'canli-yedek-test-'))
  sahte = path.join(taban, 'sahte-pg.cjs')
  fs.writeFileSync(sahte, SAHTE)
  expect(kos(['anahtar-uret']).durum).toBe(0)
})
afterAll(() => {
  fs.rmSync(taban, { recursive: true, force: true })
  fs.rmSync(path.join(__dirname, 'yedek-hedef-depo-ici'), { recursive: true, force: true }) // kapı bozulursa depoya yazılan artığı süpür
})

describe('INV-CANLI-YEDEK-1 anahtar', () => {
  it('anahtar-uret yolu basar, içeriği ASLA basmaz; var olanın üzerine yazmaz', () => {
    const f = path.join(taban, 'anahtar', 'k.key')
    const icerik = fs.readFileSync(f, 'utf8').trim()
    expect(Buffer.from(icerik, 'base64')).toHaveLength(32)
    const yeni = kos(['anahtar-uret'], {}, { anahtar: path.join(taban, 'anahtar2', 'k.key') })
    expect(yeni.durum).toBe(0)
    expect(yeni.cikti).toContain(path.join(taban, 'anahtar2', 'k.key'))
    expect(yeni.cikti + yeni.hata).not.toContain(fs.readFileSync(path.join(taban, 'anahtar2', 'k.key'), 'utf8').trim())
    const tekrar = kos(['anahtar-uret'])
    expect(tekrar.durum).toBe(1)
    expect(tekrar.hata).toMatch(/üzerine yazılmaz/)
    expect(fs.readFileSync(f, 'utf8').trim()).toBe(icerik)
  })

  it('anahtar yoksa al REDDEDİLİR ve pg_dump hiç çalışmaz', () => {
    const r = kos(['al'], {}, { anahtar: path.join(taban, 'yok', 'k.key'), hedef: path.join(taban, 'hedef-anahtarsiz') })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/şifre anahtarı yok/)
    expect(fs.existsSync(r.log)).toBe(false)
  })

  it('anahtar yedek dizininin içindeyse al reddedilir', () => {
    const hedef = path.join(taban, 'hedef-icinde')
    const anahtar = path.join(hedef, 'k.key')
    fs.mkdirSync(hedef, { recursive: true })
    fs.writeFileSync(anahtar, Buffer.alloc(32, 7).toString('base64'))
    const r = kos(['al'], {}, { anahtar, hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/yedek dizininin içinde olamaz/)
    expect(vhencler(hedef)).toHaveLength(0)
  })

  it('anahtar bir git deposunun içindeyse reddedilir', () => {
    const r = kos(['anahtar-uret'], {}, { anahtar: path.join(__dirname, 'k-depo-ici.key') })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/git deposunun içinde/)
    expect(fs.existsSync(path.join(__dirname, 'k-depo-ici.key'))).toBe(false)
  })
})

describe('INV-CANLI-YEDEK-1 hedef dizin', () => {
  it('depo içindeki hedef reddedilir ve OLUŞTURULMAZ', () => {
    const hedef = path.join(__dirname, 'yedek-hedef-depo-ici')
    const r = kos(['al'], {}, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/git deposunun içinde/)
    expect(fs.existsSync(hedef)).toBe(false)
    expect(fs.existsSync(r.log)).toBe(false)
  })
})

describe('INV-CANLI-YEDEK-1 al → dene → coz', () => {
  it('tam döngü: şifreli tek dosya + manifest; açık döküm yedek dizininde YOK; dene tutar; coz özdeş dökümü verir', () => {
    const hedef = path.join(taban, 'hedef-dongu')
    const al = kos(['al'], {}, { hedef })
    expect(al.durum).toBe(0)
    expect(al.cikti).toMatch(/YEDEK TAMAM/)
    const v = vhencler(hedef)
    expect(v).toHaveLength(1)
    expect(fs.readdirSync(hedef).sort()).toEqual([v[0], v[0].replace('.vhenc', '.manifest.json')].sort())
    const sifreli = fs.readFileSync(path.join(hedef, v[0]))
    expect(sifreli.subarray(0, 6).toString()).toBe('VHENC1')
    expect(sifreli.includes(Buffer.from('PGDMP'))).toBe(false) // gövde şifreli: açık başlık görünmez
    const manifest = JSON.parse(fs.readFileSync(path.join(hedef, v[0].replace('.vhenc', '.manifest.json')), 'utf8')) as Record<string, unknown>
    expect(manifest.dogrulandi).toBe(true)
    expect(manifest.tablo_veri_sayisi).toBe(60)
    expect(JSON.stringify(manifest)).not.toMatch(/uydurma|parola/i) // manifest sır/PII taşımaz
    const dene = kos(['dene'], {}, { hedef })
    expect(dene.durum).toBe(0)
    expect(dene.cikti).toMatch(/DENEME TAMAM/)
    const cozHedef = path.join(taban, 'cozulen')
    const coz = kos(['coz', path.join(hedef, v[0]), cozHedef], {}, { hedef })
    expect(coz.durum).toBe(0)
    const duz = fs.readFileSync(path.join(cozHedef, 'dokum.dump'))
    expect(duz.subarray(0, 5).toString()).toBe('PGDMP')
    expect(duz).toHaveLength(manifest.acik_bayt as number)
  })

  it('coz hedefsiz çağrılınca depo dışı özel geçici klasöre açar ve yolunu basar', () => {
    const hedef = path.join(taban, 'hedef-dongu')
    const dosya = path.join(hedef, vhencler(hedef)[0])
    const coz = kos(['coz', dosya], {}, { hedef })
    expect(coz.durum).toBe(0)
    const yol = /→ (.+dokum\.dump)/.exec(coz.cikti)?.[1]
    expect(yol).toBeTruthy()
    expect(fs.existsSync(yol as string)).toBe(true)
    expect(path.resolve(yol as string).startsWith(path.resolve(os.tmpdir()))).toBe(true)
    fs.rmSync(path.dirname(yol as string), { recursive: true, force: true })
  })

  it('YANLIŞ anahtarla dene başarısız olur', () => {
    const hedef = path.join(taban, 'hedef-dongu')
    const yanlis = path.join(taban, 'yanlis', 'k.key')
    expect(kos(['anahtar-uret'], {}, { anahtar: yanlis }).durum).toBe(0)
    const r = kos(['dene'], {}, { hedef, anahtar: yanlis })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/şifre çözülemedi|tutmuyor/)
  })

  it('dosya bayt değiştirilirse dene (sha256) başarısız olur', () => {
    const hedef = path.join(taban, 'hedef-bozuk')
    expect(kos(['al'], {}, { hedef }).durum).toBe(0)
    const f = path.join(hedef, vhencler(hedef)[0])
    const b = fs.readFileSync(f)
    b[b.length - 1] ^= 0xff
    fs.writeFileSync(f, b)
    const r = kos(['dene'], {}, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/sha256/)
  })
})

describe('INV-CANLI-YEDEK-1 sır sızıntısı', () => {
  it('başarılı koşuda bağlantı dizesi parçaları ne argv ne çıktıda geçer; PG* ortamı ile verilir; SUPABASE_DB_URL çocuğa geçmez', () => {
    const hedef = path.join(taban, 'hedef-sir')
    const r = kos(['al'], {}, { hedef })
    expect(r.durum).toBe(0)
    for (const s of SIRLAR) expect(r.cikti + r.hata).not.toContain(s)
    const kayitlar = fs
      .readFileSync(r.log, 'utf8')
      .trim()
      .split('\n')
      .map((s) => JSON.parse(s) as { argv: string[]; pgpass: string | null; pghost: string | null; url: string | null })
    expect(kayitlar.length).toBeGreaterThanOrEqual(3)
    for (const k of kayitlar) {
      for (const s of SIRLAR) expect(k.argv.join(' ')).not.toContain(s)
      expect(k.url).toBeNull()
    }
    const dokum = kayitlar.find((k) => k.argv.some((x) => x.startsWith('--file=')))
    expect(dokum?.pgpass).toBe(PAROLA)
    expect(dokum?.pghost).toBe('uydurma-havuz.example.test')
  })

  it('pg_dump hata mesajına bağlantı dizesini yazsa bile betiğin hatası SIRSIZ ve dosya yazılmaz', () => {
    const hedef = path.join(taban, 'hedef-sir-hata')
    const r = kos(['al'], { FAKE_MODU: 'hata' }, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/HATA:/)
    for (const s of SIRLAR) expect(r.cikti + r.hata).not.toContain(s)
    expect(vhencler(hedef)).toHaveLength(0)
    expect(fs.readdirSync(hedef)).toHaveLength(0) // yarım .yazim dosyası da kalmaz
  })

  it('bozuk bağlantı dizesi değeri göstermeden reddedilir', () => {
    const r = kos(['al'], { SUPABASE_DB_URL: 'bu-bir-url-degil-Gizli123' }, { hedef: path.join(taban, 'hedef-bozuk-url') })
    expect(r.durum).toBe(1)
    expect(r.cikti + r.hata).not.toContain('Gizli123')
  })
})

describe('INV-CANLI-YEDEK-1 boş yedeği reddet', () => {
  it('TABLE DATA sayısı tabanın altındaysa çıkış 1, dosya yazılmaz', () => {
    const hedef = path.join(taban, 'hedef-bos')
    const r = kos(['al'], { FAKE_TABLO: '3' }, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/BOŞ\/ŞÜPHELİ YEDEK REDDEDİLDİ/)
    expect(fs.readdirSync(hedef)).toHaveLength(0)
  })

  it('mutlak bayt tabanının altındaki döküm reddedilir', () => {
    const hedef = path.join(taban, 'hedef-kucuk')
    const r = kos(['al'], { FAKE_BAYT: '1000' }, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/mutlak taban/)
    expect(fs.readdirSync(hedef)).toHaveLength(0)
  })

  it('önceki yedeğin yarısından küçük döküm reddedilir; ilk yedekte yalnız mutlak taban', () => {
    const hedef = path.join(taban, 'hedef-yari')
    expect(kos(['al'], { FAKE_BAYT: '2000000' }, { hedef }).durum).toBe(0)
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1100) // dosya adı saniye damgalı: aynı saniyede ikinci koşu ayrı bir (doğru) ret sebebidir
    const r = kos(['al'], { FAKE_BAYT: '800000' }, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/önceki yedeğin yarısı/)
    expect(vhencler(hedef)).toHaveLength(1)
  })

  it('bosKapisi saf: eşit sınırlar kabul, altı ret', () => {
    const g = { tabloSayisi: 50, bayt: 1000, oncekiBayt: 2000, tabloTabani: 50, mutlakTaban: 1000 }
    expect(modul.bosKapisi(g)).toEqual([])
    expect(modul.bosKapisi({ ...g, tabloSayisi: 49 })).toHaveLength(1)
    expect(modul.bosKapisi({ ...g, bayt: 999 }).length).toBeGreaterThanOrEqual(1)
    expect(modul.bosKapisi({ ...g, oncekiBayt: 0, bayt: 1000 })).toEqual([])
  })
})

describe('INV-CANLI-YEDEK-1 şema kapısı', () => {
  it('canlıda olup dökümde ve dışlama listesinde olmayan şema kırmızı verir, dosya yazılmaz', () => {
    const hedef = path.join(taban, 'hedef-sema')
    const r = kos(['al'], { FAKE_CANLI_SEMALAR: 'public,auth,storage,hayalet_sema,vault' }, { hedef })
    expect(r.durum).toBe(1)
    expect(r.hata).toMatch(/AÇIKLANMAMIŞ ŞEMA.*hayalet_sema/)
    expect(fs.readdirSync(hedef)).toHaveLength(0)
  })

  it('psql bulunamazsa ÖLÇÜLEMEDİ (çıkış 3), yeşil sayılmaz', () => {
    const hedef = path.join(taban, 'hedef-psqlyok')
    const r = kos(['al'], { PSQL_YOLU: path.join(taban, 'yok-psql') }, { hedef })
    expect(r.durum).toBe(3)
    expect(r.hata).toMatch(/ölçülemedi/)
    expect(fs.readdirSync(hedef)).toHaveLength(0)
  })

  it('semaKapisi saf: dışlananlar sorun değil', () => {
    expect(modul.semaKapisi(['public', 'vault', 'cron', 'yeni'], ['public'])).toEqual(['yeni'])
  })
})

describe('INV-CANLI-YEDEK-1 saklama (14 gün, en az 3, doğrulanmış koruma)', () => {
  const ad = (g: number): string => `yedek-202611${String(g).padStart(2, '0')}T020000Z.vhenc`
  const SIMDI = new Date(Date.UTC(2026, 10, 15, 3, 0, 0))
  const dogrulanmis = (): { dogrulandi: boolean } => ({ dogrulandi: true })

  it('14 günden eskiyi siler, yenileri tutar', () => {
    const adlar = [ad(1), ad(2), ad(3), ad(4), ad(5), ad(10), ad(11), ad(12), ad(13), ad(14), ad(15)]
    const p = modul.saklamaPlani(adlar, SIMDI, 14, 3, dogrulanmis)
    expect(p.sil.sort()).toEqual([ad(1)]) // 15 Kasım 03:00 − 14 gün = 1 Kasım 03:00 → 1 Kasım 02:00 eski
    expect(p.tut).toContain(ad(2))
  })

  it('hepsi eski olsa bile EN AZ 3 yedek kalır', () => {
    const adlar = [ad(1), ad(2), ad(3), ad(4), ad(5)]
    const p = modul.saklamaPlani(adlar, new Date(Date.UTC(2026, 11, 30)), 14, 3, dogrulanmis)
    expect(p.tut.sort()).toEqual([ad(3), ad(4), ad(5)])
    expect(p.sil.sort()).toEqual([ad(1), ad(2)])
  })

  it('doğrulanmış yedek yoksa HİÇBİRİ silinmez; tutulanlar arasında doğrulanmış yoksa en yenisi eklenir', () => {
    const adlar = [ad(1), ad(2), ad(3), ad(4), ad(5)]
    const yok = modul.saklamaPlani(adlar, new Date(Date.UTC(2026, 11, 30)), 14, 3, () => ({ dogrulandi: false }))
    expect(yok.sil).toEqual([])
    const yalnizEski = modul.saklamaPlani(adlar, new Date(Date.UTC(2026, 11, 30)), 14, 3, (a) => (a === ad(1) ? { dogrulandi: true } : { dogrulandi: false }))
    expect(yalnizEski.tut).toContain(ad(1))
    expect(yalnizEski.sil).not.toContain(ad(1))
  })

  it('temizle yalnız desene uyan yedek-*.vhenc + eş manifesti siler, kuru koşuda silmez, başka dosyaya dokunmaz', () => {
    const hedef = path.join(taban, 'hedef-saklama')
    fs.mkdirSync(hedef, { recursive: true })
    const adlar = [ad(1), ad(2), ad(3), ad(10), ad(11), ad(14)]
    for (const a of adlar) {
      fs.writeFileSync(path.join(hedef, a), 'x')
      fs.writeFileSync(path.join(hedef, a.replace('.vhenc', '.manifest.json')), JSON.stringify({ dogrulandi: true }))
    }
    fs.writeFileSync(path.join(hedef, 'notlar.txt'), 'dokunma')
    fs.writeFileSync(path.join(hedef, 'yedek-eski.vhenc'), 'dokunma')
    const ek = { CANLI_YEDEK_SIMDI: '2026-12-30T00:00:00Z' }
    const kuru = kos(['temizle', '--kuru'], ek, { hedef })
    expect(kuru.durum).toBe(0)
    expect(kuru.cikti).toMatch(/KURU KOŞU/)
    expect(fs.readdirSync(hedef)).toHaveLength(2 * adlar.length + 2)
    const gercek = kos(['temizle'], ek, { hedef })
    expect(gercek.durum).toBe(0)
    expect(gercek.cikti).toContain(`SİLİNECEK: ${ad(1)}`)
    expect(vhencler(hedef).sort()).toEqual(['yedek-eski.vhenc', ad(10), ad(11), ad(14)].sort())
    expect(fs.existsSync(path.join(hedef, 'notlar.txt'))).toBe(true)
    expect(fs.existsSync(path.join(hedef, ad(1).replace('.vhenc', '.manifest.json')))).toBe(false)
  })
})
