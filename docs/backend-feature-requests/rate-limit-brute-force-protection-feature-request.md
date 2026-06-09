# Rate Limit and Brute Force Protection Feature Request

## Current State

The backend currently validates login credentials and returns a generic invalid credential error.

The project does not currently show request throttling, login attempt tracking, IP-based limits, account lockout, or progressive delay protection.

## Missing Point

The backend does not yet protect sensitive endpoints with rate limiting or brute-force controls.

Missing capabilities include:

- throttling repeated login attempts;
- limiting repeated register, refresh, or password change attempts;
- tracking failed login attempts by user identifier and IP address;
- applying temporary lockout or progressive delay rules;
- exposing operational logs for suspicious authentication activity.

## Why It Is Not Blocking

The current authentication flow is enough for local development and early backend feature work.

The project can continue while traffic volume, deployment environment, and operational security requirements are still undefined.

## Why It Matters Later

Rate limiting and brute-force protection reduce credential stuffing, password guessing, abuse of public endpoints, and accidental overload.

This becomes important before production exposure, public testing, staff account usage, or payment-adjacent flows.

## Status

Future Feature Request
