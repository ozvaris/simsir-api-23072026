# Product Subdomain Modules Refactor Prompt

<a id="purpose"></a>

## Purpose

Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde Product domainini daha temiz alt domain modüllerine ayırmanı istiyorum.

Bu çalışma yeni özellik ekleme çalışması değildir. Ana hedef, mevcut Product domaininde birikmiş olan ProductMedia, ProductReview ve ProductRelation sorumluluklarını ayrı product subdomain modüllerine taşımaktır.

Bu refactor, sonraki `delete vs disable` güncellemesinden önce yapılacak. Çünkü Product silme, disable etme ve ilişki kontrolü kararları ProductMedia, ProductReview ve ProductRelation sınırları netleştiğinde daha doğru uygulanabilir.

<a id="documents-to-read"></a>

## Documents To Read First

Önce aşağıdaki dokümanları oku ve kanonik proje standardı kabul et:

- `docs/basearchitecturedocs/architectureguide.md`
- `docs/basearchitecturedocs/backend-docs-index.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`
- `docs/basearchitecturedocs/rbac-module-guide.md`
- `docs/basearchitecturedocs/rbac-api-contract.md`

Sonra mevcut kodu incele:

- `src/modules/products/`
- `src/modules/products/entities/product.entity.ts`
- product media entity dosyası hangi konumdaysa onu bul
- product review entity dosyası hangi konumdaysa onu bul
- product relation entity dosyası hangi konumdaysa onu bul
- product media/review/relation DTO, response, mapper, repository, service ve controller kodlarını bul
- `src/app.module.ts`
- ilgili RBAC permission seed dosyaları

<a id="main-decision"></a>

## Main Decision

Core Product ile Product alt kaynakları aynı servis/model sınırı içinde büyümemeli.

Core Product şu sorumlulukları taşımalı:

- public product list;
- public product detail;
- admin product CRUD;
- product basic fields;
- product status;
- product category ilişkisi;
- product public görünürlük filtreleri.

Aşağıdaki alt domainler ayrı modüllere ayrılmalı:

- `ProductMedia`
- `ProductReview`
- `ProductRelation`

Entity ilişkileri Product entity içinde kalabilir. Ancak bu entity ilişkileri, bütün CRUD ve business logic'in ProductsService içinde kalması anlamına gelmemelidir.

<a id="target-module-structure"></a>

## Target Module Structure

Hedef yapı şu olsun:

```txt
src/modules/products/
  products.module.ts
  products.controller.ts
  products-admin.controller.ts
  products.service.ts
  entities/
    product.entity.ts
  dto/
  responses/
  repositories/
  mappers/

src/modules/product-media/
  product-media.module.ts
  product-media-admin.controller.ts
  product-media.service.ts
  entities/
    product-media.entity.ts
  dto/
  responses/
  repositories/
  mappers/

src/modules/product-reviews/
  product-reviews.module.ts
  product-reviews.controller.ts
  product-reviews-admin.controller.ts
  product-reviews.service.ts
  entities/
    product-review.entity.ts
  dto/
  responses/
  repositories/
  mappers/

src/modules/product-relations/
  product-relations.module.ts
  product-relations-admin.controller.ts
  product-relations.service.ts
  entities/
    product-relation.entity.ts
  dto/
  responses/
  repositories/
  mappers/
```

Eğer mevcut proje içinde controller dosya adları, response klasörleri veya mapper yapısı farklı bir standarda sahipse mevcut stile uy. Ancak sorumluluk ayrımını koru.

<a id="scope"></a>

## Scope

Bu prompt kapsamında yapılacaklar:

1. ProductMedia dosyalarını ProductsModule dışına product-media modülüne ayır.
2. ProductReview dosyalarını ProductsModule dışına product-reviews modülüne ayır.
3. ProductRelation dosyalarını ProductsModule dışına product-relations modülüne ayır.
4. Product core modülünde sadece core product sorumlulukları kalsın.
5. Public product detail response davranışı bozulmasın.
6. Mevcut endpoint pathleri mümkün olduğunca korunmalı.
7. Entity table adları kesinlikle değişmemeli.
8. AppModule ve module import/export yapıları güncellenmeli.
9. Eski import kalıntıları temizlenmeli.
10. Build/lint/test geçmeli.

Bu prompt kapsamında yapılmayacaklar:

- `delete vs disable` davranışını değiştirme.
- Product delete davranışını bu promptta değiştirme.
- Category delete davranışını bu promptta değiştirme.
- User delete/status davranışını bu promptta değiştirme.
- Order veya checkout flow ekleme.
- Product tablo adını değiştirme.
- ProductMedia/ProductReview/ProductRelation tablo adlarını değiştirme.
- Mevcut endpoint pathlerini gereksiz yere değiştirme.
- Tenant/company/store modeli ekleme.
- Yeni recommendation engine tasarlama.

<a id="preserve-database-contract"></a>

## Preserve Database Contract

Entity table adlarını değiştirme.

Mevcut entitylerde şu tarz `@Entity(...)` adları varsa aynen koru:

```ts
@Entity('products')
```

```ts
@Entity('product_media')
```

```ts
@Entity('product_reviews')
```

```ts
@Entity('product_relations')
```

Eğer mevcut tablo adları farklıysa mevcut adları koru. Refactor klasör/modül sınırı refactor'üdür; database table rename çalışması değildir.

`id`, `createdAt`, `updatedAt` alanları `AppBaseEntity` üzerinden geliyorsa tekrar tanımlama.

<a id="preserve-api-contract"></a>

## Preserve API Contract

Mevcut public ve admin endpoint pathlerini koru.

Özellikle dokümanda var olan product review endpointleri korunmalı:

```txt
GET /api/products/:productId/reviews
POST /api/products/:productId/reviews
```

Bu endpointler artık `ProductReviewsModule` içindeki public/authenticated controller tarafından yönetilebilir, ama path değişmemeli.

Product detail endpointleri korunmalı:

```txt
GET /api/products
GET /api/products/:slug
```

Admin product endpointleri korunmalı:

```txt
GET /api/admin/products
GET /api/admin/products/:productId
POST /api/admin/products
PATCH /api/admin/products/:productId
DELETE /api/admin/products/:productId
```

Eğer mevcut kodda product media veya product relation için admin endpointler varsa pathleri koru. Eğer yoksa geniş admin CRUD endpointleri uydurma; sadece mevcut davranışı taşı.

<a id="module-responsibilities"></a>

## Module Responsibilities

### ProductsModule

ProductsModule sadece core product davranışından sorumlu olsun:

- product list;
- product detail;
- admin product create/update/read/delete;
- product status handling;
- category association;
- product basic response mapping;
- product public/admin query filtering.

ProductsModule, ProductMedia/ProductReview/ProductRelation CRUD sorumluluklarını taşımamalı.

### ProductMediaModule

ProductMediaModule ürün medya kayıtlarından sorumlu olsun:

- product media entity;
- product media repository;
- product media response mapping;
- varsa mevcut admin media create/update/delete/list davranışları;
- media sort order;
- media alt/src alanları.

Eğer mevcut media için endpoint yoksa yeni endpoint ekleme; entity/repository/mapping sınırlarını ayırmak yeterli olabilir.

### ProductReviewsModule

ProductReviewsModule ürün yorumlarından sorumlu olsun:

- public/authenticated review list/create endpointleri;
- product review entity;
- product review repository;
- product review response mapping;
- user ownership kuralları gerekiyorsa burada;
- admin moderation endpointleri mevcutsa burada;
- public review akışında inactive product veya inactive category davranışı korunmalı.

Product review akışında current user bilgisi request body'den alınmamalı. Mevcut `@CurrentUser()` pattern'i korunmalı.

### ProductRelationsModule

ProductRelationsModule ürünler arası ilişki kayıtlarından sorumlu olsun:

- product relation entity;
- product relation repository;
- product relation response mapping;
- related product / frequently bought together relationları;
- varsa mevcut admin relation create/update/delete/list davranışları.

Eğer mevcut relation için endpoint yoksa yeni endpoint ekleme; Product detail response içindeki relation davranışını koru.

<a id="product-detail-behavior"></a>

## Product Detail Behavior

Product detail response mevcut davranışı korumalı.

Eğer mevcut `GET /api/products/:slug` response içinde şunlar varsa yine dönmeli:

- media list;
- related products;
- frequently bought together products;
- review summary veya review list.

Ancak bu davranışı korurken bütün CRUD/business logic ProductsService içinde kalmak zorunda değil.

Uygun seçenekler:

1. ProductsRepository relation loading ile detail için gerekli veriyi yükler ve ProductsMapper response üretir.
2. ProductsService, ProductMedia/ProductRelations/ProductReviews query servislerinden sadece gerekli read bilgisini alır.
3. Mevcut davranışı en az değişiklikle koruyan yaklaşımı seç.

Bu refactor sırasında product detail response shape'i gereksiz yere değiştirilmemeli.

<a id="rbac-and-security"></a>

## RBAC And Security

