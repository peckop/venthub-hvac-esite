import { execFile } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CI-SHARD-1 · `test-shard` işi ve `ci`nin bekleme adımı ci.yml'ye DOĞRU bağlı (ALT-38c-2).
 * INV-CI-SHARD-2 · shard bölmesi KAPSAMI kanıtlar: birleşim = `vitest list`, kesişim 0, hiçbir test dosyası düşmez, hiçbiri iki kez koşmaz.
 *
 * NİÇİN VAR: pull_request'te (edited HARİÇ) testler `ci` işinde değil, paralel `test-shard` işlerinde koşar; `ci` son adımında aynı koşunun aynı denemesindeki
 * shard işlerinin HEPSİ `success` olmadan yeşil vermez (scripts/ci/test-shard-bekle.cjs; dağıtım: scripts/ci/test-shard.cjs). Kapsam KANITI eskiden "ci içindeki Test
 * adımı koşar"dı; artık bu iki kapıdır. Aşağıdaki bozulma yollarının HEPSİ SESSİZDİR (her iş yeşil görünür, testler koşmaz ya da kırmızı yutulur):
 *   1. `ci`nin bekleme adımı silinir, atlanır (`if`), kırmızıyı yutar (`continue-on-error`, `|| true`) ya da başka bir adım onun ardından gelir (son olmaktan çıkar):
 *      kırmızı shard `ci`yi kırmızı yapmaz, zorunlu kontrol yeşil kalır,
 *   2. `test-shard` işi atlanabilir/bekletilebilir hâle gelir (`needs`, `continue-on-error`, `environment`, `if` değişir): iş yeşil sayılır ama testler koşmamıştır,
 *   3. shard işinin kabuğundan `bash` (pipefail) düşer: `pnpm test ... | tee ci-test.log` kırmızıyı yutar; Test adımına `if`/`continue-on-error`/`|| true` girer,
 *   4. dağıtım komutu bozulur: `--shard` sabitlenir (tüm işler AYNI parçayı koşar, kalan parçalar hiç koşmaz, işler yeşil), `--toplam` matrix'ten farklı olur
 *      (parçaların bir kısmı hiçbir işe girmez), `VENTHUB_TEST_SHARD_DOSYALARI` verilmez (tam paket her işte koşar) ya da `dislan` kipi kalkar,
 *   5. shard sayısı dört yerde ayrışır (matrix, `--toplam`, `ci` SHARD_TOPLAM, iş adındaki `/N`): bekleyici eksik/fazla iş görüp hep kırmızı kalır ya da bir parça beklenmez,
 *   6. `ci` içindeki Test'in koşulu shard olayının TERSİ olmaktan çıkar: PR'da testler iki yerde koşar (süre kazancı sıfır) ya da hiçbir yerde koşmaz,
 *   7. `actions: read` düşer: bekleyici koşunun işlerini okuyamaz, `ci` her PR'da kırmızı kalır,
 *   8. dağıtımın kendisi bozulur: bir test dosyası hiçbir shard'a girmez, iki shard'a girer ya da shard'ın dosya listesi `vitest list`ten farklı olur (INV-CI-SHARD-2).
 * "Dışarıda" olan dünya durumu testleri kapsama dahil edilir: shard'lar ∪ dünya durumu listesi = tam paket (kip boş, `vitest list`).
 *
 * Ölçüm yüzeyi: `node:fs` + satır taraması (YAML ayrıştırıcı yok; girinti sabit: iş 2, iş anahtarı 4, adım 6, adım anahtarı 8, env 10) + alt süreçte
 * `vitest list --filesOnly --json` (ağ yok, test KOŞMAZ). ci.yml'i DEĞİŞTİRMEZ. Sabotaj testleri YAML metnini BELLEKTE bozar ve denetimin KIRMIZI verdiğini ölçer.
 * Ayrıştırılamayan yapı KIRMIZIDIR (boş sonuç "uyumlu" sayılmaz). Aynı işin birim testleri: scripts/ci/__tests__/test-shard.test.ts, test-shard-bekle.test.ts.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
const LISTE_MUTLAK = path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json')
const execFileAsync = promisify(execFile)

interface SureTablosu {
  sureler: Map<string, number>
  varsayilan: number
}
const SHARD = require_(path.join(KOK, 'scripts/ci/test-shard.cjs')) as {
  EN_FAZLA_SHARD: number
  ORTAM_ADI: string
  dagit: (dosyalar: string[], sure: SureTablosu, toplam: number) => { gruplar: string[][]; yuk: number[] }
  sureleriOku: (dosya?: string) => SureTablosu
  vitestListesi: (kok?: string, ortam?: NodeJS.ProcessEnv) => string[]
  yoluNormallestir: (yol: string, kok?: string) => string
}
interface IsKaydi {
  name: string
  status: string
  conclusion: string | null
}
const BEKLE = require_(path.join(KOK, 'scripts/ci/test-shard-bekle.cjs')) as {
  BEKLEME_SN: number
  beklenenAdlar: (toplam: number) => string[]
  main: (
    ortam: Record<string, string | undefined>,
    g?: { api?: { isler: () => Promise<IsKaydi[]> }; uyku?: (ms: number) => Promise<void>; simdi?: () => number; yaz?: (m: string) => void },
  ) => Promise<number>
}

// ── SABİTLER: ci.yml'de TAM bu metinler bulunmalı (değişirse bilinçle burada da değişir) ──────────────────────────────────────────
const SHARD_ISI = 'test-shard'
const CI_ISI = 'ci'
/** Testlerin shard işlerinde koştuğu olay: pull_request ve `edited` DEĞİL. İşin `if`i, bekleme adımının `if`i ve ci Test'inin dışlaması AYNI ifadeyi taşır. */
const SHARD_OLAYI = "github.event_name == 'pull_request' && github.event.action != 'edited'"
const SHARD_IF = `if: ${SHARD_OLAYI}`
const TEST_IF = `if: steps.ayna.outputs.atla != 'true' && !(${SHARD_OLAYI})`
const BEKLE_ADI = 'Test shard sonuçları (bekle ve doğrula)'
const BEKLE_RUN = 'run: node scripts/ci/test-shard-bekle.cjs'
const SHARD_TEST_ONEKI = 'Test (shard '
/** ALT-38e: dağıtım Test adımından AYRILDI (boş parçada vitest koşmasın diye `kos` çıktısı verir); `test-shard.cjs` yalnız bu adımda çağrılır. */
const SHARD_DAGIT_ONEKI = 'Test dağıtımı (shard '
/**
 * ALT-38e: kurulum, seçim 2/2, dağıtım ve Test YALNIZ seçim kendiliğinden BOŞ değilken koşar (çıktı yok, `true` ya da başka değer: KOŞAR; De Morgan biçimi: YAML `!` ile başlayan değeri etiket sayar).
 * Seçim adımlarının gövdeleri, olay kapanışları ve sabotajları: ci-test-secimi.test.ts (INV-CI-SECIM-1).
 */
const SECIM_KURULUM = "(steps.sec.outputs.tam != 'false' || steps.sec.outputs.secilen-sayisi != '0')"
const SHARD_KOSULLU_ADIMLAR = ['Setup Deno', 'Install dependencies', 'Node derleme önbelleği (V8 bayt kodu)', 'Test seçimi (tabandan, vitest ile)']
/** Shard adımının beklenen `if:` satırı; null = adımda HİÇ `if:` olmamalı (atlanabilir adım shard'ı testsiz YEŞİL bitirir). */
function shardAdimKosulu(ad: string): string | null {
  if (SHARD_KOSULLU_ADIMLAR.includes(ad) || ad.startsWith(SHARD_DAGIT_ONEKI)) return `if: ${SECIM_KURULUM}`
  if (ad.startsWith(SHARD_TEST_ONEKI)) return `if: ${SECIM_KURULUM} && steps.dagit.outputs.kos != 'false'`
  return null
}
/** test-shard işinde bulunabilecek job düzeyi anahtarlar: başkası (needs, continue-on-error, environment, permissions...) bilinçle eklenir. */
const IS_ANAHTARLARI = ['name', 'if', 'runs-on', 'timeout-minutes', 'strategy', 'defaults', 'steps']
const IS_ANAHTARI_NEDENI: Record<string, string> = {
  needs: "iş başka işe bağlanırsa sıra ve atlama davranışı değişir (needs'li toplayıcı tasarımda YOK: `ci` shard'ları API'den bekler)",
  'continue-on-error': 'shard kırmızı olsa da iş yeşil kalır, `ci` bekleme adımı kırmızıyı görmez',
  environment: 'iş onay bekletir ya da ortam sırlarına erişir',
  permissions: 'izinler yalnız workflow düzeyindeki en az yetki bloğundan gelir',
}
/** Komutun hatasını yutan kuyruklar: `|| true`, `|| :`, `|| exit 0`, `; true`. */
const HATA_YUTAN = /\|\|\s*(?:true\b|:(?:\s|$)|exit\s+0\b)|;\s*true\s*$/
/**
 * Shard Test adımının ortamı: TAM küme ve TAM değer. ALT-38e: `SHARD` ve `SECIM_*` burada YOKTUR (yalnız dağıtım adımındadır): testlerin koştuğu adımın ortamındaki her değişken ALT SÜREÇLERE MİRAS KALIR
 * (canlı ders: #1741 koşu 2, test-shard (1/4) kırmızı); bu yüzden Test adımının ortamı en küçük kümede tutulur.
 */
const SHARD_TEST_ENV: Record<string, string> = {
  VENTHUB_DUNYA_DURUMU: 'dislan',
  NODE_COMPILE_CACHE: '${{ runner.temp }}/node-compile-cache',
}
/** Dağıtım adımının ortamı: seçici çıktısı (`secv` adımı) argüman olarak değil ENV olarak okunur (kabuğa `${{ }}` gömülmez: enjeksiyon). */
const SHARD_DAGIT_ENV: Record<string, string> = {
  SHARD: '${{ matrix.shard }}',
  VENTHUB_DUNYA_DURUMU: 'dislan',
  SECIM_TAM: '${{ steps.secv.outputs.tam }}',
  SECIM_SAYI: '${{ steps.secv.outputs.secilen-sayisi }}',
}
const KOMUT_DAGIT = (n: number): string =>
  `node scripts/ci/test-shard.cjs --shard "$SHARD" --toplam ${n} --cikti "$RUNNER_TEMP/shard.json" --secim "$RUNNER_TEMP/secilen.txt" --secim-tam "$SECIM_TAM" --secim-sayi "$SECIM_SAYI"`
const KOMUT_KOS = 'VENTHUB_TEST_SHARD_DOSYALARI="$RUNNER_TEMP/shard.json" pnpm test -- --run --reporter=dot 2>&1 | tee ci-test.log'
/** Tek satırlık `run:` anahtar satırları (adımlar artık blok değil, tek komut taşır). */
const RUN_DAGIT = (n: number): string => `run: ${KOMUT_DAGIT(n)}`
const RUN_KOS = `run: ${KOMUT_KOS}`
/** Bekleme adımının ortamı (SHARD_TOPLAM hariç: değeri matrix sayısından türer). */
const BEKLE_ENV_SABIT: Record<string, string> = {
  GH_TOKEN: '${{ github.token }}',
  DEPO: '${{ github.repository }}',
  KOSU_ID: '${{ github.run_id }}',
  KOSU_DENEME: '${{ github.run_attempt }}',
}
/** Dağıtımın dengesi: en yüklü shard / ortalama yük. Ölçülen: 1,00 (622 dosya, 4 shard). */
const DENGE_ESIGI = 1.25

