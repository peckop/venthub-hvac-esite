import { describe, expect, it } from 'vitest'

import { tr } from '../../i18n/dictionaries/tr'

/**
 * INV-6 · i18n ÖLÜ ANAHTAR conformance (kalıcı bekçi).
 *
 * INV-5 (`i18n-key-resolution.test.ts`) **ÇAĞRI → SÖZLÜK** yönünü tarar: her statik
 * `t('a.b.c')` sözlükte çözülmeli. Bu bekçi **TERS YÖNÜ** tarar: sözlükteki her yaprak
 * anahtarın kaynakta bir tüketicisi olmalı.
 *
 * NİÇİN AYRI BİR EKSEN: ham-anahtar render **görünür** bir bug'dır (ekranda `pdp.specs.x`
 * yazar); ölü anahtar **görünmez**. Görünmeyen sınıf bugüne kadar kapı almamış ve birikmişti:
 * 2026-08-23 denetiminde (`docs/audits/i18n-sozluk-render-denetimi-2026-08-23.md`)
 * 7 tam ölü ad-alanı + 168 tekil anahtar ölçüldü ve kaldırıldı. Bu kapı, sınıfın tekrar
 * doğmasını engeller.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * KAPININ EN KRİTİK KURALI — NOKTASIZ ŞABLON
 *
 * Dinamik anahtar önekini AYRAÇLA eşlemek kör nokta yaratır. Kodda iki yer anahtarı
 * **ayraçsız** birleştiriyor:
 *
 *   t(`pdp.actions.download${type === 'productCatalog' ? 'Catalog' : 'Brochure'}`)
 *   t(`calculators.airCurtain.results.efficiency${...}`)   // ve ...${...}Desc
 *
 * Üretilen anahtarlar `pdp.actions.downloadCatalog`, `...efficiencyOptimal` — hiçbiri
 * `önek.` ile başlamaz. Denetimde bu 10 anahtar "ölü" listesine düşmüştü; silinselerdi
 * indirme düğmesinin etiketi ve hava perdesi verimlilik metni bozulacak ve HİÇBİR KAPI
 * görmeyecekti (sözlükten anahtar eksilince tsc/lint/parite susar).
 *
 * Bu yüzden önek eşlemesi AYRAÇSIZ yapılır ve o 10 anahtar **KANARYA** olarak tutulur:
 * kapı onları "ölü" görürse sözlük değil **KAPININ KENDİSİ KÖR** demektir.
 * ─────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Sözlük dosyaları TANIMDIR, kullanım değil. Testler de sayılmaz (fikstür taşırlar). */
const isDictFile = (p: string) => p.includes('/i18n/dictionaries/')
const isTestFile = (p: string) => p.includes('__tests__') || p.includes('.test.')

