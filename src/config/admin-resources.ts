import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Calculator,
  ClipboardList,
  Coins,
  FileText,
  LucideIcon,
  Package,
  PackageSearch,
  Percent,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  Ticket,
  Truck,
  Undo2,
  Users,
  Webhook
} from 'lucide-react'

/**
 * ADMIN KAYNAK REGISTRY'Sİ — TEK KAYNAK (SSOT).
 *
 * Cetvel `admin-standard.md §10.4 S1`: "Nav öğeleri + aranabilir kaynaklar + hızlı
 * aksiyonlar TEK listeden. Sidebar + komut paleti aynı registry'yi tüketir →
 * **kopya nav listesi yasak.**"
 *
 * Bu dosya hem `AdminSidebar`'ı hem `CommandPalette`'i hem breadcrumb'ı besler.
 * Yeni admin rotası eklerken buraya da ekle — aksi halde rota menüden erişilemez.
 * (2026-08-15 denetimi: 21 rotanın 7'si hiçbir menüde görünmüyordu, çünkü
 * `AdminLayout` registry yerine kendi kopya listesini taşıyordu.)
 */

export type AdminResourceGroup =
  | 'main'
  | 'sales'
  | 'catalog'
  | 'pricing'
  | 'stock'
  | 'system'

export interface AdminResource {
  key: string
  labelKey: string
  group: AdminResourceGroup
  route: string
  icon: LucideIcon
  /** RBAC kapısı — `useRole().canAccess(requiredAccess)` ile sorgulanır. */
  requiredAccess: string
  /** Komut paletinin federe aramasına dahil mi? */
  searchable: boolean
  searchHintKey?: string
  /**
   * Sol navigasyonda görünür mü? `false` = yalnız derin bağlantı / komut paleti
   * (ör. dinamik segment taşıyan kategori builder'ı).
   */
  inNav: boolean
  /**
   * Aktif eşleme yalnız tam eşitlikle mi yapılsın? Kök rota (`/admin`) için
   * ZORUNLU — aksi halde her alt sayfada eşleşir. Cetvel §2.6.
   */
  exact?: boolean
  /** Breadcrumb zinciri için üst kaynak. */
  parentKey?: string
}

