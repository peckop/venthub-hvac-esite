/**
 * INV-KANCA-SAGE-DAEMON-AC-1 — SessionStart'ta sage daemon'u ölüyse BİR KEZ ana ağaç paketinden diriltme (ARC-209, OPS UYGUN 27 Ekim).
 *
 * Kanca .claude/hooks/sage-daemon-ac.cjs, işçi scripts/board/sage-daemon-baslat.cjs. OPS şartı (ARC-98 dersi): işçi daemon'u YALNIZ ana ağacın
 * paketinden başlatır; worktree yolundan başlatma girişimi reddedilir (farklı sürümlü paket canlı sage.db'ye bağlanıp şema göçü yapmasın).
 * Canlı daemon bu testte ASLA başlatılmaz/kapatılmaz: işçi sahte modülle, kanca kuru koşu bayrağıyla sınanır.
 *
 * Sabotaj: kanca ve işçi kaynaklarına tek tek hata sokulur (temp kopya); her hatalı kopya en az bir senaryoyu kırmızıya çevirir.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'sage-daemon-ac.cjs')
const ISCI = path.join(KOK, 'scripts', 'board', 'sage-daemon-baslat.cjs')
const KANCA_KAYNAK = fs.readFileSync(KANCA, 'utf8').replace(/\r\n/g, '\n')
const ISCI_KAYNAK = fs.readFileSync(ISCI, 'utf8').replace(/\r\n/g, '\n')

type IsciModul = { paketYolu: (kok: string) => { giris: string; surum: string }; baslat: (g: Record<string, unknown>) => Promise<{ giris: string; surum: string }> }
type KancaModul = { karar: (g: { uyari: string; sonDeneme: number; simdi: number }) => string; calistir: (env: Record<string, string>, simdi: number, dep?: Record<string, unknown>) => string }

let dizin = ''
let anaAgac = ''
let worktreeKok = ''
let sembolikKok = ''

beforeAll(() => {
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-daemon-ac-'))
  // Sahte "ana ağaç": tools/wrongstack-mcp/node_modules/@wrongstack/sage/{package.json,dist/index.js}
  anaAgac = path.join(dizin, 'ana')
  const paket = path.join(anaAgac, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage')
  fs.mkdirSync(path.join(paket, 'dist'), { recursive: true })
  fs.writeFileSync(path.join(paket, 'package.json'), JSON.stringify({ version: '9.9.9-test' }))
  fs.writeFileSync(path.join(paket, 'dist', 'index.js'), 'export class ProjectSageMemoryPort {}\n')
  // Paketi kök DIŞINA işaret eden sembolik bağ (junction) olan kök
  const disPaket = path.join(dizin, 'dis-paket', 'sage')
  fs.mkdirSync(path.join(disPaket, 'dist'), { recursive: true })
  fs.writeFileSync(path.join(disPaket, 'dist', 'index.js'), 'export class ProjectSageMemoryPort {}\n')
  sembolikKok = path.join(dizin, 'sembolik')
  const sembolikAta = path.join(sembolikKok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack')
  fs.mkdirSync(sembolikAta, { recursive: true })
  fs.symlinkSync(disPaket, path.join(sembolikAta, 'sage'), 'junction')
  // Sahte "worktree": paketi YEREL olarak da var (farklı sürüm) ama kök .claude/worktrees/ altında
  worktreeKok = path.join(dizin, 'ana', '.claude', 'worktrees', 'sahte-pencere')
  const wPaket = path.join(worktreeKok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage')
  fs.mkdirSync(path.join(wPaket, 'dist'), { recursive: true })
  fs.writeFileSync(path.join(wPaket, 'package.json'), JSON.stringify({ version: '0.0.1-worktree' }))
  fs.writeFileSync(path.join(wPaket, 'dist', 'index.js'), 'export class ProjectSageMemoryPort {}\n')
})

afterAll(() => {
  fs.rmSync(dizin, { recursive: true, force: true })
})

// ───────────────────────── İŞÇİ ─────────────────────────

/** İşçi senaryoları; hata açıklamaları döner ([] = tamam). Gerçek işçi ve sabotajlı kopya AYNI senaryolarla ölçülür. */
async function isciSenaryolari(iscilYolu: string): Promise<string[]> {
  const hata: string[] = []
  const dogru = (k: boolean, ne: string) => {
    if (!k) hata.push(ne)
  }
  const m = gerek(iscilYolu) as IsciModul

  // 1. ana ağaç kökü: paket yolu ve sürüm doğru
  const p = m.paketYolu(anaAgac)
  dogru(p.surum === '9.9.9-test' && p.giris.includes(path.join('ana', 'tools')), 'ana ağaç paketi çözülmedi')

  // 2. worktree kökü REDDEDİLİR (OPS şartı)
  let ret = ''
  try {
    m.paketYolu(worktreeKok)
  } catch (e) {
    ret = String((e as Error).message)
  }
  dogru(/worktree/.test(ret), 'worktree kökünden paket yolu REDDEDİLMELİ (yerel paketi olsa bile)')

  // 3. baslat: worktree köküyle paket YÜKLENMEZ ve port kurulmaz
  let yuklenen = 0
  const ice = async () => {
    yuklenen++
    return { ProjectSageMemoryPort: class {} }
  }
  let reddedildi = false
  try {
    await m.baslat({ kok: worktreeKok, ice, log: () => {} })
  } catch {
    reddedildi = true
  }
  dogru(reddedildi && yuklenen === 0, 'worktree köküyle baslat paketi YÜKLEMEMELİ ve hata vermeli')

  // 4. baslat (ana ağaç): ana ağaç paketini yükler, spawnIfMissing:true ve projectRoot=ana ağaç, initialize + releaseConnection çağrılır
  const olaylar: string[] = []
  let secenek: Record<string, unknown> = {}
  let yuklenenUrl = ''
  const sahteModul = {
    ProjectSageMemoryPort: class {
      constructor(o: Record<string, unknown>) {
        secenek = o
      }
      async initialize() {
        olaylar.push('initialize')
      }
      releaseConnection() {
        olaylar.push('release')
      }
    },
  }
  const loglar: string[] = []
  const s = await m.baslat({
    kok: anaAgac,
    ice: async (url: string) => {
      yuklenenUrl = url
      return sahteModul
    },
    log: (x: string) => loglar.push(x),
  })
  dogru(yuklenenUrl === pathToFileURL(p.giris).href, 'ana ağaç paket URL’si yüklenmeli')
  dogru(secenek.spawnIfMissing === true && secenek.projectRoot === path.resolve(anaAgac), 'spawnIfMissing:true ve projectRoot=ana ağaç olmalı')
  dogru(olaylar.join(',') === 'initialize,release', 'initialize sonra releaseConnection çağrılmalı')
  dogru(s.surum === '9.9.9-test' && loglar.some((l) => /paket=.*surum=9\.9\.9-test/.test(l)), 'günlük HANGİ yol ve HANGİ sürümü yazmalı')

  // 5. zaman aşımı: initialize asılı kalırsa hata (kopuk süreç sonsuza dek asılmaz)
  let zamanAsimi = false
  try {
    await m.baslat({
      kok: anaAgac,
      zamanAsimiMs: 30,
      ice: async () => ({ ProjectSageMemoryPort: class { initialize() { return new Promise(() => {}) } releaseConnection() {} } }),
      log: () => {},
    })
  } catch (e) {
    zamanAsimi = /içinde bitmedi/.test(String((e as Error).message))
  }
  dogru(zamanAsimi, 'asılı initialize zaman aşımına uğramalı')

  // 7. paketin gerçek yolu kökün DIŞINA çıkıyorsa (sembolik bağ) hata
  let dis = ''
  try {
    m.paketYolu(sembolikKok)
  } catch (e) {
    dis = String((e as Error).message)
  }
  dogru(/dışında/.test(dis), 'kök dışına çıkan paket yolu REDDEDİLMELİ')

  // 6. ana ağaçta paket yoksa hata (sessizce başka yola düşmez)
  let yok = false
  try {
    m.paketYolu(path.join(dizin, 'bos-kok'))
  } catch {
    yok = true
  }
  dogru(yok, 'paketi olmayan kök hata vermeli (worktree’ye ya da başka yola SESSİZ düşme yok)')
  return hata
}

