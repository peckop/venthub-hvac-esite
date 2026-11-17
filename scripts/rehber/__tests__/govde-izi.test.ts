/**
 * INV-REHBER-GOVDE-IZI-1 · "gövde değişti, güncelleme tarihi değişmedi" kapısı (BLG-76, OPS isteği 12 Kasım 2026;
 * rehber-yazisi-standard.md R10.6 madde 9).
 *
 * Doğuran olay: BLG-13'te frekans/radyal, BLG-62'de ısı geri kazanım yazısının `guncellemeTarihi` alanı içerikle birlikte
 * güncellenmedi; sitemap `lastmod` ve Article `dateModified` eski kaldı, ayrı lastmod PR'ı gerekti (iki kez).
 * Burada sınanan: (1) GERÇEK yazilar.ts'in izi `govde-izleri.json` ile uyuşur (kapının kendisi, CI'da bu yüzden kırmızı olur);
 * (2) SABOTAJ kolları: iz değişti + tarih aynı → TARIH_UNUTULDU; iz değişti + tarih yeni → IZ_ESKI; kayıtsız yazı → KAYIT_YOK;
 * kontrol sökülürse (denetim boş döner) bu kollar kırmızı olur; yorum/boşluk değişikliği izi değiştirmez.
 * Ağ yok.
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ayniGunAyikla, bugunIstanbul, govdeIziDenetle, iziHesapla, izleriOku, izleriSerilestir, yazilariOku } from '../govde-izi.mjs'

const KOK = resolve(__dirname, '..', '..', '..')
const kaynak = readFileSync(join(KOK, 'src/data/bilgiMerkezi/yazilar.ts'), 'utf8')
const yazilar = yazilariOku(kaynak) as Array<{ kimlik: string; h1: string; govde: string; ozet: string; guncellemeTarihi: string }>
const izler = izleriOku() as Record<string, { iz: string; tarih: string }>

/** Kayıtlı izleri gerçek yazılardan türetir (sabotaj girdileri için sağlam bir başlangıç). */
function temizIzler() {
  return Object.fromEntries(yazilar.map((y) => [y.kimlik, { iz: iziHesapla(y), tarih: y.guncellemeTarihi }]))
}

describe('INV-REHBER-GOVDE-IZI-1 · gerçek yazilar.ts', () => {
  it('iz dosyası var ve her yayındaki yazı için kayıt bulunur', () => {
    expect(izler, 'govde-izleri.json yok: node scripts/rehber/govde-izi.mjs --taban').not.toBeNull()
    expect(yazilar.length).toBeGreaterThan(0)
    for (const y of yazilar) expect(izler[y.kimlik], `${y.kimlik} iz dosyasında yok`).toBeDefined()
  })

  it('gerçek yazıların izi kayıtla uyuşur (gövde değişip tarih unutulduysa burada kırmızı olur)', () => {
    const sorunlar = govdeIziDenetle(yazilar, izler)
    expect(sorunlar.map((s: { ileti: string }) => s.ileti)).toEqual([])
  })

  it('iz dosyasındaki her tarih ISO biçimli, iz 16 onaltılı hane', () => {
    for (const [kimlik, k] of Object.entries(izler)) {
      expect(k.tarih, kimlik).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(k.iz, kimlik).toMatch(/^[0-9a-f]{16}$/)
    }
  })

  it('iz dosyasında yazilar.ts\'te olmayan (silinmiş) yazı kaydı kalmaz', () => {
    const kimlikler = new Set(yazilar.map((y) => y.kimlik))
    expect(Object.keys(izler).filter((k) => !kimlikler.has(k))).toEqual([])
  })

  it('iz dosyası serileştirmeyle bire bir üretilir (satır başına bir yazı, sıralı): elle bozulursa kırmızı', () => {
    const metin = readFileSync(join(KOK, 'src/lib/bilgiMerkezi/__tests__/govde-izleri.json'), 'utf8').replace(/\r\n/g, '\n')
    expect(metin).toBe(izleriSerilestir(izler))
  })
})

