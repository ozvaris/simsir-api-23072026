# RBAC Update Result

Bu dosya, `docs/rbac-update-prompt.md` talebine göre projeye eklenen RBAC güncellemesinin reviewer özeti olarak hazırlanmıştır.

## Kapsam

Mevcut NestJS + TypeORM + PostgreSQL mimari çizgisi korunarak yeni bir RBAC modülü eklendi.

Eklenen ana model seti:

- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

Mevcut `UserCredential` ayrımı korundu. `passwordHash`, `User` entity içine taşınmadı. Tenant/company/store modeli eklenmedi.

## Yeni Modül

Yeni modül yolu:

```txt
src/modules/rbac/
```

Alt yapı şu katmanlarla oluşturuldu:

- `controllers`
- `dto`
- `entities`
- `enums`
- `repositories`
- `responses`
- `seed`
- `services`

`src/modules/rbac/rbac.module.ts` üzerinden modül uygulamaya bağlandı.

## Entity Güncellemeleri

Yeni entity dosyaları:

- `src/modules/rbac/entities/role.entity.ts`
- `src/modules/rbac/entities/permission.entity.ts`
- `src/modules/rbac/entities/user-role.entity.ts`
- `src/modules/rbac/entities/role-permission.entity.ts`

İlişkiler:

- `User 1 - N UserRole`
- `Role 1 - N UserRole`
- `Role 1 - N RolePermission`
- `Permission 1 - N RolePermission`

Tekrarlı kayıtları engelleyen unique indexler eklendi:

- `role.code`
- `permission.code`
- `userId + roleId`
- `roleId + permissionId`

`src/modules/users/entities/user.entity.ts` içinde `userRoles` ilişkisi eklendi.

## DTO ve Response Katmanı

Role DTO:

- `CreateRoleDto`
- `UpdateRoleDto`
- `ListRolesQueryDto`
- `AssignPermissionsToRoleDto`
- `ReplaceRolePermissionsDto`

Permission DTO:

- `CreatePermissionDto`
- `UpdatePermissionDto`
- `ListPermissionsQueryDto`

User role DTO:

- `AssignRolesToUserDto`
- `ReplaceUserRolesDto`
- `ListUserRolesQueryDto`

Response classları:

- `RoleResponse`
- `RoleDetailResponse`
- `PermissionResponse`
- `UserRoleResponse`
- `AuthorizationSummaryResponse`
- `OperationResultResponse`
- `RolePermissionsResponse`
- `UserRolesMutationResponse`
- `PaginationResponse`
- `ListResponse`

Entity doğrudan controller response’u olarak döndürülmedi. Mapping için `RbacMapper` eklendi.

## Servisler

Eklenen servisler:

- `RbacQueryService`
- `RoleService`
- `PermissionService`
- `UserRoleService`
- `RbacSeedService`

Sorumluluklar ayrıldı:

- Controller sadece HTTP input alıp service’e devrediyor.
- Business/use-case akışı service katmanında.
- Data access repository sınıflarında.
- Response üretimi mapper/response class üzerinden.

`RbacQueryService`, kullanıcının rollerini, etkili permission setini ve authorization summary bilgisini üretir. `isAdmin`, `SUPER_ADMIN` rolünden türetilir.

## Repository Katmanı

Eklenen repository sınıfları:

- `RolesRepository`
- `PermissionsRepository`
- `UserRolesRepository`
- `RolePermissionsRepository`

Pagination, search, relation loading, duplicate kontrolüne yardımcı queryler ve ilişki sayımı gibi data access işlemleri repository katmanında tutuldu.

## API Endpointleri

RBAC admin endpointleri `/api/admin/rbac/...` altında oluşturuldu.

Role endpoints:

- `GET /api/admin/rbac/roles`
- `GET /api/admin/rbac/roles/:roleId`
- `POST /api/admin/rbac/roles`
- `PATCH /api/admin/rbac/roles/:roleId`
- `DELETE /api/admin/rbac/roles/:roleId`
- `POST /api/admin/rbac/roles/:roleId/permissions`
- `PUT /api/admin/rbac/roles/:roleId/permissions`
- `DELETE /api/admin/rbac/roles/:roleId/permissions/:permissionId`

Permission endpoints:

- `GET /api/admin/rbac/permissions`
- `GET /api/admin/rbac/permissions/:permissionId`
- `POST /api/admin/rbac/permissions`
- `PATCH /api/admin/rbac/permissions/:permissionId`
- `DELETE /api/admin/rbac/permissions/:permissionId`

User role endpoints:

- `GET /api/admin/rbac/users/:userId/roles`
- `POST /api/admin/rbac/users/:userId/roles`
- `PUT /api/admin/rbac/users/:userId/roles`
- `DELETE /api/admin/rbac/users/:userId/roles/:roleId`

