/**
 * INV-BAYAT-KARAR-1 (ARC-274) — scripts/board/bayat-karar-denetimi.cjs
 *
 * Olay (8 Kasım): OPS, Recep'e onay listesinde üç bayat `karar-bekliyor` kartı sundu (PR'ları zaten kapalı/birleşmiş,
 * iş 27 Ekim'de yapılmış, kanca 16 Ekim'den beri çalışıyor). Denetim yalnız UYARIR; ağ ve pano enjekte edilir (gerçek gh/pano yok).
 */
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const BETIK = path.resolve(__dirname, '..', '..', '..', 'scripts', 'board', 'bayat-karar-denetimi.cjs')

type Kart = { title: string; description?: string; bagimliliklar?: Array<{ status: string | null }> }
type Sonuc = { neden: string[]; guc: 'bayat' | 'kismen' | null; olculemedi: string[] }
const m = gerek(BETIK) as {
  atifsizMetin: (metin: string) => string
  ghPrDurumu: (n: number, calistir?: unknown) => string | null
  prNumaralari: (metin: string) => number[]
  kartNumaralari: (metin: string, haric?: string | null) => string[]
  degerlendir: (kart: Kart, prDurum: Record<number, string | null>, kartDurum: Record<string, string>) => Sonuc
  satirYaz: (no: string | null, baslik: string, sonuc: Sonuc) => string
  tara: (g: {
    etiket?: string
    oku: (arg: string[]) => Array<{ task: Record<string, unknown> }>
    prOku: (n: number) => string | null
  }) => { satirlar: string[]; taranan: number; uyari: number; olculemedi: boolean }
}

describe('INV-BAYAT-KARAR-1: PR ve kart numarası çıkarma', () => {
  it('#NNNN PR sayılır; kelime içi ve kısa sayılar sayılmaz', () => {
    expect(m.prNumaralari('PR #2327 ve (#2330), a#12, "ürün #3", sayfa&#1234; #99999')).toEqual([2327, 2330, 99999])
    expect(m.prNumaralari('')).toEqual([])
  })

  it('kart numarası kendisi hariç çıkar; INV-3D-7 gibi anma kart sayılmaz', () => {
    expect(m.kartNumaralari('OPS-235 · ALT-165 ve KTL-67; INV-3D-7', 'OPS-235')).toEqual(['ALT-165', 'KTL-67'])
  })
})

