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
 * Dinamik anahtar önekini AYRAÇLA eşlemek kör nokta yaratır. Kodda anahtarı
 * **ayraçsız** birleştiren çağrı:
 *
 *   t(`calculators.airCurtain.results.efficiency${...}`)   // ve ...${...}Desc
 *
 * Üretilen anahtarlar `...efficiencyOptimal` — `önek.` ile başlamaz. Denetimde bu
 * anahtarlar "ölü" listesine düşmüştü; silinselerdi hava perdesi verimlilik metni
 * bozulacak ve HİÇBİR KAPI görmeyecekti (sözlükten anahtar eksilince tsc/lint/parite
 * susar).
 *
 * Bu yüzden önek eşlemesi AYRAÇSIZ yapılır ve o anahtarlar **KANARYA** olarak tutulur:
 * kapı onları "ölü" görürse sözlük değil **KAPININ KENDİSİ KÖR** demektir.
 *
 * ⭐2026-08-27 — KANARYA 10'DAN 8'E İNDİ, SEBEBİ ÖLÇÜLDÜ (sayı gevşetilmedi):
 * İkinci ayraçsız çağrı yeri şuydu ve ARTIK YOK:
 *
 *   t(`pdp.actions.download${type === 'productCatalog' ? 'Catalog' : 'Brochure'}`)
 *
 * PDP'de sertifika/belge bölümleri veri-dayanaksız oldukları için kaldırıldı (#866),
 * o çağrı da onlarla gitti. `pdp.actions.downloadCatalog/downloadBrochure` böylece
 * GERÇEKTEN ölü kaldı — kapı kör olduğu için değil. Yerine iki başka anahtar
 * konulamadı, çünkü ÖLÇTÜM: depoda ayraçsız şablon üreten BAŞKA çağrı yeri kalmadı
 * (`grep -E 't\(`[\w.]*\$\{' src/` → tek yer: AirCurtainCalcPage). Kanaryayı 8'de
 * tutmak, olmayan bir çağrı yerini varmış gibi göstermekten dürüsttür; 8 anahtar da
 * aynı körlüğü aynı keskinlikte ölçer. Üçüncü bir ayraçsız çağrı yeri doğarsa
 * kanaryaya EKLENİR — bu sayı yalnız ölçümle değişir.
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
//
// Sondaki nokta OPSİYONEL (`\.?`) OLMAK ZORUNDA. Kod anahtarı iki biçimde de kurar:
// `` `a.b${x}` `` (ayraçsız) ve `` `a.b.${x}` `` (ayraçlı). İlk sürüm yalnız ayraçsızı
// tanıyordu; `` `common.categoryList.${tKey}` `` (categoryHelpers.ts:32) eşleşmedi ve
// DB sürücülü 18 kategori anahtarı ÖLÜ sanılıp donmuş borca yazıldı — hepsi CANLI.
// Cetveldeki "önek eşlemesi ayraçsız olmalı" kuralının ters yüzü; iki biçim de gerekli.
const ANY_TEMPLATE = /`([a-z][\w]*(?:\.[\w]+)+\.?)\$\{/g
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
/**
 * 7. EKSENİN KAPSAMI — çeviriye DOKUNMAYAN dosya tüketici SAYILMAZ.
 *
 * BARE_WORD bilerek gevşek: tırnaklı her sözcüğü toplar. Kapsam tüm ağaç olursa bu gevşeklik
 * kapıyı YER: bir servis dosyasındaki DB KOLON ADI (`'max_absorbed_power_w'`) ya da bir
 * seçenek kimliği (`id: 'bathroom'`) sözlük tüketicisi sanılır. 2026-08-23'te tam bu oldu —
 * sihirbaz servisi eklenince altı ölü anahtar "canlandı" ve borç kaydı yalancıktan küçüldü.
 * Borç gerçekte azalmadı; kapı kör oldu.
 *
 * Ayrım: **bir dosya çeviriye hiç dokunmuyorsa çeviri tüketicisi olamaz.** Ölçüldü —
 *   `utils/whatsapp.ts`      : `import { tr } … { en }` (sözlüğü CAST'leyip yaprak adıyla
 *                              indeksler; 7. eksen ZATEN bunun için var, korunmalı)
 *   `services/wizard.service.ts`: i18n ile HİÇBİR bağı yok, dizeleri DB kolon adları
 * Bu yüzden 7. eksen yalnız `t(` çağrısı yapan ya da sözlüğü/`useI18n`i import eden
 * dosyalardan toplanır. Diğer altı eksen TÜM ağaçtan toplanmaya devam eder — daraltma
 * yalnız en gevşek eksene uygulanır.
 */
const I18N_DOKUNAN = /(?:from\s+['"][^'"]*i18n[^'"]*['"])|useI18n|(?<![\w$])_?t\(/

/**
 * 7. EKSENİN DOSYA-BAĞI (REC-127 kalem 2b, 2026-09-04).
 *
 * Çıplak yaprak adı TEK BAŞINA "canlı" saymaz artık. Rescue ancak sözcüğün geçtiği
 * dosya ANAHTARIN ATASINI da anıyorsa geçerli. `yollar` = o dosyada görülen sözlük
 * yolları (statik anahtar + şablon öneki + dict erişimi).
 */
interface DosyaIzi {
  yol: string
  bareWords: Set<string>
  yollar: string[]
}

interface Tarama {
  staticKeys: Set<string>
  prefixes: string[]
  dictPaths: string[]
  bareWords: Set<string>
  dosyalar: DosyaIzi[]
  opaque: { file: string; line: number }[]
  tarananDosya: number
  bareWordDosya: number
  eslesmeSayisi: number
}

function tara(): Tarama {
  const staticKeys = new Set<string>()
  const prefixes: string[] = []
  const dictPaths: string[] = []
  const bareWords = new Set<string>()
  const dosyalar: DosyaIzi[] = []
  const opaque: { file: string; line: number }[] = []
  let tarananDosya = 0
  let bareWordDosya = 0
  let eslesmeSayisi = 0

  for (const [path, raw] of Object.entries(SOURCES)) {
    if (isDictFile(path) || isTestFile(path)) continue
    tarananDosya++
    const src = stripComments(raw)
    // 7. eksenin kapsamı: çeviriye DOKUNAN dosyalar. Bkz. I18N_DOKUNAN açıklaması.
    const i18nDokunan = I18N_DOKUNAN.test(src)
    if (i18nDokunan) bareWordDosya++
    // Bu dosyanın KENDİ izi — 7. eksenin dosya-bağı için (bkz. DosyaIzi).
    const buDosya: DosyaIzi = { yol: path.replace(/^\//, ''), bareWords: new Set<string>(), yollar: [] }
    src.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(T_STATIC)) {
        staticKeys.add(m[2])
        buDosya.yollar.push(m[2])
        eslesmeSayisi++
      }
      for (const m of line.matchAll(T_TEMPLATE)) {
        prefixes.push(m[1].replace(/\.$/, ''))
        buDosya.yollar.push(m[1].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(ANY_TEMPLATE)) {
        prefixes.push(m[1].replace(/\.$/, ''))
        buDosya.yollar.push(m[1].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(T_CONCAT)) {
        prefixes.push(m[2].replace(/\.$/, ''))
        buDosya.yollar.push(m[2].replace(/\.$/, ''))
        eslesmeSayisi++
      }
      for (const m of line.matchAll(DICT_ACCESS)) {
        dictPaths.push(m[1])
        buDosya.yollar.push(m[1])
        eslesmeSayisi++
      }
      for (const m of line.matchAll(BARE_KEY)) {
        staticKeys.add(m[2])
        buDosya.yollar.push(m[2])
        eslesmeSayisi++
      }
      if (i18nDokunan) {
        for (const m of line.matchAll(BARE_WORD)) {
          bareWords.add(m[2])
          buDosya.bareWords.add(m[2])
        }
      }
      for (const _m of line.matchAll(T_OPAQUE)) {
        opaque.push({ file: path.replace(/^\//, ''), line: i + 1 })
      }
    })
    if (buDosya.bareWords.size > 0) dosyalar.push(buDosya)
  }

  return { staticKeys, prefixes, dictPaths, bareWords, dosyalar, opaque, tarananDosya, bareWordDosya, eslesmeSayisi }
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
  /**
   * 7. eksen — alt ağaç yaprak adıyla indeksleniyor olabilir (whatsapp.ts deseni).
   *
   * ⭐DOSYA-BAĞI ŞARTI (REC-127 kalem 2b, 2026-09-04). Çıplak yaprak adı TEK BAŞINA
   * yetmez: sözcüğün geçtiği dosya, anahtarın ATASINI da anmalı.
   *
   * ÖLÇÜLMÜŞ KUSUR: `ProductDetailPageView.tsx` içinde `kimlik: 'warranty'` diye bir
   * SEÇENEK KİMLİĞİ var (gerçek tüketici yanındaki `t('pdp.trust.warranty')`). Eski kural
   * bu tek dizeyle sözlükteki HER `.warranty` yaprağını — hangi ağaçta olursa olsun —
   * canlı sayıyordu. `home.whyVentHub.badges.warranty` tam bu yüzden ölü olduğu hâlde
   * kapıdan geçti; ölçüm gösterdi ki o dosyada `whyVentHub` da `badges` da `home` da
   * HİÇ geçmiyor (0 isabet).
   *
   * ŞARTIN whatsapp.ts'İ KIRMADIĞI ÖLÇÜLDÜ: o dosya `dict.whatsappMessages` yazıyor
   * (DICT_ACCESS eşleşmesi), yani atayı ANIYOR — 7. eksen orada aynen çalışmaya devam eder.
   *
   * Gevşeklik hâlâ kasıtlı: ata eşlemesi ayraçsız `startsWith`, çünkü amaç ölüyü yakalamak
   * değil, yanlış-kırmızı vermemek. Daraltma yalnız "alakasız dosyadan aklama"yı kesiyor.
   */
  const son = key.slice(key.lastIndexOf('.') + 1)
  for (const d of t.dosyalar) {
    if (!d.bareWords.has(son)) continue
    for (const y of d.yollar) {
      if (key === y || key.startsWith(y + '.') || y.startsWith(key + '.')) return true
    }
  }
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
 * ⭐DAĞILIM — ÖLÇÜM TARİHİYLE BİRLİKTE (REC-133, 2026-09-06): **415 benzersiz anahtar**;
 * admin **314** (%76, ADMIN şeridinin işi) · vitrin **101** — common 26 · account 24 ·
 * category 19 · auth 7 · orders 6 · products 5 · checkout 3 · header 3 · support 2 ·
 * returns 2 · brands/quotes/search/pdp 1'er.
 *
 * ⛔ÖNCEKİ SATIR BAYATTI, DÜZELTİLDİ: burada 431-döneminin (08-23) dağılımı yazılıydı
 * ("admin 200 · pdp 61 · common 47 …"). Bugün pdp **1**, admin **314**. Sayılar yanlış
 * değil ESKİYDİ — ama kapının kendi belgesi kapının kendi listesini yanlış tarif ediyordu.
 * Bu yüzden dağılım artık ölçüm TARİHİYLE yazılır. Ayrıntı + tarihçe:
 * `docs/audits/olu-sozluk-anahtari-olcumu-2026-09-06.md`
 *
 * ⭐LİSTE 266'DAN 415'E ÇIKTI — SUSTURMA DEĞİL, KESKİNLEŞME: 09-03'te (REC-127) kapıya
 * DOSYA-BAĞI şartı eklendi ve **+149** gizli ölü anahtar ortaya çıktı; onlar 09-03'ten
 * önce de ölüydü, zayıf ölçüt "canlı" sayıyordu. Kuralın anlamı: liste CANLIYA DÖNEN
 * anahtarı tutamaz (bayatlık testi zorlar); daha keskin ölçümün ortaya çıkardığı anahtarın
 * eklenmesi meşrudur — ama her ekleme SEBEBİYLE birlikte commit edilir.
 */
const DONMUS_BORC: ReadonlySet<string> = new Set([
  // --- 2026-08-23: 7. eksen kapsami daraltilinca ORTAYA CIKAN uc olu anahtar ---
  // Bu uc anahtar daha once CANLI gorunuyordu, ama yalniz cevirye DOKUNMAYAN dosyalardaki
  // tirnakli sozcukler sayesinde: 'template' -> checkout/injectCheckoutForm.ts (i18n bagi YOK),
  // 'phone'/'city' -> cesitli form dosyalari. Kapsam daralinca gercek durumlari gorundu.
  // Ucu de elle dogrulandi: admin.inventory.export.headers.* KULLANILIYOR ama .template DEGIL;
  // account.addresses.ph.* zaten yeniden-adlandirma yetimi (sayfa .placeholders.* kullaniyor)
  // ve dort kardesi bu listede ZATEN duruyor.
  // NOT: borc bu commit'te 352 -> 355 BUYUDU. 'Liste yalniz kuculur' kurali VERI degisince
  // gecerlidir; KAPI KESKINLESTIGINDE gizli borcun gorunur olmasi beklenen sonuctur. Gizli
  // kalmasi daha kotuydu.
  'admin.inventory.export.template',
  'account.addresses.ph.phone',
  'account.addresses.ph.city',
  'account.addresses.addressLabel',
  'account.addresses.noItems',
  'account.addresses.ph.address',
  'account.addresses.ph.district',
  'account.addresses.ph.fullName',
  'account.addresses.ph.postalCode',
  'account.invoices.companyLabel',
  'account.invoices.confirmDelete',
  'account.invoices.deleted',
  'account.invoices.eInvoice',
  'account.invoices.save',
  'account.invoices.tcknLabel',
  'account.invoices.updated',
  'account.invoices.vknLabel',
  'account.overview.billingAddress',
  'account.overview.shippingAddress',
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
  'auth.or',
  'auth.registrationComplete',
  'auth.userNotFound',
  'brands.sectionSubtitle',
  'category.backHome',
  'category.clean',
  'category.clearFilters',
  'category.close',
  'category.landing.filterAll',
  'category.productCount',
  'category.series.colAction',
  'category.series.colModel',
  'category.series.colPrice',
  'category.series.requestQuote',
  'category.series.skuLabel',
  'checkout.paymentError',
  'checkout.saved.manage',
  'common.adminPanel',
  'common.allCategories',
  'common.allProducts',
  'common.backToSite',
  'common.discover',
  'common.edit',
  'common.exploreProducts',
  'common.getQuote',
  'common.more',
  'common.saving',
  'common.searchPlaceholder',
  'common.viewAll',
  'header.roleLabel',
  'header.syncing',
  'orders.filters',
  'orders.noItems',
  'orders.orderDate',
  'orders.orderNo',
  'orders.viewAll',
  'products.clearFilters',
  'products.heroSubtitle',
  'products.heroTitle',
  'products.noResults',
  'products.popularCategories',
  'quotes.admin.navLabel',
  'search.placeholder',
  'support.home.warrantyDesc',

  // ============================================================================
  // 2026-09-04 · REC-127 kalem 2b — 7. EKSENE DOSYA-BAĞI ŞARTI KONUNCA GÖRÜNEN 149 ANAHTAR
  // ============================================================================
  // Bunlar YENİ ölü anahtar DEĞİL: hepsi zaten ölüydü, kapı GÖRMÜYORDU. Eski kural çıplak
  // yaprak adını tek başına "canlı" sayıyordu, yani ALAKASIZ bir dosyadaki tek dize
  // (ör. `kimlik: 'warranty'`) sözlükteki her aynı-adlı yaprağı akliyordu. Şart artık
  // sözcüğün geçtiği dosyanın anahtarın ATASINI da anması.
  //
  // Borç 355 -> 504 BÜYÜDÜ. "Liste yalnız küçülür" kuralı VERİ değişince geçerlidir;
  // KAPI KESKİNLEŞTİĞİNDE gizli borcun görünür olması BEKLENEN sonuçtur — bu dosyanın
  // 2026-08-23 notu da aynı şeyi söylüyor. Gizli kalması daha kötüydü.
  //
  // ÖRNEKLEM ELLE DOĞRULANDI (8 kalem): üçünde tam yol kaynakta "geçiyor" göründü ve
  // üçü de ÖNEK ÇAKIŞMASI çıktı — `common.actions` için kaynakta `admin.common.actions`,
  // `admin.inventory.table.location` için `...locationCol`, `admin.settings.logo` için
  // `...logoUrlPlaceholder` var. Yani gevşek olan kapı değil, doğrulama grep'iydi.
  //
  // Dağılım: admin 113 · common 14 · category 8 · account 6 · returns 2 · diğer 6.
  // SİLME AYRI KARAR: her anahtar için iki kanıt (erişilebilirlik ağacında 0 + sözlük dışı
  // grep 0) gerekiyor; 113'ü admin yüzeyinde ve oturum açmayı gerektiriyor.
  'account.addresses.ph.label',
  'account.invoices.cancel',
  'account.invoices.created',
  'account.invoices.delete',
  'account.invoices.title',
  'account.invoices.type',
  'admin.a11y.delete',
  'admin.a11y.settings',
  'admin.common.all',
  'admin.common.ready',
  'admin.common.search',
  'admin.common.success',
  'admin.coupons.table.actions',
  'admin.dashboard.recent.title',
  'admin.dashboard.table.order',
  'admin.dataTable.pagination.page',
  'admin.dataTable.states.loading',
  'admin.errorGroups.table.actions',
  'admin.inventory.movements',
  'admin.inventory.status.normal',
  'admin.inventory.status.reserved',
  'admin.inventory.subtitle',
  'admin.inventory.supplier',
  'admin.inventory.table.abc',
  'admin.inventory.table.available',
  'admin.inventory.table.location',
  'admin.inventory.table.physical',
  'admin.inventory.table.reserved',
  'admin.inventory.table.supplier',
  'admin.inventory.table.threshold',
  'admin.invoices.tabs.pending',
  'admin.menu.categories',
  'admin.menu.coupons',
  'admin.menu.errorGroups',
  'admin.menu.errors',
  'admin.menu.inventory',
  'admin.menu.movements',
  'admin.menu.pricing',
  'admin.menu.products',
  'admin.menu.settings',
  'admin.menu.users',
  'admin.orders.actions.cancel',
  'admin.orders.columns.amount',
  'admin.orders.columns.conversationId',
  'admin.orders.columns.created',
  'admin.orders.columns.orderId',
  'admin.orders.columns.status',
  'admin.orders.export.headers.conversationId',
  'admin.orders.export.headers.created',
  'admin.orders.export.headers.products',
  'admin.orders.filters.status',
  'admin.orders.modals.logs.table.carrier',
  'admin.orders.modals.logs.table.to',
  'admin.orders.modals.logs.table.tracking',
  'admin.orders.modals.shipping.advancedTable.carrier',
  'admin.orders.modals.shipping.advancedTable.orderId',
  'admin.orders.modals.shipping.advancedTable.tracking',
  'admin.orders.states.loading',
  'admin.orders.statusLabels.all',
  'admin.orders.tooltips.notes',
  'admin.orders.tooltips.shipping',
  'admin.products.edit.actions.delete',
  'admin.products.edit.actions.new',
  'admin.products.edit.images.delete',
  'admin.products.edit.images.down',
  'admin.products.edit.images.none',
  'admin.products.edit.images.up',
  'admin.products.edit.info.brand',
  'admin.products.edit.info.category',
  'admin.products.edit.info.featured',
  'admin.products.edit.info.name',
  'admin.products.edit.info.sku',
  'admin.products.edit.info.status',
  'admin.products.edit.seo.slug',
  'admin.products.edit.stock.stock',
  'admin.products.edit.tabs.info',
  'admin.products.edit.tabs.pricing',
  'admin.products.edit.tabs.seo',
  'admin.products.edit.tabs.stock',
  'admin.products.form.price',
  'admin.purchasing.detail.product',
  'admin.purchasing.table.currency',
  'admin.returns.empty.none',
  'admin.search.categories',
  'admin.search.coupons',
  'admin.search.errorGroups',
  'admin.search.inventory',
  'admin.search.users',
  'admin.settings.logo',
  'admin.titles.inventory',
  'admin.ui.add',
  'admin.ui.failed',
  'admin.ui.loading',
  'admin.ui.next',
  'admin.ui.prev',
  'admin.ui.ready',
  'admin.users.actions.admin',
  'admin.users.actions.moderator',
  'admin.users.actions.superadmin',
  'admin.users.actions.user',
  'admin.users.empty.admins',
  'admin.users.empty.all',
  'admin.users.info.items.admin',
  'admin.users.info.items.moderator',
  'admin.users.info.items.superadmin',
  'admin.users.info.items.user',
  'admin.webhooks.emailsTable.date',
  'admin.webhooks.emailsTable.order',
  'admin.webhooks.emailsTable.provider',
  'admin.webhooks.emailsTable.to',
  'admin.webhooks.returnsTable.carrier',
  'admin.webhooks.returnsTable.order',
  'admin.webhooks.returnsTable.received',
  'admin.webhooks.search.returns',
  'admin.webhooks.search.shipping',
  'admin.webhooks.subtitle',
  'admin.webhooks.tabs.returns',
  'admin.webhooks.tabs.shipping',
  'admin.webhooks.title',
  'auth.features.mobile',
  'category.airflow',
  'category.feature',
  'category.loading',
  'category.noProducts',
  'category.noise',
  'category.notFound',
  'category.open',
  'category.pressure',
  'checkout.emptyCart.desc',
  'common.actions',
  'common.all',
  'common.amount',
  'common.date',
  'common.delete',
  'common.featured',
  'common.id',
  'common.no',
  'common.pdf',
  'common.remove',
  'common.series',
  'common.sku',
  'common.status',
  'common.yes',
  'header.adminBar.brand',
  'orders.empty',
  'pdp.certLabels.standard',
  'returns.created',
  'returns.status',
  'support.home.subtitle',
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
  'calculators.airCurtain.results.efficiencyOptimal',
  'calculators.airCurtain.results.efficiencyOptimalDesc',
  'calculators.airCurtain.results.efficiencyMarginal',
  'calculators.airCurtain.results.efficiencyMarginalDesc',
  'calculators.airCurtain.results.efficiencyAcceptable',
  'calculators.airCurtain.results.efficiencyAcceptableDesc',
  'calculators.airCurtain.results.efficiencyWarning',
  'calculators.airCurtain.results.efficiencyWarningDesc',
] as const

/**
 * AYRAÇLI ŞABLON + VERİTABANI SÜRÜCÜLÜ KANARYA — kapının İKİNCİ körlüğünü ölçer.
 *
 * Yukarıdaki kanarya `önek${x}` (ayraçsız) biçimini korur. Kod anahtarı DİĞER biçimde de
 * kurar: `` `önek.${x}` `` — sondaki noktayla. İlk sürümün `ANY_TEMPLATE` regex'i sondaki
 * noktayı ZORUNLU-YOK saymıştı ve iki tam öneki kaçırdı:
 *
 *   categoryHelpers.ts:32   `common.categoryList.${tKey}`     ← tKey VERİTABANINDAN gelir
 *   specLabel               `pdp.specs.${specKey}`            ← specKey ÜRÜN VERİSİNDEN gelir
 *
 * Sonuç: 79 CANLI anahtar (18 kategori + 61 spec etiketi) "ölü" sanılıp donmuş borca yazıldı.
 * Silinselerdi kategori adları ve PDP teknik tablosu ham anahtara düşerdi ve HİÇBİR KAPI
 * görmezdi — INV-5 de göremez, çünkü statik `t('...')` çağrısı yok.
 *
 * Bu sınıfın ayrı kanarya hak etmesinin sebebi: anahtarın CANLILIĞI **veritabanında**
 * yaşıyor. Kaynak taraması onu yalnız ÖNEK üzerinden görebilir; önek kaçarsa anahtar
 * sessizce ölü görünür. Aşağıdaki üç anahtarın canlılığı 2026-08-23'te canlı DB'de
 * `categories.translation_key` / ürün spec anahtarları ile doğrulandı.
 */
const KANARYA_AYRACLI = [
  'common.categoryList.sub.duct-heaters',
  'common.categoryList.sub.dehumidifier',
  'pdp.specs.noise_level_db_a',
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
    // Kanarya seti sessizce boşaltılamaz. 10 → 8: ikinci ayraçsız çağrı yeri #866'da
    // kalktı; gerekçe ve ölçüm dosya başındaki blokta. Bu sayı yalnız ölçümle değişir.
    expect(KANARYA.length).toBe(8)
  })

  it('KANARYA: AYRAÇLI şablonla üretilen DB sürücülü anahtarlar CANLI görülmeli', () => {
    const olu = KANARYA_AYRACLI.filter((k) => !canli(k, tarama))
    expect(
      olu,
      'Bu anahtarların canlılığı VERİTABANINDA yaşıyor: `common.categoryList.${tKey}` ve ' +
        '`pdp.specs.${specKey}` şablonlarıyla üretiliyorlar; kaynakta tam yolları GEÇMEZ. ' +
        'Ölü görünüyorlarsa sözlük değil KAPI kördür — ANY_TEMPLATE sondaki noktayı ' +
        'zorunlu-yok saymış olabilir (`a.b.${x}` biçimi). 2026-08-23’te tam bu oldu ve ' +
        '79 canlı anahtar ölü sanıldı.',
    ).toEqual([])
    expect(KANARYA_AYRACLI.length).toBe(3)
  })

  it('KANARYA: 7. eksen kapsami — ceviriye dokunmayan dosya tuketici SAYILMAZ', () => {
    // NEGATIF taraf: 'template' yalniz checkout/injectCheckoutForm.ts'te tirnakli geciyor ve
    // o dosyanin i18n ile HICBIR bagi yok. Kapsam daraltmasi bozulursa bu sozcuk yeniden
    // "tuketici" sayilir ve admin.inventory.export.template olu anahtari CANLI gorunur.
    expect(
      tarama.bareWords.has('template'),
      "'template' yalniz i18n'e dokunmayan bir dosyada tirnakli geciyor; 7. eksen kapsami " +
        'genislemis olmali. DB kolon adlari ve secenek kimlikleri tuketici SAYILMAZ.',
    ).toBe(false)

    // POZITIF taraf: 7. eksen whatsapp.ts icin VAR. Daraltma onu oldurmemeli.
    expect(
      tarama.bareWords.has('stockInquiry'),
      "whatsapp.ts sozlugun whatsappMessages agacini cast'leyip yaprak adiyla indeksliyor. " +
        'Bu sozcuk kaybolduysa daraltma cok ileri gitti ve 12 CANLI anahtar olu gorunecek.',
    ).toBe(true)

    // Daraltma GERCEKTEN oldu mu? Kapsam tum agacsa daraltma hic uygulanmamis demektir.
    expect(tarama.bareWordDosya).toBeGreaterThan(50)
    expect(tarama.bareWordDosya).toBeLessThan(tarama.tarananDosya)
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
    // Vitest assertion mesajı diziyi ~1 kaleme KIRPIYOR; 149 kalemlik bir bulguda liste
    // görünmezse bulgu doğrulanamaz. Bu döküm ortam değişkeniyle KAPALI gelir, ölçüm
    // yaparken açılır: OLU_ANAHTAR_DOK=1 npx vitest run <bu dosya>
    if (process.env.OLU_ANAHTAR_DOK === '1') console.warn('OLU_LISTE_BASI\n' + olu.join('\n') + '\nOLU_LISTE_SONU')
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

  /**
   * 7. EKSENİN DOSYA-BAĞI, KENDİ BEKÇİSİYLE (REC-127 kalem 2b).
   *
   * Bu kol `canli()`yi SENTETİK bir taramayla çağırır: yalnız 7. ekseni izole eder
   * (dictPaths/staticKeys/prefixes BOŞ). Niçin gerekli: daraltma tek bir `for` döngüsü
   * ve biri onu sadeleştirmek isteyip eski tek-satırlık hâline döndürebilir — sözlükteki
   * borç listesi bunu YAKALAMAZ, çünkü liste büyüdüğünde yeşil kalır. Kural kendi
   * bekçisini taşımalı.
   */
  it('⭐DOSYA-BAĞI — çıplak yaprak adı, ATASINI anmayan dosyadan CANLI saymaz', () => {
    const bos = { staticKeys: new Set<string>(), prefixes: [], dictPaths: [], bareWords: new Set(['warranty']), opaque: [], tarananDosya: 1, bareWordDosya: 1, eslesmeSayisi: 1 }

    // ÖLÇÜLMÜŞ VAKA: ProductDetailPageView.tsx `kimlik: 'warranty'` yazıyor ve o dosyada
    // `whyVentHub`/`badges`/`home` HİÇ geçmiyor. Alakasız dosya aklama YAPAMAZ.
    const alakasiz: Tarama = { ...bos, dosyalar: [{ yol: 'ProductDetailPageView.tsx', bareWords: new Set(['warranty']), yollar: ['pdp.trust.warranty'] }] }
    expect(
      canli('home.whyVentHub.badges.warranty', alakasiz),
      'Alakasız dosyadaki çıplak sözcük anahtarı canlı saydı — 7. eksenin dosya-bağı kalkmış. ' +
        'Bu körlük 149 ölü anahtarı gizliyordu.',
    ).toBe(false)

    // whatsapp.ts DESENİ KORUNUYOR: dosya atayı anıyorsa (dict.whatsappMessages) rescue geçerli.
    const whatsapp: Tarama = { ...bos, bareWords: new Set(['stockInquiry']), dosyalar: [{ yol: 'utils/whatsapp.ts', bareWords: new Set(['stockInquiry']), yollar: ['whatsappMessages'] }] }
    expect(
      canli('whatsappMessages.stockInquiry', whatsapp),
      '7. eksen KIRILDI: yaprak adıyla indeksleyen whatsapp.ts deseni artık korunmuyor — ' +
        'bu daraltma değil, ekseni yok etmek olur.',
    ).toBe(true)
  })
})
