import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-EDITED-1 · `edited` aynası `ci` iş akışına DOĞRU bağlı (ALT-38).
 *
 * NİÇİN VAR: `edited` (PR başlığı/gövdesi düzenleme) koşusu ağır adımları yalnız şu koşulda atlar: aynı head SHA için daha
 * önce TAM koşu, AYNI tabana karşı (tam koşunun `taban izi <sha>` adımı) yeşil bitti (mantık: scripts/ci/edited-ayna.cjs, karar
 * tablosu: scripts/ci/__tests__/edited-ayna.test.ts). Bu dosya BAĞLANTIYI korur; bağlantı bozulursa mantık ne kadar doğru olursa olsun:
 *   1. bir AĞIR adım koşulsuz kalırsa ayna koşusu gereksiz yere paketin tamamını koşar (kazanç sıfır, sessiz israf),
 *   2. bir HAFİF/KAPI adımı (özellikle PR kayıt kapısı) atlama koşulu alırsa düzenleme kayıt kapısını da atlar:
 *      kırmızı bir PR yalnız gövdesi düzenlenerek YEŞİLE çevrilir. En ağır bozulma budur,
 *   3. ayna adımı kayıt kapısından ÖNCE koşarsa ya da adı kodla ayrışırsa ayna koşusu tanınamaz (tam koşu sanılır),
 *   4. `edited` ayrı concurrency grubunda değilse koşan TAM koşuyu yine iptal eder,
 *   5. `actions: read` düşerse mantık önceki koşuları okuyamaz (güvenli düşer: hep tam koşu; kazanç sıfır).
 * Her yeni adım SINIFLANDIRILMAK zorundadır (ağır mı, hep koşan mı): sınıfsız adım KIRMIZI.
 *
 * SERTLEŞTİRME (2026-10-06 sabotaj yoklaması: ilk sürüm "kısmi koruma" çıktı, aşağıdaki bozulmalar testi YEŞİL bırakıyordu):
 *   6. `ci` İŞİNİN KENDİSİ atlanırsa (job düzeyi `if:`, `needs:` ...) GitHub atlanan işi BAŞARILI sayar: zorunlu `ci` kontrolü
 *      hiçbir şey koşmadan yeşil görünür. Job düzeyinde YALNIZ bilinen anahtarlar durur; her yenisi bilinçle listeye eklenir.
 *   7. Koşullar `includes` ile değil SATIR EŞİTLİĞİYLE sınanır (`... || always()` alt-dizeyi korur ama adımı ayna kararından
 *      bağımsız koşturur). Kapıyı atlatmanın başka yolları da yasak: `continue-on-error`, `run: ... || true`, kayıt kapısının
 *      env DEĞERLERİ (`PR_YAZAR: dependabot[bot]` kapıyı her PR için etkisizleştirir), ayna adımının env DEĞERLERİ.
 *   8. İzinler EN AZ yetkiyle tam eşitlik (yalnız `contents/actions/pull-requests: read`; `write-all` ve satır içi haritalar dahil
 *      HİÇBİR yazma biçimi yok); `defaults.run.shell: bash` sabit (pipefail düşerse `| tee` kapıları bloklamaz); `pull_request`
 *      türleri tam {opened, synchronize, reopened, edited}.
 *
 * B1/B2 SERTLEŞTİRMESİ (ALT-38a güvenlik incelemesi, ikinci tur):
 *   9. TABAN İZİ (B1): `edited` aynası yalnız AYNI head SHA'ya ve AYNI tabana karşı bitmiş yeşil bir tam koşuya dayanır; her tam koşu
 *      test ettiği tabanı `taban izi <sha>` adlı adımın ADINA yazar. İki adım (Taban SHA'sı + iz) Checkout'tan HEMEN sonra, HER
 *      kurulum/kapı adımından ÖNCE, her pull_request koşusunda koşmalı: iz atlanabilirse ya da `edited` koşulu taşırsa ayna kör kalır
 *      (iz yok → hep TAM: güvenli ama kazanç sıfır); kırmızı biten bir koşu iz taşımazsa B4 ("herhangi biri kırmızıysa TAM") onu GÖRMEZ;
 *      yanlış taban yazılırsa (HEAD, HEAD^2, pull_request.base.sha) test edilmemiş birleşim YANLIŞ ATLATILIR. Ad, sıra, `id` ve komut TAM.
 *  10. KARAR BETİĞİ TABANDAN (B2): ayna adımı betiği PR'ın kendi kopyasından DEĞİL `git show HEAD^1:` ile tabandan çıkarıp koşar; PR betiği
 *      değiştirip kendi kırmızısını atlatamaz. Taban kopyası yoksa TAM koşu (`atla=false` + `exit 0`). `run` gövdesi TAM eşitlik + anlamsal
 *      denetim (hangi ebeveyn, nereye yazılıyor, ne koşuyor, hangi dalda ne yazılıyor). `BASE_REF` KALKTI; `TABAN_DEGISTI` geldi (taban dalı
 *      bu düzenlemede değiştiyse betik doğrudan TAM der).
 *  11. `fetch-depth: 0` (B1/B2): `HEAD^1` ve `git show HEAD^1:` sığ klonda çalışmaz, ayna sessizce hep TAM der. Checkout `with:` girdileri TAM
 *      küme (`ref` merge-ref'te kalmalı: PR başı checkout'unda `HEAD^1` taban olmaz).
 *
 * SABOTAJ TESTLERİ ÇAPASIZDIR: bozucular adımı/anahtarı ADIYLA bulup satırı BÜTÜNÜYLE yeniden yazar (bul-değiştir metni yok);
 * ci.yml sabotaj yoklamasında zaten bozulmuşsa fikstür kırılmaz, yani sabotaj testi yalnız KENDİ denetimi çalışmazsa kırmızı olur.
 *
 * Ölçüm yüzeyi: `node:fs` + satır taraması (YAML ayrıştırıcı yok; girinti sabit: iş 2, iş anahtarı 4, adım 6, adım anahtarı 8, env 10).
 * Ayrıştırılamayan yapı KIRMIZIDIR (boş sonuç "uyumlu" sayılmaz). ci.yml'i DEĞİŞTİRMEZ.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
/** Karar betiğinin yolu (depo köküne göreli); ayna adımı onu tabandan `git show` ile çıkarır. */
const AYNA_BETIGI = 'scripts/ci/edited-ayna.cjs'
interface IzIsleri {
  jobs: Array<{ name: string; steps: Array<{ name: string; conclusion: string }> }>
}
const { AYNA_ADIM_ADI, IZ_ADIM_ONEKI, izTabani } = require_(path.join(KOK, AYNA_BETIGI)) as {
  AYNA_ADIM_ADI: string
  IZ_ADIM_ONEKI: string
  izTabani: (isler: IzIsleri) => string | null
}
const AYNA_BETIGI_KAYNAK = readFileSync(path.join(KOK, AYNA_BETIGI), 'utf8').replace(/\r\n/g, '\n')

/** Ağır adımların `if:` SATIRI: hepsi buna BİREBİR eşit olmalı (alt-dize değil: `|| always()` kuyruğu alt-dizeyi korur). */
const KOSUL = "if: steps.ayna.outputs.atla != 'true'"
/** Ayna koşusunda ATLANAN adımlar: hepsi bu koşulu taşır. */
const AGIR = [
  'Setup Deno',
  'Install dependencies',
  'Lint (blocking)',
  'Type check',
  'Deno check (edge functions — kapı-körlüğü guard)',
  'Edge mangle-guard (string-literal — deno check göremez)',
  'Edge CORS guard (ölü getCorsHeaders importu + eksik Allow-Origin)',
  'Secret guard (hardcoded DB connection string)',
  'Test',
  'Build (blocking)',
]

const KAPI_ADI = 'PR kayıt kapısı (karar 187)'
const CHECKOUT_ADI = 'Checkout'
const PNPM_ADI = 'Setup pnpm'
/** ALT-39 · depoya giremeyecek veri kapısı: bağımlılıksız (git + node), ayna koşusunda DA koşar (sızıntı kapısı düzenlemeyle atlatılamaz). */
const DOKUM_KAPISI_ADI = 'Döküm kapısı (depoya giremeyecek veri)'
const DOKUM_KAPISI_RUN = 'run: node scripts/security/depo-dokum-kapisi.cjs'

// ── B1 · TABAN İZİ: iki adım, Checkout'tan hemen sonra, her pull_request koşusunda ─────────────────────────────────────
const TABAN_ADI = "Taban SHA'sı (merge-ref birinci ebeveyn)"
const TABAN_ID = 'taban'
/** Taban adımının çıktı anahtarı: iz adı `steps.<id>.outputs.<anahtar>` olarak okur. */
const TABAN_CIKTI = 'sha'
/** İz adımının adı: ÖNEK betikteki IZ_ADIM_ONEKI'dan GELİR (ikisi ayrışırsa denetim kırmızı), devamı taban adımının çıktısı. */
const IZ_ADI = `${IZ_ADIM_ONEKI}\${{ steps.${TABAN_ID}.outputs.${TABAN_CIKTI} }}`
const PR_KOSULU = "if: github.event_name == 'pull_request'"
const TABAN_RUN = `run: echo "${TABAN_CIKTI}=$(git rev-parse HEAD^1)" >> "$GITHUB_OUTPUT"`
const IZ_RUN = 'run: echo "iz bu adımın ADINDA (scripts/ci/edited-ayna.cjs izTabani)"'

// ── B2 · KARAR BETİĞİ TABANDAN: ayna adımının `run: |` gövdesi ────────────────────────────────────────────────────────
/** Tabandan çıkarılan kopyanın yazıldığı yol (runner geçici dizini: PR'ın çalışma ağacı DEĞİL). */
const KOPYA = '$RUNNER_TEMP/edited-ayna.cjs'
const GIT_SHOW = `git show HEAD^1:${AYNA_BETIGI}`
const NODE_KOMUTU = `node "${KOPYA}"`
/** Beklenen gövde (LF, girinti atılmış). `String.raw`: printf'in `\n`'leri kaçış DEĞİL, dosyadaki iki karakterdir. */
const AYNA_RUN_GOVDESI = String.raw`if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then
  echo "::notice::edited ayna: TAM KOŞU — taban kopyası yok (HEAD^1:${AYNA_BETIGI})"
  printf 'atla=false\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"
  exit 0
fi
${NODE_KOMUTU}`
/** Ayna adımının `if:` satırı ve ortam değişkenleri (TABAN_DEGISTI: taban dalı bu düzenlemede değiştiyse betik doğrudan TAM der). */
const AYNA_KOSULU = "if: github.event_name == 'pull_request' && github.event.action == 'edited'"
const AYNA_ENV: Record<string, string> = {
  GH_TOKEN: '${{ github.token }}',
  DEPO: '${{ github.repository }}',
  HEAD_SHA: '${{ github.event.pull_request.head.sha }}',
  KOSU_ID: '${{ github.run_id }}',
  TABAN_DEGISTI: "${{ github.event.changes.base && 'true' || '' }}",
}
/** `GH_TOKEN`ı betik değil `gh` okur; `GITHUB_OUTPUT`u runner verir: ikisi betik↔ci.yml ortam karşılaştırmasının DIŞINDADIR. */
const BETIK_DISI_ORTAM = { ciVerir: ['GH_TOKEN'], runnerVerir: ['GITHUB_OUTPUT'] }
/** Checkout girdileri TAM küme: `fetch-depth: 0` (HEAD^1 ve git show için ŞART) ve merge-ref'te kalan `ref`. */
const CHECKOUT_GIRDILERI: Record<string, string> = {
  ref: "${{ steps.mergeref.outputs.ref || '' }}",
  'fetch-depth': '0',
}

interface HepKosanBeklentisi {
  ad: string
  /** Beklenen `if:` satırı; null = adımda HİÇ `if:` olmamalı. */
  kosul: string | null
  /** Beklenen `id:` (sonraki adımlar çıktısını okur); verilmezse denetlenmez. */
  id?: string
  /** Beklenen TEK satırlık `run:`; verilmezse (uses ya da çok satırlı betik) denetlenmez. */
  run?: string
  /** Beklenen ÇOK SATIRLI `run: |` gövdesi (LF, girinti atılmış); verilirse `run:` bir LİTERAL blok (`|`, `|-`, `|+`) olmalıdır, `>` olamaz. */
  govde?: string
  /** Beklenen ortam değişkenleri: TAM küme ve TAM değerler; verilmezse denetlenmez. */
  env?: Record<string, string>
  /** Beklenen `with:` girdileri: TAM küme ve TAM değerler; verilmezse denetlenmez. */
  girdiler?: Record<string, string>
  /** Beklenen `uses:` ÖNEKİ (eylem adı, `@` dahil); verilirse eylem başka bir şeyle değiştirilemez. */
  kullanir?: string
  /** İzin verilen adım anahtarları; verilirse bunun dışındaki her anahtar kırmızıdır (yenisi bilinçle eklenir). */
  anahtarlar?: string[]
}

/**
 * Ayna koşusunda DA koşan adımlar: HİÇBİRİ ayna koşulu taşımaz (özellikle PR kayıt kapısı); kendi koşulları TAM eşitlikle sabit.
 * Sıra dosya sırasıdır; zorunlu sıra ayrıca `siraDenetle`de sınanır.
 */
const HEP_KOSAN_BEKLENTISI: HepKosanBeklentisi[] = [
  {
    ad: 'Merge-ref çözümle (yalnız elle tetiklemede)',
    kosul: "if: github.event_name == 'workflow_dispatch'",
    id: 'mergeref',
    env: { GH_TOKEN: '${{ github.token }}' },
  },
  { ad: CHECKOUT_ADI, kosul: null, kullanir: 'actions/checkout@', girdiler: CHECKOUT_GIRDILERI, anahtarlar: ['name', 'uses', 'with'] },
  {
    ad: TABAN_ADI,
    kosul: PR_KOSULU,
    id: TABAN_ID,
    run: TABAN_RUN,
    anahtarlar: ['name', 'id', 'if', 'run'],
  },
  {
    ad: IZ_ADI,
    kosul: PR_KOSULU,
    run: IZ_RUN,
    anahtarlar: ['name', 'if', 'run'],
  },
  { ad: PNPM_ADI, kosul: null },
  { ad: 'Setup Node', kosul: null },
  {
    ad: KAPI_ADI,
    kosul: PR_KOSULU,
    run: 'run: node scripts/board/pr-kayit-kapisi.cjs',
    env: {
      PR_GOVDE: '${{ github.event.pull_request.body }}',
      PR_YAZAR: '${{ github.event.pull_request.user.login }}',
    },
    anahtarlar: ['name', 'if', 'env', 'run'],
  },
  {
    ad: AYNA_ADIM_ADI,
    kosul: AYNA_KOSULU,
    id: 'ayna',
    govde: AYNA_RUN_GOVDESI,
    env: AYNA_ENV,
    anahtarlar: ['name', 'id', 'if', 'env', 'run'],
  },
  {
    ad: DOKUM_KAPISI_ADI,
    kosul: null,
    run: DOKUM_KAPISI_RUN,
    anahtarlar: ['name', 'run'],
  },
]
const HEP_KOSAN = HEP_KOSAN_BEKLENTISI.map((h) => h.ad)

/** `ci` işinde bulunabilecek job düzeyi anahtarlar: BAŞKASI (özellikle `if`) işin kendisini atlatabilir ya da yetkisini değiştirir. */
const IS_ANAHTARLARI = ['runs-on', 'timeout-minutes', 'defaults', 'steps']
const ZAMAN_ASIMI = "timeout-minutes: ${{ github.event.action == 'edited' && 30 || 15 }}"
const CONCURRENCY = ["group: ci-${{ github.ref }}${{ github.event.action == 'edited' && '-edited' || '' }}", 'cancel-in-progress: true']
/** EN AZ yetki: bunun dışındaki her izin (okuma dahil) ve her yazma biçimi kırmızıdır. */
const IZINLER = ['actions: read', 'contents: read', 'pull-requests: read']
const TURLER = ['edited', 'opened', 'reopened', 'synchronize']
/** Komutun hatasını yutan kuyruklar: `|| true`, `|| :`, `|| exit 0`, `; true`. */
const HATA_YUTAN = /\|\|\s*(?:true\b|:(?:\s|$)|exit\s+0\b)|;\s*true\s*$/

// ── AYRIŞTIRICI (satır taraması) ──────────────────────────────────────────────────────────────────────────────────

interface Anahtar {
  anahtar: string
  /** Satır sonu yorumu (` #...`) atılmış, kırpılmış değer (betik gövdesi için `|`/`>`). */
  deger: string
  /** Dosyadaki 0 tabanlı satır numarası. */
  no: number
}

interface Adim {
  ad: string
  /** Dosyadaki 0 tabanlı ilk satır numarası; `satirlar[0]` bu satırdır. */
  bas: number
  /** Adımın ham satırları (yorum ve boş satırlar dahil, ardışık). */
  satirlar: string[]
  /** Adımın DOĞRUDAN anahtarları (girinti 8; betik gövdesindeki `if:` gibi satırlar anahtar SAYILMAZ). */
  anahtarlar: Anahtar[]
  /** `env:` altındaki değişkenler (girinti 10). */
  env: Map<string, string>
  /** `with:` altındaki girdiler (girinti 10). */
  girdiler: Map<string, string>
}

const bosMu = (s: string) => s.trim() === ''
const yorumMu = (s: string) => s.trimStart().startsWith('#')
const anlamli = (s: string) => !bosMu(s) && !yorumMu(s)
const girinti = (s: string) => s.length - s.trimStart().length
const yorumsuz = (satirlar: string[]) => satirlar.filter((s) => !/^\s*#/.test(s))

/** YAML satır sonu yorumunu (boşluk + `#`) atar ve kırpar; denetlenen değerlerde tırnak içi `#` yoktur. */
function degerTemizle(d: string): string {
  const i = d.indexOf(' #')
  return (i < 0 ? d : d.slice(0, i)).trim()
}

/** Girinti 0 anahtarın bölümü: `bas` anahtar satırı, `bit` (dahil değil) sonraki girinti 0 anlamlı satır. Yorum/boş satır sınır DEĞİL. */
function ustBolum(satirlar: string[], anahtar: string): { bas: number; bit: number } | null {
  const bas = satirlar.findIndex((s) => s.trimEnd() === `${anahtar}:` || s.startsWith(`${anahtar}: `))
  if (bas < 0) return null
  let bit = satirlar.length
  for (let i = bas + 1; i < satirlar.length; i++) {
    if (anlamli(satirlar[i]) && girinti(satirlar[i]) === 0) {
      bit = i
      break
    }
  }
  return { bas, bit }
}

/** `jobs.<isId>` bölümü: `bas` iş satırı (`  ci:`), `bit` dahil değil. */
function isBolumu(satirlar: string[], isId: string): { bas: number; bit: number } | null {
  const jobs = ustBolum(satirlar, 'jobs')
  if (!jobs) return null
  const bas = satirlar.findIndex((s, i) => i > jobs.bas && i < jobs.bit && s.trimEnd() === `  ${isId}:`)
  if (bas < 0) return null
  let bit = jobs.bit
  for (let i = bas + 1; i < jobs.bit; i++) {
    if (anlamli(satirlar[i]) && girinti(satirlar[i]) <= 2) {
      bit = i
      break
    }
  }
  return { bas, bit }
}

/** `ci` işinin job düzeyi anahtarları (girinti 4). */
function isAnahtarlari(metin: string): Anahtar[] {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  if (!is) return []
  const liste: Anahtar[] = []
  for (let i = is.bas + 1; i < is.bit; i++) {
    const m = anlamli(satirlar[i]) ? /^ {4}([A-Za-z_][\w-]*):\s?(.*)$/.exec(satirlar[i]) : null
    if (m) liste.push({ anahtar: m[1], deger: degerTemizle(m[2]), no: i })
  }
  return liste
}

/** `ci` işinin adımları. Adsız adım da bir adımdır (adı ''), önceki adımın bloğuna YUTULMAZ. */
function adimlariAyir(metin: string): Adim[] {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  if (!is) return []
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
    if (girinti(s) <= 4) break // `steps:` listesi bitti (sonraki job anahtarı)
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
      const anahtarAdi = anahtar[1]
      if (anahtarAdi === 'name') mevcut.ad = degerTemizle(anahtar[2])
      blok = anahtarAdi === 'env' || anahtarAdi === 'with' ? anahtarAdi : null
    } else if (blok && girinti(s) === 10) {
      const e = /^ {10}([A-Za-z_][\w-]*):\s?(.*)$/.exec(s)
      if (e) (blok === 'env' ? mevcut.env : mevcut.girdiler).set(e[1], degerTemizle(e[2]))
    } else if (girinti(s) <= 8) {
      blok = null
    }
  }
  return adimlar
}

