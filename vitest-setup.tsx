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
  const MockIcon: React.FC<React.ComponentPropsWithoutRef<'div'>> = (props) => <div {...props} data-testid={`lucide-${name.toLowerCase()}`} />
  MockIcon.displayName = `Lucide${name}`
  mockIcons[name] = MockIcon
})

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as Record<string, unknown>
  return {
    ...actual,
    ...mockIcons
  }
})

// Mock Framer Motion with proper Ref types and Display Names
vi.mock('framer-motion', () => {
  const MockDiv = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ children, ...props }, ref) => <div {...props} ref={ref}>{children}</div>)
  MockDiv.displayName = 'MockMotionDiv'

  const MockButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>)
  MockButton.displayName = 'MockMotionButton'

  const MockH2: React.FC<React.ComponentPropsWithoutRef<'h2'>> = ({ children, ...props }) => <h2 {...props}>{children}</h2>
  MockH2.displayName = 'MockH2'

  const MockP: React.FC<React.ComponentPropsWithoutRef<'p'>> = ({ children, ...props }) => <p {...props}>{children}</p>
  MockP.displayName = 'MockP'

  const MockSpan: React.FC<React.ComponentPropsWithoutRef<'span'>> = ({ children, ...props }) => <span {...props}>{children}</span>
  MockSpan.displayName = 'MockSpan'

  const MockSection: React.FC<React.ComponentPropsWithoutRef<'section'>> = ({ children, ...props }) => <section {...props}>{children}</section>
  MockSection.displayName = 'MockSection'

  const MockNav: React.FC<React.ComponentPropsWithoutRef<'nav'>> = ({ children, ...props }) => <nav {...props}>{children}</nav>
  MockNav.displayName = 'MockNav'

  const MockAnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
  MockAnimatePresence.displayName = 'AnimatePresence'

  return {
    motion: {
      div: MockDiv,
      button: MockButton,
      h2: MockH2,
      p: MockP,
      span: MockSpan,
      section: MockSection,
      nav: MockNav
    },
    AnimatePresence: MockAnimatePresence,
  }
})

// Mock Supabase with internal Promise tracking to avoid 'any'
vi.mock('@/lib/supabase', () => {
  const createMockQuery = () => {
    const p: Record<string, unknown> = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      maybe_single: vi.fn(),
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
    p.maybe_single.mockReturnValue(p)
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
