// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-SAGE-YEDEK-1 — çapalı hafızanın yedeği TUTARLI ve DOĞRULANMIŞ olmalı.
 *
 * ⭐NİÇİN VAR: hafıza dersleri sage'e taşınıyor ve `.wrongstack/memories/sage.db` git DIŞIDIR
 * (bilerek). Tek depo = tek arıza noktası; depoyu kaybetmek dersleri kaybetmektir.
 *
 * ⭐BU KAPININ ASIL KOLU BİR TUZAĞI ÖLÇER: veritabanı WAL kipindedir. Canlı `sage.db` dosyasını
 * tek başına kopyalamak, WAL'da bekleyen yazımları ATLAR. Sahada ölçüldü (2026-09-18, gerçek
 * depo): `sage.db` 217 KB + `sage.db-wal` 758 KB; düz kopya **20** kayıt gösterdi, gerçek sayı
 * **26**. Yani en makul görünen yedekleme biçimi altı dersi **sessizce** kaybediyordu ve hiçbir
 * şey uyarmıyordu. Aşağıdaki kol bu farkı her koşumda yeniden üretir.
 *
 * Cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const KOK = process.cwd()
const MODUL_YOLU = path.join(KOK, 'scripts', 'hijyen', 'sage-yedek.cjs')
const KANCA_OTURUM_SONU = path.join(KOK, '.claude', 'hooks', 'sage-yedek-oturum-sonu.cjs')
const KANCA_ISTEM = path.join(KOK, '.claude', 'hooks', 'defter-tazelik-satiri.cjs')
const require_ = createRequire(import.meta.url)

interface SqliteDb {
  exec: (s: string) => void
  prepare: (s: string) => { run: (...a: unknown[]) => void; get: () => Record<string, unknown>; all: () => Record<string, unknown>[] }
  close: () => void
}

type Iz = {
  tablolar: string[]
  satirlar: Record<string, number | string>
  sayi: number
  aktif: number | null
}

const modul = require_(MODUL_YOLU) as {
  TUTULACAK: number
  DEPOLAR: { ad: string; onek: string; uzanti: string; ana: string | null }[]
  kaynakYolu: (k?: string, depo?: string) => string
  yedekDizini: () => string
  parmakIzi: (y: string, ana?: string | null) => Iz
  yedekAl: (simdi?: Date, depo?: string) => { durum: string; depo?: string; yol?: string; sebep?: string; yedek?: Iz }
  hepsiniAl: (simdi?: Date) => { depo: string; durum: string; yol?: string; sebep?: string; yedek?: Iz }[]
  budama: (d?: string, depo?: string) => string[]
  liste: (d?: string, onek?: string | null) => { ad: string }[]
  damga: (d: Date) => string
  sonDurum: (
    d?: string,
    simdi?: number,
  ) => {
    sonYedek: string | null
    gun: number | null
    dogrulanmadi: string[]
    adet: number
    depolar: { depo: string; kaynakVar: boolean; sonYedek: string | null; gun: number | null; adet: number }[]
  }
}

const ESKI_ENV = { kok: process.env.CLAUDE_PROJECT_DIR, dizin: process.env.VENTHUB_SAGE_YEDEK_DIZINI }
afterEach(() => {
  if (ESKI_ENV.kok === undefined) delete process.env.CLAUDE_PROJECT_DIR
  else process.env.CLAUDE_PROJECT_DIR = ESKI_ENV.kok
  if (ESKI_ENV.dizin === undefined) delete process.env.VENTHUB_SAGE_YEDEK_DIZINI
  else process.env.VENTHUB_SAGE_YEDEK_DIZINI = ESKI_ENV.dizin
})

function sqlite(): { DatabaseSync: new (p: string, o?: { readOnly?: boolean }) => SqliteDb } {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  return require_('node:sqlite') as { DatabaseSync: new (p: string, o?: { readOnly?: boolean }) => SqliteDb }
}

/**
 * WAL kipinde, BEKLEYEN yazımları olan gerçek bir sage veritabanı kurar.
 * Bağlantı AÇIK bırakılır: kapanış checkpoint yapar ve tuzak kaybolur.
 */
