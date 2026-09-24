// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-EPOSTA-KIMLIK-1 (REC-368 / REC-382, 2026-09-24) — Edge Function KODUNDA e-posta kimliği
 * yalnız kanonik alan adından gelir.
 *
 * Niçin: 2025-09-13 → 2026-09-23 arası müşteri e-postaları Resend'in deneme adresinden
 * (`onboarding@resend.dev`) çıktı — o adres yalnız hesap sahibine teslim eder, müşteri e-postası
 * sessizce kayboldu ve hiçbir kapı görmedi. Aynı dönemde bir fonksiyonun son çare göndericisi
 * `noreply@venthub.com` (.tr DEĞİL, bize ait olmayan alan adı), marka logosu da altyapı adresi
 * `venthub-hvac-esite.vercel.app` idi (CLAUDE.md: vercel.app müşteriye verilmez).
 *
 * Kural: yorum dışı kod satırında bu üç desen GEÇMEZ; sistem varsayılanları
 * `_shared/tenant_config.ts` içindeki `VARSAYILAN_GONDERICI` / `VARSAYILAN_LOGO_URL`'dedir ve
 * kanonik alan adını (venthub.com.tr) taşır.
 */
const KOK = path.resolve(__dirname, '../../..')
const FONK = path.join(KOK, 'supabase', 'functions')

const YASAK: ReadonlyArray<{ ad: string; re: RegExp }> = [
  { ad: 'Resend deneme göndericisi', re: /onboarding@resend\.dev/ },
  { ad: '.tr olmayan venthub.com adresi', re: /@venthub\.com(?!\.tr)/ },
  { ad: 'altyapı adresinden görsel', re: /vercel\.app\/images\// },
]

function tsDosyalari(dizin: string): string[] {
  const out: string[] = []
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, g.name)
    if (g.isDirectory()) out.push(...tsDosyalari(p))
    else if (g.name.endsWith('.ts') && !g.name.endsWith('.test.ts')) out.push(p)
  }
  return out
}

/** Satır yorumu ve blok yorumu satırlarını atar (yorumda ESKİ adresi anlatmak serbest). */
function yorumMu(satir: string): boolean {
  const t = satir.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
}

describe('INV-EPOSTA-KIMLIK-1: Edge e-posta kimliği kanonik alan adından', () => {
  it('supabase/functions altında taranacak dosya VAR (kapı kör koşmasın)', () => {
    expect(tsDosyalari(FONK).length).toBeGreaterThan(20)
  })

  it('yorum dışı kodda deneme/yabancı gönderici ya da vercel.app görseli YOK', () => {
    const bulgular: string[] = []
    for (const f of tsDosyalari(FONK)) {
      const satirlar = fs.readFileSync(f, 'utf8').split(/\r?\n/)
      satirlar.forEach((s, i) => {
        if (yorumMu(s)) return
        for (const y of YASAK) if (y.re.test(s)) bulgular.push(`${path.relative(KOK, f)}:${i + 1} ${y.ad}`)
      })
    }
    expect(bulgular, 'Sistem varsayılanı için _shared/tenant_config.ts VARSAYILAN_* sabitlerini kullan').toEqual([])
  })

  it('sistem varsayılanları kanonik alan adını taşır', () => {
    const src = fs.readFileSync(path.join(FONK, '_shared', 'tenant_config.ts'), 'utf8')
    expect(src).toMatch(/export const VARSAYILAN_GONDERICI = 'VentHub <info@venthub\.com\.tr>'/)
    expect(src).toMatch(/export const VARSAYILAN_LOGO_URL = 'https:\/\/venthub\.com\.tr\/images\/logo\.png'/)
  })

  it('sabotaj: desenler eski adresleri yakalar, kanonik adresi yakalamaz', () => {
    const [deneme, com, vercel] = YASAK
    expect(deneme.re.test("'VentHub <onboarding@resend.dev>'")).toBe(true)
    expect(com.re.test("'VentHub <noreply@venthub.com>'")).toBe(true)
    expect(com.re.test("'VentHub <info@venthub.com.tr>'")).toBe(false)
    expect(vercel.re.test("'https://venthub-hvac-esite.vercel.app/images/logo.png'")).toBe(true)
    expect(yorumMu('   // eskiden onboarding@resend.dev idi')).toBe(true)
  })
})
