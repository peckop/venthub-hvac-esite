import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * TABAN-TAZELEME KAPISI — `scripts/hijyen/taban-tazele.cjs`
 *
 * NİÇİN VAR
 * =========
 * Bu betik bir MERGE'i otomatik çözüyor: yanlış davranırsa kaybı SESSİZ olur — çakışma
 * "çözülmüş" görünür, içerik gider ve hiçbir kırmızı yanmaz. O yüzden kolların hepsi
 * DAVRANIŞ ölçer, kaynakta dize aramaz. 2026-08-31'de tam bu ayrım ısırdı: kaynak-tarayan
 * bir kol bir sabotajı YEŞİL geçti; davranışa çevrilince aynı kol gerçek bir sözleşme
 * bugu yakaladı. Metin taraması "yorumla" tatmin olur, davranış olmaz.
 *
 * ÜÇ TAAHHÜT — her biri bir sabotajla düşürülebilir olmalı
 * ========================================================
 *   1. İLAN LİSTESİ MANİFESTTEN OKUNUR (gömülü liste sabotajı kırmızı verir).
 *   2. İLAN DIŞI çakışmada DURULUR (fail-closed; "çoğu artefakttı" gerekçesi yasak).
 *   3. `--force-sync` GERÇEKTEN geçilir (üçüncü-ölçüt dersi: araç ile kapı farklı ölçüt
 *      kullanırsa derleme sessizce atlanır ve kapı kırmızı kalır).
 * Dördüncüsü lider şartı: ÇIKIŞ KODU DÜRÜST — kısmi başarıda 0 dönülmez.
 */

const require_ = createRequire(import.meta.url)
const BETIK_YOLU = require_.resolve('../../../scripts/hijyen/taban-tazele.cjs')
const betik = require_(BETIK_YOLU) as {
  ilanEdilmisYollar: (metin: string) => Set<string>
  cakismaSiniflandir: (cakisanlar: string[], ilanlar: Set<string>) => { ilan: string[]; disi: string[] }
  docBuildArgumanlari: (agac: string) => string[]
  MANIFEST_YOLU: string
  TAZELIK_KAPISI: string
}

function depoKoku(): string {
  return execFileSync('git', ['-C', path.dirname(BETIK_YOLU), 'rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}

type Fikstur = {
  kok: string
  kos: (ekArgs?: string[], ortam?: Record<string, string>) => { kod: number; cikti: string }
}

/**
 * GERCEK bir git deposu kurar: master ve dal AYNI dosyalari degistirir -> gercek cakisma.
 * `ilanDisiDaCakissin` ile ilan edilmemis bir yolda da cakisma uretilir.
 * Kancalar fikstur deposunda bilerek KAPATILIR (proje kancalari orada yok; ana depoda ACIK).
 */
function fiksturKur(ilanDisiDaCakissin: boolean): Fikstur {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tabantazele-'))
  const bosKanca = fs.mkdtempSync(path.join(os.tmpdir(), 'kancasiz-'))
  const g = (...a: string[]) => execFileSync('git', ['-C', kok, ...a], { encoding: 'utf8' })
  g('init', '-q')
  g('config', 'user.email', 't@t')
  g('config', 'user.name', 't')
  g('config', 'core.hooksPath', bosKanca.replace(/\\/g, '/'))

  fs.mkdirSync(path.join(kok, 'docs'), { recursive: true })
  const manifest = {
    artefaktlar: [
      { ad: 'a_master.md', yol: 'docs/a_master.md' },
      { ad: 'b_master.md', yol: 'docs/b_master.md' },
    ],
  }
  fs.writeFileSync(path.join(kok, 'docs/artefakt_manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  fs.writeFileSync(path.join(kok, 'docs/a_master.md'), 'TABAN\n')
  fs.writeFileSync(path.join(kok, 'docs/b_master.md'), 'TABAN\n')
  fs.writeFileSync(path.join(kok, 'kaynak.txt'), 'TABAN\n')
  g('add', '--', 'docs', 'kaynak.txt')
  g('commit', '-q', '-m', 'taban')

  g('checkout', '-q', '-b', 'dal')
  fs.writeFileSync(path.join(kok, 'docs/a_master.md'), 'DAL SURUMU\n')
  if (ilanDisiDaCakissin) fs.writeFileSync(path.join(kok, 'kaynak.txt'), 'DAL SURUMU\n')
  g('add', '--', 'docs/a_master.md', 'kaynak.txt')
  g('commit', '-q', '-m', 'dal')

  g('checkout', '-q', 'master')
  fs.writeFileSync(path.join(kok, 'docs/a_master.md'), 'MASTER SURUMU\n')
  if (ilanDisiDaCakissin) fs.writeFileSync(path.join(kok, 'kaynak.txt'), 'MASTER SURUMU\n')
  g('add', '--', 'docs/a_master.md', 'kaynak.txt')
  g('commit', '-q', '-m', 'master')

  g('checkout', '-q', 'dal')

  return {
    kok,
    kos(ekArgs: string[] = [], ortam: Record<string, string> = {}) {
      try {
        const cikti = execFileSync(process.execPath, [BETIK_YOLU, '--agac', kok, '--taban', 'master', ...ekArgs], {
          encoding: 'utf8',
          env: { ...process.env, ...ortam },
          maxBuffer: 32 * 1024 * 1024,
        })
        return { kod: 0, cikti: String(cikti) }
      } catch (e) {
        const hata = e as { status?: number; stdout?: string; stderr?: string }
        return {
          kod: typeof hata.status === 'number' ? hata.status : -1,
          cikti: String(hata.stdout || '') + String(hata.stderr || ''),
        }
      }
    },
  }
}

function birlesmemisYollar(kok: string): string[] {
  const s = execFileSync('git', ['-C', kok, 'diff', '--name-only', '--diff-filter=U'], {
    encoding: 'utf8',
  }).trim()
  return s ? s.split('\n').filter(Boolean) : []
}

describe('taban-tazele — ilan listesi MANIFESTTEN okunur', () => {
  it('manifestteki yol alanlarini + manifestin kendisini dondurur', () => {
    const metin = JSON.stringify({
      artefaktlar: [
        { ad: 'x.md', yol: 'docs/x.md' },
        { ad: 'y.md', yol: 'docs/alt/y.md' },
      ],
    })
    const kume = betik.ilanEdilmisYollar(metin)
    expect([...kume].sort()).toEqual([betik.MANIFEST_YOLU, 'docs/alt/y.md', 'docs/x.md'].sort())
  })

  it('GOMULU LISTE SABOTAJINI DUSURUR — depodaki GERCEK manifestin icerigiyle eslesmeli', () => {
    // Ilan listesini kaynaga gomen bir sabotaj bu kolda dusor: gomulu liste depodaki
    // gercek manifest degisince ayrisir. Beklenen kume DOSYADAN okunur, yazilmaz.
    const metin = fs.readFileSync(path.join(depoKoku(), betik.MANIFEST_YOLU), 'utf8')
    const beklenen = new Set<string>([betik.MANIFEST_YOLU])
    const cozulmus = JSON.parse(metin) as { artefaktlar: Array<{ yol: string }> }
    for (const a of cozulmus.artefaktlar) beklenen.add(a.yol)
    expect(beklenen.size).toBeGreaterThan(1)
    expect([...betik.ilanEdilmisYollar(metin)].sort()).toEqual([...beklenen].sort())
  })

  it('FAIL-CLOSED: yol alani eksikse ATAR (ad alanindan yol TURETMEZ)', () => {
    expect(() => betik.ilanEdilmisYollar(JSON.stringify({ artefaktlar: [{ ad: 'x.md' }] }))).toThrow(/yol alani YOK/)
  })

  it('FAIL-CLOSED: bos veya bozuk manifest sessizce gecmez', () => {
    expect(() => betik.ilanEdilmisYollar('{')).toThrow(/AYRISTIRILAMADI/)
    expect(() => betik.ilanEdilmisYollar(JSON.stringify({ artefaktlar: [] }))).toThrow(/BOS artefakt/)
    expect(() => betik.ilanEdilmisYollar(JSON.stringify({}))).toThrow(/artefaktlar dizisi YOK/)
  })

  it('siniflandirma ilan disi yolu ILAN DISI kovaya koyar', () => {
    const ilanlar = new Set(['docs/a.md', betik.MANIFEST_YOLU])
    const { ilan, disi } = betik.cakismaSiniflandir(['docs/a.md', 'src/x.ts'], ilanlar)
    expect(ilan).toEqual(['docs/a.md'])
    expect(disi).toEqual(['src/x.ts'])
  })
})

describe('taban-tazele — --force-sync gercekten geciliyor', () => {
  it('doc build argumanlari --force-sync ve --repo-root icerir', () => {
    const args = betik.docBuildArgumanlari('C:/x/y')
    expect(args).toContain('build')
    expect(args).toContain('--force-sync')
    expect(args[args.indexOf('--repo-root') + 1]).toBe('C:/x/y')
  })
})

describe('taban-tazele — CANLI DAVRANIS (gercek depo, gercek merge)', () => {
  it('ILAN DISI cakismada DURUR: cikis 2, merge YARIM birakilir, kismi cozum YOK', () => {
    const f = fiksturKur(true)
    const r = f.kos(['--kapisiz'])
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/ILAN DISI/)
    expect(r.cikti).toMatch(/kaynak\.txt/)
    // Merge yarim: birlesmemis yol HALA duruyor -> betik hicbir seyi kendi basina cozmedi.
    expect(birlesmemisYollar(f.kok)).toContain('kaynak.txt')
    expect(r.cikti).not.toMatch(/OTOMATIK cozuldu/)
  })

  it('ILAN EDILMIS cakisma otomatik cozulur (ours) ve birlesmemis yol KALMAZ', () => {
    const f = fiksturKur(false)
    const r = f.kos(['--kapisiz'])
    expect(r.cikti).toMatch(/OTOMATIK cozuldu/)
    expect(birlesmemisYollar(f.kok)).toEqual([])
    expect(fs.readFileSync(path.join(f.kok, 'docs/a_master.md'), 'utf8').trim()).toBe('DAL SURUMU')
  })

  it('CIKIS KODU DURUST: kapi KOSULMADIYSA 0 degil 1 doner ("gecti" DEMEZ)', () => {
    // Lider sarti (d). Merge cozuldu ama kapi kosulmadi -> bu KISMI basaridir.
    // Kismi basarida 0 donmek, olculmemis bir adimi "gecti" saymaktir.
    const f = fiksturKur(false)
    const r = f.kos(['--kapisiz'])
    expect(r.cikti).toMatch(/OTOMATIK cozuldu/)
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/gecti" DEMIYORUM/)
  })

  it('CIKIS KODU DURUST: doc build BASARISIZ olursa 3 doner (uretim yolu OLCULUR)', () => {
    // Bu kol olmadan "uretim basarisiz" dali hic kosulmuyordu ve oraya konan bir
    // sabotaj FARK EDILMIYORDU (2026-09-01'de sabotaj turunda olculdu: S4 yesil gecti,
    // sebebi kapinin korlugu DEGIL o dalin hic uyarilmamasiydi). Yorumlayiciyi
    // olmayan bir yola sabitleyerek basarisizligi URETIYORUZ.
    const f = fiksturKur(false)
    const r = f.kos(['--kapisiz'], { TABAN_TAZELE_PYTHON: 'C:/olmayan-yorumlayici-xyzzy' })
    expect(r.cikti).toMatch(/doc build BASARISIZ/)
    expect(r.kod).toBe(3)
  })

  it('FAIL-CLOSED: agac KIRLIYSE hic baslamaz (cikis 2, merge YOK)', () => {
    const f = fiksturKur(false)
    fs.writeFileSync(path.join(f.kok, 'kirli.txt'), 'x\n')
    const r = f.kos(['--kapisiz'])
    expect(r.kod).toBe(2)
    expect(r.cikti).toMatch(/agac KIRLI/)
    expect(r.cikti).not.toMatch(/OTOMATIK cozuldu/)
  })
})

describe('taban-tazele — sozlesme hijyeni', () => {
  it('require YAN ETKISIZ: modul yuklenirken main() KOSMAZ, stdout kirlenmez', () => {
    // 2026-08-31 dersi: kosulsuz main() cagrisi bir SessionStart kancasinin JSON
    // sozlesmesini bozdu. Ayni hatanin buraya sizmasi ayni sekilde olculur.
    const kod =
      'const m=require(' + JSON.stringify(BETIK_YOLU) + ');' +
      'process.stdout.write("IHRACAT:"+Object.keys(m).sort().join(","));'
    const cikti = execFileSync(process.execPath, ['-e', kod], { encoding: 'utf8' })
    expect(cikti).toBe('IHRACAT:MANIFEST_YOLU,TAZELIK_KAPISI,cakismaSiniflandir,docBuildArgumanlari,ilanEdilmisYollar')
  })

  it('betigin isaret ettigi tazelik kapisi dosyasi GERCEKTEN var', () => {
    expect(fs.existsSync(path.join(depoKoku(), betik.TAZELIK_KAPISI))).toBe(true)
  })

  it('her git cagrisi -C ile: -C siz execFileSync(git) KALMAMIS', () => {
    // Lider sarti (b). Yapisal olcut: `git` cagrisinin ilk argumani '-C' olmali.
    // cwd sessizce ana dizine resetlenebiliyor (2026-08-31'de defalarca olculdu).
    const kaynak = fs.readFileSync(BETIK_YOLU, 'utf8')
    const cagrilar = [...kaynak.matchAll(/execFileSync\(\s*'git'\s*,\s*\[([^\]]*)\]/g)]
    expect(cagrilar.length).toBeGreaterThan(0)
    for (const c of cagrilar) {
      expect(c[1].trimStart().startsWith("'-C'")).toBe(true)
    }
  })
})
