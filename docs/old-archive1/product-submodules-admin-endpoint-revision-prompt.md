# Product Submodules Admin Endpoint Revision Prompt

## Purpose

Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projesinde daha önce yapılan Product submodules refactor sonrasında, product alt kaynaklarının admin endpoint eksiklerini değerlendirmeli ve gerekli olanları tamamlamalısın.

Bu prompt yeni bir product submodule refactor prompt'u değildir. Refactor zaten yapılmıştır. Bu çalışma, refactor sonrası ortaya çıkan admin endpoint / CRUD completion boşluklarını tamamlamak içindir.

## Read These Canonical Documents First

Önce aşağıdaki kanonik mimari dokümanları oku:

- `docs/basearchitecturedocs/architectureguide.md`
- `docs/basearchitecturedocs/backend-docs-index.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/rbac-module-guide.md`
- `docs/basearchitecturedocs/rbac-api-contract.md`
- `docs/basearchitecturedocs/rbac-role-permission-matrix.md`

Özellikle şu prensipleri dikkate al:

- Manageable resource için CRUD lifecycle düşünülmelidir.
- Eksik bırakılan CRUD operasyonları bilinçli, gerekçeli ve dokümante edilmiş olmalıdır.
- Public, authenticated user-owned ve admin/internal endpointler ayrılmalıdır.
- Admin/internal endpointler public olmamalıdır.
- Admin/internal endpointler RBAC permission metadata ile korunmalıdır.
- Controller sadece HTTP input alıp service'e devretmelidir.
- Business/use-case akışı service içinde kalmalıdır.
- Data access repository sınıflarında toplanmalıdır.
- Entity doğrudan response olarak dönmemelidir.
- Response class / mapper yaklaşımı korunmalıdır.

## Inspect Current Code

Önce mevcut product submodule yapısını incele:

- `src/modules/products/`
- `src/modules/product-media/`
- `src/modules/product-reviews/`
- `src/modules/product-relations/`
- `src/modules/rbac/`
- `src/app.module.ts`

Mevcut endpointleri, controller pathlerini, DTO'ları, response classlarını, mapperları, service metodlarını ve repository metodlarını incelemeden yeni endpoint ekleme.

## Background

Product domain refactor sonrası beklenen ana modül ayrımı şu şekildedir:

- `ProductsModule`: core product behavior
- `ProductMediaModule`: product media management
- `ProductReviewsModule`: product review user-owned flow
- `ProductRelationsModule`: product-to-product relation management

Refactor sonucunda mevcut endpoint pathleri korunmuştur. Bu revizyonun hedefi, mevcut davranışı bozmadan admin endpoint eksiklerini tamamlamaktır.

## Scope

Bu prompt kapsamında yapılacaklar:

- Product submodule admin endpoint eksiklerini analiz et.
- Gerekli admin list/detail endpointlerini ekle.
- Eksik bırakılması gereken operasyonları result raporunda açıkça `intentionally unsupported` olarak gerekçelendir.
- API contract dokümanını güncelle.
- Response/DTO/repository/service/controller yapısını mevcut mimari stile göre tamamla.
- RBAC permission metadata'yı doğru endpointlere ekle.

Bu prompt kapsamında yapılmayacaklar:

- Product submodules klasörlerini yeniden refactor etme.
- Entity table adlarını değiştirme.
- Database rename veya destructive migration yapma.
- Product delete vs disable semantiğini değiştirme.
- Category delete davranışını değiştirme.
- User delete/status davranışını değiştirme.
- Order veya checkout flow'a geçme.
- Yeni recommendation engine tasarlama.
- Yeni tenant/company/store modeli ekleme.
- Product review moderation status tasarımı ekleme.
- Endpoint pathlerini gereksiz değiştirme.

## Target Admin Endpoint Matrix

Aşağıdaki endpoint matrisini hedef al. Mevcut endpoint varsa davranışı bozma; eksik endpoint varsa uygun katmanda tamamla.

### Product Media Admin Endpoints

Product media admin endpointleri şu şekilde olmalıdır:

