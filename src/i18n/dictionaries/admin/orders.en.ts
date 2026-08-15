export const orders = {
      view_list: 'List View',
      view_board: 'Board View',
      subtitle: 'List, filter and manage all orders.',
      boardSubtitle: 'Quickly update order statuses by dragging them.',
      emptyTitle: 'No orders found',
      emptyDescription: 'There are no order records yet.',
      filterEmptyDescription: 'No order records match your search or applied filters.',
      statusLabels: {
        all: 'All',
        pending: 'Pending',
        paid: 'Paid',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        partialRefunded: 'Partial Refunded'
      },
      table: {
        orderId: 'Order ID',
        status: 'Status',
        conversationId: 'Conversation ID',
        amount: 'Amount',
        created: 'Created At',
        actions: 'Actions'
      },
      filters: {
        status: 'Status',
        pendingShipments: 'Pending Shipments',
        startDate: 'Start Date',
        endDate: 'End Date'
      },
      bulk: {
        selected: 'Selected: {{count}}',
        shipSelected: 'Ship Selected',
        cancelShipping: 'Cancel Shipping for Selected',
        clearSelection: 'Clear',
        noShippableSelected: 'No selectable shipments to cancel',
        confirmCancelShipping: 'Are you sure to cancel shipping for {{count}} orders?',
        cancelSuccess: '{{count}} orders cancelled',
        cancelPartialFail: 'Some cancellations failed: {{failed}}',
        cancelFailed: 'Bulk cancel failed'
      },
      export: {
        csvLabel: 'CSV (Excel-compatible UTF‑8 BOM)',
        xlsLabel: 'Excel (.xls — HTML table)',
        headers: {
          orderId: 'Order ID',
          status: 'Status',
          conversationId: 'Conversation ID',
          amount: 'Amount',
          products: 'See featured solutions',
          created: 'Date'
        }
      },
      columns: {
        orderId: 'Order ID',
        status: 'Status',
        conversationId: 'Conversation ID',
        amount: 'Amount',
        created: 'Created'
      },
      actions: {
        shipping: 'Shipping',
        logs: 'Logs',
        notes: 'Notes',
        cancel: 'Cancel'
      },
      tooltips: {
        shipping: 'Add / edit shipping info',
        logs: 'View email logs',
        notes: 'View/add order notes',
        cancelShipping: 'Cancel shipment',
        cancelBulkShipping: 'Cancel shipping for selected (only shipped orders)'
      },
      modals: {
        shipping: {
          title: 'Ship / Tracking No',
          bulkTitle: 'Bulk: Ship Orders',
          description: 'Enter the carrier and tracking number; optionally send a notification email to the customer.',
          close: 'Close',
          carrierLabel: 'Carrier',
          carrierSelect: 'Select…',
          trackingLabel: 'Tracking Number',
          trackingPlaceholder: 'Tracking number',
          sendEmailLabel: 'Send email notification to customer',
          advancedLabel: 'Advanced: per-order carrier/tracking',
          advancedTable: {
            orderId: 'Order ID',
            carrier: 'Carrier',
            tracking: 'Tracking'
          },
          carriers: {
            yurtici: 'Yurtiçi',
            aras: 'Aras',
            mng: 'MNG',
            ptt: 'PTT',
            ups: 'UPS',
            fedex: 'FedEx',
            dhl: 'DHL',
            other: 'Other'
          },
          otherPlaceholder: 'Other (type manually)',
          cancel: 'Cancel',
          save: 'Save',
          saving: 'Saving...'
        },
        logs: {
          title: 'Email Logs',
          description: 'Log of shipping notification emails sent for this order. You can keep working with the list while this panel is open.',
          orderLabel: 'Order:',
          table: {
            date: 'Date',
            to: 'To',
            subject: 'Subject',
            carrier: 'Carrier',
            tracking: 'Tracking No',
            messageId: 'Message ID'
          },
          noRecords: 'No records',
          close: 'Close'
        },
        notes: {
          title: 'Order Notes',
          description: 'Internal notes attached to this order. Notes are never shown to the customer.',
          inputPlaceholder: 'Write a new note',
          add: 'Add',
          adding: 'Saving…',
          delete: 'Delete',
          noRecords: 'No records',
          close: 'Close'
        }
      },
      toasts: {
        loadError: 'Could not load',
        emailLogsFailed: 'Failed to load email logs',
        notesFailed: 'Failed to load notes',
        noteAddFailed: 'Could not add note',
        noteAddSuccess: 'Note added successfully',
        noteDeleteSuccess: 'Note deleted',
        noteDeleteFailed: 'Could not delete note',
        noPermission: 'You do not have permission for this action',
        invalidStatusTransition: 'Invalid status change: order status can only move forward; cancel/refund cannot be undone.',
        shippingCancelConfirm: 'Cancel shipping? This will set status to "Confirmed" and remove tracking.',
        shippingCancelSuccess: 'Shipping cancelled',
        shippingCancelFailed: 'Could not cancel shipping',
        shippingUpdateSuccess: 'Shipping info saved',
        shippingCreateSuccess: 'Order shipped',
        shippingUpdateFailed: 'Could not update shipping',
        bulkShippingSuccess: '{{count}} orders shipped',
        bulkShippingFailed: 'Bulk shipping update failed',
        missingFields: 'Carrier and tracking number are required',
        missingAdvancedFields: 'Missing fields: {{count}} rows'
      },
      states: {
        loading: 'Loading...',
        noRecords: 'No records found'
      },
      board: {
        limitWarning: 'Only the first {{shown}} of {{total}} orders are displayed ({{remaining}} more exist). Please use list view or specific filters to locate older orders.',
        columns: {
          new: 'New / Pending',
          prep: 'Processing',
          shipped: 'Shipped',
          done: 'Delivered',
          cancel: 'Cancelled',
          refund: 'Refunded'
        },
        stepper: {
          received: 'Received',
          paid: 'Paid',
          prep: 'Preparing',
          shipped: 'Shipped',
          delivered: 'Delivered'
        },
        messages: {
          cancelledOrRefunded: 'Order is cancelled or refunded.',
          updateSuccess: 'Order status updated successfully.',
          updateError: 'Error occurred while updating status.'
        },
        detail: {
          description: 'Status, contact details, notes and email log of the selected order.',
          close: 'Close'
        }
      },
      orderDetails: 'Order Details',
      form: {
        // Field-level validation messages (standard §4.6 — under the input, not in a toast)
        validation: {
          statusRequired: 'Order status is required',
          customerNameRequired: 'Customer name is required',
          emailInvalid: 'Invalid email address',
          emailRequired: 'Email is required',
        },
        descEdit: 'View and update order details.',
        tabShipping: 'Shipping',
        tabItems: 'Order Items',
        customerName: 'Customer Name',
        customerEmail: 'Customer Email',
        customerPhone: 'Customer Phone',
        orderStatus: 'Order Status',
        carrier: 'Carrier',
        trackingNumber: 'Tracking Number',
        shippingMethod: 'Shipping Method',
        shippingStandard: 'Standard Shipping',
        shippingExpress: 'Express Shipping',
        itemsTableProduct: 'Product Name',
        itemsTableQuantity: 'Quantity',
        itemsTableUnitPrice: 'Unit Price',
        itemsTableTotal: 'Total',
        errorPrefix: 'Error: ',
        unknownError: 'Unknown error'
      }
};
