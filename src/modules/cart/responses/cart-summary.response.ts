// src/modules/cart/responses/cart-summary.response.ts

export class CartSummaryResponse {
  itemCount!: number;
  totalQuantity!: number;
  subtotal!: number;
  discountTotal!: number;
  taxIncluded!: number;
  total!: number;
}
