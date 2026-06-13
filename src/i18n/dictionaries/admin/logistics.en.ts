export const logistics = {
      title: 'Bulk Shipping Board',
      subtitle: 'Quickly enter tracking numbers for orders in \'confirmed\' or \'processing\' status.',
      searchPlaceholder: 'Search order no or customer...',
      applyToAll: 'Apply to All',
      shipOrders: 'Ship Selected',
      updating: 'Updating...',
      noCarrierSelected: 'Please select a carrier.',
      table: {
        order: 'Order',
        customer: 'Customer',
        date: 'Date',
        carrier: 'Carrier',
        tracking: 'Tracking Number',
        status: 'Status'
      },
      toasts: {
        loadFailed: 'Pending orders could not be loaded',
        appliedToAll: 'Selected carrier applied to all visible rows.',
        noNewTracking: 'No new shipping info found to save.',
        bulkUpdateFailed: 'Shipping update failed for {{count}} orders.',
        bulkUpdateSuccess: '{{count}} orders successfully marked as Shipped!',
        criticalError: 'A critical error occurred during bulk update.'
      }
};
