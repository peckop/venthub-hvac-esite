/**
 * KATALOG · aile yedekten geri (KTL-62) — saf kurallar + CLI önkoşulları. Gerçek DB'ye çıkmaz.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { geriKarari, yedekDogrula } from '../aile-yedekten-geri-kurallar.mjs'

const BETIK = join(__dirname, '..', 'aile-yedekten-geri.mjs')
const satir = (o: Record<string, unknown> = {}) => ({
  id: 'a1', tenant_id: 't1', slug: 'x', description: { en: 'a' }, is_description_manual: true, updated_at: '2026-10-06T11:46:21Z', ...o,
})
const gecici = mkdtempSync(join(tmpdir(), 'geri-'))
afterAll(() => rmSync(gecici, { recursive: true, force: true }))

function calistir(args: string[], env: Record<string, string> = {}) {
  try {
    const out = execFileSync(process.execPath, [BETIK, ...args], { env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { kod: 0, out }
  } catch (e) {
    const h = e as { status: number; stdout: string; stderr: string }
    return { kod: h.status, out: h.stdout + h.stderr }
  }
}

describe('yedekDogrula', () => {
  it('geçerli yedek: aynı slug tekrarında EN ESKİ kayıt (yazımdan önceki ilk okuma) kalır', () => {
    const r = yedekDogrula([satir(), satir({ description: { en: 'sonra' } })])
    expect(r.hatalar).toEqual([])
    expect(r.satirlar).toHaveLength(1)
    expect(r.satirlar[0].description).toEqual({ en: 'a' })
  })
  it('bozuk yedek reddedilir (boş, nesne değil, alan eksik, description yok)', () => {
    expect(yedekDogrula([]).hatalar).not.toEqual([])
    expect(yedekDogrula('x').hatalar).not.toEqual([])
    expect(yedekDogrula([{ slug: 'x' }]).hatalar.length).toBeGreaterThan(0)
    expect(yedekDogrula([satir({ description: null })]).hatalar.length).toBeGreaterThan(0)
    expect(yedekDogrula([satir({ is_description_manual: 'evet' })]).hatalar.length).toBeGreaterThan(0)
  })
})

describe('geriKarari', () => {
  it('canlı yedekten farklı → geri; aynı (anahtar sırası farklı olsa da) → zaten', () => {
    expect(geriKarari(satir(), satir({ description: { en: 'b' } })).durum).toBe('geri')
    expect(geriKarari(satir({ description: { a: 1, b: 2 } }), satir({ description: { b: 2, a: 1 } })).durum).toBe('zaten')
    expect(geriKarari(satir(), satir({ is_description_manual: false })).durum).toBe('geri')
  })
  it('canlıda yok ya da id/tenant farklı → red', () => {
    expect(geriKarari(satir(), undefined).durum).toBe('red')
    expect(geriKarari(satir(), satir({ id: 'b2' })).durum).toBe('red')
    expect(geriKarari(satir(), satir({ tenant_id: 't2' })).durum).toBe('red')
  })
})

describe('CLI önkoşulları (ağ yok)', () => {
  it('--yedek yok → çıkış 2', () => {
    expect(calistir([]).kod).toBe(2)
  })
  it('yedek dosyası yok / geçersiz JSON / bozuk yedek → çıkış 2', () => {
    expect(calistir(['--yedek', join(gecici, 'yok.json')]).kod).toBe(2)
    const kotu = join(gecici, 'kotu.json')
    writeFileSync(kotu, '{bozuk')
    expect(calistir(['--yedek', kotu]).kod).toBe(2)
    const bos = join(gecici, 'bos.json')
    writeFileSync(bos, '[]')
    expect(calistir(['--yedek', bos]).kod).toBe(2)
  })
  it('ortam dosyası yok → çıkış 2, hiçbir şey yazılmaz', () => {
    const y = join(gecici, 'y.json')
    writeFileSync(y, JSON.stringify([satir()]))
    const r = calistir(['--yedek', y, '--yaz'], { VENTHUB_ENV: join(gecici, 'yok.env'), CANLI_YAZIM_ONAYI: 'evet' })
    expect(r.kod).toBe(2)
    expect(r.out).toContain('ortam dosyasi okunamadi')
  })
})
