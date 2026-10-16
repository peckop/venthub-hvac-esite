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

/** Statik kural ihlallerini döndürür (boş dizi = temiz). */
function denetle(metin: string): string[] {
  const k = kod(metin)
  const ihlal: string[] = []
  const var_ = (re: RegExp) => re.test(k)

  if (!var_(/^ {2}deployment_status:/m)) ihlal.push('tetik: deployment_status yok')
  if (!var_(/^ {2}schedule:\n\s+- cron: '/m)) ihlal.push('tetik: günlük schedule yok')
  if (!var_(/^ {2}workflow_dispatch:/m)) ihlal.push('tetik: elle tetik (workflow_dispatch) yok')
  if (var_(/^ {2}(pull_request|pull_request_target|push):/m)) ihlal.push('tetik: pull_request/push OLMAMALI (birleşmeyi bloklamaz, fork koduyla koşmaz)')

  if (!k.includes("github.event_name != 'deployment_status'")) ihlal.push("süzgeç: diğer olaylar için 'event_name != deployment_status' kolu yok")
  if (!k.includes("github.event.deployment_status.state == 'success'")) ihlal.push("süzgeç: yalnız success durumu değil (pending/failure da tetikler)")
  if (!k.includes("github.event.deployment.environment == 'Production'")) ihlal.push("süzgeç: yalnız Production ortamı değil (preview da tetikler)")

  if (!var_(/^permissions:\n {2}contents: read\n(?! {2}\S)/m)) ihlal.push('izin: tek izin contents: read olmalı')
  if (var_(/^\s+[a-z-]+:\s*write\s*$/m)) ihlal.push('izin: write izni VAR')

  if (!var_(/^ {2}group: dizin-tetigi$/m)) ihlal.push('concurrency: grup dizin-tetigi değil')
  if (!var_(/^ {2}cancel-in-progress: false$/m)) ihlal.push('concurrency: cancel-in-progress false olmalı (tabana tek yazar, bekleyen en güncel tabanla koşar)')

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

  if (!var_(/DIZIN: \$\{\{ runner\.temp \}\}\/dizin-tetigi$/m)) ihlal.push('yol: DIZIN runner.temp altında değil (taban DEPO DIŞINDA olmalı)')
  if (var_(/github\.workspace/)) ihlal.push('yol: github.workspace kullanılmamalı (betik depo içi yolu reddeder)')
  if (!var_(/--taban "\$DIZIN\/taban\.json" --kuyruk "\$DIZIN\/google-kuyruk\.jsonl"/)) ihlal.push('betik: --taban/--kuyruk $DIZIN altında değil')
  if (!var_(/KIP=--taban-kur/) || !var_(/KIP=--uygula/)) ihlal.push('betik: --taban-kur ve --uygula iki dalı da olmalı')
  if (!var_(/::warning/)) ihlal.push('betik: taban yokken açık uyarı (::warning) yok')
  if (!var_(/\[ -s "\$DIZIN\/taban\.json" \]/)) ihlal.push('betik: boş taban dosyası "taban var" sayılıyor (-s olmalı)')

  if (!var_(/^ {4}timeout-minutes: \d+$/m)) ihlal.push('iş: timeout-minutes yok')
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

// Sahte node: argümanları KAYIT dosyasına yazar, SAHTE_CIKIS ile çıkar.
const SAHTE_BIN = path.join(GECICI, 'bin')
mkdirSync(SAHTE_BIN, { recursive: true })
writeFileSync(path.join(SAHTE_BIN, 'node'), '#!/usr/bin/env bash\nprintf \'%s\\n\' "$@" > "$KAYIT"\nexit "${SAHTE_CIKIS:-0}"\n', 'utf8')
chmodSync(path.join(SAHTE_BIN, 'node'), 0o755)

type Durum = 'yok' | 'bos' | 'dolu'
type KosuSonucu = { cikis: number | null; stdout: string; stderr: string; argumanlar: string[]; dizinVar: boolean; dizin: string }
let sayac = 0
function kos(kabuk: string, durum: Durum, sahteCikis = 0): KosuSonucu {
  const dizin = duz(path.join(GECICI, `kosu-${++sayac}`, 'dizin-tetigi'))
  const kayit = duz(path.join(GECICI, `kosu-${sayac}-args.txt`))
  mkdirSync(path.dirname(dizin), { recursive: true })
  if (durum !== 'yok') {
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
  { ad: 'diğer olaylar kolu kalkar (cron çalışmaz)', eski: "github.event_name != 'deployment_status' || ", yeni: '' },
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
  { ad: 'self-hosted runner', eski: 'runs-on: ubuntu-latest', yeni: 'runs-on: self-hosted' },
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

function sabotajli(s: Sabotaj): string {
  const parca = GERCEK.split(s.eski)
  if (s.hepsi) {
    if (parca.length < 2) throw new Error(`sabotaj noktası kaynakta bulunamadı: ${s.ad}`)
    return parca.join(s.yeni)
  }
  if (parca.length !== 2) throw new Error(`sabotaj noktası kaynakta TAM BİR KEZ bulunmalı (${parca.length - 1} kez): ${s.ad}`)
  return parca.join(s.yeni)
}

describe('INV-DIZIN-TETIGI-1 · 2. sabotaj: iş akışına konan her tek hata en az bir kuralı ya da senaryoyu KIRMIZIYA çevirir', () => {
  it.each(SABOTAJLAR.map((s) => [s.ad, s] as const))('%s', (_ad, s) => {
    const metin = sabotajli(s)
    const toplam = [...denetle(metin), ...davranis(metin)]
    expect(toplam.length, `sabotaj HİÇBİR kuralı kırmızıya çevirmedi: "${s.ad}" — bu karar testle korunmuyor`).toBeGreaterThan(0)
  })
})
