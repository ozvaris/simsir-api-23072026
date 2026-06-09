Simsir - User Role Token Setup

This zip contains a single Postman collection with folder-based setup steps.

Import into Postman by dragging the zip file or the collection JSON.

Required existing environment variable:
- Backend_URL

Assumed existing SUPER_ADMIN user:
- admin@example.com / Password123!

The collection creates/logs in and assigns roles for:
- CUSTOMER
- CATALOG_MANAGER
- ORDER_MANAGER
- SUPPORT_STAFF

Environment variables populated by the collection:
- super_admin_user_id
- super_admin_access_token
- customer_user_id
- customer_access_token
- catalog_manager_user_id
- catalog_manager_access_token
- order_manager_user_id
- order_manager_access_token
- support_staff_user_id
- support_staff_access_token

Recommended run order:
1. 01 Register Role Test Users
2. 02 Login Users And Save Tokens
3. 03 Assign RBAC Roles
4. 04 Relogin After Role Assignment
5. 05 Verify Access Summary

Register requests accept 200, 201, or 409 so the setup can be re-run when users already exist.
