import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEP-DENETIM-1 · Karar 52'nin düzeneği sessizce sökülemez.
 *
 * Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` §11.
 *
 * NİÇİN VAR: karar 52 sürüm takibinin tetiğini bizim hafızamızdan alıp GitHub'a verdi
 * (Dependabot + CI denetimi). Bu dosya o devrin GERİ ALINMADIĞINI ölçer: yapılandırma
 * dosyası silinirse, tavan yükseltilirse, React/3D grubu dağıtılırsa, denetim betiği
 * körleşirse — hiçbiri tsc/lint/build'e görünmez.
 *
 * ⭐BETİK SAHTE GİRDİYLE DEĞİL GERÇEK KOŞUMLA sınanır: kol betiği alt süreç olarak çalıştırır
 * ve ÇIKIŞ KODUNU ölçer. Yeşil bir kapı ihlali gördüğünü kanıtlamaz; ayırt edicilik burada.
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')
const BETIK = path.join(KOK, 'scripts', 'hijyen', 'bagimlilik-denetimi.cjs')
const KAYIT = 'docs/standards/bagimlilik-kararlari.md'

/**
 * §7 kabul listesi DONDURULDU (2026-09-21, 11 satır — hepsi `@sentry/nextjs` zinciri).
 * Yalnız AZALABİLİR: Sentry işi (karar 17) inince sıfıra iner. Yeni bir kabul, bu sayıyı
 * bilerek artıran ayrı bir karardır; sessizce büyüyen bastırma listesi, bastırılmamış
 * açıktan beterdir.
 *
 * 11 → 8 (2026-09-21): bot'un güvenlik PR'ı (#1285) brace-expansion'ı 5.0.12'ye çekip üç kaydı
 * kapattı; kapı aynı PR'da "BAYAT KABUL" dedi ve üç satır silindi. Tavan ilk kez SIKIŞTI.
 * 8 → 6 (2026-09-22): `kucuk-ve-yama` grubu (#1315) browserslist'in iki kaydını kapattı; aynı yol.
 */
const KABUL_TAVANI = 6

function kostur(args: string[]): { kod: number; cikti: string } {
  try {
    const cikti = execFileSync(process.execPath, [BETIK, ...args], { encoding: 'utf8', stdio: 'pipe' })
    return { kod: 0, cikti }
  } catch (e) {
    const err = e as { status?: number; stdout?: string }
    return { kod: err.status ?? -1, cikti: err.stdout ?? '' }
  }
}

function sahteAudit(idler: string[]): string {
  const advisories: Record<string, unknown> = {}
  idler.forEach((id, i) => {
    advisories[String(i + 1)] = {
      github_advisory_id: id,
      severity: 'high',
      module_name: 'ornek',
      vulnerable_versions: '<1.0.0',
      title: 'ornek kayit',
    }
  })
  return JSON.stringify({ advisories })
}

function sahteKayit(idler: string[]): string {
  return [
    '## 7 · KABUL',
    '| GHSA | paket | önem | kabul | gerekçe | kaldırma şartı |',
    '|---|---|---|---|---|---|',
    ...idler.map((id) => `| \`${id}\` | ornek | high | 2026-09-21 | g | ş |`),
    '## 8 · sonraki',
  ].join('\n')
}

