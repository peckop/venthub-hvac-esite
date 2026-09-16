#!/usr/bin/env node
/**
 * DEFTER SORGUSU — aile × alan soruları, ham cevaplar jsonl'e (OPS emri 2026-09-10 06:37Z)
 *
 * ── NİÇİN VAR
 * Kaynak eşlemesi (adım 3) bir değeri ancak ürün kodunun YAKININDA metin olarak geçiyorsa
 * bulabiliyor. Ama katalogların bir kısmı değeri tabloda değil **grafik eğrisinde** verir;
 * orada metin arayan hiçbir betik onu bulamaz. Defter (NotebookLM) o boşluğu okur ve
 * "kaynakta tablo değeri YOK, yalnız eğride var" gibi bir cevabı ADIYLA söyleyebilir.
 * Pilot ölçümde tam bunu yaptı (STORM/debi, 2026-09-10).
 *
 * ── ⛔HAM CEVAP SAKLANIR, AYRIŞTIRMA AYRI ADIMDIR
 * Cevap serbest metindir. Onu yazarken ayrıştırmaya kalkmak iki hata üretir: (1) ayrıştırıcı
 * değişince soruyu YENİDEN sormak gerekir — defter çağrısı yavaş (~65 sn) ve kotalı;
 * (2) ayrıştırıcının attığı bilgi geri gelmez. Bu yüzden ham cevap + atıflar olduğu gibi
 * saklanır; yapılandırma sonraki adımın işidir. (K15'in aynı ruhu: bir kez sor.)
 *
 * ── İDEMPOTENT: aynı (aile, alan) bir daha SORULMAZ
 * jsonl'de kaydı olan soru atlanır. Yeniden sormak için --tazele.
 *
 * KOŞUM: node scripts/icerik-hatti/defter-sorgu.mjs --cikti=<jsonl> [--aile="STORM Serisi"] [--tavan=6]
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). Canlı DB'ye DOKUNMAZ.
 */
import { readFileSync, appendFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const arg = (ad, vars) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3) || vars
const CIKTI = arg('cikti', 'defter-cevaplari.jsonl')
const AILE_SUZ = arg('aile', '')
const TAVAN = Number(arg('tavan', '0')) || 0
const TAZELE = process.argv.includes('--tazele')
const DEFTER = arg('defter', '8bb600d9-4342-4a74-88f5-e4e47dbeebc9')

// Altı eksen: OPS'un saydığı hedef küme (çelişki + DEGER YOK tepesi).
// Soru metni HER ALANDA aynı iskeleti taşır — "belge + sayfa" ve "yoksa YOK de" şartı
// cevabı kanıta bağlar. İskeleti değiştirmek eski cevapları karşılaştırılamaz kılar.
const EKSENLER = [
  ['max_delivery_m3h', 'MAKSİMUM HAVA DEBİSİ (m³/h)'],
  ['max_static_pressure_pa', 'MAKSİMUM STATİK BASINÇ (Pa veya mmH2O)'],
  ['max_absorbed_power_w', 'ÇEKTİĞİ GÜÇ (W veya kW)'],
  ['voltage_v', 'BESLEME GERİLİMİ (V) ve FAZ (monofaze/trifaze)'],
  ['weight_kg', 'AĞIRLIK (kg)'],
  ['ip_rating', 'KORUMA SINIFI (IP)'],
]

const soruKur = (aile, etiket) =>
  `"${aile}" ailesindeki her model için ${etiket} kaç? ` +
  'Her değer için hangi belgede ve KAÇINCI SAYFADA geçtiğini yaz. ' +
  'Değer kaynakta tablo olarak yoksa açıkça "kaynakta yok" de ve varsa nerede ' +
  '(ör. yalnız performans eğrisinde) olduğunu söyle. TAHMİN ETME, uydurma.'

if (!AILE_SUZ) { console.error('ÖLÇÜLEMEDİ — --aile="<aile adı>" zorunlu (pilot: aile aile koşulur)'); process.exit(2) }

const soruldu = new Set()
if (existsSync(CIKTI) && !TAZELE) {
  for (const s of readFileSync(CIKTI, 'utf8').split('\n')) {
    if (!s.trim()) continue
    try { const k = JSON.parse(s); soruldu.add(`${k.aile}|${k.alan}`) } catch { /* bozuk satır atlanır */ }
  }
}

let sorulan = 0, atlanan = 0
for (const [alan, etiket] of EKSENLER) {
  if (TAVAN && sorulan >= TAVAN) break
  if (soruldu.has(`${AILE_SUZ}|${alan}`)) { atlanan++; console.log(`  ATLANDI (zaten var): ${alan}`); continue }
  const soru = soruKur(AILE_SUZ, etiket)
  const t0 = Date.now()
  let cevap = '', hata = ''
  try {
    cevap = execFileSync('notebooklm', ['ask', '-n', DEFTER, soru],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 300000 })
  } catch (e) {
    // Bir soru düşerse KOŞUM DURMAZ ama hata KAYDA GEÇER — sessizce eksik satır,
    // "soruldu ve cevap yok" ile "hiç sorulmadı"yı ayırt edilemez yapardı.
    hata = String(e.message || e).slice(0, 500)
  }
  const kayit = {
    aile: AILE_SUZ, alan, soru, cevap_ham: cevap, hata,
    saniye: Math.round((Date.now() - t0) / 1000), defter: DEFTER,
  }
  appendFileSync(CIKTI, JSON.stringify(kayit) + '\n', 'utf8')
  sorulan++
  console.log(`  ${hata ? '⛔HATA' : '✓'} ${alan} (${kayit.saniye} sn, ${cevap.length} karakter)`)
}

console.log(`\nDEFTER: ${AILE_SUZ} — ${sorulan} soru soruldu, ${atlanan} atlandı → ${CIKTI}`)
