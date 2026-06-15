# Category Product Hard Delete Result

Bu dosya, Category ve Product delete/status davranışının ayrıştırılması için yapılan güncellemenin reviewer özeti olarak hazırlanmıştır.

## Kapsam

Category ve Product admin delete endpointleri hard delete denemesi yapacak şekilde güncellendi.

Ana hedefler:

- `DELETE` endpointlerinin `status = inactive` yapmaması;
- status değişiminin `PATCH` endpointlerinde kalması;
- ilişkili kayıtlar varsa hard delete işleminin `409 Conflict` ile engellenmesi;
- beklenmeyen database/FK conflict hatalarının anlamlı API hatasına çevrilmesi;
- public active/inactive filtreleme davranışının korunması.

RBAC permission isimleri, endpoint pathleri, Postman koleksiyonları, checkout/order flow ve unrelated domain delete davranışları değiştirilmedi.

## Category Delete Davranışı

Güncellenen endpoint:

```txt
DELETE /api/admin/categories/:categoryId
```

Final davranış:

- Category yoksa `404 Not Found` döner.
- Child category varsa `409 Conflict` döner.
- Product varsa `409 Conflict` döner.
- Bloklayan ilişki yoksa category fiziksel olarak silinir.
- Delete işlemi category status değerini değiştirmez.
- Beklenmeyen database/FK conflict hatası anlamlı `409 Conflict` response'a çevrilir.

Child category kontrolü:

- `CategoriesRepository.countChildren(categoryId)` ile yapılır.
- Status filtresi uygulanmaz.
- `active` ve `inactive` child category kayıtları birlikte sayılır.

Product kontrolü:

- `CategoriesRepository.countProducts(categoryId)` ile yapılır.
- Status filtresi uygulanmaz.
- `active` ve `inactive` product kayıtları birlikte sayılır.

## Category Status Davranışı

Status değişimi mevcut update endpointinde kalır:

```txt
PATCH /api/admin/categories/:categoryId
body: { "status": "inactive" }
body: { "status": "active" }
```

Public category endpointleri mevcut active filtreleme davranışını korur.

## Product Delete Davranışı

Güncellenen endpoint:

```txt
DELETE /api/admin/products/:productId
```

Final davranış:

- Product yoksa `404 Not Found` döner.
- Cart item varsa `409 Conflict` döner.
- Product media varsa `409 Conflict` döner.
- Product review varsa `409 Conflict` döner.
- Product relation içinde source veya target olarak kullanılıyorsa `409 Conflict` döner.
- Bloklayan ilişki yoksa product fiziksel olarak silinir.
- Delete işlemi product status değerini değiştirmez.
- Beklenmeyen database/FK conflict hatası anlamlı `409 Conflict` response'a çevrilir.

Related record kontrolleri:

- `ProductsRepository.countCartItems(productId)`
- `ProductsRepository.countMedia(productId)`
- `ProductsRepository.countReviews(productId)`
- `ProductsRepository.countRelations(productId)`

Bu kontroller status filtresi kullanmaz. Product'a bağlı kayıt varlığı delete için bloklayıcı kabul edilir.

## Product Status Davranışı

Status değişimi mevcut update endpointinde kalır:

```txt
PATCH /api/admin/products/:productId
body: { "status": "inactive" }
body: { "status": "active" }
```

Public product endpointleri mevcut active product ve active category filtreleme davranışını korur.

## Entity Relation Güncellemeleri

Category parent-child relation:

- `Category.parent` relation `onDelete: 'SET NULL'` yerine `onDelete: 'RESTRICT'` oldu.

Product related entity relationları:

- `ProductMedia.product` relation `onDelete: 'RESTRICT'` oldu.
- `ProductReview.product` relation `onDelete: 'RESTRICT'` oldu.
- `ProductRelation.sourceProduct` relation `onDelete: 'RESTRICT'` oldu.
- `ProductRelation.targetProduct` relation `onDelete: 'RESTRICT'` oldu.

Amaç:

- Hard delete işleminin bağlı kayıtları otomatik detach veya cascade delete ile temizlememesi;
- servis seviyesindeki ilişki kontrolleriyle aynı business niyetini database relation tarafında da korumak.

## Güncellenen Dosyalar

Category:

- `src/modules/categories/categories.service.ts`
- `src/modules/categories/repositories/categories.repository.ts`
- `src/modules/categories/entities/category.entity.ts`

Product:

- `src/modules/products/products.service.ts`
- `src/modules/products/repositories/products.repository.ts`
- `src/modules/product-media/entities/product-media.entity.ts`
- `src/modules/product-reviews/entities/product-review.entity.ts`
- `src/modules/product-relations/entities/product-relation.entity.ts`

Documentation:

- `docs/basearchitecturedocs/nestjs-api-contract.md`
- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`

## Permission Durumu

Yeni permission eklenmedi.

Mevcut permission davranışı korundu:

- Category delete: `catalog.category.delete`
- Category update/status: `catalog.category.update`
- Product delete: `catalog.product.delete`
- Product update/status: `catalog.product.update`

## Migration Notu

Migration oluşturulmadı.

Sebep:

- `src/app.module.ts` içinde development ortamı için `synchronize: true` açık.

Production migration sürecinde aşağıdaki FK davranışları ayrıca yansıtılmalıdır:

- `categories.parentId` için `ON DELETE RESTRICT`;
- `product_media.productId` için `ON DELETE RESTRICT`;
- `product_reviews.productId` için `ON DELETE RESTRICT`;
- `product_relations.sourceProductId` için `ON DELETE RESTRICT`;
- `product_relations.targetProductId` için `ON DELETE RESTRICT`.

Order item entity şu an kod tabanında bulunmadığı için Product delete guard içinde order item count kontrolü eklenmedi. Order item modeli eklendiğinde Product delete akışına order item relation kontrolü de eklenmelidir.

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

## Bilinçli Olarak Değiştirilmeyenler

- Product, Category ve related entity endpoint pathleri değiştirilmedi.
- RBAC permission isimleri değiştirilmedi.
- Postman koleksiyonları değiştirilmedi.
- Checkout/order flow değiştirilmedi.
- Public endpoint active filtreleme davranışı değiştirilmedi.
- ShippingCarrier, PaymentMethod, User ve diğer domain delete davranışları değiştirilmedi.
