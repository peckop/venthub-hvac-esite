// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-BAYATLIK — `.claude/hooks/defter-bayatlik-olcumu.cjs`
 *
 * NİÇİN VAR: 2026-09-06'da proje takip defteri 8 saat bayat kaldı ve o süre boyunca
 * "konuşmuş muyduk" sorusuna YANLIŞ cevap verdi. Bayat defter, yalan söyleyen defterdir.
 *
 * ⛔KAPININ EN ÖNEMLİ KOLU BİR ŞEYİN OLMADIĞINI ölçer: kanca EŞİTLEME YAPMAZ.
 * Eşitleme dış servise (NotebookLM) yazar ve başka şeridin aracıdır; insan araya girmeden
 * dış yazma tetiklenmez (OPS hükmü 2026-09-07, ALTYAPI itirazı üzerine). Bu kol düşerse
 * kanca sessizce "otomatik yazan" bir şeye dönüşmüş demektir.
 */

const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'defter-bayatlik-olcumu.cjs')

/**
 * ⭐TEST KENDİ DEPOSUNU KURAR — makinenin git durumuna GÜVENMEZ (CI'da ölçüldü, 2026-09-07).
 * İlk yazımda testler bu makinedeki gerçek depoya bakıyordu; CI'da `origin/master` ref'i
 * bulunmadığı için kanca daima "OLCULEMEDI" bastı ve ÜÇ kol kırmızı verdi. Yani testler
 * "kancayı" değil "bu makineyi" ölçüyordu. Çare: geçici bir git deposu kur, `state.json`'ı
 * İSTENEN TARİHLE commit'le, `refs/remotes/origin/master` işaretini elle koy. Böylece yaş
 * deterministik olur ve gerçek kod yolu (git log origin/master) yine koşar.
 */
function sahteDepo(commitISO: string): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-depo-'))
  const durum = path.join(d, 'docs', 'proje-takip')
  fs.mkdirSync(durum, { recursive: true })
  fs.writeFileSync(path.join(durum, 'state.json'), JSON.stringify({ surum: 1, demetler: [] }), 'utf8')
  const git = (...arg: string[]) =>
    execFileSync('git', ['-C', d, ...arg], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: commitISO,
        GIT_COMMITTER_DATE: commitISO,
        GIT_AUTHOR_NAME: 'inv',
        GIT_AUTHOR_EMAIL: 'inv@example.invalid',
        GIT_COMMITTER_NAME: 'inv',
        GIT_COMMITTER_EMAIL: 'inv@example.invalid',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  git('init', '-q')
  git('add', 'docs/proje-takip/state.json')
  git('commit', '-q', '-m', 'esitleme')
  // Kanca `origin/master`a bakar; yerel depoda o ref elle kurulur (uzak gerekmez).
  git('update-ref', 'refs/remotes/origin/master', 'HEAD')
  return d
}

/** N saat önceyi ISO olarak verir (fikstür tarihleri buradan). */
function saatOnce(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}

function kostur(env: Record<string, string>, sid: string) {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  const r = execFileSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: sid }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  return { stdout: r, pano }
}

