# Orders Modülü Hazırlık Rehberi

## Amaç

Bu doküman artık orders modülü için tek kanonik çalışma dokümanıdır.

Şunları birlikte içerir:

- repo tabanlı mevcut implementasyon analizi
- daha önce konuşulmuş tasarım kararları
- halen açık olan sorular
- sonraki implementasyon planı

Yani artık şu iki ayrı bakışı tek yerde toplar:

- "mevcut durum analizi"
- "gelecek hazırlık notları"

## Mevcut Üst Seviye Durum

`src/modules/orders` modülü şu anda yapısal olarak anlamlı, fakat operasyonel olarak eksiktir.

Şu anda mevcut olanlar:

- order ile ilgili entity’ler tanımlı
- order enum’ları tanımlı
- demo order seed mantığı var
- inventory reservation ve commit davranışı seed akışında zaten referanslanıyor
- modül `AppModule` içine bağlanmış durumda

Henüz mevcut olmayanlar:

- customer order controller yok
- admin order controller yok
- runtime `OrdersService` yok
- order DTO katmanı yok
- response mapper / response contract implementasyonu yok
- gerçek business workflow API yüzeyi yok

Bu nedenle mevcut modül şöyle anlaşılmalı:

- schema-first hazırlanmış
- seed destekli
- workflow tarafı eksik

## Repo Tabanlı Mevcut Durum

### `src/modules/orders` İçinde Şu Anda Bulunan Dosya Grupları

- `entities/`
- `enums/`
- `seed/`
- `orders.module.ts`

Henüz olmayanlar:

- `controllers/`
- `services/`
- `dto/`
- `responses/`
- `repositories/`
- `mappers/`

Bu da orders modülünün şu anda tam çalışan bir runtime API modülü değil, veri modeli ve seed hazırlık katmanı olduğunu doğrular.

### Mevcut Entity Modeli

#### `Order`

Aggregate root olarak `Order` şu alanları içeriyor:

- `orderNumber`
- `userId`
- `orderStatus`
- `paymentStatus`
- `fulfillmentStatus`
- `currency`
- `subtotal`
- `discountTotal`
- `shippingFee`
- `grandTotal`
- `paymentMethodId`
- `paymentProviderId`
- `shippingCarrierId`
- `shippingCarrierServiceId`
- `notes`

Mevcut relation’lar:

- `ManyToOne -> User`
- `ManyToOne -> PaymentMethod`
- `ManyToOne -> PaymentProvider`
- `ManyToOne -> ShippingCarrier`
- `ManyToOne -> ShippingCarrierService`
- `OneToMany -> OrderItem`
- `OneToMany -> OrderAddress`
- `OneToMany -> OrderStatusHistory`
- `OneToOne -> OrderPaymentSnapshot`
- `OneToOne -> OrderShipmentSnapshot`

Değerlendirme:

- iyi bir yapısal temel var
- payment/shipping referansları ile snapshot ayrımı, hedef checkout davranışıyla uyumlu
- order entity’si ince bir live pointer değil, tarihsel kayıt olarak tasarlanmış

#### `OrderItem`

`OrderItem` şu snapshot alanlarını zaten tutuyor:

- `productId`
- `quantity`
- `unitPrice`
- `discountAmount`
- `lineSubtotal`
- `lineTotal`
- `productTitleSnapshot`
- `productSlugSnapshot`
- `brandNameSnapshot`
- `productImageSnapshot`

Mevcut relation’lar:

- `ManyToOne -> Order` with `CASCADE`
- `ManyToOne -> Product` with `RESTRICT`
- `OneToMany -> InventoryReservation`
- `OneToMany -> InventoryTransaction`

Değerlendirme:

- snapshot yönü doğru
- ürün geçmişini koruma niyeti zaten mevcut
- ürün silme koruması order’larla zaten bağlı durumda

#### `OrderAddress`

`OrderAddress`, mevcut kullanıcı adresine canlı referans olarak değil, order anı snapshot’ı olarak modellenmiş.

Alanlar:

- `addressRole`
- `label`
- `fullName`
- `phone`
- `country`
- `city`
- `state`
- `zip`
- `addressLine1`
- `addressLine2`

Değerlendirme:

- bu, tercih edilen snapshot-tabanlı address modeliyle uyumlu

#### `OrderPaymentSnapshot`

Şu snapshot alanları mevcut:

- payment method id/code/name
- payment provider id/code/name/type
- `providerConfigSnapshot`

Değerlendirme:

- checkout anındaki payment metadata’sını korumak için iyi bir yapı
- runtime payment workflow henüz yok ama persistence şekli hazır

#### `OrderShipmentSnapshot`