describe('INV-KANCA-SAGE-DAEMON-AC-1 · işçi (ana ağaç paketi, worktree reddi)', () => {
  it('tüm işçi senaryoları geçer', async () => {
    expect(await isciSenaryolari(ISCI)).toEqual([])
  })

  it('gerçek depoda: bu ağaç bir worktree ise yol REDDEDİLİR (OPS şartı, canlı doğrulama)', () => {
    const m = gerek(ISCI) as IsciModul
    if (/[\\/]\.claude[\\/]worktrees[\\/]/i.test(KOK + path.sep)) {
      expect(() => m.paketYolu(KOK)).toThrow(/worktree/)
    }
  })
})

// ───────────────────────── KANCA ─────────────────────────

const KANCA_ORTAM = (pano: string, dbKok: string, ek: Record<string, string> = {}) => ({ ...process.env, VENTHUB_BOARD_DIR: pano, VENTHUB_SAGE_DB_KOKU: dbKok, VENTHUB_SAGE_DAEMON_AC_KURU: '1', ...ek })

function sunucuJson(dbKok: string, pid: number) {
  const d = path.join(dbKok, '.wrongstack', 'memories')
  fs.mkdirSync(d, { recursive: true })
  fs.writeFileSync(path.join(d, 'server.json'), JSON.stringify({ pid }))
}

