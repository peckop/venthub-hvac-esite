#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — HAFIZA SORUSU YÖNLENDİRME.
 *
 * NİÇİN VAR — ölçülmüş vaka sınıfı (2026-09-04'ten beri tekrar ediyor):
 * Recep "bunu konuşmuş muyduk / ne karar vermiştik / neden böyle" diye sorduğunda doğru
 * davranış ÖNCE ÖLÇMEK'tir: proje takip defterine sormak, sonra Linear/kodla doğrulamak.
 * Yapılan ise sık sık BAĞLAMDAN CEVAP VERMEK oldu — ve bağlam compact'le kırpıldığı için
 * cevap eksik çıktı. 2026-09-04'te aynı gün ÜÇ kez oldu (sepet, multitenant, admin aç-kapa);
 * bilgi dört yerde dağınıktı ve hiçbiri hatırlanan yer değildi.
 *
 * ⭐BU KANCA CEVABI ÜRETMEZ, ADRESİ HATIRLATIR. Ölçümü ajan yapar. Sebep: kanca ağ çağrısı
 * yapmaz (her isteme gecikme bindirir, hata yüzeyi büyür) ve YANLIŞ CEVAP ÜRETME riski
 * taşımaz. Hatırlatma ucuz, yanlış cevap pahalı.
 *
 * ⚠KAPSAM DARLIĞI KASITLI: tek kelimelik ipuçları ("geçen", "önce", "hatırla") KULLANILMAZ —
 * gündelik cümlelerde sürekli geçerler ve kanca her istemde öterse üç günde görmezden
 * gelinir. Yalnız ÇOK KELİMELİ, soru niteliği taşıyan kalıplar eşleşir.
 *
 * stdin: { session_id, prompt }
 * Çıkış: eşleşme varsa additionalContext ile 0; yoksa SESSİZ 0.
 */

const fs = require('fs')

/**
 * DEFTER KİMLİKLERİ — SSOT hafıza kaydı `proje-takip-defteri-nlm.md`.
 * İki defter BİLEREK ayrı: takip defteri "ne konuştuk/niçin", kod hafızası "koddan üretilmiş
 * master'lar". Soru türü hangisine gideceğini belirler; ikisini karıştırmak yanlış kaynaktan
 * doğru görünen cevap üretir.
 */
const DEFTER_TAKIP = 'a5f382a4-b4e7-450c-84e0-9b7c082e2502'
const DEFTER_KOD = '235043eb-970f-4a52-9f39-1d02b2621e9c'

/**
 * Kalıplar — hepsi çok kelimeli ve soru/geçmiş niteliği taşıyor.
 * `sinif` alanı hangi adresin önce geldiğini söyler: KARAR → takip defteri, KOD → kod hafızası.
 */
const KALIPLAR = [
  { re: /konu[sş]mu[sş]\s*(muydu|muyduk|mudur)/i, sinif: 'KARAR' },
  { re: /konu[sş]mu[sş]tuk/i, sinif: 'KARAR' },
  { re: /(ne|nas[iı]l)\s+karar\s+(verdik|vermi[sş]tik|alm[iı][sş]t[iı]k)/i, sinif: 'KARAR' },
  { re: /karar\s+verilmi[sş]\s*(miydi|mi)/i, sinif: 'KARAR' },
  { re: /hat[iı]rl[iı]yor\s+musun/i, sinif: 'KARAR' },
  { re: /(daha\s+)?[oö]nce\s+(konu[sş]|karar|s[oö]ylemi[sş]|demi[sş])/i, sinif: 'KARAR' },
  { re: /ne\s+planlam[iı][sş]t[iı]k/i, sinif: 'KARAR' },
  { re: /(niçin|nicin|neden)\s+(b[oö]yle|bu\s+[sş]ekilde|[oö]yle)\s*(yapt|karar|olmu[sş]|)/i, sinif: 'KARAR' },
  { re: /nerede\s+kalm[iı][sş]t[iı]k/i, sinif: 'KARAR' },
  { re: /bu\s+(kural|hükü?m|hukum)\s+nereden/i, sinif: 'KARAR' },
  // KOD sınıfı: "hangi dosya / neyi çağırıyor" — cevabı CodeGraph'te, deftere sorulmaz.
  { re: /(hangi\s+dosya|nerede\s+tan[iı]ml|neyi?\s+ça[gğ][iı]r)/i, sinif: 'KOD' },
]

function stdinOku() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

let girdi = {}
try {
  girdi = JSON.parse(stdinOku() || '{}')
} catch {
  process.exit(0)
}

const istem = String(girdi.prompt || '')
if (!istem) process.exit(0)

const eslesen = KALIPLAR.filter((k) => k.re.test(istem))
if (eslesen.length === 0) process.exit(0)

const kodMu = eslesen.every((k) => k.sinif === 'KOD')
const satirlar = []

satirlar.push('⭐HAFIZA SORUSU ALGILANDI — BAĞLAMDAN CEVAP VERME, ÖNCE ÖLÇ.')
satirlar.push('Niçin: bağlam compact ile kırpılır; "hatırladığın" şey eksik olabilir. 2026-09-04\'te')
satirlar.push('aynı gün üç kez bağlamdan cevaplandı ve üçü de eksikti.')

if (kodMu) {
  satirlar.push('SINIF: KOD/YAPI sorusu → önce CodeGraph (AST, ~1sn taze, kesin), grep\'ten ÖNCE.')
  satirlar.push('  kod hafızası defteri (mimari/niçin): notebooklm ask --notebook ' + DEFTER_KOD)
} else {
  satirlar.push('SINIF: KARAR/GEÇMİŞ sorusu → sıra ŞU: (1) defter, (2) Linear, (3) kod/dosya.')
  satirlar.push('  1) notebooklm ask --notebook ' + DEFTER_TAKIP + ' "<soru>"')
  satirlar.push('     (takip defteri = "ne konuştuk / niçin"; kod hafızası AYRI: ' + DEFTER_KOD + ')')
  satirlar.push('  2) Linear: ilgili REC kaydı + "Kararlar" belgesi — defter bayat olabilir.')
  satirlar.push('  3) Çelişirse KOD/KAYIT kazanır; defter snapshot\'tır, drift eder.')
  satirlar.push('  4) Transkript araması: ~/.claude/projects/<proje>/*.jsonl içinde anahtar kelime')
  satirlar.push('     (kanca aramayı KENDİ YAPMAZ: ağ/IO gecikmesi her isteme binmesin).')
}

satirlar.push('⚠CEVABINDA KAYNAK SÖYLE: "defterde şöyle yazıyor" ile "hatırlıyorum" ayrı şeylerdir.')
satirlar.push('Ölçemediysen "bilmiyorum, bakıyorum" de — uydurulmuş geçmiş, kaynaksızlıktan KÖTÜDÜR.')

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: satirlar.join('\n'),
    },
  }),
)
