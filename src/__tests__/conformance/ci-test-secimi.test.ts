import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-SECIM-1 · test seçimi ve belge hızlı yolu `ci.yml`'ye DOĞRU bağlı (ALT-38e, cetvel: docs/standards/test-karnesi-standard.md §4.3).
 *
 * NİÇİN VAR: PR'da yalnız değişenle ilgili testler koşar (scripts/ci/test-sec.cjs; dağıtıcı girdisi `--secim`) ve yalnız .md/.txt/.csv değişen belge PR'ında kod kapıları (kurulum, Lint, tip, Deno) atlanır.
 * Seçim yalnız DARALTIR; bu dosya daraltmanın SESSİZCE genişlemesini (kapsam kaybı) ve yanlış yerde açılmasını önler. Bozulma yolları (hepsi SESSİZDİR):
 *   1. seçici PR'ın KENDİ kopyasından koşar (PR seçiciyi değiştirip kendi testini eler): `git show HEAD^1:` dışı kaynak, `node scripts/ci/test-sec.cjs`, harita PR'dan,
 *   2. seçici edited, master push, elle koşum ya da zamanlı koşuda çalışır (yalnız `test-shard` işinde VARDIR; `ci` içindeki Test o olaylarda TAM koşar),
 *   3. koşul POZİTİF mantığa çevrilir: çıktı eksik/başka değerse kurulum ve test ATLANIR. Koşullar yalnız DARALTMA yönündedir (aşağıdaki ifade değerlendirmesi GERÇEK doğruluk tablosunu ölçer),
 *   4. çökme yedeği düşer (kırmızı kalır: tabandaki seçici bozulursa onu düzelten PR kilitlenir) ya da yedek `tam=false` yazar (seçici çökünce testler ELENİR),
 *   5. belge hızlı yolu `belge` sınıfına güvenir: `.claude/`, `docs/` altındaki `.cjs`/`.mjs` dosyaları `belge`dir ama `eslint .` onları tarar (ölçüldü); karar git yol süzgeciyle yalnız md/txt/csv farkında,
 *   6. lifecycle betikleri (kökün `postinstall`ı `tsc --noEmit`) yalnız `test-shard` kurulumunda kapalıdır; `ci` kurulumu DEĞİŞMEZ (orada tsc gerçek tip kapısıdır).
 * Davranış (gerçek bash + git) ve kapsam kanıtı: ci-test-secimi-kapsam.test.ts (INV-CI-SECIM-2). Ölçüm yüzeyi: `node:fs` + satır taraması (girinti sabit: iş 2, iş anahtarı 4, adım 6, adım anahtarı 8, env 10);
 * ayrıştırılamayan yapı KIRMIZIDIR; sabotaj testleri YAML'ı BELLEKTE bozar, ci.yml'i DEĞİŞTİRMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const WF = path.join(KOK, '.github/workflows')
const CI_METNI = readFileSync(path.join(WF, 'ci.yml'), 'utf8').replace(/\r\n/g, '\n')
const SHARD_ISI = 'test-shard'
const CI_ISI = 'ci'

// ── SABİTLER: ci.yml'de TAM bu metinler bulunmalı ─────────────────────────────────────────────────────────────────────────────────
const SHARD_OLAYI = "github.event_name == 'pull_request' && github.event.action != 'edited'"
const SEC_ADI = 'Test seçimi (tabandan, kurulumsuz)'
const SECV_ADI = 'Test seçimi (tabandan, vitest ile)'
/** Kurulum/Test koşulu: YALNIZ `sec` adımının ürettiği `bos` çıktısı TAM `true` ise kapanır. Ham `secilen-sayisi != '0'` KULLANILMAZ: eksik çıktı (null) ile '0' sayıya çevrilince ikisi de 0'dır (doküman). */
const KURULUM = "steps.sec.outputs.bos != 'true'"
/** Eski (terk edilen) koşul biçimi: ifade doğruluk tablosu, neden bırakıldığını ÇALIŞTIRARAK gösterir. */
const ESKI_KURULUM = "(steps.sec.outputs.tam != 'false' || steps.sec.outputs.secilen-sayisi != '0')"
const KOSUL_HIZLI = "if: steps.ayna.outputs.atla != 'true' && steps.hizli.outputs.belge != 'true'"
const HIZLI_ADI = 'Hızlı yol (yalnız .md/.txt/.csv belgesi; kod kapıları atlanır)'
const HIZLI_KOSULU = `if: ${SHARD_OLAYI} && steps.sinif.outputs.sinif == 'belge'`
const HIZLI_ATLANANLAR = [
  ...['Setup Deno', 'Install dependencies', 'Lint (blocking)', 'Type check', 'Deno check (edge functions — kapı-körlüğü guard)'],
  ...['Edge mangle-guard (string-literal — deno check göremez)', 'Edge CORS guard (ölü getCorsHeaders importu + eksik Allow-Origin)', 'Node derleme önbelleği (V8 bayt kodu)'],
]
/** Hızlı yoldan ETKİLENMEYEN ci adımları: bu kapılar belge PR'ında DA koşar (kayıt kapısı, gizli bilgi taraması, sınıf, taban izi, bekleme). */
const HIZLI_OKUMAYANLAR = ["Secret guard (hardcoded DB connection string)", 'PR kayıt kapısı (karar 187)', 'Test', 'Build (blocking)', 'Test shard sonuçları (bekle ve doğrula)']
const SHARD_SIRASI = ['Checkout', 'Setup pnpm', 'Setup Node', SEC_ADI, 'Setup Deno', 'Install dependencies', 'Node derleme önbelleği (V8 bayt kodu)', SECV_ADI, 'Test dağıtımı (shard ${{ matrix.shard }}/4)', 'Test (shard ${{ matrix.shard }}/4)']
const KUR_RUN = 'run: pnpm install --prefer-offline --config.allow-scripts true --ignore-scripts'
/** `ci` içindeki kurulum: lifecycle betikleri AÇIK kalır (tsc orada gerçek tip kapısı: koordinatör kararı, ALT-38e). */
const CI_KUR_RUN = 'run: pnpm install --prefer-offline --config.allow-scripts true'
const HATA_YUTAN = /\|\|\s*(?:true\b|:(?:\s|$)|exit\s+0\b)|;\s*true\s*$/

/** Seçim adımlarının beklenen GÖVDESİ (LF, girinti atılmış). `String.raw`: printf'in `\n`'leri kaçış DEĞİL, dosyadaki iki karakterdir. */
const GOVDE_BASI = String.raw`d="$RUNNER_TEMP/secici"
mkdir -p "$d"
if ! git show HEAD^1:scripts/ci/test-sec.cjs > "$d/test-sec.cjs" 2>/dev/null || ! git show HEAD^1:scripts/ci/test-haritasi.json > "$d/test-haritasi.json" 2>/dev/null; then
  echo "::notice::test seçimi: tam — taban kopyası yok (HEAD^1:scripts/ci/test-sec.cjs, test-haritasi.json)"
  printf 'tam=true\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"
  exit 0
fi`
const GOVDE_V_BASI = String.raw`d="$RUNNER_TEMP/secici"
if [ ! -s "$d/test-sec.cjs" ] || [ ! -s "$d/test-haritasi.json" ]; then
  echo "::notice::test seçimi: tam — taban kopyası yok"
  printf 'tam=true\nneden=taban kopyası yok\n' >> "$GITHUB_OUTPUT"
  exit 0
fi`
const GOVDE_SONU = (bayrak: string): string => String.raw`cikis=0
node "$d/test-sec.cjs" --kok "$GITHUB_WORKSPACE" --harita "$d/test-haritasi.json" ${bayrak}--cikti "$RUNNER_TEMP/secilen.txt" || cikis=$?
if [ "$cikis" -ne 0 ]; then
  echo "::warning::test seçimi: tam — seçici çöktü (çıkış kodu $cikis), tam paket koşar"
  printf 'tam=true\nneden=seçici çöktü, çıkış kodu %s\n' "$cikis" >> "$GITHUB_OUTPUT"
fi`
/** `bos` YALNIZ seçicinin yazdığı SON `tam=` ve `secilen-sayisi=` değerlerinden türer (çökme yedeğinin `tam=true`su seçicinin eski `tam=false`ını ezer: GitHub son satırı alır) ve SON satırda HER ZAMAN yazılır (seçicinin kendi yazdığı `bos` ezilir). */
const BOS_KOSULU = 'if [ "$tam" = "false" ] && [ "$sayi" = "0" ]; then bos=true; fi'
const BOS_YAZIMI = 'echo "bos=$bos" >> "$GITHUB_OUTPUT"'
const BOS_BLOKU = String.raw`tam=$(sed -n 's/^tam=//p' "$GITHUB_OUTPUT" | tail -n 1)
sayi=$(sed -n 's/^secilen-sayisi=//p' "$GITHUB_OUTPUT" | tail -n 1)
bos=false
${BOS_KOSULU}
${BOS_YAZIMI}`
const SEC_GOVDESI = `${GOVDE_BASI}\n${GOVDE_SONU('--vitestsiz ')}\n${BOS_BLOKU}`
const SECV_GOVDESI = `${GOVDE_V_BASI}\n${GOVDE_SONU('')}`