describe('INV-REHBER-GOVDE-IZI-1 · sabotaj kolları (kontrol sökülürse bu testler kırmızı olur)', () => {
  it('SABOTAJ 1: gövde değişti, tarih AYNI → TARIH_UNUTULDU', () => {
    const [ilk, ...geri] = yazilar
    const bozuk = [{ ...ilk, govde: `${ilk.govde}\nYeni cümle.` }, ...geri]
    const sorunlar = govdeIziDenetle(bozuk, temizIzler())
    expect(sorunlar).toHaveLength(1)
    expect(sorunlar[0].tur).toBe('TARIH_UNUTULDU')
    expect(sorunlar[0].kimlik).toBe(ilk.kimlik)
  })

  it('SABOTAJ 2: H1 değişti (gövde aynı), tarih AYNI → TARIH_UNUTULDU (başlık-yalnız revizyon dahil)', () => {
    const [ilk, ...geri] = yazilar
    const bozuk = [{ ...ilk, h1: `${ilk.h1} ek` }, ...geri]
    expect(govdeIziDenetle(bozuk, temizIzler()).map((s: { tur: string }) => s.tur)).toEqual(['TARIH_UNUTULDU'])
  })

  it('SABOTAJ 3: özet (meta) değişti, tarih AYNI → TARIH_UNUTULDU', () => {
    const [ilk, ...geri] = yazilar
    const bozuk = [{ ...ilk, ozet: `${ilk.ozet} Yeni meta.` }, ...geri]
    expect(govdeIziDenetle(bozuk, temizIzler()).map((s: { tur: string }) => s.tur)).toEqual(['TARIH_UNUTULDU'])
  })

  it('gövde değişti ve tarih de ilerledi ama iz dosyası güncellenmedi → IZ_ESKI (kırmızı, düzeltme: --yaz)', () => {
    const [ilk, ...geri] = yazilar
    const guncel = [{ ...ilk, govde: `${ilk.govde}\nYeni cümle.`, guncellemeTarihi: '2099-01-01' }, ...geri]
    const sorunlar = govdeIziDenetle(guncel, temizIzler())
    expect(sorunlar.map((s: { tur: string }) => s.tur)).toEqual(['IZ_ESKI'])
  })

  it('iz dosyasında kaydı olmayan yeni yazı → KAYIT_YOK', () => {
    const [ilk] = yazilar
    const yeni = { ...ilk, kimlik: 'yeni-yazi-ornegi' }
    const sorunlar = govdeIziDenetle([...yazilar, yeni], temizIzler())
    expect(sorunlar.map((s: { tur: string; kimlik: string }) => `${s.tur}:${s.kimlik}`)).toEqual(['KAYIT_YOK:yeni-yazi-ornegi'])
  })

  it('yalnız boşluk/satır sonu değişikliği izi değiştirmez (yanlış pozitif yok)', () => {
    const [ilk, ...geri] = yazilar
    const bosluk = [{ ...ilk, govde: ilk.govde.replace(/ /g, '  ').replace(/\n/g, '\n\n') }, ...geri]
    expect(govdeIziDenetle(bosluk, temizIzler())).toEqual([])
  })

  it('yorum satırı, ürün listesi ve ilgili alanı izlenen metnin dışındadır: yazilar.ts yorum eklenince iz aynı kalır', () => {
    const yorumlu = kaynak.replace(/(\n\s{4}kimlik: ')/, '\n    // örnek yorum satırı (izi etkilemez)$1')
    expect(yorumlu).not.toBe(kaynak)
    const yeni = yazilariOku(yorumlu) as typeof yazilar
    expect(yeni.map((y) => iziHesapla(y))).toEqual(yazilar.map((y) => iziHesapla(y)))
  })

  it('kontrol sökülürse sabotaj kolları kırmızı olur: denetim işlevi gerçekten sorun üretiyor (boş dönmüyor)', () => {
    const [ilk, ...geri] = yazilar
    const bozuk = [{ ...ilk, govde: `${ilk.govde}\nX` }, ...geri]
    expect(govdeIziDenetle(bozuk, temizIzler()).length).toBeGreaterThan(0)
  })
})

describe('INV-REHBER-GOVDE-IZI-1 · komut satırı', () => {
  it('denetim bayraksız koşar, temizken çıkış 0', () => {
    const r = spawnSync(process.execPath, [join(KOK, 'scripts/rehber/govde-izi.mjs')], { encoding: 'utf8' })
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toContain('temiz')
  })

  it('bilinmeyen bayrak çıkış 2 verir', () => {
    const r = spawnSync(process.execPath, [join(KOK, 'scripts/rehber/govde-izi.mjs'), '--bilinmeyen'], { encoding: 'utf8' })
    expect(r.status).toBe(2)
  })

  it('--taban iz dosyası varken reddeder (geçmişi sıfırlamaz)', () => {
    const r = spawnSync(process.execPath, [join(KOK, 'scripts/rehber/govde-izi.mjs'), '--taban'], { encoding: 'utf8' })
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('zaten var')
  })
})

describe('INV-REHBER-GOVDE-IZI-1 · aynı gün ikinci değişiklik (--ayni-gun, BLG-79)', () => {
  const [ilk, ...geri] = yazilar
  const bozuk = [{ ...ilk, govde: `${ilk.govde}
Yeni cümle.` }, ...geri]
  const sorunlar = govdeIziDenetle(bozuk, temizIzler())

  it('bayraksız (bugun = null): TARIH_UNUTULDU reddedilir', () => {
    expect(ayniGunAyikla(sorunlar, bozuk, null).map((s: { kimlik: string }) => s.kimlik)).toEqual([ilk.kimlik])
  })

  it('bayraklı ve yazının tarihi BUGÜN: kabul edilir (liste boş)', () => {
    expect(ayniGunAyikla(sorunlar, bozuk, ilk.guncellemeTarihi)).toEqual([])
  })

  it('SABOTAJ: bayraklı ama yazının tarihi bugün DEĞİL: yine reddedilir', () => {
    expect(ayniGunAyikla(sorunlar, bozuk, '2099-01-01').map((s: { kimlik: string }) => s.kimlik)).toEqual([ilk.kimlik])
  })

  it('bugunIstanbul gün sınırını İstanbul saatiyle hesaplar (gece yarısı: 23:59 aynı gün, 00:01 ertesi gün)', () => {
    // İstanbul UTC+3: 17 Kasım 23:59 TSİ = 20:59Z; 18 Kasım 00:01 TSİ = 21:01Z (UTC günü hâlâ 17).
    expect(bugunIstanbul(new Date('2026-11-17T20:59:00Z'))).toBe('2026-11-17')
    expect(bugunIstanbul(new Date('2026-11-17T21:01:00Z'))).toBe('2026-11-18')
    expect(bugunIstanbul(new Date('2026-11-17T12:00:00Z'))).toBe('2026-11-17')
  })

  it('CI ve paket betikleri --ayni-gun bayrağını kullanmaz (denetim hep bayraksız koşar)', () => {
    const dosyalar = ['package.json', ...readdirSync(join(KOK, '.github/workflows')).map((d) => join('.github/workflows', d))]
    for (const d of dosyalar) expect(readFileSync(join(KOK, d), 'utf8'), d).not.toContain('--ayni-gun')
  })

  it('--ayni-gun tek başına (--yaz olmadan) çıkış 2 verir', () => {
    const r = spawnSync(process.execPath, [join(KOK, 'scripts/rehber/govde-izi.mjs'), '--ayni-gun'], { encoding: 'utf8' })
    expect(r.status).toBe(2)
  })
})
