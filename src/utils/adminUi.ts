/**
 * ADMIN UI SINIF SABİTLERİ — tek kaynak (SSOT)
 *
 * 2026-08-15 GÖRSEL KALİBRASYON (Faz 3). Neden yeniden yazıldı:
 *
 * 1. **Tema körlüğü.** Buradaki her sabit `text-white`, `text-slate-*`,
 *    `bg-white/N`, `glass-strong` gibi SABİT KOYU değerler taşıyordu. Bunlar
 *    hiçbir temayla dönmez; "açık tema varsayılan" kararı bu katman semantik
 *    token'lara taşınmadan uygulanamazdı. Artık `admin-*` renkleri kullanılıyor
 *    (`src/index.css` → `[data-admin-theme]`).
 * 2. **Tipografi.** Başlık, gövde, tablo hücresi, buton, etiket — HEPSİ
 *    `font-black` + `uppercase` + `tracking-widest` idi. Her şey vurguluysa
 *    hiçbir şey vurgulu değildir; hiyerarşi ağırlıkla kurulur.
 *    `uppercase` yalnız TABLO BAŞLIĞI ve ETİKET sabitlerinde, ölçülü
 *    `tracking-wide` ile korundu (kurumsal panellerde yerleşik desen).
 *    Bileşen dosyalarında `uppercase` yasak — kapı: admin-theme-invariants.
 * 3. **Yoğunluk.** Tablo satırı `px-6 py-5` ≈ 60px idi; kurumsal norm 40px.
 *    Ekrana sığan satır sayısı yönetim panelinde doğrudan iş hızıdır.
 * 4. **Gölge.** `shadow-[0_0_40px_rgba(0,0,0,0.3)]` Y-kayması SIFIR olan bir
 *    GLOW'du (ışık kaynağı yok). Gerçek yükseklik ölçeğine geçildi.
 * 5. **`adminInputClass` hayalet boşluğu.** `pl-11` taşıyordu ama 12 tüketicinin
 *    yalnız 2'sinde önde ikon var; kalan 10 form alanında 44px boş sol iç
 *    boşluk bırakıyordu. İkonlu varyant ayrıldı → `adminInputWithIconClass`.
 *
 * Cetvel: docs/standards/admin-design-standard.md §3 (özellikle §3.1 yoğunluk, §3.2 tipografi, §3.8 tema)
 */

/* ── Sayfa başlıkları ─────────────────────────────────────────────── */
export const adminSectionTitleClass = 'text-2xl font-semibold tracking-tight text-admin-fg'
export const adminSubtitleClass = 'text-sm text-admin-fg-muted mt-1.5 leading-relaxed max-w-2xl'

/* ── Yüzeyler ─────────────────────────────────────────────────────── */
/**
 * `glass-strong` KALDIRILDI: yarı saydam koyu bir katmandı (`rgba(13,20,38,0.8)`),
 * açık temada okunmaz hale geliyordu ve `backdrop-filter` her kartta ayrı bir
 * kompozisyon katmanı doğurduğu için uzun listelerde kaydırmayı yavaşlatıyordu.
 * Yönetim paneli yüzeyi OPAK olmalı — arkasında görülmesi gereken bir şey yok.
 */
export const adminCardClass =
  'bg-admin-surface border border-admin-border rounded-admin-lg shadow-admin-sm transition-colors'
export const adminCardPaddedClass = `${adminCardClass} p-6`

/* ── Tablo ────────────────────────────────────────────────────────── */
export const adminTableHeadCellClass =
  'text-left px-4 py-2.5 text-xs font-medium text-admin-fg-muted uppercase tracking-wide ' +
  'bg-admin-surface-2 border-b border-admin-border whitespace-nowrap'
export const adminTableCellClass =
  'px-4 py-2.5 text-sm text-admin-fg align-middle border-b border-admin-border ' +
  'group-hover:bg-admin-surface-2 transition-colors'
export const adminTableContainerClass =
  'relative overflow-hidden bg-admin-surface rounded-admin-lg border border-admin-border shadow-admin-sm'

