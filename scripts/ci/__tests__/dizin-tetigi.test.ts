import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-DIZIN-TETIGI-1 · DİZİN TETİĞİ İŞ AKIŞI (.github/workflows/dizin-tetigi.yml, ALT-91, SEO-55 Parça C).
 *
 * İş akışı canlıya çıkan her değişiklikte `scripts/seo/degisen-adres-bildir.mjs`'i koşar. Yanlış yönde hata iki biçimde
 * görünür: tetik hiç çalışmaz (sessiz yeşil: bildirim gitmez, kimse görmez) ya da yanlış yerde çalışır (preview dağıtımı,
 * pull_request, depo içi taban dosyası). Bu test ikisini de ölçer:
 *   1. STATİK kurallar: tetikler, ortam süzgeci, izinler, sabit aksiyonlar, sır/kurulum yokluğu, önbellek biçimi,
 *   2. DAVRANIŞ: "Degisen adresleri bildir" adımının kabuk metni sahte `node` ile gerçekten koşulur
 *      (taban yok / boş / dolu, çıkış kodunun iş akışına yansıması, dizinin açılması, uyarının yazılması),
 *   3. SABOTAJ: iş akışı metnine tek tek hata sokulur; her hatalı kopya en az bir kuralı ya da senaryoyu kırmızıya çevirir.
 *
 * Betiğin kendisinin (fark, K4 süzgeci, IndexNow) testi GEO-SEO'nundur: scripts/seo/__tests__/degisen-adres-bildir.test.ts.
 */

const KOK = path.resolve(__dirname, '../../..')
const IS_AKISI = path.join(KOK, '.github/workflows/dizin-tetigi.yml')
const GERCEK = readFileSync(IS_AKISI, 'utf8').replace(/\r\n/g, '\n')
const ADIM_ADI = 'Degisen adresleri bildir'

