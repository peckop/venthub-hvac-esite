import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-AKSIYON-SHA-1 · Dış GitHub aksiyonu etiketle değil SHA ile sabitlenir.
 *
 * Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` §12.
 *
 * NİÇİN VAR: etiket (`@v4`) taşınabilir bir işaretçidir; aksiyon deposu ele geçirilirse iş akışımız
 * kötü commit'i sessizce koşar ve repo PUBLIC olduğu için sırlar herkese açık loga düşer.
 * 2026-09-22 ölçümü: 55 `uses:` satırının 0'ı SHA'lıydı. tsc/lint/build bunu görmez.
 */

const KOK = path.resolve(__dirname, '../../..')
const DIZIN = path.join(KOK, '.github', 'workflows')

/** Kurala uyan biçim: `sahip/ad[/alt]@<40 hex> # vX[.Y[.Z]]` */
const SHA_PINLI = /^[\w.-]+\/[\w.\/-]+@[0-9a-f]{40}\s+#\s*v\d+(\.\d+){0,2}\s*$/

/** Bir YAML metnindeki kural dışı dış `uses:` değerlerini döndürür. */
export function pinsizler(yaml: string): string[] {
  const sonuc: string[] = []
  for (const satir of yaml.split(/\r?\n/)) {
    const m = satir.match(/^\s*-?\s*uses:\s*(.+?)\s*$/)
    if (!m) continue
    const deger = m[1].replace(/^['"]|['"]$/g, '')
    if (deger.startsWith('./') || deger.startsWith('docker://')) continue
    if (!SHA_PINLI.test(deger)) sonuc.push(deger)
  }
  return sonuc
}

const dosyalar = fs.readdirSync(DIZIN).filter((f) => /\.ya?ml$/.test(f))

describe('INV-AKSIYON-SHA-1: dış aksiyonlar SHA + sürüm yorumuyla sabitli', () => {
  it('iş akışı dizini boş değil ve en az bir dış aksiyon var (kör yeşil değil)', () => {
    const toplam = dosyalar.reduce((n, f) => n + (fs.readFileSync(path.join(DIZIN, f), 'utf8').match(/^\s*-?\s*uses:\s*[^.\s]/gm)?.length ?? 0), 0)
    expect(dosyalar.length).toBeGreaterThan(10)
    expect(toplam).toBeGreaterThan(40)
  })

  it('hiçbir iş akışında etiketli ya da yorumsuz dış aksiyon yok', () => {
    const ihlal = dosyalar.flatMap((f) => pinsizler(fs.readFileSync(path.join(DIZIN, f), 'utf8')).map((d) => `${f}: ${d}`))
    expect(ihlal, `SHA'sız dış aksiyon — §12 biçimi: sahip/ad@<40 hex> # vX.Y.Z`).toEqual([])
  })

  it('SABOTAJ: etiket, dal, kısa SHA ve yorumsuz SHA yakalanır; yerel ve doğru biçim geçer', () => {
    const yaml = [
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - uses: pnpm/action-setup@master',
      '      - uses: supabase/setup-cli@ab05898',
      '      - uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830',
      "      - uses: './.github/actions/yerel'",
      '      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0',
      '        uses: github/codeql-action/init@0057852bfaa89a56745cba8c7296529d2fc39830 # v3',
    ].join('\r\n')
    expect(pinsizler(yaml)).toEqual([
      'actions/checkout@v4',
      'pnpm/action-setup@master',
      'supabase/setup-cli@ab05898',
      'actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830',
    ])
  })

  it('Dependabot aksiyon grubu ana sürümü toplamaz (ana sürüm ayrı PR)', () => {
    const cfg = fs.readFileSync(path.join(KOK, '.github', 'dependabot.yml'), 'utf8')
    const blok = cfg.slice(cfg.indexOf('package-ecosystem: github-actions'))
    const grup = blok.slice(blok.indexOf('aksiyonlar:'), blok.indexOf('package-ecosystem', 10))
    expect(grup).toMatch(/update-types:\s*\[\s*minor\s*,\s*patch\s*\]/)
  })
})
