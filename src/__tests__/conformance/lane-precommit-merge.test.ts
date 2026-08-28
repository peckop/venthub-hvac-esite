import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-BOARD-7 · E1 pre-commit şerit kapısı — MERGE COMMİTİ MUAF, kendi yazımı DEĞİL.
 *
 * NİÇİN VAR (2026-08-26 akşamı, ölçülmüş vaka): E1 staged **dosya listesine** bakar ve "başka
 * şeridin claim'inde mi" diye sorar. Bu soru şerit KENDİ yazdığında doğrudur. Merge commit'inde
 * ise anlamsızdır: `git merge origin/master` master'ın getirdiği HER dosyayı staged yapar —
 * üretilmiş `docs/*_master.md` ve `artefakt_manifest.json` dahil. Onları şerit yazmadı, entegre
 * ediyor. Kapı böylece yazarı değil TAŞIYICIYI cezalandırıyordu ve ADMIN'in taban tazelemesi
 * yarıda kaldı — yani kapı, önlemeye çalıştığı şeyin (bayat tabanda çalışmak) tam sebebi oldu.
 *
 * İKİ KOL AYRI ÖLÇÜLÜR, ÇÜNKÜ TEK KOL YANILTIR: yalnız "merge geçer" kolu yeşilse, kapının
 * TAMAMEN sökülmüş olması da aynı yeşili verir. Bloklama kolu o ihtimali keser.
 *
 * NOT — dosya sistemine test İÇİNDEN dokunulmuyor (`node:fs` yok): bu ortamda yerel
 * `@types/node` bozuk ve `tsc` `fs`/`path`'i çözemiyor (bkz. `board-invariants.test.ts`
 * başındaki uzun not). Dosya yazımı gereken yerlerde çocuk süreç (`node -e`) kullanılıyor,
 * dizin yaratımını `git init` üstleniyor.
 */

