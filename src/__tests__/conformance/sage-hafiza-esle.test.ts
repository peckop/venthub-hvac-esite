// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SAGE-HAFIZA-ESLE-1..9 — konu hafızası .md dosyalarını sage'e dosya çapalı kısa kayıt olarak
 * eşleyen köprü (ARC-23a).
 *
 * ⭐GERÇEK DAEMON YOK, GERÇEK HAFIZA YOK: port ENJEKTE edilir (çağrıları kaydeden sahte port);
 * kaynak dizin ve depo kökü geçici dizinde kurulan SENTETİK fikstürdür. Repo PUBLIC olduğundan
 * testte gerçek hafıza metni kullanılmaz.
 *
 * ⭐HER KOLUN SABOTAJI VAR: kritik satır bozulduğunda ilgili test KIRMIZIYA döner (sabotaj tablosu
 * teslim raporunda). Koda bakarak sınama kanıt sayılmaz.
 *
 * Cetvel: docs/standards/hafiza-kancalari-standard.md
 */
const KOK = process.cwd()
const require_ = createRequire(import.meta.url)

interface Capa {
  type: string
  path: string
}
interface SahteKayit {
  id: string
  status: string
  text: string
  kind: string
  tags: string[]
  anchors: Capa[]
}
interface RememberGirdisi {
  text: string
  kind: string
  scope: string
  persistence: string
  importance: number
  confidence: number
  tags: string[]
  anchors: Capa[]
}
interface UpdateYamasi {
  text?: string
  kind?: string
  tags?: string[]
  anchors?: Capa[]
}
interface Port {
  listSage: (durumlar: string[]) => Promise<SahteKayit[]>
  rememberSage: (g: RememberGirdisi) => Promise<SahteKayit>
  updateSage: (id: string, y: UpdateYamasi) => Promise<SahteKayit>
}
interface Sayilar {
  taranan: number
  eklendi: number
  guncellendi: number
  degismedi: number
  capasiz: number
  haric: number
  kaldirilmis: number
  bos: number
  hata: number
}
interface Rapor {
  durum: string
  yaz: boolean
  sayilar: Sayilar
  ornekler: { islem: string; ad: string; kind: string; capalar: string[]; metin: string }[]
  hatalar: string[]
}
type YolTuru = (rel: string) => 'file' | 'directory' | null
interface Modul {
  METIN_TAVANI: number
  EN_FAZLA_CAPA: number
  haricMi: (ad: string) => boolean
  varsayilanYolTuru: (kok: string) => YolTuru
  capalariCikar: (govde: string, yolTuru: YolTuru) => Capa[]
  kayitKur: (
    ad: string,
    icerik: string,
    yolTuru: YolTuru,
  ) => { durum: string; kayit?: { text: string; kind: string; tags: string[]; anchors: Capa[] } }
  esle: (p: {
    hafizaDizini: string
    yolTuru: YolTuru
    daemonCanli: () => boolean
    portAc: () => Promise<Port | null>
    yaz?: boolean
  }) => Promise<Rapor>
  gercekPortAc: (dbKok: string) => Promise<Port | null>
}

const M = require_(path.join(KOK, 'scripts', 'hijyen', 'sage-hafiza-esle.cjs')) as Modul
const BETIK = path.join(KOK, 'scripts', 'hijyen', 'sage-hafiza-esle.cjs')
const KAYNAK = fs.readFileSync(BETIK, 'utf8')

// ── FİKSTÜR ───────────────────────────────────────────────────────────────────

const geciciDizin = (ad: string): string => fs.mkdtempSync(path.join(os.tmpdir(), `vh-esle-${ad}-`))

function yaz(kok: string, rel: string, icerik: string): void {
  const tam = path.join(kok, ...rel.split('/'))
  fs.mkdirSync(path.dirname(tam), { recursive: true })
  fs.writeFileSync(tam, icerik, 'utf8')
}

/** Sentetik depo: yalnız bu dosyalar VAR. */
function depoKur(): string {
  const kok = geciciDizin('depo')
  yaz(kok, 'src/lib/Hedef.ts', 'export const x = 1\n')
  yaz(kok, 'src/lib/diger.ts', 'export const y = 2\n')
  yaz(kok, 'scripts/araclar/ornek.cjs', '// ornek\n')
  yaz(kok, 'docs/standards/ornek-standard.md', '# ornek\n')
  return kok
}

