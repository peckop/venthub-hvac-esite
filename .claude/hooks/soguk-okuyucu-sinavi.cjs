#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook — SOĞUK OKUYUCU SINAVI ÇAĞRISI (yalnız HATIRLATIR, sınavı ajan koşar).
 *
 * NİÇİN VAR — ölçülmüş vaka (2026-09-06, Recep'in kendi cümlesi): "aldığın notları geriye
 * dönük okuduğunda kendin bile anlamıyorsun." Aynı gün iki vaka: sabah "(sabah cetvel)"
 * kısaltması defterde "yapıldı"ya döndü ve ben defteri suçladım — kaynak kendi cümlemdi;
 * akşam kendi skill envanteri belgemi okuyup ne yaptığımı çıkaramadım, 40 dakika "bulamadım"
 * dedim. Not, o anki bağlamı bilen birine yazılıyor; okuyan (yarınki ben, defter, şerit)
 * o bağlamı görmüyor. BU YÜZDEN: compact sonrası ben de soğuk okuyucuyum.
 *
 * ⭐SINAV, HAFIZA SINAVININ TERSİ: defterin değil NOTUN sınavı. Bağlamsız bir ajan yalnız notu
 * okur ve NE · DURUM · KANIT · KİMDE söyler; benim bildiğimle uyuşmazsa not GEÇMEZ, yeniden yazılır.
 *
 * ⛔KAPSAM DARLIĞI OPS HÜKMÜ (2026-09-07): HER NOTA DEĞİL. Yalnız iki yüzey:
 *   (a) compact dilim kaydının ANLAM kısmı, (b) gün kapanışı notları.
 * Sebep: her yazmada sınav isteyen kanca üç günde görmezden gelinir ve o andan sonra
 * VAR ama YOK sayılır (aynı ders bu demetin üç kancasında da tekrarlandı).
 * Günde üst sınır 6 — sayaç panoda, gün damgasıyla anahtarlı.
 *
 * ⚠BU KANCA SINAVI KENDİ KOŞMAZ: kanca modeli çağıramaz; çağırabilse de her yazmaya jeton
 * bindirmek isteneni aşardı. Kanca ÖLÇER (yüzey mi, sınır aşıldı mı) ve EMRİ metin olarak
 * verir; Agent'ı ajan açar, model sonnet (pahalı model gerekmeyen mekanik okuma).
 *
 * stdin: { session_id, tool_name, tool_input: { file_path, ... } }
 * Çıkış: DAİMA 0. Eşleşme varsa additionalContext; yoksa SESSİZ.
 */

const fs = require('fs')
const path = require('path')

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
/** OPS emri: günde en çok 6 sınav. Aşılırsa kanca susar (gürültü > fayda). */
const GUNLUK_SINIR = Number(process.env.VENTHUB_SOGUK_SINIR || 6)
const MODEL = 'sonnet'

/** Yazma fiilleri — okuma araçları sınav tetiklemez. */
const YAZAN_ARACLAR = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])

/**
 * YÜZEY KALIPLARI — dosyanın İÇERİĞİNDE aranır, dosya ADINDA değil.
 * Niçin içerik: aynı gün-durumu dosyasına gün içinde onlarca kez yazılır; sınavı hak eden şey
 * dosya değil, o dosyaya inen KAYIT TÜRÜdür. Ada bakan ölçüt her yazmada öter (kapsam darlığı ölür).
 */
