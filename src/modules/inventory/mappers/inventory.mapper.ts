import { InventoryReservation } from '../entities/inventory-reservation.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';

export function mapInventorySummary(inventoryItem: InventoryItem | null) {
  if (!inventoryItem) {
    return {
      onHandQuantity: null,
      reservedQuantity: null,
      availableQuantity: null,
    };
  }

  return {
    onHandQuantity: inventoryItem.onHandQuantity,
    reservedQuantity: inventoryItem.reservedQuantity,
    availableQuantity:
      inventoryItem.onHandQuantity - inventoryItem.reservedQuantity,
  };
}

export function mapInventoryTransaction(inventoryTransaction: InventoryTransaction) {
  return {
    id: inventoryTransaction.id,
    inventoryItemId: inventoryTransaction.inventoryItemId,
    reservationId: inventoryTransaction.reservationId,
    orderId: inventoryTransaction.orderId,
    orderItemId: inventoryTransaction.orderItemId,
    type: inventoryTransaction.type,
    quantity: inventoryTransaction.quantity,
    note: inventoryTransaction.note,
    createdAt: inventoryTransaction.createdAt,
  };
}

export function mapInventoryReservation(inventoryReservation: InventoryReservation) {
  return {
    id: inventoryReservation.id,
    orderId: inventoryReservation.orderId,
    orderItemId: inventoryReservation.orderItemId,
    quantity: inventoryReservation.quantity,
    status: inventoryReservation.status,
    expiresAt: inventoryReservation.expiresAt,
    note: inventoryReservation.note,
    createdAt: inventoryReservation.createdAt,
  };
}