/**
 * Adımın ÇOK SATIRLI `run: |` gövdesi: girinti atılmış, LF, sondaki boş satırlar yok. Gövde `run:` anahtarından sonraki, girintisi
 * 8'den büyük (ya da boş) satırlardır; girinti 8 ve altındaki ilk dolu satır (sonraki anahtar, sonraki adımın yorumu) bitirir.
 * `run:` yoksa ya da blok (`|`, `>`) değilse null (tek satırlık komut `anahtarlar`dan okunur).
 */
function runGovdesi(a: Adim): string | null {
  const r = a.anahtarlar.find((k) => k.anahtar === 'run')
  if (!r || !/^[|>][-+]?$/.test(r.deger)) return null
  const govde: string[] = []
  for (const s of a.satirlar.slice(r.no - a.bas + 1)) {
    if (!bosMu(s) && girinti(s) <= 8) break
    govde.push(s)
  }
  while (govde.length > 0 && bosMu(govde[govde.length - 1])) govde.pop()
  const ilk = govde.find((s) => !bosMu(s))
  if (ilk === undefined) return ''
  const g = girinti(ilk)
  return govde.map((s) => (bosMu(s) ? '' : s.slice(g))).join('\n')
}

/** İki çok satırlı metnin İLK farklı satırı (kırmızı mesajın teşhisi için). */
function ilkFark(bulunan: string | null, beklenen: string): string {
  if (bulunan === null) return 'gövde okunamadı'
  const b = bulunan.split('\n')
  const e = beklenen.split('\n')
  for (let i = 0; i < Math.max(b.length, e.length); i++) {
    if (b[i] !== e[i]) return `satır ${i + 1}: bulunan \`${b[i] ?? '(yok)'}\`, beklenen \`${e[i] ?? '(yok)'}\``
  }
  return 'fark yok'
}

// ── DENETİM ───────────────────────────────────────────────────────────────────────────────────────────────────────

function siniflandirmaDenetle(adimlar: Adim[]): string[] {
  const ihlal: string[] = []
  if (adimlar.length === 0) ihlal.push('`jobs.ci.steps` ayrıştırılamadı (iş ya da adımlar yok): hiçbir adım denetlenmedi')
  const gorulen = new Set<string>()
  for (const a of adimlar) {
    if (a.ad === '') {
      ihlal.push(`adsız adım (satır ${a.bas + 1}) SINIFSIZ: adı olmayan adım ayna koşusunda atlanır mı sorusuna cevap veremez; adını yaz, listeye ekle`)
      continue
    }
    if (gorulen.has(a.ad)) ihlal.push(`adım adı TEKRAR: "${a.ad}" — aynı adlı ikinci adım sınıflamayı ve koşul denetimini atlatır`)
    gorulen.add(a.ad)
    // 1) sınıflandırma: her adım ağır ya da hep-koşan
    const agir = AGIR.includes(a.ad)
    const hep = HEP_KOSAN.includes(a.ad)
    if (!agir && !hep) ihlal.push(`adım "${a.ad}" SINIFSIZ: ayna koşusunda atlanır mı? INV-CI-EDITED-1 listesine (AGIR ya da HEP_KOSAN) ekle`)
  }
  for (const ad of [...AGIR, ...HEP_KOSAN]) {
    if (!adimlar.some((a) => a.ad === ad)) ihlal.push(`adım "${ad}" ci.yml içinde yok (adı değişti mi? liste ve iş akışı birlikte güncellenir)`)
  }
  return ihlal
}

const adimIfSatirlari = (a: Adim) => a.anahtarlar.filter((k) => k.anahtar === 'if').map((k) => `if: ${k.deger}`)
/** Adımın `if:` satırları; adım yoksa null (testin boş listeyle yanlışlıkla geçmemesi için). */
const ifSatirlari = (metin: string, ad: string): string[] | null => {
  const a = adimlariAyir(metin).find((x) => x.ad === ad)
  return a ? adimIfSatirlari(a) : null
}

/** Tek satırlık `run:` hatayı yutuyor mu; HEP adımlarda çok satırlı gövde de taranır (ağır adımlarda `$(... || true)` meşrudur). */
function hataYutanSatirlar(a: Adim, govdeyiTara: boolean): string[] {
  const yutanlar: string[] = []
  for (const r of a.anahtarlar.filter((k) => k.anahtar === 'run')) {
    if (/^[|>][-+]?$/.test(r.deger)) {
      if (govdeyiTara) yutanlar.push(...yorumsuz(a.satirlar).filter((s) => HATA_YUTAN.test(s)).map((s) => s.trim()))
    } else if (HATA_YUTAN.test(r.deger)) {
      yutanlar.push(`run: ${r.deger}`)
    }
  }
  return yutanlar
}

/** `env:` / `with:` haritası TAM küme ve TAM değer: eksik, farklı değerli ve fazladan girdi ayrı ayrı bildirilir. */
function haritaDenetle(harita: Map<string, string>, beklenen: Record<string, string>, onEk: string, ifade: { yok: string; fazla: string }): string[] {
  const ihlal: string[] = []
  for (const [ad, deger] of Object.entries(beklenen)) {
    const bulunan = harita.get(ad)
    if (bulunan === undefined) ihlal.push(`${onEk} ${ad} ${ifade.yok}`)
    else if (bulunan !== deger) ihlal.push(`${onEk} ${ad} değeri beklenen değil: bulunan \`${bulunan}\`, beklenen \`${deger}\``)
  }
  for (const ad of harita.keys()) if (!(ad in beklenen)) ihlal.push(`${onEk} ${ifade.fazla} ${ad}`)
  return ihlal
}
const envDenetle = (a: Adim, beklenen: Record<string, string>, onEk: string) =>
  haritaDenetle(a.env, beklenen, onEk, { yok: 'ortam değişkeni yok', fazla: 'beklenmeyen ortam değişkeni' })
const girdiDenetle = (a: Adim, beklenen: Record<string, string>, onEk: string) =>
  haritaDenetle(a.girdiler, beklenen, onEk, { yok: 'girdisi yok', fazla: 'beklenmeyen girdi' })

/** Her sınıflı adımda yasak: `continue-on-error` (adım kırmızı olsa da iş yeşil kalır) ve komutun hatasını yutan `run`. */
function kapiAtlatmaDenetle(a: Adim, tur: string, govdeyiTara: boolean): string[] {
  const ihlal: string[] = []
  if (a.anahtarlar.some((k) => k.anahtar === 'continue-on-error')) {
    ihlal.push(`${tur} adım "${a.ad}" continue-on-error taşıyor: adım kırmızı olsa da iş yeşil kalır, kapı sessizce atlanır`)
  }
  const yutanlar = hataYutanSatirlar(a, govdeyiTara)
  if (yutanlar.length) ihlal.push(`${tur} adım "${a.ad}" run komutu hatayı yutuyor (\`${yutanlar[0]}\`): komut kırmızı olsa da adım yeşil kalır`)
  return ihlal
}

/** Ağır adımlar: `if:` SATIR eşitliği (alt-dize değil). */
function agirAdimlariDenetle(adimlar: Adim[]): string[] {
  const ihlal: string[] = []
  for (const a of adimlar.filter((x) => AGIR.includes(x.ad))) {
    const kosullar = adimIfSatirlari(a)
    if (kosullar.length === 0) ihlal.push(`AĞIR adım "${a.ad}" atlama koşulu taşımıyor: ayna koşusu paketin tamamını koşar`)
    else if (kosullar.length !== 1 || kosullar[0] !== KOSUL) {
      ihlal.push(
        `AĞIR adım "${a.ad}" atlama koşulu TAM eşit değil: bulunan \`${kosullar.join(' ; ')}\`, beklenen \`${KOSUL}\` (ek koşul ya da kuyruk adımı ayna kararından bağımsız koşturur ya da hiç koşturmaz)`,
      )
    }
    ihlal.push(...kapiAtlatmaDenetle(a, 'AĞIR', false))
  }
  return ihlal
}

