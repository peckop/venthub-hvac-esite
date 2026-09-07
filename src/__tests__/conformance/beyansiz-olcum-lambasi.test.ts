// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BEYANSIZ-OLCUM-1 — §28 ağaç ayrışma lambası AYIRT EDER (REC-130).
 *
 * NİÇİN VAR — ölçülmüş kusur, 2026-09-07, İKİ ŞERİT BAĞIMSIZ:
 * Tur-sonu uyarısı `board.agacKonumu(process.cwd())` ile KENDİ cwd'sini okuyordu. Cetvel §9.1
 * tam bunu yasaklıyor: kabuk cwd'si sessizce ana çalışma dizinine resetlenir, yani kancanın
 * gördüğü dizin komutların KOŞTUĞU dizin değildir. Sonuç: ALTYAPI bütün komutlarını
 * `vh-altyapi-envanter` ağacında, OPS bütün komutlarını `ops-gun-kapanisi` ağacında koştu ve
 * lamba İKİSİNE DE yandı, aynı "752. vaka"yı gösterdi.
 *
 * ⭐AYIRT ETMEYEN GÖSTERGE ÖLÇÜM DEĞİLDİR. Ana dizinde açılmış bir şerit oturumu için lamba
 * hiçbir koşulda sönmüyordu; sürekli yanan lamba birkaç gün içinde mobilyaya döner ve o an
 * gerçek bir ayrışma olduğunda kimse bakmaz.
 *
 * BU DOSYANIN KAPSAMI: **kaydedici** (`bash-write-audit.cjs`) ve **sayaç**. Uyarının kendisi —
 * yani "ana dizinde yanar, şerit ağacında ve kayıt yokken SUSAR" üçlüsü — `board-invariants`
 * içindeki `INV-BOARD-KONUM-2` kolunda ölçülür ve REC-130 ile oraya üçüncü koşul eklendi.
 * ⛔Burada tekrar edilmedi: aynı kuralı iki dosyaya yazmak ikisini AYRI AYRI bayatlatır; bugün
 * bu sınıfa iki kez yakalandım (REC-189'da mevcut parser kolu, REC-179'un bayat tarifi).
 *
 * ÖLÇÜM BİÇİMİ: kancalar izole bir pano dizininde (`VENTHUB_BOARD_DIR`) ve GEÇİCİ GERÇEK bir
 * git deposunda koşulur. Depo `git init` ile kurulur, ağaç `git worktree add` ile açılır —
 * böylece "ana dizin" ile "şerit ağacı" ayrımı hem yerelde hem CI'da AYNI davranır. Kapı
 * `process.cwd()`'ye yaslansaydı yerelde (worktree) ve CI'da (ana checkout) farklı sonuç
 * verirdi; o da ölçülen kusurun testin kendisinde tekrarı olurdu.
 */

const KOK = process.cwd()
const DENETIM = path.join(KOK, '.claude', 'hooks', 'bash-write-audit.cjs')
const TUR_SONU = path.join(KOK, '.claude', 'hooks', 'verify-on-stop.cjs')

const SID = '33333333-3333-4333-8333-333333333333'
const KISA = SID.slice(0, 8)

function git(dizin: string, ...args: string[]) {
  execFileSync('git', ['-C', dizin, ...args], { stdio: ['ignore', 'pipe', 'ignore'] })
}

/** Geçici pano + geçici GERÇEK depo (ana ağaç) + o deponun bir worktree'si. */
function ortamKur() {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-beyansiz-'))
  const pano = path.join(kok, 'pano')
  const anaAgac = path.join(kok, 'ana')
  const seritAgac = path.join(kok, 'serit')
  fs.mkdirSync(pano)
  fs.mkdirSync(anaAgac)

  git(anaAgac, 'init', '-b', 'master')
  git(anaAgac, 'config', 'user.email', 'kapi@test.local')
  git(anaAgac, 'config', 'user.name', 'kapi')
  git(anaAgac, 'commit', '--allow-empty', '-m', 'taban')
  // worktree: git-dir ile ortak git-dir AYRIŞIR, yani agacKonumu(anaMi) FALSE der.
  git(anaAgac, 'worktree', 'add', seritAgac, '-b', 'serit')

  return { kok, pano, anaAgac, seritAgac }
}

function denetimKostur(pano: string, komut: string, cwd: string) {
  const r = spawnSync(process.execPath, [DENETIM], {
    input: JSON.stringify({ session_id: SID, tool_name: 'Bash', tool_input: { command: komut }, cwd }),
    env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    encoding: 'utf8',
    timeout: 30_000,
  })
  return String(r.stdout || '') + String(r.stderr || '')
}

const kayitYolu = (pano: string) => path.join(pano, '.beyansiz-olcum.' + KISA + '.json')

function kayitOku(pano: string): Array<{ cwd?: string; komut?: string }> {
  try {
    const o = JSON.parse(fs.readFileSync(kayitYolu(pano), 'utf8'))
    return Array.isArray(o) ? o : []
  } catch {
    return []
  }
}

/** Şerit talebi = panoya yazılmış bir `claim` olayı; `tumTalepler` olay dosyalarından okur. */
function talepYaz(pano: string) {
  const olay = { type: 'claim', sid: SID, lane: 'KAPI-TESTI', globs: ['kapi/**'], ts: new Date().toISOString() }
  fs.writeFileSync(path.join(pano, 'events.' + KISA + '.jsonl'), JSON.stringify(olay) + '\n', 'utf8')
}