// ── AYRIŞTIRICI (satır taraması) ──────────────────────────────────────────────────────────────────────────────────────────────────
const bosMu = (s: string): boolean => s.trim() === ''
const anlamli = (s: string): boolean => !bosMu(s) && !s.trimStart().startsWith('#')
const girinti = (s: string): number => s.length - s.trimStart().length
const yorumsuz = (satirlar: readonly string[]): string[] => satirlar.filter((s) => !/^\s*#/.test(s))
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
}

/** `jobs.<isId>` bölümü: `bas` iş satırı, `bit` dahil değil. */
function isAraligi(satirlar: string[], isId: string): { bas: number; bit: number } | null {
  const jobs = satirlar.findIndex((s) => s.trimEnd() === 'jobs:')
  const bas = jobs < 0 ? -1 : satirlar.findIndex((s, i) => i > jobs && s.trimEnd() === `  ${isId}:`)
  if (bas < 0) return null
  const sonraki = satirlar.findIndex((s, i) => i > bas && anlamli(s) && girinti(s) <= 2)
  return { bas, bit: sonraki < 0 ? satirlar.length : sonraki }
}

/** İşin adımları (adsız adım da bir adımdır: adı ''). */
function isAdimlari(metin: string, isId: string): Adim[] {
  const satirlar = metin.split('\n')
  const is = isAraligi(satirlar, isId)
  if (!is) return []
  const adimlar: Adim[] = []
  let mevcut: Adim | null = null
  let blok = false
  let adimlarda = false
  for (let i = is.bas + 1; i < is.bit; i++) {
    const s = satirlar[i]
    if (!adimlarda) {
      adimlarda = /^ {4}steps:\s*$/.test(s)
      continue
    }
    if (!anlamli(s)) {
      mevcut?.satirlar.push(s)
      continue
    }
    if (girinti(s) <= 4) break
    const yeni = /^ {6}- (.*)$/.exec(s)
    if (yeni) {
      mevcut = { ad: '', bas: i, satirlar: [s], anahtarlar: [], env: new Map() }
      adimlar.push(mevcut)
      blok = false
    } else if (mevcut) {
      mevcut.satirlar.push(s)
    } else {
      continue
    }
    const anahtar = yeni ? /^([A-Za-z_][\w-]*):\s?(.*)$/.exec(yeni[1]) : girinti(s) === 8 ? /^ {8}([A-Za-z_][\w-]*):\s?(.*)$/.exec(s) : null
    if (anahtar) {
      mevcut.anahtarlar.push({ anahtar: anahtar[1], deger: degerTemizle(anahtar[2]), no: i })
      if (anahtar[1] === 'name') mevcut.ad = degerTemizle(anahtar[2])
      blok = anahtar[1] === 'env'
    } else if (blok && girinti(s) === 10) {
      const e = /^ {10}([A-Za-z_][\w-]*):\s?(.*)$/.exec(s)
      if (e) mevcut.env.set(e[1], degerTemizle(e[2]))
    } else if (girinti(s) <= 8) {
      blok = false
    }
  }
  return adimlar
}

const ifSatirlari = (a: Adim): string[] => a.anahtarlar.filter((k) => k.anahtar === 'if').map((k) => `if: ${k.deger}`)
const idDegeri = (a: Adim): string | undefined => a.anahtarlar.find((k) => k.anahtar === 'id')?.deger