/** Hep koşan adımlar: `if:` TAM beklenen satır (ya da hiç yok); kapılarda id/run/env/anahtar kümesi de sabit. */
function hepKosanAdimlariDenetle(adimlar: Adim[]): string[] {
  const ihlal: string[] = []
  for (const a of adimlar) {
    const hep = HEP_KOSAN_BEKLENTISI.find((h) => h.ad === a.ad)
    if (!hep) continue
    const kosullar = adimIfSatirlari(a)
    if (hep.kosul === null) {
      if (kosullar.length) ihlal.push(`HEP KOŞAN adım "${a.ad}" atlama koşulu taşıyor: bu adımda HİÇ \`if:\` olmamalı (bulunan \`${kosullar.join(' ; ')}\`)`)
    } else if (kosullar.length === 0) {
      ihlal.push(`HEP KOŞAN adım "${a.ad}" beklenen \`${hep.kosul}\` koşulunu taşımıyor`)
    } else if (kosullar.length !== 1 || kosullar[0] !== hep.kosul) {
      ihlal.push(
        `HEP KOŞAN adım "${a.ad}" atlama koşulu taşıyor: bulunan \`${kosullar.join(' ; ')}\`, beklenen TAM \`${hep.kosul}\` (düzenleme bu kapıyı atlatır: kırmızı PR yalnız gövdesi düzenlenerek yeşile döner)`,
      )
    }
    if (/steps\.ayna\.outputs/.test(yorumsuz(a.satirlar).join('\n'))) {
      ihlal.push(`HEP KOŞAN adım "${a.ad}" atlama koşulu taşıyor: düzenleme bu kapıyı atlatır (kırmızı PR yalnız gövdesi düzenlenerek yeşile döner)`)
    }
    ihlal.push(...kapiAtlatmaDenetle(a, 'HEP KOŞAN', true))
    if (hep.id !== undefined) {
      const idler = a.anahtarlar.filter((k) => k.anahtar === 'id').map((k) => k.deger)
      if (idler.length !== 1 || idler[0] !== hep.id) ihlal.push(`HEP KOŞAN adım "${a.ad}" \`id: ${hep.id}\` satırı yok: sonraki adımların koşulu çıktıyı okuyamaz`)
    }
    if (hep.anahtarlar) {
      for (const k of a.anahtarlar) {
        if (!hep.anahtarlar.includes(k.anahtar)) {
          ihlal.push(`HEP KOŞAN adım "${a.ad}" beklenmeyen anahtar \`${k.anahtar}\` taşıyor (izinli: ${hep.anahtarlar.join(', ')}); yenisi bilinçle eklenir`)
        }
      }
    }
    if (hep.run !== undefined) {
      const run = a.anahtarlar.filter((k) => k.anahtar === 'run').map((k) => `run: ${k.deger}`)
      if (run.length !== 1 || run[0] !== hep.run) ihlal.push(`HEP KOŞAN adım "${a.ad}" run satırı beklenen TAM \`${hep.run}\` değil (bulunan: ${run.join(' ; ') || 'yok'})`)
    }
    if (hep.govde !== undefined) {
      const run = a.anahtarlar.filter((k) => k.anahtar === 'run').map((k) => k.deger)
      // literal blok (`|`, `|-`, `|+`): satırlar olduğu gibi kalır. `>` (katlanan) satırları TEK satıra birleştirir: kabuk betiğini bozar
      if (run.length !== 1 || !/^\|[-+]?$/.test(run[0])) ihlal.push(`HEP KOŞAN adım "${a.ad}" \`run: |\` (çok satırlı, satırlar olduğu gibi) bloğu değil (bulunan: ${run.join(' ; ') || 'yok'})`)
      const govde = runGovdesi(a)
      if (govde !== hep.govde) ihlal.push(`HEP KOŞAN adım "${a.ad}" run gövdesi beklenen TAM gövde değil (ilk fark: ${ilkFark(govde, hep.govde)})`)
    }
    if (hep.kullanir !== undefined) {
      const eylem = a.anahtarlar.filter((k) => k.anahtar === 'uses').map((k) => k.deger)
      if (eylem.length !== 1 || !eylem[0].startsWith(hep.kullanir)) {
        ihlal.push(`HEP KOŞAN adım "${a.ad}" \`uses: ${hep.kullanir}…\` değil (bulunan: ${eylem.join(' ; ') || 'yok'}): HEAD^1 ve git show bu eylemin TAM klonuna dayanır`)
      }
    }
    if (hep.env) ihlal.push(...envDenetle(a, hep.env, a.ad === AYNA_ADIM_ADI ? 'ayna adımında' : `HEP KOŞAN adım "${a.ad}"`))
    if (hep.girdiler) ihlal.push(...girdiDenetle(a, hep.girdiler, a.ad === CHECKOUT_ADI ? 'Checkout adımında' : `HEP KOŞAN adım "${a.ad}"`))
  }
  return ihlal
}

/**
 * B1 sırası: Checkout < Taban SHA'sı < iz < Setup pnpm < PR kayıt kapısı < ayna. Her çiftin yanında İHLALİN NEDENİ.
 * İz, kırmızı bitebilecek HER adımdan önce yazılmalı: iz taşımayan kırmızı koşu B4'e ("aynı head+taban için herhangi biri kırmızıysa
 * TAM") GÖRÜNMEZ ve eski bir yeşil koşu üzerinden atlama açılır.
 */
const IZ_SIRASI: ReadonlyArray<readonly [string, string, string]> = [
  [CHECKOUT_ADI, TABAN_ADI, "taban SHA'sı adımı Checkout'tan ÖNCE: depo yokken `git rev-parse HEAD^1` boş döner, iz hiçbir koşuda yazılmaz (ayna hep TAM der)"],
  [TABAN_ADI, IZ_ADI, "iz adımı taban SHA'sı adımından ÖNCE: ad henüz üretilmemiş (boş) çıktıyı okur, iz yazılmaz"],
  [IZ_ADI, PNPM_ADI, "iz adımı Setup pnpm'den SONRA: kurulum kırılırsa o koşu iz taşımaz, B4 (herhangi biri kırmızıysa TAM) o kırmızıyı GÖRMEZ"],
  [PNPM_ADI, KAPI_ADI, "PR kayıt kapısı Setup pnpm'den ÖNCE: kapı sırası bozuldu (iz → kurulum → kapı → ayna)"],
  [IZ_ADI, KAPI_ADI, 'iz adımı PR kayıt kapısından SONRA: kapı kırmızı bitince o koşu iz taşımaz, B4 o kırmızıyı GÖRMEZ'],
  [IZ_ADI, AYNA_ADIM_ADI, 'iz adımı ayna adımından SONRA: iz hiçbir kapıdan önce yazılmıyor'],
]

function siraDenetle(adimlar: Adim[]): string[] {
  const ihlal: string[] = []
  const sira = (ad: string) => adimlar.findIndex((a) => a.ad === ad)
  const kapi = sira(KAPI_ADI)
  const aynaSira = sira(AYNA_ADIM_ADI)
  if (kapi >= 0 && aynaSira >= 0 && aynaSira < kapi) ihlal.push('ayna adımı PR kayıt kapısından ÖNCE: kapı her zaman ilk ve koşulsuz değerlendirilmeli')
  for (const ad of AGIR) {
    const i = sira(ad)
    if (aynaSira >= 0 && i >= 0 && i < aynaSira) ihlal.push(`AĞIR adım "${ad}" ayna adımından ÖNCE: koşul henüz hesaplanmamışken koşar`)
  }
  for (const [once, sonra, neden] of IZ_SIRASI) {
    const i = sira(once)
    const j = sira(sonra)
    if (i >= 0 && j >= 0 && j < i) ihlal.push(neden)
  }
  return ihlal
}

/** Adın içindeki `${{ steps.<id>.outputs.<anahtar> }}` başvurusu; yoksa null. */
function adBasvurusu(ad: string): { id: string; anahtar: string } | null {
  const m = /\$\{\{\s*steps\.([\w-]+)\.outputs\.([\w-]+)\s*\}\}/.exec(ad)
  return m ? { id: m[1], anahtar: m[2] } : null
}

/** Çalışma anında genişleyen ifadeyi (`${{ ... }}`) örnek bir 40 haneli SHA ile değiştirir: iz adının runner'da alacağı biçim. */
const ORNEK_SHA = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
const adiGenislet = (ad: string) => ad.replace(/\$\{\{[^}]*\}\}/g, ORNEK_SHA)

/**
 * B1 iz adımları: adı iz önekiyle başlayan adım TAM BİR tane; adı TAM şablon (önek betikten, `steps.<id>` taban adımının `id`'si);
 * şablon çalışma anında betiğin `izTabani`'sının OKUYABİLECEĞİ biçime dönüşür; taban adımı birinci ebeveyni okuyup çıktıya yazar.
 */
function izAdimlariniDenetle(adimlar: Adim[]): string[] {
  const ihlal: string[] = []
  const izler = adimlar.filter((a) => a.ad.startsWith(IZ_ADIM_ONEKI))
  if (izler.length !== 1) {
    ihlal.push(
      `adı \`${IZ_ADIM_ONEKI.trim()}\` ile başlayan adım TAM BİR tane olmalı (bulunan ${izler.length}): iz yoksa ayna kör kalır (hep TAM), ikinci/sahte iz varsa betik izi yok sayar ya da yanlış tabana güvenir`,
    )
  }
  const taban = adimlar.find((a) => a.ad === TABAN_ADI)
  const tabanId = taban?.anahtarlar.find((k) => k.anahtar === 'id')?.deger
  for (const iz of izler) {
    if (iz.ad !== IZ_ADI) ihlal.push(`iz adımının adı beklenen \`${IZ_ADI}\` şablonu değil (bulunan: \`${iz.ad}\`): ayna tabanı bu addan okur`)
    const b = adBasvurusu(iz.ad)
    if (!b) {
      ihlal.push(`iz adı taban adımının çıktısına (\`steps.<id>.outputs.<anahtar>\`) başvurmuyor (\`${iz.ad}\`): ad sabit/yanlış değer taşır`)
      continue
    }
    if (b.id !== tabanId) ihlal.push(`iz adındaki \`steps.${b.id}\` taban adımının id'siyle (${tabanId ?? 'yok'}) aynı değil: ad boş SHA ile oluşur, iz hiçbir koşuda eşleşmez`)
    const okunan = izTabani({ jobs: [{ name: 'ci', steps: [{ name: adiGenislet(iz.ad), conclusion: 'success' }] }] })
    if (okunan !== ORNEK_SHA) ihlal.push(`iz adı çalışma anında betiğin \`izTabani\`'sının okuyabileceği \`${IZ_ADIM_ONEKI}<40 hane>\` biçimine dönüşmüyor (bulunan: ${okunan ?? 'null'})`)
  }
  return ihlal
}

/** Taban adımının komutu (anlamsal; TAM eşitliğin ikinci savunması): birinci ebeveyn + çıktı anahtarı + `$GITHUB_OUTPUT`. */
function tabanRunDenetle(adimlar: Adim[]): string[] {
  const t = adimlar.find((a) => a.ad === TABAN_ADI)
  if (!t) return []
  const ihlal: string[] = []
  const run = t.anahtarlar.find((k) => k.anahtar === 'run')?.deger ?? ''
  const rev = /git rev-parse ([^\s)"]+)/.exec(run)
  if (!rev || rev[1] !== 'HEAD^1') {
    ihlal.push(`taban adımı merge-ref'in BİRİNCİ ebeveynini okumuyor (\`git rev-parse HEAD^1\` olmalı; bulunan: ${rev ? rev[1] : 'yok'}): HEAD birleşimin kendisi, HEAD^2 PR başıdır, ikisi de taban DEĞİLDİR`)
  }
  if (!run.includes('>> "$GITHUB_OUTPUT"')) ihlal.push('taban adımı SHA\'yı `>> "$GITHUB_OUTPUT"` ile yazmıyor: iz adı boş çıktıyı okur, iz yazılmaz')
  const iz = adimlar.find((a) => a.ad.startsWith(IZ_ADIM_ONEKI))
  const anahtar = (iz && adBasvurusu(iz.ad)?.anahtar) || TABAN_CIKTI
  if (!run.includes(`"${anahtar}=`)) ihlal.push(`taban adımı \`${anahtar}=\` anahtarını yazmıyor: iz adı \`steps.${TABAN_ID}.outputs.${anahtar}\` okur, çıktı boş kalır`)
  return ihlal
}

/** ayna `run` gövdesinin komut satırları: boş ve kabuk yorumu satırları atılmış, kırpılmış (yorumdaki komut sayılmaz). */
function komutSatirlari(govde: string): string[] {
  return govde
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '' && !s.startsWith('#'))
}

/**
 * B2 · ayna adımının `run` gövdesi (anlamsal; TAM eşitlikten BAĞIMSIZ ikinci savunma: eşitlik sabiti dikkatsizce güncellense de
 * şu değişmezler tutmalı): betik TABANDAN çıkar (HEAD^1), runner geçici dizinine yazılır, YALNIZ o kopya koşar (PR kopyası asla),
 * kopya yoksa dal `atla=false` yazıp `exit 0` ile biter, hiçbir yerde `atla=true` yazılmaz.
 */
