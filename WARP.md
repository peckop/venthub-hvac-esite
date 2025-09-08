# WARP.md
Last updated: 2025-09-07

This file provides guidance to WARP (warp.dev) when working with code in this repository.
## ℹ️ Overview

VentHub is a Turkish HVAC e-commerce platform built with modern web technologies. It's a React SPA with TypeScript, backed by Supabase for the database, authentication, and real-time features.

**Key Technologies:**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)  
- **Styling:** Tailwind CSS with custom HVAC-themed design system
- **State Management:** React Context + Custom hooks
- **Routing:** React Router v6 with lazy loading
- **Payment:** Iyzico integration
- **Notifications:** Twilio WhatsApp Business API + SMS

## 🚀 Quick Start

```powershell
# 1. Install dependencies
pnpm install

# 2. Start development server  
pnpm dev

# 3. Run tests
pnpm test
```

## 🛠️ Essential Commands

| Command | Description | Output |
|---------|-------------|---------|
| `pnpm dev` | Start Vite dev server at localhost:5173 | Development server with HMR |
| `pnpm build` | Type-check + production build | `dist/` folder |
| `pnpm build:ci` | CI build with type checking | Optimized production bundle |
| `pnpm build:prod` | Production build with `BUILD_MODE=prod` | `dist/` folder |
| `pnpm lint` | ESLint with `--max-warnings=0` | Code quality check |
| `pnpm test` | Run Vitest unit tests | Test results |
| `pnpm test:ui` | Interactive test UI | Vitest browser interface |
| `pnpm preview` | Preview production build locally | Local server for `dist/` |
| `pnpm prepare` | Setup git hooks (husky) | Husky installed |
### Database Commands (requires Supabase CLI)

```powershell
# Local development
supabase start                    # Start local Postgres + Studio
supabase db reset                 # Reset local DB with migrations
supabase studio                   # Open database studio

# Apply migrations manually (local)
powershell -ExecutionPolicy Bypass -File .scripts/migrate.ps1
```

## 🏗️ Architecture

### High-Level Structure
```
Frontend (React SPA) ← REST API → Supabase (PostgreSQL + Auth + Functions)
         ↓
    Vite Dev Server
         ↓
   Tailwind CSS + Custom Theme
```

### Folder Structure
```
src/
├── components/          # Reusable UI components
├── pages/               # Route components (lazy-loaded)
│   ├── account/         # User account pages
│   ├── admin/           # Admin console pages
│   ├── calculators/     # HVAC calculators
│   ├── checkout/        # Checkout flow
│   ├── knowledge/       # Knowledge base
│   ├── support/         # Customer support pages
│   └── legal/           # Legal/compliance pages
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
├── lib/                 # External service integrations
│   └── supabase.ts      # Database client + types
├── i18n/                # Internationalization (TR/EN)
│   └── dictionaries/
├── test/                # Testing utilities and helpers
├── utils/               # Utility functions
└── config/              # App configuration
```

### Data Flow
```
Supabase API → Custom Hooks → Context Providers → Components → UI
                  ↓
            Local State Management (useState, useCart, useAuth)
```

### Performance Patterns
- **Lazy Loading:** Routes split with `React.lazy()` and `Suspense`
- **Code Splitting:** Vendor chunks in `vite.config.ts`
- **Error Boundaries:** Wrap async components
- **Scroll Optimization:** `useScrollThrottle` for header state
- **Toast Management:** Global `react-hot-toast` configuration

## 📐 Patterns & Conventions

### Naming Conventions
- **Components:** PascalCase (`ProductCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useCart.ts`)
- **Pages:** PascalCase with "Page" suffix (`LoginPage.tsx`)
- **Routes:** kebab-case (`/auth/forgot-password`)
- **Types/Interfaces:** PascalCase (`Product`, `Category`)

### Code Patterns

**Custom Hook Pattern:**
```typescript
// src/hooks/useCart.ts
export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addItem = useCallback((product: Product) => {
    // Implementation with toast notification
  }, [])
  
  return { items, addItem, getCartCount }
}
```

