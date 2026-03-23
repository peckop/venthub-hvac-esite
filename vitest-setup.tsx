import { vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Mock Lucide Icons - Using proper React types
const mockIcons: Record<string, React.FC<React.ComponentPropsWithoutRef<'div'>>> = {}
const iconNames = [
  'Star', 'ChevronRight', 'ArrowLeft', 'ShoppingCart', 'Heart', 'Share2', 
  'Truck', 'Shield', 'Award', 'FileText', 'Download', 'Ruler', 'Settings', 
  'Info', 'ChevronDown', 'FolderPlus', 'Loader2', 'Grid', 'List', 'Wind', 
  'Search', 'X', 'Menu', 'User', 'Package', 'MessageSquare', 'Check', 
  'Plus', 'Minus', 'Trash2', 'AlertTriangle', 'RefreshCw', 'LogOut', 
  'CreditCard', 'MapPin', 'Bell', 'Eye', 'Filter', 'ArrowUp', 'Clock', 
  'History', 'Zap', 'MousePointerClick', 'ChevronLeft'
]

iconNames.forEach(name => {
  mockIcons[name] = (props) => <div {...props} data-testid={`lucide-${name.toLowerCase()}`} />
})

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as Record<string, unknown>
  return {
    ...actual,
    ...mockIcons
  }
})

// Mock Framer Motion with proper Ref types
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ children, ...props }, ref) => <div {...props} ref={ref}>{children}</div>),
    button: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>),
    h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: React.ComponentPropsWithoutRef<'span'>) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: React.ComponentPropsWithoutRef<'section'>) => <section {...props}>{children}</section>,
    nav: ({ children, ...props }: React.ComponentPropsWithoutRef<'nav'>) => <nav {...props}>{children}</nav>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock Supabase with internal Promise tracking to avoid 'any'
vi.mock('@/lib/supabase', () => {
  const createMockQuery = () => {
    const p = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      match: vi.fn(),
      in: vi.fn(),
      or: vi.fn(),
      then: vi.fn()
    }
    p.select.mockReturnValue(p)
    p.insert.mockReturnValue(p)
    p.update.mockReturnValue(p)
    p.delete.mockReturnValue(p)
    p.eq.mockReturnValue(p)
    p.order.mockReturnValue(p)
    p.limit.mockReturnValue(p)
    p.single.mockReturnValue(p)
    p.maybeSingle.mockReturnValue(p)
    p.match.mockReturnValue(p)
    p.in.mockReturnValue(p)
    p.or.mockReturnValue(p)
    p.then.mockImplementation((cb: (res: { data: unknown[], error: null }) => void) => cb({ data: [], error: null }))
    return p
  }

  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
      },
      from: vi.fn(createMockQuery),
      rpc: vi.fn()
    }
  }
})
