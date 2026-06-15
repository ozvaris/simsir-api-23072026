# Cart Demo Seed Feature Request

## Current State

The backend has demo users, demo catalog data, product media, product relations, product reviews, and demo addresses.

The cart module exists, but no demo cart seed is currently created.

Demo customer setup can be used for authentication and profile/address/product flows without preloading cart records.

## Missing Point

The project does not yet seed a demo cart for `customer@example.com`.

A future cart demo seed may create a cart and add a small set of demo products to it.

The seed must stay demo-only and must not run in production.

## Why It Is Not Blocking

The current seed set is enough for catalog, authentication, profile, address, review, and admin testing.

Cart behavior can still be tested through API requests or Postman flows.

Preloading cart data is convenient, but not required for the current backend cycle.

## Why It Matters Later

A cart demo seed can make frontend and QA flows faster by starting the demo customer with a ready-to-test cart.

It can help validate:

- cart listing;
- cart item quantity updates;
- cart item removal;
- checkout preparation flows after checkout and orders are finalized.

## Status

Future Feature Request
