Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde Cart modülünü dokümanlara göre eklemeni istiyorum.

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
- User-owned resource işlemlerinde ownership kontrolü service/repository sınırında yapılsın.
- Current user bilgisi request body’den alınmasın; auth context / `@CurrentUser()` üzerinden alınsın.
- Public endpoint oluşturma. Cart endpointleri authenticated user endpointleridir.
- Cart için RBAC permission isteme. Cart müşteri-owned bir domain olduğu için `JwtAuthGuard + ownership` yeterlidir.
- Tenant/company/store modeli ekleme.
- Mevcut RBAC yapısını bozma.
- Mevcut Product, User, Auth yapılarını bozma.

Cart domain entity beklentisi:

`Cart`:

- `id`
- `userId`
- `status`

`CartItem`:

- `id`
- `cartId`
- `productId`
- `quantity`

İlişkiler:

- `User 1 - 1 Cart`
- `Cart 1 - N CartItem`
- `CartItem N - 1 Product`
- `Cart N - 1 User`

Eğer entityler zaten varsa mevcut entityleri incele ve gerekirse eksikleri tamamla. Entityleri yeniden oluşturup mevcut yapıyı bozma.

Klasör yapısı mevcut proje stiline uygun olsun. Önerilen yapı:

```txt
src/modules/cart/
  cart.module.ts
  cart.controller.ts
  cart.service.ts
  dto/
    add-cart-item.dto.ts
    update-cart-item.dto.ts
  entities/
    cart.entity.ts
    cart-item.entity.ts
  repositories/
    carts.repository.ts
    cart-items.repository.ts
  responses/
    cart.response.ts
    cart-item.response.ts
    cart-summary.response.ts
  mappers/
    cart.mapper.ts
```

Eğer projede mapperlar service içinde private method olarak tutuluyorsa mevcut stile uy. Ama response mapping mutlaka entity’den ayrılmış olsun.

Uygulanacak API endpointleri:

1. `GET /api/cart`

Amaç:

- current authenticated user’ın aktif cart bilgisini döndürür.
- Kullanıcının aktif cart’ı yoksa boş aktif cart oluşturabilir veya boş cart response dönebilir. Proje için daha pratik yaklaşım: aktif cart yoksa create/get-or-create yap.

Access:

- authenticated user
- RBAC permission gerekmez
- ownership current user üzerinden sağlanır

2. `POST /api/cart/items`

Amaç:

- current user’ın aktif cart’ına ürün ekler.
- Eğer ürün zaten cart içinde varsa quantity artırılır.
- Ürün cart içinde yoksa yeni CartItem oluşturulur.
- Product var mı kontrol edilir.
- Quantity pozitif olmalı.

Request DTO:

```json
{
  "productId": "prd_001",
  "quantity": 1
}
```

3. `PATCH /api/cart/items/:itemId`

Amaç:

- current user’ın kendi aktif cart’ındaki item quantity değerini günceller.
- Item current user’ın cart’ına ait değilse not found veya forbidden dön.
- Quantity pozitif olmalı.
- Quantity 0 gönderilirse nasıl davranılacağı net olmalı. Benim tercihim: 0 kabul etme, silmek için DELETE endpoint kullanılsın.

Request DTO:

```json
{
  "quantity": 2
}
```

4. `DELETE /api/cart/items/:itemId`

Amaç:

- current user’ın kendi aktif cart’ındaki item’ı siler.
- Başkasının cart item’ı silinememeli.

Response:

```json
{
  "success": true
}
```

5. `DELETE /api/cart`

Amaç:

- current user’ın aktif cart’ını temizler.
- Cart kaydını fiziksel olarak silmek yerine itemları silmek daha güvenli olabilir.
- Cart status stratejisi varsa mevcut stile göre uygula.

Response:

```json
{
  "success": true
}
```

Response shape için frontend-friendly bir yapı kullan.

Önerilen `CartResponse`:

```json
{
  "id": "cart_001",
  "userId": "usr_001",
  "status": "active",
  "items": [
    {
      "id": "item_001",
      "cartId": "cart_001",
      "productId": "prd_001",
      "quantity": 2,
      "unitPrice": 1299,
      "discount": 10,
      "finalUnitPrice": 1169.1,
      "lineTotal": 2338.2,
      "product": {
        "id": "prd_001",
        "slug": "iphone-13-pro-max",
        "title": "iPhone 13 Pro Max",
        "brandName": "Apple",
        "imgUrl": "/assets/superstore/iphone-13-pro-max.png"
      }
    }
  ],
  "summary": {
    "itemCount": 1,
    "totalQuantity": 2,
    "subtotal": 2598,
    "discountTotal": 259.8,
    "total": 2338.2
  }
}
```

