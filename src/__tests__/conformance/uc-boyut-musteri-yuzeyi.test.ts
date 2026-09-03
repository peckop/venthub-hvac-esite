/**
 * INV-UCBOYUT-KAPALI-1 — müşteri yüzeyindeki HER 3D giriş noktası tek bayrağa bağlıdır.
 *
 * NİÇİN VAR (REC-94, 2026-09-04):
 * Site teklif modunda ve vitrin, arkasında bugün duran bir yetenek olmayan hiçbir şeyi
 * vaat edemez (`docs/standards/vaat-butunlugu-standard.md`). "Etkileşimli 3D" rozeti de,
 * tıklanabilir bir 3D düğmesi de bir vaattir — "tıklanmadıkça yüklenmiyor" savunması
 * müşteri tarafında geçersizdir, çünkü müşteri düğmeyi GÖRÜR ve TIKLAR.
 *
 * ⭐NİÇİN BU KAPI, "ekranda 3D var mı" ÖLÇÜMÜ DEĞİL:
 * İlk yazdığım kabul ölçütü "erişilebilirlik ağacında 3D giriş noktası 0" idi ve
 * SAHTE-YEŞİLDİ. Ölçüldü: WebGL tuvali a11y ağacına hiçbir düğüm KATMAZ ve bu bileşenlerde
 * zaten sıfır `aria-*`/`role`/`alt` var — yani o ölçüt bayrak AÇIKKEN DE KAPALIYKEN DE
 * "0" derdi. Ayırt etmeyen gösterge ölçüm değildir. Bu yüzden kapı davranışı değil
 * KAYNAK BAĞINI ölçer: her giriş noktası bayrağı gerçekten okuyor mu?
 *
 * KAPSAM SINIRI (gizlenmiyor):
 *  1. Bu kapı bayrağın DEĞERİNİ test etmez, BAĞI test eder. Bayrak `true` yapılırsa
 *     kapı yeşil kalır — ve doğrusu budur: açma kararı bir insan kararıdır, cetvelin
 *     §4.5 tablosuyla birlikte verilir.
 *  2. ADMIN yüzeyi KAPSAM DIŞI. `AuthorityRenderer`'ın canlı tek çağıranı admin
 *     kategori kurucusudur; orası bir vaat değil bir EDİTÖRDÜR ve kapatılmamalıdır.
 *     (Bunu red-team ölçtü: müşteri sarmalayıcısı `CategoryAuthoritySection` sıfır
 *     tüketicili ölü koddur.)
 *  3. Sözlükteki 3D metin vaatlerini görmez — onlar ayrı kalemdir ve cetvelin §4.5
 *     tablosunda satır satır yazılıdır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect,it } from 'vitest'

const KOK = join(process.cwd(), 'src')
const BAYRAK = 'UC_BOYUT_MUSTERI_YUZEYINDE'

/**
 * Müşteri yüzeyindeki 3D giriş noktaları — dosya ve o dosyada BİREBİR bulunması
 * gereken koruma ifadesi.
 *
 * ⭐NİÇİN "konum karşılaştırması" DEĞİL, BİREBİR İFADE:
 * İlk tasarımım "bayrak, 3D'yi başlatan işaretten ÖNCE geçsin" diyordu. Sabotajı
 * doğru yakaladı ama İKİ SAHTE-KIRMIZI üretti: `ImageGallery`'de işaret
 * (`ucBoyutAcik`) kendi TANIM satırında bayraktan önce geçiyor, `ProductsDiscoveryView`'de
 * ise dinamik import bildirimi render yerinden önce geliyordu. Yani ölçüt korunan
 * dosyaları da suçluyordu. Birebir koruma ifadesi hem ayırt edici hem sahte-kırmızısız:
 * koruma kaldırılırsa dize kaybolur, dururken hiçbir şey uydurmaz.
 */
const GIRIS_NOKTALARI: ReadonlyArray<{ yol: string; koruma: string; ne: string }> = [
  {
    yol: 'app/_components/ProductDetailPageView.tsx',
    koruma: `${BAYRAK} && topicSlug === 'hava-perdesi'`,
    ne: 'PDP "Etkileşimli 3D" rozeti',
  },
  {
    yol: 'components/ImageGallery.tsx',
    koruma: `const ucBoyutAcik = ${BAYRAK} &&`,
    ne: 'galeri 3D düğmesi',
  },
  {
    yol: 'components/navigation/CategoryHubOverlay.tsx',
    koruma: `${BAYRAK} && <VentHubCanvas`,
    ne: 'kategori panelindeki 3D ikon sahnesi',
  },
  {
    yol: 'components/navigation/EliteMegaMenu.tsx',
    koruma: `${BAYRAK} && <MegaMenu3DBackground`,
    ne: 'mega menü 3D arkaplanı',
  },
  {
    yol: 'views/ProductsDiscoveryView.tsx',
    koruma: `${BAYRAK} && <div`,
    ne: '/products orbital 3D kategori şeridi',
  },
]