Şu snapshot alanları mevcut:

- `shippingOption`
- carrier id/code/name
- service id/code/name
- `estimatedDeliveryText`
- `trackingNumber`
- `shipmentPrice`
- `currency`

Değerlendirme:

- shipment metadata’sını korumak için yapısal olarak hazır

#### `OrderStatusHistory`

Status history şu alanları tutuyor:

- `statusType`
- `fromValue`
- `toValue`
- `note`

Değerlendirme:

- generic ve faydalı bir yapı mevcut
- fakat transition ownership hâlâ runtime tarafta tanımlı değil

### Mevcut Enum Tabanı

Zaten implemente edilmiş enum’lar:

- `OrderStatus`
  - `PENDING`
  - `CONFIRMED`
  - `CANCELLED`
  - `COMPLETED`

- `PaymentStatus`
  - `PENDING`
  - `UNPAID`
  - `PAID`
  - `FAILED`
  - `REFUNDED`
  - `PARTIALLY_REFUNDED`

- `FulfillmentStatus`
  - `PENDING`
  - `READY_FOR_SHIPMENT`
  - `HANDED_OVER`
  - `DELIVERED`
  - `DELIVERY_FAILED`
  - `RETURNED`

- `OrderStatusType`
  - `ORDER`
  - `PAYMENT`
  - `FULFILLMENT`

- `OrderAddressRole`
  - `shipping`
  - `billing`

- `ShippingOption`
  - `carrier`
  - `pickup`

Değerlendirme:

- enum seti, modülün canlı API yüzeyinden daha zengin
- asıl eksik parça enum tanımı değil, transition enforcement

## Mevcut Seed Davranışı

### `DemoOrdersSeedService`

Orders modülündeki en somut business davranış şu an demo seed mantığında yer alıyor.

Mevcut seed akışı:

1. demo user bulunuyor
2. shipping ve billing address bulunuyor
3. payment method ve gerekiyorsa provider bulunuyor
4. shipping carrier ve shipping service bulunuyor
5. demo product’lar bulunuyor
6. bu product’lar için inventory kayıtları zorunlu tutuluyor
7. subtotal, discount total, shipping fee ve grand total hesaplanıyor
8. şunlar oluşturuluyor:
   - `Order`
   - `OrderPaymentSnapshot`
   - `OrderShipmentSnapshot`
   - `OrderAddress`
   - `OrderStatusHistory`
   - `OrderItem`
   - `InventoryReservation`
   - `InventoryTransaction`
9. fulfillment state’e göre inventory mutate ediliyor

### Seed’in Zaten Encode Ettiği Anlam

Seed mantığı şimdiden hedef business kuralını gösteriyor:

- aktif reservation durumu:
  - reservation `ACTIVE` olur
  - `reservedQuantity` artar
  - `RESERVE` transaction yazılır

- delivered/committed durumu:
  - reservation `COMMITTED` olur
  - `onHandQuantity` azalır
  - `RESERVE` ve `COMMIT` transaction’ları yazılır

Bu da repo’nun şimdiden şu yönü işaret ettiğini gösterir:

- order create reservation açabilir
- delivered state commit anlamına gelebilir

Ama bu mantık hâlâ runtime order service’lerinde değil, yalnızca seed semantiğinde duruyor.

## Mevcut Modülün Şimdiden Kanıtladıkları

Controller ve service olmadan bile mevcut yapı şunları kanıtlıyor:

- order verisi snapshot-driven tasarlanmış
- payment ve shipping referansları hem relation hem snapshot olarak korunuyor
- tracked demo akışlarda inventory entegrasyonu zorunlu kabul ediliyor
- ürün bilgisi sonradan değişse bile order item geçmişi korunmak isteniyor
- order hard-delete normal business action olarak düşünülmüyor

## Önemli Mevcut Bağımlılıklar

### Product Delete Coupling

`OrderItem -> Product` relation’ı `RESTRICT` kullanıyor.

Bu, order history koruması için doğru ve şu anlama geliyor:

- product hard delete, mevcut order item’ları her zaman dikkate almak zorunda
- product ve order lifecycle’ı DB seviyesinde zaten birbirine bağlı

### Inventory Coupling

Mevcut davranış zaten şunu varsayıyor:

- tracked product’ların inventory kaydı vardır
- order seed reservation ve commit transaction üretebilir
- inventory reservation ve inventory commit, order tarafında anlamlı business kavramlarıdır

### Seed Ordering Hassasiyeti

Yakın zamandaki çalışma şunu gösterdi:

order seed şu başlatma sırasına duyarlı:

- products
- inventory
- addresses
- shipping carriers
- payment methods

