import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PR-KAYIT-KAPISI-1 · her birleşen PR bir Linear kaydına bağlanır (karar 187, REC-433).
 *
 * ÖLÇÜLEN KUSUR: son 60 birleşmenin 0'ı `Fixes REC-nn` taşıyordu; `is-kayit-duzeni-standard.md` §4 "zorunlu"
 * diyordu ama kapı yoktu. Kayıtlar elle kapatıldı ya da açık kaldı.
 *
 * KABUL: `Fixes REC-nn` · `Kayıtsız: <sebep>` (sayılır) · bağımlılık botu (sayılır) ·
 * geçici istisna `Kayıtsız: Linear sınırı dolu, Part of REC-nn` (ayrı sayılır). `Part of` TEK BAŞINA yetmez.
 * UYARI (kırmızı DEĞİL): Fixes hedefi açık alt kaydı olan çatı; Linear okunamazsa "ölçülemedi".
 *
 * Mantık `scripts/board/pr-kayit-kapisi.cjs`; iş akışı `.github/workflows/pr-kayit-kapisi.yml` (ALTYAPI).
 */

interface Sonuc {
  gecti: boolean
  tur: string
  kayitlar: string[]
  sebep: string
}
interface Cati {
  identifier: string
  children: { identifier: string; stateType: string }[]
}
type Getir = (id: string) => Promise<Cati | null>
interface Kapi {
  degerlendir: (g: { govde?: string | null; yazar?: string }) => Sonuc
  catiKontrolu: (kayitlar: string[], getir?: Getir | null) => Promise<{ durum: string; cati: string[]; aciklama: string }>
  linearGetirici: (anahtar: string | undefined) => unknown
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KAPI_YOLU = path.join(KOK, 'scripts/board/pr-kayit-kapisi.cjs')
const kapi = require_(KAPI_YOLU) as Kapi

describe('INV-PR-KAYIT-KAPISI-1 · kabul kolları', () => {
  it('Fixes REC-nn geçer ve kaydı verir', () => {
    const s = kapi.degerlendir({ govde: 'Özet\n\nFixes REC-433\n' })
    expect(s).toMatchObject({ gecti: true, tur: 'fixes', kayitlar: ['REC-433'] })
  })

  it('Closes/Resolves, küçük harf ve birden çok kayıt kabul edilir', () => {
    expect(kapi.degerlendir({ govde: 'closes rec-12' }).kayitlar).toEqual(['REC-12'])
    expect(kapi.degerlendir({ govde: 'Resolves REC-1, REC-2' }).kayitlar).toEqual(['REC-1', 'REC-2'])
    expect(kapi.degerlendir({ govde: 'Fixes REC-7\nFixes REC-8' }).kayitlar).toEqual(['REC-7', 'REC-8'])
  })

  it('CRLF gövdesi (GitHub web formu) aynı sonucu verir', () => {
    expect(kapi.degerlendir({ govde: 'Özet\r\n\r\nFixes REC-9\r\n' }).gecti).toBe(true)
  })

  it('Kayıtsız: <sebep> geçer ve istisna olarak SAYILIR (tür=kayitsiz)', () => {
    const s = kapi.degerlendir({ govde: 'Kayıtsız: yalnız belge düzeltmesi, iş kaydı gerektirmez' })
    expect(s).toMatchObject({ gecti: true, tur: 'kayitsiz' })
  })

  it('Kayıtsız satırı ASCII yazımla (Kayitsiz) da tanınır', () => {
    expect(kapi.degerlendir({ govde: 'Kayitsiz: yazim duzeltmesi, kayit yok' }).tur).toBe('kayitsiz')
  })

  it('sebepsiz ya da tek kelimelik Kayıtsız KIRMIZI', () => {
    const s = kapi.degerlendir({ govde: 'Kayıtsız: yok' })
    expect(s).toMatchObject({ gecti: false, tur: 'kayitsiz-sebepsiz' })
    expect(kapi.degerlendir({ govde: 'Kayıtsız:' }).gecti).toBe(false)
  })

  it('bağımlılık botu geçer ve ayrı tür olarak sayılır', () => {
    expect(kapi.degerlendir({ govde: 'Bumps x', yazar: 'dependabot[bot]' })).toMatchObject({ gecti: true, tur: 'bot' })
    expect(kapi.degerlendir({ govde: 'Bumps x', yazar: 'renovate[bot]' }).tur).toBe('bot')
  })

  it("insan yazarın gövdesiz PR'ı KIRMIZI (bot muafiyeti yalnız botlara)", () => {
    expect(kapi.degerlendir({ govde: '', yazar: 'peckop' })).toMatchObject({ gecti: false, tur: 'yok' })
    expect(kapi.degerlendir({ govde: null })).toMatchObject({ gecti: false, tur: 'yok' })
  })
})

describe('INV-PR-KAYIT-KAPISI-1 · Part of ve sahte kabuller', () => {
  it('Part of REC-nn TEK BAŞINA yetmez', () => {
    expect(kapi.degerlendir({ govde: 'Part of REC-433' })).toMatchObject({ gecti: false, tur: 'sadece-part-of' })
  })

  it('Linear sınırı dolu istisnası kabul edilir ve AYRI sayılır', () => {
    const s = kapi.degerlendir({ govde: 'Kayıtsız: Linear sınırı dolu, Part of REC-433' })
    expect(s).toMatchObject({ gecti: true, tur: 'kayitsiz-linear-siniri', kayitlar: ['REC-433'] })
  })

  it('"Part of" içeren ama Linear sınırı demeyen Kayıtsız düz istisna sayılır (sınır istisnası sayılmaz)', () => {
    const s = kapi.degerlendir({ govde: 'Kayıtsız: küçük düzeltme, Part of REC-433 değil' })
    expect(s.tur).toBe('kayitsiz')
  })

  it('kod çiti ve HTML yorumu içindeki Fixes SAYILMAZ (şablon örneği kapıyı geçirmesin)', () => {
    expect(kapi.degerlendir({ govde: '```\nFixes REC-1\n```' }).gecti).toBe(false)
    expect(kapi.degerlendir({ govde: '<!-- Fixes REC-1 -->' }).gecti).toBe(false)
    expect(kapi.degerlendir({ govde: '~~~\nFixes REC-1\n~~~' }).gecti).toBe(false)
  })

  it('cümle ortasında geçen "fixes" kaydı sayılmaz (satır başı şart)', () => {
    expect(kapi.degerlendir({ govde: 'Bu değişiklik fixes REC-1 sorununu anlatır' }).gecti).toBe(false)
  })

  it('REC olmayan ya da numarasız hedef kabul edilmez', () => {
    expect(kapi.degerlendir({ govde: 'Fixes #123' }).gecti).toBe(false)
    expect(kapi.degerlendir({ govde: 'Fixes REC-' }).gecti).toBe(false)
  })
})

describe('INV-PR-KAYIT-KAPISI-1 · çatı uyarısı (kırmızı DEĞİL)', () => {
  type Harita = Record<string, { identifier: string; stateType: string }[] | 'hata' | null>
  const getir =
    (harita: Harita): Getir =>
    async (id) => {
      const v = harita[id]
      if (v === 'hata') throw new Error('ağ yok')
      if (v === null || v === undefined) return null
      return { identifier: id, children: v }
    }

  it('açık alt kaydı olan çatı UYARI verir', async () => {
    const r = await kapi.catiKontrolu(
      ['REC-433'],
      getir({ 'REC-433': [{ identifier: 'REC-440', stateType: 'started' }, { identifier: 'REC-441', stateType: 'completed' }] }),
    )
    expect(r.durum).toBe('uyari')
    expect(r.aciklama).toContain('REC-440')
    expect(r.aciklama).not.toContain('REC-441')
  })

  it('bütün alt kayıtları kapalı ya da alt kaydı olmayan kayıt temiz', async () => {
    expect((await kapi.catiKontrolu(['REC-1'], getir({ 'REC-1': [] }))).durum).toBe('temiz')
    expect((await kapi.catiKontrolu(['REC-1'], getir({ 'REC-1': [{ identifier: 'REC-2', stateType: 'canceled' }] }))).durum).toBe('temiz')
  })

  it('Linear anahtarı yoksa "ölçülemedi" (kırmızı değil)', async () => {
    expect((await kapi.catiKontrolu(['REC-1'], null)).durum).toBe('olculemedi')
    expect(kapi.linearGetirici(undefined)).toBeNull()
  })

  it('ağ hatası ve bulunamayan kayıt "ölçülemedi", çökmez', async () => {
    expect((await kapi.catiKontrolu(['REC-1'], getir({ 'REC-1': 'hata' }))).durum).toBe('olculemedi')
    expect((await kapi.catiKontrolu(['REC-1'], getir({ 'REC-1': null }))).durum).toBe('olculemedi')
  })

  it('bir çatı bulunur, biri ölçülemezse uyarı korunur', async () => {
    const r = await kapi.catiKontrolu(
      ['REC-1', 'REC-2'],
      getir({ 'REC-1': [{ identifier: 'REC-3', stateType: 'unstarted' }], 'REC-2': 'hata' }),
    )
    expect(r.durum).toBe('uyari')
  })
})

describe('INV-PR-KAYIT-KAPISI-1 · CLI (iş akışının çağırdığı yol)', () => {
  const kos = (govde: string, yazar = 'peckop') =>
    spawnSync(process.execPath, [KAPI_YOLU], {
      env: { ...process.env, PR_GOVDE: govde, PR_YAZAR: yazar, LINEAR_API_KEY: '', GITHUB_STEP_SUMMARY: '', GITHUB_OUTPUT: '' },
      encoding: 'utf8',
    })

  it('geçen PR çıkış kodu 0, kırmızı PR 1 ve ::error satırı verir', () => {
    const iyi = kos('Fixes REC-433')
    expect(iyi.status).toBe(0)
    expect(iyi.stdout).toContain('KAYIT-KAPISI: GEÇTİ')
    const kotu = kos('gövde var ama bağlantı yok')
    expect(kotu.status).toBe(1)
    expect(kotu.stdout).toContain('::error title=PR kayıt kapısı')
    expect(kotu.stdout).toContain('KIRMIZI')
  })

  it('gövdedeki kabuk karakterleri komut olarak yorumlanmaz (ortam değişkeni yolu)', () => {
    const r = kos('$(exit 0) `id` ; rm -rf / \nFixes REC-5')
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('Fixes REC-5')
  })
})