// ── AYRIŞTIRICI (satır taraması) ─────────────────────────────────────────────────────────────────────────────────────────────────
const bosMu = (s: string): boolean => s.trim() === ''
const anlamli = (s: string): boolean => !bosMu(s) && !s.trimStart().startsWith('#')
const girinti = (s: string): number => s.length - s.trimStart().length
const yorumsuz = (satirlar: string[]): string[] => satirlar.filter((s) => !/^\s*#/.test(s))

/** YAML satır sonu yorumunu (boşluk + `#`) atar ve kırpar. */
function degerTemizle(d: string): string {
  const i = d.indexOf(' #')
  return (i < 0 ? d : d.slice(0, i)).trim()
}

interface Anahtar {
  anahtar: string
  deger: string
  no: number
}
interface Adim {
  ad: string
  bas: number
  satirlar: string[]
  anahtarlar: Anahtar[]
  env: Map<string, string>
  girdiler: Map<string, string>
}
interface Aralik {
  bas: number
  bit: number
}

/** `jobs.<isId>` bölümü: `bas` iş satırı (`  ci:`), `bit` dahil değil (sonraki iş ya da üst düzey anlamlı satır). */
function isAraligi(satirlar: string[], isId: string): Aralik | null {
  const jobs = satirlar.findIndex((s) => s.trimEnd() === 'jobs:')
  if (jobs < 0) return null
  const bas = satirlar.findIndex((s, i) => i > jobs && s.trimEnd() === `  ${isId}:`)
  if (bas < 0) return null
  let bit = satirlar.length
  for (let i = bas + 1; i < satirlar.length; i++) {
    if (anlamli(satirlar[i]) && girinti(satirlar[i]) <= 2) {
      bit = i
      break
    }
  }
  return { bas, bit }
}

/** `satirlar[ustNo]` anahtarının DOĞRUDAN çocuk anahtarları (ilk çocuğun girintisindekiler). */
function cocuklar(satirlar: string[], ustNo: number): Anahtar[] {
  const g = girinti(satirlar[ustNo])
  const liste: Anahtar[] = []
  let cocukGirinti = -1
  for (let i = ustNo + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (!anlamli(s)) continue
    if (girinti(s) <= g) break
    if (cocukGirinti < 0) cocukGirinti = girinti(s)
    if (girinti(s) !== cocukGirinti) continue
    const m = /^\s*([A-Za-z_][\w-]*):\s?(.*)$/.exec(s)
    if (m) liste.push({ anahtar: m[1], deger: degerTemizle(m[2]), no: i })
  }
  return liste
}

/** İşin adımları. Adsız adım da bir adımdır (adı ''). Adım bloğu ardışık yorum/boş satırları da taşır. */
function adimlariAyir(satirlar: string[], is: Aralik): Adim[] {
  const adimlar: Adim[] = []
  let mevcut: Adim | null = null
  let blok: 'env' | 'with' | null = null
  let adimlarda = false
  for (let i = is.bas + 1; i < is.bit; i++) {
    const s = satirlar[i]
    if (!adimlarda) {
      if (/^ {4}steps:\s*$/.test(s)) adimlarda = true
      continue
    }
    if (!anlamli(s)) {
      if (mevcut) mevcut.satirlar.push(s)
      continue
    }
    if (girinti(s) <= 4) break
    const yeni = /^ {6}- (.*)$/.exec(s)
    if (yeni) {
      mevcut = { ad: '', bas: i, satirlar: [s], anahtarlar: [], env: new Map(), girdiler: new Map() }
      adimlar.push(mevcut)
      blok = null
    } else if (mevcut) {
      mevcut.satirlar.push(s)
    } else {
      continue
    }
    const anahtar = yeni ? /^([A-Za-z_][\w-]*):\s?(.*)$/.exec(yeni[1]) : girinti(s) === 8 ? /^ {8}([A-Za-z_][\w-]*):\s?(.*)$/.exec(s) : null
    if (anahtar) {
      mevcut.anahtarlar.push({ anahtar: anahtar[1], deger: degerTemizle(anahtar[2]), no: i })
      if (anahtar[1] === 'name') mevcut.ad = degerTemizle(anahtar[2])
      blok = anahtar[1] === 'env' || anahtar[1] === 'with' ? anahtar[1] : null
    } else if (blok && girinti(s) === 10) {
      const e = /^ {10}([A-Za-z_][\w-]*):\s?(.*)$/.exec(s)
      if (e) (blok === 'env' ? mevcut.env : mevcut.girdiler).set(e[1], degerTemizle(e[2]))
    } else if (girinti(s) <= 8) {
      blok = null
    }
  }
  return adimlar
}

const isAdimlari = (metin: string, isId: string): Adim[] => {
  const s = metin.split('\n')
  const is = isAraligi(s, isId)
  return is ? adimlariAyir(s, is) : []
}

/** Adımın TEK satırlık `run:` komutu (ALT-38e: dağıtım ve Test adımları tek komut taşır, blok DEĞİL). Tek `run:` yoksa ya da blok (`|`, `>`) ise null. */
function tekSatirRun(a: Adim): string | null {
  const r = a.anahtarlar.filter((k) => k.anahtar === 'run')
  return r.length === 1 && !/^[|>][-+]?$/.test(r[0].deger) ? r[0].deger : null
}

/** `strategy.matrix.shard` satır içi listesi (`[1, 2, 3, 4]`); okunamazsa null. */
function matrisDegerleri(metin: string): number[] | null {
  const s = metin.split('\n')
  const is = isAraligi(s, SHARD_ISI)
  if (!is) return null
  const st = cocuklar(s, is.bas).find((k) => k.anahtar === 'strategy')
  const mx = st ? cocuklar(s, st.no).find((k) => k.anahtar === 'matrix') : undefined
  const shard = mx ? cocuklar(s, mx.no).find((k) => k.anahtar === 'shard') : undefined
  const m = shard ? /^\[(.*)\]$/.exec(shard.deger) : null
  if (!m) return null
  const parcalar = m[1].split(',').map((x) => x.trim())
  return parcalar.every((x) => /^[1-9]\d*$/.test(x)) ? parcalar.map(Number) : null
}
const matrisSayisi = (metin: string): number | null => matrisDegerleri(metin)?.length ?? null

/** İşin `name:` değeri (job düzeyi). */
function isAdi(metin: string, isId: string): string {
  const s = metin.split('\n')
  const is = isAraligi(s, isId)
  return is ? (cocuklar(s, is.bas).find((k) => k.anahtar === 'name')?.deger ?? '') : ''
}

// ── DENETİM (INV-CI-SHARD-1) ─────────────────────────────────────────────────────────────────────────────────────────────────────

const adimIfSatirlari = (a: Adim): string[] => a.anahtarlar.filter((k) => k.anahtar === 'if').map((k) => `if: ${k.deger}`)

/** Her adımda yasak: `continue-on-error` ve komutun hatasını yutan `run` (blok gövdesi dahil). */
function kapiAtlatmaDenetle(a: Adim, onEk: string): string[] {
  const ihlal: string[] = []
  if (a.anahtarlar.some((k) => k.anahtar === 'continue-on-error')) ihlal.push(`${onEk} "${a.ad}" continue-on-error taşıyor: adım kırmızı olsa da iş yeşil kalır`)
  const yutan = a.anahtarlar
    .filter((k) => k.anahtar === 'run')
    .flatMap((k) => (/^[|>][-+]?$/.test(k.deger) ? yorumsuz(a.satirlar).filter((s) => HATA_YUTAN.test(s)).map((s) => s.trim()) : HATA_YUTAN.test(k.deger) ? [`run: ${k.deger}`] : []))
  if (yutan.length) ihlal.push(`${onEk} "${a.ad}" run komutu hatayı yutuyor (\`${yutan[0]}\`): komut kırmızı olsa da adım yeşil kalır`)
  return ihlal
}

/** `env:` / `with:` haritası TAM küme ve TAM değer. */
function haritaDenetle(harita: Map<string, string>, beklenen: Record<string, string>, onEk: string, yok: string, fazla: string): string[] {
  const ihlal: string[] = []
  for (const [ad, deger] of Object.entries(beklenen)) {
    const bulunan = harita.get(ad)
    if (bulunan === undefined) ihlal.push(`${onEk} ${ad} ${yok}`)
    else if (bulunan !== deger) ihlal.push(`${onEk} ${ad} değeri beklenen değil: bulunan \`${bulunan}\`, beklenen \`${deger}\``)
  }
  for (const ad of harita.keys()) if (!(ad in beklenen)) ihlal.push(`${onEk} ${fazla} ${ad}`)
  return ihlal
}

function shardIsiDenetle(metin: string): string[] {
  const s = metin.split('\n')
  const is = isAraligi(s, SHARD_ISI)
  if (!is) return [`\`jobs.${SHARD_ISI}\` işi ci.yml içinde yok: pull_request'te testler hiçbir yerde koşmaz (\`ci\` içindeki Test o olayda kapalıdır)`]
  const ihlal: string[] = []
  const anahtarlar = cocuklar(s, is.bas)
  const n = matrisSayisi(metin)
  for (const k of anahtarlar) {
    if (IS_ANAHTARLARI.includes(k.anahtar)) continue
    const neden = IS_ANAHTARI_NEDENI[k.anahtar]
    ihlal.push(`test-shard işinde beklenmeyen job düzeyi anahtar \`${k.anahtar}\`${neden ? `: ${neden}` : ''}; bilinçle listeye eklenir (${IS_ANAHTARLARI.join(', ')})`)
  }
  for (const gerekli of IS_ANAHTARLARI) {
    if (anahtarlar.some((k) => k.anahtar === gerekli)) continue
    ihlal.push(
      gerekli === 'if'
        ? 'test-shard işinde `if:` yok: iş her olayda (master push dahil) koşar, testler iki yerde koşar ve bekleme adımı o olaylarda kırmızı verir'
        : `test-shard işinde \`${gerekli}\` yok`,
    )
  }
  // koşul: TAM satır eşitliği
  const ifler = anahtarlar.filter((k) => k.anahtar === 'if')
  if (ifler.length > 0 && (ifler.length !== 1 || `if: ${ifler[0].deger}` !== SHARD_IF)) {
    ihlal.push(`test-shard işinin \`if:\` satırı beklenen TAM \`${SHARD_IF}\` değil (bulunan: ${ifler.map((k) => `\`if: ${k.deger}\``).join(' ; ')}): iş ya her olayda koşar ya da pull_request'te koşmaz, testler kapsam dışı kalır`)
  }
  // ad: `ci` bekleme adımı işleri bu adla arar
  const ad = anahtarlar.find((k) => k.anahtar === 'name')?.deger
  if (ad !== undefined) {
    const m = /^test-shard \(\$\{\{ matrix\.shard \}\}\/(\d+)\)$/.exec(ad)
    if (!m) {
      ihlal.push(`test-shard işinin adı beklenen \`test-shard (\${{ matrix.shard }}/N)\` biçiminde değil (bulunan: \`${ad}\`): bekleyici işleri bu adla arar, ad ayrışırsa her koşuda "eksik shard" ile kırmızı kalır`)
    } else if (n !== null && Number(m[1]) !== n) {
      ihlal.push(`iş adındaki /${m[1]} matrix sayısı ${n} ile aynı değil: bekleyici işleri \`/${n}\` adıyla arar, hiçbirini bulamaz ve \`ci\` hep kırmızı kalır`)
    }
  }
  // süre sınırı: bekleyici BEKLEME_SN sonra vazgeçer; daha uzun süren shard dakika yakar
  const sure = anahtarlar.find((k) => k.anahtar === 'timeout-minutes')?.deger
  const enFazla = BEKLE.BEKLEME_SN / 60
  if (sure !== undefined && !(/^\d+$/.test(sure) && Number(sure) >= 1 && Number(sure) <= enFazla)) {
    ihlal.push(`test-shard işinin timeout-minutes değeri 1..${enFazla} aralığında bir sayı değil (bulunan: \`${sure}\`): bekleyici ${BEKLE.BEKLEME_SN} sn sonra vazgeçer`)
  }
  // kabuk: açık bash pipefail açar; yoksa `| tee` kırmızıyı yutar
  const varsayilan = anahtarlar.find((k) => k.anahtar === 'defaults')
  if (varsayilan) {
    const sonraki = anahtarlar.find((k) => k.no > varsayilan.no)
    const govde = s
      .slice(varsayilan.no + 1, sonraki ? sonraki.no : is.bit)
      .filter(anlamli)
      .map((x) => degerTemizle(x))
    if (govde.join('|') !== 'run:|shell: bash') ihlal.push("test-shard işinin `defaults.run.shell: bash` bloğu bozuk: açık bash pipefail açar; yoksa `| tee` boru hattının çıkış kodu tee'den gelir ve kırmızı test yutulur")
  }
  // strateji: fail-fast false, matrix yalnız shard (include/exclude shard düşürür ya da ekler)
  const st = anahtarlar.find((k) => k.anahtar === 'strategy')
  if (st) {
    const sk = cocuklar(s, st.no)
    for (const k of sk) if (!['fail-fast', 'matrix'].includes(k.anahtar)) ihlal.push(`strategy beklenmeyen anahtar \`${k.anahtar}\` (izinli: fail-fast, matrix)`)
    const ff = sk.filter((k) => k.anahtar === 'fail-fast')
    if (ff.length !== 1 || ff[0].deger !== 'false') ihlal.push('strategy.fail-fast: false olmalı: biri kırılınca öteki shard iptal edilirse kırmızının nedeni görünmez')
    const mx = sk.find((k) => k.anahtar === 'matrix')
    if (!mx) {
      ihlal.push('strategy.matrix yok')
    } else {
      for (const k of cocuklar(s, mx.no)) if (k.anahtar !== 'shard') ihlal.push(`matrix beklenmeyen anahtar \`${k.anahtar}\`: include/exclude shard düşürür ya da ekler (yalnız \`shard\` listesi)`)
    }
    const degerler = matrisDegerleri(metin)
    if (!degerler) {
      ihlal.push('matrix.shard satır içi tam sayı listesi olarak okunamadı (`shard: [1, 2, 3, 4]` beklenir)')
    } else {
      if (degerler.some((v, i) => v !== i + 1)) ihlal.push(`matrix.shard listesi ardışık 1..N olmalı (bulunan: [${degerler.join(', ')}]): dağıtıcı 1..N numaralı parça ister, eksik numara hiç koşmaz`)
      if (degerler.length < 1 || degerler.length > SHARD.EN_FAZLA_SHARD) ihlal.push(`matrix sayısı 1..${SHARD.EN_FAZLA_SHARD} olmalı (bulunan: ${degerler.length})`)
    }
  }
  // bekleyicinin beklediği adlar = işin gerçek adları
  if (n !== null && ad !== undefined) {
    const gercek = (matrisDegerleri(metin) ?? []).map((v) => ad.replace('${{ matrix.shard }}', String(v)))
    const beklenen = BEKLE.beklenenAdlar(n)
    if (gercek.join('|') !== beklenen.join('|')) {
      ihlal.push(`test-shard iş adları [${gercek.join(', ')}] bekleyicinin beklediği [${beklenen.join(', ')}] ile birebir aynı değil: ci hep eksik/fazla shard der`)
    }
  }
  return ihlal
}