function aynaRunDenetle(adimlar: Adim[]): string[] {
  const a = adimlar.find((x) => x.ad === AYNA_ADIM_ADI)
  if (!a) return []
  const ihlal: string[] = []
  let govde = runGovdesi(a)
  if (govde === null) {
    // eski tek satırlık biçim (`run: node scripts/ci/edited-ayna.cjs`) dahil: yine de komutu aşağıdaki değişmezlerle sına
    ihlal.push('ayna adımının `run:` gövdesi çok satırlı blok değil: tabandan kopya çıkarıp koşturan komut dizisi okunamadı')
    govde = a.anahtarlar.find((x) => x.anahtar === 'run')?.deger ?? ''
  }
  const k = komutSatirlari(govde)
  const gitShow = k.filter((s) => /\bgit\s+show\b/.test(s))
  if (gitShow.length !== 1) ihlal.push(`ayna gövdesinde TAM BİR \`git show\` olmalı (bulunan ${gitShow.length}): karar betiğinin kaynağı tek ve tabandır`)
  const gs = gitShow[0] ?? ''
  if (!gs.includes(`${GIT_SHOW} `)) {
    ihlal.push(`karar betiği \`${GIT_SHOW}\` ile TABANDAN çıkarılmıyor (PR'ın kendi kopyası ya da başka ebeveyn): PR betiği değiştirip kendi kırmızısını atlatır (B2)`)
  }
  if (!gs.includes(`> "${KOPYA}"`)) ihlal.push(`taban kopyası \`${KOPYA}\` yoluna yazılmıyor (runner geçici dizini; PR'ın çalışma ağacı olamaz)`)
  if (!/^if\s+!\s+git\s+show\b/.test(gs)) ihlal.push('`git show` `if !` ile korunmuyor: kopya VARKEN "kopya yok" dalına düşer ya da yokken boş dosya koşar')
  const nodeKomutlari = k.filter((s) => /(?:^|[;&|(]|\b(?:then|else|do))\s*node\s/.test(s))
  if (nodeKomutlari.some((s) => s.includes(AYNA_BETIGI))) {
    ihlal.push(`ayna gövdesi PR kopyasını koşturuyor (\`node ${AYNA_BETIGI}\`): karar betiğini PR belirler, PR betiği değiştirip kendi kırmızısını atlatır (B2)`)
  }
  if (!nodeKomutlari.some((s) => s === NODE_KOMUTU || s.startsWith(`${NODE_KOMUTU} `))) {
    ihlal.push(`ayna gövdesi tabandan çıkarılan kopyayı koşturmuyor (\`${NODE_KOMUTU}\` yok)`)
  }
  if (nodeKomutlari.length !== 1) ihlal.push(`ayna gövdesinde TAM BİR \`node\` komutu olmalı (bulunan ${nodeKomutlari.length}): ikinci komut karar çıktısını ezebilir`)
  const gsSira = k.findIndex((s) => /\bgit\s+show\b/.test(s))
  const fiSira = k.indexOf('fi')
  const nodeSira = k.findIndex((s) => nodeKomutlari.includes(s))
  if (gsSira < 0 || fiSira < gsSira) {
    ihlal.push('ayna gövdesinde `if ! git show ...; then ... fi` yapısı yok: taban kopyası yoksa ne olacağı belirsiz')
  } else {
    const dal = k.slice(gsSira + 1, fiSira)
    if (!dal.some((s) => s.includes('atla=false') && s.includes('"$GITHUB_OUTPUT"'))) {
      ihlal.push('taban kopyası yoksa dal `atla=false` yazmıyor (`>> "$GITHUB_OUTPUT"`): çıktı boş kalır, kopyasız koşu kararsız bırakılır')
    }
    if (dal[dal.length - 1] !== 'exit 0') ihlal.push('taban kopyası yoksa dal `exit 0` ile bitmiyor: boş/olmayan kopya koşturulur')
    if (nodeSira >= 0 && nodeSira < fiSira) ihlal.push('`node` komutu `fi`den ÖNCE: kopya yok dalında da koşar')
  }
  if (k.some((s) => /\batla=true\b/.test(s))) ihlal.push('ayna gövdesi `atla=true` yazıyor: ağır adımları atlatma kararı YALNIZ taban kopyası betiğinden gelir')
  return ihlal
}

/**
 * Betiğin `process.env`den okuduğu adlar: `const { A, B } = process.env` bildirimi VE `process.env.ADI` / `process.env['ADI']` erişimleri
 * (betik okuma biçimini değiştirse de karşılaştırma gereksiz kırılmasın). Hiç erişim bulunamazsa null: sessizce "uyumlu" sayılmaz.
 */
function betigiOkuyanOrtam(kaynak: string = AYNA_BETIGI_KAYNAK): string[] | null {
  const adlar = new Set<string>()
  const yapi = /const\s*\{([^}]*)\}\s*=\s*process\.env/.exec(kaynak)
  if (yapi) {
    for (const parca of yapi[1].split(',')) {
      const ad = parca.split(/[:=]/)[0].trim()
      if (ad) adlar.add(ad)
    }
  }
  for (const m of kaynak.matchAll(/process\.env\.([A-Za-z_]\w*)|process\.env\[\s*['"]([A-Za-z_]\w*)['"]\s*\]/g)) adlar.add(m[1] ?? m[2])
  return adlar.size > 0 ? [...adlar] : null
}

/** ci.yml ayna adımının verdiği ortam = betiğin okuduğu ortam (BASE_REF kalıntısı gibi ölü ayar ya da eksik besleme yok). */
function betikOrtamiDenetle(adimlar: Adim[]): string[] {
  const a = adimlar.find((x) => x.ad === AYNA_ADIM_ADI)
  if (!a) return []
  const okunan = betigiOkuyanOrtam()
  if (!okunan) return [`${AYNA_BETIGI} içinde \`const { ... } = process.env\` bildirimi bulunamadı: betik↔ci.yml ortam karşılaştırması yapılamadı`]
  const ihlal: string[] = []
  const verilen = [...a.env.keys()].filter((ad) => !BETIK_DISI_ORTAM.ciVerir.includes(ad))
  const beklenen = okunan.filter((ad) => !BETIK_DISI_ORTAM.runnerVerir.includes(ad))
  for (const ad of verilen) if (!beklenen.includes(ad)) ihlal.push(`ci.yml ayna adımı \`${ad}\` veriyor ama betik okumuyor (ölü ayar)`)
  for (const ad of beklenen) if (!verilen.includes(ad)) ihlal.push(`betik \`${ad}\` okuyor ama ci.yml ayna adımı vermiyor (boş gelir)`)
  return ihlal
}

function concurrencyDenetle(metin: string): string[] {
  const ihlal: string[] = []
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, 'concurrency')
  if (!b) return ['workflow düzeyi `concurrency:` bloğu yok: `edited` koşan TAM koşuyu iptal eder']
  const govde = satirlar
    .slice(b.bas + 1, b.bit)
    .filter(anlamli)
    .map((s) => degerTemizle(s))
  if (!govde.includes(CONCURRENCY[0])) ihlal.push('concurrency grubu `edited` için ayrı değil: düzenleme koşan TAM koşuyu iptal eder')
  if (!govde.includes(CONCURRENCY[1])) ihlal.push('cancel-in-progress: true yok')
  const fazla = govde.filter((s) => !CONCURRENCY.includes(s))
  if (fazla.length) ihlal.push(`concurrency bloğunda beklenmeyen satır: ${fazla.join(' ; ')}`)
  return ihlal
}

function izinleriDenetle(metin: string): string[] {
  const ihlal: string[] = []
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, 'permissions')
  if (!b) {
    ihlal.push('workflow düzeyi `permissions:` bloğu yok: GITHUB_TOKEN varsayılan (yazma dahil) yetkilerle çalışır')
  } else {
    const ust = degerTemizle(satirlar[b.bas].slice('permissions:'.length))
    if (ust !== '') ihlal.push(`\`permissions:\` satır içi değerle verilmiş (\`${ust}\`): izinler tek tek \`<izin>: read\` satırlarıyla yazılmalı`)
    const govde = satirlar
      .slice(b.bas + 1, b.bit)
      .filter(anlamli)
      .map((s) => degerTemizle(s))
    for (const izin of IZINLER) {
      if (govde.includes(izin)) continue
      ihlal.push(
        izin === 'actions: read'
          ? '`permissions: actions: read` yok: ayna önceki koşuları okuyamaz'
          : `\`permissions: ${izin}\` yok (contents: PUBLIC depoda varsayılanlar düşer; pull-requests: elle tetiklemede \`gh pr list\`)`,
      )
    }
    for (const s of govde) {
      if (!IZINLER.includes(s)) ihlal.push(`permissions içinde beklenmeyen satır \`${s}\`: izinler EN AZ yetkiyle, yalnız ${IZINLER.join(', ')}`)
    }
  }
  // yazma yetkisi HİÇBİR biçimde olmamalı: `contents: write`, `write-all` (blok ya da iş düzeyi), satır içi harita
  const yazma = yorumsuz(satirlar).filter((s) => /:\s*write(?:-all)?\s*$/.test(s) || /^\s*permissions:.*\bwrite(?:-all)?\b/.test(s))
  if (yazma.length) ihlal.push(`ci.yml yazma yetkisi içeriyor: ${yazma.map((s) => s.trim()).join(', ')}`)
  return ihlal
}

/** `ci` işinin kendisi: atlanamaz (job düzeyi `if` yok), yetkisi/sonucu değişmez, zaman aşımı ve kabuk sabit. */
function isDuzeyiniDenetle(metin: string): string[] {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  if (!is) return ['`jobs.ci` işi ci.yml içinde bulunamadı: job düzeyi denetimler yapılamaz (iş kimliği değişirse zorunlu kontrol adı kaybolur)']
  const ihlal: string[] = []
  const anahtarlar = isAnahtarlari(metin)
  for (const k of anahtarlar) {
    if (IS_ANAHTARLARI.includes(k.anahtar)) continue
    if (k.anahtar === 'if') {
      ihlal.push(
        `ci işinde job düzeyi \`if:\` var (\`${k.deger}\`): koşul sağlanmazsa iş ATLANIR, GitHub atlanan zorunlu kontrolü BAŞARILI sayar ve hiçbir şey koşmadan \`ci\` yeşil görünür`,
      )
    } else if (k.anahtar === 'permissions') {
      ihlal.push(`ci işinde job düzeyi \`permissions\` var (\`${k.deger}\`): izinler yalnız workflow düzeyindeki en az yetki bloğundan gelir`)
    } else if (k.anahtar === 'continue-on-error') {
      ihlal.push(`ci işinde job düzeyi \`continue-on-error\` var (\`${k.deger}\`): iş kırmızı olsa da çalıştırma yeşil kalabilir`)
    } else {
      ihlal.push(`ci işinde beklenmeyen job düzeyi anahtar \`${k.anahtar}\`: iş atlanabilir ya da sonucu değişebilir; bilinçle listeye eklenir (${IS_ANAHTARLARI.join(', ')})`)
    }
  }
  for (const gerekli of IS_ANAHTARLARI) {
    if (!anahtarlar.some((k) => k.anahtar === gerekli)) ihlal.push(`ci işinde \`${gerekli}\` yok`)
  }
  const sure = anahtarlar.filter((k) => k.anahtar === 'timeout-minutes')
  if (sure.length !== 1 || `timeout-minutes: ${sure[0].deger}` !== ZAMAN_ASIMI) {
    ihlal.push('timeout-minutes edited için 30, diğerleri için 15 olmalı (ayna tam koşuyu bekleyebilir ve gerekirse paketin tamamını koşar)')
  }
  const varsayilan = anahtarlar.find((k) => k.anahtar === 'defaults')
  if (varsayilan) {
    const sonraki = anahtarlar.find((k) => k.no > varsayilan.no)
    const govde = satirlar
      .slice(varsayilan.no + 1, sonraki ? sonraki.no : is.bit)
      .filter(anlamli)
      .map((s) => degerTemizle(s))
    if (govde.join('|') !== 'run:|shell: bash') {
      ihlal.push('ci işinin `defaults.run.shell: bash` bloğu bozuk: açık bash pipefail açar; yoksa `| tee` boru hatlarının çıkış kodu tee\'den gelir ve kapılar BLOKLAMAZ')
    }
  } else {
    ihlal.push('ci işinde `defaults.run.shell: bash` yok: açık bash pipefail açar; yoksa `| tee` boru hatlarının çıkış kodu tee\'den gelir ve kapılar BLOKLAMAZ')
  }
  return ihlal
}

function tetikleyicileriDenetle(metin: string): string[] {
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, 'on')
  if (!b) return ['workflow düzeyi `on:` bloğu yok: ci hiç tetiklenmez']
  const govde = satirlar.slice(b.bas + 1, b.bit)
  const pr = govde.findIndex((s) => s.trimEnd() === '  pull_request:')
  if (pr < 0) return ['`on.pull_request` yok: PR koşusu (ve `edited` aynası) hiç başlamaz']
  let bulunan: string[] | null = null
  for (let i = pr + 1; i < govde.length; i++) {
    if (!anlamli(govde[i])) continue
    if (girinti(govde[i]) <= 2) break
    const m = /^ {4}types:\s*(.*)$/.exec(govde[i])
    if (m) {
      const deger = degerTemizle(m[1])
      if (deger.startsWith('[') && deger.endsWith(']')) {
        bulunan = deger
          .slice(1, -1)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .sort()
      }
      break
    }
  }
  if (!bulunan) return ['`on.pull_request.types` satır içi liste olarak okunamadı (`types: [a, b]` biçimi beklenir)']
  if (bulunan.join(',') !== TURLER.join(',')) {
    return [
      `pull_request türleri {${TURLER.join(', ')}} olmalı, bulunan {${bulunan.join(', ')}}: \`edited\` düşerse ayna ve kayıt kapısı gövde düzenlemesinde koşmaz; varsayılan türler düşerse yeni commit CI başlatmaz`,
    ]
  }
  return []
}

function denetle(metin: string): string[] {
  const adimlar = adimlariAyir(metin)
  return [
    ...siniflandirmaDenetle(adimlar),
    ...agirAdimlariDenetle(adimlar),
    ...hepKosanAdimlariDenetle(adimlar),
    ...siraDenetle(adimlar),
    ...izAdimlariniDenetle(adimlar),
    ...tabanRunDenetle(adimlar),
    ...aynaRunDenetle(adimlar),
    ...betikOrtamiDenetle(adimlar),
    ...concurrencyDenetle(metin),
    ...izinleriDenetle(metin),
    ...isDuzeyiniDenetle(metin),
    ...tetikleyicileriDenetle(metin),
  ]
}

// ── BOZUCULAR (çapasız: adımı/anahtarı ADIYLA bulur, satırı BÜTÜNÜYLE yazar) ──────────────────────────────────────────

function adimiBul(metin: string, ad: string): Adim | undefined {
  return adimlariAyir(metin).find((x) => x.ad === ad)
}

// Bozucular hedefi yoksa metni DEĞİŞTİRMEDEN döner (ci.yml başka bir sabotajla zaten bozulmuş olabilir: fikstür fırlatıp yanlış
// sebepten kırmızı üretmesin). Temiz ci.yml'de hedefin bulunduğu, her testteki `bozuk !== ci` doğrulamasıyla ayrıca sabittir.

/** Adımın bir anahtar satırını bütünüyle yeniden yazar (`yeni=null`: satırı siler). */
function adimAnahtariniYaz(metin: string, adim: string, anahtar: string, yeni: string | null): string {
  const a = adimiBul(metin, adim)
  const k = a?.anahtarlar.find((x) => x.anahtar === anahtar)
  if (!a || !k) return metin
  const satirlar = metin.split('\n')
  if (yeni === null) satirlar.splice(k.no, 1)
  else satirlar[k.no] = `${k.no === a.bas ? '      - ' : '        '}${yeni}`
  return satirlar.join('\n')
}

/** Adıma ek bir anahtar satırı ekler (adın hemen altına). */
function adimaAnahtarEkle(metin: string, adim: string, satir: string): string {
  const a = adimiBul(metin, adim)
  if (!a) return metin
  const satirlar = metin.split('\n')
  satirlar.splice(a.bas + 1, 0, `        ${satir}`)
  return satirlar.join('\n')
}

/** Adımdan ÖNCE tam satırlar ekler (yeni adım eklemek için). */
function adimOncesineEkle(metin: string, adim: string, yeniSatirlar: string[]): string {
  const a = adimiBul(metin, adim)
  if (!a) return metin
  const satirlar = metin.split('\n')
  satirlar.splice(a.bas, 0, ...yeniSatirlar)
  return satirlar.join('\n')
}

/** Adımın `env:` ya da `with:` altındaki girdisini yazar (`deger=null`: siler; yoksa blok başlığının altına ekler). */
function adimBloguYaz(metin: string, adim: string, blok: 'env' | 'with', ad: string, deger: string | null): string {
  const a = adimiBul(metin, adim)
  const baslik = a?.anahtarlar.find((k) => k.anahtar === blok)
  if (!a || !baslik) return metin
  const satirlar = metin.split('\n')
  const i = satirlar.findIndex((s, n) => n > baslik.no && n < a.bas + a.satirlar.length && s.startsWith(`          ${ad}:`))
  if (i >= 0) {
    if (deger === null) satirlar.splice(i, 1)
    else satirlar[i] = `          ${ad}: ${deger}`
  } else if (deger !== null) {
    satirlar.splice(baslik.no + 1, 0, `          ${ad}: ${deger}`)
  }
  return satirlar.join('\n')
}
const adimEnviniYaz = (metin: string, adim: string, ad: string, deger: string | null) => adimBloguYaz(metin, adim, 'env', ad, deger)
const adimGirdisiniYaz = (metin: string, adim: string, ad: string, deger: string | null) => adimBloguYaz(metin, adim, 'with', ad, deger)

/**
 * Adımın (çok satırlı `run` gövdesi dahil) KIRPILMIŞ içeriği `eski` olan İLK satırını bütünüyle yeniden yazar; girinti korunur,
 * `yeni=null` satırı siler. Satır yoksa metni DEĞİŞTİRMEDEN döner (başka bir sabotajla zaten bozulmuş olabilir).
 */
function adimSatiriniYaz(metin: string, adim: string, eski: string, yeni: string | null): string {
  const a = adimiBul(metin, adim)
  if (!a) return metin
  const satirlar = metin.split('\n')
  const i = satirlar.findIndex((s, n) => n >= a.bas && n < a.bas + a.satirlar.length && s.trim() === eski)
  if (i < 0) return metin
  if (yeni === null) satirlar.splice(i, 1)
  else satirlar[i] = `${satirlar[i].slice(0, girinti(satirlar[i]))}${yeni}`
  return satirlar.join('\n')
}

/** Adımı (kendi ardışık satır bloğuyla) `hedef` adımının ÖNÜNE (`once`) ya da SONRASINA (`sonra`) taşır. Adım ya da hedef yoksa metin değişmez. */
function adimiTasi(metin: string, adim: string, hedef: string, yer: 'once' | 'sonra'): string {
  const a = adimiBul(metin, adim)
  const h = adimiBul(metin, hedef)
  if (!a || !h || a.bas === h.bas) return metin
  const satirlar = metin.split('\n')
  const blok = satirlar.slice(a.bas, a.bas + a.satirlar.length)
  satirlar.splice(a.bas, blok.length)
  const hedefBas = h.bas > a.bas ? h.bas - blok.length : h.bas
  satirlar.splice(yer === 'once' ? hedefBas : hedefBas + h.satirlar.length, 0, ...blok)
  return satirlar.join('\n')
}

/** Adımın `run:` anahtarını ve (blok ise) gövdesini bütünüyle HAZIR `yeni` satırlarla (girintisi dahil) değiştirir. */
function adimRunBlogunuDegistir(metin: string, adim: string, yeni: string[]): string {
  const a = adimiBul(metin, adim)
  const r = a?.anahtarlar.find((k) => k.anahtar === 'run')
  if (!a || !r) return metin
  const satirlar = metin.split('\n')
  let son = r.no + 1
  if (/^[|>][-+]?$/.test(r.deger)) {
    while (son < a.bas + a.satirlar.length && (bosMu(satirlar[son]) || girinti(satirlar[son]) > 8)) son++
    // gövdenin sonundaki boş satırlar adımlar arası boşluktur, gövdeye ait değil
    while (son > r.no + 1 && bosMu(satirlar[son - 1])) son--
  }
  satirlar.splice(r.no, son - r.no, ...yeni)
  return satirlar.join('\n')
}

/** Adımı (kendi satır bloğuyla) siler. */
function adimiSil(metin: string, adim: string): string {
  const a = adimiBul(metin, adim)
  if (!a) return metin
  const satirlar = metin.split('\n')
  satirlar.splice(a.bas, a.satirlar.length)
  return satirlar.join('\n')
}

/** `ci` işine job düzeyi bir anahtar ekler: `once` verilen job anahtarının ÖNÜNE, yoksa `ci:` satırının hemen altına. */
function isaAnahtarEkle(metin: string, satir: string, once?: string): string {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  if (!is) return metin
  let konum = is.bas + 1
  if (once) {
    const k = isAnahtarlari(metin).find((x) => x.anahtar === once)
    if (!k) return metin
    konum = k.no
  }
  satirlar.splice(konum, 0, `    ${satir}`)
  return satirlar.join('\n')
}

/** Job düzeyi bir anahtarı ALT SATIRLARIYLA siler. */
function isAnahtariniSil(metin: string, anahtar: string): string {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  const anahtarlar = isAnahtarlari(metin)
  const k = anahtarlar.find((x) => x.anahtar === anahtar)
  if (!is || !k) return metin
  const sonraki = anahtarlar.find((x) => x.no > k.no)
  satirlar.splice(k.no, (sonraki ? sonraki.no : is.bit) - k.no)
  return satirlar.join('\n')
}

/** `ci` işi İÇİNDE kırpılmış içeriği `eski` olan ilk satırı bütünüyle yeniden yazar. */
function isIciSatiriYaz(metin: string, eski: string, yeni: string): string {
  const satirlar = metin.split('\n')
  const is = isBolumu(satirlar, 'ci')
  const i = is ? satirlar.findIndex((s, n) => n > is.bas && n < is.bit && s.trim() === eski) : -1
  if (i < 0) return metin
  satirlar[i] = yeni
  return satirlar.join('\n')
}

/** Üst düzey bölümün (concurrency/on/permissions) gövdesinde kırpılmış hâli `onEk` ile başlayan İLK satırı yeniden yazar. */
function ustSatiriYaz(metin: string, bolum: string, onEk: string, yeni: string | null): string {
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, bolum)
  const i = b ? satirlar.findIndex((s, n) => n > b.bas && n < b.bit && s.trim().startsWith(onEk)) : -1
  if (i < 0) return metin
  if (yeni === null) satirlar.splice(i, 1)
  else satirlar[i] = yeni
  return satirlar.join('\n')
}

