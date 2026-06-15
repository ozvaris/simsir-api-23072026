# Product Submodules Refactor Result

Bu dosya, `docs/product-submodules-refactor-prompt.md` talebine göre Product domainindeki `ProductMedia`, `ProductReview` ve `ProductRelation` sorumluluklarının ayrı product subdomain modüllerine taşınmasının reviewer özeti olarak hazırlanmıştır.

## Kapsam

Mevcut NestJS + TypeORM + PostgreSQL mimari çizgisi korunarak Product domaini alt modüllere ayrıldı.

Ana hedefler:

- core product davranışlarının `ProductsModule` içinde kalması;
- product media CRUD/use-case sorumluluklarının `ProductMediaModule` içine taşınması;
- product review list/create/update/delete akışlarının `ProductReviewsModule` içine taşınması;
- product relation create/delete akışlarının `ProductRelationsModule` içine taşınması;
- mevcut endpoint pathlerinin korunması;
- entity table adlarının korunması;
- RBAC permission davranışının değiştirilmemesi.

Bu çalışma yeni business feature ekleme çalışması değildir. Delete/disable semantiği, order/checkout flow ve yeni moderation tasarımı kapsam dışında bırakıldı.

## Eklenen Modüller

Yeni modül yolları:

```txt
src/modules/product-media/
src/modules/product-reviews/
src/modules/product-relations/
```

Uygulamaya bağlanan module dosyaları:

- `src/modules/product-media/product-media.module.ts`
- `src/modules/product-reviews/product-reviews.module.ts`
- `src/modules/product-relations/product-relations.module.ts`

`src/app.module.ts` içine şu module importları eklendi:

- `ProductMediaModule`
- `ProductReviewsModule`
- `ProductRelationsModule`

`ProductsModule` uygulamada kalmaya devam eder.

## Taşınan Entity Dosyaları

Entity dosyaları ProductsModule altından ilgili subdomain modüllerine taşındı:

- `src/modules/products/entities/product-media.entity.ts` -> `src/modules/product-media/entities/product-media.entity.ts`
- `src/modules/products/entities/product-review.entity.ts` -> `src/modules/product-reviews/entities/product-review.entity.ts`
- `src/modules/products/entities/product-relation.entity.ts` -> `src/modules/product-relations/entities/product-relation.entity.ts`

`Product` entity üzerindeki relation propertyleri korundu:

- `media`
- `reviews`
- `sourceRelations`
- `targetRelations`

Bu relationlar product detail response için kullanılabilir; ancak CRUD/use-case sorumlulukları artık `ProductsService` içinde değildir.

## Taşınan DTO ve Enum Dosyaları

Product media DTO dosyaları:

- `src/modules/product-media/dto/create-product-media.dto.ts`
- `src/modules/product-media/dto/update-product-media.dto.ts`

Product review DTO dosyaları:

- `src/modules/product-reviews/dto/create-product-review.dto.ts`
- `src/modules/product-reviews/dto/update-product-review.dto.ts`
- `src/modules/product-reviews/dto/list-reviews-query.dto.ts`

Product relation DTO ve enum dosyaları:

- `src/modules/product-relations/dto/create-product-relation.dto.ts`
- `src/modules/product-relations/enums/product-relation-type.enum.ts`

## Mapper, Repository, Service ve Controller Dosyaları

Product media için eklenen dosyalar:

- `src/modules/product-media/mappers/product-media.mapper.ts`
- `src/modules/product-media/repositories/product-media.repository.ts`
- `src/modules/product-media/product-media.service.ts`
- `src/modules/product-media/product-media-admin.controller.ts`

Product reviews için eklenen dosyalar:

- `src/modules/product-reviews/mappers/product-reviews.mapper.ts`
- `src/modules/product-reviews/repositories/product-reviews.repository.ts`
- `src/modules/product-reviews/product-reviews.service.ts`
- `src/modules/product-reviews/product-reviews.controller.ts`
- `src/modules/product-reviews/product-reviews-admin.controller.ts`

Product relations için eklenen dosyalar:

- `src/modules/product-relations/mappers/product-relations.mapper.ts`
- `src/modules/product-relations/repositories/product-relations.repository.ts`
- `src/modules/product-relations/product-relations.service.ts`
- `src/modules/product-relations/product-relations-admin.controller.ts`

Not: Product reviews için mevcut admin moderation endpointi olmadığı için `ProductReviewsAdminController` boş bırakıldı; yeni moderation davranışı eklenmedi.

## ProductsModule İçinde Kalan Core Sorumluluklar

`ProductsModule` içinde kalan sorumluluklar:

- public product list;
- public product detail;
- admin product list/detail/create/update/delete;
- product basic fields;
- product status handling;
- product category association;
- public/admin product query filtering;
- product detail response mapping.

`ProductsService` içinden media, review ve relation CRUD/use-case metodları çıkarıldı.

`ProductsRepository` içinde core product/category data access metodları kaldı. Product detail için gerekli relation loading korunarak response shape bozulmadı.

## ProductMediaModule Sorumlulukları

