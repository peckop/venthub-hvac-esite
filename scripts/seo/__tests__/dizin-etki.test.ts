/**
 * INV-DIZIN-ETKI-2 · Etki defterinin AĞSIZ çekirdeği (SEO-147; cetvel dizin-sistemleri-standard.md D8.1).
 *
 * Kilitlenenler: vade eşleme (hedef güne en yakın ölçüm, ±1 gün tolerans; sıra yoksa gorunmedi; ölçüm yok ≠ görünmedi; vadesi gelmemiş null);
 * hüküm kuralları (olumlu, olumsuz, notr, bekliyor + ayrilamiyor ve TEK CÜMLELİK cakisan); once hesabı; depo içi çıktı yolu reddi (P6);
 * uçtan uca koşu: yedek, bozuk satırın korunması, eşzamanlı ekleme, idempotent ikinci koşu, sayfa-zaman/ozet çıktıları, son koşu satırı
 * (YALNIZ depo dışı INDEKS; SEO-154: depo içi ETKI bloğu kaldırıldı, INV-DIZIN-ETKI-INDEKS-1 depo içi defterin bayt bayt değişmediğini kilitler)
 * ve açılış uyarısı (yalnız INDEKS okur). Veri sahtedir (P6: gerçek arama verisi yok).
 */
import { spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach,describe, expect, it } from 'vitest'

import { calistir as acilisCalistir } from '../dizin-acilis.mjs'
import {
adresTipi, cakisanCumlesi, cakisanlariBul,   CAKISMA_GUN, defterSatirlari, defterYaz, dosyaAdlari, etkiHesapla, etkiKos, etkiPuani, etkiYoluKontrol, gunEkle, gunFarki,
  hukumHesapla, kayitlariKur, KOK, kontrolBul, olcumBul, onceHesapla, ozetUret, SIRA_ESIGI, trGun, zamanCizgisi,
} from '../dizin-etki.mjs'
import { satirYaz } from '../dizin-takip.mjs'
import { acilisUyarisi, indeksMetniniGuncelle, indeksYaz, sonKosuOku } from '../etki-son-kosu.mjs'

const S = 'https://venthub.com.tr'
const A = `${S}/tr/bilgi-merkezi/a-yazi`
const B = `${S}/tr/bilgi-merkezi/b-yazi`
const C = `${S}/tr/category/c-kategori`
const ms = (iso: string) => Date.parse(iso)
const gecici: string[] = []
const dizin = () => { const d = mkdtempSync(join(tmpdir(), 'dizin-etki-')); gecici.push(d); return d }
afterEach(() => { while (gecici.length) rmSync(gecici.pop() as string, { recursive: true, force: true }) })

type Satir = Record<string, unknown>
const degisim = (adres: string, tarih: string, ek: Satir = {}): Satir => ({ tarih, motor: 'google', eylem: 'degisim', adres, kaynak: 'kaydet', ...ek })
const gscGunleri = (baslangic: string, veri: Array<[number, number | null]>) => veri.map(([gosterim, sira], i) => ({ tarih: gunEkle(baslangic, i), tik: 0, gosterim, sira }))
const kayitKur = (girdi: Record<string, unknown>) => kayitlariKur(girdi as Parameters<typeof kayitlariKur>[0])

describe('gün yardımcıları (Türkiye günü)', () => {
  it('UTC gece yarısından önceki an TR ertesi günü yazar; gunEkle ve gunFarki tutarlı', () => {
    expect(trGun(ms('2026-11-17T21:30:00Z'))).toBe('2026-11-18')
    expect(trGun(ms('2026-11-17T20:59:00Z'))).toBe('2026-11-17')
    expect(gunEkle('2026-11-29', 3)).toBe('2026-12-02')
    expect(gunFarki('2026-11-20', '2026-11-17')).toBe(3)
    expect(gunFarki('2026-11-17', '2026-11-20')).toBe(-3)
  })
})