function oku(yol: string): string {
  return readFileSync(join(KOK, yol), 'utf8')
}

/**
 * Yorumları düşürür — bir giriş noktasının adı AÇIKLAMA YORUMUNDA geçtiği için
 * "bağlı" sayılmasın. (`(?<!:)` `https://` içindeki `//`'yi korur — INV-SCRUB-1.)
 */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')
}

/**
 * İÇE AKTARMA satırlarını da düşürür.
 *
 * ⭐NİÇİN: bu kapının ilk hâli SABOTAJI GEÇİRDİ. Bir giriş noktasını bayraktan
 * çıkardım (`{UC_BOYUT... && <MegaMenu3DBackground` → `{<MegaMenu3DBackground`) ve
 * kapı YEŞİL kaldı — çünkü `import { UC_BOYUT_MUSTERI_YUZEYINDE } from ...` satırı
 * hâlâ oradaydı ve ölçüt onu "kullanım" sayıyordu. İçe aktarılıp kullanılmayan bir
 * bayrak hiçbir şeyi kapatmaz; ölçüt bunu ayırt etmek ZORUNDA.
 */
function govde(kaynak: string): string {
  return yorumsuz(kaynak).replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
}

describe('INV-UCBOYUT-KAPALI-1 — 3D giriş noktaları bayrağa bağlı', () => {
  it.each(GIRIS_NOKTALARI)('$ne ($yol) bayrağı okuyor', ({ yol, ne }) => {
    const kaynak = yorumsuz(oku(yol))
    expect(
      kaynak.includes(BAYRAK),
      `${ne} bayrağı (${BAYRAK}) okumuyor. Müşteri yüzeyinde 3D, arkasında yeteneği ` +
        `olmayan bir vaattir; giriş noktası bayrağın arkasına alınmalı. ` +
        `Cetvel: docs/standards/vaat-butunlugu-standard.md §1.4`,
    ).toBe(true)
  })

  it.each(GIRIS_NOKTALARI)('$ne ($yol) 3D\'yi bayraksız BAŞLATMIYOR', ({ yol, koruma, ne }) => {
    // İÇE AKTARMASIZ gövde: bir bayrağı import edip kullanmamak korumak değildir.
    // (Kapının ilk hâli tam bu yüzden sabotajı geçirmişti.)
    const kaynak = govde(oku(yol))
    expect(
      kaynak.includes(koruma),
      `${ne}: koruma ifadesi bulunamadı → "${koruma}"\n` +
        `Bu hâlde 3D müşteriye gösterilir. Koruma kasten değiştirildiyse bu kapının ` +
        `GIRIS_NOKTALARI listesi de güncellenmeli — ifade burada BİREBİR yazılıdır.`,
    ).toBe(true)
  })

  it('bayrak tek kaynakta yaşıyor ve müşteri yüzeyi için KAPALI', () => {
    const bayrakDosyasi = readFileSync(join(KOK, 'config/features.ts'), 'utf8')
    expect(bayrakDosyasi).toContain(`export const ${BAYRAK}`)
    // Bugünkü karar: kapalı. Açılırsa bu kol kırmızı verir ve açan kişi cetvelin
    // §4.5 geri-dönüş tablosunu okumak ZORUNDA kalır — kapının amacı budur.
    expect(
      /export const UC_BOYUT_MUSTERI_YUZEYINDE\s*=\s*false/.test(bayrakDosyasi),
      'Bayrak açılmış. Açmak yasak değil ama BEDAVA da değil: vaat-bütünlüğü cetvelinin ' +
        '§4.5 tablosundaki kalemler (3D metin vaatleri dahil) birlikte geri gelmeli.',
    ).toBe(true)
  })

  it('ADMIN yüzeyi bu bayrağa BAĞLANMADI (editör kapatılmaz)', () => {
    const admin = readFileSync(join(KOK, 'views/admin/CategoryBuilderView.tsx'), 'utf8')
    expect(
      admin.includes(BAYRAK),
      'Admin kategori kurucusu müşteri bayrağına bağlanmış. Orası bir VAAT değil bir ' +
        'EDİTÖRDÜR; kapatmak vitrini düzeltmez, admin\'i bozar.',
    ).toBe(false)
  })
})
