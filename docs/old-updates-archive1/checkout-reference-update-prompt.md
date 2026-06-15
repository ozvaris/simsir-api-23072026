Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde Checkout Reference modüllerini eklemeni istiyorum.

Bu aşamada gerçek checkout/order oluşturma akışına geçmiyoruz. Önce checkout ekranının kullanacağı referans verileri olan `ShippingCarrier` ve `PaymentMethod` modüllerini dokümanlara göre tamamlayacağız.

Önce aşağıdaki dokümanları oku ve kanonik proje standardı kabul et:

- `docs/architectureguide.md`
- `docs/backend-docs-index.md`
- `docs/nestjs-api-contract.md`
- `docs/nestjs-entities-and-relations.md`
- `docs/backend-module-patterns.md`
- `docs/rbac-module-guide.md`
- `docs/rbac-api-contract.md`

Özellikle şu mimari kuralları koru:

- Controller sadece HTTP input alıp service’e devretsin.
- Business/use-case akışı service içinde kalsın.
- Data access repository sınıflarında toplansın.
- Request body/query DTO ile gelsin.
- Response entity olarak direkt dönmesin; response class veya mapper kullanılsın.
- Mapper metodları `to...Response()` isimlendirmesini takip etsin.
- Entity doğrudan controller’dan dönmesin.
- Public endpointler açıkça `@Public()` ile işaretlensin.
- Admin/internal endpointler public olmasın.
- Admin CRUD endpointleri RBAC permission metadata ile korunsun.
- Mevcut Auth, RBAC, User, Product, Cart yapılarını bozma.
- Tenant/company/store modeli ekleme.
- Checkout diye yeni bir entity oluşturma.
- `CheckoutSession`, `CheckoutItem`, `Checkout` gibi yeni tablolar oluşturma.
- Order oluşturma akışına bu prompt kapsamında geçme.
- `POST /api/orders` veya cart’tan order oluşturma işlemini bu aşamada implemente etme.
- Order entegrasyonu gerekiyorsa sadece raporda hazırlık notu olarak belirt.

Bu aşamada tamamlanacak entity/modül seti:

- `ShippingCarrier`
- `PaymentMethod`

Dokümandaki entity beklentileri:

`ShippingCarrier`:

- `id`
- `code`
- `name`
- `fee`

`PaymentMethod`:

- `id`
- `code`
- `name`

Not:

- `id`, mevcut projede `AppBaseEntity` üzerinden geliyorsa entity içinde tekrar tanımlama.
- `createdAt` ve `updatedAt` da base entity’den geliyorsa tekrar ekleme.
- Mevcut entity base pattern’ine uy.

Önerilen klasör yapısı:

```txt
src/modules/checkout-reference/
  checkout-reference.module.ts

  controllers/
    shipping-carriers.controller.ts
    shipping-carriers-admin.controller.ts
    payment-methods.controller.ts
    payment-methods-admin.controller.ts

  dto/
    create-shipping-carrier.dto.ts
    update-shipping-carrier.dto.ts
    list-shipping-carriers-query.dto.ts
    create-payment-method.dto.ts
    update-payment-method.dto.ts
    list-payment-methods-query.dto.ts

  entities/
    shipping-carrier.entity.ts
    payment-method.entity.ts

  repositories/
    shipping-carriers.repository.ts
    payment-methods.repository.ts

  responses/
    shipping-carrier.response.ts
    payment-method.response.ts
    operation-result.response.ts

  mappers/
    checkout-reference.mapper.ts

  seed/
    checkout-reference-seed.service.ts
```

Eğer mevcut projede modül isimlendirmesi farklı bir stile sahipse mevcut stile uy. Ama `ShippingCarrier` ve `PaymentMethod` aynı domain altında “checkout reference” olarak toplanabilir.

Public/customer endpointler:

1. `GET /api/shipping-carriers`

Amaç:

- Checkout ekranında kullanılabilecek aktif shipping carrier seçeneklerini listeler.
- Public read olabilir.
- Sadece aktif seçenekleri döndür.
- Response entity değil, mapped response olsun.

