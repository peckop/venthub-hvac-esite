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
      decision: {
        title: 'Mark return as {{status}}',
        description: 'The return request for order {{order}} will be closed as "{{status}}". The reason is sent to the customer and stored on the record.',
        noteLabel: 'Reason (required)',
        notePlaceholder: 'e.g. return window expired, item used, box opened…'
      },
      toasts: {
        returnsLoadFailed: 'Could not load return requests',
        statusUpdated: 'Return status updated to "{{status}}"',
        emailNotifySent: 'Customer notification email sent',
        emailNotifyFailed: 'Email could not be sent, but the status was updated',
        statusUpdateFailed: 'Could not update return status',
        bulkPartialFailed: '{{count}} return(s) could not be processed (refund failed): {{detail}} — their status was NOT changed.',
        noValidTransitions: 'No valid status transitions found for selected return requests',
        bulkStatusUpdated: 'Status of {{count}} return requests updated to "{{status}}"',
        noPermission: 'You do not have permission for this action'
      },
      statusLabels: {
        requested: 'Requested',
        approved: 'Approved',
        rejected: 'Rejected',
        in_transit: 'In transit',
        received: 'Received',
        refunded: 'Refunded',
        cancelled: 'Cancelled'
      },
      bulk: {
        statusConfirm: 'Are you sure you want to update the status of {{count}} selected return requests to "{{status}}"?',
        statusTitle: 'Bulk Status Update',
        selectedCount: '{{count}} return requests selected',
        clear: 'Clear selection',
        apply: 'Apply'
      },
      detail: {
        title: 'Return Request Details',
        id: 'Return ID',
        orderId: 'Order ID',
        userId: 'User ID',
        description: 'Description',
        updatedAt: 'Last Update'
      }
};
