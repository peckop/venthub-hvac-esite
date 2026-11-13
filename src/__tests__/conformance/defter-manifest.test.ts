/**
 * HRT-126 (OPS-258 adım 2): docs/defter/manifest.json yapı kapısı ve rol kartı "Sürekli defterler" satırı.
 * Cetvel: docs/standards/departman-defter-standard.md D6. Kapı sabotajla doğrulanır: her kural bozulunca en az bir sorun çıkar.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '..', '..', '..')
const req = createRequire(import.meta.url)

interface Defter {
  ad: string
  dosya: string
  sahip: string
  ozet: string
  izlenen: string[]
  tazelikGun: number
  tetik: string[]
  olcum: string | null
  kaynakIzi?: string
  disKaynak: string | null
  durum: string
}
interface Manifest {
  sema: number
  defterler: Defter[]
}

const dm = req(path.join(KOK, 'scripts', 'belge', 'defter-manifest.cjs')) as {
  oku: (kok?: string) => Manifest | null
  sorunlar: (m: unknown, o: { roller: string[]; varMi: (y: string) => boolean }) => string[]
  kartBolumu: (rol: string, m: unknown) => string
}
const uretici = req(path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')) as {
  ROLLER: Record<string, unknown>
  KART_AMAC_TAVANI: number
  defterBolumu: (ad: string, m?: unknown) => string
  uret: () => Record<string, string>
  defterDusenRoller: (m?: unknown) => string[]
  kart: (ad: string, r: unknown, amacKartta: boolean, defterler: unknown) => string
}

const roller = Object.keys(uretici.ROLLER)
const varMi = (y: string) => fs.existsSync(path.join(KOK, y))
const gercek = (): Manifest => JSON.parse(fs.readFileSync(path.join(KOK, 'docs', 'defter', 'manifest.json'), 'utf8')) as Manifest
const kopya = (): Manifest => structuredClone(gercek())
const sorun = (m: unknown) => dm.sorunlar(m, { roller, varMi })

describe('defter manifest yapı kapısı', () => {
  it('gerçek manifest okunur ve temizdir; en az bir kayıt taşır', () => {
    const m = dm.oku()
    expect(m, 'manifest okunamadı').not.toBeNull()
    expect(m!.defterler.length).toBeGreaterThan(0)
    expect(sorun(m)).toEqual([])
  })

  it('SABOTAJ: her kural bozulunca kapı kırmızı verir (kör kapı değil)', () => {
    const bozmalar: Array<[string, (m: Manifest) => unknown, RegExp]> = [
      ['manifest yok', () => null, /okunamadı/],
      ['sema 2', (m) => ({ ...m, sema: 2 }), /sema 1/],
      ['defterler dizi değil', (m) => ({ ...m, defterler: {} }), /dizi/],
      ['ad tekrar', (m) => (m.defterler.push({ ...m.defterler[0], dosya: 'docs/defter/baska.md' }), m), /ad tekrar/],
      ['aynı dosya iki kayıtta', (m) => (m.defterler.push({ ...m.defterler[0], ad: 'baska-ad' }), m), /aynı dosya/],
      ['ad büyük harf', (m) => ((m.defterler[0].ad = 'Urun_Adres'), m), /ad küçük harf/],
      ['sahip geçersiz', (m) => ((m.defterler[0].sahip = 'YOKROL'), m), /sahip/],
      ['dosyasız pilot', (m) => ((m.defterler[0].dosya = 'docs/defter/olmayan-defter-xyz.md'), (m.defterler[0].durum = 'pilot'), m), /dosya yok/],
      ['dosya docs dışında', (m) => ((m.defterler[0].dosya = 'src/x.md'), m), /docs\//],
      ['ozet boş', (m) => ((m.defterler[0].ozet = ''), m), /ozet/],
      ['izlenen boş', (m) => ((m.defterler[0].izlenen = []), m), /izlenen boş/],
      ['izlenen geniş glob', (m) => ((m.defterler[0].izlenen = ['docs/**']), m), /çok geniş/],
      ['izlenen yok', (m) => ((m.defterler[0].izlenen = ['docs/olmayan-dosya-xyz.md']), m), /depoda yok/],
      ['izlenen mutlak yol', (m) => ((m.defterler[0].izlenen = ['/etc/passwd']), m), /depo göreli/],
      ['tazelikGun 0', (m) => ((m.defterler[0].tazelikGun = 0), m), /tazelikGun/],
      ['tetik tek', (m) => ((m.defterler[0].tetik = ['sure']), m), /tetik/],
      ['tetik bilinmeyen', (m) => ((m.defterler[0].tetik = ['sure', 'rastgele']), m), /tetik/],
      ['durum bilinmeyen', (m) => ((m.defterler[0].durum = 'belki'), m), /durum/],
      ['aktif ama olcum null', (m) => ((m.defterler[0].durum = 'aktif'), (m.defterler[0].olcum = null), m), /olcum/],
      ['kaynakIzi boş string', (m) => ((m.defterler[0].olcum = 'node x'), (m.defterler[0].kaynakIzi = ' '), m), /kaynakIzi/],
      ['kaynakIzi var ama olcum null', (m) => ((m.defterler[0].olcum = null), (m.defterler[0].kaynakIzi = 'node x --iz'), m), /kaynakIzi varsa olcum/],
      ['disKaynak var tetik dis-kaynak yok', (m) => ((m.defterler[0].disKaynak = 'gsc'), (m.defterler[0].tetik = ['kart-kapanisi', 'sure']), m), /dis-kaynak/],
      ['disKaynak bilinmeyen', (m) => ((m.defterler[0].disKaynak = 'bilinmeyen'), m), /disKaynak/],
    ]
    for (const [ad, boz, desen] of bozmalar) {
      const s = sorun(boz(kopya())).join('\n')
      expect(s, `SABOTAJ TUTMADI: ${ad}`).toMatch(desen)
    }
  })

  it('dar glob geçer: sabit önek iki parçalı dizin', () => {
    const m = kopya()
    m.defterler[0].izlenen = ['scripts/seo/*.mjs']
    expect(sorun(m)).toEqual([])
  })
})

describe('rol kartı "Sürekli defterler" bölümü', () => {
  const m = (...d: Array<Partial<Defter>>): Manifest => ({
    sema: 1,
    defterler: d.map((x, i) => ({ ad: `d${i}`, dosya: `docs/defter/d${i}.md`, sahip: 'URUN', ozet: 'bir cümlelik özet', izlenen: ['next.config.mjs'], tazelikGun: 14, tetik: ['kart-kapanisi', 'sure'], olcum: null, disKaynak: null, durum: 'pilot', ...x })),
  })

  it('planlı ve emekli defter kartta görünmez; defteri olmayan rolde bölüm yok', () => {
    expect(dm.kartBolumu('URUN', m({ durum: 'planli' }))).toBe('')
    expect(dm.kartBolumu('URUN', m({ durum: 'emekli' }))).toBe('')
    expect(dm.kartBolumu('BLOG', m({}))).toBe('')
    expect(dm.kartBolumu('URUN', null)).toBe('')
  })

  it('pilot/aktif/kontrolsuz görünür; en çok iki ad, fazlası +N', () => {
    const tek = dm.kartBolumu('URUN', m({ ad: 'urun-adres', dosya: 'docs/defter/urun-adres.md' }))
    expect(tek).toContain('## Sürekli defterler')
    expect(tek).toContain('urun-adres')
    expect(tek).not.toContain('+')
    const uc = dm.kartBolumu('URUN', m({ durum: 'pilot' }, { durum: 'aktif' }, { durum: 'kontrolsuz' }))
    expect(uc).toContain('d0')
    expect(uc).toContain('d1')
    expect(uc).not.toContain('d2')
    expect(uc).toContain('+1')
  })

  it('üretici bölümü kullanır; gerçek kartlar manifestle tutarlı (bölüm yalnız görünür durumlu defteri olan rolde)', () => {
    const manifest = gercek()
    const kartlar = uretici.uret()
    for (const rol of roller) {
      const beklenen = dm.kartBolumu(rol, manifest)
      if (beklenen) expect(kartlar[rol], `${rol} kartında bölüm yok`).toContain(beklenen)
      else expect(kartlar[rol], `${rol} kartında beklenmeyen bölüm`).not.toContain('## Sürekli defterler')
    }
    expect(uretici.defterBolumu('URUN', m({}))).toContain('## Sürekli defterler')
  })

  it('BAYT: en kötü durumda (üç uzun ad) hiçbir rolün kartı fiilî tavanı aşmaz; sığmayan rolde satır düşer, Amaç geri çekilebilen rolde Amaç çekilir', () => {
    const uzun = 'a'.repeat(30)
    const asanlar: string[] = []
    for (const rol of roller) {
      const mf = m(...Array.from({ length: 3 }, (_, i) => ({ ad: `${uzun}${i}`, sahip: rol })))
      // Gerçek akış: amacKarttaMi kartı satırla ölçer (true), sığmazsa Amaç görev dosyasına işaret eder (false).
      const amacKartta = Buffer.byteLength(uretici.kart(rol, uretici.ROLLER[rol], true, mf), 'utf8') <= uretici.KART_AMAC_TAVANI
      const bayt = Buffer.byteLength(uretici.kart(rol, uretici.ROLLER[rol], amacKartta, mf), 'utf8')
      if (bayt > uretici.KART_AMAC_TAVANI) asanlar.push(`${rol}:${bayt}`)
    }
    expect(asanlar, `tavan (${uretici.KART_AMAC_TAVANI}) aşıldı`).toEqual([])
  })

  it('GÖRÜNÜR DÜŞME (OPS kararı 9 Kasım: kartlara pay açılmaz): defter satırı hangi rolün kartında düşer? Liste açık yazılı, değişirse test bilerek değiştirilir', () => {
    // Bugünkü kart baytlarıyla tek defterli (12 karakter ad) her rol için ölçülmüş küme: EDGE (pay 12 B) ve YETENEK (pay 17 B).
    const KARTA_SIGMAYAN = ['EDGE', 'YETENEK']
    const hepsi = (ad: string): Manifest => ({
      sema: 1,
      defterler: roller.map((r) => m({ ad, sahip: r }).defterler[0]),
    })
    expect(uretici.defterDusenRoller(hepsi('abcdefghijkl'))).toEqual(KARTA_SIGMAYAN)
    // Gerçek manifestte düşen rol, yukarıdaki bilinen kümenin dışına çıkarsa: sessiz kayıp, karar gerekir.
    const gercekDusen = uretici.defterDusenRoller(gercek())
    expect(gercekDusen.filter((r) => !KARTA_SIGMAYAN.includes(r)), 'bilinmeyen rolde defter satırı kartta düştü').toEqual([])
    if (gercekDusen.length) console.warn(`[defter] kartta satırı düşen rol (manifest + açılış satırı kaynak): ${gercekDusen.join(', ')}`)
  })

  it('pilot roller (URUN, GEO-SEO) tek defterle satırı kartta taşır; yer olmayan rolde (EDGE) satır düşer ama kart tavanın altında kalır', () => {
    for (const [rol, ad] of [['URUN', 'urun-adres'], ['GEO-SEO', 'geo-seo-dizin']]) {
      const mf = m({ ad, sahip: rol })
      const amacKartta = Buffer.byteLength(uretici.kart(rol, uretici.ROLLER[rol], true, mf), 'utf8') <= uretici.KART_AMAC_TAVANI
      expect(uretici.kart(rol, uretici.ROLLER[rol], amacKartta, mf), `${rol} kartında satır yok`).toContain('## Sürekli defterler')
    }
    const edgeMf = m({ ad: 'edge-defter', sahip: 'EDGE' })
    const edge = uretici.kart('EDGE', uretici.ROLLER.EDGE, true, edgeMf)
    expect(Buffer.byteLength(edge, 'utf8')).toBeLessThanOrEqual(uretici.KART_AMAC_TAVANI)
  })
})
