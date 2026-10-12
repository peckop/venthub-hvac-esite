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
        // VENTHUB_RECEP_DEFTER: gerçek makine defterini yedeklemesin/döndürmesin (ARC-15).
        env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_SAGE_YEDEK_DIZINI: dizin, VENTHUB_RECEP_DEFTER: path.join(dizin, 'yok', 'defter.jsonl') },
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
        // VENTHUB_RECEP_DEFTER: bu makinenin GERÇEK defterine bakmasın (ARC-15: istem satırı defter yedeğini de ölçer).
        env: { ...process.env, VENTHUB_SAGE_YEDEK_DIZINI: dizin, VENTHUB_RECEP_DEFTER: path.join(dizin, 'yok', 'defter.jsonl') },
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

/**
 * INV-KANBAN-YEDEK-1 (ARC-9, 2026-10-01) — karar 219 ile Kanban iş kartlarının TEK kaynağı oldu.
 *
 * ⭐NİÇİN AYRI BLOK: yukarıdaki pano kolu yalnız "dosya yedekleniyor mu"yu ölçer. Bu blok dört ayrı
 * arızayı ölçer: (1) satır sayısı tutar ama KART sayısı tutmaz, (2) saatlik yedekte düz "son N"
 * kuralı dünkü panoyu siler, (3) geri yükleme çalışan servisin altından dosya değiştirir ya da
 * eski hâli siler, (4) tazelik eşiği depo başına değildir. Ölçüm 10-01: sabah yedeği 10 pano /
 * 387 kart, öğlen canlı 12 pano / 414 kart; 24 saat kuralı aradaki 27 kartı yedeksiz bırakıyordu.
 */
type KanbanSayim = {
  pano: number
  kart: number
  olay: number | null
  bozukPayload: number
  butunluk: string
}
type KanbanDepo = {
  ad: string
  onek: string
  tazeSaat: number
  uyariSaat: number
  saklama: { son: number; gunluk: number } | null
}
type GeriSonuc = {
  durum: string
  sebep?: string
  yedek?: string
  hedef?: string
  tasinacak?: string[]
  oncesi?: string[]
  icerik?: KanbanSayim | null
}
const kanbanModul = require_(MODUL_YOLU) as {
  DEPOLAR: KanbanDepo[]
  kanbanSayim: (yol: string) => KanbanSayim | null
  kademeliSilinecek: (dosyalar: string[], depo: KanbanDepo) => string[]
  surecCanli: (pid: number) => boolean
  geriYukle: (
    depo: string,
    dosya?: string | null,
    s?: { evet?: boolean; simdi?: Date; surecler?: string[] | null },
  ) => GeriSonuc
  yedekAl: (
    simdi?: Date,
    depo?: string,
  ) => {
    durum: string
    yol?: string
    sebep?: string
    kanban?: KanbanSayim | null
  }
  sonDurum: (d?: string, simdi?: number) => { geciken: { depo: string; saat: number }[] }
}

/** Gerçek biçimde (kanban_boards.payload JSON) WAL kipli bir pano veritabanı kurar; bağlantı AÇIK döner. */
function kanbanKur(panolar: (number | 'BOZUK')[]): {
  kok: string
  yol: string
  db: SqliteDb
} {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-arc9-'))
  fs.mkdirSync(path.join(kok, '.wrongstack', 'kanbans'), { recursive: true })
  const yol = path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(yol)
  db.exec('pragma journal_mode = WAL')
  db.exec(
    'create table kanban_boards (id TEXT PRIMARY KEY, payload TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)',
  )
  db.exec(
    'create table kanban_events (seq INTEGER PRIMARY KEY AUTOINCREMENT, board_id TEXT NOT NULL, payload TEXT NOT NULL)',
  )
  panolar.forEach((n, i) => {
    const payload =
      n === 'BOZUK'
        ? '{"tasks": [ yarim'
        : JSON.stringify({
            id: `b${i}`,
            title: `Pano ${i}`,
            tasks: Array.from({ length: n }, (_, k) => ({ id: `t${i}-${k}` })),
          })
    db.prepare('insert into kanban_boards (id,payload,revision,updated_at) values (?,?,1,?)').run(
      `b${i}`,
      payload,
      '2026-10-01',
    )
    db.prepare('insert into kanban_events (board_id,payload) values (?,?)').run(`b${i}`, '{}')
  })
  return { kok, yol, db }
}