describe('INV-BAYAT-KARAR-1: degerlendir (olay biçimleri)', () => {
  it('OLAY OPS-235 biçimi: anılan PR\'ların hepsi MERGED/CLOSED -> bayat', () => {
    const s = m.degerlendir({ title: 'OPS-235 · üç PR kararı', description: '#2327 birleştir, #2330 kapat' }, { 2327: 'MERGED', 2330: 'CLOSED' }, {})
    expect(s.guc).toBe('bayat')
    expect(s.neden[0]).toContain('#2327 MERGED')
    expect(s.neden[0]).toContain('#2330 CLOSED')
  })

  it('PR\'lardan biri hâlâ açık -> bayat DEĞİL, kısmen', () => {
    const s = m.degerlendir({ title: 'OPS-1', description: '#10000 ve #10001' }, { 10000: 'MERGED', 10001: 'OPEN' }, {})
    expect(s.guc).toBe('kismen')
  })

  it('tüm PR\'lar açıksa uyarı yok (taze kart)', () => {
    const s = m.degerlendir({ title: 'OPS-2', description: '#2400' }, { 2400: 'OPEN' }, {})
    expect(s.guc).toBeNull()
  })

  it('PR durumu ölçülemediyse (null) bayat hükmü VERİLMEZ ve ölçülemedi listelenir', () => {
    const s = m.degerlendir({ title: 'OPS-3', description: '#2500 #2501' }, { 2500: 'MERGED', 2501: null }, {})
    expect(s.guc).toBe('kismen')
    expect(s.olculemedi).toEqual(['#2501'])
  })

  it('OLAY OPS-193 biçimi: bağımlılıkların hepsi tamamlandı -> bayat', () => {
    const s = m.degerlendir({ title: 'OPS-193 · bellek', description: '', bagimliliklar: [{ status: 'completed' }, { status: 'completed' }] }, {}, {})
    expect(s.guc).toBe('bayat')
    const yarim = m.degerlendir({ title: 'OPS-193', bagimliliklar: [{ status: 'completed' }, { status: 'pending' }] }, {}, {})
    expect(yarim.guc).toBeNull()
  })

  it('anılan kartların hepsi Done ise kısmen bayat; biri bile açıksa uyarı yok; bilinmeyen kart sayılmaz', () => {
    const durum = { 'ALT-165': 'done', 'OPS-240': 'done', 'URN-1': 'todo' }
    expect(m.degerlendir({ title: 'OPS-242', description: 'ALT-165 ve OPS-240' }, {}, durum).guc).toBe('kismen')
    expect(m.degerlendir({ title: 'OPS-243', description: 'ALT-165 ve URN-1' }, {}, durum).guc).toBeNull()
    expect(m.degerlendir({ title: 'OPS-244', description: 'SHA-256 ve ALT-165' }, {}, durum).guc).toBe('kismen')
  })

  it('ARC-274 denetçi bulgusu: ÖNCEKİ ÇALIŞMA / KAYNAK / KİM İSTEDİ / YÖNTEM atıfları kanıt sayılmaz (satır içi etiketler dahil)', () => {
    const aciklama =
      'KİM İSTEDİ: OPS. YÖNTEM: elle. KAYNAK/CETVEL: yok. ÖNCEKİ ÇALIŞMA: #2327 ve #2330 birleşti, ALT-165 Done. NE: yeni iş bekliyor.'
    expect(m.atifsizMetin(aciklama)).not.toContain('#2327')
    expect(m.atifsizMetin(aciklama)).not.toContain('ALT-165')
    expect(m.atifsizMetin(aciklama)).toContain('NE: yeni iş bekliyor')
    const s = m.degerlendir({ title: 'OPS-242 · temizlik', description: aciklama }, { 2327: 'MERGED', 2330: 'MERGED' }, { 'ALT-165': 'done' })
    expect(s.guc).toBeNull()
    // etiket dışı gövdedeki anma hâlâ sayılır
    const g = m.degerlendir({ title: 'OPS-243', description: 'ÖNCEKİ ÇALIŞMA: yok. NE: #2327 ve #2330 kapat' }, { 2327: 'MERGED', 2330: 'CLOSED' }, {})
    expect(g.guc).toBe('bayat')
  })

  it('ARC-274 denetçi bulgusu: tek kapalı PR, RECEP YETKİSİ ya da "sıradaki" işareti "bayat"ı "kısmen"e düşürür', () => {
    const iki = { 2327: 'MERGED', 2330: 'MERGED' }
    expect(m.degerlendir({ title: 'OPS-1', description: '#2327' }, { 2327: 'MERGED' }, {}).guc).toBe('kismen')
    expect(m.degerlendir({ title: 'ALT-76', description: '#2327 #2330 RECEP YETKİSİ: migration birleştirme' }, iki, {}).guc).toBe('kismen')
    expect(m.degerlendir({ title: 'REC-394 · sıradaki C14', description: '#2327 #2330' }, iki, {}).guc).toBe('kismen')
    expect(m.degerlendir({ title: 'OPS-2', description: '#2327 #2330' }, iki, {}).guc).toBe('bayat')
  })

  it('ghPrDurumu: closed+merged -> MERGED, closed -> CLOSED, open -> OPEN, hata -> null (enjekte gh)', () => {
    const gh = (cikti: string | Error) => (() => {
      if (cikti instanceof Error) throw cikti
      return cikti
    }) as unknown
    const f = m.ghPrDurumu as (n: number, c: unknown) => string | null
    expect(f(2327, gh('closed true\n'))).toBe('MERGED')
    expect(f(2327, gh('closed false'))).toBe('CLOSED')
    expect(f(2327, gh('open false'))).toBe('OPEN')
    expect(f(2327, gh(new Error('HTTP 404')))).toBeNull()
    expect(f(2327, gh('garip çıktı'))).toBeNull()
  })

  it('PR\'da ön ek: url#1234 ve a#1234 PR sayılmaz', () => {
    expect(m.prNumaralari('bkz https://x/y#1234 ve a#5678')).toEqual([])
  })

  it('satır biçimi: bayat/kısmen öneki ve neden', () => {
    const s = m.degerlendir({ title: 'OPS-235 · x', description: '#2327 #2330' }, { 2327: 'MERGED', 2330: 'CLOSED' }, {})
    expect(m.satirYaz('OPS-235', 'OPS-235 · x', s)).toMatch(/^BAYAT olabilir: OPS-235 — anılan PR/)
    expect(m.satirYaz('OPS-1', 'OPS-1', { neden: ['x'], guc: 'kismen', olculemedi: [] })).toMatch(/^KISMEN bayat olabilir: OPS-1/)
  })
})