/** Adımın `run: |` gövdesi: girinti atılmış, LF, sondaki boş satırlar yok. Blok değilse null. */
function runGovdesi(a: Adim): string | null {
  const r = a.anahtarlar.find((k) => k.anahtar === 'run')
  if (!r || !/^\|[-+]?$/.test(r.deger)) return null
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
const tekSatirRun = (a: Adim): string | null => {
  const r = a.anahtarlar.filter((k) => k.anahtar === 'run')
  return r.length === 1 && !/^[|>][-+]?$/.test(r[0].deger) ? `run: ${r[0].deger}` : null
}

// ── DENETİM (INV-CI-SECIM-1) ──────────────────────────────────────────────────────────────────────────────────────────────────────

/** Seçim adımının gövdesi için ANLAMSAL değişmezler (TAM eşitlikten bağımsız ikinci savunma: eşitlik sabiti dikkatsizce güncellense de bunlar tutmalı). */
function govdeDenetle(ad: string, govde: string | null, vitestsiz: boolean): string[] {
  if (govde === null) return [`"${ad}" adımının \`run: |\` gövdesi okunamadı (çok satırlı literal blok beklenir)`]
  const k = govde.split('\n').map((s) => s.trim()).filter((s) => s !== '' && !s.startsWith('#'))
  const ihlal: string[] = []
  const nodeKomutlari = k.filter((s) => /(?:^|[;&|(]|\b(?:then|else|do))\s*node\s/.test(s))
  if (nodeKomutlari.length !== 1) ihlal.push(`"${ad}" gövdesinde TAM BİR \`node\` komutu olmalı (bulunan ${nodeKomutlari.length}): ikinci komut seçici çıktısını ezebilir`)
  const node = nodeKomutlari[0] ?? ''
  if (/scripts\/ci\/test-sec\.cjs/.test(node) || /node\s+(?:\.\/)?scripts\//.test(node)) ihlal.push(`"${ad}" PR'ın KENDİ seçicisini koşturuyor (\`${node.slice(0, 60)}\`): PR seçiciyi değiştirip kendi testini eler`)
  if (!node.startsWith('node "$d/test-sec.cjs"')) ihlal.push(`"${ad}" yalnız tabandan çıkarılan kopyayı (\`node "$d/test-sec.cjs"\`) koşturmalı (bulunan: \`${node.slice(0, 60)}\`)`)
  for (const bayrak of ['--kok "$GITHUB_WORKSPACE"', '--harita "$d/test-haritasi.json"', '--cikti "$RUNNER_TEMP/secilen.txt"']) {
    if (!node.includes(bayrak)) ihlal.push(`"${ad}" seçici komutunda \`${bayrak}\` yok: kök/harita/liste yolu yanlış ya da seçici betiğin konumuna göre kök bulur`)
  }
  if (vitestsiz !== node.includes('--vitestsiz')) ihlal.push(vitestsiz ? `"${ad}" \`--vitestsiz\` vermiyor: kurulumdan ÖNCE vitest açılamaz, seçici çöker (hep tam)` : `"${ad}" \`--vitestsiz\` veriyor: vitest'li nihai geçiş vitest listesini ve \`related\` grafiğini hiç kullanmaz`)
  const dosyaKaynaklari = k.filter((s) => /\bgit\s+show\b/.test(s))
  if (vitestsiz) {
    const ham = dosyaKaynaklari.join(' ')
    if (dosyaKaynaklari.length !== 1 || !/git show HEAD\^1:scripts\/ci\/test-sec\.cjs/.test(ham) || !/git show HEAD\^1:scripts\/ci\/test-haritasi\.json/.test(ham)) {
      ihlal.push(`"${ad}" seçiciyi ve haritayı \`git show HEAD^1:\` ile TABANDAN çıkarmıyor (PR kopyası ya da başka ebeveyn): PR seçiciyi/haritayı değiştirip kendi testini eler`)
    }
    if (!/>\s*"\$d\/test-sec\.cjs"/.test(dosyaKaynaklari.join('\n')) || !k.some((s) => s.includes('> "$d/test-haritasi.json"'))) ihlal.push(`"${ad}" kopyaları \`$RUNNER_TEMP/secici\` altına yazmıyor`)
  } else if (dosyaKaynaklari.length !== 0) {
    ihlal.push(`"${ad}" yeniden \`git show\` yapıyor: ikinci geçiş birinci geçişin tabandan çıkardığı kopyayı koşturmalı (iki farklı kopya, iki farklı karar)`)
  }
  if (!k.some((s) => s.includes('|| cikis=$?')) || !k.some((s) => s.includes("printf 'tam=true") && s.includes('"$GITHUB_OUTPUT"'))) {
    ihlal.push(`"${ad}" çökme yedeği yok (\`|| cikis=$?\` + \`tam=true\` yazımı): seçici çökerse adım kırmızı kalır, tabandaki bozuk seçiciyi düzelten PR de kilitlenir`)
  }
  // YAZIM yasağı (okuma serbest: `sed 's/^tam=//p'`): seçim kararını adım kendisi `tam=false` ya da `secilen-sayisi=` yazarak UYDURAMAZ
  if (k.some((s) => /(?:printf|echo)\b[^\n]*(?:tam=false|secilen-sayisi=)/.test(s))) ihlal.push(`"${ad}" kendisi \`tam=false\` ya da \`secilen-sayisi=\` yazıyor: seçim kararı YALNIZ tabandan çıkan seçiciden gelir (yedek boş seçim uyduramaz)`)
  if (k.some((s) => HATA_YUTAN.test(s))) ihlal.push(`"${ad}" hatayı yutuyor (\`|| true\` / \`; true\`): çöken seçici sessiz geçer`)
  // `bos` kararı: YALNIZ kurulumsuz birinci geçişte; seçicinin SON `tam=false` + `secilen-sayisi=0` değerlerinden (çökme yedeğinden SONRA), TEK yazımla ve gövdenin SON satırında
  const bosSatirlari = k.filter((s) => /\bbos\b/.test(s))
  if (!vitestsiz) {
    if (bosSatirlari.length) ihlal.push(`"${ad}" \`bos\` yazıyor: kurulum atlama kararı YALNIZ kurulumsuz birinci geçişin işidir (ikinci geçiş kurulumdan sonradır)`)
    return ihlal
  }
  const okumalar = k.filter((s) => /^(?:tam|sayi)=\$\(sed -n 's\/\^(?:tam|secilen-sayisi)=\/\/p' "\$GITHUB_OUTPUT" \| tail -n 1\)$/.test(s))
  const yazimlar = bosSatirlari.filter((s) => s.includes('"$GITHUB_OUTPUT"'))
  const dogrular = k.filter((s) => s.includes('bos=true'))
  const yedek = k.findIndex((s) => s.includes('neden=seçici çöktü'))
  if (yazimlar.length !== 1 || yazimlar[0] !== BOS_YAZIMI) ihlal.push(`"${ad}" \`bos\` çıktısını TEK yerde ve YALNIZ \`${BOS_YAZIMI}\` ile yazmalı (bulunan: ${yazimlar.join(' ; ') || 'yok'}): kurulum/test atlama kararı bu çıktıdan türer`)
  if (k[k.length - 1] !== BOS_YAZIMI) ihlal.push(`"${ad}" \`bos\` yazımı gövdenin SON satırı değil: seçicinin ya da sonradan koşan bir komutun yazdığı \`bos\` onu ezer (seçim DOLUyken kurulum ve test ATLANIR)`)
  if (dogrular.length !== 1 || dogrular[0] !== BOS_KOSULU) ihlal.push(`"${ad}" \`bos=true\` YALNIZ \`${BOS_KOSULU}\` ile atanmalı (bulunan: ${dogrular.join(' ; ') || 'yok'}): tam=false VE sayı 0 dışında da kurulum ve test ATLANIR (kapı sessizce düşer)`)
  if (k.filter((s) => s === 'bos=false').length !== 1 || k.indexOf('bos=false') > k.indexOf(BOS_KOSULU)) ihlal.push(`"${ad}" \`bos\` varsayılanı koşuldan ÖNCE ve \`bos=false\` olmalı: aksi hâlde koşul tutmadığında da kurulum ve test ATLANIR ya da çıktı belirsiz kalır`)
  if (okumalar.length !== 2) ihlal.push(`"${ad}" seçicinin SON \`tam=\` ve \`secilen-sayisi=\` satırlarını (\`tail -n 1\`) okumuyor: çökme yedeğinin \`tam=true\`su seçicinin eski \`tam=false\`ını ezemez, boş seçim yanlış okunur`)
  if (yedek < 0 || k.indexOf(BOS_KOSULU) < yedek) ihlal.push(`"${ad}" \`bos\` kararı çökme yedeğinden ÖNCE (ya da yedek yok): seçici çöktüğünde bile eski \`tam=false\` değerinden boş seçim türer`)
  return ihlal
}

function shardSecimDenetle(metin: string): string[] {
  const adimlar = isAdimlari(metin, SHARD_ISI)
  if (adimlar.length === 0) return ['test-shard işinin adımları ayrıştırılamadı: seçim denetlenemedi']
  const ihlal: string[] = []
  const sira = adimlar.map((a) => a.ad).join(' → ')
  const beklenenSira = SHARD_SIRASI.map((a) => a.replace('/4)', `/${N0})`)).join(' → ')
  if (sira !== beklenenSira) ihlal.push(`test-shard adım sırası beklenen değil: bulunan [${sira}], beklenen [${beklenenSira}] (seçim 1/2 kurulumdan ÖNCE, 2/2 kurulumdan SONRA, dağıtım 2/2'den SONRA, Test en SON)`)
  const bul = (ad: string): Adim | undefined => adimlar.find((a) => a.ad === ad)
  const sec = bul(SEC_ADI)
  const secv = bul(SECV_ADI)
  if (sec) {
    if (idDegeri(sec) !== 'sec') ihlal.push('seçim 1/2 adımı `id: sec` değil: kurulum/test koşulları ve `secv` çıktıyı okuyamaz (çıktı boş okunur: koşullar yalnız daraltma yönünde olduğundan her şey koşar, kazanç sıfır)')
    if (ifSatirlari(sec).length) ihlal.push(`seçim 1/2 adımı \`if:\` taşıyor (${ifSatirlari(sec).join(' ; ')}): seçici atlanırsa çıktı yoktur ve her şey koşar (kazanç sıfır) ya da başka adım onu atlar`)
    if (sec.env.size) ihlal.push(`seçim 1/2 adımının ortamı boş olmalı (bulunan: ${[...sec.env.keys()].join(', ')}): vitest açılmaz, ortam kip seçmez`)
    ihlal.push(...govdeDenetle(SEC_ADI, runGovdesi(sec), true))
    if (runGovdesi(sec) !== SEC_GOVDESI) ihlal.push('seçim 1/2 gövdesi beklenen TAM gövde değil')
  }
  if (secv) {
    if (idDegeri(secv) !== 'secv') ihlal.push('seçim 2/2 adımı `id: secv` değil: dağıtım adımının `SECIM_TAM`/`SECIM_SAYI` çıktısı boş okunur (dağıtıcı TAM paket der: seçim hiç uygulanmaz)')
    const envBeklenen = "VENTHUB_DUNYA_DURUMU=dislan"
    const envBulunan = [...secv.env].map(([a, d]) => `${a}=${d}`).join(',')
    if (envBulunan !== envBeklenen) ihlal.push(`seçim 2/2 ortamı TAM \`${envBeklenen}\` olmalı (bulunan: \`${envBulunan}\`): seçicinin gördüğü test kümesi shard'ınkinden ayrışır`)
    ihlal.push(...govdeDenetle(SECV_ADI, runGovdesi(secv), false))
    if (runGovdesi(secv) !== SECV_GOVDESI) ihlal.push('seçim 2/2 gövdesi beklenen TAM gövde değil')
  }
  for (const ad of SHARD_SIRASI.slice(4)) {
    const a = adimlar.find((x) => x.ad.replace(/\/\d+\)$/, '/4)') === ad)
    if (!a) continue
    const beklenen = ad.startsWith('Test (shard') ? `if: ${KURULUM} && steps.dagit.outputs.kos != 'false'` : `if: ${KURULUM}`
    if (ifSatirlari(a).join(' ; ') !== beklenen) ihlal.push(`"${a.ad}" koşulu TAM \`${beklenen}\` değil (bulunan: ${ifSatirlari(a).join(' ; ') || 'yok'}): seçim kapısı gevşer (kurulum/test sessizce atlanır) ya da hiç kapanmaz (kazanç sıfır)`)
  }
  const kur = bul('Install dependencies')
  if (kur && tekSatirRun(kur) !== KUR_RUN) ihlal.push(`shard kurulumu TAM \`${KUR_RUN}\` değil (bulunan: ${tekSatirRun(kur) ?? 'blok'}): kökün postinstall'ı (tsc --noEmit, ~20 sn) her shard'da geri gelir ya da kurulum başka biçimde yapılır`)
  const ham = metin.split('\n')
  const is = isAraligi(ham, SHARD_ISI)
  const isIfi = is ? ham.slice(is.bas, is.bit).filter((s) => /^ {4}if:/.test(s)).map((s) => s.trim()) : []
  if (isIfi.length !== 1 || isIfi[0] !== `if: ${SHARD_OLAYI}`) ihlal.push(`test-shard işinin \`if\`i TAM \`if: ${SHARD_OLAYI}\` değil (bulunan: ${isIfi.join(' ; ') || 'yok'}): seçici edited/push/elle koşum/zamanlı koşuda da çalışır ya da PR'da hiç çalışmaz`)
  return ihlal
}

/** Seçici ve harita YALNIZ test-shard işinde anılır; `ci` işi, öteki iş akışları ve vitest yapılandırması seçiciyi bilmez (edited, push, elle koşum ve zamanlı koşuda TAM). */
function olayKapanisiDenetle(ci: string, digerleri: Array<{ dosya: string; metin: string }>, vitestCfg: string): string[] {
  const ihlal: string[] = []
  const ciAdimlari = isAdimlari(ci, CI_ISI)
  const ciYorumsuz = yorumsuz(ciAdimlari.flatMap((a) => a.satirlar)).join('\n')
  if (ciAdimlari.length === 0) ihlal.push('`ci` işinin adımları ayrıştırılamadı')
  if (/test-sec|test-haritasi|secilen\.txt|--secim|--vitestsiz/.test(ciYorumsuz)) ihlal.push('`ci` işi test seçiciye başvuruyor: master push, elle koşum ve `edited` koşusunda `ci` içindeki Test TAM koşmalı (seçici orada VAR OLMAMALI)')
  for (const { dosya, metin } of digerleri) {
    if (/test-sec\b|test-sec\.cjs|test-haritasi/.test(yorumsuz(metin.split('\n')).join('\n'))) ihlal.push(`${dosya} test seçiciye başvuruyor: zamanlı/elle/başka koşular TAM paketi koşar, seçim YALNIZ pull_request shard işlerinindir`)
  }
  if (/test-sec|VENTHUB_TEST_SECIM|secilen/.test(vitestCfg)) ihlal.push('vitest.config.ts seçiciye bağlanmış: yerel `pnpm test`, master push ve zamanlı koşu da daralır')
  const shard = yorumsuz(isAdimlari(ci, SHARD_ISI).flatMap((a) => a.satirlar)).join('\n')
  if (!/test-sec\.cjs/.test(shard)) ihlal.push('seçici `test-shard` işinde hiç anılmıyor: seçim hiçbir yerde uygulanmaz (kazanç sıfır)')
  const ciKur = ciAdimlari.find((a) => a.ad === 'Install dependencies')
  if (!ciKur || tekSatirRun(ciKur) !== CI_KUR_RUN) ihlal.push(`\`ci\` kurulumu TAM \`${CI_KUR_RUN}\` olmalı (bulunan: ${ciKur ? (tekSatirRun(ciKur) ?? 'blok') : 'yok'}): tsc \`ci\` işinde gerçek tip kapısıdır, lifecycle betikleri orada KAPATILMAZ`)
  return ihlal
}

/** Belge hızlı yolu: hızlı yol adımı (koşul, kimlik, sıra) ve kod kapılarının koşulları TAM eşitlik; hızlı yoldan etkilenmeyen kapılar OKUMAZ. */
function hizliYolDenetle(ci: string): string[] {
  const adimlar = isAdimlari(ci, CI_ISI)
  const ihlal: string[] = []
  const hizli = adimlar.filter((a) => a.ad === HIZLI_ADI)
  if (hizli.length !== 1) return [`"${HIZLI_ADI}" adımı TAM BİR tane olmalı (bulunan ${hizli.length}): belge PR'ı kod kapılarını atlayamaz ya da çıktıyı iki adım yazar`]
  const h = hizli[0]
  if (idDegeri(h) !== 'hizli') ihlal.push('hızlı yol adımı `id: hizli` değil: kod kapıları `steps.hizli.outputs.belge` okur, çıktı boş kalır (kapılar koşar: kazanç sıfır)')
  if (ifSatirlari(h).join(' ; ') !== HIZLI_KOSULU) ihlal.push(`hızlı yol adımı koşulu TAM \`${HIZLI_KOSULU}\` değil (bulunan: ${ifSatirlari(h).join(' ; ') || 'yok'}): \`edited\` koşusunda (ci içindeki Test kuruluma ihtiyaç duyar) ya da \`belge\` dışı sınıfta açılır`)
  const govde = runGovdesi(h) ?? ''
  const cikti = (govde.match(/>> "\$GITHUB_OUTPUT"/g) ?? []).length
  if (cikti !== 1 || !govde.includes('echo "belge=true" >> "$GITHUB_OUTPUT"')) ihlal.push('hızlı yol adımı çıktıyı YALNIZ `belge=true` olarak ve TEK yerde yazmalı: başka değer ya da ikinci yazım kapıları gereksiz/yanlış atlatır')
  if (!/git diff --quiet --no-renames HEAD\^1 HEAD -- \. ':\(exclude,glob\)\*\*\/\*\.md' ':\(exclude,glob\)\*\*\/\*\.txt' ':\(exclude,glob\)\*\*\/\*\.csv'/.test(govde)) {
    ihlal.push('hızlı yol gövdesi `git diff --quiet --no-renames HEAD^1 HEAD -- . :(exclude,glob)**/*.md/.txt/.csv` yol süzgecini taşımıyor: kod/JSON farkı da `belge=true` yazabilir')
  }
  if (!govde.startsWith('if ! git diff --quiet --no-renames HEAD^1 HEAD && ')) ihlal.push('hızlı yol gövdesi boş farkı dışlamıyor (`! git diff --quiet ... &&`): fark olmayan koşuda da `belge=true` yazılır')
  if (/\.(?:cjs|mjs|js|ts|tsx|json|py|sh|yaml|yml)'/.test(govde.replace(/:\(exclude,glob\)\*\*\/\*\.(?:md|txt|csv)'/g, ''))) ihlal.push('hızlı yol yol süzgecine md/txt/csv dışında uzantı girmiş: `eslint .` ve tsc o dosyaları okur (`.claude/hooks/*.cjs` ölçüldü)')
  const ad = (a: Adim): string => a.ad
  const sinifSirasi = adimlar.map(ad)
  const iSinif = sinifSirasi.indexOf("Değişiklik sınıfı (siteye dokunmayan PR'da Build atlanır)")
  const iHizli = sinifSirasi.indexOf(HIZLI_ADI)
  if (iSinif < 0 || iHizli < iSinif) ihlal.push('hızlı yol adımı sınıf adımından ÖNCE: sınıf çıktısı henüz yazılmamışken karar verir')
  for (const kapi of HIZLI_ATLANANLAR) {
    const a = adimlar.find((x) => x.ad === kapi)
    if (!a) {
      ihlal.push(`ci işinde "${kapi}" adımı yok`)
      continue
    }
    if (ifSatirlari(a).join(' ; ') !== KOSUL_HIZLI) ihlal.push(`"${kapi}" koşulu TAM \`${KOSUL_HIZLI}\` değil (bulunan: ${ifSatirlari(a).join(' ; ') || 'yok'}): belge PR'ında koşar (kazanç sıfır) ya da çıktı yokken ATLANIR (kapı sessizce düşer)`)
    if (sinifSirasi.indexOf(kapi) < iHizli) ihlal.push(`"${kapi}" hızlı yol adımından ÖNCE: koşulu henüz yazılmamış çıktıyı okur (belge PR'ında da koşar)`)
  }
  for (const kapi of HIZLI_OKUMAYANLAR) {
    const a = adimlar.find((x) => x.ad === kapi)
    if (a && /steps\.hizli\./.test(yorumsuz(a.satirlar).join('\n'))) ihlal.push(`"${kapi}" hızlı yol çıktısını okuyor: belge PR'ında da KOŞMALI (kayıt kapısı, gizli bilgi taraması, Test, Build ve bekleme adımı atlanamaz)`)
  }
  return ihlal
}