/* ── Butonlar ─────────────────────────────────────────────────────── */
/**
 * Odak halkası `focus-visible:` ile — `focus:` klavye kullanmayan fare
 * tıklamasında da halka çizerdi. Halka `ring-offset` ile yüzeyden ayrılır,
 * böylece koyu temada da görünür (SC 2.4.13 Focus Appearance).
 */
const buttonBaseClass =
  'inline-flex justify-center items-center gap-2 px-4 h-9 rounded-admin-md text-sm font-medium ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export const adminButtonPrimaryClass =
  `${buttonBaseClass} bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover`
export const adminButtonSecondaryClass =
  `${buttonBaseClass} bg-admin-surface border border-admin-border text-admin-fg ` +
  'hover:bg-admin-surface-2 hover:border-admin-border-strong'

/* ── Satır içi tablo aksiyonları (daha küçük ölçek) ──────────────── */
const tableActionBaseClass =
  'inline-flex justify-center items-center gap-1.5 px-2.5 h-8 rounded-admin-sm text-xs font-medium ' +
  'transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-admin-ring focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export const adminTableActionClass =
  `${tableActionBaseClass} bg-admin-surface border border-admin-border text-admin-fg-muted ` +
  'hover:bg-admin-surface-2 hover:text-admin-fg'
export const adminTableActionDangerClass =
  `${tableActionBaseClass} bg-admin-danger-weak border border-admin-danger/25 text-admin-danger ` +
  'hover:bg-admin-danger hover:text-admin-danger-fg'
export const adminTableActionPrimaryClass =
  `${tableActionBaseClass} bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover`
export const adminTableActionWarningClass =
  `${tableActionBaseClass} bg-admin-warning-weak border border-admin-warning/25 text-admin-warning ` +
  'hover:bg-admin-warning hover:text-admin-warning-fg'

/* ── Form alanları ────────────────────────────────────────────────── */
const fieldBaseClass =
  'w-full bg-admin-surface border border-admin-border rounded-admin-md text-sm text-admin-fg ' +
  'transition-colors placeholder:text-admin-fg-subtle ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring/35 ' +
  'focus-visible:border-admin-accent disabled:opacity-60 disabled:cursor-not-allowed'

export const adminInputClass = `${fieldBaseClass} px-3 py-2`
/** Önünde mutlak konumlu ikon bulunan alanlar için (yalnız arama kutuları). */
export const adminInputWithIconClass = `${fieldBaseClass} pl-10 pr-3 py-2`
export const adminSelectClass =
  `${fieldBaseClass} pl-3 pr-9 py-2 cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center]`

/**
 * Açılır ok'un rengi nötr griye çevrildi (eskiden marka cyan'ıydı ve açık
 * zeminde kayboluyordu). data: URI `currentColor` alamaz; iki temada da
 * okunan tek bir orta gri seçildi.
 */
export const adminSelectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23787f8c' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
  backgroundSize: '0.875rem',
}

export const adminSettingsLabelClass =
  'block text-xs font-medium text-admin-fg-muted uppercase tracking-wide mb-2'

export const adminTableScrollAreaClass = 'overflow-y-auto max-h-400px'

/* ── DataTableKit envanter kolon token'ları ───────────────────────── */
// `adminTableMinWidthClass = 'min-w-[1000px]'` SİLİNDİ (2026-08-15): tüketicisi
// kalmamıştı (InventoryTable DataTableKit'e göçtü) ve arbitrary değerdi. Yeniden
// ihtiyaç olursa `overflow-x-auto` bir kapsayıcı OLMADAN kullanılması yatay kesme
// üretir — cetvel §2.3. Yeni min-genişlik gerekirse tokens.js'ten türet.
export const adminSupplierMaxWidthClass = 'max-w-[120px]'
export const adminInputWidthLocationClass = 'w-20'
export const adminInputWidthSupplierClass = 'w-24'

