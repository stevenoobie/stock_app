export type Sale = {
  id?: number;
  customerName?: string;
  customerPhone?: string;
  createdById: number | null;

  globalDiscount?: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;

  createdAt?: Date;
  updatedAt?: Date;

  sales: SaleItem[];
};

export type SaleItem = {
  productId: number;
  productName?: string;
  material: "gold" | "silver" | "copper";

  qty: number;
  price: number;
  discount?: number;
};
