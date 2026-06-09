# JWT Payload Cleanup Feature Request

## Current State

The current JWT payload contains `sub` for the authenticated user id and `email` for user identity convenience.

Roles and permissions are not stored in the token. They are loaded during request validation and added to the request user context.

The frontend may use email, username, and profile information from login/register responses or `/me` endpoints.

## Missing Point

The JWT payload is not fully minimal because it still carries `email`.

The project does not yet have a formal rule that client-facing profile data must come from auth responses or `/me` endpoints instead of decoded JWT claims.

## Why It Is Not Blocking

The current payload is small and does not include roles, permissions, or large profile data.

The project can continue safely as long as JWT claims do not expand into a full user profile or authorization summary.

## Why It Matters Later

Keeping JWT payloads minimal prevents stale profile data, reduces token size, and discourages frontend code from treating the token as the source of user profile truth.

This becomes more important when profile updates, email changes, multi-device sessions, token revocation, or stricter privacy expectations are introduced.

## Status

Future Feature Request
