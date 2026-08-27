import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-BASH-WRITE-2 · Dikiş-yeri alarmı DOĞRU AĞACI ölçmeli.
 *
 * ÖLÇÜLMÜŞ KÖRLÜK (2026-08-27): `bash-write-audit.cjs` denetlenecek ağacı `girdi.cwd`'den
 * çözüyordu. Bu ortamda Bash cwd'si sessizce ANA çalışma dizinine resetlenir (araç çıktısının
 * sonunda "Shell cwd was reset to …" yazar). Sonuç: şerit kendi worktree'sinde çalışırken
 * denetim ANA DEPONUN kirli listesini okuyordu — ana depoda 5 yol, şeridin ağacında 40+.
 * Yani alarm KOŞUYORDU, sadece BAŞKA BİR AĞACI ölçüyordu; hiçbir kapı bunu göstermiyordu.
 * Kusur, bu worktree'de VAR OLMAYAN bir dosya adı veren bir alarmdan çözüldü.
 *
 * ⚠ KOL SEÇİMİ KASITLI. Yalnız "alarm ötüyor" kolu olsaydı, ağacı cwd'den çözen ESKİ sürüm de
 * (kimlik ana depoda kayıtlıysa) aynı yeşili verirdi. Bu yüzden kimlik YALNIZ worktree'ye
 * yazılıyor ve cwd olarak ANA DEPO veriliyor — eski sürüm bu kurulumda hiçbir şey görmez.
 * Ayrıca:
 *   · yanlış-pozitif kolu (talep edilmemiş yol ötmemeli),
 *   · sid TEKİL DEĞİL kolu (belirsizlikte sessizce seçme yok, GÖRÜNÜR uyarı + hepsini denetle),
 *   · kimlik çözülemedi kolu (cwd'ye düşmek meşru ama SESSİZ olamaz),
 *   · taban biçim geçişi kolu (v1 → v2 anahtar değişimi sahte alarm YAĞDIRMAMALI).
 *
 * SID'İN TEKİL OLMAMASI VARSAYIM DEĞİL, ÖLÇÜM: 2026-08-27'de `e033dc3e` üç worktree'de
 * (vh-comp, vh-inv7, vh-rec80), `4397deef` iki worktree'de kayıtlıydı; ana deponun kimlik
 * dosyası da bir şeridin sid'ini taşıyordu.
 *
 * NOT — `node:fs` KULLANILMIYOR: bu ortamda yerel `@types/node` bozuk ve `tsc` `fs`'i
 * çözemiyor (bkz. `board-invariants.test.ts` başındaki uzun not). Dosya yazımı çocuk süreçle
 * (`node -e`), dizin yaratımı `git init` / `git worktree add` ile yapılıyor.
 */

const require = createRequire(import.meta.url)
const AUDIT_YOLU = require.resolve('../../../.claude/hooks/bash-write-audit.cjs')
const BOARD_YOLU = require.resolve('../../../scripts/board/board.cjs')

const CLAIM_GLOB = 'zzz-audit-sinavi/**'
const CLAIM_YOLU = 'zzz-audit-sinavi/dosya.ts'
const SERBEST_YOL = 'zzz-audit-serbest/dosya.ts'

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

/** Dosyanın mtime'ını geçmişe alır — pencere ayrımı kolları için. Aynı `node:fs`-siz biçem. */
function mtimeGecmiseAl(yol: string, saatOnce: number): void {
  execFileSync(process.execPath, [
    '-e',
    'const fs=require("fs");const t=new Date(Date.now()-Number(process.argv[2])*3600000);fs.utimesSync(process.argv[1],t,t)',
    yol,
    String(saatOnce),
  ])
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

const sessiz = { stdio: 'ignore' as const }

interface Kurulum {
  ana: string
  wtA: string
  wtB: string
  panoDir: string
  sid: string
}

/**
 * Ana depo + İKİ worktree + pano kurar. Kimlik dosyası KASTEN yazılmaz; her kol kendi
 * senaryosuna göre yazar. Panoya BAŞKA bir şerit `zzz-audit-sinavi/**` talebi bırakır
 * (benden ÖNCE — "en erken kazanır" kıdem kuralı).
 */
function kur(onek: string): Kurulum {
  const ana = benzersizDizin(`${onek}-ana`)
  const wtA = benzersizDizin(`${onek}-wtA`)
  const wtB = benzersizDizin(`${onek}-wtB`)
  const panoDir = benzersizDizin(`${onek}-pano`)
  const sid = `audit-sinav-${onek}-${sayac}-${Math.random().toString(36).slice(2)}`

  execFileSync('git', ['init', '-q', ana])
  execFileSync('git', ['-C', ana, 'config', 'user.email', 'audit@test.local'])
  execFileSync('git', ['-C', ana, 'config', 'user.name', 'Audit Test'])
  // Boş ilk commit ŞART: HEAD'siz repoda `git worktree add` çalışmaz.
  execFileSync('git', ['-C', ana, 'commit', '-q', '--allow-empty', '--no-verify', '-m', 'init'])
  execFileSync('git', ['-C', ana, 'worktree', 'add', '-q', '-b', 'dal-a', wtA], sessiz)
  execFileSync('git', ['-C', ana, 'worktree', 'add', '-q', '-b', 'dal-b', wtB], sessiz)

  const oncekiPano = process.env.VENTHUB_BOARD_DIR
  process.env.VENTHUB_BOARD_DIR = panoDir
  delete require.cache[BOARD_YOLU]
  const board = require(BOARD_YOLU) as { append: (s: string, e: Record<string, unknown>) => void }
  board.append('baska-serit-sid', {
    ts: new Date(Date.now() - 60_000).toISOString(),
    type: 'claim',
    lane: 'BASKA',
    globs: [CLAIM_GLOB],
  })
  delete require.cache[BOARD_YOLU]
  if (oncekiPano === undefined) delete process.env.VENTHUB_BOARD_DIR
  else process.env.VENTHUB_BOARD_DIR = oncekiPano

  return { ana, wtA, wtB, panoDir, sid }
}

/** Kimliği bir ağacın KENDİ git dizinine yazar — session-board.cjs'in yaptığı şey. */
function kimlikYaz(k: Kurulum, agac: string): void {
  const gitDir = execFileSync('git', ['-C', agac, 'rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
  }).trim()
  dosyaYaz(`${gitDir.replace(/\\/g, '/')}/venthub-sid`, `${k.sid}\n`)
}

/**
 * Kancayı koşturur. `cwd` KASTEN ana depo: ölçülmüş arıza tam bu — şerit worktree'de çalışıyor
 * ama kancaya gelen cwd ana dizine resetlenmiş oluyor.
 */
function auditKostur(k: Kurulum, cwd?: string): { status: number; stderr: string } {
  const ciftler = Object.entries(process.env).filter(([ad]) => ad !== 'CLAUDE_SESSION_ID')
  ciftler.push(['VENTHUB_BOARD_DIR', k.panoDir])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync('node', [AUDIT_YOLU], {
    encoding: 'utf8',
    env,
    input: JSON.stringify({ session_id: k.sid, tool_name: 'Bash', cwd: cwd ?? k.ana }),
  })
  return { status: typeof r.status === 'number' ? r.status : -1, stderr: r.stderr ?? '' }
}

describe('INV-BASH-WRITE-2 · bash-write-audit hangi ağacı denetliyor', () => {
  it('KÖRLÜK REGRESYONU: kimlik worktree de, cwd ana depoda — alarm WORKTREE deki yazmayı görür', () => {
    const k = kur('kor')
    kimlikYaz(k, k.wtB)

    // 1. tur: taban kurulur (mevcut kirlilik alarm SAYILMAZ).
    const taban = auditKostur(k)
    expect(taban.status, 'ilk turda taban kurulur, alarm ötmemeli').toBe(0)

    // Şerit KENDİ worktree'sinde başka şeridin dosyasına yazıyor.
    dosyaYaz(`${k.wtB}/${CLAIM_YOLU}`, 'export const x = 1\n')

    const r = auditKostur(k)

    expect(
      r.status,
      'alarm ÖTMEDİ — ağaç cwd den çözülüyor demektir; şerit kendi worktree sinde yazarken ' +
        'denetim ana deponun kirli listesini okur ve kapı BOŞ döner (2026-08-27 ölçümü)',
    ).toBe(2)
    expect(r.stderr, 'çakışan şerit adıyla söylenmeli').toContain('BASKA')
    expect(r.stderr, 'hangi ağacın denetlendiği yazılmalı — yoksa yanlış ağaç sessizce sürer').toContain(k.wtB)
  })

  it('YANLIŞ-POZİTİF KOLU: talep edilmemiş yola yazma alarm ÜRETMEZ', () => {
    const k = kur('serbest')
    kimlikYaz(k, k.wtB)

    expect(auditKostur(k).status).toBe(0)
    dosyaYaz(`${k.wtB}/${SERBEST_YOL}`, 'export const y = 2\n')

    const r = auditKostur(k)

    expect(
      r.status,
      'her değişikliğe öten bir alarm üç gün içinde görmezden gelinir — bu kapının en olası ' +
        'arıza biçimi kaçırmak değil, her şeye ötmektir',
    ).toBe(0)
    expect(r.stderr).not.toContain('DIKIS YERI ALARMI')
  })

  it('SID TEKİL DEĞİL: iki ağaç aynı kimliği taşıyor — sessizce seçmez, GÖRÜNÜR uyarır, HEPSİNİ denetler', () => {
    const k = kur('ikiz')
    kimlikYaz(k, k.wtA)
    kimlikYaz(k, k.wtB)

    expect(auditKostur(k).status).toBe(0)
    // İKİ AĞACA DA yazılıyor: böylece "ilk bulunanı seç" DE "son bulunanı seç" DE kırmızı olur.
    // Tek ağaca yazsaydık, seçim sırası tesadüfen tutan bir uygulama testi geçerdi.
    dosyaYaz(`${k.wtA}/${CLAIM_YOLU}`, 'export const z = 3\n')
    dosyaYaz(`${k.wtB}/${CLAIM_YOLU}`, 'export const z = 3\n')

    const r = auditKostur(k)

    expect(r.stderr, 'belirsizlik SESSİZ kalırsa yanlış ağacı ölçtüğünü kimse görmez').toContain(
      'SID TEKIL DEGIL',
    )
    expect(
      r.status,
      'iki adaydan birini sessizce seçen uygulama bu yazmayı kaçırır — düzeltmeye çalıştığımız ' +
        'arızanın aynısı geri gelir',
    ).toBe(2)
    const adA = k.wtA.split('/').pop() as string
    const adB = k.wtB.split('/').pop() as string
    expect(r.stderr, 'wtA daki ihlal raporlanmadı').toContain(`${adA} :: ${CLAIM_YOLU}`)
    expect(r.stderr, 'wtB daki ihlal raporlanmadı').toContain(`${adB} :: ${CLAIM_YOLU}`)
  })

  it('KİMLİK ÇÖZÜLEMEDİ: cwd ye düşmek meşru ama SESSİZ olamaz — ve gerçekten bir şey ölçmeli', () => {
    const k = kur('kimliksiz')
    // Hiçbir ağaca kimlik yazılmıyor.

    expect(auditKostur(k).status).toBe(0)
    dosyaYaz(`${k.ana}/${CLAIM_YOLU}`, 'export const q = 4\n')

    const r = auditKostur(k)

    expect(
      r.stderr,
      'kimlik yoksa denetim yanlış ağacı ölçüyor OLABİLİR; bunu bastırmak "kapı koştu" ile ' +
        '"kapı boşa koştu"yu ayırt edilemez yapar',
    ).toContain('KIMLIK COZULEMEDI')
    expect(
      r.status,
      'ABSANS KANITI: geri düşüş gerçekten bir ağacı okuduğunu göstermeli, yoksa "uyardım ve ' +
        'hiçbir şey ölçmedim" hâli yeşil görünür',
    ).toBe(2)
  })

  it('TABAN BİÇİM GEÇİŞİ v1 → v2: nitelenmemiş eski taban sahte alarm YAĞDIRMAZ', () => {
    const k = kur('gecis')
    kimlikYaz(k, k.wtB)

    dosyaYaz(`${k.wtB}/${CLAIM_YOLU}`, 'export const w = 5\n')
    // Eski biçim taban: `surum` alanı YOK, yollar ağaçla NİTELENMEMİŞ.
    dosyaYaz(
      `${k.panoDir}/.bash-audit-${k.sid.slice(0, 8)}.json`,
      JSON.stringify({ sid: k.sid, yollar: [CLAIM_YOLU], bildirilen: [] }),
    )

    const r = auditKostur(k)

    expect(
      r.status,
      'v1 tabanı doğrudan karşılaştıran uygulama her yolu "yeni" sayar ve tek turda onlarca ' +
        'sahte alarm düşer',
    ).toBe(0)
    expect(r.stderr, 'bastırma SESSİZ olmamalı — bir tur alarm ötmediği YAZILMALI').toContain(
      'BICIMI DEGISTI',
    )
  })

  /**
   * ⭐PENCERE AYRIMI (2026-08-28, REC-84). Bu kanca "tabanda yoktu, şimdi var" ÖLÇER; ama
   * alarmın metni "Bash SONRASI değişti" diyerek bir NEDENSELLİK İDDİA EDİYORDU. Taban dosyası
   * oturumlar arası kalıcı olduğu için, oturum kapalıyken doğan dosya dönüşte "senin Bash'in
   * yazdı" görünüyordu.
   *
   * ÖLÇÜLMÜŞ BEDEL: üç kez "üretim yolu kaçağı" alarmı verildi; iki dosyanın mtime'ı BİR ÖNCEKİ
   * GÜNDÜ ve doc-scope süzgeci doğru çalışıyordu (GIRDI 3 · CIKAN 1). İki şerit boşuna iş çıkardı.
   *
   * İKİ KOL BİRLİKTE DURUYOR: yalnız "eski dosya susturuldu" kolunu yazmak, kancayı tamamen
   * sağır eden bir uygulamayla da YEŞİL kalırdı. İkinci kol gerçek ihlalin hâlâ öttüğünü ölçer.
   */
  it('PENCERE DIŞI: tabandan ESKİ dosya şerit sahibine ALARM ÜRETMEZ (ama sessizce de yutulmaz)', () => {
    const k = kur('pencere-eski')
    kimlikYaz(k, k.wtB)

    dosyaYaz(`${k.wtB}/${CLAIM_YOLU}`, 'export const w = 5\n')
    // Dosyayı GEÇMİŞE al: taban damgası ondan SONRA yazılmış olacak.
    mtimeGecmiseAl(`${k.wtB}/${CLAIM_YOLU}`, 6)

    dosyaYaz(
      `${k.panoDir}/.bash-audit-${k.sid.slice(0, 8)}.json`,
      JSON.stringify({ surum: 3, sid: k.sid, ts: Date.now(), yollar: [], bildirilen: [] }),
    )

    const r = auditKostur(k)

    expect(r.status, 'pencere dışı kalem exit 2 ile alarm üretmemeli').toBe(0)
    expect(r.stderr, 'susturma GÖRÜNÜR olmalı — sessiz eleme, elediğini gizler').toContain(
      'PENCERE DISI',
    )
    expect(
      r.stderr,
      'hangi dosyanın ne zaman oluştuğu YAZILMALI: okuyan "boşuna mı bakıyorum" sorusunu ölçümle cevaplayabilsin',
    ).toContain('mtime')
  })

  it('PENCERE İÇİ: tabandan YENİ dosya hâlâ ALARM ÜRETİR (sağırlaştırma koruması)', () => {
    const k = kur('pencere-yeni')
    kimlikYaz(k, k.wtB)

    // Taban ÖNCE yazılır, dosya SONRA doğar — gerçek ihlalin zaman sırası budur.
    dosyaYaz(
      `${k.panoDir}/.bash-audit-${k.sid.slice(0, 8)}.json`,
      JSON.stringify({ surum: 3, sid: k.sid, ts: Date.now() - 60_000, yollar: [], bildirilen: [] }),
    )
    dosyaYaz(`${k.wtB}/${CLAIM_YOLU}`, 'export const w = 6\n')

    const r = auditKostur(k)

    expect(r.status, 'pencere içi gerçek ihlal exit 2 ile ötmeli').toBe(2)
    expect(r.stderr, 'alarm metni ölçtüğü şeyi söylemeli').toContain('PENCEREDE')
    expect(r.stderr, 'pencere içi kalem "pencere dışı" listesine düşmemeli').not.toContain(
      'PENCERE DISI',
    )
  })
})
