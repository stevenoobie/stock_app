export type Sale = {
  id?: number;
  customerName?: string;
  customerPhone?: string;
  createdById: number | null;

  globalDiscount?: number; // %
  totalBeforeDiscount: number; // sum of all row subtotals before global discount
  totalAfterDiscount: number; // final amount after global discount

  createdAt?: Date;
  updatedAt?: Date;

  sales: SaleItem[];
};

export type SaleItem = {
  productId: number;
  productName?: string;
  material: "gold" | "silver" | "copper";

  qty: number; // row.quantity
  price: number; // row.price
  discount?: number; // %
};
