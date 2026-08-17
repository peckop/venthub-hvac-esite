export const purchasing = {
  navLabel: 'Satınalma',
  title: 'Satınalma',
  subtitle: 'Tedarikçi siparişlerini yönetin, mal kabullerini kanıtlı işleyin',
  emptyTitle: 'Satınalma Siparişi Yok',
  emptyDescription: 'Henüz bir satınalma siparişi oluşturulmadı.',
  filterEmptyDescription: 'Seçilen filtrelere uygun satınalma siparişi bulunmuyor.',
  searchPlaceholder: 'Tedarikçi adında ara…',
  columnsButton: 'Kolonlar',
  table: {
    supplier: 'Tedarikçi',
    lines: 'Kalemler',
    status: 'Durum',
    currency: 'Para Birimi',
    expected: 'Beklenen',
    created: 'Oluşturma',
    actions: 'İşlemler'
  },
  status: {
    draft: 'Taslak',
    ordered: 'Sipariş Verildi',
    partially_received: 'Kısmen Teslim',
    received: 'Teslim Alındı',
    closed: 'Kapatıldı',
    cancelled: 'İptal'
  },
  actions: {
    markAs: '{{status}} yap',
    closeShortTitle: 'Kısa kapama',
    closeNotePlaceholder: 'Kısa kapama gerekçesi (zorunlu)',
    confirmClose: 'Kapat'
  },
  linesCount: '{{count}} kalem',
  detail: {
    linesTitle: 'Sipariş Kalemleri',
    receiptsTitle: 'Mal Kabulleri',
    product: 'Ürün',
    ordered: 'Sipariş',
    received: 'Teslim',
    remaining: 'Kalan',
    unitCost: 'Birim Maliyet',
    noReceipts: 'Henüz mal kabul yapılmadı.'
  },
  receipt: {
    formTitle: 'Mal Kabul Gir',
    documentNo: 'İrsaliye / Belge No',
    qtyLabel: 'Kabul Miktarı',
    unitCostLabel: 'Birim Maliyet (fatura farkıysa)',
    note: 'Not',
    submit: 'Mal Kabulü İşle',
    hint: 'Stok girişi tek yoldan yazılır; miktarlar sipariş kalanını aşamaz.'
  },
  create: {
    open: 'Yeni Sipariş',
    title: 'Yeni Satınalma Siparişi',
    supplier: 'Tedarikçi',
    supplierPlaceholder: 'Tedarikçi seçin',
    newSupplier: 'Yeni tedarikçi ekle',
    newSupplierName: 'Tedarikçi adı',
    newSupplierSave: 'Tedarikçiyi Kaydet',
    currency: 'Para Birimi',
    expectedAt: 'Beklenen Tarih',
    note: 'Not',
    linesTitle: 'Kalemler',
    productSearch: 'Ürün ara (ad ya da SKU)…',
    qty: 'Miktar',
    unitCost: 'Birim Maliyet',
    addLine: 'Kalem Ekle',
    removeLine: 'Kaldır',
    submit: 'Siparişi Oluştur (Taslak)',
    cancel: 'Vazgeç'
  },
  toasts: {
    noPermission: 'Bu işlem için yetkiniz yok.',
    createSuccess: 'Satınalma siparişi taslak olarak oluşturuldu.',
    createFailed: 'Sipariş oluşturulamadı.',
    supplierCreated: 'Tedarikçi eklendi.',
    supplierCreateFailed: 'Tedarikçi eklenemedi.',
    statusUpdated: 'Durum güncellendi: {{status}}',
    statusUpdateFailed: 'Durum güncellenemedi.',
    closeNoteRequired: 'Kısa kapama için gerekçe zorunludur.',
    receiptSuccess: 'Mal kabul işlendi ({{units}} adet, {{count}} kalem).',
    receiptFailed: 'Mal kabul işlenemedi.',
    receiptNoLines: 'En az bir kaleme miktar girin.',
    lineRequired: 'En az bir kalem ekleyin.',
    supplierRequired: 'Tedarikçi seçin.'
  }
}
