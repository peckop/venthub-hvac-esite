import {
  ArrowRightLeft,
  FileText,
  LucideIcon,
  Package,
  PackageSearch,
  ShoppingCart,
  Tags,
  Ticket,
  Undo2,
  Users
} from 'lucide-react'

export interface AdminResource {
  key: string
  labelKey: string
  group: 'main' | 'sales' | 'catalog' | 'stock' | 'system'
  route: string
  icon: LucideIcon
  requiredAccess: string
  searchable: boolean
  searchHintKey?: string
}

export const ADMIN_RESOURCES: AdminResource[] = [
  {
    key: 'orders',
    labelKey: 'admin.menu.orders',
    group: 'sales',
    route: '/admin/orders',
    icon: ShoppingCart,
    requiredAccess: '/admin/orders',
    searchable: true,
    searchHintKey: 'admin.search.orders'
  },
  {
    key: 'products',
    labelKey: 'admin.menu.products',
    group: 'catalog',
    route: '/admin/products',
    icon: Package,
    requiredAccess: '/admin/products',
    searchable: true,
    searchHintKey: 'admin.search.products'
  },
  {
    key: 'returns',
    labelKey: 'admin.menu.returns',
    group: 'sales',
    route: '/admin/returns',
    icon: Undo2,
    requiredAccess: '/admin/returns',
    searchable: true,
    searchHintKey: 'admin.search.returns'
  },
  {
    key: 'categories',
    labelKey: 'admin.menu.categories',
    group: 'catalog',
    route: '/admin/categories',
    icon: Tags,
    requiredAccess: '/admin/categories',
    searchable: true,
    searchHintKey: 'admin.search.categories'
  },
  {
    key: 'users',
    labelKey: 'admin.menu.users',
    group: 'system',
    route: '/admin/users',
    icon: Users,
    requiredAccess: '/admin/users',
    searchable: true,
    searchHintKey: 'admin.search.users'
  },
  {
    key: 'coupons',
    labelKey: 'admin.menu.coupons',
    group: 'sales',
    route: '/admin/coupons',
    icon: Ticket,
    requiredAccess: '/admin/coupons',
    searchable: true,
    searchHintKey: 'admin.search.coupons'
  },
  {
    key: 'movements',
    labelKey: 'admin.menu.movements',
    group: 'stock',
    route: '/admin/movements',
    icon: ArrowRightLeft,
    requiredAccess: '/admin/movements',
    searchable: true,
    searchHintKey: 'admin.search.movements'
  },
  {
    key: 'error_groups',
    labelKey: 'admin.menu.errorGroups',
    group: 'system',
    route: '/admin/error-groups',
    icon: FileText,
    requiredAccess: '/admin/error-groups',
    searchable: true,
    searchHintKey: 'admin.search.errorGroups'
  },
  {
    key: 'audit',
    labelKey: 'admin.menu.logs',
    group: 'system',
    route: '/admin/audit-logs',
    icon: FileText,
    requiredAccess: '/admin/audit-logs',
    searchable: true,
    searchHintKey: 'admin.search.audit'
  },
  {
    key: 'inventory',
    labelKey: 'admin.menu.inventory',
    group: 'stock',
    route: '/admin/inventory',
    icon: PackageSearch,
    requiredAccess: '/admin/inventory',
    searchable: true,
    searchHintKey: 'admin.search.inventory'
  }
]
