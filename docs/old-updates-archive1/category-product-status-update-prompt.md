# Category Product Status Update Prompt

<a id="purpose"></a>

## Purpose

Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde Category ve Product domainleri için public/admin veri ayrımını destekleyecek `status` alanı eklemeni istiyorum.

Postman/RBAC testleri sırasında önemli bir mimari boşluk fark ettik: `Category` ve `Product` entitylerinde durum/yayınlanma alanı olmadığı için public endpointler ile admin endpointler veri seviyesi olarak ayrışamıyor.

Bu promptun amacı:

- `Category.status` eklemek;
- `Product.status` eklemek;
- public katalog endpointlerini sadece aktif kayıtları dönecek şekilde düzenlemek;
- admin katalog endpointlerini aktif/pasif kayıtları yönetebilecek şekilde düzenlemek;
- delete davranışını hard delete yerine deactivate mantığına yaklaştırmak;
- mevcut Auth, RBAC, Cart, ShippingCarrier, PaymentMethod ve diğer domainleri bozmadan ilerlemek.

Gerçek checkout/order flow bu prompt kapsamında değildir.

<a id="documents-to-read"></a>

## Documents To Read First

Önce aşağıdaki dokümanları oku ve kanonik proje standardı kabul et:

- `docs/architectureguide.md`
- `docs/backend-docs-index.md`
- `docs/nestjs-api-contract.md`
- `docs/nestjs-entities-and-relations.md`
- `docs/backend-module-patterns.md`
- `docs/rbac-module-guide.md`
- `docs/rbac-api-contract.md`
- `docs/postman-import-zip-protocol.md` varsa oku; ama bu prompt kapsamında Postman dosyası üretme.

Ayrıca mevcut kodu incele:

- `src/common/entities/base.entity.ts`
- `src/common/enums/record-status.enum.ts` varsa
- `src/modules/categories/`
- `src/modules/products/`
- `src/modules/rbac/seed/rbac-seed.data.ts`
- `src/modules/shipping-carriers/`
- `src/modules/payment-methods/`
- `src/app.module.ts`

<a id="problem"></a>

## Problem

Şu anda Category ve Product public/admin ayrımı sadece controller güvenliği seviyesinde var olabilir.

Örnek:

- `GET /api/categories` public olabilir;
- `GET /api/admin/categories` admin/RBAC protected olabilir;
- ama entitylerde `status`, `isActive`, `isPublished` veya benzeri alan yoksa iki endpoint de aynı kayıtları döndürmek zorunda kalır.

Bu e-ticaret için doğru değildir.

Public endpointler vitrin datasını döndürmelidir.
Admin endpointler yönetim datasını döndürmelidir.

Bu nedenle Category ve Product için durum alanı gereklidir.

<a id="main-decision"></a>

## Main Decision

Category ve Product entitylerine status alanı eklenecek.

Mevcut projede `RecordStatus` enum varsa onu kullan.

Beklenen değerler:

```txt
active
inactive
```

Eğer `src/common/enums/record-status.enum.ts` zaten varsa yeni enum oluşturma; mevcut enumu kullan.

Eğer yoksa domain bağımsız ortak enum oluştur:

```txt
src/common/enums/record-status.enum.ts
```

Enum adı:

```ts
RecordStatus;
```

Bu enum shipping-carriers ve payment-methods tarafında zaten kullanılıyorsa aynı pattern birebir takip edilmeli.

<a id="entity-updates"></a>

## Entity Updates

### Category

`src/modules/categories/entities/category.entity.ts` dosyasına status alanı ekle.

Beklenen mantık:

```ts
@Column({
  type: 'enum',
  enum: RecordStatus,
  default: RecordStatus.ACTIVE,
})
status!: RecordStatus;
```

Ancak shipping-carriers/payment-methods entitylerinde `RecordStatus` farklı şekilde kullanıldıysa aynı TypeORM column patternini takip et.

Önemli:

- `id`, `createdAt`, `updatedAt` alanları `AppBaseEntity` üzerinden geliyorsa tekrar tanımlama.
- Mevcut `parentId`, `slug`, `name`, `imgUrl`, `sortOrder`, `parent`, `children`, `products` ilişkilerini bozma.
- Table adını değiştirme.
- Existing migration/table rename oluşturma.

