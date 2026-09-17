// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-VERIFY-STOP-1 — tur sonu test kolu kendi güvencesine ERİŞEBİLİR kalır.
 *
 * NİÇİN VAR (REC-345 Kova C, #1237 incelemesi 2026-09-17): kancaya `vitest related` kolu
 * eklendi ve "120 sn aşılırsa ÖLÇEMEDİM yazar" dendi. Ama kancanın DIŞ zaman aşımı da
 * `.claude/settings.json`'da 120 sn ve vitest'ten önce eslint + tsc koşuyor → vitest uzarsa
 * kanca dışarıdan öldürülür, "ÖLÇEMEDİM" satırı HİÇ basılmaz. Tasarımın kendi güvencesi
 * erişilemezdi; statik bakışta kod doğru görünüyordu.
 *
 * Üç kol:
 *   1. İç sabit dış zaman aşımına EŞİT (biri değişip öteki unutulursa kırmızı).
 *   2. vitest'e sabit süre değil KALAN bütçe verilir; bütçe yetmezse vitest başlatılmaz ve
 *      ÖLÇEMEDİM yazılır.
 *   3. Sayaç oturum başına ayrı dosya (ortak dosya oku-değiştir-yaz ile yarışlıydı).
 */
const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'verify-on-stop.cjs')
const AYAR = path.join(KOK, '.claude', 'settings.json')

const kanca = (): string => fs.readFileSync(KANCA, 'utf8')

type KancaGirdisi = { command?: string; timeout?: number }
type Ayar = { hooks?: Record<string, Array<{ hooks?: KancaGirdisi[] }>> }

describe('INV-VERIFY-STOP-1 · tur sonu test kolu', () => {
  it('ic zaman asimi sabiti settings.json Stop kancasinin timeout degerine ESIT', () => {
    const ayar = JSON.parse(fs.readFileSync(AYAR, 'utf8')) as Ayar
    const girdiler = (ayar.hooks?.Stop ?? []).flatMap((g) => g.hooks ?? [])
    const bu = girdiler.find((h) => (h.command ?? '').includes('verify-on-stop.cjs'))
    expect(bu, 'verify-on-stop Stop kancasi settings.json da bulunamadi — kol OLCEMEDI').toBeDefined()
    expect(typeof bu?.timeout, 'Stop kancasinin timeout alani yok').toBe('number')
    const m = kanca().match(/KANCA_DIS_ZAMAN_ASIMI_MS\s*=\s*([\d_]+)/)
    expect(m, 'KANCA_DIS_ZAMAN_ASIMI_MS sabiti yok').not.toBeNull()
    const ic = Number((m?.[1] ?? '').replace(/_/g, ''))
    expect(ic, 'ic sabit dis timeout ile ayristi — ÖLÇEMEDİM satiri yine erisilemez olur').toBe((bu?.timeout ?? 0) * 1000)
  })

  it('vitest sabit sureyle degil KALAN butceyle kosar, butce yetmezse hic baslamaz', () => {
    const s = kanca()
    const kol = s.slice(s.indexOf("'vitest', 'related'") - 400, s.indexOf("'vitest', 'related'") + 400)
    expect(kol, 'vitest kolu bulunamadi').toContain("'vitest', 'related'")
    expect(kol, 'vitest e kalan butce verilmiyor').toMatch(/timeout:\s*butce\b/)
    expect(kol, 'vitest e sabit sayi zaman asimi verilmis').not.toMatch(/timeout:\s*\d/)
    expect(kol, 'butce esigi yok — vitest her kosulda baslatiliyor').toMatch(/butce\s*>=\s*VITEST_ASGARI_BUTCE_MS/)
    expect(s, 'butce yokken OLCEMEDIM satiri yok').toMatch(/ÖLÇEMEDİM \(bütçe yok/)
    expect(s, 'basim payi dusulmuyor').toMatch(/-\s*BASIM_PAYI_MS/)
  })

  it('sayac oturum basina ayri dosya — ortak dosyaya oku-degistir-yaz YOK', () => {
    const s = kanca()
    expect(s, 'ortak sayac dosyasi geri gelmis').not.toMatch(/\.test-kosum-sayaci\.json/)
    expect(s, 'sayac dosya adi oturum kimligi tasimiyor').toMatch(/\.test-kosum-sayaci-\$\{guvenliSid\}\.json/)
    expect(s, 'oturum kimligi dosya adina temizlenmeden giriyor').toMatch(/guvenliSid\s*=\s*String\(sessionId\)\.replace/)
  })

  it('birden cok uyari TEK systemMessage da birlesir (§28 lambasi kaybolmaz)', () => {
    const s = kanca()
    expect(s).toMatch(/parcalar\.push\(konumUyarisi\)/)
    expect(s).toMatch(/parcalar\.push\(testOzeti\)/)
    expect(s).toMatch(/systemMessage:\s*parcalar\.join/)
  })
})
