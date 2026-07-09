// src/modules/cart/responses/cart-item.response.ts

export class CartItemProductResponse {
  id!: string;
  slug!: string;
  title!: string;
  brandName!: string | null;
  imgUrl!: string | null;
  tax!: number;
}

export class CartItemResponse {
  id!: string;
  cartId!: string;
  productId!: string;
  quantity!: number;
  unitPrice!: number;
  discount!: number;
  finalUnitPrice!: number;
  lineTotal!: number;
  product!: CartItemProductResponse;
}
