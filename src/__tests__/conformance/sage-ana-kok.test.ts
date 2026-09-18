// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SAGE-ANA-KOK-1 — sage betikleri veriyi ANA AĞAÇTA arar, bulunduğu kopyada değil.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR — 2026-09-18'de sahada ölçülmüş SESSİZ arıza
 * ══════════════════════════════════════════════════════════════════════════════
 * `.wrongstack/memories/sage.db` TEK bir yerde yaşar: ana ağaç. Worktree'lerde o dizin
 * hiç yoktur. İki betik kökü `CLAUDE_PROJECT_DIR || __dirname/../..` ile çözüyordu:
 *
 *   · `sage-yedek.cjs`       → worktree'de "sage kurulu degil, yedek ALINMADI" + **çıkış 0**.
 *     Oturum kapanışı kancasına bağlanırsa yedek HİÇ alınmaz ve başarılı görünür.
 *   · `sage-dosya-dersi.cjs` → worktree dosyasının ana ağaca göre yolu `..` ile başlar,
 *     `goreliYol` null döner, ders satırı sebebi yazılmadan BOŞ çıkar.
 *
 * Aynı dosya, iki ağaç (ölçüm): ana ağaçta 1751 karakter ders · worktree'de 0.
 *
 * ⭐BU KAPI GERÇEK BİR GIT WORKTREE KURAR. Sahte dizin bu arızayı taklit edemez: arıza
 * tam olarak "iki ağaç aynı deponun parçası ama ayrı dizinler" durumunda doğuyor.
 * (Bu depoda ölçülmüş ders: gerçeği taklit etmeyen kurgu, testi kör eder.)
 *
 * Cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const KOK = process.cwd()
const ANA_KOK_MODUL = path.join(KOK, 'scripts', 'hijyen', 'ana-kok.cjs')
const DERS_MODUL = path.join(KOK, 'scripts', 'hijyen', 'sage-dosya-dersi.cjs')
const YEDEK_BETIK = path.join(KOK, 'scripts', 'hijyen', 'sage-yedek.cjs')
const DERS_KANCA = path.join(KOK, '.claude', 'hooks', 'sage-dosya-dersi.cjs')

/** git alt süreçleri yavaş makinede uzun sürer; genel 20 sn sınırı YÜKSELTİLMEZ, bu blok muaf. */
const GIT_SURE = 120_000

const require_ = createRequire(import.meta.url)

const { anaKok, agacKoku } = require_(ANA_KOK_MODUL) as {
  anaKok: (b?: string) => string
  agacKoku: (b?: string) => string
}
const { satir } = require_(DERS_MODUL) as {
  satir: (a: { kok: string; dosya: string; oturum: string; dbKok?: string }) => string
}

interface SqliteDb {
  exec: (s: string) => void
  prepare: (s: string) => { run: (...a: unknown[]) => void }
  close: () => void
}

const esitle = (p: string): string => fs.realpathSync(p).split(path.sep).join('/').toLowerCase()

/** GERÇEK depo + GERÇEK worktree. Dönen: { ana, wt } — ikisi ayrı dizin, aynı depo. */
function agaclariKur(): { ana: string; wt: string } {
  const taban = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-anakok-'))
  const ana = path.join(taban, 'ana')
  const wt = path.join(taban, 'kopya')
  fs.mkdirSync(ana, { recursive: true })
  const git = (...a: string[]): void => {
    execFileSync('git', ['-C', ana, '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], {
      stdio: ['ignore', 'ignore', 'ignore'],
      timeout: 60_000,
    })
  }
  execFileSync('git', ['init', '-q', '-b', 'main', ana], { stdio: ['ignore', 'ignore', 'ignore'], timeout: 60_000 })
  fs.mkdirSync(path.join(ana, 'src', 'lib'), { recursive: true })
  fs.writeFileSync(path.join(ana, 'src', 'lib', 'hedef.ts'), 'export const x = 1\n', 'utf8')
  git('add', 'src/lib/hedef.ts')
  git('commit', '-q', '-m', 'ilk')
  git('worktree', 'add', '-q', '-b', 'kol', wt)
  return { ana, wt }
}

/** Ana ağaca gerçek bir sage veritabanı koyar (dosya çapalı tek ders). */
function veritabaniKur(ana: string): void {
  fs.mkdirSync(path.join(ana, '.wrongstack', 'memories'), { recursive: true })
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require_('node:sqlite') as { DatabaseSync: new (p: string) => SqliteDb }
  const db = new DatabaseSync(path.join(ana, '.wrongstack', 'memories', 'sage.db'))
  db.exec(`create table memories (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL, kind TEXT NOT NULL,
    scope TEXT NOT NULL, legacy_scope TEXT, importance REAL NOT NULL, confidence REAL NOT NULL,
    freshness REAL NOT NULL, updated_at TEXT NOT NULL, created_at TEXT NOT NULL,
    audience TEXT, tags TEXT, owner_session_id TEXT, canonical_text TEXT NOT NULL DEFAULT '')`)
  db.prepare(
    `insert into memories (id,data,status,kind,scope,importance,confidence,freshness,updated_at,created_at)
     values (?,?,'active','bug_root_cause','project',0.9,0.9,1,'2026-09-18','2026-09-18')`,
  ).run(
    'm-dosya',
    JSON.stringify({
      text: 'ANA AGAC DERSI: veri ana agacta yasar.',
      anchors: [{ type: 'file', path: 'src/lib/hedef.ts' }],
    }),
  )
  db.close()
}