Yani modül şu an yapısal bir integrator gibi çalışıyor, ama henüz temiz izole bir runtime modül değil.

## Mevcut Eksikler

### Eksik Runtime Business Layer

Şu anda yok:

- create order service
- cancel order service
- status transition service
- customer order list/detail service
- admin order management service

### Eksik API Surface

Henüz şu canlı endpoint’ler yok:

- customer order creation
- my orders list
- my order detail
- cancel
- admin list/detail
- admin status update

### Eksik DTO / Response Layer

Persistence modeli API katmanının önünde gidiyor.

Henüz tanımlı değil:

- request DTO’lar
- query DTO’lar
- response class’lar
- response mapper’lar

### Business Rules Hâlâ Örtük

Önemli kurallar hâlâ sadece varsayım ve seed mantığında yaşıyor:

- stock ne zaman reserve edilir
- stock ne zaman commit edilir
- stock ne zaman release edilir
- hangi fulfillment geçişleri geçerli
- hangi order status geçişleri geçerli
- untracked product’lar inventory flow’u tamamen bypass eder mi

## Mevcut Planlama Kararları

Şu başlıklar, artık mevcut çalışma yönü olarak kabul edilmeli.

### 1. Order Domain Scope

Ana yön:

- order checkout flow sonucunda oluşmalı
- admin manuel order creation hâlâ tasarım konusu
- guest checkout hâlâ açık tasarım konusu

### 2. Snapshot Policy

Kararlaştırılmış yön:

- product verisi `OrderItem` içine snapshot alınmalı
- shipping/billing address `OrderAddress` içine snapshot alınmalı
- payment/shipping metadata dedicated snapshot tablolarında tutulmalı

### 3. Price Calculation Responsibility

Mevcut hedef yön:

- checkout toplamları hesaplamalı
- order bu hesapları kalıcı historical record olarak saklamalı

Bu şu anlama gelir:

- hesaplayan checkout
- kalıcılaştıran order

### 4. Inventory Policy

Mevcut çalışma kararı:

- `isTrackedInventory`, `Product` üzerinde gerçek business field olacak
- `isTrackedInventory = true` ise ürün stock tracking’e tabidir
- `isTrackedInventory = false` ise inventory reservation / transaction flow çalışmamalıdır

Tracked ürün kuralları:

- inventory record zorunlu
- order create reserve etmeli, doğrudan commit etmemeli
- cancel release etmeli
- shipped/delivered benzeri completion aşaması commit etmeli

Özet:

- order create = reserve
- cancel = release
- shipped/delivered aşaması = commit

### 5. Delete / Cancel / Archive Yönü

Mevcut çalışma yönü:

- order, rutin bir business action olarak hard-delete edilmemeli
- cancel bir business action olmalı, delete değil
- admin delete ana modelin parçası olmamalı

### 6. API Surface Yönü

Customer tarafı hedef:

- create order
- my orders list
- my order detail
- cancel own order

Admin tarafı hedef:

- orders list
- order detail
- status update
- payment/shipping update

## Hâlâ Netleşmemiş Açık Sorular

### 1. Cart -> Order Idempotency

Hâlâ net kural gerekiyor:

- aynı cart’tan ikinci kez order nasıl engellenecek

### 2. Cart Lifecycle Anlamı

Hâlâ açıklığa kavuşturulmalı:

- cart’ın kendisine anlamlı bir lifecycle status verilecek mi
- yoksa sürekli yaşayan bir container olarak kalıp gerçek değişiklikler yalnızca cart items üstünde mi olacak

### 3. RBAC ve Ownership

Hâlâ açık politika gerekiyor:

- customer sadece kendi order’larını mı görebilir
- `ORDER_MANAGER` tam olarak neyi değiştirebilir
- `SUPPORT_STAFF` hangi noktada sadece read-only kalır
- hangi status ailesini kim değiştirebilir

### 4. Guest Checkout

Hâlâ kararsız:

- guest checkout olacak mı
- olacaksa temporary customer identity mi, farklı snapshot yolu mu gerekecek

### 5. Audit Log

Hâlâ açık:

- order/payment/fulfillment değişikliklerinde actor + old/new value içeren zengin audit JSON tutulacak mı

Mevcut öneri:

- ilk implementasyonu dedicated audit log subsystem ile bloklama
- minimum built-in history olarak `OrderStatusHistory` ile başla
- daha zengin audit logging’i sonraki feature olarak ele al

## İki Fazlı Uygulama Planı

### Faz 1: Structural Update

Amaç:

- orders modülünü sadece yapısal olarak değil, runtime'da minimum düzeyde gerçek ve test edilebilir hale getirmek

