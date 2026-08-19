#!/usr/bin/env node
/**
 * INV-NODE-1'in ÜÇÜNCÜ YÜZEYİ: derlemenin GERÇEKTEN hangi Node ana sürümünde koştuğunu ÖLÇER.
 *
 * NİÇİN VAR (2026-08-19 ölçümü): T092 ile üç yüzey `24.x` olarak hizalandı, ama "prod artık 24'te
 * koşuyor" iddiası ÖLÇÜLEMİYORDU. Üç yüzey tek tek denendi ve üçü de sustu:
 *   - Vercel build günlüğü Node sürümünü HİÇ yazmıyor.
 *   - Dağıtım kaydında `nodeVersion` alanı YOK (`lambdaRuntimeStats` yalnız `{"nodejs":5}` diyor).
 *   - `/api/health` `process.version` yayınlamıyor.
 * Yani iddia ÖLÇÜME değil Vercel dokümanındaki "engines ezer" cümlesine dayanıyordu. Bu betik
 * boşluğu kapatır: derleme sırasında sürümü GÜNLÜĞE BASAR (KURAL-1: pozitif satır) ve ayrışma
 * varsa derlemeyi DÜŞÜRÜR (fail-closed). Dışarıya hiçbir şey sızmaz — yalnız build kapsayıcısında koşar.
 *
 * NİÇİN `prebuild` DEĞİL: ölçüldü (2026-08-19) — depoda `.npmrc` yok, dolayısıyla pnpm'in
 * `enable-pre-post-scripts` ayarı VARSAYILAN olarak false. `prebuild` yazmak, hiç koşmayan bir
 * bekçi yazmak olurdu (sessiz-kapalı sınıfı). Bu yüzden `build` betiğinin İÇİNE zincirlenir.
 *
 * Cetvel: `docs/standards/runtime-version-alignment-standard.md`
 */

import { readFileSync } from 'node:fs'

/** SSOT tek yerde: hedef major dosyadan TÜRETİLİR, buraya elle yazılmaz. */
function beklenenMajor() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const ham = pkg?.engines?.node
  if (typeof ham !== 'string') {
    return { hata: 'package.json > engines.node YOK — hedef ana sürüm türetilemiyor' }
  }
  const m = ham.match(/^(\d+)\./)
  if (!m) {
    return { hata: 'engines.node = "' + ham + '" — beklenen biçim "<MAJOR>.x"' }
  }
  return { major: Number(m[1]), ham }
}

const KATI = Boolean(process.env.VERCEL || process.env.CI)
const ortam = process.env.VERCEL ? 'vercel' : process.env.CI ? 'ci' : 'lokal'

const hedef = beklenenMajor()

// Ölçemedim != geçtim: hedef türetilemiyorsa lokalde bile susmayız, bu bir depo kusurudur.
if (hedef.hata) {
  console.error('assert-node-major: ÖLÇÜM YAPILAMADI — ' + hedef.hata)
  process.exit(1)
}

const gercek = Number(process.versions.node.split('.')[0])

// POZITIF SATIR — mekanizmanın çalıştığı buradan ilan edilir, kapı yeşilinden değil.
console.log(
  'assert-node-major: node ' +
    process.version +
    ' (major ' +
    String(gercek) +
    ') | beklenen ' +
    String(hedef.major) +
    ' | kaynak package.json engines.node=' +
    hedef.ham +
    ' | ortam ' +
    ortam,
)

if (gercek === hedef.major) process.exit(0)

const mesaj =
  'Node ana sürümü AYRIŞTI: koşan ' +
  String(gercek) +
  ', beklenen ' +
  String(hedef.major) +
  '. Kapıların ölçtüğü çalışma zamanı ile derleyen çalışma zamanı farklıysa, ölçtüğü şey prod değildir.'

if (KATI) {
  console.error('assert-node-major: ' + mesaj)
  console.error('assert-node-major: usul için docs/standards/runtime-version-alignment-standard.md §5')
  process.exit(1)
}

// LOKAL MUAFİYET — ADIYLA ve gerekçesiyle: geliştirici makinesini gün ortasında bloke etmemek için
// yalnız UYARIR. Bu muafiyet cetvel §6'da yazılıdır; CI ve Vercel'de muafiyet YOKTUR.
console.warn('assert-node-major: LOKAL UYARI (bloke etmiyor) — ' + mesaj)
process.exit(0)
