const flags = { products: false }

export function prefetchProductsPage() {
  if (flags.products) return
  flags.products = true
  try {
    // Vite will prefetch/cache the chunk; navigation becomes instant
    import('../pages/ProductsPage')
  } catch {}
}
