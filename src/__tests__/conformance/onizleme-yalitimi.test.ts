import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ONIZLEME-1 · yerel ön izleme canlıya YALNIZ ziyaretçi anahtarıyla bağlanır (OPS 2026-09-25, REC-300 1a).
 *
 * NİÇİN: `scripts/onizleme.mjs` bir dalı üretim derlemesiyle canlı veritabanına karşı kaldırır. Next, derlemede
 * proje klasöründeki `.env*` dosyalarını kendiliğinden yükler ve ana depodaki `.env` sunucu anahtarı taşır.
 * Sunucu anahtarı ön izlemeye sızarsa RLS atlanır: ön izlemedeki bir hata canlı veriyi yazabilir.
 * Kapı üç ayağı ölçer: izin listesi sırrı geçirmez · anon olmayan anahtar reddedilir · yerel yığın portları yasak.
 */

type Modul = {
  portGecerli: (p: number) => boolean
  jwtRolu: (k: string) => string | null
  envOku: (m: string, a: string[]) => Record<string, string>
  ortamSuz: (s: Record<string, string>, o: { url: string; anonAnahtar: string; port: number }) => Record<string, string>
}

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts', 'onizleme.mjs')

const sahteJwt = (role: string) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role, iss: 'supabase' })).toString('base64url')}.imza`

describe('INV-ONIZLEME-1 · yerel ön izleme yalıtımı', async () => {
  const m = (await import(BETIK)) as Modul

  it('rol: anon anahtarı "anon", sunucu anahtarı "service_role" okunur; bozuk anahtar null', () => {
    expect(m.jwtRolu(sahteJwt('anon'))).toBe('anon')
    expect(m.jwtRolu(sahteJwt('service_role'))).toBe('service_role')
    expect(m.jwtRolu('bozuk')).toBeNull()
  })

  it('izin listesi: sistemdeki sır adları sürece GEÇMEZ, PATH geçer', () => {
    const sistem = {
      PATH: '/bin',
      SUPABASE_SERVICE_ROLE_KEY: 'SIR',
      DATABASE_URL: 'postgres://SIR',
      OPENROUTER_API_KEY: 'SIR',
      GH_TOKEN: 'SIR',
      SUPABASE_DB_PASSWORD: 'SIR',
      JWT_CLAIMS_COOKIE_SECRET: 'SIR',
    }
    const o = m.ortamSuz(sistem, { url: 'https://x.supabase.co', anonAnahtar: sahteJwt('anon'), port: 3100 })
    expect(Object.values(o)).not.toContain('SIR')
    expect(Object.values(o).join(' ')).not.toMatch(/postgres:\/\//)
    expect(o.PATH).toBe('/bin')
    expect(o.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3100')
    expect(o.JWT_CLAIMS_COOKIE_SECRET).toMatch(/^onizleme-[0-9a-f]{48}$/)
    expect(Object.keys(o).filter((k) => /SERVICE_ROLE|DATABASE_URL|PASSWORD/.test(k))).toEqual([])
  })

  it('env okuyucu yalnız istenen iki anahtarı alır', () => {
    const metin = 'NEXT_PUBLIC_SUPABASE_URL=https://a\nSUPABASE_SERVICE_ROLE_KEY=SIR\nNEXT_PUBLIC_SUPABASE_ANON_KEY="k"\n'
    expect(m.envOku(metin, ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'])).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: 'https://a',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'k',
    })
  })

  it('port: 3000 ve 54321-54327 yasak, 3100 serbest', () => {
    for (const p of [3000, 54321, 54324, 54327, 80, 70000]) expect(m.portGecerli(p)).toBe(false)
    expect(m.portGecerli(3100)).toBe(true)
  })

  it('betik rol denetimini, .env* denetimini ve ayrı ağacı gerçekten çağırıyor (metin kolu)', () => {
    const k = fs.readFileSync(BETIK, 'utf8')
    expect(k).toMatch(/jwtRolu\(env\.NEXT_PUBLIC_SUPABASE_ANON_KEY\) !== 'anon'/)
    expect(k).toMatch(/\/\^\\\.env\//)
    expect(k).toMatch(/cwd: ONIZLEME_AGACI, env: surecOrtami/)
    expect(k, 'sunucu anahtarı hiçbir yerde okunmaz').not.toMatch(/envOku\([^)]*SERVICE_ROLE/)
    // push edilmemiş yerel dal ön izlenebilmeli (R4.8) ve sahibinin ağacı değil commit'i ayrık alınmalı
    expect(k).toMatch(/refs\/heads\/\$\{dal\}\^\{commit\}/)
    expect(k).toMatch(/'--detach', commit/)
  })
})
