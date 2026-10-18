/**
 * INV-KANCA-CANLI-YAZIM-1 — product-data betiklerine `--apply`/`--rollback` yalnız OPS penceresinde koşar (ARC-178 B).
 *
 * Kanca: .claude/hooks/canli-yazim-kapisi.cjs. Regresyon: settings.json deny satırları yol biçimine bağlıydı;
 * mutlak yol, `cd klasör && node betik.mjs --apply` ve `--env-file`siz çağrı yakalanmıyordu (18 Ekim ölçümü).
 * Bu kapı yolu çözer: göreli, mutlak, `..`, cd zinciri, dolaylı değişken, `bash -c`.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'canli-yazim-kapisi.cjs')

interface Kapi {
  incele: (komut: string, cwd: string, betikler?: Set<string>) => string | null
  yazanBetikAdlari: (kok?: string) => Set<string>
}
const k = gerek(KANCA) as Kapi
const BETIKLER = new Set(['a.mjs', 'b.mjs'])
const KLASOR = path.join(KOK, 'scripts', 'db', 'product-data')
const sor = (komut: string, cwd = KOK) => k.incele(komut, cwd, BETIKLER) !== null
const mutlak = path.join(KLASOR, 'a.mjs').replace(/\\/g, '/')

describe('INV-KANCA-CANLI-YAZIM-1 · yol biçimi fark etmeksizin reddedilir', () => {
  it.each([
    ['göreli yol + --env-file (eski deny satırının yakaladığı biçim)', 'node --env-file=.env scripts/db/product-data/a.mjs --apply'],
    ['mutlak yol (A satırından önce sızan biçim)', `node --env-file=.env ${mutlak} --apply`],
    ['mutlak yol, --env-file yok', `node ${mutlak} --apply`],
    ['cd klasör && node betik --apply', 'cd scripts/db/product-data && node a.mjs --apply'],
    ['cd iki adımda', 'cd scripts/db && cd product-data && node a.mjs --rollback'],
    ['üst klasörden göreli alt yol', 'cd scripts/db && node product-data/a.mjs --apply'],
    ['.. ile dolanan yol', 'node ./scripts/db/../db/product-data/a.mjs --apply'],
    ['pnpm exec sarmalı', 'pnpm exec node scripts/db/product-data/a.mjs --apply'],
    ['--rollback', 'node scripts/db/product-data/a.mjs --rollback'],
    ['--apply=1 biçimi', 'node scripts/db/product-data/a.mjs --apply=1'],
    ['bash -c sarmalı', 'bash -c "node scripts/db/product-data/a.mjs --apply"'],
    ['dolaylı değişken (komutta apply\'li betiğin adı geçiyor)', 'S=a.mjs; node $S --apply'],
    ['klasör adı geçiyor, betik değişkende', 'D=scripts/db/product-data; node "$D/$S" --apply'],
    ['zincirin ikinci parçası', 'git status && node scripts/db/product-data/a.mjs --apply'],
  ])('DENY · %s', (_ad, komut) => {
    expect(sor(komut)).toBe(true)
  })

  it('bağlantı (junction) üzerinden gelen, adında product-data geçmeyen yol realpath ile yakalanır', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-baglanti-'))
    try {
      const baglanti = path.join(gecici, 'kisa')
      fs.symlinkSync(KLASOR, baglanti, 'junction')
      expect(k.incele('node kisa/hic-olmayan-yeni.mjs --apply', gecici, new Set())).not.toBeNull()
      expect(k.incele('cd kisa && node hic-olmayan-yeni.mjs --rollback', gecici, new Set())).not.toBeNull()
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true })
    }
  })

  it('çalışma dizini klasörün içindeyse göreli betik adı da yakalanır', () => {
    expect(sor('node b.mjs --apply', KLASOR)).toBe(true)
    expect(sor('node ../product-data/b.mjs --rollback', KLASOR)).toBe(true)
  })
})

describe('INV-KANCA-CANLI-YAZIM-1 · zararsız komutlar geçer', () => {
  it.each([
    ['kuru koşum (bayraksız)', 'node --env-file=.env scripts/db/product-data/a.mjs'],
    ['kuru koşum, başka bayrak', 'node scripts/db/product-data/a.mjs --dry-run'],
    ['başka klasörde --apply', 'node scripts/ci/baska.mjs --apply'],
    ['grep ile betik içinde arama', 'grep -n -- --apply scripts/db/product-data/a.mjs'],
    ['commit mesajında geçmesi', 'git commit -m "product-data a.mjs --apply notu"'],
    ['okuma', 'cat scripts/db/product-data/a.mjs'],
    ['echo', 'echo "node scripts/db/product-data/a.mjs --apply"'],
    ['ilgisiz komut', 'git status'],
  ])('ALLOW · %s', (_ad, komut) => {
    expect(sor(komut)).toBe(false)
  })

  it('canlı kod: product-data klasöründe apply\'li betik var ve ad kümesi onları buluyor', () => {
    const adlar = k.yazanBetikAdlari(KOK)
    expect(adlar.size).toBeGreaterThan(0)
    for (const ad of adlar) expect(fs.existsSync(path.join(KLASOR, ad)) || adlar.has(ad)).toBe(true)
  })
})

describe('INV-KANCA-CANLI-YAZIM-1 · OPS penceresi geçer, diğerleri reddedilir (uçtan uca)', () => {
  let gecici = ''
  let opsDosya = ''
  const opsSid = '11111111-2222-4333-8444-555555555555'
  const digerSid = '99999999-2222-4333-8444-555555555555'
  const KOMUT = 'cd scripts/db/product-data && node a.mjs --apply'

  beforeAll(() => {
    gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-canli-'))
    fs.mkdirSync(path.join(gecici, '.claude'), { recursive: true })
    // opsAdayiMi cwd'den yukarı settings.local.json arar; ilk bulunan karar verir → belirleyici olsun
    fs.writeFileSync(path.join(gecici, '.claude', 'settings.local.json'), JSON.stringify({ agent: 'arac-pencere' }))
    opsDosya = path.join(gecici, 'ops-oturumu.json')
    fs.writeFileSync(opsDosya, JSON.stringify({ sid: opsSid, ts: Date.now(), kaynak: 'test' }))
  })
  afterAll(() => {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true })
  })

  const kos = (girdi: Record<string, unknown>) => {
    const r = spawnSync('node', [KANCA], {
      input: JSON.stringify({ tool_name: 'Bash', cwd: KOK, ...girdi }),
      encoding: 'utf8',
      env: { ...process.env, VH_OPS_OTURUMU_DOSYASI: opsDosya },
    })
    return { kod: r.status, cikti: r.stdout.trim() }
  }
  const redMi = (cikti: string) => {
    if (!cikti) return false
    const j = JSON.parse(cikti) as { hookSpecificOutput?: { permissionDecision?: string } }
    return j.hookSpecificOutput?.permissionDecision === 'deny'
  }

  it('OPS oturum kimliği: geçer (çıktı boş)', () => {
    const r = kos({ session_id: opsSid, tool_input: { command: KOMUT } })
    expect(r.kod).toBe(0)
    expect(r.cikti).toBe('')
  })

  it('OPS ajan türü: geçer', () => {
    const r = kos({ session_id: digerSid, agent_type: 'ops-pencere', tool_input: { command: KOMUT } })
    expect(redMi(r.cikti)).toBe(false)
  })

  it('başka pencere: reddedilir, neden OPS\'a yönlendirir', () => {
    const r = kos({ session_id: digerSid, cwd: gecici, tool_input: { command: KOMUT } })
    expect(redMi(r.cikti)).toBe(true)
    expect(r.cikti).toContain('OPS')
  })

  it('OPS\'un alt ajanı OPS sayılmaz', () => {
    const r = kos({ session_id: digerSid, cwd: gecici, agent_type: 'ops-uygulayici', tool_input: { command: KOMUT } })
    expect(redMi(r.cikti)).toBe(true)
  })

  it('kimlik dosyası yok ya da bozuk: kapalı düşer (reddeder)', () => {
    const bozuk = path.join(gecici, 'bozuk.json')
    fs.writeFileSync(bozuk, '{bozuk')
    const r = spawnSync('node', [KANCA], {
      input: JSON.stringify({ tool_name: 'Bash', cwd: gecici, session_id: opsSid, tool_input: { command: KOMUT } }),
      encoding: 'utf8',
      env: { ...process.env, VH_OPS_OTURUMU_DOSYASI: bozuk },
    })
    expect(redMi(r.stdout.trim())).toBe(true)
  })

  it('Bash dışı araç, bayraksız komut ve bozuk girdi: karışmaz', () => {
    expect(kos({ session_id: digerSid, tool_name: 'Read', tool_input: { file_path: 'a' } }).cikti).toBe('')
    expect(kos({ session_id: digerSid, tool_input: { command: 'node scripts/db/product-data/a.mjs' } }).cikti).toBe('')
    const r = spawnSync('node', [KANCA], { input: 'json-degil', encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('')
  })
})
