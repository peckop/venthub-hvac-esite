/**
 * INV-DIZIN-ETKI-1 · Etki satırı (SEO-147): 'degisim' satırı isteğe bağlı etki alanları taşır, eski satırlar aynen geçerlidir.
 *
 * Kilitlenenler: eski degisim satırı geçerli kalır (geriye uyum); yeni alanlar biçimce denetlenir ve BOZUK alan satırı geçersiz yapar (atlanan sayılır);
 * satirYaz etki alanlarını sabit sırayla yazar, null/undefined alanı yazmaz, degisim DIŞI satıra etki alanı sızdırmaz; `git-gecmisi` satırı değişen
 * listesine (karar tablosuna) GİRMEZ; --kaydet --pr/--hipotez yalnız degisim'de ve biçimi doğrulanarak yazılır. Veri sahtedir (P6).
 */
import { execFileSync } from 'node:child_process'
import { existsSync,mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect,it } from 'vitest'

import { defterAyristir, degisenDefterden, ETKI_ALANLARI, etkiAlanlariGecerliMi, GIT_GECMISI, hareketGecerliMi, HUKUMLER, kaydetArgumanlariCoz, satirYaz,VADE_GUNLERI } from '../dizin-takip.mjs'

const S = 'https://venthub.com.tr'
const A = `${S}/tr/bilgi-merkezi/ornek-yazi`
const eski = { tarih: '2026-11-17T12:35:06.326Z', motor: 'google', eylem: 'degisim', adres: A, kaynak: 'kaydet' }
const etkili = {
  ...eski, kart: 'BLG-79', pr: 2594, commit: '5fd32b5', hipotez: 'Başlık sorguyla hizalandı; sıra iyileşir',
  once: { kaynak: 'gsc', tarih: '2026-11-16', gorunme: 'gorundu', sira: 12.4 },
  vadeler: { 3: null, 7: { kaynak: 'gsc', tarih: '2026-11-24', gorunme: 'gorundu', sira: 8 }, 14: null, 28: null },
  kontrol: [`${S}/tr/bilgi-merkezi/baska-yazi`], cakisan: 'Aynı adreste ±7 günde 1 başka değişiklik var (2026-11-18 BLG-82 #2611); etki bu değişiklikten ayrıştırılamıyor.',
  hukum: 'ayrilamiyor', hukumNotu: 'Aynı adreste ±7 günde 1 başka değişiklik var; etki ayrıştırılamıyor.',
}

