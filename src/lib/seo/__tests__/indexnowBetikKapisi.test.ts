import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
  adresAnahtari,
  tabanAdresleriniOku,
  yayinKapisi,
  YENI_AZAMI,
  yeniKipPlani,
} from '../../../../scripts/seo/yayin-kapisi.mjs'

/**
 * REC-405 / karar 164 A — toplu IndexNow betiği adres şeması bayrağı KAPALIYKEN koşmayı reddeder (K4).
 * Ölçüm 2026-09-29: canlı sitemap 87 adres, süzgeçsiz koşum 78'ini yayında değişecek adresle bildirirdi.
 *
 * SEO-27 / karar 327 (OPS 2026-10-09; yayın günü runbook'u §5.0) — `--yalniz-yeni <eski-adresler.json>` kipi: Pazar günü
 * yalnız ADRESİ DEĞİŞEN TR sayfalar bildirilir = yeni site haritası − taban site haritası. Kip bayrağı AÇIK ister (kapıyı aşmaz).
 */

const KOK = resolve(__dirname, '../../../..')
const FEATURES_KAPALI = 'export const ADRES_SEMASI_K3B = false\n'
const FEATURES_ACIK = 'export const ADRES_SEMASI_K3B = true\n'

describe('REC-405 · toplu IndexNow yayın kapısı', () => {
  it('bayrak KAPALI → izin yok, sebep K4/164 A yazılı', () => {
    const k = yayinKapisi('export const ADRES_SEMASI_K3B = false\n')
    expect(k.izin).toBe(false)
    if (k.izin) return // tip daraltma: yukarıdaki beklenti zaten düşürür
    expect(k.sebep).toContain('ADRES_SEMASI_K3B')
    expect(k.sebep).toContain('K4')
  })

  it('bayrak AÇIK → izin var', () => {
    expect(yayinKapisi('export const ADRES_SEMASI_K3B = true\n')).toEqual({ izin: true })
  })

  it('bayrak satırı bulunamazsa SESSİZCE izin vermez, hata fırlatır', () => {
    expect(() => yayinKapisi('export const BASKA = true\n')).toThrow(/ADRES_SEMASI_K3B/)
  })

  it('betik bayrak kapalıyken ağa/anahtara bakmadan DURUR (gerçek dosya, çıkış kodu 1)', () => {
    const features = readFileSync(resolve(KOK, 'src/config/features.ts'), 'utf8')
    if (yayinKapisi(features).izin) return // bayrak açıldıysa bu kol geçerli değil (yayın günü)
    const r = spawnSync(process.execPath, ['scripts/seo/indexnow-bildir.mjs', '--kuru'], {
      cwd: KOK,
      encoding: 'utf8',
      env: { ...process.env, INDEXNOW_KEY: 'test-anahtar' },
      timeout: 20000,
    })
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('DURDU')
    expect(r.stderr).toContain('ADRES_SEMASI_K3B')
    // sitemap okunmadı: kapı ağdan ÖNCE
    expect(r.stdout).not.toContain('sitemap okunuyor')
  })
})

// ───────────────────────────── SEO-27 · yeni adres kipi: saf mantık ─────────────────────────────

const BASE = 'https://venthub.com.tr'
// Pazar'dan önceki (taban) ve sonraki harita: ana sayfa + bilgi merkezi değişmez; ürün listesi, aile, kategori, marka adresi değişir.
const TABAN = [
  `${BASE}/tr`,
  `${BASE}/tr/bilgi-merkezi`,
  `${BASE}/tr/products`,
  `${BASE}/tr/products/avens-bvu-ls`,
  `${BASE}/tr/category/hava-perdeleri`,
  `${BASE}/tr/brands/avens`,
]
const YENI_HARITA = [
  `${BASE}/tr`,
  `${BASE}/tr/bilgi-merkezi`,
  `${BASE}/tr/urunler`,
  `${BASE}/tr/urun/avens-bvu-ls`,
  `${BASE}/tr/kategori/hava-perdeleri`,
  `${BASE}/tr/markalar/avens`,
]
const BEKLENEN_YENI = YENI_HARITA.slice(2)

type Plan = { izin: true; yeni: string[]; ayni: string[] } | { izin: false; sebep: string }

