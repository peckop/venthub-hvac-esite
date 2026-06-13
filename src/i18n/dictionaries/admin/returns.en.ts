export const returns = {
      total: 'Total: {{count}} return requests',
      subtitle: 'Track return requests and move their status forward.',
      searchPlaceholder: 'Search by order no, customer name, email or reason',
      columnsButton: 'View',
      emptyTitle: 'No return requests',
      emptyDescription: 'No return requests yet.',
      filterEmptyDescription: 'No return requests match the filters.',
      export: {
        csvLabel: 'CSV (with visible filters)',
        xlsLabel: 'Excel (.xls — HTML table)',
        headers: {
          order: 'Order',
          customer: 'Customer',
          email: 'Email',
          reason: 'Reason',
          status: 'Status',
          date: 'Date',
          amount: 'Amount'
        }
      },
      table: {
        order: 'Order',
        customer: 'Customer',
        reason: 'Reason',
        status: 'Status',
        date: 'Date',
        actions: 'Actions'
      },
      empty: {
        filtered: 'No return requests match the filters.',
        none: 'No return requests yet.'
      },
      actions: {
        markAs: 'Mark as {{status}}'
      },
      toasts: {
        returnsLoadFailed: 'Could not load return requests',
        statusUpdated: 'Return status updated to "{{status}}"',
        emailNotifySent: 'Customer notification email sent',
        emailNotifyFailed: 'Email could not be sent, but the status was updated',
        statusUpdateFailed: 'Could not update return status'
      },
      statusLabels: {
        requested: 'Requested',
        approved: 'Approved',
        rejected: 'Rejected',
        in_transit: 'In transit',
        received: 'Received',
        refunded: 'Refunded',
        cancelled: 'Cancelled'
      }
};
