export type SaleRow = {
  id: string;
  productId: number;
  productName: string;
  isFirst?: boolean;
  material?: "gold" | "silver" | "copper";
  quantity: number;
  price: number;
  discount: number;
};