/** Süzgeç özelliği: bildirilecek kümede tabanda zaten bulunan hiçbir adres olmamalı. İhlal eden adresleri döner. */
function suzgecIhlalleri(plan: Plan, taban: string[]): string[] {
  if (!plan.izin) return ['plan reddetti']
  const tabanKumesi = new Set(taban.map((a) => adresAnahtari(a)))
  return plan.yeni.filter((a) => tabanKumesi.has(adresAnahtari(a)))
}

describe('SEO-27 · yeniKipPlani (yeni harita − taban)', () => {
  it('⭐bayrak AÇIK: yalnız yeni/değişen adresler bildirilir, sıra korunur, değişmeyenler atılır', () => {
    expect(yeniKipPlani(FEATURES_ACIK, YENI_HARITA, TABAN)).toEqual({
      izin: true,
      yeni: BEKLENEN_YENI,
      ayni: YENI_HARITA.slice(0, 2),
    })
  })

  it('⭐bayrak KAPALI → kapı aşılmaz (K4 sebebi), taban ne olursa olsun', () => {
    const p = yeniKipPlani(FEATURES_KAPALI, YENI_HARITA, TABAN)
    expect(p.izin).toBe(false)
    if (p.izin) return
    expect(p.sebep).toContain('ADRES_SEMASI_K3B')
    expect(p.sebep).toContain('K4')
  })

  it('bayrak satırı bulunamazsa SESSİZCE izin vermez, hata fırlatır', () => {
    expect(() => yeniKipPlani('export const BASKA = true\n', YENI_HARITA, TABAN)).toThrow(/ADRES_SEMASI_K3B/)
  })

  it('adres kimliği: sondaki /, çift /, yüzde kodu, #parça, host büyük harfi ve şema aynı adres sayılır', () => {
    const taban = [
      `${BASE}/tr/`,
      `${BASE}//tr//bilgi-merkezi`,
      `HTTP://VENTHUB.COM.TR/tr/%62ilgi-merkezi/yazi#bolum`,
      `${BASE}/tr/products/`,
    ]
    const yeni = [`${BASE}/tr`, `${BASE}/tr/bilgi-merkezi`, `${BASE}/tr/bilgi-merkezi/yazi`, `${BASE}/tr/urunler`]
    expect(yeniKipPlani(FEATURES_ACIK, yeni, taban)).toEqual({
      izin: true,
      yeni: [`${BASE}/tr/urunler`],
      ayni: yeni.slice(0, 3),
    })
  })

  it('yalnız büyük/küçük harfi değişen adres AYRI adrestir (fazla bildirmek zararsız, atlamak zararlı)', () => {
    const p = yeniKipPlani(FEATURES_ACIK, [`${BASE}/tr`, `${BASE}/tr/About`], [`${BASE}/tr`, `${BASE}/tr/about`])
    expect(p).toEqual({ izin: true, yeni: [`${BASE}/tr/About`], ayni: [`${BASE}/tr`] })
  })

  it('yeni haritada tekrar eden adres bir kez sayılır', () => {
    const p = yeniKipPlani(FEATURES_ACIK, [...YENI_HARITA, `${BASE}/tr/urunler/`, `${BASE}/tr/urun/avens-bvu-ls`], TABAN)
    expect(p).toEqual({ izin: true, yeni: BEKLENEN_YENI, ayni: YENI_HARITA.slice(0, 2) })
  })

  it('⭐taban boş ya da dizi değilse DURUR: bütün haritayı "yeni" saymak ölçüm değildir', () => {
    for (const taban of [[], null, undefined, 'x']) {
      const p = yeniKipPlani(FEATURES_ACIK, YENI_HARITA, taban)
      expect(p.izin, String(taban)).toBe(false)
    }
  })

  it('taban çözülemeyen adres taşıyorsa DURUR', () => {
    const p = yeniKipPlani(FEATURES_ACIK, YENI_HARITA, [...TABAN, `${BASE}/tr/%E0%A4%A`])
    expect(p.izin).toBe(false)
  })

  it('⭐yeni harita tabanla HİÇ kesişmiyorsa DURUR (yanlış dosya şüphesi: ana sayfa bile ortak değil)', () => {
    const p = yeniKipPlani(FEATURES_ACIK, YENI_HARITA, [`${BASE}/tr/baska-bir-evren`, `${BASE}/tr/products/x`])
    expect(p.izin).toBe(false)
    if (p.izin) return
    expect(p.sebep).toContain('kesişmiyor')
  })

  it('⭐yeni adres yoksa DURUR (taban yayından SONRA alınmış ya da yayın canlıda değil)', () => {
    const p = yeniKipPlani(FEATURES_ACIK, YENI_HARITA, YENI_HARITA)
    expect(p.izin).toBe(false)
    if (p.izin) return
    expect(p.sebep).toContain('yeni adres yok')
  })

  it('⭐karar 327: yeni kümede TR dışı adres (EN, dilsiz, "/tr" ile başlayan başka yol, başka dil öneki) DURDURUR', () => {
    for (const disari of [
      `${BASE}/en/products/avens-bvu-ls`,
      `${BASE}/about`,
      `${BASE}/trabzon`,
      `${BASE}/tr-TR/urunler`,
      `${BASE}/de/urunler`,
    ]) {
      const p = yeniKipPlani(FEATURES_ACIK, [...YENI_HARITA, disari], TABAN)
      expect(p.izin, disari).toBe(false)
      if (p.izin) continue
      expect(p.sebep, disari).toContain('TR dışı')
      expect(p.sebep, disari).toContain(disari)
    }
  })

  it('TR dışı adres tabanda zaten varsa (yeni değil) engel olmaz', () => {
    const p = yeniKipPlani(FEATURES_ACIK, [...YENI_HARITA, `${BASE}/en/about`], [...TABAN, `${BASE}/en/about`])
    expect(p.izin).toBe(true)
  })

  it("⭐üst sınır: yeni küme YENI_AZAMI'yı aşarsa DURUR, sınırda geçer", () => {
    const uret = (n: number) => Array.from({ length: n }, (_, i) => `${BASE}/tr/kategori/k-${i}`)
    const taban = [`${BASE}/tr`]
    const siniri = yeniKipPlani(FEATURES_ACIK, [`${BASE}/tr`, ...uret(YENI_AZAMI)], taban)
    expect(siniri.izin).toBe(true)
    const asan = yeniKipPlani(FEATURES_ACIK, [`${BASE}/tr`, ...uret(YENI_AZAMI + 1)], taban)
    expect(asan.izin).toBe(false)
    if (asan.izin) return
    expect(asan.sebep).toContain(String(YENI_AZAMI + 1))
  })

  it('⭐sabotaj: süzmeyen plan (haritanın hepsini "yeni" sayan) özellik denetiminde YAKALANIR; gerçek plan temiz', () => {
    const gercek = yeniKipPlani(FEATURES_ACIK, YENI_HARITA, TABAN)
    expect(suzgecIhlalleri(gercek, TABAN)).toEqual([])
    const suzmeyen: Plan = { izin: true, yeni: [...YENI_HARITA], ayni: [] }
    expect(suzgecIhlalleri(suzmeyen, TABAN)).toEqual([`${BASE}/tr`, `${BASE}/tr/bilgi-merkezi`])
  })
})

