# Category Product Status Update Result

Bu dosya, `docs/category-product-status-update-prompt.md` talebine göre Category ve Product domainleri için eklenen status/public-admin ayrımı güncellemesinin reviewer özeti olarak hazırlanmıştır.

## Kapsam

Mevcut NestJS + TypeORM + PostgreSQL mimari çizgisi korunarak Category ve Product entitylerine `status` alanı eklendi.

Ana hedefler:

- public katalog endpointlerinin sadece `active` kayıtları döndürmesi;
- admin katalog endpointlerinin `active` ve `inactive` kayıtları yönetebilmesi;
- admin list endpointlerinde `status` filtresi desteklenmesi;
- category/product delete davranışının hard delete yerine deactivate olması.

Gerçek checkout/order flow kapsam dışı bırakıldı. Mevcut Auth, RBAC, Cart, ShippingCarrier, PaymentMethod ve diğer domainler bozulmadı.

## Kullanılan Enum

Mevcut ortak enum kullanıldı:

```txt
src/common/enums/record-status.enum.ts
```

Enum değerleri:

- `active`
- `inactive`

Yeni enum oluşturulmadı. ShippingCarrier ve PaymentMethod tarafındaki pattern takip edildi.

## Entity Güncellemeleri

Güncellenen entity dosyaları:

- `src/modules/categories/entities/category.entity.ts`
- `src/modules/products/entities/product.entity.ts`

Eklenen alan:

```ts
@Index()
@Column({
  type: 'varchar',
  length: 20,
  default: RecordStatus.ACTIVE,
})
status!: RecordStatus;
```

`id`, `createdAt` ve `updatedAt` alanları mevcut `AppBaseEntity` üzerinden gelmeye devam eder.

Tablo adı, mevcut relation yapıları ve mevcut alanlar değiştirilmedi.

## DTO Güncellemeleri

Category DTO güncellemeleri:

- `src/modules/categories/dto/create-category.dto.ts`
- `src/modules/categories/dto/update-category.dto.ts`
- `src/modules/categories/dto/list-categories-query.dto.ts`

Product DTO güncellemeleri:

- `src/modules/products/dto/create-product.dto.ts`
- `src/modules/products/dto/update-product.dto.ts`
- `src/modules/products/dto/list-admin-products-query.dto.ts`

Davranış:

- create DTO'larında `status` opsiyoneldir; verilmezse entity/service default olarak `active` kullanır.
- update DTO'larında `status` güncellenebilir.
- public query DTO'larına `status` eklenmedi.
- admin list query DTO'larında `status` filtresi desteklenir.

## Response ve Mapper Güncellemeleri

Category response classları güncellendi:

- `src/modules/categories/responses/category.response.ts`
- `src/modules/categories/responses/category-product.response.ts`

Product mapper güncellendi:

- `src/modules/products/mappers/products.mapper.ts`

Admin/public response classları tamamen ayrıştırılmadığı için minimum breaking change yaklaşımıyla mevcut response outputlarına `status` alanı eklendi.

## Category Davranışı

Public category davranışı:

- `GET /api/categories` sadece `active` kategorileri döndürür.
- `GET /api/categories/tree` sadece `active` root kategorileri döndürür; inactive child kayıtlar response dışında kalır.
- `GET /api/categories/:slug` inactive category için `NotFoundException` döndürür.
- `GET /api/categories/:slug/products` inactive category için `NotFoundException` döndürür.
- Category products response içinde sadece `active` product kayıtları listelenir.

Admin category davranışı:

- `GET /api/admin/categories` eklendi.
- `GET /api/admin/categories/:categoryId` eklendi.
- Admin list endpointi `status`, `search`, `page`, `limit` query parametrelerini destekler.
- Create/update akışı `status` alanını yönetebilir.
- Delete akışı hard delete yerine `status = inactive` yapar.

## Product Davranışı

Public product davranışı:

- `GET /api/products` sadece `active` product kayıtlarını döndürür.
- Public product list ayrıca product'ın category kaydının `active` olmasını ister.
- `GET /api/products/:slug` inactive product veya inactive category altındaki product için `NotFoundException` döndürür.
- Public review list/create akışı inactive product veya inactive category altındaki product için `NotFoundException` döndürür.
- Product detail relation target product tarafında inactive productlar filtrelenir.

Admin product davranışı:

- `GET /api/admin/products` eklendi.
- `GET /api/admin/products/:productId` eklendi.
- Admin list endpointi `categorySlug`, `status`, `search`, `page`, `limit` query parametrelerini destekler.
- Create/update akışı `status` alanını yönetebilir.
- Delete akışı hard delete yerine `status = inactive` yapar.

## Repository Güncellemeleri

Category repository içinde public/admin niyeti ayrıldı:

- public list active filtreli çalışır;
- public slug detail/products active category filtreli çalışır;
- admin list status/search/pagination destekler.

Product repository içinde public/admin niyeti ayrıldı:

- public list `product.status = active` ve `category.status = active` koşullarıyla çalışır;
- public slug detail aynı active koşullarını uygular;
- public product id lookup review akışları için active product/category koşullarını uygular;
- admin list status/search/category/pagination destekler.

## RBAC

Yeni permission kodu üretilmedi.

Mevcut permission metadata korundu:

- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

Yeni admin read endpointlerine mevcut read permission'ları eklendi:

- `catalog.category.read`
- `catalog.product.read`

## Delete / Deactivate Davranışı

Category delete:

```txt
DELETE /api/admin/categories/:categoryId
```

Kayıt fiziksel olarak silinmez. `status = inactive` yapılır ve `{ "success": true }` döner.

Product delete:

```txt
DELETE /api/admin/products/:productId
```

Kayıt fiziksel olarak silinmez. `status = inactive` yapılır ve `{ "success": true }` döner.

## Doküman Güncellemeleri

Güncellenen dokümanlar:

- `docs/basearchitecturedocs/nestjs-entities-and-relations.md`
- `docs/basearchitecturedocs/nestjs-api-contract.md`

Not: Prompt içinde `docs/nestjs-entities-and-relations.md` ve `docs/nestjs-api-contract.md` pathleri geçiyordu. Repo içinde kanonik dokümanlar `docs/basearchitecturedocs/` altında olduğu için bu dosyalar güncellendi.

## Migration Notu

Migration oluşturulmadı.

Sebep:

- `src/app.module.ts` içinde development ortamı için `synchronize: true` açık.

Production için migration gerekir.

Migration kapsamı:

- `categories.status`
- `products.status`
- default value: `active`
- status indexleri
- product public query performansı için `status + categoryId` indexi değerlendirilebilir.

## Çalıştırılan Kontroller

Çalıştırılan komutlar:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Sonuç:

- Prettier başarılı.
- Build başarılı.
- Lint başarılı.
- Jest başarılı: `1 passed`.

Canlı HTTP test yapılmadı; DB/env/token setup gerektiriyor.

## Güncellenmesi Önerilen Postman Testleri

Prompt kapsamında Postman collection üretilmedi.

Önerilen testler:

- inactive category public listte görünmemeli;
- inactive product public listte görünmemeli;
- admin category list `status=inactive` ile inactive kayıtları görebilmeli;
- admin product list `status=inactive` ile inactive kayıtları görebilmeli;
- category delete sonrası kayıt public endpointlerde görünmemeli;
- product delete sonrası kayıt public endpointlerde görünmemeli;
- delete sonrası kayıt admin inactive listte görünmeli;
- CUSTOMER admin category/product endpointlerine erişememeli;
- CATALOG_MANAGER category/product admin CRUD yapabilmeli.

## Bilinçli Ertelenen Noktalar

- Production migration oluşturulmadı.
- Canlı HTTP test yapılmadı.
- Public/admin response classları tam ayrıştırılmadı; mevcut response classları minimum breaking change için `status` alanıyla genişletildi.
