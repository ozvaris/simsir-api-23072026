Simsir - Category Product Role Tests

Import method:
- Drag this zip into Postman Import.
- It contains one collection file with folders.

Required Postman environment variables:
- Backend_URL
- customer_access_token
- super_admin_access_token
- catalog_manager_access_token
- order_manager_access_token
- support_staff_access_token

Recommended run order:
1. 01 Public Category Product
2. 02 CUSTOMER Access - Admin Catalog Should Be 403
3. 03 SUPER_ADMIN Access - Admin Catalog Read Should Be 200
4. 04 CATALOG_MANAGER Category Product CRUD + Status/Hard Delete Behavior
5. 05 ORDER_MANAGER Access - Catalog Admin Should Be 403
6. 06 SUPPORT_STAFF Read 200 Write 403

Notes:
- Folder 04 creates a test category and test product, saves their ids/slugs into environment variables, then changes status to inactive through PATCH endpoints.
- After PATCH status=inactive, public lists should not show the test records.
- Admin lists with ?status=inactive should show the inactive test records.
- DELETE now means hard delete attempt: category delete returns 409 while a related product exists; after product hard delete, category hard delete should return 200.
- SUPPORT_STAFF PATCH/DELETE tests use the ids generated in Folder 04. They should still return 403 even after cleanup because permission guard should block before domain lookup.
- POST requests accept 200 or 201 where the backend may return Created.