/** Yorum satırlarını atar: kurallar KOD satırlarına bakar, açıklama metnine değil. */
function kod(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

/** `jobs:` altındaki bir işin metnini döndürür (iki boşluk girintili anahtardan sonrakine kadar); yoksa null. */
function isBlogu(k: string, ad: string): string | null {
  const jobs = k.split(/^jobs:\n/m)[1]
  if (jobs === undefined) return null
  const parcalar = jobs.split(/^ {2}(?=[a-z-]+:\n)/m)
  const p = parcalar.find((x) => x.startsWith(`${ad}:\n`))
  return p === undefined ? null : p
}

/** Statik kural ihlallerini döndürür (boş dizi = temiz). */
function denetle(metin: string): string[] {
  const k = kod(metin)
  const ihlal: string[] = []
  const var_ = (re: RegExp) => re.test(k)

  if (!var_(/^ {2}deployment_status:/m)) ihlal.push('tetik: deployment_status yok')
  if (!var_(/^ {2}schedule:\n\s+- cron: '/m)) ihlal.push('tetik: günlük schedule yok')
  if (!var_(/^ {2}workflow_dispatch:/m)) ihlal.push('tetik: elle tetik (workflow_dispatch) yok')
  if (var_(/^ {2}(pull_request|pull_request_target|push):/m)) ihlal.push('tetik: pull_request/push OLMAMALI (birleşmeyi bloklamaz, fork koduyla koşmaz)')

  // ⭐ÖLÇÜLEN KUSUR (16 Ekim, ilk dört doğal koşu): actions/cache `deployment_status` olayında ("not tied to a branch or
  // tag ref") restore VE save adımını ATLAR. Asıl iş bu olayda koşarsa taban hiç kaydedilmez, her koşu tabanı yeniden
  // kurar ve değişen adres HİÇ bildirilmez, üstelik iş akışı yeşil görünür. Bu yüzden: asıl iş deployment_status'ta
  // KOŞMAZ; yalnız `tetikle` işi dispatch eder.
  const tetikle = isBlogu(k, 'tetikle')
  const asil = isBlogu(k, 'dizin-tetigi')
  if (tetikle === null) ihlal.push('iş: `tetikle` işi yok (deployment_status asıl işi dispatch etmeli)')
  if (asil === null) ihlal.push('iş: `dizin-tetigi` (asıl iş) yok')
  if (tetikle !== null) {
    if (!tetikle.includes("github.event_name == 'deployment_status'")) ihlal.push("tetikle: yalnız deployment_status olayında koşmalı")
    if (!tetikle.includes("github.event.deployment_status.state == 'success'")) ihlal.push("süzgeç: yalnız success durumu değil (pending/failure da tetikler)")
    if (!tetikle.includes("github.event.deployment.environment == 'Production'")) ihlal.push("süzgeç: yalnız Production ortamı değil (preview da tetikler)")
    if (!/^ {6}actions: write$/m.test(tetikle)) ihlal.push('tetikle: actions: write izni yok (gh workflow run 403 verir, hiç bildirim gitmez)')
    if (!/gh workflow run dizin-tetigi\.yml --ref "\$VARSAYILAN_DAL"/.test(tetikle)) ihlal.push('tetikle: `gh workflow run dizin-tetigi.yml --ref "$VARSAYILAN_DAL"` yok (varsayılan dal ref\'i olmadan önbellek çalışmaz)')
    if (!/VARSAYILAN_DAL: \$\{\{ github\.event\.repository\.default_branch \}\}/.test(tetikle)) ihlal.push('tetikle: ref varsayılan daldan okunmuyor')
    if (/actions\/(cache|checkout)|uses:|degisen-adres-bildir/.test(tetikle)) ihlal.push('tetikle: önbelleğe/depoya/betiğe dokunmamalı (yalnız dispatch)')
  }
  if (asil !== null) {
    if (!/^ {4}if: github\.event_name != 'deployment_status'$/m.test(asil)) ihlal.push("asıl iş: koşulu tam `github.event_name != 'deployment_status'` olmalı (önbellek deployment_status'ta ÇALIŞMAZ)")
    if (/^ {4,}[a-z-]+:\s*write\s*$/m.test(asil)) ihlal.push('asıl iş: write izni VAR (yalnız tetikle işi actions: write alır)')
    if (!/^ {6}group: dizin-tetigi$/m.test(asil)) ihlal.push('concurrency: grup dizin-tetigi değil (asıl işte olmalı)')
    if (!/^ {6}cancel-in-progress: false$/m.test(asil)) ihlal.push('concurrency: cancel-in-progress false olmalı (tabana tek yazar, bekleyen en güncel tabanla koşar)')
  }
  if (var_(/^concurrency:/m)) ihlal.push('concurrency: iş akışı düzeyinde olmamalı (tetikle koşusu asıl işin sırasına girer)')

  if (!var_(/^permissions:\n {2}contents: read\n(?! {2}\S)/m)) ihlal.push('izin: tek izin contents: read olmalı')
  const yazmalar = [...k.matchAll(/^\s+([a-z-]+):\s*write\s*$/gm)].map((m) => m[1])
  if (yazmalar.some((a) => a !== 'actions') || yazmalar.length !== 1) ihlal.push(`izin: tek write izni tetikle işindeki actions: write olmalı (bulunan: ${yazmalar.join(',') || 'yok'})`)

  if (var_(/secrets\./)) ihlal.push('sır: secrets.* kullanılmamalı (IndexNow anahtarı kamuya açık)')
  if (var_(/INDEXNOW_KEY/)) ihlal.push('sır: INDEXNOW_KEY ortam değişkeni iş akışında olmamalı')
  if (var_(/self-hosted/)) ihlal.push('runner: self-hosted YASAK (public depo)')
  if (var_(/pnpm\s+(install|i)\b/)) ihlal.push('kurulum: pnpm install olmamalı (betik yalnız Node yerleşikleri)')

  const kullanimlar = [...k.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map((m) => m[1])
  if (kullanimlar.length === 0) ihlal.push('aksiyon: hiç uses yok')
  for (const u of kullanimlar) if (!/@[0-9a-f]{40}$/.test(u)) ihlal.push(`aksiyon: commit'e sabit değil: ${u}`)
  if (var_(/actions\/cache@/)) ihlal.push('önbellek: düz actions/cache@ olmamalı (anahtar değişmez; restore + save ayrı kullanılır)')
  if (!kullanimlar.some((u) => u.startsWith('actions/cache/restore@'))) ihlal.push('önbellek: actions/cache/restore adımı yok')
  if (!kullanimlar.some((u) => u.startsWith('actions/cache/save@'))) ihlal.push('önbellek: actions/cache/save adımı yok')
  if (!var_(/key: dizin-tetigi-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/)) ihlal.push('önbellek: anahtar run_id + run_attempt içermeli (her koşu yeni anahtar)')
  if (!var_(/restore-keys: \|\n\s+dizin-tetigi-\n/)) ihlal.push('önbellek: restore-keys dizin-tetigi- öneki yok (önceki taban geri yüklenmez)')
  if (!var_(/name: Taban ve kuyrugu onbellege yaz\n\s+if: \$\{\{ always\(\) \}\}/)) ihlal.push('önbellek: kaydetme adımı always() değil (çıkış 1 ile tabanın ilerlemesi kaybolur)')
  // Anahtar tutarlılığı: KAYDEDİLEN anahtar, GERİ YÜKLENEN önekle başlamıyorsa kayıt var ama hiçbir koşu onu bulamaz
  // (sessiz yeşil: her koşu tabanı yeniden kurar). Üç yer aynı öneki taşımalı: restore key, restore-keys, save key.
  const onek = /restore-keys: \|\n\s+(\S+)\n/.exec(k)?.[1]
  const anahtarlar = [...k.matchAll(/^\s+key: (.+)$/gm)].map((m) => m[1])
  if (!onek) ihlal.push('önbellek: restore-keys öneki okunamadı')
  else if (anahtarlar.length !== 2 || anahtarlar.some((a) => !a.startsWith(onek))) ihlal.push(`önbellek: restore ve save anahtarları '${onek}' önekiyle başlamalı (bulunan: ${anahtarlar.join(' | ')}); aksi hâlde kaydedilen taban bir sonraki koşuda bulunamaz`)

  if (!var_(/DIZIN: \$\{\{ runner\.temp \}\}\/dizin-tetigi$/m)) ihlal.push('yol: DIZIN runner.temp altında değil (taban DEPO DIŞINDA olmalı)')
  if (var_(/github\.workspace/)) ihlal.push('yol: github.workspace kullanılmamalı (betik depo içi yolu reddeder)')
  if (!var_(/--taban "\$DIZIN\/taban\.json" --kuyruk "\$DIZIN\/google-kuyruk\.jsonl"/)) ihlal.push('betik: --taban/--kuyruk $DIZIN altında değil')
  if (!var_(/KIP=--taban-kur/) || !var_(/KIP=--uygula/)) ihlal.push('betik: --taban-kur ve --uygula iki dalı da olmalı')
  if (!var_(/::warning/)) ihlal.push('betik: taban yokken açık uyarı (::warning) yok')
  if (!var_(/\[ -s "\$DIZIN\/taban\.json" \]/)) ihlal.push('betik: boş taban dosyası "taban var" sayılıyor (-s olmalı)')

  for (const [ad, blok] of [['tetikle', tetikle], ['dizin-tetigi', asil]] as const) {
    if (blok !== null && !/^ {4}timeout-minutes: \d+$/m.test(blok)) ihlal.push(`iş: ${ad} işinde timeout-minutes yok`)
  }
  if (!var_(/node-version: '24'/)) ihlal.push("iş: node-version '24' değil")
  return ihlal
}

/** "Degisen adresleri bildir" adımının `run: |` gövdesini çıkarır. */
function adimKabugu(metin: string): string | null {
  const satirlar = metin.split('\n')
  const i = satirlar.findIndex((s) => s.includes(`name: ${ADIM_ADI}`))
  if (i < 0) return null
  const r = satirlar.findIndex((s, j) => j > i && /^\s{8}run: \|\s*$/.test(s))
  if (r < 0) return null
  const govde: string[] = []
  for (let j = r + 1; j < satirlar.length; j++) {
    const s = satirlar[j]
    if (s.trim() !== '' && !s.startsWith(' '.repeat(10))) break
    govde.push(s.slice(10))
  }
  return govde.join('\n')
}

const GECICI = mkdtempSync(path.join(tmpdir(), 'dizin-tetigi-'))
afterAll(() => rmSync(GECICI, { recursive: true, force: true }))
const duz = (p: string) => p.replace(/\\/g, '/')

// Sahte node: argümanları KAYIT dosyasına yazar, SAHTE_CIKIS ile çıkar. `--taban-kur` verilince gerçek betik gibi
// `--taban` yoluna taban dosyasını YAZAR: iki koşulu önbellek simülasyonu (birinci koşu kurar, ikincisi bulur) bunu ölçer.
const SAHTE_BIN = path.join(GECICI, 'bin')
mkdirSync(SAHTE_BIN, { recursive: true })
writeFileSync(
  path.join(SAHTE_BIN, 'node'),
  '#!/usr/bin/env bash\nprintf \'%s\\n\' "$@" > "$KAYIT"\nTABAN=""\nKUR=0\nwhile [ $# -gt 0 ]; do\n  case "$1" in\n    --taban) TABAN="$2"; shift ;;\n    --taban-kur) KUR=1 ;;\n  esac\n  shift\ndone\nif [ "$KUR" = 1 ] && [ -n "$TABAN" ]; then printf \'{"adresler":{}}\' > "$TABAN"; fi\nexit "${SAHTE_CIKIS:-0}"\n',
  'utf8',
)
chmodSync(path.join(SAHTE_BIN, 'node'), 0o755)

type Durum = 'yok' | 'bos' | 'dolu' | 'mevcut'
type KosuSonucu = { cikis: number | null; stdout: string; stderr: string; argumanlar: string[]; dizinVar: boolean; dizin: string }
let sayac = 0
/** `mevcut`: önceki koşunun dizini AYNEN kalır (önbellekten geri yüklenmiş gibi); `onceki` o dizinin yolunu verir. */
function kos(kabuk: string, durum: Durum, sahteCikis = 0, onceki?: string): KosuSonucu {
  const dizin = onceki ?? duz(path.join(GECICI, `kosu-${++sayac}`, 'dizin-tetigi'))
  const kayit = duz(path.join(GECICI, `kosu-${++sayac}-args.txt`))
  mkdirSync(path.dirname(dizin), { recursive: true })
  if (durum !== 'yok' && durum !== 'mevcut') {
    mkdirSync(dizin, { recursive: true })
    writeFileSync(`${dizin}/taban.json`, durum === 'dolu' ? '{"adresler":{}}' : '', 'utf8')
  }
  const r = spawnSync('bash', ['-c', kabuk], {
    cwd: GECICI,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, PATH: `${duz(SAHTE_BIN)}${path.delimiter}${process.env.PATH ?? ''}`, DIZIN: dizin, KAYIT: kayit, SAHTE_CIKIS: String(sahteCikis) },
  })
  const argumanlar = existsSync(kayit) ? readFileSync(kayit, 'utf8').split('\n').filter(Boolean) : []
  return { cikis: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', argumanlar, dizinVar: existsSync(dizin), dizin }
}

/** Kabuk adımının davranış ihlallerini döndürür (boş dizi = temiz). */
function davranis(metin: string): string[] {
  const kabuk = adimKabugu(metin)
  if (kabuk === null) return ['davranış: "Degisen adresleri bildir" adımının run gövdesi bulunamadı']
  const ihlal: string[] = []

  const yok = kos(kabuk, 'yok')
  if (yok.cikis !== 0) ihlal.push(`taban yok: çıkış 0 olmalı (${yok.cikis}) ${yok.stderr.slice(0, 120)}`)
  if (!yok.dizinVar) ihlal.push('taban yok: dizin açılmadı (mkdir -p)')
  if (!yok.argumanlar.includes('--taban-kur')) ihlal.push('taban yok: --taban-kur verilmedi')
  if (yok.argumanlar.includes('--uygula')) ihlal.push('taban yok: --uygula verilmemeli (ilk koşuda bütün harita yeni sayılır)')
  if (!yok.stdout.includes('::warning')) ihlal.push('taban yok: açık uyarı (::warning) yazılmadı')
  if (!yok.argumanlar.includes(`${yok.dizin}/taban.json`) || !yok.argumanlar.includes(`${yok.dizin}/google-kuyruk.jsonl`)) ihlal.push('taban yok: --taban/--kuyruk $DIZIN altında değil')

  const bos = kos(kabuk, 'bos')
  if (!bos.argumanlar.includes('--taban-kur') || bos.argumanlar.includes('--uygula')) ihlal.push('boş taban: yeniden kurulmalı (--taban-kur), --uygula DEĞİL')

  const dolu = kos(kabuk, 'dolu')
  if (!dolu.argumanlar.includes('--uygula')) ihlal.push('dolu taban: --uygula verilmedi')
  if (dolu.argumanlar.includes('--taban-kur')) ihlal.push('dolu taban: --taban-kur verilmemeli (tabanı ezer)')
  if (dolu.stdout.includes('::warning')) ihlal.push('dolu taban: gereksiz uyarı')
  if (dolu.cikis !== 0) ihlal.push(`dolu taban: çıkış 0 olmalı (${dolu.cikis})`)

  const kirmizi = kos(kabuk, 'dolu', 1)
  if (kirmizi.cikis !== 1) ihlal.push(`betik çıkış 1 verince adım kırmızı olmalı (${kirmizi.cikis}): hata yutulmamalı`)

  // ⭐İKİ KOŞU (OPS, ALT-91 düzeltmesi): önbellek varken ikinci koşuda taban YENİDEN KURULMAZ, yalnız değişen adres
  // bildirilir. Birinci koşu tabanı kurar (sahte node dosyayı yazar); ikinci koşu aynı dizini "geri yüklenmiş" bulur.
  const ilk = kos(kabuk, 'yok')
  const ikinci = kos(kabuk, 'mevcut', 0, ilk.dizin)
  if (!ilk.argumanlar.includes('--taban-kur')) ihlal.push('iki koşu: birinci koşu tabanı kurmadı')
  if (!ikinci.argumanlar.includes('--uygula')) ihlal.push('iki koşu: ikinci koşu --uygula vermedi (taban önbellekte var, değişen adres bildirilmeli)')
  if (ikinci.argumanlar.includes('--taban-kur')) ihlal.push('iki koşu: ikinci koşuda taban YENİDEN KURULUYOR (önbellek işlevsiz: değişen adres hiç bildirilmez)')
  if (ikinci.stdout.includes('::warning')) ihlal.push('iki koşu: ikinci koşuda "taban yok" uyarısı çıktı')
  return ihlal
}

describe('INV-DIZIN-TETIGI-1 · 1. gerçek iş akışı dosyası', () => {
  it('statik kuralların hepsi temiz', () => {
    expect(denetle(GERCEK)).toEqual([])
  })

  it('kabuk adımı bulunur ve davranış kuralları temiz (sahte node ile gerçekten koşar)', () => {
    expect(davranis(GERCEK)).toEqual([])
  })
})

type Sabotaj = { ad: string; eski: string; yeni: string; hepsi?: boolean }
const SABOTAJLAR: Sabotaj[] = [
  { ad: 'deployment_status tetiği silinir', eski: 'on:\n  deployment_status:\n', yeni: 'on:\n' },
  { ad: 'günlük schedule silinir', eski: "  schedule:\n    # Günde bir, tam saat DEĞİL (GitHub tam saatlerde zamanlanmış işleri geciktiriyor): 05:37 UTC = 08:37 TR.\n    - cron: '37 5 * * *'\n", yeni: '' },
  { ad: 'elle tetik silinir', eski: '  workflow_dispatch:\n', yeni: '' },
  { ad: 'push tetiği eklenir', eski: 'on:\n  deployment_status:\n', yeni: 'on:\n  push:\n  deployment_status:\n' },
  { ad: 'pull_request tetiği eklenir', eski: 'on:\n  deployment_status:\n', yeni: 'on:\n  pull_request:\n  deployment_status:\n' },
  { ad: 'success süzgeci kalkar (pending/failure da tetikler)', eski: "github.event.deployment_status.state == 'success' && ", yeni: '' },
  { ad: 'ortam Preview olur', eski: "github.event.deployment.environment == 'Production'", yeni: "github.event.deployment.environment == 'Preview'" },
  { ad: "asıl iş deployment_status'ta da koşar (önbellek orada çalışmaz: sessiz yeşil, bildirim yok)", eski: "    if: github.event_name != 'deployment_status'\n", yeni: '' },
  { ad: 'asıl iş koşulu gevşer (deployment_status kolu geri gelir)', eski: "    if: github.event_name != 'deployment_status'\n", yeni: "    if: github.event_name != 'deployment_status' || github.event.deployment_status.state == 'success'\n" },
  { ad: 'tetikle işinden actions: write kalkar (gh workflow run 403 verir)', eski: '    permissions:\n      actions: write\n', yeni: '' },
  { ad: 'tetikle ref vermez (dispatch varsayılan dal ref\'inde koşmaz)', eski: ' --ref "$VARSAYILAN_DAL"', yeni: '' },
  { ad: 'tetikle ref\'i etkinlik ref\'inden okur (deployment_status ref\'i dal değil)', eski: '${{ github.event.repository.default_branch }}', yeni: '${{ github.ref }}' },
  { ad: 'tetikle işi önbelleğe dokunur', eski: '        run: gh workflow run', yeni: '        uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9\n        run: gh workflow run' },
  { ad: 'concurrency kalkar (iki koşu tabanı aynı anda yazar)', eski: '    concurrency:\n      group: dizin-tetigi\n      cancel-in-progress: false\n', yeni: '' },
  { ad: 'concurrency iş akışı düzeyine de eklenir (tetikle koşusu asıl işin sırasına girer)', eski: '\njobs:\n  tetikle:', yeni: '\nconcurrency:\n  group: dizin-tetigi\n  cancel-in-progress: false\n\njobs:\n  tetikle:' },
  { ad: 'KAYDEDİLEN anahtar öneki bozulur (taban kaydedilir ama hiçbir koşu bulamaz)', eski: 'actions/cache/save@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0\n        with:\n          path: ${{ runner.temp }}/dizin-tetigi\n          key: dizin-tetigi-', yeni: 'actions/cache/save@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0\n        with:\n          path: ${{ runner.temp }}/dizin-tetigi\n          key: baska-' },
  { ad: 'GERİ YÜKLENEN restore-keys öneki bozulur (kaydedilen taban bulunmaz)', eski: '            dizin-tetigi-\n', yeni: '            baska-\n' },
  { ad: 'restore key öneki bozulur', eski: 'actions/cache/restore@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0\n        with:\n          path: ${{ runner.temp }}/dizin-tetigi\n          key: dizin-tetigi-', yeni: 'actions/cache/restore@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0\n        with:\n          path: ${{ runner.temp }}/dizin-tetigi\n          key: baska-' },
  { ad: 'önbellek restore adımı silinir (her koşu tabanı yeniden kurar)', eski: 'actions/cache/restore@', yeni: 'actions/cache/restoreyok@' },
  { ad: 'contents izni write olur', eski: 'permissions:\n  contents: read\n', yeni: 'permissions:\n  contents: write\n' },
  { ad: 'ek izin eklenir', eski: 'permissions:\n  contents: read\n', yeni: 'permissions:\n  contents: read\n  id-token: write\n' },
  { ad: 'cancel-in-progress true olur', eski: 'cancel-in-progress: false', yeni: 'cancel-in-progress: true' },
  { ad: 'checkout commit sabitinden etikete düşer', eski: 'actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0', yeni: 'actions/checkout@v4' },
  { ad: 'önbellek restore adımı düz actions/cache olur', eski: 'actions/cache/restore@', yeni: 'actions/cache@' },
  { ad: 'önbellek save adımı silinir (taban hiç ilerlemez)', eski: 'actions/cache/save@', yeni: 'actions/cache/saveyok@' },
  { ad: 'anahtardan run_attempt çıkar', eski: '-${{ github.run_attempt }}', yeni: '', hepsi: true },
  { ad: 'restore-keys silinir (önceki taban geri gelmez)', eski: '          restore-keys: |\n            dizin-tetigi-\n', yeni: '' },
  { ad: 'save adımı always() olmaktan çıkar', eski: '        if: ${{ always() }}\n', yeni: '' },
  { ad: 'DIZIN depo içine (github.workspace) taşınır', eski: 'DIZIN: ${{ runner.temp }}/dizin-tetigi', yeni: 'DIZIN: ${{ github.workspace }}/dizin-tetigi' },
  { ad: 'sır eklenir', eski: '          DIZIN: ${{ runner.temp }}/dizin-tetigi\n', yeni: '          DIZIN: ${{ runner.temp }}/dizin-tetigi\n          ANAHTAR: ${{ secrets.INDEXNOW }}\n' },
  { ad: 'pnpm install eklenir', eski: '          set -euo pipefail\n', yeni: '          pnpm install\n          set -euo pipefail\n' },
  { ad: 'self-hosted runner', eski: 'runs-on: ubuntu-latest', yeni: 'runs-on: self-hosted', hepsi: true },
  { ad: 'timeout silinir', eski: '    timeout-minutes: 20\n', yeni: '' },
  { ad: 'Node sürümü düşer', eski: "node-version: '24'", yeni: "node-version: '20'" },
  { ad: 'taban yoksa da --uygula verilir (ilk koşuda bütün harita yeni sayılır)', eski: 'KIP=--taban-kur', yeni: 'KIP=--uygula' },
  { ad: 'taban varsa --taban-kur verilir (taban ezilir)', eski: 'KIP=--uygula\n', yeni: 'KIP=--taban-kur\n' },
  { ad: 'boş taban dosyası "var" sayılır (-s yerine -f)', eski: '[ -s "$DIZIN/taban.json" ]', yeni: '[ -f "$DIZIN/taban.json" ]' },
  { ad: 'taban yokken uyarı yazılmaz', eski: 'echo "::warning title=Dizin tetigi::', yeni: 'echo "title=Dizin tetigi::' },
  { ad: 'dizin açılmaz (mkdir -p silinir)', eski: '          mkdir -p "$DIZIN"\n', yeni: '' },
  { ad: 'betik hatası yutulur (|| true)', eski: '"$KIP"\n\n      # Betik', yeni: '"$KIP" || true\n\n      # Betik' },
  { ad: '--kuyruk yolu depo içine kayar', eski: '--kuyruk "$DIZIN/google-kuyruk.jsonl"', yeni: '--kuyruk "./google-kuyruk.jsonl"' },
]

// Sabitlenmiş kullanımlar (`actions/x@<40 hane sha> # vN.N.N`) dependabot ile değişir. Sabotaj
// metinleri bu sha ve sürüm numaralarını elle taşıyordu; checkout 4→7 yükseltmesinde (#2001) sabotaj
// noktası bulunamayıp test kırmızı oldu. Bu yüzden eski sabitler gerçek kaynaktaki güncel sabitle
// değiştirilir; sabotajın ne bozduğu değişmez, yalnız aranan satırın sürümü kaynaktan okunur.
function sabitOku(yol: string): { sha: string; surum: string } {
  const m = new RegExp(`${yol}@([0-9a-f]{40}) # (v[0-9.]+)`).exec(GERCEK)
  if (!m) throw new Error(`iş akışında sabitlenmiş kullanım bulunamadı: ${yol}`)
  return { sha: m[1], surum: m[2] }
}
const ESKI_CHECKOUT = '11d5960a326750d5838078e36cf38b85af677262 # v4.4.0'
const ESKI_CACHE_SHA = '55cc8345863c7cc4c66a329aec7e433d2d1c52a9'
function sabitle(metin: string): string {
  const co = sabitOku('actions/checkout')
  const ca = sabitOku('actions/cache/save')
  return metin
    .split(ESKI_CHECKOUT).join(`${co.sha} # ${co.surum}`)
    .split(`${ESKI_CACHE_SHA} # v6.1.0`).join(`${ca.sha} # ${ca.surum}`)
    .split(ESKI_CACHE_SHA).join(ca.sha)
}

function sabotajli(s: Sabotaj): string {
  const eski = sabitle(s.eski)
  const yeni = sabitle(s.yeni)
  const parca = GERCEK.split(eski)
  if (s.hepsi) {
    if (parca.length < 2) throw new Error(`sabotaj noktası kaynakta bulunamadı: ${s.ad}`)
    return parca.join(yeni)
  }
  if (parca.length !== 2) throw new Error(`sabotaj noktası kaynakta TAM BİR KEZ bulunmalı (${parca.length - 1} kez): ${s.ad}`)
  return parca.join(yeni)
}

describe('INV-DIZIN-TETIGI-1 · 2. sabotaj: iş akışına konan her tek hata en az bir kuralı ya da senaryoyu KIRMIZIYA çevirir', () => {
  it.each(SABOTAJLAR.map((s) => [s.ad, s] as const))('%s', (_ad, s) => {
    const metin = sabotajli(s)
    const toplam = [...denetle(metin), ...davranis(metin)]
    expect(toplam.length, `sabotaj HİÇBİR kuralı kırmızıya çevirmedi: "${s.ad}" — bu karar testle korunmuyor`).toBeGreaterThan(0)
  })
})
