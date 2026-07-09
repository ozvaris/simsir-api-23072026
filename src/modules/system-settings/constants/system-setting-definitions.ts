import { SystemSettingValueType } from '../enums/system-setting-value-type.enum';
import { SYSTEM_SETTING_KEYS, SystemSettingKey } from './system-setting-keys';

type SystemSettingDefinition = {
  key: SystemSettingKey;
  defaultValue: string;
  valueType: SystemSettingValueType;
  groupKey: string;
  description: string;
  isPublic: boolean;
  min?: number;
  max?: number;
};

export const SYSTEM_SETTING_DEFINITIONS: readonly SystemSettingDefinition[] = [
  {
    key: SYSTEM_SETTING_KEYS.STORE_DEFAULT_CURRENCY,
    defaultValue: 'TRY',
    valueType: SystemSettingValueType.STRING,
    groupKey: 'store',
    description: 'Default store currency code used by admin and storefront flows.',
    isPublic: true,
  },
  {
    key: SYSTEM_SETTING_KEYS.PRODUCT_DEFAULT_TAX,
    defaultValue: '20.00',
    valueType: SystemSettingValueType.NUMBER,
    groupKey: 'product',
    description:
      'Default tax percentage used when admin product creation payload omits tax.',
    isPublic: false,
    min: 0,
    max: 100,
  },
  {
    key: SYSTEM_SETTING_KEYS.STOREFRONT_FEATURED_PRODUCTS_LIMIT,
    defaultValue: '12',
    valueType: SystemSettingValueType.NUMBER,
    groupKey: 'storefront',
    description:
      'Maximum number of featured products shown in storefront sections by default.',
    isPublic: true,
    min: 1,
    max: 100,
  },
  {
    key: SYSTEM_SETTING_KEYS.REVIEW_AUTO_PUBLISH_ENABLED,
    defaultValue: 'true',
    valueType: SystemSettingValueType.BOOLEAN,
    groupKey: 'review',
    description:
      'Controls whether newly created product reviews become visible without manual moderation.',
    isPublic: false,
  },
  {
    key: SYSTEM_SETTING_KEYS.ORDER_FREE_SHIPPING_THRESHOLD,
    defaultValue: '1000.00',
    valueType: SystemSettingValueType.NUMBER,
    groupKey: 'order',
    description:
      'Order subtotal threshold that enables free shipping in supported checkout flows.',
    isPublic: false,
    min: 0,
  },
] as const;

export const SYSTEM_SETTING_DEFINITION_BY_KEY = new Map<string, SystemSettingDefinition>(
  SYSTEM_SETTING_DEFINITIONS.map((definition) => [definition.key, definition]),
);
