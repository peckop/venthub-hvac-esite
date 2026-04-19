/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '../types/database.types'
import type { DomainCategory, DomainProduct } from '../types/ui-models'

import type { 
  DbAdminSearchResult, 
  DbFtsSearchResult,
  DbUserProject,
  DbProjectItem,
  DbUserAddress,
  DbInvoiceProfile
} from '../types/db-rows'

export type { DbAdminSearchResult, DbFtsSearchResult }
export type UserAddress = DbUserAddress
export type InvoiceProfile = DbInvoiceProfile

// Define SUPABASE config from process.env for Next.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Fallback mechanism to prevent white screen on build/env errors
const missingEnv = !SUPABASE_URL || !SUPABASE_ANON_KEY
if (missingEnv) {
  console.error('CRITICAL: Supabase config missing. App will strictly fail on data fetch but should render UI.')
  if (typeof window !== 'undefined') {
    window.__SUPABASE_CONFIG_ERROR__ = true
  }
}

// Create client with real or dummy values to prevent instant crash
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Database types
export type Category = DomainCategory
export type Product = DomainProduct
export type UserProject = DbUserProject
export type ProjectItem = DbProjectItem & { product?: Product }

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

// Search and Enriched types
export interface SearchSuggestion {
  text?: string
  label: string
  type: 'product' | 'category' | 'brand'
  slug?: string
  url: string
  metadata?: Json
}

export interface FtsProductResult extends DomainProduct {
  rank?: number
  is_fuzzy_match?: boolean
}

export interface GetProductsParams {
  categoryIds?: string[]
  searchQuery?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

// HVAC specific types
export interface HVACBrand {
  name: string
  slug: string
  description: string
  country: string
  logo?: string
}

export const HVAC_BRANDS: HVACBrand[] = [
  {
    name: 'AVenS',
    slug: 'avens',
    description: 'Türk premium HVAC çözümleri',
    country: 'TR'
  },
  {
    name: 'Vortice',
    slug: 'vortice',
    description: 'İtalyan havalandırma teknolojisi',
    country: 'IT'
  },
  {
    name: 'Casals',
    slug: 'casals',
    description: 'İspanyol güvenilir çözümler',
    country: 'ES'
  },
  {
    name: 'Nicotra Gebhardt',
    slug: 'nicotra-gebhardt',
    description: 'Alman endüstriyel teknoloji',
    country: 'DE'
  },
  {
    name: 'Flexiva',
    slug: 'flexiva',
    description: 'Esnek kanal sistemleri',
    country: 'EU'
  },
  {
    name: 'Frekans Konvertörü',
    slug: 'frekans-konvertoru',
    description: 'Yüksek verimli hız kontrolü',
    country: 'DK'
  }
]

// API functions

// ========== Services Re-Exports ==========
export * from './services/category.service'
export * from './services/product.service'
export * from './services/cart.service'
export * from './services/address.service'
export * from './services/invoice.service'
export * from './services/pricing.service'
export * from './services/project.service'
