/**
 * INV-DUMAN — SSR duman kilidinin DÜZENEĞİNİ korur (REC-134).
 *
 * NİÇİN VAR: `tests/smoke/ssr-html.spec.ts` yazıldığı günden bu yana BİR KEZ BİLE
 * koşmadı. `describe.skipIf(!SMOKE_BASE_URL)` sıfır test topluyordu, hiçbir workflow
 * o env'i tanımlamıyordu ve kontrol listesinde hiçbir şey kırmızı olmuyordu. Kanıtı
 * kilidin kendi içindeydi: `<h2` marker'ı #959'da bayatlamıştı ve `seat-storm-jet`
 * slug'ı canlıda 404 vermeye başlamıştı — ikisini de bu iş sırasında ÖLÇÜM buldu,
 * kapı değil, çünkü kapı hiç koşmuyordu.
 *
 * BU DOSYA KİLİDİN KENDİSİNİ DEĞİL, KİLİDİN KOŞABİLİRLİĞİNİ ölçer: doğru kapsamda
 * mı, env'siz düşüyor mu, workflow onu gerçekten çağırıyor mu. Sebebi basit: duman
 * kilidi ayakta bir sunucu ister, bu konformans paketi ise sunucusuz koşar. Düzeneği
 * ölçmek, düzeneğin sessizce sökülmesini engellemenin tek ucuz yoludur.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/** Depo kökü GIT'ten türetilir — sabit yol yazmak INV-MUTLAK-YOL-1 ihlalidir. */
function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

/**
 * Satır başı `#` yorumlarını ATAR.
 *
 * ⭐NİÇİN: bu dosyanın ölçtüğü workflow, kararlarının GEREKÇESİNİ yorum olarak
 * taşıyor ve o yorumlar ölçtüğüm dizelerin çoğunu ("environment_url", "test:smoke")
 * kelimesi kelimesine içeriyor. Yorumu saymak, sabotajı görmeyen bir kapı üretirdi:
 * biri gerçek adımı silse bile gerekçe metni kapıyı yeşil tutardı. Bugün tam bu
 * sınıfı bir kez ödedim (kaldırdığım izni kendi yorumumda "bulmuştum").
 */
function yorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

/**
 * TS/JS yorumlarını (`//` ve `/* *\/`) ATAR — YAML tarafındakiyle aynı sebep.
 *
 * ⭐BU FONKSİYON BİR ÖLÇÜMLE DOĞDU: ilk hâlinde yoktu ve INV-DUMAN-1 KIRMIZI verdi.
 * Sebep, kapının haklı olmasıydı: spec'in başındaki gerekçe bloğu `describe.skipIf`
 * dizesini kelimesi kelimesine içeriyor ("niçin KALKTI" diye anlatırken). Yani ham
 * metin ölçümü, kaldırılmış bir kusuru VAR sanıyordu. Tersi de aynı kapıdan geçerdi:
 * biri skipIf'i geri koyup gerekçesini yorumda anlatsa kapı yeşil kalırdı.
 * Gerekçe yazmak ile kod yazmak aynı evrende ölçülmez.
 */
