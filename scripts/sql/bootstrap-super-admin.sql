INSERT INTO "user_roles" ("user_id", "role_id", "assigned_at", "assigned_by")
SELECT u.id, r.id, NOW(), u.id
FROM "users" u
JOIN "roles" r ON r.code = 'SUPER_ADMIN'
WHERE u.email = 'admin@example.com'
ON CONFLICT DO NOTHING;