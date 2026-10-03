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
  path?: string
  role?: string
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
  eskiBirlesti: number
  yakinKopya: number
  kaynakYok: number
}
interface Rapor {
  durum: string
  yaz: boolean
  sayilar: Sayilar
  ornekler: { islem: string; ad: string; kind: string; capalar: string[]; metin: string }[]
  hatalar: string[]
  kaynakYokAdlari: string[]
}
interface YedekSonucu {
  durum: string
  sebep?: string
}
type YolTuru = (rel: string) => 'file' | 'directory' | null
interface Modul {
  METIN_TAVANI: number
  EN_FAZLA_CAPA: number
  TUM_DURUMLAR: string[]
  ONEM: number
  GUVEN: number
  kes: (metin: string, sinir: number) => string
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
    yedekAl?: () => YedekSonucu
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
  // genel/kök dosyalar: VAR ama tek başına çapa olmamalı
  yaz(kok, 'package.json', '{}\n')
  yaz(kok, '.env', 'X=1\n')
  yaz(kok, '.agent/skills/yer-tutucu.md', 'x\n')
  yaz(kok, '.claude/skills/ornek/SKILL.md', 'x\n')
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
  secenek: {
    listeHata?: boolean
    yazmaHata?: (metin: string) => boolean
    /** Sage'in ≥0.88 yakın-kopya birleştirmesi: dönen kayıt VAROLAN bir kayıttır, yeni kayıt açılmaz, etiketler eklenmez. */
    yakinKopya?: (g: RememberGirdisi) => string | undefined
    yedek?: YedekSonucu
  } = {},
): {
  port: Port
  kayitlar: SahteKayit[]
  cagri: { liste: number; remember: RememberGirdisi[]; update: [string, UpdateYamasi][] }
  sira: string[]
  yedekAl: () => YedekSonucu
  portAc: () => Promise<Port>
  acilan: () => number
} {
  const kayitlar = [...baslangic]
  const cagri = { liste: 0, remember: [] as RememberGirdisi[], update: [] as [string, UpdateYamasi][] }
  const sira: string[] = []
  let acilan = 0
  const kucult = (t: string[]): string[] => t.map((x) => x.toLowerCase())
  const port: Port = {
    listSage: async () => {
      cagri.liste++
      if (secenek.listeHata) throw new Error('IPC koptu')
      return kayitlar
    },
    rememberSage: async (g) => {
      sira.push('remember')
      cagri.remember.push(g)
      if (secenek.yazmaHata?.(g.text)) throw new Error('yazma reddedildi')
      const birlesenId = secenek.yakinKopya?.(g)
      const birlesen = birlesenId ? kayitlar.find((x) => x.id === birlesenId) : undefined
      if (birlesen) return birlesen
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
      sira.push('update')
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
    sira,
    yedekAl: () => {
      sira.push('yedek')
      return secenek.yedek ?? { durum: 'alindi' }
    },
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
    yedekAl: f.yedekAl,
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
  listSage: async (d) => {
    kaydet({ op: 'listSage', d })
    const g = Number(process.env.FAKE_SAGE_DELAY_MS || 0)
    if (g) await new Promise((r) => setTimeout(r, g))
    return []
  },
  rememberSage: async (g) => { kaydet({ op: 'remember', g }); return { id: 'X' } },
  updateSage: async (id, y) => { kaydet({ op: 'update', id, y }); return { id } },
}
module.exports = { ProjectSageMemoryPort, getSageSurface: () => yuzey }
`

interface SqliteDb {
  exec: (s: string) => void
  close: () => void
}

function sahteSageKokuKur(canli = true, sageDb = false): { kok: string; log: string; ops: () => string[] } {
  const kok = geciciDizin('sahte-kok')
  const modDizin = path.join(kok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage')
  fs.mkdirSync(modDizin, { recursive: true })
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  fs.writeFileSync(path.join(modDizin, 'package.json'), JSON.stringify({ name: '@wrongstack/sage', main: 'index.js' }))
  fs.writeFileSync(path.join(modDizin, 'index.js'), SAHTE_SAGE)
  if (canli) fs.writeFileSync(path.join(kok, '.wrongstack', 'memories', 'server.json'), JSON.stringify({ pid: process.pid }))
  if (sageDb) {
    // yedek kapısı gerçek `sage-yedek.cjs`yi koşturur: küçük ama gerçek bir SQLite depo
    process.removeAllListeners('warning')
    process.on('warning', () => {})
    const { DatabaseSync } = require_('node:sqlite') as { DatabaseSync: new (p: string) => SqliteDb }
    const db = new DatabaseSync(path.join(kok, '.wrongstack', 'memories', 'sage.db'))
    db.exec("create table memories (id TEXT PRIMARY KEY, status TEXT NOT NULL); insert into memories values ('A','active')")
    db.close()
  }
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
  function betikKos(
    kok: string,
    hafiza: string,
    depo: string,
    log: string,
    argumanlar: string[] = [],
    ekOrtam: Record<string, string> = {},
  ) {
    return spawnSync(process.execPath, [BETIK, ...argumanlar], {
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: kok,
        VENTHUB_HAFIZA_DIZINI: hafiza,
        VENTHUB_REPO_KOKU: depo,
        VENTHUB_SAGE_YEDEK_DIZINI: geciciDizin('cli-yedek'),
        FAKE_SAGE_LOG: log,
        ...ekOrtam,
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
    const s = sahteSageKokuKur(true, true)

    const kuru = betikKos(s.kok, hafiza, depo, s.log)
    expect(kuru.status).toBe(0)
    expect(kuru.stdout).toContain('KURU KIP')
    expect(kuru.stdout).toContain('Sentetik cli kaydi.')
    expect(s.ops(), 'kuru kip yazma çağrısı yaptı').not.toContain('remember')
    expect(s.ops()).toContain('listSage')
    expect(s.ops(), 'betik daemon BAŞLATTI').not.toContain('initialize')

    const yazan = betikKos(s.kok, hafiza, depo, s.log, ['--yaz'])
    expect(yazan.status, yazan.stderr).toBe(0)
    expect(yazan.stdout).toContain('YAZ KIPI')
    expect(s.ops()).toContain('remember')
  })

  it('--yaz yedeksiz (sage.db yok → yedek alınamaz): HİÇ yazılmaz, çıkış 1', () => {
    const depo = depoKur()
    const hafiza = geciciDizin('cli-hafiza3')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const s = sahteSageKokuKur(true, false)
    const r = betikKos(s.kok, hafiza, depo, s.log, ['--yaz'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/yedek/i)
    expect(s.ops(), 'yedek yokken yazıldı').not.toContain('remember')
  })

  it('zaman aşımı: yavaş daemon betiği SONSUZA bekletmez; çıkış 1 ve sebep stderr de', () => {
    const depo = depoKur()
    const hafiza = geciciDizin('cli-hafiza4')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const s = sahteSageKokuKur(true, true)
    const t0 = Date.now()
    const r = betikKos(s.kok, hafiza, depo, s.log, [], { VENTHUB_ESLE_BUTCE_MS: '400', FAKE_SAGE_DELAY_MS: '20000' })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/zaman asimi/i)
    expect(Date.now() - t0, 'bütçe işlemedi').toBeLessThan(15_000)
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

// ══════════════════════════════════════════════════════════════════════════════
// ÇÜRÜTÜCÜ DÜZELTMELERİ (ARC-23a düzeltme turu): bulgu 1-8
// ══════════════════════════════════════════════════════════════════════════════

const ESKI_ETIKET = 'hafiza-dosyasi'
const eski = (id: string, tur: string, ad: string, durum = 'active', isaret = true): SahteKayit => ({
  id,
  status: durum,
  text: `Eski damitilmis ders ${id}.` + (isaret ? ` [ayrinti: hafiza/${ad}.md]` : ''),
  kind: 'convention',
  tags: [ESKI_ETIKET, tur, ad],
  anchors: [{ type: 'agent', role: 'ops' }],
})

describe('INV-SAGE-HAFIZA-ESLE-10 · bulgu 1: lane-state / state-<tarih> / README dosyaları HARİÇ', () => {
  const adlar = [
    'altyapi-lane-state-2026-08-19.md',
    'geoseo-lane-state.md',
    'urun-state-2026-08-23-aksam.md',
    'pricing-lane-state-2026-08-17.md',
  ]
  it('haricMi bu adları yakalar; tarihsiz konu dosyası yakalanmaz', () => {
    for (const a of adlar) expect(M.haricMi(a), `${a} hariç sayılmadı`).toBe(true)
    expect(M.haricMi('README.md')).toBe(true)
    expect(M.haricMi('olcum-state-machine-notu.md'), 'tarihsiz konu dosyası yanlışlıkla hariç').toBe(false)
    expect(M.haricMi('konu-bir.md')).toBe(false)
  })

  it('kapsam: bu dosyalar ve olcum/README.md çapalı olsalar da köprüye girmez, hariç sayısına eklenir', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('kapsam2')
    const capali = md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI })
    yaz(hafiza, 'konu-bir.md', capali)
    for (const a of adlar) yaz(hafiza, a, capali)
    yaz(hafiza, 'olcum/README.md', capali)
    const f = sahtePort()
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.haric).toBe(adlar.length + 1)
    expect(r.sayilar.taranan).toBe(1)
    expect(f.cagri.remember.map((g) => g.tags[0])).toEqual(['kaynak:konu-bir.md'])
  })
})

describe('INV-SAGE-HAFIZA-ESLE-11 · bulgu 2: genel/kök dosya adları tek başına çapa OLMAZ; src/ docs/ dizinleri elenmez', () => {
  it('package.json · .env · .claude · .agent · .claude/skills çapa değil; özgül yol ve src/ docs/ çapa', () => {
    const depo = depoKur()
    const yolTuru = M.varsayilanYolTuru(depo)
    const genel = '`package.json` `.env` `.claude` `.agent` `.claude/skills` `.agent/skills`'
    expect(M.capalariCikar(genel, yolTuru), 'genel çapa köprüye girdi').toEqual([])
    const ozgul = M.capalariCikar('`.claude/skills/ornek/SKILL.md` ve `src/` ile `docs/` ve `package.json`', yolTuru)
    expect(ozgul).toEqual([
      { type: 'file', path: '.claude/skills/ornek/SKILL.md' },
      { type: 'directory', path: 'src' },
      { type: 'directory', path: 'docs' },
    ])
  })
})

describe('INV-SAGE-HAFIZA-ESLE-12 · bulgu 3: eski `hafiza-dosyasi` kaydı varsa YENİ KAYIT AÇILMAZ; o kayıt güncellenir, etiketleri KORUNUR', () => {
  it('kuru kip: eskiBirlesti sayılır, yazma çağrısı yok', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('eski-kuru')
    yaz(hafiza, 'bir.md', md({ tip: 'feedback', aciklama: 'Yeni ozet.', govde: GOVDE_CAPALI }))
    yaz(hafiza, 'iki.md', md({ tip: 'project', aciklama: 'Ikinci.', govde: GOVDE_CAPALI }))
    const f = sahtePort([eski('ESKI1', 'feedback', 'bir')])
    const r = await kos(hafiza, depo, f, false)
    expect(r.sayilar.eskiBirlesti).toBe(1)
    expect(r.sayilar.eklendi).toBe(1)
    expect(f.cagri.remember).toHaveLength(0)
    expect(f.cagri.update).toHaveLength(0)
  })

  it('yaz: eski kayıt (ayrinti işareti ya da yalnız dosya-adı etiketiyle bulunan) güncellenir; etiket/çapa birleşir; metin DOKUNULMAZ; ikinci koşum değişmedi', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('eski-yaz')
    yaz(hafiza, 'bir.md', md({ tip: 'feedback', aciklama: 'Yeni ozet.', govde: GOVDE_CAPALI }))
    yaz(hafiza, 'iki.md', md({ tip: 'project', aciklama: 'Ikinci.', govde: GOVDE_CAPALI }))
    const f = sahtePort([eski('ESKI1', 'feedback', 'bir'), eski('ESKI2', 'project', 'iki', 'active', false)])
    const bir = await kos(hafiza, depo, f, true)
    expect(bir.sayilar.eskiBirlesti).toBe(2)
    expect(f.cagri.remember, 'eski kaydı olan dosya için YENİ kayıt açıldı').toHaveLength(0)
    expect(f.kayitlar).toHaveLength(2)
    const k1 = f.kayitlar.find((k) => k.id === 'ESKI1')
    expect(k1?.tags, 'eski etiketler silindi').toEqual(expect.arrayContaining([ESKI_ETIKET, 'feedback', 'bir', 'kaynak:bir.md']))
    expect(k1?.anchors.map((a) => a.role ?? a.path)).toEqual(expect.arrayContaining(['ops', 'src/lib/Hedef.ts']))
    expect(k1?.text, 'eski damıtılmış metin ezildi').toBe('Eski damitilmis ders ESKI1. [ayrinti: hafiza/bir.md]')
    expect(f.kayitlar.find((k) => k.id === 'ESKI2')?.tags).toEqual(expect.arrayContaining([ESKI_ETIKET, 'kaynak:iki.md']))

    const iki = await kos(hafiza, depo, f, true)
    expect(iki.sayilar.degismedi).toBe(2)
    expect(f.cagri.update, 'ikinci koşum yeniden yazdı').toHaveLength(2)
    expect(f.cagri.remember).toHaveLength(0)
  })

  it('yakın-kopya birleştirmesi: remember VAROLAN kaydı döndürürse (etiketsiz) kaynak etiketi eklenir, `hafiza-dosyasi` etiketi KAYBOLMAZ', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yakin')
    yaz(hafiza, 'uc.md', md({ tip: 'project', aciklama: 'Uc.', govde: GOVDE_CAPALI }))
    // başka bir dosyanın eski kaydı, yeni metne ≥0.88 benziyor → sage birleştirir
    const f = sahtePort([eski('ESKI3', 'project', 'baska-dosya')], { yakinKopya: () => 'ESKI3' })
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.yakinKopya).toBe(1)
    expect(f.kayitlar, 'yakın kopya yeni kayıt üretti').toHaveLength(1)
    const k = f.kayitlar[0]
    expect(k.tags).toEqual(expect.arrayContaining([ESKI_ETIKET, 'project', 'baska-dosya', 'kaynak:uc.md']))
    expect(k.anchors.map((a) => a.role ?? a.path)).toEqual(expect.arrayContaining(['ops', 'src/lib/Hedef.ts']))
    // sonraki koşum bu kaydı kaynak etiketiyle bulur ve DEĞİŞMEDİ der
    const iki = await kos(hafiza, depo, f, true)
    expect(iki.sayilar.degismedi).toBe(1)
    expect(f.cagri.remember).toHaveLength(1)
  })

  it('yakın-kopyayla bize bağlanan YABANCI kaydın metni/kind\'ı sonraki koşumda EZİLMEZ (yalnız etiket/çapa birleşir)', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yabanci')
    yaz(hafiza, 'uc.md', md({ tip: 'project', aciklama: 'Uc surum bir.', govde: GOVDE_CAPALI }))
    const yabanci: SahteKayit = {
      id: 'YABANCI',
      status: 'active',
      text: 'Elle yazilmis baska bir ders.',
      kind: 'warning',
      tags: ['elle'],
      anchors: [],
    }
    const f = sahtePort([yabanci], { yakinKopya: () => 'YABANCI' })
    await kos(hafiza, depo, f, true)
    expect(f.kayitlar[0].tags).toEqual(expect.arrayContaining(['elle', 'kaynak:uc.md']))
    // dosya değişir → ikinci koşum güncelleme yolunu açar; yabancı metin korunmalı
    yaz(hafiza, 'uc.md', md({ tip: 'project', aciklama: 'Uc surum iki.', govde: GOVDE_CAPALI }))
    await kos(hafiza, depo, f, true)
    expect(f.kayitlar[0].text, 'yabancı kaydın metni ezildi').toBe('Elle yazilmis baska bir ders.')
    expect(f.kayitlar[0].kind).toBe('warning')
    expect(f.kayitlar[0].tags).toContain('elle')
  })

  it('bilerek kaldırılmış eski kayıt (deleted) diriltilmez ve yerine yenisi açılmaz', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('eski-silik')
    yaz(hafiza, 'bir.md', md({ tip: 'feedback', aciklama: 'Yeni.', govde: GOVDE_CAPALI }))
    const f = sahtePort([eski('ESKI1', 'feedback', 'bir', 'deleted')])
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.kaldirilmis).toBe(1)
    expect(f.cagri.remember).toHaveLength(0)
    expect(f.cagri.update).toHaveLength(0)
  })
})

describe('INV-SAGE-HAFIZA-ESLE-13 · bulgu 4: kaynağı silinmiş kayıt SİLİNMEZ, yalnız raporlanır', () => {
  it('kaynak: etiketi ya da eski ayrinti işareti olup dosyası artık olmayan kayıtlar adlarıyla listelenir; var olan (hariç dahil) listelenmez', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('kaynakyok')
    yaz(hafiza, 'var.md', md({ tip: 'project', aciklama: 'Var.', govde: GOVDE_CAPALI }))
    yaz(hafiza, 'MEMORY.md', 'hariç ama dosya MEVCUT')
    const f = sahtePort([
      { id: 'K1', status: 'active', text: 'a', kind: 'fact', tags: ['kaynak:gitmis-bir.md'], anchors: [] },
      eski('E1', 'project', 'gitmis-iki'),
      eski('E2', 'project', 'memory', 'active', false), // etiket 'memory'; dosya MEMORY.md mevcut
      { id: 'K2', status: 'deleted', text: 'b', kind: 'fact', tags: ['kaynak:zaten-silik.md'], anchors: [] },
    ])
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.kaynakYok).toBe(2)
    expect([...r.kaynakYokAdlari].sort()).toEqual(['gitmis-bir.md', 'gitmis-iki.md'])
    // yalnız rapor: hiçbir kayıt silinmedi/güncellenmedi
    expect(f.kayitlar.slice(0, 4).map((k) => k.status)).toEqual(['active', 'active', 'active', 'deleted'])
    expect(f.cagri.update.map((u) => u[0]), 'kaynağı yok kayıt güncellendi').not.toContain('K1')
    expect(f.cagri.update.map((u) => u[0])).not.toContain('E1')
  })
})

describe('INV-SAGE-HAFIZA-ESLE-14 · bulgu 5: kes() UTF-16 vekil çiftini ortadan bölmez', () => {
  const yetim = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/
  it('kes: sınır tam bir emojinin ortasına gelirse emoji bütün atılır', () => {
    const sinir = 50
    const metin = 'a'.repeat(sinir - 2) + '😀😀 tail'
    const k = M.kes(metin, sinir)
    expect(k.length).toBeLessThanOrEqual(sinir)
    expect(yetim.test(k), 'yetim vekil karakter kaldı').toBe(false)
    expect(k.endsWith('…')).toBe(true)
  })

  it('kayıt: sınırda emoji olan açıklama yetim vekil üretmez', () => {
    const ad = 'emoji.md'
    const sinir = TAVAN - `\nKaynak: ${ad}`.length
    const aciklama = 'a'.repeat(sinir - 2) + '😀😀 tail'
    const r = M.kayitKur(ad, md({ tip: 'project', aciklama, govde: GOVDE_CAPALI }), (rel) => (rel === 'src/lib/Hedef.ts' ? 'file' : null))
    const text = r.kayit?.text ?? ''
    expect(text.length).toBeLessThanOrEqual(TAVAN)
    expect(yetim.test(text)).toBe(false)
  })
})

describe('INV-SAGE-HAFIZA-ESLE-15 · bulgu 6: `description: >` / `|` blok skaler okunur, işaret metne sızmaz', () => {
  const yolTuru: YolTuru = (rel) => (rel === 'src/lib/Hedef.ts' ? 'file' : null)
  const ham = (isaret: string) =>
    ['---', 'name: blok', `description: ${isaret}`, '  Birinci satir', '  ikinci satir', 'metadata:', '  type: project', '---', '', GOVDE_CAPALI, ''].join('\n')
  it.each(['>', '|', '>-', '|-', '>+'])('isaret %s', (isaret) => {
    const r = M.kayitKur('blok.md', ham(isaret), yolTuru)
    const text = r.kayit?.text ?? ''
    expect(text.startsWith('Birinci satir ikinci satir')).toBe(true)
    expect(text.split('\n')[0]).not.toMatch(/^[>|]/)
    expect(r.kayit?.kind, 'metadata.type blok skalerden sonra okunmalı').toBe('fact')
  })
})

describe('INV-SAGE-HAFIZA-ESLE-16 · bulgu 7: --yaz öncesi yedek; başarısızsa HİÇ yazılmaz', () => {
  it('yedek alınmadan yazım olmaz; sıra: yedek → remember', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yedek-sira')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    await kos(hafiza, depo, f, true)
    expect(f.sira[0]).toBe('yedek')
    expect(f.sira.filter((x) => x === 'yedek')).toHaveLength(1)
    expect(f.sira).toContain('remember')
  })

  it('yedek başarısız → durum yedek-yok, hiçbir yazma yok', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yedek-hata')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    for (const durum of ['hata', 'dogrulanmadi', 'kaynak-yok']) {
      const f = sahtePort([], { yedek: { durum, sebep: 'sahte' } })
      const r = await kos(hafiza, depo, f, true)
      expect(r.durum, durum).toBe('yedek-yok')
      expect(f.cagri.remember, `yedek ${durum} iken yazıldı`).toHaveLength(0)
      expect(f.cagri.update).toHaveLength(0)
    }
  })

  it('yedek fırlatırsa da yazılmaz; kuru kip yedeği HİÇ çağırmaz; yazılacak şey yoksa yedek de alınmaz', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('yedek-firlat')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    const r = await M.esle({
      hafizaDizini: hafiza,
      yolTuru: M.varsayilanYolTuru(depo),
      daemonCanli: () => true,
      portAc: f.portAc,
      yaz: true,
      yedekAl: () => {
        throw new Error('disk dolu')
      },
    })
    expect(r.durum).toBe('yedek-yok')
    expect(f.cagri.remember).toHaveLength(0)

    const kuru = sahtePort()
    await kos(hafiza, depo, kuru, false)
    expect(kuru.sira, 'kuru kip yedek aldı').toEqual([])

    const tamam = sahtePort()
    await kos(hafiza, depo, tamam, true)
    tamam.sira.length = 0
    await kos(hafiza, depo, tamam, true) // her şey değişmedi
    expect(tamam.sira, 'yazılacak şey yokken yedek alındı').toEqual([])
  })
})

describe('INV-SAGE-HAFIZA-ESLE-17 · bulgu 8: önem/güven eşiği, gerçek durum adları, büyük harfli dosya adı', () => {
  it('importance sage-dosya-dersi eşiğinin (0.5) ÜSTÜNDE, güven (0,1] aralığında', async () => {
    const dosyaDersi = require_(path.join(KOK, 'scripts', 'hijyen', 'sage-dosya-dersi.cjs')) as { ASGARI_ONEM: number }
    expect(dosyaDersi.ASGARI_ONEM).toBe(0.5)
    const depo = depoKur()
    const hafiza = geciciDizin('onem')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    await kos(hafiza, depo, f, true)
    const g = f.cagri.remember[0]
    expect(g.importance, 'kayıt dosya-dersi süzgecinin altında: hiç görünmez').toBeGreaterThanOrEqual(dosyaDersi.ASGARI_ONEM)
    expect(g.importance).toBeLessThanOrEqual(1)
    expect(g.confidence).toBeGreaterThan(0)
    expect(g.confidence).toBeLessThanOrEqual(1)
  })

  it.each(['deleted', 'archived', 'superseded', 'contradicted'])('kaynak etiketli kayıt %s ise DİRİLTİLMEZ', async (durum) => {
    const depo = depoKur()
    const hafiza = geciciDizin(`durum-${durum}`)
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort([{ id: 'X1', status: durum, text: 'eski', kind: 'fact', tags: ['kaynak:bir.md'], anchors: [] }])
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.kaldirilmis).toBe(1)
    expect(f.cagri.remember).toHaveLength(0)
    expect(f.cagri.update).toHaveLength(0)
  })

  it('stale kayıt CANLI sayılır: güncellenir', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('durum-stale')
    yaz(hafiza, 'bir.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort([{ id: 'X1', status: 'stale', text: 'eski', kind: 'fact', tags: ['kaynak:bir.md'], anchors: [] }])
    const r = await kos(hafiza, depo, f, true)
    expect(r.sayilar.guncellendi).toBe(1)
    expect(f.cagri.update[0][0]).toBe('X1')
  })

  it('durum listesi kurulu sage kaynağıyla AYNI (sage kuruluysa)', () => {
    const r = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: KOK, encoding: 'utf8' })
    const ortak = (r.stdout ?? '').trim()
    const dts = ortak
      ? path.join(path.dirname(ortak), 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage', 'dist', 'memory-model.d.ts')
      : ''
    if (!dts || !fs.existsSync(dts)) return // CI'da sage yok: bu kol atlanır (INV-12 ile aynı kural)
    const m = fs.readFileSync(dts, 'utf8').match(/SAGE_STATUSES: readonly \[([^\]]+)\]/)
    expect(m, 'SAGE_STATUSES bulunamadı').not.toBeNull()
    const gercek = (m?.[1] ?? '').split(',').map((s) => s.trim().replace(/"/g, ''))
    expect([...M.TUM_DURUMLAR].sort()).toEqual([...gercek].sort())
  })

  it('BÜYÜK HARFLİ dosya adı: sage etiketi küçülttüğü için ikinci koşum yinelenen kayıt AÇMAZ', async () => {
    const depo = depoKur()
    const hafiza = geciciDizin('buyuk')
    yaz(hafiza, 'Buyuk-Harf.md', md({ tip: 'project', aciklama: 'Sentetik.', govde: GOVDE_CAPALI }))
    const f = sahtePort()
    await kos(hafiza, depo, f, true)
    expect(f.kayitlar[0].tags).toContain('kaynak:buyuk-harf.md') // sahte port sage gibi küçültür
    const iki = await kos(hafiza, depo, f, true)
    expect(iki.sayilar.degismedi).toBe(1)
    expect(f.cagri.remember, 'büyük harf yüzünden yinelenen kayıt').toHaveLength(1)
  })
})
