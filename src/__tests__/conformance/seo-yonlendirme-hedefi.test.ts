import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import { eskiAdresEsle } from '@/lib/adres/eslestirici'
import { ESKI_ADRES_HARITASI } from '@/lib/adres/haritaKaynagi'
import { tohumDogrula } from '@/lib/adres/tohum'
import { modelAdresiCoz } from '@/utils/adresUret'

/**
 * INV-YONLENDIRME-HEDEF-1 — Kalıcı yönlendirmenin hedefi BUGÜN de yaşayan bir adres olmalı.
 *
 * NİÇİN VAR (canlı 404, 2026-09-07 — kendi PR'ımın yaptığı):
 * REC-186'da NIC-11921'in model kodu düzeltilecekti (`6N090P` → `61090P`). Yönlendirme
 * kuralı PR #1071 ile master'a indi, ama ad/slug düzeltmesi bir **prod DB yazımı** ve
 * Recep kapısında bekliyor. Yani kural VERİDEN ÖNCE indi ve şu zinciri üretti:
 *
 *   /tr/products/…-6n090p-11921  →308→  /tr/products/…-61090p-11921  →  **404**
 *
 * Merge ÖNCESİ o adres ÇALIŞIYORDU (308 → aile sayfası, 200). Merge SONRASI öldü.
 * `next.config` yönlendirmesi uygulamanın veri-sürücülü çözümünden ÖNCE koştuğu için
 * `resolveProductRoute`ın kurtarma adımı hiç devreye giremedi.
 *
 * DERS: kalıcı (308) yönlendirme tarayıcıda önbelleklenir. Hedefi "yarın doğru olacak"
 * bir adres olamaz; "bugün de yarın da doğru" olmalı. Kodun veriden önce inmesi normaldir
 * — o yüzden kod, verinin henüz değişmediği hâlde de AYAKTA kalan bir hedef seçmelidir.
 *
 * BU KAPI NE ÖLÇER: `next.config.mjs`'teki ürün yönlendirmelerinin hedefinin **varyant
 * slug** biçiminde OLMADIĞINI. Varyant adresleri bu vitrinde sayfa değildir — kanonik
 * adres daima AİLE slug'ıdır ve varyant `?sku=` ile aynı sayfada seçilir (F5-B W2.2
 * kararı; `src/app/sitemap.ts` aynı kuralı yazıyor: "Varyant URL'i sitemap'e ASLA girmez").
 * Yani varyant slug'ına yapılan kalıcı yönlendirme, tanımı gereği ölü uca gider.
 *
 * ⚠BU KAPININ SINIRI, ADIYLA: ağa çıkmaz, adresin canlıda 200 döndüğünü ÖLÇMEZ. Yalnız
 * yukarıda ölçülmüş kusur SINIFININ geri gelmesini engeller. Canlı doğrulama duman
 * kapısının ve yayın sonrası ölçümün işidir.
 *
 * FAZ 3-C (URN-85 2/2) — TAŞIYICI DEĞİŞTİ: `next.config.mjs`'teki 12 ürün/aile kuralı (6 Lineo çap + 6 eski
 * ürün) KALKTI; tek taşıyıcıları eski adres haritasıdır (`src/data/eski-adres-tohum.json` → üretilmiş harita →
 * middleware). Sınıf aynı kalır, ölçüldüğü yer genişler: `next.config` tarafı (bir ürün kuralı geri gelirse
 * kapı canlıdır) + YENİ taşıyıcı (tohumdaki her eski adresin hedefi varyant slug'ı değil, yaşayan sayfa).
 */

const KOK = path.resolve(__dirname, '../../..')
const NEXT_CONFIG = path.join(KOK, 'next.config.mjs')

/**
 * Yorumları ayıklar; kapı YALNIZ kodu ölçsün diye.
 *
 * `(^|[^:])` öneki ZORUNLU: onsuz `https://…` içindeki `//` yorum sanılır, satırın geri
 * kalanı silinir ve tarama SESSİZCE körleşir (bu depoda yaşandı, INV-SCRUB-1). Bu dosyada
 * ayrıca kritik: yukarıdaki gerekçe yorumunda ölü slug'ın kendisi geçiyor — yorum
 * ayıklanmazsa kapı kendi belgesini kusur diye raporlardı.
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/**
 * VARYANT SLUG biçimi: sonu `-<4+ hane>` ile biten ürün slug'ı (ör. `…-6n090p-11921`).
 * Aile slug'ları böyle bitmez (`nicotra-gebhardt-dd`, `vortice-lineo-quiet`).
 */
const VARYANT_SLUG = /-\d{4,}$/

interface Kural {
  source: string
  destination: string
}

/**
 * `next.config.mjs`ten `source`/`destination` çiftlerini çıkarır (yorumsuz metinden). `metin` verilmezse gerçek dosya
 * okunur; sentetik metin çıkarıcının KÖR OLMADIĞINI kanıtlamak içindir (ÖN KOŞUL).
 */
