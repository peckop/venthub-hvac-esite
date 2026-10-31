import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CANLI-KAPI-AKIS-1 · CANLI KAPI İŞ AKIŞI (.github/workflows/canli-kapi.yml, ARC-216 C kolu, REC-502).
 *
 * İş akışı canlı tarama kapısını (scripts/seo/canli-kapi.mjs) `Dagitim hazir` BAŞARIYLA bitince ve günde bir koşturur. Bozulursa iki yönde
 * sessizce yanlış olur: koşul düşerse düşmüş dağıtımın ESKİ sitesi ölçülür (sahte kırmızı), tetik adı kayarsa kapı hiç koşmaz (sessiz yeşil).
 * Bu yüzden her kural hem gerçek dosyada aranır hem de dosyaya tek tek hata sokulur; her hatalı kopya en az bir ihlal vermelidir.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const IS_AKISI = path.join(KOK, '.github/workflows/canli-kapi.yml')
const DAGITIM = path.join(KOK, '.github/workflows/dagitim-hazir.yml')
const METIN = readFileSync(IS_AKISI, 'utf8').replace(/\r\n/g, '\n')

type MergeRitueli = { workflowCoz: (metin: string) => { tetikli: boolean }; turetCekirdek: (kok: string) => { kapilar: string[] } }

/** Yorumsuz iş akışı metnini denetler; ihlal listesi döner ([] = tamam). */
function incele(metin: string, dagitimAdi: string): string[] {
  const yaml = metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
  const ihlal: string[] = []
  const on = /^on:\n((?:[ \t]+.*\n?|\n)+)/m.exec(yaml)?.[1] ?? ''
  if (!new RegExp(`workflow_run:\\s*\\n\\s+workflows:\\s*\\['${dagitimAdi}'\\]\\s*\\n\\s+types:\\s*\\[completed\\]`).test(on)) ihlal.push(`tetik: workflow_run "${dagitimAdi}" completed değil`)
  if (!/^\s+schedule:\s*\n\s+- cron: '[^']+'/m.test(on)) ihlal.push('tetik: günlük schedule yok')
  if (!/^\s+workflow_dispatch:/m.test(on)) ihlal.push('tetik: elle tetik yok')
  if (/pull_request/.test(on)) ihlal.push('tetik: pull_request var (birleşmeyi bloklar)')
  if (!/^permissions:\n\s+contents: read\n/m.test(yaml)) ihlal.push('izin: contents: read yok')
  if (/:\s*write\b/.test(yaml)) ihlal.push('izin: write izni var')
  if (!/if:\s*github\.event_name != 'workflow_run' \|\| github\.event\.workflow_run\.conclusion == 'success'/.test(yaml)) ihlal.push('koşul: yalnız başarılı dağıtım süzgeci yok')
  if (!/cancel-in-progress: false/.test(yaml)) ihlal.push('eşzamanlılık: çalışan ölçüm iptal edilebiliyor')
  if (!/timeout-minutes: 20\b/.test(yaml)) ihlal.push('süre sınırı: 20 dk yok')
  if (/self-hosted|\bsecrets\.|pnpm\s+(install|i)\b|pnpm\/action-setup/.test(yaml)) ihlal.push('self-hosted/sır/pnpm install var')
  if (!/node scripts\/seo\/canli-kapi\.mjs --taban https:\/\/venthub\.com\.tr --bilinen scripts\/seo\/canli-kapi-bilinen\.json/.test(yaml)) ihlal.push('komut: canli-kapi.mjs canlı taban ve bilinen listesiyle çağrılmıyor')
  const uses = yaml.split('\n').filter((s) => /^\s*-?\s*uses:/.test(s))
  if (uses.length < 2) ihlal.push('aksiyon: checkout + setup-node bekleniyordu')
  for (const s of uses) if (!/@[0-9a-f]{40}\s+#\s*v\d+(\.\d+){0,2}\s*$/.test(s)) ihlal.push(`aksiyon: SHA ile sabit değil (${s.trim()})`)
  return ihlal
}

const dagitimAdi = /^name:\s*(.+)$/m.exec(readFileSync(DAGITIM, 'utf8'))?.[1].trim() ?? ''

describe('INV-CANLI-KAPI-AKIS-1 · gerçek iş akışı dosyası', () => {
  it('tetik adı gerçek "Dagitim hazir" iş akışının adıyla BİREBİR aynı (kayarsa kapı hiç koşmaz)', () => {
    expect(dagitimAdi).toBe('Dagitim hazir')
  })

  it('tüm kurallar tamam (ihlal yok)', () => {
    expect(incele(METIN, dagitimAdi)).toEqual([])
  })

  it('betik ve bilinen listesi var; merge-ritueli türetmesi bu iş akışını zorunlu çekirdeğe KATMAZ', () => {
    expect(existsSync(path.join(KOK, 'scripts/seo/canli-kapi.mjs'))).toBe(true)
    expect(existsSync(path.join(KOK, 'scripts/seo/canli-kapi-bilinen.json'))).toBe(true)
    const M = require_(path.join(KOK, 'scripts/hijyen/merge-ritueli.cjs')) as MergeRitueli
    expect(M.workflowCoz(METIN).tetikli).toBe(false)
    const cekirdek = M.turetCekirdek(KOK)
    expect(cekirdek.kapilar, 'türetme boş: kör yeşil').toContain('ci')
    expect(cekirdek.kapilar.some((k) => /canli/i.test(k))).toBe(false)
  })
})

describe('INV-CANLI-KAPI-AKIS-1 · SABOTAJ: dosyaya konan her tek hata en az bir ihlal verir', () => {
  const SABOTAJLAR: Array<[string, string, string]> = [
    ['tetik adı kaydı', "workflows: ['Dagitim hazir']", "workflows: ['Dagitim-hazir']"],
    ['tetik türü completed değil', 'types: [completed]', 'types: [requested]'],
    ['pull_request eklendi', 'on:\n  workflow_run:', 'on:\n  pull_request:\n  workflow_run:'],
    ['günlük schedule silindi', "    - cron: '7 6 * * *'", ''],
    ['contents: read silindi', 'permissions:\n  contents: read\n', 'permissions: {}\n'],
    ['write izni eklendi', 'permissions:\n  contents: read\n', 'permissions:\n  contents: read\n  actions: write\n'],
    ['başarı koşulu silindi', " || github.event.workflow_run.conclusion == 'success'", " || true"],
    ['çalışan ölçüm iptal edilebilir', 'cancel-in-progress: false', 'cancel-in-progress: true'],
    ['süre sınırı kalktı', 'timeout-minutes: 20', 'timeout-minutes: 360'],
    ['aksiyon etikete sabitlendi', 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1', 'actions/checkout@v7'],
    ['self-hosted runner', 'runs-on: ubuntu-latest', 'runs-on: self-hosted'],
    ['bilinen listesi çıkarıldı', ' --bilinen scripts/seo/canli-kapi-bilinen.json', ''],
  ]

  it.each(SABOTAJLAR)('%s', (_ad, eski, yeni) => {
    expect(METIN.split(eski).length, `sabotaj noktası dosyada TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    const ihlaller = incele(METIN.replace(eski, yeni), dagitimAdi)
    expect(ihlaller.length, `sabotaj HİÇBİR ihlali tetiklemedi: "${_ad}" — bu kural testle korunmuyor`).toBeGreaterThan(0)
  })
})
