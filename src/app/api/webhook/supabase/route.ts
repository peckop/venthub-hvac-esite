import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { supabase } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: Record<string, unknown> | null
  old_record: Record<string, unknown> | null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SupabaseWebhookPayload
    const webhookSecret = request.headers.get('x-webhook-secret')

    // Strict HMAC/Token Verification
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('Unauthorized Supabase webhook attempt blocked.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.warn(`[Supabase Webhook] Received ${payload.type} event on table "${payload.table}"`)

    const { table, type, record, old_record } = payload
    const activeRecord = record || old_record

    if (!activeRecord) {
      return NextResponse.json({ revalidated: false, message: 'No record found in payload' })
    }

    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []

    // 1. Table: products
    if (table === 'products') {
      const productSlug = activeRecord.slug as string | undefined
      if (productSlug) {
        // Revalidate the product details pages for all locales
        revalidatePath(`/tr/products/${productSlug}`)
        revalidatePath(`/en/products/${productSlug}`)
        revalidatedPaths.push(`/tr/products/${productSlug}`, `/en/products/${productSlug}`)
      }

      // Revalidate listing caches
      revalidateTag('products-discovery')
      revalidateTag('home-data')
      revalidatedTags.push('products-discovery', 'home-data')

      // If category has changed or is associated, we also revalidate the category path
      const categoryId = activeRecord.category_id as string | undefined
      if (categoryId) {
        const { data: category } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', categoryId)
          .single()
        
        if (category?.slug) {
          revalidatePath(`/tr/category/${category.slug}`)
          revalidatePath(`/en/category/${category.slug}`)
          revalidatedPaths.push(`/tr/category/${category.slug}`, `/en/category/${category.slug}`)
        }
      }
    }

    // 2. Table: categories
    else if (table === 'categories') {
      const categorySlug = activeRecord.slug as string | undefined
      if (categorySlug) {
        revalidatePath(`/tr/category/${categorySlug}`)
        revalidatePath(`/en/category/${categorySlug}`)
        revalidatedPaths.push(`/tr/category/${categorySlug}`, `/en/category/${categorySlug}`)
      }

      // Revalidate listing caches since categorization structure changed
      revalidateTag('home-data')
      revalidateTag('products-discovery')
      revalidatedTags.push('home-data', 'products-discovery')
    }

    // 3. Table: inventory_movements (Real-time stock movement tracking)
    else if (table === 'inventory_movements') {
      const productId = activeRecord.product_id as string | undefined
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('slug, category_id')
          .eq('id', productId)
          .single()

        if (product) {
          const productSlug = product.slug
          if (productSlug) {
            revalidatePath(`/tr/products/${productSlug}`)
            revalidatePath(`/en/products/${productSlug}`)
            revalidatedPaths.push(`/tr/products/${productSlug}`, `/en/products/${productSlug}`)
          }

          // If product is linked to a category, revalidate category path too
          if (product.category_id) {
            const { data: category } = await supabase
              .from('categories')
              .select('slug')
              .eq('id', product.category_id)
              .single()

            if (category?.slug) {
              revalidatePath(`/tr/category/${category.slug}`)
              revalidatePath(`/en/category/${category.slug}`)
              revalidatedPaths.push(`/tr/category/${category.slug}`, `/en/category/${category.slug}`)
            }
          }
        }
      }

      // Stocks change means home page featured items and discovery list might change stock badges
      revalidateTag('home-data')
      revalidateTag('products-discovery')
      revalidatedTags.push('home-data', 'products-discovery')
    }

    return NextResponse.json({
      revalidated: true,
      event: { table, type },
      revalidatedPaths,
      revalidatedTags,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Supabase Webhook Error]:', error)
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