describe('INV-KANBAN-YEDEK-1 · Kanban yedegi kart sayisiyla dogrulanir, kademeli saklanir, geri yuklenir', () => {
  it('⭐KART SAYIMI: yedek pano ve kart sayisini payload ICINDEN olcer ve kaynakla esitler', () => {
    const { kok, yol, db } = kanbanKur([3, 4, 0])
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-hedef-'))
    expect(fs.existsSync(yol + '-wal'), 'WAL yok — tuzak uretilemedi, kol KOR').toBe(true)

    const s = kanbanModul.yedekAl(new Date(), 'kanban')
    expect(s.durum, `yedek alinamadi: ${s.sebep}`).toBe('alindi')
    expect(s.kanban, 'kart sayimi sonuca yazilmadi').toMatchObject({
      pano: 3,
      kart: 7,
      bozukPayload: 0,
      butunluk: 'ok',
    })
    expect(kanbanModul.kanbanSayim(String(s.yol))?.kart, 'yedek dosyasinda kart eksik').toBe(7)
    db.close()
  })

  it('⛔SABOTAJ: payload bozuksa satir sayisi tutsa da yedek DOGRULANMAZ', () => {
    const { kok, db } = kanbanKur([2, 'BOZUK'])
    const hedef = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-bozuk-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = hedef

    const s = kanbanModul.yedekAl(new Date(), 'kanban')
    expect(s.durum, 'bozuk payload "alindi" sayildi — satir sayisi korlugu').toBe('dogrulanmadi')
    expect(s.sebep).toMatch(/payload/)
    expect(
      fs.readdirSync(hedef).some((f) => f.endsWith('.DOGRULANMADI')),
      'kanit dosyasi birakilmadi',
    ).toBe(true)
    db.close()
  })

  it('kanban_boards tablosu olmayan veritabaninda kart sayimi null doner (uydurma sayi yok)', () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-bicimsiz-'))
    const yol = path.join(kok, 'x.sqlite')
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(yol)
    db.exec('create table baska (id TEXT)')
    db.close()
    expect(kanbanModul.kanbanSayim(yol)).toBeNull()
  })

  it('⭐KADEMELI SAKLAMA: son 24 kopya + gun basina en yeni kopya (30 gun); dunku pano SILINMEZ', () => {
    const depo = kanbanModul.DEPOLAR.find((d) => d.ad === 'kanban')
    if (!depo) throw new Error('kanban deposu DEPOLAR listesinde yok')
    expect(depo.saklama, 'kanban icin kademeli saklama tanimli degil').toEqual({
      son: 24,
      gunluk: 30,
    })
    expect(depo.tazeSaat, 'kanban tazelik esigi 1 saat degil').toBe(1)
    expect(kanbanModul.DEPOLAR.find((d) => d.ad === 'sage')?.tazeSaat, 'sage esigi degisti').toBe(24)

    // 40 gün × günde 3 kopya (06, 12, 18) + 41. günde saat başı 24 kopya.
    const gunAdi = (g: number): string => new Date(Date.UTC(2026, 7, g)).toISOString().slice(0, 10)
    const adlar: string[] = []
    for (let g = 1; g <= 40; g++) {
      for (const s of ['0600', '1200', '1800']) adlar.push(`kanban-${gunAdi(g)}T${s}Z.sqlite`)
    }
    for (let h = 0; h < 24; h++) adlar.push(`kanban-${gunAdi(41)}T${String(h).padStart(2, '0')}00Z.sqlite`)
    adlar.sort()

    const silinecek = new Set(kanbanModul.kademeliSilinecek(adlar, depo))
    const kalan = adlar.filter((a) => !silinecek.has(a))
    // Son 24 kopyanın hepsi durur.
    for (const a of adlar.slice(-24)) expect(kalan, `son 24 icindeki ${a} silindi`).toContain(a)
    // Son 30 günün (12..41) her birinden EN YENİ kopya durur; aynı günün eski kopyası gider.
    for (let g = 12; g <= 40; g++) {
      expect(kalan, `${gunAdi(g)} gununun son kopyasi silindi`).toContain(`kanban-${gunAdi(g)}T1800Z.sqlite`)
      expect(kalan, `${gunAdi(g)} gununun eski kopyasi tutuldu`).not.toContain(`kanban-${gunAdi(g)}T0600Z.sqlite`)
    }
    // 30 günden eski günler tamamen gider.
    expect(
      kalan.some((a) => a.includes(`${gunAdi(11)}T`)),
      '30 gunden eski kopya tutuldu',
    ).toBe(false)
    expect(kalan.length, 'kalan kopya sayisi beklenenden farkli').toBe(24 + 29)
    // Adı çözülemeyen dosyaya DOKUNULMAZ.
    expect(kanbanModul.kademeliSilinecek(['kanban-elle-aldim.sqlite', ...adlar], depo)).not.toContain(
      'kanban-elle-aldim.sqlite',
    )
  })

  it('⭐GERI YUKLEME: --evet olmadan yalniz PLAN; servis canliyken RET; uygulaninca eski hal .oncesi ile KALIR', () => {
    const { kok, yol, db } = kanbanKur([5, 2])
    const hedef = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-geri-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = hedef
    expect(kanbanModul.yedekAl(new Date(), 'kanban').durum).toBe('alindi')

    // Yedekten SONRA canlıya 3 kart daha eklenir: geri yükleme 7 karta DÖNMELİ.
    db.prepare('insert into kanban_boards (id,payload,revision,updated_at) values (?,?,1,?)').run(
      'b9',
      JSON.stringify({
        id: 'b9',
        tasks: [{ id: 'x1' }, { id: 'x2' }, { id: 'x3' }],
      }),
      '2026-10-01',
    )
    db.close()
    expect(kanbanModul.kanbanSayim(yol)?.kart).toBe(10)

    // 1) PLAN: hiçbir şey değişmez.
    // Süreç listesi SABİT verilir: kanban artık süreç deseni de taşır, gerçek liste makineye göre değişir.
    const plan = kanbanModul.geriYukle('kanban', null, { surecler: [] })
    expect(plan.durum, `plan uretilemedi: ${plan.sebep}`).toBe('kuru')
    expect(plan.icerik?.kart, 'plan yedegin kart sayisini yazmiyor').toBe(7)
    expect(kanbanModul.kanbanSayim(yol)?.kart, 'plan asamasinda canli dosya DEGISTI').toBe(10)

    // 2) SERVİS CANLI: bu test sürecinin pid'i "çalışan servis" olarak yazılır → RET.
    const servis = path.join(kok, '.wrongstack', 'kanban-server.json')
    fs.writeFileSync(servis, JSON.stringify({ pid: process.pid }), 'utf8')
    const ret = kanbanModul.geriYukle('kanban', null, { evet: true, surecler: [] })
    expect(ret.durum, 'calisan servisin altindan dosya degistirildi').toBe('servis-canli')
    expect(kanbanModul.kanbanSayim(yol)?.kart, 'ret edilen geri yukleme canliyi DEGISTIRDI').toBe(10)

    // 3) SERVİS KAPALI: geri yüklenir, eski dosya silinmez.
    fs.unlinkSync(servis)
    const r = kanbanModul.geriYukle('kanban', null, { evet: true, surecler: [] })
    expect(r.durum, `geri yukleme basarisiz: ${r.sebep}`).toBe('geri-yuklendi')
    expect(kanbanModul.kanbanSayim(yol), 'geri yuklenen pano yedekle ayni degil').toMatchObject({
      pano: 2,
      kart: 7,
      butunluk: 'ok',
    })
    expect(r.oncesi?.length, 'eski hal yana alinmadi').toBeGreaterThan(0)
    for (const f of r.oncesi ?? []) expect(fs.existsSync(f), `eski hal SILINMIS: ${f}`).toBe(true)
    const eski = (r.oncesi ?? []).find((f) => /_kanban\.sqlite\.oncesi-[^-]+$/.test(f))
    expect(eski, 'ana dosyanin eski hali listede yok').toBeDefined()
    expect(kanbanModul.kanbanSayim(String(eski))?.kart, 'yana alinan eski dosya 10 karti tasimiyor').toBe(10)
  })

  it('GERI YUKLEME hata yollari: bilinmeyen depo, servis denetimi olmayan depo, olmayan yedek, bos yedek dizini', () => {
    process.env.CLAUDE_PROJECT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-geri-hata-'))
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-geri-bos-'))
    expect(kanbanModul.geriYukle('yok').durum).toBe('hata')
    // ARC-71: sage artık geri yüklenebilir (süreç denetimli); yedeği yoksa sebebi yedeksizliktir, "tanımlı değil" DEĞİL.
    expect(kanbanModul.geriYukle('sage').sebep, 'sage geri yukleme hala tanimsiz').toMatch(/yedegi yok/)
    expect(kanbanModul.geriYukle('kanban').sebep).toMatch(/yedegi yok/)
    expect(kanbanModul.geriYukle('kanban', 'kanban-2000-01-01T0000Z.sqlite').sebep).toMatch(/bulunamadi/)
    expect(kanbanModul.surecCanli(process.pid)).toBe(true)
    expect(kanbanModul.surecCanli(-1)).toBe(false)
  })

  it('⭐TAZELIK ESIGI DEPO BASINA: 25 saatlik kanban yedegi GECIKMIS, 25 saatlik sage yedegi DEGIL', () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-esik-kok-'))
    fs.mkdirSync(path.join(kok, '.wrongstack', 'kanbans'), { recursive: true })
    fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), {
      recursive: true,
    })
    fs.writeFileSync(path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite'), 'x')
    fs.writeFileSync(path.join(kok, '.wrongstack', 'memories', 'sage.db'), 'x')
    process.env.CLAUDE_PROJECT_DIR = kok

    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-esik-'))
    const simdi = Date.now()
    const eski = new Date(simdi - 25 * 3_600_000 - 60_000)
    for (const ad of ['kanban-2026-09-30T0000Z.sqlite', 'sage-2026-09-30T0000Z.db']) {
      fs.writeFileSync(path.join(dizin, ad), 'x')
      fs.utimesSync(path.join(dizin, ad), eski, eski)
    }
    const d = kanbanModul.sonDurum(dizin, simdi)
    expect(
      d.geciken.map((g) => g.depo),
      'esik depo basina degil',
    ).toEqual(['kanban'])
    expect(d.geciken[0]?.saat).toBe(25)
  })
})

