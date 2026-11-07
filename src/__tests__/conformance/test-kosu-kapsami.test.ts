import { execFile, execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-TEST-KOSU-1 · HER TEST DOSYASI EN AZ BİR YERDE KOŞAR; PR kapısından çıkan her test yeni yerinde GERÇEKTEN koşar (ALT-38).
 *
 * NİÇİN VAR: dünya durumu testleri `ci` işinin PR koşusundan çıkarıldı (kip `dislan`) ve iki yeni yerde koşuyor: master push
 * (aynı `ci` işi, tam paket) ve zamanlı `dunya-durumu.yml` (kip `yalniz`). "Hiçbir koruma sessizce düşmez" sözünün mekanik
 * karşılığı budur. Bu kapı şu bozulma yollarını yakalar, hepsi SESSİZDİR (kimse kırmızı görmez, koruma yok olur):
 *   1. listedeki bir testin dosyası silinir/taşınır (yetim kayıt): test hiçbir yerde koşmaz,
 *   2. liste `zamanli` yeri olmadan kalır ya da iş akışı `schedule`/`yalniz` kipini yitirir: test yalnız master push'ta koşar
 *      (master koşuları concurrency ile %37 iptal ediliyor: ölçüldü 07-06..10-06, 1119 koşunun 419'u),
 *   3. `ci` işinin Test adımı `dislan` kipini PR dışına da verir: master push da testi atlar,
 *   4. vitest `exclude` listesine yeni bir dışlama eklenir ama burada gerekçesi ve yeni yeri yazılmaz (belgesiz dışlama),
 *   5. vitest.config.ts'te `...dunyaDurumu.exclude` ya da `include` bağı kopar, ya da çift yıldızla başlayan belgesiz bir dosya dışlaması
 *      girer: `dislan` hiçbir şeyi dışlamaz, `yalniz` herkesi koşturur, bir test hiçbir yerde koşmaz. `ayar()`'ı doğrudan çağırmak bu bağı
 *      ÖLÇMEZ; çare: config GERÇEKTEN yüklenir (`vitest list --filesOnly`, üç kip) ve çıkan dosya kümesi tam eşitlikle sınanır,
 *   6. dunya-durumu.yml'de test kırmızısı yutulur (`|| true`, continue-on-error), kabuk (pipefail) düşer ya da cron seyrekleşir:
 *      zamanlı koşunun NOMİNAL 6 saatlik ritmi kopar (GERÇEK aralık GitHub gecikmesiyle bunun üstündedir: 100 koşuda medyan 7,2 sa, en uzun 15,3 sa; cetvel §3).
 *      Çare: adım ve iş başlığı satır düzeyinde TAM EŞİTLİK; cron ayrıştırılıp en geniş aralık ölçülür,
 *   7. ci.yml Test adımı master push'ta atlanır (`if:` koşulu), `push:` tetikleyicisi daralır ya da kabuk (pipefail) düşer. Çare: aynı tam eşitlik,
 *   8. `ayar('tam')` geçersiz sayılır (açık `tam` kipi: yerel kullanım, komut satırı),
 *   9. package.json `scripts.test` dosya/dizin/proje süzgeci kazanır: üç koşu yerinin ortak girişi sessizce daralır,
 *  10. `dislan` kipi TABAN listesini (base dalının listesi) kesişime sokmaz ya da taban okunamayınca sessiz kalır (ALT-38a B3): bir PR kendi
 *      listesiyle kapıdan çıkabilir ya da taban hiç okunamadığı hâlde "dışlama çalışıyor" sanılır. Çare: gerçek config boş ve okunamayan tabanla
 *      yüklenir; boş tabanda HİÇBİR test dışlanmaz, okunamayan tabanda tam küme koşar ve stderr'e TEK uyarı yazılır.
 *  11. (ALT-38i, bağımsız denetim Ö1b) yol süzgeci SABİT değildir: iki süzgeçli kayıttan birinin `yolFiltresi` alanı (ya da yazım hatasıyla `yolFiltre`) düşer ya da süzgeç
 *      daralırsa test sessizce her PR'da çıkar, girdisine dokunan PR korumasını kaybeder. Çare: iki kayıt ADIYLA süzgeç taşımak zorunda, `sessionstart-tavan` süzgeci
 *      bugünkü girdi dizinlerinden daha dar olamaz ve dünya durumu dışlaması gerçek config yolunda ayrıca `dışlanan=N tutulan=M değişen=K` özet satırını stderr'e yazar (Ö4).
 *  12. (ALT-38i, Ö1a) tamlık sürüklenmesi: `.claude/hooks/session-board.cjs`ten başlayan literal `require`/`path.join(__dirname, ...)` grafına YENİ bir dosya girer ama süzgece
 *      eklenmezse, o dosyaya dokunan PR `sessionstart-tavan`ı kapıda bulamaz. Çare: graf statik taranır, süzgeç dışında kalan HER repo-içi dosya kırmızıdır. Tarama bir yoklamadır,
 *      kanıt değil: literal olmayan yollar (`path.join(KOK, ...)`, şablon dizeleri) ona görünmez; onların tam ölçümü çalışma zamanı izlemesiyle yapılır (cetvel §3 "Süzgeç girdi ölçümü").
 * "Dışarıda" olan her test dosyası aşağıdaki VITEST_DISI tablosunda gerekçesiyle ve KOŞTUĞU YERLE yazılıdır.
 *
 * Ölçüm yüzeyi: `git ls-files` + `node:fs` + satır taraması + alt süreçte `vitest list --filesOnly` (ağ yok, test KOŞMAZ, dosyaları
 * listeler). Hiçbir dosyayı DEĞİŞTİRMEZ. Alt sürece kip her seferinde AÇIKÇA verilir (PR koşusunda bu test kendisi `dislan`
 * ortamında koşar; üst sürecin değeri sızarsa boş kip de `dislan` ölçerdi). `dislan` TABANA bağlıdır, bu yüzden taban da HER SEFERİNDE
 * açıkça verilir: çalışma ağacındaki gerçek listenin kendisi (`VENTHUB_DUNYA_TABAN_LISTESI`). Bu kapının ölçtüğü şey "mekanizma bağlı mı"dır,
 * "bu PR listeye yeni kayıt ekledi mi" değildir; taban git geçmişinden okunsaydı sonuç `HEAD^1`in içeriğine (liste master'da henüz yok,
 * sığ klon, yerel dal) bağlı olurdu. Kesişimin kendisi scripts/ci/__tests__/dunya-durumu.test.ts'te birim olarak sınanır.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
/** Çalışma ağacındaki GERÇEK listenin mutlak yolu: `dislan` kipinin tabanı olarak verilir (sonuç git geçmişinden bağımsız olsun). */
const LISTE_MUTLAK = path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json')
/** Taban listesi ortam değişkeni: modülden okunmaz, BİLEREK sabit (modülde ad değişirse bu kapı kırmızı olsun). */
const TABAN_ORTAM = 'VENTHUB_DUNYA_TABAN_LISTESI'
const TABAN_GERCEK = { [TABAN_ORTAM]: LISTE_MUTLAK }
/**
 * Değişen dosyalar ortam değişkeni (ALT-38i): yol süzgeçli kayıtlar PR'ın `git diff HEAD^1 HEAD` çıktısına bağlıdır. Bu kapının ölçtüğü şey "mekanizma bağlı mı"dır,
 * "bu PR hangi dosyalara dokundu" değildir; sonuç git geçmişine (ve PR'ın dosyalarına) bağlı olmasın diye değişen dosyalar HER SEFERİNDE açıkça verilir.
 * Varsayılan: hiçbir süzgece uymayan tek dosya (`dislan` = listedeki HER test dışarıda). Ad BİLEREK sabit (modülden okunmaz).
 */
const DEGISEN_ORTAM = 'VENTHUB_DUNYA_DEGISEN_DOSYALAR'
let degisenDizini = ''
let degisenIlgisiz = ''
/** Değişen dosyalar listesi dosyası (NUL ayraçlı, `git diff -z` biçimi). */
function degisenDosyasiYaz(ad: string, yollar: string[]): string {
  const yol = path.join(degisenDizini, ad)
  writeFileSync(yol, yollar.map((y) => `${y}\0`).join(''))
  return yol
}
beforeAll(() => {
  degisenDizini = mkdtempSync(path.join(tmpdir(), 'kosu-kapsami-degisen-'))
  degisenIlgisiz = degisenDosyasiYaz('ilgisiz.txt', ['docs/ilgisiz-bir-belge.md'])
})
afterAll(() => {
  if (degisenDizini) rmSync(degisenDizini, { recursive: true, force: true })
})
const degisenGercek = () => ({ [DEGISEN_ORTAM]: degisenIlgisiz })
const D = require_(path.join(KOK, 'scripts/ci/dunya-durumu.cjs')) as {
  ayar: (env: Record<string, string | undefined>, liste: Liste) => { kip: string; exclude: string[]; include: string[] | null; uyari?: string; suzgeceTakilan?: string[] }
  dogrula: (liste: Liste, dosyaVarMi?: (yol: string, dizinMi?: boolean) => boolean) => string[]
  listeyiOku: (kok?: string) => Liste
  filtreEslesirMi: (filtre: readonly string[], yol: string) => boolean
  TEST_DESENI: RegExp
}
interface Kayit {
  test: string
  neden: string
  kanit: string
  yeniYer: string[]
  yolFiltresi?: string[]
}
interface Liste {
  surum: number
  testler: Kayit[]
}

/** vitest.config.ts'in STATİK dışlamaları: her biri burada gerekçesiyle ve koştuğu yerle yazılı olmak ZORUNDA. */
const VITEST_DISI: Array<{ desen: RegExp; neden: string; yer: string; kanit: string[] }> = [
  {
    desen: /^tests\/e2e\/empirical_.*\.test\.ts$/,
    neden: 'CANLI veritabanına bağlanır (repo kökündeki .env, DATABASE_URL); CI\'da .env yoktur',
    yer: 'elle, yerelde: pnpm vitest run tests/e2e/empirical_db.test.ts (kökte .env varken)',
    kanit: [],
  },
  {
    desen: /^tests\/smoke\//,
    neden: 'ayakta bir sunucu ister, SMOKE_BASE_URL yoksa fail-closed düşer; ci işinin Test adımı sunucusuz toplayıp kırmızı verirdi',
    yer: 'vitest.smoke.config.ts (pnpm test:ssr-smoke) ve ssr-duman-alarmi.yml',
    kanit: ['vitest.smoke.config.ts', '.github/workflows/ssr-duman-alarmi.yml'],
  },
]

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: KOK, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}
const testDosyalari = () =>
  git(['ls-files'])
    .split('\n')
    .filter((d) => d && D.TEST_DESENI.test(d))
    .sort()

const yorumsuz = (metin: string) =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

/** Liste ↔ iş akışı bağını denetler; ihlalleri döner (boş = sağlam). Parametreler sabotaj testleri için enjekte edilir. */
function denetle(ci: string, dunyaYml: string, liste: Liste, dosyaVarMi: (yol: string) => boolean): string[] {
  const ihlal: string[] = []
  ihlal.push(...D.dogrula(liste, dosyaVarMi))
  const c = yorumsuz(ci)
  const y = yorumsuz(dunyaYml)
  if (liste.testler.length === 0) ihlal.push('liste BOŞ: dünya durumu testi yoksa kip/iş akışı anlamsız (kasıtlıysa iş akışı ve kapı birlikte kaldırılır)')

  const masterPushYeri = liste.testler.some((t) => t.yeniYer.includes('master-push'))
  if (masterPushYeri) {
    if (!/^ {2}push:\n {4}branches: \[master\]/m.test(c)) ihlal.push('ci.yml `push: branches: [master]` yok: master-push yeri koşmaz')
    if (!/^\s+VENTHUB_DUNYA_DURUMU: \$\{\{ github\.event_name == 'pull_request' && 'dislan' \|\| '' \}\}\s*$/m.test(c)) {
      ihlal.push("ci.yml Test adımı `VENTHUB_DUNYA_DURUMU: ${{ github.event_name == 'pull_request' && 'dislan' || '' }}` değil: dışlama PR dışına taşıyor ya da hiç yok")
    }
  }
  if (liste.testler.some((t) => t.yeniYer.includes('zamanli'))) {
    if (!/^\s+- cron: '[^']+'\s*$/m.test(y) || !/^\s*schedule:\s*$/m.test(y)) ihlal.push('dunya-durumu.yml `schedule:` + cron yok: zamanlı yer koşmaz')
    if (!/^\s+VENTHUB_DUNYA_DURUMU: yalniz\s*$/m.test(y)) ihlal.push('dunya-durumu.yml `VENTHUB_DUNYA_DURUMU: yalniz` yok: listedeki testler koşmaz')
    if (!/run: pnpm test -- --run/.test(y)) ihlal.push('dunya-durumu.yml `pnpm test -- --run` koşturmuyor')
    if (!/^\s+workflow_dispatch:\s*$/m.test(y)) ihlal.push('dunya-durumu.yml elle tetiklenemez (workflow_dispatch yok)')
  }
  return ihlal
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// İŞ AKIŞI YAPISI: yorumsuz, girintiden ve anahtar sırasından bağımsız, adım/iş başlığı düzeyinde TAM EŞİTLİK.
//
// NİÇİN regex yetmez: `run: pnpm test -- --run` bulunuyor mu diye bakan satır, `... | tee x.log || true` eklenince de yeşil kalır
// (sabotaj ölçümünde 8/8 GECTI). Blok eşitliği ise adıma eklenen HER satırı (if:, continue-on-error:, env:, shell:) görür.
// Depoda YAML kütüphanesi bağımlılık değil; iş akışları düz blok stilinde (iki boşluk girinti) yazılı, küçük bir blok okuyucu yeter.
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

const esit = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i])
const sirali = (a: readonly string[]): string[] => [...a].sort()

