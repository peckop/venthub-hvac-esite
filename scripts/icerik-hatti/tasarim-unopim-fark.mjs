#!/usr/bin/env node
/**
 * TASARIM ↔ UNOPIM FARK RAPORU (KTL-83; KTL-82'de yazılan betiğin depoya taşınmış hâli). SALT OKUMA: UnoPIM'e hiçbir şey yazmaz.
 * Karşılaştırma çekirdeği: `tasarim-unopim-fark-kurallar.mjs` (saf, vitest'te bozma testiyle kilitli).
 *
 * "Design tarafı" = yerel ANLIK GÖRÜNTÜLER (depo dışı klasör, `--goruntu <klasör>`; varsayılan arşiv deposu):
 *   ktl80-faz-b-2026-11-04/{seri-metin-ozet.json, ad-tr.csv, eksik60.json}, ktl82-faz-c-2026-11-04/{kuru-harita.json, aileler.json},
 *   ops-foto-urun-listesi-2026-11-02.csv (yeni model değerleri) + `tasarim-agac-veri.mjs` (katalog-grup düğüm eşlemesi, depoda).
 * TAZELEME ADIMI (her koşudan ÖNCE): Design'da bir şey değiştiyse anlık görüntüler DesignSync `get_file` ile yenilenir
 *   (Venthub New: assets/veri/katalog-grup-*.json, aileler.json; Design İçerik: seri-kaydi-*.json, eksik-içerik). Betik görüntülerin
 *   yaşını ölçer; `--eski-esik <gün>` (varsayılan 7) aşılırsa ÇIKIŞ 2 verir: eski görüntüyle "fark 0" yanıltıcıdır. `--eski-kabul` ile geçilir.
 * KULLANIM: node scripts/icerik-hatti/tasarim-unopim-fark.mjs [--goruntu <klasör>] [--cikti <klasör>] [--eski-esik 7] [--eski-kabul]
 *           BOZMA=1 → beklenen Design değerleri bilerek bozulur; betik farkı yakalamıyorsa KIRMIZI (çıkış 1). Çıktı "bozma-test-" önekiyle yazılır.
 * ÇIKIŞ: 0 tamam (fark 0 ya da fark raporlandı; bozma modunda yakalama tamam) · 1 bozma testi kör · 2 önkoşul (görüntü yok/eski, DB erişilemedi).
 * NOT: UnoPIM yerel Docker (`pim-unopim-unopim-pgsql-1`); canlı Supabase'e dokunmaz.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { dugum } from './tasarim-agac-veri.mjs'
import { ALANLAR, bozmaUygula, eskiGoruntuler, farkHesapla } from './tasarim-unopim-fark-kurallar.mjs'

const arg = (ad, varsayilan) => { const i = process.argv.indexOf(ad); return i >= 0 ? process.argv[i + 1] : varsayilan }
const KOK = arg('--goruntu', 'C:/Users/alize/VentHub-Gorsel-Arsiv/_liste')
const CIKTI = arg('--cikti', join(KOK, 'fark-raporu'))
const ESIK = Number(arg('--eski-esik', '7'))
const BOZMA = Boolean(process.env.BOZMA)
const B = join(KOK, 'ktl80-faz-b-2026-11-04')
const K = join(KOK, 'ktl82-faz-c-2026-11-04')
const DOSYALAR = [
  join(B, 'seri-metin-ozet.json'), join(B, 'ad-tr.csv'), join(B, 'eksik60.json'),
  join(K, 'kuru-harita.json'), join(K, 'aileler.json'), join(KOK, 'ops-foto-urun-listesi-2026-11-02.csv'),
]
const onkosul = (m) => { console.error(`ÖNKOŞUL: ${m}`); process.exit(2) }

const eksik = DOSYALAR.filter((d) => !existsSync(d))
if (eksik.length) onkosul(`anlık görüntü yok: ${eksik.join(', ')} (DesignSync ile tazele; --goruntu ile klasör ver)`)
const eski = eskiGoruntuler(DOSYALAR.map((d) => ({ ad: d, yasGun: (Date.now() - statSync(d).mtimeMs) / 86400000 })), ESIK)
if (eski.length && !process.argv.includes('--eski-kabul')) onkosul(`anlık görüntü ${ESIK} günden eski: ${eski.join('; ')}. Önce Design'dan tazele ya da --eski-kabul ile geç`)

function csvOku(p, ay) {
  const t = readFileSync(p, 'utf8').replace(/^\uFEFF/, ''); const satir = []; let f = '', q = false, row = []
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c }
    else if (c === '"') q = true
    else if (c === ay) { row.push(f); f = '' }
    else if (c === '\n') { row.push(f.replace(/\r$/, '')); f = ''; satir.push(row); row = [] }
    else f += c
  }
  if (f || row.length) { row.push(f); satir.push(row) }
  const h = satir.shift()
  return satir.filter((r) => r.length === h.length).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])))
}
const json = (p) => JSON.parse(readFileSync(p, 'utf8'))

const aileler = json(join(K, 'aileler.json'))
const seriAile = new Map(); const aileMarka = new Map()
for (const [slug, , marka, ss] of aileler) { aileMarka.set(slug, marka); for (const [id] of ss) seriAile.set(id, slug) }
const seriDugum = new Map(); for (const [d, l] of Object.entries(dugum)) for (const s of l) seriDugum.set(s, d)
const harita = json(join(K, 'kuru-harita.json'))

let satirlar
try {
  satirlar = execFileSync('docker', ['exec', 'pim-unopim-unopim-pgsql-1', 'psql', '-U', 'unopim', '-d', 'unopim', '-At', '-F', '\t', '-c',
    'select p.sku, a.code, p.status::text, p.values::text from products p join attribute_families a on a.id=p.attribute_family_id order by p.sku'],
  { encoding: 'utf8', maxBuffer: 1 << 29 }).split('\n').filter(Boolean)
} catch (e) { onkosul(`UnoPIM veritabanına erişilemedi (Docker açık mı?): ${String(e.message).slice(0, 160)}`) }
const urunler = satirlar.map((l) => { const [sku, aile, status, v] = l.split('\t'); return { sku, aile, status, v: JSON.parse(v) } })

let girdi = {
  urunler,
  ozet: json(join(B, 'seri-metin-ozet.json')).seriler,
  skuSeri: new Map(harita.sonuc.map((r) => [r.sku, r.seri])),
  seriAile, aileMarka, seriDugum,
  eksik60: json(join(B, 'eksik60.json')).urunler,
  adTr: new Map(csvOku(join(B, 'ad-tr.csv'), ',').map((r) => [r.sku, r.ad_tr])),
  degerCsv: new Map(csvOku(join(KOK, 'ops-foto-urun-listesi-2026-11-02.csv'), ';').filter((r) => /^yeni/.test(r.durum)).map((r) => [r.sku, r])),
}
const temiz = farkHesapla(girdi)
if (BOZMA) girdi = bozmaUygula(girdi)
const sonuc = BOZMA ? farkHesapla(girdi) : temiz

const tarih = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
mkdirSync(CIKTI, { recursive: true })
const cikti = {
  tarih: new Date().toISOString(), urun: urunler.length, ozet: sonuc.ozet,
  atlanan: { tasarimdaMetinYok: sonuc.atlanan.tasarimdaMetinYok.length, adKaynagiYok: sonuc.atlanan.adKaynagiYok, teknikKaynagiDBde: sonuc.atlanan.teknikKaynagiDBde },
  fark: Object.fromEntries(Object.entries(sonuc.fark).map(([k, v]) => [k, v.slice(0, 50)])),
  tasarimdaMetinYokSku: sonuc.atlanan.tasarimdaMetinYok,
}
writeFileSync(join(CIKTI, `${BOZMA ? 'bozma-test-' : 'fark-'}${tarih}.json`), JSON.stringify(cikti, null, 1))
console.log(JSON.stringify({ urun: urunler.length, ozet: sonuc.ozet, atlanan: cikti.atlanan }))
if (BOZMA) {
  // bozma testi: temiz koşuya göre HER alanda yeni fark çıkmalı (teknik, yalnız değer CSV'si olan modelde bozulabilir)
  const kor = ALANLAR.filter((k) => sonuc.fark[k].length <= temiz.fark[k].length)
  if (kor.length) { console.error(`BOZMA TESTİ KÖR: şu alanlarda bozulan değer yakalanmadı: ${kor.join(', ')}`); process.exit(1) }
  console.log('bozma testi: tüm alanlarda yakalandı')
}
