/**
 * @deprecated This monolithic entry point is deprecated.
 * - For browser-side operations, import `supabaseBrowserClient` from `@/lib/supabase/client`.
 * - For static operations/public queries, import `supabaseStaticClient` from `@/lib/supabase/static`.
 * - For server-side operations requiring cookie sync, use `createSupabaseServerClient` from `@/lib/supabase/server`.
 * - For services, import directly from `@/lib/services/*.service.ts`.
 * - For types, import directly from `@/types/*.ts` or `@/data/*.ts`.
 */

import { supabaseBrowserClient } from './supabase/client'
import { supabaseStaticClient } from './supabase/static'

/**
 * Legacy monolithic client instance for backward compatibility.
 * @deprecated Use browser, static, or server clients directly from their respective factories.
 */
export const supabase = typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient
