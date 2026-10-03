// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-ONCEKI-CALISMA-1..13 · iş başı "önceki çalışma" taraması (ARC-30 / OPS-30).
 *
 * Olay 2026-10-03: 09-23'te üretilen 442 model adres listesi, 10-03'te iki pencerede sıfırdan üretildi. Kart araması CSV'yi
 * bulamıyordu, ham `grep REC-300` commit'leri bulamıyordu, sage kördü. Betik beş kaynağı paralel tarar ve sonucu İLK
 * SATIRA yazar. Bu kapı davranışı ölçer: üç sonucun (BULUNDU / YOK / ÖLÇÜLEMEDİ) birbirine karışmaması, kimlik
 * normalleştirme, yaygın sözcüğün tek başına bulgu sayılmaması, kaynak çökünce kalanların yaşaması, kendi kartın
 * dışlanması, süre tavanı, sayacın DEPO DIŞINA yazılması.
 *
 * Kaynaklar ENJEKTE edilir: gerçek Kanban/sage/Linear CI'da yok, testin kendisi onlara bağlı olsaydı hiçbir şey ölçmezdi.
 */

interface Bulgu {
  tur: string
  yol?: string
  hash?: string
  kimlik?: string
  skor: number
}
interface Kaynak {
  durum: 'tamam' | 'olculemedi' | 'atlandi'
  arandi: number
  bulgular: Bulgu[]
  sebep?: string
}
interface Sonuc {
  sonuc: 'bulgu-var' | 'bulgu-yok' | 'olculemedi'
  ilk: string
  toplam: number
  sure_ms: number
  kaynaklar: Record<'dosya' | 'git' | 'kanban' | 'sage' | 'linear', Kaynak>
}
interface Commit {
  hash: string
  tarih: string
  konu: string
}
interface Kart {
  identifier: string
  title: string
  status: string
  serit: string
  labels: string[]
}
interface Baglar {
  dosyalar: (ms: number) => Promise<string[]>
  gitLog: (ms: number) => Promise<Commit[]>
  silinmisYollar: (ms: number) => Promise<{ yol: string; hash: string; tarih: string }[]>
  kanban: (ms: number) => Promise<Kart[]>
  daemonCanli: () => boolean
  portAc: () => Promise<{ searchSage: (q: string, o: object) => Promise<{ id: string; text: string }[]> } | null>
  linearAnahtar: string
  linearGetir: (terim: string, ms: number) => Promise<{ identifier: string; title: string; durum: string }[]>
}
interface Kayit {
  ts: string
  sid: string
  kart: string | null
  anahtar: string
  kaynaklar: Record<string, number | string>
  sonuc: string
  sure_ms: number
  bulunan: string[]
  tip?: string
  kesisim?: { bulunan: string; yazilan: string }[]
  sebep?: string
}
interface Modul {
  kimlikleriCikar: (metin: string) => string[]
  tara: (metin: string, o: { baglar: Baglar; haric?: string[]; derin?: boolean; butceMs?: number }) => Promise<Sonuc>
  taramaKaydi: (s: Sonuc, o: { sid: string; kart?: string; anahtar: string }) => Kayit
  defteriYaz: (k: object, o: { yol: string; ortam: Record<string, string>; kokler?: string[] }) => { yazildi: boolean; sebep?: string }
  govdeAnahtari: (yol: string) => string
  tekrarUretimOlc: (o: { sid: string; defter: string; pano: string }) => null | { kayit: Kayit }
  gercekBaglar: () => Baglar
  calistir: (argv: string[], o: { baglar: Baglar & { kapat?: () => void }; ortam: Record<string, string> }) => Promise<{ kod: number; cikti: string }>
}

const KOK = process.cwd()
const BETIK = path.resolve(KOK, 'scripts', 'arac', 'onceki-calisma.cjs')
const mod = createRequire(import.meta.url)(BETIK) as Modul

const CSV = 'docs/plans/rec300-model-adres-listesi-2026-09-23.csv'
const KONU = 'URUN (REC-300): 442 model adres listesi 2026-09-23 — Casals K17 kısa aile adresleri'

