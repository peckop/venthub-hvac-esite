/**
 * INV-TLS-BETIK-1 · C10 (güvenlik karnesi 2026-11) — `scripts/**` içinde TLS doğrulaması kapatılmaz.
 *
 * NİÇİN VAR: 17 DB betiği `ssl: { rejectUnauthorized: false }` yazıyordu. Bu bağlantılar prod DB
 * kimlik bilgisi taşıyor ve depo herkese açık. Doğrusu `scripts/db/pg-tls.cjs` → `pgTls()`
 * (doğrulama açık, kök sertifika PGSSLROOTCERT ya da depodaki Supabase kökü).
 *
 * NE ÖLÇER:
 *  1. `scripts/**` kod dosyalarında (yorumlar sıyrılarak) `rejectUnauthorized: false` YOK.
 *  2. Dedektör sağlığı: tarama gerçekten dosya buluyor ve sıyırıcı koddaki ihlali yemiyor.
 *  3. Yardımcı gerçekten doğrulamayı açık döndürüyor, bozuk kökte fail-closed.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const SCRIPTS = path.join(KOK, 'scripts')
const IHLAL = /rejectUnauthorized\s*:\s*false/

function gez(dizin: string, cikti: string[] = []): string[] {
  for (const ad of fs.readdirSync(dizin, { withFileTypes: true })) {
    if (ad.name === 'node_modules' || ad.name === 'archive') continue
    const tam = path.join(dizin, ad.name)
    if (ad.isDirectory()) gez(tam, cikti)
    else if (/\.(c|m)?(j|t)s$/.test(ad.name)) cikti.push(tam)
  }
  return cikti
}

/** Yorumları sıyırır; `https://` içindeki `//` yorum sayılmaz. */
function yorumSiyir(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(?<!:)\/\/[^\n]*/g, ' ')
}

describe('INV-TLS-BETIK-1 · betiklerde TLS doğrulaması kapatılmaz (C10)', () => {
  it('dedektör sağlığı: tarama en az 17 bilinen DB betiğini görür', () => {
    const dosyalar = gez(SCRIPTS)
    expect(dosyalar.length).toBeGreaterThan(50)
    expect(dosyalar).toContain(path.join(SCRIPTS, 'setup_webhooks.js'))
    expect(dosyalar).toContain(path.join(SCRIPTS, 'db', 'migrations', 'run_saas_migrations.cjs'))
  })

  it('dedektör sağlığı: sıyırıcı yorumu atar, koddaki ihlali tutar', () => {
    expect(yorumSiyir('// eski: rejectUnauthorized: false\nconst a = 1')).not.toMatch(IHLAL)
    expect(yorumSiyir("const c = { ssl: { rejectUnauthorized: false } } // 'https://x'")).toMatch(IHLAL)
    // Alt sınır (INV-SCRUB-1): URL şeması yorum sanılıp satırın geri kalanı yenmez.
    const satir = "const u = 'postgres://h/db'; const c = { ssl: { rejectUnauthorized: false } }"
    expect(yorumSiyir(satir)).toContain('postgres://h/db')
    expect(yorumSiyir(satir)).toMatch(IHLAL)
  })

  it('scripts/** kodunda `rejectUnauthorized: false` yok', () => {
    const ihlaller = gez(SCRIPTS)
      .filter((f) => IHLAL.test(yorumSiyir(fs.readFileSync(f, 'utf8'))))
      .map((f) => path.relative(KOK, f))
    expect(ihlaller, "doğrusu: ssl: pgTls() (scripts/db/pg-tls.cjs)").toEqual([])
  })

  it('pgTls() doğrulamayı açık döndürür; bozuk kök dosyasında fail-closed', () => {
    const kod =
      "const { pgTls } = require(process.argv[1]); try { const t = pgTls(); console.log('OK', t.rejectUnauthorized, Array.isArray(t.ca)) } catch (e) { console.log('HATA', e.message) }"
    const yardimci = path.join(SCRIPTS, 'db', 'pg-tls.cjs')
    const temiz: NodeJS.ProcessEnv = { ...process.env }
    delete temiz.PGSSLROOTCERT
    const v = spawnSync(process.execPath, ['-e', kod, yardimci], { env: temiz, encoding: 'utf8' })
    expect(v.stdout.trim()).toBe('OK true true')

    const dizin = mkdtempSync(path.join(tmpdir(), 'pg-tls-'))
    const bozuk = path.join(dizin, 'bozuk.pem')
    writeFileSync(bozuk, 'PEM degil')
    const b = spawnSync(process.execPath, ['-e', kod, yardimci], {
      env: { ...temiz, PGSSLROOTCERT: bozuk },
      encoding: 'utf8',
    })
    expect(b.stdout).toMatch(/^HATA pg-tls: kok sertifika bir PEM degil/)
  })
})

