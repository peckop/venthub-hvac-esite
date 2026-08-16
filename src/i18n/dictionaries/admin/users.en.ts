export const users = {
      subtitle: 'Manage system users and their roles.',
      searchPlaceholder: 'Search by email or name',
      columnsButton: 'View',
      table: {
        user: 'User',
        created: 'Created',
        createdLabel: 'Joined',
        actions: 'Actions',
        orders: 'Orders',
        company: 'Company & B2B',
        role: 'Role'
      },
      info: {
        subtitle: 'Control the privilege levels of roles for system security.',
        items: {
          superadmin: 'Superadmin: All privileges + role assignments (limited visibility for security)',
          admin: 'Admin: Access to operations panel (inventory, returns, shipping, users)',
          moderator: 'Moderator: Limited admin privilege (inventory and returns)',
          user: 'User: Regular user (only manages own account)'
        },
        title: 'Role Authorization Guide'
      },
      roles: {
        superadmin: 'Full access to all system settings and role management.',
        admin: 'Privilege for product, order and content management.',
        warehouse: 'Privilege for stock management and inventory movements.',
        sales: 'Privilege for order, shipping, return and coupon management.',
        viewer: 'Privilege to view all modules read-only (view-only).'
      },
      permissionsError: 'You do not have permission to change user roles.',
      actionTitles: {
        super_admin: 'Make superadmin',
        admin: 'Make admin',
        warehouse: 'Grant warehouse access',
        sales: 'Grant sales access',
        viewer: 'Grant viewer access',
        user: 'Make regular user',
        superadmin: 'Make superadmin',
        moderator: 'Make moderator',
        cannotDemoteSelf: 'You can\'t demote yourself'
      },
      actions: {
        viewOrders: 'Orders',
        viewOrdersFor: "View orders for {{user}}",
        admin: 'Admin',
        moderator: 'Mod',
        superadmin: 'Superadmin',
        user: 'User'
      },
      noEmail: '—',
      emptyTitle: 'No users found',
      emptyDescription: 'There are no records in this list yet.',
      filterEmptyDescription: 'No users match your search.',
      empty: {
        admins: 'No admin users yet.',
        all: 'User list is empty.',
        filtered: 'No users match your search.'
      },
      accessDeniedTitle: 'Access Denied',
      accessDeniedDesc: 'You do not have permission to view this page.',
      tabs: {
        admins: 'Admin Users ({{count}})',
        all: 'All Users ({{count}})'
      },
      expand: {
        title: 'User Details',
        id: 'User ID (UUID)',
        fullName: 'Full Name',
        phone: 'Phone',
        organizationId: 'Organization ID'
      },
      bulk: {
        changeRole: 'Change Role',
        selectRole: 'Select Target Role',
        confirm: 'Are you sure you want to change the role of the selected {{count}} users to "{{role}}"?'
      },
      export: {
        csvLabel: 'Export as CSV'
      },
      toasts: {
        emailsIncomplete: 'Some user emails could not be shown (the list hit a limit). An empty cell does NOT mean the user has no email.',
        adminsLoadFailed: 'Failed to load admin users',
        allLoadFailed: 'Failed to load users',
        roleNotUpdated: 'Role could not be updated',
        roleUpdateError: 'Role update error',
        noPermission: 'You do not have permission to change user roles.',
        roleUpdated: 'User role updated to "{{role}}"',
        bulkRoleUpdated: 'Role updated to "{{role}}" for {{count}} selected users'
      }
};
