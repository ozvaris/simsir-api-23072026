# RBAC Module Guide

Bu dokuman, mevcut [Architecture Guide](/docs/architectureguide.md) cizgisini devam ettirerek yeni projede uygulanacak sade, genisletilebilir ve production-uyumlu RBAC modulunu tarif eder.

Amac, mevcut legacy `module -> userModule -> userRight -> job` mantigindaki yetki fikrini koruyup bunu daha okunabilir, daha kolay CRUD edilebilir ve yeni feature'lara daha rahat uyarlanabilir bir yapida standardize etmektir.

<a id="contents"></a>

## Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [Target Model](#target-model)
- [Design Principles](#design-principles)
- [Module Boundaries](#module-boundaries)
- [Entity Model](#entity-model)
- [Entity Details](#entity-details)
- [DTO Model](#dto-model)
- [Service Responsibilities](#service-responsibilities)
- [CRUD Operations](#crud-operations)
- [Authorization Flow](#authorization-flow)
- [JWT and Request Context](#jwt-and-request-context)
- [Guards and Decorators](#guards-and-decorators)
- [Permission Naming](#permission-naming)
- [Role Design](#role-design)
- [Tenant and Ownership Rules](#tenant-and-ownership-rules)
- [Recommended Endpoints](#recommended-endpoints)
- [Validation Rules](#validation-rules)
- [Seeding Strategy](#seeding-strategy)
- [Audit and Operations](#audit-and-operations)
- [Migration Notes](#migration-notes)
- [Recommended Folder Structure](#recommended-folder-structure)
- [Implementation Order](#implementation-order)
- [Summary](#summary)

<a id="purpose"></a>

## Purpose

Bu dokumanin hedefi sifirdan NestJS anlatmak degil, yeni projede `rbac` modulunu ekleyecek veya gelistirecek kisiye teknik tasarim referansi vermektir.

Bu nedenle dokuman:

- entity setini netlestirir;
- DTO ihtiyaclarini listeler;
- servis sorumluluklarini ayirir;
- CRUD operasyonlarinin mantigini tarif eder;
- auth ile rbac sinirini cizer;
- guard ve decorator akisini standardize eder;
- tenant ve resource sahipligi gibi ileri ihtiyaclar icin genisleme noktalarini tanimlar.

<a id="scope"></a>

## Scope

Bu modul asagidaki ihtiyaclari kapsar:

- kullanicinin sisteme giris yetkisini belirleme;
- kullaniciya bir veya daha fazla rol atama;
- role permission baglama;
- endpoint bazli role veya permission kontrolu yapma;
- kullaniciya ait etkili yetki ozetini uretme;
- admin ve normal kullanici ayrimini sistematik hale getirme;
- tenant veya company context ile birlikte calisma.

Bu modul asagidaki konulari dogrudan cozmez:

- sifre hash stratejisi;
- refresh token rotation;
- session management;
- resource-level business ownership kurallari;
- audit log altyapisinin tum detaylari.

Bu alanlar ilgili modullerde ele alinmali, ancak RBAC ile entegrasyon noktalari burada tanimlanmistir.

<a id="target-model"></a>

## Target Model

Yeni projede onerilen temel model su sekildedir:

```text
User
Role
Permission
UserRole
RolePermission
```

Opsiyonel genisleme alanlari:

```text
Tenant
UserTenant
PermissionGroup
AuditLog
```

Temel karar su olmalidir:

- rol, anlamli bir is yetkisi paketidir;
- permission, sistemdeki teknik erisim birimidir;
- kullaniciya dogrudan permission vermek varsayilan tasarim olmamalidir;
- once role tasarlanir, sonra permission'lar role baglanir.

<a id="design-principles"></a>

## Design Principles

Bu RBAC tasariminda ana prensipler sunlardir:

- Auth sadece kimlik dogrular.
- RBAC sadece yetki ve erisim ozetini uretir.
- Guard endpoint seviyesinde karar verir.
- Domain servisleri veri sahipligi ve tenant filtrelemesi yapar.
- Permission isimleri teknik, rol isimleri is anlami tasir.
- `isAdmin` tek basina ana model olmamali; turetilmis kolaylik alani olmali.
- Kullanici yetkisi tek tek sorgularla degil, ozet context olarak hesaplanmalidir.

<a id="module-boundaries"></a>

## Module Boundaries

Yeni projede sorumluluk dagilimi asagidaki gibi olmalidir:

- `auth`:
  login, token uretimi, refresh, session policy, credential validation.
- `rbac`:
  role, permission, role-permission, user-role, authorization summary.
- `common`:
  guard, decorator, exception, shared helper.
- feature moduleri:
  domain veri kurallari, tenant filtreleri, resource ownership kontrolleri.

Kritik sinir:

- `AuthService`, `ADMIN`, `MANAGER`, `invoice.read` gibi sistem ayrintilarini bilmemelidir.
- `RbacService`, kullanicinin etkili rollerini ve permission'larini hesaplayip auth veya guard katmanina sunmalidir.

<a id="entity-model"></a>

## Entity Model

Onerilen entity seti:

1. `User`
2. `Role`
3. `Permission`
4. `UserRole`
5. `RolePermission`

Opsiyonel:

6. `Tenant`
7. `UserTenant`

Eger proje tek tenant ise `Tenant` ve `UserTenant` gerekmeyebilir. Eger proje birden fazla sirket, kurum veya musteri icin calisiyorsa tenant modeli bastan dusunulmelidir.

<a id="entity-details"></a>

## Entity Details

### 1. User

`User` sistemde oturum acan asli aktordur.

Minimum alanlar:

- `id`
- `email` veya `username` veya `userCode`
- `passwordHash`
- `status`
- `displayName`
- `tenantId` veya `companyId` gerekiyorsa ilgili context alani
- `createdAt`
- `updatedAt`

Notlar:

- `status` aktif, pasif, kilitli gibi durumlari ayirmalidir.
- Kimlik alani neyse login DTO'su onunla uyumlu olmalidir.

### 2. Role

`Role`, is anlami tasiyan yetki paketidir.

Minimum alanlar:

- `id`
- `code`
- `name`
- `description`
- `isSystem`
- `status`
- `createdAt`
- `updatedAt`

Notlar:

- `code` benzersiz ve degismez olmalidir.
- `isSystem`, seed ile gelen rollerin kazara silinmesini engellemek icin kullanislidir.

### 3. Permission

`Permission`, teknik erisim birimidir.

Minimum alanlar:

- `id`
- `code`
- `name`
- `description`
- `resource`
- `action`
- `isSystem`
- `createdAt`
- `updatedAt`

Notlar:

- `code` sistemdeki asil kimliktir.
- `resource` ve `action` analitik veya filtreleme amacli yardimci alanlardir.

### 4. UserRole

`UserRole`, kullanici ile rol arasindaki iliskiyi tutar.

Minimum alanlar:

- `id`
- `userId`
- `roleId`
- `assignedAt`
- `assignedBy`

Opsiyonel alanlar:

- `tenantId`
- `expiresAt`

Notlar:

- Bir kullaniciya ayni rol bir kez atanabilmelidir.
- Cok tenantli yapida ayni kullanici farkli tenant icinde farkli rollere sahip olabilir.

### 5. RolePermission

`RolePermission`, bir role ait permission setini tanimlar.

Minimum alanlar:

- `id`
- `roleId`
- `permissionId`
- `assignedAt`
- `assignedBy`

Notlar:

- Ayni role ayni permission bir kez atanabilmelidir.
- Bu tablo, sistemin gercek authorization kaynagidir.

<a id="dto-model"></a>

## DTO Model

Yeni projede gereken DTO'lar asagidaki mantikta olmalidir.

### Role DTO'lari

- `CreateRoleDto`
- `UpdateRoleDto`
- `ListRolesQueryDto`
- `AssignPermissionsToRoleDto`

`CreateRoleDto` icermelidir:

- `code`
- `name`
- `description`
- `status`

`UpdateRoleDto` icermelidir:

- `name`
- `description`
- `status`

`AssignPermissionsToRoleDto` icermelidir:

- `permissionIds` veya `permissionCodes`

### Permission DTO'lari

- `CreatePermissionDto`
- `UpdatePermissionDto`
- `ListPermissionsQueryDto`

`CreatePermissionDto` icermelidir:

- `code`
- `name`
- `description`
- `resource`
- `action`

### User Role DTO'lari

- `AssignRolesToUserDto`
- `ReplaceUserRolesDto`
- `ListUserRolesQueryDto`

`AssignRolesToUserDto` icermelidir:

- `roleIds` veya `roleCodes`

`ReplaceUserRolesDto` icermelidir:

- kullanicinin hedef rol seti

Bu DTO, "ekle" degil "tam seti guncelle" operasyonu icin kullanilir.

### Authorization DTO'lari

- `AuthorizationSummaryDto`
- `CurrentUserAccessDto`

`AuthorizationSummaryDto` asagidaki bilgileri tasimalidir:

- `userId`
- `roles`
- `permissions`
- `isAdmin`
- `tenantId` veya `companyId`

<a id="service-responsibilities"></a>

## Service Responsibilities

RBAC modulunde servisler mantiksal olarak su sorumluluklara ayrilmalidir:

### RbacQueryService

Okuma ve authorization summary hesaplama isleri:

- kullanicinin rollerini getirir;
- kullanicinin etkili permission setini getirir;
- `isAdmin` gibi turetilmis alanlari hesaplar;
- guard katmani icin hizli okunabilir veri sunar.

### RoleService

Rol CRUD ve rol-permission yonetimi:

- role create;
- role update;
- role detail;
- role list;
- role delete veya deaktif etme;
- role'e permission baglama;
- role'den permission cikarimi.

### PermissionService

Permission CRUD yonetimi:

- permission create;
- permission update;
- permission detail;
- permission list;
- permission delete veya deaktif etme.

### UserRoleService

Kullanici-rol iliskisi yonetimi:

- kullaniciya rol atama;
- kullanicidan rol alma;
- kullanici rol setini replace etme;
- kullanicinin mevcut rollerini listeleme.

Bu ayirim zorunlu degildir; daha kucuk projede bunlar `RbacService` altinda toplanabilir. Ancak mantiksal sinirlar korunmalidir.

<a id="crud-operations"></a>

## CRUD Operations

Bu bolumde operasyonlarin mantigi tarif edilir.

### Role CRUD

`createRole`

- `code` benzersiz olmali;
- sistem rol kodlari ile cakismamali;
- ilk kayitta permission baglamak opsiyonel olabilir.

`updateRole`

- `code` varsayilan olarak degistirilmemeli;
- `name`, `description`, `status` guncellenebilir;
- sistem roluysa ekstra koruma uygulanabilir.

`listRoles`

- sayfalama desteklemeli;
- `status`, `search`, `isSystem` filtresi olmali.

`getRoleDetail`

- role bilgisi;
- bagli permission listesi;
- role atanan kullanici sayisi gibi ozet alanlar donebilir.

`deleteRole`

- fiziksel silme yerine deaktif etme daha guvenlidir;
- role bagli kullanici varsa sert silme engellenebilir.

### Permission CRUD

`createPermission`

- `code` benzersiz olmali;
- `resource + action` kombinasyonu tutarli olmali.

`updatePermission`

- `code` degismez olmali;
- `name`, `description` guncellenebilir.

`listPermissions`

- `resource`, `action`, `search` ile filtrelenebilir.

`deletePermission`

- role baglantilari varsa kontrollu davranilmali;
- deaktif etme veya relation temizleme stratejisi acik olmali.

### User Role CRUD

`assignRolesToUser`

- verilen rol listesi mevcut roller uzerine eklenir;
- tekrar eden atamalar ignore edilmeli veya kontrollu hata donmeli.

`replaceUserRoles`

- kullanicinin tum rol seti hedef liste ile senkronize edilir;
- admin paneli tarzı ekranlar icin en temiz yaklasim budur.

`removeRoleFromUser`

- tekil iliskiyi kaldirir;
- kullanicinin son kritik rolunu dusurmeden once business kontrol gerekebilir.

`listUserRoles`

- kullanicinin rol listesi;
- role kaynakli permission ozeti ile birlikte donebilir.

### Authorization Summary

`getAuthorizationSummaryByUserId`

- kullanicinin rol kodlarini getirir;
- role'lerden permission kodlarini toplar;
- uniq hale getirir;
- `isAdmin` gibi turetilmis alanlari hesaplar;
- request context icin uygun sade bir obje dondurur.

Bu metod yeni yapinin merkezidir. Sistemde yetki kontrolu icin tekrar tekrar tablo join edip parca parca sorgu atmak yerine bu ozet kullanilmalidir.

<a id="authorization-flow"></a>

## Authorization Flow

Onerilen authorization akisi:

1. Kullanici login olur.
2. Auth, sadece credential dogrulamasini yapar.
3. RBAC servisi kullanicinin authorization summary bilgisini uretir.
4. JWT payload minimum kimlik bilgisini tasir.
5. `JwtStrategy`, request basinda kullanici context'ini zenginlestirir.
6. Guard, endpoint metadata'sina gore role veya permission kontrolu yapar.
7. Domain servisi gerekiyorsa tenant veya ownership filtresi uygular.

Buradaki temel ayrim sunu saglar:

- login akisinda yetki karari tek yerde toplanir;
- request akisinda her controller kendi kafasina gore role sorgulamaz;
- admin kontrolu boolean hack olarak degil, role veya permission ozetinden turetilir.

<a id="jwt-and-request-context"></a>

## JWT and Request Context

JWT payload minimum tutulmalidir.

Onerilen payload:

```text
sub
sessionId
tenantId
```

Opsiyonel:

```text
tokenVersion
```

JWT icine tum permission listesini koymak buyuk sistemlerde sakincali olabilir:

- token boyutu buyur;
- rol degisikligi token suresi bitene kadar yansimayabilir;
- guvenlik ve cache invalidation karmasiklasir.

Bu nedenle daha dengeli yaklasim:

- JWT kimlik ve minimum context tasir;
- `JwtStrategy` kullanici ve authorization summary bilgisini yukler;
- guard bu zenginlestirilmis `request.user` context'i uzerinden karar verir.

`request.user` icin onerilen alanlar:

- `userId`
- `tenantId` veya `companyId`
- `roles`
- `permissions`
- `isAdmin`
- `displayName`
- `email` veya `username`

<a id="guards-and-decorators"></a>

## Guards and Decorators

Onerilen guard seti:

- `JwtAuthGuard`
- `RolesGuard`
- `PermissionsGuard`

Onerilen decorator seti:

- `@Public()`
- `@CurrentUser()`
- `@Roles()`
- `@Permissions()`

Kullanim mantigi:

- `JwtAuthGuard`: giris var mi?
- `RolesGuard`: kullanicida gerekli rol var mi?
- `PermissionsGuard`: kullanicida gerekli permission var mi?
- `@CurrentUser()`: zenginlestirilmis request context'i controller'a tasir.

Pratik kural:

- coarse-grained erisimler icin role kullan;
- create, update, approve, export gibi daha teknik ayrimlar icin permission kullan.

<a id="permission-naming"></a>

## Permission Naming

Permission adlandirmasi sistemin uzun omurlu okunabilirligini belirler.

Onerilen format:

```text
resource.action
```

Ornekler:

- `user.read`
- `user.create`
- `user.update`
- `user.delete`
- `role.read`
- `role.assign`
- `department.read`
- `department.update`
- `invoice.approve`
- `report.export`

Alternatif olarak daha buyuk sistemlerde su format kullanilabilir:

```text
module.resource.action
```

Ornekler:

- `rbac.role.read`
- `rbac.permission.assign`
- `crm.contact.update`

Karar ne olursa olsun proje genelinde tek standart korunmalidir.

<a id="role-design"></a>

## Role Design

Rol isimleri teknik degil, is anlami tasimalidir.

Ornek roller:

- `SUPER_ADMIN`
- `TENANT_ADMIN`
- `MANAGER`
- `EDITOR`
- `VIEWER`

Rol tasariminda dikkat edilmesi gerekenler:

- Rol sayisini gereksiz buyutme.
- Permission sayisini role sayisina gore daha esnek tut.
- Her ihtiyac icin yeni rol acmak yerine mevcut role permission eklemek daha saglikli olabilir.
- `isAdmin` alani, `SUPER_ADMIN` veya `TENANT_ADMIN` gibi rollerden turetilmelidir.

<a id="tenant-and-ownership-rules"></a>

## Tenant and Ownership Rules

RBAC ile data ownership ayni sey degildir.

Ornek:

- kullanicida `department.update` permission'i olabilir;
- ama yalnizca kendi tenant'indaki veya kendi olusturdugu kaydi guncelleyebilir.

Bu nedenle:

- RBAC, "hangi aksiyonu yapabilir" sorusunu cevaplar;
- domain servisleri, "hangi veri uzerinde yapabilir" sorusunu cevaplar.

Tenantli projede minimum kurallar:

- request context'te `tenantId` bulunmali;
- tum listeleme ve detail sorgulari tenant filtresi icermeli;
- `UserRole` tenant baglamliysa authorization summary hesaplamasi da tenant'a gore yapilmali.

<a id="recommended-endpoints"></a>

## Recommended Endpoints

Onerilen endpoint gruplari:

### Role endpoints

- `GET /roles`
- `GET /roles/:id`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id`
- `POST /roles/:id/permissions`
- `PUT /roles/:id/permissions`
- `DELETE /roles/:id/permissions/:permissionId`

### Permission endpoints

- `GET /permissions`
- `GET /permissions/:id`
- `POST /permissions`
- `PATCH /permissions/:id`
- `DELETE /permissions/:id`

### User role endpoints

- `GET /users/:id/roles`
- `POST /users/:id/roles`
- `PUT /users/:id/roles`
- `DELETE /users/:id/roles/:roleId`

### Authorization endpoints

- `GET /auth/me`
- `GET /users/:id/access-summary`

Tum bu endpoint'lerin hepsini public API yapmak gerekmez. Bir kismi sadece admin paneli veya internal operasyon icin olabilir.

<a id="validation-rules"></a>

## Validation Rules

Minimum validation kurallari:

- role `code` benzersiz olmali;
- permission `code` benzersiz olmali;
- ayni user-role iliskisi ikinci kez olusturulamamali;
- ayni role-permission iliskisi ikinci kez olusturulamamali;
- kritik sistem rolleri silinememeli;
- kritik sistem permission'lari kazara kaldirilamamali;
- status pasif olan kullanici login olamamalidir;
- status pasif rol veya permission authorization summary hesabi disinda kalmalidir.

<a id="seeding-strategy"></a>

## Seeding Strategy

RBAC modulu baslangicta seed verisi ile gelmelidir.

Onerilen seed sirasi:

1. permission kayitlari
2. role kayitlari
3. role-permission baglantilari
4. varsa ilk admin kullanici rol atamasi

En az su seed roller dusunulmelidir:

- `SUPER_ADMIN`
- `TENANT_ADMIN`
- `VIEWER`

Seed stratejisinde dikkat:

- tekrar kosabilir olmali;
- `code` bazli idempotent davranmali;
- production'da kazara duplicate veri uretmemeli.

<a id="audit-and-operations"></a>

## Audit and Operations

RBAC operasyonlari audit acisindan degerlidir.

Ozellikle su islemler loglanmalidir:

- role olusturma;
- role guncelleme;
- permission olusturma;
- role'e permission ekleme veya cikarma;
- kullaniciya rol atama veya rolden dusurme;
- kritik admin yetki degisiklikleri.

Audit log minimum olarak sunlari tutabilmelidir:

- islemi yapan kullanici;
- hedef kayit;
- onceki durum;
- sonraki durum;
- zaman bilgisi.

<a id="migration-notes"></a>

## Migration Notes

Legacy bir sistemden gecis yapiliyorsa mevcut rol mantigi direkt tablo yapisi olarak tasinmamalidir.

Gecis icin izlenecek mantik:

- mevcut job veya role kodlari envanteri cikarilir;
- bunlar yeni sistemde business role olarak mi kalacak, teknik permission'a mi donecek karar verilir;
- gereksiz veya tekrar eden roller birlestirilir;
- sadece uygulamada fiilen kullanilan yetkiler yeni modele tasinir.

Temel karar:

- eski yapinin tum kolonlarini degil, davranissal sonucunu tasi.

<a id="recommended-folder-structure"></a>

## Recommended Folder Structure

Onerilen klasor yapisi:

```text
rbac/
  dto/
  entities/
  guards/
  decorators/
  services/
  controllers/
  enums/
  interfaces/
  rbac.module.ts
```

Alt bolumler:

- `dto/`: request ve response contract'lari
- `entities/`: ORM entity tanimlari
- `guards/`: `RolesGuard`, `PermissionsGuard`
- `decorators/`: `@Roles()`, `@Permissions()`
- `services/`: query, role, permission, user-role mantigi
- `interfaces/`: authorization summary tipleri
- `enums/`: sistem rol kodlari veya status sabitleri

<a id="implementation-order"></a>

## Implementation Order

Yeni projede RBAC modulu uygulanirken onerilen sira:

1. Entity modelini netlestir.
2. Migration veya schema olustur.
3. Seed permission ve role verisini hazirla.
4. Role ve permission CRUD'larini ekle.
5. User-role yonetimini ekle.
6. Authorization summary mekanizmasini ekle.
7. `JwtStrategy` ile request context'i zenginlestir.
8. `RolesGuard` ve `PermissionsGuard` ekle.
9. Domain endpoint'lerini metadata tabanli koru.
10. Tenant ve ownership kontrollerini servis katmaninda bagla.

<a id="summary"></a>

## Summary

Bu dokumandaki ana model sunu onerir:

- auth kimlik dogrular;
- rbac yetki ozetini uretir;
- guard endpoint erisimine karar verir;
- domain servisleri veri sahipligi ve tenant kurallarini uygular.

Yeni projede korunmasi gereken en onemli fikir, yetkiyi tek tek daginik if bloklariyla degil, merkezi bir authorization summary uzerinden yonetmektir.

Bu sayede:

- mevcut legacy yapidaki kavramsal RBAC korunur;
- uygulama kodu sade kalir;
- CRUD operasyonlari netlesir;
- yeni roller ve permission'lar kontrollu sekilde buyutulebilir.
