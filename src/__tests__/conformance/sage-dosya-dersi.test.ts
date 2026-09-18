// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SAGE-DERS-1 — dosyaya çapalı sage dersleri, o dosyaya DOKUNULURKEN görünür.
 *
 * ⭐NİÇİN VAR (Recep sorusu 2026-09-18: "çapalı hafıza kullanılmıyor mu?"): sage
 * veritabanında dersler yazılıydı ama hiçbir pencere bir dosyaya dokunurken onları
 * görmüyordu — okumak için bir aracı KASITLI çağırmak gerekiyordu ve kimse çağırmıyordu.
 * Yazılan ama okunmayan hafıza, yazılmamış hafızadan yalnız disk tüketimiyle farklıdır.
 *
 * ⭐BU KAPININ ÖLÇTÜĞÜ ŞEY DAVRANIŞ, VARLIK DEĞİL: asıl kol GERÇEK bir SQLite sage
 * veritabanı kurar, kancayı çağırır ve (1) ilk dokunuşta dersin göründüğünü, (2) ikinci
 * dokunuşta GÖRÜNMEDİĞİNİ, (3) compact sıfırlamasından sonra TEKRAR göründüğünü ölçer.
 * "Kanca dosyası var" kolu tek başına hiçbir şey kanıtlamaz.
 *
 * Cetvel: docs/standards/hafiza-kancalari-standard.md
 */
const KOK = process.cwd()
const MODUL_YOLU = path.join(KOK, 'scripts', 'hijyen', 'sage-dosya-dersi.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'sage-dosya-dersi.cjs')
const PANO_KANCA = path.join(KOK, '.claude', 'hooks', 'session-board.cjs')
const AYAR = path.join(KOK, '.claude', 'settings.json')

const require_ = createRequire(import.meta.url)

const modul = require_(MODUL_YOLU) as {
  CAPA_GUCU: Record<string, number>
  ASGARI_ONEM: number
  ASGARI_PUAN: number
  EN_FAZLA_DERS: number
  DERS_KARAKTER: number
  TOPLAM_BAYT: number
  BUTCE_MS: number
  capaGucu: (a: unknown[], g: string) => number
  kisalt: (m: string, s?: number) => string
  bicimlendir: (g: string, d: { kind: string; metin: string; puan: number }[]) => string
  yolAdaylari: (g: string) => string[]
}

interface SqliteDb {
  exec: (s: string) => void
  prepare: (s: string) => { run: (...a: unknown[]) => void }
  close: () => void
}

/** Gerçek bir sage veritabanı kurar: dosya çapalı ders + düşük önemli dizin dersi + silinmiş ders. */
function depoKur(): string {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-'))
  fs.mkdirSync(path.join(kok, '.wrongstack', 'memories'), { recursive: true })
  fs.mkdirSync(path.join(kok, 'src', 'lib'), { recursive: true })
  fs.writeFileSync(path.join(kok, 'src', 'lib', 'hedef.ts'), 'export const x = 1\n', 'utf8')

  // node:sqlite deneysel; uyarı stderr'e düşmesin diye dinleyici require'DAN ÖNCE kaldırılır.
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require_('node:sqlite') as { DatabaseSync: new (p: string) => SqliteDb }

  const db = new DatabaseSync(path.join(kok, '.wrongstack', 'memories', 'sage.db'))
  db.exec(`create table memories (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL, kind TEXT NOT NULL,
    scope TEXT NOT NULL, legacy_scope TEXT, importance REAL NOT NULL, confidence REAL NOT NULL,
    freshness REAL NOT NULL, updated_at TEXT NOT NULL, created_at TEXT NOT NULL,
    audience TEXT, tags TEXT, owner_session_id TEXT, canonical_text TEXT NOT NULL DEFAULT '')`)
  const ekle = (
    id: string,
    text: string,
    kind: string,
    importance: number,
    anchors: unknown[],
    status = 'active',
  ): void => {
    db.prepare(
      `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
       values (?,?,?,?,'project',?,0.9,1,'2026-09-18','2026-09-18')`,
    ).run(id, JSON.stringify({ text, anchors }), status, kind, importance)
  }
  ekle('m-dosya', 'DOSYA DERSI: bu dosyada tek is soylenir.', 'bug_root_cause', 0.9, [
    { type: 'file', path: 'src/lib/hedef.ts' },
  ])
  ekle('m-dizin', 'DIZIN DERSI: onemi dusuk, esigi gecmemeli.', 'command_note', 0.6, [
    { type: 'directory', path: 'src/lib' },
  ])
  ekle(
    'm-silinmis',
    'SILINMIS DERS gorunmemeli.',
    'fact',
    0.95,
    [{ type: 'file', path: 'src/lib/hedef.ts' }],
    'deleted',
  )
  db.close()
  return kok
}

function kancayiKos(
  kok: string,
  pano: string,
  oturum: string,
  dosya: string,
): { kod: number | null; stdout: string; sureMs: number } {
  const t0 = Date.now()
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: oturum, tool_name: 'Read', tool_input: { file_path: dosya } }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_BOARD_DIR: pano },
    timeout: 30_000,
  })
  return { kod: r.status, stdout: r.stdout ?? '', sureMs: Date.now() - t0 }
}