describe('geriye uyum: eski satırlar aynen geçerli', () => {
  it('etki alanı olmayan degisim satırı geçerli; alan listesi ve sabitler beklenen', () => {
    expect(hareketGecerliMi(eski)).toBe(true)
    expect(etkiAlanlariGecerliMi(eski)).toBe(true)
    expect(VADE_GUNLERI).toEqual([3, 7, 14, 28])
    expect(HUKUMLER).toEqual(['olumlu', 'olumsuz', 'notr', 'ayrilamiyor', 'bekliyor'])
    expect(ETKI_ALANLARI).toEqual(['pr', 'commit', 'hipotez', 'once', 'vadeler', 'kontrol', 'cakisan', 'hukum', 'hukumNotu'])
  })
  it('eski satır yazılınca baytı değişmez (etki alanı eklenmez)', () => {
    const ham = '{"tarih":"2026-11-17T12:35:06.326Z","motor":"google","eylem":"degisim","adres":"' + A + '","kaynak":"kaydet"}'
    expect(satirYaz(eski)).toBe(ham)
  })
  it('degisim olmayan satırlar etkiden etkilenmez: istek, gorunme, olcum aynen geçerli', () => {
    expect(hareketGecerliMi({ tarih: '2026-11-17T12:35:06Z', motor: 'google', eylem: 'istek', adres: A, kart: 'SEO-1' })).toBe(true)
    expect(hareketGecerliMi({ tarih: '2026-11-17T12:35:06Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc: 'gorundu' })).toBe(true)
    // degisim dışında etki alanı DENETLENMEZ (kart biçimi eskiden de serbestti)
    expect(etkiAlanlariGecerliMi({ eylem: 'istek', kart: 'küçük-harf', hukum: 'harika' })).toBe(true)
  })
})

describe('yeni alanlar: biçim denetimi', () => {
  it('tam dolu etki satırı geçerli', () => { expect(hareketGecerliMi(etkili)).toBe(true) })
  it('null alanlar "bilinmiyor" demektir ve geçerlidir', () => {
    expect(hareketGecerliMi({ ...eski, kart: null, pr: null, once: null, vadeler: null, kontrol: null, cakisan: null, hukum: null })).toBe(true)
  })
  it('bozuk alan satırı geçersiz yapar (sessiz yutma yok: defterAyristir atlananı sayar)', () => {
    const kotuler: Array<Record<string, unknown>> = [
      { kart: 'blg-79' }, { kart: 'BLG79' }, { pr: 0 }, { pr: -3 }, { pr: 25.5 }, { pr: '2594' }, { commit: 'XYZ' }, { commit: 'abc' }, { hipotez: '   ' }, { hipotez: 5 },
      { once: 'iyi' }, { once: [] }, { vadeler: [] }, { vadeler: { 5: null } }, { vadeler: { 3: 5 } }, { vadeler: { 3: 'iyi' } },
      { kontrol: 'bir' }, { kontrol: [1, 2] }, { cakisan: 5 }, { hukum: 'harika' }, { hukum: 'OLUMLU' }, { hukumNotu: 5 },
    ]
    for (const kotu of kotuler) expect(hareketGecerliMi({ ...eski, ...kotu }), JSON.stringify(kotu)).toBe(false)
    const metin = [satirYaz(eski), JSON.stringify({ ...eski, hukum: 'harika' }), satirYaz(etkili)].join('\n')
    const r = defterAyristir(metin)
    expect(r.hareketler).toHaveLength(2)
    expect(r.atlanan).toBe(1)
  })
  it('her hüküm değeri geçerli', () => { for (const h of HUKUMLER) expect(hareketGecerliMi({ ...eski, hukum: h })).toBe(true) })
})

describe('satirYaz: sabit sıra, boş alan yazılmaz, sızıntı yok', () => {
  it('etki alanları taban alanlardan sonra bu sırayla yazılır ve geri okununca aynıdır', () => {
    const ham = satirYaz(etkili)
    const anahtarlar = Object.keys(JSON.parse(ham))
    expect(anahtarlar).toEqual(['tarih', 'motor', 'eylem', 'adres', 'kaynak', 'kart', 'pr', 'commit', 'hipotez', 'once', 'vadeler', 'kontrol', 'cakisan', 'hukum', 'hukumNotu'])
    expect(JSON.parse(ham).vadeler).toEqual({ 3: null, 7: etkili.vadeler[7], 14: null, 28: null })
    const geri = defterAyristir(ham).hareketler[0]
    expect(satirYaz(geri)).toBe(ham)
  })
  it('null ve undefined alan yazılmaz', () => {
    const ham = JSON.parse(satirYaz({ ...eski, kart: 'BLG-1', pr: null, once: null, cakisan: undefined, hukum: 'bekliyor' }))
    expect(ham).toMatchObject({ kart: 'BLG-1', hukum: 'bekliyor' })
    expect('pr' in ham).toBe(false)
    expect('once' in ham).toBe(false)
    expect('cakisan' in ham).toBe(false)
  })
  it('degisim olmayan satıra etki alanı sızmaz', () => {
    const ham = JSON.parse(satirYaz({ tarih: '2026-11-17T12:35:06Z', motor: 'google', eylem: 'istek', adres: A, hukum: 'olumlu', pr: 5, once: { x: 1 } }))
    for (const k of ETKI_ALANLARI) expect(k in ham, k).toBe(false)
  })
})

describe('degisenDefterden: git-gecmisi satırı karar tablosunu kaydırmaz', () => {
  it('git-gecmisi satırı yok sayılır; kaydet/degisen-dosyasi satırı sayılır; adres başına en yeni', () => {
    const h = [
      { ...eski, tarih: '2026-11-17T12:35:06Z' },
      { ...eski, tarih: '2026-11-20T09:00:00Z', kaynak: GIT_GECMISI, commit: 'abcdef1' },
      { ...eski, adres: `${S}/tr/bilgi-merkezi/yalniz-git`, tarih: '2026-11-21T09:00:00Z', kaynak: GIT_GECMISI },
    ]
    const d = degisenDefterden(h)
    expect(d.get(A)).toBe(Date.parse('2026-11-17T12:35:06Z'))
    expect(d.has(`${S}/tr/bilgi-merkezi/yalniz-git`)).toBe(false)
  })
})

describe('--kaydet --pr/--hipotez', () => {
  const c = (...a: string[]) => kaydetArgumanlariCoz(['--kaydet', ...a])
  it('degisim için pr ve hipotez çözülür; kart ve neden mevcut bayraklardır (kopya yok)', () => {
    const r = c('google', 'degisim', A, '--kart', 'SEO-147', '--pr', '2690', '--hipotez', 'başlık ayırt edici oldu', '--neden', 'BLG-91')
    expect(r).toMatchObject({ motor: 'google', eylem: 'degisim', adresler: [A], kart: 'SEO-147', neden: 'BLG-91', pr: 2690, hipotez: 'başlık ayırt edici oldu' })
  })
  it('bayrak yoksa pr ve hipotez null', () => { expect(c('google', 'degisim', A)).toMatchObject({ pr: null, hipotez: null }) })
  it('--pr ve --hipotez yalnız degisim eyleminde; başka eylemde HATA (sessizce düşmez)', () => {
    expect(c('google', 'istek', A, '--pr', '5')).toHaveProperty('hata')
    expect(c('bing', 'gonderim', A, '--hipotez', 'x')).toHaveProperty('hata')
  })
  it('--pr pozitif tam sayı olmalı; --hipotez metin ister', () => {
    for (const kotu of ['0', '-4', 'abc', '12.5', '007x']) expect(c('google', 'degisim', A, '--pr', kotu), kotu).toHaveProperty('hata')
    expect(c('google', 'degisim', A, '--pr')).toHaveProperty('hata')
    expect(c('google', 'degisim', A, '--hipotez')).toHaveProperty('hata')
    expect(c('google', 'degisim', A, '--hipotez', '--kart', 'SEO-1')).toHaveProperty('hata')
  })
  it('değerleri fazla argüman sayılmaz', () => {
    expect(c('google', 'degisim', A, '--pr', '2690', '--hipotez', 'tek tırnaklı metin')).not.toHaveProperty('hata')
    expect(c('google', 'degisim', A, '--hipotez', 'iki', 'kelime')).toHaveProperty('hata')
  })
})

describe('CLI --kaydet degisim uçtan uca (depo dışı klasör)', () => {
  const betik = resolve(__dirname, '..', 'dizin-takip.mjs')
  const kos = (args: string[]) => {
    try { return { kod: 0, hata: '', cikti: execFileSync(process.execPath, [betik, ...args], { encoding: 'utf8', stdio: 'pipe', env: { ...process.env, DIZIN_TAKIP_YEDEK2: '' } }) } } catch (e) {
      const x = e as { status: number; stderr: Buffer | string }
      return { kod: x.status, hata: String(x.stderr), cikti: '' }
    }
  }
  it('kart, pr, hipotez satıra yazılır ve defter geri okunur', () => {
    const d = mkdtempSync(join(tmpdir(), 'dizin-etki-kaydet-'))
    try {
      const defter = join(d, 'hareketler.jsonl')
      const r = kos(['--kaydet', 'google', 'degisim', A, '--kart', 'SEO-147', '--pr', '2690', '--hipotez', 'başlık ayırt edici oldu', '--hareket', defter])
      expect(r.kod, r.hata).toBe(0)
      const satir = JSON.parse(readFileSync(defter, 'utf8').trim())
      expect(satir).toMatchObject({ eylem: 'degisim', adres: A, kart: 'SEO-147', pr: 2690, hipotez: 'başlık ayırt edici oldu' })
      expect(defterAyristir(readFileSync(defter, 'utf8')).hareketler).toHaveLength(1)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
  it('geçersiz --pr çıkış 2 verir ve deftere yazmaz', () => {
    const d = mkdtempSync(join(tmpdir(), 'dizin-etki-kaydet-'))
    try {
      const defter = join(d, 'hareketler.jsonl')
      const r = kos(['--kaydet', 'google', 'degisim', A, '--pr', 'x', '--hareket', defter])
      expect(r.kod).toBe(2)
      expect(existsSync(defter)).toBe(false)
    } finally { rmSync(d, { recursive: true, force: true }) }
  })
})
