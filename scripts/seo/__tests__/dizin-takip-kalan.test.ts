/**
 * INV-DIZIN-KALAN-1 (SEO-118): kalan liste elle tutulmaz, değişen liste defterden türer.
 * Veri sahtedir (P6: gerçek arama verisi yok).
 */
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { EYLEMLER, YANDEX_ISTEK_PENCERESI_MS, defterAyristir, degisenBirlestir, degisenDefterden, hareketGecerliMi, kalanListe, karar, olculemediSayisi, sonHareket } from '../dizin-takip.mjs'

const SITE = 'https://venthub.com.tr'
const A = `${SITE}/tr/bilgi-merkezi/yazi-a`
const B = `${SITE}/tr/bilgi-merkezi/yazi-b`
const URUN = `${SITE}/tr/products/urun-x`
const KAT = `${SITE}/tr/category/kat-y`

const satir = (adres: string, google: string, yandex = 'TAMAM') => ({ adres, google: { durum: google }, bing: { durum: 'TAMAM' }, yandex: { durum: yandex }, indexnow: { durum: 'TAMAM' } })

describe('INV-DIZIN-KALAN-1 · kalanListe', () => {
  const tablo = [satir(URUN, 'YAP'), satir(B, 'YAP'), satir(KAT, 'TEKRAR'), satir(A, 'YAP'), satir(`${SITE}/tr/x`, 'TAMAM'), satir(`${SITE}/tr/y`, 'BEKLE')]
  it('yalnız YAP/TEKRAR; bilgi merkezi yazıları önce, sonra alfabetik', () => {
    expect(kalanListe(tablo, 'google')).toEqual([A, B, KAT, URUN])
  })
  it('sınır ilk N adresi verir; motor başka olunca başka küme', () => {
    expect(kalanListe(tablo, 'google', 2)).toEqual([A, B])
    expect(kalanListe(tablo, 'bing')).toEqual([])
  })
  it('yandex kararı ayrı okunur', () => {
    expect(kalanListe([satir(A, 'TAMAM', 'YAP')], 'yandex')).toEqual([A])
  })
})

describe('INV-DIZIN-KALAN-1 · degisim eylemi', () => {
  it('geçerli yalnız google motoruyla; istek/gonderim hareketini bozmaz', () => {
    expect(EYLEMLER).toContain('degisim')
    expect(hareketGecerliMi({ tarih: '2026-11-17T09:00:00Z', motor: 'google', eylem: 'degisim', adres: A })).toBe(true)
    expect(hareketGecerliMi({ tarih: '2026-11-17T09:00:00Z', motor: 'bing', eylem: 'degisim', adres: A })).toBe(false)
    const h = [
      { tarih: '2026-11-10T09:00:00Z', motor: 'google', eylem: 'istek', adres: A },
      { tarih: '2026-11-17T09:00:00Z', motor: 'google', eylem: 'degisim', adres: A },
    ]
    expect(sonHareket(h, 'google', A)).toBe(Date.parse('2026-11-10T09:00:00Z'))
  })
  it('degisenDefterden adres başına en yeni tarihi verir; birleştirme de en yeniyi seçer', () => {
    const h = [
      { tarih: '2026-11-14T00:00:00Z', motor: 'google', eylem: 'degisim', adres: A },
      { tarih: '2026-11-17T00:00:00Z', motor: 'google', eylem: 'degisim', adres: A },
      { tarih: '2026-11-16T00:00:00Z', motor: 'google', eylem: 'istek', adres: B },
    ]
    const d = degisenDefterden(h)
    expect([...d.keys()]).toEqual([A])
    expect(d.get(A)).toBe(Date.parse('2026-11-17T00:00:00Z'))
    const m = degisenBirlestir(new Map([[A, 1], [B, 5]]), d)
    expect(m.get(A)).toBe(Date.parse('2026-11-17T00:00:00Z'))
    expect(m.get(B)).toBe(5)
  })
  it('defter ayrıştırma degisim satırını geçerli sayar', () => {
    const { hareketler, atlanan } = defterAyristir(`${JSON.stringify({ tarih: '2026-11-17T00:00:00Z', motor: 'google', eylem: 'degisim', adres: A })}\n`)
    expect(hareketler).toHaveLength(1)
    expect(atlanan).toBe(0)
  })
})

