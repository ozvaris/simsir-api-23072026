export const SYSTEM_SETTING_KEYS = {
  STORE_DEFAULT_CURRENCY: 'store.defaultCurrency',
  PRODUCT_DEFAULT_TAX: 'product.defaultTax',
  STOREFRONT_FEATURED_PRODUCTS_LIMIT: 'storefront.featuredProductsLimit',
  REVIEW_AUTO_PUBLISH_ENABLED: 'review.autoPublishEnabled',
  ORDER_FREE_SHIPPING_THRESHOLD: 'order.freeShippingThreshold',
} as const;

export type SystemSettingKey =
  (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];
