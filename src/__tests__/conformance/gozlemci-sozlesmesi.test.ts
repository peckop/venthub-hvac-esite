import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-GOZLEMCI-1 — "açılan blok, açanı da yanında getirir".
 *
 * ÖLÇÜLMÜŞ KUSUR (2026-09-07, REC-213-A, yerel Playwright):
 * `GuidedCategoryDiscovery`i anasayfadan `/products` sayfasına taşıdım. Bileşenin yedi
 * öğesi `opacity-0` ile başlar ve yalnız `data-in-view="true"` niteliği gelince açılır;
 * o niteliği yazan TEK şey `ScrollObserver`. Sağlayıcı yeni ağaca mount edilmediği için
 * yedi öğenin YEDİSİ de opaklık 0'da kaldı — kaydırmak da açmadı, gözlemci hiç kurulmuyordu.
 * Müşteri gözüyle sonuç: 3D karuselin yerinde BOŞ BEYAZ ALAN. Recep aynı ekranı bağımsız
 * olarak gördü ve tarif etti; ölçüm ve göz aynı şeyi söyledi.
 *
 * ⚠KUSURUN SINIFI — NİÇİN KAPI ŞART: sekiz konformans kolu YEŞİLDİ. Hepsi bileşenin
 * ÇİZİLDİĞİNİ ölçüyordu; hiçbiri GÖRÜNDÜĞÜNÜ ölçmüyordu. `data-observe` sessiz bir
 * SÖZLEŞMEDİR: içerik render EDİLİR, DOM'da vardır, testler bulur — ama ekranda yoktur.
 * Bu yüzden kural koda yazılır: bileşeni taşıyan bir sonraki kişi aynı tuzağa düşmesin.
 *
 * KAPININ SINIRI, ADIYLA: bu kapı STATİKTİR. `ScrollObserver`ın ağaçta bulunduğunu ölçer;
 * çalıştığını, öğelerin gerçekten açıldığını ya da canlıda göründüğünü ÖLÇMEZ. Yalnız
 * ölçülmüş kusur sınıfının (sağlayıcısız taşıma) geri gelmesini engeller.
 */

const SRC = join(process.cwd(), 'src')

/** Açılma mekanizmasının kendisi: yalnız GERÇEK markup'ta geçer, düz yazıda değil. */
const ACILMA_IZI = 'data-[in-view='
const SAGLAYICI = 'ScrollObserver'

function tsxDosyalari(kok: string): string[] {
  const cikti: string[] = []
  for (const ad of readdirSync(kok)) {
    const tam = join(kok, ad)
    if (statSync(tam).isDirectory()) {
      cikti.push(...tsxDosyalari(tam))
    } else if (ad.endsWith('.tsx')) {
      cikti.push(tam)
    }
  }
  return cikti
}

const TUM_TSX = tsxDosyalari(SRC)
const oku = (yol: string) => readFileSync(yol, 'utf8')
const testDosyasiMi = (yol: string) => yol.includes(`${sep}__tests__${sep}`)

/**
 * Evren, elle listelenmez — kaynaktan TÜRETİLİR. Yarın biri yeni bir animasyonlu blok
 * yazarsa kapı onu kendiliğinden kapsar; elle liste bayatlar ve sessizce boşalırdı.
 */
const ANIMASYONLU_BILESENLER = TUM_TSX.filter(
  (y) => !testDosyasiMi(y) && oku(y).includes(ACILMA_IZI),
)

/** Dosya adından bileşen adı: components/home/GuidedCategoryDiscovery.tsx → GuidedCategoryDiscovery */
const bilesenAdi = (yol: string) => yol.split(sep).pop()!.replace(/\.tsx$/, '')

/** Ev sahibi = bileşeni JSX olarak ÇİZEN dosya. Yalnız `import` etmek yetmez: tip
 *  importu da import'tur, ama hiçbir şey çizmez ve gözlemciye ihtiyacı yoktur. */
function evSahipleri(bilesen: string): string[] {
  return TUM_TSX.filter(
    (y) =>
      !testDosyasiMi(y) &&
      bilesenAdi(y) !== bilesen &&
      new RegExp(`<${bilesen}[\\s/>]`).test(oku(y)),
  )
}

describe('INV-GOZLEMCI-1 — data-observe sözleşmesi: açılan blok sağlayıcısıyla taşınır', () => {
  it('K1 (ön-koşul) — evren BOŞ DEĞİL: en az bir animasyonlu bileşen ve bir ev sahibi var', () => {
    // Boşalan evren sessizce yeşil kalır; kapı önce kendi ölçtüğü şeyin var olduğunu kanıtlar.
    expect(ANIMASYONLU_BILESENLER.length).toBeGreaterThan(0)
    const toplamEv = ANIMASYONLU_BILESENLER.flatMap((y) => evSahipleri(bilesenAdi(y)))
    expect(toplamEv.length).toBeGreaterThan(0)
  })

  it('K2 — animasyonlu bir bloğu çizen her ağaç ScrollObserver da mount eder', () => {
    const ihlaller: string[] = []

    for (const bilesenYolu of ANIMASYONLU_BILESENLER) {
      const ad = bilesenAdi(bilesenYolu)
      for (const ev of evSahipleri(ad)) {
        const kaynak = oku(ev)
        // Ev sahibi ya sağlayıcıyı kendi çizer, ya kendisi de animasyonlu bir bloktur
        // (o zaman sorumluluk ONU çizen ağaca geçer ve bu döngü orada ölçülür).
        const kendiSaglar = new RegExp(`<${SAGLAYICI}[\\s/>]`).test(kaynak)
        const kendisiDeBlok = kaynak.includes(ACILMA_IZI)
        if (!kendiSaglar && !kendisiDeBlok) {
          ihlaller.push(`${relative(process.cwd(), ev)} → <${ad}/> çiziyor ama <${SAGLAYICI}/> yok`)
        }
      }
    }

    expect(
      ihlaller,
      'Bu dosyalar opacity-0 ile başlayan bir blok çiziyor ama onu açacak sağlayıcıyı ' +
        'mount etmiyor. İçerik DOM\'da olur, testler bulur, EKRANDA GÖRÜNMEZ ' +
        '(2026-09-07 ölçümü: /products, 7 öğenin 7\'si opaklık 0):\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('K3 (ayırt edicilik) — sağlayıcısı alınmış bir ağaç KIRMIZI verir', () => {
    // Kapının gerçekten ölçtüğünü kanıtlar: aynı mantık, sağlayıcısı sökülmüş kaynağa
    // uygulandığında ihlal ÜRETMELİ. Üretmiyorsa kapı her hâlde yeşildir = kapı değildir.
    const sahteEv = `
      import GuidedCategoryDiscovery from '../components/home/GuidedCategoryDiscovery'
      export default function Sahte() {
        return <GuidedCategoryDiscovery displayCategories={[]} />
      }
    `
    const kendiSaglar = new RegExp(`<${SAGLAYICI}[\\s/>]`).test(sahteEv)
    const kendisiDeBlok = sahteEv.includes(ACILMA_IZI)
    expect(kendiSaglar || kendisiDeBlok).toBe(false)

    // Ve sağlayıcı eklenince YEŞİLE döner — kural tek yönlü bir "hep kırmızı" değil.
    const onarilmis = sahteEv.replace('return <', 'return <><ScrollObserver /><')
    expect(new RegExp(`<${SAGLAYICI}[\\s/>]`).test(onarilmis)).toBe(true)
  })
})
