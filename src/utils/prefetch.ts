const flags = { products: false }

/**
 * Eagerly prefetches the Products page component chunk to ensure instant navigation.
 * Uses a module-level flag to ensure the dynamic import is only triggered once per session.
 *
 * @returns void
 *
 * @example
 * // Trigger prefetch on hover over the "Products" link
 * <Link onMouseEnter={prefetchProductsPage} to="/products">Products</Link>
 */
export function prefetchProductsPage() {
  if (flags.products) return
  flags.products = true
  try {
    // Vite will prefetch/cache the chunk; navigation becomes instant
    import('../views/ProductsPage')
  } catch {}
}