Beklenen örnek response:

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "standard",
      "name": "Standard Shipping",
      "fee": 4.99
    }
  ]
}
```

2. `GET /api/payment-methods`

Amaç:

- Checkout ekranında kullanılabilecek aktif payment method seçeneklerini listeler.
- Public read olabilir.
- Sadece aktif seçenekleri döndür.
- Response entity değil, mapped response olsun.

Beklenen örnek response:

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "credit_card",
      "name": "Credit Card"
    }
  ]
}
```

Admin CRUD endpointleri:

Shipping carrier admin endpoints:

- `GET /api/admin/shipping-carriers`
- `GET /api/admin/shipping-carriers/:shippingCarrierId`
- `POST /api/admin/shipping-carriers`
- `PATCH /api/admin/shipping-carriers/:shippingCarrierId`
- `DELETE /api/admin/shipping-carriers/:shippingCarrierId`

Payment method admin endpoints:

- `GET /api/admin/payment-methods`
- `GET /api/admin/payment-methods/:paymentMethodId`
- `POST /api/admin/payment-methods`
- `PATCH /api/admin/payment-methods/:paymentMethodId`
- `DELETE /api/admin/payment-methods/:paymentMethodId`

Admin endpointler `@Public()` olmamalı.

Admin endpointlerde RBAC permission metadata kullan.

Permission beklentileri:

Shipping carrier:

- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`

Payment method:

- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

Eğer bu permission’lar RBAC seed içinde zaten varsa kullan. Yoksa RBAC seed’e idempotent şekilde ekle. `SUPER_ADMIN` tüm permission’ları almalı. Checkout reference yönetimini hangi role vermek daha uygunsa raporda belirt. Benim önerim:

- `SUPER_ADMIN`: tüm permission’lar
- `ORDER_MANAGER`: shipping/payment reference read/update/create/delete permission’larını alabilir
- `SUPPORT_STAFF`: sadece read permission alabilir veya hiç almayabilir; mevcut seed mantığına göre karar ver

Entity alanları:

`ShippingCarrier`:

- `code`: unique, stable string
- `name`: string
- `fee`: decimal/numeric
- `status`: active/inactive benzeri alan eklenebilir, çünkü public list endpoint sadece aktifleri dönmeli
- `createdAt`, `updatedAt`: base entity’den geliyorsa tekrar tanımlama

`PaymentMethod`:

- `code`: unique, stable string
- `name`: string
- `status`: active/inactive benzeri alan eklenebilir, çünkü public list endpoint sadece aktifleri dönmeli
- `createdAt`, `updatedAt`: base entity’den geliyorsa tekrar tanımlama

Not:

- Dokümanda `status` açıkça yazmıyor olabilir. Ama public list endpointlerinde sadece aktif seçenekleri döndürmek için `status` veya `isActive` alanı gerekir.
- Mevcut projede status enum pattern’i varsa onu kullan.
- Eğer projede `ACTIVE/INACTIVE` enum standardı varsa onu takip et.
- Eğer status eklemek istemezsen bunu raporda açıkça belirt ve public listlerin tüm kayıtları döndüreceğini yaz. Benim tercihim `status` eklenmesidir.

DTO beklentileri:

`CreateShippingCarrierDto`:

- `code`
- `name`
- `fee`
- `status` opsiyonel veya default active

`UpdateShippingCarrierDto`:

- `name`
- `fee`
- `status`

`ListShippingCarriersQueryDto`:

- `page`
- `limit`
- `search`
- `status`

`CreatePaymentMethodDto`:

- `code`
- `name`
- `status` opsiyonel veya default active

`UpdatePaymentMethodDto`:

- `name`
- `status`

`ListPaymentMethodsQueryDto`:

- `page`
- `limit`
- `search`
- `status`

Validation:

- `code` zorunlu string olmalı.
- `code` normalize edilebilir: lowercase snake_case tercih edilebilir.
- `name` zorunlu string olmalı.
- `fee` number olmalı ve negatif olmamalı.
- `status` geçerli enum değerlerinden biri olmalı.
- Update DTO’da `code` varsayılan olarak değiştirilmemeli.
- Query DTO’da pagination değerleri güvenli default almalı.

Response classları:

- `ShippingCarrierResponse`
- `ShippingCarrierDetailResponse` gerekirse
- `PaymentMethodResponse`
- `PaymentMethodDetailResponse` gerekirse
- `CheckoutReferenceListResponse` veya mevcut list response standardı
- `OperationResultResponse` veya projedeki mevcut success response standardı

Repository sorumlulukları:

`ShippingCarriersRepository`:

- public active list
- admin paginated list
- find by id
- find by code
- create
- update
- delete/deactivate
- duplicate code kontrolü

`PaymentMethodsRepository`:

- public active list
- admin paginated list
- find by id
- find by code
- create
- update
- delete/deactivate
- duplicate code kontrolü

Service sorumlulukları:

`ShippingCarriersService`:

- public list
- admin list
- detail
- create
- update
- delete/deactivate

`PaymentMethodsService`:

- public list
- admin list
- detail
- create
- update
- delete/deactivate

Silme stratejisi:

- ShippingCarrier ileride Order tarafından referanslanacak.
- PaymentMethod ileride Order tarafından referanslanacak.
- Bu yüzden fiziksel silme yerine deaktif etme daha güvenli olabilir.
- Eğer hard delete uygulanırsa ileride order ilişkilerinde problem çıkmaması için raporda belirt.
- Benim tercihim: `DELETE` endpoint status’u inactive yapsın ve `{ "success": true }` dönsün.

Seed mantığı:

Checkout reference için idempotent seed ekle.

Önerilen başlangıç shipping carriers:

```txt
standard
express
pickup
```

Örnek:

- `standard`: Standard Shipping, fee 4.99
- `express`: Express Shipping, fee 9.99
- `pickup`: Store Pickup, fee 0

Önerilen başlangıç payment methods:

```txt
credit_card
bank_transfer
cash_on_delivery
```

Örnek:

- `credit_card`: Credit Card
- `bank_transfer`: Bank Transfer
- `cash_on_delivery`: Cash on Delivery

Seed tekrar çalıştırılabilir olmalı ve `code` üzerinden idempotent davranmalı.

Checkout module/process hazırlığı:

Bu prompt kapsamında gerçek checkout/order oluşturma yok.

Ama istersen minimal bir `CheckoutModule` veya `CheckoutReferenceModule` export düzeni yapabilirsin:

- Shipping carrier ve payment method service/repository ileride order creation flow tarafından kullanılabilir olsun.
- Order module bu servisleri ileride import edebilir.
- Gereksiz `Checkout` entity oluşturma.

App module / registration:

- Oluşturulan module `AppModule` içine eklenmeli.
- Mevcut import/export pattern’ine uy.
- Eğer services ileride OrdersModule tarafından kullanılacaksa module exports kısmını buna göre düzenle.

Dokümanlarla uyum:

- `docs/nestjs-api-contract.md` içindeki Checkout Reference API ile public endpointler uyumlu olsun.
- `docs/nestjs-entities-and-relations.md` içindeki `ShippingCarrier` ve `PaymentMethod` entity modeline uy.
- `docs/rbac-api-contract.md` içindeki checkout reference permission gruplarına uy.
- Eğer mevcut kod dokümanla çelişirse rastgele karar verme; raporda açıkça belirt.

Canlı test senaryoları:

1. `GET /api/shipping-carriers` token olmadan 200 dönmeli.
2. `GET /api/payment-methods` token olmadan 200 dönmeli.
3. Token yokken `POST /api/admin/shipping-carriers` 401 dönmeli.
4. CUSTOMER token ile `POST /api/admin/shipping-carriers` 403 dönmeli.
5. SUPER_ADMIN token ile `POST /api/admin/shipping-carriers` başarılı olmalı.
6. Duplicate `code` ile create deneyince conflict dönmeli.
7. `DELETE /api/admin/shipping-carriers/:id` sonrası public listte görünmemeli.
8. `GET /api/admin/shipping-carriers` admin token ile inactive kayıtları da filtreleyebilmeli.
9. Aynı testleri payment methods için de uygula.

Son olarak bana şunları raporla:

- Eklediğin/değiştirdiğin dosyalar
- Oluşturduğun entity/DTO/response/repository/service/controller isimleri
- Endpoint listesi
- Permission metadata listesi
- Seed edilen checkout reference kayıtları
- RBAC seed güncellemesi yapıldıysa detayları
- Çalıştırdığın komutlar
- Build/lint/test sonucu
- Canlı HTTP test yaptıysan sonuçları
- Bilinçli ertelediğin noktalar
- Migration gerekiyorsa notu; destructive migration yapma