/**
 * INV-POSTA-YEDEK-1 (ARC-71, OPS kararı 10-09) — pencereler arası posta kutuları da WAL dahil tutarlı yedeklenir,
 * sage ve posta geri yüklenebilir (süreç denetimli). Ölçülen tuzak (TAKİP 10-09): canlı kutuda ana dosya 160 KB
 * iken WAL 4,1 MB; düz kopya mesajların çoğunu atlar. Sayı ikiyle sınırlı DEĞİL: kökteki her `_mailbox.sqlite` depodur.
 */
type PostaModul = {
  tumDepolar: () => { ad: string; onek: string; uzanti: string; mutlak?: string }[]
  yedekDeseni: (d: { onek: string; uzanti: string; mutlak?: string }) => RegExp
  yedekAl: (simdi?: Date, depo?: string) => { durum: string; yol?: string; sebep?: string; yedek?: Iz }
  hepsiniAl: (simdi?: Date) => { depo: string; durum: string; yol?: string }[]
  liste: (d?: string, onek?: string | null) => { ad: string }[]
  geriYukle: (
    depo: string,
    dosya?: string | null,
    s?: {
      evet?: boolean
      simdi?: Date
      surecler?: string[] | null
      kok?: string
      postaKoku?: string
      canliPostaKoku?: string
    },
  ) => { durum: string; sebep?: string; oncesi?: string[]; hedef?: string; iz?: Iz; yedek?: string; kok?: string }
  kanonikYol: (yol: string) => string | null
  canliHedefMi: (
    depo: { ad: string; goreli?: string[]; mutlak?: string },
    hedefYol: string,
    hedefKok: string | null,
    canliPostaKoku?: string,
    canliKokler?: string[] | null,
  ) => boolean
}
const anaKokModul = require_(path.join(KOK, 'scripts', 'hijyen', 'ana-kok.cjs')) as {
  anaKokBul: (baslangic: string) => string | null
}
const postaModul = require_(MODUL_YOLU) as PostaModul
const surecModul = require_(path.join(KOK, 'scripts', 'hijyen', 'surec-listesi.cjs')) as {
  calisanSurecler: () => string[] | null
}
const ESKI_POSTA = process.env.VENTHUB_POSTA_KOKU
afterEach(() => {
  if (ESKI_POSTA === undefined) delete process.env.VENTHUB_POSTA_KOKU
  else process.env.VENTHUB_POSTA_KOKU = ESKI_POSTA
})

