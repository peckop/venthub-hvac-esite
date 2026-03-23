import { vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock Lucide Icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as any
  return {
    ...actual,
    Star: (props: any) => <div {...props} data-testid="lucide-star" />,
    ChevronRight: (props: any) => <div {...props} data-testid="lucide-chevron-right" />,
    ArrowLeft: (props: any) => <div {...props} data-testid="lucide-arrow-left" />,
    ShoppingCart: (props: any) => <div {...props} data-testid="lucide-shopping-cart" />,
    Heart: (props: any) => <div {...props} data-testid="lucide-heart" />,
    Share2: (props: any) => <div {...props} data-testid="lucide-share" />,
    Truck: (props: any) => <div {...props} data-testid="lucide-truck" />,
    Shield: (props: any) => <div {...props} data-testid="lucide-shield" />,
    Award: (props: any) => <div {...props} data-testid="lucide-award" />,
    FileText: (props: any) => <div {...props} data-testid="lucide-file-text" />,
    Download: (props: any) => <div {...props} data-testid="lucide-download" />,
    Ruler: (props: any) => <div {...props} data-testid="lucide-ruler" />,
    Settings: (props: any) => <div {...props} data-testid="lucide-settings" />,
    Info: (props: any) => <div {...props} data-testid="lucide-info" />,
    ChevronDown: (props: any) => <div {...props} data-testid="lucide-chevron-down" />,
    FolderPlus: (props: any) => <div {...props} data-testid="lucide-folder-plus" />,
    Loader2: (props: any) => <div {...props} data-testid="lucide-loader2" />,
    Grid: (props: any) => <div {...props} data-testid="lucide-grid" />,
    List: (props: any) => <div {...props} data-testid="lucide-list" />,
    Wind: (props: any) => <div {...props} data-testid="lucide-wind" />,
    Search: (props: any) => <div {...props} data-testid="lucide-search" />,
    X: (props: any) => <div {...props} data-testid="lucide-x" />,
    Menu: (props: any) => <div {...props} data-testid="lucide-menu" />,
    User: (props: any) => <div {...props} data-testid="lucide-user" />,
    Package: (props: any) => <div {...props} data-testid="lucide-package" />,
    MessageSquare: (props: any) => <div {...props} data-testid="lucide-message-square" />,
    Check: (props: any) => <div {...props} data-testid="lucide-check" />,
    Plus: (props: any) => <div {...props} data-testid="lucide-plus" />,
    Minus: (props: any) => <div {...props} data-testid="lucide-minus" />,
    Trash2: (props: any) => <div {...props} data-testid="lucide-trash2" />,
    AlertTriangle: (props: any) => <div {...props} data-testid="lucide-alert-triangle" />,
    RefreshCw: (props: any) => <div {...props} data-testid="lucide-refresh-cw" />,
    LogOut: (props: any) => <div {...props} data-testid="lucide-log-out" />,
    CreditCard: (props: any) => <div {...props} data-testid="lucide-credit-card" />,
    MapPin: (props: any) => <div {...props} data-testid="lucide-map-pin" />,
    Bell: (props: any) => <div {...props} data-testid="lucide-bell" />,
    Eye: (props: any) => <div {...props} data-testid="lucide-eye" />,
    Filter: (props: any) => <div {...props} data-testid="lucide-filter" />,
    ArrowUp: (props: any) => <div {...props} data-testid="lucide-arrow-up" />,
    Clock: (props: any) => <div {...props} data-testid="lucide-clock" />,
    History: (props: any) => <div {...props} data-testid="lucide-history" />,
    Zap: (props: any) => <div {...props} data-testid="lucide-zap" />,
    MousePointerClick: (props: any) => <div {...props} data-testid="lucide-mouse-pointer-click" />,
    ChevronLeft: (props: any) => <div {...props} data-testid="lucide-chevron-left" />
  }
})

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn((_table: string) => {
      const p: any = {}
      p.select = vi.fn().mockReturnValue(p)
      p.insert = vi.fn().mockReturnValue(p)
      p.update = vi.fn().mockReturnValue(p)
      p.delete = vi.fn().mockReturnValue(p)
      p.eq = vi.fn().mockReturnValue(p)
      p.order = vi.fn().mockReturnValue(p)
      p.limit = vi.fn().mockReturnValue(p)
      p.single = vi.fn().mockReturnValue(p)
      p.maybeSingle = vi.fn().mockReturnValue(p)
      p.match = vi.fn().mockReturnValue(p)
      p.in = vi.fn().mockReturnValue(p)
      p.or = vi.fn().mockReturnValue(p)
      p.then = vi.fn().mockImplementation((cb: any) => cb({ data: [], error: null }))
      return p
    }),
    rpc: vi.fn()
  }
}))
