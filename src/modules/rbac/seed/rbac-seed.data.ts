import { RbacStatus } from '../enums/rbac-status.enum';

export const RBAC_SEED_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Can manage all admin and RBAC operations.',
  },
  {
    code: 'CATALOG_MANAGER',
    name: 'Catalog Manager',
    description: 'Can manage category and product catalog data.',
  },
  {
    code: 'ORDER_MANAGER',
    name: 'Order Manager',
    description: 'Can manage order operations.',
  },
  {
    code: 'SUPPORT_STAFF',
    name: 'Support Staff',
    description: 'Can read customer and order information for support.',
  },
  {
    code: 'CUSTOMER',
    name: 'Customer',
    description: 'Default authenticated customer role.',
  },
] as const;

export const RBAC_SEED_PERMISSIONS = [
  'catalog.category.read',
  'catalog.category.create',
  'catalog.category.update',
  'catalog.category.delete',
  'catalog.product.read',
  'catalog.product.create',
  'catalog.product.update',
  'catalog.product.delete',
  'inventory.read',
  'inventory.update',
  'catalog.review.moderate',
  'order.read_all',
  'order.update_status',
  'order.cancel',
  'order.refund',
  'user.read',
  'user.update',
  'user.disable',
  'shipping_carrier.read',
  'shipping_carrier.create',
  'shipping_carrier.update',
  'shipping_carrier.delete',
  'payment_method.read',
  'payment_method.create',
  'payment_method.update',
  'payment_method.delete',
  'system_setting.read',
  'system_setting.create',
  'system_setting.update',
  'system_setting.delete',
  'rbac.role.read',
  'rbac.role.create',
  'rbac.role.update',
  'rbac.role.delete',
  'rbac.role.assign_permission',
  'rbac.role.replace_permissions',
  'rbac.role.remove_permission',
  'rbac.permission.read',
  'rbac.permission.create',
  'rbac.permission.update',
  'rbac.permission.delete',
  'rbac.user_role.read',
  'rbac.user_role.assign',
  'rbac.user_role.replace',
  'rbac.user_role.remove',
  'rbac.user_access.read',
].map((code) => {
  const [resourcePart, action] = code.split(/\.(?=[^.]+$)/);

  return {
    code,
    name: code
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    description: `Allows ${code} operations.`,
    resource: resourcePart,
    action,
    status: RbacStatus.ACTIVE,
  };
});

export const RBAC_SEED_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: RBAC_SEED_PERMISSIONS.map((permission) => permission.code),
  CATALOG_MANAGER: RBAC_SEED_PERMISSIONS.filter((permission) =>
    permission.code.startsWith('catalog.') ||
    permission.code.startsWith('inventory.'),
  ).map((permission) => permission.code),
  ORDER_MANAGER: RBAC_SEED_PERMISSIONS.filter(
    (permission) =>
      permission.code.startsWith('order.') ||
      permission.code.startsWith('shipping_carrier.') ||
      permission.code.startsWith('payment_method.') ||
      permission.code === 'inventory.read',
  ).map((permission) => permission.code),
  SUPPORT_STAFF: [
    'user.read',
    'order.read_all',
    'catalog.product.read',
    'catalog.category.read',
    'shipping_carrier.read',
    'payment_method.read',
    'inventory.read',
    'system_setting.read',
  ],
  CUSTOMER: [],
};
