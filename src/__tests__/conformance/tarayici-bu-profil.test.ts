/**
 * INV-TARAYICI-PROFIL-1 — browser-use ayrı Chrome profili Recep'in varsayılan profilini ASLA seçemez.
 * Kaynak: scripts/tarayici/bu-profil.cjs (browser-use BU_CDP_URL verilmezse varsayılan profile bağlanır, 2026-09-23 ölçüldü).
 */
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { profilGuvenliMi, varsayilanChromeDizinleri, portGecerliMi } = require('../../../scripts/tarayici/bu-profil.cjs') as {
  profilGuvenliMi: (d: string, v: string[]) => { ok: boolean; sebep?: string }
  varsayilanChromeDizinleri: (o: Record<string, string | undefined>, ev: string) => string[]
  portGecerliMi: (p: unknown) => boolean
}

const ev = 'D:/ev/ornek'
const varsayilan = varsayilanChromeDizinleri({ LOCALAPPDATA: 'D:/ev/ornek/AppData/Local' }, ev)

describe('INV-TARAYICI-PROFIL-1', () => {
  it('ayri dizin kabul edilir', () => {
    expect(profilGuvenliMi('C:/tmp/bu-profil', varsayilan).ok).toBe(true)
  })

  it('varsayilan Chrome kullanici dizini reddedilir (buyuk/kucuk harf ve ters bolu fark etmez)', () => {
    expect(profilGuvenliMi('D:/ev/ornek/AppData/Local/Google/Chrome/User Data', varsayilan).ok).toBe(false)
    expect(profilGuvenliMi('d:\\ev\\ornek\\appdata\\local\\google\\chrome\\user data\\', varsayilan).ok).toBe(false)
  })

  it('varsayilan dizinin ALTI da reddedilir (Default / Profile 1)', () => {
    expect(profilGuvenliMi('D:/ev/ornek/AppData/Local/Google/Chrome/User Data/Default', varsayilan).ok).toBe(false)
  })

  it('adi benzeyen kardes dizin reddedilmez (onek tuzagi)', () => {
    expect(profilGuvenliMi('D:/ev/ornek/AppData/Local/Google/Chrome/User Data2', varsayilan).ok).toBe(true)
  })

  it('bos dizin reddedilir', () => {
    expect(profilGuvenliMi('', varsayilan).ok).toBe(false)
  })

  it('port araligi', () => {
    expect(portGecerliMi(9333)).toBe(true)
    expect(portGecerliMi('9333')).toBe(true)
    expect(portGecerliMi(80)).toBe(false)
    expect(portGecerliMi('abc')).toBe(false)
  })
})