/** Üst düzey `permissions:` bölümünü yeniden yazar: başlık değeri `ust`, çocuk satırlar `yeni` (yorumlar yerinde kalır). */
function izinleriYaz(metin: string, yeni: string[], ust = ''): string {
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, 'permissions')
  if (!b) return metin
  const kalan = satirlar.slice(b.bas + 1, b.bit).filter((s) => !anlamli(s))
  satirlar.splice(b.bas, b.bit - b.bas, ust ? `permissions: ${ust}` : 'permissions:', ...yeni.map((s) => `  ${s}`), ...kalan)
  return satirlar.join('\n')
}

/** Üst düzey bölümü (başlık + gövde) tümüyle siler. */
function ustBolumuSil(metin: string, bolum: string): string {
  const satirlar = metin.split('\n')
  const b = ustBolum(satirlar, bolum)
  if (!b) return metin
  satirlar.splice(b.bas, b.bit - b.bas)
  return satirlar.join('\n')
}

// ── SABOTAJ TABLOSU: bozulma TÜRLERİ (her satır `denetle()`nin belirli bir denetimine bağlıdır) ──────────────────────────

interface Bozulma {
  ad: string
  boz: (ci: string) => string
  /** `denetle()` çıktısında GEÇMESİ gereken parçalar: HANGİ denetim yakaladı, burada sabitlenir (yanlış sebepten kırmızı olmaz). */
  beklenen: readonly string[]
}

const KAPI_KOSULU_BOZUK = "if: github.event_name == 'pull_request' && github.event.action != 'edited'"

