import { SITE_URL } from './siteUrl'

/**
 * Hukuki metinlerin TEK doldurma noktası.
 *
 * Kural: şirket kimliğine dair her değer YALNIZ burada durur; hukuki metin bileşenleri
 * (`src/views/legal/components/{tr,en}/*`) bu nesneden okur, kendi içlerinde sabit
 * şirket bilgisi TAŞIMAZ. Böylece Recep bilgileri verdiğinde tek dosya doldurulur ve
 * 6 sayfa × 2 dil = 12 metin aynı anda doğru hâle gelir.
 *
 * Doldurulmamış alan konvansiyonu: `'[BUYUK_HARF_SNAKE]'`. Köşeli parantez kasıtlıdır —
 * ziyaretçi eksik bilgiyi ANINDA görür ve `hasUnfilledLegalPlaceholders()` bunu programatik
 * yakalayabilir. Gerçekmiş gibi duran sahte değer (ör. `destek@ornek.com`) KOYMA: tüketici
 * ona e-posta atar, telefonu arar; sessiz hata en kötüsüdür.
 */

/** Şirket kimliğine dair, Recep tarafından doldurulacak metin alanları. */
export interface LegalSellerInfo {
  /** Ticaret unvanı (ör. "Örnek Havalandırma Sanayi ve Ticaret A.Ş.") */
  sellerTitle: string
  /** Merkez adresi — açık adres, il/ilçe dahil */
  sellerAddress: string
  sellerEmail: string
  sellerPhone: string
  /** KEP (Kayıtlı Elektronik Posta) adresi — tacir için tebligata esas */
  kepAddress: string
  taxOffice: string
  taxNumber: string
  /** MERSİS numarası (16 hane) */
  mersis: string
  /** Ticaret sicil numarası */
  tradeRegistryNo: string
  /** Kayıtlı olduğu ticaret/sanayi odası */
  chamberOfCommerce: string
  /** ETBİS (Elektronik Ticaret Bilgi Sistemi) kayıt/doğrulama numarası */
  etbisNo: string
  /** İYS (İleti Yönetim Sistemi) marka kodu — ticari elektronik ileti için */
  iysBrandCode: string
  /** VERBİS (Veri Sorumluları Sicili) kayıt numarası; kapsam dışıysa gerekçesi yazılır */
  verbisNo: string
  websiteUrl: string
  deliveryTime: string
  shippingFee: string
  returnAddress: string
  /** Anlaşmalı kargo firma(ları) — cayma halinde iadenin gönderileceği taşıyıcı */
  cargoCompanies: string
  /**
   * Cayma hâlinde iade kargo masrafını kimin üstlendiği.
   * MSY m.12/1: anlaşmalı kargo ön bilgilendirmede BELİRTİLMİŞSE masraf tüketiciye
   * yüklenebilir; belirtilmemişse veya o taşıyıcıyla gönderilmişse SATICI öder.
   */
  returnShippingBearer: string
  refundTime: string
  /** Garanti süresi (asgari 2 yıl; ürün grubuna göre uzayabilir) */
  warrantyPeriod: string
  /** Satış Sonrası Hizmetler Yönetmeliği'ne göre ilan edilen kullanım ömrü */
  usefulLife: string
  /** Yetkili servis / satış sonrası hizmet iletişim bilgisi */
  afterSalesService: string
  /**
   * Faturanın düzenlenip tüketiciye iletileceği azami süre.
   *
   * ÜST SINIR KANUNDAN GELİR: VUK m.231/5 uyarınca fatura, malın teslim edildiği tarihten
   * itibaren azami **yedi gün** içinde düzenlenir. Bu alana yedi günden UZUN bir süre
   * yazılamaz; kısaltmak serbesttir ve manuel kesim ritmi elverdiğinde kısaltılmalıdır.
   *
   * Bu alan sözleşme metnine doğrudan render edilir — metne gömülü sabit süre YAZMA
   * (INV-LEGAL-3 kural 4). Köprü prosedürü: `docs/standards/legal-compliance-standard.md` §2.3.
   */
  invoiceDeliveryTime: string
  retentionOrders: string
  retentionSupport: string
  retentionMarketing: string
  retentionLogs: string
  /** KVKK başvurularının iletileceği e-posta */
  applicationEmail: string
  /** Metinlerin yürürlük/güncelleme tarihi — SABİT tutulur, hesaplanmaz */
  lastUpdated: string
}

export interface LegalConfig extends LegalSellerInfo {
  /**
   * Metinler bir hukukçu tarafından teyit edildi mi?
   * `false` olduğu sürece hukuki sayfalarda taslak uyarı bandı gösterilir —
   * alanların doldurulmuş olması tek başına yeterli DEĞİLDİR.
   */
  legalReviewCompleted: boolean
}