/* ── Adım göstergesi ──────────────────────────────────────────────── */
export const adminStepperLineBgClass =
  'absolute left-10% right-10% top-1/2 -translate-y-1/2 h-0.5 bg-admin-border -z-10 rounded-full'
export const adminStepperLineFillClass =
  'absolute left-10% top-1/2 -translate-y-1/2 h-0.5 bg-admin-accent -z-10 transition-transform duration-700 rounded-full'

/* ── Modal ────────────────────────────────────────────────────────── */
/**
 * Modal GÖVDESİNİN kabı: yüksekliğini ebeveynden alır (`flex-1 min-h-0`), kendi
 * `max-h`'ini DAYATMAZ.
 *
 * Eskiden `max-h-70vh` vardı ve dış `Dialog.Content`'te `max-h` YOKTU → toplam
 * yükseklik başlık + 70vh + altbilgi > viewport oluyordu; ortalanmış
 * (`-translate-y-1/2`) kutunun ÜST kısmı ekran dışına taşıp **erişilemez** kalıyordu
 * (2026-08-15 taraması: 5 modalda ölçüldü). Tavan artık dış kutuda ve `svh` tabanlı.
 * `p-10` de 320px viewport'ta içeriğe yalnız 240px bırakıyordu → `p-5 md:p-6`.
 * Cetvel: docs/standards/admin-design-standard.md §2.2, §4.10
 */
export const adminModalScrollAreaClass = 'p-5 md:p-6 space-y-6 min-h-0 overflow-y-auto custom-scrollbar'

/**
 * Modal DIŞ kutusu — ortalanmış, viewport'u asla taşmayan, dikeyde esneyen kap.
 * Gövde `flex-1 ${adminModalScrollAreaClass}` ile buraya oturur.
 */
export const adminModalContentClass =
  'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal ' +
  'flex flex-col overflow-hidden max-h-admin-modal ' +
  'bg-admin-surface border border-admin-border rounded-admin-lg shadow-admin-overlay'

/* ── Kanban panosu ────────────────────────────────────────────────── */
export const adminBgWhite2Class = 'bg-admin-surface-2'
export const adminBgWhite3Class = 'bg-admin-surface-2'
export const adminBgWhite6Class = 'bg-admin-surface-3'

export const adminColumnContainerClass =
  'flex flex-col w-full md:w-320px shrink-0 bg-admin-surface-2 border border-admin-border ' +
  'rounded-admin-lg overflow-hidden transition-colors'
export const adminOrderCardClass =
  'bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3 shadow-admin-sm'
export const adminNoteItemClass =
  'p-3 bg-admin-surface-2 rounded-admin-md border border-admin-border group hover:border-admin-border-strong transition-colors'
export const adminOrderBoardItemClass =
  'bg-admin-surface border-admin-border hover:border-admin-border-strong hover:bg-admin-surface-2 shadow-admin-sm'

/* ── Rapor & ayarlar ──────────────────────────────────────────────── */
export const adminTableCellTruncate150Class = 'max-w-150px'
export const adminInputThresholdClass = 'max-w-120px !text-center !text-base !font-semibold'
export const adminInputTimeoutClass = 'text-base font-semibold'
/**
 * `adminBlurBlobClass` SİLİNDİ (2026-08-15): kartların köşesine 256px'lik
 * bulanık renkli bir daire koyan tamamen DEKORATİF bir katmandı (5 çağrı yeri).
 * Nötr kurumsal yönde karşılığı yok, açık zeminde kirli bir leke bırakıyor ve
 * her kartta ayrı bir `blur-3xl` kompozisyon katmanı doğuruyordu.
 * Çağrı yerlerindeki `<div/>`'ler de kaldırıldı — sınıfı 'hidden' yapıp
 * işaretlemeyi bırakmak ölü DOM üretirdi.
 */

/* ── CategoryBuilder yerleşim token'ları ──────────────────────────── */
export const adminSidebarWidthClass = 'w-480px'
export const adminMobilePreviewClass = 'w-320px h-568px'
export const adminContentMaxWidthClass = 'max-w-content'
