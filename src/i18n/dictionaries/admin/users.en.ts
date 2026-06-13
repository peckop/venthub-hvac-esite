export const users = {
      subtitle: 'Manage system users and their roles.',
      tabs: {
        admins: 'Admin Users ({{count}})',
        all: 'All Users ({{count}})'
      },
      searchPlaceholder: 'Search by email or name',
      table: {
        user: 'User',
        company: 'Company & B2B',
        role: 'Role',
        created: 'Created',
        actions: 'Actions'
      },
      empty: {
        filtered: 'No users match your search.',
        admins: 'No admin users yet.',
        all: 'User list is empty.'
      },
      actions: {
        superadmin: 'Superadmin',
        admin: 'Admin',
        moderator: 'Mod',
        user: 'User'
      },
      actionTitles: {
        superadmin: 'Make superadmin',
        admin: 'Make admin',
        moderator: 'Make moderator',
        user: 'Make user',
        cannotDemoteSelf: 'You can\'t demote yourself'
      },
      toasts: {
        adminsLoadFailed: 'Failed to load admin users',
        allLoadFailed: 'Failed to load users',
        roleUpdated: 'User role updated to "{{role}}"',
        roleNotUpdated: 'Role could not be updated',
        roleUpdateError: 'Role update error'
      },
      info: {
        title: 'User Role System',
        items: {
          superadmin: 'Superadmin: All privileges + role assignments (limited visibility for security)',
          admin: 'Admin: Access to operations panel (inventory, returns, shipping, users)',
          moderator: 'Moderator: Limited admin privilege (inventory and returns)',
          user: 'User: Regular user (only manages own account)'
        },
        subtitle: 'Control the privilege levels of roles for system security.'
      },
      permissionsError: 'You do not have permission to change user roles.',
      roles: {
        admin: 'Privilege for product, order and content management.',
        sales: 'Privilege for order, shipping, return and coupon management.',
        superadmin: 'Full access to all system settings and role management.',
        viewer: 'Privilege to view all modules read-only (view-only).',
        warehouse: 'Privilege for stock management and inventory movements.'
      }
};
