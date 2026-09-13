#!/usr/bin/env node
/**
 * evals.json → YERLEŞİK eval vaka ağacı dönüştürücüsü (REC-319 adım 2b).
 *
 * NİÇİN: Claude Code'un yerleşik `claude plugin eval` komutu vakaları
 * `<eval dir>/<vaka>/prompt.md` + `<vaka>/graders/*.md` biçiminde bekliyor.
 * Bizim 62 sınav dosyamız `evals/evals.json` biçiminde (ölçüldü 2026-09-13:
 * evals.json 62 · case.yaml 0 · prompt.md 0). Yerleşik koşucunun önündeki
 * engel paketleme DEĞİL, bu biçim farkıdır.
 *
 * ⛔KAYNAK SİLİNMEZ. `evals.json` yerinde kalır ve REC-303 betiği onu kullanmaya
 * devam eder. İkisi birlikte yaşar; emeklilik kararı kafa kafaya bir koşumdan
 * SONRA verilir (karar tablosu: docs/audits/rec319-yerlesik-skill-araclari-2026-09-13.md).
 *
 * ÜRETİLMİŞ AĞAÇ — elle düzenlenmez (AXIOM 3). Değişiklik kaynakta yapılır,
 * betik yeniden koşulur. Betik İDEMPOTENT: ikinci koşu "ayni" der, dosya yazmaz.
 *
 * KULLANIM
 *   node scripts/skills-eval-convert.mjs --kuru     # yalnız sayar, yazmaz
 *   node scripts/skills-eval-convert.mjs            # yazar
 *   node scripts/skills-eval-convert.mjs --skill=investigate   # tek skill
 */
import fs from 'node:fs'
import path from 'node:path'

const depoKoku = path.resolve(import.meta.dirname, '..')
/** Her giriş: [eklenti kökü, skill dizini]. Sınav hedefi EKLENTİ KÖKÜDÜR. */
const AGACLAR = [
  ['.claude', '.claude/skills'],
  ['.agent', '.agent/skills'],
]
/**
 * Üretilen ağacın adı. `evals/` DEĞİL: kaynağın yanında durup onu ezmesin.
 *
 * ⭐YER, TAHMİNLE DEĞİL ÖLÇÜMLE BULUNDU: ilk hâlde vakalar her skill'in altına
 * (`skills/<ad>/evals-yerlesik/`) yazılıyordu ve koşum 2 saniyede
 * "No eval cases found under ...\.claude" dedi. Yerleşik koşucu sınav dizinini
 * EKLENTİ KÖKÜNÜN ALTINDA arıyor (`--help`: *"Directory name (below the
 * plugin) that holds the eval cases"*), yani tek bir dizin, skill başına değil.
 * Bu yüzden vaka adı `<skill>-<NN>-<slug>` biçiminde: tek havuzda hangi skill'e
 * ait olduğu adından okunsun.
 */
const HEDEF_DIZIN = 'evals-yerlesik'

const kuru = process.argv.includes('--kuru')
const skillSuzgeci = (process.argv.find((a) => a.startsWith('--skill=')) || '').split('=')[1] || null

/**
 * ÖRNEKLEME — niçin var, sayıyla: tam dönüşüm 62 skill / 1261 vaka üretiyor ve
 * yerleşik koşucu vaka başına varsayılan 3 koşum yapıyor. Yani tam sınav
 * 1261 × 3 = 3783 AJAN KOŞUMU demek ve her koşum aboneliğin üzerinden giden bir
 * tam `claude` çocuğu. `--ablation` açıkken bu iki katına çıkar.
 * Bu biçimde tam koşum PRATİK DEĞİLDİR; pilot örneklemeyle yapılır.
 */
const sayi = (ad, varsayilan) => {
  const a = process.argv.find((x) => x.startsWith(`--${ad}=`))
  if (!a) return varsayilan
  const n = Number(a.split('=')[1])
  return Number.isFinite(n) && n >= 0 ? n : varsayilan
}
const ornekTetik = sayi('ornek-tetik', Infinity)
const ornekTetiksiz = sayi('ornek-tetiksiz', Infinity)

/**
 * ⚠BİÇİM KAYNAĞI TAHMİN DEĞİL, ÖLÇÜM:
 *  · `claude plugin eval init --bare <ad>` çalıştırıldı; ürettiği kalıp
 *    `prompt.md` frontmatter'ında `max_turns` + `allowed_tools`, grader'da
 *    `type` + `weight` taşıyor.
 *  · Grader tipleri ve alan adları resmi belgeden alındı
 *    (code.claude.com/docs/en/plugins-reference): `llm` · `regex` (pattern) ·
 *    `tool_used` (tool) · `tool_order` (tools) · `file_exists` (path) · `baseline`.
 *  · ⛔`claude plugin validate` SINAV GRADER'LARINA BAKMIYOR — ayırt edici
 *    testle ölçüldü: uydurma bir alan VE geçersiz bir `type` ile bile
 *    "Validation passed" dedi (`--strict` dahil). Yani o komutun yeşili bu
 *    biçimin doğruluğunu KANITLAMAZ; biçim güveni init çıktısı + belgedendir.
 */
const OLUMSUZ_SINIR = [
  '⚠BU KOLUN GÜCÜ ZAYIFTIR, ADIYLA: yerleşik grader tipleri arasında',
  '"şu araç KULLANILMADI" diyen bir olumsuzlama YOK (resmi belgede de yok).',
  'Bu yüzden tetiklenmemesi gereken vakalar `llm` grader ile ölçülüyor, yani',
  'aracın izine değil cevabın metnine bakılıyor. Yanlış-pozitif tetik ölçümü',
  'bu kolda `tool_used` kadar kesin DEĞİLDİR. Yerleşik araca olumsuzlama',
  'eklenirse bu grader `tool_used` olumsuzuna çevrilmeli.',
].join('\n')

