# AGENTS.md

This file defines the strict architectural rules, boundaries, and best practices for any AI Agent (e.g., JULES) operating in the VentHub HVAC e-commerce repository.

## 1. Project Identity & Stack
- **Project**: VentHub (HVAC E-commerce Platform)
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS (Strictly Tailwind, NO plain CSS files unless core globals)
- **Backend/DB**: Supabase (PostgreSQL, Edge Functions)
- **Testing**: Vitest, Playwright
- **Language**: TypeScript (Strict mode enabled)
- **i18n**: Custom dictionary-based i18n (`src/i18n/dictionaries/tr.ts` as primary)

## 2. Code Standards & Hard Rules
🚨 **NEVER ignore these rules:**
- **No Hardcoded Strings**: All user-facing text MUST go through the `useI18n()` hook. Do not hardcode Turkish or English strings into TSX files.
- **Strict TypeScript**: Do NOT use `any`. Define proper interfaces/types for all props, states, and DB models.
- **No Unapproved Packages**: Do NOT add new npm packages (`pnpm install`) unless explicitly requested by the user.
- **Tailwind Only**: Component styles must be built using standard Tailwind utility classes.

## 3. Component Architecture
- Place components in their respective structural domains inside `src/components/`:
  - `/admin`: Admin dashboard components
  - `/products`: Product cards, showcases, visual models
  - `/navigation`: Headers, menus, category flows
  - `/ui`: Reusable primitive components (buttons, dialogs)
- Custom Hooks go to `src/hooks/`, starting with `use`.
- Utilities go to `src/utils/`.

## 4. Supabase & Database Security (Row Level Security - RLS)
- **RLS MUST BE ENABLED** for all new tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- **SELECT Policies**:
  - `public` data (e.g., products) can have a `SELECT TO public` policy.
  - User-specific data (e.g., orders) MUST be restricted: `USING (user_id = (SELECT auth.uid()))`.
- **INSERT/UPDATE/DELETE Policies**:
  - Only allowed for authenticated users with 'admin' or 'superadmin' roles (check `user_profiles.role`).
- **Performance**: Wrap `auth.uid()` calls with `(SELECT auth.uid())` to enable initplan optimization.
- **No Destructive Operations**: Do NOT write migrations that `DROP` tables or `DROP` critical columns without explicit user consent.

## 5. CI/CD Requirements
Before suggesting or opening a Pull Request, you MUST ensure that the following commands pass successfully:
1. `pnpm run lint` or `pnpm run lint:ci`
2. `pnpm exec tsc -b tsconfig.build.json` (Type check)
3. `pnpm test -- --run` (Unit tests)
4. `pnpm run build:ci` (Production build)

If any of these fail, you MUST fix the errors before finalizing your task.

## 6. JULES Çalışma Prensipleri & Dalga (Wave) Modeli
🚨 **JULES (AI Agent) için Kesin Kurallar:**
1. **ZORUNLU MASTER SYNC:** Herhangi bir koda dokunmadan veya yeni bir PR açmadan ÖNCE, ortamı mutlaka `master` dalının **en güncel** haliyle eşitlemelisin. (`git fetch origin master` ve `git checkout -b <görev-dali> origin/master`). Eski bir daldan veya senkronize olmayan yerel bir kopyadan ASLA işleme başlama.
2. **Dalga (Wave) Kapsamı:** Sana verilen bir görevde hedef dizin (örn. `Dalga 1: src/views/admin/`) belirtilecek. Belirtilen bu dizin DIŞINDAKİ hiçbir dosyaya müdahale EDEMEZSİN.
3. **PR Boyut Limiti:** Tek bir PR devasa olmamalı. Çoklu dosyalarda çalışıyorsan ve diff çok büyüyorsa (100+ satır), görevi parçalara ayırarak sıralı PR'lar aç.
4. **Dosya Silme Yasağı:** Projeden ASLA `.ts`, `.tsx`, `.css` vb. dosyaları tamamen SİLME (özel olarak emredilmedikçe). Sadece dosya içi temizlik/düzenleme yapabilirsin.
