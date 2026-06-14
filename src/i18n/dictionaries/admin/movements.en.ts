export const movements = {
      subtitle: 'Track, filter and export inventory in/out movements',
      toolbar: {
        categoryTitle: 'Category',
        allCategories: 'All Categories'
      },
      table: {
        date: 'Date',
        product: 'Product',
        delta: 'Delta',
        reason: 'Reason',
        ref: 'Reference'
      },
      export: {
        csvLabel: 'CSV (with visible filters)',
        xlsLabel: 'Excel (with visible filters)',
        headers: {
          date: 'Date',
          product: 'Product',
          sku: 'SKU',
          delta: 'Delta',
          reason: 'Reason',
          ref: 'Reference'
        }
      },
      batchFilterPrefix: 'Filter: Batch',
      emptyTitle: 'No Movements Found',
      emptyDescription: 'There are no recorded inventory movements yet.',
      filterEmptyDescription: 'No inventory movements match the selected filters or search criteria.',
      pageLabel: 'Page {{page}}',
      reasons: {
        undo: 'Undo',
        sale: 'Sale',
        po_receipt: 'PO Receipt',
        manual_in: 'Manual In',
        manual_out: 'Manual Out',
        adjust: 'Adjustment',
        return_in: 'Return In',
        transfer_out: 'Transfer Out',
        transfer_in: 'Transfer In'
      }
};
