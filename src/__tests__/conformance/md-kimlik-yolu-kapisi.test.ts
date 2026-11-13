import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * INV-MD-KIMLIK-1 (ARC-303): push öncesi, itilecek farkta EKLENEN .md satırında kimlik yolu varsa kapı reddeder.
 * Hermetik: geçici git deposu; kimlik yolu çalışma anında PARÇALARDAN kurulur (bu dosya INV-MUTLAK-YOL-1'e satır eklemesin).
 * Sabotaj: kapının kopyasına konan her hata en az bir senaryoyu kırar.
 */
vi.setConfig({ testTimeout: 120_000 })

const KOK = path.resolve(__dirname, '../../..')
const KAPI = path.join(KOK, 'scripts/hijyen/md-kimlik-yolu-kapisi.cjs')
const KAPI_KAYNAK = fs.readFileSync(KAPI, 'utf8')
const mod = createRequire(import.meta.url)(KAPI) as {
  KIMLIK_DESENI: RegExp
  eklenenSatirlar: (d: string) => Array<{ dosya: string; no: number; metin: string }>
}

const KIMLIK = ['C:', 'Users', 'ornek', 'proje'].join('\\') // parçalardan: kaynakta literal yok
const SIFIR = '0'.repeat(40)

let gecici = ''
let depo = ''
let tabanSha = ''
let ihlalSha = ''
let temizSha = ''
let karmaSha = ''
let eskiSatirSha = ''

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: depo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}
function commitle(dosya: string, icerik: string, ileti: string): string {
  fs.mkdirSync(path.dirname(path.join(depo, dosya)), { recursive: true })
  fs.writeFileSync(path.join(depo, dosya), icerik, 'utf8')
  git('add', dosya)
  git('commit', '-q', '-m', ileti)
  return git('rev-parse', 'HEAD')
}

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'md-kimlik-'))
  depo = path.join(gecici, 'depo')
  fs.mkdirSync(depo)
  git('init', '-q', '-b', 'master')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')
  git('config', 'commit.gpgsign', 'false')
  // Tabanda ZATEN kimlik satırı olan bir belge var (mandalın işi; kapı dokunmamalı)
  tabanSha = commitle('docs/eski.md', `# eski\nveri deposu: ${KIMLIK}\n`, 'taban')
  git('update-ref', 'refs/remotes/origin/master', tabanSha)
  git('checkout', '-q', '-b', 'dal')
  temizSha = commitle('docs/temiz.md', '# temiz\ngöreli yol: docs/plans/x.md\n', 'temiz')
  ihlalSha = commitle('docs/yeni.md', `# yeni\nyol: ${KIMLIK}\n`, 'ihlal')
  eskiSatirSha = commitle('docs/eski.md', `# eski\nveri deposu: ${KIMLIK}\nikinci satır temiz\n`, 'eski satıra dokunmadan ekleme')
  commitle('.archive/arsiv.md', `arsiv: ${KIMLIK}\n`, 'arsiv')
  commitle('docs/companion.md', `---\nsource_path: ${KIMLIK}\n---\n`, 'companion')
  commitle('src/kod.ts', `// ${KIMLIK}\n`, 'kod')
  karmaSha = git('rev-parse', 'HEAD')
})

afterAll(() => {
  try {
    fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch {
    /* kilitli geçici dizin: OS temizliğine kalır */
  }
})

function calistir(betik: string, girdi: string, ortam: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [betik], { cwd: depo, input: girdi, encoding: 'utf8', env: { ...process.env, VH_MD_KIMLIK_IZIN: '', ...ortam } })
  return { kod: r.status, err: r.stderr }
}
const itme = (yerel: string, uzak = SIFIR) => `refs/heads/dal ${yerel} refs/heads/dal ${uzak}\n`

/** Senaryolar: hata listesi döner ([] = hepsi tamam). Gerçek kapı ve sabotajlı kopyalar AYNI senaryolarla ölçülür. */
function senaryolar(betik: string): string[] {
  const hata: string[] = []
  const dogru = (k: boolean, ne: string) => {
    if (!k) hata.push(ne)
  }
  const temiz = calistir(betik, itme(temizSha, tabanSha))
  dogru(temiz.kod === 0 && temiz.err === '', 'temiz .md eklemesi sessiz geçmeli')
  const ihlal = calistir(betik, itme(ihlalSha, tabanSha))
  dogru(ihlal.kod === 1 && /docs\/yeni\.md:2:/.test(ihlal.err), 'kimlik yolu eklenen .md reddedilmeli, mesajda dosya:satır olmalı')
  const eski = calistir(betik, itme(eskiSatirSha, ihlalSha))
  dogru(eski.kod === 0, 'tabanda zaten olan kimlik satırına dokunmayan fark reddedilmemeli (yalnız EKLENEN satırlar)')
  const yeniDal = calistir(betik, itme(karmaSha)) // uzak sha sıfır: origin/master ile ortak atadan
  dogru(yeniDal.kod === 1 && /docs\/yeni\.md:2:/.test(yeniDal.err), 'yeni dal (uzak sha sıfır) origin/master tabanıyla taranmalı')
  dogru(!/arsiv\.md|companion\.md|kod\.ts/.test(yeniDal.err), '.archive/, companion source_path: ve .md olmayan dosya kapsam dışı olmalı')
  const silme = calistir(betik, itme(SIFIR, tabanSha))
  dogru(silme.kod === 0 && silme.err === '', "silme push'u (yerel sha sıfır) taranmadan, uyarısız geçmeli")
  const vana = calistir(betik, itme(ihlalSha, tabanSha), { VH_MD_KIMLIK_IZIN: '1' })
  dogru(vana.kod === 0 && /VH_MD_KIMLIK_IZIN=1/.test(vana.err), 'bilinçli geçiş uyarıyla geçmeli')
  const bozuk = calistir(betik, 'refs/heads/dal 1111111111111111111111111111111111111111 refs/heads/dal 2222222222222222222222222222222222222222\n')
  dogru(bozuk.kod === 0 && /fark okunamadı/.test(bozuk.err), 'okunamayan fark fail-open: uyarıyla geçmeli')
  dogru(calistir(betik, '').kod === 0, 'boş stdin geçmeli')
  return hata
}

describe('INV-MD-KIMLIK-1 · gerçek kapı', () => {
  it('tüm senaryolar geçer', () => {
    expect(senaryolar(KAPI)).toEqual([])
  })

  it('ölçüt testteki KIMLIK_DESENI ile AYNI (kopya sapamaz)', () => {
    const test = fs.readFileSync(path.join(KOK, 'src/__tests__/conformance/mutlak-yol-sizintisi.test.ts'), 'utf8')
    const m = /const KIMLIK_DESENI =\s*\n?\s*\/(.+)\/\s*\n/.exec(test)
    expect(m, 'mutlak-yol testinde KIMLIK_DESENI bulunamadı').not.toBeNull()
    expect(mod.KIMLIK_DESENI.source).toBe(m?.[1])
  })

  it('eklenenSatirlar: yeni dosya, satır numaraları ve silinen satırlar', () => {
    const diff = ['--- a/x.md', '+++ b/x.md', '@@ -3,1 +3,2 @@', '-eski', '+yeni bir', '+yeni iki', '--- a/y.txt', '+++ b/y.txt', '@@ -1,0 +1,1 @@', '+metin'].join('\n')
    expect(mod.eklenenSatirlar(diff)).toEqual([
      { dosya: 'x.md', no: 3, metin: 'yeni bir' },
      { dosya: 'x.md', no: 4, metin: 'yeni iki' },
    ])
  })
})

describe('INV-MD-KIMLIK-1 · SABOTAJ: kapıya konan her hata en az bir senaryoyu kırar', () => {
  const SABOTAJLAR: Array<[string, string, string]> = [
    ['desen hiçbir şeyi yakalamaz', '&& KIMLIK_DESENI.test(s.metin)', '&& false'],
    ['yalnız eklenen değil tüm dosya taranır (boş ağaca karşı fark: taban satırı da ihlal sayılır)', "taban(yerelSha, uzakSha || '0')", "'4b825dc642cb199ba7ccc9f4e6cbf6e12c8fc8d9'"],
    ['.archive/ kapsam dışı değil', "!s.dosya.startsWith('.archive/') && ", ''],
    ['companion source_path satırı kapsam dışı değil', '!/^\\s*source_path\\s*:/.test(s.metin) && ', ''],
    ['yalnız .md değil her dosya taranır', "if (dosya.endsWith('.md')) sonuc.push", 'if (dosya) sonuc.push'],
    ['vana yok sayılır', "ortam.VH_MD_KIMLIK_IZIN === '1'", 'false'],
    ['silme push\'u taranır', 'if (!yerelSha || SIFIR.test(yerelSha)) continue', 'if (!yerelSha) continue'],
    ['ihlal çıkış 1 yerine 0 verir', 'kod: 1,', 'kod: 0,'],
    ['okunamayan fark sessizce geçer (uyarı yok)', 'if (olculemedi && bulunan.length === 0) {', 'if (false) {'],
  ]

  it.each(SABOTAJLAR)('%s', (ad, eski, yeni) => {
    expect(KAPI_KAYNAK.split(eski).length, `sabotaj noktası kaynakta TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    const yol = path.join(gecici, `sabotaj-${SABOTAJLAR.findIndex((s) => s[0] === ad)}.cjs`)
    fs.writeFileSync(yol, KAPI_KAYNAK.replace(eski, yeni), 'utf8')
    expect(senaryolar(yol).length, `sabotaj HİÇBİR senaryoyu kırmadı: "${ad}" — bu davranış testle korunmuyor`).toBeGreaterThan(0)
  })
})