function tsYorumsuz(metin: string): string {
  return metin.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

const SPEC = 'tests/smoke/ssr-html.spec.ts'
const WF = '.github/workflows/ssr-duman-alarmi.yml'

describe('INV-DUMAN-1: duman kilidi ölçmeden geçemez', () => {
  it('spec FAIL-CLOSED — SMOKE_BASE_URL yoksa DÜŞEN bir kol vardır', () => {
    const s = tsYorumsuz(oku(SPEC))
    // describe düzeyinde skipIf, TÜM paketi sıfır teste indirir — yasak olan bu.
    expect(
      /describe\.skipIf/.test(s),
      'describe.skipIf geri gelmiş: env yoksa paket sıfır test toplar ve kilit sessizce ölür'
    ).toBe(false)
    expect(
      /it\(\s*['"`]SMOKE_BASE_URL/.test(s),
      'fail-closed kol yok: env yokluğu bir KIRMIZI üretmeli, sessizlik değil'
    ).toBe(true)
  })

  it('DAVRANIŞ ÖLÇÜMÜ: env YOKKEN koşum gerçekten kırmızı (metin değil, çıkış kodu)', () => {
    // ⭐Bu kol, yukarıdakinin metin okumasını DAVRANIŞLA doğrular. Dize aramak
    // "fail-closed yazılmış" der; yalnız koşum "fail-closed ÇALIŞIYOR" der.
    let kod = 0
    try {
      execFileSync(
        process.execPath,
        ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.smoke.config.ts'],
        { cwd: KOK, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, SMOKE_BASE_URL: '' } }
      )
    } catch (e) {
      kod = (e as { status?: number }).status ?? 1
    }
    expect(kod, 'SMOKE_BASE_URL boşken duman koşumu YEŞİL döndü — ölçmemek geçmek değildir').not.toBe(0)
  })
})

describe('INV-DUMAN-2: kilit doğru kapsamda koşar', () => {
  it('tests/smoke VARSAYILAN vitest kapsamının DIŞINDA (ci onu sunucusuz toplamaz)', () => {
    const s = oku('vitest.config.ts')
    expect(
      /exclude:\s*\[[^\]]*tests\/smoke/.test(s),
      "tests/smoke varsayılan kapsama dönmüş: ci Test adımı onu ayakta sunucu olmadan toplar ve fail-closed kol ci'yi kırmızı yapar"
    ).toBe(true)
  })

  it('ayrı config kilidi TEK BAŞINA toplar ve pnpm betiği ona bağlıdır', () => {
    expect(/include:\s*\[[^\]]*tests\/smoke/.test(oku('vitest.smoke.config.ts'))).toBe(true)
    const pkg = JSON.parse(oku('package.json')) as { scripts: Record<string, string> }
    expect(pkg.scripts['test:ssr-smoke'], 'test:ssr-smoke betiği yok').toContain('vitest.smoke.config.ts')
  })

  it('⭐package.json MÜKERRER script anahtarı TAŞIMAZ (sessizce ölen betik sınıfı)', () => {
    /**
     * BUGÜN ÖLÇÜLDÜ (2026-09-04): bu kilide `test:smoke` adını verdim; repo'da o ad
     * ZATEN vardı (`playwright test`). JSON mükerrer anahtarda HATA VERMEZ, sonuncu
     * kazanır — benim betiğim sessizce ölüydü ve workflow yanlış testi koşacaktı.
     * `JSON.parse` bu kusuru GÖREMEZ (mükerrerleri yutar), o yüzden ölçüm HAM METİN
     * üzerinde yapılır. Kapının evreni tüm scripts bloğudur, yalnız benim eklediğim
     * satır değil: kusur benim adımdaydı ama sınıf herkesin.
     */
    const ham = oku('package.json')
    const blok = ham.slice(ham.indexOf('"scripts"'))
    const son = blok.indexOf('\n  }')
    const adlar = [...blok.slice(0, son).matchAll(/^\s{4}"([^"]+)":/gm)].map((m) => m[1])
    const tekrar = adlar.filter((a, i) => adlar.indexOf(a) !== i)
    expect(tekrar, `package.json scripts bloğunda mükerrer anahtar: ${tekrar.join(', ')}`).toEqual([])
  })
})

describe("INV-DUMAN-3: alarm workflow'u kilidi gerçekten çağırır", () => {
  it('duman betiğini çağırır ve SMOKE_BASE_URL besler', () => {
    const w = yorumsuz(oku(WF))
    expect(/pnpm test:ssr-smoke/.test(w), 'workflow duman betiğini çağırmıyor').toBe(true)
    expect(/SMOKE_BASE_URL:/.test(w), 'workflow env beslemiyor — kilit fail-closed düşer').toBe(true)
  })

  it('⭐taban adres ÖZEL ALAN ADIDIR — dağıtım-özgü environment_url KULLANILMAZ', () => {
    /**
     * ÖLÇÜLDÜ (2026-09-04): proje ayarı ssoProtection=all_except_custom_domains.
     *   venthub-hvac-esite-1fk7v482n-peckops-projects.vercel.app/tr -> 302 vercel.com/sso-api
     *   venthub.com.tr/tr                                           -> 200
     * deployment_status olayının taşıdığı adresi beslemek, sayfayı değil KORUMA
     * EKRANINI ölçerdi. Bu kol o naif tasarımın geri gelmesini engeller.
     */
    const w = yorumsuz(oku(WF))
    expect(
      /environment_url/.test(w),
      'environment_url besleniyor: o adres koruma arkasında (302 sso), ölçülen şey sayfa DEĞİL koruma ekranı olur'
    ).toBe(false)
    expect(/venthub\.com\.tr/.test(w), 'özel alan adı taban olarak yazılmamış').toBe(true)
  })

  it('yalnız BAŞARILI PROD dağıtımında tetiklenir, schedule/dispatch ise geçer', () => {
    const w = yorumsuz(oku(WF))
    expect(/deployment_status\.state == 'success'/.test(w)).toBe(true)
    expect(/deployment\.environment == 'Production'/.test(w)).toBe(true)
    // Koşul "olay deployment_status DEĞİLSE geç" biçiminde olmalı; tersi yazılsaydı
    // zamanlanmış koşum sessizce hiç çalışmazdı (kapı var, koşum yok sınıfı).
    expect(
      /github\.event_name != 'deployment_status'/.test(w),
      'schedule/workflow_dispatch koşulu düşürüyor: alarm yalnız dağıtımda çalışır, günlük hiç koşmaz'
    ).toBe(true)
  })
})