function denetle(ci: string, digerleri: Array<{ dosya: string; metin: string }>, vitestCfg: string): string[] {
  return [...shardSecimDenetle(ci), ...olayKapanisiDenetle(ci, digerleri, vitestCfg), ...hizliYolDenetle(ci)]
}

// ── GİRDİLER ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const DIGERLERI = readdirSync(WF)
  .filter((f) => /\.ya?ml$/.test(f) && f !== 'ci.yml')
  .map((f) => ({ dosya: f, metin: readFileSync(path.join(WF, f), 'utf8').replace(/\r\n/g, '\n') }))
const VITEST_CFG = readFileSync(path.join(KOK, 'vitest.config.ts'), 'utf8').replace(/\r\n/g, '\n')
const matrisSayisi = (metin: string): number | null => {
  const m = /^ {8}shard: \[([\d, ]+)\]$/m.exec(metin)
  return m ? m[1].split(',').length : null
}
const N0 = matrisSayisi(CI_METNI) ?? 4

// ── SABOTAJ ARAÇLARI (satırı içeriğiyle bulur; hedef yoksa metni DEĞİŞTİRMEZ: tablo testi "değişmedi"yi KIRMIZI sayar) ──────────────────────────────────────────────────
const adimAraligi = (c: string, isId: string, ad: string): { bas: number; bit: number } | null => {
  const s = c.split('\n')
  const is = isAraligi(s, isId)
  if (!is) return null
  const bas = s.findIndex((x, i) => i > is.bas && i < is.bit && /^ {6}- name: /.test(x) && x.slice(14).trimEnd() === ad)
  if (bas < 0) return null
  const sonraki = s.findIndex((x, i) => i > bas && i < is.bit && /^ {6}- /.test(x))
  return { bas, bit: sonraki < 0 ? is.bit : sonraki }
}
/** Adım aralığında KIRPILMIŞ içeriği `bul` olan İLK satırı yeniden yazar (girinti korunur) ya da siler (`yeni=null`). */
function sd(c: string, a: { bas: number; bit: number } | null, bul: string | RegExp, yeni: string | null): string {
  if (!a) return c
  const s = c.split('\n')
  const i = s.findIndex((x, n) => n >= a.bas && n < a.bit && (typeof bul === 'string' ? x.trim() === bul : bul.test(x.trim())))
  if (i < 0) return c
  if (yeni === null) s.splice(i, 1)
  else s[i] = `${s[i].slice(0, girinti(s[i]))}${yeni}`
  return s.join('\n')
}
const aralikSil = (c: string, a: { bas: number; bit: number } | null): string => {
  if (!a) return c
  const s = c.split('\n')
  s.splice(a.bas, a.bit - a.bas)
  return s.join('\n')
}
const sec = (c: string): { bas: number; bit: number } | null => adimAraligi(c, SHARD_ISI, SEC_ADI)
const secv = (c: string): { bas: number; bit: number } | null => adimAraligi(c, SHARD_ISI, SECV_ADI)
const hizliAr = (c: string): { bas: number; bit: number } | null => adimAraligi(c, CI_ISI, HIZLI_ADI)
const ciAdim = (c: string, ad: string): { bas: number; bit: number } | null => adimAraligi(c, CI_ISI, ad)
const shardAdim = (c: string, ad: string): { bas: number; bit: number } | null => adimAraligi(c, SHARD_ISI, ad)
/** Adımın içinde bulunan metni (çok satırlı gövde dahil) başka metinle değiştirir; yoksa metin değişmez. */
function metinDegistir(c: string, a: { bas: number; bit: number } | null, eski: string, yeni: string): string {
  if (!a) return c
  const s = c.split('\n')
  const parca = s.slice(a.bas, a.bit).join('\n')
  if (!parca.includes(eski)) return c
  s.splice(a.bas, a.bit - a.bas, ...parca.replace(eski, yeni).split('\n'))
  return s.join('\n')
}