function kancaSenaryolari(kancaYolu: string): string[] {
  const hata: string[] = []
  const dogru = (k: boolean, ne: string) => {
    if (!k) hata.push(ne)
  }
  const kos = (pano: string, dbKok: string, ek: Record<string, string> = {}) => {
    const r = spawnSync(process.execPath, [kancaYolu], { input: '{}', encoding: 'utf8', env: KANCA_ORTAM(pano, dbKok, ek) })
    return { status: r.status, stdout: r.stdout.trim() }
  }
  const taze = (ad: string) => fs.mkdtempSync(path.join(dizin, ad))

  // canlı daemon (pid = bu test süreci) → sessiz, damga yazılmaz
  const canliKok = taze('canli-')
  const canliPano = taze('pano-canli-')
  sunucuJson(canliKok, process.pid)
  const canli = kos(canliPano, canliKok)
  dogru(canli.status === 0 && canli.stdout === '' && !fs.existsSync(path.join(canliPano, '.sage-daemon-denendi')), 'daemon canlıyken HİÇBİR ŞEY yapılmamalı')

  // ölü daemon → başlatılırdı satırı + damga
  const oluKok = taze('olu-')
  const oluPano = taze('pano-olu-')
  sunucuJson(oluKok, 2147483646)
  const ilk = kos(oluPano, oluKok)
  dogru(ilk.status === 0 && /başlatılırdı/.test(ilk.stdout), 'ölü daemonda başlatma satırı basılmalı')
  dogru(fs.existsSync(path.join(oluPano, '.sage-daemon-denendi')), 'deneme damgası yazılmalı')

  // aynı pano, hemen ikinci pencere → ÇİFT BAŞLATMA YOK
  const ikinci = kos(oluPano, oluKok)
  dogru(ikinci.stdout === '', '120 sn içinde ikinci pencere yeniden başlatmamalı (çift başlatma koruması)')

  // vana
  const vanaPano = taze('pano-vana-')
  dogru(kos(vanaPano, oluKok, { VENTHUB_SAGE_DAEMON_AC_KAPALI: '1' }).stdout === '', 'vana kapatmalı')

  // fail-open: server.json yok → "kapalı" sayılır ve başlatılır (ARC-207 ile aynı ölçü); kök hiç yoksa çökmez
  const yokPano = taze('pano-yok-')
  const yok = kos(yokPano, path.join(dizin, 'hic-yok-kok'))
  dogru(yok.status === 0, 'olmayan kökte çökmemeli (çıkış 0)')
  return hata
}

describe('INV-KANCA-SAGE-DAEMON-AC-1 · kanca', () => {
  it('tüm kanca senaryoları geçer (canlıyken no-op, ölüyken bir kez, vana, fail-open)', () => {
    expect(kancaSenaryolari(KANCA)).toEqual([])
  })

  it('karar: canlı → canli; yakın zamanda denendi → bekle; aksi → baslat', () => {
    const k = gerek(KANCA) as KancaModul
    expect(k.karar({ uyari: '', sonDeneme: NaN, simdi: 1000 })).toBe('canli')
    expect(k.karar({ uyari: '⚠SAGE KAPALI', sonDeneme: 900, simdi: 1000 })).toBe('yakin-zamanda-denendi')
    expect(k.karar({ uyari: '⚠SAGE KAPALI', sonDeneme: NaN, simdi: 1000 })).toBe('baslat')
    expect(k.karar({ uyari: '⚠SAGE KAPALI', sonDeneme: 1000 - 121_000, simdi: 1000 })).toBe('baslat')
  })

  it('calistir: başlatıcı ölüyken TAM BİR KEZ çağrılır, kök olarak daemon kökünü alır', () => {
    const k = gerek(KANCA) as KancaModul
    const cagri: string[] = []
    const pano = fs.mkdtempSync(path.join(dizin, 'pano-cekirdek-'))
    const dep = { anaKok: () => 'KOK', uyari: () => '⚠SAGE KAPALI: x', baslat: (kok: string) => cagri.push(kok) }
    const env = { VENTHUB_BOARD_DIR: pano }
    expect(k.calistir(env, 5_000_000, dep)).toMatch(/arka planda başlatıldı/)
    expect(k.calistir(env, 5_000_100, dep)).toBe('')
    expect(cagri).toEqual(['KOK'])
  })
})

