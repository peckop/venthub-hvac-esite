/**
 * INV-GH-API-1 — beş kapıyı dolanan `gh api` yazmaları Recep'e sorulur (REC-410 S2).
 *
 * Kanca: .claude/hooks/gh-api-kapisi.cjs · cetvel: docs/standards/izin-kapilari-standard.md §S2.
 * Vakalar bu makinedeki kayıtlardan (09-28 ölçümü: 131 yazma, 105 zararsız geçer, 26 sorulur).
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
interface Kapi {
  karar: (girdi: unknown) => { karar: string; sebep: string } | null
}
const k = gerek(path.join(KOK, '.claude', 'hooks', 'gh-api-kapisi.cjs')) as Kapi
const sor = (command: string) => k.karar({ tool_name: 'Bash', tool_input: { command } })?.karar === 'ask'

describe('INV-GH-API-1', () => {
  it('okumalar ve zararsız yazmalar geçer: GET, PR aç/düzelt, yorum, update-branch, yeniden koşum', () => {
    for (const c of [
      'gh api repos/peckop/venthub-hvac-esite/pulls/1412',
      'gh api repos/o/r/pulls --jq ".[].number"',
      'gh api -X GET repos/o/r/issues -f state=open',
      'gh api -X PATCH repos/o/r/pulls/1412 -f title="yeni başlık"',
      'gh api repos/o/r/issues/1412/comments -f body="not"',
      'gh api -X PUT repos/o/r/pulls/12/update-branch',
      'gh api -X POST repos/o/r/actions/jobs/99/rerun',
      'git status && echo gh-api-degil',
    ]) {
      expect(sor(c), c).toBe(false)
    }
  })

  it('beş kapıyı dolananlar sorulur: merge, dal koruması, contents, git refs, sır, DELETE, depo ayarı, mutation', () => {
    for (const c of [
      'gh api -X PUT repos/o/r/pulls/1373/merge -f merge_method=squash',
      'gh api -X DELETE repos/o/r/branches/master/protection',
      'gh api -X PUT repos/o/r/branches/master/protection --input p.json',
      'gh api -X PUT repos/o/r/contents/.claude/settings.json -f message=x -f content=eA==',
      'gh api -X DELETE repos/o/r/git/refs/heads/feat/x',
      'gh api -X PATCH repos/o/r/git/refs/heads/master -F force=true -f sha=abc',
      'gh api -X PUT repos/o/r/actions/secrets/X -f encrypted_value=abc',
      'gh api -X PATCH repos/o/r -f visibility=private',
      'gh api -X DELETE repos/o/r/issues/comments/5',
      'gh api graphql -f query="mutation { mergePullRequest(input:{}) { clientMutationId } }"',
      'gh pr view 1 && gh api -X PUT repos/o/r/pulls/1/merge',
    ]) {
      expect(sor(c), c).toBe(true)
    }
  })

  it('settings.json Bash kancaları arasında kayıtlı', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const bash = (ayar.hooks.PreToolUse as Array<{ matcher: string; hooks: Array<{ command: string }> }>).filter((g) => g.matcher === 'Bash')
    expect(bash.some((g) => g.hooks.some((h) => h.command.includes('gh-api-kapisi.cjs')))).toBe(true)
  })
})