/** Her proje için WAL kipli `_mailbox.sqlite` kurar; bağlantılar AÇIK döner (kapanış checkpoint yapar, tuzak kaybolur). */
function postaKur(projeler: Record<string, number>): { koku: string; dbler: Record<string, SqliteDb>; yol: (p: string) => string } {
  const koku = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-'))
  const { DatabaseSync } = sqlite()
  const dbler: Record<string, SqliteDb> = {}
  for (const [proje, n] of Object.entries(projeler)) {
    fs.mkdirSync(path.join(koku, proje), { recursive: true })
    const db = new DatabaseSync(path.join(koku, proje, '_mailbox.sqlite'))
    db.exec('pragma journal_mode = WAL')
    db.exec('create table messages (id INTEGER PRIMARY KEY, alici TEXT NOT NULL, govde TEXT NOT NULL)')
    for (let i = 0; i < n; i++) db.prepare('insert into messages (alici,govde) values (?,?)').run('pencere', `mesaj ${i}`)
    dbler[proje] = db
  }
  return { koku, dbler, yol: (p) => path.join(koku, p, '_mailbox.sqlite') }
}

function postaOrtam(koku: string): { kok: string; dizin: string } {
  // Kaynağı olmayan sage/kanban kökü: yalnız posta kutuları sınanır.
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-kok-'))
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-hedef-'))
  process.env.VENTHUB_POSTA_KOKU = koku
  process.env.CLAUDE_PROJECT_DIR = kok
  process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
  return { kok, dizin }
}