describe('olcumBul: hedef güne en yakın ölçüm, ±1 gün tolerans', () => {
  const olc = (gun: string, sira?: number, ek: Satir = {}) => ({ adres: A, ms: ms(`${gun}T10:00:00Z`), motor: 'google', tur: 'serp', kart: 'SEO-9', ...(sira === undefined ? {} : { sira }), ...ek })
  it('olcumler.jsonl: hedef gün, ±1 gün tolerans içinde bulunur (gunFarki yazılır); 2 gün sapma null', () => {
    const k = (gun: string) => kayitKur({ olcumler: [olc(gun, 7)] }).get(A)
    expect(olcumBul({ kayit: k('2026-11-20'), hedefGun: '2026-11-20' })).toMatchObject({ kaynak: 'olcum', tarih: '2026-11-20', gorunme: 'gorundu', sira: 7 })
    expect(olcumBul({ kayit: k('2026-11-21'), hedefGun: '2026-11-20' })).toMatchObject({ gunFarki: 1, sira: 7 })
    expect(olcumBul({ kayit: k('2026-11-19'), hedefGun: '2026-11-20' })).toMatchObject({ gunFarki: 1 })
    expect(olcumBul({ kayit: k('2026-11-22'), hedefGun: '2026-11-20' })).toBeNull()
    expect(olcumBul({ kayit: k('2026-11-18'), hedefGun: '2026-11-20' })).toBeNull()
  })
  it('ölçüm var ama sıra yoksa "gorunmedi" (ölçüm yok ile aynı değildir: o null)', () => {
    const k = kayitKur({ olcumler: [olc('2026-11-20')] }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toMatchObject({ gorunme: 'gorunmedi', sira: null })
    expect(olcumBul({ kayit: kayitKur({}).get(A) ?? null, hedefGun: '2026-11-20' })).toBeNull()
  })
  it('aynı günün birden çok satırında en iyi sıra; sıra olan satır olmayanı yener', () => {
    const k = kayitKur({ olcumler: [olc('2026-11-20', 9), olc('2026-11-20', 4), olc('2026-11-20')] }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toMatchObject({ gorunme: 'gorundu', sira: 4 })
  })
  it('yalnız Google ailesi (google, gsc) ve serp/gsc türü sayılır: Bing, Yandex, trends ve diger türü vade ölçümü olamaz', () => {
    const k = kayitKur({ olcumler: [olc('2026-11-20', 3, { motor: 'bing' }), olc('2026-11-20', 3, { motor: 'yandex' }), olc('2026-11-20', 3, { tur: 'diger' }), olc('2026-11-20', 3, { tur: 'trends' })] }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toBeNull()
    expect(olcumBul({ kayit: kayitKur({ olcumler: [olc('2026-11-20', 3, { motor: 'gsc', tur: 'gsc' })] }).get(A), hedefGun: '2026-11-20' })).toMatchObject({ sira: 3 })
  })
  it('GSC günlük seri: hedef gün ±1 TOPLAMI; sıra gösterim ağırlıklı; tek günlük 0 gösterim "gorunmedi" yazmaz', () => {
    const gunler = gscGunleri('2026-11-19', [[2, 10], [0, null], [2, 20]])
    const k = kayitKur({ gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [{ adres: A, seri: { gunler } }] }] }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toMatchObject({ kaynak: 'gsc', gorunme: 'gorundu', gosterim: 4, sira: 15 })
    const sifir = kayitKur({ gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [{ adres: A, seri: { gunler: gscGunleri('2026-11-19', [[0, null], [0, null], [0, null]]) } }] }] }).get(A)
    expect(olcumBul({ kayit: sifir, hedefGun: '2026-11-20' })).toMatchObject({ gorunme: 'gorunmedi', sira: null, gosterim: 0 })
    // seri hedef günü hiç kapsamıyorsa ölçüm YOK (null), "görünmedi" değil
    expect(olcumBul({ kayit: k, hedefGun: '2026-12-20' })).toBeNull()
  })
  it('hata veren GSC okuması (seri.hata) ölçüm sayılmaz', () => {
    const k = kayitKur({ gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [{ adres: A, seri: { hata: '500 boom' } }] }] }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toBeNull()
  })
  it('gorunme satırı (canlı arama): gorundu/gorunmuyor ölçüm sayılır, olculemedi sayılmaz', () => {
    const g = (sonuc: string) => ({ tarih: '2026-11-20T09:00:00Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc })
    expect(olcumBul({ kayit: kayitKur({ hareketler: [g('gorunmuyor')] }).get(A), hedefGun: '2026-11-20' })).toMatchObject({ kaynak: 'gorunme', gorunme: 'gorunmedi' })
    expect(olcumBul({ kayit: kayitKur({ hareketler: [g('gorundu')] }).get(A), hedefGun: '2026-11-20' })).toMatchObject({ gorunme: 'gorundu', sira: null })
    expect(olcumBul({ kayit: kayitKur({ hareketler: [g('olculemedi')] }).get(A) ?? null, hedefGun: '2026-11-20' })).toBeNull()
  })
  it('birden çok kaynak: en yakın gün kazanır; eşitlikte sıralı ölçüm; kaynaklar listesi hepsini söyler', () => {
    const k = kayitKur({
      olcumler: [olc('2026-11-19', 6)],
      hareketler: [{ tarih: '2026-11-20T09:00:00Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc: 'gorundu' }],
    }).get(A)
    expect(olcumBul({ kayit: k, hedefGun: '2026-11-20' })).toMatchObject({ kaynak: 'gorunme', kaynaklar: ['gorunme', 'olcum'] })
    const esit = kayitKur({ olcumler: [olc('2026-11-20', 6)], hareketler: [{ tarih: '2026-11-20T09:00:00Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc: 'gorundu' }] }).get(A)
    expect(olcumBul({ kayit: esit, hedefGun: '2026-11-20' })).toMatchObject({ kaynak: 'olcum', sira: 6 })
  })
})

describe('onceHesapla: değişiklik öncesi durum', () => {
  const t = ms('2026-11-17T12:00:00Z')
  it('değişiklik gününden ÖNCEKİ 7 günün GSC toplamı; değişiklik günü kendisi dahil değildir', () => {
    const gunler = gscGunleri('2026-11-10', [[1, 10], [1, 10], [0, null], [3, 6], [0, null], [0, null], [0, null], [50, 1]]) // 10..17; 17'si (değişiklik günü) sayılmaz
    const k = kayitKur({ gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [{ adres: A, seri: { gunler } }] }] }).get(A)
    const o = onceHesapla({ degisimMs: t, kayit: k })
    expect(o).toMatchObject({ kaynak: 'gsc', tarih: '2026-11-16', gorunme: 'gorundu', gosterim: 5 })
    expect(o?.sira).toBeCloseTo(7.6, 1)
  })
  it('GSC yoksa önceki 14 gün içindeki en yeni olcum/gorunme; daha eskisi taban olamaz', () => {
    const olcum = (gun: string, sira?: number) => ({ adres: A, ms: ms(`${gun}T10:00:00Z`), motor: 'google', tur: 'serp', kart: 'SEO-9', ...(sira === undefined ? {} : { sira }) })
    expect(onceHesapla({ degisimMs: t, kayit: kayitKur({ olcumler: [olcum('2026-11-10', 9), olcum('2026-11-15')] }).get(A) })).toMatchObject({ kaynak: 'olcum', tarih: '2026-11-15', gorunme: 'gorunmedi', sira: null })
    expect(onceHesapla({ degisimMs: t, kayit: kayitKur({ olcumler: [olcum('2026-10-20', 9)] }).get(A) })).toBeNull()
    expect(onceHesapla({ degisimMs: t, kayit: kayitKur({ hareketler: [{ tarih: '2026-11-14T09:00:00Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc: 'gorunmuyor' }] }).get(A) })).toMatchObject({ kaynak: 'gorunme', gorunme: 'gorunmedi' })
  })
  it('son tarama arşiv anlık görüntüsünden: değişiklikten önceki en yeni Google taraması; Bing taraması ve "0001" yokluk değeri sayılmaz', () => {
    const anlik = (alinma: string, sonTarama: string, bing = '0001-01-01T00:00:00.000Z') => ({ alinma: ms(alinma), tablo: [{ adres: A, google: { sonTarama }, bing: { sonTarama: bing } }] })
    const k = kayitKur({ anlikGoruntuler: [anlik('2026-11-12T08:00:00Z', '2026-11-11T05:00:00Z'), anlik('2026-11-20T08:00:00Z', '2026-11-19T05:00:00Z', '2026-11-16T05:00:00Z')] }).get(A)
    expect(onceHesapla({ degisimMs: t, kayit: k })).toEqual({ sonTarama: '2026-11-11T05:00:00.000Z' })
  })
  it('hiçbir kaynak yoksa null (uydurma "önce" yok)', () => {
    expect(onceHesapla({ degisimMs: t, kayit: null })).toBeNull()
    expect(onceHesapla({ degisimMs: t, kayit: kayitKur({}).get(A) ?? null })).toBeNull()
  })
})

describe('hukumHesapla: dört hüküm, bekliyor ve ayrilamiyor', () => {
  const v = (gorunme: 'gorundu' | 'gorunmedi', sira: number | null = null) => ({ kaynak: 'gsc', tarih: '2026-11-24', gorunme, sira })
  const bos = { 3: null, 7: null, 14: null, 28: null }
  it('bekliyor: dolu vade yok (çakışma olsa bile ölçülecek bir şey yok)', () => {
    expect(hukumHesapla({ once: { gorunme: 'gorunmedi' }, vadeler: bos, cakisan: null }).hukum).toBe('bekliyor')
    expect(hukumHesapla({ once: null, vadeler: null, cakisan: 'x' }).hukum).toBe('bekliyor')
  })
  it('olumlu: önce görünmüyordu, şimdi görünüyor (dizine/aramaya giriş)', () => {
    const r = hukumHesapla({ once: { gorunme: 'gorunmedi', sira: null }, vadeler: { ...bos, 7: v('gorundu', 12) }, cakisan: null })
    expect(r.hukum).toBe('olumlu')
    expect(r.notu).toContain('göründü')
    expect(r.notu).toContain('7. gün')
  })
  it('olumsuz: önce görünüyordu, şimdi görünmüyor', () => {
    expect(hukumHesapla({ once: { gorunme: 'gorundu', sira: 5 }, vadeler: { ...bos, 14: v('gorunmedi') }, cakisan: null }).hukum).toBe('olumsuz')
  })
  it('notr: ikisinde de görünmüyor; ikisinde de görünüp sıra farkı eşiğin altında; sıra karşılaştırılamıyor', () => {
    expect(hukumHesapla({ once: { gorunme: 'gorunmedi' }, vadeler: { ...bos, 3: v('gorunmedi') }, cakisan: null }).hukum).toBe('notr')
    expect(hukumHesapla({ once: { gorunme: 'gorundu', sira: 12 }, vadeler: { ...bos, 3: v('gorundu', 10.5) }, cakisan: null }).hukum).toBe('notr')
    expect(hukumHesapla({ once: { gorunme: 'gorundu', sira: null }, vadeler: { ...bos, 3: v('gorundu', 4) }, cakisan: null }).hukum).toBe('notr')
  })
  it('sıra eşiği: fark tam SIRA_ESIGI iken hüküm verilir, altında notr', () => {
    expect(SIRA_ESIGI).toBe(3)
    const h = (once: number, son: number) => hukumHesapla({ once: { gorunme: 'gorundu', sira: once }, vadeler: { ...bos, 7: v('gorundu', son) }, cakisan: null }).hukum
    expect(h(12, 9)).toBe('olumlu')
    expect(h(12, 9.1)).toBe('notr')
    expect(h(9, 12)).toBe('olumsuz')
    expect(h(9, 11.9)).toBe('notr')
  })
  it('en son dolu vade esas alınır (28 > 14 > 7 > 3)', () => {
    const r = hukumHesapla({ once: { gorunme: 'gorunmedi' }, vadeler: { 3: v('gorundu', 8), 7: v('gorundu', 8), 14: null, 28: v('gorunmedi') }, cakisan: null })
    expect(r.hukum).toBe('notr')
    expect(r.notu).toContain('28. gün')
  })
  it('ayrilamiyor: çakışan değişiklik varsa hüküm verilmez ve not çakışma cümlesidir', () => {
    const cumle = 'Aynı adreste ±7 günde 1 başka değişiklik var (2026-11-18 BLG-82 #2611); etki bu değişiklikten ayrıştırılamıyor.'
    const r = hukumHesapla({ once: { gorunme: 'gorunmedi' }, vadeler: { ...bos, 7: v('gorundu', 2) }, cakisan: cumle })
    expect(r).toEqual({ hukum: 'ayrilamiyor', notu: cumle })
  })
  it('ayrilamiyor: once yok ya da görünme bilgisi yok (tabanı bilinmeyen etki hükme bağlanmaz)', () => {
    expect(hukumHesapla({ once: null, vadeler: { ...bos, 7: v('gorundu', 2) }, cakisan: null }).hukum).toBe('ayrilamiyor')
    expect(hukumHesapla({ once: { sonTarama: '2026-11-01T00:00:00Z' }, vadeler: { ...bos, 7: v('gorundu', 2) }, cakisan: null }).notu).toContain('bilinmiyor')
  })
})

describe('çakışma: aynı adreste ±7 günde başka değişiklik', () => {
  const sat = (adres: string, tarih: string, ek: Satir = {}) => ({ ...degisim(adres, tarih, ek), ms: ms(tarih) }) as Satir & { ms: number; adres: string }
  it('±7 gün (dahil) içindeki başka değişiklik çakışır; 7 günü aşan, başka adres, aynı PR, aynı an çakışmaz', () => {
    const d = [
      sat(A, '2026-11-10T08:00:00Z', { pr: 100 }),
      sat(A, '2026-11-17T08:00:00Z', { pr: 101, kart: 'BLG-2' }), // tam 7 gün sonra: dahil
      sat(A, '2026-11-17T08:00:01Z', { pr: 102 }), // 7 gün + 1 sn: dışarıda
      sat(B, '2026-11-11T08:00:00Z'),
      sat(A, '2026-11-12T08:00:00Z', { pr: 100 }), // aynı PR: aynı değişiklik
      sat(A, '2026-11-10T08:00:00Z'), // aynı an
    ]
    expect(CAKISMA_GUN).toBe(7)
    expect(cakisanlariBul(d, 0).map((x) => x.pr)).toEqual([101])
    expect(cakisanlariBul(d, 3)).toEqual([])
  })
  it('cümle TEK cümledir: sayı, ilk üç değişiklik (tarih, kart, PR), fazlası "ve N tane daha"', () => {
    expect(cakisanCumlesi([])).toBeNull()
    const l = [1, 2, 3, 4, 5].map((n) => sat(A, `2026-11-1${n}T08:00:00Z`, { kart: `BLG-${n}`, pr: 200 + n }))
    const c = cakisanCumlesi(l) as string
    expect(c).toContain('±7 günde 5 başka değişiklik')
    expect(c).toContain('2026-11-11 BLG-1 #201')
    expect(c).toContain('ve 2 tane daha')
    expect(c).not.toContain('BLG-4')
    expect(c.endsWith('.')).toBe(true)
    expect((c.match(/\.(\s|$)/g) ?? []).length).toBe(1)
    expect(cakisanCumlesi(l.slice(0, 1))).toContain('1 başka değişiklik')
  })
})

describe('etkiHesapla: vadeler ve hüküm birlikte', () => {
  const t0 = '2026-11-10T09:00:00Z'
  const satirlar = (rows: Satir[]) => rows.map((h) => ({ ham: JSON.stringify(h), h }))
  it('vadesi gelmemiş vade null (veri olsa bile), gelmiş ama ölçümsüz vade null, gelmiş ve ölçümlü vade dolar', () => {
    const k = kayitKur({ olcumler: [{ adres: A, ms: ms('2026-11-13T10:00:00Z'), motor: 'google', tur: 'serp', kart: 'SEO-9', sira: 6 }, { adres: A, ms: ms('2026-11-24T10:00:00Z'), motor: 'google', tur: 'serp', kart: 'SEO-9', sira: 2 }] })
    const d = [{ ...degisim(A, t0), ms: ms(t0) }]
    const r = etkiHesapla({ h: degisim(A, t0), i: 0, degisimler: d as never, kayitlar: k, simdi: ms('2026-11-18T08:00:00Z') })
    expect(r.vadeler[3]).toMatchObject({ kaynak: 'olcum', sira: 6 }) // 13 Kasım = 10 + 3
    expect(r.vadeler[7]).toBeNull() // 17 Kasım geldi ama ölçüm yok
    expect(r.vadeler[14]).toBeNull() // 24 Kasım henüz gelmedi (ölçüm "gelecekte" görünse bile yazılmaz)
    expect(r.vadeler[28]).toBeNull()
    expect(Object.keys(r.vadeler)).toEqual(['3', '7', '14', '28'])
  })
  it('dolu vade yeniden yazılmaz; --yeniden verilirse yeniden hesaplanır; once.sayfa=yeni her zaman korunur', () => {
    const k = kayitKur({ olcumler: [{ adres: A, ms: ms('2026-11-13T10:00:00Z'), motor: 'google', tur: 'serp', kart: 'SEO-9', sira: 6 }] })
    const eskiVade = { kaynak: 'gsc', tarih: '2026-11-13', gorunme: 'gorundu', sira: 99 }
    const h = degisim(A, t0, { vadeler: { 3: eskiVade }, once: { sayfa: 'yeni', gorunme: 'gorunmedi', sira: null } })
    const d = [{ ...h, ms: ms(t0) }] as never
    const korunan = etkiHesapla({ h, i: 0, degisimler: d, kayitlar: k, simdi: ms('2026-11-18T08:00:00Z') })
    expect(korunan.vadeler[3]).toEqual(eskiVade)
    const yeniden = etkiHesapla({ h, i: 0, degisimler: d, kayitlar: k, simdi: ms('2026-11-18T08:00:00Z'), yeniden: true })
    expect(yeniden.vadeler[3]).toMatchObject({ kaynak: 'olcum', sira: 6 })
    expect(yeniden.once).toEqual({ sayfa: 'yeni', gorunme: 'gorunmedi', sira: null })
  })
  it('çakışma varsa ölçüm dolu olsa da ayrilamiyor ve cakisan alanı TEK cümle; çakışma yoksa olumlu', () => {
    const olc = [{ adres: A, ms: ms('2026-11-13T10:00:00Z'), motor: 'google', tur: 'serp', kart: 'SEO-9', sira: 4 }, { adres: A, ms: ms('2026-11-09T10:00:00Z'), motor: 'google', tur: 'serp', kart: 'SEO-9' }]
    const k = kayitKur({ olcumler: olc })
    const tek = [{ ...degisim(A, t0), ms: ms(t0) }] as never
    expect(etkiHesapla({ h: degisim(A, t0), i: 0, degisimler: tek, kayitlar: k, simdi: ms('2026-11-18T08:00:00Z') })).toMatchObject({ hukum: 'olumlu', cakisan: null })
    const cift = [{ ...degisim(A, t0), ms: ms(t0) }, { ...degisim(A, '2026-11-12T09:00:00Z', { kart: 'BLG-82', pr: 2611 }), ms: ms('2026-11-12T09:00:00Z') }] as never
    const r = etkiHesapla({ h: degisim(A, t0), i: 0, degisimler: cift, kayitlar: k, simdi: ms('2026-11-18T08:00:00Z') })
    expect(r.hukum).toBe('ayrilamiyor')
    expect(r.cakisan).toContain('2026-11-12 BLG-82 #2611')
    expect(r.hukumNotu).toBe(r.cakisan)
  })
  it('defterSatirlari bozuk satırı ham olarak korur ve geçerli satırı ayırır', () => {
    const s = defterSatirlari(`${JSON.stringify(degisim(A, t0))}\nBOZUK{\n\n`)
    expect(s.map((x) => x.h !== null)).toEqual([true, false, false, false])
    expect(s[1].ham).toBe('BOZUK{')
    void satirlar
  })
})

describe('kontrol adresleri, tür, puan', () => {
  it('adresTipi: yazı, liste, kategori, ürün, kök', () => {
    expect(adresTipi(A)).toBe('yazi')
    expect(adresTipi(`${S}/tr/bilgi-merkezi`)).toBe('liste')
    expect(adresTipi(C)).toBe('category')
    expect(adresTipi(`${S}/tr/products/x`)).toBe('products')
    expect(adresTipi(`${S}/tr`)).toBe('kok')
  })
  it('kontrol: aynı türden, ölçümü olan, -7..+28 günde değişmemiş adresler; kendisi, başka tür, ölçümsüz ve değişen adres girmez', () => {
    const d1 = ms('2026-11-17T08:00:00Z')
    const D = `${S}/tr/bilgi-merkezi/d-yazi`
    const E = `${S}/tr/bilgi-merkezi/e-yazi`
    const gsc = (adres: string) => ({ adres, seri: { gunler: gscGunleri('2026-11-01', [[1, 5]]) } })
    const k = kayitKur({
      gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [gsc(A), gsc(B), gsc(C), gsc(D)] }],
      hareketler: [degisim(E, '2026-11-16T08:00:00Z')], // ölçümü yok zaten; değişmiş
    })
    const degisimler = [{ ...degisim(A, '2026-11-17T08:00:00Z'), ms: d1 }, { ...degisim(B, '2026-11-20T08:00:00Z'), ms: ms('2026-11-20T08:00:00Z') }, { ...degisim(E, '2026-11-16T08:00:00Z'), ms: ms('2026-11-16T08:00:00Z') }] as never
    // B 3 gün sonra değişti (pencere içinde), C başka tür, E ölçümsüz, A kendisi → yalnız D
    expect(kontrolBul({ adres: A, degisimMs: d1, degisimler, kayitlar: k })).toEqual([D])
    expect(kontrolBul({ adres: A, degisimMs: d1, degisimler, kayitlar: kayitKur({}) })).toBeNull()
  })
  it('etkiPuani: sıra iyileşmesi, görünmeyenden giriş, görünenden çıkış, bilinmiyor', () => {
    expect(etkiPuani({ gorunme: 'gorundu', sira: 12 }, { gorunme: 'gorundu', sira: 7 })).toBe(5)
    expect(etkiPuani({ gorunme: 'gorunmedi' }, { gorunme: 'gorundu', sira: 10 })).toBe(90)
    expect(etkiPuani({ gorunme: 'gorundu', sira: 10 }, { gorunme: 'gorunmedi' })).toBe(-90)
    expect(etkiPuani(null, { gorunme: 'gorundu' })).toBeNull()
    expect(etkiPuani({ gorunme: 'gorundu' }, { gorunme: 'gorundu', sira: 3 })).toBe(0)
  })
})

describe('depo içi çıktı yolu reddedilir (P6, repo PUBLIC)', () => {
  it('etkiYoluKontrol: depo içi yol geçersiz, depo dışı klasör geçerli', () => {
    expect(etkiYoluKontrol(join(KOK, 'docs', 'sayfa-zaman')).gecerli).toBe(false)
    expect(etkiYoluKontrol(join(KOK, 'docs', 'sayfa-zaman')).neden).toMatch(/git deposunun içinde|depo içinde/)
    expect(etkiYoluKontrol(KOK).gecerli).toBe(false)
    expect(etkiYoluKontrol(dizin()).gecerli).toBe(true)
  })
  it('etkiKos: depo içi --cikti, --arsiv ve --hareket reddedilir (kod 2), hiçbir dosya yazılmadan', () => {
    const d = dizin()
    const defter = join(d, 'dizin-takip', 'hareketler.jsonl')
    mkdirSync(join(d, 'dizin-takip'), { recursive: true })
    writeFileSync(defter, `${satirYaz(degisim(A, '2026-11-10T09:00:00Z') as never)}\n`)
    const once = readFileSync(defter, 'utf8')
    const repoIci = join(KOK, 'docs', 'defter', 'etki-deneme')
    for (const ek of [{ cikti: repoIci }, { arsiv: repoIci }, { olcumler: join(repoIci, 'olcumler.jsonl') }, { gscKlasor: repoIci }]) {
      const r = etkiKos({ defter, md: join(d, 'md.md'), simdi: ms('2026-11-20T08:00:00Z'), gunlukYedek: false, ...ek })
      expect(r.kod, JSON.stringify(ek)).toBe(2)
      expect(r.hata).toContain('depo')
    }
    expect(etkiKos({ defter: join(KOK, 'docs', 'hareketler.jsonl'), simdi: 1 }).kod).toBe(2)
    expect(readFileSync(defter, 'utf8')).toBe(once)
    expect(existsSync(repoIci)).toBe(false)
  })
})

describe('zaman çizgisi, dosya adı, özet', () => {
  it('olaylar tarih sıralıdır: değişiklik, istek, tarama, görünme, sıra; aynı anda tür sırası değişiklik önce', () => {
    const hareketler = [
      degisim(A, '2026-11-10T09:00:00Z', { kart: 'BLG-1', hukum: 'bekliyor' }),
      { tarih: '2026-11-10T09:00:00Z', motor: 'google', eylem: 'istek', adres: A },
      { tarih: '2026-11-12T09:00:00Z', motor: 'google', eylem: 'gorunme', adres: A, sonuc: 'gorundu' },
      { tarih: '2026-11-09T09:00:00Z', motor: 'bing', eylem: 'gonderim', adres: A },
    ]
    const k = kayitKur({
      hareketler, olcumler: [{ adres: A, ms: ms('2026-11-11T10:00:00Z'), motor: 'bing', tur: 'serp', kart: 'SEO-9', sira: 3 }],
      gscOkumalari: [{ alinma: ms('2026-11-25T08:00:00Z'), kayitlar: [{ adres: A, denetim: { sonTarama: '2026-11-10T22:00:00Z' }, seri: { gunler: gscGunleri('2026-11-13', [[2, 8.44], [0, null]]) } }] }],
    }).get(A)
    const z = zamanCizgisi({ adres: A, kayit: k, degisimler: [hareketler[0]], simdi: ms('2026-11-26T08:00:00Z') })
    expect(z.olaylar.map((o: { tur: string }) => o.tur)).toEqual(['istek', 'degisim', 'istek', 'tarama', 'sira', 'gorunme', 'sira'])
    expect(z.olaylar.map((o: { tarih: string }) => o.tarih)).toEqual([...z.olaylar.map((o: { tarih: string }) => o.tarih)].sort())
    expect(z.ozet).toMatchObject({ degisim: 1, istek: 2, tarama: 1, gorunme: 1, sira: 2, sonHukum: 'bekliyor' })
    // GSC günlük satırı yalnız gösterimi olan gün; sıra 1 ondalığa yuvarlanır
    expect(z.olaylar.find((o: { kaynak?: string }) => o.kaynak === 'gsc')).toMatchObject({ gosterim: 2, sira: 8.4, gunluk: true })
  })
  it('dosya adı slug; aynı slug başka tür/dil ise önek; yalnız [a-z0-9-]', () => {
    const a = dosyaAdlari([A, B, `${S}/tr`, `${S}/tr/bilgi-merkezi`, `${S}/tr/category/ayni`, `${S}/tr/products/ayni`, `${S}/tr/products/Büyük_Harf`])
    expect(a.get(A)).toBe('a-yazi.json')
    expect(a.get(`${S}/tr`)).toBe('ana-sayfa.json')
    expect(a.get(`${S}/tr/bilgi-merkezi`)).toBe('bilgi-merkezi.json')
    expect(a.get(`${S}/tr/category/ayni`)).toBe('category--ayni.json')
    expect(a.get(`${S}/tr/products/ayni`)).toBe('products--ayni.json')
    expect(a.get(`${S}/tr/products/Büyük_Harf`)).toMatch(/^[a-z0-9-]+\.json$/)
    expect(new Set(a.values()).size).toBe(a.size)
  })
  it('özet: son 7 gün, hüküm dağılımı, kazanan/kaybeden 5; ayrilamiyor listelenmez', () => {
    const simdi = ms('2026-11-26T08:00:00Z')
    const row = (n: number, ek: Satir) => ({ ...degisim(`${S}/tr/bilgi-merkezi/y${n}`, '2026-11-01T08:00:00Z'), ...ek }) as Record<string, unknown>
    const olumlu = (n: number, once: number, son: number) => row(n, { hukum: 'olumlu', once: { gorunme: 'gorundu', sira: once }, vadeler: { 3: null, 7: { gorunme: 'gorundu', sira: son }, 14: null, 28: null } })
    const satirlar = [
      ...[1, 2, 3, 4, 5, 6, 7].map((n) => olumlu(n, 40, 40 - n)), // puan n
      row(8, { hukum: 'olumsuz', once: { gorunme: 'gorundu', sira: 5 }, vadeler: { 3: null, 7: { gorunme: 'gorunmedi', sira: null }, 14: null, 28: null } }),
      row(9, { hukum: 'ayrilamiyor' }),
      row(10, { hukum: 'bekliyor', tarih: '2026-11-24T08:00:00Z' }),
      row(11, { tarih: '2026-11-25T08:00:00Z', kaynak: 'git-gecmisi' }),
    ]
    const o = ozetUret({ satirlar: satirlar as never, simdi })
    expect(o.satirSayisi).toBe(11)
    expect(o.gitGecmisi).toBe(1)
    expect(o.hukumDagilimi).toEqual({ olumlu: 7, olumsuz: 1, notr: 0, ayrilamiyor: 1, bekliyor: 2 })
    expect(o.kazananlar.map((x: { puan: number }) => x.puan)).toEqual([7, 6, 5, 4, 3])
    expect(o.kaybedenler).toHaveLength(1)
    expect(o.kaybedenler[0].puan).toBe(-95)
    expect(o.son7Gun.map((x: { adres: string }) => x.adres.split('/').pop())).toEqual(['y11', 'y10'])
  })
})

describe('etkiKos: uçtan uca (geçici arşiv, depo dışı)', () => {
  const SIMDI = ms('2026-11-12T08:00:00Z')
  const kur = () => {
    const arsiv = dizin()
    const dt = join(arsiv, 'dizin-takip')
    mkdirSync(dt, { recursive: true })
    mkdirSync(join(arsiv, 'gsc-sayfa', 'x'), { recursive: true })
    const defter = join(dt, 'hareketler.jsonl')
    const satirlar = [
      satirYaz(degisim(A, '2026-11-01T09:00:00Z', { kart: 'BLG-1', pr: 11 }) as never),
      'BOZUK SATIR {',
      satirYaz(degisim(B, '2026-11-01T10:00:00Z', { kart: 'BLG-2', pr: 12 }) as never),
      satirYaz(degisim(B, '2026-11-04T10:00:00Z', { kart: 'BLG-3', pr: 13 }) as never),
      satirYaz({ tarih: '2026-11-02T09:00:00Z', motor: 'google', eylem: 'istek', adres: A } as never),
    ]
    writeFileSync(defter, `${satirlar.join('\n')}\n`)
    const gunler = (a: Array<[number, number | null]>) => ({ gunler: gscGunleri('2026-10-20', a) })
    // A: değişiklik öncesi görünmüyor (20 Ekim..31 Ekim 0), sonra 4-5 Kasım görünüyor (3. gün = 4 Kasım)
    const seriA = gunler([...Array(15).fill([0, null]), [3, 9], [2, 7], ...Array(5).fill([2, 6])] as Array<[number, number | null]>)
    writeFileSync(join(arsiv, 'gsc-sayfa', 'x', 'gsc-sayfa-oku-2026-11-10.json'), JSON.stringify({ alinma: '2026-11-10T08:00:00Z', kayitlar: [{ adres: A, denetim: { sonTarama: '2026-11-02T05:00:00Z' }, seri: seriA }, { adres: B, seri: gunler(Array(22).fill([1, 20])) }] }))
    writeFileSync(join(dt, 'dizin-takip-2026-11-03.json'), JSON.stringify({ alinma: '2026-11-03T08:00:00Z', tablo: [{ adres: A, google: { sonTarama: '2026-10-25T05:00:00Z' }, bing: {} }] }))
    writeFileSync(join(arsiv, 'olcumler.jsonl'), `${JSON.stringify({ tarih: '2026-11-08T09:00:00Z', sorgu: 'ornek', motor: 'google', kart: 'SEO-9', kaynak: 'seo9/', tur: 'serp', sira: 5, adres: A })}\nBOZUK\n`)
    writeFileSync(join(arsiv, 'INDEKS.md'), '# İndeks\nilk satır\nbaşka bilgi: 1\n')
    // SEO-154: depo içi defterin geçici KOPYASI (eski ETKI bloklu biçim). `etkiKos` artık hiçbir depo içi dosyaya yazmaz; kopya bayt bayt aynı kalmalıdır.
    const md = join(arsiv, 'defter.md')
    writeFileSync(md, '# Defter\n\n<!-- OZET:BASLA -->\nözet\n<!-- OZET:BITIS -->\n\nÖnce\n\n<!-- ETKI:BASLA -->\neski blok\n<!-- ETKI:BITIS -->\n\nSonra\n')
    return { arsiv, dt, defter, md }
  }
  const kos = (k: ReturnType<typeof kur>, ek: Record<string, unknown> = {}) => etkiKos({ defter: k.defter, simdi: SIMDI, gunlukYedek: false, ...ek })

  it('vadeler ve hüküm yazılır; bozuk satır ve istek satırı aynen kalır; yedek alınır', () => {
    const k = kur()
    const once = readFileSync(k.defter, 'utf8')
    const r = kos(k)
    expect(r.kod, r.hata).toBe(0)
    const satirlar = readFileSync(k.defter, 'utf8').split('\n')
    expect(satirlar[1]).toBe('BOZUK SATIR {')
    expect(satirlar[4]).toBe(once.split('\n')[4])
    const a = JSON.parse(satirlar[0])
    expect(a).toMatchObject({ kart: 'BLG-1', pr: 11, hukum: 'olumlu' })
    expect(a.once).toMatchObject({ kaynak: 'gsc', gorunme: 'gorunmedi', sonTarama: '2026-10-25T05:00:00.000Z' })
    expect(a.vadeler['3']).toMatchObject({ kaynak: 'gsc', gorunme: 'gorundu' }) // 4 Kasım
    expect(a.vadeler['7']).toMatchObject({ gorunme: 'gorundu' }) // 8 Kasım: GSC (en yakın, sıralı) ve olcum aynı gün
    expect(a.vadeler['14']).toBeNull() // 15 Kasım henüz gelmedi
    expect(a.vadeler['28']).toBeNull()
    const b1 = JSON.parse(satirlar[2])
    expect(b1.hukum).toBe('ayrilamiyor')
    expect(b1.cakisan).toContain('BLG-3 #13')
    const yedekler = readdirSync(k.dt).filter((x) => x.startsWith('hareketler.yedek-'))
    expect(yedekler).toHaveLength(1)
    expect(readFileSync(join(k.dt, yedekler[0]), 'utf8')).toBe(once)
    expect(r.mesajlar.join('\n')).toContain('bozuk')
  })

  it('sayfa-zaman/<slug>.json ve ozet.json DEPO DIŞINA (çıktı klasörüne) yazılır', () => {
    const k = kur()
    kos(k)
    expect(readdirSync(join(k.dt, 'sayfa-zaman')).sort()).toEqual(['a-yazi.json', 'b-yazi.json'])
    const z = JSON.parse(readFileSync(join(k.dt, 'sayfa-zaman', 'a-yazi.json'), 'utf8'))
    expect(z.adres).toBe(A)
    expect(z.olaylar.map((o: { tur: string }) => o.tur)).toContain('degisim')
    expect(z.olaylar.map((o: { tur: string }) => o.tur)).toContain('tarama')
    const ozet = JSON.parse(readFileSync(join(k.dt, 'ozet.json'), 'utf8'))
    expect(ozet.satirSayisi).toBe(3)
    expect(ozet.hukumDagilimi).toMatchObject({ olumlu: 1, ayrilamiyor: 2 })
  })

  it('son koşu YALNIZ INDEKS satırına yazılır (diğer satırlar korunur); mesaj depo içi defterden söz etmez', () => {
    const k = kur()
    const r = kos(k)
    const indeks = readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8')
    expect(indeks).toContain('ilk satır')
    expect(indeks).toContain('başka bilgi: 1')
    expect(indeks).toContain('etki defteri son koşu: 2026-11-12T08:00:00.000Z')
    expect(sonKosuOku(indeks)).toBe(SIMDI)
    expect(indeks.match(/etki defteri son koşu:/g)).toHaveLength(1)
    expect(r.mesajlar).toContain('son koşu 2026-11-12T08:00:00.000Z: INDEKS eklendi')
    expect(r.mesajlar.join('\n')).not.toMatch(/defter md|ETKI bloğu|blok-yok/)
  })

  it('INV-DIZIN-ETKI-INDEKS-1: koşu depo içi defteri BAYT BAYT değiştirmez (geçici kopya ve gerçek defter); saat INDEKS\'te', () => {
    const k = kur()
    const kopyaOnce = readFileSync(k.md)
    const gercek = join(KOK, 'docs', 'defter', 'geo-seo-dizin.md')
    const gercekOnce = readFileSync(gercek)
    try {
      // `md` eski çağıran biçimidir (SEO-154 öncesi); parametre artık yok sayılır, kopyaya YAZILMAZ.
      const r = kos(k, { md: k.md })
      expect(r.kod, r.hata).toBe(0)
      expect(readFileSync(k.md).equals(kopyaOnce)).toBe(true)
      expect(readFileSync(k.md, 'utf8')).toContain('eski blok')
      expect(readFileSync(gercek).equals(gercekOnce)).toBe(true) // varsayılan yol da depo içi defteri hedeflememeli
      expect(sonKosuOku(readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8'))).toBe(SIMDI)
    } finally {
      if (!readFileSync(gercek).equals(gercekOnce)) writeFileSync(gercek, gercekOnce) // regresyon durumunda depoyu kirli bırakma
    }
    // Yapısal: depo içi defterde ETKI bloğu yok (kaldırıldı); OZET bloğu duruyor.
    const defterMetni = gercekOnce.toString('utf8')
    expect(defterMetni).not.toMatch(/ETKI:BASLA|ETKI:BITIS/)
    expect(defterMetni).toContain('<!-- OZET:BASLA -->')
  })

  it('INDEKS yoksa (üst klasör dahil) oluşturulur; ikinci koşu satırı çiftlemez', () => {
    const k = kur()
    const indeks = join(k.arsiv, 'yeni', 'ic', 'INDEKS.md')
    expect(kos(k, { indeks }).mesajlar).toContain('son koşu 2026-11-12T08:00:00.000Z: INDEKS olusturuldu')
    expect(readFileSync(indeks, 'utf8')).toBe('etki defteri son koşu: 2026-11-12T08:00:00.000Z\n')
    kos(k, { indeks, simdi: ms('2026-11-13T08:00:00Z') })
    expect(readFileSync(indeks, 'utf8')).toBe('etki defteri son koşu: 2026-11-13T08:00:00.000Z\n')
  })

  it('indeksYaz: dönüş değeri olusturuldu / eklendi / guncellendi', () => {
    const d = dizin()
    const yol = join(d, 'INDEKS.md')
    expect(indeksYaz(yol, '2026-11-12T08:00:00.000Z')).toBe('olusturuldu')
    writeFileSync(yol, '# başlık\n')
    expect(indeksYaz(yol, '2026-11-12T08:00:00.000Z')).toBe('eklendi')
    expect(indeksYaz(yol, '2026-11-13T08:00:00.000Z')).toBe('guncellendi')
  })

  it('ikinci koşu idempotent: satır değişmez, yeni yedek açılmaz, vadeler korunur', () => {
    const k = kur()
    kos(k)
    const birinci = readFileSync(k.defter, 'utf8')
    const yedekSayisi = readdirSync(k.dt).filter((x) => x.startsWith('hareketler.yedek-')).length
    const r2 = kos(k)
    expect(readFileSync(k.defter, 'utf8')).toBe(birinci)
    expect(readdirSync(k.dt).filter((x) => x.startsWith('hareketler.yedek-')).length).toBe(yedekSayisi)
    expect(r2.mesajlar.join('\n')).toContain('değişen etki satırı yok')
  })

  it('vade geldikçe yalnız null vade dolar, dolu vade yeniden yazılmaz', () => {
    const k = kur()
    kos(k)
    const ilk = JSON.parse(readFileSync(k.defter, 'utf8').split('\n')[0])
    // 20 Kasım: 14. gün (15 Kasım) gelmiş ama ölçüm yok → null kalır; 3. ve 7. gün aynı
    kos(k, { simdi: ms('2026-11-20T08:00:00Z') })
    const sonra = JSON.parse(readFileSync(k.defter, 'utf8').split('\n')[0])
    expect(sonra.vadeler['3']).toEqual(ilk.vadeler['3'])
    expect(sonra.vadeler['7']).toEqual(ilk.vadeler['7'])
    expect(sonra.vadeler['14']).toBeNull()
  })

  it('--kuru hiçbir şey yazmaz', () => {
    const k = kur()
    const once = readFileSync(k.defter, 'utf8')
    const indeksOnce = readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8')
    const r = kos(k, { kuru: true })
    expect(r.kod).toBe(0)
    expect(r.mesajlar[0]).toContain('KURU')
    expect(readFileSync(k.defter, 'utf8')).toBe(once)
    expect(readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8')).toBe(indeksOnce)
    expect(existsSync(join(k.dt, 'ozet.json'))).toBe(false)
    expect(readdirSync(k.dt).some((x) => x.startsWith('hareketler.yedek-'))).toBe(false)
  })

  it('defter dosyası yoksa kod 2 ve hiçbir şey yazılmaz (INDEKS dahil)', () => {
    const k = kur()
    const indeksOnce = readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8')
    const r = etkiKos({ defter: join(k.arsiv, 'yok', 'hareketler.jsonl'), simdi: SIMDI })
    expect(r.kod).toBe(2)
    expect(r.hata).toContain('defter yok')
    expect(readFileSync(join(k.arsiv, 'INDEKS.md'), 'utf8')).toBe(indeksOnce)
  })
})

describe('defterYaz: eşzamanlı ekleme', () => {
  it('okuma ile yazma arasında başka pencere satır eklediyse kuyruk korunur; başka değişiklikte yazmaz', () => {
    const d = dizin()
    const defter = join(d, 'h.jsonl')
    writeFileSync(defter, 'a\nb\n')
    appendFileSync(defter, 'c-eklenen\n') // koşu sırasında başka pencere ekledi
    expect(defterYaz({ defter, okunan: 'a\nb\n', yeni: 'a2\nb2\n' })).toEqual({ tamam: true })
    expect(readFileSync(defter, 'utf8')).toBe('a2\nb2\nc-eklenen\n')
    writeFileSync(defter, 'degisti\n')
    expect(defterYaz({ defter, okunan: 'a\nb\n', yeni: 'x\n' })).toHaveProperty('hata')
    expect(readFileSync(defter, 'utf8')).toBe('degisti\n')
  })
})

describe('son koşu saati: INDEKS, blok, açılış uyarısı', () => {
  it('sonKosuOku en yenisini alır; satır yoksa null', () => {
    expect(sonKosuOku('etki defteri son koşu: 2026-11-10T08:00:00.000Z\n- etki defteri son koşu: 2026-11-12T08:00:00Z')).toBe(ms('2026-11-12T08:00:00Z'))
    expect(sonKosuOku('hiç yok')).toBeNull()
    expect(sonKosuOku(undefined)).toBeNull()
  })
  it('indeks: satır varsa YERİNDE güncellenir ("- " önekli dahil), yoksa sona eklenir; başka satır korunur; ikinci koşu çiftlemez', () => {
    const iso1 = '2026-11-12T08:00:00.000Z'
    const iso2 = '2026-11-13T08:00:00.000Z'
    const ilk = indeksMetniniGuncelle('# İ\nsatır', iso1)
    expect(ilk).toBe(`# İ\nsatır\netki defteri son koşu: ${iso1}\n`)
    const ikinci = indeksMetniniGuncelle(ilk, iso2)
    expect(ikinci).toBe(`# İ\nsatır\netki defteri son koşu: ${iso2}\n`)
    expect(indeksMetniniGuncelle(`a\n- etki defteri son koşu: ${iso1}\nb\n`, iso2)).toBe(`a\netki defteri son koşu: ${iso2}\nb\n`)
    expect(indeksMetniniGuncelle('', iso1)).toBe(`etki defteri son koşu: ${iso1}\n`)
  })
  it('açılış uyarısı (INDEKS): taze sessiz; 24 saat ve eski "n saat önce"; kayıt yok/okunamıyor tek satır uyarı; fırlatmaz', () => {
    const d = dizin()
    const indeks = join(d, 'INDEKS.md')
    const simdi = ms('2026-11-12T12:00:00Z')
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toBe('ETKİ DEFTERİ: son koşu kaydı yok — dizin-takip --etki') // dosya yok
    expect(acilisUyarisi({ indeksYolu: join(d, 'olmayan', 'x.md'), simdi })).toContain('kaydı yok')
    expect(acilisUyarisi({ simdi })).toContain('kaydı yok') // yol hiç verilmedi
    expect(acilisUyarisi({ indeksYolu: null, simdi })).toContain('kaydı yok')
    writeFileSync(indeks, 'etki defteri son koşu: 2026-11-12T09:00:00.000Z\n')
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toBe('')
    writeFileSync(indeks, 'etki defteri son koşu: 2026-11-11T08:00:00.000Z\n') // 28 saat önce
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toBe('ETKİ DEFTERİ: son koşu 28 saat önce — dizin-takip --etki')
    writeFileSync(indeks, 'etki defteri son koşu: 2026-11-11T12:00:00.000Z\n') // tam 24 saat: eşik dahil
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toContain('24 saat önce')
    writeFileSync(indeks, 'etki defteri son koşu: 2026-11-11T12:00:01.000Z\n') // 24 saatin 1 sn altı: sessiz
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toBe('')
    writeFileSync(indeks, 'etki defteri son koşu: 2026-11-12T10:00:00.000Z\n')
    expect(acilisUyarisi({ indeksYolu: indeks, simdi: ms('2026-11-12T10:00:00Z') - 1 })).toBe('') // gelecek saat: 0 saat
    writeFileSync(indeks, '# içinde son koşu satırı olmayan indeks\nbaşka: 1\n') // bozuk/ilgisiz içerik = kayıt yok
    expect(acilisUyarisi({ indeksYolu: indeks, simdi })).toContain('kaydı yok')
    expect(() => acilisUyarisi({ indeksYolu: d, simdi })).not.toThrow() // klasör dosya diye verildi
    expect(acilisUyarisi({ indeksYolu: d, simdi })).toContain('kaydı yok')
  })
  it('INV-DIZIN-ETKI-INDEKS-1: açılış uyarısı YALNIZ INDEKS\'e bakar; depo içi blok taze olsa bile INDEKS yoksa "kaydı yok"', () => {
    const d = dizin()
    const simdi = ms('2026-11-12T12:00:00Z')
    const eskiMd = join(d, 'defter.md')
    writeFileSync(eskiMd, '<!-- ETKI:BASLA -->\nEtki defteri son koşu: 2026-11-12T11:00:00.000Z\n<!-- ETKI:BITIS -->\n') // taze ama artık okunmaz
    const eskiCagri = { indeksYolu: join(d, 'INDEKS.md'), mdYolu: eskiMd, simdi } // SEO-154 öncesi çağıran biçimi
    expect(acilisUyarisi(eskiCagri as never)).toBe('ETKİ DEFTERİ: son koşu kaydı yok — dizin-takip --etki')
    writeFileSync(join(d, 'INDEKS.md'), 'etki defteri son koşu: 2026-11-10T12:00:00.000Z\n') // INDEKS eski, md taze: INDEKS kazanır
    expect(acilisUyarisi(eskiCagri as never)).toBe('ETKİ DEFTERİ: son koşu 48 saat önce — dizin-takip --etki')
  })
  it('açılış satırı (dizin-acilis.calistir): uyarı AYNI satırın sonuna eklenir (kanca yalnız ilk satırı basar); taze ise satır eskisi gibi', () => {
    const arsiv = dizin()
    const dt = join(arsiv, 'dizin-takip')
    mkdirSync(dt, { recursive: true })
    writeFileSync(join(dt, 'dizin-takip-2026-11-12.json'), JSON.stringify({ alinma: '2026-11-12T08:00:00Z', tablo: [] }))
    const simdi = ms('2026-11-12T12:00:00Z')
    const temel = { klasor: dt, simdi, env: {}, baslat: false }
    const eski = acilisCalistir({ ...temel, etki: { indeksYolu: null } })
    // kaynak verilmemişse (null) kayıt yok uyarısı
    expect(eski).toContain('ETKİ DEFTERİ: son koşu kaydı yok — dizin-takip --etki')
    expect(eski.split('\n')).toHaveLength(1)
    writeFileSync(join(arsiv, 'INDEKS.md'), 'etki defteri son koşu: 2026-11-12T10:00:00.000Z\n')
    const taze = acilisCalistir(temel) // varsayılan kaynak: arşivin bir üstündeki INDEKS.md; depo içi defter okunmaz
    expect(taze).not.toContain('ETKİ DEFTERİ')
    writeFileSync(join(arsiv, 'INDEKS.md'), 'etki defteri son koşu: 2026-11-10T10:00:00.000Z\n')
    const bayat = acilisCalistir(temel)
    expect(bayat).toContain('| ETKİ DEFTERİ: son koşu 50 saat önce — dizin-takip --etki')
    expect(bayat.startsWith(taze)).toBe(true)
    expect(bayat.length).toBeLessThan(400) // kanca tek satırı 400 karakterle keser
  })
})

describe('CLI: dizin-takip --etki betiğe devreder', () => {
  const takip = resolve(__dirname, '..', 'dizin-takip.mjs')
  const etki = resolve(__dirname, '..', 'dizin-etki.mjs')
  const kos = (betik: string, args: string[]) => spawnSync(process.execPath, [betik, ...args], { encoding: 'utf8', env: { ...process.env, DIZIN_TAKIP_YEDEK2: '' } })
  it('depo içi --hareket çıkış 2 (ağa ve dosyaya gitmeden); depo içi --cikti çıkış 2', () => {
    const d = dizin()
    mkdirSync(join(d, 'dizin-takip'), { recursive: true })
    const defter = join(d, 'dizin-takip', 'hareketler.jsonl')
    writeFileSync(defter, `${satirYaz(degisim(A, '2026-11-10T09:00:00Z') as never)}\n`)
    const r1 = kos(takip, ['--etki', '--hareket', join(KOK, 'scripts', 'hareketler.jsonl')])
    expect(r1.status).toBe(2)
    expect(r1.stderr).toContain('git deposunun içinde')
    const r2 = kos(takip, ['--etki', '--kuru', '--hareket', defter, '--cikti', join(KOK, 'docs', 'etki-cikti')])
    expect(r2.status).toBe(2)
    expect(r2.stderr).toContain('depo')
    expect(existsSync(join(KOK, 'docs', 'etki-cikti'))).toBe(false)
  })
  it('--etki --kuru: devir çalışır, çıkış 0, hiçbir dosya yazılmaz; doğrudan betik aynı sonucu verir', () => {
    const d = dizin()
    mkdirSync(join(d, 'dizin-takip'), { recursive: true })
    const defter = join(d, 'dizin-takip', 'hareketler.jsonl')
    writeFileSync(defter, `${satirYaz(degisim(A, '2026-11-10T09:00:00Z') as never)}\n`)
    for (const [betik, ek] of [[takip, ['--etki']], [etki, []]] as Array<[string, string[]]>) {
      const r = kos(betik, [...ek, '--kuru', '--hareket', defter, '--simdi', '2026-11-20T08:00:00Z'])
      expect(r.status, r.stderr).toBe(0)
      expect(r.stdout).toContain('KURU: etki satırı 1')
    }
    expect(readdirSync(join(d, 'dizin-takip'))).toEqual(['hareketler.jsonl'])
    expect(kos(etki, ['--simdi', 'bozuk', '--hareket', defter]).status).toBe(2)
  })
})