/**
 * ALT-164 (OPS-234 m3, 2026-11-06): bağlantı dizgesi TLS'i EZEMEZ. Ölçüldü (pg 8.23.1): node-postgres
 * dizgedeki parametreleri `ssl` ayarının üzerine yazar; `sslmode=disable` TLS'i kapatır.
 */
describe('INV-TLS-BETIK-1 · bağlantı dizgesindeki sslmode pgTls ayarını ezemez (ALT-164)', () => {
  const yardimci = path.join(SCRIPTS, 'db', 'pg-tls.cjs')
  const dene = (baglanti: string) => {
    const kod =
      "const { pgTls } = require(process.argv[1]); try { const t = pgTls(process.argv[2]); console.log('OK', t.rejectUnauthorized) } catch (e) { console.log('HATA', e.message) }"
    const temiz: NodeJS.ProcessEnv = { ...process.env }
    delete temiz.PGSSLROOTCERT
    return spawnSync(process.execPath, ['-e', kod, yardimci, baglanti], { env: temiz, encoding: 'utf8' }).stdout.trim()
  }

  it('NEDEN: pg gerçekten ezer (bu kol yeşilken kapı gereklidir)', () => {
    const kod =
      "const CP = require('pg/lib/connection-parameters'); const s = { ca: ['x'], rejectUnauthorized: true };" +
      "const p = (q) => JSON.stringify(new CP({ connectionString: 'postgres://u:p@h:5432/d' + q, ssl: s }).ssl);" +
      "console.log(p('') + '|' + p('?sslmode=disable') + '|' + p('?sslmode=no-verify'))"
    const r = spawnSync(process.execPath, ['-e', kod], { cwd: KOK, encoding: 'utf8' })
    const [yok, kapali, dogrulamasiz] = r.stdout.trim().split('|')
    expect(yok).toBe('{"ca":["x"],"rejectUnauthorized":true}')
    expect(kapali, 'sslmode=disable artık ezmiyorsa kapı gözden geçirilir').toBe('false')
    expect(dogrulamasiz).toBe('{"rejectUnauthorized":false}')
  })

  it('SABOTAJ: TLS parametresi taşıyan dizge reddedilir (büyük/küçük harf fark etmez)', () => {
    for (const q of ['?sslmode=disable', '?sslmode=no-verify', '?sslmode=require', '?SSLMODE=disable', '?ssl=0', '?sslrootcert=/x', '?a=1&uselibpqcompat=true&sslmode=require']) {
      expect(dene('postgres://u:p@h:5432/d' + q), q).toMatch(/^HATA pg-tls: baglanti dizgesinde TLS ayarini ezen parametre var/)
    }
    expect(dene('bu bir url degil')).toMatch(/^HATA pg-tls: baglanti dizgesi URL olarak ayristirilamadi/)
  })

  it('temiz dizge geçer, doğrulama açık', () => {
    expect(dene('postgres://u:p@h:5432/d')).toBe('OK true')
    expect(dene('postgresql://u:p@h:6543/d?application_name=x')).toBe('OK true')
  })

  it('connectionString kullanan her betik pgTls()\'e dizgeyi verir', () => {
    const ihlaller = gez(SCRIPTS)
      .filter((f) => {
        const k = yorumSiyir(fs.readFileSync(f, 'utf8'))
        return /\bconnectionString\b/.test(k) && /\bpgTls\(\s*\)/.test(k)
      })
      .map((f) => path.relative(KOK, f))
    expect(ihlaller, 'doğrusu: ssl: pgTls(<bağlantı dizgesi>)').toEqual([])
  })
})
