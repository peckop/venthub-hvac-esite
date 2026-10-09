/**
 * KATALOG · ürün açıklama düzeltici kalıp kapısı (KTL-15) — kural birimleri + uçtan uca, SAHTE PostgREST'e karşı
 * (gerçek DB'ye çıkmaz).
 *
 * Kural → test eşlemesi (sabotaj tablosu bunu kullanır):
 *   P1 şema · P2 değişiklik · P3a iç referans · P3b abartı kalıbı (+ rakamlı hız kademesi muafiyeti) ·
 *   P3c editör notu · P3d biçim artığı · P3e EN dilinde Türkçe harf · P4 sonuç biçimi ·
 *   E1 kapı ağdan ÖNCE (kırmızıda sahte sunucuya sıfır istek) · E2 çıkış kodları (0/1/2) · E3 yazma yolu bozulmadı.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { abartiBul } from '../aile-blok-duzelt-kurallar.mjs'
import {
  editorIsaretiBul, planKapisi, planSemasi, sonucBicimBozuklugu, trHarfBul, yeniKapisi,
} from '../urun-aciklama-duzelt-kurallar.mjs'

const BETIK = join(__dirname, '..', 'urun-aciklama-duzelt.mjs')
type Plan = { eski: string; yeni: string; diller: string[]; skus: string[] }
const plan = (o: Partial<Plan> = {}): Plan => ({ eski: ', yüksek verimli ex-proof', yeni: ' ex-proof', diller: ['tr'], skus: ['VRT-1', 'VRT-2'], ...o })
const kural = (p: Plan, ad: string) => yeniKapisi(p).find((k) => k.kural === ad)
const kirmizi = (p: Plan) => yeniKapisi(p).filter((k) => k.ok === false).map((k) => k.kural)

// ------------------------------------------------------------------------------------------------
// P1 — şema
// ------------------------------------------------------------------------------------------------
describe('P1 şema', () => {
  it('geçerli plan: hata yok, plan döner', () => {
    const s = planSemasi(plan())
    expect(s.hatalar).toEqual([])
    expect(s.plan).not.toBeNull()
  })
  it('nesne olmayan girdi (dizi, null, metin) reddedilir', () => {
    for (const g of [null, [], 'plan', 7, undefined]) expect(planSemasi(g).hatalar.length, String(g)).toBeGreaterThan(0)
  })
  it('bilinmeyen anahtar reddedilir (yazım hatalı "yenı"/fazladan "not" sessizce geçmez)', () => {
    const s = planSemasi({ ...plan(), not: 'x' })
    expect(s.hatalar.join('|')).toContain('bilinmeyen anahtar "not"')
    expect(s.plan).toBeNull()
  })
  it('eski/yeni boş ya da metin değil → hata', () => {
    for (const o of [{ eski: '' }, { yeni: '' }, { eski: 5 }, { yeni: null }]) {
      expect(planSemasi({ ...plan(), ...o }).hatalar.length, JSON.stringify(o)).toBeGreaterThan(0)
    }
  })
  it('diller: boş, bilinmeyen dil, tekrar, dizi değil → hata', () => {
    for (const diller of [[], ['de'], ['tr', 'tr'], 'tr', ['TR']]) {
      expect(planSemasi({ ...plan(), diller }).hatalar.length, JSON.stringify(diller)).toBeGreaterThan(0)
    }
    expect(planSemasi(plan({ diller: ['tr', 'en'] })).hatalar).toEqual([])
  })
  it('skus: boş, tekrar, dizi değil, sayı ve SORGU ENJEKSİYONU ("A\\"),sku.neq.") → hata', () => {
    for (const skus of [[], ['A', 'A'], 'VRT-1', [7], ['VRT-1"),sku.neq.("x'], ['A B'], ['']]) {
      expect(planSemasi({ ...plan(), skus }).hatalar.length, JSON.stringify(skus)).toBeGreaterThan(0)
    }
  })
  it('planKapisi: şema hatasında kural ÇALIŞMAZ, gecti=false', () => {
    const k = planKapisi({ ...plan(), diller: [] })
    expect(k.semaHatalari.length).toBeGreaterThan(0)
    expect(k.kurallar).toEqual([])
    expect(k.gecti).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------------
// P2 — değişiklik
// ------------------------------------------------------------------------------------------------
describe('P2 değişiklik', () => {
  it('temiz plan: bütün kurallar geçer', () => {
    const k = planKapisi(plan())
    expect(k.gecti).toBe(true)
    expect(k.kurallar.map((x) => x.kural)).toEqual(['P1', 'P2', 'P3a', 'P3b', 'P3c', 'P3d', 'P3e'])
  })
  it('eski = yeni → RED', () => {
    expect(kirmizi(plan({ eski: 'aynı', yeni: 'aynı' }))).toContain('P2')
  })
  it('NFC dışı yeni → RED (e + birleştirici işaret)', () => {
    expect(kirmizi(plan({ yeni: ' café' }))).toContain('P2')
  })
  it('çift boşluk → RED', () => {
    expect(kirmizi(plan({ yeni: ' ex  proof' }))).toContain('P2')
  })
  it('görünmez karakter (BOM, sıfır genişlik boşluk, yumuşak tire) → RED', () => {
    for (const c of ['﻿', '​', '­']) expect(kirmizi(plan({ yeni: ` ex${c}-proof` })), JSON.stringify(c)).toContain('P2')
  })
  it('kenar boşluk YASAK DEĞİL: silme komşu metinle yazılır (" ex-proof" geçer)', () => {
    expect(kirmizi(plan({ yeni: ' ex-proof' }))).toEqual([])
    expect(kirmizi(plan({ yeni: 'ex-proof ' }))).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// P3a..e — yeni metin kalıpları
// ------------------------------------------------------------------------------------------------
describe('P3a iç referans', () => {
  it('[DB], [Kaynak s.12], [s. 4], "Kaynak s. 9", html yorumu → RED', () => {
    for (const m of ['Gövde [DB] çelik.', 'Gövde [AVenS s.47] çelik.', 'Gövde [s. 4] çelik.', 'Gövde Kaynak s. 9 çelik.', 'Gövde <!-- not --> çelik.']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3a')
    }
  })
})

describe('P3b abartı kalıbı', () => {
  it('TR: üstün, maksimum, en iyi, garanti, tasarruf, gelişmiş, yüksek verimli → RED', () => {
    for (const m of ['Üstün verim.', 'Maksimum debi.', 'En iyi seçim.', '2 yıl garanti.', 'Enerji tasarrufu sağlar.', 'Gelişmiş kontrol.', 'Yüksek verimli motor.']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3b')
    }
  })
  it('EN: superior, best, maximum, most efficient, high-efficiency, advanced → RED', () => {
    for (const m of ['Superior airflow.', 'The best fan.', 'Maximum flow.', 'The most efficient unit.', 'High-efficiency motor.', 'Advanced control.']) {
      expect(kirmizi(plan({ diller: ['en'], yeni: m })), m).toContain('P3b')
    }
  })
  it('"üstünde" (üst + ünde) ve "karışık" gibi ek/gövde sözcükleri yanlış yakalanmaz', () => {
    expect(kirmizi(plan({ yeni: ' Gövdenin üstünde menteşe bulunur, karışık sinyal vermez.' }))).toEqual([])
  })
  it('hız kademesi SAYISI muaf: "iki hızlı", "4 hızlı kontrol seçeneği" (HR 450 AVEL D) geçer', () => {
    for (const m of ['iki hızlı motor', '4 hızlı kontrol seçeneğine sahip', 'Motor 3 hızlıdır.']) {
      expect(abartiBul(m).map((a) => a.ad), m).not.toContain('hızlı')
      expect(kirmizi(plan({ yeni: m })), m).toEqual([])
    }
  })
  it('muafiyet dar: "14 hızlı", "4 çok hızlı", "hızlı kurulum", "0 hızlı" ... hâlâ RED', () => {
    for (const m of ['14 hızlı motor', '4 çok hızlı motor', 'Hızlı kurulum', 'çok hızlı döner']) {
      expect(abartiBul(m).map((a) => a.ad), m).toContain('hızlı')
    }
  })
})

describe('P3c editör notu', () => {
  it('KALKTI/KALKAR/SİLİNİR/ÖNERİ/TODO/RED/ESKİ/YENİ büyük harfli editör sözcükleri → RED', () => {
    for (const s of ['KALKTI', 'KALKAR', 'KALDIRILDI', 'DÜŞER', 'SİLİNİR', 'SILINDI', 'ÖNERİ', 'TODO', 'RED', 'ESKİ', 'YENİ']) {
      expect(kirmizi(plan({ yeni: ` Gövde (… ${s} …) çelik.` })), s).toContain('P3c')
    }
  })
  it('GERÇEK VAKA: tablo hücresindeki "(… KALKTI …)" notu yeni metne taşınmıştı (10-09) → RED', () => {
    expect(kirmizi(plan({ yeni: ' Motor IE3 sınıfındadır (üstün dayanım KALKTI).' }))).toContain('P3c')
  })
  it('[[ ]], ok işareti, => ve parantezli büyük harfli not → RED', () => {
    for (const m of ['Gövde [[kontrol et]] çelik.', 'Eski → yeni', 'a => b', 'Gövde (NOT: ölçülmedi) çelik.', 'Gövde (ÖLÇÜ eksik) çelik.']) {
      expect(kirmizi(plan({ yeni: ` ${m}` })), m).toContain('P3c')
    }
  })
  it('küçük harfli normal sözcükler ve büyük harfli kısaltmalar geçer: "basınç düşer", "kalkar", "yeni model", "red", "IE3", "PTC", "HVLS"', () => {
    expect(editorIsaretiBul('Basınç düşer, kapak kalkar, yeni model red renkli, IE3 PTC HVLS.')).toEqual([])
    expect(kirmizi(plan({ yeni: ' Basınç düşer, kapak kalkar, IE3 PTC HVLS.' }))).toEqual([])
  })
})

describe('P3d biçim artığı', () => {
  it('---, [MANIFEST], "TR kaynak", satır başı >, dengesiz ** → RED', () => {
    for (const m of ['a --- b', 'a [MANIFEST] b', 'a TR kaynak b', 'a\n> alıntı', 'a **kalın b']) {
      expect(kirmizi(plan({ yeni: m })), m).toContain('P3d')
    }
  })
})

describe('P3e EN dili', () => {
  it('diller en içeriyorsa Türkçe harf → RED (en tek başına ve tr+en birlikte)', () => {
    expect(kirmizi(plan({ diller: ['en'], yeni: ' ışık and fan' }))).toContain('P3e')
    expect(kirmizi(plan({ diller: ['tr', 'en'], yeni: ' şık fan' }))).toContain('P3e')
    expect(trHarfBul('çğıöşüÇĞİÖŞÜ').length).toBe(12)
    expect(trHarfBul('ışık ışık')).toEqual(['ı', 'ş'])
  })
  it('TR planda Türkçe harf serbest; EN planda ASCII metin geçer', () => {
    expect(kural(plan({ yeni: ' şömine fanı' }), 'P3e')?.ok).toBeNull()
    expect(kirmizi(plan({ diller: ['en'], yeni: ' ex-proof' }))).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// P4 — sonuç biçimi
// ------------------------------------------------------------------------------------------------
describe('P4 sonuç biçimi', () => {
  it('değişimin yarattığı çift boşluk, noktalamadan önce boşluk, tekrarlı noktalama, kenar boşluk yakalanır', () => {
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan,  ex-proof.')).toEqual(['cift bosluk'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan , ex-proof.')).toEqual(['noktalamadan once bosluk'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan,, ex-proof.')).toEqual(['tekrarli noktalama'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan, ex-proof..')).toEqual(['tekrarli noktalama'])
    expect(sonucBicimBozuklugu('Fan, ex-proof.', ' Fan, ex-proof.')).toEqual(['kenar bosluk'])
  })
  it('eskiden beri var olan bozukluk bu değişikliğin suçu DEĞİL (ikisinde de varsa sayılmaz)', () => {
    expect(sonucBicimBozuklugu('Fan  ex-proof.', 'Fan  ex-proof tasarım.')).toEqual([])
  })
  it('temiz sonuç ve üç noktalı ifade: boş dizi', () => {
    expect(sonucBicimBozuklugu('Fan, ex-proof.', 'Fan ex-proof.')).toEqual([])
    expect(sonucBicimBozuklugu('Fan...', 'Fan...')).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// Uçtan uca — sahte PostgREST
// ------------------------------------------------------------------------------------------------
type Urun = { id: string; sku: string; name: string; description_i18n: Record<string, string> }
const ilkUrunler = (): Urun[] => [
  { id: 'u1', sku: 'VRT-1', name: 'Ex fan 1', description_i18n: { tr: 'Güvenli fan, yüksek verimli ex-proof tasarım.', en: 'Safe fan, high-efficiency ex-proof design.' } },
  { id: 'u2', sku: 'VRT-2', name: 'Ex fan 2', description_i18n: { tr: 'Güvenli fan, yüksek verimli ex-proof tasarım.', en: 'Safe fan, high-efficiency ex-proof design.' } },
]

let urunler: Urun[] = ilkUrunler()
const istekler: { yontem: string; yol: string; govde: string }[] = []
let sunucu: Server
let taban = ''
let gecici = ''

beforeAll(async () => {
  gecici = mkdtempSync(join(tmpdir(), 'urun-aciklama-'))
  sunucu = createServer((req, res) => {
    let govde = ''
    req.on('data', (c) => { govde += String(c) })
    req.on('end', () => {
      istekler.push({ yontem: req.method ?? '', yol: req.url ?? '', govde })
      const url = new URL(req.url ?? '/', 'http://x')
      const json = (kod: number, v: unknown) => { res.writeHead(kod, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)) }
      if (url.pathname !== '/rest/v1/products') return json(404, {})
      if (req.method === 'GET') {
        const istenen = [...(url.searchParams.get('sku') ?? '').matchAll(/"([^"]+)"/g)].map((m) => m[1])
        return json(200, urunler.filter((u) => istenen.includes(u.sku)))
      }
      if (req.method === 'PATCH') {
        const id = (url.searchParams.get('id') ?? '').replace(/^eq\./, '')
        const u = urunler.find((x) => x.id === id)
        if (!u) return json(200, [])
        Object.assign(u, JSON.parse(govde))
        return json(200, [u])
      }
      return json(405, {})
    })
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
  taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
})
afterAll(async () => {
  await new Promise<void>((coz) => sunucu.close(() => coz()))
  rmSync(gecici, { recursive: true, force: true })
})
beforeEach(() => { urunler = ilkUrunler(); istekler.length = 0 })

let sayac = 0
const planDosyasi = (p: unknown) => {
  const yol = join(gecici, `plan-${++sayac}.json`)
  writeFileSync(yol, typeof p === 'string' ? p : JSON.stringify(p), 'utf8')
  return yol
}
const calistir = (argumanlar: string[], onay = false) =>
  new Promise<{ kod: number; stdout: string; stderr: string }>((coz) => {
    const env = { ...process.env }
    delete env.CANLI_YAZIM_ONAYI
    if (onay) env.CANLI_YAZIM_ONAYI = 'evet'
    execFile(process.execPath, [BETIK, ...argumanlar], { env, timeout: 30000 }, (hata, stdout, stderr) => {
      const kod = hata ? (typeof (hata as NodeJS.ErrnoException & { code?: unknown }).code === 'number' ? ((hata as { code: number }).code) : 99) : 0
      coz({ kod, stdout, stderr })
    })
  })
const ag = (p: string, ...ek: string[]) => ['--plan', p, '--url', taban, '--key', 'k', '--out', join(gecici, 'cikti'), ...ek]

describe('E2 çıkış kodları ve --kapi-yalniz', () => {
  it('temiz plan --kapi-yalniz: çıkış 0, url/anahtar istenmez, ağa çıkılmaz', async () => {
    const r = await calistir(['--plan', planDosyasi(plan()), '--kapi-yalniz'])
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KAPI TEMİZ')
    expect(istekler.length).toBe(0)
  })
  it('kirli plan --kapi-yalniz: çıkış 1, hangi kuralın düştüğü yazılır', async () => {
    const r = await calistir(['--plan', planDosyasi(plan({ yeni: ' ex-proof (üstün dayanım KALKTI)' })), '--kapi-yalniz'])
    expect(r.kod).toBe(1)
    expect(r.stdout).toMatch(/P3b abarti kalibi\s+GEÇMEDİ/)
    expect(r.stdout).toMatch(/P3c editor notu\s+GEÇMEDİ/)
    expect(r.stderr).toContain('KALIP KAPISI KIRMIZI')
  })
  it('şema hatası: çıkış 2 (plan hatası), kural satırı yok', async () => {
    const r = await calistir(['--plan', planDosyasi({ ...plan(), diller: [] }), '--kapi-yalniz'])
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('plan şeması geçersiz')
    expect(r.stdout).not.toContain('KALIP KAPISI')
  })
  it('plan JSON değil / dosya yok: çıkış 2', async () => {
    expect((await calistir(['--plan', planDosyasi('{bozuk'), '--kapi-yalniz'])).kod).toBe(2)
    expect((await calistir(['--plan', join(gecici, 'yok.json'), '--kapi-yalniz'])).kod).toBe(2)
  })
  it('--plan yok ya da (kapı-yalnız dışında) url/anahtar yok: çıkış 2', async () => {
    expect((await calistir([])).kod).toBe(2)
    expect((await calistir(['--plan', planDosyasi(plan())])).kod).toBe(2)
  })
})

describe('E1 kapı AĞDAN ÖNCE', () => {
  it('kırmızı kapıda --yaz + onay olsa bile sahte sunucuya SIFIR istek, PATCH yok, envanter yok, çıkış 1', async () => {
    const r = await calistir(ag(planDosyasi(plan({ yeni: ' ex-proof (ÖNERİ: üstün)' })), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('hiçbir şey okunmadı, hiçbir şey yazılmadı')
    expect(istekler).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
})

describe('E3 yazma yolu bozulmadı (iki anahtar, tam-1 eşleşme, ürün başına 1 PATCH)', () => {
  it('temiz plan KURU koşum: kapı satırları + "1 → değişecek", PATCH yok', async () => {
    const r = await calistir(ag(planDosyasi(plan())))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KALIP KAPISI')
    expect(r.stdout).toContain('tr: 1 → değişecek')
    expect(r.stdout).toContain('KURU KOŞUM')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
  })
  it('yalnız --yaz (onay ortamda yok): hâlâ kuru koşum, PATCH yok', async () => {
    const r = await calistir(ag(planDosyasi(plan()), '--yaz'))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KURU KOŞUM')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
  })
  it('--yaz + onay: iki ürüne 1\'er PATCH, TR değişir, EN dokunulmaz, envanter yazılır', async () => {
    const r = await calistir(ag(planDosyasi(plan()), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('YAZIM TAMAM: 2/2')
    expect(istekler.filter((i) => i.yontem === 'PATCH').length).toBe(2)
    for (const u of urunler) {
      expect(u.description_i18n.tr).toBe('Güvenli fan ex-proof tasarım.')
      expect(u.description_i18n.en).toBe('Safe fan, high-efficiency ex-proof design.')
    }
    expect(readdirSync(join(gecici, 'cikti')).some((a) => a.startsWith('aciklama-'))).toBe(true)
  })
  it('eski alanda 0 ya da 2 kez geçiyorsa ATLANIR (tam-1 eşleşme), yazılacak yoksa çıkış 0', async () => {
    urunler[0].description_i18n.tr = 'ex-proof ex-proof ex-proof'
    const r = await calistir(ag(planDosyasi(plan({ eski: 'ex-proof', yeni: 'ATEX ex-proof', skus: ['VRT-1'] })), '--yaz'), true)
    expect(r.stdout).toContain('3 kez geçiyor — ATLANDI')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
    expect(r.kod).toBe(0)
  })
})

describe('P4 uçtan uca — sonuç metni bozulursa HİÇBİR ŞEY yazılmaz', () => {
  it('"yüksek verimli " → " " canlı metinde çift boşluk üretir: çıkış 1, PATCH yok (--yaz + onay olsa da)', async () => {
    const r = await calistir(ag(planDosyasi(plan({ eski: 'yüksek verimli ', yeni: ' ', skus: ['VRT-1'] })), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stdout).toContain('SONUÇ BİÇİMİ BOZUK (cift bosluk)')
    expect(r.stdout, 'bozuk alan aynı satırda "değişecek" diye ilan edilmez').not.toContain('1 → değişecek')
    expect(r.stdout, 'RED durumunda ÖZET/KURU KOŞUM sonucu basılmaz').not.toContain('ÖZET')
    expect(r.stderr).toContain('P4 SONUÇ BİÇİMİ KIRMIZI')
    expect(istekler.filter((i) => i.yontem === 'PATCH')).toEqual([])
    expect(urunler[0].description_i18n.tr).toBe('Güvenli fan, yüksek verimli ex-proof tasarım.')
  })
})
