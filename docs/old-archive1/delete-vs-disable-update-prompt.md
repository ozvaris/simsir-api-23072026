# Codex Prompt — Delete vs Disable Semantics Update

## Goal

Mevcut NestJS + TypeORM + PostgreSQL e-ticaret backend projemde silme davranışını mimari olarak düzeltmeni istiyorum.

Bu güncellemenin ana kararı şudur:

```txt
DELETE = hard delete denemesi
status update = disable / deactivate / public görünürlükten çıkarma
```

`DELETE` endpointleri otomatik olarak `status = inactive` yapmamalı. Eğer kayıt ilişkili başka kayıtlar yüzünden silinemiyorsa veya silinmemesi gerekiyorsa `409 Conflict` dönmeli. Kayıt pasifleştirilmek isteniyorsa bu işlem `PATCH` ile açıkça `status` güncellenerek yapılmalı.

Bu bir “her şeyi sil” görevi değildir. Bu görev, delete semantiğini ve status/disable semantiğini birbirinden ayırma görevidir.

---

## Read First

Önce aşağıdaki dokümanları oku ve kanonik proje standardı kabul et:

- `docs/architectureguide.md`
- `docs/backend-docs-index.md`
- `docs/nestjs-api-contract.md`
- `docs/nestjs-entities-and-relations.md`
- `docs/backend-module-patterns.md`
- `docs/rbac-module-guide.md`
- `docs/rbac-api-contract.md`
varsa

Ayrıca mevcut implementasyon raporları veya ilgili prompt sonuçları varsa özellikle şunları kontrol et:

- Category/Product status/public-admin ayrımı
- ShippingCarrier/PaymentMethod status ve delete/deactivate davranışı
- RBAC permission metadata

---

## Problem

Mevcut bazı admin delete endpointleri hard delete yerine otomatik deactivate yapıyor olabilir.

Örneğin şu davranış artık doğru kabul edilmeyecek:

```txt
DELETE /api/admin/categories/:categoryId
→ status = inactive
→ { success: true }
```

Bu davranış açık değildir. Client “sildiğini” düşünür ama kayıt veritabanında kalır.

Bundan sonra doğru ayrım şu olmalıdır:

```txt
DELETE /api/admin/categories/:categoryId
→ hard delete dener
→ ilişki yoksa siler
→ ilişki varsa 409 Conflict döner
```

Pasifleştirme ise açıkça update ile yapılmalıdır:

```txt
PATCH /api/admin/categories/:categoryId
body: { "status": "inactive" }
→ public listten çıkarır ama kayıt admin tarafta kalır
```

---

## Core Rule

Tüm manageable resource'larda şu semantik korunmalı:

```txt
DELETE
- gerçek silme denemesidir;
- otomatik disable/deactivate yapmaz;
- ilişkili kayıt varsa 409 Conflict döner;
- DB bütünlüğünü bozmaz;
- cascade ile beklenmedik child kayıtları silmemelidir.

PATCH status
- active/inactive/blocked gibi durum yönetimidir;
- public visibility, login eligibility veya operational availability gibi davranışları etkiler;
- silme anlamına gelmez.
```

---

## Scope

Bu güncelleme en az şu resource'ları kapsamalı:

### Catalog

- `Category`
- `Product`

### Checkout Reference

- `ShippingCarrier`
- `PaymentMethod`

### Identity

- `User`

### RBAC

- `Role`
- `Permission`

RBAC tarafında mevcut korumalar zaten varsa bozma. System role/permission silinememeli; role user'a atanmışsa veya permission role'a atanmışsa hard delete engellenmeli.

---

## Do Not Do

Şunları yapma:

- `DELETE` endpointinde otomatik `status = inactive` yapma.
- `DELETE` endpointinde otomatik `status = disabled` yapma.
- Cascade ile beklenmeyen ilişkili kayıtları silme.
- Public endpointleri admin endpointlerle karıştırma.
- Auth/RBAC guardlarını bozma.
- Tenant/company/store modeli ekleme.
- Yeni gereksiz soft-delete sistemi ekleme.
- TypeORM `softDelete` / `DeleteDateColumn` ekleme; bu görev status ile hard delete semantiğini ayırma görevidir.
- Yeni endpoint tasarlarken mevcut API contract ile çelişme.
- Order delete endpointi icat etme.

---

## Status Field Rule

`status` alanı delete yerine geçmez.

`status` alanı şu amaçlarla kullanılmalı:

```txt
Category/Product:
- active: public katalogda görünür
- inactive: public katalogda görünmez, admin panelde yönetilebilir

ShippingCarrier/PaymentMethod:
- active: checkout reference public listte görünür
- inactive: public listte görünmez, admin panelde yönetilebilir

User:
- active: login olabilir ve işlem yapabilir
- inactive/disabled/blocked: login olamaz veya işlem yapamaz

Role/Permission:
- active: authorization summary hesabına dahil olabilir
- inactive: authorization summary dışında bırakılabilir
```

Projede ortak `RecordStatus` enum'u varsa onu kullan.

Mevcut ortak enum örneği:

```txt
src/common/enums/record-status.enum.ts
```

Değerleri mevcut projeye göre koru:

```txt
active
inactive
```

User için mevcut ihtiyaç sadece `active/inactive` ile karşılanmıyorsa `blocked` gibi ek değerleri önermeden önce mevcut enum standardını ve etkilerini değerlendir. Gereksiz enum genişletmesi yapma.

---

## Category Delete Rule

`DELETE /api/admin/categories/:categoryId` artık hard delete denemelidir.

Beklenen davranış:

```txt
- Category yoksa 404
- Category child category içeriyorsa 409 Conflict
- Category product içeriyorsa 409 Conflict
- Başka domain ilişkisi varsa 409 Conflict
- Hiç ilişkisi yoksa hard delete başarılı
```

Conflict mesajları anlaşılır olmalı:

```json
{
  "statusCode": 409,
  "message": "Category cannot be deleted because it has related products or child categories",
  "error": "Conflict"
}
```

Pasifleştirme için mevcut update endpoint kullanılmalı:

```txt
PATCH /api/admin/categories/:categoryId
body: { "status": "inactive" }
```

Public davranış korunmalı:

```txt
GET /api/categories
GET /api/categories/tree
GET /api/categories/:slug
```

Bu public endpointler sadece `active` category kayıtlarını göstermeye devam etmeli.

---

## Product Delete Rule

`DELETE /api/admin/products/:productId` artık hard delete denemelidir.

Beklenen davranış:

```txt
- Product yoksa 404
- Product cart item ile ilişkiliyse 409 Conflict
- Product order item ile ilişkiliyse 409 Conflict
- Product review ile ilişkiliyse 409 Conflict
- Product relation içinde source/target olarak kullanılıyorsa 409 Conflict
- Product media gibi ilişkili kayıtlar varsa proje standardına göre güvenli davran; beklenmeyen cascade yapma
- Hiç ilişkisi yoksa hard delete başarılı
```

Conflict mesajı anlaşılır olmalı:

```json
{
  "statusCode": 409,
  "message": "Product cannot be deleted because it has related cart, order, review, media, or product relation records",
  "error": "Conflict"
}
```

Pasifleştirme için mevcut update endpoint kullanılmalı:

```txt
PATCH /api/admin/products/:productId
body: { "status": "inactive" }
```

Public davranış korunmalı:

```txt
GET /api/products
GET /api/products/:slug
```

Bu public endpointler sadece `active` product ve `active` category altındaki product kayıtlarını göstermeye devam etmeli.

---

## ShippingCarrier Delete Rule

`DELETE /api/admin/shipping-carriers/:shippingCarrierId` artık hard delete denemelidir.

Beklenen davranış:

```txt
- ShippingCarrier yoksa 404
- Order tarafından referanslanıyorsa 409 Conflict
- Hiç ilişkisi yoksa hard delete başarılı
```

Pasifleştirme için mevcut update endpoint kullanılmalı:

```txt
PATCH /api/admin/shipping-carriers/:shippingCarrierId
body: { "status": "inactive" }
```

Public davranış korunmalı:

```txt
GET /api/shipping-carriers
```

Bu public endpoint sadece `active` kayıtları göstermeye devam etmeli.

---

## PaymentMethod Delete Rule

`DELETE /api/admin/payment-methods/:paymentMethodId` artık hard delete denemelidir.

Beklenen davranış:

```txt
- PaymentMethod yoksa 404
- Order tarafından referanslanıyorsa 409 Conflict
- Hiç ilişkisi yoksa hard delete başarılı
```

Pasifleştirme için mevcut update endpoint kullanılmalı:

```txt
PATCH /api/admin/payment-methods/:paymentMethodId
body: { "status": "inactive" }
```

Public davranış korunmalı:

```txt
GET /api/payment-methods
```

Bu public endpoint sadece `active` kayıtları göstermeye devam etmeli.

---

## User Delete / Disable Rule

User için bu ayrım daha da önemlidir.

`DELETE /api/admin/users/:userId` endpointi varsa veya admin user management bu kapsamda mevcutsa şu davranışı uygula:

```txt
- User yoksa 404
- User order, review, cart, address, role assignment veya başka domain kaydıyla ilişkiliyse 409 Conflict
- User kullanılmamış/test niteliğinde ve ilişkisi yoksa hard delete başarılı olabilir
- Sistem otomatik inactive/disabled yapmamalı
```

Pasifleştirme için açık update kullanılmalı:

```txt
PATCH /api/admin/users/:userId
body: { "status": "inactive" }
```

Eğer User entity'de status yoksa:

1. Mevcut User entity ve auth flow'u incele.
2. Projeye uygun şekilde `status` alanı eklemeyi değerlendir.
3. Login akışında sadece active user login olabilsin.
4. Inactive/disabled user doğru credential girse bile token alamamalı.

Örnek login engeli:

```json
{
  "statusCode": 403,
  "message": "User account is not active",
  "error": "Forbidden"
}
```

Ancak geniş admin user CRUD modülü yoksa bu görevi gereksiz büyütme. Mevcut Users/Admin Users yapısı neyse ona göre minimal ve tutarlı güncelleme yap. Admin user management yoksa raporda açıkça belirt.

---

## Role / Permission Delete Rule

RBAC tarafında mevcut korumalar korunmalı.

Beklenen davranış:

```txt
System role silinemez.
System permission silinemez.
User'a atanmış role silinemez.
Role'a atanmış permission silinemez.
```

Bu durumlarda `409 Conflict` veya mevcut projede kullanılan anlamlı domain hatası dönmeli.

Mevcut kod `BadRequestException` kullanıyorsa bunu değiştirmeden önce proje error standardını değerlendir. Bu prompt'un ana hedefi catalog/checkout/user delete semantiğidir; çalışan RBAC davranışını gereksiz bozma.

---

## Relation Check Strategy

Silme işleminden önce ilişkili kayıtları service/repository seviyesinde kontrol et.

Tercih edilen yaklaşım:

```txt
1. Resource var mı kontrol et.
2. İlişkili kayıt sayısı var mı kontrol et.
3. Varsa 409 Conflict dön.
4. Yoksa hard delete yap.
```

Ayrıca veritabanı foreign key hatalarını da güvenli şekilde yakala.

PostgreSQL FK violation durumunda hata meaningful API response'a çevrilebiliyorsa `ConflictException` dön.

Beklenen genel mesaj:

```json
{
  "statusCode": 409,
  "message": "Resource cannot be deleted because it is referenced by related records",
  "error": "Conflict"
}
```

Raw database error mesajlarını kullanıcıya sızdırma.

