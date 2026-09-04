/**
 * INV-ALTSEKME-1 — mobil alt sekme çubuğu bayrağa BAĞLI, MASAÜSTÜNDE YOK, ve BAĞLANMIŞ.
 *
 * NİÇİN VAR (REC-129 Faz 1b):
 * Bu çubuk bayrak arkasında doğuyor ve bugün müşteri onu görmüyor. Tam da bu yüzden
 * üç şey sessizce bozulabilir ve kimse fark etmez:
 *  1. Bayrak kontrolü düşerse çubuk canlıya sızar — henüz eksik bir kabuğun yarısı
 *     müşteriye görünür (header hâlâ eski altı eylemi taşıyor → çift gezinme).
 *  2. `md:hidden` düşerse masaüstünde de çizilir; tasarım kararı yalnız mobil.
 *  3. Bileşen layout'a bağlanmazsa "indi" görünür ama ERİŞİLEMEZ olur — bayrak
 *     açıldığı gün hiçbir şey olmaz ve sebebi aranır. (Ölçülmüş sınıf: "iş bitti"
 *     ile "iş erişilebilir" aynı şey değildir.)
 *
 * ⭐NİÇİN RENDER TESTİ DEĞİL, KAYNAK TESTİ:
 * Bayrak bir DERLEME-ZAMANI SABİTİDİR (`export const … = false`). jsdom'da render edip
 * "hiçbir şey çizilmedi" görmek AYIRT ETMEZ: bileşen bambaşka bir sebeple de (hata,
 * eksik sağlayıcı, boş sözlük) hiçbir şey çizmeyebilirdi ve test yine yeşil kalırdı.
 * Ölçülen şey bu yüzden koşum çıktısı değil, KAYNAKTAKİ SÖZLEŞMEDİR.
 *
 * ⛔NE ÖLÇMEZ (gizlenmiyor):
 *  · Çubuğun mobilde gerçekten 44px dokunma hedefiyle çizildiğini — bu düzen/piksel
 *    sorusudur, gerçek tarayıcı ister; jsdom düzen hesaplamaz.
 *  · Kontrastı (jsdom `index.css`'i yüklemiyor; axe'ın color-contrast kuralı orada koşmaz).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')

const BAYRAK = 'MOBIL_ALT_SEKME_CUBUGU'
const CUBUK = oku('src', 'components', 'navigation', 'MobilAltSekmeCubugu.tsx')
const FEATURES = oku('src', 'config', 'features.ts')
const LAYOUT = oku('src', 'components', 'layout', 'MainLayout.tsx')
const TR = oku('src', 'i18n', 'dictionaries', 'tr.ts')
const EN = oku('src', 'i18n', 'dictionaries', 'en.ts')

/** Yorum satırlarını at — bir kuralın yalnız YORUMDA anılması onu uygulamaz. */
function govde(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

const CUBUK_GOVDE = govde(CUBUK)
const LAYOUT_GOVDE = govde(LAYOUT)

describe('INV-ALTSEKME-1 — alt sekme çubuğu bayrağa bağlı ve yalnız mobilde', () => {
  it('bayrak features.ts içinde ve KAPALI doğuyor', () => {
    expect(
      new RegExp(`export const ${BAYRAK}\\s*=\\s*false`).test(FEATURES),
      `${BAYRAK} features.ts'te "false" olarak tanimli DEGIL. Bu cubuk Faz 1c (header ` +
        'tek oge) inmeden acilamaz — yoksa ayni is iki yerde gorunur.',
    ).toBe(true)
  })

  it('bileşen bayrağı OKUYOR ve olumsuzunda erken dönüyor', () => {
    expect(
      CUBUK_GOVDE.includes(`import { ${BAYRAK} }`) || CUBUK_GOVDE.includes(BAYRAK),
      'Bilesen bayragi hic anmiyor — bayrak kontrolu dusmus olabilir.',
    ).toBe(true)
    expect(
      new RegExp(`if\\s*\\(\\s*!${BAYRAK}\\s*\\)\\s*return null`).test(CUBUK_GOVDE),
      `Bayrak KAPALIYKEN erken donus yok. Beklenen tam bicim: "if (!${BAYRAK}) return null". ` +
        'Bayragi yalniz import etmek yetmez — import satiri KULLANIM sayilmaz.',
    ).toBe(true)
  })

  it('masaüstünde çizilmiyor — her kök kapsayıcı md:hidden taşıyor', () => {
    // `fixed` konumlu her katman (perde, iki yaprak panel, cubugun kendisi) ayri ayri
    // gizlenmeli; birinde unutulursa masaustunde o katman tek basina belirir.
    const fixedKatmanlar = [...CUBUK_GOVDE.matchAll(/className="([^"]*\bfixed\b[^"]*)"/g)].map(
      (m) => m[1],
    )
    expect(
      fixedKatmanlar.length,
      'Hic "fixed" katman bulunamadi — dosya beklenen bicimde degil, kapi KOR kalmis olabilir.',
    ).toBeGreaterThanOrEqual(4)
    const gizlenmeyen = fixedKatmanlar.filter((c) => !c.includes('md:hidden'))
    expect(
      gizlenmeyen,
      `Bu "fixed" katmanlar masaustunde de cizilir (md:hidden yok): ${gizlenmeyen.join(' | ')}`,
    ).toEqual([])
  })

  it('layout\'a BAĞLANMIŞ — "indi" ile "erişilebilir" aynı şey değil', () => {
    expect(
      LAYOUT_GOVDE.includes('<MobilAltSekmeCubugu'),
      'Bilesen MainLayout icinde render EDILMIYOR. Bayrak acildigi gun hicbir sey olmaz.',
    ).toBe(true)
  })

  it('sekme metinleri sözlükten geliyor — hiçbiri gövdeye gömülü değil', () => {
    const ANAHTARLAR = [
      'etiket', 'anasayfa', 'urunler', 'teklif', 'teklifSayisi',
      'destek', 'hesap', 'tumUrunler', 'markalar', 'teknikDestek', 'iletisim',
    ]
    for (const a of ANAHTARLAR) {
      expect(
        CUBUK_GOVDE.includes(`altSekme.${a}`),
        `t('altSekme.${a}') bilesende kullanilmiyor — metin gomulu olabilir (kural 7).`,
      ).toBe(true)
      // Anahtarlar NESTED olmali: nokta iceren duz anahtar cozulmez, ham anahtar basilir.
      for (const [ad, sozluk] of [['tr', TR], ['en', EN]] as const) {
        expect(
          new RegExp(`\\n\\s{4}${a}:`).test(sozluk),
          `"${a}" ${ad}.ts icinde altSekme altinda NESTED olarak yok.`,
        ).toBe(true)
      }
    }
  })

  it('rozet TEK BAŞINA anlam taşımıyor — sayı sözle de veriliyor', () => {
    // Renk/konum tek bilgi tasiyicisi olamaz: rozetin yaninda hem gorunur "Teklif"
    // metni hem de ekran okuyucuya sayiyi soyleyen bir dize olmali.
    expect(
      CUBUK_GOVDE.includes('sr-only') && CUBUK_GOVDE.includes('altSekme.teklifSayisi'),
      'Rozet sayisi yalniz gorsel — ekran okuyucuya soylenmiyor.',
    ).toBe(true)
  })
})