describe('SEO-27 · tabanAdresleriniOku', () => {
  it('geçerli dizi okunur (BOM tolere edilir)', () => {
    expect(tabanAdresleriniOku(JSON.stringify(TABAN))).toEqual(TABAN)
    expect(tabanAdresleriniOku('﻿' + JSON.stringify(TABAN))).toEqual(TABAN)
  })

  it('⭐bozuk taban hata fırlatır: JSON değil, dizi değil, boş dizi, string olmayan/boş/çözülemeyen eleman', () => {
    expect(() => tabanAdresleriniOku('{bozuk')).toThrow(/JSON değil/)
    expect(() => tabanAdresleriniOku('{"a":1}')).toThrow(/dizisi/)
    expect(() => tabanAdresleriniOku('[]')).toThrow(/boş/)
    expect(() => tabanAdresleriniOku(JSON.stringify([`${BASE}/tr`, 5]))).toThrow(/geçersiz adres/)
    expect(() => tabanAdresleriniOku(JSON.stringify([`${BASE}/tr`, '']))).toThrow(/geçersiz adres/)
    expect(() => tabanAdresleriniOku(JSON.stringify([`${BASE}/tr/%E0%A4%A`]))).toThrow(/geçersiz adres/)
  })
})

// ───────────────────── SEO-27 · yeni adres kipi: betik uçtan uca (yerel sunucu; hiçbir şey gönderilmez) ─────────────────────