Authorization summary endpoints:

- `GET /api/auth/me/access`
- `GET /api/auth/me/access-summary`
- `GET /api/admin/rbac/users/:userId/access-summary`

Not: Contract dosyasında bazı user-role endpoint örnekleri `/api/admin/users/...` olarak geçse de prompt talebinde `/api/admin/rbac/users/...` istendiği için uygulama prompt’taki path yapısını kullandı.

## Guard ve Decorator Güncellemeleri

Yeni decoratorlar:

- `@Roles(...roles)`
- `@Permissions(...permissions)`

Yeni guardlar:

- `RolesGuard`
- `PermissionsGuard`

Guardlar global olarak `APP_GUARD` ile `src/app.module.ts` içinde bağlandı.

Mevcut `JwtAuthGuard`, `@CurrentUser()` ve `@Public()` yapısı korundu.

## Auth Entegrasyonu

`src/auth/jwt.strategy.ts` güncellendi.

JWT payload minimum tutuldu. Token içine permission listesi gömülmedi. Request doğrulama sırasında `RbacQueryService` ile authorization summary hesaplanıp `request.user` context’ine eklendi:

```ts
{
  userId: string;
  email?: string;
  userName?: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
}
```

`src/common/types/current-user.type.ts` içine `roles` ve `permissions` alanları eklendi.

## Admin Endpoint Güvenliği

Prompt’taki "Admin/internal endpointler public olmamalı" kuralına uygun olarak:

- `CategoriesAdminController` üzerindeki `@Public()` kaldırıldı.
- `ProductsAdminController` üzerindeki `@Public()` kaldırıldı.
- Bu controller actionlarına ilgili catalog permission metadata’sı eklendi.

Örnekler:

- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`

## Seed Mantığı

`RbacSeedService` ile idempotent başlangıç seed mantığı eklendi.

Seed edilen roller:

- `SUPER_ADMIN`
- `CATALOG_MANAGER`
- `ORDER_MANAGER`
- `SUPPORT_STAFF`
- `CUSTOMER`

Seed edilen permission grupları:

- Catalog
- Orders
- Users
- Checkout reference
- RBAC

Başlangıç role-permission atamaları:

- `SUPER_ADMIN`: tüm permissionlar
- `CATALOG_MANAGER`: catalog permissionları
- `ORDER_MANAGER`: order permissionları
- `SUPPORT_STAFF`: `user.read`, `order.read_all`, `catalog.product.read`, `catalog.category.read`
- `CUSTOMER`: admin permission yok

Seed işlemleri `code` değerleri üzerinden tekrar çalıştırılabilir şekilde yazıldı.

## Silme Stratejisi

System role ve system permission kayıtları fiziksel olarak silinemez.

Ek korumalar:

- Kullanıcıya atanmış role silinemez.
- Role atanmış permission silinemez.

Bu durumlarda `BadRequestException` döner.

## Ek Küçük Temizlikler

Lint’i temizlemek için davranış değiştirmeyen küçük düzenlemeler yapıldı:

- `AdminGuard` içinde request tipi güvenli hale getirildi.
- `src/main.ts` içinde `void bootstrap();` kullanıldı.
- Bazı dosyalara eksik final newline eklendi.

## Çalıştırılan Komutlar

```bash
pnpm build
pnpm exec eslint "{src,apps,libs,test}/**/*.ts"
pnpm exec jest --runInBand
```

Sonuçlar:

- Build geçti.
- ESLint geçti.
- Jest geçti: 1 test suite, 1 test.

## Migration Notu

Migration oluşturulmadı.

Sebep: Proje şu anda `TypeOrmModule.forRootAsync` içinde `synchronize: true` kullanıyor ve mevcut migration standardı görülmedi.

Production’a geçmeden önce RBAC tabloları ve indexleri için migration oluşturulması önerilir. Destructive migration işlemi yapılmadı.

## Reviewer İçin Kontrol Noktaları

- `SUPER_ADMIN` için `PermissionsGuard` ve `RolesGuard` bypass davranışı uygun mu?
- `isAdmin` yalnızca `SUPER_ADMIN` rolünden türetilmeli mi, yoksa belirli RBAC permissionları üzerinden de türetmek istenir mi?
- Admin category/product permission kapsamı yeterli mi, media/relation işlemleri için ayrı permission istenir mi?
- User-role endpoint path tercihi prompt’a göre `/api/admin/rbac/users/...`; contract ile tam eşleşme istenirse ayrıca path alias eklenebilir.
- `RbacSeedService` module init sırasında çalışıyor; daha kontrollü bir seed command yapısı istenirse ayrı script’e taşınabilir.
