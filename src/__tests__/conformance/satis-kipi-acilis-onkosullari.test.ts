// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * INV-SATIS-KIPI-7 — satış açılış önkoşulları: `satis-kipine-gec.mjs --yon ac` bir önkoşul GEÇMEDİKÇE (ölçülemedi dahil)
 * canlıya yazmaz. Plan: docs/plans/rec168-satis-acilis-onkosullari-2026-09-29.md · cetvel: satis-kipi-gecis-standard.md §8.1.
 *
 * KORUDUĞU KUSUR: açılış günü listesi insan hafızasına bağlıydı; unutulan bir kalem (yer tutucu, sandbox ödeme, kapısız
 * edge fonksiyonu, bekçisiz sipariş tablosu) müşteriye ödeme açardı.
 *
 * BU KAPI NE ÖLÇMEZ: canlı ortamı (ölçücüler burada SAHTE fetch/DB ile sınanır; canlıyı `--onkosul` ölçer), İyzico canlı anahtar
 * çiftinin geçerliliğini, hukukçu teyidini. Betiğin `main()` akışı mock istemciyle koşmaz (process.exit + argv): yazma-sırası
 * YAPISAL olarak (kaynak konumları) bağlanır; davranış `acilisKapisi` üzerinde ölçülür.
 */
const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8')

type Durum = 'GECTI' | 'KALDI' | 'OLCULEMEDI' | 'OLCUT_YOK' | 'MUAF'
type Satir = { id: string; ad: string; durum: Durum; ayrinti: string }
type Hukum = { acilabilir: boolean; neden: string; satirlar: Satir[]; gecmeyen: string[] }
type Kalem = { id: string; ad: string; sahip: string; kanit: string; muaf: boolean; olc?: (ctx: Ctx) => Promise<{ gecti: boolean; ayrinti: string } | undefined> }
type Ctx = {
  env: Record<string, string>
  fetch: (url: string, init?: RequestInit) => Promise<Response>
  dbSorgu: ((sql: string, p?: unknown[]) => Promise<Record<string, unknown>[]>) | null
  anahtarAcik: boolean
  faturaBeyani?: string
  hedef: { acik: boolean; toplam: number; hidePriceTrue: number }
  tutarliMi: (d: unknown) => { tutarli: boolean; beklenen: string }
}
type Modul = {
  KALEMLER: Kalem[]
  YASAL_SAYFA_SLUGLARI: string[]
  GORUNUM_METINLERI: string[]
  IZINLI_ENV: string[]
  YENIDEN_OLCULEN: string[]
  suz: (m: unknown) => string
  faturaBeyaniDegerlendir: (b?: string) => { gecti: boolean; ayrinti: string }
  urunSayfasiDegerlendir: (bloklar: unknown) => { gecti: boolean; eksik: string[]; offer: number; kimlikli: number }
  degerlendir: (s: Satir[], o?: { kalemler?: Kalem[]; muaf?: Record<string, string> }) => Hukum
  onkosulOlc: (ctx: Ctx, o?: { kalemler?: Kalem[]; sadece?: string[] }) => Promise<Satir[]>
  kalemiOlc: (k: Kalem, ctx: Ctx) => Promise<Satir>
  acilisKapisi: (
    ctx: Ctx,
    o?: { kalemler?: Kalem[]; muaf?: Record<string, string>; hazirlik?: () => Promise<void> },
  ) => Promise<{ izin: boolean; asama: string; hukum: Hukum }>
}
type Betik = { tutarliMi: (d: unknown) => { tutarli: boolean; beklenen: string } }

/** ⛔`file://` URL zorunlu (INV-KAPI-IMPORT-1): şemasız yol Node ESM yükleyicisinde reddedilir. */
const yukle = async <T>(yol: string) => (await import(pathToFileURL(path.join(KOK, yol)).href)) as T

const GECERLI_BEYAN = 'e-arşiv faturaları mali müşavir aracılığıyla elle ile kesilecek (mali müşavir teyitli)'
const UZUN_GEREKCE = 'Şirket bilgisi kuruluşla gelecek, geçici muafiyet'