const require = createRequire(import.meta.url)
const E1_YOLU = require.resolve('../../../scripts/board/lane-precommit.cjs')

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function benzersizDizin(onek: string): string {
  sayac += 1
  return `${tmpRoot()}/${onek}-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

/** Dosya yazımı çocuk süreçle — testin kendisi `node:fs` import ETMEZ (dosya başındaki NOT). */
function dosyaYaz(yol: string, icerik: string): void {
  execFileSync(process.execPath, [
    '-e',
    'const fs=require("fs");const p=require("path");fs.mkdirSync(p.dirname(process.argv[1]),{recursive:true});fs.writeFileSync(process.argv[1],process.argv[2])',
    yol,
    icerik,
  ])
}

interface Kurulum {
  repo: string
  gitDir: string
  panoDir: string
  bagilYol: string
}

/**
 * Scratch git reposu + pano + kimlik dosyası kurar ve BAŞKA bir şeridin claim'ine giren bir
 * dosyayı staged bırakır.
 *
 * `lane-precommit.cjs` kökü kendi konumundan (`__dirname/../..`) çözer, staged yolları ise
 * cwd'deki repodan okur — bu yüzden claim glob'u VentHub köküne göre yazılır ve staged yol
 * onunla birleştirilir. Test bu davranışa DAYANIR; değişirse bu testin kırmızısı doğru uyarıdır.
 */
function kur(): Kurulum {
  const repo = benzersizDizin('e1-merge-repo')
  const panoDir = benzersizDizin('e1-merge-pano')
  const bagilYol = 'zzz-e1-merge-sinavi/dosya.ts'

  execFileSync('git', ['init', '-q', repo])
  execFileSync('git', ['-C', repo, 'config', 'user.email', 'e1@test.local'])
  execFileSync('git', ['-C', repo, 'config', 'user.name', 'E1 Test'])
  // BOŞ İLK COMMİT ŞART: HEAD'i olmayan repoda `rev-parse HEAD` ve `diff --cached` hata verir,
  // E1 de fail-open koluna düşüp exit 0 döner. O hâlde İKİ kol da yeşil görünürdü — kapı hiç
  // koşmadan. Testin ön koşulu, kapının GERÇEKTEN asıl kolunda çalışabilmesidir.
  execFileSync('git', ['-C', repo, 'commit', '-q', '--allow-empty', '--no-verify', '-m', 'init'])

  dosyaYaz(`${repo}/${bagilYol}`, 'export const x = 1\n')
  execFileSync('git', ['-C', repo, 'add', bagilYol])

  const gitDir = execFileSync('git', ['-C', repo, 'rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
  }).trim()
  dosyaYaz(`${gitDir}/venthub-sid`, 'e1-sinav-oturumu\n')

  // BAŞKA bir şerit aynı yolu talep etmiş olsun — ve BENDEN ÖNCE ("en erken kazanır").
  const board = require('../../../scripts/board/board.cjs') as {
    append: (sid: string, e: Record<string, unknown>) => void
  }
  const oncekiPano = process.env.VENTHUB_BOARD_DIR
  process.env.VENTHUB_BOARD_DIR = panoDir
  delete require.cache[require.resolve('../../../scripts/board/board.cjs')]
  const tazeBoard = require('../../../scripts/board/board.cjs') as typeof board
  tazeBoard.append('baska-serit-sid', {
    ts: new Date(Date.now() - 60_000).toISOString(),
    type: 'claim',
    lane: 'BASKA',
    globs: ['zzz-e1-merge-sinavi/**'],
  })
  if (oncekiPano === undefined) delete process.env.VENTHUB_BOARD_DIR
  else process.env.VENTHUB_BOARD_DIR = oncekiPano

  return { repo, gitDir, panoDir, bagilYol }
}

function e1Kostur(k: Kurulum): { status: number; stderr: string } {
  /**
   * ⭐ORTAM SIZINTISI ONARIMI (2026-08-28, kusuru CI buldu): burada yalniz `CLAUDE_SESSION_ID`
   * eleniyordu. E1-v2 kimligi ASIL kanit olarak `CLAUDE_CODE_SESSION_ID`'yi okuyor; o degisken
   * elenmedigi icin GELISTIRICININ kendi oturum kimligi cocuk surece sizip fikstürün kimligini
   * eziyordu. Sonuc: YEREL takim yesil (env kolu kosuyordu), CI kirmizi (env yok, dosya kolu
   * kosuyordu) — yani yerel yesil, urunu degil ORTAMI olcuyordu.
   *
   * Kural: bir fikstür kimligi ELINDE TUTMALI. Kimlik tasiyan HER degisken elenir; test
   * neyi olcecegine kendisi karar verir, calistiran makinenin ortamina birakmaz.
   */
  const KIMLIK_DEGISKENLERI = new Set(['CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID'])
  const ciftler = Object.entries(process.env).filter(([ad]) => !KIMLIK_DEGISKENLERI.has(ad))
  ciftler.push(['VENTHUB_BOARD_DIR', k.panoDir])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync('node', [E1_YOLU], { cwd: k.repo, encoding: 'utf8', env })
  return { status: typeof r.status === 'number' ? r.status : -1, stderr: r.stderr ?? '' }
}

describe('INV-BOARD-7 · E1 merge muafiyeti', () => {
  it('MERGE_HEAD YOKKEN başka şeridin dosyası staged ise commit BLOKLANIR', () => {
    const k = kur()

    const r = e1Kostur(k)

    expect(
      r.status,
      'kapı bloklamadı — bu kol yeşil kalmazsa "merge muafiyeti" aslında kapıyı TAMAMEN sökmüş ' +
        'demektir ve öteki kolun yeşili hiçbir şey kanıtlamaz',
    ).toBe(1)
    expect(r.stderr, 'blok mesajı çakışan şeridi adıyla söylemeli').toContain('BASKA')
  })

  it('MERGE_HEAD VARKEN aynı dosya staged olsa bile commit GEÇER ve atlama GÖRÜNÜR', () => {
    const k = kur()
    dosyaYaz(`${k.gitDir}/MERGE_HEAD`, '0000000000000000000000000000000000000000\n')

    const r = e1Kostur(k)

    expect(
      r.status,
      'merge commit BLOKLANDI — şerit tabanını tazeleyemez, bayat tabanda çalışır ve asıl çakışma ' +
        'o zaman üretilir (2026-08-26: ADMIN tam bu yüzden yarım merge ile kaldı)',
    ).toBe(0)
    expect(
      r.stderr,
      'atlama SESSİZ — "kapı koştu" ile "kapı atladı" ayırt edilemez hâle gelir; bu depoda ' +
        'defalarca ölçülmüş arıza biçimi',
    ).toContain('ATLANDI')
  })
})
