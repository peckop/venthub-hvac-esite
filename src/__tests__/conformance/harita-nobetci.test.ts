/**
 * INV-HARITA-NOBETCI-1 · test haritası nöbetçisi iş akışı (ALT-209, OPS-345 onayı 20 Kasım 2026)
 *
 * NİÇİN: harita 6 kez çürüyüp master'ı kırmızıya çevirdi; haftalık nöbetçi eşik ölçüsüyle uyarı verir. Nöbetçinin kendisi
 * sessizce bozulursa (tetik düşer, eşik gevşer, kart çoğalır, ölçüm okunamayınca yeşil kalır) uyarı da susar; bu test o
 * dört yolu kilitler. İş akışı BLOKLAMAZ: pull_request tetiği yoktur (zorunlu çekirdeğe girmez, ALTYAPI kural 3).
 *
 * SABOTAJ (aşağıda her kural için "bozulmuş metin" üretilir ve kural düşmeli): tetik pull_request'e çevrilir, eşik 190'a
 * çıkarılır, tekrar-açma denetimi (gh issue list) silinir, fail-closed çıkışı silinir, izin genişletilir, aksiyon sabitlenmez.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const YOL = resolve(__dirname, '..', '..', '..', '.github', 'workflows', 'harita-nobetci.yml')
const KAPI_ESIGI = 190

const kaynak = (): string => readFileSync(YOL, 'utf8').replace(/\r\n/g, '\n')

/** Yorum satırları çıkarılır: kural yorumdaki söze değil çalışan metne bakar. */
const calisan = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

function ihlaller(metin: string): string[] {
  const m = calisan(metin)
  const ihlal: string[] = []
  if (!/^\s{2}schedule:\s*\n\s+- cron: '[^']+'/m.test(m)) ihlal.push('tetik: haftalık schedule yok')
  if (/pull_request|push:|deployment_status/.test(m)) ihlal.push('tetik: pull_request/push/deployment_status olmamalı (bloklamaz)')
  if (!/workflow_dispatch:/.test(m)) ihlal.push('tetik: elle tetik (workflow_dispatch) yok')
  if (!/permissions:\s*\n\s+contents: read\s*\n\s+issues: write\s*\n/.test(m)) ihlal.push('izin: yalnız contents: read + issues: write')
  if (/(contents|pull-requests|actions|checks|statuses|deployments|packages): write/.test(m)) ihlal.push('izin: issues dışında yazma izni var')
  const esik = /UYARI_ESIGI: '(\d+)'/.exec(m)
  if (!esik) ihlal.push('eşik: UYARI_ESIGI yok')
  else if (Number(esik[1]) >= KAPI_ESIGI) ihlal.push(`eşik: uyarı eşiği (${esik[1]}) kapı eşiğinin (${KAPI_ESIGI}) altında olmalı`)
  if (!/gh issue list --label "\$ETIKET" --state open/.test(m)) ihlal.push('tek kart: açık issue aranmıyor (her koşuda yeni kart açılır)')
  if (!/gh issue comment/.test(m)) ihlal.push('tek kart: mevcut issue güncellenmiyor')
  if (!/exit 1/.test(m) || !/okunamadı \(fail-closed\)/.test(m)) ihlal.push('fail-closed: ölçüm okunamayınca iş kırmızı olmuyor')
  if (/secrets\./.test(m) || /self-hosted/.test(m)) ihlal.push('sır/self-hosted yazılmaz (herkese açık depo)')
  for (const kullanim of m.matchAll(/uses:\s*(\S+)/g)) {
    if (!/@[0-9a-f]{40}$/.test(kullanim[1])) ihlal.push(`aksiyon sabit commit değil: ${kullanim[1]}`)
  }
  if (!/node scripts\/ci\/test-haritasi-uret\.cjs --kontrol/.test(m)) ihlal.push('ölçüm: test-haritasi-uret --kontrol çağrılmıyor')
  if (/test-haritasi-uret\.cjs --bayat/.test(m.replace(/GOVDE=.*\n/g, ''))) ihlal.push('nöbetçi haritayı TAZELEMEZ (yalnız uyarır)')
  return ihlal
}

describe('INV-HARITA-NOBETCI-1 · test haritası nöbetçisi', () => {
  it('gerçek iş akışı tüm kuralları sağlar', () => {
    expect(ihlaller(kaynak())).toEqual([])
  })

  const SABOTAJ: ReadonlyArray<{ ad: string; eski: string | RegExp; yeni: string; beklenen: RegExp }> = [
    { ad: 'tetik pull_request olur', eski: "  schedule:\n", yeni: '  pull_request:\n  schedule:\n', beklenen: /pull_request/ },
    { ad: 'eşik kapıya eşitlenir', eski: "UYARI_ESIGI: '100'", yeni: "UYARI_ESIGI: '190'", beklenen: /eşik:/ },
    { ad: 'tekrar-açma denetimi silinir', eski: 'gh issue list --label "$ETIKET" --state open', yeni: 'echo yok', beklenen: /tek kart/ },
    { ad: 'fail-closed çıkışı silinir', eski: 'okunamadı (fail-closed)', yeni: 'okunamadi', beklenen: /fail-closed/ },
    { ad: 'izin genişler', eski: '  issues: write\n', yeni: '  issues: write\n  contents: write\n', beklenen: /izin/ },
    { ad: 'aksiyon sabitlenmez', eski: /actions\/checkout@[0-9a-f]{40}/, yeni: 'actions/checkout@v4', beklenen: /sabit commit/ },
    { ad: 'nöbetçi haritayı tazelemeye başlar', eski: 'node scripts/ci/test-haritasi-uret.cjs --kontrol', yeni: 'node scripts/ci/test-haritasi-uret.cjs --kontrol\n          node scripts/ci/test-haritasi-uret.cjs --bayat', beklenen: /TAZELEMEZ/ },
  ]

  for (const s of SABOTAJ) {
    it(`sabotaj: ${s.ad} → kural düşer`, () => {
      const gercek = kaynak()
      const bozuk = gercek.replace(s.eski, s.yeni)
      expect(bozuk).not.toBe(gercek)
      expect(ihlaller(bozuk).join('\n')).toMatch(s.beklenen)
    })
  }
})
