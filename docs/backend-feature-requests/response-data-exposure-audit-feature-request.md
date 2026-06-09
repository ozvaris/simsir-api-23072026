# Response Data Exposure Audit Feature Request

## Current State

The project generally separates DTOs, entities, and response models.

Authentication responses do not return `passwordHash`, and service methods commonly map entities into response classes.

## Missing Point

The project does not yet have a dedicated response data exposure audit.

Missing checks include:

- verifying that no controller returns sensitive entity fields accidentally;
- checking every response model for credential, internal, or operational fields;
- confirming that relation loading does not expose nested sensitive data;
- documenting fields that must never be returned by public, customer, or admin endpoints.

## Why It Is Not Blocking

Current high-risk auth responses already avoid returning password hashes.

The project can continue while modules are still evolving, as long as new endpoints keep using explicit response models and avoid returning raw entities.

## Why It Matters Later

As the API grows, accidental exposure risk increases through relation loading, admin views, debug fields, and copied response patterns.

A focused audit helps protect credentials, internal identifiers, operational metadata, and future payment-adjacent data.

## Status

Future Feature Request