/** §7 satırlarını (GHSA kimliği taşıyan) ayrıştırır. */
function kabulSatirlari(): string[][] {
  const bolum = oku(KAYIT).split(/^##\s*7\s*·/m)[1] ?? ''
  const govde = bolum.split(/^##\s/m)[0]
  return govde
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => /^\|\s*`?GHSA-/.test(s))
    .map((s) => s.slice(1, -1).split('|').map((x) => x.trim()))
}

describe('INV-DEP-DENETIM-1 · karar 52 düzeneği', () => {
  it('Dependabot yapılandırması var: npm kökü HAFTALIK, tavan düşük, React/3D ayrı grupta', () => {
    const y = oku('.github/dependabot.yml')
    expect(y).toMatch(/package-ecosystem:\s*npm\s*\n\s*directory:\s*\/\s*\n/)
    expect(y).toMatch(/interval:\s*weekly/)
    // İlk npm bloğunun tavanı — 63 eskiyen paket bir haftada PR selidir.
    const tavan = Number(/open-pull-requests-limit:\s*(\d+)/.exec(y)?.[1])
    expect(tavan, 'npm açık PR tavanı 5\'i geçti — önce akışın taşınabildiği ölçülür').toBeLessThanOrEqual(5)
    expect(tavan).toBeGreaterThan(0)
    // Görsel doğrulama isteyen iki grup DAĞITILMAMALI (URUN şeridi doğrular).
    expect(y, 'react-next grubu yok — React/Next ayrı ve görsel doğrulamalı olmalı').toMatch(/react-next:/)
    expect(y, 'uc-boyut grubu yok — 3D paketleri ayrı ve görsel doğrulamalı olmalı').toMatch(/uc-boyut:/)
    expect(y, 'güvenlik güncellemeleri gruplanmamış').toMatch(/applies-to:\s*security-updates/)
  })

  it('Sentry ana sürüm ertelemesi KALDIRMA ŞARTIYLA yazılı (karar 17)', () => {
    const y = oku('.github/dependabot.yml')
    expect(y).toMatch(/dependency-name:\s*'@sentry\/\*'/)
    expect(y, 'ertelemenin kaldırma şartı yazılmamış — erteleme kalıcılaşır').toMatch(/KALDIRMA ŞARTI/)
  })

  it('CI iş akışı: contents:read, pnpm install YOK, betiği koşar, kilit dosyası + haftalık tetik', () => {
    const w = oku('.github/workflows/bagimlilik-denetimi.yml')
    expect(w, 'public depo: permissions yazıldıysa contents:read ZORUNLU').toMatch(
      /permissions:\s*\n\s*contents:\s*read/,
    )
    expect(w, 'audit kilit dosyasından okur; install hem süre hem postinstall yüzeyi').not.toMatch(
      /^\s*(-\s*)?run:\s*pnpm\s+(install|i)\b/m,
    )
    expect(w).toContain('node scripts/hijyen/bagimlilik-denetimi.cjs')
    expect(w).toMatch(/pnpm-lock\.yaml/)
    // Arada yorum satırları olabilir (iş akışı niçin o dakikanın seçildiğini yazıyor).
    expect(w).toMatch(/schedule:\s*\n(?:\s*#.*\n)*\s*-\s*cron:/)
  })

  it(`§7 kabul listesi: tavan ${KABUL_TAVANI}, her satırın KALDIRMA ŞARTI dolu`, () => {
    const satirlar = kabulSatirlari()
    expect(satirlar.length, '§7 ayrıştırılamadı ya da boşaldı').toBeGreaterThan(0)
    expect(
      satirlar.length,
      `kabul listesi BÜYÜDÜ (${satirlar.length} > ${KABUL_TAVANI}) — yeni kabul ayrı bir karardır`,
    ).toBeLessThanOrEqual(KABUL_TAVANI)
    const sartsiz = satirlar.filter((h) => !h[5] || h[5] === '—').map((h) => h[0])
    expect(sartsiz, `kaldırma şartı yazılmamış kabul: ${sartsiz.join(', ')}`).toEqual([])
  })

  it('§8: KARAR durumundaki her override\'ın kaldırma şartı var', () => {
    const metin = oku(KAYIT)
    // Override'lar pnpm-workspace.yaml'da (2026-09-21); okuma tek noktadan.
    const { overridesOku } = createRequire(import.meta.url)(
      path.join(KOK, 'scripts', 'hijyen', 'pnpm-overrides.cjs'),
    ) as { overridesOku: (k: string) => { overrides: Record<string, string> } }
    const overrideAdlari = new Set(Object.keys(overridesOku(KOK).overrides))
    const b4 = (metin.split(/^##\s*4\s*·/m)[1] ?? '').split(/^##\s/m)[0]
    const kararli = b4
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('|'))
      .map((s) => s.slice(1, -1).split('|').map((x) => x.trim()))
      .filter((h) => h[3] === 'KARAR' && overrideAdlari.has(h[0]))
      .map((h) => h[0])
    expect(kararli.length, 'KARAR durumunda override bulunamadı — ayrıştırma kırık').toBeGreaterThan(0)
    const b8 = (metin.split(/^##\s*8\s*·/m)[1] ?? '').split(/^##\s/m)[0]
    const sartli = new Set(
      b8
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.startsWith('|'))
        .map((s) => s.slice(1).split('|')[0].trim()),
    )
    const eksik = kararli.filter((p) => !sartli.has(p))
    expect(eksik, `kaldırma şartı yazılmamış KARAR override'ı: ${eksik.join(', ')}`).toEqual([])
  })

  it('⭐DENETİM BETİĞİ AYIRT EDER — dört durum, gerçek koşum, çıkış kodu', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bagimlilik-denetimi-'))
    const yaz = (ad: string, icerik: string): string => {
      const p = path.join(tmp, ad)
      fs.writeFileSync(p, icerik)
      return p
    }
    try {
      const A = 'GHSA-aaaa-bbbb-cccc'
      const B = 'GHSA-dddd-eeee-ffff'
      const kayit = yaz('kayit.md', sahteKayit([A, B]))

      // (1) Kabul ve gerçek birebir → 0.
      expect(kostur(['--json', yaz('a1.json', sahteAudit([A, B])), '--kayit', kayit]).kod).toBe(0)

      // (2) Kabul edilmemiş YENİ kayıt → 1.
      const yeni = kostur(['--json', yaz('a2.json', sahteAudit([A, B, 'GHSA-1111-2222-3333'])), '--kayit', kayit])
      expect(yeni.kod).toBe(1)
      expect(yeni.cikti).toContain('GHSA-1111-2222-3333')

      // (3) Kapanmış kaydın kabulü listede kalmış (BAYAT) → 1.
      const bayat = kostur(['--json', yaz('a3.json', sahteAudit([A])), '--kayit', kayit])
      expect(bayat.kod).toBe(1)
      expect(bayat.cikti).toContain(B)

      // (4) Ölçülemedi (ağ hatası metni) → 2, TEMİZ SAYILMAZ.
      const bozuk = kostur(['--json', yaz('a4.json', 'npm ERR! network'), '--kayit', kayit])
      expect(bozuk.kod).toBe(2)
      expect(bozuk.cikti).toContain('ÖLÇÜLEMEDİ')
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})
