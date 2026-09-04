/**
 * INV-HEADER-TEKLIF-1 — header "Teklif" paneli bayrağa bağlı, ÜÇ HÂLİ de var,
 * girişsizde ÖLÜ KAPI açmıyor, ve eski eylem kümesiyle AYNI ANDA çizilmiyor.
 *
 * NİÇİN VAR (REC-129 Faz 1c):
 * Bu iş bayrak arkasında ve müşteri bugün görmüyor. Sessizce bozulabilecek dört şey:
 *  1. Bayrak kontrolü düşerse yarım kabuk canlıya sızar.
 *  2. Header'ın ESKİ eylem kümesi ile YENİ tek öğe aynı anda çizilirse ziyaretçi aynı
 *     işi iki yerde görür — Faz 1b'nin kapalı doğmasının tek sebebi buydu.
 *  3. Girişsiz ziyaretçiye `/account/**` kısayolları gösterilirse **ölü kapı** açılır
 *     (tıklar, giriş duvarına çarpar). Tasarım o hâlde giriş daveti gösteriyor.
 *  4. Panelin üç hâlinden biri (boş liste) unutulursa, listesi boş olan ziyaretçi
 *     bomboş bir kutu görür ve çıkış yolu bulamaz.
 *
 * ⭐NİÇİN KAYNAK TESTİ: bayrak DERLEME-ZAMANI sabiti; jsdom'da "hiçbir şey çizilmedi"
 * görmek AYIRT ETMEZ (bileşen başka sebeple de boş çizebilir). Ayrıca 3. ve 4. maddeler
 * KOŞUL DALLARIDIR — render testi yalnız girdiğin dalı görür, girmediğini değil.
 *
 * ⛔NE ÖLÇMEZ (gizlenmiyor): panelin gerçekten okunabilir/erişilebilir çizildiğini
 * (düzen ve kontrast — jsdom düzen hesaplamaz, `index.css`'i de yüklemez) · "aynı iş
 * iki yerde mi" sorusunun SEMANTİK yanını (kapı yalnız yapısal ayrımı görür).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')

const BAYRAK = 'YENI_KABUK_GEZINMESI'
const PANEL = oku('src', 'components', 'navigation', 'HeaderTeklifPaneli.tsx')
const HEADER = oku('src', 'components', 'StickyHeader.tsx')
const FEATURES = oku('src', 'config', 'features.ts')
const TR = oku('src', 'i18n', 'dictionaries', 'tr.ts')
const EN = oku('src', 'i18n', 'dictionaries', 'en.ts')

/** Yorumları at — bir kuralın yalnız yorumda anılması onu uygulamaz. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const PANEL_GOVDE = govde(PANEL)
const HEADER_GOVDE = govde(HEADER)

describe('INV-HEADER-TEKLIF-1 — header teklif paneli', () => {
  it('bayrak features.ts içinde ve KAPALI doğuyor', () => {
    expect(
      new RegExp(`export const ${BAYRAK}\\s*=\\s*false`).test(FEATURES),
      `${BAYRAK} "false" olarak tanimli DEGIL — yarim kabuk canliya sizabilir.`,
    ).toBe(true)
  })

  it('panel bayrağın olumsuzunda erken dönüyor (import KULLANIM sayılmaz)', () => {
    expect(
      new RegExp(`if\\s*\\(\\s*!${BAYRAK}\\s*\\)\\s*return null`).test(PANEL_GOVDE),
      `Beklenen tam bicim yok: "if (!${BAYRAK}) return null".`,
    ).toBe(true)
  })

  it('⭐header ESKİ küme ile YENİ öğeyi aynı anda çizmiyor — dallar AYRIK', () => {
    // Ucluda `?:` kullanilmali: `&&` ile eklenirse eski kume DE cizilmeye devam eder
    // ve tam olarak "ayni is iki yerde" hatasi dogar.
    expect(
      new RegExp(`\\{\\s*${BAYRAK}\\s*\\?`).test(HEADER_GOVDE),
      'Header bayragi UCLU (?:) ile dallandirmiyor. `&&` kullanilirsa eski eylem kumesi ' +
        'da cizilmeye devam eder ve ziyaretci ayni isi IKI YERDE gorur.',
    ).toBe(true)
    expect(
      HEADER_GOVDE.includes('<HeaderTeklifPaneli'),
      'Header paneli render ETMIYOR — bayrak acildigi gun hicbir sey olmaz.',
    ).toBe(true)
    // Eski kume SILINMEDI, sadece dallandi: bayrak kapaliyken bugunku hal aynen surmeli.
    expect(
      HEADER_GOVDE.includes("t('header.cart')"),
      'Eski eylem kumesi SILINMIS. Bayrak kapaliyken bugunku header aynen durmali; ' +
        'bu PR gorunumu DEGISTIRMEMELI.',
    ).toBe(true)
  })

  it('ÜÇ HÂL de kaynakta var: dolu · boş · girişsiz', () => {
    expect(PANEL_GOVDE.includes('teklifPaneli.baslik'), 'DOLU hal yok.').toBe(true)
    expect(
      PANEL_GOVDE.includes('teklifPaneli.bosBaslik') && PANEL_GOVDE.includes('teklifPaneli.bosAciklama'),
      'BOS hal yok — listesi bos ziyaretci bombos bir kutu gorur.',
    ).toBe(true)
    expect(
      PANEL_GOVDE.includes('teklifPaneli.girisDaveti'),
      'GIRISSIZ hal yok.',
    ).toBe(true)
  })

  it('⭐girişsizde ÖLÜ KAPI yok — hesap kısayolları user dalının İÇİNDE', () => {
    // Ayirt edici olcum: hesap rotalari `user ?` ucusunun DOGRU dalinda mi.
    const ucluIndex = PANEL_GOVDE.indexOf('user ?')
    expect(ucluIndex, 'Panelde "user ?" dallanmasi YOK — giris durumu hic sorulmuyor.').toBeGreaterThan(-1)
    const sonrasi = PANEL_GOVDE.slice(ucluIndex)
    const ayirici = sonrasi.indexOf(') : (')
    expect(ayirici, 'Ucluda aksi dal (":") bulunamadi.').toBeGreaterThan(-1)
    const girisliDal = sonrasi.slice(0, ayirici)
    const girissizDal = sonrasi.slice(ayirici)

    for (const rota of ['Routes.account.quotes()', 'Routes.account.projects()', 'Routes.account.favorites()']) {
      expect(girisliDal.includes(rota), `${rota} girisli dalda YOK.`).toBe(true)
      expect(
        girissizDal.includes(rota),
        `${rota} GIRISSIZ dalda da var — olu kapi. Girissiz ziyaretci tiklar ve giris ` +
          'duvarina carpar; gorunen ama calismayan kapi, olmayan kapidan kotudur.',
      ).toBe(false)
    }
  })

  it('metinler sözlükten ve TR/EN paritesi tam', () => {
    const ANAHTARLAR = [
      'teklif', 'kalemSayisi', 'baslik', 'bosBaslik', 'bosAciklama', 'urunlereGit',
      'tumListe', 'tekliflerim', 'projelerim', 'favorilerim', 'girisDaveti',
    ]
    for (const a of ANAHTARLAR) {
      expect(
        PANEL_GOVDE.includes(`teklifPaneli.${a}`),
        `t('teklifPaneli.${a}') kullanilmiyor — metin gomulu olabilir (kural 7).`,
      ).toBe(true)
      for (const [ad, sozluk] of [['tr', TR], ['en', EN]] as const) {
        expect(
          new RegExp(`\\n\\s{4}${a}:`).test(sozluk),
          `"${a}" ${ad}.ts icinde teklifPaneli altinda NESTED olarak yok.`,
        ).toBe(true)
      }
    }
  })

  it('rozet TEK BAŞINA anlam taşımıyor', () => {
    expect(
      PANEL_GOVDE.includes('sr-only') && PANEL_GOVDE.includes('teklifPaneli.kalemSayisi'),
      'Rozet sayisi ekran okuyucuya soylenmiyor.',
    ).toBe(true)
  })
})
