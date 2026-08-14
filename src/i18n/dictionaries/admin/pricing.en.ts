// Pricing engine admin panel dictionary (W3, T001-VH).
// Subtree ownership: settings=T1 · rules=T2 · preview=T3 · common=orchestrator.
// Workers do NOT touch this file — orchestrator merges their deltas (maestro contract).
export const pricing = {
  common: {
    scope: {
      product: 'Product',
      brand: 'Brand',
      category: 'Category',
      global: 'Global'
    },
    method: {
      costPlus: 'Cost + Margin',
      fixed: 'Fixed Price'
    },
    segment: {
      individual: 'Individual',
      dealer: 'Dealer',
      corporate: 'Corporate',
      baseBook: 'Base book'
    },
    vatIncluded: 'VAT included',
    vatExcluded: '+VAT',
    quoteOnly: 'Request a Quote',
    noPermission: 'You do not have permission for this action',
    loadFailed: 'Failed to load data'
  },
  settings: {},
  rules: {},
  preview: {}
}
