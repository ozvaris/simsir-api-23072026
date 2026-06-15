Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde RBAC güncellemesini uygulamanı istiyorum.

Önce aşağıdaki dokümanları oku ve bu dokümanları kanonik proje standardı kabul et:

- `docs/architectureguide.md`
- `docs/backend-docs-index.md`
- `docs/nestjs-api-contract.md`
- `docs/nestjs-entities-and-relations.md`
- `docs/backend-module-patterns.md`
- `docs/rbac-module-guide.md`
- `docs/rbac-api-contract.md`

Önemli mimari kurallar:

- Mevcut mimari çizgiyi bozma.
- Controller sadece HTTP input alıp service’e devretsin.
- Business/use-case akışı service içinde kalsın.
- Data access repository sınıflarında toplansın.
- Request body/query DTO ile gelsin.
- Response entity olarak direkt dönmesin; response class veya mapper kullanılsın.
- Mapper metodları `to...Response()` isimlendirmesini takip etsin.
- User-owned resource işlemlerinde ownership kontrolü service/repository sınırında yapılsın.
- Public endpointler açıkça `@Public()` ile işaretlenmeli.
- Varsayılan güvenlik restrictive olmalı.
- Admin/internal endpointler public olmamalı.

RBAC güncellemesinde temel kararlar:

- `UserCredential` ayrımı korunacak.
- `passwordHash` kesinlikle `User` entity içine taşınmayacak.
- `passwordHash`, mevcut yapıda olduğu gibi `UserCredential` tarafında kalacak.
- Tenant/company/store modeli şu aşamada eklenmeyecek.
- Tenant alanı için kod, entity veya migration oluşturma.
- `isAdmin` ana model olarak kullanılmayacak; role/permission üzerinden türetilmiş kolaylık alanı olabilir.
- JWT payload minimum kalacak. JWT içine tüm permission listesi gömülmeyecek.
- Authorization summary request başında hesaplanıp `request.user` context’ine eklenecek.
- RBAC ile ownership aynı şey kabul edilmeyecek.
- RBAC “bu aksiyonu yapabilir mi?” sorusunu cevaplar.
- Domain service “bu veri üzerinde yapabilir mi?” sorusunu cevaplar.

Uygulaman gereken RBAC entity seti:

- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

Mevcut `User` entity ile ilişkileri kur:

- `User 1 - N UserRole`
- `Role 1 - N UserRole`
- `Role 1 - N RolePermission`
- `Permission 1 - N RolePermission`

Entity alanları dokümanlara uygun olsun.

Role için beklenen temel alanlar:

- `id`
- `code`
- `name`
- `description`
- `isSystem`
- `status`
- `createdAt`
- `updatedAt`

Permission için beklenen temel alanlar:

- `id`
- `code`
- `name`
- `description`
- `resource`
- `action`
- `isSystem`
- `status`
- `createdAt`
- `updatedAt`

UserRole için beklenen temel alanlar:

- `id`
- `userId`
- `roleId`
- `assignedAt`
- `assignedBy`

RolePermission için beklenen temel alanlar:

- `id`
- `roleId`
- `permissionId`
- `assignedAt`
- `assignedBy`

Tekrarlı kayıtları engelle:

- Aynı `role.code` tekrar edemesin.
- Aynı `permission.code` tekrar edemesin.
- Aynı `userId + roleId` ilişkisi tekrar edemesin.
- Aynı `roleId + permissionId` ilişkisi tekrar edemesin.

Klasör yapısı mevcut proje stiline uygun olsun. Önerilen yapı:

```txt
src/modules/rbac/
  controllers/
  decorators/
  dto/
  entities/
  enums/
  guards/
  interfaces/
  repositories/
  responses/
  services/
  rbac.module.ts
```

Eğer projede `common/guards`, `common/decorators`, `auth/guards` gibi mevcut bir standart varsa, guard/decorator yerleşimini mevcut stile göre ayarla. Yeni yapı oluştururken projedeki mevcut pattern’i bozma.

Oluşturulacak servis sorumlulukları:

1. `RbacQueryService`
   - Kullanıcının rollerini getirir.
   - Kullanıcının etkili permission setini getirir.
   - Authorization summary üretir.
   - `isAdmin` alanını role/permission üzerinden türetir.

2. `RoleService`
   - Role CRUD
   - Role detail
   - Role list
   - Role permission assign/replace/remove

3. `PermissionService`
   - Permission CRUD
   - Permission list/detail

4. `UserRoleService`
   - Kullanıcıya rol atama
   - Kullanıcıdan rol kaldırma
   - Kullanıcının rol setini replace etme
   - Kullanıcı rollerini listeleme

DTO ve response class oluştur:

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

UserRole DTO:

- `AssignRolesToUserDto`
- `ReplaceUserRolesDto`
- `ListUserRolesQueryDto`

Response class örnekleri:

- `RoleResponse`
- `RoleDetailResponse`
- `PermissionResponse`
- `UserRoleResponse`
- `AuthorizationSummaryResponse`
- `OperationResultResponse` veya projedeki mevcut success response standardı

RBAC API contract’a göre endpointleri oluştur.

Admin RBAC endpointleri `/api/admin/rbac/...` altında olmalı:

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
- `GET /api/admin/rbac/users/:userId/access-summary`

Guard ve decorator yapısı:

- `@Roles(...roles)`
- `@Permissions(...permissions)`
- `RolesGuard`
- `PermissionsGuard`

Mevcut `JwtAuthGuard`, `@CurrentUser()` ve `@Public()` yapısı varsa onu kullan. Yoksa mevcut mimariye uygun şekilde ekle.

Authorization akışı:

1. Kullanıcı login olur.
2. Auth credential doğrular.
3. JWT minimum user identity taşır.
4. Request geldiğinde JwtStrategy veya ilgili auth katmanı kullanıcıyı doğrular.
5. RBAC query service authorization summary üretir.
6. `request.user` içine şu alanlar yerleşir:

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

7. Guard endpoint metadata’sındaki role/permission ihtiyacına göre karar verir.
8. Domain service gerekiyorsa ownership kontrolünü ayrıca yapar.

Başlangıç seed mantığı ekle.

Seed edilecek başlangıç rolleri:

- `SUPER_ADMIN`
- `CATALOG_MANAGER`
- `ORDER_MANAGER`
- `SUPPORT_STAFF`
- `CUSTOMER`

Başlangıç permission grupları:

Catalog:

- `catalog.category.read`
- `catalog.category.create`
- `catalog.category.update`
- `catalog.category.delete`
- `catalog.product.read`
- `catalog.product.create`
- `catalog.product.update`
- `catalog.product.delete`
- `catalog.review.moderate`

Orders:

- `order.read_all`
- `order.update_status`
- `order.cancel`
- `order.refund`

Users:

- `user.read`
- `user.update`
- `user.disable`

Checkout reference:

- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`
- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

RBAC:

- `rbac.role.read`
- `rbac.role.create`
- `rbac.role.update`
- `rbac.role.delete`
- `rbac.role.assign_permission`
- `rbac.permission.read`
- `rbac.permission.create`
- `rbac.permission.update`
- `rbac.permission.delete`
- `rbac.user_role.read`
- `rbac.user_role.assign`
- `rbac.user_role.replace`
- `rbac.user_role.remove`

Role-permission başlangıç önerisi:

- `SUPER_ADMIN`: tüm permission’lar
- `CATALOG_MANAGER`: catalog permission’ları
- `ORDER_MANAGER`: order permission’ları
- `SUPPORT_STAFF`: user.read, order.read_all, catalog.product.read, catalog.category.read
- `CUSTOMER`: başlangıçta özel admin permission almayabilir; customer işlemleri authenticated + ownership check ile yürüsün

Silme stratejisi:

- System role ve system permission kayıtları fiziksel olarak kolayca silinmemeli.
- Eğer mevcut projede soft delete standardı yoksa delete operasyonlarında en azından `isSystem` koruması ve ilişki kontrolü yap.
- Role bağlı user varsa role silme/deaktif etme kontrollü olmalı.
- Permission role’a bağlıysa silme/deaktif etme kontrollü olmalı.

Kod yazarken dikkat:

- Mevcut dosya adlandırma stilini takip et.
- Mevcut import alias/path stilini takip et.
- Mevcut response mapper stilini takip et.
- Mevcut validation pipe/class-validator kullanımını takip et.
- Entity’leri doğrudan controller’dan döndürme.
- DTO’larda `class-validator` kullan.
- Query DTO’larda pagination/search/status filtrelerini destekle.
- Error handling için mevcut `NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException` kullanım stilini takip et.
- TypeScript strict hatalarına dikkat et.
- `null` TypeORM filtrelerinde gerekiyorsa `IsNull()` kullan.

Bu işlemi yaparken önce mevcut proje yapısını incele. Özellikle şu dosya ve klasörleri kontrol et:

- `src/app.module.ts`
- `src/modules/auth`
- `src/modules/users`
- `src/modules/categories`
- `src/modules/products`
- `src/common` varsa
- mevcut guard/decorator yapısı
- mevcut entity base alanları
- mevcut repository/service/controller pattern’i

Sonra RBAC güncellemesini uygula.

Son olarak:

1. Değiştirdiğin/eklediğin dosyaları listele.
2. Varsa çalıştırdığın komutları yaz.
3. TypeScript build/lint/test sonucu varsa paylaş.
4. Eksik bıraktığın veya bilinçli ertelediğin noktaları açıkça belirt.
5. Migration gerekiyorsa mevcut proje yaklaşımına göre migration oluştur veya migration komutunu öner; destructive işlem yapma.