function depoKur(kayit: number): { kok: string; db: SqliteDb } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-yedek-'))
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(path.join(kok, '.wrongstack', 'memories', 'sage.db'))
  db.exec('pragma journal_mode = WAL')
  db.exec(`create table memories (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL, kind TEXT NOT NULL,
    scope TEXT NOT NULL, importance REAL NOT NULL, confidence REAL NOT NULL, freshness REAL NOT NULL,
    updated_at TEXT NOT NULL, created_at TEXT NOT NULL)`)
  for (let i = 0; i < kayit; i++) {
    db.prepare(
      `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
       values (?,?,'active','fact','project',0.8,0.8,1,'2026-09-18','2026-09-18')`,
    ).run(`m-${i}`, JSON.stringify({ text: `ders ${i}`, anchors: [] }))
  }
  return { kok, db }
}

describe('INV-SAGE-YEDEK-1 · sage yedegi tutarli ve dogrulanmis', () => {
  it('⭐ASIL İDDİA — WAL bekleyen yazimlarla: YEDEK tam, DUZ KOPYA eksik (tuzak her kosumda uretilir)', () => {
    const { kok, db } = depoKur(26)
    const yedekDizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-hedef-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = yedekDizin

    const kaynak = path.join(kok, '.wrongstack', 'memories', 'sage.db')
    expect(fs.existsSync(kaynak + '-wal'), 'WAL dosyasi yok — tuzak uretilemedi, kol KOR').toBe(true)

    /**
     * DÜZ KOPYA: en makul görünen yedekleme biçimi. Ölçüm: eksik — ve kaybın DERECESİ duruma
     * göre değişiyor. Gerçek depoda (2026-09-18) 26 kaydın 20'si geldi; taze bir WAL'da ise
     * tablo bile gelmiyor ("no such table"). İkisi de aynı kusurun yüzü: bekleyen yazımlar
     * `sage.db` içinde DEĞİL. Bu yüzden kol "sayı küçük" demiyor, "TAM DEĞİL" diyor.
     */
    const duz = path.join(yedekDizin, 'duz.db')
    fs.copyFileSync(kaynak, duz)
    const { DatabaseSync } = sqlite()
    let duzSayi: number | null = null
    let duzHata: string | null = null
    try {
      const d = new DatabaseSync(duz, { readOnly: true })
      duzSayi = Number(d.prepare('select count(*) as c from memories').get().c)
      d.close()
    } catch (e) {
      duzHata = String((e as Error).message).slice(0, 80)
    }

    // GERÇEK YEDEK: VACUUM INTO, WAL dahil.
    const s = modul.yedekAl()
    expect(s.durum, `yedek alinamadi: ${s.sebep}`).toBe('alindi')
    expect(s.yedek?.sayi, 'yedek kayit sayisi kaynakla tutmuyor').toBe(26)

    // Düz kopya ya eksik sayı verir ya HİÇ açılamaz; ikisi de "tam değil" demektir.
    const duzTam = duzHata === null && duzSayi === 26
    expect(duzTam, `DUZ KOPYA tam cikti (sayi ${duzSayi}, hata ${duzHata}) — tuzak uretilemedi, kol KOR`).toBe(false)
    expect(modul.parmakIzi(String(s.yol)).sayi, 'yedek dosyasi eksik').toBe(26)

    db.close()
  })

  // CLI'nin çıkış kodu artık 0 DEĞİL (bkz. INV-SAGE-ANA-KOK-1); burada kütüphane hükmü ölçülür.
  it('KAYNAK YOKSA sessizce "yedek aldim" DEMEZ (durum kaynak-yok, dosya uretilmez)', () => {
    process.env.CLAUDE_PROJECT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-bos-'))
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-hedef-'))
    const s = modul.yedekAl()
    expect(s.durum).toBe('kaynak-yok')
    expect(modul.liste(process.env.VENTHUB_SAGE_YEDEK_DIZINI), 'kaynak yokken yedek uretilmis').toEqual([])
  })

  it('⭐YEDEK DEPO DIŞINA iner (ikili + cok yazar = cozulemez catisma)', () => {
    delete process.env.VENTHUB_SAGE_YEDEK_DIZINI
    const dizin = path.resolve(modul.yedekDizini())
    const depo = path.resolve(KOK)
    expect(dizin.toLowerCase().startsWith(depo.toLowerCase()), `yedek dizini DEPO ICINDE: ${dizin}`).toBe(false)
    // Kaynak yolu ise depo içindedir (sage verisi projenin içinde yaşar).
    expect(modul.kaynakYolu(depo)).toContain('.wrongstack')
  })

  it('DOGRULAMA ve BUDAMA yazili: uyusmazlikta .DOGRULANMADI, budama .DOGRULANMADI ya DOKUNMAZ', () => {
    const kaynak = fs.readFileSync(MODUL_YOLU, 'utf8')
    // Doğrulama gerçekten karşılaştırma yapıyor mu (sayı + aktif + tablo listesi).
    expect(kaynak, 'kayit sayisi karsilastirilmiyor').toMatch(/yedekIzi\.sayi === kaynakIzi\.sayi/)
    expect(kaynak, 'aktif sayisi karsilastirilmiyor').toMatch(/yedekIzi\.aktif === kaynakIzi\.aktif/)
    expect(kaynak, 'tablo listesi karsilastirilmiyor').toMatch(/tablolar\.join\(','\) === kaynakIzi\.tablolar\.join/)
    expect(kaynak, 'uyusmazlikta dosya isaretlenmiyor').toContain('.DOGRULANMADI')
    // VACUUM INTO zorunlu: düz kopya (copyFileSync) ile yedek ALINMAZ.
    expect(kaynak, 'VACUUM INTO kullanilmiyor').toMatch(/VACUUM INTO/)
    expect(kaynak, 'duz dosya kopyasi ile yedek aliniyor — WAL kaybolur').not.toMatch(/copyFileSync\(/)

    // Budama: en yeniler kalır, `.DOGRULANMADI` kanıt olarak durur.
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-budama-'))
    for (let i = 0; i < modul.TUTULACAK + 3; i++) {
      fs.writeFileSync(path.join(dizin, `sage-2026-09-${String(i + 1).padStart(2, '0')}T0000Z.db`), 'x')
    }
    fs.writeFileSync(path.join(dizin, 'sage-2026-01-01T0000Z.db.DOGRULANMADI'), 'x')
    const silinen = modul.budama(dizin)
    expect(silinen.length, 'budama calismiyor').toBe(3)
    expect(
      fs.existsSync(path.join(dizin, 'sage-2026-01-01T0000Z.db.DOGRULANMADI')),
      'DOGRULANMADI kaniti silinmis',
    ).toBe(true)
    expect(fs.readdirSync(dizin).filter((f) => /\.db$/.test(f)).length).toBe(modul.TUTULACAK)
  })

  it('KAYNAKTA DIS SERVISE CIKIS IZI YOK ve kaynak SALT-OKUMA acilir', () => {
    const kaynak = fs
      .readFileSync(MODUL_YOLU, 'utf8')
      .split('\n')
      .filter((s) => {
        const t = s.trim()
        return !t.startsWith('*') && !t.startsWith('//')
      })
      .join('\n')
    for (const yasak of ['fetch(', 'https://', 'child_process']) {
      expect(kaynak, `dis cagri izi: ${yasak}`).not.toContain(yasak)
    }
    // Yedek alırken kaynağa YAZILMAZ: her açılış readOnly olmalı.
    const acilislar = kaynak.match(/new DatabaseSync\([^)]*\)/g) ?? []
    expect(acilislar.length, 'veritabani hic acilmiyor').toBeGreaterThan(0)
    for (const a of acilislar) expect(a, `salt-okuma DEGIL: ${a}`).toContain('readOnly: true')
  })

  it('CLI: --liste yedekleri yazar, cikis 0', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-cli-'))
    const r = spawnSync(process.execPath, [MODUL_YOLU, '--liste'], {
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_SAGE_YEDEK_DIZINI: dizin },
      timeout: 30_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout, 'bos dizinde sebep yazilmiyor').toMatch(/yedek YOK/)
  })

  /**
   * ══════════════════════════════════════════════════════════════════════════════
   * OTOMATİKLEŞTİRME (karar 51) — Recep'in sorusu: "neden elle, unutulursa ne olacak"
   * ══════════════════════════════════════════════════════════════════════════════
   * Cevap: elle = unutulur. Aşağıdaki iki kol, otomatiğin İKİ ayrı arıza biçimini ölçer:
   *   1. Kanca çalışıyor ama HİÇBİR ŞEY yapmıyor (sessiz atlama) → log satırı zorunlu.
   *   2. Kanca oturum kapanışını bloklıyor ya da hata kusuyor → çıkış DAİMA 0 olmalı.
   */
  it('⭐OTURUM SONU KANCASI: bayatsa ALIR, tazeyse ATLAR, her iki halde de CIKIS 0 ve LOG yazar', () => {
    const { kok, db } = depoKur(5)
    db.close()
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-oto-'))
    const kos = (): { kod: number | null; log: string } => {
      const r = spawnSync(process.execPath, [KANCA_OTURUM_SONU], {
        input: '{"session_id":"t","reason":"clear"}',
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_SAGE_YEDEK_DIZINI: dizin },
        timeout: 60_000,
      })
      const l = path.join(dizin, 'son-kosum.log')
      return { kod: r.status, log: fs.existsSync(l) ? fs.readFileSync(l, 'utf8') : '' }
    }

    const birinci = kos()
    expect(birinci.kod, 'kanca oturum kapanisini BLOKLADI').toBe(0)
    expect(modul.liste(dizin).filter((y) => y.ad.endsWith('.db')), 'bayatken yedek ALINMADI').toHaveLength(1)
    expect(birinci.log, 'alinan yedek loga yazilmadi — sessizlik BASARI degildir').toContain('ALINDI')

    // İkinci koşum: son yedek 24 saatten yeni → yeni dosya ÜRETİLMEMELİ, ama sebebi YAZILMALI.
    const ikinci = kos()
    expect(ikinci.kod, 'ikinci kosumda cikis 0 degil').toBe(0)
    expect(modul.liste(dizin).filter((y) => y.ad.endsWith('.db')), '24 saat kurali calismadi').toHaveLength(1)
    expect(ikinci.log, 'atlama sebebi loga yazilmadi').toContain('ATLANDI')
  })

  it('⭐PANO DA YEDEKLENIR: kanban deposu listede, WAL tuzagi onda da uretilir ve DOGRULANIR', () => {
    /**
     * ⭐NİÇİN (2026-09-19 ölçümü): iş kartı panosu sage ile AYNI yerde, AYNI biçimde yaşıyor —
     * `.wrongstack/kanbans/_kanban.sqlite`, WAL kipli, git DIŞI. Ölçüm anında ana dosya 4 KB,
     * WAL'ı 148 KB idi: panonun içeriği pratikte TAMAMEN WAL'daydı. Yedeklenmeseydi pilotun
     * bütün kartları tek dosyayla yok olurdu; düz kopya da neredeyse boş bir pano verirdi.
     */
    const depolar = modul.DEPOLAR.map((d) => d.ad)
    expect(depolar, 'kanban deposu yedek listesinde YOK — pilot verisi yedeksiz birikir').toContain('kanban')

    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-yedek-'))
    fs.mkdirSync(path.join(kok, '.wrongstack', 'kanbans'), { recursive: true })
    const { DatabaseSync } = sqlite()
    // ⛔Bağlantı AÇIK kalır: kapanış checkpoint yapar ve WAL tuzağı kaybolur (fikstür sahteleşir).
    const db = new DatabaseSync(path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite'))
    db.exec('pragma journal_mode = WAL')
    db.exec('create table boards (id TEXT PRIMARY KEY, title TEXT NOT NULL)')
    db.exec('create table tasks (id TEXT PRIMARY KEY, board_id TEXT NOT NULL, title TEXT NOT NULL)')
    db.prepare('insert into boards (id,title) values (?,?)').run('b1', 'VentHub ALTYAPI')
    for (let i = 0; i < 7; i++) {
      db.prepare('insert into tasks (id,board_id,title) values (?,?,?)').run(`t-${i}`, 'b1', `REC-345 kart ${i}`)
    }

    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-hedef-'))

    const s = modul.yedekAl(new Date(), 'kanban') as {
      durum: string
      yol?: string
      yedek?: { sayi: number; tablolar: string[] }
    }
    expect(s.durum, 'pano yedegi alinamadi').toBe('alindi')
    expect(s.yedek?.sayi, 'pano yedegi EKSIK — WAL bekleyen yazimlar atlandi').toBe(8) // 1 pano + 7 kart
    expect(path.basename(String(s.yol)), 'pano yedegi sage onekiyle yazilmis (budama birbirini yer)').toMatch(
      /^kanban-.*\.sqlite$/,
    )
    db.close()
  })

  it('⭐SANAL TABLO parmak izini PATLATMAZ: sayilamaz ama LISTEDE kalir', () => {
    /**
     * Sahada ölçüldü 2026-09-19: sage'in `memories_fts` tablosu harici içerikli bir FTS5 sanal
     * tablosudur ve `count(*)` "no such column: T.text" ile patlar. Genel parmak izinin ilk
     * yazımı bu yüzden sage yedeğini TAMAMEN düşürdü. Sanal tablo listede kalmalı (varlığı
     * karşılaştırılır) ama satır sayımının dışında tutulmalı.
     */
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-fts-'))
    const yol = path.join(kok, 'x.db')
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(yol)
    db.exec('create table memories (id TEXT PRIMARY KEY, data TEXT NOT NULL)')
    db.exec("create virtual table memories_fts using fts5(text, content='memories', content_rowid='rowid')")
    db.prepare('insert into memories (id,data) values (?,?)').run('m1', 'x')
    db.close()

    const iz = modul.parmakIzi(yol, 'memories') as {
      tablolar: string[]
      satirlar: Record<string, number | string>
      sayi: number
    }
    expect(iz.tablolar, 'sanal tablo listeden DUSTU — varligi artik karsilastirilmiyor').toContain('memories_fts')
    expect(iz.satirlar.memories_fts, 'sanal tablo sayilmaya calisildi — parmak izi patlar').toBe('SANAL')
    expect(iz.sayi, 'ana tablo sayimi bozuldu').toBe(1)
  })

  it('⭐AYARA KAYITLI: SessionEnd grubunda kanca var, zaman butcesi yazili (karar 51, Recep onayi 2026-09-18)', () => {
    /**
     * ⭐KURULU OLMAK KAYITLI OLMAK DEĞİLDİR. Bu depoda ölçülmüş sınıf: dosya var, kimse
     * çağırmıyor, kimse fark etmiyor. Yedeğin tamamı bu satıra bağlı — satır düşerse yedek
     * sessizce elle kalır ve "otomatik" sanılır.
     *
     * Onay: Recep, ALTYAPI penceresi, 2026-09-18, "51 evet".
     */
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks?: { SessionEnd?: { matcher?: string; hooks?: { command?: string; timeout?: number }[] }[] }
    }
    const gruplar = ayar.hooks?.SessionEnd ?? []
    const kanca = gruplar
      .flatMap((g) => g.hooks ?? [])
      .find((h) => String(h.command ?? '').includes('sage-yedek-oturum-sonu.cjs'))
    expect(kanca, 'SessionEnd grubunda sage yedek kancasi YOK — yedek sessizce elle kaldi').toBeDefined()
    expect(String(kanca?.command), 'kancada mutlak yol var (kimlik sizintisi, depo PUBLIC)').not.toMatch(
      /[A-Za-z]:[\\/]|\/Users\/|\/home\//,
    )
    expect(kanca?.timeout, 'zaman butcesi yazili degil — oturum kapanisi kancaya kilitlenebilir').toBeGreaterThan(0)
  })

  it('⭐ISTEM SATIRI ESIKLIDIR: taze yedekte SUSAR, yedek yokken ve DOGRULANMAMIS dosyada KONUSUR', () => {
    /**
     * ⭐NİÇİN EŞİKLİ: her turda "her şey yolunda" yazan satır, bağlamdan yer alır ve hiçbir
     * karar değiştirmez. Ama sessizlik de bedava değildir — bu yüzden ÜÇ hâlde konuşur.
     * (Recep'in 09-18 hükmü: bağlam bütçesi adına kalite kısılmaz; kısılacak şey GÜRÜLTÜDÜR.)
     */
    const kos = (dizin: string): string => {
      const r = spawnSync(process.execPath, [KANCA_ISTEM], {
        input: '{"session_id":"t"}',
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_SAGE_YEDEK_DIZINI: dizin },
        timeout: 60_000,
      })
      return `${r.stdout ?? ''}${r.stderr ?? ''}`
    }

    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-esik-bos-'))
    expect(kos(bos), 'yedek yokken satir CIKMADI').toContain('SAGE:')

    const taze = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-esik-taze-'))
    // ⛔HER DEPO icin taze dosya. Satır EN KÖTÜ depoyu anlatır; biri eksikse HAKLI olarak konuşur
    // (2026-09-19: pano deposu eklenince bu kol düştü ve doğrusu buydu — fikstür eksikti, kapı değil).
    fs.writeFileSync(path.join(taze, 'sage-2999-01-01T0000Z.db'), 'x', 'utf8')
    fs.writeFileSync(path.join(taze, 'kanban-2999-01-01T0000Z.sqlite'), 'x', 'utf8')
    expect(kos(taze), 'taze yedekte satir YAZILDI — esik calismiyor, her tur gurultu').not.toContain('SAGE:')

    const dusmus = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-esik-dusmus-'))
    fs.writeFileSync(path.join(dusmus, 'sage-2999-01-01T0000Z.db'), 'x', 'utf8')
    fs.writeFileSync(path.join(dusmus, 'sage-2999-01-01T0001Z.db.DOGRULANMADI'), 'x', 'utf8')
    const metin = kos(dusmus)
    expect(metin, 'DUSMUS kosum taze yedek yaninda GIZLENDI — en agir sinyal susturuldu').toContain('DOGRULANMAMIS')
  })
})