/**
 * Yorumlanmış örnek kodun bekçiyi yanıltmaması için yorumlar silinir.
 *
 * Blok yorum SATIR SAYISI KORUNARAK silinir: `/* ... *\/` içindeki satır sonları geri
 * konmazsa numaralar kayar ve bekçinin bildirdiği `dosya:satir` YANLIŞ yeri gösterir
 * (ölçüldü: rapor edilen satırlar yorum gövdelerine düşüyordu). Yanlış konum bildiren
 * bir bekçi, bulguyu doğrulamaya çalışan kişiyi yanlış yere gönderir.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

function leafKeys(obj: unknown, prefix = '', acc: string[] = []): string[] {
  if (obj === null || typeof obj !== 'object') return acc
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') acc.push(path)
    else if (v && typeof v === 'object') leafKeys(v, path, acc)
  }
  return acc
}

// `t('a.b')` / `_t("a")` — tek segment de sayılır (üst-anahtar erişimi).
const T_STATIC = /(?<![\w$])_?t\(\s*(['"])([A-Za-z][\w]*(?:\.[\w]+)*)\1/g
// `` t(`a.b.${x}`) `` — şablonun SABİT önü.
const T_TEMPLATE = /(?<![\w$])_?t\(\s*`([A-Za-z][\w.]*?)\$\{/g
// `` `a.b.${x}` `` — `t()` dışında kurulan anahtar (ör. specLabel.ts).
const ANY_TEMPLATE = /`([a-z][\w]*(?:\.[\w]+)+?)\$\{/g
// `'a.b.' + x` — birleştirme.
const T_CONCAT = /(['"])([A-Za-z][\w]*(?:\.[\w]+)*\.)\1\s*\+/g
// `dict.a.b` / `dictionary.a.b` — `t()` ATLANARAK doğrudan obje erişimi.
const DICT_ACCESS = /(?<![\w$])(?:dict|dictionary)\.((?:[A-Za-z_]\w*)(?:\.[A-Za-z_]\w*)*)/g
// Anahtar VERİ olarak: `labelKey: 'admin.menu.orders'`.
const BARE_KEY = /(['"])([A-Za-z][\w]*(?:\.[\w]+)+)\1/g
// Tamamen dinamik: `t(degisken)` — anahtar statik olarak İZLENEMEZ (bkz. ÖN KOŞUL testi).
const T_OPAQUE = /(?<![\w$])_?t\(\s*[A-Za-z_$][\w$.]*\s*[,)]/g
/**
 * Alt ağacın YAPRAK ADIYLA indekslenmesi — 7. eksen.
 *
 * `whatsapp.ts` sözlüğün `whatsappMessages` alt ağacını cast ile alıp `table['stockInquiry']`
 * diye indeksliyor: TAM YOL kaynakta HİÇ geçmiyor. Yalnız tam yola bakan bir bekçi bu 12
 * anahtarı ölü sanar. Bu yüzden çıplak tırnaklı sözcükler de toplanır ve bir yaprağın SON
 * segmenti onlarda geçiyorsa yaprak canlı sayılır.
 *
 * Bilerek GEVŞEK: yanlış-yeşil (birkaç ölü anahtarı kaçırmak) yanlış-kırmızıdan iyidir —
 * yanlış kırmızı veren kapı kapatılır, kaçıran kapı bir sonraki denetimde yakalanır.
 */
