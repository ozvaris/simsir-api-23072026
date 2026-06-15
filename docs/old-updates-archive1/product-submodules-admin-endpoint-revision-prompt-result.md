# Product Submodules Admin Endpoint Revision Result

Bu dosya, `docs/product-submodules-admin-endpoint-revision-prompt.md` talebine göre Product submodule admin endpoint eksiklerinin tamamlanmasının reviewer özeti olarak hazırlanmıştır.

## Kapsam

Daha önce yapılan Product submodules refactor korunarak product alt kaynakları için eksik admin read/list/detail endpointleri tamamlandı.

Ana hedefler:

- ProductMedia admin CRUD lifecycle içinde eksik list/detail endpointlerini eklemek;
- ProductRelation admin lifecycle içinde eksik list/detail endpointlerini eklemek;
- ProductReview için admin read-only list/detail endpointlerini eklemek;
- public/authenticated review davranışını bozmamak;
- product detail response shape'ini korumak;
- RBAC permission metadata eklemek;
- yeni moderation, recommendation, delete/disable veya tenant behavior eklememek.

## Eklenen Endpointler

Product media admin endpointleri:

```txt
GET /api/admin/products/:productId/media
GET /api/admin/products/media/:mediaId
```

Product relations admin endpointleri:

```txt
GET /api/admin/products/:productId/relations
GET /api/admin/products/relations/:relationId
```

Product reviews admin endpointleri:

```txt
GET /api/admin/products/:productId/reviews
GET /api/admin/products/reviews/:reviewId
```

## Korunan Endpointler

Product media mutation endpointleri korundu:

```txt
POST /api/admin/products/:productId/media
PATCH /api/admin/products/media/:mediaId
DELETE /api/admin/products/media/:mediaId
```

Product relation mutation endpointleri korundu:

```txt
POST /api/admin/products/:productId/relations
DELETE /api/admin/products/relations/:relationId
```

Public/authenticated review endpointleri korundu:

```txt
GET /api/products/:productId/reviews
POST /api/products/:productId/reviews
PATCH /api/products/:productId/reviews/:reviewId
DELETE /api/products/:productId/reviews/:reviewId
```

Product detail endpointi ve response shape'i korunur:

```txt
GET /api/products/:slug
```

Response içinde mevcut media ve relation alanları dönmeye devam eder.

## Bilinçli Olarak Eklenmeyen Endpointler

ProductRelation update intentionally unsupported. Use delete + create instead.

Eklenmeyen endpoint:

```txt
PATCH /api/admin/products/relations/:relationId
```

Gerekçe:

- Product relation modelinde güncellenebilir ayrı business alanı yoktur.
- Yanlış relation kaydı silinip doğru relation yeniden oluşturulabilir.

ProductReview admin moderation/write endpoints intentionally deferred. This revision adds only admin read/list/detail endpoints.

Eklenmeyen endpointler:

```txt
PATCH /api/admin/products/reviews/:reviewId/status
DELETE /api/admin/products/reviews/:reviewId
```

Gerekçe:

- Review moderation ayrı bir business feature'dır.
- Bu revizyon sadece admin paneli için read-only görünürlük ekler.
- Yeni review status modeli veya moderation permission davranışı üretilmedi.

## Tamamlanan CRUD Operasyonları

ProductMedia admin lifecycle:

- list: tamamlandı;
- detail: tamamlandı;
- create: mevcut davranış korundu;
- update: mevcut davranış korundu;
- delete: mevcut davranış korundu.

ProductRelation admin lifecycle:

- list: tamamlandı;
- detail: tamamlandı;
- create: mevcut davranış korundu;
- delete: mevcut davranış korundu;
- update: intentionally unsupported.

ProductReview admin lifecycle:

- list: tamamlandı;
- detail: tamamlandı;
- create/update/delete/moderation: intentionally deferred.

## Güncellenen Dosyalar

Product media:

- `src/modules/product-media/product-media-admin.controller.ts`
- `src/modules/product-media/product-media.service.ts`
- `src/modules/product-media/repositories/product-media.repository.ts`
- `src/modules/product-media/mappers/product-media.mapper.ts`
- `src/modules/product-media/dto/list-product-media-query.dto.ts`
- `src/modules/product-media/responses/product-media.response.ts`
- `src/modules/product-media/responses/product-media-list.response.ts`

Product relations:

- `src/modules/product-relations/product-relations-admin.controller.ts`
- `src/modules/product-relations/product-relations.service.ts`
- `src/modules/product-relations/repositories/product-relations.repository.ts`
- `src/modules/product-relations/mappers/product-relations.mapper.ts`
- `src/modules/product-relations/dto/list-product-relations-query.dto.ts`
- `src/modules/product-relations/responses/product-relation.response.ts`
- `src/modules/product-relations/responses/product-relation-list.response.ts`

Product reviews:

- `src/modules/product-reviews/product-reviews-admin.controller.ts`
- `src/modules/product-reviews/product-reviews.service.ts`
- `src/modules/product-reviews/repositories/product-reviews.repository.ts`
- `src/modules/product-reviews/mappers/product-reviews.mapper.ts`
- `src/modules/product-reviews/responses/product-review.response.ts`
- `src/modules/product-reviews/responses/product-review-list.response.ts`

Documentation:

- `docs/basearchitecturedocs/nestjs-api-contract.md`

## Permission Metadata

Product media admin endpoint permissions:

- `GET /api/admin/products/:productId/media`: `catalog.product.read`
- `GET /api/admin/products/media/:mediaId`: `catalog.product.read`
- `POST /api/admin/products/:productId/media`: `catalog.product.update`
- `PATCH /api/admin/products/media/:mediaId`: `catalog.product.update`
- `DELETE /api/admin/products/media/:mediaId`: `catalog.product.update`

Product relation admin endpoint permissions:

- `GET /api/admin/products/:productId/relations`: `catalog.product.read`
- `GET /api/admin/products/relations/:relationId`: `catalog.product.read`
- `POST /api/admin/products/:productId/relations`: `catalog.product.update`
- `DELETE /api/admin/products/relations/:relationId`: `catalog.product.update`

Product review admin endpoint permissions:

- `GET /api/admin/products/:productId/reviews`: `catalog.product.read`
- `GET /api/admin/products/reviews/:reviewId`: `catalog.product.read`

Yeni permission kodu üretilmedi. Mevcut `catalog.review.moderate` permission'ı bu revizyonda kullanılmadı; gelecekteki moderation endpointleri için değerlendirilebilir.

## Response ve Mapper Notu

Entity graph doğrudan response olarak dönmez.

Eklenen response classları:

- `ProductMediaResponse`
- `ProductMediaListResponse`
- `ProductRelationResponse`
- `ProductRelationListResponse`
- `ProductReviewResponse`
- `ProductReviewListResponse`

Mapper metodları response class shape'ini üretir:

- `toProductMediaResponse()`
- `toProductRelationResponse()`
- `toProductReviewResponse()`

Mevcut product detail mapper ile uyumluluk için eski mapper export aliasları korunmuştur.

## Query Davranışı

Product media admin list:

- `page`
- `limit`

Product relation admin list:

- `relationType`
- `page`
- `limit`

Product review admin list:

- `page`
- `limit`

Review status filtresi eklenmedi; bu prompt kapsamında review moderation status modeli yoktur.

## Doküman Güncellemeleri

Güncellenen kanonik doküman:

- `docs/basearchitecturedocs/nestjs-api-contract.md`

API contract içinde şu başlıklar netleştirildi:

- ProductMedia admin CRUD endpointleri;
- ProductRelation admin list/detail/create/delete endpointleri;
- ProductRelation update intentionally unsupported kararı;
- ProductReview public/user-owned endpointleri;
- ProductReview admin read/list/detail endpointleri;
- ProductReview admin moderation/write endpointlerinin intentionally deferred olduğu.

## Çalıştırılan Kontroller

Çalıştırılan komutlar:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/basearchitecturedocs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Sonuç:

- Prettier başarılı.
- Build başarılı.
- Lint başarılı.
- Jest başarılı.

## Migration Notu

Migration gerekmez.

Sebep:

- entity table adları değişmedi;
- column veya relation contract değişmedi;
- bu çalışma endpoint/service/repository/response completion revizyonudur.

## Bilinçli Ertelenen Noktalar

Bu prompt kapsamında aşağıdaki davranışlar değiştirilmedi:

- Product delete vs disable semantiği;
- Category delete davranışı;
- User delete/status davranışı;
- Order veya checkout flow;
- Yeni recommendation engine;
- ProductReview moderation status modeli;
- ProductReview admin write/delete endpointleri;
- ProductRelation update endpointi;
- Tenant/company/store modeli.
