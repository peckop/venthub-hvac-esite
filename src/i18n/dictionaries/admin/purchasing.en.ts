export const purchasing = {
  navLabel: 'Purchasing',
  title: 'Purchasing',
  subtitle: 'Manage supplier orders and process goods receipts with evidence',
  emptyTitle: 'No Purchase Orders',
  emptyDescription: 'No purchase order has been created yet.',
  filterEmptyDescription: 'No purchase order matches the selected filters.',
  searchPlaceholder: 'Search by supplier name…',
  columnsButton: 'Columns',
  table: {
    supplier: 'Supplier',
    lines: 'Lines',
    status: 'Status',
    currency: 'Currency',
    expected: 'Expected',
    created: 'Created',
    actions: 'Actions'
  },
  status: {
    draft: 'Draft',
    ordered: 'Ordered',
    partially_received: 'Partially Received',
    received: 'Received',
    closed: 'Closed',
    cancelled: 'Cancelled'
  },
  actions: {
    markAs: 'Mark as {{status}}',
    closeShortTitle: 'Short close',
    closeNotePlaceholder: 'Short-close reason (required)',
    confirmClose: 'Close'
  },
  linesCount: '{{count}} lines',
  detail: {
    linesTitle: 'Order Lines',
    receiptsTitle: 'Goods Receipts',
    product: 'Product',
    ordered: 'Ordered',
    received: 'Received',
    remaining: 'Remaining',
    unitCost: 'Unit Cost',
    noReceipts: 'No goods receipt has been recorded yet.'
  },
  receipt: {
    formTitle: 'Enter Goods Receipt',
    documentNo: 'Delivery / Document No',
    qtyLabel: 'Received Qty',
    unitCostLabel: 'Unit Cost (if invoice differs)',
    note: 'Note',
    submit: 'Process Receipt',
    hint: 'Stock entry is written through a single path; quantities cannot exceed the remaining order.'
  },
  create: {
    open: 'New Order',
    title: 'New Purchase Order',
    supplier: 'Supplier',
    supplierPlaceholder: 'Select supplier',
    newSupplier: 'Add new supplier',
    newSupplierName: 'Supplier name',
    newSupplierSave: 'Save Supplier',
    currency: 'Currency',
    expectedAt: 'Expected Date',
    note: 'Note',
    linesTitle: 'Lines',
    productSearch: 'Search product (name or SKU)…',
    qty: 'Qty',
    unitCost: 'Unit Cost',
    addLine: 'Add Line',
    removeLine: 'Remove',
    submit: 'Create Order (Draft)',
    cancel: 'Cancel'
  },
  toasts: {
    noPermission: 'You do not have permission for this action.',
    createSuccess: 'Purchase order created as draft.',
    createFailed: 'Failed to create purchase order.',
    supplierCreated: 'Supplier added.',
    supplierCreateFailed: 'Failed to add supplier.',
    statusUpdated: 'Status updated: {{status}}',
    statusUpdateFailed: 'Failed to update status.',
    closeNoteRequired: 'A reason is required for short close.',
    receiptSuccess: 'Goods receipt processed ({{units}} units, {{count}} lines).',
    receiptFailed: 'Failed to process goods receipt.',
    receiptNoLines: 'Enter a quantity for at least one line.',
    lineRequired: 'Add at least one line.',
    supplierRequired: 'Select a supplier.'
  }
}