/** Yorum satırları, satır sonu yorumları (YAML: boşluk + `#`) ve sağ boşluklar atılır: yorum düzeltmesi bu denetimi kırmızı yapmaz. */
const satirlar = (yml: string): string[] =>
  yorumsuz(yml)
    .split('\n')
    .map((s) => s.replace(/\s+#.*$/, '').replace(/\s+$/, ''))
    .filter((s) => s !== '')
const girinti = (s: string): number => s.length - s.trimStart().length

/** `s[bas]` satırı + ondan DAHA derin girintili ardışık satırlar (girinti AYNEN korunur). */
function altSatirlar(s: readonly string[], bas: number): string[] {
  const g = girinti(s[bas])
  const blok = [s[bas]]
  for (let i = bas + 1; i < s.length && girinti(s[i]) > g; i += 1) blok.push(s[i])
  return blok
}
/** `altSatirlar` + başlığın girintisi kadar sola kaydırma: karşılaştırma dosyadaki girintiden bağımsız olur. */
function blokAl(s: readonly string[], bas: number): string[] {
  const g = girinti(s[bas])
  return altSatirlar(s, bas).map((x) => x.slice(g))
}

/** Üst düzey blok (`on:`, `jobs:` ...). Yoksa fırlatır: yapı değişti demektir, sessizce geçilmez. */
function ustBlok(yml: string, anahtar: string): string[] {
  const s = satirlar(yml)
  const i = s.indexOf(`${anahtar}:`)
  if (i === -1) throw new Error(`üst düzey "${anahtar}:" bloğu yok`)
  return blokAl(s, i)
}
/** `jobs:` altındaki iş bloğu; başlık satırı 0 girintide, çocukları 2'de. */
function isBlogu(yml: string, ad: string): string[] {
  const s = satirlar(yml)
  const j = s.indexOf('jobs:')
  const i = j === -1 ? -1 : s.indexOf(`  ${ad}:`, j + 1)
  if (i === -1) throw new Error(`"${ad}" işi yok`)
  return blokAl(s, i)
}
/**
 * İş bloğunun `steps:` DIŞINDAKİ satırları (runs-on, timeout-minutes, defaults, if, continue-on-error ...). İş anahtarlarının sırası serbesttir:
 * `steps:` bloğundan SONRA eklenen bir `if:` ya da `continue-on-error:` da aynı etkiyi yapar (ölçüldü: yalnız öncesine bakan sürüm bunu kaçırdı).
 */
function isBasligi(is: readonly string[]): string[] {
  const k = is.indexOf('  steps:')
  if (k === -1) throw new Error('işte "steps:" yok')
  return [...is.slice(1, k), ...is.slice(k + altSatirlar(is, k).length)]
}
/** Adımlar; her adımın anahtarları 2 girintide hizalıdır (`- name: X` → `  name: X`). */
function isAdimlari(is: readonly string[]): string[][] {
  const k = is.indexOf('  steps:')
  if (k === -1) throw new Error('işte "steps:" yok')
  const adimlar: string[][] = []
  for (const x of is.slice(k + 1)) {
    if (girinti(x) < 4) break
    if (/^ {4}- /.test(x)) adimlar.push([x.slice(4).replace(/^- /, '  ')])
    else adimlar[adimlar.length - 1]?.push(x.slice(4))
  }
  return adimlar
}
/** Anahtar SIRASI anlamsızdır: en sığ girintideki anahtar parçalarını ada göre sıralar; içerik satır satır AYNEN kalır. */
function kanonik(satir: readonly string[]): string[] {
  if (satir.length === 0) return []
  const g = Math.min(...satir.map(girinti))
  const parcalar: Array<{ anahtar: string; satirlar: string[] }> = []
  for (const x of satir) {
    if (girinti(x) === g) parcalar.push({ anahtar: x.trim().split(':')[0], satirlar: [x] })
    else parcalar[parcalar.length - 1]?.satirlar.push(x)
  }
  return parcalar.sort((a, b) => (a.anahtar < b.anahtar ? -1 : a.anahtar > b.anahtar ? 1 : 0)).flatMap((p) => p.satirlar)
}

/** Bir işin başlığında bulunabilecek anahtarlar. Başkası (if, continue-on-error, environment, needs, strategy ...) testi atlatır ya da bekletir. */
const IZINLI_IS_ANAHTARI = ['defaults', 'runs-on', 'timeout-minutes']
/** Kabuk `bash` olmazsa GitHub `bash -e` verir, pipefail YOK: `... | tee x.log` komutunun çıkışı tee'den gelir (hep 0) ve kırmızı yutulur. */
const KABUK_BLOGU = ['  defaults:', '    run:', '      shell: bash']
const DUNYA_ADIMI = [
  '  name: Dunya durumu testleri',
  '  env:',
  '    VENTHUB_DUNYA_DURUMU: yalniz',
  '  run: pnpm test -- --run --reporter=dot --passWithNoTests 2>&1 | tee dunya-durumu.log',
]
// ALT-38c-2 (FELSEFE DEĞİŞTİ): pull_request'te (edited HARİÇ) `ci` içindeki Test KAPALI; o olayda testler `test-shard` işlerinde koşar ve KAPSAM KANITI artık shard
// bölmesidir (INV-CI-SHARD-2: bölmenin birleşimi `vitest list`in tamamıdır, parçalar ayrıktır; INV-CI-SHARD-1: işin ve bekleme adımının ci.yml'e bağı). Test adımı master push,
// elle koşum ve `edited` koşusunda `ci` içinde eskisi gibi TAM koşar; bu kapının "master push'ta KOŞAR" sözü aynen geçerlidir (koşul push'ta açık: `!(false)`).
const CI_TEST_ADIMI = [
  '  name: Test',
  "  if: steps.ayna.outputs.atla != 'true' && !(github.event_name == 'pull_request' && github.event.action != 'edited')",
  '  env:',
  "    VENTHUB_DUNYA_DURUMU: ${{ github.event_name == 'pull_request' && 'dislan' || '' }}",
  // ALT-38c: V8 bayt kodu önbelleği (yalnız hız; süzgeç DEĞİL: hiçbir test dışlanmaz). Dizin runner geçici alanında, `Node derleme önbelleği` adımıyla geri yüklenir.
  '    NODE_COMPILE_CACHE: ${{ runner.temp }}/node-compile-cache',
  '  run: pnpm test -- --run --reporter=dot 2>&1 | tee ci-test.log',
]
/** `Test` adımı `steps.ayna.outputs.atla` ile atlanabilir: ayna adımı master push'ta ÇALIŞMAMALI (yoksa tam paket sessizce atlanır). */
const AYNA_KOSULU = "  if: github.event_name == 'pull_request' && github.event.action == 'edited'"
const ZAMANLI_EN_FAZLA_ARALIK_DK = 6 * 60
/** `ci`, master push ve zamanlı koşu `pnpm test` betiğini çağırır: oraya dosya/dizin/proje süzgeci girerse üç koşu yeri de sessizce daralır. */
const TEST_BETIGI = 'node scripts/assert-node-major.mjs && vitest'
function testBetigiIhlalleri(paketJson: string): string[] {
  const betik = (JSON.parse(paketJson) as { scripts?: Record<string, string> }).scripts?.test
  return betik === TEST_BETIGI
    ? []
    : [`package.json \`scripts.test\` "${TEST_BETIGI}" olmalı (bulunan: ${JSON.stringify(betik)}): ci, master push ve zamanlı koşu bu betiği çağırır, süzgeç eklenirse HEPSİ sessizce daralır`]
}

function isBasligiHatalari(dosya: string, yml: string, isAdi: string): string[] {
  const baslik = kanonik(isBasligi(isBlogu(yml, isAdi)))
  const ihlal: string[] = []
  const yabanci = baslik
    .filter((x) => girinti(x) === 2)
    .map((x) => x.trim().split(':')[0])
    .filter((k) => !IZINLI_IS_ANAHTARI.includes(k))
  if (yabanci.length) {
    ihlal.push(`${dosya}: "${isAdi}" işinde izin verilmeyen anahtar [${yabanci.join(', ')}]: iş koşulu / continue-on-error / environment testi sessizce atlatır ya da bekletir`)
  }
  const d = baslik.indexOf('  defaults:')
  const kabuk = d === -1 ? [] : altSatirlar(baslik, d)
  if (!esit(kabuk, KABUK_BLOGU)) {
    ihlal.push(`${dosya}: "${isAdi}" işinde varsayılan kabuk "defaults/run/shell: bash" değil: pipefail düşer ve "... | tee x.log" kırmızıyı yutar (bulunan: ${JSON.stringify(kabuk)})`)
  }
  return ihlal
}

function adimHatalari(dosya: string, yml: string, isAdi: string, adim: string, beklenen: readonly string[]): string[] {
  const bulunan = isAdimlari(isBlogu(yml, isAdi)).filter((a) => a[0] === `  name: ${adim}`)
  if (bulunan.length !== 1) return [`${dosya}: "${adim}" adımı ${bulunan.length} kez var (tam 1 olmalı)`]
  if (esit(kanonik(bulunan[0]), kanonik(beklenen))) return []
  return [`${dosya}: "${adim}" adımı beklenenden FARKLI (if/env/run/continue-on-error/shell: her satır sayılır). Bulunan:\n${bulunan[0].join('\n')}`]
}

/** Her blok denetimi kendi yapı hatasını ihlal olarak döner (yapı değiştiyse sessizce geçilmez). */
function korumali(ad: string, f: () => string[]): string[] {
  try {
    return f()
  } catch (e) {
    return [`${ad}: ${(e as Error).message}`]
  }
}

// ── cron: "en çok 6 saatte bir" regex ile sınanamaz (`*/6` ile `*/7` aynı görünür); ifade ayrıştırılıp bir yıllık ateşleme çizelgesinden ölçülür ──
const HAFTA_GUNU_ADLARI: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const AY_ADLARI: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
const GUN_DK = 24 * 60
const YIL_GUN = 366 // 2024 artık yıl: 29 Şubat da çizelgede

function cronAlani(alan: string, min: number, max: number, adlar: Record<string, number> = {}): Set<number> {
  const deger = (s: string): number => {
    const v = adlar[s.toLowerCase()] ?? (/^\d+$/.test(s) ? Number(s) : Number.NaN)
    if (!Number.isInteger(v)) throw new Error(`cron değeri anlaşılmadı: "${s}" (alan "${alan}")`)
    return v
  }
  const kume = new Set<number>()
  for (const parca of alan.split(',')) {
    const [aralik, adimMetni, fazla] = parca.split('/')
    if (parca === '' || fazla !== undefined) throw new Error(`cron parçası geçersiz: "${parca}" (alan "${alan}")`)
    const adim = adimMetni === undefined ? 1 : /^\d+$/.test(adimMetni) ? Number(adimMetni) : Number.NaN
    if (!(adim >= 1)) throw new Error(`cron adımı geçersiz: "${parca}"`)
    let bas: number
    let son: number
    if (aralik === '*') {
      bas = min
      son = max
    } else if (aralik.includes('-')) {
      const uclar = aralik.split('-')
      if (uclar.length !== 2) throw new Error(`cron aralığı "bas-son" olmalı: "${parca}"`)
      bas = deger(uclar[0])
      son = deger(uclar[1])
    } else {
      bas = deger(aralik)
      son = adimMetni === undefined ? bas : max
    }
    if (bas < min || son > max || bas > son) throw new Error(`cron aralığı dışarıda: "${parca}" (izinli ${min}-${max})`)
    for (let v = bas; v <= son; v += adim) kume.add(v)
  }
  return kume
}

/** Cron ifadelerinin BİRLEŞİMİNDE ardışık iki ateşleme arasındaki EN GENİŞ aralık (dakika); yıl sarması dahil. Hiç ateşleme yoksa sonsuz. */
function cronEnGenisAralikDk(ifadeler: readonly string[]): number {
  const atesler: number[] = []
  for (const ifade of ifadeler) {
    const a = ifade.trim().split(/\s+/)
    if (a.length !== 5) throw new Error(`cron 5 alanlı olmalı: "${ifade}"`)
    const [dk, saat, gun, ay, haftaGunu] = a
    const dkK = [...cronAlani(dk, 0, 59)].sort((x, y) => x - y)
    const saatK = [...cronAlani(saat, 0, 23)].sort((x, y) => x - y)
    const gunK = cronAlani(gun, 1, 31)
    const ayK = cronAlani(ay, 1, 12, AY_ADLARI)
    const hgK = new Set([...cronAlani(haftaGunu, 0, 7, HAFTA_GUNU_ADLARI)].map((v) => v % 7))
    // POSIX: ay günü ve hafta günü İKİSİ de kısıtlıysa biri tutması yeter (VEYA); biri `*` ise ikisi birlikte aranır (VE).
    const ikisiKisitli = !gun.startsWith('*') && !haftaGunu.startsWith('*')
    for (let d = 0; d < YIL_GUN; d += 1) {
      const t = new Date(Date.UTC(2024, 0, 1 + d))
      if (!ayK.has(t.getUTCMonth() + 1)) continue
      const gunTuttu = gunK.has(t.getUTCDate())
      const hgTuttu = hgK.has(t.getUTCDay())
      if (!(ikisiKisitli ? gunTuttu || hgTuttu : gunTuttu && hgTuttu)) continue
      for (const s of saatK) for (const m of dkK) atesler.push(d * GUN_DK + s * 60 + m)
    }
  }
  if (atesler.length === 0) return Number.POSITIVE_INFINITY
  const s = [...new Set(atesler)].sort((x, y) => x - y)
  let enGenis = s[0] + YIL_GUN * GUN_DK - s[s.length - 1]
  for (let i = 1; i < s.length; i += 1) enGenis = Math.max(enGenis, s[i] - s[i - 1])
  return enGenis
}

/** dunya-durumu.yml tetikleyicileri: yalnız schedule + workflow_dispatch; cron ifadeleri en çok 6 saat aralıklı. */
function cronHatalari(dunyaYml: string): string[] {
  return korumali('dunya-durumu.yml `on:`', () => {
    const ihlal: string[] = []
    const cronlar: string[] = []
    const maskeli = ustBlok(dunyaYml, 'on').map((x) => {
      const m = /^(\s*- cron: )(['"])([^'"]+)\2$/.exec(x)
      if (!m) return x
      cronlar.push(m[3])
      return `${m[1]}<CRON>`
    })
    const tekil = maskeli.filter((x, i) => !(x.endsWith('<CRON>') && maskeli[i - 1]?.endsWith('<CRON>')))
    if (!esit(tekil, ['on:', '  schedule:', '    - cron: <CRON>', '  workflow_dispatch:'])) {
      ihlal.push(`dunya-durumu.yml \`on:\` bloğu "schedule + cron, workflow_dispatch" dışında bir şey içeriyor ya da eksik (bulunan: ${JSON.stringify(tekil)})`)
    }
    if (cronlar.length === 0) {
      ihlal.push('dunya-durumu.yml hiç cron içermiyor: zamanlı yer koşmaz')
    } else {
      const aralik = cronEnGenisAralikDk(cronlar)
      if (!(aralik <= ZAMANLI_EN_FAZLA_ARALIK_DK)) {
        ihlal.push(`dunya-durumu.yml cron en geniş aralığı ${aralik} dk (${cronlar.join(' | ')}): en çok ${ZAMANLI_EN_FAZLA_ARALIK_DK} dk (6 saat) olmalı, yoksa zamanlı koşunun nominal ritmi kopar (gerçek aralık GitHub gecikmesiyle bunun da üstündedir; ölçüm: test-karnesi-standard.md §3)`)
      }
    }
    return ihlal
  })
}

/** dunya-durumu.yml: iş başlığı (kabuk, izinli anahtarlar), test adımı (tam komut + env), checkout (sabit dal/sürüm yok). */
function dunyaYmlHatalari(dunyaYml: string): string[] {
  return [
    ...korumali('dunya-durumu.yml iş başlığı', () => isBasligiHatalari('dunya-durumu.yml', dunyaYml, 'dunya-durumu')),
    ...korumali('dunya-durumu.yml test adımı', () => adimHatalari('dunya-durumu.yml', dunyaYml, 'dunya-durumu', 'Dunya durumu testleri', DUNYA_ADIMI)),
    ...korumali('dunya-durumu.yml checkout', () => {
      const co = isAdimlari(isBlogu(dunyaYml, 'dunya-durumu')).filter((a) => a[0] === '  name: Checkout')
      if (co.length !== 1) return [`dunya-durumu.yml: "Checkout" adımı ${co.length} kez var (tam 1 olmalı)`]
      const ihlal: string[] = []
      if (co[0].some((x) => /^ {4}ref:/.test(x))) ihlal.push('dunya-durumu.yml Checkout `ref:` sabitliyor: zamanlı koşu eski bir sürümü sınar, güncel master hiç sınanmaz')
      if (!co[0].includes('    fetch-depth: 0')) ihlal.push('dunya-durumu.yml Checkout `fetch-depth: 0` değil: listedeki testler git geçmişi okuyabilir')
      return ihlal
    }),
  ]
}

/** ci.yml: master push tetikleyicisi, iş başlığı (kabuk), Test adımı (if + env + run), ayna adımının koşulu. */
function ciYmlHatalari(ci: string): string[] {
  return [
    ...korumali('ci.yml push tetikleyicisi', () => {
      const on = ustBlok(ci, 'on')
      const k = on.indexOf('  push:')
      const push = k === -1 ? [] : blokAl(on, k)
      return esit(push, ['push:', '  branches: [master]'])
        ? []
        : [`ci.yml push tetikleyicisi tam "push: / branches: [master]" olmalı: yol/dal süzgeci master koşusunu sessizce kısar (bulunan: ${JSON.stringify(push)})`]
    }),
    ...korumali('ci.yml iş başlığı', () => isBasligiHatalari('ci.yml', ci, 'ci')),
    ...korumali('ci.yml Test adımı', () => adimHatalari('ci.yml', ci, 'ci', 'Test', CI_TEST_ADIMI)),
    ...korumali('ci.yml ayna adımı', () => {
      const ayna = isAdimlari(isBlogu(ci, 'ci')).filter((a) => a.includes('  id: ayna'))
      if (ayna.length !== 1) return [`ci.yml: \`id: ayna\` adımı ${ayna.length} kez var (tam 1 olmalı)`]
      return ayna[0].includes(AYNA_KOSULU)
        ? []
        : [`ci.yml ayna adımının koşulu "${AYNA_KOSULU.trim()}" değil: master push'ta çalışırsa \`steps.ayna.outputs.atla\` Test adımını sessizce atlatır`]
    }),
  ]
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// vitest.config.ts GERÇEKTEN yüklenir: kip başına `vitest list --filesOnly` çıktısı (dosya kümesi) ve küme doğrulayıcıları.
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

type Kip = '' | 'dislan' | 'yalniz'
const VITEST_GIRISI = path.join(KOK, 'node_modules', 'vitest', 'vitest.mjs')
/**
 * ALT-38c-2: ci.yml `test-shard` işleri `pnpm test`i bu ortam değişkeniyle koşar ve DEĞİŞKEN ALT SÜREÇLERE MİRAS KALIR. Gerçek config'i ölçen bu alt süreçler (üç kip)
 * shard'ın listesine DAYALI bir kümeyle ölçerdi (canlı ölçüm: #1741 koşu 2, `test-shard (1/4)` kırmızı: "yalniz" kipi `VENTHUB_TEST_SHARD_DOSYALARI ile ...
 * birlikte kullanılamaz` ile fırlattı). Ad `scripts/ci/test-shard.cjs`ten OKUNMAZ (alt süreç ortamı bilerek sabit adlarla kurulur).
 */
const SHARD_ORTAM = 'VENTHUB_TEST_SHARD_DOSYALARI'
const ALT_SUREC_ZAMAN_ASIMI_MS = 80_000
/** Terminal renk kaçışları (ESC [ ... m); ESC karakteri koddan üretilir ki kural gevşetmeden okunabilsin. */
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

/**
 * Alt sürecin ortamı: üst vitest'in değerleri ve üst kip SIZMAZ; kip yalnız burada, açıkça verilir. Ortam adı BİLEREK sabit (modülden okunmaz).
 * `taban`: `dislan` kipinin taban listesi DOSYA YOLU (varsayılan: çalışma ağacındaki gerçek liste); `null` ise değişken hiç verilmez
 * (üst sürecin değeri de silinir). Taban açıkça verilmezse sonuç `git show HEAD^1`in içeriğine bağlı olurdu.
 */
function ortamKur(kip: Kip, taban: string | null = LISTE_MUTLAK, degisen: string | null = degisenIlgisiz): NodeJS.ProcessEnv {
  // `process.env` yayılımı ProcessEnv tipini korur (Next'in zorunlu kıldığı NODE_ENV dahil: boş nesne bu tipe uymaz); sızmaması gerekenler sonra silinir.
  const e: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }
  for (const k of Object.keys(e)) {
    if (k.startsWith('VITEST') || k === 'VENTHUB_DUNYA_DURUMU' || k === TABAN_ORTAM || k === DEGISEN_ORTAM || k === SHARD_ORTAM) delete e[k]
  }
  if (kip) e.VENTHUB_DUNYA_DURUMU = kip
  if (taban) e[TABAN_ORTAM] = taban
  if (degisen) e[DEGISEN_ORTAM] = degisen
  return e
}

interface VitestListesi {
  dosyalar: string[]
  /** Alt sürecin stderr'i: `vitest.config.ts`in taban uyarısını (`[dunya-durumu] ...`) burada okuruz. */
  stderr: string
}

function vitestListesi(kip: Kip, taban: string | null = LISTE_MUTLAK, deneme = 1, degisen: string | null = degisenIlgisiz): Promise<VitestListesi> {
  return new Promise((cozum, red) => {
    execFile(
      process.execPath,
      [VITEST_GIRISI, 'list', '--filesOnly'],
      { cwd: KOK, env: ortamKur(kip, taban, degisen), encoding: 'utf8', timeout: ALT_SUREC_ZAMAN_ASIMI_MS, maxBuffer: 64 * 1024 * 1024, windowsHide: true },
      (hata, stdout, stderr) => {
        // Geçici alt süreç hatası (yük altında başlatma, disk) bir kez yeniden denenir; kalıcı hata (bozuk config) ikinci denemede de düşer ve bildirilir.
        if (hata && deneme < 2) return cozum(vitestListesi(kip, taban, deneme + 1, degisen))
        if (hata) return red(new Error(`vitest list (kip "${kip || 'boş'}") ${deneme} denemede de başarısız: ${hata.message}\n${String(stderr).slice(-1500)}`))
        // Boş küme HATA DEĞİLDİR: `yalniz` kipinde dışlama listeyi de yutarsa küme boş gelir ve bunu ilgili teste söyletmek gerekir.
        const dosyalar = String(stdout)
          .replace(ANSI, '')
          .split(/\r?\n/)
          .map((s) => s.trim().replace(/\\/g, '/'))
          .filter((s) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(s))
        return cozum({ dosyalar: sirali(dosyalar), stderr: String(stderr).replace(ANSI, '') })
      },
    )
  })
}

const vitestDosyalari = (kip: Kip): Promise<string[]> => vitestListesi(kip).then((r) => r.dosyalar)

/**
 * `vitest.config.ts`in stderr'indeki `[dunya-durumu] ...` satırları iki türdür: UYARI (taban/değişen dosyalar okunamadı) ve `dislan`da yazılan tek ÖZET satırı
 * `dışlanan=N tutulan=M değişen=K` (ALT-38i Ö4). Uyarı sayan testler özeti SAYMAZ, özeti arayan testler uyarıyı: iki tür birbirini maskelemesin diye ayrı süzülür.
 */
const OZET_DESENI = /^\[dunya-durumu\] dışlanan=\d+ tutulan=\d+ değişen=(?:\d+|\?)$/
const dunyaSatirlari = (stderr: string): string[] => stderr.split(/\r?\n/).filter((s) => s.startsWith('[dunya-durumu] '))
const uyariSatirlari = (stderr: string): string[] => dunyaSatirlari(stderr).filter((s) => !OZET_DESENI.test(s))
const ozetSatirlari = (stderr: string): string[] => dunyaSatirlari(stderr).filter((s) => OZET_DESENI.test(s))

/** TAM (boş) kip: izlenen hiçbir test dosyası düşmemeli, tablodaki dışlamalar GERÇEKTEN dışarıda, listedeki her yol listelenmeli. */
function bosKipIhlalleri(bos: readonly string[], tum: readonly string[], yollar: readonly string[]): string[] {
  const k = new Set(bos)
  const ihlal: string[] = []
  const dusen = tum.filter((d) => !k.has(d))
  if (dusen.length) ihlal.push(`tam kipte listelenmeyen (belgesiz dışlanan) test dosyaları: ${dusen.join(', ')}`)
  const sizan = bos.filter((d) => VITEST_DISI.some((v) => v.desen.test(d)))
  if (sizan.length) ihlal.push(`tabloda "dışarıda" yazan ama tam kipte listelenen dosyalar: ${sizan.join(', ')}`)
  const yetim = yollar.filter((y) => !k.has(y))
  if (yetim.length) ihlal.push(`listedeki test tam kipte bile listelenmiyor (yetim ya da dışlanmış): ${yetim.join(', ')}`)
  return ihlal
}
/** `dislan` = tam − liste: listedekiler DIŞARIDA, kalan her dosya İÇERİDE, başka bir şey fazla/eksik değil. */
function dislanKipIhlalleri(dislan: readonly string[], bos: readonly string[], yollar: readonly string[]): string[] {
  const ihlal: string[] = []
  const hala = dislan.filter((d) => yollar.includes(d))
  if (hala.length) ihlal.push(`dislan kipinde listedeki test hâlâ koşuyor (dışlama exclude'a bağlı değil): ${hala.join(', ')}`)
  const beklenen = bos.filter((d) => !yollar.includes(d))
  const fazla = dislan.filter((d) => !beklenen.includes(d))
  const eksik = beklenen.filter((d) => !dislan.includes(d))
  if (fazla.length) ihlal.push(`dislan kipinde tam kümede olmayan dosyalar var: ${fazla.join(', ')}`)
  if (eksik.length) ihlal.push(`dislan kipi listede OLMAYAN dosyaları da dışlıyor: ${eksik.join(', ')}`)
  return ihlal
}
/** `yalniz` = liste: yalnız listedeki testler koşar. */
function yalnizKipIhlalleri(yalniz: readonly string[], yollar: readonly string[]): string[] {
  const ihlal: string[] = []
  const fazla = yalniz.filter((d) => !yollar.includes(d))
  const eksik = yollar.filter((d) => !yalniz.includes(d))
  if (fazla.length) ihlal.push(`yalniz kipinde listede olmayan dosyalar da koşuyor (include bağlı değil): ${fazla.slice(0, 5).join(', ')}${fazla.length > 5 ? ` ... (+${fazla.length - 5})` : ''}`)
  if (eksik.length) ihlal.push(`yalniz kipinde listedeki test koşmuyor: ${eksik.join(', ')}`)
  return ihlal
}

/** vitest.config.ts'teki her `exclude: [...]` dizisinin tırnaklı öğeleri. Köşeli parantez dize İÇİNDE de olabilir (`[id]`), bu yüzden dize farkında taranır. */
function statikDislamalar(cfgMetni: string): string[] {
  const m = cfgMetni
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((s) => !/^\s*\/\//.test(s))
    .join('\n')
  const sonuc: string[] = []
  for (const bas of m.matchAll(/\bexclude:\s*\[/g)) {
    let derinlik = 1
    let tirnak = ''
    let simdiki = ''
    for (let i = (bas.index ?? 0) + bas[0].length; i < m.length && derinlik > 0; i += 1) {
      const c = m[i]
      if (tirnak) {
        if (c === tirnak) {
          sonuc.push(simdiki)
          tirnak = ''
          simdiki = ''
        } else simdiki += c
      } else if (c === "'" || c === '"' || c === '`') tirnak = c
      else if (c === '[') derinlik += 1
      else if (c === ']') derinlik -= 1
    }
  }
  return sonuc
}

describe('INV-TEST-KOSU-1 — her test dosyası bir yerde koşar, çıkan testin yeni yeri gerçek', () => {
  const liste = D.listeyiOku()
  const ci = readFileSync(path.join(KOK, '.github/workflows/ci.yml'), 'utf8').replace(/\r\n/g, '\n')
  const dunyaYml = readFileSync(path.join(KOK, '.github/workflows/dunya-durumu.yml'), 'utf8').replace(/\r\n/g, '\n')
  const var_ = (yol: string) => existsSync(path.join(KOK, yol))

  it('bugünkü liste, ci.yml ve dunya-durumu.yml tutarlı', () => {
    expect(denetle(ci, dunyaYml, liste, var_)).toEqual([])
  })

  it('üç kip: tam hiçbir şeyi dışarıda bırakmaz, dislan listeyi dışlar, yalniz yalnız listeyi koşar', () => {
    const yollar = liste.testler.map((t) => t.test)
    expect(D.ayar({}, liste)).toEqual({ kip: 'tam', exclude: [], include: null })
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: '' }, liste)).toEqual({ kip: 'tam', exclude: [], include: null })
    // `dislan` = PR listesi ∩ taban: taban açıkça çalışma ağacındaki listenin kendisi (git geçmişinden bağımsız); kesişimin kendisi birim testte.
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislan', ...TABAN_GERCEK, ...degisenGercek() }, liste)).toEqual({ kip: 'dislan', exclude: yollar, include: null })
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: 'yalniz' }, liste)).toEqual({ kip: 'yalniz', exclude: [], include: yollar })
  })

  it('geçersiz kip FIRLATIR (yazım hatası kapıyı sessizce kaldırmasın)', () => {
    expect(() => D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislam' }, liste)).toThrow(/geçersiz/)
    expect(() => D.ayar({ VENTHUB_DUNYA_DURUMU: 'hepsi' }, liste)).toThrow(/geçersiz/)
  })

  it('KAPSAM: dislan ∪ yalniz = tam — hiçbir test dosyası iki kipte birden düşmez', () => {
    const tum = testDosyalari().filter((d) => !VITEST_DISI.some((v) => v.desen.test(d)))
    const dislan = D.ayar({ VENTHUB_DUNYA_DURUMU: 'dislan', ...TABAN_GERCEK, ...degisenGercek() }, liste)
    const yalniz = D.ayar({ VENTHUB_DUNYA_DURUMU: 'yalniz' }, liste)
    const prdeKosan = tum.filter((d) => !dislan.exclude.includes(d))
    const zamanlidaKosan = tum.filter((d) => (yalniz.include as string[]).includes(d))
    const kosanlar = new Set([...prdeKosan, ...zamanlidaKosan])
    expect([...kosanlar].sort()).toEqual(tum)
    // Listedeki her test PR'da DIŞARIDA, zamanlıda İÇERİDE.
    for (const t of liste.testler) {
      expect(prdeKosan).not.toContain(t.test)
      expect(zamanlidaKosan).toContain(t.test)
    }
  })

  it('vitest dışı (statik exclude) dosyaların HEPSİ tabloda gerekçesiyle yazılı ve koştuğu yer var', () => {
    const cfg = readFileSync(path.join(KOK, 'vitest.config.ts'), 'utf8')
    const statik = statikDislamalar(cfg)
    // Çift yıldızla başlayan süzgeç YALNIZ bağımlılık ve derleme çıktısı içindir; başka her biri (ör. belirli bir test dosyası adı) BELGESİZ dosya dışlamasıdır.
    expect(statik.filter((g) => g.startsWith('**/')).sort()).toEqual(['**/dist/**', '**/node_modules/**'])
    const dosyaGlobu = statik.filter((g) => !g.startsWith('**/'))
    expect(dosyaGlobu.sort()).toEqual(['tests/e2e/empirical_*.test.ts', 'tests/smoke/**'])
    for (const v of VITEST_DISI) {
      const dosyalar = testDosyalari().filter((d) => v.desen.test(d))
      expect(dosyalar.length, `${v.desen} hiçbir dosyayla eşleşmiyor (tablo bayat)`).toBeGreaterThan(0)
      for (const k of v.kanit) expect(existsSync(path.join(KOK, k)), `${v.yer}: ${k} yok`).toBe(true)
    }
  })

  it('smoke dosyaları gerçekten vitest.smoke.config.ts kapsamında', () => {
    const cfg = readFileSync(path.join(KOK, 'vitest.smoke.config.ts'), 'utf8')
    expect(cfg).toMatch(/tests\/smoke/)
  })

  // ── GERÇEK YÜKLEME: vitest.config.ts alt süreçte yüklenir; dosya kümesi tam eşitlikle sınanır ──────────────────────
  // Üç alt süreç bir kez, birlikte başlar (her biri ~2-3 sn). Her kip KENDİ sözünü taşır: bir kip patlarsa (ör. `yalniz` boş küme verirse)
  // yalnız o kipi sınayan test kırmızı olur, ilgisiz testler değil. Hata `it` içinde fırlar (kanca değil: kanca hatası "test" sayılmaz).
  const kumeSozleri = new Map<Kip, Promise<string[]>>()
  const kume = (kip: Kip): Promise<string[]> => {
    if (kumeSozleri.size === 0) {
      for (const k of ['', 'dislan', 'yalniz'] as const) {
        const soz = vitestDosyalari(k)
        soz.catch(() => undefined) // henüz beklenmeyen söz "işlenmemiş ret" sayılmasın; hata, kipi bekleyen testte fırlar
        kumeSozleri.set(k, soz)
      }
    }
    return kumeSozleri.get(kip) as Promise<string[]>
  }
  const yollar = liste.testler.map((t) => t.test)

  it('GERÇEK config tam kip: izlenen her test dosyası listelenir, belgesiz dışlama yok', async () => {
    const bos = await kume('')
    expect(bos.length, 'vitest list çıktısı ayrıştırılamadı ya da boş (biçim değişmiş olabilir)').toBeGreaterThan(0)
    const tum = testDosyalari().filter((d) => !VITEST_DISI.some((v) => v.desen.test(d)))
    expect(bosKipIhlalleri(bos, tum, yollar)).toEqual([])
  }, 90_000)

  it('GERÇEK config dislan: tam kümeden YALNIZ liste çıkar (listedekiler dışarıda, kalan hepsi içeride)', async () => {
    const [bos, dislan] = await Promise.all([kume(''), kume('dislan')])
    expect(dislanKipIhlalleri(dislan, bos, yollar)).toEqual([])
  }, 90_000)

  it('GERÇEK config yalniz: koşan küme TAM olarak liste', async () => {
    const yalniz = await kume('yalniz')
    expect(yalnizKipIhlalleri(yalniz, yollar)).toEqual([])
    expect(yalniz).toEqual(sirali(yollar))
  }, 90_000)

  // ── YOL SÜZGECİ (ALT-38i): süzgeçli kayıt PR'ın değişen dosyaları süzgece uyuyorsa PR kapısında KALIR; GERÇEK config yolunda da çalışmalı ──────────────
  // Değişen dosyalar alt sürece dosya yoluyla verilir (git geçmişi yok). Bu iki test, `vitest.config.ts` → `ayar(process.env)` zincirinde değişen dosyaların
  // ortamdan geçtiğini ve süzgeçli kaydın GERÇEKTEN kapıda kaldığını (ve uymayanın çıktığını) ölçer; birim kollar (scripts/ci/__tests__/dunya-durumu.test.ts) eşleşme kuralını sınar.
  /** Süzgeç öğesi bu yola uyar mı: BAĞIMSIZ küçük yeniden yazım (modülün `filtreEslesirMi`sini kullanmak testi totolojik yapardı). */
  const uyar = (filtre: string[], yol: string) => filtre.some((g) => (g.endsWith('/') ? yol.startsWith(g) : yol === g))
  const suzgecliKayitlar = () => liste.testler.filter((t) => Array.isArray(t.yolFiltresi))

  it('GERÇEK config dislan + süzgece UYAN değişen dosya: süzgeci uyan test(ler) PR kapısında KALIR, uymayanlar ve süzgeçsizler dışarıda; uyarı yok', async () => {
    const degisen = '.githooks/post-commit' // githooks-doc-scope'un ölçülmüş girdisi
    const dosya = degisenDosyasiYaz('uyan.txt', [degisen])
    const [bos, dislan] = await Promise.all([kume(''), vitestListesi('dislan', LISTE_MUTLAK, 1, dosya)])
    expect(dislan.dosyalar.length, 'vitest list çıktısı ayrıştırılamadı ya da boş (biçim değişmiş olabilir)').toBeGreaterThan(0)
    const tutulan = suzgecliKayitlar()
      .filter((t) => uyar(t.yolFiltresi as string[], degisen))
      .map((t) => t.test)
    expect(tutulan, 'ölçülmüş girdi hiçbir süzgece uymuyor: kol hiçbir şey ölçmüyor (süzgeç listeden düşmüş olabilir)').toContain(
      'src/__tests__/conformance/githooks-doc-scope.test.ts',
    )
    const beklenenDisarida = yollar.filter((y) => !tutulan.includes(y))
    expect(beklenenDisarida.length, 'bu girdide hiçbir test dışarıda kalmıyor: kol dışlamayı ölçmüyor').toBeGreaterThan(0)
    expect(dislan.dosyalar).toEqual(sirali(bos.filter((d) => !beklenenDisarida.includes(d))))
    for (const t of tutulan) expect(dislan.dosyalar, `${t} süzgece uydu ama PR kapısında KOŞMUYOR`).toContain(t)
    expect(uyariSatirlari(dislan.stderr), 'okunabilen değişen dosyalar uyarı üretmemeli').toEqual([])
    expect(ozetSatirlari(dislan.stderr), `özet satırı TEK ve sayılar kümeyle tutarlı olmalı; stderr: ${dislan.stderr}`).toEqual([
      `[dunya-durumu] dışlanan=${beklenenDisarida.length} tutulan=${tutulan.length} değişen=1`,
    ])
  }, 90_000)

  it("GERÇEK config dislan + OKUNAMAYAN değişen dosya listesi: süzgeçli testler dışlanmaz (güvenli taraf), süzgeçsizler yine dışarıda, stderr'e TEK uyarı yazılır", async () => {
    const yokDegisen = path.join(degisenDizini, 'yok.txt')
    const [bos, dislan] = await Promise.all([kume(''), vitestListesi('dislan', LISTE_MUTLAK, 1, yokDegisen)])
    expect(dislan.dosyalar.length, 'vitest list çıktısı ayrıştırılamadı ya da boş (biçim değişmiş olabilir)').toBeGreaterThan(0)
    const suzgecli = suzgecliKayitlar().map((t) => t.test)
    expect(suzgecli.length, 'gerçek listede süzgeçli kayıt yok: kol hiçbir şey ölçmüyor').toBeGreaterThan(0)
    const beklenenDisarida = yollar.filter((y) => !suzgecli.includes(y))
    expect(dislan.dosyalar).toEqual(sirali(bos.filter((d) => !beklenenDisarida.includes(d))))
    const uyarilar = uyariSatirlari(dislan.stderr)
    expect(uyarilar, `stderr: ${dislan.stderr}`).toHaveLength(1)
    expect(uyarilar[0]).toContain('değişen dosyalar okunamadı')
    expect(uyarilar[0]).toContain(DEGISEN_ORTAM)
    // Özet satırı okunamayan değişen dosyayı "?" ile söyler ve süzgeçli testlerin hepsi "tutulan"dır (güvenli taraf).
    expect(ozetSatirlari(dislan.stderr), `stderr: ${dislan.stderr}`).toEqual([`[dunya-durumu] dışlanan=${beklenenDisarida.length} tutulan=${suzgecli.length} değişen=?`])
  }, 90_000)

  it('GERÇEK config tam ve yalniz kiplerinde özet satırı YAZILMAZ (yalnız `dislan` dışlama kararı verir)', async () => {
    const [tam, yalniz] = await Promise.all([vitestListesi(''), vitestListesi('yalniz')])
    for (const [kip, r] of [['tam', tam], ['yalniz', yalniz]] as const) {
      expect(r.dosyalar.length, `${kip}: vitest list çıktısı ayrıştırılamadı ya da boş`).toBeGreaterThan(0)
      expect(dunyaSatirlari(r.stderr), `${kip}: stderr: ${r.stderr}`).toEqual([])
    }
  }, 90_000)

  // ── TABAN (ALT-38a B3): `dislan` PR listesi ∩ TABAN'ı dışlar; kesişim GERÇEK config yolunda da çalışmalı ─────────────────────────────
  // Taban listesi alt sürece dosya yoluyla verilir (git geçmişi yok). Bu iki test B3'ün kendisinin regresyonudur: dışlama yalnız PR listesine
  // bakıyor olsaydı (eski davranış) ikisi de kırmızı olurdu, çünkü listedeki test taban BOŞ ya da OKUNAMAZ iken de dışarıda kalırdı.
  it('GERÇEK config dislan + BOŞ taban: hiçbir test dışlanmaz (kesişim gerçek yolda çalışıyor; PR listesi tek başına dışlama sebebi DEĞİL)', async () => {
    const dizin = mkdtempSync(path.join(tmpdir(), 'kosu-kapsami-'))
    try {
      const bosTaban = path.join(dizin, 'taban.json')
      writeFileSync(bosTaban, JSON.stringify({ surum: 1, testler: [] }))
      const [bos, dislan] = await Promise.all([kume(''), vitestListesi('dislan', bosTaban)])
      expect(dislan.dosyalar.length, 'vitest list çıktısı ayrıştırılamadı ya da boş (biçim değişmiş olabilir)').toBeGreaterThan(0)
      expect(dislan.dosyalar).toEqual(bos)
      expect(uyariSatirlari(dislan.stderr), 'geçerli (boş) taban uyarı üretmemeli').toEqual([])
      expect(ozetSatirlari(dislan.stderr), `stderr: ${dislan.stderr}`).toEqual(['[dunya-durumu] dışlanan=0 tutulan=0 değişen=1'])
    } finally {
      rmSync(dizin, { recursive: true, force: true })
    }
  }, 90_000)

  it('GERÇEK config dislan + OKUNAMAYAN taban: hiçbir test dışlanmaz (TAM paket) ve stderr\'e TEK uyarı yazılır (sessiz değil)', async () => {
    const dizin = mkdtempSync(path.join(tmpdir(), 'kosu-kapsami-'))
    try {
      const yokTaban = path.join(dizin, 'yok.json')
      const [bos, dislan] = await Promise.all([kume(''), vitestListesi('dislan', yokTaban)])
      expect(dislan.dosyalar.length, 'vitest list çıktısı ayrıştırılamadı ya da boş (biçim değişmiş olabilir)').toBeGreaterThan(0)
      expect(dislan.dosyalar).toEqual(bos)
      const uyarilar = uyariSatirlari(dislan.stderr)
      expect(uyarilar, `stderr: ${dislan.stderr}`).toHaveLength(1)
      expect(uyarilar[0]).toContain('taban listesi okunamadı')
      expect(uyarilar[0]).toContain(TABAN_ORTAM)
      expect(ozetSatirlari(dislan.stderr), `stderr: ${dislan.stderr}`).toEqual(['[dunya-durumu] dışlanan=0 tutulan=0 değişen=1'])
    } finally {
      rmSync(dizin, { recursive: true, force: true })
    }
  }, 90_000)

  it("ayar('tam') açık kip geçerli (boş kipin aynısı); komut satırı --kip çalışır, geçersiz kip hata koduyla durur", () => {
    expect(D.ayar({ VENTHUB_DUNYA_DURUMU: 'tam' }, liste)).toEqual({ kip: 'tam', exclude: [], include: null })
    const cli = (kip: string) =>
      spawnSync(process.execPath, [path.join(KOK, 'scripts/ci/dunya-durumu.cjs'), '--kip', kip, '--json'], { cwd: KOK, env: ortamKur(''), encoding: 'utf8', timeout: 30_000 })
    for (const kip of ['tam', 'dislan', 'yalniz']) {
      const r = cli(kip)
      expect(r.status, `--kip ${kip}: ${r.stderr}`).toBe(0)
      expect(JSON.parse(r.stdout), `--kip ${kip}`).toEqual(D.ayar({ VENTHUB_DUNYA_DURUMU: kip, ...TABAN_GERCEK, ...degisenGercek() }, liste))
      expect(r.stderr, `--kip ${kip}: taban verildi, uyarı olmamalı`).toBe('')
    }
    const gecersiz = cli('hepsi')
    expect(gecersiz.status, 'geçersiz kip sıfır olmayan çıkış kodu vermeli').not.toBe(0)
    expect(gecersiz.stderr).toMatch(/geçersiz/)
  })

  // ── İŞ AKIŞI YAPISI: satır/adım düzeyinde TAM EŞİTLİK ────────────────────────────────────────────────────────────
  it('İŞ AKIŞI dunya-durumu.yml: test adımı tam komut, kabuk (pipefail), yutma ve koşul yok', () => {
    expect(dunyaYmlHatalari(dunyaYml)).toEqual([])
  })

  it('İŞ AKIŞI dunya-durumu.yml: zamanlı koşu en çok 6 saat aralıklı (cron ayrıştırılır), tetikleyici yalnız schedule + elle', () => {
    expect(cronHatalari(dunyaYml)).toEqual([])
  })

  it("İŞ AKIŞI ci.yml: Test adımı master push'ta KOŞAR (push, kabuk, if, env, run tam eşitlik)", () => {
    expect(ciYmlHatalari(ci)).toEqual([])
  })

  it('`pnpm test` betiği süzgeçsiz vitest: üç koşu yerinin ortak girişi daraltılmamış', () => {
    expect(testBetigiIhlalleri(readFileSync(path.join(KOK, 'package.json'), 'utf8'))).toEqual([])
  })

  // ── ÖLÇÜ ALETLERİNİN KENDİ DOĞRULAMASI: ölçen kod sessizce yanlış ölçerse yukarıdaki yeşil de yalandır ─────────────
  it('cron ayrıştırıcı: bilinen ifadelerin en geniş aralığı (dakika) ve geçersiz ifade FIRLATIR', () => {
    expect(cronEnGenisAralikDk(['23 */6 * * *'])).toBe(360)
    expect(cronEnGenisAralikDk(['0 */6 * * *'])).toBe(360)
    expect(cronEnGenisAralikDk(['0 */7 * * *'])).toBe(420) // 0,7,14,21: 7 saatlik aralıklar var (21'den ertesi gün 0'a yalnız 3 saat)
    expect(cronEnGenisAralikDk(['0 */12 * * *'])).toBe(720)
    expect(cronEnGenisAralikDk(['0 0 * * *'])).toBe(1440)
    expect(cronEnGenisAralikDk(['*/5 * * * *'])).toBe(5)
    expect(cronEnGenisAralikDk(['0,30 * * * *'])).toBe(30)
    expect(cronEnGenisAralikDk(['0 0-23/2 * * *'])).toBe(120)
    expect(cronEnGenisAralikDk(['23 */6 * * 1-5'])).toBe(54 * 60) // hafta içi: cuma 18:23 → pazartesi 00:23
    expect(cronEnGenisAralikDk(['23 */6 * * MON-FRI'])).toBe(54 * 60)
    expect(cronEnGenisAralikDk(['23 4 * * 0'])).toBeGreaterThanOrEqual(7 * 1440) // haftalık
    expect(cronEnGenisAralikDk(['23 4 * * 7'])).toBeGreaterThanOrEqual(7 * 1440) // 7 = pazar
    expect(cronEnGenisAralikDk(['0 0 1 * *'])).toBeGreaterThanOrEqual(28 * 1440) // aylık
    expect(cronEnGenisAralikDk(['0 0 1 1 *'])).toBeGreaterThanOrEqual(365 * 1440) // yılda bir
    expect(cronEnGenisAralikDk(['0 0 31 2 *'])).toBe(Number.POSITIVE_INFINITY) // hiç ateşlenmez
    // yalnız yılın başında yoğun ateşleyen ifade "aralıkları küçük" görünür ama yıl sarması gerçeği söyler
    expect(cronEnGenisAralikDk(['*/5 * 1-3 1 *'])).toBeGreaterThan(300 * 1440)
    // birleşim: iki ifade birbirinin boşluğunu doldurur
    expect(cronEnGenisAralikDk(['0 0,12 * * *', '0 6,18 * * *'])).toBe(360)
    expect(cronEnGenisAralikDk(['0 0,12 * * *', '30 7 * * *'])).toBe(720) // 00:00, 07:30, 12:00: en geniş 12:00 → ertesi 00:00
    for (const bozuk of ['* * * *', '60 * * * *', '* 24 * * *', '*/0 * * * *', 'a b c d e', '1-2-3 * * * *', '* * 0 * *', '5-2 * * * *']) {
      expect(() => cronEnGenisAralikDk([bozuk]), bozuk).toThrow()
    }
  })

  it('küme doğrulayıcıları: bozuk dosya kümeleri yakalanır (gerçek yükleme gerekmeden)', () => {
    const tum = ['a/x.test.ts', 'b/y.test.ts', 'c/z.test.ts']
    const dunya = ['c/z.test.ts']
    expect(bosKipIhlalleri(tum, tum, dunya)).toEqual([])
    expect(bosKipIhlalleri(['a/x.test.ts', 'c/z.test.ts'], tum, dunya).join('|')).toContain('b/y.test.ts') // belgesiz dışlama
    expect(bosKipIhlalleri([...tum, 'tests/smoke/duman.test.ts'], tum, dunya).join('|')).toContain('tablo') // tablodaki dışlama sızıyor
    expect(bosKipIhlalleri(['a/x.test.ts', 'b/y.test.ts'], tum.slice(0, 2), dunya).join('|')).toContain('yetim') // liste tam kipte yok
    expect(dislanKipIhlalleri(['a/x.test.ts', 'b/y.test.ts'], tum, dunya)).toEqual([])
    expect(dislanKipIhlalleri(tum, tum, dunya).join('|')).toContain('hâlâ koşuyor') // exclude bağı yok
    expect(dislanKipIhlalleri(['a/x.test.ts'], tum, dunya).join('|')).toContain('b/y.test.ts') // fazla dışlama
    expect(dislanKipIhlalleri(['a/x.test.ts', 'b/y.test.ts', 'd/w.test.ts'], tum, dunya).join('|')).toContain('d/w.test.ts')
    expect(yalnizKipIhlalleri(dunya, dunya)).toEqual([])
    expect(yalnizKipIhlalleri(tum, dunya).join('|')).toContain('include bağlı değil') // include bağı yok
    expect(yalnizKipIhlalleri([], dunya).join('|')).toContain('c/z.test.ts')
    const paket = (betik: string) => JSON.stringify({ scripts: { test: betik } })
    expect(testBetigiIhlalleri(paket(TEST_BETIGI))).toEqual([])
    for (const bozuk of [`${TEST_BETIGI} --dir src`, `${TEST_BETIGI} src/lib`, `${TEST_BETIGI} --project x`, 'vitest', `${TEST_BETIGI} -t kisa`]) {
      expect(testBetigiIhlalleri(paket(bozuk)).join('|'), bozuk).toContain('scripts.test')
    }
    expect(testBetigiIhlalleri(JSON.stringify({ scripts: {} })).join('|')).toContain('scripts.test')
    expect(statikDislamalar("test: { exclude: ['**/a/**', \"b/*.test.ts\", `c/**`, '**/[id].test.ts', ...x.exclude], include: ['i'] }")).toEqual([
      '**/a/**',
      'b/*.test.ts',
      'c/**',
      '**/[id].test.ts',
    ])
  })

  it('iş akışı doğrulayıcıları: bozulmuş iş akışları yakalanır (her çapa gerçek dosyadan türer)', () => {
    const degistir = (metin: string, desen: RegExp, yerine: string): string => {
      const yeni = metin.replace(desen, yerine)
      expect(yeni, `bozma çapası bulunamadı: ${desen}`).not.toBe(metin)
      return yeni
    }
    expect(dunyaYmlHatalari(dunyaYml)).toEqual([])
    expect(cronHatalari(dunyaYml)).toEqual([])
    expect(ciYmlHatalari(ci)).toEqual([])
    // Bozma çapaları YORUMSUZ ve satır sonu yorumsuz metne uygulanır: gerçek dosyada yorum düzeltmesi bu doğrulayıcı testini kırmaz
    // (gerçek dosyaların kendisi yukarıdaki üç satırda ve ayrı testlerde tam denetlenir).
    const ciN = `${satirlar(ci).join('\n')}\n`
    const dunyaN = `${satirlar(dunyaYml).join('\n')}\n`
    const adimBasi = /(- name: Dunya durumu testleri\n)/
    const dunyaBozuk: Array<[string, string, RegExp]> = [
      ['test kırmızısı || true ile yutulur', degistir(dunyaN, /(tee dunya-durumu\.log)/, '$1 || true'), /Dunya durumu testleri[\s\S]*FARKLI/],
      ['kabuk (pipefail) bloğu silinir', degistir(dunyaN, /\n {4}defaults:\n {6}run:\n {8}shell: bash/, ''), /varsayılan kabuk/],
      ['kabuk sh olur', degistir(dunyaN, /shell: bash/, 'shell: sh'), /varsayılan kabuk/],
      ['adım continue-on-error', degistir(dunyaN, adimBasi, '$1        continue-on-error: true\n'), /Dunya durumu testleri[\s\S]*FARKLI/],
      ['iş continue-on-error', degistir(dunyaN, /(timeout-minutes: 20\n)/, '$1    continue-on-error: true\n'), /izin verilmeyen anahtar \[continue-on-error\]/],
      ['iş continue-on-error steps sonrasında', `${dunyaN.trimEnd()}\n    continue-on-error: true\n`, /izin verilmeyen anahtar \[continue-on-error\]/],
      ['iş koşulu', degistir(dunyaN, /(runs-on: ubuntu-latest\n)/, "$1    if: github.event_name == 'schedule'\n"), /izin verilmeyen anahtar \[if\]/],
      ['iş environment (onay bekletir)', degistir(dunyaN, /(runs-on: ubuntu-latest\n)/, '$1    environment: production\n'), /izin verilmeyen anahtar \[environment\]/],
      ['adım koşulu (elle koşuda atlar)', degistir(dunyaN, adimBasi, "$1        if: github.event_name == 'schedule'\n"), /Dunya durumu testleri[\s\S]*FARKLI/],
      ['kip tam', degistir(dunyaN, /VENTHUB_DUNYA_DURUMU: yalniz/, 'VENTHUB_DUNYA_DURUMU: tam'), /Dunya durumu testleri[\s\S]*FARKLI/],
      ['komut daralır', degistir(dunyaN, /pnpm test -- --run/, 'pnpm test -- --run src/__tests__/conformance'), /Dunya durumu testleri[\s\S]*FARKLI/],
      ['test adımı iki kez', `${dunyaN.trimEnd()}\n      - name: Dunya durumu testleri\n        run: echo atla\n`, /2 kez var/],
      ['test adımı silinir', degistir(dunyaN, /- name: Dunya durumu testleri[\s\S]*$/, ''), /0 kez var/],
      ['checkout sabit dal', degistir(dunyaN, /(fetch-depth: 0\n)/, '$1          ref: eski-dal\n'), /Checkout `ref:`/],
      ['checkout sığ klon', degistir(dunyaN, /fetch-depth: 0/, 'fetch-depth: 1'), /fetch-depth: 0/],
    ]
    for (const [ad, bozuk, beklenen] of dunyaBozuk) expect(dunyaYmlHatalari(bozuk).join('\n'), `dunya-durumu.yml: ${ad}`).toMatch(beklenen)
    const cronBozuk: Array<[string, string, RegExp]> = [
      ['cron haftalığa', degistir(dunyaN, /- cron: '[^']+'/, "- cron: '23 4 * * 0'"), /cron en geniş aralığı/],
      ['cron yedi saatlik', degistir(dunyaN, /- cron: '[^']+'/, "- cron: '23 */7 * * *'"), /cron en geniş aralığı 420/],
      ['cron yalnız hafta içi', degistir(dunyaN, /- cron: '[^']+'/, "- cron: '23 */6 * * 1-5'"), /cron en geniş aralığı/],
      ['cron günlük', degistir(dunyaN, /- cron: '[^']+'/, "- cron: '23 4 * * *'"), /cron en geniş aralığı 1440/],
      ['cron çözülemez', degistir(dunyaN, /- cron: '[^']+'/, "- cron: 'her gün'"), /5 alanlı/],
      ['cron silinir', degistir(dunyaN, /\n {4}- cron: '[^']+'/, ''), /schedule/],
      ['elle tetikleme silinir', degistir(dunyaN, /\n {2}workflow_dispatch:/, ''), /schedule/],
      ['ek tetikleyici', degistir(dunyaN, /(\n {2}workflow_dispatch:)/, '$1\n  push:\n    branches: [yok]'), /schedule/],
    ]
    for (const [ad, bozuk, beklenen] of cronBozuk) expect(cronHatalari(bozuk).join('\n'), `dunya-durumu.yml: ${ad}`).toMatch(beklenen)
    // ALT-38c-2: Test'in `if:` satırı `... && !(<shard olayı>)` oldu; çapalar SATIRIN TAMAMINI yeniden yazar (önek çapası yarım bozma üretirdi).
    // `ci` artık dosyadaki SON iş değil (arkasında `test-shard` işi var): "steps sonrasında" bozmaları `ci` işinin SONUNA, `test-shard:` başlığının önüne eklenir.
    const testKosulu = /(- name: Test\n\s+)if: [^\n]+\n/
    const testIf = (kosul: string): string => `$1if: ${kosul}\n`
    const ciIsSonunaEkle = (n: string, ekle: string): string => degistir(n, /\n( {2}test-shard:\n)/, `\n${ekle}\n$1`)
    const ciBozuk: Array<[string, string, RegExp]> = [
      ["Test adımı master push'ta atlanır", degistir(ciN, testKosulu, testIf("steps.ayna.outputs.atla != 'true' && github.event_name == 'pull_request'")), /"Test" adımı[\s\S]*FARKLI/],
      ["Test adımı PR'da `edited` dahil kapanır (edited koşusunda testler hiçbir yerde koşmaz)", degistir(ciN, testKosulu, testIf("steps.ayna.outputs.atla != 'true' && github.event_name != 'pull_request'")), /"Test" adımı[\s\S]*FARKLI/],
      ["Test adımı hiç kapanmaz (PR'da testler hem `ci` içinde hem shard'larda koşar)", degistir(ciN, testKosulu, testIf("steps.ayna.outputs.atla != 'true'")), /"Test" adımı[\s\S]*FARKLI/],
      ['Test adımı koşulu kalkar', degistir(ciN, /(- name: Test\n)\s+if: [^\n]+\n/, '$1'), /"Test" adımı[\s\S]*FARKLI/],
      ['Test adımı continue-on-error', degistir(ciN, /(- name: Test\n)/, '$1        continue-on-error: true\n'), /"Test" adımı[\s\S]*FARKLI/],
      ['Test adımı || true', degistir(ciN, /(tee ci-test\.log)/, '$1 || true'), /"Test" adımı[\s\S]*FARKLI/],
      ['Test adımı daralır', degistir(ciN, /(run: pnpm test -- --run)/, '$1 src/__tests__/conformance'), /"Test" adımı[\s\S]*FARKLI/],
      ['Test adımı silinir', degistir(ciN, / {6}- name: Test\n(?: {8}[^\n]*\n)+/, ''), /0 kez var/],
      ['push yol süzgeci', degistir(ciN, /( {2}push:\n {4}branches: \[master\]\n)/, "$1    paths-ignore: ['docs/**']\n"), /push tetikleyicisi/],
      ['push yalniz başka dal', degistir(ciN, /branches: \[master\]/, 'branches: [main]'), /push tetikleyicisi/],
      ['push tetikleyicisi silinir', degistir(ciN, /\n {2}push:\n {4}branches: \[master\]/, ''), /push tetikleyicisi/],
      ['iş koşulu', degistir(ciN, /( {4}runs-on: ubuntu-latest\n)/, "$1    if: github.event_name == 'pull_request'\n"), /izin verilmeyen anahtar \[if\]/],
      ['iş koşulu steps sonrasında', ciIsSonunaEkle(ciN, "    if: github.event_name == 'pull_request'"), /izin verilmeyen anahtar \[if\]/],
      ['iş continue-on-error steps sonrasında', ciIsSonunaEkle(ciN, '    continue-on-error: true'), /izin verilmeyen anahtar \[continue-on-error\]/],
      ['iş continue-on-error', degistir(ciN, /( {4}runs-on: ubuntu-latest\n)/, '$1    continue-on-error: true\n'), /izin verilmeyen anahtar \[continue-on-error\]/],
      ['kabuk (pipefail) bloğu silinir', degistir(ciN, /\n {4}defaults:\n {6}run:\n {8}shell: bash/, ''), /varsayılan kabuk/],
      [
        "ayna adımı push'ta da koşar",
        degistir(ciN, /if: github\.event_name == 'pull_request' && github\.event\.action == 'edited'/, "if: github.event_name == 'pull_request' || github.event_name == 'push'"),
        /ayna adımının koşulu/,
      ],
      ['ayna adımı koşulsuz', degistir(ciN, /(id: ayna\n)\s+if: github\.event_name == 'pull_request' && github\.event\.action == 'edited'\n/, '$1'), /ayna adımının koşulu/],
    ]
    for (const [ad, bozuk, beklenen] of ciBozuk) expect(ciYmlHatalari(bozuk).join('\n'), `ci.yml: ${ad}`).toMatch(beklenen)
    // Zararsız değişiklikler KIRMIZI vermez (denetim yanlış sebeple düşmesin): yorum (satır sonu dahil), boş satır, anahtar sırası.
    expect(ciYmlHatalari(degistir(ciN, /(tee ci-test\.log)/, '$1 # satır sonu yorumu')), 'ci.yml: satır sonu yorumu').toEqual([])
    expect(ciYmlHatalari(degistir(ciN, /(- name: Test\n)/, '$1        # arada yorum\n\n')), 'ci.yml: araya yorum ve boş satır').toEqual([])
    expect(
      ciYmlHatalari(degistir(ciN, /(- name: Test\n)(\s+if: [^\n]+\n)(\s+env:\n\s+VENTHUB_DUNYA_DURUMU: [^\n]+\n\s+NODE_COMPILE_CACHE: [^\n]+\n)/, '$1$3$2')),
      'ci.yml: if ve env sırası değişir',
    ).toEqual([])
    expect(cronHatalari(degistir(dunyaN, /- cron: '[^']+'/, "$& # her 6 saatte")), 'dunya-durumu.yml: cron satırında yorum').toEqual([])
    // İş anahtarlarının sırası serbesttir: `defaults` bloğu `steps:` sonrasına taşınırsa KIRMIZI vermez (yanlış sebeple düşmesin).
    // ci.yml'de `ci` işi son iş değil (ALT-38c-2): taşınan blok `ci` işinin SONUNA (sonraki iş `test-shard:`ın önüne) konur; dunya-durumu.yml tek işlidir (dosya sonu).
    const kabuksuz = (n: string) => degistir(n, /\n {4}defaults:\n {6}run:\n {8}shell: bash/, '')
    const KABUK_SONDA = '\n    defaults:\n      run:\n        shell: bash'
    const kabukSonda = (n: string) => `${kabuksuz(n).trimEnd()}${KABUK_SONDA}\n`
    const ciKabukSonda = (n: string) => degistir(kabuksuz(n), /\n( {2}test-shard:\n)/, `${KABUK_SONDA}\n$1`)
    expect(ciYmlHatalari(ciKabukSonda(ciN)), 'ci.yml: defaults steps sonrasında').toEqual([])
    expect(dunyaYmlHatalari(kabukSonda(dunyaN)), 'dunya-durumu.yml: defaults steps sonrasında').toEqual([])
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ────────────────────────
  it('sabotaj 1: listedeki testin dosyası yoksa (yetim kayıt) yakalanır', () => {
    const r = denetle(ci, dunyaYml, liste, (yol) => yol !== liste.testler[0].test)
    expect(r.join('|')).toContain('dosya yok')
  })

  it('sabotaj 2: zamanlı iş akışından cron düşerse ya da yalniz kipi silinirse yakalanır', () => {
    const cronsuz = dunyaYml.replace(/ {4}- cron: '[^']+'\n/, '')
    expect(cronsuz).not.toBe(dunyaYml)
    expect(denetle(ci, cronsuz, liste, var_).join('|')).toContain('schedule')
    const kipsiz = dunyaYml.replace('VENTHUB_DUNYA_DURUMU: yalniz', 'VENTHUB_DUNYA_DURUMU: tam')
    expect(kipsiz).not.toBe(dunyaYml)
    expect(denetle(ci, kipsiz, liste, var_).join('|')).toContain('yalniz')
  })

  it('sabotaj 3: ci işinin Test adımı dislan kipini PR dışına da verirse ya da hiç vermezse yakalanır', () => {
    const herYerde = ci.replace("${{ github.event_name == 'pull_request' && 'dislan' || '' }}", 'dislan')
    expect(herYerde).not.toBe(ci)
    expect(denetle(herYerde, dunyaYml, liste, var_).join('|')).toContain('PR dışına')
    const hicbirYerde = ci.replace("${{ github.event_name == 'pull_request' && 'dislan' || '' }}", "''")
    expect(denetle(hicbirYerde, dunyaYml, liste, var_).join('|')).toContain('PR dışına taşıyor ya da hiç yok')
  })

  it('sabotaj 4: listeden zamanlı yer silinirse, glob girerse, gerekçesiz kayıt eklenirse yakalanır', () => {
    const zamanlisiz: Liste = { ...liste, testler: liste.testler.map((t) => ({ ...t, yeniYer: ['master-push'] })) }
    expect(denetle(ci, dunyaYml, zamanlisiz, var_).join('|')).toContain('zamanli')
    const globlu: Liste = { ...liste, testler: [{ ...liste.testler[0], test: 'src/__tests__/conformance/*.test.ts' }] }
    expect(D.dogrula(globlu, () => true).join('|')).toContain('glob YASAK')
    const gerekcesiz: Liste = { ...liste, testler: [{ ...liste.testler[0], neden: 'kısa', kanit: '' }] }
    expect(D.dogrula(gerekcesiz, () => true).join('|')).toContain('en az 20 karakter')
  })

  it('sabotaj 5: boş liste yakalanır; tekrar eden kayıt yakalanır', () => {
    expect(denetle(ci, dunyaYml, { surum: 1, testler: [] }, var_).join('|')).toContain('liste BOŞ')
    const ikili: Liste = { ...liste, testler: [liste.testler[0], liste.testler[0]] }
    expect(D.dogrula(ikili, () => true).join('|')).toContain('tekrar')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// YOL SÜZGECİ SABİTLEME (ALT-38i, bağımsız denetim Ö1b + Ö1a)
//
// Süzgeç mekanizması (scripts/ci/dunya-durumu.cjs) doğru çalışsa bile, süzgecin KENDİSİ listeden sessizce düşebilir ya da daralabilir:
//   · `yolFiltresi` alanı silinir ya da `yolFiltre` diye yazılır → kayıt süzgeçsiz sayılır, test HER PR'da çıkar (koruma daralır, kırmızı yok),
//   · süzgeçten bir girdi dizini (`scripts/board/`) kalkar → o dizine dokunan PR `sessionstart-tavan`ı kapıda bulamaz,
//   · `session-board.cjs` grafına süzgeç dışında yeni bir dosya girer → aynı sessiz daralma (tamlık sürüklenmesi).
// Bu blok üçünü de mekanik olarak sabitler. Ölçüm işlevleri bir KÖK alır: gerçek ağaçta çağrılır (yeşil olmalı), sabotaj kolları ise gerçek dosyaya DOKUNMADAN
// bir KOPYA kökte aynı işlevleri çağırır (bozuk girdide kırmızı verdiğini göstermek için).
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Gerçek-ağaç denetimlerinin kökü (tek satır: kanıt koşusunda bozuk bir kopyaya çevrilebilsin diye ayrı sabit). */
const SABITLEME_KOKU = KOK
const LISTE_GOR = 'scripts/ci/dunya-durumu-testleri.json'
/** Süzgeçli olmak ZORUNDA olan iki kayıt (ADIYLA): alan silinirse ya da liste bu kayıtları yitirirse kırmızı. */
const GITHOOKS_KAYDI = 'src/__tests__/conformance/githooks-doc-scope.test.ts'
const SESSIONSTART_KAYDI = 'src/__tests__/conformance/sessionstart-tavan.test.ts'
const SUZGECLI_ZORUNLU: readonly string[] = [GITHOOKS_KAYDI, SESSIONSTART_KAYDI]
/**
 * Her zorunlu kaydın süzgeci EN AZ bu girdileri kapsamak zorunda (daha geniş süzgeç serbest, DARALMA kırmızı).
 * Kaynak: çalışma zamanı izlemesiyle ölçülmüş girdiler (docs/standards/test-karnesi-standard.md §3 "Süzgeç girdi ölçümü").
 */
const SUZGEC_ASGARI: Readonly<Record<string, readonly string[]>> = {
  [GITHOOKS_KAYDI]: ['.githooks/', '.cc_docs.yaml'],
  [SESSIONSTART_KAYDI]: ['.claude/hooks/', 'scripts/board/', 'scripts/belge/', 'scripts/hijyen/', 'docs/roller/', '.claude/settings.json'],
}

/** Sabitleme ihlalleri (boş = sağlam): zorunlu kayıt var mı, `yolFiltresi` dolu dizi mi, asgari girdilerin HER BİRİ süzgeç tarafından kapsanıyor mu. */
function suzgecSabitlemeIhlalleri(l: Liste): string[] {
  const ihlal: string[] = []
  for (const ad of SUZGECLI_ZORUNLU) {
    const k = l.testler.find((t) => t.test === ad)
    if (!k) {
      ihlal.push(`${ad}: listede kayıt YOK (PR kapısından çıkış kaldırıldıysa bu sabitleme ve cetvel §3 birlikte güncellenir)`)
      continue
    }
    if (!Array.isArray(k.yolFiltresi) || k.yolFiltresi.length === 0) {
      ihlal.push(`${ad}: yolFiltresi YOK ya da boş (alan silinirse ya da yazım hatasıyla adı değişirse test HER PR'da PR kapısından çıkar, girdisine dokunan PR korumasını kaybeder)`)
      continue
    }
    for (const girdi of SUZGEC_ASGARI[ad]) {
      if (!D.filtreEslesirMi(k.yolFiltresi, girdi)) ihlal.push(`${ad}: yolFiltresi "${girdi}" girdisini KAPSAMIYOR (süzgeç daraldı: bu girdiye dokunan PR testi PR kapısında bulamaz)`)
    }
  }
  return ihlal
}

// ── Ö1a: `session-board.cjs` require grafı ─────────────────────────────────────────────────────────────────────────
const GRAF_GIRISI = '.claude/hooks/session-board.cjs'
/** Bloklu yorumlar atılır; satır başı `//` satırları atılır. Satır sonu yorumlarına DOKUNULMAZ (dizeler içindeki `//` URL'leri bozulmasın). */
const yorumsuzKod = (kaynak: string): string =>
  kaynak
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((s) => !/^\s*\/\//.test(s))
    .join('\n')
/** `require('x')` / `import('x')` (şablon dizesi değil, enterpolasyonsuz). */
const REQUIRE_DESENI = /\b(?:require|import)\s*\(\s*(['"`])([^'"`\n$]+)\1\s*\)/g
/** Statik ESM: `import x from 'y'`, `export { x } from 'y'`. */
const ESM_DESENI = /^[ \t]*(?:import|export)\b[^'"`\n;]*?\bfrom\s*(['"])([^'"\n]+)\1/gm
/** `path.join(__dirname, 'a', 'b')` ve `path.resolve(__dirname, ...)`: TÜM argümanlar dize olduğunda. Karışık argüman (değişken içeren) görünmez. */
const DIRNAME_DESENI = /\bpath\.(?:join|resolve)\(\s*__dirname((?:\s*,\s*(['"`])[^'"`\n$]*\2)+)\s*\)/g
const DIRNAME_ARGUMANI = /(['"`])([^'"`\n$]*)\1/g

/** Bir dosyanın kodundan çıkan aday mutlak yollar (henüz çözümlenmemiş: uzantı/dizin/varlık sonra bakılır). */
function grafAdaylari(kod: string, dir: string): string[] {
  const adaylar: string[] = []
  for (const m of kod.matchAll(REQUIRE_DESENI)) if (m[2].startsWith('.')) adaylar.push(path.resolve(dir, m[2]))
  for (const m of kod.matchAll(ESM_DESENI)) if (m[2].startsWith('.')) adaylar.push(path.resolve(dir, m[2]))
  for (const m of kod.matchAll(DIRNAME_DESENI)) adaylar.push(path.resolve(dir, ...[...m[1].matchAll(DIRNAME_ARGUMANI)].map((x) => x[2])))
  return adaylar
}

/** Aday yolu çözer: önce olduğu gibi, sonra yaygın uzantılarla, sonra `index.*`; yalnız KÖK içindeki, `node_modules` dışındaki gerçek DOSYALAR sayılır (dizinler sayılmaz). */
function grafCozumle(kok: string, aday: string): string | null {
  const dosyaMi = (p: string): boolean => {
    try {
      return statSync(p).isFile()
    } catch {
      return false
    }
  }
  const bulunan =
    ['', '.cjs', '.js', '.mjs', '.json'].map((uz) => `${aday}${uz}`).find(dosyaMi) ?? ['index.cjs', 'index.js', 'index.mjs'].map((i) => path.join(aday, i)).find(dosyaMi)
  if (!bulunan) return null
  const goreli = path.relative(kok, bulunan).replace(/\\/g, '/')
  return goreli.startsWith('..') || path.isAbsolute(goreli) || goreli.startsWith('node_modules/') ? null : goreli
}

/** Girişten başlayan graftaki TÜM repo-içi dosyalar (giriş dahil, sıralı). Yalnız `.cjs/.mjs/.js` dosyalarının içine inilir; `.json` vb. yapraktır. Giriş yoksa boş döner. */
function grafDosyalari(kok: string, giris: string): string[] {
  const gorulen = new Set<string>()
  const sira = [giris]
  for (let g = sira.shift(); g !== undefined; g = sira.shift()) {
    if (gorulen.has(g)) continue
    const mutlak = path.join(kok, g)
    if (!existsSync(mutlak)) continue
    gorulen.add(g)
    if (!/\.(?:cjs|mjs|js)$/.test(g)) continue
    for (const aday of grafAdaylari(yorumsuzKod(readFileSync(mutlak, 'utf8')), path.dirname(mutlak))) {
      const c = grafCozumle(kok, aday)
      if (c !== null && !gorulen.has(c)) sira.push(c)
    }
  }
  return [...gorulen].sort()
}

/** Grafı tarar ve `sessionstart-tavan` kaydının (verilen kökteki listenin) süzgecinin DIŞINDA kalan dosyaları döner. Kayıt ya da süzgeç yoksa HER dosya "dışarıda"dır. */
function suzgecDisiGraf(kok: string): { graf: string[]; disarida: string[] } {
  const k = D.listeyiOku(kok).testler.find((t) => t.test === SESSIONSTART_KAYDI)
  const suzgec = k !== undefined && Array.isArray(k.yolFiltresi) ? k.yolFiltresi : []
  const graf = grafDosyalari(kok, GRAF_GIRISI)
  return { graf, disarida: graf.filter((f) => !D.filtreEslesirMi(suzgec, f)) }
}

describe('YOL SÜZGECİ SABİTLEME — süzgeç listeden düşmez/daralmaz (Ö1b), graf süzgeçten taşmaz (Ö1a)', () => {
  const kopyalar: string[] = []
  afterEach(() => {
    for (const k of kopyalar.splice(0)) rmSync(k, { recursive: true, force: true })
  })

  /** Gerçek ağacın grafını (ve listeyi) yeni bir kök dizine KOPYALAR; sabotaj kopyada yapılır, gerçek dosyaya hiç dokunulmaz. */
  function agacKopyala(): string {
    const kopya = mkdtempSync(path.join(tmpdir(), 'suzgec-sabitleme-'))
    kopyalar.push(kopya)
    for (const g of [...grafDosyalari(SABITLEME_KOKU, GRAF_GIRISI), LISTE_GOR]) {
      const hedef = path.join(kopya, g)
      mkdirSync(path.dirname(hedef), { recursive: true })
      copyFileSync(path.join(SABITLEME_KOKU, g), hedef)
    }
    return kopya
  }
  const dosyaYaz = (kok: string, goreli: string, icerik: string): void => {
    mkdirSync(path.dirname(path.join(kok, goreli)), { recursive: true })
    writeFileSync(path.join(kok, goreli), icerik)
  }
  const dosyaEkle = (kok: string, goreli: string, satir: string): void => dosyaYaz(kok, goreli, `${readFileSync(path.join(kok, goreli), 'utf8')}\n${satir}\n`)
  const gercekListe = (): Liste => JSON.parse(JSON.stringify(D.listeyiOku(SABITLEME_KOKU))) as Liste
  const kayitOf = (l: Liste, ad: string): Kayit => {
    const k = l.testler.find((t) => t.test === ad)
    if (!k) throw new Error(`sabotaj hedefi listede yok: ${ad}`)
    return k
  }
  /** Kopya kökteki listeyi `degistir` ile bozar ve dosyaya yazar (JSON üzerinden: sabotaj dosya yolunda da etkili olur). */
  function listeKopyasiniBoz(kok: string, degistir: (l: Liste) => void): void {
    const l = D.listeyiOku(kok)
    degistir(l)
    writeFileSync(path.join(kok, LISTE_GOR), `${JSON.stringify(l, null, 2)}\n`)
  }

  // ── GERÇEK AĞAÇ: yeşil olmalı ──────────────────────────────────────────────────────────────────────────────────────
  it('iki süzgeçli kayıt ADIYLA yolFiltresi taşır ve asgari girdileri kapsar (githooks-doc-scope + sessionstart-tavan)', () => {
    expect(suzgecSabitlemeIhlalleri(D.listeyiOku(SABITLEME_KOKU))).toEqual([])
  })

  it('asgari girdi tablosu kendi içinde tutarlı: her zorunlu kayıt tabloda, her tablo girdisi geçerli bir süzgeç öğesi (dogrula kabul eder)', () => {
    expect([...SUZGECLI_ZORUNLU].sort()).toEqual(Object.keys(SUZGEC_ASGARI).sort())
    for (const [ad, girdiler] of Object.entries(SUZGEC_ASGARI)) {
      expect(girdiler.length, ad).toBeGreaterThan(0)
      expect(D.dogrula({ surum: 1, testler: [{ ...D.listeyiOku(SABITLEME_KOKU).testler[0], test: ad, yolFiltresi: [...girdiler] }] }), ad).toEqual([])
    }
  })

  it('gerçek liste kapalı şekle uyar: bilinmeyen alan yok (yolFiltre gibi bir yazım hatası burada kırmızı olurdu)', () => {
    expect(D.dogrula(D.listeyiOku(SABITLEME_KOKU))).toEqual([])
  })

  it("TAMLIK: session-board.cjs'ten başlayan literal require ve path.join(__dirname) grafındaki HER repo-içi dosya sessionstart-tavan süzgecine uyar", () => {
    const { graf, disarida } = suzgecDisiGraf(SABITLEME_KOKU)
    // Tarayıcı sessizce hiçbir şey bulmaz hâle gelirse "boş graf = ihlal yok" yeşili sahte olurdu: giriş ve tanınmış üyeler bulunmak zorunda.
    expect(graf, 'giriş dosyası grafta yok (giriş taşındı/silindi: bu sabitleme güncellenmeli)').toContain(GRAF_GIRISI)
    expect(graf.filter((f) => f.startsWith('scripts/board/')).length, 'scripts/board/ altından hiçbir modül bulunamadı: tarayıcı bozuk').toBeGreaterThanOrEqual(3)
    expect(graf.length, `graf yalnız ${graf.length} dosya: tarayıcı bozuk ya da graf çöktü`).toBeGreaterThanOrEqual(10)
    expect(
      disarida,
      `sessionstart-tavan süzgecinin DIŞINDA kalan graf dosyaları (süzgece eklenmeli ya da require kaldırılmalı; aksi hâlde bu dosyalara dokunan PR testi PR kapısında bulamaz): ${disarida.join(', ')}`,
    ).toEqual([])
  })

  // ── SABOTAJ: kopyada bozulunca KIRMIZI ─────────────────────────────────────────────────────────────────────────────
  describe('SABOTAJ (kopya kök): süzgeç girdisi/alan düşünce sabitleme KIRMIZI verir', () => {
    const girdiler = SUZGECLI_ZORUNLU.flatMap((ad) => SUZGEC_ASGARI[ad].map((g): [string, string] => [ad, g]))

    it('kontrol: kopya BOZULMADAN yeşil (sabotaj kolları yanlış sebeple kırmızı vermesin)', () => {
      const kopya = agacKopyala()
      expect(suzgecSabitlemeIhlalleri(D.listeyiOku(kopya))).toEqual([])
      expect(suzgecDisiGraf(kopya).disarida).toEqual([])
    })

    it.each(girdiler)('%s: süzgeçten "%s" SİLİNİNCE kırmızı (dosya yoluyla: listeyi kopyada bozup yeniden okur)', (ad, girdi) => {
      const kopya = agacKopyala()
      listeKopyasiniBoz(kopya, (l) => {
        const k = kayitOf(l, ad)
        k.yolFiltresi = (k.yolFiltresi ?? []).filter((g) => g !== girdi)
      })
      expect(suzgecSabitlemeIhlalleri(D.listeyiOku(kopya))).toEqual([
        `${ad}: yolFiltresi "${girdi}" girdisini KAPSAMIYOR (süzgeç daraldı: bu girdiye dokunan PR testi PR kapısında bulamaz)`,
      ])
    })

    it.each(SUZGECLI_ZORUNLU)('%s: yolFiltresi alanı TÜMDEN silinince kırmızı', (ad) => {
      const kopya = agacKopyala()
      listeKopyasiniBoz(kopya, (l) => {
        delete kayitOf(l, ad).yolFiltresi
      })
      const ihlal = suzgecSabitlemeIhlalleri(D.listeyiOku(kopya))
      expect(ihlal).toHaveLength(1)
      expect(ihlal[0]).toContain(`${ad}: yolFiltresi YOK ya da boş`)
    })

    it.each(SUZGECLI_ZORUNLU)('%s: yolFiltresi BOŞ diziye düşünce kırmızı', (ad) => {
      const kopya = agacKopyala()
      listeKopyasiniBoz(kopya, (l) => {
        kayitOf(l, ad).yolFiltresi = []
      })
      expect(suzgecSabitlemeIhlalleri(D.listeyiOku(kopya)).join('|')).toContain(`${ad}: yolFiltresi YOK ya da boş`)
    })

    it.each(SUZGECLI_ZORUNLU)('%s: alan adı yazım hatasıyla "yolFiltre" olunca İKİ kapı da kırmızı: sabitleme (alan yok) ve dogrula (bilinmeyen alan)', (ad) => {
      const l = gercekListe()
      const k = kayitOf(l, ad)
      Reflect.set(k, 'yolFiltre', k.yolFiltresi)
      delete k.yolFiltresi
      expect(suzgecSabitlemeIhlalleri(l).join('|')).toContain(`${ad}: yolFiltresi YOK ya da boş`)
      expect(D.dogrula(l).join('|')).toContain('bilinmeyen alan "yolFiltre"')
    })

    it.each(SUZGECLI_ZORUNLU)('%s: kayıt listeden TÜMDEN silinince kırmızı', (ad) => {
      const l = gercekListe()
      l.testler = l.testler.filter((t) => t.test !== ad)
      expect(suzgecSabitlemeIhlalleri(l)).toEqual([expect.stringContaining(`${ad}: listede kayıt YOK`)])
    })

    it('süzgeç daralınca graf taşar: scripts/board/ silinince graftaki tüm scripts/board/ dosyaları "dışarıda" çıkar (tamlık kolu aynı sebeple kırmızı)', () => {
      const kopya = agacKopyala()
      listeKopyasiniBoz(kopya, (l) => {
        const k = kayitOf(l, SESSIONSTART_KAYDI)
        k.yolFiltresi = (k.yolFiltresi ?? []).filter((g) => g !== 'scripts/board/')
      })
      const { graf, disarida } = suzgecDisiGraf(kopya)
      expect(disarida.length).toBeGreaterThan(0)
      expect(disarida).toEqual(graf.filter((f) => f.startsWith('scripts/board/')))
    })
  })

  describe('SABOTAJ (kopya kök): grafa süzgeç DIŞINDA bir dosya girince tamlık kolu KIRMIZI verir', () => {
    it("literal require: grafın girişine `require('../../scripts/ci/sahte-girdi.cjs')` eklenince o dosya dışarıda çıkar", () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/ci/sahte-girdi.cjs', 'module.exports = 1\n')
      dosyaEkle(kopya, GRAF_GIRISI, "require('../../scripts/ci/sahte-girdi.cjs')")
      expect(suzgecDisiGraf(kopya).disarida).toEqual(['scripts/ci/sahte-girdi.cjs'])
    })

    it('path.join(__dirname, ...) biçimi: DERİN bir graf düğümüne (scripts/board altında) eklenen veri dosyası da yakalanır (geçişli)', () => {
      const kopya = agacKopyala()
      const derin = grafDosyalari(kopya, GRAF_GIRISI).find((f) => f.startsWith('scripts/board/') && f.endsWith('.cjs'))
      if (derin === undefined) throw new Error('kopya grafında scripts/board/ altında modül yok: kol hiçbir şey ölçmüyor')
      dosyaYaz(kopya, 'docs/plans/sahte-veri.json', '{}\n')
      dosyaEkle(kopya, derin, "const sahte = require(path.join(__dirname, '..', '..', 'docs', 'plans', 'sahte-veri.json'))")
      expect(suzgecDisiGraf(kopya).disarida).toEqual(['docs/plans/sahte-veri.json'])
    })

    it('geçişlilik: süzgeç İÇİNDE yeni bir modül süzgeç DIŞINDAKİ bir dosyayı require ederse dışarıdaki dosya yakalanır, içerideki yakalanmaz', () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/ci/disarida.cjs', 'module.exports = 2\n')
      dosyaYaz(kopya, 'scripts/board/yeni-yardimci.cjs', "module.exports = require('../ci/disarida.cjs')\n")
      dosyaEkle(kopya, GRAF_GIRISI, "require('../../scripts/board/yeni-yardimci.cjs')")
      expect(suzgecDisiGraf(kopya).disarida).toEqual(['scripts/ci/disarida.cjs'])
    })

    it('ESM biçimi: `import x from "../ci/esm-girdi.mjs"` ve `export * from` aynı şekilde yakalanır', () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/ci/esm-girdi.mjs', 'export const x = 1\n')
      dosyaYaz(kopya, 'scripts/ci/esm-diger.mjs', 'export const y = 1\n')
      dosyaYaz(kopya, 'scripts/board/esm-kopru.mjs', "import { x } from '../ci/esm-girdi.mjs'\nexport * from '../ci/esm-diger.mjs'\nexport { x }\n")
      dosyaEkle(kopya, GRAF_GIRISI, "import('../../scripts/board/esm-kopru.mjs')")
      expect(suzgecDisiGraf(kopya).disarida).toEqual(['scripts/ci/esm-diger.mjs', 'scripts/ci/esm-girdi.mjs'])
    })

    it('süzgeç İÇİNE eklenen yeni modül ihlal DEĞİLDİR (süzgeç dizinleri serbestçe büyür)', () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/hijyen/yeni-olcum.cjs', 'module.exports = 3\n')
      dosyaEkle(kopya, GRAF_GIRISI, "require('../../scripts/hijyen/yeni-olcum.cjs')")
      const { graf, disarida } = suzgecDisiGraf(kopya)
      expect(graf).toContain('scripts/hijyen/yeni-olcum.cjs')
      expect(disarida).toEqual([])
    })

    it('YORUM graf kenarı DEĞİLDİR: satır yorumu ve blok yorumdaki require sayılmaz', () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/ci/yorumda.cjs', 'module.exports = 4\n')
      dosyaEkle(kopya, GRAF_GIRISI, "// require('../../scripts/ci/yorumda.cjs')\n/* require('../../scripts/ci/yorumda.cjs')\n   path.join(__dirname, '..', '..', 'scripts', 'ci', 'yorumda.cjs') */")
      const { graf, disarida } = suzgecDisiGraf(kopya)
      expect(graf).not.toContain('scripts/ci/yorumda.cjs')
      expect(disarida).toEqual([])
    })

    it('olmayan hedef ya da paket (node:fs, bağımlılık) graf kenarı DEĞİLDİR; VAR OLAN ama kök dışındaki dosya da sayılmaz', () => {
      const kopya = agacKopyala()
      const kokDisi = path.resolve(kopya, '..', `suzgec-kok-disi-${path.basename(kopya)}.cjs`)
      try {
        writeFileSync(kokDisi, 'module.exports = 6\n')
        dosyaEkle(kopya, GRAF_GIRISI, `require('node:fs')\nrequire('./yok-boyle-bir-dosya.cjs')\nrequire('../../../${path.basename(kokDisi)}')`)
        expect(existsSync(kokDisi), 'kök dışındaki hedef dosya yazılamadı: kol hiçbir şey ölçmüyor').toBe(true)
        const { graf, disarida } = suzgecDisiGraf(kopya)
        expect(graf.some((f) => f.includes('suzgec-kok-disi'))).toBe(false)
        expect(disarida).toEqual([])
      } finally {
        rmSync(kokDisi, { force: true })
      }
    })

    it('değişken içeren path.join(__dirname, x) GÖRÜNMEZ (belgelenmiş sınır): tarayıcı yalnız literal biçimlere bakar', () => {
      const kopya = agacKopyala()
      dosyaYaz(kopya, 'scripts/ci/gorunmez.cjs', 'module.exports = 5\n')
      dosyaEkle(kopya, GRAF_GIRISI, "const ad = 'gorunmez.cjs'\nrequire(path.join(__dirname, '..', '..', 'scripts', 'ci', ad))")
      expect(suzgecDisiGraf(kopya).disarida, 'literal olmayan yollar için çalışma zamanı izleme gerekir (cetvel §3)').toEqual([])
    })
  })
})
