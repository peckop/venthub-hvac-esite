import type { Category, Product } from '../lib/supabase'
import { STATIC_CATEGORY_METADATA } from '../config/categoryMetadata'
import { supabase } from '../lib/supabase'

/**
 * Returns the display name for a category.
 * Prioritizes the 'hero_title' from static metadata configuration (SSOT).
 * If not present, falls back to the database name.
 */
export const getCategoryDisplayName = (category: Category | null | undefined): string => {
    if (!category) return ''
    if (STATIC_CATEGORY_METADATA[category.slug]?.hero_title) {
        return STATIC_CATEGORY_METADATA[category.slug].hero_title!
    }
    return category.name
}

/**
 * Returns the description for a category.
 * Prioritizes 'hero_description' from static metadata.
 */
export const getCategoryDescription = (category: Category | null | undefined): string => {
    if (!category) return ''
    if (STATIC_CATEGORY_METADATA[category.slug]?.hero_description) {
        return STATIC_CATEGORY_METADATA[category.slug].hero_description!
    }
    return category.description || ''
}

interface ProductImageCover {
    product_id: string
    path: string
    alt: string
}

/**
 * Attaches cover images to products from the product_images table.
 */
export const attachCovers = async (products: Product[]): Promise<Product[]> => {
    if (!products.length) return []
    const ids = products.map(p => p.id)
    const { data: covers } = await (supabase
        .from('product_images') as any)
        .select('product_id, path, alt')
        .in('product_id', ids)
        .eq('is_cover', true) as { data: ProductImageCover[] | null }

    if (!covers) return products

    const coverMap = new Map<string, ProductImageCover>(covers.map(c => [c.product_id, c]))
    return products.map(p => {
        const c = coverMap.get(p.id)
        if (c) {
            return { ...p, image_url: c.path, image_alt: c.alt }
        }
        return p
    })
}

/**
 * Safely parses a price string or number to a number.
 */
export const parsePriceToNumber = (val: any): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
        const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
    }
    return 0
}