interface Bozulma {
  ad: string
  boz: (ci: string) => string
  /** `denetle()` çıktısında GEÇMESİ gereken parça. */
  beklenen: string
}

const BOZULMALAR: readonly Bozulma[] = [
  // ── seçici PR'ın kendi kopyasından değil TABANDAN koşar ────────────────────────────────────────────────────────────────────────
  { ad: "seçici PR'ın KENDİ kopyasından koşar (`node scripts/ci/test-sec.cjs`): PR seçiciyi değiştirip kendi testini eler", boz: (c) => metinDegistir(c, sec(c), 'node "$d/test-sec.cjs"', 'node scripts/ci/test-sec.cjs'), beklenen: "PR'ın KENDİ seçicisini koşturuyor" },
  { ad: 'seçici merge commit’in kendisinden (HEAD:) çıkarılır: PR kopyası tabanmış gibi koşar', boz: (c) => metinDegistir(c, sec(c), 'git show HEAD^1:scripts/ci/test-sec.cjs', 'git show HEAD:scripts/ci/test-sec.cjs'), beklenen: 'TABANDAN çıkarmıyor' },
  { ad: 'seçici PR başından (HEAD^2:) çıkarılır', boz: (c) => metinDegistir(c, sec(c), 'git show HEAD^1:scripts/ci/test-sec.cjs', 'git show HEAD^2:scripts/ci/test-sec.cjs'), beklenen: 'TABANDAN çıkarmıyor' },
  { ad: 'HARİTA PR kopyasından okunur (PR haritayı şişirip testlerini haritaya "bağlar"): `git show` yerine çalışma ağacından kopyalanır', boz: (c) => metinDegistir(c, sec(c), 'git show HEAD^1:scripts/ci/test-haritasi.json', 'cat scripts/ci/test-haritasi.json'), beklenen: 'TABANDAN çıkarmıyor' },
  { ad: 'tabandan çıkarılan kopya koşmaz, harita yolu PR ağacına bakar (`--harita scripts/ci/test-haritasi.json`)', boz: (c) => metinDegistir(c, sec(c), '--harita "$d/test-haritasi.json"', '--harita scripts/ci/test-haritasi.json'), beklenen: '`--harita "$d/test-haritasi.json"` yok' },
  { ad: 'seçici kökü (`--kok`) düşer: kök betiğin konumundan ($RUNNER_TEMP) bulunur, yanlış yerde okur ve her şey tam olur', boz: (c) => metinDegistir(c, sec(c), '--kok "$GITHUB_WORKSPACE" ', ''), beklenen: '`--kok "$GITHUB_WORKSPACE"` yok' },
  { ad: 'seçim 1/2 `--vitestsiz` bayrağını kaybeder (kurulumdan ÖNCE vitest açılamaz: seçici hep çöker, boş seçim kazancı sıfır)', boz: (c) => metinDegistir(c, sec(c), '--vitestsiz ', ''), beklenen: '`--vitestsiz` vermiyor' },
  { ad: "seçim 2/2 `--vitestsiz` alır (nihai geçiş vitest listesini ve `related` grafiğini hiç kullanmaz: kod PR'ında seçim hep boş/eksik)", boz: (c) => metinDegistir(c, secv(c), '--harita "$d/test-haritasi.json" ', '--harita "$d/test-haritasi.json" --vitestsiz '), beklenen: '`--vitestsiz` veriyor' },
  { ad: 'seçim 2/2 yeniden `git show` yapar (iki farklı kopya, iki farklı karar)', boz: (c) => metinDegistir(c, secv(c), 'cikis=0\n', 'git show HEAD^1:scripts/ci/test-sec.cjs > "$d/test-sec.cjs"\ncikis=0\n'), beklenen: 'yeniden `git show` yapıyor' },

  // ── çökme yedeği ve sahte boş seçim ────────────────────────────────────────────────────────────────────────────────────────────
  { ad: 'çökme yedeği düşer (seçici çökünce adım kırmızı kalır, onu düzelten PR kilitlenir)', boz: (c) => metinDegistir(c, sec(c), ' || cikis=$?', ''), beklenen: 'çökme yedeği yok' },
  { ad: 'çökme yedeği `tam=false` yazar (seçici çökünce testler ELENİR)', boz: (c) => metinDegistir(c, secv(c), "printf 'tam=true\\nneden=seçici çöktü", "printf 'tam=false\\nsecilen-sayisi=0\\nneden=seçici çöktü"), beklenen: 'kendisi `tam=false`' },
  { ad: "taban kopyası yok dalı `tam=false` yazar (mekanizma henüz tabanda değilken PR testsiz yeşil)", boz: (c) => metinDegistir(c, sec(c), "printf 'tam=true\\nneden=taban kopyası yok", "printf 'tam=false\\nsecilen-sayisi=0\\nneden=taban kopyası yok"), beklenen: 'kendisi `tam=false`' },
  { ad: 'seçici çıkışı `|| true` ile yutulur', boz: (c) => metinDegistir(c, sec(c), '--cikti "$RUNNER_TEMP/secilen.txt" || cikis=$?', '--cikti "$RUNNER_TEMP/secilen.txt" || true'), beklenen: 'hatayı yutuyor' },
  { ad: 'seçici adımına `continue-on-error`-benzeri atlama: adıma `if: false` girer (seçici hiç koşmaz, çıktı yok: her şey koşar, kazanç sıfır)', boz: (c) => metinDegistir(c, sec(c), 'id: sec\n', "id: sec\n        if: 'false'\n"), beklenen: 'seçim 1/2 adımı `if:` taşıyor' },
  { ad: 'seçim 1/2 adımının `id`si değişir (kurulum koşulları çıktıyı okuyamaz)', boz: (c) => sd(c, sec(c), 'id: sec', 'id: seci'), beklenen: '`id: sec` değil' },
  { ad: 'seçim 2/2 adımının `id`si değişir (dağıtıcı seçim çıktısını boş okur: TAM paket)', boz: (c) => sd(c, secv(c), 'id: secv', 'id: secx'), beklenen: '`id: secv` değil' },
  { ad: "seçim 2/2 ortamı `dislan`ı kaybeder (seçici dünya durumu testlerini de görür, shard'ın kümesinden ayrışır)", boz: (c) => sd(c, secv(c), 'VENTHUB_DUNYA_DURUMU: dislan', null), beklenen: 'seçim 2/2 ortamı TAM' },

  // ── koşullar yalnız DARALTMA yönünde ───────────────────────────────────────────────────────────────────────────────────────────
  { ad: "kurulum koşulu POZİTİF mantığa çevrilir (`bos == 'false'` iken koşar: çıktı yokken kurulum ATLANIR)", boz: (c) => sd(c, shardAdim(c, 'Install dependencies'), /^if: /, "if: steps.sec.outputs.bos == 'false'"), beklenen: '"Install dependencies" koşulu TAM' },
  { ad: "kurulum koşulu ESKİ biçime döner (`secilen-sayisi != '0'`: çıktı eksikken `tam=false` ile null ve '0' eşit sayılır, kurulum ATLANIR)", boz: (c) => sd(c, shardAdim(c, 'Install dependencies'), /^if: /, `if: ${ESKI_KURULUM}`), beklenen: '"Install dependencies" koşulu TAM' },
  { ad: '`bos` kararı `tam` okumasını kaybeder (yalnız sayı 0 iken bos: `tam=true` ile de kurulum ve test ATLANIR)', boz: (c) => metinDegistir(c, sec(c), BOS_KOSULU, 'if [ "$sayi" = "0" ]; then bos=true; fi'), beklenen: '`bos=true` YALNIZ' },
  { ad: '`bos` kararı sayıya bakmaz (`tam=false` tek başına: seçim DOLUyken de kurulum ve test ATLANIR)', boz: (c) => metinDegistir(c, sec(c), BOS_KOSULU, 'if [ "$tam" = "false" ]; then bos=true; fi'), beklenen: '`bos=true` YALNIZ' },
  { ad: '`bos` varsayılanı `true` olur (koşul tutmasa da her PR kurulumsuz ve testsiz yeşil biter)', boz: (c) => metinDegistir(c, sec(c), 'bos=false\n', 'bos=true\n'), beklenen: '`bos` varsayılanı' },
  {
    ad: "`bos` seçicinin İLK satırlarından okunur (`tail` yerine `head`: çökme yedeğinin `tam=true`su seçicinin eski `tam=false`ını ezemez)",
    boz: (c) => {
      const a = metinDegistir(c, sec(c), '| tail -n 1)', '| head -n 1)')
      return metinDegistir(a, sec(a), '| tail -n 1)', '| head -n 1)')
    },
    beklenen: 'SON `tam=`',
  },
  {
    ad: '`bos` yazımı seçiciden ÖNCEYE taşınır (seçicinin kendi yazdığı `bos=true` son satır olur: seçim DOLUyken kurulum ve test ATLANIR)',
    boz: (c) => {
      const a = metinDegistir(c, sec(c), `\n          ${BOS_YAZIMI}`, '')
      return metinDegistir(a, sec(a), 'cikis=0\n', `${BOS_YAZIMI}\n          cikis=0\n`)
    },
    beklenen: 'SON satırı değil',
  },
  {
    ad: '`bos` kararı çökme yedeğinden ÖNCE verilir (boş seçimi yazıp çöken seçici kurulumu ve testi ATLATIR: tabandaki bozuk seçici testleri eler)',
    boz: (c) => {
      const blok = BOS_BLOKU.split('\n').join('\n          ')
      const a = metinDegistir(c, sec(c), `\n          ${blok}`, '')
      return metinDegistir(a, sec(a), 'if [ "$cikis" -ne 0 ]; then', `${blok}\n          if [ "$cikis" -ne 0 ]; then`)
    },
    beklenen: 'çökme yedeğinden ÖNCE',
  },
  { ad: 'ikinci geçiş de `bos` yazar (kurulum atlama kararı kurulumdan SONRA verilir)', boz: (c) => metinDegistir(c, secv(c), 'cikis=0\n', 'echo "bos=true" >> "$GITHUB_OUTPUT"\ncikis=0\n'), beklenen: 'kurulum atlama kararı YALNIZ kurulumsuz birinci geçişin işidir' },
  { ad: 'Deno kurulumu seçim kapısını kaybeder (boş seçimde de kurulur: kazanç kaybı)', boz: (c) => sd(c, shardAdim(c, 'Setup Deno'), /^if: /, null), beklenen: '"Setup Deno" koşulu TAM' },
  { ad: "V8 önbelleği boş seçimde de geri yüklenir", boz: (c) => sd(c, shardAdim(c, 'Node derleme önbelleği (V8 bayt kodu)'), /^if: /, null), beklenen: '"Node derleme önbelleği (V8 bayt kodu)" koşulu TAM' },
  { ad: "seçim 2/2 koşulu düşer (boş seçimde kurulumsuz ortamda vitest açmaya çalışır)", boz: (c) => sd(c, secv(c), /^if: /, null), beklenen: `"${SECV_ADI}" koşulu TAM` },
  { ad: 'dağıtım adımı koşulu düşer (boş seçimde kurulumsuz ortamda `vitest list` ister, kırmızı)', boz: (c) => sd(c, shardAdim(c, `Test dağıtımı (shard \${{ matrix.shard }}/${N0})`), /^if: /, null), beklenen: 'koşulu TAM' },
  { ad: "Test koşulu `kos` kapısını kaybeder (boş parçada vitest koşar, boş liste FIRLATIR)", boz: (c) => sd(c, shardAdim(c, `Test (shard \${{ matrix.shard }}/${N0})`), /^if: /, `if: ${KURULUM}`), beklenen: 'koşulu TAM' },
  { ad: "Test koşulu seçim kapısını kaybeder (boş seçimde kurulumsuz `pnpm test`: kırmızı ya da yanlış yeşil)", boz: (c) => sd(c, shardAdim(c, `Test (shard \${{ matrix.shard }}/${N0})`), /^if: /, "if: steps.dagit.outputs.kos != 'false'"), beklenen: 'koşulu TAM' },
  { ad: 'Test koşulu POZİTİF `kos == true` olur (dağıtım çıktısı yoksa Test sessizce ATLANIR)', boz: (c) => sd(c, shardAdim(c, `Test (shard \${{ matrix.shard }}/${N0})`), /^if: /, `if: ${KURULUM} && steps.dagit.outputs.kos == 'true'`), beklenen: 'koşulu TAM' },

  // ── olay kapanışı: seçici yalnız test-shard işinde ───────────────────────────────────────────────────────────────────────────
  { ad: "test-shard işinin `if`i `edited`i de kapsar (seçici edited koşusunda da çalışır)", boz: (c) => sd(c, isAraligi(c.split('\n'), SHARD_ISI), /^if: /, "if: github.event_name == 'pull_request'"), beklenen: 'test-shard işinin `if`i TAM' },
  { ad: "test-shard işinin `if`i kalkar (seçici master push ve elle koşumda da çalışır)", boz: (c) => sd(c, isAraligi(c.split('\n'), SHARD_ISI), /^if: /, null), beklenen: 'test-shard işinin `if`i TAM' },
  { ad: '`ci` işine seçici adımı eklenir (master push/elle koşum/edited koşusunda `ci` içindeki Test daralır)', boz: (c) => metinDegistir(c, ciAdim(c, 'Secret guard (hardcoded DB connection string)'), 'run: |', 'run: |\n          node "$RUNNER_TEMP/secici/test-sec.cjs" --vitestsiz'), beklenen: '`ci` işi test seçiciye başvuruyor' },

  // ── belge hızlı yolu: koşul, sınıf ve yol süzgeci ────────────────────────────────────────────────────────────────────────────
  { ad: 'hızlı yol `edited` koşusunda da açılır (edited koşusunda `ci` içindeki Test kuruluma ihtiyaç duyar)', boz: (c) => sd(c, hizliAr(c), /^if: /, "if: github.event_name == 'pull_request' && steps.sinif.outputs.sinif == 'belge'"), beklenen: 'hızlı yol adımı koşulu TAM' },
  { ad: 'hızlı yol `belge` dışı dar sınıflarda da açılır (betik ve edge değişikliğinde Lint/tip atlanır)', boz: (c) => sd(c, hizliAr(c), /^if: /, `if: ${SHARD_OLAYI} && steps.sinif.outputs.sinif != 'tam'`), beklenen: 'hızlı yol adımı koşulu TAM' },
  { ad: 'hızlı yol sınıfa hiç bakmaz (kod PR\'ında da yol süzgeci tek savunma)', boz: (c) => sd(c, hizliAr(c), /^if: /, `if: ${SHARD_OLAYI}`), beklenen: 'hızlı yol adımı koşulu TAM' },
  { ad: 'hızlı yol yol süzgecine `.cjs` ekler (`.claude/hooks/*.cjs` belgedir ama `eslint .` onu tarar: Lint atlanır)', boz: (c) => metinDegistir(c, hizliAr(c), ":(exclude,glob)**/*.csv'", ":(exclude,glob)**/*.csv' ':(exclude,glob)**/*.cjs'"), beklenen: 'md/txt/csv dışında uzantı girmiş' },
  { ad: 'hızlı yol yol süzgecine `.json` ekler (testlerin içe aktardığı JSON tip denetimini değiştirir)', boz: (c) => metinDegistir(c, hizliAr(c), ":(exclude,glob)**/*.csv'", ":(exclude,glob)**/*.csv' ':(exclude,glob)**/*.json'"), beklenen: 'md/txt/csv dışında uzantı girmiş' },
  { ad: 'hızlı yol yol süzgecini düşürür (`.` dışlamasız: tüm farklar atlatır ya da hiçbiri)', boz: (c) => metinDegistir(c, hizliAr(c), " -- . ':(exclude,glob)**/*.md' ':(exclude,glob)**/*.txt' ':(exclude,glob)**/*.csv'", ''), beklenen: 'yol süzgecini taşımıyor' },
  { ad: 'hızlı yol boş farkı dışlamaz (`! git diff --quiet` kalkar: fark yokken de `belge=true`)', boz: (c) => metinDegistir(c, hizliAr(c), 'if ! git diff --quiet --no-renames HEAD^1 HEAD && git diff --quiet', 'if git diff --quiet'), beklenen: 'boş farkı dışlamıyor' },
  { ad: "hızlı yol `--no-renames`'i kaybeder (`src/a.ts` → `docs/a.md` taşıması yalnız yeni yolla görünür)", boz: (c) => metinDegistir(c, hizliAr(c), 'git diff --quiet --no-renames HEAD^1 HEAD -- .', 'git diff --quiet HEAD^1 HEAD -- .'), beklenen: 'yol süzgecini taşımıyor' },
  { ad: 'hızlı yol her koşuda `belge=true` yazar (süzgeç sonucuna bakmaz)', boz: (c) => metinDegistir(c, hizliAr(c), 'else\n', 'else\n            echo "belge=true" >> "$GITHUB_OUTPUT"\n'), beklenen: 'TEK yerde yazmalı' },
  { ad: 'Lint koşulu hızlı yolun çıktısını POZİTİF okur (`belge == true` iken değil, çıktı yoksa ATLANIR)', boz: (c) => sd(c, ciAdim(c, 'Lint (blocking)'), /^if: /, "if: steps.ayna.outputs.atla != 'true' && steps.hizli.outputs.belge == 'false'"), beklenen: '"Lint (blocking)" koşulu TAM' },
  { ad: 'Type check hızlı yolu okumaz (belge PR\'ında tsc koşar: kazanç sıfır)', boz: (c) => sd(c, ciAdim(c, 'Type check'), /^if: /, "if: steps.ayna.outputs.atla != 'true'"), beklenen: '"Type check" koşulu TAM' },
  { ad: 'Secret guard hızlı yolu okur (belge PR\'ında gizli bilgi taraması atlanır)', boz: (c) => sd(c, ciAdim(c, 'Secret guard (hardcoded DB connection string)'), /^if: /, KOSUL_HIZLI), beklenen: '"Secret guard (hardcoded DB connection string)" hızlı yol çıktısını okuyor' },
  { ad: 'PR kayıt kapısı hızlı yolu okur (belge PR\'ında kayıt kapısı atlanır)', boz: (c) => sd(c, ciAdim(c, 'PR kayıt kapısı (karar 187)'), /^if: /, `if: github.event_name == 'pull_request' && steps.hizli.outputs.belge != 'true'`), beklenen: '"PR kayıt kapısı (karar 187)" hızlı yol çıktısını okuyor' },
  { ad: "`ci` Test'i hızlı yolu okur (edited koşusunda Test kurulumsuz kalır)", boz: (c) => sd(c, ciAdim(c, 'Test'), /^if: /, KOSUL_HIZLI), beklenen: '"Test" hızlı yol çıktısını okuyor' },
  { ad: 'hızlı yol adımı sınıf adımından ÖNCEYE taşınır (sınıf çıktısı henüz yazılmamışken karar verir)', boz: (c) => {
      const h = hizliAr(c)
      const s = ciAdim(c, "Değişiklik sınıfı (siteye dokunmayan PR'da Build atlanır)")
      if (!h || !s) return c
      const satirlar = c.split('\n')
      const blok = satirlar.splice(h.bas, h.bit - h.bas)
      satirlar.splice(s.bas, 0, ...blok)
      return satirlar.join('\n')
    }, beklenen: 'hızlı yol adımı sınıf adımından ÖNCE' },
  { ad: 'hızlı yol adımı silinir (kod kapıları çıktıyı hiç bulamaz: belge PR\'ı kazancı sıfır)', boz: (c) => aralikSil(c, hizliAr(c)), beklenen: `"${HIZLI_ADI}" adımı TAM BİR tane olmalı (bulunan 0)` },

  // ── lifecycle betikleri: yalnız shard kurulumunda kapalı ─────────────────────────────────────────────────────────────────────
  { ad: "shard kurulumu `--ignore-scripts`i kaybeder (kökün postinstall'ı tsc'yi her shard'da yeniden koşar: ~20 sn kayıp)", boz: (c) => sd(c, shardAdim(c, 'Install dependencies'), 'run: pnpm install --prefer-offline --config.allow-scripts true --ignore-scripts', 'run: pnpm install --prefer-offline --config.allow-scripts true'), beklenen: 'shard kurulumu TAM' },
  { ad: '`ci` kurulumuna `--ignore-scripts` girer (tsc `ci` işinde gerçek tip kapısıdır, lifecycle orada kapatılmaz)', boz: (c) => sd(c, ciAdim(c, 'Install dependencies'), 'run: pnpm install --prefer-offline --config.allow-scripts true', 'run: pnpm install --prefer-offline --config.allow-scripts true --ignore-scripts'), beklenen: '`ci` kurulumu TAM' },

  // ── sıra ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  { ad: 'seçim 1/2 kurulumdan SONRAYA kayar (kurulumsuz karar verilemez: boş seçimde kurulum atlanamaz)', boz: (c) => {
      const a = sec(c)
      const hedef = shardAdim(c, 'Node derleme önbelleği (V8 bayt kodu)')
      if (!a || !hedef) return c
      const satirlar = c.split('\n')
      const blok = satirlar.splice(a.bas, a.bit - a.bas)
      satirlar.splice(a.bas < hedef.bas ? hedef.bit - blok.length : hedef.bit, 0, ...blok) // blok hedefin ÖNÜNDEYSE çıkarma hedefi kaydırır; ARKASINDAYSA (ikinci uygulama) kaydırmaz
      return satirlar.join('\n')
    }, beklenen: 'test-shard adım sırası beklenen değil' },
  { ad: 'seçim 2/2 silinir (dağıtıcı çıktı bulamaz, hep TAM: seçimin kazancı yok)', boz: (c) => aralikSil(c, secv(c)), beklenen: 'test-shard adım sırası beklenen değil' },
]