function urunYonlendirmeleri(metin: string = fs.readFileSync(NEXT_CONFIG, 'utf8')): Kural[] {
  const kod = yorumsuz(metin)
  const kurallar: Kural[] = []
  const desen = /source:\s*'([^']+)'\s*,\s*destination:\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = desen.exec(kod)) !== null) {
    kurallar.push({ source: m[1], destination: m[2] })
  }
  return kurallar.filter((k) => k.source.includes('/products/'))
}

describe('INV-YONLENDIRME-HEDEF-1 — yönlendirme hedefi bugün de yaşamalı', () => {
  it('ÖN KOŞUL — evren boş DEĞİL: ayıklayıcı sentetik kuralı tanır ve ürün yönlendirmesi en az bir taşıyıcıda var (boş evrende koşan kapı ölçüm değildir)', () => {
    // (a) Ayıklayıcı AYIRT EDER (yorum içindeki kural sayılmaz, ürün kuralı sayılır, kategori kuralı sayılmaz).
    const sentetik = `
      // { source: '/tr/products/yorumdaki-kural', destination: '/tr/products/x' },
      { source: '/:lang(tr|en)/products/eski-urun-12345', destination: '/:lang/products/yeni-aile?sku=ABC-1', permanent: true },
      { source: '/category/fanlar/:path*', destination: '/category/fans/:path*', permanent: true },
    `
    expect(urunYonlendirmeleri(sentetik)).toEqual([
      { source: '/:lang(tr|en)/products/eski-urun-12345', destination: '/:lang/products/yeni-aile?sku=ABC-1' },
    ])

    // (b) Evren config'te boş olabilir (Faz 3-C) ama taşıyıcı boş olamaz: kurallar tohumda durur.
    const tohum = tohumDogrula(tohumHam)
    expect(
      urunYonlendirmeleri().length + tohum.urunler.length + tohum.aileler.length,
      'next.config.mjs icinde /products/ yonlendirmesi yok VE tohum da bos — kapi bos evrende yesil kaliyor.'
    ).toBeGreaterThan(0)
  })

  it('YENİ TAŞIYICI — tohumdaki hiçbir eski adres VARYANT slug\'ına gitmez (hedef aile ya da yayındaki modelin sayfası)', () => {
    const tohum = tohumDogrula(tohumHam)
    const harita = ESKI_ADRES_HARITASI?.kiracilar[tohum.kiraci]
    if (!harita) throw new Error('eski adres haritası bağlı değil ya da tohumun kiracısı haritada yok (BOŞ EVREN)')
    const eskiler = [...tohum.urunler.map((u) => u.eski), ...tohum.aileler.map((a) => a.eski)]
    expect(eskiler.length, 'BOŞ EVREN: tohumda eski ürün/aile adresi yok').toBeGreaterThan(0)

    const kotu: string[] = []
    for (const eski of eskiler) {
      for (const dil of ['tr', 'en'] as const) {
        const yol = `/${dil}/products/${eski}`
        const s = eskiAdresEsle(harita, { yol, sku: null, dilTespit: () => dil })
        if (!s) {
          kotu.push(`${yol} -> haritada YOK (404)`)
          continue
        }
        const son = s.hedef.split('?')[0].replace(/\/$/, '').split('/').pop() ?? ''
        // Model adresi (`<metin>-p-<sku>`) yayındaki modelin SAYFASIDIR; bunun dışında varyant biçimi ölü uçtur.
        if (modelAdresiCoz(son) === null && VARYANT_SLUG.test(son)) kotu.push(`${yol} -> ${s.hedef}`)
      }
    }
    expect(kotu, 'Bir eski adresin hedefi VARYANT slug biciminde (varyant adresleri sayfa degildir).').toEqual([])
  })

  it('SABOTAJ HEDEFİ — hiçbir ürün yönlendirmesi VARYANT slug\'ına gitmez', () => {
    const kotu = urunYonlendirmeleri().filter((k) => {
      const yol = k.destination.split('?')[0].replace(/\/$/, '')
      const son = yol.split('/').pop() ?? ''
      return VARYANT_SLUG.test(son)
    })

    expect(
      kotu.map((k) => `${k.source} -> ${k.destination}`),
      'Bir yonlendirmenin hedefi VARYANT slug biciminde. Varyant adresleri bu vitrinde sayfa ' +
        'DEGILDIR (kanonik adres daima AILE slug\'i, varyant ?sku= ile secilir) — yani hedef ' +
        'olu uca gider. 2026-09-07\'de tam bu oldu ve calisan bir adres canlida 404 verdi.'
    ).toEqual([])
  })

  it('AYIRT EDİCİ — ölçüt gerçekten varyant biçimini tanıyor (kapı her şeye yeşil demiyor)', () => {
    // Kapı ayırt etmiyorsa ölçüm değildir: aile slug'ı GEÇMELİ, varyant slug'ı DÜŞMELİ.
    expect(VARYANT_SLUG.test('nicotra-gebhardt-dd')).toBe(false)
    expect(VARYANT_SLUG.test('vortice-lineo-quiet')).toBe(false)
    expect(VARYANT_SLUG.test('dd-12-12-1500w-3f-4p-2v-61090p-11921')).toBe(true)
  })
})
