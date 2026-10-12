/**
 * INV-KANCA-PATINAJ-1 — aynı araç çağrısı aynı girdi ve aynı sonuçla tekrarlanınca TEK satırlık uyarı (REC-467).
 *
 * Kanca: .claude/hooks/patinaj-bekcisi.cjs · fikir kaynağı: WrongStack core agent-loop-detector (yalnız fikir).
 * Sözleşme: bloklamaz (çıkış hep 0), farklı sonuç sayılmaz, yalnız eşiğin katlarında uyarır, fail-open.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'patinaj-bekcisi.cjs')

interface Kayit {
  s: string
  r: string
  ad: string
}
interface Bekci {
  degerlendir: (kutuk: Kayit[], kayit: Kayit, ayar: { esik: number; pencere: number }) => { kutuk: Kayit[]; uyari: string | null }
  kararli: (deger: unknown) => string
  sonucMetni: (sonuc: unknown) => string
}
const b = gerek(KANCA) as Bekci

const AYAR = { esik: 4, pencere: 12 }
const kayit = (s: string, r: string, ad = 'Bash'): Kayit => ({ s, r, ad })

/** Aynı kaydı n kez ekler; her adımdaki uyarıyı sırayla döner. */
const tekrarla = (n: number, k: Kayit, ayar = AYAR, baslangic: Kayit[] = []) => {
  let kutuk = baslangic
  const uyarilar: (string | null)[] = []
  for (let i = 0; i < n; i++) {
    const s = b.degerlendir(kutuk, k, ayar)
    kutuk = s.kutuk
    uyarilar.push(s.uyari)
  }
  return { kutuk, uyarilar }
}

describe('INV-KANCA-PATINAJ-1 · çekirdek', () => {
  it('eşiğin altında sessiz; 4. aynı çağrıda tek uyarı; arada sessiz; 8. çağrıda yeniden uyarır', () => {
    const { uyarilar } = tekrarla(8, kayit('a', 'x'))
    expect(uyarilar.map((u) => u !== null)).toEqual([false, false, false, true, false, false, false, true])
    expect(uyarilar[3]).toMatch(/PATINAJ: Bash aynı girdiyle 4 kez/)
    expect(uyarilar[7]).toMatch(/8 kez/)
  })

  it('AYNI girdi ama FARKLI sonuç patinaj DEĞİL (CI bitince gh çıktısı değişti)', () => {
    let kutuk: Kayit[] = []
    for (let i = 0; i < 10; i++) {
      const s = b.degerlendir(kutuk, kayit('a', 'sonuc-' + i), AYAR)
      kutuk = s.kutuk
      expect(s.uyari, `${i}. çağrıda yanlış alarm`).toBeNull()
    }
  })

  it('FARKLI girdi ayrı imzadır: iki komut dönüşümlü tekrar edince her biri kendi sayımını yapar', () => {
    let kutuk: Kayit[] = []
    const uyarilar: (string | null)[] = []
    for (let i = 0; i < 8; i++) {
      const s = b.degerlendir(kutuk, kayit(i % 2 ? 'a' : 'b', 'x'), AYAR)
      kutuk = s.kutuk
      uyarilar.push(s.uyari)
    }
    // 8 çağrıda her imza 4 kez: yalnız 7. ve 8. çağrıda (her birinin 4.'sü) uyarı
    expect(uyarilar.filter(Boolean)).toHaveLength(2)
  })

  it('pencere dışına düşen eski çağrılar sayılmaz (3 aynı + 12 farklı + 1 aynı = uyarı yok)', () => {
    let kutuk = tekrarla(3, kayit('a', 'x')).kutuk
    for (let i = 0; i < 12; i++) kutuk = b.degerlendir(kutuk, kayit('d' + i, 'y' + i), AYAR).kutuk
    expect(b.degerlendir(kutuk, kayit('a', 'x'), AYAR).uyari).toBeNull()
  })

  it('kütük pencereyle sınırlı kalır (bellek/dosya şişmez)', () => {
    expect(tekrarla(200, kayit('a', 'x')).kutuk.length).toBe(AYAR.pencere)
  })

  it('imza anahtar sırasından ve boşluktan bağımsız; farklı değer farklı imza', () => {
    expect(b.kararli({ a: 1, b: 'x  y' })).toBe(b.kararli({ b: ' x y ', a: 1 }))
    expect(b.kararli({ komut: 'ls' })).not.toBe(b.kararli({ komut: 'ls -la' }))
  })

  it('sonuç yoksa (eski kanca biçimi) boş metin döner: sayım yapılmaz', () => {
    expect(b.sonucMetni(undefined)).toBe('')
    expect(b.sonucMetni(null)).toBe('')
    expect(b.sonucMetni({ a: 1 })).not.toBe('')
  })
})