const YUZEYLER = [
  { re: /###\s*ANLAM\b/i, ad: 'compact dilim kaydi — ANLAM kismi' },
  { re: /COMPACT\s+D[İIı]L[İIı]M/i, ad: 'compact dilim kaydi' },
  { re: /G[UÜ]N\s+SONU/i, ad: 'gun kapanisi notu' },
  { re: /G[UÜ]N\s+KAPANI[SŞsş]/i, ad: 'gun kapanisi notu' },
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

const arac = String(girdi.tool_name || '')
if (!YAZAN_ARACLAR.has(arac)) process.exit(0)

/**
 * MSYS YOLU ÇEVİRİSİ — ölçülmüş kusur sınıfı (2026-09-07, eylem defteri kancasında aynısı çıktı):
 * bash tarafından gelen `/c/tmp/...` biçimi Node'da Windows'ta OLMAYAN bir yere çözülür, dosya
 * okunamaz ve kanca SESSİZ kalır. O sessizlik "yüzey değil" gibi okunur — fail-open yüz.
 */
function windowsYolu(y) {
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(y)
  return m ? m[1].toUpperCase() + ':/' + m[2] : y
}

const yol = windowsYolu(String((girdi.tool_input && (girdi.tool_input.file_path || girdi.tool_input.notebook_path)) || ''))
if (!yol || !/\.mdx?$/i.test(yol)) process.exit(0)

/** İçeriği DİSKTEN okur: Edit'in tool_input'undaki parça tüm kaydı göstermez. */
let icerik = ''
try {
  icerik = fs.readFileSync(yol, 'utf8')
} catch {
  process.exit(0)
}

const yuzey = YUZEYLER.find((y) => y.re.test(icerik))
if (!yuzey) process.exit(0)

/** GÜNLÜK SINIR + AYNI DOSYA TEKRARI — sayaç panoda (UTC gün damgası). */
const gun = new Date().toISOString().slice(0, 10)
const sayacYolu = path.join(PANO, '.soguk-okuyucu.' + gun + '.json')
let sayac = { adet: 0, dosyalar: [] }
try {
  sayac = JSON.parse(fs.readFileSync(sayacYolu, 'utf8'))
} catch {
  /* günün ilki */
}
const dosyalar = Array.isArray(sayac.dosyalar) ? sayac.dosyalar : []
/**
 * AYNI DOSYA İKİNCİ KEZ SINAV İSTEMEZ: bir kayıt yazılırken 5-10 kez düzenlenir.
 * ⭐KİMLİK TAM YOL, basename DEĞİL: iki şeridin `state.md`si aynı adı taşır ve basename'e bakan
 * sayaç ikinci şeridin notunu SESSİZCE muaf tutardı — ayırt etmeyen ölçüt ölçüm değildir.
 */
const kimlik = yol.replace(/\\/g, '/').toLowerCase()
if (dosyalar.includes(kimlik)) process.exit(0)
if (Number(sayac.adet || 0) >= GUNLUK_SINIR) process.exit(0)

const sira = Number(sayac.adet || 0) + 1
try {
  fs.mkdirSync(PANO, { recursive: true })
  fs.writeFileSync(sayacYolu, JSON.stringify({ adet: sira, dosyalar: dosyalar.concat(kimlik) }), 'utf8')
} catch {
  /* sayaç yazılamadı: en kötü hâli sınavın tekrar istenmesi — sessizlik DEĞİL */
}

const satirlar = [
  '⭐SOĞUK OKUYUCU SINAVI GEREKİYOR — yüzey: ' + yuzey.ad,
  'dosya: ' + yol,
  'Niçin: notu, o anki bağlamı bilen birine yazdın; okuyan (yarınki sen, defter, şerit) o bağlamı',
  'görmüyor. Compact sonrası SEN DE soğuk okuyucusun. 2026-09-06: iki kez kendi notumdan ne',
  'yaptığımı çıkaramadım; birinde defteri suçladım, kaynak kendi kısaltmamdı.',
  '',
  'YAPILACAK — tek Agent çağrısı, model ' + MODEL + ':',
  '  Agent({ model: "' + MODEL + '", subagent_type: "general-purpose", prompt: <asagidaki> })',
  '  PROMPT: "Baglamin YOK ve olmayacak; aciklama isteme. Yalniz su dosyayi oku: ' + yol,
  '  Yalnizca EN SON eklenen kaydi dikkate al. Dort alani soyle: NE (fiil+nesne) ·',
  '  DURUM (YAPILDI / ACIK / YARIN / CURUDU — kelimeyle) · KANIT (dosya/PR/saat/yol) · KIMDE.',
  '  Cikaramadigin alan icin ACIKCA \'cikaramadim\' yaz; TAHMIN ETME."',
  '',
  '⛔GEÇME ÖLÇÜTÜ: dönen cevap bildiğinle UYUŞMUYORSA ya da bir alan "çıkaramadım" ise',
  '  NOT GEÇMEDİ — notu yeniden yaz, sınavı tekrarla. "Ben anlıyorum" kanıt değildir.',
  '  Kısaltma ve parantez DURUM BELİRTMEZ ("(sabah cetvel)" → defter "yapıldı" sandı).',
  'Bugünün sınavı: ' + sira + '/' + GUNLUK_SINIR + ' (üst sınır OPS emri).',
]

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: satirlar.join('\n'),
    },
  }),
)
process.exit(0)
