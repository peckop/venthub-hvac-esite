export const invoices = {
  title: 'Fatura Defteri',
  subtitle: 'Kesilen faturalar ve faturası bekleyen ödenmiş siparişler',

  tabs: {
    pending: 'Faturası bekleyen',
    ledger: 'Kesilen faturalar',
  },

  pending: {
    heading: 'Ödemesi tamamlanmış, faturası kesilmemiş siparişler',
    note: 'Liste veritabanındaki görünümden gelir; bir siparişe fatura kaydı açıldığı anda buradan düşer.',
    emptyTitle: 'Bekleyen fatura yok',
    emptyDescription: 'Ödemesi tamamlanmış her siparişin defterde bir kaydı var.',
    action: 'Fatura kaydet',
  },

  ledger: {
    emptyTitle: 'Defter boş',
    emptyDescription: 'Henüz fatura kaydı girilmedi.',
  },

  table: {
    orderNumber: 'Sipariş',
    customer: 'Müşteri',
    total: 'Tutar',
    orderedAt: 'Sipariş tarihi',
    invoiceNo: 'Fatura no',
    invoiceDate: 'Fatura tarihi',
    invoiceType: 'Fatura tipi',
    issuedBy: 'Kaydeden',
    note: 'Not',
  },

  types: {
    individual: 'Bireysel',
    corporate: 'Kurumsal',
    unknown: 'Belirtilmemiş',
  },

  form: {
    title: 'Fatura kaydı',
    description: 'Fatura entegratör panelinde kesilir; buraya yalnızca kesilen faturanın kimliği işlenir.',
    invoiceNo: 'Fatura numarası',
    invoiceNoHint: 'Entegratör panelindeki numara. Aynı numara ikinci bir siparişe kaydedilemez.',
    invoiceDate: 'Fatura tarihi',
    note: 'Not (isteğe bağlı)',
    save: 'Kaydet',
    cancel: 'Vazgeç',
  },

  toasts: {
    created: 'Fatura kaydedildi',
    createError: 'Fatura kaydedilemedi',
    duplicate: 'Bu fatura numarası zaten kayıtlı',
    loadError: 'Defter okunamadı',
  },

  immutableNote: 'Fatura kaydı yasal kayıttır: kaydedildikten sonra değiştirilemez veya silinemez.',
};