const legalConfig: LegalConfig = {
  // ── Şirket kimliği (BOŞ — Recep dolduracak) ──────────────────────────────
  sellerTitle: '[SATICI_UNVAN]',
  sellerAddress: '[SATICI_ADRES]',
  sellerEmail: '[SATICI_EPOSTA]',
  sellerPhone: '[SATICI_TELEFON]',
  kepAddress: '[KEP_ADRESI]',
  taxOffice: '[VERGI_DAIRESI]',
  taxNumber: '[VERGI_NO]',
  mersis: '[MERSIS_NO]',
  tradeRegistryNo: '[TICARET_SICIL_NO]',
  chamberOfCommerce: '[TICARET_ODASI]',
  etbisNo: '[ETBIS_NO]',
  iysBrandCode: '[IYS_MARKA_KODU]',
  verbisNo: '[VERBIS_NO]',

  // ── Ticari koşullar (BOŞ — Recep dolduracak) ─────────────────────────────
  returnAddress: '[IADE_ADRESI]',
  cargoCompanies: '[ANLASMALI_KARGO_FIRMALARI]',
  returnShippingBearer: '[IADE_KARGO_MASRAFI_KIME_AIT]',
  afterSalesService: '[YETKILI_SERVIS_ILETISIM]',

  // ── Süre/politika varsayılanları (mevzuatın asgarisi; gerekirse güncellenir) ──
  websiteUrl: SITE_URL.replace(/^https?:\/\//, ''),
  deliveryTime: '1-5 iş günü',
  shippingFee: 'Sipariş özetinde gösterilir',
  refundTime: '14 gün',
  // Kanuni azami süre (VUK m.231/5). Köprü döneminde manuel kesim bu pencereye sığar;
  // otomasyon açıldığında kısaltılabilir. Recep daha kısa bir süre taahhüt etmek isterse
  // yalnız bu değer değişir — sözleşme metni bu alandan okur.
  invoiceDeliveryTime: '7 gün',
  warrantyPeriod: '2 yıl',
  usefulLife: '10 yıl',
  retentionOrders: '10 yıl',
  retentionSupport: '3 yıl',
  retentionMarketing: '2 yıl',
  retentionLogs: '2 yıl',
  applicationEmail: '[KVKK_BASVURU_EPOSTA]',

  // ── Yürürlük ──────────────────────────────────────────────────────────────
  // SABİT tarih. `new Date()` KULLANMA: her gün değişen bir "yürürlük tarihi"
  // hukuken anlamsızdır ve RSC'de sunucu/istemci arasında tutarsızlık üretir.
  lastUpdated: '2026-08-15',

  legalReviewCompleted: false,
}

/**
 * İngilizce metinler için süre/politika ifadelerinin çevirisi.
 *
 * NİÇİN VAR: yukarıdaki değerler Türkçe cümle parçalarıdır ("14 gün", "1-5 iş günü",
 * "Sipariş özetinde gösterilir") ve İngilizce hukuki sayfalarda **doğrudan** render
 * ediliyordu — 2026-08-16'da ölçüldü: 6 dosyada 18 render noktası, hepsi Türkçe basıyordu.
 * Bunlar pazarlama metni değil sözleşme hükmüdür; İngilizce sözleşmede Türkçe süre
 * yazması, o hükmü İngilizce okuyan taraf için belirsiz kılar.
 *
 * KAPSAM: yalnız **çevrilebilir** alanlar. Özel isimler (unvan, adres, kargo firması,
 * vergi dairesi, MERSİS/ETBİS numaraları) çevrilmez — onlar her iki dilde de aynıdır ve
 * bilerek dışarıda bırakılmıştır. Recep'in dolduracağı serbest metin alanları
 * (`returnShippingBearer`, `afterSalesService`) doldurulduğunda Türkçe olacaktır;
 * İngilizce karşılıkları o gün buraya eklenir (INV-LEGAL-3 kural 5 bunu hatırlatır).
 */
const EN_OVERRIDES: Partial<LegalConfig> = {
  deliveryTime: '1-5 business days',
  shippingFee: 'Shown in the order summary',
  refundTime: '14 days',
  invoiceDeliveryTime: '7 days',
  warrantyPeriod: '2 years',
  usefulLife: '10 years',
  retentionOrders: '10 years',
  retentionSupport: '3 years',
  retentionMarketing: '2 years',
  retentionLogs: '2 years',
}

/**
 * İngilizce hukuki metinlerin okuduğu konfigürasyon.
 * `src/views/legal/components/en/*` bunu `legalConfig` adıyla import eder; böylece
 * 18 render noktasının hiçbiri değişmeden doğru dilde basar.
 */
export const legalConfigEn: LegalConfig = { ...legalConfig, ...EN_OVERRIDES }

/** Doldurulmamış alan deseni: tamamı köşeli parantez içinde olan değer. */
const PLACEHOLDER_PATTERN = /^\[[A-Z0-9_]+\]$/

/** Henüz doldurulmamış alanların adlarını döndürür (boşsa metinler veri olarak hazırdır). */
export function unfilledLegalFields(config: LegalConfig = legalConfig): string[] {
  return Object.entries(config)
    .filter(([, value]) => typeof value === 'string' && PLACEHOLDER_PATTERN.test(value))
    .map(([key]) => key)
}

/** Şirket bilgilerinden en az biri hâlâ placeholder mı? */
export function hasUnfilledLegalPlaceholders(config: LegalConfig = legalConfig): boolean {
  return unfilledLegalFields(config).length > 0
}

/**
 * Hukuki metinler yayına hazır mı?
 * İKİ koşul birden: (1) tüm alanlar doldurulmuş, (2) hukukçu teyidi alınmış.
 * Sayfalardaki taslak uyarı bandı bu değere bağlıdır.
 */
export function isLegalContentReady(config: LegalConfig = legalConfig): boolean {
  return config.legalReviewCompleted && !hasUnfilledLegalPlaceholders(config)
}

export default legalConfig