const BARE_WORD = /(['"])([A-Za-z][\w]*)\1/g

interface Tarama {
  staticKeys: Set<string>
  prefixes: string[]
  dictPaths: string[]
  bareWords: Set<string>
  opaque: { file: string; line: number }[]
  tarananDosya: number
  eslesmeSayisi: number
}

function tara(): Tarama {
  const staticKeys = new Set<string>()
  const prefixes: string[] = []
  const dictPaths: string[] = []
  const bareWords = new Set<string>()
  const opaque: { file: string; line: number }[] = []
  let tarananDosya = 0
  let eslesmeSayisi = 0

  for (const [path, raw] of Object.entries(SOURCES)) {
    if (isDictFile(path) || isTestFile(path)) continue
    tarananDosya++
    const src = stripComments(raw)
    src.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(T_STATIC)) {
        staticKeys.add(m[2])
        eslesmeSayisi++
      }
      for (const m of line.matchAll(T_TEMPLATE)) {
        prefixes.push(m[1].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(ANY_TEMPLATE)) {
        prefixes.push(m[1].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(T_CONCAT)) {
        prefixes.push(m[2].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(DICT_ACCESS)) {
        dictPaths.push(m[1])
        eslesmeSayisi++
      }
      for (const m of line.matchAll(BARE_KEY)) {
        staticKeys.add(m[2])
        eslesmeSayisi++
      }
      for (const m of line.matchAll(BARE_WORD)) {
        bareWords.add(m[2])
      }
      for (const _m of line.matchAll(T_OPAQUE)) {
        opaque.push({ file: path.replace(/^\//, ''), line: i + 1 })
      }
    })
  }

  return { staticKeys, prefixes, dictPaths, bareWords, opaque, tarananDosya, eslesmeSayisi }
}

/**
 * Bir yaprağın tüketicisi var mı?
 *
 * `prefix` eşlemesi **AYRAÇSIZ** (`startsWith(p)`) — bkz. dosya başındaki NOKTASIZ ŞABLON
 * açıklaması. Ayraç şartı koyulursa `pdp.actions.downloadCatalog` görünmez olur.
 */
function canli(key: string, t: Tarama): boolean {
  if (t.staticKeys.has(key)) return true
  // atası statik çağrılmışsa alt ağaç tüketiliyordur
  for (const s of t.staticKeys) if (key.startsWith(s + '.')) return true
  // şablon öneki — AYRAÇSIZ
  for (const p of t.prefixes) if (key.startsWith(p)) return true
  // `dict.a.b` görüldüyse o alt ağaç (ve o yola giden üst yollar) tüketiliyordur
  for (const d of t.dictPaths) if (key === d || key.startsWith(d + '.') || d.startsWith(key + '.')) return true
  // 7. eksen: alt ağaç yaprak adıyla indeksleniyor olabilir (whatsapp.ts deseni)
  const son = key.slice(key.lastIndexOf('.') + 1)
  if (t.bareWords.has(son)) return true
  return false
}

/**
 * DONDURULMUŞ BORÇ — 2026-08-23'te ÖLÇÜLEN, henüz kaldırılmamış anahtarlar.
 *
 * Bunlar "yanlış pozitif" DEĞİL: körlemesine seçilen 12 örneğin 12'sinde de ne tam yol ne
 * yaprak literali kaynakta geçiyor (ölçüldü). Denetim raporunda bu küme, zayıf bir
 * "ad-alanı teması" ekseniyle aklandığı için EKSİK bildirilmişti; bekçi düzgün ölçünce
 * ortaya çıktı.
 *
 * Liste yalnız KÜÇÜLEBİLİR: bir anahtar kaldırıldığında ya da tüketicisi yazıldığında
 * buradan da silinmek ZORUNDA (aşağıdaki "borç listesi bayatlamaz" testi bunu zorlar).
 * Böylece kayıt gerçeği yansıtır; sessizce şişemez.
 *
 * Dağılım: admin 200 · pdp 61 · common 47 · category 39 · account 29 · products 21 · diğer 34
 */
const DONMUS_BORC: ReadonlySet<string> = new Set([
  'account.addresses.addressLabel',
  'account.addresses.defaultBillingTag',
  'account.addresses.defaultShippingTag',
  'account.addresses.makeDefaultBilling',
  'account.addresses.makeDefaultShipping',
  'account.addresses.noItems',
  'account.addresses.ph.address',
  'account.addresses.ph.district',
  'account.addresses.ph.fullName',
  'account.addresses.ph.postalCode',
  'account.invoices.addNew',
  'account.invoices.companyLabel',
  'account.invoices.confirmDelete',
  'account.invoices.deleted',
  'account.invoices.eInvoice',
  'account.invoices.noProfiles',
  'account.invoices.save',
  'account.invoices.setDefaultSuccess',
  'account.invoices.tcknLabel',
  'account.invoices.titleLabel',
  'account.invoices.updated',
  'account.invoices.vknLabel',
  'account.overview.billingAddress',
  'account.overview.defaultAddressesTitle',
  'account.overview.manageAddresses',
  'account.overview.notSetBilling',
  'account.overview.notSetShipping',
  'account.overview.shippingAddress',
  'account.security.minLength',
  'admin.a11y.closeNavigation',
  'admin.a11y.collapse',
  'admin.a11y.copy',
  'admin.a11y.download',
  'admin.a11y.edit',
  'admin.a11y.expand',
  'admin.a11y.import',
  'admin.a11y.save',
  'admin.a11y.upload',
  'admin.audit.searchPlaceholder',
  'admin.categories.bulk.activeAction',
  'admin.categories.bulk.deleteAction',
  'admin.categories.bulk.inactiveAction',
  'admin.categories.imageDesc',
  'admin.categories.resolutionLabel',
  'admin.categories.supportedFormatsLabel',
  'admin.categories.toolbar.allStatuses',
  'admin.categories.toolbar.statusTitle',
  'admin.categories.uploading',
  'admin.common.experimentalModeDisabled',
  'admin.common.imageUrlWithManual',
  'admin.common.saving',
  'admin.common.tabAdmins',
  'admin.common.tabGeneral',
  'admin.common.tabPayment',
  'admin.common.tabSystemStatus',
  'admin.dashboard.charts.carrierDist',
  'admin.dashboard.charts.orderDensity',
  'admin.dashboard.charts.orderTrend',
  'admin.dashboard.charts.pendingShipmentAge',
  'admin.dashboard.charts.returnStatus',
  'admin.dashboard.charts.weeklyReturns',
  'admin.dashboard.kpis.avgBasket',
  'admin.dashboard.kpis.criticalLevel',
  'admin.dashboard.kpis.inventoryValue',
  'admin.dashboard.range30d',
  'admin.dashboard.range7d',
  'admin.dashboard.rangeToday',
  'admin.dashboard.trend',
  'admin.dataRequests.due.overdueBadge',
  'admin.dataRequests.navLabel',
  'admin.dataRequests.searchHint',
  'admin.dataRequests.searchPlaceholder',
  'admin.dataRequests.toasts.loadError',
  'admin.dataTable.bulk.activateItems',
  'admin.dataTable.bulk.archiveItems',
  'admin.dataTable.bulk.deactivateItems',
  'admin.dataTable.bulk.deleteItems',
  'admin.dataTable.filter.facetEmpty',
  'admin.dataTable.pagination.of',
  'admin.dataTable.pagination.rowsPerPage',
  'admin.dataTable.states.accessDenied',
  'admin.inventory.adjustStock',
  'admin.inventory.criticalLevel',
  'admin.inventory.editStock',
  'admin.inventory.fetchFailed',
  'admin.inventory.groupByCategory',
  'admin.inventory.settings.unsavedChangesConfirm',
  'admin.inventory.status.criticalLevel',
  'admin.inventory.status.outOfStock',
  'admin.inventory.stockAlarms',
  'admin.inventory.stockMovement',
  'admin.inventory.summary',
  'admin.inventory.table.daysUntilEmpty',
  'admin.inventory.table.groupCount',
  'admin.inventory.table.statusIndicator',
  'admin.inventory.table.uncategorized',
  'admin.inventory.toasts.loadFailed',
  'admin.inventory.unnamedProduct',
  'admin.inventory.warehouseLocation',
  'admin.invoices.table.issuedBy',
  'admin.invoices.tabs.ledger',
  'admin.logistics.noCarrierSelected',
  'admin.logistics.toasts.loadFailed',
  'admin.logistics.updating',
  'admin.menu.categoryBuilder',
  'admin.menu.inventoryReport',
  'admin.menu.inventorySettings',
  'admin.menu.logs',
  'admin.menu.pricingPolicies',
  'admin.menu.pricingPreview',
  'admin.menu.pricingRules',
  'admin.menu.webhookEvents',
  'admin.movements.pageLabel',
  'admin.orders.bulk.cancelPartialFail',
  'admin.orders.bulk.noShippableSelected',
  'admin.orders.filters.endDate',
  'admin.orders.filters.startDate',
  'admin.orders.modals.logs.orderLabel',
  'admin.orders.modals.logs.table.messageId',
  'admin.orders.modals.notes.adding',
  'admin.orders.modals.shipping.advancedLabel',
  'admin.orders.modals.shipping.bulkList.orderColumn',
  'admin.orders.modals.shipping.bulkList.trackingColumn',
  'admin.orders.modals.shipping.carriers.dhl',
  'admin.orders.modals.shipping.carriers.fedex',
  'admin.orders.modals.shipping.carriers.other',
  'admin.orders.modals.shipping.carriers.ups',
  'admin.orders.modals.shipping.otherPlaceholder',
  'admin.orders.modals.shipping.saving',
  'admin.orders.toasts.missingAdvancedFields',
  'admin.orders.toasts.shippingCancelConfirm',
  'admin.orders.toasts.shippingCancelFailed',
  'admin.orders.toasts.shippingCancelSuccess',
  'admin.orders.tooltips.cancelBulkShipping',
  'admin.orders.tooltips.cancelShipping',
  'admin.orders.tooltips.logs',
  'admin.pricing.policies.form.priorityHelp',
  'admin.pricing.policies.form.priorityLabel',
  'admin.products.confirm.deleteImage',
  'admin.products.edit.actions.save',
  'admin.products.edit.editing',
  'admin.products.edit.images.altPlaceholder',
  'admin.products.edit.images.makeCover',
  'admin.products.edit.images.saveFirst',
  'admin.products.edit.info.categoryUnset',
  'admin.products.edit.info.modelCode',
  'admin.products.edit.info.modelPlaceholder',
  'admin.products.edit.pricing.purchasePlaceholder',
  'admin.products.edit.pricing.purchasePrice',
  'admin.products.edit.pricing.salePlaceholder',
  'admin.products.edit.pricing.salePrice',
  'admin.products.edit.seo.chars',
  'admin.products.edit.seo.metaDesc',
  'admin.products.edit.seo.metaTitle',
  'admin.products.edit.seo.slugInUse',
  'admin.products.edit.seo.slugPlaceholder',
  'admin.products.edit.seo.slugRequired',
  'admin.products.edit.stock.defaultSuffix',
  'admin.products.edit.stock.hintBase',
  'admin.products.edit.stock.lowPlaceholder',
  'admin.products.edit.stock.lowThreshold',
  'admin.products.edit.stock.stockPlaceholder',
  'admin.products.edit.tabs.images',
  'admin.products.toasts.altSaveFailed',
  'admin.products.toasts.imagesSaveFailed',
  'admin.products.toasts.imagesSaved',
  'admin.products.toasts.loadFailed',
  'admin.products.toasts.orderNotChanged',
  'admin.products.toasts.priceSaveFailed',
  'admin.products.toasts.productLoadFailed',
  'admin.products.toasts.seoSaveFailed',
  'admin.products.toasts.stockSaveFailed',
  'admin.purchasing.actions.closeShortTitle',
  'admin.purchasing.create.addLine',
  'admin.purchasing.navLabel',
  'admin.returns.empty.filtered',
  'admin.returns.toasts.emailNotifyFailed',
  'admin.returns.toasts.emailNotifySent',
  'admin.returns.toasts.returnsLoadFailed',
  'admin.returns.total',
  'admin.settings.addAdmin',
  'admin.settings.adminsDesc',
  'admin.settings.adminsSaveSuccess',
  'admin.settings.adminsTab',
  'admin.settings.adminsTitle',
  'admin.settings.apiLatency',
  'admin.settings.dbStatus',
  'admin.settings.dropLogo',
  'admin.settings.generalTab',
  'admin.settings.iyzicoSecretKey',
  'admin.settings.lastUpdate',
  'admin.settings.paymentSaveSuccess',
  'admin.settings.paymentTab',
  'admin.settings.paymentTitle',
  'admin.settings.platformIdentity',
  'admin.settings.platformIdentityDesc',
  'admin.settings.saving',
  'admin.settings.securityWarningDesc',
  'admin.settings.securityWarningTitle',
  'admin.settings.systemDesc',
  'admin.settings.systemLogs',
  'admin.settings.systemSaveSuccess',
  'admin.settings.systemTab',
  'admin.settings.systemTitle',
  'admin.settings.tabAdmins',
  'admin.settings.tabPayment',
  'admin.settings.tabSystem',
  'admin.settings.versionInfo',
  'admin.titles.pricingRules',
  'admin.toolbar.itemsSelected',
  'admin.ui.accessDeniedDesc',
  'admin.ui.apply',
  'admin.ui.hide',
  'admin.ui.noRecords',
  'admin.ui.pageLabel',
  'admin.users.empty.filtered',
  'admin.users.table.company',
  'admin.users.toasts.adminsLoadFailed',
  'admin.users.toasts.allLoadFailed',
  'admin.users.toasts.roleNotUpdated',
  'admin.webhooks.emailsTable.subject',
  'admin.webhooks.export.csvLabel',
  'admin.webhooks.noEmails',
  'admin.webhooks.noEmailsDesc',
  'admin.webhooks.noReturns',
  'admin.webhooks.noReturnsDesc',
  'admin.webhooks.returnsTable.eventId',
  'admin.webhooks.returnsTable.statusMapped',
  'admin.webhooks.tip.rowAction',
  'auth.callback.verifyError',
  'auth.features.fast',
  'auth.features.secure',
  'auth.goToLogin',
  'auth.googleSignIn',
  'auth.or',
  'auth.registrationComplete',
  'auth.userNotFound',
  'brands.countryLabel',
  'brands.sectionSubtitle',
  'category.aboutCategory',
  'category.backHome',
  'category.clean',
  'category.clearFilters',
  'category.close',
  'category.compareBar',
  'category.compareTitle',
  'category.goToCategory',
  'category.gridViewAria',
  'category.labelBrand',
  'category.labelModel',
  'category.labelPrice',
  'category.landing.filterAll',
  'category.landing.filterQuiet',
  'category.landing.solutionsListed',
  'category.listViewAria',
  'category.ltePlaceholder',
  'category.maxPlaceholder',
  'category.minPlaceholder',
  'category.noProductsDesc',
  'category.priceRange',
  'category.productCount',
  'category.series.colAction',
  'category.series.colAirflow',
  'category.series.colModel',
  'category.series.colNoise',
  'category.series.colPower',
  'category.series.colPrice',
  'category.series.matrixView',
  'category.series.requestQuote',
  'category.series.seriesConfigCount',
  'category.series.seriesHeading',
  'category.series.showcaseView',
  'category.series.skuLabel',
  'category.series.startingFrom',
  'category.sortByName',
  'category.sortByPriceHigh',
  'category.sortByPriceLow',
  'category.techFilters',
  'checkout.nav.backToAddress',
  'checkout.paymentError',
  'checkout.saved.manage',
  'common.adminPanel',
  'common.allCategories',
  'common.allProducts',
  'common.backToSite',
  'common.byApplication',
  'common.categoryList.air-treatment',
  'common.categoryList.hvls',
  'common.categoryList.hygiene',
  'common.categoryList.parking-jet',
  'common.categoryList.smart-home',
  'common.categoryList.sub.acid-fans',
  'common.categoryList.sub.air-curtain',
  'common.categoryList.sub.axial-ind',
  'common.categoryList.sub.bathroom',
  'common.categoryList.sub.conditioning',
  'common.categoryList.sub.duct-heaters',
  'common.categoryList.sub.freq-converters',
  'common.categoryList.sub.ghost',
  'common.categoryList.sub.rect-duct',
  'common.categoryList.sub.round-duct',
  'common.categoryList.sub.shelter',
  'common.categoryList.sub.window',
  'common.categoryList.summer',
  'common.clearSearch',
  'common.discover',
  'common.discoverPage',
  'common.edit',
  'common.exploreProducts',
  'common.getQuote',
  'common.goToStore',
  'common.gotoCategory',
  'common.loadingApp',
  'common.more',
  'common.myOrders',
  'common.newProducts',
  'common.priceRange',
  'common.quickSearch',
  'common.saving',
  'common.searchHeaderPlaceholder',
  'common.searchPlaceholder',
  'common.searchPlaceholderLong',
  'common.selectByNeed',
  'common.supportCenter',
  'common.systemPreparing',
  'common.viewAll',
  'common.whatsapp.technicalQuoteMessage',
  'common.whyUs',
  'header.commandSearch',
  'header.roleLabel',
  'header.syncing',
  'orders.demoNote',
  'orders.filters',
  'orders.noItems',
  'orders.orderDate',
  'orders.orderNo',
  'orders.orderTotal',
  'orders.viewAll',
  'orders.viewReceipt',
  'pdp.specGroups.other',
  'pdp.specs.absorbed_current_a',
  'pdp.specs.atex_marking',
  'pdp.specs.blade_diameter_mm',
  'pdp.specs.co2_sensor',
  'pdp.specs.compatible_model',
  'pdp.specs.connection_height_mm',
  'pdp.specs.connection_width_mm',
  'pdp.specs.diameter_mm',
  'pdp.specs.discharge_type',
  'pdp.specs.discharge_velocity_curve',
  'pdp.specs.drive_code',
  'pdp.specs.enclosure_class',
  'pdp.specs.enclosure_size',
  'pdp.specs.erp_compliant',
  'pdp.specs.filter_classes',
  'pdp.specs.fire_rating',
  'pdp.specs.has_bypass',
  'pdp.specs.has_humidistat',
  'pdp.specs.has_timer',
  'pdp.specs.heating_capacity_kw',
  'pdp.specs.heating_power_w',
  'pdp.specs.height_mm',
  'pdp.specs.humidity_removed_l_24h',
  'pdp.specs.insulation_class',
  'pdp.specs.ip_rating',
  'pdp.specs.length_mm',
  'pdp.specs.max_absorbed_power_w',
  'pdp.specs.max_current_a',
  'pdp.specs.max_delivery_ls',
  'pdp.specs.max_delivery_m3h',
  'pdp.specs.max_static_pressure_pa',
  'pdp.specs.max_voltage_v',
  'pdp.specs.min_delivery_m3h',
  'pdp.specs.min_static_pressure_pa',
  'pdp.specs.min_voltage_v',
  'pdp.specs.motor_poles',
  'pdp.specs.motor_type',
  'pdp.specs.noise_level_db_a',
  'pdp.specs.noise_lpa_3m_db',
  'pdp.specs.nominal_delivery_m3h',
  'pdp.specs.nominal_static_pressure_pa',
  'pdp.specs.number_of_blades',
  'pdp.specs.operating_temperature_c',
  'pdp.specs.optional_heater_power_w',
  'pdp.specs.pm10_sensor',
  'pdp.specs.pm2_5_sensor',
  'pdp.specs.pq_curve',
  'pdp.specs.rated_output_current_a',
  'pdp.specs.rated_power_w',
  'pdp.specs.refrigerant_type',
  'pdp.specs.relative_humidity_sensor',
  'pdp.specs.reversible',
  'pdp.specs.size_d_mm',
  'pdp.specs.tank_capacity_l',
  'pdp.specs.temp_sensor',
  'pdp.specs.thermal_efficiency_curve',
  'pdp.specs.thermal_efficiency_pct',
  'pdp.specs.voc_sensor',
  'pdp.specs.voltage_alt_v',
  'pdp.specs.width_mm',
  'products.applicationTitle',
  'products.breadcrumbDiscover',
  'products.categoryCard.seriesCount',
  'products.clearFilters',
  'products.discoverSeoDesc',
  'products.discoverVisual',
  'products.helpCtaSubtitle',
  'products.helpCtaTitle',
  'products.heroSubtitle',
  'products.heroTitle',
  'products.heroValue1',
  'products.heroValue2',
  'products.heroValue3',
  'products.hubBadge',
  'products.hubSubtitle',
  'products.noResults',
  'products.noResultsDesc',
  'products.popularCategories',
  'products.searchResultsTitle',
  'products.searchSeoDesc',
  'products.searchSeoTitle',
  'quotes.admin.navLabel',
  'quotes.request.cartQuoteItems',
  'search.allResults',
  'search.detailedSearchCta',
  'search.placeholder',
  'support.home.faqDesc',
  'support.home.knowledgeDesc',
  'support.home.returnsDesc',
  'support.home.shippingDesc',
  'support.home.warrantyDesc',
])

/**
 * `t(degisken)` çağrısı BULUNAN dosyalar — bekçinin ÖN KOŞUL sınırı.
 *
 * Bekçi anahtarı yalnız literal ya da şablondan çıkarabilir. Tamamen değişkenle çağrılan
 * bir `t()` varsa o çağrının anahtarını İZLEYEMEZ. Bu dosyalardaki çağrıların anahtarları
 * başka bir yerde literal olarak duruyor (`labelKey: 'admin.menu.orders'` gibi) ve diğer
 * eksenler onları yakalıyor — ölçüldü. Liste, YENİ bir dosyada opak çağrı doğduğunda
 * kırmızı versin diye donduruldu: o an yazarın "bu anahtar literal olarak keşfedilebilir mi"
 * sorusunu bilinçle cevaplaması gerekir.
 *
 * NOT: satır numarası DEĞİL dosya tutulur — satır her düzenlemede kayar, dosya kaymaz.
 */
const OPAK_CAGRI_DOSYALARI: ReadonlySet<string> = new Set([
  'src/components/StickyHeader.tsx',
  'src/components/admin/CommandPalette.tsx',
  'src/components/admin/authority-builder/AuthorityBuilder.tsx',
  'src/components/admin/pricing/PricingRuleFormModal.tsx',
  'src/components/admin/products/ProductCsvImport.tsx',
  'src/components/admin/shell/AdminSidebar.tsx',
  'src/components/admin/shell/AdminThemeToggle.tsx',
  'src/components/home/HomeSinevizyon.tsx',
  'src/components/product/ProductSmartInference.tsx',
  'src/hooks/useCategoryViewModel.ts',
  'src/hooks/useCheckoutPayment.ts',
  'src/lib/admin/orderStatusLabels.ts',
  'src/utils/categoryHelpers.ts',
  'src/utils/checkoutHelpers.ts',
  'src/utils/specLabel.ts',
  'src/views/account/quotes/QuoteDetailPage.tsx',
  'src/views/admin/AdminLayout.tsx',
  'src/views/admin/CouponsTableBody.tsx',
  'src/views/knowledge/HubPage.tsx',
])

/**
 * NOKTASIZ ŞABLON KANARYASI — kapının kendi körlüğünü ölçer.
 * Bu anahtarlar kodda `t(`önek${...}`)` ile ayraçsız üretilir; kapı bunları ölü görürse
 * önek eşlemesi bozulmuş demektir. Liste uzunluğu da kilitli: sessizce büyütülemez.
 */
const KANARYA = [
  'pdp.actions.downloadBrochure',
  'pdp.actions.downloadCatalog',
  'calculators.airCurtain.results.efficiencyOptimal',
  'calculators.airCurtain.results.efficiencyOptimalDesc',
  'calculators.airCurtain.results.efficiencyMarginal',
  'calculators.airCurtain.results.efficiencyMarginalDesc',
  'calculators.airCurtain.results.efficiencyAcceptable',
  'calculators.airCurtain.results.efficiencyAcceptableDesc',
  'calculators.airCurtain.results.efficiencyWarning',
  'calculators.airCurtain.results.efficiencyWarningDesc',
] as const

describe('INV-6: sözlükte tüketicisi olmayan anahtar bırakılmaz', () => {
  const tarama = tara()
  const yapraklar = leafKeys(tr)

  it('KAPSAM KANARYASI: tarama gerçekten bir şeye baktı', () => {
    // "0 ihlal" cümlesi, ancak tarama gerçekten çalıştıysa bilgi taşır. Glob bozulur ya da
    // kapsam filtresi her şeyi elerse bekçi sessizce YEŞİL döner ve hiçbir şey korumaz.
    expect(tarama.tarananDosya).toBeGreaterThan(200)
    expect(tarama.eslesmeSayisi).toBeGreaterThan(2000)
    expect(yapraklar.length).toBeGreaterThan(3000)
  })

  it('KANARYA: noktasız şablonla üretilen anahtarlar CANLI görülmeli', () => {
    const olu = KANARYA.filter((k) => !canli(k, tarama))
    expect(
      olu,
      'Bu anahtarlar kodda `t(`önek${...}`)` ile AYRAÇSIZ üretiliyor. Ölü görünüyorlarsa ' +
        'sözlük değil KAPI kördür: önek eşlemesi ayraç şartı koymuş olabilir.',
    ).toEqual([])
    // Kanarya seti sessizce boşaltılamaz.
    expect(KANARYA.length).toBe(10)
  })

  it('ÖN KOŞUL: `t(degisken)` yalnız BİLİNEN dosyalarda', () => {
    // Bekçi anahtarı ancak literal ya da şablondan çıkarabilir; tamamen değişkenle çağrılan
    // bir `t()` o çağrının anahtarını İZLENEMEZ kılar. Kapının kendi sınırını ölçmesi için
    // bu dosyalar dondurulmuştur. YENİ bir dosyada opak çağrı doğarsa yazar, anahtarın
    // literal olarak keşfedilebilir olduğunu bilinçle doğrulamalı ve listeye eklemeli.
    const yeniDosyalar = [...new Set(tarama.opaque.map((o) => o.file))]
      .filter((f) => !OPAK_CAGRI_DOSYALARI.has(f))
      .sort()
    expect(
      yeniDosyalar,
      'Bu dosyalarda yeni `t(degisken)` çağrısı var. Anahtarı literal olarak keşfedilebilir ' +
        'mi (config verisi / şablon)? Değilse bu bekçi o anahtarı ölü sanabilir.',
    ).toEqual([])
  })

  it('sözlükte tüketicisi olmayan YENİ anahtar yok', () => {
    const olu = yapraklar.filter((k) => !canli(k, tarama) && !DONMUS_BORC.has(k))
    expect(
      olu,
      `Tüketicisi olmayan ${olu.length} YENİ anahtar var. Ölü anahtar GÖRÜNMEZ bir kusurdur: ` +
        'tsc/lint/parite hiçbiri görmez, çözücü sessizce ham anahtar basar. Anahtarı kaldır ' +
        'ya da tüketicisini yaz. Yanlış pozitif olduğunu düşünüyorsan ÖNCE tüketim biçimini ' +
        'ÖLÇ (dict.x erişimi · şablon · veri-anahtarı · yaprak-adıyla indeksleme) ve gerekiyorsa ' +
        'bu bekçiyi o eksende genişlet — donmuş borç listesine EKLEME.',
    ).toEqual([])
  })

  it('donmuş borç listesi bayatlamaz (yalnız küçülebilir)', () => {
    // Borç kaydı gerçeği yansıtmalı. Bir anahtar kaldırıldığında ya da tüketicisi
    // yazıldığında listeden de çıkmalı; yoksa liste zamanla kurgu olur ve "431 borç"
    // cümlesi hiçbir şey ölçmez. [[comment-encoding-a-measurement-goes-stale]] sınıfı.
    const sozlukte = new Set(yapraklar)
    const gereksiz = [...DONMUS_BORC]
      .filter((k) => !sozlukte.has(k) || canli(k, tarama))
      .sort()
    expect(
      gereksiz,
      'Bu anahtarlar artık ölü değil (kaldırıldı ya da tüketicisi yazıldı). ' +
        'DONMUS_BORC listesinden de çıkar — borç kaydı yalnız küçülebilir.',
    ).toEqual([])
  })
})
