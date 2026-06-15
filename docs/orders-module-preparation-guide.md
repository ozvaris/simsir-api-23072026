**Orders Modülü İçin Kod Yazmadan Önce Yapılacaklar**

1. **Order domain scope’unu netleştirelim**
   - Order sadece checkout sonucu mu oluşacak?
   - Admin manuel order açabilecek mi?
   - Guest checkout olacak mı?
   - Tek sipariş akışı mı var, yoksa ileride split shipment / partial fulfillment düşünüyor muyuz?

   **Answer:**
   Sadece bunlar
   - Order sadece checkout sonucu mu oluşacak?
   - Admin manuel order açabilecek mi?
   - Guest checkout olacak mı?


2. **Order lifecycle kararlarını verelim**
   - Sipariş durumları ne olacak:
     - `PENDING`
     - `CONFIRMED`
     - `PROCESSING`
     - `SHIPPED`
     - `DELIVERED`
     - `CANCELLED`
   - Hangi durumdan hangisine geçilebilir?
   - İptal hangi aşamaya kadar mümkün?

   **Answer:**
   Uygun

3. **Payment lifecycle’ı netleştirelim**
   - Payment status alanı olacak mı?
   - Örnek:
     - `PENDING`
     - `PAID`
     - `FAILED`
     - `REFUNDED`
     - `PARTIALLY_REFUNDED`
   - COD, bank transfer, credit card için aynı model mi kullanılacak?
   

   **Answer:**
   Evet, tutar. bankaya ait saklanaması gereken bilgilerde olacak.

4. **Shipping lifecycle’ı netleştirelim**
   - Shipping status ayrı alan mı olacak?
   - Örnek:
     - `PREPARING`
     - `READY_TO_SHIP`
     - `SHIPPED`
     - `DELIVERED`
     - `RETURNED`

   **Answer:**
   Evet, kargo numarası da olacak

5. **Order entity sınırlarını belirleyelim**
   - `Order`
   - `OrderItem`
   - gerekiyorsa:
     - `OrderAddress`
     - `OrderStatusHistory`
     - `OrderPaymentSnapshot`
     - `OrderShipmentSnapshot`
   - Hangi tablo çekirdek, hangisi phase-2 bunu ayıralım.

   **Answer:**
   hepsi olsun.

6. **Snapshot kararını verelim**
   - Sipariş anındaki ürün adı, fiyatı, indirim oranı, görseli, SKU/slug bilgisi `OrderItem` içine snapshot olarak yazılacak mı?
   - Address order anında kopyalanacak mı?
   - Payment method / shipping carrier adı snapshot olarak tutulacak mı?

   **Answer:**
   Evet

7. **Cart -> Order dönüşüm kuralını netleştirelim**
   - Sipariş oluşturulunca cart temizlenecek mi?
   - Aynı cart’tan ikinci kez order oluşması nasıl engellenecek?
   - Sipariş sonrası cart status değişecek mi?

   **Answer:**
      - Sipariş oluşturulunca cart temizlenecek mi?
      Evet
      - Aynı cart’tan ikinci kez order oluşması nasıl engellenecek?
      Senin önerin nedir?
    - Sipariş sonrası cart status değişecek mi?
    cart status ne amaçla kullanılıyor anlamıyorum. mevcut yapıda cart sanki her kullanıcının bir tane var ve sürekli kalıyor diye anlıyorum. CRUD operasyon cart items de oluyor diye anlıyorum.

8. **Price calculation sorumluluğunu belirleyelim**
   - Subtotal
   - item discount total
   - shipping fee
   - grand total
   - Bunları checkout mı hesaplayacak, order mı kalıcılaştıracak?

   **Answer:**
   checkout ta hesaplansın hemde aşamaları ne görmek için kalıcılaşsın. Nasıl olur? önerin nedir?

9. **Address kullanım modelini netleştirelim**
   - User address’e referans mı tutulacak?
   - Yoksa order anında shipping/billing address snapshot mı alınacak?
   - Bence snapshot daha doğru.

   **Answer:**
   Senin önerdiğin gibi. 2. Seçenek. order anında shipping/billing address snapshot alınacak.

10. **Stock etkisini kararlaştıralım**
    - Şu an inventory yoksa order stock düşmeyecek mi?
    - İleride stock gelince hangi aşamada rezerv/düşüm yapılacak?

    **Answer:**
    Çok güzel bir konuya değindin bizdeki stok yapısı nasıl?

