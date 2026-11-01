/**
 * INV-WEBHOOK-YANIT-1 düzeneği (ALT-121) — nöbetçinin kararını ve bağlandığı yeri korur.
 *
 * Nöbetçi DB'ye bağlanır, bu paket DB'siz koşar. Ölçülen: (1) karar fonksiyonu eşiği doğru uyguluyor mu
 * (sabotaj: imza bozuk gibi tüm yanıtlar 401 iken KIRMIZI, tek bayat yanıtta yalnız UYARI), (2) env yokken
 * fail-closed mı (davranış), (3) kardeşleri gibi `rls-role-coverage` işinde mi, `advisor` (continue-on-error)
 * işinde DEĞİL.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const BETIK = 'scripts/db/checks/webhook-yanit-nobetcisi.mjs'
const WF = '.github/workflows/db-advisor.yml'

interface Yanit {
  status_code: number | null
  timed_out?: boolean
  hata?: boolean
}
interface Ozet {
  toplam: number
  bayat401: number
  basarisiz: number
  kirmizi: boolean
  uyari: boolean
}
type Degerlendir = (s: Yanit[]) => Ozet

async function degerlendirYukle(): Promise<{
  degerlendir: Degerlendir
  KIRMIZI_ASGARI: number
}> {
  return (await import(pathToFileURL(path.join(KOK, BETIK)).href)) as {
    degerlendir: Degerlendir
    KIRMIZI_ASGARI: number
  }
}

const tekrar = (n: number, y: Yanit): Yanit[] => Array.from({ length: n }, () => ({ ...y }))

/** Satır başı `#` yorumlarını atar. */
const yorumsuz = (m: string): string =>
  m
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

/** Workflow iş bloğunu girintiye göre çıkarır (depoda YAML ayrıştırıcı yok). */
function isBlogu(ham: string, isAdi: string): string | null {
  const satirlar = ham.split('\n')
  const bas = satirlar.findIndex((s) => new RegExp(`^ {2}${isAdi}:\\s*$`).test(s))
  if (bas === -1) return null
  const govde: string[] = []
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (s.trim() === '') {
      govde.push(s)
      continue
    }
    if (s.length - s.trimStart().length <= 2) break
    govde.push(s)
  }
  return govde.join('\n')
}

describe('INV-WEBHOOK-YANIT-1 karar fonksiyonu', () => {
  it('boş pencere: temiz (ne uyarı ne kırmızı)', async () => {
    const { degerlendir } = await degerlendirYukle()
    const o = degerlendir([])
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(false)
  })

  it('tüm yanıtlar 2xx: temiz', async () => {
    const { degerlendir } = await degerlendirYukle()
    const o = degerlendir(tekrar(20, { status_code: 200 }))
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(false)
    expect(o.basarisiz).toBe(0)
  })

  it('SABOTAJ: imza bozulmuş gibi yanıtların hepsi 401 → KIRMIZI', async () => {
    const { degerlendir, KIRMIZI_ASGARI } = await degerlendirYukle()
    const o = degerlendir(tekrar(KIRMIZI_ASGARI, { status_code: 401 }))
    expect(o.kirmizi, 'sistematik 401 kırmızı vermedi: kapı kör').toBe(true)
    expect(o.bayat401).toBe(KIRMIZI_ASGARI)
  })

  it('tek bayat 401 (kalabalık içinde) yalnız UYARI, kırmızı değil', async () => {
    const { degerlendir } = await degerlendirYukle()
    const o = degerlendir([...tekrar(30, { status_code: 200 }), { status_code: 401 }])
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(true)
    expect(o.bayat401).toBe(1)
  })

  it('örneklem asgarinin altında hepsi 401 olsa da kırmızı değil, uyarı (az veriyle alarm yok)', async () => {
    const { degerlendir, KIRMIZI_ASGARI } = await degerlendirYukle()
    const o = degerlendir(tekrar(KIRMIZI_ASGARI - 1, { status_code: 401 }))
    expect(o.kirmizi).toBe(false)
    expect(o.uyari).toBe(true)
  })

  it('zaman aşımı ve hata mesajlı yanıt başarısız sayılır (status_code boş olsa bile)', async () => {
    const { degerlendir } = await degerlendirYukle()
    const o = degerlendir([
      { status_code: null, timed_out: true },
      { status_code: null, hata: true },
      { status_code: 200 },
    ])
    expect(o.basarisiz).toBe(2)
    expect(o.uyari).toBe(true)
  })
})

describe('INV-WEBHOOK-YANIT-1 düzenek', () => {
  it('FAIL-CLOSED: SUPABASE_DB_URL boşken nöbetçi çıkış kodu != 0 (davranış ölçümü)', () => {
    let kod = 0
    try {
      execFileSync(process.execPath, [path.join(KOK, BETIK)], {
        cwd: KOK,
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, SUPABASE_DB_URL: '' },
      })
    } catch (e) {
      kod = (e as { status?: number }).status ?? 1
    }
    expect(kod, 'env yokken nöbetçi YEŞİL döndü — ölçmemek geçmek değildir').not.toBe(0)
  })

  it('nöbetçi rls-role-coverage işinde, advisor (continue-on-error) işinde DEĞİL', () => {
    const ham = fs.readFileSync(path.join(KOK, WF), 'utf8')
    expect(yorumsuz(ham).includes(BETIK), 'nöbetçi hiçbir adımda çağrılmıyor').toBe(true)
    const rls = isBlogu(ham, 'rls-role-coverage')
    const advisor = isBlogu(ham, 'advisor')
    expect(rls, 'rls-role-coverage işi bulunamadı').toBeTruthy()
    expect((rls as string).includes(BETIK), 'nöbetçi rls-role-coverage işinde değil').toBe(true)
    expect((advisor ?? '').includes(BETIK), 'nöbetçi advisor işine konmuş').toBe(false)
    const rlsKod = yorumsuz(rls as string)
    expect(/continue-on-error/.test(rlsKod), 'taşıyıcı işte continue-on-error var').toBe(false)
    expect(/set -Eeuo pipefail/.test(rlsKod), 'pipefail yok').toBe(true)
  })
})
