// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SIPARIS-MONOTON-PG-2 · `siparis-tetik-pg.yml` gerçek-Postgres testlerini GERÇEKTEN zorunlu kipte koşturuyor mu
 * (OPS-221; ALT-155 ile ikinci test dosyası `yetki-davranis-pg.test.ts` de kapsama girdi).
 *
 * NİÇİN VAR: `siparis-monoton-tetik-pg.test.ts` ve `yetki-davranis-pg.test.ts` adres yokken kendilerini ATLAR. İş akışı
 * sessizce bozulursa (zorunlu bayrak düşer, servis silinir, yol süzgecinden migration dizini çıkar, adımlardan biri
 * silinir ya da `continue-on-error` ile sessizleşir) normal paket yeşil kalır ve karne P1 kilit (c) ile Y4/Y5-b/K5
 * hiçbir yerde koşmaz. Bu kapı iş akışının bağlarını metinden ölçer; sabotaj kolu her bağ koparıldığında kapının
 * KIRMIZI verdiğini gösterir. Her test dosyası İÇİN ayrı ayrı: koşturulan komut ve pull_request/push yol süzgeci.
 */

const KOK = path.resolve(__dirname, '../../..')
const YOL = path.join(KOK, '.github/workflows/siparis-tetik-pg.yml')
const SIPARIS_TEST = 'src/__tests__/conformance/siparis-monoton-tetik-pg.test.ts'
const YETKI_TEST = 'src/__tests__/conformance/yetki-davranis-pg.test.ts'
const TESTLER = [SIPARIS_TEST, YETKI_TEST]

const kacis = (s: string) => s.replace(/[.]/g, '\\.')

/** `on:` altındaki bir olayın (pull_request / push) `paths:` listesi. */
function yolListesi(yml: string, olay: 'pull_request' | 'push'): string {
  const baslik = olay === 'push' ? 'push:\\s*\\n\\s+branches:\\s*\\[[^\\]]*\\]\\s*\\n\\s+paths:' : 'pull_request:\\s*\\n\\s+paths:'
  return new RegExp(`${baslik}\\s*\\n((?:\\s+- .*\\n)+)`).exec(yml)?.[1] ?? ''
}

function ihlaller(yml: string): string[] {
  const out: string[] = []
  if (!/^\s+image:\s*postgres:\d+/m.test(yml)) out.push('postgres servisi yok')
  if (!/VENTHUB_TEST_PG_ZORUNLU:\s*'1'/.test(yml)) out.push("VENTHUB_TEST_PG_ZORUNLU: '1' yok")
  if (!/VENTHUB_TEST_PG_URL:\s*postgres:\/\/\S+/.test(yml)) out.push('VENTHUB_TEST_PG_URL yok')
  const pr = yolListesi(yml, 'pull_request')
  const push = yolListesi(yml, 'push')
  if (!pr.includes("'supabase/migrations/**'")) out.push('pull_request yol suzgecinde migration dizini yok')
  if (!push.includes("'supabase/migrations/**'")) out.push('push yol suzgecinde migration dizini yok')
  for (const t of TESTLER) {
    if (!new RegExp(`vitest run ${kacis(t)}(?:\\s|$)`).test(yml)) out.push(`test dosyasi kosturulmuyor: ${t}`)
    if (!pr.includes(`'${t}'`)) out.push(`pull_request yol suzgecinde test dosyasi yok: ${t}`)
    if (!push.includes(`'${t}'`)) out.push(`push yol suzgecinde test dosyasi yok: ${t}`)
  }
  if (!/^permissions:\s*\n\s+contents:\s*read/m.test(yml)) out.push('permissions/contents: read yok')
  if (/continue-on-error:\s*true/.test(yml)) out.push('continue-on-error: true — kirmizi sessizlesir')
  return out
}

const YML = fs.readFileSync(YOL, 'utf8').replace(/\r/g, '')

describe('INV-SIPARIS-MONOTON-PG-2 · iş akışı bağları', () => {
  it('temiz iş akışında ihlal yok', () => {
    expect(ihlaller(YML)).toEqual([])
  })

  /** [ad, bozucu, beklenen ihlal parçası]: sabotaj YANLIŞ sebepten kırmızı vermesin diye ihlal iletisi de eşleşir. */
  const SABOTAJLAR: [string, (s: string) => string, string][] = [
    ['zorunlu bayrak düşer', (s) => s.replace("VENTHUB_TEST_PG_ZORUNLU: '1'", "VENTHUB_TEST_PG_ZORUNLU: '0'"), "ZORUNLU: '1' yok"],
    ['servis silinir', (s) => s.replace(/image:\s*postgres:16/, 'image: busybox'), 'postgres servisi yok'],
    ['adres silinir', (s) => s.replace(/VENTHUB_TEST_PG_URL:.*\n/, ''), 'VENTHUB_TEST_PG_URL yok'],
    ['sipariş testi yerine başka test koşar', (s) => s.replace(`vitest run ${SIPARIS_TEST}`, 'vitest run src/__tests__/conformance/baska.test.ts'), `test dosyasi kosturulmuyor: ${SIPARIS_TEST}`],
    ['yetki testi yerine başka test koşar', (s) => s.replace(`vitest run ${YETKI_TEST}`, 'vitest run src/__tests__/conformance/baska.test.ts'), `test dosyasi kosturulmuyor: ${YETKI_TEST}`],
    ['yetki testi adımı silinir', (s) => s.replace(/\n      # Ilk adim kirmizi[\s\S]*$/, '\n'), `test dosyasi kosturulmuyor: ${YETKI_TEST}`],
    ['migration yolu pull_request süzgecinden çıkar', (s) => s.replace("pull_request:\n    paths:\n      - 'supabase/migrations/**'\n", 'pull_request:\n    paths:\n'), 'pull_request yol suzgecinde migration dizini yok'],
    ['migration yolu push süzgecinden çıkar', (s) => s.replace("branches: [master]\n    paths:\n      - 'supabase/migrations/**'\n", 'branches: [master]\n    paths:\n'), 'push yol suzgecinde migration dizini yok'],
    ['yetki testi pull_request süzgecinden çıkar', (s) => s.replace(`      - '${YETKI_TEST}'\n`, ''), `pull_request yol suzgecinde test dosyasi yok: ${YETKI_TEST}`],
    ['yetki testi push süzgecinden çıkar', (s) => s.replace(new RegExp(`(push:[\\s\\S]*?)      - '${kacis(YETKI_TEST)}'\\n`), '$1'), `push yol suzgecinde test dosyasi yok: ${YETKI_TEST}`],
    ['izin bloğu silinir', (s) => s.replace(/^permissions:\s*\n\s+contents:\s*read\n/m, ''), 'permissions/contents: read yok'],
    ['yetki adımı sessizleşir', (s) => s.replace('        if: ${{ !cancelled() }}\n', '        continue-on-error: true\n'), 'continue-on-error: true'],
  ]
  for (const [ad, boz, beklenen] of SABOTAJLAR) {
    it(`SABOTAJ: ${ad} → kırmızı`, () => {
      const bozuk = boz(YML)
      expect(bozuk, 'sabotaj metni degistirmedi (desen eskidi)').not.toBe(YML)
      const bulunan = ihlaller(bozuk)
      expect(bulunan.length).toBeGreaterThan(0)
      expect(bulunan.join(' | '), 'sabotaj kirmizi verdi ama BEKLENEN sebepten degil').toContain(beklenen)
    })
  }
})
