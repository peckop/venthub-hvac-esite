export const coupons = {
      subtitle: 'Manage discount coupons and track usage statistics',
      searchPlaceholder: 'Search coupon code...',
      create: {
        sectionTitle: 'Create New Coupon',
        code: 'Coupon Code',
        codePlaceholder: 'e.g. SUMMER2026',
        type: 'Discount Type',
        typePercent: 'Percentage (%)',
        typeFixed: 'Fixed Amount',
        value: 'Value',
        startsAt: 'Start Date',
        endsAt: 'End Date',
        status: 'Status',
        active: 'Active',
        usageLimit: 'Usage Limit',
        usageLimitPlaceholder: 'Leave empty for unlimited',
        submit: 'Create Coupon',
        submitting: 'Creating...'
      },
      table: {
        code: 'Code',
        type: 'Type',
        value: 'Value',
        active: 'Active',
        validity: 'Validity',
        usage: 'Usage',
        createdAt: 'Created',
        actions: 'Actions'
      },
      typeLabels: {
        percent: 'Percentage',
        fixed: 'Fixed Amount'
      },
      statusLabels: {
        active: 'Active',
        passive: 'Passive'
      },
      validity: {
        unlimited: 'UNLIMITED'
      },
      bulk: {
        activate: 'Activate',
        deactivate: 'Deactivate'
      },
      toasts: {
        created: 'Coupon created successfully',
        createFailed: 'Failed to create coupon',
        activated: 'Coupon activated',
        deactivated: 'Coupon deactivated',
        statusFailed: 'Failed to update status',
        noPermission: 'You do not have permission for this action'
      },
      validation: {
        codeLength: 'Coupon code must be at least 3 characters',
        typeRequired: 'Discount type is required',
        valuePositive: 'Value must be greater than zero',
        limitPositive: 'Usage limit must be a positive integer',
        percentLimit: 'Percentage discount value cannot exceed 100',
        dateRange: 'End date must be after start date'
      },
      emptyTitle: 'No coupons found',
      emptyDescription: 'No coupons have been created yet. Get started by creating your first coupon.',
      filterEmptyDescription: 'No coupons match your filter criteria.'
};