describe('INV-POSTA-YEDEK-1 · posta kutulari WAL dahil yedeklenir, sage ve posta geri yuklenir', () => {
  it('⭐WAL: mesajlar yalniz WAL da — YEDEK tam, DUZ KOPYA eksik; her proje AYRI depo', () => {
    const k = postaKur({ 'venthub-hvac-7e017f': 40, 'ops-ws-repo-a9436a': 3 })
    const { dizin } = postaOrtam(k.koku)
    const adlar = postaModul.tumDepolar().map((d) => d.ad)
    expect(adlar, 'posta kutulari depo listesinde YOK — yukseltme gunu mesajlar yedeksiz').toEqual(
      expect.arrayContaining(['posta-venthub-hvac-7e017f', 'posta-ops-ws-repo-a9436a']),
    )

    const s = postaModul.yedekAl(new Date(), 'posta-venthub-hvac-7e017f')
    expect(s.durum, `posta yedegi alinamadi: ${s.sebep}`).toBe('alindi')
    expect(s.yedek?.sayi, 'posta yedegi EKSIK — WAL daki mesajlar atlandi').toBe(40)
    expect(path.basename(String(s.yol))).toMatch(/^posta-venthub-hvac-7e017f-\d{4}-\d{2}-\d{2}T\d{4}Z\.sqlite$/)
    expect(path.dirname(String(s.yol)), 'yedek hedef dizin disina yazildi').toBe(dizin)

    // Düz kopya (tuzak): yalnız ana dosya → mesajların çoğu/tamamı yok.
    const duz = path.join(dizin, 'duz-kopya.bin')
    fs.copyFileSync(k.yol('venthub-hvac-7e017f'), duz)
    let duzSayi = 0
    try {
      const { DatabaseSync } = sqlite()
      const d = new DatabaseSync(duz, { readOnly: true })
      duzSayi = Number(d.prepare('select count(*) as c from messages').get().c)
      d.close()
    } catch {
      duzSayi = 0 // tablo bile yok: WAL tuzağının uç hâli
    }
    expect(duzSayi, 'fikstur sahte: duz kopya da tam — WAL tuzagi uretilmedi').toBeLessThan(40)
    for (const db of Object.values(k.dbler)) db.close()
  })

  it('HEPSI alinir; kutusu olmayan dizin ve on ek cakismasi (a / a-b) karismaz', () => {
    const k = postaKur({ a: 2, 'a-b': 5 })
    fs.mkdirSync(path.join(k.koku, 'bos-proje'))
    const { dizin } = postaOrtam(k.koku)
    const sonuc = postaModul.hepsiniAl(new Date()).filter((r) => r.depo.startsWith('posta-'))
    expect(sonuc.map((r) => r.depo).sort(), 'kutusu olmayan dizin depo sayildi ya da kutu atlandi').toEqual([
      'posta-a',
      'posta-a-b',
    ])
    for (const r of sonuc) expect(r.durum, r.depo).toBe('alindi')
    const depolar = postaModul.tumDepolar()
    const a = depolar.find((d) => d.ad === 'posta-a')
    const ab = depolar.find((d) => d.ad === 'posta-a-b')
    if (!a || !ab) throw new Error('depolar listede yok')
    const dosyalar = fs.readdirSync(dizin)
    expect(dosyalar.filter((f) => postaModul.yedekDeseni(a).test(f)), 'a deposu a-b nin yedegini yutuyor').toHaveLength(1)
    expect(dosyalar.filter((f) => postaModul.yedekDeseni(ab).test(f))).toHaveLength(1)
    for (const db of Object.values(k.dbler)) db.close()
  })

  it('⭐AYNI DAKIKADA ikinci kosum DUSMEZ (eski kusur); dogrulama duserse sagliklı yedek YERINDE kalir', () => {
    const k = postaKur({ p1: 6 })
    postaOrtam(k.koku)
    const simdi = new Date()
    const ilk = postaModul.yedekAl(simdi, 'posta-p1')
    const ikinci = postaModul.yedekAl(simdi, 'posta-p1')
    expect(ilk.durum).toBe('alindi')
    expect(ikinci.durum, `ayni dakikada ikinci kosum dustu: ${ikinci.sebep}`).toBe('alindi')
    expect(ikinci.yol).toBe(ilk.yol)
    expect(fs.readdirSync(path.dirname(String(ilk.yol))).filter((f) => f.endsWith('.gecici')), 'gecici dosya kaldi').toEqual([])

    // Sabotaj: geçici ada DİZİN konur → yazma düşer; aynı dakikadaki sağlam yedek bozulmaz/silinmez.
    const bayt = fs.statSync(String(ilk.yol)).size
    fs.mkdirSync(String(ilk.yol) + '.gecici')
    const dusen = postaModul.yedekAl(simdi, 'posta-p1')
    expect(dusen.durum, 'engellenen yazma basari gibi gorunuyor').not.toBe('alindi')
    expect(fs.existsSync(String(ilk.yol)), 'dusen kosum sagliklı yedegi SILDI').toBe(true)
    expect(fs.statSync(String(ilk.yol)).size).toBe(bayt)
    for (const db of Object.values(k.dbler)) db.close()
  })

  it('⭐POSTA GERI YUKLEME: plan sey degistirmez; MCP sureci varken RET; sureç listesi ALINAMAZSA RET; uygulaninca eski hal KALIR', () => {
    const k = postaKur({ p1: 8 })
    postaOrtam(k.koku)
    expect(postaModul.yedekAl(new Date(), 'posta-p1').durum).toBe('alindi')
    // Yedekten SONRA 5 mesaj daha: geri yükleme 8'e DÖNMELİ.
    for (let i = 0; i < 5; i++) k.dbler.p1?.prepare('insert into messages (alici,govde) values (?,?)').run('pencere', `yeni ${i}`)
    k.dbler.p1?.close()
    const say = (yol: string) => {
      const { DatabaseSync } = sqlite()
      const d = new DatabaseSync(yol, { readOnly: true })
      try {
        return Number(d.prepare('select count(*) as c from messages').get().c)
      } finally {
        d.close()
      }
    }
    expect(say(k.yol('p1'))).toBe(13)

    // 1) PLAN: hiçbir şey değişmez (süreç listesi boş verilir: plan yine de adımları yazar).
    const plan = postaModul.geriYukle('posta-p1', null, { surecler: [] })
    expect(plan.durum, `plan uretilemedi: ${plan.sebep}`).toBe('kuru')
    expect(say(k.yol('p1')), 'plan asamasinda canli dosya DEGISTI').toBe(13)

    // 2) MAILBOX SÜRECİ VAR → RET (kendi süreci sayılmaz).
    const canli = [
      'node C:\\x\\tools\\wrongstack-mcp\\kanonik-kok.cjs tools/wrongstack-mcp/node_modules/@wrongstack/mailbox-mcp/dist/cli.js --stdio',
    ]
    const ret = postaModul.geriYukle('posta-p1', null, { evet: true, surecler: canli })
    expect(ret.durum, 'acik pencerenin altindan posta dosyasi degistirildi').toBe('servis-canli')
    expect(say(k.yol('p1')), 'ret edilen geri yukleme canliyi DEGISTIRDI').toBe(13)
    const kendi = ['node scripts/hijyen/sage-yedek.cjs --geri posta-p1 --evet mailbox-mcp/dist/cli.js']
    expect(
      postaModul.geriYukle('posta-p1', null, { surecler: kendi }).durum,
      'betigin kendi sureci "pencere acik" sayildi',
    ).toBe('kuru')

    // 3) LİSTE ALINAMADI → RET (bakamamak "kimse yok" demek değildir).
    const olculemedi = postaModul.geriYukle('posta-p1', null, { evet: true, surecler: null })
    expect(olculemedi.durum).toBe('servis-olculemedi')
    expect(say(k.yol('p1'))).toBe(13)

    // 4) KAPALI: geri yüklenir, eski dosya silinmez.
    const r = postaModul.geriYukle('posta-p1', null, { evet: true, surecler: ['node baska-bir-sey.js'] })
    expect(r.durum, `geri yukleme basarisiz: ${r.sebep}`).toBe('geri-yuklendi')
    expect(say(k.yol('p1')), 'geri yuklenen kutu yedekle ayni degil').toBe(8)
    expect(r.oncesi?.length, 'eski hal yana alinmadi').toBeGreaterThan(0)
    for (const f of r.oncesi ?? []) expect(fs.existsSync(f), `eski hal SILINMIS: ${f}`).toBe(true)
    const eski = (r.oncesi ?? []).find((f) => /_mailbox\.sqlite\.oncesi-[^-]+$/.test(f))
    expect(eski, 'ana dosyanin eski hali listede yok').toBeDefined()
    expect(say(String(eski)), 'yana alinan eski dosya 13 mesaji tasimiyor').toBe(13)
  })

  it('⭐SAGE GERI YUKLEME (OPS karar 3): sage-mcp sureci varken RET, kapaliyken geri yuklenir', () => {
    const { kok, db } = depoKur(9)
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-geri-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
    process.env.VENTHUB_POSTA_KOKU = path.join(dizin, 'posta-yok')
    expect(postaModul.yedekAl(new Date(), 'sage').durum).toBe('alindi')
    db.prepare(
      `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
       values (?,?,'active','fact','project',0.8,0.8,1,'2026-09-18','2026-09-18')`,
    ).run('m-yeni', JSON.stringify({ text: 'yeni', anchors: [] }))
    db.close()
    const say = () => modul.parmakIzi(path.join(kok, '.wrongstack', 'memories', 'sage.db')).sayi
    expect(say()).toBe(10)

    const ret = postaModul.geriYukle('sage', null, {
      evet: true,
      surecler: ['node tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js --project-root .'],
    })
    expect(ret.durum, 'sage MCP sureci varken geri yukleme calisti').toBe('servis-canli')
    expect(say(), 'ret edilen geri yukleme sage i DEGISTIRDI').toBe(10)

    const r = postaModul.geriYukle('sage', null, { evet: true, surecler: [] })
    expect(r.durum, `sage geri yukleme basarisiz: ${r.sebep}`).toBe('geri-yuklendi')
    expect(say(), 'geri yuklenen sage yedekle ayni degil').toBe(9)
    for (const f of r.oncesi ?? []) expect(fs.existsSync(f), `eski hal SILINMIS: ${f}`).toBe(true)
  })

  it('⭐KANBAN SUREC DENETIMI (OPS 10-12): pid dosyasi YOKKEN kanban-mcp stdio sureci varsa RET; liste alinamazsa RET', () => {
    // ARC-98'den beri her pencere kanban-mcp'yi stdio + --writable açar; dosyayı tutan süreç pid dosyasında görünmez.
    const { kok, db } = kanbanKur([4, 1])
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kanban-surec-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
    process.env.VENTHUB_POSTA_KOKU = path.join(dizin, 'posta-yok')
    expect(postaModul.yedekAl(new Date(), 'kanban').durum).toBe('alindi')
    db.close()
    expect(fs.existsSync(path.join(kok, '.wrongstack', 'kanban-server.json')), 'fikstur sahte: pid dosyasi var').toBe(false)

    const stdio = [
      'node C:\\x\\tools\\wrongstack-mcp\\node_modules\\@wrongstack\\kanban-mcp\\dist\\cli.js --writable --project-root C:\\x',
    ]
    expect(
      postaModul.geriYukle('kanban', null, { evet: true, surecler: stdio }).durum,
      'kanban dosyasini acik tutan stdio sureci pid dosyasi olmadigi icin gozden kacti',
    ).toBe('servis-canli')
    expect(postaModul.geriYukle('kanban', null, { evet: true, surecler: null }).durum).toBe('servis-olculemedi')
    expect(postaModul.geriYukle('kanban', null, { surecler: ['node baska-bir-sey.js'] }).durum).toBe('kuru')
  })

  it('⭐CANLI KOK UC YAZILISLA RET (OPS 10-12): ayni dizin farkli yazilsa da surec denetimi ATLANMAZ; kok cozulemezse RET', () => {
    // Plan modunda (evet yok) koşar: denetim atlanırsa durum 'kuru' olur, canlı depoya YAZILMAZ.
    const { kok, db } = depoKur(5)
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-canli-yazilis-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
    process.env.VENTHUB_POSTA_KOKU = path.join(dizin, 'posta-yok')
    expect(postaModul.yedekAl(new Date(), 'sage').durum).toBe('alindi')
    db.close()

    const canli = anaKokModul.anaKokBul(KOK) ?? KOK
    const yazilislar: Record<string, string> = {
      'oldugu gibi': canli,
      'egik cizgi + sondaki ayrac (+ kucuk harf Windows)': (process.platform === 'win32' ? canli.toLowerCase() : canli)
        .replace(/\\/g, '/')
        .concat('/'),
      'alt dizin uzerinden (worktree/ic dizin)': path.join(canli, 'src'),
    }
    const baglanti = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vh-junction-')), 'canli-bag')
    try {
      fs.symlinkSync(canli, baglanti, 'junction')
      yazilislar['junction/sembolik bag uzerinden'] = baglanti
    } catch {
      /* bag kurulamayan ortam: kalan yazilislar yine sinanir */
    }
    const surec = ['node tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js --project-root .']
    for (const [ad, yol] of Object.entries(yazilislar)) {
      expect(postaModul.geriYukle('sage', null, { surecler: surec, kok: yol }).durum, `${ad}: denetim atlandi`).toBe(
        'servis-canli',
      )
      expect(
        postaModul.geriYukle('sage', null, { surecler: null, kok: yol }).durum,
        `${ad}: surec listesi yokken denetim atlandi`,
      ).toBe('servis-olculemedi')
    }

    // Kök çözülemiyor: fail-closed.
    expect(postaModul.kanonikYol('')).toBeNull()
    expect(postaModul.canliHedefMi({ ad: 'sage', goreli: ['.wrongstack', 'memories', 'sage.db'] }, '', null)).toBe(true)
    // Canlı kök HİÇ çözülemediyse (git yok / ağaç bulunamadı) hedef yalıtılmış sayılamaz: RET.
    const sageDepo = { ad: 'sage', goreli: ['.wrongstack', 'memories', 'sage.db'] }
    const baska = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-baska-kok-'))
    const baskaHedef = path.join(baska, ...sageDepo.goreli)
    expect(
      postaModul.canliHedefMi(sageDepo, baskaHedef, baska, undefined, []),
      'canli kok bilinmiyorken hedef yalitilmis sayildi',
    ).toBe(true)
    // Canlı kök biliniyor ve hedef onun dışında: yalıtılmış (false) — pozitif kol.
    expect(postaModul.canliHedefMi(sageDepo, baskaHedef, baska, undefined, [canli])).toBe(false)
    // Aynı hedef canlı kök listesinde ise canlı.
    expect(postaModul.canliHedefMi(sageDepo, path.join(canli, ...sageDepo.goreli), canli, undefined, [canli])).toBe(true)
    // Aynı dizinin iki yazılışı AYNI kanonik yola iner.
    expect(postaModul.kanonikYol(canli)).toBe(postaModul.kanonikYol(canli.replace(/\\/g, '/') + '/'))
  })

  it('⭐YALITILMIS KOK PROVASI (OPS 10-12): secenek verilmis ve hedef canli degilse surec denetimi atlanir, YALNIZ o koka yazilir', () => {
    const { kok, db } = depoKur(9)
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-yalitilmis-'))
    process.env.CLAUDE_PROJECT_DIR = kok
    process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
    process.env.VENTHUB_POSTA_KOKU = path.join(dizin, 'posta-yok')
    expect(postaModul.yedekAl(new Date(), 'sage').durum).toBe('alindi')
    db.prepare(
      `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
       values (?,?,'active','fact','project',0.8,0.8,1,'2026-09-18','2026-09-18')`,
    ).run('m-yeni', JSON.stringify({ text: 'yeni', anchors: [] }))
    db.close()
    const say = (k: string) => modul.parmakIzi(path.join(k, '.wrongstack', 'memories', 'sage.db')).sayi
    expect(say(kok)).toBe(10)

    const surec = ['node tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js --project-root .']
    // Ortam değişkeni tek başına denetimi ATLATMAZ (atlatma bilinçli seçenek ister).
    expect(postaModul.geriYukle('sage', null, { evet: true, surecler: surec }).durum).toBe('servis-canli')
    expect(say(kok)).toBe(10)

    const izole = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-izole-kok-'))
    const r = postaModul.geriYukle('sage', null, { evet: true, surecler: surec, kok: izole })
    expect(r.durum, `yalitilmis geri yukleme basarisiz: ${r.sebep}`).toBe('geri-yuklendi')
    expect(r.kok).toBe('yalitilmis')
    expect(String(r.hedef).startsWith(izole), 'yalitilmis kok disina yazildi').toBe(true)
    expect(say(izole), 'yalitilmis kokteki sage yedekle ayni degil').toBe(9)
    expect(say(kok), 'yalitilmis geri yukleme CANLI koku degistirdi').toBe(10)
  })

  it('⭐POSTA: canli posta kokunun uc yazilisi RET; yalitilmis posta kokune geri yukleme surec varken calisir', () => {
    // Hermetik "canlı posta kökü": gerçek ev dizinine dokunulmaz; kök seçeneği yalnız test enjeksiyonudur.
    const ev = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-ev-'))
    const canliPosta = path.join(ev, '.wrongstack', 'projects')
    fs.mkdirSync(path.join(canliPosta, 'p1'), { recursive: true })
    {
      const { DatabaseSync } = sqlite()
      const kutu = (yol: string, n: number) => {
        const d = new DatabaseSync(yol)
        d.exec('pragma journal_mode = WAL')
        d.exec('create table messages (id INTEGER PRIMARY KEY, alici TEXT NOT NULL, govde TEXT NOT NULL)')
        for (let i = 0; i < n; i++) d.prepare('insert into messages (alici,govde) values (?,?)').run('pencere', `mesaj ${i}`)
        return d
      }
      const canliDb = kutu(path.join(canliPosta, 'p1', '_mailbox.sqlite'), 8)
      const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-yalitilmis-'))
      process.env.VENTHUB_POSTA_KOKU = canliPosta
      process.env.CLAUDE_PROJECT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-yal-kok-'))
      process.env.VENTHUB_SAGE_YEDEK_DIZINI = dizin
      expect(postaModul.yedekAl(new Date(), 'posta-p1').durum).toBe('alindi')
      for (let i = 0; i < 5; i++) canliDb.prepare('insert into messages (alici,govde) values (?,?)').run('pencere', `yeni ${i}`)
      canliDb.close()
      const say = (yol: string) => {
        const d = new DatabaseSync(yol, { readOnly: true })
        try {
          return Number(d.prepare('select count(*) as c from messages').get().c)
        } finally {
          d.close()
        }
      }
      const surec = ['node C:\\x\\@wrongstack\\mailbox-mcp\\dist\\cli.js --stdio']

      const baglanti = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-bag-')), 'canli-bag')
      const yazilislar = [
        canliPosta,
        (process.platform === 'win32' ? canliPosta.toLowerCase() : canliPosta).replace(/\\/g, '/') + '/',
      ]
      try {
        fs.symlinkSync(canliPosta, baglanti, 'junction')
        yazilislar.push(baglanti)
      } catch {
        /* bag kurulamadi: kalan yazilislar sinanir */
      }
      for (const y of yazilislar) {
        expect(
          postaModul.geriYukle('posta-p1', null, { surecler: surec, postaKoku: y, canliPostaKoku: canliPosta }).durum,
          `canli posta koku "${y}" yalitilmis sayildi`,
        ).toBe('servis-canli')
      }
      expect(say(path.join(canliPosta, 'p1', '_mailbox.sqlite'))).toBe(13)

      // Yalıtılmış kök: aynı adlı kutu farklı kökte; süreç dururken bile denetim atlanır, canlıya dokunulmaz.
      const izole = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-posta-izole-'))
      fs.mkdirSync(path.join(izole, 'p1'))
      kutu(path.join(izole, 'p1', '_mailbox.sqlite'), 2).close()
      const r = postaModul.geriYukle('posta-p1', null, {
        evet: true,
        surecler: surec,
        postaKoku: izole,
        canliPostaKoku: canliPosta,
      })
      expect(r.durum, `yalitilmis posta geri yukleme basarisiz: ${r.sebep}`).toBe('geri-yuklendi')
      expect(r.kok).toBe('yalitilmis')
      expect(say(path.join(izole, 'p1', '_mailbox.sqlite')), 'yalitilmis kutu yedekle ayni degil').toBe(8)
      expect(say(path.join(canliPosta, 'p1', '_mailbox.sqlite')), 'yalitilmis geri yukleme CANLI kutuyu degistirdi').toBe(13)
    }
  })

  it('GERCEK surec listesi: bu makinede alinabiliyor ve kendi sureci icinde (fail-closed kolu bozuksa kirmizi)', () => {
    const l = surecModul.calisanSurecler()
    expect(Array.isArray(l), 'surec listesi alinamadi — geri yukleme HEP reddedilir').toBe(true)
    expect((l ?? []).some((s) => /node/i.test(s)), 'liste kendi node surecimizi icermiyor').toBe(true)
  }, 40_000)

  it('⭐OTURUM SONU KANCASI posta kutularini da alir ve loga yazar', () => {
    const k = postaKur({ 'venthub-hvac-7e017f': 4 })
    const { kok, dizin } = postaOrtam(k.koku)
    const r = spawnSync(process.execPath, [KANCA_OTURUM_SONU], {
      input: '{"session_id":"t","reason":"clear"}',
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: kok,
        VENTHUB_SAGE_YEDEK_DIZINI: dizin,
        VENTHUB_POSTA_KOKU: k.koku,
        VENTHUB_RECEP_DEFTER: path.join(dizin, 'yok', 'defter.jsonl'),
      },
      timeout: 60_000,
    })
    expect(r.status, 'kanca oturum kapanisini BLOKLADI').toBe(0)
    const log = fs.readFileSync(path.join(dizin, 'son-kosum.log'), 'utf8')
    expect(log, 'posta yedegi loga yazilmadi').toMatch(/\[posta-venthub-hvac-7e017f\] ALINDI/)
    expect(fs.readdirSync(dizin).filter((f) => /^posta-venthub-hvac-7e017f-.*\.sqlite$/.test(f))).toHaveLength(1)
    for (const db of Object.values(k.dbler)) db.close()
  })
})