function md(o: { tip?: string; aciklama?: string; govde: string; ad?: string }): string {
  const fm = ['---', `name: ${o.ad ?? 'ornek'}`]
  if (o.aciklama !== undefined) fm.push(`description: "${o.aciklama.replace(/"/g, '\\"')}"`)
  fm.push('metadata:')
  if (o.tip) fm.push(`  type: ${o.tip}`)
  fm.push('---', '', o.govde, '')
  return fm.join('\n')
}

/** Çağrıları kaydeden sahte sage portu (etiketleri küçük harfe çevirir: gerçek sage gibi). */
function sahtePort(
  baslangic: SahteKayit[] = [],
  secenek: { listeHata?: boolean; yazmaHata?: (metin: string) => boolean } = {},
): {
  port: Port
  kayitlar: SahteKayit[]
  cagri: { liste: number; remember: RememberGirdisi[]; update: [string, UpdateYamasi][] }
  portAc: () => Promise<Port>
  acilan: () => number
} {
  const kayitlar = [...baslangic]
  const cagri = { liste: 0, remember: [] as RememberGirdisi[], update: [] as [string, UpdateYamasi][] }
  let acilan = 0
  const kucult = (t: string[]): string[] => t.map((x) => x.toLowerCase())
  const port: Port = {
    listSage: async () => {
      cagri.liste++
      if (secenek.listeHata) throw new Error('IPC koptu')
      return kayitlar
    },
    rememberSage: async (g) => {
      cagri.remember.push(g)
      if (secenek.yazmaHata?.(g.text)) throw new Error('yazma reddedildi')
      const k: SahteKayit = {
        id: `ID${kayitlar.length + 1}`,
        status: 'active',
        text: g.text,
        kind: g.kind,
        tags: kucult(g.tags),
        anchors: g.anchors,
      }
      kayitlar.push(k)
      return k
    },
    updateSage: async (id, y) => {
      cagri.update.push([id, y])
      const k = kayitlar.find((x) => x.id === id)
      if (!k) throw new Error('kayit yok')
      if (y.text !== undefined) k.text = y.text
      if (y.kind !== undefined) k.kind = y.kind
      if (y.tags) k.tags = kucult(y.tags)
      if (y.anchors) k.anchors = y.anchors
      return k
    },
  }
  return {
    port,
    kayitlar,
    cagri,
    acilan: () => acilan,
    portAc: async () => {
      acilan++
      return port
    },
  }
}

async function kos(
  hafiza: string,
  depo: string,
  f: ReturnType<typeof sahtePort>,
  yazKipi = false,
  canli = true,
): Promise<Rapor> {
  return M.esle({
    hafizaDizini: hafiza,
    yolTuru: M.varsayilanYolTuru(depo),
    daemonCanli: () => canli,
    portAc: f.portAc,
    yaz: yazKipi,
  })
}

/** Kayıt metni tavanı — DEĞERİYLE sabit (modülün sabiti değişirse bu test kırmızıya döner). */
const TAVAN = 700

const GOVDE_CAPALI ='Bu kural `src/lib/Hedef.ts` dosyasinda uygulanir ve `scripts/araclar/ornek.cjs` ile birlikte okunur.'