`ProductMediaModule` şu sorumlulukları üstlenir:

- `ProductMedia` entity registration;
- product media repository access;
- media create/update/delete use-case akışları;
- media response mapping;
- existing admin media endpointleri.

Mevcut admin pathleri korundu:

- `POST /api/admin/products/:productId/media`
- `PATCH /api/admin/products/media/:mediaId`
- `DELETE /api/admin/products/media/:mediaId`

## ProductReviewsModule Sorumlulukları

`ProductReviewsModule` şu sorumlulukları üstlenir:

- `ProductReview` entity registration;
- public product review list;
- authenticated review create/update/delete;
- current-user tabanlı ownership kontrolü;
- review response mapping;
- review değişikliklerinden sonra product rating recalculation.

Mevcut public/authenticated pathler korundu:

- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews`
- `PATCH /api/products/:productId/reviews/:reviewId`
- `DELETE /api/products/:productId/reviews/:reviewId`

Review create/update/delete akışında user bilgisi request body'den alınmaz. Mevcut `@CurrentUser('userId')` pattern'i korunur.

## ProductRelationsModule Sorumlulukları

`ProductRelationsModule` şu sorumlulukları üstlenir:

- `ProductRelation` entity registration;
- relation create/delete use-case akışları;
- source/target product existence kontrolü;
- same-product relation engeli;
- unique relation kontrolü;
- relation response mapping;
- existing admin relation endpointleri.

Mevcut admin pathleri korundu:

- `POST /api/admin/products/:productId/relations`
- `DELETE /api/admin/products/relations/:relationId`

## Product Detail Davranışı

`GET /api/products/:slug` davranışı korunur.

Product detail response içinde mevcut media ve relation shape'i korunmaya devam eder:

- media list;
- `relations.frequentlyBoughtTogether`;
- `relations.relatedProducts`.

Bu davranış için `ProductsRepository.findProductBySlug()` relation loading kullanmaya devam eder. CRUD/use-case sorumlulukları ise ilgili subdomain service/repository sınıflarındadır.

## Endpoint ve Table Contract

Endpoint pathleri değiştirilmedi.

Entity table adları değiştirilmedi:

- `products`
- `product_media`
- `product_reviews`
- `product_relations`

Bu refactor klasör/modül sınırı refactor'üdür; database rename çalışması değildir.

## RBAC

Yeni permission kodu üretilmedi.

Mevcut permission metadata korundu:

- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

Media ve relation admin mutation endpointleri mevcut `catalog.product.update` permission ile çalışmaya devam eder.

Admin endpointlere `@Public()` eklenmedi.

## Doküman Güncellemeleri

Güncellenen kanonik dokümanlar:

- `docs/basearchitecturedocs/backend-module-patterns.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`

Not: Repo içinde kanonik dokümanlar `docs/basearchitecturedocs/` altında olduğu için bu dosyalar güncellendi.

Dokümanlarda şu ayrım netleştirildi:

- core product davranışları `ProductsModule` içindedir;
- `ProductMedia`, `ProductReview` ve `ProductRelation` ayrı product subdomain modülleridir;
- entity relationlar `Product` üzerinde kalabilir;
- subresource CRUD/use-case sorumlulukları ilgili subdomain modüllerindedir.

## Grep Kontrolleri

Eski entity import pathleri için kontroller boş döndü:

```bash
grep -R "modules/products/entities/product-media" src || true
grep -R "modules/products/entities/product-review" src || true
grep -R "modules/products/entities/product-relation" src || true
```

Eski DTO/enum pathleri için kontroller boş döndü:

```bash
grep -R "modules/products/dto/create-product-media" src || true
grep -R "modules/products/dto/create-product-review" src || true
grep -R "modules/products/dto/create-product-relation" src || true
grep -R "modules/products/dto/update-product-media" src || true
grep -R "modules/products/dto/update-product-review" src || true
grep -R "modules/products/dto/list-reviews" src || true
grep -R "modules/products/enums/product-relation-type" src || true
```

`src/modules/products` altında `ProductMedia`, `ProductReview` ve `ProductRelation` için kalan referanslar bilinçli olarak sadece şu alanlardadır:

- `src/modules/products/entities/product.entity.ts` relation propertyleri;
- `src/modules/products/mappers/products.mapper.ts` product detail response mapping için media/relation referansları.

ProductsModule altında media/review/relation CRUD service, repository veya controller sorumluluğu kalmadı.

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
- Jest başarılı: `1 passed`.

## Migration Notu

Migration gerekmez.

Sebep:

- entity table adları değişmedi;
- column veya relation contract değişmedi;
- bu çalışma modül/klasör/sorumluluk ayrımı refactor'üdür.

## Bilinçli Ertelenen Noktalar

Bu prompt kapsamında aşağıdaki davranışlar değiştirilmedi:

- product delete vs disable semantiği;
- category delete davranışı;
- user delete/status davranışı;
- order veya checkout flow;
- yeni recommendation engine;
- yeni review moderation endpoint veya permission tasarımı;
- tenant/company/store modeli.
