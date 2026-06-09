Simsir - Cart Endpoint Tests

Import this zip into Postman. It contains one collection file with folders.

Required environment variables:
- Backend_URL
- customer_access_token
- support_staff_access_token

Optional but useful existing variables:
- super_admin_access_token
- catalog_manager_access_token

The collection first calls GET /api/products?limit=1 without token and stores the first active product id as:
- cart_test_product_id
- cart_test_product_slug

If the prerequisite step fails, create at least one active product first, then rerun this collection.

Main test coverage:
1. Unauthenticated cart endpoints return 401.
2. CUSTOMER can get/create/update/delete/clear own cart.
3. Adding the same product twice should not duplicate the item; it should increase quantity.
4. SUPPORT_STAFF cannot update/delete CUSTOMER cart item; expected 404.
5. Validation and not-found cases: quantity 0, invalid UUID, unknown product UUID.

Recommended run order:
00 Prerequisite - Capture Active Product
01 Unauthenticated Cart Should Be 401
02 CUSTOMER Cart Happy Path
03 Ownership - Other User Cannot Modify Customer Cart Item
04 Validation And Not Found