// ── INV-1: kapsam ─────────────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-1 · kapsam: hariç dosyalar köprüye GİRMEZ; konu + olcum/ girer', () => {
  it('MEMORY.md · dizin-* · ops-cycle-audit-state · son-konusma-* · *-serit-durumu · *lane-day* hariç (çapalı olsalar da)', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('kapsam')
    const capali = md({ tip: 'project', aciklama: 'Sentetik konu.', govde: GOVDE_CAPALI })
    // GİREN
    yaz(hafiza, 'konu-bir.md', capali)
    yaz(hafiza, 'olcum/defter-bir.md', capali)
    // HARİÇ (hepsi çapalı: çapa yüzünden DEĞİL kapsam yüzünden dışarıda kalmalı)
    const hariclar = [
      'MEMORY.md',
      'dizin-ornek.md',
      'ops-cycle-audit-state.md',
      'son-konusma-2026-10-01.md',
      'admin-serit-durumu.md',
      'admin-lane-day-state-2026-09-29.md',
    ]
    for (const h of hariclar) yaz(hafiza, h, capali)
    // taranmayan alt klasörler
    yaz(hafiza, 'arsiv/eski.md', capali)
    yaz(hafiza, 'belge-yonetimi-devir/devir.md', capali)
    yaz(hafiza, 'gunluk/gun.md', capali)

    for (const h of hariclar) expect(M.haricMi(h), `${h} hariç sayılmadı`).toBe(true)
    expect(M.haricMi('konu-bir.md')).toBe(false)

    const f = sahtePort()
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.haric).toBe(hariclar.length)
    expect(r.sayilar.taranan).toBe(2)
    expect(f.cagri.remember.map((g) => g.tags[0]).sort()).toEqual(['kaynak:konu-bir.md', 'kaynak:olcum/defter-bir.md'])
  })
})

// ── INV-2: çapa ───────────────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-2 · çapasız kayıt köprüye GİRMEZ (sayısı raporda)', () => {
  it('yalnız olmayan yol / mutlak yol / glob / yol-benzeri-olmayan belirteç → capasiz; remember çağrılmaz', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('capasiz')
    yaz(
      hafiza,
      'capasiz-bir.md',
      md({
        tip: 'feedback',
        aciklama: 'Sentetik.',
        govde: 'Yok: `src/lib/olmayan.ts`, mutlak `C:/Users/x/dosya.ts`, glob `src/**/*.ts`, sade `kelime`, surum `1.0.26`.',
      }),
    )
    yaz(hafiza, 'capasiz-iki.md', md({ tip: 'project', govde: 'Hic backtick yok, duz bir metin burada duruyor.' }))
    yaz(hafiza, 'capali.md', md({ tip: 'project', aciklama: 'Capali.', govde: GOVDE_CAPALI }))

    const f = sahtePort()
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.capasiz, 'çapasız dosyalar sayılmadı').toBe(2)
    expect(f.cagri.remember).toHaveLength(1)
    expect(f.cagri.remember[0].tags).toContain('kaynak:capali.md')
  })

  it('çapa çıkarma: var olan dosya + dizin girer; :satır soneki atılır; yanlış büyük-küçük harf, ./, tekrar ve üretilmiş dizin DIŞARIDA', () => {
    const depo = depoKur()
    const yolTuru = M.varsayilanYolTuru(depo)
    const govde = [
      '`src/lib/Hedef.ts:42`',
      '`./scripts/araclar/ornek.cjs`',
      '`docs/standards/`',
      '`src/lib/hedef.ts`', // yanlış harf: Windows existsSync yalan söylerdi
      '`src/lib/Hedef.ts`', // tekrar
      '`node_modules/pkg/index.js`',
      '`src/lib/olmayan.ts`',
    ].join(' ')
    const capalar = M.capalariCikar(govde, yolTuru)
    expect(capalar).toEqual([
      { type: 'file', path: 'src/lib/Hedef.ts' },
      { type: 'file', path: 'scripts/araclar/ornek.cjs' },
      { type: 'directory', path: 'docs/standards' },
    ])
  })

  it('çapa sayısı EN_FAZLA_CAPA ile sınırlı (ilk geçiş sırasıyla)', () => {
    const depo = depoKur()
    for (let i = 0; i < 12; i++) yaz(depo, `docs/dosya-${i}.md`, 'x')
    const govde = Array.from({ length: 12 }, (_, i) => `\`docs/dosya-${i}.md\``).join(' ')
    const capalar = M.capalariCikar(govde, M.varsayilanYolTuru(depo))
    expect(capalar).toHaveLength(M.EN_FAZLA_CAPA)
    expect(capalar[0].path).toBe('docs/dosya-0.md')
  })
})

