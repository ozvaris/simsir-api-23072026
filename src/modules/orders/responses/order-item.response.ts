export class OrderItemResponse {
  id!: string;
  productId!: string;
  quantity!: number;
  unitPrice!: number;
  discountAmount!: number;
  lineSubtotal!: number;
  lineTotal!: number;
  productTitleSnapshot!: string;
  productSlugSnapshot!: string;
  brandNameSnapshot!: string | null;
  productImageSnapshot!: string | null;
}