### Product

`src/modules/products/entities/product.entity.ts` dosyasına status alanı ekle.

Beklenen mantık:

```ts
@Column({
  type: 'enum',
  enum: RecordStatus,
  default: RecordStatus.ACTIVE,
})
status!: RecordStatus;
```

Ancak shipping-carriers/payment-methods entitylerinde `RecordStatus` farklı şekilde kullanıldıysa aynı TypeORM column patternini takip et.

Önemli:

- Mevcut `slug`, `title`, `brandName`, `categoryId`, `price`, `discount`, `rating`, `imgUrl`, `shortDescription`, `longDescription` alanlarını bozma.
- Mevcut `category`, `media`, `reviews`, `cartItems`, `sourceRelations`, `targetRelations` ilişkilerini bozma.
- Table adını değiştirme.
- Existing migration/table rename oluşturma.

<a id="dto-updates"></a>

## DTO Updates

### Category DTOs

Mevcut DTO dosyalarını incele ve status alanını mevcut validation stiline göre ekle.

Beklenen davranış:

- `CreateCategoryDto`: `status` opsiyonel olabilir, default `active` entity tarafından verilebilir.
- `UpdateCategoryDto`: `status` güncellenebilir olmalı.
- `ListCategoriesQueryDto` veya admin list query DTO varsa: `status` filter desteklemeli.

Public category list endpointinin query DTO'su varsa public tarafta `status` filtresi açma; public endpoint sadece active döndürmeli.

Admin category list endpointinde `status` filtresi desteklenmeli:

```txt
/api/admin/categories?status=active
/api/admin/categories?status=inactive
```

### Product DTOs

Mevcut DTO dosyalarını incele ve status alanını mevcut validation stiline göre ekle.

Beklenen davranış:

- `CreateProductDto`: `status` opsiyonel olabilir, default `active` entity tarafından verilebilir.
- `UpdateProductDto`: `status` güncellenebilir olmalı.
- `ListProductsQueryDto` veya admin list query DTO varsa: `status` filter desteklemeli.

Public product list endpointinin query DTO'su varsa public tarafta `status` filtresi açma; public endpoint sadece active döndürmeli.

Admin product list endpointinde `status` filtresi desteklenmeli:

```txt
/api/admin/products?status=active
/api/admin/products?status=inactive
```

<a id="response-updates"></a>

## Response Updates

Category ve Product response classlarını incele.

Admin response tarafında status görünmelidir.

Public response tarafında status gösterilip gösterilmeyeceğine mevcut response tasarımına göre karar ver.

Tercih:

- Admin response: `status` içersin.
- Public response: `status` içermeyebilir; çünkü public zaten sadece active kayıtları döndürür.

Eğer projede public/admin response classları ayrılmamışsa, minimum breaking change için mevcut response classına `status` ekleyebilirsin. Ancak mümkünse public/admin response niyetini ayrıştır.

Entity doğrudan controller response'u olarak dönmemeli. Mapper metodları güncellenmeli.

<a id="service-behavior"></a>

## Service Behavior

Public ve admin service metodlarını mümkünse ayır.

### Category Service

Önerilen public metodlar:

```ts
listPublicCategories()
getPublicCategoryBySlug(slug: string)
listPublicCategoryProducts(slug: string, query: ...)
```

Public davranış:

- sadece `Category.status = active` kayıtları döndür;
- tree endpointinde inactive parent veya child category public sonuçta görünmemeli;
- category detail endpointi inactive category için `NotFoundException` dönmeli;
- category products endpointinde inactive category için `NotFoundException` dönmeli.

Önerilen admin metodlar:

```ts
listCategoriesForAdmin(query: ...)
getCategoryForAdmin(idOrSlug: string)
createCategory(dto: CreateCategoryDto)
updateCategory(id: string, dto: UpdateCategoryDto)
deactivateCategory(id: string)
```

Admin davranış:

- active + inactive kayıtları listeleyebilir;
- `status` query filter destekler;
- create/update status alanını yönetebilir;
- delete endpoint hard delete yerine status'u inactive yapabilir.

### Product Service

Önerilen public metodlar:

```ts
listPublicProducts(query: ...)
getPublicProductBySlug(slug: string)
listPublicProductReviews(productId: string, query: ...)
```

Public davranış:

- sadece `Product.status = active` kayıtları döndür;
- mümkünse `Product.category.status = active` koşulunu da uygula;
- inactive product detail için `NotFoundException` dön;
- inactive product public listte görünmemeli;
- inactive category altındaki ürünler public listte görünmemeli.

Önerilen admin metodlar:

```ts
listProductsForAdmin(query: ...)
getProductForAdmin(idOrSlug: string)
createProduct(dto: CreateProductDto)
updateProduct(id: string, dto: UpdateProductDto)
deactivateProduct(id: string)
```

Admin davranış:

- active + inactive kayıtları listeleyebilir;
- `status` query filter destekler;
- create/update status alanını yönetebilir;
- delete endpoint hard delete yerine status'u inactive yapabilir.

<a id="repository-updates"></a>

## Repository Updates

Repository katmanında public/admin query niyetlerini ayır.

### Category Repository

Gerekirse şu niyette metodlar oluştur veya mevcutları güncelle:

```ts
findPublicList(...)
findPublicTree(...)
findPublicBySlug(slug: string)
findAdminList(query: ...)
findAdminById(id: string)
findAdminBySlug(slug: string)
deactivateById(id: string)
```

Public querylerde:

```txt
status = active
```

filtrelenmeli.

Tree querylerde inactive kayıtlar public tree içine girmemeli.

### Product Repository

Gerekirse şu niyette metodlar oluştur veya mevcutları güncelle:

```ts
findPublicList(query: ...)
findPublicBySlug(slug: string)
findPublicByCategorySlug(slug: string, query: ...)
findAdminList(query: ...)
findAdminById(id: string)
findAdminBySlug(slug: string)
deactivateById(id: string)
```

Public querylerde:

```txt
product.status = active
```

ve mümkünse:

```txt
category.status = active
```

filtrelenmeli.

<a id="controller-updates"></a>

## Controller Updates

Public ve admin controller davranışlarını ayır.

### Public Category Controller

Public controller endpointleri `@Public()` kalmalı.

Örnek mantık:

```ts
@Public()
@Get()
listCategories() {
  return this.categoriesService.listPublicCategories();
}
```

`GET /api/categories/tree` public ise sadece active tree döndürmeli.

`GET /api/categories/:slug` public ise inactive category için not found dönmeli.

### Admin Category Controller

Admin controller endpointleri `@Public()` olmamalı.

Read endpointleri permission ile korunmalı.

Örnek mantık:

```ts
@Get()
@Permissions('catalog.category.read')
listCategories() {
  return this.categoriesService.listCategoriesForAdmin(...);
}
```

Create/update/delete endpointlerinde mevcut permission metadata korunmalı:

- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`

### Public Product Controller

Public controller endpointleri `@Public()` kalmalı.

Örnek mantık:

```ts
@Public()
@Get()
listProducts() {
  return this.productsService.listPublicProducts(...);
}
```

`GET /api/products/:slug` public ise inactive product için not found dönmeli.

### Admin Product Controller

Admin controller endpointleri `@Public()` olmamalı.

Read endpointleri permission ile korunmalı.

Örnek mantık:

```ts
@Get()
@Permissions('catalog.product.read')
listProducts() {
  return this.productsService.listProductsForAdmin(...);
}
```

Create/update/delete endpointlerinde mevcut permission metadata korunmalı:

- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

<a id="delete-strategy"></a>

## Delete Strategy

Category ve Product için hard delete yerine deactivate tercih et.

Beklenen davranış:

```txt
DELETE /api/admin/categories/:categoryId
```

- Category kaydını fiziksel olarak silme;
- `status = inactive` yap;
- `{ "success": true }` dön.

```txt
DELETE /api/admin/products/:productId
```

- Product kaydını fiziksel olarak silme;
- `status = inactive` yap;
- `{ "success": true }` dön.

Sebep:

- Category, products ile ilişkili olabilir.
- Product, cart item, order item, review, media, relation gibi domainlere bağlı olabilir.
- Hard delete ileride veri bütünlüğü sorunlarına yol açabilir.

Eğer mevcut kod hard delete yapıyorsa, bu davranışı deactivate olarak değiştir.

<a id="rbac-rules"></a>

## RBAC Rules

Mevcut RBAC permission kodlarını koru.

Category:

- `catalog.category.read`
- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`

