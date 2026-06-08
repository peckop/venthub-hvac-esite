import '@testing-library/jest-dom'

import React from 'react'
import { vi } from 'vitest'

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
  class MockMotionValue {
    private val: number
    constructor(init: number) {
      this.val = init
    }
    get(): number {
      return this.val
    }
    set(v: number): void {
      this.val = v
    }
    onChange(): () => void {
      return () => {}
    }
    clearListeners(): void {}
  }

  const useMotionValue = (init: number) => new MockMotionValue(init)
  const useTransform = (value: MockMotionValue, inputRange: number[], outputRange: number[]) => {
    return new MockMotionValue(outputRange[0] ?? 0)
  }
  const useSpring = (value: MockMotionValue | number) => {
    const val = typeof value === 'number' ? value : value.get()
    return new MockMotionValue(val)
  }
  const useInView = () => [null, false]

  const filterMotionProps = (props: Record<string, unknown>) => {
    const cleanProps: Record<string, unknown> = {}
    const motionKeys = new Set([
      'animate', 'transition', 'variants', 'initial', 'exit', 
      'whileHover', 'whileTap', 'whileInView', 'viewport', 
      'layout', 'drag', 'dragConstraints', 'dragElastic',
      'dragMomentum', 'onAnimationComplete', 'onUpdate'
    ])
    
    Object.keys(props).forEach(key => {
      if (!motionKeys.has(key)) {
        cleanProps[key] = props[key]
      }
    })
    
    if (props.style && typeof props.style === 'object') {
      const styleObj = props.style as Record<string, unknown>
      const style: Record<string, unknown> = {}
      Object.keys(styleObj).forEach(k => {
        const val = styleObj[k]
        if (val && typeof val === 'object' && 'get' in val && typeof (val as { get: () => unknown }).get === 'function') {
          style[k] = (val as { get: () => unknown }).get()
        } else {
          style[k] = val
        }
      })
      cleanProps.style = style
    }
    
    if (props.animate && typeof props.animate === 'object') {
      const animateObj = props.animate as Record<string, unknown>
      const style = { ...(cleanProps.style as Record<string, unknown> || {}) }
      if ('y' in animateObj) {
        style.transform = `translateY(${Array.isArray(animateObj.y) ? animateObj.y[0] : animateObj.y})`
      }
      cleanProps.style = style
    }
    
    return cleanProps
  }

  const MockDiv = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ children, ...props }, ref) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'div'>
    return <div {...cleanProps} ref={ref}>{children}</div>
  })
  MockDiv.displayName = 'MockMotionDiv'

  const MockButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ children, ...props }, ref) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'button'>
    return <button {...cleanProps} ref={ref}>{children}</button>
  })
  MockButton.displayName = 'MockMotionButton'

  const MockH2: React.FC<React.ComponentPropsWithoutRef<'h2'>> = ({ children, ...props }) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'h2'>
    return <h2 {...cleanProps}>{children}</h2>
  }
  MockH2.displayName = 'MockH2'

  const MockP: React.FC<React.ComponentPropsWithoutRef<'p'>> = ({ children, ...props }) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'p'>
    return <p {...cleanProps}>{children}</p>
  }
  MockP.displayName = 'MockP'

  const MockSpan: React.FC<React.ComponentPropsWithoutRef<'span'>> = ({ children, ...props }) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'span'>
    return <span {...cleanProps}>{children}</span>
  }
  MockSpan.displayName = 'MockSpan'

  const MockSection: React.FC<React.ComponentPropsWithoutRef<'section'>> = ({ children, ...props }) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'section'>
    return <section {...cleanProps}>{children}</section>
  }
  MockSection.displayName = 'MockSection'

  const MockNav: React.FC<React.ComponentPropsWithoutRef<'nav'>> = ({ children, ...props }) => {
    const cleanProps = filterMotionProps(props as Record<string, unknown>) as React.ComponentPropsWithoutRef<'nav'>
    return <nav {...cleanProps}>{children}</nav>
  }
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
    useMotionValue,
    useTransform,
    useSpring,
    useInView,
  }
})

// Mock Supabase with internal Promise tracking to avoid 'any'
vi.mock('@/lib/supabase', () => {
  const createMockQuery = () => {
    const p: Record<string, ReturnType<typeof vi.fn>> = {
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
