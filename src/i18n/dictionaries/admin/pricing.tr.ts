// Fiyat motoru admin paneli sözlüğü (W3, T001-VH).
// Alt-ağaç sahipliği: settings=T1 · rules=T2 · preview=T3 · common=orkestratör.
// Worker'lar bu dosyaya DOKUNMAZ — deltaları orkestratör birleştirir (maestro sözleşmesi).
export const pricing = {
  common: {
    scope: {
      product: 'Ürün',
      brand: 'Marka',
      category: 'Kategori',
      global: 'Global'
    },
    method: {
      costPlus: 'Maliyet + Marj',
      fixed: 'Sabit Fiyat'
    },
    segment: {
      individual: 'Bireysel',
      dealer: 'Bayi',
      corporate: 'Kurumsal',
      baseBook: 'Temel kitap'
    },
    vatIncluded: 'KDV dahil',
    vatExcluded: '+KDV',
    quoteOnly: 'Teklif Alın',
    noPermission: 'Bu işlem için yetkiniz yok',
    loadFailed: 'Veriler yüklenemedi'
  },
  settings: {},
  rules: {},
  preview: {}
}