describe('INV-KANCA-PATINAJ-1 · gerçek süreç (stdin → stdout)', () => {
  const geciciler: string[] = []
  afterEach(() => {
    for (const d of geciciler.splice(0)) fs.rmSync(d, { recursive: true, force: true })
  })

  const kos = (stdin: string, dizin: string, env: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], {
      input: stdin,
      encoding: 'utf8',
      timeout: 15_000,
      windowsHide: true,
      env: { ...process.env, VENTHUB_PATINAJ_DIR: dizin, ...env },
    })

  const cagri = (sid: string, komut: string, sonuc: unknown = { stdout: 'ayni', exitCode: 0 }, arac = 'Bash') =>
    JSON.stringify({ session_id: sid, tool_name: arac, tool_input: { command: komut }, tool_response: sonuc })

  const yeniDizin = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'patinaj-'))
    geciciler.push(d)
    return d
  }
  const SID = '11111111-2222-3333-4444-555555555555'

  it('4. aynı çağrıda stdout additionalContext taşır ve çıkış 0 (bloklamaz); önceki üçü sessiz', () => {
    const d = yeniDizin()
    for (let i = 1; i <= 3; i++) {
      const r = kos(cagri(SID, 'pnpm test'), d)
      expect(r.status).toBe(0)
      expect(r.stdout, `${i}. çağrı sessiz olmalı`).toBe('')
    }
    const r = kos(cagri(SID, 'pnpm test'), d)
    expect(r.status).toBe(0)
    const cikti = JSON.parse(r.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(cikti.hookSpecificOutput.hookEventName).toBe('PostToolUse')
    expect(cikti.hookSpecificOutput.additionalContext).toMatch(/PATINAJ: Bash aynı girdiyle 4 kez/)
  })

  it('farklı argüman her seferinde → hiç uyarı yok; farklı oturum ayrı kütük', () => {
    const d = yeniDizin()
    for (let i = 0; i < 6; i++) expect(kos(cagri(SID, 'echo ' + i), d).stdout).toBe('')
    const baska = '99999999-2222-3333-4444-555555555555'
    for (let i = 0; i < 3; i++) kos(cagri(SID, 'pnpm test'), d)
    expect(kos(cagri(baska, 'pnpm test'), d).stdout, 'oturumlar karıştı').toBe('')
  })

  it('FAIL-OPEN: bozuk stdin, oturum kimliksiz çağrı, sonuçsuz çağrı, yazılamayan dizin → çıkış 0 ve sessiz', () => {
    const d = yeniDizin()
    expect(kos('{bozuk', d)).toMatchObject({ status: 0, stdout: '' })
    expect(kos('', d)).toMatchObject({ status: 0, stdout: '' })
    expect(kos(JSON.stringify({ tool_name: 'Bash', tool_input: {}, tool_response: 'x' }), d)).toMatchObject({ status: 0, stdout: '' })
    for (let i = 0; i < 6; i++) {
      const r = kos(JSON.stringify({ session_id: SID, tool_name: 'Bash', tool_input: { command: 'x' } }), d)
      expect(r).toMatchObject({ status: 0, stdout: '' })
    }
    // dizin yerine DOSYA verilince mkdir/yazma başarısız olur: yine çıkış 0
    const dosya = path.join(d, 'dosya')
    fs.writeFileSync(dosya, 'x')
    const r = kos(cagri(SID, 'pnpm test'), dosya)
    expect(r.status).toBe(0)
  })

  it('muaf araçlar (TodoWrite) ve ESIK ortam değişkeni', () => {
    const d = yeniDizin()
    for (let i = 0; i < 6; i++) expect(kos(cagri(SID, 'x', { a: 1 }, 'TodoWrite'), d).stdout).toBe('')
    const d2 = yeniDizin()
    expect(kos(cagri(SID, 'a'), d2, { VENTHUB_PATINAJ_ESIK: '2' }).stdout).toBe('')
    expect(kos(cagri(SID, 'a'), d2, { VENTHUB_PATINAJ_ESIK: '2' }).stdout).toMatch(/PATINAJ/)
  })
})