type Sonuc = { kod: number | null; stdout: string; stderr: string }

function betigiKos(cwd: string, argumanlar: string[]): Promise<Sonuc> {
  return new Promise((coz) => {
    const cocuk = spawn(process.execPath, ['scripts/seo/indexnow-bildir.mjs', ...argumanlar], {
      cwd,
      env: { ...process.env, INDEXNOW_KEY: 'test-anahtar' },
    })
    let stdout = ''
    let stderr = ''
    cocuk.stdout.on('data', (d: Buffer) => (stdout += d.toString()))
    cocuk.stderr.on('data', (d: Buffer) => (stderr += d.toString()))
    cocuk.on('close', (kod) => coz({ kod, stdout, stderr }))
  })
}

/** "bildirilecek adresler (tamami):" başlığından sonraki iki boşluklu satırlar. */
function bildirilenler(stdout: string): string[] {
  const satirlar = stdout.split(/\r?\n/)
  const i = satirlar.indexOf('bildirilecek adresler (tamami):')
  if (i === -1) return []
  const liste: string[] = []
  for (const s of satirlar.slice(i + 1)) {
    if (!s.startsWith('  ')) break
    liste.push(s.trim())
  }
  return liste
}

/** Bayrağı AÇIK sahte `features.ts` ile geçici ağaç: gerçek betik ve kapı metni kopyalanır, üretim koduna test kapısı açılmaz. */
function agacKur(kapiDegistir?: (metin: string) => string): string {
  const dizin = mkdtempSync(join(tmpdir(), 'indexnow-yeni-'))
  mkdirSync(join(dizin, 'scripts', 'seo'), { recursive: true })
  mkdirSync(join(dizin, 'src', 'config'), { recursive: true })
  copyFileSync(join(KOK, 'scripts/seo/indexnow-bildir.mjs'), join(dizin, 'scripts/seo/indexnow-bildir.mjs'))
  const kapi = readFileSync(join(KOK, 'scripts/seo/yayin-kapisi.mjs'), 'utf8')
  writeFileSync(join(dizin, 'scripts/seo/yayin-kapisi.mjs'), kapiDegistir ? kapiDegistir(kapi) : kapi)
  copyFileSync(join(KOK, 'src/config/markaYonlendirmeleri.mjs'), join(dizin, 'src/config/markaYonlendirmeleri.mjs'))
  writeFileSync(join(dizin, 'src/config/features.ts'), FEATURES_ACIK)
  return dizin
}

/** Sabotaj yardımcısı: değiştirilecek metin kaynakta YOKSA test boşuna yeşil olmasın diye düşer. */
function degistir(metin: string, bul: string, yerine: string): string {
  expect(metin, `sabotaj hedefi kaynakta bulunmalı: ${bul}`).toContain(bul)
  return metin.replace(bul, yerine)
}

