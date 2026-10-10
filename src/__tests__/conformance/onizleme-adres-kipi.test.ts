// @vitest-environment node
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-ONIZLEME-2 — adres önizleme kipi (ALT-37c; Cuma 9 Ekim ADRES önizlemesi, karar 68, adres planı Faz 4).
 *
 * `node scripts/onizleme.mjs <dal> --adres` yeni adres şemasını YALNIZ ön izleme ağacında açar: iki derleme sabitini
 * yamalar (`ADRES_SEMASI_K3B`, harita bağlantısı), haritayı canlıdan üretir, `NEXT_PUBLIC_ADRES_DILI=1` ile derler,
 * yamaları geri alır ve Recep'in 18 adresini sınar. Bu dosya o düzeneğin KENDİSİNİN doğru çalıştığını sınar.
 *
 * ⭐BU DOSYA ÖLÇÜLMÜŞ İKİ TUZAĞA KARŞI YAZILDI (2026-10-09, deneme derlemesi):
 *   1. SESSİZ YAMA ATLAMA: "yama zaten uygulanmış mı" denetimi alt dizgiyle yapılınca, `haritaKaynagi.ts` başlığındaki
 *      ÖRNEK YORUM yama metnini aynen taşıdığı için harita yaması atlandı: bayrak AÇIK, harita BAĞLI DEĞİL, bütün eski
 *      ürün adresleri sessizce çalışmaz. Denetim satır düzeyinde (yorum satırı kod satırı sayılmaz). Sabotaj 1.
 *   2. İÇE AKTARMA SIRASI: `next build` ESLint'i (simple-import-sort) yamalı içe aktarma satırı göreli içe aktarmadan
 *      SONRA gelirse derlemeyi düşürür (328 sn sonra). Yama onu ÖNCE koyar. Bölüm 1.
 *
 * Bölümler: 1 yama tablosu (gerçek kaynakla uyum) · 2 yama uygulama/geri alma (ezmeme dahil) · 3 tıklama listesi okuyucu ·
 * 4 ön kontrol kararları · 5 derleme izi · 6 kaynak seçimi · 7 derleme hatası özeti · 8 port ve kilit · 9 betik kolu ·
 * 10 tam tarama özeti.
 *
 * ⚠KAPSAM SINIRI: sahte ağ ve sahte git kullanılır. Gerçek sunucunun 18 adrese ne cevap verdiği BURADA ölçülmez; o
 * önizleme koşusunun çıktısındaki ön kontrol tablosudur.
 */

type Yama = { dosya: string; bul: string; yaz: string }
type Git = (argumanlar: string[], cwd: string) => { kod: number | null; cikti: string; hata: string }
type IzSatiri = {
  adres: string
  ilk: { durum: number; location: string | null } | null
  hop: number
  sonDurum: number | null
  sonUrl: string
  zincir: number[]
  hata: string | null
}
type Izle = (adres: string) => Promise<IzSatiri>
type KontrolSonucu = { no: number; eski: string; yeni: string | null; durum: 'TAMAM' | 'KIRMIZI' | 'HATA' | 'BEKLIYOR'; ayrinti: string }
type Iz = { commit: string; adres: boolean; yamaOzeti: string; zaman?: string }
type Tarayici = (argumanlar: string[], bag: { yaz: (m: string) => void; hata: (m: string) => void }) => Promise<number>

interface Modul {
  YAMALAR: readonly Yama[]
  HARITA_DOSYASI: string
  URETILEN_DIZIN: string
  IZ_OMRU_MS: number
  yamaOzeti: () => string
  yamaUygula: (metin: string, yama: Yama) => { metin: string; durum: 'uygulandi' | 'zaten' }
  yamalariUygula: (agac: string) => { dosya: string; durum: 'uygulandi' | 'zaten' }[]
  yamalariGeriAl: (agac: string, git: Git) => { geriAlinan: string[]; atlanan: string[] }
  tiklamaListesiBul: (agac: string) => string | null
  tiklamaListesiOku: (metin: string) => { no: number; eski: string; yeni: string | null }[]
  kontrolEt: (k: { no: number; eski: string; yeni: string | null }, izle: Izle) => Promise<KontrolSonucu>
  onKontrol: (liste: { no: number; eski: string; yeni: string | null }[], izle: Izle) => Promise<KontrolSonucu[]>
  onKontrolOzeti: (s: KontrolSonucu[]) => { toplam: number; tamam: number; kirmizi: number; hata: number; bekliyor: number }
  onKontrolTablosu: (s: KontrolSonucu[]) => string
  gercekTarayici: () => Tarayici
  taramaOzetiSatirlari: (yazilanlar: unknown[]) => string[]
  tamTarama: (taban: string, tara?: Tarayici) => Promise<{ kod: number; satirlar: string[] }>
  hazirBekle: (
    taban: string,
    o: { getir: (url: string) => Promise<{ durum: number }>; uyu?: (ms: number) => Promise<void>; sureMs?: number; aralikMs?: number }
  ) => Promise<boolean>
  izYolu: (agac: string) => string
  izOku: (agac: string) => Iz | null
  izYaz: (agac: string, iz: Iz) => void
  izSil: (agac: string) => void
  derlemeGerekli: (iz: Iz | null, beklenen: Iz, derlemeVar: boolean, o?: { simdi?: number; omurMs?: number }) => boolean
  kaynakSec: (g: { yerel: string | null; uzak: string | null; iliski?: 'yerel-geride' | 'yerel-onde' | 'ayrik' }) => {
    commit: string
    kaynak: 'yerel' | 'uzak'
    uyari: string | null
  } | null
  iliskiBul: (git: Git, depo: string, yerel: string, uzak: string) => 'yerel-geride' | 'yerel-onde' | 'ayrik'
  derlemeHatasiOzetle: (metin: string, enCok?: number) => string
  portMusait: (port: number) => Promise<boolean>
  pidCanliMi: (pid: number) => boolean
  kilitYolu: (agac: string) => string
  kilitAl: (agac: string, o?: { pid?: number; canliMi?: (pid: number) => boolean }) => { alindi: boolean; sahip: number | null }
  kilitBirak: (agac: string, pid?: number) => void
}

const KOK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK, 'scripts', 'adres', 'onizleme-adres.mjs')
const BETIK = path.join(KOK, 'scripts', 'onizleme.mjs')
const FEATURES = 'src/config/features.ts'
const HARITA_KAYNAGI = 'src/lib/adres/haritaKaynagi.ts'

