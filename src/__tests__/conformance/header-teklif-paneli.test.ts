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
const ICERIK = oku('src', 'components', 'navigation', 'TeklifPaneliIcerigi.tsx')
const CUBUK = oku('src', 'components', 'navigation', 'MobilAltSekmeCubugu.tsx')
const HEADER = oku('src', 'components', 'StickyHeader.tsx')
const YERLESIM = oku('src', 'components', 'layout', 'MainLayout.tsx')
const FEATURES = oku('src', 'config', 'features.ts')
const TR = oku('src', 'i18n', 'dictionaries', 'tr.ts')
const EN = oku('src', 'i18n', 'dictionaries', 'en.ts')

/** Yorumları at — bir kuralın yalnız yorumda anılması onu uygulamaz. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const PANEL_GOVDE = govde(PANEL)
const ICERIK_GOVDE = govde(ICERIK)
const CUBUK_GOVDE = govde(CUBUK)
const HEADER_GOVDE = govde(HEADER)
const YERLESIM_GOVDE = govde(YERLESIM)

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
    expect(ICERIK_GOVDE.includes('teklifPaneli.baslik'), 'DOLU hal yok.').toBe(true)
    expect(
      ICERIK_GOVDE.includes('teklifPaneli.bosBaslik') && ICERIK_GOVDE.includes('teklifPaneli.bosAciklama'),
      'BOS hal yok — listesi bos ziyaretci bombos bir kutu gorur.',
    ).toBe(true)
    expect(
      ICERIK_GOVDE.includes('teklifPaneli.girisDaveti'),
      'GIRISSIZ hal yok.',
    ).toBe(true)
  })

  it('⭐girişsizde ÖLÜ KAPI yok — hesap kısayolları user dalının İÇİNDE', () => {
    // Ayirt edici olcum: hesap rotalari `user ?` ucusunun DOGRU dalinda mi.
    const ucluIndex = ICERIK_GOVDE.indexOf('user ?')
    expect(ucluIndex, 'Icerikte "user ?" dallanmasi YOK — giris durumu hic sorulmuyor.').toBeGreaterThan(-1)
    const sonrasi = ICERIK_GOVDE.slice(ucluIndex)
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
    // Düğmenin metni panelde, panelin içeriği ICERIK'te — anahtar hangi dosyada
    // aranacaksa orada aranır; "herhangi bir yerde geçiyor" ölçütü ayırt etmezdi.
    const PANEL_ANAHTARLARI = ['teklif', 'kalemSayisi']
    const ICERIK_ANAHTARLARI = [
      'baslik', 'bosBaslik', 'bosAciklama', 'urunlereGit',
      'tumListe', 'tekliflerim', 'projelerim', 'favorilerim', 'girisDaveti',
    ]
    for (const a of [...PANEL_ANAHTARLARI, ...ICERIK_ANAHTARLARI]) {
      const kaynak = PANEL_ANAHTARLARI.includes(a) ? PANEL_GOVDE : ICERIK_GOVDE
      expect(
        kaynak.includes(`teklifPaneli.${a}`),
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

  /*
   * Aşağıdaki dört kural GÖZLE bulundu, kapıyla değil: bayrak açık hâliyle ekran
   * görüntüsü alındı ve mobilde "Teklif" İKİ yerde çıktı. Kapı o gün bunu göremezdi
   * çünkü ikisi de tek başına doğruydu; kusur BİRLİKTELİKTE idi. Artık ölçülüyor.
   */
  it('⭐header Teklif öğesi MOBİLDE GİZLİ — çift gezinme geri gelemez', () => {
    const i = HEADER_GOVDE.indexOf('<HeaderTeklifPaneli')
    expect(i, 'Header paneli render edilmiyor.').toBeGreaterThan(-1)
    // Sarmalayici, ogeden ONCE gelen en yakin acilis etiketinde aranir.
    const oncesi = HEADER_GOVDE.slice(0, i)
    const sonSarmalayici = oncesi.slice(oncesi.lastIndexOf('<div'))
    expect(
      // `md:block` ya da `md:flex` — kural "mobilde gizli", kapsayicinin masaustu
      // duzeni degil. Dil secici yaninda cizilince `flex` oldu; kural degismedi.
      /hidden\s+md:(block|flex)/.test(sonSarmalayici),
      'Header Teklif ogesi mobilde GIZLENMIYOR (`hidden md:block` yok). Alt cubukta da ' +
        'Teklif sekmesi var; ikisi birden gorunurse ziyaretci ayni isi IKI YERDE gorur ' +
        '— bu kusur 2026-09-04 te ekran goruntusunde OLCULDU.',
    ).toBe(true)
  })

  it('⭐alt çubuğun Teklif sekmesi PANEL açıyor — /cart bağlantısı DEĞİL', () => {
    expect(
      CUBUK_GOVDE.includes('aria-haspopup="dialog"'),
      'Alt cubugun Teklif sekmesi panel acmiyor.',
    ).toBe(true)
    expect(
      /<Link\s+href=\{Routes\.cart\(\)\}[\s\S]{0,400}?altSekme\.teklif/.test(CUBUK_GOVDE),
      'Teklif sekmesi hala dogrudan /cart e giden bir Link. Header ogesi mobilde gizlendigi ' +
        'icin panelin TEK girisi bu sekmedir; sayfaya atlarsa panel mobilde ERISILEMEZ olur.',
    ).toBe(false)
  })

  it('⭐alt çubuğun Hesap sekmesi YAPRAK açıyor, girişsizde ÖLÜ KAPI yok', () => {
    expect(
      /<Link\s+href=\{Routes\.account\.overview\(\)\}[\s\S]{0,300}?altSekme\.hesap'\)\}\s*<\/Link>/.test(CUBUK_GOVDE),
      'Hesap sekmesi hala dogrudan /account a giden bir Link — Recep hukmu yaprak acilmasi.',
    ).toBe(false)
    // Girissiz dalda hesap rotalari BAGLANTI olmamali; "kilitli" metin olarak durur.
    const i = CUBUK_GOVDE.indexOf('user ?')
    expect(i, 'Hesap yapraginda "user ?" dallanmasi YOK.').toBeGreaterThan(-1)
    const sonrasi = CUBUK_GOVDE.slice(i)
    const ayirici = sonrasi.indexOf(') : (')
    const girissizDal = sonrasi.slice(ayirici)
    expect(
      /<Link[^>]*Routes\.account\./.test(girissizDal.slice(0, girissizDal.indexOf('</nav>'))),
      'Girissiz dalda /account a giden bir Link var — olu kapi.',
    ).toBe(false)
    expect(
      girissizDal.includes('altSekme.kilitli') && girissizDal.includes('aria-disabled'),
      'Kilitli kalemler yok ya da ekran okuyucuya kilitli DENMIYOR.',
    ).toBe(true)
  })

  it('⭐yüzen yığın mobilde çubuğun ÜSTÜNDE — Hesap sekmesi tıklanabilir kalıyor', () => {
    // Dil secici tasindiktan SONRA bile yigin (geri-yukari, WhatsApp) cubugun sag
    // ucuna biniyordu ve Hesap sekmesi TIKLANAMIYORDU. Gorunmez bir kapsayici
    // dokunusu yutuyordu; ekran goruntusu bunu gostermedi, ETKILESIM gosterdi.
    expect(
      new RegExp(`${BAYRAK}\\s*\\?\\s*'bottom-24 md:bottom-6'\\s*:\\s*'bottom-6'`).test(YERLESIM_GOVDE),
      'Yuzen yigin bayraga gore yukselmiyor — alt cubugun sag ucundaki sekme tiklanamaz olur.',
    ).toBe(true)
  })

  it('⭐yüzen dil seçici bayrak açıkken YOK — header ve Hesap yaprağına taşındı', () => {
    expect(
      new RegExp(`\\{!\\s*${BAYRAK}\\s*&&`).test(YERLESIM_GOVDE),
      'MainLayout taki yuzen dil secici bayrak acikken hala ciziliyor. Recep hukmu ' +
        '(2026-09-04 12:30): yeni tasarimda YUZEN dil secici YOK.',
    ).toBe(true)
    expect(
      HEADER_GOVDE.includes('<LanguageSwitcher'),
      'Masaustu header inde dil secici YOK — yuzen dugme kaldirildi, yerine konmadi: ' +
        'masaustunde dil DEGISTIRILEMEZ olurdu.',
    ).toBe(true)
    expect(
      CUBUK_GOVDE.includes('<LanguageSwitcher') && CUBUK_GOVDE.includes('altSekme.dil'),
      'Hesap yapraginda dil secici YOK — mobilde dil DEGISTIRILEMEZ olurdu.',
    ).toBe(true)
  })

  it('⭐panel içeriği TEK KAYNAK — iki yüzey kopyalanmıyor', () => {
    for (const [ad, kaynak] of [['HeaderTeklifPaneli', PANEL_GOVDE], ['MobilAltSekmeCubugu', CUBUK_GOVDE]] as const) {
      expect(
        kaynak.includes('<TeklifPaneliIcerigi'),
        `${ad} ortak icerigi kullanmiyor — iki yuzey zamanla AYRISIR ve hicbir kapi gormez.`,
      ).toBe(true)
    }
    // Header paneli icerigi KOPYALAMAMALI — kendi hesap kisayolunu yazmamali.
    // ⚠Alt cubuk BU KURALIN DISINDA ve bu bilerek: Recep hukmuyle (12:30) Hesap
    // YAPRAGI ayri bir yuzey ve kendi kisayollarini tasir. Kural "teklif panelinin
    // icerigi tek kaynaktan gelsin"dir, "hicbir yerde hesap rotasi gecmesin" degil —
    // ikincisi dogru olsa Hesap yapragi hic yazilamazdi.
    expect(
      PANEL_GOVDE.includes('Routes.account.quotes()'),
      'Header paneli hesap kisayolunu KENDI yaziyor — ortak icerigin kopyasi var.',
    ).toBe(false)
  })
})