// ── INV-3: biçim ──────────────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-3 · biçim: ≤700 karakter, gövde kopyalanmaz, etiket/kind/çapa/persistence', () => {
  const yolTuru: YolTuru = (rel) => (rel === 'src/lib/Hedef.ts' ? 'file' : null)

  it('çok uzun açıklama: 700 karakteri AŞMAZ, kaynak satırı sonda kalır', () => {
    expect(M.METIN_TAVANI, 'tavan sayısı değeriyle (konu kancasının DERS_BASINA_KARAKTER değeri)').toBe(TAVAN)
    const uzunAciklama = 'Sentetik uzun aciklama sozcugu '.repeat(60)
    expect(uzunAciklama.length).toBeGreaterThan(TAVAN)
    const r = M.kayitKur('uzun.md', md({ tip: 'project', aciklama: uzunAciklama, govde: GOVDE_CAPALI }), yolTuru)
    expect(r.durum).toBe('hazir')
    const text = r.kayit?.text ?? ''
    expect(text.length).toBeLessThanOrEqual(TAVAN)
    expect(text.endsWith('\nKaynak: uzun.md')).toBe(true)
  })

  it('kısa açıklama + uzun gövde: cümleler BÜTÜN eklenir ya da hiç eklenmez; gövde kopyalanmaz', () => {
    const cumle = (n: number): string => `Govde cumlesi numara ${n} ` + 'ek sozcuk '.repeat(14) + 'burada biter.'
    const govde = [GOVDE_CAPALI, ...Array.from({ length: 12 }, (_, i) => cumle(i + 1))].join(' ')
    const r = M.kayitKur('govde.md', md({ tip: 'project', aciklama: 'Kisa sentetik aciklama.', govde }), yolTuru)
    const text = r.kayit?.text ?? ''
    expect(text.length).toBeLessThanOrEqual(TAVAN)
    expect(text.startsWith('Kisa sentetik aciklama.')).toBe(true)
    expect(text, 'gövdenin sonu kopyalandı').not.toContain('numara 12')
    // eklenen her gövde cümlesi tam: "burada biter." ile bitmeyen yarım cümle yok
    const govdeKismi = text.replace('Kisa sentetik aciklama.', '').replace(/\nKaynak: .*$/, '').trim()
    for (const parca of govdeKismi.split(/(?<=\.)\s+/).filter(Boolean)) {
      expect(parca.endsWith('burada biter.') || parca === GOVDE_CAPALI, `yarım cümle: ${parca.slice(-30)}`).toBe(true)
    }
  })

  it('etiketler, kind eşlemesi, çapa tipi', () => {
    const al = (tip: string | undefined) => M.kayitKur('k.md', md({ tip, aciklama: 'Sentetik.', govde: GOVDE_CAPALI }), yolTuru).kayit
    expect(al('feedback')?.kind).toBe('convention')
    expect(al('project')?.kind).toBe('fact')
    expect(al('reference')?.kind).toBe('fact')
    expect(al(undefined)?.kind, 'bilinmeyen tip fact olmalı').toBe('fact')
    const k = al('project')
    expect(k?.tags[0]).toBe('kaynak:k.md')
    expect(k?.tags.some((t) => /^ozet:[0-9a-f]{12}$/.test(t))).toBe(true)
    expect(k?.anchors).toEqual([{ type: 'file', path: 'src/lib/Hedef.ts' }])
  })

  it('yazılan kayıt: persistence long_lived, scope project, çapalı, ≤700', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('bicim')
    yaz(hafiza, 'bir.md', md({ tip: 'feedback', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    await kos(hafiza, depo, f, true)
    expect(f.cagri.remember).toHaveLength(1)
    const g = f.cagri.remember[0]
    expect(g.persistence).toBe('long_lived')
    expect(g.scope).toBe('project')
    expect(g.kind).toBe('convention')
    expect(g.anchors.map((a) => a.path)).toEqual(['src/lib/Hedef.ts', 'scripts/araclar/ornek.cjs'])
    expect(g.text.length).toBeLessThanOrEqual(TAVAN)
  })
})

