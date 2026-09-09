/**
 * INV-KOKEN-ALLOWLIST-1 KİLİDİ — Edge Function CORS allowlist'i JOKER SON EK içermez.
 *
 * NİÇİN BU KİLİT VAR (REC-296, ölçüldü 2026-09-09 08:3xZ)
 *
 * `_shared/cors.ts` içindeki dal `origin.endsWith('.vercel.app')` idi. `.vercel.app`
 * **paylaşılan** bir son ektir — oraya herkes deploy edebilir. Yani allowlist "bizim
 * önizlemelerimiz" değil, **"Vercel'e deploy eden herkes"** anlamına geliyordu. Bu
 * yardımcıyı 28 Edge fonksiyondan **21'i** kullanıyor, aralarında admin uçları da var.
 *
 * ⚠BU KUSURU HİÇBİR STATİK KAPI GÖRMEZ: `tsc` için `endsWith` kusursuz bir çağrıdır,
 * lint için de öyle. Kusur TİPTE değil, kabul edilen KÜMENİN GENİŞLİĞİNDE. O yüzden
 * ölçen katman burasıdır.
 *
 * ⭐AYIRT EDİCİ ÇİFT: bu kilit yalnız "doğru adres geçiyor mu" diye bakmaz — geçmemesi
 * GEREKEN adreslerin gerçekten REDDEDİLDİĞİNİ de ölçer. Yalnız yeşil tarafı ölçen bir
 * test, allowlist'i `() => true` yapsanız da yeşil kalır.
 *
 * ⭐DEDEKTÖR SAĞLIĞI: kalıp kaynaktan ÇIKARILAMAZSA test "ihlal yok" DEMEZ, PATLAR.
 * (Boş tarayıp yeşil veren kapı, kapı değildir — bu depoda ölçülmüş bir hata sınıfı.)
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const CORS_YOLU = path.join(KOK, 'supabase/functions/_shared/cors.ts')
const CETVEL_YOLU = path.join(KOK, 'docs/standards/edge-function-security-standard.md')

function kaynakOku(yol: string): string {
  const metin = fs.readFileSync(yol, 'utf8')
  // DEDEKTÖR SAĞLIĞI: boş/kırpılmış dosya "ihlal yok" değildir.
  if (metin.trim().length < 100) {
    throw new Error(`DEDEKTOR SAGLIGI: ${yol} beklenmeyecek kadar kisa (${metin.length} bayt)`)
  }
  return metin
}

/** Kalıbı GERÇEK kaynaktan çıkarır — testin kendi kopyasını sınamasını engeller. */
function kalibiCikar(kaynak: string): RegExp {
  const esleme = kaynak.match(/ONIZLEME_KALIBI\s*=\s*(\/.+\/)\s*;?/)
  if (!esleme) {
    throw new Error('DEDEKTOR SAGLIGI: ONIZLEME_KALIBI kaynaktan cikarilamadi — kapi KOR kosar')
  }
  const govde = esleme[1].slice(1, -1)
  return new RegExp(govde)
}

describe('INV-KOKEN-ALLOWLIST-1 — Edge CORS allowlist genisligi', () => {
  const kaynak = kaynakOku(CORS_YOLU)

  it('joker son ek dali KALDIRILMIS olmali', () => {
    expect(kaynak).not.toMatch(/endsWith\(\s*['"]\.vercel\.app['"]\s*\)/)
  })

  it('kalip kaynaktan cikarilabilir olmali (dedektor sagligi)', () => {
    expect(() => kalibiCikar(kaynak)).not.toThrow()
  })

  it('kalip sonu civilemeli — aksi halde daraltma bir yanilsamadir', () => {
    const kalip = kalibiCikar(kaynak)
    expect(kalip.source.endsWith('$')).toBe(true)
    expect(kalip.source.startsWith('^')).toBe(true)
  })

  describe('AYIRT EDICI CIFT — kabul edilenler', () => {
    const kabul = [
      'https://venthub-hvac-esite.vercel.app',
      'https://venthub-hvac-esite-1fk7v482n-peckops-projects.vercel.app',
      'https://venthub-hvac-esite-m8cog5tbe-peckops-projects.vercel.app',
    ]
    it.each(kabul)('bizim onizlememiz KABUL: %s', (koken) => {
      expect(kalibiCikar(kaynak).test(koken)).toBe(true)
    })
  })

  describe('AYIRT EDICI CIFT — reddedilmesi GEREKENLER', () => {
    const red = [
      // Baskasinin Vercel projesi — kusurun ta kendisi.
      'https://baskasi.vercel.app',
      'https://evil.vercel.app',
      // Son ek civilenmezse gecerdi.
      'https://venthub-hvac-esite.vercel.app.evil.example',
      'https://venthub-hvac-esite.evil.example',
      // Sema onemli: http, https degil.
      'http://venthub-hvac-esite.vercel.app',
      // Alt alan adi bizim degil.
      'https://evil.venthub-hvac-esite.vercel.app',
      'https://venthub.com.tr.evil.example',
    ]
    it.each(red)('yabanci koken REDDEDILIR: %s', (koken) => {
      expect(kalibiCikar(kaynak).test(koken)).toBe(false)
    })
  })

  it('kanonik alan adi dali DURMALI (REC-117 bulgu 6 gerilemesin)', () => {
    expect(kaynak).toContain('https://venthub.com.tr')
    expect(kaynak).toContain('https://www.venthub.com.tr')
  })

  it('yerel gelistirme dali DURMALI', () => {
    expect(kaynak).toMatch(/startsWith\(\s*['"]http:\/\/localhost:['"]\s*\)/)
  })

  it('cetvel §3.6 yazilmis ve kola ADIYLA atif yapiyor olmali', () => {
    const cetvel = kaynakOku(CETVEL_YOLU)
    expect(cetvel).toContain('3.6')
    expect(cetvel).toContain('INV-KOKEN-ALLOWLIST-1')
  })
})