function shardAdimlariniDenetle(metin: string): string[] {
  const adimlar = isAdimlari(metin, SHARD_ISI)
  if (adimlar.length === 0) return ['test-shard işinin adımları ayrıştırılamadı (`steps:` yok ya da boş): hiçbir adım denetlenmedi']
  const n = matrisSayisi(metin)
  const ihlal: string[] = []
  for (const a of adimlar) {
    if (a.ad === '') ihlal.push(`test-shard işinde adsız adım (satır ${a.bas + 1}): adı yazılır`)
    // ALT-38e: `if:` yalnız seçim adımlarının atladığı adımlarda ve TAM beklenen satırla serbesttir (başka her `if:` shard'ı testsiz YEŞİL bitirebilir).
    const beklenenIf = shardAdimKosulu(a.ad)
    const bulunanIf = adimIfSatirlari(a)
    if (beklenenIf === null && bulunanIf.length) {
      ihlal.push(`shard adımı "${a.ad}" \`if:\` taşıyor (${bulunanIf.join(' ; ')}): adım atlanırsa shard hiçbir test koşmadan YEŞİL biter ve \`ci\` yeşil görünür`)
    } else if (beklenenIf !== null && (bulunanIf.length !== 1 || bulunanIf[0] !== beklenenIf)) {
      ihlal.push(`shard adımı "${a.ad}" \`if:\` satırı beklenen TAM \`${beklenenIf}\` değil (bulunan: ${bulunanIf.join(' ; ') || 'yok'}): seçim kapısı gevşer ya da adım gereksiz yere atlanır (shard testsiz YEŞİL biter)`)
    }
    ihlal.push(...kapiAtlatmaDenetle(a, 'shard adımı'))
  }
  // Checkout: tam geçmiş (INV-DOC-2 `git log` okur; dünya durumu tabanı HEAD^1 ister), merge-ref (ref verilmez)
  const checkout = adimlar.filter((a) => a.ad === 'Checkout')
  if (checkout.length !== 1) {
    ihlal.push(`test-shard işinde "Checkout" adımı TAM BİR tane olmalı (bulunan ${checkout.length})`)
  } else {
    const eylem = checkout[0].anahtarlar.filter((k) => k.anahtar === 'uses').map((k) => k.deger)
    if (eylem.length !== 1 || !eylem[0].startsWith('actions/checkout@')) ihlal.push(`shard Checkout adımı \`uses: actions/checkout@…\` değil (bulunan: ${eylem.join(' ; ') || 'yok'})`)
    ihlal.push(...haritaDenetle(checkout[0].girdiler, { 'fetch-depth': '0' }, 'shard Checkout adımında', 'girdisi yok', 'beklenmeyen girdi'))
  }
  // Dağıtım adımı: `test-shard.cjs` çağıran TAM BİR adım (ALT-38e: Test adımından ayrıldı; parçaya test düşmezse vitest koşmasın diye `kos` çıktısı verir)
  const dagitlar = adimlar.filter((a) => yorumsuz(a.satirlar).join('\n').includes('test-shard.cjs'))
  if (dagitlar.length !== 1) {
    ihlal.push(`\`test-shard.cjs\` çağıran adım TAM BİR tane olmalı (bulunan ${dagitlar.length}): dağıtım yapılmıyor ya da iki kez yapılıyor`)
    return ihlal
  }
  const dagit = dagitlar[0]
  if (!dagit.ad.startsWith(SHARD_DAGIT_ONEKI)) ihlal.push(`shard dağıtım adımının adı \`${SHARD_DAGIT_ONEKI}…\` ile başlamıyor (bulunan: \`${dagit.ad}\`)`)
  ihlal.push(...haritaDenetle(dagit.env, SHARD_DAGIT_ENV, 'shard dağıtım adımında', 'ortam değişkeni yok', 'beklenmeyen ortam değişkeni'))
  const dagitKomut = tekSatirRun(dagit)
  if (dagitKomut === null) ihlal.push('shard dağıtım adımının `run:` değeri TEK satırlık komut değil (blok ya da çoklu `run:`): dağıtım komutu denetlenemedi')
  // Test adımı: `pnpm test` koşturan TAM BİR adım (testlerin gerçekten koştuğu yer)
  const kosanlar = adimlar.filter((a) => a !== dagit && yorumsuz(a.satirlar).join('\n').includes('pnpm test'))
  if (kosanlar.length !== 1) {
    ihlal.push(`\`pnpm test\` koşturan adım TAM BİR tane olmalı (bulunan ${kosanlar.length}): testler hiç koşmuyor ya da iki kez koşuyor`)
    return ihlal
  }
  const test = kosanlar[0]
  if (!test.ad.startsWith(SHARD_TEST_ONEKI)) ihlal.push(`shard Test adımının adı \`${SHARD_TEST_ONEKI}…\` ile başlamıyor (bulunan: \`${test.ad}\`)`)
  ihlal.push(...haritaDenetle(test.env, SHARD_TEST_ENV, 'shard Test adımında', 'ortam değişkeni yok', 'beklenmeyen ortam değişkeni'))
  const kosKomut = tekSatirRun(test)
  if (kosKomut === null) ihlal.push('shard Test adımının `run:` değeri TEK satırlık komut değil (blok ya da çoklu `run:`): koşum komutu denetlenemedi')
  const dagitSatiri = dagitKomut ?? ''
  const kos = kosKomut ?? ''
  const toplam = /--toplam\s+(\S+)/.exec(dagitSatiri)?.[1]
  if (toplam !== undefined && n !== null && toplam !== String(n)) {
    ihlal.push(`shard dağıtım adımında \`--toplam ${toplam}\` matrix sayısı ${n} ile aynı değil: bölme ${toplam} parçaya yapılır, parçaların bir kısmı HİÇBİR işe girmez (ya da bazı işler boş kalır)`)
  }
  if (!/--shard\s+"\$SHARD"/.test(dagitSatiri)) {
    ihlal.push('shard dağıtım adımı `--shard "$SHARD"` kullanmıyor: matrix işleri AYNI parçayı koşar, öteki parçalar HİÇ koşmaz ama işler yeşil görünür')
  }
  const cikti = /--cikti\s+(\S+)/.exec(dagitSatiri)?.[1]
  const okunan = /^VENTHUB_TEST_SHARD_DOSYALARI=(\S+)\s/.exec(kos)?.[1]
  if (okunan === undefined) {
    ihlal.push('shard Test adımı `VENTHUB_TEST_SHARD_DOSYALARI=<liste>` vermiyor: vitest include sınırı yok, her shard TAM paketi koşar (n kat israf) ya da liste hiç okunmaz')
  } else if (cikti !== okunan) {
    ihlal.push(`shard Test adımında dağıtıcının yazdığı dosya (${cikti ?? 'yok'}) ile vitest'in okuduğu dosya (${okunan}) aynı değil: shard listesi hiç okunmaz`)
  }
  if (!/\bpnpm test -- --run\b/.test(kos)) ihlal.push('shard Test adımı `pnpm test -- --run` koşturmuyor')
  if (n !== null) {
    if (dagitKomut !== null && dagitKomut !== KOMUT_DAGIT(n)) ihlal.push(`shard dağıtım adımı run komutu beklenen TAM komut değil (bulunan \`${dagitKomut}\`, beklenen \`${KOMUT_DAGIT(n)}\`)`)
    if (kosKomut !== null && kosKomut !== KOMUT_KOS) ihlal.push(`shard Test adımı run komutu beklenen TAM komut değil (bulunan \`${kosKomut}\`, beklenen \`${KOMUT_KOS}\`)`)
  }
  return ihlal
}