// ── INV-4: idempotens ─────────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-4 · idempotens: ikinci koşum YENİ KAYIT AÇMAZ; değişen içerik güncellenir', () => {
  it('aynı içerikte ikinci koşum remember/update çağırmaz (değişmedi); içerik değişince AYNI id güncellenir', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('idem')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Birinci surum.', govde: GOVDE_CAPALI }))
    yaz(hafiza, 'iki.md', md({ tip: 'feedback', aciklama: 'Ikinci dosya.', govde: GOVDE_CAPALI }))
    const f = sahtePort()

    const bir = await kos(hafiza, depo, f, true)
    expect(bir.sayilar.eklendi).toBe(2)
    expect(f.kayitlar).toHaveLength(2)

    const iki = await kos(hafiza, depo, f, true)
    expect(iki.sayilar.eklendi, 'ikinci koşum yeniden yazdı').toBe(0)
    expect(iki.sayilar.guncellendi).toBe(0)
    expect(iki.sayilar.degismedi).toBe(2)
    expect(f.cagri.remember, 'ikinci koşum yeni kayıt açtı').toHaveLength(2)
    expect(f.cagri.update).toHaveLength(0)
    expect(f.kayitlar).toHaveLength(2)

    // içerik değişir → aynı kayıt güncellenir, yeni kayıt açılmaz
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Degisen surum.', govde: GOVDE_CAPALI }))
    const uc = await kos(hafiza, depo, f, true)
    expect(uc.sayilar.guncellendi).toBe(1)
    expect(uc.sayilar.degismedi).toBe(1)
    expect(f.cagri.update).toHaveLength(1)
    expect(f.cagri.update[0][0]).toBe('ID1')
    expect(f.cagri.update[0][1].text).toContain('Degisen surum.')
    expect(f.kayitlar, 'güncelleme yeni kayıt üretti').toHaveLength(2)

    // çapa kümesi değişince de güncellenir
    yaz(
      hafiza,
      'iki.md',
      md({ tip: 'feedback', aciklama: 'Ikinci dosya.', govde: GOVDE_CAPALI + ' Ayrica `src/lib/diger.ts`.' }),
    )
    const dort = await kos(hafiza, depo, f, true)
    expect(dort.sayilar.guncellendi).toBe(1)
    expect(f.kayitlar.find((k) => k.id === 'ID2')?.anchors.map((a) => a.path)).toContain('src/lib/diger.ts')
  })

  it('bilerek kaldırılmış (deleted/archived) kayıt DİRİLTİLMEZ', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('kaldirilmis')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort([{ id: 'OLU1', status: 'deleted', text: 'eski', kind: 'fact', tags: ['kaynak:bir.md'], anchors: [] }])
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.kaldirilmis).toBe(1)
    expect(f.cagri.remember).toHaveLength(0)
    expect(f.cagri.update).toHaveLength(0)
  })
})

// ── INV-5: kuru kip ───────────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-5 · kuru kip varsayılandır: HİÇBİR yazma çağrısı yok; sayılar + ilk 5 örnek', () => {
  it('yaz=false → remember/update çağrılmaz, sayılar "eklenecek", örnek en çok 5 ve metni taşır', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('kuru')
    for (let i = 1; i <= 7; i++) {
      yaz(hafiza, `konu-${i}.md`, md({ tip: 'project', aciklama: `Sentetik aciklama ${i}.`, govde: GOVDE_CAPALI }))
    }
    const f = sahtePort()
    const r = await kos(hafiza, depo, f, false)
    expect(r.yaz).toBe(false)
    expect(f.cagri.remember).toHaveLength(0)
    expect(f.cagri.update).toHaveLength(0)
    expect(f.kayitlar).toHaveLength(0)
    expect(r.sayilar.eklendi).toBe(7)
    expect(r.ornekler).toHaveLength(5)
    expect(r.ornekler[0].metin).toContain('Sentetik aciklama 1.')
    expect(r.ornekler[0].islem).toBe('EKLE')
  })
})

