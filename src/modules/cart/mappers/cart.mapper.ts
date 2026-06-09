// src/modules/cart/mappers/cart.mapper.ts

import { CartItem } from '../entities/cart-item.entity';
import { Cart } from '../entities/cart.entity';
import { CartItemResponse } from '../responses/cart-item.response';
import { CartResponse } from '../responses/cart.response';
import { CartSummaryResponse } from '../responses/cart-summary.response';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateLine(item: CartItem) {
  const unitPrice = toNumber(item.product?.price);
  const discount = toNumber(item.product?.discount);
  const finalUnitPrice = roundMoney(unitPrice * (1 - discount / 100));
  const lineTotal = roundMoney(finalUnitPrice * item.quantity);
  const lineSubtotal = roundMoney(unitPrice * item.quantity);

  return {
    unitPrice,
    discount,
    finalUnitPrice,
    lineTotal,
    lineSubtotal,
  };
}

export function toCartItemResponse(item: CartItem): CartItemResponse {
  const line = calculateLine(item);

  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: line.unitPrice,
    discount: line.discount,
    finalUnitPrice: line.finalUnitPrice,
    lineTotal: line.lineTotal,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      title: item.product.title,
      brandName: item.product.brandName,
      imgUrl: item.product.imgUrl,
    },
  };
}

export function toCartSummaryResponse(items: CartItem[]): CartSummaryResponse {
  const totals = items.reduce(
    (summary, item) => {
      const line = calculateLine(item);

      summary.totalQuantity += item.quantity;
      summary.subtotal += line.lineSubtotal;
      summary.total += line.lineTotal;

      return summary;
    },
    {
      totalQuantity: 0,
      subtotal: 0,
      total: 0,
    },
  );

  return {
    itemCount: items.length,
    totalQuantity: totals.totalQuantity,
    subtotal: roundMoney(totals.subtotal),
    discountTotal: roundMoney(totals.subtotal - totals.total),
    total: roundMoney(totals.total),
  };
}

export function toCartResponse(cart: Cart): CartResponse {
  const items = (cart.items ?? []).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status,
    items: items.map(toCartItemResponse),
    summary: toCartSummaryResponse(items),
  };
}