Price hesaplama kuralları:

- `unitPrice` product.price üzerinden gelsin.
- `discount` product.discount üzerinden gelsin.
- `finalUnitPrice = price - discount uygulanmış fiyat`
- Eğer mevcut projede discount yüzde olarak kullanılıyorsa:
  - `finalUnitPrice = price * (1 - discount / 100)`

- Eğer mevcut projede discount amount olarak kullanılıyorsa mevcut product mantığına uy.
- Hesaplama service/mapper tarafında merkezi olsun.
- Decimal/string dönüşümleri mevcut product response standardına uyacak şekilde yapılsın.

Repository sorumlulukları:

`CartsRepository`:

- current user active cart bulma
- active cart yoksa oluşturma
- cart detail’i items + product relation ile getirme
- cart ownership queryleri

`CartItemsRepository`:

- cart item bulma
- product cart içinde var mı kontrol etme
- item ekleme
- item quantity güncelleme
- item silme
- cart itemlarını temizleme

Service use-case metodları:

- `getMyCart(userId: string)`
- `addItemToMyCart(userId: string, dto: AddCartItemDto)`
- `updateMyCartItem(userId: string, itemId: string, dto: UpdateCartItemDto)`
- `removeMyCartItem(userId: string, itemId: string)`
- `clearMyCart(userId: string)`

Validation:

`AddCartItemDto`:

- `productId` zorunlu string
- `quantity` zorunlu number/int
- `quantity` minimum 1

`UpdateCartItemDto`:

- `quantity` zorunlu number/int
- `quantity` minimum 1

Error handling:

- Product bulunamazsa `NotFoundException('Product not found')`
- Cart item bulunamazsa veya current user’a ait değilse `NotFoundException('Cart item not found')`
- Quantity geçersizse validation error
- Duplicate cart item oluşmamalı; aynı product tekrar eklenirse quantity artırılmalı
- Database unique constraint hataları meaningful API error’a çevrilebiliyorsa çevir

Security:

- Cart controller üzerinde `@Public()` olmamalı.
- Endpointler authenticated current user ile çalışmalı.
- `userId` request body’den alınmamalı.
- Admin, role veya permission guard ekleme. Cart normal customer-owned akıştır.
- Başkasının cart item’ına erişim mümkün olmamalı.

App module / module registration:

- `CartModule` zaten varsa güncelle.
- Yoksa oluştur ve `AppModule` içine ekle.
- Product entity/repository erişimi için mevcut proje stiline göre ProductsModule export/import veya TypeORM repository injection kullan.
- UsersModule ile gereksiz service dependency kurma; cart işlemlerinde current user id yeterliyse UserService çağırma.

Dokümanlarla uyum:

- `docs/nestjs-api-contract.md` içindeki Cart API ile endpointler uyumlu olsun.
- `docs/nestjs-entities-and-relations.md` içindeki Cart/CartItem ilişki modeliyle uyumlu olsun.
- Eğer dokümanda eksik response detayı varsa mevcut mimari standardına göre response class oluştur; dokümanı değiştirme, önce kodu tamamla.
- Eğer mevcut proje kodu dokümanla çelişiyorsa çelişkiyi raporda açıkça belirt, rastgele karar verme.

Test / kontrol:

Uygulamadan sonra şu senaryoları kontrol et:

1. Token yokken `GET /api/cart` → 401
2. Login olmuş user `GET /api/cart` → 200
3. Product yokken `POST /api/cart/items` → 404
4. Product varsa `POST /api/cart/items` → item eklenir
5. Aynı product tekrar eklenirse duplicate item değil quantity artar
6. `PATCH /api/cart/items/:itemId` sadece current user’ın item’ını günceller
7. Başka user’ın item’ı güncellenemez/silinemez
8. `DELETE /api/cart/items/:itemId` item siler
9. `DELETE /api/cart` aktif cart itemlarını temizler
10. Response entity graph değil, mapped response döner

Son olarak bana şunları raporla:

- Eklediğin/değiştirdiğin dosyalar
- Oluşturduğun DTO/response/repository/service/controller isimleri
- Endpoint listesi
- Çalıştırdığın komutlar
- Build/lint/test sonucu
- Bilinçli ertelediğin noktalar
- Migration gerekiyorsa notu; destructive migration yapma