/** stderr'i ayrı yakalar (uyarı oraya yazılır; stdout Stop kancasında konuşmaz). */
function hata(env: Record<string, string>, sid: string): string {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  try {
    const r = execFileSync(process.execPath, [KANCA], {
      input: JSON.stringify({ session_id: sid }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    void r
    return ''
  } catch (e) {
    return String((e as { stderr?: string }).stderr ?? '')
  }
}

/**
 * Kanca DAİMA 0 ile çıkar, o yüzden stderr'i execFileSync'in hata yolundan alamayız.
 * Alt süreci doğrudan kurup stderr'i okuyoruz.
 */
function stderrOku(env: Record<string, string>, sid: string): string {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  // ⚠`require()` KULLANILMAZ (eslint `no-require-imports`): ilk yazımda gövde içinde require
  // çağırdım, vitest ve tsc temiz geçti, CI'da ESLint düşürdü. Ders: "testler yeşil + tsc temiz"
  // CI yeşili DEĞİLDİR — lint ayrı bir kapıdır ve yerelde koşulmadıysa ölçülmemiştir.
  const cikti = execFileSync(process.execPath, ['-e', `
    const { spawnSync } = require('node:child_process')
    const r = spawnSync(process.execPath, [${JSON.stringify(KANCA)}], {
      input: JSON.stringify({ session_id: ${JSON.stringify(sid)} }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: ${JSON.stringify(pano)}, ...${JSON.stringify(env)} },
    })
    process.stdout.write(String(r.stderr || ''))
  `], { encoding: 'utf8' })
  return cikti
}

describe('INV-DEFTER-BAYATLIK: defter yaşı ÖLÇÜLÜR, eşitleme TETİKLENMEZ', () => {
  it('kanca dosyası VAR', () => {
    expect(fs.existsSync(KANCA)).toBe(true)
  })

  it('⛔EŞİTLEME YAPMAZ: kaynakta `esitle` fiilinin ÇAĞRILDIĞI yer yok', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    // `esitle` kelimesi metinde GEÇER (kullanıcıya komutu söyler) — yasak olan onu KOŞTURMAK.
    // Bu yüzden çalıştırma çağrılarının argümanlarına bakılır, çıplak kelimeye değil.
    // `s` bayrağı YOK ve gerekmiyor: `[^)]*` zaten satır sonlarını da yutar (nokta kullanılmıyor).
    // TS hedefi es2017 olduğu için `s` bayrağı TS1501 veriyordu — testler yeşilken tsc kırmızıydı,
    // yani "testler geçiyor" yine tip güvenliği kanıtı değildi (bugün ikinci kez).
    const kosturmalar = kaynak.match(/execFileSync\([^)]*\)/g) ?? []
    const esitleKosan = kosturmalar.filter((k) => /['"]esitle['"]/.test(k))
    expect(
      esitleKosan,
      'kanca eşitlemeyi KOŞTURUYOR — dış servise (NotebookLM) insan onayı olmadan yazma; OPS hükmü 2026-09-07 ihlali',
    ).toEqual([])
    // Salt-okuma fiili `olc` serbest.
    expect(kaynak, 'ölçüm fiili de yok — kanca hiçbir şey ölçmüyor olabilir').toMatch(/['"]olc['"]/)
  })

  it('TAZE DEFTER → SESSİZ (gürültü yapmaz)', () => {
    // Eşitleme 1 saat önce inmiş, eşik 6 saat: kanca susmalı. Yaş FİKSTÜRDEN gelir,
    // bu makinenin gerçek deposundan değil.
    const c = stderrOku({ VENTHUB_REPO: sahteDepo(saatOnce(1)), VENTHUB_DEFTER_ESIK_SAAT: '6' }, 'cccccccc-1111-4111-8111-111111111111')
    expect(c.trim(), 'taze defterde öttü — her turda öten uyarı üç günde görmezden gelinir').toBe('')
  })

  it('BAYAT DEFTER → UYARIR ve ÖLÇÜTÜNÜ SÖYLER', () => {
    // Eşitleme 20 saat önce, eşik 6 saat: uyarmalı ve yaşı doğru saymalı.
    const c = stderrOku({ VENTHUB_REPO: sahteDepo(saatOnce(20)), VENTHUB_DEFTER_ESIK_SAAT: '6' }, 'dddddddd-1111-4111-8111-111111111111')
    expect(c, 'yaş 20 saat olarak yazılmadı — sayı fikstürden gelmiyor olabilir').toMatch(/(19|20|21) saat once/)
    expect(c, 'bayatlık uyarısı çıkmadı').toContain('DEFTER BAYAT')
    // ⭐Ölçüt yazılı olmalı: okuyan "bu sayı nereden" diye sormasın ve doğrulayabilsin.
    expect(c, 'ölçütü söylenmemiş — sayı kaynaksız kalır').toContain('git log origin/master')
    expect(c, 'eşitlemeyi kimin tetikleyeceği yazılmamış').toMatch(/ESITLEMEYI BU KANCA YAPMAZ/)
  })

  it('ÖLÇEMEDİĞİNDE SESSİZ KALMAZ: "ölçemedim" ≠ "taze"', () => {
    // Var olmayan depo yolu — platformdan bağımsız olsun diye tmp altında UYDURMA bir ad.
    const yokDepo = path.join(os.tmpdir(), 'inv-bayat-boyle-bir-depo-yok')
    const c = stderrOku({ VENTHUB_REPO: yokDepo, VENTHUB_DEFTER_ESIK_SAAT: '0' }, 'eeeeeeee-1111-4111-8111-111111111111')
    expect(c, 'ölçüm başarısızken sessiz kaldı — bayatlık "yok" gösterilir').toContain('OLCULEMEDI')
    expect(c).toMatch(/AYNI SEY DEGIL/)
  })

  it('SOĞUMA: aynı oturumda arka arkaya iki kez ötmez', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-soguma-'))
    const depo = sahteDepo(saatOnce(20))
    const sid = 'ffffffff-1111-4111-8111-111111111111'
    const calistir = () => {
      const r = spawnSync(process.execPath, [KANCA], {
        input: JSON.stringify({ session_id: sid }),
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_BOARD_DIR: pano, VENTHUB_REPO: depo, VENTHUB_DEFTER_ESIK_SAAT: '6' },
      })
      return String(r.stderr || '')
    }
    expect(calistir(), 'ilk uyarı çıkmadı').toContain('DEFTER BAYAT')
    expect(calistir().trim(), 'ikinci kez de öttü — soğuma penceresi çalışmıyor').toBe('')
  })

  it('TURU BLOKLAMAZ: daima çıkış 0', () => {
    // execFileSync sıfırdan farklı çıkışta fırlatır; buraya gelmek kanıttır.
    expect(() => kostur({ VENTHUB_DEFTER_ESIK_SAAT: '0' }, 'aaaaaaa0-1111-4111-8111-111111111111')).not.toThrow()
    void hata
  })
})