---

## API Response Rule

Başarılı hard delete için mevcut proje standardını koru.

Eğer proje şu response'u kullanıyorsa devam et:

```json
{
  "success": true
}
```

Alternatif olarak 204 No Content kullanma kararını bu prompt kapsamında değiştirme. Mevcut API standardını bozma.

---

## Documentation Updates

Aşağıdaki dokümanları güncelle:

- `docs/architectureguide.md` veya kanonik architecture guide path'i
- `docs/nestjs-api-contract.md` veya kanonik API contract path'i
- `docs/nestjs-entities-and-relations.md` veya kanonik entity docs path'i
- `docs/backend-module-patterns.md` gerekiyorsa

Eğer projede kanonik dokümanlar `docs/basearchitecturedocs/` altında ise o pathleri kullan.

Dokümanlarda şu ayrım açıkça yazmalı:

```txt
DELETE hard delete denemesidir.
İlişki varsa 409 Conflict döner.
Status update disable/deactivate anlamına gelir.
DELETE otomatik deactivate yapmaz.
```

Category/Product için daha önce delete davranışı deactivate diye yazıldıysa bunu düzelt.

ShippingCarrier/PaymentMethod için daha önce delete davranışı deactivate diye yazıldıysa bunu düzelt.

User için status/login davranışı eklenirse entity/API dokümanını güncelle.

---

## Required Checks

Çalıştır:

```bash
pnpm exec prettier --write "src/**/*.ts" "docs/**/*.md"
pnpm build
pnpm lint
pnpm exec jest --runInBand
```

Eğer test ortamında canlı HTTP test mümkünse minimum şunları dene:

```txt
1. Yeni category oluştur.
2. İlişkisiz category DELETE → success.
3. Product bağlı category DELETE → 409.
4. Category PATCH status=inactive → success, public listte görünmez.

5. Yeni product oluştur.
6. İlişkisiz product DELETE → success.
7. Cart/review/order ilişkili product DELETE → 409.
8. Product PATCH status=inactive → success, public listte görünmez.

9. ShippingCarrier ilişkili değilse DELETE → success.
10. Order ilişkili ShippingCarrier DELETE → 409.
11. ShippingCarrier PATCH status=inactive → public listte görünmez.

12. PaymentMethod ilişkili değilse DELETE → success.
13. Order ilişkili PaymentMethod DELETE → 409.
14. PaymentMethod PATCH status=inactive → public listte görünmez.

15. Inactive user login olamasın.
16. İlişkili kayıtları olan user DELETE → 409.
```

Canlı HTTP test yapılamazsa raporda açıkça belirt.

---

## Report Back

Sonuçta bana şu bilgileri raporla:

- Güncellediğin dosyalar
- Değişen delete davranışları
- Hangi endpointler artık hard delete deniyor?
- Hangi durumlarda 409 Conflict dönüyor?
- Status update davranışı nasıl çalışıyor?
- User status/login davranışı eklendi mi?
- RBAC tarafında değişiklik yaptın mı?
- Dokümanlarda hangi bölümler güncellendi?
- Build/lint/test sonuçları
- Migration gerekiyor mu?
- Destructive migration yapıldı mı? Yapılmadıysa açıkça belirt.

---

## Final Acceptance Criteria

Bu görev başarılı sayılırsa şu cümleler doğru olmalı:

```txt
DELETE endpointleri otomatik deactivate yapmıyor.
İlişkisiz kayıtlar hard delete edilebiliyor.
İlişkili kayıtlar silinemiyor ve 409 Conflict dönüyor.
Status update public/admin görünürlük veya login davranışını yönetiyor.
Category/Product public endpointleri sadece active kayıtları gösteriyor.
ShippingCarrier/PaymentMethod public endpointleri sadece active kayıtları gösteriyor.
Inactive user login olamıyor.
Docs, src beklentileri birbiriyle çelişmiyor.
```