/** Her şeyin GEÇTİĞİ sahte dünya; testler bir şeyi bozar. */
type Ayar = {
  sayfaMetni?: string
  healthz?: { status: number; govde: unknown }
  probe?: { status: number; govde: string }
  politikaSayisi?: number
  tetikEksik?: boolean
  bekciYanlisTablo?: boolean
  resendDurum?: string
  bekciSorgulari?: { sayac: number; ikinciDefaDus?: boolean }
  epostaKaydi?: { siparis: number; teklif: number; kargo: number }
  /** Yasal sayfa başlığı/H1'i "(Taslak)" taşır (legalReviewCompleted=false hâli). */
  taslakBasligi?: boolean
  /** Ürün sayfasının JSON-LD nesnesi; verilmezse tam Merchant uyumlu (fiyatlı Offer + iade + gönderim + mpn). */
  urunJsonld?: unknown
}

const TAM_URUN_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ProductGroup',
  name: 'Ornek Aile',
  hasVariant: [
    {
      '@type': 'Product',
      name: 'Model A',
      mpn: 'MPN-A',
      offers: {
        '@type': 'Offer',
        price: '1500.00',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow' },
        shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'TRY' } },
      },
    },
  ],
}

function dunya(ayar: Ayar = {}, ctxEk: Partial<Ctx> = {}): Ctx {
  const yanit = (status: number, govde: string, tip = 'application/json') => new Response(govde, { status, headers: { 'content-type': tip } })
  const fetchSahte: Ctx['fetch'] = async (url) => {
    if (url.endsWith('/sitemap.xml')) {
      const locs = ['/tr', '/tr/products', '/tr/products/aile-bir', '/tr/products/aile-iki', '/tr/products/aile-uc', '/tr/category/fanlar']
      return yanit(200, `<urlset>${locs.map((l) => `<url><loc>https://site.test${l}</loc></url>`).join('')}</urlset>`, 'application/xml')
    }
    if (/\/tr\/products\/aile-/.test(url)) {
      const ld = JSON.stringify(ayar.urunJsonld ?? TAM_URUN_JSONLD)
      return yanit(200, `<html><head><script type="application/ld+json">${ld}</script></head><body><main>urun</main></body></html>`, 'text/html')
    }
    if (url.includes('/legal/')) {
      const ek = ayar.taslakBasligi ? ' (Taslak)' : ''
      return yanit(200, `<html><head><title>Hukuki Metin${ek} | VentHub</title></head><body><h1>Hukuki Metin${ek}</h1><main>${ayar.sayfaMetni ?? 'Temiz sözleşme metni'}</main></body></html>`, 'text/html')
    }
    if (url.includes('/functions/v1/healthz')) {
      const h = ayar.healthz ?? { status: 200, govde: { durum: 'saglikli', config: { odeme_ortami: 'prod' } } }
      return yanit(h.status, typeof h.govde === 'string' ? h.govde : JSON.stringify(h.govde))
    }
    if (url.includes('/auth/v1/token')) return yanit(200, JSON.stringify({ access_token: 'sahte-jeton' }))
    if (url.includes('/functions/v1/iyzico-payment')) {
      const p = ayar.probe ?? { status: 403, govde: '{"error":"SALES_CLOSED"}' }
      return yanit(p.status, p.govde)
    }
    if (url.includes('api.resend.com/domains')) return yanit(200, JSON.stringify({ data: [{ name: 'venthub.com.tr', status: ayar.resendDurum ?? 'verified' }] }))
    return yanit(404, '{}')
  }
  const dbSahte: NonNullable<Ctx['dbSorgu']> = async (sql) => {
    if (sql.includes('order_email_events')) return [ayar.epostaKaydi ?? { siparis: 1, teklif: 0, kargo: 0 }]
    if (sql.includes('satis_kipi_oku')) return [{ n: 1 }]
    if (sql.includes('pg_policy')) {
      const hepsi = [
        { polname: 'site_settings_satis_kipi_yalniz_servis_ins', polpermissive: false, polcmd: 'a' },
        { polname: 'site_settings_satis_kipi_yalniz_servis_upd', polpermissive: false, polcmd: 'w' },
      ]
      return hepsi.slice(0, ayar.politikaSayisi ?? 2)
    }
    if (sql.includes('join pg_class')) {
      const b = ayar.bekciSorgulari
      if (b) b.sayac += 1
      const dus = ayar.bekciYanlisTablo || (b?.ikinciDefaDus && b.sayac >= 2)
      const dogru = (ad: string, tablo: string) => ({ tgname: ad, relname: dus ? 'baska_tablo' : tablo, tgenabled: 'O', before_ins_upd: true, prosecdef: false })
      return [
        dogru('orders_istemci_yazma_bekcisi', 'venthub_orders'),
        dogru('order_items_istemci_yazma_bekcisi', 'venthub_order_items'),
        dogru('iade_istemci_kayit_bekcisi', 'venthub_returns'),
      ]
    }
    if (sql.includes('pg_trigger')) {
      const t = ['on_site_settings_satis_kipi_ins', 'on_site_settings_satis_kipi_upd', 'on_site_settings_satis_kipi_del'].map((tgname) => ({ tgname, tgenabled: 'O' }))
      return ayar.tetikEksik ? t.slice(0, 2) : t
    }
    return []
  }
  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://proje.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-anahtar',
      KIP_PROBE_EPOSTA: 'prob@ornek.test',
      KIP_PROBE_PAROLA: 'parola',
      RESEND_API_KEY: 're_ornekanahtar123',
      KIP_SITE_URL: 'https://site.test',
    },
    fetch: fetchSahte,
    dbSorgu: dbSahte,
    anahtarAcik: false,
    faturaBeyani: GECERLI_BEYAN,
    hedef: { acik: true, toplam: 31, hidePriceTrue: 0 },
    tutarliMi: () => ({ tutarli: true, beklenen: 'sahte' }),
    ...ctxEk,
  }
}

