export class SaleDto {
  id?: number;
  customerName?: string;
  customerPhone?: string;
  createdById: number | null;

  globalDiscount?: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;

  createdAt?: Date;
  updatedAt?: Date;

  sales: SaleItemDto[];
}

export class SaleItemDto {
  productId: number;
  productName?: string;
  material: 'gold' | 'silver' | 'copper';

  qty: number;
  price: number;
  discount?: number;
}