**Page Component Pattern:**
```typescript
// src/pages/ProductsPage.tsx
const ProductsPage = lazy(() => import('./ProductsPage'))

export const ProductsPage: React.FC = () => {
  // Business logic
  return (
    <div className="min-h-screen">
      {/* UI components */}
    </div>
  )
}
```

**Supabase Integration Pattern:**
```typescript
// src/lib/supabase.ts
export async function getProducts(limit?: number) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    
  if (error) throw error
  return data as Product[]
}
```

### Environment Variables
All environment variables use `VITE_` prefix for Vite bundling:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key
- `VITE_DEBUG` - Enable debug logging (dev only)
- `VITE_SHOP_WHATSAPP` - (Optional) WhatsApp phone for wa.me deeplink (e.g., 90XXXXXXXXXX)

## ⚙️ Environment Setup

### Prerequisites
- **Node.js:** ≥18.0.0
- **pnpm:** ≥8.0.0 (preferred package manager)
- **Supabase CLI:** For local database development

### Local Environment File (`.env.local`)
```bash
VITE_SUPABASE_URL=https://tnofewwkwlyjsqgwjjga.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_DEBUG=true
```

### Development Setup
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials
3. Install dependencies: `pnpm install`
4. Start dev server: `pnpm dev`

## 🗄️ Database & Migrations

### Schema Overview
Key tables in Supabase:
- `products` - HVAC product catalog
- `categories` - Hierarchical product categories  
- `venthub_orders` - Order management
- `shopping_carts` + `cart_items` - Shopping cart
- `user_profiles` - Extended user data
- `user_addresses` - Shipping/billing addresses
- `inventory_movements` - Stock tracking

### Migration Workflow
```powershell
# Local development
supabase db reset                 # Reset with all migrations
supabase db push                  # Generate migration from schema diff

# Manual migration script (Windows)
$env:SUPABASE_DB_URL="postgresql://..."
.scripts/migrate.ps1
```

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admin role has elevated permissions
- Service role used for Edge Functions

## 📦 Deployment

### Cloudflare Pages
- **Build Command:** `pnpm run build:ci`
- **Output Directory:** `dist`
- **Node Version:** 18+
- **Required Env Vars:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### GitHub Actions
- **Workflows:**
  - `ci.yml`
  - `deploy-cloudflare-pages.yml`
  - `deploy-functions.yml`
  - `supabase-migrate.yml`
- **Migration Workflow:** `.github/workflows/supabase-migrate.yml`
- **Triggers:** Push to `supabase/migrations/` or main branch
- **Required Secrets:**
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF`

### Edge Functions
Located in `supabase/functions/`:
- `admin-iyzico-reconcile`
- `admin-order-inspect`
- `admin-orders-latest`
- `admin-update-order`
- `iyzico-callback`
- `iyzico-payment`
- `iyzico-refund`
- `notification-service`
- `order-housekeeping`
- `order-validate`
- `return-status-notification`
- `shipping-notification`
- `shipping-status`
- `shipping-webhook`
- `stock-alert`

## 🔧 Development Tips

### Common Tasks

**Adding a new page:**
1. Create in `src/pages/` with lazy loading
2. Add route to `App.tsx` with `Suspense` wrapper
3. Update navigation components if needed

**Database queries:**
- Use existing functions in `src/lib/supabase.ts`
- Follow RLS patterns for user data access
- Test with both authenticated and anonymous users

**Styling:**
- Use Tailwind utilities with custom HVAC color palette
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Custom components in `src/components/`

**Testing single components:**
```powershell
pnpm test ProductCard.test.tsx
```

### Common Issues
- **Build warnings:** Check for unused imports and console.logs
- **RLS errors:** Ensure user authentication before database operations
- **Type errors:** Update `src/lib/supabase.ts` interfaces after schema changes
- **Stock operations:** Use RPC functions `set_stock()` and `adjust_stock()`

### Debug Logging
- Set `VITE_DEBUG=true` for development console output
- Edge Functions: Set `IYZICO_DEBUG=true` for payment debugging
- All PII is masked in logs for security

## 📚 Reference Links

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router v6](https://reactrouter.com/)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Change Log](docs/CHANGELOG.md)
