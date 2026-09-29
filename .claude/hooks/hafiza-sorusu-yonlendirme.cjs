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
 * ⭐İKİNCİ İŞ — ÖLÇÜM DEFTERİ ESLEMESİ (Recep 2026-09-29, "bu araştırmalar boşa gitmeyecek değil
 * mi?"): e-fatura, CRM/ERP, admin paneli, PIM ve satış hazırlığı konuları daha önce ÖLÇÜLDÜ ve
 * sonuçları konu başına bir deftere yazıldı. Kural yazmak yetmez: istemde konu geçince kanca defterin
 * yolunu söyler, ajan yeniden ölçmeden önce onu okur. Defter varsa tek satır; adı eşleşip dosya
 * bulunamazsa SESSİZ KALMAZ (kanca cetvelinin şartı: fail-open ama görünür).
 * Defter yolu: önce depo (`docs/olcum/`), sonra oturumun hafıza klasörü (`memory/olcum/`); HARİTA
 * taşımayı bitirince ikincisi düşer, kanca ikisini de dener.
 *
 * stdin: { session_id, prompt, transcript_path, cwd }
 * Çıkış: eşleşme varsa additionalContext ile 0; yoksa SESSİZ 0.
 */

const fs = require('fs')
const os = require('os')
const path = require('path')

/**
 * Konu → defter dosyası. Kalıplar KASITLI dar: kanca her istemde koşar, gündelik cümlede ötmemeli.
 * ⚠"checkout" tek başına YOK: `git checkout` bu filonun en sık cümlesi. "refine" yalnız büyük
 * harfli (`Refine` kütüphanesi); küçük harfli "refine et" İngilizce fiildir.
 * `\b` yalnız ASCII kelimelerde (ERP, CRM, PIM) kullanılır; Türkçe harfte `(?<!\p{L})` gerekir.
 */
const OLCUM_DEFTERLERI = [
  {
    dosya: 'e-fatura-muhasebe-erp.md',
    re: /e-?fatura|e-?ar[sş]iv|muhasebe|(?<!\p{L})ERP(?!\p{L})|para[sş][uü]t|entegrat[oö]r/iu,
  },
  {
    dosya: 'crm-erp-alan-kararlari.md',
    re: /(?<!\p{L})CRM(?!\p{L})|ERP\s+mod[uü]l|sat[iı]nalma|stok\s+mod[uü]l/iu,
  },
  {
    dosya: 'admin-panel-altyapisi.md',
    re: /admin\s+panel|tablo\s+k[uü]t[uü]phanesi|(?<!\p{L})Refine(?!\p{L})|shadcn/u,
  },
  { dosya: 'pim-unopim.md', re: /unopim|(?<!\p{L})PIM(?!\p{L})|akeneo/iu },
  {
    dosya: 'satis-hazirligi.md',
    re: /sat[iı][sş]\s+haz[iı]rl[iı][gğ][iı]|checkout\s+(ak[iı][sş]|sayfa|zincir)|sipari[sş]\s+zinciri/iu,
  },
]

/** Oturumun proje dizini: transcript yolunun klasörü, yoksa `<sid>.jsonl` araması (kancalarda aynı yöntem). */
function projeDiziniBul(sid, transcriptPath) {
  if (transcriptPath) {
    const d = path.dirname(transcriptPath)
    if (fs.existsSync(d)) return d
  }
  const kok = path.join(os.homedir(), '.claude', 'projects')
  try {
    for (const e of fs.readdirSync(kok, { withFileTypes: true })) {
      if (e.isDirectory() && sid && fs.existsSync(path.join(kok, e.name, sid + '.jsonl'))) {
        return path.join(kok, e.name)
      }
    }
  } catch {
    // proje dizinleri okunamadı: hafıza yolu denenmez, depo yolu yine denenir
  }
  return null
}

/**
 * Eşleşen defterlerin BULUNAN yolları ve bulunamayan adları.
 * Aday sırası: depo `docs/olcum/`, sonra `<proje dizini>/memory/olcum/`.
 */
function olcumDefterleri(istem, girdi) {
  const eslesen = OLCUM_DEFTERLERI.filter((d) => d.re.test(istem))
  if (eslesen.length === 0) return { bulunan: [], kayip: [] }
  const depo = process.env.CLAUDE_PROJECT_DIR || girdi.cwd || process.cwd()
  const proje = projeDiziniBul(girdi.session_id || '', girdi.transcript_path || '')
  const bulunan = []
  const kayip = []
  for (const d of eslesen) {
    const adaylar = [path.join(depo, 'docs', 'olcum', d.dosya)]
    if (proje) adaylar.push(path.join(proje, 'memory', 'olcum', d.dosya))
    const yol = adaylar.find((a) => fs.existsSync(a))
    if (yol) bulunan.push(yol.replace(/\\/g, '/'))
    else kayip.push(d.dosya)
  }
  return { bulunan, kayip }
}

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
  // ⚠"önce" tek başına geçmiş sorusu DEĞİL ("önce karar metnini oku", "önce konuşalım").
  // Eşleşme yalnız GEÇMİŞ ZAMAN fiiliyle: konuştuk/konuşmuştuk, karar verdik, söylemiştin, demiştik.
  // `(?<!\p{L})` = kelime başı; JS `\b` Türkçe harfleri (ö, ş) kelime saymaz, bu yüzden kullanılmaz.
  {
    re: /(?<!\p{L})(daha\s+)?[oö]nce\s+(konu[sş](tuk|mu[sş]tuk)|karar\s+(verdik|vermi[sş]tik|alm[iı][sş]t[iı]k)|s[oö]yle(din|mi[sş]tin|mi[sş]tim|mi[sş]tik)|de(din|dik|mi[sş]tin|mi[sş]tim|mi[sş]tik))/iu,
    sinif: 'KARAR',
  },
  { re: /ne\s+planlam[iı][sş]t[iı]k/i, sinif: 'KARAR' },
  // ⚠Son grupta BOŞ SEÇENEK vardı (`|)`): "neden böyle" geçen her cümle, örneğin hata ayıklarken
  // "neden böyle olmuş", hafıza sorusu sayılıyordu (2026-09-25 prompt denetimi, defalarca gözlendi).
  // "olmuş" da çıkarıldı: o bir hata sorusudur, geçmiş karar sorusu değil.
  {
    re: /(niçin|nicin|neden)\s+(b[oö]yle|bu\s+[sş]ekilde|[oö]yle)\s+(yapt[iı]k|yapm[iı][sş]t[iı]k|karar\s+(verdik|vermi[sş]tik|ald[iı]k|alm[iı][sş]t[iı]k))/iu,
    sinif: 'KARAR',
  },
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

// Makine mesajları taranmaz: alt ajan bildirimi (<task-notification>) ve başka oturumdan gelen
// mesaj (<cross-session-message>) Recep'in sorusu değildir; raporların içindeki "neden böyle",
// "önce karar" gibi ifadeler yanlış alarm üretiyordu (2026-09-25).
if (/^\s*<(task-notification|cross-session-message)\b/.test(istem)) process.exit(0)

const eslesen = KALIPLAR.filter((k) => k.re.test(istem))
const defter = olcumDefterleri(istem, girdi)
const defterSatirlari = []
if (defter.bulunan.length > 0) {
  defterSatirlari.push(
    'ÖLÇÜM DEFTERİ VAR: ' + defter.bulunan.join(', ') + ' — önce oku, yeniden ölçme yalnız tetikleyici oluşunca',
  )
}
if (defter.kayip.length > 0) {
  defterSatirlari.push(
    'ÖLÇÜM DEFTERİ ADI EŞLEŞTİ AMA DOSYA BULUNAMADI: ' + defter.kayip.join(', ') +
      ' (docs/olcum/ ve memory/olcum/ arandı) — konu daha önce ölçülmüş olabilir, Linear ve hafızada ara',
  )
}

if (eslesen.length === 0 && defterSatirlari.length === 0) process.exit(0)

const kodMu = eslesen.length > 0 && eslesen.every((k) => k.sinif === 'KOD')
const satirlar = [...defterSatirlari]

if (eslesen.length === 0) {
  // Yalnız ölçüm defteri eşleşti: hafıza sorusu değil, sorunun kendisi geçmiş bir ölçüme dokunuyor.
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: satirlar.join('\n') },
    }),
  )
  process.exit(0)
}

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
