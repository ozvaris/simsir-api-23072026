Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde Checkout Reference modül sınırını refactor etmeni istiyorum.

Önce aşağıdaki dokümanları oku ve kanonik proje standardı kabul et:

- `docs/architectureguide.md`
- `docs/backend-docs-index.md`
- `docs/nestjs-api-contract.md`
- `docs/nestjs-entities-and-relations.md`
- `docs/backend-module-patterns.md`
- `docs/rbac-module-guide.md`
- `docs/rbac-api-contract.md`

Ayrıca mevcut implementasyonu incele:

- `src/modules/checkout-reference/`
- `src/modules/rbac/seed/rbac-seed.data.ts`
- `src/app.module.ts`

Amaç:

Şu an `ShippingCarrier` ve `PaymentMethod` entity/modülleri `src/modules/checkout-reference/` altında duruyor. Davranış olarak büyük ölçüde doğru, fakat modül sınırı proje mimarimize göre fazla genel. Bu iki resource ayrı manageable domain modülleri olmalı.

Bu yüzden mevcut `checkout-reference` implementasyonundaki davranışı koruyarak şu yapıya refactor et:

```txt
src/modules/shipping-carriers/
  shipping-carriers.module.ts
  shipping-carriers.controller.ts
  shipping-carriers-admin.controller.ts
  shipping-carriers.service.ts
  entities/
    shipping-carrier.entity.ts
  dto/
  responses/
  repositories/
  mappers/
  seed/

src/modules/payment-methods/
  payment-methods.module.ts
  payment-methods.controller.ts
  payment-methods-admin.controller.ts
  payment-methods.service.ts
  entities/
    payment-method.entity.ts
  dto/
  responses/
  repositories/
  mappers/
  seed/
```

Önemli: Bu refactor davranış refactor’udur. Dış API contract değişmemeli.

Korunacak public endpointler:

```txt
GET /api/shipping-carriers
GET /api/payment-methods
```

Korunacak admin endpointler:

```txt
GET /api/admin/shipping-carriers
GET /api/admin/shipping-carriers/:shippingCarrierId
POST /api/admin/shipping-carriers
PATCH /api/admin/shipping-carriers/:shippingCarrierId
DELETE /api/admin/shipping-carriers/:shippingCarrierId

GET /api/admin/payment-methods
GET /api/admin/payment-methods/:paymentMethodId
POST /api/admin/payment-methods
PATCH /api/admin/payment-methods/:paymentMethodId
DELETE /api/admin/payment-methods/:paymentMethodId
```

Korunacak RBAC permission kodları:

```txt
shipping_carrier.read
shipping_carrier.create
shipping_carrier.update
shipping_carrier.delete

payment_method.read
payment_method.create
payment_method.update
payment_method.delete
```

Korunacak seed kayıtları:

Shipping carriers:

```txt
standard
express
pickup
```

Payment methods:

```txt
credit_card
bank_transfer
cash_on_delivery
```

Kesinlikle dikkat et:

- `CheckoutReferenceModule` artık kullanılmamalı.
- `src/modules/checkout-reference/` klasörü refactor sonunda kaldırılmalı.
- Ama önce yeni modüller çalışır hale getirilmeli.
- Endpoint pathleri değişmemeli.
- Entity table adları değişmemeli.
- Migration/table değişikliğine sebep olacak gereksiz isim değişikliği yapma.
- `@Entity('shipping_carriers')` varsa aynen korunmalı.
- `@Entity('payment_methods')` varsa aynen korunmalı.
- `code`, `status`, `fee` davranışı korunmalı.
- Public endpointler hâlâ `@Public()` olmalı.
- Admin endpointler `@Public()` olmamalı.
- Admin endpointlerde RBAC permission metadata korunmalı.
- Deactivate/delete davranışı korunmalı.
- `DELETE` fiziksel silme yapmamalı; mevcut inactive/deactivate davranışı korunmalı.
- `Checkout`, `CheckoutSession`, `CheckoutItem` entityleri oluşturma.
- `POST /api/orders` implementasyonuna geçme.
- Gerçek checkout/order flow bu refactor kapsamında değil.

Mimari kurallar:

- Controller sadece HTTP input alıp service’e devretsin.
- Business/use-case akışı service içinde kalsın.
- Data access repository sınıflarında toplansın.
- Request body/query DTO ile gelsin.
- Response entity olarak direkt dönmesin.
- Response class veya mapper kullanılsın.
- Mapper metodları `to...Response()` isimlendirmesini takip etsin.
- Mevcut Auth, RBAC, User, Product, Cart yapıları bozulmasın.
- Tenant/company/store modeli ekleme.
- Mevcut AppBaseEntity kullanımını koru.
- `id`, `createdAt`, `updatedAt` base entity’den geliyorsa tekrar tanımlama.

