-- Explicit inspection helper for super admin bootstrap state.
-- This script does not mutate data.
--
-- It checks:
-- - whether the expected user exists;
-- - whether the user has a credential;
-- - whether the SUPER_ADMIN role exists;
-- - whether the role is assigned to the user.
--
-- For a clean-database first admin bootstrap, use:
--
-- BOOTSTRAP_SUPER_ADMIN_PASSWORD='<password>' pnpm bootstrap:super-admin

SELECT
  u.id AS user_id,
  u.email AS user_email,
  u."userName" AS user_name,
  CASE WHEN c.id IS NOT NULL THEN true ELSE false END AS has_credential,
  r.id AS role_id,
  r.code AS role_code,
  CASE WHEN ur.id IS NOT NULL THEN true ELSE false END AS has_super_admin_role
FROM "users" u
LEFT JOIN "user_credentials" c
  ON c."userId" = u.id
LEFT JOIN "roles" r
  ON r.code = 'SUPER_ADMIN'
LEFT JOIN "user_roles" ur
  ON ur."userId" = u.id
 AND ur."roleId" = r.id
WHERE u.email = 'admin@example.com';

-- Optional schema inspection when column names need to be verified:
--
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_name IN ('users', 'user_credentials', 'roles', 'user_roles')
-- ORDER BY table_name, ordinal_position;