function guvenliAd(metin, sira) {
  const taban = metin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `${String(sira).padStart(2, '0')}-${taban || 'vaka'}`
}

function promptMetni(istem, tetiklenmeli, skillAdi) {
  const aciklama = tetiklenmeli
    ? `${skillAdi} TETIKLENMELI — yonlendirme sinavi (should_trigger)`
    : `${skillAdi} TETIKLENMEMELI — yanlis pozitif sinavi (should_not_trigger)`
  return [
    '---',
    `description: '${aciklama.replace(/'/g, "''")}'`,
    'max_turns: 4',
    'allowed_tools: [Skill]',
    '---',
    '',
    istem,
    '',
  ].join('\n')
}

function tetikGrader(skillAdi) {
  return [
    '---',
    'type: tool_used',
    'tool: Skill',
    'weight: 1',
    '---',
    '',
    `Skill araci cagrilmis ve cagrilan skill ${skillAdi} olmali.`,
    '',
  ].join('\n')
}

function olumsuzGrader(skillAdi) {
  return [
    '---',
    'type: llm',
    'weight: 1',
    '---',
    '',
    `Cevap ${skillAdi} skill'ini KULLANMAMIS olmali: istem o skill'in konusu`,
    'DISINDA ve dogru davranis dogrudan cevap vermek ya da baska bir yola',
    'yonlendirmektir. Cevap o skill\'i cagirdigini ima ediyorsa DUSSUN.',
    '',
    OLUMSUZ_SINIR,
    '',
  ].join('\n')
}

/** Bir dosyayı yazar. Dönen: 'eklendi' | 'guncellendi' | 'ayni'. */
function yaz(dosya, icerik) {
  if (fs.existsSync(dosya)) {
    const mevcut = fs.readFileSync(dosya, 'utf8')
    // Satır sonu farkı içerik farkı değildir (ölçülmüş tuzak: aynı dosya bir
    // ağaçta LF, ötekinde CRLF checkout edilir).
    if (mevcut.replace(/\r\n/g, '\n') === icerik.replace(/\r\n/g, '\n')) return 'ayni'
    if (!kuru) fs.writeFileSync(dosya, icerik, 'utf8')
    return 'guncellendi'
  }
  if (!kuru) {
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    fs.writeFileSync(dosya, icerik, 'utf8')
  }
  return 'eklendi'
}

const sayac = { eklendi: 0, guncellendi: 0, ayni: 0 }
const atlanan = []
let skillSayisi = 0
let vakaSayisi = 0

for (const [eklentiKoku, skillYolu] of AGACLAR) {
  const kok = path.join(depoKoku, skillYolu)
  if (!fs.existsSync(kok)) continue
  const hedefKok = path.join(depoKoku, eklentiKoku, HEDEF_DIZIN)
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!g.isDirectory() || g.name.startsWith('_')) continue
    if (skillSuzgeci && g.name !== skillSuzgeci) continue
    const kaynak = path.join(kok, g.name, 'evals', 'evals.json')
    if (!fs.existsSync(kaynak)) continue

    let j
    try {
      j = JSON.parse(fs.readFileSync(kaynak, 'utf8'))
    } catch (e) {
      // Sessiz atlama YOK: bozuk kaynak insan hukmu bekler.
      atlanan.push(`${skillYolu}/${g.name}: JSON okunamadi — ${e.message.slice(0, 60)}`)
      continue
    }
    const tetik = (Array.isArray(j.should_trigger) ? j.should_trigger : []).slice(0, ornekTetik)
    const tetikSiz = (Array.isArray(j.should_not_trigger) ? j.should_not_trigger : []).slice(0, ornekTetiksiz)
    if (!tetik.length && !tetikSiz.length) {
      atlanan.push(`${skillYolu}/${g.name}: should_trigger ve should_not_trigger BOS`)
      continue
    }

    skillSayisi++
    let sira = 0
    for (const [liste, tetiklenmeli] of [
      [tetik, true],
      [tetikSiz, false],
    ]) {
      for (const istem of liste) {
        sira++
        vakaSayisi++
        const vakaDizin = path.join(hedefKok, `${g.name}-${guvenliAd(istem, sira)}`)
        sayac[yaz(path.join(vakaDizin, 'prompt.md'), promptMetni(istem, tetiklenmeli, g.name))]++
        const graderDosya = path.join(vakaDizin, 'graders', tetiklenmeli ? 'tetik.md' : 'tetiklenmesin.md')
        sayac[yaz(graderDosya, tetiklenmeli ? tetikGrader(g.name) : olumsuzGrader(g.name))]++
      }
    }
  }
}

console.log(`[skills-eval-convert]${kuru ? ' KURU KOSU' : ''} hedef dizin adi: ${HEDEF_DIZIN}`)
console.log(`  skill ${skillSayisi} · vaka ${vakaSayisi} · dosya: eklendi ${sayac.eklendi} · guncellendi ${sayac.guncellendi} · ayni ${sayac.ayni}`)
if (atlanan.length) {
  console.log(`  ⚠ATLANAN ${atlanan.length} (sessiz gecilmedi):`)
  for (const a of atlanan) console.log(`     ${a}`)
  process.exit(2)
}