// ── INV-6: daemon yok / hata yolları ──────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-6 · daemon yoksa SESSİZ ve fırlatmaz; liste okunamazsa HİÇ yazılmaz', () => {
  it('daemonCanli=false → durum daemon-yok, port ACILMAZ, hiçbir çağrı yok, istisna yok', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('daemonyok')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    const r = await kos(hafiza, depo, f, true, false)
    expect(r.durum).toBe('daemon-yok')
    expect(f.acilan(), 'daemon yokken port açıldı (spawn riski)').toBe(0)
    expect(f.cagri.liste).toBe(0)
    expect(f.cagri.remember).toHaveLength(0)
  })

  it('port açılamazsa (null ya da fırlatırsa) durum port-yok, yazma yok', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('portyok')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const ortak = { hafizaDizini: hafiza, yolTuru: M.varsayilanYolTuru(depo), daemonCanli: () => true, yaz: true }
    expect((await M.esle({ ...ortak, portAc: async () => null })).durum).toBe('port-yok')
    const r = await M.esle({
      ...ortak,
      portAc: async () => {
        throw new Error('baglanti reddedildi')
      },
    })
    expect(r.durum).toBe('port-yok')
  })

  it('kayıt listesi okunamazsa HİÇ yazılmaz (yinelenen kayıt riski)', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('listehata')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort([], { listeHata: true })
    const r = await kos(hafiza, depo, f, true)
    expect(r.durum).toBe('liste-hatasi')
    expect(f.cagri.remember).toHaveLength(0)
  })

  it('tek kaydın yazılamaması diğerlerini DURDURMAZ; hata sayılır ve raporlanır', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yazmahata')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'KOTU kayit.', govde: GOVDE_CAPALI }))
    yaz(hafiza, 'iki.md', md({ tip: 'project', aciklama: 'Iyi kayit.', govde: GOVDE_CAPALI }))
    const f = sahtePort([], { yazmaHata: (m) => m.includes('KOTU') })
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.hata).toBe(1)
    expect(r.sayilar.eklendi).toBe(1)
    expect(r.hatalar.join('\n')).toContain('bir.md')
    expect(f.kayitlar.map((k) => k.tags[0])).toEqual(['kaynak:iki.md'])
  })
})

// ── INV-7: gerçek kablo (sahte sage paketi) ───────────────────────────────────

const SAHTE_SAGE = String.raw`
const fs = require('fs')
const kaydet = (o) => { try { fs.appendFileSync(process.env.FAKE_SAGE_LOG, JSON.stringify(o) + '\n') } catch {} }
class ProjectSageMemoryPort {
  constructor(o) {
    kaydet({ op: 'ctor', projectRoot: o && o.projectRoot })
    this.connection = {
      status: async () => { kaydet({ op: 'status' }); return process.env.FAKE_SAGE_DURUM === 'yok' ? null : { pid: 1 } },
      connect: async () => { kaydet({ op: 'connect' }); return { pid: 1 } },
    }
  }
  async initialize() { kaydet({ op: 'initialize' }); await this.connection.connect() }
}
const yuzey = {
  listSage: async (d) => { kaydet({ op: 'listSage', d }); return [] },
  rememberSage: async (g) => { kaydet({ op: 'remember', g }); return { id: 'X' } },
  updateSage: async (id, y) => { kaydet({ op: 'update', id, y }); return { id } },
}
module.exports = { ProjectSageMemoryPort, getSageSurface: () => yuzey }
`