```txt
GET    /api/admin/products/:productId/media
GET    /api/admin/products/media/:mediaId
POST   /api/admin/products/:productId/media
PATCH  /api/admin/products/media/:mediaId
DELETE /api/admin/products/media/:mediaId
```

Beklenen durum:

- `POST /api/admin/products/:productId/media` mevcutsa korunmalı.
- `PATCH /api/admin/products/media/:mediaId` mevcutsa korunmalı.
- `DELETE /api/admin/products/media/:mediaId` mevcutsa korunmalı.
- Eksikse `GET /api/admin/products/:productId/media` eklenmeli.
- Eksikse `GET /api/admin/products/media/:mediaId` eklenmeli.

Permission önerisi:

- read/list/detail: `catalog.product.read`
- create/update/delete: `catalog.product.update`

Response beklentisi:

- List response entity graph olarak dönmemeli.
- `ProductMediaResponse` veya mevcut response standardı kullanılmalı.
- Detail response gerekiyorsa aynı response class veya `ProductMediaDetailResponse` kullanılabilir.

### Product Relations Admin Endpoints

Product relation admin endpointleri şu şekilde olmalıdır:

```txt
GET    /api/admin/products/:productId/relations
GET    /api/admin/products/relations/:relationId
POST   /api/admin/products/:productId/relations
DELETE /api/admin/products/relations/:relationId
```

Beklenen durum:

- `POST /api/admin/products/:productId/relations` mevcutsa korunmalı.
- `DELETE /api/admin/products/relations/:relationId` mevcutsa korunmalı.
- Eksikse `GET /api/admin/products/:productId/relations` eklenmeli.
- Eksikse `GET /api/admin/products/relations/:relationId` eklenmeli.

`PATCH /api/admin/products/relations/:relationId` için karar:

- Bu revizyonda varsayılan olarak ekleme.
- Product relation genelde yanlışsa silinip yeniden oluşturulabilir.
- Eğer mevcut domain modelinde gerçekten güncellenebilir bir alan varsa değerlendirebilirsin.
- Eklemiyorsan result dosyasında açıkça yaz:

```txt
ProductRelation update intentionally unsupported. Use delete + create instead.
```

Permission önerisi:

- read/list/detail: `catalog.product.read`
- create/delete: `catalog.product.update`

Response beklentisi:

- `ProductRelationResponse` veya mevcut relation response standardı kullanılmalı.
- Response içinde raw entity graph dönmemeli.

### Product Reviews Endpoints

Mevcut user-owned review endpointleri korunmalı:

```txt
GET    /api/products/:productId/reviews
POST   /api/products/:productId/reviews
PATCH  /api/products/:productId/reviews/:reviewId
DELETE /api/products/:productId/reviews/:reviewId
```

Bu revizyonda eklenecek admin read endpointleri:

```txt
GET    /api/admin/products/:productId/reviews
GET    /api/admin/products/reviews/:reviewId
```

Bu endpointlerin amacı:

- Admin panelinde ürün yorumlarını görebilmek.
- Belirli bir review kaydını inceleyebilmek.
- Yeni moderation behavior üretmeden read-only admin görünürlük sağlamak.

Bu revizyonda eklenmeyecek review moderation/write endpointleri:

```txt
PATCH  /api/admin/products/reviews/:reviewId/status
DELETE /api/admin/products/reviews/:reviewId
```

Bunlar bu prompt kapsamında eklenmemeli. Çünkü review moderation ayrı bir business feature'dır.

Result dosyasında şu notu açıkça yaz:

```txt
ProductReview admin moderation/write endpoints intentionally deferred. This revision adds only admin read/list/detail endpoints.
```

Permission önerisi:

- admin review list/detail: `catalog.product.read`

Eğer projede mevcut ve aktif olarak kullanılan `catalog.review.moderate` permission'ı varsa, onu sadece gelecekteki moderation endpointleri için not olarak anabilirsin. Bu prompt kapsamında yeni moderation permission veya endpoint ekleme.

## Public Endpoint Behavior Must Stay The Same

Aşağıdaki public/authenticated endpointlerin mevcut davranışını bozma:

```txt
GET    /api/products/:slug
GET    /api/products/:productId/reviews
POST   /api/products/:productId/reviews
PATCH  /api/products/:productId/reviews/:reviewId
DELETE /api/products/:productId/reviews/:reviewId
```

