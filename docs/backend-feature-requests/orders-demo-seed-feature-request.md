# Orders Demo Seed Feature Request

## Current State

The orders module is not part of the completed backend flow yet.

Current seed work intentionally avoids creating order records.

Demo catalog, demo customer, addresses, reviews, payment methods, and shipping carriers can support future order testing once the orders module is ready.

## Missing Point

The project does not yet have demo order seed data.

Future order seed may create sample orders only after the order entity, order lifecycle, payment state, shipping state, and ownership rules are finalized.

The seed must remain demo-only and must not create fake orders in production.

## Why It Is Not Blocking

Orders are the next larger backend area and should be designed before seed data is added.

Adding order seed before the module is complete would create unstable assumptions about order status, payment status, shipping state, totals, and item snapshots.

## Why It Matters Later

Demo orders will help test:

- customer order history;
- admin order listing;
- order detail screens;
- payment and shipping state transitions;
- reporting and support workflows.

Order seed should be added only after the order model and lifecycle are stable.

## Status

Future Feature Request
