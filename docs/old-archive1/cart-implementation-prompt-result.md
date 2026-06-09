# Cart Implementation Result

Bu dosya, `docs/cart-implementation-prompt.md` talebine göre projeye eklenen Cart modülü implementasyonunun reviewer özeti olarak hazırlanmıştır.

## Kapsam

Mevcut NestJS + TypeORM + PostgreSQL mimari çizgisi korunarak Cart modülü tamamlandı.

Eklenen ana model seti:

- `Cart`
- `CartItem`

Mevcut `User`, `Product`, `Auth` ve RBAC yapıları bozulmadı. Tenant/company/store modeli eklenmedi.

## Modül Yapısı

Cart modülü şu yol altında tamamlandı:

```txt
src/modules/cart/
```

Alt yapı şu katmanlarla oluşturuldu:

- `controller`
- `service`
- `dto`
- `entities`
- `repositories`
- `responses`
- `mappers`

`src/modules/cart/cart.module.ts` içinde `Cart`, `CartItem` ve `Product` TypeORM repositoryleri bağlandı. `CartModule` zaten `src/app.module.ts` içinde kayıtlı olduğu için app registration korunarak modül içeriği tamamlandı.

## Entity Güncellemeleri

Yeni entity dosyaları:

- `src/modules/cart/entities/cart.entity.ts`
- `src/modules/cart/entities/cart-item.entity.ts`

İlişkiler:

- `User 1 - 1 Cart`
- `Cart 1 - N CartItem`
- `CartItem N - 1 Product`
- `Cart N - 1 User`

Tekrarlı cart item oluşmasını engellemek için `cartId + productId` unique index eklendi.

Quantity için veritabanı seviyesinde pozitif değer kuralı eklendi:

- `CHECK ("quantity" > 0)`

Mevcut entity ilişki güncellemeleri:

- `src/modules/users/entities/user.entity.ts` içine `cart` ilişkisi eklendi.
- `src/modules/products/entities/product.entity.ts` içine `cartItems` ilişkisi eklendi.

## DTO ve Response Katmanı

Request DTO dosyaları:

- `AddCartItemDto`
- `UpdateCartItemDto`

Validation kuralları:

- `productId` UUID olmalı.
- `quantity` integer olmalı.
- `quantity` minimum `1` olmalı.
- `0` quantity kabul edilmedi; item silme işlemi için `DELETE` endpointi kullanılır.

Response classları:

- `CartResponse`
- `CartItemResponse`
- `CartItemProductResponse`
- `CartSummaryResponse`

Entity doğrudan controller response'u olarak döndürülmedi. Mapping için `src/modules/cart/mappers/cart.mapper.ts` eklendi.

Mapper metodları:

- `toCartResponse()`
- `toCartItemResponse()`
- `toCartSummaryResponse()`

## Fiyat Hesaplama

Cart response içinde frontend-friendly fiyat alanları üretildi:

- `unitPrice`
- `discount`
- `finalUnitPrice`
- `lineTotal`
- `summary.subtotal`
- `summary.discountTotal`
- `summary.total`

`Product.discount` alanı mevcut API örneğine uygun şekilde yüzde olarak yorumlandı.

Hesap:

```txt
finalUnitPrice = price * (1 - discount / 100)
lineTotal = finalUnitPrice * quantity
```

Money değerleri response tarafında number olarak döndürülür ve iki ondalığa yuvarlanır.

## Repository Katmanı

Eklenen repository sınıfları:

- `CartsRepository`
- `CartItemsRepository`

`CartsRepository` sorumlulukları:

- Current user için active cart bulma.
- Active cart yoksa oluşturma.
- Active cart detail bilgisini items + product ilişkileriyle getirme.

`CartItemsRepository` sorumlulukları:

- Product varlık kontrolü.
- Cart item bulma.
- Cart içinde product var mı kontrolü.
- Item oluşturma.
- Quantity güncelleme.
- Item silme.
- Cart itemlarını temizleme.
- Ownership filtreli item queryleri.

## Servis Katmanı

Eklenen servis:

- `CartService`

Use-case metodları:

- `getMyCart(userId: string)`
- `addItemToMyCart(userId: string, dto: AddCartItemDto)`
- `updateMyCartItem(userId: string, itemId: string, dto: UpdateCartItemDto)`
- `removeMyCartItem(userId: string, itemId: string)`
- `clearMyCart(userId: string)`

Sorumluluklar ayrıldı:

- Controller sadece HTTP input alıp service'e devrediyor.
- Business/use-case akışı service katmanında.
- Data access repository sınıflarında.
- Response üretimi mapper/response class üzerinden.
- Ownership kontrolü current user id ile repository querylerinde uygulanıyor.

## API Endpointleri

Cart endpointleri `/api/cart` altında oluşturuldu.

Endpoint listesi:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`

Davranışlar:

- `GET /api/cart`, current user active cart'ını getirir. Yoksa active cart oluşturur.
- `POST /api/cart/items`, ürünü active cart'a ekler. Aynı product zaten varsa duplicate item oluşturmaz, quantity artırır.
- `PATCH /api/cart/items/:itemId`, sadece current user'ın active cart item quantity değerini günceller.
- `DELETE /api/cart/items/:itemId`, sadece current user'ın cart item'ını siler.
- `DELETE /api/cart`, cart kaydını silmez; active cart itemlarını temizler.

## Güvenlik

Cart controller üzerinde `@Public()` kullanılmadı.

Cart endpointleri için ayrıca admin, role veya permission guard eklenmedi. Projedeki global `JwtAuthGuard` authenticated user kontrolünü sağlar. Cart müşteri-owned bir domain olduğu için RBAC permission talep edilmedi.

Current user bilgisi request body'den alınmadı. Tüm user context erişimleri `@CurrentUser('userId')` üzerinden yapıldı.

Başka user'a ait cart item için response:

```txt
Cart item not found
```

Bu tercih, user-owned resource için ownership bilgisini sızdırmamak amacıyla `NotFoundException` davranışını korur.

## Error Handling

Uygulanan domain hataları:

- Product bulunamazsa `NotFoundException('Product not found')`
- Cart item bulunamazsa veya current user'a ait değilse `NotFoundException('Cart item not found')`
- Quantity geçersizse DTO validation error

Duplicate cart item önleme:

- Service aynı product için mevcut item'ı bulup quantity artırır.
- Entity seviyesinde `cartId + productId` unique index bulunur.

## Çalıştırılan Komutlar

Format:

```bash
pnpm exec prettier --write src/modules/cart/**/*.ts src/modules/cart/*.ts src/modules/users/entities/user.entity.ts src/modules/products/entities/product.entity.ts
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

Not: İlk denemede `pnpm test -- --runInBand` komutu Jest tarafından test pattern gibi algılandı ve test bulamadı. Doğru komut olan `pnpm exec jest --runInBand` ile testler çalıştırıldı.

## Kontrol Sonuçları

Build sonucu:

- Başarılı.

Lint sonucu:

- Başarılı.

Test sonucu:

- 1 test suite geçti.
- 1 test geçti.

HTTP senaryoları canlı DB/token ile koşturulmadı. Doğrulama build, lint ve mevcut unit test seviyesinde yapıldı.

## Migration Notu

Destructive migration yapılmadı.

Projede `synchronize: true` açık olduğu için development ortamında tablolar otomatik oluşabilir. Production için ayrıca migration önerilir.

Migration'ın kapsaması gereken ana noktalar:

- `carts` tablosu
- `cart_items` tablosu
- `carts.userId` unique index
- `cart_items.cartId + cart_items.productId` unique index
- `cart_items.quantity > 0` check constraint
- `CartStatus` enum alanı
- Foreign key ilişkileri

## Bilinçli Ertelenen Noktalar

Şu noktalar bu implementasyonda bilinçli olarak eklenmedi:

- Cart için admin endpointleri.
- Cart için RBAC permission seti.
- Tenant/company/store modeli.
- Cart status transition akışı.
- Checkout ile cart status güncelleme entegrasyonu.
- Canlı HTTP/e2e test senaryoları.
