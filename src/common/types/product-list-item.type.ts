export type ProductInventorySummary = {
  isTracked: boolean;
  onHandQuantity: number | null;
  reservedQuantity: number | null;
  availableQuantity: number | null;
};

export type ProductListItem = {
  id: string;
  slug: string;
  title: string;
  brandName: string | null;
  categoryId: string;
  price: number;
  discount: number;
  rating: number;
  imgUrl: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  status: string;
  inventory: ProductInventorySummary;
};
