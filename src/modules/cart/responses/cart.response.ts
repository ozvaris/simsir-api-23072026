// src/modules/cart/responses/cart.response.ts

import { CartStatus } from '../enums/cart-status.enum';
import { CartItemResponse } from './cart-item.response';
import { CartSummaryResponse } from './cart-summary.response';

export class CartResponse {
  id!: string;
  userId!: string;
  status!: CartStatus;
  items!: CartItemResponse[];
  summary!: CartSummaryResponse;
}
