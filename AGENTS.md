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

## 🚨 HARD RULES (KIRILMAZ KURALLAR)
1. **Registry-First Disiplini:** Herhangi bir koda (src/) dokunmadan önce MUTLAKA `registry/` klasöründeki ilgili `.md` dosyasını `view_file` ile oku. Okumadan başlanan her iş "kör aksiyon" sayılır.
2. **Semantic Integrity Guard:** Bir görev dosyasında `## 🎯 Hedef` ve `## ✅ Alt Görevler` kısımları somut verilerle doldurulmadan `status` ASLA `Executing` veya `Completed` yapılamaz. `...` gibi placeholder kullanımı yasaktır ve `manage_registry.py` tarafından engellenir.
3. **Atomic Registry Sync:** Kodda yaptığın her başarılı değişiklikten sonra `registry/` dosyasını veya `PULSE.md`yi güncelle.
4. **Registry Guard Kilit Sistemi:** Projede `registry_guard.py` (Commit engelleyici) ve `manage_registry.py` (Statü engelleyici) aktif denetim yapmaktadır.
5. **No-Hardcore Strings:** Kullanıcıya dönük hiçbir metni TSX içine gömme. `useI18n()` kullan.

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

## 6. JULES Çalışma Prensipleri & Dalga (Wave) Modeli (Antigravity Entegrasyonu)
🚨 **AI Ajanları İçin Kesin Kurallar:**
1. **ZORUNLU MASTER SYNC:** Herhangi bir koda dokunmadan önce master güncel tutulmalı.
2. **Superpowers Discipline:** Antigravity dahil tüm ajanlar, karmaşık görevlerde `superpowers-workflow` skill'ini (Brainstorm -> Plan -> Implement -> Review -> Finish) tam kapasiteyle kullanmalıdır.
3. **PR Boyut Limiti:** Tek bir PR 100+ satırı geçmemeli, görevler parçalanmalı.
4. **Dosya Silme Yasağı:** Özel emir yoksa dosya SİLME, düzenleme yap.
