# HTTP Hardening Feature Request

## Current State

The backend currently sets the global API prefix and validation pipe during application bootstrap.

No dedicated HTTP hardening setup is currently documented in the application bootstrap.

## Missing Point

The backend does not yet define production HTTP security defaults.

Missing capabilities may include:

- Helmet or equivalent secure HTTP headers;
- explicit CORS policy per environment;
- request body size limits;
- production-safe proxy and trust settings;
- consistent security header expectations for API responses;
- deployment-aware configuration for local, staging, and production environments.

## Why It Is Not Blocking

The current setup is enough for local development and backend feature implementation.

HTTP hardening depends on deployment topology, frontend origins, proxy setup, and production environment decisions that may not be finalized yet.

## Why It Matters Later

HTTP hardening reduces browser-facing and network-facing risk when the API is exposed beyond local development.

It becomes important before staging, production, public frontend integration, admin panel exposure, or third-party traffic.

## Status

Future Feature Request
