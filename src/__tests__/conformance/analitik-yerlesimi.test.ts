/**
 * INV-ANALITIK-1 — çerezsiz sayım kök layout'ta, rıza kapısı BOZULMADAN duruyor.
 *
 * NİÇİN VAR (2026-09-04, Recep onayı):
 * Siteye ölçüm eklendi. Sessizce bozulabilecek üç şey var ve üçü de pahalı:
 *
 *  1. **Analytics bileşeni layout'tan düşerse** hiçbir şey kırılmaz — build yeşil,
 *     testler yeşil, sayfa açılır. Yalnız veri gelmez. "Çalışıyor sanılan ölü ölçüm",
 *     ölçüm olmamasından kötüdür: karar onun üzerine kurulur.
 *  2. **Rıza kapısı sökülürse** (`ConsentGatedAnalytics` layout'tan çıkarsa) GA kimliği
 *     tanımlandığı gün çerezler rızasız yazılır. Bu kapı bugün İNERT ama silinemez.
 *  3. **Çerez politikası ile kod ayrışırsa** metin "analitik yok" derken site sayım
 *     yaparsa, sayfa ziyaretçiyi YANILTIR. Bu bir hukuk metni; tutarsızlığı kabul edilemez.
 *
 * ⛔NE ÖLÇMEZ — ve bu sınır önemli: Vercel betiğinin GERÇEKTEN çerezsiz olduğunu.
 * O iddia 2026-09-04'te canlı betik indirilerek ölçüldü (`document.cookie`,
 * `localStorage`, `sessionStorage`, `indexedDB` geçişi = 0). Kapı betiği indiremez;
 * **paket sürümü yükseldiğinde iddia YENİDEN ÖLÇÜLMELİ.** Bu yüzden aşağıda sürüm
 * aralığı da sabitleniyor: majör sürüm değişirse kapı kırmızı verir ve ölçümü zorlar.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')

const LAYOUT = oku('src', 'app', 'layout.tsx')
const ISTEMCI_KABUK = oku('src', 'components', 'layout', 'ClientLayout.tsx')
const PAKET = JSON.parse(oku('package.json')) as { dependencies?: Record<string, string> }
const CEREZ_TR = oku('src', 'views', 'legal', 'components', 'tr', 'CookiePolicyContent.tsx')
const CEREZ_EN = oku('src', 'views', 'legal', 'components', 'en', 'CookiePolicyContent.tsx')

/** Yorumları at — bir kuralın yalnız yorumda anılması onu uygulamaz. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const LAYOUT_GOVDE = govde(LAYOUT)

describe('INV-ANALITIK-1 — çerezsiz sayım ve rıza kapısı', () => {
  it('paket bağımlılıklarda ve MAJÖR sürüm sabit (iddia sürümle bayatlar)', () => {
    const s = PAKET.dependencies?.['@vercel/analytics']
    expect(s, '@vercel/analytics bagimliliklarda YOK.').toBeTruthy()
    expect(
      /^\^?2\./.test(String(s)),
      `Surum "${s}" — cerezsizlik iddiasi 2.x uzerinde OLCULDU. Majör surum degistiyse ` +
        'iddia yeniden olculmeli: betigi indir, document.cookie/localStorage/sessionStorage/' +
        'indexedDB gecisi hala 0 mi bak, sonra bu kapiyi guncelle.',
    ).toBe(true)
  })

  it('⭐Analytics KÖK layout’ta render ediliyor — sessizce düşemez', () => {
    expect(
      LAYOUT_GOVDE.includes("from '@vercel/analytics/next'"),
      'Kok layout Analytics i import etmiyor.',
    ).toBe(true)
    expect(
      /<Analytics\s*\/>/.test(LAYOUT_GOVDE),
      'Kok layout ta <Analytics /> CIZILMIYOR. Import tek basina YETMEZ — bilesen ' +
        'render edilmezse hicbir sey kirilmaz, yalniz veri gelmez ve bu fark edilmez.',
    ).toBe(true)
  })

  it('⭐Analytics SUSPENSE içinde — statik sayfalar istemciye düşmesin', () => {
    // Bunu TAHMIN etmedim, KAPI ogretti: <Analytics/> icerde useSearchParams() cagiriyor.
    // Suspense'siz birakilinca STATIK uretilen sayfalarda tum agac istemciye dusuyor ve
    // SSR HTML'ine BAILOUT_TO_CLIENT_SIDE_RENDERING markeri giriyor (REC-138 kapisi PDP'de
    // 3 > 2 ile yakaladi). Dinamik rotalarda marker DOGMUYOR — yani "ana sayfada sorun yok"
    // demek yaniltici olurdu; kusur yalniz statik sinifta gorunur.
    // ⚠Suspense markeri KALDIRMAZ, KAPSAR: sinirdan sonra da PDP'de marker 3'tur; sinir
    // istemciye dusen parcayi bu adaya hapseder (icerik markerlari sunucuda kalir). Tavani
    // (2->3) tests/smoke/ssr-kurallari.ts SAHIBI cikardi — bu kapi tavanla ilgilenmez,
    // yalnizca Suspense sinirinin YERINDE oldugunu olcer.
    const i = LAYOUT_GOVDE.indexOf('<Analytics')
    expect(i, 'Analytics render edilmiyor.').toBeGreaterThan(-1)
    const oncesi = LAYOUT_GOVDE.slice(0, i)
    const sonSuspense = oncesi.lastIndexOf('<Suspense')
    const sonKapanis = oncesi.lastIndexOf('</Suspense>')
    expect(
      sonSuspense > sonKapanis,
      'Analytics bir <Suspense> icinde DEGIL. CLAUDE.md kural 5: useSearchParams kullanan ' +
        'bilesen Suspense ile sarilmali; yoksa statik sayfa istemciye duser (SSR zehirlenmesi).',
    ).toBe(true)
  })

  it('⭐rıza kapısı YERİNDE — çerez yazan analitik hâlâ rızaya bağlı', () => {
    expect(
      ISTEMCI_KABUK.includes('<ConsentGatedAnalytics />'),
      'ConsentGatedAnalytics kabuktan DUSMUS. Cerezsiz sayim eklendi diye cerezli ' +
        'analitigin rıza kapisi kaldirilamaz — GA kimligi tanimlandigi gun cerezler ' +
        'rizasiz yazilir. Bu kapi bugun inert, ama silinemez.',
    ).toBe(true)
  })

  it('⭐çerez politikası kod ile TUTARLI — iki dilde de çerezsiz sayım yazılı', () => {
    for (const [ad, metin] of [['tr', CEREZ_TR], ['en', CEREZ_EN]] as const) {
      expect(
        /Vercel Web Analytics/.test(metin),
        `Cerez politikasi (${ad}) cerezsiz sayimdan HIC bahsetmiyor. Metin "analitik yok" ` +
          'derken site sayim yapiyorsa ziyaretci YANILTILIR — bu bir hukuk metnidir.',
      ).toBe(true)
      // "Cerez kullanmiyoruz" iddiasi DURMALI: cerezsiz sayim onu gecersiz kilmaz.
      expect(
        /not.{0,30}use cookies for analytics|analitik, reklam veya profilleme amaçlı çerez/.test(metin),
        `Cerez politikasi (${ad}) "analitik cerez kullanilmiyor" ifadesini KAYBETMIS. ` +
          'Cerezsiz sayim o ifadeyi gecersiz KILMAZ; ifade kalmali, yanina aciklama gelmeli.',
      ).toBe(true)
    }
  })
})
