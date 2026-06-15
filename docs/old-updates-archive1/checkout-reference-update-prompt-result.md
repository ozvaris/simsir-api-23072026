# Checkout Reference Update Result

Bu dosya, `docs/checkout-reference-update-prompt.md` talebine göre projeye eklenen Checkout Reference implementasyonunun reviewer özeti olarak hazırlanmıştır.

## Kapsam

Mevcut NestJS + TypeORM + PostgreSQL mimari çizgisi korunarak checkout ekranının kullanacağı referans verileri eklendi.

Eklenen ana model seti:

- `ShippingCarrier`
- `PaymentMethod`

Gerçek checkout/order oluşturma akışına geçilmedi. `Checkout`, `CheckoutSession` veya `CheckoutItem` gibi yeni entity/tablo oluşturulmadı.

Mevcut Auth, RBAC, User, Product ve Cart yapıları bozulmadı. Tenant/company/store modeli eklenmedi.

## Yeni Modül

Yeni modül yolu:

```txt
src/modules/checkout-reference/
```

Alt yapı şu katmanlarla oluşturuldu:

- `controllers`
- `dto`
- `entities`
- `enums`
- `mappers`
- `repositories`
- `responses`
- `seed`
- `services`

`src/modules/checkout-reference/checkout-reference.module.ts` üzerinden modül uygulamaya bağlandı.

`src/app.module.ts` içine `CheckoutReferenceModule` import edildi.

## Entity Güncellemeleri

Yeni entity dosyaları:

- `src/modules/checkout-reference/entities/shipping-carrier.entity.ts`
- `src/modules/checkout-reference/entities/payment-method.entity.ts`

`ShippingCarrier` alanları:

- `id`
- `code`
- `name`
- `fee`
- `status`
- `createdAt`
- `updatedAt`

`PaymentMethod` alanları:

- `id`
- `code`
- `name`
- `status`
- `createdAt`
- `updatedAt`

`id`, `createdAt` ve `updatedAt` alanları mevcut `AppBaseEntity` üzerinden gelir.

`code` alanları unique index ile korunur. Public endpointlerin sadece aktif kayıtları döndürebilmesi için `CheckoutReferenceStatus` enum'u eklendi:

- `active`
- `inactive`

## DTO ve Response Katmanı

Shipping carrier DTO:

- `CreateShippingCarrierDto`
- `UpdateShippingCarrierDto`
- `ListShippingCarriersQueryDto`

Payment method DTO:

- `CreatePaymentMethodDto`
- `UpdatePaymentMethodDto`
- `ListPaymentMethodsQueryDto`

Validation kuralları:

- `code` zorunlu string.
- `name` zorunlu string.
- `fee` number ve negatif olamaz.
- `status` enum değerlerinden biri olmalı.
- Query DTO'larında `page`, `limit`, `search`, `status` desteklenir.
- `page` default `1`, `limit` default `20`, max `100`.
- Update DTO'larında `code` değiştirilmez.

Response classları:

- `ShippingCarrierResponse`
- `PaymentMethodResponse`
- `CheckoutReferenceListResponse`
- `OperationResultResponse`

Entity doğrudan controller response'u olarak döndürülmedi. Mapping için `src/modules/checkout-reference/mappers/checkout-reference.mapper.ts` eklendi.

Mapper metodları:

- `toShippingCarrierResponse()`
- `toPaymentMethodResponse()`

Decimal `fee` değeri response tarafında number'a çevrilir.

## Repository Katmanı

Eklenen repository sınıfları:

- `ShippingCarriersRepository`
- `PaymentMethodsRepository`

Repository sorumlulukları:

- Public active list.
- Admin paginated list.
- `id` ile detail bulma.
- `code` ile duplicate kontrolü.
- Create/save işlemleri.
- Search ve status filtreleri.

## Servis Katmanı

Eklenen servisler:

- `ShippingCarriersService`
- `PaymentMethodsService`

Service use-case metodları:

- Public list.
- Admin list.
- Admin detail.
- Create.
- Update.
- Deactivate.

Sorumluluklar ayrıldı:

- Controller sadece HTTP input alıp service'e devrediyor.
- Business/use-case akışı service katmanında.
- Data access repository sınıflarında.
- Response üretimi mapper/response class üzerinden.

`code` alanı create sırasında normalize edilir:

- lowercase
- snake_case benzeri form
- baştaki/sondaki `_` temizlenir

## API Endpointleri

Public checkout reference endpointleri:

- `GET /api/shipping-carriers`
- `GET /api/payment-methods`

Bu endpointler açıkça `@Public()` ile işaretlendi ve sadece `active` kayıtları döndürür.

Shipping carrier admin endpointleri:

- `GET /api/admin/shipping-carriers`
- `GET /api/admin/shipping-carriers/:shippingCarrierId`
- `POST /api/admin/shipping-carriers`
- `PATCH /api/admin/shipping-carriers/:shippingCarrierId`
- `DELETE /api/admin/shipping-carriers/:shippingCarrierId`

Payment method admin endpointleri:

- `GET /api/admin/payment-methods`
- `GET /api/admin/payment-methods/:paymentMethodId`
- `POST /api/admin/payment-methods`
- `PATCH /api/admin/payment-methods/:paymentMethodId`
- `DELETE /api/admin/payment-methods/:paymentMethodId`

Admin endpointler public değildir.

## Permission Metadata

Shipping carrier admin permission'ları:

- `shipping_carrier.read`
- `shipping_carrier.create`
- `shipping_carrier.update`
- `shipping_carrier.delete`

Payment method admin permission'ları:

- `payment_method.read`
- `payment_method.create`
- `payment_method.update`
- `payment_method.delete`

Bu permission kodları RBAC seed içinde zaten vardı.

## RBAC Seed Güncellemesi

`src/modules/rbac/seed/rbac-seed.data.ts` role-permission assignment kısmı güncellendi.

`SUPER_ADMIN`:

- Tüm permission'ları almaya devam eder.

`ORDER_MANAGER`:

- Mevcut order permission'larına ek olarak shipping carrier ve payment method yönetim permission'larını alır.

Eklenen kapsam:

- `shipping_carrier.*`
- `payment_method.*`

`SUPPORT_STAFF`:

- Checkout reference için read permission alır.

Eklenen permission'lar:

- `shipping_carrier.read`
- `payment_method.read`

## Checkout Reference Seed

Eklenen seed servisi:

- `CheckoutReferenceSeedService`

Seed idempotent çalışır ve `code` üzerinden mevcut kayıtları kontrol eder.

Başlangıç shipping carrier kayıtları:

- `standard`: Standard Shipping, fee `4.99`
- `express`: Express Shipping, fee `9.99`
- `pickup`: Store Pickup, fee `0.00`

Başlangıç payment method kayıtları:

- `credit_card`: Credit Card
- `bank_transfer`: Bank Transfer
- `cash_on_delivery`: Cash on Delivery

Tüm seed kayıtları `active` status ile oluşturulur.

## Silme Stratejisi

`DELETE` endpointleri fiziksel silme yapmaz.

Shipping carrier ve payment method kayıtları ileride order tarafından referanslanabileceği için delete işlemi status'u `inactive` yapar ve şu response'u döner:

```json
{
  "success": true
}
```

Inactive kayıtlar public listelerde görünmez. Admin list endpointleri `status` query filtresiyle aktif/inaktif kayıtları listeleyebilir.

## Çalıştırılan Komutlar

Format:

```bash
pnpm exec prettier --write src/modules/checkout-reference/**/*.ts src/modules/checkout-reference/*.ts src/app.module.ts src/modules/rbac/seed/rbac-seed.data.ts
```

Build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Test:

```bash
pnpm exec jest --runInBand
```

## Kontrol Sonuçları

Build sonucu:

- Başarılı.

Lint sonucu:

- Başarılı.

Test sonucu:

- 1 test suite geçti.
- 1 test geçti.

Canlı HTTP/token senaryoları çalıştırılmadı. Doğrulama build, lint ve mevcut unit test seviyesinde yapıldı.

## Migration Notu

Destructive migration yapılmadı.

Projede `synchronize: true` açık olduğu için development ortamında tablolar otomatik oluşabilir. Production için ayrıca migration önerilir.

Migration'ın kapsaması gereken ana noktalar:

- `shipping_carriers` tablosu
- `payment_methods` tablosu
- `code` unique indexleri
- `status` alanları
- `shipping_carriers.fee` numeric alanı
- RBAC role-permission assignment değişiklikleri

## Bilinçli Ertelenen Noktalar

Şu noktalar bu implementasyonda bilinçli olarak eklenmedi:

- Gerçek checkout flow.
- Cart'tan order oluşturma.
- `POST /api/orders`.
- `Checkout`, `CheckoutSession`, `CheckoutItem` entityleri.
- Order module ile servis entegrasyonu.
- Canlı HTTP/e2e test senaryoları.
