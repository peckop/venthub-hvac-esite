// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SIPARIS-MONOTON-PG-2 · `siparis-tetik-pg.yml` tetik testini GERÇEKTEN zorunlu kipte koşturuyor mu (OPS-221).
 *
 * NİÇİN VAR: `siparis-monoton-tetik-pg.test.ts` adres yokken kendini ATLAR. İş akışı sessizce bozulursa (zorunlu
 * bayrak düşer, servis silinir, yol süzgecinden migration dizini çıkar) normal paket yeşil kalır ve karne P1
 * kilit (c) hiçbir yerde koşmaz. Bu kapı iş akışının beş bağını metinden ölçer; sabotaj kolu her bağ
 * koparıldığında kapının KIRMIZI verdiğini gösterir.
 */

const KOK = path.resolve(__dirname, '../../..')
const YOL = path.join(KOK, '.github/workflows/siparis-tetik-pg.yml')
const TEST = 'src/__tests__/conformance/siparis-monoton-tetik-pg.test.ts'

function ihlaller(yml: string): string[] {
  const out: string[] = []
  if (!/^\s+image:\s*postgres:\d+/m.test(yml)) out.push('postgres servisi yok')
  if (!/VENTHUB_TEST_PG_ZORUNLU:\s*'1'/.test(yml)) out.push("VENTHUB_TEST_PG_ZORUNLU: '1' yok")
  if (!/VENTHUB_TEST_PG_URL:\s*postgres:\/\/\S+/.test(yml)) out.push('VENTHUB_TEST_PG_URL yok')
  if (!new RegExp(`vitest run ${TEST.replace(/[.]/g, '\\.')}`).test(yml)) out.push('test dosyasi kosturulmuyor')
  const pr = /pull_request:\s*\n\s+paths:\s*\n((?:\s+- .*\n)+)/.exec(yml)?.[1] ?? ''
  if (!pr.includes("'supabase/migrations/**'")) out.push('pull_request yol suzgecinde migration dizini yok')
  if (!pr.includes(`'${TEST}'`)) out.push('pull_request yol suzgecinde test dosyasi yok')
  if (!/^permissions:\s*\n\s+contents:\s*read/m.test(yml)) out.push('permissions/contents: read yok')
  return out
}

const YML = fs.readFileSync(YOL, 'utf8').replace(/\r/g, '')

describe('INV-SIPARIS-MONOTON-PG-2 · iş akışı bağları', () => {
  it('temiz iş akışında ihlal yok', () => {
    expect(ihlaller(YML)).toEqual([])
  })

  const SABOTAJLAR: [string, (s: string) => string][] = [
    ['zorunlu bayrak düşer', (s) => s.replace("VENTHUB_TEST_PG_ZORUNLU: '1'", "VENTHUB_TEST_PG_ZORUNLU: '0'")],
    ['servis silinir', (s) => s.replace(/image:\s*postgres:16/, 'image: busybox')],
    ['adres silinir', (s) => s.replace(/VENTHUB_TEST_PG_URL:.*\n/, '')],
    ['başka test koşar', (s) => s.replace(`vitest run ${TEST}`, 'vitest run src/__tests__/conformance/baska.test.ts')],
    ['migration yolu süzgeçten çıkar', (s) => s.replace("pull_request:\n    paths:\n      - 'supabase/migrations/**'\n", 'pull_request:\n    paths:\n')],
    ['izin bloğu silinir', (s) => s.replace(/^permissions:\s*\n\s+contents:\s*read\n/m, '')],
  ]
  for (const [ad, boz] of SABOTAJLAR) {
    it(`SABOTAJ: ${ad} → kırmızı`, () => {
      const bozuk = boz(YML)
      expect(bozuk, 'sabotaj metni degistirmedi (desen eskidi)').not.toBe(YML)
      expect(ihlaller(bozuk).length).toBeGreaterThan(0)
    })
  }
})