describe('INV-DIZIN-KALAN-1 · --degisen-ice-aktar (uçtan uca, depo dışı klasör)', () => {
  it('dosyadaki adresler deftere değisim olarak bir kez geçer; ikinci koşu yeni yazmaz', () => {
    const d = mkdtempSync(join(tmpdir(), 'dizin-kalan-'))
    const defter = join(d, 'hareketler.jsonl')
    const dosya = join(d, 'degisen-adresler.txt')
    writeFileSync(defter, '')
    writeFileSync(dosya, `${A} 2026-11-14T16:07:42Z\n${B} 2026-11-16T19:54:49Z\nbozuk satir\n`)
    const betik = resolve(__dirname, '../dizin-takip.mjs')
    const kos = () => execFileSync(process.execPath, [betik, '--degisen-ice-aktar', '--hareket', defter, '--degisen', dosya], { encoding: 'utf8' })
    expect(kos()).toContain('yeni 2')
    expect(kos()).toContain('yeni 0')
    const satirlar = readFileSync(defter, 'utf8').trim().split('\n')
    expect(satirlar).toHaveLength(2)
    expect(JSON.parse(satirlar[0])).toMatchObject({ motor: 'google', eylem: 'degisim', adres: A })
  })
})

describe('INV-DIZIN-KALAN-1 · ölçülemeyen adres boş liste sayılmaz', () => {
  it('olculemediSayisi seçilen motorun OLCULEMEDI adresini sayar', () => {
    const t = [{ ...satir(A, 'OLCULEMEDI'), bing: { durum: 'TAMAM' } }, satir(B, 'YAP'), satir(KAT, 'OLCULEMEDI')]
    expect(olculemediSayisi(t, 'google')).toBe(2)
    expect(olculemediSayisi(t, 'bing')).toBe(0)
    expect(kalanListe(t, 'google')).toEqual([B])
  })
})

describe('INV-DIZIN-KALAN-1 · CLI bağımsız değişken hataları ağa gitmeden exit 2', () => {
  const betik = resolve(__dirname, '../dizin-takip.mjs')
  const kos = (args: string[]) => {
    try { execFileSync(process.execPath, [betik, ...args], { encoding: 'utf8', stdio: 'pipe' }); return 0 } catch (e) { return (e as { status?: number }).status ?? -1 }
  }
  it('değersiz ya da geçersiz --kalan, bozuk --sinir', () => {
    expect(kos(['--kalan'])).toBe(2)
    expect(kos(['--kalan', 'baska'])).toBe(2)
    expect(kos(['--kalan', '--sinir', '3'])).toBe(2)
    expect(kos(['--kalan', 'google', '--sinir', '0'])).toBe(2)
    expect(kos(['--kalan', 'google', '--sinir', 'x'])).toBe(2)
  })
})

describe('INV-DIZIN-KALAN-1 · Yandex bekleyen istek penceresi', () => {
  const SAAT = 3600000
  const simdi = Date.parse('2026-11-17T17:00:00Z')
  const ortak = { motor: 'yandex', lastmod: '2026-11-10T00:00:00Z', simdi }
  const degisen = '2026-11-17T11:00:00Z'
  it('istek değişimden önce, pencere içinde: BEKLE (ikinci istek boşa gider)', () => {
    const k = karar({ ...ortak, degisen, sonHareket: simdi - 8 * SAAT })
    expect(k.durum).toBe('BEKLE')
    expect(k.neden).toContain('yeni hâli alır')
  })
  it('pencere dışında (22 saat sonra) ya da istek yoksa eski kural: YAP', () => {
    expect(YANDEX_ISTEK_PENCERESI_MS).toBe(22 * SAAT)
    expect(karar({ ...ortak, degisen, sonHareket: simdi - 23 * SAAT }).durum).toBe('YAP')
    expect(karar({ ...ortak, degisen, sonHareket: null }).durum).toBe('YAP')
  })
  it('istek değişimden SONRAysa eski yol (BEKLE, eşik içinde); Bing ve Google etkilenmez', () => {
    expect(karar({ ...ortak, degisen, sonHareket: simdi - 2 * SAAT }).durum).toBe('BEKLE')
    expect(karar({ ...ortak, motor: 'bing', degisen, sonHareket: simdi - 8 * SAAT }).durum).toBe('YAP')
    expect(karar({ ...ortak, motor: 'google', degisen, sonHareket: simdi - 8 * SAAT }).durum).toBe('YAP')
  })
})
