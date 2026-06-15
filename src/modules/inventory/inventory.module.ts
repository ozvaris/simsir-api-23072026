import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { InventoryAdminController } from './inventory-admin.controller';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryReservation } from './entities/inventory-reservation.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { InventoryRepository } from './repositories/inventory.repository';
import { DemoInventorySeedService } from './seed/demo-inventory-seed.service';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      InventoryItem,
      InventoryReservation,
      InventoryTransaction,
    ]),
  ],
  controllers: [InventoryAdminController],
  providers: [InventoryService, InventoryRepository, DemoInventorySeedService],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