describe('SEO-27 · indexnow-bildir.mjs --yalniz-yeni --kuru (yerel sunucu, bayrak AÇIK geçici ağaç)', () => {
  let agac = ''
  let suzmeyenAgac = ''
  let tersAgac = ''
  let sunucu: Server | null = null
  const gecici: string[] = []

  beforeAll(() => {
    agac = agacKur()
    suzmeyenAgac = agacKur((m) => degistir(m, '(taban.has(k) ? ayni : yeni).push(a)', 'yeni.push(a)'))
    tersAgac = agacKur((m) => degistir(m, '(taban.has(k) ? ayni : yeni).push(a)', '(taban.has(k) ? yeni : ayni).push(a)'))
  })

  afterAll(() => {
    for (const d of [agac, suzmeyenAgac, tersAgac]) rmSync(d, { recursive: true, force: true })
  })

  afterEach(() => {
    sunucu?.close()
    sunucu = null
    while (gecici.length > 0) rmSync(gecici.pop() as string, { recursive: true, force: true })
  })

  /** sayfalar: yol → { durum, kanonikYol } */
  async function sunucuAc(
    sitemapYollari: string[],
    sayfalar: Record<string, { durum: number; kanonikYol?: string }>,
  ): Promise<string> {
    let taban = ''
    sunucu = createServer((istek, yanit) => {
      const yol = istek.url ?? '/'
      if (yol === '/sitemap.xml') {
        const govde = sitemapYollari.map((y) => `<url><loc>${taban}${y}</loc></url>`).join('')
        yanit.writeHead(200, { 'content-type': 'application/xml' })
        yanit.end(`<?xml version="1.0"?><urlset>${govde}</urlset>`)
        return
      }
      const s = sayfalar[yol]
      if (!s) {
        yanit.writeHead(404)
        yanit.end('yok')
        return
      }
      yanit.writeHead(s.durum, { 'content-type': 'text/html' })
      yanit.end(`<html><head><link rel="canonical" href="${taban}${s.kanonikYol ?? yol}"></head></html>`)
    })
    await new Promise<void>((tamam) => sunucu!.listen(0, '127.0.0.1', tamam))
    taban = `http://127.0.0.1:${(sunucu!.address() as AddressInfo).port}`
    return taban
  }

  /** Taban dosyasını (eski-adresler.json biçimi: mutlak adres dizisi) geçici klasöre yazar, yolunu döner. */
  function tabanYaz(icerik: string): string {
    const klasor = mkdtempSync(join(tmpdir(), 'indexnow-taban-'))
    gecici.push(klasor)
    const yol = join(klasor, 'eski-adresler.json')
    writeFileSync(yol, icerik)
    return yol
  }

  const ESKI_YOLLAR = ['/tr', '/tr/bilgi-merkezi', '/tr/products', '/tr/products/avens-bvu-ls', '/tr/category/hava-perdeleri', '/tr/brands/avens']
  const YENI_YOLLAR = ['/tr', '/tr/bilgi-merkezi', '/tr/urunler', '/tr/urun/avens-bvu-ls', '/tr/kategori/hava-perdeleri', '/tr/markalar/avens']
  const SAGLAM: Record<string, { durum: number; kanonikYol?: string }> = Object.fromEntries(YENI_YOLLAR.map((y) => [y, { durum: 200 }]))
  const mutlak = (site: string, yollar: string[]) => yollar.map((y) => `${site}${y}`)

  it('⭐yalnız yeni/değişen adresler basılır, değişmeyenler (ana sayfa, bilgi merkezi) basılmaz, çıkış 0, hiçbir şey gönderilmez', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.stderr).not.toContain('DURDU')
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain(`taban okundu: ${ESKI_YOLLAR.length} adres`)
    expect(r.stdout).toContain('ayni (atildi): 2')
    expect(r.stdout).toContain('bildirilecek URL (yeni/degisen TR): 4')
    expect(bildirilenler(r.stdout)).toEqual(mutlak(site, YENI_YOLLAR.slice(2)))
    expect(r.stdout).toContain('yeni 4 adresin hepsi 200 ve kanonik = kendisi.')
    expect(r.stdout).toContain('KURU KOSUM')
    expect(r.stdout).not.toContain('IndexNow yanit')
  }, 30000)

  it('⭐yeni adreslerden biri 308 ile yönlendiriyorsa DURUR (yönlendirme takip edilmez)', async () => {
    const site = await sunucuAc(YENI_YOLLAR, { ...SAGLAM, '/tr/urunler': { durum: 308 } })
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DURDU')
    expect(r.stderr).toContain('/tr/urunler')
    expect(r.stderr).toContain('308')
  }, 30000)

  it('⭐yeni adresin kanoniği kendisi değilse DURUR', async () => {
    const site = await sunucuAc(YENI_YOLLAR, { ...SAGLAM, '/tr/markalar/avens': { durum: 200, kanonikYol: '/tr/brands/avens' } })
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('/tr/markalar/avens')
    expect(r.stderr).toContain('kanonik')
  }, 30000)

  it('⭐karar 327: yeni haritada EN adres varsa DURUR (Pazar günü yalnız TR)', async () => {
    const site = await sunucuAc([...YENI_YOLLAR, '/en/products/avens-bvu-ls'], { ...SAGLAM, '/en/products/avens-bvu-ls': { durum: 200 } })
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('TR dışı')
    expect(r.stderr).toContain('/en/products/avens-bvu-ls')
    expect(r.stdout).not.toContain('KURU KOSUM')
  }, 30000)

  it('⭐taban yayından SONRA alınmışsa (yeni harita tabanın aynısı) DURUR', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    const taban = tabanYaz(JSON.stringify(mutlak(site, YENI_YOLLAR)))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('yeni adres yok')
  }, 30000)

  it('⭐taban başka evrenden (tabanla hiç kesişme yok) → DURUR', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    const taban = tabanYaz(JSON.stringify(mutlak(site, ['/tr/baska-evren', '/tr/products/x'])))
    const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('kesişmiyor')
  }, 30000)

  it('⭐bozuk taban dosyası DURUR: boş dizi, JSON değil, dosya yok', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    for (const icerik of ['[]', '{bozuk']) {
      const r = await betigiKos(agac, ['--site', site, '--yalniz-yeni', tabanYaz(icerik), '--kuru'])
      expect(r.kod, icerik).toBe(1)
      expect(r.stderr, icerik).toContain('taban okunamadi')
      expect(r.stdout, icerik).not.toContain('sitemap okunuyor')
    }
    const yok = await betigiKos(agac, ['--site', site, '--yalniz-yeni', join(tmpdir(), 'yok-boyle-bir-dosya.json'), '--kuru'])
    expect(yok.kod).toBe(1)
    expect(yok.stderr).toContain('taban okunamadi')
  }, 30000)

  it('⭐sabotaj: süzgeç KALDIRILIRSA (haritanın hepsi "yeni") betik DURUR, ortak adres sıfır görünür', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(suzmeyenAgac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('kesişmiyor')
  }, 30000)

  it('⭐sabotaj: TERS süzgeç (değişmeyenleri bildiren) uçtan uca YAKALANIR: ana sayfa ve bilgi merkezi listede çıkar', async () => {
    const site = await sunucuAc(YENI_YOLLAR, SAGLAM)
    const taban = tabanYaz(JSON.stringify(mutlak(site, ESKI_YOLLAR)))
    const r = await betigiKos(tersAgac, ['--site', site, '--yalniz-yeni', taban, '--kuru'])
    // sabotajlı betik çıkış 0 verir ama YANLIŞ kümeyi basar; gerçek betiğin ilk testi bu eşitlikle kırmızı olurdu.
    expect(r.kod).toBe(0)
    expect(bildirilenler(r.stdout)).toEqual(mutlak(site, YENI_YOLLAR.slice(0, 2)))
    expect(bildirilenler(r.stdout)).not.toEqual(mutlak(site, YENI_YOLLAR.slice(2)))
  }, 30000)
})

describe('SEO-27 · --yalniz-yeni bayrak doğrulaması (gerçek betik; kapıdan ve ağdan ÖNCE)', () => {
  function kos(argumanlar: string[]) {
    return spawnSync(process.execPath, ['scripts/seo/indexnow-bildir.mjs', ...argumanlar], {
      cwd: KOK,
      encoding: 'utf8',
      env: { ...process.env, INDEXNOW_KEY: 'test-anahtar' },
      timeout: 20000,
    })
  }

  it('⭐dosyasız --yalniz-yeni DURUR (sonraki argüman bayrak olsa da)', () => {
    for (const arg of [['--yalniz-yeni'], ['--yalniz-yeni', '--kuru']]) {
      const r = kos(arg)
      expect(r.status, arg.join(' ')).toBe(1)
      expect(r.stderr).toContain('DURDU')
      expect(r.stderr).toContain('taban dosyasi')
      expect(r.stdout).not.toContain('sitemap okunuyor')
    }
  })

  it('⭐--yalniz-yeni ile --yalniz-degismeyen birlikte kullanılamaz (zıt yönler)', () => {
    const r = kos(['--yalniz-yeni', 'x.json', '--yalniz-degismeyen', '--kuru'])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('birlikte')
    expect(r.stdout).not.toContain('sitemap okunuyor')
  })

  it('⭐bayrak KAPALI iken --yalniz-yeni de kapıdan geçemez: ağa ve taban dosyasına bakmadan DURUR (gerçek features.ts)', () => {
    const features = readFileSync(resolve(KOK, 'src/config/features.ts'), 'utf8')
    if (yayinKapisi(features).izin) return // bayrak açıldı (yayın günü): bu kol geçerli değil
    const r = kos(['--yalniz-yeni', 'yok-boyle-bir-dosya.json', '--kuru'])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('ADRES_SEMASI_K3B')
    expect(r.stderr).not.toContain('taban okunamadi')
    expect(r.stdout).not.toContain('sitemap okunuyor')
  })
})
