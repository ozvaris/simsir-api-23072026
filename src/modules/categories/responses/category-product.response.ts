// src/modules/categories/responses/category-product.response.ts

import { ProductListItem } from '../../../common/types/product-list-item.type';

export class CategoryProductResponse {
  id!: ProductListItem['id'];
  slug!: ProductListItem['slug'];
  title!: ProductListItem['title'];
  brandName!: ProductListItem['brandName'];
  categoryId!: ProductListItem['categoryId'];
  price!: ProductListItem['price'];
  discount!: ProductListItem['discount'];
  rating!: ProductListItem['rating'];
  imgUrl!: ProductListItem['imgUrl'];
  shortDescription!: ProductListItem['shortDescription'];
  longDescription!: ProductListItem['longDescription'];
  status!: ProductListItem['status'];
  inventory!: ProductListItem['inventory'];

  constructor(partial?: Partial<CategoryProductResponse>) {
    Object.assign(this, partial);
  }
}
