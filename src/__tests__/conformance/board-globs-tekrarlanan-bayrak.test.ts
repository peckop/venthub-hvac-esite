import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 * Bu dosya alt süreç doğurur (5 `board.cjs` çağrısı); sınıfın gerekçesi ve ölçülmüş
 * amplifikasyonu: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-BOARD-8 · TEKRARLANAN değer bayrağı SESSİZCE EZMEZ.
 *
 * ÖLÇÜLMÜŞ VAKA (2026-08-30). CLI ayrıştırıcısı `flags[name] = rest[i + 1]` yazıyordu:
 * `--globs "A/**" --globs "B/**"` çağrısında ikinci değer birinciyi eziyor ve claim
 * yalnız `B/**` ile kaydediliyordu. Ölçüm: `talep alındı: SINAV → BBB/**`.
 *
 * NİÇİN CİDDİ: claim EKSİK kaydolunca şerit, talep ettiğini sandığı yolları KORUMUYOR.
 * Başka bir şerit o yollara girdiğinde kapı çakışmayı göremez — sessiz kayıp doğrudan
 * şerit izolasyonunu deler. Kaybın kendisi "hata" gibi görünmüyordu: komut `exit 0`
 * veriyor ve "talep alındı" diyordu.
 *
 * ⚠ FİLO NOTU DÜZELTİLDİ: panoda "yalnız İLKİ kaydediliyor" yazıyordu. Yön yanlıştı —
 * SON kazanıyor. Kayıp aynı, teşhis değil. (Ölçülmemiş teşhis, ölçülmüş kusurdan daha
 * hızlı yayılıyor; bu satır o yüzden burada.)
 *
 * İKİ AYRI DAVRANIŞ, BİLEREK — ve ikisi de AYRI kolla ölçülür:
 *   · `globs` BİRİKİR: tekrarın tek anlamlı yorumu birleşimdir.
 *   · `sid`/`lane`/`to`/`text` tekrarlanırsa HATA: "hangisini kastettin"in doğru cevabı
 *     yoktur; sessizce birini seçmek ezmenin başka adıdır.
 *
 * ⚠ ÜÇÜNCÜ KOL NİÇİN VAR: yalnız "tekrar birikiyor" kolu yeşilse, virgüllü tek değerin
 * (`--globs "a,b"`) bozulmuş olması da aynı yeşili verir. Gerileme kolu o ihtimali keser.
 */

const require = createRequire(import.meta.url)
const BOARD = require.resolve('../../../scripts/board/board.cjs')

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function panoDizini(): string {
  sayac += 1
  return `${tmpRoot()}/board-globs-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

/**
 * Kimlik taşıyan HER değişken elenir. (2026-08-28 dersi: fikstür kimliği ELİNDE TUTMALI;
 * elenmezse çalıştıran makinenin oturumu çocuk sürece sızar ve YEREL yeşil, ürünü değil
 * ORTAMI ölçer.)
 */
const KIMLIK_DEGISKENLERI = new Set(['CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID'])

function kostur(pano: string, args: string[]): { kod: number; out: string; err: string } {
  const ciftler = Object.entries(process.env).filter(([ad]) => !KIMLIK_DEGISKENLERI.has(ad))
  ciftler.push(['VENTHUB_BOARD_DIR', pano])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync(process.execPath, [BOARD, ...args], { encoding: 'utf8', env })
  return { kod: typeof r.status === 'number' ? r.status : -1, out: r.stdout ?? '', err: r.stderr ?? '' }
}

describe('INV-BOARD-8 · tekrarlanan deger bayragi sessizce ezmez', () => {
  it('ON KOSUL: board.cjs bu ortamda gercekten kosuyor (olculemedi != gecti)', () => {
    const r = execFileSync(process.execPath, [BOARD], { encoding: 'utf8' })
    expect(r, 'board.cjs kullanim ciktisi vermedi — asagidaki kollar bosluk olcerdi').toMatch(
      /kullanım|kullanim/,
    )
  })

  it('tekrarlanan --globs BIRIKIR (iki yol da claim e girer)', () => {
    const pano = panoDizini()
    const r = kostur(pano, [
      'claim', '--sid', 'inv-board-8-a', '--lane', 'SINAVA',
      '--globs', 'AAA/**', '--globs', 'BBB/**',
    ])

    expect(r.kod, `claim basarisiz:\n${r.err}`).toBe(0)
    // Kayit ASIL olcut: ekrandaki "talep alindi" satiri degil, panonun geri OKUDUGU deger.
    const who = kostur(pano, ['who', '--sid', 'inv-board-8-a'])
    expect(who.kod).toBe(0)
    const satir = who.out.split('\n').find((s) => s.includes('SINAVA')) ?? ''
    expect(satir, `SINAVA satiri panoda yok:\n${who.out}`).not.toBe('')
    expect(satir, 'ilk glob DUSTU — tekrarlanan bayrak hala eziyor').toContain('AAA/**')
    expect(satir, 'ikinci glob DUSTU').toContain('BBB/**')
  })

  it('GERILEME KAPISI: virgullu TEK deger bozulmadi', () => {
    const pano = panoDizini()
    const r = kostur(pano, [
      'claim', '--sid', 'inv-board-8-b', '--lane', 'SINAVB', '--globs', 'CCC/**,DDD/**',
    ])
    expect(r.kod, `claim basarisiz:\n${r.err}`).toBe(0)

    const who = kostur(pano, ['who', '--sid', 'inv-board-8-b'])
    const satir = who.out.split('\n').find((s) => s.includes('SINAVB')) ?? ''
    expect(satir).toContain('CCC/**')
    expect(satir).toContain('DDD/**')
  })

  it('tekrarlanan --sid REDDEDILIR — kimlik TAHMIN EDILMEZ', () => {
    const pano = panoDizini()
    const r = kostur(pano, [
      'claim', '--sid', 'x1', '--sid', 'x2', '--lane', 'Z', '--globs', 'E/**',
    ])

    expect(
      r.kod,
      'tekrarlanan --sid GECTI — hangi kimligin yazdigi belirsiz kalir; sessiz secim ezmenin ' +
        'baska adidir ve pano kaydini yanlis sahibe baglar',
    ).toBe(1)
    expect(r.err, 'red mesaji hangi bayraktan bahsettigini soylemeli').toContain('--sid')
    // Ret GORUNUR olmali: iki degeri de yazmali ki okuyan hangisini sildigini bilsin.
    expect(r.err).toContain('x1')
    expect(r.err).toContain('x2')
  })

  it('BIRLESTIRME GORUNUR: kac yol okundugu stderr e yazilir (sessiz birlestirme de okunaksizdir)', () => {
    const pano = panoDizini()
    const r = kostur(pano, [
      'claim', '--sid', 'inv-board-8-c', '--lane', 'SINAVC',
      '--globs', 'FFF/**', '--globs', 'GGG/**',
    ])
    expect(r.kod).toBe(0)
    expect(r.err, 'birlestirme sessiz kaldi — okuyan kac yol kaydedildigini goremez').toMatch(
      /--globs 2 yol/,
    )
  })
})
