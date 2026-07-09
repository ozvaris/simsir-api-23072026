# Frontend Register Backend Integration Prompt

<a id="purpose"></a>

## Purpose

This document provides a copy-paste-ready integration prompt for the frontend Codex session.

It owns only the frontend-to-backend register slice:

- register form submission;
- register request and response contract;
- register validation/error handling;
- auth session bootstrap immediately after register success.

It does not replace the frontend repository's own `architectguide.md`, and it does not define unrelated frontend application areas.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Usage](#usage)
- [Prompt](#prompt)

<a id="usage"></a>

## Usage

Copy the prompt below and give it directly to the frontend Codex session.

The frontend implementation should continue following the frontend repository's own architecture, API client, routing, form, mutation, and state-management conventions.

<a id="prompt"></a>

## Prompt

```md
Use the existing frontend architecture and `architectguide.md` in the frontend repo.

Connect the frontend register flow to the backend using the exact endpoint path and request/response shapes below.

Important:
- Do not invent a different backend endpoint
- Do not rename fields
- Keep request and response keys exactly aligned with the backend
- Treat `user.id` as an opaque `string`
- On successful register, the backend already returns authenticated user data plus tokens

## Base

- API base: `{{Backend_URL}}/api`

## Register

Endpoint:
- `POST /api/auth/register`

Request JSON:
```json
{
  "email": "hazel.martin@example.com",
  "password": "Password123!",
  "name": "Hazel",
  "surname": "Martin",
  "phone": "+1 202 555 0189"
}
```

Request field rules:
- `email`: required, valid email
- `password`: required, non-empty string, minimum 8 characters
- `name`: required, non-empty string
- `surname`: required, non-empty string
- `phone`: required, non-empty string

Success response JSON:
```json
{
  "user": {
    "id": "6f8d7d44-3d2a-4f7a-9b3a-2d6b0d8b71c1",
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

Important success behavior:
- the backend returns `user`
- the backend returns `accessToken`
- the backend returns `refreshToken`
- the backend generates `user.userName` automatically during register
- `phone` is always expected as a string
- `id` is a string and may be a UUID

Validation error:
- status: `400`

Example validation error JSON:
```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters",
    "name should not be empty",
    "surname should not be empty",
    "phone should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Duplicate email or username:
- status: `409`

Example conflict error JSON:
```json
{
  "message": "Email or username already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

## Frontend state expectation after register

Recommended success handling:

1. Submit the register form to `POST /api/auth/register`
2. On success store:
   - `accessToken`
   - `refreshToken`
   - `user`
3. Mark the session authenticated immediately
4. Optionally follow with `GET /api/auth/me/access-summary` for role/permission-aware UI
5. Redirect to the post-authenticated area used by the app

Recommended frontend type shape:
```ts
type RegisterResponse = {
  user: {
    id: string;
    email: string;
    userName: string;
    name: string;
    surname: string;
    phone: string;
  };
  accessToken: string;
  refreshToken: string;
};
```

## Scope

Implement only the frontend register integration for:
- request payload
- response parsing
- validation/error handling
- authenticated-session initialization after success

Do not invent or switch to:
- `/api/users/register`
- `/api/account/register`
- `/api/auth/signup`
- a frontend-only fake auth flow
```