const BOZULMALAR: readonly Bozulma[] = [
  // ── `ci` işinin KENDİSİ atlanır/yetkisi değişir: GitHub atlanan işi BAŞARILI sayar ─────────────────────────────────────
  { ad: "job düzeyi `if: github.event.action != 'edited'` (ilk anahtar)", boz: (c) => isaAnahtarEkle(c, "if: github.event.action != 'edited'"), beklenen: ['job düzeyi `if:`'] },
  { ad: 'job düzeyi `if` ${{ }} biçimiyle, zaman aşımından önce', boz: (c) => isaAnahtarEkle(c, "if: ${{ github.event.action != 'edited' }}", 'timeout-minutes'), beklenen: ['job düzeyi `if:`'] },
  { ad: 'job düzeyi `if: always()` (steps öncesi)', boz: (c) => isaAnahtarEkle(c, 'if: always()', 'steps'), beklenen: ['job düzeyi `if:`'] },
  { ad: 'job düzeyi `continue-on-error: true`', boz: (c) => isaAnahtarEkle(c, 'continue-on-error: true'), beklenen: ['job düzeyi `continue-on-error`'] },
  { ad: 'job düzeyi `needs:`', boz: (c) => isaAnahtarEkle(c, 'needs: [baska-is]'), beklenen: ['beklenmeyen job düzeyi anahtar `needs`'] },
  { ad: 'job düzeyi `permissions: write-all`', boz: (c) => isaAnahtarEkle(c, 'permissions: write-all'), beklenen: ['job düzeyi `permissions`', 'yazma yetkisi'] },
  { ad: 'job `timeout-minutes` silinir', boz: (c) => isAnahtariniSil(c, 'timeout-minutes'), beklenen: ['ci işinde `timeout-minutes` yok', 'timeout-minutes edited için 30'] },
  { ad: 'job `timeout-minutes` 30 yerine 15 olur', boz: (c) => isIciSatiriYaz(c, ZAMAN_ASIMI, '    timeout-minutes: 15'), beklenen: ['timeout-minutes edited için 30'] },
  { ad: 'job `defaults.run.shell: bash` silinir (pipefail düşer)', boz: (c) => isAnahtariniSil(c, 'defaults'), beklenen: ['ci işinde `defaults` yok', 'defaults.run.shell: bash'] },
  { ad: 'job `defaults.run.shell` bash yerine sh olur', boz: (c) => isIciSatiriYaz(c, 'shell: bash', '        shell: sh'), beklenen: ['defaults.run.shell: bash'] },

  // ── izinler: EN AZ yetki, tam eşitlik ────────────────────────────────────────────────────────────────────────────
  { ad: 'workflow düzeyi `permissions: write-all`', boz: (c) => izinleriYaz(c, [], 'write-all'), beklenen: ['yazma yetkisi', '`permissions:` satır içi değerle'] },
  { ad: 'workflow düzeyi `permissions: { contents: write }` (satır içi harita)', boz: (c) => izinleriYaz(c, [], '{ contents: write }'), beklenen: ['yazma yetkisi'] },
  { ad: '`permissions` bloğuna `id-token: write` eklenir', boz: (c) => izinleriYaz(c, [...IZINLER, 'id-token: write']), beklenen: ['yazma yetkisi', 'beklenmeyen satır'] },
  { ad: '`permissions` bloğuna ek OKUMA izni (security-events: read)', boz: (c) => izinleriYaz(c, [...IZINLER, 'security-events: read']), beklenen: ['permissions içinde beklenmeyen satır `security-events: read`'] },
  { ad: '`pull-requests: read` düşer', boz: (c) => izinleriYaz(c, IZINLER.filter((i) => i !== 'pull-requests: read')), beklenen: ['`permissions: pull-requests: read` yok'] },
  { ad: '`contents: read` düşer (public depoda checkout kırılır)', boz: (c) => izinleriYaz(c, IZINLER.filter((i) => i !== 'contents: read')), beklenen: ['`permissions: contents: read` yok'] },
  { ad: '`actions: read` yerine `actions: write`', boz: (c) => izinleriYaz(c, IZINLER.map((i) => (i === 'actions: read' ? 'actions: write' : i))), beklenen: ['yazma yetkisi', '`permissions: actions: read` yok'] },
  { ad: '`permissions` bloğu hiç yok (varsayılan jeton yetkileri)', boz: (c) => ustBolumuSil(c, 'permissions'), beklenen: ['`permissions:` bloğu yok'] },

  // ── PR kayıt kapısı: en ağır bozulma ─────────────────────────────────────────────────────────────────────────────
  { ad: 'kayıt kapısına `&& github.event.action != \'edited\'` (steps.ayna DIŞI koşul)', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'if', KAPI_KOSULU_BOZUK), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" atlama koşulu taşıyor`] },
  { ad: 'kayıt kapısına `|| always()` kuyruğu', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'if', "if: github.event_name == 'pull_request' || always()"), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" atlama koşulu taşıyor`] },
  { ad: 'kayıt kapısından `if:` silinir (push/master kapıyı boş gövdeyle koşar)', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'if', null), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" beklenen`, 'koşulunu taşımıyor'] },
  { ad: 'kayıt kapısına ikinci `if:` satırı', boz: (c) => adimaAnahtarEkle(c, KAPI_ADI, "if: github.event.action != 'edited'"), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" atlama koşulu taşıyor`] },
  { ad: 'kayıt kapısına `continue-on-error: true` (if satırı aynen durur)', boz: (c) => adimaAnahtarEkle(c, KAPI_ADI, 'continue-on-error: true'), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" continue-on-error taşıyor`] },
  { ad: 'kayıt kapısı `run` satırına `|| true`', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'run', 'run: node scripts/board/pr-kayit-kapisi.cjs || true'), beklenen: [`HEP KOŞAN adım "${KAPI_ADI}" run komutu hatayı yutuyor`, 'run satırı beklenen TAM'] },
  { ad: 'kayıt kapısı `run` satırı `; true` ile biter', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'run', 'run: node scripts/board/pr-kayit-kapisi.cjs; true'), beklenen: ['run komutu hatayı yutuyor'] },
  { ad: 'kayıt kapısı başka betiği koşar', boz: (c) => adimAnahtariniYaz(c, KAPI_ADI, 'run', 'run: node scripts/board/pr-kayit-kapisi-eski.cjs'), beklenen: ['run satırı beklenen TAM'] },
  { ad: 'kayıt kapısı `PR_YAZAR` bot muafiyetine sabitlenir (kapı hiçbir PR\'da kırmızı vermez)', boz: (c) => adimEnviniYaz(c, KAPI_ADI, 'PR_YAZAR', 'dependabot[bot]'), beklenen: ['PR_YAZAR değeri beklenen değil'] },
  { ad: 'kayıt kapısı `PR_GOVDE` boşaltılır', boz: (c) => adimEnviniYaz(c, KAPI_ADI, 'PR_GOVDE', "''"), beklenen: ['PR_GOVDE değeri beklenen değil'] },
  { ad: 'kayıt kapısına beklenmeyen anahtar (timeout-minutes)', boz: (c) => adimaAnahtarEkle(c, KAPI_ADI, 'timeout-minutes: 1'), beklenen: ['beklenmeyen anahtar `timeout-minutes`'] },

  // ── diğer hep koşan adımlar ─────────────────────────────────────────────────────────────────────────────────────
  { ad: 'Checkout adımına `if:` girer', boz: (c) => adimaAnahtarEkle(c, 'Checkout', "if: github.event_name != 'pull_request'"), beklenen: ['HEP KOŞAN adım "Checkout" atlama koşulu taşıyor'] },
  { ad: 'Setup Node adımına `continue-on-error: true`', boz: (c) => adimaAnahtarEkle(c, 'Setup Node', 'continue-on-error: true'), beklenen: ['HEP KOŞAN adım "Setup Node" continue-on-error taşıyor'] },
  { ad: 'Merge-ref adımı koşulunu yitirir (her olayda koşar)', boz: (c) => adimAnahtariniYaz(c, 'Merge-ref çözümle (yalnız elle tetiklemede)', 'if', null), beklenen: ['koşulunu taşımıyor'] },
  { ad: 'ayna adımına `continue-on-error: true`', boz: (c) => adimaAnahtarEkle(c, AYNA_ADIM_ADI, 'continue-on-error: true'), beklenen: ['HEP KOŞAN adım "edited ayna kararı" continue-on-error taşıyor'] },
  { ad: 'ayna adımı koşulu `edited` ile sınırlı değil', boz: (c) => adimAnahtariniYaz(c, AYNA_ADIM_ADI, 'if', "if: github.event_name == 'pull_request'"), beklenen: ['HEP KOŞAN adım "edited ayna kararı" atlama koşulu taşıyor'] },
  { ad: 'ayna `run` gövdesinin son komutuna `|| true` (betik hatası yutulur)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, `${NODE_KOMUTU} || true`), beklenen: ['run komutu hatayı yutuyor', 'run gövdesi beklenen TAM gövde değil'] },

  // ── ALT-39 · döküm kapısı: ayna koşusunda DA koşar, koşulsuz, hata yutmaz, betiği değişmez ─────────────────────────────
  { ad: 'döküm kapısına ayna koşulu girer (edited koşusunda sızıntı kapısı atlanır)', boz: (c) => adimaAnahtarEkle(c, DOKUM_KAPISI_ADI, KOSUL), beklenen: [`HEP KOŞAN adım "${DOKUM_KAPISI_ADI}" atlama koşulu taşıyor`] },
  { ad: "döküm kapısına `if: github.event_name != 'pull_request'` (PR'da hiç koşmaz)", boz: (c) => adimaAnahtarEkle(c, DOKUM_KAPISI_ADI, "if: github.event_name != 'pull_request'"), beklenen: [`HEP KOŞAN adım "${DOKUM_KAPISI_ADI}" atlama koşulu taşıyor`] },
  { ad: 'döküm kapısına `continue-on-error: true` (kırmızı kapı işi yeşil bırakır)', boz: (c) => adimaAnahtarEkle(c, DOKUM_KAPISI_ADI, 'continue-on-error: true'), beklenen: [`HEP KOŞAN adım "${DOKUM_KAPISI_ADI}" continue-on-error taşıyor`] },
  { ad: 'döküm kapısı `run` satırı hatayı yutar (`|| true`)', boz: (c) => adimAnahtariniYaz(c, DOKUM_KAPISI_ADI, 'run', `${DOKUM_KAPISI_RUN} || true`), beklenen: ['run komutu hatayı yutuyor', 'run satırı beklenen TAM'] },
  { ad: 'döküm kapısı başka betiği koşturur (kapı değil)', boz: (c) => adimAnahtariniYaz(c, DOKUM_KAPISI_ADI, 'run', 'run: node scripts/security/baska-betik.cjs'), beklenen: ['run satırı beklenen TAM'] },
  { ad: 'döküm kapısına beklenmeyen anahtar (timeout-minutes)', boz: (c) => adimaAnahtarEkle(c, DOKUM_KAPISI_ADI, 'timeout-minutes: 1'), beklenen: ['beklenmeyen anahtar `timeout-minutes`'] },
  { ad: 'döküm kapısı adımı silinir', boz: (c) => adimiSil(c, DOKUM_KAPISI_ADI), beklenen: [`adım "${DOKUM_KAPISI_ADI}" ci.yml içinde yok`] },

  // ── ağır adımlar: `if:` SATIR eşitliği ─────────────────────────────────────────────────────────────────────────────
  { ad: "Test koşuluna `|| always()` kuyruğu (alt-dize durur)", boz: (c) => adimAnahtariniYaz(c, 'Test', 'if', `${KOSUL} || always()`), beklenen: ['AĞIR adım "Test" atlama koşulu TAM eşit değil'] },
  { ad: "Type check koşuluna `&& github.event_name != 'pull_request'` (PR'da hiç koşmaz)", boz: (c) => adimAnahtariniYaz(c, 'Type check', 'if', `${KOSUL} && github.event_name != 'pull_request'`), beklenen: ['AĞIR adım "Type check" atlama koşulu TAM eşit değil'] },
  { ad: 'Install dependencies koşulu başka adımın çıktısına bakar', boz: (c) => adimAnahtariniYaz(c, 'Install dependencies', 'if', "if: steps.mergeref.outputs.atla != 'true'"), beklenen: ['AĞIR adım "Install dependencies" atlama koşulu TAM eşit değil'] },
  { ad: 'Build adımına ikinci `if:` satırı', boz: (c) => adimaAnahtarEkle(c, 'Build (blocking)', "if: github.event_name != 'pull_request'"), beklenen: ['AĞIR adım "Build (blocking)" atlama koşulu TAM eşit değil'] },
  { ad: 'Build koşulu silinir', boz: (c) => adimAnahtariniYaz(c, 'Build (blocking)', 'if', null), beklenen: ['AĞIR adım "Build (blocking)" atlama koşulu taşımıyor'] },
  { ad: 'Build adımına `continue-on-error: true`', boz: (c) => adimaAnahtarEkle(c, 'Build (blocking)', 'continue-on-error: true'), beklenen: ['AĞIR adım "Build (blocking)" continue-on-error taşıyor'] },
  { ad: 'Lint `run` satırına `|| true` (tek satırlık ağır adım hatayı yutar)', boz: (c) => adimAnahtariniYaz(c, 'Lint (blocking)', 'run', 'run: pnpm run lint 2>&1 | tee ci-lint.log || true'), beklenen: ['AĞIR adım "Lint (blocking)" run komutu hatayı yutuyor'] },
  { ad: 'Test `run` satırına `|| :`', boz: (c) => adimAnahtariniYaz(c, 'Test', 'run', 'run: pnpm test -- --run --reporter=dot 2>&1 | tee ci-test.log || :'), beklenen: ['AĞIR adım "Test" run komutu hatayı yutuyor'] },

  // ── ayna adımının ortam değişkenleri: DEĞERLER tam eşitlik ─────────────────────────────────────────────────────────
  { ad: 'ayna HEAD_SHA = github.sha (merge SHA)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'HEAD_SHA', '${{ github.sha }}'), beklenen: ['ayna adımında HEAD_SHA değeri beklenen değil'] },
  // `BASE_REF` KALKTI (taban artık tarihle/dal adıyla değil taban izinin SHA'sıyla kıyaslanır): geri gelmesi ölü ayar + eski tasarıma dönüştür.
  { ad: 'ayna adımına geri `BASE_REF` eklenir (eski tasarım: dal adı kıyası; betik artık okumaz)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'BASE_REF', '${{ github.event.pull_request.base.ref }}'), beklenen: ['ayna adımında beklenmeyen ortam değişkeni BASE_REF', 'veriyor ama betik okumuyor'] },
  { ad: 'ayna `BASE_REF` başka değerle (head.ref) geri gelir', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'BASE_REF', '${{ github.event.pull_request.head.ref }}'), beklenen: ['ayna adımında beklenmeyen ortam değişkeni BASE_REF'] },
  { ad: 'ayna `TABAN_DEGISTI` düşer (taban dalı değişse de ayna önceki koşuya güvenir)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'TABAN_DEGISTI', null), beklenen: ['ayna adımında TABAN_DEGISTI ortam değişkeni yok', 'okuyor ama ci.yml ayna adımı vermiyor'] },
  { ad: 'ayna `TABAN_DEGISTI` ifadesi `changes.base` yerine `changes.title` (bayrak taban değişiminde yanmaz)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'TABAN_DEGISTI', "${{ github.event.changes.title && 'true' || '' }}"), beklenen: ['ayna adımında TABAN_DEGISTI değeri beklenen değil'] },
  { ad: "ayna `TABAN_DEGISTI` 'true' yerine 'false' (bayrak hiç yanmaz)", boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'TABAN_DEGISTI', "${{ github.event.changes.base && 'false' || '' }}"), beklenen: ['ayna adımında TABAN_DEGISTI değeri beklenen değil'] },
  { ad: 'ayna `TABAN_DEGISTI` sabit boş dize (bayrak hiç yanmaz)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'TABAN_DEGISTI', "''"), beklenen: ['ayna adımında TABAN_DEGISTI değeri beklenen değil'] },
  { ad: 'ayna KOSU_ID = run_number (run_id değil)', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'KOSU_ID', '${{ github.run_number }}'), beklenen: ['ayna adımında KOSU_ID değeri beklenen değil'] },
  { ad: 'ayna DEPO başka depoya bakar', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'DEPO', 'baska/depo'), beklenen: ['ayna adımında DEPO değeri beklenen değil'] },
  { ad: 'ayna GH_TOKEN boşaltılır', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'GH_TOKEN', "''"), beklenen: ['ayna adımında GH_TOKEN değeri beklenen değil'] },
  { ad: 'ayna KOSU_ID silinir', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'KOSU_ID', null), beklenen: ['ayna adımında KOSU_ID ortam değişkeni yok'] },
  { ad: 'ayna adımına fazladan ortam değişkeni', boz: (c) => adimEnviniYaz(c, AYNA_ADIM_ADI, 'GITHUB_OUTPUT', '/dev/null'), beklenen: ['ayna adımında beklenmeyen ortam değişkeni GITHUB_OUTPUT'] },

  // ── B1 · TABAN SHA'sı adımı: `HEAD^1`, `$GITHUB_OUTPUT`, çıktı anahtarı, koşul ──────────────────────────────────────────
  { ad: "Taban SHA'sı adımının `id` satırı düşer (iz adı çıktıyı okuyamaz)", boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'id', null), beklenen: [`HEP KOŞAN adım "${TABAN_ADI}" \`id: ${TABAN_ID}\` satırı yok`, "taban adımının id'siyle (yok) aynı değil"] },
  { ad: 'taban `git rev-parse HEAD^1` yerine `HEAD` (birleşimin kendisi taban sanılır, yanlış atlatır)', boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'run', 'run: echo "sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"'), beklenen: ['BİRİNCİ ebeveynini okumuyor', 'run satırı beklenen TAM'] },
  { ad: 'taban `git rev-parse HEAD^2` (PR başı taban sanılır)', boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'run', 'run: echo "sha=$(git rev-parse HEAD^2)" >> "$GITHUB_OUTPUT"'), beklenen: ['BİRİNCİ ebeveynini okumuyor'] },
  { ad: 'taban `origin/master` okur (kayan referans: koşu sırasında ilerler)', boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'run', 'run: echo "sha=$(git rev-parse origin/master)" >> "$GITHUB_OUTPUT"'), beklenen: ['BİRİNCİ ebeveynini okumuyor'] },
  { ad: 'taban SHA\'sı `$GITHUB_OUTPUT`a yazılmaz (iz adı boş çıktıyı okur)', boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'run', 'run: echo "sha=$(git rev-parse HEAD^1)"'), beklenen: ['ile yazmıyor', 'run satırı beklenen TAM'] },
  { ad: 'taban çıktı anahtarı `sha` yerine `base` (iz adı `outputs.sha` okur, boş kalır)', boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'run', 'run: echo "base=$(git rev-parse HEAD^1)" >> "$GITHUB_OUTPUT"'), beklenen: ['`sha=` anahtarını yazmıyor'] },
  { ad: "Taban SHA'sı adımından `if:` silinir (push/master koşusunda da koşar)", boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'if', null), beklenen: [`HEP KOŞAN adım "${TABAN_ADI}" beklenen`, 'koşulunu taşımıyor'] },
  { ad: "Taban SHA'sı adımına `edited` koşulu eklenir (tam koşuda iz yazılmaz: ayna kör kalır)", boz: (c) => adimAnahtariniYaz(c, TABAN_ADI, 'if', `${PR_KOSULU} && github.event.action == 'edited'`), beklenen: [`HEP KOŞAN adım "${TABAN_ADI}" atlama koşulu taşıyor`] },
  { ad: "Taban SHA'sı adımına `continue-on-error: true`", boz: (c) => adimaAnahtarEkle(c, TABAN_ADI, 'continue-on-error: true'), beklenen: [`HEP KOŞAN adım "${TABAN_ADI}" continue-on-error taşıyor`] },

  // ── B1 · İZ adımı: ad (şablon, önek, SHA kaynağı), koşul, anahtar kümesi, tekillik ───────────────────────────────────────
  { ad: 'iz adımının adı `taban izi`nden `taban`a düşer (önek bozulur, ayna izi tanımaz)', boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'name', 'name: taban ${{ steps.taban.outputs.sha }}'), beklenen: ['TAM BİR tane olmalı (bulunan 0)', `adım "${IZ_ADI}" ci.yml içinde yok`] },
  { ad: 'iz adımına `edited` koşulu eklenir (tam koşuda iz yazılmaz: ayna kör kalır)', boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'if', `${PR_KOSULU} && github.event.action == 'edited'`), beklenen: [`HEP KOŞAN adım "${IZ_ADI}" atlama koşulu taşıyor`] },
  { ad: "iz adımına ikinci `if:` satırı (`github.event.action == 'edited'`)", boz: (c) => adimaAnahtarEkle(c, IZ_ADI, "if: github.event.action == 'edited'"), beklenen: [`HEP KOŞAN adım "${IZ_ADI}" atlama koşulu taşıyor`] },
  { ad: "iz adımından `if:` silinir (push'ta da koşar: boş SHA'lı gürültü adım)", boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'if', null), beklenen: [`HEP KOŞAN adım "${IZ_ADI}" beklenen`, 'koşulunu taşımıyor'] },
  { ad: 'iz adımına `continue-on-error: true`', boz: (c) => adimaAnahtarEkle(c, IZ_ADI, 'continue-on-error: true'), beklenen: [`HEP KOŞAN adım "${IZ_ADI}" continue-on-error taşıyor`] },
  { ad: "iz adına SHA olarak `github.sha` (birleşim SHA'sı) yazılır", boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'name', `name: ${IZ_ADIM_ONEKI}\${{ github.sha }}`), beklenen: ['iz adımının adı beklenen', 'taban adımının çıktısına'] },
  { ad: 'iz adına SHA olarak `pull_request.base.sha` (olay anındaki taban ucu: merge-ref tabanı DEĞİL)', boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'name', `name: ${IZ_ADIM_ONEKI}\${{ github.event.pull_request.base.sha }}`), beklenen: ['iz adımının adı beklenen', 'taban adımının çıktısına'] },
  { ad: "iz adındaki `steps.taban` başka bir id'ye döner (taban adımının çıktısı okunmaz)", boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'name', `name: ${IZ_ADIM_ONEKI}\${{ steps.baska.outputs.sha }}`), beklenen: ['iz adındaki `steps.baska`', "id'siyle (taban) aynı değil"] },
  { ad: 'iz adımına `id` eklenir (anahtar kümesi sabit)', boz: (c) => adimaAnahtarEkle(c, IZ_ADI, 'id: iz'), beklenen: [`HEP KOŞAN adım "${IZ_ADI}" beklenmeyen anahtar \`id\``] },
  { ad: 'iz adımının `run` satırı hatayı yutar', boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'run', `${IZ_RUN} || true`), beklenen: ['run komutu hatayı yutuyor', 'run satırı beklenen TAM'] },
  { ad: "ikinci, SAHTE sabit SHA'lı iz adımı eklenir (betik birden çok izi yok sayar, kör kalır)", boz: (c) => adimOncesineEkle(c, PNPM_ADI, ['      - name: taban izi 0000000000000000000000000000000000000000', `        ${PR_KOSULU}`, '        run: echo sahte', '']), beklenen: ['TAM BİR tane olmalı (bulunan 2)', 'SINIFSIZ'] },
  { ad: 'iz adımı silinir (iz hiç yazılmaz: ayna kör kalır)', boz: (c) => adimiSil(c, IZ_ADI), beklenen: ['TAM BİR tane olmalı (bulunan 0)', `adım "${IZ_ADI}" ci.yml içinde yok`] },
  { ad: "Taban SHA'sı adımı silinir (iz adı kaynaksız kalır)", boz: (c) => adimiSil(c, TABAN_ADI), beklenen: [`adım "${TABAN_ADI}" ci.yml içinde yok`, "taban adımının id'siyle (yok) aynı değil"] },
  { ad: "Checkout ile taban adımı arasına sınıfsız adım girer", boz: (c) => adimOncesineEkle(c, TABAN_ADI, ['      - name: Araya giren kapı', '        run: echo x', '']), beklenen: ['"Araya giren kapı" SINIFSIZ'] },

  // ── B1 · SIRA: Checkout < taban < iz < Setup pnpm < kayıt kapısı < ayna ─────────────────────────────────────────────────
  { ad: "Taban SHA'sı adımı iz adımının SONRASINA taşınır (ad henüz üretilmemiş çıktıyı okur)", boz: (c) => adimiTasi(c, TABAN_ADI, IZ_ADI, 'sonra'), beklenen: ["iz adımı taban SHA'sı adımından ÖNCE"] },
  { ad: "Taban SHA'sı adımı Checkout'tan ÖNCEYE taşınır (depo yok: boş SHA)", boz: (c) => adimiTasi(c, TABAN_ADI, CHECKOUT_ADI, 'once'), beklenen: ["taban SHA'sı adımı Checkout'tan ÖNCE"] },
  { ad: "iz adımı Setup pnpm'den SONRAYA taşınır (kurulum kırılırsa iz yok)", boz: (c) => adimiTasi(c, IZ_ADI, PNPM_ADI, 'sonra'), beklenen: ["iz adımı Setup pnpm'den SONRA"] },
  { ad: 'iz adımı PR kayıt kapısından SONRAYA taşınır (kapı kırmızı bitince iz yok)', boz: (c) => adimiTasi(c, IZ_ADI, KAPI_ADI, 'sonra'), beklenen: ['iz adımı PR kayıt kapısından SONRA'] },
  { ad: 'iz adımları (taban + iz) ayna adımının SONRASINA taşınır', boz: (c) => adimiTasi(adimiTasi(c, IZ_ADI, AYNA_ADIM_ADI, 'sonra'), TABAN_ADI, AYNA_ADIM_ADI, 'sonra'), beklenen: ['iz adımı ayna adımından SONRA', "iz adımı Setup pnpm'den SONRA"] },

  // ── B2 · AYNA ADIMI: karar betiği TABANDAN (`git show HEAD^1:`), `$RUNNER_TEMP` kopyası, kopya yoksa TAM koşu ──────────────
  { ad: 'ayna gövdesi PR kopyasını koşturur (`node scripts/ci/edited-ayna.cjs`)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, `node ${AYNA_BETIGI}`), beklenen: ['PR kopyasını koşturuyor', 'run gövdesi beklenen TAM gövde değil'] },
  { ad: 'ayna gövdesi tabandan çıkarılan kopyadan SONRA PR kopyasını da koşturur (ikinci `node`)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, `${NODE_KOMUTU}\n          node ${AYNA_BETIGI}`), beklenen: ['PR kopyasını koşturuyor', 'TAM BİR `node` komutu olmalı (bulunan 2)'] },
  { ad: '`$RUNNER_TEMP/edited-ayna.cjs` yerine çalışma ağacındaki `edited-ayna.cjs` koşar', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, 'node edited-ayna.cjs'), beklenen: ['tabandan çıkarılan kopyayı koşturmuyor', 'run gövdesi beklenen TAM gövde değil'] },
  { ad: 'taban kopyası `$RUNNER_TEMP`e değil çalışma ağacına (`edited-ayna.cjs`) yazılır', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, `if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`, `if ! ${GIT_SHOW} > edited-ayna.cjs 2>/dev/null; then`), beklenen: [`\`${KOPYA}\` yoluna yazılmıyor`] },
  { ad: '`git show HEAD^1:` yerine `git show HEAD:` (birleşimdeki PR kopyası)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, `if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`, `if ! git show HEAD:${AYNA_BETIGI} > "${KOPYA}" 2>/dev/null; then`), beklenen: ['TABANDAN çıkarılmıyor'] },
  { ad: '`git show HEAD^2:` (PR başındaki kopya)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, `if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`, `if ! git show HEAD^2:${AYNA_BETIGI} > "${KOPYA}" 2>/dev/null; then`), beklenen: ['TABANDAN çıkarılmıyor'] },
  { ad: '`if ! git show` koşulu terslenir (`if git show`: kopya VARKEN "yok" dalı)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, `if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`, `if ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`), beklenen: ['`if !` ile korunmuyor'] },
  { ad: 'taban kopyası yoksa dalın `exit 0`ı düşer (boş kopya koşar)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, 'exit 0', null), beklenen: ['dal `exit 0` ile bitmiyor', 'run gövdesi beklenen TAM gövde değil'] },
  { ad: 'taban kopyası yoksa dal `atla=true` yazar (kopyasız koşu ağır adımları ATLATIR)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, String.raw`printf 'atla=false\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"`, String.raw`printf 'atla=true\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"`), beklenen: ['`atla=true` yazıyor', 'dal `atla=false` yazmıyor'] },
  { ad: 'taban kopyası yoksa dal `atla=false` YAZMAZ (çıktı satırı silinir)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, String.raw`printf 'atla=false\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"`, null), beklenen: ['dal `atla=false` yazmıyor'] },
  { ad: 'ayna `node` satırı silinir (karar hiç koşmaz)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, null), beklenen: ['tabandan çıkarılan kopyayı koşturmuyor'] },
  { ad: 'ayna `run: |` yerine `run: >` (satırlar tek satıra katlanır)', boz: (c) => adimAnahtariniYaz(c, AYNA_ADIM_ADI, 'run', 'run: >'), beklenen: ['`run: |` (çok satırlı'] },
  { ad: 'ayna `run` eski tek satırlık biçime döner (`node scripts/ci/edited-ayna.cjs`: PR kopyası, taban kopyası çıkarılmaz)', boz: (c) => adimRunBlogunuDegistir(c, AYNA_ADIM_ADI, [`        run: node ${AYNA_BETIGI}`]), beklenen: ['çok satırlı blok değil', 'PR kopyasını koşturuyor', 'TABANDAN çıkarılmıyor'] },
  { ad: 'taban kopyası `git show` yerine çalışma ağacından `cp` ile alınır (PR kopyası geçici dizine kopyalanır)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, `if ! ${GIT_SHOW} > "${KOPYA}" 2>/dev/null; then`, `if ! cp ${AYNA_BETIGI} "${KOPYA}" 2>/dev/null; then`), beklenen: ['TAM BİR `git show` olmalı (bulunan 0)', 'TABANDAN çıkarılmıyor'] },
  { ad: 'ayna gövdesinde `fi` düşer (dal kapanmaz)', boz: (c) => adimSatiriniYaz(c, AYNA_ADIM_ADI, 'fi', null), beklenen: ['`if ! git show ...; then ... fi` yapısı yok'] },
  { ad: 'ayna `node` komutu `fi`den ÖNCEYE (kopya yok dalına) taşınır', boz: (c) => adimSatiriniYaz(adimSatiriniYaz(c, AYNA_ADIM_ADI, NODE_KOMUTU, null), AYNA_ADIM_ADI, 'exit 0', `${NODE_KOMUTU}\n            exit 0`), beklenen: ['`node` komutu `fi`den ÖNCE'] },
  { ad: "iz adının SHA'sından sonra ek metin gelir (betik deseni `^taban izi <40 hane>$` eşleşmez)", boz: (c) => adimAnahtariniYaz(c, IZ_ADI, 'name', `name: ${IZ_ADI} (iz)`), beklenen: ['biçimine dönüşmüyor', 'iz adımının adı beklenen'] },
  { ad: 'Setup pnpm PR kayıt kapısının SONRASINA taşınır (kurulum sırası bozulur)', boz: (c) => adimiTasi(c, PNPM_ADI, KAPI_ADI, 'sonra'), beklenen: ["PR kayıt kapısı Setup pnpm'den ÖNCE"] },
  { ad: 'Checkout başka bir eyleme çevrilir (`fetch-depth` anlamsız kalır, HEAD^1 güvencesi yok)', boz: (c) => adimAnahtariniYaz(c, CHECKOUT_ADI, 'uses', 'uses: ./.github/actions/ozel-checkout'), beklenen: ['`uses: actions/checkout@…` değil'] },

  // ── B1/B2 · CHECKOUT: `fetch-depth: 0` ve merge-ref `ref` (HEAD^1 ve `git show HEAD^1:` sığ klonda çalışmaz) ───────────────
  { ad: 'Checkout `fetch-depth: 0` düşer (sığ klon: HEAD^1 ve git show çalışmaz, ayna sessizce hep TAM der)', boz: (c) => adimGirdisiniYaz(c, CHECKOUT_ADI, 'fetch-depth', null), beklenen: ['Checkout adımında fetch-depth girdisi yok'] },
  { ad: 'Checkout `fetch-depth: 1` olur (sınır değeri: sığ klon)', boz: (c) => adimGirdisiniYaz(c, CHECKOUT_ADI, 'fetch-depth', '1'), beklenen: ['Checkout adımında fetch-depth değeri beklenen değil'] },
  { ad: 'Checkout `ref` PR başına (head.sha) çevrilir (HEAD^1 taban olmaz)', boz: (c) => adimGirdisiniYaz(c, CHECKOUT_ADI, 'ref', '${{ github.event.pull_request.head.sha }}'), beklenen: ['Checkout adımında ref değeri beklenen değil'] },
  { ad: 'Checkout `with:` altına beklenmeyen girdi eklenir', boz: (c) => adimGirdisiniYaz(c, CHECKOUT_ADI, 'submodules', 'true'), beklenen: ['Checkout adımında beklenmeyen girdi submodules'] },
  { ad: 'Checkout `with:` başlığı düşer (girdiler okunamaz)', boz: (c) => adimAnahtariniYaz(c, CHECKOUT_ADI, 'with', null), beklenen: ['Checkout adımında fetch-depth girdisi yok', 'Checkout adımında ref girdisi yok'] },

  // ── izinler: `actions: read` (ayna önceki koşuları ve iz adlarını bu izinle okur) ───────────────────────────────────────
  { ad: '`actions: read` düşer (ayna önceki koşuları ve iz adlarını okuyamaz)', boz: (c) => izinleriYaz(c, IZINLER.filter((i) => i !== 'actions: read')), beklenen: ['`permissions: actions: read` yok'] },

  // ── tetikleyiciler ve concurrency ───────────────────────────────────────────────────────────────────────────────
  { ad: 'pull_request türlerinden `edited` düşer', boz: (c) => ustSatiriYaz(c, 'on', 'types:', '    types: [opened, synchronize, reopened]'), beklenen: ['pull_request türleri'] },
  { ad: 'pull_request türlerinden `synchronize` düşer (yeni commit CI başlatmaz)', boz: (c) => ustSatiriYaz(c, 'on', 'types:', '    types: [opened, reopened, edited]'), beklenen: ['pull_request türleri'] },
  { ad: 'pull_request türleri satır içi liste değil', boz: (c) => ustSatiriYaz(c, 'on', 'types:', '    types:'), beklenen: ['satır içi liste olarak okunamadı'] },
  { ad: 'concurrency grubundan `edited` soneki düşer', boz: (c) => ustSatiriYaz(c, 'concurrency', 'group:', '  group: ci-${{ github.ref }}'), beklenen: ['`edited` için ayrı değil'] },
  { ad: 'concurrency `cancel-in-progress: false` olur', boz: (c) => ustSatiriYaz(c, 'concurrency', 'cancel-in-progress:', '  cancel-in-progress: false'), beklenen: ['cancel-in-progress: true yok'] },
  { ad: 'concurrency bloğuna ek satır girer', boz: (c) => ustSatiriYaz(c, 'concurrency', 'cancel-in-progress:', '  cancel-in-progress: true\n  fazladan: 1'), beklenen: ['concurrency bloğunda beklenmeyen satır'] },

  // ── yapı: sınıflama atlatılamaz ─────────────────────────────────────────────────────────────────────────────────
  { ad: 'adsız adım eklenir (önceki adımın bloğuna yutulmaz)', boz: (c) => adimOncesineEkle(c, 'Build (blocking)', ['      - run: echo adsiz-kapi', '']), beklenen: ['adsız adım', 'SINIFSIZ'] },
  { ad: 'aynı adlı ikinci `Test` adımı (koşulsuz) eklenir', boz: (c) => adimOncesineEkle(c, 'Build (blocking)', ['      - name: Test', '        run: echo ikinci', '']), beklenen: ['adım adı TEKRAR: "Test"', 'AĞIR adım "Test" atlama koşulu taşımıyor'] },
  { ad: 'ci işi başka kimliğe taşınır (zorunlu kontrol adı kaybolur)', boz: (c) => c.replace('\n  ci:\n', '\n  ci-yeni:\n'), beklenen: ['`jobs.ci` işi ci.yml içinde bulunamadı'] },
]

describe('INV-CI-EDITED-1 — edited aynası ci iş akışına doğru bağlı', () => {
  const ci = readFileSync(CI_YOLU, 'utf8').replace(/\r\n/g, '\n')

  it('bugünkü ci.yml bağlantı kurallarına uyuyor', () => {
    expect(denetle(ci)).toEqual([])
  })

  it('kanarya: adımlar ayrıştırıldı (denetçi boş metinle yeşil vermesin)', () => {
    expect(adimlariAyir(ci).length).toBeGreaterThanOrEqual(15)
    expect(AGIR.length + HEP_KOSAN.length).toBe(adimlariAyir(ci).length)
  })

  it('betik ci.yml adım adının BAŞI ile aynı adı kullanıyor', () => {
    expect(AYNA_ADIM_ADI).toBe('edited ayna kararı')
    expect(IZ_ADIM_ONEKI).toBe('taban izi ')
  })

  // ── ODAKLI KONTROLLER: aynı denetim, alt kümeler (kırıldığında HANGİ bağın koptuğu başlıktan okunur) ────────────────
  it('ci işi ATLANAMAZ: job düzeyinde yalnız bilinen anahtarlar (if/needs/permissions/continue-on-error yok)', () => {
    expect(isDuzeyiniDenetle(ci)).toEqual([])
    expect(
      isAnahtarlari(ci)
        .map((k) => k.anahtar)
        .sort(),
    ).toEqual([...IS_ANAHTARLARI].sort())
  })

  it('izinler EN AZ yetki: yalnız contents/actions/pull-requests read, hiçbir yazma biçimi yok', () => {
    expect(izinleriDenetle(ci)).toEqual([])
  })

  it('hep koşan adımlar (kayıt kapısı dahil): if satırı TAM eşitlik; continue-on-error ve hata yutma yok; id, run, env ve anahtar kümesi sabit', () => {
    expect(hepKosanAdimlariDenetle(adimlariAyir(ci))).toEqual([])
    for (const h of HEP_KOSAN_BEKLENTISI) expect(ifSatirlari(ci, h.ad), h.ad).toEqual(h.kosul === null ? [] : [h.kosul])
  })

  it('ağır adımların koşulu SATIR eşitliğiyle aynı (includes ile değil)', () => {
    expect(agirAdimlariDenetle(adimlariAyir(ci))).toEqual([])
    expect(AGIR.map((ad) => ifSatirlari(ci, ad))).toEqual(AGIR.map(() => [KOSUL]))
  })

  it('ayna adımının ortam değişkenleri DEĞERLERİYLE birebir (HEAD_SHA/KOSU_ID/TABAN_DEGISTI dahil; BASE_REF YOK)', () => {
    const ayna = adimiBul(ci, AYNA_ADIM_ADI)
    expect(ayna, 'ayna adımı yok').toBeDefined()
    expect(Object.fromEntries(ayna?.env ?? new Map<string, string>())).toEqual({
      GH_TOKEN: '${{ github.token }}',
      DEPO: '${{ github.repository }}',
      HEAD_SHA: '${{ github.event.pull_request.head.sha }}',
      KOSU_ID: '${{ github.run_id }}',
      TABAN_DEGISTI: "${{ github.event.changes.base && 'true' || '' }}",
    })
    // BASE_REF eski tasarımın kalıntısıdır (dal adı kıyası): taban artık izin SHA'sıyla kıyaslanır, geri gelmemeli
    expect(ayna?.env.has('BASE_REF'), 'BASE_REF geri geldi').toBe(false)
  })

  // ── B1/B2 ODAKLI KONTROLLER ──────────────────────────────────────────────────────────────────────────────────────
  it("B1 iz zinciri: Checkout < Taban SHA'sı < iz < Setup pnpm < kayıt kapısı < ayna; iz adı TAM BİR tane", () => {
    const adimlar = adimlariAyir(ci)
    expect(siraDenetle(adimlar)).toEqual([])
    expect(izAdimlariniDenetle(adimlar)).toEqual([])
    expect(tabanRunDenetle(adimlar)).toEqual([])
    const sira = [CHECKOUT_ADI, TABAN_ADI, IZ_ADI, PNPM_ADI, KAPI_ADI, AYNA_ADIM_ADI].map((ad) => adimlar.findIndex((a) => a.ad === ad))
    expect(sira.every((i) => i >= 0), 'zincirdeki bir adım ci.yml içinde yok').toBe(true)
    expect([...sira].sort((x, y) => x - y), 'zincir sırası bozuk').toEqual(sira)
    expect(adimlar.filter((a) => a.ad.startsWith('taban izi ')).map((a) => a.ad)).toEqual(['taban izi ${{ steps.taban.outputs.sha }}'])
  })

  it('iz adı şablonu betikle uyumlu: önek IZ_ADIM_ONEKI, `steps.<taban id>` ifadesi, çalışma anında `izTabani` ile okunur', () => {
    expect(IZ_ADI).toBe('taban izi ${{ steps.taban.outputs.sha }}')
    expect(IZ_ADI.startsWith(IZ_ADIM_ONEKI)).toBe(true)
    const taban = adimiBul(ci, TABAN_ADI)
    expect(adBasvurusu(IZ_ADI)?.id, 'iz adı taban adımının id\'sine başvurmuyor').toBe(taban?.anahtarlar.find((k) => k.anahtar === 'id')?.deger)
    const iz = (ad: string, conclusion = 'success') => izTabani({ jobs: [{ name: 'ci', steps: [{ name: ad, conclusion }] }] })
    expect(iz(adiGenislet(IZ_ADI))).toBe(ORNEK_SHA)
    // iz KAÇAK yolları okunmaz (iz yok = kanıt yok): boş SHA, 39 haneli SHA, büyük harfli SHA, başarısız adım
    expect(iz(IZ_ADIM_ONEKI)).toBeNull()
    expect(iz(`${IZ_ADIM_ONEKI}${ORNEK_SHA.slice(0, 39)}`)).toBeNull()
    expect(iz(`${IZ_ADIM_ONEKI}${ORNEK_SHA.toUpperCase()}`)).toBeNull()
    expect(iz(adiGenislet(IZ_ADI), 'failure')).toBeNull()
  })

  it("taban ve iz adımları HER pull_request koşusunda koşar: if TAM, continue-on-error yok, id/run/anahtar kümesi sabit", () => {
    const adimlar = adimlariAyir(ci)
    expect(TABAN_RUN).toBe('run: echo "sha=$(git rev-parse HEAD^1)" >> "$GITHUB_OUTPUT"')
    for (const ad of [TABAN_ADI, IZ_ADI]) {
      const a = adimlar.find((x) => x.ad === ad)
      expect(a, ad).toBeDefined()
      expect(a ? adimIfSatirlari(a) : null, ad).toEqual([PR_KOSULU])
      expect(a?.anahtarlar.some((k) => k.anahtar === 'continue-on-error'), ad).toBe(false)
    }
    // anahtar KÜMESİ sabit (sıra serbest: `id` ile `if`in yer değiştirmesi zararsızdır)
    expect(adimlar.find((a) => a.ad === TABAN_ADI)?.anahtarlar.map((k) => k.anahtar).sort()).toEqual(['id', 'if', 'name', 'run'])
    expect(adimlar.find((a) => a.ad === IZ_ADI)?.anahtarlar.map((k) => k.anahtar).sort()).toEqual(['if', 'name', 'run'])
    expect(hepKosanAdimlariDenetle(adimlar.filter((a) => a.ad === TABAN_ADI || a.ad === IZ_ADI))).toEqual([])
  })

  it('B2 ayna adımı: karar betiği TABANDAN çıkarılıp koşar (run gövdesi TAM eşitlik + anlamsal denetim)', () => {
    const ayna = adimiBul(ci, AYNA_ADIM_ADI)
    expect(ayna, 'ayna adımı yok').toBeDefined()
    const govde = ayna ? runGovdesi(ayna) : null
    expect(govde).toBe(AYNA_RUN_GOVDESI)
    expect(aynaRunDenetle(adimlariAyir(ci))).toEqual([])
    // gövdenin okunur özeti: tabandan çıkar, geçici dizine yazar, YALNIZ o kopyayı koşar, PR kopyası hiçbir yerde koşmaz
    expect(govde).toContain('git show HEAD^1:scripts/ci/edited-ayna.cjs > "$RUNNER_TEMP/edited-ayna.cjs"')
    expect(govde).toContain('node "$RUNNER_TEMP/edited-ayna.cjs"')
    expect(govde).not.toMatch(/node\s+(?:\.\/)?scripts\//)
    expect(govde).not.toContain('atla=true')
    expect(path.basename(AYNA_BETIGI)).toBe('edited-ayna.cjs')
  })

  it('Checkout: `fetch-depth: 0` ve merge-ref `ref` (HEAD^1 ve `git show HEAD^1:` için ŞART; sığ klonda ayna sessizce hep TAM der)', () => {
    const co = adimiBul(ci, CHECKOUT_ADI)
    expect(co, 'Checkout adımı yok').toBeDefined()
    expect(Object.fromEntries(co?.girdiler ?? new Map<string, string>())).toEqual({ ref: "${{ steps.mergeref.outputs.ref || '' }}", 'fetch-depth': '0' })
  })

  it('betik↔ci.yml ortam eşleşmesi: ayna adımının verdikleri = betiğin `process.env`den okudukları (BASE_REF yok)', () => {
    const okunan = betigiOkuyanOrtam()
    expect(okunan, 'betikte `const { ... } = process.env` bildirimi yok').not.toBeNull()
    expect(okunan).toEqual(expect.arrayContaining(['DEPO', 'HEAD_SHA', 'KOSU_ID', 'TABAN_DEGISTI']))
    expect(okunan).not.toContain('BASE_REF')
    expect(betikOrtamiDenetle(adimlariAyir(ci))).toEqual([])
  })

  it('tetikleyiciler: pull_request türleri tam (edited dahil), concurrency bloğu birebir', () => {
    expect(tetikleyicileriDenetle(ci)).toEqual([])
    expect(concurrencyDenetle(ci)).toEqual([])
  })

  // ── AYRIŞTIRICI VE DENETÇİNİN KENDİSİ ──────────────────────────────────────────────────────────────────────────
  it('ayrıştırıcı: betik gövdesindeki `if:`/`continue-on-error:` adım anahtarı SAYILMAZ, adsız adım ayrı adımdır', () => {
    const sentetik = [
      'jobs:',
      '  ci:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - name: Betikli # satır sonu yorumu',
      '        run: |',
      '          if: betik-satiri',
      '          continue-on-error: true',
      '        env:',
      '          A: 1',
      '          B: iki # yorum',
      '      # - name: yorumdaki adım',
      '      - run: echo adsiz',
      '        if: false',
      '',
    ].join('\n')
    const adimlar = adimlariAyir(sentetik)
    expect(adimlar.map((a) => a.ad)).toEqual(['Betikli', ''])
    expect(adimlar[0].anahtarlar.map((k) => k.anahtar)).toEqual(['name', 'run', 'env'])
    expect(Object.fromEntries(adimlar[0].env)).toEqual({ A: '1', B: 'iki' })
    expect(adimlar[1].anahtarlar.map((k) => `${k.anahtar}: ${k.deger}`)).toEqual(['run: echo adsiz', 'if: false'])
    expect(isAnahtarlari(sentetik).map((k) => k.anahtar)).toEqual(['runs-on', 'steps'])
  })

  it('ayrıştırıcı: `with:` girdileri ve çok satırlı `run: |` gövdesi (girinti atılır; sonraki anahtar/adım yorumu gövdeye girmez)', () => {
    const sentetik = [
      'jobs:',
      '  ci:',
      '    steps:',
      '      - name: Betikli',
      '        uses: x/y@v1 # sürüm yorumu',
      '        with:',
      '          # girdi yorumu',
      '          ref: abc',
      '          fetch-depth: 0',
      '        run: |',
      '          if ! git show HEAD^1:a > b; then',
      '            exit 0',
      '',
      '          fi',
      '          # kabuk yorumu gövdededir',
      '        env:',
      '          A: 1',
      '',
      '      # sonraki adımın yorumu gövdeye GİRMEZ',
      '      - name: Sonraki',
      '        run: |',
      '          echo iki',
      '',
      '      - name: Tek satır',
      '        run: echo bir',
      '',
    ].join('\n')
    const adimlar = adimlariAyir(sentetik)
    expect(adimlar.map((a) => a.ad)).toEqual(['Betikli', 'Sonraki', 'Tek satır'])
    expect(Object.fromEntries(adimlar[0].girdiler)).toEqual({ ref: 'abc', 'fetch-depth': '0' })
    expect(Object.fromEntries(adimlar[0].env)).toEqual({ A: '1' })
    expect(runGovdesi(adimlar[0])).toBe('if ! git show HEAD^1:a > b; then\n  exit 0\n\nfi\n# kabuk yorumu gövdededir')
    expect(runGovdesi(adimlar[1])).toBe('echo iki')
    expect(runGovdesi(adimlar[2]), 'tek satırlık run gövde sayılmaz').toBeNull()
    expect(ilkFark('a\nb', 'a\nc')).toContain('satır 2')
    expect(ilkFark('a', 'a')).toBe('fark yok')
    // betik↔ci.yml ortam karşılaştırmasının kaynağı: bildirim biçimi okunur, bulunamazsa null (sessiz geçmez)
    expect(betigiOkuyanOrtam('const { A, B,\n  C } = process.env;')).toEqual(['A', 'B', 'C'])
    expect(betigiOkuyanOrtam('const { A: x, B = 1 } = process.env;')).toEqual(['A', 'B'])
    expect(betigiOkuyanOrtam("const x = process.env.A + process.env['B'] + process.env.A")).toEqual(['A', 'B'])
    expect(betigiOkuyanOrtam('const x = 1')).toBeNull()
  })

  it('kanarya: bozuk iskelet KIRMIZI verir (boş sonuç "uyumlu" sayılmaz)', () => {
    expect(denetle('').join('|')).toContain('ayrıştırılamadı')
    expect(denetle('jobs:\n  baska:\n    runs-on: x\n').join('|')).toContain('`jobs.ci` işi')
    expect(denetle(ci.replace(/\n {4}steps:\n/, '\n    adimlar:\n')).join('|')).toContain('ayrıştırılamadı')
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ────────────────────────────────────────────────────────
  it('sabotaj 1: ağır adımdan atlama koşulu silinirse yakalanır', () => {
    const bozuk = adimAnahtariniYaz(ci, 'Test', 'if', null)
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('AĞIR adım "Test" atlama koşulu taşımıyor')
  })

  it('sabotaj 2: PR kayıt kapısına atlama koşulu girerse yakalanır (en ağır bozulma)', () => {
    const bozuk = adimAnahtariniYaz(ci, KAPI_ADI, 'if', "if: github.event_name == 'pull_request' && steps.ayna.outputs.atla != 'true'")
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('HEP KOŞAN adım "PR kayıt kapısı (karar 187)" atlama koşulu taşıyor')
  })

  it('sabotaj 3: ayna adımının adı değişirse yakalanır', () => {
    const bozuk = adimAnahtariniYaz(ci, AYNA_ADIM_ADI, 'name', 'name: edited aynası')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('SINIFSIZ')
  })

  it('sabotaj 4: concurrency grubundan edited soneki düşerse yakalanır', () => {
    const bozuk = ustSatiriYaz(ci, 'concurrency', 'group:', '  group: ci-${{ github.ref }}')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('`edited` için ayrı değil')
  })

  it('sabotaj 5: ayna adımı kayıt kapısından önceye taşınırsa yakalanır', () => {
    const satirlar = ci.split('\n')
    const bas = satirlar.findIndex((s) => s.includes('- name: edited ayna kararı'))
    const bit = satirlar.findIndex((s, i) => i > bas && /^ {6}- name:/.test(s))
    const adim = satirlar.slice(bas, bit)
    const kalan = [...satirlar.slice(0, bas), ...satirlar.slice(bit)]
    const kapi = kalan.findIndex((s) => s.includes('- name: PR kayıt kapısı'))
    const bozuk = [...kalan.slice(0, kapi), ...adim, ...kalan.slice(kapi)].join('\n')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('PR kayıt kapısından ÖNCE')
  })

  it('sabotaj 6: yeni sınıfsız adım eklenirse yakalanır', () => {
    const bozuk = adimOncesineEkle(ci, 'Build (blocking)', ['      - name: Yeni ağır kapı', '        run: echo x', ''])
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('"Yeni ağır kapı" SINIFSIZ')
  })

  it('sabotaj 7: actions: read düşerse ve yazma yetkisi girerse yakalanır', () => {
    const okumasiz = izinleriYaz(
      ci,
      IZINLER.filter((i) => i !== 'actions: read'),
    )
    expect(okumasiz).not.toBe(ci)
    expect(denetle(okumasiz).join('|')).toContain('actions: read')
    const yazmali = izinleriYaz(
      ci,
      IZINLER.map((i) => (i === 'actions: read' ? 'actions: write' : i)),
    )
    expect(yazmali).not.toBe(ci)
    expect(denetle(yazmali).join('|')).toContain('yazma yetkisi')
  })

  it('sabotaj 8: ayna adımından id düşerse yakalanır (çıktı okunamaz, ağır adımlar HEP koşar)', () => {
    const bozuk = adimAnahtariniYaz(ci, AYNA_ADIM_ADI, 'id', null)
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('`id: ayna` satırı yok')
  })

  it('sabotaj 9: karar betiği PR kopyasından koşarsa yakalanır (B2: PR betiği değiştirip kendi kırmızısını atlatır)', () => {
    const bozuk = adimSatiriniYaz(ci, AYNA_ADIM_ADI, NODE_KOMUTU, `node ${AYNA_BETIGI}`)
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('PR kopyasını koşturuyor')
  })

  it('sabotaj 10: iz adımı `edited` koşuluna bağlanırsa yakalanır (tam koşu iz yazmaz, ayna kör kalır)', () => {
    const bozuk = adimAnahtariniYaz(ci, IZ_ADI, 'if', `${PR_KOSULU} && github.event.action == 'edited'`)
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain(`HEP KOŞAN adım "${IZ_ADI}" atlama koşulu taşıyor`)
  })

  it("sabotaj 11: taban SHA'sı HEAD^1 yerine HEAD okursa yakalanır (birleşim taban sanılır, YANLIŞ ATLATIR)", () => {
    const bozuk = adimAnahtariniYaz(ci, TABAN_ADI, 'run', 'run: echo "sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('BİRİNCİ ebeveynini okumuyor')
  })

  it('sabotaj 12: Checkout `fetch-depth: 0` düşerse yakalanır (HEAD^1 sığ klonda yok, ayna sessizce hep TAM der)', () => {
    const bozuk = adimGirdisiniYaz(ci, CHECKOUT_ADI, 'fetch-depth', null)
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('Checkout adımında fetch-depth girdisi yok')
  })

  it('sabotaj 13: taban kopyası yoksa dal `atla=true` yazarsa yakalanır (kopyasız koşu ağır adımları ATLATIR)', () => {
    const bozuk = adimSatiriniYaz(
      ci,
      AYNA_ADIM_ADI,
      String.raw`printf 'atla=false\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"`,
      String.raw`printf 'atla=true\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"`,
    )
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('`atla=true` yazıyor')
  })

  describe('sabotaj tablosu: bozulma TÜRLERİ (yakalayan denetim başlıkta sabit)', () => {
    it.each(BOZULMALAR)('$ad', ({ boz, beklenen }) => {
      const bozuk = boz(ci)
      expect(bozuk === ci, "fikstür: bozucu hiçbir şeyi değiştirmedi (hedef adım/anahtar ci.yml'de yok)").toBe(false)
      const ihlal = denetle(bozuk).join('|')
      for (const parca of beklenen) expect(ihlal).toContain(parca)
    })

    it('tablo kendi kendini sınar: bozulmamış ci.yml temiz, adlar benzersiz, her bozucu İKİ KEZ uygulanınca da kırmızı (idempotent)', () => {
      expect(denetle(ci)).toEqual([])
      expect(new Set(BOZULMALAR.map((b) => b.ad)).size).toBe(BOZULMALAR.length)
      // her bozucu İKİ KEZ uygulandığında da (ci.yml zaten bozulmuşsa) kırmızı kalmalı: idempotent fikstür
      for (const b of BOZULMALAR) {
        const iki = b.boz(b.boz(ci))
        expect(denetle(iki).length, b.ad).toBeGreaterThan(0)
      }
    })
  })
})
