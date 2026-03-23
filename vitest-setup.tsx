/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock Lucide Icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as any
  return {
    ...actual,
    Star: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-star" />,
    ChevronRight: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-chevron-right" />,
    ArrowLeft: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-arrow-left" />,
    ShoppingCart: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-shopping-cart" />,
    Heart: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-heart" />,
    Share2: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-share" />,
    Truck: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-truck" />,
    Shield: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-shield" />,
    Award: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-award" />,
    FileText: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-file-text" />,
    Download: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-download" />,
    Ruler: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-ruler" />,
    Settings: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-settings" />,
    Info: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-info" />,
    ChevronDown: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-chevron-down" />,
    FolderPlus: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-folder-plus" />,
    Loader2: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-loader2" />,
    Grid: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-grid" />,
    List: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-list" />,
    Wind: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-wind" />,
    Search: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-search" />,
    X: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-x" />,
    Menu: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-menu" />,
    User: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-user" />,
    Package: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-package" />,
    MessageSquare: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-message-square" />,
    Check: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-check" />,
    Plus: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-plus" />,
    Minus: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-minus" />,
    Trash2: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-trash2" />,
    AlertTriangle: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-alert-triangle" />,
    RefreshCw: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-refresh-cw" />,
    LogOut: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-log-out" />,
    CreditCard: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-credit-card" />,
    MapPin: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-map-pin" />,
    Bell: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-bell" />,
    Eye: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-eye" />,
    Filter: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-filter" />,
    ArrowUp: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-arrow-up" />,
    Clock: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-clock" />,
    History: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-history" />,
    Zap: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-zap" />,
    MousePointerClick: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-mouse-pointer-click" />,
    ChevronLeft: (props: Record<string, unknown>) => <div {...props} data-testid="lucide-chevron-left" />
  }
})

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <section {...props}>{children}</section>,
    nav: ({ children, ...props }: Record<string, unknown> & { children: React.ReactNode }) => <nav {...props}>{children}</nav>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
      const p: Record<string, unknown> = {}
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
      p.then = vi.fn().mockImplementation((cb: (res: { data: unknown[], error: null }) => void) => cb({ data: [], error: null }))
      return p
    }),
    rpc: vi.fn()
  }
}))