Product:

- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

Mevcut CATALOG_MANAGER role-permission seed davranışını bozma.

Eğer `catalog.category.read` veya `catalog.product.read` admin read endpointlerinde eksikse ekle.

Yeni permission kodu üretme.

<a id="documentation-updates"></a>

## Documentation Updates

Kod değişikliğiyle birlikte dokümanları da güncelle.

### `docs/nestjs-entities-and-relations.md`

Category properties içine ekle:

```txt
status
```

Product properties içine ekle:

```txt
status
```

Status anlamını kısa not olarak ekle:

```txt
active public catalogda görünür; inactive admin yönetiminde görünür ama public katalogda görünmez.
```

### `docs/nestjs-api-contract.md`

Categories API ve Products API bölümlerine kısa public/admin ayrımı notu ekle.

Public:

- sadece active kayıtları döndürür.

Admin:

- active + inactive kayıtları yönetebilir;
- `status` query filter destekler;
- delete hard delete değil deactivate davranışı gösterebilir.

Eğer API contract içinde admin category/product endpointleri henüz listelenmemişse, yeni bölüm ekle:

```txt
Admin Categories API
Admin Products API
```

Bunlar endpoint contract olmalı; mimari makaleye dönüşmemeli.

<a id="postman-note"></a>

## Postman Note

Bu prompt kapsamında Postman collection zip dosyası üretme.

Ama raporda hangi Postman testlerinin güncellenmesi gerektiğini belirt.

Beklenen yeni test fikirleri:

- inactive category public listte görünmemeli;
- inactive product public listte görünmemeli;
- admin list `status=inactive` ile inactive kayıtları görebilmeli;
- delete sonrası public endpointte kayıt görünmemeli;
- delete sonrası admin inactive listte kayıt görünmeli.

<a id="migration-note"></a>

## Migration Note

Destructive migration yapma.

Projede migration standardı varsa status alanları için migration oluştur.

Migration standardı yoksa ve development ortamında `synchronize: true` kullanılıyorsa migration oluşturma; raporda production için migration gerektiğini belirt.

Migration kapsaması gereken ana noktalar:

- `categories.status`
- `products.status`
- default value: `active`
- mümkünse index: `status`
- product public query performansı için `status + categoryId` index düşünülebilir.

<a id="tests"></a>

## Required Checks

Refactor sonrası şu komutları çalıştır:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Eğer `docs/**/*.md` prettier komutu projede sorun çıkarırsa sadece değiştirdiğin markdown dosyalarını formatla.

Canlı HTTP test yapabiliyorsan şu davranışları doğrula:

1. `GET /api/categories` token olmadan 200 döner ve sadece active kategori döndürür.
2. `GET /api/products` token olmadan 200 döner ve sadece active ürün döndürür.
3. `GET /api/admin/categories` CATALOG_MANAGER ile 200 döner.
4. `GET /api/admin/products` CATALOG_MANAGER ile 200 döner.
5. `DELETE /api/admin/categories/:id` sonrası category public listte görünmez.
6. `GET /api/admin/categories?status=inactive` silinen/deactive edilen category kaydını gösterir.
7. `DELETE /api/admin/products/:id` sonrası product public listte görünmez.
8. `GET /api/admin/products?status=inactive` silinen/deactive edilen product kaydını gösterir.
9. CUSTOMER admin category/product endpointlerine erişemez ve 403 alır.
10. CATALOG_MANAGER category/product admin CRUD yapabilir.

<a id="reporting"></a>

## Final Report

Sonunda bana şu bilgileri raporla:

- Değiştirilen dosyalar
- Eklenen alanlar
- Kullanılan enum ve konumu
- Category public/admin behavior değişiklikleri
- Product public/admin behavior değişiklikleri
- Delete/deactivate davranışı
- RBAC permission metadata değişti mi?
- Doküman güncellemeleri
- Migration notu
- Çalıştırılan komutlar
- Build/lint/test sonucu
- Canlı HTTP test yaptıysan sonuçları
- Bilinçli ertelediğin noktalar
