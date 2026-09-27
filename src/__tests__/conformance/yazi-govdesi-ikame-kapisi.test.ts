// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-GOVDE-IKAME-1 · çift tırnaklı gövdede kabuk ikamesi reddedilir (2026-09-27 ARAÇ olayı).
 *
 * PR gövdesi `node -e "..."` içinde kuruldu; kaçışsız ters tırnaklar bash için komuttu ve
 * reddedilmiş bir kurulum betiği istemeden koştu. OPS hükmü: mekanik kapı + sabotaj sınavı.
 * Ayırt edici çiftler: aynı metin ÇİFT tırnakta RED / TEK tırnakta GEÇER / kaçışlı GEÇER /
 * dosyadan gövde GEÇER / gövde taşımayan komut (ör. `echo`) kapsam dışı.
 */
interface Bulgu {
  ad: string
  konum: number
  parca: string
}
const KANCA = path.resolve(process.cwd(), '.claude', 'hooks')
const { govdeIkameBulgulari } = createRequire(import.meta.url)(path.join(KANCA, 'govde-ikame-kalip.cjs')) as {
  govdeIkameBulgulari: (k: string) => Bulgu[]
}

// Olayın biçimi (kısaltılmış): node -e içinde çift tırnaklı JS, gövdede ters tırnaklı komut adları.
const OLAY =
  'node -e "const k=require(\'fs\').readFileSync(\'x.md\',\'utf8\'); k.replace(/a/, `2. YALNIZ ARAÇ açılır → `node tools/wrongstack-mcp/kurulum.cjs`.`)"'

function kapi(komut: string) {
  return spawnSync(process.execPath, [path.join(KANCA, 'bash-write-guard.cjs')], {
    input: JSON.stringify({ session_id: 'test-sid', tool_name: 'Bash', tool_input: { command: komut } }),
    encoding: 'utf8',
    timeout: 20_000,
  })
}

describe('INV-GOVDE-IKAME-1 · gövde içinde kabuk ikamesi', () => {
  it('SABOTAJ: olayın aynısı (node -e çift tırnak + ters tırnak) → bulgu VAR, kapı çıkış 2', () => {
    expect(govdeIkameBulgulari(OLAY).length).toBeGreaterThan(0)
    const r = kapi(OLAY)
    expect(r.status).toBe(2)
    expect(r.stderr).toContain('CIFT TIRNAKLI GOVDEDE KABUK IKAMESI')
    expect(r.stderr).toContain('--body-file')
  })

  it('gh pr create --body "... `x` ..." RED; --body-file GEÇER', () => {
    expect(govdeIkameBulgulari('gh pr create --title "t" --body "adım: `npm ci` koş"').map((b) => b.ad)).toEqual(['ters tirnak', 'ters tirnak'])
    expect(govdeIkameBulgulari('gh pr create --title "t" --body-file govde.md')).toEqual([])
    expect(govdeIkameBulgulari('gh api -X PATCH repos/o/r/pulls/1 -F body=@govde.md')).toEqual([])
  })

  it('$( çift tırnakta RED; tek tırnakta GEÇER; kaçışlı \\` GEÇER', () => {
    expect(govdeIkameBulgulari('gh issue comment 5 --body "sonuc $(cat x)"').map((b) => b.ad)).toEqual(['komut ikamesi $('])
    expect(govdeIkameBulgulari("gh issue comment 5 --body 'sonuc $(cat x) ve `y`'")).toEqual([])
    expect(govdeIkameBulgulari('node -e "console.log(\\`guvenli\\`)"')).toEqual([])
  })

  it('iç içe tırnak: çift tırnak içindeki tek tırnak ikameyi DURDURMAZ (bash çift tırnakta tek tırnağı düz sayar)', () => {
    expect(govdeIkameBulgulari('python -c "print(\'`id`\')"').map((b) => b.ad)).toEqual(['ters tirnak', 'ters tirnak'])
  })

  it('YANLIŞ POZİTİF (09-27 canlı): tetik yalnız kendi parçasını tarar; sonraki komuttaki meşru $( geçer', () => {
    const canli =
      'PORT=$(node -p "require(\'x.json\').PORT"); for u in /a /b; do echo "$u: $(curl -s http://127.0.0.1:$PORT$u)"; done'
    expect(govdeIkameBulgulari(canli)).toEqual([])
    // ama aynı zincirde SONRAKİ komut tetikse ve kendi gövdesinde ikame varsa yine yakalanır
    expect(govdeIkameBulgulari('echo "$(date)"; gh pr comment 1 --body "`x`"').map((b) => b.ad)).toEqual(['ters tirnak', 'ters tirnak'])
    // tetik parçası && ile biter
    expect(govdeIkameBulgulari('node -e "1" && echo "$(date)"')).toEqual([])
  })

  it('gövde taşımayan komut kapsam dışı; kapı bu sınıftan reddetmez', () => {
    expect(govdeIkameBulgulari('echo "`date`"')).toEqual([])
    expect(govdeIkameBulgulari('git log --format="%H $(x)"')).toEqual([])
    const r = kapi('gh pr view 1 --json state')
    expect(r.stderr).not.toContain('KABUK IKAMESI')
  })
})
