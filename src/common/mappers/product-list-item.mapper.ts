import { Product } from '../../modules/products/entities/product.entity';
import { ProductListItem } from '../types/product-list-item.type';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function mapInventorySummary(product: Product): ProductListItem['inventory'] {
  if (!product.isTrackedInventory) {
    return {
      onHandQuantity: null,
      reservedQuantity: null,
      availableQuantity: null,
    };
  }

  const inventoryItem = product.inventoryItems?.[0] ?? null;

  if (!inventoryItem) {
    return {
      onHandQuantity: null,
      reservedQuantity: null,
      availableQuantity: null,
    };
  }

  const onHandQuantity = inventoryItem.onHandQuantity;
  const reservedQuantity = inventoryItem.reservedQuantity;

  return {
    onHandQuantity,
    reservedQuantity,
    availableQuantity: onHandQuantity - reservedQuantity,
  };
}

export function mapProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brandName: product.brandName,
    categoryId: product.categoryId,
    isTrackedInventory: product.isTrackedInventory,
    price: toNumber(product.price),
    discount: toNumber(product.discount),
    tax: toNumber(product.tax),
    rating: toNumber(product.rating),
    imgUrl: product.imgUrl,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    status: product.status,
    inventory: mapInventorySummary(product),
  };
}
