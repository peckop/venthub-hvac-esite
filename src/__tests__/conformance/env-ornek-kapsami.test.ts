/**
 * INV-ENV-ORNEK-1 · C9 (güvenlik karnesi 2026-11) — kodda okunan her gizli env adı bir
 * `.env*.example` dosyasında geçer (yalnız ad; değer yazılmaz, depo herkese açık).
 *
 * NİÇİN VAR: `JWT_CLAIMS_COOKIE_SECRET` ve `SUPABASE_WEBHOOK_SECRET` kodda okunuyor ve yoksa
 * fail-closed davranıyordu, ama hiçbir örnek dosyada adları yoktu. Yeni ortam kuran kişi
 * sırrı bilmeden atlıyor, sonuç "admin açılmıyor / webhook 401" olarak görünüyordu.
 *
 * NE ÖLÇER: `src/**` ve `supabase/functions/**` (test dosyaları hariç) içinde
 * `process.env.X`, `process.env['X']` ve `Deno.env.get('X')` ile okunan, adı sır kalıbına
 * (SECRET/KEY/TOKEN/PASSWORD/PRIVATE/CREDENTIAL) uyan her ad, kök dizindeki `.env*.example`
 * dosyalarının birinde `AD=` ya da `# AD=` olarak geçmelidir.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const SIR_KALIBI = /SECRET|KEY|TOKEN|PASSWORD|PRIVATE|CREDENTIAL/

/** Sır kalıbına uyan ama sır OLMAYAN adlar — her biri gerekçesiyle. */
const SIR_DEGIL: Record<string, string> = {
  REQUIRE_AUTH: 'log-client-error kimlik bayrağı (true/false); değer gizli değil',
}

function gez(dizin: string, cikti: string[] = []): string[] {
  for (const ad of fs.readdirSync(dizin, { withFileTypes: true })) {
    if (ad.name === 'node_modules' || ad.name === '__tests__') continue
    const tam = path.join(dizin, ad.name)
    if (ad.isDirectory()) gez(tam, cikti)
    else if (/\.(ts|tsx)$/.test(ad.name) && !/\.(test|spec)\.tsx?$/.test(ad.name) && !ad.name.endsWith('.d.ts')) cikti.push(tam)
  }
  return cikti
}

function okunanAdlar(): Map<string, string> {
  const adlar = new Map<string, string>()
  const kaliplar = [
    /process\.env\.([A-Z][A-Z0-9_]+)/g,
    /process\.env\[\s*['"]([A-Z][A-Z0-9_]+)['"]\s*\]/g,
    /Deno\.env\.get\(\s*['"]([A-Z][A-Z0-9_]+)['"]/g,
  ]
  for (const dosya of [...gez(path.join(KOK, 'src')), ...gez(path.join(KOK, 'supabase', 'functions'))]) {
    const src = fs.readFileSync(dosya, 'utf8')
    for (const k of kaliplar) {
      for (const m of src.matchAll(k)) {
        if (!adlar.has(m[1])) adlar.set(m[1], path.relative(KOK, dosya))
      }
    }
  }
  return adlar
}

function ornekAdlari(): Set<string> {
  const adlar = new Set<string>()
  for (const ad of fs.readdirSync(KOK)) {
    if (!/^\.env.*example/.test(ad)) continue
    for (const satir of fs.readFileSync(path.join(KOK, ad), 'utf8').split('\n')) {
      const m = satir.match(/^\s*#?\s*([A-Z][A-Z0-9_]+)=/)
      if (m) adlar.add(m[1])
    }
  }
  return adlar
}

describe('INV-ENV-ORNEK-1 · gizli env adları örnek dosyada (C9)', () => {
  it('tarama gerçekten çalışıyor (önkoşul: bilinen iki sır bulunur)', () => {
    const adlar = okunanAdlar()
    expect(adlar.has('JWT_CLAIMS_COOKIE_SECRET')).toBe(true)
    expect(adlar.has('SUPABASE_WEBHOOK_SECRET')).toBe(true)
  })

  it('kodda okunan her gizli env adı bir .env*.example dosyasında geçer', () => {
    const ornek = ornekAdlari()
    const eksik = [...okunanAdlar()]
      .filter(([ad]) => SIR_KALIBI.test(ad) && !(ad in SIR_DEGIL) && !ornek.has(ad))
      .map(([ad, yer]) => `${ad} (${yer})`)
    expect(eksik, 'örnek dosyaya YALNIZ adı ekle, değer yazma: AD=').toEqual([])
  })

  it('örnek dosyalardaki sır satırları değer taşımaz (yer tutucu ya da boş)', () => {
    const dolu: string[] = []
    for (const ad of fs.readdirSync(KOK)) {
      if (!/^\.env.*example/.test(ad)) continue
      for (const satir of fs.readFileSync(path.join(KOK, ad), 'utf8').split('\n')) {
        const m = satir.match(/^\s*([A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE)[A-Z0-9_]*)=(.*)$/)
        if (!m) continue
        const deger = m[2].trim()
        if (deger !== '' && !/^(your_|re_your_|<|xxx)/i.test(deger)) dolu.push(`${ad}: ${m[1]}`)
      }
    }
    expect(dolu).toEqual([])
  })
})