describe('INV-SATIS-KIPI-7: açılış önkoşulları (ölçülemedi = ret, boş alanla kırmızı)', () => {
  it('sabit kalem sayısı 11 (K1..K11); sessiz kalem silme kırmızı', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    expect(m.KALEMLER.map((k) => k.id)).toEqual(['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11'])
    // K1/K6 dışında hiçbir kalem muaf OLAMAZ (plan bulgu 4)
    expect(m.KALEMLER.filter((k) => k.muaf).map((k) => k.id)).toEqual(['K1', 'K6'])
    // Her kalemin sahibi ve kanıtı tabloda basılır: boş olamaz.
    for (const k of m.KALEMLER) {
      expect(k.sahip.length, `${k.id} sahip boş`).toBeGreaterThan(0)
      expect(k.kanit.length, `${k.id} kanıt boş`).toBeGreaterThan(0)
    }
  })

  it('pozitif kontrol: her şey geçer → izin var, hazırlık 1 kez çağrılır (kapı gerçekten açabiliyor)', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    let hazirlik = 0
    const k = await m.acilisKapisi(dunya(), { hazirlik: async () => void (hazirlik += 1) })
    expect(k.hukum.satirlar.map((s) => `${s.id}:${s.durum}`)).toEqual(['K1:GECTI', 'K2:GECTI', 'K3:GECTI', 'K4:GECTI', 'K5:GECTI', 'K6:GECTI', 'K7:GECTI', 'K8:GECTI', 'K9:GECTI', 'K10:GECTI', 'K11:GECTI'])
    expect(k.izin).toBe(true)
    expect(hazirlik).toBe(1)
  })

  const BOZMALAR: Array<[string, string, () => { ayar?: Ayar; ctx?: Partial<Ctx> }]> = [
    ['K1', 'ham [SATICI_UNVAN] yer tutucu', () => ({ ayar: { sayfaMetni: 'Satıcı: [SATICI_UNVAN]' } })],
    ['K1', 'görünüm metni (gizlenmiş yer tutucu)', () => ({ ayar: { sayfaMetni: 'Satıcı: Bilgi eklenecek' } })],
    ['K2', 'ödeme ortamı sandbox', () => ({ ayar: { healthz: { status: 200, govde: { durum: 'saglikli', config: { odeme_ortami: 'sandbox' } } } } })],
    ['K2', 'healthz 503 bozuk', () => ({ ayar: { healthz: { status: 503, govde: { durum: 'bozuk', config: { odeme_ortami: 'prod' } } } } })],
    ['K3', 'kapı canlıda YOK (409 boş sepet)', () => ({ ayar: { probe: { status: 409, govde: '{"error":"VALIDATION_EMPTY_CART"}' } } })],
    ['K4', 'RESTRICTIVE politika eksik (1/2)', () => ({ ayar: { politikaSayisi: 1 } })],
    ['K4', 'webhook tetiği eksik (2/3)', () => ({ ayar: { tetikEksik: true } })],
    ['K5', 'bekçi yanlış tabloda', () => ({ ayar: { bekciYanlisTablo: true } })],
    ['K6', 'Resend alan doğrulanmamış', () => ({ ayar: { resendDurum: 'pending' } })],
    ['K7', 'fatura beyanı yok', () => ({ ctx: { faturaBeyani: undefined } })],
    ['K9', 'son 30 günde hiç e-posta gönderim kaydı yok (üç tablo boş)', () => ({ ayar: { epostaKaydi: { siparis: 0, teklif: 0, kargo: 0 } } })],
    ['K10', 'ürün sayfasında Offer yok (teklif kipi)', () => ({ ayar: { urunJsonld: { '@type': 'Product', name: 'X', mpn: 'M' } } })],
    ['K11', 'yasal sayfa başlığı/H1 "(Taslak)" (legalReviewCompleted=false)', () => ({ ayar: { taslakBasligi: true } })],
    ['K8', 'hedef durum tutarsız (açık + 5 gizli)', () => ({ ctx: { hedef: { acik: true, toplam: 31, hidePriceTrue: 5 }, tutarliMi: (d: unknown) => {
      const x = d as { anahtar: { acik: boolean }; kategori: { hidePriceTrue: number } }
      return { tutarli: !x.anahtar.acik || x.kategori.hidePriceTrue === 0, beklenen: 'açık → 0' }
    } } })],
  ]

  it.each(BOZMALAR)('%s bozulunca (%s) izin YOK, hazırlık/yazma öncesi durur', async (id, _ad, boz) => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const { ayar, ctx } = boz()
    let hazirlik = 0
    const k = await m.acilisKapisi(dunya(ayar, ctx), { hazirlik: async () => void (hazirlik += 1) })
    expect(k.izin, `${id} bozuk ama izin verildi: kapı atlanıyor`).toBe(false)
    expect(k.asama).toBe('onkosul')
    expect(k.hukum.gecmeyen).toContain(id)
    expect(hazirlik, 'ret sonrası yedek/hazırlık çalıştı (yazma yolu açık kalmış)').toBe(0)
  })

  it('K9: tek bir tabloda bile kayıt yeterli (kargo tablosunda status kolonu yok); üçü de 0 iken RET', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const k9 = m.KALEMLER.find((k) => k.id === 'K9')!
    expect((await m.kalemiOlc(k9, dunya({ epostaKaydi: { siparis: 0, teklif: 0, kargo: 1 } }))).durum).toBe('GECTI')
    expect((await m.kalemiOlc(k9, dunya({ epostaKaydi: { siparis: 0, teklif: 0, kargo: 0 } }))).durum).toBe('KALDI')
    // sayı okunamazsa ölçülemedi (ret): boş dizi / sayı olmayan alan yeşil vermez
    const bozuk = dunya({}, { dbSorgu: async () => [] })
    expect((await m.kalemiOlc(k9, bozuk)).durum).toBe('OLCULEMEDI')
    // ölçüt kaynağa bağlı: üç tablo adı ve `sent` + provider_message_id sorgusu betikte durur
    const kaynak = oku('scripts/kip/acilis-onkosullari.mjs')
    for (const t of ['order_email_events', 'quote_email_events', 'shipping_email_events']) expect(kaynak, `${t} sorgudan çıkmış`).toContain(t)
    expect(kaynak).toMatch(/status = 'sent' and provider_message_id is not null/)
  })

  it('K10: Merchant ölçütü — tam JSON-LD geçer; fiyatsız/iadesiz/gönderimsiz/kimliksiz Offer geçmez; `sku` ARANMAZ (REC-146)', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const d = m.urunSayfasiDegerlendir
    expect(d([TAM_URUN_JSONLD]).gecti).toBe(true)
    const offer = TAM_URUN_JSONLD.hasVariant[0].offers
    const varyant = (o: Record<string, unknown>, ek: Record<string, unknown> = {}) => ({ '@type': 'Product', mpn: 'M', ...ek, offers: { ...offer, ...o } })
    // her eksik ayrı ayrı KALDI
    expect(d([varyant({ price: '0' })]).gecti, 'fiyat 0 geçti').toBe(false)
    expect(d([varyant({ priceCurrency: undefined })]).gecti, 'para birimi yok geçti').toBe(false)
    expect(d([varyant({ hasMerchantReturnPolicy: undefined })]).eksik).toContain('iade politikası yok')
    expect(d([varyant({ shippingDetails: undefined })]).eksik).toContain('gönderim verisi yok')
    expect(d([varyant({}, { mpn: undefined })]).eksik).toContain('mpn/gtin yok')
    expect(d([{ '@type': 'Product', name: 'X', mpn: 'M' }]).eksik[0]).toMatch(/Offer yok/)
    // gtin mpn'nin yerini tutar; sku YOKLUĞU hata değil (bilinçli yayınlanmıyor)
    expect(d([varyant({}, { mpn: undefined, gtin13: '8690000000001' })]).gecti).toBe(true)
    expect(JSON.stringify(TAM_URUN_JSONLD)).not.toContain('"sku"')
    // boş girdi yeşil vermez
    expect(d([]).gecti).toBe(false)
  })

  it('K10/K11 ölçülemedi = ret: site haritası 404, ürün sayfasında JSON-LD yok, yasal sayfada <h1> yok', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const k10 = m.KALEMLER.find((k) => k.id === 'K10')!
    const k11 = m.KALEMLER.find((k) => k.id === 'K11')!
    const yanit = (status: number, govde: string) => new Response(govde, { status })
    const haritaYok = dunya({}, { fetch: async () => yanit(404, '{}') })
    expect((await m.kalemiOlc(k10, haritaYok)).durum).toBe('OLCULEMEDI')
    const ldYok = dunya({}, { fetch: async (u) => (u.endsWith('/sitemap.xml') ? yanit(200, '<loc>https://site.test/tr/products/a</loc>') : yanit(200, '<html></html>')) })
    expect((await m.kalemiOlc(k10, ldYok)).durum).toBe('OLCULEMEDI')
    const h1Yok = dunya({}, { fetch: async () => yanit(200, '<html><head><title>x</title></head><body></body></html>') })
    expect((await m.kalemiOlc(k11, h1Yok)).durum).toBe('OLCULEMEDI')
    // taslak bandı tek başına da KALDI verir (başlık temiz olsa bile)
    const bant = dunya({}, { fetch: async () => yanit(200, '<html><head><title>a</title></head><body><h1>a</h1><div>Bu metin taslaktır ve test amaçlıdır.</div></body></html>') })
    expect((await m.kalemiOlc(k11, bant)).durum).toBe('KALDI')
  })

  it('ÖLÇÜLEMEDİ = RET: DB yok, Resend anahtarı yok, probe kimliği yok → K3/K4/K5/K6/K9 ölçülemedi, izin yok', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const ctx = dunya({}, { dbSorgu: null })
    delete ctx.env.RESEND_API_KEY
    delete ctx.env.KIP_PROBE_PAROLA
    const s = await m.onkosulOlc(ctx)
    const durum = Object.fromEntries(s.map((x) => [x.id, x.durum]))
    expect(durum).toMatchObject({ K3: 'OLCULEMEDI', K4: 'OLCULEMEDI', K5: 'OLCULEMEDI', K6: 'OLCULEMEDI', K9: 'OLCULEMEDI' })
    expect(m.degerlendir(s).acilabilir).toBe(false)
  })

  it('K2 gerçek gövdeler: 401 JSON-dışı gövde = ölçülemedi; 200 prod = geçti', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const k2 = m.KALEMLER.find((k) => k.id === 'K2')!
    const yetkisiz = await m.kalemiOlc(k2, dunya({ healthz: { status: 401, govde: 'Invalid JWT' } }))
    expect(yetkisiz.durum).toBe('OLCULEMEDI')
    const tamam = await m.kalemiOlc(k2, dunya())
    expect(tamam.durum).toBe('GECTI')
    expect(tamam.ayrinti, 'K2 sınırı ayrıntıda yazılı değil: "prod" anahtar geçerliliğini kanıtlamaz').toContain('geçerliliğini kanıtlamaz')
  })

  it('K3: anahtar zaten AÇIKsa (onarım) probe uygulanmaz; kimlik yoksa ölçülemedi', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const k3 = m.KALEMLER.find((k) => k.id === 'K3')!
    expect((await m.kalemiOlc(k3, dunya({ probe: { status: 409, govde: 'VALIDATION_EMPTY_CART' } }, { anahtarAcik: true }))).durum).toBe('GECTI')
    const kimliksiz = dunya()
    delete kimliksiz.env.KIP_PROBE_EPOSTA
    expect((await m.kalemiOlc(k3, kimliksiz)).durum).toBe('OLCULEMEDI')
    // beklenmeyen cevap (ör. 500) KALDI/GEÇTİ değil ÖLÇÜLEMEDİ: yanlış-yeşil üretmez
    expect((await m.kalemiOlc(k3, dunya({ probe: { status: 500, govde: 'hata' } }))).durum).toBe('OLCULEMEDI')
  })

  it('K7 beyan kalıbı: geçerli geçer; boş / kısa / kalıba uymayan / genel yöntem RET', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    expect(m.faturaBeyaniDegerlendir(GECERLI_BEYAN).gecti).toBe(true)
    expect(m.faturaBeyaniDegerlendir('').gecti).toBe(false)
    expect(m.faturaBeyaniDegerlendir(undefined).gecti).toBe(false)
    expect(m.faturaBeyaniDegerlendir('fatura sonra bakılacak').gecti).toBe(false)
    expect(m.faturaBeyaniDegerlendir('Recep: ok, fatura konusu tamam, 2026-09-30').gecti, 'kalıba uymayan uzun metin geçti').toBe(false)
    expect(m.faturaBeyaniDegerlendir('e-arşiv faturaları ileride ile kesilecek (mali müşavir teyitli)').gecti, 'genel yöntem geçti').toBe(false)
  })

  it('muafiyet: yalnız K1/K6, gerekçeli (≥20 karakter); K2..K5/K7/K8 muaf OLAMAZ', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const yer = await m.onkosulOlc(dunya({ sayfaMetni: '[SATICI_UNVAN]' }))
    expect(m.degerlendir(yer).acilabilir).toBe(false)
    expect(m.degerlendir(yer, { muaf: { K1: UZUN_GEREKCE } }).acilabilir, 'gerekçeli K1 muafiyeti geçmeli').toBe(true)
    expect(m.degerlendir(yer, { muaf: { K1: 'kısa' } }).acilabilir, 'kısa gerekçe muafiyet açtı').toBe(false)
    const sandbox = await m.onkosulOlc(dunya({ healthz: { status: 200, govde: { durum: 'saglikli', config: { odeme_ortami: 'sandbox' } } } }))
    expect(m.degerlendir(sandbox, { muaf: { K2: UZUN_GEREKCE } }).acilabilir, 'K2 muaf edilebildi: ödeme ortamı atlanır').toBe(false)
    const fatura = await m.onkosulOlc(dunya({}, { faturaBeyani: undefined }))
    expect(m.degerlendir(fatura, { muaf: { K7: UZUN_GEREKCE } }).acilabilir, 'K7 muaf edilebildi').toBe(false)
  })

  it('ölçücü fırlatır / geçersiz sonuç döner / hiç ölçücüsü yok → RET (asla fırlatmaz, asla geçmez)', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const temel = { sahip: 'test', kanit: 'test', muaf: false }
    const kalemler: Kalem[] = [
      { id: 'A', ad: 'fırlatan', ...temel, olc: async () => { throw new Error('postgres://kullanici:sifre@host/db bağlanamadı') } },
      { id: 'B', ad: 'undefined dönen', ...temel, olc: async () => undefined },
      { id: 'C', ad: 'ölçücüsüz', ...temel },
    ]
    const s = await m.onkosulOlc(dunya(), { kalemler })
    expect(s.map((x) => x.durum)).toEqual(['OLCULEMEDI', 'OLCULEMEDI', 'OLCUT_YOK'])
    expect(s[0].ayrinti, 'bağlantı dizesi (parola) çıktıya sızdı').not.toContain('sifre')
    expect(m.degerlendir(s, { kalemler }).acilabilir).toBe(false)
  })

  it('boş-koşum koruması: boş sonuç, eksik id, fazla id → RET ([].every() "hepsi geçti" DEMEZ)', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    expect(m.degerlendir([]).acilabilir).toBe(false)
    const tam = await m.onkosulOlc(dunya())
    expect(m.degerlendir(tam).acilabilir).toBe(true)
    expect(m.degerlendir(tam.slice(1)).acilabilir, 'K1 sessizce silindi ve kapı yine açıldı').toBe(false)
    expect(m.degerlendir([...tam, { ...tam[0], id: 'K99' }]).acilabilir).toBe(false)
  })

  it('TOCTOU: ilk ölçüm geçer, yazımdan hemen önceki YENİDEN ölçümde K5 düşer → izin YOK', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const bekciSorgulari = { sayac: 0, ikinciDefaDus: true }
    let hazirlik = 0
    const k = await m.acilisKapisi(dunya({ bekciSorgulari }), { hazirlik: async () => void (hazirlik += 1) })
    expect(hazirlik, 'hazırlık (taze ölçüm+yedek) çalışmalıydı').toBe(1)
    expect(k.izin, 'yeniden ölçümde düşen kalem yazmayı durdurmadı').toBe(false)
    expect(k.asama).toBe('yeniden-olcum')
    expect(k.hukum.gecmeyen).toEqual(['K5'])
    expect(m.YENIDEN_OLCULEN).toEqual(['K2', 'K4', 'K5'])
  })

  it('suz(): bağlantı dizesi, JWT, Bearer ve anahtar biçimleri çıktıya geçmez; en çok 120 karakter', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop'
    const ham = `postgres://u:p@h/db ${jwt} Bearer gizlijeton re_abcdefghij123 ${'x'.repeat(300)}`
    const sonuc = m.suz(ham)
    for (const sizinti of ['postgres://', 'eyJhbGci', 'gizlijeton', 're_abcdefghij123']) expect(sonuc).not.toContain(sizinti)
    expect(sonuc.length).toBeLessThanOrEqual(120)
  })

  it('env izin listesi: service-role anahtarı ölçücülere GEÇMEZ', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    expect(m.IZINLI_ENV).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(m.IZINLI_ENV).toEqual(expect.arrayContaining(['SUPABASE_DB_URL', 'RESEND_API_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']))
  })

  it('K1 sabitleri kaynağa BAĞLI: görünüm metinleri legal.ts ile aynı; 6 yasal slug routes.ts ile aynı', async () => {
    const m = await yukle<Modul>('scripts/kip/acilis-onkosullari.mjs')
    const legal = oku('src/config/legal.ts')
    for (const metin of m.GORUNUM_METINLERI) expect(legal, `legal.ts görünüm metni "${metin}" yok: K1 yanlış-yeşil verir`).toContain(metin)
    const routes = oku('src/utils/routes.ts')
    const slugs = [...routes.matchAll(/=> '\/legal\/([a-z-]+)'/g)].map((x) => x[1]).sort()
    expect([...m.YASAL_SAYFA_SLUGLARI].sort(), 'yeni yasal sayfa eklendi ama K1 taramıyor').toEqual(slugs)
  })

  it('betik SIRASI (yapısal): önkoşul kapısı yazmadan ÖNCE, ret = çıkış 1, kapatma önkoşulsuz, geri-al açık hedef kapıdan geçer', () => {
    const b = oku('scripts/kip/satis-kipine-gec.mjs')
    expect(b, 'betik acilisKapisi kullanmıyor').toContain('acilisKapisi')
    const kapi = b.indexOf("if (YON === 'ac') {")
    const cikis = b.indexOf('if (UYGULA && !onkosulSonuc.izin)')
    const yazma = b.indexOf('await kategorileriYaz(sb')
    const anahtar = b.indexOf("await anahtariYaz(sb, once, true, ONAY, 'yon:ac'")
    expect(kapi, 'AÇ dalı önkoşulu koşmuyor').toBeGreaterThan(0)
    expect(cikis, 'ret durumunda çıkış satırı yok').toBeGreaterThan(kapi)
    expect(b.slice(cikis, cikis + 400), 'ret sonrası process.exit(1) yok: canlıya yazma sürer').toContain('process.exit(1)')
    expect(yazma, 'kategori yazımı önkoşul kapısından ÖNCE').toBeGreaterThan(cikis)
    expect(anahtar, 'anahtar yazımı önkoşul kapısından ÖNCE').toBeGreaterThan(cikis)
    // KAPATMA önkoşula tabi olmamalı: kapı yalnız YON === 'ac' dalında.
    expect(b.slice(kapi - 200, kapi), 'kapı kapatmaya da uygulanıyor').not.toContain("'kapat'")
    expect(b, '--onkosul salt okuma modu yok').toMatch(/if \(ONKOSUL\)/)
    expect(b, 'hedefi açık geri-al önkoşuldan geçmiyor').toMatch(/hedefAcik && !once\.anahtar\.acik/)
    expect(b, 'genel atlama bayrağı eklenmiş (yalnız K1/K6 muafiyeti izinli)').not.toMatch(/--onkosul-atla|--atla|--zorla|--force/)
  })

  it('betik gerçek çağrı: --onkosul ve --muaf gerekçesiz argümanı DB/ağ öncesi reddedilir', async () => {
    const { execFileSync } = await import('node:child_process')
    let cikis = 0
    let hata = ''
    try {
      execFileSync(process.execPath, [path.join(KOK, 'scripts', 'kip', 'satis-kipine-gec.mjs'), '--yon', 'ac', '--muaf', 'K1'], {
        cwd: KOK,
        env: { ...process.env, VENTHUB_ENV_PATH: path.join(KOK, 'boyle-bir-dosya-yok.env') },
        stdio: 'pipe',
      })
    } catch (e) {
      cikis = Number((e as { status?: number }).status ?? 0)
      hata = String((e as { stderr?: Buffer }).stderr ?? '')
    }
    expect(cikis, '--muaf gerekçesiz kabul edildi').not.toBe(0)
    expect(hata).toContain('--muaf-gerekce')
  })

  it('cetvel: §8.1 açılış önkoşulları + INV-SATIS-KIPI-7 yazılı, K7 cümlesi olduğu gibi', () => {
    const cetvel = oku('docs/standards/satis-kipi-gecis-standard.md')
    expect(cetvel).toMatch(/### 8\.1 Açılış önkoşulları/)
    expect(cetvel).toContain('INV-SATIS-KIPI-7')
    expect(cetvel, 'K7 cümlesi (beyan faturasız satış izni DEĞİL) cetvelde yok').toContain('faturasız satışa izin DEĞİLDİR')
  })

  it('betik gerçek tutarliMi ile K8 sözleşmesi uyumlu (mevcut INV-SATIS-KIPI-5 imzası bozulmadı)', async () => {
    const betik = await yukle<Betik>('scripts/kip/satis-kipine-gec.mjs')
    expect(betik.tutarliMi({ anahtar: { acik: true }, kategori: { toplam: 31, hidePriceTrue: 0 } }).tutarli).toBe(true)
    expect(betik.tutarliMi({ anahtar: { acik: true }, kategori: { toplam: 31, hidePriceTrue: 5 } }).tutarli).toBe(false)
  })
})