11. **Delete / cancel / archive kararını netleştirelim**
    - Order hard-delete olmayacak gibi duruyor.
    - Cancel ayrı business action olmalı.
    - Admin delete olacak mı? Büyük ihtimalle hayır.

    **Answer:**
    - Order hard-delete olmayacak gibi duruyor.
      evet haklısın. order oluştumu artık silmemek gerek.
    - Cancel ayrı business action olmalı.
      haklısın business action olmalı. zaten order status ta CANCELLED durumu planladık.
    - Admin delete olacak mı? Büyük ihtimalle hayır.

12. **RBAC ve ownership kurallarını yazalım**
    - Customer kendi orderlarını görebilir mi?
    - `ORDER_MANAGER` neleri yapabilir?
    - `SUPPORT_STAFF` sadece görüntüleme mi yapar?
    - Kim status değiştirebilir?

    **Answer:**
    Önerilerini listele lütfen.

13. **API contract’ı tasarlayalım**
   - Customer:
     - order create
     - my orders list
     - my order detail
     - my order cancel
   - Admin:
     - orders list
     - order detail
     - status update
     - payment/shipping update

   **Answer:**
   Evet doğru gözüküyor.

14. **Entity & relation dokümanını güncelleyelim**
   - `nestjs-entities-and-relations.md`
   - `nestjs-api-contract.md`
   - gerekiyorsa `rbac-role-permission-matrix.md`

   **Answer:**

15. **Seed ve test yaklaşımını baştan kararlaştıralım**
   - Şimdilik order seed yok
   - Modül tamamlanınca demo order feature request zaten hazır
   - Testte hangi minimum senaryolar zorunlu olacak:
     - cart’tan order creation
     - ownership
     - admin status update
     - cancel rules

   **Answer:**
   seed e gerek yok. test e, postman e odaklanma...

Bence en doğru sıra şu:
1. Order lifecycle
2. Entity boundaries + snapshot rules
3. RBAC/ownership
4. API contract
5. Sonra kod

İstersen bir sonraki adımda bunu `orders modülü hazırlık checklist` gibi kısa bir md dokümana dönüştürelim.


**Question:**
auditlog için nedersin. json olarak yeni ve eski value yu kimin değiştirdiğini vs tutalım mı? yada şimdilik request oluşturalım sonra ekleyebilir misin?

---

**Orders Modülü İçin İki Fazlı Uygulama Planı**

**Faz 1: Structural Update**

Bu fazda business workflow minimumda tutulur. Amaç veri modelini oturtmaktır.

Yapılacaklar:
- order ve inventory tarafındaki entity yapısını netleştirmek
- gerekli enumları tanımlamak
- relationları kurmak
- DTO ve response contract alanlarını hazırlamak
- ilgili mimari dokümanları güncellemek

Bu fazda konuşulan çekirdek yapı:
- `Order`
- `OrderItem`
- `OrderAddress`
- `OrderStatusHistory`
- gerekiyorsa `InventoryItem`
- `InventoryReservation`
- `InventoryTransaction`

Bu fazda netleştirilecek alan türleri:
- field listeleri
- enum listeleri
- relation yönleri
- snapshot alanları
- current status alanları

Bu fazda özellikle netleştirilecek status alanları:
- `orderStatus`
- `paymentStatus`
- `fulfillmentStatus`
- `inventoryReservationStatus`
- `inventoryTransactionType`

Schema notu:
- migration kullanılmıyor
- veritabanı gerektiğinde yeniden oluşturuluyor
- bu nedenle bu fazda migration dosyası değil, entity ve schema kararları netleştirilecek

Bu fazın amacı:
- order modülünün veri modelini oturtmak
- product ve inventory tarafında order’a hazırlık sağlayacak yapıyı netleştirmek
- business workflow kodu başlamadan önce entity sınırlarını sabitlemek

**Faz 2: Workflow / Business Rule Update**

Bu fazda veri modeli üzerine business action kuralları yazılır.

Bu fazın odağı:
- status transition kuralları
- payment type’a göre farklı akışlar
- inventory reserve / commit / release / restore davranışı
- transaction boundary kararları
- order history yazımı

Bu fazda generic status patch yaklaşımı yerine action-driven workflow önerilir.

Örnek action’lar:
- `createOrder`
- `confirmOrder`
- `markReadyForShipment`
- `handOverOrder`
- `markDelivered`
- `markDeliveryFailed`
- `markReturned`
- `restockReturnedItems`

Bu fazın amacı:
- if karmaşasını azaltmak
- business rule’ları named action’lar üzerinden yönetmek
- payment, fulfillment ve inventory akışını kontrollü şekilde bağlamak

**Bu çalışma için mevcut karar**

Önce Faz 1 yapılacak.

Yani:
1. entity’ler
2. field’lar
3. enumlar
4. relationlar
5. contract hazırlığı
6. doküman güncellemeleri

Workflow kuralları ikinci aşamada ele alınacak.
