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

import {
  ihlaller,
  kurallar,
  PDP_BILINCLI_ADALAR,
  PDP_MAX_BAILOUT,
} from '../../../tests/smoke/ssr-kurallari'

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
  /**
   * ⭐SATIR BAZLI, BLOK-REGEX DEĞİL — bu da bir ölçümle öğrenildi.
   *
   * İlk hâli blok yorumları tek bir regex ile siliyordu ve INV-DUMAN-5 KIRMIZI verdi.
   * Sebep: `playwright.config.ts` içindeki `testMatch` deseni glob olduğu için DİZENİN
   * İÇİNDE bir yorum-başlangıcı alt dizesi barındırıyor. Kaba regex onu gerçek yorum
   * sandı, bir sonraki yorum-kapanışına kadar her şeyi sildi ve aradığım kodu götürdü.
   * Yani yorum temizleyicinin kendisi ölçümü bozuyordu — "ölçüm aracının kendisi
   * ölçülür" dersinin bir örneği daha.
   *
   * Satır bazlı yaklaşım dize içeriğine dokunmaz: yalnız yorum OLARAK BAŞLAYAN
   * satırlar düşer (satır başı iki eğik çizgi, blok açılışı, yıldız devamı ve blok
   * kapanışı — bu dosyanın kendisi de yorumda o dizeleri YAZAMIYOR, çünkü yazınca
   * kendi bloğunu kapatıyor; iki kez yaşandı). Gövde içinde satır sonuna eklenmiş
   * yorumları atmaz — o eksik bilinçli: bu dosyanın aradığı şeyler anahtar-değer
   * satırları, ve fazladan silmek sahte-yeşilden daha az risklidir.
   */
  return metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')
}

