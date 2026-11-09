#!/usr/bin/env node
/**
 * UNOPIM ÜRÜN İÇERİĞİ DOLULUK ÖLÇÜMÜ (KTL-86; defter: docs/defter/katalog-unopim-icerik.md). SALT OKUMA: UnoPIM'e yazmaz.
 * Kaynak: yerel UnoPIM veritabanı (Docker `pim-unopim-unopim-pgsql-1`); canlı Supabase'e dokunmaz.
 *
 * KULLANIM
 *   node scripts/icerik-hatti/unopim-icerik-olc.mjs                 ölç, özeti yaz (stdout), ayrıntıyı --cikti klasörüne yaz
 *   node scripts/icerik-hatti/unopim-icerik-olc.mjs --kontrol       ölç ve defterdeki özet bloğuyla kıyasla (manifest `olcum`)
 *   node scripts/icerik-hatti/unopim-icerik-olc.mjs --md            defter tabloları için markdown üret (stdout)
 *   --defter <yol>  (varsayılan docs/defter/katalog-unopim-icerik.md) · --cikti <klasör> (varsayılan ~/VentHub-Gorsel-Arsiv/_liste/unopim-icerik-olcum)
 * ÇIKIŞ (defter standardı D2.4): 0 tutarlı/ölçüldü · 1 defter ile canlı arasında sapma · 2 ölçülemedi (Docker kapalı, blok yok).
 *   "Ölçülemedi" asla "tutarlı" sayılmaz.
 * Ham ayrıntı (ürün SKU listeleri) depoya girmez: `doldurulacak.csv` ve `ozet.json` çıktı klasöründe kalır, sha256'sı stdout'tadır.
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { blokOku, doluluk, karsilastir, kaynakFarki, ozetBlogu } from './unopim-icerik-kurallar.mjs'

const arg = (ad, varsayilan) => { const i = process.argv.indexOf(ad); return i >= 0 ? process.argv[i + 1] : varsayilan }
const bayrak = (ad) => process.argv.includes(ad)
const DEFTER = arg('--defter', 'docs/defter/katalog-unopim-icerik.md')
const CIKTI = arg('--cikti', join(homedir(), 'VentHub-Gorsel-Arsiv', '_liste', 'unopim-icerik-olcum'))
const olculemedi = (m) => { console.error(`ÖLÇÜLEMEDİ: ${m}`); process.exit(2) }

function psql(sorgu) {
  return execFileSync('docker', ['exec', 'pim-unopim-unopim-pgsql-1', 'psql', '-U', 'unopim', '-d', 'unopim', '-At', '-F', '\t', '-c', sorgu],
    { encoding: 'utf8', maxBuffer: 1 << 29 }).split('\n').filter(Boolean)
}

let urunler, aileAlanlari
try {
  urunler = psql('select p.sku, a.code, p.status::text, p.values::text from products p join attribute_families a on a.id=p.attribute_family_id order by p.sku')
    .map((l) => { const [sku, aile, status, v] = l.split('\t'); return { sku, aile, status, values: JSON.parse(v) } })
  aileAlanlari = {}
  for (const l of psql('select a.code, at.code from attribute_families a join attribute_family_group_mappings m on m.attribute_family_id=a.id join attribute_group_mappings g on g.attribute_family_group_id=m.id join attributes at on at.id=g.attribute_id')) {
    const [aile, alan] = l.split('\t'); (aileAlanlari[aile] ||= []).push(alan)
  }
} catch (e) { olculemedi(`UnoPIM veritabanına erişilemedi (Docker açık mı?): ${String(e.message).slice(0, 160)}`) }
if (!urunler.length) olculemedi('UnoPIM\'de ürün okunamadı (0 satır)')

const sha = (t) => createHash('sha256').update(t).digest('hex')
// Kaynak damgası (tetik = kaynak değişikliği, ölçüm kör koşmaz): UnoPIM son ürün güncellemesi + ürün sayısı,
// Design anlık görüntü dosyalarının (fark betiğinin okuduğu altı dosya) birleşik sha256'sı.
let unopimSon, unopimSay
try { [unopimSon, unopimSay] = psql('select max(updated_at)::text, count(*) from products')[0].split('\t') } catch (e) { olculemedi(`kaynak damgası okunamadı: ${String(e.message).slice(0, 120)}`) }
const GORUNTU_KOKU = process.env.KATALOG_GORUNTU_KOKU || join(homedir(), 'VentHub-Gorsel-Arsiv', '_liste')
const GORUNTULER = [
  'ktl80-faz-b-2026-11-04/seri-metin-ozet.json', 'ktl80-faz-b-2026-11-04/ad-tr.csv', 'ktl80-faz-b-2026-11-04/eksik60.json',
  'ktl82-faz-c-2026-11-04/kuru-harita.json', 'ktl82-faz-c-2026-11-04/aileler.json', 'ops-foto-urun-listesi-2026-11-02.csv',
].map((d) => join(GORUNTU_KOKU, d))
const tasarimGoruntuSha = GORUNTULER.every(existsSync) ? sha(GORUNTULER.map((d) => sha(readFileSync(d))).join('\n')) : null
const kaynak = { unopimSonGuncelleme: unopimSon, unopimUrunSayisi: Number(unopimSay), tasarimGoruntuSha }

const sonuc = doluluk(urunler, aileAlanlari)
const blok = ozetBlogu(sonuc, kaynak)

if (bayrak('--kontrol')) {
  if (!existsSync(DEFTER)) olculemedi(`defter dosyası yok: ${DEFTER}`)
  const defterBlok = blokOku(readFileSync(DEFTER, 'utf8'))
  if (!defterBlok) olculemedi(`defterde "olcum-ozet" bloğu yok ya da bozuk: ${DEFTER}`)
  const fark = karsilastir(defterBlok, blok)
  if (fark.length) { console.error(`SAPMA (${fark.length}): defter bayat ya da UnoPIM değişti\n- ${fark.join('\n- ')}`); process.exit(1) }
  const kf = kaynakFarki(defterBlok.kaynak, kaynak)
  if (kf.length) { console.error(`KAYNAK DEĞİŞTİ (${kf.length}): sayılar aynı ama kaynak değişti; ölçümü yeniden koş, defteri güncelle\n- ${kf.join('\n- ')}`); process.exit(1) }
  console.log(`TUTARLI, KAYNAK DEĞİŞMEDİ: son ölçümün sonucu geçerli (${blok.urun} ürün, ${blok.aile} aile, kısmi alan ${blok.teknik.kismiAlan}, tam boş alan ${blok.teknik.tamBosAlan}; UnoPIM son güncelleme ${kaynak.unopimSonGuncelleme}; Design anlık görüntü ${kaynak.tasarimGoruntuSha ? 'sha aynı' : 'damgası yok (dosya bulunamadı), karşılaştırılmadı'})`)
  process.exit(0)
}

if (bayrak('--md')) {
  const DAYANAK = '`unopim-icerik-olc.mjs --md`, ' + new Date().toISOString().slice(0, 10)
  const s = [`<!-- olcum-ozet:basla\n${JSON.stringify(blok, null, 1)}\nolcum-ozet:bitti -->`, '', '| Alan | Dolu | Toplam | Boş | Dayanak (komut, tarih) |', '|---|---|---|---|---|']
  for (const [k, v] of Object.entries(sonuc.genel)) s.push(`| \`${k}\` | ${v.dolu} | ${v.n} | ${v.n - v.dolu} | ${DAYANAK} |`)
  const alanBos = {}
  for (const t of sonuc.teknikSatirlari) { const a = (alanBos[t.alan] ||= { aile: 0, bos: 0, tam: 0, kismiBos: 0 }); a.aile++; a.bos += t.bos; if (t.dolu === 0) a.tam++; else a.kismiBos += t.bos }
  s.push('', '| Teknik alan | Boşluklu aile | Boş hücre | Ailede tamamen boş (aile sayısı) | Kısmi boş hücre | Dayanak (komut, tarih) |', '|---|---|---|---|---|---|')
  for (const [k, v] of Object.entries(alanBos).sort((a, b) => b[1].bos - a[1].bos)) s.push(`| \`${k}\` | ${v.aile} | ${v.bos} | ${v.tam} | ${v.kismiBos} | ${DAYANAK} |`)
  console.log(s.join('\n'))
  process.exit(0)
}

mkdirSync(CIKTI, { recursive: true })
const csv = '﻿' + ['aile;alan;aile_urun;dolu;bos;durum;bos_sku', ...sonuc.teknikSatirlari.map((t) => `${t.aile};${t.alan};${t.urun};${t.dolu};${t.bos};${t.dolu === 0 ? 'ailede-tamamen-bos' : 'kismi'};${t.bosSku.join(',')}`)].join('\r\n') + '\r\n'
const ozetJson = JSON.stringify({ tarih: new Date().toISOString(), ...blok }, null, 1)
writeFileSync(join(CIKTI, 'doldurulacak.csv'), csv)
writeFileSync(join(CIKTI, 'ozet.json'), ozetJson)
console.log(JSON.stringify({ ...blok, cikti: CIKTI, sha256: { 'doldurulacak.csv': sha(csv), 'ozet.json': sha(ozetJson) } }))
