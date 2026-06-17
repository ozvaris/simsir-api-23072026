# Frontend Sign-In Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the first frontend-to-backend authentication slice:

- sign-in endpoint connection;
- auth request and response contract;
- session bootstrap expectation;
- access summary fetch expectation;
- logout state cleanup expectation.

It is not a general frontend architecture document and it does not replace the frontend repository's own `architectguide.md`.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Usage](#usage)
- [Prompt](#prompt)

<a id="usage"></a>

## Usage

Copy the prompt below and give it directly to the frontend Codex session.

The frontend implementation should still follow the frontend repository's own architecture, component, routing, and state-management conventions.

<a id="prompt"></a>

## Prompt

```md
Use the existing frontend architecture and `architectguide.md` in the frontend repo.

Connect the frontend auth flow to the backend with the following API contract.

## Base

- API base: `{{Backend_URL}}/api`

## 1. Sign-in

Endpoint:
- `POST /api/auth/login`

Request JSON:
```json
{
  "email": "hazel.martin@example.com",
  "password": "Password123!"
}
```

Success response JSON:
```json
{
  "user": {
    "id": "usr_001",
    "email": "hazel.martin@example.com",
    "userName": "hazel.martin",
    "name": "Hazel",
    "surname": "Martin",
    "phone": "+1 202 555 0189"
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

Validation rules:
- `email`: required, valid email
- `password`: required, non-empty string

Invalid credentials:
- status: `401`

Example error JSON:
```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Validation error:
- status: `400`

Example error JSON:
```json
{
  "message": [
    "email must be an email",
    "password should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 2. Current user

Endpoint:
- `GET /api/auth/me`

Headers:
```txt
Authorization: Bearer <accessToken>
```

Success response JSON:
```json
{
  "id": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189"
}
```

## 3. Access summary

Primary endpoint:
- `GET /api/auth/me/access-summary`

Equivalent alias:
- `GET /api/auth/me/access`

Headers:
```txt
Authorization: Bearer <accessToken>
```

Success response JSON:
```json
{
  "userId": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "roles": ["CUSTOMER"],
  "permissions": [],
  "isAdmin": false
}
```

## 4. Refresh token

Endpoint:
- `POST /api/auth/refresh`

Request JSON:
```json
{
  "refreshToken": "refresh-token"
}
```

Success response JSON:
```json
{
  "user": {
    "id": "usr_001",
    "email": "hazel.martin@example.com",
    "userName": "hazel.martin",
    "name": "Hazel",
    "surname": "Martin",
    "phone": "+1 202 555 0189"
  },
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

Invalid refresh token:
- status: `401`

Example error JSON:
```json
{
  "message": "Invalid refresh token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## 5. Logout

Endpoint:
- `POST /api/auth/logout`

Response JSON:
```json
{
  "success": true
}
```

## Frontend auth state expectation

Recommended state shape:
```ts
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    userName: string;
    name: string;
    surname: string;
    phone: string | null;
  } | null;
  accessSummary: {
    userId: string;
    email: string;
    userName: string;
    roles: string[];
    permissions: string[];
    isAdmin: boolean;
  } | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
};
```

## Required frontend flow

Implement this sequence:

1. Submit credentials to `POST /api/auth/login`
2. On success store:
   - `accessToken`
   - `refreshToken`
   - `user`
3. Mark session authenticated
4. Immediately call `GET /api/auth/me/access-summary`
5. Store:
   - `roles`
   - `permissions`
   - `isAdmin`
6. Use `Authorization: Bearer <accessToken>` for protected endpoints

## Session bootstrap expectation

On app load:

1. Read persisted `accessToken` and `refreshToken`
2. If no token exists, stay guest
3. If token exists, call `GET /api/auth/me`
4. Then call `GET /api/auth/me/access-summary`
5. If protected request returns `401`, optionally try `POST /api/auth/refresh`
6. If refresh succeeds, store new tokens and retry bootstrap
7. If refresh fails, clear auth state and return to guest state

## Logout expectation

On logout:
- clear `accessToken`
- clear `refreshToken`
- clear `user`
- clear `accessSummary`
- set `isAuthenticated = false`

## Error handling expectation

- `400` on login: show validation error
- `401` on login: show invalid credentials error
- `401` on bootstrap: try refresh if supported, otherwise clear session
- `401` on refresh: clear session and redirect to sign-in
- `403` on protected pages later: authenticated but unauthorized

## Scope limit

Only implement the auth integration slice for now:
- sign-in
- auth persistence
- session bootstrap
- access summary fetch
- logout state clear

Do not implement unrelated app areas in this step.
```