describe('INV-SAGE-DERS-1 · capali sage dersi dokunulan dosyada gorunur', () => {
  it('⭐ASIL İDDİA — gercek veritabani: ILK dokunusta ders GORUNUR, IKINCIDE gorunmez, compact SONRASI tekrar gorunur', () => {
    const kok = depoKur()
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-pano-'))
    const hedef = path.join(kok, 'src', 'lib', 'hedef.ts')

    const birinci = kancayiKos(kok, pano, 'oturum-a', hedef)
    expect(birinci.kod, 'kanca turu BLOKLAMAMALI (fail-open)').toBe(0)
    expect(birinci.stdout, 'ilk dokunusta ders GORUNMEDI').toContain('DOSYA DERSI')
    const cikti = JSON.parse(birinci.stdout) as {
      hookSpecificOutput: { hookEventName: string; additionalContext: string }
    }
    expect(cikti.hookSpecificOutput.hookEventName, 'olay adi PreToolUse degil').toBe('PreToolUse')
    expect(
      Buffer.byteLength(cikti.hookSpecificOutput.additionalContext, 'utf8'),
      'gercek cikti 1 KB tavanini asti',
    ).toBeLessThanOrEqual(modul.TOPLAM_BAYT)

    // Düşük önemli dizin çapası eşiği geçmez; silinmiş kayıt hiç görünmez.
    expect(birinci.stdout, 'esigi gecmemesi gereken DIZIN dersi basildi').not.toContain('DIZIN DERSI')
    expect(birinci.stdout, 'status=deleted kayit gorundu').not.toContain('SILINMIS DERS')

    const ikinci = kancayiKos(kok, pano, 'oturum-a', hedef)
    expect(ikinci.stdout, 'ayni dosya IKINCI kez ders basti — dosya basina bir kez kurali yok').toBe('')

    // ⭐COMPACT SIFIRLAMASI (Recep: "gun icinde defalarca compact oluyor"). Modül PANO'yu
    // yüklenirken okuduğu için ayrı süreçte çağrılır; ölçüm gerçek yolu izler.
    const temizle = spawnSync(
      process.execPath,
      ['-e', `require(${JSON.stringify(MODUL_YOLU)}).isaretleriTemizle('oturum-a')`],
      { encoding: 'utf8', env: { ...process.env, VENTHUB_BOARD_DIR: pano }, timeout: 30_000 },
    )
    expect(temizle.status, 'isaretleriTemizle dustu').toBe(0)

    const ucuncu = kancayiKos(kok, pano, 'oturum-a', hedef)
    expect(
      ucuncu.stdout,
      'compact sonrasi ders TEKRAR gorunmedi — kirpilmis baglamda hafiza yine okunmaz',
    ).toContain('DOSYA DERSI')
  })

  it('CAPASIZ dosyada, BOZUK girdide ve VERITABANI YOKKEN sessiz, cikis 0', () => {
    const kok = depoKur()
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-pano-'))
    const capasiz = kancayiKos(kok, pano, 'oturum-b', path.join(kok, 'src', 'lib', 'baska.ts'))
    expect(capasiz.kod).toBe(0)
    expect(capasiz.stdout).toBe('')

    const bozuk = spawnSync(process.execPath, [KANCA], {
      input: 'bu JSON degil',
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: kok, VENTHUB_BOARD_DIR: pano },
      timeout: 30_000,
    })
    expect(bozuk.status, 'bozuk girdide kanca dustu').toBe(0)
    expect(bozuk.stdout ?? '').toBe('')

    // Veritabanı HİÇ YOKSA da sessiz: kurulu olmayan makinede kanca gurultu yapmaz.
    const bosKok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sage-bos-'))
    const dbsiz = kancayiKos(bosKok, pano, 'oturum-c', path.join(bosKok, 'x.ts'))
    expect(dbsiz.kod).toBe(0)
    expect(dbsiz.stdout).toBe('')
  })

  it('⭐BUTCE — Recep in sinirlari SAYIYLA yazili ve cikti tavani ASILMAZ', () => {
    expect(modul.EN_FAZLA_DERS, 'ders sayisi 2 degil').toBe(2)
    expect(modul.DERS_KARAKTER, 'ders basina ~300 karakter siniri yok').toBe(300)
    expect(modul.TOPLAM_BAYT, 'toplam 1 KB tavani yok').toBe(1024)
    expect(modul.BUTCE_MS, 'duvar saati butcesi yok').toBeGreaterThan(0)
    expect(modul.BUTCE_MS, 'butce turu kesecek kadar buyuk').toBeLessThanOrEqual(1000)
    // Yukarı akımın ölçülen varsayılanı korundu (DEFAULT_MIN_IMPORTANCE = 0.5).
    expect(modul.ASGARI_ONEM).toBe(0.5)

    // Tavan gerçekten uygulanıyor mu: üç uzun ders verildiğinde çıktı 1 KB'ı AŞMAZ.
    const uzun = 'x'.repeat(5000)
    const cikti = modul.bicimlendir('a/b/c.ts', [
      { kind: 'fact', metin: modul.kisalt(uzun), puan: 0.9 },
      { kind: 'fact', metin: modul.kisalt(uzun), puan: 0.8 },
      { kind: 'fact', metin: modul.kisalt(uzun), puan: 0.7 },
    ])
    expect(Buffer.byteLength(cikti, 'utf8'), 'toplam bayt tavani asildi').toBeLessThanOrEqual(modul.TOPLAM_BAYT)
    expect(modul.kisalt(uzun).length, 'ders karakter siniri uygulanmiyor').toBeLessThanOrEqual(modul.DERS_KARAKTER)
    // Ders TEK SATIR olur: çok satırlı blok okunmaz (cetvel kuralı).
    expect(modul.kisalt('bir\niki\nuc'), 'ders tek satira indirilmiyor').toBe('bir iki uc')
  })

  it('⭐PUANLAMA — capa gucu OLCULEN degerlerle ayni, TANIMSIZ capa tipi puan ALMAZ', () => {
    // `memory_for_file` gerçek çıktısı: dosya çapası 0.9, dizin çapası 0.5 (2026-09-18).
    expect(modul.CAPA_GUCU.file).toBe(0.9)
    expect(modul.CAPA_GUCU.directory).toBe(0.5)
    expect(modul.capaGucu([{ type: 'file', path: 'a/b.ts' }], 'a/b.ts')).toBe(0.9)
    expect(modul.capaGucu([{ type: 'directory', path: 'a' }], 'a/b.ts')).toBe(0.5)
    // Dosya çapası KOMŞU dosyaya yayılmaz: a/b.ts dersi a/c.ts'e ait değildir.
    expect(modul.capaGucu([{ type: 'file', path: 'a/b.ts' }], 'a/c.ts')).toBe(0)
    // Tanımadığım çapa tipine puan vermem (fail-closed puanlama).
    expect(modul.capaGucu([{ type: 'gelecekte-eklenen-tip', path: 'a/b.ts' }], 'a/b.ts')).toBe(0)
    // Yol adayları: dosyanın kendisi + bütün üst dizinler.
    expect(modul.yolAdaylari('a/b/c.ts')).toEqual(['a/b/c.ts', 'a/b', 'a'])
  })

  it('⭐KANCA GERCEKTEN BAGLI — settings.json PreToolUse ve compact sifirlamasi panoda', () => {
    expect(fs.existsSync(KANCA), 'kanca dosyasi yok').toBe(true)
    const ayar = JSON.parse(fs.readFileSync(AYAR, 'utf8')) as {
      hooks?: Record<string, { matcher?: string; hooks?: { command?: string }[] }[]>
    }
    const pre = ayar.hooks?.PreToolUse ?? []
    const grup = pre.find((g) => (g.hooks ?? []).some((h) => String(h.command ?? '').includes('sage-dosya-dersi.cjs')))
    expect(grup, 'kanca settings.json PreToolUse icinde BAGLI DEGIL — yazildi ama KOSMUYOR').toBeTruthy()
    // Ders düzenlemeden ÖNCE görünmeli: Edit/Write matcher'da olmak zorunda.
    for (const arac of ['Read', 'Edit', 'Write']) {
      expect(String(grup?.matcher ?? ''), `matcher ${arac} aracini kapsamiyor`).toContain(arac)
    }
    // Compact sıfırlaması oturum açılışına bağlı mı (yoksa kırpılmış bağlamda ders kaybolur).
    const pano = fs.readFileSync(PANO_KANCA, 'utf8')
    expect(pano, 'compact sifirlamasi oturum acilisinda cagrilmiyor').toContain('isaretleriTemizle')
    expect(pano, 'sifirlama compact kaynagina bagli degil').toMatch(/source === 'compact'/)
  })

  it('KAYNAKTA DIS SERVISE CIKIS IZI YOK (kanca her arac cagrisinda kosar)', () => {
    for (const dosya of [KANCA, MODUL_YOLU]) {
      const kaynak = fs
        .readFileSync(dosya, 'utf8')
        .split('\n')
        .filter((s) => {
          const t = s.trim()
          return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('|')
        })
        .join('\n')
      for (const yasak of ['fetch(', 'https://', 'child_process']) {
        expect(kaynak, `${path.basename(dosya)} icinde dis cagri izi: ${yasak}`).not.toContain(yasak)
      }
    }
  })
})