describe('INV-CI-SECIM-1 — test seçimi ve belge hızlı yolu ci.yml’ye doğru bağlı', () => {
  it('bugünkü ci.yml bağlantı kurallarına uyuyor', () => {
    expect(denetle(CI_METNI, DIGERLERI, VITEST_CFG)).toEqual([])
  })

  it('kanarya: ayrıştırıcı boş ya da bozuk metinle yeşil vermez; gerçek dosyada adımlar, öteki iş akışları ve sınırlar okunur', () => {
    expect(denetle('', [], '').length).toBeGreaterThan(0)
    expect(denetle('jobs:\n  baska:\n    runs-on: x\n', [], '').join('|')).toContain('ayrıştırılamadı')
    expect(isAdimlari(CI_METNI, SHARD_ISI).map((a) => a.ad)).toHaveLength(SHARD_SIRASI.length)
    expect(isAdimlari(CI_METNI, CI_ISI).length).toBeGreaterThanOrEqual(20)
    expect(DIGERLERI.length).toBeGreaterThan(10)
    expect(DIGERLERI.some((d) => d.dosya === 'dunya-durumu.yml')).toBe(true)
    expect(N0).toBeGreaterThanOrEqual(2)
  })

  it('shard adım adları matrix sayısıyla (N) uyumlu; seçim adımlarının adı ve gövdesi sabit sözleşmedir', () => {
    expect(isAdimlari(CI_METNI, SHARD_ISI).map((a) => a.ad)).toEqual(SHARD_SIRASI.map((a) => a.replace('/4)', `/${N0})`)))
    expect(runGovdesi(isAdimlari(CI_METNI, SHARD_ISI)[3])).toBe(SEC_GOVDESI)
  })

  it('tüm öteki iş akışlarında (dunya-durumu, e2e-smoke...) seçici ve harita anılmaz; vitest yapılandırması seçiciyi bilmez', () => {
    for (const { dosya, metin } of DIGERLERI) expect(/test-sec|test-haritasi/.test(metin), dosya).toBe(false)
    expect(/test-sec|secilen/.test(VITEST_CFG)).toBe(false)
  })

  describe('sabotaj tablosu: bozulma TÜRLERİ (yakalayan denetim mesajda sabit)', () => {
    it.each(BOZULMALAR)('$ad', ({ boz, beklenen }) => {
      const bozuk = boz(CI_METNI)
      expect(bozuk === CI_METNI, "fikstür: bozucu hiçbir şeyi değiştirmedi (hedef adım/satır ci.yml'de yok)").toBe(false)
      const ihlal = denetle(bozuk, DIGERLERI, VITEST_CFG)
      expect(ihlal.length, 'denetim bozulmayı HİÇ görmedi').toBeGreaterThan(0)
      expect(ihlal.join('\n')).toContain(beklenen)
    })

    it('tablo kendi kendini sınar: bozulmamış ci.yml temiz, adlar benzersiz, en az 40 bozulma, her bozucu İKİ KEZ uygulanınca da kırmızı', () => {
      expect(denetle(CI_METNI, DIGERLERI, VITEST_CFG)).toEqual([])
      expect(new Set(BOZULMALAR.map((b) => b.ad)).size).toBe(BOZULMALAR.length)
      expect(BOZULMALAR.length).toBeGreaterThanOrEqual(40)
      for (const b of BOZULMALAR) expect(denetle(b.boz(b.boz(CI_METNI)), DIGERLERI, VITEST_CFG).length, b.ad).toBeGreaterThan(0)
    })

    it("öteki iş akışlarındaki sızıntı yakalanır: dunya-durumu.yml seçiciyi çağırırsa kırmızı", () => {
      const sizdi = DIGERLERI.map((d) => (d.dosya === 'dunya-durumu.yml' ? { ...d, metin: `${d.metin}\n      - run: node scripts/ci/test-sec.cjs --vitestsiz\n` } : d))
      expect(denetle(CI_METNI, sizdi, VITEST_CFG).join('|')).toContain('dunya-durumu.yml test seçiciye başvuruyor')
      expect(denetle(CI_METNI, DIGERLERI, `${VITEST_CFG}\n// test-sec`).join('|')).toContain('vitest.config.ts seçiciye bağlanmış')
    })
  })
})