function bekleAdiminiDenetle(metin: string): string[] {
  const adimlar = isAdimlari(metin, CI_ISI)
  if (adimlar.length === 0) return ['`ci` işinin adımları ayrıştırılamadı: bekleme adımı denetlenemedi']
  const bekle = adimlar.filter((a) => a.ad === BEKLE_ADI)
  if (bekle.length !== 1) return [`\`ci\` işinde "${BEKLE_ADI}" adımı TAM BİR tane olmalı (bulunan ${bekle.length}): kırmızı shard \`ci\`yi kırmızı yapmaz, zorunlu kontrol yeşil kalır`]
  const a = bekle[0]
  const ihlal: string[] = []
  const son = adimlar[adimlar.length - 1]
  if (son !== a) ihlal.push(`bekleme adımı \`ci\` işinin SON adımı değil (son adım: "${son.ad}"): Lint ve Build shard'larla ÜST ÜSTE koşar, bekleme erkene alınırsa süre kazancı kaybolur; sonradan eklenen adım sonucun önüne geçer`)
  const kosullar = adimIfSatirlari(a)
  if (kosullar.length === 0) ihlal.push(`bekleme adımı beklenen \`${SHARD_IF}\` koşulunu taşımıyor: push ve elle koşumda da koşar (orada shard işi yoktur: hep kırmızı)`)
  else if (kosullar.length !== 1 || kosullar[0] !== SHARD_IF) ihlal.push(`bekleme adımının \`if:\` satırı beklenen TAM \`${SHARD_IF}\` değil (bulunan: ${kosullar.map((k) => `\`${k}\``).join(' ; ')}): shard olayında atlanabilir ya da başka olayda koşar`)
  if (/steps\.ayna\.outputs/.test(yorumsuz(a.satirlar).join('\n'))) ihlal.push('bekleme adımı ayna koşulu taşıyor: ayna kararı shard sonucunu atlatabilir')
  ihlal.push(...kapiAtlatmaDenetle(a, 'bekleme adımı'))
  const run = a.anahtarlar.filter((k) => k.anahtar === 'run').map((k) => `run: ${k.deger}`)
  if (run.length !== 1 || run[0] !== BEKLE_RUN) ihlal.push(`bekleme adımının run satırı beklenen TAM \`${BEKLE_RUN}\` değil (bulunan: ${run.join(' ; ') || 'yok'})`)
  for (const k of a.anahtarlar) {
    if (!['name', 'if', 'env', 'run'].includes(k.anahtar)) ihlal.push(`bekleme adımı beklenmeyen anahtar \`${k.anahtar}\` taşıyor (izinli: name, if, env, run)`)
  }
  // ortam: SHARD_TOPLAM matrix sayısıyla aynı; ötekiler TAM değer
  const n = matrisSayisi(metin)
  const beklenenEnv: Record<string, string> = { ...BEKLE_ENV_SABIT }
  const toplam = a.env.get('SHARD_TOPLAM')
  if (toplam === undefined) {
    ihlal.push('bekleme adımında SHARD_TOPLAM ortam değişkeni yok: bekleyici kaç shard bekleyeceğini bilemez ve kırmızı kalır')
  } else {
    beklenenEnv.SHARD_TOPLAM = toplam
    if (n !== null) {
      const x = /^'(\d+)'$/.exec(toplam)?.[1]
      if (x !== String(n)) ihlal.push(`ci SHARD_TOPLAM ${x ?? toplam} matrix sayısı ${n} ile aynı değil: bekleyici ${x ?? toplam} shard bekler, ${n} iş koşar (hep kırmızı ya da bazı shard'lar hiç beklenmez)`)
    }
  }
  ihlal.push(...haritaDenetle(a.env, beklenenEnv, 'bekleme adımında', 'ortam değişkeni yok', 'beklenmeyen ortam değişkeni'))
  return ihlal
}

