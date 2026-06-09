# Backend Module Patterns

<a id="purpose"></a>

## Purpose

This document demonstrates how architecture principles can be applied in practical module designs.

It is a companion document, not the architectural standard itself.

The examples in this document are case studies. They explain how to think, not what every module must copy exactly.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [How to Read This Document](#how-to-read-this-document)
- [Master-Detail Pattern](#master-detail-pattern)
- [Tree Pattern](#tree-pattern)
- [DTO / Response Separation Pattern](#dto-response-separation-pattern)
- [Repository Usage Pattern](#repository-usage-pattern)
- [Category Case Study](#category-case-study)
- [Product Detail Case Study](#product-detail-case-study)
- [Product Subdomain Boundary Pattern](#product-subdomain-boundary-pattern)
- [When Not to Copy a Pattern](#when-not-to-copy-a-pattern)

<a id="how-to-read-this-document"></a>

## How to Read This Document

Use this document when you need to answer practical questions such as:

- How should a master-detail module be shaped?
- How should tree data be represented?
- When should relation loading be used?
- How should DTO and Response classes be separated?
- When does a repository become useful?
- How should service methods map entity data to response models?

Do not use this document as an endpoint contract. Endpoint details belong to `nestjs-api-contract.md`.

Do not use this document as an entity schema source. Entity details belong to `nestjs-entities-and-relations.md`.

<a id="master-detail-pattern"></a>

## Master-Detail Pattern

A master-detail pattern appears when one resource acts as a parent/master and another resource is listed under it.

Typical shape:

- master list;
- master detail;
- detail list under master;
- optional tree or grouped representation;
- optional admin/internal create/update/delete flows.

The master-detail module should separate:

- request DTOs;
- response classes;
- repository queries;
- service use-cases;
- mapping functions.

Master-detail does not mean every detail record must always be loaded through the master entity relation.

For large lists, direct repository queries with pagination are often better.

<a id="tree-pattern"></a>

## Tree Pattern

Tree data appears when a resource can have parent-child relationships.

Typical shape:

- `parentId`;
- optional `parent`;
- optional `children`;
- root records where `parentId` is null;
- tree response class;
- flat list response class.

Tree response and flat list response should be separate response classes.

A tree endpoint should not accidentally become the default list endpoint if the data can grow large.

<a id="dto-response-separation-pattern"></a>

## DTO / Response Separation Pattern

Request DTOs and response classes solve different problems.

DTOs:

- validate incoming data;
- represent body/query input;
- reject invalid or unknown fields.

Response classes:

- represent API output;
- hide database details;
- convert data types when needed;
- provide frontend-friendly JSON shapes.

Entities should not be returned directly from controllers.

Mapper methods convert entity data into response classes.

Recommended naming:

- `CreateXDto`
- `UpdateXDto`
- `ListXQueryDto`
- `XResponse`
- `XDetailResponse`
- `toXResponse()`
- `toXDetailResponse()`

<a id="repository-usage-pattern"></a>

## Repository Usage Pattern

A repository becomes useful when data access has more than simple CRUD.

Use a repository when queries involve:

- pagination;
- search;
- relation loading;
- ownership filtering;
- aggregate calculations;
- repeated query logic.

A service should describe use-case flow.

A repository should describe data access intent.

Example responsibility split:

- service checks whether a parent exists;
- repository finds children using filters;
- service maps entities to response classes.

<a id="category-case-study"></a>

## Category Case Study

Category is a useful master-detail and tree example.

It can demonstrate:

- simple list response;
- detail response;
- parent-child tree response;
- relation-based detail list;
- master-detail product listing;
- response mapping;
- repository query decisions.

Possible response concepts:

- category list response;
- category tree response;
- category detail response;
- category products response.

The important lesson is not that every module should look like Category.

The lesson is that one domain may need multiple response shapes for different use-cases.

<a id="product-detail-case-study"></a>

## Product Detail Case Study

Product detail is a useful relation-loading example.

A detail response may include:

- base product fields;
- media list;
- related products;
- frequently bought together items;
- review summary or reviews, depending on contract.

The detail response should not expose raw entity graphs.

It should be mapped intentionally into a response class.

This keeps frontend output stable even if entity relations change.

<a id="product-subdomain-boundary-pattern"></a>

## Product Subdomain Boundary Pattern

Product is the core catalog module. It owns product list/detail, admin product
CRUD, basic product fields, status handling, category association, and public
visibility filtering.

Product subresources that have their own use-cases should live in separate
product subdomain modules:

- `ProductMediaModule` owns product media records, media ordering, media DTOs,
  media repository access, and existing admin media mutations.
- `ProductReviewsModule` owns review listing, authenticated review mutations,
  review repository access, review response mapping, and rating recalculation
  triggered by review changes.
- `ProductRelationsModule` owns product-to-product relation records, relation
  uniqueness checks, relation DTOs, relation repository access, and existing
  admin relation mutations.

Entity relations may remain on `Product` so product detail can load media and
relations intentionally. Those relations do not mean subresource CRUD or
business logic belongs in `ProductsService`.

<a id="when-not-to-copy-a-pattern"></a>

## When Not to Copy a Pattern

Patterns are examples, not rules to copy blindly.

Do not create a repository just because another module has one.

Do not create a tree response if the domain is flat.

Do not expose relation-loaded data just because an entity relation exists.

Do not add admin endpoints unless there is an actual need.

Architecture principles should guide decisions. Patterns should help interpret them.
