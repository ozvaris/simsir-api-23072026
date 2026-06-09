# JWT Session Tracking Feature Request

## Current State

The current authentication flow uses stateless JWT tokens.

The JWT payload currently contains the authenticated user id through `sub` and also includes `email`.

The backend does not currently store server-side session records, refresh token hashes, device metadata, IP metadata, user-agent metadata, or active session status.

Multiple logins with the same user credentials are allowed. Each login creates a new access token and refresh token, and previous tokens remain valid until they expire.

The current logout flow returns success but does not revoke an access token, refresh token, or backend session record.

## Missing Point

The backend does not have a `sessionId`-based session tracking model.

Missing capabilities include:

- tracking active sessions per user;
- revoking one session;
- revoking all sessions for a user;
- invalidating refresh tokens server-side;
- rotating refresh tokens with backend validation;
- recording device, IP, user-agent, and login metadata;
- auditing security-sensitive session activity.

## Why It Is Not Blocking

The current stateless JWT flow is enough for the current backend phase.

Customer-facing e-commerce applications commonly allow the same user to stay logged in on multiple devices. The project can continue with token expiration based access control while session management requirements are still undefined.

This feature should not block current API, RBAC, catalog, cart, checkout, or order development.

## Why It Matters Later

JWT session tracking becomes important when the project needs stronger account security and operational control.

It enables:

- logout from the current device;
- logout from all devices;
- forced token invalidation after password changes or suspicious activity;
- admin-driven session revocation for staff accounts;
- refresh token rotation with replay protection;
- active session screens for users or admins;
- security audit trails for login, refresh, and logout events.

This is especially useful for admin and staff accounts, payment-adjacent flows, and future fraud or suspicious activity controls.

## Status

Future Feature Request