// ───────────────────────── SABOTAJ ─────────────────────────

describe('INV-KANCA-SAGE-DAEMON-AC-1 · SABOTAJ: konan her tek hata en az bir senaryoyu kırar', () => {
  const ISCI_SABOTAJ: Array<[string, string, string]> = [
    ['işçi: worktree reddi kalktı', "if (/[\\\\/]\\.claude[\\\\/]worktrees[\\\\/]/i.test(k + path.sep)) {", 'if (false) {'],
    ['işçi: spawnIfMissing kapalı', 'projectRoot: path.resolve(kok), spawnIfMissing: true,', 'projectRoot: path.resolve(kok), spawnIfMissing: false,'],
    ['işçi: bağlantı bırakılmaz', 'port.releaseConnection()', '/* bırakılmadı */'],
    ['işçi: zaman aşımı yok', 'new Promise((_, red) => {\n        zamanlayici = setTimeout(() => red(new Error(`initialize ${zamanAsimiMs} ms içinde bitmedi`)), zamanAsimiMs)\n      }),', 'new Promise(() => {}),'],
    ['işçi: sürüm günlüğe yazılmaz', 'log(`paket=${giris} surum=${surum}`)', 'log(`paket=${giris}`)'],
    ['işçi: paketin gerçek yolu kök dışına çıkabilir', 'if (!gercek.toLowerCase().startsWith(gercekKok.toLowerCase() + path.sep)) {', 'if (false) {'],
  ]
  const KANCA_SABOTAJ: Array<[string, string, string]> = [
    ['kanca: canlı daemonu da başlatır', "if (!uyari) return 'canli'", "if (false) return 'canli'"],
    ['kanca: çift başlatma koruması yok', "return 'yakin-zamanda-denendi'", "return 'baslat'"],
    ['kanca: vana yok sayılır', "if (env[VANA] === '1') return ''", ''],
    ['kanca: damga yazılmaz', 'fs.writeFileSync(damga, String(simdi))', '/* damga yok */'],
  ]

  it.each(ISCI_SABOTAJ)('%s', async (ad, eski, yeni) => {
    expect(ISCI_KAYNAK.split(eski).length, `sabotaj noktası işçi kaynağında TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    const mutant = ISCI_KAYNAK.replace(eski, yeni).split('__dirname').join(JSON.stringify(path.dirname(ISCI))).replace("require('../../tools/wrongstack-mcp/posta-kutusu.cjs')", `require(${JSON.stringify(path.join(KOK, 'tools/wrongstack-mcp/posta-kutusu.cjs'))})`)
    const yol = path.join(dizin, `isci-sabotaj-${ISCI_SABOTAJ.findIndex((s) => s[0] === ad)}.cjs`)
    fs.writeFileSync(yol, mutant, 'utf8')
    const hatalar = await Promise.race([
      isciSenaryolari(yol).catch((e: Error) => [`senaryo çöktü: ${e.message}`]),
      new Promise<string[]>((r) => setTimeout(() => r(['senaryo asıldı (zaman aşımı yok)']), 3000)),
    ])
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmadı: "${ad}" — bu davranış testle korunmuyor`).toBeGreaterThan(0)
  })

  it.each(KANCA_SABOTAJ)('%s', (ad, eski, yeni) => {
    expect(KANCA_KAYNAK.split(eski).length, `sabotaj noktası kanca kaynağında TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    const mutant = KANCA_KAYNAK.replace(eski, yeni).split('__dirname').join(JSON.stringify(path.dirname(KANCA)))
    const yol = path.join(dizin, `kanca-sabotaj-${KANCA_SABOTAJ.findIndex((s) => s[0] === ad)}.cjs`)
    fs.writeFileSync(yol, mutant, 'utf8')
    const hatalar = kancaSenaryolari(yol)
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmadı: "${ad}" — bu davranış testle korunmuyor`).toBeGreaterThan(0)
  })
})
