import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-SOZ-BEKCISI-1 · söz bekçisi Stop kancası (ARC-58). Kural listesi: .claude/hooks/soz-bekcisi-kurallari.json.
 * Sabotaj kolları: kural listesi boşalırsa, ya da "rakam ve harf" şartı kalkarsa ilgili test kırmızıya döner
 * (yoksa "temiz" yeşili sahte olurdu).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'soz-bekcisi.cjs')
type Kural = { id: string; re: RegExp; rakamVeHarf?: boolean; duzeltme: string }
const motor = require_(KANCA) as {
  kurallariOku: (yol?: string) => Kural[]
  tara: (metin: string, kurallar: Kural[]) => { kural: Kural; bulunan: string[] }[]
}

const gecici: string[] = []
afterEach(() => {
  for (const d of gecici.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

function bulunan(metin: string, kurallar = motor.kurallariOku()) {
  return motor.tara(metin, kurallar).flatMap((b) => b.bulunan)
}

/** Sahte kayıtla kancayı gerçekten koşar: { kod, hata }. */
function koş(sonMetin: string, ek: Record<string, unknown> = {}) {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'soz-bekcisi-'))
  gecici.push(dizin)
  const kayit = path.join(dizin, 'k.jsonl')
  const satirlar = [
    { type: 'user', message: { role: 'user', content: [{ type: 'text', text: 'devam' }] } },
    { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: sonMetin }] } },
  ]
  fs.writeFileSync(kayit, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n')
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ transcript_path: kayit, session_id: 'test', ...ek }),
    encoding: 'utf8',
    env: { ...process.env, KARTSIZ_KAPI_DURUM_DIZINI: dizin, VENTHUB_SOZ_BEKCISI_KAPAT: '' },
  })
  return { kod: r.status, hata: r.stderr, dizin }
}

describe('INV-SOZ-BEKCISI-1 — 8 haneli iç kimlik', () => {
  it('rakam+harf karışık 8 haneli kimlik yakalanır', () => {
    expect(bulunan('oturum 06903c7d açıldı')).toEqual(['06903c7d'])
    expect(bulunan('kart ca8d9fdc ve 17c3fb48')).toEqual(['ca8d9fdc', '17c3fb48'])
  })

  it('departman kodu + numara, karar no, tarih damgası, sürüm ve UUID serbest', () => {
    const temiz = 'OPS-29 ve ARC-34, karar 419, damga 20261104, sürüm 1.4.0, 2026-11-04, uuid ca8d9fdc-865e-4fe8-97fc-fdb5f02b7d07, sha b2a2732f1'
    expect(bulunan(temiz)).toEqual([])
  })

  it('yalnız rakam ya da yalnız harf olan 8 karakter kimlik sayılmaz', () => {
    expect(bulunan('12345678 ve deadbeef')).toEqual([])
  })

  it('kod bloğu ve adres içindeki kimlik taranmaz', () => {
    expect(bulunan('```\nsid 06903c7d\n```')).toEqual([])
    expect(bulunan('bkz https://x.test/a/06903c7d')).toEqual([])
  })

  it('⛔SABOTAJ: kural listesi boşsa yakalama yok (liste gerçekten kapıyı taşıyor)', () => {
    expect(bulunan('oturum 06903c7d', [])).toEqual([])
    expect(motor.kurallariOku().length).toBeGreaterThan(0)
  })

  it('⛔SABOTAJ: rakamVeHarf şartı kalkarsa saf rakam damgası yanlış alarm verirdi', () => {
    const kural = { ...motor.kurallariOku()[0], rakamVeHarf: false }
    expect(bulunan('damga 20261104', [kural])).toEqual(['20261104'])
    expect(bulunan('damga 20261104')).toEqual([])
  })
})

describe('INV-SOZ-BEKCISI-1 — Stop kancası uçtan uca', () => {
  it('iç kimlik varsa exit 2 ve düzeltme önerir', () => {
    const r = koş('Oturum 06903c7d hazır.')
    expect(r.kod).toBe(2)
    expect(r.hata).toContain('06903c7d')
    expect(r.hata).toContain('Sözbekçisi:')
  })

  it('departman kodu yazılınca geçer', () => {
    expect(koş('ARC-58 hazır, karar 419.').kod).toBe(0)
  })

  it('"Sözbekçisi: sebep" satırı atlatır ve kayda düşer', () => {
    const r = koş('Kimlik 06903c7d.\nSözbekçisi: sahibin kendi sorduğu kimlik')
    expect(r.kod).toBe(0)
    expect(fs.readFileSync(path.join(r.dizin, 'soz-bekcisi-atlatma.log'), 'utf8')).toContain('sahibin kendi sorduğu kimlik')
  })

  it('stop_hook_active ise ikinci kez bloklamaz', () => {
    expect(koş('Oturum 06903c7d hazır.', { stop_hook_active: true }).kod).toBe(0)
  })

  it('bozuk girdi fail-open', () => {
    const r = spawnSync(process.execPath, [KANCA], { input: 'bozuk', encoding: 'utf8' })
    expect(r.status).toBe(0)
  })
})
