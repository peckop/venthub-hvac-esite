export const invoices = {
  title: 'Invoice Ledger',
  subtitle: 'Issued invoices and paid orders still awaiting one',

  tabs: {
    pending: 'Awaiting invoice',
    ledger: 'Issued invoices',
  },

  pending: {
    heading: 'Paid orders with no invoice recorded',
    note: 'This list comes from a database view; an order leaves it the moment an invoice row is recorded.',
    emptyTitle: 'Nothing awaiting an invoice',
    emptyDescription: 'Every paid order has a ledger entry.',
    action: 'Record invoice',
  },

  ledger: {
    emptyTitle: 'Ledger is empty',
    emptyDescription: 'No invoice has been recorded yet.',
  },

  table: {
    orderNumber: 'Order',
    customer: 'Customer',
    total: 'Amount',
    orderedAt: 'Order date',
    invoiceNo: 'Invoice no',
    invoiceDate: 'Invoice date',
    invoiceType: 'Invoice type',
    issuedBy: 'Recorded by',
    note: 'Note',
  },

  types: {
    individual: 'Individual',
    corporate: 'Corporate',
    unknown: 'Not specified',
  },

  form: {
    title: 'Invoice record',
    description: 'The invoice is issued in the integrator panel; only its identity is recorded here.',
    invoiceNo: 'Invoice number',
    invoiceNoHint: 'The number from the integrator panel. The same number cannot be recorded for a second order.',
    invoiceDate: 'Invoice date',
    note: 'Note (optional)',
    save: 'Save',
    cancel: 'Cancel',
  },

  toasts: {
    created: 'Invoice recorded',
    createError: 'Invoice could not be recorded',
    duplicate: 'This invoice number is already recorded',
    loadError: 'Could not read the ledger',
  },

  immutableNote: 'An invoice record is a legal record: once saved it cannot be edited or deleted.',
};