Mevcut RBAC permission davranışını bozma.

Product core admin permissions korunmalı:

- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

Eğer mevcut kodda media/review/relation için ayrı permission yoksa bu promptta yeni permission tasarımı yapma.

Eğer mevcut kodda review moderation için permission varsa koru.

Public endpointlerde `@Public()` davranışı korunmalı.

Authenticated review create gibi endpointlerde global auth/current-user davranışı korunmalı.

Admin endpointlerde `@Public()` olmamalı ve permission metadata korunmalı.

<a id="import-export-rules"></a>

## Import Export Rules

AppModule güncellenmeli:

- `ProductMediaModule` eklenmeli.
- `ProductReviewsModule` eklenmeli.
- `ProductRelationsModule` eklenmeli.
- `ProductsModule` kalmalı.

ProductsModule gereksiz yere alt domainlerin service implementation detaylarını bilmemeli.

Alt modüller Product entity/repository erişimine ihtiyaç duyarsa mevcut proje stiline uygun çözüm kullan:

- TypeOrmModule.forFeature ile Product entity import edilebilir;
- veya ProductsModule bir read/query service export edebilir;
- en az coupling üreten yaklaşımı seç.

Circular dependency oluşturma. Eğer circular dependency oluşuyorsa module sınırını yeniden düzenle ve raporda belirt.

<a id="cleanup-rules"></a>

## Cleanup Rules

Refactor sonrası ProductsModule altında gereksiz kalıntılar kalmamalı.

Şunları kontrol et:

```bash
grep -R "ProductMedia" src/modules/products || true
grep -R "ProductReview" src/modules/products || true
grep -R "ProductRelation" src/modules/products || true
```

Bu grep sonuçları tamamen boş olmak zorunda değildir; `product.entity.ts` relation propertyleri ve product detail mapper/read davranışı nedeniyle referans kalabilir. Ancak ProductMedia/ProductReview/ProductRelation CRUD/service/repository/controller sorumlulukları ProductsModule altında kalmamalı.

Ayrıca eski importların yeni module pathlerine taşındığını kontrol et:

```bash
grep -R "modules/products/entities/product-media" src || true
grep -R "modules/products/entities/product-review" src || true
grep -R "modules/products/entities/product-relation" src || true
```

Eski entity pathleri kalmamalı. Yeni pathler kullanılmalı:

```txt
src/modules/product-media/entities/product-media.entity.ts
src/modules/product-reviews/entities/product-review.entity.ts
src/modules/product-relations/entities/product-relation.entity.ts
```

<a id="documentation-updates"></a>

## Documentation Updates

Gerekirse dokümanları güncelle.

Özellikle:

- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/backend-module-patterns.md`

Eğer repoda kanonik dokümanlar `docs/basearchitecturedocs/` altında ise doğru dosyaları güncelle ve raporda belirt.

Dokümanlarda şu ayrım netleşmeli:

- Product core entity ve davranışları ProductsModule içindedir.
- ProductMedia, ProductReview ve ProductRelation ayrı product subdomain modülleridir.
- Entity relationlar Product entity üzerinde kalabilir, ama CRUD/use-case sorumlulukları ilgili subdomain modüllerindedir.

<a id="commands"></a>

## Commands To Run

Refactor sonrası şu kontrolleri çalıştır:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/basearchitecturedocs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Ayrıca eski path/import kalıntıları için uygun grep kontrollerini çalıştır.

<a id="reporting"></a>

## Reporting

Sonuçta bana şu bilgileri raporla:

- Eklenen yeni modüller;
- taşınan entity dosyaları;
- taşınan DTO/response/mapper/repository/service/controller dosyaları;
- ProductsModule içinde kalan core sorumluluklar;
- ProductMediaModule sorumlulukları;
- ProductReviewsModule sorumlulukları;
- ProductRelationsModule sorumlulukları;
- endpoint pathlerinin değişip değişmediği;
- entity table adlarının değişip değişmediği;
- AppModule değişiklikleri;
- RBAC permission değişikliği yapılıp yapılmadığı;
- grep sonuçları;
- build/lint/test sonuçları;
- migration gerekip gerekmediği;
- bilinçli ertelediğin noktalar.

<a id="important-final-rule"></a>

## Important Final Rule

Bu çalışma refactor çalışmasıdır.

Davranışı genişletme, yeni business feature ekleme, delete/disable semantiğini değiştirme veya order/checkout flow'a geçme.

Önce Product subdomain module sınırlarını netleştir. Sonraki ayrı promptta delete-vs-disable davranışı güncellenecek.