/** Gerçek dosyanın yapısını taklit eder: başlık yorumu yama metnini AYNEN taşır (ölçülen tuzak). */
const FIKSTUR_FEATURES = "// bayraklar\nexport const ADRES_SEMASI_K3B = false\nexport const BASKA = 1\n"
const FIKSTUR_HARITA = [
  '/**',
  ' * Faz 3-C biçimi:',
  " *   import uretilmis from '@/data/generated/eski-adres-haritasi.json'",
  ' *   export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = uretilmis as EskiAdresHaritaDosyasi',
  ' */',
  "import type { EskiAdresHaritaDosyasi } from './haritaTipi'",
  '',
  'export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = null',
  '',
].join('\n')

const temizlik: string[] = []
afterAll(() => {
  for (const d of temizlik) fs.rmSync(d, { recursive: true, force: true })
})

function geciciDizin(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'onizleme-adres-'))
  temizlik.push(d)
  return d
}

/** Sahte ön izleme ağacı: `.git` işareti + iki yama hedefi. `head` = git HEAD içerikleri. */
function sahteAgac(icerik: Record<string, string> = { [FEATURES]: FIKSTUR_FEATURES, [HARITA_KAYNAGI]: FIKSTUR_HARITA }) {
  const agac = geciciDizin()
  fs.mkdirSync(path.join(agac, '.git'))
  for (const [dosya, metin] of Object.entries(icerik)) {
    fs.mkdirSync(path.dirname(path.join(agac, dosya)), { recursive: true })
    fs.writeFileSync(path.join(agac, dosya), metin)
  }
  return { agac, head: { ...icerik } }
}

/** Sahte git: `show HEAD:<d>` HEAD içeriği, `checkout -- <d>` dosyayı HEAD'e yazar, `ls-files` izlenenler. */
function sahteGit(head: Record<string, string>, izlenen: string[] = []) {
  const cagrilar: string[][] = []
  const git: Git = (a, cwd) => {
    cagrilar.push(a)
    if (a[0] === 'show') {
      const dosya = a[1].replace(/^HEAD:/, '')
      return dosya in head ? { kod: 0, cikti: head[dosya].trim(), hata: '' } : { kod: 128, cikti: '', hata: 'yok' }
    }
    if (a[0] === 'checkout') {
      const dosya = a[a.length - 1]
      fs.writeFileSync(path.join(cwd, dosya), head[dosya])
      return { kod: 0, cikti: '', hata: '' }
    }
    if (a[0] === 'ls-files') return { kod: 0, cikti: izlenen.includes(a[a.length - 1]) ? a[a.length - 1] : '', hata: '' }
    return { kod: 1, cikti: '', hata: 'beklenmeyen komut' }
  }
  return { git, cagrilar }
}

function izSatiri(adres: string, o: Partial<IzSatiri> = {}): IzSatiri {
  return { adres, ilk: null, hop: 0, sonDurum: 200, sonUrl: adres, zincir: [200], hata: null, ...o }
}

/** Eski adres `hedef`e TEK sıçramayla (durum 308) gider, orada 200. */
function tasinan(adres: string, hedef: string, durum = 308): IzSatiri {
  return izSatiri(adres, { ilk: { durum, location: hedef }, hop: 1, sonDurum: 200, sonUrl: hedef, zincir: [durum, 200] })
}

