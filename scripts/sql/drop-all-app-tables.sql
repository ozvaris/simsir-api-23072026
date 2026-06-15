-- Drops all application tables for local seed-data reset testing.
-- Destructive script: do not run against production or any database with data
-- that must be preserved.
--
-- CASCADE is used so foreign key constraints, dependent indexes, and related
-- constraints do not block table removal.

DROP TABLE IF EXISTS
  "cart_items",
  "carts",
  "order_status_history",
  "order_shipment_snapshots",
  "order_payment_snapshots",
  "order_addresses",
  "order_items",
  "orders",
  "inventory_transactions",
  "inventory_reservations",
  "inventory_items",
  "addresses",
  "user_credentials",
  "user_roles",
  "role_permissions",
  "product_reviews",
  "product_relations",
  "product_media",
  "products",
  "categories",
  "payment_providers",
  "payment_methods",
  "shipping_carrier_service_payment_capabilities",
  "shipping_carrier_services",
  "shipping_carriers",
  "permissions",
  "roles",
  "users"
CASCADE;