Odak:

- entity’ler
- enum’lar
- relation’lar
- snapshot field’lar
- DTO ve response contract hazırlığı
- customer-facing read surface
- ilk disposable order lifecycle
- inventory bağlantılı order creation ve cancellation doğrulaması
- doküman güncellemeleri

Bu fazda netleştirilecek alanlar:

- field listeleri
- enum listeleri
- relation yönleri
- snapshot payload sınırları
- mevcut status alanları
- `isTrackedInventory` gibi product-level inventory policy alanları
- test çalıştırırken order'ın nasıl oluşturulacağı, geri okunacağı, cancel edileceği ve inventory etkisinin nasıl gözlemleneceği

Bu fazın amacı:

- schema’yı tutarlı hale getirmek
- product ve inventory’yi order entegrasyonuna hazırlamak
- ilk gerçek runtime order flow'unu açmak
- modülü Postman/Newman ile güvenli bir uçtan uca order lifecycle üzerinden test edilebilir hale getirmek

Faz 1 artık şu minimum çalıştırılabilir akışı kapsamalıdır:

1. cart hazırla
2. order oluştur
3. order detail oku
4. order cancel et
5. inventory etkisini gözlemle
6. final sonucu doğrula

Yani Faz 1 artık sadece "read only" değildir.

Bu faz, order modülünün ilk kez runtime'da tamamlanmış ve test edilebilir dilimidir.

### Faz 2: Workflow / Business Rule Update

Amaç:

- ilk çalışır order lifecycle'ının üzerine daha zengin ve daha sıkı workflow modelini inşa etmek

Odak:

- status transition kuralları
- payment type’a göre farklı workflow davranışları
- inventory reserve / commit / release akışı
- transaction boundary kararları
- order history yazım kuralları
- tracked ürün yaşam döngüsü

Önerilen yaklaşım:

- generic "status patch" yerine action-driven workflow kullanmak

Dolayısıyla Faz 2, temel Faz 1 order lifecycle'ı çalışır ve test edilebilir hale geldikten sonra başlamalıdır.

Faz 2’nin amacı:

- daha zengin admin/customer action’ları
- daha sıkı transition enforcement
- daha geniş payment ve fulfillment davranışları
- daha derin inventory lifecycle kuralları
- ilk create/cancel diliminin ötesinde daha büyük workflow kapsamı

Olası action’lar:

- `confirmOrder`
- `markReadyForShipment`
- `handOverOrder`
- `markDelivered`
- `markDeliveryFailed`
- `markReturned`
- `restockReturnedItems`
- admin cancellation refinements

## Önerilen Implementasyon Sırası

En mantıklı sonraki implementasyon sırası:

1. `OrdersService` oluştur
2. customer-facing minimum read model ekle
   - my orders list
   - my order detail
3. checkout-to-order creation flow ekle
4. cancellation ve inventory release davranışını ekle
5. temel çalıştırılabilir akışı Postman/Newman ile doğrula
   - cart hazırla
   - order oluştur
   - detail oku
   - cancel et
   - inventory etkisini gözlemle
   - sonucu doğrula
6. admin list/detail/status update yüzeyini ekle
7. RBAC ve ownership kontrollerini güçlendir
8. daha zengin workflow transition'ları ve inventory commit davranışını implemente et
9. Faz 3 hardening aşamasına geçmeden önce workflow ve coverage alanını genişlet

## Hazırlık Değerlendirmesi

### Hazır

- entity foundation
- snapshot structure
- enum baseline
- structural verification için demo seed
- product/order delete protection coupling

### Kısmen Hazır

- inventory-integrated order semantics
- payment/shipping snapshot persistence
- status history modeli

### Henüz Hazır Değil

- live order APIs
- runtime workflow service layer
- DTO / response layer
- customer/admin RBAC behavior
- cancellation ve release mantığı
- transition policy enforcement

## Sonuç

Mevcut `src/modules/orders` modülü placeholder değil.

Şimdiden güçlü bir yapısal çekirdeğe sahip:

- order aggregate
- item snapshot’ları
- address snapshot’ları
- payment snapshot’ları
- shipment snapshot’ları
- status history
- reservation ve commit kavramlarını işleyen demo seed mantığı

Ama hâlâ tam bir runtime business module değil.

Eksik olan katman:

- service ownership
- API surface
- DTO ve response contract
- status transition enforcement
- customer/admin davranış kuralları

Kısa özet:

- veri modeli: anlamlı şekilde hazırlanmış
- business API: henüz implemente edilmemiş
- seed semantiği: değerli ama runtime workflow’un yerine geçmez