describe('INV-SAGE-ANA-KOK-1 · sage verisi ANA AGACTA aranir', { timeout: GIT_SURE }, () => {
  it('⭐ASIL İDDİA — GERCEK worktree: veri koku ANA AGAC, dosya koku KENDI AGACI (eski cozum bunu KACIRIYORDU)', () => {
    const { ana, wt } = agaclariKur()

    // Önce evreni doğrula: iki ağaç GERÇEKTEN ayrı dizinler olmalı, yoksa kol hiçbir şey ölçmez.
    expect(esitle(wt), 'kurulum bozuk: worktree ile ana agac ayni dizin — bu kol hicbir sey olcmez').not.toBe(
      esitle(ana),
    )

    expect(esitle(anaKok(wt)), 'worktree den ANA AGAC bulunamadi — yedek sessizce alinmaz').toBe(esitle(ana))
    expect(esitle(agacKoku(wt)), 'dosya agaci yanlis — capa yolu `..` ile baslar ve ders BOS cikar').toBe(esitle(wt))
    // Ana ağaçtan çağrılınca ikisi de ana ağacı vermeli (regresyon yönü).
    expect(esitle(anaKok(ana)), 'ana agactan anaKok kendini vermedi').toBe(esitle(ana))

    /**
     * ⭐ESKİ DAVRANIŞIN KIRMIZI OLDUĞU KOL. Eski kök çözümü `CLAUDE_PROJECT_DIR || __dirname/../..`
     * idi; worktree penceresinde bu worktree'nin kendisini verirdi. Aşağıdaki eşitsizlik, eski
     * kodun bu testte GEÇEMEYECEĞİNİ yazılı tutar.
     */
    expect(esitle(anaKok(wt)), 'ESKI DAVRANIS: kok worktree ye cozuldu — onarim geri kacti').not.toBe(esitle(wt))
  })

  it('⭐DERS: veritabani ANA AGACTA, dosya WORKTREE de — iki kok ayrilmazsa ders BOS cikar', () => {
    const { ana, wt } = agaclariKur()
    veritabaniKur(ana)
    const hedef = path.join(wt, 'src', 'lib', 'hedef.ts')
    /**
     * ⛔OTURUM ADI HER KOŞUMDA BENZERSİZ. "Bu dosya bu oturumda görüldü" işaretleri panoda
     * KALICIDIR; sabit bir oturum adı, ikinci koşumda dersi boş döndürür ve test kendi izine
     * takılıp YANLIŞ KIRMIZI verir. (Sahada ölçüldü: ilk koşum geçti, ikincisi düştü.)
     */
    const damga = `${process.pid}-${Date.now()}`
    const dogru = satir({ kok: agacKoku(wt), dbKok: anaKok(wt), dosya: hedef, oturum: `dogru-${damga}` })
    expect(dogru, 'iki kok ayrilmisken ders GORUNMEDI').toContain('ANA AGAC DERSI')

    // Ölçülmüş eski hâl: tek kök (worktree). `.wrongstack` orada YOK → sessizce boş.
    const eski = satir({ kok: wt, dbKok: wt, dosya: hedef, oturum: `eski-${damga}` })
    expect(eski, 'TEK kok ile ders gorundu — bu kol artik ariza taklit etmiyor, kurulumu duzelt').toBe('')
  })

  it('⭐YEDEK: kaynak bulunamayinca cikis 0 DEGIL — "alinmadi" satiri BASARI sayilamaz', () => {
    /**
     * Eskiden burası çıkış 0 idi ve "yedek ALINMADI" cümlesi başarı gibi okunuyordu. Oturum
     * kapanışına bağlanan bir iş için bu, yedeğin hiç alınmadığını gizleyen tek satırdır.
     * Kanca fail-open olmak ZORUNDA; ama fail-open kancanın özelliğidir, betiğin değil.
     */
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-anakok-bos-'))
    const hedefDizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-anakok-yedek-'))
    const r = spawnSync(process.execPath, [YEDEK_BETIK], {
      encoding: 'utf8',
      cwd: bos,
      env: { ...process.env, CLAUDE_PROJECT_DIR: bos, VENTHUB_SAGE_YEDEK_DIZINI: hedefDizin },
      timeout: 60_000,
    })
    expect(r.status, 'kaynak yokken cikis 0 dondu — sessiz atlama geri kacti').not.toBe(0)
    const metin = `${r.stdout ?? ''}${r.stderr ?? ''}`
    expect(metin, 'kaynak yok hukmu acikca yazilmamis').toContain('KAYNAK YOK')
    expect(metin, 'aranan ana agac yazilmamis — tesis edilemeyen hata teshis edilemez').toContain('ana agac')
  })

  it('kaynak cozumu ana-kok.cjs e BAGLI: iki tuketici de cwd/__dirname ile kok cozmuyor', () => {
    const yedek = fs.readFileSync(YEDEK_BETIK, 'utf8')
    const kanca = fs.readFileSync(DERS_KANCA, 'utf8')
    for (const [ad, metin] of [
      ['sage-yedek.cjs', yedek],
      ['.claude/hooks/sage-dosya-dersi.cjs', kanca],
    ] as const) {
      expect(metin, `${ad} ana-kok.cjs e bagli degil`).toMatch(/require\([^)]*ana-kok\.cjs['"]\)|'ana-kok\.cjs'/)
    }
    expect(kanca, 'kanca dbKok gecirmiyor — veri koku ile dosya koku yine esitlenmis').toContain('dbKok')
    expect(yedek, 'yedek betigi hala CLAUDE_PROJECT_DIR ile DOGRUDAN kok cozuyor').not.toMatch(
      /function kok\(\)\s*\{\s*return process\.env\.CLAUDE_PROJECT_DIR/,
    )
  })
})
