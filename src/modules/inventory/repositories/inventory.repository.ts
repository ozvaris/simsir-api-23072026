import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryReservation } from '../entities/inventory-reservation.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepository: Repository<InventoryItem>,

    @InjectRepository(InventoryReservation)
    private readonly inventoryReservationRepository: Repository<InventoryReservation>,

    @InjectRepository(InventoryTransaction)
    private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
  ) {}

  findProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId },
    });
  }

  findInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    return this.inventoryItemRepository.findOne({
      where: { productId },
    });
  }

  createInventoryItem(data: Partial<InventoryItem>): InventoryItem {
    return this.inventoryItemRepository.create(data);
  }

  saveInventoryItem(inventoryItem: InventoryItem): Promise<InventoryItem> {
    return this.inventoryItemRepository.save(inventoryItem);
  }

  createInventoryTransaction(
    data: Partial<InventoryTransaction>,
  ): InventoryTransaction {
    return this.inventoryTransactionRepository.create(data);
  }

  saveInventoryTransaction(
    inventoryTransaction: InventoryTransaction,
  ): Promise<InventoryTransaction> {
    return this.inventoryTransactionRepository.save(inventoryTransaction);
  }

  findTransactionsByProductId(productId: string): Promise<InventoryTransaction[]> {
    return this.inventoryTransactionRepository.find({
      where: {
        inventoryItem: {
          productId,
        },
      },
      relations: {
        inventoryItem: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findReservationsByProductId(productId: string): Promise<InventoryReservation[]> {
    return this.inventoryReservationRepository.find({
      where: {
        inventoryItem: {
          productId,
        },
      },
      relations: {
        inventoryItem: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
