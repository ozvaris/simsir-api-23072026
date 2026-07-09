# Frontend Auth Profile Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the backend integration slice for:

- sign-in;
- auth bootstrap;
- access summary;
- current user profile read;
- current user profile update;
- logout state cleanup.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated frontend application areas.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Usage](#usage)
- [Prompt](#prompt)

<a id="usage"></a>

## Usage

Copy the prompt below and give it directly to the frontend Codex session.

The frontend implementation should continue following the frontend repository's own architecture, API client, routing, and state-management conventions.

<a id="prompt"></a>

## Prompt

```md
Use the existing frontend architecture and `architectguide.md` in the frontend repo.

Connect the frontend auth + current-user profile flow to the backend using the exact endpoint paths and response shapes below.

Important:
- Do not invent new backend endpoints
- Do not use `/api/account/profile`
- Use the backend’s real canonical endpoints
- Preserve existing frontend architecture, routing, API client, TanStack patterns, and auth persistence approach

## Base

- API base: `{{Backend_URL}}/api`

## 1. Sign-in

Endpoint:
- `POST /api/auth/login`

Request JSON:
```json
{
  "email": "hazel.martin@example.com",
  "password": "pass1234"
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

Error behavior:
- `400` validation error
- `401` invalid credentials

Example `401`:
```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## 2. Current auth user

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

Error behavior:
- `401` invalid refresh token

## 5. Logout

Endpoint:
- `POST /api/auth/logout`

Response JSON:
```json
{
  "success": true
}
```

## 6. Current profile

Use this endpoint for account/profile page data.

Endpoint:
- `GET /api/users/me`

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
  "phone": "+1 202 555 0189",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2026-06-18T01:55:00.000Z"
}
```

Frontend usage:
- `userName`, `name`, `surname`, `email`, `phone` -> personal information form
- `createdAt` -> member-since display
- `updatedAt` -> optional UI use only

## 7. Update profile

Use this endpoint for account/profile update.

Endpoint:
- `PATCH /api/users/me`

Headers:
```txt
Authorization: Bearer <accessToken>
```

Request JSON:
```json
{
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189"
}
```

Success response JSON:
```json
{
  "id": "usr_001",
  "email": "hazel.martin@example.com",
  "userName": "hazel.martin",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189",
  "createdAt": "2025-01-12T10:30:00.000Z",
  "updatedAt": "2026-06-18T01:55:00.000Z"
}
```

Validation/error behavior:
- `400` invalid payload
- `401` unauthorized
- `409` email conflict
- `409` username conflict

Example email conflict:
```json
{
  "message": "Email is already in use",
  "error": "Conflict",
  "statusCode": 409
}
```

Example username conflict:
```json
{
  "message": "Username is already in use",
  "error": "Conflict",
  "statusCode": 409
}
```

## 8. Password change

Endpoint:
- `PATCH /api/users/me/password`

Headers:
```txt
Authorization: Bearer <accessToken>
```

Request JSON:
```json
{
  "currentPassword": "pass1234",
  "newPassword": "NewPassword456!"
}
```

Success response JSON:
```json
{
  "success": true
}
```

## Frontend data contract

Recommended frontend shapes:
```ts
type AuthUser = {
  id: string;
  email: string;
  userName: string;
  name: string;
  surname: string;
  phone: string | null;
};

type AccessSummary = {
  userId: string;
  email: string;
  userName: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
};

type Profile = {
  id: string;
  email: string;
  userName: string;
  name: string;
  surname: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};
```

## Required frontend flow

Implement this sequence:

1. Sign in via `POST /api/auth/login`
2. Persist `accessToken`, `refreshToken`, and login `user`
3. Mark auth state as authenticated
4. Fetch `GET /api/auth/me/access-summary`
5. Store `roles`, `permissions`, `isAdmin`
6. For account page, fetch `GET /api/users/me`
7. Bind account form to:
   - `userName`
   - `name`
   - `surname`
   - `email`
   - `phone`
8. On submit, call `PATCH /api/users/me`
9. Handle `409` conflict messages explicitly in UI
10. Use `Authorization: Bearer <accessToken>` for protected requests

## Session bootstrap expectation

On app load:
1. Read persisted `accessToken` and `refreshToken`
2. If no token, stay guest
3. If token exists, call `GET /api/auth/me`
4. Then call `GET /api/auth/me/access-summary`
5. Load profile lazily from `GET /api/users/me` when account page needs it, or eagerly if current frontend architecture prefers that
6. If any protected auth bootstrap request returns `401`, optionally try `POST /api/auth/refresh`
7. If refresh fails, clear session and return to guest state

## Important path mapping note

Frontend may internally name the feature `account profile`, but backend endpoint paths are:

- `GET /api/users/me`
- `PATCH /api/users/me`

Do not expect `/api/account/profile` from the backend.

## Scope limit

Only implement:
- sign-in
- auth persistence
- session bootstrap
- access summary fetch
- current profile read
- current profile update
- logout state clear

Do not implement unrelated app areas in this step.
```
