import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Create stable mock objects for Next.js navigation
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

const mockSearchParams = {
  get: vi.fn((key: string) => null),
  getAll: vi.fn(() => []),
  has: vi.fn(() => false),
  forEach: vi.fn(),
  entries: vi.fn(() => [].entries()),
  keys: vi.fn(() => [].keys()),
  values: vi.fn(() => [].values()),
  toString: vi.fn(() => ""),
};

// Mock next/navigation
vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn(() => mockRouter),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => mockSearchParams),
    useParams: vi.fn(() => ({})),
  }
})

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(() => Promise.resolve()),
      language: 'tr',
    },
  })),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Helper to create a fluent mock chain that is also a Promise
const createMockChain = (data: any = []) => {
  const p: any = Promise.resolve({ data, error: null });
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'limit', 'single', 'maybeSingle', 'match', 'range'];
  methods.forEach(m => {
    p[m] = vi.fn().mockReturnValue(p);
  });
  return p;
};

vi.mock('./src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => createMockChain()),
  },
}))

// ResizeObserver mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