/** `ci` içindeki Test: ayna koşulu VE shard olayı DEĞİL (master push, elle koşum, `edited`'de TAM koşar; PR'da kapalı: o olayda shard'lar koşar). */
function ciTestKosuluDenetle(metin: string): string[] {
  const test = isAdimlari(metin, CI_ISI).filter((a) => a.ad === 'Test')
  if (test.length !== 1) return [`\`ci\` işinde "Test" adımı TAM BİR tane olmalı (bulunan ${test.length})`]
  const kosullar = adimIfSatirlari(test[0])
  if (kosullar.length !== 1 || kosullar[0] !== TEST_IF) {
    return [
      `ci Test adımının \`if:\` satırı beklenen TAM \`${TEST_IF}\` değil (bulunan: ${kosullar.map((k) => `\`${k}\``).join(' ; ') || 'yok'}): pull_request'te testler ya hem \`ci\`de hem shard'larda koşar (süre kazancı sıfır) ya da hiçbir yerde koşmaz (kapsam kaybı)`,
    ]
  }
  return []
}

/** Workflow izinleri: `actions: read` (bekleyici koşunun işlerini `actions/runs/{id}/attempts/{n}/jobs` ile okur). */
function izinleriDenetle(metin: string): string[] {
  const s = metin.split('\n')
  const bas = s.findIndex((x) => x.trimEnd() === 'permissions:')
  if (bas < 0) return ['workflow düzeyi `permissions:` bloğu yok: bekleyici işleri okuyamaz ve jeton varsayılan (yazma dahil) yetkilerle çalışır']
  const govde = cocuklar(s, bas).map((k) => `${k.anahtar}: ${k.deger}`)
  return govde.includes('actions: read') ? [] : ["permissions: actions: read yok: bekleyici koşunun işlerini API'den okuyamaz, `ci` her pull_request koşusunda kırmızı kalır"]
}

function denetle(metin: string): string[] {
  return [...shardIsiDenetle(metin), ...shardAdimlariniDenetle(metin), ...bekleAdiminiDenetle(metin), ...ciTestKosuluDenetle(metin), ...izinleriDenetle(metin)]
}

// ── BOZUCULAR (satırı içeriğiyle bulur; hedef yoksa metni DEĞİŞTİRMEZ: tablo testi "değişmedi"yi KIRMIZI sayar) ──────────────────────

const isAr = (c: string, isId: string): Aralik | null => isAraligi(c.split('\n'), isId)
/** Adım aralığı: `- name: <ad>` satırından sonraki adıma (ya da iş sonuna) kadar. `onEk`: ad yalnız bu önekle başlar. */
function adimAraligi(c: string, isId: string, ad: string, onEk = false): Aralik | null {
  const s = c.split('\n')
  const is = isAraligi(s, isId)
  if (!is) return null
  const bas = s.findIndex((x, i) => i > is.bas && i < is.bit && /^ {6}- name: /.test(x) && (onEk ? x.slice(14).startsWith(ad) : x.slice(14).trimEnd() === ad))
  if (bas < 0) return null
  let bit = is.bit
  for (let i = bas + 1; i < is.bit; i++) {
    if (/^ {6}- /.test(s[i])) {
      bit = i
      break
    }
  }
  return { bas, bit }
}
const bekleAr = (c: string): Aralik | null => adimAraligi(c, CI_ISI, BEKLE_ADI)
const shardTestAr = (c: string): Aralik | null => adimAraligi(c, SHARD_ISI, SHARD_TEST_ONEKI, true)
const shardDagitAr = (c: string): Aralik | null => adimAraligi(c, SHARD_ISI, SHARD_DAGIT_ONEKI, true)
const ciTestAr = (c: string): Aralik | null => adimAraligi(c, CI_ISI, 'Test')
const shardCheckoutAr = (c: string): Aralik | null => adimAraligi(c, SHARD_ISI, 'Checkout')

function satirBul(s: string[], a: Aralik, bul: string | RegExp): number {
  return s.findIndex((x, i) => i >= a.bas && i < a.bit && (typeof bul === 'string' ? x.trim() === bul : bul.test(x.trim())))
}
/** Aralıkta içeriği `bul` olan İLK satırı yeniden yazar (girinti korunur) ya da siler (`yeni=null`). */
function sd(c: string, a: Aralik | null, bul: string | RegExp, yeni: string | null): string {
  if (!a) return c
  const s = c.split('\n')
  const i = satirBul(s, a, bul)
  if (i < 0) return c
  if (yeni === null) s.splice(i, 1)
  else s[i] = `${s[i].slice(0, girinti(s[i]))}${yeni}`
  return s.join('\n')
}
/** Aralıkta içeriği `bul` olan ilk satırın ALTINA yeni satır ekler (girinti = bulunan satır + `ek`). */
function se(c: string, a: Aralik | null, bul: string | RegExp, yeni: string, ek = 0): string {
  if (!a) return c
  const s = c.split('\n')
  const i = satirBul(s, a, bul)
  if (i < 0) return c
  s.splice(i + 1, 0, `${' '.repeat(girinti(s[i]) + ek)}${yeni}`)
  return s.join('\n')
}
/** Aralıkta içeriği `bul` olan ilk satırın ALTINA HAZIR (girintili) satırlar ekler. */
function seTam(c: string, a: Aralik | null, bul: string | RegExp, satirlar: string[]): string {
  if (!a) return c
  const s = c.split('\n')
  const i = satirBul(s, a, bul)
  if (i < 0) return c
  s.splice(i + 1, 0, ...satirlar)
  return s.join('\n')
}
/** Adımın ilk satırının (`- name: ...`) altına, adım anahtarı girintisiyle (8) satır ekler. */
const adimaEkle = (c: string, a: Aralik | null, yeni: string): string => se(c, a, /^- name: /, yeni, 2)
/** Aralığı (adımı/işi) tümüyle siler. */
function aralikSil(c: string, a: Aralik | null): string {
  if (!a) return c
  const s = c.split('\n')
  s.splice(a.bas, a.bit - a.bas)
  return s.join('\n')
}
/** `adim` aralığını `hedef` adımının ÖNÜNE (`once`) ya da SONRASINA (`sonra`) taşır. */
function aralikTasi(c: string, adim: Aralik | null, hedef: Aralik | null, yer: 'once' | 'sonra'): string {
  if (!adim || !hedef || adim.bas === hedef.bas) return c
  const s = c.split('\n')
  const blok = s.slice(adim.bas, adim.bit)
  s.splice(adim.bas, blok.length)
  const hedefBas = hedef.bas > adim.bas ? hedef.bas - blok.length : hedef.bas
  const hedefSon = hedef.bit > adim.bas ? hedef.bit - blok.length : hedef.bit
  s.splice(yer === 'once' ? hedefBas : hedefSon, 0, ...blok)
  return s.join('\n')
}
/** İş başlığının altına job düzeyi anahtar ekler. */
const isaEkle = (c: string, isId: string, yeni: string): string => se(c, isAr(c, isId), `${isId}:`, yeni, 2)
/** Üst düzey `permissions:` bloğundan satır siler. */
function izinSil(c: string, satir: string): string {
  const s = c.split('\n')
  const bas = s.findIndex((x) => x.trimEnd() === 'permissions:')
  return bas < 0 ? c : sd(c, { bas, bit: bas + 1 + cocuklar(s, bas).length }, satir, null)
}
/** Üst düzey `permissions:` bloğunu (başlık ve çocukları) tümüyle siler. */
function izinBlokuSil(c: string): string {
  const s = c.split('\n')
  const bas = s.findIndex((x) => x.trimEnd() === 'permissions:')
  if (bas < 0) return c
  s.splice(bas, 1 + cocuklar(s, bas).length)
  return s.join('\n')
}

// ── SABOTAJ TABLOSU: her satır `denetle()`nin belirli bir denetimine bağlıdır (HANGİ denetim yakaladı sabit) ───────────────────────

interface Bozulma {
  ad: string
  boz: (ci: string) => string
  /** `denetle()` çıktısında GEÇMESİ gereken parçalar. */
  beklenen: readonly string[]
}

const CI_METNI = readFileSync(CI_YOLU, 'utf8').replace(/\r\n/g, '\n')
/** Tablodaki sayısal bozucular için gerçek shard sayısı (ci.yml matrix'i). */
const N0 = matrisSayisi(CI_METNI) ?? 4
const liste1N = (k: number): string => `[${Array.from({ length: k }, (_, i) => i + 1).join(', ')}]`
const bekleEnv = (c: string, ad: string, yeni: string | null): string => sd(c, bekleAr(c), new RegExp(`^${ad}:`), yeni === null ? null : `${ad}: ${yeni}`)
const matrisSatiri = /^shard: \[/

const BOZULMALAR: readonly Bozulma[] = [
  // ── shard sayısı DÖRT yerde aynı olmalı ────────────────────────────────────────────────────────────────────────────
  { ad: 'ci SHARD_TOPLAM bir eksiğe düşer (bekleyici daha az shard bekler: son shard HİÇ beklenmez, kırmızısı görünmez)', boz: (c) => bekleEnv(c, 'SHARD_TOPLAM', `'${N0 - 1}'`), beklenen: [`ci SHARD_TOPLAM ${N0 - 1} matrix sayısı ${N0} ile aynı değil`] },
  { ad: 'ci SHARD_TOPLAM bir fazlaya çıkar (bekleyici olmayan shard için bekler: ci hep kırmızı)', boz: (c) => bekleEnv(c, 'SHARD_TOPLAM', `'${N0 + 1}'`), beklenen: [`ci SHARD_TOPLAM ${N0 + 1} matrix sayısı ${N0} ile aynı değil`] },
  {
    ad: 'matrix bir fazla shard alır (matrix N+1; --toplam, SHARD_TOPLAM ve iş adı N kalır)',
    boz: (c) => sd(c, isAr(c, SHARD_ISI), matrisSatiri, `shard: ${liste1N(N0 + 1)}`),
    beklenen: [`\`--toplam ${N0}\` matrix sayısı ${N0 + 1} ile aynı değil`, `ci SHARD_TOPLAM ${N0} matrix sayısı ${N0 + 1} ile aynı değil`, `iş adındaki /${N0} matrix sayısı ${N0 + 1} ile aynı değil`],
  },
  { ad: 'matrix bir eksik shard alır (son parça hiçbir işe girmez)', boz: (c) => sd(c, isAr(c, SHARD_ISI), matrisSatiri, `shard: ${liste1N(N0 - 1)}`), beklenen: [`\`--toplam ${N0}\` matrix sayısı ${N0 - 1} ile aynı değil`] },
  { ad: 'matrix listesi ardışık değil (3 numaralı parça hiç koşmaz)', boz: (c) => sd(c, isAr(c, SHARD_ISI), matrisSatiri, 'shard: [1, 2, 4, 5]'), beklenen: ['matrix.shard listesi ardışık 1..N olmalı'] },
  { ad: 'matrix listesi okunamaz (satır içi liste değil)', boz: (c) => sd(c, isAr(c, SHARD_ISI), matrisSatiri, 'shard: ${{ fromJSON(vars.SHARDLAR) }}'), beklenen: ['matrix.shard satır içi tam sayı listesi olarak okunamadı'] },
  { ad: 'matrix `exclude` ekler (bir shard işi hiç oluşmaz)', boz: (c) => se(c, isAr(c, SHARD_ISI), matrisSatiri, 'exclude: [{ shard: 4 }]'), beklenen: ['matrix beklenmeyen anahtar `exclude`'] },
  { ad: 'iş adındaki /N farklı (bekleyici işi bulamaz, ci hep kırmızı)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^name: test-shard /, `name: test-shard (\${{ matrix.shard }}/${N0 + 1})`), beklenen: [`iş adındaki /${N0 + 1} matrix sayısı ${N0} ile aynı değil`] },
  { ad: 'iş adı biçimi değişir (`test-shard (i/N)` yerine `shard i`)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^name: test-shard /, 'name: shard ${{ matrix.shard }}'), beklenen: ['test-shard işinin adı beklenen `test-shard (${{ matrix.shard }}/N)` biçiminde değil'] },
  { ad: 'iş adından matrix numarası düşer (tüm işler AYNI adı taşır: bekleyici tekrar der)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^name: test-shard /, 'name: test-shard'), beklenen: ['test-shard işinin adı beklenen'] },
  { ad: 'dağıtım komutu `--toplam` matrix sayısından farklı (parçaların bir kısmı hiçbir işe girmez)', boz: (c) => sd(c, shardDagitAr(c), RUN_DAGIT(N0), RUN_DAGIT(N0 - 1)), beklenen: [`\`--toplam ${N0 - 1}\` matrix sayısı ${N0} ile aynı değil`] },
  { ad: 'dağıtım komutunda `--shard "$SHARD"` yerine sabit 1 (tüm işler AYNI parçayı koşar: öteki parçalar hiç koşmaz, işler yeşil)', boz: (c) => sd(c, shardDagitAr(c), RUN_DAGIT(N0), RUN_DAGIT(N0).replace('--shard "$SHARD"', '--shard 1')), beklenen: ['`--shard "$SHARD"` kullanmıyor'] },
  { ad: 'SHARD ortamı matrix numarası yerine sabit 1 olur (dağıtım komutu aynen durur, parça hep 1)', boz: (c) => sd(c, shardDagitAr(c), 'SHARD: ${{ matrix.shard }}', 'SHARD: 1'), beklenen: ['shard dağıtım adımında SHARD değeri beklenen değil'] },
  { ad: 'SHARD ortamı silinir (dağıtıcı geçersiz argümanla kırmızı kalır)', boz: (c) => sd(c, shardDagitAr(c), 'SHARD: ${{ matrix.shard }}', null), beklenen: ['shard dağıtım adımında SHARD ortam değişkeni yok'] },

  // ── ci.yml'de testin KAÇ yerde koştuğu: PR'da shard'lar, başka olaylarda ci ─────────────────────────────────────────────────────
  { ad: "ci Test'in `if`i hiç kapanmaz (PR'da testler HEM ci içinde HEM shard'larda koşar: çift koşu)", boz: (c) => sd(c, ciTestAr(c), /^if: /, "if: steps.ayna.outputs.atla != 'true'"), beklenen: ['ci Test adımının `if:` satırı beklenen TAM'] },
  { ad: "ci Test'in `if`i PR'da `edited` dahil kapanır (edited koşusunda testler HİÇBİR yerde koşmaz)", boz: (c) => sd(c, ciTestAr(c), /^if: /, "if: steps.ayna.outputs.atla != 'true' && github.event_name != 'pull_request'"), beklenen: ['ci Test adımının `if:` satırı beklenen TAM'] },
  { ad: "ci Test'in `if`i push'ta da kapanır (master'da testler hiç koşmaz)", boz: (c) => sd(c, ciTestAr(c), /^if: /, "if: steps.ayna.outputs.atla != 'true' && github.event_name == 'pull_request'"), beklenen: ['ci Test adımının `if:` satırı beklenen TAM'] },
  { ad: "ci Test'in `if`i silinir (her olayda koşar: PR'da çift koşu)", boz: (c) => sd(c, ciTestAr(c), /^if: /, null), beklenen: ['ci Test adımının `if:` satırı beklenen TAM', 'bulunan: yok'] },
  { ad: 'test-shard `if`i kalkar (iş her olayda, master push dahil koşar)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^if: /, null), beklenen: ['test-shard işinde `if:` yok'] },
  { ad: "test-shard `if`i `edited`i de kapsar (edited koşusunda iş koşar, ci Test'i de koşar: çift koşu)", boz: (c) => sd(c, isAr(c, SHARD_ISI), /^if: /, "if: github.event_name == 'pull_request'"), beklenen: ['test-shard işinin `if:` satırı beklenen TAM'] },
  { ad: 'test-shard `if`i `always()` olur (her koşulda koşar)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^if: /, 'if: always()'), beklenen: ['test-shard işinin `if:` satırı beklenen TAM'] },

  // ── test-shard işi atlanamaz ve bekletilemez ───────────────────────────────────────────────────────────────────────────────────────
  { ad: 'test-shard işine `continue-on-error: true` (shard kırmızı olsa da iş yeşil)', boz: (c) => isaEkle(c, SHARD_ISI, 'continue-on-error: true'), beklenen: ['beklenmeyen job düzeyi anahtar `continue-on-error`'] },
  { ad: 'test-shard işine `needs:` (başka işe bağlı)', boz: (c) => isaEkle(c, SHARD_ISI, 'needs: [ci]'), beklenen: ['beklenmeyen job düzeyi anahtar `needs`'] },
  { ad: 'test-shard işine `environment:` (onay bekletir)', boz: (c) => isaEkle(c, SHARD_ISI, 'environment: production'), beklenen: ['beklenmeyen job düzeyi anahtar `environment`'] },
  { ad: 'test-shard işine job düzeyi `permissions: write-all`', boz: (c) => isaEkle(c, SHARD_ISI, 'permissions: write-all'), beklenen: ['beklenmeyen job düzeyi anahtar `permissions`'] },
  { ad: 'test-shard `strategy.fail-fast: true` olur', boz: (c) => sd(c, isAr(c, SHARD_ISI), 'fail-fast: false', 'fail-fast: true'), beklenen: ['strategy.fail-fast: false olmalı'] },
  { ad: 'test-shard `strategy.fail-fast` silinir (varsayılan true)', boz: (c) => sd(c, isAr(c, SHARD_ISI), 'fail-fast: false', null), beklenen: ['strategy.fail-fast: false olmalı'] },
  { ad: 'test-shard `timeout-minutes` silinir (takılan shard 360 dk yakar)', boz: (c) => sd(c, isAr(c, SHARD_ISI), /^timeout-minutes:/, null), beklenen: ['test-shard işinde `timeout-minutes` yok'] },
  { ad: "test-shard `timeout-minutes` bekleyicinin sabrından uzun (60)", boz: (c) => sd(c, isAr(c, SHARD_ISI), /^timeout-minutes:/, 'timeout-minutes: 60'), beklenen: ['timeout-minutes değeri'] },
  { ad: "test-shard işi tümüyle silinir (PR'da testler hiçbir yerde koşmaz)", boz: (c) => aralikSil(c, isAr(c, SHARD_ISI)), beklenen: ['`jobs.test-shard` işi ci.yml içinde yok'] },
  { ad: 'test-shard `defaults.run.shell` bash yerine sh olur (pipefail yok: `| tee` kırmızı testi yutar)', boz: (c) => sd(c, isAr(c, SHARD_ISI), 'shell: bash', 'shell: sh'), beklenen: ['test-shard işinin `defaults.run.shell: bash` bloğu bozuk'] },
  {
    ad: 'test-shard `defaults` bloğu tümüyle silinir',
    boz: (c) => {
      const a = isAr(c, SHARD_ISI)
      return sd(sd(sd(c, a, 'shell: bash', null), a, 'run:', null), a, 'defaults:', null)
    },
    beklenen: ['test-shard işinde `defaults` yok'],
  },

  // ── shard Test adımı: atlanamaz, kırmızıyı yutamaz, doğru ortam ve komut ───────────────────────────────────────────────────────────
  { ad: 'shard Test adımına `continue-on-error: true`', boz: (c) => adimaEkle(c, shardTestAr(c), 'continue-on-error: true'), beklenen: ['continue-on-error taşıyor'] },
  { ad: 'shard Test adımına ikinci `if: false` (adım atlanır, shard hiç test koşmadan yeşil)', boz: (c) => adimaEkle(c, shardTestAr(c), 'if: false'), beklenen: ['`if:` satırı beklenen TAM'] },
  { ad: 'shard Test adımının koşulu `kos` kapısını kaybeder (boş parçada da vitest koşar: boş liste FIRLATIR, parça kırmızı)', boz: (c) => sd(c, shardTestAr(c), /^if: /, `if: ${SECIM_KURULUM}`), beklenen: ['`if:` satırı beklenen TAM'] },
  { ad: 'shard Test adımının koşulu başka bir çıktıya bakar (seçim kapısı gevşer)', boz: (c) => sd(c, shardTestAr(c), /^if: /, "if: steps.dagit.outputs.kos != 'false'"), beklenen: ['`if:` satırı beklenen TAM'] },
  { ad: 'shard Test adımının koşum komutuna `|| true`', boz: (c) => sd(c, shardTestAr(c), RUN_KOS, `${RUN_KOS} || true`), beklenen: ['run komutu hatayı yutuyor'] },
  { ad: 'shard Test adımının koşum komutu `; true` ile biter', boz: (c) => sd(c, shardTestAr(c), RUN_KOS, `${RUN_KOS}; true`), beklenen: ['run komutu hatayı yutuyor'] },
  { ad: "shard Test adımında `dislan` kipi kalkar (dünya durumu testleri PR'ı bloklar)", boz: (c) => sd(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', null), beklenen: ['shard Test adımında VENTHUB_DUNYA_DURUMU ortam değişkeni yok'] },
  { ad: 'shard Test adımında kip boş (tam paket: dünya durumu testleri de koşar)', boz: (c) => sd(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', "VENTHUB_DUNYA_DURUMU: ''"), beklenen: ['VENTHUB_DUNYA_DURUMU değeri beklenen değil'] },
  { ad: 'shard Test adımında kip `yalniz` (yalnız dünya durumu testleri: vitest.config.ts shard listesiyle birlikte FIRLATIR)', boz: (c) => sd(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', 'VENTHUB_DUNYA_DURUMU: yalniz'), beklenen: ['VENTHUB_DUNYA_DURUMU değeri beklenen değil'] },
  { ad: 'shard Test adımına fazladan ortam değişkeni', boz: (c) => se(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', 'CI_TEST_ATLA: 1'), beklenen: ['shard Test adımında beklenmeyen ortam değişkeni CI_TEST_ATLA'] },
  // CANLI DERS (#1741 koşu 2): Test adımının ortamındaki HER değişken testlerin alt süreçlerine miras kalır; `SHARD` ve `SECIM_*` bu yüzden yalnız dağıtım adımındadır.
  { ad: "shard Test adımının ortamına `SHARD` girer (shard değişkeni testlerin alt süreçlerine sızar)", boz: (c) => se(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', 'SHARD: ${{ matrix.shard }}'), beklenen: ['shard Test adımında beklenmeyen ortam değişkeni SHARD'] },
  { ad: "shard Test adımının ortamına `SECIM_TAM` girer (seçici çıktısı testlerin alt süreçlerine sızar)", boz: (c) => se(c, shardTestAr(c), 'VENTHUB_DUNYA_DURUMU: dislan', 'SECIM_TAM: ${{ steps.secv.outputs.tam }}'), beklenen: ['shard Test adımında beklenmeyen ortam değişkeni SECIM_TAM'] },
  { ad: 'shard dağıtım adımına fazladan ortam değişkeni', boz: (c) => se(c, shardDagitAr(c), 'SHARD: ${{ matrix.shard }}', 'CI_TEST_ATLA: 1'), beklenen: ['shard dağıtım adımında beklenmeyen ortam değişkeni CI_TEST_ATLA'] },
  { ad: 'koşum komutundan `VENTHUB_TEST_SHARD_DOSYALARI` düşer (her shard TAM paketi koşar)', boz: (c) => sd(c, shardTestAr(c), RUN_KOS, RUN_KOS.replace('VENTHUB_TEST_SHARD_DOSYALARI="$RUNNER_TEMP/shard.json" ', '')), beklenen: ['`VENTHUB_TEST_SHARD_DOSYALARI=<liste>` vermiyor'] },
  { ad: "koşum komutu başka dosyayı okur (dağıtıcının yazdığı liste hiç okunmaz)", boz: (c) => sd(c, shardTestAr(c), RUN_KOS, RUN_KOS.replace('$RUNNER_TEMP/shard.json', '$RUNNER_TEMP/baska.json')), beklenen: ['aynı değil: shard listesi hiç okunmaz'] },
  { ad: 'koşum komutu `pnpm test -- --run` yerine `pnpm lint` olur (test hiç koşmaz)', boz: (c) => sd(c, shardTestAr(c), RUN_KOS, RUN_KOS.replace('pnpm test -- --run --reporter=dot', 'pnpm lint')), beklenen: ['`pnpm test` koşturan adım TAM BİR tane olmalı (bulunan 0)'] },
  { ad: 'dağıtım komutu silinir (shard listesi yazılmaz)', boz: (c) => sd(c, shardDagitAr(c), RUN_DAGIT(N0), null), beklenen: ['`test-shard.cjs` çağıran adım TAM BİR tane olmalı (bulunan 0)'] },
  { ad: 'shard dağıtım adımı tümüyle silinir', boz: (c) => aralikSil(c, shardDagitAr(c)), beklenen: ['`test-shard.cjs` çağıran adım TAM BİR tane olmalı (bulunan 0)'] },
  { ad: 'shard Test adımı tümüyle silinir (testler hiç koşmaz, işler yeşil)', boz: (c) => aralikSil(c, shardTestAr(c)), beklenen: ['`pnpm test` koşturan adım TAM BİR tane olmalı (bulunan 0)'] },
  { ad: 'shard işine ikinci dağıtım adımı eklenir (iki dağıtım: ikincisi birincinin parçasını ezer)', boz: (c) => seTam(c, shardDagitAr(c), RUN_DAGIT(N0), ['      - name: Sahte dağıtım', '        run: node scripts/ci/test-shard.cjs --shard 1 --toplam 4 --cikti x.json']), beklenen: ['`test-shard.cjs` çağıran adım TAM BİR tane olmalı (bulunan 2)'] },
  { ad: 'shard işine ikinci test adımı eklenir (iki kez koşar)', boz: (c) => seTam(c, shardTestAr(c), RUN_KOS, ['      - name: Test (shard sahte)', '        run: pnpm test -- --run']), beklenen: ['`pnpm test` koşturan adım TAM BİR tane olmalı (bulunan 2)'] },
  { ad: 'shard işine adsız adım eklenir (önceki adımın bloğuna yutulmaz)', boz: (c) => seTam(c, shardCheckoutAr(c), 'fetch-depth: 0', ['      - run: echo x']), beklenen: ['test-shard işinde adsız adım'] },
  { ad: 'shard Checkout `fetch-depth: 0` düşer (sığ klon: HEAD^1 ve git log yok)', boz: (c) => sd(c, shardCheckoutAr(c), 'fetch-depth: 0', null), beklenen: ['shard Checkout adımında fetch-depth girdisi yok'] },
  { ad: 'shard Checkout `ref` PR başına çevrilir (merge-ref DEĞİL: `ci` ile farklı ağaç test edilir)', boz: (c) => se(c, shardCheckoutAr(c), 'fetch-depth: 0', 'ref: ${{ github.event.pull_request.head.sha }}'), beklenen: ['shard Checkout adımında beklenmeyen girdi ref'] },

  // ── ci bekleme adımı: kırmızı shard = kırmızı `ci` ──────────────────────────────────────────────────────────────────────────────────
  { ad: 'bekleme adımı silinir (shard kırmızısı `ci`yi kırmızı yapmaz)', boz: (c) => aralikSil(c, bekleAr(c)), beklenen: [`\`ci\` işinde "${BEKLE_ADI}" adımı TAM BİR tane olmalı (bulunan 0)`] },
  { ad: 'bekleme adımından `if:` kalkar (push ve elle koşumda da koşar)', boz: (c) => sd(c, bekleAr(c), /^if: /, null), beklenen: [`bekleme adımı beklenen \`${SHARD_IF}\` koşulunu taşımıyor`] },
  { ad: 'bekleme adımı koşulu `edited`i de kapsar (edited koşusunda shard yok: adım hep kırmızı)', boz: (c) => sd(c, bekleAr(c), /^if: /, "if: github.event_name == 'pull_request'"), beklenen: ['bekleme adımının `if:` satırı beklenen TAM'] },
  { ad: 'bekleme adımına ayna koşulu girer (ayna kararı shard sonucunu atlatabilir)', boz: (c) => sd(c, bekleAr(c), /^if: /, `${SHARD_IF} && steps.ayna.outputs.atla != 'true'`), beklenen: ['bekleme adımı ayna koşulu taşıyor'] },
  { ad: 'bekleme adımına `continue-on-error: true`', boz: (c) => adimaEkle(c, bekleAr(c), 'continue-on-error: true'), beklenen: [`bekleme adımı "${BEKLE_ADI}" continue-on-error taşıyor`] },
  { ad: 'bekleme `run` satırına `|| true` (bekleyicinin kırmızısı yutulur)', boz: (c) => sd(c, bekleAr(c), BEKLE_RUN, `${BEKLE_RUN} || true`), beklenen: [`bekleme adımı "${BEKLE_ADI}" run komutu hatayı yutuyor`] },
  { ad: 'bekleme `run` satırı başka betiği koşar', boz: (c) => sd(c, bekleAr(c), BEKLE_RUN, 'run: node scripts/ci/test-shard-bekle-eski.cjs'), beklenen: ['bekleme adımının run satırı beklenen TAM'] },
  { ad: 'bekleme adımından `KOSU_DENEME` düşer (yeniden koşumda eski deneme yeşili sayılır ya da bekleyici kırılır)', boz: (c) => bekleEnv(c, 'KOSU_DENEME', null), beklenen: ['bekleme adımında KOSU_DENEME ortam değişkeni yok'] },
  { ad: 'bekleme `KOSU_DENEME` sabit 1 olur (yeniden koşumda İLK denemenin yeşili okunur)', boz: (c) => bekleEnv(c, 'KOSU_DENEME', '1'), beklenen: ['bekleme adımında KOSU_DENEME değeri beklenen değil'] },
  { ad: 'bekleme `KOSU_ID` run_number olur (başka koşunun shard işleri okunur)', boz: (c) => bekleEnv(c, 'KOSU_ID', '${{ github.run_number }}'), beklenen: ['bekleme adımında KOSU_ID değeri beklenen değil'] },
  { ad: 'bekleme adımından `KOSU_ID` düşer', boz: (c) => bekleEnv(c, 'KOSU_ID', null), beklenen: ['bekleme adımında KOSU_ID ortam değişkeni yok'] },
  { ad: 'bekleme `DEPO` başka depoya bakar', boz: (c) => bekleEnv(c, 'DEPO', 'baska/depo'), beklenen: ['bekleme adımında DEPO değeri beklenen değil'] },
  { ad: 'bekleme `GH_TOKEN` boşaltılır (API çağrısı yetkisiz: bekleyici okuyamaz)', boz: (c) => bekleEnv(c, 'GH_TOKEN', "''"), beklenen: ['bekleme adımında GH_TOKEN değeri beklenen değil'] },
  { ad: 'bekleme adımından `SHARD_TOPLAM` düşer', boz: (c) => bekleEnv(c, 'SHARD_TOPLAM', null), beklenen: ['bekleme adımında SHARD_TOPLAM ortam değişkeni yok'] },
  { ad: 'bekleme adımına `BEKLEME_SN: 1` eklenir (bekleyici bir saniye sonra zaman aşımıyla vazgeçer)', boz: (c) => se(c, bekleAr(c), 'DEPO: ${{ github.repository }}', 'BEKLEME_SN: 1'), beklenen: ['bekleme adımında beklenmeyen ortam değişkeni BEKLEME_SN'] },
  { ad: 'bekleme adımına beklenmeyen anahtar (timeout-minutes)', boz: (c) => adimaEkle(c, bekleAr(c), 'timeout-minutes: 1'), beklenen: ['bekleme adımı beklenmeyen anahtar `timeout-minutes`'] },
  { ad: "bekleme adımı Build'den ÖNCEYE taşınır (Build artık son adım: Lint/Build shard'larla üst üste binmez)", boz: (c) => aralikTasi(c, bekleAr(c), adimAraligi(c, CI_ISI, 'Build (blocking)'), 'once'), beklenen: ['bekleme adımı `ci` işinin SON adımı değil (son adım: "Build (blocking)")'] },
  { ad: 'bekleme adımından SONRA yeni adım eklenir (bekleme artık son değil)', boz: (c) => seTam(c, bekleAr(c), BEKLE_RUN, ['      - name: Sonradan eklenen adım', '        run: echo x']), beklenen: ['bekleme adımı `ci` işinin SON adımı değil (son adım: "Sonradan eklenen adım")'] },
  { ad: 'bekleme adımı İKİ kez bulunur (biri koşulsuz sahte)', boz: (c) => seTam(c, bekleAr(c), BEKLE_RUN, [`      - name: ${BEKLE_ADI}`, '        run: echo sahte']), beklenen: [`"${BEKLE_ADI}" adımı TAM BİR tane olmalı (bulunan 2)`] },

  // ── izinler ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { ad: '`actions: read` düşer (bekleyici koşunun işlerini okuyamaz: ci hep kırmızı)', boz: (c) => izinSil(c, 'actions: read'), beklenen: ['permissions: actions: read yok'] },
  { ad: '`permissions:` bloğu hiç yok', boz: (c) => izinBlokuSil(c), beklenen: ['workflow düzeyi `permissions:` bloğu yok'] },
]

describe("INV-CI-SHARD-1 — test-shard işi ve ci bekleme adımı ci.yml'ye doğru bağlı", () => {
  const ci = CI_METNI

  it('bugünkü ci.yml bağlantı kurallarına uyuyor', () => {
    expect(denetle(ci)).toEqual([])
  })

  it('kanarya: ayrıştırıcı boş ya da bozuk metinle yeşil vermez; gerçek dosyada iş, adımlar ve matrix okunur', () => {
    expect(denetle('').join('|')).toContain('`jobs.test-shard` işi ci.yml içinde yok')
    expect(denetle('jobs:\n  baska:\n    runs-on: x\n').join('|')).toContain('`jobs.test-shard` işi')
    expect(denetle(ci.replace(/\n {4}steps:\n/g, '\n    adimlar:\n')).join('|')).toContain('ayrıştırılamadı')
    expect(isAdimlari(ci, SHARD_ISI).length).toBeGreaterThanOrEqual(5)
    expect(isAdimlari(ci, CI_ISI).length).toBeGreaterThanOrEqual(20)
    expect(matrisDegerleri(ci)).toEqual(Array.from({ length: N0 }, (_, i) => i + 1))
    expect(N0).toBeGreaterThanOrEqual(2)
  })

  it('shard sayısı dört yerde AYNI: matrix, `--toplam`, `ci` SHARD_TOPLAM ve iş adındaki /N; bekleyicinin beklediği adlar işin gerçek adlarıyla birebir', () => {
    const ad = isAdi(ci, SHARD_ISI)
    const adN = Number(/\/(\d+)\)$/.exec(ad)?.[1])
    const shardDagit = isAdimlari(ci, SHARD_ISI).find((a) => a.ad.startsWith(SHARD_DAGIT_ONEKI))
    const dagitN = Number(/--toplam\s+(\d+)/.exec((shardDagit ? tekSatirRun(shardDagit) : null) ?? '')?.[1])
    const bekleN = Number(/^'(\d+)'$/.exec(isAdimlari(ci, CI_ISI).find((a) => a.ad === BEKLE_ADI)?.env.get('SHARD_TOPLAM') ?? '')?.[1])
    expect([adN, dagitN, bekleN]).toEqual([N0, N0, N0])
    const gercek = (matrisDegerleri(ci) ?? []).map((v) => ad.replace('${{ matrix.shard }}', String(v)))
    expect(gercek).toEqual(BEKLE.beklenenAdlar(N0))
  })

  it('olay bölüşümü: test-shard işi, bekleme adımı ve ci Test dışlaması AYNI ifadeyi taşır (her olayda testler TAM BİR yerde koşar)', () => {
    const s = ci.split('\n')
    const is = isAraligi(s, SHARD_ISI)
    const isIf = `if: ${cocuklar(s, is?.bas ?? 0).find((k) => k.anahtar === 'if')?.deger}`
    const bekle = isAdimlari(ci, CI_ISI).find((a) => a.ad === BEKLE_ADI)
    const test = isAdimlari(ci, CI_ISI).find((a) => a.ad === 'Test')
    expect(isIf).toBe(SHARD_IF)
    expect(bekle ? adimIfSatirlari(bekle) : null).toEqual([isIf])
    expect(test ? adimIfSatirlari(test) : null).toEqual([`if: steps.ayna.outputs.atla != 'true' && !(${isIf.slice('if: '.length)})`])
    // dört yerde aynı ifade (iş, bekleme adımı, Test dışlaması, ALT-38e hızlı yol adımı: shard olayında ve sınıf `belge` iken): biri değişirse test kırmızı (yorum satırları sayılmaz: yorum düzeltmesi bu testi kırmızı yapmaz)
    expect(yorumsuz(s).join('\n').split(SHARD_OLAYI).length - 1).toBe(4)
  })

  it('bekleme adımı `ci` işinin SON adımı; `ci` job düzeyinde yalnız bilinen anahtarlar; test-shard işi `needs` taşımaz', () => {
    const adimlar = isAdimlari(ci, CI_ISI)
    expect(adimlar[adimlar.length - 1]?.ad).toBe(BEKLE_ADI)
    const s = ci.split('\n')
    const ciAr = isAraligi(s, CI_ISI)
    expect(
      cocuklar(s, ciAr?.bas ?? 0)
        .map((k) => k.anahtar)
        .sort(),
    ).toEqual(['defaults', 'runs-on', 'steps', 'timeout-minutes'])
    const shardAr = isAraligi(s, SHARD_ISI)
    expect(cocuklar(s, shardAr?.bas ?? 0).some((k) => k.anahtar === 'needs')).toBe(false)
  })

  it("bekleyici ↔ ci.yml: YAML'ın verdiği ortamla bekleyici GEÇERLİ ortam görür (sahte API, tüm shard success → 0); biri kırmızıysa ya da ortam eksikse 1", async () => {
    const bekle = isAdimlari(ci, CI_ISI).find((a) => a.ad === BEKLE_ADI)
    expect(bekle, 'bekleme adımı yok').toBeDefined()
    const ornek = (d: string): string =>
      d
        .replace('${{ github.token }}', 'ornek-jeton')
        .replace('${{ github.repository }}', 'sahip/depo')
        .replace('${{ github.run_id }}', '123456789')
        .replace('${{ github.run_attempt }}', '2')
        .replace(/^'(.*)'$/, '$1')
    const env: Record<string, string> = {}
    for (const [k, v] of bekle?.env ?? new Map<string, string>()) env[k] = ornek(v)
    const isler = (sonuclar: string[]): IsKaydi[] => [
      { name: 'ci', status: 'in_progress', conclusion: null },
      ...BEKLE.beklenenAdlar(N0).map((name, i) => ({ name, status: 'completed', conclusion: sonuclar[i] ?? 'success' })),
    ]
    const calistir = async (e: Record<string, string>, sonuclar: string[] = []): Promise<{ kod: number; cikti: string }> => {
      const satirlar: string[] = []
      const kod = await BEKLE.main(e, { api: { isler: async () => isler(sonuclar) }, uyku: async () => undefined, simdi: () => 0, yaz: (m) => satirlar.push(m) })
      return { kod, cikti: satirlar.join('\n') }
    }
    expect((await calistir(env)).kod).toBe(0)
    const kirmizi = await calistir(env, ['success', 'failure'])
    expect(kirmizi.kod).toBe(1)
    expect(kirmizi.cikti).toContain(`test-shard (2/${N0})`)
    const denemesiz = { ...env }
    delete denemesiz.KOSU_DENEME
    const eksik = await calistir(denemesiz)
    expect(eksik.kod).toBe(1)
    expect(eksik.cikti).toContain('KOSU_DENEME')
  })

  describe('sabotaj tablosu: bozulma TÜRLERİ (yakalayan denetim başlıkta sabit)', () => {
    it.each(BOZULMALAR)('$ad', ({ boz, beklenen }) => {
      const bozuk = boz(ci)
      expect(bozuk === ci, "fikstür: bozucu hiçbir şeyi değiştirmedi (hedef iş/adım/anahtar ci.yml'de yok)").toBe(false)
      const ihlal = denetle(bozuk).join('|')
      expect(ihlal.length, 'denetim bozulmayı HİÇ görmedi').toBeGreaterThan(0)
      for (const parca of beklenen) expect(ihlal).toContain(parca)
    })

    it('tablo kendi kendini sınar: bozulmamış ci.yml temiz, adlar benzersiz, en az 40 bozulma, her bozucu İKİ KEZ uygulanınca da kırmızı (idempotent)', () => {
      expect(denetle(ci)).toEqual([])
      expect(new Set(BOZULMALAR.map((b) => b.ad)).size).toBe(BOZULMALAR.length)
      expect(BOZULMALAR.length).toBeGreaterThanOrEqual(40)
      for (const b of BOZULMALAR) expect(denetle(b.boz(b.boz(ci))).length, b.ad).toBeGreaterThan(0)
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// INV-CI-SHARD-2 · KAPSAM KANITI: gerçek `vitest list` + gerçek dağıtıcı + gerçek vitest include bağı.
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

const karsilastir = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)
const sirali = (a: readonly string[]): string[] => [...a].sort(karsilastir)

/** Alt sürece verilen ortam: üst süreçten sızan VITEST* ve shard listesi temizlenir, kip ve taban listesi AÇIKÇA verilir (sonuç git geçmişinden bağımsız). */
function ortamKur(kip: '' | 'dislan', ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const k of Object.keys(env)) if (k.startsWith('VITEST') || k === SHARD.ORTAM_ADI) delete env[k]
  return { ...env, VENTHUB_DUNYA_DURUMU: kip, VENTHUB_DUNYA_TABAN_LISTESI: LISTE_MUTLAK, ...ek }
}

/** Gerçek `vitest list --filesOnly --json` (alt süreç); dosyalar `root`a göreli POSIX yol, tekil ve sıralı. */
async function vitestDosyalari(ortam: NodeJS.ProcessEnv, ekArg: string[] = [], root: string = KOK): Promise<string[]> {
  const { stdout } = await execFileAsync(process.execPath, [path.join(KOK, 'node_modules', 'vitest', 'vitest.mjs'), 'list', '--filesOnly', '--json', ...ekArg], {
    cwd: root,
    env: ortam,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
    windowsHide: true,
  })
  const liste = JSON.parse(stdout) as Array<{ file?: string }>
  return sirali([...new Set(liste.map((x) => SHARD.yoluNormallestir(String(x.file), root)))])
}

describe('INV-CI-SHARD-2 — shard bölmesi KAPSAMI kanıtlar (birleşim = vitest list, kesişim 0, hiçbir test dosyası düşmez)', () => {
  const n = N0
  const sure = SHARD.sureleriOku()
  const agirlik = (d: string): number => sure.sureler.get(d) ?? sure.varsayilan
  let liste: string[] = []
  let gecici = ''

  beforeAll(() => {
    liste = SHARD.vitestListesi(KOK, ortamKur('dislan'))
    gecici = mkdtempSync(path.join(tmpdir(), 'ci-test-shard-'))
  }, 120_000)

  afterAll(() => {
    if (gecici) rmSync(gecici, { recursive: true, force: true })
  })

  it('kanarya: `vitest list` boş değil; bu dosyayı ve bilinen kapıları içerir; yollar kök-göreli POSIX', () => {
    expect(liste.length).toBeGreaterThan(300)
    expect(liste).toContain('src/__tests__/conformance/ci-test-shard.test.ts')
    expect(liste).toContain('src/__tests__/conformance/ci-edited-ayna.test.ts')
    expect(liste).toContain('scripts/ci/__tests__/test-shard.test.ts')
    expect(liste.every((d) => !d.startsWith('/') && !d.includes('\\') && !d.includes('..') && !/^[A-Za-z]:/.test(d))).toBe(true)
    expect(liste).toEqual(sirali(liste))
    expect(new Set(liste).size).toBe(liste.length)
  })

  it('bölme (N = ci.yml matrix sayısı): birleşim = vitest list, ikişer ikişer kesişim 0, her shard dolu, hiçbir dosya iki kez ya da hiç yok', () => {
    const { gruplar } = SHARD.dagit(liste, sure, n)
    expect(gruplar).toHaveLength(n)
    const hepsi = gruplar.flat()
    expect(hepsi.length, 'birleşim boyu liste boyundan farklı: dosya düştü ya da çoğaldı').toBe(liste.length)
    expect(sirali(hepsi), 'birleşim = vitest list değil').toEqual(liste)
    expect(new Set(hepsi).size, "bir dosya birden çok shard'da").toBe(hepsi.length)
    for (let i = 0; i < n; i++) {
      expect(gruplar[i].length, `shard ${i + 1} boş`).toBeGreaterThan(0)
      const kume = new Set(gruplar[i])
      for (let j = i + 1; j < n; j++) expect(gruplar[j].filter((d) => kume.has(d)), `shard ${i + 1} ∩ shard ${j + 1}`).toEqual([])
    }
    const sayim = new Map<string, number>()
    for (const d of hepsi) sayim.set(d, (sayim.get(d) ?? 0) + 1)
    expect(sayim.size).toBe(liste.length)
    expect([...sayim.values()].every((v) => v === 1)).toBe(true)
  })

  it(`bölme dengeli: en yüklü / ortalama <= ${DENGE_ESIGI} (test-sureleri.json ağırlığıyla; yük dağıtıcıdan bağımsız yeniden hesaplanır)`, () => {
    const { gruplar, yuk } = SHARD.dagit(liste, sure, n)
    const yeniden = gruplar.map((g) => g.reduce((t, d) => t + agirlik(d), 0))
    yeniden.forEach((y, i) => expect(Math.abs(y - yuk[i]), `shard ${i + 1} yükü dağıtıcının raporuyla tutarsız`).toBeLessThan(1e-6))
    const ort = yeniden.reduce((a, b) => a + b, 0) / n
    expect(ort).toBeGreaterThan(0)
    expect(Math.max(...yeniden) / ort).toBeLessThanOrEqual(DENGE_ESIGI)
    expect(Math.min(...yeniden) / ort, 'en az yüklü shard ortalamanın çok altında').toBeGreaterThanOrEqual(2 - DENGE_ESIGI)
  })

  it('belirlenimci: iki çağrı AYNI bölmeyi verir; girdi sırasından bağımsız (ters ve karışık sıra): her shard işi aynı bölmeyi görür', () => {
    const a = SHARD.dagit(liste, sure, n)
    expect(SHARD.dagit(liste, sure, n)).toEqual(a)
    expect(SHARD.dagit([...liste].reverse(), sure, n).gruplar).toEqual(a.gruplar)
    const karisik = liste
      .map((d, i) => [d, (i * 7919) % liste.length] as const)
      .sort((x, y) => x[1] - y[1] || karsilastir(x[0], y[0]))
      .map((x) => x[0])
    expect(karisik).not.toEqual(liste)
    expect(SHARD.dagit(karisik, sure, n).gruplar).toEqual(a.gruplar)
  })

  it("yeni dosya: test-sureleri.json'da olmayan bir src/ test dosyası da TAM BİR shard'a girer (süresi bilinmeyen dosya düşmez), varsayılan ağırlıkla", () => {
    const yeni = 'src/__tests__/yeni-ozellik/hic-olculmedi.test.ts'
    expect(sure.sureler.has(yeni)).toBe(false)
    expect(liste).not.toContain(yeni)
    expect(agirlik(yeni)).toBe(sure.varsayilan)
    const { gruplar } = SHARD.dagit([...liste, yeni], sure, n)
    const hepsi = gruplar.flat()
    expect(hepsi.filter((d) => d === yeni)).toHaveLength(1)
    expect(sirali(hepsi)).toEqual(sirali([...liste, yeni]))
    expect(gruplar.filter((g) => g.includes(yeni))).toHaveLength(1)
  })

  it("shard'lar ∪ dünya durumu listesi = TAM paket (kip boş): PR kapısından çıkan her test listede yazılı, hiçbiri sessizce düşmedi", async () => {
    const tam = await vitestDosyalari(ortamKur(''))
    const dunya = (JSON.parse(readFileSync(LISTE_MUTLAK, 'utf8')) as { testler: Array<{ test: string }> }).testler.map((t) => t.test)
    expect(dunya.length).toBeGreaterThan(0)
    const { gruplar } = SHARD.dagit(liste, sure, n)
    const shardlar = new Set(gruplar.flat())
    const hepsi = sirali([...shardlar, ...dunya])
    expect(new Set(hepsi).size, "bir dosya hem shard'da hem dünya durumu listesinde").toBe(hepsi.length)
    expect(hepsi).toEqual(tam)
    // dünya durumu testleri shard'larda KOŞMAZ (dislan); master push ve zamanlı koşuda koşar
    for (const d of dunya) expect(shardlar.has(d), d).toBe(false)
  }, 120_000)

  it("include entegrasyonu: VENTHUB_TEST_SHARD_DOSYALARI ile GERÇEK `vitest list` her shard için TAM o shard'ın dosyalarını döner; birleşim = liste", async () => {
    const { gruplar } = SHARD.dagit(liste, sure, n)
    const sonuclar = await Promise.all(
      gruplar.map(async (g, i) => {
        const dosya = path.join(gecici, `shard-${i + 1}.json`)
        writeFileSync(dosya, `${JSON.stringify(g)}\n`)
        return vitestDosyalari(ortamKur('dislan', { [SHARD.ORTAM_ADI]: dosya }))
      }),
    )
    sonuclar.forEach((s, i) => expect(s, `shard ${i + 1}: vitest'in koşacağı küme dağıtıcının listesiyle aynı değil`).toEqual(sirali(gruplar[i])))
    expect(sirali(sonuclar.flat()), 'shard kümelerinin birleşimi vitest list değil').toEqual(liste)
    expect(new Set(sonuclar.flat()).size).toBe(liste.length)
  }, 120_000)

  it("özel karakterli yollar (köşeli/yuvarlak/küme parantezi, +, @, !, boşluk) include desenlerinde DÜZ METİN eşleşir: gerçek vitest glob'u, benzeşen yabancı dosyaları ALMAZ", async () => {
    const proje = path.join(gecici, 'ozel-proje')
    const secilen = ['src/app/[lang]/(site)/sayfa.test.ts', 'src/a+b/x@y!.test.ts', 'src/{kume}/b c.test.ts']
    const yabanci = ['src/app/l/(site)/sayfa.test.ts', 'src/app/l/site/sayfa.test.ts', 'src/a/b/x@y!.test.ts', 'src/kume/b c.test.ts']
    for (const d of [...secilen, ...yabanci]) {
      mkdirSync(path.join(proje, path.dirname(d)), { recursive: true })
      writeFileSync(path.join(proje, d), "import { it } from 'vitest'\nit('x', () => undefined)\n")
    }
    const liste2 = path.join(proje, 'liste.json')
    writeFileSync(liste2, `${JSON.stringify(secilen)}\n`)
    const cfg = path.join(proje, 'vitest.config.mjs')
    const betik = JSON.stringify(path.join(KOK, 'scripts/ci/test-shard.cjs'))
    writeFileSync(
      cfg,
      `import { createRequire } from 'node:module'\nconst { ortamdanInclude } = createRequire(import.meta.url)(${betik})\nexport default { test: { include: ortamdanInclude(process.env) ?? ['**/*.test.ts'] } }\n`,
    )
    const bulunan = await vitestDosyalari(ortamKur('', { [SHARD.ORTAM_ADI]: liste2 }), ['--root', proje, '--config', cfg], proje)
    expect(bulunan).toEqual(sirali(secilen))
    // kontrol: liste verilmezse hepsi görünür (yabancı dosyalar gerçekten tuzak olarak oradaydı)
    const hepsi = await vitestDosyalari(ortamKur(''), ['--root', proje, '--config', cfg], proje)
    expect(hepsi).toEqual(sirali([...secilen, ...yabanci]))
  }, 120_000)

  // CANLI BULGU (#1741 koşu 2, `test-shard (1/4)` kırmızı): shard işleri `pnpm test`i VENTHUB_TEST_SHARD_DOSYALARI ile koşar ve değişken alt süreçlere MİRAS KALIR;
  // `test-kosu-kapsami.test.ts` gerçek config'i `vitest list` alt süreçlerinde ölçer (üç kip) ve shard listesi ona sızarsa küme shard'ın dosyalarına daralır / config
  // "yalniz ile birlikte kullanılamaz" diye fırlatır. Yerel koşuda değişken yoktur: bu hata yalnız burada, shard ortamı AÇIKKEN yakalanır.
  it("shard ortamı ALT SÜREÇLERE SIZMAZ: VENTHUB_TEST_SHARD_DOSYALARI + dislan verilirken test-kosu-kapsami'nin gerçek-config alt süreçleri (vitest list) yine geçer", async () => {
    const dosya = path.join(gecici, 'sizinti-liste.json')
    writeFileSync(dosya, `${JSON.stringify(['src/__tests__/conformance/test-kosu-kapsami.test.ts'])}\n`)
    const ortam = ortamKur('dislan', { [SHARD.ORTAM_ADI]: dosya })
    const { stdout } = await execFileAsync(
      process.execPath,
      [path.join(KOK, 'node_modules', 'vitest', 'vitest.mjs'), 'run', 'src/__tests__/conformance/test-kosu-kapsami.test.ts', '-t', 'GERÇEK config', '--no-color', '--maxWorkers=1'],
      { cwd: KOK, env: ortam, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 110_000, windowsHide: true },
    )
    expect(stdout).toMatch(/Tests\s+\d+ passed/)
    expect(stdout).not.toMatch(/\d+ failed/)
  }, 120_000)
})
