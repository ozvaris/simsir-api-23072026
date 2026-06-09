Simsir - Checkout Reference Role Tests

Import this zip into Postman. It contains one Postman collection with multiple folders.

Required Postman environment variables:

- Backend_URL
- customer_access_token
- super_admin_access_token
- order_manager_access_token
- support_staff_access_token

Recommended order:

1. First run the User Role Token Setup collection to populate the role token variables.
2. Then run this collection or run folders manually in order.

Folders:

01 Public Checkout Reference
- GET /api/shipping-carriers without token should return 200.
- GET /api/payment-methods without token should return 200.

02 CUSTOMER Access
- CUSTOMER should receive 403 on admin shipping carriers endpoint.

03 SUPER_ADMIN Access
- SUPER_ADMIN should receive 200 on admin shipping carriers endpoint.

04 ORDER_MANAGER Shipping Admin CRUD
- ORDER_MANAGER should read, create, detail, update, update status, and hard-delete shipping carriers.
- Create accepts 200 or 201.
- Created id is stored as order_manager_shipping_carrier_id.

05 ORDER_MANAGER Payment Admin CRUD
- ORDER_MANAGER should read, create, detail, update, update status, and hard-delete payment methods.
- Create accepts 200 or 201.
- Created id is stored as order_manager_payment_method_id.

06 SUPPORT_STAFF Read 200 Write 403
- SUPPORT_STAFF should read shipping carriers and payment methods.
- SUPPORT_STAFF should receive 403 on create/update/status-update/delete operations.

Notes:

- The collection uses {{Backend_URL}} for all URLs.
- Tokens are read from environment variables.
- Public requests use No Auth.
- Authenticated requests use Bearer Token.
- Status changes use PATCH /status endpoints; DELETE is reserved for hard-delete attempts.
- The support staff update/status-update/delete tests use IDs created by the ORDER_MANAGER folders, so run the ORDER_MANAGER folders first.
