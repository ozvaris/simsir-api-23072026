-- Explicit inspection helper for user-role bootstrap work.
-- This script does not mutate data.

SELECT id, code
FROM "roles"
WHERE code = 'SUPER_ADMIN';
