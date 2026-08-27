#!/usr/bin/env node
'use strict'

/**
 * COMPANION KAPSAM SÜZGECİ — `.githooks/post-commit` ve `.githooks/post-merge` İÇİN TEK KAYNAK.
 *
 * NİÇİN VAR (2026-08-27, T166-VH — ölçülmüş vaka, teorik değil):
 * İki kanca AYNI işi yapıyordu (değişen kaynak dosyalar için companion üret) ama FARKLI
 * kapsamla, çünkü süzgeç iki yerde ayrı ayrı yazılmıştı:
 *
 *     post-commit : grep -E '\.(ts|tsx|mjs|cjs)$' | grep -v '\.test\.' | grep -v '__tests__'
 *     post-merge  : grep -E '^src/.*\.(ts|tsx)$'            <-- test/skip süzgeci YOK
 *
 * Ayırt edici kanıt (AUTH, I18N ve OPS bağımsız doğruladı): `git merge origin/master` biter
 * bitmez `src/__tests__/conformance/build-skip-positive-logic.test.md` belirdi — dosyanın
 * mtime'ı merge commit'inin SANİYESİYLE aynıydı, hiçbir toplu üretim çağrısı o dakikada
 * koşmamıştı. Yani üreten post-merge'di. `grep -v` sayımı: post-commit'te 1, post-merge'de 0.
 *
 * BUNUN BEDELİ TEK DOSYA DEĞİLDİ: o gün filo genelinde patlayan "başkası dosyamı kirletti"
 * alarmlarının büyük kısmı merge/pull SONRASI düştü. post-merge her merge'de DEĞİŞEN TÜM
 * `src` `.ts/.tsx` için companion üretiyordu — başka şeritlerin claim'indekiler dahil, kapsam
 * dışı test dosyaları dahil. "Kim kirletti" sorusunun cevabı çoğu zaman "kimse değil,
 * post-merge" oluyordu.
 *
 * ⚠ ONARIMIN BİÇİMİ KASITLI: iki kancaya AYNI grep zincirini yazmak çözüm DEĞİL. Bugün
 * post-commit öğrendi post-merge öğrenmedi; yarın biri düzeltilir öteki yine geride kalır.
 * Süzgeç TEK YERDE, tek uygulamada durur ve iki kanca da BURAYA sorar. Aynı gerekçe
 * `board.cjs`'te de yazılı (claim katlaması iki kez yazılmıştı ve sürüklendi).
 *
 * SSOT: `.cc_docs.yaml`. Kapsamı kanca "yaklaşık olarak" taklit etmez, dosyadan OKUR.
 *
 * KULLANIM (kanca içinden):
 *     printf '%s\n' $DEGISENLER | node .githooks/lib/doc-scope.cjs
 * stdin'den satır başına bir yol alır, KAPSAMDAKİLERİ stdout'a basar.
 * Teşhis için: `--acikla` her yolun neden düştüğünü stderr'e yazar.
 */

const fs = require('fs')
const path = require('path')

const ACIKLA = process.argv.includes('--acikla')

/**
 * YAML'ı elle okuyoruz çünkü bu depoda yaml ayrıştırıcı bağımlılığı YOK (ölçüldü: `yaml` ve
 * `js-yaml` ikisi de kurulu değil) ve kanca hattına ağ/kurulum bağımlılığı sokmak, tam da
 * "sessizce çalışmayan kanca" sınıfını üretir.
 *
 * KIRILGANLIK BİLİNÇLİ OLARAK SESLİ: yalnız `alan: [a, b, c]` tek satır biçimini anlar.
 * `.cc_docs.yaml` çok satırlı biçimde yeniden üretilirse ayrıştırma BAŞARISIZ olur ve bu
 * SESSİZ KALMAZ — aşağıda `yamlOkunabildi` false olur, uyarı basılır ve muhafazakâr yedek
 * süzgece düşülür. Sessizce boş küme dönmek en kötüsü olurdu: companion üretimi durur,
 * kimse fark etmez (2026-08-13'te tam bu oldu, 284 bayat companion).
 */