describe('INV-ONIZLEME-2 · adres önizleme kipi', async () => {
  const m = (await import(pathToFileURL(MODUL).href)) as Modul

  describe('1 · yama tablosu gerçek kaynakla uyumlu', () => {
    it('her yama hedefi GERÇEK dosyada tam bir kez bulunur (ya da Faz 3-C birleşmiş ve satır zaten orada)', () => {
      const dosyalar = new Set(m.YAMALAR.map((y) => y.dosya))
      for (const dosya of dosyalar) {
        let metin = fs.readFileSync(path.join(KOK, dosya), 'utf8')
        // yamaUygula hedef yoksa ATAR (mesaj dosyayı ve hedefi söyler); kaynak değişirse bu test KIRMIZI olur ve
        // YAMALAR güncellenmeden önizleme sessiz bozulmaz.
        for (const y of m.YAMALAR.filter((x) => x.dosya === dosya)) metin = m.yamaUygula(metin, y).metin
        expect(metin.length).toBeGreaterThan(0)
      }
    })

    it('yamalı harita dosyasında içe aktarma satırı göreli içe aktarmadan ÖNCE gelir (next build ESLint: simple-import-sort)', () => {
      let metin = fs.readFileSync(path.join(KOK, HARITA_KAYNAGI), 'utf8')
      for (const y of m.YAMALAR.filter((x) => x.dosya === HARITA_KAYNAGI)) metin = m.yamaUygula(metin, y).metin
      const uretilmis = metin.indexOf("import uretilmis from '@/data/generated/eski-adres-haritasi.json'")
      const gorece = metin.indexOf("import type { EskiAdresHaritaDosyasi } from './haritaTipi'")
      expect(uretilmis, 'harita içe aktarma satırı yok').toBeGreaterThanOrEqual(0)
      expect(uretilmis).toBeLessThan(gorece)
      expect(metin).toMatch(/^export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi \| null = uretilmis as EskiAdresHaritaDosyasi$/m)
    })

    it('yamalı özellik dosyasında bayrak AÇIK; yama dosyalara kalıcı yazılmaz (hesap bellekte)', () => {
      const yol = path.join(KOK, FEATURES)
      const once = fs.readFileSync(yol, 'utf8')
      const yamali = m.YAMALAR.filter((x) => x.dosya === FEATURES).reduce((t, y) => m.yamaUygula(t, y).metin, once)
      expect(yamali).toMatch(/^export const ADRES_SEMASI_K3B = true$/m)
      expect(fs.readFileSync(yol, 'utf8'), 'okuma dosyayı değiştirdi').toBe(once)
    })

    it('yama özeti kararlı, tablo değişince değişir (eski derleme izi yeniden kullanılmaz)', () => {
      expect(m.yamaOzeti()).toBe(m.yamaOzeti())
      expect(m.yamaOzeti()).toMatch(/^[0-9a-f]{16}$/)
    })
  })

  describe('2 · yama uygulama ve geri alma', () => {
    it('SABOTAJ 1 — yama metni YORUM satırında geçiyorsa yama yine UYGULANIR (alt dizgi denetimi bunu atlardı)', () => {
      const haritaYamalari = m.YAMALAR.filter((y) => y.dosya === HARITA_KAYNAGI)
      let metin = FIKSTUR_HARITA
      // yorumda `yaz` metni VAR (alt dizgi denetimi "zaten uygulanmış" sanırdı) ama KOD satırı yok
      expect(metin.includes(haritaYamalari[1].yaz)).toBe(true)
      const durumlar = haritaYamalari.map((y) => {
        const s = m.yamaUygula(metin, y)
        metin = s.metin
        return s.durum
      })
      expect(durumlar).toEqual(['uygulandi', 'uygulandi'])
      expect(metin).toMatch(/^export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi \| null = uretilmis as EskiAdresHaritaDosyasi$/m)
      expect(metin).not.toMatch(/^export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi \| null = null$/m)
    })

    it('ikinci uygulama hiçbir şey değiştirmez (idempotent); içe aktarma satırı ikilenmez', () => {
      let metin = FIKSTUR_HARITA
      for (const y of m.YAMALAR.filter((x) => x.dosya === HARITA_KAYNAGI)) metin = m.yamaUygula(metin, y).metin
      const ikinci = m.YAMALAR.filter((x) => x.dosya === HARITA_KAYNAGI).map((y) => m.yamaUygula(metin, y))
      expect(ikinci.map((s) => s.durum)).toEqual(['zaten', 'zaten'])
      for (const s of ikinci) expect(s.metin).toBe(metin)
      // başlık yorumu da aynı metni taşır (ölçülen tuzak); SAYIM yalnız kod satırlarında yapılır
      const kodSatirlari = metin
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s === "import uretilmis from '@/data/generated/eski-adres-haritasi.json'")
      expect(kodSatirlari).toHaveLength(1)
    })

    it('SABOTAJ 2 — hedef iki kez geçiyorsa belirsizdir: HATA (ilkini sessizce seçmez)', () => {
      const y = m.YAMALAR[0]
      expect(() => m.yamaUygula(`${y.bul}\n${y.bul}\n`, y)).toThrow(/2 kez bulundu/)
    })

    it('SABOTAJ 3 — hedef yoksa ve yama da uygulanmamışsa HATA (sessiz geçmez; kaynak değişmiş demektir)', () => {
      const y = m.YAMALAR[0]
      expect(() => m.yamaUygula('export const BASKA = 1\n', y)).toThrow(/0 kez bulundu/)
    })

    it('CRLF dosyada eklenen satır sonları da CRLF olur (karışık satır sonu bırakılmaz)', () => {
      let metin = FIKSTUR_HARITA.replace(/\n/g, '\r\n')
      for (const y of m.YAMALAR.filter((x) => x.dosya === HARITA_KAYNAGI)) metin = m.yamaUygula(metin, y).metin
      expect(metin).not.toMatch(/(?<!\r)\n/)
      expect(metin).toContain("import uretilmis from '@/data/generated/eski-adres-haritasi.json'\r\n\r\nimport type")
    })

    it('yamalariUygula: ilk koşumda dosyaya yazar, ikinci koşumda hepsi "zaten" ve dosya bayt-bayt aynı', () => {
      const { agac } = sahteAgac()
      const ilk = m.yamalariUygula(agac)
      expect(ilk.map((s) => s.durum)).toEqual(['uygulandi', 'uygulandi', 'uygulandi'])
      const yazilan = fs.readFileSync(path.join(agac, HARITA_KAYNAGI), 'utf8')
      expect(fs.readFileSync(path.join(agac, FEATURES), 'utf8')).toMatch(/^export const ADRES_SEMASI_K3B = true$/m)
      const ikinci = m.yamalariUygula(agac)
      expect(ikinci.map((s) => s.durum)).toEqual(['zaten', 'zaten', 'zaten'])
      expect(fs.readFileSync(path.join(agac, HARITA_KAYNAGI), 'utf8')).toBe(yazilan)
    })

    it('SABOTAJ 4 — iki aşamalı: ikinci dosya bozuksa BİRİNCİ DOSYA DA yazılmaz', () => {
      const { agac } = sahteAgac({ [FEATURES]: FIKSTUR_FEATURES, [HARITA_KAYNAGI]: '// harita yaması hedefi yok\n' })
      expect(() => m.yamalariUygula(agac)).toThrow(/kez bulundu/)
      expect(fs.readFileSync(path.join(agac, FEATURES), 'utf8'), 'yarım yama bırakıldı').toBe(FIKSTUR_FEATURES)
    })

    it('yamalariGeriAl: yamalı ağaç HEAD\'e döner, üretilen harita ve boş dizin kalkar', () => {
      const { agac, head } = sahteAgac()
      m.yamalariUygula(agac)
      fs.mkdirSync(path.join(agac, m.URETILEN_DIZIN), { recursive: true })
      fs.writeFileSync(path.join(agac, m.HARITA_DOSYASI), '{}')
      const { git } = sahteGit(head)
      const s = m.yamalariGeriAl(agac, git)
      expect([...s.geriAlinan].sort()).toEqual([HARITA_KAYNAGI, FEATURES].sort())
      expect(s.atlanan).toEqual([])
      expect(fs.readFileSync(path.join(agac, FEATURES), 'utf8')).toBe(FIKSTUR_FEATURES)
      expect(fs.readFileSync(path.join(agac, HARITA_KAYNAGI), 'utf8')).toBe(FIKSTUR_HARITA)
      expect(fs.existsSync(path.join(agac, m.URETILEN_DIZIN))).toBe(false)
    })

    it('SABOTAJ 5 — geri alma EZMEZ: elle değiştirilmiş dosyaya dokunmaz ve atlananlara yazar', () => {
      const { agac, head } = sahteAgac()
      const elle = `${FIKSTUR_FEATURES}export const ELLE_YAZILDI = true\n`
      fs.writeFileSync(path.join(agac, FEATURES), elle)
      const { git, cagrilar } = sahteGit(head)
      const s = m.yamalariGeriAl(agac, git)
      expect(s.atlanan).toEqual([FEATURES])
      expect(fs.readFileSync(path.join(agac, FEATURES), 'utf8'), 'elle yazılan iş EZİLDİ').toBe(elle)
      expect(cagrilar.filter((c) => c[0] === 'checkout').length, 'temiz ya da elle değişmiş dosya için checkout çağrıldı').toBe(0)
    })

    it('yamalı + elle değişiklik karışık dosya da korunur', () => {
      const { agac, head } = sahteAgac()
      m.yamalariUygula(agac)
      const yamali = fs.readFileSync(path.join(agac, FEATURES), 'utf8')
      fs.writeFileSync(path.join(agac, FEATURES), `${yamali}export const ELLE = 1\n`)
      const s = m.yamalariGeriAl(agac, sahteGit(head).git)
      expect(s.atlanan).toContain(FEATURES)
      expect(fs.readFileSync(path.join(agac, FEATURES), 'utf8')).toContain('ELLE = 1')
    })

    it('SABOTAJ 6 — harita dosyası git izliyorsa (Faz 3-C birleşti) silinmez', () => {
      const { agac, head } = sahteAgac()
      fs.mkdirSync(path.join(agac, m.URETILEN_DIZIN), { recursive: true })
      fs.writeFileSync(path.join(agac, m.HARITA_DOSYASI), '{"izlenen":true}')
      m.yamalariGeriAl(agac, sahteGit(head, [m.HARITA_DOSYASI]).git)
      expect(fs.readFileSync(path.join(agac, m.HARITA_DOSYASI), 'utf8')).toBe('{"izlenen":true}')
    })

    it('üretilen dizinde BAŞKA dosya varsa dizin silinmez (yalnız harita dosyası gider)', () => {
      const { agac, head } = sahteAgac()
      fs.mkdirSync(path.join(agac, m.URETILEN_DIZIN), { recursive: true })
      fs.writeFileSync(path.join(agac, m.HARITA_DOSYASI), '{}')
      fs.writeFileSync(path.join(agac, m.URETILEN_DIZIN, 'baska.json'), '[]')
      m.yamalariGeriAl(agac, sahteGit(head).git)
      expect(fs.existsSync(path.join(agac, m.HARITA_DOSYASI))).toBe(false)
      expect(fs.existsSync(path.join(agac, m.URETILEN_DIZIN, 'baska.json'))).toBe(true)
    })

    it('temiz ağaçta ve .git olmayan dizinde hiçbir şey yapmaz', () => {
      const { agac, head } = sahteAgac()
      const { git, cagrilar } = sahteGit(head)
      expect(m.yamalariGeriAl(agac, git)).toEqual({ geriAlinan: [], atlanan: [] })
      expect(cagrilar.filter((c) => c[0] === 'checkout')).toEqual([])
      const gitsiz = geciciDizin()
      expect(m.yamalariGeriAl(gitsiz, git)).toEqual({ geriAlinan: [], atlanan: [] })
    })
  })

  describe('3 · tıklama listesi okuyucu', () => {
    it('gerçek belgeden 18 adres okunur; bekleyen satırlar (15-17) yeni adressiz, değişmeyen satır (9) eski = yeni, satır 18 ?sku= adresi', () => {
      const yol = m.tiklamaListesiBul(KOK)
      expect(yol, 'docs/plans/onizleme-tiklama-listesi-*.md bulunamadı').not.toBeNull()
      const liste = m.tiklamaListesiOku(fs.readFileSync(yol as string, 'utf8'))
      expect(liste.map((k) => k.no)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1))
      expect(liste[0]).toEqual({ no: 1, eski: '/tr/about', yeni: '/tr/hakkimizda' })
      expect(liste[8].eski).toBe(liste[8].yeni)
      expect(liste[9]).toEqual({ no: 10, eski: '/legal/kvkk', yeni: '/tr/yasal/kvkk-aydinlatma-metni' })
      // 11-14: eski ürün adresi → yeni ürün adresi. Hedefin model mi aile mi olduğu pilot listeye bağlıdır (bugün liste boş: aile
      // sayfası); burada ölçülmez, yoksa URUN bir model açınca bu okuyucu testi belge değişmeden kırmızıya döner.
      expect(liste.slice(10, 14).every((k) => k.eski.includes('/products/') && k.yeni !== null && /^\/(tr|en)\//.test(k.yeni))).toBe(true)
      expect(liste.slice(14, 17).map((k) => k.yeni)).toEqual([null, null, null])
      expect(liste.slice(14, 17).every((k) => k.eski.startsWith('/category/'))).toBe(true)
      // 18: eski ürün adresinin ?sku= biçimi, ailenin sayfasına tek sıçramayla gider ve sorgu düşer (URUN ölçümü, #1811).
      expect(liste[17]).toEqual({ no: 18, eski: '/tr/products/storm-serisi?sku=SEA-61143003', yeni: '/tr/urun/storm-serisi' })
    })

    it('adres olmayan tablo satırları ve başlık satırı yok sayılır', () => {
      const metin = '| # | Bugün | Sonra | Ne |\n|---|---|---|---|\n| 1 | `/a` | `/b` | x |\n| iki | `/c` | `/d` | y |\n| 3 | düz yazı | `/e` | z |\n'
      expect(m.tiklamaListesiOku(metin)).toEqual([{ no: 1, eski: '/a', yeni: '/b' }])
    })
  })

  describe('4 · ön kontrol kararları', () => {
    const YENI = '/tr/hakkimizda'
    const ESKI = '/tr/about'

    it('taşınan adres: eski TEK sıçramayla yeniye, yeni doğrudan 200 → TAMAM', async () => {
      const izle: Izle = async (a) => (a === ESKI ? tasinan(ESKI, YENI) : izSatiri(YENI))
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, izle)).durum).toBe('TAMAM')
    })

    it('dil öneksiz adres 307 ile de tek sıçrama sayılır (satır 10)', async () => {
      const yeni = '/tr/yasal/kvkk-aydinlatma-metni'
      const izle: Izle = async (a) => (a === '/legal/kvkk' ? tasinan('/legal/kvkk', yeni, 307) : izSatiri(yeni))
      expect((await m.kontrolEt({ no: 10, eski: '/legal/kvkk', yeni }, izle)).durum).toBe('TAMAM')
    })

    it('SABOTAJ 7 — İKİ sıçrama KIRMIZI (zincir; yalnız son hedef doğru olması yetmez)', async () => {
      const izle: Izle = async (a) =>
        a === ESKI ? izSatiri(ESKI, { ilk: { durum: 308, location: '/ara' }, hop: 2, sonDurum: 200, sonUrl: YENI, zincir: [308, 308, 200] }) : izSatiri(YENI)
      const s = await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, izle)
      expect(s.durum).toBe('KIRMIZI')
      expect(s.ayrinti).toContain('308→308→200')
    })

    it('SABOTAJ 8 — eski adres yönlenmiyor (200 ya da 404) KIRMIZI; yeni adres 404 KIRMIZI; yanlış hedef KIRMIZI', async () => {
      const yonlenmiyor: Izle = async (a) => (a === ESKI ? izSatiri(ESKI) : izSatiri(YENI))
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, yonlenmiyor)).durum).toBe('KIRMIZI')
      const yeni404: Izle = async (a) => (a === ESKI ? tasinan(ESKI, YENI) : izSatiri(YENI, { sonDurum: 404, zincir: [404] }))
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, yeni404)).durum).toBe('KIRMIZI')
      const yanlisHedef: Izle = async (a) => (a === ESKI ? tasinan(ESKI, '/tr/baska') : izSatiri(YENI))
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, yanlisHedef)).durum).toBe('KIRMIZI')
    })

    it('dış origin\'e yönlenme KIRMIZI (sıçrama 1 ama hedef bizim değil)', async () => {
      const izle: Izle = async (a) =>
        a === ESKI ? izSatiri(ESKI, { ilk: { durum: 308, location: 'https://baska.example/x' }, hop: 1, sonDurum: 308, sonUrl: 'https://baska.example/x', zincir: [308] }) : izSatiri(YENI)
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, izle)).durum).toBe('KIRMIZI')
    })

    it('değişmeyen adres (eski = yeni): yönlendirmesiz 200 TAMAM; yönlenirse KIRMIZI', async () => {
      const k = { no: 9, eski: '/en/about', yeni: '/en/about' }
      expect((await m.kontrolEt(k, async (a) => izSatiri(a))).durum).toBe('TAMAM')
      expect((await m.kontrolEt(k, async (a) => tasinan(a, '/en/hakkimizda'))).durum).toBe('KIRMIZI')
    })

    it('bekleyen satır (yeni adres yok): BEKLIYOR, gerçek cevap yazılır, hata sayılmaz', async () => {
      const s = await m.kontrolEt({ no: 15, eski: '/category/fanlar', yeni: null }, async (a) => tasinan(a, '/tr/kategori/fanlar'))
      expect(s.durum).toBe('BEKLIYOR')
      expect(s.ayrinti).toContain('308→200')
    })

    it('ölçülemeyen adres BİR kez daha denenir: ilk deneme zaman aşımı, ikincisi başarılı → TAMAM', async () => {
      let sayac = 0
      const izle: Izle = async (a) => {
        sayac++
        if (sayac === 1) return izSatiri(a, { hata: 'zaman-asimi', sonDurum: null, zincir: [] })
        return a === ESKI ? tasinan(ESKI, YENI) : izSatiri(YENI)
      }
      expect((await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, izle)).durum).toBe('TAMAM')
      expect(sayac).toBe(3)
    })

    it('iki deneme de başarısızsa HATA (kırmızı DEĞİL: ölçülemedi ile ihlal ayrı) ve tam iki deneme yapılır', async () => {
      let sayac = 0
      const s = await m.kontrolEt({ no: 1, eski: ESKI, yeni: YENI }, async (a) => {
        sayac++
        return izSatiri(a, { hata: 'ag: ECONNREFUSED', sonDurum: null, zincir: [] })
      })
      expect(s.durum).toBe('HATA')
      expect(s.ayrinti).toContain('2 deneme')
      expect(sayac).toBe(2)
    })

    it('özet sayımı ve tablo: her satır numarasıyla yazılır, özet satırı sayıları taşır', async () => {
      const liste = [
        { no: 1, eski: ESKI, yeni: YENI },
        { no: 2, eski: '/tr/x', yeni: '/tr/y' },
        { no: 3, eski: '/category/a', yeni: null },
      ]
      const izle: Izle = async (a) => (a === ESKI ? tasinan(ESKI, YENI) : a === '/tr/x' ? izSatiri(a) : a === YENI ? izSatiri(YENI) : izSatiri(a))
      const sonuc = await m.onKontrol(liste, izle)
      expect(m.onKontrolOzeti(sonuc)).toEqual({ toplam: 3, tamam: 1, kirmizi: 1, hata: 0, bekliyor: 1 })
      const tablo = m.onKontrolTablosu(sonuc)
      expect(tablo).toContain('ÖZET: 1 tamam · 1 kırmızı · 0 ölçülemedi · 1 bekliyor')
      for (const k of liste) expect(tablo).toContain(k.eski)
    })

    it('sunucu hazır olana kadar bekler; hiç hazır olmazsa false (sonsuz beklemez)', async () => {
      let cagri = 0
      const uyunan: number[] = []
      const hazir = await m.hazirBekle('http://x', {
        getir: async () => {
          cagri++
          if (cagri < 3) throw new Error('ECONNREFUSED')
          return { durum: 308 }
        },
        uyu: async (ms) => void uyunan.push(ms),
      })
      expect(hazir).toBe(true)
      expect(uyunan).toHaveLength(2)
      const hic = await m.hazirBekle('http://x', {
        getir: async () => {
          throw new Error('ECONNREFUSED')
        },
        uyu: async () => {},
        sureMs: 5000,
        aralikMs: 1000,
      })
      expect(hic).toBe(false)
      const sunucuHatasi = await m.hazirBekle('http://x', { getir: async () => ({ durum: 503 }), uyu: async () => {}, sureMs: 3000, aralikMs: 1000 })
      expect(sunucuHatasi, '5xx "hazır" sayıldı').toBe(false)
    })
  })

  describe('5 · derleme izi', () => {
    const BEKLENEN: Iz = { commit: 'abc', adres: true, yamaOzeti: 'ozet' }
    const SIMDI = Date.parse('2026-10-09T12:00:00Z')
    const taze = (o: Partial<Iz> = {}): Iz => ({ ...BEKLENEN, zaman: '2026-10-09T11:00:00Z', ...o })
    const gerekli = (iz: Iz | null, beklenen: Iz = BEKLENEN, derlemeVar = true) => m.derlemeGerekli(iz, beklenen, derlemeVar, { simdi: SIMDI })

    it('her şey aynıysa derleme KORUNUR; iz yoksa, derleme çıktısı yoksa yeniden derlenir', () => {
      expect(gerekli(taze())).toBe(false)
      expect(gerekli(null)).toBe(true)
      expect(gerekli(taze(), BEKLENEN, false)).toBe(true)
    })

    it('SABOTAJ 9 — KİP değişince yeniden derlenir: adres kipinin .next\'i NORMAL koşuma, normalin .next\'i adres koşumuna verilmez', () => {
      expect(gerekli(taze({ adres: false, yamaOzeti: '' }), BEKLENEN)).toBe(true)
      expect(gerekli(taze(), { commit: 'abc', adres: false, yamaOzeti: '' })).toBe(true)
    })

    it('KİP bayrağı yama özetinden BAĞIMSIZ denetlenir: özet aynı, yalnız kip farklıysa da yeniden derlenir', () => {
      expect(gerekli(taze({ adres: false }))).toBe(true)
      expect(gerekli(taze(), { ...BEKLENEN, adres: false })).toBe(true)
    })

    it('commit ya da yama özeti değişince yeniden derlenir', () => {
      expect(gerekli(taze({ commit: 'baska' }))).toBe(true)
      expect(gerekli(taze({ yamaOzeti: 'eski-tablo' }))).toBe(true)
    })

    it('iz 12 saatten eskiyse (bayat canlı veri), zamansızsa, bozuksa ya da geleceğe işaret ediyorsa yeniden derlenir', () => {
      expect(gerekli(taze({ zaman: '2026-10-08T23:59:00Z' }))).toBe(true)
      expect(gerekli(taze({ zaman: '2026-10-09T00:01:00Z' }))).toBe(false)
      expect(gerekli(taze({ zaman: undefined }))).toBe(true)
      expect(gerekli(taze({ zaman: 'bozuk' }))).toBe(true)
      expect(gerekli(taze({ zaman: '2026-10-09T13:00:00Z' }))).toBe(true)
      expect(m.IZ_OMRU_MS).toBe(12 * 60 * 60 * 1000)
    })

    it('iz yaz/oku/sil: yalnız başarıdan sonra yazılır, silinince derleme "yok" sayılır, bozuk dosya null verir', () => {
      const agac = geciciDizin()
      expect(m.izOku(agac)).toBeNull()
      m.izYaz(agac, { commit: 'c1', adres: true, yamaOzeti: 'o' })
      expect(m.izOku(agac)).toMatchObject({ commit: 'c1', adres: true, yamaOzeti: 'o' })
      expect(Date.parse(m.izOku(agac)?.zaman ?? '')).not.toBeNaN()
      m.izSil(agac)
      expect(m.izOku(agac)).toBeNull()
      m.izSil(agac) // ikinci silme hata atmaz
      fs.mkdirSync(path.dirname(m.izYolu(agac)), { recursive: true })
      fs.writeFileSync(m.izYolu(agac), '{bozuk')
      expect(m.izOku(agac)).toBeNull()
    })
  })

  describe('6 · kaynak seçimi (yerel dal mı, origin mi)', () => {
    it('SABOTAJ 10 — yerel dal origin\'in GERİSİNDEYSE origin alınır (ana deponun yerel master\'ı geride kalır)', () => {
      expect(m.kaynakSec({ yerel: 'a1', uzak: 'b2', iliski: 'yerel-geride' })).toEqual({
        commit: 'b2',
        kaynak: 'uzak',
        uyari: expect.stringContaining('gerisinde'),
      })
    })

    it('push edilmemiş yerel iş ÖNDEyse yerel korunur; eşitse yerel; ayrışmışsa yerel + uyarı', () => {
      expect(m.kaynakSec({ yerel: 'a1', uzak: 'b2', iliski: 'yerel-onde' })).toEqual({ commit: 'a1', kaynak: 'yerel', uyari: null })
      expect(m.kaynakSec({ yerel: 'a1', uzak: 'a1' })).toEqual({ commit: 'a1', kaynak: 'yerel', uyari: null })
      expect(m.kaynakSec({ yerel: 'a1', uzak: 'b2', iliski: 'ayrik' })?.uyari).toContain('AYRIŞMIŞ')
    })

    it('yalnız biri varsa o; hiçbiri yoksa null', () => {
      expect(m.kaynakSec({ yerel: 'a1', uzak: null })?.kaynak).toBe('yerel')
      expect(m.kaynakSec({ yerel: null, uzak: 'b2' })?.kaynak).toBe('uzak')
      expect(m.kaynakSec({ yerel: null, uzak: null })).toBeNull()
    })

    it('iliskiBul: atalık sorgusunun çıkış koduna göre geride / önde / ayrık (hata = ayrık)', () => {
      // çağrı biçimi: ['merge-base', '--is-ancestor', <aday ata>, <torun>]; ilk çağrıda ata = yerel ('Y'), ikincide uzak ('U')
      const sahte = (yerelAtaMi: number | null, uzakAtaMi: number | null): Git => (a) => ({
        kod: a[1] === '--is-ancestor' ? (a[2] === 'Y' ? yerelAtaMi : uzakAtaMi) : 1,
        cikti: '',
        hata: '',
      })
      expect(m.iliskiBul(sahte(0, 1), '.', 'Y', 'U')).toBe('yerel-geride')
      expect(m.iliskiBul(sahte(1, 0), '.', 'Y', 'U')).toBe('yerel-onde')
      expect(m.iliskiBul(sahte(1, 1), '.', 'Y', 'U')).toBe('ayrik')
      expect(m.iliskiBul(sahte(128, 128), '.', 'Y', 'U')).toBe('ayrik')
    })
  })

  describe('7 · derleme hatası özeti', () => {
    const UYARILAR = Array.from({ length: 40 }, (_, i) => `${i + 1}:5  Warning: Strings not allowed in JSX files: "x${i}"  react/jsx-no-literals`)

    it('yüzlerce uyarı arasından yalnız HATA satırını ve dosyasını çıkarır (ölçülen günlük: 1029 satırda tek hata)', () => {
      const gunluk = ['> next build', './src/views/Sayfa.tsx', ...UYARILAR, '', './src/lib/adres/haritaKaynagi.ts', '14:1  Error: Run autofix to sort these imports!  simple-import-sort/imports', '', 'info  - Need to disable some ESLint rules?'].join('\n')
      const ozet = m.derlemeHatasiOzetle(gunluk)
      expect(ozet).toContain('1 hata satırı')
      expect(ozet).toContain('./src/lib/adres/haritaKaynagi.ts  14:1  Error: Run autofix to sort these imports!')
      expect(ozet).not.toContain('Warning')
    })

    it('TypeScript hatası ve modül bulunamadı hataları dosyasıyla çıkar; çok hata kırpılır ve kaç tane kaldığı yazılır', () => {
      const ts = ['./src/x.ts:12:5', "Type error: Property 'a' does not exist on type 'B'.", '', './src/y.ts', "Module not found: Can't resolve './z'"].join('\n')
      const ozet = m.derlemeHatasiOzetle(ts)
      expect(ozet).toContain("./src/x.ts:12:5  Type error: Property 'a' does not exist")
      expect(ozet).toContain("./src/y.ts  Module not found: Can't resolve './z'")
      const cok = Array.from({ length: 20 }, (_, i) => `./src/f${i}.ts\n1:1  Error: kötü ${i}`).join('\n')
      const kirpik = m.derlemeHatasiOzetle(cok, 5)
      expect(kirpik).toContain('20 hata satırı')
      expect(kirpik).toContain('… ve 15 satır daha')
    })

    it('ayrıştırılabilir hata yoksa boş dönmez: günlüğün son satırlarını verir', () => {
      const ozet = m.derlemeHatasiOzetle(['a', 'b', 'çöktü: bellek yetersiz'].join('\n'))
      expect(ozet).toContain('ayrıştırılabilir hata satırı yok')
      expect(ozet).toContain('çöktü: bellek yetersiz')
      expect(m.derlemeHatasiOzetle('')).toContain('ayrıştırılabilir hata satırı yok')
    })
  })

  describe('8 · port ve ağaç kilidi', () => {
    it('portMusait: boş port true, dinlenen port false', async () => {
      const sunucu = net.createServer()
      await new Promise<void>((coz) => sunucu.listen(0, coz))
      const port = (sunucu.address() as net.AddressInfo).port
      expect(await m.portMusait(port)).toBe(false)
      await new Promise<void>((coz) => sunucu.close(() => coz()))
      expect(await m.portMusait(port)).toBe(true)
    })

    it('kilit: ilk alan alır, canlı sahip varken ikincisi REDDEDİLİR ve sahibin pid\'i söylenir', () => {
      const agac = path.join(geciciDizin(), 'agac')
      expect(m.kilitAl(agac, { pid: 111, canliMi: () => true })).toEqual({ alindi: true, sahip: 111 })
      expect(m.kilitAl(agac, { pid: 222, canliMi: () => true })).toEqual({ alindi: false, sahip: 111 })
    })

    it('bayat kilit (sahibi ölü) ya da bozuk içerik temizlenir ve kilit alınır', () => {
      const agac = path.join(geciciDizin(), 'agac')
      m.kilitAl(agac, { pid: 111, canliMi: () => true })
      expect(m.kilitAl(agac, { pid: 222, canliMi: () => false })).toEqual({ alindi: true, sahip: 222 })
      fs.writeFileSync(m.kilitYolu(agac), 'bozuk')
      expect(m.kilitAl(agac, { pid: 333, canliMi: () => true }).alindi).toBe(true)
    })

    it('kilidi yalnız SAHİBİ bırakır; başkasının kilidi silinmez; kilit ağacın YANINDA durur (.next içinde değil)', () => {
      const agac = path.join(geciciDizin(), 'agac')
      m.kilitAl(agac, { pid: 111 })
      m.kilitBirak(agac, 999)
      expect(fs.existsSync(m.kilitYolu(agac))).toBe(true)
      m.kilitBirak(agac, 111)
      expect(fs.existsSync(m.kilitYolu(agac))).toBe(false)
      m.kilitBirak(agac, 111) // kilit yokken hata atmaz
      expect(m.kilitYolu(agac)).toBe(`${agac}.kilit`)
      expect(m.kilitYolu(agac)).not.toContain('.next')
    })

    it('pidCanliMi: bu süreç canlı, olmayan süreç değil', () => {
      expect(m.pidCanliMi(process.pid)).toBe(true)
      expect(m.pidCanliMi(2 ** 22 + 12345)).toBe(false)
    })
  })

  describe('9 · betik kolu (scripts/onizleme.mjs)', () => {
    const k = fs.readFileSync(BETIK, 'utf8')
    /** Yorum satırları çıkarılmış hal: anahtar adlarını SAYARKEN açıklama metni karışmasın. */
    const kod = k
      .split('\n')
      .filter((s) => !/^\s*(\*|\/\/|\/\*)/.test(s))
      .join('\n')
    const sira = (parca: string): number => {
      const i = k.indexOf(parca)
      expect(i, `betikte yok: ${parca}`).toBeGreaterThanOrEqual(0)
      return i
    }

    it('anon rol denetimi yama, harita ve derleme adımlarından ÖNCE yapılır', () => {
      const rol = sira("jwtRolu(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) !== 'anon'")
      expect(rol).toBeLessThan(sira('yamalariUygula(ONIZLEME_AGACI)'))
      expect(rol).toBeLessThan(sira('haritaUret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY'))
      expect(rol).toBeLessThan(sira('await derle(secenek)'))
    })

    it('harita üreticisine ANON anahtar verilir; sunucu anahtarı adı betikte tek yerde geçer', () => {
      expect(kod).toMatch(/SUPABASE_SERVICE_ROLE_KEY: anonAnahtar/)
      expect(kod.split('SUPABASE_SERVICE_ROLE_KEY').length - 1, 'sunucu anahtarı adı kodda beklenenden fazla yerde geçiyor').toBe(1)
    })

    it('NEXT_PUBLIC_ADRES_DILI yalnız `if (adres)` ile atanır; izin listesine (ortamSuz) girmez', async () => {
      expect(kod).toMatch(/if \(adres\) surecOrtami\.NEXT_PUBLIC_ADRES_DILI = '1'/)
      expect(kod.match(/NEXT_PUBLIC_ADRES_DILI\s*=/g)?.length ?? 0, 'ikinci bir atama var').toBe(1)
      const b = (await import(pathToFileURL(BETIK).href)) as {
        ortamSuz: (s: Record<string, string>, o: { url: string; anonAnahtar: string; port: number }) => Record<string, string>
      }
      const o = b.ortamSuz({ PATH: '/bin', NEXT_PUBLIC_ADRES_DILI: '1' }, { url: 'https://x.supabase.co', anonAnahtar: 'a.b.c', port: 3100 })
      expect(Object.keys(o)).not.toContain('NEXT_PUBLIC_ADRES_DILI')
    })

    it('yamalar derleme BİTİNCE geri alınır ve iz yalnız başarılı derlemeden SONRA yazılır', () => {
      const derleme = sira('await derle(secenek)')
      const geriAl = sira('if (adres) yamalariGeriAlUyarili()')
      const hata = sira('if (sonuc.kod !== 0)')
      const iz = sira('izYaz(ONIZLEME_AGACI, beklenen)')
      expect(derleme).toBeLessThan(geriAl)
      expect(geriAl).toBeLessThan(hata) // derleme çökse bile yamalar önce geri alınır
      expect(hata).toBeLessThan(iz)
      expect(sira('izSil(ONIZLEME_AGACI)')).toBeLessThan(derleme)
    })

    it('çıkışta (hata, Ctrl+C) yamalar geri alınır ve kilit bırakılır', () => {
      const cikis = k.slice(sira("process.on('exit'"), sira("process.on('SIGINT'"))
      expect(cikis).toContain('yamalariGeriAl(ONIZLEME_AGACI, git)')
      expect(cikis).toContain('kilitBirak(ONIZLEME_AGACI)')
      expect(k).toMatch(/process\.on\('SIGINT', \(\) => process\.exit\(130\)\)/)
    })

    it('kilit ağaca dokunmadan ÖNCE alınır; port denetimi derlemeden ÖNCE; yamalar kilitten SONRA', () => {
      const kilit = sira('kilitAl(ONIZLEME_AGACI)')
      expect(kilit).toBeLessThan(sira("'--detach', commit"))
      expect(kilit).toBeLessThan(sira('yamalariGeriAlUyarili() //'))
      expect(sira('await portMusait(port)')).toBeLessThan(sira('await derle(secenek)'))
      expect(kilit).toBeLessThan(sira('yamalariUygula(ONIZLEME_AGACI)'))
    })

    it('kaynak tazeliği: origin çekilir ve yerel/uzak ilişkisi kaynakSec\'e verilir; yerel dal hâlâ commit olarak ayrık alınır', () => {
      expect(k).toContain("git(['fetch', 'origin', dal], depo)")
      expect(k).toContain('iliskiBul(git, depo, yerelCommit, uzakCommit)')
      expect(k).toMatch(/refs\/heads\/\$\{dal\}\^\{commit\}/)
      expect(k).toContain("'--detach', commit")
    })

    it('ön kontrol yalnız adres kipinde ve sunucu başladıktan sonra çalışır; kırmızı sonuç süreci düşürmez', () => {
      expect(k).toContain('if (adres) await adresOnKontrolu(port)')
      expect(sira('sunucu.on(')).toBeLessThan(sira('if (adres) await adresOnKontrolu(port)'))
      const govde = k.slice(sira('async function adresOnKontrolu'), sira('async function ana('))
      expect(govde).not.toContain('process.exit')
      expect(govde).not.toContain('dur(')
    })

    it('tıklama listesi aracın KENDİ ağacından okunur (orada yoksa ön izlenen ağaçtan); tam tarama ön kontrolden SONRA ve try/catch içinde', () => {
      expect(k).toMatch(/const BU_AGAC = path\.resolve\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\), '\.\.'\)/)
      const govde = k.slice(sira('async function adresOnKontrolu'), sira('async function ana('))
      expect(govde).toContain('tiklamaListesiBul(BU_AGAC) ?? tiklamaListesiBul(ONIZLEME_AGACI)')
      const tablo = govde.indexOf('onKontrolTablosu(sonuclar)')
      const tarama = govde.indexOf('await tamTarama(taban)')
      expect(tablo, 'ön kontrol tablosu basılmıyor').toBeGreaterThanOrEqual(0)
      expect(tarama, 'tam tarama çağrılmıyor').toBeGreaterThan(tablo)
      const denemeBolumu = govde.slice(govde.indexOf('try {'), govde.indexOf('catch (e)'))
      expect(denemeBolumu, 'tam tarama try bloğunun dışında: çöken tarama ön izlemeyi düşürür').toContain('await tamTarama(taban)')
      expect(k, 'eski "ayrı terminalde" ipucu geri gelmiş (tam tarama artık aynı komutta)').not.toContain('ayrı terminalde')
    })
  })

  describe('10 · tam tarama özeti', () => {
    const TABLO_SATIRLARI = '| Grup | Adres | Beklenen | Gerçek | Durum |\n|---|---|---|---|---|\n| rota-dili-yeni | `/tr/x` | 200 | 200 (son 200, sıçrama 0) | OK |'
    const OZET = 'TARAMA http://localhost:3100: 1 beklenti · OK 1 · KIRMIZI 0 · HATA 0 · BEKLİYOR 0'

    it('taramaOzetiSatirlari: tabloyu atar; PİLOT LİSTE, SORUNLU ve TARAMA satırlarını sırayla korur', () => {
      const girdi = [
        TABLO_SATIRLARI,
        '\nSORUNLU SATIRLAR',
        '  KIRMIZI /tr/x · beklenen: 200 · gerçek: 404 (son 404, sıçrama 0)',
        '\nPİLOT LİSTE (yayındaki modeller): 0 model + 0 sürüm açık.',
        OZET,
      ]
      expect(m.taramaOzetiSatirlari(girdi)).toEqual(girdi.slice(1))
      expect(m.taramaOzetiSatirlari([])).toEqual([])
    })

    it('tamTarama: betiğe --taban verir, yazılanı ve hata mesajını toplar, tabloyu atar, çıkış kodunu döndürür', async () => {
      let alinan: string[] = []
      const tara: Tarayici = async (argumanlar, bag) => {
        alinan = argumanlar
        bag.yaz(TABLO_SATIRLARI)
        bag.hata('onizleme-tarama: model listesi okunamadı')
        bag.yaz(OZET)
        return 2
      }
      const s = await m.tamTarama('http://localhost:3100', tara)
      expect(alinan).toEqual(['--taban', 'http://localhost:3100'])
      expect(s.kod).toBe(2)
      expect(s.satirlar).toEqual(['onizleme-tarama: model listesi okunamadı', OZET])
    })

    it('tarama betiği çökerse hata çağırana ULAŞIR (başlatıcı yakalar; sessizce yutulmaz)', async () => {
      const tara: Tarayici = async () => {
        throw new Error('beklenmeyen')
      }
      await expect(m.tamTarama('http://x', tara)).rejects.toThrow('beklenmeyen')
    })

    it('gerçek tarayıcı yüklenir (betik yolu taşınırsa burada kırmızı olur) ve bir işlevdir', () => {
      expect(typeof m.gercekTarayici()).toBe('function')
    })
  })
})