Modül ayrımı:

`ShippingCarriersModule` içinde sadece shipping carrier domain’i olsun:

- entity
- DTO
- response
- mapper
- repository
- service
- public controller
- admin controller
- seed service

`PaymentMethodsModule` içinde sadece payment method domain’i olsun:

- entity
- DTO
- response
- mapper
- repository
- service
- public controller
- admin controller
- seed service

Ortak list response veya operation result response gerekiyorsa:

- Mevcut projede ortak response standardı varsa onu kullan.
- Yoksa iki modül içinde duplicate minimum seviyede tutulabilir.
- Sadece bunun için tekrar `checkout-reference` shared klasörü oluşturma.
- Gerçekten ortak olacak bir yapı gerekiyorsa `src/common` altında mevcut proje stiline uygun konumlandır.

Status enum konusu:

Şu an `CheckoutReferenceStatus` gibi checkout-reference adına bağlı bir enum varsa bu isim yeni modül sınırıyla uyumsuz olabilir.

Tercih sırası:

1. Projede genel bir status enum standardı varsa onu kullan.
2. Yoksa `src/common/enums/record-status.enum.ts` gibi ortak ve domain bağımsız bir enum oluşturabilirsin.
3. Alternatif olarak `ShippingCarrierStatus` ve `PaymentMethodStatus` olarak ayrı ayrı tanımlayabilirsin.
4. `CheckoutReferenceStatus` adını refactor sonrası `src` içinde bırakma.

Seed stratejisi:

- `CheckoutReferenceSeedService` artık kalmamalı.
- Shipping carrier seed işlemi `ShippingCarriersModule` altında olmalı.
- Payment method seed işlemi `PaymentMethodsModule` altında olmalı.
- Seed işlemleri idempotent kalmalı.
- `code` üzerinden tekrar çalıştırılabilir davranış korunmalı.
- RBAC seed ayrı kalmalı; RBAC permission ve role-permission assignment güncellemeleri `src/modules/rbac/seed/rbac-seed.data.ts` içinde korunmalı.

AppModule güncellemesi:

- `CheckoutReferenceModule` importunu kaldır.
- `ShippingCarriersModule` import et.
- `PaymentMethodsModule` import et.
- Başka modüllerde eski checkout-reference importu varsa düzelt.

Refactor sonrası eski import kalmadığını kontrol et:

```bash
grep -R "checkout-reference" src || true
grep -R "CheckoutReference" src || true
```

Bu aramalarda `src` içinde eski modüle ait import, class, enum veya service kalmamalı.

Çalıştırman gereken kontroller:

```bash
pnpm exec prettier --write src/**/*.ts
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Canlı HTTP testleri mümkünse şu davranışları doğrula:

1. `GET /api/shipping-carriers` token olmadan 200 dönmeli.
2. `GET /api/payment-methods` token olmadan 200 dönmeli.
3. Token yokken `POST /api/admin/shipping-carriers` 401 dönmeli.
4. CUSTOMER token ile `POST /api/admin/shipping-carriers` 403 dönmeli.
5. SUPER_ADMIN token ile `POST /api/admin/shipping-carriers` başarılı olmalı.
6. ORDER_MANAGER shipping/payment admin CRUD yapabilmeli.
7. SUPPORT_STAFF sadece read yapabilmeli, create/update/delete yapamamalı.
8. `DELETE /api/admin/shipping-carriers/:id` sonrası kayıt public listte görünmemeli.
9. `GET /api/admin/shipping-carriers?status=inactive` ile inactive kayıt görülebilmeli.
10. Aynı kontroller payment methods için de geçerli olmalı.

Son olarak bana şu bilgileri raporla:

- Sildiğin dosya/klasörler
- Eklediğin yeni dosya/klasörler
- Taşıdığın veya yeniden oluşturduğun entity/DTO/response/repository/service/controller isimleri
- AppModule import değişiklikleri
- RBAC seed değişmedi mi, değiştiyse ne değişti?
- Endpoint pathlerinin aynı kaldığını doğrula
- Entity table adlarının aynı kaldığını doğrula
- `grep -R "checkout-reference" src` sonucu
- `grep -R "CheckoutReference" src` sonucu
- Build/lint/test sonuçları
- Canlı HTTP test yaptıysan sonuçları
- Bilinçli ertelediğin noktalar
- Migration gerekiyorsa notu; destructive migration yapma