describe('INV-BAYAT-KARAR-1: tara (sahte pano ve gh)', () => {
  const kart = (no: string, description: string, ek: Record<string, unknown> = {}) => ({
    task: { title: `${no} · deneme`, description, sutun: 'To Do', ...ek },
  })
  const oku = (adaylar: ReturnType<typeof kart>[], hepsi: ReturnType<typeof kart>[] = []) => (arg: string[]) =>
    arg.includes('--detay') ? adaylar : hepsi

  it('bayat kart uyarılır, taze kart uyarılmaz; sayılar doğru', () => {
    const s = m.tara({
      oku: oku([kart('OPS-235', '#2327'), kart('OPS-236', '#2400')]),
      prOku: (n) => (n === 2327 ? 'MERGED' : 'OPEN'),
    })
    expect(s.taranan).toBe(2)
    expect(s.uyari).toBe(1)
    expect(s.satirlar[0]).toContain('OPS-235')
  })

  it('Done sütunundaki anılan kart panonun tamamından okunur', () => {
    const s = m.tara({
      oku: oku([kart('OPS-242', 'ALT-165')], [kart('ALT-165', '', { sutun: 'Done' })]),
      prOku: () => null,
    })
    expect(s.uyari).toBe(1)
  })

  it('ARC-274 denetçi bulgusu: aynı numara iki kartta farklı sütundaysa o numara "Done" sayılmaz (sıraya bağlı hüküm yok)', () => {
    const s = m.tara({
      oku: oku([kart('OPS-242', 'ALT-165 işi')], [kart('ALT-165', '', { sutun: 'Done' }), kart('ALT-165', '', { sutun: 'To Do' })]),
      prOku: () => null,
    })
    expect(s.uyari).toBe(0)
  })

  it('PR_AZAMI: sınırı aşan PR sayısında yalnız sınır kadar gh çağrılır ve ölçülemedi satırı çıkar', () => {
    const cok = Array.from({ length: 33 }, (_, i) => `#${3000 + i}`).join(' ')
    const sorulan: number[] = []
    const s = m.tara({
      oku: oku([kart('OPS-77', cok)]),
      prOku: (n) => {
        sorulan.push(n)
        return 'OPEN'
      },
    })
    expect(sorulan).toHaveLength(30)
    expect(s.satirlar.join('\n')).toMatch(/3 PR sınır nedeniyle bakılmadı/)
  })

  it('pano okunamazsa SESSİZ "bayat yok" demez, ölçülemedi satırı basar', () => {
    const s = m.tara({
      oku: () => {
        throw new Error('pano dosyası yok')
      },
      prOku: () => null,
    })
    expect(s.olculemedi).toBe(true)
    expect(s.satirlar[0]).toMatch(/^ölçülemedi: pano okunamadı/)
  })

  it('gh yanıt vermezse (null) o PR hükme katılmaz ve ölçülemedi satırı çıkar', () => {
    const s = m.tara({ oku: oku([kart('OPS-9', '#2600')]), prOku: () => null })
    expect(s.uyari).toBe(0)
    expect(s.satirlar.join('\n')).toMatch(/ölçülemedi: PR durumu okunamadı \(#2600\)/)
  })
})