export const ADMIN_RESOURCES: AdminResource[] = [
  // ─── Ana ──────────────────────────────────────────────────────────────────
  {
    key: 'dashboard',
    labelKey: 'admin.menu.dashboard',
    group: 'main',
    route: '/admin',
    icon: BarChart3,
    requiredAccess: '/admin',
    searchable: false,
    inNav: true,
    exact: true
  },

  // ─── Satış & Operasyon ────────────────────────────────────────────────────
  {
    key: 'orders',
    labelKey: 'admin.menu.orders',
    group: 'sales',
    route: '/admin/orders',
    icon: ShoppingCart,
    requiredAccess: '/admin/orders',
    searchable: true,
    searchHintKey: 'admin.search.orders',
    inNav: true
  },
  {
    key: 'logistics',
    labelKey: 'admin.menu.logistics',
    group: 'sales',
    route: '/admin/logistics',
    icon: Truck,
    requiredAccess: '/admin/logistics',
    searchable: false,
    inNav: true
  },
  {
    key: 'returns',
    labelKey: 'admin.menu.returns',
    group: 'sales',
    route: '/admin/returns',
    icon: Undo2,
    requiredAccess: '/admin/returns',
    searchable: true,
    searchHintKey: 'admin.search.returns',
    inNav: true
  },
  {
    // T067: teklif kuyruğu. labelKey ana sözlükte yaşar (quotes.admin.*) — admin/*
    // sözlük dosyaları başka şeridin mülkü, çözücü birleşik kökten okuduğu için eşdeğer.
    key: 'quotes',
    labelKey: 'quotes.admin.navLabel',
    group: 'sales',
    route: '/admin/quotes',
    icon: FileText,
    requiredAccess: '/admin/quotes',
    searchable: true,
    inNav: true
  },
  {
    key: 'coupons',
    labelKey: 'admin.menu.coupons',
    group: 'sales',
    route: '/admin/coupons',
    icon: Ticket,
    requiredAccess: '/admin/coupons',
    searchable: true,
    searchHintKey: 'admin.search.coupons',
    inNav: true
  },

  // ─── Katalog ──────────────────────────────────────────────────────────────
  {
    key: 'products',
    labelKey: 'admin.menu.products',
    group: 'catalog',
    route: '/admin/products',
    icon: Package,
    requiredAccess: '/admin/products',
    searchable: true,
    searchHintKey: 'admin.search.products',
    inNav: true
  },
  {
    key: 'categories',
    labelKey: 'admin.menu.categories',
    group: 'catalog',
    route: '/admin/categories',
    icon: Tags,
    requiredAccess: '/admin/categories',
    searchable: true,
    searchHintKey: 'admin.search.categories',
    inNav: true
  },
  {
    // Dinamik segment taşır (`/admin/categories/[id]/builder`) → menüde yer almaz,
    // ama breadcrumb zincirinde görünür.
    key: 'category_builder',
    labelKey: 'admin.menu.categoryBuilder',
    group: 'catalog',
    route: '/admin/categories',
    icon: ClipboardList,
    requiredAccess: '/admin/categories',
    searchable: false,
    inNav: false,
    parentKey: 'categories'
  },

  // ─── Fiyatlandırma ────────────────────────────────────────────────────────
  {
    key: 'pricing',
    labelKey: 'admin.menu.pricing',
    group: 'pricing',
    route: '/admin/pricing',
    icon: Coins,
    requiredAccess: '/admin/pricing',
    searchable: false,
    inNav: true,
    exact: true
  },
  {
    key: 'pricing_rules',
    labelKey: 'admin.menu.pricingRules',
    group: 'pricing',
    route: '/admin/pricing/rules',
    icon: Percent,
    requiredAccess: '/admin/pricing',
    searchable: false,
    inNav: true,
    parentKey: 'pricing'
  },
  {
    key: 'pricing_preview',
    labelKey: 'admin.menu.pricingPreview',
    group: 'pricing',
    route: '/admin/pricing/preview',
    icon: Calculator,
    requiredAccess: '/admin/pricing',
    searchable: false,
    inNav: true,
    parentKey: 'pricing'
  },

  // ─── Stok & Envanter ──────────────────────────────────────────────────────
  {
    key: 'inventory',
    labelKey: 'admin.menu.inventory',
    group: 'stock',
    route: '/admin/inventory',
    icon: PackageSearch,
    requiredAccess: '/admin/inventory',
    searchable: true,
    searchHintKey: 'admin.search.inventory',
    inNav: true,
    exact: true
  },
  {
    key: 'inventory_report',
    labelKey: 'admin.menu.inventoryReport',
    group: 'stock',
    route: '/admin/inventory/report',
    icon: FileText,
    requiredAccess: '/admin/inventory/report',
    searchable: false,
    inNav: true,
    parentKey: 'inventory'
  },
  {
    key: 'inventory_settings',
    labelKey: 'admin.menu.inventorySettings',
    group: 'stock',
    route: '/admin/inventory/settings',
    icon: SlidersHorizontal,
    requiredAccess: '/admin/inventory/settings',
    searchable: false,
    inNav: true,
    parentKey: 'inventory'
  },
  {
    key: 'movements',
    labelKey: 'admin.menu.movements',
    group: 'stock',
    route: '/admin/movements',
    icon: ArrowRightLeft,
    requiredAccess: '/admin/movements',
    searchable: true,
    searchHintKey: 'admin.search.movements',
    inNav: true
  },

  // ─── Sistem & Yönetim ─────────────────────────────────────────────────────
  {
    key: 'users',
    labelKey: 'admin.menu.users',
    group: 'system',
    route: '/admin/users',
    icon: Users,
    requiredAccess: '/admin/users',
    searchable: true,
    searchHintKey: 'admin.search.users',
    inNav: true
  },
  {
    key: 'settings',
    labelKey: 'admin.menu.settings',
    group: 'system',
    route: '/admin/settings',
    icon: Settings,
    requiredAccess: '/admin/settings',
    searchable: false,
    inNav: true
  },
  {
    key: 'audit',
    labelKey: 'admin.menu.logs',
    group: 'system',
    route: '/admin/audit-logs',
    icon: FileText,
    requiredAccess: '/admin/audit-logs',
    searchable: true,
    searchHintKey: 'admin.search.audit',
    inNav: true
  },
  {
    key: 'errors',
    labelKey: 'admin.menu.errors',
    group: 'system',
    route: '/admin/errors',
    icon: AlertTriangle,
    requiredAccess: '/admin/errors',
    searchable: false,
    inNav: true
  },
  {
    key: 'error_groups',
    labelKey: 'admin.menu.errorGroups',
    group: 'system',
    route: '/admin/error-groups',
    icon: FileText,
    requiredAccess: '/admin/error-groups',
    searchable: true,
    searchHintKey: 'admin.search.errorGroups',
    inNav: true
  },
  {
    key: 'webhook_events',
    labelKey: 'admin.menu.webhookEvents',
    group: 'system',
    route: '/admin/webhook-events',
    icon: Webhook,
    requiredAccess: '/admin/webhook-events',
    searchable: false,
    inNav: true
  }
]