function sahteSageKokuKur(canli = true): { kok: string; log: string; ops: () => string[] } {
  const kok = geciciDizin('sahte-kok')
  const modDizin = path.join(kok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage')
  fs.mkdirSync(modDizin, { recursive: true })
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  fs.writeFileSync(path.join(modDizin, 'package.json'), JSON.stringify({ name: '@wrongstack/sage', main: 'index.js' }))
  fs.writeFileSync(path.join(modDizin, 'index.js'), SAHTE_SAGE)
  if (canli) fs.writeFileSync(path.join(kok, '.wrongstack', 'memories', 'server.json'), JSON.stringify({ pid: process.pid }))
  const log = path.join(kok, 'sahte-sage.log')
  return {
    kok,
    log,
    ops: () =>
      fs.existsSync(log)
        ? fs
            .readFileSync(log, 'utf8')
            .split('\n')
            .filter(Boolean)
            .map((l) => (JSON.parse(l) as { op: string }).op)
        : [],
  }
}

describe('INV-SAGE-HAFIZA-ESLE-7 · gerçek port kablosu daemon BAŞLATMAZ: status() ile bağlanır, yüzey listSage/rememberSage/updateSage', () => {
  it('gercekPortAc: connection.status çağrılır, initialize/connect ÇAĞRILMAZ; yüzey yöntemleri paket yüzeyine gider', async () => {
    const s = sahteSageKokuKur()
    process.env.FAKE_SAGE_LOG = s.log
    try {
      const port = await M.gercekPortAc(s.kok)
      expect(port).not.toBeNull()
      expect(s.ops()).toContain('status')
      expect(s.ops(), 'bağlantı kurulurken daemon BAŞLATILDI').not.toContain('initialize')
      expect(s.ops()).not.toContain('connect')
      await port?.listSage(['active'])
      await port?.rememberSage({
        text: 'x',
        kind: 'fact',
        scope: 'project',
        persistence: 'long_lived',
        importance: 0.6,
        confidence: 0.7,
        tags: [],
        anchors: [],
      })
      await port?.updateSage('X', { text: 'y' })
      expect(s.ops()).toEqual(expect.arrayContaining(['listSage', 'remember', 'update']))
    } finally {
      delete process.env.FAKE_SAGE_LOG
    }
  })

  it('status() boş dönerse port null (daemon yok)', async () => {
    const s = sahteSageKokuKur()
    process.env.FAKE_SAGE_LOG = s.log
    process.env.FAKE_SAGE_DURUM = 'yok'
    try {
      expect(await M.gercekPortAc(s.kok)).toBeNull()
    } finally {
      delete process.env.FAKE_SAGE_DURUM
      delete process.env.FAKE_SAGE_LOG
    }
  })
})

// ── INV-8: komut satırı ───────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-8 · komut satırı: daemon yokken TEK satır + çıkış 0; kuru kip yazmaz; --yaz yazar', () => {
  function betikKos(kok: string, hafiza: string, depo: string, log: string, argumanlar: string[] = []) {
    return spawnSync(process.execPath, [BETIK, ...argumanlar], {
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: kok,
        VENTHUB_HAFIZA_DIZINI: hafiza,
        VENTHUB_REPO_KOKU: depo,
        FAKE_SAGE_LOG: log,
      },
      timeout: 60_000,
    })
  }

  it('server.json yok: stdout TEK satır, stderr boş, çıkış 0', () => {
    const depo = depoKur()
    const hafiza = geciciDizin('cli-hafiza')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const s = sahteSageKokuKur(false)
    const r = betikKos(s.kok, hafiza, depo, s.log)
    expect(r.status).toBe(0)
    expect(r.stderr).toBe('')
    expect(r.stdout.trim().split('\n')).toHaveLength(1)
    expect(r.stdout).toMatch(/daemon/i)
    expect(s.ops(), 'daemon yokken sage paketi yüklendi/bağlanıldı').toEqual([])
  })

  it('canlı (sahte) daemon: varsayılan KURU KİP hiçbir şey yazmaz; --yaz remember çağırır', () => {
    const depo = depoKur()
    const hafiza = geciciDizin('cli-hafiza2')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik cli kaydi.', govde: GOVDE_CAPALI }))
    const s = sahteSageKokuKur(true)

    const kuru = betikKos(s.kok, hafiza, depo, s.log)
    expect(kuru.status).toBe(0)
    expect(kuru.stdout).toContain('KURU KIP')
    expect(kuru.stdout).toContain('Sentetik cli kaydi.')
    expect(s.ops(), 'kuru kip yazma çağrısı yaptı').not.toContain('remember')
    expect(s.ops()).toContain('listSage')
    expect(s.ops(), 'betik daemon BAŞLATTI').not.toContain('initialize')

    const yazan = betikKos(s.kok, hafiza, depo, s.log, ['--yaz'])
    expect(yazan.status).toBe(0)
    expect(yazan.stdout).toContain('YAZ KIPI')
    expect(s.ops()).toContain('remember')
  })
})

// ── INV-9: kaynak hijyeni ─────────────────────────────────────────────────────

describe('INV-SAGE-HAFIZA-ESLE-9 · betik doğrudan sqlite yazmaz, daemon spawn etmez', () => {
  it('kod satırlarında node:sqlite/DatabaseSync/INSERT/UPDATE yok; initialize/spawn/execFile yok', () => {
    const kod = KAYNAK.split('\n')
      .filter((s) => !/^\s*(\*|\/\/|\/\*)/.test(s))
      .join('\n')
    expect(kod).not.toMatch(/node:sqlite|DatabaseSync|UPDATE\s+memories|INSERT\s+INTO/i)
    expect(kod, 'betik daemon spawn etmemeli').not.toMatch(/\.initialize\s*\(|spawn\s*\(|execFile/)
  })
})
