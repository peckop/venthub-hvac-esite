/**
 * INV-OLCUM-DEFTERI-1 · "Bu sorgu daha önce ölçüldü mü" komutunun ağsız çekirdeği (Kanban SEO-87; cetvel
 * docs/standards/dizin-sistemleri-standard.md D8).
 *
 * Kilitlenenler: sorgu anahtarı Türkçe harf ve noktalamaya dayanıklı; ölçüldü / eski / ölçülmedi kararı ve eşik sınırı;
 * motor süzgeci; benzer sorgu önerisi; geçersiz satır sessizce yutulmaz (sayılır); toplu içe aktarım çiftlemez; depo içi defter
 * yolu reddedilir (P6: arama verisi depoya girmez); yazılan satırı okuyup aynı kararı verir. Veri sahtedir.
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import {
  ESKI_ESIGI_GUN, defterAyristir, satirGecerliMi, satirYaz, sorguAnahtari, sorguOlculduMu, tarihAl, yeniOlanlar,
} from '../olcum-defteri.mjs'

const gun = (n: number) => `2026-11-${String(n).padStart(2, '0')}T08:00:00.000Z`
const NOW = Date.parse(gun(20))
const satir = (o: Record<string, unknown> = {}) => ({ tarih: gun(6), sorgu: 'alfa urun nedir', motor: 'google', kart: 'SEO-83', kaynak: 'seo83/', ...o })

describe('sorguAnahtari', () => {
  it('Türkçe harfleri sadeleştirir, noktalamayı atar, boşluğu tekilleştirir', () => {
    expect(sorguAnahtari('Örnek konu?')).toBe('ornek konu')
    expect(sorguAnahtari('  ALFA   urun  - nedir ')).toBe('alfa urun nedir')
    expect(sorguAnahtari('Işık ÇÖZÜM Ğ')).toBe('isik cozum g')
  })
  it('boş ya da yalnız noktalama boş anahtar verir', () => {
    expect(sorguAnahtari('')).toBe('')
    expect(sorguAnahtari(' ?!. ')).toBe('')
    expect(sorguAnahtari(undefined)).toBe('')
  })
})

describe('satirGecerliMi', () => {
  it('geçerli satırı kabul eder', () => { expect(satirGecerliMi(satir())).toBe(true) })
  it('zorunlu alan eksikse ya da değer geçersizse reddeder', () => {
    expect(satirGecerliMi(satir({ tarih: 'dün' }))).toBe(false)
    expect(satirGecerliMi(satir({ sorgu: ' ?? ' }))).toBe(false)
    expect(satirGecerliMi(satir({ motor: 'duckduckgo' }))).toBe(false)
    expect(satirGecerliMi(satir({ kart: '83' }))).toBe(false)
    expect(satirGecerliMi(satir({ kaynak: ' ' }))).toBe(false)
    expect(satirGecerliMi(satir({ tur: 'rastgele' }))).toBe(false)
    expect(satirGecerliMi(satir({ sayfaTipi: 'magaza' }))).toBe(false)
    expect(satirGecerliMi(satir({ sira: 0 }))).toBe(false)
    expect(satirGecerliMi(null)).toBe(false)
  })
})

describe('defterAyristir', () => {
  it('bozuk ve geçersiz satırı atlar ama SAYAR', () => {
    const metin = [JSON.stringify(satir()), '{bozuk', JSON.stringify(satir({ motor: 'x' })), '', JSON.stringify(satir({ sorgu: 'sessiz fan' }))].join('\n')
    const r = defterAyristir(metin)
    expect(r.satirlar).toHaveLength(2)
    expect(r.bozuk).toBe(2)
  })
  it('boş metin boş liste verir', () => { expect(defterAyristir('')).toEqual({ satirlar: [], bozuk: 0 }) })
})

describe('sorguOlculduMu', () => {
  const satirlar = [
    satir(),
    satir({ tarih: gun(2), sorgu: 'alfa urun nedir', motor: 'bing', kart: 'SEO-71' }),
    satir({ tarih: gun(6), sorgu: 'ornek konu nelerdir', kart: 'SEO-1', sira: 12 }),
  ]
  it('yeni kayıt varsa OLCULDU ve en yeni kayıt döner', () => {
    const r = sorguOlculduMu({ satirlar, sorgu: 'Alfa urun nedir?', simdi: NOW })
    expect(r.durum).toBe('OLCULDU')
    expect(r.son?.motor).toBe('google')
    expect(r.satirlar).toHaveLength(2)
    expect(r.yasGun).toBe(14)
  })
  it('yalnız gsc/trends kaydı varsa SERP ölçümü YOK diye işaretler', () => {
    const k = [satir({ motor: 'gsc', tur: 'gsc', sorgu: 'hangi ornek konu' })]
    const r = sorguOlculduMu({ satirlar: k, sorgu: 'hangi ornek konu', simdi: NOW })
    expect(r.durum).toBe('OLCULDU')
    expect(r.serpVar).toBe(false)
    expect(r.motorlar).toEqual(['gsc'])
    expect(sorguOlculduMu({ satirlar: [...k, satir({ sorgu: 'hangi ornek konu', tur: 'serp' })], sorgu: 'hangi ornek konu', simdi: NOW }).serpVar).toBe(true)
  })
  it('eşik sınırı: tam eşik günde hâlâ OLCULDU, bir gün fazlasında ESKI', () => {
    const t = Date.parse(gun(6)) + ESKI_ESIGI_GUN * 86400000
    expect(sorguOlculduMu({ satirlar, sorgu: 'alfa urun nedir', motor: 'google', simdi: t }).durum).toBe('OLCULDU')
    expect(sorguOlculduMu({ satirlar, sorgu: 'alfa urun nedir', motor: 'google', simdi: t + 86400000 }).durum).toBe('ESKI')
  })
  it('motor süzgeci: yalnız o motorun kaydına bakar', () => {
    expect(sorguOlculduMu({ satirlar, sorgu: 'alfa urun nedir', motor: 'yandex', simdi: NOW }).durum).toBe('OLCULMEDI')
    expect(sorguOlculduMu({ satirlar, sorgu: 'alfa urun nedir', motor: 'bing', simdi: NOW }).son?.kart).toBe('SEO-71')
  })
  it('tam eşleşme yoksa OLCULMEDI ve benzer sorguları önerir', () => {
    const r = sorguOlculduMu({ satirlar, sorgu: 'ornek konu kullanim alanlari', simdi: NOW })
    expect(r.durum).toBe('OLCULMEDI')
    expect(r.benzer).toContain('ornek konu nelerdir')
    expect(r.benzer).not.toContain('alfa urun nedir')
  })
  it('benzer yoksa boş liste, boş defterde OLCULMEDI', () => {
    expect(sorguOlculduMu({ satirlar: [], sorgu: 'hava perdesi', simdi: NOW })).toMatchObject({ durum: 'OLCULMEDI', benzer: [] })
  })
})

describe('yeniOlanlar ve satirYaz', () => {
  it('aynı gün+sorgu+motor+kart ikinci kez yazılmaz', () => {
    const mevcut = [satir()]
    const adaylar = [satir({ sorgu: 'Alfa urun nedir?' }), satir({ sorgu: 'yeni sorgu' }), satir({ sorgu: 'yeni sorgu' })]
    const yeni = yeniOlanlar(mevcut, adaylar)
    expect(yeni.map((s) => s.sorgu)).toEqual(['yeni sorgu'])
  })
  it('yazılan satır okununca aynı kararı verir (gidiş-dönüş)', () => {
    const y = satirYaz(satir({ sira: 4, sayfaTipi: 'bilgi', adres: 'https://venthub.com.tr/tr/x' }))
    const r = defterAyristir(y)
    expect(r.bozuk).toBe(0)
    expect(r.satirlar[0]).toMatchObject({ sira: 4, sayfaTipi: 'bilgi' })
    expect(tarihAl(r.satirlar[0].tarih)).toBe(Date.parse(gun(6)))
  })
})

describe('CLI güvenliği', () => {
  const betik = resolve(__dirname, '..', 'olcum-defteri.mjs')
  const kos = (args: string[]) => {
    try { return { kod: 0, cikti: execFileSync('node', [betik, ...args], { stdio: 'pipe' }).toString(), hata: '' } } catch (e) {
      const x = e as { status: number; stderr: Buffer }
      return { kod: x.status, cikti: '', hata: x.stderr.toString() }
    }
  }
  it('depo içi defter yolu reddedilir (exit 2)', () => {
    const r = kos(['--sor', 'ornek sorgu', '--defter', resolve(__dirname, 'olcumler.jsonl')])
    expect(r.kod).toBe(2)
    expect(r.hata).toContain('git deposunun içinde')
  })
  it('depo dışı geçici defterde kaydet → sor → toplu çiftlemez', () => {
    const d = join(mkdtempSync(join(tmpdir(), 'olcum-defteri-test-')), 'olcumler.jsonl')
    const k = kos(['--kaydet', '--sorgu', 'Ornek konu nelerdir?', '--motor', 'google', '--kart', 'SEO-1', '--kaynak', 'arsiv/', '--sira', '12', '--defter', d])
    expect(k.kod).toBe(0)
    expect(existsSync(d)).toBe(true)
    expect(readFileSync(d, 'utf8').trim().split('\n')).toHaveLength(1)
    const s = kos(['--sor', 'ornek konu nelerdir', '--defter', d])
    expect(s.kod).toBe(0)
    expect(s.cikti).toContain('ÖLÇÜLDÜ')
    expect(kos(['--sor', 'tamamen yeni sorgu', '--defter', d]).cikti).toContain('ÖLÇÜLMEDİ')
  })
  it('geçersiz kaydet ve geçersiz motor exit 2', () => {
    const d = join(mkdtempSync(join(tmpdir(), 'olcum-defteri-test-')), 'olcumler.jsonl')
    expect(kos(['--kaydet', '--sorgu', 'x', '--motor', 'x', '--kart', 'SEO-1', '--kaynak', 'a', '--defter', d]).kod).toBe(2)
    expect(kos(['--kaydet', '--sorgu', 'x', '--motor', 'google', '--kart', '1', '--kaynak', 'a', '--defter', d]).kod).toBe(2)
    expect(kos(['--sor', 'x', '--motor', 'duckduckgo', '--defter', d]).kod).toBe(2)
    expect(existsSync(d)).toBe(false)
  })
})