const SPEC = 'tests/smoke/ssr-html.spec.ts'
const WF = '.github/workflows/ssr-duman-alarmi.yml'
const MODUL = 'tests/smoke/ssr-kurallari.ts'
const KAPI = 'e2e/ssr-html.e2e.ts'

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

  it('PR KAPISI ile ALARM aynı workflow\'a KARIŞMAZ (alarm PR\'da koşmaz)', () => {
    // Alarm master'ı ölçer; PR'da koşarsa PR'ın kodu hakkında yanlış izlenim verir
    // ("SSR kilidi bu PR'da yeşil" gibi okunur, oysa ölçtüğü şey canlı master).
    const w = yorumsuz(oku(WF))
    expect(/pull_request/.test(w), 'alarm workflow\'u pull_request\'te tetikleniyor — kapı ile alarm karışır').toBe(
      false
    )
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

describe('INV-DUMAN-4: kurallar TEK KAYNAKTAN gelir (§26)', () => {
  it('ALARM ve KAPI aynı modülü tüketir — kural iki yerde iki kopya DEĞİL', () => {
    /**
     * ⭐NİÇİN: aynı kural iki dosyada yaşarsa biri güncellenir, öteki bayatlar ve kimse
     * görmez. Bu iş tam o bedelle başladı: kilit hiç koşmadığı için `<h2` marker'ı ve
     * `seat-storm-jet` slug'ı bayatlamıştı. Tek kaynak, sabotajın İKİ tüketiciyi birden
     * kırmızıya çevirmesini de sağlar (OPS şartı).
     */
    const alarm = tsYorumsuz(oku(SPEC))
    const kapi = tsYorumsuz(oku(KAPI))
    for (const [ad, metin] of [
      ['alarm', alarm],
      ['kapı', kapi],
    ] as const) {
      expect(
        /from '(\.\.\/tests\/smoke\/|\.\/)ssr-kurallari'/.test(metin),
        `${ad} kuralları tek kaynaktan almıyor — kendi kopyasını taşıyorsa sessizce ayrışır`
      ).toBe(true)
    }
    // Kural gövdesi (marker/eşik) YALNIZ modülde durmalı; tüketicide tekrar edilmemeli.
    for (const [ad, metin] of [
      ['alarm', alarm],
      ['kapı', kapi],
    ] as const) {
      expect(
        /BAILOUT_TO_CLIENT_SIDE_RENDERING/.test(metin),
        `${ad} bailout sayımını KENDİ içinde yapıyor — o mantık modülde (ihlaller) durmalı`
      ).toBe(false)
    }
  })

  it('SLUG SABİT YAZILMAZ: temsilciler sitemap\'ten türetilir, fail-closed', () => {
    const m = tsYorumsuz(oku(MODUL))
    expect(/sitemap\.xml/.test(m), 'temsilci kaynağı sitemap değil').toBe(true)
    // Bayat slug / pasif kategori sınıfı: sabit slug yazmak dün iki kusur doğurdu
    // (404 ve boş sayfada bedava yeşil). Modülde canlı slug SABİTİ olmamalı.
    for (const olu of ['seat-storm-jet', 'konut-tipi-havalandirma']) {
      expect(m.includes(olu), `modülde sabit slug var: ${olu} — sitemap kaynağı devre dışı kalmış`).toBe(
        false
      )
    }
    /**
     * Sıfır rotayla yeşil dönmek YASAK. Ölçüt VARLIK DEĞİL SAYIM.
     *
     * ⭐İlk hâli `/throw new Error/.test(m)` idi ve SABOTAJI GEÇİRDİ: modülde üç ayrı
     * fail-closed yolu var (sitemap okunamadı · sitemap boş · zorunlu sınıfın temsilcisi
     * yok); birini `console.warn`'a çevirdim, kol YEŞİL kaldı çünkü öteki ikisi hâlâ
     * "bir throw var" diyordu. Ayırt etmeyen gösterge ölçüm değildir — üç yolun ÜÇÜ de
     * sayılır. Yol eklenirse bu sayı bilinçli olarak yükseltilir (ratchet).
     */
    const failClosed = (m.match(/throw new Error/g) ?? []).length
    expect(
      failClosed,
      `fail-closed yolu sayısı ${failClosed} (< 3): sitemap okunamadı / boş / zorunlu sınıf yok ` +
        'hâllerinden biri sessizce geçiyor'
    ).toBeGreaterThanOrEqual(3)
  })

  it('KAPI, kırılgan ölçütlü sınıfı ZORUNLU kontrole sokmaz', () => {
    /**
     * Kök kategorinin ayırt edici tek işareti i18n sözlüğünden gelen bir başlık; sözlük
     * de VERİDİR. Onu zorunlu kapıya koymak, URUN bir anahtarı yeniden adlandırdığında
     * tüm filonun merge'ini durdurur. Depo bu kararı zaten vermiş: playwright.config.ts
     * `checkout-smoke`'u aynı gerekçeyle kapının dışında tutuyor.
     */
    const m = tsYorumsuz(oku(MODUL))
    expect(/kapida:\s*false/.test(m), 'her sınıf kapıya alınmış — kırılgan ölçüt ayrımı kaybolmuş').toBe(
      true
    )
    const kapi = tsYorumsuz(oku(KAPI))
    expect(
      /kurallar\([^)]*,\s*true\s*\)/.test(kapi),
      'kapı yalnizKapi=true ile süzmüyor — kırılgan sınıf zorunlu kontrole girer'
    ).toBe(true)
    expect(kapi.includes("'kok-kategori'"), 'kapı kök kategori sınıfını koşuyor').toBe(false)
  })
})

describe('INV-DUMAN-5: PR kapısı gerçekten ZORUNLU kontrolün içinde', () => {
  it('kapı dosyası playwright kapsamındadır (admin-smoke onu toplar)', () => {
    // playwright.config.ts `testDir: ./e2e` + `testMatch: **/*.e2e.ts`; ad bu deseni
    // tutmazsa dosya SESSİZCE hiç koşmaz — "kapı var, koşum yok" sınıfı.
    expect(KAPI.startsWith('e2e/'), 'kapı dosyası e2e/ dizininde değil').toBe(true)
    expect(KAPI.endsWith('.e2e.ts'), 'kapı dosyası .e2e.ts deseninde değil — playwright toplamaz').toBe(
      true
    )
    const cfg = tsYorumsuz(oku('playwright.config.ts'))
    expect(/testDir:\s*'\.\/e2e'/.test(cfg) && /\*\*\/\*\.e2e\.ts/.test(cfg)).toBe(true)
  })

  it('admin-smoke GERÇEK Supabase env ile build eder (dummy ile SSR ölçülemez)', () => {
    /**
     * ÖLÇÜLDÜ (2026-09-04): `ci`'nin Build adımı `dummy.supabase.co` kullanıyor ve o
     * sunucuda /tr/products ile /tr/category/... 500 veriyor — veri yok, sayfa
     * üretilemiyor. Kilidi oraya bağlamak SAHTE KIRMIZI üretirdi. `e2e-smoke.yml`
     * ise gerçek variable'larla build ediyor; kapı bu yüzden orada.
     */
    const w = yorumsuz(oku('.github/workflows/e2e-smoke.yml'))
    expect(/vars\.E2E_SUPABASE_URL/.test(w), 'gerçek Supabase URL beslenmiyor').toBe(true)
    expect(/vars\.E2E_SUPABASE_ANON_KEY/.test(w), 'gerçek anon key beslenmiyor').toBe(true)
    expect(
      /dummy\.supabase\.co/.test(w),
      'admin-smoke dummy Supabase kullanıyor — SSR kolları veri olmadan sahte kırmızı verir'
    ).toBe(false)
  })
})

describe('INV-DUMAN-6: PDP bailout tavanı İLAN edilmiş adalardan türer (mandal)', () => {
  /**
   * NİÇİN VAR: tavan çıplak bir sayı olarak yazıldığında onu büyütmek BEDAVA olur.
   * Bugün tam bu durum yaşandı — #989 dördüncü bir bilinçli ada (Vercel Analytics)
   * ekledi, kapı `3 > 2` ile kırmızı verdi ve en kolay çözüm "2'yi 3 yap" idi. O yol
   * kapının hafızasını siler: yarın KAZAYLA doğan bir bailout, dün gerekçesiz açılmış
   * boşluğun içinde saklanır. Tavan ilandan türediği için sayıyı büyütmenin tek yolu
   * "hangi ada, niçin meşru" yazmaktır.
   *
   * ⭐MUAFİYET NİÇİN YOK: `BAILOUT_TO_CLIENT_SIDE_RENDERING` markerının HTML'de kimliği
   * yoktur; hangi Suspense sınırından doğduğu ayırt edilemez. "Şu adayı muaf tut"
   * yazılabilir bir ölçüt değildir — uygulanabilir tek ölçüt sayıdır.
   */
  const fakeTemsilciler = {
    kokKategori: '/tr/category/a',
    altKategori: '/tr/category/a/b',
    pdp: '/tr/products/x',
    sayimlar: { kokKategori: 1, altKategori: 1, pdp: 1 },
  }

  it('her ilan kalemi DOLU ve TEKİL — boş kalemle sayı şişirilemez', () => {
    expect(PDP_BILINCLI_ADALAR.length, 'ilan boş — tavan gerekçesiz kalır').toBeGreaterThan(0)
    for (const a of PDP_BILINCLI_ADALAR) {
      expect(a.ada.trim().length, `ada adı boş: ${JSON.stringify(a)}`).toBeGreaterThan(2)
      // Gerekçe uzunluğu: bir cümle yazmayı zorlar. "ok"/"gerekli" gibi doldurma geçmez.
      expect(a.nicin.trim().length, `"${a.ada}" gerekçesi yok/çok kısa`).toBeGreaterThan(40)
      expect(a.marker, `"${a.ada}" en az 1 marker katmalı`).toBeGreaterThanOrEqual(1)
    }
    const adlar = PDP_BILINCLI_ADALAR.map((a) => a.ada)
    expect(new Set(adlar).size, `ilan mükerrer ada içeriyor: ${adlar.join(', ')}`).toBe(adlar.length)
  })

  it('PDP kuralının tavanı ilan toplamına EŞİT — literal sayı kaçağı yakalanır', () => {
    // Ölçüt türetime DEĞİL sonuca bağlı: biri `maxBailout: 4` yazsa da bu kol kırmızı
    // olur, çünkü karşılaştırılan şey ilanın kendi toplamıdır.
    const toplam = PDP_BILINCLI_ADALAR.reduce((n, a) => n + a.marker, 0)
    const pdp = kurallar(fakeTemsilciler).find((k) => k.sinif === 'pdp')
    expect(pdp, 'pdp kuralı kayıp').toBeTruthy()
    expect(
      pdp?.maxBailout,
      `PDP tavanı (${pdp?.maxBailout}) ilan toplamıyla (${toplam}) uyuşmuyor — ` +
        'sayı ilan edilmeden büyütülmüş'
    ).toBe(toplam)
    expect(PDP_MAX_BAILOUT, 'dışa verilen sabit ilanla uyuşmuyor').toBe(toplam)
  })

  it('DAVRANIŞ, sınırda: tavan kadar marker geçer, bir fazlası KIRMIZI', () => {
    /**
     * ⭐NİÇİN TEK SATIRDA: sayımın SATIR değil GEÇİŞ saydığını da kanıtlar. Üretilen
     * HTML tek satırdır; satır sayan bir ölçüt (`grep -c`) burada 1 döner ve üç
     * bailout'u bir sanır. Bu hata bugün sahada yapıldı — kol onu kalıcı olarak
     * yakalar.
     */
    const pdp = kurallar(fakeTemsilciler).find((k) => k.sinif === 'pdp')
    if (!pdp) throw new Error('pdp kuralı kayıp — kol ölçemez')
    // İçerik markerları KASITLI olarak sağlanıyor: bu kol bailout SAYIMINI ölçüyor,
    // marker eksikliğinin ürettiği ihlalle karışmaması gerekir.
    const icerik = '<h1 class="x">Ürün</h1><div>Model Seçimi</div>'
    const govde = (n: number): string =>
      `<html><body>${icerik}${'<!--BAILOUT_TO_CLIENT_SIDE_RENDERING-->'.repeat(n)}</body></html>`

    expect(ihlaller(pdp, govde(pdp.maxBailout)), 'tavan kadar bailout ihlal saymamalı').toEqual([])
    const fazla = ihlaller(pdp, govde(pdp.maxBailout + 1))
    expect(fazla.length, 'tavanın bir fazlası ihlal DOĞURMADI — sayım kör').toBe(1)
    expect(fazla[0]).toContain(`${pdp.maxBailout + 1} > ${pdp.maxBailout}`)
  })
})