/** Sol navigasyondaki grup sırası + başlık anahtarları. */
export const ADMIN_NAV_GROUPS: ReadonlyArray<{
  key: AdminResourceGroup
  labelKey: string
}> = [
  { key: 'main', labelKey: 'admin.menu.groupMain' },
  { key: 'sales', labelKey: 'admin.menu.groupSales' },
  { key: 'catalog', labelKey: 'admin.menu.groupCatalog' },
  { key: 'pricing', labelKey: 'admin.menu.groupPricing' },
  { key: 'stock', labelKey: 'admin.menu.groupStock' },
  { key: 'system', labelKey: 'admin.menu.groupSystem' }
]

/**
 * Bir rota bu kaynağı aktif kılıyor mu?
 *
 * Cetvel §2.6: `pathname === route || pathname.startsWith(route + '/')`.
 * Kök rota (`/admin`) `exact` işaretli olmak ZORUNDA — aksi halde her alt sayfada
 * eşleşir. Tam-eşitlik hatası 2026-08-15 denetiminde ölçüldü: alt rotalarda
 * (`/admin/inventory/report`, `/admin/categories/{id}/builder`) menü tamamen ölüydü.
 */
export function isResourceActive(resource: AdminResource, pathname: string): boolean {
  if (!pathname) return false
  if (resource.exact) return pathname === resource.route
  return pathname === resource.route || pathname.startsWith(resource.route + '/')
}

/**
 * Verilen rotada `aria-current="page"` alacak TEK kaynak.
 *
 * MDN: *"Only mark one element in a set of elements as current with `aria-current`."*
 * Bu yüzden birden çok eşleşme olduğunda **en derin** (en uzun rotalı) kaynak kazanır;
 * ataları yalnız görsel olarak vurgulanır (`data-active-ancestor`), `aria-current` almaz.
 */
export function findCurrentResource(pathname: string): AdminResource | undefined {
  const matches = ADMIN_RESOURCES.filter((r) => r.inNav && isResourceActive(r, pathname))
  if (matches.length === 0) return undefined
  return matches.reduce((deepest, r) => (r.route.length > deepest.route.length ? r : deepest))
}

/**
 * Breadcrumb zinciri — kökten yaprağa. Cetvel §2.6: breadcrumb'ın koşulu hiyerarşi
 * derinliğidir; sidebar zaten 1. seviyeyi gösterdiği için zincir 2'den kısa olduğunda
 * çağıran taraf breadcrumb'ı render etmez.
 */
export function buildBreadcrumbTrail(pathname: string): AdminResource[] {
  const current = findCurrentResource(pathname)
  if (!current) return []
  const trail: AdminResource[] = [current]
  let cursor = current
  const guard = new Set<string>([current.key])
  while (cursor.parentKey) {
    const parent = ADMIN_RESOURCES.find((r) => r.key === cursor.parentKey)
    if (!parent || guard.has(parent.key)) break
    guard.add(parent.key)
    trail.unshift(parent)
    cursor = parent
  }
  return trail
}
