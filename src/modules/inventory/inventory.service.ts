import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { SetProductInventoryDto } from './dto/set-product-inventory.dto';
import {
  mapInventoryReservation,
  mapInventorySummary,
  mapInventoryTransaction,
} from './mappers/inventory.mapper';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryTransactionType } from './enums/inventory-transaction-type.enum';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async getInventory(productId: string) {
    await this.ensureProductExists(productId);

    const inventoryItem =
      await this.inventoryRepository.findInventoryByProductId(productId);

    return {
      productId,
      inventory: mapInventorySummary(inventoryItem),
    };
  }

  async setInventory(productId: string, dto: SetProductInventoryDto) {
    await this.ensureProductExists(productId);

    const existingInventory =
      await this.inventoryRepository.findInventoryByProductId(productId);

    const note = dto.note?.trim() || null;

    const savedInventory = await this.dataSource.transaction(async (manager) => {
      const inventoryRepository = manager.getRepository(InventoryItem);
      const inventoryTransactionRepository =
        manager.getRepository(InventoryTransaction);

      if (!existingInventory) {
        const createdInventory = await inventoryRepository.save(
          inventoryRepository.create({
            productId,
            onHandQuantity: dto.onHandQuantity,
            reservedQuantity: 0,
          }),
        );

        if (dto.onHandQuantity > 0) {
          await inventoryTransactionRepository.save(
            inventoryTransactionRepository.create({
              inventoryItemId: createdInventory.id,
              reservationId: null,
              orderId: null,
              orderItemId: null,
              type: InventoryTransactionType.MANUAL_ADD,
              quantity: dto.onHandQuantity,
              note: note ?? 'Initial inventory setup',
            }),
          );
        }

        return createdInventory;
      }

      if (dto.onHandQuantity < existingInventory.reservedQuantity) {
        throw new ConflictException(
          'On-hand quantity cannot be lower than reserved quantity',
        );
      }

      const delta = dto.onHandQuantity - existingInventory.onHandQuantity;

      existingInventory.onHandQuantity = dto.onHandQuantity;

      const updatedInventory = await inventoryRepository.save(existingInventory);

      if (delta !== 0) {
        await inventoryTransactionRepository.save(
          inventoryTransactionRepository.create({
            inventoryItemId: updatedInventory.id,
            reservationId: null,
            orderId: null,
            orderItemId: null,
            type:
              delta > 0
                ? InventoryTransactionType.MANUAL_ADD
                : InventoryTransactionType.MANUAL_REMOVE,
            quantity: Math.abs(delta),
            note: note ?? 'Manual inventory set',
          }),
        );
      }

      return updatedInventory;
    });

    return {
      productId,
      inventory: mapInventorySummary(savedInventory),
    };
  }

  async createAdjustment(productId: string, dto: CreateInventoryAdjustmentDto) {
    await this.ensureProductExists(productId);
    this.ensureAllowedManualAdjustment(dto.type);

    const inventoryItem =
      await this.inventoryRepository.findInventoryByProductId(productId);

    if (!inventoryItem) {
      throw new NotFoundException('Inventory not found for product');
    }

    const nextOnHandQuantity =
      dto.type === InventoryTransactionType.MANUAL_ADD
        ? inventoryItem.onHandQuantity + dto.quantity
        : inventoryItem.onHandQuantity - dto.quantity;

    if (nextOnHandQuantity < inventoryItem.reservedQuantity) {
      throw new ConflictException(
        'Adjustment would reduce on-hand quantity below reserved quantity',
      );
    }

    const note = dto.note?.trim() || null;

    const savedInventory = await this.dataSource.transaction(async (manager) => {
      const inventoryRepository = manager.getRepository(InventoryItem);
      const inventoryTransactionRepository =
        manager.getRepository(InventoryTransaction);

      inventoryItem.onHandQuantity = nextOnHandQuantity;
      const updatedInventory = await inventoryRepository.save(inventoryItem);

      await inventoryTransactionRepository.save(
        inventoryTransactionRepository.create({
          inventoryItemId: updatedInventory.id,
          reservationId: null,
          orderId: null,
          orderItemId: null,
          type: dto.type,
          quantity: dto.quantity,
          note,
        }),
      );

      return updatedInventory;
    });

    return {
      success: true as const,
      productId,
      inventory: mapInventorySummary(savedInventory),
    };
  }

  async listTransactions(productId: string) {
    await this.ensureProductExists(productId);

    const transactions =
      await this.inventoryRepository.findTransactionsByProductId(productId);

    return {
      items: transactions.map(mapInventoryTransaction),
    };
  }

  async listReservations(productId: string) {
    await this.ensureProductExists(productId);

    const reservations =
      await this.inventoryRepository.findReservationsByProductId(productId);

    return {
      items: reservations.map(mapInventoryReservation),
    };
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.inventoryRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private ensureAllowedManualAdjustment(type: InventoryTransactionType): void {
    if (
      type !== InventoryTransactionType.MANUAL_ADD &&
      type !== InventoryTransactionType.MANUAL_REMOVE
    ) {
      throw new ConflictException(
        'Only MANUAL_ADD and MANUAL_REMOVE are allowed for manual adjustments',
      );
    }
  }
}