function baglar(o: Partial<Baglar> = {}): Baglar {
  return {
    dosyalar: async () => [],
    gitLog: async () => [],
    silinmisYollar: async () => [],
    kanban: async () => [],
    daemonCanli: () => false,
    portAc: async () => null,
    linearAnahtar: '',
    linearGetir: async () => [],
    ...o,
  }
}

const temizlenecek: string[] = []
function gecici(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'onceki-calisma-'))
  temizlenecek.push(d)
  return d
}
afterEach(() => {
  for (const d of temizlenecek.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

describe('INV-ONCEKI-CALISMA-1: kimlik normalleştirme (REC-300 = rec300 = "rec 300")', () => {
  it('üç yazım aynı kimliğe iner; kimlik olmayanlar kimlik sayılmaz', () => {
    expect(mod.kimlikleriCikar('REC-300')).toEqual(['rec300'])
    expect(mod.kimlikleriCikar('rec300 model adres')).toEqual(['rec300'])
    expect(mod.kimlikleriCikar('rec 300 için')).toEqual(['rec300'])
    expect(mod.kimlikleriCikar('Rec-300 ve ARC30 ve arc-30 ve ARC-30')).toEqual(['rec300', 'arc30'])
    expect(mod.kimlikleriCikar('UTF-8 ve SHA-256 ve alt 2 adım ve model 3')).toEqual([])
  })
})

describe('INV-ONCEKI-CALISMA-2: gerçek vakadaki gibi dosya + commit varsa ilk satır BULUNDU', () => {
  it('kimlik yazımı farklı olsa da (rec300 / REC-300) CSV ve commit bulunur', async () => {
    const s = await mod.tara('rec300 model adres listesi', {
      baglar: baglar({
        dosyalar: async () => [CSV, 'src/app/page.tsx', 'docs/plans/baska-bir-sey.md'],
        gitLog: async () => [
          { hash: '6290dd2b0', tarih: '2026-09-24', konu: KONU },
          { hash: 'abcdef123', tarih: '2026-09-25', konu: 'ALTYAPI: ilgisiz bir değişiklik' },
        ],
      }),
    })
    expect(s.sonuc).toBe('bulgu-var')
    expect(s.ilk.startsWith('ÖNCEKİ ÇALIŞMA: BULUNDU ')).toBe(true)
    expect(s.ilk).toContain(CSV)
    expect(s.ilk).toContain('6290dd2b0')
    expect(s.ilk).not.toContain('\n')
  })
})

describe('INV-ONCEKI-CALISMA-3: BULUNDU, YOK ve ÖLÇÜLEMEDİ birbirine karışmaz', () => {
  const bulundu = () => baglar({ dosyalar: async () => [CSV] })
  const yok = () => baglar({ dosyalar: async () => ['src/app/page.tsx'] })
  const bozuk = () =>
    baglar({
      dosyalar: async () => ['src/app/page.tsx'],
      kanban: async () => {
        throw new Error('kanban veritabanı yok')
      },
    })

  it('üç durumun ilk satırı üç ayrı önekle başlar', async () => {
    const a = await mod.tara('rec300 model adres listesi', { baglar: bulundu() })
    const b = await mod.tara('rec300 model adres listesi', { baglar: yok() })
    const c = await mod.tara('rec300 model adres listesi', { baglar: bozuk() })
    expect(a.ilk.startsWith('ÖNCEKİ ÇALIŞMA: BULUNDU ')).toBe(true)
    expect(b.ilk.startsWith('ÖNCEKİ ÇALIŞMA: YOK (')).toBe(true)
    expect(b.ilk).toContain('ifade:')
    expect(c.ilk.startsWith('ÖNCEKİ ÇALIŞMA: ÖLÇÜLEMEDİ (')).toBe(true)
    expect(new Set([a.sonuc, b.sonuc, c.sonuc]).size).toBe(3)
  })

  it('çekirdek kaynak ölçülemediyse "YOK" denmez; sebep ilk satırda görünür', async () => {
    const c = await mod.tara('rec300 model adres listesi', { baglar: bozuk() })
    expect(c.sonuc).toBe('olculemedi')
    expect(c.ilk).not.toContain('YOK')
    expect(c.ilk).toContain('kanban')
    expect(c.ilk).toContain('kanban veritabanı yok')
  })

  it('ayırt edici dayanağı olmayan kısa ifade "YOK" değil ÖLÇÜLEMEDİ döner', async () => {
    const s = await mod.tara('yap şunu', { baglar: yok() })
    expect(s.sonuc).toBe('olculemedi')
    expect(s.ilk).toContain('ifade')
  })
})

describe('INV-ONCEKI-CALISMA-4: yaygın sözcük tek başına bulgu sayılmaz', () => {
  it('"model" ve "adres" ayrı ayrı geçen yol bulgu DEĞİL; üçü birlikte geçen bulgu', async () => {
    const s = await mod.tara('model adres listesi', {
      baglar: baglar({
        dosyalar: async () => ['src/lib/model.ts', 'src/lib/adres.ts', 'src/lib/model-adres.ts', 'docs/model-adres-listesi.csv'],
      }),
    })
    const yollar = s.kaynaklar.dosya.bulgular.map((b) => b.yol)
    expect(yollar).toEqual(['docs/model-adres-listesi.csv'])
  })
})

describe('INV-ONCEKI-CALISMA-5: bir kaynak çökünce diğerleri sonuç verir', () => {
  it('git hata verir, dosya yine bulur; çöken kaynak ölçülemedi diye işaretlenir', async () => {
    const s = await mod.tara('rec300 model adres listesi', {
      baglar: baglar({
        dosyalar: async () => [CSV],
        gitLog: async () => {
          throw new Error('git çöktü')
        },
      }),
    })
    expect(s.sonuc).toBe('bulgu-var')
    expect(s.kaynaklar.dosya.bulgular.length).toBe(1)
    expect(s.kaynaklar.git.durum).toBe('olculemedi')
    expect(s.kaynaklar.git.sebep).toContain('git çöktü')
  })
})

describe('INV-ONCEKI-CALISMA-6: --haric kendi kartını dışlar', () => {
  const kartlar: Kart[] = [
    { identifier: 'ARC-30', title: 'ARC-30 · önceki çalışma taraması tek komut', status: 'In Progress', serit: 'ARAC', labels: [] },
  ]
  const emir = 'ARC-30 önceki çalışma taraması tek komut'

  it('haric verilmezse kendi kartı "bulunmuş" görünür (kontrast)', async () => {
    const s = await mod.tara(emir, { baglar: baglar({ kanban: async () => kartlar }) })
    expect(s.kaynaklar.kanban.bulgular.length).toBe(1)
  })

  it('haric verilince kendi kartı hiçbir kaynakta bulgu olmaz', async () => {
    const s = await mod.tara(emir, {
      baglar: baglar({
        kanban: async () => kartlar,
        gitLog: async () => [{ hash: 'aaaaaaaaa', tarih: '2026-10-03', konu: 'ARAC (ARC-30): önceki çalışma taraması tek komut' }],
      }),
      haric: ['ARC-30'],
    })
    expect(s.kaynaklar.kanban.bulgular).toEqual([])
    expect(s.kaynaklar.git.bulgular).toEqual([])
    expect(s.sonuc).toBe('bulgu-yok')
  })
})

describe('INV-ONCEKI-CALISMA-7: süre tavanı asılı kaynağı keser', () => {
  it('hiç dönmeyen git kaynağı ölçülemedi olur ve tarama tavanda biter', async () => {
    const t0 = Date.now()
    const s = await mod.tara('rec300 model adres listesi', {
      baglar: baglar({ dosyalar: async () => [CSV], gitLog: () => new Promise<Commit[]>(() => {}) }),
      butceMs: 80,
    })
    expect(Date.now() - t0).toBeLessThan(2000)
    expect(s.kaynaklar.git.durum).toBe('olculemedi')
    expect(s.kaynaklar.git.sebep).toContain('süre aşıldı')
    expect(s.sonuc).toBe('bulgu-var')
  }, 5000)
})

describe('INV-ONCEKI-CALISMA-8: sayaç satırı biçimi ve depo dışı yazım', () => {
  const ornek = async () =>
    mod.tara('rec300 model adres listesi', { baglar: baglar({ dosyalar: async () => [CSV] }) })

  it('satır alanları sabit ve tarama sonucu özetlenir', async () => {
    const k = mod.taramaKaydi(await ornek(), { sid: 'sid-1', kart: 'ARC-30', anahtar: 'rec300 model adres listesi' })
    expect(Object.keys(k).sort()).toEqual(['anahtar', 'bulunan', 'kart', 'kaynaklar', 'sid', 'sonuc', 'sure_ms', 'ts'])
    expect(k.sonuc).toBe('bulgu-var')
    expect(Object.keys(k.kaynaklar)).toEqual(['dosya', 'git', 'kanban', 'sage', 'linear'])
    expect(k.kaynaklar.dosya).toBe(1)
    expect(k.bulunan).toEqual([CSV])
    expect(Number.isNaN(Date.parse(k.ts))).toBe(false)
  })

  it('depo dışı yola yalnız-ekleme yazar', async () => {
    const d = gecici()
    const yol = path.join(d, 'dis', 'defter.jsonl')
    const k = mod.taramaKaydi(await ornek(), { sid: 's', anahtar: 'a' })
    const kokler = [path.join(d, 'depo')]
    expect(mod.defteriYaz(k, { yol, ortam: { VENTHUB_ONCEKI_CALISMA_DEFTER: yol }, kokler }).yazildi).toBe(true)
    expect(mod.defteriYaz(k, { yol, ortam: { VENTHUB_ONCEKI_CALISMA_DEFTER: yol }, kokler }).yazildi).toBe(true)
    expect(fs.readFileSync(yol, 'utf8').trim().split('\n').length).toBe(2)
  })

  it('depo İÇİNE yazmayı reddeder (repo PUBLIC) ve dosya oluşmaz', async () => {
    const d = gecici()
    const depo = path.join(d, 'depo')
    const yol = path.join(depo, 'docs', 'sayac.jsonl')
    const k = mod.taramaKaydi(await ornek(), { sid: 's', anahtar: 'a' })
    const r = mod.defteriYaz(k, { yol, ortam: { VENTHUB_ONCEKI_CALISMA_DEFTER: yol }, kokler: [depo] })
    expect(r.yazildi).toBe(false)
    expect(r.sebep).toContain('depo')
    expect(fs.existsSync(yol)).toBe(false)
  })

  it('test ortamında açık yol verilmeden varsayılan deftere (~/.claude) yazmaz', async () => {
    const k = mod.taramaKaydi(await ornek(), { sid: 's', anahtar: 'a' })
    const r = mod.defteriYaz(k, { yol: path.join(gecici(), 'x.jsonl'), ortam: { VITEST: '1' }, kokler: [] })
    expect(r.yazildi).toBe(false)
  })
})

describe('INV-ONCEKI-CALISMA-9: tekrar-üretim ölçümü (--sayac)', () => {
  function kur(denetim: object | null, bulunan: string[]) {
    const d = gecici()
    const defter = path.join(d, 'defter.jsonl')
    const pano = path.join(d, 'pano')
    fs.mkdirSync(pano)
    fs.writeFileSync(defter, JSON.stringify({ sid: 'abcdef12-0000', sonuc: 'bulgu-var', bulunan }) + '\n')
    if (denetim) fs.writeFileSync(path.join(pano, '.bash-audit-abcdef12.json'), JSON.stringify(denetim))
    return { defter, pano }
  }

  it('gövde anahtarı dizin, uzantı ve tarihi atar', () => {
    expect(mod.govdeAnahtari('docs/plans/rec300-model-adres-listesi-2026-09-23.csv')).toBe(
      mod.govdeAnahtari('C:/x/rec300-model-adres-listesi-2026-10-03.csv'),
    )
    expect(mod.govdeAnahtari('docs/plans/a-b-2026-09-23.csv')).not.toBe(mod.govdeAnahtari('docs/plans/a-c-2026-09-23.csv'))
  })

  it('aynı gövdeli dosya oturumda yeniden yazılmışsa tekrar-var', () => {
    const { defter, pano } = kur({ yollar: ['C:/repo::docs/plans/rec300-model-adres-listesi-2026-10-03.csv'], bildirilen: [] }, [CSV])
    const r = mod.tekrarUretimOlc({ sid: 'abcdef12-0000', defter, pano })
    expect(r?.kayit.tip).toBe('tekrar-uretim')
    expect(r?.kayit.sonuc).toBe('tekrar-var')
    expect(r?.kayit.kesisim?.[0].bulunan).toBe(CSV)
  })

  it('ilgisiz dosya yazıldıysa yok; denetim verisi okunamıyorsa YOK değil olculemedi', () => {
    const a = kur({ yollar: ['C:/repo::src/baska.ts'], bildirilen: [] }, [CSV])
    expect(mod.tekrarUretimOlc({ sid: 'abcdef12-0000', ...a })?.kayit.sonuc).toBe('yok')
    const b = kur(null, [CSV])
    const r = mod.tekrarUretimOlc({ sid: 'abcdef12-0000', ...b })
    expect(r?.kayit.sonuc).toBe('olculemedi')
    expect(r?.kayit.sebep).toContain('okunamadı')
  })

  it('oturumda bulgulu tarama yoksa ölçülecek bir şey yoktur (null)', () => {
    const { defter, pano } = kur({ yollar: [], bildirilen: [] }, [])
    expect(mod.tekrarUretimOlc({ sid: 'abcdef12-0000', defter, pano })).toBeNull()
  })
})

describe('INV-ONCEKI-CALISMA-10: gerçek git bağları (ağsız, süreç dışı)', () => {
  it('dosya listesi ve commit konuları gerçek depodan gelir', async () => {
    const b = mod.gercekBaglar()
    const dosyalar = await b.dosyalar(20000)
    expect(dosyalar).toContain('package.json')
    const commitler = await b.gitLog(20000)
    expect(commitler.length).toBeGreaterThan(0)
    expect(commitler[0].hash).toMatch(/^[0-9a-f]{7,}$/)
    expect(commitler[0].tarih).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  }, 30000)
})

describe('INV-ONCEKI-CALISMA-11: komut satırı', () => {
  it('emir metni verilmezse kullanım yazar ve 2 ile çıkar', () => {
    const r = spawnSync(process.execPath, [BETIK], { encoding: 'utf8', env: { ...process.env, VITEST: '1' } })
    expect(r.status).toBe(2)
    expect(r.stdout).toContain('kullanım')
  })
})

describe('INV-ONCEKI-CALISMA-13: sage ana süreci dondurmaz, çocuk süreç tarama sonunda kapatılır', () => {
  it('calistir bitince bağın kapat() çağrılır (çıkış 0, ilk satır yazılı)', async () => {
    let kapatildi = 0
    const b = { ...baglar({ dosyalar: async () => [CSV] }), kapat: () => void kapatildi++ }
    const r = await mod.calistir(['rec300 model adres listesi', '--sid', 'x'], { baglar: b, ortam: { VITEST: '1' } })
    expect(r.kod).toBe(0)
    expect(r.cikti.startsWith('ÖNCEKİ ÇALIŞMA: BULUNDU ')).toBe(true)
    expect(r.cikti).toContain('sayaç yazılmadı')
    expect(kapatildi).toBe(1)
  })

  it('gerçek bağ sage paketini ana süreçte YÜKLEMEZ (senkron require olay döngüsünü dondurur; soğukta ~3 sn ölçüldü)', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const govde = kaynak.slice(kaynak.indexOf('function gercekBaglar'), kaynak.indexOf('// ───────────────────────── sayaç'))
    expect(govde).toContain("'--sage-cocuk'")
    expect(govde).not.toMatch(/gercekPortAc\(/)
  })
})

describe('INV-ONCEKI-CALISMA-12: hafıza yardımcıları KOPYALANMAZ, require edilir', () => {
  it('betik hafiza-enjeksiyonu.cjs yardımcılarını kullanır ve onlar dışa aktarılıyor', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    expect(kaynak).toContain("require('../hijyen/hafiza-enjeksiyonu.cjs')")
    const hafiza = createRequire(import.meta.url)(path.resolve(KOK, 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs')) as Record<string, unknown>
    for (const ad of ['katla', 'icerikTerimleri', 'ortakTerimSayisi', 'zamanAsimi', 'daemonCanliMi', 'gercekPortAc']) {
      expect(typeof hafiza[ad]).toBe('function')
    }
    expect(typeof hafiza.ZAMAN_ASIMI).toBe('symbol')
    expect(kaynak).not.toMatch(/function\s+(katla|icerikTerimleri|ortakTerimSayisi|zamanAsimi)\b/)
  })
})
