#!/usr/bin/env node
'use strict'

/**
 * GÖREV BAŞLATICISI (ARC-254, OPS-232 hükmü 6 Kasım): bayat düzenli görevi HATIRLATMADAN İŞE çevirir.
 *
 *   node scripts/hijyen/gorev-baslat.cjs "öz-değerlendirme" [--rol <ROL>]
 *
 * NİÇİN: 6 Kasım ölçümü: damga yolu çalışıyor ama "⚠GÖREV" satırı yalnız "yapınca damgala" diyordu; işin kendisi
 * (çürütücüyü aç, son 7 günü oku, öneri yaz) hiçbir yerde kart ya da adım değildi, 3 rol bir hafta beklettiği halde
 * satırı görüp geçti. Bu betik iki çıktı verir ve HİÇBİR ŞEY YAZMAZ (salt okuma, ağ yok):
 *   1. KART TASLAĞI: müdürün Kanban'da `add_task` ile açacağı kartın başlığı ve açıklaması (numarayı pano sayacı verir).
 *   2. ÇÜRÜTÜCÜ BRIEF'İ: alt ajana verilecek görev metni; SABİT ALTI SORU burada değişmez (SORULAR).
 * Kartı açmak ve çürütücüyü başlatmak MCP çağrısıdır, müdür yapar; damga yine elle (gorev-damga.cjs).
 */

const { spawnSync } = require('node:child_process')

const GUN_MS = 86400000

/** OPS-232 sabit altı soru. Metni değiştirmek OPS kararıdır; test birebir sabitler. */
const SORULAR = [
  'Bu hafta hangi hata ikinci kez yapıldı, kalıcı çözümü ne?',
  'Gelen isteklerden hangisi gecikti ya da unutuldu?',
  'Hangi kart ya da kayıt bayat?',
  'Hangi iş geri dönüp düzeltildi?',
  'Hangi skill, kanca ya da Claude Code özelliği kullanıldı; hangisi kullanılmalıydı da kullanılmadı?',
  "İşe başlamadan önce Kanban'da aynı iş arandı mı, mükerrer iş var mı?",
]

/** Brief'i tanımlı görev adları (satır adı). Yeni görev eklemek = buraya girdi + test. */
const BASLATILABILIR = ['öz-değerlendirme']

function tarih(ms) {
  return new Date(ms).toISOString().slice(0, 10)
}

function dalAdi(cwd) {
  const r = spawnSync('git', ['-C', cwd, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', timeout: 3000, windowsHide: true })
  return r.status === 0 ? String(r.stdout || '').trim() : '?'
}

/** Çürütücü alt ajanın görev metni (saf: saat, dizin, dal verilir). */
function brief({ rol, ad, simdi, cwd, dal }) {
  const bas = tarih(simdi - 7 * GUN_MS)
  const bit = tarih(simdi)
  return [
    `Çalışma dizini: ${cwd} (dal ${dal}); uymuyorsa dur. SALT-OKUMA: dosya yazma, kart açma, Recep'e yazma, sage'e yazma YOK; açık PR dalına push YOK. Sonucu yalnız bana raporla.`,
    '',
    `GÖREV: ${rol} departmanının son 7 günlük (${bas} - ${bit}) işini "${ad}" için çürüt.`,
    `Oku: docs/roller/${rol}.md (Görev, Görev değil, Dosyalar satırı), docs/roller/${rol}-kurallar.md, .claude/rules/filo-ortak.md. Sonra son 7 günün ${rol} kartlarını (Kanban) ve PR'larını (git log --since=${bas}, gh pr list) bunlara karşı oku: dosya alanı, kurallar, kart disiplini.`,
    'ÖNCEKİ ÖLÇÜM: önce Kanban ve docs/olcum altında aynı haftanın kaydını ara (node scripts/arac/onceki-calisma.cjs "<konu>"); taze kayıt varsa yeniden ölçme.',
    '',
    'SABİT ALTI SORU (hepsini cevapla, her cevap kanıtlı: kart/PR numarası, dosya:satır; ölçemediğini "ölçülemedi" yaz):',
    ...SORULAR.map((s, i) => `${i + 1}. ${s}`),
    '',
    'RAPOR: altı sorunun cevabı + en çok 3 iyileştirme önerisi (her biri: ne, kazanç, bedel; gevşeten öneriyi ayrıca işaretle). Kısa tut.',
  ].join('\n')
}

/** Müdürün açacağı kartın taslağı. Numara pano sayacından alınır, burada uydurulmaz. */
function kartTaslagi({ rol, ad, simdi }) {
  return [
    `BAŞLIK: <${rol}-ÖN EK>-<sayaçtan>: Haftalık ${ad} (${tarih(simdi)})`,
    `AÇIKLAMA: Haftalık düzenli görev (rol kartı, istem-tazelik). Çürütücü alt ajan son 7 günü okur, sabit altı soruyu cevaplar, en çok 3 öneri OPS'a tek mesajla gider; sonra damga.`,
    `KAYNAK/CETVEL: docs/roller/${rol}.md Görev satırı, docs/roller/${rol}-kurallar.md, scripts/belge/rol-gorevleri.json, docs/standards/is-kayit-duzeni-standard.md.`,
    'ÖNCEKİ ÇALIŞMA: Kanban ve docs/olcum altında önceki haftanın aynı görev kartı aranır; bulunan numara buraya yazılır.',
    'YÖNTEM: alt ajan (çürütücü, salt okuma) + müdür birleştirir; sapma yazılır.',
    `BİTİŞ: OPS'a öneri mesajı gitti ve node scripts/hijyen/gorev-damga.cjs "${ad}" --rol ${rol} koştu.`,
  ].join('\n')
}

function arg(argv, ad) {
  const i = argv.indexOf(ad)
  return i >= 0 ? argv[i + 1] : undefined
}

function main(argv, { simdi = Date.now(), cwd = process.cwd(), dal } = {}) {
  const ad = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--rol')
  const rol = String(arg(argv, '--rol') || '').toUpperCase()
  if (!ad || !BASLATILABILIR.includes(ad)) {
    process.stderr.write(`Kullanım: gorev-baslat.cjs "<görev>" --rol <ROL>. Brief tanımlı görevler: ${BASLATILABILIR.join(', ')}\n`)
    return 2
  }
  if (!rol) {
    process.stderr.write('gorev-baslat: --rol zorunlu (ör. --rol ARAC)\n')
    return 2
  }
  const d = dal ?? dalAdi(cwd)
  process.stdout.write(`== KART TASLAĞI (müdür add_task ile açar) ==\n${kartTaslagi({ rol, ad, simdi })}\n\n`)
  process.stdout.write(`== ÇÜRÜTÜCÜ BRIEF'İ (alt ajan görev metni; ${rol.toLowerCase()}-curutucu, name vermeden) ==\n${brief({ rol, ad, simdi, cwd, dal: d })}\n`)
  return 0
}

if (require.main === module) {
  let kod = 1
  try {
    kod = main(process.argv.slice(2))
  } catch (e) {
    process.stderr.write(`gorev-baslat: ${(e && e.message) || e}\n`)
  }
  process.exit(kod)
}

module.exports = { main, brief, kartTaslagi, SORULAR, BASLATILABILIR }
