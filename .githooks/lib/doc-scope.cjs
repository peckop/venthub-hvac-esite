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
 * KAPSAM ALANI — İLK SÜRÜMÜM YANLIŞTI, ÖLÇÜMLE DÜZELTİLDİ (2026-08-27).
 *
 * İLK ÇIKARIM (yanlış): `.cc_docs.yaml` `source_dirs: [src, .]` diyor; `.`'ı "kök seviyesindeki
 * dosyalar" diye yorumladım ve kapsamı `src/**` + kök ile sınırladım. PR'da bunun bir ÇIKARIM
 * olduğunu adıyla yazmıştım — iyi ki yazmışım, çünkü yanlıştı.
 *
 * ÖLÇÜM (indikten hemen sonra, master'ın kendi ağacından): master'da TRACKED **766 companion**
 * var (ölçüt: `X.md` yanında `X.{ts,tsx,mjs,cjs}` kardeşi olan `.md`). Benim ilk süzgecim
 * bunların **66'sını atlıyordu**:
 *     supabase/functions/**  ~28   ·  tests/e2e + helpers  19   ·  supabase/functions/_shared  12
 *     e2e/  3  ·  scripts/media  2  ·  scripts/db/migrations  1  ·  .claude/hooks  1
 * 19'u `tests`/`__tests__` altında, yani skip_dirs gereği ZATEN dışarıda kalmalı (eski
 * artıklar). Kalan ~46'sı ise GERÇEK kapsamda ve süzgecim onları sessizce dışarıda bırakıyordu.
 *
 * NİÇİN CİDDİ: `post-commit`in eski hâli yol kısıtı KOYMUYORDU (`grep -E '\.(ts|tsx|mjs|cjs)$'`),
 * yani o companion'lar üretiliyordu. Ben kapsamı daraltarak, tam da bu iş emrinde avladığım
 * "sessizce üretilmeyen companion" sınıfını KENDİ ELİMLE ekledim. Bir gün sonra fark edilse
 * `supabase/functions/_shared/*.md` bayatlar ve sebebi hiçbir yerde yazılı olmazdı.
 *
 * YENİ KURAL: kapsam yol derinliğiyle SINIRLANMAZ. Eleme YALNIZ SSOT'un söylediği eksenlerde
 * yapılır — `skip_dirs`, `skip_files`, `.d.ts` ve test dosyası kalıbı. Böylece süzgeç
 * `post-commit`in eski genişliğini korur, `post-merge`e de aynı genişliği getirir (T166'nın
 * amacı buydu) ve SSOT dışında kendi kısıtını UYDURMAZ.
 */
function kapsamda(bagil, kapsam) {
  const yol = bagil.replace(/\\/g, '/').replace(/^\.\//, '')
  if (!yol) return { ok: false, sebep: 'bos satir' }
  if (!UZANTILAR.test(yol)) return { ok: false, sebep: 'uzanti kapsam disi' }
  if (yol.endsWith('.d.ts')) return { ok: false, sebep: 'tip bildirimi (.d.ts)' }

  const parcalar = yol.split('/')
  const ad = parcalar[parcalar.length - 1]
  const dizinler = parcalar.slice(0, -1)

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

/** Eşzamanlı uyku — `Atomics.wait` dışında senkron bir bekleme yolu yok (setTimeout burada işe yaramaz). */
function bekle(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
  } catch {
    /* SharedArrayBuffer yoksa meşgul bekleme yok — tek tur atlanır, döngü zaten sınırlı */
  }
}

/**
 * STDIN'İ PARÇA PARÇA OKU — `fs.readFileSync(0)` YETMİYOR.
 *
 * NİÇİN: POSIX'te stdin bir BORU ve süreç standart akışlara dokunmuşsa (biz dokunuyoruz —
 * yedek süzgeç uyarısı stderr'e yazılıyor) fd O_NONBLOCK olabilir. O hâlde `readFileSync(0)`
 * veri hazır değilken **EAGAIN fırlatır**. Eski kod bunu `catch {}` ile yutup girdiyi BOŞ
 * sayıyordu: süzgeç sıfır yol basar, kanca hiçbir companion üretmez ve HİÇBİR YERDE hata
 * görünmez. Windows'ta borular böyle davranmadığı için yerelde YEŞİL, Linux CI'da KIRMIZI —
 * "bende çalışıyor" sınıfının ders kitabı hâli.
 *
 * ⚠ HATA ARTIK YUTULMUYOR: EAGAIN'de kısa bekleyip yeniden deniyoruz; başka hata SEBEBİYLE
 * BİRLİKTE yukarı bildiriliyor. Sessiz boş küme, bu dosyanın başındaki uyarının tam olarak
 * engellemek için var olduğu şeydi.
 */
function stdinOku() {
  const parcalar = []
  const tampon = Buffer.alloc(65536)
  let bosDeneme = 0
  for (;;) {
    let n
    try {
      n = fs.readSync(0, tampon, 0, tampon.length, null)
    } catch (e) {
      const kod = e && e.code
      if (kod === 'EAGAIN') {
        bosDeneme += 1
        if (bosDeneme > 200) return { metin: Buffer.concat(parcalar).toString('utf8'), sebep: 'EAGAIN, 2sn boyunca veri gelmedi' }
        bekle(10)
        continue
      }
      if (kod === 'EOF') break
      return { metin: Buffer.concat(parcalar).toString('utf8'), sebep: 'okuma hatasi ' + kod }
    }
    if (n === 0) break
    bosDeneme = 0
    parcalar.push(Buffer.from(tampon.subarray(0, n)))
  }
  return { metin: Buffer.concat(parcalar).toString('utf8'), sebep: 'akis bitti' }
}

/**
 * STDOUT'A TAM YAZ — `process.stdout.write` POSIX borusunda ASENKRON'dur ve süreç yazma
 * boşalmadan çıkarsa çıktı KIRPILIR. `fs.writeSync` ile döngüde yazmak bu sınıfı kapatır;
 * kısmi yazma (n < uzunluk) da ele alınır, çünkü tek çağrı her baytı yazmayabilir.
 */
function yazStdout(satirlar) {
  if (!satirlar.length) return
  const veri = Buffer.from(satirlar.join('\n') + '\n', 'utf8')
  let yazilan = 0
  while (yazilan < veri.length) {
    try {
      yazilan += fs.writeSync(1, veri, yazilan, veri.length - yazilan)
    } catch (e) {
      if (e && e.code === 'EAGAIN') { bekle(10); continue }
      throw e
    }
  }
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

  const girdi = stdinOku()

  const cikan = []
  let girenSatir = 0
  for (const satir of girdi.metin.split('\n')) {
    const yol = satir.trim()
    if (!yol) continue
    girenSatir += 1
    const k = kapsamda(yol, kapsam)
    if (k.ok) cikan.push(yol)
    else if (ACIKLA) process.stderr.write('[doc-scope] ATLANDI ' + yol + '  (' + k.sebep + ')\n')
  }

  /**
   * YOKLUK KANITI — "hiçbir şey üretmedim" ile "hiçbir şey gelmedi" ASLA aynı görünmemeli.
   *
   * ÖLÇÜLMÜŞ VAKA (2026-08-27): bu süzgecin CI'daki koşumu YEREL koşumla aynı girdide farklı
   * davrandı — yerelde dört yol basıyordu, CI'da SIFIR. Kanca günlüğünde tek iz "yedek süzgece
   * düştüm" uyarısıydı; süzgecin girdi ALIP ALMADIĞI hiçbir yerde yazmıyordu, bu yüzden arıza
   * "kapsam boş" ile "stdin okunamadı" arasında ayırt edilemedi. Bir kapının kendi körlüğünü
   * göremediği yer tam burasıydı.
   *
   * Bundan sonra her koşum SAYIYLA bitiyor: kaç satır girdi, kaç yol çıktı. Sayı görünmüyorsa
   * süzgeç hiç koşmamıştır; sıfır girdi görünüyorsa sorun kapsamda değil BORUDA'dır.
   */
  process.stderr.write('[doc-scope] GIRDI ' + girenSatir + ' satir · CIKAN ' + cikan.length + ' yol\n')
  if (girenSatir === 0) {
    process.stderr.write(
      '[doc-scope] ⚠ GIRDI BOS: stdin den tek satir gelmedi (' + girdi.sebep + ').\n' +
        '[doc-scope]   Companion uretimi bu kosumda DURDU. Bu bir kapsam karari DEGIL, borunun sessizligi.\n',
    )
  }

  yazStdout(cikan)
}

if (require.main === module) main()

module.exports = { kapsamda, kapsamYukle }