function alanOku(metin, ad) {
  const m = metin.match(new RegExp('^' + ad + ':\\s*\\[([^\\]]*)\\]\\s*$', 'm'))
  if (!m) return null
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

const YEDEK_SKIP_DIRS = ['__tests__', 'tests', 'node_modules', '.git', 'dist', 'build']
const YEDEK_SKIP_FILES = ['index.ts']

function kapsamYukle(kok) {
  const yol = path.join(kok, '.cc_docs.yaml')
  let metin = ''
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch (e) {
    return {
      yamlOkunabildi: false,
      sebep: '.cc_docs.yaml okunamadi (' + (e && e.code) + ')',
      skipDirs: YEDEK_SKIP_DIRS,
      skipFiles: YEDEK_SKIP_FILES,
    }
  }
  const skipDirs = alanOku(metin, 'skip_dirs')
  const skipFiles = alanOku(metin, 'skip_files')
  if (!skipDirs || !skipFiles) {
    return {
      yamlOkunabildi: false,
      sebep: '.cc_docs.yaml okundu ama skip_dirs/skip_files tek-satir bicimde AYRISTIRILAMADI',
      skipDirs: skipDirs || YEDEK_SKIP_DIRS,
      skipFiles: skipFiles || YEDEK_SKIP_FILES,
    }
  }
  return { yamlOkunabildi: true, sebep: '', skipDirs, skipFiles }
}

const UZANTILAR = /\.(ts|tsx|mjs|cjs)$/

/**
 * KAPSAM ALANI — ölçümden çıkarılmış, orion'un kaynağından değil; bu yüzden adıyla yazıyorum.
 *
 * `.cc_docs.yaml` `source_dirs: [src, .]` diyor. `.`'ın "her şey, özyinelemeli" mi yoksa
 * "kök seviyesindeki dosyalar" mı olduğu yaml'dan ANLAŞILMIYOR. Gözlenen evren (T165-VH
 * süpürmesinde OPS'un `board.cjs` eşleştiricisiyle saydığı 732 companion-kaynağı) `src/**`
 * artı `next.config.mjs` gibi KÖK SEVİYESİ dosyaları içeriyor; `supabase/functions/*.ts`
 * ise kendi ayrı master'ına (`extra_masters`) sahip.
 *
 * Bu yüzden kapsam = `src/**` + KÖK SEVİYESİ dosyalar. Sonuç iki kancayı da hafifçe
 * DÜZELTİR: post-merge'e kök + `mjs/cjs` eklenir, post-commit'ten derin `src` dışı dizinler
 * (ör. `supabase/functions`) çıkar — onlar zaten fonksiyon master'ıyla kapsanıyor.
 * Yanlışsa, yanlışlığı TEK yerde ve adıyla duruyor; iki kancada iki farklı hâlde değil.
 */
function kapsamda(bagil, kapsam) {
  const yol = bagil.replace(/\\/g, '/').replace(/^\.\//, '')
  if (!yol) return { ok: false, sebep: 'bos satir' }
  if (!UZANTILAR.test(yol)) return { ok: false, sebep: 'uzanti kapsam disi' }
  if (yol.endsWith('.d.ts')) return { ok: false, sebep: 'tip bildirimi (.d.ts)' }

  const parcalar = yol.split('/')
  const ad = parcalar[parcalar.length - 1]
  const dizinler = parcalar.slice(0, -1)

  const kokSeviyesi = dizinler.length === 0
  if (!kokSeviyesi && dizinler[0] !== 'src') {
    return { ok: false, sebep: 'source_dirs disi (src/** ya da kok seviyesi degil)' }
  }
  for (const d of dizinler) {
    if (kapsam.skipDirs.includes(d)) return { ok: false, sebep: 'skip_dirs: ' + d }
  }
  if (kapsam.skipFiles.includes(ad)) return { ok: false, sebep: 'skip_files: ' + ad }
  // `.test.` / `.spec.` dosyaları: skip_dirs `__tests__` bunları yalnız o dizindeyken keser.
  // Yan yana duran testler (`Foo.test.tsx`) de kapsam dışı — post-commit bunu zaten
  // `grep -v '\.test\.'` ile yapıyordu, davranışı KAYBETMİYORUZ.
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(ad)) return { ok: false, sebep: 'test dosyasi' }
  return { ok: true, sebep: '' }
}

function main() {
  const kok = process.env.DOC_SCOPE_KOK || process.cwd()
  const kapsam = kapsamYukle(kok)
  if (!kapsam.yamlOkunabildi) {
    process.stderr.write(
      '[doc-scope] ⚠ SSOT OKUNAMADI: ' + kapsam.sebep + '\n' +
        '[doc-scope]   MUHAFAZAKAR YEDEK SUZGECE dustum — kapsam .cc_docs.yaml ile AYNI OLMAYABILIR.\n' +
        '[doc-scope]   Sessiz kalmiyorum: bu satiri goruyorsan suzgec SSOT tan degil yedekten geldi.\n',
    )
  }

  let ham = ''
  try {
    ham = fs.readFileSync(0, 'utf8')
  } catch {
    ham = ''
  }

  const cikan = []
  for (const satir of ham.split('\n')) {
    const yol = satir.trim()
    if (!yol) continue
    const k = kapsamda(yol, kapsam)
    if (k.ok) cikan.push(yol)
    else if (ACIKLA) process.stderr.write('[doc-scope] ATLANDI ' + yol + '  (' + k.sebep + ')\n')
  }
  if (cikan.length) process.stdout.write(cikan.join('\n') + '\n')
}

if (require.main === module) main()

module.exports = { kapsamda, kapsamYukle }
