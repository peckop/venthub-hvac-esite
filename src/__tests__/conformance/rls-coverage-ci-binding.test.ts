import fs from 'node:fs'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

/**
 * INV-RLS-COVERAGE-CI-1 — kapı BAĞLI olmalı; var olması yetmez.
 *
 * NİÇİN VAR (ölçülmüş, tahmin değil)
 *
 * `scripts/db/checks/rls-role-coverage.mjs` 2026-08-20'de #712 ile geldi ve doğru çalışıyordu —
 * ama HİÇBİR iş onu çağırmıyordu. Kapı yalnız elle koşuluyordu, yani koşulmadığı her gün YOKTU.
 * Tam olarak o kapının yakaladığı kusur (`client_errors` üzerinde `authenticated` politikasının
 * 2026-06-02'de toplu bir temizlikle düşmesi) iki buçuk ay boyunca kimsenin görmediği bir
 * sessiz-boşluk olarak yaşadı. Bir kapının "var" olması ile "koşuyor" olması AYNI ŞEY DEĞİLDİR;
 * bu dosya ikincisini sabitler.
 *
 * ⚠ DÜRÜSTLÜK NOTU — "bağlı" ile "bloklayan" da aynı şey değil. Bu test işin her PR'da
 * KOŞTUĞUNU sabitler. Kırmızı olduğunda merge'i MEKANİK olarak durdurup durdurmayacağı ayrı bir
 * sorudur ve cevabı dal korumasının zorunlu-bağlam listesindedir (2026-08-20 ölçümü:
 * ["ci","admin-smoke","Vercel"] — ne bu iş ne kardeşi INV-CATALOG-1 o listede). Listeye eklemek
 * depo AYARI değişikliğidir (Recep kapısı) ve bilerek bu işin dışında bırakıldı.
 */
const WF = path.resolve(__dirname, '../../../.github/workflows/db-advisor.yml')
const SCRIPT = 'scripts/db/checks/rls-role-coverage.mjs'

/** Yorumlar SIYRILIR: bir gerekçe metninde geçen ad, bağlanmış iş DEĞİLDİR. */
function yorumsuz(metin: string): string {
  return metin
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

describe('INV-RLS-COVERAGE-CI-1 — RLS rol kapsamı kapısı CI işine bağlı', () => {
  const ham = fs.readFileSync(WF, 'utf8')
  const wf = yorumsuz(ham)

  it('KAPSAM KANARYASI — ayıklayıcı iş yapısını GERÇEKTEN okuyor', () => {
    // "0 ihlal" ile "bakmadım" aynı görünür. Sıyırıcı bozulur da her şeyi silerse aşağıdaki
    // iddialar sessizce anlamsızlaşırdı; bu kanarya ikisini ayırır.
    expect(wf.length, 'yorum sıyırıcı workflow metnini boşalttı').toBeGreaterThan(500)
    expect(wf).toMatch(/^\s*jobs:/m)
    expect(wf).toMatch(/^ {2}catalog-integrity:/m)
  })

  it('iş TANIMLI ve betiği çağırıyor', () => {
    expect(wf).toMatch(/^ {2}rls-role-coverage:/m)
    expect(wf).toContain(`node ${SCRIPT}`)
    expect(fs.existsSync(path.resolve(__dirname, '../../../', SCRIPT)), 'betik yok').toBe(true)
  })

  it('ölçemeyeceği durumda KOŞMAZ — ön-kontrole bağlı', () => {
    const bas = wf.indexOf('  rls-role-coverage:')
    const govde = wf.slice(bas, bas + 900)
    expect(govde).toMatch(/needs:\s*db-gate-precheck/)
    expect(govde).toMatch(/if:\s*needs\.db-gate-precheck\.outputs\.ready == 'true'/)
  })

  it('iş SINIRSIZ değil — asılan iş paylaşılan havuzu yakar', () => {
    const bas = wf.indexOf('  rls-role-coverage:')
    const govde = wf.slice(bas, wf.length)
    expect(govde).toMatch(/timeout-minutes:\s*\d+/)
  })
})