Product detail response içinde mevcut media/relation shape korunmalı:

- media list;
- frequently bought together relations;
- related product relations.

Bu revision, product detail response shape'i bozmayacak.

## Controller Rules

Admin controllers:

- `@Public()` içermemeli.
- Permission metadata içermeli.
- Sadece HTTP input alıp service'e devretmeli.
- Business logic içermemeli.

Public/authenticated controllers:

- Mevcut `@Public()` ve `@CurrentUser()` davranışlarını bozma.
- User-owned review update/delete işlemlerinde ownership korunmalı.

## Service Rules

Service metodları use-case akışını taşımalı:

Product media service:

- list media by product id;
- get media detail by media id;
- create media;
- update media;
- delete media.

Product relations service:

- list relations by product id;
- get relation detail by relation id;
- create relation;
- delete relation.

Product reviews service:

- public list reviews by product id;
- user-owned create/update/delete review;
- admin list reviews by product id;
- admin review detail by review id.

## Repository Rules

Repository metodları data access niyetini açıkça göstermeli.

Örnek niyet isimleri:

```txt
findMediaByProductId
findMediaById
findRelationByProductId
findRelationById
findReviewsByProductId
findReviewById
findOwnedReview
```

Repository business kararı vermemeli; sadece data access yürütmeli.

## DTO and Query Rules

Eksik list endpointleri için query DTO gerekiyorsa ekle.

Önerilen query alanları:

Product media list:

- `page`
- `limit`

Product relations list:

- `relationType`
- `page`
- `limit`

Product reviews admin list:

- `page`
- `limit`
- ileride moderation status gelirse `status`, ama bu prompt kapsamında yeni review status ekleme.

Mevcut query DTO varsa onu genişlet; gereksiz duplicate DTO üretme.

## Response Rules

Entity doğrudan dönme.

Gerekirse şu response classları eklenebilir veya mevcut olanlar kullanılabilir:

- `ProductMediaResponse`
- `ProductMediaListResponse`
- `ProductRelationResponse`
- `ProductRelationListResponse`
- `ProductReviewResponse`
- `ProductReviewListResponse`

Response mapper metod isimleri mevcut stile uymalı:

```txt
toProductMediaResponse()
toProductRelationResponse()
toProductReviewResponse()
```

## Documentation Updates

Kanonik dokümanları güncelle:

- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md` sadece gerekliyse;
- `docs/basearchitecturedocs/backend-module-patterns.md` sadece pattern açıklaması gerekiyorsa.

API contract içinde product subresource admin endpointleri açıkça görünmeli.

Dokümanda özellikle şunu netleştir:

- ProductMedia admin CRUD endpointleri;
- ProductRelation admin list/detail/create/delete endpointleri;
- ProductRelation update intentionally unsupported ise gerekçesi;
- ProductReview public/user-owned endpoints;
- ProductReview admin read/list/detail endpoints;
- ProductReview admin moderation/write endpoints intentionally deferred.

## RBAC Documentation

Yeni permission kodu üretme.

Mevcut permissionlar yeterli olmalı:

- `catalog.product.read`
- `catalog.product.update`

Eğer mevcut codebase farklı permission kullanıyorsa mevcut standarda uy ve result dosyasında açıkla.

## Tests and Verification

Aşağıdaki komutları çalıştır:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/basearchitecturedocs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Canlı HTTP testi bu prompt kapsamında zorunlu değil. Ancak endpoint listesi ve permission metadata result dosyasında açıkça raporlanmalı.

## Required Final Report

İş bitince result md dosyasında şunları yaz:

- Eklenen endpointler
- Korunan endpointler
- Bilinçli olarak eklenmeyen endpointler
- Hangi CRUD operasyonları tamamlandı?
- Hangi CRUD operasyonları intentionally unsupported?
- Güncellenen controller/service/repository/dto/response/mapper dosyaları
- Permission metadata listesi
- Doküman güncellemeleri
- Build/lint/test sonuçları
- Migration gerekip gerekmediği
- Bilinçli ertelenen noktalar
