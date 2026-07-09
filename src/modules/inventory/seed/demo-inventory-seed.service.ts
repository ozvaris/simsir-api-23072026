import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Product } from '../../products/entities/product.entity';
import { InventoryItem } from '../entities/inventory-item.entity';

export const DEMO_INVENTORY_SEEDS = [
  {
    productSlug: 'nikecourt-zoom-vapor-cage',
    onHandQuantity: 24,
    reservedQuantity: 0,
  },
  {
    productSlug: 'iphone-13-pro-max',
    onHandQuantity: 12,
    reservedQuantity: 0,
  },
  {
    productSlug: 'tarz-t3',
    onHandQuantity: 50,
    reservedQuantity: 0,
  },
] as const;

@Injectable()
export class DemoInventorySeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoInventorySeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepository: Repository<InventoryItem>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo inventory seed.');
      return;
    }

    await this.seedInventory();
  }

  private async seedInventory(): Promise<void> {
    for (const seed of DEMO_INVENTORY_SEEDS) {
      const product = await this.productRepository.findOne({
        where: { slug: seed.productSlug },
      });

      if (!product) {
        this.logger.warn(
          `Skipping demo inventory for ${seed.productSlug}; product was not found.`,
        );
        continue;
      }

      const existingInventory = await this.inventoryItemRepository.findOne({
        where: { productId: product.id },
      });

      if (existingInventory) {
        continue;
      }

      await this.inventoryItemRepository.save(
        this.inventoryItemRepository.create({
          productId: product.id,
          onHandQuantity: seed.onHandQuantity,
          reservedQuantity: seed.reservedQuantity,
          createdByName: 'Demo Seed',
          updatedByName: 'Demo Seed',
        }),
      );
    }
  }
}
