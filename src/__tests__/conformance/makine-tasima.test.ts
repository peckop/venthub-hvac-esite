// @vitest-environment node
//
// Kapı saf Node'dur (dosya sistemi, alt süreç, git); DOM ortamı yalnız maliyettir.
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-TASIMA-1 · Makine taşıma araçları (scripts/tasima/*) — ALT-165.
 * Cetvel: docs/standards/makine-tasima-standard.md
 *
 * NİÇİN VAR: taşıma günü "yeni makinede ayarlar eski kullanıcı yolunu gösteriyor", "paket bir bayt bozuk ama kimse
 * görmedi", "sır düz diske yazıldı", "tar açılırken kökün dışına yazdı" gibi sessiz arızalar tam o gün, geri dönüşü
 * olmayan bir anda ortaya çıkar. Bu dosya o arızaların her biri için KIRMIZI VEREN bir kol taşır (SABOTAJ etiketli
 * kollar kapının gerçekten kırmızı verdiğini kanıtlar: yeşil gören kapı, kırmızı gördüğünü ispatlamadıkça kanıt değildir).
 *
 * Fikstürlerde kullanıcı kimliği yoktur: yollar parçalardan birleştirilir (INV-MUTLAK-YOL-1 gerçek yol sızdırmasın).
 * gpg parolası ile ilgili hiçbir kol yoktur: araç parolayı görmez; burada yalnız komut satırının parola taşımadığı ölçülür.
 */

vi.setConfig({ testTimeout: 180_000, hookTimeout: 60_000 })

const require_ = createRequire(import.meta.url)
const REPO = path.resolve(path.dirname(require_.resolve('../../../package.json')))
const TASIMA = path.join(REPO, 'scripts', 'tasima')

interface Esleme {
  eski: string
  yeni: string
}
interface Bicimler {
  ham: string
  kacisli: string
  duz: string
  msys: string
  slug: string
}
interface TarGirdisi {
  ad: string
  bayt: number
}
interface TarHedefi {
  yaz(b: Buffer): void
  bitir(): void
}
interface TarYaziciT {
  dosyadan(ad: string, yol: string, o?: { mod?: number }): { bayt: number; sha256: string }
  bellekten(ad: string, icerik: Buffer): { bayt: number; sha256: string }
  bitir(): void
}
interface Parca {
  ad: string
  dosya: string
  bayt: number
  sha256: string
}
interface Icindekiler {
  surum: number
  damga: string
  kokler: { ev: string; tmp: string; appdata: string; depo: string }
  parcalar: Parca[]
  dosyalar: { parca: string; yol: string; bayt: number; sha256: string }[]
  git?: { ad: string; var: boolean; ahead: number; stash: unknown[]; uzak: string | null; bundle: { dosya: string; sha256: string } | null }[]
}
interface Cekirdek {
  projeKlasorAdi(y: string): string
  yolBicimleri(y: string): Bicimler
  yoluYenidenYaz(m: string, e: Esleme[], o?: { turler?: string[] }): { metin: string; degisiklik: number }
  eskiYolSay(m: string, yollar: string[]): number
  jsonGuvenliYenidenYaz(m: string, e: Esleme[]): { metin: string; degisiklik: number }
  yenidenYazimDogrula(m: string, yollar: string[], o?: { json?: boolean }): string[]
  projeKlasorunuYenidenAdlandir(a: string, e: Esleme[]): string
  TarYazici: new (yaz: (b: Buffer) => void) => TarYaziciT
  tarOku(k: unknown, y: (g: TarGirdisi) => TarHedefi | null): number
  dosyaYazici(yol: string): { yaz(b: Buffer): void; kapat(): { bayt: number; sha256: string }; iptal(): void }
  dosyaKaynagi(fd: number): unknown
  bellekKaynagi(b: Buffer): unknown
  guvenliGoreliYol(a: string): string[]
  hedefYolu(m: string, k: Record<string, string>): string
  sha256Dosya(y: string): string
  icindekilerBicimHatalari(ic: unknown): string[]
  parcalariDogrula(ic: Icindekiler, kok: string, o?: { sha?: boolean }): string[]
  gpgSifrelemeArgumanlari(): string[]
  gpgCozmeArgumanlari(): string[]
  openpgpSimetrikOzet(b: Buffer): { sifreli: boolean; aes256: boolean }
  argumanlariAyir(
    a: string[],
    s: { bayrak?: string[]; deger?: string[]; coklu?: string[] },
  ): { bayrak: Record<string, boolean>; deger: Record<string, string>; coklu: Record<string, string[]>; kalan: string[] }
  hedefHatasi(h: string | null): string | null
}
interface Sayimlar {
  kanban: { pano: number; kart: number; olay: number | null; bozukPayload: number; butunluk: string } | null
  sage: { kayit: number; aktif: number | null } | null
  posta: { kutuSayisi: number; toplamKayit: number; okunamayan: string[] }
  hafizaMd: number
  hafizaKlasorSayisi: number
  kancalar: { kanca: number; betik: number; eksik: string[] }
  ayarEskiYol: { toplam: number; dosyalar: Record<string, number> } | null
}
interface Olcum {
  sayimlar: Sayimlar
  araclar: Record<string, string | null>
}
interface Sqlite {
  DatabaseSync: new (
    yol: string,
    o?: { readOnly?: boolean },
  ) => { exec(s: string): void; prepare(s: string): { run(...a: unknown[]): unknown; get(...a: unknown[]): unknown }; close(): void }
}
interface Dogrula {
  karsilastir(e: Olcum, y: Olcum, o?: { siki?: boolean }): { farklar: string[]; uyarilar: string[] }
  kancaKomutlari(s: unknown): string[]
  betikAdaylari(k: string, ev: string, depo: string): string[]
}

const C = require_('../../../scripts/tasima/cekirdek.cjs') as Cekirdek
const D = require_('../../../scripts/tasima/dogrula.cjs') as Dogrula

/** Kimlik içermeyen sahte yollar (parçalardan birleştirilir). */
const win = (...p: string[]): string => p.join('\\')
const ESKI = win('D:', 'eskiev', 'ali')
const YENI = win('E:', 'yeniev', 'veli')

const gecici: string[] = []
function yeniDizin(onek = 'vh-tasima-'): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), onek))
  gecici.push(d)
  return d
}
afterEach(() => {
  while (gecici.length) fs.rmSync(gecici.pop() as string, { recursive: true, force: true })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · yol dönüşümü (eski ev -> yeni ev)', () => {
  const esleme: Esleme[] = [{ eski: ESKI, yeni: YENI }]

  it('bir yolun beş yazılışı doğru üretilir (ham, JSON kaçışlı, düz bölü, MSYS, proje klasör adı)', () => {
    expect(C.yolBicimleri(ESKI)).toEqual({
      ham: 'D:\\eskiev\\ali',
      kacisli: 'D:\\\\eskiev\\\\ali',
      duz: 'D:/eskiev/ali',
      msys: '/d/eskiev/ali',
      slug: 'D--eskiev-ali',
    })
    // Claude Code proje klasör adı: harf/rakam dışı her karakter '-' olur (".claude" -> "-claude" -> "--claude" yoldan)
    expect(C.projeKlasorAdi(win('C:', 'a', '.claude', 'projects'))).toBe('C--a--claude-projects')
  })

  it('JSON dosyasında dört yazılışın HEPSİ yenilenir, JSON geçerli kalır, eski yol 0', () => {
    const b = C.yolBicimleri(ESKI)
    const nesne = {
      env: { KOK: b.ham },
      izin: [`Read(${b.duz}/**)`, `Read(/${b.msys}/**)`],
      projeler: { [`${b.duz}/venthub-hvac`]: { acik: true } },
      komut: `node "${b.ham}\\betik.cjs"`,
    }
    const metin = JSON.stringify(nesne, null, 2)
    expect(metin).toContain(b.kacisli) // kaçışlı biçim gerçekten metinde (aksi hâlde kol boşa koşar)
    const r = C.jsonGuvenliYenidenYaz(metin, esleme)
    const y = C.yolBicimleri(YENI)
    const sonra = JSON.parse(r.metin) as typeof nesne
    expect(sonra.env.KOK).toBe(y.ham)
    expect(sonra.izin[0]).toBe(`Read(${y.duz}/**)`)
    expect(sonra.izin[1]).toBe(`Read(/${y.msys}/**)`)
    expect(Object.keys(sonra.projeler)[0]).toBe(`${y.duz}/venthub-hvac`)
    expect(sonra.komut).toBe(`node "${y.ham}\\betik.cjs"`)
    expect(r.degisiklik).toBe(5)
    expect(C.eskiYolSay(r.metin, [ESKI])).toBe(0)
    expect(C.yenidenYazimDogrula(r.metin, [ESKI], { json: true })).toEqual([])
  })

  it('SABOTAJ — yalnız düz yazılışı değiştiren naif dönüşüm "eski yol kaldı" kırmızısı verir', () => {
    const b = C.yolBicimleri(ESKI)
    const y = C.yolBicimleri(YENI)
    const metin = JSON.stringify({ a: b.ham, b: b.duz })
    const naif = metin.split(b.ham).join(y.ham) // JSON'daki kaçışlı yazılışı göremez
    const hatalar = C.yenidenYazimDogrula(naif, [ESKI], { json: true })
    expect(hatalar.join(' ')).toMatch(/eski yol kaldı/)
  })

  it('SABOTAJ — kaçışsız yeni yolu kaçışlı yuvaya koyan dönüşüm JSON\'u bozar ve yakalanır', () => {
    const b = C.yolBicimleri(ESKI)
    const y = C.yolBicimleri(YENI)
    const metin = JSON.stringify({ a: b.ham })
    const bozuk = metin.split(b.kacisli).join(y.ham) // E:\yeniev\veli -> JSON'da geçersiz kaçış
    const hatalar = C.yenidenYazimDogrula(bozuk, [ESKI], { json: true })
    expect(hatalar.join(' ')).toMatch(/JSON okunamıyor/)
  })

  it('jsonGuvenliYenidenYaz: JSON olmayan girdiyi REDDEDER (yazma yok)', () => {
    expect(() => C.jsonGuvenliYenidenYaz(`{ "a": ${ESKI} `, esleme)).toThrow(/JSON değil/)
  })

  it('ad sınırı: ESKI-yedek, ESKI2 ve harf-bitişik yollar DEĞİŞMEZ; ESKI\\alt DEĞİŞİR; sürücü harfi büyük/küçük aynı yol', () => {
    const b = C.yolBicimleri(ESKI)
    const metin = [`${b.ham}-yedek`, `${b.ham}2\\x`, `${b.duz}.eski/x`, `X${b.ham}`, `${b.ham}\\alt`, `${b.ham.toLowerCase()}\\kucuk`].join('\n')
    const y = C.yolBicimleri(YENI)
    const r = C.yoluYenidenYaz(metin, esleme).metin.split('\n')
    expect(r[0]).toBe(`${b.ham}-yedek`)
    expect(r[1]).toBe(`${b.ham}2\\x`)
    expect(r[2]).toBe(`${b.duz}.eski/x`)
    expect(r[3]).toBe(`X${b.ham}`)
    expect(r[4]).toBe(`${y.ham}\\alt`)
    expect(r[5]).toBe(`${y.ham}\\kucuk`)
  })

  it('TEK GEÇİŞ: bir eşlemenin çıktısı ikinci eşlemeyle yeniden dönüşmez; "$&" içeren yeni yol düz metin kalır', () => {
    const A = win('D:', 'a')
    const B = win('D:', 'b')
    const Cc = win('D:', 'c')
    const r = C.yoluYenidenYaz(`${A}\\x`, [{ eski: A, yeni: B }, { eski: B, yeni: Cc }])
    expect(r.metin).toBe(`${B}\\x`)
    const dolar = win('D:', 'para$&yeni')
    expect(C.yoluYenidenYaz(`${A}\\x`, [{ eski: A, yeni: dolar }]).metin).toBe(`${dolar}\\x`)
  })

  it('en uzun eski yol önce: iç içe iki eşleme doğru çözülür', () => {
    const ev = win('D:', 'ev')
    const depo = win('D:', 'ev', 'depo')
    const r = C.yoluYenidenYaz(`${depo}\\x ${ev}\\y`, [
      { eski: ev, yeni: win('E:', 'yeniev') },
      { eski: depo, yeni: win('E:', 'baska', 'depo') },
    ])
    expect(r.metin).toBe(`${win('E:', 'baska', 'depo')}\\x ${win('E:', 'yeniev')}\\y`)
  })

  it('proje klasör adı: iç içe iki geçiş, küçük harfli sürücü, ilgisiz ad değişmez', () => {
    const e = C.yolBicimleri(ESKI).slug // D--eskiev-ali
    const y = C.yolBicimleri(YENI).slug // E--yeniev-veli
    const esl: Esleme[] = [{ eski: ESKI, yeni: YENI }]
    expect(C.projeKlasorunuYenidenAdlandir(`${e}-venthub-hvac`, esl)).toBe(`${y}-venthub-hvac`)
    expect(C.projeKlasorunuYenidenAdlandir(`${e}-Temp-claude-${e}-venthub-hvac--claude-worktrees-x`, esl)).toBe(`${y}-Temp-claude-${y}-venthub-hvac--claude-worktrees-x`)
    expect(C.projeKlasorunuYenidenAdlandir(`${e.toLowerCase()}-venthub-hvac`, esl)).toBe(`${y}-venthub-hvac`)
    expect(C.projeKlasorunuYenidenAdlandir(`${e}2-baska`, esl)).toBe(`${e}2-baska`)
  })

  it('SABOTAJ — yanlış proje klasör dönüşümü (yalnız ilk geçiş) iç içe adda eski slug bırakır ve sayımla yakalanır', () => {
    const e = C.yolBicimleri(ESKI).slug
    const y = C.yolBicimleri(YENI).slug
    const ad = `${e}-Temp-claude-${e}-venthub-hvac`
    const yarim = ad.replace(e, y) // yalnız ilk geçiş
    expect(C.eskiYolSay(yarim, [ESKI])).toBeGreaterThan(0)
    expect(C.eskiYolSay(C.projeKlasorunuYenidenAdlandir(ad, [{ eski: ESKI, yeni: YENI }]), [ESKI])).toBe(0)
  })

  it('kök yol eşlenemez: yalnız sürücü kökü reddedilir', () => {
    expect(() => C.yolBicimleri('D:\\')).toThrow(/kök yol/)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · arşiv (tar) — gidiş dönüş, bozulma, kök dışına yazma', () => {
  function arsivYaz(d: string, dosyalar: { ad: string; kaynak: string }[]): string {
    const out = path.join(d, 'a.tar')
    const w = C.dosyaYazici(out)
    const t = new C.TarYazici((b) => w.yaz(b))
    for (const f of dosyalar) t.dosyadan(f.ad, f.kaynak)
    t.bellekten('ev/bellek.txt', Buffer.from('merhaba'))
    t.bitir()
    w.kapat()
    return out
  }
  function arsivOku(yol: string): Map<string, { bayt: number; sha256: string }> {
    const fd = fs.openSync(yol, 'r')
    const sonuc = new Map<string, { bayt: number; sha256: string }>()
    try {
      C.tarOku(C.dosyaKaynagi(fd), (g) => {
        const h = crypto.createHash('sha256')
        return {
          yaz: (b) => {
            h.update(b)
          },
          bitir: () => {
            sonuc.set(g.ad, { bayt: g.bayt, sha256: h.digest('hex') })
          },
        }
      })
    } finally {
      fs.closeSync(fd)
    }
    return sonuc
  }
  function hazir(): { d: string; dosyalar: { ad: string; kaynak: string; sha: string; bayt: number }[] } {
    const d = yeniDizin()
    const buyuk = path.join(d, 'buyuk.bin')
    fs.writeFileSync(buyuk, crypto.randomBytes(2_600_000))
    const bos = path.join(d, 'bos.txt')
    fs.writeFileSync(bos, '')
    const kucuk = path.join(d, 'k.txt')
    fs.writeFileSync(kucuk, 'a'.repeat(511))
    const uzunAd = `ev/${'x'.repeat(45)}/${'y'.repeat(45)}/${'z'.repeat(45)}/dosya.bin`
    const girdi = [
      { ad: 'ev/büyük çalışma/ğüşiöç.bin', kaynak: buyuk },
      { ad: uzunAd, kaynak: kucuk },
      { ad: 'ev/bos.txt', kaynak: bos },
    ]
    return { d, dosyalar: girdi.map((g) => ({ ...g, sha: C.sha256Dosya(g.kaynak), bayt: fs.statSync(g.kaynak).size })) }
  }

  it('gidiş dönüş: Türkçe ad, 100 karakterden uzun yol, boş dosya, 2,6 MB, bellek içeriği — bayt ve sha256 aynı', () => {
    const { d, dosyalar } = hazir()
    const out = arsivYaz(d, dosyalar)
    const oku = arsivOku(out)
    expect(oku.size).toBe(dosyalar.length + 1)
    for (const f of dosyalar) expect(oku.get(f.ad)).toEqual({ bayt: f.bayt, sha256: f.sha })
    expect(oku.get('ev/bellek.txt')?.bayt).toBe(7)
  })

  it('sistem tar okur (GNU tar ya da bsdtar): ad listesi birebir', () => {
    const d = yeniDizin()
    const k = path.join(d, 'k.txt')
    fs.writeFileSync(k, 'x')
    const uzun = `ev/${'u'.repeat(60)}/${'v'.repeat(60)}/dosya.txt`
    arsivYaz(d, [{ ad: 'ev/a.txt', kaynak: k }, { ad: uzun, kaynak: k }])
    const r = spawnSync('tar', ['-tf', 'a.tar'], { cwd: d, encoding: 'utf8' })
    if (r.error) return // tar yok: ölçülemedi (okuyucumuz yukarıda sınandı)
    expect(r.status).toBe(0)
    expect(r.stdout.split(/\r?\n/).filter(Boolean)).toEqual(['ev/a.txt', uzun, 'ev/bellek.txt'])
  })

  it('SABOTAJ — başlıkta tek bayt bozulursa TAR_BASLIK_BOZUK ile durur (sessiz geçmez)', () => {
    const { d, dosyalar } = hazir()
    const out = arsivYaz(d, dosyalar)
    const b = fs.readFileSync(out)
    b[10] ^= 0xff // ilk başlığın ad alanı
    fs.writeFileSync(out, b)
    expect(() => arsivOku(out)).toThrow(/TAR_BASLIK_BOZUK/)
  })

  it('SABOTAJ — kesik arşiv TAR_KISA ile durur', () => {
    const { d, dosyalar } = hazir()
    const out = arsivYaz(d, dosyalar)
    const b = fs.readFileSync(out)
    fs.writeFileSync(out, b.subarray(0, 700_000))
    expect(() => arsivOku(out)).toThrow(/TAR_KISA/)
  })

  it('SABOTAJ — içerikte tek bayt bozulursa gidiş dönüş sha256 FARKLI çıkar (kur bunu yakalar)', () => {
    const { d, dosyalar } = hazir()
    const out = arsivYaz(d, dosyalar)
    const b = fs.readFileSync(out)
    b[2048] ^= 0x01 // ilk dosyanın içeriği
    fs.writeFileSync(out, b)
    const oku = arsivOku(out)
    expect(oku.get(dosyalar[0].ad)?.sha256).not.toBe(dosyalar[0].sha)
  })

  it('tar-slip: ".." , mutlak yol, sürücü harfi, ters bölü, ":" , çift bölü REDDEDİLİR; normal yol geçer', () => {
    for (const kotu of ['ev/../../x', '../x', '/etc/x', 'C:/x', 'ev\\x', 'ev//x', 'ev/./x', 'ev/a:b', '']) {
      expect(() => C.guvenliGoreliYol(kotu), kotu).toThrow()
    }
    expect(C.guvenliGoreliYol('ev/.claude/settings.json')).toEqual(['ev', '.claude', 'settings.json'])
    const kok = { ev: yeniDizin(), tmp: yeniDizin(), appdata: yeniDizin(), depo: yeniDizin() }
    expect(() => C.hedefYolu('bilinmeyen/x', kok)).toThrow(/bilinmeyen kök/)
    expect(C.hedefYolu('ev/a/b.txt', kok)).toBe(path.join(kok.ev, 'a', 'b.txt'))
  })

  it('yazıcı güvensiz adı daha yazarken reddeder (arşive kötü ad HİÇ girmez)', () => {
    const d = yeniDizin()
    const k = path.join(d, 'k.txt')
    fs.writeFileSync(k, 'x')
    const t = new C.TarYazici(() => undefined)
    expect(() => t.dosyadan('ev/../x', k)).toThrow(/güvensiz/)
    expect(() => t.bellekten('/mutlak', Buffer.from('x'))).toThrow(/güvensiz/)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · paket bütünlüğü (icindekiler.json + sha256)', () => {
  function paketUret(): { kok: string; ic: Icindekiler } {
    const kok = yeniDizin()
    const parca = path.join(kok, 'ayar-X.tar')
    fs.writeFileSync(parca, crypto.randomBytes(5000))
    const ic: Icindekiler = {
      surum: 1,
      damga: 'X',
      kokler: { ev: ESKI, tmp: win('D:', 'tmp'), appdata: win(ESKI, 'AppData'), depo: win(ESKI, 'venthub-hvac') },
      parcalar: [{ ad: 'ayar', dosya: 'ayar-X.tar', bayt: 5000, sha256: C.sha256Dosya(parca) }],
      dosyalar: [{ parca: 'ayar', yol: 'ev/a.json', bayt: 1, sha256: 'a'.repeat(64) }],
    }
    return { kok, ic }
  }

  it('sağlam paket: biçim ve parça doğrulaması temiz', () => {
    const { kok, ic } = paketUret()
    expect(C.icindekilerBicimHatalari(ic)).toEqual([])
    expect(C.parcalariDogrula(ic, kok)).toEqual([])
  })

  it('SABOTAJ — parçada tek bayt değişirse sha256 hatası (bayt sayısı aynı kalır)', () => {
    const { kok, ic } = paketUret()
    const yol = path.join(kok, 'ayar-X.tar')
    const b = fs.readFileSync(yol)
    b[1234] ^= 0x01
    fs.writeFileSync(yol, b)
    expect(C.parcalariDogrula(ic, kok).join(' ')).toMatch(/sha256 tutmuyor/)
  })

  it('SABOTAJ — manifest sha256 yalan söylerse, parça kısalırsa, parça yoksa: hepsi hata', () => {
    const { kok, ic } = paketUret()
    expect(C.parcalariDogrula({ ...ic, parcalar: [{ ...ic.parcalar[0], sha256: 'b'.repeat(64) }] }, kok).join(' ')).toMatch(/sha256 tutmuyor/)
    fs.writeFileSync(path.join(kok, 'ayar-X.tar'), Buffer.alloc(10))
    expect(C.parcalariDogrula(ic, kok).join(' ')).toMatch(/bayt tutmuyor/)
    fs.rmSync(path.join(kok, 'ayar-X.tar'))
    expect(C.parcalariDogrula(ic, kok).join(' ')).toMatch(/YOK/)
  })

  it('biçim kapısı FAIL-CLOSED: eski ev yolu yok, sürüm yanlış, sha biçimi bozuk, parça yolu güvensiz', () => {
    const { ic } = paketUret()
    expect(C.icindekilerBicimHatalari(null)).not.toEqual([])
    expect(C.icindekilerBicimHatalari({ ...ic, kokler: {} }).join(' ')).toMatch(/kokler\.ev/)
    expect(C.icindekilerBicimHatalari({ ...ic, surum: 2 }).join(' ')).toMatch(/sürüm/)
    expect(C.icindekilerBicimHatalari({ ...ic, parcalar: [{ ...ic.parcalar[0], sha256: 'xyz' }] }).join(' ')).toMatch(/sha256 geçersiz/)
    expect(C.icindekilerBicimHatalari({ ...ic, parcalar: [{ ...ic.parcalar[0], dosya: '../kacak.tar' }] }).join(' ')).toMatch(/güvensiz/)
    expect(C.icindekilerBicimHatalari({ ...ic, parcalar: [] }).join(' ')).toMatch(/taşınacak bir şey yok/)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · hedef kapısı ve argümanlar', () => {
  it('hedef bir git deposunun içindeyse REDDEDİLİR (paket sır taşır, depo PUBLIC); dışındaysa serbest', () => {
    const depo = yeniDizin()
    fs.mkdirSync(path.join(depo, '.git'))
    const alt = path.join(depo, 'drive', 'paket')
    fs.mkdirSync(alt, { recursive: true })
    expect(C.hedefHatasi(alt)).toMatch(/git deposunun içinde/)
    expect(C.hedefHatasi(depo)).toMatch(/git deposunun içinde/)
    expect(C.hedefHatasi(yeniDizin())).toBeNull()
    expect(C.hedefHatasi('')).toMatch(/verilmedi/)
    expect(C.hedefHatasi(null)).toMatch(/verilmedi/)
  })

  it('argüman ayrıştırıcı: bilinmeyen bayrak, değersiz bayrak, değer alan bayrağa değer verilmemesi HATA; çoklu toplanır', () => {
    const sema = { bayrak: ['gercek'], deger: ['hedef'], coklu: ['yol-esle'] }
    expect(() => C.argumanlariAyir(['--gerekli'], sema)).toThrow(/bilinmeyen bayrak/)
    expect(() => C.argumanlariAyir(['--hedef'], sema)).toThrow(/değer ister/)
    expect(() => C.argumanlariAyir(['--hedef', '--gercek'], sema)).toThrow(/değer ister/)
    expect(() => C.argumanlariAyir(['--gercek=1'], sema)).toThrow(/değer almaz/)
    const r = C.argumanlariAyir(['--gercek', '--hedef=x', '--yol-esle', 'a=b', '--yol-esle', 'c=d'], sema)
    expect(r.bayrak.gercek).toBe(true)
    expect(r.deger.hedef).toBe('x')
    expect(r.coklu['yol-esle']).toEqual(['a=b', 'c=d'])
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · sırlar: parola betikten GEÇMEZ', () => {
  /** gpg ile üretilmiş sahte veri paketi (atılabilir deneme verisi, sır değil): SKESK v4 AES256 + SEIPD. */
  const ORNEK_GPG = Buffer.from(
    'jA0ECQMKhjVAUghpo1f/0kABqlcQMRBvpx18O4x7jiXp2F6FhYbOvItUWlrxk4OwKDMFtI7saUE3h5RgFG0GfXZAIE95N0VfWm8PVfeeUtNH',
    'base64',
  )
  const PAROLA_BAYRAKLARI = /--passphrase|passphrase-fd|passphrase-file|pinentry-mode|GPG_PASS|PASSPHRASE/i

  /** Kaynak taraması: parola kanalı açan bayrak/değişken adı geçiyor mu? */
  function parolaKanaliVar(kaynak: string): boolean {
    return PAROLA_BAYRAKLARI.test(kaynak)
  }
  function betikKaynaklari(): { ad: string; kaynak: string }[] {
    return fs.readdirSync(TASIMA).filter((f) => f.endsWith('.cjs')).map((ad) => ({ ad, kaynak: fs.readFileSync(path.join(TASIMA, ad), 'utf8') }))
  }

  it('şifreleme komutu simetrik AES256, çıktıyı stdout\'a verir; toplu kip ve parola bayrağı YOK', () => {
    const a = C.gpgSifrelemeArgumanlari()
    expect(a).toContain('--symmetric')
    expect(a[a.indexOf('--cipher-algo') + 1]).toBe('AES256')
    expect(a[a.indexOf('--output') + 1]).toBe('-')
    for (const x of [...a, ...C.gpgCozmeArgumanlari()]) {
      expect(parolaKanaliVar(x), x).toBe(false)
      expect(x).not.toBe('--batch') // toplu kip pinentry'yi kapatır; parolayı Recep'in penceresi sorsun
    }
    expect(C.gpgCozmeArgumanlari()).toContain('--decrypt')
  })

  it('gpg\'ye DOSYA YOLU argüman olarak gitmez (MSYS kesme işaretini siler: Drive\'ım → Driveım, 2026-11-07)', () => {
    const k = fs.readFileSync(path.join(TASIMA, 'cekirdek.cjs'), 'utf8')
    const govde = (ad: string) => k.slice(k.indexOf(`function ${ad}(`), k.indexOf('\n}\n', k.indexOf(`function ${ad}(`)))
    expect(govde('gpgSifrele')).toMatch(/gpgSifrelemeArgumanlari\(\)/)
    expect(govde('gpgCoz')).toMatch(/gpgCozmeArgumanlari\(\)/)
    expect(govde('gpgCoz')).toMatch(/input: fs\.readFileSync\(girdiYol\)/)
    for (const x of [...C.gpgSifrelemeArgumanlari(), ...C.gpgCozmeArgumanlari()]) {
      expect(x.includes('/') || x.includes('\\') || x.includes("'"), x).toBe(false)
    }
  })

  it('KAYNAK TARAMASI: scripts/tasima/*.cjs parola kanalı açmaz, gpg\'ye toplu kip vermez, parolayı ortamdan okumaz', () => {
    const betikler = betikKaynaklari()
    expect(betikler.map((b) => b.ad).sort()).toEqual(expect.arrayContaining(['cekirdek.cjs', 'dogrula.cjs', 'kur.cjs', 'paketle.cjs']))
    for (const b of betikler) {
      expect(parolaKanaliVar(b.kaynak), `${b.ad} parola kanalı içeriyor`).toBe(false)
      expect(/'--batch'/.test(b.kaynak), `${b.ad} gpg'ye --batch veriyor`).toBe(false)
    }
  })

  it('SABOTAJ — kaynak taraması parola veren bir satırı gerçekten yakalar', () => {
    expect(parolaKanaliVar("spawnSync('gpg', ['--passphrase', sifre])")).toBe(true)
    expect(parolaKanaliVar("spawnSync('gpg', ['--pinentry-mode', 'loopback'])")).toBe(true)
    expect(parolaKanaliVar("env: { GPG_PASS: x }")).toBe(true)
  })

  it('PROVA DERSİ (2026-11-07): klon uzun yol açar ve hatanın SONUNU raporlar; iç içe kök reddedilir', () => {
    const g = fs.readFileSync(path.join(TASIMA, 'git.cjs'), 'utf8')
    expect(g).toMatch(/'-c', 'core\.longpaths=true', 'clone', '--quiet'/)
    expect(g).toMatch(/c\.hata\.slice\(-300\)/)
    const K = require_(path.join(TASIMA, 'kur.cjs')) as { iceIceKokler(e: string[], y: string[]): string[] }
    expect(K.iceIceKokler(['C:\\tmp'], ['C:\\tmp\\tasima-prova\\tmp'])).toHaveLength(1)
    expect(K.iceIceKokler(['C:\\TMP\\'], ['c:/tmp/x'])).toHaveLength(1)
    expect(K.iceIceKokler(['C:\\tmp'], ['C:\\tmp2\\x', 'D:\\tmp\\x', 'C:\\tasima-prova'])).toHaveLength(0)
    expect(K.iceIceKokler(['C:\\Users\\alize'], ['C:\\Users\\recep'])).toHaveLength(0)
  })

  it('düz sır tar\'ı diske yazılmaz: paketle.cjs sırları bellekte kurar (sirlar için dosyaYazici çağrısı yok)', () => {
    const k = fs.readFileSync(path.join(TASIMA, 'paketle.cjs'), 'utf8')
    const sir = k.slice(k.indexOf('function sirParcasi'), k.indexOf('function duzDosya'))
    expect(sir.length).toBeGreaterThan(200)
    expect(sir).not.toMatch(/dosyaYazici|writeFileSync|createWriteStream/)
    expect(sir).toMatch(/gpgSifrele\(Buffer\.concat/)
  })

  it('şifreli paket tanıma (parolasız, gpg\'yi çalıştırmadan): AES256 simetrik gpg paketi tanınır', () => {
    expect(C.openpgpSimetrikOzet(ORNEK_GPG)).toEqual({ sifreli: true, aes256: true })
  })

  it('SABOTAJ — şifre algoritması AES256 değilse, düz metinse, kesikse tanıma KIRMIZI verir', () => {
    const zayif = Buffer.from(ORNEK_GPG)
    zayif[3] = 3 // CAST5
    expect(C.openpgpSimetrikOzet(zayif).aes256).toBe(false)
    expect(C.openpgpSimetrikOzet(Buffer.from('düz metin: şifrelenmemiş tar')).sifreli).toBe(false)
    expect(C.openpgpSimetrikOzet(ORNEK_GPG.subarray(0, 8)).sifreli).toBe(false)
    expect(C.openpgpSimetrikOzet(Buffer.alloc(0))).toEqual({ sifreli: false, aes256: false })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · kullanıcı kimliği kodda sabit değil', () => {
  const KIMLIK = /(?:[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+|(?<![A-Za-z0-9._\-/])\/(?:home|Users)\/[A-Za-z0-9._-]+)/

  it('scripts/tasima/* ve cetvel kimlik yolu taşımaz; ev dizini os.homedir() ya da parametreden gelir', () => {
    const dosyalar = [...fs.readdirSync(TASIMA).map((f) => path.join(TASIMA, f)), path.join(REPO, 'docs', 'standards', 'makine-tasima-standard.md')]
    for (const d of dosyalar) {
      const satirlar = fs.readFileSync(d, 'utf8').split(/\r?\n/)
      const sizan = satirlar.findIndex((s) => KIMLIK.test(s))
      expect(sizan, `${path.relative(REPO, d)}:${sizan + 1} kimlik yolu`).toBe(-1)
    }
    expect(fs.readFileSync(path.join(TASIMA, 'envanter.cjs'), 'utf8')).toMatch(/os\.homedir\(\)/)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · dogrula.cjs karşılaştırma (kayıp = kırmızı)', () => {
  const temel = (): Olcum => ({
    sayimlar: {
      kanban: { pano: 18, kart: 1638, olay: 9637, bozukPayload: 0, butunluk: 'ok' },
      sage: { kayit: 432, aktif: 424 },
      posta: { kutuSayisi: 7, toplamKayit: 41, okunamayan: [] },
      hafizaMd: 1506,
      hafizaKlasorSayisi: 44,
      kancalar: { kanca: 73, betik: 61, eksik: [] },
      ayarEskiYol: { toplam: 0, dosyalar: {} },
    },
    araclar: { node: '24.22.1', git: '2.49.0', docker: '29.9.2' },
  })

  it('aynı ölçüm: fark 0, uyarı 0', () => {
    expect(D.karsilastir(temel(), temel())).toEqual({ farklar: [], uyarilar: [] })
  })

  it('SABOTAJ — kanban kartı eksilirse KIRMIZI (kayıp)', () => {
    const y = temel()
    if (y.sayimlar.kanban) y.sayimlar.kanban.kart = 1600
    expect(D.karsilastir(temel(), y).farklar.join(' ')).toMatch(/kanban\.kart: KAYIP — eski 1638, yeni 1600/)
  })

  it('SABOTAJ — sage, posta, hafıza md ve hafıza klasörü kaybı KIRMIZI; eksik kanban/sage KIRMIZI', () => {
    const y = temel()
    if (y.sayimlar.sage) y.sayimlar.sage.kayit = 400
    y.sayimlar.posta.toplamKayit = 3
    y.sayimlar.hafizaMd = 10
    y.sayimlar.hafizaKlasorSayisi = 1
    const f = D.karsilastir(temel(), y).farklar.join(' | ')
    for (const s of ['sage.kayit', 'posta.toplamKayit', 'hafizaMd', 'hafizaKlasorSayisi']) expect(f).toContain(s)
    const yok = temel()
    yok.sayimlar.kanban = null
    yok.sayimlar.sage = null
    expect(D.karsilastir(temel(), yok).farklar.join(' | ')).toMatch(/kanban: .*YOK[\s\S]*sage: .*YOK/)
  })

  it('artış (yeni makinede iş yapıldı) UYARI, --siki ile FARK', () => {
    const y = temel()
    if (y.sayimlar.kanban) y.sayimlar.kanban.kart = 1700
    const r = D.karsilastir(temel(), y)
    expect(r.farklar).toEqual([])
    expect(r.uyarilar.join(' ')).toMatch(/artış/)
    expect(D.karsilastir(temel(), y, { siki: true }).farklar.length).toBe(1)
  })

  it('kanban bütünlük BOZUK, okunamayan pano yükü, eksik kanca betiği, ayarda kalan eski yol: hepsi KIRMIZI', () => {
    const y = temel()
    if (y.sayimlar.kanban) {
      y.sayimlar.kanban.butunluk = 'BOZUK'
      y.sayimlar.kanban.bozukPayload = 2
    }
    y.sayimlar.kancalar.eksik = ['.claude/hooks/yok.cjs']
    y.sayimlar.ayarEskiYol = { toplam: 3, dosyalar: { '.claude/settings.json': 3 } }
    const f = D.karsilastir(temel(), y).farklar.join(' | ')
    expect(f).toMatch(/bütünlük denetimi BOZUK/)
    expect(f).toMatch(/2 pano yükü/)
    expect(f).toMatch(/1 betik dosyası YOK/)
    expect(f).toMatch(/3 yerde ESKİ ev yolu/)
  })

  it('araç eksikse KIRMIZI, sürüm farkı UYARI; eski yol denetimi yapılmadıysa söylenir', () => {
    const y = temel()
    y.araclar.docker = null
    y.araclar.node = '24.30.0'
    y.sayimlar.ayarEskiYol = null
    const r = D.karsilastir(temel(), y)
    expect(r.farklar.join(' ')).toMatch(/araç docker: .*KURULU DEĞİL/)
    expect(r.uyarilar.join(' ')).toMatch(/araç node: sürüm farkı/)
    expect(r.uyarilar.join(' ')).toMatch(/denetimi YAPILMADI/)
  })

  it('kanca betiği çıkarımı: $CLAUDE_PROJECT_DIR, $HOME ve göreli yol çözülür', () => {
    const ayar = { hooks: { PreToolUse: [{ hooks: [{ type: 'command', command: 'node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/a.cjs" --x' }] }], SessionEnd: [{ hooks: [{ command: 'bash "$HOME/.claude/b.sh"' }] }] } }
    const k = D.kancaKomutlari(ayar)
    expect(k).toHaveLength(2)
    const ev = win('D:', 'ev')
    const depo = win('D:', 'depo')
    expect(D.betikAdaylari(k[0], ev, depo)).toEqual([`${depo}/.claude/hooks/a.cjs`])
    expect(D.betikAdaylari(k[1], ev, depo)).toEqual([`${ev}/.claude/b.sh`])
    expect(D.kancaKomutlari({})).toEqual([])
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// UÇTAN UCA: sahte "eski makine" -> paketle (gerçek) -> kur (gerçek) -> sahte "yeni makine"
// ═════════════════════════════════════════════════════════════════════════════
interface Sonuc {
  status: number | null
  stdout: string
  stderr: string
}
function kos(betik: string, args: string[]): Sonuc {
  const r = spawnSync(process.execPath, [path.isAbsolute(betik) ? betik : path.join(TASIMA, betik), ...args], { encoding: 'utf8', timeout: 150_000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

interface Makine {
  kok: string
  eski: { ev: string; tmp: string; appdata: string; depo: string }
  yeni: { ev: string; tmp: string; appdata: string; depo: string }
  drive: string
}

function makineler(): Makine {
  const kok = yeniDizin()
  const k = (...p: string[]): string => path.join(kok, ...p)
  const eskiEv = k('eski', 'ali')
  const yeniEv = k('yeni', 'veli')
  return {
    kok,
    eski: { ev: eskiEv, tmp: k('eski', 'tmp'), appdata: path.join(eskiEv, 'AppData', 'Roaming'), depo: path.join(eskiEv, 'venthub-hvac') },
    yeni: { ev: yeniEv, tmp: k('yeni', 'tmp'), appdata: path.join(yeniEv, 'AppData', 'Roaming'), depo: path.join(yeniEv, 'venthub-hvac') },
    drive: k('drive'),
  }
}
const kokArgs = (m: Makine['eski']): string[] => ['--ev', m.ev, '--tmp-kok', m.tmp, '--appdata', m.appdata, '--ana-depo', m.depo]

function yaz(yol: string, icerik: string | Buffer): void {
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, icerik)
}

/** Eski makinede yapılandırma + hafıza + arşiv dosyaları oluşturur. */
function eskiMakineyiKur(m: Makine): { projeAdi: string; ayarMetni: string } {
  const e = m.eski
  const b = C.yolBicimleri(e.ev)
  const ayar = {
    env: { KOK: b.ham },
    permissions: { allow: [`Read(${b.duz}/**)`, `Read(/${b.msys}/**)`] },
    hooks: { SessionEnd: [{ hooks: [{ type: 'command', command: `node "${b.ham}\\hafiza.cjs"` }] }] },
  }
  const ayarMetni = JSON.stringify(ayar, null, 2)
  yaz(path.join(e.ev, '.claude', 'settings.json'), ayarMetni)
  yaz(path.join(e.ev, '.claude.json'), JSON.stringify({ projects: { [`${b.duz}/venthub-hvac`]: { allowedTools: [] } } }))
  yaz(path.join(e.ev, '.claude', 'hafiza-commit.sh'), `#!/bin/bash\ncd "${b.duz}/venthub-hvac" && git status\n`)
  yaz(path.join(e.ev, '.claude', 'agent-memory', 'a.md'), `# not\nbu yol ${b.ham} düz metindir ve DEĞİŞMEZ (prose)\n`)
  const projeAdi = C.projeKlasorAdi(e.depo)
  yaz(path.join(e.ev, '.claude', 'projects', projeAdi, 'memory', 'a.md'), 'hafıza notu ğüşiöç\n')
  yaz(path.join(e.ev, '.claude', 'projects', projeAdi, 'memory', 'iki.txt'), 'md dışı dosya\n')
  yaz(path.join(e.ev, 'blog-calisma', 'yazi.txt'), crypto.randomBytes(70_000))
  return { projeAdi, ayarMetni }
}

function paketle(m: Makine, parcalar: string): Sonuc {
  return kos('paketle.cjs', ['--gercek', '--hedef', m.drive, ...kokArgs(m.eski), '--parcalar', parcalar])
}

function paketKlasoru(m: Makine): string {
  const ad = fs.readdirSync(m.drive).filter((f) => f.startsWith('tasima-'))
  expect(ad).toHaveLength(1)
  return path.join(m.drive, ad[0])
}

describe('INV-TASIMA-1 · uçtan uca: paketle -> kur (sahte eski ve yeni makine)', () => {
  it('KURU KOŞUM hiçbir şey yazmaz (paketle ve kur)', () => {
    const m = makineler()
    eskiMakineyiKur(m)
    const once = fs.readdirSync(m.eski.ev).sort()
    const r = kos('paketle.cjs', ['--hedef', m.drive, ...kokArgs(m.eski), '--parcalar', 'ayar,hafiza,arsiv'])
    expect(r.status, r.stderr + r.stdout).toBe(0)
    expect(r.stdout).toMatch(/KURU KOŞUM \(hiçbir şey yazılmadı\)/)
    expect(fs.existsSync(m.drive)).toBe(false)
    expect(fs.readdirSync(m.eski.ev).sort()).toEqual(once)

    expect(paketle(m, 'ayar,hafiza,arsiv').status).toBe(0)
    const k = kos('kur.cjs', ['--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'ayar,hafiza,arsiv', '--git-atla'])
    expect(k.status, k.stderr + k.stdout).toBe(0)
    expect(k.stdout).toMatch(/KURU KOŞUM/)
    expect(fs.existsSync(m.yeni.ev)).toBe(false)
  })

  it('tam gidiş dönüş: ayar yolları yeni eve çevrilir, JSON geçerli kalır, proje klasörü yeniden adlandırılır, prose DEĞİŞMEZ, arşiv bayt bayt aynı', () => {
    const m = makineler()
    const { projeAdi, ayarMetni } = eskiMakineyiKur(m)
    const p = paketle(m, 'ayar,hafiza,arsiv')
    expect(p.status, p.stderr + p.stdout).toBe(0)

    const ic = JSON.parse(fs.readFileSync(path.join(paketKlasoru(m), 'icindekiler.json'), 'utf8')) as Icindekiler
    expect(C.icindekilerBicimHatalari(ic)).toEqual([])
    expect(ic.parcalar.map((x) => x.ad).sort()).toEqual(['arsiv', 'ayar', 'hafiza'])
    expect(ic.dosyalar.every((d) => /^[0-9a-f]{64}$/.test(d.sha256))).toBe(true)

    // Yeni makinede depo YOK: kur, paketin kendi arac/ klasöründen koşar (kendi kendine yeter) ve repodakiyle aynı koddur.
    const paketKur = path.join(paketKlasoru(m), 'arac', 'kur.cjs')
    expect(fs.existsSync(paketKur)).toBe(true)
    expect(C.sha256Dosya(paketKur)).toBe(C.sha256Dosya(path.join(TASIMA, 'kur.cjs')))
    expect(fs.existsSync(path.join(paketKlasoru(m), 'OKU-BENI.txt'))).toBe(true)
    const k = kos(paketKur, ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'ayar,hafiza,arsiv', '--git-atla'])
    expect(k.status, k.stderr + k.stdout).toBe(0)
    expect(k.stdout).toMatch(/KUR TAMAM/)

    const y = C.yolBicimleri(m.yeni.ev)
    const sonraMetin = fs.readFileSync(path.join(m.yeni.ev, '.claude', 'settings.json'), 'utf8')
    const sonra = JSON.parse(sonraMetin) as { env: { KOK: string }; permissions: { allow: string[] } }
    expect(sonra.env.KOK).toBe(y.ham)
    expect(sonra.permissions.allow[0]).toBe(`Read(${y.duz}/**)`)
    expect(C.eskiYolSay(sonraMetin, [m.eski.ev])).toBe(0)
    expect(fs.readFileSync(path.join(m.yeni.ev, '.claude', 'settings.json.oncesi-tasima'), 'utf8')).toBe(ayarMetni)
    expect(C.eskiYolSay(fs.readFileSync(path.join(m.yeni.ev, '.claude.json'), 'utf8'), [m.eski.ev])).toBe(0)
    expect(fs.readFileSync(path.join(m.yeni.ev, '.claude', 'hafiza-commit.sh'), 'utf8')).toContain(`${y.duz}/venthub-hvac`)

    // proje klasörü yeni slug'a taşındı; md dışı dosya da geldi; eski adlı klasör YOK
    const yeniAd = C.projeKlasorAdi(m.yeni.depo)
    expect(yeniAd).not.toBe(projeAdi)
    expect(fs.readFileSync(path.join(m.yeni.ev, '.claude', 'projects', yeniAd, 'memory', 'a.md'), 'utf8')).toBe('hafıza notu ğüşiöç\n')
    expect(fs.existsSync(path.join(m.yeni.ev, '.claude', 'projects', yeniAd, 'memory', 'iki.txt'))).toBe(true)
    expect(fs.existsSync(path.join(m.yeni.ev, '.claude', 'projects', projeAdi))).toBe(false)

    // yeniden yazım listesinde OLMAYAN dosya (prose) aynen kalır; arşiv dosyası bayt bayt aynı
    expect(fs.readFileSync(path.join(m.yeni.ev, '.claude', 'agent-memory', 'a.md'), 'utf8')).toContain(C.yolBicimleri(m.eski.ev).ham)
    expect(C.sha256Dosya(path.join(m.yeni.ev, 'blog-calisma', 'yazi.txt'))).toBe(C.sha256Dosya(path.join(m.eski.ev, 'blog-calisma', 'yazi.txt')))
  })

  it('SABOTAJ — paket parçasında tek bayt bozuksa kur HİÇBİR ŞEY YAZMADAN durur', () => {
    const m = makineler()
    eskiMakineyiKur(m)
    expect(paketle(m, 'ayar,hafiza,arsiv').status).toBe(0)
    const pkg = paketKlasoru(m)
    const tarAdi = fs.readdirSync(pkg).find((f) => f.startsWith('arsiv-') && f.endsWith('.tar')) as string
    const yol = path.join(pkg, tarAdi)
    const b = fs.readFileSync(yol)
    b[3000] ^= 0x01
    fs.writeFileSync(yol, b)
    const k = kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'ayar,hafiza,arsiv', '--git-atla'])
    expect(k.status).toBe(1)
    expect(k.stderr).toMatch(/PAKET BOZUK/)
    expect(k.stderr).toMatch(/sha256 tutmuyor/)
    expect(fs.existsSync(m.yeni.ev)).toBe(false)
  })

  it('SABOTAJ — icindekiler.json\'daki sha256 yalan söylerse dosya çıkarılırken DURUR (kayıtla arşiv çelişir)', () => {
    const m = makineler()
    eskiMakineyiKur(m)
    expect(paketle(m, 'ayar,hafiza,arsiv').status).toBe(0)
    const yol = path.join(paketKlasoru(m), 'icindekiler.json')
    const ic = JSON.parse(fs.readFileSync(yol, 'utf8')) as Icindekiler
    const hedef = ic.dosyalar.find((d) => d.yol.endsWith('blog-calisma/yazi.txt'))
    expect(hedef).toBeDefined()
    if (hedef) hedef.sha256 = 'c'.repeat(64)
    fs.writeFileSync(yol, JSON.stringify(ic))
    const k = kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'arsiv', '--git-atla'])
    expect(k.status).toBe(1)
    expect(k.stderr + k.stdout).toMatch(/sha256 tutmuyor, DURDU/)
    expect(fs.existsSync(path.join(m.yeni.ev, 'blog-calisma', 'yazi.txt'))).toBe(false)
  })

  it('var olan farklı dosyanın üstüne YAZMAZ; --uzerine-yaz ile .oncesi-tasima yedeği alıp yazar; aynı içeriğe dokunmaz', () => {
    const m = makineler()
    eskiMakineyiKur(m)
    expect(paketle(m, 'ayar,hafiza,arsiv').status).toBe(0)
    const yeniAyar = path.join(m.yeni.ev, '.claude', 'settings.json')
    yaz(yeniAyar, '{"yeni-makinenin-kendi-ayari": true}')
    const kosum = (ek: string[]): Sonuc => kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'ayar,hafiza,arsiv', '--git-atla', ...ek])
    const red = kosum([])
    expect(red.status).toBe(1)
    expect(red.stderr).toMatch(/hedefte farklı içerikle var; DURDU/)
    expect(fs.readFileSync(yeniAyar, 'utf8')).toBe('{"yeni-makinenin-kendi-ayari": true}')
    expect(fs.existsSync(path.join(m.yeni.ev, 'blog-calisma'))).toBe(false) // başka hiçbir şey yazılmadı

    const tamam = kosum(['--uzerine-yaz'])
    expect(tamam.status, tamam.stderr + tamam.stdout).toBe(0)
    expect(fs.readFileSync(`${yeniAyar}.mevcut-oncesi-tasima`, 'utf8')).toBe('{"yeni-makinenin-kendi-ayari": true}') // yeni makinenin kendi dosyası kaybolmadı
    expect(fs.readFileSync(`${yeniAyar}.oncesi-tasima`, 'utf8')).toContain(C.yolBicimleri(m.eski.ev).kacisli) // yol yazımından önceki paket içeriği
    expect(C.eskiYolSay(fs.readFileSync(yeniAyar, 'utf8'), [m.eski.ev])).toBe(0)
    // aynı içerikle ikinci koşum: yol yazımı dosyayı paketten farklılaştırdığı için YİNE --uzerine-yaz ister (belgelenmiş davranış)
    expect(kosum([]).status).toBe(1)
    expect(kosum(['--uzerine-yaz']).status).toBe(0)
  })

  it('SQLite: canlı WAL\'daki satırlar da pakete girer (VACUUM INTO), yeni makinede açılır ve sayım tutar', () => {
    let sqlite: Sqlite
    try {
      process.removeAllListeners('warning')
      process.on('warning', () => undefined)
      sqlite = require_('node:sqlite') as Sqlite
    } catch {
      console.warn('[INV-TASIMA-1] node:sqlite yok — SQLite kolu ÖLÇÜLEMEDİ')
      return
    }
    const m = makineler()
    eskiMakineyiKur(m)
    const dbYol = path.join(m.eski.depo, '.wrongstack', 'kanbans', '_kanban.sqlite')
    fs.mkdirSync(path.dirname(dbYol), { recursive: true })
    const db = new sqlite.DatabaseSync(dbYol)
    try {
      db.exec('PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; CREATE TABLE kanban_boards (id TEXT, payload TEXT); CREATE TABLE kanban_events (id INTEGER)')
      db.prepare('INSERT INTO kanban_boards VALUES (?, ?)').run('b1', JSON.stringify({ tasks: [{ id: 1 }, { id: 2 }] }))
      db.prepare('INSERT INTO kanban_boards VALUES (?, ?)').run('b2', JSON.stringify({ tasks: [{ id: 3 }] }))
      db.prepare('INSERT INTO kanban_events VALUES (?)').run(1)
      // Bağlantı AÇIK ve her şey WAL'da: ana dosyayı düz kopyalayan bir "yedek" bu satırları kaçırırdı.
      expect(fs.existsSync(`${dbYol}-wal`)).toBe(true)
      const p = paketle(m, 'wrongstack')
      expect(p.status, p.stderr + p.stdout).toBe(0)
    } finally {
      db.close()
    }
    const ic = JSON.parse(fs.readFileSync(path.join(paketKlasoru(m), 'icindekiler.json'), 'utf8')) as Icindekiler & { sqlite: { mod: string; pano?: number; kart?: number }[] }
    expect(ic.sqlite).toHaveLength(1)
    expect(ic.sqlite[0]).toMatchObject({ mod: 'vacuum', pano: 2, kart: 3 })
    expect(ic.dosyalar.some((d) => /-wal$|-shm$/.test(d.yol))).toBe(false)

    const k = kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'wrongstack', '--git-atla'])
    expect(k.status, k.stderr + k.stdout).toBe(0)
    const yeniDb = new sqlite.DatabaseSync(path.join(m.yeni.depo, '.wrongstack', 'kanbans', '_kanban.sqlite'), { readOnly: true })
    try {
      expect((yeniDb.prepare('SELECT count(*) AS c FROM kanban_boards').get() as { c: number }).c).toBe(2)
      expect((yeniDb.prepare('SELECT count(*) AS c FROM kanban_events').get() as { c: number }).c).toBe(1)
    } finally {
      yeniDb.close()
    }
  })

  it('zorunlu öğe YOKSA gerçek paketleme reddedilir ve hedefe hiçbir şey yazılmaz', () => {
    const m = makineler()
    yaz(path.join(m.eski.ev, 'blog-calisma', 'yazi.txt'), 'x') // settings.json / .claude.json YOK
    const p = paketle(m, 'ayar,arsiv')
    expect(p.status).toBe(1)
    expect(p.stderr).toMatch(/zorunlu öğe yok/)
    expect(fs.existsSync(m.drive)).toBe(false)
  })

  it('hedef git deposunun içindeyse paketle REDDEDER (kuru ve gerçek)', () => {
    const m = makineler()
    eskiMakineyiKur(m)
    const depo = yeniDizin()
    fs.mkdirSync(path.join(depo, '.git'))
    const hedef = path.join(depo, 'drive')
    for (const ek of [[], ['--gercek']]) {
      const r = kos('paketle.cjs', ['--hedef', hedef, ...ek, ...kokArgs(m.eski), '--parcalar', 'ayar'])
      expect(r.status).toBe(1)
      expect(r.stderr).toMatch(/git deposunun içinde/)
    }
    expect(fs.existsSync(hedef)).toBe(false)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('INV-TASIMA-1 · uçtan uca: git (push edilmemiş dal, commit ve stash geri gelir)', () => {
  function git(cwd: string, ...args: string[]): string {
    const r = spawnSync('git', ['-c', 'user.name=Tasima', '-c', 'user.email=tasima@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' })
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} -> ${r.status}: ${r.stderr}`)
    return r.stdout.trim()
  }

  it('bundle: yerel dal + push edilmemiş commit + stash yeni makinede geri gelir; kaynak depo bozulmaz, geçici ref kalmaz', () => {
    const m = makineler()
    const origin = path.join(m.kok, 'origin.git')
    fs.mkdirSync(path.dirname(m.eski.depo), { recursive: true })
    git(m.kok, 'init', '--bare', '-b', 'master', origin)
    git(m.kok, 'clone', origin, m.eski.depo)
    git(m.eski.depo, 'symbolic-ref', 'HEAD', 'refs/heads/master')
    yaz(path.join(m.eski.depo, 'a.txt'), 'ilk\n')
    git(m.eski.depo, 'add', 'a.txt')
    git(m.eski.depo, 'commit', '-m', 'ilk')
    git(m.eski.depo, 'push', 'origin', 'HEAD:master')
    // uzakta OLMAYAN iş: master'da bir commit, yerel dal, stash
    yaz(path.join(m.eski.depo, 'b.txt'), 'yerel\n')
    git(m.eski.depo, 'add', 'b.txt')
    git(m.eski.depo, 'commit', '-m', 'sadece-yerel-commit')
    git(m.eski.depo, 'branch', 'sadece-yerel-dal')
    yaz(path.join(m.eski.depo, 'a.txt'), 'yarim is\n')
    git(m.eski.depo, 'stash', 'push', '-m', 'yarim-is-notu')
    const sha = git(m.eski.depo, 'rev-parse', 'HEAD')
    const refOnce = git(m.eski.depo, 'for-each-ref', '--format=%(refname) %(objectname)')

    const p = paketle(m, 'git')
    expect(p.status, p.stderr + p.stdout).toBe(0)
    // kaynak depo: geçici stash ref'leri silindi, hiçbir ref değişmedi, stash yerinde
    expect(git(m.eski.depo, 'for-each-ref', 'refs/tasima-stash')).toBe('')
    expect(git(m.eski.depo, 'for-each-ref', '--format=%(refname) %(objectname)')).toBe(refOnce)
    expect(git(m.eski.depo, 'stash', 'list')).toMatch(/yarim-is-notu/)

    const ic = JSON.parse(fs.readFileSync(path.join(paketKlasoru(m), 'icindekiler.json'), 'utf8')) as Icindekiler
    const gitler = ic.git ?? []
    const ana = gitler.find((g) => g.ad === 'venthub-hvac')
    expect(ana).toMatchObject({ var: true, ahead: 1 })
    expect(ana?.stash).toHaveLength(1)
    expect(ana?.bundle?.dosya).toMatch(/^git\/venthub-hvac-.*\.bundle$/)
    expect(gitler.filter((g) => g.ad !== 'venthub-hvac').every((g) => g.var === false)).toBe(true)

    const k = kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'git'])
    expect(k.status, k.stderr + k.stdout).toBe(0)
    const y = m.yeni.depo
    expect(git(y, 'rev-parse', 'HEAD')).toBe(sha) // master, uzakta olmayan commit'e ileri alındı
    expect(git(y, 'branch', '--list', 'sadece-yerel-dal')).toMatch(/sadece-yerel-dal/)
    expect(git(y, 'stash', 'list')).toMatch(/yarim-is-notu/)
    expect(git(y, 'for-each-ref', 'refs/tasima-bundle', 'refs/tasima-stash')).toBe('')
    expect(git(y, 'show', 'stash@{0}:a.txt')).toBe('yarim is')
  })

  it('SABOTAJ — bundle bozulursa kur git adımından ÖNCE paket bozuk der ve klonlamaz', () => {
    const m = makineler()
    const origin = path.join(m.kok, 'origin.git')
    git(m.kok, 'init', '--bare', '-b', 'master', origin)
    git(m.kok, 'clone', origin, m.eski.depo)
    git(m.eski.depo, 'symbolic-ref', 'HEAD', 'refs/heads/master')
    yaz(path.join(m.eski.depo, 'a.txt'), 'ilk\n')
    git(m.eski.depo, 'add', 'a.txt')
    git(m.eski.depo, 'commit', '-m', 'ilk')
    git(m.eski.depo, 'push', 'origin', 'HEAD:master')
    yaz(path.join(m.eski.depo, 'b.txt'), 'yerel\n')
    git(m.eski.depo, 'add', 'b.txt')
    git(m.eski.depo, 'commit', '-m', 'yerel')
    expect(paketle(m, 'git').status).toBe(0)
    const pkg = paketKlasoru(m)
    const bundle = fs.readdirSync(path.join(pkg, 'git')).find((f) => f.endsWith('.bundle')) as string
    const yol = path.join(pkg, 'git', bundle)
    const b = fs.readFileSync(yol)
    b[b.length - 5] ^= 0x01
    fs.writeFileSync(yol, b)
    const k = kos('kur.cjs', ['--gercek', '--kaynak', m.drive, ...kokArgs(m.yeni), '--parcalar', 'git'])
    expect(k.status).toBe(1)
    expect(k.stderr).toMatch(/bundle sha256 tutmuyor/)
    expect(fs.existsSync(m.yeni.depo)).toBe(false)
  })
})