/**
 * ⭐KANCANIN KENDİ cwd'si TESTTE ANA AĞACA SABİTLENİR — ve bu, kolların DUYARLILIĞI için şart.
 *
 * Onarılan kusur şuydu: kanca ağacı KENDİ `process.cwd()`'sinden çözüyordu. Eğer burada cwd'yi
 * vitest'in bulunduğu yere bıraksaydık, kolların eski koda karşı davranışı ORTAMA bağlı olurdu:
 * geliştirici makinesinde vitest bir worktree'de koşar (eski kod da susardı, kol yeşil kalırdı),
 * CI'da ana checkout'ta koşar (eski kod uyarırdı, kol kırmızı olurdu). Yani kapı yerelde
 * "geçti" der, CI'da başka şey söylerdi — ölçülen kusurun testin İÇİNDE tekrarı.
 * cwd'yi geçici ANA ağaca sabitlemek, "eski kod bu kolu düşürür" iddiasını HER YERDE doğru kılar.
 */
function turSonuKostur(pano: string, kancaCwd: string) {
  const r = spawnSync(process.execPath, [TUR_SONU], {
    input: JSON.stringify({ session_id: SID }),
    cwd: kancaCwd,
    env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    encoding: 'utf8',
    timeout: 60_000,
  })
  return String(r.stdout || '')
}

describe('INV-BEYANSIZ-OLCUM-1: lamba beyansiz olcumu gorur, beyanliyi GORMEZ', () => {
  it('KAYDEDICI: beyansiz olcum komutu KAYDEDILIR', () => {
    const { kok, pano, anaAgac } = ortamKur()
    denetimKostur(pano, 'npx vitest run src/__tests__/conformance/x.test.ts', anaAgac)
    const kayit = kayitOku(pano)
    expect(kayit.length, 'beyansiz olcum komutu KAYDEDILMEDI — lamba kanitsiz kalir').toBe(1)
    expect(String(kayit[0].komut)).toContain('vitest')
    fs.rmSync(kok, { recursive: true, force: true })
  }, 60_000)

  /**
   * ⭐6. VAKANIN KENDİSİ: `node scripts/board/board.cjs` GÖRELİ yolla çağrılınca bulunduğun
   * dizindeki kopya koşar ve kabuğun cwd'sini oraya çeker. §28'in kurucu vakası buydu ve
   * kaydedicinin ölçüm kalıbı onu KAPSAMALI — kapsamazsa lamba tam kendi doğuş sebebini kaçırır.
   */
  it('KAYDEDICI: goreli "node scripts/..." cagrisi KAYDEDILIR (6. vaka)', () => {
    const { kok, pano, anaAgac } = ortamKur()
    denetimKostur(pano, 'node scripts/board/board.cjs note --sid x --text y', anaAgac)
    expect(kayitOku(pano).length, '6. vakanin komutu kaydedilmedi').toBe(1)
    fs.rmSync(kok, { recursive: true, force: true })
  }, 60_000)

  it('KAYDEDICI: dizini BEYAN EDEN komut kaydedilMEZ (yanlis alarm yok)', () => {
    const { kok, pano, anaAgac, seritAgac } = ortamKur()
    denetimKostur(pano, 'git -C ' + seritAgac + ' status --porcelain', anaAgac)
    denetimKostur(pano, 'cd ' + seritAgac + ' && npx vitest run x', anaAgac)
    expect(
      kayitOku(pano).length,
      'BEYAN EDEN komut kaydedildi — lamba yine ayirt etmiyor demektir, kusur onarilmadi.',
    ).toBe(0)
    fs.rmSync(kok, { recursive: true, force: true })
  }, 60_000)

  it('KAYDEDICI: olcum OLMAYAN komut kaydedilMEZ (kapsam dar)', () => {
    const { kok, pano, anaAgac } = ortamKur()
    denetimKostur(pano, 'echo merhaba', anaAgac)
    denetimKostur(pano, 'gh pr view 1107 --json state', anaAgac)
    expect(kayitOku(pano).length, 'olcum olmayan komut kaydedildi — lamba gurultuye doner').toBe(0)
    fs.rmSync(kok, { recursive: true, force: true })
  }, 60_000)

  it('SAYAC: ayni serit ayni yerde kalirsa VAKA artmaz, TUR artar', () => {
    const { kok, pano, anaAgac } = ortamKur()
    talepYaz(pano)

    denetimKostur(pano, 'npx vitest run x', anaAgac)
    turSonuKostur(pano, anaAgac)
    denetimKostur(pano, 'npx vitest run y', anaAgac)
    turSonuKostur(pano, anaAgac)

    const sayac = JSON.parse(fs.readFileSync(path.join(pano, '.cwd-ayrisma-sayaci.json'), 'utf8'))
    const benim = sayac.seritler && sayac.seritler[SID]
    expect(benim, 'sayac SERIT BASINA ayrilmamis — kusur 2 duruyor').toBeTruthy()
    expect(benim.vaka, 'ayni yerde kalindigi halde VAKA artti — alan adi birimini tasimiyor').toBe(1)
    expect(benim.tur, 'TUR artmadi — iki tur gecti').toBe(2)
    fs.rmSync(kok, { recursive: true, force: true })
  }, 90_000)
})
